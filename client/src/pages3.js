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
  [/^\/for-vendors$/, ForVendors], [/^\/contact$/, Contact], [/^\/plan$/, PlannerHome], [/^\/planner\/([\w-]+)$/, PlannerPage], [/^\/dashboard$/, PlansDashboard], [/^\/my-plan$/, { title:'My plans | Ma3ak', render(){ return ''; }, mount(){ location.replace('#/dashboard'); } }], [/^\/partner$/, PartnerPortal], [/^\/book\/([\w-]+)$/, BookPage], [/^\/bookings\/([\w-]+)$/, BookingPage], [/^\/bookings$/, BookingsRedirect], [/^\/partner\/join$/, PartnerJoin], [/^\/login$/, Login], [/^\/register$/, Register], [/^\/forgot$/, Forgot], [/^\/reset$/, Reset], [/^\/verify$/, Verify], [/^\/account$/, AccountPage], [/^\/s\/([\w-]+)$/, SharedEvent], [/^\/i\/([\w-]+)$/, InvitePage], [/^\/studio\/([\w-]+)$/, GameStudio], [/^\/customize$/, GameStudio], [/^\/privacy$/, Privacy], [/^\/terms$/, Terms], [/^\/search$/, Search]
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
