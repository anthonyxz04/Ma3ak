// In-app notifications, plus email when an email service is configured.
// A dedupe key makes repeated triggers (retries, double clicks) produce one notification.
import { config } from './config.js';
import { now } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { requireUser } from './users.js';
import { sendEmail, emailHtml, status as integrations } from './integrations.js';

const base = () => config.allowedOrigins[0] || process.env.URL || '';

export async function notify(db, userId, { kind, title, body = '', link = '', dedupe = null, email = true }) {
  if (!userId) return null;
  const row = await db.get(`INSERT INTO notifications (user_id, kind, title, body, link, dedupe_key, email_status, created_at) VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT (user_id, dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING RETURNING id`, userId, kind, title.slice(0, 160), body.slice(0, 600), link.slice(0, 300), dedupe, integrations().email.configured && email ? 'skipped' : 'not_configured', now());
  if (!row) return null; // already sent for this event
  if (email && integrations().email.configured) await deliverEmail(db, row.id).catch(() => {});
  return row.id;
}
// Notify whoever runs a provider listing: the partner account, or the MA3AK team for listings it manages.
export async function notifyVendor(db, vendor, n) {
  if (vendor?.owner_user_id) return notify(db, vendor.owner_user_id, n);
  if (config.notifyEmail && integrations().email.configured) await sendEmail({ to: config.notifyEmail, subject: `[${vendor?.name || 'Provider'}] ${n.title}`, text: `${n.title}\n\n${n.body}\n\n${base()}/admin/`, html: emailHtml(n.title, [n.body], { url: `${base()}/admin/`, label: 'Open the admin' }) }).catch(() => {});
  return null;
}
// Email delivery is recorded honestly: 'sent' only when the provider accepted it.
export async function deliverEmail(db, id) {
  const n = await db.get('SELECT n.*, u.email FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.id = ?', id);
  if (!n || !n.email || n.email_status === 'sent' || n.email_attempts >= 3) return;
  const r = await sendEmail({ to: n.email, subject: n.title, text: `${n.body}\n\n${base()}/${n.link || ''}`, html: emailHtml(n.title, [n.body], n.link ? { url: `${base()}/${n.link}`, label: 'Open Ma3ak' } : null) });
  await db.run('UPDATE notifications SET email_status = ?, email_attempts = email_attempts + 1 WHERE id = ?', r.ok ? 'sent' : 'failed', id);
}
// Called by the daily clean-up: retry recent failed emails (at most three attempts in total).
export async function retryEmails(db) {
  if (!integrations().email.configured) return 0;
  const rows = await db.all("SELECT id FROM notifications WHERE email_status = 'failed' AND email_attempts < 3 AND created_at > ? LIMIT 200", new Date(Date.now() - 864e5).toISOString());
  for (const r of rows) await deliverEmail(db, r.id).catch(() => {});
  return rows.length;
}

export function notificationRoutes(db) {
  return {
    'GET /api/notifications': async (req, res) => {
      const u = await requireUser(req, res, db); if (!u) return;
      const items = await db.all('SELECT id, kind, title, body, link, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 60', u.id);
      const unread = (await db.get('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL', u.id)).n;
      sendJson(res, 200, { ok: true, items, unread });
    },
    'POST /api/notifications/read': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return;
      let b; try { b = await readJson(req, 8192); } catch (e) { return fail(res, e.status || 400, e.message); }
      const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter(Number.isInteger).slice(0, 200);
      if (b.all) await db.run('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL', now(), u.id);
      else if (ids.length) await db.run(`UPDATE notifications SET read_at = ? WHERE user_id = ? AND id IN (${ids.map(() => '?').join(',')})`, now(), u.id, ...ids);
      sendJson(res, 200, { ok: true });
    },
  };
}
