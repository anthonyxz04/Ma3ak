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
  const TABS = [['overview','Overview'],['vendors','Providers'],['quotes','Quotes'],['requests','Requests'],['events','Plans'],['users','Accounts'],['leads','Leads'],['website','Website'],['categories','Categories'],['catalog','3D catalog'],['kb','Knowledge'],['ai','Assistant chats'],['activity','Activity'],['integrations','Integrations']];
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
    Promise.resolve(({ overview: viewOverview, requests: viewRequests, leads: viewLeads, users: viewUsers, events: viewEvents, ai: viewAI, vendors: viewVendors, quotes: viewQuotes, website: viewWebsite, categories: viewCategories, activity: viewActivity, catalog: viewCatalog, kb: viewKB, integrations: viewIntegrations })[tab](main)).catch(x => { if (x.message !== 'signed out') main.append(h('div', { class: 'empty', text: 'This section didn’t load: ' + x.message })); });
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
    main.append(h('h2', { class: 'sec', text: 'Marketplace' }), h('div', { class: 'kpis' }, ...[['Customers', o.customers], ['New accounts (7 days)', o.newUsers7], ['Partners', o.partners], ['Waiting for approval', o.pending, 'vendors'], ['Live providers (real)', o.published], ['Demo listings', o.demo], ['Saved plans', o.plans], ['Finalized plans', o.finalized], ['New quote requests', o.quotesNew, 'quotes'], ['All quote requests', o.quotesAll], ['New website requests', o.requestsNew, 'requests'], ['Assistant chats', o.aiChats]].map(([l, n, go]) => h(go ? 'button' : 'div', { class: 'kpi' + (go ? ' link' : ''), type: go ? 'button' : null, on: go ? { click: () => { tab = go; if (go === 'vendors') vFilter = 'pending'; if (go === 'quotes') qFilter = 'new'; renderApp(); } } : null }, h('b', { text: n }), h('span', { text: l })))),
      h('h2', { class: 'sec', text: '3D designer and requests' }), h('div', { class: 'kpis' }, ...[['Accounts', t.users], ['Events / plans', t.events], ['Quote requests', t.quotes], ['All requests', t.requests], ['AI chats', t.aiChats], ['Asked for a human', t.handoffs], ['Share links', t.shares], ['Conversion', conv + '%']].map(([l, n]) => h('div', { class: 'kpi' }, h('b', { text: n }), h('span', { text: l })))),
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
    main.append(h('p', { class: 'muted', text: 'Customers’ saved plans and 3D designs, for support. Open one to see its services and totals. Plans are private: don’t share their contents.' }), table([['name', 'Plan', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.owner + ' · ' + r.email }))], ['event_type', 'Type'], ['event_date', 'Date'], ['location', 'Area'], ['guest_count', 'Guests'], ['budget', 'Budget', r => money(r.budget)], ['services', 'Services'], ['status', 'Status', r => h('span', { class: 'badge ' + r.status, text: r.status })]], rows, async r => {
      const d = await call('GET', `/api/admin/events/${r.id}`);
      const planText = d.services.length ? d.services.map(s => `${s.category}: ${s.label}${s.vendorName ? ' (' + s.vendorName + ')' : ''} — ${s.lineLow == null ? 'quote needed' : money(s.lineLow) + (s.lineHigh > s.lineLow ? '–' + money(s.lineHigh).slice(1) : '')}`).join('\n') + `\n\nEstimated total: ${money(d.totals.low)}${d.totals.high > d.totals.low ? '–' + money(d.totals.high).slice(1) : ''}${d.totals.budget ? ' · budget ' + money(d.totals.budget) : ''}` : 'No services added yet';
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
  // ---------- providers: review, publish, packages, photos ----------
  const VSTATUS = { all: 'All', pending: 'Waiting for approval', approved: 'Approved', draft: 'Drafts', rejected: 'Rejected', demo: 'Demo listings' };
  const UNITS = { flat: 'Fixed price', per_guest: 'Per guest', per_hour: 'Per hour', per_item: 'Per item' };
  const money = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US');
  const priceTxt = p => p.price == null ? 'Request a quote' : money(p.price) + (p.priceMax ? '–' + money(p.priceMax).slice(1) : '') + ({ per_guest: ' / guest', per_hour: ' / hour', per_item: ' each' }[p.unit] || '');
  const vBadge = r => r.public ? h('span', { class: 'badge booked', text: 'Live' }) : h('span', { class: 'badge ' + (r.status === 'pending' ? 'new' : r.status === 'rejected' ? 'spam' : ''), text: r.status === 'approved' ? 'Unpublished' : ({ pending: 'Waiting for approval', draft: 'Draft', rejected: 'Rejected' }[r.status] || r.status) });
  const resizeFile = file => new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = rej; fr.onload = () => { const img = new Image(); img.onerror = () => rej(new Error('That photo couldn’t be opened.')); img.onload = () => { const k = Math.min(1, 1600 / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/jpeg', .85)); }; img.src = fr.result; }; fr.readAsDataURL(file); });
  let vFilter = 'all', vQuery = '';
  async function viewVendors(main) {
    const qs = new URLSearchParams(); if (vFilter !== 'all') qs.set('status', vFilter); if (vQuery) qs.set('q', vQuery);
    const data = await call('GET', '/api/admin/vendors?' + qs);
    const search = h('input', { type: 'search', placeholder: 'Search name, id or partner email', value: vQuery, 'aria-label': 'Search providers' }); let st;
    search.addEventListener('input', () => { clearTimeout(st); st = setTimeout(() => { vQuery = search.value; renderApp(); }, 350); });
    main.append(h('div', { class: 'bar' }, h('div', { class: 'tabs', role: 'group', 'aria-label': 'Filter' }, ...Object.entries(VSTATUS).map(([k, l]) => h('button', { class: 'tab', type: 'button', 'aria-pressed': String(vFilter === k), text: l, on: { click: () => { vFilter = k; renderApp(); } } }))), search,
        h('button', { class: 'btn', type: 'button', text: 'Add provider', on: { click: () => editVendor(null, data) } })),
      h('p', { class: 'muted', text: 'A listing is public only when it is approved, published, and the provider’s agreement is recorded. Approval never verifies a business: use “Verify” only after you have checked it. Demo listings are samples and can’t be verified.' }),
      table([['name', 'Provider', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: r.owner ? `${r.owner.email} · ${r.id}` : `Managed by MA3AK · ${r.id}` }))], ['category', 'Category'], ['status', 'Status', vBadge],
        ['flags', 'Flags', r => h('div', { class: 'row' }, r.isDemo ? h('span', { class: 'badge', text: 'Demo' }) : '', r.verified ? h('span', { class: 'badge booked', text: 'Verified' }) : '', r.featured ? h('span', { class: 'badge new', text: 'Featured' }) : '', r.changedSinceApproval ? h('span', { class: 'badge new', text: 'Edited since approval' }) : '', !r.consent ? h('span', { class: 'badge spam', text: 'No agreement' }) : '')],
        ['packages', 'Packages'], ['photos', 'Photos'], ['newQuotes', 'New quotes'], ['updatedAt', 'Updated', r => fmt(r.updatedAt)]], data.vendors, r => openVendor(r.id, data)));
  }
  async function openVendor(id, meta) {
    const { vendor: v, owner } = await call('GET', `/api/admin/vendors/${encodeURIComponent(id)}`);
    const note = h('input', { placeholder: 'Note for the provider (shown on their partner page when rejecting)', maxlength: 1000, value: v.reviewNote || '' });
    const act = (action, label, cls = 'btn ghost', confirmMsg) => h('button', { class: cls, type: 'button', text: label, on: { click: async () => { if (confirmMsg && !confirm(confirmMsg)) return; try { await call('POST', `/api/admin/vendors/${encodeURIComponent(v.id)}/review`, { action, note: note.value }); toast('Saved'); d.remove(); renderApp(); openVendor(v.id, meta); } catch (x) { toast(x.message); } } } });
    const isLive = v.status === 'approved' && v.active && v.consentAt;
    const pkList = h('div', { class: 'grid3' }, ...v.packages.map(p => h('div', { class: 'card' }, h('b', { text: p.name }), h('p', { class: 'pv', text: `${priceTxt(p)}${p.active ? '' : ' · hidden'}` }), p.description ? h('p', { class: 'muted', text: p.description }) : '',
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', text: 'Edit', on: { click: () => editPackage(v, p) } }), h('button', { class: 'btn danger', type: 'button', text: 'Delete', on: { click: async () => { if (!confirm('Delete this package? Plans that include it keep their saved price.')) return; await call('DELETE', `/api/admin/vendors/${encodeURIComponent(v.id)}/packages/${p.id}`); toast('Deleted'); d.remove(); openVendor(v.id, meta); } } })))));
    const photoIn = h('input', { type: 'file', accept: 'image/jpeg,image/png', multiple: true, on: { change: async e => { for (const f of [...e.target.files].slice(0, 10)) { try { await call('POST', `/api/admin/vendors/${encodeURIComponent(v.id)}/photos`, { image: await resizeFile(f), alt: '' }); } catch (x) { toast(x.message); break; } } toast('Photos uploaded'); d.remove(); openVendor(v.id, meta); } } });
    const photos = h('div', { class: 'imgs' }, ...v.photos.map(p => h('figure', {}, h('img', { src: p.src, alt: p.alt || '' }), h('figcaption', {}, h('button', { class: 'btn danger', type: 'button', text: 'Delete photo', on: { click: async () => { if (!confirm('Delete this photo?')) return; await call('DELETE', `/api/admin/vendors/${encodeURIComponent(v.id)}/photos/${p.id}`); toast('Deleted'); d.remove(); openVendor(v.id, meta); } } })))));
    const d = drawer(v.name,
      h('p', { class: 'meta', text: `${v.category} · ${v.locations.join(', ') || 'no areas'} · created ${fmt(v.createdAt)}${v.submittedAt ? ' · submitted ' + fmt(v.submittedAt) : ''}${v.approvedAt ? ' · approved ' + fmt(v.approvedAt) : ''}` }),
      h('div', { class: 'card' }, h('h3', { text: 'Review' }), h('div', { class: 'row' }, vBadge({ public: isLive, status: v.status }), v.isDemo ? h('span', { class: 'badge', text: 'Demo listing' }) : '', v.verified ? h('span', { class: 'badge booked', text: 'Verified' }) : '', v.changedSinceApproval ? h('span', { class: 'badge new', text: 'Edited by the provider since approval' }) : '', v.consentAt ? h('span', { class: 'pv', text: 'Agreement recorded ' + fmt(v.consentAt) + (v.consentNote ? ' (' + v.consentNote + ')' : '') }) : h('span', { class: 'badge spam', text: 'No agreement recorded' })),
        h('label', {}, 'Review note', note),
        h('div', { class: 'row' }, v.status !== 'approved' ? act('approve', 'Approve and publish', 'btn') : '', v.status !== 'rejected' ? act('reject', 'Reject', 'btn danger', 'Reject this listing? It will be hidden.') : '',
          v.status === 'approved' && v.active ? act('unpublish', 'Unpublish') : '', v.status === 'approved' && !v.active ? act('publish', 'Publish') : '',
          !v.isDemo ? (v.verified ? act('unverify', 'Remove verified badge') : act('verify', 'Mark as verified', 'btn ghost', 'Only verify a business you have actually checked. Continue?')) : '', v.featured ? act('unfeature', 'Remove from homepage') : act('feature', 'Feature on homepage'))),
      owner ? h('div', { class: 'card' }, h('h3', { text: 'Partner account' }), h('p', { class: 'meta', text: `${owner.name} · ${owner.email}${owner.phone ? ' · ' + owner.phone : ''} · joined ${fmt(owner.created_at)}` })) : h('p', { class: 'muted', text: 'Managed by MA3AK (no partner account).' }),
      h('div', { class: 'card' }, h('div', { class: 'row' }, h('h3', { text: `Packages (${v.packages.length})` }), h('button', { class: 'btn', type: 'button', text: 'Add package', on: { click: () => editPackage(v, null) } })), v.packages.length ? pkList : h('p', { class: 'muted', text: 'No packages yet.' })),
      h('div', { class: 'card' }, h('h3', { text: `Photos (${v.photos.length}/10)` }), h('label', {}, 'Upload photos (JPG/PNG; resized, location data removed)', photoIn), photos),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', text: 'Edit profile', on: { click: () => { d.remove(); editVendor(v, meta); } } }), isLive ? h('a', { class: 'btn ghost', href: `/#/vendor/${encodeURIComponent(v.id)}`, target: '_blank', rel: 'noopener', text: 'View public profile' }) : '',
        h('button', { class: 'btn danger', type: 'button', text: 'Delete provider', on: { click: async () => { if (!confirm(`Delete ${v.name}, its packages, photos and quote requests permanently?`)) return; await call('DELETE', `/api/admin/vendors/${encodeURIComponent(v.id)}`); toast('Provider deleted'); d.remove(); renderApp(); } } })));
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
      h('div', { class: 'card consent-box' }, flag('consent', 'The provider agreed to be listed on MA3AK', it ? it.consentAt : false), inp('consentNote', 'How they agreed (e.g. signed form, email on 4 Oct)', it?.consentNote)),
      it ? '' : flag('active', 'Publish now (requires the agreement above)', false), flag('isDemo', 'Demo listing (sample, not a real business; never verified)', it?.isDemo), err,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: 'Save provider', on: { click: async () => { err.textContent = '';
        const body = { name: f.name.value, category: f.category.value, locations: f.locations.filter(c => c.checked).map(c => c.value), eventTypes: f.eventTypes.filter(c => c.checked).map(c => c.value), services: f.services.value, description: f.description.value, about: f.about.value, availabilityNote: f.availabilityNote.value,
          capacityMin: f.capacityMin.value, capacityMax: f.capacityMax.value, phone: f.phone.value, whatsapp: f.whatsapp.value, instagram: f.instagram.value, website: f.website.value, email: f.email.value, consent: f.consent.checked, consentNote: f.consentNote.value,
          active: it ? it.active : f.active.checked, featured: it ? it.featured : false, verified: it ? it.verified : false, isDemo: f.isDemo.checked };
        try { await call('PUT', `/api/admin/vendors/${encodeURIComponent(f.id.value.trim())}`, body); toast('Provider saved'); d.remove(); renderApp(); openVendor(f.id.value.trim(), meta); }
        catch (x) { err.textContent = x.message + (x.fields ? ' ' + Object.entries(x.fields).map(([k, m]) => `${k}: ${m}`).join(', ') : ''); } } } }))));
  }
  function editPackage(v, p) {
    const name = h('input', { value: p?.name || '' }), unit = h('select', {}, ...Object.entries(UNITS).map(([k, l]) => h('option', { value: k, text: l, selected: (p?.unit || 'flat') === k })));
    const price = h('input', { type: 'number', min: 0, value: p?.price ?? '' }), max = h('input', { type: 'number', min: 0, value: p?.priceMax ?? '' }), minQty = h('input', { type: 'number', min: 1, value: p?.minQty ?? '' });
    const desc = h('textarea', { rows: 3 }); desc.value = p?.description || ''; const inc = h('textarea', { rows: 4 }); inc.value = (p?.includes || []).join('\n');
    const active = h('input', { type: 'checkbox' }); active.checked = p ? p.active : true; const err = h('p', { class: 'err', role: 'alert' });
    const d = drawer(p ? 'Edit package' : 'New package for ' + v.name, h('div', { class: 'card form2' }, h('label', {}, 'Name', name), h('label', {}, 'Priced', unit),
      h('div', { class: 'row' }, h('label', {}, 'Price from (USD, empty = request a quote)', price), h('label', {}, 'Up to (optional)', max), h('label', {}, 'Minimum quantity', minQty)),
      h('label', {}, 'Description', desc), h('label', {}, 'What’s included (one per line)', inc), h('label', { class: 'chk' }, active, 'Show this package'), err,
      h('button', { class: 'btn', type: 'button', text: 'Save package', on: { click: async () => { try { await call('PUT', `/api/admin/vendors/${encodeURIComponent(v.id)}/packages/${p ? p.id : 'new'}`, { name: name.value, unit: unit.value, price: price.value, priceMax: max.value, minQty: minQty.value, description: desc.value, includes: inc.value.split('\n'), active: active.checked }); toast('Package saved'); d.remove(); document.querySelectorAll('.drawer').forEach(x => x.remove()); openVendor(v.id, await call('GET', '/api/admin/vendors')); } catch (x) { err.textContent = x.message; } } } })));
  }
  // ---------- quote requests ----------
  const QSTAT = { new: 'New', replied: 'Replied', quoted: 'Quoted', accepted: 'Accepted', declined: 'Declined', closed: 'Closed' };
  let qFilter = '';
  async function viewQuotes(main) {
    const { quotes } = await call('GET', '/api/admin/quotes' + (qFilter ? '?status=' + qFilter : ''));
    main.append(h('div', { class: 'bar' }, h('div', { class: 'tabs', role: 'group', 'aria-label': 'Status' }, ...[['', 'All'], ...Object.entries(QSTAT)].map(([k, l]) => h('button', { class: 'tab', type: 'button', 'aria-pressed': String(qFilter === k), text: l, on: { click: () => { qFilter = k; renderApp(); } } })))),
      h('p', { class: 'muted', text: 'Requests to partner-managed providers are answered by the partner. Requests to demo listings and MA3AK-managed providers are answered here.' }),
      table([['ref', 'Request', r => h('div', {}, h('b', { text: r.ref }), h('div', { class: 'pv', text: fmt(r.created_at) }))], ['vendor_name', 'Provider', r => h('div', {}, r.vendor_name, r.is_demo ? h('span', { class: 'badge', text: ' Demo' }) : '', !r.has_owner ? h('div', { class: 'pv', text: 'Answered by MA3AK' }) : '')],
        ['name', 'Customer', r => h('div', {}, h('b', { text: r.name }), h('div', { class: 'pv', text: [r.email, r.phone].filter(Boolean).join(' · ') }))], ['event_date', 'Date'], ['guests', 'Guests'], ['status', 'Status', r => h('span', { class: 'badge ' + (r.status === 'new' ? 'new' : ['quoted', 'accepted'].includes(r.status) ? 'booked' : ''), text: QSTAT[r.status] })]], quotes, r => {
        const status = h('select', {}, ...Object.entries(QSTAT).map(([k, l]) => h('option', { value: k, text: l, selected: r.status === k }))), amount = h('input', { type: 'number', value: r.quoted_amount ?? '' }), reply = h('textarea', { rows: 4 }); reply.value = r.reply || '';
        const d = drawer('Quote request ' + r.ref, h('p', { class: 'meta', text: `${r.vendor_name}${r.package_name ? ' · ' + r.package_name : ''} · ${fmt(r.created_at)}` }),
          h('div', { class: 'card' }, h('pre', { class: 'summary', text: [`Customer: ${r.name}`, r.email && `Email: ${r.email}`, r.phone && `Phone: ${r.phone}`, r.event_date && `Date: ${r.event_date}`, r.guests && `Guests: ${r.guests}`, r.location && `Area: ${r.location}`, '', r.message || '(no message)'].filter(x => x !== null && x !== undefined && x !== false).join('\n') })),
          h('div', { class: 'card form2' }, h('label', {}, 'Status', status), h('label', {}, 'Quoted amount (USD)', amount), h('label', {}, 'Reply shown to the customer', reply),
            h('button', { class: 'btn', type: 'button', text: 'Save', on: { click: async () => { try { await call('PATCH', `/api/admin/quotes/${r.id}`, { status: status.value, quotedAmount: amount.value === '' ? null : +amount.value, reply: reply.value }); toast('Saved'); d.remove(); renderApp(); } catch (x) { toast(x.message); } } } })));
      }));
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
      list('themes', 'Themes', [['name', 'Name'], ['description', 'Description'], ['colors', 'Colours (hex codes separated by commas, e.g. #F4EFE6, #C9A45C)']], s.themes));
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
