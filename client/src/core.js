/* =========================================================
   ICONS (Lucide paths, inlined to avoid extra requests)
   ========================================================= */
const ICONS = {
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  instagram:'<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  minus:'<path d="M5 12h14"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  image:'<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  star:'<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  store:'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M2 7h20M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trend:'<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  scale:'<path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a4 4 0 0 0 6 0zM18 7l-3 7a4 4 0 0 0 6 0z"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  mailbox:'<path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><path d="M15 9h3v2M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2M6 10h1"/>',
  seat:'<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2M19 18v2"/>',
  palette:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  message:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  wand:'<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72M14 7l3 3M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9"/>',
  boat:'<path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z"/><path d="M21 14 10 2 3 14h18Z"/><path d="M10 2v16"/>',
  mountain:'<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo:'<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>',
  play:'<path d="m7 4 13 8-13 8z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sunset:'<path d="M12 10V2M5.2 11.2l1.4 1.4M2 18h2M20 18h2M17.4 12.6l1.4-1.4M22 22H2M16 18a4 4 0 0 0-8 0M8 6l4-4 4 4"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M9 13h6M9 17h4"/>',
  panel:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  // categories
  building:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/>',
  utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  video:'<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16v5M16.5 18.5h5"/>',
  flower:'<circle cx="12" cy="8" r="3"/><path d="M12 11v11M12 5V2M9 8H6M18 8h-3M8 17c-2.2 0-3.5-1.3-3.5-3.5 2.2 0 3.5 1.3 3.5 3.5ZM16 19c2.2 0 3.5-1.3 3.5-3.5-2.2 0-3.5 1.3-3.5 3.5Z"/>',
  cake:'<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
  clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 14l2 2 4-4"/>',
  armchair:'<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2M19 18v2"/>',
  bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  brush:'<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>',
  scissors:'<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  // events
  ring:'<circle cx="12" cy="15" r="6"/><path d="m9.5 5 2.5 3 2.5-3-1-2h-3z"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  cap:'<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
  briefcase:'<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  glass:'<path d="M8 22h8M12 11v11M5 3h14l-1.5 5.5a5.7 5.7 0 0 1-11 0z"/>',
  baby:'<circle cx="12" cy="12" r="9"/><path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M12 3c1.5 1.5 1.5 3 0 4"/>',
  umbrella:'<path d="M22 12a10 10 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0M12 2v1"/>',
  tent:'<path d="M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20"/>'
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]||ICONS.more}</svg>`;

/* =========================================================
   HELPERS
   ========================================================= */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$' + Math.round(+n||0).toLocaleString('en-US');
const fmtDate = (d, opts={day:'numeric',month:'long',year:'numeric'}) => { if(!d) return ''; const x = typeof d === 'string' ? new Date(d+'T12:00:00') : d; return isNaN(x) ? '' : x.toLocaleDateString('en-GB', opts); };
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const qs = obj => { const p = new URLSearchParams(); Object.entries(obj).forEach(([k,v]) => { if (Array.isArray(v)) { if (v.length) p.set(k, v.join(',')); } else if (v !== '' && v != null) p.set(k, v); }); const s = p.toString(); return s ? '?' + s : ''; };
const igLink = (cls='icon-btn', label='MA3AK on Instagram (opens in a new tab)') => `<a class="${cls}" href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon('instagram')}</a>`;
const mailLink = (cls='') => `<a class="${cls}" href="mailto:${CONFIG.email}">${CONFIG.email}</a>`;
const phoneText = (cls='') => CONFIG.phoneHref ? `<a class="${cls}" href="${CONFIG.phoneHref}">${CONFIG.phone}</a>` : `<span class="${cls}" title="Phone number coming soon">${CONFIG.phone}</span>`;

/* =========================================================
   STORE — local persistence (swap for user accounts later)
   ========================================================= */
const store = (() => {
  const KEY = 'ma3ak:v1';
  let state = { plan:null, tasks:{}, myVendors:[], vendorDraft:null };
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(state, JSON.parse(raw)); } catch(e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {} };
  return {
    get: k => state[k],
    set(k, v){ state[k] = v; save(); },
    toggleTask(id){ state.tasks[id] = !state.tasks[id]; save(); return state.tasks[id]; },
    addVendor(v){ if (!state.myVendors.find(x => x.id === v.id)) { state.myVendors.push({ id:v.id, name:v.name, category:v.category, status:'pending' }); save(); return true; } return false; },
    reset(){ state.plan = null; state.tasks = {}; save(); }
  };
})();

/* =========================================================
   SHARED COMPONENTS
   ========================================================= */
function Logo({ tag='a', href='#/', label=true } = {}){
  return `<${tag} class="logo" ${tag==='a'?`href="${href}"`:''} ${label?'aria-label="MA3AK home"':''}><img class="logo-mark" src="${LOGO.mark}" alt="" width="34" height="34"><img class="logo-word" src="${LOGO.word}" alt="MA3AK" width="112" height="19"></${tag}>`;
}
function SectionHeader({ title, lede='', level='h2', cls='h2', aside='' }){
  return `<div class="section-head"><div><${level} class="${cls}">${title}</${level}>${lede?`<p class="lede">${lede}</p>`:''}</div>${aside}</div>`;
}
function EmptyState({ iconName='search', title, text, actions='', level='h3' }){
  return `<div class="empty"><div class="card-ico">${icon(iconName)}</div><${level}>${title}</${level}><p>${text}</p>${actions?`<div class="actions">${actions}</div>`:''}</div>`;
}
function VendorCard(v){
  const photo = v.photos && v.photos[0];
  const loc = (v.locations||[]).map(locName).join(', ');
  return `<article class="vendor-card">
    <div class="vc-img">${photo ? `<img src="${esc(photo.src)}" alt="${esc(photo.alt||v.name)}" loading="lazy" decoding="async">` : `<div class="ph">${icon('image')}</div>`}</div>
    <div class="vc-body">
      <span class="tag">${esc(catSingle(v.category))}</span>${v.isDemo ? ' <span class="tag demo-tag" title="A sample listing for trying the planner. Not a real business; prices are illustrative.">Demo listing</span>' : ''}${v.verified ? ` <span class="tag gold">${icon('check','sm')}Verified</span>` : ''}${v.sponsored ? ' <span class="tag sponsored-tag" title="Paid placement. It doesn’t affect verification.">Sponsored</span>' : ''}
      <h3 class="h3">${esc(v.name)}</h3>
      <div class="vc-meta"><span>${icon('pin','sm')}${esc(loc)}</span>${v.rating!=null?`<span>${icon('star','sm')}${v.rating.toFixed(1)} (${v.reviewCount})</span>`:''}</div>
      <p class="muted small">${esc(v.description||'')}</p>
      ${v.startingFrom?`<p class="vc-price"><b>${esc(fromTxt(v))}</b>${v.isDemo ? ' <small class="muted">(illustrative)</small>' : ''}</p>`:`<p class="vc-price muted">Custom quote</p>`}
      <div class="vc-actions"><a class="btn btn-ghost btn-sm" href="#/vendor/${esc(v.id)}">View profile</a><button class="btn btn-primary btn-sm" data-add-vendor="${esc(v.id)}">Add to plan</button></div>
    </div></article>`;
}
function Skeletons(n=6){ return Array.from({length:n}, () => `<div class="skeleton" aria-hidden="true"><div class="sk-img"></div><div class="sk-line" style="width:40%"></div><div class="sk-line" style="width:75%"></div><div class="sk-line" style="width:55%;margin-bottom:22px"></div></div>`).join(''); }
function FormField({ id, label, type='text', required=false, showOpt=true, placeholder='', options=null, hint='', autocomplete='', value='', inputmode='' }){
  const req = required ? ' required aria-required="true"' : '';
  const described = `aria-describedby="${id}-err${hint?` ${id}-hint`:''}"`;
  let control;
  if (options) control = `<select class="select" id="${id}" name="${id}"${req} ${described}><option value="">${esc(placeholder||'Select')}</option>${options.map(o => `<option value="${esc(o.value)}"${o.value===value?' selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
  else if (type==='textarea') control = `<textarea class="textarea" id="${id}" name="${id}"${req} placeholder="${esc(placeholder)}" ${described}>${esc(value)}</textarea>`;
  else control = `<input class="input" id="${id}" name="${id}" type="${type}"${req} placeholder="${esc(placeholder)}" value="${esc(value)}"${autocomplete?` autocomplete="${autocomplete}"`:''}${inputmode?` inputmode="${inputmode}"`:''} ${described}>`;
  return `<div class="field"><label for="${id}">${label}${required||!showOpt?'':' <span class="opt">(optional)</span>'}</label>${control}${hint?`<span class="hint" id="${id}-hint">${hint}</span>`:''}<span class="err" id="${id}-err" role="alert"></span></div>`;
}
const opt = (list, key='id', lab='name') => list.map(x => ({ value:x[key], label:x[lab] }));

function validateForm(form, rules){
  let firstBad = null;
  Object.entries(rules).forEach(([id, check]) => {
    const el = form.elements[id]; if (!el) return;
    const field = el.closest('.field');
    const msg = check((el.value||'').trim());
    field.classList.toggle('invalid', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = $('#'+id+'-err', form); if (err) err.textContent = msg || '';
    if (msg && !firstBad) firstBad = el;
  });
  if (firstBad) firstBad.focus();
  return !firstBad;
}
const V = {
  req: label => v => v ? '' : `Enter ${label}.`,
  email: v => !v ? 'Enter your email address.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter an email like name@example.com.'),
  phoneOpt: v => !v || /^[+\d][\d\s\-()]{6,}$/.test(v) ? '' : 'Enter a valid phone number.',
  phoneReq: v => !v ? 'Enter a phone number.' : (/^[+\d][\d\s\-()]{6,}$/.test(v) ? '' : 'Enter a valid phone number.'),
  select: label => v => v ? '' : `Choose ${label}.`,
  urlOpt: v => !v || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+\S*$/.test(v) ? '' : 'Enter a valid web address.',
  min: (label, n) => v => v.length >= n ? '' : `${label} needs at least ${n} characters.`
};

let toastTimer;
function toast(msg, iconName='check'){
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); t.innerHTML = icon(iconName,'sm') + `<span>${msg}</span>`;
  document.body.appendChild(t); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 3200);
}

let lastFocus = null;
function openModal({ title, body, onMount, wide=false }){
  closeModal(); lastFocus = document.activeElement;
  const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="modal-backdrop" data-close></div><div class="modal-card${wide?' wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="icon-btn modal-close" data-close aria-label="Close">${icon('x')}</button><h2 id="modal-title">${title}</h2><div class="modal-body" style="margin-top:1rem">${body}</div></div>`;
  document.body.appendChild(m); document.body.style.overflow = 'hidden';
  m.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  m.addEventListener('keydown', trapFocus);
  const first = m.querySelector('input,select,textarea,button:not(.modal-close)') || m.querySelector('button'); first && first.focus();
  onMount && onMount(m);
}
function closeModal(){ if (window._modalCleanup){ try { window._modalCleanup(); } catch(e){} window._modalCleanup = null; } const m = $('#modal'); if (m){ m.remove(); document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); } }
function trapFocus(e){
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); closeSearch(); return; }
  if (e.key !== 'Tab') return;
  const f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', e.currentTarget).filter(x => x.offsetParent !== null);
  if (!f.length) return; const first = f[0], last = f[f.length-1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* API — all forms post JSON to the MA3AK server */
async function apiPost(path, body){
  let r;
  try { r = await fetch(path, { method:'POST', headers:{ 'Content-Type':'application/json' }, credentials:'same-origin', body:JSON.stringify(body) }); }
  catch(e){ throw Object.assign(new Error('You seem to be offline. Check your connection and try again.'), { offline:true }); }
  let j = null; try { j = await r.json(); } catch(e){}
  if (!r.ok || !j || !j.ok) throw Object.assign(new Error((j && j.error) || 'Something went wrong. Please try again.'), { status:r.status, fields:(j && j.fields) || {} });
  return j;
}
/* Spam traps: a hidden field bots fill in, and how long the form was open */
const HONEYPOT = `<div class="hp" aria-hidden="true"><label>Leave this field empty <input type="text" name="company_site" tabindex="-1" autocomplete="off"></label></div>`;
const formMeta = f => ({ company_site:(f.elements.company_site && f.elements.company_site.value) || '', elapsed:Date.now() - (+f.dataset.t || Date.now()) });
const stampForm = f => { f.dataset.t = Date.now(); };
function ConsentField(id){ return `<div class="field consent" data-consent><label class="check"><input type="checkbox" id="${id}" name="${id}" required aria-describedby="${id}-err"> I agree to the <a class="link" href="#/privacy" target="_blank">Privacy Policy</a> and <a class="link" href="#/terms" target="_blank">Terms</a>.</label><span class="err" id="${id}-err" role="alert"></span></div>`; }
function consentOk(f, id){ const el = f.elements[id], ok = el && el.checked; const fld = el && el.closest('.field'); if (fld){ fld.classList.toggle('invalid', !ok); $('#'+id+'-err', f).textContent = ok ? '' : 'Please accept to continue.'; } if (!ok && el) el.focus(); return ok; }
function showServerErrors(f, err, map={}){ Object.entries(err.fields || {}).forEach(([k,msg]) => { const id = map[k] || k; const el = f.elements[id]; if (!el) return; const fld = el.closest('.field'); fld && fld.classList.add('invalid'); const e = $('#'+id+'-err', f); if (e) e.textContent = msg; }); }
function busy(btn, on, label){ if (on){ btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + (label || 'Sending'); } else { btn.disabled = false; btn.innerHTML = btn.dataset.label || btn.innerHTML; } }
function sentPanel({ title, text, refNo, extra='' }){
  return `<div class="form-success" tabindex="-1"><div class="card-ico">${icon('check')}</div><h3>${title}</h3><p>${text}</p>${refNo ? `<p class="small" style="margin-top:.6rem">Reference <b>${esc(refNo)}</b></p>` : ''}
    <div class="actions"><a class="btn btn-ghost" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi MA3AK, about my request ' + (refNo || ''))}" target="_blank" rel="noopener noreferrer">${icon('message','sm')}Message us on WhatsApp</a>${extra}</div></div>`;
}
/* Email hand-off kept as a fallback when the server can't be reached */
function mailto(subject, lines){ return `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`; }
function successPanel({ title, text, href, copyText, extra='' }){
  return `<div class="form-success" tabindex="-1"><div class="card-ico">${icon('check')}</div><h3>${title}</h3><p>${text}</p>
    <div class="actions"><a class="btn btn-primary" href="${href}">${icon('send','sm')}Open email to send</a><button class="btn btn-ghost" type="button" data-copy="${esc(copyText)}">${icon('copy','sm')}Copy message</button>${extra}</div></div>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); toast('Message copied'); } catch(err) { toast('Copy isn’t available here. Use the email button instead.','alert'); }
});

/* "Add to plan" on provider cards is handled in market.js (saved to the customer's plan on the server). */
// Shrink a photo before upload (the server accepts up to 4 MB per image).
async function shrinkImage(dataUrl, max = 1600, q = .82){
  if (!dataUrl) return dataUrl;
  try { const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
    const k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); return cv.toDataURL('image/jpeg', q); } catch(e){ return dataUrl; }
}

/* =========================================================
   HEADER / FOOTER / MOBILE MENU
   ========================================================= */
const NAV = [['#/','Home'],['#/plan','Planner'],['#/events','Events'],['#/customize','Customize'],['#/vendors','Providers'],['#/about','About'],['#/contact','Contact']];
function Header(){
  return `<a class="skip" href="#main">Skip to content</a>
  <header class="site-header" id="site-header"><div class="wrap header-row">
    ${Logo()}
    <nav class="nav" aria-label="Main">${NAV.map(([h,l]) => `<a href="${h}" data-nav="${h}"${h==='#/customize'?' class="nav-cz"':''}>${h==='#/customize'?icon('wand','sm'):''}${l}</a>`).join('')}</nav>
    <div class="header-actions">
      <button class="search-trigger" type="button" data-open-search aria-label="Search vendors, venues, DJs, photographers">${icon('search','sm')}<span class="st-text">Search vendors, venues…</span><kbd>/</kbd></button>
      <a class="for-vendors" href="#/for-vendors">For Vendors</a>
      ${igLink('icon-btn header-ig')}
      <button class="lang-btn" type="button" data-lang-open aria-label="Language"><span data-lang-cur>EN</span></button>
      <a class="acct-btn" id="acct-btn" href="#/login" aria-label="Sign in">${icon('users','sm')}<span class="acct-l">Sign in</span></a>
      <a class="btn btn-primary btn-sm header-cta" href="#/customize">Create your event</a>
      <button class="icon-btn only-mobile" type="button" id="menu-open" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">${icon('menu')}</button>
    </div>
  </div></header>
  <div class="mobile-menu" id="mobile-menu" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="mm-top">${Logo()}<button class="icon-btn" type="button" id="menu-close" aria-label="Close menu">${icon('x')}</button></div>
    <nav aria-label="Mobile">${NAV.map(([h,l]) => `<a href="${h}">${l}</a>`).join('')}<a href="#/for-vendors">For Vendors</a><a href="#/dashboard">My events</a><button type="button" class="link" data-lang-open>Language</button></nav>
    <div class="mm-foot">
      <a class="btn btn-light btn-block" href="#/customize">Create your event</a>
      <div class="mm-contact">${mailLink()}${igLink('icon-btn')}</div>
    </div>
  </div>`;
}
function Footer(){
  const links = [['#/','Home'],['#/plan','Budget planner'],['#/how-it-works','How It Works'],['#/events','Events'],['#/vendors','Providers'],['#/about','About'],['#/partner/join','Become a partner'],['#/contact','Contact']];
  return `<footer class="site-footer"><div class="wrap">
    <div class="f-top">
      <div class="f-brand">${Logo()}<p class="f-tagline">Your event. Your budget. Your plan.</p></div>
      <div><h2>Explore</h2><ul>${links.map(([h,l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>
      <div><h2>Plan</h2><ul><li><a href="#/plan">Event Planner</a></li><li><a href="#/customize">Customize your event</a></li><li><a href="#/dashboard">My Event</a></li><li><a href="#/search">Search vendors</a></li><li><a href="#/for-vendors">Join as a vendor</a></li></ul></div>
      <div><h2>Contact</h2><ul class="f-contact"><li>${icon('mail','sm')}${mailLink()}</li><li>${icon('phone','sm')}${phoneText()}</li><li>${icon('pin','sm')}<span>${CONFIG.country}</span></li></ul>${igLink('ig-btn')}</div>
    </div>
    <div class="f-bottom"><span>© ${CONFIG.year} MA3AK. All rights reserved.</span><span class="f-legal"><a href="#/privacy">Privacy Policy</a><a href="#/terms">Terms</a><button type="button" class="link" data-lang-open>Language</button></span><span>Built for events across Lebanon.</span></div>
  </div></footer>`;
}
function setupHeader(){
  const menu = $('#mobile-menu'), openBtn = $('#menu-open');
  const open = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); openBtn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; setTimeout(() => $('#menu-close').focus(), 50); };
  const close = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); openBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
  openBtn.addEventListener('click', open); $('#menu-close').addEventListener('click', () => { close(); openBtn.focus(); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  menu.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); openBtn.focus(); } else trapFocus(e); });
  const onScroll = () => $('#site-header').classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive:true }); onScroll();
  window._closeMenu = close;
}

/* =========================================================
   GLOBAL SEARCH (command palette / mobile full-screen)
   ========================================================= */
function SearchOverlay(){
  return `<div class="search-overlay" id="search-overlay" aria-hidden="true">
    <div class="so-backdrop" data-close-search></div>
    <div class="so-panel" role="dialog" aria-modal="true" aria-label="Search MA3AK">
      <form class="so-field" id="so-form" role="search">
        ${icon('search')}
        <label class="sr-only" for="so-input">Search vendors, venues, DJs, photographers</label>
        <input id="so-input" type="search" autocomplete="off" placeholder="Search vendors, venues, DJs, photographers…" role="combobox" aria-expanded="true" aria-controls="so-list" aria-autocomplete="list">
        <button class="icon-btn" type="button" data-close-search aria-label="Close search">${icon('x')}</button>
      </form>
      <div class="so-body" id="so-list" role="listbox" aria-label="Suggestions"></div>
      <div class="so-foot"><span>Enter to see all results</span><span>Esc to close</span></div>
    </div></div>`;
}
let soIndex = -1;
function renderSuggestions(q){
  const list = $('#so-list');
  if (!q.trim()){
    const popular = ['venue','catering','dj','photography','decoration','entertainment'];
    list.innerHTML = `<div class="so-group"><h3>Browse categories</h3><div class="so-chips">${popular.map(id => { const c = byId(CATEGORIES,id); return `<a class="chip" href="#/search${qs({category:id})}">${icon(c.icon)}${c.name}</a>`; }).join('')}</div></div>
      <div class="so-group"><h3>Plan by event</h3><div class="so-chips">${['wedding','birthday','graduation','corporate','engagement','beach'].map(id => `<a class="chip" href="#/search${qs({event:id})}">${evName(id)}</a>`).join('')}</div></div>
      <div class="so-group"><h3>Search by area</h3><div class="so-chips">${LOCATIONS.slice(0,6).map(l => `<a class="chip" href="#/search${qs({location:l.id})}">${l.name}</a>`).join('')}</div></div>`;
    soIndex = -1; return;
  }
  const r = searchTaxonomy(q);
  const vend = searchVendorsLocal(q, VENDORS).slice(0,4).map(x => x.v);
  const item = (href, ico, title, sub) => `<a class="so-item" role="option" aria-selected="false" href="${href}"><span class="so-ico">${icon(ico,'sm')}</span><span>${title}<small>${sub}</small></span></a>`;
  let html = `<div class="so-group"><a class="so-item" role="option" aria-selected="false" href="#/search${qs({q})}"><span class="so-ico">${icon('search','sm')}</span><span>Search for “${esc(q)}”<small>All vendors and categories</small></span></a></div>`;
  if (vend.length) html += `<div class="so-group"><h3>Vendors</h3>${vend.map(v => item('#/vendor/'+esc(v.id),'store',esc(v.name),esc(catSingle(v.category))+' in '+esc((v.locations||[]).map(locName).join(', ')))).join('')}</div>`;
  if (r.categories.length) html += `<div class="so-group"><h3>Categories</h3>${r.categories.slice(0,4).map(c => item('#/search'+qs({category:c.id}), c.icon, c.name, c.blurb)).join('')}</div>`;
  if (r.events.length) html += `<div class="so-group"><h3>Event types</h3>${r.events.slice(0,3).map(e => item('#/search'+qs({event:e.id}), e.icon, e.name, 'Vendors for '+e.name.toLowerCase()+'s')).join('')}</div>`;
  if (r.locations.length) html += `<div class="so-group"><h3>Locations</h3>${r.locations.slice(0,3).map(l => item('#/search'+qs({location:l.id}), 'pin', l.name, 'Vendors serving '+l.name)).join('')}</div>`;
  list.innerHTML = html; soIndex = -1;
}
function openSearch(prefill=''){
  const o = $('#search-overlay'); o.classList.add('open'); o.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  const i = $('#so-input'); i.value = prefill; renderSuggestions(prefill); setTimeout(() => i.focus(), 30);
}
function closeSearch(){ const o = $('#search-overlay'); if (!o || !o.classList.contains('open')) return; o.classList.remove('open'); o.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
function setupSearch(){
  const o = $('#search-overlay'), input = $('#so-input');
  document.addEventListener('click', e => { if (e.target.closest('[data-open-search]')) { e.preventDefault(); window._closeMenu && window._closeMenu(); openSearch(); } });
  o.addEventListener('click', e => { if (e.target.closest('[data-close-search]')) closeSearch(); if (e.target.closest('a')) closeSearch(); });
  input.addEventListener('input', () => renderSuggestions(input.value));
  $('#so-form').addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); closeSearch(); location.hash = '#/search' + qs({ q }); });
  o.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeSearch(); return; }
    const items = $$('.so-item', o); if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      e.preventDefault(); soIndex = (soIndex + (e.key==='ArrowDown'?1:-1) + items.length) % items.length;
      items.forEach((it,i) => it.setAttribute('aria-selected', i===soIndex ? 'true':'false')); items[soIndex].scrollIntoView({ block:'nearest' });
    } else if (e.key === 'Enter' && soIndex >= 0 && document.activeElement === input){ e.preventDefault(); items[soIndex].click(); location.hash = items[soIndex].getAttribute('href'); }
  });
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (!typing && (e.key === '/' || ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'))) { e.preventDefault(); openSearch(); }
  });
}
