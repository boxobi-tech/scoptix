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

export function ScanMetricCards({
  metrics,
  layout = "grid",
}: {
  metrics: ScanMetric[];
  layout?: "grid" | "row";
}) {
  return (
    <div className={layout === "row" ? "grid grid-cols-3 gap-3" : "scx-metric-cards-grid"}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isRow = layout === "row";
        return (
          <div
            key={metric.label}
            className={[
              "scx-metric-card",
              isRow ? "flex-col items-center justify-center text-center" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div
              className={[
                "shrink-0 rounded-full p-2.5",
                isRow ? "mb-2" : "mr-3",
                metric.iconBg,
                metric.iconColor,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Icon className="size-5" />
            </div>
            <div className={isRow ? "min-w-0 w-full" : "min-w-0 flex-1"}>
              <div className="truncate text-lg font-bold leading-tight text-cream">{metric.value}</div>
              <div
                className={[
                  "scx-metric-label font-medium leading-snug text-muted",
                  isRow ? "text-[10px] uppercase tracking-wider" : "text-[11px]",
                ].join(" ")}
              >
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
