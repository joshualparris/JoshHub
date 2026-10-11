"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type PodcastEpisode = {
  id: string;
  title: string;
  show: string;
  duration?: string;
};

const STORAGE_KEY = "joshhub:podcast-current";
const PLAYER_EVENT = "joshhub:podcast-play";

export function PodcastPlayer() {
  const [current, setCurrent] = useState<PodcastEpisode | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCurrent(JSON.parse(saved) as PodcastEpisode);
        setExpanded(false);
      }
    } catch {
      // Ignore malformed or unavailable local storage.
    }

    const handlePlay = (event: Event) => {
      const episode = (event as CustomEvent<PodcastEpisode>).detail;
      if (!episode?.id) return;

      setCurrent(episode);
      setExpanded(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(episode));
      } catch {
        // Playback should still work if storage is unavailable.
      }
    };

    window.addEventListener(PLAYER_EVENT, handlePlay);
    return () => window.removeEventListener(PLAYER_EVENT, handlePlay);
  }, []);

  const closePlayer = () => {
    setCurrent(null);
    setExpanded(true);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
  };

  if (!current) {
    return (
      <Link
        href="/podcasts"
        aria-label="Browse JoshHub podcasts"
        className="fixed left-1/2 z-[2147481998] -translate-x-1/2 rounded-full border border-slate-400/50 bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-slate-500"
        style={{ bottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        🎧 Podcasts
      </Link>
    );
  }

  return (
    <aside
      aria-label="JoshHub podcast player"
      className="fixed left-1/2 z-[2147481998] w-[min(430px,calc(100vw-20px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-300/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/95"
      style={{ bottom: "max(10px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-expanded={expanded}
          aria-controls="joshhub-podcast-embed"
        >
          <span className="block truncate text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
            🎧 Now playing
          </span>
          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
            {current.title}
          </span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {[current.show, current.duration].filter(Boolean).join(" · ")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={expanded ? "Collapse podcast player" : "Expand podcast player"}
        >
          {expanded ? "↓" : "↑"}
        </button>

        <button
          type="button"
          onClick={closePlayer}
          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Close podcast player"
        >
          ×
        </button>
      </div>

      <div
        id="joshhub-podcast-embed"
        className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
          expanded ? "max-h-[245px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!expanded}
      >
        <div className="border-t border-slate-200 px-3 pb-3 pt-2 dark:border-slate-800">
          <iframe
            key={current.id}
            title={`Spotify player for ${current.title}`}
            src={`https://open.spotify.com/embed/episode/${current.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            loading="eager"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-xl border-0"
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <Link
              href="/podcasts"
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-sky-300 dark:hover:bg-slate-900"
            >
              Browse podcasts
            </Link>
            <a
              href={`https://open.spotify.com/episode/${current.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Open in Spotify ↗
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
