const games = [
  {
    rank: 1,
    name: "Buckland Blocks",
    genre: "Voxel sandbox",
    description: "A browser-based block world with exploration, building, inventory and crafting.",
    playUrl: "https://buckland-blocks.vercel.app/",
    repoUrl: "https://github.com/Parris-Tech-Services/BucklandBlocks",
    status: "Playable now",
    featured: true,
  },
  {
    rank: 2,
    name: "The Hollow Marches",
    genre: "AI fantasy RPG",
    description: "An open-world solo adventure with an AI dungeon master, deterministic rules, quests, combat, levelling and persistent saves.",
    playUrl: "https://astra-dnd-game.vercel.app/",
    repoUrl: "https://github.com/Parris-Tech-Services/AstraDndGame",
    status: "Playable now",
    featured: true,
  },
  {
    rank: 3,
    name: "Car Builder + Racing",
    genre: "Car design / racing",
    description: "Design a car, tune the engine and chassis, inspect performance figures, save it to your garage and race it against AI opponents.",
    playUrl: "https://topsecretcheese-del.github.io/carGame/",
    repoUrl: "https://github.com/topsecretcheese-del/carGame",
    status: "Playable now",
    featured: true,
  },
  {
    rank: 4,
    name: "Grandmaster Path",
    genre: "Chess",
    description: "Chess against practice bots with Stockfish, puzzles, lessons, family play, PGN tools and post-game review.",
    playUrl: "https://chess-kappa-five.vercel.app/",
    repoUrl: "https://github.com/Parris-Tech-Services/Chess",
    status: "Playable",
  },
  {
    rank: 5,
    name: "Lantern Road",
    genre: "Adventure RPG",
    description: "Lead a party across a hex-map frontier, taking quests, managing supplies, meeting factions and fighting compact battles.",
    playUrl: "https://parris-tech-services.github.io/lantern-road/",
    repoUrl: "https://github.com/Parris-Tech-Services/lantern-road",
    status: "Playable now",
  },
  {
    rank: 6,
    name: "Breach Command",
    genre: "Tactical roguelike",
    description: "A turn-based tactical browser roguelike with deterministic battles, touch controls and offline support.",
    playUrl: "https://parris-tech-services.github.io/breach-command/",
    repoUrl: "https://github.com/Parris-Tech-Services/breach-command",
    status: "Playable now",
  },
  {
    rank: 7,
    name: "Whispering Wilds",
    genre: "Narrative RPG",
    description: "A text-first wilderness RPG with branching quests, tactical encounters, autosaves and portable journey backups.",
    playUrl: "https://parris-tech-services.github.io/WhirringWilderness/",
    repoUrl: "https://github.com/Parris-Tech-Services/WhirringWilderness",
    status: "Playable now",
  },
  {
    rank: 8,
    name: "Wastes Courier",
    genre: "Roguelike",
    description: "A Phaser-powered browser roguelike built around surviving and travelling through the wastes.",
    playUrl: "https://wastes-courier-roguelike.vercel.app/",
    repoUrl: "https://github.com/Parris-Tech-Services/wastes-courier-roguelike",
    status: "Playable now",
  },
  {
    rank: 9,
    name: "Eleven Realms",
    genre: "Exploration",
    description: "Explore compact realms, recover relics, find gates, manage health and chase a score through a canvas-based adventure.",
    playUrl: "https://realms-bay.vercel.app/",
    repoUrl: "https://github.com/Parris-Tech-Services/Eleven-Realms",
    status: "Playable now",
  },
  {
    rank: 10,
    name: "Chronicles of the Sword Coast",
    genre: "Browser RPG",
    description: "Character creation, exploration, NPCs, quests, turn-based combat, spells, crafting and a complete boss-and-ending path.",
    playUrl: null,
    repoUrl: "https://github.com/Parris-Tech-Services/dndgame",
    status: "Local build",
  },
];

export const metadata = {
  title: "Josh's Games | JoshHub",
  description: "A showcase of Josh Parris's best playable browser games and game projects.",
};

export default function GamesPage() {
  const featured = games.filter((game) => game.featured);
  const moreGames = games.filter((game) => !game.featured);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-950 px-6 py-10 text-white shadow-xl dark:border-slate-700 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Josh Parris · Game Showcase
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
          Games I&apos;ve built.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          My strongest playable games across GitHub, from voxel sandboxes and tactical roguelikes
          to racing, chess and open-world fantasy.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">10 featured projects</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Browser-first</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Source available</span>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Top picks</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Start here</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Click Play to launch a game in a new tab.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {featured.map((game) => (
            <article key={game.name} className="flex min-h-72 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <span className="text-4xl font-black text-slate-200 dark:text-slate-700">0{game.rank}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {game.status}
                </span>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">{game.genre}</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{game.name}</h3>
              <p className="mt-3 flex-1 leading-6 text-slate-600 dark:text-slate-300">{game.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {game.playUrl && (
                  <a href={game.playUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    Play game ↗
                  </a>
                )}
                <a href={game.repoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  GitHub
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">More to play</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">The full top 10</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {moreGames.map((game) => (
            <article key={game.name} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {game.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">{game.genre}</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{game.name}</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{game.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{game.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {game.playUrl && (
                    <a href={game.playUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                      Play ↗
                    </a>
                  )}
                  <a href={game.repoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    Source
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
        These are independent projects made and maintained across my GitHub repositories. Some are polished releases and some are active experiments that keep evolving.
      </footer>
    </div>
  );
}
