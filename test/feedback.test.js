// Website feedback: visitors send ideas, problems and compliments; admins read and handle them.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { freshDatabase } from './db-helper.js';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const PORT = 5300 + Math.floor(Math.random() * 400), BASE = `http://127.0.0.1:${PORT}`, ORIGIN = BASE;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ma3ak-fb-'));
let proc, TESTDB, n = 1;
before(async () => {
  TESTDB = await freshDatabase('ma3ak_fb');
  proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: DATA, DATABASE_URL: TESTDB.url,
    SESSION_SECRET: 'f'.repeat(48), PUBLIC_ORIGIN: ORIGIN, TRUST_PROXY: '1', ADMIN_EMAIL: 'chief@ma3ak.test', ADMIN_PASSWORD: 'Chief-password-1234', AI_PROVIDER: '' }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) { try { if ((await fetch(BASE + '/api/health')).ok) return; } catch {} await new Promise(r => setTimeout(r, 150)); }
  throw new Error('server did not start');
});
after(async () => { proc.kill(); await new Promise(r => setTimeout(r, 300)); await TESTDB.drop(); fs.rmSync(DATA, { recursive: true, force: true }); });

function client() {
  const c = { cookie: '', csrf: '', ip: `198.51.100.${n++}` };
  c.req = async (method, p, body, headers = {}) => {
    const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': c.ip, ...(c.cookie ? { Cookie: c.cookie } : {}), ...(c.csrf ? { 'X-CSRF-Token': c.csrf } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc && /ma3ak_(user|sid)=/.test(sc)) c.cookie = sc.split(';')[0];
    const j = await r.json().catch(() => ({})); if (j.csrf) c.csrf = j.csrf; return { status: r.status, ...j };
  };
  return c;
}
const V1 = client(), V2 = client(), V3 = client(), C1 = client(), admin = client();

test('a visitor sends feedback without an account or email', async () => {
  const r = await V1.req('POST', '/api/feedback', { kind: 'idea', rating: 4, message: 'Please add a filter for venues by capacity.', page: '/vendors' });
  assert.equal(r.status, 201); assert.match(r.ref, /^F-\d{6}-[A-Z0-9]{6}$/);
});

test('feedback is validated', async () => {
  let r = await V2.req('POST', '/api/feedback', { kind: 'rant', message: 'Something here' }); assert.equal(r.status, 422); assert.ok(r.fields.kind);
  r = await V2.req('POST', '/api/feedback', { kind: 'problem', message: 'bad' }); assert.equal(r.status, 422); assert.ok(r.fields.message);
  r = await V2.req('POST', '/api/feedback', { kind: 'problem', message: 'Rating out of range', rating: 9 }); assert.equal(r.status, 422); assert.ok(r.fields.rating);
});

test('an email is only kept with consent; outside pages are not stored', async () => {
  let r = await V3.req('POST', '/api/feedback', { kind: 'problem', message: 'The date picker does not open on my phone.', email: 'maya@example.test' });
  assert.equal(r.status, 422); assert.ok(r.fields.consent);
  r = await V3.req('POST', '/api/feedback', { kind: 'problem', message: 'The date picker does not open on my phone.', email: 'Maya@Example.test', consent: true, page: 'https://evil.test/x', lang: 'ar' });
  assert.equal(r.status, 201);
});

test('bots and other websites are kept out', async () => {
  const bot = client();
  const trap = await bot.req('POST', '/api/feedback', { kind: 'other', message: 'Buy cheap things now', company_site: 'spam.test' });
  assert.equal(trap.status, 201, 'honeypot looks like success to the bot');
  const fast = await bot.req('POST', '/api/feedback', { kind: 'other', message: 'Too fast to be human', elapsed: 200 });
  assert.equal(fast.status, 201);
  const foreign = await client().req('POST', '/api/feedback', { kind: 'other', message: 'From another website' }, { Origin: 'https://evil.test' });
  assert.equal(foreign.status, 403);
  const flood = client();
  for (let i = 0; i < 3; i++) assert.equal((await flood.req('POST', '/api/feedback', { kind: 'other', message: `Message number ${i}` })).status, 201);
  assert.equal((await flood.req('POST', '/api/feedback', { kind: 'other', message: 'One too many' })).status, 429);
});

test('a signed-in customer’s feedback is linked to the account', async () => {
  const reg = await C1.req('POST', '/api/auth/register', { name: 'Nour Haddad', email: 'nour@example.test', password: 'Cedar-tree-garden-9', consent: true });
  assert.ok([200, 201].includes(reg.status), `register ${reg.status} ${reg.error || ''}`);
  const r = await C1.req('POST', '/api/feedback', { kind: 'praise', rating: 5, message: 'Booking my photographer was really easy!', page: '/bookings/abc-123' });
  assert.equal(r.status, 201);
});

test('only admins can read and handle feedback', async () => {
  assert.equal((await V1.req('GET', '/api/admin/feedback')).status, 401);
  assert.equal((await C1.req('GET', '/api/admin/feedback')).status, 401);
  const login = await admin.req('POST', '/api/admin/login', { email: 'chief@ma3ak.test', password: 'Chief-password-1234' }); assert.equal(login.status, 200);

  let r = await admin.req('GET', '/api/admin/feedback');
  assert.equal(r.status, 200);
  assert.equal(r.feedback.length, 6, 'spam traps were not stored'); assert.equal(r.counts.new, 6);
  assert.deepEqual(r.rating, { average: 4.5, count: 2 });
  const maya = r.feedback.find(f => f.email === 'maya@example.test'); assert.ok(maya, 'email saved in lower case');
  assert.equal(maya.page, '', 'a full URL is not kept as the page'); assert.equal(maya.lang, 'ar');
  const nour = r.feedback.find(f => f.kind === 'praise'); assert.equal(nour.user_email, 'nour@example.test'); assert.equal(nour.page, '/bookings/abc-123');
  assert.equal((await admin.req('GET', '/api/admin/overview')).overview.feedbackNew, 6);

  r = await admin.req('GET', '/api/admin/feedback?status=all&kind=problem'); assert.equal(r.feedback.length, 1);

  assert.equal((await admin.req('POST', `/api/admin/feedback/${maya.id}`, { status: 'closed' })).status, 422);
  assert.equal((await admin.req('POST', '/api/admin/feedback/999999', { status: 'done' })).status, 404);
  assert.equal((await admin.req('POST', `/api/admin/feedback/${maya.id}`, { status: 'done', note: 'Fixed in the next release.' })).status, 200);
  assert.equal((await admin.req('POST', `/api/admin/feedback/${maya.id}`, { status: 'read' })).status, 200, 'status change without a note keeps the note');
  r = await admin.req('GET', '/api/admin/feedback?status=read'); const back = r.feedback.find(f => f.id === maya.id);
  assert.equal(back.admin_note, 'Fixed in the next release.'); assert.equal(r.counts.new, 5);

  const noCsrf = await fetch(BASE + `/api/admin/feedback/${maya.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, Cookie: admin.cookie }, body: JSON.stringify({ status: 'spam' }) });
  assert.equal(noCsrf.status, 403, 'changes need the CSRF token');
  const act = await admin.req('GET', '/api/admin/audit'); assert.ok(act.rows.some(a => a.action === 'feedback_done'));
});

test('the feedback page is part of the site bundle and translated', async () => {
  const js = await (await fetch(BASE + '/')).text(); const src = js.match(/\/assets\/app\.js\?v=\w+/)[0];
  const app = await (await fetch(BASE + src)).text();
  assert.ok(app.includes('[/^\\/feedback$/, FeedbackPage]'), 'route registered');
  assert.ok(app.includes("['Send feedback','أرسل ملاحظاتك','Envoyer un avis']"), 'Arabic and French labels');
});
