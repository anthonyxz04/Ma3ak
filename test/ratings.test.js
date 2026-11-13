// Star ratings: providers (any signed-in customer, once each), event types, and a customer's own event.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { freshDatabase } from './db-helper.js';
import { Pool } from '../server/minipg.js';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const PORT = 5700 + Math.floor(Math.random() * 400), BASE = `http://127.0.0.1:${PORT}`, ORIGIN = BASE;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ma3ak-rt-'));
let proc, TESTDB, pool, n = 1, vendorId, demoId;
before(async () => {
  TESTDB = await freshDatabase('ma3ak_rt');
  proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: DATA, DATABASE_URL: TESTDB.url,
    SESSION_SECRET: 'r'.repeat(48), PUBLIC_ORIGIN: ORIGIN, TRUST_PROXY: '1', ADMIN_EMAIL: 'chief@ma3ak.test', ADMIN_PASSWORD: 'Chief-password-1234', AI_PROVIDER: '' }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch {} await new Promise(r => setTimeout(r, 150)); }
  pool = new Pool({ connectionString: TESTDB.url, max: 1 });
  // Use two seeded listings: one turned into a real (non-demo) approved provider, one left as a demo.
  const rows = (await pool.query("SELECT id FROM vendors WHERE is_demo = 1 AND status = 'approved' AND active = 1 ORDER BY id LIMIT 2")).rows;
  vendorId = rows[0].id; demoId = rows[1].id;
  await pool.query('UPDATE vendors SET is_demo = 0 WHERE id = $1', [vendorId]);
});
after(async () => { await pool.end(); proc.kill(); await new Promise(r => setTimeout(r, 300)); await TESTDB.drop(); fs.rmSync(DATA, { recursive: true, force: true }); });

function client() {
  const c = { cookie: '', csrf: '', ip: `203.0.113.${n++}` };
  c.req = async (method, p, body) => {
    const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': c.ip, ...(c.cookie ? { Cookie: c.cookie } : {}), ...(c.csrf ? { 'X-CSRF-Token': c.csrf } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc && /ma3ak_(user|sid)=/.test(sc)) c.cookie = sc.split(';')[0];
    const j = await r.json().catch(() => ({})); if (j.csrf) c.csrf = j.csrf; return { status: r.status, ...j };
  };
  return c;
}
const anon = client(), A = client(), B = client(), P = client(), admin = client();
const reg = async (c, name, email) => { const r = await c.req('POST', '/api/auth/register', { name, email, password: 'Cedar-tree-garden-9', consent: true }); assert.ok([200, 201].includes(r.status), r.error); };

test('customers sign up', async () => {
  await reg(A, 'Nour Haddad', 'nour@example.test'); await reg(B, 'Karim', 'karim@example.test');
  const p = await P.req('POST', '/api/partner/register', { name: 'Rami', email: 'rami@studio.test', password: 'Shutter-speed-2026', businessName: 'Rami Studio', category: 'photography', phone: '+961 70 000 001', consent: true });
  assert.equal(p.status, 201);
});

test('provider ratings: sign-in required, one per customer, editable, removable', async () => {
  assert.deepEqual((await anon.req('GET', `/api/vendors/${vendorId}/my-rating`)).canRate, false);
  assert.equal((await anon.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 5 })).status, 401);
  let me = await A.req('GET', `/api/vendors/${vendorId}/my-rating`); assert.equal(me.canRate, true); assert.equal(me.mine, null);
  assert.equal((await A.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 0 })).status, 422);
  assert.equal((await A.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 6 })).status, 422);
  assert.equal((await A.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 2.5 })).status, 422);
  assert.equal((await A.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 4, body: 'Lovely photos, a bit late.' })).status, 201);
  assert.equal((await A.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 5, body: 'Lovely photos!' })).status, 200, 'second time updates');
  assert.equal((await B.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 2 })).status, 201);
  me = await A.req('GET', `/api/vendors/${vendorId}/my-rating`); assert.deepEqual(me.mine, { rating: 5, body: 'Lovely photos!', hidden: false });

  const pub = await anon.req('GET', `/api/vendors/${vendorId}/reviews`);
  assert.equal(pub.reviews.length, 2);
  const nour = pub.reviews.find(r => r.author === 'Nour H.'); assert.equal(nour.rating, 5); assert.equal(nour.verifiedBooking, false);
  const v = await anon.req('GET', `/api/vendors/${vendorId}`); assert.equal(v.vendor.rating, 3.5); assert.equal(v.vendor.reviewCount, 2);

  assert.equal((await B.req('DELETE', `/api/vendors/${vendorId}/rating`)).status, 200);
  assert.equal((await B.req('DELETE', `/api/vendors/${vendorId}/rating`)).status, 404);
  assert.equal((await anon.req('GET', `/api/vendors/${vendorId}`)).vendor.reviewCount, 1);
});

test('partners, demo listings and unknown providers can’t be rated', async () => {
  assert.equal((await P.req('PUT', `/api/vendors/${vendorId}/rating`, { rating: 1 })).status, 403);
  assert.equal((await A.req('PUT', `/api/vendors/${demoId}/rating`, { rating: 5 })).status, 409);
  assert.equal((await A.req('PUT', '/api/vendors/nope/rating', { rating: 5 })).status, 404);
  assert.equal((await A.req('GET', `/api/vendors/${demoId}/my-rating`)).reason, 'demo');
});

test('event-type ratings: public average, one per customer per type', async () => {
  assert.equal((await anon.req('PUT', '/api/event-ratings/wedding', { rating: 5 })).status, 401);
  assert.equal((await A.req('PUT', '/api/event-ratings/space-party', { rating: 5 })).status, 404);
  assert.equal((await A.req('PUT', '/api/event-ratings/wedding', { rating: 9 })).status, 422);
  assert.equal((await A.req('PUT', '/api/event-ratings/wedding', { rating: 3 })).status, 200);
  const r = await A.req('PUT', '/api/event-ratings/wedding', { rating: 5 }); assert.deepEqual(r.rating, { average: 5, count: 1 }, 'changing replaces the old rating');
  await B.req('PUT', '/api/event-ratings/wedding', { rating: 4 }); await B.req('PUT', '/api/event-ratings/birthday', { rating: 2 });
  const pub = await anon.req('GET', '/api/event-ratings');
  assert.deepEqual(pub.ratings.wedding, { average: 4.5, count: 2 }); assert.deepEqual(pub.ratings.birthday, { average: 2, count: 1 }); assert.deepEqual(pub.mine, {});
  assert.deepEqual((await B.req('GET', '/api/event-ratings')).mine, { wedding: 4, birthday: 2 });
});

test('a customer rates their own event only after its date', async () => {
  const e = await A.req('POST', '/api/events', { name: 'Our engagement', state: { eventType: 'engagement' } }); assert.equal(e.status, 201);
  const id = e.event.id;
  let g = await A.req('GET', `/api/events/${id}/rating`); assert.equal(g.canRate, false);
  assert.equal((await A.req('PUT', `/api/events/${id}/rating`, { rating: 5 })).status, 409, 'no date yet');
  await pool.query("UPDATE events SET event_date = $1 WHERE id = $2", [new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10), id]);
  assert.equal((await A.req('PUT', `/api/events/${id}/rating`, { rating: 5 })).status, 409, 'date still to come');
  await pool.query("UPDATE events SET event_date = $1 WHERE id = $2", [new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10), id]);
  assert.equal((await B.req('PUT', `/api/events/${id}/rating`, { rating: 1 })).status, 404, 'only the owner');
  assert.equal((await B.req('GET', `/api/events/${id}/rating`)).status, 404);
  assert.equal((await A.req('PUT', `/api/events/${id}/rating`, { rating: 7 })).status, 422);
  assert.equal((await A.req('PUT', `/api/events/${id}/rating`, { rating: 4, comment: 'The DJ was great; catering was late.' })).status, 200);
  g = await A.req('GET', `/api/events/${id}/rating`); assert.equal(g.canRate, true); assert.equal(g.rating, 4); assert.equal(g.comment, 'The DJ was great; catering was late.');
});

test('admins see every kind of rating and can hide a provider rating', async () => {
  assert.equal((await A.req('GET', '/api/admin/ratings')).status, 401);
  assert.equal((await admin.req('POST', '/api/admin/login', { email: 'chief@ma3ak.test', password: 'Chief-password-1234' })).status, 200);
  const r = await admin.req('GET', '/api/admin/ratings'); assert.equal(r.status, 200);
  assert.equal(r.events.length, 1); assert.equal(r.events[0].rating, 4); assert.equal(r.events[0].user_email, 'nour@example.test');
  assert.deepEqual(r.eventTypes.find(t => t.eventType === 'wedding'), { eventType: 'wedding', average: 4.5, count: 2 });
  const v = r.vendors.find(x => x.id === vendorId); assert.equal(v.count, 1); assert.equal(v.verified, 0);
  const all = await admin.req('GET', '/api/admin/reviews'); const rv = all.reviews.find(x => x.vendor_id === vendorId);
  assert.ok(rv, 'ratings without a booking appear in Reviews & reports'); assert.equal(rv.ref, null);
  assert.equal((await admin.req('POST', `/api/admin/reviews/${rv.id}`, { status: 'hidden' })).status, 200);
  assert.equal((await anon.req('GET', `/api/vendors/${vendorId}/reviews`)).reviews.length, 0);
  assert.equal((await A.req('GET', `/api/vendors/${vendorId}/my-rating`)).mine.hidden, true);
  const rep = await A.req('POST', '/api/reports', { type: 'review', id: rv.id, reason: 'spam' });
  assert.ok([404, 409, 422].includes(rep.status), 'a hidden rating can’t be reported');
});

test('deleting an account removes the ratings given without a booking', async () => {
  assert.equal((await A.req('DELETE', '/api/me', { password: 'Cedar-tree-garden-9' })).status, 200);
  const left = (await pool.query('SELECT COUNT(*)::int AS n FROM reviews WHERE vendor_id = $1', [vendorId])).rows[0].n; assert.equal(left, 0);
  const types = (await pool.query("SELECT COUNT(*)::int AS n FROM event_type_ratings WHERE event_type = 'wedding'")).rows[0].n; assert.equal(types, 1);
});
