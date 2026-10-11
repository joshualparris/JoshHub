import Link from "next/link";
import {podcasts} from "@/lib/learning/podcast-library";

import { PodcastLibrary } from "@/components/podcast-library";

import faith from "../../../public/podcasts/faith.json";
import it from "../../../public/podcasts/it.json";
import software from "../../../public/podcasts/software.json";
import research from "../../../public/podcasts/research.json";
import relationships from "../../../public/podcasts/relationships.json";
import career from "../../../public/podcasts/career.json";
import decision from "../../../public/podcasts/decision.json";
import homelab from "../../../public/podcasts/homelab.json";
import horses from "../../../public/podcasts/horses.json";

type Episode = {
  id: string;
  title: string;
  show: string;
  tags?: string[];
  duration?: string;
  playerType?:"spotify"|"mp3";
  spotifyType?:"episode"|"show";
  audioUrl?:string;
  sourceUrl?:string;
};

const topicGroups: Array<{ id: string; name: string; episodes: Episode[] }> = [
  { id: "faith", name: "Faith", episodes: faith },
  { id: "it", name: "IT & MSP", episodes: it },
  { id: "software", name: "Software building", episodes: software },
  { id: "research", name: "Research & evidence", episodes: research },
  { id: "relationships", name: "Relationships", episodes: relationships },
  { id: "career", name: "Career", episodes: career },
  { id: "decision", name: "Decision making", episodes: decision },
  { id: "homelab", name: "Homelab & local AI", episodes: homelab },
  { id: "repair-cafe", name: "Repair Café & e-waste", episodes: podcasts.map(p=>({id:p.player==="mp3"?p.id:p.url.split("/").pop()??p.id,title:p.title,show:p.creator,tags:[p.category],playerType:p.player==="mp3"?"mp3" as const:"spotify" as const,spotifyType:p.url.includes("/show/")?"show" as const:"episode" as const,audioUrl:p.audio||undefined,sourceUrl:p.url})) },
  { id: "horses", name: "Horse therapy", episodes: horses },
];

export const metadata = {
  title: "Podcasts · JoshHub",
  description:
    "Curated JoshHub podcast library with persistent in-app playback across faith, IT, software, research, relationships, career, decisions, homelab and horses.",
};

export default function PodcastsPage() {
  return (
    <div className="space-y-6 pb-28">
      <section className="rounded-3xl border border-white/70 bg-gradient-to-r from-white via-sky-50 to-emerald-50 p-6 shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-slate-400">
              JoshHub library
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              🎧 Podcasts
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-slate-300">
              Tap <strong>Play in JoshHub</strong> on any episode. The Spotify player stays inside
              JoshHub and remains available while you browse Home, Work, Apps, Projects and Life.
            </p>
            <p className="mt-2 max-w-2xl text-xs text-neutral-500 dark:text-slate-400">
              Browsers do not allow us to force audio to autoplay, so press play once inside the
              embedded Spotify player. You can then collapse the player without leaving JoshHub.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </section>

      <PodcastLibrary topicGroups={topicGroups} />
    </div>
  );
}
