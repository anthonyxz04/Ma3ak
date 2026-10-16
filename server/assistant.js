// Built-in assistant used when no AI provider is configured (and as the fallback if the AI is down).
// It answers from the live database — providers, packages, prices, FAQs, themes and contact details —
// and never invents prices or availability.
import { clean } from './validate.js';
import { readSettings } from './site.js';

const CAT_WORDS = {
  venue: ['venue', 'venues', 'hall', 'ballroom', 'restaurant', 'rooftop', 'garden', 'location', 'place', 'salle', 'lieu', 'قاعة', 'صالة', 'mkan', 'sala'],
  catering: ['catering', 'caterer', 'food', 'buffet', 'menu', 'chef', 'mezze', 'dinner', 'traiteur', 'akel', 'اكل', 'طعام', 'ضيافة', 'bar', 'drinks'],
  photography: ['photo', 'photos', 'photographer', 'photography', 'pictures', 'photographe', 'mosawer', 'msawer', 'تصوير', 'مصور'],
  videography: ['video', 'videographer', 'videography', 'film', 'drone', 'vidéo', 'فيديو'],
  dj: ['dj', 'djs', 'deejay', 'music', 'sound', 'musique', 'موسيقى', 'دي جي'],
  entertainment: ['band', 'singer', 'dabke', 'zaffe', 'zaffeh', 'performer', 'magician', 'show', 'entertainment', 'chanteur', 'زفة', 'دبكة', 'مطرب'],
  decoration: ['decoration', 'decor', 'decorator', 'styling', 'backdrop', 'balloons', 'kosha', 'déco', 'decore', 'زينة', 'ديكور'],
  florist: ['flower', 'flowers', 'florist', 'bouquet', 'centerpiece', 'centerpieces', 'fleurs', 'ورد', 'زهور'],
  cake: ['cake', 'cakes', 'dessert', 'desserts', 'sweets', 'pastry', 'gateau', 'gâteau', 'كيك', 'قالب', 'حلويات'],
  planner: ['planner', 'coordinator', 'organizer', 'organiser', 'wedding planner', 'coordination', 'منظم'],
  rentals: ['rental', 'rentals', 'chairs', 'chair', 'tables', 'tent', 'lounge', 'furniture', 'كراسي', 'خيمة'],
  lighting: ['lighting', 'lights', 'light', 'led', 'stage', 'éclairage', 'اضاءة', 'إضاءة'],
  transportation: ['car', 'cars', 'limo', 'limousine', 'bus', 'shuttle', 'transport', 'transportation', 'valet', 'سيارة'],
  makeup: ['makeup', 'make up', 'mua', 'maquillage', 'مكياج'],
  hair: ['hair', 'hairstylist', 'hairdresser', 'coiffure', 'شعر'],
};
const AREA_WORDS = { beirut: ['beirut', 'bayrut', 'achrafieh', 'hamra', 'بيروت'], metn: ['metn', 'matn', 'broummana', 'dbayeh', 'jdeideh', 'المتن'], keserwan: ['keserwan', 'kesrouan', 'jounieh', 'kaslik', 'faraya', 'كسروان', 'جونيه'],
  jbeil: ['jbeil', 'byblos', 'جبيل'], batroun: ['batroun', 'البترون'], aley: ['aley', 'bhamdoun', 'عاليه'], chouf: ['chouf', 'beiteddine', 'الشوف'], bekaa: ['bekaa', 'zahle', 'baalbek', 'البقاع', 'زحلة'],
  north: ['north', 'tripoli', 'koura', 'zgharta', 'ehden', 'طرابلس', 'الشمال'], south: ['south', 'saida', 'sidon', 'tyre', 'sour', 'nabatieh', 'صيدا', 'صور', 'الجنوب'] };
const AREA_NAMES = { beirut: 'Beirut', metn: 'Metn', keserwan: 'Keserwan', jbeil: 'Jbeil', batroun: 'Batroun', aley: 'Aley', chouf: 'Chouf', bekaa: 'Bekaa', north: 'North Lebanon', south: 'South Lebanon' };
const EVENT_WORDS = { wedding: ['wedding', 'mariage', 'عرس', 'زفاف', 'bride'], engagement: ['engagement', 'fiançailles', 'خطوبة'], birthday: ['birthday', 'anniversaire', 'عيد ميلاد', 'bday'], graduation: ['graduation', 'تخرج'],
  corporate: ['corporate', 'company', 'conference', 'launch', 'gala'], 'baby-shower': ['baby shower', 'gender reveal'], private: ['private party', 'dinner party', 'house party'] };
// A common way to split a budget (guideline only, not prices). Weights per category.
const WEIGHTS = { venue: 26, catering: 32, photography: 8, videography: 7, dj: 7, entertainment: 6, decoration: 10, florist: 5, cake: 3, planner: 10, rentals: 6, lighting: 5, transportation: 4, makeup: 3, hair: 2 };
const EVENT_SERVICES = { wedding: ['venue', 'catering', 'photography', 'videography', 'dj', 'decoration', 'florist', 'cake', 'makeup', 'hair'], engagement: ['venue', 'catering', 'photography', 'decoration', 'florist', 'cake'],
  birthday: ['venue', 'catering', 'decoration', 'cake', 'dj', 'entertainment'], graduation: ['venue', 'catering', 'decoration', 'dj', 'photography', 'cake'], corporate: ['venue', 'catering', 'lighting', 'photography', 'videography', 'rentals'],
  private: ['catering', 'dj', 'decoration', 'rentals', 'lighting'], 'baby-shower': ['venue', 'catering', 'decoration', 'cake', 'florist', 'photography'], other: ['venue', 'catering', 'decoration', 'photography'] };

const norm = s => ' ' + String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}$\s.,]/gu, ' ').replace(/\s+/g, ' ') + ' ';
const has = (t, w) => t.includes(' ' + w + ' ') || (w.length > 4 && t.includes(w)) || /[؀-ۿ]/.test(w) && t.includes(w);
const findKey = (t, map) => Object.keys(map).find(k => map[k].some(w => has(t, norm(w).trim())));
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const UNIT = { flat: '', per_guest: ' per guest', per_hour: ' per hour', per_item: ' each' };
function numbers(t) {
  const out = {}; const k = s => { s = s.replace(/,/g, ''); return /k$/.test(s) ? parseFloat(s) * 1000 : parseFloat(s); };
  const g = t.match(/(\d[\d,]*)\s*(guests|guest|people|persons|pax|invites|invités|personnes|ضيف|شخص)/); if (g) out.guests = Math.round(k(g[1]));
  const b = t.match(/\$\s*(\d[\d,.]*k?)|(\d[\d,.]*k?)\s*(\$|usd|dollars|dollar|دولار)|budget (of |is |around |about )?\$?(\d[\d,.]*k?)/);
  if (b) out.budget = Math.round(k(b[1] || b[2] || b[5]));
  return out;
}

export async function rulesReply(db, message, ctx = {}) {
  const raw = clean(message, 1000), t = norm(raw), settings = await readSettings(db), contact = settings.contact || {};
  const cat = findKey(t, CAT_WORDS), area = findKey(t, AREA_WORDS), evType = findKey(t, EVENT_WORDS) || ctx.eventType || null, nums = numbers(t);
  const contactLine = [contact.phone && `call or WhatsApp ${contact.phone}`, contact.email && `email ${contact.email}`, contact.instagram && `Instagram @${contact.instagram}`].filter(Boolean).join(', ');
  const links = [];

  // 1) talk to a person / book
  if (/(human|person|agent|someone|call me|talk to|speak to|whatsapp|book|booking|reserve|complain|complaint|refund|موظف|احجز|حجز|بدي احكي)/.test(t))
    return { reply: `Happy to connect you with the MA3AK team. You can ${contactLine || 'use the contact page'}. If you have a saved plan, open it and press “Send to MA3AK” so the team sees everything you picked.`, handoff: true, links: [{ label: 'Contact the team', href: '#/contact' }, { label: 'My plans', href: '#/dashboard' }] };

  // 2) availability: never guessed
  if (/(available|availability|free on|disponible|متاح|فاضي)/.test(t))
    return { reply: 'I can’t confirm availability. Only the provider can, so send them a quote request with your date and guest count from their profile. They reply on MA3AK and you’ll see the answer in your dashboard.', handoff: false, links: [{ label: 'Browse providers', href: '#/vendors' }] };

  // 3) a service category: real providers and package prices from the database
  if (cat) {
    const args = [cat]; let where = "v.category = ? AND v.status = 'approved' AND v.active = 1 AND v.consent_at IS NOT NULL";
    if (area) { where += " AND (' ' || v.locations || ' ') LIKE ?"; args.push(`% ${area} %`); }
    if (cat === 'venue' && nums.guests) { where += ' AND (v.capacity_max IS NULL OR v.capacity_max >= ?)'; args.push(nums.guests); }
    const vendors = await db.all(`SELECT v.id, v.name, v.is_demo, v.verified, v.locations FROM vendors v WHERE ${where} ORDER BY v.is_demo, v.featured DESC, v.verified DESC, v.name LIMIT 6`, ...args);
    const pk = vendors.length ? await db.all(`SELECT vendor_id, name, price, price_max, unit FROM vendor_packages WHERE active = 1 AND vendor_id IN (${vendors.map(() => '?').join(',')}) ORDER BY price NULLS LAST`, ...vendors.map(v => v.id)) : [];
    const catName = (await db.get('SELECT name FROM categories WHERE id = ?', cat))?.name || cat;
    links.push({ label: `See all ${catName.toLowerCase()}`, href: `#/search?category=${cat}${area ? `&location=${area}` : ''}` });
    if (!vendors.length) return { reply: `There are no ${catName.toLowerCase()} listed${area ? ` in ${AREA_NAMES[area]}` : ''} yet. MA3AK is adding providers; the team can suggest options for you — ${contactLine || 'use the contact page'}.`, handoff: false, links };
    const priced = pk.filter(p => p.price != null), units = [...new Set(priced.map(p => p.unit))], unit = units.length === 1 ? units[0] : null;
    const providers = vendors.slice(0, 3).map(v => { const own = priced.filter(p => p.vendor_id === v.id); const lo = own[0]; return { id: v.id, name: v.name, isDemo: !!v.is_demo, verified: !!v.verified && !v.is_demo, from: lo ? lo.price : null, unit: lo ? lo.unit : null }; });
    let reply = `Here ${vendors.length === 1 ? 'is a provider' : 'are providers'} for ${catName.toLowerCase()}${area ? ` serving ${AREA_NAMES[area]}` : ''}`;
    if (priced.length && unit) reply += `. Listed packages range from ${money(priced[0].price)} to ${money(Math.max(...priced.map(p => p.price_max ?? p.price)))}${UNIT[unit]}`;
    else if (priced.length) reply += `. Listed packages start from ${money(priced[0].price)}${UNIT[priced[0].unit]}`;
    reply += '. These are estimates from the providers’ packages; the final price comes with their quote.';
    if (cat === 'catering' && nums.guests && priced.length && priced[0].unit === 'per_guest') reply += ` For ${nums.guests} guests, the lowest listed menu comes to about ${money(priced[0].price * nums.guests)}.`;
    if (vendors.some(v => v.is_demo)) reply += ' Listings marked “Demo” are samples for trying the planner, not real businesses.';
    return { reply, handoff: false, providers, links };
  }

  // 4) budget split guideline (not prices)
  if (nums.budget || /(budget|how much|cost|price|prix|combien|ميزانية|كم بكلف|ادي)/.test(t)) {
    const services = EVENT_SERVICES[evType] || EVENT_SERVICES.other, total = services.reduce((s, c) => s + WEIGHTS[c], 0);
    if (nums.budget) {
      const split = services.map(c => ({ c, v: nums.budget * WEIGHTS[c] / total })).sort((a, b) => b.v - a.v).slice(0, 6);
      const names = Object.fromEntries((await db.all('SELECT id, name FROM categories')).map(r => [r.id, r.name]));
      let reply = `A common way to split ${money(nums.budget)}${evType ? ` for a ${evType.replace('-', ' ')}` : ''}: ${split.map(x => `${names[x.c] || x.c} ≈ ${money(x.v)}`).join(', ')}. This is a guideline, not a price list.`;
      if (nums.guests) reply += ` That’s about ${money(nums.budget / nums.guests)} per guest for ${nums.guests} guests.`;
      reply += ' The planner adds up real package prices as you pick them and warns you if you go over.';
      return { reply, handoff: false, links: [{ label: 'Open the budget planner', href: '#/plan' }] };
    }
    return { reply: 'Prices depend on the service, the date and your guest count. Ask me about a specific service (for example “how much is a photographer” or “catering for 150 guests”) and I’ll show the packages providers have listed. Or tell me your total budget and I’ll suggest how to split it.', handoff: false, links: [{ label: 'Open the budget planner', href: '#/plan' }] };
  }

  // 5) themes
  if (/(theme|themes|style|styles|colou?r|décor idea|ideas|ثيم|ستايل)/.test(t) && (settings.themes || []).length)
    return { reply: `Popular themes: ${settings.themes.slice(0, 7).map(x => `${x.name}${x.description ? ` (${x.description.replace(/\.$/, '')})` : ''}`).join('; ')}. Pick one in your plan and the 3D designer can show it.`, handoff: false, links: [{ label: 'Try the 3D designer', href: '#/customize' }] };

  // 6) FAQs and knowledge base
  const tokens = t.split(' ').filter(w => w.length > 3);
  const docs = [...(settings.faqs || []).map(f => ({ q: f.q, a: f.a })), ...(await db.all('SELECT title AS q, body AS a FROM kb_entries')).map(k => ({ q: k.q, a: k.a }))];
  let best = null, score = 0;
  for (const d of docs) { const hay = norm(d.q + ' ' + d.q + ' ' + d.a); const s = tokens.reduce((n, w) => n + (hay.includes(' ' + w) ? 1 : 0), 0); if (s > score) { score = s; best = d; } }
  if (best && score >= 2) return { reply: best.a, handoff: false, links };

  // 7) how it works / greetings / contact
  if (/(contact|phone|number|email|instagram|address|where are you|رقم|تلفون)/.test(t)) return { reply: `You can reach MA3AK: ${contactLine || 'see the contact page'}.`, handoff: false, links: [{ label: 'Contact', href: '#/contact' }] };
  if (/(how (does|do) (it|this|you) work|how to (plan|start)|start planning|planner|comment ça marche|كيف)/.test(t))
    return { reply: 'Create a plan with your event type, date, area, guests and budget. Then add services from providers’ packages — the total updates instantly, per-guest prices follow your guest count, and you’ll see cheaper options if you go over budget. Save it, share a link, request quotes, or send it to MA3AK.', handoff: false, links: [{ label: 'Start a plan', href: '#/plan' }] };
  if (/^ (hi|hello|hey|salut|bonjour|marhaba|mar7aba|hala|kifak|ahla|السلام|مرحبا|هلا)\b/.test(t) || tokens.length <= 1)
    return { reply: 'Hi! I’m the MA3AK assistant. I can show providers and their listed prices (try “photographer in Jbeil” or “catering for 150 guests”), suggest how to split a budget, list themes, or connect you with the team.', handoff: false, links: [{ label: 'Start a plan', href: '#/plan' }, { label: 'Browse providers', href: '#/vendors' }] };
  return { reply: `I’m not sure about that one. I can help with provider prices (“how much is a DJ?”), finding providers by area (“venue in Batroun for 200 guests”), splitting a budget (“$15,000 wedding for 180 guests”), themes, or contacting the team${contactLine ? ` (${contactLine})` : ''}.`, handoff: false, links: [{ label: 'Browse providers', href: '#/vendors' }] };
}
