const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const srcMap = path.join(repoRoot, '..', 'Games', 'AAGAMEADVENTURE', 'AAGAMEADVENTURE', 'src', 'data', 'maps', 'tutorial.v1.json');
const publicMap = path.join(repoRoot, 'public', 'src', 'data', 'maps', 'tutorial.v1.json');

function readMap(p) {
    if (!fs.existsSync(p)) return null;
    try {
        const txt = fs.readFileSync(p, 'utf8');
        return JSON.parse(txt);
    } catch (e) {
        return { error: String(e) };
    }
}

const s = readMap(srcMap);
const pub = readMap(publicMap);

console.log('Source map:', srcMap, 'exists?', !!s);
if (s && !s.error) console.log('  version', s.version, 'id', s.id, 'w*h', s.width, '*', s.height, '=', (s.width || 0) * (s.height || 0), 'tiles.length', (s.tiles && s.tiles.length));
else console.log('  error reading source map:', s && s.error);

console.log('Public map:', publicMap, 'exists?', !!pub);
if (pub && !pub.error) console.log('  version', pub.version, 'id', pub.id, 'w*h', pub.width, '*', pub.height, '=', (pub.width || 0) * (pub.height || 0), 'tiles.length', (pub.tiles && pub.tiles.length));
else console.log('  error reading public map:', pub && pub.error);

if (s && pub && !s.error && !pub.error) {
    const eq = JSON.stringify(s) === JSON.stringify(pub);
    console.log('Maps identical JSON:', eq);
}

process.exit(0);
