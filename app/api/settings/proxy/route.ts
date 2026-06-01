import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  url: z.preprocess((v) => (v === "" ? null : v), z.union([z.string().url(), z.null()])),
});

export async function GET() {
  const row = await prisma.appSetting.findUnique({ where: { key: "global_proxy_url" } });
  const value = (row?.value as { url?: string | null } | undefined) ?? { url: null };
  return NextResponse.json({ globalProxyUrl: value.url ?? null });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  await prisma.appSetting.upsert({
    where: { key: "global_proxy_url" },
    create: { key: "global_proxy_url", value: { url: parsed.data.url } },
    update: { value: { url: parsed.data.url } },
  });
  return NextResponse.json({ ok: true });
}
