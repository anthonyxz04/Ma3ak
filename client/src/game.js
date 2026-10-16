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
