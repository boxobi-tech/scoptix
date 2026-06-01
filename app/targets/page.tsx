import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/top-bar";

export const dynamic = "force-dynamic";

export default async function TargetsPage() {
  const targets = await prisma.targetDomain.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { _count: { select: { scanJobs: true } } },
  });

  return (
    <>
      <TopBar breadcrumb="/ targets" />
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <PageHeader eyebrow="Collection" title="Targets" />

        <div className="mt-8">
          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="border-b border-line bg-[var(--table-header-bg)] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-cream">Target inventory</div>
                  <div className="mt-1 text-[12px] text-muted">
                    {targets.length.toLocaleString()} target{targets.length !== 1 ? "s" : ""} · Click to view results
                  </div>
                </div>
                <Link
                  href="/scans"
                  className="shadow-clay rounded-xl bg-gradient-to-r from-accent to-accent-dim px-4 py-2.5 text-[12px] font-semibold text-void"
                >
                  New Scan
                </Link>
              </div>
            </div>

            {/* ── Header row ── */}
            <div className="hidden border-b border-line bg-[var(--table-header-bg)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted md:grid md:grid-cols-12 md:gap-3">
              <div className="col-span-4">Domain</div>
              <div className="col-span-2 text-center">Subdomains</div>
              <div className="col-span-2 text-center">URLs</div>
              <div className="col-span-2 text-center">Scans</div>
              <div className="col-span-2 text-right">Last updated</div>
            </div>

            <div className="divide-y divide-line">
              {targets.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-muted">
                  No targets yet. Go to{" "}
                  <Link href="/scans" className="text-accent hover:underline">
                    Scans
                  </Link>{" "}
                  to start your first scan.
                </div>
              ) : (
                targets.map((t) => (
                  <Link
                    key={t.id}
                    href={`/targets/${t.id}`}
                    className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-white/[0.03] md:grid md:grid-cols-12 md:items-center md:gap-3"
                  >
                    <div className="col-span-4 min-w-0">
                      <div className="truncate font-mono text-[13px] text-cream">
                        {t.domainNormalized}
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-mono text-[12px] text-muted">
                      {t.cachedSubdomainCount.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-center font-mono text-[12px] text-muted">
                      {t.cachedUrlCount.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-center font-mono text-[12px] text-muted">
                      {t._count.scanJobs.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right font-mono text-[11px] text-muted">
                      {t.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
