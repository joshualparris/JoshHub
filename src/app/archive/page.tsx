import Link from "next/link";

const groups = [
  {
    title: "Games & interactive projects",
    items: [
      ["Max", "/games/max/index.html"],
      ["D&D Game", "/games/dndgame/index.html"],
      ["Orgscape", "/games/orgscape/index.html"],
      ["Orgscape v2", "/games/orgscape/orgscapev2/index.html"],
      ["Starhaven", "/games/starhaven/index.html"],
      ["Tile Game", "/games/tile-game/index.html"],
      ["Buckland v2", "/games/buckland-v2/index.html"],
      ["A-Module D&D", "/games/amodule-dnd/index.html"],
      ["Random Play", "/games/random-play/index.html"],
      ["Boundary Road", "/games/boundary-road/index.html"],
      ["Simple RPG", "/games/simple-rpg-gh/index.html"],
      ["Midnight Line", "/games/midnight-line/index.html"],
      ["Buckland Blocks", "/games/buckland-blocks/index.html"],
      ["Infinite Office", "/games/infinite-office/index.html"],
      ["Classic D&D Text", "/games/classic-dnd-text/index.html"],
      ["Forbidden Quests", "/games/forbidden-quests/index.html"],
      ["AA Game Adventure", "/games/aa-game-adventure/index.html"],
      ["Mysterious Depths", "/games/mysterious-depths/index.html"],
      ["Mysterious Depths v2", "/games/mysterious-depths/index_Version2.html"],
      ["Josh NFC Audio", "/games/josh-nfc-audio/index.html"],
      ["New Game", "/games/newgame/index.html"],
      ["Whispering Wilds", "/games/wilds-main/index.html"],
      ["Wilds — Sail West", "/games/wilds-sail-west/index.html"],
      ["Neverwinter Tales", "/games/neverwinter-tales/index.html"],
      ["D&D RPG Dungeon", "/games/dnd-rpg-dungeon/index.html"],
      ["Experimental Qwertuhvgjkk", "/games/newfileqqqwertuhvgjkk/index.html"],
    ],
  },
  {
    title: "Project docs & standalone pages",
    items: [
      ["New NFC", "/docs/newnfc.html"],
      ["Max App", "/docs/max-app.html"],
      ["Lexicon", "/docs/lexicon.html"],
      ["LifeRoom", "/docs/liferoom.html"],
      ["The Machine", "/docs/the-machine.html"],
      ["Random Play", "/docs/random-play.html"],
      ["Energy Quest", "/docs/energy-quest.html"],
      ["D&D RPG Python", "/docs/dnd-rpg-python.html"],
      ["Wastes Courier", "/docs/wastes-courier.html"],
      ["Lexicon Journal", "/docs/lexicon-journal.html"],
      ["Forbidden Quests", "/docs/forbidden-quests.html"],
      ["Parris Budget App", "/docs/parris-budget-app.html"],
      ["AA Game Adventure", "/docs/aa-game-adventure.html"],
      ["Experimental Qwertuhvgjkk", "/docs/newfileqqqwertuhvgjkk.html"],
    ],
  },
  {
    title: "Panoramas & legacy entry points",
    items: [
      ["Portal", "/portal.html"],
      ["Panorama Index", "/panos/index.html"],
      ["Boundary Road Panorama", "/panos/boundary-road/index.html"],
    ],
  },
] as const;

export default function ArchivePage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-slate-300">
          JoshHub archive
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
          All deep links
        </h1>
        <p className="max-w-3xl text-neutral-600 dark:text-slate-300">
          A permanent directory for standalone games, old project pages, documentation and panoramas that exist inside JoshHub but do not need to crowd the main navigation.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <article
            key={group.title}
            className="rounded-2xl border border-neutral-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950/50"
          >
            <h2 className="mb-4 text-lg font-semibold text-neutral-950 dark:text-white">{group.title}</h2>
            <div className="flex flex-col gap-2">
              {group.items.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-neutral-500 dark:text-slate-400">
        Generated build reports and internal development artefacts are intentionally excluded.
      </p>
    </section>
  );
}
