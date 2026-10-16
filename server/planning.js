// Event planning: guest list (RSVP, VIP, plus-ones, dietary, tables), timeline, checklist.
// Same access rules as events: owner and editors can change, viewers can read, nobody else sees anything.
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { requireUser } from './users.js';
import { access } from './events.js';
import { check, clean } from './validate.js';

const MAX_GUESTS = 2000;
const canEdit = a => a && (a.role === 'owner' || a.role === 'editor');
const guestRules = { name: { required: true, max: 120, msg: 'Enter a name.' }, phone: { type: 'phone', max: 30 }, email: { type: 'email', max: 254 }, party: { max: 60 }, rsvp: { oneOf: ['pending', 'confirmed', 'declined'] }, dietary: { max: 120 }, notes: { max: 500 } };
const pubGuest = g => ({ id: g.id, name: g.name, phone: g.phone, email: g.email, party: g.party, rsvp: g.rsvp, vip: !!g.vip, plusOne: !!g.plus_one, dietary: g.dietary, table: g.table_no, notes: g.notes });
async function body(req, res, size = 256e3) { try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }
async function gate(req, res, db, id, write) {
  const u = await requireUser(req, res, db, { write }); if (!u) return null;
  const a = await access(db, id, u); if (!a) { fail(res, 404, 'Event not found.'); return null; }
  if (write && !canEdit(a)) { fail(res, 403, 'You can view this event but not edit it.'); return null; }
  return a;
}
async function stats(db, eventId) {
  const r = (await db.get(`SELECT COUNT(*) AS invited, SUM(CASE WHEN rsvp = 'confirmed' THEN 1 ELSE 0 END) AS confirmed, SUM(CASE WHEN rsvp = 'declined' THEN 1 ELSE 0 END) AS declined, SUM(CASE WHEN rsvp = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(vip) AS vip,
    SUM(CASE WHEN rsvp = 'confirmed' THEN 1 + plus_one ELSE 0 END) AS attending, SUM(CASE WHEN rsvp != 'declined' AND table_no IS NULL THEN 1 ELSE 0 END) AS unseated FROM guests WHERE event_id = ?`, eventId));
  return Object.fromEntries(Object.entries(r).map(([k, n]) => [k, n || 0]));
}
// Seat guests: VIPs first at the lowest-numbered tables, people from the same party kept together, plus-ones counted.
export function autoSeat(guests, perTable) {
  const seatsOf = g => 1 + (g.plus_one ? 1 : 0), groups = new Map();
  guests.filter(g => g.rsvp !== 'declined').forEach(g => { const k = g.party || `_${g.id}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(g); });
  const list = [...groups.values()].sort((a, b) => (b.some(g => g.vip) - a.some(g => g.vip)) || (b.reduce((s, g) => s + seatsOf(g), 0) - a.reduce((s, g) => s + seatsOf(g), 0)));
  const tables = [], out = new Map();
  for (const grp of list) {
    const need = grp.reduce((s, g) => s + seatsOf(g), 0);
    if (need <= perTable) { let t = tables.findIndex(f => f >= need); if (t < 0) { tables.push(perTable); t = tables.length - 1; } tables[t] -= need; grp.forEach(g => out.set(g.id, t + 1)); }
    else for (const g of grp) { let t = tables.findIndex(f => f >= seatsOf(g)); if (t < 0) { tables.push(perTable); t = tables.length - 1; } tables[t] -= seatsOf(g); out.set(g.id, t + 1); }
  }
  return { assignments: out, tables: tables.length };
}

export function planningRoutes(db) {
  return {
    'GET /api/events/:id/guests': async (req, res, _db, url, id) => { const a = await gate(req, res, db, id, false); if (!a) return;
      sendJson(res, 200, { ok: true, guests: (await db.all('SELECT * FROM guests WHERE event_id = ? ORDER BY vip DESC, lower(name)', a.e.id)).map(pubGuest), stats: await stats(db, a.e.id) }); },
    'POST /api/events/:id/guests': async (req, res, _db, url, id) => { const a = await gate(req, res, db, id, true); if (!a) return; const b = await body(req, res); if (!b) return;
      // one guest, or many at once: { guests: [{ name, phone }, …] } (e.g. pasted from a list)
      const items = Array.isArray(b.guests) ? b.guests.slice(0, 500) : [b];
      if ((await db.get('SELECT COUNT(*) AS n FROM guests WHERE event_id = ?', a.e.id)).n + items.length > MAX_GUESTS) return fail(res, 422, `An event can have up to ${MAX_GUESTS} guests.`);
      const ok = [], bad = []; for (const it of items) { const c = check(it, guestRules); if (c.ok) ok.push(c.value); else bad.push({ name: clean(it?.name, 60), fields: c.fields }); }
      if (!ok.length) return fail(res, 422, 'Please check the guest details.', { fields: bad[0]?.fields || {} });
      const t = now(), rows = ok.map(g => { const src = items.find(x => clean(x?.name, 120) === g.name) || {}; return [uid(), a.e.id, g.name, g.phone || null, g.email || null, g.party || '', g.rsvp || 'pending', src.vip ? 1 : 0, src.plusOne ? 1 : 0, g.dietary || '', g.notes || '', t, t]; });
      await db.insertMany('guests', ['id', 'event_id', 'name', 'phone', 'email', 'party', 'rsvp', 'vip', 'plus_one', 'dietary', 'notes', 'created_at', 'updated_at'], rows);
      sendJson(res, 201, { ok: true, added: ok.length, skipped: bad.length, stats: await stats(db, a.e.id) }); },
    'PATCH /api/events/:id/guests/:gid': async (req, res, _db, url, id, gid) => { const a = await gate(req, res, db, id, true); if (!a) return; const b = await body(req, res, 8192); if (!b) return;
      const g = (await db.get('SELECT * FROM guests WHERE id = ? AND event_id = ?', String(gid), a.e.id)); if (!g) return fail(res, 404, 'Guest not found.');
      const merged = { name: b.name ?? g.name, phone: b.phone ?? g.phone ?? '', email: b.email ?? g.email ?? '', party: b.party ?? g.party, rsvp: b.rsvp ?? g.rsvp, dietary: b.dietary ?? g.dietary, notes: b.notes ?? g.notes };
      const c = check(merged, guestRules); if (!c.ok) return fail(res, 422, 'Please check the guest details.', { fields: c.fields });
      const table = b.table === null ? null : b.table !== undefined ? Math.max(1, Math.min(500, Math.round(+b.table) || 1)) : g.table_no;
      (await db.run('UPDATE guests SET name=?, phone=?, email=?, party=?, rsvp=?, vip=?, plus_one=?, dietary=?, notes=?, table_no=?, updated_at=? WHERE id = ?', c.value.name, c.value.phone || null, c.value.email || null, c.value.party || '', c.value.rsvp || 'pending', b.vip !== undefined ? (b.vip ? 1 : 0) : g.vip, b.plusOne !== undefined ? (b.plusOne ? 1 : 0) : g.plus_one, c.value.dietary || '', c.value.notes || '', table, now(), g.id));
      sendJson(res, 200, { ok: true, guest: pubGuest((await db.get('SELECT * FROM guests WHERE id = ?', g.id))), stats: await stats(db, a.e.id) }); },
    'DELETE /api/events/:id/guests/:gid': async (req, res, _db, url, id, gid) => { const a = await gate(req, res, db, id, true); if (!a) return; (await db.run('DELETE FROM guests WHERE id = ? AND event_id = ?', String(gid), a.e.id)); sendJson(res, 200, { ok: true, stats: await stats(db, a.e.id) }); },
    'POST /api/events/:id/seating': async (req, res, _db, url, id) => { const a = await gate(req, res, db, id, true); if (!a) return; const b = await body(req, res, 1024); if (!b) return;
      const per = Math.max(2, Math.min(30, Math.round(+b.perTable) || 8)), guests = (await db.all('SELECT * FROM guests WHERE event_id = ?', a.e.id));
      const { assignments, tables } = autoSeat(guests, per), t = now();
      await tx(db, async (db) => { await db.run('UPDATE guests SET table_no = NULL, updated_at = ? WHERE event_id = ?', t, a.e.id);
        const byTable = new Map(); for (const g of guests) { const n = assignments.get(g.id); if (n != null) { if (!byTable.has(n)) byTable.set(n, []); byTable.get(n).push(g.id); } }
        for (const [n, ids] of byTable) await db.run(`UPDATE guests SET table_no = ? WHERE event_id = ? AND id IN (${ids.map(() => '?').join(',')})`, n, a.e.id, ...ids); });
      sendJson(res, 200, { ok: true, tables, perTable: per, stats: await stats(db, a.e.id) }); },
    'GET /api/events/:id/timeline': async (req, res, _db, url, id) => { const a = await gate(req, res, db, id, false); if (!a) return; sendJson(res, 200, { ok: true, items: (await db.all('SELECT id, at, title FROM timeline_items WHERE event_id = ? ORDER BY sort', a.e.id)) }); },
    'PUT /api/events/:id/timeline': async (req, res, _db, url, id) => { const a = await gate(req, res, db, id, true); if (!a) return; const b = await body(req, res, 64e3); if (!b) return;
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 60).map(x => ({ at: /^([01]\d|2[0-3]):[0-5]\d$/.test(x?.at || '') ? x.at : '', title: clean(x?.title, 120) })).filter(x => x.at && x.title).sort((p, q) => { const m = s => { const [h, mm] = s.split(':').map(Number); return (h < 6 ? h + 24 : h) * 60 + mm; }; return m(p.at) - m(q.at); });
      await tx(db, async (db) => { (await db.run('DELETE FROM timeline_items WHERE event_id = ?', a.e.id)); await db.insertMany('timeline_items', ['id', 'event_id', 'at', 'title', 'sort'], items.map((x, i) => [uid(), a.e.id, x.at, x.title, i])); });
      sendJson(res, 200, { ok: true, items: (await db.all('SELECT id, at, title FROM timeline_items WHERE event_id = ? ORDER BY sort', a.e.id)) }); },
    'GET /api/events/:id/checklist': async (req, res, _db, url, id) => { const a = await gate(req, res, db, id, false); if (!a) return; sendJson(res, 200, { ok: true, items: (await db.all('SELECT id, phase, title, done FROM checklist_items WHERE event_id = ? ORDER BY sort', a.e.id)).map(x => ({ ...x, done: !!x.done })) }); },
    'PUT /api/events/:id/checklist': async (req, res, _db, url, id) => { const a = await gate(req, res, db, id, true); if (!a) return; const b = await body(req, res, 64e3); if (!b) return;
      const PH = ['60+ days before', '30 days before', '7 days before', 'Event day'];
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 120).map(x => ({ phase: PH.includes(x?.phase) ? x.phase : PH[0], title: clean(x?.title, 160), done: !!x?.done })).filter(x => x.title);
      await tx(db, async (db) => { (await db.run('DELETE FROM checklist_items WHERE event_id = ?', a.e.id)); await db.insertMany('checklist_items', ['id', 'event_id', 'phase', 'title', 'done', 'sort'], items.map((x, i) => [uid(), a.e.id, x.phase, x.title, x.done ? 1 : 0, i])); });
      sendJson(res, 200, { ok: true, items: (await db.all('SELECT id, phase, title, done FROM checklist_items WHERE event_id = ? ORDER BY sort', a.e.id)).map(x => ({ ...x, done: !!x.done })) }); },
    'PATCH /api/events/:id/checklist/:cid': async (req, res, _db, url, id, cid) => { const a = await gate(req, res, db, id, true); if (!a) return; const b = await body(req, res, 1024); if (!b) return;
      (await db.run('UPDATE checklist_items SET done = ? WHERE id = ? AND event_id = ?', b.done ? 1 : 0, String(cid), a.e.id)); sendJson(res, 200, { ok: true }); },
  };
}
