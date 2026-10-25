// Platform tests: accounts, isolation between customers, autosave, versions, sharing, AI, admin.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { freshDatabase } from './db-helper.js';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const PORT = 4400 + Math.floor(Math.random() * 400), BASE = `http://127.0.0.1:${PORT}`, ORIGIN = BASE;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ma3ak-plat-'));
let proc, n = 1;
let TESTDB;
before(async () => {
  TESTDB = await freshDatabase('ma3ak_plat');
  proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: DATA, DATABASE_URL: TESTDB.url, SESSION_SECRET: 'y'.repeat(48), PUBLIC_ORIGIN: ORIGIN, TRUST_PROXY: '1', ADMIN_EMAIL: 'boss@ma3ak.test', ADMIN_PASSWORD: 'Boss-password-1234', AI_PROVIDER: 'mock' }, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE + '/api/health')).ok) return; } catch {} await new Promise(r => setTimeout(r, 150)); }
});
after(async () => { proc.kill(); await new Promise(r => setTimeout(r, 300)); await TESTDB.drop(); fs.rmSync(DATA, { recursive: true, force: true }); });

// a tiny client that keeps its own cookie + CSRF token, like a browser tab
function client() {
  const c = { cookie: '', csrf: '', ip: `198.51.100.${n++}` };
  c.req = async (method, p, body) => {
    const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': c.ip, ...(c.cookie ? { Cookie: c.cookie } : {}), ...(c.csrf ? { 'X-CSRF-Token': c.csrf } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc && /ma3ak_user=/.test(sc)) c.cookie = sc.split(';')[0];
    const j = await r.json().catch(() => ({})); if (j.csrf) c.csrf = j.csrf; return { status: r.status, ...j };
  };
  return c;
}
const A = client(), B = client(), admin = client();
let eventId, shareUrl;

test('register, profile, weak passwords rejected, duplicate email', async () => {
  assert.equal((await A.req('POST', '/api/auth/register', { name: 'Anthony', email: 'anthony@example.com', password: 'short', consent: true })).status, 422);
  const r = await A.req('POST', '/api/auth/register', { name: 'Anthony', email: 'anthony@example.com', password: 'Wedding-plans-2027', consent: true });
  assert.equal(r.status, 201); assert.equal(r.user.plan, 'free'); assert.equal(r.user.verified, false); assert.match(A.cookie, /__Host-ma3ak_user=/);
  assert.equal((await B.req('POST', '/api/auth/register', { name: 'X', email: 'anthony@example.com', password: 'Another-pass-123', consent: true })).status, 409);
  assert.equal((await B.req('POST', '/api/auth/register', { name: 'Bea', email: 'bea@example.com', password: 'Birthday-party-55', consent: true })).status, 201);
  const me = await A.req('GET', '/api/me'); assert.equal(me.user.email, 'anthony@example.com');
  assert.equal((await A.req('PATCH', '/api/me', { name: 'Anthony K', phone: '+961 70 111 222' })).user.name, 'Anthony K');
});
test('login and logout', async () => {
  const C = client(); assert.equal((await C.req('POST', '/api/auth/login', { email: 'anthony@example.com', password: 'wrong-one-123' })).status, 401);
  assert.equal((await C.req('POST', '/api/auth/login', { email: 'anthony@example.com', password: 'Wedding-plans-2027' })).status, 200);
  assert.equal((await C.req('POST', '/api/auth/logout')).status, 200); assert.equal((await C.req('GET', '/api/me')).user, null);
});
test('create and autosave an event (relational storage, rev conflicts)', async () => {
  const r = await A.req('POST', '/api/events', { name: 'Beach Wedding', state: { eventType: 'wedding', guests: 180, venueType: ['Beach / beach club'], colors: ['Ivory', 'Gold'], _add: [{ id: 'u1', type: 'round', x: 1, z: 2, ry: 0 }] }, progress: 30 });
  assert.equal(r.status, 201); eventId = r.event.id; assert.equal(r.event.guest_count, 180); assert.equal(r.event.venue, 'Beach / beach club');
  const s1 = await A.req('PUT', `/api/events/${eventId}`, { rev: 1, name: 'Beach Wedding', state: { eventType: 'wedding', guests: 200, music: ['DJ'], colors: ['Ivory'] }, progress: 45, label: 'Added DJ booth', checkpoint: true });
  assert.equal(s1.status, 200); assert.equal(s1.rev, 2);
  assert.equal((await A.req('PUT', `/api/events/${eventId}`, { rev: 1, name: 'x', state: {} })).status, 409, 'stale rev rejected');
  const g = await A.req('GET', `/api/events/${eventId}`); assert.deepEqual(g.state.music, ['DJ']); assert.equal(g.state.guests, 200); assert.equal(g.role, 'owner');
  const v = await A.req('GET', `/api/events/${eventId}/versions`); assert.ok(v.versions.some(x => x.label === 'Added DJ booth'));
  const first = v.versions.find(x => x.label === 'Event created'); const rs = await A.req('POST', `/api/events/${eventId}/versions/${first.id}/restore`);
  assert.equal(rs.status, 200); assert.equal(rs.state.guests, 180);
});
test('Customer B can never read or change Customer A’s event', async () => {
  for (const [m, p, b] of [['GET', `/api/events/${eventId}`], ['PUT', `/api/events/${eventId}`, { rev: 99, force: true, name: 'hacked', state: {} }], ['DELETE', `/api/events/${eventId}`], ['GET', `/api/events/${eventId}/versions`], ['POST', `/api/events/${eventId}/shares`, { permission: 'edit' }]])
    assert.equal((await B.req(m, p, b)).status, 404, `${m} ${p}`);
  assert.equal((await B.req('GET', '/api/events')).events.length, 0);
  const anon = client(); assert.equal((await anon.req('GET', `/api/events/${eventId}`)).status, 401);
  // CSRF: a stolen cookie without the token can't write
  const noCsrf = { ...A }; const r = await fetch(`${BASE}/api/events/${eventId}`, { method: 'DELETE', headers: { Cookie: A.cookie, Origin: ORIGIN } }); assert.equal(r.status, 403);
});
test('share links: view-only presentation, collaborate, revoke', async () => {
  const s = await A.req('POST', `/api/events/${eventId}/shares`, { permission: 'view' }); assert.equal(s.status, 201); shareUrl = s.share.url;
  const tk = shareUrl.split('/#/s/')[1]; const pub = await client().req('GET', `/api/share/${tk}`); assert.equal(pub.status, 200); assert.equal(pub.event.name, 'Beach Wedding'); assert.equal(pub.state.phone, undefined); assert.equal(pub.permission, 'view');
  assert.equal((await client().req('GET', '/api/share/not-a-real-token')).status, 404);
  const e = await A.req('POST', `/api/events/${eventId}/shares`, { permission: 'edit' }); const etk = e.share.url.split('/#/s/')[1];
  assert.equal((await B.req('POST', `/api/share/${etk}/join`)).status, 200);
  const bl = await B.req('GET', '/api/events'); assert.equal(bl.shared.length, 1); assert.equal(bl.shared[0].role, 'editor');
  const bg = await B.req('GET', `/api/events/${eventId}`); assert.equal(bg.status, 200);
  assert.equal((await B.req('PUT', `/api/events/${eventId}`, { rev: bg.event.rev, name: 'Beach Wedding', state: { ...bg.state, lights: ['Chandeliers'] } })).status, 200);
  assert.equal((await B.req('DELETE', `/api/events/${eventId}`)).status, 404, 'editors cannot delete');
  const list = await A.req('GET', `/api/events/${eventId}/shares`); await A.req('DELETE', `/api/events/${eventId}/shares/${list.shares.find(x => x.permission === 'view').id}`);
  assert.equal((await client().req('GET', `/api/share/${tk}`)).status, 404, 'revoked');
});
test('plan limits enforced on the server', async () => {
  const C = client(); await C.req('POST', '/api/auth/register', { name: 'Cy', email: 'cy@example.com', password: 'Corporate-gala-99', consent: true });
  const max = (await C.req('GET', '/api/me')).user.limits.maxEvents; assert.ok(max >= 3);
  for (let i = 0; i < max; i++) assert.equal((await C.req('POST', '/api/events', { name: 'E' + i, state: {} })).status, 201);
  assert.equal((await C.req('POST', '/api/events', { name: 'E-over', state: {} })).status, 402);
  assert.equal((await C.req('POST', '/api/plans', { name: 'Plan over' })).status, 402, 'the planner shares the same limit');
});
test('favorites', async () => {
  assert.equal((await A.req('PUT', '/api/favorites/dj')).status, 200); assert.deepEqual((await A.req('GET', '/api/favorites')).items, ['dj']);
  assert.equal((await A.req('PUT', '/api/favorites/<script>')).status, 422);
});
test('AI assistant: event-aware, actions filtered to allowed fields, handoff', async () => {
  const r = await A.req('POST', '/api/ai/chat', { message: 'Make my wedding more luxurious', eventId, state: { eventType: 'wedding', guests: 180 } });
  assert.equal(r.status, 200); assert.ok(r.reply); assert.deepEqual(Object.keys(r.actions[0].changes).sort(), ['areas', 'lights']);
  const h = await A.req('POST', '/api/ai/chat', { message: 'I want to book, can I talk to a person?', conversationId: r.conversationId }); assert.equal(h.handoff, true); assert.equal(h.conversationId, r.conversationId);
  const other = await B.req('POST', '/api/ai/chat', { message: 'hi', conversationId: r.conversationId }); assert.notEqual(other.conversationId, r.conversationId, 'cannot hijack another chat');
});
test('sending a saved event links it and creates a share link for the business', async () => {
  const r = await A.req('POST', '/api/requests', { contact: { fullName: 'Anthony K', phone: '+961 70 111 222' }, choices: { eventType: 'wedding' }, eventId, text: 'plan', consent: true, elapsed: 9000 });
  assert.equal(r.status, 201); assert.match(r.shareUrl, /\/#\/s\//);
  assert.equal((await A.req('GET', `/api/events/${eventId}`)).event.status, 'sent');
});
test('guest list, automatic seating, timeline and checklist', async () => {
  const add = await A.req('POST', `/api/events/${eventId}/guests`, { guests: [{ name: 'Rita Haddad', party: 'Haddad', vip: true }, { name: 'Sami Haddad', party: 'Haddad', plusOne: true }, { name: 'Nour', phone: '+961 70 123 456' }, { name: 'Ziad', email: 'not-an-email' }, { name: 'Lina', party: 'Friends' }, { name: 'Omar', party: 'Friends' }] });
  assert.equal(add.status, 201); assert.equal(add.added, 5); assert.equal(add.skipped, 1, 'invalid guest skipped');
  let list = await A.req('GET', `/api/events/${eventId}/guests`); assert.equal(list.guests.length, 5); assert.equal(list.guests[0].name, 'Rita Haddad', 'VIPs first');
  const nour = list.guests.find(g => g.name === 'Nour'), lina = list.guests.find(g => g.name === 'Lina');
  assert.equal((await A.req('PATCH', `/api/events/${eventId}/guests/${nour.id}`, { rsvp: 'confirmed', dietary: 'Vegetarian' })).guest.dietary, 'Vegetarian');
  await A.req('PATCH', `/api/events/${eventId}/guests/${lina.id}`, { rsvp: 'declined' });
  const seat = await A.req('POST', `/api/events/${eventId}/seating`, { perTable: 4 }); assert.equal(seat.status, 200);
  list = await A.req('GET', `/api/events/${eventId}/guests`); const by = n => list.guests.find(g => g.name === n);
  assert.equal(by('Rita Haddad').table, 1, 'VIP party at table 1'); assert.equal(by('Sami Haddad').table, 1, 'same party kept together'); assert.equal(by('Lina').table, null, 'declined guests not seated');
  assert.equal(list.stats.confirmed, 1); assert.equal(list.stats.declined, 1); assert.equal(list.stats.invited, 5);
  // privacy: B is an editor (joined earlier) and can read; a stranger cannot
  assert.equal((await B.req('GET', `/api/events/${eventId}/guests`)).status, 200);
  const S = client(); await S.req('POST', '/api/auth/register', { name: 'Stranger', email: 'stranger@example.com', password: 'Stranger-pass-123', consent: true });
  for (const [m, p, b] of [['GET', `/api/events/${eventId}/guests`], ['POST', `/api/events/${eventId}/guests`, { name: 'Intruder' }], ['DELETE', `/api/events/${eventId}/guests/${nour.id}`], ['GET', `/api/events/${eventId}/timeline`], ['PUT', `/api/events/${eventId}/checklist`, { items: [] }]])
    assert.equal((await S.req(m, p, b)).status, 404, `${m} ${p}`);
  const tl = await A.req('PUT', `/api/events/${eventId}/timeline`, { items: [{ at: '00:30', title: 'Closing' }, { at: '19:00', title: 'Dinner' }, { at: '18:00', title: 'Guests arrive' }, { at: '25:99', title: 'bad time' }] });
  assert.deepEqual(tl.items.map(x => x.title), ['Guests arrive', 'Dinner', 'Closing'], 'sorted through midnight, invalid dropped');
  const cl = await A.req('PUT', `/api/events/${eventId}/checklist`, { items: [{ phase: '30 days before', title: 'Confirm venue' }, { phase: 'Event day', title: 'Sound check' }] });
  assert.equal(cl.items.length, 2); assert.equal((await A.req('PATCH', `/api/events/${eventId}/checklist/${cl.items[0].id}`, { done: true })).status, 200);
  assert.equal((await A.req('GET', `/api/events/${eventId}/checklist`)).items[0].done, true);
});
test('digital invitation: publish, public view, RSVP lands in the guest list', async () => {
  const draft = await A.req('PUT', `/api/events/${eventId}/invitation`, { title: 'Rita & Sami', host: 'The Haddad family', message: 'Join us', date: '2027-06-24', time: '19:30', location: 'Batroun', theme: ['#C8A96B', 'javascript:x'], published: false });
  assert.equal(draft.status, 200); assert.deepEqual(draft.invitation.theme, ['#C8A96B'], 'only real colours kept');
  const tk = draft.invitation.url.split('/#/i/')[1];
  assert.equal((await client().req('GET', `/api/invite/${tk}`)).status, 404, 'unpublished stays private');
  await A.req('PUT', `/api/events/${eventId}/invitation`, { title: 'Rita & Sami', date: '2027-06-24', time: '19:30', location: 'Batroun', published: true });
  const guest = client(), view = await guest.req('GET', `/api/invite/${tk}`); assert.equal(view.invitation.title, 'Rita & Sami'); assert.equal(view.invitation.url, undefined);
  assert.equal((await guest.req('POST', `/api/invite/${tk}/rsvp`, { name: 'Maya', attending: true, plusOne: true, dietary: 'Vegan', elapsed: 9000 })).status, 201);
  assert.equal((await guest.req('POST', `/api/invite/${tk}/rsvp`, { name: 'maya', attending: false, elapsed: 9000 })).status, 201, 'same guest can change their answer');
  assert.equal((await guest.req('POST', `/api/invite/${tk}/rsvp`, { name: 'Bot', attending: true, company_site: 'x', elapsed: 9000 })).status, 200, 'spam silently ignored');
  const gl = await A.req('GET', `/api/events/${eventId}/guests`), maya = gl.guests.filter(g => g.name.toLowerCase() === 'maya');
  assert.equal(maya.length, 1); assert.equal(maya[0].rsvp, 'declined'); assert.ok(!gl.guests.some(g => g.name === 'Bot'));
  const S = client(); await S.req('POST', '/api/auth/register', { name: 'Nosy', email: 'nosy@example.com', password: 'Nosy-person-1234', consent: true });
  assert.equal((await S.req('PUT', `/api/events/${eventId}/invitation`, { title: 'Hacked', published: true })).status, 404);
  const nl = await A.req('POST', `/api/events/${eventId}/invitation/new-link`); assert.notEqual(nl.invitation.url, draft.invitation.url);
  assert.equal((await client().req('GET', `/api/invite/${tk}`)).status, 404, 'old link stops working');
});
test('vendor marketplace: hidden until consent is recorded and the listing is on', async () => {
  const raw = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': '192.0.2.77' }, body: JSON.stringify({ email: 'boss@ma3ak.test', password: 'Boss-password-1234' }) });
  const ck = raw.headers.get('set-cookie').split(';')[0], csrf = (await raw.json()).csrf;
  const adm = async (m, p, b) => { const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, Cookie: ck, 'X-CSRF-Token': csrf }, body: b ? JSON.stringify(b) : undefined }); return { status: r.status, ...(await r.json()) }; };
  const v = { name: 'Cedar Sound', category: 'dj', locations: ['beirut', 'mars'], eventTypes: ['wedding'], priceFrom: 600 };
  const real = list => list.filter(x => !x.isDemo);
  assert.equal((await adm('PUT', '/api/admin/vendors/cedar-sound', { ...v, active: true })).status, 422, 'cannot go live without consent');
  assert.equal((await adm('PUT', '/api/admin/vendors/cedar-sound', { ...v, active: false })).status, 200);
  assert.equal((await adm('PUT', '/api/admin/vendors/cedar-sound/packages/new', { name: 'Night set', price: 600, unit: 'flat', includes: ['5 hours'] })).status, 200);
  let pub = await (await fetch(BASE + '/api/vendors', { cache: 'no-store' })).json(); assert.equal(real(pub.vendors).length, 0, 'not public yet');
  assert.ok(pub.vendors.length > 0 && pub.vendors.every(x => x.isDemo && !x.verified), 'seeded demo providers are labelled and never verified');
  assert.equal((await adm('PUT', '/api/admin/vendors/cedar-sound', { ...v, consent: true, consentNote: 'Agreed by phone', active: false })).status, 200);
  assert.equal((await adm('POST', '/api/admin/vendors/cedar-sound/review', { action: 'approve' })).status, 422, 'verification needs the checklist');
  assert.equal((await adm('POST', '/api/admin/vendors/cedar-sound/review', { action: 'approve', checks: { identity: true, business: true, authority: true, listing: true } })).status, 200);
  pub = await (await fetch(BASE + '/api/vendors?x=1')).json(); const c = real(pub.vendors)[0];
  assert.equal(c.name, 'Cedar Sound'); assert.deepEqual(c.locations, ['beirut'], 'unknown areas dropped'); assert.equal(c.verified, true); assert.equal(c.packages[0].name, 'Night set'); assert.equal(c.startingPrice, 600);
  assert.equal((await A.req('PUT', '/api/admin/vendors/hack', v)).status, 401, 'customers cannot manage vendors');
});
test('analytics endpoint accepts known events only', async () => {
  assert.equal((await A.req('POST', '/api/t', { anon: 'abcdef1234', events: [{ name: 'preview_opened' }, { name: 'evil' }, { name: 'item_equipped', props: { item: 'dj' } }] })).status, 202);
});
test('admin: analytics, users, leads, catalog edit, AI chats, knowledge, integrations', async () => {
  const l = await admin.req('POST', '/api/admin/login', { email: 'boss@ma3ak.test', password: 'Boss-password-1234' }); assert.equal(l.status, 200);
  const sc = l; // admin cookie name differs
  const h = async (m, p, b) => { const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, Cookie: admin.adminCookie, 'X-CSRF-Token': l.csrf }, body: b ? JSON.stringify(b) : undefined }); return { status: r.status, ...(await r.json()) }; };
  const raw = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'X-Forwarded-For': '192.0.2.9' }, body: JSON.stringify({ email: 'boss@ma3ak.test', password: 'Boss-password-1234' }) });
  admin.adminCookie = raw.headers.get('set-cookie').split(';')[0]; const lj = await raw.json(); l.csrf = lj.csrf;
  const rep = await h('GET', '/api/admin/analytics'); assert.equal(rep.status, 200); assert.ok(rep.report.totals.users >= 3); assert.ok(rep.report.funnel.length === 4); assert.ok(rep.report.equipped.some(x => x.k === 'dj'));
  const users = await h('GET', '/api/admin/users'); assert.ok(users.rows.find(u => u.email === 'anthony@example.com'));
  const leads = await h('GET', '/api/admin/leads'); assert.equal(leads.rows[0].email, 'anthony@example.com', 'most engaged customer ranks first');
  assert.equal((await h('PUT', '/api/admin/catalog/dj', { category: 'stage', name: 'Pro DJ booth', model: 'dj', field: 'music', value: 'DJ', rarity: 'r', price_from: 400, popular: true, tags: 'popular' })).status, 200);
  const cat = await (await fetch(BASE + '/api/catalog')).json(); assert.equal(cat.items.find(i => i.id === 'dj').name, 'Pro DJ booth');
  assert.ok((await h('GET', '/api/admin/ai')).rows.some(c => c.handoff === 1));
  assert.equal((await h('PUT', '/api/admin/kb/new', { topic: 'Packages', title: 'Gold package', body: 'Includes venue styling and DJ.' })).status, 200);
  const ints = await h('GET', '/api/admin/integrations'); assert.equal(ints.integrations.whatsapp.configured, false); assert.equal(ints.integrations.ai.configured, true);
  // customers can't use admin endpoints
  assert.equal((await A.req('GET', '/api/admin/users')).status, 401);
});
test('account deletion removes the customer’s data', async () => {
  assert.equal((await A.req('DELETE', '/api/me', { password: 'wrong' })).status, 422);
  assert.equal((await A.req('DELETE', '/api/me', { password: 'Wedding-plans-2027' })).status, 200);
  const C = client(); assert.equal((await C.req('POST', '/api/auth/login', { email: 'anthony@example.com', password: 'Wedding-plans-2027' })).status, 401);
  assert.equal((await B.req('GET', `/api/events/${eventId}`)).status, 404, 'event deleted with its owner');
});
