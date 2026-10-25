'use strict';
/* MA3AK admin dashboard. All user data is rendered with textContent (never innerHTML). */
(() => {
  const app = document.getElementById('app');
  let csrf = null, me = null;
  const state = { type: '', status: '', q: '', page: 1 };
  const TYPES = { '': 'All', event: 'Event designs', contact: 'Messages', vendor: 'Vendors', booking: 'Bookings' };
  const STATUSES = { new: 'New', in_progress: 'In progress', contacted: 'Contacted', booked: 'Booked', closed: 'Closed', spam: 'Spam' };

  // ---------- tiny DOM helper ----------
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    return el;
  }
  const toast = msg => { const t = h('div', { class: 'toast', role: 'status', text: msg }); document.body.append(t); setTimeout(() => t.remove(), 2600); };
  const fmt = iso => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  async function call(method, url, body) {
    const opt = { method, credentials: 'same-origin', headers: {} };
    if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    if (method !== 'GET' && csrf) opt.headers['X-CSRF-Token'] = csrf;
    const r = await fetch(url, opt);
    if (r.status === 401 && !url.endsWith('/login')) { csrf = null; me = null; renderLogin(url.endsWith('/me') ? '' : 'Your session ended. Please sign in again.'); throw new Error('signed out'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw Object.assign(new Error(j.error || 'Request failed'), { fields: j.fields });
    return j;
  }

  // ---------- login ----------
  function renderLogin(msg = '') {
    const err = h('p', { class: 'err', role: 'alert', text: msg });
    const email = h('input', { type: 'email', autocomplete: 'username', required: true, maxlength: 254 });
    const pw = h('input', { type: 'password', autocomplete: 'current-password', required: true, maxlength: 200 });
    const btn = h('button', { class: 'btn', type: 'submit', text: 'Sign in' });
    const form = h('form', { on: { submit: async e => {
      e.preventDefault(); btn.disabled = true; err.textContent = '';
      try { const j = await call('POST', '/api/admin/login', { email: email.value, password: pw.value }); csrf = j.csrf; me = j.email; pw.value = ''; renderApp(); }
      catch (x) { err.textContent = x.message; btn.disabled = false; pw.select(); }
    } } },
      h('div', { class: 'brand' }, h('img', { src: '/fav64.png', alt: '' }), 'MA3AK'),
      h('h1', { text: 'Admin sign in' }),
      h('label', {}, 'Email', email), h('label', {}, 'Password', pw), err, btn);
    app.replaceChildren(h('main', { class: 'login' }, form)); email.focus();
  }

  // ---------- main ----------
  const TABS = [['overview','Overview'],['vendors','Providers'],['bookings','Bookings'],['order','Listing order'],['finance','Commission & payments'],['plans','Provider plans'],['reviews','Reviews & reports'],['requests','Requests'],['events','Plans'],['users','Accounts'],['leads','Leads'],['website','Website'],['categories','Categories'],['catalog','3D catalog'],['kb','Knowledge'],['ai','Assistant chats'],['activity','Activity'],['integrations','Integrations']];
  let tab = 'overview';
  async function renderApp() {
    const top = h('header', { class: 'top' },
      h('div', { class: 'brand' }, h('img', { src: '/fav64.png', alt: '' }), 'MA3AK admin'),
      h('span', { class: 'who', text: me || '' }),
      h('button', { class: 'btn ghost', type: 'button', text: 'Change password', on: { click: openPassword } }),
      h('button', { class: 'btn ghost', type: 'button', text: 'Sign out', on: { click: async () => { try { await call('POST', '/api/admin/logout'); } catch {} csrf = null; renderLogin(); } } }));
    const nav = h('nav', { class: 'tabsbar', 'aria-label': 'Sections' }, ...TABS.map(([k, l]) => h('button', { class: 'tab', type: 'button', 'aria-pressed': String(tab === k), text: l, on: { click: () => { tab = k; renderApp(); } } })));
    const main = h('main', { class: 'wrap', id: 'main' });
    app.replaceChildren(top, nav, main);
    Promise.resolve(({ overview: viewOverview, requests: viewRequests, leads: viewLeads, users: viewUsers, events: viewEvents, ai: viewAI, vendors: viewVendors, bookings: viewBookings, order: viewOrder, finance: viewFinance, plans: viewPlans, reviews: viewReviews, website: viewWebsite, categories: viewCategories, activity: viewActivity, catalog: viewCatalog, kb: viewKB, integrations: viewIntegrations })[tab](main)).catch(x => { if (x.message !== 'signed out') main.append(h('div', { class: 'empty', text: 'This section didn’t load: ' + x.message })); });
  }
  function viewRequests(main) {
    const kpis = h('div', { class: 'kpis', id: 'kpis' });
    const search = h('input', { type: 'search', placeholder: 'Search name, email, phone, reference', value: state.q, 'aria-label': 'Search' });
    let st; search.addEventListener('input', () => { clearTimeout(st); st = setTimeout(() => { state.q = search.value; state.page = 1; loadList(); }, 300); });
    const status = h('select', { 'aria-label': 'Status', on: { change: e => { state.status = e.target.value; state.page = 1; loadList(); } } }, h('option', { value: '', text: 'Any status' }), ...Object.entries(STATUSES).map(([k, v]) => h('option', { value: k, text: v, selected: state.status === k })));
    const tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': 'Type' }, ...Object.entries(TYPES).map(([k, v]) => h('button', { class: 'tab', type: 'button', 'aria-pressed': String(state.type === k), text: v, on: { click: e => { state.type = k; state.page = 1; tabs.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-pressed', String(t === e.target))); loadList(); } } })));
    main.append(kpis, h('div', { class: 'bar' }, tabs, search, status, h('a', { class: 'btn ghost', href: '/api/admin/export.csv', text: 'Export CSV' })), h('div', { id: 'list' }));
    loadStats(); loadList();
  }
  // ---------- charts (DOM + numeric-only SVG; labels always set as text) ----------
  function line(series, label) {
    const max = Math.max(1, ...series.map(p => p.n)), W = 300, H = 80, step = W / Math.max(1, series.length - 1);
    const pts = series.map((p, i) => `${(i * step).toFixed(1)},${(H - p.n / max * (H - 8) - 4).toFixed(1)}`).join(' ');
    const box = h('div', { class: 'card chart' }, h('h3', { text: label }), h('b', { class: 'big', text: series.reduce((s, p) => s + p.n, 0) }), h('small', { text: 'last 30 days' }));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<polygon points="0,${H} ${pts} ${W},${H}" fill="rgba(200,169,107,.18)"/><polyline points="${pts}" fill="none" stroke="#C8A96B" stroke-width="2"/>`;
    box.append(svg); return box;
  }
  function bars(rows, label) {
    const max = Math.max(1, ...rows.map(r => r.n));
    return h('div', { class: 'card chart' }, h('h3', { text: label }), rows.length ? h('div', { class: 'bars' }, ...rows.map(r => h('div', { class: 'brow' }, h('span', { text: r.k || '—' }), h('i', { style: null }, h('em', { 'data-w': Math.round(r.n / max * 100) })), h('b', { text: r.n })))) : h('p', { class: 'muted', text: 'No data yet' }));
  }
  async function viewOverview(main) {
    const [{ report: r }, { overview: o }] = await Promise.all([call('GET', '/api/admin/analytics'), call('GET', '/api/admin/overview')]);
    const t = r.totals, conv = r.funnel[0][1] ? Math.round(r.funnel[3][1] / r.funnel[0][1] * 100) : 0;
    main.append(h('h2', { class: 'sec', text: 'Marketplace' }), h('div', { class: 'kpis' }, ...[['Customers', o.customers], ['New accounts (7 days)', o.newUsers7], ['Partners', o.partners], ['Waiting for verification', o.pending, 'vendors', 'submitted'], ['Live providers (real)', o.published], ['Demo listings', o.demo], ['Requests waiting for a provider', o.openRequests, 'bookings'], ['All bookings', o.bookingsAll, 'bookings'], ['Confirmed or completed', o.confirmed], ['Open reports', o.reportsOpen, 'reviews'], ['Disputed bookings', o.disputed, 'bookings'], ['Plan requests', o.planRequests, 'plans'], ['Saved plans', o.plans], ['New website requests', o.requestsNew, 'requests'], ['Assistant chats', o.aiChats]].map(([l, n, go, f]) => h(go ? 'button' : 'div', { class: 'kpi' + (go ? ' link' : ''), type: go ? 'button' : null, on: go ? { click: () => { tab = go; if (f) vFilter = f; renderApp(); } } : null }, h('b', { text: n }), h('span', { text: l })))),
      h('h2', { class: 'sec', text: '3D designer and requests' }), h('div', { class: 'kpis' }, ...[['Accounts', t.users], ['Events / plans', t.events], ['Event requests', t.quotes], ['All requests', t.requests], ['AI chats', t.aiChats], ['Asked for a human', t.handoffs], ['Share links', t.shares], ['Conversion', conv + '%']].map(([l, n]) => h('div', { class: 'kpi' }, h('b', { text: n }), h('span', { text: l })))),
      h('div', { class: 'grid3' }, line(r.signups, 'New customers'), line(r.eventsCreated, 'Events created'), line(r.requests, 'Requests received')),
      h('div', { class: 'card funnel' }, h('h3', { text: 'Funnel' }), ...r.funnel.map(([l, n], i) => h('div', { class: 'fstep' }, h('span', { text: l }), h('i', {}, h('em', { 'data-w': r.funnel[0][1] ? Math.round(n / r.funnel[0][1] * 100) : 0 })), h('b', { text: n })))),
      h('div', { class: 'grid3' }, bars(r.eventTypes, 'Popular event types'), bars(r.venues, 'Popular venues'), bars(r.stage, 'Stage & music'), bars(r.decor, 'Decorations'), bars(r.lighting, 'Lighting'), bars(r.effects, 'Effects'), bars(r.equipped, 'Most equipped items (30 days)')));
    requestAnimationFrame(() => main.querySelectorAll('[data-w]').forEach(e => { e.style.width = e.dataset.w + '%'; }));
  }
  function table(cols, rows, onRow) {
    if (!rows.length) return h('div', { class: 'empty', text: 'Nothing here yet.' });
    return h('table', { class: 'table' }, h('thead', {}, h('tr', {}, ...cols.map(c => h('th', { text: c[1] })))), h('tbody', {}, ...rows.map(r => h('tr', { tabindex: onRow ? '0' : null, on: onRow ? { click: () => onRow(r), keydown: e => { if (e.key === 'Enter') onRow(r); } } : null }, ...cols.map(([k, , f]) => h('td', {}, f ? f(r) : (r[k] ?? '')))))));
  }
  const drawer = (title, ...kids) => { const d = h('div', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, on: { click: e => { if (e.target === d) d.remove(); } } }, h('div', { class: 'panel' }, h('div', { class: 'row' }, h('h2', { text: title }), h('button', { class: 'btn ghost', type: 'button', text: 'Close', on: { click: () => d.remove() } })), ...kids)); document.body.append(d); return d; };
  async function viewLeads(main) {
    const { rows } = await call('GET', '/api/admin/leads');
    main.append(h('p', { class: 'muted', text: 'Customers ranked by how close they are to booking: progress, event date, guests, budget, shared links, and requests sent.' }),
      table([['score', 'Score', r => h('span', { class: 'badge ' + (r.score >= 60 ? 'booked' : r.score >= 30 ? 'new' : ''), text: r.score })], ['name', 'Customer', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.email }))], ['phone', 'Phone', r => r.phone ? h('a', { href: 'https://wa.me/' + r.phone.replace(/\D/g, ''), target: '_blank', rel: 'noopener noreferrer', text: r.phone }) : '—'], ['event_type', 'Event'], ['event_date', 'Date'], ['guest_count', 'Guests'], ['progress', 'Progress', r => (r.progress || 0) + '%'], ['requests', 'Requests']], rows));
  }
  async function viewUsers(main) {
    const { rows } = await call('GET', '/api/admin/users');
    main.append(table([['name', 'Name', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.email }))], ['role', 'Type', r => r.role === 'partner' ? h('span', { class: 'badge new', text: 'Partner' }) : 'Customer'], ['plan', 'Plan'], ['events', 'Events'], ['requests', 'Requests'], ['email_verified', 'Verified', r => r.email_verified ? 'Yes' : 'No'], ['created_at', 'Joined', r => fmt(r.created_at)]], rows, r => {
      const plan = h('select', {}, ...['free', 'premium', 'business'].map(p => h('option', { value: p, text: p, selected: r.plan === p })));
      const d = drawer(r.name, h('p', { class: 'meta', text: `${r.email}${r.phone ? ' · ' + r.phone : ''} · joined ${fmt(r.created_at)}${r.marketing ? ' · accepts marketing' : ''}` }),
        h('div', { class: 'card' }, h('label', {}, 'Plan', plan), h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save plan', on: { click: async () => { await call('PATCH', `/api/admin/users/${r.id}`, { plan: plan.value }); toast('Plan updated'); } } }),
          h('button', { class: 'btn danger', type: 'button', text: 'Delete customer', on: { click: async () => { if (!confirm(`Delete ${r.email} and all their events permanently?`)) return; await call('DELETE', `/api/admin/users/${r.id}`); toast('Customer deleted'); d.remove(); renderApp(); } } }))));
    }));
  }
  async function viewEvents(main) {
    const { rows } = await call('GET', '/api/admin/events');
    main.append(h('p', { class: 'muted', text: 'Customers’ saved plans and 3D designs, for support. Open one to see its services and totals. Plans are private: don’t share their contents.' }), table([['name', 'Plan', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.owner + ' · ' + r.email }))], ['event_type', 'Type'], ['event_date', 'Date'], ['location', 'Area'], ['guest_count', 'Guests'], ['budget', 'Budget', r => r.budget ? r.budget.toLocaleString('en-US') + ' ' + (r.currency || 'USD') : '—'], ['services', 'Services'], ['status', 'Status', r => h('span', { class: 'badge ' + r.status, text: r.status })]], rows, async r => {
      const d = await call('GET', `/api/admin/events/${r.id}`);
      const rng = (lo, hi, c) => fm(lo, c) + (hi > lo ? '–' + fm(hi, c) : '');
      const planText = d.services.length ? d.services.map(s => `${s.category}: ${s.label}${s.vendorName ? ' (' + s.vendorName + ')' : ''} — ${s.agreed ? fm(s.agreed.totalMinor, s.agreed.currency) + ' agreed (' + s.agreed.ref + ')' : s.lineLowMinor == null ? 'quote needed' : rng(s.lineLowMinor, s.lineHighMinor, s.currency)}`).join('\n') + `\n\nTotal: ${d.totals.byCurrency.map(t => rng(t.totalLow, t.totalHigh, t.currency)).join(' + ') || '—'}${d.totals.isEstimate ? ' (estimate)' : ''}${d.totals.budgetMinor ? ' · budget ' + fm(d.totals.budgetMinor, d.totals.currency) : ''}` : 'No services added yet';
      const lines = Object.entries(d.state).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
      drawer(d.event.name, h('p', { class: 'meta', text: `${d.event.owner} · ${d.event.email}${d.event.phone ? ' · ' + d.event.phone : ''}` }), h('div', { class: 'card' }, h('h3', { text: 'Budget plan' }), h('pre', { class: 'summary', text: planText }), d.event.requirements ? h('p', { class: 'muted', text: 'Requirements: ' + d.event.requirements }) : ''), h('div', { class: 'card' }, h('h3', { text: '3D design selections' }), h('pre', { class: 'summary', text: lines || 'Nothing selected yet' })), h('div', { class: 'card' }, h('h3', { text: 'Recent versions' }), h('pre', { class: 'summary', text: d.versions.map(x => fmt(x.created_at) + ' — ' + x.label).join('\n') })));
    }));
  }
  async function viewAI(main) {
    const { rows } = await call('GET', '/api/admin/ai');
    main.append(table([['first', 'First message', r => h('div', {}, h('b', { text: (r.first || '').slice(0, 80) }), h('div', { class: 'pv', text: (r.name || 'Visitor') + (r.event ? ' · ' + r.event : '') }))], ['messages', 'Messages'], ['handoff', 'Wants a human', r => r.handoff ? h('span', { class: 'badge new', text: 'Yes' }) : 'No'], ['updated_at', 'Last message', r => fmt(r.updated_at)]], rows, async r => {
      const { messages } = await call('GET', `/api/admin/ai/${r.id}`);
      drawer('Conversation', ...messages.map(m => h('div', { class: 'card ' + (m.role === 'user' ? 'msg-u' : 'msg-a') }, h('small', { class: 'muted', text: (m.role === 'user' ? 'Customer' : 'Assistant') + ' · ' + fmt(m.created_at) }), h('p', { text: m.content }), m.actions ? h('pre', { class: 'summary', text: 'Suggested: ' + m.actions }) : '')));
    }));
  }
  // ---------- money (integer minor units + currency; never mixed) ----------
  const CURS = { USD: ['$', 2], EUR: ['€', 2], LBP: ['LBP ', 0] };
  const fm = (minor, cur = 'USD') => { if (minor == null) return '—'; const [s, d] = CURS[cur] || CURS.USD, neg = minor < 0, a = Math.abs(minor), w = Math.floor(a / 10 ** d), f = a % 10 ** d; return (neg ? '-' : '') + s + w.toLocaleString('en-US') + (d && f ? '.' + String(f).padStart(d, '0') : ''); };
  const toIn = (minor, cur = 'USD') => minor == null ? '' : (CURS[cur] || CURS.USD)[1] ? (minor / 100).toFixed(2).replace(/\.00$/, '') : String(minor);
  const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2));
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const errText = x => x.message + (x.fields ? ' ' + Object.entries(x.fields).map(([k, m]) => `${k}: ${m}`).join(', ') : '');
  const closeAll = () => document.querySelectorAll('.drawer').forEach(x => x.remove());

  // ---------- providers: verification, visibility, packages, photos, documents ----------
  const VSTATUS = { all: 'All', submitted: 'Waiting for verification', under_review: 'Under review', needs_info: 'More info requested', approved: 'Verified', draft: 'Drafts', rejected: 'Rejected', suspended: 'Suspended', public: 'Live', demo: 'Demo listings' };
  const VS_LABEL = { draft: 'Draft', submitted: 'Submitted', under_review: 'Under review', needs_info: 'More info requested', approved: 'Verified', rejected: 'Rejected', suspended: 'Suspended' };
  const UNITS = { flat: 'Fixed price', per_guest: 'Per guest', per_hour: 'Per hour', per_item: 'Per item' };
  const PTYPES = { fixed: 'Fixed price', starting: 'Starting price', quote: 'Custom quote' };
  const money = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US');
  const priceTxt = p => p.priceType === 'quote' || p.priceMinor == null ? 'Custom quote' : (p.priceType === 'starting' ? 'From ' : '') + fm(p.priceMinor, p.currency) + (p.priceMaxMinor ? '–' + fm(p.priceMaxMinor, p.currency) : '') + ({ per_guest: ' / guest', per_hour: ' / hour', per_item: ' each' }[p.unit] || '');
  const vBadge = r => r.public ? h('span', { class: 'badge booked', text: 'Live' }) : h('span', { class: 'badge ' + (['submitted', 'under_review'].includes(r.status) ? 'new' : ['rejected', 'suspended'].includes(r.status) ? 'spam' : ''), text: r.status === 'approved' ? 'Verified · unpublished' : (VS_LABEL[r.status] || r.status) });
  const resizeFile = file => new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = rej; fr.onload = () => { const img = new Image(); img.onerror = () => rej(new Error('That photo couldn’t be opened.')); img.onload = () => { const k = Math.min(1, 1600 / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/jpeg', .85)); }; img.src = fr.result; }; fr.readAsDataURL(file); });
  let vFilter = 'all', vQuery = '';
  async function viewVendors(main) {
    const qs = new URLSearchParams(); if (vFilter !== 'all') qs.set('status', vFilter); if (vQuery) qs.set('q', vQuery);
    const data = await call('GET', '/api/admin/vendors?' + qs);
    const search = h('input', { type: 'search', placeholder: 'Search name, id or partner email', value: vQuery, 'aria-label': 'Search providers' }); let st;
    search.addEventListener('input', () => { clearTimeout(st); st = setTimeout(() => { vQuery = search.value; renderApp(); }, 350); });
    main.append(h('div', { class: 'bar' }, h('div', { class: 'tabs', role: 'group', 'aria-label': 'Filter' }, ...Object.entries(VSTATUS).map(([k, l]) => h('button', { class: 'tab', type: 'button', 'aria-pressed': String(vFilter === k), text: l, on: { click: () => { vFilter = k; renderApp(); } } }))), search,
        h('button', { class: 'btn', type: 'button', text: 'Add provider', on: { click: () => editVendor(null, data) } })),
      h('p', { class: 'muted', text: 'A listing is public only when it is verified (approved), published, and the provider’s agreement is recorded. Only an administrator can approve, reject or suspend. Automatic flags are hints for the reviewer, never proof. A paid plan or a sponsored placement never verifies a listing.' }),
      table([['name', 'Provider', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.owner ? `${r.owner.email} · ${r.id}` : `Managed by MA3AK · ${r.id}` }))], ['category', 'Category'], ['status', 'Status', vBadge],
        ['flags', 'Flags', r => h('div', { class: 'row' }, r.isDemo ? h('span', { class: 'badge', text: 'Demo' }) : '', r.plan !== 'free' ? h('span', { class: 'badge new', text: 'Pro' }) : '', r.planRequests ? h('span', { class: 'badge new', text: 'Plan requested' }) : '', r.featured ? h('span', { class: 'badge new', text: 'Featured' }) : '', r.sponsored ? h('span', { class: 'badge', text: 'Sponsored' }) : '', r.changedSinceApproval ? h('span', { class: 'badge new', text: 'Edited since approval' }) : '', !r.consent ? h('span', { class: 'badge spam', text: 'No agreement' }) : '', r.riskFlags.length ? h('span', { class: 'badge spam', text: `${r.riskFlags.length} automatic flag${r.riskFlags.length > 1 ? 's' : ''}` }) : '')],
        ['documents', 'Docs'], ['packages', 'Packages'], ['photos', 'Photos'], ['openRequests', 'Open requests'], ['updatedAt', 'Updated', r => fmt(r.updatedAt)]], data.vendors, r => openVendor(r.id, data)));
  }
  async function openVendor(id, meta) {
    const { vendor: v, owner, documents, verification, plan } = await call('GET', `/api/admin/vendors/${encodeURIComponent(id)}`);
    const reopen = () => { closeAll(); renderApp(); openVendor(v.id, meta); };
    const note = h('textarea', { rows: 2, placeholder: 'Note for the provider (shown on their partner page)', maxlength: 1000 }); note.value = v.reviewNote || '';
    const act = (action, label, cls = 'btn ghost', opts = {}) => h('button', { class: cls, type: 'button', text: label, on: { click: async () => { if (opts.confirm && !confirm(opts.confirm)) return; try { await call('POST', `/api/admin/vendors/${encodeURIComponent(v.id)}/review`, { action, note: note.value, ...(opts.body ? opts.body() : {}) }); toast('Saved'); reopen(); } catch (x) { toast(errText(x)); } } } });
    const checks = ['identity', 'business', 'authority', 'listing'].map(k => { const c = h('input', { type: 'checkbox' }); c.dataset.k = k; return c; });
    const checkLabels = { identity: 'Identity of the owner or manager checked against an ID document', business: 'Business registration (or equivalent) checked', authority: 'Ownership of the venue, or authorisation to list the business, checked', listing: 'Listing, packages and prices describe the real business' };
    const until = h('input', { type: 'date' });
    const isLive = v.status === 'approved' && v.active && v.consentAt, st = v.status;
    const docCards = documents.map(dd => h('div', { class: 'card doc' }, h('div', { class: 'row' }, h('b', { text: meta.docKinds?.[dd.kind] || dd.kindLabel || dd.kind }), h('span', { class: 'badge ' + (dd.status === 'accepted' ? 'booked' : dd.status === 'rejected' ? 'spam' : 'new'), text: dd.status })),
      h('p', { class: 'pv', text: `${dd.name || dd.mime} · ${Math.round(dd.size / 1024)} KB · uploaded ${fmt(dd.uploadedAt)}${dd.note ? ' · ' + dd.note : ''}` }),
      h('div', { class: 'row' }, h('a', { class: 'btn ghost', href: `/api/admin/vendors/${encodeURIComponent(v.id)}/documents/${dd.id}`, text: 'Open (logged)' }),
        h('button', { class: 'btn ghost', type: 'button', text: 'Accept', on: { click: async () => { await call('POST', `/api/admin/vendors/${encodeURIComponent(v.id)}/documents/${dd.id}`, { status: 'accepted' }); toast('Document accepted'); reopen(); } } }),
        h('button', { class: 'btn ghost', type: 'button', text: 'Not accepted', on: { click: async () => { const n = prompt('Reason (shown to the provider)') || ''; await call('POST', `/api/admin/vendors/${encodeURIComponent(v.id)}/documents/${dd.id}`, { status: 'rejected', note: n }); toast('Saved'); reopen(); } } }),
        h('button', { class: 'btn danger', type: 'button', text: 'Delete', on: { click: async () => { if (!confirm('Delete this document permanently?')) return; await call('DELETE', `/api/admin/vendors/${encodeURIComponent(v.id)}/documents/${dd.id}`); toast('Deleted'); reopen(); } } }))));
    const pkList = h('div', { class: 'grid3' }, ...v.packages.map(p => h('div', { class: 'card' }, h('b', { text: p.name }), h('p', { class: 'pv', text: `${PTYPES[p.priceType] || ''} · ${priceTxt(p)}${p.active ? '' : ' · hidden'}` }), p.description ? h('p', { class: 'muted', text: p.description }) : '',
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', text: 'Edit', on: { click: () => editPackage(v, p, meta) } }), h('button', { class: 'btn danger', type: 'button', text: 'Delete', on: { click: async () => { if (!confirm('Delete this package? Bookings and plans keep their saved price.')) return; await call('DELETE', `/api/admin/vendors/${encodeURIComponent(v.id)}/packages/${p.id}`); toast('Deleted'); reopen(); } } })))));
    const photoIn = h('input', { type: 'file', accept: 'image/jpeg,image/png', multiple: true, on: { change: async e => { for (const f of [...e.target.files].slice(0, 10)) { try { await call('POST', `/api/admin/vendors/${encodeURIComponent(v.id)}/photos`, { image: await resizeFile(f), alt: '' }); } catch (x) { toast(x.message); break; } } toast('Photos uploaded'); reopen(); } } });
    const photos = h('div', { class: 'imgs' }, ...v.photos.map(p => h('figure', {}, h('img', { src: p.src, alt: p.alt || '' }), h('figcaption', {}, h('button', { class: 'btn danger', type: 'button', text: 'Delete photo', on: { click: async () => { if (!confirm('Delete this photo?')) return; await call('DELETE', `/api/admin/vendors/${encodeURIComponent(v.id)}/photos/${p.id}`); toast('Deleted'); reopen(); } } })))));
    const subEnd = h('input', { type: 'date' }), subNote = h('input', { placeholder: 'Note (e.g. paid by bank transfer, ref 1234)' });
    const sub = action => h('button', { class: action === 'cancel' ? 'btn danger' : 'btn ghost', type: 'button', text: { activate: 'Activate Pro (paid)', comp: 'Give Pro free', cancel: 'End paid plan' }[action], on: { click: async () => { try { await call('POST', `/api/admin/vendors/${encodeURIComponent(v.id)}/subscription`, { action, planId: 'pro', periodEnd: subEnd.value, note: subNote.value }); toast('Plan updated'); reopen(); } catch (x) { toast(errText(x)); } } } });
    const blockDay = h('input', { type: 'date' });
    drawer(v.name,
      h('p', { class: 'meta', text: `${v.category} · ${v.locations.join(', ') || 'no areas'} · created ${fmt(v.createdAt)}${v.submittedAt ? ' · submitted ' + fmt(v.submittedAt) : ''}${v.verifiedAt ? ' · verified ' + fmt(v.verifiedAt) : ''}` }),
      h('div', { class: 'card' }, h('h3', { text: 'Verification' }), h('div', { class: 'row' }, vBadge({ public: isLive, status: st }), v.isDemo ? h('span', { class: 'badge', text: 'Demo listing' }) : '', v.verified ? h('span', { class: 'badge booked', text: 'Verified badge' }) : '', v.sponsored ? h('span', { class: 'badge', text: 'Sponsored until ' + (v.sponsoredUntil || 'no end date') }) : '', v.changedSinceApproval ? h('span', { class: 'badge new', text: 'Edited by the provider since approval' }) : '', v.consentAt ? h('span', { class: 'pv', text: 'Agreement recorded ' + fmt(v.consentAt) }) : h('span', { class: 'badge spam', text: 'No agreement recorded' })),
        verification.missing.length ? h('div', {}, h('p', { class: 'muted', text: 'Not complete yet:' }), h('ul', {}, ...verification.missing.map(m => h('li', { text: m.label })))) : h('p', { class: 'muted', text: 'Everything required has been provided.' }),
        verification.flags.length ? h('div', { class: 'card warn' }, h('b', { text: 'Automatic flags (hints only — check them yourself)' }), h('ul', {}, ...verification.flags.map(f => h('li', { text: f })))) : '',
        v.authorizationStatement ? h('p', { class: 'pv', text: v.authorizationStatement }) : '',
        h('div', { class: 'card form2' }, h('b', { text: 'Business details (private)' }), h('p', { class: 'pv', text: [v.legalName && 'Legal name: ' + v.legalName, v.businessType && 'Type: ' + v.businessType, v.registrationNumber && 'Registration: ' + v.registrationNumber, v.address && 'Address: ' + v.address].filter(Boolean).join(' · ') || 'Not provided' })),
        h('h3', { text: `Documents (${documents.length})` }), documents.length ? h('div', { class: 'grid3' }, ...docCards) : h('p', { class: 'muted', text: 'No documents uploaded.' }),
        h('label', {}, 'Note to the provider', note),
        h('div', { class: 'card form2' }, h('b', { text: 'Checklist before approving' }), ...checks.map(c => h('label', { class: 'chk' }, c, checkLabels[c.dataset.k]))),
        h('div', { class: 'row' }, ['submitted', 'needs_info'].includes(st) ? act('start_review', 'Start review') : '', ['submitted', 'under_review'].includes(st) ? act('request_info', 'Ask for more information') : '',
          st !== 'approved' && !v.isDemo ? act('approve', 'Approve and verify', 'btn', { body: () => ({ checks: Object.fromEntries(checks.map(c => [c.dataset.k, c.checked])) }) }) : '',
          v.isDemo && st !== 'approved' ? act('approve', 'Approve demo listing', 'btn', { body: () => ({ checks: Object.fromEntries(checks.map(c => [c.dataset.k, c.checked])) }) }) : '',
          !['rejected', 'suspended'].includes(st) ? act('reject', 'Reject', 'btn danger', { confirm: 'Reject this listing? It will be hidden.' }) : '',
          st === 'approved' ? act('suspend', 'Suspend', 'btn danger', { confirm: 'Suspend this provider? Their listing is hidden immediately.' }) : '', st === 'suspended' ? act('reinstate', 'Reinstate') : '',
          v.verified && !v.isDemo ? act('unverify', 'Remove verified badge') : '')),
      h('div', { class: 'card' }, h('h3', { text: 'Visibility and promotion' }), h('p', { class: 'muted', text: 'Featured and sponsored placements change where a listing appears. They never verify it. Sponsored listings are labelled “Sponsored” on the website.' }),
        h('div', { class: 'row' }, st === 'approved' && v.active ? act('unpublish', 'Unpublish') : '', st === 'approved' && !v.active ? act('publish', 'Publish') : '', v.featured ? act('unfeature', 'Remove from homepage') : act('feature', 'Feature on homepage'),
          v.sponsored ? act('unsponsor', 'End sponsored placement') : h('span', { class: 'row' }, h('label', {}, 'Sponsored until', until), act('sponsor', 'Mark as sponsored', 'btn ghost', { body: () => ({ until: until.value }) })))),
      h('div', { class: 'card' }, h('h3', { text: `Plan: ${plan.name}${plan.periodEnd ? ' until ' + plan.periodEnd : ''}` }), h('p', { class: 'muted', text: 'Online billing isn’t connected: activate a paid plan only after you have received payment, and record how it was paid.' }),
        h('div', { class: 'row' }, h('label', {}, 'Runs until', subEnd), subNote), h('div', { class: 'row' }, sub('activate'), sub('comp'), plan.planId !== 'free' ? sub('cancel') : '')),
      owner ? h('div', { class: 'card' }, h('h3', { text: 'Partner account' }), h('p', { class: 'meta', text: `${owner.name} · ${owner.email}${owner.email_verified ? ' (email confirmed)' : ' (email not confirmed)'}${owner.phone ? ' · ' + owner.phone : ''} · joined ${fmt(owner.created_at)}` })) : h('p', { class: 'muted', text: 'Managed by MA3AK (no partner account): you answer its booking requests in Bookings.' }),
      !owner ? h('div', { class: 'card' }, h('h3', { text: 'Unavailable dates' }), h('p', { class: 'pv', text: (v.unavailableDates || []).join(', ') || 'None marked' }), h('div', { class: 'row' }, blockDay,
        h('button', { class: 'btn ghost', type: 'button', text: 'Mark unavailable', on: { click: async () => { try { await call('PUT', `/api/admin/vendors/${encodeURIComponent(v.id)}/availability`, { days: [blockDay.value], status: 'blocked' }); toast('Saved'); reopen(); } catch (x) { toast(x.message); } } } }),
        h('button', { class: 'btn ghost', type: 'button', text: 'Mark available', on: { click: async () => { try { await call('PUT', `/api/admin/vendors/${encodeURIComponent(v.id)}/availability`, { days: [blockDay.value], status: 'free' }); toast('Saved'); reopen(); } catch (x) { toast(x.message); } } } }))) : '',
      h('div', { class: 'card' }, h('div', { class: 'row' }, h('h3', { text: `Packages (${v.packages.length})` }), h('button', { class: 'btn', type: 'button', text: 'Add package', on: { click: () => editPackage(v, null, meta) } })), v.packages.length ? pkList : h('p', { class: 'muted', text: 'No packages yet.' })),
      h('div', { class: 'card' }, h('h3', { text: `Photos (${v.photos.length})` }), h('label', {}, 'Upload photos (JPG/PNG; resized, location data removed)', photoIn), photos),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', text: 'Edit profile', on: { click: () => { closeAll(); editVendor(v, meta); } } }), isLive ? h('a', { class: 'btn ghost', href: `/#/vendor/${encodeURIComponent(v.id)}`, target: '_blank', rel: 'noopener', text: 'View public profile' }) : '',
        h('button', { class: 'btn danger', type: 'button', text: 'Delete provider', on: { click: async () => { if (!confirm(`Delete ${v.name}, its packages, photos and documents permanently? Past bookings keep the provider’s name.`)) return; try { await call('DELETE', `/api/admin/vendors/${encodeURIComponent(v.id)}`); toast('Provider deleted'); closeAll(); renderApp(); } catch (x) { toast(x.message); } } } })));
  }
  function editVendor(it, meta) {
    const f = {}; const inp = (k, label, val, type = 'text', extra = {}) => { f[k] = h('input', { type, value: val ?? '', ...extra }); return h('label', {}, label, f[k]); };
    const area = (k, label, val, rows = 3) => { f[k] = h('textarea', { rows }); f[k].value = val ?? ''; return h('label', {}, label, f[k]); };
    const checks = (k, label, opts, sel) => { f[k] = opts.map(o => { const c = h('input', { type: 'checkbox', value: o }); c.checked = (sel || []).includes(o); return c; }); return h('fieldset', { class: 'chkset' }, h('legend', { text: label }), ...f[k].map(c => h('label', { class: 'chk' }, c, c.value))); };
    const flag = (k, label, val) => { f[k] = h('input', { type: 'checkbox' }); f[k].checked = !!val; return h('label', { class: 'chk' }, f[k], label); };
    f.category = h('select', {}, ...meta.categories.map(c => h('option', { value: c, text: c, selected: it?.category === c })));
    const err = h('p', { class: 'err', role: 'alert' });
    const d = drawer(it ? 'Edit ' + it.name : 'New provider', h('div', { class: 'card form2' },
      inp('id', 'ID (used in the web address, e.g. cedar-sound)', it?.id, 'text', it ? { readonly: true } : {}), inp('name', 'Business name', it?.name), h('label', {}, 'Category', f.category),
      checks('locations', 'Areas they serve', meta.areas, it?.locations), checks('eventTypes', 'Events they do', meta.eventTypes, it?.eventTypes),
      inp('services', 'Features (separate with |, e.g. Indoor|Setup included)', (it?.services || []).join('|')), area('description', 'Short description (shown on cards)', it?.description, 2), area('about', 'About (shown on their profile)', it?.about, 5),
      inp('availabilityNote', 'Availability note (never a promise of a date)', it?.availabilityNote),
      h('div', { class: 'row' }, inp('capacityMin', 'Min guests', it?.capacityMin, 'number'), inp('capacityMax', 'Max guests', it?.capacityMax, 'number')),
      h('div', { class: 'row' }, inp('phone', 'Phone', it?.phone, 'tel'), inp('whatsapp', 'WhatsApp', it?.whatsapp, 'tel')), h('div', { class: 'row' }, inp('instagram', 'Instagram (without @)', it?.instagram), inp('website', 'Website', it?.website), inp('email', 'Email', it?.email, 'email')),
      h('div', { class: 'row' }, inp('legalName', 'Legal name (private)', it?.legalName), inp('businessType', 'Type of business (private)', it?.businessType), inp('registrationNumber', 'Registration number (private)', it?.registrationNumber)), inp('address', 'Business address (private)', it?.address),
      h('div', { class: 'card consent-box' }, flag('consent', 'The provider agreed to be listed on MA3AK', it ? it.consentAt : false), inp('consentNote', 'How they agreed (e.g. signed form, email on 4 Oct)', it?.consentNote)),
      it ? '' : flag('active', 'Publish now (requires the agreement above). Not verified until you approve it with the checklist.', false), flag('isDemo', 'Demo listing (sample, not a real business; can’t be booked or verified)', it?.isDemo), err,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save provider', on: { click: async () => { err.textContent = '';
        const body = { name: f.name.value, category: f.category.value, locations: f.locations.filter(c => c.checked).map(c => c.value), eventTypes: f.eventTypes.filter(c => c.checked).map(c => c.value), services: f.services.value, description: f.description.value, about: f.about.value, availabilityNote: f.availabilityNote.value,
          capacityMin: f.capacityMin.value, capacityMax: f.capacityMax.value, phone: f.phone.value, whatsapp: f.whatsapp.value, instagram: f.instagram.value, website: f.website.value, email: f.email.value, legalName: f.legalName.value, businessType: f.businessType.value, registrationNumber: f.registrationNumber.value, address: f.address.value,
          consent: f.consent.checked, consentNote: f.consentNote.value, active: it ? it.active : f.active.checked, isDemo: f.isDemo.checked };
        try { await call('PUT', `/api/admin/vendors/${encodeURIComponent(f.id.value.trim())}`, body); toast('Provider saved'); d.remove(); renderApp(); openVendor(f.id.value.trim(), meta); }
        catch (x) { err.textContent = errText(x); } } } }))));
  }
  function editPackage(v, p, meta) {
    const name = h('input', { value: p?.name || '' }), unit = h('select', {}, ...Object.entries(UNITS).map(([k, l]) => h('option', { value: k, text: l, selected: (p?.unit || 'flat') === k })));
    const ptype = h('select', {}, ...Object.entries(PTYPES).map(([k, l]) => h('option', { value: k, text: l, selected: (p?.priceType || 'starting') === k }))), cur = h('select', {}, ...Object.keys(CURS).map(c => h('option', { value: c, text: c, selected: (p?.currency || 'USD') === c })));
    const price = h('input', { inputmode: 'decimal', value: p ? toIn(p.priceMinor, p.currency) : '' }), max = h('input', { inputmode: 'decimal', value: p ? toIn(p.priceMaxMinor, p.currency) : '' }), minQty = h('input', { type: 'number', min: 1, value: p?.minQty ?? '' });
    const desc = h('textarea', { rows: 3 }); desc.value = p?.description || ''; const inc = h('textarea', { rows: 4 }); inc.value = (p?.includes || []).join('\n'); const exc = h('textarea', { rows: 3 }); exc.value = (p?.exclusions || []).join('\n'); const cond = h('textarea', { rows: 2 }); cond.value = p?.conditions || '';
    const active = h('input', { type: 'checkbox' }); active.checked = p ? p.active : true; const err = h('p', { class: 'err', role: 'alert' });
    const d = drawer(p ? 'Edit package' : 'New package for ' + v.name, h('div', { class: 'card form2' }, h('label', {}, 'Name', name), h('div', { class: 'row' }, h('label', {}, 'Price type', ptype), h('label', {}, 'Currency', cur), h('label', {}, 'Priced', unit)),
      h('div', { class: 'row' }, h('label', {}, 'Price (empty for custom quote)', price), h('label', {}, 'Up to (starting prices only)', max), h('label', {}, 'Minimum quantity', minQty)),
      h('label', {}, 'Description', desc), h('label', {}, 'Included (one per line)', inc), h('label', {}, 'Not included (one per line)', exc), h('label', {}, 'Conditions (required for fixed prices)', cond), h('label', { class: 'chk' }, active, 'Show this package'), err,
      h('button', { class: 'btn', type: 'button', text: 'Save package', on: { click: async () => { try { await call('PUT', `/api/admin/vendors/${encodeURIComponent(v.id)}/packages/${p ? p.id : 'new'}`, { name: name.value, priceType: ptype.value, currency: cur.value, unit: unit.value, price: price.value.replace(/,/g, ''), priceMax: max.value.replace(/,/g, ''), minQty: minQty.value, description: desc.value, includes: lines(inc.value), exclusions: lines(exc.value), conditions: cond.value, details: p?.details || {}, active: active.checked }); toast('Package saved'); closeAll(); openVendor(v.id, meta || await call('GET', '/api/admin/vendors')); } catch (x) { err.textContent = errText(x); } } } })));
  }

  // ---------- listing order (drag and drop, with buttons for keyboard users) ----------
  let orderCat = '';
  function sortable(items, render) {
    const list = h('ol', { class: 'sortable' });
    const paint = () => { list.replaceChildren(...items.map((it, i) => { const li = h('li', { draggable: 'true', 'data-i': i }, h('span', { class: 'grip', 'aria-hidden': 'true', text: '⋮⋮' }), h('span', { class: 'pos', text: i + 1 }), render(it),
      h('span', { class: 'row' }, h('button', { class: 'btn ghost sm', type: 'button', text: '↑', 'aria-label': 'Move up', disabled: i === 0, on: { click: () => { [items[i - 1], items[i]] = [items[i], items[i - 1]]; paint(); } } }), h('button', { class: 'btn ghost sm', type: 'button', text: '↓', 'aria-label': 'Move down', disabled: i === items.length - 1, on: { click: () => { [items[i + 1], items[i]] = [items[i], items[i + 1]]; paint(); } } })));
      li.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', String(i)); li.classList.add('dragging'); });
      li.addEventListener('dragend', () => li.classList.remove('dragging'));
      li.addEventListener('dragover', e => { e.preventDefault(); li.classList.add('over'); });
      li.addEventListener('dragleave', () => li.classList.remove('over'));
      li.addEventListener('drop', e => { e.preventDefault(); const from = +e.dataTransfer.getData('text/plain'), to = i; if (from === to || Number.isNaN(from)) return; const [m] = items.splice(from, 1); items.splice(to, 0, m); paint(); });
      return li; })); };
    paint(); list.refresh = paint; return list;
  }
  async function viewOrder(main) {
    const meta = await call('GET', '/api/admin/order' + (orderCat ? `?category=${encodeURIComponent(orderCat)}` : ''));
    const cats = meta.categories, catSel = h('select', { 'aria-label': 'Category', on: { change: e => { orderCat = e.target.value; renderApp(); } } }, h('option', { value: '', text: 'Choose a category' }), ...cats.map(c => h('option', { value: c.id, text: c.name, selected: orderCat === c.id })));
    const sf = h('input', { type: 'checkbox' }); sf.checked = !!meta.sort.sponsoredFirst;
    const auto = h('select', {}, ...[['quality', 'Most complete and trusted first'], ['rating', 'Best rated first'], ['newest', 'Newest first'], ['name', 'Alphabetical']].map(([k, l]) => h('option', { value: k, text: l, selected: meta.sort.auto === k })));
    const listings = orderCat ? meta.listings.slice() : [];
    const tag = (on, t, c = '') => on ? h('span', { class: 'badge ' + c, text: t }) : '';
    const catList = sortable(listings, x => h('span', { class: 'grow' }, h('b', { text: x.name }), ' ', tag(x.rank != null, 'Manual #' + x.rank, 'new'), tag(x.sponsored, 'Sponsored'), tag(x.featured, 'Featured', 'new'), tag(x.verified, 'Verified', 'booked'), tag(x.isDemo, 'Demo'), h('span', { class: 'pv', text: ` quality ${x.quality}` })));
    const home = meta.home.slice(), live = meta.listings;
    const homeList = sortable(home, x => h('span', { class: 'grow' }, h('b', { text: x.name }), h('span', { class: 'pv', text: ' ' + x.category }), h('button', { class: 'btn ghost sm', type: 'button', text: 'Remove', on: { click: () => { home.splice(home.indexOf(x), 1); homeList.refresh(); } } })));
    const allLive = await call('GET', '/api/admin/order'); const addSel = h('select', {}, h('option', { value: '', text: 'Add a live provider…' }), ...allLive.listings.map(x => h('option', { value: x.id, text: `${x.name} (${x.category})` })));
    const catOrder = cats.slice(), catOrderList = sortable(catOrder, c => h('span', { class: 'grow' }, h('b', { text: c.name }), c.active ? '' : h('span', { class: 'badge', text: 'Hidden' })));
    main.append(h('p', { class: 'muted', text: 'Public order: real providers always come before demo listings; then (optionally) sponsored listings; then your manual order; then the automatic rule below. Changes are saved to the database and apply immediately.' }),
      h('div', { class: 'card form2' }, h('h3', { text: 'Default order' }), h('label', { class: 'chk' }, sf, 'Show sponsored listings first (they are always labelled “Sponsored”)'), h('label', {}, 'After the manual order, sort by', auto),
        h('button', { class: 'btn', type: 'button', text: 'Save default order', on: { click: async () => { try { await call('PUT', '/api/admin/settings/listingSort', { value: { sponsoredFirst: sf.checked, auto: auto.value } }); toast('Saved'); renderApp(); } catch (x) { toast(x.message); } } } })),
      h('div', { class: 'card' }, h('div', { class: 'row' }, h('h3', { text: 'Order within a category' }), catSel, orderCat ? h('a', { class: 'btn ghost', href: `/#/search?category=${encodeURIComponent(orderCat)}`, target: '_blank', rel: 'noopener', text: 'Preview on the website' }) : ''),
        orderCat ? (listings.length ? h('div', {}, h('p', { class: 'muted', text: 'Drag to reorder (or use the arrows), then save. The list shows the current public order.' }), catList,
          h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save this order', on: { click: async () => { await call('PUT', `/api/admin/order/category/${encodeURIComponent(orderCat)}`, { ids: listings.map(x => x.id) }); toast('Order saved'); renderApp(); } } }),
            h('button', { class: 'btn ghost', type: 'button', text: 'Clear manual order (automatic only)', on: { click: async () => { await call('PUT', `/api/admin/order/category/${encodeURIComponent(orderCat)}`, { ids: [] }); toast('Manual order cleared'); renderApp(); } } }))) : h('p', { class: 'muted', text: 'No live providers in this category.' })) : h('p', { class: 'muted', text: 'Choose a category.' })),
      h('div', { class: 'card' }, h('h3', { text: 'Homepage: featured providers' }), h('p', { class: 'muted', text: 'Featuring is editorial. It doesn’t verify a provider. The homepage shows the first four.' }), homeList,
        h('div', { class: 'row' }, addSel, h('button', { class: 'btn ghost', type: 'button', text: 'Add', on: { click: () => { const x = allLive.listings.find(l => l.id === addSel.value); if (x && !home.some(y => y.id === x.id)) { home.push({ id: x.id, name: x.name, category: x.category }); homeList.refresh(); } } } }),
          h('button', { class: 'btn', type: 'button', text: 'Save homepage', on: { click: async () => { await call('PUT', '/api/admin/order/home', { ids: home.map(x => x.id) }); toast('Homepage saved'); renderApp(); } } }))),
      h('div', { class: 'card' }, h('h3', { text: 'Category order' }), catOrderList, h('button', { class: 'btn', type: 'button', text: 'Save category order', on: { click: async () => { await call('PUT', '/api/admin/order/categories', { ids: catOrder.map(c => c.id) }); toast('Category order saved'); renderApp(); } } })));
  }

  // ---------- bookings ----------
  const BSTAT = { quote_requested: 'Request sent', quote_received: 'Quote sent', revision_requested: 'Changes requested', awaiting_vendor: 'Waiting for provider', awaiting_payment: 'Deposit due', confirmed: 'Confirmed', in_progress: 'In progress', completed: 'Completed', cancellation_requested: 'Cancellation requested', cancelled: 'Cancelled', declined: 'Declined', expired: 'Expired', draft: 'Draft' };
  const PSTAT = { none: '—', pending: 'Pending', deposit_paid: 'Deposit paid', paid: 'Paid', partially_refunded: 'Partly refunded', refunded: 'Refunded', failed: 'Failed' };
  let bFilter = '', bQuery = '', bDisputed = false;
  async function viewBookings(main) {
    const qs = new URLSearchParams(); if (bFilter) qs.set('status', bFilter); if (bQuery) qs.set('q', bQuery); if (bDisputed) qs.set('disputed', '1');
    const { bookings, counts } = await call('GET', '/api/admin/bookings?' + qs);
    const search = h('input', { type: 'search', placeholder: 'Reference, provider or customer', value: bQuery, 'aria-label': 'Search bookings' }); let st;
    search.addEventListener('input', () => { clearTimeout(st); st = setTimeout(() => { bQuery = search.value; renderApp(); }, 350); });
    main.append(h('div', { class: 'bar' }, h('div', { class: 'tabs', role: 'group' }, h('button', { class: 'tab', type: 'button', 'aria-pressed': String(!bFilter && !bDisputed), text: 'All', on: { click: () => { bFilter = ''; bDisputed = false; renderApp(); } } }),
        ...Object.entries(BSTAT).filter(([k]) => counts[k]).map(([k, l]) => h('button', { class: 'tab', type: 'button', 'aria-pressed': String(bFilter === k), text: `${l} (${counts[k]})`, on: { click: () => { bFilter = k; bDisputed = false; renderApp(); } } })),
        h('button', { class: 'tab', type: 'button', 'aria-pressed': String(bDisputed), text: 'Disputed', on: { click: () => { bDisputed = !bDisputed; bFilter = ''; renderApp(); } } })), search),
      h('p', { class: 'muted', text: 'Status changes follow fixed rules on the server and are recorded with who did what. Requests to providers managed by MA3AK (no partner account) are answered here.' }),
      table([['ref', 'Booking', r => h('div', {}, h('b', { text: r.ref }), h('div', { class: 'pv', text: fmt(r.createdAt) }))], ['vendor', 'Provider', r => r.vendor.name], ['customerName', 'Customer'], ['eventDate', 'Event date'], ['status', 'Status', r => h('span', { class: 'badge ' + (['confirmed', 'completed', 'in_progress'].includes(r.status) ? 'booked' : ['cancelled', 'declined', 'expired'].includes(r.status) ? '' : 'new'), text: BSTAT[r.status] || r.status })],
        ['paymentStatus', 'Payment', r => PSTAT[r.paymentStatus] || r.paymentStatus], ['total', 'Price', r => r.agreedTotalMinor != null ? fm(r.agreedTotalMinor, r.currency) + ' agreed' : r.latestOffer ? fm(r.latestOffer.totalMinor, r.latestOffer.currency) + ' quoted' : r.estimateMinor != null ? fm(r.estimateMinor, r.currency) + ' est.' : 'Quote'], ['disputed', '', r => r.disputed ? h('span', { class: 'badge spam', text: 'Disputed' }) : '']], bookings, r => openBooking(r.id)));
  }
  async function openBooking(id) {
    const { booking: b } = await call('GET', `/api/admin/bookings/${id}`);
    const reopen = () => { closeAll(); renderApp(); openBooking(id); };
    const has = a => b.actions.includes(a), note = h('textarea', { rows: 2, placeholder: 'Reason or note (shown in the history; dispute notes stay internal)' });
    const doAct = (action, label, cls = 'btn ghost', extra = () => ({}), ask) => h('button', { class: cls, type: 'button', text: label, on: { click: async () => { if (ask && !confirm(ask)) return; try { const r = await call('POST', `/api/admin/bookings/${id}/action`, { action, note: note.value, reason: note.value, ...extra() }); toast(r.duplicate ? 'Already recorded' : 'Saved'); reopen(); } catch (x) { toast(errText(x)); } } } });
    const pk = h('select', {}, ...[['deposit', 'Deposit'], ['balance', 'Balance'], ['full', 'Full amount'], ['refund', 'Refund']].map(([k, l]) => h('option', { value: k, text: l }))), pm = h('select', {}, ...[['offline_transfer', 'Bank transfer'], ['offline_cash', 'Cash'], ['offline_other', 'Other']].map(([k, l]) => h('option', { value: k, text: l }))), pa = h('input', { inputmode: 'decimal', placeholder: `Amount (${b.currency})` }), pn = h('input', { placeholder: 'Reference or note' }), payKey = newKey();
    const msg = h('textarea', { rows: 2, placeholder: 'Message to both sides, as MA3AK' });
    const ofLines = h('textarea', { rows: 3, placeholder: 'One line per item: description | quantity | unit price\ne.g. Full day coverage | 1 | 800' }), ofCur = h('select', {}, ...Object.keys(CURS).map(c => h('option', { value: c, text: c, selected: b.currency === c }))), ofDep = h('input', { inputmode: 'decimal', placeholder: 'Deposit (optional)' }), ofValid = h('input', { type: 'date' }), ofCancel = h('textarea', { rows: 2, placeholder: 'Cancellation terms' }), ofMsg = h('input', { placeholder: 'Message to the customer' });
    const t = b.agreed && b.agreed.terms;
    drawer(`Booking ${b.ref}`,
      h('p', { class: 'meta', text: `${b.vendor.name} · ${b.category}${b.package && b.package.name ? ' · ' + b.package.name : ''} · created ${fmt(b.createdAt)}` }),
      h('div', { class: 'row' }, h('span', { class: 'badge new', text: BSTAT[b.status] || b.status }), h('span', { class: 'badge', text: 'Payment: ' + (PSTAT[b.paymentStatus] || b.paymentStatus) }), b.disputed ? h('span', { class: 'badge spam', text: 'Disputed' + (b.disputeNote ? ': ' + b.disputeNote : '') }) : ''),
      h('div', { class: 'card' }, h('h3', { text: 'Customer and event' }), h('pre', { class: 'summary', text: [`${b.customer.name}${b.customer.email ? ' · ' + b.customer.email : ''}${b.customer.phone ? ' · ' + b.customer.phone : ''}`, `${b.eventType || ''} · ${b.eventDate || ''}${b.eventTime ? ' ' + b.eventTime : ''} · ${b.location || ''}${b.guests ? ' · ' + b.guests + ' guests' : ''}${b.quantity ? ' · qty ' + b.quantity : ''}`, b.address ? 'Address: ' + b.address : '', Object.keys(b.details || {}).length ? 'Details: ' + JSON.stringify(b.details) : '', b.notes ? 'Notes: ' + b.notes : ''].filter(Boolean).join('\n') })),
      b.agreed ? h('div', { class: 'card' }, h('h3', { text: 'Agreed price (locked)' }), h('pre', { class: 'summary', text: [...(t.items || []).map(i => `${i.label} — ${i.quantity} × ${fm(i.unitMinor, b.currency)} = ${fm(i.totalMinor, b.currency)}`), b.agreed.discountMinor ? `Discount: −${fm(b.agreed.discountMinor, b.currency)} ${t.discountNote || ''}` : '', ...(t.fees || []).map(x => `${x.label}: ${fm(x.amountMinor, b.currency)}`), `Total: ${fm(b.agreed.totalMinor, b.currency)}`, b.agreed.depositMinor ? `Deposit: ${fm(b.agreed.depositMinor, b.currency)}` : '', `Payment: ${t.paymentSchedule || ''}`, `Cancellation: ${t.cancellationTerms || ''}`, b.commission ? `Commission: ${b.commission.rateBps / 100}% = ${fm(b.commission.amountMinor, b.currency)} (recorded, not collected automatically)` : ''].filter(Boolean).join('\n') })) : '',
      b.offers.length ? h('div', { class: 'card' }, h('h3', { text: `Offers (${b.offers.length})` }), h('pre', { class: 'summary', text: b.offers.map(o => `v${o.version} ${o.kind} · ${o.status} · ${fm(o.totalMinor, o.currency)}${o.depositMinor ? ' (deposit ' + fm(o.depositMinor, o.currency) + ')' : ''} · valid until ${o.validUntil}${o.responseNote ? ' · customer: ' + o.responseNote : ''}`).join('\n') })) : '',
      h('div', { class: 'card form2' }, h('h3', { text: 'Actions' }), note, h('div', { class: 'row' }, has('admin_cancel') ? doAct('admin_cancel', 'Cancel booking', 'btn danger', undefined, 'Cancel this booking? Both sides are notified.') : '', has('admin_complete') ? doAct('admin_complete', 'Mark completed') : '',
        has('approve_cancel') ? doAct('approve_cancel', 'Approve cancellation') : '', has('reject_cancel') ? doAct('reject_cancel', 'Refuse cancellation') : '', has('dispute') ? doAct('dispute', 'Flag a dispute') : '', has('resolve_dispute') ? doAct('resolve_dispute', 'Resolve dispute') : '',
        has('confirm') ? doAct('confirm', 'Confirm at package price (for the provider)', 'btn') : '', has('decline') ? doAct('decline', 'Decline (for the provider)') : '', has('withdraw_offer') ? doAct('withdraw_offer', 'Withdraw quote') : '')),
      has('record_payment') ? h('div', { class: 'card form2' }, h('h3', { text: 'Record a payment or refund' }), h('p', { class: 'muted', text: 'No payment provider is connected. Record only money that was actually received or refunded, and how.' }), h('div', { class: 'row' }, pk, pm, pa), pn,
        h('button', { class: 'btn', type: 'button', text: 'Record', on: { click: async () => { try { const r = await call('POST', `/api/admin/bookings/${id}/action`, { action: 'record_payment', kind: pk.value, method: pm.value, amount: pa.value.replace(/,/g, ''), note: pn.value, idempotencyKey: payKey }); toast(r.duplicate ? 'Already recorded' : 'Recorded'); reopen(); } catch (x) { toast(errText(x)); } } } })) : '',
      (has('send_offer') || has('send_amendment')) ? h('div', { class: 'card form2' }, h('h3', { text: has('send_amendment') && !has('send_offer') ? 'Propose a change (for the provider)' : 'Send a quote (for the provider)' }), ofLines, h('div', { class: 'row' }, has('send_offer') ? ofCur : '', ofDep, h('label', {}, 'Valid until', ofValid)), ofCancel, ofMsg,
        h('button', { class: 'btn', type: 'button', text: 'Send', on: { click: async () => { const items = lines(ofLines.value).map(l => { const [label, q, p] = l.split('|').map(x => x.trim()); return { label, quantity: +q || 1, unitPrice: (p || '').replace(/,/g, '') }; });
          try { await call('POST', `/api/admin/bookings/${id}/offers`, { items, currency: ofCur.value, deposit: ofDep.value.replace(/,/g, ''), validUntil: ofValid.value || undefined, cancellationTerms: ofCancel.value, message: ofMsg.value }); toast('Quote sent'); reopen(); } catch (x) { toast(errText(x)); } } } })) : '',
      b.payments.length ? h('div', { class: 'card' }, h('h3', { text: 'Payments recorded' }), table([['created_at', 'When', r => fmt(r.created_at)], ['kind', 'Kind'], ['amount_minor', 'Amount', r => fm(r.amount_minor, r.currency)], ['method', 'Method'], ['status', 'Status'], ['note', 'Note']], b.payments)) : '',
      b.commissions.length ? h('div', { class: 'card' }, h('h3', { text: 'Commission ledger' }), table([['created_at', 'When', r => fmt(r.created_at)], ['base_minor', 'Base', r => fm(r.base_minor, r.currency)], ['rate_bps', 'Rate', r => r.rate_bps / 100 + '%'], ['amount_minor', 'Amount', r => fm(r.amount_minor, r.currency)], ['status', 'Status'], ['note', 'Note']], b.commissions)) : '',
      h('div', { class: 'card' }, h('h3', { text: 'Messages' }), ...b.messages.map(m => h('div', { class: 'msg-row' }, h('small', { class: 'muted', text: `${m.from} · ${fmt(m.at)}${m.masked ? ' · contact details hidden' : ''}` }), h('p', { text: m.body }))), b.messages.length ? '' : h('p', { class: 'muted', text: 'No messages.' }),
        has('message') ? h('div', { class: 'row' }, msg, h('button', { class: 'btn', type: 'button', text: 'Send as MA3AK', on: { click: async () => { try { await call('POST', `/api/admin/bookings/${id}/messages`, { body: msg.value }); toast('Sent'); reopen(); } catch (x) { toast(x.message); } } } })) : ''),
      h('div', { class: 'card' }, h('h3', { text: 'History' }), table([['at', 'When', r => fmt(r.at)], ['actor', 'Who'], ['action', 'What'], ['from', 'From'], ['to', 'To'], ['note', 'Note']], b.timeline)));
  }

  // ---------- commission, payments and payouts ----------
  async function viewFinance(main) {
    const [{ rules }, fin, vend] = await Promise.all([call('GET', '/api/admin/commission'), call('GET', '/api/admin/finance'), call('GET', '/api/admin/vendors')]);
    const scope = h('select', {}, ...[['global', 'Everyone (default)'], ['category', 'A category'], ['vendor', 'One provider']].map(([k, l]) => h('option', { value: k, text: l })));
    const scopeId = h('select', {}, h('option', { value: '', text: '—' })); const fillScope = () => { scopeId.replaceChildren(...(scope.value === 'category' ? vend.categories.map(c => h('option', { value: c, text: c })) : scope.value === 'vendor' ? vend.vendors.filter(x => !x.isDemo).map(x => h('option', { value: x.id, text: x.name })) : [h('option', { value: '', text: '—' })])); }; scope.addEventListener('change', fillScope);
    const rate = h('input', { inputmode: 'decimal', placeholder: 'e.g. 5 or 2.5' }), rnote = h('input', { placeholder: 'Why (kept in the history)' }), remove = h('input', { type: 'checkbox' });
    const pv = h('select', {}, ...vend.vendors.filter(x => !x.isDemo).map(x => h('option', { value: x.id, text: x.name }))), pcur = h('select', {}, ...Object.keys(CURS).map(c => h('option', { value: c, text: c }))), pamt = h('input', { inputmode: 'decimal', placeholder: 'Amount' }), pref = h('input', { placeholder: 'Bank reference' }), pnote = h('input', { placeholder: 'Note' });
    const active = rules.filter(r => !r.ended_at);
    main.append(h('p', { class: 'muted', text: fin.providerConfigured ? '' : 'No payment provider is connected. Commissions are recorded on each booking when the price is agreed; they are not collected automatically. Payments and payouts below were recorded by hand.' }),
      h('div', { class: 'kpis' }, ...fin.totals.map(t => h('div', { class: 'kpi' }, h('b', { text: fm(t.total, t.currency) }), h('span', { text: `Commission ${t.status} (${t.currency}, ${t.n})` })))),
      h('div', { class: 'card form2' }, h('h3', { text: 'Commission rates (charged to providers)' }), h('p', { class: 'muted', text: 'The most specific rule applies: provider, then category, then everyone. A booking keeps the rate in force when its price was agreed; later changes never touch existing bookings. Providers see their rate on their Plan & fees page before accepting bookings.' }),
        table([['scope', 'Applies to', r => r.scope === 'global' ? 'Everyone' : `${r.scope}: ${r.scope_id}`], ['rate_bps', 'Rate', r => r.rate_bps / 100 + '%'], ['note', 'Note'], ['created_at', 'Since', r => fmt(r.created_at)], ['created_by_email', 'By']], active),
        h('div', { class: 'row' }, h('label', {}, 'Applies to', scope), h('label', {}, 'Which', scopeId), h('label', {}, 'Rate (%)', rate)), rnote, h('label', { class: 'chk' }, remove, 'Remove this category/provider rule (fall back to the general rate)'),
        h('button', { class: 'btn', type: 'button', text: 'Save rate', on: { click: async () => { try { await call('POST', '/api/admin/commission', { scope: scope.value, scopeId: scopeId.value, ratePercent: rate.value || '0', note: rnote.value, remove: remove.checked }); toast('Saved'); renderApp(); } catch (x) { toast(errText(x)); } } } }),
        rules.some(r => r.ended_at) ? h('details', {}, h('summary', { text: 'Earlier rates' }), table([['scope', 'Applies to', r => r.scope === 'global' ? 'Everyone' : `${r.scope}: ${r.scope_id}`], ['rate_bps', 'Rate', r => r.rate_bps / 100 + '%'], ['created_at', 'From', r => fmt(r.created_at)], ['ended_at', 'Until', r => fmt(r.ended_at)], ['note', 'Note']], rules.filter(r => r.ended_at))) : ''),
      h('div', { class: 'card' }, h('h3', { text: 'Commission ledger' }), table([['ref', 'Booking'], ['vendor_name', 'Provider'], ['base_minor', 'Base', r => fm(r.base_minor, r.currency)], ['rate_bps', 'Rate', r => r.rate_bps / 100 + '%'], ['amount_minor', 'Commission', r => fm(r.amount_minor, r.currency)], ['status', 'Status'], ['created_at', 'When', r => fmt(r.created_at)]], fin.commissions)),
      h('div', { class: 'card' }, h('h3', { text: 'Payments recorded' }), table([['ref', 'Booking'], ['vendor_name', 'Provider'], ['kind', 'Kind'], ['amount_minor', 'Amount', r => fm(r.amount_minor, r.currency)], ['method', 'Method'], ['note', 'Note'], ['created_at', 'When', r => fmt(r.created_at)]], fin.payments)),
      h('div', { class: 'card form2' }, h('h3', { text: 'Payouts to providers' }), table([['vendor_name', 'Provider'], ['amount_minor', 'Amount', r => fm(r.amount_minor, r.currency)], ['reference', 'Reference'], ['note', 'Note'], ['created_at', 'When', r => fmt(r.created_at)]], fin.payouts),
        h('div', { class: 'row' }, pv, pcur, pamt, pref), pnote, h('button', { class: 'btn', type: 'button', text: 'Record payout made', on: { click: async () => { try { await call('POST', '/api/admin/payouts', { vendorId: pv.value, currency: pcur.value, amount: pamt.value.replace(/,/g, ''), reference: pref.value, note: pnote.value }); toast('Recorded'); renderApp(); } catch (x) { toast(errText(x)); } } } })));
  }

  // ---------- provider plans ----------
  async function viewPlans(main) {
    const { plans, subscriptions, keys } = await call('GET', '/api/admin/plans');
    const ENT = { maxPhotos: 'Photos allowed', maxPackages: 'Packages allowed', analytics: 'Performance analytics', leadTools: 'Lead tools (export)', featuredEligible: 'Can be considered for featured placement', portfolioSections: 'Portfolio sections' };
    main.append(h('p', { class: 'muted', text: 'Plans change limits and tools only. They never verify a listing or guarantee bookings or ranking. Online billing isn’t connected: activate paid plans from a provider’s page after payment is received.' }),
      h('div', { class: 'grid3' }, ...plans.map(p => { const f = { name: h('input', { value: p.name }), price: h('input', { inputmode: 'decimal', value: toIn(p.price_minor, p.currency) }), currency: h('select', {}, ...Object.keys(CURS).map(c => h('option', { value: c, text: c, selected: p.currency === c }))), interval: h('select', {}, ...['month', 'year'].map(c => h('option', { value: c, text: c, selected: p.billing_interval === c }))), description: h('textarea', { rows: 2 }), active: h('input', { type: 'checkbox' }) };
        f.description.value = p.description; f.active.checked = !!p.active; const ent = Object.fromEntries(Object.entries(keys).map(([k, t]) => { const el = h('input', t === 'int' ? { type: 'number', min: 0, value: p.entitlements[k] ?? 0 } : { type: 'checkbox' }); if (t !== 'int') el.checked = !!p.entitlements[k]; return [k, el]; }));
        return h('div', { class: 'card form2' }, h('h3', { text: p.id }), h('label', {}, 'Name', f.name), h('div', { class: 'row' }, h('label', {}, 'Price', f.price), h('label', {}, 'Currency', f.currency), h('label', {}, 'Every', f.interval)), h('label', {}, 'Description', f.description),
          ...Object.entries(ent).map(([k, el]) => keys[k] === 'int' ? h('label', {}, ENT[k] || k, el) : h('label', { class: 'chk' }, el, ENT[k] || k)), p.id !== 'free' ? h('label', { class: 'chk' }, f.active, 'Offered to providers') : '',
          h('button', { class: 'btn', type: 'button', text: 'Save plan', on: { click: async () => { try { await call('PUT', `/api/admin/plans/${p.id}`, { name: f.name.value, price: f.price.value.replace(/,/g, ''), currency: f.currency.value, interval: f.interval.value, description: f.description.value, active: p.id === 'free' ? true : f.active.checked, entitlements: Object.fromEntries(Object.entries(ent).map(([k, el]) => [k, keys[k] === 'int' ? +el.value : el.checked])) }); toast('Plan saved'); renderApp(); } catch (x) { toast(errText(x)); } } } })); })),
      h('div', { class: 'card' }, h('h3', { text: 'Subscriptions and requests' }), table([['vendor_name', 'Provider'], ['plan_id', 'Plan'], ['status', 'Status', r => h('span', { class: 'badge ' + (r.status === 'requested' ? 'new' : ['active', 'comped'].includes(r.status) ? 'booked' : ''), text: r.status })], ['price_minor', 'Price', r => fm(r.price_minor, r.currency)], ['current_period_end', 'Until'], ['note', 'Note'], ['updated_at', 'Updated', r => fmt(r.updated_at)]], subscriptions, async r => openVendor(r.vendor_id, await call('GET', '/api/admin/vendors')))));
  }

  // ---------- reviews and reports ----------
  let repFilter = 'open';
  async function viewReviews(main) {
    const [{ reviews }, { reports }] = await Promise.all([call('GET', '/api/admin/reviews'), call('GET', '/api/admin/reports?status=' + repFilter)]);
    main.append(h('div', { class: 'card' }, h('div', { class: 'row' }, h('h3', { text: 'Reports' }), h('div', { class: 'tabs' }, ...['open', 'resolved', 'dismissed'].map(k => h('button', { class: 'tab', type: 'button', 'aria-pressed': String(repFilter === k), text: k, on: { click: () => { repFilter = k; renderApp(); } } })))),
        table([['created_at', 'When', r => fmt(r.created_at)], ['target_type', 'About'], ['reason', 'Reason'], ['details', 'Details'], ['reporter_type', 'From']], reports, async r => { const { target } = await call('GET', `/api/admin/reports/${r.id}/target`); const rn = h('input', { placeholder: 'Resolution note' });
          const d = drawer('Report', h('pre', { class: 'summary', text: `${r.reason}\n${r.details || ''}\n\nReported item:\n${JSON.stringify(target, null, 2)}` }), rn, h('div', { class: 'row' }, ...['resolved', 'dismissed', 'open'].map(s => h('button', { class: 'btn ghost', type: 'button', text: { resolved: 'Mark resolved', dismissed: 'Dismiss', open: 'Reopen' }[s], on: { click: async () => { await call('POST', `/api/admin/reports/${r.id}`, { status: s, note: rn.value }); toast('Saved'); d.remove(); renderApp(); } } })),
            r.target_type === 'review' ? h('button', { class: 'btn danger', type: 'button', text: 'Hide the review', on: { click: async () => { await call('POST', `/api/admin/reviews/${r.target_id}`, { status: 'hidden', note: 'Report ' + r.id }); toast('Review hidden'); } } }) : '',
            target && target.booking_id ? h('button', { class: 'btn ghost', type: 'button', text: 'Open booking', on: { click: () => { d.remove(); openBooking(target.booking_id); } } }) : r.target_type === 'booking' ? h('button', { class: 'btn ghost', type: 'button', text: 'Open booking', on: { click: () => { d.remove(); openBooking(r.target_id); } } }) : '')); })),
      h('div', { class: 'card' }, h('h3', { text: 'Reviews' }), h('p', { class: 'muted', text: 'Only customers with a completed booking can review, once per booking. You can hide a review that breaks the rules; you can’t edit it.' }),
        table([['vendor_name', 'Provider'], ['rating', 'Rating', r => '★'.repeat(r.rating)], ['body', 'Review'], ['author_name', 'By'], ['ref', 'Booking'], ['status', 'Status'], ['act', '', r => h('button', { class: 'btn ghost', type: 'button', text: r.status === 'hidden' ? 'Publish' : 'Hide', on: { click: async e => { e.stopPropagation(); await call('POST', `/api/admin/reviews/${r.id}`, { status: r.status === 'hidden' ? 'published' : 'hidden' }); toast('Saved'); renderApp(); } } })]], reviews)));
  }
  // ---------- website content ----------
  async function viewWebsite(main) {
    const { settings: s } = await call('GET', '/api/admin/settings');
    const save = async (key, value, btn) => { btn.disabled = true; try { await call('PUT', `/api/admin/settings/${key}`, { value }); toast('Saved. The website shows it right away.'); } catch (x) { toast(x.message); } btn.disabled = false; };
    const fields = (key, spec, val = {}) => { const f = {}; const box = h('div', { class: 'card form2' }, h('h3', { text: spec.title }), ...spec.fields.map(([k, label, type]) => { if (type === 'check') { f[k] = h('input', { type: 'checkbox' }); f[k].checked = !!val[k]; return h('label', { class: 'chk' }, f[k], label); } f[k] = type === 'area' ? h('textarea', { rows: 3 }) : h('input', { type: type || 'text' }); f[k].value = val[k] ?? ''; return h('label', {}, label, f[k]); }));
      const b = h('button', { class: 'btn', type: 'button', text: 'Save', on: { click: () => save(key, Object.fromEntries(Object.entries(f).map(([k, el]) => [k, el.type === 'checkbox' ? el.checked : el.value])), b) } }); box.append(b); return box; };
    const list = (key, title, cols, items) => { const rows = h('div', { class: 'stack' }); const add = it => { const f = {}; const r = h('div', { class: 'card' }, ...cols.map(([k, label, type]) => { f[k] = type === 'area' ? h('textarea', { rows: 2 }) : h('input', {}); f[k].value = k === 'colors' ? (it?.[k] || []).join(', ') : it?.[k] ?? ''; return h('label', {}, label, f[k]); }), h('button', { class: 'btn ghost', type: 'button', text: 'Remove', on: { click: () => r.remove() } })); r._f = f; rows.append(r); };
      (items || []).forEach(add); const b = h('button', { class: 'btn', type: 'button', text: 'Save ' + title.toLowerCase(), on: { click: () => save(key, [...rows.children].map(r => Object.fromEntries(Object.entries(r._f).map(([k, el]) => [k, k === 'colors' ? el.value.split(/[\s,]+/).filter(Boolean) : el.value]))), b) } });
      return h('div', { class: 'card' }, h('h3', { text: title }), rows, h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', text: 'Add', on: { click: () => add({}) } }), b)); };
    main.append(h('p', { class: 'muted', text: 'Everything here appears on the public website. Text is shown exactly as written (no HTML).' }),
      fields('contact', { title: 'Contact and social links', fields: [['phone', 'Phone', 'tel'], ['whatsapp', 'WhatsApp number (digits, with country code, e.g. 96176620434)'], ['email', 'Email', 'email'], ['instagram', 'Instagram username'], ['facebook', 'Facebook page link (https://www.facebook.com/…)'], ['tiktok', 'TikTok username'], ['address', 'Address or area'], ['hours', 'Opening hours']] }, s.contact),
      fields('hero', { title: 'Homepage hero', fields: [['eyebrow', 'Small line under the buttons'], ['title', 'Title'], ['subtitle', 'Subtitle', 'area'], ['primary', 'Main button'], ['secondary', 'Second button']] }, s.hero),
      fields('budgetIntro', { title: 'Budget planner introduction', fields: [['title', 'Title'], ['text', 'Text', 'area']] }, s.budgetIntro),
      fields('announcement', { title: 'Announcement bar', fields: [['active', 'Show the announcement', 'check'], ['text', 'Text']] }, s.announcement),
      list('howItWorks', 'How it works', [['title', 'Step title'], ['text', 'Step text', 'area']], s.howItWorks),
      list('faqs', 'FAQs', [['q', 'Question'], ['a', 'Answer', 'area']], s.faqs),
      list('themes', 'Themes', [['name', 'Name'], ['description', 'Description'], ['colors', 'Colours (hex codes separated by commas, e.g. #F4EFE6, #C9A45C)']], s.themes),
      h('h2', { class: 'sec', text: 'Marketplace rules' }), feesCard(s.customerFees || [], save), policyCard(s.bookingPolicy || {}, save), termsCard(s.vendorTerms || {}, save));
  }
  // Fees charged to customers on top of providers' prices. Shown before any acceptance. Empty = no fees.
  function feesCard(fees, save) {
    const rows = h('div', { class: 'stack' });
    const add = f => { const label = h('input', { value: f?.label || '', placeholder: 'Name customers see, e.g. Service fee' }), type = h('select', {}, h('option', { value: 'percent', text: 'Percentage', selected: f?.type !== 'flat' }), h('option', { value: 'flat', text: 'Flat amount', selected: f?.type === 'flat' })), pct = h('input', { inputmode: 'decimal', placeholder: '%', value: f?.bps ? f.bps / 100 : '' }), cur = h('select', {}, ...Object.keys(CURS).map(c => h('option', { value: c, text: c, selected: f?.currency === c }))), amt = h('input', { inputmode: 'decimal', placeholder: 'Amount', value: f?.amountMinor ? toIn(f.amountMinor, f.currency) : '' });
      const r = h('div', { class: 'card row' }, label, type, pct, cur, amt, h('button', { class: 'btn ghost', type: 'button', text: 'Remove', on: { click: () => r.remove() } })); r._v = () => ({ label: label.value, type: type.value, percent: pct.value, currency: cur.value, amount: amt.value }); rows.append(r); };
    fees.forEach(add); const b = h('button', { class: 'btn', type: 'button', text: 'Save customer fees', on: { click: () => save('customerFees', [...rows.children].map(r => r._v()), b) } });
    return h('div', { class: 'card' }, h('h3', { text: 'Customer fees' }), h('p', { class: 'muted', text: 'Fees added on top of the provider’s price and paid by the customer. They are listed line by line on every estimate and quote before the customer accepts. Leave empty for no fees. Flat fees only apply to bookings in their currency.' }), rows, h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', text: 'Add fee', on: { click: () => add({}) } }), b));
  }
  function policyCard(p, save) {
    const v = h('input', { type: 'number', min: 1, max: 90, value: p.offerValidityDays ?? 14 }), r = h('input', { type: 'number', min: 7, max: 730, value: p.reviewWindowDays ?? 180 }), c = h('textarea', { rows: 3 }); c.value = p.defaultCancellationTerms || '';
    const b = h('button', { class: 'btn', type: 'button', text: 'Save booking rules', on: { click: () => save('bookingPolicy', { offerValidityDays: +v.value, reviewWindowDays: +r.value, defaultCancellationTerms: c.value }, b) } });
    return h('div', { class: 'card form2' }, h('h3', { text: 'Booking rules' }), h('label', {}, 'Quotes are valid for (days, unless the provider sets a date)', v), h('label', {}, 'Customers can review for (days after completion)', r), h('label', {}, 'Default cancellation terms (providers can change them in each quote)', c), b);
  }
  function termsCard(t, save) {
    const ver = h('input', { value: t.version || '' }), txt = h('textarea', { rows: 12 }); txt.value = t.text || '';
    const b = h('button', { class: 'btn', type: 'button', text: 'Publish terms', on: { click: () => save('vendorTerms', { version: ver.value, text: txt.value }, b) } });
    return h('div', { class: 'card form2' }, h('h3', { text: 'Partner terms (shown to providers)' }), h('p', { class: 'muted', text: 'Providers must accept the current version before sending quotes or confirming bookings. To change the text, also change the version (e.g. a new date) so everyone is asked to accept again. Have a lawyer review these terms before relying on them.' }), h('label', {}, 'Version', ver), h('label', {}, 'Text', txt), b);
  }
  // ---------- categories ----------
  async function viewCategories(main) {
    const { categories } = await call('GET', '/api/admin/categories');
    const ICONS = ['building', 'utensils', 'camera', 'video', 'music', 'mic', 'sparkle', 'flower', 'cake', 'clipboard', 'armchair', 'bulb', 'car', 'brush', 'scissors', 'more', 'gift', 'glass', 'heart', 'ring', 'shield', 'store', 'star', 'tent', 'umbrella', 'users'];
    const edit = c => { const id = h('input', { value: c?.id || '', readonly: c ? true : null }), name = h('input', { value: c?.name || '' }), single = h('input', { value: c?.single || '' }), blurb = h('input', { value: c?.blurb || '' }), sort = h('input', { type: 'number', value: c?.sort ?? 100 });
      const icon = h('select', {}, ...ICONS.map(i => h('option', { value: i, text: i, selected: (c?.icon || 'more') === i }))), active = h('input', { type: 'checkbox' }); active.checked = c ? !!c.active : true; const err = h('p', { class: 'err', role: 'alert' });
      const d = drawer(c ? 'Edit category' : 'New category', h('div', { class: 'card form2' }, h('label', {}, 'ID (lowercase, dashes)', id), h('label', {}, 'Name (plural)', name), h('label', {}, 'Name (one provider)', single), h('label', {}, 'Short description', blurb), h('label', {}, 'Icon', icon), h('label', {}, 'Order', sort), h('label', { class: 'chk' }, active, 'Shown on the website'), err,
        h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save', on: { click: async () => { try { await call('PUT', `/api/admin/categories/${encodeURIComponent(id.value.trim())}`, { name: name.value, single: single.value, blurb: blurb.value, icon: icon.value, sort: +sort.value, active: active.checked }); toast('Saved'); d.remove(); renderApp(); } catch (x) { err.textContent = x.message; } } } }),
          c ? h('button', { class: 'btn danger', type: 'button', text: 'Delete', on: { click: async () => { if (!confirm('Delete this category?')) return; try { await call('DELETE', `/api/admin/categories/${encodeURIComponent(c.id)}`); toast('Deleted'); d.remove(); renderApp(); } catch (x) { err.textContent = x.message; } } } }) : ''))); };
    main.append(h('div', { class: 'bar' }, h('button', { class: 'btn', type: 'button', text: 'Add category', on: { click: () => edit(null) } }), h('p', { class: 'muted', text: 'Categories organise providers, the directory filters and the planner.' })),
      table([['name', 'Category', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.id }))], ['blurb', 'Description'], ['vendors', 'Providers'], ['sort', 'Order'], ['active', 'Shown', r => r.active ? 'Yes' : 'Hidden']], categories, edit));
  }
  // ---------- activity history ----------
  let auditPage = 1;
  async function viewActivity(main) {
    const { rows } = await call('GET', '/api/admin/audit?page=' + auditPage);
    main.append(h('p', { class: 'muted', text: 'Every sign-in, approval, price change and content edit, newest first.' }), table([['at', 'When', r => fmt(r.at)], ['actor', 'Who', r => r.actor || '—'], ['action', 'Action'], ['target', 'Item', r => r.target || ''], ['detail', 'Detail', r => r.detail || '']], rows),
      h('div', { class: 'pager' }, auditPage > 1 ? h('button', { class: 'btn ghost', type: 'button', text: 'Newer', on: { click: () => { auditPage--; renderApp(); } } }) : '', h('span', { text: 'Page ' + auditPage }), rows.length === 50 ? h('button', { class: 'btn ghost', type: 'button', text: 'Older', on: { click: () => { auditPage++; renderApp(); } } }) : ''));
  }
  async function viewCatalog(main) {
    const { items } = await (await fetch('/api/catalog', { cache: 'no-store' })).json();
    const edit = it => {
      const f = {}; const inp = (k, label, val, type = 'text') => { f[k] = h('input', { type, value: val ?? '' }); return h('label', {}, label, f[k]); };
      const sel = (k, label, opts, val) => { f[k] = h('select', {}, ...opts.map(([v, l]) => h('option', { value: v, text: l, selected: val === v }))); return h('label', {}, label, f[k]); };
      const chk = (k, label, val) => { f[k] = h('input', { type: 'checkbox' }); f[k].checked = !!val; return h('label', { class: 'chk' }, f[k], label); };
      let img = null; const file = h('input', { type: 'file', accept: 'image/jpeg,image/png', on: { change: e => { const r = new FileReader(); r.onload = () => { img = r.result; }; r.readAsDataURL(e.target.files[0]); } } });
      const d = drawer(it ? 'Edit item' : 'New item', h('div', { class: 'card form2' },
        inp('id', 'ID (letters, numbers, dashes)', it?.id), inp('name', 'Name', it?.name), sel('category', 'Category', [['stage', 'Stage & music'], ['decor', 'Decor'], ['lights', 'Lighting'], ['fx', 'Effects'], ['food', 'Food & drinks'], ['fun', 'Fun']], it?.category || 'decor'),
        sel('rarity', 'Rarity', [['c', 'Classic'], ['r', 'Rare'], ['e', 'Epic'], ['l', 'Legendary']], it?.rarity || 'c'), inp('price_from', 'Price from (USD, optional)', it?.price_from, 'number'), inp('tags', 'Tags (space separated, e.g. popular outdoor luxury)', (it?.tags || []).join(' ')),
        inp('model', '3D model (existing type, optional)', it?.model), inp('field', 'Sets choice field (optional)', it?.field), inp('value', 'Choice value (optional)', it?.value),
        h('div', { class: 'row' }, chk('available', 'Available', it ? it.available : true), chk('featured', 'Featured', it?.featured), chk('isNew', 'New', it?.isNew), chk('popular', 'Popular', it?.popular)), h('label', {}, 'Image (optional)', file),
        h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save', on: { click: async () => { try { await call('PUT', `/api/admin/catalog/${encodeURIComponent(f.id.value.trim())}`, { name: f.name.value, category: f.category.value, rarity: f.rarity.value, price_from: f.price_from.value || null, tags: f.tags.value, model: f.model.value, field: f.field.value, value: f.value.value, available: f.available.checked, featured: f.featured.checked, isNew: f.isNew.checked, popular: f.popular.checked, image: img || undefined }); toast('Saved'); d.remove(); renderApp(); } catch (x) { toast(x.message); } } } }),
          it ? h('button', { class: 'btn danger', type: 'button', text: 'Delete', on: { click: async () => { if (!confirm('Delete this item?')) return; await call('DELETE', `/api/admin/catalog/${it.id}`); toast('Deleted'); d.remove(); renderApp(); } } }) : '')));
      if (it) f.id.readOnly = true;
    };
    main.append(h('div', { class: 'bar' }, h('button', { class: 'btn', type: 'button', text: 'Add item', on: { click: () => edit(null) } }), h('p', { class: 'muted', text: 'Changes appear in the designer for every customer within a minute.' })),
      table([['name', 'Item', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.id }))], ['category', 'Category'], ['rarity', 'Rarity', r => ({ c: 'Classic', r: 'Rare', e: 'Epic', l: 'Legendary' })[r.rarity]], ['price_from', 'From', r => r.price_from ? '$' + r.price_from : '—'], ['available', 'Available', r => r.available ? 'Yes' : 'Hidden'], ['tags', 'Tags', r => (r.tags || []).join(', ')]], items, edit));
  }
  async function viewKB(main) {
    const { rows } = await call('GET', '/api/admin/kb');
    const edit = it => { const topic = h('select', {}, ...['Services', 'Packages', 'Pricing', 'Policies', 'Contact', 'FAQ', 'Hours', 'Venues', 'Decoration', 'Entertainment', 'Other'].map(t => h('option', { value: t, text: t, selected: it?.topic === t }))); const title = h('input', { value: it?.title || '' }); const body = h('textarea', { rows: 10 }); body.value = it?.body || '';
      const d = drawer(it ? 'Edit knowledge' : 'New knowledge', h('div', { class: 'card form2' }, h('label', {}, 'Topic', topic), h('label', {}, 'Title', title), h('label', {}, 'What the assistant should know', body),
        h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save', on: { click: async () => { try { await call('PUT', `/api/admin/kb/${it ? it.id : 'new'}`, { topic: topic.value, title: title.value, body: body.value }); toast('Saved'); d.remove(); renderApp(); } catch (x) { toast(x.message); } } } }),
          it ? h('button', { class: 'btn danger', type: 'button', text: 'Delete', on: { click: async () => { await call('DELETE', `/api/admin/kb/${it.id}`); d.remove(); renderApp(); } } }) : ''))); };
    main.append(h('div', { class: 'bar' }, h('button', { class: 'btn', type: 'button', text: 'Add knowledge', on: { click: () => edit(null) } }), h('p', { class: 'muted', text: 'The AI assistant uses this to answer questions about your services, packages, prices and policies. It never invents what isn’t here.' })),
      table([['topic', 'Topic'], ['title', 'Title'], ['updated_at', 'Updated', r => fmt(r.updated_at)]], rows, edit));
  }
  async function viewIntegrations(main) {
    const { integrations, plans } = await call('GET', '/api/admin/integrations');
    main.append(h('p', { class: 'muted', text: 'Each service turns on when its settings are added to the server environment. Nothing below is simulated.' }),
      h('div', { class: 'grid3' }, ...Object.entries(integrations).map(([k, v]) => h('div', { class: 'card' }, h('div', { class: 'row' }, h('h3', { text: v.provider }), h('span', { class: 'badge ' + (v.configured ? 'booked' : ''), text: v.configured ? 'Connected' : 'Not configured' })), h('p', { class: 'muted', text: 'Needs: ' + v.needs.join(', ') })))),
      h('div', { class: 'card' }, h('h3', { text: 'Plans (billing not connected yet)' }), h('pre', { class: 'summary', text: Object.entries(plans).map(([k, p]) => `${p.name}: ${p.maxEvents} events, ${p.maxVersions} versions, ${p.aiPerDay} AI messages/day`).join('\n') })));
  }
  async function loadStats() {
    try {
      const { rows } = await call('GET', '/api/admin/stats');
      const sum = f => rows.filter(f).reduce((s, r) => s + r.n, 0);
      document.getElementById('kpis').replaceChildren(
        ...[['New', sum(r => r.status === 'new')], ['Event designs', sum(r => r.type === 'event')], ['Messages', sum(r => r.type === 'contact')], ['Vendor applications', sum(r => r.type === 'vendor')], ['Booked', sum(r => r.status === 'booked')]]
          .map(([l, n]) => h('div', { class: 'kpi' }, h('b', { text: n }), h('span', { text: l }))));
    } catch {}
  }
  async function loadList() {
    const list = document.getElementById('list'); if (!list) return;
    const qs = new URLSearchParams({ page: state.page }); if (state.type) qs.set('type', state.type); if (state.status) qs.set('status', state.status); if (state.q) qs.set('q', state.q);
    let j; try { j = await call('GET', '/api/admin/requests?' + qs); } catch (e) { if (e.message !== 'signed out') list.replaceChildren(h('p', { class: 'err', text: e.message })); return; }
    if (!j.rows.length) { list.replaceChildren(h('div', { class: 'empty', text: 'No requests yet.' })); return; }
    const tbody = h('tbody', {}, ...j.rows.map(r => h('tr', { tabindex: '0', on: { click: () => openDetail(r.id), keydown: e => { if (e.key === 'Enter') openDetail(r.id); } } },
      h('td', {}, h('span', { class: `badge t-${r.type}`, text: TYPES[r.type] || r.type })),
      h('td', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.ref })),
      h('td', { class: 'hide-m' }, r.email || '', r.phone ? h('div', { class: 'pv', text: r.phone }) : ''),
      h('td', { class: 'hide-m' }, h('div', { class: 'pv', text: r.preview })),
      h('td', {}, h('span', { class: `badge ${r.status}`, text: STATUSES[r.status] })),
      h('td', { class: 'hide-m', text: fmt(r.created_at) }))));
    const pages = Math.max(1, Math.ceil(j.total / 25));
    list.replaceChildren(
      h('table', { class: 'table' }, h('thead', {}, h('tr', {}, ...['Type', 'Name', 'Contact', 'Details', 'Status', 'Received'].map((t, i) => h('th', { class: i === 2 || i === 3 || i === 5 ? 'hide-m' : null, text: t })))), tbody),
      h('div', { class: 'pager' }, `${j.total} total`, h('button', { class: 'btn ghost', type: 'button', disabled: state.page <= 1, text: 'Previous', on: { click: () => { state.page--; loadList(); } } }), `Page ${state.page} of ${pages}`, h('button', { class: 'btn ghost', type: 'button', disabled: state.page >= pages, text: 'Next', on: { click: () => { state.page++; loadList(); } } })));
  }

  // ---------- detail drawer ----------
  async function openDetail(id) {
    let j; try { j = await call('GET', `/api/admin/requests/${id}`); } catch (e) { if (e.message !== 'signed out') toast(e.message); return; }
    const r = j.request, close = () => { drawer.remove(); document.removeEventListener('keydown', esc); }, esc = e => { if (e.key === 'Escape') close(); };
    const status = h('select', { 'aria-label': 'Status' }, ...Object.entries(STATUSES).map(([k, v]) => h('option', { value: k, text: v, selected: r.status === k })));
    const notes = h('textarea', { 'aria-label': 'Internal notes', maxlength: 10000, placeholder: 'Internal notes (only your team sees these)' }); notes.value = r.notes || '';
    const c = r.payload && r.payload.contact, contact = [r.email && h('a', { href: 'mailto:' + r.email, text: r.email }), r.phone && h('a', { href: 'tel:' + r.phone.replace(/[^\d+]/g, ''), text: r.phone }), r.phone && h('a', { href: 'https://wa.me/' + r.phone.replace(/[^\d]/g, ''), target: '_blank', rel: 'noopener noreferrer', text: 'WhatsApp' })].filter(Boolean);
    const imgs = j.files.length ? h('div', { class: 'card' }, h('h3', { text: 'Images' }), h('div', { class: 'imgs' }, ...j.files.map(f => h('figure', {}, h('a', { href: `/api/admin/files/${encodeURIComponent(f.id)}`, target: '_blank', rel: 'noopener' }, h('img', { src: `/api/admin/files/${encodeURIComponent(f.id)}`, alt: f.kind === 'venue' ? 'Customer venue photo' : '3D design', loading: 'lazy' })), h('figcaption', { text: `${f.kind === 'venue' ? 'Customer’s venue photo' : '3D design'} · ${(f.size / 1024).toFixed(0)} KB` }))))) : null;
    const drawer = h('div', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Request ${r.ref}`, on: { click: e => { if (e.target === drawer) close(); } } },
      h('div', { class: 'panel' },
        h('div', { class: 'row' }, h('h2', { text: r.name }), h('span', { class: `badge t-${r.type}`, text: TYPES[r.type] }), h('button', { class: 'btn ghost', type: 'button', style: null, text: 'Close', on: { click: close } })),
        h('div', { class: 'meta' }, h('span', { text: r.ref }), h('span', { text: 'Received ' + fmt(r.created_at) }), ...contact),
        imgs,
        h('div', { class: 'card' }, h('h3', { text: 'Details' }), h('pre', { class: 'summary', text: r.summary || JSON.stringify(r.payload, null, 2) })),
        h('div', { class: 'card' }, h('h3', { text: 'Follow-up' }), h('div', { class: 'row' }, h('label', {}, 'Status', status)), h('label', {}, 'Notes', notes),
          h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save', on: { click: async e => { e.target.disabled = true; try { await call('PATCH', `/api/admin/requests/${r.id}`, { status: status.value, notes: notes.value }); toast('Saved'); loadList(); loadStats(); } catch (x) { if (x.message !== 'signed out') toast(x.message); } e.target.disabled = false; } } }),
            h('button', { class: 'btn danger', type: 'button', text: 'Delete request', on: { click: async () => { if (!confirm(`Delete ${r.ref} and its images permanently?`)) return; try { await call('DELETE', `/api/admin/requests/${r.id}`); toast('Deleted'); close(); loadList(); loadStats(); } catch (x) { if (x.message !== 'signed out') toast(x.message); } } } })))));
    document.body.append(drawer); document.addEventListener('keydown', esc); drawer.querySelector('button').focus();
  }

  // ---------- change password ----------
  function openPassword() {
    const cur = h('input', { type: 'password', autocomplete: 'current-password', required: true }), next = h('input', { type: 'password', autocomplete: 'new-password', required: true, minlength: 12 }), err = h('p', { class: 'err', role: 'alert' });
    const close = () => drawer.remove();
    const drawer = h('div', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Change password', on: { click: e => { if (e.target === drawer) close(); } } },
      h('form', { class: 'panel', on: { submit: async e => { e.preventDefault(); err.textContent = ''; try { await call('POST', '/api/admin/password', { current: cur.value, next: next.value }); toast('Password changed. Other sessions were signed out.'); close(); } catch (x) { if (x.message !== 'signed out') err.textContent = x.message; } } } },
        h('h2', { text: 'Change password' }), h('label', {}, 'Current password', cur), h('label', {}, 'New password (12+ characters, letters and numbers)', next), err,
        h('div', { class: 'row' }, h('button', { class: 'btn', type: 'submit', text: 'Change password' }), h('button', { class: 'btn ghost', type: 'button', text: 'Cancel', on: { click: close } }))));
    document.body.append(drawer); cur.focus();
  }

  // ---------- boot ----------
  call('GET', '/api/admin/me').then(j => { csrf = j.csrf; me = j.email; renderApp(); }).catch(() => {});
})();
