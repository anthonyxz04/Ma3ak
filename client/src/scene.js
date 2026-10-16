/* =========================================================
   3D EVENT SCENES — isometric illustrations rendered as SVG.
   Example visualizations only; not real venues.
   ========================================================= */
const ISO_S = 30;
const P = (x, y, z=0) => [(x - y) * 0.8660 * ISO_S, (x + y) * 0.5 * ISO_S - z * ISO_S];
const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
function shade(hex, k){
  const h = hex.replace('#',''); const c = [0,2,4].map(i => parseInt(h.slice(i,i+2),16));
  return 'rgb(' + c.map(v => Math.round(Math.max(0, Math.min(255, k <= 1 ? v * k : v + (255 - v) * (k - 1))))).join(',') + ')';
}
function makeScene(){
  const items = [];
  const S = {
    add(d, svg){ items.push({ d, svg }); return S; },
    poly(points, fill, d=-100, extra=''){ return S.add(d, `<polygon points="${pts(points)}" fill="${fill}" ${extra}/>`); },
    box(x, y, z, w, dp, h, col, o={}){
      const top = [P(x,y,z+h), P(x+w,y,z+h), P(x+w,y+dp,z+h), P(x,y+dp,z+h)];
      const fx = [P(x+w,y,z), P(x+w,y+dp,z), P(x+w,y+dp,z+h), P(x+w,y,z+h)];
      const fy = [P(x,y+dp,z), P(x+w,y+dp,z), P(x+w,y+dp,z+h), P(x,y+dp,z+h)];
      const st = o.stroke ? ` stroke="${o.stroke}" stroke-width=".5"` : '';
      return S.add(o.depth ?? (x + w/2 + y + dp/2 + z*0.02),
        `<polygon points="${pts(fy)}" fill="${shade(col, o.ky ?? .88)}"${st}/><polygon points="${pts(fx)}" fill="${shade(col, o.kx ?? .74)}"${st}/><polygon points="${pts(top)}" fill="${o.top || shade(col, 1.06)}"${st}/>` + (o.after || ''));
    },
    cyl(cx, cy, z, r, h, col, o={}){
      const c = P(cx, cy, z), t = P(cx, cy, z + h), rx = 1.2247 * r * ISO_S, ry = 0.7071 * r * ISO_S;
      const side = `<path d="M${(c[0]-rx).toFixed(1)} ${t[1].toFixed(1)} L${(c[0]-rx).toFixed(1)} ${c[1].toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(c[0]+rx).toFixed(1)} ${c[1].toFixed(1)} L${(c[0]+rx).toFixed(1)} ${t[1].toFixed(1)} Z" fill="${o.side || shade(col,.84)}"/>`;
      const top = `<ellipse cx="${t[0].toFixed(1)}" cy="${t[1].toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${o.top || shade(col,1.04)}"/>`;
      return S.add(o.depth ?? (cx + cy + z*0.02), side + top + (o.after || ''));
    },
    ball(x, y, z, r, col, o={}){
      const p = P(x, y, z);
      return S.add(o.depth ?? (x + y + z*0.02), `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r*ISO_S).toFixed(1)}" fill="${col}"${o.op?` opacity="${o.op}"`:''}/>` + (o.hl ? `<circle cx="${(p[0]-r*ISO_S*.35).toFixed(1)}" cy="${(p[1]-r*ISO_S*.35).toFixed(1)}" r="${(r*ISO_S*.28).toFixed(1)}" fill="#fff" opacity=".45"/>` : ''));
    },
    line(a, b, col, w=1, d=999, extra=''){ const p = P(...a), q = P(...b); return S.add(d, `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" ${extra}/>`); },
    glow(x, y, z, r, col, d=999, op=.35){ const p = P(x, y, z); return S.add(d, `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r*ISO_S).toFixed(1)}" fill="url(#glow-${col})" opacity="${op}"/>`); },
    strand(a, b, sag, n, d=999){
      const pt = t => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t - sag*4*t*(1-t)];
      let path = []; for (let i=0;i<=24;i++) path.push(P(...pt(i/24)));
      let svg = `<polyline points="${pts(path)}" fill="none" stroke="#5b5145" stroke-width=".8" opacity=".8"/>`;
      for (let i=1;i<n;i++){ const q = P(...pt(i/n)); svg += `<circle cx="${q[0].toFixed(1)}" cy="${(q[1]+3).toFixed(1)}" r="7" fill="url(#glow-warm)" opacity=".55"/><circle cx="${q[0].toFixed(1)}" cy="${(q[1]+3).toFixed(1)}" r="1.9" fill="#FFE7B0"/>`; }
      return S.add(d, svg);
    },
    render(){ return items.sort((a,b) => a.d - b.d).map(i => i.svg).join(''); }
  };
  return S;
}

/* ---------- reusable objects ---------- */
function roundTable(S, cx, cy, o={}){
  const cloth = o.cloth || '#F4EFE6', chair = o.chair || '#C8A96B', n = o.n || 8, R = 1.32;
  for (let k=0;k<n;k++){ const a = k/n*Math.PI*2 + .3, x = cx + R*Math.cos(a), y = cy + R*Math.sin(a);
    const bx = x + .22*Math.cos(a), by = y + .22*Math.sin(a);
    S.box(x-.18, y-.18, 0, .36, .36, .46, chair, { depth:x+y });
    S.box(bx-.08, by-.08, .46, .16, .16, .62, chair, { depth:bx+by+.01 }); }
  S.cyl(cx, cy, 0, .98, .76, cloth, { depth:cx+cy+.05, side:shade(cloth,.86) });
  if (o.center !== false){
    S.cyl(cx, cy, .76, .07, .55, '#d9d2c7', { depth:cx+cy+.06 });
    const fl = o.flowers || ['#F3E6E0','#E8CFC6','#FFFFFF','#9DAE8C'];
    [[0,0,1.42,.24],[.12,.08,1.32,.18],[-.12,.1,1.3,.17],[.05,-.14,1.33,.16],[-.08,-.08,1.5,.15]].forEach(([dx,dy,z,r],i) => S.ball(cx+dx, cy+dy, z, r, fl[i%fl.length], { depth:cx+cy+.07+i*.001 }));
    S.glow(cx+.45, cy+.2, .8, .5, 'warm', cx+cy+.08, .5);
  }
}
function person(S, x, y, col, o={}){
  S.cyl(x, y, 0, .17, 1.05, col, { depth:x+y+.02 });
  S.ball(x, y, 1.28, .15, o.skin || '#D9B79A', { depth:x+y+.03 });
}
function speaker(S, x, y, z=0){ S.box(x, y, z, .5, .45, 1.5, '#1d1c1b', { depth:x+y+.3, top:'#2a2826' }); }
function djBooth(S, x, y, z=0){
  S.box(x, y, z, 1.7, .75, .95, '#1b1a19', { top:'#2b2926' });
  S.box(x+.2, y+.15, z+.95, .5, .45, .05, '#3a3836', { depth:x+y+1.5 }); S.box(x+1, y+.15, z+.95, .5, .45, .05, '#3a3836', { depth:x+y+1.5 });
  S.glow(x+.85, y+.4, z+1.2, .9, 'gold', x+y+1.6, .5);
}
function danceFloor(S, x0, y0, w, d, a, b){
  for (let i=0;i<w;i++) for (let j=0;j<d;j++){ const x=x0+i, y=y0+j; S.poly([P(x,y,.01),P(x+1,y,.01),P(x+1,y+1,.01),P(x,y+1,.01)], (i+j)%2 ? a : b, -50); }
}
function cake(S, x, y, z, tiers=3, col='#FBF7F0'){
  let zz = z; [.42,.32,.22,.14].slice(0,tiers).forEach((r,i) => { S.cyl(x, y, zz, r, .3, col, { depth:x+y+.1+i*.01, side:shade(col,.9) }); zz += .3; });
  S.ball(x, y, zz+.05, .07, '#E8CFC6', { depth:x+y+.2 });
}
function room(S, o){
  const W = 12, D = 12, H = o.h || 4.2;
  S.poly([P(0,0,0),P(0,D,0),P(0,D,H),P(0,0,H)], o.wallL, -300);
  S.poly([P(0,0,0),P(W,0,0),P(W,0,H),P(0,0,H)], o.wallR, -300);
  S.poly([P(0,0,0),P(W,0,0),P(W,D,0),P(0,D,0)], o.floor, -290);
  let lines = '';
  for (let i=1;i<12;i++){ const a=P(i,0,0), b=P(i,D,0), c=P(0,i,0), d=P(W,i,0); lines += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/><line x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}"/>`; }
  S.add(-280, `<g stroke="${o.grid}" stroke-width=".6" opacity=".55">${lines}</g>`);
  // baseboards
  S.poly([P(0,0,0),P(0,D,0),P(0,D,.18),P(0,0,.18)], shade(o.wallL.startsWith('#')?o.wallL:'#888888',.85), -299);
  S.poly([P(0,0,0),P(W,0,0),P(W,0,.18),P(0,0,.18)], shade(o.wallR.startsWith('#')?o.wallR:'#888888',.85), -299);
  if (o.arches){ // arched wall panels
    const arch = (plane, a) => { const p = []; const z0=.7, z1=2.7, w=1.3;
      for (let t=0;t<=12;t++){ const ang = Math.PI*(t/12); const u = a + w/2 - Math.cos(ang)*w/2, z = z1 + Math.sin(ang)*w/2; p.push(plane==='L'?P(0,u,z):P(u,0,z)); }
      p.unshift(plane==='L'?P(0,a,z0):P(a,0,z0)); p.push(plane==='L'?P(0,a+w,z0):P(a+w,0,z0)); return p; };
    [1.2,3.4,9.8].forEach(a => S.poly(arch('L',a), o.archFill, -298, `stroke="${o.archLine}" stroke-width=".8"`));
    [.9,10.1].forEach(a => S.poly(arch('R',a), o.archFill, -298, `stroke="${o.archLine}" stroke-width=".8"`));
  }
}

/* ---------- presets ---------- */
const SCENES = {
  wedding: {
    label:'Wedding', sky:['#16140f','#221e18'],
    cats:['venue','catering','decoration','florist','dj','lighting','cake'],
    build(S){
      room(S, { wallL:'#E7DFD2', wallR:'#DDD3C3', floor:'#CBB99F', grid:'#B4A285', arches:true, archFill:'#EFE9DF', archLine:'#CDBFA9' });
      // stage + DJ
      S.box(3, .15, 0, 6, 2.1, .32, '#3a3430', { top:'#4a433d' });
      djBooth(S, 5.2, .6, .32); speaker(S, 3.5, .5, .32); speaker(S, 8.1, .5, .32);
      danceFloor(S, 4, 3, 4, 3, '#2d2a27', '#3b3733');
      // floral arch
      const ay0 = 5.2, ay1 = 7.4, ax = .55;
      S.box(ax-.06, ay0-.06, 0, .12, .12, 2.1, '#d8cbb3', { depth:ax+ay0 }); S.box(ax-.06, ay1-.06, 0, .12, .12, 2.1, '#d8cbb3', { depth:ax+ay1 });
      const fl = ['#FFFFFF','#F1DCD5','#E7C9BE','#9DAE8C','#F7EFE6'];
      for (let i=0;i<=26;i++){ const t = i/26*Math.PI; const y = (ay0+ay1)/2 - Math.cos(t)*(ay1-ay0)/2, z = 2.1 + Math.sin(t)*1.1; S.ball(ax, y, z, .17 + (i%3)*.03, fl[i%5], { depth:ax+y+.5 }); }
      for (let i=0;i<8;i++){ S.ball(ax+.1, ay0+(i%2)*.2, .25+i*.25, .16, fl[(i+1)%5], { depth:ax+ay0+.5 }); S.ball(ax+.1, ay1-(i%2)*.2, .25+i*.25, .16, fl[(i+2)%5], { depth:ax+ay1+.5 }); }
      // tables
      roundTable(S, 2.6, 2.8); roundTable(S, 10.1, 4); roundTable(S, 10.1, 7.9); roundTable(S, 6.8, 9.9); roundTable(S, 2.9, 9.9);
      // cake table
      S.box(5.6, 7.1, 0, 1.4, .8, .78, '#F4EFE6'); cake(S, 6.3, 7.5, .78);
      // guests
      person(S, 5, 4, '#1f1d1b'); person(S, 5.6, 4.2, '#EDE6DA'); person(S, 6.8, 4.9, '#2b2825'); person(S, 7.2, 4.5, '#C8A96B'); person(S, 5.4, 5.6, '#7b6a58');
      // string lights + chandeliers
      [[1.5,0],[4.5,0],[7.5,0]].forEach(([x],i) => S.strand([0, 2 + i*3.4, 4.1], [x+2.5, 0, 4.1], .9, 14, 2000+i));
      [[2.6,2.8],[6.8,9.9],[10.1,4]].forEach(([x,y],i) => { S.line([x,y,5.4],[x,y,3.5],'#8a7a62',.8,1900+i); S.ball(x,y,3.4,.2,'#F5E3B5',{ depth:1901+i }); S.glow(x,y,3.4,1.4,'warm',1902+i,.6); });
    }
  },
  birthday: {
    label:'Birthday', sky:['#1a1513','#241c19'],
    cats:['venue','decoration','cake','dj','entertainment','catering'],
    build(S){
      room(S, { wallL:'#EFE3D9', wallR:'#E6D6C9', floor:'#D7C6B0', grid:'#C0AD93' });
      // banner + balloon garland on right wall
      for (let i=0;i<40;i++){ const x = 2.2 + i*.2, z = 3.5 - Math.sin(i/39*Math.PI)*.7 + (i%3)*.08; S.ball(x, .25, z, .2+(i%2)*.05, ['#E7C9BE','#F6EEE4','#C8A96B','#D6B3A8','#FFFFFF'][i%5], { depth:x+.25+z*.02+200, hl:true }); }
      // dessert table with cake + cupcakes
      S.box(3.2, .6, 0, 4.6, 1, .8, '#F6F1EA'); cake(S, 5.5, 1.1, .8, 3, '#F9F1EC');
      [[4,1],[4.5,1.2],[6.6,1],[7.1,1.2],[3.6,1.2]].forEach(([x,y]) => { S.cyl(x,y,.8,.12,.12,'#C8A96B',{ depth:x+y+.2 }); S.ball(x,y,1,.12,'#F3DED7',{ depth:x+y+.21 }); });
      // balloon clusters
      [[1,1.2],[11,1],[1,11]].forEach(([x,y],k) => { for (let i=0;i<7;i++){ const dx=(i%3-1)*.3, dy=((i+1)%3-1)*.3, z=2.4+(i%4)*.35; S.line([x,y,0],[x+dx,y+dy,z],'#9c8d7c',.6,x+y+5+i*.01); S.ball(x+dx,y+dy,z,.3,['#E7C9BE','#C8A96B','#FFFFFF','#D9BFB5'][(i+k)%4],{ depth:x+y+6+i*.01, hl:true }); } });
      // DJ + dance floor
      djBooth(S, 9, 2.4); speaker(S, 8.3, 2.3); speaker(S, 10.9, 2.3);
      danceFloor(S, 6, 4, 4, 3, '#2f2b28', '#3d3834');
      // cocktail tables
      [[2.6,5],[3,8.4],[7,9.8],[10.2,8.6]].forEach(([x,y]) => { S.cyl(x,y,0,.06,1.05,'#2a2725',{ depth:x+y }); S.cyl(x,y,1.05,.5,.06,'#F4EFE6',{ depth:x+y+.01 }); S.cyl(x+.1,y,1.11,.05,.2,'#E7C9BE',{ depth:x+y+.02 }); [[.8,0],[0,.8],[-.8,0]].forEach(([dx,dy]) => S.cyl(x+dx,y+dy,0,.2,.75,'#C8A96B',{ depth:x+dx+y+dy })); });
      person(S, 7, 5, '#2b2825'); person(S, 7.6, 5.4, '#E8CFC6'); person(S, 8.4, 4.8, '#1f1d1b'); person(S, 6.9, 6.2, '#C8A96B'); person(S, 3.3, 5.6, '#6b5a4a'); person(S, 2.2, 5.6, '#EDE6DA');
      [[0,3],[0,7],[0,10.5]].forEach(([x,y],i) => S.strand([x,y,4.1],[8+i*1.2,0,4.1],1,14,2000+i));
    }
  },
  corporate: {
    label:'Corporate', sky:['#111316','#1a1d21'],
    cats:['venue','lighting','videography','catering','rentals','photography'],
    build(S){
      room(S, { wallL:'#D8DADC', wallR:'#CDD0D3', floor:'#4A4D52', grid:'#5a5e64', h:4.6 });
      // screen on right wall
      const sc = [P(3,.02,1.4),P(9,.02,1.4),P(9,.02,4.2),P(3,.02,4.2)];
      S.add(-200, `<polygon points="${pts(sc)}" fill="url(#screen)"/><polygon points="${pts([P(3.6,.03,3.3),P(6.6,.03,3.3),P(6.6,.03,3.6),P(3.6,.03,3.6)])}" fill="#F3EFE8" opacity=".9"/><polygon points="${pts([P(3.6,.03,2.7),P(8,.03,2.7),P(8,.03,2.85),P(3.6,.03,2.85)])}" fill="#C8A96B" opacity=".9"/><polygon points="${pts([P(3.6,.03,2.35),P(7.2,.03,2.35),P(7.2,.03,2.5),P(3.6,.03,2.5)])}" fill="#9aa3ad" opacity=".7"/>`);
      S.box(2.5, .15, 0, 7, 2.3, .45, '#2a2c30', { top:'#36393e' });
      S.box(7.6, 1.2, .45, .7, .5, 1.1, '#1d1e21', { top:'#C8A96B' });
      person(S, 6.2, 1.3, '#1d1e21');
      // light truss + beams
      S.box(1.5, 2.7, 4.2, 9, .14, .14, '#8a8f96', { depth:3000 });
      [3,5,7,9].forEach((x,i) => { const a = P(x,2.75,4.15), b1 = P(x-.9,1.2,.5), b2 = P(x+.9,1.2,.5); S.add(2990, `<polygon points="${pts([a,b1,b2])}" fill="#F7E7C0" opacity=".08"/>`); S.box(x-.12,2.65,3.95,.24,.24,.25,'#2a2c30',{ depth:3001+i }); });
      // rows of chairs facing stage
      for (let r=0;r<4;r++) for (let c=0;c<7;c++){ const x = 3 + c*.95, y = 4.2 + r*1.25; S.box(x, y, 0, .45, .45, .46, '#222428', { depth:x+y }); S.box(x, y+.38, .46, .45, .08, .55, '#222428', { depth:x+y+.4 }); }
      [[5.1,5.4,'#3a3d42'],[6.1,6.7,'#E9E4DA'],[7.1,4.3,'#5b6068'],[4.2,7.9,'#2a2c30'],[8,6.6,'#C8A96B']].forEach(([x,y,c]) => person(S, x+.22, y+.2, c));
      // high tables at back-left
      [[1.4,4.5],[1.4,7.5],[1.4,10.3]].forEach(([x,y]) => { S.cyl(x,y,0,.06,1.05,'#2a2c30',{ depth:x+y }); S.cyl(x,y,1.05,.5,.06,'#F3F1EE',{ depth:x+y+.01 }); });
      person(S, 2.2, 7.6, '#1d1e21'); person(S, 2.1, 10.5, '#7f8790');
    }
  },
  beach: {
    label:'Beach', sky:['#3a2a2a','#E0A273'], open:true,
    cats:['venue','catering','rentals','lighting','dj','decoration'],
    build(S){
      S.poly([P(0,0),P(12,0),P(12,12),P(0,12)], '#E5D1AE', -290);
      S.add(-289, `<polygon points="${pts([P(0,0),P(12,0),P(12,.6),P(.6,.6),P(.6,12),P(0,12)])}" fill="#D7BF97"/>`);
      // long dining table
      S.box(3.4, 6.2, 0, 5, 1, .76, '#F6F1E8');
      for (let i=0;i<6;i++){ const x = 3.7 + i*.82; S.box(x, 5.6, 0, .36, .36, .46, '#C9A97C', { depth:x+5.6 }); S.box(x, 7.45, 0, .36, .36, .46, '#C9A97C', { depth:x+7.6 }); S.ball(x+.3, 6.7, .95, .12, ['#F3E6E0','#9DAE8C','#E7C9BE'][i%3], { depth:x+6.9 }); S.glow(x+.3, 6.7, .9, .4, 'warm', x+6.95, .6); }
      // lounge
      [[1.6,1.6],[1.6,3.6]].forEach(([x,y]) => { S.box(x,y,0,1.6,1.1,.3,'#EFE7DA'); S.box(x+.1,y+.1,.3,.35,.9,.35,'#E7DCCB'); });
      S.cyl(2.1, 5.2, 0, .45, .2, '#3b3530', { after:'' }); S.glow(2.1,5.2,.35,.8,'fire',8,.8);
      // umbrellas
      [[9.4,2],[10.2,9.6],[1.8,9.8]].forEach(([x,y]) => { S.cyl(x,y,0,.04,2.2,'#7a6a58',{ depth:x+y }); const a = P(x,y,2.75), c = P(x,y,2.15), rx = 1.2247*1.1*ISO_S, ry = .7071*1.1*ISO_S; S.add(x+y+1, `<path d="M${(c[0]-rx).toFixed(1)} ${c[1].toFixed(1)} L${a[0].toFixed(1)} ${a[1].toFixed(1)} L${(c[0]+rx).toFixed(1)} ${c[1].toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(c[0]-rx).toFixed(1)} ${c[1].toFixed(1)} Z" fill="#F2EADC"/><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${(c[0]+rx).toFixed(1)} ${c[1].toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${c[0].toFixed(1)} ${(c[1]+ry).toFixed(1)} Z" fill="#D9CDB8"/>`); S.box(x+.4,y-.6,0,1.4,.6,.25,'#EFE7DA',{ depth:x+y-.1 }); });
      // bar + DJ
      S.box(8.6, 4, 0, .7, 2.4, 1.05, '#8B6F52', { top:'#C9A97C' });
      djBooth(S, 5.4, 1.6);
      // torches + string lights
      const posts = [[3,3],[9,3.2],[3,10.6],[9,10.6]];
      posts.forEach(([x,y]) => { S.cyl(x,y,0,.05,2.6,'#6b5a48',{ depth:x+y }); S.glow(x,y,2.75,.9,'fire',x+y+.1,.8); S.ball(x,y,2.7,.09,'#FFD58A',{ depth:x+y+.11 }); });
      S.strand([3,3,2.6],[9,3.2,2.6],.5,12,2000); S.strand([3,10.6,2.6],[9,10.6,2.6],.5,12,2001); S.strand([3,3,2.6],[3,10.6,2.6],.6,14,2002); S.strand([9,3.2,2.6],[9,10.6,2.6],.6,14,2003);
      person(S, 6.3, 3.6, '#F2EADC'); person(S, 6.9, 3.9, '#2b2825'); person(S, 7.5, 3.4, '#C8A96B'); person(S, 9.6, 5.2, '#EDE6DA'); person(S, 4.6, 8.3, '#5d4b3c');
    }
  }
};
const SCENE_FOR_EVENT = { wedding:'wedding', engagement:'wedding', birthday:'birthday', 'baby-shower':'birthday', private:'birthday', bachelor:'birthday', bachelorette:'birthday', graduation:'birthday', other:'birthday', corporate:'corporate', beach:'beach', outdoor:'beach' };

let sceneUid = 0;
function renderScene(key, { title } = {}){
  const sc = SCENES[key] || SCENES.wedding, S = makeScene(), id = ++sceneUid;
  sc.build(S);
  const defs = `<defs>
    <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sc.sky[0]}"/><stop offset="1" stop-color="${sc.sky[1]}"/></linearGradient>
    <radialGradient id="glow-warm"><stop offset="0" stop-color="#FFD98F" stop-opacity="1"/><stop offset="1" stop-color="#FFD98F" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow-gold"><stop offset="0" stop-color="#C8A96B" stop-opacity="1"/><stop offset="1" stop-color="#C8A96B" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow-fire"><stop offset="0" stop-color="#FFB45E" stop-opacity="1"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2430"/><stop offset="1" stop-color="#2d3a4a"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7f78"/><stop offset=".25" stop-color="#4f6470"/><stop offset="1" stop-color="#22394a"/></linearGradient>
  </defs>`;
  return `<svg class="scene-svg" viewBox="-330 -150 660 535" role="img" aria-label="${esc(title || `Example 3D illustration of a ${sc.label.toLowerCase()} event setup`)}" preserveAspectRatio="xMidYMid slice">${defs}<rect x="-345" y="-175" width="690" height="560" fill="url(#sky${id})"/>${sc.open ? `<circle cx="-170" cy="-92" r="40" fill="#F6C98F" opacity=".9"/><circle cx="-170" cy="-92" r="90" fill="#F6C98F" opacity=".12"/><rect x="-345" y="-70" width="690" height="455" fill="url(#sea)"/><rect x="-235" y="-66" width="130" height="3" rx="1.5" fill="#F6C98F" opacity=".5"/><rect x="-215" y="-56" width="90" height="2" rx="1" fill="#F6C98F" opacity=".35"/><rect x="-200" y="-46" width="60" height="2" rx="1" fill="#F6C98F" opacity=".25"/>` : ''}${S.render()}</svg>`;
}
