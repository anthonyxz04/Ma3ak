// Saved events. Every query is scoped to the signed-in user (owner or invited member):
// Customer A can never read or change Customer B's events.
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { requireUser, currentUser } from './users.js';
import { sanitizeChoices, clean } from './validate.js';
import { token, sha256, originAllowed, rateLimit, clientIp, ipHash } from './security.js';
import { entitlements } from './plans.js';
import { config } from './config.js';
import { loadServices, planCore, lineOut, totals } from './planner.js';
import { feeRules } from './billing.js';

const META = ['_add', '_ov'];
async function access(db, eventId, user) {
  const e = (await db.get('SELECT * FROM events WHERE id = ?', String(eventId))); if (!e) return null;
  if (e.user_id === user.id) return { e, role: 'owner' };
  const m = (await db.get('SELECT role FROM event_members WHERE event_id = ? AND user_id = ?', e.id, user.id));
  return m ? { e, role: m.role } : null;
}
const canEdit = a => a && (a.role === 'owner' || a.role === 'editor');

// Relational write: core fields on `events`, each choice as a row in `event_selections`, layout in `event_items`.
async function writeState(db, eventId, s) {
  await db.run('DELETE FROM event_selections WHERE event_id = ?', eventId);
  await db.run('DELETE FROM event_items WHERE event_id = ?', eventId);
  const sel = [];
  for (const [k, v] of Object.entries(s)) {
    if (META.includes(k)) continue;
    if (Array.isArray(v)) v.forEach(x => sel.push([eventId, k, String(x), 1])); else if (v !== '' && v != null) sel.push([eventId, k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v), 0]);
  }
  await db.insertMany('event_selections', ['event_id', 'field', 'value', 'multi'], sel, 'ON CONFLICT DO NOTHING');
  const items = new Map();
  (s._add || []).forEach(a => a.id && items.set(String(a.id), [String(a.id), eventId, a.type, 'added', a.x, a.z, a.ry]));
  Object.entries(s._ov || {}).forEach(([id, o]) => items.set(id, [id, eventId, null, o.del ? 'removed' : 'moved', o.x ?? null, o.z ?? null, o.ry ?? null]));
  await db.insertMany('event_items', ['id', 'event_id', 'item_type', 'source', 'x', 'z', 'ry'], [...items.values()]);
}
const NUMERIC = new Set(['guests', 'kids', 'budget', 'duration', 'cakeTiers', 'photographers', 'beautyPeople', '_horizon']);
export async function readState(db, eventId) {
  const s = {};
  for (const r of (await db.all('SELECT field, value, multi FROM event_selections WHERE event_id = ?', eventId))) {
    if (r.multi) (s[r.field] = s[r.field] || []).push(r.value);
    else s[r.field] = NUMERIC.has(r.field) ? Number(r.value) : r.value === '1' && r.field === '_photo' ? true : r.value;
  }
  for (const r of (await db.all('SELECT * FROM event_items WHERE event_id = ?', eventId))) {
    if (r.source === 'added') (s._add = s._add || []).push({ id: r.id, type: r.item_type, x: r.x, z: r.z, ry: r.ry });
    else (s._ov = s._ov || {})[r.id] = r.source === 'removed' ? { del: 1 } : { x: r.x, z: r.z, ry: r.ry };
  }
  return s;
}
const summaryOf = e => ({ id: e.id, name: e.name, event_type: e.event_type, event_date: e.event_date, venue: e.venue, location: e.location, setting: e.setting, guest_count: e.guest_count, budget: e.budget, style: e.style, status: e.status, progress: e.progress, rev: e.rev, updated_at: e.updated_at, created_at: e.created_at,
  currency: e.currency || 'USD', ...(e.services !== undefined ? { services: e.services, est_low_minor: e.est_low, est_high_minor: e.est_high, quote_items: e.quote_items, other_currency_items: e.other_currency_items, has_design: !!e.has_design } : {}) });
// Estimated totals for the dashboard (same rule as the planner: per-guest lines follow the guest count).
// Amounts are in minor units of the plan's currency; lines in other currencies are counted separately (no exchange rates).
const TOTALS = `(SELECT COUNT(*) FROM event_services s WHERE s.event_id = e.id) AS services,
  (SELECT SUM(s.unit_price_minor * COALESCE(s.quantity, CASE WHEN s.unit = 'per_guest' THEN COALESCE(e.guest_count, 0) ELSE 1 END)) FROM event_services s WHERE s.event_id = e.id AND s.currency = e.currency AND s.price_type <> 'quote') AS est_low,
  (SELECT SUM(COALESCE(s.price_max_minor, s.unit_price_minor) * COALESCE(s.quantity, CASE WHEN s.unit = 'per_guest' THEN COALESCE(e.guest_count, 0) ELSE 1 END)) FROM event_services s WHERE s.event_id = e.id AND s.currency = e.currency AND s.price_type <> 'quote') AS est_high,
  (SELECT COUNT(*) FROM event_services s WHERE s.event_id = e.id AND (s.unit_price_minor IS NULL OR s.price_type = 'quote')) AS quote_items,
  (SELECT COUNT(*) FROM event_services s WHERE s.event_id = e.id AND s.currency <> e.currency) AS other_currency_items,
  EXISTS (SELECT 1 FROM event_selections x WHERE x.event_id = e.id) AS has_design`;
function coreFrom(b, s) {
  const n = v => Number.isFinite(+v) && +v > 0 ? Math.min(1e8, Math.round(+v)) : null;
  return { name: clean(b.name, 120) || 'My event', event_type: clean(s.eventType, 40) || null, event_date: /^\d{4}-\d{2}-\d{2}$/.test(s.date || '') ? s.date : null,
    venue: clean((Array.isArray(s.venueType) ? s.venueType[0] : '') || (s._photo ? 'Own venue photo' : ''), 80) || null, guest_count: n(s.guests), budget: n(s.budget),
    style: clean((s.style || [])[0], 40) || null, progress: Math.max(0, Math.min(100, Math.round(+b.progress || 0))) };
}
async function body(req, res, size = 256e3) { try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }
async function snapshot(db, eventId, label, by, s, user) {
  (await db.run('INSERT INTO event_versions (id, event_id, label, snapshot, created_by, created_at) VALUES (?,?,?,?,?,?)', uid(), eventId, clean(label, 120) || 'Saved', JSON.stringify(s), by, now()));
  const max = entitlements(user).maxVersions, extra = (await db.all('SELECT id FROM event_versions WHERE event_id = ? ORDER BY created_at DESC OFFSET ?', eventId, max));
  for (const v of extra) (await db.run('DELETE FROM event_versions WHERE id = ?', v.id));
}

export function eventRoutes(db, track) {
  return {
    'GET /api/events': async (req, res) => {
      const u = await requireUser(req, res, db); if (!u) return;
      const mine = (await db.all(`SELECT e.*, ${TOTALS} FROM events e WHERE e.user_id = ? ORDER BY e.updated_at DESC`, u.id)).map(summaryOf);
      const shared = (await db.all(`SELECT e.*, m.role, u.name AS owner_name, ${TOTALS} FROM event_members m JOIN events e ON e.id = m.event_id JOIN users u ON u.id = e.user_id WHERE m.user_id = ? ORDER BY e.updated_at DESC`, u.id)).map(e => ({ ...summaryOf(e), role: e.role, owner: e.owner_name }));
      sendJson(res, 200, { ok: true, events: mine, shared, limits: entitlements(u) });
    },
    'POST /api/events': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res); if (!b) return;
      const count = (await db.get('SELECT COUNT(*) AS n FROM events WHERE user_id = ?', u.id)).n;
      if (count >= entitlements(u).maxEvents) return fail(res, 402, `Your plan includes ${entitlements(u).maxEvents} events. Archive or delete one to create another.`, { code: 'limit_events' });
      const s = sanitizeChoices(b.state || {}), c = coreFrom(b, s), id = uid(), t = now();
      await tx(db, async (db) => { (await db.run('INSERT INTO events (id, user_id, name, event_type, event_date, venue, guest_count, budget, style, progress, rev, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?)', id, u.id, c.name, c.event_type, c.event_date, c.venue, c.guest_count, c.budget, c.style, c.progress, t, t)); await writeState(db, id, s); await snapshot(db, id, 'Event created', u.id, s, u); });
      track('event_created', { type: c.event_type || 'none' }, u.id);
      sendJson(res, 201, { ok: true, event: summaryOf((await db.get('SELECT * FROM events WHERE id = ?', id))) });
    },
    'GET /api/events/:id': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db); if (!u) return; const a = await access(db, id, u); if (!a) return fail(res, 404, 'Event not found.');
      sendJson(res, 200, { ok: true, event: summaryOf(a.e), role: a.role, state: await readState(db, a.e.id) });
    },
    // Autosave. `rev` protects against two devices overwriting each other.
    'PUT /api/events/:id': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!a) return fail(res, 404, 'Event not found.');
      if (!canEdit(a)) return fail(res, 403, 'You can view this event but not edit it.');
      const rl = await rateLimit(`save:${u.id}`, 240, 3600e3); if (!rl.ok) return fail(res, 429, 'Saving too often. Please wait a moment.');
      const b = await body(req, res); if (!b) return;
      if (Number(b.rev) !== a.e.rev && !b.force) return fail(res, 409, 'This event changed on another device.', { code: 'conflict', rev: a.e.rev });
      const s = sanitizeChoices(b.state || {}), c = coreFrom(b, s), t = now();
      await tx(db, async (db) => {
        (await db.run('UPDATE events SET name = ?, event_type = ?, event_date = ?, venue = ?, guest_count = ?, budget = ?, style = ?, progress = ?, rev = rev + 1, updated_at = ? WHERE id = ?', c.name, c.event_type, c.event_date, c.venue, c.guest_count, c.budget, c.style, c.progress, t, a.e.id));
        await writeState(db, a.e.id, s);
        const last = (await db.get('SELECT created_at FROM event_versions WHERE event_id = ? ORDER BY created_at DESC LIMIT 1', a.e.id));
        if (b.checkpoint || !last || Date.now() - Date.parse(last.created_at) > 5 * 60e3) await snapshot(db, a.e.id, b.label || 'Autosave', u.id, s, (await db.get('SELECT * FROM users WHERE id = ?', a.e.user_id)));
      });
      sendJson(res, 200, { ok: true, rev: a.e.rev + 1, updated_at: t });
    },
    'DELETE /api/events/:id': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!a || a.role !== 'owner') return fail(res, 404, 'Event not found.');
      (await db.run('DELETE FROM events WHERE id = ?', a.e.id)); sendJson(res, 200, { ok: true });
    },
    'POST /api/events/:id/duplicate': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!a) return fail(res, 404, 'Event not found.');
      if ((await db.get('SELECT COUNT(*) AS n FROM events WHERE user_id = ?', u.id)).n >= entitlements(u).maxEvents) return fail(res, 402, 'Your plan’s event limit is reached.', { code: 'limit_events' });
      const s = await readState(db, a.e.id), nid = uid(), t = now();
      await tx(db, async (db) => { (await db.run('INSERT INTO events (id, user_id, name, event_type, event_date, venue, location, setting, guest_count, budget, style, wanted, notes, requirements, progress, rev, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)', nid, u.id, (a.e.name + ' (copy)').slice(0, 120), a.e.event_type, a.e.event_date, a.e.venue, a.e.location, a.e.setting, a.e.guest_count, a.e.budget, a.e.style, a.e.wanted, a.role === 'owner' ? a.e.notes : '', a.e.requirements, a.e.progress, t, t)); await writeState(db, nid, s);
        await db.run(`INSERT INTO event_services (id, event_id, category, vendor_id, package_id, source, label, vendor_name, unit, unit_price, price_max, quantity, note, sort, created_at, updated_at)
          SELECT md5(random()::text || id), ?, category, vendor_id, package_id, source, label, vendor_name, unit, unit_price, price_max, quantity, note, sort, ?, ? FROM event_services WHERE event_id = ?`, nid, t, t, a.e.id); });
      sendJson(res, 201, { ok: true, id: nid });
    },
    'GET /api/events/:id/versions': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db); if (!u) return; const a = await access(db, id, u); if (!a) return fail(res, 404, 'Event not found.');
      sendJson(res, 200, { ok: true, versions: (await db.all('SELECT id, label, created_at FROM event_versions WHERE event_id = ? ORDER BY created_at DESC LIMIT 100', a.e.id)) });
    },
    'POST /api/events/:id/versions/:vid/restore': async (req, res, _db, url, id, vid) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!canEdit(a)) return fail(res, 404, 'Event not found.');
      const v = (await db.get('SELECT * FROM event_versions WHERE id = ? AND event_id = ?', String(vid), a.e.id)); if (!v) return fail(res, 404, 'Version not found.');
      const s = sanitizeChoices(JSON.parse(v.snapshot));
      await tx(db, async (db) => { await snapshot(db, a.e.id, 'Before restoring a version', u.id, await readState(db, a.e.id), u); await writeState(db, a.e.id, s); (await db.run('UPDATE events SET rev = rev + 1, updated_at = ? WHERE id = ?', now(), a.e.id)); });
      const e = (await db.get('SELECT * FROM events WHERE id = ?', a.e.id)); sendJson(res, 200, { ok: true, event: summaryOf(e), state: s });
    },
    // Share links: random 256-bit tokens, stored hashed; view-only or collaborate; can expire and be revoked.
    'POST /api/events/:id/shares': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!a || a.role !== 'owner') return fail(res, 404, 'Event not found.');
      const b = await body(req, res, 2048); if (!b) return; const perm = b.permission === 'edit' ? 'edit' : 'view', days = Math.max(1, Math.min(365, Number(b.days) || 30));
      const t = token(32), sid = uid(), exp = new Date(Date.now() + days * 864e5).toISOString(), opt = k => b[k] === false ? 0 : 1;
      (await db.run('INSERT INTO shares (id, token_hash, event_id, permission, created_at, expires_at, show_prices, show_providers, show_date) VALUES (?,?,?,?,?,?,?,?,?)', sid, sha256(t), a.e.id, perm, now(), exp, opt('showPrices'), opt('showProviders'), opt('showDate')));
      track('event_shared', { permission: perm }, u.id);
      sendJson(res, 201, { ok: true, share: { id: sid, permission: perm, expires_at: exp, show_prices: opt('showPrices'), show_providers: opt('showProviders'), show_date: opt('showDate'), url: `${config.allowedOrigins[0] || `http://${req.headers.host}`}/#/s/${t}` } });
    },
    'GET /api/events/:id/shares': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db); if (!u) return; const a = await access(db, id, u); if (!a || a.role !== 'owner') return fail(res, 404, 'Event not found.');
      sendJson(res, 200, { ok: true, shares: (await db.all('SELECT id, permission, created_at, expires_at, revoked, views, show_prices, show_providers, show_date FROM shares WHERE event_id = ? ORDER BY created_at DESC', a.e.id)), members: (await db.all('SELECT u.name, u.email, m.role FROM event_members m JOIN users u ON u.id = m.user_id WHERE m.event_id = ?', a.e.id)) });
    },
    'DELETE /api/events/:id/shares/:sid': async (req, res, _db, url, id, sid) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!a || a.role !== 'owner') return fail(res, 404, 'Event not found.');
      (await db.run('UPDATE shares SET revoked = 1 WHERE id = ? AND event_id = ?', String(sid), a.e.id)); sendJson(res, 200, { ok: true });
    },
    // Public presentation of a shared event (no contact details, no owner identity beyond first name).
    'GET /api/share/:token': async (req, res, _db, url, t) => {
      const rl = await rateLimit(`sharev:${ipHash(clientIp(req))}`, 120, 3600e3); if (!rl.ok) return fail(res, 429, 'Too many requests.');
      const s = (await db.get('SELECT * FROM shares WHERE token_hash = ?', sha256(String(t))));
      if (!s || s.revoked || (s.expires_at && s.expires_at < now())) return fail(res, 404, 'This link has expired or was turned off.');
      (await db.run('UPDATE shares SET views = views + 1 WHERE id = ?', s.id));
      const e = (await db.get('SELECT e.*, u.name AS owner FROM events e JOIN users u ON u.id = e.user_id WHERE e.id = ?', s.event_id));
      const st = await readState(db, e.id); delete st._photo; for (const k of ['fullName', 'phone', 'email', 'notes']) delete st[k];
      // Budget plan, without private notes, requirements, bookings, payments or anyone's contact details.
      // The owner chooses whether prices, provider names and the date are included.
      const [services, rules] = await Promise.all([loadServices(db, e.id), feeRules(db)]), core = planCore(e); delete core.notes; delete core.requirements;
      const summary = { ...summaryOf(e), owner: (e.owner || '').split(' ')[0] };
      if (!s.show_date) { core.date = null; core.time = null; summary.event_date = null; delete st.date; }
      if (!s.show_prices) { core.budget = null; summary.budget = null; delete summary.est_low_minor; delete summary.est_high_minor; delete st.budget; }
      const lines = services.map(x => { const l = lineOut(x, e.guest_count); delete l.note; delete l.booking; if (l.agreed) l.agreed = s.show_prices ? { totalMinor: l.agreed.totalMinor, currency: l.agreed.currency } : { hidden: true };
        if (!s.show_prices) { for (const k of ['unitPriceMinor', 'priceMaxMinor', 'lineLowMinor', 'lineHighMinor', 'discountMinor', 'currentPrice']) l[k] = null; }
        if (!s.show_providers) { l.vendorName = null; l.vendorId = null; l.packageId = null; } return l; });
      sendJson(res, 200, { ok: true, permission: s.permission, shows: { prices: !!s.show_prices, providers: !!s.show_providers, date: !!s.show_date }, event: summary, state: st,
        plan: { ...core, services: lines, totals: s.show_prices ? totals(services, e, rules) : null } });
    },
    'POST /api/share/:token/join': async (req, res, _db, url, t) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return;
      const s = (await db.get('SELECT * FROM shares WHERE token_hash = ?', sha256(String(t))));
      if (!s || s.revoked || (s.expires_at && s.expires_at < now())) return fail(res, 404, 'This link has expired or was turned off.');
      const e = (await db.get('SELECT user_id FROM events WHERE id = ?', s.event_id));
      if (e.user_id !== u.id) (await db.run('INSERT INTO event_members (event_id, user_id, role, created_at) VALUES (?,?,?,?) ON CONFLICT (event_id, user_id) DO UPDATE SET role = EXCLUDED.role', s.event_id, u.id, s.permission === 'edit' ? 'editor' : 'viewer', now()));
      sendJson(res, 200, { ok: true, id: s.event_id });
    },
    'GET /api/favorites': async (req, res) => { const u = await requireUser(req, res, db); if (!u) return; sendJson(res, 200, { ok: true, items: (await db.all('SELECT item_id FROM favorites WHERE user_id = ?', u.id)).map(r => r.item_id) }); },
    'PUT /api/favorites/:item': async (req, res, _db, url, item) => { const u = await requireUser(req, res, db, { write: true }); if (!u) return; if (!/^[\w:-]{1,64}$/.test(item)) return fail(res, 422, 'Invalid item.'); (await db.run('INSERT INTO favorites (user_id, item_id, created_at) VALUES (?,?,?) ON CONFLICT DO NOTHING', u.id, item, now())); sendJson(res, 200, { ok: true }); },
    'DELETE /api/favorites/:item': async (req, res, _db, url, item) => { const u = await requireUser(req, res, db, { write: true }); if (!u) return; (await db.run('DELETE FROM favorites WHERE user_id = ? AND item_id = ?', u.id, String(item))); sendJson(res, 200, { ok: true }); },
  };
}
export { access };
