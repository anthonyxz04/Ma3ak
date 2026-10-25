// Public API: customers submit requests. Protected by origin checks, rate limits,
// honeypot + timing spam filters, strict validation, and size limits.
import { config } from './config.js';
import { now, uid, tx } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { rateLimit, clientIp, ipHash, newRef, originAllowed } from './security.js';
import { check, sanitizeChoices, clean } from './validate.js';
import { decodeImage } from './uploads.js';
import { putImage, removeImage } from './storage.js';
import { notifyNewRequest } from './notify.js';
import { currentUser } from './users.js';
import { notifyWhatsApp, sendEmail, emailHtml } from './integrations.js';
import { token, sha256 } from './security.js';

const contactRules = { name: { required: true, max: 120, msg: 'Enter your name.' }, email: { required: true, type: 'email', max: 254 }, phone: { type: 'phone', max: 30 }, subject: { required: true, max: 160, msg: 'Enter a subject.' }, message: { required: true, min: 10, max: 5000, msg: 'Write at least 10 characters.' } };
const vendorRules = { businessName: { required: true, max: 160, msg: 'Enter your business name.' }, contactName: { required: true, max: 120, msg: 'Enter a contact person.' }, phone: { required: true, type: 'phone', max: 30 }, email: { required: true, type: 'email', max: 254 }, category: { required: true, max: 40 }, location: { required: true, max: 40 }, instagram: { max: 120 }, website: { type: 'url', max: 300 }, message: { max: 5000 } };
const eventContactRules = { fullName: { required: true, max: 120, msg: 'Enter your name.' }, phone: { type: 'phone', max: 30 }, email: { type: 'email', max: 254 } };

const LIMITS = { contact: 64e3, vendor: 64e3, booking: 64e3, event: 5.8e6 }; // Netlify Functions accept up to 6 MB

async function intake(req, res, db, type, handler) {
  if (!originAllowed(req)) return fail(res, 403, 'Request blocked.');
  const ip = clientIp(req), key = ipHash(ip);
  const burst = await rateLimit(`pub:${type}:m:${key}`, 3, 60_000), hourly = await rateLimit(`pub:${type}:h:${key}`, type === 'event' ? 8 : 12, 3_600_000), global = await rateLimit(`pub:all:${key}`, 40, 3_600_000);
  if (!burst.ok || !hourly.ok || !global.ok) return fail(res, 429, 'Too many requests. Please try again a little later.');
  let body; try { body = await readJson(req, LIMITS[type]); } catch (e) { return fail(res, e.status || 400, e.message); }
  // Spam traps: hidden field must stay empty; a human takes more than ~2.5 seconds to fill a form.
  if (body.company_site || (typeof body.elapsed === 'number' && body.elapsed < 2500)) return sendJson(res, 200, { ok: true, ref: newRef() });
  if (body.consent !== true) return fail(res, 422, 'Please accept the privacy policy.', { fields: { consent: 'Required.' } });
  const result = await handler(body);
  if (result.error) return fail(res, 422, result.error, { fields: result.fields });
  const ref = newRef(), t = now();
  // Link to the customer's account and saved event when they're signed in (and the event is theirs).
  const user = await currentUser(req, db); let eventId = null, shareUrl = null;
  if (user && body.eventId) { const e = (await db.get('SELECT id FROM events WHERE id = ? AND user_id = ?', String(body.eventId), user.id)); if (e) eventId = e.id; }
  const saved = [];
  try {
    for (const f of result.files || []) saved.push({ kind: f.kind, ...(await putImage(f.img)) });
    await tx(db, async (db) => {
      if (eventId) { const tk = token(32); await db.run('INSERT INTO shares (id, token_hash, event_id, permission, created_at, expires_at) VALUES (?,?,?,?,?,?)', uid(), sha256(tk), eventId, 'view', t, new Date(Date.now() + 365 * 864e5).toISOString()); shareUrl = `${config.allowedOrigins[0] || `https://${req.headers.host}`}/#/s/${tk}`; await db.run("UPDATE events SET status = 'sent' WHERE id = ?", eventId); }
      const row = await db.get('INSERT INTO requests (ref, type, name, email, phone, summary, payload, ip_hash, created_at, updated_at, user_id, event_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id', ref, type, result.name, result.email || null, result.phone || null, result.summary + (shareUrl ? `\n\nView the event: ${shareUrl}` : ''), JSON.stringify(result.payload), key, t, t, user?.id || null, eventId);
      for (const f of saved) await db.run('INSERT INTO files (id, request_id, kind, mime, size, created_at) VALUES (?,?,?,?,?,?)', f.id, row.id, f.kind, f.mime, f.size, t);
    });
  } catch (e) { for (const f of saved) await removeImage(f.id); console.error('intake: could not save request', e.code || ''); return fail(res, 500, 'We couldn’t save your request. Please try again.'); }
  notifyNewRequest({ ref, type, name: result.name, summary: result.summary + (shareUrl ? `\n\nView the event: ${shareUrl}` : '') });
  if (type === 'event') {
    const ch = result.payload.choices || {};
    notifyWhatsApp({ customer: result.name, event: ch.eventName || ch.eventType || 'Event', date: ch.date, guests: ch.guests, link: shareUrl });
    if (result.email && body.copyToMe) sendEmail({ to: result.email, subject: `Your MA3AK event plan (${ref})`, text: `Thanks, ${result.name}. We received your event plan ${ref}.${shareUrl ? `\nView it any time: ${shareUrl}` : ''}`, html: emailHtml('We received your event plan', [`Thanks, ${result.name}. Your reference is ${ref}. Our team will contact you to arrange everything.`], shareUrl ? { url: shareUrl, label: 'View my event' } : null) });
  }
  return sendJson(res, 201, { ok: true, ref, shareUrl });
}

export const publicRoutes = {
  'POST /api/contact': async (req, res, db) => intake(req, res, db, 'contact', b => {
    const c = check(b, contactRules); if (!c.ok) return { error: 'Please check the highlighted fields.', fields: c.fields };
    const v = c.value; return { name: v.name, email: v.email, phone: v.phone, payload: v, summary: `Subject: ${v.subject}\nFrom: ${v.name} <${v.email}>${v.phone ? `\nPhone: ${v.phone}` : ''}\n\n${v.message}` };
  }),
  'POST /api/vendors': async (req, res, db) => intake(req, res, db, 'vendor', b => {
    const c = check(b, vendorRules); if (!c.ok) return { error: 'Please check the highlighted fields.', fields: c.fields };
    const v = c.value; return { name: v.businessName, email: v.email, phone: v.phone, payload: v, summary: `Business: ${v.businessName}\nContact: ${v.contactName}\nPhone: ${v.phone}\nEmail: ${v.email}\nCategory: ${v.category}\nLocation: ${v.location}${v.instagram ? `\nInstagram: ${v.instagram}` : ''}${v.website ? `\nWebsite: ${v.website}` : ''}\n\n${v.message}` };
  }),
  'POST /api/requests': async (req, res, db) => intake(req, res, db, 'event', b => {
    const c = check(b.contact || {}, eventContactRules); if (!c.ok) return { error: 'Please check your details.', fields: c.fields };
    const v = c.value; if (!v.phone && !v.email) return { error: 'Add a phone number or an email.', fields: { phone: 'Phone or email is required.' } };
    const choices = sanitizeChoices(b.choices);
    if (!choices.eventType) return { error: 'Choose an event type.', fields: { eventType: 'Required.' } };
    const files = [];
    for (const kind of ['design', 'venue']) { if (b.images?.[kind]) { const img = decodeImage(b.images[kind]); if (!img) return { error: 'One of the images couldn’t be read. Use a JPG or PNG under 4 MB.' }; files.push({ kind, img }); } }
    return { name: v.fullName, email: v.email, phone: v.phone, files, payload: { contact: v, choices, design: b.design && typeof b.design === 'object' ? { venue: clean(b.design.venue, 120), items: Array.isArray(b.design.items) ? b.design.items.slice(0, 80).map(x => clean(x, 80)) : [], custom: Number(b.design.custom) || 0, photo: !!b.design.photo } : {} }, summary: clean(b.text, 20000) };
  }),
  'GET /api/health': async (req, res) => sendJson(res, 200, { ok: true }),
};
