// Security primitives: headers, rate limiting, password hashing, tokens, origin checks.
import crypto from 'node:crypto';
import { config } from './config.js';

const CSP_SITE = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'none'",
  "manifest-src 'self'",
].join('; ');
const CSP_ADMIN = CSP_SITE.replace("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "style-src 'self'").replace("font-src 'self' https://fonts.gstatic.com", "font-src 'self'");

export function securityHeaders(res, kind = 'site') {
  res.setHeader('Content-Security-Policy', (kind === 'admin' ? CSP_ADMIN : kind === 'file' ? "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" : CSP_SITE) + (config.isProd ? '; upgrade-insecure-requests' : ''));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  if (config.isProd) res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}

// ---------- client IP (only trust proxy headers when configured) ----------
export function clientIp(req) {
  if (config.trustProxy) {
    const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (xf) return xf;
  }
  return req.socket.remoteAddress || 'unknown';
}
export const ipHash = ip => crypto.createHmac('sha256', config.sessionSecret).update(ip).digest('hex').slice(0, 32);

// ---------- fixed-window rate limiter ----------
// Stored in the database so every server instance (each warm Netlify Function) shares the same counts.
// Falls back to memory if the database is unreachable, so a DB hiccup never disables protection.
let rlDb = null;
export const useRateLimitStore = db => { rlDb = db; };
const buckets = new Map();
function memoryLimit(key, limit, windowMs, t) {
  let b = buckets.get(key);
  if (!b || t > b.reset) { b = { count: 0, reset: t + windowMs }; buckets.set(key, b); }
  b.count++;
  if (buckets.size > 5000) for (const [k, x] of buckets) if (t > x.reset) buckets.delete(k);
  return { ok: b.count <= limit, retryAfter: Math.ceil((b.reset - t) / 1000) };
}
export async function rateLimit(key, limit, windowMs) {
  const t = Date.now(), k = String(key).slice(0, 200);
  if (rlDb) {
    try {
      const r = await rlDb.get(`INSERT INTO rate_limits (k, count, reset_at) VALUES (?, 1, ?)
        ON CONFLICT (k) DO UPDATE SET count = CASE WHEN rate_limits.reset_at < ? THEN 1 ELSE rate_limits.count + 1 END,
          reset_at = CASE WHEN rate_limits.reset_at < ? THEN EXCLUDED.reset_at ELSE rate_limits.reset_at END
        RETURNING count, reset_at`, k, t + windowMs, t, t);
      if (Math.random() < 0.01) rlDb.run('DELETE FROM rate_limits WHERE reset_at < ?', t - 864e5).catch(() => {});
      return { ok: r.count <= limit, retryAfter: Math.max(1, Math.ceil((r.reset_at - t) / 1000)) };
    } catch { console.warn('rateLimit: database unavailable, using memory'); }
  }
  return memoryLimit(k, limit, windowMs, t);
}

// ---------- passwords (scrypt, per-user salt) ----------
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw.normalize('NFKC'), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}
export function verifyPassword(pw, stored) {
  try {
    const [alg, N, r, p, salt, key] = String(stored).split('$');
    if (alg !== 'scrypt') return false;
    const expected = Buffer.from(key, 'base64');
    const got = crypto.scryptSync(pw.normalize('NFKC'), Buffer.from(salt, 'base64'), expected.length, { N: +N, r: +r, p: +p, maxmem: SCRYPT.maxmem });
    return crypto.timingSafeEqual(got, expected);
  } catch { return false; }
}
// Burn comparable time when the account does not exist (prevents user enumeration by timing).
const DUMMY = hashPassword(crypto.randomBytes(12).toString('hex'));
export const dummyVerify = pw => verifyPassword(pw, DUMMY);

export function passwordProblems(pw) {
  if (typeof pw !== 'string' || pw.length < 12) return 'Use at least 12 characters.';
  if (pw.length > 200) return 'Password is too long.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Use letters and numbers.';
  return null;
}

// ---------- tokens ----------
export const token = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
export const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
export function safeEqual(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }
export function newRef(prefix = 'MA3') {
  const d = new Date(), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', rnd = crypto.randomBytes(6);
  let s = ''; for (const b of rnd) s += A[b % A.length];
  return `${prefix}-${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}-${s}`;
}

// ---------- same-origin check for state-changing requests ----------
export function originAllowed(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin) return !config.isProd; // browsers always send Origin on POST/PATCH/DELETE fetches
  const o = origin.replace(/\/$/, '');
  if (config.allowedOrigins.includes(o)) return true;
  // Same host as the request (covers Netlify deploy previews). Browsers never let a page forge Origin.
  return o === `https://${host}` || (!config.isProd && o === `http://${host}`);
}
