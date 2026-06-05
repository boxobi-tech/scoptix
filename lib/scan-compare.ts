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
