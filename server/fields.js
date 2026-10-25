// Service-specific fields. Each category asks only for what makes sense for it.
// scope: 'vendor' (profile), 'package' (each package), 'booking' (what a customer fills in when booking).
// The website builds its forms from this list (sent by /api/site), so there is one source of truth.
import { clean } from './validate.js';

const F = (key, label, type, extra = {}) => ({ key, label, type, ...extra });
const hours = (key = 'hours', label = 'Hours') => F(key, label, 'int', { min: 1, max: 72, unit: 'h' });
const startTime = F('startTime', 'Start time', 'time');
const COMMON_BOOKING = [startTime];

export const CATEGORY_FIELDS = {
  venue: {
    vendor: [F('venueType', 'Type of venue', 'select', { options: ['Hall', 'Garden', 'Rooftop', 'Restaurant', 'Beach', 'Hotel', 'Private residence', 'Other'] }),
      F('capacitySeated', 'Seated capacity', 'int', { min: 1, max: 20000 }), F('capacityStanding', 'Standing capacity', 'int', { min: 1, max: 50000 }),
      F('setting', 'Indoor or outdoor', 'select', { options: ['Indoor', 'Outdoor', 'Both'] }),
      F('facilities', 'Facilities', 'multi', { options: ['Parking', 'Valet', 'Kitchen', 'Bridal room', 'Generator', 'Air conditioning', 'Sound system', 'Wheelchair access', 'Sea view'] }),
      F('includedEquipment', 'Included equipment', 'textarea')],
    package: [hours('rentalHours', 'Rental duration'), F('minGuests', 'Minimum guests', 'int', { min: 1, max: 20000 }), F('maxGuests', 'Maximum guests', 'int', { min: 1, max: 50000 }), F('cateringIncluded', 'Catering included', 'bool')],
    booking: [startTime, F('endTime', 'End time', 'time'), F('setupNeeds', 'Set-up needs', 'textarea')],
  },
  catering: {
    vendor: [F('cuisines', 'Cuisines', 'multi', { options: ['Lebanese', 'Mediterranean', 'International', 'Italian', 'Asian', 'Desserts', 'Bar'] })],
    package: [F('menu', 'Menu', 'textarea'), F('serviceStyle', 'Service style', 'select', { options: ['Buffet', 'Plated', 'Live stations', 'Family style', 'Cocktail'] }), F('minGuests', 'Minimum guests', 'int', { min: 1, max: 20000 }), F('staffIncluded', 'Waiting staff included', 'bool')],
    booking: [startTime, F('serviceStyle', 'Preferred service style', 'select', { options: ['Buffet', 'Plated', 'Live stations', 'Family style', 'Cocktail'] }), F('dietary', 'Dietary needs', 'textarea')],
  },
  photography: {
    package: [hours('coverageHours', 'Coverage hours'), F('photographers', 'Photographers', 'int', { min: 1, max: 20 }), F('deliverables', 'Deliverables', 'textarea', { placeholder: 'e.g. 400 edited photos, online gallery, album' }), F('deliveryDays', 'Delivery time (days)', 'int', { min: 1, max: 365 })],
    booking: [startTime, hours('coverageHours', 'Coverage hours needed'), F('locations', 'Locations to cover', 'textarea')],
  },
  videography: {
    package: [hours('coverageHours', 'Coverage hours'), F('videographers', 'Videographers', 'int', { min: 1, max: 20 }), F('drone', 'Drone included', 'bool'), F('deliverables', 'Deliverables', 'textarea'), F('deliveryDays', 'Delivery time (days)', 'int', { min: 1, max: 365 })],
    booking: [startTime, hours('coverageHours', 'Coverage hours needed')],
  },
  dj: {
    vendor: [F('musicStyles', 'Music styles', 'multi', { options: ['Arabic', 'Western', 'Oriental', 'House', 'Hip-hop', 'Latin', 'Mixed'] })],
    package: [hours('performanceHours', 'Performance hours'), F('equipment', 'Equipment included', 'textarea'), F('mc', 'MC / host included', 'bool')],
    booking: [startTime, hours('performanceHours', 'Hours needed'), F('musicStyles', 'Music you like', 'textarea')],
  },
  entertainment: {
    package: [F('performanceMinutes', 'Performance length (minutes)', 'int', { min: 5, max: 600 }), F('performers', 'Performers', 'int', { min: 1, max: 100 })],
    booking: [startTime],
  },
  decoration: {
    package: [F('materials', 'Materials and items', 'textarea'), F('setupIncluded', 'Set-up included', 'bool'), F('dismantlingIncluded', 'Dismantling included', 'bool'), F('designConsultation', 'Design consultation', 'bool')],
    booking: [startTime, F('theme', 'Theme or colours', 'textarea')],
  },
  florist: { package: [F('arrangements', 'Arrangements', 'textarea'), F('deliveryIncluded', 'Delivery included', 'bool')], booking: COMMON_BOOKING },
  cake: { package: [F('servings', 'Servings', 'int', { min: 1, max: 5000 }), F('tiers', 'Tiers', 'int', { min: 1, max: 12 }), F('flavors', 'Flavours', 'textarea'), F('deliveryIncluded', 'Delivery included', 'bool')], booking: [F('flavors', 'Preferred flavours', 'textarea')] },
  lighting: { package: [F('equipment', 'Equipment', 'textarea'), F('technicianIncluded', 'Technician included', 'bool'), hours('setupHours', 'Set-up time')], booking: COMMON_BOOKING },
  rentals: { package: [F('items', 'Items', 'textarea'), F('deliveryIncluded', 'Delivery included', 'bool'), F('setupIncluded', 'Set-up included', 'bool')], booking: [F('deliveryAddress', 'Delivery address', 'textarea')] },
  transportation: { package: [F('vehicle', 'Vehicle', 'text'), hours('hours', 'Hours included'), F('driverIncluded', 'Driver included', 'bool')], booking: [startTime, F('pickup', 'Pick-up address', 'textarea')] },
  makeup: { package: [F('people', 'People included', 'int', { min: 1, max: 50 }), F('trialIncluded', 'Trial included', 'bool'), F('travelIncluded', 'Travel to you included', 'bool')], booking: [startTime, F('people', 'Number of people', 'int', { min: 1, max: 50 })] },
  hair: { package: [F('people', 'People included', 'int', { min: 1, max: 50 }), F('trialIncluded', 'Trial included', 'bool')], booking: [startTime, F('people', 'Number of people', 'int', { min: 1, max: 50 })] },
  planner: { package: [F('servicesIncluded', 'Services included', 'textarea'), F('meetings', 'Meetings included', 'int', { min: 0, max: 100 })], booking: COMMON_BOOKING },
};
export const fieldsFor = (category, scope) => (CATEGORY_FIELDS[category] || {})[scope] || (scope === 'booking' ? COMMON_BOOKING : []);

// Keep only known fields with valid values. Unknown keys are dropped.
export function cleanDetails(category, scope, input) {
  const out = {}, errors = {};
  const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  for (const f of fieldsFor(category, scope)) {
    const v = src[f.key];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue;
    if (f.type === 'int') { const n = Number(v); if (!Number.isInteger(n) || n < (f.min ?? 0) || n > (f.max ?? 1e6)) errors[f.key] = `Enter a whole number${f.max ? ` up to ${f.max}` : ''}.`; else out[f.key] = n; }
    else if (f.type === 'bool') out[f.key] = v === true || v === 'true' || v === 'on';
    else if (f.type === 'select') { const s = clean(v, 60); if (!f.options.includes(s)) errors[f.key] = 'Choose an option.'; else out[f.key] = s; }
    else if (f.type === 'multi') out[f.key] = [...new Set((Array.isArray(v) ? v : [v]).map(x => clean(x, 60)).filter(x => f.options.includes(x)))];
    else if (f.type === 'time') { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v))) errors[f.key] = 'Use a time like 19:30.'; else out[f.key] = String(v); }
    else out[f.key] = clean(v, f.type === 'textarea' ? 1000 : 120);
  }
  return { value: out, errors, ok: !Object.keys(errors).length };
}
export const parseJson = (s, fallback) => { try { const v = JSON.parse(s); return v ?? fallback; } catch { return fallback; } };

export const AREAS = ['beirut', 'metn', 'keserwan', 'jbeil', 'batroun', 'aley', 'chouf', 'bekaa', 'north', 'south'];
export const EVENT_TYPES = ['wedding', 'engagement', 'birthday', 'graduation', 'corporate', 'private', 'baby-shower', 'bachelor', 'bachelorette', 'beach', 'outdoor', 'other'];
export const UNITS = ['flat', 'per_guest', 'per_hour', 'per_item'];

// A website setting (Admin → Settings) with a fallback when it hasn't been saved.
export async function getSetting(db, key, fallback) {
  const r = await db.get('SELECT value FROM site_settings WHERE key = ?', key);
  const v = r ? parseJson(r.value, undefined) : undefined;
  return v === undefined ? fallback : (fallback && typeof fallback === 'object' && !Array.isArray(fallback) && v && typeof v === 'object' ? { ...fallback, ...v } : v);
}

// Dates are calendar days (YYYY-MM-DD). The business runs on Beirut time.
export const TIME_ZONE = 'Asia/Beirut';
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;

// Phone numbers are stored in international form (+9613123456). Lebanese numbers: 7 or 8 digits after +961.
export function normalizePhone(raw) {
  let s = String(raw ?? '').replace(/[\s\-().]/g, '');
  if (!s) return { error: 'Enter a phone number.' };
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) return { error: 'Include the country code, e.g. +961 3 123 456.' };
  if (!/^\+[1-9]\d{6,14}$/.test(s)) return { error: 'Enter a valid phone number with its country code.' };
  if (s.startsWith('+9610')) s = '+961' + s.slice(5);
  if (s.startsWith('+961') && !/^\+961\d{7,8}$/.test(s)) return { error: 'Lebanese numbers have 7 or 8 digits after +961.' };
  return { value: s };
}
