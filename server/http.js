// Minimal HTTP helpers: JSON responses, bounded body reading, cookies.
import { config } from './config.js';

export function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body), ...extraHeaders });
  res.end(body);
}
export const fail = (res, status, error, extra = {}) => sendJson(res, status, { ok: false, error, ...extra });

export function readJson(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const type = String(req.headers['content-type'] || '').split(';')[0].trim();
    if (type !== 'application/json') return reject(Object.assign(new Error('Send JSON.'), { status: 415 }));
    const declared = Number(req.headers['content-length'] || 0);
    if (declared > limitBytes) return reject(Object.assign(new Error('Request is too large.'), { status: 413 }));
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limitBytes) { reject(Object.assign(new Error('Request is too large.'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { const v = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); if (!v || typeof v !== 'object' || Array.isArray(v)) throw 0; resolve(v); } catch { reject(Object.assign(new Error('Invalid JSON.'), { status: 400 })); } });
    req.on('error', () => reject(Object.assign(new Error('Read error.'), { status: 400 })));
  });
}

export function parseCookies(req) {
  const out = {}; const h = req.headers.cookie; if (!h) return out;
  for (const part of h.split(';')) { const i = part.indexOf('='); if (i > 0) { const k = part.slice(0, i).trim(); if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim()); } }
  return out;
}
export const SESSION_COOKIE = config.isProd ? '__Host-ma3ak_sid' : 'ma3ak_sid';
export function sessionCookie(value, maxAgeSec) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}${config.isProd ? '; Secure' : ''}`;
}
