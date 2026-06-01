import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const rule = await prisma.extensionSuffixRule.findUnique({ where: { id: n } });
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    await prisma.extensionSuffixRule.delete({ where: { id: n } });

    // Reset existing URLs to uncategorized
    await prisma.discoveredUrl.updateMany({
      where: { pathnameExtension: rule.suffix },
      data: { extensionCategoryId: null },
    });
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2025") {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
