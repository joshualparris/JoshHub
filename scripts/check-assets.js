#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const appsFile = path.join(repoRoot, 'src', 'data', 'apps.ts');
const publicDir = path.join(repoRoot, 'public');

if (!fs.existsSync(appsFile)) {
    console.error('Could not find apps file at', appsFile);
    process.exit(2);
}

const content = fs.readFileSync(appsFile, 'utf8');

// Find occurrences of "/games/..." or "/docs/..." inside the apps file
const re = /["'`]((?:\/games|\/docs)\/[^"'`\s]+)["'`]/gi;
const matches = new Set();
let m;
while ((m = re.exec(content))) {
    matches.add(m[1]);
}

const results = [];
for (const rel of [...matches].sort()) {
    const p = path.join(publicDir, rel.replace(/^\//, ''));
    const exists = fs.existsSync(p);
    results.push({ path: rel, publicPath: p, exists });
}

const missing = results.filter(r => !r.exists);

console.log('\nFound', results.length, 'local asset candidates from apps.ts');
if (missing.length === 0) {
    console.log('All local /games and /docs assets referenced in apps.ts exist under public/.');
    process.exit(0);
}

console.log('\nMissing assets (public/) — you can copy builds into public/ or update apps.ts to point elsewhere:');
for (const mItem of missing) {
    console.log('- ', mItem.path, '-> expected at', mItem.publicPath);
}

console.log('\nSummary:');
console.log('  Total referenced:', results.length);
console.log('  Missing:', missing.length);

process.exit(missing.length > 0 ? 1 : 0);
