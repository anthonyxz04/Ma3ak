// Optional email notification for new requests (via Resend's HTTPS API). No customer data is logged.
import { config } from './config.js';

export async function notifyNewRequest({ ref, type, name, summary }) {
  if (!config.resendKey || !config.notifyEmail) return;
  const label = { event: 'Event request', contact: 'Contact message', vendor: 'Vendor application', booking: 'Booking request' }[type] || 'Request';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: config.mailFrom, to: [config.notifyEmail], subject: `New ${label} ${ref} from ${name}`.slice(0, 180),
        text: `${label} ${ref}\n\n${summary.slice(0, 6000)}\n\nOpen the admin dashboard to see everything.` }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) console.warn(`notify: email provider responded ${r.status}`);
  } catch { console.warn('notify: email could not be sent'); }
}
