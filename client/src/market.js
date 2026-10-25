/* =========================================================
   MARKETPLACE + BUDGET PLANNER (client)
   Website content, provider packages, quote requests, the database-backed
   budget planner, the customer dashboard and the partner portal.
   Everything here is saved on the server; nothing important lives in the browser.
   ========================================================= */

/* ---------- website content managed in the admin ---------- */
const SITE = { settings:{}, categories:[], fields:{}, vendorPlans:[], loaded:false };
SITE.ready = fetch('/api/site', { credentials:'same-origin' }).then(r => r.json()).then(j => { if (!j || !j.ok) return; SITE.settings = j.settings || {}; SITE.categories = j.categories || []; SITE.fields = j.fields || {}; SITE.vendorPlans = j.vendorPlans || []; SITE.loaded = true; applySite(); }).catch(() => {});
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
// Money: integer minor units + currency, exactly like the server. Never mixed across currencies.
const CUR = { USD:{ s:'$', d:2 }, EUR:{ s:'€', d:2 }, LBP:{ s:'LBP ', d:0 } };
const fmtMoney = (minor, cur = 'USD') => { if (minor == null || minor === '') return ''; const c = CUR[cur] || CUR.USD, neg = minor < 0, a = Math.abs(minor), w = Math.floor(a / 10 ** c.d), f = a % 10 ** c.d; return (neg ? '-' : '') + c.s + w.toLocaleString('en-US') + (c.d && f ? '.' + String(f).padStart(c.d, '0') : ''); };
const toInput = (minor, cur = 'USD') => minor == null ? '' : (CUR[cur] || CUR.USD).d ? (minor / 100).toFixed(2).replace(/\.00$/, '') : String(minor);
const rangeM = (lo, hi, cur) => hi != null && hi > lo ? `${fmtMoney(lo, cur)} – ${fmtMoney(hi, cur)}` : fmtMoney(lo, cur);
const PRICE_TYPE_TXT = { fixed:'Fixed price', starting:'Starting price', quote:'Custom quote' };
const pkgPrice = p => !p || p.priceType === 'quote' || p.priceMinor == null ? 'Custom quote' : `${p.priceType === 'starting' ? 'From ' : ''}${fmtMoney(p.priceMinor, p.currency)}${p.priceMaxMinor != null && p.priceMaxMinor > p.priceMinor ? '–' + fmtMoney(p.priceMaxMinor, p.currency) : ''}${UNIT_TXT[p.unit] || ''}`;
const linePrice = l => l.priceType === 'quote' || l.unitPriceMinor == null ? 'Custom quote' : `${l.priceType === 'starting' ? 'From ' : ''}${fmtMoney(l.unitPriceMinor, l.currency)}${l.priceMaxMinor != null && l.priceMaxMinor > l.unitPriceMinor ? '–' + fmtMoney(l.priceMaxMinor, l.currency) : ''}${UNIT_TXT[l.unit] || ''}`;
const priceTxt = (p, max, unit) => p == null ? 'Custom quote' : money(p) + (max != null && max > p ? '–' + money(max) : '') + (UNIT_TXT[unit] || '');
const rangeTxt = (lo, hi) => hi > lo ? `${money(lo)} – ${money(hi)}` : money(lo);
const fromTxt = v => v.startingFrom ? `${v.startingFrom.priceType === 'fixed' ? '' : 'From '}${fmtMoney(v.startingFrom.minor, v.startingFrom.currency)}${UNIT_TXT[v.startingFrom.unit] || ''}` : '';
const vBadges = v => `${v.isDemo ? `<span class="tag demo-tag" title="A sample listing for trying the planner. Not a real business; prices are illustrative.">Demo listing</span>` : ''}${v.verified ? `<span class="tag gold" title="MA3AK checked this business’s documents">${icon('check','sm')}Verified by MA3AK</span>` : ''}${v.sponsored ? `<span class="tag sponsored-tag" title="Paid placement. It doesn’t affect verification.">Sponsored</span>` : ''}`;
const findPkg = id => { for (const v of VENDORS) { const p = (v.packages || []).find(x => x.id === id); if (p) return { v, p }; } return null; };
const qtyFor = (unit, qty, guests) => qty != null ? qty : unit === 'per_guest' ? (guests || 0) : 1;
const STATUS_TXT = { draft:'Draft', finalized:'Finalized', sent:'Sent to MA3AK', booked:'Booked', archived:'Archived' };
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
    <div class="form-row">${FormField({ id:id('date'), label:'Date', type:'date', value:p.date || '' })}${FormField({ id:id('time'), label:'Start time', type:'time', value:p.time || '' })}</div>
    <div class="form-row">${FormField({ id:id('location'), label:'Area in Lebanon', options:opt(LOCATIONS), placeholder:'Choose an area', value:p.location || '' })}${FormField({ id:id('guests'), label:'Guests', type:'number', inputmode:'numeric', value:p.guests ?? '' })}</div>
    <div class="form-row">${FormField({ id:id('budget'), label:'Budget', type:'number', inputmode:'numeric', value:p.budget ?? '', hint:'Whole amount in the plan’s currency.' })}${FormField({ id:id('currency'), label:'Currency', options:Object.keys(CUR).map(c => ({ value:c, label:c })), value:p.currency || 'USD', showOpt:false, hint:'Totals in other currencies are shown separately; no exchange rates are applied.' })}</div>
    <div class="form-row">${FormField({ id:id('theme'), label:'Theme or style', options:themeNames().map(t => ({ value:t, label:t })), placeholder:'Any', value:p.theme || '' })}${FormField({ id:id('setting'), label:'Indoor or outdoor', options:[{ value:'indoor', label:'Indoor' }, { value:'outdoor', label:'Outdoor' }, { value:'both', label:'Both / not sure' }], placeholder:'Not sure yet', value:p.setting || '' })}</div>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Services you need</legend><div class="chip-row wanted">${CATEGORIES.map(c => `<label class="chip-check"><input type="checkbox" name="${id('wanted')}" value="${esc(c.id)}"${wanted.includes(c.id) ? ' checked' : ''}><span>${icon(c.icon,'sm')}${esc(c.single || c.name)}</span></label>`).join('')}</div></fieldset>
    ${FormField({ id:id('requirements'), label:'Special requirements', type:'textarea', value:p.requirements || '', placeholder:'Accessibility, dietary needs, timings, anything providers should know' })}`;
}
function readPlanForm(f, prefix = 'pf'){
  const v = k => (f.elements[`${prefix}-${k}`] || {}).value;
  const num = x => x === '' || x == null ? null : Math.round(+x);
  return { name:(v('name') || '').trim(), eventType:v('eventType') || '', date:v('date') || '', time:v('time') || '', currency:v('currency') || 'USD', location:v('location') || '', guests:num(v('guests')), budget:num(v('budget')), theme:v('theme') || '', setting:v('setting') || '',
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
  openModal({ title:'Add to a plan', body:`<p class="small muted" style="margin-bottom:1rem"><b>${esc(pkg.name)}</b> from ${esc(v.name)} · ${esc(pkgPrice(pkg))}. ${pkg.priceType === 'fixed' ? 'A fixed package price; the provider still confirms your date.' : 'This is an estimate until the provider sends a quote.'}</p>
    ${plans.length ? `<div class="pick-ev">${plans.map(p => `<button type="button" class="btn btn-ghost btn-block pick-row" data-pick="${esc(p.id)}"><span>${esc(p.name)}</span><small class="muted">${[p.event_date && fmtDate(p.event_date), p.guest_count && `${p.guest_count} guests`, p.est_low_minor != null && `≈ ${fmtMoney(p.est_low_minor, p.currency)}`].filter(Boolean).join(' · ')}</small></button>`).join('')}</div><p class="divider-text">or start a new plan</p>` : ''}
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
  if (!pk.length) return openBooking(v);
  if (pk.length === 1) return addToPlanFlow(v, pk[0]);
  openModal({ title:`Choose a package`, body:`<p class="small muted" style="margin-bottom:1rem">${esc(v.name)}${v.isDemo ? ' (demo listing — illustrative prices)' : ''}</p><div class="pick-ev">${pk.map(p => `<button type="button" class="btn btn-ghost btn-block pick-row" data-pkg="${esc(p.id)}"><span>${esc(p.name)}</span><small class="muted">${esc(pkgPrice(p))}</small></button>`).join('')}</div>`,
    onMount(m){ m.addEventListener('click', e => { const b = e.target.closest('[data-pkg]'); if (!b) return; closeModal(); addToPlanFlow(v, pk.find(p => p.id === b.dataset.pkg)); }); } });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-add-vendor]'); if (!b) return; e.preventDefault(); e.stopImmediatePropagation();
  const v = VENDORS.find(x => x.id === b.dataset.addVendor); if (v) choosePackage(v);
}, true);

/* ---------- booking request to a provider (the form itself is the #/book page in bookings.js) ---------- */
function openBooking(v, pkg, { planId } = {}){
  if (v.isDemo) return openModal({ title:'This is a sample listing', body:`<p class="muted">${esc(v.name)} is a demo listing that shows how Ma3ak works. It isn’t a real business, so it can’t be booked. Browse real providers or ask MA3AK to help you find one.</p><div class="chip-row" style="margin-top:1.25rem"><a class="btn btn-primary" href="#/vendors" data-close>Browse providers</a><a class="btn btn-ghost" href="#/contact" data-close>Contact MA3AK</a></div>` });
  location.hash = `#/book/${encodeURIComponent(v.id)}${qs({ package:pkg ? pkg.id : '', plan:planId || '' })}`;
}
const openQuoteModal = openBooking;

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
  const featured = VENDORS.filter(v => v.featured).sort((a, b) => (a.homeRank ?? 1e9) - (b.homeRank ?? 1e9) || (a.isDemo - b.isDemo)).slice(0, 4), anchor = $('.feat-band', root);
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
  const cur = p.currency || 'USD', bud = p.budget ? p.budget * 10 ** (CUR[cur] || CUR.USD).d : null, budget = bud ? ` of ${fmtMoney(bud, cur)}` : '', over = bud && p.est_low_minor > bud;
  return `<a class="plan-row" href="#/planner/${esc(p.id)}"><div><b>${esc(p.name)}</b><small class="muted">${[evName(p.event_type), p.event_date && fmtDate(p.event_date), p.location && locName(p.location), p.guest_count && `${p.guest_count} guests`].filter(Boolean).map(esc).join(' · ') || 'Details not set'}</small></div>
    <div class="pr-tot"><b class="${over ? 'over' : ''}">${p.services ? `≈ ${rangeM(p.est_low_minor || 0, p.est_high_minor || 0, cur)}` : 'No services yet'}</b><small class="muted">${p.services ? `${p.services} service${p.services === 1 ? '' : 's'}${budget}` : ''}${p.quote_items ? ` · ${p.quote_items} to quote` : ''}${p.other_currency_items ? ` · ${p.other_currency_items} in another currency` : ''}</small></div>
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
    // cheaper packages from other providers in the same category and currency, computed with the same rules as the server
    const alternatives = line => {
      if (line.lineLowMinor == null || line.agreed) return [];
      const out = [];
      VENDORS.filter(v => v.category === line.category).forEach(v => (v.packages || []).forEach(p => { if (p.priceType === 'quote' || p.priceMinor == null || p.id === line.packageId || p.currency !== line.currency) return;
        const q = p.unit === 'per_guest' ? guests() : p.unit === line.unit ? line.qty : p.unit === 'flat' ? 1 : (p.minQty || 1), tot = p.priceMinor * q;
        if (tot < line.lineLowMinor && (p.unit !== 'per_guest' || guests())) out.push({ v, p, tot, save:line.lineLowMinor - tot, cur:p.currency }); }));
      return out.sort((a, b) => a.tot - b.tot).slice(0, 4);
    };
    const lineHtml = l => { const alts = can ? alternatives(l) : [], v = VENDORS.find(x => x.id === l.vendorId);
      const qty = l.unit === 'flat' || l.agreed ? '' : `<label class="pl-q"><span>${l.unit === 'per_guest' ? 'Guests' : l.unit === 'per_hour' ? 'Hours' : 'Qty'}</span><input class="input" type="number" min="1" inputmode="numeric" value="${l.qty || ''}" data-qty="${esc(l.id)}"${can ? '' : ' disabled'}></label>${l.unit === 'per_guest' && !l.followsGuests && can ? `<button class="link tiny" type="button" data-follow="${esc(l.id)}">Use guest count</button>` : ''}`;
      const total = l.agreed ? `<b>${fmtMoney(l.agreed.totalMinor, l.agreed.currency)}</b><span class="tag gold">Agreed</span>` : l.lineLowMinor == null ? `<span class="tag">Quote needed</span>` : `<b>${rangeM(l.lineLowMinor, l.lineHighMinor, l.currency)}</b><small class="muted">${l.priceType === 'fixed' ? 'Package price' : 'Estimate'}</small>`;
      return `<div class="pl-line${l.lineLowMinor == null && !l.agreed ? ' quote' : ''}" data-line="${esc(l.id)}">
        <div class="pl-info"><b>${esc(l.label)}</b><small>${v ? `<a class="link" href="#/vendor/${esc(v.id)}">${esc(l.vendorName)}</a>` : esc(l.vendorName || (l.source === 'custom' ? 'Your own estimate' : ''))}${l.isDemo ? ' <span class="tag demo-tag">Demo</span>' : ''}</small>
          <small class="muted">${esc(linePrice(l))}${l.note ? ` · ${esc(l.note)}` : ''}</small>
          ${l.booking ? `<small><a class="link" href="#/bookings/${esc(l.booking.id)}">Booking ${esc(l.booking.ref)}</a> · ${esc(BOOKING_STATUS[l.booking.status] ? BOOKING_STATUS[l.booking.status][0] : l.booking.status)}</small>` : ''}
          ${l.currentPrice && can && !l.agreed ? `<p class="pl-warn">${icon('info','sm')}The provider changed this price to ${esc(pkgPrice({ ...l.currentPrice, unit:l.unit }))}. <button class="link" type="button" data-refresh="${esc(l.id)}">Update</button></p>` : ''}
          ${!l.available && !l.agreed ? `<p class="pl-warn">${icon('alert','sm')}This package is no longer listed.</p>` : ''}</div>
        <div class="pl-qty">${qty}</div>
        <div class="pl-total">${total}</div>
        <div class="pl-acts">${alts.length ? `<button class="btn btn-ghost btn-sm" type="button" data-alts="${esc(l.id)}">${icon('wallet','sm')}Save up to ${fmtMoney(alts[0].save, alts[0].cur)}</button>` : ''}${v && !l.booking && !v.isDemo ? `<button class="btn btn-ghost btn-sm" type="button" data-quote="${esc(l.id)}">${icon('send','sm')}Request to book</button>` : ''}${can ? `<button class="icon-btn" type="button" data-remove="${esc(l.id)}" aria-label="Remove ${esc(l.label)}">${icon('x','sm')}</button>` : ''}</div></div>`; };
    const suggestions = () => {
      const wanted = P().wanted.length ? P().wanted : (byId(EVENT_TYPES, P().eventType) || {}).services || ['venue','catering','photography','decoration'];
      const have = new Set(d.services.map(s => s.category)); if (!cat) cat = wanted.find(c => !have.has(c)) || wanted[0];
      let list = VENDORS.filter(v => v.category === cat);
      const fit = list.filter(v => (!P().location || !v.locations.length || v.locations.includes(P().location)) && (!P().eventType || !v.eventTypes.length || v.eventTypes.includes(P().eventType)) && (cat !== 'venue' || !P().guests || !v.capacity || v.capacity.max >= P().guests));
      const exact = fit.length > 0; list = (exact ? fit : list).slice(0, 4);
      const est = p => p.priceType === 'quote' || p.priceMinor == null ? 'Quote needed' : `≈ ${fmtMoney(p.priceMinor * (p.unit === 'per_guest' ? guests() : p.unit === 'flat' ? 1 : (p.minQty || 1)), p.currency)} for your plan${p.unit === 'per_guest' && !guests() ? ' (add guests)' : ''}`;
      return `<div class="chip-scroll" role="tablist" aria-label="Service categories">${[...new Set([...wanted, ...CATEGORIES.map(c => c.id)])].filter(c => byId(CATEGORIES, c)).map(c => `<button type="button" class="chip${c === cat ? ' active' : ''}${wanted.includes(c) ? ' wanted' : ''}" data-cat="${esc(c)}" aria-pressed="${c === cat}">${have.has(c) ? icon('check','sm') : icon(byId(CATEGORIES, c).icon,'sm')}${esc(byId(CATEGORIES, c).single || byId(CATEGORIES, c).name)}</button>`).join('')}</div>
        ${list.length ? `${exact ? '' : `<p class="small muted" style="margin:.8rem 0 0">No exact match for your area or event type yet, so here are other ${esc(catName(cat).toLowerCase())}.</p>`}<div class="sugg">${list.map(v => `<article class="sugg-v"><header><div><a class="link" href="#/vendor/${esc(v.id)}"><b>${esc(v.name)}</b></a> ${vBadges(v)}<small class="muted">${esc((v.locations || []).map(locName).join(', '))}</small></div>${v.isDemo ? '' : `<button class="btn btn-ghost btn-sm" type="button" data-vquote="${esc(v.id)}">Request to book</button>`}</header>
          ${(v.packages || []).map(p => `<div class="pkg-row"><div><b>${esc(p.name)}</b><small>${esc(pkgPrice(p))} · ${est(p)}</small></div>${can ? `<button class="btn btn-primary btn-sm" type="button" data-add-pkg="${esc(p.id)}">${icon('plus','sm')}Add</button>` : ''}</div>`).join('') || `<p class="small muted">No packages listed. Ask for a quote.</p>`}</article>`).join('')}</div>`
          : `<p class="muted small" style="margin-top:1rem">No ${esc(catName(cat).toLowerCase())} are listed yet. Add your own estimate below, or <a class="link" href="#/contact">ask MA3AK</a> to find options.</p>`}
        <a class="link small" href="#/search${qs({ category:cat, location:P().location || '' })}">See all ${esc(catName(cat).toLowerCase())}</a>`;
    };
    const totalsHtml = () => { const t = d.totals, cur = t.currency, main = t.byCurrency.find(x => x.currency === cur) || { low:0, high:0, discount:0, agreed:0, fees:[], feesLow:0, feesHigh:0, totalLow:0, totalHigh:0 };
      const b = t.budgetMinor, pct = b ? Math.min(100, Math.round(main.totalLow / b * 100)) : 0;
      const savings = t.overBudget ? d.services.map(l => ({ l, a:alternatives(l)[0] })).filter(x => x.a).sort((x, y) => y.a.save - x.a.save).slice(0, 3) : [];
      const others = t.byCurrency.filter(x => x.currency !== cur);
      return `<p class="small muted">${t.isEstimate ? 'Estimated total' : 'Total'} (${esc(cur)})</p><p class="kpi ${t.overBudget ? 'over' : ''}">${rangeM(main.totalLow, main.totalHigh, cur)}</p>
        ${b ? `<div class="meter${t.overBudget ? ' over' : ''}" role="img" aria-label="${pct}% of budget"><i style="width:${pct}%"></i></div>` : ''}
        <dl class="tot-dl">${main.estimateLines ? `<div><dt>Estimated services</dt><dd>${rangeM(main.low, main.high, cur)}</dd></div>` : ''}${main.discount ? `<div><dt>Discounts</dt><dd>−${fmtMoney(main.discount, cur)}</dd></div>` : ''}
          ${(main.fees || []).map(f => `<div><dt>${esc(f.label)} (${esc(f.basis)})</dt><dd>${fmtMoney(f.amountMinor, cur)}</dd></div>`).join('')}${main.agreed ? `<div><dt>Agreed with providers</dt><dd>${fmtMoney(main.agreed, cur)}</dd></div>` : ''}
          <div><dt>Budget</dt><dd>${b ? fmtMoney(b, cur) : '<button class="link" type="button" data-edit>Set a budget</button>'}</dd></div>
          ${b ? `<div><dt>${t.remainingMinor >= 0 ? 'Left' : 'Over by'}</dt><dd class="${t.remainingMinor < 0 ? 'over' : 'ok'}">${fmtMoney(Math.abs(t.remainingMinor), cur)}</dd></div>` : ''}
          ${P().guests && main.totalLow ? `<div><dt>Per guest</dt><dd>${fmtMoney(Math.round(main.totalLow / P().guests), cur)}</dd></div>` : ''}
          <div><dt>Services</dt><dd>${t.count}</dd></div>${t.quoteItems ? `<div><dt>Waiting for a price</dt><dd>${t.quoteItems}</dd></div>` : ''}</dl>
        ${others.length ? `<div class="notice">${icon('info')}<div><b>Other currencies</b>${others.map(o => `<p class="small">${esc(o.currency)}: ${rangeM(o.totalLow, o.totalHigh, o.currency)}</p>`).join('')}<p class="tiny muted">Not added to the ${esc(cur)} total — Ma3ak doesn’t convert currencies.</p></div></div>` : ''}
        ${t.overBudget ? `<div class="notice danger-note">${icon('alert')}<div><b>You’re over budget.</b>${savings.length ? `<p class="small">Cheaper options:</p><ul class="save-list">${savings.map(x => `<li><span>${esc(x.l.label)} → ${esc(x.a.p.name)} (${esc(x.a.v.name)})</span><button class="btn btn-ghost btn-sm" type="button" data-swap="${esc(x.l.id)}" data-to="${esc(x.a.p.id)}">Save ${fmtMoney(x.a.save, x.a.cur)}</button></li>`).join('')}</ul>` : '<p class="small">Try removing a service, lowering a quantity, or adjusting the guest count.</p>'}</div></div>` : ''}
        ${t.overBudgetHigh && !t.overBudget ? `<p class="small muted">${icon('info','sm')}At the top of the price ranges you’d go over budget.</p>` : ''}
        ${t.needsGuests ? `<p class="notice">${icon('users')}Add your guest count so per-guest prices can be estimated.</p>` : ''}
        <p class="tiny muted" style="margin-top:1rem">${t.isEstimate ? 'Estimates from providers’ listed packages' : 'Prices agreed with providers'}${d.services.some(s => s.isDemo) ? ' (demo listings use illustrative prices)' : ''}. A price is final only once you accept a provider’s quote; then it shows as “Agreed”.</p>
        ${can ? `<div class="stack" style="--s:.5rem;margin-top:1rem"><button class="btn btn-primary btn-block" type="button" data-send>${icon('send','sm')}Send plan to MA3AK</button><button class="btn btn-ghost btn-block" type="button" data-status>${P().status === 'finalized' ? 'Back to draft' : `${icon('check','sm')}Mark as finalized`}</button></div>` : ''}`; };
    const paint = () => {
      const p = P(), groups = {}; d.services.forEach(s => (groups[s.category] = groups[s.category] || []).push(s));
      document.title = `${p.name} | Ma3ak`;
      box.innerHTML = `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/dashboard">My plans</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
        <div class="plan-top"><div><p class="small muted">${esc(evName(p.eventType) || 'Event')} · <span class="tag ${p.status === 'finalized' ? 'gold' : ''}">${esc(STATUS_TXT[p.status] || p.status)}</span>${d.role !== 'owner' ? ` <span class="tag">${d.role === 'editor' ? 'Shared with you · can edit' : 'Shared with you · view only'}</span>` : ''}</p>
          <h1 class="h1">${esc(p.name)}</h1><p class="muted">${[p.date ? fmtDate(p.date) + (p.time ? ' · ' + p.time : '') : 'Date not set', p.location ? locName(p.location) : 'Area not set', p.guests ? `${p.guests} guests` : 'Guests not set', p.theme, p.setting && { indoor:'Indoor', outdoor:'Outdoor', both:'Indoor & outdoor' }[p.setting]].filter(Boolean).map(esc).join(' · ')}</p></div>
          <div class="chip-row">${can ? `<button class="btn btn-ghost btn-sm" type="button" data-edit>${icon('sliders','sm')}Edit details</button>` : ''}${d.role === 'owner' ? `<button class="btn btn-ghost btn-sm" type="button" data-share>${icon('share','sm')}Share</button>` : ''}<a class="btn btn-ghost btn-sm" href="#/studio/${esc(p.id)}">${icon('layers','sm')}3D design</a><button class="btn btn-ghost btn-sm" type="button" data-print>${icon('file','sm')}Print / PDF</button></div></div>
        <div class="plan-layout"><div class="plan-main">
          ${can ? `<details class="panel plan-details" id="pd"${detailsOpen ? ' open' : ''}><summary><h2 class="h3">Event details</h2><span class="small muted">Change anything; totals update</span></summary><form class="form" id="pd-form" novalidate style="margin-top:1rem">${planFields(p, 'pd')}<div class="chip-row"><button class="btn btn-primary" type="submit">Save details</button><span class="small muted" id="pd-saved" role="status"></span></div></form></details>` : ''}
          <section class="panel"><div class="tile-h"><h2 class="h3">Services in your plan</h2><span class="small muted">${d.services.length} item${d.services.length === 1 ? '' : 's'}</span></div>
            ${d.services.length ? Object.entries(groups).map(([c, ls]) => `<div class="pl-group"><h3 class="pl-cat">${icon((byId(CATEGORIES, c) || {}).icon || 'more','sm')}${esc(catName(c) || c)}</h3>${ls.map(lineHtml).join('')}</div>`).join('') : `<p class="muted" style="margin-top:.8rem">Nothing yet. Pick a category below and add packages from providers, or add your own estimate.</p>`}</section>
          ${can ? `<section class="panel" id="add-sec"><h2 class="h3">Add services</h2><p class="small muted" style="margin:.3rem 0 1rem">Start with the venue: its capacity and location shape everything else. Providers that match your area, event type and guest count come first.</p><div id="sugg">${suggestions()}</div>
            <details class="custom-add"><summary>${icon('plus','sm')}Add your own item or estimate</summary><form class="form" id="ci-form" novalidate style="margin-top:1rem"><div class="form-row">${FormField({ id:'ci-label', label:'What is it?', required:true, placeholder:'e.g. Wedding favours' })}${FormField({ id:'ci-cat', label:'Category', options:opt(CATEGORIES), required:true, value:cat || '' })}</div>
              <div class="form-row">${FormField({ id:'ci-price', label:`Price (${esc(p.currency || 'USD')})`, type:'text', inputmode:'decimal', hint:'Leave empty if you don’t know yet.' })}${FormField({ id:'ci-unit', label:'Priced', options:Object.entries(UNIT_NAMES).map(([value, label]) => ({ value, label })), value:'flat', showOpt:false })}</div>
              ${FormField({ id:'ci-qty', label:'Quantity', type:'number', inputmode:'numeric', hint:'Per-guest items follow your guest count if left empty.' })}<button class="btn btn-ghost" type="submit">Add to plan</button></form></details></section>` : ''}
          <section class="panel"><h2 class="h3">Private notes</h2><p class="small muted" style="margin:.3rem 0 .8rem">Only you can see these. They’re never included in share links.</p>
            ${d.role === 'owner' ? `<textarea class="textarea" id="pl-notes" rows="4" maxlength="5000" placeholder="Ideas, contacts, reminders…">${esc(p.notes || '')}</textarea>` : `<p class="muted small">Notes are private to the plan owner.</p>`}</section>
        </div><aside class="plan-side"><div class="panel totals" id="totals">${totalsHtml()}</div></aside></div>`;
      const f = $('#pd-form', box); if (f){ f.elements['pd-date'].min = ''; $('#pd', box).addEventListener('toggle', e => { detailsOpen = e.target.open; }); }
    };
    paint();

    const savePlan = async (patch, msg) => { const p = P(); return call('PUT', `/api/events/${id}/plan`, { name:p.name, eventType:p.eventType || '', date:p.date || '', time:p.time || '', currency:p.currency || 'USD', location:p.location || '', guests:p.guests, budget:p.budget, theme:p.theme || '', setting:p.setting || '', wanted:p.wanted, notes:p.notes, requirements:p.requirements, rev:p.rev, ...patch }).then(ok => { if (ok && msg) toast(msg); return ok; }); };
    box.addEventListener('submit', async e => {
      if (e.target.id === 'pd-form'){ e.preventDefault(); const f = e.target; if (!validateForm(f, { 'pd-name':V.req('a name') })) return; const ok = await savePlan(readPlanForm(f, 'pd')); if (ok){ detailsOpen = false; paint(); toast('Details saved'); } }
      if (e.target.id === 'ci-form'){ e.preventDefault(); const f = e.target; if (!validateForm(f, { 'ci-label':V.req('what it is'), 'ci-cat':V.select('a category') })) return;
        const g = k => f.elements[k].value.trim(); const ok = await call('POST', `/api/events/${id}/services`, { label:g('ci-label'), category:g('ci-cat'), unitPrice:g('ci-price') === '' ? null : g('ci-price').replace(/,/g, ''), currency:P().currency || 'USD', unit:g('ci-unit') || 'flat', quantity:g('ci-qty') === '' ? null : +g('ci-qty') }); if (ok) toast('Added to your plan'); }
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
        openModal({ title:'Cheaper options', body:`<p class="small muted" style="margin-bottom:1rem">Instead of <b>${esc(l.label)}</b> (${rangeM(l.lineLowMinor, l.lineHighMinor, l.currency)}). Estimates for your plan.</p><div class="pick-ev">${alts.map(a => `<div class="pkg-row"><div><b>${esc(a.p.name)}</b><small>${esc(a.v.name)}${a.v.isDemo ? ' · demo' : ''} · ${esc(pkgPrice(a.p))} · ≈ ${fmtMoney(a.tot, a.cur)}</small></div><button class="btn btn-primary btn-sm" type="button" data-swap="${esc(l.id)}" data-to="${esc(a.p.id)}">Save ${fmtMoney(a.save, a.cur)}</button></div>`).join('')}</div>`,
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
  openModal({ title:'Share this plan', body:`<p class="small muted" style="margin-bottom:1rem">People with the link see the plan and the services you choose below. They never see your email, phone, private notes, bookings or payments. Links are off until you create one, and you can turn them off any time.</p>
    <div id="sh-list"></div><fieldset class="field" style="border:0;padding:0;margin:1rem 0 0"><legend class="label">Include in new links</legend><div class="chip-row"><label class="chip-check"><input type="checkbox" id="sh-prices" checked><span>Prices and totals</span></label><label class="chip-check"><input type="checkbox" id="sh-prov" checked><span>Provider names</span></label><label class="chip-check"><input type="checkbox" id="sh-date" checked><span>Event date</span></label></div></fieldset><div class="chip-row" style="margin-top:1rem"><button class="btn btn-primary" type="button" data-mk="view">${icon('eye','sm')}Create view-only link</button><button class="btn btn-ghost" type="button" data-mk="edit">${icon('users','sm')}Invite someone to edit</button></div><div id="sh-new" style="margin-top:1rem"></div>`,
    onMount(m){
      const paintList = () => { $('#sh-list', m).innerHTML = rows().length ? rows().map(s => `<div class="sh-row"><span class="small">${s.permission === 'edit' ? 'Can edit' : 'View only'} · ${[s.show_prices ? 'prices' : '', s.show_providers ? 'providers' : '', s.show_date ? 'date' : ''].filter(Boolean).join(', ') || 'no prices, providers or date'} · ${s.views} view${s.views === 1 ? '' : 's'} · until ${fmtDate(s.expires_at.slice(0, 10))}</span><button class="link" type="button" data-off="${esc(s.id)}">Turn off</button></div>`).join('') : '<p class="small muted">No active links.</p>'; };
      paintList();
      m.addEventListener('click', async e => {
        const mk = e.target.closest('[data-mk]'); if (mk){ try { const r = await apiU('POST', `/api/events/${id}/shares`, { permission:mk.dataset.mk, days:30, showPrices:$('#sh-prices', m).checked, showProviders:$('#sh-prov', m).checked, showDate:$('#sh-date', m).checked }); d = await load(); paintList();
          $('#sh-new', m).innerHTML = `<label class="small muted" for="sh-url">Copy this link (shown once):</label><div class="chip-row"><input class="input" id="sh-url" readonly value="${esc(r.share.url)}"><button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(r.share.url)}">${icon('copy','sm')}Copy</button></div>`; $('#sh-url', m).select(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
        const off = e.target.closest('[data-off]'); if (off){ try { await apiU('DELETE', `/api/events/${id}/shares/${off.dataset.off}`); d = await load(); paintList(); toast('Link turned off'); } catch(err){ toast(esc(err.message), 'alert'); } }
      });
    } });
}
const totalsLine = t => t.byCurrency.length ? t.byCurrency.map(x => `${rangeM(x.totalLow, x.totalHigh, x.currency)}`).join(' + ') : '—';
function planText(d){
  const p = d.plan, cur = p.currency || 'USD', lines = d.services.map(s => `• ${catName(s.category) || s.category}: ${s.label}${s.vendorName ? ` (${s.vendorName}${s.isDemo ? ', demo listing' : ''})` : ''} — ${s.agreed ? `${fmtMoney(s.agreed.totalMinor, s.agreed.currency)} agreed` : s.lineLowMinor == null ? 'quote needed' : rangeM(s.lineLowMinor, s.lineHighMinor, s.currency) + ' estimate'}${s.unit !== 'flat' && !s.agreed ? ` [${s.qty} × ${linePrice(s)}]` : ''}`);
  return [`Plan: ${p.name}`, `Event: ${evName(p.eventType) || 'not set'} · Date: ${p.date || 'not set'}${p.time ? ' ' + p.time : ''} · Area: ${p.location ? locName(p.location) : 'not set'} · Guests: ${p.guests || 'not set'}`, `Budget: ${p.budget ? fmtMoney(p.budget * 10 ** (CUR[cur] || CUR.USD).d, cur) : 'not set'} · Theme: ${p.theme || '—'} · Setting: ${p.setting || '—'}`,
    p.requirements ? `Special requirements: ${p.requirements}` : '', '', 'SERVICES', ...lines, '', `${d.totals.isEstimate ? 'Estimated total' : 'Total'}: ${totalsLine(d.totals)}${d.totals.quoteItems ? ` + ${d.totals.quoteItems} item(s) awaiting a quote` : ''}`].filter(x => x !== null).join('\n');
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
        try { const r = await apiPost('/api/requests', { contact:{ fullName:g('sp-name'), phone:g('sp-phone'), email:u.email }, choices:{ eventType:type, eventName:p.name, date:p.date || '', guests:p.guests || 0, budget:p.budget || 0, currency:p.currency || 'USD', style:p.theme ? [p.theme] : [] }, text:planText(d) + (g('sp-msg') ? `\n\nMessage: ${g('sp-msg')}` : ''), eventId:p.id, consent:true, ...formMeta(f) });
          $('.modal-body', m).innerHTML = sentPanel({ title:'Plan sent', text:'Thanks! The MA3AK team has your plan and will contact you.', refNo:r.ref }); }
        catch(err){ busy(btn, false); showServerErrors(f, err, { fullName:'sp-name', phone:'sp-phone', eventType:'sp-type' }); toast(esc(err.message), 'alert'); } }); } });
}
function printPlan(d){
  const p = d.plan, w = document.createElement('div'); w.className = 'print-sheet';
  w.innerHTML = `<header><div class="print-logo">${Logo({ tag:'span', label:false })}</div><h1>${esc(p.name)}</h1><p>${[evName(p.eventType), p.date && fmtDate(p.date), p.location && locName(p.location), p.guests && `${p.guests} guests`, p.budget && `Budget ${fmtMoney(p.budget * 10 ** (CUR[p.currency || 'USD'] || CUR.USD).d, p.currency || 'USD')}`].filter(Boolean).map(esc).join('  ·  ')}</p></header>
    <table><tr><th>Service</th><th>Provider</th><th>Price</th><th>Qty</th><th>Estimate</th></tr>${d.services.map(s => `<tr><td>${esc(s.label)}</td><td>${esc(s.vendorName || '')}${s.isDemo ? ' (demo)' : ''}</td><td>${esc(linePrice(s))}</td><td>${s.unit === 'flat' ? '' : s.qty}</td><td>${s.agreed ? esc(fmtMoney(s.agreed.totalMinor, s.agreed.currency)) + ' (agreed)' : s.lineLowMinor == null ? 'Quote' : esc(rangeM(s.lineLowMinor, s.lineHighMinor, s.currency))}</td></tr>`).join('')}
      <tr><th colspan="4">${d.totals.isEstimate ? 'Estimated total' : 'Total'}</th><th>${esc(totalsLine(d.totals))}</th></tr></table>
    <p>Lines marked “agreed” are prices accepted in a provider’s quote. Everything else is an estimate from providers’ listed packages; the final price and availability are confirmed by each provider.</p><footer>MA3AK · ${esc(CONFIG.email)} · ${esc(CONFIG.phone)} · Printed ${fmtDate(new Date())}</footer>`;
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
      <div class="dash-tabs chip-row" role="tablist"><button class="chip" data-dt="plans">My plans</button><button class="chip" data-dt="shared">Shared with me</button><button class="chip" data-dt="bookings">${icon('calendar','sm')}Bookings</button><button class="chip" data-dt="fav">${icon('heart','sm')}Favourites</button></div><div id="dash-list">${Skeletons(3)}</div>`);
    let data = null, favs = [], bookings = null; await VENDORS_READY;
    const list = () => $('#dash-list', box);
    const paint = tab => { $$('[data-dt]', box).forEach(x => x.classList.toggle('active', x.dataset.dt === tab)); const el = list();
      if (tab === 'plans' || tab === 'shared'){ const evs = tab === 'shared' ? data.shared : data.events;
        el.innerHTML = evs.length ? `<div class="plan-list">${evs.map(e => `<div class="plan-card">${PlanRow(e)}<div class="chip-row pc-acts"><a class="btn btn-ghost btn-sm" href="#/planner/${esc(e.id)}">${icon('wallet','sm')}Budget plan</a><a class="btn btn-ghost btn-sm" href="#/studio/${esc(e.id)}">${icon('layers','sm')}3D design</a>${tab === 'plans' ? `<button class="icon-btn" data-dup="${esc(e.id)}" aria-label="Duplicate ${esc(e.name)}">${icon('copy','sm')}</button><button class="icon-btn" data-del="${esc(e.id)}" aria-label="Delete ${esc(e.name)}">${icon('x','sm')}</button>` : ''}</div></div>`).join('')}</div>`
          : tab === 'shared' ? EmptyState({ iconName:'users', title:'Nothing shared with you yet', text:'When someone invites you to their plan, it appears here.' }) : EmptyState({ iconName:'wallet', title:'Start your first plan', text:'Add your event details and budget, then pick services from providers.', actions:`<a class="btn btn-primary" href="#/plan">${icon('plus','sm')}New plan</a>` });
        return; }
      if (tab === 'bookings' || tab === 'quotes'){ if (!bookings){ el.innerHTML = Skeletons(2); apiU('GET', '/api/my/bookings').then(r => { bookings = r.bookings; paint('bookings'); }).catch(err => { el.innerHTML = EmptyState({ iconName:'alert', title:'Bookings didn’t load', text:esc(err.message) }); }); return; }
        el.innerHTML = bookings.length ? bookingListHtml(bookings, 'customer') : EmptyState({ iconName:'calendar', title:'No booking requests yet', text:'Choose a provider and send a booking request with your date and details. Quotes and confirmations appear here.', actions:`<a class="btn btn-ghost" href="#/vendors">Browse providers</a>` }); return; }
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
/* The partner portal lives in bookings.js. */
