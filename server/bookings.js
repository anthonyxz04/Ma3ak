// Bookings: request → quote (with revisions) → acceptance → confirmation → completion.
// Every status change goes through `transition`, which only allows the moves listed in TRANSITIONS,
// checks the status hasn't changed underneath (no double processing), and records who did what and when.
// An accepted offer is never edited: a change needs a new offer (an amendment) that the customer accepts.
import { config } from './config.js';
import { now, uid } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { check, clean } from './validate.js';
import { requireUser } from './users.js';
import { rateLimit, newRef, originAllowed } from './security.js';
import { status as integrations } from './integrations.js';
import { audit } from './audit.js';
import { isCurrency, toMinor, times, format } from './money.js';
import { cleanDetails, parseJson, getSetting, AREAS, EVENT_TYPES, today, addDays, validDate, normalizePhone } from './fields.js';
import { notify, notifyVendor } from './notifications.js';
import { snapshotCommission, customerFees, refreshPaymentStatus, effectiveRule, vendorPlan } from './billing.js';

export const STATUSES = ['draft', 'quote_requested', 'quote_received', 'revision_requested', 'awaiting_vendor', 'awaiting_payment', 'confirmed', 'in_progress', 'completed', 'cancellation_requested', 'cancelled', 'declined', 'expired'];
const OPEN = ['draft', 'quote_requested', 'quote_received', 'revision_requested', 'awaiting_vendor'];
const AGREED = ['awaiting_payment', 'confirmed', 'in_progress'];
const CLOSED = ['completed', 'cancelled', 'declined', 'expired'];
export const TRANSITIONS = {
  draft: ['quote_requested', 'awaiting_vendor', 'cancelled'],
  quote_requested: ['quote_received', 'declined', 'cancelled', 'expired'],
  revision_requested: ['quote_received', 'declined', 'cancelled', 'expired'],
  quote_received: ['quote_received', 'quote_requested', 'revision_requested', 'awaiting_payment', 'confirmed', 'declined', 'cancelled', 'expired'],
  awaiting_vendor: ['quote_received', 'awaiting_payment', 'confirmed', 'declined', 'cancelled', 'expired'],
  awaiting_payment: ['confirmed', 'cancellation_requested', 'cancelled'],
  confirmed: ['in_progress', 'completed', 'cancellation_requested', 'cancelled'],
  in_progress: ['completed', 'cancellation_requested', 'cancelled'],
  cancellation_requested: ['cancelled', 'awaiting_payment', 'confirmed', 'in_progress'],
  completed: [], cancelled: [], declined: [], expired: [],
};
const PUBLIC = "v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL";
const POLICY = { offerValidityDays: 14, reviewWindowDays: 180, defaultCancellationTerms: 'No special cancellation terms were set by the provider. Ask them before you accept if this matters to you.' };
const HttpError = (status, message, extra = {}) => Object.assign(new Error(message), { status, extra });

// The vendor sees the customer's contact details only once the booking is confirmed.
const contactVisible = b => !!b.confirmed_at && b.status !== 'cancelled';

// ---------- contact-detail masking in messages before confirmation ----------
const LINK_RE = /\b(?:https?:\/\/)?(?:www\.)?(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|t\.me|m\.me|telegram\.me|instagram\.com|facebook\.com|fb\.com)\/\S*/gi;
const EMAIL_RE = /[A-Z0-9._%+-]+\s*(?:@|\(at\)|\[at\]|\sat\s)\s*[A-Z0-9-]+(?:\s*(?:\.|\(dot\)|\[dot\]|\sdot\s)\s*[A-Z0-9-]+)*\s*(?:\.|\(dot\)|\[dot\]|\sdot\s)\s*[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+|00)?\d[\d\s().\-/]{5,}\d/g;
const DATE_LIKE = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$|^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/;
export function maskContacts(text) {
  let masked = false;
  const out = String(text || '')
    .replace(LINK_RE, () => { masked = true; return '[link hidden]'; })
    .replace(EMAIL_RE, () => { masked = true; return '[email hidden]'; })
    .replace(PHONE_RE, m => { const t = m.trim(); if (DATE_LIKE.test(t) || t.replace(/\D/g, '').length < 7) return m; masked = true; return '[number hidden]'; });
  return { text: out, masked };
}

// ---------- shared helpers ----------
async function logEvent(db, bookingId, who, action, from, to, note = '', data = {}) {
  await db.run('INSERT INTO booking_events (booking_id, at, actor_type, actor_id, action, from_status, to_status, note, data) VALUES (?,?,?,?,?,?,?,?,?)',
    bookingId, now(), who.type, who.id == null ? null : String(who.id), action, from, to, clean(note, 1000), JSON.stringify(data));
}
// The only way a booking's status changes. `set` keys are code constants, never user input.
async function transition(db, b, to, who, action, { note = '', data = {}, set = {} } = {}) {
  if (!(TRANSITIONS[b.status] || []).includes(to)) throw HttpError(409, 'This step isn’t possible for the booking’s current status.');
  const cols = Object.keys(set), t = now();
  const r = await db.run(`UPDATE bookings SET status = ?, updated_at = ?${cols.map(c => `, ${c} = ?`).join('')} WHERE id = ? AND status = ?`, to, t, ...cols.map(c => set[c]), b.id, b.status);
  if (!r.changes) throw HttpError(409, 'This booking was just updated. Reload the page and try again.');
  await logEvent(db, b.id, who, action, b.status, to, note, data);
  Object.assign(b, set, { status: to, updated_at: t });
}
const policy = db => getSetting(db, 'bookingPolicy', POLICY);
const vendorTermsVersion = async db => (await getSetting(db, 'vendorTerms', {})).version || null;
const latestOffer = (db, id) => db.get('SELECT * FROM booking_offers WHERE booking_id = ? ORDER BY version DESC LIMIT 1', id);
const listOf = (v, n, max) => (Array.isArray(v) ? v : String(v || '').split('\n')).map(x => clean(x, max)).filter(Boolean).slice(0, n);
const links = b => ({ customer: `#/bookings/${b.id}`, vendor: `#/bookings/${b.id}` });

async function notifyCustomer(db, b, n) { if (b.user_id) await notify(db, b.user_id, { link: links(b).customer, ...n }); }
async function notifyProvider(db, b, n) {
  const v = b.vendor_id ? await db.get('SELECT id, name, owner_user_id FROM vendors WHERE id = ?', b.vendor_id) : null;
  if (v) await notifyVendor(db, v, { link: links(b).vendor, ...n });
}
async function reverseCommission(db, b, why) {
  await db.run("UPDATE commissions SET status = 'reversed', note = ?, updated_at = ? WHERE booking_id = ? AND status = 'accrued'", why, now(), b.id);
}
async function releaseDate(db, b) { await db.run("DELETE FROM vendor_availability WHERE booking_id = ? AND status = 'booked'", b.id); }
// Venues host one event per day, so a confirmed venue booking marks the day as booked.
async function holdDate(db, b) {
  if (b.category !== 'venue' || !b.vendor_id || !b.event_date) return;
  await db.run("INSERT INTO vendor_availability (vendor_id, day, status, note, booking_id, created_at) VALUES (?,?,'booked',?,?,?) ON CONFLICT (vendor_id, day) DO NOTHING", b.vendor_id, b.event_date, `Booking ${b.ref}`, b.id, now());
}
async function paidSoFar(db, b) {
  const rows = await db.all("SELECT kind, amount_minor FROM payments WHERE booking_id = ? AND status = 'succeeded'", b.id);
  const paid = rows.filter(r => r.kind !== 'refund').reduce((s, r) => s + r.amount_minor, 0), refunded = rows.filter(r => r.kind === 'refund').reduce((s, r) => s + r.amount_minor, 0);
  return { paid, refunded, net: paid - refunded };
}
async function confirmIfPaid(db, b) {
  if (b.status !== 'awaiting_payment') return false;
  const p = await paidSoFar(db, b);
  if (p.net < (b.deposit_minor || 0)) return false;
  await transition(db, b, 'confirmed', { type: 'system' }, 'deposit_received', { set: { confirmed_at: now() } });
  await holdDate(db, b);
  return true;
}

// ---------- booking form (shared by preview and submit) ----------
async function bookingFrom(db, u, b) {
  const v = await db.get(`SELECT v.* FROM vendors v WHERE v.id = ? AND ${PUBLIC}`, String(b.vendorId || ''));
  if (!v) return { status: 404, error: 'This provider isn’t listed.' };
  if (v.is_demo) return { status: 409, code: 'demo', error: 'This is a sample listing that shows how Ma3ak works. It can’t be booked.' };
  if (v.owner_user_id && v.owner_user_id === u.id) return { status: 422, error: 'You can’t book your own listing.' };
  const c = check({ name: b.name ?? u.name, email: b.email ?? u.email, eventType: b.eventType, location: b.location, address: b.address, notes: b.notes },
    { name: { required: true, min: 2, max: 120, msg: 'Enter your full name.' }, email: { required: true, type: 'email', max: 254 }, eventType: { required: true, oneOf: EVENT_TYPES, msg: 'Choose the type of event.' },
      location: { required: true, oneOf: AREAS, msg: 'Choose the area.' }, address: { max: 300 }, notes: { max: 3000 } });
  const fields = { ...c.fields };
  const ph = normalizePhone(b.phone ?? u.phone); if (ph.error) fields.phone = ph.error;
  const date = String(b.date || '');
  if (!validDate(date)) fields.date = 'Choose the date of the event.'; else if (date < today()) fields.date = 'Choose a date in the future.'; else if (date > addDays(today(), 3 * 366)) fields.date = 'Choose a date within the next three years.';
  const time = b.time ? String(b.time) : ''; if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) fields.time = 'Use a time like 19:30.';
  const num = x => x === '' || x == null ? null : Number(x);
  const guests = num(b.guests); if (guests !== null && (!Number.isInteger(guests) || guests < 1 || guests > 50000)) fields.guests = 'Enter the number of guests.';
  if (guests == null && ['venue', 'catering'].includes(v.category)) fields.guests = 'Enter the number of guests.';
  let pkg = null;
  if (b.packageId) { pkg = await db.get('SELECT * FROM vendor_packages WHERE id = ? AND vendor_id = ? AND active = 1', String(b.packageId), v.id); if (!pkg) fields.packageId = 'This package is no longer offered.'; }
  if (pkg?.unit === 'per_guest' && guests == null) fields.guests = 'This package is priced per guest. Enter the number of guests.';
  const quantity = num(b.quantity); if (quantity !== null && (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000)) fields.quantity = 'Enter a whole number.';
  if (pkg && ['per_hour', 'per_item'].includes(pkg.unit) && quantity == null) fields.quantity = pkg.unit === 'per_hour' ? 'How many hours?' : 'How many items?';
  const n = !pkg ? null : pkg.unit === 'per_guest' ? guests : pkg.unit === 'flat' ? 1 : quantity;
  if (pkg?.min_qty && n != null && pkg.unit !== 'flat' && n < pkg.min_qty) fields[pkg.unit === 'per_guest' ? 'guests' : 'quantity'] = `This package starts at ${pkg.min_qty}.`;
  const d = cleanDetails(v.category, 'booking', b.details); for (const [k, m] of Object.entries(d.errors)) fields[`details.${k}`] = m;
  if (Object.keys(fields).length) return { status: 422, error: 'Please check the highlighted fields.', fields };
  if (await db.get('SELECT 1 FROM vendor_availability WHERE vendor_id = ? AND day = ?', v.id, date)) return { status: 409, code: 'unavailable', error: 'The provider has marked this date as unavailable. Choose another date or another provider.', fields: { date: 'Unavailable.' } };
  const currency = pkg?.currency || 'USD';
  let estimate = null;
  if (pkg && pkg.price_type !== 'quote' && pkg.price_minor != null && n) {
    const sub = times(pkg.price_minor, n), fees = await customerFees(db, sub, currency);
    estimate = { priceType: pkg.price_type, quantity: n, unit: pkg.unit, unitMinor: pkg.price_minor, unitMaxMinor: pkg.price_max_minor, subtotalMinor: sub, fees: fees.detail, feesMinor: fees.total, totalMinor: sub + fees.total, currency };
  }
  const snapshot = pkg ? { id: pkg.id, name: pkg.name, description: pkg.description, priceType: pkg.price_type, currency: pkg.currency, priceMinor: pkg.price_minor, priceMaxMinor: pkg.price_max_minor, unit: pkg.unit, minQty: pkg.min_qty,
    includes: parseJson(pkg.includes, []), exclusions: parseJson(pkg.exclusions, []), conditions: pkg.conditions, details: parseJson(pkg.details, {}), estimate, capturedAt: now() } : { estimate: null, capturedAt: now() };
  return { vendor: v, pkg, estimate, snapshot, currency, status: pkg?.price_type === 'fixed' && estimate ? 'awaiting_vendor' : 'quote_requested',
    value: { name: c.value.name, email: c.value.email, phone: ph.value, eventType: c.value.eventType, location: c.value.location, address: c.value.address || '', notes: c.value.notes || '', date, time: time || null, guests, quantity, details: d.value } };
}

// ---------- offers (quotes and amendments) ----------
async function offerFrom(db, b, booking, kind) {
  const currency = kind === 'amendment' ? booking.currency : (isCurrency(b.currency) ? b.currency : booking.currency || 'USD');
  const raw = Array.isArray(b.items) ? b.items.slice(0, 30) : [], items = [], fields = {};
  raw.forEach((it, i) => {
    const label = clean(it?.label, 120), qty = it?.quantity === '' || it?.quantity == null ? 1 : Number(it.quantity), unit = toMinor(it?.unitPrice, currency);
    if (!label) fields[`items.${i}.label`] = 'Describe this line.';
    if (!Number.isInteger(qty) || qty < 1 || qty > 100000) fields[`items.${i}.quantity`] = 'Whole number.';
    if (!Number.isInteger(unit)) fields[`items.${i}.unitPrice`] = 'Enter the price.';
    if (label && Number.isInteger(qty) && Number.isInteger(unit)) items.push({ label, quantity: qty, unitMinor: unit, totalMinor: times(unit, qty) });
  });
  if (!raw.length) fields.items = 'Add at least one line with a price.';
  const subtotal = items.reduce((s, x) => s + x.totalMinor, 0);
  const discount = toMinor(b.discount ?? '', currency) ?? 0; if (!Number.isInteger(discount) || discount > subtotal) fields.discount = 'The discount can’t be more than the subtotal.';
  const discountNote = clean(b.discountNote, 200); if (discount > 0 && !discountNote) fields.discountNote = 'Say what the discount is for.';
  const p = await policy(db), t = today();
  const eventDate = b.eventDate ? String(b.eventDate) : booking.event_date;
  if (eventDate && (!validDate(eventDate) || eventDate < t)) fields.eventDate = 'Choose a date in the future.';
  let validUntil = b.validUntil ? String(b.validUntil) : addDays(t, Math.max(1, Math.min(90, Number(p.offerValidityDays) || 14)));
  if (!validDate(validUntil) || validUntil < t || validUntil > addDays(t, 90)) fields.validUntil = 'Choose a date within the next 90 days.';
  if (eventDate && validUntil > eventDate) validUntil = eventDate;
  if (Object.keys(fields).length) return { error: 'Please check the highlighted fields.', fields };
  const fees = await customerFees(db, subtotal - discount, currency), total = subtotal - discount + fees.total;
  const deposit = toMinor(b.deposit ?? '', currency) ?? 0;
  if (!Number.isInteger(deposit) || deposit > total) return { error: 'The deposit can’t be more than the total.', fields: { deposit: 'Too high.' } };
  return { value: { kind, currency, items, subtotal, discount, discountNote, fees: fees.detail, feesTotal: fees.total, total, deposit,
    paymentSchedule: clean(b.paymentSchedule, 1000) || (deposit ? `Deposit of ${format(deposit, currency)} to confirm the booking. The balance of ${format(total - deposit, currency)} as agreed with the provider.` : `${format(total, currency)} as agreed with the provider.`),
    inclusions: listOf(b.inclusions, 30, 160), exclusions: listOf(b.exclusions, 30, 160), cancellationTerms: clean(b.cancellationTerms, 2000) || p.defaultCancellationTerms,
    eventDate, validUntil, message: clean(b.message, 2000) } };
}
async function insertOffer(db, booking, o, who) {
  const t = now(), id = uid(), version = ((await db.get('SELECT COALESCE(MAX(version), 0) AS n FROM booking_offers WHERE booking_id = ?', booking.id)).n) + 1;
  await db.run("UPDATE booking_offers SET status = 'superseded' WHERE booking_id = ? AND status = 'sent'", booking.id);
  await db.run(`INSERT INTO booking_offers (id, booking_id, version, kind, status, currency, items, subtotal_minor, discount_minor, discount_note, fees_minor, fees_detail, total_minor, deposit_minor,
    payment_schedule, inclusions, exclusions, cancellation_terms, event_date, valid_until, message, created_by, created_at) VALUES (?,?,?,?,'sent',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    id, booking.id, version, o.kind, o.currency, JSON.stringify(o.items), o.subtotal, o.discount, o.discountNote, o.feesTotal, JSON.stringify(o.fees), o.total, o.deposit,
    o.paymentSchedule, JSON.stringify(o.inclusions), JSON.stringify(o.exclusions), o.cancellationTerms, o.eventDate, o.validUntil, o.message, `${who.type}:${who.id ?? ''}`, t);
  return { id, version };
}
// The customer's acceptance fixes the price: the agreed amounts and terms are copied onto the booking.
async function agree(db, b, o, who) {
  const terms = { offerVersion: o.version, items: parseJson(o.items, []), fees: parseJson(o.fees_detail, []), discountNote: o.discount_note, inclusions: parseJson(o.inclusions, []), exclusions: parseJson(o.exclusions, []),
    cancellationTerms: o.cancellation_terms, paymentSchedule: o.payment_schedule, eventDate: o.event_date, acceptedAt: now() };
  const set = { agreed_offer_id: o.id, agreed_subtotal_minor: o.subtotal_minor, agreed_discount_minor: o.discount_minor, agreed_fees_minor: o.fees_minor, agreed_total_minor: o.total_minor,
    deposit_minor: o.deposit_minor, agreed_terms: JSON.stringify(terms), currency: o.currency, event_date: o.event_date || b.event_date };
  await db.run("UPDATE booking_offers SET status = 'superseded' WHERE booking_id = ? AND status = 'accepted' AND id <> ?", b.id, o.id);
  await db.run("UPDATE booking_offers SET status = 'accepted', responded_at = ? WHERE id = ? AND status = 'sent'", now(), o.id);
  if (o.kind === 'quote') {
    const to = o.deposit_minor > 0 ? 'awaiting_payment' : 'confirmed';
    if (to === 'confirmed') set.confirmed_at = now();
    await transition(db, b, to, who, 'offer_accepted', { data: { offerVersion: o.version, totalMinor: o.total_minor, currency: o.currency }, set });
  } else {
    const cols = Object.keys(set);
    await db.run(`UPDATE bookings SET updated_at = ?${cols.map(c => `, ${c} = ?`).join('')} WHERE id = ?`, now(), ...cols.map(c => set[c]), b.id);
    Object.assign(b, set);
    await logEvent(db, b.id, who, 'amendment_accepted', b.status, b.status, '', { offerVersion: o.version, totalMinor: o.total_minor });
  }
  const vendor = b.vendor_id ? await db.get('SELECT id, category FROM vendors WHERE id = ?', b.vendor_id) : null;
  if (vendor) await snapshotCommission(db, b, vendor);
  await refreshPaymentStatus(db, b);
  if (b.status === 'confirmed') await holdDate(db, b); else await confirmIfPaid(db, b);
}

// ---------- what each party may do next (the server enforces this list) ----------
export function actionsFor(b, role, ctx) {
  const a = new Set(), s = b.status, pending = ctx.latest && ctx.latest.status === 'sent' ? ctx.latest : null;
  const asVendor = role === 'vendor' || (role === 'admin' && !ctx.vendorOwned);
  const dayReached = !!b.event_date && b.event_date <= today();
  if (role === 'customer') {
    if (OPEN.includes(s)) a.add('cancel');
    if (pending && (pending.kind === 'quote' ? s === 'quote_received' : AGREED.includes(s))) { a.add('accept'); a.add('reject'); a.add('revise'); }
    if (AGREED.includes(s)) a.add('request_cancel');
    if (s === 'cancellation_requested') { if (b.cancel_requested_by === 'customer') a.add('withdraw_cancel'); else { a.add('approve_cancel'); a.add('reject_cancel'); } }
    if (s === 'completed' && !ctx.hasReview && b.completed_at && b.completed_at.slice(0, 10) >= addDays(today(), -(ctx.reviewWindowDays || 180))) a.add('review');
  }
  if (asVendor) {
    if (['quote_requested', 'revision_requested', 'quote_received', 'awaiting_vendor'].includes(s)) { a.add('send_offer'); a.add('decline'); }
    if (s === 'awaiting_vendor' && b.package_estimate) a.add('confirm');
    if (s === 'quote_received' && pending) a.add('withdraw_offer');
    if (['awaiting_payment', 'confirmed'].includes(s)) a.add('send_amendment');
    if (AGREED.includes(s)) { a.add('request_cancel'); a.add('report_payment'); }
    if (s === 'confirmed' && dayReached) a.add('start');
    if (['confirmed', 'in_progress'].includes(s) && dayReached) a.add('complete');
    if (s === 'cancellation_requested') { if (b.cancel_requested_by === 'vendor') a.add('withdraw_cancel'); else if (b.cancel_requested_by === 'customer') { a.add('approve_cancel'); a.add('reject_cancel'); } }
    a.add('note');
  }
  if (role === 'admin') {
    if (!CLOSED.includes(s)) a.add('admin_cancel');
    if (['confirmed', 'in_progress'].includes(s)) a.add('admin_complete');
    if (s === 'cancellation_requested') { a.add('approve_cancel'); a.add('reject_cancel'); }
    a.add(b.disputed ? 'resolve_dispute' : 'dispute');
    if (b.agreed_offer_id) a.add('record_payment');
  }
  if (!['cancelled', 'declined', 'expired'].includes(s)) a.add('message');
  return [...a];
}
async function contextFor(db, b) {
  const [latest, review, vendor, p] = await Promise.all([latestOffer(db, b.id), db.get('SELECT id FROM reviews WHERE booking_id = ?', b.id), b.vendor_id ? db.get('SELECT * FROM vendors WHERE id = ?', b.vendor_id) : null, policy(db)]);
  b.package_estimate = parseJson(b.package_snapshot, {}).estimate || null;
  return { latest, hasReview: !!review, vendor, vendorOwned: !!vendor?.owner_user_id, reviewWindowDays: Number(p.reviewWindowDays) || 180 };
}

// ---------- serialisation (each role sees only what it should) ----------
const offerView = o => ({ id: o.id, version: o.version, kind: o.kind, status: o.status, currency: o.currency, items: parseJson(o.items, []), subtotalMinor: o.subtotal_minor, discountMinor: o.discount_minor, discountNote: o.discount_note,
  feesMinor: o.fees_minor, fees: parseJson(o.fees_detail, []), totalMinor: o.total_minor, depositMinor: o.deposit_minor, paymentSchedule: o.payment_schedule, inclusions: parseJson(o.inclusions, []), exclusions: parseJson(o.exclusions, []),
  cancellationTerms: o.cancellation_terms, eventDate: o.event_date, validUntil: o.valid_until, message: o.message, createdAt: o.created_at, respondedAt: o.responded_at, responseNote: o.response_note });
function bookingView(b, role, extra = {}) {
  const hide = role === 'vendor' && !contactVisible(b), m = s => hide ? maskContacts(s).text : s;
  const details = parseJson(b.details, {}); if (hide) for (const k of Object.keys(details)) if (typeof details[k] === 'string') details[k] = m(details[k]);
  return {
    id: b.id, ref: b.ref, status: b.status, paymentStatus: b.payment_status, vendor: { id: b.vendor_id, name: b.vendor_name }, category: b.category, package: parseJson(b.package_snapshot, {}),
    customer: { name: b.customer_name, email: hide ? null : b.customer_email, phone: hide ? null : b.customer_phone, hidden: hide },
    eventType: b.event_type, eventDate: b.event_date, eventTime: b.event_time, location: b.location, address: hide ? '' : b.address, guests: b.guests, quantity: b.quantity, details, notes: m(b.notes), eventId: role === 'customer' ? b.event_id : undefined,
    currency: b.currency, estimateMinor: b.estimate_minor,
    agreed: b.agreed_offer_id ? { offerId: b.agreed_offer_id, subtotalMinor: b.agreed_subtotal_minor, discountMinor: b.agreed_discount_minor, feesMinor: b.agreed_fees_minor, totalMinor: b.agreed_total_minor, depositMinor: b.deposit_minor, terms: parseJson(b.agreed_terms, {}) } : null,
    commission: role !== 'customer' && b.commission_rate_bps != null ? { rateBps: b.commission_rate_bps, amountMinor: b.commission_minor } : undefined,
    cancelRequestedBy: b.cancel_requested_by, cancelReason: b.cancel_reason, disputed: role === 'admin' ? !!b.disputed : undefined, disputeNote: role === 'admin' ? b.dispute_note : undefined,
    vendorNote: role !== 'customer' ? b.vendor_note : undefined, confirmedAt: b.confirmed_at, completedAt: b.completed_at, cancelledAt: b.cancelled_at, createdAt: b.created_at, updatedAt: b.updated_at, ...extra,
  };
}
async function fullView(db, b, role) {
  const ctx = await contextFor(db, b);
  const [offers, events, messages, review] = await Promise.all([
    db.all('SELECT * FROM booking_offers WHERE booking_id = ? ORDER BY version DESC', b.id),
    db.all('SELECT at, actor_type, action, from_status, to_status, note, data FROM booking_events WHERE booking_id = ? ORDER BY id', b.id),
    db.all('SELECT id, sender_type, body, masked, created_at FROM booking_messages WHERE booking_id = ? ORDER BY id LIMIT 500', b.id),
    db.get('SELECT id, rating, body, status, vendor_reply, author_name, created_at FROM reviews WHERE booking_id = ?', b.id)]);
  const timeline = events.filter(e => role === 'admin' || !parseJson(e.data, {}).internal).map(e => ({ at: e.at, actor: e.actor_type, action: e.action, from: e.from_status, to: e.to_status, note: e.note }));
  const extra = { offers: offers.map(offerView), timeline, messages: messages.map(x => ({ id: x.id, from: x.sender_type, body: x.body, masked: !!x.masked, at: x.created_at })), review, actions: actionsFor(b, role, ctx) };
  if (role === 'vendor' || (role === 'admin' && !ctx.vendorOwned)) {
    const rule = ctx.vendor ? await effectiveRule(db, ctx.vendor) : { rate_bps: 0 };
    extra.commissionRateBps = rule.rate_bps;
    extra.termsRequired = role === 'vendor' && ctx.vendor?.terms_version !== await vendorTermsVersion(db);
  }
  return bookingView(b, role, extra);
}

// ---------- actions ----------
async function act(db, b, who, action, body, ctx, req) {
  const allowed = actionsFor(b, who.type === 'admin' ? 'admin' : who.type, ctx);
  if (!allowed.includes(action)) throw HttpError(409, 'This action isn’t available for this booking right now.');
  const note = clean(body.note ?? body.reason, 1000), t = now();
  const needTerms = async () => { if (who.type === 'vendor' && ctx.vendor?.terms_version !== await vendorTermsVersion(db)) throw HttpError(409, 'Please read and accept the current partner terms first (Partner page → Plan & fees).', { code: 'terms_required' }); };
  const suspended = () => { if (ctx.vendor?.status === 'suspended') throw HttpError(409, 'Your listing is suspended. Contact MA3AK.'); };
  switch (action) {
    case 'cancel': {
      await db.tx(async (db) => {
        await transition(db, b, 'cancelled', who, 'cancelled_by_customer', { note, set: { cancelled_at: t, cancel_reason: note, cancel_requested_by: 'customer' } });
        await db.run("UPDATE booking_offers SET status = 'withdrawn' WHERE booking_id = ? AND status = 'sent'", b.id);
      });
      await notifyProvider(db, b, { kind: 'booking', title: `Request ${b.ref} was cancelled by the customer`, body: note, dedupe: `cancel:${b.id}` });
      return;
    }
    case 'accept': case 'reject': case 'revise': {
      const o = ctx.latest; if (!o || o.status !== 'sent' || String(body.offerId || '') !== o.id) throw HttpError(409, 'This offer has changed. Reload the page to see the latest one.');
      if (o.valid_until < today()) { await db.run("UPDATE booking_offers SET status = 'expired' WHERE id = ? AND status = 'sent'", o.id); throw HttpError(409, 'This offer has expired. Ask the provider for a new one.'); }
      if (action === 'accept') {
        if (body.agree !== true) throw HttpError(422, 'Please confirm that you accept the price and terms.', { fields: { agree: 'Required.' } });
        await db.tx(db => agree(db, b, o, who));
        const confirmed = b.status === 'confirmed';
        await notifyProvider(db, b, { kind: 'booking', title: o.kind === 'quote' ? `${b.customer_name} accepted your quote (${b.ref})` : `Change accepted for ${b.ref}`, body: confirmed ? 'The booking is confirmed.' : `Waiting for the deposit of ${format(b.deposit_minor, b.currency)}.`, dedupe: `accept:${o.id}` });
        await notifyCustomer(db, b, { kind: 'booking', title: confirmed ? `Booking ${b.ref} is confirmed` : `Quote accepted — deposit needed for ${b.ref}`, body: confirmed ? `${b.vendor_name} · ${b.event_date}` : `Pay the deposit of ${format(b.deposit_minor, b.currency)} as described in the quote to confirm the booking.`, dedupe: `accepted:${o.id}` });
        return;
      }
      const offerStatus = action === 'reject' ? 'rejected' : 'revision_requested';
      await db.tx(async (db) => {
        await db.run('UPDATE booking_offers SET status = ?, responded_at = ?, response_note = ? WHERE id = ? AND status = ?', offerStatus, t, note, o.id, 'sent');
        if (o.kind === 'quote') await transition(db, b, action === 'reject' ? 'declined' : 'revision_requested', who, action === 'reject' ? 'offer_rejected' : 'revision_requested', { note, data: { offerVersion: o.version } });
        else await logEvent(db, b.id, who, action === 'reject' ? 'amendment_rejected' : 'amendment_revision_requested', b.status, b.status, note, { offerVersion: o.version });
      });
      await notifyProvider(db, b, { kind: 'booking', title: action === 'reject' ? `Offer declined for ${b.ref}` : `Changes requested for ${b.ref}`, body: note, dedupe: `resp:${o.id}` });
      return;
    }
    case 'request_cancel': {
      if (note.length < 3) throw HttpError(422, 'Tell the other side why you need to cancel.', { fields: { reason: 'Required.' } });
      await transition(db, b, 'cancellation_requested', who, 'cancellation_requested', { note, set: { cancel_requested_by: who.type === 'admin' ? 'vendor' : who.type, cancel_reason: note } });
      const n = { kind: 'booking', title: `Cancellation requested for ${b.ref}`, body: `${note}\n\nCancellation terms: ${parseJson(b.agreed_terms, {}).cancellationTerms || 'see the booking'}`, dedupe: `creq:${b.id}:${t}` };
      if (who.type === 'customer') await notifyProvider(db, b, n); else await notifyCustomer(db, b, n);
      return;
    }
    case 'withdraw_cancel': case 'reject_cancel': {
      const prev = (await db.get("SELECT from_status FROM booking_events WHERE booking_id = ? AND to_status = 'cancellation_requested' ORDER BY id DESC LIMIT 1", b.id))?.from_status;
      if (!prev || !TRANSITIONS.cancellation_requested.includes(prev)) throw HttpError(409, 'The previous status couldn’t be found. Contact MA3AK.');
      const by = b.cancel_requested_by;
      await transition(db, b, prev, who, action === 'withdraw_cancel' ? 'cancellation_withdrawn' : 'cancellation_refused', { note, set: { cancel_requested_by: null } });
      const n = { kind: 'booking', title: action === 'withdraw_cancel' ? `Cancellation withdrawn for ${b.ref}` : `Cancellation not accepted for ${b.ref}`, body: note || 'The booking continues as agreed.', dedupe: `cres:${b.id}:${t}` };
      if (action === 'withdraw_cancel' ? who.type === 'customer' : by === 'vendor') await notifyProvider(db, b, n); else await notifyCustomer(db, b, n);
      return;
    }
    case 'approve_cancel': case 'admin_cancel': {
      if (action === 'admin_cancel' && note.length < 3) throw HttpError(422, 'Add a reason (it is shown to both sides).', { fields: { note: 'Required.' } });
      await db.tx(async (db) => {
        await transition(db, b, 'cancelled', who, action === 'admin_cancel' ? 'cancelled_by_admin' : 'cancellation_approved', { note, set: { cancelled_at: t, cancel_reason: action === 'admin_cancel' ? note : b.cancel_reason } });
        await db.run("UPDATE booking_offers SET status = 'withdrawn' WHERE booking_id = ? AND status = 'sent'", b.id);
        await reverseCommission(db, b, 'Booking cancelled'); await releaseDate(db, b);
      });
      const n = { kind: 'booking', title: `Booking ${b.ref} is cancelled`, body: b.payment_status !== 'none' ? 'Any refund follows the cancellation terms you agreed. MA3AK will record it here.' : (note || ''), dedupe: `cancelled:${b.id}` };
      await notifyCustomer(db, b, n); await notifyProvider(db, b, n);
      return;
    }
    case 'decline': {
      await db.tx(async (db) => {
        await transition(db, b, 'declined', who, 'declined_by_vendor', { note });
        await db.run("UPDATE booking_offers SET status = 'withdrawn' WHERE booking_id = ? AND status = 'sent'", b.id);
      });
      await notifyCustomer(db, b, { kind: 'booking', title: `${b.vendor_name} can’t take request ${b.ref}`, body: note || 'You can send a request to another provider.', dedupe: `declined:${b.id}` });
      return;
    }
    case 'confirm': {
      suspended(); await needTerms();
      const e = b.package_estimate; if (!e) throw HttpError(409, 'This request has no fixed price. Send a quote instead.');
      await db.tx(async (db) => {
        const snap = parseJson(b.package_snapshot, {});
        const o = { kind: 'quote', currency: e.currency, items: [{ label: snap.name || 'Package', quantity: e.quantity, unitMinor: e.unitMinor, totalMinor: e.subtotalMinor }], subtotal: e.subtotalMinor, discount: 0, discountNote: '',
          fees: e.fees || [], feesTotal: e.feesMinor || 0, total: e.totalMinor, deposit: 0, paymentSchedule: `${format(e.totalMinor, e.currency)} at the fixed package price, paid as arranged with the provider.`,
          inclusions: snap.includes || [], exclusions: snap.exclusions || [], cancellationTerms: (await policy(db)).defaultCancellationTerms + (snap.conditions ? `\n${snap.conditions}` : ''), eventDate: b.event_date, validUntil: b.event_date || today(), message: note };
        const { id } = await insertOffer(db, b, o, who);
        await agree(db, b, await db.get('SELECT * FROM booking_offers WHERE id = ?', id), who);
      });
      await notifyCustomer(db, b, { kind: 'booking', title: `Booking ${b.ref} is confirmed`, body: `${b.vendor_name} confirmed your booking at the package price of ${format(b.agreed_total_minor, b.currency)}.`, dedupe: `confirmed:${b.id}` });
      return;
    }
    case 'withdraw_offer': {
      await db.tx(async (db) => {
        await db.run("UPDATE booking_offers SET status = 'withdrawn' WHERE id = ? AND status = 'sent'", ctx.latest.id);
        await transition(db, b, 'quote_requested', who, 'offer_withdrawn', { note });
      });
      await notifyCustomer(db, b, { kind: 'booking', title: `${b.vendor_name} withdrew their quote for ${b.ref}`, body: note || 'They may send a new one.', dedupe: `wd:${ctx.latest.id}` });
      return;
    }
    case 'start': await transition(db, b, 'in_progress', who, 'started'); return;
    case 'complete': case 'admin_complete': {
      await transition(db, b, 'completed', who, action === 'admin_complete' ? 'completed_by_admin' : 'completed', { note, set: { completed_at: t } });
      await notifyCustomer(db, b, { kind: 'review', title: `How was ${b.vendor_name}?`, body: 'Your booking is complete. You can leave a review from the booking page.', dedupe: `done:${b.id}` });
      return;
    }
    case 'note': await db.run('UPDATE bookings SET vendor_note = ?, updated_at = ? WHERE id = ?', clean(body.note, 2000), t, b.id); return;
    case 'dispute': case 'resolve_dispute': {
      await db.run('UPDATE bookings SET disputed = ?, dispute_note = ?, updated_at = ? WHERE id = ?', action === 'dispute' ? 1 : 0, note, t, b.id);
      await logEvent(db, b.id, who, action === 'dispute' ? 'dispute_opened' : 'dispute_resolved', b.status, b.status, note, { internal: true });
      return;
    }
    case 'report_payment': case 'record_payment': return recordPayment(db, b, who, body);
    default: throw HttpError(422, 'Unknown action.');
  }
}

// Payments are recorded, never simulated: an admin records money received offline, or the provider reports a
// deposit they received directly. Each record needs a unique key so a double click can't record it twice.
async function recordPayment(db, b, who, body) {
  const kinds = who.type === 'admin' ? ['deposit', 'balance', 'full', 'refund'] : ['deposit', 'balance', 'full'];
  const kind = kinds.includes(body.kind) ? body.kind : null; if (!kind) throw HttpError(422, 'Choose what the payment is for.', { fields: { kind: 'Required.' } });
  const amount = toMinor(body.amount, b.currency); if (!Number.isInteger(amount) || amount <= 0) throw HttpError(422, `Enter the amount in ${b.currency}.`, { fields: { amount: 'Invalid.' } });
  const key = String(body.idempotencyKey || ''); if (!/^[\w-]{8,80}$/.test(key)) throw HttpError(422, 'Missing request key. Reload the page and try again.');
  if (await db.get('SELECT 1 FROM payments WHERE idempotency_key = ?', key)) return { duplicate: true }; // already recorded (double click, retry)
  const method = who.type === 'admin' ? (['offline_cash', 'offline_transfer', 'offline_other'].includes(body.method) ? body.method : null) : 'offline_other';
  if (!method) throw HttpError(422, 'Choose how it was paid.', { fields: { method: 'Required.' } });
  const p = await paidSoFar(db, b);
  if (kind === 'refund' && amount > p.net) throw HttpError(422, `The refund can’t be more than what was paid (${format(p.net, b.currency)}).`);
  if (kind !== 'refund' && p.net + amount > (b.agreed_total_minor || 0)) throw HttpError(422, `That would be more than the agreed total of ${format(b.agreed_total_minor, b.currency)}.`);
  let dup = false;
  await db.tx(async (db) => {
    const row = await db.get(`INSERT INTO payments (id, booking_id, kind, amount_minor, currency, method, idempotency_key, status, note, recorded_by, created_at) VALUES (?,?,?,?,?,?,?,'succeeded',?,?,?)
      ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`, uid(), b.id, kind, amount, b.currency, method, key, clean(body.note, 300) || (who.type === 'vendor' ? 'Reported by the provider' : ''), who.type === 'admin' ? who.id : null, now());
    if (!row) { dup = true; return; }
    await logEvent(db, b.id, who, kind === 'refund' ? 'refund_recorded' : 'payment_recorded', b.status, b.status, '', { kind, amountMinor: amount, currency: b.currency, method });
    await refreshPaymentStatus(db, b);
    await confirmIfPaid(db, b);
  });
  if (dup) return { duplicate: true };
  const title = kind === 'refund' ? `Refund of ${format(amount, b.currency)} recorded for ${b.ref}` : `Payment of ${format(amount, b.currency)} recorded for ${b.ref}`;
  await notifyCustomer(db, b, { kind: 'payment', title, body: b.status === 'confirmed' ? 'Your booking is confirmed.' : '', dedupe: `pay:${key}` });
  await notifyProvider(db, b, { kind: 'payment', title, body: '', dedupe: `pay:${key}` });
  if (who.type === 'admin') await audit(db, who.session, kind === 'refund' ? 'refund_recorded' : 'payment_recorded', b.ref, format(amount, b.currency));
}

// ---------- background jobs (daily clean-up) ----------
export async function expireDue(db) {
  const t = today(); let n = 0;
  for (const o of await db.all("SELECT id, booking_id, kind FROM booking_offers WHERE status = 'sent' AND valid_until < ?", t)) {
    await db.run("UPDATE booking_offers SET status = 'expired' WHERE id = ? AND status = 'sent'", o.id);
    const b = await db.get('SELECT * FROM bookings WHERE id = ?', o.booking_id);
    if (o.kind === 'quote' && b?.status === 'quote_received') {
      await transition(db, b, 'expired', { type: 'system' }, 'offer_expired').catch(() => {}); n++;
      await notifyCustomer(db, b, { kind: 'booking', title: `The quote for ${b.ref} expired`, body: 'You can send a new request.', dedupe: `exp:${o.id}` });
      await notifyProvider(db, b, { kind: 'booking', title: `Your quote for ${b.ref} expired`, body: 'The customer didn’t answer in time.', dedupe: `exp:${o.id}` });
    }
  }
  for (const b of await db.all("SELECT * FROM bookings WHERE status IN ('quote_requested','revision_requested','awaiting_vendor','quote_received') AND event_date < ?", t)) {
    await transition(db, b, 'expired', { type: 'system' }, 'event_date_passed').catch(() => {}); n++;
  }
  return n;
}
export async function sendReminders(db) {
  const day = addDays(today(), 2); let n = 0;
  for (const b of await db.all("SELECT * FROM bookings WHERE status = 'confirmed' AND event_date = ?", day)) {
    const r = { kind: 'reminder', title: `Reminder: ${b.ref} is in two days`, body: `${b.vendor_name} · ${b.event_date}${b.event_time ? ' at ' + b.event_time : ''}`, dedupe: `remind:${b.id}` };
    await notifyCustomer(db, b, r); await notifyProvider(db, b, r); n++;
  }
  return n;
}

// ---------- routes ----------
const csvCell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
async function body(req, res, size = 32e3) { if (!originAllowed(req)) { fail(res, 403, 'Request blocked.'); return null; } try { return await readJson(req, size); } catch (e) { fail(res, e.status || 400, e.message); return null; } }
const handleErr = (res, e) => { if (e.status) return fail(res, e.status, e.message, e.extra); throw e; };
const listRow = (r, role) => ({ id: r.id, ref: r.ref, status: r.status, paymentStatus: r.payment_status, vendor: { id: r.vendor_id, name: r.vendor_name }, category: r.category, packageName: parseJson(r.package_snapshot, {}).name || null,
  customerName: r.customer_name, eventType: r.event_type, eventDate: r.event_date, guests: r.guests, currency: r.currency, estimateMinor: r.estimate_minor, agreedTotalMinor: r.agreed_total_minor,
  latestOffer: r.offer_total_minor != null ? { totalMinor: r.offer_total_minor, currency: r.offer_currency, status: r.offer_status, validUntil: r.offer_valid_until } : null, unread: r.unread || 0, disputed: role === 'admin' ? !!r.disputed : undefined, createdAt: r.created_at, updatedAt: r.updated_at });
const LATEST = `LEFT JOIN LATERAL (SELECT total_minor AS offer_total_minor, currency AS offer_currency, status AS offer_status, valid_until AS offer_valid_until FROM booking_offers o WHERE o.booking_id = b.id ORDER BY version DESC LIMIT 1) lo ON TRUE`;

export function bookingRoutes(db, guard, partner) {
  // Who is asking about this booking: the customer, the provider, or nobody (404 either way, so ids can't be probed).
  async function party(req, res, id, write = false) {
    const u = await requireUser(req, res, db, { write }); if (!u) return null;
    const b = await db.get('SELECT * FROM bookings WHERE id = ?', String(id));
    if (b && b.user_id === u.id) return { u, b, who: { type: 'customer', id: u.id } };
    if (b && u.role === 'partner' && b.vendor_id) { const v = await db.get('SELECT id FROM vendors WHERE id = ? AND owner_user_id = ?', b.vendor_id, u.id); if (v) return { u, b, who: { type: 'vendor', id: u.id } }; }
    fail(res, 404, 'Booking not found.'); return null;
  }
  return {
    // Check the form and show the customer exactly what they're about to send (price type, estimate, fees).
    'POST /api/bookings/preview': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res); if (!b) return;
      const r = await bookingFrom(db, u, b); if (r.error) return fail(res, r.status, r.error, { fields: r.fields, code: r.code });
      sendJson(res, 200, { ok: true, vendor: { id: r.vendor.id, name: r.vendor.name, category: r.vendor.category }, package: r.snapshot, estimate: r.estimate, willBe: r.status, value: r.value });
    },
    'POST /api/bookings': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return;
      if (integrations().email.configured && !u.email_verified) return fail(res, 403, 'Please confirm your email address first. We sent you a link when you signed up — you can ask for a new one from your account page.', { code: 'verify_email' });
      const b = await body(req, res); if (!b) return;
      if (b.confirm !== true) return fail(res, 422, 'Please review your request and confirm it.', { fields: { confirm: 'Required.' } });
      const r = await bookingFrom(db, u, b); if (r.error) return fail(res, r.status, r.error, { fields: r.fields, code: r.code });
      const dup = await db.get(`SELECT ref FROM bookings WHERE user_id = ? AND vendor_id = ? AND event_date = ? AND status IN ('quote_requested','quote_received','revision_requested','awaiting_vendor','awaiting_payment','confirmed')`, u.id, r.vendor.id, r.value.date);
      if (dup) return fail(res, 409, `You already have an open request with this provider for this date (${dup.ref}).`, { code: 'duplicate', ref: dup.ref });
      if (!(await rateLimit(`book:${u.id}`, 10, 3600e3)).ok) return fail(res, 429, 'You’ve sent a lot of requests. Please wait an hour.');
      const v = r.value, id = uid(), ref = newRef('B'), t = now();
      const ev = b.eventId ? await db.get('SELECT id FROM events WHERE id = ? AND user_id = ?', String(b.eventId), u.id) : null;
      await db.tx(async (db) => {
        await db.run(`INSERT INTO bookings (id, ref, user_id, vendor_id, vendor_name, package_id, package_snapshot, event_id, category, customer_name, customer_email, customer_phone, event_type, event_date, event_time, location, address,
          guests, quantity, details, notes, status, currency, estimate_minor, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          id, ref, u.id, r.vendor.id, r.vendor.name, r.pkg?.id || null, JSON.stringify(r.snapshot), ev?.id || null, r.vendor.category, v.name, v.email, v.phone, v.eventType, v.date, v.time, v.location, v.address,
          v.guests, v.quantity, JSON.stringify(v.details), v.notes, r.status, r.currency, r.estimate?.subtotalMinor ?? null, t, t);
        await logEvent(db, id, { type: 'customer', id: u.id }, 'requested', null, r.status, '', { packageId: r.pkg?.id || null, estimateMinor: r.estimate?.subtotalMinor ?? null });
        if (ev) await db.run('UPDATE event_services SET booking_id = ? WHERE event_id = ? AND vendor_id = ? AND booking_id IS NULL', id, ev.id, r.vendor.id);
        if (!u.phone) await db.run('UPDATE users SET phone = ? WHERE id = ?', v.phone, u.id);
      });
      const bk = { id, ref, user_id: u.id, vendor_id: r.vendor.id };
      await notifyProvider(db, bk, { kind: 'booking', title: `New booking request ${ref}`, body: `${v.eventType} · ${v.date}${v.guests ? ` · ${v.guests} guests` : ''}${r.pkg ? ` · ${r.pkg.name}` : ''}. ${r.status === 'awaiting_vendor' ? 'Fixed-price package: confirm or decline.' : 'Send a quote or decline.'}`, dedupe: `new:${id}` });
      await notifyCustomer(db, bk, { kind: 'booking', title: `Request ${ref} sent to ${r.vendor.name}`, body: 'This is a request, not a confirmed booking. The provider will reply with a quote or a confirmation.', dedupe: `sent:${id}` });
      sendJson(res, 201, { ok: true, id, ref, bookingStatus: r.status });
    },
    'GET /api/my/bookings': async (req, res) => {
      const u = await requireUser(req, res, db); if (!u) return;
      const rows = await db.all(`SELECT b.*, lo.*, (SELECT COUNT(*) FROM booking_messages m WHERE m.booking_id = b.id AND m.sender_type <> 'customer' AND m.read_by_customer_at IS NULL) AS unread
        FROM bookings b ${LATEST} WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 200`, u.id);
      sendJson(res, 200, { ok: true, bookings: rows.map(r => listRow(r, 'customer')) });
    },
    'GET /api/bookings/:id': async (req, res, _db, url, id) => {
      const p = await party(req, res, id); if (!p) return;
      await db.run(`UPDATE booking_messages SET ${p.who.type === 'customer' ? 'read_by_customer_at' : 'read_by_vendor_at'} = ? WHERE booking_id = ? AND sender_type <> ? AND ${p.who.type === 'customer' ? 'read_by_customer_at' : 'read_by_vendor_at'} IS NULL`, now(), p.b.id, p.who.type);
      sendJson(res, 200, { ok: true, role: p.who.type, booking: await fullView(db, p.b, p.who.type) });
    },
    'POST /api/bookings/:id/action': async (req, res, _db, url, id) => {
      const p = await party(req, res, id, true); if (!p) return; const b = await body(req, res); if (!b) return;
      if (!(await rateLimit(`bact:${p.u.id}`, 60, 3600e3)).ok) return fail(res, 429, 'Too many changes. Please wait a little.');
      try { const ctx = await contextFor(db, p.b); const r = await act(db, p.b, p.who, String(b.action || ''), b, ctx, req); if (r?.duplicate) return sendJson(res, 200, { ok: true, duplicate: true }); }
      catch (e) { return handleErr(res, e); }
      sendJson(res, 200, { ok: true, role: p.who.type, booking: await fullView(db, await db.get('SELECT * FROM bookings WHERE id = ?', p.b.id), p.who.type) });
    },
    // Provider sends a quote (or a revised quote), or a change to an agreed booking (amendment).
    'POST /api/bookings/:id/offers': async (req, res, _db, url, id) => {
      const p = await party(req, res, id, true); if (!p) return; if (p.who.type !== 'vendor') return fail(res, 403, 'Only the provider can send a quote.');
      const b = await body(req, res, 64e3); if (!b) return;
      return sendOffer(req, res, p.b, p.who, b);
    },
    'POST /api/bookings/:id/messages': async (req, res, _db, url, id) => {
      const p = await party(req, res, id, true); if (!p) return; const b = await body(req, res, 8192); if (!b) return;
      return postMessage(res, p.b, p.who, b);
    },
    'POST /api/bookings/:id/review': async (req, res, _db, url, id) => {
      const p = await party(req, res, id, true); if (!p) return; if (p.who.type !== 'customer') return fail(res, 403, 'Only the customer can review a booking.');
      const b = await body(req, res, 8192); if (!b) return;
      const ctx = await contextFor(db, p.b); if (!actionsFor(p.b, 'customer', ctx).includes('review')) return fail(res, 409, 'Reviews open once the booking is completed, and each booking can be reviewed once.');
      const rating = Number(b.rating); if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail(res, 422, 'Choose 1 to 5 stars.', { fields: { rating: 'Required.' } });
      const text = clean(b.body, 2000), parts = p.b.customer_name.split(/\s+/).filter(Boolean), author = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : (parts[0] || 'Customer');
      try { await db.run('INSERT INTO reviews (id, booking_id, vendor_id, user_id, author_name, rating, body, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)', uid(), p.b.id, p.b.vendor_id, p.u.id, author, rating, text, now(), now()); }
      catch (e) { if (e.code === '23505') return fail(res, 409, 'You already reviewed this booking.'); throw e; }
      await notifyProvider(db, p.b, { kind: 'review', title: `New ${rating}-star review`, body: text.slice(0, 200), dedupe: `review:${p.b.id}` });
      sendJson(res, 201, { ok: true });
    },
    // Report a message, review, provider or booking to MA3AK.
    'POST /api/reports': async (req, res) => {
      const u = await requireUser(req, res, db, { write: true }); if (!u) return; const b = await body(req, res, 8192); if (!b) return;
      if (!(await rateLimit(`report:${u.id}`, 10, 864e5)).ok) return fail(res, 429, 'You’ve sent several reports today. MA3AK will look at them.');
      const type = ['message', 'review', 'vendor', 'booking'].includes(b.targetType) ? b.targetType : null, tid = clean(b.targetId, 80), reason = clean(b.reason, 200);
      if (!type || !tid) return fail(res, 422, 'Nothing to report.'); if (reason.length < 3) return fail(res, 422, 'Say what’s wrong.', { fields: { reason: 'Required.' } });
      const mine = async bid => { const bk = await db.get('SELECT user_id, vendor_id FROM bookings WHERE id = ?', bid); if (!bk) return false; if (bk.user_id === u.id) return true; return !!(u.role === 'partner' && await db.get('SELECT 1 FROM vendors WHERE id = ? AND owner_user_id = ?', bk.vendor_id, u.id)); };
      let ok = false;
      if (type === 'message') { const m = await db.get('SELECT booking_id FROM booking_messages WHERE id = ?', Number(tid) || 0); ok = !!m && await mine(m.booking_id); }
      else if (type === 'booking') ok = await mine(tid);
      else if (type === 'review') ok = !!(await db.get("SELECT 1 FROM reviews WHERE id = ? AND status = 'published'", tid));
      else ok = !!(await db.get(`SELECT 1 FROM vendors v WHERE v.id = ? AND ${PUBLIC}`, tid));
      if (!ok) return fail(res, 404, 'Not found.');
      await db.run('INSERT INTO reports (reporter_type, reporter_id, target_type, target_id, reason, details, created_at) VALUES (?,?,?,?,?,?,?)', u.role === 'partner' ? 'vendor' : 'customer', u.id, type, tid, reason, clean(b.details, 2000), now());
      if (config.notifyEmail) await notifyVendor(db, { name: 'Report' }, { title: `New report: ${type}`, body: reason }).catch(() => {});
      sendJson(res, 201, { ok: true });
    },
    'GET /api/vendors/:id/reviews': async (req, res, _db, url, id) => {
      const v = await db.get(`SELECT v.id FROM vendors v WHERE v.id = ? AND ${PUBLIC}`, String(id)); if (!v) return fail(res, 404, 'This provider isn’t listed.');
      const rows = await db.all("SELECT id, author_name, rating, body, vendor_reply, created_at FROM reviews WHERE vendor_id = ? AND status = 'published' ORDER BY created_at DESC LIMIT 100", v.id);
      sendJson(res, 200, { ok: true, reviews: rows.map(r => ({ id: r.id, author: r.author_name, rating: r.rating, body: r.body, reply: r.vendor_reply, date: r.created_at.slice(0, 10), verifiedBooking: true })) });
    },

    // ---------- partner ----------
    'GET /api/partner/bookings': async (req, res, _db, url) => {
      const p = await partner(req, res); if (!p) return;
      const st = url.searchParams.get('status');
      const rows = await db.all(`SELECT b.*, lo.*, (SELECT COUNT(*) FROM booking_messages m WHERE m.booking_id = b.id AND m.sender_type <> 'vendor' AND m.read_by_vendor_at IS NULL) AS unread
        FROM bookings b ${LATEST} WHERE b.vendor_id = ? ${STATUSES.includes(st) ? 'AND b.status = ?' : ''} ORDER BY b.created_at DESC LIMIT 300`, p.v.id, ...(STATUSES.includes(st) ? [st] : []));
      sendJson(res, 200, { ok: true, bookings: rows.map(r => listRow(r, 'vendor')) });
    },
    // Lead tools (Ma3ak Pro): spreadsheet export. Contact details only for confirmed bookings.
    'GET /api/partner/bookings.csv': async (req, res) => {
      const p = await partner(req, res); if (!p) return;
      if (!(await vendorPlan(db, p.v.id)).entitlements.leadTools) return fail(res, 403, 'Exporting bookings is part of Ma3ak Pro.', { code: 'pro_required' });
      const rows = await db.all('SELECT * FROM bookings WHERE vendor_id = ? ORDER BY created_at DESC LIMIT 5000', p.v.id);
      const head = ['Reference', 'Status', 'Payment', 'Event type', 'Event date', 'Guests', 'Customer', 'Email', 'Phone', 'Currency', 'Agreed total', 'Commission', 'Your note', 'Created'];
      const lines = [head.map(csvCell).join(','), ...rows.map(b => { const show = contactVisible(b); return [b.ref, b.status, b.payment_status, b.event_type, b.event_date, b.guests, b.customer_name, show ? b.customer_email : '', show ? b.customer_phone : '', b.currency,
        b.agreed_total_minor == null ? '' : format(b.agreed_total_minor, b.currency), b.commission_minor == null ? '' : format(b.commission_minor, b.currency), b.vendor_note, b.created_at.slice(0, 10)].map(csvCell).join(','); })];
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="ma3ak-bookings.csv"', 'Cache-Control': 'no-store' });
      res.end('﻿' + lines.join('\r\n'));
    },
    'POST /api/partner/reviews/:id/reply': async (req, res, _db, url, id) => {
      const p = await partner(req, res, true); if (!p) return; const b = await body(req, res, 4096); if (!b) return;
      const r = await db.run('UPDATE reviews SET vendor_reply = ?, updated_at = ? WHERE id = ? AND vendor_id = ?', clean(b.reply, 1000), now(), String(id), p.v.id);
      if (!r.changes) return fail(res, 404, 'Review not found.'); sendJson(res, 200, { ok: true });
    },
    'GET /api/partner/reviews': async (req, res) => {
      const p = await partner(req, res); if (!p) return;
      sendJson(res, 200, { ok: true, reviews: await db.all('SELECT r.id, r.author_name, r.rating, r.body, r.status, r.vendor_reply, r.created_at, b.ref FROM reviews r JOIN bookings b ON b.id = r.booking_id WHERE r.vendor_id = ? ORDER BY r.created_at DESC LIMIT 200', p.v.id) });
    },

    // ---------- admin ----------
    'GET /api/admin/bookings': async (req, res, _db, url) => {
      if (!await guard(req, res)) return;
      const st = url.searchParams.get('status'), q = clean(url.searchParams.get('q'), 80), where = [], args = [];
      if (STATUSES.includes(st)) { where.push('b.status = ?'); args.push(st); }
      if (url.searchParams.get('disputed') === '1') where.push('b.disputed = 1');
      if (q) { const l = `%${q.replace(/[%_\\]/g, m => '\\' + m)}%`; where.push('(b.ref ILIKE ? OR b.vendor_name ILIKE ? OR b.customer_name ILIKE ? OR b.customer_email ILIKE ?)'); args.push(l, l, l, l); }
      const rows = await db.all(`SELECT b.*, lo.* FROM bookings b ${LATEST} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY b.updated_at DESC LIMIT 300`, ...args);
      const counts = await db.all('SELECT status, COUNT(*) AS n FROM bookings GROUP BY status');
      sendJson(res, 200, { ok: true, bookings: rows.map(r => listRow(r, 'admin')), counts: Object.fromEntries(counts.map(c => [c.status, c.n])), statuses: STATUSES });
    },
    'GET /api/admin/bookings/:id': async (req, res, _db, url, id) => {
      if (!await guard(req, res)) return;
      const b = await db.get('SELECT * FROM bookings WHERE id = ?', String(id)); if (!b) return fail(res, 404, 'Not found.');
      const [payments, commissions] = await Promise.all([db.all('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at', b.id), db.all('SELECT * FROM commissions WHERE booking_id = ? ORDER BY id', b.id)]);
      sendJson(res, 200, { ok: true, booking: { ...(await fullView(db, b, 'admin')), customer: { name: b.customer_name, email: b.customer_email, phone: b.customer_phone }, address: b.address, notes: b.notes, payments, commissions } });
    },
    'POST /api/admin/bookings/:id/action': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 16e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const bk = await db.get('SELECT * FROM bookings WHERE id = ?', String(id)); if (!bk) return fail(res, 404, 'Not found.');
      const who = { type: 'admin', id: s.admin_id, session: s };
      try { const ctx = await contextFor(db, bk); const r = await act(db, bk, who, String(b.action || ''), b, ctx, req); if (r?.duplicate) return sendJson(res, 200, { ok: true, duplicate: true }); }
      catch (e) { return handleErr(res, e); }
      await audit(db, s, `booking_${b.action}`, bk.ref, clean(b.note, 200) || null);
      sendJson(res, 200, { ok: true });
    },
    // MA3AK-managed listings (no partner account): the team quotes on the provider's behalf.
    'POST /api/admin/bookings/:id/offers': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 64e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const bk = await db.get('SELECT * FROM bookings WHERE id = ?', String(id)); if (!bk) return fail(res, 404, 'Not found.');
      const v = bk.vendor_id ? await db.get('SELECT owner_user_id FROM vendors WHERE id = ?', bk.vendor_id) : null;
      if (v?.owner_user_id) return fail(res, 409, 'This provider manages their own quotes.');
      await audit(db, s, 'booking_offer_sent', bk.ref);
      return sendOffer(req, res, bk, { type: 'admin', id: s.admin_id, session: s }, b);
    },
    'POST /api/admin/bookings/:id/messages': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 8192); } catch (e) { return fail(res, e.status || 400, e.message); }
      const bk = await db.get('SELECT * FROM bookings WHERE id = ?', String(id)); if (!bk) return fail(res, 404, 'Not found.');
      return postMessage(res, bk, { type: 'admin', id: s.admin_id }, b);
    },
    'GET /api/admin/reviews': async (req, res) => {
      if (!await guard(req, res)) return;
      sendJson(res, 200, { ok: true, reviews: await db.all('SELECT r.*, b.ref, v.name AS vendor_name FROM reviews r JOIN bookings b ON b.id = r.booking_id LEFT JOIN vendors v ON v.id = r.vendor_id ORDER BY r.created_at DESC LIMIT 300') });
    },
    'POST /api/admin/reviews/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!['published', 'hidden'].includes(b.status)) return fail(res, 422, 'Choose published or hidden.');
      const r = await db.run('UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?', b.status, now(), String(id)); if (!r.changes) return fail(res, 404, 'Not found.');
      await audit(db, s, `review_${b.status}`, id, clean(b.note, 200) || null); sendJson(res, 200, { ok: true });
    },
    'GET /api/admin/reports': async (req, res, _db, url) => {
      if (!await guard(req, res)) return; const st = url.searchParams.get('status') || 'open';
      sendJson(res, 200, { ok: true, reports: await db.all('SELECT * FROM reports WHERE status = ? ORDER BY id DESC LIMIT 300', ['open', 'resolved', 'dismissed'].includes(st) ? st : 'open') });
    },
    'GET /api/admin/reports/:id/target': async (req, res, _db, url, id) => {
      if (!await guard(req, res)) return;
      const r = await db.get('SELECT * FROM reports WHERE id = ?', Number(id) || 0); if (!r) return fail(res, 404, 'Not found.');
      let target = null;
      if (r.target_type === 'message') target = await db.get('SELECT m.id, m.body, m.sender_type, m.created_at, b.ref, b.id AS booking_id FROM booking_messages m JOIN bookings b ON b.id = m.booking_id WHERE m.id = ?', Number(r.target_id) || 0);
      else if (r.target_type === 'review') target = await db.get('SELECT id, rating, body, status, vendor_id FROM reviews WHERE id = ?', r.target_id);
      else if (r.target_type === 'booking') target = await db.get('SELECT id, ref, status, vendor_name FROM bookings WHERE id = ?', r.target_id);
      else target = await db.get('SELECT id, name, status FROM vendors WHERE id = ?', r.target_id);
      sendJson(res, 200, { ok: true, report: r, target });
    },
    'POST /api/admin/reports/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!['resolved', 'dismissed', 'open'].includes(b.status)) return fail(res, 422, 'Choose a status.');
      const r = await db.run('UPDATE reports SET status = ?, resolved_at = ?, resolved_by = ?, resolution_note = ? WHERE id = ?', b.status, b.status === 'open' ? null : now(), s.admin_id, clean(b.note, 1000), Number(id) || 0);
      if (!r.changes) return fail(res, 404, 'Not found.'); await audit(db, s, `report_${b.status}`, id); sendJson(res, 200, { ok: true });
    },
  };

  async function sendOffer(req, res, bk, who, b) {
    const ctx = await contextFor(db, bk), role = who.type === 'admin' ? 'admin' : 'vendor', allowed = actionsFor(bk, role, ctx);
    const kind = AGREED.includes(bk.status) ? 'amendment' : 'quote';
    if (!allowed.includes(kind === 'quote' ? 'send_offer' : 'send_amendment')) return fail(res, 409, kind === 'quote' ? 'A quote can’t be sent at this stage.' : 'A change can’t be proposed at this stage.');
    if (who.type === 'vendor') {
      if (ctx.vendor?.status === 'suspended') return fail(res, 409, 'Your listing is suspended. Contact MA3AK.');
      if (ctx.vendor?.terms_version !== await vendorTermsVersion(db)) return fail(res, 409, 'Please read and accept the current partner terms first (Partner page → Plan & fees).', { code: 'terms_required' });
    }
    const r = await offerFrom(db, b, bk, kind); if (r.error) return fail(res, 422, r.error, { fields: r.fields });
    let version;
    try {
      await db.tx(async (db) => {
        ({ version } = await insertOffer(db, bk, r.value, who));
        if (kind === 'quote') await transition(db, bk, 'quote_received', who, bk.status === 'quote_received' ? 'offer_revised' : 'offer_sent', { data: { offerVersion: version, totalMinor: r.value.total, currency: r.value.currency }, set: { currency: r.value.currency } });
        else await logEvent(db, bk.id, who, 'amendment_proposed', bk.status, bk.status, r.value.message, { offerVersion: version, totalMinor: r.value.total });
      });
    } catch (e) { return handleErr(res, e); }
    await notifyCustomer(db, bk, { kind: 'quote', title: kind === 'quote' ? `${bk.vendor_name} sent a quote for ${bk.ref}` : `${bk.vendor_name} proposed a change to ${bk.ref}`,
      body: `${format(r.value.total, r.value.currency)}${r.value.deposit ? ` · deposit ${format(r.value.deposit, r.value.currency)}` : ''} · valid until ${r.value.validUntil}. Nothing changes until you accept.`, dedupe: `offer:${bk.id}:${version}` });
    sendJson(res, 201, { ok: true, version });
  }
  async function postMessage(res, bk, who, b) {
    const ctx = await contextFor(db, bk);
    if (!actionsFor(bk, who.type === 'admin' ? 'admin' : who.type, ctx).includes('message')) return fail(res, 409, 'Messages are closed for this booking.');
    if (who.type !== 'admin' && !(await rateLimit(`msg:${who.id}`, 40, 600e3)).ok) return fail(res, 429, 'You’re sending messages quickly. Please wait a moment.');
    const text = clean(b.body, 2000); if (!text) return fail(res, 422, 'Write a message.', { fields: { body: 'Required.' } });
    const m = who.type === 'admin' || contactVisible(bk) ? { text, masked: false } : maskContacts(text);
    const t = now(), readCol = who.type === 'customer' ? 'read_by_customer_at' : who.type === 'vendor' ? 'read_by_vendor_at' : null;
    const row = await db.get(`INSERT INTO booking_messages (booking_id, sender_type, sender_id, body, masked, created_at${readCol ? ', ' + readCol : ''}) VALUES (?,?,?,?,?,?${readCol ? ',?' : ''}) RETURNING id`,
      bk.id, who.type, String(who.id ?? ''), m.text, m.masked ? 1 : 0, t, ...(readCol ? [t] : []));
    const n = { kind: 'message', title: `New message about ${bk.ref}`, body: m.text.slice(0, 200), dedupe: `msg:${bk.id}:${who.type}:${t.slice(0, 13)}`, email: true };
    if (who.type !== 'customer') await notifyCustomer(db, bk, n);
    if (who.type !== 'vendor') await notifyProvider(db, bk, n);
    sendJson(res, 201, { ok: true, id: row.id, masked: m.masked, body: m.text });
  }
}
