/* =========================================================
   MA3AK 3D EVENT STUDIO
   The customer's choices build the venue live in 3D, and they
   can drag & drop, move, rotate, duplicate, and delete items.
   ========================================================= */
const ST = (() => {
  const C = S3.C, mdl = C.mdl, rnd = C.rnd, pick = C.pick;
  let W = 20, D = 16;                   // venue footprint, changes with the chosen size; back = -z
  const SIZES = { 'Small (up to 100)':[20,16], 'Medium (up to 200)':[28,22], 'Large (up to 400)':[36,28], 'Extra large (700+)':[46,34] };
  const sizeOf = v => SIZES[v.venueSize] || (() => { const g = +v.guests || 0; return g > 420 ? SIZES['Extra large (700+)'] : g > 210 ? SIZES['Large (up to 400)'] : g > 100 ? SIZES['Medium (up to 200)'] : SIZES['Small (up to 100)']; })();
  const PAL = Object.fromEntries(CZ_PALETTE);
  const lighten = (hex, k) => { const h = hex.replace('#',''); return '#' + [0,2,4].map(i => Math.round(parseInt(h.slice(i,i+2),16) + (255 - parseInt(h.slice(i,i+2),16))*k).toString(16).padStart(2,'0')).join(''); };

  /* ---------- context from choices ---------- */
  function makeCtx(v){
    const cols = (v.colors || []).map(n => PAL[n]).filter(Boolean);
    const c1 = cols[0] || '#F4EFE6', c2 = cols[1] || '#F2D3CC', c3 = cols[2] || '#C8A96B';
    const lin = (v.linens || [])[0];
    const linen = lin === 'White' ? '#F8F6F1' : lin === 'Colored (from palette)' ? lighten(c1,.25) : lin === 'Velvet' ? c1 : lin === 'Sequins' ? '#CDBA8E' : '#F3EEE5';
    const ch = (v.chairs || [])[0];
    const chair = ({ 'Gold chiavari':{ leg:'#C8A96B' }, 'Silver chiavari':{ leg:'#C9CCD1' }, 'Ghost / transparent':{ leg:'#E6EBEF', spec:1 }, 'Velvet':{ leg:'#C8A96B', seat:cols[0] || '#6B1E2A', solid:true, back:cols[0] || '#6B1E2A' }, 'Wooden cross-back':{ leg:'#7A5C42', seat:'#8B6A4C' }, 'Wishbone':{ leg:'#B08A5E', seat:'#C9A97C' }, 'Rattan':{ leg:'#C9A97C', seat:'#E5D3B0' } })[ch] || { leg:'#C8A96B' };
    const cp = v.centerpieces || [];
    const center = cp.includes('Tall arrangements') ? 'tall' : cp.includes('Candles & candelabras') ? 'candelabra' : cp.includes('Mixed heights') ? 'mixed' : 'low';
    const fl = cols.length ? cols.concat(['#FFFFFF']) : ['#FFFFFF','#F2DCD3','#EBCFC4','#F8F1E7'];
    const lvl = { Minimal:.5, Moderate:1, Lavish:1.6, 'Over the top':2.3 }[v.flowerLevel] || 1;
    const dfType = v.danceFloor || ((v.lights||[]).includes('LED dance floor') ? 'LED' : 'Glossy black');
    return { cols, c1, c2, c3, linen, chair, center, flowers:fl, lvl, dfType, bare: lin === 'No cloth (bare wood / glass)', metal: (v.tableware||[]).includes('Silver chargers') ? '#C9CCD1' : '#C8A96B', tiers: v.cakeTiers || 3 };
  }

  /* ---------- environments ---------- */
  const VENUES = {
    'Ballroom / hotel':'ballroom', 'Restaurant':'restaurant', 'Garden / green area':'garden', 'Garden':'garden', 'Rooftop':'rooftop', 'Beach / beach club':'beach', 'Mountain resort':'mountain',
    'Historic palace / château':'palace', 'Vineyard':'vineyard', 'Boat / yacht':'yacht', 'Yacht':'yacht', 'Villa / private house':'villa', 'Industrial loft':'loft', 'Tent / marquee':'tent' };
  const VENUE_LABEL = { photo:'Your photo', ballroom:'Ballroom', restaurant:'Restaurant', garden:'Green area', rooftop:'Rooftop', beach:'Beach', yacht:'Boat', mountain:'Mountain', palace:'Palace', vineyard:'Vineyard', villa:'Villa & pool', loft:'Loft', tent:'Garden tent' };
  const VENUE_PICK = [['ballroom','Ballroom / hotel','building'],['garden','Garden / green area','flower'],['beach','Beach / beach club','umbrella'],['yacht','Boat / yacht','boat'],['rooftop','Rooftop','sparkle'],['villa','Villa / private house','seat'],['mountain','Mountain resort','mountain'],['tent','Tent / marquee','tent'],['vineyard','Vineyard','glass'],['palace','Historic palace / château','building'],['restaurant','Restaurant','utensils'],['loft','Industrial loft','layers']];
  const INDOOR = new Set(['ballroom','restaurant','palace','loft']);
  function venueOf(v){
    if (v._photo) return 'photo';
    const vt = (v.venueType || []).find(x => VENUES[x]); if (vt) return VENUES[vt];
    if (v.hasVenue === 'Hosting at home / private property') return 'villa';
    if (v.setting === 'Outdoor') return 'garden';
    return ({ beach:'beach', outdoor:'garden', private:'rooftop', bachelor:'loft', 'baby-shower':'garden', engagement:'garden' })[v.eventType] || 'ballroom';
  }
  const timeOf = v => ({ Morning:'day', 'Lunch / afternoon':'day', Sunset:'sunset' })[v.timeOfDay] || 'night';
  const SKY = {
    night:{ sky:['#0b0c12','#1d1b22'], fog:'#15141a', fogD:.011, hemi:['#4a4540','#221d18',.7], sun:{ dir:[.3,1,.2], col:'#a9b8de', i:.12 }, exposure:1.2 },
    sunset:{ sky:['#4a3a5c','#F6B37E'], fog:'#E2AA88', fogD:.007, hemi:['#F2C3A0','#6a5a4a',.85], sun:{ dir:[-.7,.3,-.65], col:'#FFB680', i:1.3 }, exposure:1.05, shadow:.45 },
    day:{ sky:['#8DB7DD','#EEF2F2'], fog:'#E3EAEC', fogD:.008, hemi:['#CFE0EE','#7E8F65',.9], sun:{ dir:[.5,.85,.35], col:'#FFF4E2', i:1.5 }, exposure:1, shadow:.5 },
    indoor:{ sky:['#0c0b0a','#1a1612'], fog:'#141210', fogD:.01, hemi:['#4a4038','#2a221c',.8], sun:{ dir:[.2,1,.2], col:'#ffffff', i:.05 }, exposure:1.15 }
  };
  function tiles(g, a, b, size, s=.6, f=7){ for (let i=0;i<W/size;i++) for (let j=0;j<D/size;j++) g.plane(-W/2+i*size+size/2, 0, -D/2+j*size+size/2, size, size, (i+j)%2 ? a : b, { s, f }); }
  function ringTrees(g, kind, n=18, r0){ r0 = r0 || Math.max(W, D)/2 + 5; n = Math.round(n * Math.max(1, W/20)); for (let i=0;i<n;i++){ const a = i/n*6.283 + rnd()*.2, r = r0 + rnd()*7; C.tree(g, Math.cos(a)*r, Math.sin(a)*r, kind, 1.2 + rnd()*.5); } }
  const ENV = {
    ballroom(g, sc){ tiles(g,'#E8E0D3','#D9CEBF',2); C.wallSet(g, sc, W, D, 5.6, { wall:'#EFE8DC', base:'#D2C3A8', decor:C.panelDecor('#E8DDCB','#C8A96B',.05) }); sc.addLight([0,4.8,0],'#FFE2B8',1.1,15); },
    restaurant(g, sc){ g.box(0,0,0,W,.02,D,'#5A3E2B',{ s:.5, f:6 }); C.wallSet(g, sc, W, D, 4.6, { wall:'#3A2A22', base:'#1e1612', decor:(g,w) => { for (let x=-w/2+1.2;x<w/2;x+=2.4) g.glow(x,2.6,.25,.6,[1,.7,.35],.1,2); } }); sc.addLight([0,4,0],'#FFC98A',1.3,14); },
    palace(g, sc){ g.plane(0,0,0,W,D,'#C9BAA0',{ s:.35, f:11 }); C.wallSet(g, sc, W, D, 6.2, { wall:'#D8C8AA', base:'#B9A47F', decor:(g,w,H) => { const n = Math.floor(w/3); for (let i=0;i<n;i++){ const x = -w/2 + (i+.5)*w/n; g.box(x,0,.03,1.6,3.6,.04,'#2a2420'); g.box(x-1.05,0,.06,.32,H,.16,'#E4D6BA'); g.glow(x,3.2,.3,.5,[1,.7,.35],.1,2); } } }); sc.addLight([0,5,0],'#FFD9A6',1.2,16); },
    loft(g, sc){ g.plane(0,0,0,W,D,'#8E8A86',{ s:.5, f:10 }); C.wallSet(g, sc, W, D, 5.2, { wall:'#8C5444', wallS:.05, base:'#3a2a24', decor:(g,w,H) => { for (let y=.3;y<H;y+=.32) g.box(0,y,.012,w,.02,.01,'#7b4839'); } }); sc.addLight([0,4.5,0],'#FFD0A0',1.2,15); },
    garden(g, sc, t){ C.ground(g, 300, '#4E6B3A'); g.plane(0,.004,0,W+2,D+2,'#587A43',{ s:.05, f:5 }); ringTrees(g,'oak'); for (let x=-W/2+1;x<=W/2-1;x+=1.5) g.box(x,0,-D/2-1.4,1.4,1.2,.8,'#3F5A32'); },
    rooftop(g, sc){ const md = Math.max(26, Math.max(W,D)/2 + 8); C.skyline(g,0,0,'z',22,md); C.skyline(g,0,0,'x',18,md); C.water(g,400,'#0d1a26',-14); g.box(0,-14,0,W+1,14,D+1,'#1b1c20'); g.box(0,0,0,W,.04,D,'#7A5C42',{ s:.3, f:6 });
      [-D/2,D/2].forEach(z => { g.box(0,1.03,z,W,.05,.06,'#C8A96B',{ s:.9 }); for (let x=-W/2;x<=W/2;x+=1.6) g.tube([x,0,z],[x,1.05,z],.03,'#C8A96B',{ s:.9 }); }); [-W/2,W/2].forEach(x => g.box(x,1.03,0,.06,.05,D,'#C8A96B',{ s:.9 })); },
    beach(g, sc){ C.water(g, 420, '#2F5970', -.45); const hw = W/2 + 4, hd = D/2; g.loft([[-hw,-hd-3],[hw,-hd-3],[hw+2,hd+4],[-hw-2,hd+4]],-1,[[-hw,-hd-2],[hw,-hd-2],[hw+1,hd+4],[-hw-1,hd+4]],.02,'#E8D3AE',{ s:.1, f:8 }); g.loft([[-80,hd+4],[80,hd+4],[80,90],[-80,90]],-1,[[-80,hd+4],[80,hd+4],[80,90],[-80,90]],.02,'#E8D3AE',{ s:.1, f:8 }); [[-hw+1,-hd],[hw-1,-hd+1],[-hw,4],[hw,6],[-hw+2,hd+2]].forEach(([x,z]) => C.tree(g,x,z,'palm',1.3)); },
    mountain(g, sc){ C.ground(g,300,'#5E7347'); C.mountains(g,['#4f5d6b','#5a6876','#46525e'],Math.max(75, W*2.2),16); ringTrees(g,'pine',22); },
    vineyard(g, sc){ C.ground(g,300,'#6B7A45'); C.mountains(g,['#6d7a5a','#7a8664','#5e6a4c'],Math.max(80, W*2.2),12); for (let r=0;r<10;r++){ const z = -D/2 - 4 - r*1.6; g.box(0,0,z,W*2,.9,.35,'#4E6B3A'); for (let x=-W;x<=W;x+=2.5) g.box(x,0,z,.06,1.1,.06,'#6b5845'); } ringTrees(g,'olive',10); },
    villa(g, sc){ C.ground(g,300,'#5E7A45'); g.plane(0,.004,0,W+2,D+2,'#6E8A52',{ f:5 }); g.box(0,0,-D/2-3.5,W+2,6,3,'#EDE6DA',{ s:.2 }); for (let x=-W/2+1;x<=W/2-1;x+=2.2) for (let y of [1.2,3.8]) { g.box(x,y,-D/2-1.98,1.1,1.5,.04,'#2a2a2e',{ s:1 }); g.glow(x,y+.7,-D/2-1.9,.9,[1,.75,.4],.1,1); } g.box(0,-.4,D/2+4.5,10.6,.4,4.6,'#E8E0D3',{ s:.3, f:11 }); g.plane(0,.02,D/2+4.5,10,4,'#3E8FA8',{ s:1, f:1 },30,12); [[-W/2-2,-6],[W/2+2,-6],[-W/2-2,6],[W/2+2,7]].forEach(([x,z]) => C.tree(g,x,z,'palm',1.3)); },
    yacht(g, sc){ yachtEnv(g, sc); },
    tent(g, sc){ ENV.mountain(g, sc); g.plane(0,.004,0,W+2,D+2,'#6E8A52',{ f:5 }); tentCanopy(g); }
  };
  function yachtEnv(g, sc){
    C.water(g, 420, '#2E4C66', -1.3);
    C.mountains(g, ['#4a3b4c','#53424f','#3e3446'], Math.max(95, W*3), 10);
    for (let i=0;i<220;i++){ const a = 1.6 + rnd()*1.6, r = Math.max(70, W*2.3) + rnd()*12; g.glow(Math.cos(a)*r, rnd()*5, Math.sin(a)*r, .55, [1,.8,.5], .4, 1+rnd()); }
    const hw = W/2, hd = D/2, stern = hw + 6.5, bow = hw + Math.max(5, W*.3);
    const hull = [[-stern,-hd-.9],[hw+1,-hd-.9],[bow*.86+hw*.14,-hd*.45],[bow,0],[bow*.86+hw*.14,hd*.45],[hw+1,hd+.9],[-stern,hd+.9]];
    const sc_ = k => hull.map(([x,z]) => [x*k, z*k]);
    g.loft(sc_(.88), -2.8, hull, -.03, '#F7F6F3', { s:.85 }, false);
    g.loft(sc_(1.004), -1.05, sc_(1.004), -.8, '#1F3A57', { s:.7 }, false);
    g.loft(hull, -.03, hull, 0, '#B08A5E', { s:.35, f:6 });
    for (let i=0;i<hull.length;i++){ const a = hull[i], b = hull[(i+1)%hull.length]; g.tube([a[0],1.05,a[1]],[b[0],1.05,b[1]],.035,'#E6E6E6',{ s:1 }); const L = Math.hypot(b[0]-a[0], b[1]-a[1]); for (let k=0;k<L;k+=1.6){ const t = k/L; g.tube([a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,1.05,a[1]+(b[1]-a[1])*t],.025,'#E6E6E6',{ s:1 }); } }
    g.box(-hw-3.3,0,0,5.2,2.4,D*.7,'#F7F6F3',{ s:.6 }); g.box(-hw-3.3,1.2,D*.35+.01,4.8,.7,.02,'#1c2a38',{ s:1 }); g.box(-hw-3.3,1.2,-D*.35-.01,4.8,.7,.02,'#1c2a38',{ s:1 });
    g.box(-hw-3.6,2.4,0,4.4,.1,D*.6,'#F7F6F3',{ s:.5 }); g.box(-hw-4.6,2.5,0,1.2,1.4,.12,'#E6E6E6',{ s:.8 }); g.tube([-hw-3.6,2.5,0],[-hw-3.6,5.5,0],.06,'#dcdcdc',{ s:1 });
    for (let i=0;i<8;i++){ g.glow(-hw-1.2 + rnd()*.1, .9 + rnd()*1.2, (rnd()-.5)*D*.6, .5, [1,.78,.45], .2, 1); }
  }
  function tentCanopy(g){
    const sx = W/20, sz = D/16;
    const peaks = [[-5*sx,0],[5*sx,0]], H = 7 + (sx-1)*2, E = 3.2, edge = [[-10.5,-8.5],[-5,-9],[0,-8.6],[5,-9],[10.5,-8.5],[11,0],[10.5,8.5],[5,9],[0,8.6],[-5,9],[-10.5,8.5],[-11,0]].map(([x,z]) => [x*sx, z*sz]);
    peaks.forEach(([x,z]) => g.tube([x,0,z],[x,H,z],.1,'#8a6b4a')); edge.forEach(([x,z]) => g.tube([x,0,z],[x,E,z],.07,'#8a6b4a'));
    for (let i=0;i<edge.length;i++){ const a = edge[i], b = edge[(i+1)%edge.length], p = (a[0]+b[0])/2 < 0 ? peaks[0] : peaks[1]; g.quad([a[0],E,a[1]],[b[0],E,b[1]],[p[0],H,p[1]],[p[0],H,p[1]],'#F4EEE3',{ s:.15, e:.12 }); }
    g.quad([peaks[0][0],H,0],[peaks[1][0],H,0],[0,E,8.6*sz],[0,E,8.6*sz],'#F4EEE3',{ s:.15, e:.12 }); g.quad([peaks[0][0],H,0],[peaks[1][0],H,0],[0,E,-8.6*sz],[0,E,-8.6*sz],'#F4EEE3',{ s:.15, e:.12 });
  }
  function photoDef(v, ctx){
    const t = ({ Sunset:'sunset', Evening:'night', 'Late night':'night' })[v.timeOfDay] || 'day';
    const L = { day:{ hemi:['#E6ECF2','#9A8F7E',1.0], sun:{ dir:[.45,.85,.35], col:'#FFF4E2', i:1.25 }, exposure:1 }, sunset:{ hemi:['#F2CFB4','#7a6a5a',.95], sun:{ dir:[-.6,.45,-.5], col:'#FFB680', i:1.15 }, exposure:1 }, night:{ hemi:['#5a5650','#2a241e',.9], sun:{ dir:[.3,1,.2], col:'#FFD9A6', i:.35 }, exposure:1.2 } }[t];
    const sizeName = Object.keys(SIZES).find(k => SIZES[k][0] === W) || '';
    return { venue:'photo', time:t, indoor:false, label:`Your photo, ${sizeName.split(' (')[0].toLowerCase()}`, sig:['photo', t, W, D, (v.lights||[]).join(), ctx.cols.join()].join('|'),
      def:{ ...L, sky:['#808080','#808080'], fog:'#000000', fogD:0, photo:true, shadow:.5, shadowAmb:.25, catchK:.6, clouds:0, sunVis:0, ledA:GL3D.hexD(ctx.cols[0] || '#FF8A3D'), ledB:GL3D.hexD(ctx.cols[1] || '#C9A0FF'),
        shadowBox:{ cx:0, cz:0, half:Math.max(W, D)/2 + 4 }, cam:{ target:[0,0,0], r:22, phi:.4, theta:Math.PI/2, fov:1 },
        build(g, sc){
          sc.dynamic(g => g.plane(0,0,0,W*4,D*4,'#000000',{ f:13 },1,1), () => mdl({}), { catcher:true, noShadow:true });
          sc.dynamic(g => { const c = '#C8A96B'; for (let x=-W/2;x<=W/2+.01;x+=2) g.box(x,.01,0,.03,.005,D,c,{ e:1.5 }); for (let z=-D/2;z<=D/2+.01;z+=2) g.box(0,.01,z,W,.005,.03,c,{ e:1.5 }); }, () => ST._grid ? mdl({}) : null, { additive:true, noShadow:true });
          if ((v.lights||[]).includes('String / fairy lights')) for (let i=0;i<=Math.round(D/2.6);i++) C.stringLights(g, [-W/2, 4.2, -D/2 + i*2.6], [W/2, 4.2, -D/2 + i*2.6 + 1.3], .7, Math.round(W*1.1));
        } } };
  }
  function envDef(v, ctx){
    if (v._photo) return photoDef(v, ctx);
    const venue = venueOf(v), indoor = INDOOR.has(venue), time = indoor ? 'indoor' : timeOf(v), L = v.lights || [];
    const sizeName = Object.keys(SIZES).find(k => SIZES[k][0] === W) || '';
    const sky = SKY[time];
    const ledA = GL3D.hexD(ctx.cols[0] && ctx.cols[0] !== '#FFFFFF' ? ctx.cols[0] : '#FF8A3D'), ledB = GL3D.hexD(ctx.cols[1] || '#C9A0FF');
    return { venue, time, indoor, label:`${VENUE_LABEL[venue]}, ${indoor ? 'indoors' : ({ day:'day', sunset:'sunset', night:'night' })[time]}, ${sizeName.split(' (')[0].toLowerCase()}`,
      sig:[venue, time, W, D, L.join(), (v.extrasDecor||[]).join(), (v.technical||[]).includes('Tent / marquee'), ctx.cols.join()].join('|'),
      def:{ ...sky, ledA, ledB, shadowBox:{ cx:0, cz:0, half:Math.max(W, D)/2 + 4 }, shadowAmb: time === 'day' ? .3 : time === 'sunset' ? .35 : .5, cam:{ target:[0,.5,0], r:22, phi:.62, theta:.9, fov:.72 },
        build(g, sc){
          ENV[venue](g, sc, time);
          if (time === 'night' && !indoor) C.stars(g, 160);
          if (!indoor && venue !== 'tent' && (v.technical||[]).includes('Tent / marquee')) tentCanopy(g);
          const h = indoor ? 4.6 : 4.2;
          if (L.includes('String / fairy lights')){
            if (!indoor) [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2],[0,-D/2],[0,D/2]].forEach(([x,z]) => g.tube([x,0,z],[x,h+.1,z],.04,'#2a2622'));
            const ns = Math.round(D/2.6); for (let i=0;i<=ns;i++) C.stringLights(g, [-W/2, h, -D/2 + i*D/ns], [W/2, h, -D/2 + Math.min(D, (i+.5)*D/ns)], .7, Math.round(W*1.1));
            sc.addLight([0,h-.5,0],'#FFC98A',1.2,14);
          }
          const up = L.includes('Colored uplighting') ? (ctx.cols[0] && ctx.cols[0] !== '#FFFFFF' ? GL3D.hexD(ctx.cols[0]) : [.7,.4,1]) : L.includes('Warm uplighting') ? [1,.62,.3] : null;
          if (up){ for (let x=-W/2+1.2;x<W/2;x+=2.4) [-D/2+.3, D/2-.3].forEach(z => { g.glow(x,.4,z,1.4,up.map(c=>c*.5),.2,1); g.glow(x,2.2,z,2.2,up.map(c=>c*.18)); }); for (let z=-D/2+1.4;z<D/2;z+=2.4) [-W/2+.3, W/2-.3].forEach(x => { g.glow(x,.4,z,1.4,up.map(c=>c*.5),.2,1); g.glow(x,2.2,z,2.2,up.map(c=>c*.18)); });
            const hx = '#' + up.map(c => Math.round(Math.min(1,c)*255).toString(16).padStart(2,'0')).join(''); sc.addLight([-W/2+1,2,0], hx, 1.4, 9); sc.addLight([W/2-1,2,0], hx, 1.4, 9); }
          if (L.includes('Spotlights')) [-4,0,4].forEach((x,i) => sc.dynamic(g => g.cyl(0,-6,0,1.1,.06,6,'#2a2416',{ e:1, s:0 },16,false), t => mdl({ x, y:6.2, z:-1, rz:Math.sin(t*.5+i*2)*.3, rx:.2+Math.sin(t*.4+i)*.2 }), { additive:true }));
          if ((v.extrasDecor||[]).some(x => /Ceiling|Hanging/.test(x))) for (let x=-6;x<=6;x+=3) for (let z=-4;z<=4;z+=4){ g.tube([x,h+.8,z],[x,h-.6,z],.008,'#9aa38c'); C.flowers(g, x, h-.9, z, .45, ctx.flowers.concat(['#6B8A5E']), 14); }
        } } };
  }

  /* ---------- item catalog (front faces +z) ---------- */
  const T = (g, o, fn) => g.at(o, fn);
  const person = (g, sc, x, z, o={}) => C.person(g, sc, x, z, o);
  const ITEMS = {
    round:{ name:'Round table', icon:'users', cat:'tables', r:1.65, build:(g,sc,p,c) => C.roundTable(g, 0, 0, { cloth:c.bare ? '#6b5139' : c.linen, chair:c.chair, flowers:c.flowers, center:c.center === 'mixed' ? pick(['tall','low']) : c.center, metal:c.metal }) },
    long:{ name:'Long table (10)', icon:'users', cat:'tables', r:2.3, build:(g,sc,p,c) => C.longTable(g, 0, 0, 3.6, 0, { cloth:c.linen, wood:c.bare ? '#7A5C42' : null, chair:c.chair, flowers:c.flowers }) },
    imperial:{ name:'Imperial table (20)', icon:'users', cat:'tables', r:3.9, build:(g,sc,p,c) => C.longTable(g, 0, 0, 7.4, 0, { cloth:c.linen, wood:c.bare ? '#7A5C42' : null, chair:c.chair, flowers:c.flowers, candelabras:c.center === 'candelabra' ? 3 : 0, tall:c.center === 'tall' }) },
    cocktail:{ name:'Cocktail table', icon:'glass', cat:'tables', r:.9, build:(g,sc,p,c) => { g.tube([0,0,0],[0,1.05,0],.04,'#1b1a19',{ s:.8 }); g.cyl(0,1.05,0,.38,.38,.04,c.linen,{ s:.3 }); C.flowers(g,0,1.12,0,.12,c.flowers,4); C.candle(g,.15,1.09,.1); g.shadow(0,0,.5,.4); } },
    sweetheart:{ name:'Sweetheart table', icon:'heart', cat:'tables', r:1.3, build:(g,sc,p,c) => { g.box(0,0,0,1.8,.76,.8,c.linen,{ s:.1 }); C.chair(g,-.4,-.6,Math.PI,c.chair); C.chair(g,.4,-.6,Math.PI,c.chair); C.flowers(g,0,.5,.45,.35,c.flowers,Math.round(16*c.lvl)); C.candle(g,-.5,.77,0,.3); C.candle(g,.5,.77,0,.3); g.shadow(0,0,1,.4,1.2,.7); } },
    kidstable:{ name:'Kids’ table', icon:'gift', cat:'tables', r:1.3, build:(g,sc,p,c) => { g.box(0,0,0,1.6,.5,.8,'#FFFFFF',{ s:.1 }); [[-.5,-.65],[0,-.65],[.5,-.65],[-.5,.65],[0,.65],[.5,.65]].forEach(([x,z],i) => g.cyl(x,0,z,.16,.16,.3,['#F3C6CF','#AFCBE3','#F7E3A1','#B9DDB5'][i%4],{ s:.3 })); C.balloon(g,.7,1.4,0,.2,'#F3C6CF',{ string:.5 }); g.shadow(0,0,1,.4,1.1,.8); } },
    rows:{ name:'Rows of chairs', icon:'users', cat:'tables', r:2.6, build:(g,sc,p,c) => { for (let r=0;r<4;r++) for (let k=0;k<6;k++){ if (k===3) continue; C.chair(g, -2.4 + k*.95, -1.6 + r*1.05, 0, c.chair); } } },
    sofa:{ name:'Lounge set', icon:'seat', cat:'tables', r:2.1, build:(g,sc,p,c) => { C.sofa(g,0,-1.1,Math.PI,2.6,lighten(c.c1,.2) === '#ffffff' ? '#E7E0D5' : lighten(c.c1,.3)); C.sofa(g,-1.5,.2,Math.PI/2,1.8,'#E7E0D5'); C.sofa(g,1.5,.2,-Math.PI/2,1.8,'#E7E0D5'); g.box(0,0,0,1.1,.38,.7,'#C8A96B',{ s:.8 }); C.candle(g,0,.38,0,.15); C.flowers(g,.25,.4,0,.12,c.flowers,4); } },
    stage:{ name:'Stage', icon:'mic', cat:'stage', r:3.2, build:(g,sc,p,c) => { C.stage(g,0,0,6,3,.6,'#1a1918',{ led:c.metal }); g.box(0,.6,-1.45,6,.04,.08,c.metal,{ s:.9 }); } },
    kosha:{ name:'Kosha (couple’s stage)', icon:'heart', cat:'stage', r:3.4, build:(g,sc,p,c) => { C.stage(g,0,0,6.4,2.6,.45,'#EFE8DC',{ s:.5 }); T(g,{ y:.45 }, g => { C.floralArch(g,0,-.9,0,4.2,3.2,c.flowers.concat(['#DDE5D3'])); C.sofa(g,0,-.55,Math.PI,2.2,'#F4EFE6',{ pillow:lighten(c.c2,.3) }); }); for (let i=0;i<Math.round(6*c.lvl);i++) C.flowers(g,-3+rnd()*6,.45,1.1+rnd()*.15,.25,c.flowers,5); C.candle(g,-2.8,.45,1,.35); C.candle(g,2.8,.45,1,.35); sc.addLight([0,2.5,1.2],'#FFE2B8',1.2,6); } },
    dj:{ name:'DJ booth', icon:'music', cat:'stage', r:1.9, build:(g,sc,p,c) => { T(g,{ ry:Math.PI }, g => C.djBooth(g, sc, 0, 0, 0, { led:c.metal })); person(g, sc, 0, -.75, { top:'#151515', dress:false, ry:0, dance:true }); } },
    band:{ name:'Live band', icon:'mic', cat:'stage', r:2.8, build:(g,sc,p,c) => { C.stage(g,0,0,5,2.6,.5,'#151414',{ led:c.metal }); T(g,{ y:.5 }, g => { [-.4,0,.4].forEach((x,i) => g.cyl(-1.6+x,0,-.6,.22,.22,.28,'#8a1f1f',{ s:.7 })); g.cyl(-1.6,0,-.2,.32,.32,.3,'#e8e8e8',{ s:.6 }); [[-2,.65],[-1.2,.75]].forEach(([x,h]) => { g.tube([x,0,-.8],[x,h+.5,-.8],.01,'#999'); g.cyl(x,h+.5,-.8,.18,.18,.01,'#C8A96B',{ s:1 }); });
      g.box(1.4,.8,-.3,1.2,.08,.35,'#111',{ s:.8 }); g.box(1.4,.88,-.33,1.1,.01,.12,'#f5f5f5'); [[-.3,.6],[.5,.6]].forEach(([x]) => { g.tube([x,0,.6],[x,1.5,.6],.012,'#222'); g.sphere(x,1.52,.6,.04,'#333',{ s:1 },6); }); });
      T(g,{ y:.5 }, g => { person(g, sc, -1.6, .2, { top:'#1d1d1d', dress:false, ry:0, dance:true }); person(g, sc, 1.4, .3, { top:'#2b2a33', dress:false, ry:0 }); person(g, sc, .1, .9, { top:pick(['#C8A96B','#6B1E2A','#F4EFE6']), dress:true, ry:0, dance:true }); }); sc.addLight([0,3,1.5],'#FFD9A6',1.4,6); } },
    speakers:{ name:'Sound system', icon:'music', cat:'stage', r:1.4, build:(g) => { [-.8,.8].forEach(x => { g.box(x,0,0,.55,1.8,.5,'#111',{ s:.4 }); g.cyl(x,1.2,.26,.18,.18,.02,'#2a2a2a',{ s:.8 }); g.cyl(x,.55,.26,.21,.21,.02,'#2a2a2a',{ s:.8 }); g.shadow(x,0,.45,.45); }); } },
    ledscreen:{ name:'LED screen', icon:'image', cat:'screens', r:3.3, build:(g,sc) => { g.box(0,0,0,.3,1,.3,'#222'); [-3.1,3.1].forEach(x => g.box(x,0,0,.25,4.8,.25,'#6c717a',{ s:.8 })); g.box(0,1,0,6.2,3.6,.16,'#08090c',{ s:.5 }); g.box(0,1.1,.09,6,3.4,.02,'#ffffff',{ e:.9, f:2 }); g.box(0,4.8,0,6.6,.25,.25,'#6c717a',{ s:.8 }); g.glow(0,2.8,.6,6,[.16,.14,.12]); sc.addLight([0,2.8,2],'#d8c8ff',1,6); g.shadow(0,0,1,.3,3.2,.5); } },
    ledwall:{ name:'LED panel', icon:'image', cat:'screens', r:.9, build:(g) => { g.box(0,0,0,.6,.15,.5,'#111'); g.box(0,.15,0,1.4,2.8,.12,'#08090c',{ s:.5 }); g.box(0,.22,.07,1.3,2.66,.02,'#ffffff',{ e:.8, f:2 }); g.shadow(0,0,.8,.35,1,.5); } },
    truss:{ name:'Moving lights truss', icon:'bulb', cat:'screens', r:3.4, build:(g,sc) => { g.box(0,5,0,6.6,.25,.25,'#6c717a',{ s:.8 }); [-3.3,3.3].forEach(x => { g.box(x,0,0,.25,5.2,.25,'#6c717a',{ s:.8 }); g.shadow(x,0,.3,.4); }); [-2.2,-.7,.7,2.2].forEach((x,i) => { g.box(x,4.65,0,.3,.35,.3,'#111',{ s:.6 }); g.glow(x,4.65,0,.4,[1,.95,.85],.3,4); sc.dynamic(g => g.cyl(0,-5.5,0,1.1,.06,5.5,'#2a2416',{ e:1, s:0 },16,false), t => mdl({ x, y:4.65, z:0, rz:Math.sin(t*.9+i*1.3)*.4, rx:-.3+Math.sin(t*.7+i*2)*.3 }), { additive:true }); }); } },
    dancefloor:{ name:'Dance floor', icon:'sparkle', cat:'stage', r:3.3, floor:true, build:(g,sc,p,c) => { const t = c.dfType, w = 6, d = 5;
      if (t === 'LED') { for (let i=0;i<10;i++) for (let j=0;j<8;j++) g.box(-w/2+i*.6+.3, 0, -d/2+j*.62+.31, .59, .035, .61, '#ffffff', { f:4 }); }
      else { const a = { 'Glossy black':['#121110','#1c1a18'], 'White / mirror':['#F3F1EC','#E4E1DA'], 'Wooden':['#8B6A4C','#7A5C42'], 'Custom printed':[lighten(c.c1,.1), lighten(c.c1,.35)], 'Venue default':['#2a2826','#33302d'] }[t] || ['#121110','#1c1a18'];
        C.danceFloor(g, 0, 0, w, d, a[0], a[1], { tile:1, border:c.metal }); if (t === 'Custom printed') { for (let i=0;i<24;i++){ const an = i/24*6.283; g.box(Math.cos(an)*1.3,.04,Math.sin(an)*1.3,.18,.005,.18,c.metal,{ s:.9, ry:an }); } } } } },
    flowerwall:{ name:'Flower wall', icon:'flower', cat:'decor', r:2.4, build:(g,sc,p,c) => { T(g,{ ry:Math.PI }, g => C.flowerWall(g,0,0,0,4.4,2.8,c.flowers)); g.shadow(0,0,1,.3,2.4,.4); } },
    arch:{ name:'Floral arch', icon:'flower', cat:'decor', r:2.2, build:(g,sc,p,c) => { C.floralArch(g,0,0,0,3.6,3.2,c.flowers.concat(['#DDE5D3'])); for (let i=0;i<Math.round(8*c.lvl);i++) C.flowers(g,(rnd()<.5?-1:1)*(1.6+rnd()*.5),0,(rnd()-.5)*.6,.3,c.flowers,4); } },
    balloonarch:{ name:'Balloon arch', icon:'sparkle', cat:'decor', r:2.4, build:(g,sc,p,c) => C.balloonGarland(g, C.arcPts(0,0,4,2.8,0,.2,16), c.cols.length ? c.cols.concat(['#FFFFFF']) : ['#F2DCD3','#E7C9BE','#FFFFFF','#C8A96B'], 7) },
    balloons:{ name:'Balloon cluster', icon:'sparkle', cat:'decor', r:.9, build:(g,sc,p,c) => { for (let i=0;i<7;i++){ const dx=(i%3-1)*.3, dz=((i+1)%3-1)*.3, y=2+(i%4)*.35; C.balloon(g,dx,y,dz,.28,pick(c.cols.length ? c.cols.concat(['#FFFFFF']) : ['#E7C9BE','#C8A96B','#FFFFFF']),{ string:0, chrome:rnd()<.2 }); } g.box(0,0,0,.2,.12,.2,'#C8A96B',{ s:.9 }); } },
    neon:{ name:'Neon sign', icon:'heart', cat:'decor', r:1.3, build:(g,sc,p,c) => { g.box(0,0,0,.1,1.9,.1,'#222'); g.box(0,1.9,0,2.2,1.5,.06,'#1e3a2a',{ s:.2 }); const col = c.cols[0] && c.cols[0] !== '#FFFFFF' ? GL3D.hexD(c.cols[0]) : [1,.45,.6]; for (let i=0;i<46;i++){ const t = i/46*6.283, hx = 16*Math.pow(Math.sin(t),3)/16*.5, hy = (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16*.5; g.glow(hx,2.65+hy,.06,.16,col,.05,3); } g.glow(0,2.6,.2,1.6,col.map(v=>v*.25)); sc.addLight([0,2.6,.8], '#FF9AB0', .8, 3.5); } },
    drape:{ name:'Draped backdrop', icon:'layers', cat:'decor', r:2.4, build:(g,sc,p,c) => { g.box(0,3.6,0,4.6,.08,.08,'#C8A96B',{ s:.9 }); for (let x=-2.2;x<=2.2;x+=.18) g.cyl(x,0,0,.1,.1,3.6,lighten(c.c1,.15),{ s:.25 },8,false); g.glow(0,2,.4,2.4,[.3,.24,.16]); } },
    welcome:{ name:'Welcome sign', icon:'clipboard', cat:'decor', r:.7, build:(g,sc,p,c) => { g.tube([-.3,0,-.2],[0,1.7,0],.02,'#C8A96B',{ s:.9 }); g.tube([.3,0,-.2],[0,1.7,0],.02,'#C8A96B',{ s:.9 }); g.tube([0,0,.4],[0,1.6,0],.02,'#C8A96B'); T(g,{ y:.7, z:.05, rx:-.12 }, g => { g.box(0,0,0,.8,1.05,.03,'#F7F3EC',{ s:.4 }); g.box(0,.5,.02,.5,.04,.01,c.metal,{ s:1 }); g.box(0,.15,.02,.6,.02,.01,'#555'); g.box(0,.05,.02,.45,.02,.01,'#555'); }); C.flowers(g,0,.7,.15,.18,c.flowers,5); } },
    olive:{ name:'Olive tree', icon:'flower', cat:'decor', r:.9, build:(g) => C.planter(g,0,0,1.1) },
    candles:{ name:'Candles & lanterns', icon:'bulb', cat:'decor', r:.8, build:(g) => { C.lantern(g,0,0,1.3); C.lantern(g,.45,.2,.9); [[-.35,.2,.2],[-.2,.45,.35],[.3,-.35,.25]].forEach(([x,z,h]) => { g.cyl(x,0,z,.07,.07,h,'#F6EFE3',{ e:.25 }); g.glow(x,h+.04,z,.12,[1,.72,.38],.35,7); }); } },
    chandelier:{ name:'Chandelier', icon:'sparkle', cat:'screens', r:1, hang:true, build:(g,sc) => C.chandelier(g, sc, 0, 3.9, 0, 1, { ceil:6, i:1.6, range:6.5 }) },
    uplight:{ name:'Uplight', icon:'bulb', cat:'screens', r:.5, build:(g,sc,p,c) => { const col = c.cols[0] && c.cols[0] !== '#FFFFFF' ? c.cols[0] : '#FF9A50'; g.cyl(0,0,0,.14,.12,.18,'#111',{ s:.6 }); g.glow(0,.25,0,.5,GL3D.hexD(col),.1,1); sc.dynamic(g => g.cyl(0,0,0,.12,.9,3.4,'#201812',{ e:1, s:0 },14,false), t => mdl({}), { additive:true }); sc.addLight([0,1.5,.3], col, 1, 4); } },
    stringcanopy:{ name:'String light canopy', icon:'bulb', cat:'screens', r:3, build:(g,sc) => { const P = [[-3,-3],[3,-3],[3,3],[-3,3]]; P.forEach(([x,z]) => { g.tube([x,0,z],[x,3.4,z],.04,'#2a2622'); g.shadow(x,z,.15,.4); }); for (let i=0;i<4;i++){ const a = P[i], b = P[(i+1)%4]; C.stringLights(g,[a[0],3.4,a[1]],[b[0],3.4,b[1]],.4,12); } C.stringLights(g,[-3,3.4,-3],[3,3.4,3],.6,14); C.stringLights(g,[3,3.4,-3],[-3,3.4,3],.6,14); sc.addLight([0,3,0],'#FFC98A',1,6); } },
    bar:{ name:'Bar', icon:'glass', cat:'food', r:2.6, build:(g,sc,p,c) => { T(g,{ ry:Math.PI }, g => C.bar(g, sc, 0, 0, 0, 3.6, { back:c.metal })); person(g, sc, 0, -.95, { top:'#111', dress:false, ry:0 }); } },
    buffet:{ name:'Buffet', icon:'utensils', cat:'food', r:2.3, build:(g,sc,p,c) => { g.box(0,0,0,4,.85,.9,c.linen,{ s:.1 }); for (let i=0;i<5;i++){ const x = -1.6 + i*.8; g.cyl(x,.85,0,.26,.24,.12,'#C9CCD1',{ s:1 }); g.sphere(x,.97,0,.22,'#D7DADF',{ s:1 },10,.55); g.glow(x,.86,.3,.18,[1,.6,.3],.3,6); } C.flowers(g,0,.95,-.3,.2,c.flowers,5); g.shadow(0,0,1,.4,2.3,.7); person(g, sc, -1, -.9, { top:'#F4EFE6', dress:false, ry:0 }); } },
    station:{ name:'Live food station', icon:'utensils', cat:'food', r:1.6, build:(g,sc,p,c) => { g.box(0,0,0,2.2,.95,.8,'#2a2522',{ s:.5 }); g.box(0,.95,0,2.3,.05,.9,'#E9E4DC',{ s:.8 }); g.box(0,.95,-.25,.9,.08,.4,'#555',{ s:.9 }); g.glow(0,1.05,-.25,.6,[1,.45,.15],.5,9); g.tube([0,0,-.7],[0,2.4,-.7],.03,'#222'); g.box(0,2.2,-.7,1.4,.4,.05,'#111'); g.box(0,2.25,-.67,1.1,.12,.01,c.metal,{ e:.8 }); person(g, sc, 0, -.75, { top:'#FFFFFF', dress:false, ry:0 }); g.shadow(0,0,1,.4,1.3,.6); } },
    grill:{ name:'BBQ grill', icon:'utensils', cat:'food', r:1.2, build:(g,sc) => { g.box(0,0,0,1.6,.85,.7,'#2a2a2a',{ s:.6 }); for (let i=0;i<8;i++) g.glow(-.6+i*.17,.95,(rnd()-.5)*.4,.25,[1,.4,.1],.6,10); sc.addLight([0,1.4,0],'#FF7A30',1,3,.3); person(g, sc, 0, -.8, { top:'#ffffff', dress:false, ry:0 }); } },
    foodtruck:{ name:'Food truck', icon:'car', cat:'food', r:2.6, build:(g,sc,p,c) => { g.box(0,.35,0,4.2,2.3,2,lighten(c.c1,.1) === '#ffffff' ? '#E8D5A8' : c.c1,{ s:.5 }); g.box(1.2,.9,1.01,1.8,.9,.02,'#2a2a2e',{ s:1 }); g.glow(1.2,1.4,1.2,1.4,[.5,.38,.2]); g.box(1.2,1.85,1.2,2,.06,.5,'#C8A96B',{ s:.8 }); [[-1.4,1],[1.4,1],[-1.4,-1],[1.4,-1]].forEach(([x,z]) => T(g,{ x, y:.35, z, rx:Math.PI/2 }, g => g.cyl(0,-.12,0,.35,.35,.24,'#111',{ s:.3 }))); g.shadow(0,0,1,.4,2.3,1.2); } },
    cake:{ name:'Cake table', icon:'cake', cat:'food', r:1, build:(g,sc,p,c) => { g.cyl(0,0,0,.6,.6,.78,c.linen,{ s:.1 },22); C.cake(g,0,.78,0,Math.min(5,c.tiers),'#FBF7F0',c.flowers); g.shadow(0,0,.7,.4); sc.addLight([0,2,.6],'#FFE2B8',.6,3); } },
    sweets:{ name:'Sweets table', icon:'cake', cat:'food', r:1.7, build:(g,sc,p,c) => { g.box(0,0,0,2.8,.85,.8,c.linen,{ s:.1 }); [-1,-.4,.4,1].forEach((x,i) => { g.cyl(x,.85,0,.04,.04,.18+i%2*.15,c.metal,{ s:1 }); g.cyl(x,1.03+i%2*.15,0,.22,.22,.02,'#ffffff',{ s:.6 }); for (let k=0;k<6;k++) g.sphere(x+(rnd()-.5)*.3,1.08+i%2*.15,(rnd()-.5)*.3,.045,pick(c.flowers.concat(['#C9A27E','#6B3E2A'])),{ s:.3 },6,.6); }); C.flowers(g,0,.9,-.25,.2,c.flowers,6); g.shadow(0,0,1,.4,1.6,.6); } },
    fountain:{ name:'Chocolate fountain', icon:'cake', cat:'food', r:.9, build:(g) => { g.cyl(0,0,0,.45,.45,.78,'#F3EEE5',{ s:.1 }); [.32,.24,.16].forEach((r,i) => g.cyl(0,.78+i*.22,0,r,r*.8,.06,'#5a3a24',{ s:.9 })); g.cyl(0,.78,0,.05,.05,.7,'#4a2e1c',{ s:.9 }); g.shadow(0,0,.6,.4); } },
    coffee:{ name:'Coffee corner', icon:'utensils', cat:'food', r:1.3, build:(g,sc) => { g.box(0,0,0,1.8,.9,.7,'#6b5139',{ s:.3 }); g.box(0,.9,0,1.9,.04,.8,'#E9E4DC',{ s:.8 }); [-.5,0,.5].forEach(x => { g.cyl(x,.94,0,.13,.09,.28,'#B87333',{ s:1 }); g.cyl(x,1.22,0,.03,.08,.12,'#B87333',{ s:1 }); g.tube([x+.1,1.05,0],[x+.25,1.2,0],.02,'#B87333',{ s:1 }); }); g.glow(0,1.4,.2,.9,[.4,.28,.15]); g.shadow(0,0,1,.4,1,.5); } },
    photobooth:{ name:'Photo booth', icon:'camera', cat:'fun', r:1.7, build:(g,sc,p,c) => { g.box(0,0,0,2.6,2.6,.12,lighten(c.c1,.1),{ s:.3 }); for (let i=0;i<60;i++) g.sphere(-1.2+rnd()*2.4,.2+rnd()*2.3,.08,.07,pick(c.flowers),{ s:.2 },6); const fr = [[-1.3,0],[1.3,0],[1.3,2.6],[-1.3,2.6]]; for (let i=0;i<4;i++){ const a = fr[i], b = fr[(i+1)%4]; g.tube([a[0],a[1],.12],[b[0],b[1],.12],.05,c.metal,{ s:1 }); }
      T(g,{ z:2.3 }, g => { [[-.25,.2],[.25,.2],[0,-.3]].forEach(([x,z]) => g.tube([x,0,z],[0,1.4,0],.015,'#222')); g.box(0,1.4,0,.3,.22,.18,'#111',{ s:.9 }); g.cyl(0,1.75,-.05,.3,.3,.03,'#fff',{ e:1.2 }); g.glow(0,1.6,0,.6,[.9,.9,1],.2,3); }); person(g, sc, -.3, .6, { dance:true }); person(g, sc, .35, .55, { dance:true, dress:true }); } },
    booth360:{ name:'360 video booth', icon:'video', cat:'fun', r:1.5, build:(g,sc,p,c) => { g.cyl(0,0,0,.95,.95,.22,'#111',{ s:.8 }); g.cyl(0,.22,0,.93,.93,.01,c.metal,{ e:.6 }); sc.dynamic(g => { g.tube([0,.25,0],[0,.6,0],.05,'#222'); g.box(.6,.55,0,1.4,.06,.08,'#222',{ s:.6 }); g.tube([1.25,.6,0],[1.25,1.9,0],.03,'#222'); g.box(1.25,1.9,0,.12,.2,.08,'#111'); g.glow(1.25,1.95,-.1,.3,[1,1,1],.4,9); }, t => mdl({ ry:t*2.4 })); person(g, sc, 0, 0, { dance:true }); person(g, sc, .3, .15, { dance:true, dress:true }); } },
    argileh:{ name:'Argileh lounge', icon:'seat', cat:'fun', r:1.7, build:(g,sc,p,c) => { g.box(0,0,0,2.6,.05,2,'#7A2E2A',{ s:.1 }); [[-1,-.7],[1,-.7],[-1,.7],[1,.7]].forEach(([x,z]) => g.box(x,.05,z,.7,.3,.6,pick(['#C8A96B','#6B1E2A','#E8D5A8']),{ s:.1 })); g.box(0,.05,0,.7,.35,.7,'#3a2a20',{ s:.6 }); T(g,{ y:.4 }, g => { g.sphere(0,.15,0,.17,'#2F6F5A',{ s:1 },10); g.tube([0,.3,0],[0,.75,0],.025,'#C8A96B',{ s:1 }); g.cyl(0,.75,0,.06,.09,.08,'#5a3a24'); g.glow(0,.86,0,.22,[1,.45,.15],.6,8); g.tube([0,.4,0],[.5,.1,.3],.012,'#333'); }); } },
    firepit:{ name:'Fire pit', icon:'sparkle', cat:'fun', r:1.4, build:(g,sc) => { g.cyl(0,0,0,.75,.65,.35,'#6E6A63',{ s:.2 }); g.glow(0,.6,0,1.4,[1,.5,.18],.45,10); for (let i=0;i<8;i++) g.glow((rnd()-.5)*.7,.5,(rnd()-.5)*.6,.3,[1,.65,.25],.6,14); sc.addLight([0,1,0],'#FF8C3A',1.8,5,.3); [0,1,2,3].forEach(k => { const a = k/4*6.283 + .4; g.box(Math.cos(a)*1.4,0,Math.sin(a)*1.4,.5,.4,.5,'#B5AD9F',{ s:.1 }); }); } },
    kidsplay:{ name:'Kids’ play area', icon:'gift', cat:'fun', r:2, build:(g) => { g.box(0,0,0,3.2,.08,3,'#B9DDB5',{ s:.1 }); T(g,{ x:-.6, z:-.4 }, g => { g.box(0,0,0,.8,1,.8,'#F7E3A1',{ s:.3 }); g.loft([[-.4,.4],[.4,.4],[.4,.42],[-.4,.42]],1,[[-.4,1.9],[.4,1.9],[.4,1.92],[-.4,1.92]],0,'#AFCBE3',{ s:.6 }); }); for (let i=0;i<30;i++) g.sphere(.7+(rnd()-.5)*1.2,.15,.6+(rnd()-.5)*1.2,.1,pick(['#F3C6CF','#AFCBE3','#F7E3A1','#B9DDB5','#ffffff']),{ s:.6 },6); g.shadow(0,0,1,.3,1.7,1.6); } },
    games:{ name:'Lawn games', icon:'gift', cat:'fun', r:1.1, build:(g) => { for (let l=0;l<12;l++) for (let k=0;k<3;k++) g.box(l%2 ? 0 : -.18 + k*.18, l*.1, l%2 ? -.18 + k*.18 : 0, l%2 ? .5 : .16, .09, l%2 ? .16 : .5, '#D9B98A', { s:.2 }); g.shadow(0,0,.5,.4); } },
    casino:{ name:'Casino table', icon:'gift', cat:'fun', r:1.4, build:(g,sc) => { g.cyl(0,0,0,.9,.9,.82,'#3a2416',{ s:.6 },24); g.cyl(0,.82,0,.85,.85,.02,'#1f5b3a',{ s:.05 },24); for (let i=0;i<10;i++) g.cyl((rnd()-.5)*.8,.84,(rnd()-.5)*.8,.05,.05,.02*(1+i%3),pick(['#A33A2B','#111','#C8A96B']),{ s:.6 },8); person(g, sc, 0, -1.1, { top:'#111', dress:false, ry:0 }); } },
    easel:{ name:'Live painter', icon:'brush', cat:'fun', r:.9, build:(g,sc,p,c) => { g.tube([-.3,0,0],[0,1.7,-.1],.02,'#8a6b4a'); g.tube([.3,0,0],[0,1.7,-.1],.02,'#8a6b4a'); g.tube([0,0,-.5],[0,1.6,-.1],.02,'#8a6b4a'); T(g,{ y:.75, rx:-.15 }, g => { g.box(0,0,0,.8,.9,.03,'#F7F3EC'); for (let i=0;i<10;i++) g.sphere((rnd()-.5)*.6,.2+rnd()*.6,.03,.05,pick(c.flowers.concat(['#6B8A5E'])),{},6,.3); }); person(g, sc, .5, .5, { ry:-2.6 }); } },
    performers:{ name:'Dabke / zaffe troupe', icon:'users', cat:'fun', r:1.8, build:(g,sc) => { for (let i=0;i<7;i++){ const a = i/7*Math.PI; person(g, sc, Math.cos(a)*1.4, -Math.sin(a)*.6, { top:i%2 ? '#F4EFE6' : '#1f1f1f', dress:false, dance:true, ry:0 }); } } },
    piano:{ name:'Grand piano', icon:'music', cat:'stage', r:1.6, build:(g,sc) => { const sh = [[-.75,-1],[.75,-1],[.75,.2],[.5,.8],[0,1.1],[-.5,.9],[-.75,.4]]; T(g,{ ry:Math.PI }, g => { g.loft(sh,.62,sh,.95,'#0a0a0a',{ s:1 }); g.box(0,.62,-1.05,1.5,.12,.3,'#efefef',{ s:.5 }); [[-.6,-.9],[.6,-.9],[0,.9]].forEach(([x,z]) => g.box(x,0,z,.09,.62,.09,'#0a0a0a',{ s:1 })); T(g,{ y:.95, z:.1, rx:-.7 }, g => g.box(0,0,.5,1.4,.02,1,'#0a0a0a',{ s:1 })); }); g.shadow(0,0,1.2,.4); person(g, sc, 0, 1.4, { top:'#111', dress:false, ry:Math.PI }); } },
    gifts:{ name:'Gift table', icon:'gift', cat:'decor', r:1, build:(g,sc,p,c) => { g.box(0,0,0,1.4,.78,.7,c.linen,{ s:.1 }); for (let i=0;i<7;i++){ const s = .15+rnd()*.15; g.box(-.5+rnd()*1,.78+(i>4?.25:0),(rnd()-.5)*.4,s,s,s,pick(c.flowers.concat([c.metal])),{ s:.5 }); } g.shadow(0,0,.8,.4,1,.6); } },
    heater:{ name:'Patio heater', icon:'bulb', cat:'decor', r:.6, build:(g,sc) => { g.cyl(0,0,0,.25,.25,.08,'#555',{ s:.9 }); g.tube([0,0,0],[0,2.2,0],.05,'#888',{ s:.9 }); g.cyl(0,2.2,0,.5,.12,.2,'#999',{ s:.9 }); g.glow(0,2.05,0,.7,[1,.45,.15],.3,5); sc.addLight([0,2,0],'#FF8C3A',.8,3.5,.2); } },
    umbrella:{ name:'Umbrella & loungers', icon:'umbrella', cat:'decor', r:1.6, build:(g) => { C.umbrella(g,0,0,'#F2EADC',2.3); C.lounger(g,.6,.9,.3); C.lounger(g,-.7,.9,-.2); } },
    car:{ name:'Wedding / VIP car', icon:'car', cat:'fun', r:2.6, build:(g,sc,p,c) => { T(g,{ ry:Math.PI/2 }, g => { g.box(0,.3,0,4.6,.75,1.8,'#F4F2EE',{ s:1 }); g.loft([[-1.2,-.8],[1,-.8],[1,.8],[-1.2,.8]],1.05,[[-.9,-.7],[.6,-.7],[.6,.7],[-.9,.7]],1.6,'#F4F2EE',{ s:1 }); g.box(-.15,1.1,0,1.5,.42,1.62,'#1c2a38',{ s:1 }); [[-1.5,.85],[1.5,.85],[-1.5,-.85],[1.5,-.85]].forEach(([x,z]) => T(g,{ x, y:.35, z, rx:Math.PI/2 }, g => g.cyl(0,-.12,0,.35,.35,.24,'#111',{ s:.4 }))); g.glow(2.3,.7,.6,.3,[1,1,.9]); g.glow(2.3,.7,-.6,.3,[1,1,.9]); C.flowers(g,2,1.1,0,.25,c.flowers,8); }); g.shadow(0,0,1,.45,1.3,2.6); } },
    sparks:{ name:'Cold spark machines', icon:'sparkle', cat:'screens', r:.9, build:(g,sc) => { [-.5,.5].forEach((x,k) => { g.box(x,0,0,.35,.25,.35,'#111',{ s:.6 }); for (let i=0;i<16;i++){ const ph = i/16, ang = rnd()*6.283, sp = .25 + rnd()*.25; sc.dynamic(g => g.glow(0,0,0,.09,[1,.82,.45]), t => { const q = (t*.8 + ph + k*.37) % 1; return mdl({ x:x + Math.cos(ang)*sp*q, y:.3 + 3.2*q - 2.6*q*q, z:Math.sin(ang)*sp*q }); }); } g.glow(x,.35,0,.6,[1,.7,.3],.3,8); }); sc.addLight([0,1.2,0],'#FFD58A',1,3.5,.25); } }
  };
  const CATS = [['tables','Tables & seating'],['stage','Stage & music'],['screens','Screens & lights'],['decor','Decor & flowers'],['food','Food & drinks'],['fun','Fun & extras']];

  /* ---------- auto layout from choices ---------- */
  const has = (arr, ...k) => (Array.isArray(arr) ? arr : arr ? [arr] : []).some(x => k.includes(x));
  function autoLayout(v){
    const sx = x => Math.abs(x) > 7 ? Math.sign(x)*(W/2 - (10 - Math.abs(x))) : x*W/20, sz = z => z < -5 ? -D/2 + (8 + z) : z > 5 ? D/2 - (8 - z) : z*D/16;
    const out = [], A = (id, type, pref, ry=0, props={}, raw=false) => out.push({ id, type, pref: raw ? pref : [sx(pref[0]), sz(pref[1])], ry, props });
    const areas = v.areas || [], music = v.music || [], acts = v.activities || [], L = v.lights || [], fx = v.effects || [], bd = v.backdrop || [], svc = v.service || [], drinks = v.drinks || [], des = v.desserts || [], tech = v.technical || [], ex = v.extrasDecor || [];
    const back = -D/2 + 1.6;
    if (areas.includes('Kosha / couple’s stage')) A('kosha','kosha',[0,back]);
    else if (areas.includes('Stage') || music.includes('Live band') || music.includes('Singer')) A('stage','stage',[0,back]);
    if (bd.includes('LED screen') || tech.includes('Screens & projectors')) A('ledscreen','ledscreen',[0,-D/2+.4]);
    if (bd.includes('Flower wall') || bd.includes('Greenery wall')) A('flowerwall','flowerwall',[areas.includes('Kosha / couple’s stage') ? -5.8 : 0, -D/2+.5]);
    if (bd.includes('Floral arch') || areas.includes('Ceremony area')) A('arch','arch',[areas.includes('Kosha / couple’s stage') ? 5.8 : 0, back]);
    if (bd.includes('Balloon arch') || has([v.balloons],'Garlands & arches','Balloon installation')) A('balloonarch','balloonarch',[0, back - .3]);
    if (bd.includes('Draped fabric')) A('drape','drape',[0,-D/2+.4]);
    if (bd.includes('Neon sign') || L.includes('Neon')) A('neon','neon',[-3.6,-D/2+.5]);
    if (areas.includes('Dance floor') || L.includes('LED dance floor') || music.includes('DJ')) A('dancefloor','dancefloor',[0,-2.2]);
    if (music.includes('Live band')) A('band','band',[6.4,-5.6]);
    if (music.includes('DJ')) A('dj','dj',[-6.4,-5.6]);
    if (tech.includes('Sound system')) A('speakers','speakers',[3.6,-5.8]);
    if (music.includes('Pianist')) A('piano','piano',[-7.6,-1.6]);
    if (has(music,'Zaffe','Dabke troupe','Drummers (tabl)','Belly dancer')) A('performers','performers',[0,5.6]);
    if (has(music,'String quartet / violin','Oud player','Saxophonist','Choir') && !music.includes('Live band')) A('band','band',[6.4,-5.6]);
    if (L.includes('Moving heads') || L.includes('Spotlights') && false) A('truss','truss',[0,-D/2+2.6]);
    if (L.includes('Chandeliers')) [[-2.4,-2.2],[2.4,-2.2],[-6,2.6],[6,2.6],[0,4.6]].forEach((p,i) => A('chand'+i,'chandelier',p));
    if (L.includes('Candlelight') || L.includes('Lanterns') || ex.includes('Candles everywhere')) [[-8.6,-6.8],[8.6,-6.8],[-8.6,6.8],[8.6,6.8]].forEach((p,i) => A('cand'+i,'candles',p));
    if (fx.includes('Cold sparks')) { A('sparks0','sparks',[-3.6,.6]); A('sparks1','sparks',[3.6,.6]); }
    if (areas.includes('Sweetheart or head table')) A('sweetheart','sweetheart',[0, areas.includes('Kosha / couple’s stage') ? -4.2 : back + 1.6]);
    if (areas.includes('Bar area') || has(drinks,'Open bar','Signature cocktail','Wine','Champagne / bubbly','Arak','Beer','Whisky & spirits','Mocktails') || v.bartenders === 'Professional bartenders') A('bar','bar',[8.6,-3],-Math.PI/2);
    if (has(svc,'Buffet')) A('buffet','buffet',[-8.8,-2.6],Math.PI/2);
    if (has(svc,'Food stations','Live cooking stations') || (v.stations||[]).filter(x => !/Not sure/.test(x)).length) A('station0','station',[-8.6,1.2],Math.PI/2);
    if ((v.stations||[]).filter(x => !/Not sure/.test(x)).length > 1) A('station1','station',[8.6,1.2],-Math.PI/2);
    if (has(svc,'BBQ / grill')) A('grill','grill',[-8.6,4],Math.PI/2);
    if (has(svc,'Food trucks')) A('foodtruck','foodtruck',[7.2,6.2],-Math.PI/2);
    if ((v.cake||'').startsWith('Yes')) A('cake','cake',[areas.includes('Kosha / couple’s stage') ? 4.2 : 3.4, back + .8]);
    if (has(des,'Sweets table','Lebanese sweets (knefe, maamoul…)','Macarons','Cupcakes','Donut wall','Dragées & chocolates')) A('sweets','sweets',[-8.4,-5.6],Math.PI/2);
    if (des.includes('Chocolate fountain')) A('fountain','fountain',[-6.6,-6.6]);
    if (has(drinks,'Coffee & tea corner','Turkish coffee service')) A('coffee','coffee',[8.6,4],-Math.PI/2);
    if (areas.includes('Photo corner') || acts.includes('Photo booth') || ex.includes('Photo-op corner')) A('photobooth','photobooth',[-8.2,6.6],Math.PI/4);
    if (acts.includes('360 video booth')) A('booth360','booth360',[8.2,6.6]);
    if (areas.includes('Lounge corner') || areas.includes('VIP area') || acts.includes('Cigar lounge') || v.seating && v.seating.includes('Lounge seating')) A('sofa','sofa',[7.6,6.2]);
    if (acts.includes('Hookah / argileh corner')) A('argileh','argileh',[-7.4,4.6]);
    if (areas.includes('Kids’ area') || acts.includes('Kids’ entertainer') || acts.includes('Face painting')) A('kidsplay','kidsplay',[-7.6,6.2]);
    if (acts.includes('Games / lawn games')) A('games','games',[6.6,4.4]);
    if (acts.includes('Casino tables')) A('casino','casino',[6.4,1.4]);
    if (acts.includes('Live painter') || acts.includes('Caricature artist')) A('easel','easel',[-6.4,1.4]);
    if (areas.includes('Gift table') || (v.favors||[]).some(x => !/None|Not sure/.test(x))) A('gifts','gifts',[5.6,7.2]);
    if (areas.includes('Welcome / reception area') || ex.includes('Welcome sign') || ex.includes('Entrance decor')) A('welcome','welcome',[-1.6,D/2-.6]);
    if (has(v.balloons,'A few accents','Garlands & arches','Balloon installation')) [[-4,D/2-.8],[4,D/2-.8]].forEach((p,i) => A('bal'+i,'balloons',p));
    if (tech.includes('Heaters')) [[-9.2,-7.2],[9.2,-7.2],[-9.2,7.2],[9.2,7.2]].forEach((p,i) => A('heat'+i,'heater',p));
    if (has(v.transport,'Wedding / VIP car','Classic car') && venueOf(v) !== 'yacht') A('car','car',[0, D/2+2.6],0,{},true);
    if (L.includes('Warm uplighting') || L.includes('Colored uplighting')) {}
    // seating last: fills the free space, nearest the dance floor first
    const guests = +v.guests || 0, seat = v.seating || [];
    const zone = []; for (let zz = -D/2 + 2.4; zz <= D/2 - 1.9; zz += 3.2) for (let xx = -W/2 + 2.1; xx <= W/2 - 2.1; xx += 3.2) zone.push([xx, zz]);
    zone.sort((a,b) => (Math.abs(a[0])*.55 + Math.abs(a[1] - D*.1)) - (Math.abs(b[0])*.55 + Math.abs(b[1] - D*.1)));
    const maxT = Math.floor(W*D/15);
    const n = guests ? Math.min(maxT, Math.max(1, Math.ceil(guests / 8))) : (seat.length ? 8 : 0);
    const kind = seat.includes('Long imperial tables') ? 'imperial' : seat.includes('Mixed rounds & long tables') ? 'mixed' : seat.includes('Cocktail / standing') ? 'cocktail' : (seat.includes('Theater rows') || seat.includes('Classroom')) ? 'rows' : 'round';
    if (kind === 'imperial'){ const m = Math.min(Math.floor(W*D/40), Math.max(1, Math.ceil((guests||80)/20))); const cols = Math.max(2, Math.floor(W/9)); for (let i=0;i<m;i++){ const c = i % cols, r = Math.floor(i/cols); A('imp'+i,'imperial',[-W/2 + W*(c+.5)/cols, -D*.05 + r*2.7],0,{},true); } }
    else if (kind === 'rows'){ const m = Math.min(Math.floor(W*D/30), Math.max(1, Math.ceil((guests||60)/20))); for (let i=0;i<m;i++) A('rows'+i,'rows',zone[i % zone.length],0,{},true); }
    else if (kind === 'cocktail'){ for (let i=0;i<Math.min(Math.floor(W*D/6), Math.ceil((guests||60)/6));i++) A('ct'+i,'cocktail',zone[i % zone.length],0,{},true); }
    else { for (let i=0;i<n;i++){ const isLong = kind === 'mixed' && i % 3 === 2; A('t'+i, isLong ? 'long' : 'round', zone[i % zone.length] || [0,0], 0, {}, true); } }
    if (areas.includes('Kids’ area') && guests) A('kidstable','kidstable',[-5.6,6.4]);
    return out;
  }
  // place each item at the nearest free spot to its preferred point
  function placeAll(list, fixed){
    const placed = fixed.slice(), res = [];
    const free = (x, z, r, isFloor) => placed.every(p => { const pd = ITEMS[p.type]; if (pd.hang || p.type === 'car') return true; const d = Math.hypot(p.x - x, p.z - z);
      if (isFloor || pd.floor) return d > (isFloor ? r : pd.r)*.85 + (isFloor ? pd.r : r)*.7; return d > (r + pd.r) * .82; });
    list.forEach(it => {
      const def = ITEMS[it.type], r = def.r, out = it.type === 'car';
      let best = null;
      if (def.hang || out) best = it.pref;
      else { const [px, pz] = it.pref; for (let rad=0; rad<12 && !best; rad+=.5){ const steps = Math.max(1, Math.round(rad*8)); for (let s=0;s<steps;s++){ const a = s/steps*6.283; const x = px + Math.cos(a)*rad, z = pz + Math.sin(a)*rad; if (Math.abs(x) > W/2 - r*.7 || Math.abs(z) > D/2 - r*.7) continue; if (free(x, z, r, def.floor)) { best = [x, z]; break; } } } }
      if (!best) return;
      const p = { ...it, x:best[0], z:best[1] }; placed.push(p); res.push(p);
    });
    return res;
  }

  /* ---------- effects ---------- */
  function buildFx(st, v, items){
    const fx = v.effects || [], r = st.r, df = items.find(i => i.type === 'dancefloor') || { x:0, z:-2 };
    const add = (build, update, opts) => { const g = new GL3D.Geo(); build(g); st.fx.push(r.addDyn(g, (t, c) => st.hideAll ? null : update(t, c), opts)); };
    const cols = st.ctx.cols.length ? st.ctx.cols : ['#C8A96B','#F2D3CC','#FFFFFF','#E8D5A8'];
    if (fx.includes('Low fog / dry ice') || fx.includes('Smoke')) for (let i=0;i<9;i++){ const ph = rnd()*6, ox = (rnd()-.5)*5, oz = (rnd()-.5)*4, big = fx.includes('Smoke') && i > 5;
      add(g => g.cyl(0,0,0,1.5,1.5,.02,'#262626',{ e:1, s:0 },20), t => mdl({ x:df.x + ox + Math.sin(t*.3+ph)*.6, y:big ? 1.5 + Math.sin(t*.2+ph) : .06 + i*.02, z:df.z + oz + Math.cos(t*.25+ph)*.5, s:.8 + .3*Math.sin(t*.5+ph) }), { additive:true }); }
    if (fx.includes('Confetti')) for (let i=0;i<70;i++){ const ph = rnd(), x = df.x + (rnd()-.5)*6, z = df.z + (rnd()-.5)*5, col = pick(cols), sp = .12 + rnd()*.08;
      add(g => g.box(0,0,0,.07,.004,.045,col,{ s:.9, e:.3 }), t => { const q = (t*sp + ph) % 1; return mdl({ x:x + Math.sin(t*2+ph*9)*.2, y:5.5 - q*5.5, z, rx:t*4+ph*9, rz:t*3+ph*5 }); }); }
    if (fx.includes('Bubbles')) for (let i=0;i<30;i++){ const ph = rnd(), x = df.x + (rnd()-.5)*6, z = df.z + (rnd()-.5)*5;
      add(g => g.sphere(0,0,0,.09,'#1c2a33',{ e:1, s:1 },8), t => { const q = (t*.15 + ph) % 1; return mdl({ x:x + Math.sin(t+ph*9)*.3, y:.5 + q*4, z }); }, { additive:true }); }
    if (fx.includes('Lasers')) { const src = items.find(i => i.type === 'dj') || items.find(i => i.type === 'stage') || { x:0, z:-D/2+1 }; ['#B8301C','#C8781E','#7a3fb0','#2f7a6a'].forEach((c,i) => { for (let k=0;k<4;k++) add(g => g.box(0,0,7,.02,.02,14,c,{ e:1.3, s:0 }), t => mdl({ x:src.x, y:3.4, z:src.z, ry:Math.sin(t*.8+i*1.7)*.9 + (k-1.5)*.14, rx:.18 + Math.sin(t*.6+k)*.08 }), { additive:true }); }); }
    if (fx.includes('Fireworks')) for (let s=0;s<3;s++){ const cx = (s-1)*9, cz = -16 - s*3, cy = 15 + s*2, off = s*1.1, col = GL3D.hexD(pick(cols.concat(['#FFD58A'])));
      for (let i=0;i<34;i++){ const a = rnd()*6.283, e = (rnd()-.5)*3, sp = 3 + rnd()*1.5; add(g => g.glow(0,0,0,.45,col), t => { const q = ((t + off) % 3.3) / 1.6; if (q > 1) return null; return mdl({ x:cx + Math.cos(a)*Math.cos(e)*sp*q, y:cy + Math.sin(e)*sp*q - 2*q*q, z:cz + Math.sin(a)*Math.cos(e)*sp*q }); }); }
      add(g => g.glow(0,0,0,.3,[1,.85,.5]), t => { const q = ((t + off) % 3.3); if (q < 2.4) return null; const k = (q-2.4)/.9; return mdl({ x:cx, y:cy*k, z:cz }); }); }
    if (fx.includes('Drone light show')) for (let i=0;i<64;i++){ const u = i/64*6.283;
      add(g => g.glow(0,0,0,.35,GL3D.hexD(i%3 ? '#FFFFFF' : (cols[0] || '#C8A96B'))), t => { const k = .5 + .5*Math.sin(t*.35); const hx = 16*Math.pow(Math.sin(u),3)*.45, hy = (13*Math.cos(u)-5*Math.cos(2*u)-2*Math.cos(3*u)-Math.cos(4*u))*.45; const cx = Math.cos(u + t*.2)*7, cy = Math.sin(u + t*.2)*7; return mdl({ x:hx*k + cx*(1-k), y:18 + (hy*k + cy*(1-k)), z:-20 }); }); }
    if (fx.includes('Sky lanterns')) for (let i=0;i<24;i++){ const ph = rnd(), x = (rnd()-.5)*16, z = (rnd()-.5)*10; add(g => { g.glow(0,0,0,.5,[1,.6,.25],.3,4); g.box(0,-.15,0,.18,.28,.18,'#F7D9A8',{ e:1.2 }); }, t => { const q = (t*.05 + ph) % 1; return mdl({ x:x + q*4, y:1 + q*22, z:z - q*10 }); }); }
    if (fx.includes('Flame effects')) [-4.2,4.2].forEach((x,k) => { for (let i=0;i<10;i++) add(g => g.glow(0,0,0,.6,[1,.5,.15]), t => { const q = ((t*1.2 + k*.5) % 3); if (q > 1) return null; return mdl({ x, y:.3 + i*.3*q*1.4, z:-D/2 + 1.2 }); }); });
    if (fx.includes('Balloon drop') || has([v.balloons],'Balloon drop')) for (let i=0;i<24;i++){ const ph = rnd(), x = df.x + (rnd()-.5)*6, z = df.z + (rnd()-.5)*5, col = pick(cols);
      add(g => C.balloon(g,0,0,0,.24,col,{}), t => { const q = (t*.07 + ph) % 1; return mdl({ x, y:Math.max(.27, 5.6 - q*14), z }); }); }
    if ((v.lights||[]).includes('Gobo / monogram projection')) add(g => { for (let i=0;i<12;i++){ const a = i/12*6.283; g.glow(Math.cos(a)*1.4,0,Math.sin(a)*1.4,.5,GL3D.hexD(st.ctx.metal).map(c=>c*.7)); } g.glow(0,0,0,1.3,[.5,.4,.25]); }, t => mdl({ x:df.x, y:.08, z:df.z, ry:t*.4 }));
  }
  function buildCrowd(st, v, items){
    const n = Math.min(60, Math.round((+v.guests || 0) / 8 * (st.crowdScale ?? 1))); if (!n) return;
    const df = items.find(i => i.type === 'dancefloor'), bar = items.find(i => i.type === 'bar');
    const free = (x, z) => Math.abs(x) < W/2 - .5 && Math.abs(z) < D/2 - .5 && items.every(i => ITEMS[i.type].floor || ITEMS[i.type].hang || Math.hypot(i.x - x, i.z - z) > ITEMS[i.type].r + .35);
    for (let i=0;i<n;i++){
      let x, z, dance = false, tries = 0;
      if (df && i < n*.6){ x = df.x + (rnd()-.5)*5; z = df.z + (rnd()-.5)*4; dance = true; }
      else { do { const near = bar && rnd() < .4 ? bar : null; x = near ? near.x + (rnd()-.5)*4 : (rnd()-.5)*(W-2); z = near ? near.z + (rnd()-.5)*4 : (rnd()-.5)*(D-2); tries++; } while (!free(x, z) && tries < 30); if (tries >= 30) continue; }
      const sub = []; const proxy = { dynamic:(b, u) => sub.push({ b, u }), addLight(){} };
      const g = new GL3D.Geo(); C.person(g, proxy, 0, 0, { dance }); const pg = new GL3D.Geo(); sub[0].b(pg); pg.sp = g.sp; pg.sa = g.sa;
      const px = x, pz = z; st.crowd.push(st.r.addDyn(pg, t => st.hideAll ? null : GL3D.mul4(mdl({ x:px, z:pz }), sub[0].u(t))));
    }
  }

  /* ---------- studio ---------- */
  const easeBack = k => { k = Math.min(1, Math.max(0, k)); const c = 1.7; return 1 + (c+1)*Math.pow(k-1,3) + c*Math.pow(k-1,2); };
  class Studio {
    constructor(root, { onChange }){
      this.root = root; this.canvas = $('canvas', root); this.onChange = onChange;
      this.r = new GL3D.Renderer(this.canvas); this.items = []; this.fx = []; this.crowd = []; this.envSig = null; this.sel = null;
      this.cam = { theta:.9, phi:.62, r:22, target:[0,.4,0], auto:true }; this.goal = { theta:.9, phi:.62, r:22 }; this.vel = 0; this.horizon = .45; this.t0 = performance.now(); this.visible = true;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; if (this.reduced) this.cam.auto = false;
      new ResizeObserver(() => this.resize()).observe(this.canvas);
      this.io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }); this.io.observe(this.canvas);
      this.bind(); GL3D._viewers.add(this);
    }
    get time(){ return (performance.now() - this.t0) / 1000; }
    resize(){ const dpr = Math.min(window.devicePixelRatio || 1, 2), rc = this.canvas.getBoundingClientRect(); const w = Math.max(2, Math.round(rc.width*dpr)), h = Math.max(2, Math.round(rc.height*dpr)); if (this.canvas.width !== w || this.canvas.height !== h){ this.canvas.width = w; this.canvas.height = h; } }
    camera(){
      const c = this.cam, rc = this.canvas, asp = (rc.width || 1) / (rc.height || 1), photo = this.v && this.v._photo;
      const fov = photo ? 1 : .72, phi = photo ? Math.max(.04, Math.min(1.4, Math.atan(this.horizon * Math.tan(fov/2)))) : c.phi;
      const R = c.r * (this.scale || 1) * (photo ? 1 : Math.max(1, Math.min(1.7, 1.3 / asp))), tg = c.target;
      return { eye:[tg[0] + Math.cos(c.theta)*Math.cos(phi)*R, tg[1] + Math.sin(phi)*R, tg[2] + Math.sin(c.theta)*Math.cos(phi)*R], target:tg, fov };
    }
    ray(cx, cy){
      const rc = this.canvas.getBoundingClientRect(), nx = ((cx - rc.left)/rc.width)*2 - 1, ny = -(((cy - rc.top)/rc.height)*2 - 1), { eye, target, fov } = this.camera();
      const f = GL3D.norm(GL3D.sub(target, eye)), rt = GL3D.norm(GL3D.cross(f, [0,1,0])), up = GL3D.cross(rt, f), th = Math.tan(fov/2), as = rc.width/rc.height;
      const d = GL3D.norm([f[0] + rt[0]*nx*th*as + up[0]*ny*th, f[1] + rt[1]*nx*th*as + up[1]*ny*th, f[2] + rt[2]*nx*th*as + up[2]*ny*th]);
      if (d[1] > -1e-4) return null; const s = -eye[1]/d[1]; return [eye[0] + d[0]*s, eye[2] + d[2]*s];
    }
    pick(h){ let best = null, bs = 1e9; this.items.forEach(it => { const def = ITEMS[it.type], d = Math.hypot(it.x - h[0], it.z - h[1]); if (d > def.r) return; const s = d/def.r + (def.floor ? 1 : 0); if (s < bs){ bs = s; best = it; } }); return best; }
    sync(v){
      this.v = v; if (v._horizon) this.horizon = v._horizon; const sz = sizeOf(v); W = sz[0]; D = sz[1]; this.scale = Math.max(W/20, D/16);
      this.ctx = makeCtx(v); const env = envDef(v, this.ctx); this.envLabel = env.label;
      if (v._photo && !this.photoReady){ let u = null; try { u = localStorage.getItem('ma3ak:photo'); } catch(e){} if (u) this.loadPhoto(u); else { v._photo = false; } }
      $('#st-photo-tools', this.root).hidden = !v._photo; $('[data-hold="tiltu"]', this.root).hidden = $('[data-hold="tiltd"]', this.root).hidden = !!v._photo;
      if (env.sig !== this.envSig){ this.envSig = env.sig; this.r.load(env.def); this.envLights = this.r.scene.lights.slice(); this.items.forEach(it => { it.h = null; it.subs = []; }); this.fx = []; this.crowd = []; this.fxSig = this.crowdSig = null; this.ring = null; }
      if (!this.ring){ const g = new GL3D.Geo(); for (let i=0;i<40;i++){ const a0 = i/40*6.283, a1 = (i+1)/40*6.283; g.tube([Math.cos(a0),.04,Math.sin(a0)],[Math.cos(a1),.04,Math.sin(a1)],.035,'#C8A96B',{ e:2.5 }); } this.ring = this.r.addDyn(g, t => { if (this.sel) return mdl({ x:this.sel.x, z:this.sel.z, s:ITEMS[this.sel.type].r * (1 + .04*Math.sin(t*5)) }); const f = this.flash; if (f && t < f.until){ const k = 1 - (f.until - t)/1.6; return mdl({ x:f.x, z:f.z, s:f.r * (.6 + k*.7) }); } return null; }); }
      // merge auto layout + overrides + user-added items
      const ov = v._ov || {}, added = v._add || [];
      const auto = autoLayout(v).filter(a => !(ov[a.id] && ov[a.id].del));
      const fixedAuto = auto.filter(a => ov[a.id]).map(a => ({ ...a, x:ov[a.id].x, z:ov[a.id].z, ry:ov[a.id].ry ?? a.ry }));
      const fixed = fixedAuto.concat(added.map(a => ({ ...a })));
      const placed = placeAll(auto.filter(a => !ov[a.id]), fixed);
      const want = fixed.concat(placed);
      const sigOf = it => it.type + '|' + JSON.stringify(this.ctx) + '|' + (it.type === 'round' ? it.id : '');
      const keep = new Map(this.items.map(i => [i.id, i]));
      const next = [];
      want.forEach(w => { const old = keep.get(w.id); const sig = sigOf(w);
        if (old && old.sig === sig && old.h){ if (old !== this.drag?.item){ old.x = w.x; old.z = w.z; old.ry = w.ry; } next.push(old); keep.delete(w.id); }
        else { if (old){ this.removeItem(old); keep.delete(w.id); } next.push(this.createItem({ ...w, sig }, !old)); } });
      keep.forEach(it => this.removeItem(it));
      this.items = next;
      if (this.sel && !this.items.includes(this.sel)) this.select(null);
      this.refreshScene(); this.updateUI();
    }
    createItem(w, animate=true){
      const def = ITEMS[w.type], g = new GL3D.Geo(), lights = [], subs = [];
      const proxy = { addLight:(p, col, i, range, fl=0) => lights.push({ p, c:GL3D.hexD(col), i, range, flicker:fl, ph:Math.random()*9 }), dynamic:(build, update, opts={}) => subs.push({ build, update, opts }) };
      def.build(g, proxy, w.props || {}, this.ctx);
      const it = { ...w, lights, born: animate ? this.time : -9, lift:0 };
      it.h = this.r.addDyn(g, t => { if (this.hideAll){ it.m = null; return null; } const k = easeBack((t - it.born) / .55); it.m = mdl({ x:it.x, y:it.lift, z:it.z, ry:it.ry, s:Math.max(.01, k) }); return it.m; });
      it.subs = subs.map(s => { const sg = new GL3D.Geo(); s.build(sg); return this.r.addDyn(sg, (t, cam) => { const lm = s.update(t, cam); return lm && it.m ? GL3D.mul4(it.m, lm) : null; }, s.opts); });
      return it;
    }
    removeItem(it){ this.r.removeDyn(it.h); (it.subs||[]).forEach(s => this.r.removeDyn(s)); it.h = null; }
    refreshScene(){
      const fxSig = JSON.stringify([this.v.effects, this.v.balloons, this.v.lights, this.items.filter(i => ['dancefloor','dj','stage'].includes(i.type)).map(i => [i.type, i.x.toFixed(1), i.z.toFixed(1)]), this.ctx.cols]);
      if (fxSig !== this.fxSig){ this.fxSig = fxSig; this.fx.forEach(d => this.r.removeDyn(d)); this.fx = []; buildFx(this, this.v, this.items); }
      const crowdSig = JSON.stringify([this.v.guests, this.crowdScale ?? 1, this.items.map(i => [i.id, i.x.toFixed(1), i.z.toFixed(1)])]);
      if (crowdSig !== this.crowdSig){ this.crowdSig = crowdSig; this.crowd.forEach(d => this.r.removeDyn(d)); this.crowd = []; buildCrowd(this, this.v, this.items); }
    }
    lights(){
      const L = this.envLights.slice(), c = this.items;
      c.forEach(it => it.lights.forEach(l => { const cs = Math.cos(it.ry), sn = Math.sin(it.ry); L.push({ ...l, p:[it.x + l.p[0]*cs + l.p[2]*sn, l.p[1], it.z - l.p[0]*sn + l.p[2]*cs] }); }));
      return L.slice(0, 12);
    }
    frame(){
      if (!this.r.scene) return; const t = this.time, now = performance.now(); if (this._lf) this.r.adapt(now - this._lf); this._lf = now;
      const c = this.cam, gl_ = this.goal;
      if (c.auto && !this.drag) gl_.theta += .0016;
      if (!this.drag && Math.abs(this.vel) > .00005){ gl_.theta += this.vel; this.vel *= .9; }
      c.theta += (gl_.theta - c.theta) * .2; c.phi += (gl_.phi - c.phi) * .2; c.r += (gl_.r - c.r) * .2;
      if (gl_.target) for (let i=0;i<3;i++) c.target[i] += (gl_.target[i] - c.target[i]) * .1;
      this.r.scene.lights = this.lights(); this.r.render(this.reduced ? 2 : t, this.camera());
    }
    loop(){ cancelAnimationFrame(this.raf); const step = () => { if (!this.visible || document.hidden || !this.canvas.isConnected) return; this.frame(); this.raf = requestAnimationFrame(step); }; this.raf = requestAnimationFrame(step); }
    destroy(){ cancelAnimationFrame(this.raf); this.io.disconnect(); this.r.dispose(); const e = this.r.gl.getExtension('WEBGL_lose_context'); e && e.loseContext(); }
    render4K(){
      const cv = this.canvas, gl = this.r.gl, ow = cv.width, oh = cv.height, asp = ow / oh;
      const vp = gl.getParameter(gl.MAX_VIEWPORT_DIMS), lim = Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), gl.getParameter(gl.MAX_TEXTURE_SIZE), vp[0], vp[1]);
      const mobile = matchMedia('(max-width: 760px)').matches, target = Math.min(lim, mobile ? 2560 : 3840);
      let w = target, h = Math.round(target / asp); if (h > target){ h = target; w = Math.round(target * asp); }
      if (w < 1200) return null;
      const ss = this.r.ss; let url = null;
      try { this.r.ss = 1; cv.width = w; cv.height = h; this.frame(); url = cv.toDataURL('image/jpeg', .93); this.last4k = { w, h }; }
      catch(e){ url = null; }
      finally { this.r.ss = ss; cv.width = ow; cv.height = oh; this.frame(); }
      return url;
    }
    focusOn(type){
      const list = this.items.filter(i => i.type === type); if (!list.length) return false;
      const it = list.reduce((a, b) => (b.born > a.born ? b : a)); const def = ITEMS[it.type];
      this.goal.target = [it.x, def.hang ? 3.4 : Math.min(1.2, def.r*.4), it.z]; this.goal.r = Math.max(7, def.r*3.6) / (this.scale || 1); this.goal.phi = Math.max(this.goal.phi, .42);
      this.cam.auto = false; this.flash = { x:it.x, z:it.z, r:def.r, until:this.time + 1.6 }; this.focused = true; return true;
    }
    overview(){ this.goal.target = [0,.4,0]; this.goal.r = 22; this.goal.phi = .62; this.focused = false; }
    setCompare(on){ this.hideAll = !!on; }
    setGrid(on){ this.showGrid = !!on;
      if (on && (!this.gridH || !this.r.scene.dyn.includes(this.gridH))){ const g = new GL3D.Geo(), c = '#C8A96B';
        for (let x = -W/2; x <= W/2 + .01; x += 1) g.box(x, .012, 0, x % 2 === 0 ? .035 : .015, .004, D, c, { e:x % 2 === 0 ? 1.4 : .6 });
        for (let z = -D/2; z <= D/2 + .01; z += 1) g.box(0, .012, z, W, .004, z % 2 === 0 ? .035 : .015, c, { e:z % 2 === 0 ? 1.4 : .6 });
        this.gridH = this.r.addDyn(g, () => this.showGrid ? mdl({}) : null, { additive:true, noShadow:true }); } }
    planStats(){ const seatsPer = { round:8, long:10, imperial:20, sweetheart:2, kidstable:6, rows:20, sofa:4, cocktail:6 };
      const seats = this.items.reduce((s, it) => s + (seatsPer[it.type] || 0), 0);
      const used = this.items.filter(it => !ITEMS[it.type].hang).reduce((s, it) => s + Math.PI * ITEMS[it.type].r ** 2 * .62, 0);
      return { seats, area:W * D, used:Math.min(100, Math.round(used / (W * D) * 100)), W, D }; }
    capture(){ try { this.frame(); return this.canvas.toDataURL('image/jpeg', .9); } catch(e){ return null; } }
    loadPhoto(url){ const img = new Image(); img.onload = () => { this.r.setPhoto(img); this.photoReady = true; }; img.src = url; }
    async usePhoto(file){
      if (!file || !/^image\//.test(file.type)) { toast('Choose a photo file (JPG or PNG)', 'alert'); return; }
      const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const max = 2560, k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = Math.round(img.width*k); cv.height = Math.round(img.height*k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); const out = cv.toDataURL('image/jpeg', .9);
      try { localStorage.setItem('ma3ak:photo', out); } catch(e){ try { localStorage.setItem('ma3ak:photo', cv.toDataURL('image/jpeg', .7)); } catch(e2){} }
      this.r.setPhoto(cv); this.photoReady = true;
      this.v._photo = true; this.goal.theta = this.cam.theta = Math.PI/2; this.goal.r = this.cam.r = 22; this.cam.auto = false;
      $('#st-venues', this.root).hidden = true; this.onChange(this.v, 'venue'); this.sync(this.v); this.showMatch(true); toast('Photo added. Line it up with the horizon.', 'check');
    }
    showMatch(on){ $('#st-horizon', this.root).hidden = !on; $('#st-match', this.root).hidden = !on; ST._grid = on; if (on) this.placeHorizon(); }
    placeHorizon(){ const el = $('#st-horizon', this.root); el.style.top = ((1 - (this.horizon*.5 + .5)) * 100) + '%'; }
    select(it){ this.sel = it; const box = $('#st-sel', this.root); if (it){ $('#st-sel-name', this.root).textContent = ITEMS[it.type].name; box.hidden = false; } else box.hidden = true; $('#st-move', this.root).hidden = !it; $('#st-hint', this.root).hidden = !!it || this.items.length === 0; }
    updateUI(){
      $('#st-venue', this.root).innerHTML = icon('building','sm') + esc(this.envLabel) + icon('chevron','sm');
      const n = this.items.length; $('#st-count', this.root).textContent = n ? `${n} ${n === 1 ? 'item' : 'items'} in your design` : 'Empty venue';
      $('#st-empty', this.root).hidden = n > 0; if (!this.sel) $('#st-hint', this.root).hidden = n === 0;
    }
    commit(it){
      const v = this.v; if (it.id.startsWith('u')){ const a = (v._add || []).find(x => x.id === it.id); if (a){ a.x = it.x; a.z = it.z; a.ry = it.ry; } }
      else { v._ov = v._ov || {}; v._ov[it.id] = { x:it.x, z:it.z, ry:it.ry }; }
      this.onChange(v, true); this.refreshScene();
    }
    apply(msg){ this.onChange(this.v, 'venue'); this.sync(this.v); this.markVenue(); toast(msg, 'check'); }
    markVenue(){ const v = this.v, cur = venueOf(v), sz = sizeOf(v), t = timeOf(v);
      $$('[data-venue]', this.root).forEach(b => b.setAttribute('aria-pressed', VENUES[b.dataset.venue] === cur));
      $$('[data-time]', this.root).forEach(b => b.setAttribute('aria-pressed', ({ 'Lunch / afternoon':'day', Sunset:'sunset', Evening:'night' })[b.dataset.time] === t));
      $$('[data-size]', this.root).forEach(b => b.setAttribute('aria-pressed', SIZES[b.dataset.size][0] === sz[0])); }
    addItem(type, at){
      const v = this.v, def = ITEMS[type]; let p = at;
      if (!p){ const spot = placeAll([{ id:'tmp', type, pref:[0,1], ry:0 }], this.items)[0]; p = spot ? [spot.x, spot.z] : [0,0]; }
      const it = { id:'u' + Date.now().toString(36) + Math.random().toString(36).slice(2,5), type, x:Math.max(-W/2+.5, Math.min(W/2-.5, p[0])), z:Math.max(-D/2+.5, Math.min(D/2-.5, p[1])), ry:0 };
      v._add = (v._add || []).concat([it]); this.onChange(v); this.sync(v); this.select(this.items.find(i => i.id === it.id)); toast(`${def.name} added`, 'plus');
    }
    act(kind){
      const v = this.v, it = this.sel; if (!it) return;
      if (kind === 'rotate'){ it.ry += Math.PI/4; this.commit(it); }
      if (kind === 'dup'){ this.addItem(it.type, [it.x + 1.4, it.z + 1.2]); }
      if (kind === 'del'){ if (it.id.startsWith('u')) v._add = (v._add || []).filter(x => x.id !== it.id); else { v._ov = v._ov || {}; v._ov[it.id] = { del:1 }; } this.select(null); this.onChange(v); this.sync(v); }
      if (kind === 'done') this.select(null);
    }
    moveSel(dx, dz){ const it = this.sel; if (!it) return; const th = this.cam.theta; // camera-relative: forward is toward the target
      const fx = -Math.cos(th), fz = -Math.sin(th), rx = -fz, rz = fx; const r = ITEMS[it.type].r * .5;
      it.x = Math.max(-W/2 + r, Math.min(W/2 - r, it.x + rx*dx + fx*dz)); it.z = Math.max(-D/2 + r, Math.min(D/2 - r, it.z + rz*dx + fz*dz)); this.commit(it); }
    bind(){
      const cv = this.canvas, pts = new Map(); let pinch = null;
      const stopAuto = () => { this.cam.auto = false; const b = $('[data-st="spin"]', this.root); b && b.setAttribute('aria-pressed','false'); };
      cv.addEventListener('pointerdown', e => {
        stopAuto(); cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); this.vel = 0;
        if (pts.size === 2){ const [a, b] = [...pts.values()]; pinch = { d:Math.hypot(a[0]-b[0], a[1]-b[1]), r:this.goal.r }; this.drag = null; return; }
        const h = this.ray(e.clientX, e.clientY), it = h && this.pick(h);
        if (it && it === this.sel){ this.drag = { item:it, off:[it.x - h[0], it.z - h[1]], moved:false, x:e.clientX, y:e.clientY }; it.lift = .15; cv.style.cursor = 'grabbing'; }
        else this.drag = { orbit:true, x:e.clientX, y:e.clientY, lx:e.clientX, th:this.goal.theta, ph:this.goal.phi, moved:false, tap:it || null };
      });
      cv.addEventListener('pointermove', e => {
        if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pinch && pts.size === 2){ const [a, b] = [...pts.values()]; this.goal.r = Math.max(5, Math.min(40, pinch.r * pinch.d / Math.max(20, Math.hypot(a[0]-b[0], a[1]-b[1])))); return; }
        const d = this.drag;
        if (!d){ const h = this.ray(e.clientX, e.clientY), it = h && this.pick(h); cv.style.cursor = it ? (it === this.sel ? 'move' : 'pointer') : 'grab'; return; }
        if (d.item){ if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return; const h = this.ray(e.clientX, e.clientY); if (!h) return; const r = ITEMS[d.item.type].r * .5; d.item.x = Math.max(-W/2 + r, Math.min(W/2 - r, h[0] + d.off[0])); d.item.z = Math.max(-D/2 + r, Math.min(D/2 + (d.item.type === 'car' ? 5 : 0) - r, h[1] + d.off[1])); if (this.snap){ d.item.x = Math.round(d.item.x * 2) / 2; d.item.z = Math.round(d.item.z * 2) / 2; } d.moved = true; return; }
        const dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true; if (!d.moved) return;
        this.goal.theta = d.th - dx * .006; this.vel = -(e.clientX - d.lx) * .006 * .5; d.lx = e.clientX;
        if (!(this.v && this.v._photo)) this.goal.phi = Math.max(.15, Math.min(1.45, d.ph + dy * .004));
      });
      const end = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; const d = this.drag; this.drag = null; cv.style.cursor = 'grab';
        if (!d) return; if (d.item){ d.item.lift = 0; if (d.moved) this.commit(d.item); return; }
        if (!d.moved){ this.vel = 0; this.select(d.tap); } };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      cv.addEventListener('keydown', e => { const it = this.sel, k = e.key;
        if (it && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k)){ e.preventDefault(); const s = .5; this.moveSel(k === 'ArrowLeft' ? -s : k === 'ArrowRight' ? s : 0, k === 'ArrowUp' ? s : k === 'ArrowDown' ? -s : 0); }
        else if (!it && (k === 'ArrowLeft' || k === 'ArrowRight')){ e.preventDefault(); stopAuto(); this.goal.theta += k === 'ArrowLeft' ? -.25 : .25; }
        if (it && (k === 'r' || k === 'R')) this.act('rotate'); if (it && (k === 'Delete' || k === 'Backspace')){ e.preventDefault(); this.act('del'); } if (k === 'Escape') this.select(null); });
      // hold-to-repeat for view and move buttons
      let rep = null; const stopRep = () => { clearInterval(rep); rep = null; };
      const viewStep = k => { stopAuto(); const G = this.goal;
        if (k === 'rotl') G.theta -= .12; if (k === 'rotr') G.theta += .12; if (k === 'tiltu') G.phi = Math.min(1.45, G.phi + .06); if (k === 'tiltd') G.phi = Math.max(.15, G.phi - .06);
        if (k === 'zoomin') G.r = Math.max(5, G.r - 1.6); if (k === 'zoomout') G.r = Math.min(40, G.r + 1.6);
        if (k === 'mv-l') this.moveSel(-.5, 0); if (k === 'mv-r') this.moveSel(.5, 0); if (k === 'mv-u') this.moveSel(0, .5); if (k === 'mv-d') this.moveSel(0, -.5); };
      this.root.addEventListener('pointerdown', e => { const b = e.target.closest('[data-hold]'); if (!b) return; e.preventDefault(); viewStep(b.dataset.hold); stopRep(); rep = setInterval(() => viewStep(b.dataset.hold), 90); });
      ['pointerup','pointercancel','pointerleave'].forEach(ev => this.root.addEventListener(ev, e => { if (e.target.closest && e.target.closest('[data-hold]')) stopRep(); }));
      document.addEventListener('pointerup', stopRep);
      this.root.addEventListener('keydown', e => { const b = e.target.closest('[data-hold]'); if (b && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); viewStep(b.dataset.hold); } });
      this.root.addEventListener('click', e => {
        const b = e.target.closest('[data-st]'); const c = e.target.closest('[data-pcat]');
        if (c){ $$('[data-pcat]', this.root).forEach(x => x.setAttribute('aria-selected', x === c ? 'true' : 'false')); $$('[data-pgrid]', this.root).forEach(g => g.hidden = g.dataset.pgrid !== c.dataset.pcat); }
        if (!b) return; const k = b.dataset.st;
        if (k === 'top'){ stopAuto(); const on = this.goal.phi < 1.3; this.goal.phi = on ? 1.42 : .62; b.setAttribute('aria-pressed', on); }
        if (k === 'style'){ GL3D.style = GL3D.style === 'illustrated' ? 'realistic' : 'illustrated'; try { localStorage.setItem('ma3ak:style', GL3D.style); } catch(e){} b.textContent = GL3D.style === 'illustrated' ? 'Illustrated' : 'Realistic'; toast(`${b.textContent} graphics`, 'sparkle'); }
        if (k === 'render4k'){ b.disabled = true; b.textContent = 'Rendering…'; setTimeout(() => { const url = this.render4K(); b.disabled = false; b.textContent = '4K photo';
          if (!url) { toast('This device can’t make a 4K picture. Try a computer.', 'alert'); return; }
          openModal({ title:'Your design in 4K', wide:true, body:`<p class="muted small" style="margin:-.5rem 0 1rem">${this.last4k.w} × ${this.last4k.h} pixels. Press and hold (or right-click) the picture to save it.</p><img src="${url}" alt="Your event design rendered in 4K" style="width:100%;border-radius:12px;display:block">` }); }, 60); }
        if (k === 'front'){ stopAuto(); this.goal.theta = Math.PI/2; this.goal.phi = .42; }
        if (k === 'spin'){ this.cam.auto = !this.cam.auto; b.setAttribute('aria-pressed', this.cam.auto); }
        if (k === 'reset'){ this.v._ov = {}; this.v._add = []; this.select(null); this.onChange(this.v); this.sync(this.v); toast('Layout reset to your choices', 'refresh'); }
        if (k === 'palette'){ const p = $('#st-palette', this.root); p.hidden = !p.hidden; b.setAttribute('aria-expanded', !p.hidden); $('#st-venues', this.root).hidden = true; }
        if (k === 'venues'){ const p = $('#st-venues', this.root); p.hidden = !p.hidden; b.setAttribute('aria-expanded', !p.hidden); $('#st-palette', this.root).hidden = true; this.markVenue(); }
        if (k === 'close-venues') $('#st-venues', this.root).hidden = true;
        if (k === 'close-palette'){ $('#st-palette', this.root).hidden = true; $('[data-st="palette"]', this.root).setAttribute('aria-expanded','false'); }
        if (k === 'upload') $('#st-file', this.root).click();
        if (k === 'adjust') this.showMatch(true);
        if (k === 'match-done') this.showMatch(false);
        if (k === 'grid'){ ST._grid = !ST._grid; b.setAttribute('aria-pressed', ST._grid); }
        if (k === 'remove-photo'){ this.v._photo = false; try { localStorage.removeItem('ma3ak:photo'); } catch(e){} this.photoReady = false; this.showMatch(false); this.apply('Back to 3D venues'); }
        if (b.dataset.venue){ this.v._photo = false; this.showMatch(false); this.v.venueType = [b.dataset.venue]; if (b.dataset.venue === 'Boat / yacht') this.v.setting = 'Outdoor'; this.apply(`Venue: ${b.textContent.trim()}`); }
        if (b.dataset.time){ this.v.timeOfDay = b.dataset.time; this.apply(`Time: ${b.textContent.trim()}`); }
        if (b.dataset.size){ this.v.venueSize = b.dataset.size; this.apply(`Size: ${b.dataset.size}`); }
        if (['rotate','dup','del','done'].includes(k)) this.act(k);
      });
      $('#st-file', this.root).addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) this.usePhoto(f).catch(() => toast('That photo couldn’t be opened', 'alert')); e.target.value = ''; });
      $('#st-size', this.root).addEventListener('input', e => { this.goal.r = +e.target.value; });
      // horizon handle
      const hz = $('#st-horizon', this.root); let hd = false;
      hz.addEventListener('pointerdown', e => { hd = true; hz.setPointerCapture(e.pointerId); e.preventDefault(); });
      hz.addEventListener('pointermove', e => { if (!hd) return; const rc = cv.getBoundingClientRect(); const y = Math.max(.02, Math.min(.98, (e.clientY - rc.top) / rc.height)); this.horizon = Math.max(.05, (1 - y)*2 - 1); this.placeHorizon(); });
      hz.addEventListener('pointerup', () => { hd = false; this.v._horizon = this.horizon; this.onChange(this.v); });
      hz.addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown'){ e.preventDefault(); this.horizon = Math.max(.05, Math.min(.95, this.horizon + (e.key === 'ArrowUp' ? .03 : -.03))); this.placeHorizon(); this.v._horizon = this.horizon; this.onChange(this.v); } });
      // palette: tap to add, or drag onto the venue
      let pd = null, ghost = null;
      this.root.addEventListener('pointerdown', e => { const c = e.target.closest('[data-add]'); if (!c) return; e.preventDefault(); pd = { type:c.dataset.add, x:e.clientX, y:e.clientY, moved:false }; c.setPointerCapture(e.pointerId); });
      this.root.addEventListener('pointermove', e => { if (!pd) return; if (!pd.moved && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 8){ pd.moved = true; ghost = document.createElement('div'); ghost.className = 'st-ghost'; ghost.innerHTML = icon(ITEMS[pd.type].icon,'sm') + esc(ITEMS[pd.type].name); document.body.appendChild(ghost); $('#st-palette', this.root).classList.add('dragging'); }
        if (ghost){ ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; const rc = cv.getBoundingClientRect(), over = e.clientX > rc.left && e.clientX < rc.right && e.clientY > rc.top && e.clientY < rc.bottom; ghost.classList.toggle('ok', over && !!this.ray(e.clientX, e.clientY)); } });
      const pend = e => { if (!pd) return; const p = pd; pd = null; $('#st-palette', this.root).classList.remove('dragging'); if (ghost){ ghost.remove(); ghost = null; }
        if (!p.moved){ this.addItem(p.type); return; }
        const rc = cv.getBoundingClientRect(); if (e.clientX > rc.left && e.clientX < rc.right && e.clientY > rc.top && e.clientY < rc.bottom){ const h = this.ray(e.clientX, e.clientY); if (h) this.addItem(p.type, h); } };
      this.root.addEventListener('pointerup', pend); this.root.addEventListener('pointercancel', () => { pd = null; if (ghost){ ghost.remove(); ghost = null; } });
      this.root.addEventListener('keydown', e => { const c = e.target.closest('[data-add]'); if (c && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); this.addItem(c.dataset.add); } });
    }
  }
  function markup(){
    return `<div class="studio" id="studio">
      <canvas class="studio-canvas" tabindex="0" aria-label="3D event designer. Drag items to move them, drag empty space to look around. With an item selected, use arrow keys to move it, R to rotate, Delete to remove."></canvas>
      <div class="st-top"><button type="button" class="st-chip st-chip-btn" id="st-venue" data-st="venues"></button>
        <div class="st-tools" role="toolbar" aria-label="Layout">
          <button type="button" data-st="spin" aria-pressed="true" title="Auto-rotate">${icon('refresh','sm')}<span class="sr-only">Auto-rotate</span></button>
          <button type="button" data-st="top" aria-pressed="false" title="Top view">${icon('layers','sm')}<span class="sr-only">Top view</span></button>
          <button type="button" data-st="style" class="st-text" title="Switch graphics style" aria-label="Graphics style">${GL3D.style === 'illustrated' ? 'Illustrated' : 'Realistic'}</button>
          <button type="button" data-st="render4k" class="st-text" title="Save a 4K picture of your design">4K photo</button>
          <button type="button" data-st="reset" title="Reset layout" class="st-text">Reset</button>
        </div></div>
      <div class="st-pad" role="toolbar" aria-label="Move the view">
        <button type="button" data-hold="tiltu" title="Look from higher" aria-label="Look from higher">${icon('chevron','sm up')}</button>
        <div><button type="button" data-hold="rotl" title="Turn left" aria-label="Turn left">${icon('chevron','sm left')}</button><button type="button" data-st="front" class="st-pad-c" title="Front view" aria-label="Front view">${icon('eye','sm')}</button><button type="button" data-hold="rotr" title="Turn right" aria-label="Turn right">${icon('chevron','sm right')}</button></div>
        <button type="button" data-hold="tiltd" title="Look from lower" aria-label="Look from lower">${icon('chevron','sm')}</button>
        <div class="st-zoom"><button type="button" data-hold="zoomout" aria-label="Zoom out">${icon('minus','sm')}</button><button type="button" data-hold="zoomin" aria-label="Zoom in">${icon('plus','sm')}</button></div>
      </div>
      <div class="st-move" id="st-move" hidden role="toolbar" aria-label="Move selected item"><span>Move</span>
        <button type="button" data-hold="mv-l" aria-label="Move left">${icon('chevron','sm left')}</button><button type="button" data-hold="mv-u" aria-label="Move away">${icon('chevron','sm up')}</button><button type="button" data-hold="mv-d" aria-label="Move closer">${icon('chevron','sm')}</button><button type="button" data-hold="mv-r" aria-label="Move right">${icon('chevron','sm right')}</button></div>
      <div class="st-horizon" id="st-horizon" hidden tabindex="0" role="slider" aria-label="Horizon line: drag to where the ground meets the sky in your photo"><span>Drag me to the horizon in your photo</span></div>
      <div class="st-match" id="st-match" hidden><label>Size of things <input type="range" id="st-size" min="8" max="40" step="0.5" value="22"></label><button type="button" data-st="grid" aria-pressed="true">Grid</button><button type="button" class="st-done" data-st="match-done">Done</button></div>
      <input type="file" id="st-file" accept="image/*" hidden>
      <div class="st-empty" id="st-empty"><b>Your venue is empty</b><span>Answer the steps or add items here, and watch your event build itself.</span></div>
      <p class="st-hint" id="st-hint">Drag to look around. Tap an item to select it, then drag it to move.</p>
      <div class="st-sel" id="st-sel" hidden role="toolbar" aria-label="Selected item"><b id="st-sel-name"></b><span class="st-sel-tip">Drag it to move</span>
        <button type="button" data-st="rotate">${icon('refresh','sm')}Rotate</button><button type="button" data-st="dup">${icon('copy','sm')}Duplicate</button><button type="button" data-st="del">${icon('x','sm')}Delete</button><button type="button" data-st="done">Done</button></div>
      <div class="st-bottom"><span class="st-chip" id="st-count"></span><div class="st-actions"><button type="button" class="btn btn-sm st-venue-btn" data-st="venues" aria-expanded="false" aria-controls="st-venues">${icon('building','sm')}Venue</button><button type="button" class="btn btn-light btn-sm" data-st="palette" aria-expanded="false" aria-controls="st-palette">${icon('plus','sm')}Add items</button></div></div>
      <div class="st-palette st-venues" id="st-venues" hidden>
        <div class="st-ph"><b class="st-ptitle">Choose your venue</b><button type="button" class="icon-btn" data-st="close-venues" aria-label="Close">${icon('x','sm')}</button></div>
        <div class="st-vbody">
          <div class="st-photo-row"><button type="button" class="st-upload" data-st="upload">${icon('image')}<span><b>Use a photo of your own venue</b><small>Your garden, terrace, hall… We’ll place your event on it.</small></span></button>
            <span id="st-photo-tools" hidden><button type="button" class="st-seg" data-st="adjust">Line up photo</button><button type="button" class="st-seg" data-st="remove-photo">Remove photo</button></span></div>
          <div class="st-pgrid st-vgrid">${VENUE_PICK.map(([k,l,i]) => `<button type="button" class="st-item" data-st="v" data-venue="${l}" aria-pressed="false">${icon(i)}<span>${esc(l.split(' (')[0].replace(' / beach club','').replace(' / hotel','').replace(' / château','').replace(' / private house',' & pool').replace(' / marquee',''))}</span></button>`).join('')}</div>
          <div class="st-vrow"><span>Time</span>${[['Lunch / afternoon','Day'],['Sunset','Sunset'],['Evening','Night']].map(([val,l]) => `<button type="button" class="st-seg" data-st="t" data-time="${val}" aria-pressed="false">${l}</button>`).join('')}</div>
          <div class="st-vrow"><span>Size</span>${Object.keys(SIZES).map(k => `<button type="button" class="st-seg" data-st="s" data-size="${k}" aria-pressed="false">${k.split(' (')[0]}<small>${k.match(/\((.*)\)/)[1]}</small></button>`).join('')}</div>
        </div>
      </div>
      <div class="st-palette" id="st-palette" hidden>
        <div class="st-ph"><div class="st-pcats" role="tablist">${CATS.map(([k,l],i) => `<button type="button" role="tab" data-pcat="${k}" aria-selected="${i===0}">${l}</button>`).join('')}</div><button type="button" class="icon-btn" data-st="close-palette" aria-label="Close">${icon('x','sm')}</button></div>
        ${CATS.map(([k],i) => `<div class="st-pgrid" data-pgrid="${k}" ${i?'hidden':''}>${Object.entries(ITEMS).filter(([,d]) => d.cat === k).map(([t,d]) => `<button type="button" class="st-item" data-add="${t}" title="Click to add, or drag onto the venue">${icon(d.icon)}<span>${esc(d.name)}</span></button>`).join('')}</div>`).join('')}
        <p class="st-ptip">Tap to add, or drag an item onto the venue.</p>
      </div>
    </div>`;
  }
  function describe(v){
    const items = []; const ov = v._ov || {}, added = v._add || [];
    const auto = autoLayout(v).filter(a => !(ov[a.id] && ov[a.id].del));
    const all = auto.concat(added); const count = {}; all.forEach(i => count[ITEMS[i.type].name] = (count[ITEMS[i.type].name] || 0) + 1);
    const sz = sizeOf(v); W = sz[0]; D = sz[1]; const ctx = makeCtx(v); const env = envDef(v, ctx);
    return { photo:!!v._photo, venue:env.label, items:Object.entries(count).map(([n,c]) => c > 1 ? `${c}× ${n}` : n), custom: added.length + Object.keys(ov).length };
  }
  function envThumb(label, timeVal){
    const v = { venueType:[label], timeOfDay:timeVal }, sw = W, sd = D; W = 20; D = 16; const ctx = makeCtx(v), e = envDef(v, ctx); W = sw; D = sd;
    return { ...e.def, bloom:.4, cam:{ target:[0,0,0], r:31, phi:.58, theta:.85, fov:.66 }, build(g, sc){ const a = W, b = D; W = 20; D = 16; try { e.def.build(g, sc); } finally { W = a; D = b; } } };
  }
  return { Studio, markup, describe, ITEMS, makeCtx, envThumb, VENUE_PICK, SIZES, venueOf, INDOOR, sizeOf };
})();
