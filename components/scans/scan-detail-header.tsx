import Link from "next/link";
import { TopBarControls } from "@/components/top-bar-controls";
import {
  IconArrowUpRight,
  IconCheckCircle,
  IconChevronDown,
  IconDownload,
} from "@/components/ui-icons";

type ScanDetailHeaderProps = {
  domain: string;
  status: string;
  statusLabel?: string;
  scannedAt: string;
  scanIdShort: string;
  duration: string;
  compareHref: string;
  exportHref?: string;
};

const STATUS_COMPLETED = new Set(["COMPLETED", "completed"]);

export function ScanDetailHeader({
  domain,
  status,
  statusLabel,
  scannedAt,
  scanIdShort,
  duration,
  compareHref,
  exportHref,
}: ScanDetailHeaderProps) {
  const completed = STATUS_COMPLETED.has(status);

  return (
    <header className="scx-scan-header shrink-0">
      <div className="flex items-stretch justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-[11px] text-muted">Scan Summary</div>
          <div className="mb-3 flex items-center gap-3">
            <h1 className="truncate text-3xl font-bold text-cream">{domain}</h1>
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-accent hover:text-accent-dim"
              aria-label={`Open ${domain}`}
            >
              <IconArrowUpRight className="size-5" />
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                completed
                  ? "bg-accent/15 text-accent-dim"
                  : "bg-warn/15 text-warn",
              ].join(" ")}
            >
              {completed && <IconCheckCircle className="mr-1 size-3" />}
              {statusLabel ?? status}
            </span>
            <span>Scan on {scannedAt}</span>
            <span aria-hidden>•</span>
            <span>Scan ID: {scanIdShort}</span>
            <span aria-hidden>•</span>
            <span>Duration: {duration}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          <TopBarControls compact />

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href={compareHref}
              className="inline-flex items-center rounded-lg border border-accent px-3 py-1.5 text-[12px] font-medium text-accent transition hover:bg-accent/10"
            >
              <IconArrowUpRight className="mr-1.5 size-3.5 rotate-45" />
              Compare
            </Link>
            {exportHref ? (
              <a
                href={exportHref}
                className="inline-flex items-center rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-cream transition hover:bg-[var(--nav-hover-bg)]"
              >
                <IconDownload className="mr-1.5 size-3.5" />
                Export
                <IconChevronDown className="ml-1.5 size-3.5 text-muted" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-muted opacity-60"
                title="Export coming soon"
              >
                <IconDownload className="mr-1.5 size-3.5" />
                Export
                <IconChevronDown className="ml-1.5 size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
