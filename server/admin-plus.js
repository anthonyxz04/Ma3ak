// Admin: customers, events, leads, AI conversations, analytics, knowledge base, integrations.
import { now, uid } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { clean, check } from './validate.js';
import { readState } from './events.js';
import { loadServices, lineOut, totals } from './planner.js';
import { feeRules } from './billing.js';
import { report } from './analytics.js';
import { status } from './integrations.js';
import { PLANS } from './plans.js';

// Lead score: how close a customer is to booking (transparent, rule-based).
const leadScore = r => Math.min(100, (r.events ? 10 : 0) + Math.min(30, (r.progress || 0) * .3) + (r.event_date ? 15 : 0) + (r.guest_count >= 50 ? 10 : 0) + (r.budget ? 10 : 0) + (r.shares ? 10 : 0) + (r.requests ? 25 : 0));

export function adminPlusRoutes(db, guard) {
  const G = (req, res, w) => guard(req, res, w);
  return {
    'GET /api/admin/analytics': async (req, res) => { if (await G(req, res)) sendJson(res, 200, { ok: true, report: await report(db) }); },
    'GET /api/admin/integrations': async (req, res) => { if (await G(req, res)) sendJson(res, 200, { ok: true, integrations: status(), plans: PLANS }); },
    'GET /api/admin/users': async (req, res, _db, url) => {
      if (!await G(req, res)) return; const q = clean(url.searchParams.get('q'), 80);
      const rows = (await db.all(`SELECT u.id, u.name, u.email, u.phone, u.role, u.plan, u.email_verified, u.created_at, u.last_login_at, u.marketing,
        (SELECT COUNT(*) FROM events e WHERE e.user_id = u.id) AS events, (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id) AS requests
        FROM users u ${q ? 'WHERE u.email ILIKE ? OR u.name ILIKE ?' : ''} ORDER BY u.created_at DESC LIMIT 200`, ...(q ? [`%${q.replace(/[%_\\]/g, m => '\\' + m)}%`, `%${q.replace(/[%_\\]/g, m => '\\' + m)}%`] : [])));
      sendJson(res, 200, { ok: true, rows });
    },
    'PATCH /api/admin/users/:id': async (req, res, _db, url, id) => {
      if (!await G(req, res, true)) return; let b; try { b = await readJson(req, 2048); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!PLANS[b.plan]) return fail(res, 422, 'Invalid plan.'); (await db.run('UPDATE users SET plan = ?, updated_at = ? WHERE id = ?', b.plan, now(), String(id))); sendJson(res, 200, { ok: true });
    },
    'DELETE /api/admin/users/:id': async (req, res, _db, url, id) => { if (!await G(req, res, true)) return; (await db.run('UPDATE analytics SET user_id = NULL WHERE user_id = ?', String(id))); (await db.run('DELETE FROM users WHERE id = ?', String(id))); sendJson(res, 200, { ok: true }); },
    'GET /api/admin/events': async (req, res) => {
      if (!await G(req, res)) return;
      sendJson(res, 200, { ok: true, rows: (await db.all(`SELECT e.id, e.name, e.event_type, e.event_date, e.venue, e.location, e.guest_count, e.budget, e.currency, e.status, e.progress, e.updated_at, u.name AS owner, u.email,
        (SELECT COUNT(*) FROM event_services s WHERE s.event_id = e.id) AS services FROM events e JOIN users u ON u.id = e.user_id ORDER BY e.updated_at DESC LIMIT 300`)) });
    },
    'GET /api/admin/events/:id': async (req, res, _db, url, id) => {
      if (!await G(req, res)) return; const e = (await db.get('SELECT e.*, u.name AS owner, u.email, u.phone FROM events e JOIN users u ON u.id = e.user_id WHERE e.id = ?', String(id))); if (!e) return fail(res, 404, 'Not found.');
      const services = await loadServices(db, e.id);
      sendJson(res, 200, { ok: true, event: e, services: services.map(x => lineOut(x, e.guest_count)), totals: totals(services, e, await feeRules(db)), state: await readState(db, e.id), versions: (await db.all('SELECT label, created_at FROM event_versions WHERE event_id = ? ORDER BY created_at DESC LIMIT 20', e.id)) });
    },
    'GET /api/admin/leads': async (req, res) => {
      if (!await G(req, res)) return;
      const rows = (await db.all(`SELECT u.id, u.name, u.email, u.phone, u.created_at, COUNT(DISTINCT e.id) AS events, MAX(e.progress) AS progress, MAX(e.event_date) AS event_date, MAX(e.guest_count) AS guest_count, MAX(e.budget) AS budget, MAX(e.event_type) AS event_type,
        (SELECT COUNT(*) FROM shares s JOIN events e2 ON e2.id = s.event_id WHERE e2.user_id = u.id) AS shares, (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id) AS requests
        FROM users u LEFT JOIN events e ON e.user_id = u.id GROUP BY u.id`)).map(r => ({ ...r, score: Math.round(leadScore(r)) })).sort((a, b) => b.score - a.score).slice(0, 200);
      sendJson(res, 200, { ok: true, rows });
    },
    'GET /api/admin/ai': async (req, res) => {
      if (!await G(req, res)) return;
      sendJson(res, 200, { ok: true, rows: (await db.all(`SELECT c.id, c.handoff, c.created_at, c.updated_at, u.name, u.email, e.name AS event, (SELECT COUNT(*) FROM ai_messages m WHERE m.conversation_id = c.id) AS messages,
        (SELECT content FROM ai_messages m WHERE m.conversation_id = c.id AND m.role = 'user' ORDER BY m.id LIMIT 1) AS first FROM ai_conversations c LEFT JOIN users u ON u.id = c.user_id LEFT JOIN events e ON e.id = c.event_id ORDER BY c.updated_at DESC LIMIT 200`)) });
    },
    'GET /api/admin/ai/:id': async (req, res, _db, url, id) => { if (!await G(req, res)) return; sendJson(res, 200, { ok: true, messages: (await db.all('SELECT role, content, actions, created_at FROM ai_messages WHERE conversation_id = ? ORDER BY id', String(id))) }); },
    'GET /api/admin/kb': async (req, res) => { if (await G(req, res)) sendJson(res, 200, { ok: true, rows: (await db.all('SELECT * FROM kb_entries ORDER BY topic, title')) }); },
    'PUT /api/admin/kb/:id': async (req, res, _db, url, id) => {
      if (!await G(req, res, true)) return; let b; try { b = await readJson(req, 64e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const c = check(b, { topic: { required: true, oneOf: ['Services','Packages','Pricing','Policies','Contact','FAQ','Hours','Venues','Decoration','Entertainment','Other'] }, title: { required: true, max: 120 }, body: { required: true, max: 8000 } });
      if (!c.ok) return fail(res, 422, 'Please check the fields.', { fields: c.fields });
      const key = id === 'new' ? uid() : String(id);
      (await db.run('INSERT INTO kb_entries (id, topic, title, body, updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET topic=excluded.topic, title=excluded.title, body=excluded.body, updated_at=excluded.updated_at', key, c.value.topic, c.value.title, c.value.body, now()));
      sendJson(res, 200, { ok: true, id: key });
    },
    'DELETE /api/admin/kb/:id': async (req, res, _db, url, id) => { if (!await G(req, res, true)) return; (await db.run('DELETE FROM kb_entries WHERE id = ?', String(id))); sendJson(res, 200, { ok: true }); },
  };
}
