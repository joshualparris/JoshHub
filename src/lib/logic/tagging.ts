export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const re = /#([\p{L}0-9_-]+)/giu;
  const tags: string[] = [];
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(text)) !== null) {
    tags.push(normalizeTag(match[1]));
  }
  return Array.from(new Set(tags));
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-").replace(/^#+/, "");
}
