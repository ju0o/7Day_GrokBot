import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
test('root entry redirects to public/ and preserves hash seed', () => {
  const m = html.match(/location\.replace\(([^)]*)\)/);
  assert.ok(m);
  const location = { hash: '#seed=day1-check' };
  assert.equal(new Function('location', `return ${m[1]};`)(location), 'public/#seed=day1-check');
  assert.match(html, /href="public\/"/);
  assert.doesNotMatch(html, /https?:\/\//);
});
test('public app uses only relative assets', async () => {
  const app = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /(src|href)="(https?:)?\/\//);
  assert.match(app, /src="app\.js(\?v=[\w-]+)?"/);
});
test('cache-busting version is consistent across html and module imports (avoids stale mixed modules)', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  const v = html.match(/app\.js\?v=([\w-]+)/)[1];
  assert.match(html, new RegExp(`style\\.css\\?v=${v}"`));
  const imports = [...app.matchAll(/from '\.\/([\w.]+)\?v=([\w-]+)'/g)];
  assert.equal(imports.length, 4);
  for (const m of imports) assert.equal(m[2], v, m[1]);
});
