// Generates the seed-data migration (netlify/database/migrations/*_seed_content.sql).
// Run once while developing: `node scripts/make-seed.js`. The generated SQL file is what Netlify applies.
// Never edit or regenerate a migration that has already been applied in production — add a new one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED as CATALOG } from '../server/catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'netlify/database/migrations/20261016090100_seed_content.sql');
const T = '2026-10-16T09:01:00.000Z';
const q = v => v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const row = vals => `(${vals.map(q).join(', ')})`;
const insert = (table, cols, rows) => rows.length ? `INSERT INTO ${table} (${cols.join(', ')}) VALUES\n  ${rows.map(row).join(',\n  ')}\nON CONFLICT DO NOTHING;\n` : '';

// ---------- service categories (same ids the website uses) ----------
const CATEGORIES = [
  ['venue', 'Venues', 'Venue', 'building', 'Halls, restaurants, gardens, rooftops'],
  ['catering', 'Catering', 'Catering', 'utensils', 'Buffets, plated menus, bars'],
  ['photography', 'Photography', 'Photography', 'camera', 'Event and portrait photographers'],
  ['videography', 'Videography', 'Videography', 'video', 'Films, highlights, drone'],
  ['dj', 'DJs', 'DJ', 'music', 'DJs and sound setups'],
  ['entertainment', 'Entertainment', 'Entertainment', 'mic', 'Bands, performers, shows'],
  ['decoration', 'Decoration', 'Decoration', 'sparkle', 'Styling, themes, setups'],
  ['florist', 'Florists', 'Florist', 'flower', 'Bouquets and arrangements'],
  ['cake', 'Cake Shops', 'Cake', 'cake', 'Cakes, desserts, sweets'],
  ['planner', 'Event Planners', 'Event planner', 'clipboard', 'Full and partial planning'],
  ['rentals', 'Furniture & Rentals', 'Rentals', 'armchair', 'Chairs, tables, tents, lounges'],
  ['lighting', 'Lighting', 'Lighting', 'bulb', 'Ambient, stage, and LED lighting'],
  ['transportation', 'Transportation', 'Transportation', 'car', 'Cars, shuttles, valet'],
  ['makeup', 'Makeup', 'Makeup', 'brush', 'Makeup artists'],
  ['hair', 'Hair', 'Hair', 'scissors', 'Hairstylists and salons'],
  ['other', 'Other Services', 'Other', 'more', 'Invitations, favors, and more'],
];

// ---------- website content (editable later in Admin → Website) ----------
const SETTINGS = {
  contact: { phone: '+961 76 620 434', whatsapp: '96176620434', email: 'eventsmaak@gmail.com', instagram: 'ma3akevents', facebook: '', tiktok: '', address: 'Lebanon', hours: '' },
  hero: { eyebrow: 'Event planning in Lebanon', title: 'Plan your event, see the real costs, book with confidence', subtitle: 'Choose your event, compare providers and packages, and build a budget that updates as you go. Save it, share it, and send it to MA3AK when you’re ready.', primary: 'Start planning', secondary: 'Browse providers' },
  budgetIntro: { title: 'A budget that adds itself up', text: 'Add services from providers’ packages and the total updates instantly. Per-guest prices follow your guest count, you’re warned when you go over budget, and cheaper alternatives are one tap away. Prices are estimates until the provider confirms.' },
  howItWorks: [
    { title: 'Tell us about your event', text: 'Event type, date, area in Lebanon, guests, budget and the style you like.' },
    { title: 'Pick services and packages', text: 'Compare providers by category, price and area, and add packages to your plan.' },
    { title: 'Watch the budget', text: 'See the estimated total, what’s over budget, and lower-cost options.' },
    { title: 'Request quotes and book', text: 'Ask providers for a quote, or send the whole plan to MA3AK to arrange it with you.' },
  ],
  faqs: [
    { q: 'Are the prices final?', a: 'No. Prices shown are estimates provided by the providers (or illustrative prices on demo listings). Final prices depend on your date, guest count and details, and are confirmed by the provider in a quote.' },
    { q: 'Does it cost anything to plan an event?', a: 'Creating an account, saving plans and requesting quotes is free.' },
    { q: 'Is a provider available on my date?', a: 'Availability is only confirmed when the provider replies to your quote request. The website never assumes a date is free.' },
    { q: 'Who can see my plan?', a: 'Only you. Plans are private by default. If you create a share link, people with the link can view the plan without your contact details or private notes, and you can turn the link off at any time.' },
    { q: 'I’m a provider. How do I get listed?', a: 'Create a partner account, fill in your profile, packages and photos, and submit it for review. MA3AK checks every listing before it is published.' },
    { q: 'What are “demo” listings?', a: 'Sample providers that show how the planner works while real providers join. They are not real businesses and their prices are illustrative.' },
  ],
  themes: [
    { id: 'elegant', name: 'Elegant', description: 'Ivory, gold and soft candlelight.', colors: ['#F4EFE6', '#C9A45C', '#2B2B2B'] },
    { id: 'luxury', name: 'Luxury', description: 'Chandeliers, deep tones and grand florals.', colors: ['#1E1B2E', '#B8935A', '#F2E9DC'] },
    { id: 'modern', name: 'Modern', description: 'Clean lines, neon accents and LED walls.', colors: ['#111827', '#E5E7EB', '#7C3AED'] },
    { id: 'minimal', name: 'Minimal', description: 'Whites, greenery and plenty of space.', colors: ['#FFFFFF', '#D1D5DB', '#4B5563'] },
    { id: 'traditional', name: 'Traditional Lebanese', description: 'Zaffe, dabke, mezze and warm lanterns.', colors: ['#7F1D1D', '#F59E0B', '#FEF3C7'] },
    { id: 'boho', name: 'Boho Garden', description: 'Pampas, rattan, string lights under the trees.', colors: ['#E9D8C4', '#A3765A', '#6B7F5A'] },
    { id: 'beach', name: 'Beach Sunset', description: 'Sand, white drapes and sunset colours.', colors: ['#FDE68A', '#FB923C', '#0EA5E9'] },
  ],
  announcement: { active: false, text: '' },
  currency: 'USD',
};
const KB = [
  ['kb-services', 'Services', 'What MA3AK does', 'MA3AK helps customers in Lebanon plan events (weddings, engagements, birthdays, corporate events, private parties and more), compare providers and packages, build a budget, and request quotes. The team can also arrange the event with the customer.'],
  ['kb-contact', 'Contact', 'How to reach the team', 'Email: eventsmaak@gmail.com. Phone and WhatsApp: +961 76 620 434. Instagram: @ma3akevents.'],
  ['kb-pricing', 'Pricing', 'Prices', 'Prices shown on the website are estimates from providers’ packages. Demo listings use illustrative prices. Final prices are confirmed by the provider in a quote. Never promise a price or a date.'],
];

// ---------- demo providers: clearly labelled, never verified, no real contact details ----------
// Prices are illustrative USD figures for testing the planner, not offers.
const AREAS = ['beirut', 'metn', 'keserwan', 'jbeil', 'batroun', 'aley', 'chouf', 'bekaa', 'north', 'south'];
const DEMO = [
  ['demo-garden-venue', 'venue', 'Demo Garden Venue', 'metn keserwan', 'wedding engagement birthday outdoor private', 'Outdoor|Setup included|Custom packages', 80, 350, [
    ['Evening garden rental', 'Garden for one evening, tables and chairs for up to 250 guests.', 1800, 2400, 'flat', ['Tables and chairs', 'Basic lighting', 'Parking']],
    ['Garden + ceremony setup', 'Evening rental with a ceremony area and welcome corner.', 2600, 3200, 'flat', ['Ceremony aisle', 'Welcome corner', 'Bridal room']]]],
  ['demo-seaside-venue', 'venue', 'Demo Seaside Venue', 'jbeil batroun', 'wedding birthday beach corporate private', 'Outdoor|Sea view|Setup included', 50, 220, [
    ['Sunset terrace (dinner included)', 'Terrace with a set dinner menu, price per guest.', 55, 70, 'per_guest', ['Set dinner', 'Soft drinks', 'Waiters']],
    ['Private beach buy-out', 'Exclusive use of the beach area. Final price after a site visit.', null, null, 'flat', ['Exclusive access', 'Sun loungers']]]],
  ['demo-city-hall', 'venue', 'Demo City Ballroom', 'beirut', 'wedding corporate graduation engagement', 'Indoor|Setup included|Weekday availability', 100, 600, [
    ['Ballroom evening', 'Indoor ballroom with stage and dance floor.', 3500, 5000, 'flat', ['Stage', 'Dance floor', 'Sound system']]]],
  ['demo-mezze-catering', 'catering', 'Demo Mezze Catering', 'beirut metn keserwan aley', 'wedding engagement birthday private corporate', 'Delivery available|Custom packages', 30, 500, [
    ['Lebanese buffet', 'Cold and hot mezze, two mains, fruit.', 28, 35, 'per_guest', ['Mezze', '2 main dishes', 'Fruit platter', 'Staff']],
    ['Plated dinner', 'Three-course plated menu served at the table.', 42, 55, 'per_guest', ['Starter', 'Main course', 'Dessert', 'Waiters']],
    ['Open bar (4 hours)', 'Soft drinks, beer, wine and spirits.', 18, 25, 'per_guest', ['Bartenders', 'Ice', 'Glassware']]]],
  ['demo-street-food', 'catering', 'Demo Food Truck Co.', 'beirut jbeil batroun south', 'birthday private corporate outdoor beach', 'Outdoor|Delivery available', 20, 300, [
    ['Food truck service', 'Burgers or manakish truck for 3 hours.', 14, 18, 'per_guest', ['3 hours of service', 'Napkins and plates']]]],
  ['demo-lens-studio', 'photography', 'Demo Lens Studio', 'beirut metn keserwan jbeil', 'wedding engagement birthday graduation corporate', 'Arabic & English service|Custom packages', null, null, [
    ['Event coverage (5 hours)', 'One photographer, edited photos online.', 600, 800, 'flat', ['5 hours', '400+ edited photos', 'Online gallery']],
    ['Full wedding day', 'Two photographers from preparations to the last dance.', 1100, 1500, 'flat', ['2 photographers', 'Preparations', 'Online gallery', 'Album']]]],
  ['demo-motion-films', 'videography', 'Demo Motion Films', 'beirut metn jbeil batroun', 'wedding engagement corporate', 'Custom packages', null, null, [
    ['Highlight film', '3–5 minute edited highlight video.', 700, 900, 'flat', ['1 videographer', 'Highlight film']],
    ['Film + drone', 'Highlight film, full ceremony edit and drone shots.', 1300, 1700, 'flat', ['2 videographers', 'Drone', 'Full edit']]]],
  ['demo-beats-dj', 'dj', 'Demo Beats DJ', 'beirut metn keserwan jbeil aley chouf', 'wedding birthday private bachelor bachelorette graduation', 'Arabic & English service', null, null, [
    ['DJ set (4 hours)', 'DJ with standard sound system.', 400, 550, 'flat', ['4 hours', 'Sound system', 'Microphone']],
    ['DJ + lights', 'DJ, sound system and dance-floor lighting.', 650, 850, 'flat', ['5 hours', 'Sound', 'Dance-floor lights']],
    ['Extra hour', 'Each extra hour after the package.', 80, null, 'per_hour', []]]],
  ['demo-zaffe-troupe', 'entertainment', 'Demo Zaffe & Dabke Troupe', 'beirut metn keserwan north south', 'wedding engagement', 'Traditional', null, null, [
    ['Zaffe entrance', 'Traditional zaffe with drums for the entrance.', 450, 600, 'flat', ['6 performers', '20 minutes']],
    ['Zaffe + dabke show', 'Entrance plus a dabke performance.', 750, 950, 'flat', ['10 performers', '45 minutes']]]],
  ['demo-bloom-decor', 'decoration', 'Demo Bloom Decor', 'beirut metn keserwan jbeil aley', 'wedding engagement birthday baby-shower private', 'Setup included|Custom packages', null, null, [
    ['Essential styling', 'Backdrop, welcome sign and table styling.', 800, 1200, 'flat', ['Backdrop', 'Welcome sign', 'Table runners']],
    ['Full venue styling', 'Complete theme with flowers, kosha and lighting accents.', 2200, 3500, 'flat', ['Kosha', 'Flower wall', 'Centerpieces', 'Setup and removal']]]],
  ['demo-petals-florist', 'florist', 'Demo Petals Florist', 'beirut metn keserwan', 'wedding engagement birthday baby-shower', 'Delivery available', null, null, [
    ['Table centerpiece', 'Fresh seasonal centerpiece, per table.', 35, 60, 'per_item', ['Seasonal flowers', 'Vase']],
    ['Bridal bouquet', 'Hand-tied bouquet.', 120, 180, 'flat', ['Delivery']]]],
  ['demo-sweet-layers', 'cake', 'Demo Sweet Layers', 'beirut metn jbeil', 'wedding engagement birthday graduation baby-shower', 'Delivery available|Custom packages', null, null, [
    ['Celebration cake', 'Two-tier cake for up to 60 guests.', 150, 220, 'flat', ['2 tiers', 'Delivery']],
    ['Sweets table', 'Lebanese and French sweets, per guest.', 6, 9, 'per_guest', ['Display', 'Setup']]]],
  ['demo-cedar-rentals', 'rentals', 'Demo Cedar Rentals', 'beirut metn keserwan jbeil batroun aley chouf bekaa', 'wedding birthday corporate private outdoor beach', 'Delivery available|Setup included', null, null, [
    ['Chiavari chair', 'Per chair, delivered and collected.', 4, null, 'per_item', ['Cushion', 'Delivery']],
    ['Lounge set', 'Sofa, two armchairs and a coffee table.', 120, 160, 'per_item', ['Delivery and setup']],
    ['Clear-top tent (100 guests)', 'Tent with flooring. Final price after a site visit.', null, null, 'flat', []]]],
  ['demo-glow-lighting', 'lighting', 'Demo Glow Lighting', 'beirut metn keserwan jbeil', 'wedding corporate birthday private', 'Setup included', null, null, [
    ['Ambient package', 'Warm uplights and string lights.', 500, 750, 'flat', ['20 uplights', 'String lights']],
    ['Stage & LED wall', 'Moving heads and an LED screen.', 1600, 2400, 'flat', ['Technician', 'LED screen', 'Moving heads']]]],
  ['demo-classic-cars', 'transportation', 'Demo Classic Cars', 'beirut metn keserwan jbeil', 'wedding engagement', 'Custom packages', null, null, [
    ['Classic car with driver', 'Up to 3 hours, decorated.', 250, 350, 'flat', ['Driver', 'Decoration']]]],
  ['demo-glam-makeup', 'makeup', 'Demo Glam Makeup', 'beirut metn', 'wedding engagement graduation bachelorette', 'Arabic & English service', null, null, [
    ['Bridal makeup', 'Trial and wedding-day makeup.', 180, 250, 'flat', ['Trial session', 'Lashes']],
    ['Guest makeup', 'Per person.', 50, 70, 'per_item', []]]],
  ['demo-silk-hair', 'hair', 'Demo Silk Hair Studio', 'beirut metn keserwan', 'wedding engagement graduation', 'Arabic & English service', null, null, [
    ['Bridal hair', 'Trial and wedding-day styling.', 120, 180, 'flat', ['Trial session', 'Accessories fitting']]]],
  ['demo-day-planner', 'planner', 'Demo Day-of Planner', 'beirut metn keserwan jbeil batroun', 'wedding engagement corporate', 'Arabic & English service', null, null, [
    ['Day-of coordination', 'Coordinator on the day, timeline and vendor follow-up.', 900, 1200, 'flat', ['Timeline', 'Vendor coordination', '10 hours on site']],
    ['Full planning', 'From first idea to the last guest. Quoted after a meeting.', null, null, 'flat', ['Unlimited meetings', 'Budget management']]]],
];

let sql = `-- Seed content for MA3AK (generated by scripts/make-seed.js). Applied once by Netlify.
-- Demo providers are clearly labelled (is_demo = 1), never verified, and have no real contact details.

`;
sql += insert('categories', ['id', 'name', 'single', 'icon', 'blurb', 'sort', 'active', 'updated_at'], CATEGORIES.map((c, i) => [c[0], c[1], c[2], c[3], c[4], i, 1, T]));
sql += '\n' + insert('catalog_items', ['id', 'category', 'name', 'model', 'field', 'value', 'rarity', 'tags', 'popular', 'sort', 'updated_at'],
  CATALOG.map((r, i) => [r[0], r[1], r[2], r[3] || null, r[4] || null, r[5] || null, r[6], r[7], /popular/.test(r[7]) ? 1 : 0, i, T]));
sql += '\n' + insert('kb_entries', ['id', 'topic', 'title', 'body', 'updated_at'], KB.map(k => [...k, T]));
sql += '\n' + insert('site_settings', ['key', 'value', 'updated_at'], Object.entries(SETTINGS).map(([k, v]) => [k, JSON.stringify(v), T]));
const vendors = [], packages = [];
for (const [id, cat, name, locs, evs, services, capMin, capMax, pk] of DEMO) {
  if (!locs.split(' ').every(l => AREAS.includes(l))) throw new Error('bad area in ' + id);
  const prices = pk.map(p => p[2]).filter(p => p != null);
  vendors.push([id, name, cat, locs, evs, services,
    'Demo listing — a sample provider for trying the planner. Not a real business; prices are illustrative.',
    'This is a demo listing created by MA3AK so you can see how providers, packages and budgets work. It is not a real business, it cannot be booked, and its prices are illustrative only. Quote requests sent here go to the MA3AK team.',
    prices.length ? Math.min(...prices.map((p, i) => pk.find(x => x[2] === p)[4] === 'flat' ? p : p)) : null, capMin, capMax,
    'approved', 1, 0, 0, 1, T, 'Demo listing seeded by MA3AK', T, T, T]);
  pk.forEach((p, i) => packages.push([`${id}-p${i + 1}`, id, p[0], p[1], p[2], p[3], p[4], JSON.stringify(p[5]), 1, i, T, T]));
}
sql += '\n' + insert('vendors', ['id', 'name', 'category', 'locations', 'event_types', 'services', 'description', 'about', 'price_from', 'capacity_min', 'capacity_max',
  'status', 'active', 'verified', 'featured', 'is_demo', 'consent_at', 'consent_note', 'approved_at', 'created_at', 'updated_at'], vendors);
sql += '\n' + insert('vendor_packages', ['id', 'vendor_id', 'name', 'description', 'price', 'price_max', 'unit', 'includes', 'active', 'sort', 'created_at', 'updated_at'], packages);
// A few demo providers are featured on the homepage until real partners join (admin can change this).
sql += `\nUPDATE vendors SET featured = 1 WHERE id IN ('demo-garden-venue', 'demo-mezze-catering', 'demo-lens-studio', 'demo-bloom-decor');\n`;
fs.writeFileSync(OUT, sql);
console.log(`Wrote ${path.relative(root, OUT)}: ${CATEGORIES.length} categories, ${CATALOG.length} catalogue items, ${vendors.length} demo providers, ${packages.length} packages.`);
