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
        <div><span class="tag">Planned</span><h3 class="h3" style="margin-top:.8rem">For people planning</h3><ul><li>Reviews from customers who booked</li><li>Personalized recommendations</li><li>Live availability calendars</li></ul></div>
        <div><span class="tag">Planned</span><h3 class="h3" style="margin-top:.8rem">For providers</h3><ul><li>Provider analytics</li><li>Calendar sync</li><li>Provider subscriptions</li></ul></div>
        <div><span class="tag">Planned</span><h3 class="h3" style="margin-top:.8rem">Booking</h3><ul><li>Online booking</li><li>Payments</li><li>Digital contracts</li></ul></div>
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
