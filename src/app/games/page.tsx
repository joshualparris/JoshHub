import type { Metadata } from "next";
import GameCard from "@/components/games/GameCard";
import gamesShowcase from "@/data/gamesShowcase";
import { apps } from "@/data/apps";

export const metadata: Metadata = {
    title: "Games Showcase - JoshHub",
    description: "Top game projects from your workspace",
};

export default function Page() {
    return (
        <div>
            <header className="mb-6">
                <h1 className="text-2xl font-bold">Games Showcase</h1>
                <p className="mt-2 text-sm text-neutral-600 dark:text-slate-300">
                    Five curated projects I found in your workspace. Click a path to
                    inspect the folder.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gamesShowcase.map((g) => {
                    const titleLower = g.title.toLowerCase();

                    // find candidate apps where id or name includes title or vice-versa
                    const candidates = apps.filter((a) => {
                        if (!a) return false;
                        const name = a.name?.toLowerCase() ?? "";
                        const id = a.id?.toLowerCase() ?? "";
                        return (
                            id.includes(titleLower) ||
                            titleLower.includes(id) ||
                            name.includes(titleLower) ||
                            titleLower.includes(name)
                        );
                    });

                    // scoring heuristic: prefer itch.io, then github pages, then other http hosts, then local /games paths
                    function scoreApp(a: typeof apps[number]) {
                        const urls = (a.urls ?? []).map((u) => u.url).filter(Boolean);
                        const primary = a.primaryUrl ?? "";
                        let s = 0;
                        const combined = [primary, ...urls].join(" ").toLowerCase();
                        if (combined.includes("itch.io")) s += 100;
                        if (combined.includes("github.io")) s += 80;
                        if (combined.includes("vercel.app") || combined.startsWith("https://")) s += 50;
                        if ((a.tags ?? []).includes("playable") || (a.tags ?? []).includes("play")) s += 20;
                        // prefer non-local (http) over local /games
                        if (combined.startsWith("/games") || combined.includes("/games/")) s -= 10;
                        // small boost if lastTouched exists (prefer more recently touched)
                        const lastTouched = a.lastTouched ? Date.parse(a.lastTouched) : NaN;
                        if (!Number.isNaN(lastTouched)) {
                            s += Math.min(30, Math.floor((Date.now() - lastTouched) / (1000 * 60 * 60 * 24 * 365)) * -1);
                        }
                        return s;
                    }

                    const best = candidates.sort((x, y) => scoreApp(y) - scoreApp(x))[0];

                    // Prefer an explicit playUrl from the showcase data first
                    const playUrl = g.playUrl ?? best?.primaryUrl ?? best?.urls?.[0]?.url ?? null;

                    return (
                        <GameCard
                            key={g.id}
                            id={g.id}
                            title={g.title}
                            description={g.description}
                            localPath={g.localPath}
                            playUrl={playUrl}
                        />
                    );
                })}
            </div>
        </div>
    );
}
