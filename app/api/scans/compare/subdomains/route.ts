import { NextResponse } from "next/server";
import { compareByKey, loadCompareScans, normalizeCompareTake } from "@/lib/scan-compare";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const left = searchParams.get("left")?.trim();
  const right = searchParams.get("right")?.trim();
  const take = normalizeCompareTake(searchParams.get("take"));

  if (!left || !right) {
    return NextResponse.json(
      { error: "left and right scan ids are required" },
      { status: 400 },
    );
  }

  const {
    leftScan,
    rightScan,
    leftAvailability,
    rightAvailability,
  } = await loadCompareScans(left, right);

  if (!leftScan || !rightScan || !leftAvailability || !rightAvailability) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  if (leftScan.targetDomainId !== rightScan.targetDomainId) {
    return NextResponse.json(
      { error: "Scan comparison requires scans from the same target" },
      { status: 400 },
    );
  }

  const comparable =
    leftAvailability.subdomains === "ready" &&
    rightAvailability.subdomains === "ready";

  if (!comparable) {
    return NextResponse.json({
      scans: {
        left: {
          id: leftScan.id,
          status: leftScan.status,
          targetDomainId: leftScan.targetDomainId,
          targetDomain: leftScan.targetDomain,
          createdAt: leftScan.createdAt,
          completedAt: leftScan.completedAt,
        },
        right: {
          id: rightScan.id,
          status: rightScan.status,
          targetDomainId: rightScan.targetDomainId,
          targetDomain: rightScan.targetDomain,
          createdAt: rightScan.createdAt,
          completedAt: rightScan.completedAt,
        },
      },
      availability: {
        left: leftAvailability,
        right: rightAvailability,
      },
      comparable: false,
      reason: "legacy_unavailable",
      summary: null,
      added: [],
      removed: [],
      unchanged: [],
    });
  }

  const [leftRows, rightRows] = await Promise.all([
    prisma.scanObservedSubdomain.findMany({
      where: { scanJobId: left },
      orderBy: { hostnameNormalized: "asc" },
    }),
    prisma.scanObservedSubdomain.findMany({
      where: { scanJobId: right },
      orderBy: { hostnameNormalized: "asc" },
    }),
  ]);

  const compared = compareByKey(
    leftRows,
    rightRows,
    (row) => row.hostnameNormalized,
  );

  return NextResponse.json({
    scans: {
      left: {
        id: leftScan.id,
        status: leftScan.status,
        targetDomainId: leftScan.targetDomainId,
        targetDomain: leftScan.targetDomain,
        createdAt: leftScan.createdAt,
        completedAt: leftScan.completedAt,
      },
      right: {
        id: rightScan.id,
        status: rightScan.status,
        targetDomainId: rightScan.targetDomainId,
        targetDomain: rightScan.targetDomain,
        createdAt: rightScan.createdAt,
        completedAt: rightScan.completedAt,
      },
    },
    availability: {
      left: leftAvailability,
      right: rightAvailability,
    },
    comparable: true,
    summary: {
      added: compared.added.length,
      removed: compared.removed.length,
      unchanged: compared.unchanged.length,
    },
    added: compared.added.slice(0, take),
    removed: compared.removed.slice(0, take),
    unchanged: compared.unchanged.slice(0, take),
  });
}
