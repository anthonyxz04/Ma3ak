// Website feedback: anyone can send an idea, a problem or a compliment from #/feedback;
// admins read and handle it in Admin → Feedback. Same spam protection as the contact form.
import { now } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { rateLimit, clientIp, ipHash, newRef, originAllowed } from './security.js';
import { check, clean } from './validate.js';
import { currentUser } from './users.js';
import { notifyNewRequest } from './notify.js';
import { audit } from './audit.js';

export const FEEDBACK_KINDS = ['idea', 'problem', 'praise', 'other'];
export const FEEDBACK_STATUSES = ['new', 'read', 'done', 'spam'];
const KIND_LABEL = { idea: 'Idea', problem: 'Problem', praise: 'Compliment', other: 'Other' };

const rules = {
  kind: { required: true, oneOf: FEEDBACK_KINDS, max: 10, msg: 'Choose what your feedback is about.' },
  rating: { type: 'int', min: 1, max: 5 },
  message: { required: true, min: 5, max: 3000, msg: 'Write at least 5 characters.' },
  email: { type: 'email', max: 254 },
};
// Only an in-site route is kept as "page" (e.g. /vendors or /bookings/abc), never a full URL or query string.
const cleanPage = p => { const v = clean(p, 200).split('?')[0]; return /^\/[\w\-/]*$/.test(v) ? v : ''; };

export function feedbackRoutes(db, guard) {
  return {
    'POST /api/feedback': async (req, res) => {
      if (!originAllowed(req)) return fail(res, 403, 'Request blocked.');
      const key = ipHash(clientIp(req));
      const burst = await rateLimit(`fb:m:${key}`, 3, 60_000), hourly = await rateLimit(`fb:h:${key}`, 10, 3_600_000), global = await rateLimit(`pub:all:${key}`, 40, 3_600_000);
      if (!burst.ok || !hourly.ok || !global.ok) return fail(res, 429, 'Too many messages. Please try again a little later.');
      let b; try { b = await readJson(req, 16e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      // Spam traps (same as the contact form): the hidden field must stay empty, and a person takes a few seconds.
      if (b.company_site || (typeof b.elapsed === 'number' && b.elapsed < 2500)) return sendJson(res, 201, { ok: true, ref: newRef('F') });
      const c = check(b, rules); if (!c.ok) return fail(res, 422, 'Please check the highlighted fields.', { fields: c.fields });
      const v = c.value;
      // An email is personal data: only kept when the person agrees to the privacy policy.
      if (v.email && b.consent !== true) return fail(res, 422, 'Please accept the privacy policy, or leave the email empty.', { fields: { consent: 'Required when you add an email.' } });
      const user = await currentUser(req, db), ref = newRef('F'), t = now();
      const page = cleanPage(b.page), lang = ['en', 'ar', 'fr'].includes(b.lang) ? b.lang : '';
      await db.run('INSERT INTO feedback (ref, kind, rating, message, email, page, lang, user_id, ip_hash, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        ref, v.kind, v.rating === '' ? null : v.rating, v.message, v.email || null, page, lang, user?.id || null, key, t, t);
      notifyNewRequest({ ref, type: 'feedback', name: v.email || user?.email || 'a visitor', summary: `${KIND_LABEL[v.kind]}${v.rating ? ` · ${v.rating}/5` : ''}${page ? ` · page ${page}` : ''}\n\n${v.message}` });
      sendJson(res, 201, { ok: true, ref });
    },

    'GET /api/admin/feedback': async (req, res, _db, url) => {
      if (!await guard(req, res)) return;
      const st = url.searchParams.get('status') || 'new', kind = url.searchParams.get('kind') || '';
      const where = [], args = [];
      if (st !== 'all') { where.push('f.status = ?'); args.push(FEEDBACK_STATUSES.includes(st) ? st : 'new'); }
      if (FEEDBACK_KINDS.includes(kind)) { where.push('f.kind = ?'); args.push(kind); }
      const rows = await db.all(`SELECT f.id, f.ref, f.kind, f.rating, f.message, f.email, f.page, f.lang, f.status, f.admin_note, f.created_at, f.updated_at, u.name AS user_name, u.email AS user_email
        FROM feedback f LEFT JOIN users u ON u.id = f.user_id ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY f.id DESC LIMIT 300`, ...args);
      const counts = Object.fromEntries(FEEDBACK_STATUSES.map(s => [s, 0]));
      for (const r of await db.all('SELECT status, COUNT(*) AS n FROM feedback GROUP BY status')) counts[r.status] = Number(r.n);
      const avg = await db.get("SELECT AVG(rating) AS a, COUNT(rating) AS n FROM feedback WHERE rating IS NOT NULL AND status <> 'spam'");
      sendJson(res, 200, { ok: true, feedback: rows, counts, rating: { average: avg?.a == null ? null : Math.round(Number(avg.a) * 10) / 10, count: Number(avg?.n || 0) } });
    },

    'POST /api/admin/feedback/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return;
      let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!FEEDBACK_STATUSES.includes(b.status)) return fail(res, 422, 'Choose a status.');
      const note = b.note === undefined ? null : clean(b.note, 1000);
      const r = await db.run('UPDATE feedback SET status = ?, admin_note = COALESCE(?, admin_note), updated_at = ?, handled_by = ? WHERE id = ?', b.status, note, now(), s.admin_id, Number(id) || 0);
      if (!r.changes) return fail(res, 404, 'Not found.');
      await audit(db, s, `feedback_${b.status}`, id); sendJson(res, 200, { ok: true });
    },
  };
}
