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
