import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.extensionCategory.findMany({
    orderBy: [{ displayName: "asc" }, { slug: "asc" }],
    include: { suffixRules: true },
  });
  return NextResponse.json({ categories });
}
