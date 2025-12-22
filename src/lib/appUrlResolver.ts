// Client-side helper to resolve a playable/openable URL for an app.
// Tries primaryUrl first, then entries in urls[], preferring absolute URLs,
// and finally returns null if nothing reachable.

import type { CatalogItem } from "@/data/apps";

async function exists(url: string) {
    try {
        // Only check same-origin or root-relative resources using fetch.
        const resp = await fetch(url, { method: "GET", cache: "no-store" });
        return resp.ok;
    } catch {
        return false;
    }
}

export async function resolveAppUrl(app: CatalogItem): Promise<string | null> {
    const candidates: string[] = [];

    if (app.primaryUrl) candidates.push(app.primaryUrl);
    // prefer external absolute links after primary
    const absolute = app.urls.filter((u) => /^https?:\/\//i.test(u.url)).map((u) => u.url);
    const relative = app.urls.filter((u) => !/^https?:\/\//i.test(u.url)).map((u) => u.url);

    candidates.push(...absolute, ...relative);

    for (const c of candidates) {
        if (!c) continue;
        // If it's an absolute URL, just assume reachable and return it. We could HEAD it,
        // but cross-origin restrictions make that unreliable — prefer opening absolute links.
        if (/^https?:\/\//i.test(c)) return c;

        // For root-relative links, verify existence via fetch (same origin)
        try {
            const ok = await exists(c);
            if (ok) return c;
        } catch {
            // ignore and try next
        }
    }

    // No reachable link found
    return null;
}

export default resolveAppUrl;
