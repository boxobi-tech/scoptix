import type { ComponentType } from "react";

export type ScanMetric = {
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend?: string;
  trendColor?: string;
  subLabel?: string;
};

export function ScanMetricCards({ metrics }: { metrics: ScanMetric[] }) {
  return (
    <div className="scx-metric-cards-grid">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="scx-metric-card">
            <div
              className={[
                "mr-3 shrink-0 rounded-full p-2.5",
                metric.iconBg,
                metric.iconColor,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold leading-tight text-cream">{metric.value}</div>
              <div className="scx-metric-label text-[11px] font-medium leading-snug text-muted">
                {metric.label}
              </div>
              {metric.trend ? (
                <div
                  className={`mt-0.5 text-[10px] font-medium ${metric.trendColor ?? "text-muted"}`}
                >
                  {metric.trend}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
