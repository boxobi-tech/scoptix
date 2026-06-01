import Link from "next/link";
import { ScanJobStatus } from "@prisma/client";
import { ActiveScansPanel } from "@/components/active-scans-panel";
import { NewScanDialog } from "@/components/new-scan-dialog";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/top-bar";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-accent/15 text-accent",
  RUNNING: "bg-accent/25 text-cream",
  QUEUED: "bg-muted/15 text-muted",
  FAILED: "bg-warn/15 text-warn",
  CANCELLED: "bg-muted/10 text-muted",
  PAUSED: "bg-warn/10 text-warn",
};

function formatDateTime(value: Date | null) {
  if (!value) return "—";
  return value.toISOString().slice(0, 16).replace("T", " ");
}

export default async function ScansPage() {
  const scans = await prisma.scanJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      targetDomain: true,
      _count: {
        select: {
          analysisFindings: true,
        },
      },
    },
  });
  const activeScans = scans.filter(
    (scan) =>
      scan.status === ScanJobStatus.RUNNING ||
      scan.status === ScanJobStatus.QUEUED,
  );
  const historyScans = scans.filter(
    (scan) =>
      scan.status !== ScanJobStatus.RUNNING &&
      scan.status !== ScanJobStatus.QUEUED,
  );

  return (
    <>
      <TopBar breadcrumb="/ scans" />
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            eyebrow="Reconnaissance"
            title="Scans"
            description="Track running scans and review previous results."
          />
          <div className="shrink-0">
            <NewScanDialog />
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {activeScans.length > 0 && (
            <ActiveScansPanel
              scans={activeScans.map((scan) => ({
                id: scan.id,
                status: scan.status,
                phase: scan.phase,
                progressCurrent: scan.progressCurrent,
                progressTotal: scan.progressTotal,
                createdAt: scan.createdAt.toISOString(),
                targetDomain: {
                  domainNormalized: scan.targetDomain.domainNormalized,
                },
              }))}
            />
          )}

          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="border-b border-line bg-[var(--table-header-bg)] px-5 py-4">
              <div className="text-[13px] font-semibold text-cream">Scan history</div>
              <div className="mt-1 text-[12px] text-muted">
                Review completed, failed, cancelled, and paused scans.
              </div>
            </div>

            {/* ── Header row ── */}
            <div className="hidden border-b border-line bg-[var(--table-header-bg)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.95fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-3">
              <div>Target</div>
              <div>Status</div>
              <div>Phase</div>
              <div>Progress</div>
              <div>Findings</div>
              <div>Finished</div>
              <div className="text-right">Created</div>
            </div>

            <div className="divide-y divide-line">
              {historyScans.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="text-[13px] text-muted">
                    {activeScans.length > 0
                      ? "No previous scans yet."
                      : "No scans yet."}
                  </div>
                  <div className="mt-2 text-[12px] text-muted">
                    Start a new scan to begin collecting URLs and findings.
                  </div>
                  <div className="mt-5 flex justify-center">
                    <NewScanDialog
                      buttonClassName="shadow-clay inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-dim px-4 py-3 text-[13px] font-semibold text-void transition-transform hover:scale-[1.02]"
                    />
                  </div>
                </div>
              ) : (
                historyScans.map((s) => {
                  const isCompleted = s.status === ScanJobStatus.COMPLETED;
                  const href = isCompleted
                    ? `/scans/${s.id}/observed`
                    : `/scans/${s.id}`;
                  const statusCls =
                    STATUS_STYLE[s.status] ?? "bg-muted/10 text-muted";
                  const findingsCount =
                    s.observedFindingCount ?? s._count.analysisFindings;

                  return (
                    <Link
                      key={s.id}
                      href={href}
                      className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-white/[0.03] lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.95fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-mono text-[12px] text-cream">
                          {s.targetDomain.domainNormalized}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted lg:hidden">
                          Status
                        </div>
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${statusCls}`}
                        >
                          {s.status}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-muted">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted lg:hidden">
                          Phase
                        </div>
                        {s.phase ?? "—"}
                      </div>
                      <div className="font-mono text-[11px] text-muted">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted lg:hidden">
                          Progress
                        </div>
                        {(s.progressCurrent ?? 0).toLocaleString()}/{(s.progressTotal ?? 0).toLocaleString()}
                      </div>
                      <div className="font-mono text-[11px] text-muted">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted lg:hidden">
                          Findings
                        </div>
                        {findingsCount.toLocaleString()}
                      </div>
                      <div className="font-mono text-[11px] text-muted">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted lg:hidden">
                          Finished
                        </div>
                        {formatDateTime(s.completedAt)}
                      </div>
                      <div className="text-left font-mono text-[11px] text-muted lg:text-right">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted lg:hidden">
                          Created
                        </div>
                        {formatDateTime(s.createdAt)}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
