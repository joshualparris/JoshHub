/** Parse display prose separated by commas without applying tag-style casing. */
export function parseCommaSeparatedList(value: string): string[] {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const rawItem of value.split(",")) {
    const item = rawItem.trim();
    if (!item || seen.has(item)) continue;
    seen.add(item);
    items.push(item);
  }

  return items;
}
