"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { AppWindow, Home, Layers, Plus, Search } from "lucide-react";

import type { CatalogItem } from "@/data/apps";
import { apps } from "@/data/apps";
import type { LifeArea } from "@/data/life";
import { lifeAreas } from "@/data/life";
import { addPin, createBookmark, createNote, createTask, removePin } from "@/lib/db/actions";
import { loadPinnedLife } from "@/lib/pins";

type Result =
  | { type: "app"; item: CatalogItem }
  | { type: "life"; item: LifeArea }
  | { type: "route"; label: string; href: string }
  | { type: "action"; label: string; run: () => Promise<void> | void };

const routes = [
  { label: "Home", href: "/" },
  { label: "Apps", href: "/apps" },
  { label: "Projects", href: "/projects" },
  { label: "Life", href: "/life" },
  { label: "Capture", href: "/capture" },
  { label: "Notes", href: "/notes" },
  { label: "Tasks", href: "/tasks" },
  { label: "Routines", href: "/routines" },
  { label: "Settings / Backups", href: "/settings/backups" },
];

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    loadPinnedLife().then(setPinned);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo<Result[]>(() => {
    const q = query.toLowerCase();
    const appMatches = apps.filter((app) =>
      `${app.name} ${app.tags.join(" ")} ${app.notes ?? ""}`.toLowerCase().includes(q)
    );
    const lifeMatches = lifeAreas.filter((area) =>
      `${area.title} ${area.intro} ${area.sections.map((s) => `${s.heading} ${s.body}`).join(" ")}`.toLowerCase().includes(q)
    );
    const routeMatches = routes.filter((r) => r.label.toLowerCase().includes(q));
    const actionMatches: Result[] = [
      { type: "action", label: "New Note", run: async () => { await createNote({ title: "New note" }); } },
      { type: "action", label: "New Task", run: async () => { await createTask({ title: "New task" }); } },
      {
        type: "action",
        label: "Add Bookmark",
        run: async () => { await createBookmark({ title: "New link", url: "https://", tags: [] }); },
      },
      {
        type: "action",
        label: "Open Capture",
        run: async () => {
          window.location.href = "/capture";
        },
      },
    ];

    return [
      ...routeMatches.map((r) => ({ type: "route" as const, label: r.label, href: r.href })),
      ...appMatches.map((item) => ({ type: "app" as const, item })),
      ...lifeMatches.map((item) => ({ type: "life" as const, item })),
      ...actionMatches,
    ];
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-600 shadow-sm hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
        aria-label="Search (Ctrl+K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <span className="text-xs text-neutral-400">Ctrl+K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-12">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <Command
              label="Global search"
              shouldFilter={false}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            >
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Search className="h-4 w-4 text-neutral-500" />
                <CommandInput
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search apps, life areas, routes..."
                  className="w-full bg-transparent text-sm outline-none"
                  autoFocus
                />
              </div>
              <CommandList className="max-h-[420px] overflow-y-auto">
                <CommandEmpty className="px-4 py-3 text-sm text-neutral-600">
                  No results.
                </CommandEmpty>
                <CommandGroup heading="Routes">
                  {results
                    .filter((r): r is Extract<Result, { type: "route" }> => r.type === "route")
                    .map((r) => (
                      <CommandItem key={r.href} onSelect={() => setOpen(false)} asChild>
                        <Link href={r.href} className="flex items-center gap-2 px-4 py-2">
                          <Home className="h-4 w-4 text-neutral-500" />
                          <span>{r.label}</span>
                        </Link>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Apps & Games">
                  {results
                    .filter((r): r is Extract<Result, { type: "app" }> => r.type === "app")
                    .map((r) => (
                      <CommandItem key={r.item.id} onSelect={() => setOpen(false)} asChild>
                        <a
                          href={r.item.primaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <AppWindow className="h-4 w-4 text-neutral-500" />
                          <span>{r.item.name}</span>
                          <span className="text-xs text-neutral-500">{r.item.category}</span>
                        </a>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Life Areas">
                  {results
                    .filter((r): r is Extract<Result, { type: "life" }> => r.type === "life")
                    .map((r) => (
                      <CommandItem
                        key={r.item.slug}
                        onSelect={() => {
                          router.push(`/life/${r.item.slug}`);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2"
                      >
                        <Layers className="h-4 w-4 text-neutral-500" />
                        <span>{r.item.title}</span>
                        <span className="text-xs text-neutral-500">
                          {r.item.tags.slice(0, 2).join(", ")}
                        </span>
                        <button
                          type="button"
                          className="ml-auto text-xs underline"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (pinned.includes(r.item.slug)) {
                              await removePin(r.item.slug);
                            } else {
                              await addPin(r.item.slug);
                            }
                            setPinned(await loadPinnedLife());
                          }}
                        >
                          {pinned.includes(r.item.slug) ? "Unpin" : "Pin"}
                        </button>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Actions">
                  {results
                    .filter((r): r is Extract<Result, { type: "action" }> => r.type === "action")
                    .map((r) => (
                      <CommandItem
                        key={r.label}
                        onSelect={async () => {
                          await r.run();
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2"
                      >
                        <Plus className="h-4 w-4 text-neutral-500" />
                        <span>{r.label}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
