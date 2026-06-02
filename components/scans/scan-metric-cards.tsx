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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
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
            <div className="min-w-0">
              <div className="text-lg font-bold leading-tight text-cream">{metric.value}</div>
              <div className="text-[11px] font-medium text-muted">{metric.label}</div>
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
