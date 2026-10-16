// Providers: public directory, partner portal, quote requests, and admin review.
// A listing is public only when status = 'approved', active = 1 and the provider's consent is recorded.
// Partners can only ever see and change their own listing and their own quote requests.
import { config } from './config.js';
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { check, clean } from './validate.js';
import { decodeImage } from './uploads.js';
import { putImage, sendImage, removeImage } from './storage.js';
import { currentUser, requireUser, publicUser, startSession, issueToken } from './users.js';
import { rateLimit, clientIp, ipHash, newRef, originAllowed, hashPassword, passwordProblems } from './security.js';
import { sendEmail, emailHtml } from './integrations.js';
import { audit } from './audit.js';

export const AREAS = ['beirut', 'metn', 'keserwan', 'jbeil', 'batroun', 'aley', 'chouf', 'bekaa', 'north', 'south'];
export const EVENT_TYPES = ['wedding', 'engagement', 'birthday', 'graduation', 'corporate', 'private', 'baby-shower', 'bachelor', 'bachelorette', 'beach', 'outdoor', 'other'];
export const UNITS = ['flat', 'per_guest', 'per_hour', 'per_item'];
const QUOTE_STATUSES = ['new', 'replied', 'quoted', 'accepted', 'declined', 'closed'];
const PUBLIC = "v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL";
const MAX_PHOTOS = 10, MAX_PACKAGES = 20;

// Category ids come from the database (Admin → Categories). Cached briefly per server instance.
let catCache = { at: 0, ids: [] };
export async function categoryIds(db, fresh = false) {
  if (fresh || Date.now() - catCache.at > 30e3) catCache = { at: Date.now(), ids: (await db.all('SELECT id FROM categories WHERE active = 1 ORDER BY sort')).map(r => r.id) };
  return catCache.ids;
}
export const clearCategoryCache = () => { catCache.at = 0; };

const words = (v, allowed) => [...new Set((Array.isArray(v) ? v : String(v || '').split(/[\s,]+/)).map(x => clean(x, 40)).filter(x => x && (!allowed || allowed.includes(x))))].slice(0, 20);
const services = v => (Array.isArray(v) ? v : String(v || '').split('|')).map(x => clean(x, 60)).filter(Boolean).slice(0, 12);
const int = (x, max = 1e8) => x === '' || x == null ? null : Number.isFinite(+x) && +x >= 0 ? Math.min(max, Math.round(+x)) : null;
const handle = v => clean(v, 80).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '');
const parseList = s => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };

const pubPackage = p => ({ id: p.id, name: p.name, description: p.description, price: p.price, priceMax: p.price_max, unit: p.unit, minQty: p.min_qty, includes: parseList(p.includes), active: !!p.active });
const photoUrl = id => `/api/photos/${id}`;
// The shape the website uses for a provider card / profile.
function toPublic(v, pk = [], ph = []) {
  const live = pk.filter(p => p.active);
  const priced = live.filter(p => p.price != null);
  const flat = priced.filter(p => p.unit === 'flat');
  const start = (flat.length ? flat : priced).sort((a, b) => a.price - b.price)[0];
  return {
    id: v.id, name: v.name, category: v.category, locations: v.locations.split(' ').filter(Boolean), eventTypes: v.event_types.split(' ').filter(Boolean), services: v.services ? v.services.split('|') : [],
    description: v.description, about: v.about, availabilityNote: v.availability_note,
    startingPrice: start ? start.price : v.price_from, startingUnit: start ? start.unit : 'flat',
    capacity: v.capacity_max ? { min: v.capacity_min || 0, max: v.capacity_max } : null,
    packages: live.map(pubPackage), photos: ph.map(p => ({ src: photoUrl(p.id), alt: p.alt || v.name })),
    phone: v.phone, whatsapp: v.whatsapp, instagram: v.instagram, website: v.website, email: v.email,
    verified: !!v.verified && !v.is_demo, featured: !!v.featured, isDemo: !!v.is_demo, claimed: !!v.owner_user_id,
    rating: null, reviewCount: 0, unavailableDates: [], joinedAt: (v.approved_at || v.consent_at || v.created_at).slice(0, 10),
  };
}
async function withChildren(db, vendors, { allPackages = false } = {}) {
  if (!vendors.length) return [];
  const ids = vendors.map(v => v.id), ph = ids.map(() => '?').join(',');
  const pk = await db.all(`SELECT * FROM vendor_packages WHERE vendor_id IN (${ph}) ${allPackages ? '' : 'AND active = 1'} ORDER BY sort, created_at`, ...ids);
  const photos = await db.all(`SELECT id, vendor_id, alt, sort FROM vendor_photos WHERE vendor_id IN (${ph}) ORDER BY sort, created_at`, ...ids);
  return vendors.map(v => ({ v, pk: pk.filter(p => p.vendor_id === v.id), ph: photos.filter(p => p.vendor_id === v.id) }));
}
const privateVendor = (v, pk, ph) => ({ ...toPublic(v, pk, ph), packages: pk.map(pubPackage), photos: ph.map(p => ({ id: p.id, src: photoUrl(p.id), alt: p.alt, sort: p.sort })),
  status: v.status, active: !!v.active, consentAt: v.consent_at, consentNote: v.consent_note, reviewNote: v.review_note, submittedAt: v.submitted_at, approvedAt: v.approved_at,
  partnerUpdatedAt: v.partner_updated_at, changedSinceApproval: !!(v.approved_at && v.partner_updated_at && v.partner_updated_at > v.approved_at), priceFrom: v.price_from,
  capacityMin: v.capacity_min, capacityMax: v.capacity_max, isDemo: !!v.is_demo, verified: !!v.verified, createdAt: v.created_at, updatedAt: v.updated_at });

// ---------- shared validation for profile, package and photo changes ----------
async function profileFrom(db, b, prev = {}) {
  const c = check(b, { name: { required: true, max: 120, msg: 'Enter the business name.' }, category: { required: true, max: 40, msg: 'Choose a category.' }, description: { max: 300 }, about: { max: 4000 },
    availabilityNote: { max: 300 }, phone: { type: 'phone', max: 30 }, whatsapp: { type: 'phone', max: 30 }, instagram: { max: 120 }, website: { type: 'url', max: 300 }, email: { type: 'email', max: 254 } });
  if (c.ok && !(await categoryIds(db)).includes(c.value.category)) c.fields.category = 'Choose a category from the list.';
  if (Object.keys(c.fields).length) return { error: 'Please check the highlighted fields.', fields: c.fields };
  const v = c.value, capMin = int(b.capacityMin, 100000), capMax = int(b.capacityMax, 100000);
  if (capMin && capMax && capMin > capMax) return { error: 'Minimum capacity is above the maximum.', fields: { capacityMin: 'Check the numbers.' } };
  return { value: { name: v.name, category: v.category, description: v.description || '', about: v.about || '', availability_note: v.availabilityNote || '',
    locations: words(b.locations ?? prev.locations, AREAS).join(' '), event_types: words(b.eventTypes ?? prev.event_types, EVENT_TYPES).join(' '), services: services(b.services ?? prev.services).join('|'),
    price_from: int(b.priceFrom), capacity_min: capMin, capacity_max: capMax, phone: v.phone || null, whatsapp: v.whatsapp || null, instagram: handle(v.instagram) || null,
    website: v.website ? (/^https?:\/\//i.test(v.website) ? v.website : 'https://' + v.website) : null, email: v.email || null } };
}
function packageFrom(b) {
  const c = check(b, { name: { required: true, max: 80, msg: 'Name the package.' }, description: { max: 500 }, unit: { oneOf: UNITS } });
  if (!c.ok) return { error: 'Please check the package.', fields: c.fields };
  const price = int(b.price), max = int(b.priceMax);
  if (b.price !== '' && b.price != null && price == null) return { error: 'Enter the price as a whole number, or leave it empty for “Request a quote”.', fields: { price: 'Invalid.' } };
  if (max != null && (price == null || max < price)) return { error: 'The “up to” price must be higher than the starting price.', fields: { priceMax: 'Check the numbers.' } };
  return { value: { name: c.value.name, description: c.value.description || '', price, price_max: max, unit: c.value.unit || 'flat', min_qty: int(b.minQty, 100000),
    includes: JSON.stringify((Array.isArray(b.includes) ? b.includes : String(b.includes || '').split('\n')).map(x => clean(x, 80)).filter(Boolean).slice(0, 12)), active: b.active === false ? 0 : 1, sort: int(b.sort, 1000) ?? 0 } };
}
async function savePackage(db, vendorId, pid, p) {
  const t = now();
  if (pid === 'new') {
    if ((await db.get('SELECT COUNT(*) AS n FROM vendor_packages WHERE vendor_id = ?', vendorId)).n >= MAX_PACKAGES) return { error: `A provider can have up to ${MAX_PACKAGES} packages.` };
    const id = uid(); await db.run('INSERT INTO vendor_packages (id, vendor_id, name, description, price, price_max, unit, min_qty, includes, active, sort, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      id, vendorId, p.name, p.description, p.price, p.price_max, p.unit, p.min_qty, p.includes, p.active, p.sort, t, t);
    return { id };
  }
  const r = await db.run('UPDATE vendor_packages SET name=?, description=?, price=?, price_max=?, unit=?, min_qty=?, includes=?, active=?, sort=?, updated_at=? WHERE id = ? AND vendor_id = ?',
    p.name, p.description, p.price, p.price_max, p.unit, p.min_qty, p.includes, p.active, p.sort, t, String(pid), vendorId);
  return r.changes ? { id: pid } : { error: 'Package not found.', status: 404 };
}
async function addPhoto(db, vendorId, b) {
  if ((await db.get('SELECT COUNT(*) AS n FROM vendor_photos WHERE vendor_id = ?', vendorId)).n >= MAX_PHOTOS) return { error: `Up to ${MAX_PHOTOS} photos per provider. Delete one first.` };
  const img = decodeImage(b.image); if (!img) return { error: 'Use a JPG or PNG photo under 4 MB.' };
  const saved = await putImage(img), sort = (await db.get('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM vendor_photos WHERE vendor_id = ?', vendorId)).n;
  await db.run('INSERT INTO vendor_photos (id, vendor_id, mime, size, alt, sort, created_at) VALUES (?,?,?,?,?,?,?)', saved.id, vendorId, saved.mime, saved.size, clean(b.alt, 160), sort, now());
  return { id: saved.id };
}
async function deleteVendorFiles(db, vendorId) { for (const p of await db.all('SELECT id FROM vendor_photos WHERE vendor_id = ?', vendorId)) await removeImage(p.id); }
const slug = s => clean(s, 60).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'provider';
async function body(req, res, size = 64e3) { if (!originAllowed(req)) { fail(res, 403, 'Request blocked.'); return null; } try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }
const baseUrl = req => config.allowedOrigins[0] || `https://${req.headers.host}`;
async function notifyTeam(subject, lines, req, path = '/admin/') { if (!config.notifyEmail) return; await sendEmail({ to: config.notifyEmail, subject, text: lines.join('\n'), html: emailHtml(subject, lines, { url: baseUrl(req) + path, label: 'Open the admin' }) }); }

// The signed-in partner and their listing (one listing per partner account).
async function partner(req, res, db, write = false) {
  const u = await requireUser(req, res, db, { write }); if (!u) return null;
  if (u.role !== 'partner') { fail(res, 403, 'This page is for provider accounts.', { code: 'not_partner' }); return null; }
  const v = await db.get('SELECT * FROM vendors WHERE owner_user_id = ?', u.id);
  if (!v) { fail(res, 404, 'Your provider profile was not found. Contact MA3AK.'); return null; }
  return { u, v };
}
const partnerTouched = (db, v) => db.run('UPDATE vendors SET partner_updated_at = ?, updated_at = ? WHERE id = ?', now(), now(), v.id);

export function vendorRoutes(db, guard) {
  return {
    // ---------------- public directory ----------------
    'GET /api/vendors': async (req, res) => {
      const rows = await db.all(`SELECT v.* FROM vendors v WHERE ${PUBLIC} ORDER BY v.is_demo, v.featured DESC, v.verified DESC, v.name`);
      sendJson(res, 200, { ok: true, vendors: (await withChildren(db, rows)).map(x => toPublic(x.v, x.pk, x.ph)) });
    },
    'GET /api/vendors/:id': async (req, res, _db, url, id) => {
      const v = await db.get(`SELECT v.* FROM vendors v WHERE v.id = ? AND ${PUBLIC}`, String(id)); if (!v) return fail(res, 404, 'This provider isn’t listed.');
      const [x] = await withChildren(db, [v]); sendJson(res, 200, { ok: true, vendor: toPublic(x.v, x.pk, x.ph) });
    },
    // Photos: public when the listing is public; otherwise only the owner partner or an admin.
    'GET /api/photos/:id': async (req, res, _db, url, id) => {
      const p = await db.get('SELECT p.id, v.id AS vid, v.owner_user_id, v.status, v.active, v.consent_at FROM vendor_photos p JOIN vendors v ON v.id = p.vendor_id WHERE p.id = ?', String(id));
      if (!p) return fail(res, 404, 'Not found.');
      if (p.status === 'approved' && p.active && p.consent_at) return sendImage(res, p.id, { cache: 'public, max-age=86400' });
      const u = await currentUser(req, db);
      if ((u && u.id === p.owner_user_id) || await guard.peek(req)) return sendImage(res, p.id);
      return fail(res, 404, 'Not found.');
    },
    // Quote request to one provider. Never confirms availability: the provider answers.
    'POST /api/vendors/:id/quotes': async (req, res, _db, url, id) => {
      const k = ipHash(clientIp(req));
      if (!(await rateLimit(`quote:m:${k}`, 3, 60e3)).ok || !(await rateLimit(`quote:h:${k}`, 15, 3600e3)).ok) return fail(res, 429, 'Too many requests. Please try again later.');
      const b = await body(req, res, 16e3); if (!b) return;
      if (b.company_site || (typeof b.elapsed === 'number' && b.elapsed < 2500)) return sendJson(res, 201, { ok: true, ref: newRef('Q') });
      const v = await db.get(`SELECT v.* FROM vendors v WHERE v.id = ? AND ${PUBLIC}`, String(id)); if (!v) return fail(res, 404, 'This provider isn’t listed.');
      const u = await currentUser(req, db);
      const c = check({ name: b.name || u?.name || '', email: b.email || u?.email || '', phone: b.phone || u?.phone || '', message: b.message, location: b.location },
        { name: { required: true, max: 120, msg: 'Enter your name.' }, email: { type: 'email', max: 254 }, phone: { type: 'phone', max: 30 }, message: { max: 2000 }, location: { oneOf: AREAS } });
      if (!c.ok) return fail(res, 422, 'Please check the highlighted fields.', { fields: c.fields });
      if (!c.value.email && !c.value.phone) return fail(res, 422, 'Add an email or a phone number so the provider can reply.', { fields: { email: 'Email or phone required.' } });
      if (b.consent !== true && !u) return fail(res, 422, 'Please accept the privacy policy.', { fields: { consent: 'Required.' } });
      const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : null;
      if (date && date < now().slice(0, 10)) return fail(res, 422, 'Choose a date in the future.', { fields: { date: 'Past date.' } });
      const guests = int(b.guests, 100000), pkg = b.packageId ? await db.get('SELECT id, name FROM vendor_packages WHERE id = ? AND vendor_id = ? AND active = 1', String(b.packageId), v.id) : null;
      const ev = u && b.eventId ? await db.get('SELECT id FROM events WHERE id = ? AND user_id = ?', String(b.eventId), u.id) : null;
      const ref = newRef('Q'), t = now();
      await db.run('INSERT INTO quotes (id, ref, vendor_id, package_id, event_id, user_id, name, email, phone, event_date, guests, location, message, status, ip_hash, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        uid(), ref, v.id, pkg?.id || null, ev?.id || null, u?.id || null, c.value.name, c.value.email || null, c.value.phone || null, date, guests, c.value.location || null, c.value.message || '', 'new', k, t, t);
      const lines = [`New quote request ${ref} for ${v.name}${pkg ? ` (${pkg.name})` : ''}.`, `Date: ${date || 'not set'} · Guests: ${guests || 'not set'}${c.value.location ? ` · Area: ${c.value.location}` : ''}`, 'Open your MA3AK partner page to reply.'];
      const owner = v.owner_user_id ? await db.get('SELECT email FROM users WHERE id = ?', v.owner_user_id) : null;
      if (owner?.email) sendEmail({ to: owner.email, subject: `New quote request ${ref}`, text: lines.join('\n'), html: emailHtml('New quote request', lines, { url: baseUrl(req) + '/#/partner', label: 'Reply on MA3AK' }) }).catch(() => {});
      notifyTeam(`Quote request ${ref} for ${v.name}${v.is_demo ? ' (demo listing)' : ''}`, lines, req).catch(() => {});
      sendJson(res, 201, { ok: true, ref, demo: !!v.is_demo });
    },
    'GET /api/my/quotes': async (req, res) => {
      const u = await requireUser(req, res, db); if (!u) return;
      const rows = await db.all(`SELECT q.id, q.ref, q.status, q.event_date, q.guests, q.message, q.reply, q.quoted_amount, q.created_at, q.updated_at, q.event_id, v.id AS vendor_id, v.name AS vendor_name, v.is_demo, p.name AS package_name
        FROM quotes q JOIN vendors v ON v.id = q.vendor_id LEFT JOIN vendor_packages p ON p.id = q.package_id WHERE q.user_id = ? ORDER BY q.created_at DESC LIMIT 200`, u.id);
      sendJson(res, 200, { ok: true, quotes: rows.map(r => ({ ...r, is_demo: !!r.is_demo })) });
    },

    // ---------------- partner accounts ----------------
    // Providers sign up here. The listing starts as a private draft; MA3AK reviews it before anything is public.
    'POST /api/partner/register': async (req, res) => {
      const k = ipHash(clientIp(req)); if (!(await rateLimit(`preg:${k}`, 5, 3600e3)).ok) return fail(res, 429, 'Too many attempts. Please wait a few minutes.');
      const b = await body(req, res, 8192); if (!b) return;
      if (b.company_site) return sendJson(res, 200, { ok: true });
      const c = check(b, { name: { required: true, max: 80, msg: 'Enter your name.' }, email: { required: true, type: 'email', max: 254 }, businessName: { required: true, max: 120, msg: 'Enter your business name.' }, category: { required: true, max: 40, msg: 'Choose a category.' }, phone: { required: true, type: 'phone', max: 30 } });
      if (c.ok && !(await categoryIds(db)).includes(c.value.category)) c.fields.category = 'Choose a category from the list.';
      if (Object.keys(c.fields).length) return fail(res, 422, 'Please check the highlighted fields.', { fields: c.fields });
      const pw = passwordProblems(b.password); if (pw) return fail(res, 422, pw, { fields: { password: pw } });
      if (b.consent !== true) return fail(res, 422, 'Please accept the privacy policy and partner terms.', { fields: { consent: 'Required.' } });
      if (await db.get('SELECT 1 FROM users WHERE email = ?', c.value.email)) return fail(res, 409, 'An account with this email already exists. Sign in, then open “Become a partner”.', { fields: { email: 'Already registered.' } });
      const t = now(), userId = uid(), vendorId = `${slug(c.value.businessName)}-${uid().slice(0, 6)}`;
      await tx(db, async (db) => {
        await db.run("INSERT INTO users (id, email, name, phone, pass_hash, role, created_at, updated_at) VALUES (?,?,?,?,?,'partner',?,?)", userId, c.value.email, c.value.name, c.value.phone, hashPassword(b.password), t, t);
        await db.run("INSERT INTO vendors (id, owner_user_id, name, category, phone, email, status, created_at, updated_at) VALUES (?,?,?,?,?,?,'draft',?,?)", vendorId, userId, c.value.businessName, c.value.category, c.value.phone, c.value.email, t, t);
      });
      await audit(db, { actor: `partner:${c.value.email}` }, 'partner_registered', vendorId);
      const user = { id: userId, email: c.value.email, name: c.value.name, phone: c.value.phone, role: 'partner', plan: 'free', email_verified: 0, created_at: t };
      const mailed = await issueToken(db, user, 'verify', req);
      return startSession(res, db, user, 201, { next: '#/partner', verificationSent: mailed });
    },
    // An existing customer account becomes a provider account.
    'POST /api/partner/upgrade': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res, 8192); if (!b) return;
      if (u.role === 'partner') return sendJson(res, 200, { ok: true });
      const c = check(b, { businessName: { required: true, max: 120 }, category: { required: true, max: 40 }, phone: { required: true, type: 'phone', max: 30 } });
      if (c.ok && !(await categoryIds(db)).includes(c.value.category)) c.fields.category = 'Choose a category from the list.';
      if (Object.keys(c.fields).length) return fail(res, 422, 'Please check the highlighted fields.', { fields: c.fields });
      if (b.consent !== true) return fail(res, 422, 'Please accept the partner terms.', { fields: { consent: 'Required.' } });
      const t = now(), vendorId = `${slug(c.value.businessName)}-${uid().slice(0, 6)}`;
      await tx(db, async (db) => {
        await db.run("UPDATE users SET role = 'partner', updated_at = ? WHERE id = ?", t, u.id);
        await db.run("INSERT INTO vendors (id, owner_user_id, name, category, phone, email, status, created_at, updated_at) VALUES (?,?,?,?,?,?,'draft',?,?)", vendorId, u.id, c.value.businessName, c.value.category, c.value.phone, u.email, t, t);
      });
      await audit(db, { actor: `partner:${u.email}` }, 'partner_upgraded', vendorId);
      sendJson(res, 200, { ok: true });
    },
    'GET /api/partner': async (req, res) => {
      const p = await partner(req, res, db); if (!p) return;
      const [x] = await withChildren(db, [p.v], { allPackages: true });
      const quotes = await db.all(`SELECT q.id, q.ref, q.status, q.name, q.email, q.phone, q.event_date, q.guests, q.location, q.message, q.reply, q.quoted_amount, q.partner_note, q.created_at, q.updated_at, pk.name AS package_name
        FROM quotes q LEFT JOIN vendor_packages pk ON pk.id = q.package_id WHERE q.vendor_id = ? ORDER BY q.created_at DESC LIMIT 300`, p.v.id);
      sendJson(res, 200, { ok: true, user: publicUser(p.u), vendor: privateVendor(x.v, x.pk, x.ph), quotes, areas: AREAS, eventTypes: EVENT_TYPES, units: UNITS });
    },
    'PUT /api/partner/profile': async (req, res) => {
      const p = await partner(req, res, db, true); if (!p) return; const b = await body(req, res); if (!b) return;
      const r = await profileFrom(db, b, p.v); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const v = r.value, t = now();
      await db.run(`UPDATE vendors SET name=?, category=?, description=?, about=?, availability_note=?, locations=?, event_types=?, services=?, price_from=?, capacity_min=?, capacity_max=?, phone=?, whatsapp=?, instagram=?, website=?, email=?, partner_updated_at=?, updated_at=? WHERE id = ?`,
        v.name, v.category, v.description, v.about, v.availability_note, v.locations, v.event_types, v.services, v.price_from, v.capacity_min, v.capacity_max, v.phone, v.whatsapp, v.instagram, v.website, v.email, t, t, p.v.id);
      await audit(db, { actor: `partner:${p.u.email}` }, 'partner_profile_updated', p.v.id);
      sendJson(res, 200, { ok: true });
    },
    // Ask MA3AK to review and publish the listing.
    'POST /api/partner/submit': async (req, res) => {
      const p = await partner(req, res, db, true); if (!p) return; const b = await body(req, res, 4096); if (!b) return;
      if (b.consent !== true) return fail(res, 422, 'Please confirm that MA3AK may publish your listing.', { fields: { consent: 'Required.' } });
      const v = p.v, problems = [];
      if (v.description.length < 20) problems.push('a short description (20+ characters)');
      if (!v.locations) problems.push('the areas you serve');
      if (!v.phone && !v.email) problems.push('a phone number or email');
      if (!(await db.get('SELECT 1 FROM vendor_packages WHERE vendor_id = ? AND active = 1', v.id))) problems.push('at least one package or service');
      if (problems.length) return fail(res, 422, `Before submitting, add ${problems.join(', ')}.`, { code: 'incomplete' });
      if (v.status === 'approved') return sendJson(res, 200, { ok: true, listingStatus: 'approved' });
      const t = now();
      await db.run("UPDATE vendors SET status = 'pending', consent_at = COALESCE(consent_at, ?), consent_note = ?, submitted_at = ?, updated_at = ? WHERE id = ?", t, 'Agreed by the provider in the partner portal', t, t, v.id);
      await audit(db, { actor: `partner:${p.u.email}` }, 'partner_submitted', v.id);
      notifyTeam(`Provider waiting for approval: ${v.name}`, [`${v.name} (${v.category}) submitted their listing for review.`], req, '/admin/#vendors').catch(() => {});
      sendJson(res, 200, { ok: true, listingStatus: 'pending' });
    },
    'PUT /api/partner/packages/:pid': async (req, res, _db, url, pid) => {
      const p = await partner(req, res, db, true); if (!p) return; const b = await body(req, res, 16e3); if (!b) return;
      const r = packageFrom(b); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const s = await savePackage(db, p.v.id, pid, r.value); if (s.error) return fail(res, s.status || 422, s.error);
      await partnerTouched(db, p.v); sendJson(res, 200, { ok: true, id: s.id });
    },
    'DELETE /api/partner/packages/:pid': async (req, res, _db, url, pid) => {
      const p = await partner(req, res, db, true); if (!p) return;
      const r = await db.run('DELETE FROM vendor_packages WHERE id = ? AND vendor_id = ?', String(pid), p.v.id); if (!r.changes) return fail(res, 404, 'Package not found.');
      await partnerTouched(db, p.v); sendJson(res, 200, { ok: true });
    },
    'POST /api/partner/photos': async (req, res) => {
      const p = await partner(req, res, db, true); if (!p) return;
      if (!(await rateLimit(`photo:${p.u.id}`, 40, 3600e3)).ok) return fail(res, 429, 'Too many uploads. Please wait a little.');
      const b = await body(req, res, 5.8e6); if (!b) return;
      const r = await addPhoto(db, p.v.id, b); if (r.error) return fail(res, 422, r.error);
      await partnerTouched(db, p.v); sendJson(res, 201, { ok: true, id: r.id, src: photoUrl(r.id) });
    },
    'PATCH /api/partner/photos/:id': async (req, res, _db, url, id) => {
      const p = await partner(req, res, db, true); if (!p) return; const b = await body(req, res, 4096); if (!b) return;
      const r = await db.run('UPDATE vendor_photos SET alt = COALESCE(?, alt), sort = COALESCE(?, sort) WHERE id = ? AND vendor_id = ?', b.alt != null ? clean(b.alt, 160) : null, int(b.sort, 1000), String(id), p.v.id);
      if (!r.changes) return fail(res, 404, 'Photo not found.'); sendJson(res, 200, { ok: true });
    },
    'DELETE /api/partner/photos/:id': async (req, res, _db, url, id) => {
      const p = await partner(req, res, db, true); if (!p) return;
      const r = await db.run('DELETE FROM vendor_photos WHERE id = ? AND vendor_id = ?', String(id), p.v.id); if (!r.changes) return fail(res, 404, 'Photo not found.');
      await removeImage(String(id)); await partnerTouched(db, p.v); sendJson(res, 200, { ok: true });
    },
    'PATCH /api/partner/quotes/:id': async (req, res, _db, url, id) => {
      const p = await partner(req, res, db, true); if (!p) return; const b = await body(req, res, 16e3); if (!b) return;
      const q = await db.get('SELECT * FROM quotes WHERE id = ? AND vendor_id = ?', String(id), p.v.id); if (!q) return fail(res, 404, 'Request not found.');
      const r = await updateQuote(db, q, b, req, p.v); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      sendJson(res, 200, { ok: true });
    },

    // ---------------- admin ----------------
    'GET /api/admin/vendors': async (req, res, _db, url) => {
      if (!await guard(req, res)) return;
      const st = url.searchParams.get('status'), q = clean(url.searchParams.get('q'), 80), where = [], args = [];
      if (['draft', 'pending', 'approved', 'rejected'].includes(st)) { where.push('v.status = ?'); args.push(st); }
      if (st === 'demo') where.push('v.is_demo = 1');
      if (q) { where.push('(v.name ILIKE ? OR v.id ILIKE ? OR u.email ILIKE ?)'); const l = `%${q.replace(/[%_\\]/g, m => '\\' + m)}%`; args.push(l, l, l); }
      const rows = await db.all(`SELECT v.*, u.email AS owner_email, u.name AS owner_name,
          (SELECT COUNT(*) FROM vendor_packages p WHERE p.vendor_id = v.id) AS packages, (SELECT COUNT(*) FROM vendor_photos f WHERE f.vendor_id = v.id) AS photos,
          (SELECT COUNT(*) FROM quotes q WHERE q.vendor_id = v.id AND q.status = 'new') AS new_quotes
        FROM vendors v LEFT JOIN users u ON u.id = v.owner_user_id ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY CASE v.status WHEN 'pending' THEN 0 WHEN 'draft' THEN 1 WHEN 'approved' THEN 2 ELSE 3 END, v.updated_at DESC LIMIT 500`, ...args);
      sendJson(res, 200, { ok: true, vendors: rows.map(v => ({ id: v.id, name: v.name, category: v.category, status: v.status, active: !!v.active, verified: !!v.verified, featured: !!v.featured, isDemo: !!v.is_demo,
        consent: !!v.consent_at, owner: v.owner_email ? { email: v.owner_email, name: v.owner_name } : null, packages: v.packages, photos: v.photos, newQuotes: v.new_quotes,
        public: v.status === 'approved' && !!v.active && !!v.consent_at, changedSinceApproval: !!(v.approved_at && v.partner_updated_at && v.partner_updated_at > v.approved_at), submittedAt: v.submitted_at, updatedAt: v.updated_at })),
        categories: await categoryIds(db), areas: AREAS, eventTypes: EVENT_TYPES, units: UNITS });
    },
    'GET /api/admin/vendors/:id': async (req, res, _db, url, id) => {
      if (!await guard(req, res)) return;
      const v = await db.get('SELECT * FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Not found.');
      const [x] = await withChildren(db, [v], { allPackages: true }), owner = v.owner_user_id ? await db.get('SELECT id, email, name, phone, created_at FROM users WHERE id = ?', v.owner_user_id) : null;
      sendJson(res, 200, { ok: true, vendor: privateVendor(x.v, x.pk, x.ph), owner });
    },
    // Create or edit a listing (admin-managed providers, or corrections to a partner's listing).
    'PUT /api/admin/vendors/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 64e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!/^[a-z0-9-]{2,60}$/.test(id)) return fail(res, 422, 'The ID can use lowercase letters, numbers and dashes.', { fields: { id: 'Invalid.' } });
      const prev = await db.get('SELECT * FROM vendors WHERE id = ?', id), r = await profileFrom(db, b, prev || {}); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const v = r.value, t = now(), consentAt = b.consent ? (prev?.consent_at || t) : null;
      if (b.active && !consentAt) return fail(res, 422, 'Record the provider’s agreement to be listed before publishing.', { fields: { consent: 'Required to publish.' } });
      const status = prev ? prev.status : (b.active ? 'approved' : 'draft');
      await db.run(`INSERT INTO vendors (id, name, category, description, about, availability_note, locations, event_types, services, price_from, capacity_min, capacity_max, phone, whatsapp, instagram, website, email, consent_at, consent_note, status, active, featured, verified, is_demo, approved_at, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, description=EXCLUDED.description, about=EXCLUDED.about, availability_note=EXCLUDED.availability_note, locations=EXCLUDED.locations, event_types=EXCLUDED.event_types, services=EXCLUDED.services,
          price_from=EXCLUDED.price_from, capacity_min=EXCLUDED.capacity_min, capacity_max=EXCLUDED.capacity_max, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, instagram=EXCLUDED.instagram, website=EXCLUDED.website, email=EXCLUDED.email,
          consent_at=EXCLUDED.consent_at, consent_note=EXCLUDED.consent_note, active=EXCLUDED.active, featured=EXCLUDED.featured, verified=EXCLUDED.verified, is_demo=EXCLUDED.is_demo, updated_at=EXCLUDED.updated_at`,
        id, v.name, v.category, v.description, v.about, v.availability_note, v.locations, v.event_types, v.services, v.price_from, v.capacity_min, v.capacity_max, v.phone, v.whatsapp, v.instagram, v.website, v.email,
        consentAt, clean(b.consentNote, 300), status, b.active && (status === 'approved' || !prev) ? 1 : 0, b.featured ? 1 : 0, b.verified && !b.isDemo ? 1 : 0, b.isDemo ? 1 : 0, !prev && b.active ? t : prev?.approved_at || null, prev?.created_at || t, t);
      await audit(db, s, prev ? 'vendor_updated' : 'vendor_created', id); sendJson(res, 200, { ok: true });
    },
    // Review actions. Nothing is published or verified automatically.
    'POST /api/admin/vendors/:id/review': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 8192); } catch (e) { return fail(res, e.status || 400, e.message); }
      const v = await db.get('SELECT * FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Not found.');
      const note = clean(b.note, 1000), t = now();
      switch (b.action) {
        case 'approve':
          if (!v.consent_at) return fail(res, 422, 'The provider hasn’t agreed to be listed yet. Ask them to submit from their partner page, or record their consent in the listing.');
          await db.run("UPDATE vendors SET status = 'approved', active = 1, approved_at = ?, review_note = ?, updated_at = ? WHERE id = ?", t, note, t, v.id); break;
        case 'reject': await db.run("UPDATE vendors SET status = 'rejected', active = 0, review_note = ?, updated_at = ? WHERE id = ?", note || 'Not approved', t, v.id); break;
        case 'unpublish': await db.run('UPDATE vendors SET active = 0, review_note = COALESCE(NULLIF(?, \'\'), review_note), updated_at = ? WHERE id = ?', note, t, v.id); break;
        case 'publish':
          if (v.status !== 'approved' || !v.consent_at) return fail(res, 422, 'Approve the listing first.');
          await db.run('UPDATE vendors SET active = 1, approved_at = ?, updated_at = ? WHERE id = ?', t, t, v.id); break;
        case 'verify': if (v.is_demo) return fail(res, 422, 'Demo listings can’t be verified.'); await db.run('UPDATE vendors SET verified = 1, updated_at = ? WHERE id = ?', t, v.id); break;
        case 'unverify': await db.run('UPDATE vendors SET verified = 0, updated_at = ? WHERE id = ?', t, v.id); break;
        case 'feature': await db.run('UPDATE vendors SET featured = 1, updated_at = ? WHERE id = ?', t, v.id); break;
        case 'unfeature': await db.run('UPDATE vendors SET featured = 0, updated_at = ? WHERE id = ?', t, v.id); break;
        default: return fail(res, 422, 'Unknown action.');
      }
      await audit(db, s, `vendor_${b.action}`, v.id, note || null);
      if (v.owner_user_id && ['approve', 'reject'].includes(b.action)) {
        const o = await db.get('SELECT email FROM users WHERE id = ?', v.owner_user_id);
        const lines = b.action === 'approve' ? [`Good news: ${v.name} is now listed on MA3AK.`] : [`Your listing ${v.name} wasn’t approved yet.`, note || 'Open your partner page for details.'];
        if (o?.email) sendEmail({ to: o.email, subject: b.action === 'approve' ? 'Your MA3AK listing is live' : 'Your MA3AK listing needs changes', text: lines.join('\n'), html: emailHtml(b.action === 'approve' ? 'Your listing is live' : 'Your listing needs changes', lines, { url: baseUrl(req) + '/#/partner', label: 'Open partner page' }) }).catch(() => {});
      }
      sendJson(res, 200, { ok: true });
    },
    'DELETE /api/admin/vendors/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return;
      const v = await db.get('SELECT id, owner_user_id FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Not found.');
      await deleteVendorFiles(db, v.id); await db.run('DELETE FROM vendors WHERE id = ?', v.id);
      if (v.owner_user_id) await db.run("UPDATE users SET role = 'customer' WHERE id = ?", v.owner_user_id);
      await audit(db, s, 'vendor_deleted', v.id); sendJson(res, 200, { ok: true });
    },
    'PUT /api/admin/vendors/:id/packages/:pid': async (req, res, _db, url, id, pid) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 16e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!(await db.get('SELECT 1 FROM vendors WHERE id = ?', String(id)))) return fail(res, 404, 'Provider not found.');
      const r = packageFrom(b); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const out = await savePackage(db, String(id), pid, r.value); if (out.error) return fail(res, out.status || 422, out.error);
      await audit(db, s, 'package_saved', `${id}/${out.id}`, `${r.value.name}: ${r.value.price ?? 'quote'} ${r.value.unit}`); sendJson(res, 200, { ok: true, id: out.id });
    },
    'DELETE /api/admin/vendors/:id/packages/:pid': async (req, res, _db, url, id, pid) => {
      const s = await guard(req, res, true); if (!s) return;
      const r = await db.run('DELETE FROM vendor_packages WHERE id = ? AND vendor_id = ?', String(pid), String(id)); if (!r.changes) return fail(res, 404, 'Package not found.');
      await audit(db, s, 'package_deleted', `${id}/${pid}`); sendJson(res, 200, { ok: true });
    },
    'POST /api/admin/vendors/:id/photos': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 5.8e6); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!(await db.get('SELECT 1 FROM vendors WHERE id = ?', String(id)))) return fail(res, 404, 'Provider not found.');
      const r = await addPhoto(db, String(id), b); if (r.error) return fail(res, 422, r.error);
      await audit(db, s, 'photo_added', id); sendJson(res, 201, { ok: true, id: r.id, src: photoUrl(r.id) });
    },
    'DELETE /api/admin/vendors/:id/photos/:photo': async (req, res, _db, url, id, photo) => {
      const s = await guard(req, res, true); if (!s) return;
      const r = await db.run('DELETE FROM vendor_photos WHERE id = ? AND vendor_id = ?', String(photo), String(id)); if (!r.changes) return fail(res, 404, 'Photo not found.');
      await removeImage(String(photo)); await audit(db, s, 'photo_deleted', id); sendJson(res, 200, { ok: true });
    },
    'GET /api/admin/quotes': async (req, res, _db, url) => {
      if (!await guard(req, res)) return; const st = url.searchParams.get('status');
      const rows = await db.all(`SELECT q.*, v.name AS vendor_name, v.is_demo, v.owner_user_id IS NOT NULL AS has_owner, p.name AS package_name FROM quotes q JOIN vendors v ON v.id = q.vendor_id LEFT JOIN vendor_packages p ON p.id = q.package_id
        ${QUOTE_STATUSES.includes(st) ? 'WHERE q.status = ?' : ''} ORDER BY q.created_at DESC LIMIT 300`, ...(QUOTE_STATUSES.includes(st) ? [st] : []));
      sendJson(res, 200, { ok: true, quotes: rows.map(r => { delete r.ip_hash; return { ...r, is_demo: !!r.is_demo, has_owner: !!r.has_owner }; }), statuses: QUOTE_STATUSES });
    },
    'PATCH /api/admin/quotes/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 16e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const q = await db.get('SELECT * FROM quotes WHERE id = ?', String(id)); if (!q) return fail(res, 404, 'Not found.');
      const v = await db.get('SELECT * FROM vendors WHERE id = ?', q.vendor_id);
      const r = await updateQuote(db, q, b, req, v); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      await audit(db, s, 'quote_updated', q.ref, b.status || null); sendJson(res, 200, { ok: true });
    },
  };
}

// Reply to / update a quote request (partner or admin). The customer sees status, reply and amount — never partner notes.
async function updateQuote(db, q, b, req, v) {
  if (b.status !== undefined && !QUOTE_STATUSES.includes(b.status)) return { error: 'Invalid status.' };
  const reply = b.reply !== undefined ? clean(b.reply, 2000) : q.reply, amount = b.quotedAmount !== undefined ? int(b.quotedAmount) : q.quoted_amount;
  if (b.status === 'quoted' && amount == null) return { error: 'Enter the quoted amount.', fields: { quotedAmount: 'Required for “Quoted”.' } };
  const status = b.status || (reply && reply !== q.reply && q.status === 'new' ? 'replied' : q.status);
  await db.run('UPDATE quotes SET status = ?, reply = ?, quoted_amount = ?, partner_note = ?, updated_at = ? WHERE id = ?', status, reply, amount, b.partnerNote !== undefined ? clean(b.partnerNote, 1000) : q.partner_note, now(), q.id);
  if (q.email && (reply !== q.reply || status !== q.status) && ['replied', 'quoted'].includes(status)) {
    const lines = [`${v?.name || 'The provider'} replied to your request ${q.ref}.`, ...(amount != null && status === 'quoted' ? [`Quoted amount: $${amount.toLocaleString('en-US')}`] : []), reply || ''].filter(Boolean);
    sendEmail({ to: q.email, subject: `Reply to your request ${q.ref}`, text: lines.join('\n'), html: emailHtml('You have a reply', lines, q.user_id ? { url: baseUrl(req) + '/#/dashboard', label: 'Open MA3AK' } : null) }).catch(() => {});
  }
  return { ok: true };
}
