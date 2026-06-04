import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function resolveSummaryFromSightings(
  sightings: { lastResolvedAt: Date }[],
  fallbackLastResolved: Date,
) {
  const times = sightings
    .map((s) => s.lastResolvedAt.getTime())
    .filter((t) => Number.isFinite(t));

  if (times.length === 0) {
    return {
      firstResolvedAt: null as Date | null,
      lastResolvedAt: fallbackLastResolved,
      observedHostnameCount: 0,
    };
  }

  return {
    firstResolvedAt: new Date(Math.min(...times)),
    lastResolvedAt: new Date(Math.max(...times)),
    observedHostnameCount: sightings.length,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ipResolution = await prisma.ipResolution.findUnique({
      where: { id },
      select: {
        ipAddress: true,
        latestResolvedAt: true,
        hostnameCount: true,
        sightings: {
          select: {
            hostnameNormalized: true,
            lastResolvedAt: true,
          },
          orderBy: { lastResolvedAt: "desc" },
        },
      },
    });

    if (!ipResolution) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const summary = resolveSummaryFromSightings(
      ipResolution.sightings,
      ipResolution.latestResolvedAt,
    );
    const observedHostnameCount = Math.max(
      summary.observedHostnameCount,
      ipResolution.hostnameCount,
    );

    return NextResponse.json({
      ipAddress: ipResolution.ipAddress,
      summary: {
        firstResolvedAt: summary.firstResolvedAt?.toISOString() ?? null,
        lastResolvedAt: summary.lastResolvedAt.toISOString(),
        observedHostnameCount,
      },
      sightings: ipResolution.sightings.map((s) => ({
        hostnameNormalized: s.hostnameNormalized,
        lastResolvedAt: s.lastResolvedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching IP sightings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
