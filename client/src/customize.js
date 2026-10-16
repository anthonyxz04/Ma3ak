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
