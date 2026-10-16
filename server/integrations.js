// External services. Each one is OFF until its credentials are set; nothing is faked.
import { config } from './config.js';

export const status = () => ({
  email: { configured: !!(config.resendKey && config.mailFrom), provider: 'Resend', needs: ['RESEND_API_KEY', 'MAIL_FROM', 'NOTIFY_EMAIL'] },
  whatsapp: { configured: !!(config.waToken && config.waPhoneId && config.waTo && config.waTemplate), provider: 'WhatsApp Cloud API (Meta)', needs: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_BUSINESS_TO', 'WHATSAPP_TEMPLATE'] },
  ai: { configured: !!(config.aiProvider === 'mock' || (config.aiProvider && config.aiKey && (config.aiProvider !== 'openai' || config.aiModel))), provider: config.aiProvider || 'none', needs: ['AI_PROVIDER', 'AI_API_KEY', 'AI_MODEL (required for openai)'] },
  google: { configured: !!(config.googleClientId && config.googleClientSecret), provider: 'Google OAuth', needs: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
  payments: { configured: false, provider: 'Stripe (planned)', needs: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] },
  instagram: { configured: false, provider: 'Meta Instagram API (planned)', needs: ['Instagram Business account + Meta app review'] },
});

// Transactional email via Resend's HTTPS API.
export async function sendEmail({ to, subject, text, html }) {
  if (!config.resendKey) return { ok: false, reason: 'not_configured' };
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${config.resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: config.mailFrom, to: [to], subject: subject.slice(0, 180), text, html }), signal: AbortSignal.timeout(10000) });
    return { ok: r.ok, reason: r.ok ? null : `provider_${r.status}` };
  } catch { return { ok: false, reason: 'network' }; }
}
export const emailHtml = (title, lines, cta) => `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#171717">
  <p style="letter-spacing:.12em;font-weight:700;color:#8A6C33">MA3AK</p><h1 style="font-family:Georgia,serif;font-weight:500">${esc(title)}</h1>
  ${lines.map(l => `<p style="line-height:1.6">${esc(l)}</p>`).join('')}
  ${cta ? `<p><a href="${cta.url}" style="display:inline-block;background:#111;color:#F8F6F2;padding:12px 20px;border-radius:999px;text-decoration:none">${esc(cta.label)}</a></p>` : ''}
  <p style="color:#6F6F6F;font-size:13px">MA3AK, Lebanon</p></div>`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Business notification through the official WhatsApp Cloud API using an approved message template.
// The template must have 5 body parameters: customer, event, date, guests, link.
export async function notifyWhatsApp({ customer, event, date, guests, link }) {
  if (!status().whatsapp.configured) return { ok: false, reason: 'not_configured' };
  const params = [customer, event, date || 'not set', String(guests || 'not set'), link || '—'].map(t => ({ type: 'text', text: String(t).slice(0, 200) }));
  try {
    const r = await fetch(`https://graph.facebook.com/${config.waApiVersion}/${config.waPhoneId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${config.waToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: config.waTo, type: 'template', template: { name: config.waTemplate, language: { code: 'en' }, components: [{ type: 'body', parameters: params }] } }), signal: AbortSignal.timeout(10000) });
    if (!r.ok) console.warn(`whatsapp: provider responded ${r.status}`);
    return { ok: r.ok };
  } catch { return { ok: false, reason: 'network' }; }
}
