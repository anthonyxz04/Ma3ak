// Central configuration, read once from environment variables.
import path from 'node:path';

const env = process.env;
// Running inside Netlify Functions (production or deploy preview)?
const onNetlify = !!(globalThis.Netlify || env.NETLIFY_DB_URL || (env.AWS_LAMBDA_FUNCTION_NAME && env.SITE_ID));
const isProd = env.NODE_ENV === 'production' || onNetlify;

export const config = {
  isProd, onNetlify,
  port: Number(env.PORT) || 3000,
  host: env.HOST || '0.0.0.0',
  dataDir: path.resolve(env.DATA_DIR || './data'),
  publicDir: path.resolve(env.PUBLIC_DIR || './public'),
  // Exact origin(s) allowed to POST to the API, e.g. "https://ma3ak.com,https://www.ma3ak.com"
  allowedOrigins: (env.PUBLIC_ORIGIN || env.URL || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean),
  trustProxy: env.TRUST_PROXY === '1',
  sessionSecret: env.SESSION_SECRET || '',
  sessionHours: Number(env.SESSION_HOURS) || 8,
  adminEmail: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: env.ADMIN_PASSWORD || '',
  resendKey: env.RESEND_API_KEY || '',
  notifyEmail: env.NOTIFY_EMAIL || '',
  mailFrom: env.MAIL_FROM || 'MA3AK <notifications@example.com>',
  retentionDays: Number(env.RETENTION_DAYS) || 730,
  whatsapp: env.WHATSAPP_NUMBER || '96176620434',
  // Google sign-in (OAuth 2.0). Leave empty to hide the Google button.
  googleClientId: env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: env.GOOGLE_CLIENT_SECRET || '',
  // AI assistant: AI_PROVIDER = anthropic | openai | mock (tests). Empty = assistant shows "not configured".
  aiProvider: (env.AI_PROVIDER || '').toLowerCase(),
  aiKey: env.AI_API_KEY || env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || '',
  aiModel: env.AI_MODEL || '',
  // WhatsApp Cloud API (official). All four are required to enable business notifications.
  waToken: env.WHATSAPP_TOKEN || '',
  waPhoneId: env.WHATSAPP_PHONE_NUMBER_ID || '',
  waTo: env.WHATSAPP_BUSINESS_TO || '',
  waTemplate: env.WHATSAPP_TEMPLATE || '',
  waApiVersion: env.WHATSAPP_API_VERSION || 'v21.0',
  // Payments (not active yet): Stripe keys enable the billing endpoints later.
  stripeKey: env.STRIPE_SECRET_KEY || '',
};

export function assertConfig() {
  const problems = [];
  // On Netlify the key can come from the database instead (generated once, see app.js), so it isn't required there.
  if (config.sessionSecret.length < 32 && !config.onNetlify) problems.push('SESSION_SECRET must be at least 32 random characters.');
  if (config.isProd && !config.onNetlify && !config.allowedOrigins.length) problems.push('PUBLIC_ORIGIN is required in production (e.g. https://ma3ak.com).');
  if (problems.length) {
    if (config.onNetlify) throw Object.assign(new Error('Server setup incomplete: ' + problems.join(' ')), { setup: true });
    if (config.isProd) { console.error('Configuration error:\n- ' + problems.join('\n- ')); process.exit(1); }
    else console.warn('Config warnings (dev):\n- ' + problems.join('\n- '));
    if (!config.sessionSecret) config.sessionSecret = 'dev-only-secret-change-me-dev-only-secret-change-me';
  }
}
