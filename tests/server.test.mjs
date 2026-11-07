import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../scripts/server.mjs';
const srv = createAppServer();
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;
test.after(() => srv.close());
test('serves index and module MIME', async () => {
  let r = await fetch(base + '/'); assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /text\/html/);
  assert.match(await r.text(), /잔상 항로/);
  r = await fetch(base + '/engine.mjs'); assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /javascript/);
});
test('HEAD has no body; POST rejected', async () => {
  let r = await fetch(base + '/style.css', { method: 'HEAD' }); assert.equal(r.status, 200); assert.equal((await r.text()).length, 0);
  r = await fetch(base + '/', { method: 'POST' }); assert.equal(r.status, 405);
});
test('blocks traversal and missing files', async () => {
  for (const p of ['/..%2fpackage.json', '/%2e%2e/%2e%2e/etc/passwd', '/..%5cpackage.json']) {
    const r = await fetch(base + p); assert.ok([403, 404].includes(r.status), p + ' ' + r.status);
  }
  assert.equal((await fetch(base + '/nope.js')).status, 404);
  assert.equal((await fetch(base + '/%E0%A4%A')).status, 400);
});
