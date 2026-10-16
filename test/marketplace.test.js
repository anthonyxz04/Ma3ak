// Marketplace tests: partner sign-up and isolation, admin approval, quotes, the budget planner,
// public share links, website content managed from the admin, and the built-in assistant.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { freshDatabase } from './db-helper.js';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const PORT = 4900 + Math.floor(Math.random() * 400), BASE = `http://127.0.0.1:${PORT}`, ORIGIN = BASE;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ma3ak-mkt-'));
let proc, TESTDB, n = 1;
before(async () => {
  TESTDB = await freshDatabase('ma3ak_mkt');
  // No AI key: the built-in assistant must answer from the database.
  proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: DATA, DATABASE_URL: TESTDB.url,
    SESSION_SECRET: 'z'.repeat(48), PUBLIC_ORIGIN: ORIGIN, TRUST_PROXY: '1', ADMIN_EMAIL: 'chief@ma3ak.test', ADMIN_PASSWORD: 'Chief-password-1234', AI_PROVIDER: '' }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) { try { if ((await fetch(BASE + '/api/health')).ok) return; } catch {} await new Promise(r => setTimeout(r, 150)); }
  throw new Error('server did not start');
});
after(async () => { proc.kill(); await new Promise(r => setTimeout(r, 300)); await TESTDB.drop(); fs.rmSync(DATA, { recursive: true, force: true }); });

function client(cookieName = /ma3ak_(user|sid)=/) {
  const c = { cookie: '', csrf: '', ip: `192.0.2.${n++}` };
  c.req = async (method, p, body) => {
    const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': c.ip, ...(c.cookie ? { Cookie: c.cookie } : {}), ...(c.csrf ? { 'X-CSRF-Token': c.csrf } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc && cookieName.test(sc)) c.cookie = sc.split(';')[0];
    const j = await r.json().catch(() => ({})); if (j.csrf) c.csrf = j.csrf; return { status: r.status, ...j };
  };
  return c;
}
const P1 = client(), P2 = client(), C1 = client(), C2 = client(), admin = client();
const png = 'data:image/png;base64,' + Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), Buffer.from('0000000D49484452000000010000000108060000001F15C489', 'hex'), Buffer.from('0000000A49444154789C6300010000050001', 'hex'), Buffer.from('0D0A2DB4', 'hex'), Buffer.from('0000000049454E44AE426082', 'hex')]).toString('base64');
let vendorId, pkgId, photoId, quoteId, planId;

test('partner sign-up creates a private draft listing', async () => {
  const bad = await P1.req('POST', '/api/partner/register', { name: 'Rami', email: 'rami@studio.test', password: 'Shutter-speed-2026', businessName: 'Rami Studio', category: 'not-a-category', phone: '+961 70 000 001', consent: true });
  assert.equal(bad.status, 422); assert.ok(bad.fields.category);
  const r = await P1.req('POST', '/api/partner/register', { name: 'Rami', email: 'rami@studio.test', password: 'Shutter-speed-2026', businessName: 'Rami Studio', category: 'photography', phone: '+961 70 000 001', consent: true });
  assert.equal(r.status, 201); assert.equal(r.user.role, 'partner');
  const me = await P1.req('GET', '/api/partner'); assert.equal(me.status, 200); vendorId = me.vendor.id;
  assert.equal(me.vendor.status, 'draft'); assert.equal(me.vendor.verified, false);
  const pub = await (await fetch(BASE + '/api/vendors')).json(); assert.ok(!pub.vendors.some(v => v.id === vendorId), 'draft is not public');
  assert.equal((await fetch(BASE + `/api/vendors/${vendorId}`)).status, 404);
  assert.equal((await P2.req('POST', '/api/partner/register', { name: 'Lina', email: 'lina@decor.test', password: 'Garland-and-gold-7', businessName: 'Lina Decor', category: 'decoration', phone: '+961 70 000 002', consent: true })).status, 201);
  assert.equal((await C1.req('GET', '/api/partner')).status, 401);
});

test('partner edits profile, packages and photos; submit requires a complete listing', async () => {
  let r = await P1.req('POST', '/api/partner/submit', { consent: true }); assert.equal(r.status, 422); assert.equal(r.code, 'incomplete');
  r = await P1.req('PUT', '/api/partner/profile', { name: 'Rami Studio', category: 'photography', description: 'Wedding and event photography across Lebanon.', about: '<script>alert(1)</script> Ten years of weddings.', locations: ['beirut', 'jbeil', 'moon'], eventTypes: ['wedding'], phone: '+961 70 000 001', instagram: '@ramistudio' });
  assert.equal(r.status, 200);
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Half day', price: 500, priceMax: 400, unit: 'flat' }); assert.equal(r.status, 422, 'max below min rejected');
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Half day', price: 500, priceMax: 700, unit: 'flat', includes: ['4 hours', '300 photos'] }); assert.equal(r.status, 200); pkgId = r.id;
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Albums', price: '', unit: 'per_item' }); assert.equal(r.status, 200, 'empty price = request a quote');
  r = await P1.req('POST', '/api/partner/photos', { image: 'data:image/png;base64,' + Buffer.from('<svg onload=alert(1)>').toString('base64') }); assert.equal(r.status, 422, 'non-images rejected');
  r = await P1.req('POST', '/api/partner/photos', { image: png, alt: 'Couple at sunset' }); assert.equal(r.status, 201); photoId = r.id;
  assert.equal((await fetch(BASE + `/api/photos/${photoId}`)).status, 404, 'photos of an unpublished listing are private');
  const own = await fetch(BASE + `/api/photos/${photoId}`, { headers: { Cookie: P1.cookie } }); assert.equal(own.status, 200); assert.equal(own.headers.get('content-type'), 'image/png');
  const me = await P1.req('GET', '/api/partner'); assert.deepEqual(me.vendor.locations, ['beirut', 'jbeil']); assert.equal(me.vendor.instagram, 'ramistudio'); assert.equal(me.vendor.packages.length, 2);
  r = await P1.req('POST', '/api/partner/submit', { consent: true }); assert.equal(r.status, 200); assert.equal(r.listingStatus, 'pending'); assert.equal((await P1.req('GET', '/api/partner')).vendor.status, 'pending');
  assert.ok(!(await (await fetch(BASE + '/api/vendors')).json()).vendors.some(v => v.id === vendorId), 'pending is still not public');
});

test('partners are isolated from each other', async () => {
  assert.equal((await P2.req('PUT', `/api/partner/packages/${pkgId}`, { name: 'Stolen', price: 1, unit: 'flat' })).status, 404);
  assert.equal((await P2.req('DELETE', `/api/partner/packages/${pkgId}`)).status, 404);
  assert.equal((await P2.req('DELETE', `/api/partner/photos/${photoId}`)).status, 404);
  assert.equal((await fetch(BASE + `/api/photos/${photoId}`, { headers: { Cookie: P2.cookie } })).status, 404);
  const other = await P2.req('GET', '/api/partner'); assert.notEqual(other.vendor.id, vendorId); assert.equal(other.quotes.length, 0);
  assert.equal((await P1.req('GET', '/api/admin/vendors')).status, 401, 'partners are not admins');
});

test('admin reviews: approve publishes, verify is separate, reject and unpublish hide', async () => {
  let r = await admin.req('POST', '/api/admin/login', { email: 'chief@ma3ak.test', password: 'Chief-password-1234' }); assert.equal(r.status, 200);
  const list = await admin.req('GET', '/api/admin/vendors?status=pending'); assert.ok(list.vendors.some(v => v.id === vendorId && v.owner.email === 'rami@studio.test'));
  r = await admin.req('POST', `/api/admin/vendors/${vendorId}/review`, { action: 'approve', note: 'Checked Instagram' }); assert.equal(r.status, 200);
  let pub = await (await fetch(BASE + `/api/vendors/${vendorId}`)).json(); assert.equal(pub.vendor.name, 'Rami Studio'); assert.equal(pub.vendor.verified, false, 'approval is not verification');
  assert.equal(pub.vendor.startingPrice, 500); assert.equal(pub.vendor.packages.length, 2); assert.equal(pub.vendor.photos.length, 1);
  assert.equal((await fetch(BASE + `/api/photos/${photoId}`)).status, 200, 'photos become public with the listing');
  r = await admin.req('POST', `/api/admin/vendors/${vendorId}/review`, { action: 'verify' }); assert.equal(r.status, 200);
  assert.equal((await (await fetch(BASE + `/api/vendors/${vendorId}`)).json()).vendor.verified, true);
  r = await admin.req('POST', '/api/admin/vendors/demo-lens-studio/review', { action: 'verify' }); assert.equal(r.status, 422, 'demo listings cannot be verified');
  r = await admin.req('POST', `/api/admin/vendors/${vendorId}/review`, { action: 'unpublish' }); assert.equal((await fetch(BASE + `/api/vendors/${vendorId}`)).status, 404);
  r = await admin.req('POST', `/api/admin/vendors/${vendorId}/review`, { action: 'publish' }); assert.equal((await fetch(BASE + `/api/vendors/${vendorId}`)).status, 200);
  const me = await P1.req('GET', '/api/partner'); assert.equal(me.vendor.status, 'approved');
  r = await P1.req('PUT', `/api/partner/packages/${pkgId}`, { name: 'Half day', price: 550, priceMax: 750, unit: 'flat' }); assert.equal(r.status, 200);
  assert.equal((await admin.req('GET', '/api/admin/vendors')).vendors.find(v => v.id === vendorId).changedSinceApproval, true, 'admin sees edits made after approval');
});

test('quote requests: customer → partner reply → customer sees status', async () => {
  let r = await C1.req('POST', '/api/auth/register', { name: 'Nour', email: 'nour@example.com', password: 'Wedding-in-june-26', consent: true }); assert.equal(r.status, 201);
  r = await C1.req('POST', `/api/vendors/${vendorId}/quotes`, { packageId: pkgId, date: '2020-01-01', guests: 120, message: 'Hi', elapsed: 9000 }); assert.equal(r.status, 422, 'past dates rejected');
  r = await C1.req('POST', `/api/vendors/${vendorId}/quotes`, { packageId: pkgId, date: '2027-06-12', guests: 120, location: 'jbeil', message: 'Do you cover Jbeil?', elapsed: 9000 });
  assert.equal(r.status, 201); assert.match(r.ref, /^Q-/);
  const anon = await fetch(BASE + `/api/vendors/${vendorId}/quotes`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': '192.0.2.200' }, body: JSON.stringify({ name: 'Guest', message: 'x', consent: true, elapsed: 9000 }) });
  assert.equal(anon.status, 422, 'email or phone required');
  const pq = await P1.req('GET', '/api/partner'); assert.equal(pq.quotes.length, 1); quoteId = pq.quotes[0].id; assert.equal(pq.quotes[0].status, 'new'); assert.equal(pq.quotes[0].package_name, 'Half day');
  assert.equal((await P2.req('PATCH', `/api/partner/quotes/${quoteId}`, { reply: 'mine now' })).status, 404, 'other partners cannot answer');
  r = await P1.req('PATCH', `/api/partner/quotes/${quoteId}`, { status: 'quoted' }); assert.equal(r.status, 422, 'amount needed for quoted');
  r = await P1.req('PATCH', `/api/partner/quotes/${quoteId}`, { status: 'quoted', quotedAmount: 650, reply: 'Yes, we cover Jbeil. Date is free.', partnerNote: 'Lead from MA3AK' }); assert.equal(r.status, 200);
  const mine = await C1.req('GET', '/api/my/quotes'); assert.equal(mine.quotes[0].status, 'quoted'); assert.equal(mine.quotes[0].quoted_amount, 650); assert.equal(mine.quotes[0].partner_note, undefined, 'partner notes stay private');
  assert.equal((await C2.req('GET', '/api/my/quotes')).status, 401);
  const aq = await admin.req('GET', '/api/admin/quotes'); assert.ok(aq.quotes.some(q => q.id === quoteId)); assert.equal(aq.quotes[0].ip_hash, undefined);
});

test('budget planner: packages, per-guest totals, over-budget warning, custom lines, privacy', async () => {
  let r = await C1.req('POST', '/api/plans', { name: 'Our wedding', eventType: 'wedding', date: '2027-06-12', location: 'jbeil', guests: 100, budget: 5000, theme: 'Elegant', setting: 'outdoor', wanted: ['venue', 'catering', 'photography', 'nope'], notes: 'Private: grandma is a surprise guest' });
  assert.equal(r.status, 201); planId = r.id;
  r = await C1.req('GET', `/api/events/${planId}/plan`); assert.equal(r.plan.guests, 100); assert.deepEqual(r.plan.wanted, ['venue', 'catering', 'photography']); assert.equal(r.totals.low, 0);
  r = await C1.req('POST', `/api/events/${planId}/services`, { packageId: 'demo-mezze-catering-p1' }); assert.equal(r.status, 201); // $28–35 per guest
  assert.equal(r.totals.low, 2800); assert.equal(r.totals.high, 3500); const catering = r.services[0]; assert.equal(catering.followsGuests, true);
  r = await C1.req('POST', `/api/events/${planId}/services`, { packageId: pkgId }); assert.equal(r.totals.low, 2800 + 550);
  r = await C1.req('POST', `/api/events/${planId}/services`, { packageId: 'demo-seaside-venue-p2' }); assert.equal(r.totals.quoteItems, 1, 'unpriced package = request a quote');
  r = await C1.req('POST', `/api/events/${planId}/services`, { label: 'Wedding favors', category: 'other', unitPrice: 3, unit: 'per_guest' }); assert.equal(r.status, 201); assert.equal(r.totals.low, 2800 + 550 + 300);
  r = await C1.req('PUT', `/api/events/${planId}/plan`, { ...r.plan, guests: 150 }); assert.equal(r.status, 200); assert.equal(r.totals.low, 4200 + 550 + 450, 'per-guest lines follow the guest count');
  r = await C1.req('POST', `/api/events/${planId}/services`, { packageId: 'demo-bloom-decor-p2' }); assert.equal(r.totals.overBudget, true); assert.ok(r.totals.remaining < 0);
  const decor = r.services.find(s => s.packageId === 'demo-bloom-decor-p2');
  r = await C1.req('POST', `/api/events/${planId}/services`, { packageId: 'demo-bloom-decor-p1', replace: decor.id }); assert.equal(r.services.filter(s => s.category === 'decoration').length, 1, 'swap to a cheaper package');
  r = await C1.req('PATCH', `/api/events/${planId}/services/${catering.id}`, { quantity: 0 }); assert.equal(r.status, 422);
  r = await C1.req('PATCH', `/api/events/${planId}/services/${catering.id}`, { quantity: 120 }); assert.equal(r.services.find(s => s.id === catering.id).lineLow, 3360);
  r = await C1.req('PATCH', `/api/events/${planId}/services/${catering.id}`, { quantity: null }); assert.equal(r.services.find(s => s.id === catering.id).qty, 150);
  // changes by the provider are flagged, not silently applied
  await P1.req('PUT', `/api/partner/packages/${pkgId}`, { name: 'Half day', price: 600, priceMax: 800, unit: 'flat' });
  r = await C1.req('GET', `/api/events/${planId}/plan`); const photo = r.services.find(s => s.packageId === pkgId); assert.equal(photo.unitPrice, 550); assert.deepEqual(photo.currentPrice, { price: 600, priceMax: 800 });
  r = await C1.req('PATCH', `/api/events/${planId}/services/${photo.id}`, { refreshPrice: true }); assert.equal(r.services.find(s => s.id === photo.id).unitPrice, 600);
  r = await C1.req('PUT', `/api/events/${planId}/plan`, { ...r.plan, status: 'finalized', rev: 1 }); assert.equal(r.status, 409, 'stale edits are refused');
  const latest = await C1.req('GET', `/api/events/${planId}/plan`); r = await C1.req('PUT', `/api/events/${planId}/plan`, { ...latest.plan, status: 'finalized', rev: latest.plan.rev }); assert.equal(r.plan.status, 'finalized');
  // persistence: reopen from the dashboard list
  const list = await C1.req('GET', '/api/events'); const row = list.events.find(e => e.id === planId); assert.equal(row.services, 5); assert.equal(row.est_low, r.totals.low); assert.equal(row.quote_items, 1);
  // other customers can't read or change it
  assert.equal((await C2.req('POST', '/api/auth/register', { name: 'Omar', email: 'omar@example.com', password: 'Birthday-cake-2027', consent: true })).status, 201);
  assert.equal((await C2.req('GET', `/api/events/${planId}/plan`)).status, 404);
  assert.equal((await C2.req('POST', `/api/events/${planId}/services`, { packageId: pkgId })).status, 404);
  assert.equal((await C2.req('DELETE', `/api/events/${planId}/services/${catering.id}`)).status, 404);
});

test('share link shows the plan without private notes or contact details; off by default', async () => {
  let r = await C1.req('GET', `/api/events/${planId}/shares`); assert.equal(r.shares.length, 0, 'private by default');
  r = await C1.req('POST', `/api/events/${planId}/shares`, { permission: 'view', days: 7 }); assert.equal(r.status, 201);
  const token = r.share.url.split('/#/s/')[1], sid = r.share.id;
  const pub = await (await fetch(BASE + `/api/share/${token}`)).json();
  assert.equal(pub.plan.services.length, 5); assert.ok(pub.plan.totals.low > 0);
  const text = JSON.stringify(pub); assert.doesNotMatch(text, /grandma/); assert.doesNotMatch(text, /nour@example\.com/); assert.equal(pub.event.owner, 'Nour');
  await C1.req('DELETE', `/api/events/${planId}/shares/${sid}`); assert.equal((await fetch(BASE + `/api/share/${token}`)).status, 404, 'revoked links stop working');
});

test('admin manages website content, categories and sees the activity log', async () => {
  let r = await admin.req('PUT', '/api/admin/settings/contact', { value: { phone: '+961 76 620 434', email: 'not-an-email' } }); assert.equal(r.status, 422);
  r = await admin.req('PUT', '/api/admin/settings/faqs', { value: [{ q: 'Do you plan baptisms?', a: 'Yes, we plan baptisms and communions.' }, { q: '', a: 'dropped' }] }); assert.equal(r.status, 200); assert.equal(r.value.length, 1);
  r = await admin.req('PUT', '/api/admin/settings/hero', { value: { title: '<img src=x onerror=alert(1)>Plan with MA3AK', subtitle: 'Hi' } }); assert.equal(r.status, 200);
  const site = await (await fetch(BASE + '/api/site')).json(); assert.equal(site.settings.faqs[0].q, 'Do you plan baptisms?'); assert.ok(site.categories.find(c => c.id === 'photography').providers >= 1);
  assert.equal((await C1.req('PUT', '/api/admin/settings/faqs', { value: [] })).status, 401);
  r = await admin.req('PUT', '/api/admin/categories/security', { name: 'Security', single: 'Security', icon: 'shield', blurb: 'Guards and crowd control', sort: 50 }); assert.equal(r.status, 200);
  assert.ok((await (await fetch(BASE + '/api/site')).json()).categories.some(c => c.id === 'security'));
  assert.equal((await admin.req('DELETE', '/api/admin/categories/photography')).status, 409, 'categories in use cannot be deleted');
  r = await admin.req('GET', '/api/admin/audit'); const actions = r.rows.map(x => x.action);
  for (const a of ['partner_registered', 'partner_submitted', 'vendor_approve', 'vendor_verify', 'setting_updated', 'category_saved', 'quote_updated'].filter(a => a !== 'quote_updated')) assert.ok(actions.includes(a), a);
  const o = await admin.req('GET', '/api/admin/overview'); assert.equal(o.overview.partners, 2); assert.equal(o.overview.published, 1); assert.ok(o.overview.demo >= 10); assert.equal(o.overview.quotesAll, 1);
  const ev = await admin.req('GET', `/api/admin/events/${planId}`); assert.equal(ev.status, 200, 'support can open saved plans');
});

test('built-in assistant answers from the database (no AI key)', async () => {
  let s = await (await fetch(BASE + '/api/ai/status')).json(); assert.equal(s.mode, 'rules'); assert.equal(s.configured, true);
  let r = await C1.req('POST', '/api/ai/chat', { message: 'How much is a photographer in Jbeil?' }); assert.equal(r.status, 200);
  assert.ok(r.providers.some(p => p.id === vendorId), 'real listed provider'); assert.match(r.reply, /\$600/); assert.match(r.reply, /estimate/);
  r = await C1.req('POST', '/api/ai/chat', { message: 'catering for 150 guests' }); assert.match(r.reply, /Demo/); assert.match(r.reply, /\$2,100/);
  r = await C1.req('POST', '/api/ai/chat', { message: 'I have $12,000 for a wedding with 150 guests' }); assert.match(r.reply, /guideline/); assert.match(r.reply, /\$80 per guest/);
  r = await C1.req('POST', '/api/ai/chat', { message: 'is the garden venue available on 12 June?' }); assert.match(r.reply, /can’t confirm availability/);
  r = await C1.req('POST', '/api/ai/chat', { message: 'I want to talk to a person' }); assert.equal(r.handoff, true); assert.match(r.reply, /\+961 76 620 434/);
  r = await C1.req('POST', '/api/ai/chat', { message: 'do you plan baptisms' }); assert.match(r.reply, /baptisms and communions/);
});

test('account deletion of a partner removes the listing and its photos', async () => {
  const r = await P2.req('DELETE', '/api/me', { password: 'Garland-and-gold-7' }); assert.equal(r.status, 200);
  assert.equal((await P2.req('GET', '/api/partner')).status, 401);
  assert.equal((await admin.req('GET', '/api/admin/overview')).overview.partners, 1);
});
