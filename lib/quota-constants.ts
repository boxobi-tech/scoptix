/** VT quota constants — per VirusTotal public API limits */
export const PER_KEY_PER_MINUTE = 4; // max 4 req/min per key
export const PER_KEY_PER_DAY = 500; // max 500 req/day per key
export const PER_KEY_MONTHLY = 15_500; // max 15,500 req/month per key (informational display)

export function utcDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Calendar month in UTC, e.g. "2026-05". */
export function currentMonthKey(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** ISO week in UTC (Monday-based), e.g. "2026-W22". */
export function currentIsoWeekKey(d = new Date()): string {
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const isoYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

export type UsagePeriodSnapshot = {
  daily: number;
  weekly: number;
  monthly: number;
};

/** Resolve displayed counters for the current UTC day / ISO week / calendar month. */
export function resolveUsageCounters(
  key: {
    usageCount: number;
    usageCountDate: Date;
    usageCountWeekly: number;
    usageWeekKey: string;
    usageCountMonthly: number;
    usageMonthKey: string;
  },
  now = new Date(),
): UsagePeriodSnapshot {
  const today = utcDateOnly(now);
  const weekKey = currentIsoWeekKey(now);
  const monthKey = currentMonthKey(now);

  return {
    daily: utcDateOnly(key.usageCountDate).getTime() === today.getTime() ? key.usageCount : 0,
    weekly: key.usageWeekKey === weekKey ? key.usageCountWeekly : 0,
    monthly: key.usageMonthKey === monthKey ? key.usageCountMonthly : 0,
  };
}

export function currentUsagePeriodKeys(now = new Date()) {
  return {
    date: utcDateOnly(now),
    weekKey: currentIsoWeekKey(now),
    monthKey: currentMonthKey(now),
  };
}

/**
 * Minimum global interval (in seconds) between consecutive VT requests.
 *
 * Derived purely from the per-minute rate limit:
 *   1 key  → 4 req/min → ceil(60/4)  = 15 sec between requests
 *   3 keys → 12 req/min → ceil(60/12) = 5 sec between requests
 *   4 keys → 16 req/min → ceil(60/16) = ceil(3.75) = 4 sec between requests
 *
 * No "budget saving" logic — if a key hits its daily/monthly cap it gets
 * disabled and removed from rotation, which naturally slows the pace.
 */
export function effectiveIntervalSec(activeKeys: number): number {
  if (activeKeys <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil(60 / (activeKeys * PER_KEY_PER_MINUTE));
}
