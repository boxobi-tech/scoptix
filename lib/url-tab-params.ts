/** URL query helpers for the target URLs tab (search `q` and exclude params are separate). */

export type UrlTabPreserve = {
  cat: string;
  perPage: number;
  q?: string;
  hideSub?: readonly string[];
  hideKw?: readonly string[];
};

export function parseCsvParam(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const raw = Array.isArray(v) ? v.join(",") : v;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function encodeCsvParam(values: readonly string[]): string | undefined {
  if (values.length === 0) return undefined;
  return values.join(",");
}

export function buildTargetUrlsTabHref(
  targetId: string,
  params: UrlTabPreserve & { page?: number },
): string {
  const p = new URLSearchParams();
  p.set("tab", "urls");
  p.set("cat", params.cat);
  p.set("perPage", String(params.perPage));
  if (params.q?.trim()) p.set("q", params.q.trim());
  if (params.page != null && params.page > 1) p.set("page", String(params.page));
  const hideSub = encodeCsvParam(params.hideSub ?? []);
  if (hideSub) p.set("hideSub", hideSub);
  const hideKw = encodeCsvParam(params.hideKw ?? []);
  if (hideKw) p.set("hideKw", hideKw);
  return `/targets/${targetId}?${p.toString()}`;
}

export function urlTabPreserveToFixedParams(preserve: UrlTabPreserve): Record<string, string> {
  const out: Record<string, string> = {
    tab: "urls",
    cat: preserve.cat,
    perPage: String(preserve.perPage),
  };
  if (preserve.q?.trim()) out.q = preserve.q.trim();
  const hideSub = encodeCsvParam(preserve.hideSub ?? []);
  if (hideSub) out.hideSub = hideSub;
  const hideKw = encodeCsvParam(preserve.hideKw ?? []);
  if (hideKw) out.hideKw = hideKw;
  return out;
}
