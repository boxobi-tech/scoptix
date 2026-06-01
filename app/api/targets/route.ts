import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { upsertTargetDomain } from "@/lib/targets";

const bodySchema = z.object({
  domain: z.string().min(3).max(255),
  notes: z.string().max(2000).optional(),
});

export async function GET() {
  const rows = await prisma.targetDomain.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      _count: { select: { scanJobs: true } },
    },
  });
  return NextResponse.json({ targets: rows });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const t = await upsertTargetDomain(prisma, parsed.data.domain);
  if (parsed.data.notes) {
    await prisma.targetDomain.update({ where: { id: t.id }, data: { notes: parsed.data.notes } });
  }
  return NextResponse.json({ target: t });
}
