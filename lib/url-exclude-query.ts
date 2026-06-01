import type { Prisma } from "@prisma/client";

const MIN_EXCLUDE_KW_LEN = 2;

/** Deduplicate and drop keywords shorter than the minimum (exclude-only; not used by search). */
export function normalizeExcludeKeywords(terms: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of terms) {
    const trimmed = t.trim();
    if (trimmed.length < MIN_EXCLUDE_KW_LEN) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

export function isUrlExcludeActive(
  subdomainIds: readonly string[],
  keywords: readonly string[],
): boolean {
  return urlExcludeWhere(subdomainIds, keywords) !== undefined;
}

/**
 * Prisma filter for hiding subdomains and URL keyword patterns.
 * Only pass subdomain IDs already validated for the current target.
 */
export function urlExcludeWhere(
  subdomainIds: readonly string[],
  keywords: readonly string[],
): Prisma.DiscoveredUrlWhereInput | undefined {
  const kws = normalizeExcludeKeywords(keywords);
  const subs = [...new Set(subdomainIds.filter(Boolean))];

  const clauses: Prisma.DiscoveredUrlWhereInput[] = [];

  if (subs.length > 0) {
    clauses.push({ NOT: { subdomainId: { in: subs } } });
  }
  for (const kw of kws) {
    clauses.push({ NOT: { urlText: { contains: kw, mode: "insensitive" } } });
  }

  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { AND: clauses };
}

export function describeUrlExclude(
  hiddenSubdomains: readonly { id: string; hostnameNormalized: string }[],
  keywords: readonly string[],
): string | null {
  const kws = normalizeExcludeKeywords(keywords);
  const parts: string[] = [];
  if (hiddenSubdomains.length > 0) {
    const hosts = hiddenSubdomains.map((s) => s.hostnameNormalized);
    const label =
      hosts.length <= 2 ? hosts.join(", ") : `${hosts.length} subdomains`;
    parts.push(`hosts: ${label}`);
  }
  if (kws.length > 0) {
    const label =
      kws.length <= 3
        ? kws.map((k) => `"${k}"`).join(", ")
        : `${kws.length} URL patterns`;
    parts.push(`URL contains: ${label}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
