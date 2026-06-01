import { parse as parseTld } from "tldts";

export type InputType = "domain" | "subdomain";

/**
 * Detect whether user input is a root/registrable domain or a subdomain.
 * Uses PSL (tldts) to compare hostname vs registrable domain (eTLD+1).
 *
 * Examples:
 *   "lenovo.com"           → "domain"
 *   "pcsupport.lenovo.com" → "subdomain"
 *   "co.uk"                → "domain" (eTLD itself, edge case)
 */
export function detectInputType(input: string): InputType {
  const normalized = input.trim().toLowerCase().replace(/\.$/, "");
  if (!normalized) return "domain";

  const parsed = parseTld(normalized);
  const registrable = parsed.domain; // e.g. "lenovo.com"

  if (!registrable) return "domain"; // can't determine — treat as domain
  if (normalized === registrable) return "domain";
  return "subdomain";
}

/**
 * Extract the registrable domain (eTLD+1) from any hostname.
 * "pcsupport.lenovo.com" → "lenovo.com"
 * "lenovo.com"           → "lenovo.com"
 */
export function registrableDomain(input: string): string | null {
  const normalized = input.trim().toLowerCase().replace(/\.$/, "");
  const parsed = parseTld(normalized);
  return parsed.domain ?? null;
}
