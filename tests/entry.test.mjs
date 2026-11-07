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
  assert.match(app, /src="app\.js"/);
});
