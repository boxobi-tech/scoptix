import { getObservedAvailability, getObservedScanSummary, normalizeTake } from "@/lib/scan-observed";

export function normalizeCompareTake(raw: string | null) {
  return normalizeTake(raw, 100, 500);
}

export async function loadCompareScans(leftId: string, rightId: string) {
  const [leftScan, rightScan] = await Promise.all([
    getObservedScanSummary(leftId),
    getObservedScanSummary(rightId),
  ]);

  return {
    leftScan,
    rightScan,
    leftAvailability: leftScan ? getObservedAvailability(leftScan) : null,
    rightAvailability: rightScan ? getObservedAvailability(rightScan) : null,
  };
}

export function compareByKey<T>(
  leftRows: T[],
  rightRows: T[],
  keyOf: (row: T) => string,
) {
  const leftByKey = new Map<string, T>();
  const rightByKey = new Map<string, T>();

  for (const row of leftRows) {
    const key = keyOf(row);
    if (!leftByKey.has(key)) leftByKey.set(key, row);
  }

  for (const row of rightRows) {
    const key = keyOf(row);
    if (!rightByKey.has(key)) rightByKey.set(key, row);
  }

  const added: T[] = [];
  const removed: T[] = [];
  const unchanged: Array<{ left: T; right: T }> = [];

  for (const [key, rightRow] of rightByKey) {
    const leftRow = leftByKey.get(key);
    if (leftRow) unchanged.push({ left: leftRow, right: rightRow });
    else added.push(rightRow);
  }

  for (const [key, leftRow] of leftByKey) {
    if (!rightByKey.has(key)) removed.push(leftRow);
  }

  return {
    leftByKey,
    rightByKey,
    added,
    removed,
    unchanged,
  };
}
