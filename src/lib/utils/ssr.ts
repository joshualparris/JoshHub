export const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

export function safeWindow<T>(fn: (w: Window) => T, fallback?: T): T | undefined {
  if (!isBrowser()) return fallback;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fn(window as any);
  } catch (e) {
    return fallback;
  }
}
