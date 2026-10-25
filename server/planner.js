// Budget planner: an event plan with services picked from providers' packages (or custom lines).
// Prices are captured when a service is added and always shown as estimates; a line without a price
// is "request a quote". Only the owner and invited editors can change a plan; viewers can read it.
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { requireUser } from './users.js';
import { access } from './events.js';
import { check, clean } from './validate.js';
import { originAllowed } from './security.js';
import { entitlements } from './plans.js';
import { AREAS, EVENT_TYPES, UNITS, categoryIds } from './vendors.js';
import { CURRENCIES, isCurrency, toMinor, times, toWhole } from './money.js';
import { feeRules, feesFor } from './billing.js';

const SETTINGS = ['indoor', 'outdoor', 'both'];
const MAX_LINES = 80;
const canEdit = a => a && (a.role === 'owner' || a.role === 'editor');
const int = (x, max = 1e8) => x === '' || x == null ? null : Number.isFinite(+x) && +x >= 0 ? Math.min(max, Math.round(+x)) : null;
async function body(req, res, size = 64e3) { if (!originAllowed(req)) { fail(res, 403, 'Request blocked.'); return null; } try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }

// Quantity a line is multiplied by. Per-guest lines follow the guest count unless the customer set a number.
export const qtyOf = (s, guests) => s.quantity != null ? s.quantity : s.unit === 'per_guest' ? (guests || 0) : 1;
// Totals are kept per currency (no exchange rates). A line linked to a booking with an agreed price uses that
// price (fees included, as agreed); every other priced line is an estimate, and customer fees are added on top.
export function totals(services, e, rules = []) {
  const by = {}; let quote = 0, needsGuests = false;
  const T = c => (by[c] ||= { currency: c, low: 0, high: 0, discount: 0, agreed: 0, estimateLines: 0, agreedLines: 0 });
  for (const s of services) {
    if (s.agreed_total_minor != null) { const t = T(s.agreed_currency); t.agreed += s.agreed_total_minor; t.agreedLines++; continue; }
    const q = qtyOf(s, e.guest_count); if (s.unit === 'per_guest' && s.quantity == null && !e.guest_count) needsGuests = true;
    if (s.unit_price_minor == null || s.price_type === 'quote') { quote++; continue; }
    const t = T(s.currency || 'USD'); t.low += times(s.unit_price_minor, q); t.high += times(s.price_max_minor ?? s.unit_price_minor, q); t.discount += s.discount_minor || 0; t.estimateLines++;
  }
  const list = Object.values(by).map(t => {
    const fl = feesFor(rules, t.low - t.discount, t.currency), fh = feesFor(rules, t.high - t.discount, t.currency);
    return { ...t, fees: fl.detail, feesLow: fl.total, feesHigh: fh.total, totalLow: t.low - t.discount + fl.total + t.agreed, totalHigh: t.high - t.discount + fh.total + t.agreed };
  });
  const cur = e.currency || 'USD', main = list.find(t => t.currency === cur) || { totalLow: 0, totalHigh: 0 };
  const budget = e.budget != null ? e.budget * 10 ** (CURRENCIES[cur] || CURRENCIES.USD).digits : null;
  return { currency: cur, byCurrency: list, quoteItems: quote, budgetMinor: budget, remainingMinor: budget != null ? budget - main.totalLow : null, overBudget: budget != null && main.totalLow > budget, overBudgetHigh: budget != null && main.totalHigh > budget,
    otherCurrencies: list.some(t => t.currency !== cur), needsGuests, count: services.length, isEstimate: list.some(t => t.estimateLines > 0) || quote > 0 };
}
export const planCore = e => ({ id: e.id, name: e.name, eventType: e.event_type, date: e.event_date, time: e.event_time, location: e.location, guests: e.guest_count, budget: e.budget, currency: e.currency || 'USD', theme: e.style, setting: e.setting,
  wanted: e.wanted ? e.wanted.split(' ').filter(Boolean) : [], notes: e.notes, requirements: e.requirements, status: e.status, rev: e.rev, updatedAt: e.updated_at, createdAt: e.created_at });
export const lineOut = (s, guests) => {
  const q = qtyOf(s, guests), priced = s.unit_price_minor != null && s.price_type !== 'quote';
  return { id: s.id, category: s.category, source: s.source, vendorId: s.vendor_id, packageId: s.package_id, vendorName: s.vendor_name, label: s.label, unit: s.unit,
    priceType: s.price_type, currency: s.currency, unitPriceMinor: priced ? s.unit_price_minor : null, priceMaxMinor: priced ? s.price_max_minor : null, discountMinor: s.discount_minor || 0, quantity: s.quantity, qty: q, followsGuests: s.unit === 'per_guest' && s.quantity == null,
    lineLowMinor: priced ? times(s.unit_price_minor, q) : null, lineHighMinor: priced ? times(s.price_max_minor ?? s.unit_price_minor, q) : null, note: s.note,
    agreed: s.agreed_total_minor != null ? { ref: s.booking_ref, status: s.booking_status, totalMinor: s.agreed_total_minor, currency: s.agreed_currency } : null,
    booking: s.booking_id && s.booking_ref ? { id: s.booking_id, ref: s.booking_ref, status: s.booking_status } : null,
    // the provider has changed the package price since it was added (customer can choose to update)
    currentPrice: s.package_id && s.cur_live && (s.cur_minor !== s.unit_price_minor || s.cur_max_minor !== s.price_max_minor || s.cur_currency !== s.currency || s.cur_type !== s.price_type) ? { priceType: s.cur_type, currency: s.cur_currency, priceMinor: s.cur_minor, priceMaxMinor: s.cur_max_minor } : null,
    available: s.package_id ? !!s.cur_live : true, isDemo: !!s.is_demo };
};

export async function loadServices(db, eventId) {
  return db.all(`SELECT s.*, p.price_minor AS cur_minor, p.price_max_minor AS cur_max_minor, p.currency AS cur_currency, p.price_type AS cur_type,
      (p.active = 1 AND v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL) AS cur_live, v.is_demo,
      bk.ref AS booking_ref, bk.status AS booking_status, CASE WHEN bk.agreed_offer_id IS NOT NULL AND bk.status IN ('awaiting_payment','confirmed','in_progress','completed','cancellation_requested') THEN bk.agreed_total_minor END AS agreed_total_minor, bk.currency AS agreed_currency
    FROM event_services s LEFT JOIN vendor_packages p ON p.id = s.package_id LEFT JOIN vendors v ON v.id = s.vendor_id LEFT JOIN bookings bk ON bk.id = s.booking_id WHERE s.event_id = ? ORDER BY s.sort, s.created_at`, eventId);
}
export async function planOut(db, e, role) {
  const [services, rules] = await Promise.all([loadServices(db, e.id), feeRules(db)]);
  return { ok: true, role, plan: planCore(e), services: services.map(s => lineOut(s, e.guest_count)), totals: totals(services, e, rules) };
}
async function coreFrom(db, b, prev = {}) {
  const c = check(b, { name: { required: true, max: 120, msg: 'Give your plan a name.' }, eventType: { oneOf: EVENT_TYPES }, location: { oneOf: AREAS }, setting: { oneOf: SETTINGS }, theme: { max: 60 }, notes: { max: 5000 }, requirements: { max: 3000 }, status: { oneOf: ['draft', 'finalized'] } });
  if (!c.ok) return { error: 'Please check the highlighted fields.', fields: c.fields };
  const date = b.date ? (/^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : null) : null;
  const time = b.time ? (/^([01]\d|2[0-3]):[0-5]\d$/.test(b.time) ? b.time : undefined) : null;
  if (time === undefined) return { error: 'Use a time like 19:30.', fields: { time: 'Invalid time.' } };
  const currency = isCurrency(b.currency) ? b.currency : prev.currency || 'USD';
  if (b.date && !date) return { error: 'Choose a valid date.', fields: { date: 'Invalid date.' } };
  const cats = await categoryIds(db), wanted = [...new Set((Array.isArray(b.wanted) ? b.wanted : []).map(x => clean(x, 40)).filter(x => cats.includes(x)))].slice(0, 20);
  const guests = int(b.guests, 100000), budget = int(b.budget);
  if (b.guests !== undefined && b.guests !== '' && b.guests !== null && guests == null) return { error: 'Enter the number of guests as a whole number.', fields: { guests: 'Invalid.' } };
  if (b.budget !== undefined && b.budget !== '' && b.budget !== null && budget == null) return { error: 'Enter the budget as a whole number.', fields: { budget: 'Invalid.' } };
  const v = c.value;
  return { value: { name: v.name, event_type: v.eventType || null, event_date: date, event_time: time, currency, location: v.location || null, setting: v.setting || null, guest_count: guests, budget, style: v.theme || null,
    wanted: wanted.join(' '), notes: v.notes || '', requirements: v.requirements || '', status: v.status || prev.status || 'draft' } };
}
async function gate(req, res, db, id, write) {
  const u = await requireUser(req, res, db, { write }); if (!u) return null;
  const a = await access(db, id, u); if (!a) { fail(res, 404, 'Plan not found.'); return null; }
  if (write && !canEdit(a)) { fail(res, 403, 'You can view this plan but not edit it.'); return null; }
  return { u, a };
}
const touch = (db, id) => db.run('UPDATE events SET rev = rev + 1, updated_at = ? WHERE id = ?', now(), id);

export function plannerRoutes(db, track) {
  return {
    'POST /api/plans': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res); if (!b) return;
      if ((await db.get('SELECT COUNT(*) AS n FROM events WHERE user_id = ?', u.id)).n >= entitlements(u).maxEvents) return fail(res, 402, `You can keep up to ${entitlements(u).maxEvents} plans. Delete one to create another.`, { code: 'limit_events' });
      const r = await coreFrom(db, { name: 'My event', ...b }); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const v = r.value, id = uid(), t = now();
      await db.run(`INSERT INTO events (id, user_id, name, event_type, event_date, event_time, currency, location, setting, guest_count, budget, style, wanted, notes, requirements, status, progress, rev, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,1,?,?)`, id, u.id, v.name, v.event_type, v.event_date, v.event_time, v.currency, v.location, v.setting, v.guest_count, v.budget, v.style, v.wanted, v.notes, v.requirements, 'draft', t, t);
      track('event_created', { type: v.event_type || 'none', source: 'planner' }, u.id);
      sendJson(res, 201, { ok: true, id });
    },
    'GET /api/events/:id/plan': async (req, res, _db, url, id) => { const g = await gate(req, res, db, id, false); if (!g) return; sendJson(res, 200, await planOut(db, g.a.e, g.a.role)); },
    'PUT /api/events/:id/plan': async (req, res, _db, url, id) => {
      const g = await gate(req, res, db, id, true); if (!g) return; const b = await body(req, res); if (!b) return;
      if (b.rev != null && Number(b.rev) !== g.a.e.rev) return fail(res, 409, 'This plan was changed on another device. Reload to see the latest version.', { code: 'conflict', rev: g.a.e.rev });
      const r = await coreFrom(db, b, g.a.e); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const v = r.value;
      await db.run(`UPDATE events SET name=?, event_type=?, event_date=?, event_time=?, currency=?, location=?, setting=?, guest_count=?, budget=?, style=?, wanted=?, notes=?, requirements=?, status=?, rev = rev + 1, updated_at=? WHERE id = ?`,
        v.name, v.event_type, v.event_date, v.event_time, v.currency, v.location, v.setting, v.guest_count, v.budget, v.style, v.wanted, v.notes, v.requirements, v.status, now(), g.a.e.id);
      sendJson(res, 200, await planOut(db, await db.get('SELECT * FROM events WHERE id = ?', g.a.e.id), g.a.role));
    },
    // Add a provider package (price captured now) or a custom line with the customer's own estimate.
    'POST /api/events/:id/services': async (req, res, _db, url, id) => {
      const g = await gate(req, res, db, id, true); if (!g) return; const b = await body(req, res, 16e3); if (!b) return;
      const e = g.a.e, t = now();
      if ((await db.get('SELECT COUNT(*) AS n FROM event_services WHERE event_id = ?', e.id)).n >= MAX_LINES) return fail(res, 422, `A plan can have up to ${MAX_LINES} services.`);
      const sort = (await db.get('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM event_services WHERE event_id = ?', e.id)).n, sid = uid();
      if (b.packageId) {
        const p = await db.get(`SELECT p.*, v.name AS vendor_name, v.category FROM vendor_packages p JOIN vendors v ON v.id = p.vendor_id
          WHERE p.id = ? AND p.active = 1 AND v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL`, String(b.packageId));
        if (!p) return fail(res, 404, 'This package is no longer available.');
        if (b.replace && await db.get('SELECT 1 FROM event_services WHERE id = ? AND event_id = ?', String(b.replace), e.id)) await db.run('DELETE FROM event_services WHERE id = ? AND event_id = ?', String(b.replace), e.id);
        const qty = p.unit === 'per_guest' ? null : p.unit === 'flat' ? 1 : Math.max(1, p.min_qty || 1);
        await db.run(`INSERT INTO event_services (id, event_id, category, vendor_id, package_id, source, label, vendor_name, unit, unit_price, price_max, price_type, currency, unit_price_minor, price_max_minor, quantity, note, sort, created_at, updated_at)
          VALUES (?,?,?,?,?,'package',?,?,?,?,?,?,?,?,?,?,'',?,?,?)`, sid, e.id, p.category, p.vendor_id, p.id, p.name, p.vendor_name, p.unit, p.price, p.price_max, p.price_type, p.currency, p.price_type === 'quote' ? null : p.price_minor, p.price_type === 'starting' ? p.price_max_minor : null, qty, sort, t, t);
      } else {
        const c = check(b, { label: { required: true, max: 120, msg: 'Describe the service.' }, category: { required: true, max: 40 }, unit: { oneOf: UNITS }, note: { max: 500 } });
        if (c.ok && !(await categoryIds(db)).includes(c.value.category)) c.fields.category = 'Choose a category.';
        if (Object.keys(c.fields).length) return fail(res, 422, 'Please check the service.', { fields: c.fields });
        const unit = c.value.unit || 'flat', currency = isCurrency(b.currency) ? b.currency : e.currency || 'USD', price = toMinor(b.unitPrice ?? '', currency), qty = unit === 'per_guest' && (b.quantity == null || b.quantity === '') ? null : Math.max(1, int(b.quantity, 100000) || 1);
        if (Number.isNaN(price)) return fail(res, 422, `Enter the price in ${currency}, or leave it empty.`, { fields: { unitPrice: 'Invalid.' } });
        await db.run(`INSERT INTO event_services (id, event_id, category, source, label, vendor_name, unit, unit_price, price_type, currency, unit_price_minor, quantity, note, sort, created_at, updated_at) VALUES (?,?,?,'custom',?,?,?,?,?,?,?,?,?,?,?,?)`,
          sid, e.id, c.value.category, c.value.label, clean(b.vendorName, 120), unit, currency === 'USD' ? toWhole(price) : null, price == null ? 'quote' : 'starting', currency, price, qty, c.value.note || '', sort, t, t);
      }
      await touch(db, e.id);
      sendJson(res, 201, { id: sid, ...(await planOut(db, await db.get('SELECT * FROM events WHERE id = ?', e.id), g.a.role)) });
    },
    'PATCH /api/events/:id/services/:sid': async (req, res, _db, url, id, sid) => {
      const g = await gate(req, res, db, id, true); if (!g) return; const b = await body(req, res, 16e3); if (!b) return;
      const s = await db.get('SELECT * FROM event_services WHERE id = ? AND event_id = ?', String(sid), g.a.e.id); if (!s) return fail(res, 404, 'Service not found.');
      let { quantity, unit_price_minor: price, price_max_minor: max, price_type: ptype, currency, label, note, unit } = s;
      if (b.quantity !== undefined) { if (b.quantity === null && s.unit === 'per_guest') quantity = null; else { const q = int(b.quantity, 100000); if (q == null || q < 1) return fail(res, 422, 'Enter a quantity of at least 1.', { fields: { quantity: 'Invalid.' } }); quantity = q; } }
      if (b.note !== undefined) note = clean(b.note, 500);
      if (b.refreshPrice && s.package_id) { const p = await db.get('SELECT price_type, currency, price_minor, price_max_minor FROM vendor_packages WHERE id = ?', s.package_id); if (p) { ptype = p.price_type; currency = p.currency; price = p.price_type === 'quote' ? null : p.price_minor; max = p.price_type === 'starting' ? p.price_max_minor : null; } }
      if (s.source === 'custom') {
        if (b.label !== undefined) { label = clean(b.label, 120); if (!label) return fail(res, 422, 'Describe the service.', { fields: { label: 'Required.' } }); }
        if (b.currency !== undefined && isCurrency(b.currency)) currency = b.currency;
        if (b.unitPrice !== undefined) { price = toMinor(b.unitPrice ?? '', currency); if (Number.isNaN(price)) return fail(res, 422, `Enter the price in ${currency}, or leave it empty.`, { fields: { unitPrice: 'Invalid.' } }); ptype = price == null ? 'quote' : 'starting'; }
        if (b.unit !== undefined && UNITS.includes(b.unit)) { unit = b.unit; if (unit !== 'per_guest' && quantity == null) quantity = 1; }
      }
      await db.run('UPDATE event_services SET quantity=?, unit_price_minor=?, price_max_minor=?, price_type=?, currency=?, unit_price=?, price_max=?, label=?, note=?, unit=?, updated_at=? WHERE id = ?',
        quantity, price, max, ptype, currency, currency === 'USD' ? toWhole(price) : null, currency === 'USD' ? toWhole(max) : null, label, note, unit, now(), s.id);
      await touch(db, g.a.e.id);
      sendJson(res, 200, await planOut(db, await db.get('SELECT * FROM events WHERE id = ?', g.a.e.id), g.a.role));
    },
    'DELETE /api/events/:id/services/:sid': async (req, res, _db, url, id, sid) => {
      const g = await gate(req, res, db, id, true); if (!g) return;
      const r = await db.run('DELETE FROM event_services WHERE id = ? AND event_id = ?', String(sid), g.a.e.id); if (!r.changes) return fail(res, 404, 'Service not found.');
      await touch(db, g.a.e.id);
      sendJson(res, 200, await planOut(db, await db.get('SELECT * FROM events WHERE id = ?', g.a.e.id), g.a.role));
    },
  };
}
