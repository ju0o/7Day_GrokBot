import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(fileURLToPath(new URL('../public', import.meta.url)));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
export function createAppServer(root = ROOT) {
  return createServer(async (req, res) => {
    const headers = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' };
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); return res.end(); }
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400, headers); return res.end(); }
    if (p.includes('\0')) { res.writeHead(400, headers); return res.end(); }
    if (p.endsWith('/')) p += 'index.html';
    const file = resolve(join(root, normalize(p)));
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403, headers); return res.end(); }
    try {
      if (!(await stat(file)).isFile()) throw 0;
      const body = await readFile(file);
      res.writeHead(200, { ...headers, 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end(req.method === 'HEAD' ? undefined : 'Not found'); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 4278, host = process.env.HOST || '127.0.0.1';
  createAppServer().listen(port, host, () => console.log(`Afterimage Route: http://${host}:${port}/`));
}
