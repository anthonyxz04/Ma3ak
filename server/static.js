// Static file server: precompressed, cached, path-traversal safe, only files under /public.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { config } from './config.js';
import { securityHeaders } from './security.js';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
const cache = new Map();

function load(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const root = config.publicDir, abs = path.resolve(root, '.' + rel);
  if (!abs.startsWith(root + path.sep)) return null;
  let st; try { st = fs.statSync(abs); } catch { return null; }
  if (!st.isFile()) return null;
  const ext = path.extname(abs).toLowerCase(), type = TYPES[ext]; if (!type) return null;
  const body = fs.readFileSync(abs), text = /text|javascript|json|svg|xml/.test(type);
  const entry = { body, gz: text && body.length > 1024 ? zlib.gzipSync(body, { level: 9 }) : null, type, etag: '"' + crypto.createHash('sha1').update(body).digest('base64url').slice(0, 20) + '"', html: ext === '.html' };
  if (config.isProd) cache.set(rel, entry);
  return entry;
}

export function serveStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  let rel = decodeURIComponent(pathname);
  if (rel.includes('\0') || rel.includes('..')) return false;
  if (rel === '/admin') { res.writeHead(301, { Location: '/admin/' }); res.end(); return true; }
  if (rel.endsWith('/')) rel += 'index.html';
  const f = load(rel); if (!f) return false;
  securityHeaders(res, rel.startsWith('/admin/') ? 'admin' : 'site');
  const headers = { 'Content-Type': f.type, ETag: f.etag, 'Cache-Control': f.html ? 'no-cache' : (/[?&]v=/.test(req.url) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600'), Vary: 'Accept-Encoding' };
  if (rel.startsWith('/admin/')) headers['X-Robots-Tag'] = 'noindex, nofollow';
  if (req.headers['if-none-match'] === f.etag) { res.writeHead(304, headers); res.end(); return true; }
  const gz = f.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  const body = gz ? f.gz : f.body; if (gz) headers['Content-Encoding'] = 'gzip';
  headers['Content-Length'] = body.length; res.writeHead(200, headers); res.end(req.method === 'HEAD' ? undefined : body);
  return true;
}
