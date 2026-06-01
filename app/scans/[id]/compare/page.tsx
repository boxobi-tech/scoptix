import { redirect } from "next/navigation";

function sp(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

export default async function ScanCompareRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const rawSp = (await searchParams) ?? {};
  const q = new URLSearchParams();
  q.set("tab", "compare");
  const legacyTab = sp(rawSp.tab);
  if (legacyTab === "subdomains" || legacyTab === "urls" || legacyTab === "findings") {
    q.set("cmpTab", legacyTab);
  }
  const compare = sp(rawSp.compare);
  if (compare) q.set("compare", compare);
  const perPage = sp(rawSp.perPage);
  if (perPage) q.set("perPage", perPage);
  redirect(`/scans/${id}/observed?${q.toString()}`);
}
