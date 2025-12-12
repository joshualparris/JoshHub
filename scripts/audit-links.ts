import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps } from '../src/data/apps';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const reportDir = path.join(repoRoot, 'reports');

const hasExt = (p: string) => Boolean(path.extname(p));

function resolvePublicPath(urlPath: string) {
  const pathname = new URL(urlPath, 'http://local').pathname;
  let p = path.join(publicDir, pathname);
  if (!hasExt(pathname)) {
    p = path.join(publicDir, pathname, 'index.html');
  }
  return p;
}

function classifyUrl(rawUrl: string) {
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return { kind: 'external' as const, url: rawUrl };
  }
  if (rawUrl.startsWith('/')) {
    const pathname = new URL(rawUrl, 'http://local').pathname;
    if (pathname.startsWith('/games/') || pathname.startsWith('/docs/') || pathname.startsWith('/panos/') || pathname.startsWith('/textures/')) {
      return { kind: 'static' as const, url: rawUrl, fsPath: resolvePublicPath(rawUrl) };
    }
    return { kind: 'route' as const, url: rawUrl };
  }
  return { kind: 'other' as const, url: rawUrl };
}

function ensureReportDir() {
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
}

type Result = {
  appId: string;
  appName: string;
  url: string;
  kind: 'static' | 'route' | 'external' | 'other';
  status: 'ok' | 'missing' | 'skipped';
  note?: string;
};

const results: Result[] = [];

for (const app of apps) {
  const links = [app.primaryUrl, ...(app.urls ?? []).map((u) => u.url)];
  for (const url of links) {
    const entry = classifyUrl(url);
    if (entry.kind === 'static') {
      const exists = fs.existsSync(entry.fsPath);
      results.push({ appId: app.id, appName: app.name, url, kind: 'static', status: exists ? 'ok' : 'missing', note: exists ? undefined : `Missing file: ${path.relative(repoRoot, entry.fsPath)}` });
    } else if (entry.kind === 'route') {
      results.push({ appId: app.id, appName: app.name, url, kind: 'route', status: 'skipped', note: 'Route check skipped (handled by Next)' });
    } else if (entry.kind === 'external') {
      results.push({ appId: app.id, appName: app.name, url, kind: 'external', status: 'skipped', note: 'External link not validated' });
    } else {
      results.push({ appId: app.id, appName: app.name, url, kind: 'other', status: 'skipped', note: 'Unclassified link' });
    }
  }
}

ensureReportDir();
fs.writeFileSync(path.join(reportDir, 'link-audit.json'), JSON.stringify(results, null, 2));

const mdLines = [
  '# Link Audit',
  '',
  '| App | URL | Kind | Status | Note |',
  '| --- | --- | --- | --- | --- |',
];
for (const r of results) {
  mdLines.push(`| ${r.appName} | ${r.url} | ${r.kind} | ${r.status} | ${r.note ?? ''} |`);
}
fs.writeFileSync(path.join(reportDir, 'link-audit.md'), mdLines.join('\n'));

const missing = results.filter((r) => r.kind === 'static' && r.status === 'missing');
if (missing.length) {
  console.error('Missing internal assets:', missing.map((m) => `${m.appId}: ${m.note}`).join('\n'));
  process.exit(1);
}

console.log('Link audit complete. Reports saved to reports/link-audit.{json,md}');