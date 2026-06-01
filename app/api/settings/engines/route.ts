import { NextResponse } from "next/server";
import { EngineProvider } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseActiveEnginesFromSetting } from "@/lib/active-engines";

const updateSchema = z.object({
  activeEngines: z.array(z.nativeEnum(EngineProvider)).min(1),
});

export async function GET() {
  const row = await prisma.appSetting.findUnique({
    where: { key: "active_engines" },
  });
  
  const activeEngines = parseActiveEnginesFromSetting(row?.value);

  return NextResponse.json({ activeEngines });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body. At least one engine must be active." }, { status: 400 });
  }

  await prisma.appSetting.upsert({
    where: { key: "active_engines" },
    update: { value: { engines: parsed.data.activeEngines } },
    create: { key: "active_engines", value: { engines: parsed.data.activeEngines } },
  });

  return NextResponse.json({ activeEngines: parsed.data.activeEngines });
}
