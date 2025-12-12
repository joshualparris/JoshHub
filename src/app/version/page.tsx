
import fs from "node:fs";
import path from "node:path";

interface BuildInfo {
  commit: string;
  builtAt: string;
  placeholderTargets?: string[];
}

function readBuildInfo(): BuildInfo | null {
  try {
    const filePath = path.join(process.cwd(), 'public', 'build-info.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as BuildInfo;
  } catch (err) {
    console.warn('No build-info.json found', err);
    return null;
  }
}

const WATCH_PATHS = [
  '/games/amodule-dnd/index.html',
  '/games/dnd-spider-queen/index.html',
  '/games/midnight-line/index.html',
  '/games/null-v2/index.html',
  '/games/wilds-sail-west/index.html',
  '/games/wilds-main/index.html',
  '/games/wilds-2/index.html',
];

export const metadata = {
  title: 'JoshHub | Version',
};

export default function VersionPage() {
  const info = readBuildInfo();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || info?.commit || 'unknown';
  const builtAt = info?.builtAt || 'unknown';

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 text-foreground">
      <h1 className="text-2xl font-semibold">Build Version</h1>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Commit</p>
        <p className="font-mono text-sm">{commit}</p>
        <p className="text-sm text-muted-foreground mt-3">Built at</p>
        <p className="font-mono text-sm">{builtAt}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Watched placeholders</h2>
        <p className="text-sm text-muted-foreground">These paths should return 200 in production.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {WATCH_PATHS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      {info?.placeholderTargets && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Generated placeholders</h2>
          <p className="text-sm text-muted-foreground">From build-info.json</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {info.placeholderTargets.map((p) => (
              <li key={p}>{`/${p}`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
