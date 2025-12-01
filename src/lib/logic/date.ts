export function dateKeyLocal(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const year = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${m}-${day}`;
}

export function isSameLocalDay(isoA: string | undefined | null, isoBOrKey?: string): boolean {
  if (!isoA) return false;
  const keyA = dateKeyLocal(isoA);
  // if isoBOrKey looks like an ISO, convert
  if (!isoBOrKey) return false;
  // if isoBOrKey contains a T it's likely ISO
  const keyB = isoBOrKey.includes("T") ? dateKeyLocal(isoBOrKey) : isoBOrKey;
  return keyA === keyB;
}

export function isOverdue(dueIso?: string | null): boolean {
  if (!dueIso) return false;
  const now = Date.now();
  const due = new Date(dueIso).getTime();
  if (Number.isNaN(due)) return false;
  return now > due;
}
