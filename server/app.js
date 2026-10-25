// The MA3AK API: one router used by the local server (server/index.js) and by the Netlify Function
// (netlify/functions/api.mjs). Handlers use Node-style req/res objects.
import { config, assertConfig } from './config.js';
import { openDb } from './db.js';
import { securityHeaders, hashPassword, passwordProblems, useRateLimitStore } from './security.js';
import { fail } from './http.js';
import { publicRoutes } from './routes-public.js';
import { adminRoutes, adminGuard } from './routes-admin.js';
import { userRoutes } from './users.js';
import { eventRoutes } from './events.js';
import { catalogRoutes } from './catalog.js';
import { aiRoutes } from './ai.js';
import { analyticsRoutes, makeTracker } from './analytics.js';
import { adminPlusRoutes } from './admin-plus.js';
import { planningRoutes } from './planning.js';
import { plannerRoutes } from './planner.js';
import { inviteRoutes } from './invites.js';
import { vendorRoutes } from './vendors.js';
import { siteRoutes } from './site.js';
import { partnerGuard } from './partner.js';
import { bookingRoutes, expireDue, sendReminders } from './bookings.js';
import { billingRoutes } from './billing.js';
import { notificationRoutes, retryEmails } from './notifications.js';
import { removeImage } from './storage.js';

let ready = null;
export function getApp() { return ready || (ready = build().catch(e => { ready = null; throw e; })); }

async function build() {
  assertConfig();
  const db = await openDb();
  if (config.sessionSecret.length < 32) config.sessionSecret = await storedSecret(db, 'session');
  useRateLimitStore(db);
  await firstAdmin(db);
  const track = makeTracker(db), guard = adminGuard(db), partner = partnerGuard(db);
  const routes = { ...publicRoutes, ...adminRoutes(db), ...userRoutes(db, track), ...eventRoutes(db, track), ...plannerRoutes(db, track), ...catalogRoutes(db, guard), ...aiRoutes(db, track),
    ...analyticsRoutes(db, track), ...adminPlusRoutes(db, guard), ...planningRoutes(db), ...inviteRoutes(db, track), ...vendorRoutes(db, guard, partner), ...siteRoutes(db, guard),
    ...bookingRoutes(db, guard, partner), ...billingRoutes(db, guard, partner), ...notificationRoutes(db) };
  const patterns = Object.keys(routes).map(k => { const [method, p] = k.split(' '); return { method, re: new RegExp('^' + p.replace(/:(\w+)/g, '([^/]+)') + '$'), fn: routes[k] }; });
  // Literal paths win over parameter paths (e.g. /api/vendors/... before /api/vendors/:id).
  patterns.sort((a, b) => (a.re.source.includes('([^/]+)') ? 1 : 0) - (b.re.source.includes('([^/]+)') ? 1 : 0));

  async function handle(req, res) {
    let url; try { url = new URL(req.url, 'http://local'); } catch { fail(res, 400, 'Bad request.'); return true; }
    if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/auth/')) return false;
    securityHeaders(res, 'site');
    if (req.url.length > 2048) { fail(res, 414, 'URL too long.'); return true; }
    try {
      for (const r of patterns) { const m = r.re.exec(url.pathname); if (m && r.method === req.method) { await r.fn(req, res, db, url, ...m.slice(1).map(decodeURIComponent)); return true; } }
      fail(res, 404, 'Not found.');
    } catch (e) {
      console.error('Unhandled error:', e && (e.code || e.message));
      if (!res.headersSent) fail(res, 500, 'Something went wrong. Please try again.'); else res.end();
    }
    return true;
  }
  return { db, handle };
}

// A random key created once and kept in the database (used when SESSION_SECRET isn't configured).
export async function storedSecret(db, k) {
  const { randomBytes } = await import('node:crypto');
  await db.run('INSERT INTO app_secrets (k, v, created_at) VALUES (?,?,?) ON CONFLICT (k) DO NOTHING', k, randomBytes(36).toString('base64url'), new Date().toISOString());
  return (await db.get('SELECT v FROM app_secrets WHERE k = ?', k)).v;
}

// First admin account, created from ADMIN_EMAIL + ADMIN_PASSWORD only when no admin exists yet.
// There is no public admin sign-up page. After the first sign-in, remove ADMIN_PASSWORD from the environment.
async function firstAdmin(db) {
  if (!config.adminEmail || !config.adminPassword) return;
  if ((await db.get('SELECT COUNT(*) AS n FROM admins')).n) return;
  const problem = passwordProblems(config.adminPassword);
  if (problem) { console.error(`ADMIN_PASSWORD rejected: ${problem}`); return; }
  const t = new Date().toISOString();
  await db.run('INSERT INTO admins (email, pass_hash, created_at, updated_at) VALUES (?,?,?,?) ON CONFLICT (email) DO NOTHING', config.adminEmail, hashPassword(config.adminPassword), t, t);
  console.log('Admin account created from ADMIN_EMAIL. Remove ADMIN_PASSWORD from the environment after signing in.');
}

// Daily clean-up: old requests (default 2 years), expired sessions, tokens and rate-limit rows;
// expired quotes and requests, reminders two days before confirmed bookings, email retries, ended plans.
export async function cleanup(db) {
  const cutoff = new Date(Date.now() - config.retentionDays * 864e5).toISOString(), t = Date.now();
  for (const f of await db.all('SELECT f.id FROM files f JOIN requests r ON r.id = f.request_id WHERE r.created_at < ?', cutoff)) await removeImage(f.id);
  const r = await db.run('DELETE FROM requests WHERE created_at < ?', cutoff);
  await db.run('DELETE FROM sessions WHERE expires < ?', t);
  await db.run('DELETE FROM user_sessions WHERE expires < ?', t);
  await db.run('DELETE FROM user_tokens WHERE expires < ?', t - 864e5);
  await db.run('DELETE FROM rate_limits WHERE reset_at < ?', t - 3600e3);
  const expired = await expireDue(db), reminders = await sendReminders(db), emailRetries = await retryEmails(db);
  const plansEnded = (await db.run("UPDATE vendor_subscriptions SET status = 'expired', updated_at = ? WHERE status IN ('active','comped') AND current_period_end IS NOT NULL AND current_period_end < ?", new Date().toISOString(), new Date().toISOString().slice(0, 10))).changes;
  await db.run("UPDATE vendors SET sponsored = 0 WHERE sponsored = 1 AND sponsored_until IS NOT NULL AND sponsored_until < ?", new Date().toISOString().slice(0, 10));
  await db.run('DELETE FROM notifications WHERE read_at IS NOT NULL AND created_at < ?', new Date(Date.now() - 365 * 864e5).toISOString());
  return { requestsRemoved: r.changes, bookingsExpired: expired, reminders, emailRetries, plansEnded };
}
