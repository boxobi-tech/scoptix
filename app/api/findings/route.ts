import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(200, Math.max(1, Number(searchParams.get("take") ?? "50")));

  const rows = await prisma.analysisFinding.findMany({
    take,
    orderBy: { createdAt: "desc" },
    include: {
      discoveredUrl: { select: { urlText: true, id: true } },
    },
  });

  return NextResponse.json({ findings: rows });
}
