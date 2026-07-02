import fs from "fs";
import path from "path";
import { CatalogItem } from "@/data/apps";

const KNOWN_EXCLUDES = new Set([".git", "node_modules", "JoshHub", "public", ".next"]);

function findIndexFileIn(dir: string): string | null {
  const candidates = [
    "index.html",
    path.join("dist", "index.html"),
    path.join("build", "index.html"),
    path.join("public", "index.html"),
    path.join("client", "index.html"),
  ];
  for (const c of candidates) {
    const p = path.join(dir, c);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }

  // check one level deep (e.g., Dinner-Decider/Dinner-Decider/client/index.html)
  try {
    const subents = fs.readdirSync(dir, { withFileTypes: true });
    for (const s of subents) {
      if (!s.isDirectory()) continue;
      const p = path.join(dir, s.name);
      for (const c of candidates) {
        const candidatePath = path.join(p, c);
        if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) return candidatePath;
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function discoverExternalApps(): Promise<CatalogItem[]> {
  const cwd = process.cwd();
  const workspaceRoot = path.resolve(cwd, "..");
  let entries: CatalogItem[] = [];
  try {
    const dirents = fs.readdirSync(workspaceRoot, { withFileTypes: true });
    for (const d of dirents) {
      if (!d.isDirectory()) continue;
      if (KNOWN_EXCLUDES.has(d.name)) continue;
      const projectPath = path.join(workspaceRoot, d.name);
      const indexPath = findIndexFileIn(projectPath);
      if (!indexPath) continue;

      // If this project looks like the Neverwinter workspace, point it to the fixed local build
      const lower = d.name.toLowerCase();
      const isNeverwinter = lower.includes("neverwinter");
      const isDinnerDecider = lower === "dinner-decider";
      const item: CatalogItem = {
        id: `external-${d.name}`,
        name: d.name,
        type: "app",
        category: "Games",
        status: "ok",
        tags: ["external", "workspace"],
        primaryUrl: isNeverwinter
          ? "/games/neverwinter-tales/index.html"
          : isDinnerDecider
            ? "/games/dinner-decider/index.html"
            : `/external/${encodeURIComponent(d.name)}/`,
        urls: isNeverwinter
          ? [{ label: "Local (fixed)", url: "/games/neverwinter-tales/index.html" }]
          : isDinnerDecider
            ? [{ label: "Play (Local)", url: "/games/dinner-decider/index.html" }]
            : [{ label: "Local", url: `/external/${encodeURIComponent(d.name)}/` }],
      };
      entries.push(item);
    }
  } catch (e) {
    // ignore
  }
  return entries;
}
