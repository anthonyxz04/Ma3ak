// Small, strict input validation. Everything is trimmed, length-limited, and control-character free.
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g;
export const clean = (v, max) => String(v ?? '').replace(CTRL, '').normalize('NFC').trim().slice(0, max);

export function check(input, schema) {
  const out = {}, fields = {};
  for (const [key, rule] of Object.entries(schema)) {
    const raw = input?.[key];
    const empty = raw === undefined || raw === null || raw === '' || (Array.isArray(raw) && !raw.length);
    if (empty) { if (rule.required) fields[key] = rule.msg || 'Required.'; else out[key] = rule.default ?? ''; continue; }
    if (rule.type === 'bool') { if (raw !== true && raw !== false) fields[key] = 'Invalid value.'; else out[key] = raw; continue; }
    if (rule.type === 'int') { const n = Number(raw); if (!Number.isInteger(n) || n < (rule.min ?? 0) || n > (rule.max ?? 1e9)) fields[key] = 'Invalid number.'; else out[key] = n; continue; }
    if (typeof raw !== 'string') { fields[key] = 'Invalid value.'; continue; }
    const v = clean(raw, (rule.max ?? 200) + 1);
    if (v.length > (rule.max ?? 200)) { fields[key] = 'Too long.'; continue; }
    if (rule.min && v.length < rule.min) { fields[key] = rule.msg || 'Too short.'; continue; }
    if (rule.type === 'email' && !/^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-zA-Z]{2,24}$/.test(v)) { fields[key] = 'Enter a valid email.'; continue; }
    if (rule.type === 'phone' && !/^[+\d][\d\s\-().]{6,24}$/.test(v)) { fields[key] = 'Enter a valid phone number.'; continue; }
    if (rule.type === 'url' && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#][^\s<>"']*)?$/i.test(v)) { fields[key] = 'Enter a valid web address.'; continue; }
    if (rule.oneOf && !rule.oneOf.includes(v)) { fields[key] = 'Invalid choice.'; continue; }
    out[key] = rule.type === 'email' ? v.toLowerCase() : v;
  }
  return { ok: !Object.keys(fields).length, value: out, fields };
}

// Customizer choices: a bounded, typed copy of an arbitrary object (no prototype tricks, no deep nesting).
const KEY = /^[A-Za-z_][A-Za-z0-9_]{0,40}$/;
export function sanitizeChoices(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out = {}; let n = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (!KEY.test(k) || k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    if (++n > 150) break;
    if (k === '_add') { out._add = Array.isArray(v) ? v.slice(0, 300).map(it => ({ id: clean(it?.id, 40), type: clean(it?.type, 30), x: num(it?.x), z: num(it?.z), ry: num(it?.ry) })) : []; continue; }
    if (k === '_ov') { const o = {}; if (v && typeof v === 'object') for (const [ik, iv] of Object.entries(v).slice(0, 400)) if (KEY.test(ik.replace(/[^A-Za-z0-9_]/g, '_'))) o[clean(ik, 40)] = iv?.del ? { del: 1 } : { x: num(iv?.x), z: num(iv?.z), ry: num(iv?.ry) }; out._ov = o; continue; }
    if (typeof v === 'string') out[k] = clean(v, 2000);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (Array.isArray(v)) out[k] = v.slice(0, 60).filter(x => typeof x === 'string').map(x => clean(x, 200));
  }
  return out;
}
const num = v => { const n = Number(v); return Number.isFinite(n) ? Math.max(-1000, Math.min(1000, Math.round(n * 1000) / 1000)) : 0; };
