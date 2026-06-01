import { EngineProvider } from "@prisma/client";
import { z } from "zod";

const activeEnginesValueSchema = z.object({
  engines: z.array(z.nativeEnum(EngineProvider)).min(1),
});

export const DEFAULT_ACTIVE_ENGINES: EngineProvider[] = [EngineProvider.VIRUSTOTAL];

export function parseActiveEnginesFromSetting(value: unknown): EngineProvider[] {
  const parsed = activeEnginesValueSchema.safeParse(value);
  return parsed.success ? parsed.data.engines : DEFAULT_ACTIVE_ENGINES;
}
