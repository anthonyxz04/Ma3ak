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

const SETTINGS = ['indoor', 'outdoor', 'both'];
const MAX_LINES = 80;
const canEdit = a => a && (a.role === 'owner' || a.role === 'editor');
const int = (x, max = 1e8) => x === '' || x == null ? null : Number.isFinite(+x) && +x >= 0 ? Math.min(max, Math.round(+x)) : null;
async function body(req, res, size = 64e3) { if (!originAllowed(req)) { fail(res, 403, 'Request blocked.'); return null; } try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }

// Quantity a line is multiplied by. Per-guest lines follow the guest count unless the customer set a number.
export const qtyOf = (s, guests) => s.quantity != null ? s.quantity : s.unit === 'per_guest' ? (guests || 0) : 1;
export function totals(services, e) {
  let low = 0, high = 0, quote = 0, needsGuests = false;
  for (const s of services) {
    const q = qtyOf(s, e.guest_count); if (s.unit === 'per_guest' && s.quantity == null && !e.guest_count) needsGuests = true;
    if (s.unit_price == null) { quote++; continue; }
    low += s.unit_price * q; high += (s.price_max ?? s.unit_price) * q;
  }
  const budget = e.budget || null;
  return { low, high, quoteItems: quote, budget, remaining: budget != null ? budget - low : null, overBudget: budget != null && low > budget, overBudgetHigh: budget != null && high > budget, needsGuests, count: services.length };
}
export const planCore = e => ({ id: e.id, name: e.name, eventType: e.event_type, date: e.event_date, location: e.location, guests: e.guest_count, budget: e.budget, theme: e.style, setting: e.setting,
  wanted: e.wanted ? e.wanted.split(' ').filter(Boolean) : [], notes: e.notes, requirements: e.requirements, status: e.status, rev: e.rev, updatedAt: e.updated_at, createdAt: e.created_at });
export const lineOut = (s, guests) => ({ id: s.id, category: s.category, source: s.source, vendorId: s.vendor_id, packageId: s.package_id, vendorName: s.vendor_name, label: s.label, unit: s.unit,
  unitPrice: s.unit_price, priceMax: s.price_max, quantity: s.quantity, qty: qtyOf(s, guests), followsGuests: s.unit === 'per_guest' && s.quantity == null,
  lineLow: s.unit_price == null ? null : s.unit_price * qtyOf(s, guests), lineHigh: s.unit_price == null ? null : (s.price_max ?? s.unit_price) * qtyOf(s, guests), note: s.note,
  // the provider has changed the package price since it was added (customer can choose to update)
  currentPrice: s.cur_price !== undefined && s.package_id && (s.cur_price !== s.unit_price || s.cur_max !== s.price_max) ? { price: s.cur_price, priceMax: s.cur_max } : null,
  available: s.package_id ? !!s.cur_live : true, isDemo: !!s.is_demo });

export async function loadServices(db, eventId) {
  return db.all(`SELECT s.*, p.price AS cur_price, p.price_max AS cur_max, (p.active = 1 AND v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL) AS cur_live, v.is_demo
    FROM event_services s LEFT JOIN vendor_packages p ON p.id = s.package_id LEFT JOIN vendors v ON v.id = s.vendor_id WHERE s.event_id = ? ORDER BY s.sort, s.created_at`, eventId);
}
async function planOut(db, e, role) {
  const services = await loadServices(db, e.id);
  return { ok: true, role, plan: planCore(e), services: services.map(s => lineOut(s, e.guest_count)), totals: totals(services, e) };
}
async function coreFrom(db, b, prev = {}) {
  const c = check(b, { name: { required: true, max: 120, msg: 'Give your plan a name.' }, eventType: { oneOf: EVENT_TYPES }, location: { oneOf: AREAS }, setting: { oneOf: SETTINGS }, theme: { max: 60 }, notes: { max: 5000 }, requirements: { max: 3000 }, status: { oneOf: ['draft', 'finalized'] } });
  if (!c.ok) return { error: 'Please check the highlighted fields.', fields: c.fields };
  const date = b.date ? (/^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : null) : null;
  if (b.date && !date) return { error: 'Choose a valid date.', fields: { date: 'Invalid date.' } };
  const cats = await categoryIds(db), wanted = [...new Set((Array.isArray(b.wanted) ? b.wanted : []).map(x => clean(x, 40)).filter(x => cats.includes(x)))].slice(0, 20);
  const guests = int(b.guests, 100000), budget = int(b.budget);
  if (b.guests !== undefined && b.guests !== '' && b.guests !== null && guests == null) return { error: 'Enter the number of guests as a whole number.', fields: { guests: 'Invalid.' } };
  if (b.budget !== undefined && b.budget !== '' && b.budget !== null && budget == null) return { error: 'Enter the budget as a whole number.', fields: { budget: 'Invalid.' } };
  const v = c.value;
  return { value: { name: v.name, event_type: v.eventType || null, event_date: date, location: v.location || null, setting: v.setting || null, guest_count: guests, budget, style: v.theme || null,
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
      await db.run(`INSERT INTO events (id, user_id, name, event_type, event_date, location, setting, guest_count, budget, style, wanted, notes, requirements, status, progress, rev, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,1,?,?)`, id, u.id, v.name, v.event_type, v.event_date, v.location, v.setting, v.guest_count, v.budget, v.style, v.wanted, v.notes, v.requirements, 'draft', t, t);
      track('event_created', { type: v.event_type || 'none', source: 'planner' }, u.id);
      sendJson(res, 201, { ok: true, id });
    },
    'GET /api/events/:id/plan': async (req, res, _db, url, id) => { const g = await gate(req, res, db, id, false); if (!g) return; sendJson(res, 200, await planOut(db, g.a.e, g.a.role)); },
    'PUT /api/events/:id/plan': async (req, res, _db, url, id) => {
      const g = await gate(req, res, db, id, true); if (!g) return; const b = await body(req, res); if (!b) return;
      if (b.rev != null && Number(b.rev) !== g.a.e.rev) return fail(res, 409, 'This plan was changed on another device. Reload to see the latest version.', { code: 'conflict', rev: g.a.e.rev });
      const r = await coreFrom(db, b, g.a.e); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
      const v = r.value;
      await db.run(`UPDATE events SET name=?, event_type=?, event_date=?, location=?, setting=?, guest_count=?, budget=?, style=?, wanted=?, notes=?, requirements=?, status=?, rev = rev + 1, updated_at=? WHERE id = ?`,
        v.name, v.event_type, v.event_date, v.location, v.setting, v.guest_count, v.budget, v.style, v.wanted, v.notes, v.requirements, v.status, now(), g.a.e.id);
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
        await db.run(`INSERT INTO event_services (id, event_id, category, vendor_id, package_id, source, label, vendor_name, unit, unit_price, price_max, quantity, note, sort, created_at, updated_at)
          VALUES (?,?,?,?,?,'package',?,?,?,?,?,?,'',?,?,?)`, sid, e.id, p.category, p.vendor_id, p.id, p.name, p.vendor_name, p.unit, p.price, p.price_max, qty, sort, t, t);
      } else {
        const c = check(b, { label: { required: true, max: 120, msg: 'Describe the service.' }, category: { required: true, max: 40 }, unit: { oneOf: UNITS }, note: { max: 500 } });
        if (c.ok && !(await categoryIds(db)).includes(c.value.category)) c.fields.category = 'Choose a category.';
        if (Object.keys(c.fields).length) return fail(res, 422, 'Please check the service.', { fields: c.fields });
        const unit = c.value.unit || 'flat', price = int(b.unitPrice), qty = unit === 'per_guest' && (b.quantity == null || b.quantity === '') ? null : Math.max(1, int(b.quantity, 100000) || 1);
        await db.run(`INSERT INTO event_services (id, event_id, category, source, label, vendor_name, unit, unit_price, quantity, note, sort, created_at, updated_at) VALUES (?,?,?,'custom',?,?,?,?,?,?,?,?,?)`,
          sid, e.id, c.value.category, c.value.label, clean(b.vendorName, 120), unit, price, qty, c.value.note || '', sort, t, t);
      }
      await touch(db, e.id);
      sendJson(res, 201, { id: sid, ...(await planOut(db, await db.get('SELECT * FROM events WHERE id = ?', e.id), g.a.role)) });
    },
    'PATCH /api/events/:id/services/:sid': async (req, res, _db, url, id, sid) => {
      const g = await gate(req, res, db, id, true); if (!g) return; const b = await body(req, res, 16e3); if (!b) return;
      const s = await db.get('SELECT * FROM event_services WHERE id = ? AND event_id = ?', String(sid), g.a.e.id); if (!s) return fail(res, 404, 'Service not found.');
      let { quantity, unit_price: price, price_max: max, label, note, unit } = s;
      if (b.quantity !== undefined) { if (b.quantity === null && s.unit === 'per_guest') quantity = null; else { const q = int(b.quantity, 100000); if (q == null || q < 1) return fail(res, 422, 'Enter a quantity of at least 1.', { fields: { quantity: 'Invalid.' } }); quantity = q; } }
      if (b.note !== undefined) note = clean(b.note, 500);
      if (b.refreshPrice && s.package_id) { const p = await db.get('SELECT price, price_max FROM vendor_packages WHERE id = ?', s.package_id); if (p) { price = p.price; max = p.price_max; } }
      if (s.source === 'custom') {
        if (b.label !== undefined) { label = clean(b.label, 120); if (!label) return fail(res, 422, 'Describe the service.', { fields: { label: 'Required.' } }); }
        if (b.unitPrice !== undefined) price = int(b.unitPrice);
        if (b.unit !== undefined && UNITS.includes(b.unit)) { unit = b.unit; if (unit !== 'per_guest' && quantity == null) quantity = 1; }
      }
      await db.run('UPDATE event_services SET quantity=?, unit_price=?, price_max=?, label=?, note=?, unit=?, updated_at=? WHERE id = ?', quantity, price, max, label, note, unit, now(), s.id);
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
