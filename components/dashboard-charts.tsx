import Link from "next/link";
import { DashboardChartRangeMenu } from "@/components/dashboard-chart-range-menu";
import type {
  ActivityBucket,
  ActivityRangeConfig,
  ApiKeyUsageRow,
  StatusCount,
} from "@/lib/dashboard-stats";

const STATUS_BAR_STYLE: Record<string, string> = {
  COMPLETED: "bg-accent",
  RUNNING: "bg-accent/70",
  QUEUED: "bg-muted/50",
  FAILED: "bg-warn",
  CANCELLED: "bg-muted/30",
  PAUSED: "bg-warn/70",
};

const STATUS_LABEL_STYLE: Record<string, string> = {
  COMPLETED: "text-accent",
  RUNNING: "text-cream",
  QUEUED: "text-muted",
  FAILED: "text-warn",
  CANCELLED: "text-muted",
  PAUSED: "text-warn",
};

function barHeightPct(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 0) return 100;
  return Math.max(8, Math.round((count / max) * 100));
}

function shouldShowBucketLabel(index: number, total: number): boolean {
  if (total <= 16) return true;
  if (index === total - 1) return true;
  const step = Math.max(1, Math.ceil(total / 12));
  return index % step === 0;
}

function ChartFooter({
  param,
  range,
  siblingParams,
  action,
}: {
  param: "scanRange" | "findingsRange";
  range: ActivityRangeConfig;
  siblingParams: Record<string, string>;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <DashboardChartRangeMenu param={param} current={range.key} siblingParams={siblingParams} />
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-cream"
        >
          {action.label}
          <svg className="size-4" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m14 0-4 4m4-4-4-4" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}

function FindingsAreaChart({ buckets }: { buckets: ActivityBucket[] }) {
  const width = 100;
  const height = 48;
  const max = Math.max(...buckets.map((b) => b.count), 1);
  const n = buckets.length;

  const points = buckets.map((bucket, index) => {
    const x = n <= 1 ? width / 2 : (index / (n - 1)) * width;
    const y = height - (bucket.count / max) * (height - 4) - 2;
    return { x, y, bucket };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${width} ${height} L 0 ${height} Z`
      : "";

  return (
    <div className="mt-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="dashboard-area-chart"
        role="img"
        aria-label="Findings area chart"
      >
        <defs>
          <linearGradient id="dashboardFindingsAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {areaPath ? <path d={areaPath} fill="url(#dashboardFindingsAreaFill)" /> : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
      <div className="mt-2 flex gap-1">
        {buckets.map((bucket, index) => (
          <div
            key={`${bucket.key}-area-label`}
            className="min-w-0 flex-1 truncate text-center font-mono text-[9px] text-muted"
            title={`${bucket.label}: ${bucket.count.toLocaleString()}`}
          >
            {shouldShowBucketLabel(index, buckets.length) ? bucket.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function activitySubtitle(range: ActivityRangeConfig, noun: string): string {
  return `${noun} per ${range.subtitleUnit} · last ${range.label.toLowerCase()}`;
}

function activityEmptyLabel(range: ActivityRangeConfig, noun: string): string {
  return `No ${noun} in the last ${range.label.toLowerCase()}.`;
}

export function DashboardScanActivityChart({
  buckets,
  range,
  siblingParams,
}: {
  buckets: ActivityBucket[];
  range: ActivityRangeConfig;
  siblingParams: Record<string, string>;
}) {
  const max = Math.max(...buckets.map((d) => d.count), 1);
  const total = buckets.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Scan activity</div>
          <div className="mt-1 text-[12px] text-muted">{activitySubtitle(range, "Scans started")}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[20px] text-cream">{total.toLocaleString()}</div>
          <div className="text-[10px] text-muted">total · UTC</div>
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line px-4 py-10 text-center text-[12px] text-muted">
          {activityEmptyLabel(range, "scans")}
        </div>
      ) : (
        <div className="mt-6">
          <div className="hist-bars" role="img" aria-label="Scan activity bar chart">
            {buckets.map((bucket) => (
              <div
                key={bucket.key}
                className="hist-bar"
                style={{ height: `${barHeightPct(bucket.count, max)}%` }}
                title={`${bucket.label}: ${bucket.count.toLocaleString()}`}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            {buckets.map((bucket, index) => (
              <div
                key={`${bucket.key}-label`}
                className="min-w-0 flex-1 truncate text-center font-mono text-[9px] text-muted"
                title={`${bucket.label}: ${bucket.count.toLocaleString()}`}
              >
                {shouldShowBucketLabel(index, buckets.length) ? bucket.label : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      <ChartFooter
        param="scanRange"
        range={range}
        siblingParams={siblingParams}
        action={{ href: "/scans", label: "Scans" }}
      />
    </div>
  );
}

export function DashboardFindingsActivityChart({
  buckets,
  range,
  siblingParams,
}: {
  buckets: ActivityBucket[];
  range: ActivityRangeConfig;
  siblingParams: Record<string, string>;
}) {
  const total = buckets.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Findings activity</div>
          <div className="mt-1 text-[12px] text-muted">{activitySubtitle(range, "New regex findings")}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[20px] text-cream">{total.toLocaleString()}</div>
          <div className="text-[10px] text-muted">total · UTC</div>
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line px-4 py-10 text-center text-[12px] text-muted">
          {activityEmptyLabel(range, "findings")}
        </div>
      ) : (
        <FindingsAreaChart buckets={buckets} />
      )}

      <ChartFooter
        param="findingsRange"
        range={range}
        siblingParams={siblingParams}
        action={{ href: "/findings", label: "Findings report" }}
      />
    </div>
  );
}

export function DashboardScanStatusChart({ rows }: { rows: StatusCount[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="glass-panel flex h-full flex-col rounded-2xl p-5 md:p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Scan pipeline</div>
      <div className="mt-1 text-[12px] text-muted">All-time status breakdown</div>
      <div className="mt-3 font-mono text-[20px] text-cream">{total.toLocaleString()}</div>
      <div className="text-[10px] text-muted">scans recorded</div>

      {total === 0 ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-line px-4 py-8 text-[12px] text-muted">
          No scans yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((row) => {
            const pct = Math.round((row.count / total) * 100);
            const barCls = STATUS_BAR_STYLE[row.status] ?? "bg-muted/40";
            const labelCls = STATUS_LABEL_STYLE[row.status] ?? "text-muted";

            return (
              <div key={row.status}>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className={`font-semibold uppercase tracking-wide ${labelCls}`}>{row.status}</span>
                  <span className="font-mono text-muted">
                    {row.count.toLocaleString()} · {pct}%
                  </span>
                </div>
                <div className="dashboard-meter mt-1.5">
                  <div className={`dashboard-meter-fill ${barCls}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardApiKeyUsageChart({
  rows,
  perKeyDailyCap,
}: {
  rows: ApiKeyUsageRow[];
  perKeyDailyCap: number;
}) {
  const active = rows.filter((r) => !r.isDisabled).length;
  const exhausted = rows.filter((r) => !r.isDisabled && r.usage >= perKeyDailyCap).length;

  return (
    <div className="glass-panel flex h-full flex-col rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">API keys</div>
          <div className="mt-1 text-[12px] text-muted">VirusTotal daily usage · UTC</div>
        </div>
        <Link
          href="/settings?tab=network"
          className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[10px] font-medium text-muted transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-cream"
        >
          Manage
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
        <span>
          <span className="font-mono text-cream">{active}</span> active
        </span>
        {exhausted > 0 ? (
          <span className="text-warn">
            <span className="font-mono">{exhausted}</span> at daily cap
          </span>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line px-4 py-8 text-center">
          <p className="text-[12px] text-muted">No API keys configured.</p>
          <Link
            href="/settings?tab=network"
            className="rounded-xl border border-line px-3 py-2 text-[12px] text-muted transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-cream"
          >
            Add keys in Settings
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {rows.map((row) => {
            const pct = Math.min(100, Math.round((row.usage / perKeyDailyCap) * 100));
            const atCap = row.usage >= perKeyDailyCap;

            return (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-mono text-cream">{row.label}</span>
                  <span className={`shrink-0 font-mono ${atCap ? "text-warn" : "text-muted"}`}>
                    {row.usage}/{perKeyDailyCap}
                  </span>
                </div>
                <div className="dashboard-meter mt-1.5">
                  <div
                    className={`dashboard-meter-fill ${atCap ? "bg-warn" : row.isDisabled ? "bg-muted/35" : "bg-accent"}`}
                    style={{ width: `${row.isDisabled ? 0 : Math.max(pct, row.usage > 0 ? 4 : 0)}%` }}
                  />
                </div>
                {row.isDisabled ? (
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted">Disabled</div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardFailedScanAlert({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <div className="rounded-2xl border border-warn/30 bg-warn/5 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-warn">Attention</div>
          <p className="mt-1 text-[13px] text-cream">
            {count.toLocaleString()} failed scan{count === 1 ? "" : "s"} in the last 24 hours.
          </p>
        </div>
        <Link
          href="/scans"
          className="rounded-xl border border-warn/30 px-3 py-2 text-[12px] font-medium text-warn transition-colors hover:bg-warn/10"
        >
          View scans
        </Link>
      </div>
    </div>
  );
}
