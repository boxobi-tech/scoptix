"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconCopy, IconInfo, IconX } from "@/components/ui-icons";
import {
  formatObservedHostnameCount,
  formatVtPassiveDnsDateTime,
  vtPassiveDnsIpBanner,
} from "@/lib/scan-format";

export type IpSightingPanelProps = {
  ipResolutionId: string;
  onClose: () => void;
};

type SightingData = {
  hostnameNormalized: string;
  lastResolvedAt: string;
};

type PanelData = {
  ipAddress: string;
  summary: {
    firstResolvedAt: string | null;
    lastResolvedAt: string;
    observedHostnameCount: number;
  };
  sightings: SightingData[];
};

export function IpSightingPanel({ ipResolutionId, onClose }: IpSightingPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetch(`/api/ip-resolutions/${ipResolutionId}/sightings`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sightings");
        return res.json();
      })
      .then((json: PanelData) => {
        if (!ignore) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [ipResolutionId]);

  const hostnameCount = data?.summary.observedHostnameCount ?? 0;
  const displayIp = data?.ipAddress ?? "…";

  async function copyIpAddress() {
    const ip = data?.ipAddress;
    if (!ip) return;
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[90] bg-void/50"
        aria-hidden
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="ip-panel-title"
        className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-[500px] flex-col border-l border-line bg-lift shadow-lift"
      >
      <div className="shrink-0 border-b border-line px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="ip-panel-title" className="text-[12px] font-medium text-muted">
              IP Address
            </h2>
            <div className="mt-1.5 flex min-w-0 items-center gap-2">
              <p className="min-w-0 truncate font-mono text-[18px] font-bold leading-tight tracking-tight text-cream">
                {loading && !data ? "…" : displayIp}
              </p>
              <button
                type="button"
                onClick={() => void copyIpAddress()}
                disabled={loading || !data?.ipAddress}
                aria-label={copied ? "IP copied" : "Copy IP address"}
                title={copied ? "Copied" : "Copy IP address"}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-cream disabled:pointer-events-none disabled:opacity-30"
              >
                <IconCopy className="size-3.5" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-cream"
          >
            <IconX className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-r-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
            {error}
          </div>
        ) : data ? (
          <>
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-[12px] leading-relaxed text-cream">
              <IconInfo className="mt-0.5 size-4 shrink-0 text-blue-500" />
              <p>{vtPassiveDnsIpBanner(hostnameCount)}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Summary
              </h3>
              <div className="mt-3 grid grid-cols-3">
                <div className="min-w-0 pr-3 text-left">
                  <div className="text-[10px] font-medium text-muted">First Resolved</div>
                  <div className="mt-1 text-[11px] font-medium leading-snug text-cream">
                    {formatVtPassiveDnsDateTime(data.summary.firstResolvedAt)}
                  </div>
                </div>
                <div className="min-w-0 border-l border-line px-3 text-left">
                  <div className="text-[10px] font-medium text-muted">Last Resolved</div>
                  <div className="mt-1 text-[11px] font-medium leading-snug text-cream">
                    {formatVtPassiveDnsDateTime(data.summary.lastResolvedAt)}
                  </div>
                </div>
                <div className="min-w-0 border-l border-line pl-3 text-left">
                  <div className="text-[10px] font-medium text-muted">Observed in</div>
                  <div className="mt-1 text-[11px] font-medium leading-snug text-cream">
                    {formatObservedHostnameCount(data.summary.observedHostnameCount)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 border-t border-line" aria-hidden />

            <div className="mb-5">
              <h3 className="text-[14px] font-semibold text-cream">Historical Hostnames</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Domains and subdomains that have been observed resolving to this IP.
              </p>
            </div>

            <div className="mb-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                All Observations
              </h4>
            </div>

            {data.sightings.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted">No observations found.</p>
            ) : (
              <div className="space-y-3">
                {data.sightings.map((s) => (
                  <div
                    key={s.hostnameNormalized}
                    className="rounded-lg border border-line bg-white/[0.02] p-3"
                  >
                    <div className="mb-1 break-all font-mono text-[12px] text-cream">
                      {s.hostnameNormalized}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px] text-muted">
                      <span>Last Resolved</span>
                      <span className="font-mono tabular-nums text-cream/90">
                        {formatVtPassiveDnsDateTime(s.lastResolvedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </aside>
    </>,
    document.body,
  );
}
