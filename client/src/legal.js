/* =========================================================
   PRIVACY POLICY & TERMS (plain-language; have a lawyer review before launch)
   ========================================================= */
function LegalPage(title, intro, sections){
  return `<section class="page-hero"><div class="wrap" style="max-width:820px">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${title}</span></nav>
    <h1 class="h1">${title}</h1><p class="lede">${intro}</p><p class="small muted" style="margin-top:1rem">Last updated ${CONFIG.updated}</p></div></section>
    <section class="section tight" style="padding-top:0"><div class="wrap legal" style="max-width:820px">${sections.map(([h, body]) => `<h2 class="h3">${h}</h2>${body}`).join('')}</div></section>`;
}
const Privacy = {
  title:'Privacy Policy | Ma3ak',
  render(){ return LegalPage('Privacy Policy', 'How MA3AK collects, uses, and protects your information.', [
    ['Who we are', `<p>MA3AK is an event-planning platform based in Lebanon. Contact us at <a class="link" href="mailto:${CONFIG.email}">${CONFIG.email}</a> or ${CONFIG.phone}.</p>`],
    ['What we collect', `<p>Only what you send us through our forms: your name, email, phone number, your event details and choices, your 3D design, and any venue photo you upload. Vendor applications include business details. We also keep a one-way hashed form of your network address to stop abuse; we can’t turn it back into your address.</p>`],
    ['What stays on your device', `<p>Your plans, event designs, and draft forms are saved in your browser’s local storage so you don’t lose your work. They aren’t sent to us until you submit a form. You can clear them below at any time.</p><p><button type="button" class="btn btn-ghost btn-sm" id="clear-local">Clear data saved on this device</button></p>`],
    ['How we use it', `<p>To answer your messages, prepare and arrange your event with providers, process vendor applications, and keep the service secure. We don’t sell your information and we don’t use advertising trackers.</p>`],
    ['Sharing', `<p>When you request a booking or ask us to arrange an event, we share the necessary details with the providers involved. We use hosting and, if enabled, an email delivery provider to run the service. We don’t share your information otherwise unless required by law.</p>`],
    ['Photos', `<p>Venue photos and design images you upload are stored privately. We remove hidden location and camera information from photos when they arrive. Only MA3AK’s team can see them.</p>`],
    ['How long we keep it', `<p>Requests are kept for up to two years and then deleted automatically, unless you ask us to delete them sooner.</p>`],
    ['Security', `<p>All traffic is encrypted. Data is stored on a private server, admin access is protected by strong passwords and secure sessions, and every change is logged.</p>`],
    ['Your rights', `<p>You can ask to see, correct, or delete your information by emailing <a class="link" href="mailto:${CONFIG.email}">${CONFIG.email}</a>. We’ll respond within 30 days.</p>`],
    ['Fonts', `<p>Our website loads fonts from Google Fonts, which receives your network address when the page loads.</p>`],
    ['Changes', `<p>If we change this policy, we’ll update the date above.</p>`]
  ]); },
  mount(root){ const b = $('#clear-local', root); if (b) b.addEventListener('click', () => { try { ['ma3ak:v1','ma3ak:photo','ma3ak:style'].forEach(k => localStorage.removeItem(k)); } catch(e){} toast('Data on this device cleared'); setTimeout(() => location.reload(), 600); }); }
};
const Terms = {
  title:'Terms | Ma3ak',
  render(){ return LegalPage('Terms of Use', 'The rules for using MA3AK.', [
    ['The service', `<p>MA3AK helps you plan events and connects you with independent event providers in Lebanon. Providers set their own prices, packages, availability, and terms. Agreements for services are between you and the provider.</p>`],
    ['Estimates and designs', `<p>Budget splits, 3D designs, and illustrations are planning tools and examples, not quotes or guarantees. Final details, prices, and availability are confirmed directly with providers.</p>`],
    ['Your content', `<p>You’re responsible for what you submit, including photos. Only upload photos you have the right to share. You allow MA3AK to use your submissions to answer and arrange your request.</p>`],
    ['Acceptable use', `<p>Don’t misuse the service: no spam, false information, attempts to break security, or automated scraping.</p>`],
    ['Vendors', `<p>Vendors confirm that their business information, prices, and photos are accurate and that they have the right to publish them.</p>`],
    ['Liability', `<p>MA3AK isn’t responsible for services delivered by independent providers. To the extent allowed by law, the service is provided as is.</p>`],
    ['Contact', `<p>Questions about these terms: <a class="link" href="mailto:${CONFIG.email}">${CONFIG.email}</a>.</p>`]
  ]); }
};
