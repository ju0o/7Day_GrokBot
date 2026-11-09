import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { computeVersion, checkContents, loadPublic, FILES } from '../scripts/asset-version.mjs';
const real = await loadPublic();
test('committed public files carry the source-derived version', () => {
  const r = checkContents(real);
  assert.deepEqual(r.problems, []);
  assert.equal(r.found.length, 5);
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
  const retok = Object.fromEntries(Object.entries(real).map(([k, t]) => [k, t.replace(/\?v=[\w-]*/g, '?v=OLD')]));
  assert.equal(computeVersion(retok), v);
  assert.equal(checkContents(retok).ok, false); // OLD tokens are flagged
});
test('mixed tokens and missing tokens are flagged', () => {
  const mixed = { ...real, 'app.js': real['app.js'].replace(/\?v=[\w-]*/, '?v=deadbeef') };
  assert.equal(checkContents(mixed).ok, false);
  const none = { ...real, 'index.html': real['index.html'].replace(/\?v=[\w-]*/g, '') };
  assert.match(checkContents(none).problems.join(), /found 3/);
});
test('resource graph: every public runtime file is covered by the hash', async () => {
  const files = (await readdir(new URL('../public/', import.meta.url))).sort();
  assert.deepEqual(files, [...FILES].sort());
  for (const f of ['engine.mjs', 'keys.mjs', 'store.mjs']) assert.doesNotMatch(real[f], /^\s*import\s/m, f + ' must stay leaf module');
});
