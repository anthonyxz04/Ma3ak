// Local server for development and tests: the same API as production plus the static website.
// Production runs on Netlify (static files on the CDN, the API as a Netlify Function).
// Needs DATABASE_URL pointing at a Postgres database; migrations are applied automatically.
import http from 'node:http';
import { config } from './config.js';
import { getApp, cleanup } from './app.js';
import { securityHeaders } from './security.js';
import { serveStatic } from './static.js';

const { db, handle } = await getApp();
const server = http.createServer(async (req, res) => {
  try {
    if (await handle(req, res)) return;
    let path; try { path = new URL(req.url, 'http://local').pathname; } catch { res.writeHead(400); return res.end(); }
    if (serveStatic(req, res, path)) return;
    securityHeaders(res, 'site'); res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found');
  } catch (e) { console.error('Unhandled error:', e && e.message); if (!res.headersSent) { res.writeHead(500); res.end(); } }
});
server.requestTimeout = 30_000; server.headersTimeout = 15_000; server.keepAliveTimeout = 5_000; server.maxHeadersCount = 60;

const daily = () => cleanup(db).catch(e => console.warn('cleanup failed:', e.message));
daily(); setInterval(daily, 864e5).unref();

server.listen(config.port, config.host, () => console.log(`MA3AK listening on http://${config.host}:${config.port}`));
const stop = () => { server.close(() => { db.pool.end?.(); process.exit(0); }); setTimeout(() => process.exit(0), 3000).unref(); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
export { server, db };
