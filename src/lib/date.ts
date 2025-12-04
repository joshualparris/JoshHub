export function todayLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameLocalDayISO(dateISO: string, todayISO: string = todayLocalISO()): boolean {
  return dateISO.slice(0, 10) === todayISO;
}
