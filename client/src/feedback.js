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
