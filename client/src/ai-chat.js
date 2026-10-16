/* =========================================================
   MA3AK AI ASSISTANT — talks to /api/ai/chat (the server holds the key).
   Suggestions are shown as proposals; nothing changes until the customer approves.
   ========================================================= */
const MA3AK_AI = (() => {
  let el = null, convId = null, configured = null, mode = 'rules', busy_ = false;
  const SUGGEST = ['How much is a photographer?', 'Catering for 150 guests', 'I have $15,000 for a wedding with 180 guests', 'Venue in Batroun for 200 guests'];
  const context = () => window.MA3AK_BUILDER && location.hash.startsWith('#/studio') || location.hash.startsWith('#/customize') ? (window.MA3AK_BUILDER ? window.MA3AK_BUILDER.getState() : store.get('custom') || {}) : (store.get('custom') || {});
  const handoff = () => `<div class="ai-hand"><p>Talk to the MA3AK team:</p><div class="ai-hand-g">
      <a href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi MA3AK, I’d like help with my event.')}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}WhatsApp</a>
      <a href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer">${icon('instagram','sm')}Instagram</a>
      <a href="mailto:${CONFIG.email}">${icon('mail','sm')}Email</a>
      <a href="${CONFIG.phoneHref || '#/contact'}">${icon('phone','sm')}Call</a></div>
      ${window.MA3AK_BUILDER ? `<button type="button" class="btn btn-primary btn-sm btn-block" data-ai-send>${icon('send','sm')}Send my event design to the team</button>` : ''}</div>`;
  const bubble = (role, html) => { const m = document.createElement('div'); m.className = `ai-m ${role}`; m.innerHTML = html; $('#ai-log').appendChild(m); $('#ai-log').scrollTop = 1e6; return m; };
  function open(){
    if (typeof TRACK === 'function') TRACK('ai_opened', {});
    if (!el){
      el = document.createElement('div'); el.className = 'ai-panel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'MA3AK assistant');
      el.innerHTML = `<header class="ai-h"><span class="ai-av">${icon('sparkle','sm')}</span><div><b>MA3AK assistant</b><small>Knows your current event</small></div><button class="icon-btn" type="button" data-ai-close aria-label="Close">${icon('x','sm')}</button></header>
        <div class="ai-log" id="ai-log" aria-live="polite"></div>
        <div class="ai-sug" id="ai-sug">${SUGGEST.map(s => `<button type="button" data-ai-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
        <form class="ai-f" id="ai-f"><label class="sr-only" for="ai-in">Message</label><input id="ai-in" autocomplete="off" maxlength="2000" placeholder="Ask about your event…"><button class="ai-go" type="submit" aria-label="Send">${icon('send','sm')}</button></form>
        <p class="ai-fine" id="ai-fine">Prices are estimates from providers’ packages. Availability is confirmed by each provider.</p>`;
      document.body.appendChild(el);
      bubble('bot', `Hi! I’m the MA3AK assistant. Ask about providers, prices, budgets or themes, or pick an idea below.`);
      el.addEventListener('click', onClick); $('#ai-f', el).addEventListener('submit', e => { e.preventDefault(); const i = $('#ai-in', el); send(i.value); i.value = ''; });
      el.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      fetch('/api/ai/status').then(r => r.json()).then(j => { configured = !!j.configured; mode = j.mode || 'rules'; const sm = $('.ai-h small', el); if (sm) sm.textContent = mode === 'ai' ? 'AI assistant · knows your current event' : 'Answers from MA3AK’s providers and prices'; }).catch(() => { configured = false; bubble('bot', `The assistant needs the live MA3AK site. You can reach our team directly.${handoff()}`); });
    }
    el.classList.add('open'); document.body.classList.add('ai-open'); setTimeout(() => $('#ai-in', el).focus(), 60);
  }
  function close(){ if (el){ el.classList.remove('open'); document.body.classList.remove('ai-open'); } }
  async function send(text){
    text = String(text || '').trim(); if (!text || busy_) return; $('#ai-sug', el).hidden = true; bubble('me', esc(text));
    if (configured === false){ bubble('bot', `The assistant isn’t available yet.${handoff()}`); return; }
    busy_ = true; const typing = bubble('bot typing', '<i></i><i></i><i></i>');
    try {
      const r = await fetch('/api/ai/chat', { method:'POST', credentials:'same-origin', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ message:text, conversationId:convId, eventId:window.MA3AK_BUILDER && window.MA3AK_BUILDER.eventId, state:context() }) });
      const j = await r.json().catch(() => ({})); typing.remove();
      if (!r.ok){ bubble('bot', `${esc(j.error || 'Something went wrong.')}${j.code === 'not_configured' || j.code === 'provider' ? handoff() : ''}`); return; }
      convId = j.conversationId;
      const m = bubble('bot', esc(j.reply).replace(/\n/g, '<br>'));
      if ((j.providers || []).length) m.insertAdjacentHTML('beforeend', `<div class="ai-prov">${j.providers.map(p => `<a href="#/vendor/${esc(p.id)}"><b>${esc(p.name)}</b>${p.isDemo ? ' <span class="tag demo-tag">Demo</span>' : ''}${p.verified ? ' <span class="tag gold">Verified</span>' : ''}<small>${p.from != null ? `From ${money(p.from)}${({ per_guest:' / guest', per_hour:' / hour', per_item:' each' })[p.unit] || ''}` : 'Price on request'}</small></a>`).join('')}</div>`);
      if ((j.links || []).length) m.insertAdjacentHTML('beforeend', `<div class="ai-links">${j.links.map(l => /^#\//.test(l.href) ? `<a class="chip" href="${esc(l.href)}">${esc(l.label)}</a>` : '').join('')}</div>`);
      (j.actions || []).forEach((a, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ai-act'; b.innerHTML = `${icon('sparkle','sm')}${esc(a.label)}`; b.onclick = () => review(a); m.appendChild(b); });
      if (j.handoff) bubble('bot', handoff());
    } catch(e){ typing.remove(); bubble('bot', `You seem to be offline.${handoff()}`); }
    finally { busy_ = false; }
  }
  // Show exactly what would change; apply only after the customer confirms.
  function review(a){
    const cur = context(), fmt = v => Array.isArray(v) ? (v.length ? v.join(', ') : 'nothing') : (v === '' || v == null ? 'not set' : String(v));
    const merged = {}; Object.entries(a.changes).forEach(([k, val]) => { merged[k] = Array.isArray(val) && Array.isArray(cur[k]) ? [...new Set([...cur[k], ...val])] : val; });
    openModal({ title:'Apply this suggestion?', body:`<p class="muted small" style="margin:-.5rem 0 1rem">${esc(a.label)}. You can undo it any time.</p><table class="ai-diff">${Object.entries(merged).map(([k, val]) => `<tr><th>${esc(k)}</th><td><s>${esc(fmt(cur[k]))}</s></td><td>${esc(fmt(val))}</td></tr>`).join('')}</table>
      <div class="chip-row" style="margin-top:1.25rem"><button class="btn btn-primary" id="ai-ok">Apply</button><button class="btn btn-ghost" data-close>Not now</button></div>`,
      onMount(m){ $('#ai-ok', m).onclick = () => { closeModal();
        if (window.MA3AK_BUILDER) window.MA3AK_BUILDER.apply(merged, a.label);
        else { const d = store.get('custom') || {}; Object.assign(d, merged); store.set('custom', d); toast('Applied to your design'); location.hash = '#/customize'; } }; } });
  }
  function onClick(e){
    if (e.target.closest('[data-ai-close]')) return close();
    const q = e.target.closest('[data-ai-q]'); if (q) return send(q.dataset.aiQ);
    if (e.target.closest('[data-ai-send]')){ close(); const b = document.querySelector('[data-cat="send"]'); if (b) b.click(); }
  }
  // floating launcher on regular pages (the builder has its own button)
  const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'ai-fab'; fab.innerHTML = `${icon('sparkle','sm')}<span>Ask MA3AK</span>`; fab.setAttribute('aria-label', 'Ask the MA3AK assistant'); fab.onclick = open;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(fab)); if (document.readyState !== 'loading') document.body.appendChild(fab);
  addEventListener('hashchange', () => { if (location.hash.startsWith('#/s/')) close(); });
  document.addEventListener('click', e => { if (e.target.closest('[data-open-ai]')) open(); });
  return { open, close, send };
})();
