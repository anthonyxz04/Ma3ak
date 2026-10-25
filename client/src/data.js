'use strict';
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
    // equal relevance keeps the server's order (MA3AK's listing order: manual ranking, then the automatic rule)
    recommended: (a,b) => b.score - a.score || VENDORS.indexOf(a.v) - VENDORS.indexOf(b.v),
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
