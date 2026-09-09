const fs = require("fs");

const appsPath = "src/data/apps.ts";
let source = fs.readFileSync(appsPath, "utf8");

function replaceRequired(before, after) {
  if (!source.includes(before)) {
    throw new Error(`Expected catalogue fragment not found:\n${before}`);
  }
  source = source.replace(before, after);
}

for (const staleSecondaryPath of [
  "/docs/boundary-road.html",
  "/docs/buckland-blocks-1.html",
  "/docs/buckland-blocks.html",
  "/docs/buckland-tenant-pack.html",
  "/docs/deep-research-index.html",
  "/docs/memoirs-of-joshua.html",
]) {
  const lines = source.split("\n");
  const filtered = lines.filter((line) => !line.includes(staleSecondaryPath));
  if (filtered.length === lines.length) {
    throw new Error(`Expected stale secondary link not found: ${staleSecondaryPath}`);
  }
  source = filtered.join("\n");
}

replaceRequired(
  `    status: "ok",\n    tags: ["family", "planning", "calendar", "playable"],\n    primaryUrl: "/docs/christmas-rotation.html",\n    urls: [{ label: "View", url: "/docs/christmas-rotation.html" }],\n    notes: "Long-range Christmas hosting rotation mapped out to ~2050 (static page).",`,
  `    status: "broken",\n    tags: ["family", "planning", "calendar", "unavailable"],\n    primaryUrl: "/archive",\n    urls: [{ label: "Unavailable", url: "/archive" }],\n    notes: "The previously catalogued local Christmas rotation page is not present in this repository. No live build is currently registered.",`
);

replaceRequired(
  `    status: "ok",\n    tags: ["dubbo", "dcs", "workspace", "local"],\n    primaryUrl: "/docs/ourdcs.html",\n    urls: [{ label: "Status", url: "/docs/ourdcs.html" }],\n    notes: "Local workspace path is currently unavailable; see status page.",`,
  `    status: "broken",\n    tags: ["dubbo", "dcs", "workspace", "unavailable"],\n    primaryUrl: "/archive",\n    urls: [{ label: "Unavailable", url: "/archive" }],\n    notes: "The previously catalogued local OurDCS status page is not present in this repository. No live workspace destination is currently registered.",`
);

replaceRequired(
  `    tags: ["app", "food", "workspace", "local"],\n    primaryUrl: "/games/dinner-decider/index.html",\n    urls: [\n      { label: "Play (Local)", url: "/games/dinner-decider/index.html" },\n      { label: "Open (Workspace)", url: "/external/Dinner-Decider/" },\n    ],\n    notes: "Static build hosted inside JoshHub; workspace app also available via /external/.",`,
  `    tags: ["app", "food", "workspace"],\n    primaryUrl: "/external/Dinner-Decider/",\n    urls: [{ label: "Open (Workspace)", url: "/external/Dinner-Decider/" }],\n    notes: "The local static build is absent; the registered workspace route is the canonical destination.",`
);

replaceRequired(
  `    status: "ok",\n    tags: ["game", "neon", "browser", "threejs", "playable"],\n    primaryUrl: "/games/neon-dash/index.html",\n    urls: [{ label: "Play", url: "/games/neon-dash/index.html" }],\n    notes: "Local Three.js prototype hosted inside JoshHub.",`,
  `    status: "broken",\n    tags: ["game", "neon", "browser", "threejs", "unavailable"],\n    primaryUrl: "/archive",\n    urls: [{ label: "Unavailable", url: "/archive" }],\n    notes: "The previously catalogued local Three.js build is not present in this repository. No playable build is currently registered.",`
);

replaceRequired(
  `    status: "ok",\n    tags: ["game", "serenity", "browser", "playable"],\n    primaryUrl: "/games/serenity-keep-flying/index.html",\n    urls: [{ label: "Play (Local)", url: "/games/serenity-keep-flying/index.html" }],\n    notes: "Local browser build hosted inside JoshHub assets.",`,
  `    status: "broken",\n    tags: ["game", "serenity", "browser", "unavailable"],\n    primaryUrl: "/archive",\n    urls: [{ label: "Unavailable", url: "/archive" }],\n    notes: "The previously catalogued local browser build is not present in this repository. No playable build is currently registered.",`
);

replaceRequired(
  `    status: "ok",\n    tags: ["game", "wilds2", "twine", "browser", "playable"],\n    primaryUrl: "/games/wilds-2/index.html",\n    urls: [{ label: "Play", url: "/games/wilds-2/index.html" }],\n    notes: "Twine v3 export hosted locally for now (Whispering Wilds follow-up).",`,
  `    status: "broken",\n    tags: ["game", "wilds2", "twine", "browser", "unavailable"],\n    primaryUrl: "/archive",\n    urls: [{ label: "Unavailable", url: "/archive" }],\n    notes: "The previously catalogued local Twine export is not present in this repository. No playable build is currently registered.",`
);

fs.writeFileSync(appsPath, source);

const randomPlayPath = "public/games/random-play/links.json";
const randomLinks = JSON.parse(fs.readFileSync(randomPlayPath, "utf8"));
const missingGames = new Set([
  "/games/neon-dash/index.html",
  "/games/serenity-keep-flying/index.html",
  "/games/wilds-2/index.html",
]);
fs.writeFileSync(
  randomPlayPath,
  `${JSON.stringify(randomLinks.filter((link) => !missingGames.has(link)), null, 2)}\n`
);
