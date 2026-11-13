// Star ratings from 1 to 5.
//  * Providers: any signed-in customer can rate a provider once, with an optional comment, and change it later.
//    These are stored as reviews without a booking. Reviews from a completed booking are marked "Verified booking";
//    when a customer reviews a booking, their earlier unverified rating of that provider is replaced (one voice each).
//  * Event types (Events page): signed-in customers rate each event type; the average is public.
//  * A customer's own event: once its date has passed, the owner rates how it went. Only the owner and admins see it.
import { now, uid } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { rateLimit } from './security.js';
import { clean } from './validate.js';
import { currentUser, requireUser } from './users.js';
import { EVENT_TYPES, today } from './fields.js';
import { notifyVendor } from './notifications.js';

const stars = v => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; };
const authorName = u => { const parts = String(u.name || '').split(/\s+/).filter(Boolean); return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : (parts[0] || 'Customer'); };
const avg = r => ({ average: r && Number(r.n) ? Math.round(Number(r.a) * 10) / 10 : null, count: Number(r?.n || 0) });
async function readBody(req, res, limit = 8192) { try { return await readJson(req, limit); } catch (e) { fail(res, e.status || 400, e.message); return null; } }

export function ratingRoutes(db, guard) {
  // A public, approved, non-demo listing that the customer doesn't own.
  async function rateableVendor(res, id, u) {
    const v = await db.get("SELECT id, name, owner_user_id, is_demo FROM vendors WHERE id = ? AND status = 'approved' AND active = 1", String(id));
    if (!v) { fail(res, 404, 'Provider not found.'); return null; }
    if (v.is_demo) { fail(res, 409, 'This is a sample listing, so it can’t be rated.'); return null; }
    if (u && (u.role === 'partner' || v.owner_user_id === u.id)) { fail(res, 403, 'Only customers can rate providers.'); return null; }
    return v;
  }

  return {
    // ---------- providers ----------
    'GET /api/vendors/:id/my-rating': async (req, res, _db, url, id) => {
      const u = await currentUser(req, db); if (!u) return sendJson(res, 200, { ok: true, signedIn: false, canRate: false });
      const v = await db.get('SELECT id, owner_user_id, is_demo FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Provider not found.');
      const verified = await db.get('SELECT id, rating FROM reviews WHERE vendor_id = ? AND user_id = ? AND booking_id IS NOT NULL LIMIT 1', v.id, u.id);
      const mine = await db.get('SELECT id, rating, body, status FROM reviews WHERE vendor_id = ? AND user_id = ? AND booking_id IS NULL', v.id, u.id);
      const reason = v.is_demo ? 'demo' : u.role === 'partner' || v.owner_user_id === u.id ? 'partner' : verified ? 'verified' : null;
      sendJson(res, 200, { ok: true, signedIn: true, canRate: !reason, reason, mine: mine ? { rating: mine.rating, body: mine.body, hidden: mine.status === 'hidden' } : null });
    },
    'PUT /api/vendors/:id/rating': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return;
      const v = await rateableVendor(res, id, u); if (!v) return;
      const b = await readBody(req, res); if (!b) return;
      const rating = stars(b.rating); if (!rating) return fail(res, 422, 'Choose 1 to 5 stars.', { fields: { rating: 'Required.' } });
      const text = clean(b.body, 2000);
      if (await db.get('SELECT 1 FROM reviews WHERE vendor_id = ? AND user_id = ? AND booking_id IS NOT NULL', v.id, u.id)) return fail(res, 409, 'You already reviewed this provider after your booking.');
      if (!(await rateLimit(`rate:v:${u.id}`, 30, 864e5)).ok) return fail(res, 429, 'You’ve rated a lot today. Please try again tomorrow.');
      const t = now(), had = await db.get('SELECT id, status FROM reviews WHERE vendor_id = ? AND user_id = ? AND booking_id IS NULL', v.id, u.id);
      if (had) await db.run('UPDATE reviews SET rating = ?, body = ?, author_name = ?, updated_at = ? WHERE id = ?', rating, text, authorName(u), t, had.id);
      else {
        try { await db.run('INSERT INTO reviews (id, booking_id, vendor_id, user_id, author_name, rating, body, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)', uid(), null, v.id, u.id, authorName(u), rating, text, t, t); }
        catch (e) { if (e.code === '23505') return fail(res, 409, 'You already rated this provider. Refresh the page to change your rating.'); throw e; }
        await notifyVendor(db, v, { kind: 'review', title: `New ${rating}-star rating`, body: text.slice(0, 200) || `A customer rated ${v.name} ${rating} out of 5.`, link: `#/vendor/${v.id}`, dedupe: `rating:${v.id}:${u.id}` });
      }
      sendJson(res, had ? 200 : 201, { ok: true, hidden: had?.status === 'hidden' });
    },
    'DELETE /api/vendors/:id/rating': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return;
      const r = await db.run('DELETE FROM reviews WHERE vendor_id = ? AND user_id = ? AND booking_id IS NULL', String(id), u.id);
      if (!r.changes) return fail(res, 404, 'You haven’t rated this provider.'); sendJson(res, 200, { ok: true });
    },

    // ---------- event types ----------
    'GET /api/event-ratings': async (req, res) => {
      const rows = await db.all('SELECT event_type, AVG(rating)::float AS a, COUNT(*) AS n FROM event_type_ratings GROUP BY event_type');
      const ratings = Object.fromEntries(rows.filter(r => EVENT_TYPES.includes(r.event_type)).map(r => [r.event_type, avg(r)]));
      const u = await currentUser(req, db), mine = {};
      if (u) for (const r of await db.all('SELECT event_type, rating FROM event_type_ratings WHERE user_id = ?', u.id)) mine[r.event_type] = r.rating;
      sendJson(res, 200, { ok: true, signedIn: !!u, ratings, mine });
    },
    'PUT /api/event-ratings/:type': async (req, res, _db, url, type) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return;
      if (!EVENT_TYPES.includes(type)) return fail(res, 404, 'Event type not found.');
      const b = await readBody(req, res, 1024); if (!b) return;
      const rating = stars(b.rating); if (!rating) return fail(res, 422, 'Choose 1 to 5 stars.');
      if (!(await rateLimit(`rate:e:${u.id}`, 60, 864e5)).ok) return fail(res, 429, 'You’ve rated a lot today. Please try again tomorrow.');
      const t = now();
      await db.run('INSERT INTO event_type_ratings (event_type, user_id, rating, created_at, updated_at) VALUES (?,?,?,?,?) ON CONFLICT (event_type, user_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = EXCLUDED.updated_at', type, u.id, rating, t, t);
      const r = await db.get('SELECT AVG(rating)::float AS a, COUNT(*) AS n FROM event_type_ratings WHERE event_type = ?', type);
      sendJson(res, 200, { ok: true, rating: avg(r), mine: rating });
    },

    // ---------- the customer's own event ----------
    'GET /api/events/:id/rating': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db); if (!u) return;
      const e = await db.get('SELECT id, event_date, rating, rating_comment, rated_at FROM events WHERE id = ? AND user_id = ?', String(id), u.id);
      if (!e) return fail(res, 404, 'Plan not found.');
      const canRate = !!(e.event_date && e.event_date < today());
      sendJson(res, 200, { ok: true, canRate, eventDate: e.event_date || null, rating: e.rating || null, comment: e.rating_comment || '', ratedAt: e.rated_at || null });
    },
    'PUT /api/events/:id/rating': async (req, res, _db, url, id) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return;
      const e = await db.get('SELECT id, event_date FROM events WHERE id = ? AND user_id = ?', String(id), u.id);
      if (!e) return fail(res, 404, 'Plan not found.');
      if (!(e.event_date && e.event_date < today())) return fail(res, 409, 'You can rate your event once its date has passed.');
      const b = await readBody(req, res); if (!b) return;
      const rating = stars(b.rating); if (!rating) return fail(res, 422, 'Choose 1 to 5 stars.', { fields: { rating: 'Required.' } });
      await db.run('UPDATE events SET rating = ?, rating_comment = ?, rated_at = ? WHERE id = ?', rating, clean(b.comment, 2000), now(), e.id);
      sendJson(res, 200, { ok: true });
    },

    // ---------- admin ----------
    'GET /api/admin/ratings': async (req, res) => {
      if (!await guard(req, res)) return;
      const types = await db.all('SELECT event_type, AVG(rating)::float AS a, COUNT(*) AS n FROM event_type_ratings GROUP BY event_type ORDER BY COUNT(*) DESC');
      const events = await db.all(`SELECT e.id, e.name, e.event_type, e.event_date, e.rating, e.rating_comment, e.rated_at, u.name AS user_name, u.email AS user_email
        FROM events e JOIN users u ON u.id = e.user_id WHERE e.rated_at IS NOT NULL ORDER BY e.rated_at DESC LIMIT 300`);
      const vendors = await db.all(`SELECT v.id, v.name, AVG(r.rating)::float AS a, COUNT(*) AS n, SUM(CASE WHEN r.booking_id IS NOT NULL THEN 1 ELSE 0 END) AS verified
        FROM reviews r JOIN vendors v ON v.id = r.vendor_id WHERE r.status = 'published' GROUP BY v.id, v.name ORDER BY COUNT(*) DESC LIMIT 300`);
      const ev = await db.get('SELECT AVG(rating)::float AS a, COUNT(*) AS n FROM events WHERE rated_at IS NOT NULL');
      sendJson(res, 200, { ok: true, eventTypes: types.map(t => ({ eventType: t.event_type, ...avg(t) })), events, eventsSummary: avg(ev),
        vendors: vendors.map(v => ({ id: v.id, name: v.name, ...avg(v), verified: Number(v.verified) })) });
    },
  };
}
