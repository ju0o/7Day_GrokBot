import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { computeVersion, checkContents, loadPublic, FILES, renderServiceWorker, checkServiceWorker, PRECACHE_ASSETS } from '../scripts/asset-version.mjs';
const real = await loadPublic();
test('committed public files carry the source-derived version', () => {
  const r = checkContents(real);
  assert.deepEqual(r.problems, []);
  assert.equal(r.found.length, 6);
});
test('any runtime content change without re-versioning is detected as stale', () => {
  for (const f of FILES) {
    const changed = { ...real, [f]: real[f] + '\n/* edit */' };
    assert.notEqual(computeVersion(changed), computeVersion(real), f);
    assert.equal(checkContents(changed).ok, false, f);
  }
});
test('version is non-circular: rewriting only tokens keeps the hash stable', () => {
  const v = computeVersion(real);
  const retok = Object.fromEntries(Object.entries(real).filter(([k]) => k !== 'sw.js').map(([k, t]) => [k, t.replace(/\?v=[\w-]*/g, '?v=OLD')]));
  assert.equal(computeVersion(retok), v);
  assert.equal(checkContents(retok).ok, false);
});
test('mixed tokens and missing tokens are flagged', () => {
  const mixed = { ...real, 'app.js': real['app.js'].replace(/\?v=[\w-]*/, '?v=deadbeef') };
  assert.equal(checkContents(mixed).ok, false);
  const none = { ...real, 'index.html': real['index.html'].replace(/\?v=[\w-]*/g, '') };
  assert.match(checkContents(none).problems.join(), /found 4/);
});
test('resource graph: every hashed runtime file exists; sw.js is generated not hashed', async () => {
  const files = new Set(await readdir(new URL('../public/', import.meta.url)));
  for (const f of FILES) assert.ok(files.has(f), f);
  for (const f of ['engine.mjs', 'keys.mjs', 'store.mjs']) assert.doesNotMatch(real[f], /^\s*import\s/m, f + ' must stay leaf module');
});
test('generated service worker precaches every runtime asset at the content version', () => {
  const v = computeVersion(real);
  const sw = renderServiceWorker(v);
  assert.equal(checkServiceWorker(sw, v), true);
  assert.equal(checkServiceWorker(sw + ' ', v), false);
  assert.equal(checkServiceWorker(renderServiceWorker('deadbeef'), v), false);
  assert.match(sw, /\.\/"/); // "./"
  assert.match(sw, /"\.\/index\.html"/);
  for (const f of PRECACHE_ASSETS) {
    if (f === 'index.html') continue;
    assert.ok(sw.includes(`"./${f}?v=${v}"`), f);
  }
});
test('committed sw.js matches the source-derived version (or is generated on write)', () => {
  const r = checkContents(real);
  assert.equal(r.ok, true);
  if (real['sw.js']) assert.equal(checkServiceWorker(real['sw.js'], r.expected), true);
});
test('MIN_BEST_MS scoring rule is unchanged at 100', async () => {
  const { MIN_BEST_MS } = await import('../public/engine.mjs');
  assert.equal(MIN_BEST_MS, 100);
});
