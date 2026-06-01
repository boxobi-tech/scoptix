import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/engines
 * Returns which engines are active (have at least 1 enabled API key).
 */
export async function GET() {
  const groups = await prisma.apiKey.groupBy({
    by: ["provider"],
    where: { isDisabled: false },
    _count: { _all: true },
  });

  const engines = groups.map((g) => ({
    provider: g.provider,
    activeKeys: g._count._all,
  }));

  return NextResponse.json({ engines });
}
