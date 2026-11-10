import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { shouldPromptUpdate, UPDATE_MESSAGE } from '../public/update.mjs';
test('update prompt only when a new worker is ready and the page is already controlled', () => {
  assert.equal(shouldPromptUpdate({ hasController: false, workerReady: true }), false); // first install
  assert.equal(shouldPromptUpdate({ hasController: true, workerReady: false }), false);
  assert.equal(shouldPromptUpdate({ hasController: true, workerReady: true }), true);
  assert.equal(shouldPromptUpdate({}), false);
  assert.match(UPDATE_MESSAGE, /새 버전/);
});
test('banner markup and new-version button exist; CSS hides [hidden]', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /id="update-banner"[^>]*hidden/);
  assert.match(html, /id="reload-update"[^>]*>새 버전 열기/);
  const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.update\[hidden\]\s*\{\s*display\s*:\s*none/);
});
test('MIN_BEST_MS still 100 after this change', async () => {
  const { MIN_BEST_MS } = await import('../public/engine.mjs');
  assert.equal(MIN_BEST_MS, 100);
});
