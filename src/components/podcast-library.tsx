"use client";

import type { PodcastEpisode } from "@/components/podcast-player";

type Episode = PodcastEpisode & {
  tags?: string[];
};

type TopicGroup = {
  id: string;
  name: string;
  episodes: Episode[];
};

const PLAYER_EVENT = "joshhub:podcast-play";

export function PodcastLibrary({ topicGroups }: { topicGroups: TopicGroup[] }) {
  const playEpisode = (episode: Episode) => {
    window.dispatchEvent(
      new CustomEvent<PodcastEpisode>(PLAYER_EVENT, {
        detail: {
          id: episode.id,
          title: episode.title,
          show: episode.show,
          duration: episode.duration,
        },
      })
    );
  };

  return (
    <>
      <nav aria-label="Podcast topics" className="flex gap-2 overflow-x-auto pb-1">
        {topicGroups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {group.name}
          </a>
        ))}
      </nav>

      {topicGroups.map((group, groupIndex) => (
        <details
          key={group.id}
          id={group.id}
          open={groupIndex === 0}
          className="scroll-mt-28 rounded-3xl border border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <summary className="cursor-pointer list-none px-5 py-4 text-lg font-semibold text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 dark:text-white">
            <span className="flex items-center justify-between gap-3">
              <span>{group.name}</span>
              <span className="text-xs font-normal text-neutral-500 dark:text-slate-400">
                {group.episodes.length} episodes
              </span>
            </span>
          </summary>

          <div className="grid gap-3 border-t border-neutral-100 p-4 sm:grid-cols-2 dark:border-slate-800">
            {group.episodes.map((episode) => (
              <article
                key={episode.id}
                className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-700 dark:bg-slate-950/50"
              >
                <div>
                  <h2 className="font-semibold leading-snug text-neutral-900 dark:text-white">
                    {episode.title}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-slate-300">
                    {[episode.show, episode.duration].filter(Boolean).join(" · ")}
                  </p>
                  {episode.tags?.length ? (
                    <p className="mt-2 text-xs text-neutral-500 dark:text-slate-400">
                      {episode.tags.join(" · ")}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playEpisode(episode)}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    ▶ Play in JoshHub
                  </button>
                  <a
                    href={`https://open.spotify.com/episode/${episode.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    Spotify ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </details>
      ))}
    </>
  );
}
