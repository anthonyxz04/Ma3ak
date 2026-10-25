// Business model: vendor plans (Ma3ak Free / Pro), subscriptions, commission rules and the commission
// ledger, payment records and payouts. Nothing here charges anyone: online billing and payment collection
// need a payment provider, which isn't connected. Payments are recorded manually by an administrator.
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { clean } from './validate.js';
import { audit } from './audit.js';
import { isCurrency, toMinor, percentOf, format } from './money.js';
import { parseJson } from './fields.js';

export const ENTITLEMENT_KEYS = { maxPhotos: 'int', maxPackages: 'int', analytics: 'bool', leadTools: 'bool', featuredEligible: 'bool', portfolioSections: 'bool' };
const FREE_FALLBACK = { maxPhotos: 10, maxPackages: 10, analytics: false, leadTools: false, featuredEligible: false, portfolioSections: false };

export async function vendorPlan(db, vendorId) {
  const sub = await db.get(`SELECT s.*, p.name AS plan_name, p.entitlements FROM vendor_subscriptions s JOIN vendor_plans p ON p.id = s.plan_id
    WHERE s.vendor_id = ? AND s.status IN ('active','comped') AND (s.current_period_end IS NULL OR s.current_period_end >= ?) ORDER BY s.created_at DESC LIMIT 1`, vendorId, now().slice(0, 10));
  if (sub) return { planId: sub.plan_id, name: sub.plan_name, status: sub.status, periodEnd: sub.current_period_end, entitlements: { ...FREE_FALLBACK, ...parseJson(sub.entitlements, {}) } };
  const free = await db.get("SELECT name, entitlements FROM vendor_plans WHERE id = 'free'");
  return { planId: 'free', name: free?.name || 'Ma3ak Free', status: 'free', entitlements: { ...FREE_FALLBACK, ...parseJson(free?.entitlements, {}) } };
}

// The commission rule that applies to a vendor right now: vendor rule, else category rule, else global rule.
export async function effectiveRule(db, vendor) {
  const rows = await db.all(`SELECT * FROM commission_rules WHERE ended_at IS NULL AND (scope = 'global' OR (scope = 'category' AND scope_id = ?) OR (scope = 'vendor' AND scope_id = ?))
    ORDER BY CASE scope WHEN 'vendor' THEN 0 WHEN 'category' THEN 1 ELSE 2 END, id DESC LIMIT 1`, vendor.category, vendor.id);
  return rows[0] || { id: null, scope: 'global', rate_bps: 0 };
}
// Customer-facing fees configured by the admin (none by default). Always disclosed before acceptance.
export const feeRules = async db => { const s = await db.get("SELECT value FROM site_settings WHERE key = 'customerFees'"); const l = parseJson(s?.value, []); return Array.isArray(l) ? l : []; };
export function feesFor(rules, subtotalMinor, currency) {
  const detail = [];
  for (const f of rules) {
    if (f.type === 'percent' && Number.isInteger(f.bps) && f.bps > 0) detail.push({ label: f.label, amountMinor: percentOf(Math.max(0, subtotalMinor), f.bps), basis: `${f.bps / 100}%` });
    else if (f.type === 'flat' && f.currency === currency && Number.isInteger(f.amountMinor) && f.amountMinor > 0) detail.push({ label: f.label, amountMinor: f.amountMinor, basis: 'flat' });
  }
  return { total: detail.reduce((s, d) => s + d.amountMinor, 0), detail };
}
export const customerFees = async (db, subtotalMinor, currency) => feesFor(await feeRules(db), subtotalMinor, currency);

// Record the commission when a booking's price is agreed. The rate is fixed at the first agreement: a later
// change to the price (an accepted amendment) recalculates the amount at the same rate, and rule changes made
// afterwards never touch existing bookings. The previous ledger line is reversed, never edited.
export async function snapshotCommission(db, booking, vendor) {
  const rule = booking.commission_rate_bps != null ? { id: booking.commission_rule_id, rate_bps: booking.commission_rate_bps, scope: 'booking' } : await effectiveRule(db, vendor);
  const base = (booking.agreed_subtotal_minor || 0) - (booking.agreed_discount_minor || 0), amount = percentOf(Math.max(0, base), rule.rate_bps), t = now();
  await db.run("UPDATE commissions SET status = 'reversed', note = 'Replaced after a change to the agreed price', updated_at = ? WHERE booking_id = ? AND status = 'accrued'", t, booking.id);
  await db.run('INSERT INTO commissions (booking_id, vendor_id, base_minor, rate_bps, amount_minor, currency, status, note, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    booking.id, vendor.id, base, rule.rate_bps, amount, booking.currency, 'accrued', rule.id ? `Rule #${rule.id}` : 'No rule (0%)', t, t);
  await db.run('UPDATE bookings SET commission_rule_id = ?, commission_rate_bps = ?, commission_minor = ? WHERE id = ?', rule.id, rule.rate_bps, amount, booking.id);
  Object.assign(booking, { commission_rule_id: rule.id, commission_rate_bps: rule.rate_bps, commission_minor: amount });
  return { rate: rule.rate_bps, amount };
}

// Payment status from the recorded payments (succeeded only).
export async function refreshPaymentStatus(db, booking) {
  const rows = await db.all("SELECT kind, amount_minor FROM payments WHERE booking_id = ? AND status = 'succeeded'", booking.id);
  const paid = rows.filter(r => r.kind !== 'refund').reduce((s, r) => s + r.amount_minor, 0), refunded = rows.filter(r => r.kind === 'refund').reduce((s, r) => s + r.amount_minor, 0);
  const total = booking.agreed_total_minor || 0, deposit = booking.deposit_minor || 0;
  let st = 'none';
  if (refunded > 0) st = refunded >= paid ? 'refunded' : 'partially_refunded';
  else if (paid > 0 && total && paid >= total) st = 'paid';
  else if (paid > 0 && paid >= deposit) st = 'deposit_paid';
  else if (paid > 0) st = 'pending';
  else if (booking.status === 'awaiting_payment') st = 'pending';
  await db.run('UPDATE bookings SET payment_status = ?, updated_at = ? WHERE id = ?', st, now(), booking.id);
  return { paid, refunded, status: st };
}

const entitlementsFrom = b => { const out = {}; for (const [k, t] of Object.entries(ENTITLEMENT_KEYS)) { const v = b?.[k]; if (t === 'int') { const n = Number(v); if (Number.isInteger(n) && n >= 0 && n <= 1000) out[k] = n; } else out[k] = v === true; } return out; };

export function billingRoutes(db, guard, partner) {
  return {
    // ----- partner -----
    'GET /api/partner/plan': async (req, res) => {
      const p = await partner(req, res); if (!p) return;
      const [plans, current, rule, subs, terms] = await Promise.all([db.all('SELECT id, name, price_minor, currency, billing_interval, entitlements, description FROM vendor_plans WHERE active = 1 ORDER BY sort'),
        vendorPlan(db, p.v.id), effectiveRule(db, p.v), db.all('SELECT id, plan_id, status, price_minor, currency, billing_interval, started_at, current_period_end, note, created_at FROM vendor_subscriptions WHERE vendor_id = ? ORDER BY created_at DESC LIMIT 20', p.v.id),
        db.get("SELECT value FROM site_settings WHERE key = 'vendorTerms'")]);
      const t = parseJson(terms?.value, {});
      sendJson(res, 200, { ok: true, plans: plans.map(x => ({ ...x, entitlements: parseJson(x.entitlements, {}) })), current, subscriptions: subs,
        commission: { rateBps: rule.rate_bps, scope: rule.scope }, terms: { version: t.version, text: t.text, acceptedVersion: p.v.terms_version, acceptedAt: p.v.terms_accepted_at }, billingAvailable: false });
    },
    // Asks MA3AK to switch the listing to a paid plan. Nothing is charged: billing isn't connected yet.
    'POST /api/partner/plan/request': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return; let b; try { b = await readJson(req, 2048); } catch (e) { return fail(res, e.status || 400, e.message); }
      const plan = await db.get('SELECT * FROM vendor_plans WHERE id = ? AND active = 1 AND price_minor > 0', String(b.planId || '')); if (!plan) return fail(res, 404, 'Plan not found.');
      if (await db.get("SELECT 1 FROM vendor_subscriptions WHERE vendor_id = ? AND status IN ('requested','active','comped') AND plan_id = ?", p.v.id, plan.id)) return fail(res, 409, 'You already have this plan or a pending request for it.');
      const t = now();
      await db.run("INSERT INTO vendor_subscriptions (id, vendor_id, plan_id, status, price_minor, currency, billing_interval, provider, note, created_at, updated_at) VALUES (?,?,?,'requested',?,?,?,'none',?,?,?)",
        uid(), p.v.id, plan.id, plan.price_minor, plan.currency, plan.billing_interval, 'Requested from the partner page; online billing not connected', t, t);
      await audit(db, { actor: `partner:${p.u.email}` }, 'plan_requested', p.v.id, plan.id);
      sendJson(res, 201, { ok: true });
    },
    'POST /api/partner/plan/cancel': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return;
      const r = await db.run("UPDATE vendor_subscriptions SET status = 'cancelled', updated_at = ? WHERE vendor_id = ? AND status = 'requested'", now(), p.v.id);
      const active = await db.run("UPDATE vendor_subscriptions SET cancel_at_period_end = 1, updated_at = ? WHERE vendor_id = ? AND status IN ('active','comped')", now(), p.v.id);
      await audit(db, { actor: `partner:${p.u.email}` }, 'plan_cancel_requested', p.v.id);
      sendJson(res, 200, { ok: true, cancelledRequests: r.changes, endsAtPeriodEnd: active.changes > 0 });
    },
    'POST /api/partner/terms/accept': async (req, res) => {
      const p = await partner(req, res, true); if (!p) return; let b; try { b = await readJson(req, 2048); } catch (e) { return fail(res, e.status || 400, e.message); }
      const t = parseJson((await db.get("SELECT value FROM site_settings WHERE key = 'vendorTerms'"))?.value, {});
      if (!t.version || b.version !== t.version) return fail(res, 409, 'The terms have changed. Reload the page and read the latest version.');
      await db.run('UPDATE vendors SET terms_version = ?, terms_accepted_at = ?, updated_at = ? WHERE id = ?', t.version, now(), now(), p.v.id);
      await audit(db, { actor: `partner:${p.u.email}` }, 'vendor_terms_accepted', p.v.id, t.version);
      sendJson(res, 200, { ok: true });
    },

    // ----- admin: plans and subscriptions -----
    'GET /api/admin/plans': async (req, res) => {
      if (!await guard(req, res)) return;
      const [plans, subs] = await Promise.all([db.all('SELECT * FROM vendor_plans ORDER BY sort'), db.all(`SELECT s.*, v.name AS vendor_name FROM vendor_subscriptions s JOIN vendors v ON v.id = s.vendor_id ORDER BY s.updated_at DESC LIMIT 300`)]);
      sendJson(res, 200, { ok: true, plans: plans.map(p => ({ ...p, entitlements: parseJson(p.entitlements, {}) })), subscriptions: subs, keys: ENTITLEMENT_KEYS, billingAvailable: false });
    },
    'PUT /api/admin/plans/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 16e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const prev = await db.get('SELECT * FROM vendor_plans WHERE id = ?', String(id)); if (!prev) return fail(res, 404, 'Plan not found.');
      const currency = isCurrency(b.currency) ? b.currency : prev.currency, price = toMinor(b.price ?? '', currency);
      if (!Number.isInteger(price)) return fail(res, 422, 'Enter the price, e.g. 39.99.', { fields: { price: 'Invalid.' } });
      if (id === 'free' && price !== 0) return fail(res, 422, 'The Free plan must stay free.');
      const name = clean(b.name, 60) || prev.name, ent = { ...parseJson(prev.entitlements, {}), ...entitlementsFrom(b.entitlements) };
      await db.run('UPDATE vendor_plans SET name = ?, price_minor = ?, currency = ?, billing_interval = ?, entitlements = ?, description = ?, active = ?, updated_at = ?, updated_by = ? WHERE id = ?',
        name, price, currency, b.interval === 'year' ? 'year' : 'month', JSON.stringify(ent), clean(b.description, 1000), b.active === false && id !== 'free' ? 0 : 1, now(), s.admin_id, prev.id);
      await audit(db, s, 'plan_updated', prev.id, `${format(prev.price_minor, prev.currency)} → ${format(price, currency)}; ${JSON.stringify(ent)}`);
      sendJson(res, 200, { ok: true });
    },
    // Manual subscription changes (until online billing exists): activate after an offline payment, comp, or cancel.
    'POST /api/admin/vendors/:id/subscription': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      const v = await db.get('SELECT id, name, owner_user_id FROM vendors WHERE id = ?', String(id)); if (!v) return fail(res, 404, 'Provider not found.');
      const t = now();
      if (b.action === 'cancel') {
        await db.run("UPDATE vendor_subscriptions SET status = 'cancelled', updated_at = ?, note = ? WHERE vendor_id = ? AND status IN ('requested','active','comped')", t, clean(b.note, 300) || 'Cancelled by admin', v.id);
      } else if (b.action === 'activate' || b.action === 'comp') {
        const plan = await db.get('SELECT * FROM vendor_plans WHERE id = ?', String(b.planId || 'pro')); if (!plan || plan.id === 'free') return fail(res, 422, 'Choose a paid plan.');
        const end = /^\d{4}-\d{2}-\d{2}$/.test(b.periodEnd || '') ? b.periodEnd : null; if (!end) return fail(res, 422, 'Set the date the plan runs until.', { fields: { periodEnd: 'Required.' } });
        await tx(db, async (db) => {
          await db.run("UPDATE vendor_subscriptions SET status = 'cancelled', updated_at = ? WHERE vendor_id = ? AND status IN ('requested','active','comped')", t, v.id);
          await db.run('INSERT INTO vendor_subscriptions (id, vendor_id, plan_id, status, price_minor, currency, billing_interval, provider, started_at, current_period_end, note, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
            uid(), v.id, plan.id, b.action === 'comp' ? 'comped' : 'active', b.action === 'comp' ? 0 : plan.price_minor, plan.currency, plan.billing_interval, 'manual', t, end, clean(b.note, 300), t, t);
        });
      } else return fail(res, 422, 'Unknown action.');
      await audit(db, s, `subscription_${b.action}`, v.id, `${b.planId || ''} ${b.periodEnd || ''} ${clean(b.note, 200)}`);
      if (v.owner_user_id) { const { notify } = await import('./notifications.js'); await notify(db, v.owner_user_id, { kind: 'subscription', title: b.action === 'cancel' ? 'Your Ma3ak plan was cancelled' : 'Your Ma3ak plan is active', body: b.action === 'cancel' ? 'Your listing is on Ma3ak Free.' : `Plan active until ${b.periodEnd}.`, link: '#/partner?tab=plan', dedupe: `sub:${v.id}:${t}` }); }
      sendJson(res, 200, { ok: true });
    },

    // ----- admin: commission rules (each change keeps the old rule in history) -----
    'GET /api/admin/commission': async (req, res) => {
      if (!await guard(req, res)) return;
      sendJson(res, 200, { ok: true, rules: await db.all('SELECT r.*, a.email AS created_by_email FROM commission_rules r LEFT JOIN admins a ON a.id = r.created_by ORDER BY r.id DESC LIMIT 200') });
    },
    'POST /api/admin/commission': async (req, res) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      const scope = ['global', 'category', 'vendor'].includes(b.scope) ? b.scope : null; if (!scope) return fail(res, 422, 'Choose who the rule applies to.');
      const scopeId = scope === 'global' ? null : clean(b.scopeId, 80);
      if (scope === 'category' && !(await db.get('SELECT 1 FROM categories WHERE id = ?', scopeId))) return fail(res, 422, 'Choose a category.');
      if (scope === 'vendor' && !(await db.get('SELECT 1 FROM vendors WHERE id = ?', scopeId))) return fail(res, 422, 'Choose a provider.');
      const m = /^(\d{1,2})(?:\.(\d{1,2}))?$/.exec(String(b.ratePercent ?? '').trim()); if (!m) return fail(res, 422, 'Enter a percentage such as 5 or 2.5.', { fields: { ratePercent: 'Invalid.' } });
      const bps = Number(m[1]) * 100 + Number((m[2] || '').padEnd(2, '0')); if (bps > 5000) return fail(res, 422, 'The rate can’t be above 50%.');
      const t = now();
      await tx(db, async (db) => {
        await db.run(`UPDATE commission_rules SET ended_at = ? WHERE ended_at IS NULL AND scope = ? AND ${scopeId === null ? 'scope_id IS NULL' : 'scope_id = ?'}`, ...(scopeId === null ? [t, scope] : [t, scope, scopeId]));
        if (b.remove !== true || scope === 'global') await db.run('INSERT INTO commission_rules (scope, scope_id, rate_bps, note, created_by, created_at) VALUES (?,?,?,?,?,?)', scope, scopeId, bps, clean(b.note, 300), s.admin_id, t);
      });
      await audit(db, s, b.remove ? 'commission_rule_removed' : 'commission_rule_set', `${scope}${scopeId ? ':' + scopeId : ''}`, `${bps / 100}%${b.note ? ' — ' + clean(b.note, 200) : ''}`);
      sendJson(res, 200, { ok: true });
    },
    'GET /api/admin/finance': async (req, res) => {
      if (!await guard(req, res)) return;
      const [commissions, payments, payouts, totals] = await Promise.all([
        db.all('SELECT c.*, b.ref, b.vendor_name FROM commissions c JOIN bookings b ON b.id = c.booking_id ORDER BY c.id DESC LIMIT 300'),
        db.all('SELECT p.*, b.ref, b.vendor_name FROM payments p JOIN bookings b ON b.id = p.booking_id ORDER BY p.created_at DESC LIMIT 300'),
        db.all('SELECT * FROM payouts ORDER BY created_at DESC LIMIT 300'),
        db.all("SELECT currency, status, SUM(amount_minor) AS total, COUNT(*) AS n FROM commissions GROUP BY currency, status ORDER BY currency, status")]);
      sendJson(res, 200, { ok: true, commissions, payments, payouts, totals, providerConfigured: false });
    },
    'POST /api/admin/payouts': async (req, res) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 4096); } catch (e) { return fail(res, e.status || 400, e.message); }
      const v = await db.get('SELECT id, name FROM vendors WHERE id = ?', String(b.vendorId || '')); if (!v) return fail(res, 404, 'Provider not found.');
      const currency = isCurrency(b.currency) ? b.currency : 'USD', amount = toMinor(b.amount, currency); if (!Number.isInteger(amount) || amount <= 0) return fail(res, 422, 'Enter the amount paid.');
      const id = uid(); await db.run('INSERT INTO payouts (id, vendor_id, vendor_name, amount_minor, currency, method, reference, note, status, recorded_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        id, v.id, v.name, amount, currency, 'offline_transfer', clean(b.reference, 120), clean(b.note, 300), 'paid', s.admin_id, now());
      await audit(db, s, 'payout_recorded', v.id, format(amount, currency));
      sendJson(res, 201, { ok: true, id });
    },
    // A payment provider would call this. None is configured, so nothing is accepted or simulated.
    'POST /api/payments/webhook/:provider': async (req, res) => fail(res, 501, 'No payment provider is configured.'),
  };
}
