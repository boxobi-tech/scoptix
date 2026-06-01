export function formatScanDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatScanDuration(
  startedAt: Date | string | null | undefined,
  completedAt: Date | string | null | undefined,
) {
  if (!startedAt || !completedAt) return "—";
  const start = typeof startedAt === "string" ? new Date(startedAt) : startedAt;
  const end = typeof completedAt === "string" ? new Date(completedAt) : completedAt;
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function shortScanId(id: string, len = 8) {
  return id.length > len ? id.slice(0, len) : id;
}
