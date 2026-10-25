// Customer accounts: email/password (scrypt), optional Google sign-in, email verification,
// password reset, profile, sessions (HttpOnly cookie + CSRF), account deletion.
import { config } from './config.js';
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson, parseCookies } from './http.js';
import { rateLimit, clientIp, ipHash, hashPassword, verifyPassword, dummyVerify, passwordProblems, token, sha256, safeEqual, originAllowed } from './security.js';
import { check, clean } from './validate.js';
import { sendEmail, emailHtml, status } from './integrations.js';
import { entitlements } from './plans.js';
import { removeImage, removeDocument } from './storage.js';

export const USER_COOKIE = config.isProd ? '__Host-ma3ak_user' : 'ma3ak_user';
const cookie = (v, age) => `${USER_COOKIE}=${v}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${config.isProd ? '; Secure' : ''}`;
const SESSION_DAYS = 30;
const baseUrl = req => config.allowedOrigins[0] || `http://${req.headers.host}`;
const publicUser = u => ({ id: u.id, email: u.email, name: u.name, phone: u.phone, avatar: u.avatar_url, verified: !!u.email_verified, role: u.role || 'customer', plan: u.plan, limits: entitlements(u), created_at: u.created_at });

export async function currentUser(req, db) {
  const sid = parseCookies(req)[USER_COOKIE]; if (!sid || sid.length > 100) return null;
  const row = (await db.get('SELECT s.id_hash, s.csrf, s.expires, u.* FROM user_sessions s JOIN users u ON u.id = s.user_id WHERE s.id_hash = ?', sha256(sid)));
  if (!row) return null; if (row.expires < Date.now()) { (await db.run('DELETE FROM user_sessions WHERE id_hash = ?', row.id_hash)); return null; }
  return row;
}
// Guard for signed-in routes; writes also need a matching origin and CSRF header.
export async function requireUser(req, res, db, { write = false } = {}) {
  const u = await currentUser(req, db); if (!u) { fail(res, 401, 'Please sign in.'); return null; }
  if (write && (!originAllowed(req) || !safeEqual(req.headers['x-csrf-token'] || '', u.csrf))) { fail(res, 403, 'Request blocked.'); return null; }
  return u;
}
async function startSession(res, db, user, status = 200, extra = {}) {
  const sid = token(32), csrf = token(24);
  (await db.run('INSERT INTO user_sessions (id_hash, user_id, csrf, expires, created_at) VALUES (?,?,?,?,?)', sha256(sid), user.id, csrf, Date.now() + SESSION_DAYS * 864e5, now()));
  (await db.run('UPDATE users SET last_login_at = ? WHERE id = ?', now(), user.id));
  return sendJson(res, status, { ok: true, user: publicUser(user), csrf, ...extra }, { 'Set-Cookie': cookie(sid, SESSION_DAYS * 86400) });
}
async function issueToken(db, user, kind, req) {
  const t = token(32); (await db.run('INSERT INTO user_tokens (token_hash, user_id, kind, expires) VALUES (?,?,?,?)', sha256(t), user.id, kind, Date.now() + (kind === 'verify' ? 3 * 864e5 : 3600e3)));
  const url = `${baseUrl(req)}/#/${kind === 'verify' ? 'verify' : 'reset'}?token=${t}`;
  const sent = await sendEmail({ to: user.email, subject: kind === 'verify' ? 'Confirm your MA3AK email' : 'Reset your MA3AK password',
    text: `${kind === 'verify' ? 'Confirm your email' : 'Reset your password'}: ${url}\n\nIf you didn’t ask for this, ignore this email.`,
    html: emailHtml(kind === 'verify' ? 'Confirm your email' : 'Reset your password', [kind === 'verify' ? 'Tap the button to confirm your email address.' : 'Tap the button to choose a new password. The link works for one hour.', 'If you didn’t ask for this, you can ignore this email.'], { url, label: kind === 'verify' ? 'Confirm email' : 'Choose a new password' }) });
  if (!sent.ok && !config.isProd) console.log(`[dev] ${kind} link for ${user.email}: ${url}`);
  return sent.ok;
}
const limit = async (req, res, key, n, ms) => { const r = await rateLimit(`${key}:${ipHash(clientIp(req))}`, n, ms); if (!r.ok) { fail(res, 429, 'Too many attempts. Please wait a few minutes.'); return false; } return true; };
async function body(req, res, size = 8192) { if (!originAllowed(req)) { fail(res, 403, 'Request blocked.'); return null; } try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }

export function userRoutes(db, track) {
  return {
    'GET /api/auth/config': async (req, res) => sendJson(res, 200, { ok: true, google: status().google.configured, email: status().email.configured }),
    'POST /api/auth/register': async (req, res) => {
      if (!await limit(req, res, 'reg', 6, 3600e3)) return; const b = await body(req, res); if (!b) return;
      if (b.company_site) return sendJson(res, 200, { ok: true });
      const c = check(b, { name: { required: true, max: 80, msg: 'Enter your name.' }, email: { required: true, type: 'email', max: 254 } });
      if (!c.ok) return fail(res, 422, 'Please check the highlighted fields.', { fields: c.fields });
      const pw = passwordProblems(b.password); if (pw) return fail(res, 422, pw, { fields: { password: pw } });
      if (b.consent !== true) return fail(res, 422, 'Please accept the privacy policy.', { fields: { consent: 'Required.' } });
      if ((await db.get('SELECT 1 FROM users WHERE email = ?', c.value.email))) return fail(res, 409, 'An account with this email already exists. Try signing in.', { fields: { email: 'Already registered.' } });
      const t = now(), user = { id: uid(), email: c.value.email, name: c.value.name, plan: 'free', email_verified: 0, created_at: t };
      (await db.run('INSERT INTO users (id, email, name, pass_hash, marketing, created_at, updated_at) VALUES (?,?,?,?,?,?,?)', user.id, user.email, user.name, hashPassword(b.password), b.marketing === true ? 1 : 0, t, t));
      const mailed = await issueToken(db, user, 'verify', req); track('signup', { method: 'email' }, user.id);
      return startSession(res, db, user, 201, { verificationSent: mailed });
    },
    'POST /api/auth/login': async (req, res) => {
      if (!await limit(req, res, 'ulogin', 10, 15 * 60e3)) return; const b = await body(req, res); if (!b) return;
      const email = clean(b.email, 254).toLowerCase(), pw = typeof b.password === 'string' ? b.password.slice(0, 200) : '';
      const u = (await db.get('SELECT * FROM users WHERE email = ?', email));
      if (!u || !u.pass_hash) { dummyVerify(pw); return fail(res, 401, 'Email or password is incorrect.'); }
      if (u.locked_until > Date.now()) return fail(res, 429, 'Too many attempts. Try again in 15 minutes or reset your password.');
      if (!verifyPassword(pw, u.pass_hash)) { const f = u.failed + 1; (await db.run('UPDATE users SET failed = ?, locked_until = ? WHERE id = ?', f >= 8 ? 0 : f, f >= 8 ? Date.now() + 15 * 60e3 : 0, u.id)); return fail(res, 401, 'Email or password is incorrect.'); }
      (await db.run('UPDATE users SET failed = 0, locked_until = 0 WHERE id = ?', u.id)); track('login', { method: 'email' }, u.id);
      return startSession(res, db, u);
    },
    'POST /api/auth/logout': async (req, res) => { const u = await requireUser(req, res, db, { write: true }); if (!u) return; (await db.run('DELETE FROM user_sessions WHERE id_hash = ?', u.id_hash)); sendJson(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) }); },
    'GET /api/me': async (req, res) => { const u = await currentUser(req, db); if (!u) return sendJson(res, 200, { ok: true, user: null }); sendJson(res, 200, { ok: true, user: publicUser(u), csrf: u.csrf }); },
    'PATCH /api/me': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res); if (!b) return;
      const c = check({ name: b.name ?? u.name, phone: b.phone ?? u.phone ?? '' }, { name: { required: true, max: 80 }, phone: { type: 'phone', max: 30 } });
      if (!c.ok) return fail(res, 422, 'Please check the highlighted fields.', { fields: c.fields });
      (await db.run('UPDATE users SET name = ?, phone = ?, marketing = COALESCE(?, marketing), updated_at = ? WHERE id = ?', c.value.name, c.value.phone || null, typeof b.marketing === 'boolean' ? (b.marketing ? 1 : 0) : null, now(), u.id));
      sendJson(res, 200, { ok: true, user: publicUser((await db.get('SELECT * FROM users WHERE id = ?', u.id))) });
    },
    'POST /api/me/password': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res); if (!b) return;
      if (u.pass_hash && !verifyPassword(String(b.current || ''), u.pass_hash)) return fail(res, 422, 'Your current password is incorrect.', { fields: { current: 'Incorrect.' } });
      const p = passwordProblems(b.next); if (p) return fail(res, 422, p, { fields: { next: p } });
      (await db.run('UPDATE users SET pass_hash = ?, updated_at = ? WHERE id = ?', hashPassword(b.next), now(), u.id));
      (await db.run('DELETE FROM user_sessions WHERE user_id = ? AND id_hash != ?', u.id, u.id_hash)); sendJson(res, 200, { ok: true });
    },
    // Permanent deletion: account, events, versions, shares, favorites, AI chats and uploaded files.
    'DELETE /api/me': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res); if (!b) return;
      if (u.pass_hash ? !verifyPassword(String(b.password || ''), u.pass_hash) : b.confirm !== 'DELETE') return fail(res, 422, u.pass_hash ? 'Enter your password to confirm.' : 'Type DELETE to confirm.', { fields: { password: 'Incorrect.' } });
      // Bookings in progress involve another party and possibly money: they must be finished or cancelled first.
      const ACTIVE = "('awaiting_payment','confirmed','in_progress','cancellation_requested')";
      if (await db.get(`SELECT 1 FROM bookings WHERE user_id = ? AND status IN ${ACTIVE}`, u.id)) return fail(res, 409, 'You have bookings in progress. Cancel them or wait until they are completed, then delete your account.', { code: 'active_bookings' });
      if (u.role === 'partner' && await db.get(`SELECT 1 FROM bookings b JOIN vendors v ON v.id = b.vendor_id WHERE v.owner_user_id = ? AND b.status IN ${ACTIVE}`, u.id)) return fail(res, 409, 'Your listing has bookings in progress. Complete or cancel them first, or contact MA3AK.', { code: 'active_bookings' });
      const docs = u.role === 'partner' ? await db.all('SELECT d.id, d.mime FROM vendor_documents d JOIN vendors v ON v.id = d.vendor_id WHERE v.owner_user_id = ?', u.id) : [];
      const files = [...(await db.all('SELECT f.id FROM files f JOIN requests r ON r.id = f.request_id WHERE r.user_id = ?', u.id)), ...(await db.all('SELECT i.cover_id AS id FROM invitations i JOIN events e ON e.id = i.event_id WHERE e.user_id = ? AND i.cover_id IS NOT NULL', u.id))];
      if (u.role === 'partner') files.push(...(await db.all('SELECT p.id FROM vendor_photos p JOIN vendors v ON v.id = p.vendor_id WHERE v.owner_user_id = ?', u.id)));
      await tx(db, async (db) => {
        if (u.role === 'partner') await db.run('DELETE FROM vendors WHERE owner_user_id = ?', u.id); // a partner's own listing goes with the account
        (await db.run('DELETE FROM requests WHERE user_id = ?', u.id));
        // Booking records stay for the other party and for accounting, without this person's contact details.
        await db.run("UPDATE bookings SET customer_email = NULL, customer_phone = NULL, address = '', updated_at = ? WHERE user_id = ?", now(), u.id);
        await db.run("UPDATE booking_offers SET status = 'withdrawn' WHERE status = 'sent' AND booking_id IN (SELECT id FROM bookings WHERE user_id = ?)", u.id);
        await db.run("INSERT INTO booking_events (booking_id, at, actor_type, action, from_status, to_status, note) SELECT id, ?, 'system', 'customer_account_deleted', status, 'cancelled', 'Customer account deleted' FROM bookings WHERE user_id = ? AND status IN ('draft','quote_requested','quote_received','revision_requested','awaiting_vendor')", now(), u.id);
        await db.run("UPDATE bookings SET status = 'cancelled', cancelled_at = ?, cancel_reason = 'Customer account deleted', updated_at = ? WHERE user_id = ? AND status IN ('draft','quote_requested','quote_received','revision_requested','awaiting_vendor')", now(), now(), u.id);
        (await db.run('UPDATE analytics SET user_id = NULL WHERE user_id = ?', u.id));
        (await db.run('DELETE FROM users WHERE id = ?', u.id)); // cascades to sessions, events, versions, shares, favorites, chats
      });
      for (const f of files) await removeImage(f.id);
      for (const d of docs) await removeDocument(d.id, d.mime);
      sendJson(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
    },
    'POST /api/auth/verify': async (req, res) => {
      const b = await body(req, res); if (!b) return; const row = (await db.get("SELECT * FROM user_tokens WHERE token_hash = ? AND kind = 'verify'", sha256(String(b.token || ''))));
      if (!row || row.used || row.expires < Date.now()) return fail(res, 410, 'This link has expired. Sign in and ask for a new one.');
      (await db.run('UPDATE user_tokens SET used = 1 WHERE token_hash = ?', row.token_hash)); (await db.run('UPDATE users SET email_verified = 1 WHERE id = ?', row.user_id)); sendJson(res, 200, { ok: true });
    },
    'POST /api/auth/resend-verification': async (req, res) => { const u = await requireUser(req, res, db, { write: true }); if (!u) return; if (!await limit(req, res, 'rv', 3, 3600e3)) return; const sent = await issueToken(db, u, 'verify', req); sendJson(res, 200, { ok: true, sent }); },
    'POST /api/auth/forgot': async (req, res) => {
      if (!await limit(req, res, 'forgot', 5, 3600e3)) return; const b = await body(req, res); if (!b) return;
      if (!status().email.configured) return fail(res, 503, 'Password reset by email isn’t available yet. Contact us and we’ll help you.');
      const u = (await db.get('SELECT * FROM users WHERE email = ?', clean(b.email, 254).toLowerCase())); if (u) await issueToken(db, u, 'reset', req);
      sendJson(res, 200, { ok: true }); // same answer either way: doesn't reveal who has an account
    },
    'POST /api/auth/reset': async (req, res) => {
      const b = await body(req, res); if (!b) return; const row = (await db.get("SELECT * FROM user_tokens WHERE token_hash = ? AND kind = 'reset'", sha256(String(b.token || ''))));
      if (!row || row.used || row.expires < Date.now()) return fail(res, 410, 'This link has expired. Ask for a new one.');
      const p = passwordProblems(b.password); if (p) return fail(res, 422, p, { fields: { password: p } });
      await tx(db, async (db) => { (await db.run('UPDATE user_tokens SET used = 1 WHERE token_hash = ?', row.token_hash)); (await db.run('UPDATE users SET pass_hash = ?, failed = 0, locked_until = 0, email_verified = 1, updated_at = ? WHERE id = ?', hashPassword(b.password), now(), row.user_id)); (await db.run('DELETE FROM user_sessions WHERE user_id = ?', row.user_id)); });
      sendJson(res, 200, { ok: true });
    },
    // Google sign-in: standard OAuth 2.0 authorization-code flow with a state cookie.
    'GET /auth/google': async (req, res) => {
      if (!status().google.configured) { res.writeHead(302, { Location: '/#/login?google=off' }); return res.end(); }
      const state = token(18), redirect = `${baseUrl(req)}/auth/google/callback`;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ client_id: config.googleClientId, redirect_uri: redirect, response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' })}`;
      res.writeHead(302, { Location: url, 'Set-Cookie': `ma3ak_oauth=${state}; Path=/auth; HttpOnly; SameSite=Lax; Max-Age=600${config.isProd ? '; Secure' : ''}` }); res.end();
    },
    'GET /auth/google/callback': async (req, res, _db, url) => {
      const go = (to, extra = {}) => { res.writeHead(302, { Location: to, ...extra }); res.end(); };
      const state = parseCookies(req).ma3ak_oauth; if (!state || !safeEqual(state, url.searchParams.get('state') || '')) return go('/#/login?google=failed');
      try {
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: url.searchParams.get('code') || '', client_id: config.googleClientId, client_secret: config.googleClientSecret, redirect_uri: `${baseUrl(req)}/auth/google/callback`, grant_type: 'authorization_code' }), signal: AbortSignal.timeout(10000) });
        const tj = await tr.json(); if (!tr.ok || !tj.access_token) return go('/#/login?google=failed');
        const ur = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tj.access_token}` }, signal: AbortSignal.timeout(10000) }); const g = await ur.json();
        if (!g.sub || !g.email || g.email_verified !== true) return go('/#/login?google=failed');
        let u = (await db.get('SELECT * FROM users WHERE google_sub = ?', g.sub)) || (await db.get('SELECT * FROM users WHERE email = ?', g.email.toLowerCase()));
        const t = now();
        if (!u) { u = { id: uid(), email: g.email.toLowerCase(), name: clean(g.name, 80) || g.email.split('@')[0], plan: 'free', created_at: t }; (await db.run('INSERT INTO users (id, email, name, google_sub, email_verified, avatar_url, created_at, updated_at) VALUES (?,?,?,?,1,?,?,?)', u.id, u.email, u.name, g.sub, /^https:\/\//.test(g.picture || '') ? g.picture : null, t, t)); track('signup', { method: 'google' }, u.id); }
        else (await db.run('UPDATE users SET google_sub = ?, email_verified = 1 WHERE id = ?', g.sub, u.id));
        const sid = token(32), csrf = token(24); (await db.run('INSERT INTO user_sessions (id_hash, user_id, csrf, expires, created_at) VALUES (?,?,?,?,?)', sha256(sid), u.id, csrf, Date.now() + SESSION_DAYS * 864e5, t));
        track('login', { method: 'google' }, u.id);
        res.writeHead(302, { Location: '/#/dashboard', 'Set-Cookie': [cookie(sid, SESSION_DAYS * 86400), 'ma3ak_oauth=; Path=/auth; Max-Age=0'] }); res.end();
      } catch { go('/#/login?google=failed'); }
    },
  };
}
export { publicUser, startSession, issueToken };
