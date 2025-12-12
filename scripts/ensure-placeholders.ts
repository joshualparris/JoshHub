import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { apps } from '../src/data/apps';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const reportDir = path.join(repoRoot, 'reports');

type NormalizedTarget = {
  sourceUrl: string;
  targetPath: string;
};

const placeholderMarker = '<!-- joshhub-placeholder -->';

function normalizeUrlToPath(raw: string): NormalizedTarget | null {
  if (!raw || raw.trim() === '') return null;
  if (!raw.startsWith('/')) return null;

  const url = new URL(raw, 'http://local');
  const pathname = url.pathname;

  let filePath = pathname;
  const hasExt = path.extname(pathname) !== '';
  if (!hasExt) {
    filePath = pathname.endsWith('/') ? path.join(pathname, 'index.html') : path.join(pathname, 'index.html');
  }

  const targetPath = path.join(publicDir, filePath);
  return { sourceUrl: raw, targetPath };
}

function ensureDirExists(filePath: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function createPlaceholder(filePath: string, sourceUrl: string) {
  ensureDirExists(filePath);
  const title = `Placeholder for ${sourceUrl}`;
  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0b10; color: #e4e4e7; padding: 24px; }
    .card { max-width: 720px; background: #111118; border: 1px solid #27272a; border-radius: 12px; padding: 24px; box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
    a { color: #a5b4fc; }
  </style>
</head>
<body>
  <div class="card">
    <p>${placeholderMarker}</p>
    <h1>${title}</h1>
    <p>This page is a placeholder. The real build is not deployed yet.</p>
    <p><strong>Path:</strong> ${sourceUrl}</p>
    <p><a href="/apps">Back to Apps catalogue</a></p>
  </div>
</body>
</html>`;
  fs.writeFileSync(filePath, body, 'utf-8');
}

function getCommitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

function ensureBuildInfo(targets: NormalizedTarget[]) {
  const infoPath = path.join(publicDir, 'build-info.json');
  const payload = {
    commit: getCommitSha(),
    builtAt: new Date().toISOString(),
    placeholderTargets: targets.map((t) => path.relative(publicDir, t.targetPath)),
  };
  ensureDirExists(infoPath);
  fs.writeFileSync(infoPath, JSON.stringify(payload, null, 2), 'utf-8');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
}

function main() {
  const targets: NormalizedTarget[] = [];
  for (const app of apps) {
    const urls = [app.primaryUrl, ...(app.urls ?? []).map((u) => u.url)];
    for (const raw of urls) {
      if (!raw) continue;
      const normalized = normalizeUrlToPath(raw);
      if (!normalized) continue;
      const { targetPath } = normalized;
      if (!targets.find((t) => t.targetPath === targetPath)) {
        targets.push(normalized);
      }
    }
  }

  let created = 0;
  let skipped = 0;
  for (const target of targets) {
    if (fs.existsSync(target.targetPath)) {
      skipped += 1;
      continue;
    }
    createPlaceholder(target.targetPath, target.sourceUrl);
    created += 1;
  }

  ensureBuildInfo(targets);

  console.log(`Placeholders ensured. Created: ${created}, existing: ${skipped}, total: ${targets.length}`);
}

main();
