// Bundles the client (no dependencies): concatenates sources into fingerprinted assets
// and writes public/index.html with no inline scripts (strict Content-Security-Policy).
import fs from 'node:fs';
import crypto from 'node:crypto';

const SRC = 'client/src/', OUT = 'public/';
const ORDER = ['data','logo','core','scene','gl3d','scenes3d','viewer3d','pages1','pages2','legal','customize','studio','game','account','ai-chat','i18n','market','bookings','pages3'];
const js = '"use strict";\n' + ORDER.map(n => `/* ---- ${n}.js ---- */\n` + fs.readFileSync(SRC + n + '.js', 'utf8').replace(/^'use strict';\n/, '')).join('\n');
const css = fs.readFileSync(SRC + 'style.css', 'utf8') + '\n' + fs.readFileSync(SRC + 'game.css', 'utf8') + '\n' + fs.readFileSync(SRC + 'platform.css', 'utf8');
const h = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
fs.mkdirSync(OUT + 'assets', { recursive: true });
fs.writeFileSync(OUT + 'assets/app.js', js); fs.writeFileSync(OUT + 'assets/app.css', css);
const shell = fs.readFileSync(SRC + 'index.html', 'utf8').replace('%CSS%', `/assets/app.css?v=${h(css)}`).replace('%JS%', `/assets/app.js?v=${h(js)}`).replaceAll('%ORIGIN%', (process.env.PUBLIC_ORIGIN || '').split(',')[0].trim().replace(/\/$/, ''));
fs.writeFileSync(OUT + 'index.html', shell);
console.log(`Built app.js (${(js.length/1024).toFixed(0)} KB), app.css (${(css.length/1024).toFixed(0)} KB)`);
