// A small dependency-free server for verifying the actual exported production files.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('apps/web/out');
try { await stat(resolve(root, 'index.html')); }
catch { console.error('Static export is missing. Run pnpm build successfully before browser tests.'); process.exit(1); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
const headers = { 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'", 'Referrer-Policy': 'no-referrer' };
createServer(async (request, response) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw new Error('Invalid path');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const data = await readFile(path);
    response.writeHead(200, { ...headers, 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
    response.end(data);
  } catch { response.writeHead(404, headers); response.end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log('DevKit static export: http://127.0.0.1:4173'));
