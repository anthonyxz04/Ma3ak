// Digital invitations: the event owner designs one; guests open a public link and RSVP,
// and each answer lands in the event's guest list. Links can be turned off or replaced.
import { config } from './config.js';
import { now, uid } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { requireUser } from './users.js';
import { access } from './events.js';
import { check, clean } from './validate.js';
import { token, rateLimit, clientIp, ipHash, originAllowed } from './security.js';
import { decodeImage } from './uploads.js';
import { putImage, sendImage, removeImage } from './storage.js';

const canEdit = a => a && (a.role === 'owner' || a.role === 'editor');
const HEX = /^#[0-9a-fA-F]{6}$/;
const pub = (i, base) => ({ title: i.title, host: i.host, message: i.message, date: i.event_date, time: i.event_time, location: i.location, dressCode: i.dress_code, rsvpBy: i.rsvp_by, rsvpOpen: !!i.rsvp_open, theme: JSON.parse(i.theme || '[]'), cover: i.cover_id ? `/api/invite/${i.token}/cover` : null, published: !!i.published, ...(base ? { url: `${base}/#/i/${i.token}`, views: i.views } : {}) });
const baseUrl = req => config.allowedOrigins[0] || `http://${req.headers.host}`;
async function body(req, res, size) { try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }

export function inviteRoutes(db, track) {
  const find = async t => /^[A-Za-z0-9_-]{20,64}$/.test(t || '') ? (await db.get('SELECT * FROM invitations WHERE token = ?', t)) : null;
  return {
    'GET /api/events/:id/invitation': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db); if (!u) return; const a = await access(db, id, u); if (!a) return fail(res, 404, 'Event not found.');
      const i = (await db.get('SELECT * FROM invitations WHERE event_id = ?', a.e.id));
      const rsvps = (await db.get("SELECT COUNT(*) AS n, SUM(CASE WHEN rsvp = 'confirmed' THEN 1 ELSE 0 END) AS yes, SUM(CASE WHEN rsvp = 'declined' THEN 1 ELSE 0 END) AS no FROM guests WHERE event_id = ? AND party = 'Invitation RSVP'", a.e.id));
      sendJson(res, 200, { ok: true, invitation: i ? pub(i, baseUrl(req)) : null, rsvps: { total: rsvps.n || 0, yes: rsvps.yes || 0, no: rsvps.no || 0 } });
    },
    'PUT /api/events/:id/invitation': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!a) return fail(res, 404, 'Event not found.'); if (!canEdit(a)) return fail(res, 403, 'You can view this event but not edit it.');
      const b = await body(req, res, 5.5e6); if (!b) return;
      const c = check(b, { title: { required: true, max: 120, msg: 'Give your invitation a title.' }, host: { max: 120 }, message: { max: 1200 }, location: { max: 200 }, dressCode: { max: 80 } });
      if (!c.ok) return fail(res, 422, 'Please check the invitation.', { fields: c.fields });
      const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : null, time = /^([01]\d|2[0-3]):[0-5]\d$/.test(b.time || '') ? b.time : null, rsvpBy = /^\d{4}-\d{2}-\d{2}$/.test(b.rsvpBy || '') ? b.rsvpBy : null;
      const theme = JSON.stringify((Array.isArray(b.theme) ? b.theme : []).filter(x => HEX.test(x)).slice(0, 4));
      const prev = (await db.get('SELECT * FROM invitations WHERE event_id = ?', a.e.id)); let cover = prev?.cover_id || null;
      if (b.cover){ const img = decodeImage(b.cover); if (!img) return fail(res, 422, 'The cover picture couldn’t be read. Use a JPG or PNG under 4 MB.'); if (cover) await removeImage(cover); cover = (await putImage(img)).id; }
      const t = now(), tk = prev?.token || token(24);
      (await db.run(`INSERT INTO invitations (event_id, token, title, host, message, event_date, event_time, location, dress_code, rsvp_by, rsvp_open, theme, cover_id, published, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(event_id) DO UPDATE SET title=excluded.title, host=excluded.host, message=excluded.message, event_date=excluded.event_date, event_time=excluded.event_time, location=excluded.location, dress_code=excluded.dress_code, rsvp_by=excluded.rsvp_by, rsvp_open=excluded.rsvp_open, theme=excluded.theme, cover_id=excluded.cover_id, published=excluded.published, updated_at=excluded.updated_at`, a.e.id, tk, c.value.title, c.value.host || '', c.value.message || '', date, time, c.value.location || '', c.value.dressCode || '', rsvpBy, b.rsvpOpen === false ? 0 : 1, theme, cover, b.published ? 1 : 0, t, t));
      if (b.published && !prev?.published) track('event_shared', { channel: 'invitation' }, u.id);
      sendJson(res, 200, { ok: true, invitation: pub((await db.get('SELECT * FROM invitations WHERE event_id = ?', a.e.id)), baseUrl(req)) });
    },
    // Replace the link (the old one stops working immediately)
    'POST /api/events/:id/invitation/new-link': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const a = await access(db, id, u); if (!a || a.role !== 'owner') return fail(res, 404, 'Event not found.');
      (await db.run('UPDATE invitations SET token = ?, updated_at = ? WHERE event_id = ?', token(24), now(), a.e.id));
      const i = (await db.get('SELECT * FROM invitations WHERE event_id = ?', a.e.id)); sendJson(res, 200, { ok: true, invitation: i ? pub(i, baseUrl(req)) : null });
    },
    'GET /api/invite/:token': async (req, res, _db, url, t) => {
      if (!(await rateLimit(`inv:${ipHash(clientIp(req))}`, 120, 3600e3)).ok) return fail(res, 429, 'Too many requests.');
      const i = await find(t); if (!i || !i.published) return fail(res, 404, 'This invitation isn’t available.');
      (await db.run('UPDATE invitations SET views = views + 1 WHERE event_id = ?', i.event_id)); sendJson(res, 200, { ok: true, invitation: pub(i) });
    },
    'GET /api/invite/:token/cover': async (req, res, _db, url, t) => {
      const i = await find(t); if (!i || !i.published || !i.cover_id) return fail(res, 404, 'Not found.');
      await sendImage(res, i.cover_id, { cache: 'public, max-age=3600' });
    },
    // A guest answers. Spam-protected; each answer becomes a row in the owner's guest list.
    'POST /api/invite/:token/rsvp': async (req, res, _db, url, t) => {
      if (!originAllowed(req)) return fail(res, 403, 'Request blocked.');
      const k = ipHash(clientIp(req)); if (!(await rateLimit(`rsvp:${k}`, 12, 3600e3)).ok) return fail(res, 429, 'Too many replies from this connection. Please try later.');
      const i = await find(t); if (!i || !i.published) return fail(res, 404, 'This invitation isn’t available.');
      if (!i.rsvp_open || (i.rsvp_by && i.rsvp_by < now().slice(0, 10))) return fail(res, 410, 'Replies for this invitation are closed.');
      const b = await body(req, res, 8192); if (!b) return;
      if (b.company_site || (typeof b.elapsed === 'number' && b.elapsed < 2500)) return sendJson(res, 200, { ok: true });
      const c = check(b, { name: { required: true, max: 120, msg: 'Enter your name.' }, phone: { type: 'phone', max: 30 }, dietary: { max: 120 }, message: { max: 500 } });
      if (!c.ok) return fail(res, 422, 'Please check your reply.', { fields: c.fields }); if (typeof b.attending !== 'boolean') return fail(res, 422, 'Let the hosts know if you’re coming.', { fields: { attending: 'Required.' } });
      if ((await db.get('SELECT COUNT(*) AS n FROM guests WHERE event_id = ?', i.event_id)).n >= 2000) return fail(res, 422, 'This guest list is full.');
      const ts = now(), same = (await db.get("SELECT id FROM guests WHERE event_id = ? AND party = 'Invitation RSVP' AND lower(name) = lower(?)", i.event_id, c.value.name));
      if (same) (await db.run('UPDATE guests SET rsvp = ?, plus_one = ?, dietary = ?, phone = COALESCE(?, phone), notes = ?, updated_at = ? WHERE id = ?', b.attending ? 'confirmed' : 'declined', b.plusOne ? 1 : 0, c.value.dietary || '', c.value.phone || null, c.value.message || '', ts, same.id));
      else (await db.run('INSERT INTO guests (id, event_id, name, phone, party, rsvp, plus_one, dietary, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', uid(), i.event_id, c.value.name, c.value.phone || null, 'Invitation RSVP', b.attending ? 'confirmed' : 'declined', b.plusOne ? 1 : 0, c.value.dietary || '', c.value.message || '', ts, ts));
      sendJson(res, 201, { ok: true });
    },
  };
}
