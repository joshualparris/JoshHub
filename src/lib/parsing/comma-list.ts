/** Parse display prose separated by commas without applying tag-style casing. */
export function parseCommaSeparatedList(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawValue of value.split(",")) {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) continue;
    if (seen.has(trimmedValue)) continue;
    seen.add(trimmedValue);
    result.push(trimmedValue);
  }

  return result;
}
