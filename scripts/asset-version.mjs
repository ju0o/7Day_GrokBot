// Source-derived asset version. Hash = sha256 over the runtime files with every `?v=<token>`
// normalized to `?v=` (so the version token itself never feeds back into the hash — non-circular).
// Usage: node scripts/asset-version.mjs --check | --write
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
export const FILES = ['index.html', 'app.js', 'engine.mjs', 'keys.mjs', 'store.mjs', 'style.css'];
export const TOKEN = /\?v=[\w-]*/g;
export const normalize = (text) => text.replace(TOKEN, '?v=');
export function computeVersion(contents /* {name: text} */) {
  const h = createHash('sha256');
  for (const f of FILES) { h.update(f + '\0'); h.update(normalize(contents[f] ?? '')); h.update('\0'); }
  return h.digest('hex').slice(0, 12);
}
export function tokensIn(text) { return [...text.matchAll(/\?v=([\w-]*)/g)].map((m) => m[1]); }
export function checkContents(contents) {
  const expected = computeVersion(contents);
  const found = [...tokensIn(contents['index.html'] ?? ''), ...tokensIn(contents['app.js'] ?? '')];
  const problems = [];
  if (found.length < 5) problems.push(`expected >=5 version tokens, found ${found.length}`);
  for (const t of found) if (t !== expected) problems.push(`stale token ${t} (expected ${expected})`);
  return { expected, found, ok: problems.length === 0, problems };
}
const ROOT = new URL('../public/', import.meta.url);
export async function loadPublic(root = ROOT) {
  const out = {};
  for (const f of FILES) out[f] = await readFile(new URL(f, root), 'utf8');
  return out;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const c = await loadPublic();
  const r = checkContents(c);
  if (process.argv.includes('--write')) {
    for (const f of ['index.html', 'app.js']) await writeFile(new URL(f, ROOT), c[f].replace(TOKEN, '?v=' + r.expected));
    console.log('asset version written:', r.expected);
  } else if (r.ok) console.log('asset version OK:', r.expected);
  else { console.error('asset version mismatch:\n- ' + r.problems.join('\n- ') + '\nRun: npm run version:write'); process.exit(1); }
}
