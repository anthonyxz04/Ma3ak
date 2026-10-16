// End-to-end security & behaviour tests. Run: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { freshDatabase } from './db-helper.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PORT = 3900 + Math.floor(Math.random() * 500), BASE = `http://127.0.0.1:${PORT}`, ORIGIN = BASE;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ma3ak-test-'));
const ADMIN = { email: 'owner@ma3ak.test', password: 'Correct-horse-42-battery' };
let proc, ipN = 1;
const ip = () => `203.0.113.${ipN++}`;

let TESTDB;
before(async () => {
  TESTDB = await freshDatabase('ma3ak_smoke');
  proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: DATA, DATABASE_URL: TESTDB.url, SESSION_SECRET: 'x'.repeat(48), PUBLIC_ORIGIN: ORIGIN, TRUST_PROXY: '1', ADMIN_EMAIL: ADMIN.email, ADMIN_PASSWORD: ADMIN.password }, stdio: ['ignore', 'pipe', 'pipe'] });
  for (let i = 0; i < 60; i++) { try { const r = await fetch(BASE + '/api/health'); if (r.ok) return; } catch {} await new Promise(r => setTimeout(r, 150)); }
  throw new Error('server did not start');
});
after(async () => { proc.kill(); await new Promise(r => setTimeout(r, 300)); await TESTDB.drop(); fs.rmSync(DATA, { recursive: true, force: true }); });

const post = (p, body, { origin = ORIGIN, from = ip(), headers = {}, raw } = {}) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}), 'X-Forwarded-For': from, ...headers }, body: raw ?? JSON.stringify(body) });
const contact = (extra = {}) => ({ name: 'Maya', email: 'maya@example.com', subject: 'Wedding in June', message: 'We would like help planning our wedding.', consent: true, elapsed: 9000, ...extra });

test('home page: security headers, no inline scripts', async () => {
  const r = await fetch(BASE + '/'); assert.equal(r.status, 200);
  const csp = r.headers.get('content-security-policy');
  assert.match(csp, /script-src 'self'/); assert.match(csp, /frame-ancestors 'none'/); assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff'); assert.equal(r.headers.get('x-frame-options'), 'DENY'); assert.match(r.headers.get('strict-transport-security'), /max-age/);
  const html = await r.text(); assert.match(html, /<title>Ma3ak<\/title>/); assert.doesNotMatch(html, /<script>(?!<\/script>)/);
});
test('static files: assets served, traversal blocked', async () => {
  assert.equal((await fetch(BASE + '/assets/app.js')).status, 200);
  for (const p of ['/../server/config.js', '/%2e%2e/server/config.js', '/..%2fpackage.json', '/data/ma3ak.db', '/server/index.js']) assert.equal((await fetch(BASE + p)).status, 404, p);
});
test('contact: validation, success, origin, content type, size', async () => {
  let r = await post('/api/contact', contact({ email: 'not-an-email' })); assert.equal(r.status, 422); assert.ok((await r.json()).fields.email);
  r = await post('/api/contact', contact({ consent: false })); assert.equal(r.status, 422);
  r = await post('/api/contact', contact()); assert.equal(r.status, 201); assert.match((await r.json()).ref, /^MA3-\d{6}-[A-Z2-9]{6}$/);
  r = await post('/api/contact', contact(), { origin: 'https://evil.example' }); assert.equal(r.status, 403);
  r = await post('/api/contact', contact(), { origin: null }); assert.equal(r.status, 403);
  r = await post('/api/contact', null, { headers: { 'Content-Type': 'text/plain' }, raw: 'hi' }); assert.equal(r.status, 415);
  r = await post('/api/contact', contact({ message: 'x'.repeat(70000) })); assert.equal(r.status, 413);
});
test('spam traps: honeypot and instant submissions are accepted silently but not stored', async () => {
  assert.equal((await post('/api/contact', contact({ name: 'Bot One', company_site: 'http://spam' }))).status, 200);
  assert.equal((await post('/api/contact', contact({ name: 'Bot Two', elapsed: 200 }))).status, 200);
});
test('rate limiting per visitor', async () => {
  const from = ip(); const codes = [];
  for (let i = 0; i < 5; i++) codes.push((await post('/api/contact', contact(), { from })).status);
  assert.deepEqual(codes.slice(0, 3), [201, 201, 201]); assert.equal(codes[3], 429);
});
test('event request with images: stored, EXIF stripped', async () => {
  // JPEG with an APP1 (EXIF) segment containing "GPS-SECRET"
  const exif = Buffer.concat([Buffer.from([0xFF, 0xE1, 0x00, 0x12]), Buffer.from('Exif\0\0GPS-SECRET')]);
  const jpeg = Buffer.concat([Buffer.from([0xFF, 0xD8]), Buffer.from([0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00]), exif, Buffer.from([0xFF, 0xDA, 0x00, 0x02, 0x11, 0x22, 0xFF, 0xD9])]);
  const body = { contact: { fullName: 'Karim', phone: '+961 76 000 000' }, choices: { eventType: 'wedding', guests: 120, colors: ['Gold'], __proto__: { hacked: 1 }, _add: [{ id: 'u1', type: 'round', x: 1, z: 2, ry: 0 }] }, design: { venue: 'Garden', items: ['10× Round table'], custom: 1, photo: true }, text: 'MA3AK EVENT REQUEST', images: { venue: 'data:image/jpeg;base64,' + jpeg.toString('base64') }, consent: true, elapsed: 60000 };
  let r = await post('/api/requests', body); assert.equal(r.status, 201);
  r = await post('/api/requests', { ...body, images: { venue: 'data:image/jpeg;base64,' + Buffer.from('<script>alert(1)</script>').toString('base64') } }); assert.equal(r.status, 422);
  r = await post('/api/requests', { ...body, choices: {} }); assert.equal(r.status, 422);
  r = await post('/api/requests', { ...body, images: { venue: 'data:image/jpeg;base64,' + Buffer.from([0xFF,0xD8,0xFF,0xE1,0x7F,0xFF,1,2,3]).toString('base64') } }); assert.equal(r.status, 422, 'malformed jpeg rejected');
  const files = fs.readdirSync(path.join(DATA, 'uploads')); assert.equal(files.length, 1);
  const saved = fs.readFileSync(path.join(DATA, 'uploads', files[0])); assert.ok(!saved.includes('GPS-SECRET')); assert.equal(saved[0], 0xFF);
});

let cookie = '', csrf = '';
test('admin: auth required, login, CSRF, lockout', async () => {
  assert.equal((await fetch(BASE + '/api/admin/requests')).status, 401);
  let r = await post('/api/admin/login', { email: ADMIN.email, password: 'wrong-password-1' }); assert.equal(r.status, 401);
  r = await post('/api/admin/login', { email: 'nobody@x.com', password: 'whatever-123' }); assert.equal(r.status, 401);
  r = await post('/api/admin/login', ADMIN); assert.equal(r.status, 200);
  const set = r.headers.get('set-cookie'); assert.match(set, /__Host-ma3ak_sid=/); assert.match(set, /HttpOnly/); assert.match(set, /SameSite=Strict/); assert.match(set, /Secure/);
  cookie = set.split(';')[0]; csrf = (await r.json()).csrf;
  r = await fetch(BASE + '/api/admin/requests', { headers: { Cookie: cookie } }); assert.equal(r.status, 200);
  const j = await r.json(); assert.ok(j.rows.every(x => !/^Bot/.test(x.name)), 'spam not stored'); assert.ok(j.rows.some(x => x.type === 'event'));
  const id = j.rows.find(x => x.type === 'event').id;
  r = await fetch(BASE + `/api/admin/requests/${id}`, { method: 'PATCH', headers: { Cookie: cookie, 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ status: 'contacted' }) }); assert.equal(r.status, 403, 'missing CSRF');
  r = await fetch(BASE + `/api/admin/requests/${id}`, { method: 'PATCH', headers: { Cookie: cookie, 'Content-Type': 'application/json', Origin: ORIGIN, 'X-CSRF-Token': csrf }, body: JSON.stringify({ status: 'contacted', notes: 'Called back' }) }); assert.equal(r.status, 200);
  r = await fetch(BASE + `/api/admin/requests/${id}`, { method: 'PATCH', headers: { Cookie: cookie, 'Content-Type': 'application/json', Origin: 'https://evil.example', 'X-CSRF-Token': csrf }, body: JSON.stringify({ status: 'closed' }) }); assert.equal(r.status, 403, 'cross-origin');
  r = await fetch(BASE + `/api/admin/requests/${id}`, { headers: { Cookie: cookie } }); const d = await r.json();
  assert.equal(d.request.status, 'contacted'); assert.equal(d.request.ip_hash, undefined); assert.equal(d.request.payload.choices.hacked, undefined); assert.equal(d.files.length, 1);
  r = await fetch(BASE + `/api/admin/files/${d.files[0].id}`, { headers: { Cookie: cookie } }); assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'image/jpeg');
  assert.equal((await fetch(BASE + `/api/admin/files/${d.files[0].id}`)).status, 401);
});
test('admin: CSV export neutralises spreadsheet formulas', async () => {
  await post('/api/contact', contact({ name: '=HYPERLINK("http://evil")' }));
  const r = await fetch(BASE + '/api/admin/export.csv', { headers: { Cookie: cookie } }); assert.equal(r.status, 200);
  const csv = await r.text(); assert.ok(csv.includes(`"'=HYPERLINK(""http://evil"")"`));
});
test('admin: account locks after repeated failures', async () => {
  const codes = []; for (let i = 0; i < 8; i++) codes.push((await post('/api/admin/login', { email: ADMIN.email, password: 'bad-password-' + i }, { from: ip() })).status);
  assert.ok(codes.includes(429)); const r = await post('/api/admin/login', ADMIN); assert.equal(r.status, 429, 'locked even with the right password');
});
test('admin: logout invalidates the session', async () => {
  const r = await fetch(BASE + '/api/admin/logout', { method: 'POST', headers: { Cookie: cookie, Origin: ORIGIN, 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' }, body: '{}' }); assert.equal(r.status, 200);
  assert.equal((await fetch(BASE + '/api/admin/me', { headers: { Cookie: cookie } })).status, 401);
});
test('admin pages are not indexable', async () => {
  const r = await fetch(BASE + '/admin/'); assert.equal(r.status, 200); assert.match(r.headers.get('x-robots-tag'), /noindex/); assert.match(r.headers.get('content-security-policy'), /style-src 'self';/);
});
