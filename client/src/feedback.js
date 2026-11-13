/* =========================================================
   FEEDBACK — #/feedback. Anyone can send an idea, a problem or a compliment.
   It's stored on the server and read by the team in Admin → Feedback.
   ========================================================= */
// Remember the page the visitor came from, so the team knows where a problem happened.
let feedbackFrom = '';
window.addEventListener('hashchange', e => {
  try { const old = new URL(e.oldURL).hash.slice(1).split('?')[0]; if (old.startsWith('/') && !old.startsWith('/feedback')) feedbackFrom = old.slice(0, 200); } catch(err){}
});
const FEEDBACK_KINDS = [['idea','bulb','An idea'],['problem','alert','Something isn’t working'],['praise','heart','A compliment'],['other','message','Something else']];

const FeedbackPage = {
  title:'Send feedback | Ma3ak',
  render(){
    return `
    <section class="page-hero"><div class="wrap split">
      <div>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Feedback</span></nav>
        <h1 class="h1">Tell us what you think</h1>
        <p class="lede">Spotted a problem, have an idea, or loved something? Your feedback goes straight to the MA3AK team and helps us make the site better.</p>
        <ul class="contact-list">
          <li><span class="card-ico">${icon('eye')}</span><div><small>We read everything</small><span>Every message is read by a person on our team.</span></div></li>
          <li><span class="card-ico">${icon('mail')}</span><div><small>Want a reply?</small><span>Add your email and we’ll get back to you.</span></div></li>
          <li><span class="card-ico">${icon('calendar')}</span><div><small>Need help with a booking?</small><a class="link" href="#/contact">Contact us instead</a></div></li>
        </ul>
      </div>
      <div id="fb-wrap" style="padding-top:2.6rem">
        <form class="form" id="fb-form" novalidate>
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">What is it about?</legend>
            <div class="chip-row" role="radiogroup">${FEEDBACK_KINDS.map(([v, ic, l]) => `<label class="chip-check"><input type="radio" name="fb-kind" value="${v}"><span>${icon(ic,'sm')}${l}</span></label>`).join('')}</div>
            <span class="err" id="fb-kind-err" role="alert"></span>
          </fieldset>
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">How is your experience with Ma3ak so far? <span class="opt">(optional)</span></legend>
            <div class="stars-in" role="radiogroup" aria-label="Rating">${[5,4,3,2,1].map(n => `<label><input type="radio" name="fb-rating" value="${n}"><span aria-hidden="true">★</span><span class="sr-only">${n} star${n > 1 ? 's' : ''}</span></label>`).join('')}</div>
          </fieldset>
          ${FormField({ id:'fb-message', label:'Your feedback', type:'textarea', required:true, placeholder:'Tell us what happened, or what you’d like to see.' })}
          ${FormField({ id:'fb-email', label:'Email', type:'email', autocomplete:'email', hint:'Only if you’d like a reply.' })}
          <div id="fb-consent" hidden>${ConsentField('fb-consent-box')}</div>
          ${HONEYPOT}
          <div><button class="btn btn-primary" type="submit">Send feedback</button></div>
        </form>
      </div>
    </div></section>`;
  },
  mount(){
    const f = $('#fb-form'); stampForm(f);
    const email = f.elements['fb-email'], consent = $('#fb-consent');
    // The consent box only appears (and is only required) when an email is added.
    email.addEventListener('input', () => { consent.hidden = !email.value.trim(); });
    f.addEventListener('change', e => { if (e.target.name === 'fb-kind'){ $('#fb-kind-err', f).textContent = ''; e.target.closest('.field').classList.remove('invalid'); } });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const kind = $('input[name=fb-kind]:checked', f), rating = $('input[name=fb-rating]:checked', f);
      if (!kind){ const fs = $('input[name=fb-kind]', f).closest('.field'); fs.classList.add('invalid'); $('#fb-kind-err', f).textContent = 'Choose what your feedback is about.'; $('input[name=fb-kind]', f).focus(); return; }
      if (!validateForm(f, { 'fb-message':V.min('Your feedback', 5), 'fb-email':v => v ? V.email(v) : '' })) return;
      const em = email.value.trim(); if (em && !consentOk(f, 'fb-consent-box')) return;
      const btn = f.querySelector('[type=submit]'); busy(btn, true);
      const from = feedbackFrom;
      try {
        const r = await apiPost('/api/feedback', { kind:kind.value, rating:rating ? Number(rating.value) : '', message:f.elements['fb-message'].value.trim(), email:em, consent:!!(em && f.elements['fb-consent-box'].checked), page:from, lang:(typeof I18N !== 'undefined' ? I18N.lang : 'en'), ...formMeta(f) });
        $('#fb-wrap').innerHTML = `<div class="form-success" tabindex="-1"><div class="card-ico">${icon('check')}</div><h3>Thank you for your feedback</h3><p>${em ? 'We read every message. If a reply is needed, we’ll write to you.' : 'We read every message and use it to improve Ma3ak.'}</p><p class="small" style="margin-top:.6rem">Reference <b>${esc(r.ref)}</b></p>
          <div class="actions">${from ? `<a class="btn btn-ghost" href="#${esc(from)}">Back to where you were</a>` : `<a class="btn btn-ghost" href="#/">Go home</a>`}</div></div>`;
        $('.form-success').focus();
      } catch(err){ busy(btn, false); showServerErrors(f, err, { message:'fb-message', email:'fb-email', consent:'fb-consent-box' }); if (err.fields && err.fields.kind) $('#fb-kind-err', f).textContent = err.fields.kind; toast(esc(err.message), 'alert'); }
    });
  }
};

/* =========================================================
   STAR RATINGS (1–5) — providers, event types, and the customer's own event.
   ========================================================= */
// Radio stars: listed 5→1 in the page so the CSS (row-reverse) shows 1→5 in reading order.
function StarInput(name, value=0, label='Rating'){
  return `<div class="stars-in" role="radiogroup" aria-label="${esc(label)}">${[5,4,3,2,1].map(n => `<label><input type="radio" name="${esc(name)}" value="${n}"${n === value ? ' checked' : ''}><span aria-hidden="true">★</span><span class="sr-only">${n} star${n > 1 ? 's' : ''}</span></label>`).join('')}</div>`;
}
function StarsShow(average, count){
  if (!count) return `<span class="stars-show muted small">No ratings yet</span>`;
  const full = Math.round(average);
  return `<span class="stars-show small"><span class="stars" aria-hidden="true">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span><b>${average.toFixed(1)}</b><span class="muted">(${count} rating${count === 1 ? '' : 's'})</span><span class="sr-only">${average.toFixed(1)} out of 5</span></span>`;
}

// Provider page: rate once, change or remove later.
async function mountVendorRating(root, v, onChange){
  const box = $('#vp-rate', root); if (!box) return;
  await AUTH.ready;
  let s; try { s = await apiU('GET', `/api/vendors/${encodeURIComponent(v.id)}/my-rating`); } catch(e){ return; }
  const paint = () => {
    if (!s.signedIn){ box.innerHTML = `<div class="panel rate-panel"><div><h3 class="h3">Rate ${esc(v.name)}</h3><p class="small muted">Sign in to give 1 to 5 stars.</p></div><button class="btn btn-ghost btn-sm" type="button" data-rate-signin>${icon('star','sm')}Sign in to rate</button></div>`; return; }
    if (s.reason === 'verified'){ box.innerHTML = `<div class="panel rate-panel"><p class="small">${icon('check','sm')} You reviewed this provider after your booking. Thank you!</p></div>`; return; }
    if (!s.canRate){ box.innerHTML = ''; return; }
    const m = s.mine;
    box.innerHTML = `<form class="panel form rate-panel col" id="vr-form" novalidate>
      <h3 class="h3">${m ? 'Your rating' : `Rate ${esc(v.name)}`}</h3>
      ${m && m.hidden ? `<p class="small pl-warn">${icon('info','sm')}MA3AK hid your rating because it didn’t follow the rules. You can edit it.</p>` : ''}
      ${StarInput('vr-r', m ? m.rating : 0, 'Your rating')}
      ${FormField({ id:'vr-body', label:'Comment', type:'textarea', value:m ? m.body : '', placeholder:'What was good, and what could be better?' })}
      <div class="chip-row"><button class="btn btn-primary btn-sm" type="submit">${m ? 'Update my rating' : 'Post my rating'}</button>${m ? `<button class="btn btn-ghost btn-sm" type="button" data-rate-remove>Remove my rating</button>` : ''}</div>
      <p class="tiny muted">Your first name and the initial of your last name are shown with your rating.</p></form>`;
  };
  paint();
  box.addEventListener('click', async e => {
    if (e.target.closest('[data-rate-signin]')) needAuth();
    if (e.target.closest('[data-rate-remove]')){ try { await apiU('DELETE', `/api/vendors/${encodeURIComponent(v.id)}/rating`); s.mine = null; paint(); onChange(); toast('Rating removed'); } catch(err){ toast(esc(err.message), 'alert'); } }
  });
  box.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, r = $('input[name=vr-r]:checked', f);
    if (!r){ toast('Choose 1 to 5 stars', 'alert'); return; }
    const btn = $('[type=submit]', f); busy(btn, true, 'Saving');
    try { const body = f.elements['vr-body'].value.trim(); await apiU('PUT', `/api/vendors/${encodeURIComponent(v.id)}/rating`, { rating:Number(r.value), body }); s.mine = { rating:Number(r.value), body, hidden:false }; paint(); onChange(); toast('Thanks for your rating'); }
    catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); }
  });
}

// Events page: average under each event type, and your own stars.
(() => {
  const base = Events.mount;
  Events.mount = function(root, ...rest){
    if (base) base.call(this, root, ...rest);
    let data = { ratings:{}, mine:{}, signedIn:false };
    const paint = () => $$('[data-evrate]', root).forEach(el => {
      const id = el.dataset.evrate, r = data.ratings[id] || { average:null, count:0 }, mine = data.mine[id] || 0;
      el.innerHTML = `${StarsShow(r.average || 0, r.count)}<div class="ev-rate-mine"><span class="small muted">${mine ? 'Your rating' : 'Rate it'}</span>${StarInput('er-' + id, mine, 'Rate ' + ((byId(EVENT_TYPES, id) || {}).name || id))}</div>`;
    });
    const load = () => apiU('GET', '/api/event-ratings').then(d => { data = d; paint(); }).catch(() => {});
    paint(); AUTH.ready.then(load);
    root.addEventListener('change', async e => {
      const inp = e.target.closest('[data-evrate] input[type=radio]'); if (!inp) return;
      const id = inp.closest('[data-evrate]').dataset.evrate;
      if (!AUTH.user){ inp.checked = false; toast('Sign in to rate', 'info'); needAuth(); return; }
      try { const r = await apiU('PUT', `/api/event-ratings/${encodeURIComponent(id)}`, { rating:Number(inp.value) }); data.ratings[id] = r.rating; data.mine[id] = r.mine; paint(); toast('Thanks for your rating'); }
      catch(err){ toast(esc(err.message), 'alert'); paint(); }
    });
  };
})();

// Your own plan: once the event date has passed, "How did your event go?"
(() => {
  const baseRender = PlannerPage.render, baseMount = PlannerPage.mount;
  PlannerPage.render = function(...a){ return baseRender.apply(this, a) + `<section class="section tight" id="evr-sec" style="padding-top:0" hidden><div class="wrap"><div id="evr-root"></div></div></section>`; };
  PlannerPage.mount = async function(root, params, ...rest){
    const done = baseMount.call(this, root, params, ...rest);
    const id = params && params[0]; if (!id) return done;
    await AUTH.ready; if (!AUTH.user) return done;
    let s; try { s = await apiU('GET', `/api/events/${encodeURIComponent(id)}/rating`); } catch(e){ return done; }
    if (!s.canRate) return done;
    const sec = $('#evr-sec', root), box = $('#evr-root', root); if (!sec || !box) return done;
    const paint = edit => {
      box.innerHTML = s.rating && !edit
        ? `<div class="panel rate-panel"><div><h2 class="h3">How did your event go?</h2><p>${StarsShow(s.rating, 1).replace(/\(1 rating\)/, '')}</p>${s.comment ? `<p class="small" style="margin-top:.4rem">${esc(s.comment)}</p>` : ''}</div><button class="btn btn-ghost btn-sm" type="button" data-evr-edit>Change</button></div>`
        : `<form class="panel form rate-panel col" id="evr-form" novalidate><h2 class="h3">How did your event go?</h2><p class="small muted">Your event date has passed. Rate it from 1 to 5 stars. Only you and the MA3AK team see this.</p>
            ${StarInput('evr-r', s.rating || 0, 'How did your event go?')}
            ${FormField({ id:'evr-comment', label:'Anything to tell us?', type:'textarea', value:s.comment || '', placeholder:'What went well, and what could have gone better?' })}
            <div><button class="btn btn-primary btn-sm" type="submit">Save my rating</button></div></form>`;
    };
    sec.hidden = false; paint(false);
    box.addEventListener('click', e => { if (e.target.closest('[data-evr-edit]')) paint(true); });
    box.addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target, r = $('input[name=evr-r]:checked', f); if (!r){ toast('Choose 1 to 5 stars', 'alert'); return; }
      const btn = $('[type=submit]', f); busy(btn, true, 'Saving');
      try { const comment = f.elements['evr-comment'].value.trim(); await apiU('PUT', `/api/events/${encodeURIComponent(id)}/rating`, { rating:Number(r.value), comment }); s.rating = Number(r.value); s.comment = comment; paint(false); toast('Thanks for your rating'); }
      catch(err){ busy(btn, false); toast(esc(err.message), 'alert'); }
    });
    return done;
  };
})();
