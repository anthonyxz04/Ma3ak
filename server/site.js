// Website content managed from the admin: contact and social links, homepage text, how it works,
// FAQs, themes, announcement and categories. Also the admin overview and activity history.
import { now } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { clean } from './validate.js';
import { audit } from './audit.js';
import { clearCategoryCache } from './vendors.js';
import { CURRENCIES, isCurrency, toMinor } from './money.js';
import { CATEGORY_FIELDS } from './fields.js';

const HEX = /^#[0-9a-fA-F]{6}$/;
const str = (v, max) => clean(typeof v === 'string' ? v : '', max);
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = (v, n) => Array.isArray(v) ? v.slice(0, n) : [];
// Each setting has a fixed shape; anything else is dropped. Text is shown with HTML escaping on the site.
const SCHEMA = {
  contact: v => { v = obj(v); const phone = str(v.phone, 30), email = str(v.email, 254).toLowerCase();
    if (phone && !/^[+\d][\d\s\-().]{6,24}$/.test(phone)) throw new Error('Enter a valid phone number.');
    if (email && !/^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-zA-Z]{2,24}$/.test(email)) throw new Error('Enter a valid email.');
    const url = (u, host) => { u = str(u, 300); if (u && !new RegExp(`^https://([a-z0-9-]+\\.)*${host}/`, 'i').test(u)) throw new Error(`Use a full https://${host}/… link.`); return u; };
    return { phone, email, whatsapp: str(v.whatsapp, 20).replace(/\D/g, ''), instagram: str(v.instagram, 60).replace(/^@/, '').replace(/[^\w.]/g, ''), facebook: url(v.facebook, 'facebook\\.com'), tiktok: str(v.tiktok, 60).replace(/^@/, '').replace(/[^\w.]/g, ''), address: str(v.address, 200), hours: str(v.hours, 200) }; },
  hero: v => { v = obj(v); return { eyebrow: str(v.eyebrow, 60), title: str(v.title, 140) || 'Plan your event', subtitle: str(v.subtitle, 400), primary: str(v.primary, 40) || 'Start planning', secondary: str(v.secondary, 40) || 'Browse providers' }; },
  budgetIntro: v => { v = obj(v); return { title: str(v.title, 120), text: str(v.text, 600) }; },
  howItWorks: v => arr(v, 8).map(x => ({ title: str(x?.title, 80), text: str(x?.text, 300) })).filter(x => x.title),
  faqs: v => arr(v, 40).map(x => ({ q: str(x?.q, 200), a: str(x?.a, 1500) })).filter(x => x.q && x.a),
  themes: v => arr(v, 24).map(x => ({ id: str(x?.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, '') || str(x?.name, 40).toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: str(x?.name, 60), description: str(x?.description, 200), colors: arr(x?.colors, 5).filter(c => HEX.test(c)) })).filter(x => x.name && x.id),
  announcement: v => { v = obj(v); return { active: v.active === true, text: str(v.text, 200) }; },
  currency: v => ['USD', 'EUR', 'LBP'].includes(v) ? v : 'USD',
  // Fees charged to customers on top of the provider's price. Always shown before the customer accepts. Empty = none.
  customerFees: v => arr(v, 5).map(x => {
    const label = str(x?.label, 60); if (!label) throw new Error('Give each fee a name customers will understand.');
    if (x?.type === 'percent') { const bps = Number.isInteger(x.bps) ? x.bps : Math.round(Number(String(x.percent ?? '').replace(',', '.')) * 100); if (!Number.isInteger(bps) || bps < 1 || bps > 3000) throw new Error('A percentage fee must be between 0.01% and 30%.'); return { label, type: 'percent', bps }; }
    if (x?.type === 'flat') { const currency = isCurrency(x.currency) ? x.currency : 'USD', amountMinor = Number.isInteger(x.amountMinor) ? x.amountMinor : toMinor(x.amount, currency); if (!Number.isInteger(amountMinor) || amountMinor <= 0) throw new Error('Enter the fee amount.'); return { label, type: 'flat', currency, amountMinor }; }
    throw new Error('Choose percentage or flat fee.'); }),
  listingSort: v => { v = obj(v); return { sponsoredFirst: v.sponsoredFirst === true, auto: ['quality', 'rating', 'newest', 'name'].includes(v.auto) ? v.auto : 'quality' }; },
  bookingPolicy: v => { v = obj(v); const n = (x, lo, hi, d) => { const k = Number(x); return Number.isInteger(k) ? Math.max(lo, Math.min(hi, k)) : d; };
    return { offerValidityDays: n(v.offerValidityDays, 1, 90, 14), reviewWindowDays: n(v.reviewWindowDays, 7, 730, 180), defaultCancellationTerms: str(v.defaultCancellationTerms, 2000) || 'No special cancellation terms were set by the provider. Ask them before you accept if this matters to you.' }; },
  vendorTerms: v => { v = obj(v); const version = str(v.version, 40), text = clean(typeof v.text === 'string' ? v.text : '', 20000); if (!version || !text) throw new Error('Enter a version and the text of the terms.'); return { version, text }; },
};
export const SETTING_KEYS = Object.keys(SCHEMA);

async function readSettings(db) {
  const out = {};
  for (const r of await db.all('SELECT key, value FROM site_settings')) if (SCHEMA[r.key]) { try { out[r.key] = JSON.parse(r.value); } catch {} }
  return out;
}

export function siteRoutes(db, guard) {
  return {
    // Everything the public website needs to render editable content, in one request.
    'GET /api/site': async (req, res) => {
      const [settings, categories] = await Promise.all([readSettings(db), db.all(`SELECT c.id, c.name, c.single, c.icon, c.blurb, c.sort,
        (SELECT COUNT(*) FROM vendors v WHERE v.category = c.id AND v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL) AS providers
        FROM categories c WHERE c.active = 1 ORDER BY c.sort, c.name`)]);
      const plans = await db.all('SELECT id, name, price_minor, currency, billing_interval, entitlements, description FROM vendor_plans WHERE active = 1 ORDER BY sort');
      sendJson(res, 200, { ok: true, settings, categories, fields: CATEGORY_FIELDS, currencies: CURRENCIES, timeZone: 'Asia/Beirut',
        vendorPlans: plans.map(p => ({ ...p, entitlements: JSON.parse(p.entitlements || '{}') })), payments: { online: false } });
    },
    'GET /api/admin/settings': async (req, res) => { if (!await guard(req, res)) return; sendJson(res, 200, { ok: true, settings: await readSettings(db), keys: SETTING_KEYS }); },
    'PUT /api/admin/settings/:key': async (req, res, _db, url, key) => {
      const s = await guard(req, res, true); if (!s) return; if (!SCHEMA[key]) return fail(res, 404, 'Unknown setting.');
      let b; try { b = await readJson(req, 128e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      let value; try { value = SCHEMA[key](b.value); } catch (e) { return fail(res, 422, e.message); }
      if (key === 'vendorTerms') { const prev = (await readSettings(db)).vendorTerms; if (prev && prev.version === value.version && prev.text !== value.text) return fail(res, 422, 'Change the version when you change the text, so providers are asked to accept the new terms.'); }
      await db.run('INSERT INTO site_settings (key, value, updated_at, updated_by) VALUES (?,?,?,?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by', key, JSON.stringify(value), now(), s.admin_id);
      await audit(db, s, 'setting_updated', key, key === 'customerFees' || key === 'listingSort' || key === 'bookingPolicy' ? JSON.stringify(value).slice(0, 400) : key === 'vendorTerms' ? `version ${value.version}` : null); sendJson(res, 200, { ok: true, value });
    },
    'GET /api/admin/categories': async (req, res) => {
      if (!await guard(req, res)) return;
      sendJson(res, 200, { ok: true, categories: await db.all('SELECT c.*, (SELECT COUNT(*) FROM vendors v WHERE v.category = c.id) AS vendors FROM categories c ORDER BY c.sort, c.name') });
    },
    'PUT /api/admin/categories/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return; let b; try { b = await readJson(req, 8192); } catch (e) { return fail(res, e.status || 400, e.message); }
      if (!/^[a-z0-9-]{2,40}$/.test(id)) return fail(res, 422, 'The ID can use lowercase letters, numbers and dashes.', { fields: { id: 'Invalid.' } });
      const name = str(b.name, 60); if (!name) return fail(res, 422, 'Enter a name.', { fields: { name: 'Required.' } });
      const sort = Number.isInteger(+b.sort) ? Math.max(0, Math.min(1000, +b.sort)) : 100;
      await db.run(`INSERT INTO categories (id, name, single, icon, blurb, sort, active, updated_at) VALUES (?,?,?,?,?,?,?,?)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, single = EXCLUDED.single, icon = EXCLUDED.icon, blurb = EXCLUDED.blurb, sort = EXCLUDED.sort, active = EXCLUDED.active, updated_at = EXCLUDED.updated_at`,
        id, name, str(b.single, 60) || name, str(b.icon, 30).replace(/[^a-z-]/g, '') || 'more', str(b.blurb, 160), sort, b.active === false ? 0 : 1, now());
      clearCategoryCache(); await audit(db, s, 'category_saved', id); sendJson(res, 200, { ok: true });
    },
    'DELETE /api/admin/categories/:id': async (req, res, _db, url, id) => {
      const s = await guard(req, res, true); if (!s) return;
      if ((await db.get('SELECT COUNT(*) AS n FROM vendors WHERE category = ?', String(id))).n) return fail(res, 409, 'Providers still use this category. Move them first, or switch the category off instead.');
      await db.run('DELETE FROM categories WHERE id = ?', String(id)); clearCategoryCache(); await audit(db, s, 'category_deleted', id); sendJson(res, 200, { ok: true });
    },
    'GET /api/admin/audit': async (req, res, _db, url) => {
      if (!await guard(req, res)) return; const page = Math.max(1, Math.min(500, Number(url.searchParams.get('page')) || 1));
      const rows = await db.all('SELECT a.id, a.action, a.target, a.detail, a.at, COALESCE(a.actor, ad.email) AS actor FROM audit a LEFT JOIN admins ad ON ad.id = a.admin_id ORDER BY a.id DESC LIMIT 50 OFFSET ?', (page - 1) * 50);
      sendJson(res, 200, { ok: true, rows, page });
    },
    // Real numbers only: every figure is a count from the database.
    'GET /api/admin/overview': async (req, res) => {
      if (!await guard(req, res)) return;
      const n = async (sql, ...a) => (await db.get(sql, ...a)).n;
      const [customers, partners, pending, published, demo, plans, finalized, openRequests, bookingsAll, confirmed, requestsNew, aiChats, newUsers7, reportsOpen, disputed, planRequests] = await Promise.all([
        n("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'"), n("SELECT COUNT(*) AS n FROM users WHERE role = 'partner'"), n("SELECT COUNT(*) AS n FROM vendors WHERE status IN ('submitted','pending','under_review')"),
        n("SELECT COUNT(*) AS n FROM vendors WHERE status = 'approved' AND active = 1 AND consent_at IS NOT NULL AND is_demo = 0"), n('SELECT COUNT(*) AS n FROM vendors WHERE is_demo = 1'),
        n('SELECT COUNT(*) AS n FROM events'), n("SELECT COUNT(*) AS n FROM events WHERE status = 'finalized'"), n("SELECT COUNT(*) AS n FROM bookings WHERE status IN ('quote_requested','revision_requested','awaiting_vendor')"), n('SELECT COUNT(*) AS n FROM bookings'),
        n("SELECT COUNT(*) AS n FROM bookings WHERE status IN ('confirmed','in_progress','completed')"), n("SELECT COUNT(*) AS n FROM requests WHERE status = 'new'"), n('SELECT COUNT(*) AS n FROM ai_conversations'), n('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?', new Date(Date.now() - 7 * 864e5).toISOString()),
        n("SELECT COUNT(*) AS n FROM reports WHERE status = 'open'"), n('SELECT COUNT(*) AS n FROM bookings WHERE disputed = 1'), n("SELECT COUNT(*) AS n FROM vendor_subscriptions WHERE status = 'requested'")]);
      sendJson(res, 200, { ok: true, overview: { customers, partners, pending, published, demo, plans, finalized, openRequests, bookingsAll, confirmed, requestsNew, aiChats, newUsers7, reportsOpen, disputed, planRequests } });
    },
  };
}
export { readSettings };
