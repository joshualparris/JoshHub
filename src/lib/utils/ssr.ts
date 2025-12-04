export const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

export function safeWindow<T>(fn: (w: Window) => T, fallback?: T): T | undefined {
  if (!isBrowser()) return fallback;
  try {
    return fn(window);
  } catch {
    return fallback;
  }
}
