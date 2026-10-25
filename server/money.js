// Money is always an integer number of minor units (cents) plus a currency code.
// No floating-point arithmetic, no exchange rates: amounts in different currencies are never added together.
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', digits: 2, name: 'US dollar' },
  EUR: { code: 'EUR', symbol: '€', digits: 2, name: 'Euro' },
  LBP: { code: 'LBP', symbol: 'LBP ', digits: 0, name: 'Lebanese pound' },
};
export const isCurrency = c => typeof c === 'string' && Object.hasOwn(CURRENCIES, c);
const MAX = 1e13; // well inside Number.MAX_SAFE_INTEGER

// "1,250.5" → 125050 (USD). Returns null for empty input, NaN for invalid input. Exact (string arithmetic).
export function toMinor(input, currency = 'USD') {
  if (input === null || input === undefined || input === '') return null;
  const c = CURRENCIES[currency]; if (!c) return NaN;
  if (typeof input === 'number') { if (!Number.isFinite(input) || input < 0) return NaN; input = input.toFixed(c.digits); }
  const s = String(input).replace(/[\s,]/g, '');
  const m = /^(\d{1,13})(?:\.(\d*))?$/.exec(s); if (!m) return NaN;
  const frac = (m[2] || '');
  if (frac.length > c.digits && /[1-9]/.test(frac.slice(c.digits))) return NaN; // more precision than the currency has
  const v = Number(m[1]) * 10 ** c.digits + Number((frac + '0'.repeat(c.digits)).slice(0, c.digits) || 0);
  return v <= MAX ? v : NaN;
}
export const fromMinor = (minor, currency = 'USD') => { const d = (CURRENCIES[currency] || CURRENCIES.USD).digits; return d ? (minor / 10 ** d).toFixed(d) : String(minor); };
export function format(minor, currency = 'USD') {
  if (minor === null || minor === undefined) return '';
  const c = CURRENCIES[currency] || CURRENCIES.USD, neg = minor < 0, a = Math.abs(minor);
  const whole = Math.floor(a / 10 ** c.digits), frac = a % 10 ** c.digits;
  const s = whole.toLocaleString('en-US') + (c.digits && frac ? '.' + String(frac).padStart(c.digits, '0') : '');
  return (neg ? '-' : '') + c.symbol + s;
}
// Integer multiply with an overflow guard.
export function times(minor, qty) { const r = minor * qty; if (!Number.isSafeInteger(r) || Math.abs(r) > MAX) throw new Error('Amount too large'); return r; }
// Percentage in basis points (100 bps = 1%), rounded half up. Exact for any safe integer amount.
export function percentOf(minor, bps) { const r = (BigInt(minor) * BigInt(bps) + 5000n) / 10000n; return Number(r); }
// Whole-unit amounts used by older columns.
export const toWhole = (minor, currency = 'USD') => minor == null ? null : Math.round(minor / 10 ** (CURRENCIES[currency] || CURRENCIES.USD).digits);
