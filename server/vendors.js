// Providers: public directory, partner portal (profile, packages, photos, documents, availability),
// verification by MA3AK, and listing order. A listing is public only when status = 'approved', active = 1
// and the provider's consent is recorded. Verification (status 'approved' + verified) is decided by an
// administrator only; plans or paid placement never verify or publish a listing.
// Partners can only ever see and change their own listing.
import { config } from './config.js';
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { check, clean } from './validate.js';
import { decodeImage, decodeDocument } from './uploads.js';
import { putImage, sendImage, removeImage, putDocument, sendDocument, removeDocument } from './storage.js';
import { currentUser, requireUser, publicUser, startSession, issueToken } from './users.js';
import { rateLimit, clientIp, ipHash, originAllowed, hashPassword, passwordProblems } from './security.js';
import { audit } from './audit.js';
import { notify } from './notifications.js';
import { CURRENCIES, isCurrency, toMinor, toWhole } from './money.js';
import { CATEGORY_FIELDS, fieldsFor, cleanDetails, parseJson, getSetting, AREAS, EVENT_TYPES, UNITS, today, addDays, validDate } from './fields.js';
import { vendorPlan } from './billing.js';

export { AREAS, EVENT_TYPES, UNITS };
export const VENDOR_STATUSES = ['draft', 'submitted', 'under_review', 'needs_info', 'approved', 'rejected', 'suspended'];
export const DOC_KINDS = { id_document: 'Identity document of the owner or manager', business_registration: 'Business registration (commercial register)', ownership_proof: 'Proof of ownership or lease of the venue', authorization_letter: 'Letter authorising you to list this business', permit: 'Permit or licence', other: 'Other supporting document' };
const PRICE_TYPES = ['fixed', 'starting', 'quote'];
const PUBLIC = "v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL";
const MAX_DOCS = 12;

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
const lines = (v, n, max) => (Array.isArray(v) ? v : String(v || '').split('\n')).map(x => clean(x, max)).filter(Boolean).slice(0, n);
const sponsoredNow = v => !!v.sponsored && (!v.sponsored_until || v.sponsored_until >= today());

const pubPackage = p => ({ id: p.id, name: p.name, description: p.description, priceType: p.price_type, currency: p.currency, priceMinor: p.price_type === 'quote' ? null : p.price_minor, priceMaxMinor: p.price_type === 'starting' ? p.price_max_minor : null,
  price: p.price, priceMax: p.price_max, unit: p.unit, minQty: p.min_qty, includes: parseJson(p.includes, []), exclusions: parseJson(p.exclusions, []), conditions: p.conditions, details: parseJson(p.details, {}), active: !!p.active });
const photoUrl = id => `/api/photos/${id}`;
// Lowest public price, for cards. Never mixes currencies: the first currency with a priced package wins.
function startingFrom(packages) {
  const priced = packages.filter(p => p.price_type !== 'quote' && p.price_minor != null);
  if (!priced.length) return null;
  const cur = priced[0].currency, same = priced.filter(p => p.currency === cur);
  const flat = same.filter(p => p.unit === 'flat'), best = (flat.length ? flat : same).sort((a, b) => a.price_minor - b.price_minor)[0];
  return { minor: best.price_minor, currency: cur, unit: best.unit, priceType: best.price_type };
}
// The shape the website uses for a provider card / profile.
function toPublic(v, pk = [], ph = [], extra = {}) {
  const live = pk.filter(p => p.active), from = startingFrom(live), r = extra.rating || {};
  return {
    id: v.id, name: v.name, category: v.category, locations: v.locations.split(' ').filter(Boolean), eventTypes: v.event_types.split(' ').filter(Boolean), services: v.services ? v.services.split('|') : [],
    description: v.description, about: v.about, availabilityNote: v.availability_note, details: parseJson(v.details, {}),
    startingFrom: from, startingPrice: from && from.currency === 'USD' ? toWhole(from.minor) : null, startingUnit: from ? from.unit : 'flat',
    capacity: v.capacity_max ? { min: v.capacity_min || 0, max: v.capacity_max } : null,
    packages: live.map(pubPackage), photos: ph.map(p => ({ src: photoUrl(p.id), alt: p.alt || v.name })),
    phone: v.phone, whatsapp: v.whatsapp, instagram: v.instagram, website: v.website, email: v.email,
    verified: !!v.verified && v.status === 'approved' && !v.is_demo, featured: !!v.featured, homeRank: v.home_rank, sponsored: sponsoredNow(v), isDemo: !!v.is_demo, claimed: !!v.owner_user_id,
    rating: r.n ? Math.round(r.avg * 10) / 10 : null, reviewCount: r.n || 0, unavailableDates: extra.unavailable || [], joinedAt: (v.approved_at || v.consent_at || v.created_at).slice(0, 10),
  };
}
async function withChildren(db, vendors, { allPackages = false, publicExtras = false } = {}) {
  if (!vendors.length) return [];
  const ids = vendors.map(v => v.id), ph = ids.map(() => '?').join(',');
  const [pk, photos, ratings, unavailable] = await Promise.all([
    db.all(`SELECT * FROM vendor_packages WHERE vendor_id IN (${ph}) ${allPackages ? '' : 'AND active = 1'} ORDER BY sort, created_at`, ...ids),
    db.all(`SELECT id, vendor_id, alt, sort FROM vendor_photos WHERE vendor_id IN (${ph}) ORDER BY sort, created_at`, ...ids),
    db.all(`SELECT vendor_id, AVG(rating)::float AS avg, COUNT(*) AS n FROM reviews WHERE status = 'published' AND vendor_id IN (${ph}) GROUP BY vendor_id`, ...ids),
    publicExtras ? db.all(`SELECT vendor_id, day FROM vendor_availability WHERE vendor_id IN (${ph}) AND day >= ? AND day <= ? ORDER BY day`, ...ids, today(), addDays(today(), 400)) : []]);
  return vendors.map(v => ({ v, pk: pk.filter(p => p.vendor_id === v.id), ph: photos.filter(p => p.vendor_id === v.id),
    extra: { rating: ratings.find(r => r.vendor_id === v.id), unavailable: unavailable.filter(u => u.vendor_id === v.id).map(u => u.day) } }));
}
// How complete and trustworthy a listing looks. Used only for the automatic part of the order.
const quality = x => (x.ph.length >= 3 ? 2 : x.ph.length ? 1 : 0) + (x.pk.filter(p => p.active).length >= 2 ? 1 : 0) + (x.v.description.length >= 80 ? 1 : 0) + (x.v.about.length >= 200 ? 1 : 0)
  + (x.pk.some(p => p.active && p.price_type !== 'quote' && p.price_minor != null) ? 1 : 0) + (x.v.verified ? 2 : 0) + (x.extra.rating?.n ? x.extra.rating.avg / 2 : 0);
// Public order: real listings before samples, then (optionally) sponsored, then the admin's manual order, then the automatic rule.
export function orderListings(list, sort = {}) {
  const auto = sort.auto || 'quality';
  const autoKey = x => auto === 'rating' ? (x.extra.rating?.avg || 0) : auto === 'newest' ? Date.parse(x.v.approved_at || x.v.created_at) || 0 : auto === 'name' ? 0 : quality(x);
  return list.slice().sort((a, b) => (a.v.is_demo - b.v.is_demo)
    || (sort.sponsoredFirst ? (sponsoredNow(b.v) - sponsoredNow(a.v)) : 0)
    || ((a.v.sort_rank ?? 1e9) - (b.v.sort_rank ?? 1e9))
    || (autoKey(b) - autoKey(a))
    || a.v.name.localeCompare(b.v.name));
}
const privateVendor = (v, pk, ph, extra) => ({ ...toPublic(v, pk, ph, extra), packages: pk.map(pubPackage), photos: ph.map(p => ({ id: p.id, src: photoUrl(p.id), alt: p.alt, sort: p.sort })),
  status: v.status === 'pending' ? 'submitted' : v.status, active: !!v.active, consentAt: v.consent_at, consentNote: v.consent_note, reviewNote: v.review_note, submittedAt: v.submitted_at, approvedAt: v.approved_at,
  partnerUpdatedAt: v.partner_updated_at, changedSinceApproval: !!(v.approved_at && v.partner_updated_at && v.partner_updated_at > v.approved_at), priceFrom: v.price_from,
  capacityMin: v.capacity_min, capacityMax: v.capacity_max, isDemo: !!v.is_demo, verified: !!v.verified, verifiedAt: v.verified_at, suspendedReason: v.suspended_reason,
  legalName: v.legal_name, businessType: v.business_type, registrationNumber: v.registration_number, address: v.address, authorizationStatement: v.authorization_statement,
  termsVersion: v.terms_version, termsAcceptedAt: v.terms_accepted_at, sponsoredUntil: v.sponsored_until, sortRank: v.sort_rank, createdAt: v.created_at, updatedAt: v.updated_at });

// ---------- shared validation for profile, package and photo changes ----------
async function profileFrom(db, b, prev = {}) {
  const c = check(b, { name: { required: true, max: 120, msg: 'Enter the business name.' }, category: { required: true, max: 40, msg: 'Choose a category.' }, description: { max: 300 }, about: { max: 4000 },
    availabilityNote: { max: 300 }, phone: { type: 'phone', max: 30 }, whatsapp: { type: 'phone', max: 30 }, instagram: { max: 120 }, website: { type: 'url', max: 300 }, email: { type: 'email', max: 254 },
    legalName: { max: 160 }, businessType: { max: 60 }, registrationNumber: { max: 60 }, address: { max: 300 } });
  if (c.ok && !(await categoryIds(db)).includes(c.value.category)) c.fields.category = 'Choose a category from the list.';
  const category = c.value.category || prev.category, d = cleanDetails(category, 'vendor', b.details ?? parseJson(prev.details, {}));
  for (const [k, m] of Object.entries(d.errors)) c.fields[`details.${k}`] = m;
  if (Object.keys(c.fields).length) return { error: 'Please check the highlighted fields.', fields: c.fields };
  const v = c.value, capMin = int(b.capacityMin, 100000), capMax = int(b.capacityMax, 100000);
  if (capMin && capMax && capMin > capMax) return { error: 'Minimum capacity is above the maximum.', fields: { capacityMin: 'Check the numbers.' } };
  return { value: { name: v.name, category: v.category, description: v.description || '', about: v.about || '', availability_note: v.availabilityNote || '',
    locations: words(b.locations ?? prev.locations, AREAS).join(' '), event_types: words(b.eventTypes ?? prev.event_types, EVENT_TYPES).join(' '), services: services(b.services ?? prev.services).join('|'),
    price_from: int(b.priceFrom), capacity_min: capMin, capacity_max: capMax, phone: v.phone || null, whatsapp: v.whatsapp || null, instagram: handle(v.instagram) || null,
    website: v.website ? (/^https?:\/\//i.test(v.website) ? v.website : 'https://' + v.website) : null, email: v.email || null,
    legal_name: v.legalName ?? prev.legal_name ?? '', business_type: v.businessType ?? prev.business_type ?? '', registration_number: v.registrationNumber ?? prev.registration_number ?? '', address: v.address ?? prev.address ?? '',
    details: JSON.stringify(d.value) } };
}
// Packages: fixed price, "starting from" price, or "custom quote", always with a currency.
function packageFrom(b, category) {
  const c = check(b, { name: { required: true, max: 80, msg: 'Name the package.' }, description: { max: 500 }, unit: { oneOf: UNITS }, conditions: { max: 1000 } });
  const fields = { ...c.fields };
  const priceType = PRICE_TYPES.includes(b.priceType) ? b.priceType : (b.price === '' || b.price == null ? 'quote' : 'starting');
  const currency = isCurrency(b.currency) ? b.currency : 'USD';
  let price = null, max = null;
  if (priceType !== 'quote') {
    price = toMinor(b.price, currency);
    if (!Number.isInteger(price) || price <= 0) fields.price = `Enter the price in ${currency}${CURRENCIES[currency].digits ? ', e.g. 1500 or 1500.50' : ''}.`;
    if (priceType === 'starting' && b.priceMax !== '' && b.priceMax != null) { max = toMinor(b.priceMax, currency); if (!Number.isInteger(max) || (Number.isInteger(price) && max < price)) fields.priceMax = 'The “up to” price must be higher than the starting price.'; }
  }
  if (priceType === 'fixed' && clean(b.conditions, 1000).length < 10) fields.conditions = 'Describe what the fixed price covers and any limits (hours, guests, travel).';
  const d = cleanDetails(category, 'package', b.details); for (const [k, m] of Object.entries(d.errors)) fields[`details.${k}`] = m;
  if (Object.keys(fields).length) return { error: 'Please check the package.', fields };
  return { value: { name: c.value.name, description: c.value.description || '', price_type: priceType, currency, price_minor: price, price_max_minor: max,
    price: currency === 'USD' ? toWhole(price) : null, price_max: currency === 'USD' ? toWhole(max) : null, unit: c.value.unit || 'flat', min_qty: int(b.minQty, 100000),
    includes: JSON.stringify(lines(b.includes, 20, 120)), exclusions: JSON.stringify(lines(b.exclusions, 20, 120)), conditions: c.value.conditions || '', details: JSON.stringify(d.value),
    active: b.active === false ? 0 : 1, sort: int(b.sort, 1000) ?? 0 } };
}
const PKG_COLS = ['name', 'description', 'price_type', 'currency', 'price_minor', 'price_max_minor', 'price', 'price_max', 'unit', 'min_qty', 'includes', 'exclusions', 'conditions', 'details', 'active', 'sort'];
async function savePackage(db, vendorId, pid, p, maxPackages) {
  const t = now();
  if (pid === 'new') {
    if ((await db.get('SELECT COUNT(*) AS n FROM vendor_packages WHERE vendor_id = ?', vendorId)).n >= maxPackages) return { error: `Your plan allows up to ${maxPackages} packages.`, code: 'limit' };
    const id = uid();
    await db.run(`INSERT INTO vendor_packages (id, vendor_id, ${PKG_COLS.join(', ')}, created_at, updated_at) VALUES (?,?,${PKG_COLS.map(() => '?').join(',')},?,?)`, id, vendorId, ...PKG_COLS.map(k => p[k]), t, t);
    return { id };
  }
  const r = await db.run(`UPDATE vendor_packages SET ${PKG_COLS.map(k => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ? AND vendor_id = ?`, ...PKG_COLS.map(k => p[k]), t, String(pid), vendorId);
  return r.changes ? { id: pid } : { error: 'Package not found.', status: 404 };
}
async function addPhoto(db, vendorId, b, maxPhotos) {
  if ((await db.get('SELECT COUNT(*) AS n FROM vendor_photos WHERE vendor_id = ?', vendorId)).n >= maxPhotos) return { error: `Your plan allows up to ${maxPhotos} photos. Delete one first.`, code: 'limit' };
  const img = decodeImage(b.image); if (!img) return { error: 'Use a JPG or PNG photo under 4 MB.' };
  const saved = await putImage(img), sort = (await db.get('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM vendor_photos WHERE vendor_id = ?', vendorId)).n;
  await db.run('INSERT INTO vendor_photos (id, vendor_id, mime, size, alt, sort, created_at) VALUES (?,?,?,?,?,?,?)', saved.id, vendorId, saved.mime, saved.size, clean(b.alt, 160), sort, now());
  return { id: saved.id };
}
export async function deleteVendorFiles(db, vendorId) {
  for (const p of await db.all('SELECT id FROM vendor_photos WHERE vendor_id = ?', vendorId)) await removeImage(p.id);
  for (const d of await db.all('SELECT id, mime FROM vendor_documents WHERE vendor_id = ?', vendorId)) await removeDocument(d.id, d.mime);
}
async function addDocument(db, vendorId, b) {
  if (!DOC_KINDS[b.kind]) return { error: 'Choose what kind of document this is.', fields: { kind: 'Required.' } };
  if ((await db.get('SELECT COUNT(*) AS n FROM vendor_documents WHERE vendor_id = ?', vendorId)).n >= MAX_DOCS) return { error: `Up to ${MAX_DOCS} documents. Delete one first.` };
  const doc = decodeDocument(b.file); if (!doc) return { error: 'Use a PDF, JPG or PNG under 4 MB.' };
  const saved = await putDocument(doc), id = saved.id;
  await db.run('INSERT INTO vendor_documents (id, vendor_id, kind, mime, size, original_name, note, uploaded_at) VALUES (?,?,?,?,?,?,?,?)', id, vendorId, b.kind, saved.mime, saved.size, clean(b.name, 120).replace(/[^\w .-]+/g, '_'), clean(b.note, 300), now());
  return { id };
}
const docView = d => ({ id: d.id, kind: d.kind, kindLabel: DOC_KINDS[d.kind], mime: d.mime, size: d.size, name: d.original_name, note: d.note, status: d.status, uploadedAt: d.uploaded_at, reviewedAt: d.reviewed_at });
const slug = s => clean(s, 60).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'provider';
async function body(req, res, size = 64e3) { if (!originAllowed(req)) { fail(res, 403, 'Request blocked.'); return null; } try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }
const partnerTouched = (db, v) => db.run('UPDATE vendors SET partner_updated_at = ?, updated_at = ? WHERE id = ?', now(), now(), v.id);

// What still blocks submission, and automatic warnings for the reviewer. Warnings are hints, never proof.
async function verificationState(db, v) {
  const [docs, pk, photos, termsVersion] = await Promise.all([db.all('SELECT kind, status FROM vendor_documents WHERE vendor_id = ?', v.id), db.get('SELECT COUNT(*) AS n FROM vendor_packages WHERE vendor_id = ? AND active = 1', v.id),
    db.get('SELECT COUNT(*) AS n FROM vendor_photos WHERE vendor_id = ?', v.id), getSetting(db, 'vendorTerms', {}).then(t => t.version || null)]);
  const has = k => docs.some(d => d.kind === k && d.status !== 'rejected');
  const missing = [];
  if (v.description.length < 20) missing.push({ key: 'description', label: 'A short description (20+ characters)' });
  if (!v.locations) missing.push({ key: 'locations', label: 'The areas you serve' });
  if (!v.phone && !v.email) missing.push({ key: 'contact', label: 'A business phone number or email' });
  if (!v.legal_name) missing.push({ key: 'legalName', label: 'The legal or registered name of the business' });
  if (!v.address) missing.push({ key: 'address', label: 'The business address' });
  if (!pk.n) missing.push({ key: 'packages', label: 'At least one package or service' });
  if (!has('id_document')) missing.push({ key: 'id_document', label: 'An identity document of the owner or manager' });
  if (!['business_registration', 'ownership_proof', 'authorization_letter'].some(has)) missing.push({ key: 'business_doc', label: 'Business registration, proof of ownership, or an authorisation letter' });
  if (termsVersion && v.terms_version !== termsVersion) missing.push({ key: 'terms', label: 'Accept the partner terms (Plan & fees)' });
  const flags = [];
  if (v.category === 'venue' && !has('ownership_proof') && !has('authorization_letter')) flags.push('Venue without proof of ownership or an authorisation letter');
  if (v.phone && (await db.get('SELECT 1 FROM vendors WHERE phone = ? AND id <> ? LIMIT 1', v.phone, v.id))) flags.push('Phone number also used by another listing');
  if (v.email && (await db.get('SELECT 1 FROM vendors WHERE lower(email) = lower(?) AND id <> ? LIMIT 1', v.email, v.id))) flags.push('Email also used by another listing');
  if (photos.n < 3) flags.push('Fewer than 3 photos');
  if (v.description.length < 60) flags.push('Very short description');
  return { missing, flags, documents: docs.length };
}

export function vendorRoutes(db, guard, partner) {
  const planOf = async v => (await vendorPlan(db, v.id)).entitlements;
  const tellOwner = async (v, title, text, key) => { if (v.owner_user_id) await notify(db, v.owner_user_id, { kind: 'verification', title, body: text, link: '#/partner', dedupe: key }); };
  return {
    // ---------------- public directory ----------------
    'GET /api/vendors': async (req, res) => {
      const [rows, sort] = await Promise.all([db.all(`SELECT v.* FROM vendors v WHERE ${PUBLIC}`), getSetting(db, 'listingSort', { sponsoredFirst: false, auto: 'quality' })]);
      const list = orderListings(await withChildren(db, rows, { publicExtras: true }), sort);
      sendJson(res, 200, { ok: true, vendors: list.map(x => toPublic(x.v, x.pk, x.ph, x.extra)) });
    },
    'GET /api/vendors/:id': async (req, res, _db, url, id) => {
      const v = await db.get(`SELECT v.* FROM vendors v WHERE v.id = ? AND ${PUBLIC}`, String(id)); if (!v) return fail(res, 404, 'This provider isn’t listed.');
      const [x] = await withChildren(db, [v], { publicExtras: true });
      if ((await rateLimit(`view:${v.id}:${ipHash(clientIp(req))}`, 1, 3600e3)).ok) await db.run('UPDATE vendors SET views = views + 1 WHERE id = ?', v.id);
      sendJson(res, 200, { ok: true, vendor: toPublic(x.v, x.pk, x.ph, x.extra) });
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
      const p = await partner(req, res); if (!p) return;
      const [[x], docs, plan, ver, counts] = await Promise.all([withChildren(db, [p.v], { allPackages: true }), db.all('SELECT * FROM vendor_documents WHERE vendor_id = ? ORDER BY uploaded_at DESC', p.v.id), vendorPlan(db, p.v.id), verificationState(db, p.v),
        db.all('SELECT status, COUNT(*) AS n FROM bookings WHERE vendor_id = ? GROUP BY status', p.v.id)]);
      sendJson(res, 200, { ok: true, user: publicUser(p.u), vendor: privateVendor(x.v, x.pk, x.ph, x.extra), documents: docs.map(docView), docKinds: DOC_KINDS, plan, verification: { missing: ver.missing },
        bookingCounts: Object.fromEntries(counts.map(c => [c.status, c.n])), areas: AREAS, eventTypes: EVENT_TYPES, units: UNITS, priceTypes: PRICE_TYPES, currencies: Object.keys(CURRENCIES), fields: CATEGORY_FIELDS[p.v.category] || {} });
    },
    'PUT /api/partner/profile': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return; const b = await body(req, res); if (!b) return;
      if (b.category && b.category !== p.v.category && ['approved', 'under_review', 'submitted'].includes(p.v.status)) return fail(res, 422, 'Ask MA3AK to change the category of a listing that is under review or approved.', { fields: { category: 'Locked.' } });
      const r = await profileFrom(db, b, p.v); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const v = r.value, t = now();
      await db.run(`UPDATE vendors SET name=?, category=?, description=?, about=?, availability_note=?, locations=?, event_types=?, services=?, price_from=?, capacity_min=?, capacity_max=?, phone=?, whatsapp=?, instagram=?, website=?, email=?,
        legal_name=?, business_type=?, registration_number=?, address=?, details=?, partner_updated_at=?, updated_at=? WHERE id = ?`,
        v.name, v.category, v.description, v.about, v.availability_note, v.locations, v.event_types, v.services, v.price_from, v.capacity_min, v.capacity_max, v.phone, v.whatsapp, v.instagram, v.website, v.email,
        v.legal_name, v.business_type, v.registration_number, v.address, v.details, t, t, p.v.id);
      await audit(db, { actor: `partner:${p.u.email}` }, 'partner_profile_updated', p.v.id);
      sendJson(res, 200, { ok: true });
    },
    // Ask MA3AK to verify and publish the listing. The same rules apply on every plan.
    'POST /api/partner/submit': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return; const b = await body(req, res, 4096); if (!b) return;
      if (b.consent !== true) return fail(res, 422, 'Please confirm that MA3AK may publish your listing.', { fields: { consent: 'Required.' } });
      if (b.authorized !== true) return fail(res, 422, 'Please confirm that you own this business or are authorised to list it.', { fields: { authorized: 'Required.' } });
      const v = p.v;
      if (['approved', 'submitted', 'under_review', 'pending'].includes(v.status)) return sendJson(res, 200, { ok: true, listingStatus: v.status === 'pending' ? 'submitted' : v.status });
      if (v.status === 'suspended') return fail(res, 409, 'Your listing is suspended. Contact MA3AK.');
      const st = await verificationState(db, v);
      if (st.missing.length) return fail(res, 422, `Before submitting, add: ${st.missing.map(m => m.label.toLowerCase()).join('; ')}.`, { code: 'incomplete', missing: st.missing });
      const t = now(), statement = `${p.u.name} <${p.u.email}> confirmed on ${t.slice(0, 10)} that they own ${v.name} or are authorised to list it.`;
      await db.run("UPDATE vendors SET status = 'submitted', consent_at = COALESCE(consent_at, ?), consent_note = ?, authorization_statement = ?, risk_flags = ?, submitted_at = ?, updated_at = ? WHERE id = ?",
        t, 'Agreed by the provider in the partner portal', statement, st.flags.join('; '), t, t, v.id);
      await audit(db, { actor: `partner:${p.u.email}` }, 'partner_submitted', v.id);
      if (config.notifyEmail) { const { notifyVendor } = await import('./notifications.js'); await notifyVendor(db, { name: v.name }, { title: `Provider waiting for verification: ${v.name}`, body: `${v.name} (${v.category}) submitted their listing.` }).catch(() => {}); }
      sendJson(res, 200, { ok: true, listingStatus: 'submitted' });
    },
    'PUT /api/partner/packages/:pid': async (req, res, _db, url, pid) => {
      const p = await partner(req, res, true); if (!p) return; const b = await body(req, res, 16e3); if (!b) return;
      const r = packageFrom(b, p.v.category); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const s = await savePackage(db, p.v.id, pid, r.value, (await planOf(p.v)).maxPackages); if (s.error) return fail(res, s.status || 422, s.error, { code: s.code });
      await partnerTouched(db, p.v); sendJson(res, 200, { ok: true, id: s.id });
    },
    'DELETE /api/partner/packages/:pid': async (req, res, _db, url, pid) => {
      const p = await partner(req, res, true); if (!p) return;
      const r = await db.run('DELETE FROM vendor_packages WHERE id = ? AND vendor_id = ?', String(pid), p.v.id); if (!r.changes) return fail(res, 404, 'Package not found.');
      await partnerTouched(db, p.v); sendJson(res, 200, { ok: true });
    },
    'POST /api/partner/photos': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return;
      if (!(await rateLimit(`photo:${p.u.id}`, 40, 3600e3)).ok) return fail(res, 429, 'Too many uploads. Please wait a little.');
      const b = await body(req, res, 5.8e6); if (!b) return;
      const r = await addPhoto(db, p.v.id, b, (await planOf(p.v)).maxPhotos); if (r.error) return fail(res, 422, r.error, { code: r.code });
      await partnerTouched(db, p.v); sendJson(res, 201, { ok: true, id: r.id, src: photoUrl(r.id) });
    },
    'PATCH /api/partner/photos/:id': async (req, res, _db, url, id) => {
      const p = await partner(req, res, true); if (!p) return; const b = await body(req, res, 4096); if (!b) return;
      const r = await db.run('UPDATE vendor_photos SET alt = COALESCE(?, alt), sort = COALESCE(?, sort) WHERE id = ? AND vendor_id = ?', b.alt != null ? clean(b.alt, 160) : null, int(b.sort, 1000), String(id), p.v.id);
      if (!r.changes) return fail(res, 404, 'Photo not found.'); sendJson(res, 200, { ok: true });
    },
    'DELETE /api/partner/photos/:id': async (req, res, _db, url, id) => {
      const p = await partner(req, res, true); if (!p) return;
      const r = await db.run('DELETE FROM vendor_photos WHERE id = ? AND vendor_id = ?', String(id), p.v.id); if (!r.changes) return fail(res, 404, 'Photo not found.');
      await removeImage(String(id)); await partnerTouched(db, p.v); sendJson(res, 200, { ok: true });
    },
    // Verification documents: private. Only the provider and MA3AK administrators can open them.
    'POST /api/partner/documents': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return;
      if (!(await rateLimit(`doc:${p.u.id}`, 20, 3600e3)).ok) return fail(res, 429, 'Too many uploads. Please wait a little.');
      const b = await body(req, res, 5.8e6); if (!b) return;
      const r = await addDocument(db, p.v.id, b); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      await audit(db, { actor: `partner:${p.u.email}` }, 'document_uploaded', p.v.id, b.kind);
      sendJson(res, 201, { ok: true, id: r.id });
    },
    'GET /api/partner/documents/:id': async (req, res, _db, url, id) => {
      const p = await partner(req, res); if (!p) return;
      const d = await db.get('SELECT * FROM vendor_documents WHERE id = ? AND vendor_id = ?', String(id), p.v.id); if (!d) return fail(res, 404, 'Not found.');
      return sendDocument(res, d.id, d.mime, d.original_name || d.kind);
    },
    'DELETE /api/partner/documents/:id': async (req, res, _db, url, id) => {
      const p = await partner(req, res, true); if (!p) return;
      const d = await db.get('SELECT * FROM vendor_documents WHERE id = ? AND vendor_id = ?', String(id), p.v.id); if (!d) return fail(res, 404, 'Not found.');
      if (d.status === 'accepted' && ['approved', 'under_review'].includes(p.v.status)) return fail(res, 409, 'This document was used to verify your listing. Contact MA3AK to replace it.');
      await db.run('DELETE FROM vendor_documents WHERE id = ?', d.id); await removeDocument(d.id, d.mime);
      await audit(db, { actor: `partner:${p.u.email}` }, 'document_deleted', p.v.id, d.kind); sendJson(res, 200, { ok: true });
    },
    // Availability: the provider marks dates they can't take. Free dates are never promised to customers.
    'GET /api/partner/availability': async (req, res) => {
      const p = await partner(req, res); if (!p) return;
      sendJson(res, 200, { ok: true, ...(await availabilityFor(db, p.v.id)) });
    },
    'PUT /api/partner/availability': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return; const b = await body(req, res, 32e3); if (!b) return;
      const r = await setAvailability(db, p.v.id, b); if (r.error) return fail(res, 422, r.error);
      await partnerTouched(db, p.v); sendJson(res, 200, { ok: true, ...(await availabilityFor(db, p.v.id)) });
    },
    // Ma3ak Pro: performance of the listing. Every number is counted from the database.
    'GET /api/partner/analytics': async (req, res) => {
      const p = await partner(req, res); if (!p) return;
      if (!(await planOf(p.v)).analytics) return fail(res, 403, 'Detailed analytics are part of Ma3ak Pro.', { code: 'pro_required' });
      sendJson(res, 200, { ok: true, analytics: await analyticsFor(db, p.v) });
    },

    // ---------------- admin ----------------
    'GET /api/admin/vendors': async (req, res, _db, url) => {
      if (!await guard(req, res)) return;
      const st = url.searchParams.get('status'), q = clean(url.searchParams.get('q'), 80), cat = clean(url.searchParams.get('category'), 40), where = [], args = [];
      if (VENDOR_STATUSES.includes(st)) { where.push(st === 'submitted' ? "v.status IN ('submitted','pending')" : 'v.status = ?'); if (st !== 'submitted') args.push(st); }
      if (st === 'demo') where.push('v.is_demo = 1');
      if (st === 'public') where.push(PUBLIC);
      if (cat) { where.push('v.category = ?'); args.push(cat); }
      if (q) { where.push('(v.name ILIKE ? OR v.id ILIKE ? OR u.email ILIKE ?)'); const l = `%${q.replace(/[%_\\]/g, m => '\\' + m)}%`; args.push(l, l, l); }
      const rows = await db.all(`SELECT v.*, u.email AS owner_email, u.name AS owner_name,
          (SELECT COUNT(*) FROM vendor_packages p WHERE p.vendor_id = v.id) AS packages, (SELECT COUNT(*) FROM vendor_photos f WHERE f.vendor_id = v.id) AS photos,
          (SELECT COUNT(*) FROM vendor_documents d WHERE d.vendor_id = v.id) AS documents,
          (SELECT COUNT(*) FROM bookings b WHERE b.vendor_id = v.id AND b.status IN ('quote_requested','revision_requested','awaiting_vendor')) AS open_requests,
          (SELECT s.plan_id FROM vendor_subscriptions s WHERE s.vendor_id = v.id AND s.status IN ('active','comped') AND (s.current_period_end IS NULL OR s.current_period_end >= ?) ORDER BY s.created_at DESC LIMIT 1) AS plan_id,
          (SELECT COUNT(*) FROM vendor_subscriptions s WHERE s.vendor_id = v.id AND s.status = 'requested') AS plan_requests
        FROM vendors v LEFT JOIN users u ON u.id = v.owner_user_id ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY CASE v.status WHEN 'submitted' THEN 0 WHEN 'pending' THEN 0 WHEN 'under_review' THEN 1 WHEN 'needs_info' THEN 2 WHEN 'draft' THEN 3 WHEN 'approved' THEN 4 ELSE 5 END, v.updated_at DESC LIMIT 500`, today(), ...args);
      sendJson(res, 200, { ok: true, vendors: rows.map(v => ({ id: v.id, name: v.name, category: v.category, status: v.status === 'pending' ? 'submitted' : v.status, active: !!v.active, verified: !!v.verified, featured: !!v.featured, sponsored: sponsoredNow(v), isDemo: !!v.is_demo,
        consent: !!v.consent_at, owner: v.owner_email ? { email: v.owner_email, name: v.owner_name } : null, packages: v.packages, photos: v.photos, documents: v.documents, openRequests: v.open_requests, plan: v.plan_id || 'free', planRequests: v.plan_requests,
        riskFlags: v.risk_flags ? v.risk_flags.split('; ') : [], public: v.status === 'approved' && !!v.active && !!v.consent_at, changedSinceApproval: !!(v.approved_at && v.partner_updated_at && v.partner_updated_at > v.approved_at), submittedAt: v.submitted_at, updatedAt: v.updated_at })),
        categories: await categoryIds(db), statuses: VENDOR_STATUSES, areas: AREAS, eventTypes: EVENT_TYPES, units: UNITS, priceTypes: PRICE_TYPES, currencies: Object.keys(CURRENCIES), docKinds: DOC_KINDS });
    },
    'GET /api/admin/vendors/:id': async (req, res, _db, url, id) => {
      if (!await guard(req, res)) return;
      const v = await db.get('SELECT * FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Not found.');
      const [[x], owner, docs, ver, plan] = await Promise.all([withChildren(db, [v], { allPackages: true }), v.owner_user_id ? db.get('SELECT id, email, name, phone, email_verified, created_at FROM users WHERE id = ?', v.owner_user_id) : null,
        db.all('SELECT * FROM vendor_documents WHERE vendor_id = ? ORDER BY uploaded_at DESC', v.id), verificationState(db, v), vendorPlan(db, v.id)]);
      sendJson(res, 200, { ok: true, vendor: privateVendor(x.v, x.pk, x.ph, x.extra), owner, documents: docs.map(docView), verification: { missing: ver.missing, flags: ver.flags }, plan, fields: CATEGORY_FIELDS[v.category] || {} });
    },
    // Create or edit a listing (MA3AK-managed providers, or corrections to a partner's listing).
    // Verification is never set here: it needs the review checklist (POST …/review, action "approve").
    'PUT /api/admin/vendors/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 64e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!/^[a-z0-9-]{2,60}$/.test(id)) return fail(res, 422, 'The ID can use lowercase letters, numbers and dashes.', { fields: { id: 'Invalid.' } });
      const prev = await db.get('SELECT * FROM vendors WHERE id = ?', id), r = await profileFrom(db, b, prev || {}); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const v = r.value, t = now(), consentAt = b.consent ? (prev?.consent_at || t) : null;
      if (b.active && !consentAt) return fail(res, 422, 'Record the provider’s agreement to be listed before publishing.', { fields: { consent: 'Required to publish.' } });
      if (b.active && prev && prev.status !== 'approved') return fail(res, 422, 'Verify the listing first (Review → Approve), then publish it.');
      const isDemo = b.isDemo ? 1 : 0, status = prev ? prev.status : (b.active ? 'approved' : 'draft');
      await db.run(`INSERT INTO vendors (id, name, category, description, about, availability_note, locations, event_types, services, price_from, capacity_min, capacity_max, phone, whatsapp, instagram, website, email,
          legal_name, business_type, registration_number, address, details, consent_at, consent_note, status, active, featured, verified, is_demo, approved_at, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, description=EXCLUDED.description, about=EXCLUDED.about, availability_note=EXCLUDED.availability_note, locations=EXCLUDED.locations, event_types=EXCLUDED.event_types, services=EXCLUDED.services,
          price_from=EXCLUDED.price_from, capacity_min=EXCLUDED.capacity_min, capacity_max=EXCLUDED.capacity_max, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, instagram=EXCLUDED.instagram, website=EXCLUDED.website, email=EXCLUDED.email,
          legal_name=EXCLUDED.legal_name, business_type=EXCLUDED.business_type, registration_number=EXCLUDED.registration_number, address=EXCLUDED.address, details=EXCLUDED.details,
          consent_at=EXCLUDED.consent_at, consent_note=EXCLUDED.consent_note, active=EXCLUDED.active, is_demo=EXCLUDED.is_demo, verified=CASE WHEN EXCLUDED.is_demo = 1 THEN 0 ELSE vendors.verified END, updated_at=EXCLUDED.updated_at`,
        id, v.name, v.category, v.description, v.about, v.availability_note, v.locations, v.event_types, v.services, v.price_from, v.capacity_min, v.capacity_max, v.phone, v.whatsapp, v.instagram, v.website, v.email,
        v.legal_name, v.business_type, v.registration_number, v.address, v.details, consentAt, clean(b.consentNote, 300), status, b.active && status === 'approved' ? 1 : 0, prev?.featured || 0, 0, isDemo, !prev && b.active ? t : prev?.approved_at || null, prev?.created_at || t, t);
      await audit(db, s, prev ? 'vendor_updated' : 'vendor_created', id); sendJson(res, 200, { ok: true });
    },
    // Verification and visibility. Nothing is published or verified automatically.
    'POST /api/admin/vendors/:id/review': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 8192); } catch (e) { return fail(res, e.status || 400, e.message); }
      const v = await db.get('SELECT * FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Not found.');
      const note = clean(b.note, 1000), t = now(), st = v.status === 'pending' ? 'submitted' : v.status;
      const need = (cond, msg) => { if (!cond) { fail(res, 422, msg); return false; } return true; };
      const set = async (sql, ...a) => db.run(`UPDATE vendors SET ${sql}, updated_at = ? WHERE id = ?`, ...a, t, v.id);
      switch (b.action) {
        case 'start_review': if (!need(['submitted', 'needs_info'].includes(st), 'Only submitted listings can be put under review.')) return; await set("status = 'under_review'"); break;
        case 'request_info':
          if (!need(['submitted', 'under_review'].includes(st), 'Only listings waiting for review can be sent back.')) return; if (!need(note.length >= 5, 'Tell the provider what is missing.')) return;
          await set("status = 'needs_info', review_note = ?", note); await tellOwner(v, 'MA3AK needs more information', note, `ver:${v.id}:${t}`); break;
        case 'approve': case 'verify': {
          if (!need(!(b.action === 'verify' && v.is_demo), 'Demo listings can’t be verified.')) return;
          if (!need(!!v.consent_at, 'The provider hasn’t agreed to be listed yet. Ask them to submit from their partner page, or record their consent in the listing.')) return;
          if (!need(['submitted', 'under_review', 'needs_info', 'approved'].includes(st) || !v.owner_user_id, 'This listing hasn’t been submitted for verification.')) return;
          const c = b.checks || {}; if (!need(c.identity === true && c.business === true && c.authority === true && c.listing === true, 'Tick every item of the checklist after checking the documents.')) return;
          await set("status = 'approved', active = 1, verified = ?, verified_at = ?, verified_by = ?, approved_at = COALESCE(approved_at, ?), review_note = ?, suspended_reason = ''", v.is_demo ? 0 : 1, t, s.admin_id, t, note);
          await tellOwner(v, 'Your listing is verified and live', note || `${v.name} is now listed on Ma3ak.`, `ver:${v.id}:${t}`); break;
        }
        case 'reject':
          if (!need(note.length >= 5, 'Give the provider a reason.')) return;
          await set("status = 'rejected', active = 0, verified = 0, review_note = ?", note); await tellOwner(v, 'Your listing wasn’t approved', note, `ver:${v.id}:${t}`); break;
        case 'suspend':
          if (!need(note.length >= 5, 'Give a reason for the suspension.')) return;
          await set("status = 'suspended', active = 0, suspended_reason = ?", note); await tellOwner(v, 'Your listing is suspended', note, `ver:${v.id}:${t}`); break;
        case 'reinstate':
          if (!need(st === 'suspended', 'Only suspended listings can be reinstated.')) return;
          await set("status = 'approved', active = 1, suspended_reason = ''"); await tellOwner(v, 'Your listing is live again', note || '', `ver:${v.id}:${t}`); break;
        case 'unverify': await set('verified = 0'); break;
        case 'unpublish': await set("active = 0, review_note = COALESCE(NULLIF(?, ''), review_note)", note); break;
        case 'publish': if (!need(st === 'approved' && !!v.consent_at, 'Approve the listing first.')) return; await set('active = 1, approved_at = COALESCE(approved_at, ?)', t); break;
        case 'feature': await set('featured = 1, home_rank = COALESCE(home_rank, (SELECT COALESCE(MAX(home_rank), 0) + 1 FROM vendors))'); break;
        case 'unfeature': await set('featured = 0, home_rank = NULL'); break;
        case 'sponsor': {
          const until = String(b.until || ''); if (!need(validDate(until) && until >= today(), 'Choose the last day of the paid placement.')) return;
          await set('sponsored = 1, sponsored_until = ?', until); break;
        }
        case 'unsponsor': await set('sponsored = 0, sponsored_until = NULL'); break;
        default: return fail(res, 422, 'Unknown action.');
      }
      await audit(db, s, `vendor_${b.action}`, v.id, [note, b.action === 'approve' || b.action === 'verify' ? `checks: ${JSON.stringify(b.checks)}` : '', b.until || ''].filter(Boolean).join(' · ') || null);
      sendJson(res, 200, { ok: true });
    },
    'DELETE /api/admin/vendors/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return;
      const v = await db.get('SELECT id, owner_user_id FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Not found.');
      if (await db.get("SELECT 1 FROM bookings WHERE vendor_id = ? AND status IN ('awaiting_payment','confirmed','in_progress','cancellation_requested')", v.id)) return fail(res, 409, 'This provider has active bookings. Resolve them first, or suspend the listing instead.');
      await deleteVendorFiles(db, v.id); await db.run('DELETE FROM vendors WHERE id = ?', v.id);
      if (v.owner_user_id) await db.run("UPDATE users SET role = 'customer' WHERE id = ?", v.owner_user_id);
      await audit(db, s, 'vendor_deleted', v.id); sendJson(res, 200, { ok: true });
    },
    'PUT /api/admin/vendors/:id/packages/:pid': async (req, res, _db, url, id, pid) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 16e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const v = await db.get('SELECT id, category FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Provider not found.');
      const r = packageFrom(b, v.category); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const out = await savePackage(db, v.id, pid, r.value, 40); if (out.error) return fail(res, out.status || 422, out.error);
      await audit(db, s, 'package_saved', `${id}/${out.id}`, `${r.value.name}: ${r.value.price_type} ${r.value.price_minor ?? ''} ${r.value.currency} ${r.value.unit}`); sendJson(res, 200, { ok: true, id: out.id });
    },
    'DELETE /api/admin/vendors/:id/packages/:pid': async (req, res, _db, url, id, pid) => {
      const s = await guard(req, res, true); if (!s) return;
      const r = await db.run('DELETE FROM vendor_packages WHERE id = ? AND vendor_id = ?', String(pid), String(id)); if (!r.changes) return fail(res, 404, 'Package not found.');
      await audit(db, s, 'package_deleted', `${id}/${pid}`); sendJson(res, 200, { ok: true });
    },
    'POST /api/admin/vendors/:id/photos': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 5.8e6); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!(await db.get('SELECT 1 FROM vendors WHERE id = ?', String(id)))) return fail(res, 404, 'Provider not found.');
      const r = await addPhoto(db, String(id), b, 40); if (r.error) return fail(res, 422, r.error);
      await audit(db, s, 'photo_added', id); sendJson(res, 201, { ok: true, id: r.id, src: photoUrl(r.id) });
    },
    'DELETE /api/admin/vendors/:id/photos/:photo': async (req, res, _db, url, id, photo) => {
      const s = await guard(req, res, true); if (!s) return;
      const r = await db.run('DELETE FROM vendor_photos WHERE id = ? AND vendor_id = ?', String(photo), String(id)); if (!r.changes) return fail(res, 404, 'Photo not found.');
      await removeImage(String(photo)); await audit(db, s, 'photo_deleted', id); sendJson(res, 200, { ok: true });
    },
    // Opening a verification document is recorded in the activity log.
    'GET /api/admin/vendors/:id/documents/:doc': async (req, res, _db, url, id, doc) => {
      const s = await guard(req, res); if (!s) return;
      const d = await db.get('SELECT * FROM vendor_documents WHERE id = ? AND vendor_id = ?', String(doc), String(id)); if (!d) return fail(res, 404, 'Not found.');
      await audit(db, s, 'document_viewed', `${id}/${d.kind}`);
      return sendDocument(res, d.id, d.mime, d.original_name || d.kind);
    },
    'POST /api/admin/vendors/:id/documents/:doc': async (req, res, _db, url, id, doc) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!['accepted', 'rejected', 'submitted'].includes(b.status)) return fail(res, 422, 'Choose accepted or rejected.');
      const r = await db.run('UPDATE vendor_documents SET status = ?, note = CASE WHEN ? <> \'\' THEN ? ELSE note END, reviewed_at = ?, reviewed_by = ? WHERE id = ? AND vendor_id = ?', b.status, clean(b.note, 300), clean(b.note, 300), now(), s.admin_id, String(doc), String(id));
      if (!r.changes) return fail(res, 404, 'Not found.'); await audit(db, s, `document_${b.status}`, `${id}/${doc}`); sendJson(res, 200, { ok: true });
    },
    'DELETE /api/admin/vendors/:id/documents/:doc': async (req, res, _db, url, id, doc) => {
      const s = await guard(req, res, true); if (!s) return;
      const d = await db.get('SELECT * FROM vendor_documents WHERE id = ? AND vendor_id = ?', String(doc), String(id)); if (!d) return fail(res, 404, 'Not found.');
      await db.run('DELETE FROM vendor_documents WHERE id = ?', d.id); await removeDocument(d.id, d.mime); await audit(db, s, 'document_deleted', `${id}/${d.kind}`); sendJson(res, 200, { ok: true });
    },
    'GET /api/admin/vendors/:id/availability': async (req, res, _db, url, id) => { if (!await guard(req, res)) return; sendJson(res, 200, { ok: true, ...(await availabilityFor(db, String(id))) }); },
    'PUT /api/admin/vendors/:id/availability': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 32e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!(await db.get('SELECT 1 FROM vendors WHERE id = ?', String(id)))) return fail(res, 404, 'Provider not found.');
      const r = await setAvailability(db, String(id), b); if (r.error) return fail(res, 422, r.error);
      await audit(db, s, 'availability_updated', id); sendJson(res, 200, { ok: true, ...(await availabilityFor(db, String(id))) });
    },

    // ---------- listing order (drag and drop in the admin) ----------
    'GET /api/admin/order': async (req, res, _db, url) => {
      if (!await guard(req, res)) return;
      const cat = clean(url.searchParams.get('category'), 40), sort = await getSetting(db, 'listingSort', { sponsoredFirst: false, auto: 'quality' });
      const rows = await db.all(`SELECT v.* FROM vendors v WHERE ${PUBLIC}${cat ? ' AND v.category = ?' : ''}`, ...(cat ? [cat] : []));
      const list = orderListings(await withChildren(db, rows), sort);
      const home = (await db.all(`SELECT v.id, v.name, v.category, v.home_rank, v.is_demo FROM vendors v WHERE ${PUBLIC} AND v.featured = 1 ORDER BY v.home_rank NULLS LAST, v.name`));
      sendJson(res, 200, { ok: true, sort, listings: list.map(x => ({ id: x.v.id, name: x.v.name, category: x.v.category, rank: x.v.sort_rank, sponsored: sponsoredNow(x.v), featured: !!x.v.featured, isDemo: !!x.v.is_demo, verified: !!x.v.verified, quality: Math.round(quality(x) * 10) / 10 })),
        home, categories: await db.all('SELECT id, name, sort, active FROM categories ORDER BY sort, name') });
    },
    'PUT /api/admin/order/category/:cat': async (req, res, _db, url, cat) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 64e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const ids = (Array.isArray(b.ids) ? b.ids : []).map(x => clean(x, 80)).slice(0, 500);
      await db.tx(async (db) => {
        await db.run('UPDATE vendors SET sort_rank = NULL WHERE category = ?', String(cat));
        for (let i = 0; i < ids.length; i++) await db.run('UPDATE vendors SET sort_rank = ? WHERE id = ? AND category = ?', i + 1, ids[i], String(cat));
      });
      await audit(db, s, 'listing_order_saved', cat, ids.slice(0, 20).join(', ')); sendJson(res, 200, { ok: true });
    },
    'PUT /api/admin/order/home': async (req, res) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 64e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const ids = (Array.isArray(b.ids) ? b.ids : []).map(x => clean(x, 80)).slice(0, 60);
      await db.tx(async (db) => {
        await db.run('UPDATE vendors SET featured = 0, home_rank = NULL WHERE featured = 1 OR home_rank IS NOT NULL');
        for (let i = 0; i < ids.length; i++) await db.run('UPDATE vendors SET featured = 1, home_rank = ? WHERE id = ?', i + 1, ids[i]);
      });
      await audit(db, s, 'home_featured_saved', null, ids.join(', ')); sendJson(res, 200, { ok: true });
    },
    'PUT /api/admin/order/categories': async (req, res) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 16e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const ids = (Array.isArray(b.ids) ? b.ids : []).map(x => clean(x, 40)).slice(0, 100);
      await db.tx(async (db) => { for (let i = 0; i < ids.length; i++) await db.run('UPDATE categories SET sort = ?, updated_at = ? WHERE id = ?', (i + 1) * 10, now(), ids[i]); });
      clearCategoryCache(); await audit(db, s, 'category_order_saved', null, ids.join(', ')); sendJson(res, 200, { ok: true });
    },
  };
}

async function availabilityFor(db, vendorId) {
  const from = today(), to = addDays(from, 550);
  const [days, bookings] = await Promise.all([db.all('SELECT day, status, note, booking_id FROM vendor_availability WHERE vendor_id = ? AND day >= ? AND day <= ? ORDER BY day', vendorId, from, to),
    db.all("SELECT id, ref, event_date, status FROM bookings WHERE vendor_id = ? AND event_date >= ? AND status IN ('awaiting_payment','confirmed','in_progress','cancellation_requested','quote_requested','quote_received','revision_requested','awaiting_vendor') ORDER BY event_date", vendorId, from)]);
  return { from, to, days: days.map(d => ({ day: d.day, status: d.status, note: d.note, bookingId: d.booking_id })), bookings: bookings.map(b => ({ id: b.id, ref: b.ref, day: b.event_date, status: b.status })) };
}
async function setAvailability(db, vendorId, b) {
  const days = [...new Set((Array.isArray(b.days) ? b.days : []).map(String))].slice(0, 400);
  if (!days.length || days.some(d => !validDate(d) || d < today() || d > addDays(today(), 550))) return { error: 'Choose dates from today up to 18 months ahead.' };
  if (!['blocked', 'free'].includes(b.status)) return { error: 'Choose blocked or free.' };
  await db.tx(async (db) => {
    for (const d of days) {
      if (b.status === 'free') await db.run("DELETE FROM vendor_availability WHERE vendor_id = ? AND day = ? AND status = 'blocked'", vendorId, d);
      else await db.run("INSERT INTO vendor_availability (vendor_id, day, status, note, created_at) VALUES (?,?,'blocked',?,?) ON CONFLICT (vendor_id, day) DO UPDATE SET note = EXCLUDED.note WHERE vendor_availability.status = 'blocked'", vendorId, d, clean(b.note, 120), now());
    }
  });
  return { ok: true };
}
async function analyticsFor(db, v) {
  const since = addDays(today(), -365);
  const rows = await db.all('SELECT id, status, currency, agreed_total_minor, created_at FROM bookings WHERE vendor_id = ? AND created_at >= ?', v.id, since);
  const first = await db.all(`SELECT b.id, b.created_at, MIN(e.at) AS answered FROM bookings b JOIN booking_events e ON e.booking_id = b.id AND e.actor_type IN ('vendor','admin') AND e.action IN ('offer_sent','declined_by_vendor','offer_accepted')
    WHERE b.vendor_id = ? AND b.created_at >= ? GROUP BY b.id, b.created_at`, v.id, since);
  const won = rows.filter(r => ['awaiting_payment', 'confirmed', 'in_progress', 'completed'].includes(r.status));
  const revenue = {}; for (const r of won) if (r.agreed_total_minor != null) revenue[r.currency] = (revenue[r.currency] || 0) + r.agreed_total_minor;
  const hours = first.map(f => (Date.parse(f.answered) - Date.parse(f.created_at)) / 36e5).filter(h => h >= 0).sort((a, b) => a - b);
  const byMonth = {}; for (const r of rows) { const m = r.created_at.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + 1; }
  return { periodFrom: since, profileViews: v.views, requests: rows.length, won: won.length, conversion: rows.length ? Math.round(won.length / rows.length * 1000) / 10 : null,
    medianResponseHours: hours.length ? Math.round(hours[Math.floor(hours.length / 2)] * 10) / 10 : null, revenueByCurrency: revenue, requestsByMonth: byMonth,
    note: 'Profile views are counted at most once per visitor per hour. Revenue is the agreed total of bookings that reached agreement, before any refund.' };
}
