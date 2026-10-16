// First-party, privacy-conscious analytics: no cookies, no IP storage, no third parties.
import { now } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { currentUser } from './users.js';
import { rateLimit, clientIp, ipHash, originAllowed } from './security.js';
import { clean } from './validate.js';

const NAMES = new Set(['page_view','signup','login','event_created','event_updated','preview_opened','event_shared','quote_requested','contact_clicked','item_equipped','inspire_used','ai_opened','ai_message','export_4k','subscription_started']);
export function makeTracker(db) {
  // Fire-and-forget: analytics must never slow down or break a request.
  return (name, props = {}, userId = null, anon = null) => {
    if (!NAMES.has(name)) return;
    let p = JSON.stringify(props); if (p.length > 600) p = '{}';
    db.run('INSERT INTO analytics (name, user_id, anon, props, at) VALUES (?,?,?,?,?)', name, userId, anon, p, now()).catch(() => {});
  };
}
export function analyticsRoutes(db, track) {
  return {
    'POST /api/t': async (req, res) => {
      if (!originAllowed(req)) return fail(res, 403, 'Blocked.');
      const rl = await rateLimit(`t:${ipHash(clientIp(req))}`, 240, 60e3); if (!rl.ok) return sendJson(res, 202, { ok: true });
      let b; try { b = await readJson(req, 16e3); } catch { return sendJson(res, 202, { ok: true }); }
      const u = await currentUser(req, db), anon = /^[a-z0-9]{8,32}$/.test(b.anon || '') ? b.anon : null;
      for (const ev of (Array.isArray(b.events) ? b.events : []).slice(0, 30)) {
        if (!NAMES.has(ev?.name) || ['signup','login','event_created','ai_message','event_shared'].includes(ev.name)) continue; // server records those itself
        const props = {}; for (const [k, v] of Object.entries(ev.props || {}).slice(0, 8)) if (/^\w{1,24}$/.test(k)) props[k] = typeof v === 'number' ? v : clean(v, 80);
        track(ev.name, props, u?.id || null, anon);
      }
      sendJson(res, 202, { ok: true });
    },
  };
}
// Admin reporting (all figures are counted from the database; nothing is estimated)
export async function report(db) {
  const days = 30, since = new Date(Date.now() - days * 864e5).toISOString();
  const series = async (sql) => { const rows = await db.all(sql, since); const m = Object.fromEntries(rows.map(r => [r.d, r.n])); return Array.from({ length: days }, (_, i) => { const d = new Date(Date.now() - (days - 1 - i) * 864e5).toISOString().slice(0, 10); return { d, n: m[d] || 0 }; }); };
  const one = async (sql, ...a) => (await db.get(sql, ...a)).n;
  const top = (field, n = 8) => db.all('SELECT value AS k, COUNT(*) AS n FROM event_selections WHERE field = ? GROUP BY value ORDER BY n DESC LIMIT ?', field, n);
  const [users, withEvent, designed, sent, events, requests, quotes, aiChats, handoffs, shares, partners, providers, providerQuotes, plans] = await Promise.all([
    one('SELECT COUNT(*) AS n FROM users'), one('SELECT COUNT(DISTINCT user_id) AS n FROM events'), one('SELECT COUNT(DISTINCT user_id) AS n FROM events WHERE progress >= 50'),
    one("SELECT COUNT(DISTINCT user_id) AS n FROM requests WHERE type = 'event' AND user_id IS NOT NULL"), one('SELECT COUNT(*) AS n FROM events'), one('SELECT COUNT(*) AS n FROM requests'),
    one("SELECT COUNT(*) AS n FROM requests WHERE type = 'event'"), one('SELECT COUNT(*) AS n FROM ai_conversations'), one('SELECT COUNT(*) AS n FROM ai_conversations WHERE handoff = 1'),
    one('SELECT COUNT(*) AS n FROM shares'), one("SELECT COUNT(*) AS n FROM users WHERE role = 'partner'"), one("SELECT COUNT(*) AS n FROM vendors WHERE status = 'approved' AND active = 1 AND consent_at IS NOT NULL"),
    one('SELECT COUNT(*) AS n FROM quotes'), one('SELECT COUNT(DISTINCT event_id) AS n FROM event_services')]);
  let equipped = [];
  try { equipped = await db.all("SELECT (props::jsonb ->> 'item') AS k, COUNT(*) AS n FROM analytics WHERE name = 'item_equipped' AND at >= ? AND props LIKE '{%' GROUP BY 1 ORDER BY n DESC LIMIT 10", since); } catch {}
  const [music, areas, decor, lighting, effects] = await Promise.all([top('music', 6), top('areas', 6), top('backdrop'), top('lights'), top('effects')]);
  return {
    totals: { users, events, requests, quotes, aiChats, handoffs, shares, partners, providers, providerQuotes, plans },
    funnel: [['Registered', users], ['Created an event', withEvent], ['Designed 50%+', designed], ['Sent to MA3AK', sent]],
    signups: await series("SELECT substr(created_at,1,10) AS d, COUNT(*) AS n FROM users WHERE created_at >= ? GROUP BY 1"),
    eventsCreated: await series("SELECT substr(created_at,1,10) AS d, COUNT(*) AS n FROM events WHERE created_at >= ? GROUP BY 1"),
    requests: await series("SELECT substr(created_at,1,10) AS d, COUNT(*) AS n FROM requests WHERE created_at >= ? GROUP BY 1"),
    eventTypes: await db.all('SELECT event_type AS k, COUNT(*) AS n FROM events WHERE event_type IS NOT NULL GROUP BY event_type ORDER BY n DESC'),
    venues: await db.all('SELECT venue AS k, COUNT(*) AS n FROM events WHERE venue IS NOT NULL GROUP BY venue ORDER BY n DESC LIMIT 8'),
    stage: [...music, ...areas].sort((a, b) => b.n - a.n).slice(0, 8), decor, lighting, effects, equipped,
  };
}
