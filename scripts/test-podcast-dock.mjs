import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
await import(path.join(root, 'public', 'podcast-dock.js'));
const core = globalThis.JoshPodcastDockCore;
assert.ok(core, 'Podcast dock core should export its pure helpers');

const topics = ['it','software','research','faith','relationships','career','decision','homelab','horses'];
for (const topic of topics) {
  const entries = JSON.parse(fs.readFileSync(path.join(root, 'public', 'podcasts', `${topic}.json`), 'utf8'));
  const valid = core.normaliseEpisodes(entries);
  assert.equal(valid.length, 25, `${topic} should have 25 valid episodes`);
  assert.equal(new Set(valid.map((episode) => episode.id)).size, valid.length, `${topic} IDs should be unique`);
  const first = valid[0];
  const next = core.pickNext(valid, first.id, [], [], () => 0);
  assert.notEqual(next.id, first.id, `${topic} should avoid an immediate repeat`);
  const recent = valid.slice(0, 6).map((episode) => episode.id);
  const afterRecent = core.pickNext(valid, recent[0], recent, [], () => 0);
  assert.ok(!recent.includes(afterRecent.id), `${topic} should avoid recent episodes while alternatives exist`);
}

const malformed = [{id:'bad',title:'Bad',show:'Bad'}, null, {id:'5wGPapGp6mo71b4FYA3wBO',title:'Good',show:'Good'}];
assert.equal(core.normaliseEpisodes(malformed).length, 1, 'Malformed entries should be ignored');

const memory = new Map();
const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
const state = {currentByTopic:{it:'abc'}, recentByTopic:{it:['abc']}, favourites:['abc'], lastTopic:'it', enabled:true};
assert.equal(core.writeState(storage, state), true, 'State should persist');
assert.deepEqual(core.readState(storage), state, 'Persisted state should round-trip');

memory.set('josh-podcast-dock/v1', JSON.stringify({currentByTopic:{},recentByTopic:{},favourites:[],lastTopic:'faith',enabled:false}));
assert.equal(core.readState(storage).enabled, false, 'Disabled player preference should persist');

const source = fs.readFileSync(path.join(root, 'public', 'podcast-dock.js'), 'utf8');
assert.match(source, /@media\(max-width:640px\)/, 'Dock should include a mobile layout');
assert.match(source, /aria-label/, 'Dock should include accessible labels');
assert.match(source, /prefers-reduced-motion/, 'Dock should respect reduced-motion preferences');
assert.match(source, /paddingBottom/, 'Dock should reserve document space instead of obscuring bottom content');
assert.match(source, /Podcast settings/, 'Dock should expose a podcast settings surface');
assert.match(source, /data-jpd-enabled-control/, 'Settings pages should be able to expose the on/off control');

console.log('Josh Podcast Dock contract tests passed for 9 topics / 225 episodes.');
