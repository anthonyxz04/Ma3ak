// Admin API: session cookie (HttpOnly, SameSite=Strict) + CSRF token on every change,
// login throttling and lockout, audit log, CSV export with formula-injection protection.
import { config } from './config.js';
import { now } from './db.js';
import { sendJson, fail, readJson, parseCookies, SESSION_COOKIE, sessionCookie } from './http.js';
import { rateLimit, clientIp, ipHash, verifyPassword, dummyVerify, hashPassword, passwordProblems, token, sha256, safeEqual, originAllowed, securityHeaders } from './security.js';
import { clean } from './validate.js';
import { sendImage, removeImage } from './storage.js';

const STATUSES = ['new', 'in_progress', 'contacted', 'booked', 'closed', 'spam'];
const TYPES = ['event', 'contact', 'vendor', 'booking'];

async function session(req, db) {
  const sid = parseCookies(req)[SESSION_COOKIE]; if (!sid || sid.length > 100) return null;
  const s = (await db.get('SELECT s.id_hash, s.csrf, s.expires, a.id AS admin_id, a.email FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id_hash = ?', sha256(sid)));
  if (!s || s.expires < Date.now()) { if (s) (await db.run('DELETE FROM sessions WHERE id_hash = ?', s.id_hash)); return null; }
  return s;
}
async function guard(req, res, db, { write = false } = {}) {
  const s = await session(req, db); if (!s) { fail(res, 401, 'Please sign in.'); return null; }
  if (write) { if (!originAllowed(req) || !safeEqual(req.headers['x-csrf-token'] || '', s.csrf)) { fail(res, 403, 'Request blocked.'); return null; } }
  return s;
}
const audit = async (db, s, action, target) => (await db.run('INSERT INTO audit (admin_id, action, target, at) VALUES (?,?,?,?)', s?.admin_id ?? null, action, target ?? null, now()));
const csvCell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };

export const adminGuard = db => { const g = async (req, res, write = false) => guard(req, res, db, { write }); g.peek = req => session(req, db); return g; };
export function adminRoutes(db) {
  return {
    'POST /api/admin/login': async (req, res) => {
      if (!originAllowed(req)) return fail(res, 403, 'Request blocked.');
      const key = ipHash(clientIp(req)), rl = await rateLimit(`login:${key}`, 8, 15 * 60_000);
      if (!rl.ok) return fail(res, 429, 'Too many attempts. Try again in a few minutes.');
      let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      const email = clean(b.email, 254).toLowerCase(), password = typeof b.password === 'string' ? b.password.slice(0, 200) : '';
      const a = (await db.get('SELECT * FROM admins WHERE email = ?', email));
      if (!a) { dummyVerify(password); return fail(res, 401, 'Email or password is incorrect.'); }
      if (a.locked_until > Date.now()) return fail(res, 429, 'This account is temporarily locked. Try again later.');
      if (!verifyPassword(password, a.pass_hash)) {
        const failed = a.failed + 1, lock = failed >= 6 ? Date.now() + 15 * 60_000 : 0;
        (await db.run('UPDATE admins SET failed = ?, locked_until = ? WHERE id = ?', lock ? 0 : failed, lock, a.id));
        await audit(db, { admin_id: a.id }, 'login_failed'); return fail(res, 401, 'Email or password is incorrect.');
      }
      (await db.run('UPDATE admins SET failed = 0, locked_until = 0 WHERE id = ?', a.id));
      (await db.run('DELETE FROM sessions WHERE expires < ?', Date.now()));
      const sid = token(32), csrf = token(24), maxAge = config.sessionHours * 3600;
      (await db.run('INSERT INTO sessions (id_hash, admin_id, csrf, expires, created_at) VALUES (?,?,?,?,?)', sha256(sid), a.id, csrf, Date.now() + maxAge * 1000, now()));
      await audit(db, { admin_id: a.id }, 'login');
      return sendJson(res, 200, { ok: true, email: a.email, csrf }, { 'Set-Cookie': sessionCookie(sid, maxAge) });
    },
    'POST /api/admin/logout': async (req, res) => {
      const s = await guard(req, res, db, { write: true }); if (!s) return;
      (await db.run('DELETE FROM sessions WHERE id_hash = ?', s.id_hash)); await audit(db, s, 'logout');
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
    },
    'GET /api/admin/me': async (req, res) => { const s = await guard(req, res, db); if (s) sendJson(res, 200, { ok: true, email: s.email, csrf: s.csrf }); },
    'GET /api/admin/stats': async (req, res) => {
      const s = await guard(req, res, db); if (!s) return;
      const rows = (await db.all('SELECT type, status, COUNT(*) AS n FROM requests GROUP BY type, status'));
      sendJson(res, 200, { ok: true, rows });
    },
    'GET /api/admin/requests': async (req, res, _db, url) => {
      const s = await guard(req, res, db); if (!s) return;
      const type = url.searchParams.get('type'), status = url.searchParams.get('status'), q = clean(url.searchParams.get('q'), 100), page = Math.max(1, Math.min(1000, Number(url.searchParams.get('page')) || 1));
      const where = [], args = [];
      if (TYPES.includes(type)) { where.push('type = ?'); args.push(type); }
      if (STATUSES.includes(status)) { where.push('status = ?'); args.push(status); }
      if (q) { where.push('(ref LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ?)'); const like = `%${q.replace(/[%_\\]/g, m => '\\' + m)}%`; args.push(like, like, like, like); }
      const w = where.length ? 'WHERE ' + where.join(' AND ').replace(/LIKE \?/g, 'ILIKE ?') : '';
      const total = (await db.get(`SELECT COUNT(*) AS n FROM requests ${w}`, ...args)).n;
      const rows = (await db.all(`SELECT id, ref, type, status, name, email, phone, created_at, substr(summary, 1, 160) AS preview FROM requests ${w} ORDER BY id DESC LIMIT 25 OFFSET ?`, ...args, (page - 1) * 25));
      sendJson(res, 200, { ok: true, total, page, rows });
    },
    'GET /api/admin/requests/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, db); if (!s) return;
      const r = (await db.get('SELECT * FROM requests WHERE id = ?', Number(id))); if (!r) return fail(res, 404, 'Not found.');
      const files = (await db.all('SELECT id, kind, mime, size FROM files WHERE request_id = ?', r.id));
      delete r.ip_hash; r.payload = JSON.parse(r.payload || '{}');
      sendJson(res, 200, { ok: true, request: r, files });
    },
    'PATCH /api/admin/requests/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, db, { write: true }); if (!s) return;
      let b; try { b = await readJson(req, 16384); } catch (e) { return fail(res, e.status || 400, e.message); }
      const r = (await db.get('SELECT id FROM requests WHERE id = ?', Number(id))); if (!r) return fail(res, 404, 'Not found.');
      if (b.status !== undefined && !STATUSES.includes(b.status)) return fail(res, 422, 'Invalid status.');
      (await db.run('UPDATE requests SET status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = ? WHERE id = ?', b.status ?? null, b.notes !== undefined ? clean(b.notes, 10000) : null, now(), r.id));
      await audit(db, s, 'update', String(r.id)); sendJson(res, 200, { ok: true });
    },
    'DELETE /api/admin/requests/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, db, { write: true }); if (!s) return;
      const r = (await db.get('SELECT id FROM requests WHERE id = ?', Number(id))); if (!r) return fail(res, 404, 'Not found.');
      for (const f of (await db.all('SELECT id FROM files WHERE request_id = ?', r.id))) await removeImage(f.id);
      (await db.run('DELETE FROM requests WHERE id = ?', r.id)); await audit(db, s, 'delete', String(r.id)); sendJson(res, 200, { ok: true });
    },
    'GET /api/admin/files/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, db); if (!s) return;
      const f = (await db.get('SELECT * FROM files WHERE id = ?', String(id))); if (!f) return fail(res, 404, 'Not found.');
      await sendImage(res, f.id, { download: `ma3ak-${f.kind}` });
    },
    'GET /api/admin/export.csv': async (req, res, _db, url) => {
      const s = await guard(req, res, db); if (!s) return;
      const type = url.searchParams.get('type'); const rows = TYPES.includes(type) ? (await db.all('SELECT * FROM requests WHERE type = ? ORDER BY id DESC', type)) : (await db.all('SELECT * FROM requests ORDER BY id DESC'));
      const head = ['ref', 'type', 'status', 'name', 'email', 'phone', 'created_at', 'notes', 'summary'];
      const csv = '\ufeff' + [head.join(','), ...rows.map(r => head.map(h => csvCell(r[h])).join(','))].join('\r\n');
      await audit(db, s, 'export', type || 'all');
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="ma3ak-requests-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' });
      res.end(csv);
    },
    'POST /api/admin/password': async (req, res) => {
      const s = await guard(req, res, db, { write: true }); if (!s) return;
      let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      const a = (await db.get('SELECT * FROM admins WHERE id = ?', s.admin_id));
      if (!verifyPassword(String(b.current || ''), a.pass_hash)) return fail(res, 422, 'Your current password is incorrect.', { fields: { current: 'Incorrect.' } });
      const problem = passwordProblems(b.next); if (problem) return fail(res, 422, problem, { fields: { next: problem } });
      (await db.run('UPDATE admins SET pass_hash = ?, updated_at = ? WHERE id = ?', hashPassword(b.next), now(), a.id));
      (await db.run('DELETE FROM sessions WHERE admin_id = ? AND id_hash != ?', a.id, s.id_hash));
      await audit(db, s, 'password_change'); sendJson(res, 200, { ok: true });
    },
  };
}
