import { CaptureKind } from "../models/capture";
import { LifeArea, normalizeLifeArea } from "../models/life";
import { extractHashtags } from "./tagging";

export function inferKind(text: string, url?: string | null): CaptureKind {
  const lower = (text || "").toLowerCase();
  if (url) return "bookmark";
  if (/\b(pray|prayer)\b/.test(lower)) return "prayer";
  if (/\b(todo|task|fix|urgent|bug|to do)\b/.test(lower)) return "task";
  if (/\b(idea|brainstorm|concept|suggestion)\b/.test(lower)) return "idea";
  if (/\b(memory|remember|trip|story)\b/.test(lower)) return "memory";
  return "note";
}

export function inferArea(text: string): LifeArea {
  const lower = (text || "").toLowerCase();
  // conservative keywords mapped to areas
  const mapping: Array<{ re: RegExp; area: LifeArea }> = [
    { re: /\b(dcs|dubbo|work|la trobe|la trobe)\b/, area: "work" },
    { re: /\b(game|itch|whispering|wilds|rpg|dnd)\b/, area: "tech" },
    { re: /\b(kids|family|wife|husband|child|sylvie|elias)\b/, area: "family" },
    { re: /\b(sleep|hrv|movement|nutrition|health)\b/, area: "health" },
    { re: /\b(finance|budget|mortgage|bank|super)\b/, area: "finance" },
    { re: /\b(travel|trip|fiji|tasmania)\b/, area: "travel" },
    { re: /\b(faith|church|psalm|gospel|pray|prayer)\b/, area: "faith" },
  ];
  for (const m of mapping) {
    if (m.re.test(lower)) return m.area;
  }
  return normalizeLifeArea(lower);
}

export function extractTitle(text: string): string {
  if (!text) return "Untitled";
  const lines = text.trim().split(/\r?\n/);
  const first = lines.find((l) => l.trim().length > 0) ?? "Untitled";
  // strip markdown header if present
  return first.replace(/^#\s*/, "").trim();
}

export function autoSort(text: string, maybeUrl?: string | null) {
  const kind = inferKind(text, maybeUrl ?? undefined);
  const area = inferArea(text);
  const title = extractTitle(text);
  const tags = extractHashtags(text);
  return { kind, area, title, tags } as const;
}
