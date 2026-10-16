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
