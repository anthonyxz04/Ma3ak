/* =========================================================
   BOOKINGS (client)
   Booking request form with a review step, the booking page shared by the customer and the provider
   (quotes, revisions, acceptance, payments recorded, cancellations, messages, reviews), notifications,
   reports, and the provider's partner page (verification, documents, availability, plan and fees).
   The server enforces every rule; this file only shows what the server allows.
   ========================================================= */
const BOOKING_STATUS = {
  draft:['Draft','Not sent yet.','Not sent yet.'],
  quote_requested:['Request sent','Waiting for the provider’s quote. This is a request, not a confirmed booking.','New request: send a quote or decline.'],
  quote_received:['Quote received','Read the quote, then accept it, ask for changes, or decline. Nothing is booked until you accept.','Quote sent. Waiting for the customer’s answer.'],
  revision_requested:['Changes requested','The provider is preparing a revised quote.','The customer asked for changes. Send a revised quote or decline.'],
  awaiting_vendor:['Waiting for the provider','You chose a fixed-price package. The provider still has to confirm your date. Not confirmed yet.','Fixed-price request: confirm the date at the package price, send a different quote, or decline.'],
  awaiting_payment:['Deposit needed','The price is agreed. Pay the deposit as described in the quote; the booking is confirmed once it is recorded.','Price agreed. Waiting for the deposit — record it when you receive it.'],
  confirmed:['Confirmed','Your booking is confirmed.','Booking confirmed.'],
  in_progress:['In progress','The event is under way.','Event in progress.'],
  completed:['Completed','This booking is complete.','Completed.'],
  cancellation_requested:['Cancellation requested','A cancellation was requested. The other side needs to answer.','A cancellation was requested. The other side needs to answer.'],
  cancelled:['Cancelled','This booking was cancelled.','This booking was cancelled.'],
  declined:['Declined','This request was declined.','This request was declined.'],
  expired:['Expired','This request expired without an agreement.','This request expired without an agreement.'],
};
const PAY_TXT = { none:'', pending:'Payment pending', deposit_paid:'Deposit paid', paid:'Paid', partially_refunded:'Partly refunded', refunded:'Refunded', failed:'Payment failed' };
const statusTone = s => ['confirmed','in_progress','completed'].includes(s) ? 'gold' : ['quote_received','awaiting_payment','awaiting_vendor','cancellation_requested','revision_requested'].includes(s) ? 'warn-tag' : '';
const ACTION_TXT = { requested:'Request sent', offer_sent:'Quote sent', offer_revised:'Revised quote sent', revision_requested:'Changes requested', offer_accepted:'Offer accepted', offer_rejected:'Quote declined',
  offer_withdrawn:'Quote withdrawn', declined_by_vendor:'Declined by the provider', cancelled_by_customer:'Cancelled by the customer', cancellation_requested:'Cancellation requested', cancellation_withdrawn:'Cancellation withdrawn',
  cancellation_refused:'Cancellation not accepted', cancellation_approved:'Cancelled (both sides agreed)', cancelled_by_admin:'Cancelled by MA3AK', payment_recorded:'Payment recorded', refund_recorded:'Refund recorded',
  deposit_received:'Deposit received — booking confirmed', started:'Event started', completed:'Marked completed', completed_by_admin:'Marked completed by MA3AK', amendment_proposed:'Change proposed', amendment_accepted:'Change accepted',
  amendment_rejected:'Change declined', amendment_revision_requested:'Changes to the proposal requested', offer_expired:'Quote expired', event_date_passed:'Expired (event date passed)', migrated:'Imported from an earlier quote request', customer_account_deleted:'Customer account deleted' };
const ENT_TXT = { maxPhotos:'Photos', maxPackages:'Packages', analytics:'Performance analytics', leadTools:'Lead tools (spreadsheet export)', featuredEligible:'Can be considered for featured placement (never guaranteed)', portfolioSections:'Portfolio sections' };
const CC = [['+961','Lebanon'],['+971','UAE'],['+966','Saudi Arabia'],['+974','Qatar'],['+965','Kuwait'],['+962','Jordan'],['+20','Egypt'],['+357','Cyprus'],['+33','France'],['+49','Germany'],['+44','UK'],['+1','USA / Canada'],['+61','Australia']];
const parseMinor = (s, cur = 'USD') => { s = String(s ?? '').replace(/[\s,]/g, ''); if (!s) return null; const m = /^(\d{1,13})(?:\.(\d*))?$/.exec(s); if (!m) return NaN; const d = (CUR[cur] || CUR.USD).d, f = m[2] || ''; if (f.length > d && /[1-9]/.test(f.slice(d))) return NaN; return Number(m[1]) * 10 ** d + Number((f + '0'.repeat(d)).slice(0, d) || 0); };
const feesPreview = (sub, cur) => (SITE.settings.customerFees || []).map(f => f.type === 'percent' ? { label:f.label, amountMinor:Math.round(Math.max(0, sub) * f.bps / 10000), basis:`${f.bps / 100}%` } : f.currency === cur ? { label:f.label, amountMinor:f.amountMinor, basis:'flat' } : null).filter(Boolean);
const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2));
const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);

/* ---------- service-specific fields (from the server, one list per category) ---------- */
const catFields = (category, scope) => ((SITE.fields || {})[category] || {})[scope] || (scope === 'booking' ? [{ key:'startTime', label:'Start time', type:'time' }] : []);
function fieldInputs(fields, values = {}, prefix = 'fx'){
  return (fields || []).map(f => { const id = `${prefix}-${f.key}`, v = values[f.key];
    if (f.type === 'bool') return `<label class="check field"><input type="checkbox" id="${id}" name="${id}"${v ? ' checked' : ''}> ${esc(f.label)}</label>`;
    if (f.type === 'multi') return `<fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">${esc(f.label)}</legend><div class="chip-row">${f.options.map(o => `<label class="chip-check"><input type="checkbox" name="${id}" value="${esc(o)}"${(v || []).includes(o) ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div><span class="err" id="${id}-err" role="alert"></span></fieldset>`;
    if (f.type === 'select') return FormField({ id, label:esc(f.label), options:f.options.map(o => ({ value:o, label:o })), placeholder:'Choose', value:v || '' });
    if (f.type === 'textarea') return FormField({ id, label:esc(f.label), type:'textarea', value:v || '', placeholder:f.placeholder || '' });
    if (f.type === 'time') return FormField({ id, label:esc(f.label), type:'time', value:v || '' });
    if (f.type === 'int') return FormField({ id, label:esc(f.label) + (f.unit === 'h' ? ' (hours)' : ''), type:'number', inputmode:'numeric', value:v ?? '' });
    return FormField({ id, label:esc(f.label), value:v || '' });
  }).join('');
}
function readFields(form, fields, prefix = 'fx'){
  const out = {};
  for (const f of fields || []){ const id = `${prefix}-${f.key}`;
    if (f.type === 'multi'){ out[f.key] = $$(`input[name="${id}"]:checked`, form).map(x => x.value); continue; }
    const el = form.elements[id]; if (!el) continue;
    out[f.key] = f.type === 'bool' ? el.checked : f.type === 'int' ? (el.value === '' ? '' : +el.value) : el.value.trim();
  }
  return out;
}
function detailsList(fields, values){
  const rows = (fields || []).filter(f => values && values[f.key] !== undefined && values[f.key] !== '' && !(Array.isArray(values[f.key]) && !values[f.key].length))
    .map(f => { const v = values[f.key]; return `<li><span class="muted">${esc(f.label)}:</span> ${esc(f.type === 'bool' ? (v ? 'Yes' : 'No') : Array.isArray(v) ? v.join(', ') : f.unit === 'h' ? `${v} h` : v)}</li>`; });
  return rows.length ? `<ul class="small detail-list">${rows.join('')}</ul>` : '';
}
function pkgDetailsHtml(pk, category){
  return `${detailsList(catFields(category, 'package'), pk.details)}
    ${(pk.includes || []).length ? `<p class="tiny muted" style="margin-top:.6rem">Included</p><ul class="small inc-list">${pk.includes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${(pk.exclusions || []).length ? `<p class="tiny muted" style="margin-top:.6rem">Not included</p><ul class="small exc-list">${pk.exclusions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${pk.conditions ? `<p class="small" style="margin-top:.6rem"><span class="muted">Conditions:</span> ${esc(pk.conditions)}</p>` : ''}${pk.minQty ? `<p class="tiny muted">Minimum: ${pk.minQty}</p>` : ''}`;
}
// Server field errors ("details.startTime") onto the matching inputs.
function showFieldErrors(form, err, map = {}, prefix = 'fx'){
  Object.entries(err.fields || {}).forEach(([k, msg]) => { const id = k.startsWith('details.') ? `${prefix}-${k.slice(8)}` : (map[k] || k); const e = $('#' + id + '-err', form); if (e) e.textContent = msg; const el = form.elements[id]; if (el && el.closest) { const f = el.closest('.field'); if (f) f.classList.add('invalid'); } });
}

/* ---------- lists ---------- */
function bookingListHtml(list, role){
  return `<div class="plan-list">${list.map(b => { const st = BOOKING_STATUS[b.status] || [b.status];
    const price = b.agreedTotalMinor != null ? `${fmtMoney(b.agreedTotalMinor, b.currency)} agreed` : b.latestOffer && b.latestOffer.status === 'sent' ? `Quote: ${fmtMoney(b.latestOffer.totalMinor, b.latestOffer.currency)}` : b.estimateMinor != null ? `Estimate: ${fmtMoney(b.estimateMinor, b.currency)}` : 'Custom quote';
    return `<a class="q-card bk-row" href="#/bookings/${esc(b.id)}"><header><div><b>${esc(role === 'vendor' ? b.customerName : b.vendor.name)}</b><small class="muted">${esc(b.ref)}${b.packageName ? ` · ${esc(b.packageName)}` : ''}${b.eventType ? ` · ${esc(evName(b.eventType) || b.eventType)}` : ''}${b.eventDate ? ` · ${esc(fmtDate(b.eventDate))}` : ''}${b.guests ? ` · ${b.guests} guests` : ''}</small></div><span class="tag ${statusTone(b.status)}">${esc(st[0])}</span></header>
      <p class="small">${esc(price)}${PAY_TXT[b.paymentStatus] ? ` · ${esc(PAY_TXT[b.paymentStatus])}` : ''}${b.unread ? ` · <b>${b.unread} new message${b.unread === 1 ? '' : 's'}</b>` : ''}</p></a>`; }).join('')}</div>`;
}

/* ---------- reports ---------- */
function openReport(type, id){
  const reasons = ['Asked me to pay or book outside Ma3ak', 'Shared contact details to avoid Ma3ak', 'Spam or scam', 'Offensive or abusive', 'Fake or misleading', 'Other'];
  openModal({ title:'Report to MA3AK', body:`<form class="form" id="rp-form" novalidate><p class="small muted">MA3AK reviews every report. The other person isn’t told who reported them.</p>
    ${FormField({ id:'rp-reason', label:'What’s wrong?', options:reasons.map(r => ({ value:r, label:r })), required:true })}${FormField({ id:'rp-details', label:'Details', type:'textarea' })}
    <button class="btn btn-primary" type="submit">${icon('flag','sm')}Send report</button></form>`,
    onMount(m){ $('#rp-form', m).addEventListener('submit', async e => { e.preventDefault(); const f = e.target; if (!validateForm(f, { 'rp-reason':V.select('a reason') })) return; const btn = $('[type=submit]', f); busy(btn, true);
      try { await apiU('POST', '/api/reports', { targetType:type, targetId:String(id), reason:f.elements['rp-reason'].value, details:f.elements['rp-details'].value }); closeModal(); toast('Report sent. Thank you.'); } catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); } }); } });
}

/* ---------- notifications (bell in the header) ---------- */
const NOTIF = { unread:0, items:[], timer:null };
function paintBell(){
  const acct = $('#acct-btn'); if (!acct) return; let b = $('#notif-btn');
  if (!AUTH.user){ if (b) b.remove(); return; }
  if (!b){ acct.insertAdjacentHTML('beforebegin', `<button class="icon-btn notif-btn" id="notif-btn" type="button" aria-label="Notifications" aria-expanded="false">${icon('bell')}<span class="notif-n" hidden></span></button>`); b = $('#notif-btn'); b.addEventListener('click', toggleNotifs); }
  const n = $('.notif-n', b); n.hidden = !NOTIF.unread; n.textContent = NOTIF.unread > 9 ? '9+' : NOTIF.unread; b.setAttribute('aria-label', NOTIF.unread ? `Notifications, ${NOTIF.unread} unread` : 'Notifications');
}
async function refreshNotifs(){ if (!AUTH.user) return; try { const r = await apiU('GET', '/api/notifications'); NOTIF.items = r.items; NOTIF.unread = r.unread; paintBell(); } catch(e){} }
function toggleNotifs(){
  let p = $('#notif-panel'); const b = $('#notif-btn');
  if (p){ p.remove(); b && b.setAttribute('aria-expanded', 'false'); return; }
  document.body.insertAdjacentHTML('beforeend', `<div class="notif-panel" id="notif-panel" role="dialog" aria-label="Notifications"><div class="notif-h"><b>Notifications</b>${NOTIF.unread ? '<button class="link small" type="button" data-read-all>Mark all as read</button>' : ''}</div>
    <div class="notif-list">${NOTIF.items.length ? NOTIF.items.map(n => `<a class="notif-it${n.read_at ? '' : ' unread'}" href="${esc(n.link && n.link.startsWith('#/') ? n.link : '#/dashboard')}" data-nid="${n.id}"><b>${esc(n.title)}</b>${n.body ? `<span>${esc(n.body)}</span>` : ''}<small class="muted">${esc(new Date(n.created_at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }))}</small></a>`).join('') : '<p class="small muted" style="padding:1rem">Nothing yet.</p>'}</div></div>`);
  p = $('#notif-panel'); b && b.setAttribute('aria-expanded', 'true');
  p.addEventListener('click', async e => {
    if (e.target.closest('[data-read-all]')){ await apiU('POST', '/api/notifications/read', { all:true }).catch(() => {}); p.remove(); refreshNotifs(); return; }
    const it = e.target.closest('[data-nid]'); if (it){ apiU('POST', '/api/notifications/read', { ids:[+it.dataset.nid] }).then(refreshNotifs).catch(() => {}); p.remove(); }
  });
  setTimeout(() => document.addEventListener('click', function close(e){ if (!e.target.closest('#notif-panel,#notif-btn')){ const x = $('#notif-panel'); if (x) x.remove(); document.removeEventListener('click', close); } }), 0);
}
(function setupNotifs(){
  const orig = paintAccountBtn;
  paintAccountBtn = function(){ orig(); paintBell(); if (AUTH.user) refreshNotifs(); };
  if (AUTH.ready) AUTH.ready.then(() => { paintBell(); refreshNotifs(); });
  NOTIF.timer = setInterval(() => { if (document.visibilityState === 'visible' && AUTH.user) refreshNotifs(); }, 60000);
  addEventListener('hashchange', () => { const p = $('#notif-panel'); if (p) p.remove(); });
})();

/* ---------- booking request form: service → event → contact → review ---------- */
const BookPage = { title:'Request to book | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap" id="bk">${Skeletons(2)}</div></section>`; },
  async mount(root, [vid], q){
    await Promise.all([AUTH.ready, SITE.ready]); const box = $('#bk', root);
    let v = null; try { const j = await (await fetch(`/api/vendors/${encodeURIComponent(vid)}`)).json(); if (j.ok) v = j.vendor; } catch(e){}
    if (!v){ box.innerHTML = EmptyState({ iconName:'store', level:'h1', title:'This provider isn’t listed', text:'They may have left Ma3ak or be under review.', actions:`<a class="btn btn-primary" href="#/vendors">Browse providers</a>` }); return; }
    if (v.isDemo){ box.innerHTML = EmptyState({ iconName:'info', level:'h1', title:'Sample listings can’t be booked', text:`${esc(v.name)} is a demo listing that shows how Ma3ak works. It isn’t a real business.`, actions:`<a class="btn btn-primary" href="#/vendors">Browse providers</a>` }); return; }
    const u = AUTH.user;
    if (!u){ box.innerHTML = `<div class="panel" style="max-width:620px"><h1 class="h2">Sign in to send a booking request</h1><p class="muted" style="margin:.6rem 0 1.25rem">Your requests, quotes and messages with ${esc(v.name)} are kept in your account, so you can follow them from any device.</p><div class="chip-row"><a class="btn btn-primary" href="#/register" data-next>Create free account</a><a class="btn btn-ghost" href="#/login" data-next>Sign in</a></div></div>`;
      $$('[data-next]', box).forEach(a => a.addEventListener('click', () => sessionStorage.setItem('ma3ak:next', location.hash))); return; }
    let plans = []; try { plans = (await apiU('GET', '/api/events')).events; } catch(e){}
    const pk = (v.packages || []), plan = plans.find(p => p.id === q.get('plan')), fields = catFields(v.category, 'booking').filter(f => f.key !== 'startTime');
    const needVerify = AUTH.cfg.email && !u.verified;
    const ph = String(u.phone || ''), cc = (CC.find(c => ph.replace(/\s/g, '').startsWith(c[0])) || CC[0])[0], local = ph.startsWith(cc) ? ph.slice(cc.length).trim() : ph.startsWith('+') ? '' : ph;
    let step = 0, preview = null;
    const STEPS = ['Service', 'Event', 'Your details', 'Review'];
    box.innerHTML = `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/vendors">Providers</a><span aria-hidden="true">/</span><a href="#/vendor/${esc(v.id)}">${esc(v.name)}</a><span aria-hidden="true">/</span><span aria-current="page">Request to book</span></nav>
      <h1 class="h1">Request to book ${esc(v.name)}</h1><p class="lede">Send your date and details. ${esc(v.name)} replies with a quote or confirms a fixed-price package. Nothing is booked or paid until you accept.</p>
      ${needVerify ? `<p class="notice" style="margin-top:1rem">${icon('mail')}<span>Please confirm your email address before sending a request. <button class="link" type="button" id="bk-resend">Send the link again</button></span></p>` : ''}
      <ol class="stepper" aria-label="Steps">${STEPS.map((s, i) => `<li data-st="${i}">${i + 1}. ${s}</li>`).join('')}</ol>
      <form class="form panel bk-form" id="bk-form" novalidate>
        <fieldset data-step="0"><legend class="h3">What would you like to book?</legend>
          <div class="pick-pkg">${pk.map(p => `<label class="pkg-opt"><input type="radio" name="bk-pkg" value="${esc(p.id)}"${(q.get('package') === p.id) ? ' checked' : ''}><span><b>${esc(p.name)}</b><small>${esc(PRICE_TYPE_TXT[p.priceType] || '')} · ${esc(pkgPrice(p))}</small>${p.description ? `<small class="muted">${esc(p.description)}</small>` : ''}</span></label>`).join('')}
            <label class="pkg-opt"><input type="radio" name="bk-pkg" value=""${!q.get('package') || !pk.some(p => p.id === q.get('package')) ? ' checked' : ''}><span><b>Something else</b><small>Ask for a custom quote</small></span></label></div>
          <div id="bk-pkg-info"></div>
          <div id="bk-qty-box">${FormField({ id:'bk-qty', label:'Quantity', type:'number', inputmode:'numeric' })}</div>
          ${fieldInputs(fields, {}, 'bk-f')}<span class="err" id="bk-packageId-err" role="alert"></span></fieldset>
        <fieldset data-step="1" hidden><legend class="h3">Your event</legend>
          ${plans.length ? FormField({ id:'bk-plan', label:'Link to one of my plans', options:plans.map(p => ({ value:p.id, label:p.name })), placeholder:'Don’t link a plan', value:plan ? plan.id : '' }) : ''}
          <div class="form-row">${FormField({ id:'bk-type', label:'Event type', options:opt(EVENT_TYPES), required:true, value:plan ? plan.event_type || '' : '' })}${FormField({ id:'bk-guests', label:'Guests', type:'number', inputmode:'numeric', required:['venue','catering'].includes(v.category), value:plan && plan.guest_count ? plan.guest_count : '' })}</div>
          <div class="form-row">${FormField({ id:'bk-date', label:'Date', type:'date', required:true, value:plan && plan.event_date ? plan.event_date : '' })}${FormField({ id:'bk-time', label:'Start time', type:'time' })}</div>
          ${FormField({ id:'bk-loc', label:'Area', options:opt(LOCATIONS), required:true, value:plan && plan.location ? plan.location : '' })}
          ${FormField({ id:'bk-addr', label:'Address or venue', hint:'Shared with the provider only once the booking is confirmed.' })}</fieldset>
        <fieldset data-step="2" hidden><legend class="h3">Your details</legend>
          ${FormField({ id:'bk-name', label:'Full name', required:true, autocomplete:'name', value:u.name || '' })}
          ${FormField({ id:'bk-email', label:'Email', type:'email', required:true, autocomplete:'email', value:u.email || '' })}
          <div class="field"><label for="bk-phone">Phone <span class="opt">(with country code)</span></label><div class="phone-in"><select class="select" id="bk-cc" aria-label="Country code">${CC.map(([c, n]) => `<option value="${c}"${c === cc ? ' selected' : ''}>${n} ${c}</option>`).join('')}</select><input class="input" id="bk-phone" name="bk-phone" type="tel" inputmode="tel" autocomplete="tel-national" value="${esc(local)}" placeholder="3 123 456" aria-describedby="bk-phone-err"></div><span class="err" id="bk-phone-err" role="alert"></span></div>
          ${FormField({ id:'bk-notes', label:'Anything the provider should know?', type:'textarea', hint:'Phone numbers and emails are hidden from the provider until the booking is confirmed.' })}</fieldset>
        <fieldset data-step="3" hidden><legend class="h3">Check your request</legend><div id="bk-review"></div>
          <label class="check" style="margin-top:1rem"><input type="checkbox" id="bk-ok"> I checked these details. I understand this is a request and not a confirmed booking.</label><span class="err" id="bk-confirm-err" role="alert"></span></fieldset>
        <p class="err" id="bk-err" role="alert"></p>
        <div class="chip-row"><button class="btn btn-ghost" type="button" data-prev hidden>Back</button><button class="btn btn-primary" type="submit" id="bk-next">Next</button></div></form>`;
    const f = $('#bk-form', box); f.elements['bk-date'].min = todayISO();
    const selPkg = () => pk.find(p => p.id === ($('input[name="bk-pkg"]:checked', f) || {}).value) || null;
    const paintPkg = () => { const p = selPkg(), qb = $('#bk-qty-box', f); qb.hidden = !p || !['per_hour','per_item'].includes(p.unit);
      $('label[for="bk-qty"]', f).textContent = p && p.unit === 'per_hour' ? 'Hours' : 'Quantity'; if (p && p.minQty && !f.elements['bk-qty'].value) f.elements['bk-qty'].value = p.minQty;
      $('#bk-pkg-info', f).innerHTML = p ? `<div class="notice">${icon('info')}<div>${p.priceType === 'fixed' ? `<b>Fixed package price.</b> ${esc(v.name)} confirms your date at this price.` : p.priceType === 'starting' ? '<b>Starting price.</b> The final price comes in the provider’s quote.' : '<b>Custom quote.</b> The provider prices it for your event.'}${pkgDetailsHtml(p, v.category)}</div></div>` : ''; };
    paintPkg(); f.addEventListener('change', e => { if (e.target.name === 'bk-pkg') paintPkg(); if (e.target.id === 'bk-plan'){ const p = plans.find(x => x.id === e.target.value); if (p){ if (p.event_date) f.elements['bk-date'].value = p.event_date; if (p.guest_count) f.elements['bk-guests'].value = p.guest_count; if (p.location) f.elements['bk-loc'].value = p.location; if (p.event_type) f.elements['bk-type'].value = p.event_type; } } });
    const go = n => { step = n; $$('fieldset[data-step]', f).forEach(fs => { fs.hidden = +fs.dataset.step !== step; }); $$('.stepper li', box).forEach(li => { li.classList.toggle('on', +li.dataset.st === step); li.classList.toggle('done', +li.dataset.st < step); });
      $('[data-prev]', f).hidden = step === 0; $('#bk-next', f).innerHTML = step === 3 ? `${icon('send','sm')}Send request` : 'Next'; $('#bk-next', f).disabled = step === 3 && needVerify; window.scrollTo({ top:box.offsetTop - 80 }); };
    const body = () => { const p = selPkg(), g = k => f.elements[k] ? f.elements[k].value.trim() : '';
      return { vendorId:v.id, packageId:p ? p.id : '', quantity:p && ['per_hour','per_item'].includes(p.unit) ? g('bk-qty') : '', details:readFields(f, fields, 'bk-f'), eventId:g('bk-plan') || undefined,
        eventType:g('bk-type'), guests:g('bk-guests'), date:g('bk-date'), time:g('bk-time'), location:g('bk-loc'), address:g('bk-addr'), name:g('bk-name'), email:g('bk-email'), phone:`${f.elements['bk-cc'].value} ${g('bk-phone')}`, notes:g('bk-notes') }; };
    const STEP_OF = { packageId:0, quantity:0, eventType:1, guests:1, date:1, time:1, location:1, address:1, name:2, email:2, phone:2, notes:2 };
    const MAP = { packageId:'bk-packageId', quantity:'bk-qty', eventType:'bk-type', guests:'bk-guests', date:'bk-date', time:'bk-time', location:'bk-loc', address:'bk-addr', name:'bk-name', email:'bk-email', phone:'bk-phone', notes:'bk-notes' };
    const fail = err => { $$('.err', f).forEach(e => { e.textContent = ''; }); $$('.invalid', f).forEach(e => e.classList.remove('invalid')); showFieldErrors(f, err, MAP, 'bk-f'); $('#bk-err', f).textContent = err.message;
      const first = Object.keys(err.fields || {})[0]; if (first) go(first.startsWith('details.') ? 0 : (STEP_OF[first] ?? step)); };
    const review = r => { const b = body(), p = r.package && r.package.id ? r.package : null, e = r.estimate;
      return `<dl class="rv-dl"><div><dt>Provider</dt><dd>${esc(v.name)}</dd></div><div><dt>Service</dt><dd>${p ? `${esc(p.name)} · ${esc(PRICE_TYPE_TXT[p.priceType] || '')}` : 'Custom quote'}</dd></div>
        <div><dt>Event</dt><dd>${esc(evName(b.eventType) || b.eventType)} · ${esc(fmtDate(b.date))}${b.time ? ` · ${esc(b.time)}` : ''} · ${esc(locName(b.location))}${b.guests ? ` · ${esc(b.guests)} guests` : ''}</dd></div>
        <div><dt>You</dt><dd>${esc(r.value.name)} · ${esc(r.value.email)} · ${esc(r.value.phone)}</dd></div>${b.notes ? `<div><dt>Notes</dt><dd>${esc(b.notes)}</dd></div>` : ''}</dl>
        ${detailsList(fields, r.value.details)}
        <div class="price-box">${e ? `<table class="px"><tr><td>${esc(p.name)} — ${e.quantity} × ${esc(fmtMoney(e.unitMinor, e.currency))}${UNIT_TXT[e.unit] || ''}</td><td>${fmtMoney(e.subtotalMinor, e.currency)}</td></tr>
            ${(e.fees || []).map(x => `<tr><td>${esc(x.label)} (${esc(x.basis)})</td><td>${fmtMoney(x.amountMinor, e.currency)}</td></tr>`).join('')}<tr class="tot"><td>${e.priceType === 'fixed' ? 'Total at the package price' : 'Estimated total'}</td><td>${fmtMoney(e.totalMinor, e.currency)}</td></tr></table>
            <p class="small muted">${e.priceType === 'fixed' ? `This is ${esc(v.name)}’s fixed package price. They still need to confirm your date. If anything changes, they send a quote you can accept or decline.` : 'This is an estimate based on the starting price. The final price comes in the provider’s quote, which you can accept, question or decline.'}</p>`
          : `<p class="small"><b>The provider will send you a custom quote.</b> You’ll see the full price, what’s included and the cancellation terms before you decide.</p>`}
          <p class="tiny muted">You don’t pay anything now. Online payment isn’t available on Ma3ak yet; any deposit is arranged as described in the quote you accept.</p></div>`; };
    box.addEventListener('click', async e => {
      if (e.target.closest('[data-prev]')) return go(step - 1);
      if (e.target.closest('#bk-resend')){ try { const r = await apiU('POST', '/api/auth/resend-verification'); toast(r.sent ? 'Link sent. Check your email.' : 'We couldn’t send the email right now.'); } catch(err){ toast(esc(err.message), 'alert'); } }
    });
    f.addEventListener('submit', async e => { e.preventDefault(); $('#bk-err', f).textContent = '';
      if (step === 1 && !validateForm(f, { 'bk-type':V.select('the event type'), 'bk-date':x => !x ? 'Choose the date.' : x < todayISO() ? 'Choose a date in the future.' : '', 'bk-loc':V.select('the area') })) return;
      if (step === 2 && !validateForm(f, { 'bk-name':V.req('your full name'), 'bk-email':V.email, 'bk-phone':V.phoneReq })) return;
      const btn = $('#bk-next', f);
      if (step < 2) return go(step + 1);
      if (step === 2){ busy(btn, true, 'Checking'); try { preview = await apiU('POST', '/api/bookings/preview', body()); $('#bk-review', f).innerHTML = review(preview); busy(btn, false); go(3); } catch(err){ busy(btn, false); fail(err); } return; }
      if (!$('#bk-ok', f).checked){ $('#bk-confirm-err', f).textContent = 'Please confirm to send.'; return; }
      busy(btn, true, 'Sending');
      try { const r = await apiU('POST', '/api/bookings', { ...body(), confirm:true }); if (typeof TRACK === 'function') TRACK('quote_requested', { type:'booking' }); loadMe();
        box.innerHTML = `<div class="panel form-success" style="max-width:640px"><div class="card-ico">${icon('check')}</div><h1 class="h2">Request sent</h1><p>Your reference is <b>${esc(r.ref)}</b>. ${esc(v.name)} will reply on Ma3ak. <b>This is not a confirmed booking yet</b> — you’ll be notified when they send a quote or confirm.</p><div class="actions"><a class="btn btn-primary" href="#/bookings/${esc(r.id)}">Open the request</a><a class="btn btn-ghost" href="#/dashboard?tab=bookings">My bookings</a></div></div>`; }
      catch(err){ busy(btn, false); if (err.code === 'duplicate' && err.data && err.data.ref) $('#bk-err', f).innerHTML = `${esc(err.message)} <a class="link" href="#/dashboard?tab=bookings">See my bookings</a>`; else fail(err); }
    });
    go(0);
  } };

/* ---------- booking page (customer and provider) ---------- */
const offerCard = (o, opts = {}) => `<article class="offer-card${o.status === 'sent' ? ' live' : ''}">
  <header><div><b>${o.kind === 'amendment' ? 'Proposed change' : 'Quote'} v${o.version}</b><small class="muted">Sent ${esc(fmtDate(o.createdAt.slice(0, 10)))}${o.status === 'sent' ? ` · valid until ${esc(fmtDate(o.validUntil))}` : ''}</small></div><span class="tag ${o.status === 'accepted' ? 'gold' : ''}">${esc({ sent:'Waiting for answer', accepted:'Accepted', rejected:'Declined', revision_requested:'Changes requested', superseded:'Replaced', expired:'Expired', withdrawn:'Withdrawn' }[o.status] || o.status)}</span></header>
  ${o.message ? `<p class="q-msg">${esc(o.message)}</p>` : ''}
  <table class="px">${o.items.map(i => `<tr><td>${esc(i.label)}${i.quantity > 1 ? ` — ${i.quantity} × ${fmtMoney(i.unitMinor, o.currency)}` : ''}</td><td>${fmtMoney(i.totalMinor, o.currency)}</td></tr>`).join('')}
    <tr class="sub"><td>Subtotal</td><td>${fmtMoney(o.subtotalMinor, o.currency)}</td></tr>${o.discountMinor ? `<tr><td>Discount${o.discountNote ? ` (${esc(o.discountNote)})` : ''}</td><td>−${fmtMoney(o.discountMinor, o.currency)}</td></tr>` : ''}
    ${(o.fees || []).map(x => `<tr><td>${esc(x.label)} (${esc(x.basis)})</td><td>${fmtMoney(x.amountMinor, o.currency)}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td>${fmtMoney(o.totalMinor, o.currency)}</td></tr>
    ${o.depositMinor ? `<tr><td>Deposit to confirm</td><td>${fmtMoney(o.depositMinor, o.currency)}</td></tr>` : ''}</table>
  ${o.eventDate ? `<p class="small"><span class="muted">Event date:</span> ${esc(fmtDate(o.eventDate))}</p>` : ''}
  <p class="small"><span class="muted">Payment:</span> ${esc(o.paymentSchedule)}</p>
  ${o.inclusions.length ? `<p class="tiny muted">Included</p><ul class="small inc-list">${o.inclusions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${o.exclusions.length ? `<p class="tiny muted">Not included</p><ul class="small exc-list">${o.exclusions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  <p class="small"><span class="muted">Cancellation terms:</span> ${esc(o.cancellationTerms)}</p>${o.responseNote ? `<p class="small"><span class="muted">Customer’s note:</span> ${esc(o.responseNote)}</p>` : ''}
  ${opts.respond ? `<div class="offer-acts"><label class="check"><input type="checkbox" id="of-agree"> I accept this price and these terms.</label><div class="chip-row"><button class="btn btn-primary" type="button" data-respond="accept" data-offer="${esc(o.id)}">${icon('check','sm')}Accept</button><button class="btn btn-ghost" type="button" data-respond="revise" data-offer="${esc(o.id)}">Ask for changes</button><button class="btn btn-ghost" type="button" data-respond="reject" data-offer="${esc(o.id)}">Decline</button></div></div>` : ''}</article>`;
const BookingPage = { title:'Booking | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap" id="bkp">${Skeletons(2)}</div></section>`; },
  async mount(root, [id]){
    await AUTH.ready; if (needAuth()) return; await SITE.ready;
    const box = $('#bkp', root); let d, role, payKey = newKey(), showOffer = false;
    const load = async () => { const r = await apiU('GET', `/api/bookings/${id}`); d = r.booking; role = r.role; };
    try { await load(); } catch(err){ box.innerHTML = EmptyState({ iconName:'alert', level:'h1', title:err.status === 404 ? 'Booking not found' : 'This booking didn’t load', text:esc(err.message), actions:`<a class="btn btn-primary" href="#/dashboard?tab=bookings">My bookings</a>` }); return; }
    const has = a => d.actions.includes(a), me = role, them = role === 'vendor' ? 'customer' : 'vendor';
    const who = t => t === me ? 'You' : t === 'admin' ? 'MA3AK' : t === 'system' ? 'Ma3ak' : t === 'vendor' ? d.vendor.name || 'Provider' : 'Customer';
    const act = async (action, extra = {}, msg = 'Saved') => { try { const r = await apiU('POST', `/api/bookings/${id}/action`, { action, ...extra }); if (r.booking) d = r.booking; else await load(); paint(); toast(msg); return true; }
      catch(err){ toast(esc(err.message), 'alert'); if (err.status === 409) { await load().catch(() => {}); paint(); } return false; } };
    const offerForm = () => { const kind = has('send_amendment') && !has('send_offer') ? 'amendment' : 'quote', prev = d.offers[0], est = d.package && d.package.estimate, pol = SITE.settings.bookingPolicy || {};
      const cur = kind === 'amendment' ? d.currency : (prev ? prev.currency : (d.package && d.package.currency) || d.currency || 'USD');
      const items = prev ? prev.items : est ? [{ label:d.package.name, quantity:est.quantity, unitMinor:est.unitMinor }] : [{ label:(d.package && d.package.name) || '', quantity:1, unitMinor:null }];
      const valid = new Date(Date.now() + (pol.offerValidityDays || 14) * 864e5).toISOString().slice(0, 10);
      const row = it => `<div class="of-line"><input class="input" name="of-label" maxlength="120" placeholder="What’s included in this line" value="${esc(it.label || '')}" aria-label="Line description"><input class="input" name="of-qty" type="number" min="1" inputmode="numeric" value="${it.quantity || 1}" aria-label="Quantity"><input class="input" name="of-price" inputmode="decimal" placeholder="Unit price" value="${esc(toInput(it.unitMinor, cur))}" aria-label="Unit price"><button class="icon-btn" type="button" data-of-del aria-label="Remove line">${icon('x','sm')}</button></div>`;
      return `<form class="form panel" id="of-form" novalidate><h2 class="h3">${kind === 'amendment' ? 'Propose a change to the agreed booking' : prev ? 'Send a revised quote' : 'Send a quote'}</h2>
        <p class="small muted">${kind === 'amendment' ? 'The agreed price stays locked. Your change applies only if the customer accepts it.' : 'The customer sees every line, the total, what’s included and your cancellation terms before deciding.'}</p>
        <div class="of-head small muted"><span>Description</span><span>Qty</span><span>Unit price (${esc(cur)})</span><span></span></div><div id="of-lines">${items.map(row).join('')}</div>
        <button class="btn btn-ghost btn-sm" type="button" data-of-add>${icon('plus','sm')}Add a line</button>
        <div class="form-row">${kind === 'quote' ? FormField({ id:'of-cur', label:'Currency', options:Object.keys(CUR).map(c => ({ value:c, label:c })), value:cur, showOpt:false }) : ''}${FormField({ id:'of-valid', label:'Valid until', type:'date', value:valid, required:true })}</div>
        <div class="form-row">${FormField({ id:'of-disc', label:'Discount', inputmode:'decimal', value:prev && prev.discountMinor ? toInput(prev.discountMinor, cur) : '' })}${FormField({ id:'of-dnote', label:'Reason for the discount', value:prev ? prev.discountNote : '' })}</div>
        ${FormField({ id:'of-dep', label:'Deposit to confirm the booking', inputmode:'decimal', value:prev && prev.depositMinor ? toInput(prev.depositMinor, cur) : '', hint:'Leave empty for no deposit: the booking is confirmed as soon as the customer accepts.' })}
        ${FormField({ id:'of-sched', label:'Payment schedule', type:'textarea', value:prev ? prev.paymentSchedule : '', placeholder:'e.g. Deposit to confirm, balance on the day of the event. Leave empty to describe it automatically.' })}
        <div class="form-row">${FormField({ id:'of-inc', label:'Included (one per line)', type:'textarea', value:prev ? prev.inclusions.join('\n') : ((d.package && d.package.includes) || []).join('\n') })}${FormField({ id:'of-exc', label:'Not included (one per line)', type:'textarea', value:prev ? prev.exclusions.join('\n') : ((d.package && d.package.exclusions) || []).join('\n') })}</div>
        ${FormField({ id:'of-cancel', label:'Cancellation terms', type:'textarea', required:true, value:prev ? prev.cancellationTerms : (pol.defaultCancellationTerms || '') })}
        ${FormField({ id:'of-msg', label:'Message to the customer', type:'textarea' })}
        <div class="price-box" id="of-sum"></div><p class="err" id="of-err" role="alert"></p>
        <div class="chip-row"><button class="btn btn-primary" type="submit">${icon('send','sm')}${kind === 'amendment' ? 'Send proposal' : 'Send quote'}</button><button class="btn btn-ghost" type="button" data-of-cancel>Cancel</button></div></form>`; };
    const sumOffer = f => { const cur = f.elements['of-cur'] ? f.elements['of-cur'].value : d.currency, ls = $$('.of-line', f).map(l => ({ q:+$('[name=of-qty]', l).value || 0, p:parseMinor($('[name=of-price]', l).value, cur) }));
      if (ls.some(x => Number.isNaN(x.p))) return `<p class="small over">Check the prices: ${esc(cur)} ${CUR[cur].d ? 'allows up to two decimals' : 'has no decimals'}.</p>`;
      const sub = ls.reduce((s, x) => s + (x.p || 0) * x.q, 0), disc = parseMinor(f.elements['of-disc'].value, cur) || 0, fees = feesPreview(sub - disc, cur), tot = sub - disc + fees.reduce((s, x) => s + x.amountMinor, 0), dep = parseMinor(f.elements['of-dep'].value, cur) || 0, bps = d.commissionRateBps || 0;
      return `<table class="px"><tr><td>Subtotal</td><td>${fmtMoney(sub, cur)}</td></tr>${disc ? `<tr><td>Discount</td><td>−${fmtMoney(disc, cur)}</td></tr>` : ''}${fees.map(x => `<tr><td>${esc(x.label)} (paid by the customer)</td><td>${fmtMoney(x.amountMinor, cur)}</td></tr>`).join('')}<tr class="tot"><td>Customer pays</td><td>${fmtMoney(tot, cur)}</td></tr>${dep ? `<tr><td>Deposit</td><td>${fmtMoney(dep, cur)}</td></tr>` : ''}</table>
        <p class="tiny muted">Ma3ak commission: ${bps / 100}% of the price before customer fees${bps ? ` (about ${fmtMoney(Math.round((sub - disc) * bps / 10000), cur)})` : ''}. It is fixed on the booking when the customer accepts and invoiced by MA3AK; nothing is deducted automatically.</p>`; };
    const paint = () => {
      const st = BOOKING_STATUS[d.status] || [d.status, '', ''], pending = d.offers.find(o => o.status === 'sent'), past = d.offers.filter(o => o !== pending && !(d.agreed && o.id === d.agreed.offerId));
      const t = d.agreed && d.agreed.terms, est = d.package && d.package.estimate;
      document.title = `${d.ref} | Ma3ak`;
      box.innerHTML = `<nav class="crumbs" aria-label="Breadcrumb">${role === 'vendor' ? '<a href="#/partner?tab=bookings">Partner page</a>' : '<a href="#/dashboard?tab=bookings">My bookings</a>'}<span aria-hidden="true">/</span><span aria-current="page">${esc(d.ref)}</span></nav>
        <div class="dash-top"><div><p class="small muted">${esc(d.ref)} · ${esc(catSingle(d.category) || d.category)}${d.package && d.package.name ? ` · ${esc(d.package.name)}` : ''}</p><h1 class="h1">${esc(role === 'vendor' ? d.customer.name : d.vendor.name)}</h1>
          <p class="small"><span class="tag ${statusTone(d.status)}">${esc(st[0])}</span> ${PAY_TXT[d.paymentStatus] ? `<span class="tag">${esc(PAY_TXT[d.paymentStatus])}</span>` : ''} ${role === 'customer' && d.vendor.id ? `<a class="link small" href="#/vendor/${esc(d.vendor.id)}">Provider profile</a>` : ''}</p></div>
          <div class="chip-row"><button class="btn btn-ghost btn-sm" type="button" data-report="booking">${icon('flag','sm')}Report a problem</button></div></div>
        <p class="notice">${icon('info')}<span>${esc(st[role === 'vendor' ? 2 : 1] || st[1])}</span></p>
        ${d.termsRequired ? `<p class="notice danger-note">${icon('alert')}<span>Before you can send quotes or confirm bookings, read and accept the current partner terms. <a class="link" href="#/partner?tab=plan">Open Plan &amp; fees</a></span></p>` : ''}
        <div class="plan-layout bk-layout"><div class="plan-main">
          ${d.agreed ? `<section class="panel"><div class="tile-h"><h2 class="h3">Agreed price</h2><span class="tag gold">${icon('lock','sm')}Locked</span></div>
            <table class="px">${(t.items || []).map(i => `<tr><td>${esc(i.label)}${i.quantity > 1 ? ` — ${i.quantity} × ${fmtMoney(i.unitMinor, d.currency)}` : ''}</td><td>${fmtMoney(i.totalMinor, d.currency)}</td></tr>`).join('')}
              ${d.agreed.discountMinor ? `<tr><td>Discount${t.discountNote ? ` (${esc(t.discountNote)})` : ''}</td><td>−${fmtMoney(d.agreed.discountMinor, d.currency)}</td></tr>` : ''}${(t.fees || []).map(x => `<tr><td>${esc(x.label)}</td><td>${fmtMoney(x.amountMinor, d.currency)}</td></tr>`).join('')}
              <tr class="tot"><td>Total</td><td>${fmtMoney(d.agreed.totalMinor, d.currency)}</td></tr>${d.agreed.depositMinor ? `<tr><td>Deposit</td><td>${fmtMoney(d.agreed.depositMinor, d.currency)}</td></tr>` : ''}</table>
            <p class="small"><span class="muted">Payment:</span> ${esc(t.paymentSchedule || '')}</p>${(t.inclusions || []).length ? `<p class="tiny muted">Included</p><ul class="small inc-list">${t.inclusions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${(t.exclusions || []).length ? `<p class="tiny muted">Not included</p><ul class="small exc-list">${t.exclusions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
            <p class="small"><span class="muted">Cancellation terms:</span> ${esc(t.cancellationTerms || '')}</p>
            ${d.commission ? `<p class="tiny muted">Ma3ak commission on this booking: ${d.commission.rateBps / 100}% = ${fmtMoney(d.commission.amountMinor, d.currency)} (invoiced by MA3AK, not deducted automatically).</p>` : ''}
            <p class="tiny muted">This price changes only if ${role === 'vendor' ? 'the customer accepts a change you propose' : 'you accept a change the provider proposes'}.</p></section>`
          : !pending && est ? `<section class="panel"><h2 class="h3">${est.priceType === 'fixed' ? 'Package price when you sent the request' : 'Estimate when the request was sent'}</h2><table class="px"><tr><td>${esc(d.package.name)} — ${est.quantity} × ${fmtMoney(est.unitMinor, est.currency)}</td><td>${fmtMoney(est.subtotalMinor, est.currency)}</td></tr>${(est.fees || []).map(x => `<tr><td>${esc(x.label)}</td><td>${fmtMoney(x.amountMinor, est.currency)}</td></tr>`).join('')}<tr class="tot"><td>${est.priceType === 'fixed' ? 'Total' : 'Estimated total'}</td><td>${fmtMoney(est.totalMinor, est.currency)}</td></tr></table><p class="tiny muted">${est.priceType === 'fixed' ? 'Fixed package price, not yet confirmed by the provider.' : 'Not a final price: it becomes final only when a quote is accepted.'}</p></section>` : ''}
          ${pending ? `<section class="panel">${offerCard(pending, { respond:role === 'customer' && has('accept') })}${role === 'vendor' && has('withdraw_offer') ? `<button class="btn btn-ghost btn-sm" type="button" data-act="withdraw_offer" style="margin-top:.6rem">Withdraw this quote</button>` : ''}</section>` : ''}
          ${role === 'vendor' && (has('send_offer') || has('send_amendment')) && !d.termsRequired ? (showOffer ? offerForm() : `<button class="btn ${pending ? 'btn-ghost' : 'btn-primary'}" type="button" data-show-offer>${icon('send','sm')}${has('send_amendment') && !has('send_offer') ? 'Propose a change' : pending ? 'Send a revised quote' : 'Send a quote'}</button>`) : ''}
          ${actionsHtml()}
          ${has('review') ? `<form class="panel form" id="rv-form" novalidate><h2 class="h3">Review ${esc(d.vendor.name)}</h2><p class="small muted">Your first name and the initial of your last name are shown with the review.</p><div class="stars-in" role="radiogroup" aria-label="Rating">${[1,2,3,4,5].map(n => `<label><input type="radio" name="rv-r" value="${n}"><span aria-hidden="true">★</span><span class="sr-only">${n} star${n > 1 ? 's' : ''}</span></label>`).join('')}</div>${FormField({ id:'rv-body', label:'Your review', type:'textarea' })}<button class="btn btn-primary" type="submit">Publish review</button></form>` : ''}
          ${d.review ? `<section class="panel"><h2 class="h3">${role === 'customer' ? 'Your review' : 'Review'}</h2><p class="stars">${'★'.repeat(d.review.rating)}${'☆'.repeat(5 - d.review.rating)}</p>${d.review.body ? `<p>${esc(d.review.body)}</p>` : ''}${d.review.status === 'hidden' ? '<p class="tiny muted">Hidden by MA3AK.</p>' : ''}</section>` : ''}
          <section class="panel"><h2 class="h3">Messages</h2><div class="msg-thread">${d.messages.length ? d.messages.map(m => `<div class="msg ${m.from === me ? 'mine' : ''}${m.from === 'admin' ? ' admin' : ''}"><small class="muted">${esc(who(m.from))} · ${esc(new Date(m.at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }))}</small><p>${esc(m.body)}</p>${m.masked ? '<small class="tiny muted">Contact details were hidden.</small>' : ''}${m.from !== me && m.from !== 'admin' && m.from !== 'system' ? `<button class="link tiny" type="button" data-report-msg="${m.id}">Report</button>` : ''}</div>`).join('') : '<p class="small muted">No messages yet.</p>'}</div>
            ${has('message') ? `<form class="form" id="msg-form" novalidate><div class="field"><label for="msg-body" class="sr-only">Message</label><textarea class="textarea" id="msg-body" rows="3" maxlength="2000" placeholder="Write a message"></textarea></div><div class="chip-row"><button class="btn btn-primary btn-sm" type="submit">${icon('send','sm')}Send</button></div>
              <p class="tiny muted">${d.confirmedAt && d.status !== 'cancelled' ? 'Messages are kept with this booking.' : 'Until the booking is confirmed, phone numbers, emails and links are hidden. Keep agreements and payments on Ma3ak so they are recorded.'}</p></form>` : '<p class="tiny muted">Messages are closed for this booking.</p>'}</section>
        </div><aside class="plan-side">
          <div class="panel"><h2 class="h3">Event</h2><dl class="tot-dl"><div><dt>Type</dt><dd>${esc(evName(d.eventType) || d.eventType || '—')}</dd></div><div><dt>Date</dt><dd>${esc(d.eventDate ? fmtDate(d.eventDate) : '—')}${d.eventTime ? ` · ${esc(d.eventTime)}` : ''}</dd></div><div><dt>Area</dt><dd>${esc(d.location ? locName(d.location) : '—')}</dd></div>${d.guests ? `<div><dt>Guests</dt><dd>${d.guests}</dd></div>` : ''}${d.quantity ? `<div><dt>Quantity</dt><dd>${d.quantity}</dd></div>` : ''}<div><dt>Address</dt><dd>${d.address ? esc(d.address) : role === 'vendor' && d.customer.hidden ? '<span class="muted">Shared after confirmation</span>' : '—'}</dd></div></dl>
            ${detailsList(catFields(d.category, 'booking'), d.details)}${d.notes ? `<p class="small" style="margin-top:.6rem"><span class="muted">Notes:</span> ${esc(d.notes)}</p>` : ''}
            ${role === 'customer' && d.eventId ? `<a class="link small" href="#/planner/${esc(d.eventId)}">Open the linked plan</a>` : ''}</div>
          ${role === 'vendor' ? `<div class="panel"><h2 class="h3">Customer</h2><p><b>${esc(d.customer.name)}</b></p>${d.customer.hidden ? '<p class="small muted">Email and phone are shared once the booking is confirmed.</p>' : `<p class="small">${d.customer.email ? `<a class="link" href="mailto:${esc(d.customer.email)}">${esc(d.customer.email)}</a>` : ''}${d.customer.phone ? `<br><a class="link" href="tel:${esc(d.customer.phone)}">${esc(d.customer.phone)}</a>` : ''}</p>`}
            <form class="form" id="note-form" novalidate style="margin-top:.8rem">${FormField({ id:'vn', label:'Private note (only you see this)', type:'textarea', value:d.vendorNote || '' })}<button class="btn btn-ghost btn-sm" type="submit">Save note</button></form></div>` : ''}
          ${d.cancelReason ? `<div class="panel"><h2 class="h3">Cancellation</h2><p class="small">${esc(d.cancelReason)}</p></div>` : ''}
          <div class="panel"><h2 class="h3">History</h2><ol class="timeline">${d.timeline.map(e => `<li><b>${esc(ACTION_TXT[e.action] || e.action)}</b><small class="muted">${esc(who(e.actor))} · ${esc(new Date(e.at).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }))}</small>${e.note ? `<small>${esc(e.note)}</small>` : ''}</li>`).join('')}</ol>
            ${past.length ? `<details style="margin-top:.8rem"><summary class="small">Earlier offers (${past.length})</summary>${past.map(o => offerCard(o)).join('')}</details>` : ''}</div>
        </aside></div>`;
      const of = $('#of-form', box); if (of){ const upd = () => { $('#of-sum', of).innerHTML = sumOffer(of); }; of.addEventListener('input', upd); of.addEventListener('change', upd); upd(); }
    };
    const actionsHtml = () => { const b = [];
      if (has('confirm')) b.push(`<button class="btn btn-primary" type="button" data-act="confirm" data-ask="Confirm this booking at the package price? The customer’s date becomes a confirmed booking.">${icon('check','sm')}Confirm at the package price</button>`);
      if (has('decline')) b.push(`<button class="btn btn-ghost" type="button" data-act="decline" data-note="Tell the customer why (optional)">Decline</button>`);
      if (has('cancel')) b.push(`<button class="btn btn-ghost" type="button" data-act="cancel" data-note="Reason (optional)">Cancel request</button>`);
      if (has('request_cancel')) b.push(`<button class="btn btn-ghost" type="button" data-act="request_cancel" data-note="Why do you need to cancel? The other side sees this." data-need>Request cancellation</button>`);
      if (has('withdraw_cancel')) b.push(`<button class="btn btn-ghost" type="button" data-act="withdraw_cancel">Withdraw cancellation request</button>`);
      if (has('approve_cancel')) b.push(`<button class="btn btn-primary" type="button" data-act="approve_cancel" data-ask="Agree to cancel this booking? Any refund follows the agreed cancellation terms.">Agree to cancel</button>`);
      if (has('reject_cancel')) b.push(`<button class="btn btn-ghost" type="button" data-act="reject_cancel" data-note="Explain why (optional)">Don’t agree</button>`);
      if (has('start')) b.push(`<button class="btn btn-ghost" type="button" data-act="start">Mark as started</button>`);
      if (has('complete')) b.push(`<button class="btn btn-primary" type="button" data-act="complete" data-ask="Mark this booking as completed? The customer will be invited to leave a review.">Mark as completed</button>`);
      const pay = has('report_payment') ? `<details class="pay-box"><summary class="btn btn-ghost">Record a payment you received</summary><form class="form" id="pay-form" novalidate style="margin-top:.8rem"><p class="small muted">Only record money you actually received. It’s shown to the customer and to MA3AK. Refunds are recorded by MA3AK.</p>
        <div class="form-row">${FormField({ id:'py-kind', label:'For', options:[{ value:'deposit', label:'Deposit' }, { value:'balance', label:'Balance' }, { value:'full', label:'Full amount' }], value:d.status === 'awaiting_payment' ? 'deposit' : 'balance', showOpt:false })}${FormField({ id:'py-amt', label:`Amount (${esc(d.currency)})`, inputmode:'decimal', required:true, value:d.status === 'awaiting_payment' && d.agreed ? toInput(d.agreed.depositMinor, d.currency) : '' })}</div>
        ${FormField({ id:'py-note', label:'Note (e.g. cash, bank transfer)' })}<button class="btn btn-primary btn-sm" type="submit">Record payment</button></form></details>` : '';
      return b.length || pay ? `<section class="panel"><h2 class="h3">Next steps</h2><div class="chip-row" style="margin-top:.6rem">${b.join('')}</div>${pay}</section>` : ''; };
    paint();
    // keep the page current while it's open (a quote or message from the other side), without disturbing typing
    const poll = setInterval(async () => { if (!box.isConnected){ clearInterval(poll); return; } if (document.visibilityState !== 'visible' || showOffer || $('#modal') || (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))) return;
      try { const r = await apiU('GET', `/api/bookings/${id}`); if (r.booking.updatedAt !== d.updatedAt || r.booking.messages.length !== d.messages.length){ d = r.booking; paint(); } } catch(e){} }, 20000);
    const askNote = (label, need) => new Promise(res => openModal({ title:label, body:`<form class="form" id="nt-form" novalidate>${FormField({ id:'nt', label:'Note', type:'textarea', required:!!need })}<div class="chip-row"><button class="btn btn-primary" type="submit">Continue</button><button class="btn btn-ghost" type="button" data-close>Back</button></div></form>`,
      onMount(m){ const f = $('#nt-form', m); f.addEventListener('submit', e => { e.preventDefault(); const v = f.elements.nt.value.trim(); if (need && v.length < 3){ $('#nt-err', f).textContent = 'Please explain.'; return; } closeModal(); res(v); }); m.addEventListener('click', e => { if (e.target.closest('[data-close]')) res(null); }); } }));
    box.addEventListener('click', async e => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.matches('[data-show-offer]')){ showOffer = true; paint(); $('#of-form', box).scrollIntoView({ block:'start' }); return; }
      if (t.matches('[data-of-cancel]')){ showOffer = false; paint(); return; }
      if (t.matches('[data-of-add]')){ const cur = ($('#of-cur', box) || {}).value || d.currency; $('#of-lines', box).insertAdjacentHTML('beforeend', `<div class="of-line"><input class="input" name="of-label" maxlength="120" placeholder="What’s included in this line" aria-label="Line description"><input class="input" name="of-qty" type="number" min="1" inputmode="numeric" value="1" aria-label="Quantity"><input class="input" name="of-price" inputmode="decimal" placeholder="Unit price" aria-label="Unit price (${esc(cur)})"><button class="icon-btn" type="button" data-of-del aria-label="Remove line">${icon('x','sm')}</button></div>`); return; }
      if (t.matches('[data-of-del]')){ if ($$('.of-line', box).length > 1) t.closest('.of-line').remove(); $('#of-sum', box).innerHTML = sumOffer($('#of-form', box)); return; }
      if (t.matches('[data-respond]')){ const a = t.dataset.respond;
        if (a === 'accept'){ if (!$('#of-agree', box).checked){ toast('Tick “I accept this price and these terms” first', 'alert'); return; } await act('accept', { offerId:t.dataset.offer, agree:true }, 'Accepted. The price is now locked.'); return; }
        const note = await askNote(a === 'revise' ? 'What would you like changed?' : 'Decline this quote', a === 'revise'); if (note === null) return;
        await act(a, { offerId:t.dataset.offer, note }, a === 'revise' ? 'Sent to the provider' : 'Quote declined'); return; }
      if (t.matches('[data-act]')){ const a = t.dataset.act;
        if (t.dataset.ask && !confirm(t.dataset.ask)) return;
        let note = ''; if (t.dataset.note){ note = await askNote(t.dataset.note, t.hasAttribute('data-need')); if (note === null) return; }
        await act(a, { note, reason:note }); return; }
      if (t.matches('[data-report]')) return openReport('booking', d.id);
      if (t.matches('[data-report-msg]')) return openReport('message', t.dataset.reportMsg);
    });
    box.addEventListener('submit', async e => { e.preventDefault(); const f = e.target, btn = $('[type=submit]', f);
      if (f.id === 'msg-form'){ const v = f.elements['msg-body'].value.trim(); if (!v) return; busy(btn, true);
        try { const r = await apiU('POST', `/api/bookings/${id}/messages`, { body:v }); if (r.masked) toast('Sent. Contact details were hidden until the booking is confirmed.', 'info'); await load(); paint(); } catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); } return; }
      if (f.id === 'note-form'){ await act('note', { note:f.elements.vn.value }, 'Note saved'); return; }
      if (f.id === 'pay-form'){ if (!validateForm(f, { 'py-amt':V.req('the amount') })) return; busy(btn, true, 'Saving');
        const ok = await act('report_payment', { kind:f.elements['py-kind'].value, amount:f.elements['py-amt'].value.replace(/,/g, ''), note:f.elements['py-note'].value, idempotencyKey:payKey }, 'Payment recorded'); if (ok) payKey = newKey(); else busy(btn, false); return; }
      if (f.id === 'rv-form'){ const r = $('input[name=rv-r]:checked', f); if (!r){ toast('Choose a rating', 'alert'); return; } busy(btn, true);
        try { await apiU('POST', `/api/bookings/${id}/review`, { rating:+r.value, body:f.elements['rv-body'].value }); toast('Thank you. Your review is published.'); await load(); paint(); } catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); } return; }
      if (f.id === 'of-form'){ const cur = f.elements['of-cur'] ? f.elements['of-cur'].value : d.currency, items = $$('.of-line', f).map(l => ({ label:$('[name=of-label]', l).value.trim(), quantity:+$('[name=of-qty]', l).value || 1, unitPrice:$('[name=of-price]', l).value.replace(/,/g, '').trim() }));
        if (items.some(i => !i.label || !i.unitPrice)){ $('#of-err', f).textContent = 'Give every line a description and a price.'; return; }
        busy(btn, true, 'Sending');
        try { await apiU('POST', `/api/bookings/${id}/offers`, { currency:cur, items, discount:f.elements['of-disc'].value.replace(/,/g, ''), discountNote:f.elements['of-dnote'].value, deposit:f.elements['of-dep'].value.replace(/,/g, ''), validUntil:f.elements['of-valid'].value,
            paymentSchedule:f.elements['of-sched'].value, inclusions:lines(f.elements['of-inc'].value), exclusions:lines(f.elements['of-exc'].value), cancellationTerms:f.elements['of-cancel'].value, message:f.elements['of-msg'].value });
          showOffer = false; toast('Sent. The customer has been notified.'); await load(); paint(); }
        catch(err){ busy(btn, false); $('#of-err', f).textContent = err.message + (err.fields ? ' ' + Object.values(err.fields).join(' ') : ''); } }
    });
  } };

/* ---------- partner page (provider) ---------- */
const VSTATUS_TXT = { draft:['Draft','Not public. Complete your profile, add your documents and submit it for verification.'], submitted:['Submitted','MA3AK will check your listing and documents. You can keep editing.'],
  under_review:['Under review','MA3AK is checking your documents.'], needs_info:['More information needed','MA3AK needs something else before verifying you. See the note, update your listing, then submit again.'],
  approved:['Verified','Your listing is verified by MA3AK.'], rejected:['Not approved','See the note from MA3AK. You can update your listing and submit again.'], suspended:['Suspended','Your listing is hidden. Contact MA3AK.'] };
const PartnerPortal = { title:'Partner | Ma3ak',
  render(){ return `<section class="page-hero"><div class="wrap" id="pp">${Skeletons(2)}</div></section>`; },
  async mount(root, p, q){
    await Promise.all([AUTH.ready, SITE.ready]); if (needAuth()) return; const box = $('#pp', root);
    if (AUTH.user.role !== 'partner'){ box.innerHTML = EmptyState({ iconName:'store', level:'h1', title:'This page is for providers', text:'Turn your account into a partner account to list your services.', actions:`<a class="btn btn-primary" href="#/partner/join">Become a partner</a>` }); return; }
    let d, tab = q.get('tab') || 'overview', editPkg = null, bk = null, bkFilter = '', av = null, avSel = new Set(), avOff = 0, plan = null, revs = null, stats = null;
    const load = async () => { d = await apiU('GET', '/api/partner'); };
    try { await load(); } catch(err){ box.innerHTML = EmptyState({ iconName:'alert', level:'h1', title:'Your partner page didn’t load', text:esc(err.message) }); return; }
    const live = () => d.vendor.status === 'approved' && d.vendor.active;
    const ent = () => d.plan.entitlements || {};
    const newCount = () => ['quote_requested','revision_requested','awaiting_vendor'].reduce((s, k) => s + (d.bookingCounts[k] || 0), 0);
    const pkgForm = pk => { const pt = pk ? pk.priceType : 'starting', cur = pk ? pk.currency : 'USD';
      return `<form class="form panel" id="pk-form" novalidate data-id="${esc(pk ? pk.id : 'new')}"><h3 class="h3">${pk ? 'Edit package' : 'New package'}</h3>
      <div class="form-row">${FormField({ id:'pk-name', label:'Name', required:true, value:pk ? pk.name : '', placeholder:'e.g. Full wedding day' })}${FormField({ id:'pk-type', label:'Price type', options:[{ value:'fixed', label:'Fixed price' }, { value:'starting', label:'Starting price (final price in a quote)' }, { value:'quote', label:'Custom quote (no price shown)' }], value:pt, showOpt:false })}</div>
      <div class="form-row" id="pk-price-row">${FormField({ id:'pk-cur', label:'Currency', options:Object.keys(CUR).map(c => ({ value:c, label:c })), value:cur, showOpt:false })}${FormField({ id:'pk-price', label:'Price', inputmode:'decimal', value:pk ? toInput(pk.priceMinor, cur) : '' })}${FormField({ id:'pk-max', label:'Up to (optional)', inputmode:'decimal', value:pk ? toInput(pk.priceMaxMinor, cur) : '' })}</div>
      <div class="form-row">${FormField({ id:'pk-unit', label:'Priced', options:Object.entries(UNIT_NAMES).map(([value, label]) => ({ value, label })), value:pk ? pk.unit : 'flat', showOpt:false })}${FormField({ id:'pk-min', label:'Minimum quantity', type:'number', inputmode:'numeric', value:pk && pk.minQty != null ? pk.minQty : '', hint:'For per-guest, per-hour or per-item prices.' })}</div>
      ${FormField({ id:'pk-desc', label:'Description', type:'textarea', value:pk ? pk.description : '' })}
      <div class="form-row">${FormField({ id:'pk-inc', label:'Included (one per line)', type:'textarea', value:pk ? (pk.includes || []).join('\n') : '' })}${FormField({ id:'pk-exc', label:'Not included (one per line)', type:'textarea', value:pk ? (pk.exclusions || []).join('\n') : '' })}</div>
      ${FormField({ id:'pk-cond', label:'Conditions', type:'textarea', value:pk ? pk.conditions : '', hint:'Required for fixed prices: what the price covers and its limits (hours, guests, travel).' })}
      ${fieldInputs(catFields(d.vendor.category, 'package'), pk ? pk.details : {}, 'pk-f')}
      <label class="check"><input type="checkbox" id="pk-active"${!pk || pk.active ? ' checked' : ''}> Show this package</label>
      <div class="chip-row"><button class="btn btn-primary" type="submit">Save package</button><button class="btn btn-ghost" type="button" data-pk-cancel>Cancel</button></div></form>`; };
    const calHtml = () => { const blocked = new Map(av.days.map(x => [x.day, x])), req = new Map(); av.bookings.forEach(b => { if (!req.has(b.day)) req.set(b.day, []); req.get(b.day).push(b); }); const today = todayISO();
      return [0, 1].map(k => { const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + avOff + k); const y = base.getFullYear(), m = base.getMonth(), days = new Date(y, m + 1, 0).getDate(), lead = (new Date(y, m, 1).getDay() + 6) % 7;
        return `<div class="avail-month"><p class="small muted">${base.toLocaleDateString('en-GB', { month:'long', year:'numeric' })}</p><div class="cal">${['Mo','Tu','We','Th','Fr','Sa','Su'].map(x => `<div class="dow">${x}</div>`).join('')}${Array.from({ length:lead }, () => '<div class="d blank"></div>').join('')}
          ${Array.from({ length:days }, (_, i) => { const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`, b = blocked.get(iso), r = req.get(iso), past = iso < today;
            return `<button type="button" class="d${b ? (b.status === 'booked' ? ' booked' : ' off') : ''}${r ? ' req' : ''}${avSel.has(iso) ? ' sel' : ''}" data-day="${iso}"${past || (b && b.status === 'booked') ? ' disabled' : ''} aria-pressed="${avSel.has(iso)}" title="${esc([b ? (b.status === 'booked' ? 'Booked' : 'Unavailable' + (b.note ? ': ' + b.note : '')) : '', r ? r.map(x => `${x.ref} (${(BOOKING_STATUS[x.status] || [x.status])[0]})`).join(', ') : ''].filter(Boolean).join(' · '))}">${i + 1}</button>`; }).join('')}</div></div>`; }).join(''); };
    let paint = () => { const v = d.vendor, [st, stText] = VSTATUS_TXT[v.status] || [v.status, ''];
      box.innerHTML = `<div class="dash-top"><div><p class="muted small">Partner page</p><h1 class="h1">${esc(v.name)}</h1><p class="small"><span class="tag ${live() ? 'gold' : ''}">${esc(live() ? 'Live' : st)}</span>${v.verified ? ` <span class="tag gold">${icon('check','sm')}Verified</span>` : ''} <span class="tag">${esc(d.plan.name)}</span> ${live() ? `<a class="link small" href="#/vendor/${esc(v.id)}">View public profile</a>` : ''}</p></div>
        <div class="chip-row">${['draft','rejected','needs_info'].includes(v.status) ? `<button class="btn btn-primary" type="button" data-submit>${icon('send','sm')}Submit for verification</button>` : ''}<a class="btn btn-ghost" href="#/account">${icon('users','sm')}Account</a></div></div>
        <div class="dash-tabs chip-scroll" role="tablist">${[['overview','Overview'],['bookings',`Bookings${newCount() ? ` (${newCount()} new)` : ''}`],['profile','Profile'],['packages',`Packages (${v.packages.length})`],['photos',`Photos (${v.photos.length})`],['verification','Verification'],['availability','Availability'],['reviews','Reviews'],['plan','Plan & fees'],['analytics','Analytics']].map(([k, l]) => `<button class="chip${tab === k ? ' active' : ''}" data-tab="${k}">${l}</button>`).join('')}</div><div id="pp-body" style="margin-top:1.5rem"></div>`;
      const b = $('#pp-body', box);
      if (tab === 'overview') b.innerHTML = `<div class="grid g-2"><div class="panel"><h2 class="h3">${esc(st)}</h2><p class="muted small" style="margin:.4rem 0 1rem">${esc(stText)}</p>${v.reviewNote && v.status !== 'approved' ? `<p class="notice">${icon('info')}<span>Note from MA3AK: ${esc(v.reviewNote)}</span></p>` : ''}${v.suspendedReason ? `<p class="notice danger-note">${icon('alert')}<span>${esc(v.suspendedReason)}</span></p>` : ''}
          ${d.verification.missing.length ? `<p class="small"><b>Still needed before you can submit:</b></p><ul class="checklist">${d.verification.missing.map(m => `<li>${icon('minus','sm')}${esc(m.label)}</li>`).join('')}</ul>` : ['draft','rejected','needs_info'].includes(v.status) ? `<p class="small ok">${icon('check','sm')}Everything needed is there. Submit your listing for verification.</p>` : ''}
          <p class="tiny muted" style="margin-top:1rem">Verification has the same requirements on every plan. A paid plan never verifies or publishes a listing.</p></div>
        <div class="panel"><h2 class="h3">Booking requests</h2><p class="kpi">${newCount()}</p><p class="small muted">waiting for your answer</p><button class="btn btn-ghost btn-sm" type="button" data-tab="bookings" style="margin-top:1rem">Open bookings</button>
          <p class="tiny muted" style="margin-top:1.25rem">MA3AK never confirms your availability for you. You answer each request with a quote, a confirmation or a decline.</p></div></div>`;
      if (tab === 'profile') { const vf = catFields(v.category, 'vendor');
        b.innerHTML = `<form class="form panel" id="pf-form" novalidate><h2 class="h3">Public profile</h2><div class="form-row">${FormField({ id:'pf-name', label:'Business name', required:true, value:v.name })}${FormField({ id:'pf-category', label:'Category', options:opt(CATEGORIES, 'id', 'single'), required:true, value:v.category })}</div>
          ${FormField({ id:'pf-description', label:'Short description', value:v.description, hint:'One or two lines shown on your card (20–300 characters).' })}${FormField({ id:'pf-about', label:'About your business', type:'textarea', value:v.about })}
          ${vf.length ? `<div class="sub-fields">${fieldInputs(vf, v.details || {}, 'pf-f')}</div>` : ''}
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Areas you serve</legend><div class="chip-row">${LOCATIONS.map(l => `<label class="chip-check"><input type="checkbox" name="pf-loc" value="${l.id}"${v.locations.includes(l.id) ? ' checked' : ''}><span>${esc(l.name)}</span></label>`).join('')}</div></fieldset>
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Event types</legend><div class="chip-row">${EVENT_TYPES.map(x => `<label class="chip-check"><input type="checkbox" name="pf-ev" value="${x.id}"${v.eventTypes.includes(x.id) ? ' checked' : ''}><span>${esc(x.name)}</span></label>`).join('')}</div></fieldset>
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">Features</legend><div class="chip-row">${SERVICE_FACETS.map(s => `<label class="chip-check"><input type="checkbox" name="pf-svc" value="${esc(s)}"${v.services.includes(s) ? ' checked' : ''}><span>${esc(s)}</span></label>`).join('')}</div></fieldset>
          <div class="form-row">${FormField({ id:'pf-capmin', label:'Guests from', type:'number', inputmode:'numeric', value:v.capacityMin ?? '' })}${FormField({ id:'pf-capmax', label:'Guests up to', type:'number', inputmode:'numeric', value:v.capacityMax ?? '' })}</div>
          ${FormField({ id:'pf-avail', label:'Availability note', value:v.availabilityNote, hint:'e.g. “Weekends book 3 months ahead”. Mark specific dates in Availability.' })}
          <div class="form-row">${FormField({ id:'pf-phone', label:'Phone', type:'tel', value:v.phone || '' })}${FormField({ id:'pf-whatsapp', label:'WhatsApp', type:'tel', value:v.whatsapp || '' })}</div>
          <div class="form-row">${FormField({ id:'pf-email', label:'Email', type:'email', value:v.email || '' })}${FormField({ id:'pf-instagram', label:'Instagram', value:v.instagram ? '@' + v.instagram : '' })}</div>${FormField({ id:'pf-website', label:'Website', value:v.website || '' })}
          <h2 class="h3" style="margin-top:1rem">Business details (private)</h2><p class="small muted">Used by MA3AK to verify your business. Never shown publicly.</p>
          <div class="form-row">${FormField({ id:'pf-legal', label:'Legal or registered name', value:v.legalName || '' })}${FormField({ id:'pf-btype', label:'Type of business', value:v.businessType || '', placeholder:'e.g. Company (SARL), sole trader' })}</div>
          <div class="form-row">${FormField({ id:'pf-regno', label:'Registration number', value:v.registrationNumber || '' })}${FormField({ id:'pf-addr', label:'Business address', value:v.address || '' })}</div>
          <button class="btn btn-primary" type="submit">Save profile</button></form>`; }
      if (tab === 'packages') b.innerHTML = `${editPkg !== null ? pkgForm(editPkg === 'new' ? null : v.packages.find(x => x.id === editPkg)) : `<button class="btn btn-primary" type="button" data-pk-new${v.packages.length >= (ent().maxPackages || 10) ? ' disabled' : ''}>${icon('plus','sm')}Add a package</button> <span class="small muted">${v.packages.length} of ${ent().maxPackages || 10} on your plan</span>`}
        <div class="grid g-2" style="margin-top:1.25rem">${v.packages.map(pk => `<article class="card pkg-card${pk.active ? '' : ' off'}"><p class="tiny muted">${esc(PRICE_TYPE_TXT[pk.priceType] || '')}</p><h3 class="h3">${esc(pk.name)}</h3><p class="kpi" style="font-size:1.3rem">${esc(pkgPrice(pk))}</p>${pk.description ? `<p class="small muted">${esc(pk.description)}</p>` : ''}${pkgDetailsHtml(pk, v.category)}${pk.active ? '' : '<p class="tag">Hidden</p>'}
          <div class="chip-row"><button class="btn btn-ghost btn-sm" type="button" data-pk-edit="${esc(pk.id)}">Edit</button><button class="btn btn-ghost btn-sm" type="button" data-pk-del="${esc(pk.id)}">Delete</button></div></article>`).join('') || `<p class="muted">No packages yet. Add your first package with a fixed price, a starting price, or a custom quote.</p>`}</div>`;
      if (tab === 'photos') b.innerHTML = `<div class="panel"><label class="btn btn-primary" for="ph-file">${icon('image','sm')}Upload photos</label><input type="file" id="ph-file" accept="image/jpeg,image/png" multiple hidden><p class="small muted" style="margin-top:.6rem">JPG or PNG. Photos are resized to 1600 px and their location data is removed. ${v.photos.length} of ${ent().maxPhotos || 10} on your plan.</p>
        <div class="photo-grid" style="margin-top:1rem">${v.photos.map(ph => `<figure><img src="${esc(ph.src)}" alt="${esc(ph.alt || v.name)}" loading="lazy"><figcaption><input class="input" value="${esc(ph.alt || '')}" placeholder="Describe the photo" data-ph-alt="${esc(ph.id)}" maxlength="160"><button class="icon-btn" type="button" data-ph-del="${esc(ph.id)}" aria-label="Delete photo">${icon('x','sm')}</button></figcaption></figure>`).join('') || '<p class="muted">No photos yet.</p>'}</div></div>`;
      if (tab === 'verification') b.innerHTML = `<div class="grid g-2"><div class="panel"><h2 class="h3">Verification documents</h2><p class="small muted" style="margin:.3rem 0 1rem">Private: only you and MA3AK administrators can open them, and every time MA3AK opens one it is logged. Automatic checks only flag things for a person to look at — they never verify you on their own.</p>
          ${d.documents.length ? `<div class="doc-list">${d.documents.map(x => `<div class="doc-row"><div><b>${esc(x.kindLabel)}</b><small class="muted">${esc(x.name || x.mime)} · ${Math.round(x.size / 1024)} KB · ${esc(fmtDate(x.uploadedAt.slice(0, 10)))}</small>${x.note ? `<small>${esc(x.note)}</small>` : ''}</div><span class="tag ${x.status === 'accepted' ? 'gold' : ''}">${esc({ submitted:'Waiting', accepted:'Accepted', rejected:'Not accepted' }[x.status])}</span><a class="link small" href="/api/partner/documents/${esc(x.id)}">Download</a><button class="icon-btn" type="button" data-doc-del="${esc(x.id)}" aria-label="Delete document">${icon('x','sm')}</button></div>`).join('')}</div>` : '<p class="muted small">No documents yet.</p>'}
          <form class="form" id="doc-form" novalidate style="margin-top:1rem">${FormField({ id:'doc-kind', label:'Document', options:Object.entries(d.docKinds).map(([value, label]) => ({ value, label })), required:true })}<div class="field"><label for="doc-file">File (PDF, JPG or PNG, up to 4 MB)</label><input class="input" type="file" id="doc-file" accept="application/pdf,image/jpeg,image/png"><span class="err" id="doc-file-err" role="alert"></span></div>${FormField({ id:'doc-note', label:'Note for MA3AK' })}<button class="btn btn-primary" type="submit">${icon('lock','sm')}Upload privately</button></form></div>
        <div class="panel"><h2 class="h3">What MA3AK checks</h2><ul class="checklist"><li>${icon('check','sm')}An identity document of the owner or manager</li><li>${icon('check','sm')}Business registration, or a letter authorising you to list the business</li><li>${icon('check','sm')}For venues: proof that you own or rent the venue, or are authorised to list it</li><li>${icon('check','sm')}That your listing describes your real services and prices</li></ul>
          <p class="small muted" style="margin-top:1rem">Status: <b>${esc(st)}</b>${v.verifiedAt ? ` · verified ${esc(fmtDate(v.verifiedAt.slice(0, 10)))}` : ''}</p>${['draft','rejected','needs_info'].includes(v.status) ? `<button class="btn btn-primary" type="button" data-submit style="margin-top:1rem">${icon('send','sm')}Submit for verification</button>` : ''}</div></div>`;
      if (tab === 'availability'){ if (!av){ b.innerHTML = Skeletons(1); apiU('GET', '/api/partner/availability').then(r => { av = r; paint(); }).catch(err => { b.innerHTML = EmptyState({ iconName:'alert', title:'Availability didn’t load', text:esc(err.message) }); }); return; }
        b.innerHTML = `<div class="panel"><h2 class="h3">Dates you can’t take</h2><p class="small muted" style="margin:.3rem 0 1rem">Tap dates to select them, then mark them unavailable or available. Customers can’t send requests for unavailable dates. Other dates are never promised to customers: you confirm each request yourself.</p>
          <div class="avail">${calHtml()}</div><div class="cal-legend small muted"><span><i class="d off"></i>Unavailable</span><span><i class="d booked"></i>Booked (confirmed venue booking)</span><span><i class="d req"></i>Has a request or booking</span></div>
          <div class="chip-row" style="margin-top:1rem"><button class="btn btn-ghost btn-sm" type="button" data-av-nav="-1"${avOff <= 0 ? ' disabled' : ''}>Earlier</button><button class="btn btn-ghost btn-sm" type="button" data-av-nav="1"${avOff >= 16 ? ' disabled' : ''}>Later</button>
          <span style="flex:1"></span><input class="input" id="av-note" placeholder="Note (only you see it)" maxlength="120" style="max-width:220px"><button class="btn btn-primary btn-sm" type="button" data-av="blocked"${avSel.size ? '' : ' disabled'}>Mark ${avSel.size || ''} unavailable</button><button class="btn btn-ghost btn-sm" type="button" data-av="free"${avSel.size ? '' : ' disabled'}>Mark available</button></div></div>`; }
      if (tab === 'bookings'){ if (!bk){ b.innerHTML = Skeletons(2); apiU('GET', '/api/partner/bookings' + (bkFilter ? `?status=${bkFilter}` : '')).then(r => { bk = r.bookings; paint(); }).catch(err => { b.innerHTML = EmptyState({ iconName:'alert', title:'Bookings didn’t load', text:esc(err.message) }); }); return; }
        b.innerHTML = `<div class="chip-row" style="margin-bottom:1rem">${[['','All'],['quote_requested','New requests'],['awaiting_vendor','To confirm'],['quote_received','Quote sent'],['revision_requested','Changes requested'],['awaiting_payment','Deposit due'],['confirmed','Confirmed'],['completed','Completed'],['cancelled','Cancelled']].map(([k, l]) => `<button class="chip${bkFilter === k ? ' active' : ''}" data-bkf="${k}">${l}</button>`).join('')}<span style="flex:1"></span>${ent().leadTools ? `<a class="btn btn-ghost btn-sm" href="/api/partner/bookings.csv">${icon('file','sm')}Export spreadsheet</a>` : `<span class="tiny muted">Spreadsheet export is part of Ma3ak Pro.</span>`}</div>
          ${bk.length ? bookingListHtml(bk, 'vendor') : EmptyState({ iconName:'inbox', title:'No bookings here yet', text:live() ? 'Requests from customers appear here.' : 'Once your listing is verified and live, customers can send you requests.' })}`; }
      if (tab === 'reviews'){ if (!revs){ b.innerHTML = Skeletons(1); apiU('GET', '/api/partner/reviews').then(r => { revs = r.reviews; paint(); }).catch(err => { b.innerHTML = EmptyState({ iconName:'alert', title:'Reviews didn’t load', text:esc(err.message) }); }); return; }
        b.innerHTML = revs.length ? `<div class="plan-list">${revs.map(r => `<article class="q-card"><header><div><b>${esc(r.author_name)}</b><small class="muted">${esc(r.ref)} · ${esc(fmtDate(r.created_at.slice(0, 10)))}${r.status === 'hidden' ? ' · hidden by MA3AK' : ''}</small></div><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></header>${r.body ? `<p>${esc(r.body)}</p>` : ''}
          <form class="form rv-reply" data-rid="${esc(r.id)}" novalidate><div class="field"><label for="rr-${esc(r.id)}">Your public reply</label><textarea class="textarea" id="rr-${esc(r.id)}" name="reply" rows="2" maxlength="1000">${esc(r.vendor_reply || '')}</textarea></div><button class="btn btn-ghost btn-sm" type="submit">Save reply</button></form></article>`).join('')}</div>`
          : EmptyState({ iconName:'star', title:'No reviews yet', text:'Customers can review you after a completed booking. Reviews can’t be bought, edited or removed by you; report a review to MA3AK if it breaks the rules.' }); }
      if (tab === 'plan'){ if (!plan){ b.innerHTML = Skeletons(2); apiU('GET', '/api/partner/plan').then(r => { plan = r; paint(); }).catch(err => { b.innerHTML = EmptyState({ iconName:'alert', title:'Plan didn’t load', text:esc(err.message) }); }); return; }
        const cur = plan.current, requested = plan.subscriptions.find(s => s.status === 'requested'), tv = plan.terms;
        b.innerHTML = `<div class="grid g-2">${plan.plans.map(pl => `<div class="panel${cur.planId === pl.id ? ' plan-on' : ''}"><p class="small muted">${cur.planId === pl.id ? 'Your plan' : '&nbsp;'}</p><h2 class="h3">${esc(pl.name)}</h2><p class="kpi">${pl.price_minor ? `${fmtMoney(pl.price_minor, pl.currency)}<span class="small muted"> / ${pl.billing_interval}</span>` : 'Free'}</p>${pl.description ? `<p class="small muted">${esc(pl.description)}</p>` : ''}
            <ul class="checklist" style="margin-top:.8rem">${Object.entries(ENT_TXT).map(([k, l]) => { const val = pl.entitlements[k]; return `<li class="${val ? 'ok' : ''}">${icon(val ? 'check' : 'minus','sm')}${typeof val === 'number' ? `${val} ${l.toLowerCase()}` : esc(l)}</li>`; }).join('')}</ul>
            ${pl.price_minor && cur.planId !== pl.id ? (requested && requested.plan_id === pl.id ? `<p class="small" style="margin-top:1rem">${icon('clock','sm')}Requested on ${esc(fmtDate(requested.created_at.slice(0, 10)))}. MA3AK will contact you to arrange payment. <button class="link" type="button" data-plan-cancel>Cancel request</button></p>` : `<button class="btn btn-primary" type="button" data-plan-req="${esc(pl.id)}" style="margin-top:1rem">Request ${esc(pl.name)}</button>`) : ''}
            ${cur.planId === pl.id && cur.periodEnd ? `<p class="small muted" style="margin-top:.8rem">Active until ${esc(fmtDate(cur.periodEnd))}.</p>` : ''}</div>`).join('')}</div>
          <p class="tiny muted" style="margin-top:.8rem">Online billing isn’t available yet: you’re never charged automatically. MA3AK contacts you to arrange payment and then activates the plan. A paid plan doesn’t verify your listing and doesn’t guarantee bookings or ranking.</p>
          <div class="grid g-2" style="margin-top:1.5rem"><div class="panel"><h2 class="h3">Ma3ak commission</h2><p class="kpi">${plan.commission.rateBps / 100}%</p><p class="small muted">of the agreed price before customer fees, on bookings agreed through Ma3ak. The rate is fixed on each booking when the customer accepts and doesn’t change afterwards. MA3AK invoices it; nothing is deducted automatically.</p></div>
            <div class="panel"><h2 class="h3">Partner terms</h2><p class="small">${tv.acceptedVersion === tv.version ? `${icon('check','sm')}You accepted version ${esc(tv.version)} on ${esc(fmtDate((tv.acceptedAt || '').slice(0, 10)))}.` : `<b>Please read and accept version ${esc(tv.version)}.</b> You need to accept it to send quotes and confirm bookings.`}</p>
              <div class="terms-box">${esc(tv.text || '').split('\n').map(x => `<p>${x}</p>`).join('')}</div>${tv.acceptedVersion !== tv.version ? `<label class="check" style="margin-top:.8rem"><input type="checkbox" id="tm-ok"> I have read and accept these terms.</label><button class="btn btn-primary" type="button" data-terms="${esc(tv.version)}" style="margin-top:.6rem">Accept terms</button>` : ''}</div></div>`; }
      if (tab === 'analytics'){ if (stats === null){ b.innerHTML = Skeletons(1); apiU('GET', '/api/partner/analytics').then(r => { stats = r.analytics; paint(); }).catch(err => { stats = err.code === 'pro_required' ? false : undefined; b.innerHTML = err.code === 'pro_required' ? EmptyState({ iconName:'trend', title:'Analytics are part of Ma3ak Pro', text:'See profile views, requests, conversion, response time and revenue by currency.', actions:`<button class="btn btn-primary" type="button" data-tab="plan">See plans</button>` }) : EmptyState({ iconName:'alert', title:'Analytics didn’t load', text:esc(err.message) }); }); return; }
        if (stats === false){ b.innerHTML = EmptyState({ iconName:'trend', title:'Analytics are part of Ma3ak Pro', text:'See profile views, requests, conversion, response time and revenue by currency.', actions:`<button class="btn btn-primary" type="button" data-tab="plan">See plans</button>` }); return; }
        const s = stats; b.innerHTML = `<div class="grid g-4">${[['Profile views', s.profileViews], ['Requests (12 months)', s.requests], ['Reached agreement', s.won], ['Conversion', s.conversion == null ? '—' : s.conversion + '%'], ['Median first answer', s.medianResponseHours == null ? '—' : s.medianResponseHours + ' h']].map(([l, n]) => `<div class="panel"><p class="small muted">${esc(l)}</p><p class="kpi">${esc(n)}</p></div>`).join('')}
          ${Object.entries(s.revenueByCurrency).map(([c, m]) => `<div class="panel"><p class="small muted">Agreed value (${esc(c)})</p><p class="kpi">${fmtMoney(m, c)}</p></div>`).join('')}</div><p class="tiny muted" style="margin-top:.8rem">${esc(s.note)}</p>`; }
    };
    // only show the price inputs that apply to the chosen price type
    const syncPkgType = f => { const t = f.elements['pk-type'].value; $('#pk-price-row', f).hidden = t === 'quote'; f.elements['pk-max'].closest('.field').hidden = t !== 'starting'; };
    const paint0 = paint; paint = () => { paint0(); const pf = $('#pk-form', box); if (pf) syncPkgType(pf); };
    paint();
    const refresh = async () => { await load(); paint(); };
    const submitModal = () => openModal({ title:'Submit for verification', body:`<p class="muted small">MA3AK checks your documents and listing before publishing it. You can keep editing; big changes may be checked again.</p>
      <label class="check" style="margin-top:1rem"><input type="checkbox" id="sb-auth"> I own this business or I am authorised to list it, and the information and documents I provided are true.</label>
      <label class="check" style="margin-top:.6rem"><input type="checkbox" id="sb-ok"> MA3AK may publish this listing with my packages, prices and photos once it is verified.</label><p class="err" id="sb-err" role="alert"></p>
      <div class="chip-row" style="margin-top:1rem"><button class="btn btn-primary" id="sb-go">Submit</button><button class="btn btn-ghost" data-close>Not yet</button></div>`,
      onMount(m){ $('#sb-go', m).onclick = async () => { if (!$('#sb-ok', m).checked || !$('#sb-auth', m).checked){ $('#sb-err', m).textContent = 'Please confirm both statements.'; return; } try { await apiU('POST', '/api/partner/submit', { consent:true, authorized:true }); closeModal(); toast('Submitted. MA3AK will review your listing.'); refresh(); } catch(err){ $('#sb-err', m).textContent = err.message; } }; } });
    box.addEventListener('click', async e => {
      const t = e.target.closest('[data-tab]'); if (t){ tab = t.dataset.tab; editPkg = null; history.replaceState(null, '', `#/partner?tab=${tab}`); paint(); return; }
      if (e.target.closest('[data-submit]')) return submitModal();
      if (e.target.closest('[data-pk-new]')){ editPkg = 'new'; paint(); return; }
      const pe = e.target.closest('[data-pk-edit]'); if (pe){ editPkg = pe.dataset.pkEdit; paint(); return; }
      if (e.target.closest('[data-pk-cancel]')){ editPkg = null; paint(); return; }
      const pd = e.target.closest('[data-pk-del]'); if (pd){ if (!confirm('Delete this package? Bookings and plans that include it keep their saved price.')) return; try { await apiU('DELETE', `/api/partner/packages/${pd.dataset.pkDel}`); toast('Package deleted'); refresh(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      const phd = e.target.closest('[data-ph-del]'); if (phd){ try { await apiU('DELETE', `/api/partner/photos/${phd.dataset.phDel}`); toast('Photo deleted'); refresh(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      const dd = e.target.closest('[data-doc-del]'); if (dd){ if (!confirm('Delete this document?')) return; try { await apiU('DELETE', `/api/partner/documents/${dd.dataset.docDel}`); toast('Document deleted'); refresh(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      const day = e.target.closest('[data-day]'); if (day){ const k = day.dataset.day; avSel.has(k) ? avSel.delete(k) : avSel.add(k); paint(); return; }
      const nav = e.target.closest('[data-av-nav]'); if (nav){ avOff = Math.max(0, Math.min(16, avOff + 2 * +nav.dataset.avNav)); paint(); return; }
      const av2 = e.target.closest('[data-av]'); if (av2){ try { av = await apiU('PUT', '/api/partner/availability', { days:[...avSel], status:av2.dataset.av, note:($('#av-note', box) || {}).value || '' }); avSel.clear(); toast('Availability saved'); paint(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      const bf = e.target.closest('[data-bkf]'); if (bf){ bkFilter = bf.dataset.bkf; bk = null; paint(); return; }
      const pr = e.target.closest('[data-plan-req]'); if (pr){ try { await apiU('POST', '/api/partner/plan/request', { planId:pr.dataset.planReq }); toast('Request sent. MA3AK will contact you.'); plan = null; paint(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      if (e.target.closest('[data-plan-cancel]')){ try { await apiU('POST', '/api/partner/plan/cancel'); toast('Request cancelled'); plan = null; paint(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      const tm = e.target.closest('[data-terms]'); if (tm){ if (!$('#tm-ok', box).checked){ toast('Tick the box to accept', 'alert'); return; } try { await apiU('POST', '/api/partner/terms/accept', { version:tm.dataset.terms }); toast('Terms accepted'); plan = null; await load(); paint(); } catch(err){ toast(esc(err.message), 'alert'); } return; }
    });
    box.addEventListener('change', async e => {
      if (e.target.id === 'ph-file'){ const files = [...e.target.files].slice(0, 10); for (const file of files){ try { const image = await imageFromFile(file); await apiU('POST', '/api/partner/photos', { image, alt:'' }); } catch(err){ toast(esc(err.message), 'alert'); break; } } toast('Photos uploaded'); refresh(); return; }
      const alt = e.target.closest('[data-ph-alt]'); if (alt){ try { await apiU('PATCH', `/api/partner/photos/${alt.dataset.phAlt}`, { alt:alt.value }); toast('Saved'); } catch(err){ toast(esc(err.message), 'alert'); } return; }
      if (e.target.id === 'pk-type') syncPkgType(e.target.form);
    });
    box.addEventListener('submit', async e => { e.preventDefault(); const f = e.target, btn = $('[type=submit]', f);
      if (f.id === 'pf-form'){ if (!validateForm(f, { 'pf-name':V.req('the business name'), 'pf-category':V.select('a category'), 'pf-phone':V.phoneOpt, 'pf-whatsapp':V.phoneOpt, 'pf-email':x => x ? V.email(x) : '', 'pf-website':V.urlOpt })) return; busy(btn, true, 'Saving');
        const g = k => f.elements[k].value.trim(), checked = n => $$(`input[name="${n}"]:checked`, f).map(x => x.value);
        try { await apiU('PUT', '/api/partner/profile', { name:g('pf-name'), category:g('pf-category'), description:g('pf-description'), about:g('pf-about'), locations:checked('pf-loc'), eventTypes:checked('pf-ev'), services:checked('pf-svc'), capacityMin:g('pf-capmin'), capacityMax:g('pf-capmax'), availabilityNote:g('pf-avail'), phone:g('pf-phone'), whatsapp:g('pf-whatsapp'), email:g('pf-email'), instagram:g('pf-instagram'), website:g('pf-website'),
            legalName:g('pf-legal'), businessType:g('pf-btype'), registrationNumber:g('pf-regno'), address:g('pf-addr'), details:readFields(f, catFields(d.vendor.category, 'vendor'), 'pf-f') }); toast('Profile saved'); refresh(); }
        catch(err){ busy(btn, false); showFieldErrors(f, err, { name:'pf-name', category:'pf-category', description:'pf-description', phone:'pf-phone', whatsapp:'pf-whatsapp', email:'pf-email', website:'pf-website', capacityMin:'pf-capmin', legalName:'pf-legal', address:'pf-addr' }, 'pf-f'); toast(esc(err.message), 'alert'); } return; }
      if (f.id === 'pk-form'){ if (!validateForm(f, { 'pk-name':V.req('a package name') })) return; busy(btn, true, 'Saving'); const g = k => f.elements[k].value.trim();
        try { await apiU('PUT', `/api/partner/packages/${f.dataset.id}`, { name:g('pk-name'), priceType:g('pk-type'), currency:g('pk-cur'), price:g('pk-price').replace(/,/g, ''), priceMax:g('pk-max').replace(/,/g, ''), unit:g('pk-unit') || 'flat', minQty:g('pk-min'), description:g('pk-desc'), includes:lines(g('pk-inc')), exclusions:lines(g('pk-exc')), conditions:g('pk-cond'), details:readFields(f, catFields(d.vendor.category, 'package'), 'pk-f'), active:$('#pk-active', f).checked }); editPkg = null; toast('Package saved'); refresh(); }
        catch(err){ busy(btn, false); showFieldErrors(f, err, { name:'pk-name', price:'pk-price', priceMax:'pk-max', conditions:'pk-cond' }, 'pk-f'); toast(esc(err.message), 'alert'); } return; }
      if (f.id === 'doc-form'){ const file = f.elements['doc-file'].files[0]; if (!validateForm(f, { 'doc-kind':V.select('the type of document') })) return; if (!file){ $('#doc-file-err', f).textContent = 'Choose a file.'; return; }
        if (file.size > 4 * 1024 * 1024 || !/^(application\/pdf|image\/(jpeg|png))$/.test(file.type)){ $('#doc-file-err', f).textContent = 'Use a PDF, JPG or PNG under 4 MB.'; return; } busy(btn, true, 'Uploading');
        try { const data = file.type === 'application/pdf' ? await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); }) : await imageFromFile(file, 2400, .9);
          await apiU('POST', '/api/partner/documents', { kind:f.elements['doc-kind'].value, file:data, name:file.name, note:f.elements['doc-note'].value }); toast('Uploaded privately'); refresh(); }
        catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); } return; }
      if (f.matches('.rv-reply')){ busy(btn, true, 'Saving'); try { await apiU('POST', `/api/partner/reviews/${f.dataset.rid}/reply`, { reply:f.elements.reply.value }); toast('Reply saved'); revs = null; paint(); } catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); } }
    });
  } };
const BookingsRedirect = { title:'Bookings | Ma3ak', render(){ return ''; }, mount(){ location.replace(AUTH.user && AUTH.user.role === 'partner' ? '#/partner?tab=bookings' : '#/dashboard?tab=bookings'); } };
