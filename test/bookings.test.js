// Marketplace v2 tests: vendor verification with private documents, listing order, bookings and the
// status rules, quotes with revisions and the price lock, payments, commission, plans, messaging privacy,
// reviews, notifications, availability and share-link privacy. Runs against a fresh Postgres database.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { freshDatabase } from './db-helper.js';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const PORT = 5300 + Math.floor(Math.random() * 400), BASE = `http://127.0.0.1:${PORT}`, ORIGIN = BASE;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ma3ak-book-'));
let proc, TESTDB, n = 1;
before(async () => {
  TESTDB = await freshDatabase('ma3ak_book');
  proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: DATA, DATABASE_URL: TESTDB.url,
    SESSION_SECRET: 'y'.repeat(48), PUBLIC_ORIGIN: ORIGIN, TRUST_PROXY: '1', ADMIN_EMAIL: 'chief@ma3ak.test', ADMIN_PASSWORD: 'Chief-password-1234', AI_PROVIDER: '' }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) { try { if ((await fetch(BASE + '/api/health')).ok) return; } catch {} await new Promise(r => setTimeout(r, 150)); }
  throw new Error('server did not start');
});
after(async () => { proc.kill(); await new Promise(r => setTimeout(r, 300)); await TESTDB.drop(); fs.rmSync(DATA, { recursive: true, force: true }); });

function client() {
  const c = { cookie: '', csrf: '', ip: `198.51.100.${n++}` };
  c.raw = (method, p, body) => fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': c.ip, ...(c.cookie ? { Cookie: c.cookie } : {}), ...(c.csrf ? { 'X-CSRF-Token': c.csrf } : {}) }, body: body ? JSON.stringify(body) : undefined });
  c.req = async (method, p, body) => {
    const r = await c.raw(method, p, body);
    const sc = r.headers.get('set-cookie'); if (sc && /ma3ak_(user|sid)=/.test(sc)) c.cookie = sc.split(';')[0];
    const j = await r.json().catch(() => ({})); if (j.csrf) c.csrf = j.csrf; return { status: r.status, ...j };
  };
  return c;
}
const P1 = client(), P2 = client(), C1 = client(), C2 = client(), admin = client();
const png = 'data:image/png;base64,' + Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), Buffer.from('0000000D49484452000000010000000108060000001F15C489', 'hex'), Buffer.from('0000000A49444154789C6300010000050001', 'hex'), Buffer.from('0D0A2DB4', 'hex'), Buffer.from('0000000049454E44AE426082', 'hex')]).toString('base64');
const pdf = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n').toString('base64');
const day = n => { const d = new Date(Date.now() + n * 864e5); return d.toISOString().slice(0, 10); };
const key = () => 'k-' + Math.random().toString(36).slice(2, 12);
let V1, fixedPkg, startPkg, docId, B1, B2, termsVersion;
const act = (c, id, action, extra = {}) => c.req('POST', `/api/bookings/${id}/action`, { action, ...extra });
const bookingForm = (over = {}) => ({ vendorId: V1, name: 'Maya Haddad', email: 'maya@guest.test', phone: '+961 3 123 456', eventType: 'wedding', date: day(60), time: '19:30', location: 'beirut', guests: 150, notes: 'Call me on 03 123 456 please', confirm: true, ...over });

test('setup: admin, partners, customers', async () => {
  assert.equal((await admin.req('POST', '/api/admin/login', { email: 'chief@ma3ak.test', password: 'Chief-password-1234' })).status, 200);
  assert.equal((await P1.req('POST', '/api/partner/register', { name: 'Rami Khoury', email: 'rami@photo.test', password: 'Shutter-speed-2026', businessName: 'Rami Photo', category: 'photography', phone: '+961 70 000 001', consent: true })).status, 201);
  assert.equal((await P2.req('POST', '/api/partner/register', { name: 'Lina', email: 'lina@decor.test', password: 'Garland-and-gold-7', businessName: 'Lina Decor', category: 'decoration', phone: '+961 70 000 002', consent: true })).status, 201);
  assert.equal((await C1.req('POST', '/api/auth/register', { name: 'Maya Haddad', email: 'maya@guest.test', password: 'Cedar-tree-2026!', consent: true })).status, 201);
  assert.equal((await C2.req('POST', '/api/auth/register', { name: 'Karim', email: 'karim@guest.test', password: 'Olive-grove-2026!', consent: true })).status, 201);
  V1 = (await P1.req('GET', '/api/partner')).vendor.id;
});

test('packages: fixed, starting and quote prices with currency, inclusions and exclusions', async () => {
  let r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Full day', priceType: 'fixed', currency: 'USD', price: '800', unit: 'flat' });
  assert.equal(r.status, 422); assert.ok(r.fields.conditions, 'a fixed price needs its conditions');
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Full day', priceType: 'fixed', currency: 'USD', price: '800', unit: 'flat', conditions: 'Up to 10 hours in Beirut and Mount Lebanon.', includes: '2 photographers\nOnline gallery', exclusions: ['Printed album'], details: { coverageHours: 10, photographers: 2 } });
  assert.equal(r.status, 200); fixedPkg = r.id;
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Custom coverage', priceType: 'starting', currency: 'USD', price: '450.50', priceMax: '1200', unit: 'flat' }); assert.equal(r.status, 200); startPkg = r.id;
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Album', priceType: 'quote', unit: 'per_item' }); assert.equal(r.status, 200);
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Bad', priceType: 'starting', currency: 'USD', price: '12.345', unit: 'flat' }); assert.equal(r.status, 422, 'more decimals than the currency allows');
  r = await P1.req('PUT', '/api/partner/packages/new', { name: 'Bad', priceType: 'fixed', currency: 'LBP', price: '1000.5', unit: 'flat', conditions: 'Something long enough' }); assert.equal(r.status, 422, 'LBP has no decimals');
  const me = await P1.req('GET', '/api/partner'); const fx = me.vendor.packages.find(p => p.id === fixedPkg);
  assert.equal(fx.priceMinor, 80000); assert.equal(fx.currency, 'USD'); assert.deepEqual(fx.includes, ['2 photographers', 'Online gallery']); assert.deepEqual(fx.exclusions, ['Printed album']); assert.equal(fx.details.coverageHours, 10);
});

test('verification: documents are private, submission needs a complete file, only admins approve', async () => {
  let r = await P1.req('POST', '/api/partner/submit', { consent: true, authorized: true }); assert.equal(r.status, 422); assert.equal(r.code, 'incomplete');
  assert.ok(r.missing.some(m => m.key === 'id_document')); assert.ok(r.missing.some(m => m.key === 'legalName'));
  r = await P1.req('PUT', '/api/partner/profile', { name: 'Rami Photo', category: 'photography', description: 'Wedding and event photography across Lebanon, with two photographers.', locations: ['beirut', 'metn'], eventTypes: ['wedding'], phone: '+961 70 000 001', legalName: 'Rami Khoury Photography SARL', address: 'Mar Mikhael, Beirut', businessType: 'Company' });
  assert.equal(r.status, 200);
  r = await P1.req('POST', '/api/partner/documents', { kind: 'id_document', file: 'data:text/html;base64,' + Buffer.from('<script>').toString('base64') }); assert.equal(r.status, 422, 'only PDF/JPG/PNG');
  r = await P1.req('POST', '/api/partner/documents', { kind: 'id_document', file: png, name: 'id.png' }); assert.equal(r.status, 201); docId = r.id;
  r = await P1.req('POST', '/api/partner/documents', { kind: 'business_registration', file: pdf, name: 'register.pdf' }); assert.equal(r.status, 201);
  // private: nobody else can open a document
  assert.equal((await fetch(BASE + `/api/partner/documents/${docId}`)).status, 401);
  assert.equal((await P2.raw('GET', `/api/partner/documents/${docId}`)).status, 404);
  const own = await P1.raw('GET', `/api/partner/documents/${docId}`); assert.equal(own.status, 200); assert.match(own.headers.get('content-disposition'), /^attachment/);
  r = await P1.req('POST', '/api/partner/submit', { consent: true, authorized: true }); assert.equal(r.status, 422); assert.ok(r.missing.some(m => m.key === 'terms'), 'partner terms must be accepted');
  const plan = await P1.req('GET', '/api/partner/plan'); termsVersion = plan.terms.version; assert.ok(termsVersion);
  assert.equal((await P1.req('POST', '/api/partner/terms/accept', { version: 'old' })).status, 409);
  assert.equal((await P1.req('POST', '/api/partner/terms/accept', { version: termsVersion })).status, 200);
  r = await P1.req('POST', '/api/partner/submit', { consent: true, authorized: true }); assert.equal(r.status, 200); assert.equal(r.listingStatus, 'submitted');
  assert.equal((await fetch(BASE + `/api/vendors/${V1}`)).status, 404, 'submitted is not public');
  // admin review
  const list = await admin.req('GET', '/api/admin/vendors?status=submitted'); const row = list.vendors.find(v => v.id === V1); assert.ok(row); assert.equal(row.documents, 2); assert.ok(row.riskFlags.includes('Fewer than 3 photos'));
  const doc = await admin.raw('GET', `/api/admin/vendors/${V1}/documents/${docId}`); assert.equal(doc.status, 200);
  assert.equal((await P1.req('POST', `/api/admin/vendors/${V1}/review`, { action: 'approve' })).status, 401, 'partners cannot approve');
  assert.equal((await admin.req('POST', `/api/admin/vendors/${V1}/review`, { action: 'start_review' })).status, 200);
  r = await admin.req('POST', `/api/admin/vendors/${V1}/review`, { action: 'approve', checks: { identity: true, business: true } }); assert.equal(r.status, 422, 'full checklist required');
  r = await admin.req('POST', `/api/admin/vendors/${V1}/review`, { action: 'request_info', note: 'Please add a photo of the studio.' }); assert.equal(r.status, 200);
  assert.equal((await P1.req('GET', '/api/partner')).vendor.status, 'needs_info');
  assert.equal((await P1.req('POST', '/api/partner/submit', { consent: true, authorized: true })).status, 200);
  r = await admin.req('POST', `/api/admin/vendors/${V1}/review`, { action: 'approve', checks: { identity: true, business: true, authority: true, listing: true }, note: 'Documents match.' }); assert.equal(r.status, 200);
  const pub = await (await fetch(BASE + `/api/vendors/${V1}`)).json(); assert.equal(pub.vendor.verified, true); assert.equal(pub.vendor.startingFrom.minor, 45050);
  const audit = await admin.req('GET', '/api/admin/audit'); assert.ok(audit.rows.some(a => a.action === 'document_viewed'), 'document access is logged');
  const notes = await P1.req('GET', '/api/notifications'); assert.ok(notes.items.some(x => /verified/i.test(x.title)));
});

test('a paid plan never verifies or publishes a listing', async () => {
  const V2 = (await P2.req('GET', '/api/partner')).vendor.id;
  let r = await P2.req('POST', '/api/partner/plan/request', { planId: 'pro' }); assert.equal(r.status, 201);
  r = await admin.req('POST', `/api/admin/vendors/${V2}/subscription`, { action: 'comp', planId: 'pro', periodEnd: day(30) }); assert.equal(r.status, 200);
  const me = await P2.req('GET', '/api/partner'); assert.equal(me.plan.planId, 'pro'); assert.equal(me.plan.entitlements.maxPhotos, 40);
  assert.equal(me.vendor.status, 'draft'); assert.equal(me.vendor.verified, false); assert.equal((await fetch(BASE + `/api/vendors/${V2}`)).status, 404);
});

test('booking form: sign-in, validation, demo listings and availability', async () => {
  const anon = client(); assert.equal((await anon.req('POST', '/api/bookings', bookingForm())).status, 401);
  let r = await C1.req('POST', '/api/bookings', bookingForm({ vendorId: 'demo-beats-dj' })); assert.equal(r.status, 409); assert.equal(r.code, 'demo');
  r = await C1.req('POST', '/api/bookings', bookingForm({ phone: '03 123 456' })); assert.equal(r.status, 422); assert.ok(r.fields.phone, 'country code required');
  r = await C1.req('POST', '/api/bookings', bookingForm({ date: day(-2) })); assert.equal(r.status, 422); assert.ok(r.fields.date);
  r = await C1.req('POST', '/api/bookings', bookingForm({ packageId: fixedPkg, details: { startTime: '25:00' } })); assert.equal(r.status, 422); assert.ok(r.fields['details.startTime']);
  r = await C1.req('POST', '/api/bookings', bookingForm({ confirm: false })); assert.equal(r.status, 422, 'review step must be confirmed');
  assert.equal((await P1.req('PUT', '/api/partner/availability', { days: [day(90)], status: 'blocked', note: 'Holiday' })).status, 200);
  r = await C1.req('POST', '/api/bookings', bookingForm({ date: day(90) })); assert.equal(r.status, 409); assert.equal(r.code, 'unavailable');
  const pub = await (await fetch(BASE + `/api/vendors/${V1}`)).json(); assert.ok(pub.vendor.unavailableDates.includes(day(90)));
  r = await C1.req('POST', '/api/bookings/preview', bookingForm({ packageId: fixedPkg })); assert.equal(r.status, 200); assert.equal(r.willBe, 'awaiting_vendor'); assert.equal(r.estimate.totalMinor, 80000);
});

test('fixed-price booking: request, vendor confirms, contact details unlock, price snapshot kept', async () => {
  let r = await C1.req('POST', '/api/bookings', bookingForm({ packageId: fixedPkg, details: { startTime: '18:00', coverageHours: 8 } }));
  assert.equal(r.status, 201); assert.match(r.ref, /^B-\d{6}-[A-Z2-9]{6}$/); assert.equal(r.bookingStatus, 'awaiting_vendor'); B1 = r.id;
  assert.equal((await C1.req('POST', '/api/bookings', bookingForm({ packageId: fixedPkg }))).status, 409, 'no duplicate request for the same date');
  let mine = await C1.req('GET', `/api/bookings/${B1}`); assert.equal(mine.booking.status, 'awaiting_vendor'); assert.ok(mine.booking.actions.includes('cancel')); assert.ok(!mine.booking.actions.includes('confirm'));
  assert.equal((await C2.req('GET', `/api/bookings/${B1}`)).status, 404, 'other customers cannot see it');
  assert.equal((await P2.req('GET', `/api/bookings/${B1}`)).status, 404, 'other vendors cannot see it');
  let v = await P1.req('GET', `/api/bookings/${B1}`); assert.equal(v.booking.customer.email, null); assert.equal(v.booking.customer.phone, null); assert.ok(!/123 456/.test(v.booking.notes), 'phone numbers in notes are hidden before confirmation');
  assert.equal((await act(C1, B1, 'confirm')).status, 409, 'customers cannot confirm for the vendor');
  // the vendor must accept the current partner terms
  const site = await admin.req('GET', '/api/admin/settings'); const terms = site.settings.vendorTerms;
  assert.equal((await admin.req('PUT', '/api/admin/settings/vendorTerms', { value: { version: terms.version, text: terms.text + ' Changed.' } })).status, 422, 'text change needs a new version');
  assert.equal((await admin.req('PUT', '/api/admin/settings/vendorTerms', { value: { version: terms.version + '-b', text: terms.text } })).status, 200);
  r = await act(P1, B1, 'confirm'); assert.equal(r.status, 409); assert.equal(r.code, 'terms_required');
  assert.equal((await P1.req('POST', '/api/partner/terms/accept', { version: terms.version + '-b' })).status, 200);
  r = await act(P1, B1, 'confirm'); assert.equal(r.status, 200); assert.equal(r.booking.status, 'confirmed'); assert.equal(r.booking.agreed.totalMinor, 80000);
  assert.equal(r.booking.customer.phone, '+9613123456', 'contact visible once confirmed'); assert.equal(r.booking.package.priceMinor, 80000);
  mine = await C1.req('GET', `/api/bookings/${B1}`); assert.equal(mine.booking.offers[0].status, 'accepted'); assert.ok(mine.booking.timeline.some(e => e.action === 'offer_accepted' && e.actor === 'vendor'));
  // later package price change does not touch the booking
  assert.equal((await P1.req('PUT', `/api/partner/packages/${fixedPkg}`, { name: 'Full day', priceType: 'fixed', currency: 'USD', price: '999', unit: 'flat', conditions: 'Up to 10 hours in Beirut and Mount Lebanon.' })).status, 200);
  mine = await C1.req('GET', `/api/bookings/${B1}`); assert.equal(mine.booking.agreed.totalMinor, 80000); assert.equal(mine.booking.package.priceMinor, 80000);
  const notes = await C1.req('GET', '/api/notifications'); assert.ok(notes.items.some(x => /confirmed/.test(x.title))); assert.ok(notes.unread > 0);
  assert.equal((await C1.req('POST', '/api/notifications/read', { all: true })).status, 200); assert.equal((await C1.req('GET', '/api/notifications')).unread, 0);
});

test('quote flow: revisions, expiry checks, acceptance locks the price, commission is snapshotted', async () => {
  let r = await C1.req('POST', '/api/bookings', bookingForm({ packageId: startPkg, date: day(120), guests: 80 })); assert.equal(r.status, 201); B2 = r.id;
  assert.equal((await C1.req('GET', `/api/bookings/${B2}`)).booking.status, 'quote_requested');
  assert.equal((await C1.req('POST', `/api/bookings/${B2}/offers`, { items: [{ label: 'x', unitPrice: '1' }] })).status, 403, 'customers cannot send quotes');
  r = await P1.req('POST', `/api/bookings/${B2}/offers`, { items: [{ label: 'Coverage', quantity: 2, unitPrice: '-5' }] }); assert.equal(r.status, 422);
  r = await P1.req('POST', `/api/bookings/${B2}/offers`, { items: [{ label: 'Coverage (hours)', quantity: 2, unitPrice: '450.50' }], discount: '1', discountNote: 'Returning customer', deposit: '200', inclusions: ['Edited photos'], exclusions: ['Travel outside Beirut'], cancellationTerms: 'Deposit refunded up to 30 days before.' });
  assert.equal(r.status, 201); assert.equal(r.version, 1);
  let c = await C1.req('GET', `/api/bookings/${B2}`); assert.equal(c.booking.status, 'quote_received'); const o1 = c.booking.offers[0];
  assert.equal(o1.subtotalMinor, 90100); assert.equal(o1.discountMinor, 100); assert.equal(o1.totalMinor, 90000); assert.equal(o1.depositMinor, 20000); assert.equal(o1.status, 'sent');
  r = await act(C1, B2, 'revise', { offerId: o1.id, note: 'Can you do 850?' }); assert.equal(r.status, 200); assert.equal(r.booking.status, 'revision_requested');
  r = await P1.req('POST', `/api/bookings/${B2}/offers`, { items: [{ label: 'Coverage (hours)', quantity: 2, unitPrice: '425' }], deposit: '200', cancellationTerms: 'Deposit refunded up to 30 days before.' }); assert.equal(r.version, 2);
  c = await C1.req('GET', `/api/bookings/${B2}`); const o2 = c.booking.offers[0]; assert.equal(o2.totalMinor, 85000); assert.equal(c.booking.offers[1].status, 'revision_requested');
  assert.equal((await act(C1, B2, 'accept', { offerId: o1.id, agree: true })).status, 409, 'an old offer cannot be accepted');
  assert.equal((await act(C1, B2, 'accept', { offerId: o2.id })).status, 422, 'explicit agreement required');
  assert.equal((await admin.req('POST', '/api/admin/commission', { scope: 'global', ratePercent: '5', note: 'Launch rate' })).status, 200);
  r = await act(C1, B2, 'accept', { offerId: o2.id, agree: true }); assert.equal(r.status, 200); assert.equal(r.booking.status, 'awaiting_payment'); assert.equal(r.booking.agreed.totalMinor, 85000);
  // commission: 5% of 850.00 = 42.50, fixed on the booking
  let a = await admin.req('GET', `/api/admin/bookings/${B2}`); assert.equal(a.booking.commission.rateBps, 500); assert.equal(a.booking.commission.amountMinor, 4250);
  assert.equal((await admin.req('POST', '/api/admin/commission', { scope: 'global', ratePercent: '10' })).status, 200);
  a = await admin.req('GET', `/api/admin/bookings/${B2}`); assert.equal(a.booking.commission.amountMinor, 4250, 'later rule changes do not touch agreed bookings');
  const v = await P1.req('GET', `/api/bookings/${B2}`); assert.equal(v.booking.commission.amountMinor, 4250, 'the vendor sees the commission');
  assert.equal((await C1.req('GET', `/api/bookings/${B2}`)).booking.commission, undefined, 'the customer does not see internal commission');
  // a change after agreement is an amendment: nothing changes until the customer accepts
  r = await P1.req('POST', `/api/bookings/${B2}/offers`, { items: [{ label: 'Coverage (hours)', quantity: 2, unitPrice: '475' }], deposit: '200' }); assert.equal(r.status, 201);
  c = await C1.req('GET', `/api/bookings/${B2}`); assert.equal(c.booking.offers[0].kind, 'amendment'); assert.equal(c.booking.agreed.totalMinor, 85000, 'price stays locked');
  r = await act(C1, B2, 'reject', { offerId: c.booking.offers[0].id }); assert.equal(r.status, 200); assert.equal(r.booking.agreed.totalMinor, 85000); assert.equal(r.booking.status, 'awaiting_payment');
});

test('payments: recorded once, deposit confirms, refunds limited, no online payment simulated', async () => {
  let r = await act(P1, B2, 'report_payment', { kind: 'refund', amount: '50', idempotencyKey: key() }); assert.equal(r.status, 422, 'vendors cannot record refunds');
  const k = key();
  r = await act(P1, B2, 'report_payment', { kind: 'deposit', amount: '200', idempotencyKey: k }); assert.equal(r.status, 200); assert.equal(r.booking.status, 'confirmed'); assert.equal(r.booking.paymentStatus, 'deposit_paid');
  r = await act(P1, B2, 'report_payment', { kind: 'deposit', amount: '200', idempotencyKey: k }); assert.equal(r.duplicate, true, 'a repeated submission records nothing new');
  r = await act(admin, B2, 'record_payment', { kind: 'balance', amount: '700', method: 'offline_cash', idempotencyKey: key() }); assert.equal(r.status, 401, 'admin actions use the admin route');
  r = await admin.req('POST', `/api/admin/bookings/${B2}/action`, { action: 'record_payment', kind: 'balance', amount: '700', method: 'offline_cash', idempotencyKey: key() }); assert.equal(r.status, 422, 'cannot exceed the agreed total');
  const k2 = key();
  r = await admin.req('POST', `/api/admin/bookings/${B2}/action`, { action: 'record_payment', kind: 'balance', amount: '650', method: 'offline_transfer', idempotencyKey: k2 }); assert.equal(r.status, 200);
  r = await admin.req('POST', `/api/admin/bookings/${B2}/action`, { action: 'record_payment', kind: 'balance', amount: '650', method: 'offline_transfer', idempotencyKey: k2 }); assert.equal(r.duplicate, true, 'same key = same payment');
  let a = await admin.req('GET', `/api/admin/bookings/${B2}`); assert.equal(a.booking.payments.length, 2); assert.equal(a.booking.paymentStatus, 'paid');
  r = await admin.req('POST', `/api/admin/bookings/${B2}/action`, { action: 'record_payment', kind: 'refund', amount: '900', method: 'offline_transfer', idempotencyKey: key() }); assert.equal(r.status, 422);
  r = await admin.req('POST', `/api/admin/bookings/${B2}/action`, { action: 'record_payment', kind: 'refund', amount: '100', method: 'offline_transfer', idempotencyKey: key() }); assert.equal(r.status, 200);
  a = await admin.req('GET', `/api/admin/bookings/${B2}`); assert.equal(a.booking.paymentStatus, 'partially_refunded');
  assert.equal((await fetch(BASE + '/api/payments/webhook/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 501);
  const fin = await admin.req('GET', '/api/admin/finance'); assert.equal(fin.providerConfigured, false); assert.ok(fin.commissions.some(c => c.amount_minor === 4250 && c.status === 'accrued'));
});

test('messages hide contact details before confirmation; reports reach the admin', async () => {
  let r = await C1.req('POST', '/api/bookings', bookingForm({ date: day(150), guests: 50 })); const B3 = r.id;
  r = await C1.req('POST', `/api/bookings/${B3}/messages`, { body: 'Reach me at maya@guest.test or +961 3 123 456, or wa.me/9613123456. Event is on 2027-05-01.' });
  assert.equal(r.status, 201); assert.equal(r.masked, true); assert.ok(!/maya@guest/.test(r.body) && !/123 456/.test(r.body) && !/wa\.me/.test(r.body)); assert.ok(r.body.includes('2027-05-01'), 'dates are kept');
  const v = await P1.req('GET', `/api/bookings/${B3}`); assert.ok(v.booking.messages.every(m => !/maya@guest/.test(m.body)));
  r = await P1.req('POST', `/api/bookings/${B3}/messages`, { body: 'Thanks! We can do it.' }); assert.equal(r.masked, false);
  assert.equal((await C2.req('POST', `/api/bookings/${B3}/messages`, { body: 'hi' })).status, 404);
  r = await C1.req('POST', '/api/reports', { targetType: 'message', targetId: String(v.booking.messages[1]?.id || v.booking.messages[0].id), reason: 'Asked me to pay outside Ma3ak' }); assert.equal(r.status, 201);
  assert.equal((await C2.req('POST', '/api/reports', { targetType: 'message', targetId: String(v.booking.messages[0].id), reason: 'Not mine' })).status, 404);
  const rep = await admin.req('GET', '/api/admin/reports'); assert.equal(rep.reports.length, 1);
  // after confirmation, nothing is masked
  const mineB1 = await C1.req('POST', `/api/bookings/${B1}/messages`, { body: 'My number is +961 3 123 456' }); assert.equal(mineB1.masked, false);
});

test('cancellation after agreement needs the other side; commission reversed', async () => {
  let r = await act(C1, B1, 'request_cancel', {}); assert.equal(r.status, 422, 'a reason is required');
  r = await act(C1, B1, 'request_cancel', { reason: 'Date moved' }); assert.equal(r.booking.status, 'cancellation_requested');
  assert.equal((await act(C1, B1, 'approve_cancel')).status, 409, 'you cannot approve your own request');
  r = await act(P1, B1, 'reject_cancel', { note: 'Within 7 days of the event' }); assert.equal(r.booking.status, 'confirmed');
  r = await act(C1, B1, 'request_cancel', { reason: 'Date moved again' }); r = await act(P1, B1, 'approve_cancel'); assert.equal(r.booking.status, 'cancelled');
  const a = await admin.req('GET', `/api/admin/bookings/${B1}`); assert.ok(a.booking.commissions.every(c => c.status === 'reversed'));
  assert.equal((await act(P1, B1, 'complete')).status, 409, 'closed bookings cannot move');
});

test('reviews only after a completed booking, once', async () => {
  assert.equal((await C1.req('POST', `/api/bookings/${B2}/review`, { rating: 5 })).status, 409, 'not completed yet');
  assert.equal((await act(P1, B2, 'complete')).status, 409, 'vendor cannot complete before the event date');
  let r = await admin.req('POST', `/api/admin/bookings/${B2}/action`, { action: 'admin_complete', note: 'Event held' }); assert.equal(r.status, 200);
  assert.equal((await C1.req('POST', `/api/bookings/${B2}/review`, { rating: 6 })).status, 422);
  r = await C1.req('POST', `/api/bookings/${B2}/review`, { rating: 5, body: 'Beautiful photos.' }); assert.equal(r.status, 201);
  assert.equal((await C1.req('POST', `/api/bookings/${B2}/review`, { rating: 1 })).status, 409, 'one review per booking');
  const pub = await (await fetch(BASE + `/api/vendors/${V1}/reviews`)).json(); assert.equal(pub.reviews.length, 1); assert.equal(pub.reviews[0].author, 'Maya H.'); assert.equal(pub.reviews[0].verifiedBooking, true);
  const v = await (await fetch(BASE + `/api/vendors/${V1}`)).json(); assert.equal(v.vendor.rating, 5); assert.equal(v.vendor.reviewCount, 1);
  const rid = pub.reviews[0].id;
  assert.equal((await admin.req('POST', `/api/admin/reviews/${rid}`, { status: 'hidden', note: 'test' })).status, 200);
  assert.equal((await (await fetch(BASE + `/api/vendors/${V1}`)).json()).vendor.reviewCount, 0, 'hidden reviews do not count');
  await admin.req('POST', `/api/admin/reviews/${rid}`, { status: 'published' });
});

test('plans: Pro request, manual activation, entitlements, admin price edits', async () => {
  let r = await P1.req('GET', '/api/partner/plan'); assert.equal(r.current.planId, 'free'); assert.equal(r.billingAvailable, false);
  assert.equal((await P1.raw('GET', '/api/partner/bookings.csv')).status, 403, 'export is a Pro tool');
  assert.equal((await P1.req('GET', '/api/partner/analytics')).status, 403);
  assert.equal((await P1.req('POST', '/api/partner/plan/request', { planId: 'pro' })).status, 201);
  assert.equal((await P1.req('POST', '/api/partner/plan/request', { planId: 'pro' })).status, 409);
  assert.equal((await admin.req('POST', `/api/admin/vendors/${V1}/subscription`, { action: 'activate', planId: 'pro' })).status, 422, 'end date required');
  assert.equal((await admin.req('POST', `/api/admin/vendors/${V1}/subscription`, { action: 'activate', planId: 'pro', periodEnd: day(31), note: 'Paid by bank transfer' })).status, 200);
  r = await P1.req('GET', '/api/partner/plan'); assert.equal(r.current.planId, 'pro');
  const csv = await P1.raw('GET', '/api/partner/bookings.csv'); assert.equal(csv.status, 200); const text = await csv.text(); assert.ok(text.includes('Reference')); assert.ok(!text.includes('maya@guest.test') || text.includes('confirmed') || text.includes('completed'));
  r = await P1.req('GET', '/api/partner/analytics'); assert.equal(r.status, 200); assert.ok(r.analytics.requests >= 3); assert.equal(r.analytics.revenueByCurrency.USD, 85000);
  assert.equal((await admin.req('PUT', '/api/admin/plans/free', { price: '5' })).status, 422);
  assert.equal((await admin.req('PUT', '/api/admin/plans/pro', { price: '39.99', entitlements: { maxPhotos: 50 } })).status, 200);
  const plans = await admin.req('GET', '/api/admin/plans'); const pro = plans.plans.find(p => p.id === 'pro'); assert.equal(pro.price_minor, 3999); assert.equal(pro.entitlements.maxPhotos, 50);
});

test('listing order: manual order, sponsored label, featured on the homepage', async () => {
  const before = await admin.req('GET', '/api/admin/order?category=photography'); const ids = before.listings.map(l => l.id); assert.ok(ids.length >= 2);
  assert.equal(ids[0], V1, 'real listings come before samples');
  const reversed = [...ids].reverse();
  assert.equal((await admin.req('PUT', '/api/admin/order/category/photography', { ids: reversed })).status, 200);
  let pub = (await (await fetch(BASE + '/api/vendors')).json()).vendors.filter(v => v.category === 'photography').map(v => v.id);
  assert.equal(pub[0], V1, 'manual order never puts samples above real listings'); assert.deepEqual(pub.slice(1), reversed.filter(x => x !== V1));
  assert.equal((await admin.req('POST', `/api/admin/vendors/${V1}/review`, { action: 'sponsor', until: day(10) })).status, 200);
  pub = await (await fetch(BASE + `/api/vendors/${V1}`)).json(); assert.equal(pub.vendor.sponsored, true); assert.equal(pub.vendor.verified, true);
  assert.equal((await admin.req('PUT', '/api/admin/order/home', { ids: [V1] })).status, 200);
  pub = await (await fetch(BASE + `/api/vendors/${V1}`)).json(); assert.equal(pub.vendor.featured, true); assert.equal(pub.vendor.homeRank, 1);
  assert.equal((await P1.req('PUT', '/api/admin/order/home', { ids: [] })).status, 401);
});

test('share links: the owner chooses what is shown; nothing private leaks', async () => {
  let r = await C1.req('POST', '/api/plans', { name: 'Our wedding', eventType: 'wedding', guests: 120, budget: 20000, currency: 'USD', date: day(200) }); const plan = r.id;
  r = await C1.req('POST', `/api/events/${plan}/services`, { packageId: startPkg }); assert.equal(r.status, 201);
  assert.equal(r.totals.byCurrency[0].low, 45050); assert.equal(r.totals.isEstimate, true);
  r = await C1.req('POST', `/api/events/${plan}/shares`, { permission: 'view', showPrices: false, showProviders: false, showDate: false }); const tok = r.share.url.split('/#/s/')[1];
  const s = await (await fetch(BASE + `/api/share/${tok}`)).json();
  const json = JSON.stringify(s);
  assert.equal(s.plan.totals, null); assert.equal(s.plan.services[0].unitPriceMinor, null); assert.equal(s.plan.services[0].vendorName, null); assert.equal(s.plan.date, null);
  assert.ok(!json.includes('maya@guest.test') && !json.includes('3123456') && !json.includes('Haddad'), 'no contact details or surname');
  const sid = r.share.id; assert.equal((await C1.req('DELETE', `/api/events/${plan}/shares/${sid}`)).status, 200);
  assert.equal((await fetch(BASE + `/api/share/${tok}`)).status, 404, 'disabled links stop working');
});

test('expiry: an unanswered quote expires after its validity date', async () => {
  const { openDb } = await import('../server/db.js'); const { expireDue } = await import('../server/bookings.js');
  let r = await C1.req('POST', '/api/bookings', bookingForm({ date: day(170), guests: 40 })); const B4 = r.id;
  r = await P1.req('POST', `/api/bookings/${B4}/offers`, { items: [{ label: 'Coverage', unitPrice: '300' }], validUntil: day(3) }); assert.equal(r.status, 201);
  const db = await openDb({ connectionString: TESTDB.url, applyMigrations: false });
  await db.run('UPDATE booking_offers SET valid_until = ? WHERE booking_id = ?', day(-1), B4);
  r = await act(C1, B4, 'accept', { offerId: (await C1.req('GET', `/api/bookings/${B4}`)).booking.offers[0].id, agree: true }); assert.equal(r.status, 409, 'expired offers cannot be accepted');
  await db.run("UPDATE booking_offers SET status = 'sent' WHERE booking_id = ?", B4);
  assert.ok(await expireDue(db) >= 1);
  assert.equal((await C1.req('GET', `/api/bookings/${B4}`)).booking.status, 'expired');
  await db.pool.end();
});

test('account deletion is blocked while a booking is in progress', async () => {
  let r = await C1.req('POST', '/api/bookings', bookingForm({ packageId: fixedPkg, date: day(180) })); const B5 = r.id;
  r = await act(P1, B5, 'confirm'); assert.equal(r.booking.status, 'confirmed');
  r = await C1.req('DELETE', '/api/me', { password: 'Cedar-tree-2026!' }); assert.equal(r.status, 409); assert.equal(r.code, 'active_bookings');
});
