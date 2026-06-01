import { NextResponse } from "next/server";
import {
  getObservedAvailability,
  getObservedScanSummary,
  normalizeSkip,
  normalizeTake,
} from "@/lib/scan-observed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const scan = await getObservedScanSummary(id);

  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const availability = getObservedAvailability(scan);
  if (availability.urls !== "ready") {
    return NextResponse.json({
      scan: {
        id: scan.id,
        status: scan.status,
        targetDomainId: scan.targetDomainId,
        targetDomain: scan.targetDomain,
        observedVersion: scan.observedVersion,
      },
      availability,
      pagination: {
        take: 0,
        skip: 0,
        total: 0,
      },
      urls: [],
    });
  }

  const { searchParams } = new URL(req.url);
  const take = normalizeTake(searchParams.get("take"));
  const skip = normalizeSkip(searchParams.get("skip"));
  const q = searchParams.get("q")?.trim() || undefined;
  const categoryIdRaw = searchParams.get("extensionCategoryId");
  const categoryId =
    categoryIdRaw != null && categoryIdRaw !== ""
      ? Number(categoryIdRaw)
      : undefined;

  const where = {
    scanJobId: id,
    ...(q
      ? {
          urlText: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(Number.isInteger(categoryId)
      ? { extensionCategoryId: categoryId }
      : {}),
  };

  const [urls, total] = await Promise.all([
    prisma.scanObservedUrl.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        extensionCategory: {
          select: {
            id: true,
            slug: true,
            displayName: true,
          },
        },
      },
    }),
    prisma.scanObservedUrl.count({ where }),
  ]);

  return NextResponse.json({
    scan: {
      id: scan.id,
      status: scan.status,
      targetDomainId: scan.targetDomainId,
      targetDomain: scan.targetDomain,
      observedVersion: scan.observedVersion,
    },
    availability,
    pagination: {
      take,
      skip,
      total,
    },
    urls,
  });
}
