export type FindingsFilterParams = {
  perPage: number;
  type?: string;
  source?: string;
  engine?: string;
  target?: string;
  scan?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
};

export function buildFindingsHref(params: FindingsFilterParams): string {
  const p = new URLSearchParams();
  p.set("perPage", String(params.perPage));
  if (params.type) p.set("type", params.type);
  if (params.source) p.set("source", params.source);
  if (params.engine) p.set("engine", params.engine);
  if (params.target) p.set("target", params.target);
  if (params.scan) p.set("scan", params.scan);
  if (params.from) p.set("from", params.from);
  if (params.to) p.set("to", params.to);
  if (params.q?.trim()) p.set("q", params.q.trim());
  if (params.page != null && params.page > 1) p.set("page", String(params.page));
  const qs = p.toString();
  return `/findings${qs ? `?${qs}` : ""}`;
}
