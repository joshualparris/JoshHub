/** Parse display prose separated by commas without applying tag-style casing. */
export function parseCommaSeparatedList(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawItem of value.split(",")) {
    const item = rawItem.trim();
    if (!item) continue;
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }

  return result;
}
