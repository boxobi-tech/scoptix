import type { PrismaClient } from "@prisma/client";
import { normalizeDomainInput } from "@/lib/extract-hosts";

export async function upsertTargetDomain(prisma: PrismaClient, domainRaw: string) {
  const domainNormalized = normalizeDomainInput(domainRaw);
  return prisma.targetDomain.upsert({
    where: { domainNormalized },
    create: { domain: domainRaw.trim(), domainNormalized },
    update: { updatedAt: new Date() },
  });
}
