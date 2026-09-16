export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const re = /#([\p{L}0-9_-]+)/giu;
  const tags: string[] = [];
  let match: RegExpExecArray | null = re.exec(text);
  while (match !== null) {
    tags.push(normalizeTag(match[1]));
    match = re.exec(text);
  }
  return Array.from(new Set(tags));
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-").replace(/^#+/, "");
}

/**
 * Tags are identifiers, not display prose. Normalising them here means filters
 * cannot silently treat `Work`, `work` and ` work ` as different concepts.
 */
export function parseTagList(value: string): string[] {
  return Array.from(new Set(value.split(",").map(normalizeTag).filter(Boolean)));
}
