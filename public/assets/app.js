"use strict";
/* ---- data.js ---- */
/* =========================================================
   CONFIG — official details. Replace the phone number here
   once it is available; it updates everywhere on the site.
   ========================================================= */
const CONFIG = {
  brand: 'MA3AK',
  email: 'eventsmaak@gmail.com',
  phone: '+961 76 620 434',
  phoneHref: 'tel:+96176620434',
  whatsapp: '96176620434',     // used for customizer requests (wa.me)
  instagramUrl: 'https://www.instagram.com/ma3akevents',
  instagramHandle: '@ma3akevents',
  year: 2026,
  country: 'Lebanon',
  updated: '4 October 2026'
};

/* =========================================================
   TAXONOMY — event types, vendor categories, locations, styles.
   These are MA3AK's own structure, not vendor data.
   ========================================================= */
const EVENT_TYPES = [
  { id:'wedding', name:'Wedding', icon:'ring', keywords:['wedding','weddings','bride','groom','marriage','zaffe','reception'],
    blurb:'From the ceremony to the last dance, bring every provider into one plan.',
    services:['venue','catering','photography','videography','dj','decoration','florist','cake','makeup','hair'] },
  { id:'engagement', name:'Engagement', icon:'heart', keywords:['engagement','engaged','proposal','khotbe'],
    blurb:'An intimate dinner or a full party, planned around what you want to spend.',
    services:['venue','catering','photography','decoration','florist','cake'] },
  { id:'birthday', name:'Birthday', icon:'gift', keywords:['birthday','bday','anniversary','kids party'],
    blurb:'Milestone birthdays, surprise parties, and children’s celebrations.',
    services:['venue','catering','decoration','cake','dj','entertainment'] },
  { id:'graduation', name:'Graduation', icon:'cap', keywords:['graduation','grad','graduate','commencement'],
    blurb:'Celebrate the milestone with family and friends without losing track of costs.',
    services:['venue','catering','decoration','dj','photography','cake'] },
  { id:'corporate', name:'Corporate Event', icon:'briefcase', keywords:['corporate','company','business','conference','launch','gala','team','office'],
    blurb:'Launches, dinners, conferences, and team events with clear budgets.',
    services:['venue','catering','lighting','photography','videography','rentals'] },
  { id:'private', name:'Private Party', icon:'glass', keywords:['private','party','dinner','gathering','house party'],
    blurb:'Dinners and gatherings at home, on a rooftop, or anywhere in between.',
    services:['catering','dj','decoration','rentals','lighting'] },
  { id:'baby-shower', name:'Baby Shower', icon:'baby', keywords:['baby','shower','gender reveal','newborn'],
    blurb:'Soft details, good food, and people who matter.',
    services:['venue','catering','decoration','cake','florist','photography'] },
  { id:'bachelor', name:'Bachelor Party', icon:'glass', keywords:['bachelor','stag'],
    blurb:'Plan the night out, the transport, and the soundtrack in one place.',
    services:['venue','dj','transportation','entertainment','catering'] },
  { id:'bachelorette', name:'Bachelorette Party', icon:'sparkle', keywords:['bachelorette','hen','bridal shower'],
    blurb:'From styling to the venue, keep every detail and cost together.',
    services:['venue','decoration','makeup','hair','dj','photography'] },
  { id:'beach', name:'Beach Event', icon:'umbrella', keywords:['beach','sea','seaside','coast','pool'],
    blurb:'Sunset setups on the coast with the right rentals and lighting.',
    services:['venue','catering','dj','decoration','rentals','lighting'] },
  { id:'outdoor', name:'Outdoor Event', icon:'tent', keywords:['outdoor','garden','mountain','open air','terrace','rooftop'],
    blurb:'Gardens, mountains, terraces, and rooftops, planned for the setting.',
    services:['venue','catering','rentals','lighting','decoration','dj'] },
  { id:'other', name:'Other Celebration', icon:'sparkle', keywords:['celebration','event','baptism','communion','reunion','holiday'],
    blurb:'Baptisms, reunions, holidays, or anything else worth celebrating.',
    services:['venue','catering','decoration','photography'] }
];
// Planner cards (Beach and Outdoor are combined in the planner)
const PLANNER_EVENTS = [
  ['wedding','Wedding'],['engagement','Engagement'],['birthday','Birthday'],['graduation','Graduation'],
  ['corporate','Corporate Event'],['private','Private Party'],['baby-shower','Baby Shower'],['beach','Beach / Outdoor'],['other','Other']
];

const CATEGORIES = [
  { id:'venue', name:'Venues', single:'Venue', icon:'building', weight:26, keywords:['venue','venues','hall','ballroom','restaurant','rooftop','garden','location','place','space'], blurb:'Halls, restaurants, gardens, rooftops' },
  { id:'catering', name:'Catering', single:'Catering', icon:'utensils', weight:32, keywords:['catering','caterer','caterers','food','buffet','menu','chef','mezze','drinks','bar'], blurb:'Buffets, plated menus, bars' },
  { id:'photography', name:'Photography', single:'Photography', icon:'camera', weight:8, keywords:['photography','photographer','photographers','photo','photos','pictures','shoot'], blurb:'Event and portrait photographers' },
  { id:'videography', name:'Videography', single:'Videography', icon:'video', weight:7, keywords:['videography','videographer','video','film','drone','reel'], blurb:'Films, highlights, drone' },
  { id:'dj', name:'DJs', single:'DJ', icon:'music', weight:7, keywords:['dj','djs','music','sound','playlist','deejay'], blurb:'DJs and sound setups' },
  { id:'entertainment', name:'Entertainment', single:'Entertainment', icon:'mic', weight:6, keywords:['entertainment','band','singer','live','dabke','performer','magician','kids entertainment'], blurb:'Bands, performers, shows' },
  { id:'decoration', name:'Decoration', single:'Decoration', icon:'sparkle', weight:10, keywords:['decoration','decor','decorator','decorators','styling','theme','setup','balloons'], blurb:'Styling, themes, setups' },
  { id:'florist', name:'Florists', single:'Florist', icon:'flower', weight:5, keywords:['florist','florists','flowers','floral','bouquet','arrangements'], blurb:'Bouquets and arrangements' },
  { id:'cake', name:'Cake Shops', single:'Cake', icon:'cake', weight:3, keywords:['cake','cakes','pastry','dessert','sweets','bakery'], blurb:'Cakes, desserts, sweets' },
  { id:'planner', name:'Event Planners', single:'Event planner', icon:'clipboard', weight:10, keywords:['planner','planners','planning','coordinator','organizer','wedding planner'], blurb:'Full and partial planning' },
  { id:'rentals', name:'Furniture & Rentals', single:'Rentals', icon:'armchair', weight:6, keywords:['rental','rentals','furniture','chairs','tables','tent','lounge'], blurb:'Chairs, tables, tents, lounges' },
  { id:'lighting', name:'Lighting', single:'Lighting', icon:'bulb', weight:5, keywords:['lighting','lights','light','stage','led'], blurb:'Ambient, stage, and LED lighting' },
  { id:'transportation', name:'Transportation', single:'Transportation', icon:'car', weight:4, keywords:['transportation','transport','car','cars','bus','limo','limousine','shuttle','valet'], blurb:'Cars, shuttles, valet' },
  { id:'makeup', name:'Makeup', single:'Makeup', icon:'brush', weight:3, keywords:['makeup','make up','mua','beauty'], blurb:'Makeup artists' },
  { id:'hair', name:'Hair', single:'Hair', icon:'scissors', weight:2, keywords:['hair','hairstylist','hairdresser','salon','blowdry'], blurb:'Hairstylists and salons' },
  { id:'other', name:'Other Services', single:'Other', icon:'more', weight:4, keywords:['other','invitations','favors','security','printing'], blurb:'Invitations, favors, and more' }
];

// Approximate region centers (used only for distance sorting).
const LOCATIONS = [
  { id:'beirut', name:'Beirut', keywords:['beirut','bayrut','achrafieh','hamra','downtown'], lat:33.8938, lng:35.5018 },
  { id:'metn', name:'Metn', keywords:['metn','matn','broummana','dbayeh','jdeideh'], lat:33.8930, lng:35.6300 },
  { id:'keserwan', name:'Keserwan', keywords:['keserwan','kesrouan','jounieh','kaslik','faraya'], lat:33.9800, lng:35.6500 },
  { id:'jbeil', name:'Jbeil', keywords:['jbeil','byblos'], lat:34.1230, lng:35.6519 },
  { id:'batroun', name:'Batroun', keywords:['batroun'], lat:34.2553, lng:35.6581 },
  { id:'aley', name:'Aley', keywords:['aley','bhamdoun'], lat:33.8050, lng:35.6000 },
  { id:'chouf', name:'Chouf', keywords:['chouf','deir el qamar','beiteddine'], lat:33.6900, lng:35.5800 },
  { id:'bekaa', name:'Bekaa', keywords:['bekaa','beqaa','zahle','baalbek'], lat:33.8463, lng:35.9020 },
  { id:'north', name:'North Lebanon', keywords:['north','tripoli','koura','zgharta','ehden'], lat:34.4367, lng:35.8497 },
  { id:'south', name:'South Lebanon', keywords:['south','saida','sidon','tyre','sour','nabatieh'], lat:33.5630, lng:35.3688 }
];

const STYLES = ['Elegant','Luxury','Modern','Minimal','Traditional','Outdoor','Beach','Custom'];

// Search/filter facets vendors will be able to tag themselves with.
const SERVICE_FACETS = ['Indoor','Outdoor','Sea view','Setup included','Delivery available','Custom packages','Weekday availability','Arabic & English service'];

/* =========================================================
   VENDORS — intentionally empty until real providers join.
   Each vendor record will follow this shape:
   {
     id:'slug', name:'', category:'venue', locations:['beirut'],
     eventTypes:['wedding'], services:['Indoor'], description:'',
     about:'', photos:[{src,alt}], startingPrice:number|null,
     packages:[{name, price, unit:'flat'|'per_guest', includes:[]}],
     capacity:{min,max}|null, rating:number|null, reviewCount:number,
     unavailableDates:['YYYY-MM-DD'], instagram:'', website:'',
     joinedAt:'YYYY-MM-DD', verified:boolean
   }
   ========================================================= */
const VENDORS = [];
let VENDORS_READY = Promise.resolve();

/* =========================================================
   API — swap these for real network calls later.
   ========================================================= */
const wait = ms => new Promise(r => setTimeout(r, ms));
const api = {
  async listVendors(){ await VENDORS_READY; return VENDORS.slice(); },
  async getVendor(id){ await VENDORS_READY; return VENDORS.find(v => v.id === id) || null; },
  async searchVendors(query, filters){ await VENDORS_READY; return applyFilters(searchVendorsLocal(query, VENDORS), filters); },
  countByCategory(id){ return VENDORS.filter(v => v.category === id).length; }
};

/* =========================================================
   SEARCH ENGINE — partial, multi-term, across all fields
   ========================================================= */
const norm = s => (s == null ? '' : String(s)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const STOP = new Set(['a','an','the','for','in','near','and','of','my','to','with','at','on','me','service','services','lebanon','best']);
function stem(t){
  if (t.length <= 4) return t;
  return t.replace(/ies$/,'y').replace(/(ers|ing)$/,'').replace(/s$/,'');
}
function queryTerms(q){ return norm(q).split(' ').filter(t => t && !STOP.has(t)); }
function termHits(term, hay){
  if (!term) return false;
  if (hay.includes(term)) return true;
  const s = stem(term);
  return s.length >= 2 && hay.includes(s);
}
const byId = (list, id) => list.find(x => x.id === id);
const catName = id => (byId(CATEGORIES,id)||{}).name || id;
const catSingle = id => (byId(CATEGORIES,id)||{}).single || id;
const locName = id => (byId(LOCATIONS,id)||{}).name || id;
const evName = id => (byId(EVENT_TYPES,id)||{}).name || id;

const HAY = {
  category: c => norm([c.name, c.single, c.blurb, ...c.keywords].join(' ')),
  event: e => norm([e.name, ...e.keywords].join(' ')),
  location: l => norm([l.name, ...l.keywords].join(' ')),
  vendor: v => norm([
    v.name, v.description, v.about,
    catName(v.category), catSingle(v.category), ...((byId(CATEGORIES,v.category)||{}).keywords||[]),
    ...(v.locations||[]).flatMap(id => { const l = byId(LOCATIONS,id); return l ? [l.name, ...l.keywords] : [id]; }),
    ...(v.eventTypes||[]).flatMap(id => { const e = byId(EVENT_TYPES,id); return e ? [e.name, ...e.keywords] : [id]; }),
    ...(v.services||[]), ...((v.packages||[]).map(p => p.name))
  ].join(' '))
};

// Taxonomy matches: anything where at least one term hits, ranked by hits.
function searchTaxonomy(q){
  const terms = queryTerms(q);
  if (!terms.length) return { categories:[], events:[], locations:[], terms };
  const rank = (list, hayFn) => list
    .map(item => { const h = hayFn(item); const hits = terms.filter(t => termHits(t,h)).length; const exact = terms.some(t => norm(item.name).startsWith(t)) ? 1 : 0; return { item, score: hits*2 + exact }; })
    .filter(x => x.score > 0).sort((a,b) => b.score - a.score).map(x => x.item);
  return { categories: rank(CATEGORIES, HAY.category), events: rank(EVENT_TYPES, HAY.event), locations: rank(LOCATIONS, HAY.location), terms };
}
// Vendor matches: every term must hit (so "wedding venue" means both).
function searchVendorsLocal(q, list){
  const terms = queryTerms(q);
  if (!terms.length) return list.map(v => ({ v, score:0 }));
  return list.map(v => { const h = HAY.vendor(v); const ok = terms.every(t => termHits(t,h)); const nameHit = terms.filter(t => norm(v.name).includes(t)).length; return ok ? { v, score: terms.length + nameHit*2 } : null; }).filter(Boolean);
}
function distanceKm(a, b){
  if (!a || !b) return Infinity;
  const R = 6371, dLat = (b.lat-a.lat)*Math.PI/180, dLng = (b.lng-a.lng)*Math.PI/180;
  const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function applyFilters(scored, f){
  f = f || {};
  let out = scored.filter(({v}) => {
    if (f.category && v.category !== f.category) return false;
    if (f.location && !(v.locations||[]).includes(f.location)) return false;
    if (f.event && !(v.eventTypes||[]).includes(f.event)) return false;
    const p = v.startingPrice;
    if (f.min && (p == null || p < +f.min)) return false;
    if (f.max && (p == null || p > +f.max)) return false;
    if (f.guests && v.capacity && (+f.guests > v.capacity.max || +f.guests < (v.capacity.min||0))) return false;
    if (f.rating && (v.rating == null || v.rating < +f.rating)) return false;
    if (f.date && (v.unavailableDates||[]).includes(f.date)) return false;
    if (f.services && f.services.length && !f.services.every(s => (v.services||[]).includes(s))) return false;
    return true;
  });
  const origin = byId(LOCATIONS, f.location || 'beirut');
  const nearest = v => Math.min(...(v.locations||[]).map(id => distanceKm(origin, byId(LOCATIONS,id))));
  const sorters = {
    recommended: (a,b) => b.score - a.score || (b.v.verified?1:0) - (a.v.verified?1:0),
    price: (a,b) => (a.v.startingPrice ?? Infinity) - (b.v.startingPrice ?? Infinity),
    'price-desc': (a,b) => (b.v.startingPrice ?? -1) - (a.v.startingPrice ?? -1),
    rating: (a,b) => (b.v.rating ?? -1) - (a.v.rating ?? -1),
    distance: (a,b) => nearest(a.v) - nearest(b.v),
    newest: (a,b) => String(b.v.joinedAt||'').localeCompare(String(a.v.joinedAt||''))
  };
  out.sort(sorters[f.sort] || sorters.recommended);
  return out.map(x => x.v);
}

/* =========================================================
   PLANNING — budget split and task generation
   ========================================================= */
const BUFFER = 0.10; // 10% kept aside for surprises
function suggestSplit(budget, serviceIds){
  const cats = serviceIds.map(id => byId(CATEGORIES,id)).filter(Boolean);
  const totalW = cats.reduce((s,c) => s + c.weight, 0) || 1;
  const spend = budget * (1 - BUFFER);
  return cats.map(c => ({ cat:c.id, amount: Math.max(0, Math.round(spend * c.weight / totalW / 10) * 10) }));
}
function fitToBudget(lines, budget){
  const total = lines.reduce((s,l) => s + (+l.amount||0), 0);
  if (!total) return lines;
  const k = budget / total;
  const out = lines.map(l => ({ ...l, amount: Math.floor((+l.amount||0) * k / 10) * 10 }));
  return out;
}
const TASKS = [
  { id:'t-budget', label:'Confirm your total budget', offset:-120 },
  { id:'t-guests', label:'Draft your guest list', offset:-100 },
  { id:'t-planner', label:'Choose an event planner', offset:-100, cat:'planner' },
  { id:'t-venue', label:'Shortlist and book a venue', offset:-90, cat:'venue' },
  { id:'t-catering', label:'Choose a caterer and schedule a tasting', offset:-60, cat:'catering' },
  { id:'t-photography', label:'Book your photographer', offset:-60, cat:'photography' },
  { id:'t-videography', label:'Book your videographer', offset:-60, cat:'videography' },
  { id:'t-dj', label:'Book a DJ and share your playlist', offset:-45, cat:'dj' },
  { id:'t-entertainment', label:'Confirm entertainment and set times', offset:-45, cat:'entertainment' },
  { id:'t-decoration', label:'Finalize decoration and theme', offset:-35, cat:'decoration' },
  { id:'t-florist', label:'Order flowers', offset:-30, cat:'florist' },
  { id:'t-rentals', label:'Reserve furniture and rentals', offset:-30, cat:'rentals' },
  { id:'t-lighting', label:'Plan lighting with the venue', offset:-30, cat:'lighting' },
  { id:'t-invites', label:'Send invitations', offset:-30 },
  { id:'t-cake', label:'Order the cake', offset:-21, cat:'cake' },
  { id:'t-transportation', label:'Arrange transportation', offset:-14, cat:'transportation' },
  { id:'t-makeup', label:'Book a makeup trial', offset:-14, cat:'makeup' },
  { id:'t-hair', label:'Book a hair trial', offset:-14, cat:'hair' },
  { id:'t-other', label:'Arrange remaining services', offset:-14, cat:'other' },
  { id:'t-confirm', label:'Confirm timings with every vendor', offset:-7 },
  { id:'t-pay', label:'Settle remaining vendor payments', offset:-3 }
];
function tasksFor(plan){
  const date = plan.date ? new Date(plan.date + 'T12:00:00') : null;
  return TASKS.filter(t => !t.cat || plan.services.includes(t.cat)).map(t => {
    let due = null;
    if (date){ due = new Date(date); due.setDate(due.getDate() + t.offset); }
    return { ...t, due };
  });
}

/* ---- logo.js ---- */
const LOGO = { mark:'data:image/png;base64,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', word:'data:image/png;base64,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' };

/* ---- core.js ---- */
/* =========================================================
   ICONS (Lucide paths, inlined to avoid extra requests)
   ========================================================= */
const ICONS = {
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  instagram:'<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  minus:'<path d="M5 12h14"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  image:'<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  star:'<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  store:'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M2 7h20M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trend:'<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  scale:'<path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a4 4 0 0 0 6 0zM18 7l-3 7a4 4 0 0 0 6 0z"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  mailbox:'<path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><path d="M15 9h3v2M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2M6 10h1"/>',
  seat:'<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2M19 18v2"/>',
  palette:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  message:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  wand:'<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72M14 7l3 3M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9"/>',
  boat:'<path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z"/><path d="M21 14 10 2 3 14h18Z"/><path d="M10 2v16"/>',
  mountain:'<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo:'<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>',
  play:'<path d="m7 4 13 8-13 8z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sunset:'<path d="M12 10V2M5.2 11.2l1.4 1.4M2 18h2M20 18h2M17.4 12.6l1.4-1.4M22 22H2M16 18a4 4 0 0 0-8 0M8 6l4-4 4 4"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M9 13h6M9 17h4"/>',
  panel:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  // categories
  building:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/>',
  utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  video:'<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16v5M16.5 18.5h5"/>',
  flower:'<circle cx="12" cy="8" r="3"/><path d="M12 11v11M12 5V2M9 8H6M18 8h-3M8 17c-2.2 0-3.5-1.3-3.5-3.5 2.2 0 3.5 1.3 3.5 3.5ZM16 19c2.2 0 3.5-1.3 3.5-3.5-2.2 0-3.5 1.3-3.5 3.5Z"/>',
  cake:'<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
  clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 14l2 2 4-4"/>',
  armchair:'<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2M19 18v2"/>',
  bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  brush:'<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>',
  scissors:'<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  // events
  ring:'<circle cx="12" cy="15" r="6"/><path d="m9.5 5 2.5 3 2.5-3-1-2h-3z"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  cap:'<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
  briefcase:'<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  glass:'<path d="M8 22h8M12 11v11M5 3h14l-1.5 5.5a5.7 5.7 0 0 1-11 0z"/>',
  baby:'<circle cx="12" cy="12" r="9"/><path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M12 3c1.5 1.5 1.5 3 0 4"/>',
  umbrella:'<path d="M22 12a10 10 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0M12 2v1"/>',
  tent:'<path d="M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20"/>'
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]||ICONS.more}</svg>`;

/* =========================================================
   HELPERS
   ========================================================= */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$' + Math.round(+n||0).toLocaleString('en-US');
const fmtDate = (d, opts={day:'numeric',month:'long',year:'numeric'}) => { if(!d) return ''; const x = typeof d === 'string' ? new Date(d+'T12:00:00') : d; return isNaN(x) ? '' : x.toLocaleDateString('en-GB', opts); };
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const qs = obj => { const p = new URLSearchParams(); Object.entries(obj).forEach(([k,v]) => { if (Array.isArray(v)) { if (v.length) p.set(k, v.join(',')); } else if (v !== '' && v != null) p.set(k, v); }); const s = p.toString(); return s ? '?' + s : ''; };
const igLink = (cls='icon-btn', label='MA3AK on Instagram (opens in a new tab)') => `<a class="${cls}" href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon('instagram')}</a>`;
const mailLink = (cls='') => `<a class="${cls}" href="mailto:${CONFIG.email}">${CONFIG.email}</a>`;
const phoneText = (cls='') => CONFIG.phoneHref ? `<a class="${cls}" href="${CONFIG.phoneHref}">${CONFIG.phone}</a>` : `<span class="${cls}" title="Phone number coming soon">${CONFIG.phone}</span>`;

/* =========================================================
   STORE — local persistence (swap for user accounts later)
   ========================================================= */
const store = (() => {
  const KEY = 'ma3ak:v1';
  let state = { plan:null, tasks:{}, myVendors:[], vendorDraft:null };
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(state, JSON.parse(raw)); } catch(e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {} };
  return {
    get: k => state[k],
    set(k, v){ state[k] = v; save(); },
    toggleTask(id){ state.tasks[id] = !state.tasks[id]; save(); return state.tasks[id]; },
    addVendor(v){ if (!state.myVendors.find(x => x.id === v.id)) { state.myVendors.push({ id:v.id, name:v.name, category:v.category, status:'pending' }); save(); return true; } return false; },
    reset(){ state.plan = null; state.tasks = {}; save(); }
  };
})();

/* =========================================================
   SHARED COMPONENTS
   ========================================================= */
function Logo({ tag='a', href='#/', label=true } = {}){
  return `<${tag} class="logo" ${tag==='a'?`href="${href}"`:''} ${label?'aria-label="MA3AK home"':''}><img class="logo-mark" src="${LOGO.mark}" alt="" width="34" height="34"><img class="logo-word" src="${LOGO.word}" alt="MA3AK" width="112" height="19"></${tag}>`;
}
function SectionHeader({ title, lede='', level='h2', cls='h2', aside='' }){
  return `<div class="section-head"><div><${level} class="${cls}">${title}</${level}>${lede?`<p class="lede">${lede}</p>`:''}</div>${aside}</div>`;
}
function EmptyState({ iconName='search', title, text, actions='', level='h3' }){
  return `<div class="empty"><div class="card-ico">${icon(iconName)}</div><${level}>${title}</${level}><p>${text}</p>${actions?`<div class="actions">${actions}</div>`:''}</div>`;
}
function VendorCard(v){
  const photo = v.photos && v.photos[0];
  const loc = (v.locations||[]).map(locName).join(', ');
  return `<article class="vendor-card">
    <div class="vc-img">${photo ? `<img src="${esc(photo.src)}" alt="${esc(photo.alt||v.name)}" loading="lazy" decoding="async">` : `<div class="ph">${icon('image')}</div>`}</div>
    <div class="vc-body">
      <span class="tag">${esc(catSingle(v.category))}</span>${v.isDemo ? ' <span class="tag demo-tag" title="A sample listing for trying the planner. Not a real business; prices are illustrative.">Demo listing</span>' : ''}${v.verified ? ` <span class="tag gold">${icon('check','sm')}Verified</span>` : ''}
      <h3 class="h3">${esc(v.name)}</h3>
      <div class="vc-meta"><span>${icon('pin','sm')}${esc(loc)}</span>${v.rating!=null?`<span>${icon('star','sm')}${v.rating.toFixed(1)} (${v.reviewCount})</span>`:''}</div>
      <p class="muted small">${esc(v.description||'')}</p>
      ${v.startingPrice!=null?`<p class="vc-price">From <b>${money(v.startingPrice)}</b>${({ per_guest:' / guest', per_hour:' / hour', per_item:' each' })[v.startingUnit] || ''}${v.isDemo ? ' <small class="muted">(illustrative)</small>' : ''}</p>`:`<p class="vc-price muted">Price on request</p>`}
      <div class="vc-actions"><a class="btn btn-ghost btn-sm" href="#/vendor/${esc(v.id)}">View profile</a><button class="btn btn-primary btn-sm" data-add-vendor="${esc(v.id)}">Add to plan</button></div>
    </div></article>`;
}
function Skeletons(n=6){ return Array.from({length:n}, () => `<div class="skeleton" aria-hidden="true"><div class="sk-img"></div><div class="sk-line" style="width:40%"></div><div class="sk-line" style="width:75%"></div><div class="sk-line" style="width:55%;margin-bottom:22px"></div></div>`).join(''); }
function FormField({ id, label, type='text', required=false, showOpt=true, placeholder='', options=null, hint='', autocomplete='', value='', inputmode='' }){
  const req = required ? ' required aria-required="true"' : '';
  const described = `aria-describedby="${id}-err${hint?` ${id}-hint`:''}"`;
  let control;
  if (options) control = `<select class="select" id="${id}" name="${id}"${req} ${described}><option value="">${esc(placeholder||'Select')}</option>${options.map(o => `<option value="${esc(o.value)}"${o.value===value?' selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
  else if (type==='textarea') control = `<textarea class="textarea" id="${id}" name="${id}"${req} placeholder="${esc(placeholder)}" ${described}>${esc(value)}</textarea>`;
  else control = `<input class="input" id="${id}" name="${id}" type="${type}"${req} placeholder="${esc(placeholder)}" value="${esc(value)}"${autocomplete?` autocomplete="${autocomplete}"`:''}${inputmode?` inputmode="${inputmode}"`:''} ${described}>`;
  return `<div class="field"><label for="${id}">${label}${required||!showOpt?'':' <span class="opt">(optional)</span>'}</label>${control}${hint?`<span class="hint" id="${id}-hint">${hint}</span>`:''}<span class="err" id="${id}-err" role="alert"></span></div>`;
}
const opt = (list, key='id', lab='name') => list.map(x => ({ value:x[key], label:x[lab] }));

function validateForm(form, rules){
  let firstBad = null;
  Object.entries(rules).forEach(([id, check]) => {
    const el = form.elements[id]; if (!el) return;
    const field = el.closest('.field');
    const msg = check((el.value||'').trim());
    field.classList.toggle('invalid', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = $('#'+id+'-err', form); if (err) err.textContent = msg || '';
    if (msg && !firstBad) firstBad = el;
  });
  if (firstBad) firstBad.focus();
  return !firstBad;
}
const V = {
  req: label => v => v ? '' : `Enter ${label}.`,
  email: v => !v ? 'Enter your email address.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter an email like name@example.com.'),
  phoneOpt: v => !v || /^[+\d][\d\s\-()]{6,}$/.test(v) ? '' : 'Enter a valid phone number.',
  phoneReq: v => !v ? 'Enter a phone number.' : (/^[+\d][\d\s\-()]{6,}$/.test(v) ? '' : 'Enter a valid phone number.'),
  select: label => v => v ? '' : `Choose ${label}.`,
  urlOpt: v => !v || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+\S*$/.test(v) ? '' : 'Enter a valid web address.',
  min: (label, n) => v => v.length >= n ? '' : `${label} needs at least ${n} characters.`
};

let toastTimer;
function toast(msg, iconName='check'){
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); t.innerHTML = icon(iconName,'sm') + `<span>${msg}</span>`;
  document.body.appendChild(t); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 3200);
}

let lastFocus = null;
function openModal({ title, body, onMount, wide=false }){
  closeModal(); lastFocus = document.activeElement;
  const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="modal-backdrop" data-close></div><div class="modal-card${wide?' wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="icon-btn modal-close" data-close aria-label="Close">${icon('x')}</button><h2 id="modal-title">${title}</h2><div class="modal-body" style="margin-top:1rem">${body}</div></div>`;
  document.body.appendChild(m); document.body.style.overflow = 'hidden';
  m.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  m.addEventListener('keydown', trapFocus);
  const first = m.querySelector('input,select,textarea,button:not(.modal-close)') || m.querySelector('button'); first && first.focus();
  onMount && onMount(m);
}
function closeModal(){ if (window._modalCleanup){ try { window._modalCleanup(); } catch(e){} window._modalCleanup = null; } const m = $('#modal'); if (m){ m.remove(); document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); } }
function trapFocus(e){
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); closeSearch(); return; }
  if (e.key !== 'Tab') return;
  const f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', e.currentTarget).filter(x => x.offsetParent !== null);
  if (!f.length) return; const first = f[0], last = f[f.length-1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* API — all forms post JSON to the MA3AK server */
async function apiPost(path, body){
  let r;
  try { r = await fetch(path, { method:'POST', headers:{ 'Content-Type':'application/json' }, credentials:'same-origin', body:JSON.stringify(body) }); }
  catch(e){ throw Object.assign(new Error('You seem to be offline. Check your connection and try again.'), { offline:true }); }
  let j = null; try { j = await r.json(); } catch(e){}
  if (!r.ok || !j || !j.ok) throw Object.assign(new Error((j && j.error) || 'Something went wrong. Please try again.'), { status:r.status, fields:(j && j.fields) || {} });
  return j;
}
/* Spam traps: a hidden field bots fill in, and how long the form was open */
const HONEYPOT = `<div class="hp" aria-hidden="true"><label>Leave this field empty <input type="text" name="company_site" tabindex="-1" autocomplete="off"></label></div>`;
const formMeta = f => ({ company_site:(f.elements.company_site && f.elements.company_site.value) || '', elapsed:Date.now() - (+f.dataset.t || Date.now()) });
const stampForm = f => { f.dataset.t = Date.now(); };
function ConsentField(id){ return `<div class="field consent" data-consent><label class="check"><input type="checkbox" id="${id}" name="${id}" required aria-describedby="${id}-err"> I agree to the <a class="link" href="#/privacy" target="_blank">Privacy Policy</a> and <a class="link" href="#/terms" target="_blank">Terms</a>.</label><span class="err" id="${id}-err" role="alert"></span></div>`; }
function consentOk(f, id){ const el = f.elements[id], ok = el && el.checked; const fld = el && el.closest('.field'); if (fld){ fld.classList.toggle('invalid', !ok); $('#'+id+'-err', f).textContent = ok ? '' : 'Please accept to continue.'; } if (!ok && el) el.focus(); return ok; }
function showServerErrors(f, err, map={}){ Object.entries(err.fields || {}).forEach(([k,msg]) => { const id = map[k] || k; const el = f.elements[id]; if (!el) return; const fld = el.closest('.field'); fld && fld.classList.add('invalid'); const e = $('#'+id+'-err', f); if (e) e.textContent = msg; }); }
function busy(btn, on, label){ if (on){ btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + (label || 'Sending'); } else { btn.disabled = false; btn.innerHTML = btn.dataset.label || btn.innerHTML; } }
function sentPanel({ title, text, refNo, extra='' }){
  return `<div class="form-success" tabindex="-1"><div class="card-ico">${icon('check')}</div><h3>${title}</h3><p>${text}</p>${refNo ? `<p class="small" style="margin-top:.6rem">Reference <b>${esc(refNo)}</b></p>` : ''}
    <div class="actions"><a class="btn btn-ghost" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi MA3AK, about my request ' + (refNo || ''))}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}Message us on WhatsApp</a>${extra}</div></div>`;
}
/* Email hand-off kept as a fallback when the server can't be reached */
function mailto(subject, lines){ return `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`; }
function successPanel({ title, text, href, copyText, extra='' }){
  return `<div class="form-success" tabindex="-1"><div class="card-ico">${icon('check')}</div><h3>${title}</h3><p>${text}</p>
    <div class="actions"><a class="btn btn-primary" href="${href}">${icon('send','sm')}Open email to send</a><button class="btn btn-ghost" type="button" data-copy="${esc(copyText)}">${icon('copy','sm')}Copy message</button>${extra}</div></div>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); toast('Message copied'); } catch(err) { toast('Copy isn’t available here. Use the email button instead.','alert'); }
});

/* "Add to plan" on provider cards is handled in market.js (saved to the customer's plan on the server). */
// Shrink a photo before upload (the server accepts up to 4 MB per image).
async function shrinkImage(dataUrl, max = 1600, q = .82){
  if (!dataUrl) return dataUrl;
  try { const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
    const k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); return cv.toDataURL('image/jpeg', q); } catch(e){ return dataUrl; }
}

/* =========================================================
   HEADER / FOOTER / MOBILE MENU
   ========================================================= */
const NAV = [['#/','Home'],['#/plan','Planner'],['#/events','Events'],['#/customize','Customize'],['#/vendors','Providers'],['#/about','About'],['#/contact','Contact']];
function Header(){
  return `<a class="skip" href="#main">Skip to content</a>
  <header class="site-header" id="site-header"><div class="wrap header-row">
    ${Logo()}
    <nav class="nav" aria-label="Main">${NAV.map(([h,l]) => `<a href="${h}" data-nav="${h}"${h==='#/customize'?' class="nav-cz"':''}>${h==='#/customize'?icon('wand','sm'):''}${l}</a>`).join('')}</nav>
    <div class="header-actions">
      <button class="search-trigger" type="button" data-open-search aria-label="Search vendors, venues, DJs, photographers">${icon('search','sm')}<span class="st-text">Search vendors, venues…</span><kbd>/</kbd></button>
      <a class="for-vendors" href="#/for-vendors">For Vendors</a>
      ${igLink('icon-btn header-ig')}
      <button class="lang-btn" type="button" data-lang-open aria-label="Language"><span data-lang-cur>EN</span></button>
      <a class="acct-btn" id="acct-btn" href="#/login" aria-label="Sign in">${icon('users','sm')}<span class="acct-l">Sign in</span></a>
      <a class="btn btn-primary btn-sm header-cta" href="#/customize">Create your event</a>
      <button class="icon-btn only-mobile" type="button" id="menu-open" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">${icon('menu')}</button>
    </div>
  </div></header>
  <div class="mobile-menu" id="mobile-menu" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="mm-top">${Logo()}<button class="icon-btn" type="button" id="menu-close" aria-label="Close menu">${icon('x')}</button></div>
    <nav aria-label="Mobile">${NAV.map(([h,l]) => `<a href="${h}">${l}</a>`).join('')}<a href="#/for-vendors">For Vendors</a><a href="#/dashboard">My events</a><button type="button" class="link" data-lang-open>Language</button></nav>
    <div class="mm-foot">
      <a class="btn btn-light btn-block" href="#/customize">Create your event</a>
      <div class="mm-contact">${mailLink()}${igLink('icon-btn')}</div>
    </div>
  </div>`;
}
function Footer(){
  const links = [['#/','Home'],['#/plan','Budget planner'],['#/how-it-works','How It Works'],['#/events','Events'],['#/vendors','Providers'],['#/about','About'],['#/partner/join','Become a partner'],['#/contact','Contact']];
  return `<footer class="site-footer"><div class="wrap">
    <div class="f-top">
      <div class="f-brand">${Logo()}<p class="f-tagline">Your event. Your budget. Your plan.</p></div>
      <div><h2>Explore</h2><ul>${links.map(([h,l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>
      <div><h2>Plan</h2><ul><li><a href="#/plan">Event Planner</a></li><li><a href="#/customize">Customize your event</a></li><li><a href="#/dashboard">My Event</a></li><li><a href="#/search">Search vendors</a></li><li><a href="#/for-vendors">Join as a vendor</a></li></ul></div>
      <div><h2>Contact</h2><ul class="f-contact"><li>${icon('mail','sm')}${mailLink()}</li><li>${icon('phone','sm')}${phoneText()}</li><li>${icon('pin','sm')}<span>${CONFIG.country}</span></li></ul>${igLink('ig-btn')}</div>
    </div>
    <div class="f-bottom"><span>© ${CONFIG.year} MA3AK. All rights reserved.</span><span class="f-legal"><a href="#/privacy">Privacy Policy</a><a href="#/terms">Terms</a><button type="button" class="link" data-lang-open>Language</button></span><span>Built for events across Lebanon.</span></div>
  </div></footer>`;
}
function setupHeader(){
  const menu = $('#mobile-menu'), openBtn = $('#menu-open');
  const open = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); openBtn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; setTimeout(() => $('#menu-close').focus(), 50); };
  const close = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); openBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
  openBtn.addEventListener('click', open); $('#menu-close').addEventListener('click', () => { close(); openBtn.focus(); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  menu.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); openBtn.focus(); } else trapFocus(e); });
  const onScroll = () => $('#site-header').classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive:true }); onScroll();
  window._closeMenu = close;
}

/* =========================================================
   GLOBAL SEARCH (command palette / mobile full-screen)
   ========================================================= */
function SearchOverlay(){
  return `<div class="search-overlay" id="search-overlay" aria-hidden="true">
    <div class="so-backdrop" data-close-search></div>
    <div class="so-panel" role="dialog" aria-modal="true" aria-label="Search MA3AK">
      <form class="so-field" id="so-form" role="search">
        ${icon('search')}
        <label class="sr-only" for="so-input">Search vendors, venues, DJs, photographers</label>
        <input id="so-input" type="search" autocomplete="off" placeholder="Search vendors, venues, DJs, photographers…" role="combobox" aria-expanded="true" aria-controls="so-list" aria-autocomplete="list">
        <button class="icon-btn" type="button" data-close-search aria-label="Close search">${icon('x')}</button>
      </form>
      <div class="so-body" id="so-list" role="listbox" aria-label="Suggestions"></div>
      <div class="so-foot"><span>Enter to see all results</span><span>Esc to close</span></div>
    </div></div>`;
}
let soIndex = -1;
function renderSuggestions(q){
  const list = $('#so-list');
  if (!q.trim()){
    const popular = ['venue','catering','dj','photography','decoration','entertainment'];
    list.innerHTML = `<div class="so-group"><h3>Browse categories</h3><div class="so-chips">${popular.map(id => { const c = byId(CATEGORIES,id); return `<a class="chip" href="#/search${qs({category:id})}">${icon(c.icon)}${c.name}</a>`; }).join('')}</div></div>
      <div class="so-group"><h3>Plan by event</h3><div class="so-chips">${['wedding','birthday','graduation','corporate','engagement','beach'].map(id => `<a class="chip" href="#/search${qs({event:id})}">${evName(id)}</a>`).join('')}</div></div>
      <div class="so-group"><h3>Search by area</h3><div class="so-chips">${LOCATIONS.slice(0,6).map(l => `<a class="chip" href="#/search${qs({location:l.id})}">${l.name}</a>`).join('')}</div></div>`;
    soIndex = -1; return;
  }
  const r = searchTaxonomy(q);
  const vend = searchVendorsLocal(q, VENDORS).slice(0,4).map(x => x.v);
  const item = (href, ico, title, sub) => `<a class="so-item" role="option" aria-selected="false" href="${href}"><span class="so-ico">${icon(ico,'sm')}</span><span>${title}<small>${sub}</small></span></a>`;
  let html = `<div class="so-group"><a class="so-item" role="option" aria-selected="false" href="#/search${qs({q})}"><span class="so-ico">${icon('search','sm')}</span><span>Search for “${esc(q)}”<small>All vendors and categories</small></span></a></div>`;
  if (vend.length) html += `<div class="so-group"><h3>Vendors</h3>${vend.map(v => item('#/vendor/'+esc(v.id),'store',esc(v.name),esc(catSingle(v.category))+' in '+esc((v.locations||[]).map(locName).join(', ')))).join('')}</div>`;
  if (r.categories.length) html += `<div class="so-group"><h3>Categories</h3>${r.categories.slice(0,4).map(c => item('#/search'+qs({category:c.id}), c.icon, c.name, c.blurb)).join('')}</div>`;
  if (r.events.length) html += `<div class="so-group"><h3>Event types</h3>${r.events.slice(0,3).map(e => item('#/search'+qs({event:e.id}), e.icon, e.name, 'Vendors for '+e.name.toLowerCase()+'s')).join('')}</div>`;
  if (r.locations.length) html += `<div class="so-group"><h3>Locations</h3>${r.locations.slice(0,3).map(l => item('#/search'+qs({location:l.id}), 'pin', l.name, 'Vendors serving '+l.name)).join('')}</div>`;
  list.innerHTML = html; soIndex = -1;
}
function openSearch(prefill=''){
  const o = $('#search-overlay'); o.classList.add('open'); o.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  const i = $('#so-input'); i.value = prefill; renderSuggestions(prefill); setTimeout(() => i.focus(), 30);
}
function closeSearch(){ const o = $('#search-overlay'); if (!o || !o.classList.contains('open')) return; o.classList.remove('open'); o.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
function setupSearch(){
  const o = $('#search-overlay'), input = $('#so-input');
  document.addEventListener('click', e => { if (e.target.closest('[data-open-search]')) { e.preventDefault(); window._closeMenu && window._closeMenu(); openSearch(); } });
  o.addEventListener('click', e => { if (e.target.closest('[data-close-search]')) closeSearch(); if (e.target.closest('a')) closeSearch(); });
  input.addEventListener('input', () => renderSuggestions(input.value));
  $('#so-form').addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); closeSearch(); location.hash = '#/search' + qs({ q }); });
  o.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeSearch(); return; }
    const items = $$('.so-item', o); if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      e.preventDefault(); soIndex = (soIndex + (e.key==='ArrowDown'?1:-1) + items.length) % items.length;
      items.forEach((it,i) => it.setAttribute('aria-selected', i===soIndex ? 'true':'false')); items[soIndex].scrollIntoView({ block:'nearest' });
    } else if (e.key === 'Enter' && soIndex >= 0 && document.activeElement === input){ e.preventDefault(); items[soIndex].click(); location.hash = items[soIndex].getAttribute('href'); }
  });
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (!typing && (e.key === '/' || ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'))) { e.preventDefault(); openSearch(); }
  });
}

/* ---- scene.js ---- */
/* =========================================================
   3D EVENT SCENES — isometric illustrations rendered as SVG.
   Example visualizations only; not real venues.
   ========================================================= */
const ISO_S = 30;
const P = (x, y, z=0) => [(x - y) * 0.8660 * ISO_S, (x + y) * 0.5 * ISO_S - z * ISO_S];
const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
function shade(hex, k){
  const h = hex.replace('#',''); const c = [0,2,4].map(i => parseInt(h.slice(i,i+2),16));
  return 'rgb(' + c.map(v => Math.round(Math.max(0, Math.min(255, k <= 1 ? v * k : v + (255 - v) * (k - 1))))).join(',') + ')';
}
function makeScene(){
  const items = [];
  const S = {
    add(d, svg){ items.push({ d, svg }); return S; },
    poly(points, fill, d=-100, extra=''){ return S.add(d, `<polygon points="${pts(points)}" fill="${fill}" ${extra}/>`); },
    box(x, y, z, w, dp, h, col, o={}){
      const top = [P(x,y,z+h), P(x+w,y,z+h), P(x+w,y+dp,z+h), P(x,y+dp,z+h)];
      const fx = [P(x+w,y,z), P(x+w,y+dp,z), P(x+w,y+dp,z+h), P(x+w,y,z+h)];
      const fy = [P(x,y+dp,z), P(x+w,y+dp,z), P(x+w,y+dp,z+h), P(x,y+dp,z+h)];
      const st = o.stroke ? ` stroke="${o.stroke}" stroke-width=".5"` : '';
      return S.add(o.depth ?? (x + w/2 + y + dp/2 + z*0.02),
        `<polygon points="${pts(fy)}" fill="${shade(col, o.ky ?? .88)}"${st}/><polygon points="${pts(fx)}" fill="${shade(col, o.kx ?? .74)}"${st}/><polygon points="${pts(top)}" fill="${o.top || shade(col, 1.06)}"${st}/>` + (o.after || ''));
    },
    cyl(cx, cy, z, r, h, col, o={}){
      const c = P(cx, cy, z), t = P(cx, cy, z + h), rx = 1.2247 * r * ISO_S, ry = 0.7071 * r * ISO_S;
      const side = `<path d="M${(c[0]-rx).toFixed(1)} ${t[1].toFixed(1)} L${(c[0]-rx).toFixed(1)} ${c[1].toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(c[0]+rx).toFixed(1)} ${c[1].toFixed(1)} L${(c[0]+rx).toFixed(1)} ${t[1].toFixed(1)} Z" fill="${o.side || shade(col,.84)}"/>`;
      const top = `<ellipse cx="${t[0].toFixed(1)}" cy="${t[1].toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${o.top || shade(col,1.04)}"/>`;
      return S.add(o.depth ?? (cx + cy + z*0.02), side + top + (o.after || ''));
    },
    ball(x, y, z, r, col, o={}){
      const p = P(x, y, z);
      return S.add(o.depth ?? (x + y + z*0.02), `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r*ISO_S).toFixed(1)}" fill="${col}"${o.op?` opacity="${o.op}"`:''}/>` + (o.hl ? `<circle cx="${(p[0]-r*ISO_S*.35).toFixed(1)}" cy="${(p[1]-r*ISO_S*.35).toFixed(1)}" r="${(r*ISO_S*.28).toFixed(1)}" fill="#fff" opacity=".45"/>` : ''));
    },
    line(a, b, col, w=1, d=999, extra=''){ const p = P(...a), q = P(...b); return S.add(d, `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" ${extra}/>`); },
    glow(x, y, z, r, col, d=999, op=.35){ const p = P(x, y, z); return S.add(d, `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r*ISO_S).toFixed(1)}" fill="url(#glow-${col})" opacity="${op}"/>`); },
    strand(a, b, sag, n, d=999){
      const pt = t => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t - sag*4*t*(1-t)];
      let path = []; for (let i=0;i<=24;i++) path.push(P(...pt(i/24)));
      let svg = `<polyline points="${pts(path)}" fill="none" stroke="#5b5145" stroke-width=".8" opacity=".8"/>`;
      for (let i=1;i<n;i++){ const q = P(...pt(i/n)); svg += `<circle cx="${q[0].toFixed(1)}" cy="${(q[1]+3).toFixed(1)}" r="7" fill="url(#glow-warm)" opacity=".55"/><circle cx="${q[0].toFixed(1)}" cy="${(q[1]+3).toFixed(1)}" r="1.9" fill="#FFE7B0"/>`; }
      return S.add(d, svg);
    },
    render(){ return items.sort((a,b) => a.d - b.d).map(i => i.svg).join(''); }
  };
  return S;
}

/* ---------- reusable objects ---------- */
function roundTable(S, cx, cy, o={}){
  const cloth = o.cloth || '#F4EFE6', chair = o.chair || '#C8A96B', n = o.n || 8, R = 1.32;
  for (let k=0;k<n;k++){ const a = k/n*Math.PI*2 + .3, x = cx + R*Math.cos(a), y = cy + R*Math.sin(a);
    const bx = x + .22*Math.cos(a), by = y + .22*Math.sin(a);
    S.box(x-.18, y-.18, 0, .36, .36, .46, chair, { depth:x+y });
    S.box(bx-.08, by-.08, .46, .16, .16, .62, chair, { depth:bx+by+.01 }); }
  S.cyl(cx, cy, 0, .98, .76, cloth, { depth:cx+cy+.05, side:shade(cloth,.86) });
  if (o.center !== false){
    S.cyl(cx, cy, .76, .07, .55, '#d9d2c7', { depth:cx+cy+.06 });
    const fl = o.flowers || ['#F3E6E0','#E8CFC6','#FFFFFF','#9DAE8C'];
    [[0,0,1.42,.24],[.12,.08,1.32,.18],[-.12,.1,1.3,.17],[.05,-.14,1.33,.16],[-.08,-.08,1.5,.15]].forEach(([dx,dy,z,r],i) => S.ball(cx+dx, cy+dy, z, r, fl[i%fl.length], { depth:cx+cy+.07+i*.001 }));
    S.glow(cx+.45, cy+.2, .8, .5, 'warm', cx+cy+.08, .5);
  }
}
function person(S, x, y, col, o={}){
  S.cyl(x, y, 0, .17, 1.05, col, { depth:x+y+.02 });
  S.ball(x, y, 1.28, .15, o.skin || '#D9B79A', { depth:x+y+.03 });
}
function speaker(S, x, y, z=0){ S.box(x, y, z, .5, .45, 1.5, '#1d1c1b', { depth:x+y+.3, top:'#2a2826' }); }
function djBooth(S, x, y, z=0){
  S.box(x, y, z, 1.7, .75, .95, '#1b1a19', { top:'#2b2926' });
  S.box(x+.2, y+.15, z+.95, .5, .45, .05, '#3a3836', { depth:x+y+1.5 }); S.box(x+1, y+.15, z+.95, .5, .45, .05, '#3a3836', { depth:x+y+1.5 });
  S.glow(x+.85, y+.4, z+1.2, .9, 'gold', x+y+1.6, .5);
}
function danceFloor(S, x0, y0, w, d, a, b){
  for (let i=0;i<w;i++) for (let j=0;j<d;j++){ const x=x0+i, y=y0+j; S.poly([P(x,y,.01),P(x+1,y,.01),P(x+1,y+1,.01),P(x,y+1,.01)], (i+j)%2 ? a : b, -50); }
}
function cake(S, x, y, z, tiers=3, col='#FBF7F0'){
  let zz = z; [.42,.32,.22,.14].slice(0,tiers).forEach((r,i) => { S.cyl(x, y, zz, r, .3, col, { depth:x+y+.1+i*.01, side:shade(col,.9) }); zz += .3; });
  S.ball(x, y, zz+.05, .07, '#E8CFC6', { depth:x+y+.2 });
}
function room(S, o){
  const W = 12, D = 12, H = o.h || 4.2;
  S.poly([P(0,0,0),P(0,D,0),P(0,D,H),P(0,0,H)], o.wallL, -300);
  S.poly([P(0,0,0),P(W,0,0),P(W,0,H),P(0,0,H)], o.wallR, -300);
  S.poly([P(0,0,0),P(W,0,0),P(W,D,0),P(0,D,0)], o.floor, -290);
  let lines = '';
  for (let i=1;i<12;i++){ const a=P(i,0,0), b=P(i,D,0), c=P(0,i,0), d=P(W,i,0); lines += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/><line x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}"/>`; }
  S.add(-280, `<g stroke="${o.grid}" stroke-width=".6" opacity=".55">${lines}</g>`);
  // baseboards
  S.poly([P(0,0,0),P(0,D,0),P(0,D,.18),P(0,0,.18)], shade(o.wallL.startsWith('#')?o.wallL:'#888888',.85), -299);
  S.poly([P(0,0,0),P(W,0,0),P(W,0,.18),P(0,0,.18)], shade(o.wallR.startsWith('#')?o.wallR:'#888888',.85), -299);
  if (o.arches){ // arched wall panels
    const arch = (plane, a) => { const p = []; const z0=.7, z1=2.7, w=1.3;
      for (let t=0;t<=12;t++){ const ang = Math.PI*(t/12); const u = a + w/2 - Math.cos(ang)*w/2, z = z1 + Math.sin(ang)*w/2; p.push(plane==='L'?P(0,u,z):P(u,0,z)); }
      p.unshift(plane==='L'?P(0,a,z0):P(a,0,z0)); p.push(plane==='L'?P(0,a+w,z0):P(a+w,0,z0)); return p; };
    [1.2,3.4,9.8].forEach(a => S.poly(arch('L',a), o.archFill, -298, `stroke="${o.archLine}" stroke-width=".8"`));
    [.9,10.1].forEach(a => S.poly(arch('R',a), o.archFill, -298, `stroke="${o.archLine}" stroke-width=".8"`));
  }
}

/* ---------- presets ---------- */
const SCENES = {
  wedding: {
    label:'Wedding', sky:['#16140f','#221e18'],
    cats:['venue','catering','decoration','florist','dj','lighting','cake'],
    build(S){
      room(S, { wallL:'#E7DFD2', wallR:'#DDD3C3', floor:'#CBB99F', grid:'#B4A285', arches:true, archFill:'#EFE9DF', archLine:'#CDBFA9' });
      // stage + DJ
      S.box(3, .15, 0, 6, 2.1, .32, '#3a3430', { top:'#4a433d' });
      djBooth(S, 5.2, .6, .32); speaker(S, 3.5, .5, .32); speaker(S, 8.1, .5, .32);
      danceFloor(S, 4, 3, 4, 3, '#2d2a27', '#3b3733');
      // floral arch
      const ay0 = 5.2, ay1 = 7.4, ax = .55;
      S.box(ax-.06, ay0-.06, 0, .12, .12, 2.1, '#d8cbb3', { depth:ax+ay0 }); S.box(ax-.06, ay1-.06, 0, .12, .12, 2.1, '#d8cbb3', { depth:ax+ay1 });
      const fl = ['#FFFFFF','#F1DCD5','#E7C9BE','#9DAE8C','#F7EFE6'];
      for (let i=0;i<=26;i++){ const t = i/26*Math.PI; const y = (ay0+ay1)/2 - Math.cos(t)*(ay1-ay0)/2, z = 2.1 + Math.sin(t)*1.1; S.ball(ax, y, z, .17 + (i%3)*.03, fl[i%5], { depth:ax+y+.5 }); }
      for (let i=0;i<8;i++){ S.ball(ax+.1, ay0+(i%2)*.2, .25+i*.25, .16, fl[(i+1)%5], { depth:ax+ay0+.5 }); S.ball(ax+.1, ay1-(i%2)*.2, .25+i*.25, .16, fl[(i+2)%5], { depth:ax+ay1+.5 }); }
      // tables
      roundTable(S, 2.6, 2.8); roundTable(S, 10.1, 4); roundTable(S, 10.1, 7.9); roundTable(S, 6.8, 9.9); roundTable(S, 2.9, 9.9);
      // cake table
      S.box(5.6, 7.1, 0, 1.4, .8, .78, '#F4EFE6'); cake(S, 6.3, 7.5, .78);
      // guests
      person(S, 5, 4, '#1f1d1b'); person(S, 5.6, 4.2, '#EDE6DA'); person(S, 6.8, 4.9, '#2b2825'); person(S, 7.2, 4.5, '#C8A96B'); person(S, 5.4, 5.6, '#7b6a58');
      // string lights + chandeliers
      [[1.5,0],[4.5,0],[7.5,0]].forEach(([x],i) => S.strand([0, 2 + i*3.4, 4.1], [x+2.5, 0, 4.1], .9, 14, 2000+i));
      [[2.6,2.8],[6.8,9.9],[10.1,4]].forEach(([x,y],i) => { S.line([x,y,5.4],[x,y,3.5],'#8a7a62',.8,1900+i); S.ball(x,y,3.4,.2,'#F5E3B5',{ depth:1901+i }); S.glow(x,y,3.4,1.4,'warm',1902+i,.6); });
    }
  },
  birthday: {
    label:'Birthday', sky:['#1a1513','#241c19'],
    cats:['venue','decoration','cake','dj','entertainment','catering'],
    build(S){
      room(S, { wallL:'#EFE3D9', wallR:'#E6D6C9', floor:'#D7C6B0', grid:'#C0AD93' });
      // banner + balloon garland on right wall
      for (let i=0;i<40;i++){ const x = 2.2 + i*.2, z = 3.5 - Math.sin(i/39*Math.PI)*.7 + (i%3)*.08; S.ball(x, .25, z, .2+(i%2)*.05, ['#E7C9BE','#F6EEE4','#C8A96B','#D6B3A8','#FFFFFF'][i%5], { depth:x+.25+z*.02+200, hl:true }); }
      // dessert table with cake + cupcakes
      S.box(3.2, .6, 0, 4.6, 1, .8, '#F6F1EA'); cake(S, 5.5, 1.1, .8, 3, '#F9F1EC');
      [[4,1],[4.5,1.2],[6.6,1],[7.1,1.2],[3.6,1.2]].forEach(([x,y]) => { S.cyl(x,y,.8,.12,.12,'#C8A96B',{ depth:x+y+.2 }); S.ball(x,y,1,.12,'#F3DED7',{ depth:x+y+.21 }); });
      // balloon clusters
      [[1,1.2],[11,1],[1,11]].forEach(([x,y],k) => { for (let i=0;i<7;i++){ const dx=(i%3-1)*.3, dy=((i+1)%3-1)*.3, z=2.4+(i%4)*.35; S.line([x,y,0],[x+dx,y+dy,z],'#9c8d7c',.6,x+y+5+i*.01); S.ball(x+dx,y+dy,z,.3,['#E7C9BE','#C8A96B','#FFFFFF','#D9BFB5'][(i+k)%4],{ depth:x+y+6+i*.01, hl:true }); } });
      // DJ + dance floor
      djBooth(S, 9, 2.4); speaker(S, 8.3, 2.3); speaker(S, 10.9, 2.3);
      danceFloor(S, 6, 4, 4, 3, '#2f2b28', '#3d3834');
      // cocktail tables
      [[2.6,5],[3,8.4],[7,9.8],[10.2,8.6]].forEach(([x,y]) => { S.cyl(x,y,0,.06,1.05,'#2a2725',{ depth:x+y }); S.cyl(x,y,1.05,.5,.06,'#F4EFE6',{ depth:x+y+.01 }); S.cyl(x+.1,y,1.11,.05,.2,'#E7C9BE',{ depth:x+y+.02 }); [[.8,0],[0,.8],[-.8,0]].forEach(([dx,dy]) => S.cyl(x+dx,y+dy,0,.2,.75,'#C8A96B',{ depth:x+dx+y+dy })); });
      person(S, 7, 5, '#2b2825'); person(S, 7.6, 5.4, '#E8CFC6'); person(S, 8.4, 4.8, '#1f1d1b'); person(S, 6.9, 6.2, '#C8A96B'); person(S, 3.3, 5.6, '#6b5a4a'); person(S, 2.2, 5.6, '#EDE6DA');
      [[0,3],[0,7],[0,10.5]].forEach(([x,y],i) => S.strand([x,y,4.1],[8+i*1.2,0,4.1],1,14,2000+i));
    }
  },
  corporate: {
    label:'Corporate', sky:['#111316','#1a1d21'],
    cats:['venue','lighting','videography','catering','rentals','photography'],
    build(S){
      room(S, { wallL:'#D8DADC', wallR:'#CDD0D3', floor:'#4A4D52', grid:'#5a5e64', h:4.6 });
      // screen on right wall
      const sc = [P(3,.02,1.4),P(9,.02,1.4),P(9,.02,4.2),P(3,.02,4.2)];
      S.add(-200, `<polygon points="${pts(sc)}" fill="url(#screen)"/><polygon points="${pts([P(3.6,.03,3.3),P(6.6,.03,3.3),P(6.6,.03,3.6),P(3.6,.03,3.6)])}" fill="#F3EFE8" opacity=".9"/><polygon points="${pts([P(3.6,.03,2.7),P(8,.03,2.7),P(8,.03,2.85),P(3.6,.03,2.85)])}" fill="#C8A96B" opacity=".9"/><polygon points="${pts([P(3.6,.03,2.35),P(7.2,.03,2.35),P(7.2,.03,2.5),P(3.6,.03,2.5)])}" fill="#9aa3ad" opacity=".7"/>`);
      S.box(2.5, .15, 0, 7, 2.3, .45, '#2a2c30', { top:'#36393e' });
      S.box(7.6, 1.2, .45, .7, .5, 1.1, '#1d1e21', { top:'#C8A96B' });
      person(S, 6.2, 1.3, '#1d1e21');
      // light truss + beams
      S.box(1.5, 2.7, 4.2, 9, .14, .14, '#8a8f96', { depth:3000 });
      [3,5,7,9].forEach((x,i) => { const a = P(x,2.75,4.15), b1 = P(x-.9,1.2,.5), b2 = P(x+.9,1.2,.5); S.add(2990, `<polygon points="${pts([a,b1,b2])}" fill="#F7E7C0" opacity=".08"/>`); S.box(x-.12,2.65,3.95,.24,.24,.25,'#2a2c30',{ depth:3001+i }); });
      // rows of chairs facing stage
      for (let r=0;r<4;r++) for (let c=0;c<7;c++){ const x = 3 + c*.95, y = 4.2 + r*1.25; S.box(x, y, 0, .45, .45, .46, '#222428', { depth:x+y }); S.box(x, y+.38, .46, .45, .08, .55, '#222428', { depth:x+y+.4 }); }
      [[5.1,5.4,'#3a3d42'],[6.1,6.7,'#E9E4DA'],[7.1,4.3,'#5b6068'],[4.2,7.9,'#2a2c30'],[8,6.6,'#C8A96B']].forEach(([x,y,c]) => person(S, x+.22, y+.2, c));
      // high tables at back-left
      [[1.4,4.5],[1.4,7.5],[1.4,10.3]].forEach(([x,y]) => { S.cyl(x,y,0,.06,1.05,'#2a2c30',{ depth:x+y }); S.cyl(x,y,1.05,.5,.06,'#F3F1EE',{ depth:x+y+.01 }); });
      person(S, 2.2, 7.6, '#1d1e21'); person(S, 2.1, 10.5, '#7f8790');
    }
  },
  beach: {
    label:'Beach', sky:['#3a2a2a','#E0A273'], open:true,
    cats:['venue','catering','rentals','lighting','dj','decoration'],
    build(S){
      S.poly([P(0,0),P(12,0),P(12,12),P(0,12)], '#E5D1AE', -290);
      S.add(-289, `<polygon points="${pts([P(0,0),P(12,0),P(12,.6),P(.6,.6),P(.6,12),P(0,12)])}" fill="#D7BF97"/>`);
      // long dining table
      S.box(3.4, 6.2, 0, 5, 1, .76, '#F6F1E8');
      for (let i=0;i<6;i++){ const x = 3.7 + i*.82; S.box(x, 5.6, 0, .36, .36, .46, '#C9A97C', { depth:x+5.6 }); S.box(x, 7.45, 0, .36, .36, .46, '#C9A97C', { depth:x+7.6 }); S.ball(x+.3, 6.7, .95, .12, ['#F3E6E0','#9DAE8C','#E7C9BE'][i%3], { depth:x+6.9 }); S.glow(x+.3, 6.7, .9, .4, 'warm', x+6.95, .6); }
      // lounge
      [[1.6,1.6],[1.6,3.6]].forEach(([x,y]) => { S.box(x,y,0,1.6,1.1,.3,'#EFE7DA'); S.box(x+.1,y+.1,.3,.35,.9,.35,'#E7DCCB'); });
      S.cyl(2.1, 5.2, 0, .45, .2, '#3b3530', { after:'' }); S.glow(2.1,5.2,.35,.8,'fire',8,.8);
      // umbrellas
      [[9.4,2],[10.2,9.6],[1.8,9.8]].forEach(([x,y]) => { S.cyl(x,y,0,.04,2.2,'#7a6a58',{ depth:x+y }); const a = P(x,y,2.75), c = P(x,y,2.15), rx = 1.2247*1.1*ISO_S, ry = .7071*1.1*ISO_S; S.add(x+y+1, `<path d="M${(c[0]-rx).toFixed(1)} ${c[1].toFixed(1)} L${a[0].toFixed(1)} ${a[1].toFixed(1)} L${(c[0]+rx).toFixed(1)} ${c[1].toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(c[0]-rx).toFixed(1)} ${c[1].toFixed(1)} Z" fill="#F2EADC"/><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${(c[0]+rx).toFixed(1)} ${c[1].toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${c[0].toFixed(1)} ${(c[1]+ry).toFixed(1)} Z" fill="#D9CDB8"/>`); S.box(x+.4,y-.6,0,1.4,.6,.25,'#EFE7DA',{ depth:x+y-.1 }); });
      // bar + DJ
      S.box(8.6, 4, 0, .7, 2.4, 1.05, '#8B6F52', { top:'#C9A97C' });
      djBooth(S, 5.4, 1.6);
      // torches + string lights
      const posts = [[3,3],[9,3.2],[3,10.6],[9,10.6]];
      posts.forEach(([x,y]) => { S.cyl(x,y,0,.05,2.6,'#6b5a48',{ depth:x+y }); S.glow(x,y,2.75,.9,'fire',x+y+.1,.8); S.ball(x,y,2.7,.09,'#FFD58A',{ depth:x+y+.11 }); });
      S.strand([3,3,2.6],[9,3.2,2.6],.5,12,2000); S.strand([3,10.6,2.6],[9,10.6,2.6],.5,12,2001); S.strand([3,3,2.6],[3,10.6,2.6],.6,14,2002); S.strand([9,3.2,2.6],[9,10.6,2.6],.6,14,2003);
      person(S, 6.3, 3.6, '#F2EADC'); person(S, 6.9, 3.9, '#2b2825'); person(S, 7.5, 3.4, '#C8A96B'); person(S, 9.6, 5.2, '#EDE6DA'); person(S, 4.6, 8.3, '#5d4b3c');
    }
  }
};
const SCENE_FOR_EVENT = { wedding:'wedding', engagement:'wedding', birthday:'birthday', 'baby-shower':'birthday', private:'birthday', bachelor:'birthday', bachelorette:'birthday', graduation:'birthday', other:'birthday', corporate:'corporate', beach:'beach', outdoor:'beach' };

let sceneUid = 0;
function renderScene(key, { title } = {}){
  const sc = SCENES[key] || SCENES.wedding, S = makeScene(), id = ++sceneUid;
  sc.build(S);
  const defs = `<defs>
    <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sc.sky[0]}"/><stop offset="1" stop-color="${sc.sky[1]}"/></linearGradient>
    <radialGradient id="glow-warm"><stop offset="0" stop-color="#FFD98F" stop-opacity="1"/><stop offset="1" stop-color="#FFD98F" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow-gold"><stop offset="0" stop-color="#C8A96B" stop-opacity="1"/><stop offset="1" stop-color="#C8A96B" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow-fire"><stop offset="0" stop-color="#FFB45E" stop-opacity="1"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2430"/><stop offset="1" stop-color="#2d3a4a"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7f78"/><stop offset=".25" stop-color="#4f6470"/><stop offset="1" stop-color="#22394a"/></linearGradient>
  </defs>`;
  return `<svg class="scene-svg" viewBox="-330 -150 660 535" role="img" aria-label="${esc(title || `Example 3D illustration of a ${sc.label.toLowerCase()} event setup`)}" preserveAspectRatio="xMidYMid slice">${defs}<rect x="-345" y="-175" width="690" height="560" fill="url(#sky${id})"/>${sc.open ? `<circle cx="-170" cy="-92" r="40" fill="#F6C98F" opacity=".9"/><circle cx="-170" cy="-92" r="90" fill="#F6C98F" opacity=".12"/><rect x="-345" y="-70" width="690" height="455" fill="url(#sea)"/><rect x="-235" y="-66" width="130" height="3" rx="1.5" fill="#F6C98F" opacity=".5"/><rect x="-215" y="-56" width="90" height="2" rx="1" fill="#F6C98F" opacity=".35"/><rect x="-200" y="-46" width="60" height="2" rx="1" fill="#F6C98F" opacity=".25"/>` : ''}${S.render()}</svg>`;
}

/* ---- gl3d.js ---- */
/* =========================================================
   MA3AK 3D — a small WebGL engine for live event scenes.
   Lit materials, tone mapping, fog, soft contact shadows,
   glowing lights, animated water/screens/people, orbit camera.
   ========================================================= */
const GL3D = (() => {
  /* ---------- math ---------- */
  const sub = (a,b) => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const norm = a => { const l = Math.hypot(a[0],a[1],a[2]) || 1; return [a[0]/l,a[1]/l,a[2]/l]; };
  const persp = (f, a, n, fa) => { const t = 1/Math.tan(f/2), nf = 1/(n-fa); return [t/a,0,0,0, 0,t,0,0, 0,0,(fa+n)*nf,-1, 0,0,2*fa*n*nf,0]; };
  const lookAt = (e, c, u) => { const z = norm(sub(e,c)), x = norm(cross(u,z)), y = cross(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot(x,e),-dot(y,e),-dot(z,e),1]; };
  const mul4 = (a,b) => { const o = new Array(16); for (let i=0;i<4;i++) for (let j=0;j<4;j++){ let s=0; for (let k=0;k<4;k++) s += a[k*4+j]*b[i*4+k]; o[i*4+j] = s; } return o; };
  // 3x3 row-major helpers
  const m3 = (a,b) => { const o = []; for (let i=0;i<3;i++) for (let j=0;j<3;j++) o[i*3+j] = a[i*3]*b[j] + a[i*3+1]*b[3+j] + a[i*3+2]*b[6+j]; return o; };
  const m3v = (m,v) => [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
  const m3invT = m => { const [a,b,c,d,e,f,g,h,i] = m; const A=e*i-f*h, B=-(d*i-f*g), Cc=d*h-e*g, D=-(b*i-c*h), E=a*i-c*g, F=-(a*h-b*g), G=b*f-c*e, H=-(a*f-c*d), I=a*e-b*d; const det = a*A+b*B+c*Cc || 1; return [A/det,B/det,Cc/det, D/det,E/det,F/det, G/det,H/det,I/det]; };
  const rotM = (rx=0, ry=0, rz=0) => { const cx=Math.cos(rx), sx=Math.sin(rx), cy=Math.cos(ry), sy=Math.sin(ry), cz=Math.cos(rz), sz=Math.sin(rz);
    const Ry=[cy,0,sy, 0,1,0, -sy,0,cy], Rx=[1,0,0, 0,cx,-sx, 0,sx,cx], Rz=[cz,-sz,0, sz,cz,0, 0,0,1]; return m3(m3(Ry,Rx),Rz); };
  const T = ({x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1,s}={}) => { if (s!=null){ sx=sy=sz=s; } const R = rotM(rx,ry,rz); return { M:[R[0]*sx,R[1]*sy,R[2]*sz, R[3]*sx,R[4]*sy,R[5]*sz, R[6]*sx,R[7]*sy,R[8]*sz], t:[x,y,z] }; };
  const compose = (A,B) => ({ M:m3(A.M,B.M), t:(v => [v[0]+A.t[0], v[1]+A.t[1], v[2]+A.t[2]])(m3v(A.M,B.t)) });
  const ID = { M:[1,0,0,0,1,0,0,0,1], t:[0,0,0] };
  const mat4 = (tr) => { const M = tr.M; return [M[0],M[3],M[6],0, M[1],M[4],M[7],0, M[2],M[5],M[8],0, tr.t[0],tr.t[1],tr.t[2],1]; };
  const hex = h => { h = h.replace('#',''); return [0,2,4].map(i => Math.pow(parseInt(h.slice(i,i+2),16)/255, 2.2)); };
  const hexD = (h, k=1) => { h = h.replace('#',''); return [0,2,4].map(i => parseInt(h.slice(i,i+2),16)/255*k); };

  /* ---------- geometry builder ---------- */
  class Geo {
    constructor(){ this.p=[]; this.n=[]; this.c=[]; this.m=[]; this.stack=[ID]; this.sp=[]; this.sa=[]; this.gp=[]; this.gc=[]; this.gg=[]; }
    get tr(){ return this.stack[this.stack.length-1]; }
    push(t){ this.stack.push(compose(this.tr, t.M ? t : T(t))); return this; }
    pop(){ this.stack.pop(); return this; }
    at(t, fn){ this.push(t); fn(this); this.pop(); return this; }
    _emit(local, tr, col, mat){ // local: [[p,n],...] triangles
      const N = m3invT(tr.M), c = typeof col === 'string' ? hex(col) : col, mm = [mat.e||0, mat.s==null ? .25 : mat.s, mat.f||0];
      for (const [p,n] of local){ const q = m3v(tr.M,p), nn = norm(m3v(N,n)); this.p.push(q[0]+tr.t[0], q[1]+tr.t[1], q[2]+tr.t[2]); this.n.push(...nn); this.c.push(...c); this.m.push(...mm); }
    }
    box(x,y,z,w,h,d,col,mat={}){
      const tr = compose(this.tr, T({x, y:y+h/2, z, sx:w, sy:h, sz:d, ry:mat.ry||0, rz:mat.rz||0})), L = [];
      const faces = [[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[0,0,-1],[1,0,0]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
      for (const [n,u,v] of faces){ const c = (a,b) => [n[0]*.5+u[0]*a+v[0]*b, n[1]*.5+u[1]*a+v[1]*b, n[2]*.5+u[2]*a+v[2]*b];
        const q = [c(-.5,-.5),c(.5,-.5),c(.5,.5),c(-.5,.5)]; [q[0],q[1],q[2],q[0],q[2],q[3]].forEach(p => L.push([p,n])); }
      this._emit(L, tr, col, mat); return this;
    }
    cyl(x,y,z,rb,rt,h,col,mat={},seg=26,caps=true){
      const tr = compose(this.tr, T({x,y,z})), L = [], k = (rb-rt)/h;
      for (let i=0;i<seg;i++){ const a0 = i/seg*Math.PI*2, a1 = (i+1)/seg*Math.PI*2, c0=Math.cos(a0), s0=Math.sin(a0), c1=Math.cos(a1), s1=Math.sin(a1);
        const n0 = norm([c0,k,s0]), n1 = norm([c1,k,s1]);
        const A=[[rb*c0,0,rb*s0],n0], B=[[rb*c1,0,rb*s1],n1], C=[[rt*c1,h,rt*s1],n1], D=[[rt*c0,h,rt*s0],n0];
        L.push(A,B,C,A,C,D);
        if (caps){ if (rt>0) L.push([[0,h,0],[0,1,0]],[[rt*c0,h,rt*s0],[0,1,0]],[[rt*c1,h,rt*s1],[0,1,0]]); if (rb>0) L.push([[0,0,0],[0,-1,0]],[[rb*c1,0,rb*s1],[0,-1,0]],[[rb*c0,0,rb*s0],[0,-1,0]]); } }
      this._emit(L, tr, col, mat); return this;
    }
    sphere(x,y,z,r,col,mat={},seg=12,sy=1){
      const tr = compose(this.tr, T({x,y,z,sx:r,sy:r*sy,sz:r})), L = [], rings = Math.max(6, Math.round(seg*.6));
      const P = (i,j) => { const th = j/rings*Math.PI, ph = i/seg*Math.PI*2; const v = [Math.sin(th)*Math.cos(ph), Math.cos(th), Math.sin(th)*Math.sin(ph)]; return [v,v]; };
      for (let j=0;j<rings;j++) for (let i=0;i<seg;i++){ const a=P(i,j), b=P(i+1,j), c=P(i+1,j+1), d=P(i,j+1); L.push(a,b,c,a,c,d); }
      this._emit(L, tr, col, mat); return this;
    }
    plane(x,y,z,w,d,col,mat={},nx=1,nz=1){
      const tr = compose(this.tr, T({x,y,z})), L = [], n = [0,1,0];
      for (let i=0;i<nx;i++) for (let j=0;j<nz;j++){ const x0=-w/2+w*i/nx, x1=-w/2+w*(i+1)/nx, z0=-d/2+d*j/nz, z1=-d/2+d*(j+1)/nz;
        L.push([[x0,0,z0],n],[[x1,0,z0],n],[[x1,0,z1],n],[[x0,0,z0],n],[[x1,0,z1],n],[[x0,0,z1],n]); }
      this._emit(L, tr, col, mat); return this;
    }
    tube(a,b,r,col,mat={},seg=6){
      const d = sub(b,a), L0 = Math.hypot(...d) || 1e-4, Y = norm(d), ref = Math.abs(Y[1]) > .9 ? [1,0,0] : [0,1,0], X = norm(cross(ref,Y)), Z = cross(X,Y);
      this.push({ M:[X[0],Y[0],Z[0], X[1],Y[1],Z[1], X[2],Y[2],Z[2]], t:a }); this.cyl(0,0,0,r,r,L0,col,mat,seg,false); this.pop(); return this;
    }
    loft(pb, yb, pt, yt, col, mat={}, capTop=true){ // pb/pt: arrays of [x,z]
      const tr = this.tr, L = [], n = pb.length;
      for (let i=0;i<n;i++){ const j=(i+1)%n, A=[pb[i][0],yb,pb[i][1]], B=[pb[j][0],yb,pb[j][1]], C=[pt[j][0],yt,pt[j][1]], D=[pt[i][0],yt,pt[i][1]];
        let nn = norm(cross(sub(B,A), sub(D,A))); const mid = [(A[0]+B[0])/2, 0, (A[2]+B[2])/2]; if (dot(nn, mid) < 0) nn = nn.map(v => -v);
        L.push([A,nn],[B,nn],[C,nn],[A,nn],[C,nn],[D,nn]); }
      if (capTop){ const cx = pt.reduce((s,p)=>s+p[0],0)/n, cz = pt.reduce((s,p)=>s+p[1],0)/n; for (let i=0;i<n;i++){ const j=(i+1)%n; L.push([[cx,yt,cz],[0,1,0]],[[pt[i][0],yt,pt[i][1]],[0,1,0]],[[pt[j][0],yt,pt[j][1]],[0,1,0]]); } }
      this._emit(L, tr, col, mat); return this;
    }
    quad(a,b,c,d,col,mat={}){
      let n = norm(cross(sub(b,a), sub(d,a))); if (mat.flip) n = n.map(v => -v);
      this._emit([[a,n],[b,n],[c,n],[a,n],[c,n],[d,n]], this.tr, col, mat); return this;
    }
    shadow(x,z,r,a=.4,sx=1,sz=1,ry=0){
      const c = m3v(this.tr.M,[x,0,z]); const cx = c[0]+this.tr.t[0], cz = c[2]+this.tr.t[2], y = this.tr.t[1] + .012 + this.sp.length*1e-7;
      const seg = 20, cr = Math.cos(ry), sr = Math.sin(ry);
      for (let i=0;i<seg;i++){ const a0=i/seg*Math.PI*2, a1=(i+1)/seg*Math.PI*2;
        const P = a => { const lx = Math.cos(a)*r*sx, lz = Math.sin(a)*r*sz; return [cx + lx*cr - lz*sr, y, cz + lx*sr + lz*cr]; };
        this.sp.push(cx,y,cz, ...P(a0), ...P(a1)); this.sa.push(a,0,0); }
      return this;
    }
    glow(x,y,z,size,col,tw=0,speed=2){
      const q = m3v(this.tr.M,[x,y,z]); this.gp.push(q[0]+this.tr.t[0], q[1]+this.tr.t[1], q[2]+this.tr.t[2]);
      this.gc.push(...(typeof col === 'string' ? hexD(col) : col)); this.gg.push(size, Math.random()*6.28, tw, speed); return this;
    }
  }

  /* ---------- shaders ---------- */
  const VS = `precision highp float;
  attribute vec3 aPos; attribute vec3 aNor; attribute vec3 aCol; attribute vec3 aMat;
  uniform mat4 uVP; uniform mat4 uModel; uniform float uTime; uniform mat4 uLightVP;
  varying vec3 vPos; varying vec3 vNor; varying vec3 vCol; varying vec3 vMat; varying vec4 vLPos;
  void main(){
    vec4 wp = uModel * vec4(aPos,1.0); vec3 n = (uModel * vec4(aNor,0.0)).xyz;
    if (aMat.z > 0.5 && aMat.z < 1.5){
      float t = uTime; vec3 p = wp.xyz;
      float h = sin(p.x*.55 + t*1.1)*.07 + sin(p.z*.8 - t*1.5)*.05 + sin((p.x+p.z)*1.9 + t*2.4)*.02;
      float dx = cos(p.x*.55 + t*1.1)*.0385 + cos((p.x+p.z)*1.9 + t*2.4)*.038;
      float dz = cos(p.z*.8 - t*1.5)*.04 + cos((p.x+p.z)*1.9 + t*2.4)*.038;
      wp.y += h; n = normalize(vec3(-dx, 1.0, -dz));
    }
    vPos = wp.xyz; vNor = n; vCol = aCol; vMat = aMat; vLPos = uLightVP * wp;
    gl_Position = uVP * wp;
  }`;
  const FS = `precision highp float;
  varying vec3 vPos; varying vec3 vNor; varying vec3 vCol; varying vec3 vMat; varying vec4 vLPos;
  uniform sampler2D uShadowMap; uniform float uShadowOn; uniform float uShadowTexel; uniform float uShadowAmb; uniform vec3 uEnvTop; uniform vec3 uEnvBot;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x), f.y); }
  float fbm(vec2 p){ float s = 0.0, a = .5; for (int i=0;i<4;i++){ s += a*noise(p); p *= 2.03; a *= .5; } return s; }
  float unpackD(vec4 c){ return dot(c, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0)); }
  float shadowF(vec3 N, vec3 L){
    if (uShadowOn < .5) return 1.0;
    vec3 p = vLPos.xyz / vLPos.w * .5 + .5;
    if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
    float bias = .0012 + .004*(1.0 - abs(dot(N, L)));
    float s = 0.0;
    for (int x=-1;x<=1;x++) for (int y=-1;y<=1;y++){ float d = unpackD(texture2D(uShadowMap, p.xy + vec2(float(x),float(y))*uShadowTexel)); s += (p.z - bias > d) ? 0.0 : 1.0; }
    return s / 9.0;
  }
  uniform vec3 uCam; uniform vec3 uSky; uniform vec3 uGround; uniform vec3 uSunDir; uniform vec3 uSunCol;
  uniform vec3 uLPos[12]; uniform vec3 uLCol[12]; uniform float uLRange[12]; uniform int uNumL;
  uniform vec3 uLedA; uniform vec3 uLedB; uniform vec3 uFog; uniform float uFogD; uniform float uExposure; uniform float uTime; uniform vec2 uRes; uniform float uVig; uniform float uClouds; uniform float uSunVis; uniform float uCatch; uniform float uToon;
  vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0.0, 1.0); }
  void main(){
    vec3 base = vCol;
    if (vMat.z > 2.5 && vMat.z < 3.5){
      vec3 dir = normalize(vPos - vec3(uCam.x, 0.0, uCam.z));
      if (dir.y > 0.0){
        vec2 cp = dir.xz / (dir.y + .12) * 1.4 + vec2(uTime*.006, uTime*.002);
        float cl = fbm(cp*1.6) * .65 + fbm(cp*4.3) * .35;
        float m = smoothstep(.48, .82, cl) * uClouds * smoothstep(.0, .22, dir.y);
        vec3 cc = mix(base*1.25 + vec3(.18), uSunCol*.35 + vec3(.55), .45 * uSunVis);
        base = mix(base, cc, m);
      }
      float sd = max(dot(dir, normalize(uSunDir)), 0.0);
      base += uSunCol * (pow(sd, 1400.0)*9.0 + pow(sd, 18.0)*.22) * uSunVis;
      gl_FragColor = vec4(pow(aces(base*uExposure), vec3(1.0/2.2)), 1.0); return; }
    if (vMat.z > 3.5 && vMat.z < 4.5){
      vec2 cell = floor(vPos.xz / .62); float h = fract(sin(dot(cell, vec2(12.9898,78.233))) * 43758.5453);
      float k = .5 + .5*sin(uTime*2.2 + h*6.283 + length(cell)*.6);
      vec3 led = mix(uLedA, uLedB, k) * (.35 + .9*k*k);
      vec2 f = fract(vPos.xz / .62); float edge = smoothstep(.0,.06,f.x)*smoothstep(.0,.06,f.y)*smoothstep(1.,.94,f.x)*smoothstep(1.,.94,f.y);
      gl_FragColor = vec4(pow(aces(led*1.25*edge + vec3(.02)), vec3(1.0/2.2)), 1.0); return;
    }
    if (vMat.z > 1.5 && vMat.z < 2.5){
      float g = .5 + .5*sin(vPos.x*1.3 + uTime*.9) * cos(vPos.y*2.1 - uTime*.6);
      base = mix(vec3(.02,.03,.07), vec3(.55,.4,.18), g*g) + vec3(.9,.8,.6)*smoothstep(.97,1.,sin(vPos.x*3.0 - uTime*2.0));
    }
    vec3 N = normalize(vNor); vec3 V = normalize(uCam - vPos);
    float spec = vMat.y; int k = int(vMat.z + .5);
    if (k == 5){ float n = fbm(vPos.xz*.35); base *= .62 + .6*n; base = mix(base, base*vec3(1.2,1.12,.65), smoothstep(.55,.85,n)*.45); base *= .8 + .35*noise(vPos.xz*38.0); spec = .03;
      if (uToon > .5){ base = mix(base*vec3(1.2,1.35,.75), vec3(.26,.52,.1) * (.8 + .5*n), .55); vec2 c2 = floor(vPos.xz*2.4); vec2 fp = fract(vPos.xz*2.4) - .5 - (vec2(hash(c2), hash(c2 + 7.0)) - .5)*.6;
        float fl = step(hash(c2 + 3.0), .16) * smoothstep(.13, .07, length(fp)); base = mix(base, hash(c2 + 5.0) > .45 ? vec3(1.0,.78,.18) : vec3(1.0,.97,.88), fl); } }
    else if (k == 6){ float row = floor(vPos.z/.18); float off = hash(vec2(row,3.1)); float gr = fbm(vec2(vPos.x*1.4 + off*40.0, vPos.z*34.0)); base *= .74 + .42*gr + .18*(hash(vec2(row, floor(vPos.x/2.2 + off))) - .5); float f = fract(vPos.z/.18); base *= .5 + .5*smoothstep(.0,.04,f)*smoothstep(1.0,.96,f); }
    else if (k == 7){ float w = fbm(vPos.xz*.55); float vein = 1.0 - smoothstep(.0, .05, abs(sin((vPos.x*.8+vPos.z)*1.2 + w*7.0))); base = mix(base, base*vec3(.72,.7,.68), vein*.65); base *= .93 + .12*noise(vPos.xz*2.5); }
    else if (k == 8){ base *= .86 + .18*noise(vPos.xz*16.0) + .07*sin(vPos.x*2.6 + fbm(vPos.xz*.4)*7.0); spec = .05; }
    else if (k == 9){ base *= .94 + .06*noise(vec2(atan(vPos.x, vPos.z)*80.0, vPos.y*60.0)); }
    else if (k == 10){ base *= .82 + .3*fbm(vPos.xz*1.1) + .05*noise(vPos.xz*28.0); }
    else if (k == 11){ vec2 t = vPos.xz/1.2; vec2 f = fract(t); float m = smoothstep(.0,.03,f.x)*smoothstep(1.0,.97,f.x)*smoothstep(.0,.03,f.y)*smoothstep(1.0,.97,f.y); base *= (.82 + .3*hash(floor(t))) * (.55 + .45*m) * (.9 + .15*fbm(vPos.xz*2.0)); }
    else if (k == 12){ base *= .88 + .12*noise(vPos.xz*70.0) + .1*fbm(vPos.xz*1.5); spec = .02; }
    float shin = 16.0 + spec*160.0;
    float sh = shadowF(N, uSunDir);
    if (k == 13){ gl_FragColor = vec4(0.0, 0.0, 0.0, clamp((1.0 - sh) * uCatch, 0.0, .75)); return; }
    vec3 col = base * mix(uGround, uSky, N.y*.5+.5) * mix(1.0 - uShadowAmb, 1.0, sh);
    float ndl = max(dot(N, uSunDir), 0.0);
    col += base * uSunCol * ndl * sh;
    col += uSunCol * pow(max(dot(N, normalize(uSunDir+V)), 0.0), shin) * spec * sh;
    vec3 R = reflect(-V, N); vec3 env = mix(uEnvBot, uEnvTop, clamp(R.y*.5+.5, 0.0, 1.0));
    float fres = .04 + .96*pow(1.0 - max(dot(N, V), 0.0), 5.0);
    col += env * fres * (k == 1 ? 1.4 : spec*spec*.7);
    if (uToon > .5){
      vec3 pb = base*.82 + .06;
      float lt = smoothstep(.12, .2, ndl) * .55 + smoothstep(.5, .58, ndl) * .45;
      float st = smoothstep(.3, .7, sh);
      vec3 amb = mix(uGround, uSky, .7 + .3*N.y);
      vec3 tint = mix(vec3(.72,.76,.98), vec3(1.0), st * (.35 + .65*lt));
      col = pb * amb * tint + pb * uSunCol * lt * st * .75;
      col += vec3(1.0) * smoothstep(.93, .97, dot(N, normalize(uSunDir + V))) * spec * .35;
      col += pb * pow(1.0 - max(dot(N, V), 0.0), 3.0) * .22 * (amb + uSunCol*.3);
      if (k == 1) col += env * fres * 1.2;
    }
    for (int i=0;i<12;i++){
      if (i >= uNumL) break;
      vec3 L = uLPos[i] - vPos; float d = length(L); L /= d;
      float att = clamp(1.0 - d/uLRange[i], 0.0, 1.0); att *= att;
      float pl = max(dot(N,L),0.0) * att; if (uToon > .5) pl = smoothstep(.04, .14, pl)*.55 + pl*.5;
      col += base * uLCol[i] * pl;
      col += uLCol[i] * pow(max(dot(N, normalize(L+V)),0.0), shin) * spec * att;
    }
    if (abs(N.y) < .6) col *= mix(.55, 1.0, smoothstep(0.0, .5, vPos.y));
    col += base * vMat.x;
    float fd = length(uCam - vPos); float f = 1.0 - exp(-pow(fd*uFogD*(uToon > .5 ? .6 : 1.0), 2.0));
    col = mix(col, uFog, f);
    col = aces(col * uExposure);
    vec2 q = gl_FragCoord.xy / uRes - .5; col *= 1.0 - dot(q,q)*.55*uVig;
    gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0);
  }`;
  const DVS = `precision highp float; attribute vec3 aPos; uniform mat4 uLightVP; uniform mat4 uModel; void main(){ gl_Position = uLightVP * uModel * vec4(aPos,1.0); }`;
  const DFS = `precision highp float; void main(){ vec4 e = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * gl_FragCoord.z); e -= e.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0); gl_FragColor = e; }`;
  const SVS = `precision highp float; attribute vec3 aPos; attribute float aA; uniform mat4 uVP; varying float vA; void main(){ vA = aA; gl_Position = uVP*vec4(aPos,1.0); }`;
  const SFS = `precision highp float; varying float vA; uniform float uShadow; void main(){ gl_FragColor = vec4(0.0,0.0,0.0, vA*vA*uShadow*1.8); }`;
  const GVS = `precision highp float; attribute vec3 aPos; attribute vec3 aCol; attribute vec4 aG;
  uniform mat4 uVP; uniform float uScale; uniform float uTime; varying vec3 vC;
  void main(){ vec4 p = uVP*vec4(aPos,1.0); gl_Position = p; float tw = 1.0 - aG.z*(.5+.5*sin(uTime*aG.w + aG.y)); vC = aCol*tw; gl_PointSize = clamp(aG.x*uScale/p.w, 1.0, 220.0); }`;
  const GFS = `precision highp float; varying vec3 vC; void main(){ vec2 d = gl_PointCoord - .5; float r = length(d)*2.0; if (r > 1.0) discard; float a = exp(-r*r*5.0)*.55 + smoothstep(.22, 0.0, r)*.9; gl_FragColor = vec4(vC*a, 1.0); }`;

  const PHOTO = `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uScale; void main(){ vec2 uv = (vUv - .5) * uScale + .5; gl_FragColor = vec4(texture2D(uTex, uv).rgb, 1.0); }`;
  const QVS = `precision highp float; attribute vec2 aP; varying vec2 vUv; void main(){ vUv = aP*.5 + .5; gl_Position = vec4(aP, 0.0, 1.0); }`;
  const BRIGHT = `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uTexel; uniform float uThr;
    void main(){ vec3 c = (texture2D(uTex, vUv + uTexel*vec2(-1.0,-1.0)).rgb + texture2D(uTex, vUv + uTexel*vec2(1.0,-1.0)).rgb + texture2D(uTex, vUv + uTexel*vec2(-1.0,1.0)).rgb + texture2D(uTex, vUv + uTexel*vec2(1.0,1.0)).rgb) * .25;
      float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(uThr, 1.0, l), 1.0); }`;
  const BLUR = `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir;
    void main(){ vec3 c = texture2D(uTex, vUv).rgb * .227027; c += (texture2D(uTex, vUv + uDir*1.3846).rgb + texture2D(uTex, vUv - uDir*1.3846).rgb) * .316216; c += (texture2D(uTex, vUv + uDir*3.2308).rgb + texture2D(uTex, vUv - uDir*3.2308).rgb) * .070270; gl_FragColor = vec4(c, 1.0); }`;
  const AO = `precision highp float; varying vec2 vUv; uniform sampler2D uDepth; uniform vec2 uTexel; uniform vec2 uProj; uniform vec2 uNF; uniform float uR;
    float lin(vec2 uv){ float d = texture2D(uDepth, uv).r; float z = d*2.0 - 1.0; return 2.0*uNF.x*uNF.y / (uNF.y + uNF.x - z*(uNF.y - uNF.x)); }
    vec3 pos(vec2 uv){ float z = lin(uv); return vec3((uv*2.0 - 1.0) * uProj * z, -z); }
    void main(){
      float d0 = texture2D(uDepth, vUv).r; if (d0 >= .99999) { gl_FragColor = vec4(1.0); return; }
      vec3 P = pos(vUv); vec3 N = normalize(cross(pos(vUv + vec2(uTexel.x, 0.0)) - P, pos(vUv + vec2(0.0, uTexel.y)) - P)); if (dot(N, -P) < 0.0) N = -N;
      float rad = uR / (-P.z * uProj.y * 2.0); float rot = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
      float occ = 0.0;
      for (int i=0;i<14;i++){ float a = (float(i) + .5) / 14.0; float ang = a*29.0 + rot; vec2 off = vec2(cos(ang), sin(ang)) * a * rad;
        vec3 v = pos(vUv + off) - P; float d2 = dot(v, v); float vn = dot(v, N) / sqrt(d2 + 1e-4);
        occ += max(0.0, vn - .12) * (1.0 - smoothstep(uR*uR*.4, uR*uR*2.2, d2)); }
      gl_FragColor = vec4(vec3(clamp(1.0 - occ/14.0*1.7, 0.0, 1.0)), 1.0); }`;
  const COMP = `precision highp float; varying vec2 vUv; uniform sampler2D uScene; uniform sampler2D uAO; uniform sampler2D uBloom; uniform sampler2D uDepth; uniform vec2 uST; uniform float uSS; uniform float uAOMix; uniform float uBloomK; uniform float uToon; uniform float uHasDepth; uniform vec2 uNF;
    float ld(vec2 uv){ float z = texture2D(uDepth, uv).r*2.0 - 1.0; return 2.0*uNF.x*uNF.y / (uNF.y + uNF.x - z*(uNF.y - uNF.x)); }
    float h2(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f); return mix(mix(h2(i), h2(i + vec2(1.0,0.0)), f.x), mix(h2(i + vec2(0.0,1.0)), h2(i + vec2(1.0,1.0)), f.x), f.y); }
    void main(){
      vec3 c; if (uSS > 1.2){ vec2 o = uST * .25 * uSS; c = (texture2D(uScene, vUv + vec2(-o.x,-o.y)).rgb + texture2D(uScene, vUv + vec2(o.x,-o.y)).rgb + texture2D(uScene, vUv + vec2(-o.x,o.y)).rgb + texture2D(uScene, vUv + vec2(o.x,o.y)).rgb) * .25; } else c = texture2D(uScene, vUv).rgb;
      float ao = texture2D(uAO, vUv).r; c *= mix(1.0, ao, uAOMix);
      c += texture2D(uBloom, vUv).rgb * uBloomK;
      if (uToon > .5){
        if (uHasDepth > .5){ vec2 o = uST * max(1.0, uSS) * 1.1; float d0 = ld(vUv); float e = max(max(abs(ld(vUv + vec2(o.x,0.0)) - d0), abs(ld(vUv - vec2(o.x,0.0)) - d0)), max(abs(ld(vUv + vec2(0.0,o.y)) - d0), abs(ld(vUv - vec2(0.0,o.y)) - d0))) / max(d0, .5);
          float edge = smoothstep(.025, .07, e) * (1.0 - smoothstep(60.0, 140.0, d0)); c = mix(c, c * vec3(.42, .34, .32), edge * .7); }
        float l0 = dot(c, vec3(.2126, .7152, .0722)); c = mix(vec3(l0), c, 1.12); c = c*.9 + .07;
        c *= .965 + .05 * n2(gl_FragCoord.xy * .23) + .02 * n2(gl_FragCoord.xy * 1.7);
      }
      float l = dot(c, vec3(.2126, .7152, .0722)); c = mix(vec3(l), c, 1.1); c = clamp(c, 0.0, 1.0); c = mix(c, c*c*(3.0 - 2.0*c), uToon > .5 ? .12 : .3);
      vec2 q = vUv - .5; c *= 1.0 - dot(q,q)*.6;
      c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.0;
      gl_FragColor = vec4(c, 1.0); }`;
  function program(gl, vs, fs){
    const mk = (t,s) => { const sh = gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER,vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i=0;i<n;i++){ const info = gl.getActiveUniform(p,i); const name = info.name.replace('[0]',''); u[name] = gl.getUniformLocation(p, info.name); }
    const a = {}, m = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (let i=0;i<m;i++){ const info = gl.getActiveAttrib(p,i); a[info.name] = gl.getAttribLocation(p, info.name); }
    return { p, u, a };
  }

  /* ---------- renderer ---------- */
  class Renderer {
    constructor(canvas, { preserve=false } = {}){
      this.canvas = canvas;
      const opts = { antialias:true, alpha:false, preserveDrawingBuffer:preserve, powerPreference:'high-performance' };
      const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
      if (!gl) throw new Error('WebGL unavailable');
      this.gl = gl; this.main = program(gl, VS, FS); this.shad = program(gl, SVS, SFS); this.glw = program(gl, GVS, GFS); this.depth = program(gl, DVS, DFS);
      const big = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096), mobile = matchMedia('(max-width: 760px)').matches;
      this.smSize = Math.min(big, mobile ? 2048 : 3072);
      this.smTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.smSize, this.smSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
      this.smRb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, this.smRb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.smSize, this.smSize);
      this.smFb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.smTex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.smRb);
      this.smOk = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      try {
        this.dext = gl.getExtension('WEBGL_depth_texture');
        this.pPhoto = program(gl, QVS, PHOTO); this.pBright = program(gl, QVS, BRIGHT); this.pBlur = program(gl, QVS, BLUR); this.pComp = program(gl, QVS, COMP); this.pAO = this.dext ? program(gl, QVS, AO) : null;
        this.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
        this.white = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.white); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
        this.postOk = true;
      } catch(e){ console.warn('Post-processing off', e); this.postOk = false; }
      const dpr = window.devicePixelRatio || 1; this.maxSS = mobile ? 1.25 : dpr >= 2 ? 1.25 : dpr >= 1.5 ? 1.5 : 2; this.ss = preserve ? Math.max(1.5, this.maxSS) : this.maxSS; this.avg = 16; this.coolT = 0;
      this.bufs = []; this.scene = null;
    }
    _tex(w, h, linear=true){ const gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const f = linear ? gl.LINEAR : gl.NEAREST; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
    _target(w, h, depth=false){
      const gl = this.gl, fb = gl.createFramebuffer(), tex = this._tex(w, h); let dt = null, rb = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (depth){ if (this.dext){ dt = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, dt); gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
          [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, dt, 0); }
        else { rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb); } }
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { fb, tex, dt, rb, w, h, ok };
    }
    _free(t){ if (!t) return; const gl = this.gl; gl.deleteFramebuffer(t.fb); gl.deleteTexture(t.tex); t.dt && gl.deleteTexture(t.dt); t.rb && gl.deleteRenderbuffer(t.rb); }
    _targets(w, h){
      const gl = this.gl, mx = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
      const k = Math.min(this.ss, mx / Math.max(w, h)), W2 = Math.max(2, Math.round(w*k)), H2 = Math.max(2, Math.round(h*k));
      const p = this.pt; if (p && p.W === W2 && p.H === H2 && p.w === w && p.h === h) return p;
      if (p) ['scene','ao1','ao2','b1','b2'].forEach(n => this._free(p[n]));
      const hw = Math.max(2, Math.round(w/2)), hh = Math.max(2, Math.round(h/2)), qw = Math.max(2, Math.round(w/4)), qh = Math.max(2, Math.round(h/4));
      this.pt = { W:W2, H:H2, w, h, k, scene:this._target(W2, H2, true), ao1:this.pAO ? this._target(hw, hh) : null, ao2:this.pAO ? this._target(hw, hh) : null, b1:this._target(qw, qh), b2:this._target(qw, qh) };
      if (!this.pt.scene.ok){ this.postOk = false; }
      return this.pt;
    }
    setPhoto(img){ const gl = this.gl; if (!this.photoTex) this.photoTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.photoTex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE)); this.photoAR = img.width / img.height; }
    adapt(ms){ if (!ms || ms > 500) return; this.avg = this.avg*.92 + ms*.08; const now = performance.now(); if (now < this.coolT) return;
      if (this.avg > 40 && this.ss > .75){ this.ss = Math.max(.75, this.ss - .25); this.coolT = now + 1500; }
      else if (this.avg < 19 && this.ss < this.maxSS){ this.ss = Math.min(this.maxSS, this.ss + .25); this.coolT = now + 2500; } }
    _q(P){ const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); gl.enableVertexAttribArray(P.a.aP); gl.vertexAttribPointer(P.a.aP, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.disableVertexAttribArray(P.a.aP); }
    _bindT(unit, tex, loc){ const gl = this.gl; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unit); }
    _post(w, h, cam, def){
      const gl = this.gl, pt = this.pt; gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.depthMask(false);
      // bloom
      gl.bindFramebuffer(gl.FRAMEBUFFER, pt.b1.fb); gl.viewport(0, 0, pt.b1.w, pt.b1.h); let P = this.pBright; gl.useProgram(P.p);
      this._bindT(0, pt.scene.tex, P.u.uTex); gl.uniform2f(P.u.uTexel, (pt.W/pt.b1.w)*.5/pt.W, (pt.H/pt.b1.h)*.5/pt.H); gl.uniform1f(P.u.uThr, def.bloomThr ?? .9); this._q(P);
      P = this.pBlur; gl.useProgram(P.p);
      [[1,0],[0,1],[2,0],[0,2]].forEach(([dx,dy], i) => { const src = i % 2 ? pt.b2 : pt.b1, dst = i % 2 ? pt.b1 : pt.b2; gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb); this._bindT(0, src.tex, P.u.uTex); gl.uniform2f(P.u.uDir, dx/src.w, dy/src.h); this._q(P); });
      // ambient occlusion
      let aoTex = this.white;
      if (this.pAO && pt.scene.dt && def.ao !== false){
        P = this.pAO; gl.useProgram(P.p); gl.bindFramebuffer(gl.FRAMEBUFFER, pt.ao1.fb); gl.viewport(0, 0, pt.ao1.w, pt.ao1.h);
        this._bindT(0, pt.scene.dt, P.u.uDepth); const th = Math.tan((cam.fov || .78)/2); gl.uniform2f(P.u.uProj, th * w/h, th); gl.uniform2f(P.u.uNF, .1, 400); gl.uniform2f(P.u.uTexel, 1.5/pt.W, 1.5/pt.H); gl.uniform1f(P.u.uR, def.aoR ?? .55); this._q(P);
        P = this.pBlur; gl.useProgram(P.p); gl.bindFramebuffer(gl.FRAMEBUFFER, pt.ao2.fb); this._bindT(0, pt.ao1.tex, P.u.uTex); gl.uniform2f(P.u.uDir, 1/pt.ao1.w, 0); this._q(P);
        gl.bindFramebuffer(gl.FRAMEBUFFER, pt.ao1.fb); this._bindT(0, pt.ao2.tex, P.u.uTex); gl.uniform2f(P.u.uDir, 0, 1/pt.ao1.h); this._q(P); aoTex = pt.ao1.tex; }
      // composite to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h); P = this.pComp; gl.useProgram(P.p);
      this._bindT(0, pt.scene.tex, P.u.uScene); this._bindT(1, aoTex, P.u.uAO); this._bindT(2, pt.b1.tex, P.u.uBloom); this._bindT(3, pt.scene.dt || this.white, P.u.uDepth);
      const toon = GL3D.style === 'illustrated' ? 1 : 0; gl.uniform1f(P.u.uToon, toon); gl.uniform1f(P.u.uHasDepth, pt.scene.dt ? 1 : 0); gl.uniform2f(P.u.uNF, .1, 400);
      gl.uniform2f(P.u.uST, 1/pt.W, 1/pt.H); gl.uniform1f(P.u.uSS, pt.k); gl.uniform1f(P.u.uAOMix, (def.aoMix ?? .85) * (toon ? .55 : 1)); gl.uniform1f(P.u.uBloomK, (def.bloom ?? .5) * (toon ? 1.3 : 1)); this._q(P);
      gl.activeTexture(gl.TEXTURE0); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
    }
    _buf(data){ const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); this.bufs.push(b); return b; }
    _mesh(g){ return { count:g.p.length/3, pos:this._buf(g.p), nor:this._buf(g.n), col:this._buf(g.c), mat:this._buf(g.m) }; }
    dispose(){ const gl = this.gl; this.bufs.forEach(b => gl.deleteBuffer(b)); this.bufs = []; this.scene = null; }
    load(def){
      this.dispose();
      const g = new Geo(), sc = { lights:[], dyn:[], def };
      sc.addLight = (p, col, i, range, flicker=0) => sc.lights.push({ p, c:hexD(col), i, range, flicker, ph:Math.random()*9 });
      const pending = []; sc.dynamic = (build, update, opts={}) => { const dg = new Geo(); build(dg); pending.push({ g:dg, update, opts }); };
      def.build(g, sc);
      // sky dome
      const sky = new Geo(), top = hex(def.sky[0]), bot = hex(def.sky[1]), seg = 24, rings = 12, R = 160;
      for (let j=0;j<rings;j++) for (let i=0;i<seg;i++){ const P = (i,j) => { const th = j/rings*Math.PI, ph = i/seg*Math.PI*2; return [Math.sin(th)*Math.cos(ph)*R, Math.cos(th)*R*.6, Math.sin(th)*Math.sin(ph)*R]; };
        const C = p => { const k = Math.min(1, Math.max(0, (p[1]/(R*.6)+.15)/1.0)); return [bot[0]+(top[0]-bot[0])*k, bot[1]+(top[1]-bot[1])*k, bot[2]+(top[2]-bot[2])*k]; };
        [P(i,j),P(i+1,j),P(i+1,j+1),P(i,j),P(i+1,j+1),P(i,j+1)].forEach(p => { sky.p.push(...p); sky.n.push(0,1,0); sky.c.push(...C(p)); sky.m.push(0,0,3); }); }
      sc.sky = this._mesh(sky);
      sc.stat = this._mesh(g);
      this.scene = sc; pending.forEach(p => this.addDyn(p.g, p.update, p.opts));
      sc.shadows = g.sp.length ? { n:g.sp.length/3, p:this._buf(g.sp), a:this._buf(g.sa) } : null;
      sc.glows = g.gp.length ? { n:g.gp.length/3, p:this._buf(g.gp), c:this._buf(g.gc), g:this._buf(g.gg) } : null;
      this.scene = sc; return sc;
    }
    addDyn(g, update, opts={}){
      const own = [], B = data => { const b = this._buf(data); own.push(b); return b; };
      const d = { update, opts, own, mesh:{ count:g.p.length/3, pos:B(g.p), nor:B(g.n), col:B(g.c), mat:B(g.m) } };
      if (g.gp.length) d.glow = { n:g.gp.length/3, p:B(g.gp), c:B(g.gc), g:B(g.gg) };
      if (g.sp.length) d.shadow = { n:g.sp.length/3, p:B(g.sp), a:B(g.sa) };
      this.scene.dyn.push(d); return d;
    }
    removeDyn(d){ if (!d) return; const gl = this.gl; d.own.forEach(b => gl.deleteBuffer(b)); this.bufs = this.bufs.filter(b => !d.own.includes(b)); const i = this.scene ? this.scene.dyn.indexOf(d) : -1; if (i >= 0) this.scene.dyn.splice(i,1); }
    _attr(loc, buf, size){ const gl = this.gl; if (loc < 0 || loc == null) return; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); }
    _drawMesh(m, model){
      const gl = this.gl, P = this.main; gl.uniformMatrix4fv(P.u.uModel, false, model);
      this._attr(P.a.aPos, m.pos, 3); this._attr(P.a.aNor, m.nor, 3); this._attr(P.a.aCol, m.col, 3); this._attr(P.a.aMat, m.mat, 3);
      gl.drawArrays(gl.TRIANGLES, 0, m.count);
    }
    _drawGlow(G, VP, scale, t, model){
      const gl = this.gl, P = this.glw; gl.useProgram(P.p);
      gl.uniformMatrix4fv(P.u.uVP, false, model ? mul4(VP, model) : VP); gl.uniform1f(P.u.uScale, scale); gl.uniform1f(P.u.uTime, t);
      this._attr(P.a.aPos, G.p, 3); this._attr(P.a.aCol, G.c, 3); this._attr(P.a.aG, G.g, 4); gl.drawArrays(gl.POINTS, 0, G.n);
    }
    render(t, cam){
      const gl = this.gl, sc = this.scene; if (!sc) return; const def = sc.def;
      const cw = this.canvas.width, ch = this.canvas.height;
      const post = this.postOk && def.post !== false ? this._targets(cw, ch) : null, usePost = post && this.postOk;
      const w = usePost ? post.W : cw, h = usePost ? post.H : ch, target = usePost ? post.scene.fb : null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target); gl.viewport(0,0,w,h);
      const fog = hex(def.fog); gl.clearColor(...fog.map(v => Math.pow(v,1/2.2)), 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.depthMask(true); gl.disable(gl.BLEND);
      const VP = mul4(persp(cam.fov || .78, w/h, .1, 400), lookAt(cam.eye, cam.target, [0,1,0]));
      // shadow map from the key light
      const sb = def.shadowBox || { cx:0, cz:0, half:14 }, sd = norm(def.sun.dir), hf = sb.half;
      const lctr = [sb.cx, 0, sb.cz], le = [lctr[0] + sd[0]*80, sd[1]*80, lctr[2] + sd[2]*80], up = Math.abs(sd[1]) > .95 ? [0,0,-1] : [0,1,0];
      const ortho = [1/hf,0,0,0, 0,1/hf,0,0, 0,0,-2/(160),0, 0,0,-(160+1)/(160-1),1];
      const LVP = mul4(ortho, lookAt(le, lctr, up));
      const useSh = this.smOk && def.shadows !== false;
      if (useSh){ const Dp = this.depth; gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFb); gl.viewport(0,0,this.smSize,this.smSize); gl.clearColor(1,1,1,1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(Dp.p); gl.uniformMatrix4fv(Dp.u.uLightVP, false, LVP);
        const dm = (m, model) => { gl.uniformMatrix4fv(Dp.u.uModel, false, model); this._attr(Dp.a.aPos, m.pos, 3); gl.drawArrays(gl.TRIANGLES, 0, m.count); };
        dm(sc.stat, mat4(ID)); sc.dyn.forEach(d => { if (d.opts.additive || d.opts.noShadow) return; const m = d.update(t, cam); d._m = m; d._done = true; if (m && d.mesh.count) dm(d.mesh, m); });
        gl.bindFramebuffer(gl.FRAMEBUFFER, target); gl.viewport(0,0,w,h); gl.clearColor(...fog.map(v => Math.pow(v,1/2.2)), 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); }
      if (def.photo && this.photoTex && this.pPhoto){ const Q = this.pPhoto; gl.useProgram(Q.p); gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
        const A = w / h, I = this.photoAR || 1; gl.uniform2f(Q.u.uScale, A > I ? 1 : A / I, A > I ? I / A : 1); this._bindT(0, this.photoTex, Q.u.uTex); this._q(Q); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); }
      const P = this.main; gl.useProgram(P.p); gl.uniform1f(P.u.uCatch, def.catchK ?? .55); gl.uniform1f(P.u.uToon, GL3D.style === 'illustrated' ? 1 : 0);
      gl.uniform1f(P.u.uVig, usePost ? 0 : 1); gl.uniform1f(P.u.uClouds, def.clouds ?? (def.sun.i > .5 ? .75 : .1)); gl.uniform1f(P.u.uSunVis, def.sunVis ?? (def.sun.i > .5 ? 1 : 0));
      gl.uniformMatrix4fv(P.u.uLightVP, false, LVP); gl.uniform1f(P.u.uShadowOn, useSh ? 1 : 0); gl.uniform1f(P.u.uShadowTexel, 1.6/this.smSize); gl.uniform1f(P.u.uShadowAmb, def.shadowAmb ?? .42);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.uniform1i(P.u.uShadowMap, 0);
      const st = hex(def.sky[0]), sbt = hex(def.sky[1]); gl.uniform3fv(P.u.uEnvTop, def.envTop || st.map(v => v*1.2)); gl.uniform3fv(P.u.uEnvBot, def.envBot || sbt.map(v => v*1.1));
      gl.uniformMatrix4fv(P.u.uVP, false, VP); gl.uniform1f(P.u.uTime, t); gl.uniform3fv(P.u.uCam, cam.eye); gl.uniform2f(P.u.uRes, w, h);
      gl.uniform3fv(P.u.uSky, hexD(def.hemi[0], def.hemi[2])); gl.uniform3fv(P.u.uGround, hexD(def.hemi[1], def.hemi[2]));
      gl.uniform3fv(P.u.uSunDir, norm(def.sun.dir)); gl.uniform3fv(P.u.uSunCol, hexD(def.sun.col, def.sun.i));
      gl.uniform3fv(P.u.uLedA, def.ledA || [1,.55,.25]); gl.uniform3fv(P.u.uLedB, def.ledB || [.95,.75,.9]);
      gl.uniform3fv(P.u.uFog, fog); gl.uniform1f(P.u.uFogD, def.fogD || .02); gl.uniform1f(P.u.uExposure, def.exposure || 1);
      const L = sc.lights.slice(0,12), lp = [], lc = [], lr = [];
      L.forEach(l => { const f = l.flicker ? (1 - l.flicker*(.5+.5*Math.sin(t*9+l.ph)*Math.sin(t*5.3+l.ph*2))) : 1; lp.push(...l.p); lc.push(...l.c.map(v => v*l.i*f)); lr.push(l.range); });
      while (lp.length < 36){ lp.push(0,0,0); lc.push(0,0,0); lr.push(1); }
      gl.uniform3fv(P.u.uLPos, lp); gl.uniform3fv(P.u.uLCol, lc); gl.uniform1fv(P.u.uLRange, lr); gl.uniform1i(P.u.uNumL, L.length);
      const I = mat4(ID);
      if (!def.photo){ gl.depthMask(false); this._drawMesh(sc.sky, mat4({ M:[1,0,0,0,1,0,0,0,1], t:[cam.eye[0], 0, cam.eye[2]] })); gl.depthMask(true); }
      this._drawMesh(sc.stat, I);
      const additive = [];
      const catchers = [];
      sc.dyn.forEach(d => { const m = d._done ? d._m : d.update(t, cam); d._m = m; d._done = false; if (!m) return; if (d.opts.additive) additive.push(d); else if (d.opts.catcher) catchers.push(d); else this._drawMesh(d.mesh, m); });
      gl.enable(gl.BLEND); gl.depthMask(false);
      if (sc.shadows){ const S = this.shad; gl.useProgram(S.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.uniformMatrix4fv(S.u.uVP, false, VP); gl.uniform1f(S.u.uShadow, def.shadow ?? .55);
        gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1,-1); this._attr(S.a.aPos, sc.shadows.p, 3); this._attr(S.a.aA, sc.shadows.a, 1); gl.drawArrays(gl.TRIANGLES, 0, sc.shadows.n); gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.disableVertexAttribArray(S.a.aA); }
      const dsh = sc.dyn.filter(d => d.shadow && d._m);
      if (dsh.length){ const S = this.shad; gl.useProgram(S.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(S.u.uShadow, def.shadow ?? .55); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1,-1);
        dsh.forEach(d => { gl.uniformMatrix4fv(S.u.uVP, false, mul4(VP, d._m)); this._attr(S.a.aPos, d.shadow.p, 3); this._attr(S.a.aA, d.shadow.a, 1); gl.drawArrays(gl.TRIANGLES, 0, d.shadow.n); });
        gl.disable(gl.POLYGON_OFFSET_FILL); gl.disableVertexAttribArray(S.a.aA); }
      if (catchers.length){ gl.useProgram(P.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); catchers.forEach(d => this._drawMesh(d.mesh, d._m)); }
      gl.blendFunc(gl.ONE, gl.ONE);
      if (additive.length){ gl.useProgram(P.p); additive.forEach(d => this._drawMesh(d.mesh, d._m)); }
      const scale = h * 0.9;
      if (sc.glows) this._drawGlow(sc.glows, VP, scale, t);
      sc.dyn.forEach(d => { if (d.glow && d._m) this._drawGlow(d.glow, VP, scale, t, d._m); });
      [P,this.shad,this.glw,this.depth].forEach(pr => Object.values(pr.a).forEach(l => l >= 0 && gl.disableVertexAttribArray(l)));
      gl.depthMask(true); gl.disable(gl.BLEND);
      if (usePost) this._post(cw, ch, cam, def);
    }
  }

  /* ---------- live viewer: orbit camera, autoplay, drag ---------- */
  class Viewer {
    constructor(canvas){
      this.canvas = canvas; this.r = new Renderer(canvas); this.t0 = performance.now(); this.drag = null; this.userTheta = 0; this.userPhi = 0; this.idleUntil = 0; this.visible = true; this.raf = 0;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ro = new ResizeObserver(() => this.resize()); ro.observe(canvas); this.ro = ro;
      const io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }); io.observe(canvas); this.io = io;
      canvas.addEventListener('pointerdown', e => { this.drag = { x:e.clientX, y:e.clientY, th:this.userTheta, ph:this.userPhi }; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener('pointermove', e => { if (!this.drag) return; this.userTheta = this.drag.th - (e.clientX - this.drag.x) * .008; this.userPhi = Math.max(-.35, Math.min(.35, this.drag.ph + (e.clientY - this.drag.y) * .004)); this.idleUntil = performance.now() + 3500; });
      const end = () => { this.drag = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
      canvas.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') this.userTheta -= .2; if (e.key === 'ArrowRight') this.userTheta += .2; this.idleUntil = performance.now() + 3500; });
      this.lost = false; canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; });
    }
    resize(){ const dpr = Math.min(window.devicePixelRatio || 1, 3), r = this.canvas.getBoundingClientRect(); const w = Math.max(2, Math.round(r.width*dpr)), h = Math.max(2, Math.round(r.height*dpr)); if (this.canvas.width !== w || this.canvas.height !== h){ this.canvas.width = w; this.canvas.height = h; } this.frame(); }
    load(def){ this.def = def; this.r.load(def); this.auto = 0; this.last = performance.now(); this.frame(); }
    camera(t){
      const c = this.def.cam, now = performance.now(), dt = Math.min(.05, (now - (this.last||now))/1000); this.last = now;
      if (!this.reduced && now > this.idleUntil && !this.drag) this.auto += dt * (c.speed ?? .1);
      const th = c.theta + this.auto + this.userTheta, ph = c.phi + this.userPhi, R = c.r;
      const tg = c.target, eye = [tg[0] + Math.cos(th)*Math.cos(ph)*R, tg[1] + Math.sin(ph)*R, tg[2] + Math.sin(th)*Math.cos(ph)*R];
      return { eye, target:tg, fov:c.fov };
    }
    frame(){ if (!this.def || this.lost) return; const now = performance.now(), t = (now - this.t0)/1000; if (this._lf) this.r.adapt(now - this._lf); this._lf = now; this.r.render(this.reduced ? 2 : t, this.camera(t)); }
    loop(){ cancelAnimationFrame(this.raf); const step = () => { if (!this.visible || document.hidden || !this.canvas.isConnected){ return; } this.frame(); this.raf = requestAnimationFrame(step); }; this.raf = requestAnimationFrame(step); }
    destroy(){ cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect(); this.r.dispose(); const ext = this.r.gl.getExtension('WEBGL_lose_context'); ext && ext.loseContext(); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) GL3D._viewers.forEach(v => v.visible && v.loop()); });

  /* ---------- snapshots (one shared context for thumbnails) ---------- */
  let snapR = null;
  function snapshot(def, w=880, h=560){
    if (!snapR){ const c = document.createElement('canvas'); snapR = new Renderer(c, { preserve:true }); }
    snapR.canvas.width = w; snapR.canvas.height = h; snapR.load(def);
    const c = def.cam, th = c.theta + (c.snapTheta || 0), ph = c.phi, tg = c.target;
    snapR.render(3.2, { eye:[tg[0]+Math.cos(th)*Math.cos(ph)*c.r, tg[1]+Math.sin(ph)*c.r, tg[2]+Math.sin(th)*Math.cos(ph)*c.r], target:tg, fov:c.fov });
    const url = snapR.canvas.toDataURL('image/jpeg', .86); snapR.dispose(); return url;
  }
  function supported(){ try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch(e){ return false; } }
  let style = 'illustrated'; try { style = localStorage.getItem('ma3ak:style') || 'illustrated'; } catch(e){}
  return { style, Geo, T, Renderer, Viewer, snapshot, supported, hex, hexD, mat4, mul4, persp, lookAt, norm, sub, cross, _viewers:new Set() };
})();

/* ---- scenes3d.js ---- */
/* =========================================================
   MA3AK 3D SCENES — example setups modeled on common event
   designs (ballroom receptions, rooftop lounges, beach dinners…).
   Illustrations only; not real venues.
   ========================================================= */
const S3 = (() => {
  const mdl = o => GL3D.mat4(GL3D.T(o));
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const pick = a => a[Math.floor(rnd()*a.length)];
  const faceTo = (x, z, cx, cz) => Math.atan2(-(cx - x), -(cz - z)); // ry so local -z faces (cx,cz)

  /* ---------- furniture & decor ---------- */
  function chair(g, x, z, ry, o={}){
    const leg = o.leg || '#C8A96B', seat = o.seat || leg, sp = o.spec ?? .6;
    g.at({ x, z, ry }, g => {
      [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]].forEach(([a,b]) => g.box(a,0,b,.035,.45,.035,leg,{ s:sp }));
      g.box(0,.45,0,.42,.06,.42,seat,{ s:.15 });
      g.box(-.18,.5,.19,.035,.52,.035,leg,{ s:sp }); g.box(.18,.5,.19,.035,.52,.035,leg,{ s:sp });
      if (o.solid) g.box(0,.56,.2,.42,.44,.05,o.back || seat,{ s:.15 });
      else [.64,.8,.96].forEach(y => g.box(0,y,.19,.38,.03,.03,leg,{ s:sp }));
    });
    g.shadow(x, z, .34, .28);
  }
  function candle(g, x, y, z, h=.12, col='#F6EFE3'){ g.cyl(x,y,z,.025,.025,h,col,{ s:.1, e:.25 }); g.glow(x, y+h+.03, z, .09, [1,.72,.38], .35, 7); }
  function flowers(g, x, y, z, r, cols, n=9){ for (let i=0;i<n;i++){ const a = rnd()*6.28, d = rnd()*r*.8, h = rnd()*r*.6; g.sphere(x+Math.cos(a)*d, y+h, z+Math.sin(a)*d, r*(.35+rnd()*.25), pick(cols), { s:.1 }, 8); } }
  function greenery(g, x, y, z, len, ry, col='#4E6B47'){ g.at({ x, y, z, ry }, g => { for (let i=0;i<len*7;i++) g.sphere(-len/2 + rnd()*len, rnd()*.05, (rnd()-.5)*.18, .07+rnd()*.05, rnd()<.5 ? col : '#6B8A5E', { s:.05 }, 6, .6); }); }
  function roundTable(g, x, z, o={}){
    const cloth = o.cloth || '#F3EEE5', n = o.n || 8, R = 1.25;
    for (let k=0;k<n;k++){ const a = k/n*Math.PI*2 + .2, cx = x + Math.cos(a)*R, cz = z + Math.sin(a)*R; chair(g, cx, cz, faceTo(cx,cz,x,z), o.chair || {}); }
    g.cyl(x,0,z,.97,.9,.76,cloth,{ s:.08, f:9 },40);
    g.cyl(x,.76,z,.05,.05,.01,'#ffffff');
    const fl = o.flowers || ['#FFFFFF','#F2DCD3','#EBCFC4','#F8F1E7'];
    if (o.center === 'tall'){ g.tube([x,.76,z],[x,1.55,z],.035,o.metal || '#C8A96B',{ s:.9 }); flowers(g, x, 1.6, z, .32, fl, 12); greenery(g, x, 1.55, z, .7, rnd()*3); }
    else if (o.center === 'candelabra'){ g.tube([x,.76,z],[x,1.35,z],.03,'#C8A96B',{ s:.9 }); [-.22,0,.22].forEach((d,i) => { g.tube([x,1.2,z],[x+d,1.35,z],.02,'#C8A96B',{ s:.9 }); candle(g, x+d, 1.35, z, .18); }); flowers(g, x, .8, z, .25, fl, 7); }
    else { flowers(g, x, .8, z, .26, fl, 9); }
    [[.45,.1],[-.4,.25],[.1,-.45]].forEach(([dx,dz]) => candle(g, x+dx, .77, z+dz, .1));
    g.shadow(x, z, 1.55, .45);
  }
  function longTable(g, x, z, len, ry, o={}){
    const cloth = o.cloth || '#F3EEE5', w = o.w || 1.1;
    g.at({ x, z, ry }, g => {
      if (o.wood){ g.box(0,.7,0,len,.06,w,o.wood,{ s:.3 }); [[-len/2+.15,-w/2+.12],[len/2-.15,-w/2+.12],[-len/2+.15,w/2-.12],[len/2-.15,w/2-.12]].forEach(([a,b]) => g.box(a,0,b,.08,.7,.08,o.wood)); }
      else g.box(0,0,0,len,.76,w,cloth,{ s:.08, f:9 });
      const n = Math.floor(len/.68);
      for (let i=0;i<n;i++){ const px = -len/2 + .34 + i*.68 + (len - n*.68)/2;
        chair(g, px, -w/2-.42, 0, o.chair || {}); chair(g, px, w/2+.42, Math.PI, o.chair || {});
        if (i % 2 === 0) candle(g, px, .77, (rnd()-.5)*.2, o.tall ? .35 : .12);
        g.cyl(px, .77, -w/2+.22, .13, .13, .012, '#ffffff', { s:.6 }); g.cyl(px, .77, w/2-.22, .13, .13, .012, '#ffffff', { s:.6 }); }
      if (o.runner !== false){ greenery(g, 0, .78, 0, len*.92, 0, o.green); for (let i=0;i<len*1.6;i++) flowers(g, -len/2+.3+rnd()*(len-.6), .8, (rnd()-.5)*.15, .13, o.flowers || ['#FFFFFF','#F2DCD3','#EBCFC4'], 2); }
      if (o.candelabras) for (let i=1;i<o.candelabras+1;i++){ const px = -len/2 + i*len/(o.candelabras+1); g.tube([px,.76,0],[px,1.5,0],.03,'#C8A96B',{ s:.9 }); [-.25,0,.25].forEach(d => { g.tube([px,1.3,0],[px+d,1.48,0],.018,'#C8A96B',{ s:.9 }); candle(g, px+d, 1.48, 0, .22); }); }
    });
    g.shadow(x, z, 1, .45, len/2+.5, w+.5, -ry);
  }
  const shadeHex = (h, k) => '#' + [1,3,5].map(i => Math.round(parseInt(h.slice(i,i+2),16)*k).toString(16).padStart(2,'0')).join('');
  function person(g, sc, x, z, o={}){
    const top = o.top || pick(['#1d1c1b','#2b2a33','#EDE6DA','#7A5C4A','#3E4A5A','#C8A96B','#A9625A','#6B1E2A','#1F3A2F']);
    const legs = o.legs || pick(['#1b1b1d','#23262d','#2e2a26']), skin = o.skin || pick(['#E2C0A2','#C99B78','#B9855F','#EBCDB3','#D7AE8C']), hair = o.hair || pick(['#2a1d16','#3c2a1e','#151210','#6b4a32','#8a6a45']);
    const dress = o.dress ?? rnd() < .45, longHair = o.longHair ?? (dress ? rnd() < .85 : rnd() < .1), ph = rnd()*6.28, base = o.ry ?? rnd()*6.28, dance = o.dance, sc_ = .95 + rnd()*.12, shoes = dress ? '#C8A96B' : '#141414';
    sc.dynamic(g => g.at({ s:sc_ }, g => {
      if (dress){ g.cyl(0,.02,0,.33,.16,.98,top,{ s:.35 },28); g.cyl(0,.9,0,.16,.15,.12,top,{ s:.35 },20); g.sphere(-.07,.04,-.04,.045,shoes,{ s:.8 },8,.6); g.sphere(.07,.04,-.04,.045,shoes,{ s:.8 },8,.6); }
      else { [-.09,.09].forEach(lx => { g.cyl(lx,.07,0,.058,.082,.77,legs,{ s:.25 },14); g.sphere(lx,.05,-.04,.075,shoes,{ s:.9 },12,.55); }); g.sphere(0,.84,0,.165,legs,{ s:.25 },16,.55); }
      g.cyl(0,.84,0,.15,.19,.5,top,{ s:.3 },20);
      [-1,1].forEach(sd => { g.sphere(.18*sd,1.32,0,.075,top,{ s:.3 },12); g.tube([.19*sd,1.31,0],[.235*sd,1.06,-.04],.046,top,{ s:.3 },10); g.sphere(.235*sd,1.06,-.04,.044,dress ? skin : top,{ s:.3 },10);
        g.tube([.235*sd,1.06,-.04],[.2*sd,.84,-.13],.037,dress ? skin : top,{ s:.3 },10); g.sphere(.2*sd,.82,-.14,.042,skin,{ s:.2 },10); });
      g.sphere(0,1.335,0,.14,top,{ s:.3 },16,.45);
      g.cyl(0,1.37,0,.048,.042,.11,skin,{ s:.2 },12);
      g.sphere(0,1.585,0,.1,skin,{ s:.22 },18,1.18);
      const lip = dress ? '#B0686A' : shadeHex(skin, .8), brow = shadeHex(hair, .9);
      [-1,1].forEach(sd => { g.sphere(.034*sd,1.598,-.09,.011,'#EDE9E3',{ s:.6 },10,.8); g.sphere(.034*sd,1.598,-.0995,.0058,pick(['#3a2617','#2a1d14','#4a3a22']),{ s:1 },8); g.box(.035*sd,1.622,-.094,.028,.0045,.008,brow,{ s:.1, rz:-.12*sd }); g.sphere(.099*sd,1.59,.005,.02,skin,{ s:.15 },8,1.35); });
      g.sphere(0,1.574,-.1,.0115,skin,{ s:.2 },10,1.5);
      g.sphere(0,1.538,-.093,.016,lip,{ s:.45 },10,.3);
      if (!dress){ g.box(0,.98,-.172,.085,.34,.012,'#F4F4F2',{ s:.3 }); g.box(0,.98,-.18,.032,.3,.008,pick(['#141414','#6B1E2A','#1F2D4A','#C8A96B']),{ s:.6 }); }
      if (longHair){ g.sphere(0,1.625,.018,.11,hair,{ s:.45 },18,1.08); g.cyl(0,1.3,.055,.085,.1,.34,hair,{ s:.45 },14); }
      else g.sphere(0,1.64,.012,.106,hair,{ s:.4 },18,.78);
    }), t => { const b = dance ? Math.abs(Math.sin(t*3.4+ph))*.07 : Math.sin(t*1.2+ph)*.008; const r = base + (dance ? Math.sin(t*1.6+ph)*.6 : Math.sin(t*.4+ph)*.15); return mdl({ x, y:b, z, ry:r }); });
    g.shadow(x, z, .3, .35);
  }
  function crowd(g, sc, cx, cz, rx, rz, n, o={}){ for (let i=0;i<n;i++){ const a = rnd()*6.28, d = Math.sqrt(rnd()); person(g, sc, cx + Math.cos(a)*rx*d, cz + Math.sin(a)*rz*d, o); } }
  function chandelier(g, sc, x, y, z, s=1, o={}){
    const gold = o.metal || '#C8A96B';
    g.tube([x,y+.4*s,z],[x,o.ceil || y+3,z],.015,gold,{ s:.9 });
    [[.75,0],[.5,.35],[.28,.65]].forEach(([r,dy]) => { const seg = 18; for (let i=0;i<seg;i++){ const a0 = i/seg*6.283, a1 = (i+1)/seg*6.283; g.tube([x+Math.cos(a0)*r*s, y+dy*s, z+Math.sin(a0)*r*s],[x+Math.cos(a1)*r*s, y+dy*s, z+Math.sin(a1)*r*s], .02*s, gold, { s:.9 }); }
      for (let i=0;i<seg;i+=1){ const a = i/seg*6.283, px = x+Math.cos(a)*r*s, pz = z+Math.sin(a)*r*s; const L = (.35 + (i%3)*.15)*s; g.tube([px,y+dy*s,pz],[px,y+dy*s-L,pz],.006,'#E9EEF2',{ s:1, e:.6 }); g.sphere(px,y+dy*s-L,pz,.035*s,'#F4F7FA',{ s:1, e:.9 },6); if (i%2===0) g.glow(px,y+dy*s+.05,pz,.16*s,[1,.82,.55],.15,3); } });
    g.sphere(x, y-.25*s, z, .12*s, '#F4F7FA', { s:1, e:1 }, 8); g.glow(x, y+.1*s, z, 1.6*s, [.55,.42,.25]);
    sc.addLight([x, y-.2, z], '#FFD9A6', o.i ?? 2.2, o.range ?? 7.5);
  }
  function stringLights(g, a, b, sag, n, o={}){
    const P = t => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t - sag*4*t*(1-t), a[2]+(b[2]-a[2])*t];
    for (let i=0;i<20;i++) g.tube(P(i/20), P((i+1)/20), .006, '#7a6a55', { s:.2 });
    for (let i=1;i<n;i++){ const p = P(i/n); g.sphere(p[0], p[1]-.06, p[2], .04, '#FFE6B5', { e:2.2, s:.5 }, 6); g.glow(p[0], p[1]-.06, p[2], o.size || .22, o.col || [1,.78,.45], .25, 2.5); }
  }
  function balloon(g, x, y, z, r, col, o={}){ g.sphere(x, y, z, r, col, { s:o.chrome ? 1 : .8, e:o.e || 0 }, 12, 1.12); g.sphere(x, y - r*1.1, z, r*.12, col, { s:.6 }, 5); if (o.string) g.tube([x, y - r*1.1, z],[x + (rnd()-.5)*.1, o.string, z + (rnd()-.5)*.1], .004, '#d8d2c8'); }
  function balloonGarland(g, pts, cols, dens=3){ for (let i=0;i<pts.length-1;i++){ const a = pts[i], b = pts[i+1]; for (let k=0;k<dens;k++){ const t = rnd(); const p = [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; const r = .12 + rnd()*.2; balloon(g, p[0]+(rnd()-.5)*.35, p[1]+(rnd()-.5)*.35, p[2]+(rnd()-.5)*.35, r, pick(cols), { chrome: rnd()<.18 }); } } }
  const arcPts = (cx, cz, w, h, ry, y0=0, n=14) => { const c = Math.cos(ry), s = Math.sin(ry); return Array.from({ length:n+1 }, (_,i) => { const t = i/n*Math.PI; const lx = -Math.cos(t)*w/2; return [cx + lx*c, y0 + Math.sin(t)*h, cz - lx*s]; }); };
  function djBooth(g, sc, x, z, ry, o={}){
    g.at({ x, z, ry }, g => {
      g.box(0,0,0,1.9,1.0,.75,'#151414',{ s:.5 });
      g.box(0,.08,-.38,1.86,.05,.01,o.led || '#C8A96B',{ e:3 }); g.box(0,.92,-.38,1.86,.03,.01,o.led || '#C8A96B',{ e:3 });
      [-.5,.5].forEach(d => { g.box(d,1,0,.55,.06,.45,'#222',{ s:.6 }); g.cyl(d,1.06,0,.16,.16,.02,'#3a3a3a',{ s:.9 }); });
      g.box(0,1,.05,.38,.05,.28,'#2d2d2d',{ s:.7, e:.4 });
      [-1.35,1.35].forEach(d => { g.box(d,0,0,.55,1.7,.5,'#111',{ s:.4 }); g.cyl(d,1.1,-.26,.17,.17,.02,'#2a2a2a',{ s:.8 }); g.cyl(d,.5,-.26,.2,.2,.02,'#2a2a2a',{ s:.8 }); });
    });
    g.glow(x, 1.3, z, 1.5, o.glow || [.45,.35,.2]); g.shadow(x, z, 1.6, .5, 1.6, .6, -ry);
  }
  function danceFloor(g, x, z, w, d, a, b, o={}){ const tw = o.tile || 1; for (let i=0;i<w/tw;i++) for (let j=0;j<d/tw;j++) g.box(x - w/2 + i*tw + tw/2, 0, z - d/2 + j*tw + tw/2, tw*.985, .03, tw*.985, (i+j)%2 ? a : b, { s:o.s ?? .95 }); if (o.border) { g.box(x, 0, z - d/2 - .05, w + .2, .035, .1, o.border, { s:.9 }); g.box(x, 0, z + d/2 + .05, w + .2, .035, .1, o.border, { s:.9 }); g.box(x - w/2 - .05, 0, z, .1, .035, d, o.border, { s:.9 }); g.box(x + w/2 + .05, 0, z, .1, .035, d, o.border, { s:.9 }); } }
  function cake(g, x, y, z, tiers=4, col='#FBF7F0', top=['#F2DCD3','#FFFFFF']){
    g.cyl(x,y,z,.35,.3,.08,'#C8A96B',{ s:.9 }); g.tube([x,y+.08,z],[x,y+.22,z],.04,'#C8A96B',{ s:.9 }); let yy = y + .22;
    [.32,.25,.19,.13,.09].slice(0,tiers).forEach(r => { g.cyl(x,yy,z,r,r,.2,col,{ s:.35 },22); g.cyl(x,yy+.19,z,r+.005,r+.005,.015,'#E9DDCB',{ s:.5 },22); yy += .2; });
    flowers(g, x+.1, yy-.05, z, .12, top, 5); g.shadow(x, z, .45, .3);
  }
  function sofa(g, x, z, ry, len, col, o={}){
    g.at({ x, z, ry }, g => {
      g.box(0,0,0,len,.42,.9,col,{ s:.15 }); g.box(0,.42,.32,len,.45,.25,col,{ s:.15 });
      g.box(-len/2+.1,.42,0,.2,.22,.9,col,{ s:.15 }); g.box(len/2-.1,.42,0,.2,.22,.9,col,{ s:.15 });
      for (let i=0;i<Math.floor(len/.6);i++) g.box(-len/2+.45+i*.6,.45,.12,.4,.36,.12,o.pillow || pick(['#EDE6DA','#C8A96B','#D9C9B4']),{ s:.1, ry:(rnd()-.5)*.3 });
      if (o.base) g.box(0,0,-.46,len,.06,.01,o.base,{ e:2.5 });
    });
    g.shadow(x, z, 1, .45, len/2+.2, .7, -ry);
  }
  function bar(g, sc, x, z, ry, len, o={}){
    g.at({ x, z, ry }, g => {
      g.box(0,0,0,len,1.05,.6,o.body || '#1c1a18',{ s:.4 }); g.box(0,1.05,0,len+.1,.05,.7,o.top || '#E9E4DC',{ s:.9 });
      g.box(0,.04,-.31,len,.03,.01,o.led || '#C8A96B',{ e:3 });
      g.box(0,0,1.25,len,2.3,.35,'#191716',{ s:.3 }); g.box(0,.9,1.07,len-.2,1.2,.02,o.back || '#C8A96B',{ e:.9 });
      for (let r=0;r<2;r++) for (let i=0;i<len*5;i++) g.cyl(-len/2+.2+i*.2, .95+r*.55, 1.15, .035, .025, .28, pick(['#2E5B3A','#6B2E2E','#E8DCC8','#3A2A1A','#8C6A2E']), { s:1 }, 6);
      for (let i=0;i<Math.floor(len/.75);i++){ const px = -len/2+.4+i*.75; g.tube([px,0,-.75],[px,.75,-.75],.03,'#C8A96B',{ s:.9 }); g.cyl(px,.75,-.75,.2,.2,.06,o.stool || '#2a2725',{ s:.3 }); }
    });
    g.glow(x, 1.5, z, 2.2, [.35,.27,.15]); sc.addLight([x, 2.2, z], '#FFD7A0', 1.2, 4.5); g.shadow(x, z, 1, .45, len/2+.4, 1.3, -ry);
  }
  function tree(g, x, z, kind='olive', s=1){
    if (kind === 'pine'){ g.cyl(x,0,z,.12*s,.08*s,1*s,'#4a3628'); [[1.9,1.2,1.3],[1.5,2,1.4],[1.05,2.8,1.4],[.6,3.5,1.2]].forEach(([r,y,h]) => g.cyl(x,y*s-.9*s,z,r*s,.05,h*s,pick(['#25402E','#2C4A35','#1F3829']),{ s:.05 },10)); g.shadow(x,z,1.6*s,.4); return; }
    if (kind === 'palm'){ const top = [x+.4*s, 4.2*s, z]; for (let i=0;i<8;i++) g.tube([x+.05*i*s,i*.52*s,z],[x+.05*(i+1)*s,(i+1)*.52*s,z],(.16-.008*i)*s,'#7a6047',{ s:.1 },8); for (let k=0;k<9;k++){ const a = k/9*6.28; g.at({ x:top[0], y:top[1], z:top[2], ry:a, rz:-.5 }, g => g.box(.9*s,0,0,1.8*s,.03,.32*s,'#4E6B3A',{ s:.2 })); } g.shadow(x,z,1.6*s,.35); return; }
    g.tube([x,0,z],[x+.15*s,1.1*s,z+.1*s],.11*s,'#6b5845',{ s:.1 },8); g.tube([x+.15*s,1.1*s,z+.1*s],[x-.2*s,1.7*s,z],.07*s,'#6b5845',{},6);
    for (let i=0;i<14;i++) g.sphere(x+(rnd()-.5)*1.3*s, 1.6*s+rnd()*.9*s, z+(rnd()-.5)*1.3*s, (.3+rnd()*.25)*s, pick(kind==='olive' ? ['#7C8B6A','#8E9C7B','#6D7B5C'] : ['#3F6B3A','#4F7D44','#2F5A30']), { s:.05 }, 8, .8);
    g.shadow(x, z, 1.1*s, .4);
  }
  function planter(g, x, z, s=1){ g.cyl(x,0,z,.32*s,.4*s,.65*s,'#D9D1C4',{ s:.2 },14); tree(g, x, z, 'olive', .55*s); }
  function torch(g, sc, x, z, h=2.2){ g.tube([x,0,z],[x,h,z],.035,'#3b2f25'); g.cyl(x,h,z,.06,.1,.18,'#2a2420',{ s:.3 }); g.glow(x,h+.3,z,.7,[1,.55,.2],.45,11); g.glow(x,h+.25,z,.25,[1,.85,.5],.3,15); sc.addLight([x,h+.4,z],'#FF9A4A',1.6,6,.35); }
  function lantern(g, x, z, s=1){ const h = .55*s, w = .3*s; g.box(x,0,z,w,.04*s,w,'#2a2420',{ s:.6 }); g.box(x,h-.04*s,z,w,.04*s,w,'#2a2420',{ s:.6 }); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b]) => g.box(x+a*w/2,0,z+b*w/2,.025*s,h,.025*s,'#2a2420',{ s:.6 }));
    g.tube([x,h,z],[x,h+.12*s,z],.03*s,'#2a2420'); g.box(x,.04*s,z,w*.85,h-.08*s,w*.85,'#F7E9CF',{ e:.35, s:1 }); g.cyl(x,.04*s,z,.05*s,.05*s,.14*s,'#FFF4E0',{ e:1.5 }); g.glow(x,.22*s,z,.55*s,[1,.72,.38],.35,6); g.shadow(x,z,.3*s,.3); }
  function umbrella(g, x, z, col='#F2EADC', h=2.3){ g.tube([x,0,z],[x,h+.35,z],.035,'#7a6a58'); g.cyl(x,h,z,1.35,.03,.55,col,{ s:.1 },16); g.cyl(x,h-.08,z,1.36,1.36,.08,col,{ s:.1 },16); g.shadow(x+.6,z+.3,1.4,.35); }
  function lounger(g, x, z, ry, col='#EFE7DA'){ g.at({ x, z, ry }, g => { g.box(0,0,0,.7,.25,1.9,'#8B6F52',{ s:.2 }); g.box(0,.25,-.2,.66,.1,1.4,col,{ s:.1 }); g.at({ y:.3, z:.75, rx:-.8 }, g => g.box(0,0,0,.66,.08,.7,col,{ s:.1 })); }); g.shadow(x,z,.6,.3,1,1.6,-ry); }
  function stage(g, x, z, w, d, h, col='#1a1918', o={}){ g.box(x,0,z,w,h,d,col,{ s:o.s ?? .5 }); if (o.led) g.box(x,h-.04,z+d/2+.005,w,.03,.01,o.led,{ e:3 }); g.shadow(x,z,1,.4,w/2+.3,d/2+.3); }
  function floralArch(g, x, z, ry, w, h, cols){ const pts = arcPts(x, z, w, h*.45, ry, h*.55, 22); const c = Math.cos(ry), s = Math.sin(ry);
    [-1,1].forEach(side => { const px = x + side*w/2*c, pz = z - side*w/2*s; g.tube([px,0,pz],[px,h*.55,pz],.05,'#E9E1D3',{ s:.4 }); for (let y=.1;y<h*.55;y+=.18) flowers(g, px, y, pz, .16, cols, 4); });
    pts.forEach(p => flowers(g, p[0], p[1], p[2], .2, cols, 9)); }
  function flowerWall(g, x, z, ry, w, h, cols){ g.at({ x, z, ry }, g => { g.box(0,0,0,w,h,.12,'#3F5A3A'); for (let i=0;i<w*h*14;i++) g.sphere(-w/2+rnd()*w, .1+rnd()*(h-.2), -.08, .09+rnd()*.07, pick(cols), { s:.1 }, 6); }); }
  function wallSet(g, sc, W, D, H, o){ // cutaway walls: hide the ones between camera and room
    const walls = [ { c:[0,0,-D/2], n:[0,0,1], w:W, ry:0 }, { c:[0,0,D/2], n:[0,0,-1], w:W, ry:Math.PI }, { c:[-W/2,0,0], n:[1,0,0], w:D, ry:Math.PI/2 }, { c:[W/2,0,0], n:[-1,0,0], w:D, ry:-Math.PI/2 } ];
    walls.forEach(wl => {
      sc.dynamic(g => { g.at({ x:wl.c[0], z:wl.c[2], ry:wl.ry }, g => {
        g.box(0,0,-.1,wl.w,H,.2,o.wall,{ s:o.wallS ?? .1 }); g.box(0,0,.02,wl.w,.18,.06,o.base || '#CFC5B5',{ s:.4 });
        if (o.decor) o.decor(g, wl.w, H);
      }); }, (t, cam) => (cam.eye[0]-wl.c[0])*wl.n[0] + (cam.eye[2]-wl.c[2])*wl.n[2] > -0.5 ? mdl({}) : null);
    });
  }
  const panelDecor = (col, trim, glow) => (g, w, H) => { const n = Math.floor(w/2.4); for (let i=0;i<n;i++){ const x = -w/2 + (i+.5)*w/n; g.box(x,.6,.03,1.3,H-1.4,.03,col,{ s:.6, e:glow||0 }); g.box(x-.7,0,.04,.12,H,.1,trim,{ s:.8 }); } };
  function stars(g, n=220){ for (let i=0;i<n;i++){ const a = rnd()*6.28, e = .15 + rnd()*1.2, r = 110; g.glow(Math.cos(a)*Math.cos(e)*r, Math.sin(e)*r*.6, Math.sin(a)*Math.cos(e)*r, .25+rnd()*.35, [.9,.9,1], .5, 1+rnd()*2); } }
  function ground(g, size, col, o={}){ g.plane(0,0,0,size,size,col,{ s:o.s ?? .05, f:o.f ?? 5 },o.seg||1,o.seg||1); }
  function water(g, size, col, y=-.25){ g.plane(0,y,0,size,size,col,{ s:1, f:1 },90,90); }
  function mountains(g, cols, R=70, n=14){ for (let i=0;i<n;i++){ const a = i/n*6.28 + rnd()*.3, r = R + rnd()*25; g.cyl(Math.cos(a)*r, -1, Math.sin(a)*r, 14+rnd()*12, 1, 9+rnd()*12, pick(cols), { s:0 }, 9); } }
  function skyline(g, cx, cz, side, n=26, minD=26){ const span = Math.max(38, minD*1.4); for (let i=0;i<n;i++){ const t = (i/n - .5)*2, d = minD + rnd()*20; const x = side==='x' ? cx + (rnd()<.5?-1:1)*d : cx + t*span, z = side==='x' ? cz + t*span : cz - d; const w = 3+rnd()*5, h = 6+rnd()*26, dp = 3+rnd()*5;
    g.box(x, -8, z, w, h+8, dp, pick(['#14161c','#1a1c22','#101217']), { s:.3 });
    for (let k=0;k<h*w*.35;k++) if (rnd()<.55) g.glow(x + (rnd()-.5)*w*.9, rnd()*h, z + dp/2 + .05, .32, rnd()<.8 ? [1,.78,.45] : [.7,.8,1], .15, .5); } }

  /* ---------- scenes ---------- */
  const NIGHT = { hemi:['#3a3530','#1a1612',.55], sun:{ dir:[.3,1,.2], col:'#9fb0d0', i:.08 } };
  const SCENES = {
    wedding: { label:'Wedding', sub:'Ballroom reception', sky:['#0c0b0a','#1a1612'], fog:'#141210', fogD:.012, exposure:1.15, ...NIGHT, hemi:['#4a4038','#2a221c',.75],
      cam:{ target:[0,.8,0], r:16, phi:.55, theta:.7, fov:.72, speed:.08 }, cats:['venue','catering','decoration','florist','lighting','dj','cake'],
      build(g, sc){
        for (let i=0;i<12;i++) for (let j=0;j<10;j++) g.plane(-9+i*1.5+.75, 0, -7+j*1.4+.7, 1.5, 1.4, (i+j)%2 ? '#D9CEBF' : '#E8E0D3', { s:.7, f:7 });
        wallSet(g, sc, 18, 14, 5.2, { wall:'#EFE8DC', base:'#D2C3A8', decor:(g,w,H) => { panelDecor('#E8DDCB','#C8A96B',.05)(g,w,H); for (let i=0;i<Math.floor(w/2.4);i++){ const x = -w/2 + (i+.5)*w/Math.floor(w/2.4); g.glow(x-.7, 2.6, .25, .5, [1,.75,.4], .1, 2); } } });
        danceFloor(g, 0, .3, 6, 4.5, '#121110', '#1c1a18', { border:'#C8A96B', tile:1.5 });
        [[-1.6,0],[1.6,0],[0,.3]].forEach(([x,z],i) => chandelier(g, sc, x, 3.9, z+.3, i===2?1.25:1, { ceil:5.2, i:2.4 }));
        [-5.4,5.4].forEach(x => { longTable(g, x, -.3, 6.6, Math.PI/2, { chair:{ leg:'#E6EBEF', spec:1 }, tall:true }); chandelier(g, sc, x, 3.6, -.3, .7, { ceil:5.2, i:1.2, range:5 }); });
        // kosha: stage, floral arch, sofa
        stage(g, 0, -5.6, 7, 2.2, .45, '#EFE8DC', { s:.5 }); g.at({ y:.45 }, g => { floralArch(g, 0, -6.1, 0, 4.2, 3.2, ['#FFFFFF','#F2DCD3','#EAD3C8','#F8F1E7','#DDE5D3']); sofa(g, 0, -5.9, 0, 2.2, '#F4EFE6', { pillow:'#E9DCCB' }); });
        g.glow(-2.6,1.6,-5.1,.9,[1,.75,.4],.2); g.glow(2.6,1.6,-5.1,.9,[1,.75,.4],.2);
        g.box(5.5,0,-5.3,1.2,.8,.8,'#F3EEE5',{ s:.1 }); cake(g, 5.5, .8, -5.3, 5);
        djBooth(g, sc, -6, 5.6, Math.PI, { glow:[.4,.3,.15] });
        person(g, sc, -.25, .2, { top:'#F7F3EC', dress:true, dance:true, ry:1.2, hair:'#3c2a1e' }); person(g, sc, .25, .3, { top:'#141414', legs:'#141414', dress:false, dance:true, ry:-2 });
        crowd(g, sc, 0, .4, 2.6, 1.8, 10, { dance:true });
        sc.addLight([0, 2, -5.2], '#FFE2B8', 1.5, 6); sc.addLight([5.5, 2, -5], '#FFE2B8', .8, 4);
      } },
    engagement: { label:'Engagement', sub:'Garden terrace', sky:['#0b0f19','#1b1c22'], fog:'#11141a', fogD:.018, exposure:1.25, hemi:['#3a4258','#1c2418',.6], sun:{ dir:[-.5,.8,.3], col:'#a9b8de', i:.18 },
      cam:{ target:[0,.6,0], r:15, phi:.5, theta:2.2, fov:.72, speed:.09 }, cats:['venue','florist','decoration','catering','lighting','photography'],
      build(g, sc){
        stars(g); g.sphere(-60,48,-70,4,'#F4EEDD',{ f:3 }); g.glow(-60,48,-70,30,[.25,.24,.2]);
        ground(g, 160, '#22331F'); g.plane(0,.005,0,9,13,'#B9AE9C',{ s:.2, f:11 });
        for (let i=-4;i<5;i++) g.plane(0,.01,i*1.4,9,.04,'#9C917F');
        [[-6,-6],[6,-6],[-6,6],[6,6],[-7,0],[7,0]].forEach(([x,z]) => tree(g, x, z, 'olive', 1.2));
        [-5.2,5.2].forEach(x => g.box(x,0,0,.7,1.1,13,'#2F4A2A',{ s:.05 }));
        // pergola
        const posts = [[-2.4,-4.5],[2.4,-4.5],[-2.4,0],[2.4,0],[-2.4,4.5],[2.4,4.5]];
        posts.forEach(([x,z]) => { g.box(x,0,z,.16,3,.16,'#7A5C42',{ s:.2 }); g.shadow(x,z,.2,.4); });
        [-2.4,2.4].forEach(x => g.box(x,3,0,.18,.18,9.4,'#7A5C42'));
        for (let z=-4.5;z<=4.5;z+=.75) g.box(0,3.18,z,5.4,.1,.08,'#7A5C42');
        for (let k=0;k<7;k++) stringLights(g, [-2.4, 3.05, -4.5 + k*1.5], [2.4, 3.05, -3.75 + k*1.5], .35, 9);
        sc.addLight([0,2.8,-2], '#FFC98A', 1.6, 6); sc.addLight([0,2.8,2.5], '#FFC98A', 1.6, 6);
        longTable(g, 0, 0, 7.5, Math.PI/2, { flowers:['#FFFFFF','#F4D7D0','#EBC2B8','#F9EEE6'], tall:true, chair:{ leg:'#E9E3DA', spec:.4 }, cloth:'#F7F2EA' });
        flowerWall(g, 0, -6.3, 0, 4.5, 2.8, ['#FFFFFF','#F4D7D0','#EBC2B8','#F9EEE6','#E3B7AC']);
        sofa(g, 0, -5.5, 0, 1.8, '#E9DCCB', { pillow:'#F4D7D0' });
        [[-1.7,-5.4],[1.7,-5.4],[-2.6,5.6],[2.6,5.6],[-3.4,-2],[3.4,2]].forEach(([x,z]) => lantern(g, x, z, 1.3));
        person(g, sc, -.5, -4.7, { top:'#F4D7D0', dress:true, ry:3.4 }); person(g, sc, .1, -4.6, { top:'#1d2433', dress:false, ry:3 });
        crowd(g, sc, 3.6, -3.5, .9, 1.4, 4); crowd(g, sc, -3.7, 3, .9, 1.4, 4);
      } },
    birthday: { label:'Birthday', sub:'Loft party', sky:['#120f0e','#1f1918'], fog:'#171211', fogD:.012, exposure:1.2, hemi:['#5a4644','#2a1e1c',.75], sun:{ dir:[.2,1,.1], col:'#ffffff', i:.05 },
      cam:{ target:[0,1,0], r:15.5, phi:.5, theta:.9, fov:.72, speed:.09 }, cats:['venue','decoration','cake','dj','entertainment','catering'],
      build(g, sc){
        g.plane(0,0,0,16,13,'#8E8A86',{ s:.55, f:10 });
        wallSet(g, sc, 16, 13, 4.8, { wall:'#8C5444', wallS:.05, base:'#3a2a24', decor:(g,w,H) => { for (let y=.3;y<H;y+=.32) g.box(0,y,.012,w,.02,.01,'#7b4839'); } });
        // dessert table + round backdrop + garland
        g.cyl(0,0,-6.2,2.1,2.1,.06,'#F2DCD3',{ s:.2 }, 40); g.at({ x:0, y:2.1, z:-6.35, rx:Math.PI/2 }, g => g.cyl(0,0,0,2.1,2.1,.08,'#F2DCD3',{ s:.15 },40));
        balloonGarland(g, arcPts(0, -5.9, 4.6, 2.4, 0, .2, 16), ['#F2DCD3','#E7C9BE','#FFFFFF','#C8A96B','#D8B4A6'], 6);
        g.box(0,0,-5.2,3.4,.9,.8,'#F6F1EA',{ s:.1 }); cake(g, 0, .9, -5.2, 4, '#FBF3EF', ['#E7C9BE','#C8A96B']);
        [-1.2,-.8,.8,1.2].forEach((x,i) => { g.cyl(x,.9,-5.2,.14,.14,.25+i%2*.1,'#C8A96B',{ s:.9 }); for (let k=0;k<4;k++) g.sphere(x+(k%2-.5)*.12, 1.2+i%2*.1, -5.2+(k>1?.06:-.06), .06, '#F2DCD3', { s:.3 }, 6); });
        // heart neon on side wall (part of left wall effect, placed static slightly off wall)
        for (let i=0;i<40;i++){ const t = i/40*6.283, hx = 16*Math.pow(Math.sin(t),3)/16*.8, hy = (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16*.8; g.glow(-7.85, 2.6+hy, -2+hx, .18, [1,.45,.55], .05, 3); }
        sc.addLight([-7.5,2.6,-2], '#FF8FA0', .9, 4);
        danceFloor(g, 2.8, 1, 5, 4, '#1e1b1a', '#2a2624', { s:.9 });
        djBooth(g, sc, 2.8, -1.8, 0, { led:'#E7A9B3', glow:[.5,.25,.3] });
        [[-4.5,0],[-4.5,3.2],[-1.8,4.5],[-5.5,-3.2]].forEach(([x,z]) => { g.tube([x,0,z],[x,1.05,z],.04,'#1b1a19',{ s:.8 }); g.cyl(x,1.05,z,.36,.36,.04,'#F6F1EA',{ s:.3 }); g.cyl(x+.08,1.09,z,.05,.03,.22,'#C8A96B',{ s:1 }); candle(g, x-.1, 1.09, z+.05); g.shadow(x,z,.5,.4);
          [[.75,0],[-.75,0]].forEach(([dx]) => { g.tube([x+dx,0,z],[x+dx,.75,z],.03,'#C8A96B',{ s:.9 }); g.cyl(x+dx,.75,z,.18,.18,.06,'#E7C9BE',{ s:.2 }); }); });
        for (let i=0;i<14;i++){ const x = -6 + rnd()*12, z = -5 + rnd()*10, y0 = 3.8 + rnd()*.6, ph = rnd()*6, col = pick(['#F2DCD3','#C8A96B','#FFFFFF','#E7C9BE']);
          sc.dynamic(g => balloon(g, 0, 0, 0, .25, col, { chrome: col==='#C8A96B', string:-1.2 }), t => mdl({ x: x + Math.sin(t*.4+ph)*.1, y: y0 + Math.sin(t*.9+ph)*.12, z })); }
        crowd(g, sc, 2.8, 1, 2, 1.6, 9, { dance:true }); crowd(g, sc, -4, 1.5, 1.2, 2.5, 5);
        sc.addLight([2.8,3,1], '#FFB8A8', 1.8, 6); sc.addLight([0,3,-4.5], '#FFE0C0', 1.8, 6); sc.addLight([-4,3,1], '#FFD0A0', 1.2, 6);
      } },
    graduation: { label:'Graduation', sub:'Black & gold hall', sky:['#0b0b0d','#151517'], fog:'#0f0f11', fogD:.013, exposure:1.2, hemi:['#3a3a44','#1a1a1e',.6], sun:{ dir:[.2,1,.2], col:'#ffffff', i:.04 },
      cam:{ target:[0,1.1,0], r:16, phi:.42, theta:1.25, fov:.72, speed:.08 }, cats:['venue','catering','decoration','photography','dj','lighting'],
      build(g, sc){
        g.plane(0,0,0,18,14,'#1C2030',{ s:.1, f:12 });
        wallSet(g, sc, 18, 14, 5.2, { wall:'#15161a', base:'#C8A96B', decor:panelDecor('#1d1f25','#C8A96B') });
        stage(g, 0, -5.4, 8, 2.6, .6, '#111', { led:'#C8A96B' });
        g.box(0,.6,-6.5,8,3.6,.12,'#0f0f10',{ s:.3 }); for (let i=0;i<120;i++) g.glow(-3.8+rnd()*7.6, 1+rnd()*3, -6.42, .1, [1,.8,.45], .7, 2+rnd()*3);
        // gold photo frame + podium
        const fr = [[-1.3,.6],[1.3,.6],[1.3,3.4],[-1.3,3.4]]; for (let i=0;i<4;i++){ const a = fr[i], b = fr[(i+1)%4]; g.tube([a[0]+2.4,a[1],-5.2],[b[0]+2.4,b[1],-5.2],.06,'#C8A96B',{ s:1 }); }
        g.box(-2.6,.6,-5,.8,1.15,.55,'#C8A96B',{ s:.9 }); g.tube([-2.6,1.75,-5.1],[-2.6,1.95,-5.35],.01,'#222');
        person(g, sc, -2.6, -5.5, { top:'#111', dress:false, ry:0 });
        balloonGarland(g, [[-4.3,.6,-6.2],[-4.3,2.5,-6.1],[-3.5,3.6,-6.1]], ['#111111','#C8A96B','#E8D5A8'], 8);
        balloonGarland(g, [[4.3,.6,-6.2],[4.3,2.5,-6.1],[3.5,3.6,-6.1]], ['#111111','#C8A96B','#E8D5A8'], 8);
        [[-5,-1.2],[0,-1.2],[5,-1.2],[-5,2.6],[0,2.6],[5,2.6]].forEach(([x,z]) => roundTable(g, x, z, { cloth:'#141414', chair:{ leg:'#C8A96B' }, flowers:['#FFFFFF','#E8D5A8','#C8A96B'], center:'tall', metal:'#C8A96B' }));
        for (let i=0;i<18;i++){ const x = -6 + rnd()*12, z = -3 + rnd()*7, ph = rnd(), sp = .18 + rnd()*.1;
          sc.dynamic(g => { g.box(0,0,0,.42,.03,.42,'#111',{ s:.5 }); g.cyl(0,-.12,0,.16,.17,.12,'#111',{ s:.4 },10); g.tube([0,.03,0],[.18,-.2,.18],.008,'#C8A96B',{ e:1 }); },
            t => { const k = ((t*sp + ph) % 1); const y = .5 + k*5.5; return mdl({ x: x + Math.sin(k*9)*.3, y, z, ry:t*1.5+ph*9, rx:Math.sin(t*2+ph*6)*.6 }); }); }
        for (let i=0;i<160;i++) g.glow(-7+rnd()*14, .5+rnd()*4.5, -5+rnd()*10, .07, [1,.82,.45], .9, 2+rnd()*4);
        crowd(g, sc, 0, 4.8, 5, .8, 8);
        [-3,0,3].forEach(x => sc.addLight([x,3.6,-3.6], '#FFE2B0', 1.7, 6.5)); sc.addLight([0,3.5,1.5], '#FFDCA8', 1.5, 7); sc.addLight([-5,3,1.5], '#FFDCA8', 1, 6); sc.addLight([5,3,1.5], '#FFDCA8', 1, 6);
      } },
    corporate: { label:'Corporate', sub:'Conference & launch', sky:['#0a0c10','#12151b'], fog:'#0d1015', fogD:.012, exposure:1.15, hemi:['#4a5260','#1c2028',.75], sun:{ dir:[.2,1,.2], col:'#dfe8ff', i:.05 },
      cam:{ target:[0,1.2,0], r:17, phi:.42, theta:1.2, fov:.72, speed:.075 }, cats:['venue','lighting','videography','catering','rentals','photography'],
      build(g, sc){
        g.plane(0,0,0,20,15,'#2B2E35',{ s:.08, f:12 }); g.plane(0,.004,1.5,1.4,11,'#3A3E47',{ s:.08 });
        wallSet(g, sc, 20, 15, 6, { wall:'#20232a', base:'#111', decor:(g,w,H) => { for (let i=-w/2+1;i<w/2;i+=2) g.box(i,0,.05,.05,H,.04,'#3d6fa0',{ e:.6 }); } });
        stage(g, 0, -5.9, 11, 3, .7, '#15171c', { led:'#9fc1e6' });
        g.box(0,1.2,-7.2,8,4.2,.15,'#08090c',{ s:.6 }); g.box(0,1.35,-7.1,7.6,3.9,.02,'#ffffff',{ e:.8, f:2 });
        [-6.1,6.1].forEach(x => { g.box(x,1.6,-6.8,2.2,2.8,.12,'#08090c'); g.box(x,1.7,-6.73,2,2.6,.02,'#ffffff',{ e:.6, f:2 }); });
        g.glow(0,3.2,-6.6,7,[.18,.2,.26]);
        g.at({ x:3.2, y:.7, z:-5.2 }, g => { g.loft([[-.35,-.25],[.35,-.25],[.35,.25],[-.35,.25]],0,[[-.42,-.3],[.42,-.3],[.42,.3],[-.42,.3]],1.15,'#1b1d22',{ s:.5 }); g.box(0,.2,-.31,.6,.4,.01,'#9fc1e6',{ e:1.5 }); });
        person(g, sc, 3.2, -5.6, { top:'#1d2433', dress:false, ry:0, legs:'#14161a' });
        // truss + moving beams
        g.box(0,5.2,-3.6,12,.25,.25,'#6c717a',{ s:.8 }); [-6,6].forEach(x => g.box(x,0,-3.6,.25,5.4,.25,'#6c717a',{ s:.8 }));
        [-4.5,-1.5,1.5,4.5].forEach((x,i) => { g.box(x,4.85,-3.6,.32,.35,.32,'#111',{ s:.6 }); g.glow(x,4.85,-3.6,.4,[1,.95,.85],.3,4);
          sc.dynamic(g => g.cyl(0,-6,0,1.2,.06,6,'#1d1a14',{ e:1, s:0 },16,false), t => mdl({ x, y:4.85, z:-3.6, rz:Math.sin(t*.7+i)*.35, rx:.35+Math.sin(t*.5+i*2)*.25 }), { additive:true }); });
        for (let r=0;r<6;r++) for (let c=0;c<12;c++){ if (c===5||c===6) continue; const x = -5.5 + c*1, z = -1.6 + r*1.2; chair(g, x, z, Math.PI, { leg:'#111', seat:'#1d1f24', solid:true, spec:.5 }); if (rnd()<.45) person(g, sc, x, z-.05, { ry:Math.PI }); }
        [[-8,5.5],[8,5.5],[-8,1.5],[8,1.5]].forEach(([x,z]) => { g.tube([x,0,z],[x,1.1,z],.04,'#ddd',{ s:.9 }); g.cyl(x,1.1,z,.4,.4,.04,'#F3F1EE',{ s:.4 }); g.shadow(x,z,.4,.4); crowd(g, sc, x, z, .9, .9, 2); });
        g.box(-6.5,0,6.4,3,1.05,.7,'#F3F1EE',{ s:.3 }); g.box(-6.5,.4,6.04,2.8,.3,.01,'#9fc1e6',{ e:1.2 });
        sc.addLight([0,3,-4], '#cfe0ff', 2.2, 9); sc.addLight([0,4,2], '#fff1dc', 1.6, 10); sc.addLight([-6,3,5], '#fff1dc', 1, 6);
      } },
    private: { label:'Rooftop', sub:'Private party in Beirut', sky:['#090b14','#2a2230'], fog:'#1a1720', fogD:.009, exposure:1.25, hemi:['#3a3a55','#1c1a1c',.55], sun:{ dir:[-.4,.6,-.6], col:'#b6a6d6', i:.12 },
      cam:{ target:[0,.6,0], r:16, phi:.45, theta:.6, fov:.74, speed:.1 }, cats:['venue','dj','catering','decoration','lighting','rentals'],
      build(g, sc){
        stars(g, 120); water(g, 260, '#0d1a26', -14);
        skyline(g, 0, 0, 'z', 22); skyline(g, 0, 0, 'x', 18);
        g.box(0,-14,0,16,14,13,'#1b1c20',{ s:.2 });
        g.box(0,0,0,16,.04,13,'#7A5C42',{ s:.3, f:6 });
        for (let i=-8;i<=8;i+=1.6){ g.tube([i,0,-6.5],[i,1.05,-6.5],.03,'#C8A96B',{ s:.9 }); g.tube([i,0,6.5],[i,1.05,6.5],.03,'#C8A96B',{ s:.9 }); }
        [-6.5,6.5].forEach(z => { g.box(0,1.03,z,16,.05,.06,'#C8A96B',{ s:.9 }); g.box(0,.04,z,16,.02,.04,'#FFD9A0',{ e:2 }); });
        // lounge around fire table
        g.box(-3,0,1.5,1.6,.42,.8,'#3a3532',{ s:.4 }); g.glow(-3,.55,1.5,1.4,[1,.5,.18],.45,10); for (let i=0;i<10;i++) g.glow(-3.6+i*.13,.5,1.5+(rnd()-.5)*.3,.25,[1,.65,.25],.6,14); sc.addLight([-3,.9,1.5], '#FF8C3A', 2, 5, .3);
        sofa(g, -3, -.2, 0, 3, '#E7E0D5', { base:'#FFD9A0' }); sofa(g, -3, 3.2, Math.PI, 3, '#E7E0D5', { base:'#FFD9A0' }); sofa(g, -5.1, 1.5, Math.PI/2, 2, '#E7E0D5', { base:'#FFD9A0' });
        bar(g, sc, 4.6, -4.4, 0, 4.2, { back:'#C8A96B' });
        djBooth(g, sc, 5.6, 2.4, -Math.PI/2, { glow:[.35,.25,.4] });
        [[-7.2,-5.6],[7.2,-5.6],[-7.2,5.6],[7.2,5.6],[0,-5.8],[1.2,5.8]].forEach(([x,z]) => planter(g, x, z, 1.1));
        for (let i=0;i<5;i++) stringLights(g, [-7.5, 3, -6 + i*3], [7.5, 3, -5 + i*2.6], .6, 14);
        [[-7.5,-6],[7.5,-5],[-7.5,6],[7.5,5.4]].forEach(([x,z]) => g.tube([x,0,z],[x,3.05,z],.04,'#222'));
        crowd(g, sc, 2.4, 1.6, 1.8, 2, 10, { dance:true }); crowd(g, sc, 4.4, -3, 1.5, .5, 3);
        sc.addLight([0,2.6,0], '#FFC98A', 1.5, 8); sc.addLight([4.4,2.4,2.4], '#C8A0FF', 1, 5);
      } },
    'baby-shower': { label:'Baby Shower', sub:'Garden afternoon', sky:['#8DB7DD','#EEF2F2'], fog:'#E3EAEC', fogD:.012, exposure:1, hemi:['#CFE0EE','#7E8F65',.9], sun:{ dir:[.5,.85,.35], col:'#FFF4E2', i:1.6 }, shadow:.5,
      cam:{ target:[0,.7,0], r:15, phi:.5, theta:1.0, fov:.72, speed:.09 }, cats:['venue','decoration','catering','cake','rentals','photography'],
      build(g, sc){
        ground(g, 200, '#86A564'); g.plane(0,.004,0,11,9,'#9BB878');
        [[-9,-7,'olive'],[9,-6,'oak'],[-10,4,'oak'],[10,6,'olive'],[0,-11,'oak'],[-5,-10,'olive'],[6,-10,'oak']].forEach(([x,z,k]) => tree(g, x, z, k, 1.6));
        g.box(0,0,-4.6,5,2.6,.2,'#FAF7F1',{ s:.1 }); g.box(0,2.6,-4.6,5.3,.12,.3,'#FAF7F1',{ s:.1 });
        balloonGarland(g, [[-2.8,.2,-4.3],[-2.6,2,-4.3],[-1.5,3.1,-4.3],[.5,3.2,-4.3],[2.3,2.6,-4.3],[2.8,1.2,-4.3]], ['#DCE6D2','#F3E2D8','#CFE0EC','#FFFFFF','#E8D9C3'], 9);
        g.box(0,0,-3.7,3,.85,.7,'#FFFFFF',{ s:.1 }); cake(g, -.6, .85, -3.7, 3, '#FFFFFF', ['#CFE0EC','#F3E2D8']);
        [.4,.8,1.2].forEach((x,i) => { g.cyl(x,.85,-3.7,.12,.12,.2+i*.08,'#E9E1D3',{ s:.4 }); for (let k=0;k<5;k++) g.sphere(x+(rnd()-.5)*.15, 1.1+i*.08, -3.7+(rnd()-.5)*.15, .06, pick(['#F3E2D8','#CFE0EC','#FFFFFF']), {}, 6); });
        // teddy bear
        g.at({ x:2.1, z:-3.6 }, g => { const c = '#C9A27E'; g.sphere(0,.35,0,.3,c,{},10); g.sphere(0,.8,0,.22,c,{},10); [-.16,.16].forEach(d => { g.sphere(d,1,0,.08,c,{},8); g.sphere(d*1.4,.2,-.15,.11,c,{},8); g.sphere(d*1.6,.5,-.05,.09,c,{},8); }); g.sphere(0,.76,-.19,.08,'#E3C8A9',{},8); g.shadow(0,0,.4,.4); });
        [[-2.4,0],[0,1.2],[2.4,0]].forEach(([x,z]) => { g.box(x,0,z,1.6,.06,1.6,pick(['#EFE6D6','#E6EDE2','#F3E9E2']),{ s:.05 }); g.box(x,.06,z,1.1,.32,.6,'#F8F4EC',{ s:.1 }); g.shadow(x,z,.9,.35,1,.6);
          [[-.75,0],[.75,0],[0,.6],[0,-.6]].forEach(([dx,dz]) => g.box(x+dx,.06,z+dz,.45,.14,.45,pick(['#DCE6D2','#F3E2D8','#CFE0EC']),{ s:.05 }));
          flowers(g, x, .4, z, .14, ['#FFFFFF','#F3E2D8','#DCE6D2'], 5); g.cyl(x+.3,.38,z,.04,.04,.12,'#CFE0EC',{ s:.9 }); });
        [[-4.4,-2.6],[4.4,-2.6]].forEach(([x,z]) => { g.cyl(x,0,z,.16,.2,.6,'#E9E1D3',{ s:.3 }); for (let k=0;k<9;k++){ const a = rnd()*6.28; g.tube([x,.55,z],[x+Math.cos(a)*.5,1.6+rnd()*.4,z+Math.sin(a)*.5],.02,'#C9B79C'); g.sphere(x+Math.cos(a)*.52,1.7+rnd()*.4,z+Math.sin(a)*.52,.12,'#E8DCC7',{},6,2); } });
        umbrella(g, 4.6, 2.6, '#FFFFFF', 2.2); umbrella(g, -4.6, 2.8, '#F3E2D8', 2.2);
        crowd(g, sc, 0, 2.4, 3.5, 1.4, 7); person(g, sc, 3.2, -2.6, { top:'#F3E2D8', dress:true });
      } },
    bachelor: { label:'Bachelor', sub:'Lounge & club night', sky:['#050505','#0b0909'], fog:'#0a0808', fogD:.03, exposure:1.4, hemi:['#2b2220','#0f0b0a',.45], sun:{ dir:[.2,1,.2], col:'#ffffff', i:0 },
      cam:{ target:[0,1,0], r:14.5, phi:.42, theta:.8, fov:.74, speed:.1 }, cats:['venue','dj','entertainment','lighting','catering','transportation'],
      build(g, sc){
        g.plane(0,0,0,16,13,'#0c0c0d',{ s:.95 });
        wallSet(g, sc, 16, 13, 4.6, { wall:'#141212', base:'#0a0a0a', decor:(g,w) => { g.box(0,.35,.04,w,.03,.02,'#FF5A3C',{ e:2.5 }); g.box(0,3.6,.04,w,.03,.02,'#FFB25A',{ e:2.5 }); } });
        stage(g, 0, -4.8, 5, 2.4, .8, '#111', { led:'#FFB25A' }); g.at({ y:.8 }, g => djBooth(g, sc, 0, -4.8, 0, { led:'#FF5A3C', glow:[.6,.2,.1] }));
        danceFloor(g, 0, -1, 6, 3.6, '#121212', '#1b1717', { s:.98, tile:1.2 });
        [-1,1].forEach(side => { for (let k=0;k<3;k++){ const z = -2.2 + k*2.6, x = side*6.4; g.at({ x, z, ry: side>0 ? -Math.PI/2 : Math.PI/2 }, g => { g.box(0,0,0,2.4,.45,.9,'#2a1d1a',{ s:.6 }); g.box(0,.45,.35,2.4,.6,.22,'#2a1d1a',{ s:.6 }); g.box(0,.03,-.46,2.4,.02,.01,'#FFB25A',{ e:2.5 }); });
          g.cyl(x - side*1.3, 0, z, .45, .45, .45, '#161414', { s:.9 }); g.cyl(x - side*1.3, .45, z, .14, .12, .22, '#C8A96B', { s:1 }); g.glow(x - side*1.3, .7, z, .5, [1,.75,.4], .3, 6); g.shadow(x - side*.6, z, 1.5, .45); } });
        g.at({ x:-2.6, z:4.2 }, g => { g.box(0,0,0,2.4,.78,1.3,'#3a2416',{ s:.6 }); g.box(0,.78,0,2.2,.04,1.1,'#1f5b3a',{ s:.05 }); [[.8,.2],[.4,-.2],[0,.1],[-.6,.3]].forEach(([dx,dz],i) => g.sphere(dx,.86,dz,.05,['#ffffff','#C8A96B','#A33A2B','#111'][i],{ s:1 },8)); g.box(0,1.9,0,1.6,.08,.3,'#111'); g.glow(0,1.85,0,1.2,[.35,.3,.2]); });
        sc.addLight([-2.6,1.8,4.2], '#FFE8C0', 1.4, 3.5);
        bar(g, sc, 3.2, 5.6, Math.PI, 4.4, { back:'#7A2A1A', led:'#FFB25A' });
        const laserCols = ['#B8301C','#C8781E','#A04A2A','#B8301C'];
        laserCols.forEach((c,i) => { for (let k=0;k<5;k++) sc.dynamic(g => g.box(0,0,6,.02,.02,12,c,{ e:1.3, s:0 }), t => mdl({ x:-1.5 + i, y:3.8, z:-4.8, ry:Math.sin(t*.8+i*1.7)*.9 + (k-2)*.12, rx:.12 + Math.sin(t*.6+k)*.08 }), { additive:true }); });
        [-2.5,2.5].forEach((x,i) => sc.dynamic(g => g.cyl(0,-5,0,1,.05,5,'#2a1208',{ e:1, s:0 },16,false), t => mdl({ x, y:4.4, z:-2, rz:Math.sin(t*1.1+i*2)*.45, rx:Math.cos(t*.9+i)*.3 }), { additive:true }));
        crowd(g, sc, 0, -1, 2.6, 1.6, 12, { dance:true, dress:false }); crowd(g, sc, 3.2, 4.4, 1.6, .4, 3);
        sc.addLight([0,3.5,-1], '#FF6A40', 2.2, 7); sc.addLight([3,3,4], '#FFC080', 1.4, 6); sc.addLight([-5,3,0], '#FF9A50', 1, 6);
      } },
    bachelorette: { label:'Bachelorette', sub:'Yacht at sunset', sky:['#3a2c4a','#F2A27A'], fog:'#D99A82', fogD:.006, exposure:1.05, hemi:['#E8B9A6','#3a3a52',.85], sun:{ dir:[-.8,.25,-.4], col:'#FFB27A', i:1.3 }, shadow:.4,
      cam:{ target:[0,1,0], r:17, phi:.36, theta:.4, fov:.72, speed:.1 }, cats:['venue','decoration','catering','dj','photography','transportation'],
      build(g, sc){
        water(g, 320, '#2E4C66', -.6); g.sphere(-110,12,-90,10,'#FFD9A0',{ f:3 }); g.glow(-110,12,-90,60,[.45,.25,.12]);
        mountains(g, ['#4a3b4c','#53424f','#3e3446'], 95, 10); for (let i=0;i<260;i++){ const a = 1.6 + rnd()*1.6, r = 70 + rnd()*12; g.glow(Math.cos(a)*r, rnd()*5, Math.sin(a)*r, .5, [1,.8,.5], .4, 1+rnd()); }
        // hull
        const hull = (s, y) => [[-7.5*s,0],[-6*s,-2*s],[3*s,-2.1*s],[6.5*s,-1.2*s],[8.2*s,0],[6.5*s,1.2*s],[3*s,2.1*s],[-6*s,2*s]];
        g.loft(hull(.78,0), -1.2, hull(1,0), .6, '#F7F6F3', { s:.8 }, false);
        g.loft(hull(1,0), .6, hull(1,0), .62, '#B08A5E', { s:.4 });
        for (let i=-7.3;i<8;i+=.3){ const hw = i < -6 ? 2*(i+7.5)/1.5 : i < 3 ? 2.05 : i < 6.5 ? 2.1-.9*(i-3)/3.5 : 1.2*(1-(i-6.5)/1.7); if (hw > .05) g.box(i,.62,0,.02,.005,hw*1.9,'#8a6a46'); }
        g.loft(hull(.78,0), -.62, hull(.79,0), -.55, '#1F3A57', { s:.6 }, false);
        // cabin + flybridge
        g.box(-1,.62,0,5,1.4,3,'#F7F6F3',{ s:.6 }); g.box(-1,1.2,1.51,4.6,.6,.02,'#1c2a38',{ s:1 }); g.box(-1,1.2,-1.51,4.6,.6,.02,'#1c2a38',{ s:1 });
        g.box(-1.6,2.02,0,3.6,.08,3,'#F7F6F3',{ s:.5 }); for (let x=-3.2;x<=0;x+=1.6) [-1.4,1.4].forEach(z => g.tube([x,2.1,z],[x,2.9,z],.03,'#dcdcdc',{ s:1 }));
        g.box(-1.6,2.9,0,3.6,.05,3,'#F7F6F3',{ s:.4 });
        // rails
        const rail = hull(.95,0); for (let i=0;i<rail.length;i++){ const a = rail[i], b = rail[(i+1)%rail.length]; g.tube([a[0],1.4,a[1]],[b[0],1.4,b[1]],.025,'#e6e6e6',{ s:1 }); g.tube([a[0],.62,a[1]],[a[0],1.4,a[1]],.02,'#e6e6e6',{ s:1 }); }
        // bow lounge + aft seating
        [[3.6,-.7],[3.6,.7],[5,0]].forEach(([x,z]) => { g.box(x,.62,z,1.3,.25,.62,'#F3E2D8',{ s:.1 }); g.box(x-.3,.87,z,.4,.18,.5,'#E7C9BE',{ s:.1 }); });
        g.box(-5.4,.62,0,1.3,.45,3,'#F3E2D8',{ s:.1 }); g.box(-4.2,.62,0,.8,.75,1.2,'#B08A5E',{ s:.5 });
        g.cyl(-4.2,1.37,.2,.12,.1,.25,'#C8A96B',{ s:1 }); g.cyl(-4.2,1.37,-.3,.04,.04,.25,'#E7F0D8',{ s:1 });
        for (let i=0;i<14;i++){ const p = rail[i%rail.length], q = rail[(i+1)%rail.length], t = rnd(); const x = p[0]+(q[0]-p[0])*t, z = p[1]+(q[1]-p[1])*t, ph = rnd()*6, col = pick(['#F3C6CF','#FFFFFF','#C8A96B','#F7DCE2']);
          sc.dynamic(g => balloon(g, 0, 0, 0, .22, col, { chrome: col==='#C8A96B', string:-.6 }), t => mdl({ x: x + Math.sin(t*.8+ph)*.06, y: 2.1 + Math.sin(t*1.3+ph)*.08, z: z + Math.cos(t*.7+ph)*.06 })); }
        stringLights(g, [-3.4,2.9,-1.5],[6.5,1.5,0],.4,14); stringLights(g, [-3.4,2.9,1.5],[6.5,1.5,0],.4,14);
        [[-5,.6],[-4.6,-.9],[3.4,1.2],[4.2,-1],[2.2,.2],[-3.4,1.1]].forEach(([x,z]) => person(g, sc, x, z, { dress:true, top:pick(['#F3C6CF','#FFFFFF','#E7C9BE','#C8A96B','#D9A6B0']), dance:true }));
        sc.addLight([-1,4,0], '#FFD3B0', 1, 9);
      } },
    beach: { label:'Beach', sub:'Sunset dinner by the sea', sky:['#4a3a5c','#F6B37E'], fog:'#E7AE8A', fogD:.007, exposure:1.05, hemi:['#F2C3A0','#6a5a4a',.85], sun:{ dir:[-.7,.3,-.65], col:'#FFB680', i:1.4 }, shadow:.4,
      cam:{ target:[0,.6,0], r:16, phi:.42, theta:.9, fov:.72, speed:.09 }, cats:['venue','catering','rentals','lighting','dj','decoration'],
      build(g, sc){
        water(g, 320, '#2F5970', -.45); g.sphere(-100,9,-95,10,'#FFDCA6',{ f:3 }); g.glow(-100,9,-95,70,[.5,.28,.12]);
        g.loft([[-9,-6],[9,-6],[11,8],[-11,8]], -1, [[-9,-5],[9,-5],[10,8],[-10,8]], .02, '#E8D3AE', { s:.1, f:8 });
        g.loft([[-30,8],[30,8],[30,30],[-30,30]], -1, [[-30,8],[30,8],[30,30],[-30,30]], .02, '#E8D3AE', { s:.1, f:8 });
        for (let i=-1.5;i<1.5;i+=.25) g.box(i+.125,.02,3,.23,.06,12,'#B08A5E',{ s:.3 });
        longTable(g, 0, -1.3, 7, 0, { chair:{ leg:'#B08A5E', seat:'#EADFCB', spec:.2 }, flowers:['#FFFFFF','#F3E2D8','#E8D5A8'], tall:true });
        [[-6.5,2],[6.5,2.4],[-6.6,-3.2]].forEach(([x,z]) => { umbrella(g, x, z, '#C9A774', 2.3); lounger(g, x+.6, z+1.6, .3); lounger(g, x-.7, z+1.6, -.2); });
        g.at({ x:5.6, z:-3.4 }, g => { g.box(0,0,0,2.6,1.05,.8,'#8B6F52',{ s:.3 }); g.box(0,1.05,0,2.8,.06,1,'#C9A97C',{ s:.5 }); [-1.2,1.2].forEach(x => [-.4,.4].forEach(z => g.tube([x,0,z+1],[x,2.6,z+1],.05,'#6b5a48'))); g.cyl(0,2.6,1,2.2,.05,.9,'#C9A774',{ s:.05 },6); g.box(0,1.2,1.2,2.2,.9,.05,'#C8A96B',{ e:.5 }); });
        g.glow(5.6,1.6,-2.8,2,[.4,.25,.12]);
        const posts = [[-4.6,-4],[4.6,-4],[-4.6,1.4],[4.6,1.4]]; posts.forEach(([x,z]) => torch(g, sc, x, z, 2.5));
        stringLights(g, [-4.6,2.5,-4],[4.6,2.5,-4],.5,16); stringLights(g, [-4.6,2.5,1.4],[4.6,2.5,1.4],.5,16); stringLights(g, [-4.6,2.5,-4],[4.6,2.5,1.4],.7,18);
        for (let i=0;i<10;i++) lantern(g, -4 + i*.9, 4.2 + (i%2)*.4, 1);
        crowd(g, sc, 0, 3, 3, 1, 6); person(g, sc, 5, -2.5, {}); person(g, sc, 6.1, -2.4, {});
      } },
    outdoor: { label:'Outdoor', sub:'Mountain garden', sky:['#20314d','#E6B48A'], fog:'#B9A99C', fogD:.012, exposure:1.05, hemi:['#BFC9D6','#4a5a3a',.8], sun:{ dir:[.7,.35,-.5], col:'#FFC796', i:1.1 }, shadow:.45,
      cam:{ target:[0,1,0], r:17, phi:.42, theta:1.6, fov:.72, speed:.09 }, cats:['venue','rentals','catering','lighting','decoration','transportation'],
      build(g, sc){
        ground(g, 220, '#5E7347'); mountains(g, ['#4f5d6b','#5a6876','#46525e'], 75, 16);
        for (let i=0;i<22;i++){ const a = rnd()*6.28, r = 12 + rnd()*14; tree(g, Math.cos(a)*r, Math.sin(a)*r, 'pine', 1 + rnd()*.6); }
        for (let i=-8;i<8;i+=.9) g.box(i,0,7.2,.88,.6+rnd()*.15,.5,pick(['#A79F92','#B5AD9F','#9B9386']),{ s:.1 });
        // sailcloth tent: peaks on center poles, edges on perimeter poles
        const peaks = [[-3.2,0,6],[3.2,0,6]], edge = [[-7,-4.5],[-3.2,-5],[0,-4.6],[3.2,-5],[7,-4.5],[7.5,0],[7,4.5],[3.2,5],[0,4.6],[-3.2,5],[-7,4.5],[-7.5,0]];
        peaks.forEach(([x,z,h]) => { g.tube([x,0,z],[x,h,z],.09,'#8a6b4a'); g.shadow(x,z,.2,.4); });
        edge.forEach(([x,z]) => { g.tube([x,0,z],[x,2.7,z],.06,'#8a6b4a'); g.shadow(x,z,.15,.4); });
        const pk = (x) => x < 0 ? peaks[0] : peaks[1];
        for (let i=0;i<edge.length;i++){ const a = edge[i], b = edge[(i+1)%edge.length], p = pk((a[0]+b[0])/2), q = [p[0], p[2], p[1]];
          g.quad([a[0],2.7,a[1]],[b[0],2.7,b[1]],q,q,'#F4EEE3',{ s:.15, e:.12 }); }
        g.quad([-3.2,6,0],[3.2,6,0],[0,2.7,4.6],[0,2.7,4.6],'#F4EEE3',{ s:.15, e:.12 }); g.quad([-3.2,6,0],[3.2,6,0],[0,2.7,-4.6],[0,2.7,-4.6],'#F4EEE3',{ s:.15, e:.12 });
        g.shadow(0,0,1,.25,7,4.8);
        [-2.2,2.2].forEach(z => longTable(g, 0, z, 9, 0, { wood:'#7A5C42', chair:{ leg:'#6b5139', seat:'#6b5139', spec:.2 }, flowers:['#FFFFFF','#F0E4CF','#DCC7A1'] }));
        edge.forEach(([x,z],i) => { const p = pk(x); stringLights(g, [x,2.6,z],[p[0],4.6,p[1]*0 + (z>0?.3:-.3)],.4,8,{ size:.2 }); });
        g.cyl(0,0,-7.8,.9,.8,.35,'#6E6A63',{ s:.2 }); g.glow(0,.6,-7.8,1.5,[1,.5,.18],.45,10); for (let i=0;i<8;i++) g.glow((rnd()-.5)*.8,.5,-7.8+(rnd()-.5)*.6,.3,[1,.65,.25],.6,14); sc.addLight([0,1,-7.8],'#FF8C3A',2,5,.3);
        [[-1.6,-7.8],[1.6,-7.8],[0,-9.4]].forEach(([x,z]) => g.box(x,0,z,.9,.4,.9,'#B5AD9F',{ s:.1 }));
        sc.addLight([-3.2,4,0], '#FFD3A0', 1.5, 8); sc.addLight([3.2,4,0], '#FFD3A0', 1.5, 8);
        crowd(g, sc, 0, 0, 5, .5, 6); crowd(g, sc, 0, -7.6, 1.8, 1.4, 4);
      } },
    other: { label:'Gala dinner', sub:'Velvet & candlelight', sky:['#0b0d0b','#141813'], fog:'#0f120f', fogD:.012, exposure:.95, hemi:['#3f3a35','#1b1a18',.6], sun:{ dir:[.2,1,.2], col:'#fff', i:.03 },
      cam:{ target:[0,.9,0], r:15.5, phi:.5, theta:.75, fov:.72, speed:.08 }, cats:['venue','catering','decoration','florist','entertainment','lighting'],
      build(g, sc){
        g.box(0,0,0,18,.02,14,'#45301F',{ s:.55, f:6 });
        wallSet(g, sc, 18, 14, 5.4, { wall:'#1F3A2F', base:'#C8A96B', decor:(g,w,H) => { panelDecor('#244538','#C8A96B',0)(g,w,H); for (let x=-w/2+.6;x<w/2;x+=.35) g.cyl(x,0,.15,.09,.09,H-.2,'#5A1E22',{ s:.25 },8,false); } });
        g.box(0,0,0,11,.02,4,'#3A1418',{ s:.2 });
        longTable(g, 0, 0, 10, 0, { cloth:'#4A161B', chair:{ leg:'#C8A96B', seat:'#1F3A2F', solid:true, back:'#1F3A2F' }, flowers:['#7A1E2A','#A33A3B','#E9D4C0','#5A1E22'], green:'#2F4A2A', candelabras:5, runner:true });
        [-3,0,3].forEach(x => chandelier(g, sc, x, 3.9, 0, 1, { ceil:5.4, i:1.1 }));
        // grand piano
        g.at({ x:-6, z:-4.4, ry:.6 }, g => { const shape = [[-.75,-1],[.75,-1],[.75,.2],[.5,.8],[0,1.1],[-.5,.9],[-.75,.4]]; g.loft(shape,.62,shape,.95,'#0a0a0a',{ s:1 }); g.box(0,.62,-1.05,1.5,.12,.3,'#efefef',{ s:.5 }); [[-.6,-.9],[.6,-.9],[0,.9]].forEach(([x,z]) => g.box(x,0,z,.09,.62,.09,'#0a0a0a',{ s:1 })); g.at({ y:.95, z:.1, rx:-.7 }, g => g.box(0,0,.5,1.4,.02,1,'#0a0a0a',{ s:1 })); });
        person(g, sc, -5.4, -5.3, { top:'#111', dress:false, ry:.6 });
        [[6,-4.8],[6.8,-3.8],[6.6,4.6]].forEach(([x,z]) => { g.cyl(x,0,z,.2,.25,1,'#C8A96B',{ s:.9 }); flowers(g, x, 1, z, .4, ['#7A1E2A','#A33A3B','#E9D4C0'], 10); greenery(g, x, 1, z, .8, 1); });
        crowd(g, sc, 5.4, 3.5, 1.4, 1.4, 5); crowd(g, sc, -5, 4, 1.4, 1.2, 4);
        sc.addLight([0,2.5,3.5], '#FFD9A6', 1, 7); sc.addLight([-6,2.5,-4], '#FFD9A6', 1, 5);
      } }
  };
  const FOR_EVENT = { wedding:'wedding', engagement:'engagement', birthday:'birthday', graduation:'graduation', corporate:'corporate', private:'private', 'baby-shower':'baby-shower', bachelor:'bachelor', bachelorette:'bachelorette', beach:'beach', outdoor:'outdoor', other:'other' };
  const C = { chair, candle, flowers, greenery, roundTable, longTable, person, crowd, chandelier, stringLights, balloon, balloonGarland, arcPts, djBooth, danceFloor, cake, sofa, bar, tree, planter, torch, lantern, umbrella, lounger, stage, floralArch, flowerWall, wallSet, panelDecor, stars, ground, water, mountains, skyline, mdl, rnd, pick, faceTo };
  return { SCENES, FOR_EVENT, C };
})();

/* ---- viewer3d.js ---- */
/* =========================================================
   3D VIEWERS — hero viewer, event thumbnails, full-screen modal
   ========================================================= */
const HERO_SCENES = ['wedding','engagement','birthday','corporate','private','beach'];
const LEGACY_SVG = { wedding:'wedding', engagement:'wedding', other:'wedding', birthday:'birthday', 'baby-shower':'birthday', graduation:'birthday', bachelor:'birthday', private:'birthday', corporate:'corporate', beach:'beach', bachelorette:'beach', outdoor:'beach' };
const has3D = (() => { let v; return () => v ?? (v = typeof GL3D !== 'undefined' && GL3D.supported()); })();
function SceneCats(key){ return S3.SCENES[key].cats.map(id => { const c = byId(CATEGORIES,id); return `<a href="#/search${qs({ category:id })}">${icon(c.icon,'sm')}${c.single}</a>`; }).join(''); }
function sceneStage(key, cls=''){
  const d = S3.SCENES[key];
  return `<div class="scene-stage ${cls}">
    <canvas class="scene-canvas" tabindex="0" aria-label="Interactive 3D example of a ${esc(d.label.toLowerCase())} setup. Drag, or use the arrow keys, to look around."></canvas>
    <div class="scene-fallback" hidden></div>
    <div class="scene-caption"><b data-cap-title>${esc(d.label)}</b><span data-cap-sub>${esc(d.sub)}</span></div>
    <span class="scene-hint" aria-hidden="true">Drag to look around</span>
  </div>`;
}
function startViewer(stage, key){
  const canvas = $('canvas', stage), fb = $('.scene-fallback', stage);
  let viewer = null;
  if (has3D()){ try { viewer = new GL3D.Viewer(canvas); GL3D._viewers.add(viewer); viewer.load(S3.SCENES[key]); viewer.loop(); } catch(e){ console.warn('3D unavailable', e); viewer = null; } }
  if (!viewer){ canvas.hidden = true; fb.hidden = false; fb.innerHTML = renderScene(LEGACY_SVG[key]); $('.scene-hint', stage).hidden = true; }
  return {
    viewer,
    set(k){ const d = S3.SCENES[k]; $('[data-cap-title]', stage).textContent = d.label; $('[data-cap-sub]', stage).textContent = d.sub; canvas.setAttribute('aria-label', `Interactive 3D example of a ${d.label.toLowerCase()} setup. Drag, or use the arrow keys, to look around.`);
      stage.classList.add('swap'); setTimeout(() => { if (viewer) viewer.load(d); else fb.innerHTML = renderScene(LEGACY_SVG[k]); stage.classList.remove('swap'); }, 160); },
    destroy(){ if (viewer){ viewer.destroy(); GL3D._viewers.delete(viewer); } }
  };
}
function SceneViewer(initial='wedding'){
  return `<figure class="scene-card" data-scene-viewer>
    ${sceneStage(initial)}
    <figcaption class="scene-bar">
      <div class="scene-tabs" role="tablist" aria-label="Example event setups">${HERO_SCENES.map(k => `<button type="button" role="tab" class="scene-tab" data-scene="${k}" aria-selected="${k===initial}">${S3.SCENES[k].label}</button>`).join('')}</div>
      <a class="scene-more" href="#/events">All 12 setups</a>
    </figcaption>
    <div class="scene-cats" id="scene-cats">${SceneCats(initial)}</div>
  </figure>`;
}
function mountSceneViewer(root){
  const v = $('[data-scene-viewer]', root); if (!v) return;
  const ctl = startViewer($('.scene-stage', v), $('[data-scene][aria-selected="true"]', v).dataset.scene);
  v.addEventListener('click', e => {
    const b = e.target.closest('[data-scene]'); if (!b || b.getAttribute('aria-selected') === 'true') return;
    $$('[data-scene]', v).forEach(x => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    ctl.set(b.dataset.scene); $('#scene-cats', v).innerHTML = SceneCats(b.dataset.scene);
  });
  v.addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight'].includes(e.key) || !e.target.matches('[data-scene]')) return;
    const tabs = $$('[data-scene]', v), i = tabs.indexOf(e.target), n = tabs[(i + (e.key==='ArrowRight'?1:-1) + tabs.length) % tabs.length];
    n.focus(); n.click();
  });
}
/* Event card thumbnails: one shared renderer, rendered lazily one at a time */
const snapCache = {};
let snapQueue = [], snapBusy = false;
function queueSnap(el){
  const key = el.dataset.snap;
  if (snapCache[key]) return showSnap(el, snapCache[key]);
  snapQueue.push(el); if (!snapBusy) drainSnaps();
}
function showSnap(el, url){ const img = $('img', el); img.decoding = 'async'; img.onload = () => el.classList.add('ready'); img.src = url; img.hidden = false; if (img.complete) el.classList.add('ready'); }
function drainSnaps(){
  const el = snapQueue.shift(); if (!el){ snapBusy = false; return; } snapBusy = true;
  setTimeout(() => {
    const key = el.dataset.snap;
    try { const w = Math.round(Math.min(1600, Math.max(880, el.clientWidth * Math.min(window.devicePixelRatio || 1, 2.5)))); snapCache[key] = snapCache[key] || GL3D.snapshot(S3.SCENES[key], w, Math.round(w * 560/880)); showSnap(el, snapCache[key]); }
    catch(e){ el.innerHTML = renderScene(LEGACY_SVG[key]); el.classList.add('ready'); }
    drainSnaps();
  }, 30);
}
function mountSnapshots(root){
  const els = $$('[data-snap]', root); if (!els.length) return;
  if (!has3D()){ els.forEach(el => { el.innerHTML = renderScene(LEGACY_SVG[el.dataset.snap]); el.classList.add('ready'); }); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ io.unobserve(en.target); queueSnap(en.target); } }), { rootMargin:'200px' });
  els.forEach(el => io.observe(el));
}
function open3DModal(key){
  const d = S3.SCENES[key];
  openModal({ title:`${d.label} setup`, wide:true, body:`<p class="muted small" style="margin:-.5rem 0 1rem">${esc(d.sub)}. An example illustration of how this kind of event could look. Drag to look around.</p>
    ${sceneStage(key, 'in-modal')}<div class="scene-cats light">${SceneCats(key)}</div>
    <div class="chip-row" style="margin-top:1.25rem"><a class="btn btn-primary" href="#/plan${qs({ event:key })}">Plan this event</a><a class="btn btn-ghost" href="#/search${qs({ event:key })}">Find vendors</a></div>`,
    onMount(m){ const ctl = startViewer($('.scene-stage', m), key); window._modalCleanup = () => ctl.destroy(); } });
}
document.addEventListener('click', e => { const b = e.target.closest('[data-view3d]'); if (b){ e.preventDefault(); open3DModal(b.dataset.view3d); } });

/* ---- pages1.js ---- */
/* =========================================================
   BUDGET EDITOR — shared by the homepage tool and the planner
   state: { budget:number|'', lines:[{cat, amount}] , showAlts }
   ========================================================= */
const lower1 = c => c.id==='dj' ? 'DJ' : c.single.toLowerCase();
const lowerN = c => c.id==='dj' ? 'DJs' : c.name.toLowerCase();
function createBudgetEditor(root, state, { idPrefix='be', dark=false, findLinks=null, budgetLabel='Your budget', onChange=()=>{} } = {}){
  const total = () => state.lines.reduce((s,l) => s + (+l.amount||0), 0);
  const lineRow = (l, i) => { const c = byId(CATEGORIES,l.cat);
    const find = findLinks ? `<small><a class="link" href="#/search${qs({ category:l.cat, ...findLinks })}">Find vendors<span class="sr-only"> for ${esc(c.single)}</span></a></small>` : '';
    return `<div class="line" role="listitem">
      <span class="l-ico">${icon(c.icon)}</span>
      <span class="l-name">${esc(c.single)}${find || `<small>${esc(c.blurb)}</small>`}</span>
      <label class="sr-only" for="${idPrefix}-amt-${i}">${esc(c.single)} amount in US dollars</label>
      <div class="money-input"><span>$</span><input id="${idPrefix}-amt-${i}" data-line="${i}" inputmode="numeric" placeholder="0" value="${l.amount===''||l.amount==null?'':esc(l.amount)}"></div>
      <button class="icon-btn" type="button" data-remove="${i}" aria-label="Remove ${esc(c.single)}">${icon('minus','sm')}</button>
    </div>`; };
  const addable = () => CATEGORIES.filter(c => !state.lines.some(l => l.cat === c.id));
  function render(){
    root.innerHTML = `
      <div class="field"><label for="${idPrefix}-budget">${budgetLabel}</label>
        <div class="money-input big"><span>$</span><input id="${idPrefix}-budget" inputmode="numeric" placeholder="Enter your total" value="${state.budget===''?'':esc(state.budget)}" aria-describedby="${idPrefix}-status"></div></div>
      <div class="lines" role="list" aria-label="Services">${state.lines.map(lineRow).join('')}</div>
      ${addable().length ? `<div style="margin-top:.9rem"><label class="sr-only" for="${idPrefix}-add">Add a service</label><select class="select" id="${idPrefix}-add" style="max-width:260px;min-height:42px;font-size:.9rem"><option value="">Add a service</option>${addable().map(c => `<option value="${c.id}">${esc(c.single)}</option>`).join('')}</select></div>` : ''}
      <div class="meter" id="${idPrefix}-meter"></div>
      <div id="${idPrefix}-status" aria-live="polite"></div>
      <div id="${idPrefix}-alts"></div>`;
    update();
  }
  function update(){
    const b = +state.budget || 0, t = total(), pct = b ? t / b : 0, remaining = b - t;
    $('#'+idPrefix+'-meter', root).innerHTML = `
      <div class="meter-top"><div><div class="${dark?'muted':'muted'} small">Estimated total</div><div class="meter-total">${money(t)}</div></div><div class="small muted">${b ? `${Math.round(pct*100)}% of ${money(b)}` : 'No budget set'}</div></div>
      <div class="meter-bar" role="progressbar" aria-label="Budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100,Math.round(pct*100))}"><div class="meter-fill ${t > b && b ? 'over' : pct > .9 ? 'near' : ''}"></div></div>
      <div class="meter-stats"><div>Budget<b>${b ? money(b) : '—'}</b></div><div>Allocated<b>${money(t)}</b></div><div>Remaining<b>${b ? (remaining < 0 ? '−' + money(-remaining) : money(remaining)) : '—'}</b></div></div>`;
    requestAnimationFrame(() => { const f = $('.meter-fill', root); if (f) f.style.width = Math.min(100, pct*100) + '%'; });
    const st = $('#'+idPrefix+'-status', root);
    if (!b) st.innerHTML = `<div class="status idle">${icon('wallet','sm')}<span>Enter a budget to see what’s left as you go.</span></div>`;
    else if (!t) st.innerHTML = `<div class="status idle">${icon('info','sm')}<span>Add an amount for each service, from a vendor quote or your own estimate.</span></div>`;
    else if (t > b) st.innerHTML = `<div class="status over">${icon('alert','sm')}<span>You’re <b>${money(t-b)}</b> over budget.</span><button class="btn btn-sm ${dark?'btn-light':'btn-primary'}" type="button" data-alts aria-expanded="${state.showAlts?'true':'false'}">Find alternatives</button></div>`;
    else st.innerHTML = `<div class="status ok">${icon('check','sm')}<span>Within budget, with <b>${money(b-t)}</b> remaining.</span></div>`;
    if (!(t > b && b)) state.showAlts = false;
    renderAlts(); onChange(state);
  }
  function renderAlts(){
    const box = $('#'+idPrefix+'-alts', root);
    if (!state.showAlts){ box.innerHTML = ''; return; }
    const b = +state.budget, t = total(), over = t - b;
    const fitted = fitToBudget(state.lines, b); const fittedTotal = fitted.reduce((s,l) => s + (+l.amount||0), 0);
    const largest = state.lines.filter(l => +l.amount > 0).sort((x,y) => y.amount - x.amount)[0];
    const lc = largest && byId(CATEGORIES, largest.cat);
    let html = `<div class="alts" role="region" aria-label="Ways to get back within budget">
      <div class="alt"><div><b>Fit every service to your budget</b><p>Scale each line down by the same share. New total: ${money(fittedTotal)}.</p></div><button class="btn btn-sm ${dark?'btn-light':'btn-primary'}" type="button" data-alt="fit">Apply</button></div>`;
    if (largest && +largest.amount > over) html += `<div class="alt"><div><b>Lower ${esc(lower1(lc))} by ${money(over)}</b><p>${esc(lc.single)} goes from ${money(largest.amount)} to ${money(largest.amount - over)}. Everything else stays the same.</p></div><button class="btn btn-sm ${dark?'btn-outline-light':'btn-ghost'}" type="button" data-alt="trim">Apply</button></div>`;
    if (lc) html += `<div class="alt"><div><b>Compare lower-priced ${esc(lowerN(lc))}</b><p>See ${esc(lowerN(lc))} listings sorted by price, lowest first. Vendors set their own prices.</p></div><a class="btn btn-sm ${dark?'btn-outline-light':'btn-ghost'}" href="#/search${qs({ category:lc.id, sort:'price', ...(findLinks||{}) })}">Browse</a></div>`;
    box.innerHTML = html + '</div>';
  }
  const clean = v => { const n = String(v).replace(/[^\d]/g,''); return n === '' ? '' : Math.min(+n, 99999999); };
  root.addEventListener('input', e => {
    if (e.target.id === idPrefix+'-budget'){ state.budget = clean(e.target.value); e.target.value = state.budget === '' ? '' : state.budget; update(); }
    else if (e.target.dataset.line != null){ const i = +e.target.dataset.line; state.lines[i].amount = clean(e.target.value); e.target.value = state.lines[i].amount; update(); }
  });
  root.addEventListener('change', e => { if (e.target.id === idPrefix+'-add' && e.target.value){ state.lines.push({ cat:e.target.value, amount:'' }); const n = state.lines.length-1; render(); $('#'+idPrefix+'-amt-'+n, root).focus(); } });
  root.addEventListener('click', e => {
    const rm = e.target.closest('[data-remove]'); if (rm){ state.lines.splice(+rm.dataset.remove,1); render(); return; }
    if (e.target.closest('[data-alts]')){ state.showAlts = !state.showAlts; renderAlts(); $('[data-alts]',root).setAttribute('aria-expanded', state.showAlts?'true':'false'); return; }
    const a = e.target.closest('[data-alt]'); if (!a) return;
    if (a.dataset.alt === 'fit') state.lines = fitToBudget(state.lines, +state.budget);
    if (a.dataset.alt === 'trim'){ const t = total(), over = t - state.budget; const largest = state.lines.filter(l => +l.amount > 0).sort((x,y) => y.amount - x.amount)[0]; if (largest) largest.amount = +largest.amount - over; }
    state.showAlts = false; render(); toast('Plan updated to fit your budget');
  });
  render();
  return { state, render, total };
}

/* =========================================================
   HOME
   ========================================================= */
function heroLights(){
  const W = 1440, strands = [ { y0:10, sag:120, n:26, x0:-40, x1:1480 }, { y0:0, sag:70, n:18, x0:620, x1:1500 } ];
  let paths = '', bulbs = '', k = 0;
  strands.forEach(s => {
    const pts = []; for (let i=0; i<=40; i++){ const t = i/40; pts.push([s.x0 + (s.x1-s.x0)*t, s.y0 + s.sag*(1-(2*t-1)**2)]); }
    paths += `<path class="strand" d="M${pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L')}"/>`;
    for (let i=1; i<s.n; i++){ const t = i/s.n; const x = s.x0 + (s.x1-s.x0)*t, y = s.y0 + s.sag*(1-(2*t-1)**2) + 5; const d = ((k*37)%45)/10;
      bulbs += `<g class="bulb" style="animation-delay:${d}s"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" opacity=".08"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" /></g>`; k++; }
  });
  return `<svg class="hero-lights" viewBox="0 0 ${W} 240" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${paths}${bulbs}</svg>`;
}
const FLOW = [
  ['sparkle','Event','What you’re celebrating'],
  ['sliders','Preferences','Guests, area, date, style'],
  ['wallet','Budget','What you can spend'],
  ['store','Vendors','Providers that fit'],
  ['layers','Plan','Everything in one view'],
  ['calendar','Booking','Requests and follow-up']
];
const Home = {
  title:'Ma3ak', dark:true,
  render(){
    const quick = ['venue','catering','dj','photography','decoration','entertainment'];
    return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-glow"></div>${heroLights()}
      <div class="wrap hero-grid">
        <div class="hero-in">
          <h1 id="hero-title" class="display"><span>Plan Your Event.</span><span>We’ll Help You Build It.</span></h1>
          <p class="lede">Tell us what you’re planning, your budget, and what you need. MA3AK connects you with event providers across Lebanon and helps you build your event in one place.</p>
          <div class="hero-ctas"><a class="btn btn-light btn-lg" href="#/customize">Create your event</a><a class="btn btn-outline-light btn-lg" href="#/events">Explore</a></div>
          <p class="hero-note">Built for events across Lebanon.</p>
        </div>
        ${SceneViewer('wedding')}
      </div>
    </section>
    <section class="hero-search" aria-labelledby="home-search-title"><div class="wrap"><div class="search-panel">
      <h2 id="home-search-title">What are you looking for?</h2>
      <form class="big-search" role="search" id="home-search">
        ${icon('search')}<label class="sr-only" for="home-q">Search vendors, venues, DJs, photographers</label>
        <input id="home-q" type="search" placeholder="Search vendors, venues, DJs, photographers…" autocomplete="off">
        <button class="btn btn-primary" type="submit" aria-label="Search">${icon('search','sm')}<span class="bs-text">Search</span></button>
      </form>
      <div class="quick-cats"><span>Popular:</span>${quick.map(id => { const c = byId(CATEGORIES,id); return `<a class="chip" href="#/search${qs({category:id})}">${icon(c.icon)}${c.name}</a>`; }).join('')}</div>
    </div></div></section>

    <section class="section tight feat-band" aria-labelledby="feat-title"><div class="wrap">
      <h2 id="feat-title" class="sr-only">What you can do with MA3AK</h2>
      <div class="feat-grid">
        <a class="feat" href="#/customize"><span class="feat-ico">${icon('layers')}</span><b>Design it in 3D</b><span>Pick a venue, or upload a photo of your own, then add the stage, decor, lighting and effects and watch it appear.</span></a>
        <button class="feat" type="button" data-open-ai><span class="feat-ico">${icon('sparkle')}</span><b>Ask the AI assistant</b><span>Get advice based on your actual event: guests, venue, style and budget.</span></button>
        <a class="feat" href="#/register"><span class="feat-ico">${icon('share')}</span><b>Save, share, collaborate</b><span>Your designs save automatically. Share a view-only link or invite someone to design with you.</span></a>
        <a class="feat" href="#/how-it-works"><span class="feat-ico">${icon('send')}</span><b>Send it to us</b><span>When it’s ready, send your design and our team arranges it with the right providers.</span></a>
      </div></div></section>

    <section class="section" aria-labelledby="promise-title"><div class="wrap statement">
      <h2 id="promise-title" class="display"><span>Your Event.</span><span>Your Budget.</span><span>Your Plan.</span></h2>
      <div>
        <p class="lede">Most event planning starts with a vendor and ends with a surprise at the bill. MA3AK starts with you: what you’re celebrating, who’s coming, and what you can spend.</p>
        <ol class="chain" style="margin-top:2rem" aria-label="How your event comes together">${FLOW.map(([i,t,s]) => `<li><div><b>${t}</b><span>${s}</span></div></li>`).join('')}</ol>
        <p class="small muted" style="margin-top:1.25rem">Vendors set their own prices, packages, and availability. MA3AK organizes them so you can compare.</p>
      </div>
    </div></section>

    <section class="section surface-band" aria-labelledby="how-title"><div class="wrap">
      ${SectionHeader({ title:'How MA3AK works', lede:'From the first idea to confirmed providers, in four steps.', aside:`<a class="btn btn-ghost" href="#/how-it-works">Learn more</a>` }).replace('<h2 class="h2">','<h2 class="h2" id="how-title">')}
      ${StepsGrid()}
    </div></section>

    <section class="section dark" aria-labelledby="budget-title"><div class="wrap budget-layout">
      <div>
        <h2 id="budget-title" class="h2">Build around your budget</h2>
        <p class="lede" style="margin-top:1rem">Set what you can spend, then add each service. MA3AK keeps the total and what’s left in view, and shows you ways back when you go over.</p>
        <p class="small muted" style="margin-top:1.5rem;max-width:46ch">Try it with your own numbers. Use quotes you already have or your best estimate; nothing here is a vendor price until a vendor publishes it.</p>
        <a class="btn btn-light" style="margin-top:2rem" href="#/plan">Open the budget planner</a>
      </div>
      <div class="panel" id="home-budget"></div>
    </div></section>

    <section class="section surface-band" aria-labelledby="cz-title-home"><div class="wrap cta-band">
      <div><h2 id="cz-title-home" class="h2">Want us to arrange everything?</h2><p class="lede" style="margin-top:1rem">Customize every detail, from the menu and flowers to the music, lighting, and transport. Send it to us and we’ll put it together with the right providers.</p></div>
      <a class="btn btn-primary" href="#/customize">${icon('wand','sm')}Customize my event</a>
    </div></section>

    <section class="section" aria-labelledby="events-title"><div class="wrap">
      ${SectionHeader({ title:'For every kind of celebration', lede:'Pick what you’re planning and MA3AK suggests the services it usually needs.', aside:`<a class="btn btn-ghost" href="#/events">All event types</a>` }).replace('<h2 class="h2">','<h2 class="h2" id="events-title">')}
      <div class="grid g-3">${EVENT_TYPES.slice(0,9).map(e => `<a class="event-tile" href="#/plan${qs({event:e.id})}"><span class="card-ico">${icon(e.icon)}</span><span>${e.name}</span>${icon('arrow','arr sm')}</a>`).join('')}</div>
    </div></section>

    <section class="section surface-band" aria-labelledby="vendors-title"><div class="wrap">
      ${SectionHeader({ title:'Discover event vendors', lede:'Venues, catering, music, photography, and every service in between, from providers across Lebanon.', aside:`<a class="btn btn-ghost" href="#/vendors">Explore vendors</a>` }).replace('<h2 class="h2">','<h2 class="h2" id="vendors-title">')}
      <div class="grid g-4">${CATEGORIES.slice(0,8).map(CategoryCard).join('')}</div>
    </div></section>

    <section class="section" aria-labelledby="join-title"><div class="wrap cta-band">
      <div><h2 id="join-title" class="h2">Run an event business?</h2><p class="lede" style="margin-top:1rem">Reach people in Lebanon who are planning an event right now, with their budget, date, and guest count already set.</p></div>
      <div class="chip-row"><a class="btn btn-primary" href="#/for-vendors">Join MA3AK as a Vendor</a>${igLink('icon-btn','Follow MA3AK on Instagram (opens in a new tab)')}</div>
    </div></section>`;
  },
  mount(root){
    mountSceneViewer(root);
    $('#home-search').addEventListener('submit', e => { e.preventDefault(); location.hash = '#/search' + qs({ q: $('#home-q').value.trim() }); });
    const state = { budget:'', lines:['venue','catering','decoration','dj','photography','cake'].map(cat => ({ cat, amount:'' })), showAlts:false };
    createBudgetEditor($('#home-budget'), state, { idPrefix:'hb', dark:true });
    enhanceHome(root); // editable content, featured providers, themes, FAQs (market.js)
  }
};
function StepsGrid(){
  const steps = [
    ['Tell Us Your Plan','Choose your event type, date, location, guests, style, and budget.','clipboard'],
    ['Discover Your Options','Explore vendors that match your event.','search'],
    ['Build Around Your Budget','Compare services and see how your choices affect the total.','wallet'],
    ['Book & Organize','Connect with providers and manage your event.','calendar']
  ];
  return `<ol class="steps" style="list-style:none;margin:0;padding:0">${steps.map(([t,d,i],n) => `<li class="step"><span class="step-num" aria-hidden="true">0${n+1}</span><h3 class="h3"><span class="sr-only">Step ${n+1}: </span>${t}</h3><p>${d}</p><span class="step-ico">${icon(i)}</span></li>`).join('')}</ol>`;
}
function CategoryCard(c){ return `<a class="cat-card" href="#/search${qs({category:c.id})}"><span class="card-ico">${icon(c.icon)}</span><span><b>${c.name}</b><small>${c.blurb}</small></span></a>`; }

/* =========================================================
   HOW IT WORKS
   ========================================================= */
const HowItWorks = {
  title:'How It Works | Ma3ak',
  render(){
    const faqs = [
      ['Does MA3AK set vendor prices?','No. Vendors publish their own prices, packages, availability, and terms. MA3AK organizes that information so you can compare options side by side and see how each one affects your budget.'],
      ['Is MA3AK only for weddings?','No. MA3AK is built for every kind of event: birthdays, graduations, engagements, corporate events, private parties, baby showers, bachelor and bachelorette parties, beach and outdoor events, and more.'],
      ['How does the budget planner work?','You set a total budget and pick the services you need. MA3AK suggests a starting split and keeps 10% aside for surprises. Change any line to match real quotes, and you’ll always see the total, what’s left, and ways back if you go over.'],
      ['Can I book vendors through MA3AK?','You can send booking requests to vendors through MA3AK, and they reply to you directly. Online booking, payments, and digital contracts are planned for later.'],
      ['Which areas does MA3AK cover?','MA3AK is focused on Lebanon: Beirut, Metn, Keserwan, Jbeil, Batroun, Aley, Chouf, Bekaa, North Lebanon, and South Lebanon.'],
      ['I’m a vendor. How do I join?','Apply on the For Vendors page. We’ll get in touch to set up your profile with your own services, packages, prices, and photos.']
    ];
    const details = [
      ['Tell Us Your Plan','Pick the kind of event, then add your budget, guest count, area, date, and style. Choose the services you need, or start from the ones MA3AK suggests for your event type.'],
      ['Discover Your Options','Search and filter providers by category, area, event type, price, guest capacity, and availability. Every price and package you see comes from the vendor.'],
      ['Build Around Your Budget','Add services to your plan and watch the total update. If you go over, MA3AK shows ways back: scale everything evenly, trim one line, or compare lower-priced options.'],
      ['Book & Organize','Send booking requests, then track vendors, tasks, and deadlines from your event dashboard until the day arrives.']
    ];
    return `
    <section class="page-hero"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">How It Works</span></nav>
      <h1 class="h1">How MA3AK works</h1>
      <p class="lede">MA3AK puts your budget at the center of planning. You say what you’re planning and what you can spend; we help you find providers and build a plan that fits.</p>
    </div></section>
    <section class="section tight surface-band"><div class="wrap">${StepsGrid()}</div></section>
    <section class="section"><div class="wrap split">
      <div><h2 class="h2">Step by step</h2><p class="lede" style="margin-top:1rem">What happens at each stage, and what stays in your hands.</p></div>
      <ol class="chain">${details.map(([t,d]) => `<li><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ol>
    </div></section>
    <section class="section dark"><div class="wrap">
      ${SectionHeader({ title:'The MA3AK experience', lede:'Event, preferences, budget, vendors, plan, booking. Each step builds on the last.' })}
      <ol class="grid g-3" style="list-style:none;margin:0;padding:0">${FLOW.map(([i,t,s],n) => `<li class="panel"><span class="step-num" style="font-family:var(--serif);font-size:1.8rem;color:var(--gold)">0${n+1}</span><h3 class="h3" style="margin-top:.75rem">${t}</h3><p class="muted small" style="margin-top:.3rem">${s}</p></li>`).join('')}</ol>
    </div></section>
    <section class="section"><div class="wrap split">
      <div><h2 class="h2">Questions</h2><p class="lede" style="margin-top:1rem">Anything else? Email <a class="link" href="mailto:${CONFIG.email}">${CONFIG.email}</a>.</p></div>
      <div class="faq">${faqs.map(([q,a]) => `<details><summary>${q}${icon('plus','sm')}</summary><p>${a}</p></details>`).join('')}</div>
    </div></section>
    ${CtaBand()}`;
  }
};
function CtaBand(){ return `<section class="section surface-band"><div class="wrap cta-band"><div><h2 class="h2">Ready when you are</h2><p class="lede" style="margin-top:1rem">Start with your event and your budget. You can change anything later.</p></div><div class="chip-row"><a class="btn btn-primary" href="#/plan">Start Planning</a><a class="btn btn-ghost" href="#/vendors">Explore Vendors</a></div></div></section>`; }

/* =========================================================
   EVENTS
   ========================================================= */
const Events = {
  title:'Events | Ma3ak',
  mount(root){ mountSnapshots(root); },
  render(){
    return `
    <section class="page-hero"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Events</span></nav>
      <h1 class="h1">Plan any event</h1>
      <p class="lede">Every event type starts with the services it usually needs. Keep them, remove them, or add your own. Each 3D scene is an example of how that kind of event could look. Open one to move around it.</p>
    </div></section>
    <section class="section tight" style="padding-top:0"><div class="wrap grid g-3">
      ${EVENT_TYPES.map(e => `<article class="card event-card has-scene">
        <button type="button" class="event-scene" data-snap="${S3.FOR_EVENT[e.id]}" data-view3d="${S3.FOR_EVENT[e.id]}" aria-label="View the ${esc(e.name.toLowerCase())} setup in 3D"><img alt="Example 3D illustration of a ${esc(e.name.toLowerCase())} setup: ${esc(S3.SCENES[S3.FOR_EVENT[e.id]].sub.toLowerCase())}" hidden width="880" height="560"><span class="snap-label">${icon('eye','sm')}View in 3D</span></button>
        <span class="card-ico">${icon(e.icon)}</span>
        <h2 class="h3">${e.name}</h2>
        <p>${e.blurb}</p>
        <ul class="pill-list" style="margin-top:.9rem" aria-label="Services often needed">${e.services.slice(0,5).map(s => `<li class="tag">${catSingle(s)}</li>`).join('')}${e.services.length>5?`<li class="tag">+${e.services.length-5} more</li>`:''}</ul>
        <div class="ec-foot"><a class="btn btn-primary btn-sm" href="#/customize" data-cz-type="${e.id}">Customize</a><a class="btn btn-ghost btn-sm" href="#/plan${qs({event:e.id})}">Plan budget</a><a class="btn btn-ghost btn-sm" href="#/search${qs({event:e.id})}">Find vendors</a></div>
      </article>`).join('')}
    </div></section>
    ${CtaBand()}`;
  }
};

/* =========================================================
   VENDORS (marketplace)
   ========================================================= */
const Vendors = {
  title:'Vendors | Ma3ak',
  render(p, q){
    const active = q.get('category') || '';
    return `
    <section class="page-hero"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Vendors</span></nav>
      <h1 class="h1">Discover Event Vendors</h1>
      <p class="lede">Browse event providers across Lebanon. Every listing shows the vendor’s own prices, packages, and availability.</p>
      <form class="big-search" role="search" id="vendors-search" style="margin-top:2rem;max-width:720px">${icon('search')}<label class="sr-only" for="vq">Search vendors</label><input id="vq" type="search" placeholder="Search vendors, venues, DJs, photographers…"><button class="btn btn-primary" type="submit" aria-label="Search">${icon('search','sm')}<span class="bs-text">Search</span></button></form>
    </div></section>
    <section class="section tight" style="padding-top:0"><div class="wrap">
      <nav class="chip-scroll" aria-label="Vendor categories" id="cat-nav">
        <button class="chip" type="button" data-cat="" aria-pressed="${!active}">All</button>
        ${CATEGORIES.map(c => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${active===c.id}">${icon(c.icon)}${c.name}</button>`).join('')}
      </nav>
      <div id="vendor-list" style="margin-top:2rem" aria-live="polite"></div>
    </div></section>
    <section class="section surface-band"><div class="wrap">
      ${SectionHeader({ title:'Browse by category', lede:'Sixteen categories, from the venue to the valet.' })}
      <div class="grid g-4">${CATEGORIES.map(CategoryCard).join('')}</div>
    </div></section>`;
  },
  async mount(root, p, q){
    let cat = q.get('category') || '';
    $('#vendors-search').addEventListener('submit', e => { e.preventDefault(); location.hash = '#/search' + qs({ q:$('#vq').value.trim(), category:cat }); });
    const list = $('#vendor-list');
    async function load(){
      list.innerHTML = `<div class="grid g-4">${Skeletons(4)}</div>`;
      try {
        const all = await api.listVendors(); const vs = cat ? all.filter(v => v.category === cat) : all;
        const c = byId(CATEGORIES, cat);
        list.innerHTML = vs.length ? `<div class="grid g-4">${vs.map(VendorCard).join('')}</div>` :
          EmptyState({ iconName:'store', title: c ? `${c.name} listings open soon` : 'Vendor listings open soon',
            text:`MA3AK is onboarding event providers across Lebanon. Listings will appear here with each vendor’s own prices, packages, and availability.`,
            actions:`<a class="btn btn-primary" href="#/for-vendors">Join as a vendor</a><a class="btn btn-ghost" href="#/plan">Start planning your budget</a>` });
      } catch(err){ list.innerHTML = EmptyState({ iconName:'alert', title:'Vendors didn’t load', text:'Check your connection and try again.', actions:`<button class="btn btn-primary" type="button" id="retry">Try again</button>` }); $('#retry').onclick = load; }
    }
    $('#cat-nav').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; $$('[data-cat]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true':'false')); history.replaceState(null,'','#/vendors'+qs({category:cat})); load(); });
    load();
  }
};

/* ---- pages2.js ---- */
/* =========================================================
   VENDOR PROFILE — template for real vendor data
   ========================================================= */
function Calendar(unavailable=[]){
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1), days = new Date(y, m+1, 0).getDate(), lead = (first.getDay()+6)%7;
  const iso = d => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  return `<p class="small muted" style="margin-bottom:.75rem">${first.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</p>
  <div class="cal" role="grid" aria-label="Availability">${['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => `<div class="dow" role="columnheader">${d}</div>`).join('')}
  ${Array.from({length:lead},() => '<div class="d blank"></div>').join('')}
  ${Array.from({length:days},(_,i) => { const off = unavailable.includes(iso(i+1)); return `<div class="d${off?' off':''}" role="gridcell" aria-label="${fmtDate(iso(i+1))}${off?', unavailable':''}">${i+1}</div>`; }).join('')}</div>`;
}
function VendorProfileView(v, { preview=false } = {}){
  const c = byId(CATEGORIES, v.category) || CATEGORIES[CATEGORIES.length-1];
  const photos = v.photos || [];
  const slot = i => photos[i] ? `<img src="${esc(photos[i].src)}" alt="${esc(photos[i].alt||v.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : `<div class="ph">${icon('image')}</div>`;
  const locs = (v.locations||[]).map(locName).join(', ');
  const dis = preview ? ' disabled aria-disabled="true"' : '';
  return `
  <section class="page-hero" style="padding-bottom:2rem"><div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/vendors">Vendors</a><span aria-hidden="true">/</span><span aria-current="page">${esc(v.name)}</span></nav>
    ${preview ? `<div class="notice" style="margin-bottom:1.5rem">${icon('eye')}<span>This is a private preview of your profile, built from your application. It isn’t public. Photos, packages, prices, and availability are added when your profile is set up. <a class="link" href="#/for-vendors#apply">Back to your application</a></span></div>` : ''}
    <div class="gallery" aria-label="Photo gallery">${[0,1,2,3,4].map(i => `<div>${slot(i)}</div>`).join('')}</div>
    <div class="profile">
      <div>
        <header>
          <span class="tag gold">${esc(c.single)}</span> ${preview ? '' : vBadges(v)}
          <h1 class="h1" style="margin-top:.75rem">${esc(v.name)}</h1>
          ${v.isDemo ? `<p class="notice" style="margin-top:1rem">${icon('info')}<span>This is a <b>demo listing</b> so you can try the planner. It isn’t a real business and its prices are illustrative. Quote requests go to the MA3AK team.</span></p>` : ''}
          <div class="vc-meta" style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem;color:var(--muted)">
            ${locs?`<span style="display:inline-flex;gap:.4rem;align-items:center">${icon('pin','sm')}${esc(locs)}</span>`:''}
            ${v.rating!=null?`<span style="display:inline-flex;gap:.4rem;align-items:center">${icon('star','sm')}${v.rating.toFixed(1)} from ${v.reviewCount} reviews</span>`:''}
          </div>
        </header>
        <section style="margin-top:2.5rem;padding-top:0;border:0"><h2>About</h2><p class="muted" style="max-width:65ch">${esc(v.about || v.description || (preview ? 'Your description goes here. Tell planners what makes your service right for their event.' : 'This vendor hasn’t added a description yet.'))}</p></section>
        <section><h2>Services</h2>${(v.services||[]).length ? `<ul class="pill-list">${v.services.map(s => `<li class="tag">${esc(s)}</li>`).join('')}</ul>` : `<p class="muted">Services will be listed here by the vendor.</p>`}
          ${(v.eventTypes||[]).length ? `<p class="small muted" style="margin-top:1rem">Works with: ${v.eventTypes.map(evName).join(', ')}</p>` : ''}</section>
        <section><h2>Packages and prices</h2>${(v.packages||[]).length ? `<div class="grid g-2">${v.packages.map(pk => `<div class="card pkg-card"><h3 class="h3">${esc(pk.name)}</h3><p class="kpi" style="margin-top:.6rem;font-size:1.5rem">${esc(priceTxt(pk.price, pk.priceMax, pk.unit))}</p>${pk.description ? `<p class="small muted">${esc(pk.description)}</p>` : ''}${(pk.includes||[]).length?`<ul class="small muted" style="margin:.8rem 0 0;padding-left:1.1rem">${pk.includes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`:''}
            ${preview ? '' : `<div class="chip-row" style="margin-top:1rem"><button class="btn btn-primary btn-sm" type="button" data-pkg-add="${esc(pk.id)}">${icon('plus','sm')}Add to plan</button><button class="btn btn-ghost btn-sm" type="button" data-pkg-quote="${esc(pk.id)}">${pk.price == null ? 'Request a quote' : 'Ask for a quote'}</button></div>`}</div>`).join('')}</div><p class="tiny muted" style="margin-top:.8rem">Prices are ${v.isDemo ? 'illustrative' : 'estimates published by the provider'}. The final price is confirmed in a quote.</p>` : `<p class="muted">This provider hasn’t listed packages yet. Ask them for a quote.</p>`}</section>
        <section><h2>Availability</h2><p class="muted">${v.availabilityNote ? esc(v.availabilityNote) + ' ' : ''}Availability isn’t shown as a calendar. Send a quote request with your date and the provider will confirm if it’s free.</p></section>
        <section><h2>Photos</h2>${photos.length ? `<div class="grid g-3">${photos.map(ph => `<img src="${esc(ph.src)}" alt="${esc(ph.alt||'')}" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--r-md)">`).join('')}</div>` : `<p class="muted">Photos uploaded by the vendor will appear here.</p>`}</section>
        <section><h2>Reviews</h2>${EmptyState({ iconName:'star', title:'No reviews yet', text:'Reviews on MA3AK come only from customers who booked this vendor, so every rating reflects a real event.' })}</section>
        <section><h2>Contact</h2>
          <ul class="contact-list" style="margin-top:0">
            <li><span class="card-ico">${icon('send')}</span><div><small>Through MA3AK</small><span>Send a quote request. The reply appears in your dashboard.</span></div></li>
            ${v.instagram?`<li><span class="card-ico">${icon('instagram')}</span><div><small>Instagram</small><span>${esc(v.instagram)}</span></div></li>`:''}
            ${v.website?`<li><span class="card-ico">${icon('globe')}</span><div><small>Website</small><span>${esc(v.website)}</span></div></li>`:''}
          </ul></section>
      </div>
      <aside class="book-card panel" aria-label="Booking">
        <p class="small muted">${v.startingPrice!=null ? 'Starting from' : 'Pricing'}</p>
        <p class="kpi" style="margin-top:.3rem">${v.startingPrice!=null ? money(v.startingPrice) + `<span class="small muted">${({ per_guest:' / guest', per_hour:' / hour', per_item:' each' })[v.startingUnit] || ''}</span>` : 'On request'}</p>
        <div style="display:grid;gap:.6rem;margin-top:1.5rem">
          <button class="btn btn-primary btn-block" type="button" id="request-booking"${dis}>${icon('send','sm')}Request a quote</button>
          <button class="btn btn-ghost btn-block" type="button" ${preview?dis:`data-add-vendor="${esc(v.id)}"`}>${icon('plus','sm')}Add to my plan</button>
          ${preview ? '' : `<button class="btn btn-ghost btn-block" type="button" id="fav-vendor" aria-pressed="false">${icon('heart','sm')}Save</button>`}
        </div>
        <p class="tiny muted" style="margin-top:1rem">${preview ? 'Buttons are active once your profile is live.' : 'Requests don’t commit you to anything. The provider confirms the price and whether your date is free.'}</p>
      </aside>
    </div>
  </div></section>`;
}
// Quote requests: openQuoteModal in market.js (saved on the server; the provider replies in their partner page).
const VendorProfile = {
  title:'Vendor | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap"><div class="grid g-2">${Skeletons(2)}</div></div></section>`; },
  async mount(root, [id]){
    let v = null;
    try { v = await api.getVendor(id); } catch(e) {}
    if (!v) { try { const r = await fetch(`/api/vendors/${encodeURIComponent(id)}`); const j = await r.json(); if (j.ok) v = j.vendor; } catch(e) {} }
    if (!v){ root.innerHTML = `<section class="section"><div class="wrap">${EmptyState({ iconName:'store', level:'h1', title:'This vendor isn’t listed', text:'The profile may have moved or isn’t live yet. Browse other providers or search for what you need.', actions:`<a class="btn btn-primary" href="#/vendors">Explore vendors</a><button class="btn btn-ghost" type="button" data-open-search>Search</button>` })}</div></section>`; return; }
    document.title = `${v.name} | Ma3ak`;
    root.innerHTML = VendorProfileView(v);
    $('#request-booking').addEventListener('click', () => openQuoteModal(v));
    const rb = $('#request-booking'); if (rb && (v.whatsapp || v.phone)) rb.parentElement.insertAdjacentHTML('afterend', `<div class="chip-row" style="margin-top:.6rem">${v.whatsapp ? `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer" href="https://wa.me/${String(v.whatsapp).replace(/\D/g, '')}">${icon('message','sm')}WhatsApp</a>` : ''}${v.phone ? `<a class="btn btn-ghost btn-sm" href="tel:${String(v.phone).replace(/[^\d+]/g, '')}">${icon('phone','sm')}Call</a>` : ''}</div>`);
    root.addEventListener('click', e => { const a = e.target.closest('[data-pkg-add]'), q = e.target.closest('[data-pkg-quote]');
      if (a) addToPlanFlow(v, v.packages.find(p => p.id === a.dataset.pkgAdd)); if (q) openQuoteModal(v, v.packages.find(p => p.id === q.dataset.pkgQuote)); });
    const fav = $('#fav-vendor'); fav.addEventListener('click', () => toggleVendorFav(v, fav));
    AUTH.ready.then(async u => { if (!u) return; try { const f = (await apiU('GET', '/api/favorites')).items; if (f.includes('v:' + v.id)){ fav.setAttribute('aria-pressed', 'true'); fav.innerHTML = `${icon('heart','sm')}Saved`; } } catch(e){} });
  }
};
const VendorPreview = {
  title:'Profile preview | Ma3ak',
  render(){
    const d = store.get('vendorDraft');
    if (!d || !d.name) return `<section class="section"><div class="wrap">${EmptyState({ iconName:'eye', level:'h1', title:'Nothing to preview yet', text:'Fill in your business details on the For Vendors page, then choose Preview my profile.', actions:`<a class="btn btn-primary" href="#/for-vendors#apply">Go to the vendor form</a>` })}</div></section>`;
    return VendorProfileView({ id:'preview', name:d.name, category:d.category, locations:d.location?[d.location]:[], about:d.message, instagram:d.instagram, website:d.website, services:[], packages:[], photos:[], rating:null, startingPrice:null }, { preview:true });
  }
};

/* =========================================================
   ABOUT
   ========================================================= */
const About = {
  title:'About | Ma3ak',
  render(){
    return `
    <section class="page-hero"><div class="wrap split">
      <div>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">About</span></nav>
        <h1 class="h1">Planning an event should feel like someone’s with you</h1>
      </div>
      <div class="stack" style="--s:1.25rem;padding-top:2.6rem">
        <p class="lede">MA3AK is a Lebanese technology startup created to simplify event planning by connecting customers and event-service providers through one digital platform.</p>
        <p class="muted">MA3AK means “with you” in Arabic. It’s the idea behind everything we build: you shouldn’t have to plan alone, chase prices across a dozen conversations, or find out you’re over budget after the deposits are paid.</p>
      </div>
    </div></section>
    <section class="section surface-band"><div class="wrap grid g-2">
      <article class="card" style="padding:clamp(28px,4vw,48px)"><span class="card-ico">${icon('users')}</span><h2 class="h2">For customers</h2><p class="lede" style="margin-top:.75rem">Discover, compare, plan, and organize.</p>
        <p style="margin-top:1rem">Find providers that fit your event and your budget, compare what they offer, build your plan, and keep every vendor, task, and deadline in one place.</p>
        <a class="btn btn-primary" style="margin-top:1.75rem" href="#/plan">Start Planning</a></article>
      <article class="card" style="padding:clamp(28px,4vw,48px)"><span class="card-ico">${icon('store')}</span><h2 class="h2">For vendors</h2><p class="lede" style="margin-top:.75rem">Showcase, connect, and grow.</p>
        <p style="margin-top:1rem">Present your services and packages in your own words and prices, and hear from people who are planning an event and already know their budget.</p>
        <a class="btn btn-ghost" style="margin-top:1.75rem" href="#/for-vendors">Join as a vendor</a></article>
    </div></section>
    <section class="section"><div class="wrap split">
      <div><h2 class="h2">MA3AK is initially focused on Lebanon.</h2></div>
      <div class="stack" style="--s:1.25rem"><p class="lede">We’re starting where we live and plan events ourselves. MA3AK covers providers and events across the country.</p>
        <ul class="pill-list">${LOCATIONS.map(l => `<li class="tag">${l.name}</li>`).join('')}</ul></div>
    </div></section>
    <section class="section dark"><div class="wrap">
      ${SectionHeader({ title:'What we believe', lede:'Three commitments that shape the product.' })}
      <div class="grid g-3">
        <div class="panel"><h3 class="h3">Budget first</h3><p class="muted" style="margin-top:.5rem">Your budget isn’t an afterthought. It’s where every plan starts and what every choice is measured against.</p></div>
        <div class="panel"><h3 class="h3">Vendors speak for themselves</h3><p class="muted" style="margin-top:.5rem">Prices, packages, availability, and terms come from providers. We organize them; we don’t invent them.</p></div>
        <div class="panel"><h3 class="h3">Honest reviews only</h3><p class="muted" style="margin-top:.5rem">Ratings will come from customers who actually booked, so they reflect real events.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="wrap">
      ${SectionHeader({ title:'What we’re building next', lede:'These features are planned and not live yet.' })}
      <div class="roadmap">
        <div><span class="tag">Planned</span><h3 class="h3" style="margin-top:.8rem">For people planning</h3><ul><li>User accounts</li><li>Guest invitations and RSVP</li><li>Seating plans</li><li>AI event assistant</li><li>AI theme ideas</li><li>Personalized recommendations</li></ul></div>
        <div><span class="tag">Planned</span><h3 class="h3" style="margin-top:.8rem">For vendors</h3><ul><li>Vendor accounts</li><li>Live availability</li><li>Vendor analytics</li><li>Vendor subscriptions</li></ul></div>
        <div><span class="tag">Planned</span><h3 class="h3" style="margin-top:.8rem">Booking</h3><ul><li>Online booking</li><li>Payments</li><li>Digital contracts</li><li>Notifications</li></ul></div>
      </div>
    </div></section>
    ${CtaBand()}`;
  }
};

/* =========================================================
   FOR VENDORS
   ========================================================= */
const ForVendors = {
  title:'For Vendors | Ma3ak',
  render(){
    const d = store.get('vendorDraft') || {};
    const benefits = [
      ['search','Get discovered','Appear when people search for your category, area, and event type.'],
      ['image','Showcase your services','Photos, descriptions, and the events you do best, in one profile.'],
      ['layers','Display packages','Publish your own packages and prices. You stay in control of both.'],
      ['inbox','Receive booking requests','Requests arrive with the date, guest count, and budget already set.'],
      ['trend','Increase visibility','Reach planners across Lebanon beyond your existing followers.'],
      ['target','Reach customers by need','Get matched to events that fit what you offer and where you work.']
    ];
    return `
    <section class="section dark" style="margin-top:0"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb" style="color:var(--on-char-muted)"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">For Vendors</span></nav>
      <div class="split" style="align-items:end">
        <h1 class="h1">Grow Your Business With MA3AK</h1>
        <div><p class="lede">MA3AK helps event-service providers reach people who are actively planning events, with their date, guest count, and budget already defined.</p>
          <div class="hero-ctas"><a class="btn btn-light" href="#/partner/join">Create a partner account</a><a class="btn btn-outline-light" href="#/partner">Partner sign in</a></div></div>
      </div>
    </div></section>
    <section class="section"><div class="wrap">
      ${SectionHeader({ title:'Why join', lede:'Built for venues, caterers, photographers, DJs, decorators, and every service an event needs.' })}
      <div class="grid g-3">${benefits.map(([i,t,d]) => `<div class="card"><span class="card-ico">${icon(i)}</span><h3 class="h3">${t}</h3><p>${d}</p></div>`).join('')}</div>
    </div></section>
    <section class="section surface-band"><div class="wrap split">
      <div><h2 class="h2">How joining works</h2><p class="lede" style="margin-top:1rem">Three steps from application to your first request.</p></div>
      <ol class="chain">
        <li><div><b>Create your partner account</b><span>Your listing starts as a private draft.</span></div></li>
        <li><div><b>Add packages, prices and photos</b><span>Set fixed prices, per-guest prices, ranges, or “request a quote”.</span></div></li>
        <li><div><b>MA3AK reviews and publishes</b><span>Nothing goes live without our approval. Then customers can add you to their plans and send quote requests.</span></div></li>
      </ol>
    </div></section>
    <section class="section" id="apply"><div class="wrap split">
      <div class="stack" style="--s:1.25rem">
        <h2 class="h2">Prefer that we set it up for you?</h2>
        <p class="lede">Send your details and the MA3AK team will contact you. Or <a class="link" href="#/partner/join">create your partner account</a> and do it yourself in a few minutes.</p>
        <ul class="contact-list">
          <li><span class="card-ico">${icon('mail')}</span><div><small>Email</small>${mailLink()}</div></li>
          <li>${igLink('card-ico','MA3AK on Instagram (opens in a new tab)').replace('card-ico"','card-ico" style="margin:0"')}<div><small>Instagram</small><a href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer">${CONFIG.instagramHandle}</a></div></li>
        </ul>
      </div>
      <div id="vendor-form-wrap">
        <form class="form" id="vendor-form" novalidate>
          <div class="form-row">${FormField({ id:'v-name', label:'Business name', required:true, autocomplete:'organization', value:d.name||'' })}${FormField({ id:'v-contact', label:'Contact person', required:true, autocomplete:'name', value:d.contact||'' })}</div>
          <div class="form-row">${FormField({ id:'v-phone', label:'Phone', type:'tel', required:true, autocomplete:'tel', inputmode:'tel', placeholder:'+961', value:d.phone||'' })}${FormField({ id:'v-email', label:'Email', type:'email', required:true, autocomplete:'email', value:d.email||'' })}</div>
          <div class="form-row">${FormField({ id:'v-category', label:'Category', required:true, options:opt(CATEGORIES,'id','single'), placeholder:'Choose a category', value:d.category||'' })}${FormField({ id:'v-location', label:'Location', required:true, options:opt(LOCATIONS), placeholder:'Choose an area', value:d.location||'' })}</div>
          <div class="form-row">${FormField({ id:'v-instagram', label:'Instagram', placeholder:'@yourbusiness', value:d.instagram||'' })}${FormField({ id:'v-website', label:'Website', type:'url', placeholder:'yourbusiness.com', inputmode:'url', value:d.website||'' })}</div>
          ${FormField({ id:'v-message', label:'Message', type:'textarea', placeholder:'What you offer, the events you do best, and where you work.', value:d.message||'' })}
          ${HONEYPOT}${ConsentField('v-consent')}
          <div class="chip-row"><button class="btn btn-primary" type="submit">Join MA3AK as a Vendor</button><button class="btn btn-ghost" type="button" id="v-preview">${icon('eye','sm')}Preview my profile</button></div>
        </form>
      </div>
    </div></section>`;
  },
  mount(){
    const f = $('#vendor-form');
    const read = () => ({ name:f.elements['v-name'].value.trim(), contact:f.elements['v-contact'].value.trim(), phone:f.elements['v-phone'].value.trim(), email:f.elements['v-email'].value.trim(), category:f.elements['v-category'].value, location:f.elements['v-location'].value, instagram:f.elements['v-instagram'].value.trim(), website:f.elements['v-website'].value.trim(), message:f.elements['v-message'].value.trim() });
    f.addEventListener('input', () => store.set('vendorDraft', read()));
    f.addEventListener('change', () => store.set('vendorDraft', read()));
    $('#v-preview').addEventListener('click', () => {
      if (!validateForm(f, { 'v-name':V.req('your business name'), 'v-category':V.select('a category') })) return;
      store.set('vendorDraft', read()); location.hash = '#/vendor/preview';
    });
    stampForm(f);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm(f, { 'v-name':V.req('your business name'), 'v-contact':V.req('a contact person'), 'v-phone':V.phoneReq, 'v-email':V.email, 'v-category':V.select('a category'), 'v-location':V.select('an area'), 'v-website':V.urlOpt }) || !consentOk(f, 'v-consent')) return;
      const btn = f.querySelector('[type=submit]'); busy(btn, true); const d = read(); store.set('vendorDraft', d);
      try { const r = await apiPost('/api/vendors', { businessName:d.name, contactName:d.contact, phone:d.phone, email:d.email, category:d.category, location:d.location, instagram:d.instagram, website:d.website, message:d.message, consent:true, ...formMeta(f) });
        $('#vendor-form-wrap').innerHTML = sentPanel({ title:'Application received', text:`Thanks, ${esc(d.contact)}. We’ve received the application for ${esc(d.name)} and will contact you to set up your profile.`, refNo:r.ref, extra:`<a class="btn btn-ghost" href="#/vendor/preview">${icon('eye','sm')}Preview profile</a>` });
        $('.form-success').focus(); }
      catch(err){ busy(btn, false); showServerErrors(f, err, { businessName:'v-name', contactName:'v-contact', phone:'v-phone', email:'v-email', category:'v-category', location:'v-location', website:'v-website' }); toast(esc(err.message), 'alert'); }
    });
  }
};

/* =========================================================
   CONTACT
   ========================================================= */
const Contact = {
  title:'Contact | Ma3ak',
  render(){
    return `
    <section class="page-hero"><div class="wrap split">
      <div>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Contact</span></nav>
        <h1 class="h1">Let’s Talk</h1>
        <p class="lede">Questions about planning, joining as a vendor, or working together. We read every message.</p>
        <ul class="contact-list">
          <li><span class="card-ico">${icon('mail')}</span><div><small>Email</small>${mailLink()}</div></li>
          <li><span class="card-ico">${icon('phone')}</span><div><small>Phone</small>${phoneText()}</div></li>
          <li>${igLink('card-ico','MA3AK on Instagram (opens in a new tab)').replace('card-ico"','card-ico" style="margin:0"')}<div><small>Instagram</small><a href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer">${CONFIG.instagramHandle}</a></div></li>
          <li><span class="card-ico">${icon('pin')}</span><div><small>Location</small><span>${CONFIG.country}</span></div></li>
        </ul>
      </div>
      <div id="contact-wrap" style="padding-top:2.6rem">
        <form class="form" id="contact-form" novalidate>
          <div class="form-row">${FormField({ id:'c-name', label:'Name', required:true, autocomplete:'name' })}${FormField({ id:'c-email', label:'Email', type:'email', required:true, autocomplete:'email' })}</div>
          <div class="form-row">${FormField({ id:'c-phone', label:'Phone', type:'tel', autocomplete:'tel', inputmode:'tel', placeholder:'+961' })}${FormField({ id:'c-subject', label:'Subject', required:true })}</div>
          ${FormField({ id:'c-message', label:'Message', type:'textarea', required:true })}
          ${HONEYPOT}${ConsentField('c-consent')}
          <div><button class="btn btn-primary" type="submit">Send Message</button></div>
        </form>
      </div>
    </div></section>`;
  },
  mount(){
    const cf = $('#contact-form'); stampForm(cf);
    cf.addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target;
      if (!validateForm(f, { 'c-name':V.req('your name'), 'c-email':V.email, 'c-phone':V.phoneOpt, 'c-subject':V.req('a subject'), 'c-message':V.min('Your message', 10) }) || !consentOk(f, 'c-consent')) return;
      const d = k => f.elements[k].value.trim(), btn = f.querySelector('[type=submit]'); busy(btn, true);
      try { const r = await apiPost('/api/contact', { name:d('c-name'), email:d('c-email'), phone:d('c-phone'), subject:d('c-subject'), message:d('c-message'), consent:true, ...formMeta(f) });
        $('#contact-wrap').innerHTML = sentPanel({ title:'Message sent', text:`Thanks, ${esc(d('c-name'))}. We’ll reply to ${esc(d('c-email'))} soon.`, refNo:r.ref }); $('.form-success').focus(); }
      catch(err){ busy(btn, false); showServerErrors(f, err, { name:'c-name', email:'c-email', phone:'c-phone', subject:'c-subject', message:'c-message' }); toast(esc(err.message), 'alert'); }
    });
  }
};

/* ---- legal.js ---- */
/* =========================================================
   PRIVACY POLICY & TERMS (plain-language; have a lawyer review before launch)
   ========================================================= */
function LegalPage(title, intro, sections){
  return `<section class="page-hero"><div class="wrap" style="max-width:820px">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${title}</span></nav>
    <h1 class="h1">${title}</h1><p class="lede">${intro}</p><p class="small muted" style="margin-top:1rem">Last updated ${CONFIG.updated}</p></div></section>
    <section class="section tight" style="padding-top:0"><div class="wrap legal" style="max-width:820px">${sections.map(([h, body]) => `<h2 class="h3">${h}</h2>${body}`).join('')}</div></section>`;
}
const Privacy = {
  title:'Privacy Policy | Ma3ak',
  render(){ return LegalPage('Privacy Policy', 'How MA3AK collects, uses, and protects your information.', [
    ['Who we are', `<p>MA3AK is an event-planning platform based in Lebanon. Contact us at <a class="link" href="mailto:${CONFIG.email}">${CONFIG.email}</a> or ${CONFIG.phone}.</p>`],
    ['What we collect', `<p>Only what you send us through our forms: your name, email, phone number, your event details and choices, your 3D design, and any venue photo you upload. Vendor applications include business details. We also keep a one-way hashed form of your network address to stop abuse; we can’t turn it back into your address.</p>`],
    ['What stays on your device', `<p>Your plans, event designs, and draft forms are saved in your browser’s local storage so you don’t lose your work. They aren’t sent to us until you submit a form. You can clear them below at any time.</p><p><button type="button" class="btn btn-ghost btn-sm" id="clear-local">Clear data saved on this device</button></p>`],
    ['How we use it', `<p>To answer your messages, prepare and arrange your event with providers, process vendor applications, and keep the service secure. We don’t sell your information and we don’t use advertising trackers.</p>`],
    ['Sharing', `<p>When you request a booking or ask us to arrange an event, we share the necessary details with the providers involved. We use hosting and, if enabled, an email delivery provider to run the service. We don’t share your information otherwise unless required by law.</p>`],
    ['Photos', `<p>Venue photos and design images you upload are stored privately. We remove hidden location and camera information from photos when they arrive. Only MA3AK’s team can see them.</p>`],
    ['How long we keep it', `<p>Requests are kept for up to two years and then deleted automatically, unless you ask us to delete them sooner.</p>`],
    ['Security', `<p>All traffic is encrypted. Data is stored on a private server, admin access is protected by strong passwords and secure sessions, and every change is logged.</p>`],
    ['Your rights', `<p>You can ask to see, correct, or delete your information by emailing <a class="link" href="mailto:${CONFIG.email}">${CONFIG.email}</a>. We’ll respond within 30 days.</p>`],
    ['Fonts', `<p>Our website loads fonts from Google Fonts, which receives your network address when the page loads.</p>`],
    ['Changes', `<p>If we change this policy, we’ll update the date above.</p>`]
  ]); },
  mount(root){ const b = $('#clear-local', root); if (b) b.addEventListener('click', () => { try { ['ma3ak:v1','ma3ak:photo','ma3ak:style'].forEach(k => localStorage.removeItem(k)); } catch(e){} toast('Data on this device cleared'); setTimeout(() => location.reload(), 600); }); }
};
const Terms = {
  title:'Terms | Ma3ak',
  render(){ return LegalPage('Terms of Use', 'The rules for using MA3AK.', [
    ['The service', `<p>MA3AK helps you plan events and connects you with independent event providers in Lebanon. Providers set their own prices, packages, availability, and terms. Agreements for services are between you and the provider.</p>`],
    ['Estimates and designs', `<p>Budget splits, 3D designs, and illustrations are planning tools and examples, not quotes or guarantees. Final details, prices, and availability are confirmed directly with providers.</p>`],
    ['Your content', `<p>You’re responsible for what you submit, including photos. Only upload photos you have the right to share. You allow MA3AK to use your submissions to answer and arrange your request.</p>`],
    ['Acceptable use', `<p>Don’t misuse the service: no spam, false information, attempts to break security, or automated scraping.</p>`],
    ['Vendors', `<p>Vendors confirm that their business information, prices, and photos are accurate and that they have the right to publish them.</p>`],
    ['Liability', `<p>MA3AK isn’t responsible for services delivered by independent providers. To the extent allowed by law, the service is provided as is.</p>`],
    ['Contact', `<p>Questions about these terms: <a class="link" href="mailto:${CONFIG.email}">${CONFIG.email}</a>.</p>`]
  ]); }
};

/* ---- customize.js ---- */
/* =========================================================
   CUSTOMIZE — full event customizer. Config-driven: add or edit
   options in CZ_SECTIONS and the UI, summary, and message update.
   ========================================================= */
const NS = ['Not sure, help me decide'];
const CZ_PALETTE = [['Ivory','#F4EFE6'],['Champagne','#E8D5A8'],['Gold','#C8A96B'],['Blush','#F2D3CC'],['Dusty rose','#C99A97'],['Burgundy','#6B1E2A'],['Sage','#A7B59A'],['Emerald','#1F5B45'],['Navy','#1F2D4A'],['Sky blue','#AFCBE3'],['Lavender','#C7B8DD'],['Terracotta','#C0714F'],['Peach','#F3C3A2'],['Silver','#C9CCD1'],['Black','#141414'],['White','#FFFFFF']];
const CZ_SECTIONS = [
  { id:'basics', title:'Event basics', icon:'clipboard', intro:'The essentials. Only the event type is required; everything else helps us plan.', fields:[
    { id:'eventType', label:'What are you celebrating?', type:'cards', required:true, options:EVENT_TYPES.map(e => [e.id, e.name, e.icon]) },
    { id:'eventName', label:'Event name or occasion', type:'text', placeholder:'e.g. Maya & Karim’s wedding' },
    { id:'date', label:'Date', type:'date' },
    { id:'dateFlex', label:'Date flexibility', type:'radio', options:['Fixed date','Flexible by a few days','Any weekend in the month','No date yet'] },
    { id:'timeOfDay', label:'Time of day', type:'radio', options:['Morning','Lunch / afternoon','Sunset','Evening','Late night'] },
    { id:'duration', label:'Duration (hours)', type:'counter', min:1, max:24, step:1 },
    { id:'guests', label:'Number of guests', type:'counter', min:0, max:1000, step:10 },
    { id:'kids', label:'Children attending', type:'counter', min:0, max:500, step:1 },
    { id:'location', label:'Area', type:'chips1', options:LOCATIONS.map(l => l.name).concat(['Outside Lebanon','Not decided']) },
    { id:'budget', label:'Total budget (USD)', type:'money', hint:'Approximate is fine. We plan around it.' },
    { id:'budgetFlex', label:'Budget flexibility', type:'radio', options:['Strict, can’t go over','Some flexibility (up to 10%)','Flexible for the right options'] },
    { id:'priorities', label:'What matters most to you?', type:'chips', max:3, hint:'Pick up to 3.', options:['Venue','Food & drinks','Decoration & flowers','Music & entertainment','Photo & video','Guest experience','Staying on budget','Unique wow moments'] }
  ]},
  { id:'style', title:'Style & colors', icon:'palette', intro:'The look and feel of your event.', fields:[
    { id:'style', label:'Overall style', type:'chips', options:['Elegant','Luxury','Modern','Minimal','Romantic','Glam','Boho','Rustic','Traditional Lebanese','Vintage','Garden','Beach','Industrial','Royal','Playful','Custom'] },
    { id:'colors', label:'Color palette', type:'swatches', max:4, hint:'Pick up to 4.' },
    { id:'colorsOther', label:'Other colors or details', type:'text', placeholder:'e.g. olive green with gold accents' },
    { id:'theme', label:'Theme or concept', type:'textarea', placeholder:'Describe the atmosphere you imagine: a Mediterranean summer night, a Parisian garden, a black-tie gala…' },
    { id:'dressCode', label:'Dress code', type:'radio', options:['Black tie','Formal','Cocktail','Smart casual','Casual','Themed','White party'] },
    { id:'inspiration', label:'Inspiration links', type:'textarea', placeholder:'Paste Instagram or Pinterest links you love.', rows:2 }
  ]},
  { id:'venue', title:'Venue & layout', icon:'building', intro:'Where it happens and how the space is set up.', fields:[
    { id:'hasVenue', label:'Do you have a venue?', type:'radio', options:['Yes, already booked','No, help me find one','Hosting at home / private property'] },
    { id:'venueName', label:'Venue name', type:'text', showIf:v => v.hasVenue === 'Yes, already booked' },
    { id:'venueType', label:'Venue type you like', type:'chips', options:['Ballroom / hotel','Restaurant','Garden / green area','Rooftop','Beach / beach club','Boat / yacht','Mountain resort','Historic palace / château','Vineyard','Villa / private house','Industrial loft','Tent / marquee','Not sure'] },
    { id:'venueSize', label:'Venue size', type:'radio', options:['Small (up to 100)','Medium (up to 200)','Large (up to 400)','Extra large (700+)'], hint:'Leave empty and we size it from your guest count.' },
    { id:'setting', label:'Indoor or outdoor', type:'radio', options:['Indoor','Outdoor','Both','Not sure'] },
    { id:'seating', label:'Seating style', type:'chips', options:['Round tables','Long imperial tables','Mixed rounds & long tables','Cocktail / standing','Lounge seating','Theater rows','Classroom','U-shape','Not sure'] },
    { id:'areas', label:'Areas you need', type:'chips', options:['Dance floor','Stage','Kosha / couple’s stage','Sweetheart or head table','Ceremony area','Welcome / reception area','Lounge corner','VIP area','Kids’ area','Bar area','Photo corner','Smoking area','Gift table','Dressing room'] },
    { id:'danceFloor', label:'Dance floor type', type:'radio', showIf:v => (v.areas||[]).includes('Dance floor'), options:['Glossy black','White / mirror','LED','Wooden','Custom printed','Venue default'] },
    { id:'accessibility', label:'Accessibility needs', type:'chips', options:['Wheelchair access','Elevator','Seating for elderly guests','Quiet room','None'] },
    { id:'weatherPlan', label:'Weather backup (for outdoor)', type:'radio', showIf:v => ['Outdoor','Both'].includes(v.setting), options:['Tent / marquee backup','Indoor backup space','Umbrellas & heaters','Take the risk'] }
  ]},
  { id:'food', title:'Food & drinks', icon:'utensils', intro:'Menus, service, and everything in the glass.', fields:[
    { id:'service', label:'Service style', type:'chips', options:['Buffet','Plated (served)','Family style / sharing','Food stations','Cocktail & canapés','Live cooking stations','BBQ / grill','Food trucks','Brunch','Not sure'] },
    { id:'cuisine', label:'Cuisine', type:'chips', options:['Lebanese','Lebanese mezze','Mediterranean','French','Italian','Asian / sushi','Mexican','American','International mix','Fusion'] },
    { id:'stations', label:'Special stations', type:'chips', options:['Shawarma','Manakish / saj','Sushi','Pasta','Grill','Seafood','Oysters & raw bar','Cheese & charcuterie','Salad bar','Late-night snacks','Kaak & street food'] },
    { id:'dietary', label:'Dietary needs', type:'chips', options:['Vegetarian','Vegan','Gluten-free','Halal','Nut allergy','Lactose-free','Kids’ menu','Diabetic-friendly','None'] },
    { id:'drinks', label:'Drinks', type:'chips', options:['Soft drinks & water','Fresh juices','Mocktails','Signature cocktail','Open bar','Wine','Champagne / bubbly','Arak','Beer','Whisky & spirits','Coffee & tea corner','Turkish coffee service','No alcohol'] },
    { id:'bartenders', label:'Bar service', type:'radio', options:['Professional bartenders','Waiter service only','Self-service','Not sure'] },
    { id:'foodNotes', label:'Menu notes', type:'textarea', placeholder:'Favorite dishes, family recipes, things to avoid…', rows:2 }
  ]},
  { id:'sweets', title:'Cake & desserts', icon:'cake', intro:'The sweet side.', fields:[
    { id:'cake', label:'Cake', type:'radio', options:['Yes, a statement cake','Yes, a simple cake','No cake'] },
    { id:'cakeTiers', label:'Tiers', type:'counter', min:1, max:10, step:1, showIf:v => (v.cake||'').startsWith('Yes') },
    { id:'cakeFlavor', label:'Flavors', type:'chips', showIf:v => (v.cake||'').startsWith('Yes'), options:['Vanilla','Chocolate','Red velvet','Lotus','Pistachio','Rose & lychee','Fruits','Caramel','Carrot','Tiramisu'] },
    { id:'cakeStyle', label:'Cake style', type:'chips', showIf:v => (v.cake||'').startsWith('Yes'), options:['Classic white','Fresh flowers','Sugar flowers','Gold details','Naked / semi-naked','Modern sculpted','Themed / character','Mirror glaze'] },
    { id:'desserts', label:'Other desserts', type:'chips', options:['Sweets table','Lebanese sweets (knefe, maamoul…)','Macarons','Cupcakes','Chocolate fountain','Ice cream cart','Crêpe station','Fruit display','Donut wall','Dragées & chocolates'] }
  ]},
  { id:'decor', title:'Decoration & flowers', icon:'flower', intro:'Flowers, tables, backdrops, and every finishing touch.', fields:[
    { id:'flowerLevel', label:'How many flowers?', type:'radio', options:['Minimal','Moderate','Lavish','Over the top']},
    { id:'flowers', label:'Favorite flowers', type:'chips', options:['Roses','Garden roses','Peonies','Hydrangeas','Orchids','Baby’s breath','Lilies','Tulips','Ranunculus','Gardenias','Jasmine','Pampas grass','Dried flowers','Greenery only','Seasonal'] },
    { id:'centerpieces', label:'Centerpieces', type:'chips', options:['Tall arrangements','Low arrangements','Mixed heights','Candles & candelabras','Floral runners','Fruit / Mediterranean','Lanterns','Minimal / modern'] },
    { id:'backdrop', label:'Backdrop', type:'chips', options:['Flower wall','Floral arch','Balloon arch','Greenery wall','Neon sign','Draped fabric','Custom printed','Mirror / acrylic','LED screen','None'] },
    { id:'neonText', label:'Neon sign text', type:'text', showIf:v => (v.backdrop||[]).includes('Neon sign') },
    { id:'balloons', label:'Balloons', type:'radio', options:['None','A few accents','Garlands & arches','Balloon installation','Balloon drop'] },
    { id:'linens', label:'Table linens', type:'chips', options:['White','Ivory','Colored (from palette)','Velvet','Sequins','No cloth (bare wood / glass)','Runners only'] },
    { id:'chairs', label:'Chairs', type:'chips', options:['Gold chiavari','Silver chiavari','Ghost / transparent','Velvet','Wooden cross-back','Wishbone','Rattan','Venue chairs'] },
    { id:'tableware', label:'Tableware', type:'chips', options:['Gold chargers','Silver chargers','Glass chargers','Colored glassware','Crystal glassware','Gold cutlery','Black cutlery','Ceramic / handmade','Menus & name cards'] },
    { id:'extrasDecor', label:'Other decor', type:'chips', options:['Welcome sign','Seating chart display','Entrance decor','Aisle decor','Ceiling installation','Hanging florals','Rugs & lounge styling','Personalized props','Photo-op corner','Candles everywhere'] }
  ]},
  { id:'lighting', title:'Lighting & effects', icon:'bulb', intro:'Ambiance and wow moments.', fields:[
    { id:'lights', label:'Lighting', type:'chips', options:['String / fairy lights','Chandeliers','Warm uplighting','Colored uplighting','Spotlights','Candlelight','Lanterns','Neon','Moving heads','Gobo / monogram projection','LED dance floor'] },
    { id:'effects', label:'Special effects', type:'chips', options:['Cold sparks','Fireworks','Low fog / dry ice','Smoke','Confetti','Bubbles','Lasers','Flame effects','Drone light show','Sky lanterns'] },
    { id:'effectMoments', label:'When should the effects happen?', type:'chips', showIf:v => (v.effects||[]).length > 0, options:['Entrance','First dance','Cake cutting','Countdown / reveal','Closing'] }
  ]},
  { id:'entertainment', title:'Music & entertainment', icon:'music', intro:'Sound, performers, and activities.', fields:[
    { id:'music', label:'Music', type:'chips', options:['DJ','Live band','Singer','Zaffe','Dabke troupe','Belly dancer','String quartet / violin','Oud player','Saxophonist','Pianist','Drummers (tabl)','Choir'] },
    { id:'genres', label:'Music styles', type:'chips', options:['Arabic pop','Lebanese classics','Oriental / tarab','International pop','House / deep house','Hip-hop / R&B','Latin','Rock','Oldies','Jazz / lounge'] },
    { id:'mustPlay', label:'Must-play songs', type:'textarea', placeholder:'Entrance song, first dance, songs to avoid…', rows:2 },
    { id:'host', label:'Host / MC', type:'radio', options:['Professional MC','Friend or family member','No host'] },
    { id:'activities', label:'Activities & extras', type:'chips', options:['Photo booth','360 video booth','Karaoke','Games / lawn games','Magician','Kids’ entertainer','Face painting','Caricature artist','Live painter','Tarot / fortune teller','Fire / LED performers','Hookah / argileh corner','Cigar lounge','Casino tables'] }
  ]},
  { id:'media', title:'Photo & video', icon:'camera', intro:'How you want it remembered.', fields:[
    { id:'photo', label:'Photography', type:'radio', options:['Yes','No','Not sure'] },
    { id:'photographers', label:'Number of photographers', type:'counter', min:1, max:6, step:1, showIf:v => v.photo === 'Yes' },
    { id:'video', label:'Video', type:'chips', options:['Full film','Highlight video','Same-day edit','Drone footage','Reels / content creator','Live streaming','None'] },
    { id:'coverage', label:'Coverage', type:'chips', options:['Getting ready','Ceremony','Reception','Full day','Pre-event shoot','Save the date shoot'] },
    { id:'deliverables', label:'Deliverables', type:'chips', options:['Printed album','Online gallery','Prints / frames','Instant prints at the event','Raw files'] }
  ]},
  { id:'beauty', title:'Beauty & attire', icon:'brush', intro:'Looking your best.', fields:[
    { id:'beautyServices', label:'Services', type:'chips', options:['Makeup','Hair','Nails','Skin prep','Barber / grooming','Henna','Lashes'] },
    { id:'beautyPeople', label:'How many people?', type:'counter', min:0, max:40, step:1, showIf:v => (v.beautyServices||[]).length > 0 },
    { id:'beautyWhere', label:'Where', type:'radio', showIf:v => (v.beautyServices||[]).length > 0, options:['At the salon','At home / hotel (on location)'] },
    { id:'attire', label:'Attire help', type:'chips', options:['Dress (buy or rent)','Suit / tuxedo','Bridesmaids / groomsmen outfits','Kids’ outfits','Shoes & accessories','Jewelry rental','None'] }
  ]},
  { id:'guests', title:'Guests & invitations', icon:'mailbox', intro:'Inviting and taking care of your guests.', fields:[
    { id:'invitations', label:'Invitations', type:'chips', options:['Printed invitations','Digital invitations','Video invitation','Save the dates','Website for the event','None'] },
    { id:'rsvp', label:'RSVP management', type:'radio', options:['Yes, handle RSVPs for us','We’ll manage it','Not needed'] },
    { id:'seatingPlan', label:'Seating plan', type:'radio', options:['Yes, help us plan seating','We’ll do it','Free seating'] },
    { id:'favors', label:'Guest favors & gifts', type:'chips', options:['Dragées / chocolates','Mini candles','Plants / seeds','Personalized items','Local products (soap, honey, olive oil)','Welcome bags','None'] },
    { id:'languages', label:'Language for invitations & signage', type:'chips', options:['English','Arabic','French'] }
  ]},
  { id:'logistics', title:'Logistics & services', icon:'car', intro:'Everything behind the scenes.', fields:[
    { id:'transport', label:'Transportation', type:'chips', options:['Wedding / VIP car','Classic car','Guest shuttle','Bus for guests','Valet parking','Airport pickups','Boat transfer'] },
    { id:'staff', label:'Staff & services', type:'chips', options:['Event planner / coordinator','Day-of coordinator','Hostesses / ushers','Waiters','Security','Cleaning team','Babysitters','Bathroom attendants'] },
    { id:'technical', label:'Technical', type:'chips', options:['Generator / backup power','Sound system','Screens & projectors','Microphones','Wi-Fi','Air conditioning / fans','Heaters','Mobile restrooms','Tent / marquee','Flooring','Furniture rental'] },
    { id:'stay', label:'Accommodation', type:'radio', options:['Hotel rooms for guests','Room for the hosts only','Not needed'] },
    { id:'permits', label:'Permits & paperwork', type:'chips', options:['Venue permits','Fireworks permit','Drone permit','Music license','Not sure'] }
  ]},
  { id:'contact', title:'Your details & send', icon:'send', intro:'Review your choices, add your details, and send. We’ll get back to you to arrange everything.', fields:[
    { id:'fullName', label:'Full name', type:'text', required:true, autocomplete:'name' },
    { id:'phone', label:'Phone / WhatsApp', type:'tel', placeholder:'+961', autocomplete:'tel', hint:'Phone or email is required.' },
    { id:'email', label:'Email', type:'email', autocomplete:'email' },
    { id:'contactPref', label:'Best way to reach you', type:'radio', options:['WhatsApp','Phone call','Email'] },
    { id:'contactTime', label:'Best time', type:'radio', options:['Morning','Afternoon','Evening','Anytime'] },
    { id:'heard', label:'How did you hear about us?', type:'radio', options:['Instagram','Friend or family','Google','A vendor','Other'] },
    { id:'notes', label:'Anything else?', type:'textarea', placeholder:'Special requests, ideas, worries, surprises you’re planning…' }
  ]}
];
// "Not sure" helper on most multi-choice groups
CZ_SECTIONS.forEach(s => s.fields.forEach(f => { if (f.type === 'chips' && !f.options.some(o => /not sure|none/i.test(o))) f.options = f.options.concat(NS); }));

/* ---------- state ---------- */
const czState = () => store.get('custom') || {};
const czSave = v => store.set('custom', v);
const czHas = val => Array.isArray(val) ? val.length > 0 : (val !== '' && val != null && val !== 0);
function czFmt(f, val){
  if (f.type === 'cards') return evName(val);
  if (f.type === 'money') return money(val);
  if (f.type === 'date') return fmtDate(val);
  return Array.isArray(val) ? val.join(', ') : String(val);
}
function czDone(sec, v){ const fs = sec.fields.filter(f => !f.showIf || f.showIf(v)); return fs.filter(f => czHas(v[f.id])).length; }

/* ---------- field rendering ---------- */
function czField(f, v){
  const val = v[f.id], id = 'cz-' + f.id, lab = `${esc(f.label)}${f.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}`;
  const hint = f.hint ? `<span class="hint">${esc(f.hint)}</span>` : '';
  const wrap = (inner, tag='div', extra='') => `<${tag} class="field cz-field" data-field="${f.id}" ${extra}>${inner}<span class="err" id="${id}-err" role="alert"></span></${tag}>`;
  switch (f.type){
    case 'cards': return wrap(`<span class="label" id="${id}-l">${lab}</span><div class="type-grid cz-cards" role="radiogroup" aria-labelledby="${id}-l">${f.options.map(([o,l,i]) => `<button type="button" class="type-opt" role="radio" aria-checked="${val===o}" data-set="${f.id}" data-val="${esc(o)}">${icon(i)}<span>${esc(l)}</span></button>`).join('')}</div>`);
    case 'chips': case 'chips1': case 'radio': {
      const multi = f.type === 'chips', arr = multi ? (val || []) : null;
      return wrap(`<legend class="label">${lab}</legend>${hint}<div class="chip-row" ${multi ? '' : 'role="radiogroup"'}>${f.options.map(o => { const on = multi ? arr.includes(o) : val === o; return `<button type="button" class="chip${/not sure/i.test(o)?' chip-soft':''}" ${multi ? `aria-pressed="${on}"` : `role="radio" aria-checked="${on}" aria-pressed="${on}"`} data-${multi?'toggle':'set'}="${f.id}" data-val="${esc(o)}">${multi && on ? icon('check','sm') : ''}${esc(o)}</button>`; }).join('')}</div>`, 'fieldset');
    }
    case 'swatches': { const arr = val || [];
      return wrap(`<legend class="label">${lab}</legend>${hint}<div class="swatches">${CZ_PALETTE.map(([n,c]) => `<button type="button" class="swatch" aria-pressed="${arr.includes(n)}" data-toggle="${f.id}" data-val="${n}" title="${n}"><span style="background:${c}"></span>${n}</button>`).join('')}</div>`, 'fieldset'); }
    case 'counter': return wrap(`<label for="${id}">${lab}</label><div class="counter"><button type="button" class="icon-btn" data-step="${f.id}" data-d="-1" aria-label="Decrease ${esc(f.label)}">${icon('minus','sm')}</button><input class="input" id="${id}" inputmode="numeric" data-num="${f.id}" value="${val ?? ''}" placeholder="0"><button type="button" class="icon-btn" data-step="${f.id}" data-d="1" aria-label="Increase ${esc(f.label)}">${icon('plus','sm')}</button></div>${hint}`);
    case 'money': return wrap(`<label for="${id}">${lab}</label><div class="money-input" style="max-width:280px"><span>$</span><input id="${id}" inputmode="numeric" data-num="${f.id}" value="${val ?? ''}" placeholder="0"></div>${hint}`);
    case 'textarea': return wrap(`<label for="${id}">${lab}</label><textarea class="textarea" id="${id}" data-text="${f.id}" rows="${f.rows||4}" placeholder="${esc(f.placeholder||'')}" style="min-height:${(f.rows||4)*26}px">${esc(val||'')}</textarea>${hint}`);
    default: return wrap(`<label for="${id}">${lab}</label><input class="input" id="${id}" type="${f.type==='tel'||f.type==='email'||f.type==='date'?f.type:'text'}" data-text="${f.id}" value="${esc(val||'')}" placeholder="${esc(f.placeholder||'')}"${f.autocomplete?` autocomplete="${f.autocomplete}"`:''}${f.type==='date'?` min="${todayISO()}"`:''}>${hint}`);
  }
}

/* ---------- summary & sending ---------- */
function czRef(v){ if (!v._ref){ const d = new Date(); v._ref = `MA3-${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; czSave(v); } return v._ref; }
function czText(v){
  const out = [`MA3AK EVENT REQUEST ${czRef(v)}`, ''];
  CZ_SECTIONS.forEach(s => { if (s.id === 'contact'){ const d = ST.describe(v); out.push('— 3D DESIGN —', `• Setting: ${d.photo ? 'Customer’s own venue photo (they’ll send the photo and design image in this chat)' : d.venue}`, `• Items: ${d.items.length ? d.items.join(', ') : 'none yet'}`, `• Layout: ${d.custom ? `arranged by the customer (${d.custom} changes)` : 'automatic from choices'}`, ''); }
    const lines = s.fields.filter(f => (!f.showIf || f.showIf(v)) && czHas(v[f.id])).map(f => `• ${f.label}: ${czFmt(f, v[f.id])}`); if (lines.length){ out.push(`— ${s.title.toUpperCase()} —`, ...lines, ''); } });
  return out.join('\n').trim();
}
function czReview(v){
  const d = ST.describe(v);
  return `<div class="cz-review"><div class="cz-rev-sec"><div class="cz-rev-h"><span>${icon('layers','sm')}Your 3D design</span></div><dl><div><dt>Setting</dt><dd>${esc(d.venue)}</dd></div><div><dt>Items</dt><dd>${esc(d.items.join(', ') || 'None yet')}</dd></div><div><dt>Layout</dt><dd>${d.custom ? 'Arranged by you' : 'Automatic from your choices'}</dd></div></dl></div>${CZ_SECTIONS.slice(0,-1).map((s,i) => { const fs = s.fields.filter(f => (!f.showIf || f.showIf(v)) && czHas(v[f.id]));
    return `<div class="cz-rev-sec"><div class="cz-rev-h"><span>${icon(s.icon,'sm')}${esc(s.title)}</span><button type="button" class="link small" data-goto="${i}">${fs.length ? 'Edit' : 'Add'}</button></div>${fs.length ? `<dl>${fs.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(czFmt(f, v[f.id]))}</dd></div>`).join('')}</dl>` : `<p class="small muted">Nothing chosen yet. We’ll suggest options.</p>`}</div>`; }).join('')}</div>`;
}

/* ---------- page ---------- */
const Customize = {
  title:'Customize Your Event | Ma3ak',
  render(){
    return `<section class="page-hero" style="padding-bottom:1.5rem"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Customize</span></nav>
      <h1 class="h1">Design your event in 3D</h1>
      <p class="lede">Every choice you make appears in your venue as you go. Add, drag, rotate, and remove anything, then send your design to us and we’ll arrange it with the right providers.</p>
    </div></section>
    <section class="section tight" style="padding-top:.5rem"><div class="wrap cz2">
      <div class="cz-stage" id="cz-stage">${has3D() ? ST.markup() : `<div class="studio studio-off"><p>The 3D designer needs a browser with WebGL. Your choices will still be sent in full.</p></div>`}</div>
      <div class="cz-main" id="cz"></div>
    </div></section>`;
  },
  mount(root){
    const v = czState();
    const plan = store.get('plan');
    if (plan && !v._prefilled){ Object.assign(v, { eventType: v.eventType || plan.eventType, guests: v.guests || +plan.guests || '', budget: v.budget || +plan.budget || '', date: v.date || plan.date || '', eventName: v.eventName || plan.name || '' }); const loc = locName(plan.location); if (loc && !v.location) v.location = loc; v._prefilled = true; czSave(v); }
    let step = Math.min(v._step || 0, CZ_SECTIONS.length - 1);
    const box = $('#cz', root); box.dataset.t = Date.now();
    let studio = null;
    if (has3D() && $('#studio', root)){ try { studio = new ST.Studio($('#studio', root), { onChange:(nv, kind) => { czSave(nv); if (kind === 'venue'){ const y = window.scrollY; render(); window.scrollTo(0, y); } } }); studio.loop(); } catch(e){ console.warn('Studio unavailable', e); studio = null; } }
    let previewKey = null;
    function aside(){
      const total = CZ_SECTIONS.reduce((s,sec) => s + czDone(sec, v), 0);
      return `<aside class="cz-aside" aria-label="Sections">
        <div class="cz-preview">${v.eventType ? `<div class="cz-prev-img" data-prev="${S3.FOR_EVENT[v.eventType]}"><img alt="" hidden><span class="cz-prev-cap">${esc(evName(v.eventType))}</span></div>` : `<div class="cz-prev-empty">${icon('sparkle')}<span>Pick an event type to see an example setup</span></div>`}</div>
        <ol class="cz-steps">${CZ_SECTIONS.map((s,i) => { const d = czDone(s, v); return `<li><button type="button" data-goto="${i}" class="${i===step?'on':''}" ${i===step?'aria-current="step"':''}><span class="cz-ico">${d && i!==step ? icon('check','sm') : icon(s.icon,'sm')}</span><span class="cz-st">${esc(s.title)}</span>${d ? `<span class="cz-count">${d}</span>` : ''}</button></li>`; }).join('')}</ol>
        <p class="tiny muted" style="margin-top:1rem">${total} choices so far. Saved on this device as you go.</p>
      </aside>`;
    }
    function render(focus=false){
      const s = CZ_SECTIONS[step], last = step === CZ_SECTIONS.length - 1;
      box.innerHTML = `
        <div>
          <nav class="cz-mobile-steps chip-scroll" aria-label="Steps">${CZ_SECTIONS.map((x,i) => { const d = czDone(x, v); return `<button type="button" class="chip${i===step?' active':''}" data-goto="${i}" ${i===step?'aria-current="step"':''}>${d && i!==step ? icon('check','sm') : ''}${i+1}. ${esc(x.title)}</button>`; }).join('')}</nav>
          <div class="panel cz-panel">
            <header class="cz-head"><span class="card-ico">${icon(s.icon)}</span><div><p class="tiny muted">Step ${step+1} of ${CZ_SECTIONS.length}</p><h2 class="h2" tabindex="-1" id="cz-title">${esc(s.title)}</h2><p class="muted small" style="margin-top:.35rem">${esc(s.intro)}</p></div></header>
            ${last ? `<h3 class="h3" style="margin:1.5rem 0 .75rem">Your choices</h3>${czReview(v)}<h3 class="h3" style="margin:2rem 0 .5rem">Your details</h3>` : ''}
            <div class="cz-fields">${s.fields.filter(f => !f.showIf || f.showIf(v)).map(f => czField(f, v)).join('')}${last ? `<div class="hp" aria-hidden="true"><label>Leave this field empty <input type="text" id="cz-hp" tabindex="-1" autocomplete="off"></label></div><div class="field consent"><label class="check"><input type="checkbox" id="cz-consent" aria-describedby="cz-consent-err"> I agree to the <a class="link" href="#/privacy" target="_blank">Privacy Policy</a> and <a class="link" href="#/terms" target="_blank">Terms</a>, and to MA3AK contacting me about this request.</label><span class="err" id="cz-consent-err" role="alert"></span></div>` : ''}</div>
            <div id="cz-result"></div>
            <div class="cz-nav">
              <button type="button" class="btn btn-ghost" data-nav="-1" ${step===0?'disabled':''}>Back</button>
              ${last ? `<button type="button" class="btn btn-primary" id="cz-send">${icon('send','sm')}Send my request</button>` : `<button type="button" class="btn btn-primary" data-nav="1">Next: ${esc(CZ_SECTIONS[step+1].title)}</button>`}
            </div>
          </div>
        </div>`;
      if (studio) studio.sync(v);
      const ms = $('.cz-mobile-steps .active', box); if (ms){ const sc = ms.parentElement; sc.scrollLeft = ms.offsetLeft - sc.clientWidth/2 + ms.clientWidth/2; }
      if (focus){ $('#cz-title', box).focus({ preventScroll:true }); if (box.getBoundingClientRect().top < 0) box.scrollIntoView({ block:'start', behavior:'smooth' }); }
    }
    const go = i => { step = Math.max(0, Math.min(CZ_SECTIONS.length-1, i)); v._step = step; czSave(v); render(true); };
    const fieldOf = id => CZ_SECTIONS.flatMap(s => s.fields).find(f => f.id === id);
    const refreshCond = () => { const s = CZ_SECTIONS[step]; if (s.fields.some(f => f.showIf)) { const y = window.scrollY; render(); window.scrollTo(0, y); } else { studio && studio.sync(v); } };
    box.addEventListener('click', e => {
      const g = e.target.closest('[data-goto]'); if (g){ go(+g.dataset.goto); return; }
      const n = e.target.closest('[data-nav]'); if (n){ if (+n.dataset.nav > 0 && step === 0 && !v.eventType){ const fe = $('[data-field="eventType"]', box); fe.classList.add('invalid'); $('#cz-eventType-err').textContent = 'Choose what you’re celebrating to continue.'; fe.scrollIntoView({ block:'center', behavior:'smooth' }); return; } go(step + +n.dataset.nav); return; }
      const st = e.target.closest('[data-set]'); if (st){ const id = st.dataset.set; v[id] = v[id] === st.dataset.val && id !== 'eventType' ? '' : st.dataset.val; if (id === 'eventType') { previewKey = null; } czSave(v); const y = window.scrollY; render(); window.scrollTo(0, y); const again = $(`[data-set="${id}"][data-val="${CSS.escape(st.dataset.val)}"]`, box); again && again.focus({ preventScroll:true }); return; }
      const tg = e.target.closest('[data-toggle]'); if (tg){ const id = tg.dataset.toggle, f = fieldOf(id), arr = v[id] || [], val = tg.dataset.val;
        let next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
        const excl = /^(None|No alcohol|Not sure, help me decide|Not sure)$/;
        if (!arr.includes(val)){ next = excl.test(val) ? [val] : next.filter(x => !excl.test(x)); }
        if (f.max && next.filter(x => !excl.test(x)).length > f.max){ toast(`Pick up to ${f.max}`, 'info'); return; }
        v[id] = next; czSave(v); const y = window.scrollY; render(); window.scrollTo(0, y); const again = $(`[data-toggle="${id}"][data-val="${CSS.escape(val)}"]`, box); again && again.focus({ preventScroll:true }); return; }
      const sp = e.target.closest('[data-step]'); if (sp){ const f = fieldOf(sp.dataset.step); const cur = +v[f.id] || 0; v[f.id] = Math.max(f.min ?? 0, Math.min(f.max ?? 1e6, cur + (+sp.dataset.d)*(f.step||1))); czSave(v); $(`#cz-${f.id}`, box).value = v[f.id]; refreshCond(); return; }
      if (e.target.closest('#cz-send')) send();
    });
    box.addEventListener('input', e => {
      const t = e.target;
      if (t.dataset.num){ const n = t.value.replace(/\D/g,''); t.value = n; v[t.dataset.num] = n === '' ? '' : +n; czSave(v); studio && studio.sync(v); }
      if (t.dataset.text){ v[t.dataset.text] = t.value; czSave(v); t.closest('.field').classList.remove('invalid'); }
    });
    box.addEventListener('change', e => { if (e.target.dataset.text || e.target.dataset.num) studio && studio.sync(v); });
    async function send(){
      const errs = [];
      const setErr = (id, msg) => { const fe = $(`[data-field="${id}"]`, box); if (!fe) return; fe.classList.toggle('invalid', !!msg); $(`#cz-${id}-err`, box).textContent = msg || ''; if (msg) errs.push(fe); };
      setErr('fullName', (v.fullName||'').trim() ? '' : 'Enter your name.');
      const phoneOk = /^[+\d][\d\s\-()]{6,}$/.test((v.phone||'').trim()), emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v.email||'').trim());
      setErr('phone', !v.phone && !v.email ? 'Enter a phone number or an email.' : (v.phone && !phoneOk ? 'Enter a valid phone number.' : ''));
      setErr('email', v.email && !emailOk ? 'Enter an email like name@example.com.' : '');
      if (!v.eventType){ toast('Choose an event type first', 'alert'); go(0); return; }
      const cons = $('#cz-consent', box); if (!cons.checked){ cons.closest('.field').classList.add('invalid'); $('#cz-consent-err', box).textContent = 'Please accept to continue.'; errs.push(cons.closest('.field')); }
      if (errs.length){ errs[0].scrollIntoView({ block:'center', behavior:'smooth' }); const i = $('input,textarea', errs[0]); i && i.focus({ preventScroll:true }); return; }
      const btn = $('#cz-send', box); busy(btn, true, 'Sending your design');
      const shot = studio ? studio.capture() : null; let venue = null; if (v._photo){ try { venue = localStorage.getItem('ma3ak:photo'); } catch(e){} }
      const choices = Object.fromEntries(Object.entries(v).filter(([k]) => !['_step','_ref','_sentAt','_prefilled','fullName','phone','email'].includes(k)));
      try {
        const r = await apiPost('/api/requests', { contact:{ fullName:v.fullName, phone:v.phone || '', email:v.email || '' }, choices, design:ST.describe(v), text:czText(v).replace(/^MA3AK EVENT REQUEST \S+\n\n/, ''), images:{ design:shot ? await shrinkImage(shot) : undefined, venue:venue ? await shrinkImage(venue, 2048, .85) : undefined }, consent:true, elapsed:Date.now() - (+box.dataset.t || 0), company_site:($('#cz-hp', box) || {}).value || '' });
        v._ref = r.ref; v._sentAt = new Date().toISOString(); czSave(v);
        $('#cz-result', box).innerHTML = `<div class="form-success" tabindex="-1" style="margin-top:1.5rem"><div class="card-ico">${icon('check')}</div>
          <h3>Your design is with us</h3><p>Reference <b>${esc(r.ref)}</b>. Our team will contact you${v.contactPref ? ' by ' + esc(v.contactPref.toLowerCase()) : ''} to arrange everything.</p>
          ${shot ? `<figure class="cz-shot"><img src="${shot}" alt="Your 3D event design"><figcaption>Your design. Press and hold (or right-click) to save a copy.</figcaption></figure>` : ''}
          <div class="actions"><a class="btn btn-ghost" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi MA3AK, about my event request ' + r.ref)}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}Message us on WhatsApp</a></div></div>`;
        busy(btn, false); btn.disabled = true; btn.textContent = 'Sent';
      } catch(err){
        busy(btn, false);
        const fx = err.fields || {}; Object.entries(fx).forEach(([k, m]) => setErr(k, m));
        const text = czText(v), wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
        $('#cz-result', box).innerHTML = `<div class="notice" style="margin-top:1.5rem">${icon('alert')}<span>${esc(err.message)} ${err.offline || (err.status||0) >= 500 ? `You can also <a class="link" href="${wa}" target="_blank" rel="noopener noreferrer">send it on WhatsApp</a>.` : ''}</span></div>`;
      }
      const fs = $('#cz-result > *', box); if (fs){ fs.scrollIntoView({ block:'center', behavior:'smooth' }); fs.focus && fs.focus({ preventScroll:true }); }
    }
    render();
  }
};

/* ---- studio.js ---- */
/* =========================================================
   MA3AK 3D EVENT STUDIO
   The customer's choices build the venue live in 3D, and they
   can drag & drop, move, rotate, duplicate, and delete items.
   ========================================================= */
const ST = (() => {
  const C = S3.C, mdl = C.mdl, rnd = C.rnd, pick = C.pick;
  let W = 20, D = 16;                   // venue footprint, changes with the chosen size; back = -z
  const SIZES = { 'Small (up to 100)':[20,16], 'Medium (up to 200)':[28,22], 'Large (up to 400)':[36,28], 'Extra large (700+)':[46,34] };
  const sizeOf = v => SIZES[v.venueSize] || (() => { const g = +v.guests || 0; return g > 420 ? SIZES['Extra large (700+)'] : g > 210 ? SIZES['Large (up to 400)'] : g > 100 ? SIZES['Medium (up to 200)'] : SIZES['Small (up to 100)']; })();
  const PAL = Object.fromEntries(CZ_PALETTE);
  const lighten = (hex, k) => { const h = hex.replace('#',''); return '#' + [0,2,4].map(i => Math.round(parseInt(h.slice(i,i+2),16) + (255 - parseInt(h.slice(i,i+2),16))*k).toString(16).padStart(2,'0')).join(''); };

  /* ---------- context from choices ---------- */
  function makeCtx(v){
    const cols = (v.colors || []).map(n => PAL[n]).filter(Boolean);
    const c1 = cols[0] || '#F4EFE6', c2 = cols[1] || '#F2D3CC', c3 = cols[2] || '#C8A96B';
    const lin = (v.linens || [])[0];
    const linen = lin === 'White' ? '#F8F6F1' : lin === 'Colored (from palette)' ? lighten(c1,.25) : lin === 'Velvet' ? c1 : lin === 'Sequins' ? '#CDBA8E' : '#F3EEE5';
    const ch = (v.chairs || [])[0];
    const chair = ({ 'Gold chiavari':{ leg:'#C8A96B' }, 'Silver chiavari':{ leg:'#C9CCD1' }, 'Ghost / transparent':{ leg:'#E6EBEF', spec:1 }, 'Velvet':{ leg:'#C8A96B', seat:cols[0] || '#6B1E2A', solid:true, back:cols[0] || '#6B1E2A' }, 'Wooden cross-back':{ leg:'#7A5C42', seat:'#8B6A4C' }, 'Wishbone':{ leg:'#B08A5E', seat:'#C9A97C' }, 'Rattan':{ leg:'#C9A97C', seat:'#E5D3B0' } })[ch] || { leg:'#C8A96B' };
    const cp = v.centerpieces || [];
    const center = cp.includes('Tall arrangements') ? 'tall' : cp.includes('Candles & candelabras') ? 'candelabra' : cp.includes('Mixed heights') ? 'mixed' : 'low';
    const fl = cols.length ? cols.concat(['#FFFFFF']) : ['#FFFFFF','#F2DCD3','#EBCFC4','#F8F1E7'];
    const lvl = { Minimal:.5, Moderate:1, Lavish:1.6, 'Over the top':2.3 }[v.flowerLevel] || 1;
    const dfType = v.danceFloor || ((v.lights||[]).includes('LED dance floor') ? 'LED' : 'Glossy black');
    return { cols, c1, c2, c3, linen, chair, center, flowers:fl, lvl, dfType, bare: lin === 'No cloth (bare wood / glass)', metal: (v.tableware||[]).includes('Silver chargers') ? '#C9CCD1' : '#C8A96B', tiers: v.cakeTiers || 3 };
  }

  /* ---------- environments ---------- */
  const VENUES = {
    'Ballroom / hotel':'ballroom', 'Restaurant':'restaurant', 'Garden / green area':'garden', 'Garden':'garden', 'Rooftop':'rooftop', 'Beach / beach club':'beach', 'Mountain resort':'mountain',
    'Historic palace / château':'palace', 'Vineyard':'vineyard', 'Boat / yacht':'yacht', 'Yacht':'yacht', 'Villa / private house':'villa', 'Industrial loft':'loft', 'Tent / marquee':'tent' };
  const VENUE_LABEL = { photo:'Your photo', ballroom:'Ballroom', restaurant:'Restaurant', garden:'Green area', rooftop:'Rooftop', beach:'Beach', yacht:'Boat', mountain:'Mountain', palace:'Palace', vineyard:'Vineyard', villa:'Villa & pool', loft:'Loft', tent:'Garden tent' };
  const VENUE_PICK = [['ballroom','Ballroom / hotel','building'],['garden','Garden / green area','flower'],['beach','Beach / beach club','umbrella'],['yacht','Boat / yacht','boat'],['rooftop','Rooftop','sparkle'],['villa','Villa / private house','seat'],['mountain','Mountain resort','mountain'],['tent','Tent / marquee','tent'],['vineyard','Vineyard','glass'],['palace','Historic palace / château','building'],['restaurant','Restaurant','utensils'],['loft','Industrial loft','layers']];
  const INDOOR = new Set(['ballroom','restaurant','palace','loft']);
  function venueOf(v){
    if (v._photo) return 'photo';
    const vt = (v.venueType || []).find(x => VENUES[x]); if (vt) return VENUES[vt];
    if (v.hasVenue === 'Hosting at home / private property') return 'villa';
    if (v.setting === 'Outdoor') return 'garden';
    return ({ beach:'beach', outdoor:'garden', private:'rooftop', bachelor:'loft', 'baby-shower':'garden', engagement:'garden' })[v.eventType] || 'ballroom';
  }
  const timeOf = v => ({ Morning:'day', 'Lunch / afternoon':'day', Sunset:'sunset' })[v.timeOfDay] || 'night';
  const SKY = {
    night:{ sky:['#0b0c12','#1d1b22'], fog:'#15141a', fogD:.011, hemi:['#4a4540','#221d18',.7], sun:{ dir:[.3,1,.2], col:'#a9b8de', i:.12 }, exposure:1.2 },
    sunset:{ sky:['#4a3a5c','#F6B37E'], fog:'#E2AA88', fogD:.007, hemi:['#F2C3A0','#6a5a4a',.85], sun:{ dir:[-.7,.3,-.65], col:'#FFB680', i:1.3 }, exposure:1.05, shadow:.45 },
    day:{ sky:['#8DB7DD','#EEF2F2'], fog:'#E3EAEC', fogD:.008, hemi:['#CFE0EE','#7E8F65',.9], sun:{ dir:[.5,.85,.35], col:'#FFF4E2', i:1.5 }, exposure:1, shadow:.5 },
    indoor:{ sky:['#0c0b0a','#1a1612'], fog:'#141210', fogD:.01, hemi:['#4a4038','#2a221c',.8], sun:{ dir:[.2,1,.2], col:'#ffffff', i:.05 }, exposure:1.15 }
  };
  function tiles(g, a, b, size, s=.6, f=7){ for (let i=0;i<W/size;i++) for (let j=0;j<D/size;j++) g.plane(-W/2+i*size+size/2, 0, -D/2+j*size+size/2, size, size, (i+j)%2 ? a : b, { s, f }); }
  function ringTrees(g, kind, n=18, r0){ r0 = r0 || Math.max(W, D)/2 + 5; n = Math.round(n * Math.max(1, W/20)); for (let i=0;i<n;i++){ const a = i/n*6.283 + rnd()*.2, r = r0 + rnd()*7; C.tree(g, Math.cos(a)*r, Math.sin(a)*r, kind, 1.2 + rnd()*.5); } }
  const ENV = {
    ballroom(g, sc){ tiles(g,'#E8E0D3','#D9CEBF',2); C.wallSet(g, sc, W, D, 5.6, { wall:'#EFE8DC', base:'#D2C3A8', decor:C.panelDecor('#E8DDCB','#C8A96B',.05) }); sc.addLight([0,4.8,0],'#FFE2B8',1.1,15); },
    restaurant(g, sc){ g.box(0,0,0,W,.02,D,'#5A3E2B',{ s:.5, f:6 }); C.wallSet(g, sc, W, D, 4.6, { wall:'#3A2A22', base:'#1e1612', decor:(g,w) => { for (let x=-w/2+1.2;x<w/2;x+=2.4) g.glow(x,2.6,.25,.6,[1,.7,.35],.1,2); } }); sc.addLight([0,4,0],'#FFC98A',1.3,14); },
    palace(g, sc){ g.plane(0,0,0,W,D,'#C9BAA0',{ s:.35, f:11 }); C.wallSet(g, sc, W, D, 6.2, { wall:'#D8C8AA', base:'#B9A47F', decor:(g,w,H) => { const n = Math.floor(w/3); for (let i=0;i<n;i++){ const x = -w/2 + (i+.5)*w/n; g.box(x,0,.03,1.6,3.6,.04,'#2a2420'); g.box(x-1.05,0,.06,.32,H,.16,'#E4D6BA'); g.glow(x,3.2,.3,.5,[1,.7,.35],.1,2); } } }); sc.addLight([0,5,0],'#FFD9A6',1.2,16); },
    loft(g, sc){ g.plane(0,0,0,W,D,'#8E8A86',{ s:.5, f:10 }); C.wallSet(g, sc, W, D, 5.2, { wall:'#8C5444', wallS:.05, base:'#3a2a24', decor:(g,w,H) => { for (let y=.3;y<H;y+=.32) g.box(0,y,.012,w,.02,.01,'#7b4839'); } }); sc.addLight([0,4.5,0],'#FFD0A0',1.2,15); },
    garden(g, sc, t){ C.ground(g, 300, '#4E6B3A'); g.plane(0,.004,0,W+2,D+2,'#587A43',{ s:.05, f:5 }); ringTrees(g,'oak'); for (let x=-W/2+1;x<=W/2-1;x+=1.5) g.box(x,0,-D/2-1.4,1.4,1.2,.8,'#3F5A32'); },
    rooftop(g, sc){ const md = Math.max(26, Math.max(W,D)/2 + 8); C.skyline(g,0,0,'z',22,md); C.skyline(g,0,0,'x',18,md); C.water(g,400,'#0d1a26',-14); g.box(0,-14,0,W+1,14,D+1,'#1b1c20'); g.box(0,0,0,W,.04,D,'#7A5C42',{ s:.3, f:6 });
      [-D/2,D/2].forEach(z => { g.box(0,1.03,z,W,.05,.06,'#C8A96B',{ s:.9 }); for (let x=-W/2;x<=W/2;x+=1.6) g.tube([x,0,z],[x,1.05,z],.03,'#C8A96B',{ s:.9 }); }); [-W/2,W/2].forEach(x => g.box(x,1.03,0,.06,.05,D,'#C8A96B',{ s:.9 })); },
    beach(g, sc){ C.water(g, 420, '#2F5970', -.45); const hw = W/2 + 4, hd = D/2; g.loft([[-hw,-hd-3],[hw,-hd-3],[hw+2,hd+4],[-hw-2,hd+4]],-1,[[-hw,-hd-2],[hw,-hd-2],[hw+1,hd+4],[-hw-1,hd+4]],.02,'#E8D3AE',{ s:.1, f:8 }); g.loft([[-80,hd+4],[80,hd+4],[80,90],[-80,90]],-1,[[-80,hd+4],[80,hd+4],[80,90],[-80,90]],.02,'#E8D3AE',{ s:.1, f:8 }); [[-hw+1,-hd],[hw-1,-hd+1],[-hw,4],[hw,6],[-hw+2,hd+2]].forEach(([x,z]) => C.tree(g,x,z,'palm',1.3)); },
    mountain(g, sc){ C.ground(g,300,'#5E7347'); C.mountains(g,['#4f5d6b','#5a6876','#46525e'],Math.max(75, W*2.2),16); ringTrees(g,'pine',22); },
    vineyard(g, sc){ C.ground(g,300,'#6B7A45'); C.mountains(g,['#6d7a5a','#7a8664','#5e6a4c'],Math.max(80, W*2.2),12); for (let r=0;r<10;r++){ const z = -D/2 - 4 - r*1.6; g.box(0,0,z,W*2,.9,.35,'#4E6B3A'); for (let x=-W;x<=W;x+=2.5) g.box(x,0,z,.06,1.1,.06,'#6b5845'); } ringTrees(g,'olive',10); },
    villa(g, sc){ C.ground(g,300,'#5E7A45'); g.plane(0,.004,0,W+2,D+2,'#6E8A52',{ f:5 }); g.box(0,0,-D/2-3.5,W+2,6,3,'#EDE6DA',{ s:.2 }); for (let x=-W/2+1;x<=W/2-1;x+=2.2) for (let y of [1.2,3.8]) { g.box(x,y,-D/2-1.98,1.1,1.5,.04,'#2a2a2e',{ s:1 }); g.glow(x,y+.7,-D/2-1.9,.9,[1,.75,.4],.1,1); } g.box(0,-.4,D/2+4.5,10.6,.4,4.6,'#E8E0D3',{ s:.3, f:11 }); g.plane(0,.02,D/2+4.5,10,4,'#3E8FA8',{ s:1, f:1 },30,12); [[-W/2-2,-6],[W/2+2,-6],[-W/2-2,6],[W/2+2,7]].forEach(([x,z]) => C.tree(g,x,z,'palm',1.3)); },
    yacht(g, sc){ yachtEnv(g, sc); },
    tent(g, sc){ ENV.mountain(g, sc); g.plane(0,.004,0,W+2,D+2,'#6E8A52',{ f:5 }); tentCanopy(g); }
  };
  function yachtEnv(g, sc){
    C.water(g, 420, '#2E4C66', -1.3);
    C.mountains(g, ['#4a3b4c','#53424f','#3e3446'], Math.max(95, W*3), 10);
    for (let i=0;i<220;i++){ const a = 1.6 + rnd()*1.6, r = Math.max(70, W*2.3) + rnd()*12; g.glow(Math.cos(a)*r, rnd()*5, Math.sin(a)*r, .55, [1,.8,.5], .4, 1+rnd()); }
    const hw = W/2, hd = D/2, stern = hw + 6.5, bow = hw + Math.max(5, W*.3);
    const hull = [[-stern,-hd-.9],[hw+1,-hd-.9],[bow*.86+hw*.14,-hd*.45],[bow,0],[bow*.86+hw*.14,hd*.45],[hw+1,hd+.9],[-stern,hd+.9]];
    const sc_ = k => hull.map(([x,z]) => [x*k, z*k]);
    g.loft(sc_(.88), -2.8, hull, -.03, '#F7F6F3', { s:.85 }, false);
    g.loft(sc_(1.004), -1.05, sc_(1.004), -.8, '#1F3A57', { s:.7 }, false);
    g.loft(hull, -.03, hull, 0, '#B08A5E', { s:.35, f:6 });
    for (let i=0;i<hull.length;i++){ const a = hull[i], b = hull[(i+1)%hull.length]; g.tube([a[0],1.05,a[1]],[b[0],1.05,b[1]],.035,'#E6E6E6',{ s:1 }); const L = Math.hypot(b[0]-a[0], b[1]-a[1]); for (let k=0;k<L;k+=1.6){ const t = k/L; g.tube([a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,1.05,a[1]+(b[1]-a[1])*t],.025,'#E6E6E6',{ s:1 }); } }
    g.box(-hw-3.3,0,0,5.2,2.4,D*.7,'#F7F6F3',{ s:.6 }); g.box(-hw-3.3,1.2,D*.35+.01,4.8,.7,.02,'#1c2a38',{ s:1 }); g.box(-hw-3.3,1.2,-D*.35-.01,4.8,.7,.02,'#1c2a38',{ s:1 });
    g.box(-hw-3.6,2.4,0,4.4,.1,D*.6,'#F7F6F3',{ s:.5 }); g.box(-hw-4.6,2.5,0,1.2,1.4,.12,'#E6E6E6',{ s:.8 }); g.tube([-hw-3.6,2.5,0],[-hw-3.6,5.5,0],.06,'#dcdcdc',{ s:1 });
    for (let i=0;i<8;i++){ g.glow(-hw-1.2 + rnd()*.1, .9 + rnd()*1.2, (rnd()-.5)*D*.6, .5, [1,.78,.45], .2, 1); }
  }
  function tentCanopy(g){
    const sx = W/20, sz = D/16;
    const peaks = [[-5*sx,0],[5*sx,0]], H = 7 + (sx-1)*2, E = 3.2, edge = [[-10.5,-8.5],[-5,-9],[0,-8.6],[5,-9],[10.5,-8.5],[11,0],[10.5,8.5],[5,9],[0,8.6],[-5,9],[-10.5,8.5],[-11,0]].map(([x,z]) => [x*sx, z*sz]);
    peaks.forEach(([x,z]) => g.tube([x,0,z],[x,H,z],.1,'#8a6b4a')); edge.forEach(([x,z]) => g.tube([x,0,z],[x,E,z],.07,'#8a6b4a'));
    for (let i=0;i<edge.length;i++){ const a = edge[i], b = edge[(i+1)%edge.length], p = (a[0]+b[0])/2 < 0 ? peaks[0] : peaks[1]; g.quad([a[0],E,a[1]],[b[0],E,b[1]],[p[0],H,p[1]],[p[0],H,p[1]],'#F4EEE3',{ s:.15, e:.12 }); }
    g.quad([peaks[0][0],H,0],[peaks[1][0],H,0],[0,E,8.6*sz],[0,E,8.6*sz],'#F4EEE3',{ s:.15, e:.12 }); g.quad([peaks[0][0],H,0],[peaks[1][0],H,0],[0,E,-8.6*sz],[0,E,-8.6*sz],'#F4EEE3',{ s:.15, e:.12 });
  }
  function photoDef(v, ctx){
    const t = ({ Sunset:'sunset', Evening:'night', 'Late night':'night' })[v.timeOfDay] || 'day';
    const L = { day:{ hemi:['#E6ECF2','#9A8F7E',1.0], sun:{ dir:[.45,.85,.35], col:'#FFF4E2', i:1.25 }, exposure:1 }, sunset:{ hemi:['#F2CFB4','#7a6a5a',.95], sun:{ dir:[-.6,.45,-.5], col:'#FFB680', i:1.15 }, exposure:1 }, night:{ hemi:['#5a5650','#2a241e',.9], sun:{ dir:[.3,1,.2], col:'#FFD9A6', i:.35 }, exposure:1.2 } }[t];
    const sizeName = Object.keys(SIZES).find(k => SIZES[k][0] === W) || '';
    return { venue:'photo', time:t, indoor:false, label:`Your photo, ${sizeName.split(' (')[0].toLowerCase()}`, sig:['photo', t, W, D, (v.lights||[]).join(), ctx.cols.join()].join('|'),
      def:{ ...L, sky:['#808080','#808080'], fog:'#000000', fogD:0, photo:true, shadow:.5, shadowAmb:.25, catchK:.6, clouds:0, sunVis:0, ledA:GL3D.hexD(ctx.cols[0] || '#FF8A3D'), ledB:GL3D.hexD(ctx.cols[1] || '#C9A0FF'),
        shadowBox:{ cx:0, cz:0, half:Math.max(W, D)/2 + 4 }, cam:{ target:[0,0,0], r:22, phi:.4, theta:Math.PI/2, fov:1 },
        build(g, sc){
          sc.dynamic(g => g.plane(0,0,0,W*4,D*4,'#000000',{ f:13 },1,1), () => mdl({}), { catcher:true, noShadow:true });
          sc.dynamic(g => { const c = '#C8A96B'; for (let x=-W/2;x<=W/2+.01;x+=2) g.box(x,.01,0,.03,.005,D,c,{ e:1.5 }); for (let z=-D/2;z<=D/2+.01;z+=2) g.box(0,.01,z,W,.005,.03,c,{ e:1.5 }); }, () => ST._grid ? mdl({}) : null, { additive:true, noShadow:true });
          if ((v.lights||[]).includes('String / fairy lights')) for (let i=0;i<=Math.round(D/2.6);i++) C.stringLights(g, [-W/2, 4.2, -D/2 + i*2.6], [W/2, 4.2, -D/2 + i*2.6 + 1.3], .7, Math.round(W*1.1));
        } } };
  }
  function envDef(v, ctx){
    if (v._photo) return photoDef(v, ctx);
    const venue = venueOf(v), indoor = INDOOR.has(venue), time = indoor ? 'indoor' : timeOf(v), L = v.lights || [];
    const sizeName = Object.keys(SIZES).find(k => SIZES[k][0] === W) || '';
    const sky = SKY[time];
    const ledA = GL3D.hexD(ctx.cols[0] && ctx.cols[0] !== '#FFFFFF' ? ctx.cols[0] : '#FF8A3D'), ledB = GL3D.hexD(ctx.cols[1] || '#C9A0FF');
    return { venue, time, indoor, label:`${VENUE_LABEL[venue]}, ${indoor ? 'indoors' : ({ day:'day', sunset:'sunset', night:'night' })[time]}, ${sizeName.split(' (')[0].toLowerCase()}`,
      sig:[venue, time, W, D, L.join(), (v.extrasDecor||[]).join(), (v.technical||[]).includes('Tent / marquee'), ctx.cols.join()].join('|'),
      def:{ ...sky, ledA, ledB, shadowBox:{ cx:0, cz:0, half:Math.max(W, D)/2 + 4 }, shadowAmb: time === 'day' ? .3 : time === 'sunset' ? .35 : .5, cam:{ target:[0,.5,0], r:22, phi:.62, theta:.9, fov:.72 },
        build(g, sc){
          ENV[venue](g, sc, time);
          if (time === 'night' && !indoor) C.stars(g, 160);
          if (!indoor && venue !== 'tent' && (v.technical||[]).includes('Tent / marquee')) tentCanopy(g);
          const h = indoor ? 4.6 : 4.2;
          if (L.includes('String / fairy lights')){
            if (!indoor) [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2],[0,-D/2],[0,D/2]].forEach(([x,z]) => g.tube([x,0,z],[x,h+.1,z],.04,'#2a2622'));
            const ns = Math.round(D/2.6); for (let i=0;i<=ns;i++) C.stringLights(g, [-W/2, h, -D/2 + i*D/ns], [W/2, h, -D/2 + Math.min(D, (i+.5)*D/ns)], .7, Math.round(W*1.1));
            sc.addLight([0,h-.5,0],'#FFC98A',1.2,14);
          }
          const up = L.includes('Colored uplighting') ? (ctx.cols[0] && ctx.cols[0] !== '#FFFFFF' ? GL3D.hexD(ctx.cols[0]) : [.7,.4,1]) : L.includes('Warm uplighting') ? [1,.62,.3] : null;
          if (up){ for (let x=-W/2+1.2;x<W/2;x+=2.4) [-D/2+.3, D/2-.3].forEach(z => { g.glow(x,.4,z,1.4,up.map(c=>c*.5),.2,1); g.glow(x,2.2,z,2.2,up.map(c=>c*.18)); }); for (let z=-D/2+1.4;z<D/2;z+=2.4) [-W/2+.3, W/2-.3].forEach(x => { g.glow(x,.4,z,1.4,up.map(c=>c*.5),.2,1); g.glow(x,2.2,z,2.2,up.map(c=>c*.18)); });
            const hx = '#' + up.map(c => Math.round(Math.min(1,c)*255).toString(16).padStart(2,'0')).join(''); sc.addLight([-W/2+1,2,0], hx, 1.4, 9); sc.addLight([W/2-1,2,0], hx, 1.4, 9); }
          if (L.includes('Spotlights')) [-4,0,4].forEach((x,i) => sc.dynamic(g => g.cyl(0,-6,0,1.1,.06,6,'#2a2416',{ e:1, s:0 },16,false), t => mdl({ x, y:6.2, z:-1, rz:Math.sin(t*.5+i*2)*.3, rx:.2+Math.sin(t*.4+i)*.2 }), { additive:true }));
          if ((v.extrasDecor||[]).some(x => /Ceiling|Hanging/.test(x))) for (let x=-6;x<=6;x+=3) for (let z=-4;z<=4;z+=4){ g.tube([x,h+.8,z],[x,h-.6,z],.008,'#9aa38c'); C.flowers(g, x, h-.9, z, .45, ctx.flowers.concat(['#6B8A5E']), 14); }
        } } };
  }

  /* ---------- item catalog (front faces +z) ---------- */
  const T = (g, o, fn) => g.at(o, fn);
  const person = (g, sc, x, z, o={}) => C.person(g, sc, x, z, o);
  const ITEMS = {
    round:{ name:'Round table', icon:'users', cat:'tables', r:1.65, build:(g,sc,p,c) => C.roundTable(g, 0, 0, { cloth:c.bare ? '#6b5139' : c.linen, chair:c.chair, flowers:c.flowers, center:c.center === 'mixed' ? pick(['tall','low']) : c.center, metal:c.metal }) },
    long:{ name:'Long table (10)', icon:'users', cat:'tables', r:2.3, build:(g,sc,p,c) => C.longTable(g, 0, 0, 3.6, 0, { cloth:c.linen, wood:c.bare ? '#7A5C42' : null, chair:c.chair, flowers:c.flowers }) },
    imperial:{ name:'Imperial table (20)', icon:'users', cat:'tables', r:3.9, build:(g,sc,p,c) => C.longTable(g, 0, 0, 7.4, 0, { cloth:c.linen, wood:c.bare ? '#7A5C42' : null, chair:c.chair, flowers:c.flowers, candelabras:c.center === 'candelabra' ? 3 : 0, tall:c.center === 'tall' }) },
    cocktail:{ name:'Cocktail table', icon:'glass', cat:'tables', r:.9, build:(g,sc,p,c) => { g.tube([0,0,0],[0,1.05,0],.04,'#1b1a19',{ s:.8 }); g.cyl(0,1.05,0,.38,.38,.04,c.linen,{ s:.3 }); C.flowers(g,0,1.12,0,.12,c.flowers,4); C.candle(g,.15,1.09,.1); g.shadow(0,0,.5,.4); } },
    sweetheart:{ name:'Sweetheart table', icon:'heart', cat:'tables', r:1.3, build:(g,sc,p,c) => { g.box(0,0,0,1.8,.76,.8,c.linen,{ s:.1 }); C.chair(g,-.4,-.6,Math.PI,c.chair); C.chair(g,.4,-.6,Math.PI,c.chair); C.flowers(g,0,.5,.45,.35,c.flowers,Math.round(16*c.lvl)); C.candle(g,-.5,.77,0,.3); C.candle(g,.5,.77,0,.3); g.shadow(0,0,1,.4,1.2,.7); } },
    kidstable:{ name:'Kids’ table', icon:'gift', cat:'tables', r:1.3, build:(g,sc,p,c) => { g.box(0,0,0,1.6,.5,.8,'#FFFFFF',{ s:.1 }); [[-.5,-.65],[0,-.65],[.5,-.65],[-.5,.65],[0,.65],[.5,.65]].forEach(([x,z],i) => g.cyl(x,0,z,.16,.16,.3,['#F3C6CF','#AFCBE3','#F7E3A1','#B9DDB5'][i%4],{ s:.3 })); C.balloon(g,.7,1.4,0,.2,'#F3C6CF',{ string:.5 }); g.shadow(0,0,1,.4,1.1,.8); } },
    rows:{ name:'Rows of chairs', icon:'users', cat:'tables', r:2.6, build:(g,sc,p,c) => { for (let r=0;r<4;r++) for (let k=0;k<6;k++){ if (k===3) continue; C.chair(g, -2.4 + k*.95, -1.6 + r*1.05, 0, c.chair); } } },
    sofa:{ name:'Lounge set', icon:'seat', cat:'tables', r:2.1, build:(g,sc,p,c) => { C.sofa(g,0,-1.1,Math.PI,2.6,lighten(c.c1,.2) === '#ffffff' ? '#E7E0D5' : lighten(c.c1,.3)); C.sofa(g,-1.5,.2,Math.PI/2,1.8,'#E7E0D5'); C.sofa(g,1.5,.2,-Math.PI/2,1.8,'#E7E0D5'); g.box(0,0,0,1.1,.38,.7,'#C8A96B',{ s:.8 }); C.candle(g,0,.38,0,.15); C.flowers(g,.25,.4,0,.12,c.flowers,4); } },
    stage:{ name:'Stage', icon:'mic', cat:'stage', r:3.2, build:(g,sc,p,c) => { C.stage(g,0,0,6,3,.6,'#1a1918',{ led:c.metal }); g.box(0,.6,-1.45,6,.04,.08,c.metal,{ s:.9 }); } },
    kosha:{ name:'Kosha (couple’s stage)', icon:'heart', cat:'stage', r:3.4, build:(g,sc,p,c) => { C.stage(g,0,0,6.4,2.6,.45,'#EFE8DC',{ s:.5 }); T(g,{ y:.45 }, g => { C.floralArch(g,0,-.9,0,4.2,3.2,c.flowers.concat(['#DDE5D3'])); C.sofa(g,0,-.55,Math.PI,2.2,'#F4EFE6',{ pillow:lighten(c.c2,.3) }); }); for (let i=0;i<Math.round(6*c.lvl);i++) C.flowers(g,-3+rnd()*6,.45,1.1+rnd()*.15,.25,c.flowers,5); C.candle(g,-2.8,.45,1,.35); C.candle(g,2.8,.45,1,.35); sc.addLight([0,2.5,1.2],'#FFE2B8',1.2,6); } },
    dj:{ name:'DJ booth', icon:'music', cat:'stage', r:1.9, build:(g,sc,p,c) => { T(g,{ ry:Math.PI }, g => C.djBooth(g, sc, 0, 0, 0, { led:c.metal })); person(g, sc, 0, -.75, { top:'#151515', dress:false, ry:0, dance:true }); } },
    band:{ name:'Live band', icon:'mic', cat:'stage', r:2.8, build:(g,sc,p,c) => { C.stage(g,0,0,5,2.6,.5,'#151414',{ led:c.metal }); T(g,{ y:.5 }, g => { [-.4,0,.4].forEach((x,i) => g.cyl(-1.6+x,0,-.6,.22,.22,.28,'#8a1f1f',{ s:.7 })); g.cyl(-1.6,0,-.2,.32,.32,.3,'#e8e8e8',{ s:.6 }); [[-2,.65],[-1.2,.75]].forEach(([x,h]) => { g.tube([x,0,-.8],[x,h+.5,-.8],.01,'#999'); g.cyl(x,h+.5,-.8,.18,.18,.01,'#C8A96B',{ s:1 }); });
      g.box(1.4,.8,-.3,1.2,.08,.35,'#111',{ s:.8 }); g.box(1.4,.88,-.33,1.1,.01,.12,'#f5f5f5'); [[-.3,.6],[.5,.6]].forEach(([x]) => { g.tube([x,0,.6],[x,1.5,.6],.012,'#222'); g.sphere(x,1.52,.6,.04,'#333',{ s:1 },6); }); });
      T(g,{ y:.5 }, g => { person(g, sc, -1.6, .2, { top:'#1d1d1d', dress:false, ry:0, dance:true }); person(g, sc, 1.4, .3, { top:'#2b2a33', dress:false, ry:0 }); person(g, sc, .1, .9, { top:pick(['#C8A96B','#6B1E2A','#F4EFE6']), dress:true, ry:0, dance:true }); }); sc.addLight([0,3,1.5],'#FFD9A6',1.4,6); } },
    speakers:{ name:'Sound system', icon:'music', cat:'stage', r:1.4, build:(g) => { [-.8,.8].forEach(x => { g.box(x,0,0,.55,1.8,.5,'#111',{ s:.4 }); g.cyl(x,1.2,.26,.18,.18,.02,'#2a2a2a',{ s:.8 }); g.cyl(x,.55,.26,.21,.21,.02,'#2a2a2a',{ s:.8 }); g.shadow(x,0,.45,.45); }); } },
    ledscreen:{ name:'LED screen', icon:'image', cat:'screens', r:3.3, build:(g,sc) => { g.box(0,0,0,.3,1,.3,'#222'); [-3.1,3.1].forEach(x => g.box(x,0,0,.25,4.8,.25,'#6c717a',{ s:.8 })); g.box(0,1,0,6.2,3.6,.16,'#08090c',{ s:.5 }); g.box(0,1.1,.09,6,3.4,.02,'#ffffff',{ e:.9, f:2 }); g.box(0,4.8,0,6.6,.25,.25,'#6c717a',{ s:.8 }); g.glow(0,2.8,.6,6,[.16,.14,.12]); sc.addLight([0,2.8,2],'#d8c8ff',1,6); g.shadow(0,0,1,.3,3.2,.5); } },
    ledwall:{ name:'LED panel', icon:'image', cat:'screens', r:.9, build:(g) => { g.box(0,0,0,.6,.15,.5,'#111'); g.box(0,.15,0,1.4,2.8,.12,'#08090c',{ s:.5 }); g.box(0,.22,.07,1.3,2.66,.02,'#ffffff',{ e:.8, f:2 }); g.shadow(0,0,.8,.35,1,.5); } },
    truss:{ name:'Moving lights truss', icon:'bulb', cat:'screens', r:3.4, build:(g,sc) => { g.box(0,5,0,6.6,.25,.25,'#6c717a',{ s:.8 }); [-3.3,3.3].forEach(x => { g.box(x,0,0,.25,5.2,.25,'#6c717a',{ s:.8 }); g.shadow(x,0,.3,.4); }); [-2.2,-.7,.7,2.2].forEach((x,i) => { g.box(x,4.65,0,.3,.35,.3,'#111',{ s:.6 }); g.glow(x,4.65,0,.4,[1,.95,.85],.3,4); sc.dynamic(g => g.cyl(0,-5.5,0,1.1,.06,5.5,'#2a2416',{ e:1, s:0 },16,false), t => mdl({ x, y:4.65, z:0, rz:Math.sin(t*.9+i*1.3)*.4, rx:-.3+Math.sin(t*.7+i*2)*.3 }), { additive:true }); }); } },
    dancefloor:{ name:'Dance floor', icon:'sparkle', cat:'stage', r:3.3, floor:true, build:(g,sc,p,c) => { const t = c.dfType, w = 6, d = 5;
      if (t === 'LED') { for (let i=0;i<10;i++) for (let j=0;j<8;j++) g.box(-w/2+i*.6+.3, 0, -d/2+j*.62+.31, .59, .035, .61, '#ffffff', { f:4 }); }
      else { const a = { 'Glossy black':['#121110','#1c1a18'], 'White / mirror':['#F3F1EC','#E4E1DA'], 'Wooden':['#8B6A4C','#7A5C42'], 'Custom printed':[lighten(c.c1,.1), lighten(c.c1,.35)], 'Venue default':['#2a2826','#33302d'] }[t] || ['#121110','#1c1a18'];
        C.danceFloor(g, 0, 0, w, d, a[0], a[1], { tile:1, border:c.metal }); if (t === 'Custom printed') { for (let i=0;i<24;i++){ const an = i/24*6.283; g.box(Math.cos(an)*1.3,.04,Math.sin(an)*1.3,.18,.005,.18,c.metal,{ s:.9, ry:an }); } } } } },
    flowerwall:{ name:'Flower wall', icon:'flower', cat:'decor', r:2.4, build:(g,sc,p,c) => { T(g,{ ry:Math.PI }, g => C.flowerWall(g,0,0,0,4.4,2.8,c.flowers)); g.shadow(0,0,1,.3,2.4,.4); } },
    arch:{ name:'Floral arch', icon:'flower', cat:'decor', r:2.2, build:(g,sc,p,c) => { C.floralArch(g,0,0,0,3.6,3.2,c.flowers.concat(['#DDE5D3'])); for (let i=0;i<Math.round(8*c.lvl);i++) C.flowers(g,(rnd()<.5?-1:1)*(1.6+rnd()*.5),0,(rnd()-.5)*.6,.3,c.flowers,4); } },
    balloonarch:{ name:'Balloon arch', icon:'sparkle', cat:'decor', r:2.4, build:(g,sc,p,c) => C.balloonGarland(g, C.arcPts(0,0,4,2.8,0,.2,16), c.cols.length ? c.cols.concat(['#FFFFFF']) : ['#F2DCD3','#E7C9BE','#FFFFFF','#C8A96B'], 7) },
    balloons:{ name:'Balloon cluster', icon:'sparkle', cat:'decor', r:.9, build:(g,sc,p,c) => { for (let i=0;i<7;i++){ const dx=(i%3-1)*.3, dz=((i+1)%3-1)*.3, y=2+(i%4)*.35; C.balloon(g,dx,y,dz,.28,pick(c.cols.length ? c.cols.concat(['#FFFFFF']) : ['#E7C9BE','#C8A96B','#FFFFFF']),{ string:0, chrome:rnd()<.2 }); } g.box(0,0,0,.2,.12,.2,'#C8A96B',{ s:.9 }); } },
    neon:{ name:'Neon sign', icon:'heart', cat:'decor', r:1.3, build:(g,sc,p,c) => { g.box(0,0,0,.1,1.9,.1,'#222'); g.box(0,1.9,0,2.2,1.5,.06,'#1e3a2a',{ s:.2 }); const col = c.cols[0] && c.cols[0] !== '#FFFFFF' ? GL3D.hexD(c.cols[0]) : [1,.45,.6]; for (let i=0;i<46;i++){ const t = i/46*6.283, hx = 16*Math.pow(Math.sin(t),3)/16*.5, hy = (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16*.5; g.glow(hx,2.65+hy,.06,.16,col,.05,3); } g.glow(0,2.6,.2,1.6,col.map(v=>v*.25)); sc.addLight([0,2.6,.8], '#FF9AB0', .8, 3.5); } },
    drape:{ name:'Draped backdrop', icon:'layers', cat:'decor', r:2.4, build:(g,sc,p,c) => { g.box(0,3.6,0,4.6,.08,.08,'#C8A96B',{ s:.9 }); for (let x=-2.2;x<=2.2;x+=.18) g.cyl(x,0,0,.1,.1,3.6,lighten(c.c1,.15),{ s:.25 },8,false); g.glow(0,2,.4,2.4,[.3,.24,.16]); } },
    welcome:{ name:'Welcome sign', icon:'clipboard', cat:'decor', r:.7, build:(g,sc,p,c) => { g.tube([-.3,0,-.2],[0,1.7,0],.02,'#C8A96B',{ s:.9 }); g.tube([.3,0,-.2],[0,1.7,0],.02,'#C8A96B',{ s:.9 }); g.tube([0,0,.4],[0,1.6,0],.02,'#C8A96B'); T(g,{ y:.7, z:.05, rx:-.12 }, g => { g.box(0,0,0,.8,1.05,.03,'#F7F3EC',{ s:.4 }); g.box(0,.5,.02,.5,.04,.01,c.metal,{ s:1 }); g.box(0,.15,.02,.6,.02,.01,'#555'); g.box(0,.05,.02,.45,.02,.01,'#555'); }); C.flowers(g,0,.7,.15,.18,c.flowers,5); } },
    olive:{ name:'Olive tree', icon:'flower', cat:'decor', r:.9, build:(g) => C.planter(g,0,0,1.1) },
    candles:{ name:'Candles & lanterns', icon:'bulb', cat:'decor', r:.8, build:(g) => { C.lantern(g,0,0,1.3); C.lantern(g,.45,.2,.9); [[-.35,.2,.2],[-.2,.45,.35],[.3,-.35,.25]].forEach(([x,z,h]) => { g.cyl(x,0,z,.07,.07,h,'#F6EFE3',{ e:.25 }); g.glow(x,h+.04,z,.12,[1,.72,.38],.35,7); }); } },
    chandelier:{ name:'Chandelier', icon:'sparkle', cat:'screens', r:1, hang:true, build:(g,sc) => C.chandelier(g, sc, 0, 3.9, 0, 1, { ceil:6, i:1.6, range:6.5 }) },
    uplight:{ name:'Uplight', icon:'bulb', cat:'screens', r:.5, build:(g,sc,p,c) => { const col = c.cols[0] && c.cols[0] !== '#FFFFFF' ? c.cols[0] : '#FF9A50'; g.cyl(0,0,0,.14,.12,.18,'#111',{ s:.6 }); g.glow(0,.25,0,.5,GL3D.hexD(col),.1,1); sc.dynamic(g => g.cyl(0,0,0,.12,.9,3.4,'#201812',{ e:1, s:0 },14,false), t => mdl({}), { additive:true }); sc.addLight([0,1.5,.3], col, 1, 4); } },
    stringcanopy:{ name:'String light canopy', icon:'bulb', cat:'screens', r:3, build:(g,sc) => { const P = [[-3,-3],[3,-3],[3,3],[-3,3]]; P.forEach(([x,z]) => { g.tube([x,0,z],[x,3.4,z],.04,'#2a2622'); g.shadow(x,z,.15,.4); }); for (let i=0;i<4;i++){ const a = P[i], b = P[(i+1)%4]; C.stringLights(g,[a[0],3.4,a[1]],[b[0],3.4,b[1]],.4,12); } C.stringLights(g,[-3,3.4,-3],[3,3.4,3],.6,14); C.stringLights(g,[3,3.4,-3],[-3,3.4,3],.6,14); sc.addLight([0,3,0],'#FFC98A',1,6); } },
    bar:{ name:'Bar', icon:'glass', cat:'food', r:2.6, build:(g,sc,p,c) => { T(g,{ ry:Math.PI }, g => C.bar(g, sc, 0, 0, 0, 3.6, { back:c.metal })); person(g, sc, 0, -.95, { top:'#111', dress:false, ry:0 }); } },
    buffet:{ name:'Buffet', icon:'utensils', cat:'food', r:2.3, build:(g,sc,p,c) => { g.box(0,0,0,4,.85,.9,c.linen,{ s:.1 }); for (let i=0;i<5;i++){ const x = -1.6 + i*.8; g.cyl(x,.85,0,.26,.24,.12,'#C9CCD1',{ s:1 }); g.sphere(x,.97,0,.22,'#D7DADF',{ s:1 },10,.55); g.glow(x,.86,.3,.18,[1,.6,.3],.3,6); } C.flowers(g,0,.95,-.3,.2,c.flowers,5); g.shadow(0,0,1,.4,2.3,.7); person(g, sc, -1, -.9, { top:'#F4EFE6', dress:false, ry:0 }); } },
    station:{ name:'Live food station', icon:'utensils', cat:'food', r:1.6, build:(g,sc,p,c) => { g.box(0,0,0,2.2,.95,.8,'#2a2522',{ s:.5 }); g.box(0,.95,0,2.3,.05,.9,'#E9E4DC',{ s:.8 }); g.box(0,.95,-.25,.9,.08,.4,'#555',{ s:.9 }); g.glow(0,1.05,-.25,.6,[1,.45,.15],.5,9); g.tube([0,0,-.7],[0,2.4,-.7],.03,'#222'); g.box(0,2.2,-.7,1.4,.4,.05,'#111'); g.box(0,2.25,-.67,1.1,.12,.01,c.metal,{ e:.8 }); person(g, sc, 0, -.75, { top:'#FFFFFF', dress:false, ry:0 }); g.shadow(0,0,1,.4,1.3,.6); } },
    grill:{ name:'BBQ grill', icon:'utensils', cat:'food', r:1.2, build:(g,sc) => { g.box(0,0,0,1.6,.85,.7,'#2a2a2a',{ s:.6 }); for (let i=0;i<8;i++) g.glow(-.6+i*.17,.95,(rnd()-.5)*.4,.25,[1,.4,.1],.6,10); sc.addLight([0,1.4,0],'#FF7A30',1,3,.3); person(g, sc, 0, -.8, { top:'#ffffff', dress:false, ry:0 }); } },
    foodtruck:{ name:'Food truck', icon:'car', cat:'food', r:2.6, build:(g,sc,p,c) => { g.box(0,.35,0,4.2,2.3,2,lighten(c.c1,.1) === '#ffffff' ? '#E8D5A8' : c.c1,{ s:.5 }); g.box(1.2,.9,1.01,1.8,.9,.02,'#2a2a2e',{ s:1 }); g.glow(1.2,1.4,1.2,1.4,[.5,.38,.2]); g.box(1.2,1.85,1.2,2,.06,.5,'#C8A96B',{ s:.8 }); [[-1.4,1],[1.4,1],[-1.4,-1],[1.4,-1]].forEach(([x,z]) => T(g,{ x, y:.35, z, rx:Math.PI/2 }, g => g.cyl(0,-.12,0,.35,.35,.24,'#111',{ s:.3 }))); g.shadow(0,0,1,.4,2.3,1.2); } },
    cake:{ name:'Cake table', icon:'cake', cat:'food', r:1, build:(g,sc,p,c) => { g.cyl(0,0,0,.6,.6,.78,c.linen,{ s:.1 },22); C.cake(g,0,.78,0,Math.min(5,c.tiers),'#FBF7F0',c.flowers); g.shadow(0,0,.7,.4); sc.addLight([0,2,.6],'#FFE2B8',.6,3); } },
    sweets:{ name:'Sweets table', icon:'cake', cat:'food', r:1.7, build:(g,sc,p,c) => { g.box(0,0,0,2.8,.85,.8,c.linen,{ s:.1 }); [-1,-.4,.4,1].forEach((x,i) => { g.cyl(x,.85,0,.04,.04,.18+i%2*.15,c.metal,{ s:1 }); g.cyl(x,1.03+i%2*.15,0,.22,.22,.02,'#ffffff',{ s:.6 }); for (let k=0;k<6;k++) g.sphere(x+(rnd()-.5)*.3,1.08+i%2*.15,(rnd()-.5)*.3,.045,pick(c.flowers.concat(['#C9A27E','#6B3E2A'])),{ s:.3 },6,.6); }); C.flowers(g,0,.9,-.25,.2,c.flowers,6); g.shadow(0,0,1,.4,1.6,.6); } },
    fountain:{ name:'Chocolate fountain', icon:'cake', cat:'food', r:.9, build:(g) => { g.cyl(0,0,0,.45,.45,.78,'#F3EEE5',{ s:.1 }); [.32,.24,.16].forEach((r,i) => g.cyl(0,.78+i*.22,0,r,r*.8,.06,'#5a3a24',{ s:.9 })); g.cyl(0,.78,0,.05,.05,.7,'#4a2e1c',{ s:.9 }); g.shadow(0,0,.6,.4); } },
    coffee:{ name:'Coffee corner', icon:'utensils', cat:'food', r:1.3, build:(g,sc) => { g.box(0,0,0,1.8,.9,.7,'#6b5139',{ s:.3 }); g.box(0,.9,0,1.9,.04,.8,'#E9E4DC',{ s:.8 }); [-.5,0,.5].forEach(x => { g.cyl(x,.94,0,.13,.09,.28,'#B87333',{ s:1 }); g.cyl(x,1.22,0,.03,.08,.12,'#B87333',{ s:1 }); g.tube([x+.1,1.05,0],[x+.25,1.2,0],.02,'#B87333',{ s:1 }); }); g.glow(0,1.4,.2,.9,[.4,.28,.15]); g.shadow(0,0,1,.4,1,.5); } },
    photobooth:{ name:'Photo booth', icon:'camera', cat:'fun', r:1.7, build:(g,sc,p,c) => { g.box(0,0,0,2.6,2.6,.12,lighten(c.c1,.1),{ s:.3 }); for (let i=0;i<60;i++) g.sphere(-1.2+rnd()*2.4,.2+rnd()*2.3,.08,.07,pick(c.flowers),{ s:.2 },6); const fr = [[-1.3,0],[1.3,0],[1.3,2.6],[-1.3,2.6]]; for (let i=0;i<4;i++){ const a = fr[i], b = fr[(i+1)%4]; g.tube([a[0],a[1],.12],[b[0],b[1],.12],.05,c.metal,{ s:1 }); }
      T(g,{ z:2.3 }, g => { [[-.25,.2],[.25,.2],[0,-.3]].forEach(([x,z]) => g.tube([x,0,z],[0,1.4,0],.015,'#222')); g.box(0,1.4,0,.3,.22,.18,'#111',{ s:.9 }); g.cyl(0,1.75,-.05,.3,.3,.03,'#fff',{ e:1.2 }); g.glow(0,1.6,0,.6,[.9,.9,1],.2,3); }); person(g, sc, -.3, .6, { dance:true }); person(g, sc, .35, .55, { dance:true, dress:true }); } },
    booth360:{ name:'360 video booth', icon:'video', cat:'fun', r:1.5, build:(g,sc,p,c) => { g.cyl(0,0,0,.95,.95,.22,'#111',{ s:.8 }); g.cyl(0,.22,0,.93,.93,.01,c.metal,{ e:.6 }); sc.dynamic(g => { g.tube([0,.25,0],[0,.6,0],.05,'#222'); g.box(.6,.55,0,1.4,.06,.08,'#222',{ s:.6 }); g.tube([1.25,.6,0],[1.25,1.9,0],.03,'#222'); g.box(1.25,1.9,0,.12,.2,.08,'#111'); g.glow(1.25,1.95,-.1,.3,[1,1,1],.4,9); }, t => mdl({ ry:t*2.4 })); person(g, sc, 0, 0, { dance:true }); person(g, sc, .3, .15, { dance:true, dress:true }); } },
    argileh:{ name:'Argileh lounge', icon:'seat', cat:'fun', r:1.7, build:(g,sc,p,c) => { g.box(0,0,0,2.6,.05,2,'#7A2E2A',{ s:.1 }); [[-1,-.7],[1,-.7],[-1,.7],[1,.7]].forEach(([x,z]) => g.box(x,.05,z,.7,.3,.6,pick(['#C8A96B','#6B1E2A','#E8D5A8']),{ s:.1 })); g.box(0,.05,0,.7,.35,.7,'#3a2a20',{ s:.6 }); T(g,{ y:.4 }, g => { g.sphere(0,.15,0,.17,'#2F6F5A',{ s:1 },10); g.tube([0,.3,0],[0,.75,0],.025,'#C8A96B',{ s:1 }); g.cyl(0,.75,0,.06,.09,.08,'#5a3a24'); g.glow(0,.86,0,.22,[1,.45,.15],.6,8); g.tube([0,.4,0],[.5,.1,.3],.012,'#333'); }); } },
    firepit:{ name:'Fire pit', icon:'sparkle', cat:'fun', r:1.4, build:(g,sc) => { g.cyl(0,0,0,.75,.65,.35,'#6E6A63',{ s:.2 }); g.glow(0,.6,0,1.4,[1,.5,.18],.45,10); for (let i=0;i<8;i++) g.glow((rnd()-.5)*.7,.5,(rnd()-.5)*.6,.3,[1,.65,.25],.6,14); sc.addLight([0,1,0],'#FF8C3A',1.8,5,.3); [0,1,2,3].forEach(k => { const a = k/4*6.283 + .4; g.box(Math.cos(a)*1.4,0,Math.sin(a)*1.4,.5,.4,.5,'#B5AD9F',{ s:.1 }); }); } },
    kidsplay:{ name:'Kids’ play area', icon:'gift', cat:'fun', r:2, build:(g) => { g.box(0,0,0,3.2,.08,3,'#B9DDB5',{ s:.1 }); T(g,{ x:-.6, z:-.4 }, g => { g.box(0,0,0,.8,1,.8,'#F7E3A1',{ s:.3 }); g.loft([[-.4,.4],[.4,.4],[.4,.42],[-.4,.42]],1,[[-.4,1.9],[.4,1.9],[.4,1.92],[-.4,1.92]],0,'#AFCBE3',{ s:.6 }); }); for (let i=0;i<30;i++) g.sphere(.7+(rnd()-.5)*1.2,.15,.6+(rnd()-.5)*1.2,.1,pick(['#F3C6CF','#AFCBE3','#F7E3A1','#B9DDB5','#ffffff']),{ s:.6 },6); g.shadow(0,0,1,.3,1.7,1.6); } },
    games:{ name:'Lawn games', icon:'gift', cat:'fun', r:1.1, build:(g) => { for (let l=0;l<12;l++) for (let k=0;k<3;k++) g.box(l%2 ? 0 : -.18 + k*.18, l*.1, l%2 ? -.18 + k*.18 : 0, l%2 ? .5 : .16, .09, l%2 ? .16 : .5, '#D9B98A', { s:.2 }); g.shadow(0,0,.5,.4); } },
    casino:{ name:'Casino table', icon:'gift', cat:'fun', r:1.4, build:(g,sc) => { g.cyl(0,0,0,.9,.9,.82,'#3a2416',{ s:.6 },24); g.cyl(0,.82,0,.85,.85,.02,'#1f5b3a',{ s:.05 },24); for (let i=0;i<10;i++) g.cyl((rnd()-.5)*.8,.84,(rnd()-.5)*.8,.05,.05,.02*(1+i%3),pick(['#A33A2B','#111','#C8A96B']),{ s:.6 },8); person(g, sc, 0, -1.1, { top:'#111', dress:false, ry:0 }); } },
    easel:{ name:'Live painter', icon:'brush', cat:'fun', r:.9, build:(g,sc,p,c) => { g.tube([-.3,0,0],[0,1.7,-.1],.02,'#8a6b4a'); g.tube([.3,0,0],[0,1.7,-.1],.02,'#8a6b4a'); g.tube([0,0,-.5],[0,1.6,-.1],.02,'#8a6b4a'); T(g,{ y:.75, rx:-.15 }, g => { g.box(0,0,0,.8,.9,.03,'#F7F3EC'); for (let i=0;i<10;i++) g.sphere((rnd()-.5)*.6,.2+rnd()*.6,.03,.05,pick(c.flowers.concat(['#6B8A5E'])),{},6,.3); }); person(g, sc, .5, .5, { ry:-2.6 }); } },
    performers:{ name:'Dabke / zaffe troupe', icon:'users', cat:'fun', r:1.8, build:(g,sc) => { for (let i=0;i<7;i++){ const a = i/7*Math.PI; person(g, sc, Math.cos(a)*1.4, -Math.sin(a)*.6, { top:i%2 ? '#F4EFE6' : '#1f1f1f', dress:false, dance:true, ry:0 }); } } },
    piano:{ name:'Grand piano', icon:'music', cat:'stage', r:1.6, build:(g,sc) => { const sh = [[-.75,-1],[.75,-1],[.75,.2],[.5,.8],[0,1.1],[-.5,.9],[-.75,.4]]; T(g,{ ry:Math.PI }, g => { g.loft(sh,.62,sh,.95,'#0a0a0a',{ s:1 }); g.box(0,.62,-1.05,1.5,.12,.3,'#efefef',{ s:.5 }); [[-.6,-.9],[.6,-.9],[0,.9]].forEach(([x,z]) => g.box(x,0,z,.09,.62,.09,'#0a0a0a',{ s:1 })); T(g,{ y:.95, z:.1, rx:-.7 }, g => g.box(0,0,.5,1.4,.02,1,'#0a0a0a',{ s:1 })); }); g.shadow(0,0,1.2,.4); person(g, sc, 0, 1.4, { top:'#111', dress:false, ry:Math.PI }); } },
    gifts:{ name:'Gift table', icon:'gift', cat:'decor', r:1, build:(g,sc,p,c) => { g.box(0,0,0,1.4,.78,.7,c.linen,{ s:.1 }); for (let i=0;i<7;i++){ const s = .15+rnd()*.15; g.box(-.5+rnd()*1,.78+(i>4?.25:0),(rnd()-.5)*.4,s,s,s,pick(c.flowers.concat([c.metal])),{ s:.5 }); } g.shadow(0,0,.8,.4,1,.6); } },
    heater:{ name:'Patio heater', icon:'bulb', cat:'decor', r:.6, build:(g,sc) => { g.cyl(0,0,0,.25,.25,.08,'#555',{ s:.9 }); g.tube([0,0,0],[0,2.2,0],.05,'#888',{ s:.9 }); g.cyl(0,2.2,0,.5,.12,.2,'#999',{ s:.9 }); g.glow(0,2.05,0,.7,[1,.45,.15],.3,5); sc.addLight([0,2,0],'#FF8C3A',.8,3.5,.2); } },
    umbrella:{ name:'Umbrella & loungers', icon:'umbrella', cat:'decor', r:1.6, build:(g) => { C.umbrella(g,0,0,'#F2EADC',2.3); C.lounger(g,.6,.9,.3); C.lounger(g,-.7,.9,-.2); } },
    car:{ name:'Wedding / VIP car', icon:'car', cat:'fun', r:2.6, build:(g,sc,p,c) => { T(g,{ ry:Math.PI/2 }, g => { g.box(0,.3,0,4.6,.75,1.8,'#F4F2EE',{ s:1 }); g.loft([[-1.2,-.8],[1,-.8],[1,.8],[-1.2,.8]],1.05,[[-.9,-.7],[.6,-.7],[.6,.7],[-.9,.7]],1.6,'#F4F2EE',{ s:1 }); g.box(-.15,1.1,0,1.5,.42,1.62,'#1c2a38',{ s:1 }); [[-1.5,.85],[1.5,.85],[-1.5,-.85],[1.5,-.85]].forEach(([x,z]) => T(g,{ x, y:.35, z, rx:Math.PI/2 }, g => g.cyl(0,-.12,0,.35,.35,.24,'#111',{ s:.4 }))); g.glow(2.3,.7,.6,.3,[1,1,.9]); g.glow(2.3,.7,-.6,.3,[1,1,.9]); C.flowers(g,2,1.1,0,.25,c.flowers,8); }); g.shadow(0,0,1,.45,1.3,2.6); } },
    sparks:{ name:'Cold spark machines', icon:'sparkle', cat:'screens', r:.9, build:(g,sc) => { [-.5,.5].forEach((x,k) => { g.box(x,0,0,.35,.25,.35,'#111',{ s:.6 }); for (let i=0;i<16;i++){ const ph = i/16, ang = rnd()*6.283, sp = .25 + rnd()*.25; sc.dynamic(g => g.glow(0,0,0,.09,[1,.82,.45]), t => { const q = (t*.8 + ph + k*.37) % 1; return mdl({ x:x + Math.cos(ang)*sp*q, y:.3 + 3.2*q - 2.6*q*q, z:Math.sin(ang)*sp*q }); }); } g.glow(x,.35,0,.6,[1,.7,.3],.3,8); }); sc.addLight([0,1.2,0],'#FFD58A',1,3.5,.25); } }
  };
  const CATS = [['tables','Tables & seating'],['stage','Stage & music'],['screens','Screens & lights'],['decor','Decor & flowers'],['food','Food & drinks'],['fun','Fun & extras']];

  /* ---------- auto layout from choices ---------- */
  const has = (arr, ...k) => (Array.isArray(arr) ? arr : arr ? [arr] : []).some(x => k.includes(x));
  function autoLayout(v){
    const sx = x => Math.abs(x) > 7 ? Math.sign(x)*(W/2 - (10 - Math.abs(x))) : x*W/20, sz = z => z < -5 ? -D/2 + (8 + z) : z > 5 ? D/2 - (8 - z) : z*D/16;
    const out = [], A = (id, type, pref, ry=0, props={}, raw=false) => out.push({ id, type, pref: raw ? pref : [sx(pref[0]), sz(pref[1])], ry, props });
    const areas = v.areas || [], music = v.music || [], acts = v.activities || [], L = v.lights || [], fx = v.effects || [], bd = v.backdrop || [], svc = v.service || [], drinks = v.drinks || [], des = v.desserts || [], tech = v.technical || [], ex = v.extrasDecor || [];
    const back = -D/2 + 1.6;
    if (areas.includes('Kosha / couple’s stage')) A('kosha','kosha',[0,back]);
    else if (areas.includes('Stage') || music.includes('Live band') || music.includes('Singer')) A('stage','stage',[0,back]);
    if (bd.includes('LED screen') || tech.includes('Screens & projectors')) A('ledscreen','ledscreen',[0,-D/2+.4]);
    if (bd.includes('Flower wall') || bd.includes('Greenery wall')) A('flowerwall','flowerwall',[areas.includes('Kosha / couple’s stage') ? -5.8 : 0, -D/2+.5]);
    if (bd.includes('Floral arch') || areas.includes('Ceremony area')) A('arch','arch',[areas.includes('Kosha / couple’s stage') ? 5.8 : 0, back]);
    if (bd.includes('Balloon arch') || has([v.balloons],'Garlands & arches','Balloon installation')) A('balloonarch','balloonarch',[0, back - .3]);
    if (bd.includes('Draped fabric')) A('drape','drape',[0,-D/2+.4]);
    if (bd.includes('Neon sign') || L.includes('Neon')) A('neon','neon',[-3.6,-D/2+.5]);
    if (areas.includes('Dance floor') || L.includes('LED dance floor') || music.includes('DJ')) A('dancefloor','dancefloor',[0,-2.2]);
    if (music.includes('Live band')) A('band','band',[6.4,-5.6]);
    if (music.includes('DJ')) A('dj','dj',[-6.4,-5.6]);
    if (tech.includes('Sound system')) A('speakers','speakers',[3.6,-5.8]);
    if (music.includes('Pianist')) A('piano','piano',[-7.6,-1.6]);
    if (has(music,'Zaffe','Dabke troupe','Drummers (tabl)','Belly dancer')) A('performers','performers',[0,5.6]);
    if (has(music,'String quartet / violin','Oud player','Saxophonist','Choir') && !music.includes('Live band')) A('band','band',[6.4,-5.6]);
    if (L.includes('Moving heads') || L.includes('Spotlights') && false) A('truss','truss',[0,-D/2+2.6]);
    if (L.includes('Chandeliers')) [[-2.4,-2.2],[2.4,-2.2],[-6,2.6],[6,2.6],[0,4.6]].forEach((p,i) => A('chand'+i,'chandelier',p));
    if (L.includes('Candlelight') || L.includes('Lanterns') || ex.includes('Candles everywhere')) [[-8.6,-6.8],[8.6,-6.8],[-8.6,6.8],[8.6,6.8]].forEach((p,i) => A('cand'+i,'candles',p));
    if (fx.includes('Cold sparks')) { A('sparks0','sparks',[-3.6,.6]); A('sparks1','sparks',[3.6,.6]); }
    if (areas.includes('Sweetheart or head table')) A('sweetheart','sweetheart',[0, areas.includes('Kosha / couple’s stage') ? -4.2 : back + 1.6]);
    if (areas.includes('Bar area') || has(drinks,'Open bar','Signature cocktail','Wine','Champagne / bubbly','Arak','Beer','Whisky & spirits','Mocktails') || v.bartenders === 'Professional bartenders') A('bar','bar',[8.6,-3],-Math.PI/2);
    if (has(svc,'Buffet')) A('buffet','buffet',[-8.8,-2.6],Math.PI/2);
    if (has(svc,'Food stations','Live cooking stations') || (v.stations||[]).filter(x => !/Not sure/.test(x)).length) A('station0','station',[-8.6,1.2],Math.PI/2);
    if ((v.stations||[]).filter(x => !/Not sure/.test(x)).length > 1) A('station1','station',[8.6,1.2],-Math.PI/2);
    if (has(svc,'BBQ / grill')) A('grill','grill',[-8.6,4],Math.PI/2);
    if (has(svc,'Food trucks')) A('foodtruck','foodtruck',[7.2,6.2],-Math.PI/2);
    if ((v.cake||'').startsWith('Yes')) A('cake','cake',[areas.includes('Kosha / couple’s stage') ? 4.2 : 3.4, back + .8]);
    if (has(des,'Sweets table','Lebanese sweets (knefe, maamoul…)','Macarons','Cupcakes','Donut wall','Dragées & chocolates')) A('sweets','sweets',[-8.4,-5.6],Math.PI/2);
    if (des.includes('Chocolate fountain')) A('fountain','fountain',[-6.6,-6.6]);
    if (has(drinks,'Coffee & tea corner','Turkish coffee service')) A('coffee','coffee',[8.6,4],-Math.PI/2);
    if (areas.includes('Photo corner') || acts.includes('Photo booth') || ex.includes('Photo-op corner')) A('photobooth','photobooth',[-8.2,6.6],Math.PI/4);
    if (acts.includes('360 video booth')) A('booth360','booth360',[8.2,6.6]);
    if (areas.includes('Lounge corner') || areas.includes('VIP area') || acts.includes('Cigar lounge') || v.seating && v.seating.includes('Lounge seating')) A('sofa','sofa',[7.6,6.2]);
    if (acts.includes('Hookah / argileh corner')) A('argileh','argileh',[-7.4,4.6]);
    if (areas.includes('Kids’ area') || acts.includes('Kids’ entertainer') || acts.includes('Face painting')) A('kidsplay','kidsplay',[-7.6,6.2]);
    if (acts.includes('Games / lawn games')) A('games','games',[6.6,4.4]);
    if (acts.includes('Casino tables')) A('casino','casino',[6.4,1.4]);
    if (acts.includes('Live painter') || acts.includes('Caricature artist')) A('easel','easel',[-6.4,1.4]);
    if (areas.includes('Gift table') || (v.favors||[]).some(x => !/None|Not sure/.test(x))) A('gifts','gifts',[5.6,7.2]);
    if (areas.includes('Welcome / reception area') || ex.includes('Welcome sign') || ex.includes('Entrance decor')) A('welcome','welcome',[-1.6,D/2-.6]);
    if (has(v.balloons,'A few accents','Garlands & arches','Balloon installation')) [[-4,D/2-.8],[4,D/2-.8]].forEach((p,i) => A('bal'+i,'balloons',p));
    if (tech.includes('Heaters')) [[-9.2,-7.2],[9.2,-7.2],[-9.2,7.2],[9.2,7.2]].forEach((p,i) => A('heat'+i,'heater',p));
    if (has(v.transport,'Wedding / VIP car','Classic car') && venueOf(v) !== 'yacht') A('car','car',[0, D/2+2.6],0,{},true);
    if (L.includes('Warm uplighting') || L.includes('Colored uplighting')) {}
    // seating last: fills the free space, nearest the dance floor first
    const guests = +v.guests || 0, seat = v.seating || [];
    const zone = []; for (let zz = -D/2 + 2.4; zz <= D/2 - 1.9; zz += 3.2) for (let xx = -W/2 + 2.1; xx <= W/2 - 2.1; xx += 3.2) zone.push([xx, zz]);
    zone.sort((a,b) => (Math.abs(a[0])*.55 + Math.abs(a[1] - D*.1)) - (Math.abs(b[0])*.55 + Math.abs(b[1] - D*.1)));
    const maxT = Math.floor(W*D/15);
    const n = guests ? Math.min(maxT, Math.max(1, Math.ceil(guests / 8))) : (seat.length ? 8 : 0);
    const kind = seat.includes('Long imperial tables') ? 'imperial' : seat.includes('Mixed rounds & long tables') ? 'mixed' : seat.includes('Cocktail / standing') ? 'cocktail' : (seat.includes('Theater rows') || seat.includes('Classroom')) ? 'rows' : 'round';
    if (kind === 'imperial'){ const m = Math.min(Math.floor(W*D/40), Math.max(1, Math.ceil((guests||80)/20))); const cols = Math.max(2, Math.floor(W/9)); for (let i=0;i<m;i++){ const c = i % cols, r = Math.floor(i/cols); A('imp'+i,'imperial',[-W/2 + W*(c+.5)/cols, -D*.05 + r*2.7],0,{},true); } }
    else if (kind === 'rows'){ const m = Math.min(Math.floor(W*D/30), Math.max(1, Math.ceil((guests||60)/20))); for (let i=0;i<m;i++) A('rows'+i,'rows',zone[i % zone.length],0,{},true); }
    else if (kind === 'cocktail'){ for (let i=0;i<Math.min(Math.floor(W*D/6), Math.ceil((guests||60)/6));i++) A('ct'+i,'cocktail',zone[i % zone.length],0,{},true); }
    else { for (let i=0;i<n;i++){ const isLong = kind === 'mixed' && i % 3 === 2; A('t'+i, isLong ? 'long' : 'round', zone[i % zone.length] || [0,0], 0, {}, true); } }
    if (areas.includes('Kids’ area') && guests) A('kidstable','kidstable',[-5.6,6.4]);
    return out;
  }
  // place each item at the nearest free spot to its preferred point
  function placeAll(list, fixed){
    const placed = fixed.slice(), res = [];
    const free = (x, z, r, isFloor) => placed.every(p => { const pd = ITEMS[p.type]; if (pd.hang || p.type === 'car') return true; const d = Math.hypot(p.x - x, p.z - z);
      if (isFloor || pd.floor) return d > (isFloor ? r : pd.r)*.85 + (isFloor ? pd.r : r)*.7; return d > (r + pd.r) * .82; });
    list.forEach(it => {
      const def = ITEMS[it.type], r = def.r, out = it.type === 'car';
      let best = null;
      if (def.hang || out) best = it.pref;
      else { const [px, pz] = it.pref; for (let rad=0; rad<12 && !best; rad+=.5){ const steps = Math.max(1, Math.round(rad*8)); for (let s=0;s<steps;s++){ const a = s/steps*6.283; const x = px + Math.cos(a)*rad, z = pz + Math.sin(a)*rad; if (Math.abs(x) > W/2 - r*.7 || Math.abs(z) > D/2 - r*.7) continue; if (free(x, z, r, def.floor)) { best = [x, z]; break; } } } }
      if (!best) return;
      const p = { ...it, x:best[0], z:best[1] }; placed.push(p); res.push(p);
    });
    return res;
  }

  /* ---------- effects ---------- */
  function buildFx(st, v, items){
    const fx = v.effects || [], r = st.r, df = items.find(i => i.type === 'dancefloor') || { x:0, z:-2 };
    const add = (build, update, opts) => { const g = new GL3D.Geo(); build(g); st.fx.push(r.addDyn(g, (t, c) => st.hideAll ? null : update(t, c), opts)); };
    const cols = st.ctx.cols.length ? st.ctx.cols : ['#C8A96B','#F2D3CC','#FFFFFF','#E8D5A8'];
    if (fx.includes('Low fog / dry ice') || fx.includes('Smoke')) for (let i=0;i<9;i++){ const ph = rnd()*6, ox = (rnd()-.5)*5, oz = (rnd()-.5)*4, big = fx.includes('Smoke') && i > 5;
      add(g => g.cyl(0,0,0,1.5,1.5,.02,'#262626',{ e:1, s:0 },20), t => mdl({ x:df.x + ox + Math.sin(t*.3+ph)*.6, y:big ? 1.5 + Math.sin(t*.2+ph) : .06 + i*.02, z:df.z + oz + Math.cos(t*.25+ph)*.5, s:.8 + .3*Math.sin(t*.5+ph) }), { additive:true }); }
    if (fx.includes('Confetti')) for (let i=0;i<70;i++){ const ph = rnd(), x = df.x + (rnd()-.5)*6, z = df.z + (rnd()-.5)*5, col = pick(cols), sp = .12 + rnd()*.08;
      add(g => g.box(0,0,0,.07,.004,.045,col,{ s:.9, e:.3 }), t => { const q = (t*sp + ph) % 1; return mdl({ x:x + Math.sin(t*2+ph*9)*.2, y:5.5 - q*5.5, z, rx:t*4+ph*9, rz:t*3+ph*5 }); }); }
    if (fx.includes('Bubbles')) for (let i=0;i<30;i++){ const ph = rnd(), x = df.x + (rnd()-.5)*6, z = df.z + (rnd()-.5)*5;
      add(g => g.sphere(0,0,0,.09,'#1c2a33',{ e:1, s:1 },8), t => { const q = (t*.15 + ph) % 1; return mdl({ x:x + Math.sin(t+ph*9)*.3, y:.5 + q*4, z }); }, { additive:true }); }
    if (fx.includes('Lasers')) { const src = items.find(i => i.type === 'dj') || items.find(i => i.type === 'stage') || { x:0, z:-D/2+1 }; ['#B8301C','#C8781E','#7a3fb0','#2f7a6a'].forEach((c,i) => { for (let k=0;k<4;k++) add(g => g.box(0,0,7,.02,.02,14,c,{ e:1.3, s:0 }), t => mdl({ x:src.x, y:3.4, z:src.z, ry:Math.sin(t*.8+i*1.7)*.9 + (k-1.5)*.14, rx:.18 + Math.sin(t*.6+k)*.08 }), { additive:true }); }); }
    if (fx.includes('Fireworks')) for (let s=0;s<3;s++){ const cx = (s-1)*9, cz = -16 - s*3, cy = 15 + s*2, off = s*1.1, col = GL3D.hexD(pick(cols.concat(['#FFD58A'])));
      for (let i=0;i<34;i++){ const a = rnd()*6.283, e = (rnd()-.5)*3, sp = 3 + rnd()*1.5; add(g => g.glow(0,0,0,.45,col), t => { const q = ((t + off) % 3.3) / 1.6; if (q > 1) return null; return mdl({ x:cx + Math.cos(a)*Math.cos(e)*sp*q, y:cy + Math.sin(e)*sp*q - 2*q*q, z:cz + Math.sin(a)*Math.cos(e)*sp*q }); }); }
      add(g => g.glow(0,0,0,.3,[1,.85,.5]), t => { const q = ((t + off) % 3.3); if (q < 2.4) return null; const k = (q-2.4)/.9; return mdl({ x:cx, y:cy*k, z:cz }); }); }
    if (fx.includes('Drone light show')) for (let i=0;i<64;i++){ const u = i/64*6.283;
      add(g => g.glow(0,0,0,.35,GL3D.hexD(i%3 ? '#FFFFFF' : (cols[0] || '#C8A96B'))), t => { const k = .5 + .5*Math.sin(t*.35); const hx = 16*Math.pow(Math.sin(u),3)*.45, hy = (13*Math.cos(u)-5*Math.cos(2*u)-2*Math.cos(3*u)-Math.cos(4*u))*.45; const cx = Math.cos(u + t*.2)*7, cy = Math.sin(u + t*.2)*7; return mdl({ x:hx*k + cx*(1-k), y:18 + (hy*k + cy*(1-k)), z:-20 }); }); }
    if (fx.includes('Sky lanterns')) for (let i=0;i<24;i++){ const ph = rnd(), x = (rnd()-.5)*16, z = (rnd()-.5)*10; add(g => { g.glow(0,0,0,.5,[1,.6,.25],.3,4); g.box(0,-.15,0,.18,.28,.18,'#F7D9A8',{ e:1.2 }); }, t => { const q = (t*.05 + ph) % 1; return mdl({ x:x + q*4, y:1 + q*22, z:z - q*10 }); }); }
    if (fx.includes('Flame effects')) [-4.2,4.2].forEach((x,k) => { for (let i=0;i<10;i++) add(g => g.glow(0,0,0,.6,[1,.5,.15]), t => { const q = ((t*1.2 + k*.5) % 3); if (q > 1) return null; return mdl({ x, y:.3 + i*.3*q*1.4, z:-D/2 + 1.2 }); }); });
    if (fx.includes('Balloon drop') || has([v.balloons],'Balloon drop')) for (let i=0;i<24;i++){ const ph = rnd(), x = df.x + (rnd()-.5)*6, z = df.z + (rnd()-.5)*5, col = pick(cols);
      add(g => C.balloon(g,0,0,0,.24,col,{}), t => { const q = (t*.07 + ph) % 1; return mdl({ x, y:Math.max(.27, 5.6 - q*14), z }); }); }
    if ((v.lights||[]).includes('Gobo / monogram projection')) add(g => { for (let i=0;i<12;i++){ const a = i/12*6.283; g.glow(Math.cos(a)*1.4,0,Math.sin(a)*1.4,.5,GL3D.hexD(st.ctx.metal).map(c=>c*.7)); } g.glow(0,0,0,1.3,[.5,.4,.25]); }, t => mdl({ x:df.x, y:.08, z:df.z, ry:t*.4 }));
  }
  function buildCrowd(st, v, items){
    const n = Math.min(60, Math.round((+v.guests || 0) / 8 * (st.crowdScale ?? 1))); if (!n) return;
    const df = items.find(i => i.type === 'dancefloor'), bar = items.find(i => i.type === 'bar');
    const free = (x, z) => Math.abs(x) < W/2 - .5 && Math.abs(z) < D/2 - .5 && items.every(i => ITEMS[i.type].floor || ITEMS[i.type].hang || Math.hypot(i.x - x, i.z - z) > ITEMS[i.type].r + .35);
    for (let i=0;i<n;i++){
      let x, z, dance = false, tries = 0;
      if (df && i < n*.6){ x = df.x + (rnd()-.5)*5; z = df.z + (rnd()-.5)*4; dance = true; }
      else { do { const near = bar && rnd() < .4 ? bar : null; x = near ? near.x + (rnd()-.5)*4 : (rnd()-.5)*(W-2); z = near ? near.z + (rnd()-.5)*4 : (rnd()-.5)*(D-2); tries++; } while (!free(x, z) && tries < 30); if (tries >= 30) continue; }
      const sub = []; const proxy = { dynamic:(b, u) => sub.push({ b, u }), addLight(){} };
      const g = new GL3D.Geo(); C.person(g, proxy, 0, 0, { dance }); const pg = new GL3D.Geo(); sub[0].b(pg); pg.sp = g.sp; pg.sa = g.sa;
      const px = x, pz = z; st.crowd.push(st.r.addDyn(pg, t => st.hideAll ? null : GL3D.mul4(mdl({ x:px, z:pz }), sub[0].u(t))));
    }
  }

  /* ---------- studio ---------- */
  const easeBack = k => { k = Math.min(1, Math.max(0, k)); const c = 1.7; return 1 + (c+1)*Math.pow(k-1,3) + c*Math.pow(k-1,2); };
  class Studio {
    constructor(root, { onChange }){
      this.root = root; this.canvas = $('canvas', root); this.onChange = onChange;
      this.r = new GL3D.Renderer(this.canvas); this.items = []; this.fx = []; this.crowd = []; this.envSig = null; this.sel = null;
      this.cam = { theta:.9, phi:.62, r:22, target:[0,.4,0], auto:true }; this.goal = { theta:.9, phi:.62, r:22 }; this.vel = 0; this.horizon = .45; this.t0 = performance.now(); this.visible = true;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; if (this.reduced) this.cam.auto = false;
      new ResizeObserver(() => this.resize()).observe(this.canvas);
      this.io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }); this.io.observe(this.canvas);
      this.bind(); GL3D._viewers.add(this);
    }
    get time(){ return (performance.now() - this.t0) / 1000; }
    resize(){ const dpr = Math.min(window.devicePixelRatio || 1, 2), rc = this.canvas.getBoundingClientRect(); const w = Math.max(2, Math.round(rc.width*dpr)), h = Math.max(2, Math.round(rc.height*dpr)); if (this.canvas.width !== w || this.canvas.height !== h){ this.canvas.width = w; this.canvas.height = h; } }
    camera(){
      const c = this.cam, rc = this.canvas, asp = (rc.width || 1) / (rc.height || 1), photo = this.v && this.v._photo;
      const fov = photo ? 1 : .72, phi = photo ? Math.max(.04, Math.min(1.4, Math.atan(this.horizon * Math.tan(fov/2)))) : c.phi;
      const R = c.r * (this.scale || 1) * (photo ? 1 : Math.max(1, Math.min(1.7, 1.3 / asp))), tg = c.target;
      return { eye:[tg[0] + Math.cos(c.theta)*Math.cos(phi)*R, tg[1] + Math.sin(phi)*R, tg[2] + Math.sin(c.theta)*Math.cos(phi)*R], target:tg, fov };
    }
    ray(cx, cy){
      const rc = this.canvas.getBoundingClientRect(), nx = ((cx - rc.left)/rc.width)*2 - 1, ny = -(((cy - rc.top)/rc.height)*2 - 1), { eye, target, fov } = this.camera();
      const f = GL3D.norm(GL3D.sub(target, eye)), rt = GL3D.norm(GL3D.cross(f, [0,1,0])), up = GL3D.cross(rt, f), th = Math.tan(fov/2), as = rc.width/rc.height;
      const d = GL3D.norm([f[0] + rt[0]*nx*th*as + up[0]*ny*th, f[1] + rt[1]*nx*th*as + up[1]*ny*th, f[2] + rt[2]*nx*th*as + up[2]*ny*th]);
      if (d[1] > -1e-4) return null; const s = -eye[1]/d[1]; return [eye[0] + d[0]*s, eye[2] + d[2]*s];
    }
    pick(h){ let best = null, bs = 1e9; this.items.forEach(it => { const def = ITEMS[it.type], d = Math.hypot(it.x - h[0], it.z - h[1]); if (d > def.r) return; const s = d/def.r + (def.floor ? 1 : 0); if (s < bs){ bs = s; best = it; } }); return best; }
    sync(v){
      this.v = v; if (v._horizon) this.horizon = v._horizon; const sz = sizeOf(v); W = sz[0]; D = sz[1]; this.scale = Math.max(W/20, D/16);
      this.ctx = makeCtx(v); const env = envDef(v, this.ctx); this.envLabel = env.label;
      if (v._photo && !this.photoReady){ let u = null; try { u = localStorage.getItem('ma3ak:photo'); } catch(e){} if (u) this.loadPhoto(u); else { v._photo = false; } }
      $('#st-photo-tools', this.root).hidden = !v._photo; $('[data-hold="tiltu"]', this.root).hidden = $('[data-hold="tiltd"]', this.root).hidden = !!v._photo;
      if (env.sig !== this.envSig){ this.envSig = env.sig; this.r.load(env.def); this.envLights = this.r.scene.lights.slice(); this.items.forEach(it => { it.h = null; it.subs = []; }); this.fx = []; this.crowd = []; this.fxSig = this.crowdSig = null; this.ring = null; }
      if (!this.ring){ const g = new GL3D.Geo(); for (let i=0;i<40;i++){ const a0 = i/40*6.283, a1 = (i+1)/40*6.283; g.tube([Math.cos(a0),.04,Math.sin(a0)],[Math.cos(a1),.04,Math.sin(a1)],.035,'#C8A96B',{ e:2.5 }); } this.ring = this.r.addDyn(g, t => { if (this.sel) return mdl({ x:this.sel.x, z:this.sel.z, s:ITEMS[this.sel.type].r * (1 + .04*Math.sin(t*5)) }); const f = this.flash; if (f && t < f.until){ const k = 1 - (f.until - t)/1.6; return mdl({ x:f.x, z:f.z, s:f.r * (.6 + k*.7) }); } return null; }); }
      // merge auto layout + overrides + user-added items
      const ov = v._ov || {}, added = v._add || [];
      const auto = autoLayout(v).filter(a => !(ov[a.id] && ov[a.id].del));
      const fixedAuto = auto.filter(a => ov[a.id]).map(a => ({ ...a, x:ov[a.id].x, z:ov[a.id].z, ry:ov[a.id].ry ?? a.ry }));
      const fixed = fixedAuto.concat(added.map(a => ({ ...a })));
      const placed = placeAll(auto.filter(a => !ov[a.id]), fixed);
      const want = fixed.concat(placed);
      const sigOf = it => it.type + '|' + JSON.stringify(this.ctx) + '|' + (it.type === 'round' ? it.id : '');
      const keep = new Map(this.items.map(i => [i.id, i]));
      const next = [];
      want.forEach(w => { const old = keep.get(w.id); const sig = sigOf(w);
        if (old && old.sig === sig && old.h){ if (old !== this.drag?.item){ old.x = w.x; old.z = w.z; old.ry = w.ry; } next.push(old); keep.delete(w.id); }
        else { if (old){ this.removeItem(old); keep.delete(w.id); } next.push(this.createItem({ ...w, sig }, !old)); } });
      keep.forEach(it => this.removeItem(it));
      this.items = next;
      if (this.sel && !this.items.includes(this.sel)) this.select(null);
      this.refreshScene(); this.updateUI();
    }
    createItem(w, animate=true){
      const def = ITEMS[w.type], g = new GL3D.Geo(), lights = [], subs = [];
      const proxy = { addLight:(p, col, i, range, fl=0) => lights.push({ p, c:GL3D.hexD(col), i, range, flicker:fl, ph:Math.random()*9 }), dynamic:(build, update, opts={}) => subs.push({ build, update, opts }) };
      def.build(g, proxy, w.props || {}, this.ctx);
      const it = { ...w, lights, born: animate ? this.time : -9, lift:0 };
      it.h = this.r.addDyn(g, t => { if (this.hideAll){ it.m = null; return null; } const k = easeBack((t - it.born) / .55); it.m = mdl({ x:it.x, y:it.lift, z:it.z, ry:it.ry, s:Math.max(.01, k) }); return it.m; });
      it.subs = subs.map(s => { const sg = new GL3D.Geo(); s.build(sg); return this.r.addDyn(sg, (t, cam) => { const lm = s.update(t, cam); return lm && it.m ? GL3D.mul4(it.m, lm) : null; }, s.opts); });
      return it;
    }
    removeItem(it){ this.r.removeDyn(it.h); (it.subs||[]).forEach(s => this.r.removeDyn(s)); it.h = null; }
    refreshScene(){
      const fxSig = JSON.stringify([this.v.effects, this.v.balloons, this.v.lights, this.items.filter(i => ['dancefloor','dj','stage'].includes(i.type)).map(i => [i.type, i.x.toFixed(1), i.z.toFixed(1)]), this.ctx.cols]);
      if (fxSig !== this.fxSig){ this.fxSig = fxSig; this.fx.forEach(d => this.r.removeDyn(d)); this.fx = []; buildFx(this, this.v, this.items); }
      const crowdSig = JSON.stringify([this.v.guests, this.crowdScale ?? 1, this.items.map(i => [i.id, i.x.toFixed(1), i.z.toFixed(1)])]);
      if (crowdSig !== this.crowdSig){ this.crowdSig = crowdSig; this.crowd.forEach(d => this.r.removeDyn(d)); this.crowd = []; buildCrowd(this, this.v, this.items); }
    }
    lights(){
      const L = this.envLights.slice(), c = this.items;
      c.forEach(it => it.lights.forEach(l => { const cs = Math.cos(it.ry), sn = Math.sin(it.ry); L.push({ ...l, p:[it.x + l.p[0]*cs + l.p[2]*sn, l.p[1], it.z - l.p[0]*sn + l.p[2]*cs] }); }));
      return L.slice(0, 12);
    }
    frame(){
      if (!this.r.scene) return; const t = this.time, now = performance.now(); if (this._lf) this.r.adapt(now - this._lf); this._lf = now;
      const c = this.cam, gl_ = this.goal;
      if (c.auto && !this.drag) gl_.theta += .0016;
      if (!this.drag && Math.abs(this.vel) > .00005){ gl_.theta += this.vel; this.vel *= .9; }
      c.theta += (gl_.theta - c.theta) * .2; c.phi += (gl_.phi - c.phi) * .2; c.r += (gl_.r - c.r) * .2;
      if (gl_.target) for (let i=0;i<3;i++) c.target[i] += (gl_.target[i] - c.target[i]) * .1;
      this.r.scene.lights = this.lights(); this.r.render(this.reduced ? 2 : t, this.camera());
    }
    loop(){ cancelAnimationFrame(this.raf); const step = () => { if (!this.visible || document.hidden || !this.canvas.isConnected) return; this.frame(); this.raf = requestAnimationFrame(step); }; this.raf = requestAnimationFrame(step); }
    destroy(){ cancelAnimationFrame(this.raf); this.io.disconnect(); this.r.dispose(); const e = this.r.gl.getExtension('WEBGL_lose_context'); e && e.loseContext(); }
    render4K(){
      const cv = this.canvas, gl = this.r.gl, ow = cv.width, oh = cv.height, asp = ow / oh;
      const vp = gl.getParameter(gl.MAX_VIEWPORT_DIMS), lim = Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), gl.getParameter(gl.MAX_TEXTURE_SIZE), vp[0], vp[1]);
      const mobile = matchMedia('(max-width: 760px)').matches, target = Math.min(lim, mobile ? 2560 : 3840);
      let w = target, h = Math.round(target / asp); if (h > target){ h = target; w = Math.round(target * asp); }
      if (w < 1200) return null;
      const ss = this.r.ss; let url = null;
      try { this.r.ss = 1; cv.width = w; cv.height = h; this.frame(); url = cv.toDataURL('image/jpeg', .93); this.last4k = { w, h }; }
      catch(e){ url = null; }
      finally { this.r.ss = ss; cv.width = ow; cv.height = oh; this.frame(); }
      return url;
    }
    focusOn(type){
      const list = this.items.filter(i => i.type === type); if (!list.length) return false;
      const it = list.reduce((a, b) => (b.born > a.born ? b : a)); const def = ITEMS[it.type];
      this.goal.target = [it.x, def.hang ? 3.4 : Math.min(1.2, def.r*.4), it.z]; this.goal.r = Math.max(7, def.r*3.6) / (this.scale || 1); this.goal.phi = Math.max(this.goal.phi, .42);
      this.cam.auto = false; this.flash = { x:it.x, z:it.z, r:def.r, until:this.time + 1.6 }; this.focused = true; return true;
    }
    overview(){ this.goal.target = [0,.4,0]; this.goal.r = 22; this.goal.phi = .62; this.focused = false; }
    setCompare(on){ this.hideAll = !!on; }
    setGrid(on){ this.showGrid = !!on;
      if (on && (!this.gridH || !this.r.scene.dyn.includes(this.gridH))){ const g = new GL3D.Geo(), c = '#C8A96B';
        for (let x = -W/2; x <= W/2 + .01; x += 1) g.box(x, .012, 0, x % 2 === 0 ? .035 : .015, .004, D, c, { e:x % 2 === 0 ? 1.4 : .6 });
        for (let z = -D/2; z <= D/2 + .01; z += 1) g.box(0, .012, z, W, .004, z % 2 === 0 ? .035 : .015, c, { e:z % 2 === 0 ? 1.4 : .6 });
        this.gridH = this.r.addDyn(g, () => this.showGrid ? mdl({}) : null, { additive:true, noShadow:true }); } }
    planStats(){ const seatsPer = { round:8, long:10, imperial:20, sweetheart:2, kidstable:6, rows:20, sofa:4, cocktail:6 };
      const seats = this.items.reduce((s, it) => s + (seatsPer[it.type] || 0), 0);
      const used = this.items.filter(it => !ITEMS[it.type].hang).reduce((s, it) => s + Math.PI * ITEMS[it.type].r ** 2 * .62, 0);
      return { seats, area:W * D, used:Math.min(100, Math.round(used / (W * D) * 100)), W, D }; }
    capture(){ try { this.frame(); return this.canvas.toDataURL('image/jpeg', .9); } catch(e){ return null; } }
    loadPhoto(url){ const img = new Image(); img.onload = () => { this.r.setPhoto(img); this.photoReady = true; }; img.src = url; }
    async usePhoto(file){
      if (!file || !/^image\//.test(file.type)) { toast('Choose a photo file (JPG or PNG)', 'alert'); return; }
      const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const max = 2560, k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width*k); cv.height = Math.round(img.height*k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); const out = cv.toDataURL('image/jpeg', .9);
      try { localStorage.setItem('ma3ak:photo', out); } catch(e){ try { localStorage.setItem('ma3ak:photo', cv.toDataURL('image/jpeg', .7)); } catch(e2){} }
      this.r.setPhoto(cv); this.photoReady = true;
      this.v._photo = true; this.goal.theta = this.cam.theta = Math.PI/2; this.goal.r = this.cam.r = 22; this.cam.auto = false;
      $('#st-venues', this.root).hidden = true; this.onChange(this.v, 'venue'); this.sync(this.v); this.showMatch(true); toast('Photo added. Line it up with the horizon.', 'check');
    }
    showMatch(on){ $('#st-horizon', this.root).hidden = !on; $('#st-match', this.root).hidden = !on; ST._grid = on; if (on) this.placeHorizon(); }
    placeHorizon(){ const el = $('#st-horizon', this.root); el.style.top = ((1 - (this.horizon*.5 + .5)) * 100) + '%'; }
    select(it){ this.sel = it; const box = $('#st-sel', this.root); if (it){ $('#st-sel-name', this.root).textContent = ITEMS[it.type].name; box.hidden = false; } else box.hidden = true; $('#st-move', this.root).hidden = !it; $('#st-hint', this.root).hidden = !!it || this.items.length === 0; }
    updateUI(){
      $('#st-venue', this.root).innerHTML = icon('building','sm') + esc(this.envLabel) + icon('chevron','sm');
      const n = this.items.length; $('#st-count', this.root).textContent = n ? `${n} ${n === 1 ? 'item' : 'items'} in your design` : 'Empty venue';
      $('#st-empty', this.root).hidden = n > 0; if (!this.sel) $('#st-hint', this.root).hidden = n === 0;
    }
    commit(it){
      const v = this.v; if (it.id.startsWith('u')){ const a = (v._add || []).find(x => x.id === it.id); if (a){ a.x = it.x; a.z = it.z; a.ry = it.ry; } }
      else { v._ov = v._ov || {}; v._ov[it.id] = { x:it.x, z:it.z, ry:it.ry }; }
      this.onChange(v, true); this.refreshScene();
    }
    apply(msg){ this.onChange(this.v, 'venue'); this.sync(this.v); this.markVenue(); toast(msg, 'check'); }
    markVenue(){ const v = this.v, cur = venueOf(v), sz = sizeOf(v), t = timeOf(v);
      $$('[data-venue]', this.root).forEach(b => b.setAttribute('aria-pressed', VENUES[b.dataset.venue] === cur));
      $$('[data-time]', this.root).forEach(b => b.setAttribute('aria-pressed', ({ 'Lunch / afternoon':'day', Sunset:'sunset', Evening:'night' })[b.dataset.time] === t));
      $$('[data-size]', this.root).forEach(b => b.setAttribute('aria-pressed', SIZES[b.dataset.size][0] === sz[0])); }
    addItem(type, at){
      const v = this.v, def = ITEMS[type]; let p = at;
      if (!p){ const spot = placeAll([{ id:'tmp', type, pref:[0,1], ry:0 }], this.items)[0]; p = spot ? [spot.x, spot.z] : [0,0]; }
      const it = { id:'u' + Date.now().toString(36) + Math.random().toString(36).slice(2,5), type, x:Math.max(-W/2+.5, Math.min(W/2-.5, p[0])), z:Math.max(-D/2+.5, Math.min(D/2-.5, p[1])), ry:0 };
      v._add = (v._add || []).concat([it]); this.onChange(v); this.sync(v); this.select(this.items.find(i => i.id === it.id)); toast(`${def.name} added`, 'plus');
    }
    act(kind){
      const v = this.v, it = this.sel; if (!it) return;
      if (kind === 'rotate'){ it.ry += Math.PI/4; this.commit(it); }
      if (kind === 'dup'){ this.addItem(it.type, [it.x + 1.4, it.z + 1.2]); }
      if (kind === 'del'){ if (it.id.startsWith('u')) v._add = (v._add || []).filter(x => x.id !== it.id); else { v._ov = v._ov || {}; v._ov[it.id] = { del:1 }; } this.select(null); this.onChange(v); this.sync(v); }
      if (kind === 'done') this.select(null);
    }
    moveSel(dx, dz){ const it = this.sel; if (!it) return; const th = this.cam.theta; // camera-relative: forward is toward the target
      const fx = -Math.cos(th), fz = -Math.sin(th), rx = -fz, rz = fx; const r = ITEMS[it.type].r * .5;
      it.x = Math.max(-W/2 + r, Math.min(W/2 - r, it.x + rx*dx + fx*dz)); it.z = Math.max(-D/2 + r, Math.min(D/2 - r, it.z + rz*dx + fz*dz)); this.commit(it); }
    bind(){
      const cv = this.canvas, pts = new Map(); let pinch = null;
      const stopAuto = () => { this.cam.auto = false; const b = $('[data-st="spin"]', this.root); b && b.setAttribute('aria-pressed','false'); };
      cv.addEventListener('pointerdown', e => {
        stopAuto(); cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); this.vel = 0;
        if (pts.size === 2){ const [a, b] = [...pts.values()]; pinch = { d:Math.hypot(a[0]-b[0], a[1]-b[1]), r:this.goal.r }; this.drag = null; return; }
        const h = this.ray(e.clientX, e.clientY), it = h && this.pick(h);
        if (it && it === this.sel){ this.drag = { item:it, off:[it.x - h[0], it.z - h[1]], moved:false, x:e.clientX, y:e.clientY }; it.lift = .15; cv.style.cursor = 'grabbing'; }
        else this.drag = { orbit:true, x:e.clientX, y:e.clientY, lx:e.clientX, th:this.goal.theta, ph:this.goal.phi, moved:false, tap:it || null };
      });
      cv.addEventListener('pointermove', e => {
        if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pinch && pts.size === 2){ const [a, b] = [...pts.values()]; this.goal.r = Math.max(5, Math.min(40, pinch.r * pinch.d / Math.max(20, Math.hypot(a[0]-b[0], a[1]-b[1])))); return; }
        const d = this.drag;
        if (!d){ const h = this.ray(e.clientX, e.clientY), it = h && this.pick(h); cv.style.cursor = it ? (it === this.sel ? 'move' : 'pointer') : 'grab'; return; }
        if (d.item){ if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return; const h = this.ray(e.clientX, e.clientY); if (!h) return; const r = ITEMS[d.item.type].r * .5; d.item.x = Math.max(-W/2 + r, Math.min(W/2 - r, h[0] + d.off[0])); d.item.z = Math.max(-D/2 + r, Math.min(D/2 + (d.item.type === 'car' ? 5 : 0) - r, h[1] + d.off[1])); if (this.snap){ d.item.x = Math.round(d.item.x * 2) / 2; d.item.z = Math.round(d.item.z * 2) / 2; } d.moved = true; return; }
        const dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true; if (!d.moved) return;
        this.goal.theta = d.th - dx * .006; this.vel = -(e.clientX - d.lx) * .006 * .5; d.lx = e.clientX;
        if (!(this.v && this.v._photo)) this.goal.phi = Math.max(.15, Math.min(1.45, d.ph + dy * .004));
      });
      const end = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; const d = this.drag; this.drag = null; cv.style.cursor = 'grab';
        if (!d) return; if (d.item){ d.item.lift = 0; if (d.moved) this.commit(d.item); return; }
        if (!d.moved){ this.vel = 0; this.select(d.tap); } };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      cv.addEventListener('keydown', e => { const it = this.sel, k = e.key;
        if (it && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k)){ e.preventDefault(); const s = .5; this.moveSel(k === 'ArrowLeft' ? -s : k === 'ArrowRight' ? s : 0, k === 'ArrowUp' ? s : k === 'ArrowDown' ? -s : 0); }
        else if (!it && (k === 'ArrowLeft' || k === 'ArrowRight')){ e.preventDefault(); stopAuto(); this.goal.theta += k === 'ArrowLeft' ? -.25 : .25; }
        if (it && (k === 'r' || k === 'R')) this.act('rotate'); if (it && (k === 'Delete' || k === 'Backspace')){ e.preventDefault(); this.act('del'); } if (k === 'Escape') this.select(null); });
      // hold-to-repeat for view and move buttons
      let rep = null; const stopRep = () => { clearInterval(rep); rep = null; };
      const viewStep = k => { stopAuto(); const G = this.goal;
        if (k === 'rotl') G.theta -= .12; if (k === 'rotr') G.theta += .12; if (k === 'tiltu') G.phi = Math.min(1.45, G.phi + .06); if (k === 'tiltd') G.phi = Math.max(.15, G.phi - .06);
        if (k === 'zoomin') G.r = Math.max(5, G.r - 1.6); if (k === 'zoomout') G.r = Math.min(40, G.r + 1.6);
        if (k === 'mv-l') this.moveSel(-.5, 0); if (k === 'mv-r') this.moveSel(.5, 0); if (k === 'mv-u') this.moveSel(0, .5); if (k === 'mv-d') this.moveSel(0, -.5); };
      this.root.addEventListener('pointerdown', e => { const b = e.target.closest('[data-hold]'); if (!b) return; e.preventDefault(); viewStep(b.dataset.hold); stopRep(); rep = setInterval(() => viewStep(b.dataset.hold), 90); });
      ['pointerup','pointercancel','pointerleave'].forEach(ev => this.root.addEventListener(ev, e => { if (e.target.closest && e.target.closest('[data-hold]')) stopRep(); }));
      document.addEventListener('pointerup', stopRep);
      this.root.addEventListener('keydown', e => { const b = e.target.closest('[data-hold]'); if (b && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); viewStep(b.dataset.hold); } });
      this.root.addEventListener('click', e => {
        const b = e.target.closest('[data-st]'); const c = e.target.closest('[data-pcat]');
        if (c){ $$('[data-pcat]', this.root).forEach(x => x.setAttribute('aria-selected', x === c ? 'true' : 'false')); $$('[data-pgrid]', this.root).forEach(g => g.hidden = g.dataset.pgrid !== c.dataset.pcat); }
        if (!b) return; const k = b.dataset.st;
        if (k === 'top'){ stopAuto(); const on = this.goal.phi < 1.3; this.goal.phi = on ? 1.42 : .62; b.setAttribute('aria-pressed', on); }
        if (k === 'style'){ GL3D.style = GL3D.style === 'illustrated' ? 'realistic' : 'illustrated'; try { localStorage.setItem('ma3ak:style', GL3D.style); } catch(e){} b.textContent = GL3D.style === 'illustrated' ? 'Illustrated' : 'Realistic'; toast(`${b.textContent} graphics`, 'sparkle'); }
        if (k === 'render4k'){ b.disabled = true; b.textContent = 'Rendering…'; setTimeout(() => { const url = this.render4K(); b.disabled = false; b.textContent = '4K photo';
          if (!url) { toast('This device can’t make a 4K picture. Try a computer.', 'alert'); return; }
          openModal({ title:'Your design in 4K', wide:true, body:`<p class="muted small" style="margin:-.5rem 0 1rem">${this.last4k.w} × ${this.last4k.h} pixels. Press and hold (or right-click) the picture to save it.</p><img src="${url}" alt="Your event design rendered in 4K" style="width:100%;border-radius:12px;display:block">` }); }, 60); }
        if (k === 'front'){ stopAuto(); this.goal.theta = Math.PI/2; this.goal.phi = .42; }
        if (k === 'spin'){ this.cam.auto = !this.cam.auto; b.setAttribute('aria-pressed', this.cam.auto); }
        if (k === 'reset'){ this.v._ov = {}; this.v._add = []; this.select(null); this.onChange(this.v); this.sync(this.v); toast('Layout reset to your choices', 'refresh'); }
        if (k === 'palette'){ const p = $('#st-palette', this.root); p.hidden = !p.hidden; b.setAttribute('aria-expanded', !p.hidden); $('#st-venues', this.root).hidden = true; }
        if (k === 'venues'){ const p = $('#st-venues', this.root); p.hidden = !p.hidden; b.setAttribute('aria-expanded', !p.hidden); $('#st-palette', this.root).hidden = true; this.markVenue(); }
        if (k === 'close-venues') $('#st-venues', this.root).hidden = true;
        if (k === 'close-palette'){ $('#st-palette', this.root).hidden = true; $('[data-st="palette"]', this.root).setAttribute('aria-expanded','false'); }
        if (k === 'upload') $('#st-file', this.root).click();
        if (k === 'adjust') this.showMatch(true);
        if (k === 'match-done') this.showMatch(false);
        if (k === 'grid'){ ST._grid = !ST._grid; b.setAttribute('aria-pressed', ST._grid); }
        if (k === 'remove-photo'){ this.v._photo = false; try { localStorage.removeItem('ma3ak:photo'); } catch(e){} this.photoReady = false; this.showMatch(false); this.apply('Back to 3D venues'); }
        if (b.dataset.venue){ this.v._photo = false; this.showMatch(false); this.v.venueType = [b.dataset.venue]; if (b.dataset.venue === 'Boat / yacht') this.v.setting = 'Outdoor'; this.apply(`Venue: ${b.textContent.trim()}`); }
        if (b.dataset.time){ this.v.timeOfDay = b.dataset.time; this.apply(`Time: ${b.textContent.trim()}`); }
        if (b.dataset.size){ this.v.venueSize = b.dataset.size; this.apply(`Size: ${b.dataset.size}`); }
        if (['rotate','dup','del','done'].includes(k)) this.act(k);
      });
      $('#st-file', this.root).addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) this.usePhoto(f).catch(() => toast('That photo couldn’t be opened', 'alert')); e.target.value = ''; });
      $('#st-size', this.root).addEventListener('input', e => { this.goal.r = +e.target.value; });
      // horizon handle
      const hz = $('#st-horizon', this.root); let hd = false;
      hz.addEventListener('pointerdown', e => { hd = true; hz.setPointerCapture(e.pointerId); e.preventDefault(); });
      hz.addEventListener('pointermove', e => { if (!hd) return; const rc = cv.getBoundingClientRect(); const y = Math.max(.02, Math.min(.98, (e.clientY - rc.top) / rc.height)); this.horizon = Math.max(.05, (1 - y)*2 - 1); this.placeHorizon(); });
      hz.addEventListener('pointerup', () => { hd = false; this.v._horizon = this.horizon; this.onChange(this.v); });
      hz.addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown'){ e.preventDefault(); this.horizon = Math.max(.05, Math.min(.95, this.horizon + (e.key === 'ArrowUp' ? .03 : -.03))); this.placeHorizon(); this.v._horizon = this.horizon; this.onChange(this.v); } });
      // palette: tap to add, or drag onto the venue
      let pd = null, ghost = null;
      this.root.addEventListener('pointerdown', e => { const c = e.target.closest('[data-add]'); if (!c) return; e.preventDefault(); pd = { type:c.dataset.add, x:e.clientX, y:e.clientY, moved:false }; c.setPointerCapture(e.pointerId); });
      this.root.addEventListener('pointermove', e => { if (!pd) return; if (!pd.moved && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 8){ pd.moved = true; ghost = document.createElement('div'); ghost.className = 'st-ghost'; ghost.innerHTML = icon(ITEMS[pd.type].icon,'sm') + esc(ITEMS[pd.type].name); document.body.appendChild(ghost); $('#st-palette', this.root).classList.add('dragging'); }
        if (ghost){ ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; const rc = cv.getBoundingClientRect(), over = e.clientX > rc.left && e.clientX < rc.right && e.clientY > rc.top && e.clientY < rc.bottom; ghost.classList.toggle('ok', over && !!this.ray(e.clientX, e.clientY)); } });
      const pend = e => { if (!pd) return; const p = pd; pd = null; $('#st-palette', this.root).classList.remove('dragging'); if (ghost){ ghost.remove(); ghost = null; }
        if (!p.moved){ this.addItem(p.type); return; }
        const rc = cv.getBoundingClientRect(); if (e.clientX > rc.left && e.clientX < rc.right && e.clientY > rc.top && e.clientY < rc.bottom){ const h = this.ray(e.clientX, e.clientY); if (h) this.addItem(p.type, h); } };
      this.root.addEventListener('pointerup', pend); this.root.addEventListener('pointercancel', () => { pd = null; if (ghost){ ghost.remove(); ghost = null; } });
      this.root.addEventListener('keydown', e => { const c = e.target.closest('[data-add]'); if (c && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); this.addItem(c.dataset.add); } });
    }
  }
  function markup(){
    return `<div class="studio" id="studio">
      <canvas class="studio-canvas" tabindex="0" aria-label="3D event designer. Drag items to move them, drag empty space to look around. With an item selected, use arrow keys to move it, R to rotate, Delete to remove."></canvas>
      <div class="st-top"><button type="button" class="st-chip st-chip-btn" id="st-venue" data-st="venues"></button>
        <div class="st-tools" role="toolbar" aria-label="Layout">
          <button type="button" data-st="spin" aria-pressed="true" title="Auto-rotate">${icon('refresh','sm')}<span class="sr-only">Auto-rotate</span></button>
          <button type="button" data-st="top" aria-pressed="false" title="Top view">${icon('layers','sm')}<span class="sr-only">Top view</span></button>
          <button type="button" data-st="style" class="st-text" title="Switch graphics style" aria-label="Graphics style">${GL3D.style === 'illustrated' ? 'Illustrated' : 'Realistic'}</button>
          <button type="button" data-st="render4k" class="st-text" title="Save a 4K picture of your design">4K photo</button>
          <button type="button" data-st="reset" title="Reset layout" class="st-text">Reset</button>
        </div></div>
      <div class="st-pad" role="toolbar" aria-label="Move the view">
        <button type="button" data-hold="tiltu" title="Look from higher" aria-label="Look from higher">${icon('chevron','sm up')}</button>
        <div><button type="button" data-hold="rotl" title="Turn left" aria-label="Turn left">${icon('chevron','sm left')}</button><button type="button" data-st="front" class="st-pad-c" title="Front view" aria-label="Front view">${icon('eye','sm')}</button><button type="button" data-hold="rotr" title="Turn right" aria-label="Turn right">${icon('chevron','sm right')}</button></div>
        <button type="button" data-hold="tiltd" title="Look from lower" aria-label="Look from lower">${icon('chevron','sm')}</button>
        <div class="st-zoom"><button type="button" data-hold="zoomout" aria-label="Zoom out">${icon('minus','sm')}</button><button type="button" data-hold="zoomin" aria-label="Zoom in">${icon('plus','sm')}</button></div>
      </div>
      <div class="st-move" id="st-move" hidden role="toolbar" aria-label="Move selected item"><span>Move</span>
        <button type="button" data-hold="mv-l" aria-label="Move left">${icon('chevron','sm left')}</button><button type="button" data-hold="mv-u" aria-label="Move away">${icon('chevron','sm up')}</button><button type="button" data-hold="mv-d" aria-label="Move closer">${icon('chevron','sm')}</button><button type="button" data-hold="mv-r" aria-label="Move right">${icon('chevron','sm right')}</button></div>
      <div class="st-horizon" id="st-horizon" hidden tabindex="0" role="slider" aria-label="Horizon line: drag to where the ground meets the sky in your photo"><span>Drag me to the horizon in your photo</span></div>
      <div class="st-match" id="st-match" hidden><label>Size of things <input type="range" id="st-size" min="8" max="40" step="0.5" value="22"></label><button type="button" data-st="grid" aria-pressed="true">Grid</button><button type="button" class="st-done" data-st="match-done">Done</button></div>
      <input type="file" id="st-file" accept="image/*" hidden>
      <div class="st-empty" id="st-empty"><b>Your venue is empty</b><span>Answer the steps or add items here, and watch your event build itself.</span></div>
      <p class="st-hint" id="st-hint">Drag to look around. Tap an item to select it, then drag it to move.</p>
      <div class="st-sel" id="st-sel" hidden role="toolbar" aria-label="Selected item"><b id="st-sel-name"></b><span class="st-sel-tip">Drag it to move</span>
        <button type="button" data-st="rotate">${icon('refresh','sm')}Rotate</button><button type="button" data-st="dup">${icon('copy','sm')}Duplicate</button><button type="button" data-st="del">${icon('x','sm')}Delete</button><button type="button" data-st="done">Done</button></div>
      <div class="st-bottom"><span class="st-chip" id="st-count"></span><div class="st-actions"><button type="button" class="btn btn-sm st-venue-btn" data-st="venues" aria-expanded="false" aria-controls="st-venues">${icon('building','sm')}Venue</button><button type="button" class="btn btn-light btn-sm" data-st="palette" aria-expanded="false" aria-controls="st-palette">${icon('plus','sm')}Add items</button></div></div>
      <div class="st-palette st-venues" id="st-venues" hidden>
        <div class="st-ph"><b class="st-ptitle">Choose your venue</b><button type="button" class="icon-btn" data-st="close-venues" aria-label="Close">${icon('x','sm')}</button></div>
        <div class="st-vbody">
          <div class="st-photo-row"><button type="button" class="st-upload" data-st="upload">${icon('image')}<span><b>Use a photo of your own venue</b><small>Your garden, terrace, hall… We’ll place your event on it.</small></span></button>
            <span id="st-photo-tools" hidden><button type="button" class="st-seg" data-st="adjust">Line up photo</button><button type="button" class="st-seg" data-st="remove-photo">Remove photo</button></span></div>
          <div class="st-pgrid st-vgrid">${VENUE_PICK.map(([k,l,i]) => `<button type="button" class="st-item" data-st="v" data-venue="${l}" aria-pressed="false">${icon(i)}<span>${esc(l.split(' (')[0].replace(' / beach club','').replace(' / hotel','').replace(' / château','').replace(' / private house',' & pool').replace(' / marquee',''))}</span></button>`).join('')}</div>
          <div class="st-vrow"><span>Time</span>${[['Lunch / afternoon','Day'],['Sunset','Sunset'],['Evening','Night']].map(([val,l]) => `<button type="button" class="st-seg" data-st="t" data-time="${val}" aria-pressed="false">${l}</button>`).join('')}</div>
          <div class="st-vrow"><span>Size</span>${Object.keys(SIZES).map(k => `<button type="button" class="st-seg" data-st="s" data-size="${k}" aria-pressed="false">${k.split(' (')[0]}<small>${k.match(/\((.*)\)/)[1]}</small></button>`).join('')}</div>
        </div>
      </div>
      <div class="st-palette" id="st-palette" hidden>
        <div class="st-ph"><div class="st-pcats" role="tablist">${CATS.map(([k,l],i) => `<button type="button" role="tab" data-pcat="${k}" aria-selected="${i===0}">${l}</button>`).join('')}</div><button type="button" class="icon-btn" data-st="close-palette" aria-label="Close">${icon('x','sm')}</button></div>
        ${CATS.map(([k],i) => `<div class="st-pgrid" data-pgrid="${k}" ${i?'hidden':''}>${Object.entries(ITEMS).filter(([,d]) => d.cat === k).map(([t,d]) => `<button type="button" class="st-item" data-add="${t}" title="Click to add, or drag onto the venue">${icon(d.icon)}<span>${esc(d.name)}</span></button>`).join('')}</div>`).join('')}
        <p class="st-ptip">Tap to add, or drag an item onto the venue.</p>
      </div>
    </div>`;
  }
  function describe(v){
    const items = []; const ov = v._ov || {}, added = v._add || [];
    const auto = autoLayout(v).filter(a => !(ov[a.id] && ov[a.id].del));
    const all = auto.concat(added); const count = {}; all.forEach(i => count[ITEMS[i.type].name] = (count[ITEMS[i.type].name] || 0) + 1);
    const sz = sizeOf(v); W = sz[0]; D = sz[1]; const ctx = makeCtx(v); const env = envDef(v, ctx);
    return { photo:!!v._photo, venue:env.label, items:Object.entries(count).map(([n,c]) => c > 1 ? `${c}× ${n}` : n), custom: added.length + Object.keys(ov).length };
  }
  function envThumb(label, timeVal){
    const v = { venueType:[label], timeOfDay:timeVal }, sw = W, sd = D; W = 20; D = 16; const ctx = makeCtx(v), e = envDef(v, ctx); W = sw; D = sd;
    return { ...e.def, bloom:.4, cam:{ target:[0,0,0], r:31, phi:.58, theta:.85, fov:.66 }, build(g, sc){ const a = W, b = D; W = 20; D = 16; try { e.def.build(g, sc); } finally { W = a; D = b; } } };
  }
  return { Studio, markup, describe, ITEMS, makeCtx, envThumb, VENUE_PICK, SIZES, venueOf, INDOOR, sizeOf };
})();

/* ---- game.js ---- */
/* =========================================================
   MA3AK EVENT STUDIO — the customizer as a premium mobile game.
   Full-screen 3D venue, HUD, category dock, visual item cards with
   live 3D thumbnails, rarity, unlocks, achievements, compare, send.
   ========================================================= */
const GAME = (() => {
  const RAR = { c:['Classic','r-c'], r:['Rare','r-r'], e:['Epic','r-e'], l:['Legendary','r-l'] };
  const arr = (v, f) => Array.isArray(v[f]) ? v[f] : [];
  const has = (v, f, x) => arr(v, f).includes(x);
  const togArr = (v, f, x) => { v[f] = has(v, f, x) ? arr(v, f).filter(y => y !== x) : arr(v, f).filter(y => !/^(None|Not sure)/.test(y)).concat([x]); };
  const outdoor = v => v._photo || !ST.INDOOR.has(ST.venueOf(v));
  const venueSet = v => !!(v._photo || arr(v, 'venueType').some(x => x !== 'Not sure'));

  /* ---------- catalogue: every card maps to a real choice in the request ---------- */
  const F = (id, label, item, rar, field, val, extra={}) => ({ id, label, item, rar, on:v => field === 'cake' ? String(v.cake||'').startsWith('Yes') : (typeof val === 'string' && !Array.isArray(v[field]) && field in RADIO ? v[field] === val : has(v, field, val)), toggle:v => { if (field === 'cake') v.cake = String(v.cake||'').startsWith('Yes') ? '' : 'Yes, a statement cake'; else if (field in RADIO) v[field] = v[field] === val ? '' : val; else togArr(v, field, val); }, ...extra });
  const RADIO = { balloons:1 };
  const FX = (id, label, rar, val, anim, extra={}) => ({ id, label, rar, fx:anim, on:v => has(v,'effects',val), toggle:v => togArr(v,'effects',val), lock:v => !venueSet(v) ? 'Choose a venue first' : null, ...extra });
  const NEEDS_OUT = v => !venueSet(v) ? 'Choose a venue first' : (!outdoor(v) ? 'Needs an outdoor venue' : null);
  const ADD = (id, label, item, rar) => ({ id, label, item, rar, addOnly:true, on:v => (v._add||[]).some(a => a.type === item), toggle:null });

  const CARDS = {
    stage:[ F('dancefloor','Dance floor','dancefloor','c','areas','Dance floor'), F('dj','DJ booth','dj','c','music','DJ'), F('band','Live band','band','r','music','Live band'), F('stage','Stage','stage','c','areas','Stage'),
      F('kosha','Kosha','kosha','e','areas','Kosha / couple’s stage'), F('sweetheart','Sweetheart table','sweetheart','r','areas','Sweetheart or head table'), F('piano','Grand piano','piano','e','music','Pianist'),
      F('performers','Dabke & zaffe','performers','r','music','Dabke troupe'), F('speakers','Sound system','speakers','c','technical','Sound system') ],
    decor:[ F('flowerwall','Flower wall','flowerwall','r','backdrop','Flower wall'), F('arch','Floral arch','arch','r','backdrop','Floral arch'), F('balloonarch','Balloon arch','balloonarch','c','backdrop','Balloon arch'),
      F('neon','Neon sign','neon','r','backdrop','Neon sign'), F('drape','Draped backdrop','drape','c','backdrop','Draped fabric'), F('balloons','Balloon clusters','balloons','c','balloons','A few accents'),
      F('welcome','Welcome sign','welcome','c','extrasDecor','Welcome sign'), F('candles','Candles & lanterns','candles','c','lights','Candlelight'), F('gifts','Gift table','gifts','c','areas','Gift table'),
      F('heater','Patio heaters','heater','c','technical','Heaters'), ADD('olive','Olive tree','olive','c'), ADD('umbrella','Umbrella lounge','umbrella','c') ],
    lights:[ F('chandelier','Chandeliers','chandelier','r','lights','Chandeliers'), F('string','String lights','stringcanopy','c','lights','String / fairy lights'), F('upwarm','Warm uplights','uplight','c','lights','Warm uplighting'),
      F('upcolor','Color uplights','uplight','r','lights','Colored uplighting'), F('truss','Moving lights','truss','e','lights','Moving heads'), F('ledscreen','LED screen','ledscreen','e','backdrop','LED screen'), F('ledwall','LED panels','ledwall','r','technical','Screens & projectors') ],
    fx:[ F('sparks','Cold sparks','sparks','e','effects','Cold sparks', { lock:v => !venueSet(v) ? 'Choose a venue first' : null }), FX('confetti','Confetti','r','Confetti','fall'), FX('fog','Low fog','r','Low fog / dry ice','fog'), FX('bubbles','Bubbles','c','Bubbles','rise'),
      FX('lasers','Lasers','e','Lasers','sweep'), FX('flames','Flame jets','e','Flame effects','flame'), FX('balloondrop','Balloon drop','r','Balloon drop','fall'),
      FX('fireworks','Fireworks','l','Fireworks','burst', { lock:NEEDS_OUT }), FX('drone','Drone light show','l','Drone light show','drone', { lock:NEEDS_OUT }), FX('lanterns','Sky lanterns','r','Sky lanterns','rise', { lock:NEEDS_OUT }) ],
    food:[ F('bar','Bar','bar','c','areas','Bar area'), F('buffet','Buffet','buffet','c','service','Buffet'), F('station','Live stations','station','r','service','Live cooking stations'), F('grill','BBQ grill','grill','c','service','BBQ / grill'),
      F('foodtruck','Food truck','foodtruck','e','service','Food trucks'), F('cake','Cake','cake','r','cake',''), F('sweets','Sweets table','sweets','r','desserts','Sweets table'), F('fountain','Chocolate fountain','fountain','e','desserts','Chocolate fountain'), F('coffee','Coffee corner','coffee','c','drinks','Turkish coffee service') ],
    fun:[ F('photobooth','Photo booth','photobooth','r','activities','Photo booth'), F('booth360','360 booth','booth360','e','activities','360 video booth'), F('argileh','Argileh lounge','argileh','r','activities','Hookah / argileh corner'),
      F('lounge','Lounge set','sofa','c','areas','Lounge corner'), F('kids','Kids’ play area','kidsplay','c','areas','Kids’ area'), F('games','Lawn games','games','c','activities','Games / lawn games'),
      F('casino','Casino table','casino','e','activities','Casino tables'), F('painter','Live painter','easel','r','activities','Live painter'), F('car','Classic car','car','l','transport','Classic car'), ADD('firepit','Fire pit','firepit','r') ],
  };
  const SEATING = [['Round tables','round','Round tables'],['Long imperial tables','imperial','Imperial'],['Mixed rounds & long tables','long','Mixed'],['Cocktail / standing','cocktail','Cocktail'],['Theater rows','rows','Theater'],['Lounge seating','sofa','Lounge']];
  const STYLES = { Elegant:['#F4EFE6','#C8A96B','#1F2D4A'], Luxury:['#141414','#C8A96B','#F4EFE6'], Modern:['#F4F4F2','#141414','#C9CCD1'], Minimal:['#FFFFFF','#E8E2D8','#A7B59A'], Romantic:['#F2D3CC','#C99A97','#FFFFFF'], Glam:['#6B1E2A','#C8A96B','#141414'],
    Boho:['#C0714F','#E8D5A8','#A7B59A'], Rustic:['#8B6A4C','#E8D5A8','#4E6B3A'], 'Traditional Lebanese':['#1F5B45','#C8A96B','#F4EFE6'], Vintage:['#C99A97','#E8D5A8','#7A5C42'], Garden:['#A7B59A','#FFFFFF','#F2D3CC'], Beach:['#AFCBE3','#F4EFE6','#E8D5A8'], Royal:['#1F2D4A','#C8A96B','#6B1E2A'], Playful:['#F3C3A2','#AFCBE3','#C7B8DD'] };
  const PALETTES = [['Blush & gold',['Blush','Gold','Ivory']],['Sage & ivory',['Sage','Ivory','Gold']],['Black & gold',['Black','Gold']],['Navy & silver',['Navy','Silver','White']],['Terracotta',['Terracotta','Peach','Ivory']],['Lavender',['Lavender','White','Silver']],['Emerald night',['Emerald','Gold','Burgundy']]];
  const TEMPLATES = {
    wedding:{ venueType:['Ballroom / hotel'], guests:150, seating:['Round tables'], areas:['Dance floor','Kosha / couple’s stage','Bar area'], music:['DJ'], lights:['Chandeliers','Warm uplighting'], colors:['Ivory','Gold','Blush'], chairs:['Gold chiavari'], centerpieces:['Tall arrangements'], flowerLevel:'Lavish', cake:'Yes, a statement cake', cakeTiers:4, effects:['Cold sparks'] },
    engagement:{ venueType:['Garden / green area'], timeOfDay:'Sunset', guests:60, seating:['Long imperial tables'], areas:['Sweetheart or head table'], backdrop:['Flower wall'], lights:['String / fairy lights','Candlelight'], colors:['Blush','Ivory','Sage'], chairs:['Wooden cross-back'], flowerLevel:'Lavish', cake:'Yes, a simple cake' },
    birthday:{ venueType:['Industrial loft'], guests:50, seating:['Cocktail / standing'], areas:['Dance floor','Bar area'], music:['DJ'], backdrop:['Balloon arch'], balloons:'Garlands & arches', colors:['Blush','Gold','White'], cake:'Yes, a statement cake', desserts:['Sweets table'], effects:['Confetti'], activities:['Photo booth'] },
    graduation:{ venueType:['Rooftop'], timeOfDay:'Evening', guests:100, seating:['Round tables'], areas:['Dance floor','Stage'], music:['DJ'], colors:['Black','Gold'], lights:['String / fairy lights'], effects:['Confetti'], activities:['Photo booth'], cake:'Yes, a simple cake' },
    corporate:{ venueType:['Ballroom / hotel'], guests:200, seating:['Theater rows'], areas:['Stage','Welcome / reception area'], backdrop:['LED screen'], lights:['Moving heads'], colors:['Navy','Silver'], service:['Cocktail & canapés'], drinks:['Coffee & tea corner'], technical:['Sound system'] },
    private:{ venueType:['Rooftop'], timeOfDay:'Evening', guests:60, seating:['Cocktail / standing'], areas:['Dance floor','Bar area','Lounge corner'], music:['DJ'], lights:['String / fairy lights','Neon'], colors:['Black','Gold'], effects:['Lasers'] },
    'baby-shower':{ venueType:['Garden / green area'], timeOfDay:'Lunch / afternoon', guests:40, seating:['Long imperial tables'], backdrop:['Balloon arch'], balloons:'Garlands & arches', colors:['Sky blue','Blush','Ivory'], cake:'Yes, a simple cake', desserts:['Sweets table','Macarons'] },
    bachelor:{ venueType:['Industrial loft'], guests:30, seating:['Lounge seating'], areas:['Bar area','Dance floor'], music:['DJ'], effects:['Lasers'], activities:['Casino tables','Hookah / argileh corner'], colors:['Black','Burgundy'] },
    bachelorette:{ venueType:['Boat / yacht'], timeOfDay:'Sunset', guests:25, seating:['Lounge seating'], balloons:'Garlands & arches', colors:['Blush','White','Gold'], music:['DJ'], activities:['Photo booth'] },
    beach:{ venueType:['Beach / beach club'], timeOfDay:'Sunset', guests:80, seating:['Long imperial tables'], lights:['String / fairy lights','Lanterns'], colors:['Ivory','Terracotta'], areas:['Bar area'], music:['DJ'], effects:['Fireworks'] },
    outdoor:{ venueType:['Tent / marquee'], timeOfDay:'Sunset', guests:120, seating:['Long imperial tables'], lights:['String / fairy lights'], colors:['Sage','Ivory'], chairs:['Wooden cross-back'], areas:['Dance floor'], music:['Live band'] },
    other:{ venueType:['Historic palace / château'], guests:80, seating:['Long imperial tables'], lights:['Chandeliers','Candlelight'], colors:['Emerald','Gold','Burgundy'], centerpieces:['Candles & candelabras'], music:['Pianist'] }
  };

  /* ---------- categories & progression ---------- */
  const CATS = [
    { id:'event', name:'Event', icon:'sparkle', done:v => !!v.eventType },
    { id:'venue', name:'Venue', icon:'building', done:venueSet, tabs:['Setting','Time','Size'] },
    { id:'guests', name:'Guests', icon:'users', done:v => +v.guests > 0 && arr(v,'seating').length > 0, tabs:['Seating','Guests'] },
    { id:'style', name:'Style', icon:'palette', done:v => arr(v,'colors').length > 0 && (arr(v,'style').length > 0 || arr(v,'chairs').length > 0), tabs:['Colors','Theme','Chairs','Tables','Flowers'] },
    { id:'stage', name:'Stage', icon:'music', done:v => CARDS.stage.some(c => c.on(v)), tabs:['Stage & music','Dance floor'] },
    { id:'decor', name:'Decor', icon:'flower', done:v => CARDS.decor.some(c => c.on(v)) },
    { id:'lights', name:'Lights', icon:'bulb', done:v => CARDS.lights.some(c => c.on(v)) || CARDS.fx.some(c => c.on(v)), tabs:['Lighting','Effects'] },
    { id:'food', name:'Food', icon:'utensils', done:v => CARDS.food.some(c => c.on(v)), tabs:['Stations','Cake','Menu','Drinks'] },
    { id:'fun', name:'Fun', icon:'gift', done:v => CARDS.fun.some(c => c.on(v)) },
    { id:'details', name:'Details', icon:'clipboard', done:v => !!(v.date || v.budget), tabs:['When','Music','Photo','Beauty','Guests','Extras'] },
    { id:'invite', name:'Invitation', icon:'mail', done:() => !!(PLAN.invite && PLAN.invite.published) },
    { id:'guestlist', name:'Guest list', icon:'users', done:() => !!(PLAN.guests && PLAN.guests.length) },
    { id:'timeline', name:'Timeline', icon:'calendar', done:() => !!(PLAN.timeline && PLAN.timeline.length) },
    { id:'checklist', name:'Checklist', icon:'check', done:() => !!(PLAN.checklist && PLAN.checklist.length && PLAN.checklist.every(x => x.done)) },
    { id:'send', name:'Send', icon:'send', done:v => !!v._sentAt }
  ];
  const GROUP = { event:'Setup', venue:'Setup', guests:'Setup', style:'Setup', stage:'Design', decor:'Design', lights:'Design', food:'Design', fun:'Design', details:'Finish', invite:'Plan', guestlist:'Plan', timeline:'Plan', checklist:'Plan', send:'Finish' };
  const CAT_OF = {}; Object.entries({ stage:'stage', decor:'decor', lights:'lights', fx:'lights', food:'food', fun:'fun' }).forEach(([k, cat]) => { CARDS[k].forEach(c => { CAT_OF[c.id] = cat; }); });
  const DEFAULT_TAGS = { dancefloor:'popular', dj:'popular', flowerwall:'popular', string:'popular outdoor', sparks:'popular', bar:'popular', photobooth:'popular', cake:'popular', kosha:'luxury', chandelier:'luxury indoor', piano:'luxury', car:'luxury', drone:'luxury outdoor', fireworks:'outdoor', lanterns:'outdoor', grill:'outdoor', foodtruck:'outdoor', games:'outdoor', heater:'outdoor', umbrella:'outdoor', olive:'outdoor', firepit:'outdoor', truss:'modern', ledscreen:'modern', ledwall:'modern', neon:'modern', lasers:'modern', upcolor:'modern' };
  Object.values(CARDS).flat().forEach(c => { c.tags = (DEFAULT_TAGS[c.id] || '').split(' ').filter(Boolean); c.popular = c.tags.includes('popular'); });
  // Inspire Me: complete designs the customer can start from (every change is undoable)
  const INSPIRE = [
    ['Luxury beach wedding','Sunset vows by the sea, gold and ivory, fireworks finale','wedding',{ venueType:['Beach / beach club'], timeOfDay:'Sunset', guests:180, venueSize:'Medium (up to 200)', seating:['Long imperial tables'], areas:['Dance floor','Bar area','Sweetheart or head table'], backdrop:['Floral arch'], lights:['String / fairy lights','Lanterns'], colors:['Ivory','Gold','Peach'], chairs:['Gold chiavari'], centerpieces:['Tall arrangements'], flowerLevel:'Lavish', music:['DJ'], effects:['Fireworks','Cold sparks'], cake:'Yes, a statement cake', cakeTiers:5, style:['Luxury'] }],
    ['Lebanese wedding','Zaffe entrance, kosha, dabke and a grand ballroom','wedding',{ venueType:['Ballroom / hotel'], guests:300, venueSize:'Large (up to 400)', seating:['Round tables'], areas:['Dance floor','Kosha / couple’s stage','Bar area'], music:['DJ','Dabke troupe','Zaffe'], lights:['Chandeliers','Warm uplighting'], colors:['Ivory','Gold','Blush'], chairs:['Gold chiavari'], centerpieces:['Tall arrangements'], flowerLevel:'Over the top', effects:['Cold sparks','Low fog / dry ice'], cake:'Yes, a statement cake', cakeTiers:6, style:['Traditional Lebanese','Luxury'], drinks:['Turkish coffee service','Arak'] }],
    ['Afro house night','Rooftop beats, lasers and a lounge under the stars','private',{ venueType:['Rooftop'], timeOfDay:'Evening', guests:120, seating:['Cocktail / standing'], areas:['Dance floor','Bar area','Lounge corner'], music:['DJ'], lights:['Moving heads','Colored uplighting','String / fairy lights'], danceFloor:'LED', colors:['Black','Terracotta','Gold'], effects:['Lasers','Low fog / dry ice'], activities:['Hookah / argileh corner'], style:['Modern'] }],
    ['Corporate gala','Stage, LED screen and theater seating for a launch night','corporate',{ venueType:['Ballroom / hotel'], guests:250, venueSize:'Large (up to 400)', seating:['Theater rows'], areas:['Stage','Welcome / reception area','Bar area'], backdrop:['LED screen'], lights:['Moving heads','Spotlights'], technical:['Sound system','Screens & projectors'], colors:['Navy','Silver','White'], service:['Cocktail & canapés'], drinks:['Coffee & tea corner'], style:['Elegant','Modern'] }],
    ['Sunset festival','Outdoor stage, food trucks and string lights','outdoor',{ venueType:['Mountain resort'], timeOfDay:'Sunset', guests:200, venueSize:'Large (up to 400)', seating:['Cocktail / standing'], areas:['Stage','Dance floor','Bar area'], music:['Live band','DJ'], lights:['String / fairy lights'], service:['Food trucks','BBQ / grill'], colors:['Terracotta','Peach','Sage'], effects:['Sky lanterns'], activities:['Games / lawn games'], style:['Boho'] }],
    ['Garden engagement','Flower wall, long tables and candlelight','engagement',{ venueType:['Garden / green area'], timeOfDay:'Sunset', guests:70, seating:['Long imperial tables'], areas:['Sweetheart or head table'], backdrop:['Flower wall'], lights:['String / fairy lights','Candlelight'], colors:['Blush','Ivory','Sage'], chairs:['Wooden cross-back'], flowerLevel:'Lavish', cake:'Yes, a simple cake', style:['Romantic','Garden'] }],
    ['Glam birthday','Balloon arch, sweets table, photo booth and confetti','birthday',{ venueType:['Industrial loft'], guests:60, seating:['Cocktail / standing'], areas:['Dance floor','Bar area'], backdrop:['Balloon arch','Neon sign'], balloons:'Garlands & arches', music:['DJ'], colors:['Blush','Gold','White'], cake:'Yes, a statement cake', desserts:['Sweets table'], effects:['Confetti'], activities:['Photo booth','360 video booth'], style:['Glam'] }],
    ['Yacht celebration','Sunset on the water with lounges and balloons','bachelorette',{ venueType:['Boat / yacht'], timeOfDay:'Sunset', guests:30, seating:['Lounge seating'], balloons:'Garlands & arches', music:['DJ'], colors:['Blush','White','Gold'], drinks:['Champagne / bubbly'], activities:['Photo booth'], style:['Glam'] }],
  ];
  /* ---------- Dream Event generator: a few answers → a complete, coherent design.
     Rule-based and transparent (no AI needed); every value is a real catalogue option. ---------- */
  const DREAM = {
    types:[['wedding','Wedding'],['engagement','Engagement'],['birthday','Birthday'],['graduation','Graduation'],['corporate','Corporate'],['private','Private party'],['baby-shower','Baby shower'],['bachelorette','Bachelorette'],['bachelor','Bachelor'],['beach','Beach event'],['outdoor','Outdoor'],['other','Dinner / other']],
    styles:{ Luxury:{ colors:['Ivory','Gold','Black'], chairs:'Gold chiavari', linens:'Ivory', center:'Tall arrangements', flowers:'Lavish' }, Modern:{ colors:['White','Black','Silver'], chairs:'Ghost / transparent', linens:'White', center:'Low arrangements', flowers:'Minimal' },
      Elegant:{ colors:['Ivory','Champagne','Sage'], chairs:'Silver chiavari', linens:'Ivory', center:'Tall arrangements', flowers:'Moderate' }, Minimal:{ colors:['White','Sage'], chairs:'Wishbone', linens:'No cloth (bare wood / glass)', center:'Low arrangements', flowers:'Minimal' },
      Romantic:{ colors:['Blush','Ivory','Dusty rose'], chairs:'Gold chiavari', linens:'Colored (from palette)', center:'Candles & candelabras', flowers:'Lavish' }, Boho:{ colors:['Terracotta','Peach','Sage'], chairs:'Rattan', linens:'Runners only', center:'Low arrangements', flowers:'Moderate' },
      Garden:{ colors:['Sage','White','Blush'], chairs:'Wooden cross-back', linens:'White', center:'Low arrangements', flowers:'Lavish' }, Glam:{ colors:['Burgundy','Gold','Black'], chairs:'Velvet', linens:'Sequins', center:'Tall arrangements', flowers:'Lavish' },
      'Traditional Lebanese':{ colors:['Emerald','Gold','Ivory'], chairs:'Gold chiavari', linens:'Ivory', center:'Tall arrangements', flowers:'Over the top' }, Royal:{ colors:['Navy','Gold','Burgundy'], chairs:'Velvet', linens:'Velvet', center:'Candles & candelabras', flowers:'Lavish' } },
    moods:{ Romantic:{ lights:['Candlelight','String / fairy lights','Warm uplighting'], effects:['Low fog / dry ice'], music:['DJ','String quartet / violin'], genres:['Jazz / lounge'], time:'Sunset', floor:'White / mirror' },
      Elegant:{ lights:['Chandeliers','Warm uplighting'], effects:['Cold sparks'], music:['DJ','Pianist'], genres:['Jazz / lounge','International pop'], time:'Evening', floor:'Glossy black' },
      Party:{ lights:['Colored uplighting','Moving heads'], effects:['Confetti','Lasers'], music:['DJ'], genres:['International pop','Hip-hop / R&B'], time:'Evening', floor:'LED' },
      'Afro House':{ lights:['Moving heads','Colored uplighting','String / fairy lights'], effects:['Lasers','Low fog / dry ice'], music:['DJ','Drummers (tabl)'], genres:['House / deep house'], time:'Evening', floor:'LED', lounge:true },
      Chill:{ lights:['String / fairy lights','Candlelight','Lanterns'], effects:[], music:['DJ'], genres:['Jazz / lounge'], time:'Sunset', floor:'Wooden', lounge:true },
      Traditional:{ lights:['Chandeliers','Warm uplighting'], effects:['Cold sparks'], music:['DJ','Zaffe','Dabke troupe'], genres:['Lebanese classics','Arabic pop'], time:'Evening', floor:'Glossy black' } },
    venues:['Ballroom / hotel','Garden / green area','Beach / beach club','Rooftop','Boat / yacht','Villa / private house','Mountain resort','Tent / marquee','Vineyard','Historic palace / château','Industrial loft','Restaurant'],
    budgets:[['Up to $5,000',5000],['$5,000 – $15,000',15000],['$15,000 – $40,000',40000],['$40,000+',80000]],
  };
  const RANK = { c:0, r:1, e:2, l:3 };
  const valueRar = (field, val) => { const c = Object.values(CARDS).flat().find(x => x.field === field && x.value === val); return c ? c.rar : 'c'; };
  function concept(o){
    const st = DREAM.styles[o.style] || DREAM.styles.Elegant, md = DREAM.moods[o.mood] || DREAM.moods.Elegant, guests = Math.max(10, +o.guests || 100), budget = +o.budget || 0;
    const perGuest = budget ? budget / guests : 200, cap = perGuest < 40 ? 1 : perGuest < 110 ? 2 : 3; // budget limits how premium the picks are
    const ok = (field, list) => list.filter(x => RANK[valueRar(field, x)] <= cap);
    const indoor = ['Ballroom / hotel','Restaurant','Historic palace / château','Industrial loft'].includes(o.venue);
    const t = o.type, wedding = t === 'wedding', engage = t === 'engagement', kidsy = ['birthday','baby-shower'].includes(t), corp = ['corporate','graduation'].includes(t), party = ['Party','Afro House'].includes(o.mood);
    const areas = ['Bar area']; if (o.mood !== 'Chill' || guests > 40) areas.push('Dance floor');
    if (wedding) areas.push('Kosha / couple’s stage'); if (engage) areas.push('Sweetheart or head table'); if (corp) areas.push('Stage', 'Welcome / reception area'); if (md.lounge || o.mood === 'Chill') areas.push('Lounge corner'); if (kidsy && guests > 30) areas.push('Kids’ area');
    const seating = corp && t === 'corporate' && guests > 80 ? 'Theater rows' : o.mood === 'Chill' ? 'Lounge seating' : party && !wedding ? 'Cocktail / standing' : (wedding || engage) && guests <= 120 ? 'Long imperial tables' : 'Round tables';
    let lights = md.lights.slice(); if (!indoor) lights = lights.filter(l => l !== 'Chandeliers').concat(lights.includes('String / fairy lights') ? [] : ['String / fairy lights']); if (indoor && o.mood === 'Chill') lights = ['Candlelight','Warm uplighting'];
    let effects = ok('effects', md.effects); if (!indoor && cap >= 3 && (wedding || o.mood === 'Party')) effects.push('Fireworks');
    const backdrop = ok('backdrop', kidsy ? ['Balloon arch'] : corp ? (t === 'corporate' ? ['LED screen'] : ['Draped fabric']) : (wedding || engage || o.mood === 'Romantic') ? [o.venue === 'Garden / green area' || o.venue === 'Vineyard' ? 'Floral arch' : 'Flower wall'] : party ? ['Neon sign'] : ['Draped fabric']);
    const out = { eventType:t, venueType:[o.venue], timeOfDay:indoor ? 'Evening' : md.time, guests, style:[o.style], colors:st.colors.slice(), chairs:[st.chairs], linens:[st.linens], centerpieces:[st.center], flowerLevel:st.flowers,
      seating:[seating], areas, music:md.music.slice(), genres:md.genres.slice(), lights, effects, backdrop, danceFloor:cap >= 2 || md.floor !== 'LED' ? md.floor : 'Glossy black',
      service:[guests > 150 ? 'Buffet' : party ? 'Cocktail & canapés' : 'Plated (served)'], drinks:t === 'corporate' ? ['Coffee & tea corner','Soft drinks & water'] : ['Signature cocktail','Soft drinks & water'],
      theme:`${o.style} ${evName(t).toLowerCase()} with a ${o.mood.toLowerCase()} atmosphere` };
    if (budget) out.budget = budget;
    if (wedding || engage || kidsy) { out.cake = 'Yes, a statement cake'; out.cakeTiers = wedding ? 4 : 2; out.desserts = ['Sweets table']; }
    if (kidsy) out.balloons = 'Garlands & arches';
    if (lights.includes('Moving heads') && cap < 2) out.lights = lights.filter(l => l !== 'Moving heads').concat(['Colored uplighting']).filter((x, i, a) => a.indexOf(x) === i);
    if (o.mood === 'Traditional' || o.style === 'Traditional Lebanese') { out.drinks.push('Turkish coffee service'); out.desserts = (out.desserts || []).concat(['Lebanese sweets (knefe, maamoul…)']); }
    if (guests >= 60 && cap >= 2 && !corp) out.activities = ['Photo booth'];
    return out;
  }
  const pickR = a => a[Math.floor(Math.random() * a.length)];
  const surpriseOpts = () => { const style = pickR(Object.keys(DREAM.styles)), mood = pickR(Object.keys(DREAM.moods)); return { type:pickR(DREAM.types)[0], style, mood, venue:pickR(DREAM.venues), guests:pickR([40, 60, 80, 120, 150, 200, 250]), budget:pickR(DREAM.budgets)[1] }; };
  const PLAN = { invite:undefined, rsvps:null, guests:null, stats:null, timeline:null, checklist:null, filter:'all', q:'' };
  const TIMELINES = {
    wedding:[['17:30','Guests arrive, welcome drinks'],['18:30','Ceremony'],['19:30','Zaffe and the couple’s entrance'],['20:00','Dinner'],['21:00','First dance'],['21:30','DJ and dancing'],['23:00','Cake cutting'],['00:30','Closing']],
    engagement:[['19:00','Guests arrive'],['19:45','Couple’s entrance'],['20:00','Ring moment and toast'],['20:30','Dinner'],['21:30','Music and dancing'],['23:30','Closing']],
    birthday:[['20:00','Guests arrive'],['21:00','Food and drinks'],['22:00','Cake and candles'],['22:15','Party'],['01:00','Closing']],
    corporate:[['18:00','Registration and welcome'],['18:45','Opening remarks'],['19:00','Presentations'],['20:00','Networking dinner'],['21:30','Closing']],
    graduation:[['19:00','Guests arrive'],['19:30','Graduates’ entrance'],['20:00','Speeches and toast'],['20:30','Dinner'],['21:30','DJ and dancing'],['00:00','Closing']],
    _:[['19:00','Guests arrive'],['20:00','Dinner'],['21:00','Music and dancing'],['22:30','Highlight moment'],['00:00','Closing']] };
  const PHASES = ['60+ days before','30 days before','7 days before','Event day'];
  function checklistFor(v){ const a = (f, x) => (Array.isArray(v[f]) ? v[f] : []).includes(x), any = f => (Array.isArray(v[f]) ? v[f] : []).length > 0, L = [];
    const add = (ph, t, cond = true) => { if (cond) L.push({ phase:ph, title:t, done:false }); };
    add(PHASES[0], 'Confirm the venue and date'); add(PHASES[0], 'Set the budget', !v.budget); add(PHASES[0], 'Book the DJ or band', any('music')); add(PHASES[0], 'Book the photographer', any('photo') || a('activities','Photo booth')); add(PHASES[0], 'Send save-the-dates', (+v.guests || 0) >= 50);
    add(PHASES[1], 'Confirm the catering menu', any('service')); add(PHASES[1], 'Confirm decor and flowers', any('backdrop') || !!v.flowerLevel); add(PHASES[1], 'Confirm lighting and effects', any('lights') || any('effects')); add(PHASES[1], 'Check permits for fireworks', a('effects','Fireworks') || a('effects','Drone light show')); add(PHASES[1], 'Send invitations'); add(PHASES[1], 'Order the cake', String(v.cake || '').startsWith('Yes'));
    add(PHASES[2], 'Confirm the final guest count'); add(PHASES[2], 'Finalize the seating plan'); add(PHASES[2], 'Share the timeline with every provider'); add(PHASES[2], 'Share dietary needs with the caterer'); add(PHASES[2], 'Collect contacts for the day');
    add(PHASES[3], 'Venue setup and decor'); add(PHASES[3], 'Sound check', any('music')); add(PHASES[3], 'Lighting check', any('lights')); add(PHASES[3], 'Catering setup', any('service')); add(PHASES[3], 'Welcome team ready');
    return L; }
  const progress = v => Math.round(CATS.slice(0, 10).filter(c => c.done(v)).length / 10 * 100);
  const LEVELS = [[0,'Sketch'],[25,'Concept'],[50,'Showcase'],[75,'Grand'],[100,'Masterpiece']];
  const levelOf = p => LEVELS.filter(l => p >= l[0]).pop();
  const ACH = [
    ['start','Let’s celebrate','You picked your event','sparkle',v => !!v.eventType],
    ['venue','Dream venue','You chose where it happens','building',venueSet],
    ['own','Home sweet venue','You used a photo of your own place','image',v => !!v._photo],
    ['palette','Color story','You built a color palette','palette',v => arr(v,'colors').length >= 2],
    ['party','Party starter','Dance floor plus music','music',v => has(v,'areas','Dance floor') && (has(v,'music','DJ') || has(v,'music','Live band'))],
    ['bloom','In full bloom','You went lavish with flowers','flower',v => ['Lavish','Over the top'].includes(v.flowerLevel)],
    ['sweet','Sweet tooth','Cake and a sweets table','cake',v => String(v.cake||'').startsWith('Yes') && arr(v,'desserts').length > 0],
    ['snap','Picture perfect','A photo booth for memories','camera',v => has(v,'activities','Photo booth') || has(v,'activities','360 video booth')],
    ['show','Showstopper','You added a legendary moment','star',v => has(v,'effects','Fireworks') || has(v,'effects','Drone light show') || has(v,'transport','Classic car')],
    ['full','Full house','150 guests or more','users',v => +v.guests >= 150],
    ['architect','Architect','You arranged the layout yourself','layers',v => (v._add||[]).length + Object.keys(v._ov||{}).length >= 3],
    ['master','Masterpiece','Every category designed','star',v => progress(v) === 100]
  ];

  /* ---------- live 3D thumbnails (rendered once, cached) ---------- */
  const thumbs = new Map(); let tq = [], tBusy = false;
  const THUMB_FIT = { chandelier:{ ty:3.6, r:4.4 }, car:{ r:7 }, ledscreen:{ r:8.5, ty:2.4 }, truss:{ r:8.5, ty:2.6 }, stringcanopy:{ r:9, ty:1.8 }, foodtruck:{ r:7.5, ty:1.2 }, imperial:{ r:9 }, rows:{ r:7.5 }, band:{ r:7.2, ty:.9 }, kosha:{ r:8 }, flowerwall:{ r:6.5, ty:1.4 }, arch:{ r:6.2, ty:1.6 }, balloonarch:{ r:6.5, ty:1.4 }, neon:{ r:4, ty:2.2 }, balloons:{ r:4.2, ty:2 }, dancefloor:{ r:7.2, phi:.7 }, uplight:{ r:3.6, ty:1.4 }, heater:{ r:3.6, ty:1.1 }, welcome:{ r:2.8, ty:.9 }, sparks:{ r:3.8, ty:.9 } };
  function itemDef(type, ctx){
    const d = ST.ITEMS[type], f = THUMB_FIT[type] || {}, r = d.r;
    return { sky:['#2b2723','#121110'], fog:'#141211', fogD:.004, hemi:['#F6EBDD','#3a3028',1.05], sun:{ dir:[.45,.95,.35], col:'#FFF1DC', i:1.15 }, exposure:1.1, shadow:.5, shadowAmb:.35, clouds:0, sunVis:0, bloom:.35,
      shadowBox:{ cx:0, cz:0, half:r*1.8 + 1.5 }, cam:{ target:[0, f.ty ?? Math.min(1.1, r*.35), 0], r:f.r ?? Math.max(2.6, r*2.4), phi:f.phi ?? .4, theta:f.theta ?? 1.0, fov:.6 },
      build(g, sc){ g.cyl(0,-.08,0,r*1.15,r*1.22,.08,'#2c2926',{ s:.55 },56); d.build(g, sc, {}, ctx); } };
  }
  function chairDef(style){ return { ...itemDef('cocktail', ST.makeCtx({})), cam:{ target:[0,.55,0], r:2.1, phi:.32, theta:1.15, fov:.6 }, shadowBox:{ cx:0, cz:0, half:2 }, build(g){ g.cyl(0,-.08,0,.7,.75,.08,'#2c2926',{ s:.55 },48); S3.C.chair(g, 0, 0, .5, style); } }; }
  function thumb(key, makeDef, el){
    if (thumbs.has(key)) { setImg(el, thumbs.get(key)); return; }
    el.dataset.tkey = key; tq.push({ key, makeDef, el }); if (!tBusy) pump();
  }
  function setImg(el, url){ const img = el.querySelector('img'); if (!img) return; img.src = url; img.onload = () => el.classList.add('ready'); if (img.complete) el.classList.add('ready'); }
  function pump(){
    // render visible thumbnails first; one per frame keeps the UI at 60 fps
    tq = tq.filter(j => j.el.isConnected); if (!tq.length || window.__ma3akPauseThumbs){ tBusy = false; return; } tBusy = true;
    const vis = tq.findIndex(j => { const r = j.el.getBoundingClientRect(); return r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight; });
    const job = tq.splice(vis >= 0 ? vis : 0, 1)[0];
    const done = () => setTimeout(pump, 24);
    if (thumbs.has(job.key)) { setImg(job.el, thumbs.get(job.key)); return done(); }
    requestAnimationFrame(() => { try { const px = Math.round(Math.min(2.5, devicePixelRatio || 1) * 150); const url = GL3D.snapshot(job.makeDef(), px, Math.round(px*.82)); thumbs.set(job.key, url); document.querySelectorAll(`[data-tkey="${CSS.escape(job.key)}"]`).forEach(e => setImg(e, url)); } catch(e){} done(); });
  }

  /* ---------- the game ---------- */
  function create(root, hooks){
    const v = hooks.state || czState();
    if (hooks.catalog) hooks.catalog.forEach(it => { const c = Object.values(CARDS).flat().find(x => x.id === it.id); if (c){ c.label = it.name; c.rar = it.rarity; c.available = it.available; c.price = it.price_from; c.tags = it.tags || []; c.isNew = it.isNew; c.popular = it.popular; c.featured = it.featured; } });
    const favSet = new Set([...(v._fav || []), ...(hooks.favorites || [])]); v._fav = [...favSet];
    const g = { v, cat: v._cat || (v.eventType ? 'venue' : 'event'), tab:{}, studio:null, ach:new Set(v._ach || []), level:levelOf(progress(v))[1], collapsed:false };
    const SKIP = ['_ach','_seen','_cat','_step','_ref','_sentAt','_prefilled','_fav'];
    const snapOf = () => JSON.stringify(Object.fromEntries(Object.entries(v).filter(([k]) => !SKIP.includes(k))));
    const H = { undo:[], redo:[], last:snapOf(), t:0 };
    const persist = hooks.persist || (() => czSave(v));
    const save = () => {
      v._ach = [...g.ach]; const s = snapOf();
      if (s !== H.last){ const lbl = g.pendingLabel || 'Layout change', top = H.undo[H.undo.length - 1], t = Date.now();
        if (!(top && top.label === lbl && t - H.t < 900)) H.undo.push({ snap:H.last, label:lbl }); if (H.undo.length > 80) H.undo.shift(); H.redo = []; H.t = t; H.last = s; }
      g.pendingLabel = null; persist(v, H.undo.length ? H.undo[H.undo.length - 1].label : 'Edit'); if ($g('#g-undo')) paintUndo();
    };
    const restoreSnap = snap => { Object.keys(v).forEach(k => { if (!SKIP.includes(k)) delete v[k]; }); Object.assign(v, JSON.parse(snap)); H.last = snapOf(); persist(v, 'Undo'); sync(); paint(); paintUndo(); };
    function paintUndo(){ const u = $g('#g-undo'), r = $g('#g-redo'); u.disabled = !H.undo.length; r.disabled = !H.redo.length; u.title = H.undo.length ? `Undo: ${H.undo[H.undo.length - 1].label}` : 'Nothing to undo'; r.title = H.redo.length ? `Redo: ${H.redo[H.redo.length - 1].label}` : 'Nothing to redo'; }
    function undo(){ const e = H.undo.pop(); if (!e) return; H.redo.push({ snap:H.last, label:e.label }); restoreSnap(e.snap); toast(`Undone: ${esc(e.label)}`, 'undo'); }
    function redo(){ const e = H.redo.pop(); if (!e) return; H.undo.push({ snap:H.last, label:e.label }); restoreSnap(e.snap); toast(`Redone: ${esc(e.label)}`, 'redo'); }
    const haptic = ms => { try { navigator.vibrate && navigator.vibrate(ms || 8); } catch(e){} };
    const groups = ['Setup','Design','Plan','Finish'];
    root.innerHTML = `
      <div class="g-stage" id="g-stage">${has3D() ? ST.markup() : `<div class="studio studio-off"><p>The 3D designer needs a browser with WebGL. Your choices will still be sent in full.</p></div>`}<div class="g-vignette" aria-hidden="true"></div></div>
      <header class="g-hud">
        <a class="g-ib" href="${hooks.exitHref || '#/'}" aria-label="Exit the designer">${icon('x')}</a>
        <button class="g-title" id="g-title" type="button" aria-expanded="false" aria-controls="g-ov" title="Event overview"><b id="g-name"></b><span><i id="g-level"></i><em class="g-save" id="g-save" aria-live="polite"></em></span></button>
        <button class="g-ib g-aib" type="button" data-g="ai" aria-label="Ask the MA3AK assistant">${icon('sparkle')}<span>Ask AI</span></button>
        <button class="g-ring" id="g-ring" type="button" aria-label="Progress and achievements"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="trk"/><circle cx="22" cy="22" r="19" class="bar" id="g-ring-bar"/></svg><b id="g-pct">0</b></button>
        <button class="g-ib" id="g-menu" type="button" aria-label="More options" aria-expanded="false">${icon('more')}</button>
      </header>
      <div class="g-stats" id="g-stats"><button class="g-chip" type="button" id="g-score" data-g="score" aria-label="Event score"></button><button class="g-chip" type="button" id="g-budget" data-g="budget" aria-label="Budget"></button><button class="g-next" id="g-next" type="button" hidden></button></div>
      <div class="g-ov" id="g-ov" hidden role="dialog" aria-label="Event overview"></div>
      <nav class="g-tools" aria-label="Tools">
        <button class="g-tb" type="button" data-g="undo" id="g-undo" aria-label="Undo" disabled>${icon('undo')}</button>
        <button class="g-tb" type="button" data-g="redo" id="g-redo" aria-label="Redo" disabled>${icon('redo')}</button>
        <span class="g-tsep"></span>
        <button class="g-tb" type="button" data-g="time" id="g-time" aria-label="Time of day"></button>
        <button class="g-tb" type="button" data-g="views" id="g-views-b" aria-label="Camera angles" aria-expanded="false">${icon('camera')}</button>
        <button class="g-tb" type="button" data-g="plan" id="g-plan" aria-label="Floor plan view" aria-pressed="false">${icon('grid')}</button>
        <button class="g-tb g-compare" type="button" id="g-compare" aria-label="Hold to compare. Tap to switch between empty venue and previous version"><span class="g-cmp-i">${icon('eye')}</span><small id="g-cmp-l">Before</small></button>
        <button class="g-tb g-play" type="button" data-g="simulate" aria-label="Simulate your event">${icon('play')}</button>
      </nav>
      <div class="g-pop g-views" id="g-views" hidden role="menu">${[['front','Front'],['side','Side'],['top','Top'],['guest','Guest view'],['overview','Reset view']].map(([k, l]) => `<button type="button" role="menuitem" data-view="${k}">${l}</button>`).join('')}<p>Drag to turn. Pinch or scroll to zoom. Two fingers or right-drag to move.</p></div>
      <div class="g-menu" id="g-menu-pop" hidden role="menu">
        <button role="menuitem" type="button" data-g="magic">${icon('sparkle','sm')}Create my dream event</button>
        <button role="menuitem" type="button" data-g="surprise">${icon('refresh','sm')}Surprise me</button>
        <button role="menuitem" type="button" data-g="inspire">${icon('star','sm')}Inspiration gallery</button>
        <button role="menuitem" type="button" data-g="preview">${icon('eye','sm')}Free preview mode</button>
        <button role="menuitem" type="button" data-g="share">${icon('share','sm')}Share event</button>
        <button role="menuitem" type="button" data-g="history">${icon('history','sm')}Version history</button>
        <button role="menuitem" type="button" data-g="print">${icon('file','sm')}Save as PDF</button>
        <button role="menuitem" type="button" data-g="4k">${icon('image','sm')}Save a 4K picture</button>
        <button role="menuitem" type="button" data-g="style">${icon('brush','sm')}<span id="g-style-l"></span></button>
        <button role="menuitem" type="button" data-g="reset">${icon('refresh','sm')}Reset layout to my choices</button>
        <button role="menuitem" type="button" data-lang-open>${icon('globe','sm')}Language</button>
      </div>
      <button class="g-overview" id="g-overview" type="button" hidden>${icon('target','sm')}Whole venue</button>
      <section class="g-sheet" id="g-sheet" aria-label="Customize">
        <button class="g-handle" id="g-handle" type="button" aria-label="Collapse panel" aria-expanded="true"><span></span></button>
        <div class="g-sheet-h"><h2 id="g-cat-title"></h2><div class="g-tabs" id="g-tabs" role="tablist"></div><button class="g-ib g-srch" type="button" data-g="search" aria-label="Search all items" aria-pressed="false">${icon('search','sm')}</button></div>
        <div class="g-body" id="g-body"></div>
      </section>
      <nav class="g-dock" id="g-dock" aria-label="Categories">
        <div class="g-dock-s" id="g-dock-s">${groups.map(gr => `<span class="g-grp">${gr}</span>` + CATS.filter(c => GROUP[c.id] === gr).map(c => `<button type="button" class="g-dk" data-cat="${c.id}" aria-label="${c.name}">${icon(c.icon)}<span>${c.name}</span><i class="g-dot"></i></button>`).join('')).join('')}</div>
        <button type="button" class="g-dk g-dk-all" data-g="all" aria-label="All categories">${icon('grid')}<span>All</span></button>
        <button type="button" class="g-rail-t" data-g="rail" aria-label="Expand sidebar">${icon('panel','sm')}<span>Collapse</span></button>
      </nav>
      <div class="g-all" id="g-all" hidden role="dialog" aria-label="All categories"></div>
      <div class="g-pv" id="g-pv" hidden><div class="g-pv-bar"><div class="g-pv-shots">${[['orbit','Orbit'],['stage','Stage'],['guest','Guest view'],['top','Top']].map(([k, l]) => `<button type="button" data-shot="${k}">${l}</button>`).join('')}</div><div class="g-pv-shots">${[['Lunch / afternoon','sun'],['Sunset','sunset'],['Evening','moon']].map(([k, ic]) => `<button type="button" data-tset="${k}" aria-label="${k}">${icon(ic,'sm')}</button>`).join('')}</div><button type="button" class="g-pv-x" data-g="preview-exit">${icon('x','sm')}Exit preview</button></div><p class="g-pv-cap" id="g-pv-cap"></p></div>
      <div class="g-cap" id="g-cap" hidden aria-live="polite"></div>
      <div class="g-roll" id="g-roll" hidden><span id="g-roll-t"></span><button type="button" data-g="surprise">${icon('refresh','sm')}Roll again</button><button type="button" class="ok" data-g="keep">Keep it</button></div>
      <div class="g-build" id="g-build" hidden aria-live="polite"><i></i><b id="g-build-t"></b></div>
      <div class="g-magic" id="g-magic" hidden role="dialog" aria-modal="true" aria-label="Create my dream event"></div>
      <div class="g-sim" id="g-sim" hidden role="dialog" aria-label="Event experience score"></div>
      <div class="g-fx" id="g-fx" aria-hidden="true"></div>
      <div class="g-toasts" id="g-toasts" aria-live="polite"></div>`;
    const $g = s => root.querySelector(s);

    // 3D studio
    if (has3D() && $g('#studio')){
      try { g.studio = new ST.Studio($g('#studio'), { onChange:(nv, kind) => { save(); if (kind === 'venue') paint(true); else paintLight(); } }); g.studio.cam.auto = false; g.studio.sync(v); g.studio.loop();
        g.studio.goal.r = 40; g.studio.cam.r = 40; g.studio.goal.phi = .9; setTimeout(() => { g.studio.goal.r = 22; g.studio.goal.phi = .62; }, 150); }
      catch(e){ console.warn('3D unavailable', e); g.studio = null; }
    }
    const sync = () => { if (g.studio) g.studio.sync(v); };

    /* ---------- rendering ---------- */
    function cardHTML(c){
      const rr = RAR[c.rar] || RAR.c, thumbKind = c.fx ? `<span class="g-fxprev fx-${c.fx}">${'<i></i>'.repeat(12)}</span>` : `<span class="g-thumb" data-thumb="${c.item}"><img alt="" decoding="async"></span>`;
      return `<div class="g-card ${rr[1]}${c.featured ? ' feat' : ''}" data-card="${c.id}">
        <button type="button" class="g-hit" data-tog="${c.id}" aria-pressed="false"><span class="g-art">${thumbKind}<span class="g-shine"></span></span><span class="g-lbl">${esc(c.label)}</span><span class="g-rar">${rr[0]}${c.price ? ` · from $${Number(c.price).toLocaleString('en-US')}` : ''}${c.popular ? ` · ${icon('trend','sm')}` : ''}</span></button>
        <span class="g-check" aria-hidden="true">${icon('check','sm')}</span><span class="g-new" aria-hidden="true">New</span>
        <span class="g-lock" aria-hidden="true">${icon('lock','sm')}<em></em></span>
        <button type="button" class="g-fav" data-fav="${c.id}" aria-label="Favorite ${esc(c.label)}" aria-pressed="false">${icon('heart','sm')}</button>
        ${c.item && !['dancefloor','cake','kosha'].includes(c.item) ? `<button type="button" class="g-plus" data-plus="${c.item}" aria-label="Add another ${esc(c.label)}">${icon('plus','sm')}<b></b></button>` : ''}
      </div>`;
    }
    const row = (cards) => `<div class="g-row" role="list">${cards.filter(c => c.available !== false).map(cardHTML).join('')}</div>`;
    const seg = (items, cur, attr) => `<div class="g-seg">${items.map(([val, label, sub, art]) => `<button type="button" class="g-segb" data-${attr}="${esc(val)}" aria-pressed="${cur === val}">${art || ''}<b>${esc(label)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('')}</div>`;
    const tiles = f => { const val = v[f.id]; const multi = f.type === 'chips';
      return `<div class="g-group"><h3>${esc(f.label)}${f.max ? ` <small>up to ${f.max}</small>` : ''}</h3><div class="g-tiles">${f.options.map(o => { const on = multi ? arr(v, f.id).includes(o) : val === o; return `<button type="button" class="g-tile${/not sure/i.test(o) ? ' soft' : ''}" data-${multi ? 'gt' : 'gs'}="${f.id}" data-val="${esc(o)}" aria-pressed="${on}">${esc(o)}</button>`; }).join('')}</div></div>`; };
    const stepper = (id, label, step, max, unit) => `<div class="g-stepper"><span>${esc(label)}</span><div><button type="button" class="g-ib" data-step="${id}" data-d="${-step}" aria-label="Fewer">${icon('minus')}</button><output id="g-out-${id}">${+v[id] || 0}</output><button type="button" class="g-ib" data-step="${id}" data-d="${step}" aria-label="More">${icon('plus')}</button></div><input type="range" min="0" max="${max}" step="${step}" value="${+v[id] || 0}" data-range="${id}" aria-label="${esc(label)}"><em>${esc(unit)}</em></div>`;
    const field = id => CZ_SECTIONS.flatMap(s => s.fields).find(f => f.id === id);
    const fieldUI = id => { const f = field(id); if (!f || (f.showIf && !f.showIf(v))) return '';
      if (['chips','chips1','radio'].includes(f.type)) return tiles(f);
      if (f.type === 'counter' || f.type === 'money') return stepper(id, f.label, f.type === 'money' ? 500 : (f.step || 1), f.type === 'money' ? 200000 : (f.max || 50), f.type === 'money' ? 'US dollars' : '');
      if (f.type === 'textarea') return `<div class="g-group"><h3>${esc(f.label)}</h3><textarea class="g-input" data-gi="${id}" rows="3" placeholder="${esc(f.placeholder || '')}">${esc(v[id] || '')}</textarea></div>`;
      return `<div class="g-group"><h3>${esc(f.label)}</h3><input class="g-input" data-gi="${id}" type="${f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'text'}" value="${esc(v[id] || '')}" placeholder="${esc(f.placeholder || '')}"${f.type === 'date' ? ` min="${todayISO()}"` : ''}></div>`; };

    function body(){
      const c = g.cat, t = g.tab[c] || (CATS.find(x => x.id === c).tabs || [''])[0];
      if (c === 'event') return `<div class="g-dream"><button type="button" class="g-cta" data-g="magic">${icon('sparkle','sm')}Create my dream event</button><button type="button" class="g-cta ghost" data-g="surprise">${icon('refresh','sm')}Surprise me</button></div><div class="g-row g-row-lg" role="list">${EVENT_TYPES.map(e => `<div class="g-card g-ev" data-ev="${e.id}"><button type="button" class="g-hit" data-ev="${e.id}" aria-pressed="${v.eventType === e.id}"><span class="g-art"><span class="g-thumb" data-evthumb="${e.id}"><img alt="" decoding="async"></span><span class="g-shine"></span></span><span class="g-lbl">${esc(e.name)}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>
        <div class="g-inline">${fieldUI('eventName')}${fieldUI('date')}</div>
        ${v.eventType && TEMPLATES[v.eventType] ? `<button type="button" class="g-cta ghost" data-g="template">${icon('sparkle','sm')}Fill with a ${esc(evName(v.eventType).toLowerCase())} template</button>` : ''}`;
      if (c === 'venue'){
        if (t === 'Time') return seg([['Lunch / afternoon','Day','Bright and fresh','<i class="g-sky day"></i>'],['Sunset','Sunset','Golden hour','<i class="g-sky sunset"></i>'],['Evening','Night','Lights on','<i class="g-sky night"></i>']], v.timeOfDay || 'Evening', 'time') + `<p class="g-note">Indoor venues use their own lighting.</p>`;
        if (t === 'Size') return seg(Object.keys(ST.SIZES).map((k, i) => [k, k.split(' (')[0], k.match(/\((.*)\)/)[1] + ' guests', `<i class="g-size s${i}"></i>`]), v.venueSize || '', 'size');
        return `<div class="g-row" role="list"><div class="g-card g-upl"><button type="button" class="g-hit" data-g="upload" aria-pressed="${!!v._photo}"><span class="g-art g-art-upl">${icon('image','lg')}<b>Your own place</b><small>Upload a photo</small></span><span class="g-lbl">${v._photo ? 'Your photo' : 'Use my photo'}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>
          ${ST.VENUE_PICK.map(([k, l]) => `<div class="g-card" data-venue-card="${esc(l)}"><button type="button" class="g-hit" data-venue="${esc(l)}" aria-pressed="false"><span class="g-art"><span class="g-thumb" data-vthumb="${esc(l)}"><img alt="" decoding="async"></span><span class="g-shine"></span></span><span class="g-lbl">${esc(l.split(' /')[0].replace('Historic palace','Palace'))}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>
          ${v._photo ? `<div class="g-inline"><button type="button" class="g-cta ghost" data-g="adjust">${icon('sliders','sm')}Line up my photo</button><button type="button" class="g-cta ghost" data-g="remove-photo">${icon('x','sm')}Remove photo</button></div>` : ''}`;
      }
      if (c === 'guests'){
        if (t === 'Guests') return `${stepper('guests','Guests',10,1000,'people')}${stepper('kids','Children',1,200,'of them children')}`;
        return `${stepper('guests','Guests',10,1000,'people')}<div class="g-row" role="list">${SEATING.map(([val, item, label]) => `<div class="g-card" data-seat-card="${esc(val)}"><button type="button" class="g-hit" data-seat="${esc(val)}" aria-pressed="false"><span class="g-art"><span class="g-thumb" data-thumb="${item}"><img alt="" decoding="async"></span><span class="g-shine"></span></span><span class="g-lbl">${esc(label)}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>`;
      }
      if (c === 'style'){
        if (t === 'Theme') return `<div class="g-row" role="list">${Object.entries(STYLES).map(([name, cols]) => `<div class="g-card g-mood" data-mood-card="${esc(name)}"><button type="button" class="g-hit" data-mood="${esc(name)}" aria-pressed="false"><span class="g-art g-moodart">${cols.map(col => `<i style="background:${col}"></i>`).join('')}<span class="g-shine"></span></span><span class="g-lbl">${esc(name)}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>`;
        if (t === 'Chairs') return `<div class="g-row" role="list">${field('chairs').options.filter(o => !/Not sure|Venue/.test(o)).map(o => `<div class="g-card" data-chair-card="${esc(o)}"><button type="button" class="g-hit" data-chair="${esc(o)}" aria-pressed="false"><span class="g-art"><span class="g-thumb" data-cthumb="${esc(o)}"><img alt="" decoding="async"></span><span class="g-shine"></span></span><span class="g-lbl">${esc(o)}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>`;
        if (t === 'Tables') return `<div class="g-group"><h3>Table linens</h3></div><div class="g-row" role="list">${['White','Ivory','Colored (from palette)','Velvet','Sequins','No cloth (bare wood / glass)'].map(o => `<div class="g-card" data-lin-card="${esc(o)}"><button type="button" class="g-hit" data-lin="${esc(o)}" aria-pressed="false"><span class="g-art"><span class="g-thumb" data-lthumb="${esc(o)}"><img alt="" decoding="async"></span><span class="g-shine"></span></span><span class="g-lbl">${esc(o.replace(' (from palette)','').replace(' (bare wood / glass)',''))}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>
          <div class="g-group"><h3>Centerpieces</h3></div><div class="g-row" role="list">${[['Tall arrangements','tall'],['Low arrangements','low'],['Candles & candelabras','candelabra']].map(([o, k]) => `<div class="g-card" data-cp-card="${esc(o)}"><button type="button" class="g-hit" data-cp="${esc(o)}" aria-pressed="false"><span class="g-art"><span class="g-thumb" data-cpthumb="${k}"><img alt="" decoding="async"></span><span class="g-shine"></span></span><span class="g-lbl">${esc(o.split(' ')[0])}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>`;
        if (t === 'Flowers') return seg([['Minimal','Minimal','A touch','<i class="g-bloom b1"></i>'],['Moderate','Moderate','Balanced','<i class="g-bloom b2"></i>'],['Lavish','Lavish','Full and rich','<i class="g-bloom b3"></i>'],['Over the top','Over the top','Show-stopping','<i class="g-bloom b4"></i>']], v.flowerLevel || '', 'bloom') + tiles(field('flowers'));
        return `<div class="g-swatches">${CZ_PALETTE.map(([n, col]) => `<button type="button" class="g-sw" data-color="${esc(n)}" aria-pressed="${arr(v,'colors').includes(n)}" aria-label="${esc(n)}"><i style="background:${col}"></i><span>${esc(n)}</span></button>`).join('')}</div>
          <div class="g-group"><h3>Ready-made palettes</h3><div class="g-tiles">${PALETTES.map(([n, cols]) => `<button type="button" class="g-tile g-pal" data-pal="${esc(cols.join('|'))}">${cols.map(cn => `<i style="background:${CZ_PALETTE.find(p => p[0] === cn)[1]}"></i>`).join('')}${esc(n)}</button>`).join('')}</div></div>`;
      }
      if (c === 'stage') return t === 'Dance floor' ? `<div class="g-row" role="list">${[['Glossy black','c'],['White / mirror','r'],['Wooden','c'],['LED','e'],['Custom printed','r']].map(([o, rr]) => `<div class="g-card ${RAR[rr][1]}" data-df-card="${esc(o)}"><button type="button" class="g-hit" data-df="${esc(o)}" aria-pressed="false"><span class="g-art"><span class="g-thumb" data-dfthumb="${esc(o)}"><img alt="" decoding="async"></span><span class="g-shine"></span></span><span class="g-lbl">${esc(o)}</span><span class="g-rar">${RAR[rr][0]}</span></button><span class="g-check" aria-hidden="true">${icon('check','sm')}</span></div>`).join('')}</div>` : row(CARDS.stage);
      if (c === 'decor') return row(CARDS.decor);
      if (c === 'lights') return t === 'Effects' ? row(CARDS.fx) : row(CARDS.lights);
      if (c === 'food'){
        if (t === 'Cake') return `${row(CARDS.food.filter(x => ['cake','sweets','fountain'].includes(x.id)))}${String(v.cake||'').startsWith('Yes') ? stepper('cakeTiers','Cake tiers',1,8,'tiers') + tiles(field('cakeFlavor')) : ''}`;
        if (t === 'Menu') return ['service','cuisine','stations','dietary'].map(fieldUI).join('');
        if (t === 'Drinks') return ['drinks','bartenders'].map(fieldUI).join('');
        return row(CARDS.food.filter(x => !['cake','sweets','fountain'].includes(x.id)));
      }
      if (c === 'fun') return row(CARDS.fun);
      if (c === 'details'){
        const map = { When:['date','dateFlex','timeOfDay','duration','budget','budgetFlex','priorities'], Music:['genres','mustPlay','host'], Photo:['photo','photographers','video','coverage','deliverables'], Beauty:['beautyServices','beautyPeople','beautyWhere','attire'], Guests:['invitations','rsvp','seatingPlan','favors','languages','accessibility'], Extras:['theme','dressCode','inspiration','transport','staff','technical','stay','notes'] };
        return (map[t] || []).map(fieldUI).join('');
      }
      if (c === 'send') return sendBody();
      if (['invite','guestlist','timeline','checklist'].includes(c)) return planBody(c);
      return '';
    }
    function planBody(c){
      if (!hooks.eventId) return `<div class="pl-lock">${icon('lock')}<div><b>Save your event to plan the details</b><p>Invitations, guest lists, timelines and checklists are kept in your account so you can manage them from any device.</p>${typeof apiU === 'function' ? `<a class="g-cta" href="#/register">Create a free account</a>` : '<p class="g-dim">Available on the live MA3AK website.</p>'}</div></div>`;
      const ro = hooks.role === 'viewer';
      if (c === 'invite'){ if (PLAN.invite == null) return `<p class="g-note">Loading your invitation…</p>`; const iv = PLAN.invite || {}, d = inviteDefaults(), val = k => esc(iv[k] ?? d[k] ?? ''), cols = d.theme;
        return `<div class="iv-wrap"><div class="iv-card" style="--c1:${cols[0] || '#C8A96B'};--c2:${cols[1] || '#F4EFE6'}"><div class="iv-cover" id="iv-cover">${iv.cover ? `<img src="${iv.cover}" alt="">` : ''}</div><div class="iv-in"><small>${val('host') || 'You’re invited'}</small><b>${val('title')}</b><span>${[iv.date || d.date ? fmtDate(iv.date || d.date) : '', iv.time || d.time].filter(Boolean).join(' · ')}</span><em>${val('location')}</em></div></div>
          ${ro ? '' : `<form class="iv-form" data-iv="save"><label class="g-lab">Title<input class="g-input" name="title" value="${val('title')}" maxlength="120" required></label><label class="g-lab">Hosted by<input class="g-input" name="host" value="${val('host')}" maxlength="120" placeholder="e.g. The Haddad family"></label>
            <div class="g-inline" style="padding:0"><label class="g-lab">Date<input class="g-input" type="date" name="date" value="${val('date')}"></label><label class="g-lab">Time<input class="g-input" type="time" name="time" value="${val('time')}"></label></div>
            <label class="g-lab">Where<input class="g-input" name="location" value="${val('location')}" maxlength="200"></label><label class="g-lab">Message<textarea class="g-input" name="message" rows="3" maxlength="1200">${val('message')}</textarea></label>
            <div class="g-inline" style="padding:0"><label class="g-lab">Dress code<input class="g-input" name="dressCode" value="${val('dressCode')}" maxlength="80" placeholder="e.g. Black tie"></label><label class="g-lab">Reply by<input class="g-input" type="date" name="rsvpBy" value="${val('rsvpBy')}"></label></div>
            <label class="g-consent"><input type="checkbox" name="cover" ${iv.cover ? '' : 'checked'}> Use a picture of my 3D design as the cover</label><label class="g-consent"><input type="checkbox" name="rsvpOpen" ${iv.rsvpOpen === false ? '' : 'checked'}> Guests can reply (RSVP) from the invitation</label>
            <div class="iv-btns"><button type="submit" class="g-cta ghost" name="act" value="draft">Save draft</button><button type="submit" class="g-cta" name="act" value="publish">${icon('send','sm')}${iv.published ? 'Update invitation' : 'Publish invitation'}</button></div></form>`}
          ${iv.published ? `<div class="iv-pub"><p>${icon('check','sm')}Live. ${PLAN.rsvps ? `${PLAN.rsvps.yes} coming, ${PLAN.rsvps.no} not coming, ${iv.views || 0} views` : ''}</p><div class="g-link" style="margin:0"><input class="g-input" readonly value="${esc(iv.url)}" aria-label="Invitation link"><button type="button" class="g-cta ghost" data-copylink="${esc(iv.url)}">${icon('copy','sm')}Copy</button></div>
            <div class="g-exp" style="margin:6px 0 0"><a href="https://wa.me/?text=${encodeURIComponent(`${iv.title}\n${iv.url}`)}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}WhatsApp</a><a href="mailto:?subject=${encodeURIComponent(iv.title)}&body=${encodeURIComponent(`You're invited!\n\n${iv.url}`)}">${icon('mail','sm')}Email</a><a href="${esc(iv.url)}" target="_blank" rel="noopener">${icon('eye','sm')}Preview</a>${ro ? '' : `<button type="button" data-iv="unpublish">${icon('x','sm')}Turn off</button>`}</div>
            ${hooks.role === 'owner' ? `<button type="button" class="g-tile" data-iv="newlink" style="margin-top:8px">${icon('refresh','sm')}Replace link (the old one stops working)</button>` : ''}</div>` : ''}</div>`; }
      if (c === 'guestlist'){ if (!PLAN.guests) return `<p class="g-note">Loading your guests…</p>`; const st = PLAN.stats || {}, q = PLAN.q.toLowerCase(), f = PLAN.filter;
        const list = PLAN.guests.filter(x => (!q || `${x.name} ${x.party} ${x.phone || ''}`.toLowerCase().includes(q)) && (f === 'all' || (f === 'vip' ? x.vip : f === 'unseated' ? (x.rsvp !== 'declined' && !x.table) : x.rsvp === f)));
        const per = { 'Long imperial tables':20, 'Theater rows':20, 'Lounge seating':4, 'Cocktail / standing':6 }[(v.seating || [])[0]] || 8;
        return `<div class="pl-stats"><div><b>${st.attending || 0}</b><small>attending</small></div><div><b>${st.confirmed || 0}<i>/${st.invited || 0}</i></b><small>confirmed</small></div><div><b>${st.pending || 0}</b><small>pending</small></div><div><b>${st.declined || 0}</b><small>declined</small></div><div><b>${st.unseated || 0}</b><small>no table</small></div></div>
          ${ro ? '' : `<form class="pl-add" data-pl="add"><input class="g-input" name="n" placeholder="Guest name" maxlength="120" aria-label="Guest name" required><input class="g-input" name="p" placeholder="Group (e.g. Haddad family)" maxlength="60" aria-label="Group"><button class="g-cta" type="submit">${icon('plus','sm')}Add</button></form>
          <div class="pl-tools"><button type="button" class="g-tile" data-pl="paste">${icon('clipboard','sm')}Paste a list</button><button type="button" class="g-tile" data-pl="seat" data-per="${per}">${icon('users','sm')}Seat everyone (${per} per table)</button></div>`}
          <div class="g-filters" style="padding:0 16px 8px">${[['all','All'],['confirmed','Confirmed'],['pending','Pending'],['declined','Declined'],['vip','VIP'],['unseated','No table']].map(([k, l]) => `<button type="button" class="g-tile" data-plf="${k}" aria-pressed="${f === k}">${l}</button>`).join('')}</div>
          <div class="pl-list">${list.length ? list.map(x => `<div class="pl-row ${x.rsvp}" data-gid="${x.id}"><button type="button" class="pl-vip" data-pg="vip" aria-pressed="${x.vip}" aria-label="VIP" ${ro ? 'disabled' : ''}>${icon('star','sm')}</button>
            <div class="pl-n"><b>${esc(x.name)}${x.plusOne ? ' <em>+1</em>' : ''}</b><small>${esc([x.party, x.dietary, x.phone].filter(Boolean).join(' · ') || ' ')}</small></div>
            <button type="button" class="pl-rsvp" data-pg="rsvp" ${ro ? 'disabled' : ''}>${{ pending:'Pending', confirmed:'Confirmed', declined:'Declined' }[x.rsvp]}</button>
            <label class="pl-t"><span>Table</span><input type="number" min="1" max="500" value="${x.table || ''}" data-pg="table" ${ro ? 'disabled' : ''} aria-label="Table for ${esc(x.name)}"></label>
            ${ro ? '' : `<button type="button" class="pl-more" data-pg="edit" aria-label="Edit ${esc(x.name)}">${icon('more','sm')}</button>`}</div>`).join('') : `<p class="g-note">${PLAN.guests.length ? 'No guests match.' : 'Add your first guest above, or paste a whole list.'}</p>`}</div>`; }
      if (c === 'timeline'){ if (!PLAN.timeline) return `<p class="g-note">Loading your timeline…</p>`;
        return `${PLAN.timeline.length ? '' : `<div class="g-dream"><button type="button" class="g-cta" data-pl="suggest-tl">${icon('sparkle','sm')}Suggest a timeline for my ${esc((evName(v.eventType) || 'event').toLowerCase())}</button></div>`}
          <ol class="pl-tl">${PLAN.timeline.map((x, i) => `<li data-i="${i}"><input type="time" value="${x.at}" data-tl="at" aria-label="Time" ${ro ? 'disabled' : ''}><input class="g-input" value="${esc(x.title)}" data-tl="title" maxlength="120" aria-label="Moment" ${ro ? 'disabled' : ''}>${ro ? '' : `<button type="button" class="pl-x" data-pl="tl-del" aria-label="Remove">${icon('x','sm')}</button>`}</li>`).join('')}</ol>
          ${ro ? '' : `<div class="pl-tools"><button type="button" class="g-tile" data-pl="tl-add">${icon('plus','sm')}Add a moment</button>${PLAN.timeline.length ? `<button type="button" class="g-tile" data-pl="suggest-tl">${icon('refresh','sm')}Replace with a suggestion</button>` : ''}</div>`}`; }
      if (!PLAN.checklist) return `<p class="g-note">Loading your checklist…</p>`;
      const done = PLAN.checklist.filter(x => x.done).length, tot = PLAN.checklist.length;
      return `${tot ? `<div class="pl-prog"><div><b>${done} of ${tot}</b> done</div><i><em style="width:${tot ? done / tot * 100 : 0}%"></em></i></div>` : `<div class="g-dream"><button type="button" class="g-cta" data-pl="gen-cl">${icon('sparkle','sm')}Create my checklist</button></div><p class="g-note">Built from your date and the choices in your design.</p>`}
        ${PHASES.map(ph => { const it = PLAN.checklist.map((x, i) => [x, i]).filter(([x]) => x.phase === ph); return it.length ? `<h3 class="pl-ph">${ph}</h3>${it.map(([x, i]) => `<label class="pl-ck ${x.done ? 'done' : ''}"><input type="checkbox" data-ck="${i}" ${x.done ? 'checked' : ''} ${ro ? 'disabled' : ''}><span>${esc(x.title)}</span></label>`).join('')}` : ''; }).join('')}
        ${tot && !ro ? `<form class="pl-add" data-pl="ck-add"><select class="g-input" name="ph" aria-label="When">${PHASES.map(ph => `<option>${ph}</option>`).join('')}</select><input class="g-input" name="t" placeholder="Add a task" maxlength="160" aria-label="Task" required><button class="g-cta" type="submit">${icon('plus','sm')}Add</button></form>` : ''}`;
    }
    function inviteDefaults(){ const tl = PLAN.timeline || [], ev = v.eventType, cols = (v.colors || []).map(n => (CZ_PALETTE.find(p => p[0] === n) || [])[1]).filter(Boolean);
      const msg = { wedding:'We would love you to celebrate our wedding with us.', engagement:'Join us as we celebrate our engagement.', birthday:'Come celebrate with us!', graduation:'Join us to celebrate this milestone.', corporate:'You are invited to our event.', 'baby-shower':'Join us to celebrate the little one on the way.' }[ev] || 'We would love to see you there.';
      return { title:v.eventName || (ev ? evName(ev) : 'You’re invited'), host:'', message:msg, date:v.date || '', time:(tl[0] || {}).at || '19:30', location:v._photo ? '' : ((v.venueType || [])[0] || '').split(' /')[0], dressCode:'', rsvpBy:'', theme:cols.length ? cols : ['#C8A96B','#F4EFE6'] }; }
    async function loadPlan(c, force){ if (!hooks.eventId || typeof apiU !== 'function') return; const id = hooks.eventId;
      try { if (c === 'invite' && (force || PLAN.invite === null || PLAN.invite === undefined)){ PLAN.invite = null; const r = await apiU('GET', `/api/events/${id}/invitation`); PLAN.invite = r.invitation || false; PLAN.rsvps = r.rsvps; if (!PLAN.timeline) try { PLAN.timeline = (await apiU('GET', `/api/events/${id}/timeline`)).items; } catch(e){} } if (c === 'guestlist' && (force || !PLAN.guests)){ const r = await apiU('GET', `/api/events/${id}/guests`); PLAN.guests = r.guests; PLAN.stats = r.stats; }
        if (c === 'timeline' && (force || !PLAN.timeline)) PLAN.timeline = (await apiU('GET', `/api/events/${id}/timeline`)).items;
        if (c === 'checklist' && (force || !PLAN.checklist)) PLAN.checklist = (await apiU('GET', `/api/events/${id}/checklist`)).items;
        if (g.cat === c) repaintBody(); } catch(e){ toast(esc(e.message), 'alert'); } }
    const repaintBody = () => { const b = $g('#g-body'), y = b.scrollTop, a = document.activeElement, keep = a && a.dataset && a.dataset.plkeep; b.innerHTML = body(); b.scrollTop = y; paintHUD(); if (keep){ const el = b.querySelector(`[data-plkeep="${keep}"]`); if (el) el.focus(); } };
    let tlT = null; const saveTimeline = now => { clearTimeout(tlT); tlT = setTimeout(async () => { try { PLAN.timeline = (await apiU('PUT', `/api/events/${hooks.eventId}/timeline`, { items:PLAN.timeline })).items; g.setSave('saved'); if (g.cat === 'timeline') repaintBody(); } catch(e){ toast(esc(e.message), 'alert'); } }, now ? 0 : 900); g.setSave('saving'); };
    const saveChecklist = async () => { try { PLAN.checklist = (await apiU('PUT', `/api/events/${hooks.eventId}/checklist`, { items:PLAN.checklist })).items; repaintBody(); } catch(e){ toast(esc(e.message), 'alert'); } };
    async function guestAct(row, k, val){ const id = row.dataset.gid, x = PLAN.guests.find(y => y.id === id); if (!x) return; const patch = {};
      if (k === 'vip') patch.vip = !x.vip; if (k === 'rsvp') patch.rsvp = { pending:'confirmed', confirmed:'declined', declined:'pending' }[x.rsvp]; if (k === 'table') patch.table = val ? +val : null;
      if (k === 'edit') return editGuest(x);
      try { const r = await apiU('PATCH', `/api/events/${hooks.eventId}/guests/${id}`, patch); Object.assign(x, r.guest); PLAN.stats = r.stats; repaintBody(); haptic(5); } catch(e){ toast(esc(e.message), 'alert'); } }
    function editGuest(x){ openModal({ title:esc(x.name), body:`<form class="form" id="eg">${[['name','Name',x.name],['party','Group',x.party],['phone','Phone',x.phone || ''],['email','Email',x.email || ''],['dietary','Dietary needs',x.dietary],['notes','Notes',x.notes]].map(([k, l, val]) => `<div class="field"><label for="eg-${k}">${l}</label><input class="input" id="eg-${k}" name="${k}" value="${esc(val || '')}"></div>`).join('')}
      <label class="check"><input type="checkbox" name="plusOne" ${x.plusOne ? 'checked' : ''}> Bringing a plus-one</label><div class="chip-row"><button class="btn btn-primary" type="submit">Save</button><button class="btn btn-ghost" type="button" id="eg-del" style="color:var(--danger)">Remove guest</button></div></form>`,
      onMount(m){ const f = $('#eg', m); f.onsubmit = async e => { e.preventDefault(); const d = Object.fromEntries(['name','party','phone','email','dietary','notes'].map(k => [k, f.elements[k].value.trim()])); d.plusOne = f.elements.plusOne.checked;
          try { const r = await apiU('PATCH', `/api/events/${hooks.eventId}/guests/${x.id}`, d); Object.assign(x, r.guest); PLAN.stats = r.stats; closeModal(); repaintBody(); } catch(err){ toast(esc(err.message), 'alert'); } };
        $('#eg-del', m).onclick = async () => { const r = await apiU('DELETE', `/api/events/${hooks.eventId}/guests/${x.id}`); PLAN.guests = PLAN.guests.filter(y => y.id !== x.id); PLAN.stats = r.stats; closeModal(); repaintBody(); }; } }); }
    root.addEventListener('submit', async e => { const fi = e.target.closest('[data-iv="save"]'); if (!fi) return; e.preventDefault();
      const act = (e.submitter && e.submitter.value) || 'draft', d = Object.fromEntries(['title','host','date','time','location','message','dressCode','rsvpBy'].map(k => [k, fi.elements[k].value.trim()]));
      d.rsvpOpen = fi.elements.rsvpOpen.checked; d.published = act === 'publish' || (act !== 'draft' && !!(PLAN.invite && PLAN.invite.published)); if (act === 'draft') d.published = !!(PLAN.invite && PLAN.invite.published);
      d.theme = inviteDefaults().theme; if (fi.elements.cover.checked && g.studio){ g.studio.overview(); await new Promise(r => setTimeout(r, 400)); d.cover = g.studio.capture(); }
      const btn = e.submitter; if (btn){ btn.disabled = true; }
      try { const r = await apiU('PUT', `/api/events/${hooks.eventId}/invitation`, d); PLAN.invite = r.invitation; repaintBody(); if (act === 'publish'){ banner('Invitation is live', 'Share the link with your guests', 'mail'); burst($g('.iv-card') || root); } else toast('Invitation saved', 'check'); }
      catch(err){ toast(esc(err.message), 'alert'); if (btn) btn.disabled = false; } });
    root.addEventListener('click', async e => { const b = e.target.closest('button[data-iv]'); if (!b) return;
      if (b.dataset.iv === 'unpublish'){ const iv = PLAN.invite; try { const r = await apiU('PUT', `/api/events/${hooks.eventId}/invitation`, { title:iv.title, host:iv.host, message:iv.message, date:iv.date, time:iv.time, location:iv.location, dressCode:iv.dressCode, rsvpBy:iv.rsvpBy, rsvpOpen:iv.rsvpOpen, theme:iv.theme, published:false }); PLAN.invite = r.invitation; repaintBody(); toast('Invitation turned off', 'check'); } catch(err){ toast(esc(err.message), 'alert'); } }
      if (b.dataset.iv === 'newlink'){ try { const r = await apiU('POST', `/api/events/${hooks.eventId}/invitation/new-link`); PLAN.invite = r.invitation; repaintBody(); toast('New link ready. The old one no longer works.', 'check'); } catch(err){ toast(esc(err.message), 'alert'); } } });
    root.addEventListener('submit', async e => { const f = e.target.closest('[data-pl]'); if (!f) return; e.preventDefault();
      if (f.dataset.pl === 'add'){ const name = f.elements.n.value.trim(), party = f.elements.p.value.trim(); if (!name) return; try { const r = await apiU('POST', `/api/events/${hooks.eventId}/guests`, { name, party }); PLAN.stats = r.stats; await loadPlan('guestlist', true); const i = $g('[data-pl="add"] [name="n"]'); if (i){ i.focus(); } toast(`${esc(name)} added`, 'check'); } catch(err){ toast(esc(err.message), 'alert'); } }
      if (f.dataset.pl === 'ck-add'){ PLAN.checklist.push({ phase:f.elements.ph.value, title:f.elements.t.value.trim(), done:false }); saveChecklist(); } });
    root.addEventListener('click', async e => { const t = e.target;
      const pg = t.closest('[data-pg]'); if (pg && pg.dataset.pg !== 'table'){ guestAct(pg.closest('[data-gid]'), pg.dataset.pg); return; }
      const fl = t.closest('[data-plf]'); if (fl){ PLAN.filter = fl.dataset.plf; repaintBody(); return; }
      const pl = t.closest('button[data-pl]'); if (!pl) return; const k = pl.dataset.pl;
      if (k === 'paste') openModal({ title:'Paste your guest list', body:`<p class="muted small" style="margin:-.5rem 0 1rem">One guest per line. Add a phone number or group after a comma if you like: “Rita Haddad, +961 70 000 000” or “Sami, Haddad family”.</p><textarea class="textarea" id="pg-t" rows="10" style="width:100%" placeholder="Rita Haddad, +961 70 000 000&#10;Sami Haddad, Haddad family&#10;Nour"></textarea><div class="chip-row" style="margin-top:1rem"><button class="btn btn-primary" id="pg-go">Add guests</button></div>`,
        onMount(m){ $('#pg-go', m).onclick = async () => { const rows = $('#pg-t', m).value.split(/\r?\n/).map(l => l.split(',').map(x => x.trim())).filter(r => r[0]).map(([name, extra]) => extra && /^[+\d][\d\s\-()]{6,}$/.test(extra) ? { name, phone:extra } : extra ? { name, party:extra } : { name });
          if (!rows.length) return; try { const r = await apiU('POST', `/api/events/${hooks.eventId}/guests`, { guests:rows }); closeModal(); toast(`${r.added} guest${r.added > 1 ? 's' : ''} added${r.skipped ? `, ${r.skipped} skipped` : ''}`, 'check'); await loadPlan('guestlist', true); } catch(err){ toast(esc(err.message), 'alert'); } }; } });
      if (k === 'seat'){ try { const r = await apiU('POST', `/api/events/${hooks.eventId}/seating`, { perTable:+pl.dataset.per }); banner(`Seated on ${r.tables} tables`, 'VIPs first, groups kept together', 'users'); await loadPlan('guestlist', true); } catch(err){ toast(esc(err.message), 'alert'); } }
      if (k === 'suggest-tl'){ let tl = (TIMELINES[v.eventType] || TIMELINES._).map(([at, title]) => ({ at, title }));
        if ((v.effects || []).includes('Cold sparks')) tl = tl.map(x => /First dance/.test(x.title) ? { ...x, title:x.title + ' with cold sparks' } : x);
        if ((v.effects || []).includes('Fireworks')) tl.splice(tl.length - 1, 0, { at:tl[tl.length - 1].at === '00:30' ? '00:15' : '23:45', title:'Fireworks' });
        PLAN.timeline = tl; repaintBody(); saveTimeline(true); }
      if (k === 'tl-add'){ const last = PLAN.timeline[PLAN.timeline.length - 1]; PLAN.timeline.push({ at:last ? last.at : '19:00', title:'' }); repaintBody(); const ins = $$('.pl-tl [data-tl="title"]', root); if (ins.length) ins[ins.length - 1].focus(); }
      if (k === 'tl-del'){ PLAN.timeline.splice(+pl.closest('[data-i]').dataset.i, 1); repaintBody(); saveTimeline(true); }
      if (k === 'gen-cl'){ PLAN.checklist = checklistFor(v); saveChecklist(); banner('Checklist ready', `${PLAN.checklist.length} tasks from your date and design`, 'check'); } });
    root.addEventListener('change', async e => { const t = e.target;
      if (t.dataset.pg === 'table') guestAct(t.closest('[data-gid]'), 'table', t.value);
      if (t.dataset.ck !== undefined){ const x = PLAN.checklist[+t.dataset.ck]; x.done = t.checked; t.closest('.pl-ck').classList.toggle('done', t.checked); if (x.id) apiU('PATCH', `/api/events/${hooks.eventId}/checklist/${x.id}`, { done:t.checked }).then(() => repaintBody()).catch(err => toast(esc(err.message), 'alert')); if (t.checked) haptic(8); }
      if (t.dataset.tl){ const i = +t.closest('[data-i]').dataset.i; PLAN.timeline[i][t.dataset.tl] = t.value; if (PLAN.timeline[i].title.trim()) saveTimeline(); } });
    root.addEventListener('input', e => { const t = e.target; if (t.id === 'pl-q'){ PLAN.q = t.value; repaintBody(); } });
    function sendBody(){
      const d = ST.describe(v), favs = (v._fav || []).map(id => Object.values(CARDS).flat().find(c => c.id === id)).filter(Boolean);
      const api = typeof apiPost === 'function';
      return `<div class="g-review">
        <div class="g-rev-hero"><span class="g-medal">${icon('star')}</span><div><b>${esc(levelOf(progress(v))[1])} design</b><small>${progress(v)}% complete, ${d.items.length} kinds of items, ${g.ach.size} achievements</small></div></div>
        <div class="g-rev-grid">${CATS.slice(1, 10).map(cc => `<button type="button" class="g-rev ${cc.done(v) ? 'ok' : ''}" data-cat="${cc.id}">${icon(cc.done(v) ? 'check' : cc.icon,'sm')}<span>${cc.name}</span></button>`).join('')}</div>
        ${favs.length ? `<p class="g-note">${icon('heart','sm')} Favorites: ${esc(favs.map(f => f.label).join(', '))}</p>` : ''}
        <form class="g-form" id="g-send-form" novalidate>
          <div class="g-inline"><label class="g-lab">Your name<input class="g-input" id="g-fn" autocomplete="name" value="${esc(v.fullName || '')}" required></label><label class="g-lab">Phone / WhatsApp<input class="g-input" id="g-ph" type="tel" autocomplete="tel" inputmode="tel" placeholder="+961" value="${esc(v.phone || '')}"></label></div>
          <label class="g-lab">Email <small>optional</small><input class="g-input" id="g-em" type="email" autocomplete="email" value="${esc(v.email || '')}"></label>
          <div class="g-hp" aria-hidden="true"><label>Leave empty <input id="g-hp" tabindex="-1" autocomplete="off"></label></div>
          ${api ? `<label class="g-consent"><input type="checkbox" id="g-copy" checked> Email me a copy with a link to my design</label>` : ''}
          <label class="g-consent"><input type="checkbox" id="g-consent"> I agree to the <a href="#/privacy" target="_blank">Privacy Policy</a> and to MA3AK contacting me about this event.</label>
          <p class="g-err" id="g-err" role="alert"></p>
          <button type="submit" class="g-cta" id="g-send">${icon('send','sm')}Send my event design</button>
          ${api ? '' : `<p class="g-note">Preview mode: your design will open in WhatsApp to send.</p>`}
        </form></div>`;
    }

    function paintHUD(){
      const p = progress(v), lv = levelOf(p)[1];
      $g('#g-name').textContent = v.eventName || (v.eventType ? evName(v.eventType) : 'New event');
      $g('#g-level').textContent = `${lv} · Level ${LEVELS.findIndex(l => l[1] === lv) + 1}`;
      $g('#g-pct').textContent = p; const bar = $g('#g-ring-bar'); bar.style.strokeDashoffset = String(119.4 * (1 - p/100));
      $$('.g-dk[data-cat]', root).forEach(b => { const c = CATS.find(x => x.id === b.dataset.cat); b.classList.toggle('done', c.done(v)); b.setAttribute('aria-current', b.dataset.cat === g.cat ? 'true' : 'false'); });
      $g('#g-style-l').textContent = GL3D.style === 'illustrated' ? 'Realistic graphics' : 'Illustrated graphics';
      const tod = v.timeOfDay || 'Evening'; $g('#g-time').innerHTML = icon(tod === 'Sunset' ? 'sunset' : tod === 'Evening' || tod === 'Late night' ? 'moon' : 'sun'); $g('#g-time').title = `Time of day: ${tod === 'Lunch / afternoon' ? 'Day' : tod === 'Evening' ? 'Night' : tod}. Tap to change`;
      const n = nextCat(), nx = $g('#g-next'); if (n && n.id !== g.cat && v.eventType){ nx.hidden = false; nx.innerHTML = `Next: ${esc(n.name)} ${icon('arrow','sm')}`; } else nx.hidden = true;
      const o = $g('#g-ov'); if (o && !o.hidden) o.innerHTML = overview(); paintUndo();
      const sc = scoreOf(), es = estimate(), sb = $g('#g-score'), bb = $g('#g-budget');
      if (v.eventType){ sb.hidden = false; const prev = +sb.dataset.n || 0; sb.dataset.n = sc.total; sb.innerHTML = `${icon('star','sm')}<b>${sc.total}</b><span>score</span>`; if (prev && sc.total !== prev){ sb.classList.remove('bump','down'); void sb.offsetWidth; sb.classList.add(sc.total > prev ? 'bump' : 'down'); } } else sb.hidden = true;
      bb.hidden = !v.eventType; bb.classList.toggle('over', !!(es.budget && es.total > es.budget));
      bb.innerHTML = es.budget && es.total ? `${icon('wallet','sm')}<b>${k$(es.total)}</b><span>/ ${k$(es.budget)}</span>` : es.budget ? `${icon('wallet','sm')}<b>${k$(es.budget)}</b><span>budget</span>` : es.total ? `${icon('wallet','sm')}<b>${k$(es.total)}</b><span>est.</span>` : `${icon('wallet','sm')}<span>Set budget</span>`;
      paintCap();
      if (lv !== g.level){ const up = LEVELS.findIndex(l => l[1] === lv) > LEVELS.findIndex(l => l[1] === g.level); g.level = lv; if (up) banner(`Level up: ${lv}`, 'Your design is taking shape', 'star'); }
      checkAch();
    }
    function paintCards(){
      const allCards = Object.values(CARDS).flat();
      $$('.g-card[data-card]', root).forEach(el => { const c = allCards.find(x => x.id === el.dataset.card); if (!c) return;
        const on = c.on(v), lock = c.lock && c.lock(v), fav = (v._fav || []).includes(c.id);
        el.classList.toggle('on', on); el.classList.toggle('locked', !!lock); $('.g-hit', el).setAttribute('aria-pressed', on); $('.g-hit', el).setAttribute('aria-disabled', !!lock);
        $('.g-lock em', el).textContent = lock || ''; el.classList.toggle('fav', fav); $('.g-fav', el).setAttribute('aria-pressed', fav);
        const seen = (v._seen || []).includes(c.id); el.classList.toggle('isnew', (!lock && !!c.lock && !seen) || (!!c.isNew && !seen));
        const n = c.item && g.studio ? g.studio.items.filter(i => i.type === c.item).length : 0; const pb = $('.g-plus b', el); if (pb) pb.textContent = n > 1 ? n : '';
      });
      const pressed = (sel, test) => $$(sel, root).forEach(b => b.setAttribute('aria-pressed', test(b)));
      pressed('[data-venue]', b => !v._photo && arr(v,'venueType')[0] === b.dataset.venue); pressed('[data-g="upload"]', () => !!v._photo);
      pressed('[data-seat]', b => arr(v,'seating')[0] === b.dataset.seat); pressed('[data-mood]', b => arr(v,'style').includes(b.dataset.mood));
      pressed('[data-chair]', b => arr(v,'chairs')[0] === b.dataset.chair); pressed('[data-lin]', b => arr(v,'linens')[0] === b.dataset.lin); pressed('[data-cp]', b => arr(v,'centerpieces')[0] === b.dataset.cp);
      pressed('[data-df]', b => (v.danceFloor || 'Glossy black') === b.dataset.df && has(v,'areas','Dance floor')); pressed('[data-color]', b => arr(v,'colors').includes(b.dataset.color));
      pressed('[data-ev]', b => v.eventType === b.dataset.ev); pressed('[data-time]', b => (v.timeOfDay || 'Evening') === b.dataset.time); pressed('[data-size]', b => v.venueSize === b.dataset.size); pressed('[data-bloom]', b => v.flowerLevel === b.dataset.bloom);
      $$('.g-card', root).forEach(el => { const h = $('.g-hit', el); el.classList.toggle('on', h && h.getAttribute('aria-pressed') === 'true'); });
    }
    function loadThumbs(){
      const ctx = ST.makeCtx(v), cs = JSON.stringify([ctx.cols, ctx.linen, ctx.chair, ctx.center, ctx.dfType]);
      $$('[data-thumb]', root).forEach(el => { const t = el.dataset.thumb; const colorDep = !['speakers','dj','car','foodtruck','truss','ledscreen','ledwall','grill','games','casino','olive','heater','firepit','umbrella'].includes(t); thumb(`i:${t}:${colorDep ? cs : ''}`, () => itemDef(t, ST.makeCtx(v)), el); });
      $$('[data-evthumb]', root).forEach(el => { const k = S3.FOR_EVENT[el.dataset.evthumb]; if (snapCache[k]) { thumbs.set('e:' + k, snapCache[k]); } thumb('e:' + k, () => S3.SCENES[k], el); });
      $$('[data-vthumb]', root).forEach(el => { const l = el.dataset.vthumb, tm = v.timeOfDay || 'Evening'; thumb(`v:${l}:${tm}`, () => ST.envThumb(l, tm), el); });
      $$('[data-cthumb]', root).forEach(el => { const o = el.dataset.cthumb; thumb(`c:${o}:${cs}`, () => chairDef(ST.makeCtx({ ...v, chairs:[o] }).chair), el); });
      $$('[data-lthumb]', root).forEach(el => { const o = el.dataset.lthumb; thumb(`l:${o}:${cs}`, () => itemDef('round', ST.makeCtx({ ...v, linens:[o] })), el); });
      $$('[data-cpthumb]', root).forEach(el => { const k = el.dataset.cpthumb; thumb(`cp:${k}:${cs}`, () => itemDef('round', { ...ST.makeCtx(v), center:k }), el); });
      $$('[data-dfthumb]', root).forEach(el => { const o = el.dataset.dfthumb; thumb(`df:${o}:${cs}`, () => itemDef('dancefloor', { ...ST.makeCtx(v), dfType:o }), el); });
    }
    const FILTERS = [['all','All'],['fav','Favorites'],['popular','Popular'],['new','New'],['c','Classic'],['r','Rare'],['e','Epic'],['l','Legendary'],['luxury','Luxury'],['modern','Modern'],['outdoor','Outdoor'],['indoor','Indoor']];
    function results(){
      const q = (g.q || '').toLowerCase().trim().split(/\s+/).filter(Boolean), f = g.filter || 'all', favs = v._fav || [];
      const list = Object.values(CARDS).flat().filter(c => c.available !== false).filter(c => { const hay = `${c.label} ${CAT_OF[c.id]} ${(c.tags || []).join(' ')} ${RAR[c.rar][0]}`.toLowerCase(); return q.every(t => hay.includes(t)); })
        .filter(c => f === 'all' || (f === 'fav' ? favs.includes(c.id) : f === 'popular' ? c.popular : f === 'new' ? (c.isNew || (c.lock && !(v._seen || []).includes(c.id))) : 'crel'.includes(f) && f.length === 1 ? c.rar === f : f === 'indoor' ? !(c.tags || []).includes('outdoor') : (c.tags || []).includes(f)));
      const box = $g('#g-results'); if (!box) return;
      box.innerHTML = list.length ? `<div class="g-row g-grid" role="list">${list.map(cardHTML).join('')}</div>` : `<p class="g-note">${icon('search','sm')} Nothing matches. Try another word or filter.</p>`;
      paintCards(); loadThumbs();
    }
    function paint(full){
      const c = CATS.find(x => x.id === g.cat);
      $g('.g-srch').setAttribute('aria-pressed', !!g.searching);
      if (g.searching){ $g('#g-cat-title').textContent = 'Search'; $g('#g-tabs').innerHTML = ''; const b = $g('#g-body');
        b.innerHTML = `<div class="g-search"><input id="g-q" class="g-input" type="search" placeholder="Search DJ booth, flowers, LED, chairs…" value="${esc(g.q || '')}" aria-label="Search items" autocomplete="off"><div class="g-filters" role="group" aria-label="Filters">${FILTERS.map(([k, l]) => `<button type="button" class="g-tile" data-filter="${k}" aria-pressed="${(g.filter || 'all') === k}">${k === 'fav' ? icon('heart','sm') : ''}${l}</button>`).join('')}</div></div><div id="g-results"></div>`;
        results(); paintHUD(); return; }
      $g('#g-cat-title').textContent = c.id === 'event' ? 'What are we celebrating?' : c.id === 'send' ? 'Ready to send' : c.name;
      $g('#g-tabs').innerHTML = (c.tabs || []).map(t => `<button type="button" role="tab" class="g-tab" data-tab="${esc(t)}" aria-selected="${(g.tab[c.id] || c.tabs[0]) === t}">${esc(t)}</button>`).join('');
      const b = $g('#g-body'), sl = full ? 0 : ($('.g-row', b) || {}).scrollLeft || 0;
      b.innerHTML = body(); b.classList.remove('swap'); void b.offsetWidth; b.classList.add('swap');
      const r = $('.g-row', b); if (r && sl) r.scrollLeft = sl;
      paintCards(); paintHUD(); loadThumbs(); if (['invite','guestlist','timeline','checklist'].includes(g.cat)) loadPlan(g.cat);
      // mark unlocked items in this category as seen (clears "New" next time)
      const cards = { stage:CARDS.stage, decor:CARDS.decor, lights:CARDS.lights.concat(CARDS.fx), food:CARDS.food, fun:CARDS.fun }[g.cat] || [];
      const seenNow = cards.filter(cc => cc.lock && !cc.lock(v)).map(cc => cc.id); if (seenNow.length) setTimeout(() => { v._seen = [...new Set((v._seen || []).concat(seenNow))]; save(); }, 1800);
    }
    const paintLight = () => { paintCards(); paintHUD(); };

    /* ---------- feedback ---------- */
    function burst(el, gold=true){
      const r = el.getBoundingClientRect(), fx = $g('#g-fx'), cx = r.left + r.width/2, cy = r.top + r.height*.4;
      for (let i=0;i<14;i++){ const p = document.createElement('i'); const a = i/14*6.283 + Math.random()*.4, d = 38 + Math.random()*34;
        p.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d - 10}px;--c:${gold ? (i%3 ? '#E7CE96' : '#FFFFFF') : '#F2D3CC'};--s:${4 + Math.random()*4}px`;
        fx.appendChild(p); setTimeout(() => p.remove(), 750); }
    }
    function banner(title, text, ic='star'){
      const t = document.createElement('div'); t.className = 'g-ach'; t.innerHTML = `<span class="g-medal">${icon(ic)}</span><div><small>${esc(text)}</small><b>${esc(title)}</b></div>`;
      $g('#g-toasts').appendChild(t); haptic([10, 40, 12]); setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
    }
    function checkAch(){ if (root.classList.contains('building')) return; ACH.forEach(([id, name, desc, ic, test]) => { if (!g.ach.has(id) && test(v)){ g.ach.add(id); v._ach = [...g.ach]; persist(v, 'Achievement'); banner(name, 'Achievement unlocked', ic); } }); }
    function equip(el, itemType, on){
      if (on){ el.classList.remove('equip'); void el.offsetWidth; el.classList.add('equip'); burst(el); haptic(10); }
      sync(); paintLight();
      if (on && itemType && g.studio){ setTimeout(() => { if (g.studio.focusOn(itemType)) $g('#g-overview').hidden = false; }, 120); }
    }

    /* ---------- interaction ---------- */
    const allCards = () => Object.values(CARDS).flat();
    root.addEventListener('click', e => {
      const q = s => e.target.closest(s);
      let b;
      const lblEl = e.target.closest('.g-card,.g-segb,.g-tile,.g-sw,.g-pal'); if (lblEl) g.pendingLabel = 'Changed ' + ((lblEl.querySelector('.g-lbl,b') || lblEl).textContent || '').trim().slice(0, 40);
      if ((b = q('[data-filter]'))){ g.filter = b.dataset.filter; $$('[data-filter]', root).forEach(x => x.setAttribute('aria-pressed', x === b)); results(); return; }
      if ((b = q('[data-view]'))){ camView(b.dataset.view); $g('#g-views').hidden = true; return; }
      if ((b = q('[data-shot]'))){ g.autoShot = false; shot(b.dataset.shot); return; }
      if ((b = q('[data-tset]'))){ v.timeOfDay = b.dataset.tset; g.pendingLabel = 'Time: ' + b.dataset.tset; save(); sync(); paintHUD(); return; }
      if ((b = q('[data-inspire]'))){ applyInspire(+b.dataset.inspire); return; }
      if ((b = q('[data-cat]'))){ g.cat = b.dataset.cat; v._cat = g.cat; save(); paint(true); haptic(6); if (g.studio && g.studio.focused){ g.studio.overview(); $g('#g-overview').hidden = true; } if (g.collapsed) collapse(false); return; }
      if ((b = q('[data-tab]'))){ g.tab[g.cat] = b.dataset.tab; paint(true); return; }
      if ((b = q('[data-fav]'))){ const id = b.dataset.fav, on = !(v._fav || []).includes(id); v._fav = on ? (v._fav || []).concat([id]) : v._fav.filter(x => x !== id); save(); if (hooks.onFav) hooks.onFav(id, on); paintCards(); haptic(6); if (on) burst(b, false); if (g.searching && g.filter === 'fav') results(); return; }
      if ((b = q('[data-plus]'))){ if (g.studio){ g.studio.addItem(b.dataset.plus); setTimeout(() => { g.studio.focusOn(b.dataset.plus); $g('#g-overview').hidden = false; paintLight(); }, 60); haptic(8); } return; }
      if ((b = q('[data-tog]'))){ const c = allCards().find(x => x.id === b.dataset.tog), el = b.closest('.g-card'); const lock = c.lock && c.lock(v);
        if (lock){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); haptic([6,30,6]); toast(esc(lock), 'lock'); return; }
        if (c.addOnly){ if (g.studio){ g.studio.addItem(c.item); setTimeout(() => { g.studio.focusOn(c.item); $g('#g-overview').hidden = false; }, 60); } equip(el, null, true); return; }
        const was = c.on(v); c.toggle(v); g.pendingLabel = (was ? 'Removed ' : 'Added ') + c.label; save(); if (!was && typeof TRACK === 'function') TRACK('item_equipped', { item:c.id }); equip(el, c.fx ? null : c.item, !was); if (c.fx && !was && g.studio) { g.studio.overview(); } return; }
      if ((b = q('[data-ev]'))){ v.eventType = b.dataset.ev; save(); equip(b.closest('.g-card'), null, true); paint(); return; }
      if ((b = q('[data-venue]'))){ v._photo = false; v.venueType = [b.dataset.venue]; if (/Boat/.test(b.dataset.venue)) v.setting = 'Outdoor'; save(); equip(b.closest('.g-card'), null, true); if (g.studio){ g.studio.showMatch(false); g.studio.overview(); } paint(); return; }
      if ((b = q('[data-seat]'))){ v.seating = [b.dataset.seat]; if (!+v.guests) v.guests = 80; save(); equip(b.closest('.g-card'), null, true); if (g.studio) g.studio.overview(); paint(); return; }
      if ((b = q('[data-mood]'))){ togArr(v,'style',b.dataset.mood); if (!arr(v,'colors').length){ const p = STYLES[b.dataset.mood]; v.colors = CZ_PALETTE.filter(([, h]) => p.includes(h)).map(x => x[0]).slice(0,3); } save(); equip(b.closest('.g-card'), null, has(v,'style',b.dataset.mood)); paint(); return; }
      if ((b = q('[data-chair]'))){ v.chairs = [b.dataset.chair]; save(); equip(b.closest('.g-card'), null, true); return; }
      if ((b = q('[data-lin]'))){ v.linens = [b.dataset.lin]; save(); equip(b.closest('.g-card'), null, true); return; }
      if ((b = q('[data-cp]'))){ v.centerpieces = [b.dataset.cp]; save(); equip(b.closest('.g-card'), null, true); return; }
      if ((b = q('[data-df]'))){ v.danceFloor = b.dataset.df; if (!has(v,'areas','Dance floor')) togArr(v,'areas','Dance floor'); if (b.dataset.df === 'LED' && !has(v,'lights','LED dance floor')) togArr(v,'lights','LED dance floor'); save(); equip(b.closest('.g-card'), 'dancefloor', true); return; }
      if ((b = q('[data-color]'))){ const n = b.dataset.color; if (!arr(v,'colors').includes(n) && arr(v,'colors').length >= 4){ toast('Pick up to 4 colors', 'info'); return; } togArr(v,'colors',n); save(); b.classList.remove('equip'); void b.offsetWidth; b.classList.add('equip'); haptic(6); sync(); paintLight(); return; }
      if ((b = q('[data-pal]'))){ v.colors = b.dataset.pal.split('|'); save(); burst(b); haptic(8); sync(); paint(); return; }
      if ((b = q('[data-time]'))){ v.timeOfDay = b.dataset.time; save(); sync(); paint(); haptic(6); return; }
      if ((b = q('[data-size]'))){ v.venueSize = b.dataset.size; save(); sync(); if (g.studio) g.studio.overview(); paint(); haptic(6); return; }
      if ((b = q('[data-bloom]'))){ v.flowerLevel = b.dataset.bloom; save(); burst(b, false); sync(); paint(); return; }
      if ((b = q('[data-gt]'))){ const f = field(b.dataset.gt); const was = arr(v,f.id).includes(b.dataset.val); if (!was && f.max && arr(v,f.id).length >= f.max){ toast(`Pick up to ${f.max}`, 'info'); return; } togArr(v,f.id,b.dataset.val); save(); b.setAttribute('aria-pressed', !was); sync(); paintHUD(); return; }
      if ((b = q('[data-gs]'))){ const f = b.dataset.gs; v[f] = v[f] === b.dataset.val ? '' : b.dataset.val; save(); paint(); sync(); return; }
      if ((b = q('[data-step]'))){ const id = b.dataset.step, d = +b.dataset.d; g.pendingLabel = 'Changed ' + id; v[id] = Math.max(0, (+v[id] || 0) + d); save(); updStep(id); return; }
      if ((b = q('[data-g]'))){ act(b.dataset.g, b); return; }
    });
    let stepT; const updStep = id => { const o = $g('#g-out-' + id), r = $g(`[data-range="${id}"]`); if (o){ o.textContent = v[id] || 0; o.classList.remove('bump'); void o.offsetWidth; o.classList.add('bump'); } if (r) r.value = v[id] || 0; clearTimeout(stepT); stepT = setTimeout(() => { sync(); paintLight(); if (id === 'cakeTiers') sync(); }, 160); };
    root.addEventListener('input', e => {
      const t = e.target;
      if (t.id === 'g-q'){ g.q = t.value; results(); return; }
      if (t.dataset.range){ g.pendingLabel = 'Changed ' + t.dataset.range; v[t.dataset.range] = +t.value; save(); updStep(t.dataset.range); }
      if (t.dataset.gi){ v[t.dataset.gi] = t.value; save(); if (t.dataset.gi === 'eventName') paintHUD(); }
    });
    root.addEventListener('change', e => { if (e.target.dataset.gi === 'date'){ v.date = e.target.value; save(); paintHUD(); } });
    // compare: hold to see the empty venue (Before) or the previous version (Previous); tap switches mode
    const cmp = $g('#g-compare'); let cmpT = null, cmpShown = false; g.cmpMode = 'Before';
    const cmpShow = () => { if (!g.studio) return; cmpShown = true; root.classList.add('comparing'); root.dataset.cmp = g.cmpMode;
      if (g.cmpMode === 'Before') g.studio.setCompare(true); else { const prev = H.undo[H.undo.length - 1]; if (prev) g.studio.sync(Object.assign(JSON.parse(prev.snap), { _fav:v._fav })); else toast('No previous version yet', 'info'); } };
    const cmpHide = () => { clearTimeout(cmpT); if (!cmpShown || !g.studio) return; cmpShown = false; root.classList.remove('comparing'); g.studio.setCompare(false); if (g.cmpMode === 'Previous') g.studio.sync(v); };
    cmp.addEventListener('pointerdown', e => { e.preventDefault(); cmpT = setTimeout(cmpShow, 160); });
    cmp.addEventListener('pointerup', () => { if (!cmpShown){ clearTimeout(cmpT); g.cmpMode = g.cmpMode === 'Before' ? 'Previous' : 'Before'; $g('#g-cmp-l').textContent = g.cmpMode; toast(g.cmpMode === 'Before' ? 'Hold to compare with the empty venue' : 'Hold to compare with your previous version', 'eye'); } else cmpHide(); });
    ['pointerleave','pointercancel'].forEach(ev => cmp.addEventListener(ev, cmpHide));
    cmp.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); cmpShow(); } }); cmp.addEventListener('keyup', cmpHide);
    // menu
    const menu = $g('#g-menu-pop'), mb = $g('#g-menu'); mb.addEventListener('click', () => { menu.hidden = !menu.hidden; mb.setAttribute('aria-expanded', !menu.hidden); });
    document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== mb && !mb.contains(e.target)){ menu.hidden = true; mb.setAttribute('aria-expanded','false'); } });
    $g('#g-overview').addEventListener('click', () => { if (g.studio) g.studio.overview(); $g('#g-overview').hidden = true; });
    $g('#g-ring').addEventListener('click', showAchievements);
    const collapse = on => { g.collapsed = on; root.classList.toggle('collapsed', on); $g('#g-handle').setAttribute('aria-expanded', !on); };
    $g('#g-handle').addEventListener('click', () => collapse(!g.collapsed));
    // swipe the sheet down to collapse, up to expand
    let sy = null; $g('.g-sheet-h').addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive:true });
    $g('.g-sheet-h').addEventListener('touchend', e => { if (sy == null) return; const dy = e.changedTouches[0].clientY - sy; if (dy > 40) collapse(true); if (dy < -40) collapse(false); sy = null; }, { passive:true });

    /* ---------- camera ---------- */
    function camView(k){ const s = g.studio; if (!s) return; s.cam.auto = false; const G = s.goal;
      if (k === 'overview'){ s.overview(); $g('#g-overview').hidden = true; return; }
      if (k === 'front'){ G.theta = Math.PI/2; G.phi = .42; G.target = [0,.4,0]; G.r = 22; }
      if (k === 'side'){ G.theta = 0; G.phi = .38; G.target = [0,.4,0]; G.r = 22; }
      if (k === 'top'){ G.phi = 1.42; G.target = [0,0,0]; G.r = 26; }
      if (k === 'guest'){ G.phi = .1; G.r = 9 / (s.scale || 1); G.target = [0,1.4,2]; G.theta = Math.PI/2; }
      $g('#g-overview').hidden = k === 'front' || k === 'side';
    }
    if (g.studio){ const cv = $g('.studio-canvas'), s = g.studio; let pan = null, two = new Map();
      cv.addEventListener('wheel', e => { e.preventDefault(); s.cam.auto = false; s.goal.r = Math.max(4, Math.min(48, s.goal.r * (1 + Math.sign(e.deltaY) * Math.min(.25, Math.abs(e.deltaY) * .0015)))); }, { passive:false });
      cv.addEventListener('contextmenu', e => e.preventDefault());
      const panBy = (dx, dy) => { const th = s.cam.theta, k = s.goal.r * (s.scale || 1) * .0016, fx = -Math.cos(th), fz = -Math.sin(th); const T = s.goal.target || (s.goal.target = s.cam.target.slice());
        T[0] += (-fz * -dx + fx * dy) * k; T[2] += (fx * -dx + fz * dy) * k; T[0] = Math.max(-30, Math.min(30, T[0])); T[2] = Math.max(-30, Math.min(30, T[2])); $g('#g-overview').hidden = false; };
      cv.addEventListener('pointerdown', e => { two.set(e.pointerId, [e.clientX, e.clientY]); if (e.button === 2 || e.shiftKey){ pan = [e.clientX, e.clientY]; s.drag = null; } }, true);
      cv.addEventListener('pointermove', e => { if (pan){ panBy(e.clientX - pan[0], e.clientY - pan[1]); pan = [e.clientX, e.clientY]; s.drag = null; return; }
        if (two.has(e.pointerId) && two.size === 2){ const prev = [...two.values()], c0 = [(prev[0][0] + prev[1][0]) / 2, (prev[0][1] + prev[1][1]) / 2]; two.set(e.pointerId, [e.clientX, e.clientY]); const now_ = [...two.values()], c1 = [(now_[0][0] + now_[1][0]) / 2, (now_[0][1] + now_[1][1]) / 2]; panBy((c1[0] - c0[0]) * .6, (c1[1] - c0[1]) * .6); } else if (two.has(e.pointerId)) two.set(e.pointerId, [e.clientX, e.clientY]); }, true);
      const up = e => { two.delete(e.pointerId); pan = null; }; cv.addEventListener('pointerup', up, true); cv.addEventListener('pointercancel', up, true);
    }
    /* ---------- cinematic preview ---------- */
    const SHOTS = ['orbit','stage','guest','top'];
    function shot(k){ const s = g.studio; if (!s) return; $$('[data-shot]', root).forEach(b => b.setAttribute('aria-pressed', b.dataset.shot === k)); s.cam.auto = k === 'orbit' || k === 'top';
      const focal = ['kosha','stage','dancefloor','dj','band','flowerwall','arch'].map(t => s.items.find(i => i.type === t)).find(Boolean);
      if (k === 'orbit'){ s.goal.target = [0,.6,0]; s.goal.r = 20; s.goal.phi = .45; }
      if (k === 'stage'){ s.goal.target = focal ? [focal.x, 1.2, focal.z] : [0,1,-4]; s.goal.r = 10 / (s.scale || 1); s.goal.phi = .28; s.goal.theta = Math.PI/2 + .35; }
      if (k === 'guest'){ s.goal.target = focal ? [focal.x, 1.5, focal.z] : [0,1.5,0]; s.goal.r = 13 / (s.scale || 1); s.goal.phi = .07; s.goal.theta = Math.PI/2 - .2; }
      if (k === 'top'){ s.goal.target = [0,0,0]; s.goal.r = 24; s.goal.phi = 1.38; }
      $g('#g-pv-cap').textContent = { orbit:'Your event', stage:'The stage', guest:'What your guests will see', top:'The full layout' }[k]; }
    function preview(on){
      root.classList.toggle('previewing', on); $g('#g-pv').hidden = !on; if (!g.studio) return;
      if (on){ if (typeof TRACK === 'function') TRACK('preview_opened', {}); menu.hidden = true; $g('#g-views').hidden = true; const s = g.studio; s.select(null); g.autoShot = true; let i = 0; shot('orbit');
        clearInterval(g.pvT); g.pvT = setInterval(() => { if (!g.autoShot) return; i = (i + 1) % SHOTS.length; shot(SHOTS[i]); }, 7000);
        try { if (document.fullscreenEnabled && !document.fullscreenElement) root.requestFullscreen({ navigationUI:'hide' }).catch(() => {}); } catch(e){} }
      else { clearInterval(g.pvT); g.studio.cam.auto = false; g.studio.overview(); try { if (document.fullscreenElement) document.exitFullscreen(); } catch(e){} }
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('previewing')) preview(false); });
    /* ---------- live budget: only items with a real price (set in the admin catalogue) are counted ---------- */
    function estimate(){ let total = 0; const lines = []; let unpriced = 0;
      Object.values(CARDS).flat().forEach(c => { if (c.available === false || !c.on(v)) return; const n = c.item && g.studio ? Math.max(1, g.studio.items.filter(i => i.type === c.item).length) : 1;
        if (c.price){ total += c.price * n; lines.push([c.label, c.price * n, n]); } else unpriced++; });
      return { total, lines:lines.sort((a, b) => b[1] - a[1]), unpriced, budget:+v.budget || 0 }; }
    const k$ = n => n >= 10000 ? `$${Math.round(n / 1000)}k` : n >= 1000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `$${n}`;
    /* ---------- event score: transparent rules → useful tips ---------- */
    function scoreOf(){
      const L = arr(v,'lights'), E = arr(v,'effects'), A = arr(v,'areas'), M = arr(v,'music'), guests = +v.guests || 0, tips = [], clamp = x => Math.max(0, Math.min(100, Math.round(x)));
      const night = ['Evening','Late night'].includes(v.timeOfDay || 'Evening') || ST.INDOOR.has(ST.venueOf(v)), ps = g.studio ? g.studio.planStats() : { seats:0, used:0 };
      const standing = arr(v,'seating').some(x => /Cocktail|Lounge/.test(x)), floorLit = L.includes('Moving heads') || L.includes('Colored uplighting') || v.danceFloor === 'LED';
      let design = 40 + (arr(v,'colors').length >= 2 ? 15 : 0) + (arr(v,'style').length ? 10 : 0) + (arr(v,'backdrop').filter(x => x !== 'None').length ? 15 : 0) + ({ Minimal:6, Moderate:10, Lavish:15, 'Over the top':15 }[v.flowerLevel] || 0) + (arr(v,'centerpieces').length ? 5 : 0);
      if (arr(v,'colors').length < 2) tips.push(['style','Choose a color palette', 8]); if (!arr(v,'backdrop').filter(x => x !== 'None').length) tips.push(['decor','Add a backdrop, like a flower wall or arch', 10]);
      let light = 30 + Math.min(45, L.length * 15) + (night && L.length ? 15 : 0) + (A.includes('Dance floor') && floorLit ? 10 : 0);
      if (night && !L.length) tips.push(['lights','Add lighting for an evening event', 15]); else if (A.includes('Dance floor') && !floorLit) tips.push(['lights','Add stronger dance-floor lighting (moving lights or an LED floor)', 6]);
      let atmo = 30 + (M.length ? 20 : 0) + Math.min(20, E.length * 10) + (L.length ? 10 : 0) + (v.timeOfDay === 'Sunset' && !ST.INDOOR.has(ST.venueOf(v)) ? 10 : 0) + (A.includes('Dance floor') ? 10 : 0);
      if (!M.length) tips.push(['stage','Add music: a DJ or a live band', 12]); if (!E.length && M.length) tips.push(['lights','Add a signature moment, like cold sparks for the first dance', 5]);
      let guest = 55 + (A.includes('Bar area') ? 12 : 0) + (arr(v,'service').length || CARDS.food.some(c => c.on(v)) ? 12 : 0) + (A.includes('Lounge corner') ? 6 : 0);
      if (!A.includes('Bar area')) tips.push(['food','Add a bar so guests aren’t waiting for drinks', 6]);
      if (guests && !standing && ps.seats && ps.seats < guests * .95){ guest -= 25; tips.push(['guests',`Seating fits ${ps.seats} of ${guests} guests`, 12]); }
      if (ps.used > 72){ guest -= 15; tips.push(['venue','Your venue feels crowded: choose a larger size', 8]); }
      let ent = 30 + (M.length ? 25 : 0) + (A.includes('Dance floor') ? 15 : 0) + Math.min(20, arr(v,'activities').length * 10) + (E.length ? 10 : 0);
      if (!A.includes('Dance floor') && M.length) tips.push(['stage','Add a dance floor', 8]); if (!arr(v,'activities').length && guests >= 40) tips.push(['fun','Add an activity, like a photo booth', 6]);
      const es = estimate(); let bud = null;
      if (es.budget && es.total){ const r = es.total / es.budget; bud = r <= .85 ? 95 : r <= 1 ? 85 : r <= 1.15 ? 60 : 35; if (r > 1) tips.unshift(['budget',`Priced items are ${k$(es.total - es.budget)} over your budget`, 15]); }
      const cats = [['Design', clamp(design)], ['Lighting', clamp(light)], ['Atmosphere', clamp(atmo)], ['Guest experience', clamp(guest)], ['Entertainment', clamp(ent)]]; if (bud != null) cats.push(['Budget efficiency', bud]);
      return { total:Math.round(cats.reduce((a, c) => a + c[1], 0) / cats.length), cats, tips:tips.sort((a, b) => b[2] - a[2]).slice(0, 4) };
    }
    function scorePanel(){ const sc = scoreOf(); openModal({ title:`Event score ${sc.total}/100`, body:`<p class="muted small" style="margin:-.5rem 0 1rem">How complete and well-balanced your design is. It updates as you design.</p>
      <div class="sc-list">${sc.cats.map(([l, n]) => `<div class="sc-row"><span>${l}</span><i><em style="width:${n}%"></em></i><b>${n}</b></div>`).join('')}</div>
      ${sc.tips.length ? `<h3 class="h3" style="margin:1.4rem 0 .6rem">Biggest improvements</h3><div class="sc-tips">${sc.tips.map(([cat, t, pts]) => `<button type="button" class="sc-tip" data-goto="${cat}"><span>${esc(t)}</span><b>+${pts}</b></button>`).join('')}</div>` : `<p class="notice" style="margin-top:1rem">${icon('star')}A beautifully balanced design.</p>`}`,
      onMount(m){ m.addEventListener('click', e => { const b = e.target.closest('[data-goto]'); if (!b) return; closeModal(); const cat = b.dataset.goto === 'budget' ? 'details' : b.dataset.goto; g.cat = cat; if (cat === 'lights' && /sparks/.test(b.textContent)) g.tab.lights = 'Effects'; if (cat === 'details') g.tab.details = 'When'; g.searching = false; paint(true); if (g.collapsed) collapse(false); }); } }); }
    function budgetPanel(){ const es = estimate(), over = es.budget && es.total > es.budget;
      openModal({ title:'Budget', body:`<div class="bg-top"><label class="field" style="margin:0"><span class="small muted">Your budget (USD)</span><input class="input" id="bg-in" type="number" min="0" step="500" value="${es.budget || ''}" placeholder="e.g. 15000"></label>
        <div class="bg-k"><small>Estimated</small><b>${es.total ? money(es.total) : '—'}</b></div><div class="bg-k ${over ? 'over' : ''}"><small>${over ? 'Over by' : 'Remaining'}</small><b>${es.budget && es.total ? money(Math.abs(es.budget - es.total)) : '—'}</b></div></div>
        ${es.budget && es.total ? `<div class="bg-bar ${over ? 'over' : ''}"><i style="width:${Math.min(100, es.total / es.budget * 100)}%"></i></div>` : ''}
        ${es.lines.length ? `<table class="ai-diff" style="margin-top:1rem">${es.lines.map(([l, p, n]) => `<tr><td>${esc(l)}${n > 1 ? ` × ${n}` : ''}</td><td style="text-align:right">${money(p)}</td></tr>`).join('')}</table>` : ''}
        <p class="small muted" style="margin-top:.9rem">${es.lines.length ? 'Estimate includes items with a starting price. ' : ''}${es.unpriced ? `${es.unpriced} selected item${es.unpriced > 1 ? 's are' : ' is'} priced on request. ` : ''}Venue, catering and staff are quoted by our team.</p>
        <div class="chip-row" style="margin-top:1rem"><button class="btn btn-primary" id="bg-save">Save budget</button>${es.budget ? `<button class="btn btn-ghost" id="bg-opt">${icon('sparkle','sm')}Optimize my budget</button>` : ''}</div>`,
        onMount(m){ $('#bg-save', m).onclick = () => { v.budget = Math.max(0, Math.round(+$('#bg-in', m).value || 0)); g.pendingLabel = 'Budget set'; save(); paintHUD(); closeModal(); toast('Budget saved'); };
          const o = $('#bg-opt', m); if (o) o.onclick = () => { closeModal(); if (typeof MA3AK_AI !== 'undefined') { MA3AK_AI.open(); MA3AK_AI.send(`Optimize my design for a ${money(v.budget)} budget. Suggest what to reduce and what has the most impact.`); } else { const top = es.lines.slice(0, 2).map(l => l[0]).join(' and '); toast(top ? `Biggest costs: ${esc(top)}. Removing or swapping these saves the most.` : 'Set prices in the admin catalogue to see where the money goes.', 'info'); } }; } }); }
    /* ---------- create my dream event (guided, then the venue builds itself) ---------- */
    function magic(){
      const box = $g('#g-magic'), ans = { type:v.eventType || '', style:'', mood:'', venue:'', guests:+v.guests || 120, budget:+v.budget || 0 }; let step = 0;
      const chips = (key, items) => `<div class="mg-grid">${items.map(([val, label, sub]) => `<button type="button" class="mg-c" data-k="${key}" data-v="${esc(val)}" aria-pressed="${String(ans[key]) === String(val)}"><b>${esc(label)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('')}</div>`;
      const STEPS = [
        ['What are we celebrating?', () => chips('type', DREAM.types)],
        ['Pick a style', () => chips('style', Object.entries(DREAM.styles).map(([k, st]) => [k, k, st.colors.join(' · ')]))],
        ['What atmosphere?', () => chips('mood', Object.keys(DREAM.moods).map(k => [k, k, { Romantic:'Soft, warm, candlelit', Elegant:'Refined and timeless', Party:'High energy all night', 'Afro House':'Deep beats, warm vibes', Chill:'Relaxed lounge feel', Traditional:'Zaffe, dabke, celebration' }[k]]))],
        ['Where?', () => chips('venue', DREAM.venues.map(x => [x, x.split(' /')[0].replace('Historic palace','Palace')]))],
        ['How many guests, and what budget?', () => `<div class="mg-num"><span>Guests</span><output id="mg-g">${ans.guests}</output><input type="range" min="10" max="700" step="10" value="${ans.guests}" id="mg-gr" aria-label="Guests"></div>${chips('budget', [['0','Not sure yet']].concat(DREAM.budgets.map(([l, n]) => [String(n), l])))}`],
      ];
      const render = () => { const [q, f] = STEPS[step], need = ['type','style','mood','venue'][step];
        box.innerHTML = `<div class="mg-in"><div class="mg-top"><button type="button" class="g-ib" data-mg="close" aria-label="Close">${icon('x','sm')}</button><div class="mg-dots">${STEPS.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div><button type="button" class="mg-skip" data-mg="random">${icon('refresh','sm')}Surprise me</button></div>
          <p class="mg-k">${icon('sparkle','sm')}Create my dream event</p><h2>${q}</h2>${f()}<div class="mg-nav">${step ? `<button type="button" class="g-cta ghost" data-mg="back">Back</button>` : '<span></span>'}<button type="button" class="g-cta" data-mg="next" ${need && !ans[need] ? 'disabled' : ''}>${step === STEPS.length - 1 ? `${icon('sparkle','sm')}Build my event` : 'Next'}</button></div></div>`;
        const r = $('#mg-gr', box); if (r) r.oninput = () => { ans.guests = +r.value; $('#mg-g', box).textContent = r.value; }; };
      box.onclick = e => { const c = e.target.closest('[data-k]'); if (c){ ans[c.dataset.k] = c.dataset.k === 'budget' ? +c.dataset.v : c.dataset.v; haptic(6); render(); if (step < 4) setTimeout(() => { step++; render(); }, 220); return; }
        const b = e.target.closest('[data-mg]'); if (!b) return; const k = b.dataset.mg;
        if (k === 'close'){ box.hidden = true; return; } if (k === 'back'){ step--; render(); return; }
        if (k === 'random'){ box.hidden = true; surprise(); return; }
        if (k === 'next'){ if (step < STEPS.length - 1){ step++; render(); } else { box.hidden = true; build(concept(ans), `Your ${ans.style.toLowerCase()} ${evName(ans.type).toLowerCase()}`); } } };
      render(); box.hidden = false; menu.hidden = true;
    }
    // Apply a design in stages so the venue visibly assembles itself, then save once (one undo step).
    function build(target, title, after){
      clearTimeout(g.buildT); const keep = { eventName:v.eventName, date:v.date, fullName:v.fullName, phone:v.phone, email:v.email, _photo:v._photo };
      Object.keys(v).forEach(k => { if (!SKIP.includes(k) && !(k in keep)) delete v[k]; }); Object.entries(keep).forEach(([k, x]) => { if (x !== undefined) v[k] = x; }); if (v._photo) delete target.venueType;
      const STAGES = [['Setting the venue', ['eventType','venueType','timeOfDay','guests','style','colors','theme','budget']], ['Placing tables and chairs', ['seating','chairs','linens','centerpieces']], ['Building the stage', ['areas','music','genres','danceFloor']],
        ['Decorating', ['backdrop','flowerLevel','balloons','extrasDecor']], ['Lighting it up', ['lights']], ['Final touches', ['effects','service','drinks','desserts','cake','cakeTiers','activities']]];
      const bb = $g('#g-build'); bb.hidden = false; root.classList.add('building'); if (g.studio){ g.studio.cam.auto = true; g.studio.goal.r = 30; g.studio.goal.phi = .75; }
      let i = 0; const next = () => {
        if (i >= STAGES.length){ bb.hidden = true; root.classList.remove('building'); g.pendingLabel = title; save(); checkAch(); if (g.studio){ g.studio.cam.auto = false; g.studio.overview(); } g.cat = 'stage'; g.searching = false; paint(true); banner(title, 'Designed for you. Make it yours', 'sparkle'); if (after) after(); return; }
        const [label, keys] = STAGES[i++]; keys.forEach(k => { if (target[k] !== undefined) v[k] = Array.isArray(target[k]) ? target[k].slice() : target[k]; }); $g('#g-build-t').textContent = label; sync(); paintHUD(); haptic(5);
        if (g.studio && i === 3){ const f = g.studio.items.find(x => ['kosha','stage','dancefloor'].includes(x.type)); if (f) { g.studio.goal.target = [f.x, .8, f.z]; g.studio.goal.r = 14; } }
        if (g.studio && i === 5){ g.studio.goal.target = [0,.5,0]; g.studio.goal.r = 24; g.studio.goal.phi = .5; }
        g.buildT = setTimeout(next, 1150); };
      next(); if (typeof TRACK === 'function') TRACK('inspire_used', { preset:title.slice(0, 60) });
    }
    function surprise(){ const o = surpriseOpts(); $g('#g-roll').hidden = true; menu.hidden = true;
      build(concept(o), `${o.style} ${evName(o.type).toLowerCase()}`, () => { $g('#g-roll-t').textContent = `${o.style} · ${o.mood} · ${o.venue.split(' /')[0]}`; $g('#g-roll').hidden = false; }); }
    /* ---------- simulate the event: guests arrive, lights come on, the party peaks, then the score ---------- */
    function simulate(){
      const s = g.studio; if (!s) return toast('The simulation needs 3D graphics', 'info'); clearTimeout(g.simT); $g('#g-sim').hidden = true; $g('#g-roll').hidden = true; if (g.planning) plan(false);
      preview(true); clearInterval(g.pvT); g.autoShot = false; root.classList.add('simulating'); if (typeof TRACK === 'function') TRACK('preview_opened', { mode:'simulate' });
      const outdoor_ = !ST.INDOOR.has(ST.venueOf(v)) || v._photo, sv = { ...v, timeOfDay:outdoor_ ? 'Sunset' : (v.timeOfDay || 'Evening') }, fav = s.items;
      const focus = types => fav.find(x => types.includes(x.type));
      const STEPS = [[0, 'Guests are arriving', () => { s.crowdScale = .15; s.sync(sv); shot('orbit'); }], [3600, 'The room fills up', () => { s.crowdScale = .6; s.sync(sv); shot('guest'); }],
        [7200, 'Dinner is served', () => { s.crowdScale = 1; s.sync(sv); const t = focus(['round','imperial','long','buffet','bar']); s.cam.auto = false; s.goal.target = t ? [t.x, .8, t.z] : [0,.6,0]; s.goal.r = 13 / (s.scale || 1); s.goal.phi = .45; }],
        [10800, 'Lights down, music up', () => { sv.timeOfDay = outdoor_ ? 'Evening' : sv.timeOfDay; s.sync(sv); shot('stage'); }],
        [14400, 'Peak party', () => { const d = focus(['dancefloor','dj','band']); s.goal.target = d ? [d.x, 1, d.z] : [0,1,0]; s.goal.r = 15 / (s.scale || 1); s.goal.phi = .35; s.cam.auto = true; }],
        [18400, '', () => { const sc = scoreOf(); $g('#g-pv-cap').textContent = '';
          $g('#g-sim').innerHTML = `<p class="sim-k">Event experience score</p><b class="sim-n">${sc.total}<small>/100</small></b><div class="sc-list">${sc.cats.map(([l, n]) => `<div class="sc-row"><span>${l}</span><i><em style="width:${n}%"></em></i><b>${n}</b></div>`).join('')}</div>
            ${sc.tips.length ? `<p class="sim-tip">${icon('sparkle','sm')}${esc(sc.tips[0][1])} <b>+${sc.tips[0][2]}</b></p>` : ''}<div class="sim-a"><button type="button" class="g-cta" data-g="sim-exit">Back to design</button><button type="button" class="g-cta ghost" data-g="simulate">${icon('refresh','sm')}Replay</button></div>`;
          $g('#g-sim').hidden = false; }]];
      STEPS.forEach(([t, cap, fn]) => { g.simT = setTimeout(() => { if (!root.classList.contains('simulating')) return; if (cap) $g('#g-pv-cap').textContent = cap; fn(); }, t); });
    }
    function endSim(){ root.classList.remove('simulating'); $g('#g-sim').hidden = true; if (g.studio){ g.studio.crowdScale = 1; g.studio.sync(v); } preview(false); }
    /* ---------- 2D floor plan: top-down, grid, snap, seats and space ---------- */
    function plan(on){ const s = g.studio; if (!s) return; g.planning = on; root.classList.toggle('planning', on); $g('#g-plan').setAttribute('aria-pressed', on); s.snap = on; s.setGrid(on); $g('#g-cap').hidden = !on;
      if (on){ if (matchMedia('(max-width: 1023px)').matches) collapse(true); $g('#g-roll').hidden = true; s.cam.auto = false; s.goal.target = [0,0,0]; s.goal.phi = 1.5; s.goal.theta = Math.PI/2; s.goal.r = 25; toast('Floor plan: drag items to arrange them. They snap to a half-metre grid.', 'grid'); } else s.overview(); paintCap(); }
    function paintCap(){ if (!g.planning || !g.studio) return; const st = g.studio.planStats(), guests = +v.guests || 0, short = guests && st.seats < guests && !arr(v,'seating').some(x => /Cocktail|Lounge/.test(x));
      $g('#g-cap').innerHTML = `<span><b>${st.seats}</b> seats</span><span><b>${guests || '—'}</b> guests</span><span><b>${st.W}×${st.D} m</b> venue</span><span class="${st.used > 72 ? 'warn' : ''}"><b>${st.used}%</b> space used</span>${short ? `<span class="warn">${guests - st.seats} guests without a seat</span>` : ''}`; }
    /* ---------- inspire me ---------- */
    function showInspire(){
      openModal({ title:'Inspire me', wide:true, body:`<p class="muted small" style="margin:-.5rem 0 1rem">Start from a complete design, then make it yours. You can undo it any time.</p><div class="insp-grid">${INSPIRE.map(([t, d, ev], i) => `<button type="button" class="insp" data-inspire="${i}"><span class="insp-art" data-insp="${S3.FOR_EVENT[ev] || 'wedding'}"><img alt="" hidden></span><b>${esc(t)}</b><small>${esc(d)}</small></button>`).join('')}</div>`,
        onMount(m){ m.addEventListener('click', e => { const b = e.target.closest('[data-inspire]'); if (b){ closeModal(); applyInspire(+b.dataset.inspire); } });
          $$('[data-insp]', m).forEach(el => { const k = el.dataset.insp, img = $('img', el); const show = u => { img.src = u; img.hidden = false; }; if (snapCache[k]) show(snapCache[k]); else setTimeout(() => { try { snapCache[k] = snapCache[k] || GL3D.snapshot(S3.SCENES[k], 480, 300); show(snapCache[k]); } catch(e){} }, 40); }); } });
    }
    function applyInspire(i){ const [title, , ev, preset] = INSPIRE[i]; g.pendingLabel = 'Inspire me: ' + title;
      Object.keys(v).forEach(k => { if (!SKIP.includes(k) && !['eventName','date','fullName','phone','email'].includes(k)) delete v[k]; });
      Object.assign(v, JSON.parse(JSON.stringify(preset)), { eventType:ev }); save(); sync(); if (g.studio){ g.studio.overview(); g.studio.goal.theta += .8; }
      g.cat = 'stage'; g.searching = false; paint(true); banner(title, 'Design applied. Make it yours', 'sparkle'); if (typeof TRACK === 'function') TRACK('inspire_used', { preset:title }); }
    /* ---------- overview, progression, all categories ---------- */
    const nextCat = () => CATS.slice(0, 10).find(c => !c.done(v));
    function overview(){
      const p = progress(v), n = nextCat(), d = ST.describe(v);
      const fact = (l, val) => `<div><small>${l}</small><b>${val ? esc(String(val)) : '<span class="g-dim">Not set</span>'}</b></div>`;
      return `<div class="g-ov-h"><div><small>Event</small><b>${esc(v.eventName || (v.eventType ? evName(v.eventType) : 'New event'))}</b></div><span class="g-ov-p">${p}%</span></div>
        <div class="g-ov-bar"><i style="width:${p}%"></i></div>
        <div class="g-ov-f">${fact('Date', v.date ? fmtDate(v.date, { day:'numeric', month:'short', year:'numeric' }) : '')}${fact('Guests', v.guests)}${fact('Venue', v._photo ? 'Your photo' : (v.venueType || [])[0] && v.venueType[0].split(' /')[0])}${fact('Style', (v.style || [])[0])}${fact('Budget', v.budget ? money(v.budget) : '')}${fact('Items', d.items.length)}</div>
        <ol class="g-steps">${CATS.slice(0, 11).map(c => `<li><button type="button" data-cat="${c.id}" class="${c.done(v) ? 'ok' : ''}${n && n.id === c.id ? ' nx' : ''}">${icon(c.done(v) ? 'check' : c.icon,'sm')}<span>${c.name}</span>${n && n.id === c.id ? '<em>Next</em>' : ''}</button></li>`).join('')}</ol>`;
    }
    function showAll(){ const a = $g('#g-all'); if (!a.hidden){ a.hidden = true; return; } const n = nextCat();
      a.innerHTML = `<div class="g-all-h"><b>All categories</b><button class="g-ib" type="button" data-g="all" aria-label="Close">${icon('x','sm')}</button></div>${['Setup','Design','Plan','Finish'].map(gr => `<h3>${gr}</h3><div class="g-all-g">${CATS.filter(c => GROUP[c.id] === gr).map(c => `<button type="button" data-cat="${c.id}" class="${c.done(v) ? 'ok' : ''}${n && n.id === c.id ? ' nx' : ''}">${icon(c.icon)}<span>${c.name}</span>${c.done(v) ? `<i>${icon('check','sm')}</i>` : n && n.id === c.id ? '<em>Next</em>' : ''}</button>`).join('')}</div>`).join('')}`;
      a.hidden = false; }
    $g('#g-title').addEventListener('click', () => { const o = $g('#g-ov'); o.hidden = !o.hidden; $g('#g-title').setAttribute('aria-expanded', !o.hidden); if (!o.hidden) o.innerHTML = overview(); });
    document.addEventListener('pointerdown', e => { const o = $g('#g-ov'); if (o && !o.hidden && !o.contains(e.target) && !$g('#g-title').contains(e.target)){ o.hidden = true; $g('#g-title').setAttribute('aria-expanded', 'false'); } const vp = $g('#g-views'); if (vp && !vp.hidden && !vp.contains(e.target) && !$g('#g-views-b').contains(e.target)) vp.hidden = true; });
    $g('#g-next').addEventListener('click', () => act('next'));
    // dock: scroll fades so it's obvious when more categories exist
    const ds = $g('#g-dock-s'), fades = () => { const vert = ds.scrollHeight > ds.clientHeight + 2 && getComputedStyle(ds).flexDirection === 'column'; const st = vert ? ds.scrollTop : ds.scrollLeft, max = vert ? ds.scrollHeight - ds.clientHeight : ds.scrollWidth - ds.clientWidth;
      ds.classList.toggle('f-start', st > 4); ds.classList.toggle('f-end', st < max - 4); };
    ds.addEventListener('scroll', fades, { passive:true }); new ResizeObserver(fades).observe(ds); setTimeout(fades, 100);
    try { if (localStorage.getItem('ma3ak:rail')) root.classList.add('rail-open'); } catch(e){}
    /* ---------- save status ---------- */
    g.setSave = (state, at) => { g.saveState = state; g.savedAt = at || Date.now(); paintSave(); };
    function paintSave(){ const el = $g('#g-save'); if (!el) return; const st = g.saveState, s = Math.round((Date.now() - (g.savedAt || Date.now())) / 1000);
      el.className = 'g-save ' + (st || ''); el.textContent = st === 'saving' ? 'Saving…' : st === 'saved' ? (s < 5 ? 'Saved' : s < 60 ? `Saved ${s}s ago` : `Saved ${Math.round(s/60)} min ago`) : st === 'local' ? 'Saved on this device' : st === 'offline' ? 'Offline, will retry' : st === 'error' ? 'Not saved' : ''; }
    setInterval(paintSave, 5000);
    window.MA3AK_BUILDER = { getState:() => v, eventId:hooks.eventId || null, apply(changes, label){ g.pendingLabel = label || 'Assistant suggestion'; Object.entries(changes).forEach(([k, val]) => { v[k] = Array.isArray(val) ? val.slice() : val; }); save(); sync(); if (g.studio) g.studio.overview(); paint(); banner('Suggestion applied', label || '', 'sparkle'); } };
    function act(k, b){
      menu.hidden = true;
      if (k === 'undo') return undo();
      if (k === 'redo') return redo();
      if (k === 'time'){ const order = ['Lunch / afternoon','Sunset','Evening'], cur = order.indexOf(v.timeOfDay || 'Evening'); v.timeOfDay = order[(cur + 1) % 3]; g.pendingLabel = 'Time: ' + v.timeOfDay; save(); sync(); paintHUD(); if (g.studio && ST.INDOOR.has(ST.venueOf(v))) toast('Indoor venue: switch to an outdoor setting to see the sky change', 'info'); return; }
      if (k === 'views'){ const p = $g('#g-views'); p.hidden = !p.hidden; $g('#g-views-b').setAttribute('aria-expanded', !p.hidden); return; }
      if (k === 'search'){ g.searching = !g.searching; paint(true); if (g.searching){ if (g.collapsed) collapse(false); setTimeout(() => { const i = $g('#g-q'); i && i.focus(); }, 50); } return; }
      if (k === 'all') return showAll();
      if (k === 'rail'){ root.classList.toggle('rail-open'); try { localStorage.setItem('ma3ak:rail', root.classList.contains('rail-open') ? '1' : ''); } catch(e){} return; }
      if (k === 'next'){ const n = nextCat(); if (n){ g.cat = n.id; g.searching = false; paint(true); } return; }
      if (k === 'preview') return preview(true);
      if (k === 'magic') return magic();
      if (k === 'surprise') return surprise();
      if (k === 'keep'){ $g('#g-roll').hidden = true; toast('Kept. Make it yours', 'check'); return; }
      if (k === 'simulate') return simulate();
      if (k === 'sim-exit') return endSim();
      if (k === 'plan') return plan(!g.planning);
      if (k === 'score') return scorePanel();
      if (k === 'budget') return budgetPanel();
      if (k === 'preview-exit') return root.classList.contains('simulating') ? endSim() : preview(false);
      if (k === 'inspire') return showInspire();
      if (k === 'ai'){ if (typeof MA3AK_AI !== 'undefined') MA3AK_AI.open(); else toast('The assistant is available on the live site', 'info'); return; }
      if (k === 'print'){ if (typeof printSummary === 'function') printSummary(v, g.studio ? g.studio.capture() : null); else window.print(); return; }
      if (k === 'share'){ if (hooks.share) hooks.share(); else toast(typeof apiU === 'function' ? 'Sign in to share your event' : 'Sharing works on the live site with a free account', 'info'); return; }
      if (k === 'history'){ if (hooks.history) hooks.history(); else toast(typeof apiU === 'function' ? 'Sign in to keep a version history' : 'Version history works on the live site with a free account', 'info'); return; }
      if (k === 'overview' && g.studio){ g.studio.overview(); $g('#g-overview').hidden = true; }
      if (k === 'top' && g.studio){ g.studio.goal.phi = g.studio.goal.phi < 1.3 ? 1.42 : .62; }
      if (k === 'style'){ GL3D.style = GL3D.style === 'illustrated' ? 'realistic' : 'illustrated'; try { localStorage.setItem('ma3ak:style', GL3D.style); } catch(e){} thumbs.clear(); paint(); toast(GL3D.style === 'illustrated' ? 'Illustrated graphics' : 'Realistic graphics', 'sparkle'); }
      if (k === '4k' && g.studio){ toast('Rendering your 4K picture…', 'image'); setTimeout(() => { const url = g.studio.render4K(); if (!url){ toast('This device can’t make a 4K picture. Try a computer.', 'alert'); return; } openModal({ title:'Your design in 4K', wide:true, body:`<p class="muted small" style="margin:-.5rem 0 1rem">${g.studio.last4k.w} × ${g.studio.last4k.h} pixels. Press and hold (or right-click) to save it.</p><img src="${url}" alt="Your event design in 4K" style="width:100%;border-radius:12px;display:block">` }); }, 80); }
      if (k === 'reset' && g.studio){ v._ov = {}; v._add = []; save(); sync(); paintLight(); toast('Layout reset to your choices', 'refresh'); }
      if (k === 'upload' && g.studio) $g('#st-file').click();
      if (k === 'adjust' && g.studio){ g.studio.showMatch(true); collapse(true); }
      if (k === 'remove-photo' && g.studio){ v._photo = false; try { localStorage.removeItem('ma3ak:photo'); } catch(e){} g.studio.photoReady = false; g.studio.showMatch(false); save(); sync(); paint(); }
      if (k === 'template'){ const tpl = TEMPLATES[v.eventType]; Object.entries(tpl).forEach(([key, val]) => { if (v[key] == null || v[key] === '' || (Array.isArray(v[key]) && !v[key].length)) v[key] = Array.isArray(val) ? val.slice() : val; }); save(); sync(); if (g.studio) g.studio.overview(); banner('Template applied', `A ${evName(v.eventType).toLowerCase()} starter is in place. Make it yours.`, 'sparkle'); g.cat = 'venue'; v._cat = 'venue'; paint(true); }
    }
    function showAchievements(){
      const p = progress(v);
      openModal({ title:`${levelOf(p)[1]} design`, body:`<div class="g-prog"><div class="g-prog-bar"><i style="width:${p}%"></i></div><p class="small muted">${p}% complete. ${LEVELS.map(l => `${l[1]} at ${l[0]}%`).join(', ')}.</p></div>
        <div class="g-ach-grid">${ACH.map(([id, name, desc, ic]) => `<div class="g-ach-it ${g.ach.has(id) ? 'got' : ''}"><span class="g-medal">${icon(g.ach.has(id) ? ic : 'lock')}</span><b>${esc(name)}</b><small>${esc(g.ach.has(id) ? desc : 'Locked')}</small></div>`).join('')}</div>` });
    }

    // send
    root.addEventListener('submit', async e => {
      if (e.target.id !== 'g-send-form') return; e.preventDefault();
      const name = $g('#g-fn').value.trim(), phone = $g('#g-ph').value.trim(), email = $g('#g-em').value.trim(), err = $g('#g-err');
      v.fullName = name; v.phone = phone; v.email = email; save();
      const problem = !name ? 'Enter your name.' : (!phone && !email) ? 'Add a phone number or an email.' : (phone && !/^[+\d][\d\s\-()]{6,}$/.test(phone)) ? 'Enter a valid phone number.' : (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) ? 'Enter a valid email.' : !$g('#g-consent').checked ? 'Please accept the privacy policy.' : !v.eventType ? 'Choose your event first.' : '';
      if (problem){ err.textContent = problem; $g('#g-send-form').classList.remove('shake'); void err.offsetWidth; $g('#g-send-form').classList.add('shake'); haptic([6,30,6]); return; }
      err.textContent = ''; const btn = $g('#g-send'); btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Sending your design';
      if (g.studio) g.studio.overview();
      await new Promise(r => setTimeout(r, 400));
      try {
        const r = await hooks.submit(v, { studio:g.studio, honeypot:$g('#g-hp').value, elapsed:Date.now() - g.t0, copyToMe:!!($g('#g-copy') && $g('#g-copy').checked) });
        v._sentAt = new Date().toISOString(); v._ref = r.ref; save();
        celebrate(r);
      } catch(x){ btn.disabled = false; btn.innerHTML = `${icon('send','sm')}Send my event design`; err.innerHTML = esc(x.message) + (x.whatsapp ? ` <a href="${x.whatsapp}" target="_blank" rel="noopener noreferrer">Send it on WhatsApp instead</a>` : ''); }
    });
    function celebrate(r){
      const fx = $g('#g-fx'); for (let i=0;i<90;i++){ const p = document.createElement('i'); p.className = 'cf'; p.style.cssText = `left:${Math.random()*100}vw;--d:${1.6 + Math.random()*1.6}s;--r:${Math.random()*720}deg;--c:${['#E7CE96','#FFFFFF','#F2D3CC','#C8A96B','#AFCBE3'][i%5]};animation-delay:${Math.random()*.6}s`; fx.appendChild(p); setTimeout(() => p.remove(), 4200); }
      haptic([20, 60, 20, 60, 40]); paintHUD(); $g('#g-cat-title').textContent = 'Sent'; $g('#g-tabs').innerHTML = ''; if (g.collapsed) collapse(false);
      const gb = $g('#g-body'); gb.scrollTop = 0; gb.innerHTML = `<div class="g-done"><span class="g-medal big">${icon('check')}</span><h3>Your design is with us</h3><p>Reference <b>${esc(r.ref)}</b>. ${r.local ? 'Tap below to send it to us on WhatsApp.' : 'Our team will contact you to arrange everything.'}</p>
        ${r.shot ? `<img class="g-shot" src="${r.shot}" alt="Your event design">` : ''}
        ${r.shareUrl ? `<div class="g-link"><input class="g-input" readonly value="${esc(r.shareUrl)}" aria-label="Link to your design"><button type="button" class="g-cta ghost" data-copylink="${esc(r.shareUrl)}">${icon('copy','sm')}Copy</button></div>` : ''}
        <div class="g-exp"><button type="button" data-g="print">${icon('file','sm')}PDF</button><button type="button" data-g="4k">${icon('image','sm')}Images</button><button type="button" data-ig>${icon('instagram','sm')}Instagram</button><a href="mailto:${CONFIG.email}?subject=${encodeURIComponent('My event plan ' + r.ref)}&body=${encodeURIComponent('Hello MA3AK,\n\nHere is my event plan (' + r.ref + ').' + (r.shareUrl ? '\nView it here: ' + r.shareUrl : ''))}">${icon('mail','sm')}Email</a></div>
        <div class="g-inline g-done-actions">${r.local ? `<a class="g-cta" href="${r.wa}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}Send on WhatsApp</a>` : `<a class="g-cta ghost" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi MA3AK, about my event design ' + r.ref)}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}Message us on WhatsApp</a>`}<a class="g-cta ghost" href="#/">Back to home</a></div></div>`;
    }

    // keyboard: number keys switch categories on desktop
    root.addEventListener('keydown', e => { if (e.target.matches('input,textarea')) return; const n = parseInt(e.key, 10); if (n >= 1 && n <= 9){ g.cat = CATS[n - 1].id; paint(true); } });

    root.addEventListener('click', async e => {
      const c = e.target.closest('[data-copylink]'); if (c){ try { await navigator.clipboard.writeText(c.dataset.copylink); toast('Link copied'); } catch(x){ toast('Copy isn’t available here', 'alert'); } }
      if (e.target.closest('[data-ig]')){ const shot_ = g.studio ? g.studio.capture() : null; // Instagram has no web posting API: use the phone's share sheet with the image
        try { const blob = await (await fetch(shot_)).blob(), file = new File([blob], 'ma3ak-event.jpg', { type:'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files:[file] })){ await navigator.share({ files:[file], title:'My MA3AK event', text:'Designed with @ma3akevents' }); return; } } catch(x){}
        openModal({ title:'Share on Instagram', body:`<p class="muted small">Save this picture (press and hold, or right-click), then post it on Instagram and tag <b>${CONFIG.instagramHandle}</b>.</p>${shot_ ? `<img src="${shot_}" alt="Your design" style="width:100%;border-radius:12px;margin-top:1rem">` : ''}<a class="btn btn-primary" style="margin-top:1rem" href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer">${icon('instagram','sm')}Open Instagram</a>` }); }
    });
    root.addEventListener('keydown', e => { if (e.target.matches('input,textarea')) return; const z = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'; if (z && !e.shiftKey){ e.preventDefault(); undo(); } else if ((z && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')){ e.preventDefault(); redo(); } });
    g.t0 = Date.now();
    if (g.studio) $g('#studio').addEventListener('pointerdown', () => { if (!g.collapsed && matchMedia('(max-width: 1023px)').matches && g.studio.sel == null) {} });
    paint(true);
    // first visit: guide to the event picker
    if (!v.eventType) setTimeout(() => banner('Welcome to your event studio', 'Pick what you’re celebrating to begin', 'sparkle'), 700);
    return g;
  }
  return { create, CARDS, CATS, ACH };
})();

/* Page: full-screen game route.
   #/customize      → works without an account (saved on this device)
   #/studio/:id     → a saved event: autosaves to the account, version history, sharing */
const GameStudio = {
  title:'Event Studio | Ma3ak', game:true,
  render(){ return `<div class="game" id="game" role="application" aria-label="MA3AK event studio"></div>`; },
  async mount(root, params){
    const id = params && params[0], server = typeof apiU === 'function';
    let catalog = null, favorites = [];
    if (server){ try { catalog = (await (await fetch('/api/catalog')).json()).items; } catch(e){} await AUTH.ready; if (AUTH.user) try { favorites = (await apiU('GET','/api/favorites')).items; } catch(e){} }
    let ev = null, state = null, role = 'owner';
    if (id){
      if (!server || !AUTH.user){ sessionStorage.setItem('ma3ak:next', location.hash); location.hash = '#/login'; return; }
      try { const r = await apiU('GET', `/api/events/${id}`); ev = r.event; state = r.state; role = r.role; if (!state.eventName && ev.name !== 'My event') state.eventName = ev.name; }
      catch(err){ $('#game', root).innerHTML = `<div class="g-err-page"><h1 class="h2">${esc(err.message)}</h1><a class="btn btn-light" href="#/dashboard">Back to my events</a></div>`; return; }
    }
    // autosave to the server (debounced); falls back gracefully when offline
    let t = null, inflight = false, pending = null, game = null;
    const flush = async () => {
      if (inflight){ pending = true; return; } inflight = true; pending = false; game.setSave('saving');
      const v = game.v, label = game.lastLabel || 'Edit';
      try { const r = await apiU('PUT', `/api/events/${ev.id}`, { rev:ev.rev, name:v.eventName || (v.eventType ? evName(v.eventType) : ev.name), state:v, progress:+($('#g-pct') || {}).textContent || 0, label });
        ev.rev = r.rev; game.setSave('saved'); }
      catch(err){
        if (err.code === 'conflict') openModal({ title:'Changed on another device', body:`<p class="muted">This event was edited somewhere else. Load the latest version, or keep yours and overwrite it.</p><div class="chip-row" style="margin-top:1.25rem"><button class="btn btn-primary" id="cf-load">Load latest</button><button class="btn btn-ghost" id="cf-keep">Keep mine</button></div>`, onMount(m){ $('#cf-load', m).onclick = () => { closeModal(); location.reload(); }; $('#cf-keep', m).onclick = async () => { closeModal(); ev.rev = err.data.rev; flush(); }; } });
        else { game.setSave(err.offline ? 'offline' : 'error'); setTimeout(() => schedule(), 8000); }
      }
      inflight = false; if (pending) schedule();
    };
    const schedule = () => { clearTimeout(t); t = setTimeout(flush, 1200); };
    const readOnly = id && role === 'viewer';
    const hooks = {
      state, eventId:ev && ev.id, role, catalog, favorites, exitHref: server && AUTH.user ? '#/dashboard' : '#/',
      persist: id ? (v, label) => { if (readOnly) return; game && (game.lastLabel = label); if (game) game.setSave('saving'); schedule(); } : (v) => { czSave(v); if (game) game.setSave('local'); },
      onFav: server && AUTH.user ? (itemId, on) => apiU(on ? 'PUT' : 'DELETE', `/api/favorites/${itemId}`).catch(() => {}) : null,
      share: id && role === 'owner' ? () => shareDialog(ev) : null,
      history: id ? () => historyDialog(ev, game) : null,
      submit: async (v, o) => {
        const shot = o.studio ? o.studio.capture() : null; let venue = null; if (v._photo){ try { venue = localStorage.getItem('ma3ak:photo'); } catch(e){} }
        const text = czText(v).replace(/^MA3AK EVENT REQUEST \S+\n\n/, '');
        const fav = (v._fav || []).map(fid => Object.values(GAME.CARDS).flat().find(c => c.id === fid)).filter(Boolean).map(c => c.label);
        const prov = (v.vendors || []).map(id => (VENDORS.find(x => x.id === id) || {}).name).filter(Boolean);
        const fullText = text + (fav.length ? `\n\n— FAVORITES —\n• ${fav.join(', ')}` : '') + (prov.length ? `\n\n— CHOSEN PROVIDERS —\n• ${prov.join('\n• ')}` : '');
        if (typeof apiPost === 'function'){
          const choices = Object.fromEntries(Object.entries(v).filter(([k]) => !['_step','_ref','_sentAt','_prefilled','_ach','_seen','_cat','fullName','phone','email'].includes(k)));
          try { if (id) await flush(); const r = await apiPost('/api/requests', { contact:{ fullName:v.fullName, phone:v.phone || '', email:v.email || '' }, choices, design:ST.describe(v), text:fullText, images:{ design:shot ? await shrinkImage(shot) : undefined, venue:venue ? await shrinkImage(venue, 2048, .85) : undefined }, consent:true, elapsed:o.elapsed, company_site:o.honeypot, eventId:ev && ev.id, copyToMe:o.copyToMe });
            if (typeof TRACK === 'function') TRACK('quote_requested', { type:v.eventType || '' }); return { ref:r.ref, shot, shareUrl:r.shareUrl }; }
          catch(err){ throw Object.assign(err, { whatsapp: err.offline || (err.status||0) >= 500 ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(fullText)}` : null }); }
        }
        const ref = czRef(v), wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`MA3AK EVENT REQUEST ${ref}\n\n` + fullText)}`;
        return { ref, shot, local:true, wa };
      }
    };
    game = GAME.create($('#game', root), hooks);
    game.setSave(id ? (readOnly ? '' : 'saved') : 'local');
    if (readOnly) toast('You can view this event. Ask the owner for an edit link to make changes.', 'eye');
    if (!id && server && AUTH.user && game.v.eventType && !game.v._imported) setTimeout(() => toast('Tip: open “My events” to save this design to your account', 'info'), 2500);
  }
};
function shareDialog(ev){
  openModal({ title:'Share your event', body:`<p class="muted small" style="margin:-.5rem 0 1rem">Anyone with the link can open it. Links expire after 30 days; you can turn them off at any time.</p>
    <div class="chip-row"><button class="btn btn-primary btn-sm" data-mk="view">${icon('eye','sm')}View-only link</button><button class="btn btn-ghost btn-sm" data-mk="edit">${icon('users','sm')}Collaboration link</button></div><div id="sh-new" style="margin-top:1rem"></div><h3 class="h3" style="margin-top:1.5rem">Active links</h3><div id="sh-list" class="small muted">Loading…</div>`,
    async onMount(m){
      const list = async () => { const r = await apiU('GET', `/api/events/${ev.id}/shares`); $('#sh-list', m).innerHTML = (r.shares.filter(x => !x.revoked).map(x => `<div class="sh-row"><span>${x.permission === 'edit' ? 'Collaboration' : 'View only'} · ${x.views} views · until ${fmtDate(x.expires_at.slice(0,10), { day:'numeric', month:'short' })}</span><button class="link" data-rv="${x.id}">Turn off</button></div>`).join('') || 'No active links.') + (r.members.length ? `<p style="margin-top:.8rem">People with access: ${r.members.map(p => esc(p.name) + (p.role === 'editor' ? ' (can edit)' : '')).join(', ')}</p>` : ''); };
      list();
      m.addEventListener('click', async e => {
        const b = e.target.closest('[data-mk]'); if (b){ const r = await apiU('POST', `/api/events/${ev.id}/shares`, { permission:b.dataset.mk });
          $('#sh-new', m).innerHTML = `<div class="g-link light"><input class="input" readonly value="${esc(r.share.url)}" aria-label="Share link"><button class="btn btn-primary btn-sm" data-cp="${esc(r.share.url)}">${icon('copy','sm')}Copy</button></div><div class="chip-row" style="margin-top:.6rem"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=${encodeURIComponent('Take a look at my event design: ' + r.share.url)}">${icon('message','sm')}WhatsApp</a><a class="btn btn-ghost btn-sm" href="mailto:?subject=${encodeURIComponent('My event design')}&body=${encodeURIComponent(r.share.url)}">${icon('mail','sm')}Email</a></div>`; list(); }
        const c = e.target.closest('[data-cp]'); if (c){ try { await navigator.clipboard.writeText(c.dataset.cp); toast('Link copied'); } catch(x){} }
        const rv = e.target.closest('[data-rv]'); if (rv){ await apiU('DELETE', `/api/events/${ev.id}/shares/${rv.dataset.rv}`); toast('Link turned off'); list(); }
      });
    } });
}
function historyDialog(ev, game){
  openModal({ title:'Version history', body:`<p class="muted small" style="margin:-.5rem 0 1rem">MA3AK keeps a snapshot every few minutes while you design. Restoring is safe: your current design is saved first.</p><div id="vh" class="small muted">Loading…</div>`,
    async onMount(m){
      const r = await apiU('GET', `/api/events/${ev.id}/versions`); let day = '';
      $('#vh', m).innerHTML = r.versions.length ? r.versions.map(x => { const d = new Date(x.created_at), dd = d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short' }); const head = dd !== day ? `<h4 class="vh-d">${dd === new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short' }) ? 'Today' : dd}</h4>` : ''; day = dd;
        return `${head}<div class="sh-row"><span><b>${d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}</b> ${esc(x.label)}</span><button class="link" data-rs="${x.id}">Restore</button></div>`; }).join('') : 'No versions yet.';
      m.addEventListener('click', async e => { const b = e.target.closest('[data-rs]'); if (!b) return; const res = await apiU('POST', `/api/events/${ev.id}/versions/${b.dataset.rs}/restore`); ev.rev = res.event.rev; closeModal(); toast('Version restored'); setTimeout(() => location.reload(), 400); });
    } });
}

/* ---- account.js ---- */
/* =========================================================
   ACCOUNTS, DASHBOARD, SHARING, ANALYTICS (client side)
   Talks only to the MA3AK server. No secrets live here.
   ========================================================= */
const AUTH = { user:null, csrf:'', ready:null, cfg:{ google:false, email:false } };
async function apiU(method, path, body){
  let r; try { r = await fetch(path, { method, credentials:'same-origin', headers:{ 'Content-Type':'application/json', ...(AUTH.csrf && method !== 'GET' ? { 'X-CSRF-Token':AUTH.csrf } : {}) }, body:body ? JSON.stringify(body) : undefined }); }
  catch(e){ throw Object.assign(new Error('You seem to be offline.'), { offline:true }); }
  const j = await r.json().catch(() => ({}));
  if (j.csrf) AUTH.csrf = j.csrf;
  if (!r.ok || j.ok === false) throw Object.assign(new Error(j.error || 'Something went wrong.'), { status:r.status, fields:j.fields || {}, code:j.code, data:j });
  return j;
}
function loadMe(){ AUTH.ready = Promise.all([apiU('GET','/api/me').catch(() => ({ user:null })), fetch('/api/auth/config').then(r => r.json()).catch(() => ({}))]).then(([m, c]) => { AUTH.user = m.user; AUTH.cfg = { google:!!c.google, email:!!c.email }; paintAccountBtn(); return AUTH.user; }); return AUTH.ready; }
function paintAccountBtn(){ const b = $('#acct-btn'); if (!b) return; const u = AUTH.user; b.href = u ? '#/dashboard' : '#/login'; b.innerHTML = u ? `<span class="acct-av">${esc((u.name || u.email)[0].toUpperCase())}</span><span class="acct-l">My events</span>` : `${icon('users','sm')}<span class="acct-l">Sign in</span>`; b.setAttribute('aria-label', u ? 'My events' : 'Sign in'); }

/* ---------- analytics (first-party, no cookies) ---------- */
const TRACK = (() => {
  let q = [], anon = null; try { anon = localStorage.getItem('ma3ak:anon'); if (!anon){ anon = Math.random().toString(36).slice(2, 14); localStorage.setItem('ma3ak:anon', anon); } } catch(e){}
  const flush = beacon => { if (!q.length) return; const body = JSON.stringify({ anon, events:q.splice(0, 30) }); if (beacon && navigator.sendBeacon) navigator.sendBeacon('/api/t', new Blob([body], { type:'application/json' })); else fetch('/api/t', { method:'POST', headers:{ 'Content-Type':'application/json' }, body, credentials:'same-origin', keepalive:true }).catch(() => {}); };
  setInterval(() => flush(false), 6000); addEventListener('pagehide', () => flush(true));
  return (name, props) => { q.push({ name, props }); if (q.length > 20) flush(false); };
})();
addEventListener('hashchange', () => TRACK('page_view', { path:location.hash.split('?')[0].replace(/\/[0-9a-f-]{20,}|\/s\/.+/, '/:id') }));
document.addEventListener('click', e => { if (e.target.closest('a[href^="https://wa.me"],a[href^="mailto:"],a[href*="instagram.com"]')) TRACK('contact_clicked', { channel:/wa\.me/.test(e.target.closest('a').href) ? 'whatsapp' : /mailto/.test(e.target.closest('a').href) ? 'email' : 'instagram' }); });

/* ---------- auth pages ---------- */
const authShell = (title, sub, inner) => `<section class="auth"><div class="auth-card"><a class="auth-logo" href="#/">${Logo({ tag:'span', label:false })}</a><h1 class="h2">${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}${inner}</div><div class="auth-art" aria-hidden="true"><div class="auth-art-in" id="auth-art"></div><p>Design your event in 3D, save it, share it, and send it to us when you’re ready.</p></div></section>`;
const field = (id, label, type='text', ac='', extra='') => `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" name="${id}" type="${type}" ${ac ? `autocomplete="${ac}"` : ''} ${extra}><span class="err" id="${id}-err" role="alert"></span></div>`;
const googleBtn = () => AUTH.cfg.google ? `<a class="btn btn-ghost btn-block" href="/auth/google">${icon('globe','sm')}Continue with Google</a><p class="divider-text">or</p>` : '';
function authArt(root){ const el = $('#auth-art', root); if (!el) return; const k = 'wedding'; if (typeof snapCache !== 'undefined' && has3D()) setTimeout(() => { try { snapCache[k] = snapCache[k] || GL3D.snapshot(S3.SCENES[k], 900, 1100); el.style.backgroundImage = `url(${snapCache[k]})`; el.classList.add('ready'); } catch(e){} }, 60); }
function formErr(f, err){ Object.entries(err.fields || {}).forEach(([k, m]) => { const el = f.elements[k] || f.elements['a-' + k]; if (!el) return; el.closest('.field')?.classList.add('invalid'); const e = $('#' + el.id + '-err', f); if (e) e.textContent = m; }); const g = $('.auth-err', f); if (g) g.textContent = err.message; }
const afterLogin = () => { const next = sessionStorage.getItem('ma3ak:next'); sessionStorage.removeItem('ma3ak:next'); location.hash = next || '#/dashboard'; };

const Login = { title:'Sign in | Ma3ak',
  render(p, q){ return authShell('Welcome back', 'Sign in to continue designing your events.', `${googleBtn()}<form class="form" id="login-form" novalidate>${field('email','Email','email','email')}${field('password','Password','password','current-password')}<p class="auth-err err" role="alert" style="display:block"></p><button class="btn btn-primary btn-block" type="submit">Sign in</button></form>
    <p class="small muted auth-links"><a class="link" href="#/forgot">Forgot your password?</a><span>New here? <a class="link" href="#/register">Create an account</a></span></p>${q.get('google') === 'failed' ? `<p class="notice">${icon('alert')}Google sign-in didn’t work. Please try again.</p>` : ''}`); },
  mount(root){ authArt(root); const f = $('#login-form', root); f.addEventListener('submit', async e => { e.preventDefault(); const b = $('[type=submit]', f); busy(b, true, 'Signing in'); try { const r = await apiU('POST','/api/auth/login', { email:f.elements.email.value, password:f.elements.password.value }); AUTH.user = r.user; paintAccountBtn(); afterLogin(); } catch(err){ busy(b, false); formErr(f, err); } }); } };
const Register = { title:'Create your account | Ma3ak',
  render(){ return authShell('Create your free account', 'Save your designs, come back any time, and share them.', `${googleBtn()}<form class="form" id="reg-form" novalidate>${field('name','Your name','text','name')}${field('email','Email','email','email')}${field('password','Password','password','new-password','minlength="12"')}<p class="hint">At least 12 characters, with letters and numbers.</p>${HONEYPOT}
    <label class="check"><input type="checkbox" id="consent"> I agree to the <a class="link" href="#/privacy" target="_blank">Privacy Policy</a> and <a class="link" href="#/terms" target="_blank">Terms</a>.</label><label class="check"><input type="checkbox" id="marketing"> Send me occasional ideas and offers (optional).</label>
    <p class="auth-err err" role="alert" style="display:block"></p><button class="btn btn-primary btn-block" type="submit">Create account</button></form><p class="small muted auth-links"><span>Already have an account? <a class="link" href="#/login">Sign in</a></span></p>`); },
  mount(root){ authArt(root); const f = $('#reg-form', root); f.addEventListener('submit', async e => { e.preventDefault(); const b = $('[type=submit]', f); if (!$('#consent', f).checked){ $('.auth-err', f).textContent = 'Please accept the privacy policy.'; return; } busy(b, true, 'Creating account');
    try { const r = await apiU('POST','/api/auth/register', { name:f.elements.name.value, email:f.elements.email.value, password:f.elements.password.value, consent:true, marketing:$('#marketing', f).checked, company_site:f.elements.company_site.value });
      AUTH.user = r.user; paintAccountBtn(); await importLocalDraft(); toast(r.verificationSent ? 'Account created. Check your email to confirm it.' : 'Account created'); afterLogin(); } catch(err){ busy(b, false); formErr(f, err); } }); } };
const Forgot = { title:'Reset password | Ma3ak',
  render(){ return authShell('Reset your password', 'We’ll email you a link to choose a new one.', `<form class="form" id="fg-form" novalidate>${field('email','Email','email','email')}<p class="auth-err err" role="alert" style="display:block"></p><button class="btn btn-primary btn-block" type="submit">Send reset link</button></form><p class="small muted auth-links"><a class="link" href="#/login">Back to sign in</a></p>`); },
  mount(root){ authArt(root); const f = $('#fg-form', root); f.addEventListener('submit', async e => { e.preventDefault(); const b = $('[type=submit]', f); busy(b, true); try { await apiU('POST','/api/auth/forgot', { email:f.elements.email.value }); f.outerHTML = `<p class="notice">${icon('mail')}If an account uses that email, a reset link is on its way. It works for one hour.</p>`; } catch(err){ busy(b, false); formErr(f, err); } }); } };
const Reset = { title:'Choose a new password | Ma3ak',
  render(){ return authShell('Choose a new password', '', `<form class="form" id="rs-form" novalidate>${field('password','New password','password','new-password')}<p class="auth-err err" role="alert" style="display:block"></p><button class="btn btn-primary btn-block" type="submit">Save password</button></form>`); },
  mount(root, p, q){ authArt(root); const f = $('#rs-form', root); f.addEventListener('submit', async e => { e.preventDefault(); try { await apiU('POST','/api/auth/reset', { token:q.get('token'), password:f.elements.password.value }); toast('Password saved. Please sign in.'); location.hash = '#/login'; } catch(err){ formErr(f, err); } }); } };
const Verify = { title:'Confirm email | Ma3ak',
  render(){ return authShell('Confirming your email…', '', `<p id="vf-msg" class="muted">One moment.</p>`); },
  async mount(root, p, q){ authArt(root); try { await apiU('POST','/api/auth/verify', { token:q.get('token') }); $('#vf-msg', root).innerHTML = `Your email is confirmed. <a class="link" href="#/dashboard">Go to your events</a>`; if (AUTH.user) AUTH.user.verified = true; } catch(err){ $('#vf-msg', root).textContent = err.message; } } };

/* ---------- dashboard ---------- */
const needAuth = () => { if (AUTH.user) return false; sessionStorage.setItem('ma3ak:next', location.hash); location.hash = '#/login'; return true; };
async function createEvent(state){ const r = await apiU('POST','/api/events', { name:(state && (state.eventName || (state.eventType && evName(state.eventType)))) || 'My event', state:state || {}, progress:0 }); return r.event; }
async function importLocalDraft(){ try { const d = store.get('custom'); if (d && d.eventType && !d._imported){ const e = await createEvent(d); d._imported = e.id; store.set('custom', d); } } catch(e){} }
const pct = n => `<span class="ring-sm" style="--p:${n}"><b>${n}%</b></span>`;
// The dashboard (plans, quotes, favourites) is PlansDashboard in market.js.
const GAME_RAR = { c:['Classic'], r:['Rare'], e:['Epic'], l:['Legendary'] };

/* ---------- account settings ---------- */
const AccountPage = { title:'Account | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap" style="max-width:720px"><nav class="crumbs"><a href="#/dashboard">My events</a><span>/</span><span>Account</span></nav><h1 class="h1">Account</h1><div id="acct"></div></div></section>`; },
  async mount(root){ await AUTH.ready; if (needAuth()) return; const u = AUTH.user, box = $('#acct', root);
    box.innerHTML = `<form class="panel form" id="pf" novalidate style="margin-top:1.5rem"><h2 class="h3">Profile</h2><div class="form-row">${field('name','Name','text','name',`value="${esc(u.name)}"`)}${field('phone','Phone','tel','tel',`value="${esc(u.phone || '')}"`)}</div><p class="small muted">${esc(u.email)} ${u.verified ? '' : '(not confirmed yet)'}. Plan: ${esc(u.limits.name)} (${u.limits.maxEvents} events).</p><div><button class="btn btn-primary" type="submit">Save profile</button></div></form>
      <form class="panel form" id="pw" novalidate style="margin-top:1rem"><h2 class="h3">Password</h2><div class="form-row">${field('current','Current password','password','current-password')}${field('next','New password','password','new-password')}</div><div><button class="btn btn-ghost" type="submit">Change password</button></div></form>
      <div class="panel" style="margin-top:1rem"><h2 class="h3">Sign out</h2><p class="small muted" style="margin:.4rem 0 1rem">Sign out on this device.</p><button class="btn btn-ghost" id="so">Sign out</button></div>
      <form class="panel form danger-zone" id="del" novalidate style="margin-top:1rem"><h2 class="h3">Delete account</h2><p class="small muted">Permanently deletes your account, events, history, shares, favorites and chats. This can’t be undone.</p>${field('password','Your password','password','current-password')}<div><button class="btn btn-ghost" type="submit" style="color:var(--danger);border-color:var(--danger)">Delete my account</button></div></form>`;
    $('#pf', box).addEventListener('submit', async e => { e.preventDefault(); try { const r = await apiU('PATCH','/api/me', { name:e.target.elements.name.value, phone:e.target.elements.phone.value }); AUTH.user = { ...AUTH.user, ...r.user }; toast('Profile saved'); } catch(err){ formErr(e.target, err); toast(esc(err.message), 'alert'); } });
    $('#pw', box).addEventListener('submit', async e => { e.preventDefault(); try { await apiU('POST','/api/me/password', { current:e.target.elements.current.value, next:e.target.elements.next.value }); e.target.reset(); toast('Password changed'); } catch(err){ formErr(e.target, err); toast(esc(err.message), 'alert'); } });
    $('#so', box).addEventListener('click', async () => { try { await apiU('POST','/api/auth/logout'); } catch(e){} AUTH.user = null; AUTH.csrf = ''; paintAccountBtn(); location.hash = '#/'; });
    $('#del', box).addEventListener('submit', async e => { e.preventDefault(); try { await apiU('DELETE','/api/me', { password:e.target.elements.password.value }); AUTH.user = null; paintAccountBtn(); try { localStorage.removeItem('ma3ak:v1'); localStorage.removeItem('ma3ak:photo'); } catch(x){} toast('Your account was deleted'); location.hash = '#/'; } catch(err){ formErr(e.target, err); toast(esc(err.message), 'alert'); } });
  } };

/* ---------- shared event presentation ---------- */
const SharedEvent = { title:'Shared plan | Ma3ak',
  render(){ return `<div id="share-root"><section class="page-hero"><div class="wrap"><p class="muted">Loading…</p></div></section></div>`; },
  async mount(root, [tk]){
    const box = $('#share-root', root);
    let d; try { d = await apiU('GET', `/api/share/${encodeURIComponent(tk)}`); } catch(err){ box.innerHTML = `<section class="section"><div class="wrap">${EmptyState({ iconName:'lock', level:'h1', title:esc(err.message), text:'Ask the person who shared it for a new link.', actions:'<a class="btn btn-primary" href="#/">Go to MA3AK</a>' })}</div></section>`; return; }
    const e = d.event, s = d.state || {}, plan = d.plan || { services:[], totals:{} }; document.title = `${e.name} | Ma3ak`;
    const hasDesign = Object.keys(s).some(k => !k.startsWith('_') || k === '_add');
    const planHtml = plan.services.length ? `<section class="panel" style="margin-top:1.5rem"><div class="tile-h"><h2 class="h3">Budget plan</h2><span class="small muted">Estimated total <b>${rangeTxt(plan.totals.low || 0, plan.totals.high || 0)}</b>${plan.totals.budget ? ` · budget ${money(plan.totals.budget)}` : ''}</span></div>
      ${plan.services.map(l => `<div class="pl-line"><div class="pl-info"><b>${esc(l.label)}</b><small>${esc(catName(l.category) || '')}${l.vendorName ? ` · ${esc(l.vendorName)}` : ''}${l.isDemo ? ' <span class="tag demo-tag">Demo</span>' : ''}</small><small class="muted">${esc(priceTxt(l.unitPrice, l.priceMax, l.unit))}</small></div><div class="pl-qty small">${l.unit === 'flat' ? '' : `× ${l.qty}`}</div><div class="pl-total">${l.lineLow == null ? '<span class="tag">Quote needed</span>' : `<b>${rangeTxt(l.lineLow, l.lineHigh)}</b>`}</div></div>`).join('')}
      <p class="tiny muted" style="margin-top:1rem">Prices are estimates from providers’ listed packages. Final prices and availability are confirmed by each provider.</p></section>` : '';
    box.innerHTML = `<section class="page-hero"><div class="wrap" style="max-width:980px"><p class="small muted">${esc(evName(e.event_type) || 'Event')} plan${e.owner ? ` shared by ${esc(e.owner)}` : ''}</p><h1 class="h1">${esc(e.name)}</h1>
      <div class="sv-facts" style="margin-top:.8rem">${e.event_date ? `<span>${icon('calendar','sm')}${fmtDate(e.event_date)}</span>` : ''}${e.guest_count ? `<span>${icon('users','sm')}${e.guest_count} guests</span>` : ''}${e.location ? `<span>${icon('pin','sm')}${esc(locName(e.location))}</span>` : e.venue ? `<span>${icon('pin','sm')}${esc(e.venue.split(' /')[0])}</span>` : ''}${e.style ? `<span>${icon('palette','sm')}${esc(e.style)}</span>` : ''}</div>
      ${hasDesign && has3D() ? `<div class="share-3d" id="sv-stage"></div>` : ''}${planHtml}
      ${!planHtml && !hasDesign ? '<p class="muted" style="margin-top:1.5rem">Nothing has been added to this plan yet.</p>' : ''}
      <div class="chip-row" style="margin-top:1.5rem">${d.permission === 'edit' ? `<button class="btn btn-primary btn-sm" id="sv-join">${icon('brush','sm')}Open and edit</button>` : ''}<a class="btn btn-ghost btn-sm" href="#/plan">Plan your own event</a></div></div></section>`;
    if (hasDesign && has3D()){ const st = $('#sv-stage', box); st.innerHTML = ST.markup(); try { const studio = new ST.Studio($('#studio', st), { onChange(){} }); studio.sync(s); studio.cam.auto = true; studio.loop(); } catch(x){} }
    const j = $('#sv-join', box); if (j) j.onclick = async () => { await AUTH.ready; if (needAuth()) return; try { const r = await apiU('POST', `/api/share/${encodeURIComponent(tk)}/join`); location.hash = `#/planner/${r.id}`; } catch(err){ toast(esc(err.message), 'alert'); } };
  } };

/* ---------- printable summary (Save as PDF from the browser's print dialog) ---------- */
function printSummary(v, shot, title){
  const d = ST.describe(v), rows = CZ_SECTIONS.flatMap(s => s.fields.filter(f => (!f.showIf || f.showIf(v)) && czHas(v[f.id]) && !['fullName','phone','email'].includes(f.id)).map(f => [s.title, f.label, czFmt(f, v[f.id])]));
  const w = document.createElement('div'); w.className = 'print-sheet'; w.innerHTML = `<header><div class="print-logo">${Logo({ tag:'span', label:false })}</div><h1>${esc(title || v.eventName || evName(v.eventType) || 'Event plan')}</h1><p>${[v.date ? fmtDate(v.date) : '', v.guests ? `${v.guests} guests` : '', d.venue].filter(Boolean).map(esc).join('  ·  ')}</p></header>
    ${shot ? `<img src="${shot}" alt="Event design">` : ''}<h2>In the design</h2><p>${esc(d.items.join(', ') || 'No items yet')}</p>
    <table>${rows.map(([s, l, val], i) => `${i === 0 || rows[i-1][0] !== s ? `<tr><th colspan="2">${esc(s)}</th></tr>` : ''}<tr><td>${esc(l)}</td><td>${esc(val)}</td></tr>`).join('')}</table>
    <footer>MA3AK · ${esc(CONFIG.email)} · ${esc(CONFIG.phone)} · Created ${fmtDate(new Date())}</footer>`;
  document.body.appendChild(w); document.body.classList.add('printing'); setTimeout(() => { window.print(); setTimeout(() => { w.remove(); document.body.classList.remove('printing'); }, 500); }, 300);
}
loadMe();

/* ---------- live vendor marketplace (admin-managed, consented listings only) ---------- */
VENDORS_READY = fetch('/api/vendors', { credentials:'same-origin' }).then(r => r.json()).then(j => { (j.vendors || []).forEach(v => VENDORS.push(v)); }).catch(() => {});
// Adding a provider now adds one of their packages to a budget plan: see addToPlanFlow in market.js.

/* ---------- public invitation page: guests open the link and reply ---------- */
const InvitePage = { title:'You’re invited | Ma3ak', game:true,
  render(){ return `<div class="inv-page" id="inv"><p class="inv-load">One moment…</p></div>`; },
  async mount(root, [tk]){
    const box = $('#inv', root); let d;
    try { d = (await apiU('GET', `/api/invite/${encodeURIComponent(tk)}`)).invitation; } catch(err){ box.innerHTML = `<div class="inv-card"><div class="inv-body"><h1>${esc(err.message)}</h1><p>Ask the hosts for a new link.</p></div></div>`; return; }
    document.title = `${d.title} | Ma3ak`; const c1 = (d.theme || [])[0] || '#C8A96B', c2 = (d.theme || [])[1] || '#F4EFE6', open = d.rsvpOpen && (!d.rsvpBy || d.rsvpBy >= todayISO());
    box.style.setProperty('--c1', c1); box.style.setProperty('--c2', c2);
    box.innerHTML = `<article class="inv-card">${d.cover ? `<div class="inv-cover"><img src="${d.cover}" alt="The event design"></div>` : ''}<div class="inv-body">
      <p class="inv-host">${esc(d.host || 'You’re invited')}</p><h1>${esc(d.title)}</h1><div class="inv-line"></div>
      <div class="inv-facts">${d.date ? `<div>${icon('calendar','sm')}<span>${fmtDate(d.date, { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</span></div>` : ''}${d.time ? `<div>${icon('clock','sm')}<span>${esc(d.time)}</span></div>` : ''}${d.location ? `<div>${icon('pin','sm')}<span>${esc(d.location)}</span></div>` : ''}${d.dressCode ? `<div>${icon('sparkle','sm')}<span>${esc(d.dressCode)}</span></div>` : ''}</div>
      ${d.message ? `<p class="inv-msg">${esc(d.message)}</p>` : ''}
      ${open ? `<form class="inv-form" id="rsvp" novalidate><h2>Will you join us?</h2>${d.rsvpBy ? `<p class="inv-by">Please reply by ${fmtDate(d.rsvpBy, { day:'numeric', month:'long' })}</p>` : ''}
        <div class="inv-yn" role="radiogroup" aria-label="Your answer"><button type="button" role="radio" aria-checked="false" data-yn="1">${icon('check','sm')}Joyfully accept</button><button type="button" role="radio" aria-checked="false" data-yn="0">Regretfully decline</button></div>
        <label>Your name<input class="input" name="name" autocomplete="name" required maxlength="120"></label><label>Phone (optional)<input class="input" name="phone" type="tel" autocomplete="tel" maxlength="30"></label>
        <div class="inv-more"><label class="check"><input type="checkbox" name="plusOne"> I’m bringing a plus-one</label><label>Dietary needs (optional)<input class="input" name="dietary" maxlength="120" placeholder="e.g. vegetarian, allergies"></label></div>
        <label>A note for the hosts (optional)<textarea class="textarea" name="message" rows="2" maxlength="500"></textarea></label>${HONEYPOT}
        <p class="err" id="rsvp-err" role="alert"></p><button class="btn btn-primary btn-block" type="submit">Send my reply</button></form>` : `<p class="inv-closed">Replies are closed. Contact the hosts directly.</p>`}
      <p class="inv-foot">Designed with <a href="#/">MA3AK</a></p></div></article>`;
    const f = $('#rsvp', box); if (!f) return; stampForm(f); let yn = null;
    f.addEventListener('click', e => { const b = e.target.closest('[data-yn]'); if (!b) return; yn = b.dataset.yn === '1'; $$('[data-yn]', f).forEach(x => x.setAttribute('aria-checked', x === b)); f.classList.toggle('no', !yn); });
    f.addEventListener('submit', async e => { e.preventDefault(); const err = $('#rsvp-err', f); if (yn === null){ err.textContent = 'Choose accept or decline.'; return; } if (!f.elements.name.value.trim()){ err.textContent = 'Enter your name.'; f.elements.name.focus(); return; }
      const b = $('[type=submit]', f); busy(b, true);
      try { await apiU('POST', `/api/invite/${encodeURIComponent(tk)}/rsvp`, { name:f.elements.name.value, phone:f.elements.phone.value, plusOne:f.elements.plusOne.checked, dietary:f.elements.dietary.value, message:f.elements.message.value, attending:yn, ...formMeta(f) });
        f.outerHTML = `<div class="inv-thanks">${icon(yn ? 'heart' : 'check')}<h2>${yn ? 'See you there!' : 'Thank you for letting us know'}</h2><p>${yn ? 'Your reply was sent to the hosts.' : 'The hosts will miss you.'}</p></div>`; }
      catch(x){ busy(b, false); err.textContent = x.message; } });
  } };

/* ---- ai-chat.js ---- */
/* =========================================================
   MA3AK AI ASSISTANT — talks to /api/ai/chat (the server holds the key).
   Suggestions are shown as proposals; nothing changes until the customer approves.
   ========================================================= */
const MA3AK_AI = (() => {
  let el = null, convId = null, configured = null, mode = 'rules', busy_ = false;
  const SUGGEST = ['How much is a photographer?', 'Catering for 150 guests', 'I have $15,000 for a wedding with 180 guests', 'Venue in Batroun for 200 guests'];
  const context = () => window.MA3AK_BUILDER && location.hash.startsWith('#/studio') || location.hash.startsWith('#/customize') ? (window.MA3AK_BUILDER ? window.MA3AK_BUILDER.getState() : store.get('custom') || {}) : (store.get('custom') || {});
  const handoff = () => `<div class="ai-hand"><p>Talk to the MA3AK team:</p><div class="ai-hand-g">
      <a href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi MA3AK, I’d like help with my event.')}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}WhatsApp</a>
      <a href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer">${icon('instagram','sm')}Instagram</a>
      <a href="mailto:${CONFIG.email}">${icon('mail','sm')}Email</a>
      <a href="${CONFIG.phoneHref || '#/contact'}">${icon('phone','sm')}Call</a></div>
      ${window.MA3AK_BUILDER ? `<button type="button" class="btn btn-primary btn-sm btn-block" data-ai-send>${icon('send','sm')}Send my event design to the team</button>` : ''}</div>`;
  const bubble = (role, html) => { const m = document.createElement('div'); m.className = `ai-m ${role}`; m.innerHTML = html; $('#ai-log').appendChild(m); $('#ai-log').scrollTop = 1e6; return m; };
  function open(){
    if (typeof TRACK === 'function') TRACK('ai_opened', {});
    if (!el){
      el = document.createElement('div'); el.className = 'ai-panel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'MA3AK assistant');
      el.innerHTML = `<header class="ai-h"><span class="ai-av">${icon('sparkle','sm')}</span><div><b>MA3AK assistant</b><small>Knows your current event</small></div><button class="icon-btn" type="button" data-ai-close aria-label="Close">${icon('x','sm')}</button></header>
        <div class="ai-log" id="ai-log" aria-live="polite"></div>
        <div class="ai-sug" id="ai-sug">${SUGGEST.map(s => `<button type="button" data-ai-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
        <form class="ai-f" id="ai-f"><label class="sr-only" for="ai-in">Message</label><input id="ai-in" autocomplete="off" maxlength="2000" placeholder="Ask about your event…"><button class="ai-go" type="submit" aria-label="Send">${icon('send','sm')}</button></form>
        <p class="ai-fine" id="ai-fine">Prices are estimates from providers’ packages. Availability is confirmed by each provider.</p>`;
      document.body.appendChild(el);
      bubble('bot', `Hi! I’m the MA3AK assistant. Ask about providers, prices, budgets or themes, or pick an idea below.`);
      el.addEventListener('click', onClick); $('#ai-f', el).addEventListener('submit', e => { e.preventDefault(); const i = $('#ai-in', el); send(i.value); i.value = ''; });
      el.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      fetch('/api/ai/status').then(r => r.json()).then(j => { configured = !!j.configured; mode = j.mode || 'rules'; const sm = $('.ai-h small', el); if (sm) sm.textContent = mode === 'ai' ? 'AI assistant · knows your current event' : 'Answers from MA3AK’s providers and prices'; }).catch(() => { configured = false; bubble('bot', `The assistant needs the live MA3AK site. You can reach our team directly.${handoff()}`); });
    }
    el.classList.add('open'); document.body.classList.add('ai-open'); setTimeout(() => $('#ai-in', el).focus(), 60);
  }
  function close(){ if (el){ el.classList.remove('open'); document.body.classList.remove('ai-open'); } }
  async function send(text){
    text = String(text || '').trim(); if (!text || busy_) return; $('#ai-sug', el).hidden = true; bubble('me', esc(text));
    if (configured === false){ bubble('bot', `The assistant isn’t available yet.${handoff()}`); return; }
    busy_ = true; const typing = bubble('bot typing', '<i></i><i></i><i></i>');
    try {
      const r = await fetch('/api/ai/chat', { method:'POST', credentials:'same-origin', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ message:text, conversationId:convId, eventId:window.MA3AK_BUILDER && window.MA3AK_BUILDER.eventId, state:context() }) });
      const j = await r.json().catch(() => ({})); typing.remove();
      if (!r.ok){ bubble('bot', `${esc(j.error || 'Something went wrong.')}${j.code === 'not_configured' || j.code === 'provider' ? handoff() : ''}`); return; }
      convId = j.conversationId;
      const m = bubble('bot', esc(j.reply).replace(/\n/g, '<br>'));
      if ((j.providers || []).length) m.insertAdjacentHTML('beforeend', `<div class="ai-prov">${j.providers.map(p => `<a href="#/vendor/${esc(p.id)}"><b>${esc(p.name)}</b>${p.isDemo ? ' <span class="tag demo-tag">Demo</span>' : ''}${p.verified ? ' <span class="tag gold">Verified</span>' : ''}<small>${p.from != null ? `From ${money(p.from)}${({ per_guest:' / guest', per_hour:' / hour', per_item:' each' })[p.unit] || ''}` : 'Price on request'}</small></a>`).join('')}</div>`);
      if ((j.links || []).length) m.insertAdjacentHTML('beforeend', `<div class="ai-links">${j.links.map(l => /^#\//.test(l.href) ? `<a class="chip" href="${esc(l.href)}">${esc(l.label)}</a>` : '').join('')}</div>`);
      (j.actions || []).forEach((a, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ai-act'; b.innerHTML = `${icon('sparkle','sm')}${esc(a.label)}`; b.onclick = () => review(a); m.appendChild(b); });
      if (j.handoff) bubble('bot', handoff());
    } catch(e){ typing.remove(); bubble('bot', `You seem to be offline.${handoff()}`); }
    finally { busy_ = false; }
  }
  // Show exactly what would change; apply only after the customer confirms.
  function review(a){
    const cur = context(), fmt = v => Array.isArray(v) ? (v.length ? v.join(', ') : 'nothing') : (v === '' || v == null ? 'not set' : String(v));
    const merged = {}; Object.entries(a.changes).forEach(([k, val]) => { merged[k] = Array.isArray(val) && Array.isArray(cur[k]) ? [...new Set([...cur[k], ...val])] : val; });
    openModal({ title:'Apply this suggestion?', body:`<p class="muted small" style="margin:-.5rem 0 1rem">${esc(a.label)}. You can undo it any time.</p><table class="ai-diff">${Object.entries(merged).map(([k, val]) => `<tr><th>${esc(k)}</th><td><s>${esc(fmt(cur[k]))}</s></td><td>${esc(fmt(val))}</td></tr>`).join('')}</table>
      <div class="chip-row" style="margin-top:1.25rem"><button class="btn btn-primary" id="ai-ok">Apply</button><button class="btn btn-ghost" data-close>Not now</button></div>`,
      onMount(m){ $('#ai-ok', m).onclick = () => { closeModal();
        if (window.MA3AK_BUILDER) window.MA3AK_BUILDER.apply(merged, a.label);
        else { const d = store.get('custom') || {}; Object.assign(d, merged); store.set('custom', d); toast('Applied to your design'); location.hash = '#/customize'; } }; } });
  }
  function onClick(e){
    if (e.target.closest('[data-ai-close]')) return close();
    const q = e.target.closest('[data-ai-q]'); if (q) return send(q.dataset.aiQ);
    if (e.target.closest('[data-ai-send]')){ close(); const b = document.querySelector('[data-cat="send"]'); if (b) b.click(); }
  }
  // floating launcher on regular pages (the builder has its own button)
  const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'ai-fab'; fab.innerHTML = `${icon('sparkle','sm')}<span>Ask MA3AK</span>`; fab.setAttribute('aria-label', 'Ask the MA3AK assistant'); fab.onclick = open;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(fab)); if (document.readyState !== 'loading') document.body.appendChild(fab);
  addEventListener('hashchange', () => { if (location.hash.startsWith('#/s/')) close(); });
  document.addEventListener('click', e => { if (e.target.closest('[data-open-ai]')) open(); });
  return { open, close, send };
})();

/* ---- i18n.js ---- */
/* =========================================================
   LANGUAGES — English, العربية (right-to-left), Français.
   Interface text is translated on screen from the dictionary below, so every page,
   the builder and new screens stay translated as they change. To add or fix a
   translation, edit the table: [English, Arabic, French].
   ========================================================= */
const I18N = (() => {
  const T = [
    // site navigation
    ['Home','الرئيسية','Accueil'],['How It Works','كيف يعمل','Comment ça marche'],['Events','المناسبات','Événements'],['Vendors','مزوّدو الخدمات','Prestataires'],['About','من نحن','À propos'],['Contact','تواصل معنا','Contact'],
    ['For Vendors','للمزوّدين','Pour les prestataires'],['Create your event','صمّم مناسبتك','Créez votre événement'],['Explore','استكشف','Explorer'],['Sign in','تسجيل الدخول','Se connecter'],['My events','مناسباتي','Mes événements'],
    ['Search','بحث','Rechercher'],['Privacy Policy','سياسة الخصوصية','Politique de confidentialité'],['Terms','الشروط','Conditions'],['Built for events across Lebanon.','صُمّم للمناسبات في كل لبنان.','Conçu pour les événements partout au Liban.'],
    ['Language','اللغة','Langue'],['Menu','القائمة','Menu'],['Close','إغلاق','Fermer'],['Event Planner','مخطّط المناسبات','Planificateur'],
    // home
    ['Plan Your Event.','خطّط لمناسبتك.','Planifiez votre événement.'],['We’ll Help You Build It.','ونساعدك في تحقيقها.','Nous vous aidons à la réaliser.'],
    ['Tell us what you’re planning, your budget, and what you need. MA3AK connects you with event providers across Lebanon and helps you build your event in one place.','أخبرنا بما تخطّط له وميزانيتك وما تحتاجه. يربطك MA3AK بمزوّدي خدمات المناسبات في كل لبنان ويساعدك على بناء مناسبتك في مكان واحد.','Dites-nous ce que vous préparez, votre budget et vos besoins. MA3AK vous met en relation avec des prestataires partout au Liban et vous aide à construire votre événement en un seul endroit.'],
    ['Design it in 3D','صمّمها بالأبعاد الثلاثية','Concevez-le en 3D'],['Ask the AI assistant','اسأل المساعد الذكي','Demandez à l’assistant IA'],['Save, share, collaborate','احفظ، شارك، تعاون','Enregistrez, partagez, collaborez'],['Send it to us','أرسلها إلينا','Envoyez-le-nous'],
    ['Pick a venue, or upload a photo of your own, then add the stage, decor, lighting and effects and watch it appear.','اختر مكانًا أو حمّل صورة لمكانك، ثم أضف المسرح والديكور والإضاءة والمؤثرات وشاهدها تظهر أمامك.','Choisissez un lieu ou importez une photo du vôtre, puis ajoutez la scène, le décor, l’éclairage et les effets, et regardez-les apparaître.'],
    ['Get advice based on your actual event: guests, venue, style and budget.','احصل على نصائح مبنية على مناسبتك الفعلية: الضيوف والمكان والأسلوب والميزانية.','Des conseils basés sur votre événement réel : invités, lieu, style et budget.'],
    ['Your designs save automatically. Share a view-only link or invite someone to design with you.','تُحفظ تصاميمك تلقائيًا. شارك رابط عرض فقط أو ادعُ شخصًا ليصمّم معك.','Vos créations sont enregistrées automatiquement. Partagez un lien en lecture seule ou invitez quelqu’un à concevoir avec vous.'],
    ['When it’s ready, send your design and our team arranges it with the right providers.','عندما تجهز، أرسل تصميمك وسيرتّبه فريقنا مع المزوّدين المناسبين.','Quand c’est prêt, envoyez votre création et notre équipe l’organise avec les bons prestataires.'],
    ['Ask MA3AK AI','اسأل مساعد MA3AK','Demandez à l’IA MA3AK'],
    // accounts
    ['Welcome back','أهلًا بعودتك','Bon retour'],['Sign in to continue designing your events.','سجّل الدخول لمتابعة تصميم مناسباتك.','Connectez-vous pour continuer à concevoir vos événements.'],['Email','البريد الإلكتروني','E-mail'],['Password','كلمة المرور','Mot de passe'],
    ['Forgot your password?','نسيت كلمة المرور؟','Mot de passe oublié ?'],['Create an account','أنشئ حسابًا','Créer un compte'],['Create your free account','أنشئ حسابك المجاني','Créez votre compte gratuit'],['Save your designs, come back any time, and share them.','احفظ تصاميمك وعُد إليها في أي وقت وشاركها.','Enregistrez vos créations, revenez quand vous voulez et partagez-les.'],
    ['Your name','اسمك','Votre nom'],['Create account','إنشاء الحساب','Créer le compte'],['Continue with Google','المتابعة باستخدام Google','Continuer avec Google'],['or','أو','ou'],['Reset your password','إعادة تعيين كلمة المرور','Réinitialiser le mot de passe'],
    ['Send reset link','أرسل رابط إعادة التعيين','Envoyer le lien'],['Back to sign in','العودة لتسجيل الدخول','Retour à la connexion'],['At least 12 characters, with letters and numbers.','12 حرفًا على الأقل، مع أحرف وأرقام.','Au moins 12 caractères, avec des lettres et des chiffres.'],
    ['Create new event','مناسبة جديدة','Nouvel événement'],['Account','الحساب','Compte'],['Shared with me','تمت مشاركتها معي','Partagés avec moi'],['Favorites','المفضّلة','Favoris'],['Continue designing','متابعة التصميم','Continuer'],['Open','فتح','Ouvrir'],
    ['Design your first event','صمّم مناسبتك الأولى','Concevez votre premier événement'],['Date not set','لم يُحدَّد التاريخ','Date non définie'],['Sent to MA3AK','أُرسلت إلى MA3AK','Envoyé à MA3AK'],['Sign out','تسجيل الخروج','Se déconnecter'],['Profile','الملف الشخصي','Profil'],['Save profile','حفظ الملف','Enregistrer le profil'],
    // builder: categories and groups
    ['Event','المناسبة','Événement'],['Venue','المكان','Lieu'],['Guests','الضيوف','Invités'],['Style','الأسلوب','Style'],['Stage','المسرح','Scène'],['Decor','الديكور','Décor'],['Lights','الإضاءة','Lumières'],['Food','الطعام','Repas'],['Fun','الترفيه','Animations'],['Details','التفاصيل','Détails'],
    ['Invitation','الدعوة','Invitation'],['Guest list','قائمة الضيوف','Liste des invités'],['Timeline','البرنامج','Déroulé'],['Checklist','قائمة المهام','Check-list'],['Send','إرسال','Envoyer'],['All','الكل','Tout'],
    ['Setup','الأساسيات','Bases'],['Design','التصميم','Design'],['Plan','التخطيط','Organisation'],['Finish','الإنهاء','Finalisation'],['Collapse','طيّ','Réduire'],
    ['Setting','المكان','Cadre'],['Time','الوقت','Moment'],['Size','الحجم','Taille'],['Seating','الجلوس','Placement'],['Colors','الألوان','Couleurs'],['Theme','الطابع','Thème'],['Chairs','الكراسي','Chaises'],['Tables','الطاولات','Tables'],['Flowers','الزهور','Fleurs'],
    ['Stage & music','المسرح والموسيقى','Scène et musique'],['Dance floor','حلبة الرقص','Piste de danse'],['Lighting','الإضاءة','Éclairage'],['Effects','المؤثرات','Effets'],['Stations','المحطات','Stands'],['Cake','قالب الحلوى','Gâteau'],['Menu','قائمة الطعام','Menu'],['Drinks','المشروبات','Boissons'],
    ['When','متى','Quand'],['Music','الموسيقى','Musique'],['Photo','التصوير','Photo'],['Beauty','التجميل','Beauté'],['Extras','إضافات','Extras'],
    ['What are we celebrating?','بماذا نحتفل؟','Que célébrons-nous ?'],['Ready to send','جاهز للإرسال','Prêt à envoyer'],['Classic','كلاسيكي','Classique'],['Rare','نادر','Rare'],['Epic','مميّز','Épique'],['Legendary','أسطوري','Légendaire'],
    // builder: HUD, tools, menu
    ['Ask AI','اسأل الذكاء الاصطناعي','Demander à l’IA'],['Before','قبل','Avant'],['Previous','السابق','Précédent'],['score','النتيجة','score'],['Set budget','حدّد الميزانية','Définir le budget'],['budget','الميزانية','budget'],['est.','تقديري','est.'],['Whole venue','المكان كاملًا','Tout le lieu'],
    ['Saved','تم الحفظ','Enregistré'],['Saving…','جارٍ الحفظ…','Enregistrement…'],['Saved on this device','محفوظ على هذا الجهاز','Enregistré sur cet appareil'],['Not saved','لم يُحفظ','Non enregistré'],['Offline, will retry','غير متصل، ستتم المحاولة مجددًا','Hors ligne, nouvel essai bientôt'],
    ['Create my dream event','صمّم مناسبة أحلامي','Créer l’événement de mes rêves'],['Surprise me','فاجئني','Surprenez-moi'],['Inspiration gallery','معرض الإلهام','Galerie d’inspiration'],['Free preview mode','وضع المعاينة الحرّة','Aperçu libre'],['Share event','مشاركة المناسبة','Partager l’événement'],
    ['Version history','سجلّ النسخ','Historique des versions'],['Save as PDF','حفظ كملف PDF','Enregistrer en PDF'],['Save a 4K picture','حفظ صورة بدقة 4K','Enregistrer une image 4K'],['Reset layout to my choices','إعادة التوزيع حسب اختياراتي','Réinitialiser la disposition'],
    ['Realistic graphics','رسومات واقعية','Graphismes réalistes'],['Illustrated graphics','رسومات مرسومة','Graphismes illustrés'],['Front','أمامي','Face'],['Side','جانبي','Côté'],['Top','من الأعلى','Dessus'],['Guest view','منظور الضيف','Vue invité'],['Reset view','إعادة المنظر','Réinitialiser la vue'],
    ['Orbit','دوران','Orbite'],['Exit preview','إنهاء المعاينة','Quitter l’aperçu'],['Roll again','جرّب مجددًا','Relancer'],['Keep it','احتفظ به','Je garde'],['Back to design','العودة للتصميم','Retour au design'],['Replay','إعادة','Rejouer'],
    ['Event experience score','نتيجة تجربة المناسبة','Score d’expérience'],['Guests are arriving','الضيوف يصلون','Les invités arrivent'],['The room fills up','القاعة تمتلئ','La salle se remplit'],['Dinner is served','العشاء جاهز','Le dîner est servi'],['Lights down, music up','الأضواء تخفت والموسيقى ترتفع','Lumières tamisées, musique à fond'],['Peak party','ذروة الحفلة','La fête bat son plein'],
    ['Your event','مناسبتك','Votre événement'],['The stage','المسرح','La scène'],['What your guests will see','ما سيراه ضيوفك','Ce que verront vos invités'],['The full layout','التوزيع الكامل','Le plan complet'],
    ['Atmosphere','الأجواء','Ambiance'],['Guest experience','تجربة الضيوف','Expérience invités'],['Entertainment','الترفيه','Divertissement'],['Budget efficiency','كفاءة الميزانية','Efficacité budgétaire'],['Biggest improvements','أهم التحسينات','Améliorations prioritaires'],
    ['Pick a style','اختر الأسلوب','Choisissez un style'],['What atmosphere?','أي أجواء؟','Quelle ambiance ?'],['Where?','أين؟','Où ?'],['How many guests, and what budget?','كم ضيفًا وما الميزانية؟','Combien d’invités, et quel budget ?'],['Next','التالي','Suivant'],['Back','رجوع','Retour'],['Build my event','ابنِ مناسبتي','Construire mon événement'],['Not sure yet','لست متأكدًا بعد','Pas encore sûr'],
    ['Romantic','رومانسي','Romantique'],['Elegant','أنيق','Élégant'],['Party','حفلة','Fête'],['Afro House','أفرو هاوس','Afro House'],['Chill','هادئ','Détente'],['Traditional','تقليدي','Traditionnel'],['Luxury','فاخر','Luxe'],['Modern','عصري','Moderne'],['Minimal','بسيط','Minimaliste'],['Boho','بوهيمي','Bohème'],['Garden','حديقة','Jardin'],['Glam','براق','Glamour'],['Royal','ملكي','Royal'],
    ['Setting the venue','تجهيز المكان','Préparation du lieu'],['Placing tables and chairs','وضع الطاولات والكراسي','Mise en place des tables'],['Building the stage','بناء المسرح','Montage de la scène'],['Decorating','التزيين','Décoration'],['Lighting it up','تشغيل الإضاءة','Mise en lumière'],['Final touches','اللمسات الأخيرة','Touches finales'],
    ['seats','مقاعد','places'],['guests','ضيوف','invités'],['venue','المكان','lieu'],['space used','المساحة المستخدمة','espace utilisé'],['Day','نهار','Jour'],['Sunset','الغروب','Coucher de soleil'],['Night','ليل','Nuit'],
    // venues and event types
    ['Ballroom','قاعة','Salle de bal'],['Beach','شاطئ','Plage'],['Boat','قارب','Bateau'],['Rooftop','سطح','Rooftop'],['Villa','فيلا','Villa'],['Mountain resort','منتجع جبلي','Station de montagne'],['Tent','خيمة','Chapiteau'],['Vineyard','كرم','Vignoble'],['Palace','قصر','Palais'],['Restaurant','مطعم','Restaurant'],['Industrial loft','لوفت صناعي','Loft industriel'],
    ['Wedding','زفاف','Mariage'],['Engagement','خطوبة','Fiançailles'],['Birthday','عيد ميلاد','Anniversaire'],['Graduation','تخرّج','Remise de diplômes'],['Corporate Event','مناسبة شركات','Événement d’entreprise'],['Private Party','حفلة خاصة','Soirée privée'],['Baby Shower','حفل استقبال المولود','Baby shower'],
    ['Bachelor Party','حفلة العزوبية','Enterrement de vie de garçon'],['Bachelorette Party','حفلة العروس','Enterrement de vie de jeune fille'],['Beach Event','مناسبة على الشاطئ','Événement à la plage'],['Outdoor Event','مناسبة في الهواء الطلق','Événement en plein air'],['Other Celebration','احتفال آخر','Autre célébration'],
    // catalogue items
    ['DJ booth','منصّة الـDJ','Cabine DJ'],['Live band','فرقة حيّة','Groupe live'],['Kosha','كوشة','Kosha'],['Sweetheart table','طاولة العروسين','Table des mariés'],['Grand piano','بيانو كبير','Piano à queue'],['Dabke & zaffe','دبكة وزفّة','Dabké et zaffé'],['Sound system','نظام صوت','Sonorisation'],
    ['Flower wall','جدار زهور','Mur de fleurs'],['Floral arch','قوس زهور','Arche florale'],['Balloon arch','قوس بالونات','Arche de ballons'],['Neon sign','لافتة نيون','Enseigne néon'],['Draped backdrop','خلفية قماشية','Drapé de fond'],['Balloon clusters','باقات بالونات','Grappes de ballons'],['Welcome sign','لافتة ترحيب','Panneau de bienvenue'],
    ['Candles & lanterns','شموع وفوانيس','Bougies et lanternes'],['Gift table','طاولة الهدايا','Table des cadeaux'],['Patio heaters','مدافئ خارجية','Chauffages d’extérieur'],['Olive tree','شجرة زيتون','Olivier'],['Umbrella lounge','جلسة بمظلّة','Salon parasol'],
    ['Chandeliers','ثريّات','Lustres'],['String lights','أضواء معلّقة','Guirlandes lumineuses'],['Warm uplights','إضاءة دافئة','Éclairage chaud'],['Color uplights','إضاءة ملوّنة','Éclairage coloré'],['Moving lights','أضواء متحرّكة','Lyres motorisées'],['LED screen','شاشة LED','Écran LED'],['LED panels','ألواح LED','Panneaux LED'],
    ['Cold sparks','شرارات باردة','Étincelles froides'],['Confetti','قصاصات ملوّنة','Confettis'],['Low fog','ضباب منخفض','Fumée lourde'],['Bubbles','فقاعات','Bulles'],['Lasers','ليزر','Lasers'],['Flame jets','نافورات لهب','Jets de flammes'],['Balloon drop','إسقاط البالونات','Lâcher de ballons'],['Fireworks','ألعاب نارية','Feux d’artifice'],['Drone light show','عرض طائرات مضيئة','Spectacle de drones'],['Sky lanterns','فوانيس طائرة','Lanternes célestes'],
    ['Bar','بار','Bar'],['Buffet','بوفيه','Buffet'],['Live stations','محطات حيّة','Stands live'],['BBQ grill','شواء','Barbecue'],['Food truck','شاحنة طعام','Food truck'],['Sweets table','طاولة حلويات','Table de douceurs'],['Chocolate fountain','نافورة شوكولا','Fontaine de chocolat'],['Coffee corner','ركن القهوة','Coin café'],
    ['Photo booth','كشك تصوير','Photobooth'],['360 booth','كشك 360','Photobooth 360'],['Argileh lounge','جلسة أراكيل','Coin narguilé'],['Lounge set','جلسة استرخاء','Salon lounge'],['Kids’ play area','منطقة ألعاب الأطفال','Espace enfants'],['Lawn games','ألعاب العشب','Jeux de jardin'],['Casino table','طاولة كازينو','Table de casino'],['Live painter','رسّام مباشر','Peintre live'],['Classic car','سيارة كلاسيكية','Voiture de collection'],['Fire pit','موقد نار','Brasero'],
    // planning tools
    ['Save your event to plan the details','احفظ مناسبتك لتخطّط تفاصيلها','Enregistrez votre événement pour en planifier les détails'],['Create a free account','أنشئ حسابًا مجانيًا','Créer un compte gratuit'],['attending','حاضرون','présents'],['confirmed','مؤكَّد','confirmés'],['pending','بانتظار الرد','en attente'],['declined','اعتذروا','déclinés'],['no table','بلا طاولة','sans table'],
    ['Add','إضافة','Ajouter'],['Paste a list','الصق قائمة','Coller une liste'],['Confirmed','مؤكَّد','Confirmé'],['Pending','بانتظار الرد','En attente'],['Declined','اعتذر','Décliné'],['VIP','كبار الضيوف','VIP'],['No table','بلا طاولة','Sans table'],['Table','طاولة','Table'],
    ['Add a moment','أضف لحظة','Ajouter un moment'],['Create my checklist','أنشئ قائمة مهامي','Créer ma check-list'],['60+ days before','قبل 60 يومًا أو أكثر','60 jours avant ou plus'],['30 days before','قبل 30 يومًا','30 jours avant'],['7 days before','قبل 7 أيام','7 jours avant'],['Event day','يوم المناسبة','Jour J'],
    ['Save draft','حفظ كمسودة','Enregistrer le brouillon'],['Publish invitation','نشر الدعوة','Publier l’invitation'],['Update invitation','تحديث الدعوة','Mettre à jour l’invitation'],['Title','العنوان','Titre'],['Hosted by','بدعوة من','Organisé par'],['Date','التاريخ','Date'],['Where','المكان','Lieu'],['Message','الرسالة','Message'],['Dress code','قواعد اللباس','Code vestimentaire'],['Reply by','الرد قبل','Répondre avant le'],
    ['Guest name','اسم الضيف','Nom de l’invité'],['Group (e.g. Haddad family)','المجموعة (مثلًا عائلة حداد)','Groupe (ex. famille Haddad)'],['Drag to look around','اسحب لتتجوّل','Faites glisser pour explorer'],['Search all items','ابحث في كل العناصر','Rechercher tous les éléments'],
    ['Search DJ booth, flowers, LED, chairs…','ابحث: DJ، زهور، LED، كراسي…','Rechercher : DJ, fleurs, LED, chaises…'],['Nothing to undo','لا شيء للتراجع','Rien à annuler'],['Nothing to redo','لا شيء للإعادة','Rien à rétablir'],['Popular','الأكثر طلبًا','Populaire'],['New','جديد','Nouveau'],['Outdoor','في الهواء الطلق','Extérieur'],['Indoor','داخلي','Intérieur'],
    ['Copy','نسخ','Copier'],['Preview','معاينة','Aperçu'],['Turn off','إيقاف','Désactiver'],
    // invitation page
    ['You’re invited','أنت مدعو','Vous êtes invité'],['Will you join us?','هل ستنضم إلينا؟','Serez-vous des nôtres ?'],['Joyfully accept','أقبل بكل سرور','J’accepte avec joie'],['Regretfully decline','أعتذر بأسف','Je décline à regret'],['Phone (optional)','الهاتف (اختياري)','Téléphone (facultatif)'],
    ['I’m bringing a plus-one','سأحضر مرافقًا','Je viens accompagné'],['Dietary needs (optional)','احتياجات غذائية (اختياري)','Régime alimentaire (facultatif)'],['A note for the hosts (optional)','رسالة للمضيفين (اختياري)','Un mot pour les hôtes (facultatif)'],['Send my reply','أرسل ردّي','Envoyer ma réponse'],
    ['See you there!','نراك هناك!','À bientôt !'],['Thank you for letting us know','شكرًا لإعلامنا','Merci de nous avoir prévenus'],['Your reply was sent to the hosts.','وصل ردّك إلى المضيفين.','Votre réponse a été envoyée aux hôtes.'],['Replies are closed. Contact the hosts directly.','انتهت مهلة الرد. تواصل مع المضيفين مباشرة.','Les réponses sont closes. Contactez directement les hôtes.'],['Designed with','صُمّمت بواسطة','Conçu avec'],
    // send, vendors, assistant
    ['Phone / WhatsApp','الهاتف / واتساب','Téléphone / WhatsApp'],['Send my event design','أرسل تصميم مناسبتي','Envoyer mon design'],['optional','اختياري','facultatif'],['Add to my event','أضف إلى مناسبتي','Ajouter à mon événement'],['Request booking','اطلب حجزًا','Demander une réservation'],
    ['MA3AK assistant','مساعد MA3AK','Assistant MA3AK'],['Knows your current event','يعرف مناسبتك الحالية','Connaît votre événement'],['Ask about your event…','اسأل عن مناسبتك…','Posez une question sur votre événement…'],['Message us on WhatsApp','راسلنا على واتساب','Écrivez-nous sur WhatsApp'],['Your design is with us','وصلنا تصميمك','Nous avons reçu votre design'],
  ];
  const D = { ar:new Map(), fr:new Map() }; T.forEach(([en, ar, fr]) => { D.ar.set(en, ar); D.fr.set(en, fr); });
  const PAT = [[/^Next: (.+)$/, 'التالي: $1', 'Suivant : $1'], [/^Saved (\d+)s ago$/, 'حُفظ قبل $1 ث', 'Enregistré il y a $1 s'], [/^Saved (\d+) min ago$/, 'حُفظ قبل $1 د', 'Enregistré il y a $1 min'], [/^(.+) · Level (\d+)$/, '$1 · المستوى $2', '$1 · Niveau $2'], [/^(.+) design$/, 'تصميم $1', 'Design $1'], [/^Seat everyone \((\d+) per table\)$/, 'أجلِس الجميع ($1 لكل طاولة)', 'Placer tout le monde ($1 par table)'], [/^Undo: (.+)$/, 'تراجع: $1', 'Annuler : $1'], [/^Redo: (.+)$/, 'إعادة: $1', 'Rétablir : $1']];
  const LEVELS = { Sketch:['مسودة','Esquisse'], Concept:['فكرة','Concept'], Showcase:['عرض','Vitrine'], Grand:['فخم','Grandiose'], Masterpiece:['تحفة','Chef-d’œuvre'] };
  let lang = 'en'; try { lang = localStorage.getItem('ma3ak:lang') || ((navigator.language || '').startsWith('ar') ? 'ar' : (navigator.language || '').startsWith('fr') ? 'fr' : 'en'); } catch(e){}
  const idx = () => lang === 'ar' ? 1 : 2;
  const word = w => (LEVELS[w] ? LEVELS[w][idx() - 1] : D[lang].get(w)) || w;
  function tr(src){
    if (lang === 'en' || !src) return null; const k = src.trim(); if (!k || k.length > 400) return null;
    let t = D[lang].get(k);
    if (t == null) for (const p of PAT){ const m = k.match(p[0]); if (m){ t = p[idx()].replace('$1', /^\d+$/.test(m[1]) ? m[1] : word(m[1])).replace('$2', m[2] || ''); break; } }
    return t == null ? null : src.replace(k, t);
  }
  const ATTRS = ['placeholder','aria-label','title'];
  function apply(n){
    if (n.nodeType === 3){ const p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(p.nodeName) || (p.closest && p.closest('[data-noi18n]'))) return;
      if (n.__en === undefined || (n.__set !== undefined && n.nodeValue !== n.__set)) n.__en = n.nodeValue;
      const want = tr(n.__en) ?? n.__en; if (n.nodeValue !== want){ n.__set = want; n.nodeValue = want; } else n.__set = want; return; }
    if (n.nodeType !== 1 || n.closest('[data-noi18n]')) return;
    for (const a of ATTRS){ if (!n.hasAttribute(a)) continue; const cur = n.getAttribute(a), ek = '__en_' + a, sk = '__set_' + a;
      if (n[ek] === undefined || cur !== n[sk]) n[ek] = cur; const want = tr(n[ek]) ?? n[ek]; n[sk] = want; if (cur !== want) n.setAttribute(a, want); }
    for (const c of n.childNodes) apply(c);
  }
  let queue = new Set(), raf = 0;
  const flush = () => { raf = 0; const q = queue; queue = new Set(); q.forEach(n => { if (n.isConnected) apply(n); }); };
  const mo = new MutationObserver(ms => { for (const m of ms){ if (m.type === 'childList') m.addedNodes.forEach(n => queue.add(n)); else queue.add(m.target); } if (!raf) raf = requestAnimationFrame(flush); });
  function title(){ const t = document.title, i = t.lastIndexOf(' | '); if (i < 0 || lang === 'en') return; const head = t.slice(0, i), tt = tr(head); if (tt && tt !== head) document.title = tt + t.slice(i); }
  function set(l){
    lang = ['ar','fr'].includes(l) ? l : 'en'; try { localStorage.setItem('ma3ak:lang', lang); } catch(e){}
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    apply(document.body); title(); $$('[data-lang-cur]').forEach(b => { b.textContent = { en:'EN', ar:'ع', fr:'FR' }[lang]; });
  }
  function picker(){ openModal({ title:'Language', body:`<div class="lang-pick">${[['en','English'],['ar','العربية'],['fr','Français']].map(([k, l]) => `<button type="button" class="btn ${k === lang ? 'btn-primary' : 'btn-ghost'} btn-block" data-set-lang="${k}" data-noi18n>${l}</button>`).join('')}</div>
      <p class="small muted" style="margin-top:1rem" data-noi18n>${{ en:'Some long pages (About, legal) are in English.', ar:'بعض الصفحات الطويلة (من نحن، الشروط) متوفّرة بالإنجليزية.', fr:'Certaines pages longues (À propos, mentions légales) sont en anglais.' }[lang]}</p>`,
    onMount(m){ m.addEventListener('click', e => { const b = e.target.closest('[data-set-lang]'); if (b){ closeModal(); set(b.dataset.setLang); } }); } }); }
  document.addEventListener('click', e => { if (e.target.closest('[data-lang-open]')) picker(); });
  const start = () => { mo.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS }); set(lang);
    new MutationObserver(title).observe(document.querySelector('title'), { childList:true }); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  return { set, get lang(){ return lang; }, t:k => tr(k) ?? k, picker };
})();

/* ---- market.js ---- */
/* =========================================================
   MARKETPLACE + BUDGET PLANNER (client)
   Website content, provider packages, quote requests, the database-backed
   budget planner, the customer dashboard and the partner portal.
   Everything here is saved on the server; nothing important lives in the browser.
   ========================================================= */

/* ---------- website content managed in the admin ---------- */
const SITE = { settings:{}, categories:[], loaded:false };
SITE.ready = fetch('/api/site', { credentials:'same-origin' }).then(r => r.json()).then(j => { if (!j || !j.ok) return; SITE.settings = j.settings || {}; SITE.categories = j.categories || []; SITE.loaded = true; applySite(); }).catch(() => {});
function applySite(){
  const c = SITE.settings.contact || {};
  if (c.phone){ CONFIG.phone = c.phone; CONFIG.phoneHref = 'tel:' + c.phone.replace(/[^\d+]/g, ''); }
  if (c.email) CONFIG.email = c.email;
  if (c.whatsapp) CONFIG.whatsapp = c.whatsapp;
  if (c.instagram){ CONFIG.instagramUrl = 'https://www.instagram.com/' + c.instagram; CONFIG.instagramHandle = '@' + c.instagram; }
  if (SITE.categories.length){
    const ids = SITE.categories.map(x => x.id);
    for (let i = CATEGORIES.length - 1; i >= 0; i--) if (!ids.includes(CATEGORIES[i].id)) CATEGORIES.splice(i, 1);
    SITE.categories.forEach(dc => { const ex = CATEGORIES.find(x => x.id === dc.id), ic = ICONS[dc.icon] ? dc.icon : null;
      if (ex) Object.assign(ex, { name:dc.name, single:dc.single || dc.name, blurb:dc.blurb || ex.blurb, icon:ic || ex.icon, count:dc.providers });
      else CATEGORIES.push({ id:dc.id, name:dc.name, single:dc.single || dc.name, icon:ic || 'more', blurb:dc.blurb || '', keywords:[dc.name.toLowerCase(), dc.id], weight:4, count:dc.providers }); });
    CATEGORIES.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  }
  const f = $('.site-footer'); if (f) f.outerHTML = Footer();
  const a = SITE.settings.announcement;
  if (a && a.active && a.text && !$('#site-announce')) document.body.insertAdjacentHTML('afterbegin', `<div class="announce" id="site-announce" role="status">${esc(a.text)}</div>`);
}

/* ---------- small helpers ---------- */
const UNIT_TXT = { flat:'', per_guest:' / guest', per_hour:' / hour', per_item:' each' };
const UNIT_NAMES = { flat:'Fixed price', per_guest:'Per guest', per_hour:'Per hour', per_item:'Per item' };
const priceTxt = (p, max, unit) => p == null ? 'Request a quote' : money(p) + (max != null && max > p ? '–' + money(max) : '') + (UNIT_TXT[unit] || '');
const rangeTxt = (lo, hi) => hi > lo ? `${money(lo)} – ${money(hi)}` : money(lo);
const vBadges = v => `${v.isDemo ? `<span class="tag demo-tag" title="A sample listing for trying the planner. Not a real business; prices are illustrative.">Demo listing</span>` : ''}${v.verified ? `<span class="tag gold">${icon('check','sm')}Verified by MA3AK</span>` : ''}`;
const findPkg = id => { for (const v of VENDORS) { const p = (v.packages || []).find(x => x.id === id); if (p) return { v, p }; } return null; };
const qtyFor = (unit, qty, guests) => qty != null ? qty : unit === 'per_guest' ? (guests || 0) : 1;
const STATUS_TXT = { draft:'Draft', finalized:'Finalized', sent:'Sent to MA3AK', booked:'Booked', archived:'Archived' };
const QUOTE_TXT = { new:'Waiting for reply', replied:'Replied', quoted:'Quote received', accepted:'Accepted', declined:'Declined', closed:'Closed' };
const themeNames = () => [...new Set([...(SITE.settings.themes || []).map(t => t.name), ...STYLES])];
function needSignIn(msg){ sessionStorage.setItem('ma3ak:next', location.hash); toast(msg || 'Please sign in first', 'info'); location.hash = '#/login'; }
async function imageFromFile(file, max = 1600, q = .85){
  if (!file || !/^image\/(jpeg|png|webp|heic|heif)/.test(file.type)) throw new Error('Choose a JPG or PNG photo.');
  const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('That photo couldn’t be opened.')); i.src = url; });
  const k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); return cv.toDataURL('image/jpeg', q);
}

/* ---------- plan form (new plan and plan details) ---------- */
function planFields(p = {}, prefix = 'pf'){
  const id = k => `${prefix}-${k}`, wanted = p.wanted || [];
  return `<div class="form-row">${FormField({ id:id('name'), label:'Plan name', required:true, value:p.name || '', placeholder:'e.g. Our wedding' })}${FormField({ id:id('eventType'), label:'Event type', options:opt(EVENT_TYPES), placeholder:'Choose', value:p.eventType || '' })}</div>
    <div class="form-row">${FormField({ id:id('date'), label:'Date', type:'date', value:p.date || '' })}${FormField({ id:id('location'), label:'Area in Lebanon', options:opt(LOCATIONS), placeholder:'Choose an area', value:p.location || '' })}</div>
    <div class="form-row">${FormField({ id:id('guests'), label:'Guests', type:'number', inputmode:'numeric', value:p.guests ?? '' })}${FormField({ id:id('budget'), label:'Budget (USD)', type:'number', inputmode:'numeric', value:p.budget ?? '' })}</div>
    <div class="form-row">${FormField({ id:id('theme'), label:'Theme or style', options:themeNames().map(t => ({ value:t, label:t })), placeholder:'Any', value:p.theme || '' })}${FormField({ id:id('setting'), label:'Indoor or outdoor', options:[{ value:'indoor', label:'Indoor' }, { value:'outdoor', label:'Outdoor' }, { value:'both', label:'Both / not sure' }], placeholder:'Not sure yet', value:p.setting || '' })}</div>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Services you need</legend><div class="chip-row wanted">${CATEGORIES.map(c => `<label class="chip-check"><input type="checkbox" name="${id('wanted')}" value="${esc(c.id)}"${wanted.includes(c.id) ? ' checked' : ''}><span>${icon(c.icon,'sm')}${esc(c.single || c.name)}</span></label>`).join('')}</div></fieldset>
    ${FormField({ id:id('requirements'), label:'Special requirements', type:'textarea', value:p.requirements || '', placeholder:'Accessibility, dietary needs, timings, anything providers should know' })}`;
}
function readPlanForm(f, prefix = 'pf'){
  const v = k => (f.elements[`${prefix}-${k}`] || {}).value;
  const num = x => x === '' || x == null ? null : Math.round(+x);
  return { name:(v('name') || '').trim(), eventType:v('eventType') || '', date:v('date') || '', location:v('location') || '', guests:num(v('guests')), budget:num(v('budget')), theme:v('theme') || '', setting:v('setting') || '',
    wanted:$$(`input[name="${prefix}-wanted"]:checked`, f).map(x => x.value), requirements:(v('requirements') || '').trim() };
}
function presetWanted(f, eventType, prefix = 'pf'){
  const e = byId(EVENT_TYPES, eventType); if (!e) return;
  $$(`input[name="${prefix}-wanted"]`, f).forEach(x => { x.checked = e.services.includes(x.value); });
}

/* ---------- add a provider's package to a plan ---------- */
async function addToPlanFlow(v, pkg, { planId } = {}){
  await AUTH.ready;
  if (!AUTH.user) return needSignIn('Sign in to save services to your plan');
  if (planId){ try { await apiU('POST', `/api/events/${planId}/services`, { packageId:pkg.id }); toast(`Added ${esc(pkg.name)}`); } catch(err){ toast(esc(err.message), 'alert'); } return; }
  let plans = []; try { plans = (await apiU('GET', '/api/events')).events; } catch(err){ toast(esc(err.message), 'alert'); return; }
  openModal({ title:'Add to a plan', body:`<p class="small muted" style="margin-bottom:1rem"><b>${esc(pkg.name)}</b> from ${esc(v.name)} · ${esc(priceTxt(pkg.price, pkg.priceMax, pkg.unit))}. Prices are estimates until the provider confirms.</p>
    ${plans.length ? `<div class="pick-ev">${plans.map(p => `<button type="button" class="btn btn-ghost btn-block pick-row" data-pick="${esc(p.id)}"><span>${esc(p.name)}</span><small class="muted">${[p.event_date && fmtDate(p.event_date), p.guest_count && `${p.guest_count} guests`, p.est_low != null && `≈ ${money(p.est_low)}`].filter(Boolean).join(' · ')}</small></button>`).join('')}</div><p class="divider-text">or start a new plan</p>` : ''}
    <form class="form" id="qp-form" novalidate><div class="form-row">${FormField({ id:'qp-name', label:'Plan name', required:true, value:'My event' })}${FormField({ id:'qp-type', label:'Event type', options:opt(EVENT_TYPES), placeholder:'Choose' })}</div>
      <div class="form-row">${FormField({ id:'qp-guests', label:'Guests', type:'number', inputmode:'numeric' })}${FormField({ id:'qp-budget', label:'Budget (USD)', type:'number', inputmode:'numeric' })}</div>
      <button class="btn btn-primary btn-block" type="submit">${icon('plus','sm')}Create plan and add</button></form>`,
    onMount(m){
      const done = (pid, name) => { $('.modal-body', m).innerHTML = `<div class="form-success"><div class="card-ico">${icon('check')}</div><h3>Added to ${esc(name)}</h3><p>The total in your plan updated. You can change the quantity or swap it for another package there.</p><div class="actions"><a class="btn btn-primary" href="#/planner/${esc(pid)}">Open my plan</a><button class="btn btn-ghost" data-close>Keep browsing</button></div></div>`; };
      m.addEventListener('click', async e => { const b = e.target.closest('[data-pick]'); if (!b) return; b.disabled = true;
        try { await apiU('POST', `/api/events/${b.dataset.pick}/services`, { packageId:pkg.id }); done(b.dataset.pick, plans.find(p => p.id === b.dataset.pick).name); } catch(err){ b.disabled = false; toast(esc(err.message), 'alert'); } });
      $('#qp-form', m).addEventListener('submit', async e => { e.preventDefault(); const f = e.target; if (!validateForm(f, { 'qp-name':V.req('a name') })) return; const btn = $('[type=submit]', f); busy(btn, true, 'Creating');
        try { const g = +f.elements['qp-guests'].value || null, bud = +f.elements['qp-budget'].value || null, t = f.elements['qp-type'].value;
          const r = await apiU('POST', '/api/plans', { name:f.elements['qp-name'].value.trim(), eventType:t, guests:g, budget:bud, wanted:[...new Set([v.category, ...((byId(EVENT_TYPES, t) || {}).services || [])])] });
          await apiU('POST', `/api/events/${r.id}/services`, { packageId:pkg.id }); done(r.id, f.elements['qp-name'].value.trim()); }
        catch(err){ busy(btn, false); showServerErrors(f, err, { name:'qp-name', guests:'qp-guests', budget:'qp-budget' }); toast(esc(err.message), 'alert'); } });
    } });
}
// "Add to plan" on a provider card: pick which package first.
function choosePackage(v){
  const pk = (v.packages || []).filter(p => p.active !== false);
  if (!pk.length) return openQuoteModal(v);
  if (pk.length === 1) return addToPlanFlow(v, pk[0]);
  openModal({ title:`Choose a package`, body:`<p class="small muted" style="margin-bottom:1rem">${esc(v.name)}${v.isDemo ? ' (demo listing — illustrative prices)' : ''}</p><div class="pick-ev">${pk.map(p => `<button type="button" class="btn btn-ghost btn-block pick-row" data-pkg="${esc(p.id)}"><span>${esc(p.name)}</span><small class="muted">${esc(priceTxt(p.price, p.priceMax, p.unit))}</small></button>`).join('')}</div>`,
    onMount(m){ m.addEventListener('click', e => { const b = e.target.closest('[data-pkg]'); if (!b) return; closeModal(); addToPlanFlow(v, pk.find(p => p.id === b.dataset.pkg)); }); } });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-add-vendor]'); if (!b) return; e.preventDefault(); e.stopImmediatePropagation();
  const v = VENDORS.find(x => x.id === b.dataset.addVendor); if (v) choosePackage(v);
}, true);

/* ---------- quote request to a provider ---------- */
async function openQuoteModal(v, pkg, { planId } = {}){
  await AUTH.ready; const u = AUTH.user;
  let plans = []; if (u) { try { plans = (await apiU('GET', '/api/events')).events; } catch(e){} }
  openModal({ title:'Request a quote', body:`<p class="muted small" style="margin-bottom:1.1rem">To <b>${esc(v.name)}</b>${pkg ? ` · ${esc(pkg.name)}` : ''}. The provider replies with a price and tells you if your date works. Nothing is booked until you agree.${v.isDemo ? ' <b>This is a demo listing, so your request goes to the MA3AK team.</b>' : ''}</p>
    <form class="form" id="q-form" novalidate>
      ${u ? '' : `<div class="form-row">${FormField({ id:'q-name', label:'Your name', required:true, autocomplete:'name' })}${FormField({ id:'q-email', label:'Email', type:'email', autocomplete:'email' })}</div>${FormField({ id:'q-phone', label:'Phone', type:'tel', autocomplete:'tel', inputmode:'tel', hint:'Add an email or a phone number so they can reply.' })}`}
      ${plans.length ? FormField({ id:'q-plan', label:'Link to my plan', options:plans.map(p => ({ value:p.id, label:p.name })), placeholder:'Don’t link a plan', value:planId || '' }) : ''}
      <div class="form-row">${FormField({ id:'q-date', label:'Event date', type:'date' })}${FormField({ id:'q-guests', label:'Guests', type:'number', inputmode:'numeric' })}</div>
      ${FormField({ id:'q-loc', label:'Area', options:opt(LOCATIONS), placeholder:'Choose an area' })}
      ${FormField({ id:'q-msg', label:'Message', type:'textarea', placeholder:'What you need, timings, questions…' })}
      ${HONEYPOT}${u ? '' : ConsentField('q-consent')}
      <button class="btn btn-primary btn-block" type="submit">${icon('send','sm')}Send request</button></form>`,
    onMount(m){
      const f = $('#q-form', m); stampForm(f); f.elements['q-date'].min = todayISO();
      const pl = f.elements['q-plan'], fill = () => { const p = plans.find(x => x.id === (pl && pl.value)); if (!p) return; if (p.event_date) f.elements['q-date'].value = p.event_date; if (p.guest_count) f.elements['q-guests'].value = p.guest_count; if (p.location) f.elements['q-loc'].value = p.location; };
      if (pl){ pl.addEventListener('change', fill); fill(); }
      f.addEventListener('submit', async e => { e.preventDefault();
        const rules = { 'q-date':x => x && x < todayISO() ? 'Choose a date in the future.' : '' };
        if (!u) Object.assign(rules, { 'q-name':V.req('your name'), 'q-email':x => x ? V.email(x) : '', 'q-phone':V.phoneOpt });
        if (!validateForm(f, rules)) return; if (!u && !consentOk(f, 'q-consent')) return;
        if (!u && !f.elements['q-email'].value.trim() && !f.elements['q-phone'].value.trim()){ $('#q-email-err', f).textContent = 'Add an email or a phone number.'; f.elements['q-email'].focus(); return; }
        const btn = $('[type=submit]', f); busy(btn, true); const val = k => f.elements[k] ? f.elements[k].value.trim() : '';
        try { const r = await apiU('POST', `/api/vendors/${encodeURIComponent(v.id)}/quotes`, { packageId:pkg ? pkg.id : undefined, eventId:val('q-plan') || undefined, name:val('q-name') || undefined, email:val('q-email') || undefined, phone:val('q-phone') || undefined, date:val('q-date'), guests:val('q-guests'), location:val('q-loc') || undefined, message:val('q-msg'), consent:true, ...formMeta(f) });
          if (typeof TRACK === 'function') TRACK('quote_requested', { type:'provider' });
          $('.modal-body', m).innerHTML = sentPanel({ title:'Request sent', text:u ? `${esc(v.name)} will reply on MA3AK. You’ll see the answer under Quotes in your dashboard${u.verified ? ' and by email if it’s set up' : ''}.` : `${esc(v.name)} will reply to the email or phone you gave.`, refNo:r.ref, extra:u ? `<a class="btn btn-ghost" href="#/dashboard?tab=quotes">My quotes</a>` : '' }); }
        catch(err){ busy(btn, false); showServerErrors(f, err, { name:'q-name', email:'q-email', phone:'q-phone', date:'q-date', guests:'q-guests', location:'q-loc' }); toast(esc(err.message), 'alert'); } });
    } });
}

/* ---------- provider favourites ---------- */
async function toggleVendorFav(v, btn){
  await AUTH.ready; if (!AUTH.user) return needSignIn('Sign in to save favourite providers');
  const on = btn.getAttribute('aria-pressed') === 'true';
  try { await apiU(on ? 'DELETE' : 'PUT', `/api/favorites/v:${encodeURIComponent(v.id)}`); btn.setAttribute('aria-pressed', String(!on)); btn.innerHTML = `${icon('heart','sm')}${on ? 'Save' : 'Saved'}`; toast(on ? 'Removed from favourites' : 'Saved to your favourites'); } catch(err){ toast(esc(err.message), 'alert'); }
}

/* ---------- homepage: editable content, featured providers, themes, FAQs ---------- */
async function enhanceHome(root){
  await Promise.all([SITE.ready, VENDORS_READY]); if (!root.isConnected) return;
  const s = SITE.settings, h = s.hero;
  if (h){ const t = $('#hero-title', root); if (t && h.title) t.innerHTML = `<span>${esc(h.title)}</span>`; const l = $('.hero-in .lede', root); if (l && h.subtitle) l.textContent = h.subtitle;
    const ctas = $('.hero-ctas', root); if (ctas) ctas.innerHTML = `<a class="btn btn-light btn-lg" href="#/plan">${esc(h.primary || 'Start planning')}</a><a class="btn btn-outline-light btn-lg" href="#/vendors">${esc(h.secondary || 'Browse providers')}</a><a class="btn btn-outline-light btn-lg" href="#/customize">${icon('layers','sm')}Design in 3D</a>`;
    const note = $('.hero-note', root); if (note && h.eyebrow) note.textContent = h.eyebrow; }
  const bi = s.budgetIntro; if (bi && bi.title){ const t = $('#budget-title', root); if (t) t.textContent = bi.title; const p = t && t.parentElement.querySelector('.lede'); if (p) p.textContent = bi.text; }
  if ((s.howItWorks || []).length){ const g = $('.steps', root); if (g) g.innerHTML = s.howItWorks.map((x, n) => `<li class="step"><span class="step-num" aria-hidden="true">0${n+1}</span><h3 class="h3"><span class="sr-only">Step ${n+1}: </span>${esc(x.title)}</h3><p>${esc(x.text)}</p><span class="step-ico">${icon(['clipboard','search','wallet','send','calendar','check'][n] || 'check')}</span></li>`).join(''); }
  const featured = VENDORS.filter(v => v.featured).slice(0, 4), anchor = $('.feat-band', root);
  let extra = '';
  if (featured.length) extra += `<section class="section" aria-labelledby="featured-title"><div class="wrap">${SectionHeader({ title:'Featured providers', lede:featured.some(v => v.isDemo) ? 'Demo listings are samples for trying the planner while real providers join. Their prices are illustrative.' : 'Hand-picked providers across Lebanon.', aside:`<a class="btn btn-ghost" href="#/vendors">All providers</a>` }).replace('<h2 class="h2">','<h2 class="h2" id="featured-title">')}<div class="grid g-4 results-grid">${featured.map(VendorCard).join('')}</div></div></section>`;
  if ((s.themes || []).length) extra += `<section class="section surface-band" aria-labelledby="themes-title"><div class="wrap">${SectionHeader({ title:'Themes to start from', lede:'Pick a mood. Your plan keeps it, and the 3D designer can show it.' }).replace('<h2 class="h2">','<h2 class="h2" id="themes-title">')}<div class="grid g-4">${s.themes.map(t => `<a class="theme-card" href="#/plan${qs({ theme:t.name })}"><span class="swatches">${(t.colors || []).map(c => `<i style="background:${esc(c)}"></i>`).join('')}</span><b>${esc(t.name)}</b><small>${esc(t.description || '')}</small></a>`).join('')}</div></div></section>`;
  if (anchor && extra) anchor.insertAdjacentHTML('afterend', extra);
  const join = $('#join-title', root), joinSec = join && join.closest('section');
  const c = s.contact || {}, faqs = s.faqs || [];
  const bottom = `${faqs.length ? `<section class="section" aria-labelledby="faq-title"><div class="wrap split"><div><h2 class="h2" id="faq-title">Questions</h2><p class="lede" style="margin-top:1rem">Straight answers about prices, availability and privacy.</p></div><div class="faq">${faqs.map(f => `<details><summary>${esc(f.q)}${icon('plus','sm')}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div></section>` : ''}
    <section class="section surface-band" aria-labelledby="reach-title"><div class="wrap split"><div><h2 class="h2" id="reach-title">Talk to MA3AK</h2><p class="lede" style="margin-top:1rem">Questions about a plan, a provider or your budget? We’re here.</p></div>
      <ul class="contact-list" style="margin:0">${c.phone ? `<li><span class="card-ico">${icon('phone')}</span><div><small>Phone</small><a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${esc(c.phone)}</a></div></li>` : ''}${c.whatsapp ? `<li><span class="card-ico">${icon('message')}</span><div><small>WhatsApp</small><a href="https://wa.me/${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">Message us</a></div></li>` : ''}
        ${c.email ? `<li><span class="card-ico">${icon('mail')}</span><div><small>Email</small><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div></li>` : ''}${c.instagram ? `<li><span class="card-ico">${icon('instagram')}</span><div><small>Instagram</small><a href="https://www.instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener noreferrer">@${esc(c.instagram)}</a></div></li>` : ''}
        ${c.facebook ? `<li><span class="card-ico">${icon('globe')}</span><div><small>Facebook</small><a href="${esc(c.facebook)}" target="_blank" rel="noopener noreferrer">Facebook page</a></div></li>` : ''}${c.tiktok ? `<li><span class="card-ico">${icon('play')}</span><div><small>TikTok</small><a href="https://www.tiktok.com/@${esc(c.tiktok)}" target="_blank" rel="noopener noreferrer">@${esc(c.tiktok)}</a></div></li>` : ''}
        ${c.address ? `<li><span class="card-ico">${icon('pin')}</span><div><small>Where</small><span>${esc(c.address)}</span></div></li>` : ''}${c.hours ? `<li><span class="card-ico">${icon('clock')}</span><div><small>Hours</small><span>${esc(c.hours)}</span></div></li>` : ''}</ul></div></section>`;
  if (joinSec) joinSec.insertAdjacentHTML('beforebegin', bottom);
  const joinBtn = joinSec && $('a[href="#/for-vendors"]', joinSec); if (joinBtn){ joinBtn.href = '#/partner/join'; joinBtn.textContent = 'Become a partner'; }
}

/* ---------- planner: start page ---------- */
const PlannerHome = { title:'Budget planner | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Budget planner</span></nav>
    <h1 class="h1">Plan your event and see what it costs</h1><p class="lede">Tell us about your event, then add services from providers’ packages. Your total updates as you go, per-guest prices follow your guest count, and you’ll see cheaper options if you go over budget.</p></div></section>
    <section class="section tight" style="padding-top:0"><div class="wrap" id="ph-box">${Skeletons(2)}</div></section>`; },
  async mount(root, p, q){
    await Promise.all([AUTH.ready, SITE.ready]); const box = $('#ph-box', root);
    if (!AUTH.user){ box.innerHTML = `<div class="grid g-2"><div class="panel"><h2 class="h3">Your plan is saved to your account</h2><p class="muted" style="margin:.5rem 0 1.25rem">Create a free account to save plans, open them on any device, request quotes and share a link. Your plans stay private unless you share them.</p><div class="chip-row"><a class="btn btn-primary" href="#/register" data-next>Create free account</a><a class="btn btn-ghost" href="#/login" data-next>Sign in</a></div></div>
      <div class="panel"><h2 class="h3">Just exploring?</h2><p class="muted" style="margin:.5rem 0 1.25rem">Browse providers and their packages without an account, or try the 3D designer.</p><div class="chip-row"><a class="btn btn-ghost" href="#/vendors">Browse providers</a><a class="btn btn-ghost" href="#/customize">Design in 3D</a></div></div></div>`;
      $$('[data-next]', box).forEach(a => a.addEventListener('click', () => sessionStorage.setItem('ma3ak:next', '#/plan' + (q.toString() ? '?' + q.toString() : ''))));
      return; }
    let plans = []; try { plans = (await apiU('GET', '/api/events')).events; } catch(e){}
    const pre = { name:'', eventType:q.get('event') || '', theme:q.get('theme') || '', wanted:[] };
    box.innerHTML = `<div class="plan-start">
      <form class="panel form" id="np" novalidate><h2 class="h3">Start a new plan</h2>${planFields(pre, 'np')}<button class="btn btn-primary" type="submit">${icon('plus','sm')}Create my plan</button></form>
      <div><h2 class="h3" style="margin-bottom:.8rem">Your plans</h2>${plans.length ? plans.map(PlanRow).join('') : `<p class="muted small">No plans yet. Your first one will appear here.</p>`}</div></div>`;
    const f = $('#np', box); presetWanted(f, pre.eventType, 'np'); if (!pre.eventType) $$('input[name="np-wanted"]', f).forEach(x => { x.checked = ['venue','catering','photography','decoration'].includes(x.value); });
    f.elements['np-date'].min = todayISO();
    f.elements['np-eventType'].addEventListener('change', e => presetWanted(f, e.target.value, 'np'));
    f.addEventListener('submit', async e => { e.preventDefault(); if (!validateForm(f, { 'np-name':V.req('a name for your plan'), 'np-date':x => x && x < todayISO() ? 'Choose a date in the future.' : '' })) return;
      const btn = $('[type=submit]', f); busy(btn, true, 'Creating');
      try { const r = await apiU('POST', '/api/plans', readPlanForm(f, 'np')); location.hash = `#/planner/${r.id}`; }
      catch(err){ busy(btn, false); showServerErrors(f, err, { name:'np-name', date:'np-date', guests:'np-guests', budget:'np-budget' }); toast(esc(err.message), 'alert'); } });
  } };
function PlanRow(p){
  const budget = p.budget ? ` of ${money(p.budget)}` : '', over = p.budget && p.est_low > p.budget;
  return `<a class="plan-row" href="#/planner/${esc(p.id)}"><div><b>${esc(p.name)}</b><small class="muted">${[evName(p.event_type), p.event_date && fmtDate(p.event_date), p.location && locName(p.location), p.guest_count && `${p.guest_count} guests`].filter(Boolean).map(esc).join(' · ') || 'Details not set'}</small></div>
    <div class="pr-tot"><b class="${over ? 'over' : ''}">${p.services ? `≈ ${rangeTxt(p.est_low || 0, p.est_high || 0)}` : 'No services yet'}</b><small class="muted">${p.services ? `${p.services} service${p.services === 1 ? '' : 's'}${budget}` : ''}${p.quote_items ? ` · ${p.quote_items} to quote` : ''}</small></div>
    <span class="tag ${p.status === 'finalized' ? 'gold' : ''}">${esc(STATUS_TXT[p.status] || p.status)}</span></a>`;
}

/* ---------- planner: the plan itself ---------- */
const PlannerPage = { title:'My plan | Ma3ak',
  render(){ return `<section class="page-hero plan-page"><div class="wrap" id="plan-root">${Skeletons(2)}</div></section>`; },
  async mount(root, [id]){
    await AUTH.ready; if (needAuth()) return; const box = $('#plan-root', root);
    let d, cat = null, detailsOpen = false;
    try { [d] = await Promise.all([apiU('GET', `/api/events/${id}/plan`), VENDORS_READY, SITE.ready]); }
    catch(err){ box.innerHTML = EmptyState({ iconName:'alert', level:'h1', title:err.status === 404 ? 'Plan not found' : 'Your plan didn’t load', text:esc(err.message), actions:`<a class="btn btn-primary" href="#/dashboard">My plans</a>` }); return; }
    const can = d.role === 'owner' || d.role === 'editor';
    detailsOpen = !d.services.length && can;
    const P = () => d.plan, guests = () => P().guests || 0;
    const set = r => { d = r; paint(); };
    const call = async (m, path, body) => { try { set(await apiU(m, path, body)); return true; } catch(err){ if (err.status === 409){ toast('This plan changed on another device. Reloading…', 'info'); set(await apiU('GET', `/api/events/${id}/plan`)); } else toast(esc(err.message), 'alert'); return false; } };
    // cheaper packages from other providers in the same category, computed with the same rules as the server
    const alternatives = line => {
      if (line.lineLow == null) return [];
      const out = [];
      VENDORS.filter(v => v.category === line.category).forEach(v => (v.packages || []).forEach(p => { if (p.price == null || p.id === line.packageId) return;
        const q = p.unit === 'per_guest' ? guests() : p.unit === line.unit ? line.qty : p.unit === 'flat' ? 1 : (p.minQty || 1), tot = p.price * q;
        if (tot < line.lineLow && (p.unit !== 'per_guest' || guests())) out.push({ v, p, tot, save:line.lineLow - tot }); }));
      return out.sort((a, b) => a.tot - b.tot).slice(0, 4);
    };
    const lineHtml = l => { const alts = can ? alternatives(l) : [], v = VENDORS.find(x => x.id === l.vendorId);
      const qty = l.unit === 'flat' ? '' : `<label class="pl-q"><span>${l.unit === 'per_guest' ? 'Guests' : l.unit === 'per_hour' ? 'Hours' : 'Qty'}</span><input class="input" type="number" min="1" inputmode="numeric" value="${l.qty || ''}" data-qty="${esc(l.id)}"${can ? '' : ' disabled'}></label>${l.unit === 'per_guest' && !l.followsGuests && can ? `<button class="link tiny" type="button" data-follow="${esc(l.id)}">Use guest count</button>` : ''}`;
      return `<div class="pl-line${l.lineLow == null ? ' quote' : ''}" data-line="${esc(l.id)}">
        <div class="pl-info"><b>${esc(l.label)}</b><small>${v ? `<a class="link" href="#/vendor/${esc(v.id)}">${esc(l.vendorName)}</a>` : esc(l.vendorName || (l.source === 'custom' ? 'Your own estimate' : ''))}${l.isDemo ? ' <span class="tag demo-tag">Demo</span>' : ''}</small>
          <small class="muted">${esc(priceTxt(l.unitPrice, l.priceMax, l.unit))}${l.note ? ` · ${esc(l.note)}` : ''}</small>
          ${l.currentPrice && can ? `<p class="pl-warn">${icon('info','sm')}The provider changed this price to ${esc(priceTxt(l.currentPrice.price, l.currentPrice.priceMax, l.unit))}. <button class="link" type="button" data-refresh="${esc(l.id)}">Update</button></p>` : ''}
          ${!l.available ? `<p class="pl-warn">${icon('alert','sm')}This package is no longer listed.</p>` : ''}</div>
        <div class="pl-qty">${qty}</div>
        <div class="pl-total">${l.lineLow == null ? `<span class="tag">Quote needed</span>` : `<b>${rangeTxt(l.lineLow, l.lineHigh)}</b>`}</div>
        <div class="pl-acts">${alts.length ? `<button class="btn btn-ghost btn-sm" type="button" data-alts="${esc(l.id)}">${icon('wallet','sm')}Save up to ${money(alts[0].save)}</button>` : ''}${v ? `<button class="btn btn-ghost btn-sm" type="button" data-quote="${esc(l.id)}">${icon('send','sm')}${l.lineLow == null ? 'Request quote' : 'Ask for a quote'}</button>` : ''}${can ? `<button class="icon-btn" type="button" data-remove="${esc(l.id)}" aria-label="Remove ${esc(l.label)}">${icon('x','sm')}</button>` : ''}</div></div>`; };
    const suggestions = () => {
      const wanted = P().wanted.length ? P().wanted : (byId(EVENT_TYPES, P().eventType) || {}).services || ['venue','catering','photography','decoration'];
      const have = new Set(d.services.map(s => s.category)); if (!cat) cat = wanted.find(c => !have.has(c)) || wanted[0];
      let list = VENDORS.filter(v => v.category === cat);
      const fit = list.filter(v => (!P().location || !v.locations.length || v.locations.includes(P().location)) && (!P().eventType || !v.eventTypes.length || v.eventTypes.includes(P().eventType)) && (cat !== 'venue' || !P().guests || !v.capacity || v.capacity.max >= P().guests));
      const exact = fit.length > 0; list = (exact ? fit : list).sort((a, b) => (a.isDemo - b.isDemo) || ((a.startingPrice ?? 1e9) - (b.startingPrice ?? 1e9))).slice(0, 4);
      const est = p => p.price == null ? 'Quote needed' : `≈ ${money(p.price * (p.unit === 'per_guest' ? guests() : p.unit === 'flat' ? 1 : (p.minQty || 1)))} for your plan${p.unit === 'per_guest' && !guests() ? ' (add guests)' : ''}`;
      return `<div class="chip-scroll" role="tablist" aria-label="Service categories">${[...new Set([...wanted, ...CATEGORIES.map(c => c.id)])].filter(c => byId(CATEGORIES, c)).map(c => `<button type="button" class="chip${c === cat ? ' active' : ''}${wanted.includes(c) ? ' wanted' : ''}" data-cat="${esc(c)}" aria-pressed="${c === cat}">${have.has(c) ? icon('check','sm') : icon(byId(CATEGORIES, c).icon,'sm')}${esc(byId(CATEGORIES, c).single || byId(CATEGORIES, c).name)}</button>`).join('')}</div>
        ${list.length ? `${exact ? '' : `<p class="small muted" style="margin:.8rem 0 0">No exact match for your area or event type yet, so here are other ${esc(catName(cat).toLowerCase())}.</p>`}<div class="sugg">${list.map(v => `<article class="sugg-v"><header><div><a class="link" href="#/vendor/${esc(v.id)}"><b>${esc(v.name)}</b></a> ${vBadges(v)}<small class="muted">${esc((v.locations || []).map(locName).join(', '))}</small></div><button class="btn btn-ghost btn-sm" type="button" data-vquote="${esc(v.id)}">Ask for a quote</button></header>
          ${(v.packages || []).map(p => `<div class="pkg-row"><div><b>${esc(p.name)}</b><small>${esc(priceTxt(p.price, p.priceMax, p.unit))} · ${est(p)}</small></div>${can ? `<button class="btn btn-primary btn-sm" type="button" data-add-pkg="${esc(p.id)}">${icon('plus','sm')}Add</button>` : ''}</div>`).join('') || `<p class="small muted">No packages listed. Ask for a quote.</p>`}</article>`).join('')}</div>`
          : `<p class="muted small" style="margin-top:1rem">No ${esc(catName(cat).toLowerCase())} are listed yet. Add your own estimate below, or <a class="link" href="#/contact">ask MA3AK</a> to find options.</p>`}
        <a class="link small" href="#/search${qs({ category:cat, location:P().location || '' })}">See all ${esc(catName(cat).toLowerCase())}</a>`;
    };
    const totalsHtml = () => { const t = d.totals, b = t.budget, pct = b ? Math.min(100, Math.round(t.low / b * 100)) : 0;
      const savings = t.overBudget ? d.services.map(l => ({ l, a:alternatives(l)[0] })).filter(x => x.a).sort((x, y) => y.a.save - x.a.save).slice(0, 3) : [];
      return `<p class="small muted">Estimated total</p><p class="kpi ${t.overBudget ? 'over' : ''}">${rangeTxt(t.low, t.high)}</p>
        ${b ? `<div class="meter${t.overBudget ? ' over' : ''}" role="img" aria-label="${pct}% of budget"><i style="width:${pct}%"></i></div>` : ''}
        <dl class="tot-dl"><div><dt>Budget</dt><dd>${b ? money(b) : '<button class="link" type="button" data-edit>Set a budget</button>'}</dd></div>
          ${b ? `<div><dt>${t.remaining >= 0 ? 'Left' : 'Over by'}</dt><dd class="${t.remaining < 0 ? 'over' : 'ok'}">${money(Math.abs(t.remaining))}</dd></div>` : ''}
          ${P().guests && t.low ? `<div><dt>Per guest</dt><dd>${money(t.low / P().guests)}</dd></div>` : ''}
          <div><dt>Services</dt><dd>${t.count}</dd></div>${t.quoteItems ? `<div><dt>Waiting for a price</dt><dd>${t.quoteItems}</dd></div>` : ''}</dl>
        ${t.overBudget ? `<div class="notice danger-note">${icon('alert')}<div><b>You’re over budget.</b>${savings.length ? `<p class="small">Cheaper options:</p><ul class="save-list">${savings.map(x => `<li><span>${esc(x.l.label)} → ${esc(x.a.p.name)} (${esc(x.a.v.name)})</span><button class="btn btn-ghost btn-sm" type="button" data-swap="${esc(x.l.id)}" data-to="${esc(x.a.p.id)}">Save ${money(x.a.save)}</button></li>`).join('')}</ul>` : '<p class="small">Try removing a service, lowering a quantity, or adjusting the guest count.</p>'}</div></div>` : ''}
        ${t.overBudgetHigh && !t.overBudget ? `<p class="small muted">${icon('info','sm')}At the top of the price ranges you’d go over budget.</p>` : ''}
        ${t.needsGuests ? `<p class="notice">${icon('users')}Add your guest count so per-guest prices can be estimated.</p>` : ''}
        <p class="tiny muted" style="margin-top:1rem">Estimates from providers’ listed packages${d.services.some(s => s.isDemo) ? ' (demo listings use illustrative prices)' : ''}. Final prices and availability are confirmed by each provider in a quote.</p>
        ${can ? `<div class="stack" style="--s:.5rem;margin-top:1rem"><button class="btn btn-primary btn-block" type="button" data-send>${icon('send','sm')}Send plan to MA3AK</button><button class="btn btn-ghost btn-block" type="button" data-status>${P().status === 'finalized' ? 'Back to draft' : `${icon('check','sm')}Mark as finalized`}</button></div>` : ''}`; };
    const paint = () => {
      const p = P(), groups = {}; d.services.forEach(s => (groups[s.category] = groups[s.category] || []).push(s));
      document.title = `${p.name} | Ma3ak`;
      box.innerHTML = `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/dashboard">My plans</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
        <div class="plan-top"><div><p class="small muted">${esc(evName(p.eventType) || 'Event')} · <span class="tag ${p.status === 'finalized' ? 'gold' : ''}">${esc(STATUS_TXT[p.status] || p.status)}</span>${d.role !== 'owner' ? ` <span class="tag">${d.role === 'editor' ? 'Shared with you · can edit' : 'Shared with you · view only'}</span>` : ''}</p>
          <h1 class="h1">${esc(p.name)}</h1><p class="muted">${[p.date ? fmtDate(p.date) : 'Date not set', p.location ? locName(p.location) : 'Area not set', p.guests ? `${p.guests} guests` : 'Guests not set', p.theme, p.setting && { indoor:'Indoor', outdoor:'Outdoor', both:'Indoor & outdoor' }[p.setting]].filter(Boolean).map(esc).join(' · ')}</p></div>
          <div class="chip-row">${can ? `<button class="btn btn-ghost btn-sm" type="button" data-edit>${icon('sliders','sm')}Edit details</button>` : ''}${d.role === 'owner' ? `<button class="btn btn-ghost btn-sm" type="button" data-share>${icon('share','sm')}Share</button>` : ''}<a class="btn btn-ghost btn-sm" href="#/studio/${esc(p.id)}">${icon('layers','sm')}3D design</a><button class="btn btn-ghost btn-sm" type="button" data-print>${icon('file','sm')}Print / PDF</button></div></div>
        <div class="plan-layout"><div class="plan-main">
          ${can ? `<details class="panel plan-details" id="pd"${detailsOpen ? ' open' : ''}><summary><h2 class="h3">Event details</h2><span class="small muted">Change anything; totals update</span></summary><form class="form" id="pd-form" novalidate style="margin-top:1rem">${planFields(p, 'pd')}<div class="chip-row"><button class="btn btn-primary" type="submit">Save details</button><span class="small muted" id="pd-saved" role="status"></span></div></form></details>` : ''}
          <section class="panel"><div class="tile-h"><h2 class="h3">Services in your plan</h2><span class="small muted">${d.services.length} item${d.services.length === 1 ? '' : 's'}</span></div>
            ${d.services.length ? Object.entries(groups).map(([c, ls]) => `<div class="pl-group"><h3 class="pl-cat">${icon((byId(CATEGORIES, c) || {}).icon || 'more','sm')}${esc(catName(c) || c)}</h3>${ls.map(lineHtml).join('')}</div>`).join('') : `<p class="muted" style="margin-top:.8rem">Nothing yet. Pick a category below and add packages from providers, or add your own estimate.</p>`}</section>
          ${can ? `<section class="panel" id="add-sec"><h2 class="h3">Add services</h2><p class="small muted" style="margin:.3rem 0 1rem">Providers that match your area, event type and guest count come first.</p><div id="sugg">${suggestions()}</div>
            <details class="custom-add"><summary>${icon('plus','sm')}Add your own item or estimate</summary><form class="form" id="ci-form" novalidate style="margin-top:1rem"><div class="form-row">${FormField({ id:'ci-label', label:'What is it?', required:true, placeholder:'e.g. Wedding favours' })}${FormField({ id:'ci-cat', label:'Category', options:opt(CATEGORIES), required:true, value:cat || '' })}</div>
              <div class="form-row">${FormField({ id:'ci-price', label:'Price (USD)', type:'number', inputmode:'numeric', hint:'Leave empty if you don’t know yet.' })}${FormField({ id:'ci-unit', label:'Priced', options:Object.entries(UNIT_NAMES).map(([value, label]) => ({ value, label })), value:'flat', showOpt:false })}</div>
              ${FormField({ id:'ci-qty', label:'Quantity', type:'number', inputmode:'numeric', hint:'Per-guest items follow your guest count if left empty.' })}<button class="btn btn-ghost" type="submit">Add to plan</button></form></details></section>` : ''}
          <section class="panel"><h2 class="h3">Private notes</h2><p class="small muted" style="margin:.3rem 0 .8rem">Only you can see these. They’re never included in share links.</p>
            ${d.role === 'owner' ? `<textarea class="textarea" id="pl-notes" rows="4" maxlength="5000" placeholder="Ideas, contacts, reminders…">${esc(p.notes || '')}</textarea>` : `<p class="muted small">Notes are private to the plan owner.</p>`}</section>
        </div><aside class="plan-side"><div class="panel totals" id="totals">${totalsHtml()}</div></aside></div>`;
      const f = $('#pd-form', box); if (f){ f.elements['pd-date'].min = ''; $('#pd', box).addEventListener('toggle', e => { detailsOpen = e.target.open; }); }
    };
    paint();

    const savePlan = async (patch, msg) => { const p = P(); return call('PUT', `/api/events/${id}/plan`, { name:p.name, eventType:p.eventType || '', date:p.date || '', location:p.location || '', guests:p.guests, budget:p.budget, theme:p.theme || '', setting:p.setting || '', wanted:p.wanted, notes:p.notes, requirements:p.requirements, rev:p.rev, ...patch }).then(ok => { if (ok && msg) toast(msg); return ok; }); };
    box.addEventListener('submit', async e => {
      if (e.target.id === 'pd-form'){ e.preventDefault(); const f = e.target; if (!validateForm(f, { 'pd-name':V.req('a name') })) return; const ok = await savePlan(readPlanForm(f, 'pd')); if (ok){ detailsOpen = false; paint(); toast('Details saved'); } }
      if (e.target.id === 'ci-form'){ e.preventDefault(); const f = e.target; if (!validateForm(f, { 'ci-label':V.req('what it is'), 'ci-cat':V.select('a category') })) return;
        const g = k => f.elements[k].value.trim(); const ok = await call('POST', `/api/events/${id}/services`, { label:g('ci-label'), category:g('ci-cat'), unitPrice:g('ci-price') === '' ? null : +g('ci-price'), unit:g('ci-unit') || 'flat', quantity:g('ci-qty') === '' ? null : +g('ci-qty') }); if (ok) toast('Added to your plan'); }
    });
    box.addEventListener('change', async e => {
      const q = e.target.closest('[data-qty]'); if (q){ const n = Math.round(+q.value); if (!n || n < 1){ toast('Enter a quantity of at least 1', 'alert'); paint(); return; } await call('PATCH', `/api/events/${id}/services/${q.dataset.qty}`, { quantity:n }); return; }
      if (e.target.id === 'pl-notes'){ const ok = await savePlan({ notes:e.target.value }); if (ok) toast('Notes saved'); return; }
      if (e.target.id === 'pd-eventType'){ presetWanted($('#pd-form', box), e.target.value, 'pd'); }
    });
    box.addEventListener('click', async e => {
      const t = e.target.closest('button,[data-cat]'); if (!t) return;
      if (t.matches('[data-edit]')){ detailsOpen = true; paint(); const el = $('#pd', box); if (el) el.scrollIntoView({ block:'start' }); return; }
      if (t.matches('[data-cat]')){ cat = t.dataset.cat; $('#sugg', box).innerHTML = suggestions(); const ci = $('#ci-cat', box); if (ci) ci.value = cat; return; }
      if (t.matches('[data-add-pkg]')){ t.disabled = true; const ok = await call('POST', `/api/events/${id}/services`, { packageId:t.dataset.addPkg }); if (ok) toast('Added to your plan'); return; }
      if (t.matches('[data-remove]')){ const l = d.services.find(s => s.id === t.dataset.remove); if (await call('DELETE', `/api/events/${id}/services/${t.dataset.remove}`)) toast(`Removed ${esc(l ? l.label : 'item')}`); return; }
      if (t.matches('[data-follow]')){ await call('PATCH', `/api/events/${id}/services/${t.dataset.follow}`, { quantity:null }); return; }
      if (t.matches('[data-refresh]')){ if (await call('PATCH', `/api/events/${id}/services/${t.dataset.refresh}`, { refreshPrice:true })) toast('Price updated'); return; }
      if (t.matches('[data-swap]')){ if (await call('POST', `/api/events/${id}/services`, { packageId:t.dataset.to, replace:t.dataset.swap })) { closeModal(); toast('Swapped to the cheaper option'); } return; }
      if (t.matches('[data-alts]')){ const l = d.services.find(s => s.id === t.dataset.alts), alts = alternatives(l);
        openModal({ title:'Cheaper options', body:`<p class="small muted" style="margin-bottom:1rem">Instead of <b>${esc(l.label)}</b> (${rangeTxt(l.lineLow, l.lineHigh)}). Estimates for your plan.</p><div class="pick-ev">${alts.map(a => `<div class="pkg-row"><div><b>${esc(a.p.name)}</b><small>${esc(a.v.name)}${a.v.isDemo ? ' · demo' : ''} · ${esc(priceTxt(a.p.price, a.p.priceMax, a.p.unit))} · ≈ ${money(a.tot)}</small></div><button class="btn btn-primary btn-sm" type="button" data-swap="${esc(l.id)}" data-to="${esc(a.p.id)}">Save ${money(a.save)}</button></div>`).join('')}</div>`,
          onMount(m){ m.addEventListener('click', async ev => { const b = ev.target.closest('[data-swap]'); if (!b) return; b.disabled = true; if (await call('POST', `/api/events/${id}/services`, { packageId:b.dataset.to, replace:b.dataset.swap })) { closeModal(); toast('Swapped to the cheaper option'); } }); } }); return; }
      if (t.matches('[data-quote]')){ const l = d.services.find(s => s.id === t.dataset.quote), v = VENDORS.find(x => x.id === l.vendorId); if (v) openQuoteModal(v, (v.packages || []).find(p => p.id === l.packageId), { planId:id }); return; }
      if (t.matches('[data-vquote]')){ const v = VENDORS.find(x => x.id === t.dataset.vquote); if (v) openQuoteModal(v, null, { planId:id }); return; }
      if (t.matches('[data-status]')){ const fin = P().status !== 'finalized'; if (await savePlan({ status:fin ? 'finalized' : 'draft' })) toast(fin ? 'Plan marked as finalized' : 'Plan is a draft again'); return; }
      if (t.matches('[data-share]')) return openShareModal(id);
      if (t.matches('[data-print]')) return printPlan(d);
      if (t.matches('[data-send]')) return sendPlanToTeam(d);
    });
  } };

async function openShareModal(id){
  const load = () => apiU('GET', `/api/events/${id}/shares`);
  let d; try { d = await load(); } catch(err){ toast(esc(err.message), 'alert'); return; }
  const rows = () => d.shares.filter(s => !s.revoked && (!s.expires_at || s.expires_at > new Date().toISOString()));
  openModal({ title:'Share this plan', body:`<p class="small muted" style="margin-bottom:1rem">People with the link see the plan, the services and the estimated totals. They never see your email, phone or private notes. Links are off until you create one, and you can turn them off any time.</p>
    <div id="sh-list"></div><div class="chip-row" style="margin-top:1rem"><button class="btn btn-primary" type="button" data-mk="view">${icon('eye','sm')}Create view-only link</button><button class="btn btn-ghost" type="button" data-mk="edit">${icon('users','sm')}Invite someone to edit</button></div><div id="sh-new" style="margin-top:1rem"></div>`,
    onMount(m){
      const paintList = () => { $('#sh-list', m).innerHTML = rows().length ? rows().map(s => `<div class="sh-row"><span class="small">${s.permission === 'edit' ? 'Can edit' : 'View only'} · ${s.views} view${s.views === 1 ? '' : 's'} · until ${fmtDate(s.expires_at.slice(0, 10))}</span><button class="link" type="button" data-off="${esc(s.id)}">Turn off</button></div>`).join('') : '<p class="small muted">No active links.</p>'; };
      paintList();
      m.addEventListener('click', async e => {
        const mk = e.target.closest('[data-mk]'); if (mk){ try { const r = await apiU('POST', `/api/events/${id}/shares`, { permission:mk.dataset.mk, days:30 }); d = await load(); paintList();
          $('#sh-new', m).innerHTML = `<label class="small muted" for="sh-url">Copy this link (shown once):</label><div class="chip-row"><input class="input" id="sh-url" readonly value="${esc(r.share.url)}"><button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(r.share.url)}">${icon('copy','sm')}Copy</button></div>`; $('#sh-url', m).select(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
        const off = e.target.closest('[data-off]'); if (off){ try { await apiU('DELETE', `/api/events/${id}/shares/${off.dataset.off}`); d = await load(); paintList(); toast('Link turned off'); } catch(err){ toast(esc(err.message), 'alert'); } }
      });
    } });
}
function planText(d){
  const p = d.plan, lines = d.services.map(s => `• ${catName(s.category) || s.category}: ${s.label}${s.vendorName ? ` (${s.vendorName}${s.isDemo ? ', demo listing' : ''})` : ''} — ${s.lineLow == null ? 'quote needed' : rangeTxt(s.lineLow, s.lineHigh)}${s.unit !== 'flat' ? ` [${s.qty} × ${priceTxt(s.unitPrice, s.priceMax, s.unit)}]` : ''}`);
  return [`Plan: ${p.name}`, `Event: ${evName(p.eventType) || 'not set'} · Date: ${p.date || 'not set'} · Area: ${p.location ? locName(p.location) : 'not set'} · Guests: ${p.guests || 'not set'}`, `Budget: ${p.budget ? money(p.budget) : 'not set'} · Theme: ${p.theme || '—'} · Setting: ${p.setting || '—'}`,
    p.requirements ? `Special requirements: ${p.requirements}` : '', '', 'SERVICES', ...lines, '', `Estimated total: ${rangeTxt(d.totals.low, d.totals.high)}${d.totals.quoteItems ? ` + ${d.totals.quoteItems} item(s) awaiting a quote` : ''}`].filter(x => x !== null).join('\n');
}
function sendPlanToTeam(d){
  const u = AUTH.user, p = d.plan;
  openModal({ title:'Send your plan to MA3AK', body:`<p class="small muted" style="margin-bottom:1rem">The team reviews your plan, checks providers’ availability and comes back to you. Nothing is booked or charged until you agree.</p>
    <form class="form" id="sp-form" novalidate><div class="form-row">${FormField({ id:'sp-name', label:'Your name', required:true, value:u.name || '' })}${FormField({ id:'sp-phone', label:'Phone', type:'tel', value:u.phone || '', hint:'So the team can call or WhatsApp you.' })}</div>
      ${p.eventType ? '' : FormField({ id:'sp-type', label:'Event type', options:opt(EVENT_TYPES), required:true })}
      ${FormField({ id:'sp-msg', label:'Anything to add?', type:'textarea' })}${HONEYPOT}${ConsentField('sp-consent')}
      <button class="btn btn-primary btn-block" type="submit">${icon('send','sm')}Send to MA3AK</button></form>`,
    onMount(m){ const f = $('#sp-form', m); stampForm(f);
      f.addEventListener('submit', async e => { e.preventDefault(); const rules = { 'sp-name':V.req('your name'), 'sp-phone':V.phoneOpt }; if (f.elements['sp-type']) rules['sp-type'] = V.select('the event type');
        if (!validateForm(f, rules) || !consentOk(f, 'sp-consent')) return; const btn = $('[type=submit]', f); busy(btn, true);
        const g = k => f.elements[k] ? f.elements[k].value.trim() : '', type = p.eventType || g('sp-type');
        try { const r = await apiPost('/api/requests', { contact:{ fullName:g('sp-name'), phone:g('sp-phone'), email:u.email }, choices:{ eventType:type, eventName:p.name, date:p.date || '', guests:p.guests || 0, budget:p.budget || 0, style:p.theme ? [p.theme] : [] }, text:planText(d) + (g('sp-msg') ? `\n\nMessage: ${g('sp-msg')}` : ''), eventId:p.id, consent:true, ...formMeta(f) });
          $('.modal-body', m).innerHTML = sentPanel({ title:'Plan sent', text:'Thanks! The MA3AK team has your plan and will contact you.', refNo:r.ref }); }
        catch(err){ busy(btn, false); showServerErrors(f, err, { fullName:'sp-name', phone:'sp-phone', eventType:'sp-type' }); toast(esc(err.message), 'alert'); } }); } });
}
function printPlan(d){
  const p = d.plan, w = document.createElement('div'); w.className = 'print-sheet';
  w.innerHTML = `<header><div class="print-logo">${Logo({ tag:'span', label:false })}</div><h1>${esc(p.name)}</h1><p>${[evName(p.eventType), p.date && fmtDate(p.date), p.location && locName(p.location), p.guests && `${p.guests} guests`, p.budget && `Budget ${money(p.budget)}`].filter(Boolean).map(esc).join('  ·  ')}</p></header>
    <table><tr><th>Service</th><th>Provider</th><th>Price</th><th>Qty</th><th>Estimate</th></tr>${d.services.map(s => `<tr><td>${esc(s.label)}</td><td>${esc(s.vendorName || '')}${s.isDemo ? ' (demo)' : ''}</td><td>${esc(priceTxt(s.unitPrice, s.priceMax, s.unit))}</td><td>${s.unit === 'flat' ? '' : s.qty}</td><td>${s.lineLow == null ? 'Quote' : esc(rangeTxt(s.lineLow, s.lineHigh))}</td></tr>`).join('')}
      <tr><th colspan="4">Estimated total</th><th>${esc(rangeTxt(d.totals.low, d.totals.high))}</th></tr></table>
    <p>Prices are estimates from providers’ listed packages. Final prices and availability are confirmed by each provider.</p><footer>MA3AK · ${esc(CONFIG.email)} · ${esc(CONFIG.phone)} · Printed ${fmtDate(new Date())}</footer>`;
  document.body.appendChild(w); document.body.classList.add('printing'); setTimeout(() => { window.print(); setTimeout(() => { w.remove(); document.body.classList.remove('printing'); }, 500); }, 200);
}

/* ---------- dashboard: plans, quotes, favourites ---------- */
const PlansDashboard = { title:'My plans | Ma3ak',
  render(){ return `<section class="page-hero dash-hero"><div class="wrap"><div id="dash"></div></div></section>`; },
  async mount(root, p, q){
    await AUTH.ready; if (needAuth()) return; const box = $('#dash', root), u = AUTH.user;
    if (u.role === 'partner' && !q.get('tab')) { box.innerHTML = `<p class="notice">${icon('store')}<span>You’re signed in with a provider account. <a class="link" href="#/partner">Open your partner page</a></span></p>`; }
    box.insertAdjacentHTML('beforeend', `<div class="dash-top"><div><p class="muted small">Welcome back</p><h1 class="h1">${esc((u.name || '').split(' ')[0] || 'there')}</h1></div><div class="chip-row"><a class="btn btn-primary" href="#/plan">${icon('plus','sm')}New plan</a><a class="btn btn-ghost" href="#/account">${icon('users','sm')}Account</a></div></div>
      ${!u.verified ? `<p class="notice">${icon('mail')}<span>Please confirm your email. <button class="link" id="resend" type="button">Send the link again</button></span></p>` : ''}
      <div class="dash-tabs chip-row" role="tablist"><button class="chip" data-dt="plans">My plans</button><button class="chip" data-dt="shared">Shared with me</button><button class="chip" data-dt="quotes">${icon('send','sm')}Quotes</button><button class="chip" data-dt="fav">${icon('heart','sm')}Favourites</button></div><div id="dash-list">${Skeletons(3)}</div>`);
    let data = null, favs = [], quotes = null; await VENDORS_READY;
    const list = () => $('#dash-list', box);
    const paint = tab => { $$('[data-dt]', box).forEach(x => x.classList.toggle('active', x.dataset.dt === tab)); const el = list();
      if (tab === 'plans' || tab === 'shared'){ const evs = tab === 'shared' ? data.shared : data.events;
        el.innerHTML = evs.length ? `<div class="plan-list">${evs.map(e => `<div class="plan-card">${PlanRow(e)}<div class="chip-row pc-acts"><a class="btn btn-ghost btn-sm" href="#/planner/${esc(e.id)}">${icon('wallet','sm')}Budget plan</a><a class="btn btn-ghost btn-sm" href="#/studio/${esc(e.id)}">${icon('layers','sm')}3D design</a>${tab === 'plans' ? `<button class="icon-btn" data-dup="${esc(e.id)}" aria-label="Duplicate ${esc(e.name)}">${icon('copy','sm')}</button><button class="icon-btn" data-del="${esc(e.id)}" aria-label="Delete ${esc(e.name)}">${icon('x','sm')}</button>` : ''}</div></div>`).join('')}</div>`
          : tab === 'shared' ? EmptyState({ iconName:'users', title:'Nothing shared with you yet', text:'When someone invites you to their plan, it appears here.' }) : EmptyState({ iconName:'wallet', title:'Start your first plan', text:'Add your event details and budget, then pick services from providers.', actions:`<a class="btn btn-primary" href="#/plan">${icon('plus','sm')}New plan</a>` });
        return; }
      if (tab === 'quotes'){ if (!quotes){ el.innerHTML = Skeletons(2); apiU('GET', '/api/my/quotes').then(r => { quotes = r.quotes; paint('quotes'); }).catch(err => { el.innerHTML = EmptyState({ iconName:'alert', title:'Quotes didn’t load', text:esc(err.message) }); }); return; }
        el.innerHTML = quotes.length ? `<div class="plan-list">${quotes.map(qq => `<article class="q-card"><header><div><b>${esc(qq.vendor_name)}</b>${qq.is_demo ? ' <span class="tag demo-tag">Demo</span>' : ''}<small class="muted">${esc(qq.ref)}${qq.package_name ? ` · ${esc(qq.package_name)}` : ''} · sent ${fmtDate(qq.created_at.slice(0, 10))}${qq.event_date ? ` · for ${fmtDate(qq.event_date)}` : ''}</small></div><span class="tag ${['quoted','replied','accepted'].includes(qq.status) ? 'gold' : ''}">${esc(QUOTE_TXT[qq.status] || qq.status)}</span></header>
          ${qq.quoted_amount != null ? `<p class="kpi" style="font-size:1.4rem">${money(qq.quoted_amount)}</p>` : ''}${qq.reply ? `<p class="q-reply">${esc(qq.reply)}</p>` : `<p class="small muted">No reply yet.</p>`}${qq.event_id ? `<a class="link small" href="#/planner/${esc(qq.event_id)}">Open the linked plan</a>` : ''}</article>`).join('')}</div>`
          : EmptyState({ iconName:'send', title:'No quote requests yet', text:'Ask a provider for a quote from their profile or from your plan. Replies appear here.', actions:`<a class="btn btn-ghost" href="#/vendors">Browse providers</a>` }); return; }
      if (tab === 'fav'){ const vs = favs.filter(f => f.startsWith('v:')).map(f => VENDORS.find(v => v.id === f.slice(2))).filter(Boolean), items = typeof GAME !== 'undefined' ? Object.values(GAME.CARDS).flat().filter(c => favs.includes(c.id)) : [];
        el.innerHTML = `${vs.length ? `<h2 class="h3" style="margin:1rem 0">Providers</h2><div class="grid g-3 results-grid">${vs.map(VendorCard).join('')}</div>` : EmptyState({ iconName:'heart', title:'No favourite providers yet', text:'Tap “Save” on a provider’s profile to keep them here.', actions:`<a class="btn btn-ghost" href="#/vendors">Browse providers</a>` })}
          ${items.length ? `<h2 class="h3" style="margin:2rem 0 1rem">3D designer items</h2><div class="fav-grid">${items.map(c => `<div class="fav-it">${icon('heart','sm')}<b>${esc(c.label)}</b></div>`).join('')}</div>` : ''}`; }
    };
    const load = async () => { [data, favs] = await Promise.all([apiU('GET', '/api/events'), apiU('GET', '/api/favorites').then(r => r.items).catch(() => [])]); paint(q.get('tab') || 'plans'); };
    try { await load(); } catch(err){ list().innerHTML = EmptyState({ iconName:'alert', title:'Your plans didn’t load', text:esc(err.message) }); }
    box.addEventListener('click', async e => {
      const t = e.target.closest('[data-dt]'); if (t){ history.replaceState(null, '', `#/dashboard?tab=${t.dataset.dt}`); paint(t.dataset.dt); return; }
      const d = e.target.closest('[data-dup]'); if (d){ try { await apiU('POST', `/api/events/${d.dataset.dup}/duplicate`); toast('Plan duplicated'); load(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      const x = e.target.closest('[data-del]'); if (x){ openModal({ title:'Delete this plan?', body:`<p class="muted">This permanently deletes the plan, its services, 3D design and history.</p><div class="chip-row" style="margin-top:1.25rem"><button class="btn btn-primary" id="cd">Delete plan</button><button class="btn btn-ghost" data-close>Keep it</button></div>`, onMount(m){ $('#cd', m).onclick = async () => { try { await apiU('DELETE', `/api/events/${x.dataset.del}`); closeModal(); toast('Plan deleted'); load(); } catch(err){ toast(esc(err.message), 'alert'); } }; } }); return; }
      if (e.target.closest('#resend')){ try { const r = await apiU('POST', '/api/auth/resend-verification'); toast(r.sent ? 'Link sent. Check your email.' : 'Email isn’t set up yet on our side. You can keep planning.'); } catch(err){ toast(esc(err.message), 'alert'); } }
    });
  } };

/* ---------- partner sign-up ---------- */
const PartnerJoin = { title:'Become a partner | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap split"><div><nav class="crumbs" aria-label="Breadcrumb"><a href="#/for-vendors">For providers</a><span aria-hidden="true">/</span><span aria-current="page">Become a partner</span></nav>
    <h1 class="h1">List your services on MA3AK</h1><p class="lede">Create a partner account, add your packages, prices and photos, and send your listing for review. MA3AK checks every listing before it goes live.</p>
    <ol class="chain" style="margin-top:2rem"><li><div><b>Create your account</b><span>Your listing starts as a private draft.</span></div></li><li><div><b>Build your profile</b><span>Areas you serve, packages with prices (or “request a quote”), photos.</span></div></li><li><div><b>Submit for review</b><span>We check it and publish it. You can still edit it after.</span></div></li><li><div><b>Answer quote requests</b><span>Customers send requests with their date and guest count.</span></div></li></ol></div>
    <div id="pj-box" class="panel">${Skeletons(1)}</div></div></section>`; },
  async mount(root){
    await AUTH.ready; const box = $('#pj-box', root), u = AUTH.user;
    if (u && u.role === 'partner'){ location.hash = '#/partner'; return; }
    const cats = opt(CATEGORIES, 'id', 'single');
    box.innerHTML = u ? `<form class="form" id="pj-form" novalidate><h2 class="h3">Turn your account into a partner account</h2><p class="small muted">Signed in as ${esc(u.email)}. Your saved plans stay as they are.</p>
        ${FormField({ id:'pj-business', label:'Business name', required:true, autocomplete:'organization' })}<div class="form-row">${FormField({ id:'pj-category', label:'Main category', options:cats, required:true })}${FormField({ id:'pj-phone', label:'Business phone', type:'tel', required:true, value:u.phone || '' })}</div>
        <label class="check"><input type="checkbox" id="pj-consent"> I agree to the <a class="link" href="#/terms" target="_blank">Terms</a> and confirm I may list this business.</label><p class="err" id="pj-err" role="alert"></p><button class="btn btn-primary btn-block" type="submit">Create partner profile</button></form>`
      : `<form class="form" id="pj-form" novalidate><h2 class="h3">Create your partner account</h2>
        <div class="form-row">${FormField({ id:'pj-name', label:'Your name', required:true, autocomplete:'name' })}${FormField({ id:'pj-business', label:'Business name', required:true, autocomplete:'organization' })}</div>
        <div class="form-row">${FormField({ id:'pj-category', label:'Main category', options:cats, required:true })}${FormField({ id:'pj-phone', label:'Business phone', type:'tel', required:true, autocomplete:'tel' })}</div>
        ${FormField({ id:'pj-email', label:'Email', type:'email', required:true, autocomplete:'email' })}${FormField({ id:'pj-password', label:'Password', type:'password', required:true, autocomplete:'new-password', hint:'At least 12 characters, with letters and numbers.' })}${HONEYPOT}
        <label class="check"><input type="checkbox" id="pj-consent"> I agree to the <a class="link" href="#/privacy" target="_blank">Privacy Policy</a> and <a class="link" href="#/terms" target="_blank">Terms</a>, and confirm I may list this business.</label>
        <p class="err" id="pj-err" role="alert"></p><button class="btn btn-primary btn-block" type="submit">Create partner account</button><p class="small muted">Already a partner? <a class="link" href="#/login" data-next>Sign in</a></p></form>`;
    const f = $('#pj-form', box); stampForm(f); const ln = $('[data-next]', f); if (ln) ln.addEventListener('click', () => sessionStorage.setItem('ma3ak:next', '#/partner'));
    f.addEventListener('submit', async e => { e.preventDefault();
      const rules = { 'pj-business':V.req('your business name'), 'pj-category':V.select('a category'), 'pj-phone':V.phoneReq }; if (!u) Object.assign(rules, { 'pj-name':V.req('your name'), 'pj-email':V.email, 'pj-password':x => x.length >= 12 ? '' : 'Use at least 12 characters.' });
      if (!validateForm(f, rules)) return; if (!$('#pj-consent', f).checked){ $('#pj-err', f).textContent = 'Please accept to continue.'; return; }
      const btn = $('[type=submit]', f); busy(btn, true, 'Creating'); const g = k => f.elements[k] ? f.elements[k].value.trim() : '';
      try { if (u) await apiU('POST', '/api/partner/upgrade', { businessName:g('pj-business'), category:g('pj-category'), phone:g('pj-phone'), consent:true });
        else { const r = await apiU('POST', '/api/partner/register', { name:g('pj-name'), businessName:g('pj-business'), category:g('pj-category'), phone:g('pj-phone'), email:g('pj-email'), password:f.elements['pj-password'].value, consent:true, company_site:f.elements.company_site.value }); AUTH.user = r.user; paintAccountBtn(); }
        await loadMe(); location.hash = '#/partner'; }
      catch(err){ busy(btn, false); showServerErrors(f, err, { name:'pj-name', businessName:'pj-business', category:'pj-category', phone:'pj-phone', email:'pj-email', password:'pj-password' }); $('#pj-err', f).textContent = err.message; } });
  } };

/* ---------- partner portal ---------- */
const PartnerPortal = { title:'Partner | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap" id="pp">${Skeletons(2)}</div></section>`; },
  async mount(root, p, q){
    await AUTH.ready; if (needAuth()) return; const box = $('#pp', root);
    if (AUTH.user.role !== 'partner'){ box.innerHTML = EmptyState({ iconName:'store', level:'h1', title:'This page is for providers', text:'Turn your account into a partner account to list your services.', actions:`<a class="btn btn-primary" href="#/partner/join">Become a partner</a>` }); return; }
    let d, tab = q.get('tab') || 'overview', editPkg = null;
    const load = async () => { d = await apiU('GET', '/api/partner'); };
    try { await load(); } catch(err){ box.innerHTML = EmptyState({ iconName:'alert', level:'h1', title:'Your partner page didn’t load', text:esc(err.message) }); return; }
    const STATUS = { draft:['Draft','Not public yet. Complete your profile and submit it for review.'], pending:['Waiting for review','MA3AK is reviewing your listing. You can keep editing.'], approved:['Live','Your listing is approved.'], rejected:['Needs changes','MA3AK didn’t approve the listing yet. See the note below, update it and submit again.'] };
    const live = () => d.vendor.status === 'approved' && d.vendor.active;
    const steps = () => { const v = d.vendor; return [['Profile and description', v.description && v.description.length >= 20 && v.locations.length], ['Contact details', v.phone || v.email], ['At least one package', v.packages.some(x => x.active)], ['Photos (recommended)', v.photos.length > 0], ['Submitted for review', ['pending','approved'].includes(v.status)]]; };
    const pkgForm = pk => `<form class="form panel" id="pk-form" novalidate data-id="${esc(pk ? pk.id : 'new')}"><h3 class="h3">${pk ? 'Edit package' : 'New package'}</h3>
      <div class="form-row">${FormField({ id:'pk-name', label:'Name', required:true, value:pk ? pk.name : '', placeholder:'e.g. Full wedding day' })}${FormField({ id:'pk-unit', label:'Priced', options:Object.entries(UNIT_NAMES).map(([value, label]) => ({ value, label })), value:pk ? pk.unit : 'flat', showOpt:false })}</div>
      <div class="form-row">${FormField({ id:'pk-price', label:'Price from (USD)', type:'number', inputmode:'numeric', value:pk && pk.price != null ? pk.price : '', hint:'Leave empty to show “Request a quote”.' })}${FormField({ id:'pk-max', label:'Up to (USD)', type:'number', inputmode:'numeric', value:pk && pk.priceMax != null ? pk.priceMax : '', hint:'Optional, for a price range.' })}</div>
      ${FormField({ id:'pk-desc', label:'Description', type:'textarea', value:pk ? pk.description : '' })}${FormField({ id:'pk-inc', label:'What’s included (one per line)', type:'textarea', value:pk ? (pk.includes || []).join('\n') : '' })}
      <div class="form-row">${FormField({ id:'pk-min', label:'Minimum quantity', type:'number', inputmode:'numeric', value:pk && pk.minQty != null ? pk.minQty : '', hint:'For per-hour or per-item prices.' })}<label class="check" style="align-self:end"><input type="checkbox" id="pk-active"${!pk || pk.active ? ' checked' : ''}> Show this package</label></div>
      <div class="chip-row"><button class="btn btn-primary" type="submit">Save package</button><button class="btn btn-ghost" type="button" data-pk-cancel>Cancel</button></div></form>`;
    const paint = () => { const v = d.vendor, [st, stText] = STATUS[v.status] || [v.status, ''], newQ = d.quotes.filter(x => x.status === 'new').length;
      box.innerHTML = `<div class="dash-top"><div><p class="muted small">Partner page</p><h1 class="h1">${esc(v.name)}</h1><p class="small"><span class="tag ${live() ? 'gold' : ''}">${esc(live() ? 'Live' : st)}</span>${v.verified ? ` <span class="tag gold">${icon('check','sm')}Verified</span>` : ''} ${live() ? `<a class="link small" href="#/vendor/${esc(v.id)}">View public profile</a>` : ''}</p></div>
        <div class="chip-row">${['draft','rejected'].includes(v.status) ? `<button class="btn btn-primary" type="button" data-submit>${icon('send','sm')}Submit for review</button>` : ''}<a class="btn btn-ghost" href="#/account">${icon('users','sm')}Account</a></div></div>
        <div class="dash-tabs chip-row" role="tablist">${[['overview','Overview'],['profile','Profile'],['packages',`Packages (${v.packages.length})`],['photos',`Photos (${v.photos.length})`],['quotes',`Quote requests${newQ ? ` (${newQ} new)` : ''}`]].map(([k, l]) => `<button class="chip${tab === k ? ' active' : ''}" data-tab="${k}">${l}</button>`).join('')}</div><div id="pp-body" style="margin-top:1.5rem"></div>`;
      const b = $('#pp-body', box);
      if (tab === 'overview') b.innerHTML = `<div class="grid g-2"><div class="panel"><h2 class="h3">${esc(st)}</h2><p class="muted small" style="margin:.4rem 0 1rem">${esc(stText)}</p>${v.reviewNote && v.status !== 'approved' ? `<p class="notice">${icon('info')}<span>Note from MA3AK: ${esc(v.reviewNote)}</span></p>` : ''}
          <ul class="checklist">${steps().map(([l, ok]) => `<li class="${ok ? 'ok' : ''}">${icon(ok ? 'check' : 'minus','sm')}${esc(l)}</li>`).join('')}</ul></div>
        <div class="panel"><h2 class="h3">Quote requests</h2><p class="kpi">${d.quotes.length}</p><p class="small muted">${newQ} waiting for your reply</p><button class="btn btn-ghost btn-sm" type="button" data-tab="quotes" style="margin-top:1rem">Open requests</button>
          <p class="tiny muted" style="margin-top:1.25rem">MA3AK never confirms your availability for you. Customers see your reply and price only after you answer.</p></div></div>`;
      if (tab === 'profile') b.innerHTML = `<form class="form panel" id="pf-form" novalidate><div class="form-row">${FormField({ id:'pf-name', label:'Business name', required:true, value:v.name })}${FormField({ id:'pf-category', label:'Category', options:opt(CATEGORIES, 'id', 'single'), required:true, value:v.category })}</div>
          ${FormField({ id:'pf-description', label:'Short description', value:v.description, hint:'One or two lines shown on your card (20–300 characters).' })}${FormField({ id:'pf-about', label:'About your business', type:'textarea', value:v.about })}
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Areas you serve</legend><div class="chip-row">${LOCATIONS.map(l => `<label class="chip-check"><input type="checkbox" name="pf-loc" value="${l.id}"${v.locations.includes(l.id) ? ' checked' : ''}><span>${esc(l.name)}</span></label>`).join('')}</div></fieldset>
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Event types</legend><div class="chip-row">${EVENT_TYPES.map(x => `<label class="chip-check"><input type="checkbox" name="pf-ev" value="${x.id}"${v.eventTypes.includes(x.id) ? ' checked' : ''}><span>${esc(x.name)}</span></label>`).join('')}</div></fieldset>
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Features</legend><div class="chip-row">${SERVICE_FACETS.map(s => `<label class="chip-check"><input type="checkbox" name="pf-svc" value="${esc(s)}"${v.services.includes(s) ? ' checked' : ''}><span>${esc(s)}</span></label>`).join('')}</div></fieldset>
          <div class="form-row">${FormField({ id:'pf-capmin', label:'Guests from', type:'number', inputmode:'numeric', value:v.capacityMin ?? '' })}${FormField({ id:'pf-capmax', label:'Guests up to', type:'number', inputmode:'numeric', value:v.capacityMax ?? '' })}</div>
          ${FormField({ id:'pf-avail', label:'Availability note', value:v.availabilityNote, hint:'e.g. “Weekends book 3 months ahead”. Customers still ask you to confirm dates.' })}
          <div class="form-row">${FormField({ id:'pf-phone', label:'Phone', type:'tel', value:v.phone || '' })}${FormField({ id:'pf-whatsapp', label:'WhatsApp', type:'tel', value:v.whatsapp || '' })}</div>
          <div class="form-row">${FormField({ id:'pf-email', label:'Email', type:'email', value:v.email || '' })}${FormField({ id:'pf-instagram', label:'Instagram', value:v.instagram ? '@' + v.instagram : '' })}</div>${FormField({ id:'pf-website', label:'Website', value:v.website || '' })}
          <button class="btn btn-primary" type="submit">Save profile</button></form>`;
      if (tab === 'packages') b.innerHTML = `${editPkg !== null ? pkgForm(editPkg === 'new' ? null : v.packages.find(x => x.id === editPkg)) : `<button class="btn btn-primary" type="button" data-pk-new>${icon('plus','sm')}Add a package</button>`}
        <div class="grid g-2" style="margin-top:1.25rem">${v.packages.map(pk => `<article class="card pkg-card${pk.active ? '' : ' off'}"><h3 class="h3">${esc(pk.name)}</h3><p class="kpi" style="font-size:1.3rem">${esc(priceTxt(pk.price, pk.priceMax, pk.unit))}</p>${pk.description ? `<p class="small muted">${esc(pk.description)}</p>` : ''}${(pk.includes || []).length ? `<ul class="small">${pk.includes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${pk.active ? '' : '<p class="tag">Hidden</p>'}
          <div class="chip-row"><button class="btn btn-ghost btn-sm" type="button" data-pk-edit="${esc(pk.id)}">Edit</button><button class="btn btn-ghost btn-sm" type="button" data-pk-del="${esc(pk.id)}">Delete</button></div></article>`).join('') || `<p class="muted">No packages yet. Add your first package with a price, a price range, or “request a quote”.</p>`}</div>`;
      if (tab === 'photos') b.innerHTML = `<div class="panel"><label class="btn btn-primary" for="ph-file">${icon('image','sm')}Upload photos</label><input type="file" id="ph-file" accept="image/jpeg,image/png" multiple hidden><p class="small muted" style="margin-top:.6rem">JPG or PNG. Photos are resized to 1600 px and their location data is removed. Up to 10 photos.</p>
        <div class="photo-grid" style="margin-top:1rem">${v.photos.map(ph => `<figure><img src="${esc(ph.src)}" alt="${esc(ph.alt || v.name)}" loading="lazy"><figcaption><input class="input" value="${esc(ph.alt || '')}" placeholder="Describe the photo" data-ph-alt="${esc(ph.id)}" maxlength="160"><button class="icon-btn" type="button" data-ph-del="${esc(ph.id)}" aria-label="Delete photo">${icon('x','sm')}</button></figcaption></figure>`).join('') || '<p class="muted">No photos yet.</p>'}</div></div>`;
      if (tab === 'quotes') b.innerHTML = d.quotes.length ? `<div class="plan-list">${d.quotes.map(x => `<article class="q-card"><header><div><b>${esc(x.name)}</b><small class="muted">${esc(x.ref)} · ${fmtDate(x.created_at.slice(0, 10))}${x.package_name ? ` · ${esc(x.package_name)}` : ''}</small></div><span class="tag ${x.status === 'new' ? 'gold' : ''}">${esc(QUOTE_TXT[x.status] || x.status)}</span></header>
          <p class="small">${[x.event_date && `Date: ${fmtDate(x.event_date)}`, x.guests && `Guests: ${x.guests}`, x.location && `Area: ${locName(x.location)}`].filter(Boolean).map(esc).join(' · ')}</p>${x.message ? `<p class="q-msg">${esc(x.message)}</p>` : ''}
          <p class="small">${x.email ? `<a class="link" href="mailto:${esc(x.email)}">${esc(x.email)}</a>` : ''}${x.email && x.phone ? ' · ' : ''}${x.phone ? `<a class="link" href="tel:${esc(x.phone.replace(/[^\d+]/g, ''))}">${esc(x.phone)}</a>` : ''}</p>
          <form class="form q-form" data-q="${esc(x.id)}" novalidate><div class="form-row"><div class="field"><label for="qs-${esc(x.id)}">Status</label><select class="select" id="qs-${esc(x.id)}" name="status">${Object.entries(QUOTE_TXT).map(([k, l]) => `<option value="${k}"${x.status === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label for="qa-${esc(x.id)}">Quoted amount (USD)</label><input class="input" id="qa-${esc(x.id)}" name="amount" type="number" inputmode="numeric" value="${x.quoted_amount ?? ''}"></div></div>
            <div class="field"><label for="qr-${esc(x.id)}">Reply to the customer</label><textarea class="textarea" id="qr-${esc(x.id)}" name="reply" rows="2" maxlength="2000">${esc(x.reply || '')}</textarea></div>
            <div class="field"><label for="qn-${esc(x.id)}">Private note (only you see this)</label><input class="input" id="qn-${esc(x.id)}" name="note" maxlength="1000" value="${esc(x.partner_note || '')}"></div><button class="btn btn-primary btn-sm" type="submit">Save reply</button></form></article>`).join('')}</div>`
        : EmptyState({ iconName:'inbox', title:'No quote requests yet', text:live() ? 'Requests from customers appear here.' : 'Once your listing is live, customers can send you requests.' });
    };
    paint();
    const refresh = async () => { await load(); paint(); };
    box.addEventListener('click', async e => {
      const t = e.target.closest('[data-tab]'); if (t){ tab = t.dataset.tab; editPkg = null; history.replaceState(null, '', `#/partner?tab=${tab}`); paint(); return; }
      if (e.target.closest('[data-submit]')) return openModal({ title:'Submit your listing for review', body:`<p class="muted small">MA3AK will check your profile and packages before publishing. Make sure your prices are current; customers see them as estimates and you confirm the final price in each quote.</p><label class="check" style="margin-top:1rem"><input type="checkbox" id="sb-ok"> I agree that MA3AK may publish this listing and show my packages, prices and photos.</label><p class="err" id="sb-err" role="alert"></p><div class="chip-row" style="margin-top:1rem"><button class="btn btn-primary" id="sb-go">Submit</button><button class="btn btn-ghost" data-close>Not yet</button></div>`,
        onMount(m){ $('#sb-go', m).onclick = async () => { if (!$('#sb-ok', m).checked){ $('#sb-err', m).textContent = 'Please confirm to continue.'; return; } try { await apiU('POST', '/api/partner/submit', { consent:true }); closeModal(); toast('Submitted. MA3AK will review your listing.'); refresh(); } catch(err){ $('#sb-err', m).textContent = err.message; } }; } });
      if (e.target.closest('[data-pk-new]')){ editPkg = 'new'; paint(); return; }
      const pe = e.target.closest('[data-pk-edit]'); if (pe){ editPkg = pe.dataset.pkEdit; paint(); return; }
      if (e.target.closest('[data-pk-cancel]')){ editPkg = null; paint(); return; }
      const pd = e.target.closest('[data-pk-del]'); if (pd){ if (!confirm('Delete this package? Plans that already include it keep their saved price.')) return; try { await apiU('DELETE', `/api/partner/packages/${pd.dataset.pkDel}`); toast('Package deleted'); refresh(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      const phd = e.target.closest('[data-ph-del]'); if (phd){ try { await apiU('DELETE', `/api/partner/photos/${phd.dataset.phDel}`); toast('Photo deleted'); refresh(); } catch(err){ toast(esc(err.message), 'alert'); } }
    });
    box.addEventListener('change', async e => {
      if (e.target.id === 'ph-file'){ const files = [...e.target.files].slice(0, 10); for (const file of files){ try { const image = await imageFromFile(file); await apiU('POST', '/api/partner/photos', { image, alt:'' }); } catch(err){ toast(esc(err.message), 'alert'); break; } } toast('Photos uploaded'); refresh(); return; }
      const alt = e.target.closest('[data-ph-alt]'); if (alt){ try { await apiU('PATCH', `/api/partner/photos/${alt.dataset.phAlt}`, { alt:alt.value }); toast('Saved'); } catch(err){ toast(esc(err.message), 'alert'); } }
    });
    box.addEventListener('submit', async e => { e.preventDefault(); const f = e.target, btn = $('[type=submit]', f);
      if (f.id === 'pf-form'){ if (!validateForm(f, { 'pf-name':V.req('the business name'), 'pf-category':V.select('a category'), 'pf-phone':V.phoneOpt, 'pf-whatsapp':V.phoneOpt, 'pf-email':x => x ? V.email(x) : '', 'pf-website':V.urlOpt })) return; busy(btn, true, 'Saving');
        const g = k => f.elements[k].value.trim(), checked = n => $$(`input[name="${n}"]:checked`, f).map(x => x.value);
        try { await apiU('PUT', '/api/partner/profile', { name:g('pf-name'), category:g('pf-category'), description:g('pf-description'), about:g('pf-about'), locations:checked('pf-loc'), eventTypes:checked('pf-ev'), services:checked('pf-svc'), capacityMin:g('pf-capmin'), capacityMax:g('pf-capmax'), availabilityNote:g('pf-avail'), phone:g('pf-phone'), whatsapp:g('pf-whatsapp'), email:g('pf-email'), instagram:g('pf-instagram'), website:g('pf-website') }); toast('Profile saved'); refresh(); }
        catch(err){ busy(btn, false); showServerErrors(f, err, { name:'pf-name', category:'pf-category', description:'pf-description', phone:'pf-phone', whatsapp:'pf-whatsapp', email:'pf-email', website:'pf-website', capacityMin:'pf-capmin' }); toast(esc(err.message), 'alert'); } return; }
      if (f.id === 'pk-form'){ if (!validateForm(f, { 'pk-name':V.req('a package name') })) return; busy(btn, true, 'Saving'); const g = k => f.elements[k].value.trim();
        try { await apiU('PUT', `/api/partner/packages/${f.dataset.id}`, { name:g('pk-name'), unit:g('pk-unit') || 'flat', price:g('pk-price'), priceMax:g('pk-max'), description:g('pk-desc'), includes:g('pk-inc').split('\n'), minQty:g('pk-min'), active:$('#pk-active', f).checked }); editPkg = null; toast('Package saved'); refresh(); }
        catch(err){ busy(btn, false); showServerErrors(f, err, { name:'pk-name', price:'pk-price', priceMax:'pk-max' }); toast(esc(err.message), 'alert'); } return; }
      if (f.matches('.q-form')){ busy(btn, true, 'Saving'); try { await apiU('PATCH', `/api/partner/quotes/${f.dataset.q}`, { status:f.elements.status.value, quotedAmount:f.elements.amount.value === '' ? null : +f.elements.amount.value, reply:f.elements.reply.value, partnerNote:f.elements.note.value }); toast('Reply saved. The customer can see it now.'); refresh(); } catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); } }
    });
  } };

/* ---- pages3.js ---- */
/* =========================================================
   SEARCH RESULTS
   ========================================================= */
const FILTER_KEYS = ['category','location','event','min','max','guests','services','sort'];
function FilterBar(f){
  return `<form class="filters" id="filters" aria-label="Filters" novalidate>
    <div class="f-head"><h2 class="h3">Filters</h2><button type="button" data-clear>Clear all</button></div>
    ${FormField({ showOpt:false, id:'f-category', label:'Category', options:opt(CATEGORIES), placeholder:'All categories', value:f.category })}
    ${FormField({ showOpt:false, id:'f-location', label:'Location', options:opt(LOCATIONS), placeholder:'All of Lebanon', value:f.location })}
    ${FormField({ showOpt:false, id:'f-event', label:'Event type', options:opt(EVENT_TYPES), placeholder:'Any event', value:f.event })}
    <div class="field"><span class="label" id="price-lbl">Price range (USD)</span><div class="range2" role="group" aria-labelledby="price-lbl">
      <label class="sr-only" for="f-min">Minimum price</label><input class="input" id="f-min" name="f-min" inputmode="numeric" placeholder="Min" value="${esc(f.min)}">
      <label class="sr-only" for="f-max">Maximum price</label><input class="input" id="f-max" name="f-max" inputmode="numeric" placeholder="Max" value="${esc(f.max)}"></div></div>
    ${FormField({ showOpt:false, id:'f-guests', label:'Guests', type:'number', inputmode:'numeric', placeholder:'Number of guests', value:f.guests })}
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:.4rem">Services</legend>
      ${SERVICE_FACETS.map((s,i) => `<label class="check"><input type="checkbox" name="f-svc" value="${esc(s)}"${f.services.includes(s)?' checked':''}>${esc(s)}</label>`).join('')}</fieldset>
    <button class="btn btn-primary btn-block filters-apply" type="button" data-close-filters>Show results</button>
  </form>`;
}
const Search = {
  title:'Search | Ma3ak',
  render(p, q){
    const f = Object.fromEntries(FILTER_KEYS.map(k => [k, q.get(k) || '']));
    f.services = f.services ? f.services.split(',') : [];
    const query = q.get('q') || '';
    const tax = searchTaxonomy(query);
    const related = [
      ...tax.categories.slice(0,3).map(c => `<a class="chip" href="#/search${qs({ q:'', category:c.id })}">${icon(c.icon)}${c.name}</a>`),
      ...tax.events.slice(0,2).map(e => `<a class="chip" href="#/search${qs({ event:e.id })}">${icon(e.icon)}${e.name}</a>`),
      ...tax.locations.slice(0,2).map(l => `<a class="chip" href="#/search${qs({ location:l.id })}">${icon('pin')}${l.name}</a>`)
    ];
    return `
    <section class="page-hero" style="padding-bottom:2rem"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Search</span></nav>
      <h1 class="h1">Search Results</h1>
      <form class="big-search" role="search" id="search-page-form" style="margin-top:1.75rem;max-width:760px">${icon('search')}<label class="sr-only" for="sq">Search vendors, venues, DJs, photographers</label><input id="sq" type="search" value="${esc(query)}" placeholder="Search vendors, venues, DJs, photographers…"><button class="btn btn-primary" type="submit" aria-label="Search">${icon('search','sm')}<span class="bs-text">Search</span></button></form>
    </div></section>
    <section class="section tight" style="padding-top:0"><div class="wrap">
      ${related.length ? `<div class="matches" aria-label="Related"><span class="small muted" style="align-self:center;margin-right:.25rem">Related:</span>${related.join('')}</div>` : ''}
      <div class="search-layout">
        ${FilterBar(f)}<div class="filters-scrim" data-close-filters></div>
        <div>
          <div class="results-bar">
            <p id="result-count" class="small muted" aria-live="polite">Searching…</p>
            <div class="chip-row" style="align-items:center">
              <button class="btn btn-ghost btn-sm filters-toggle" type="button" id="open-filters" aria-controls="filters">${icon('sliders','sm')}Filters</button>
              <label class="sr-only" for="sort">Sort by</label>
              <select class="select" id="sort"><option value="recommended">Sort: Recommended</option><option value="price">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="distance">Distance</option><option value="newest">Newest</option></select>
            </div>
          </div>
          <div class="active-filters" id="active-filters"></div>
          <div id="results"></div>
        </div>
      </div>
    </div></section>`;
  },
  mount(root, p, q){
    let query = q.get('q') || '';
    const form = $('#filters'), sort = $('#sort'); sort.value = q.get('sort') || 'recommended';
    const read = () => ({
      category:form.elements['f-category'].value, location:form.elements['f-location'].value, event:form.elements['f-event'].value,
      min:form.elements['f-min'].value.replace(/\D/g,''), max:form.elements['f-max'].value.replace(/\D/g,''), guests:form.elements['f-guests'].value,
      services:$$('input[name="f-svc"]:checked', form).map(x => x.value), sort:sort.value === 'recommended' ? '' : sort.value
    });
    const labelFor = (k, v) => ({ category:catName(v), location:locName(v), event:evName(v), min:`From ${money(v)}`, max:`Up to ${money(v)}`, guests:`${v} guests`, rating:`${v}+ rating`, date:`Available ${fmtDate(v,{day:'numeric',month:'short'})}` })[k] || v;
    let seq = 0;
    async function run(){
      const f = read(); const my = ++seq;
      history.replaceState(null, '', '#/search' + qs({ q:query, ...f }));
      const chips = Object.entries(f).filter(([k,v]) => k !== 'sort' && k !== 'services' && v).map(([k,v]) => `<button type="button" data-drop="${k}" aria-label="Remove filter ${esc(labelFor(k,v))}">${esc(labelFor(k,v))}${icon('x','sm')}</button>`)
        .concat(f.services.map(s => `<button type="button" data-drop-svc="${esc(s)}" aria-label="Remove filter ${esc(s)}">${esc(s)}${icon('x','sm')}</button>`));
      $('#active-filters').innerHTML = chips.join('');
      $('#results').innerHTML = `<div class="grid results-grid">${Skeletons(6)}</div>`; $('#result-count').textContent = 'Searching…';
      try {
        const res = await api.searchVendors(query, f); if (my !== seq) return;
        const what = query ? `for “${esc(query)}”` : '';
        $('#result-count').innerHTML = `${res.length} ${res.length===1?'vendor':'vendors'} ${what}`;
        $('#results').innerHTML = res.length ? `<div class="grid results-grid">${res.map(VendorCard).join('')}</div>` :
          EmptyState({ iconName:'search', level:'h2', title:'No vendors found', text:`Try changing your search or filters.${VENDORS.length ? '' : ' MA3AK is onboarding providers across Lebanon, so listings are still being added.'}`,
            actions:`<button class="btn btn-primary" type="button" data-clear>Clear Filters</button>${VENDORS.length ? '' : `<a class="btn btn-ghost" href="#/for-vendors">Are you a vendor? Join</a>`}` });
      } catch(err){
        if (my !== seq) return;
        $('#result-count').textContent = 'Search failed';
        $('#results').innerHTML = EmptyState({ iconName:'alert', level:'h2', title:'Search didn’t load', text:'Something went wrong while loading results. Check your connection and try again.', actions:`<button class="btn btn-primary" type="button" data-retry>Try again</button>` });
      }
    }
    let t; const debounced = () => { clearTimeout(t); t = setTimeout(run, 250); };
    form.addEventListener('change', run); form.addEventListener('input', e => { if (e.target.matches('#f-min,#f-max,#f-guests')) debounced(); });
    sort.addEventListener('change', run);
    $('#search-page-form').addEventListener('submit', e => { e.preventDefault(); query = $('#sq').value.trim(); location.hash = '#/search' + qs({ q:query, ...read() }); });
    const clearAll = () => { form.reset(); $$('select,input', form).forEach(x => { if (x.type === 'checkbox') x.checked = false; else x.value = ''; }); run(); };
    root.addEventListener('click', e => {
      if (e.target.closest('[data-clear]')) { clearAll(); return; }
      if (e.target.closest('[data-retry]')) { run(); return; }
      const d = e.target.closest('[data-drop]'); if (d){ const k = d.dataset.drop; const el = form.elements['f-'+k]; if (el) el.value = ''; run(); return; }
      const s = e.target.closest('[data-drop-svc]'); if (s){ const cb = $$('input[name="f-svc"]', form).find(x => x.value === s.dataset.dropSvc); if (cb) cb.checked = false; run(); return; }
      if (e.target.closest('#open-filters')){ form.classList.add('open'); $('.filters-scrim').classList.add('open'); form.querySelector('select').focus(); return; }
      if (e.target.closest('[data-close-filters]')){ form.classList.remove('open'); $('.filters-scrim').classList.remove('open'); $('#open-filters').focus(); }
    });
    form.addEventListener('keydown', e => { if (e.key === 'Escape' && form.classList.contains('open')) { form.classList.remove('open'); $('.filters-scrim').classList.remove('open'); } });
    run();
  }
};

/* The budget planner and dashboard live in market.js (saved on the server, not in the browser). */

/* =========================================================
   ROUTER
   ========================================================= */
const ROUTES = [
  [/^\/$/, Home], [/^\/how-it-works$/, HowItWorks], [/^\/events$/, Events], [/^\/vendors$/, Vendors],
  [/^\/vendor\/preview$/, VendorPreview], [/^\/vendor\/([\w-]+)$/, VendorProfile], [/^\/about$/, About],
  [/^\/for-vendors$/, ForVendors], [/^\/contact$/, Contact], [/^\/plan$/, PlannerHome], [/^\/planner\/([\w-]+)$/, PlannerPage], [/^\/dashboard$/, PlansDashboard], [/^\/my-plan$/, { title:'My plans | Ma3ak', render(){ return ''; }, mount(){ location.replace('#/dashboard'); } }], [/^\/partner$/, PartnerPortal], [/^\/partner\/join$/, PartnerJoin], [/^\/login$/, Login], [/^\/register$/, Register], [/^\/forgot$/, Forgot], [/^\/reset$/, Reset], [/^\/verify$/, Verify], [/^\/account$/, AccountPage], [/^\/s\/([\w-]+)$/, SharedEvent], [/^\/i\/([\w-]+)$/, InvitePage], [/^\/studio\/([\w-]+)$/, GameStudio], [/^\/customize$/, GameStudio], [/^\/privacy$/, Privacy], [/^\/terms$/, Terms], [/^\/search$/, Search]
];
const NotFound = { title:'Page not found | Ma3ak', render(){ return `<section class="section"><div class="wrap">${EmptyState({ iconName:'search', level:'h1', title:'This page doesn’t exist', text:'The link may be out of date. Head back home or search for what you need.', actions:`<a class="btn btn-primary" href="#/">Go home</a><button class="btn btn-ghost" type="button" data-open-search>Search</button>` })}</div></section>`; } };
let currentPath = null;
function parseHash(){
  let h = location.hash.slice(1) || '/';
  if (!h.startsWith('/')) return null; // in-page anchor
  let anchor = ''; const ai = h.indexOf('#'); if (ai > -1){ anchor = h.slice(ai+1); h = h.slice(0, ai); }
  const [path, query=''] = h.split('?');
  return { path: path.replace(/\/+$/,'') || '/', query: new URLSearchParams(query), anchor };
}
function render(){
  const r = parseHash(); if (!r) return;
  let page = NotFound, params = [];
  for (const [re, pg] of ROUTES){ const m = r.path.match(re); if (m){ page = pg; params = m.slice(1); break; } }
  if (typeof GL3D !== 'undefined'){ GL3D._viewers.forEach(v => v.destroy()); GL3D._viewers.clear(); }
  const main = $('#main');
  const samePage = currentPath === r.path;
  main.innerHTML = `<div class="page">${page.render(params, r.query)}</div>`;
  document.title = page.title;
  const header = $('#site-header'); header.classList.toggle('on-dark', !!page.dark); document.body.classList.toggle('game-mode', !!page.game);
  $$('[data-nav]').forEach(a => { const on = a.dataset.nav === '#' + r.path || (r.path==='/' && a.dataset.nav==='#/'); on ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current'); });
  closeModal(); closeSearch(); window._closeMenu && window._closeMenu();
  if (page.mount) page.mount($('.page', main), params, r.query);
  if (r.anchor){ setTimeout(() => { const el = document.getElementById(r.anchor); el && el.scrollIntoView(); }, 60); }
  else if (!samePage){ window.scrollTo(0, 0); const h1 = $('h1', main); if (h1 && currentPath !== null){ h1.setAttribute('tabindex','-1'); h1.focus({ preventScroll:true }); } }
  currentPath = r.path;
}
document.addEventListener('click', e => {
  const cz = e.target.closest('[data-cz-type]'); if (cz){ const v = czState(); v.eventType = cz.dataset.czType; v._step = 0; czSave(v); }
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const href = a.getAttribute('href'); if (href.startsWith('#/')) return;
  e.preventDefault(); const el = document.getElementById(href.slice(1));
  if (el){ el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); if (el.id === 'main'){ el.setAttribute('tabindex','-1'); el.focus({ preventScroll:true }); } }
});

/* =========================================================
   INIT
   ========================================================= */
(function init(){
  $('#app-header').outerHTML = Header();
  $('#app-footer').outerHTML = Footer();
  document.body.insertAdjacentHTML('beforeend', SearchOverlay());
  setupHeader(); setupSearch();
  window.addEventListener('hashchange', render);
  if (!location.hash) history.replaceState(null, '', '#/');
  render();
})();
