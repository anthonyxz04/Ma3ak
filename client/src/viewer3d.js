/* =========================================================
   3D VIEWERS — hero viewer, event thumbnails, full-screen modal
   ========================================================= */
const HERO_SCENES = ['wedding','engagement','birthday','corporate','private','beach'];
const LEGACY_SVG = { wedding:'wedding', engagement:'wedding', other:'wedding', birthday:'birthday', 'baby-shower':'birthday', graduation:'birthday', bachelor:'birthday', private:'birthday', corporate:'corporate', beach:'beach', bachelorette:'beach', outdoor:'beach' };
const has3D = (() => { let v; return () => v ?? (v = typeof GL3D !== 'undefined' && GL3D.supported()); })();
function SceneCats(key){ return S3.SCENES[key].cats.map(id => { const c = byId(CATEGORIES,id); return `<a href="#/search${qs({ category:id })}">${icon(c.icon,'sm')}${c.single}</a>`; }).join(''); }
function sceneStage(key, cls=''){
  const d = S3.SCENES[key];
  return `<div class="scene-stage ${cls}">
    <canvas class="scene-canvas" tabindex="0" aria-label="Interactive 3D example of a ${esc(d.label.toLowerCase())} setup. Drag, or use the arrow keys, to look around."></canvas>
    <div class="scene-fallback" hidden></div>
    <div class="scene-caption"><b data-cap-title>${esc(d.label)}</b><span data-cap-sub>${esc(d.sub)}</span></div>
    <span class="scene-hint" aria-hidden="true">Drag to look around</span>
  </div>`;
}
function startViewer(stage, key){
  const canvas = $('canvas', stage), fb = $('.scene-fallback', stage);
  let viewer = null;
  if (has3D()){ try { viewer = new GL3D.Viewer(canvas); GL3D._viewers.add(viewer); viewer.load(S3.SCENES[key]); viewer.loop(); } catch(e){ console.warn('3D unavailable', e); viewer = null; } }
  if (!viewer){ canvas.hidden = true; fb.hidden = false; fb.innerHTML = renderScene(LEGACY_SVG[key]); $('.scene-hint', stage).hidden = true; }
  return {
    viewer,
    set(k){ const d = S3.SCENES[k]; $('[data-cap-title]', stage).textContent = d.label; $('[data-cap-sub]', stage).textContent = d.sub; canvas.setAttribute('aria-label', `Interactive 3D example of a ${d.label.toLowerCase()} setup. Drag, or use the arrow keys, to look around.`);
      stage.classList.add('swap'); setTimeout(() => { if (viewer) viewer.load(d); else fb.innerHTML = renderScene(LEGACY_SVG[k]); stage.classList.remove('swap'); }, 160); },
    destroy(){ if (viewer){ viewer.destroy(); GL3D._viewers.delete(viewer); } }
  };
}
function SceneViewer(initial='wedding'){
  return `<figure class="scene-card" data-scene-viewer>
    ${sceneStage(initial)}
    <figcaption class="scene-bar">
      <div class="scene-tabs" role="tablist" aria-label="Example event setups">${HERO_SCENES.map(k => `<button type="button" role="tab" class="scene-tab" data-scene="${k}" aria-selected="${k===initial}">${S3.SCENES[k].label}</button>`).join('')}</div>
      <a class="scene-more" href="#/events">All 12 setups</a>
    </figcaption>
    <div class="scene-cats" id="scene-cats">${SceneCats(initial)}</div>
  </figure>`;
}
function mountSceneViewer(root){
  const v = $('[data-scene-viewer]', root); if (!v) return;
  const ctl = startViewer($('.scene-stage', v), $('[data-scene][aria-selected="true"]', v).dataset.scene);
  v.addEventListener('click', e => {
    const b = e.target.closest('[data-scene]'); if (!b || b.getAttribute('aria-selected') === 'true') return;
    $$('[data-scene]', v).forEach(x => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    ctl.set(b.dataset.scene); $('#scene-cats', v).innerHTML = SceneCats(b.dataset.scene);
  });
  v.addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight'].includes(e.key) || !e.target.matches('[data-scene]')) return;
    const tabs = $$('[data-scene]', v), i = tabs.indexOf(e.target), n = tabs[(i + (e.key==='ArrowRight'?1:-1) + tabs.length) % tabs.length];
    n.focus(); n.click();
  });
}
/* Event card thumbnails: one shared renderer, rendered lazily one at a time */
const snapCache = {};
let snapQueue = [], snapBusy = false;
function queueSnap(el){
  const key = el.dataset.snap;
  if (snapCache[key]) return showSnap(el, snapCache[key]);
  snapQueue.push(el); if (!snapBusy) drainSnaps();
}
function showSnap(el, url){ const img = $('img', el); img.decoding = 'async'; img.onload = () => el.classList.add('ready'); img.src = url; img.hidden = false; if (img.complete) el.classList.add('ready'); }
function drainSnaps(){
  const el = snapQueue.shift(); if (!el){ snapBusy = false; return; } snapBusy = true;
  setTimeout(() => {
    const key = el.dataset.snap;
    try { const w = Math.round(Math.min(1600, Math.max(880, el.clientWidth * Math.min(window.devicePixelRatio || 1, 2.5)))); snapCache[key] = snapCache[key] || GL3D.snapshot(S3.SCENES[key], w, Math.round(w * 560/880)); showSnap(el, snapCache[key]); }
    catch(e){ el.innerHTML = renderScene(LEGACY_SVG[key]); el.classList.add('ready'); }
    drainSnaps();
  }, 30);
}
function mountSnapshots(root){
  const els = $$('[data-snap]', root); if (!els.length) return;
  if (!has3D()){ els.forEach(el => { el.innerHTML = renderScene(LEGACY_SVG[el.dataset.snap]); el.classList.add('ready'); }); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ io.unobserve(en.target); queueSnap(en.target); } }), { rootMargin:'200px' });
  els.forEach(el => io.observe(el));
}
function open3DModal(key){
  const d = S3.SCENES[key];
  openModal({ title:`${d.label} setup`, wide:true, body:`<p class="muted small" style="margin:-.5rem 0 1rem">${esc(d.sub)}. An example illustration of how this kind of event could look. Drag to look around.</p>
    ${sceneStage(key, 'in-modal')}<div class="scene-cats light">${SceneCats(key)}</div>
    <div class="chip-row" style="margin-top:1.25rem"><a class="btn btn-primary" href="#/plan${qs({ event:key })}">Plan this event</a><a class="btn btn-ghost" href="#/search${qs({ event:key })}">Find vendors</a></div>`,
    onMount(m){ const ctl = startViewer($('.scene-stage', m), key); window._modalCleanup = () => ctl.destroy(); } });
}
document.addEventListener('click', e => { const b = e.target.closest('[data-view3d]'); if (b){ e.preventDefault(); open3DModal(b.dataset.view3d); } });
