/* =========================================================
   MA3AK 3D SCENES — example setups modeled on common event
   designs (ballroom receptions, rooftop lounges, beach dinners…).
   Illustrations only; not real venues.
   ========================================================= */
const S3 = (() => {
  const mdl = o => GL3D.mat4(GL3D.T(o));
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const pick = a => a[Math.floor(rnd()*a.length)];
  const faceTo = (x, z, cx, cz) => Math.atan2(-(cx - x), -(cz - z)); // ry so local -z faces (cx,cz)

  /* ---------- furniture & decor ---------- */
  function chair(g, x, z, ry, o={}){
    const leg = o.leg || '#C8A96B', seat = o.seat || leg, sp = o.spec ?? .6;
    g.at({ x, z, ry }, g => {
      [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]].forEach(([a,b]) => g.box(a,0,b,.035,.45,.035,leg,{ s:sp }));
      g.box(0,.45,0,.42,.06,.42,seat,{ s:.15 });
      g.box(-.18,.5,.19,.035,.52,.035,leg,{ s:sp }); g.box(.18,.5,.19,.035,.52,.035,leg,{ s:sp });
      if (o.solid) g.box(0,.56,.2,.42,.44,.05,o.back || seat,{ s:.15 });
      else [.64,.8,.96].forEach(y => g.box(0,y,.19,.38,.03,.03,leg,{ s:sp }));
    });
    g.shadow(x, z, .34, .28);
  }
  function candle(g, x, y, z, h=.12, col='#F6EFE3'){ g.cyl(x,y,z,.025,.025,h,col,{ s:.1, e:.25 }); g.glow(x, y+h+.03, z, .09, [1,.72,.38], .35, 7); }
  function flowers(g, x, y, z, r, cols, n=9){ for (let i=0;i<n;i++){ const a = rnd()*6.28, d = rnd()*r*.8, h = rnd()*r*.6; g.sphere(x+Math.cos(a)*d, y+h, z+Math.sin(a)*d, r*(.35+rnd()*.25), pick(cols), { s:.1 }, 8); } }
  function greenery(g, x, y, z, len, ry, col='#4E6B47'){ g.at({ x, y, z, ry }, g => { for (let i=0;i<len*7;i++) g.sphere(-len/2 + rnd()*len, rnd()*.05, (rnd()-.5)*.18, .07+rnd()*.05, rnd()<.5 ? col : '#6B8A5E', { s:.05 }, 6, .6); }); }
  function roundTable(g, x, z, o={}){
    const cloth = o.cloth || '#F3EEE5', n = o.n || 8, R = 1.25;
    for (let k=0;k<n;k++){ const a = k/n*Math.PI*2 + .2, cx = x + Math.cos(a)*R, cz = z + Math.sin(a)*R; chair(g, cx, cz, faceTo(cx,cz,x,z), o.chair || {}); }
    g.cyl(x,0,z,.97,.9,.76,cloth,{ s:.08, f:9 },40);
    g.cyl(x,.76,z,.05,.05,.01,'#ffffff');
    const fl = o.flowers || ['#FFFFFF','#F2DCD3','#EBCFC4','#F8F1E7'];
    if (o.center === 'tall'){ g.tube([x,.76,z],[x,1.55,z],.035,o.metal || '#C8A96B',{ s:.9 }); flowers(g, x, 1.6, z, .32, fl, 12); greenery(g, x, 1.55, z, .7, rnd()*3); }
    else if (o.center === 'candelabra'){ g.tube([x,.76,z],[x,1.35,z],.03,'#C8A96B',{ s:.9 }); [-.22,0,.22].forEach((d,i) => { g.tube([x,1.2,z],[x+d,1.35,z],.02,'#C8A96B',{ s:.9 }); candle(g, x+d, 1.35, z, .18); }); flowers(g, x, .8, z, .25, fl, 7); }
    else { flowers(g, x, .8, z, .26, fl, 9); }
    [[.45,.1],[-.4,.25],[.1,-.45]].forEach(([dx,dz]) => candle(g, x+dx, .77, z+dz, .1));
    g.shadow(x, z, 1.55, .45);
  }
  function longTable(g, x, z, len, ry, o={}){
    const cloth = o.cloth || '#F3EEE5', w = o.w || 1.1;
    g.at({ x, z, ry }, g => {
      if (o.wood){ g.box(0,.7,0,len,.06,w,o.wood,{ s:.3 }); [[-len/2+.15,-w/2+.12],[len/2-.15,-w/2+.12],[-len/2+.15,w/2-.12],[len/2-.15,w/2-.12]].forEach(([a,b]) => g.box(a,0,b,.08,.7,.08,o.wood)); }
      else g.box(0,0,0,len,.76,w,cloth,{ s:.08, f:9 });
      const n = Math.floor(len/.68);
      for (let i=0;i<n;i++){ const px = -len/2 + .34 + i*.68 + (len - n*.68)/2;
        chair(g, px, -w/2-.42, 0, o.chair || {}); chair(g, px, w/2+.42, Math.PI, o.chair || {});
        if (i % 2 === 0) candle(g, px, .77, (rnd()-.5)*.2, o.tall ? .35 : .12);
        g.cyl(px, .77, -w/2+.22, .13, .13, .012, '#ffffff', { s:.6 }); g.cyl(px, .77, w/2-.22, .13, .13, .012, '#ffffff', { s:.6 }); }
      if (o.runner !== false){ greenery(g, 0, .78, 0, len*.92, 0, o.green); for (let i=0;i<len*1.6;i++) flowers(g, -len/2+.3+rnd()*(len-.6), .8, (rnd()-.5)*.15, .13, o.flowers || ['#FFFFFF','#F2DCD3','#EBCFC4'], 2); }
      if (o.candelabras) for (let i=1;i<o.candelabras+1;i++){ const px = -len/2 + i*len/(o.candelabras+1); g.tube([px,.76,0],[px,1.5,0],.03,'#C8A96B',{ s:.9 }); [-.25,0,.25].forEach(d => { g.tube([px,1.3,0],[px+d,1.48,0],.018,'#C8A96B',{ s:.9 }); candle(g, px+d, 1.48, 0, .22); }); }
    });
    g.shadow(x, z, 1, .45, len/2+.5, w+.5, -ry);
  }
  const shadeHex = (h, k) => '#' + [1,3,5].map(i => Math.round(parseInt(h.slice(i,i+2),16)*k).toString(16).padStart(2,'0')).join('');
  function person(g, sc, x, z, o={}){
    const top = o.top || pick(['#1d1c1b','#2b2a33','#EDE6DA','#7A5C4A','#3E4A5A','#C8A96B','#A9625A','#6B1E2A','#1F3A2F']);
    const legs = o.legs || pick(['#1b1b1d','#23262d','#2e2a26']), skin = o.skin || pick(['#E2C0A2','#C99B78','#B9855F','#EBCDB3','#D7AE8C']), hair = o.hair || pick(['#2a1d16','#3c2a1e','#151210','#6b4a32','#8a6a45']);
    const dress = o.dress ?? rnd() < .45, longHair = o.longHair ?? (dress ? rnd() < .85 : rnd() < .1), ph = rnd()*6.28, base = o.ry ?? rnd()*6.28, dance = o.dance, sc_ = .95 + rnd()*.12, shoes = dress ? '#C8A96B' : '#141414';
    sc.dynamic(g => g.at({ s:sc_ }, g => {
      if (dress){ g.cyl(0,.02,0,.33,.16,.98,top,{ s:.35 },28); g.cyl(0,.9,0,.16,.15,.12,top,{ s:.35 },20); g.sphere(-.07,.04,-.04,.045,shoes,{ s:.8 },8,.6); g.sphere(.07,.04,-.04,.045,shoes,{ s:.8 },8,.6); }
      else { [-.09,.09].forEach(lx => { g.cyl(lx,.07,0,.058,.082,.77,legs,{ s:.25 },14); g.sphere(lx,.05,-.04,.075,shoes,{ s:.9 },12,.55); }); g.sphere(0,.84,0,.165,legs,{ s:.25 },16,.55); }
      g.cyl(0,.84,0,.15,.19,.5,top,{ s:.3 },20);
      [-1,1].forEach(sd => { g.sphere(.18*sd,1.32,0,.075,top,{ s:.3 },12); g.tube([.19*sd,1.31,0],[.235*sd,1.06,-.04],.046,top,{ s:.3 },10); g.sphere(.235*sd,1.06,-.04,.044,dress ? skin : top,{ s:.3 },10);
        g.tube([.235*sd,1.06,-.04],[.2*sd,.84,-.13],.037,dress ? skin : top,{ s:.3 },10); g.sphere(.2*sd,.82,-.14,.042,skin,{ s:.2 },10); });
      g.sphere(0,1.335,0,.14,top,{ s:.3 },16,.45);
      g.cyl(0,1.37,0,.048,.042,.11,skin,{ s:.2 },12);
      g.sphere(0,1.585,0,.1,skin,{ s:.22 },18,1.18);
      const lip = dress ? '#B0686A' : shadeHex(skin, .8), brow = shadeHex(hair, .9);
      [-1,1].forEach(sd => { g.sphere(.034*sd,1.598,-.09,.011,'#EDE9E3',{ s:.6 },10,.8); g.sphere(.034*sd,1.598,-.0995,.0058,pick(['#3a2617','#2a1d14','#4a3a22']),{ s:1 },8); g.box(.035*sd,1.622,-.094,.028,.0045,.008,brow,{ s:.1, rz:-.12*sd }); g.sphere(.099*sd,1.59,.005,.02,skin,{ s:.15 },8,1.35); });
      g.sphere(0,1.574,-.1,.0115,skin,{ s:.2 },10,1.5);
      g.sphere(0,1.538,-.093,.016,lip,{ s:.45 },10,.3);
      if (!dress){ g.box(0,.98,-.172,.085,.34,.012,'#F4F4F2',{ s:.3 }); g.box(0,.98,-.18,.032,.3,.008,pick(['#141414','#6B1E2A','#1F2D4A','#C8A96B']),{ s:.6 }); }
      if (longHair){ g.sphere(0,1.625,.018,.11,hair,{ s:.45 },18,1.08); g.cyl(0,1.3,.055,.085,.1,.34,hair,{ s:.45 },14); }
      else g.sphere(0,1.64,.012,.106,hair,{ s:.4 },18,.78);
    }), t => { const b = dance ? Math.abs(Math.sin(t*3.4+ph))*.07 : Math.sin(t*1.2+ph)*.008; const r = base + (dance ? Math.sin(t*1.6+ph)*.6 : Math.sin(t*.4+ph)*.15); return mdl({ x, y:b, z, ry:r }); });
    g.shadow(x, z, .3, .35);
  }
  function crowd(g, sc, cx, cz, rx, rz, n, o={}){ for (let i=0;i<n;i++){ const a = rnd()*6.28, d = Math.sqrt(rnd()); person(g, sc, cx + Math.cos(a)*rx*d, cz + Math.sin(a)*rz*d, o); } }
  function chandelier(g, sc, x, y, z, s=1, o={}){
    const gold = o.metal || '#C8A96B';
    g.tube([x,y+.4*s,z],[x,o.ceil || y+3,z],.015,gold,{ s:.9 });
    [[.75,0],[.5,.35],[.28,.65]].forEach(([r,dy]) => { const seg = 18; for (let i=0;i<seg;i++){ const a0 = i/seg*6.283, a1 = (i+1)/seg*6.283; g.tube([x+Math.cos(a0)*r*s, y+dy*s, z+Math.sin(a0)*r*s],[x+Math.cos(a1)*r*s, y+dy*s, z+Math.sin(a1)*r*s], .02*s, gold, { s:.9 }); }
      for (let i=0;i<seg;i+=1){ const a = i/seg*6.283, px = x+Math.cos(a)*r*s, pz = z+Math.sin(a)*r*s; const L = (.35 + (i%3)*.15)*s; g.tube([px,y+dy*s,pz],[px,y+dy*s-L,pz],.006,'#E9EEF2',{ s:1, e:.6 }); g.sphere(px,y+dy*s-L,pz,.035*s,'#F4F7FA',{ s:1, e:.9 },6); if (i%2===0) g.glow(px,y+dy*s+.05,pz,.16*s,[1,.82,.55],.15,3); } });
    g.sphere(x, y-.25*s, z, .12*s, '#F4F7FA', { s:1, e:1 }, 8); g.glow(x, y+.1*s, z, 1.6*s, [.55,.42,.25]);
    sc.addLight([x, y-.2, z], '#FFD9A6', o.i ?? 2.2, o.range ?? 7.5);
  }
  function stringLights(g, a, b, sag, n, o={}){
    const P = t => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t - sag*4*t*(1-t), a[2]+(b[2]-a[2])*t];
    for (let i=0;i<20;i++) g.tube(P(i/20), P((i+1)/20), .006, '#7a6a55', { s:.2 });
    for (let i=1;i<n;i++){ const p = P(i/n); g.sphere(p[0], p[1]-.06, p[2], .04, '#FFE6B5', { e:2.2, s:.5 }, 6); g.glow(p[0], p[1]-.06, p[2], o.size || .22, o.col || [1,.78,.45], .25, 2.5); }
  }
  function balloon(g, x, y, z, r, col, o={}){ g.sphere(x, y, z, r, col, { s:o.chrome ? 1 : .8, e:o.e || 0 }, 12, 1.12); g.sphere(x, y - r*1.1, z, r*.12, col, { s:.6 }, 5); if (o.string) g.tube([x, y - r*1.1, z],[x + (rnd()-.5)*.1, o.string, z + (rnd()-.5)*.1], .004, '#d8d2c8'); }
  function balloonGarland(g, pts, cols, dens=3){ for (let i=0;i<pts.length-1;i++){ const a = pts[i], b = pts[i+1]; for (let k=0;k<dens;k++){ const t = rnd(); const p = [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; const r = .12 + rnd()*.2; balloon(g, p[0]+(rnd()-.5)*.35, p[1]+(rnd()-.5)*.35, p[2]+(rnd()-.5)*.35, r, pick(cols), { chrome: rnd()<.18 }); } } }
  const arcPts = (cx, cz, w, h, ry, y0=0, n=14) => { const c = Math.cos(ry), s = Math.sin(ry); return Array.from({ length:n+1 }, (_,i) => { const t = i/n*Math.PI; const lx = -Math.cos(t)*w/2; return [cx + lx*c, y0 + Math.sin(t)*h, cz - lx*s]; }); };
  function djBooth(g, sc, x, z, ry, o={}){
    g.at({ x, z, ry }, g => {
      g.box(0,0,0,1.9,1.0,.75,'#151414',{ s:.5 });
      g.box(0,.08,-.38,1.86,.05,.01,o.led || '#C8A96B',{ e:3 }); g.box(0,.92,-.38,1.86,.03,.01,o.led || '#C8A96B',{ e:3 });
      [-.5,.5].forEach(d => { g.box(d,1,0,.55,.06,.45,'#222',{ s:.6 }); g.cyl(d,1.06,0,.16,.16,.02,'#3a3a3a',{ s:.9 }); });
      g.box(0,1,.05,.38,.05,.28,'#2d2d2d',{ s:.7, e:.4 });
      [-1.35,1.35].forEach(d => { g.box(d,0,0,.55,1.7,.5,'#111',{ s:.4 }); g.cyl(d,1.1,-.26,.17,.17,.02,'#2a2a2a',{ s:.8 }); g.cyl(d,.5,-.26,.2,.2,.02,'#2a2a2a',{ s:.8 }); });
    });
    g.glow(x, 1.3, z, 1.5, o.glow || [.45,.35,.2]); g.shadow(x, z, 1.6, .5, 1.6, .6, -ry);
  }
  function danceFloor(g, x, z, w, d, a, b, o={}){ const tw = o.tile || 1; for (let i=0;i<w/tw;i++) for (let j=0;j<d/tw;j++) g.box(x - w/2 + i*tw + tw/2, 0, z - d/2 + j*tw + tw/2, tw*.985, .03, tw*.985, (i+j)%2 ? a : b, { s:o.s ?? .95 }); if (o.border) { g.box(x, 0, z - d/2 - .05, w + .2, .035, .1, o.border, { s:.9 }); g.box(x, 0, z + d/2 + .05, w + .2, .035, .1, o.border, { s:.9 }); g.box(x - w/2 - .05, 0, z, .1, .035, d, o.border, { s:.9 }); g.box(x + w/2 + .05, 0, z, .1, .035, d, o.border, { s:.9 }); } }
  function cake(g, x, y, z, tiers=4, col='#FBF7F0', top=['#F2DCD3','#FFFFFF']){
    g.cyl(x,y,z,.35,.3,.08,'#C8A96B',{ s:.9 }); g.tube([x,y+.08,z],[x,y+.22,z],.04,'#C8A96B',{ s:.9 }); let yy = y + .22;
    [.32,.25,.19,.13,.09].slice(0,tiers).forEach(r => { g.cyl(x,yy,z,r,r,.2,col,{ s:.35 },22); g.cyl(x,yy+.19,z,r+.005,r+.005,.015,'#E9DDCB',{ s:.5 },22); yy += .2; });
    flowers(g, x+.1, yy-.05, z, .12, top, 5); g.shadow(x, z, .45, .3);
  }
  function sofa(g, x, z, ry, len, col, o={}){
    g.at({ x, z, ry }, g => {
      g.box(0,0,0,len,.42,.9,col,{ s:.15 }); g.box(0,.42,.32,len,.45,.25,col,{ s:.15 });
      g.box(-len/2+.1,.42,0,.2,.22,.9,col,{ s:.15 }); g.box(len/2-.1,.42,0,.2,.22,.9,col,{ s:.15 });
      for (let i=0;i<Math.floor(len/.6);i++) g.box(-len/2+.45+i*.6,.45,.12,.4,.36,.12,o.pillow || pick(['#EDE6DA','#C8A96B','#D9C9B4']),{ s:.1, ry:(rnd()-.5)*.3 });
      if (o.base) g.box(0,0,-.46,len,.06,.01,o.base,{ e:2.5 });
    });
    g.shadow(x, z, 1, .45, len/2+.2, .7, -ry);
  }
  function bar(g, sc, x, z, ry, len, o={}){
    g.at({ x, z, ry }, g => {
      g.box(0,0,0,len,1.05,.6,o.body || '#1c1a18',{ s:.4 }); g.box(0,1.05,0,len+.1,.05,.7,o.top || '#E9E4DC',{ s:.9 });
      g.box(0,.04,-.31,len,.03,.01,o.led || '#C8A96B',{ e:3 });
      g.box(0,0,1.25,len,2.3,.35,'#191716',{ s:.3 }); g.box(0,.9,1.07,len-.2,1.2,.02,o.back || '#C8A96B',{ e:.9 });
      for (let r=0;r<2;r++) for (let i=0;i<len*5;i++) g.cyl(-len/2+.2+i*.2, .95+r*.55, 1.15, .035, .025, .28, pick(['#2E5B3A','#6B2E2E','#E8DCC8','#3A2A1A','#8C6A2E']), { s:1 }, 6);
      for (let i=0;i<Math.floor(len/.75);i++){ const px = -len/2+.4+i*.75; g.tube([px,0,-.75],[px,.75,-.75],.03,'#C8A96B',{ s:.9 }); g.cyl(px,.75,-.75,.2,.2,.06,o.stool || '#2a2725',{ s:.3 }); }
    });
    g.glow(x, 1.5, z, 2.2, [.35,.27,.15]); sc.addLight([x, 2.2, z], '#FFD7A0', 1.2, 4.5); g.shadow(x, z, 1, .45, len/2+.4, 1.3, -ry);
  }
  function tree(g, x, z, kind='olive', s=1){
    if (kind === 'pine'){ g.cyl(x,0,z,.12*s,.08*s,1*s,'#4a3628'); [[1.9,1.2,1.3],[1.5,2,1.4],[1.05,2.8,1.4],[.6,3.5,1.2]].forEach(([r,y,h]) => g.cyl(x,y*s-.9*s,z,r*s,.05,h*s,pick(['#25402E','#2C4A35','#1F3829']),{ s:.05 },10)); g.shadow(x,z,1.6*s,.4); return; }
    if (kind === 'palm'){ const top = [x+.4*s, 4.2*s, z]; for (let i=0;i<8;i++) g.tube([x+.05*i*s,i*.52*s,z],[x+.05*(i+1)*s,(i+1)*.52*s,z],(.16-.008*i)*s,'#7a6047',{ s:.1 },8); for (let k=0;k<9;k++){ const a = k/9*6.28; g.at({ x:top[0], y:top[1], z:top[2], ry:a, rz:-.5 }, g => g.box(.9*s,0,0,1.8*s,.03,.32*s,'#4E6B3A',{ s:.2 })); } g.shadow(x,z,1.6*s,.35); return; }
    g.tube([x,0,z],[x+.15*s,1.1*s,z+.1*s],.11*s,'#6b5845',{ s:.1 },8); g.tube([x+.15*s,1.1*s,z+.1*s],[x-.2*s,1.7*s,z],.07*s,'#6b5845',{},6);
    for (let i=0;i<14;i++) g.sphere(x+(rnd()-.5)*1.3*s, 1.6*s+rnd()*.9*s, z+(rnd()-.5)*1.3*s, (.3+rnd()*.25)*s, pick(kind==='olive' ? ['#7C8B6A','#8E9C7B','#6D7B5C'] : ['#3F6B3A','#4F7D44','#2F5A30']), { s:.05 }, 8, .8);
    g.shadow(x, z, 1.1*s, .4);
  }
  function planter(g, x, z, s=1){ g.cyl(x,0,z,.32*s,.4*s,.65*s,'#D9D1C4',{ s:.2 },14); tree(g, x, z, 'olive', .55*s); }
  function torch(g, sc, x, z, h=2.2){ g.tube([x,0,z],[x,h,z],.035,'#3b2f25'); g.cyl(x,h,z,.06,.1,.18,'#2a2420',{ s:.3 }); g.glow(x,h+.3,z,.7,[1,.55,.2],.45,11); g.glow(x,h+.25,z,.25,[1,.85,.5],.3,15); sc.addLight([x,h+.4,z],'#FF9A4A',1.6,6,.35); }
  function lantern(g, x, z, s=1){ const h = .55*s, w = .3*s; g.box(x,0,z,w,.04*s,w,'#2a2420',{ s:.6 }); g.box(x,h-.04*s,z,w,.04*s,w,'#2a2420',{ s:.6 }); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b]) => g.box(x+a*w/2,0,z+b*w/2,.025*s,h,.025*s,'#2a2420',{ s:.6 }));
    g.tube([x,h,z],[x,h+.12*s,z],.03*s,'#2a2420'); g.box(x,.04*s,z,w*.85,h-.08*s,w*.85,'#F7E9CF',{ e:.35, s:1 }); g.cyl(x,.04*s,z,.05*s,.05*s,.14*s,'#FFF4E0',{ e:1.5 }); g.glow(x,.22*s,z,.55*s,[1,.72,.38],.35,6); g.shadow(x,z,.3*s,.3); }
  function umbrella(g, x, z, col='#F2EADC', h=2.3){ g.tube([x,0,z],[x,h+.35,z],.035,'#7a6a58'); g.cyl(x,h,z,1.35,.03,.55,col,{ s:.1 },16); g.cyl(x,h-.08,z,1.36,1.36,.08,col,{ s:.1 },16); g.shadow(x+.6,z+.3,1.4,.35); }
  function lounger(g, x, z, ry, col='#EFE7DA'){ g.at({ x, z, ry }, g => { g.box(0,0,0,.7,.25,1.9,'#8B6F52',{ s:.2 }); g.box(0,.25,-.2,.66,.1,1.4,col,{ s:.1 }); g.at({ y:.3, z:.75, rx:-.8 }, g => g.box(0,0,0,.66,.08,.7,col,{ s:.1 })); }); g.shadow(x,z,.6,.3,1,1.6,-ry); }
  function stage(g, x, z, w, d, h, col='#1a1918', o={}){ g.box(x,0,z,w,h,d,col,{ s:o.s ?? .5 }); if (o.led) g.box(x,h-.04,z+d/2+.005,w,.03,.01,o.led,{ e:3 }); g.shadow(x,z,1,.4,w/2+.3,d/2+.3); }
  function floralArch(g, x, z, ry, w, h, cols){ const pts = arcPts(x, z, w, h*.45, ry, h*.55, 22); const c = Math.cos(ry), s = Math.sin(ry);
    [-1,1].forEach(side => { const px = x + side*w/2*c, pz = z - side*w/2*s; g.tube([px,0,pz],[px,h*.55,pz],.05,'#E9E1D3',{ s:.4 }); for (let y=.1;y<h*.55;y+=.18) flowers(g, px, y, pz, .16, cols, 4); });
    pts.forEach(p => flowers(g, p[0], p[1], p[2], .2, cols, 9)); }
  function flowerWall(g, x, z, ry, w, h, cols){ g.at({ x, z, ry }, g => { g.box(0,0,0,w,h,.12,'#3F5A3A'); for (let i=0;i<w*h*14;i++) g.sphere(-w/2+rnd()*w, .1+rnd()*(h-.2), -.08, .09+rnd()*.07, pick(cols), { s:.1 }, 6); }); }
  function wallSet(g, sc, W, D, H, o){ // cutaway walls: hide the ones between camera and room
    const walls = [ { c:[0,0,-D/2], n:[0,0,1], w:W, ry:0 }, { c:[0,0,D/2], n:[0,0,-1], w:W, ry:Math.PI }, { c:[-W/2,0,0], n:[1,0,0], w:D, ry:Math.PI/2 }, { c:[W/2,0,0], n:[-1,0,0], w:D, ry:-Math.PI/2 } ];
    walls.forEach(wl => {
      sc.dynamic(g => { g.at({ x:wl.c[0], z:wl.c[2], ry:wl.ry }, g => {
        g.box(0,0,-.1,wl.w,H,.2,o.wall,{ s:o.wallS ?? .1 }); g.box(0,0,.02,wl.w,.18,.06,o.base || '#CFC5B5',{ s:.4 });
        if (o.decor) o.decor(g, wl.w, H);
      }); }, (t, cam) => (cam.eye[0]-wl.c[0])*wl.n[0] + (cam.eye[2]-wl.c[2])*wl.n[2] > -0.5 ? mdl({}) : null);
    });
  }
  const panelDecor = (col, trim, glow) => (g, w, H) => { const n = Math.floor(w/2.4); for (let i=0;i<n;i++){ const x = -w/2 + (i+.5)*w/n; g.box(x,.6,.03,1.3,H-1.4,.03,col,{ s:.6, e:glow||0 }); g.box(x-.7,0,.04,.12,H,.1,trim,{ s:.8 }); } };
  function stars(g, n=220){ for (let i=0;i<n;i++){ const a = rnd()*6.28, e = .15 + rnd()*1.2, r = 110; g.glow(Math.cos(a)*Math.cos(e)*r, Math.sin(e)*r*.6, Math.sin(a)*Math.cos(e)*r, .25+rnd()*.35, [.9,.9,1], .5, 1+rnd()*2); } }
  function ground(g, size, col, o={}){ g.plane(0,0,0,size,size,col,{ s:o.s ?? .05, f:o.f ?? 5 },o.seg||1,o.seg||1); }
  function water(g, size, col, y=-.25){ g.plane(0,y,0,size,size,col,{ s:1, f:1 },90,90); }
  function mountains(g, cols, R=70, n=14){ for (let i=0;i<n;i++){ const a = i/n*6.28 + rnd()*.3, r = R + rnd()*25; g.cyl(Math.cos(a)*r, -1, Math.sin(a)*r, 14+rnd()*12, 1, 9+rnd()*12, pick(cols), { s:0 }, 9); } }
  function skyline(g, cx, cz, side, n=26, minD=26){ const span = Math.max(38, minD*1.4); for (let i=0;i<n;i++){ const t = (i/n - .5)*2, d = minD + rnd()*20; const x = side==='x' ? cx + (rnd()<.5?-1:1)*d : cx + t*span, z = side==='x' ? cz + t*span : cz - d; const w = 3+rnd()*5, h = 6+rnd()*26, dp = 3+rnd()*5;
    g.box(x, -8, z, w, h+8, dp, pick(['#14161c','#1a1c22','#101217']), { s:.3 });
    for (let k=0;k<h*w*.35;k++) if (rnd()<.55) g.glow(x + (rnd()-.5)*w*.9, rnd()*h, z + dp/2 + .05, .32, rnd()<.8 ? [1,.78,.45] : [.7,.8,1], .15, .5); } }

  /* ---------- scenes ---------- */
  const NIGHT = { hemi:['#3a3530','#1a1612',.55], sun:{ dir:[.3,1,.2], col:'#9fb0d0', i:.08 } };
  const SCENES = {
    wedding: { label:'Wedding', sub:'Ballroom reception', sky:['#0c0b0a','#1a1612'], fog:'#141210', fogD:.012, exposure:1.15, ...NIGHT, hemi:['#4a4038','#2a221c',.75],
      cam:{ target:[0,.8,0], r:16, phi:.55, theta:.7, fov:.72, speed:.08 }, cats:['venue','catering','decoration','florist','lighting','dj','cake'],
      build(g, sc){
        for (let i=0;i<12;i++) for (let j=0;j<10;j++) g.plane(-9+i*1.5+.75, 0, -7+j*1.4+.7, 1.5, 1.4, (i+j)%2 ? '#D9CEBF' : '#E8E0D3', { s:.7, f:7 });
        wallSet(g, sc, 18, 14, 5.2, { wall:'#EFE8DC', base:'#D2C3A8', decor:(g,w,H) => { panelDecor('#E8DDCB','#C8A96B',.05)(g,w,H); for (let i=0;i<Math.floor(w/2.4);i++){ const x = -w/2 + (i+.5)*w/Math.floor(w/2.4); g.glow(x-.7, 2.6, .25, .5, [1,.75,.4], .1, 2); } } });
        danceFloor(g, 0, .3, 6, 4.5, '#121110', '#1c1a18', { border:'#C8A96B', tile:1.5 });
        [[-1.6,0],[1.6,0],[0,.3]].forEach(([x,z],i) => chandelier(g, sc, x, 3.9, z+.3, i===2?1.25:1, { ceil:5.2, i:2.4 }));
        [-5.4,5.4].forEach(x => { longTable(g, x, -.3, 6.6, Math.PI/2, { chair:{ leg:'#E6EBEF', spec:1 }, tall:true }); chandelier(g, sc, x, 3.6, -.3, .7, { ceil:5.2, i:1.2, range:5 }); });
        // kosha: stage, floral arch, sofa
        stage(g, 0, -5.6, 7, 2.2, .45, '#EFE8DC', { s:.5 }); g.at({ y:.45 }, g => { floralArch(g, 0, -6.1, 0, 4.2, 3.2, ['#FFFFFF','#F2DCD3','#EAD3C8','#F8F1E7','#DDE5D3']); sofa(g, 0, -5.9, 0, 2.2, '#F4EFE6', { pillow:'#E9DCCB' }); });
        g.glow(-2.6,1.6,-5.1,.9,[1,.75,.4],.2); g.glow(2.6,1.6,-5.1,.9,[1,.75,.4],.2);
        g.box(5.5,0,-5.3,1.2,.8,.8,'#F3EEE5',{ s:.1 }); cake(g, 5.5, .8, -5.3, 5);
        djBooth(g, sc, -6, 5.6, Math.PI, { glow:[.4,.3,.15] });
        person(g, sc, -.25, .2, { top:'#F7F3EC', dress:true, dance:true, ry:1.2, hair:'#3c2a1e' }); person(g, sc, .25, .3, { top:'#141414', legs:'#141414', dress:false, dance:true, ry:-2 });
        crowd(g, sc, 0, .4, 2.6, 1.8, 10, { dance:true });
        sc.addLight([0, 2, -5.2], '#FFE2B8', 1.5, 6); sc.addLight([5.5, 2, -5], '#FFE2B8', .8, 4);
      } },
    engagement: { label:'Engagement', sub:'Garden terrace', sky:['#0b0f19','#1b1c22'], fog:'#11141a', fogD:.018, exposure:1.25, hemi:['#3a4258','#1c2418',.6], sun:{ dir:[-.5,.8,.3], col:'#a9b8de', i:.18 },
      cam:{ target:[0,.6,0], r:15, phi:.5, theta:2.2, fov:.72, speed:.09 }, cats:['venue','florist','decoration','catering','lighting','photography'],
      build(g, sc){
        stars(g); g.sphere(-60,48,-70,4,'#F4EEDD',{ f:3 }); g.glow(-60,48,-70,30,[.25,.24,.2]);
        ground(g, 160, '#22331F'); g.plane(0,.005,0,9,13,'#B9AE9C',{ s:.2, f:11 });
        for (let i=-4;i<5;i++) g.plane(0,.01,i*1.4,9,.04,'#9C917F');
        [[-6,-6],[6,-6],[-6,6],[6,6],[-7,0],[7,0]].forEach(([x,z]) => tree(g, x, z, 'olive', 1.2));
        [-5.2,5.2].forEach(x => g.box(x,0,0,.7,1.1,13,'#2F4A2A',{ s:.05 }));
        // pergola
        const posts = [[-2.4,-4.5],[2.4,-4.5],[-2.4,0],[2.4,0],[-2.4,4.5],[2.4,4.5]];
        posts.forEach(([x,z]) => { g.box(x,0,z,.16,3,.16,'#7A5C42',{ s:.2 }); g.shadow(x,z,.2,.4); });
        [-2.4,2.4].forEach(x => g.box(x,3,0,.18,.18,9.4,'#7A5C42'));
        for (let z=-4.5;z<=4.5;z+=.75) g.box(0,3.18,z,5.4,.1,.08,'#7A5C42');
        for (let k=0;k<7;k++) stringLights(g, [-2.4, 3.05, -4.5 + k*1.5], [2.4, 3.05, -3.75 + k*1.5], .35, 9);
        sc.addLight([0,2.8,-2], '#FFC98A', 1.6, 6); sc.addLight([0,2.8,2.5], '#FFC98A', 1.6, 6);
        longTable(g, 0, 0, 7.5, Math.PI/2, { flowers:['#FFFFFF','#F4D7D0','#EBC2B8','#F9EEE6'], tall:true, chair:{ leg:'#E9E3DA', spec:.4 }, cloth:'#F7F2EA' });
        flowerWall(g, 0, -6.3, 0, 4.5, 2.8, ['#FFFFFF','#F4D7D0','#EBC2B8','#F9EEE6','#E3B7AC']);
        sofa(g, 0, -5.5, 0, 1.8, '#E9DCCB', { pillow:'#F4D7D0' });
        [[-1.7,-5.4],[1.7,-5.4],[-2.6,5.6],[2.6,5.6],[-3.4,-2],[3.4,2]].forEach(([x,z]) => lantern(g, x, z, 1.3));
        person(g, sc, -.5, -4.7, { top:'#F4D7D0', dress:true, ry:3.4 }); person(g, sc, .1, -4.6, { top:'#1d2433', dress:false, ry:3 });
        crowd(g, sc, 3.6, -3.5, .9, 1.4, 4); crowd(g, sc, -3.7, 3, .9, 1.4, 4);
      } },
    birthday: { label:'Birthday', sub:'Loft party', sky:['#120f0e','#1f1918'], fog:'#171211', fogD:.012, exposure:1.2, hemi:['#5a4644','#2a1e1c',.75], sun:{ dir:[.2,1,.1], col:'#ffffff', i:.05 },
      cam:{ target:[0,1,0], r:15.5, phi:.5, theta:.9, fov:.72, speed:.09 }, cats:['venue','decoration','cake','dj','entertainment','catering'],
      build(g, sc){
        g.plane(0,0,0,16,13,'#8E8A86',{ s:.55, f:10 });
        wallSet(g, sc, 16, 13, 4.8, { wall:'#8C5444', wallS:.05, base:'#3a2a24', decor:(g,w,H) => { for (let y=.3;y<H;y+=.32) g.box(0,y,.012,w,.02,.01,'#7b4839'); } });
        // dessert table + round backdrop + garland
        g.cyl(0,0,-6.2,2.1,2.1,.06,'#F2DCD3',{ s:.2 }, 40); g.at({ x:0, y:2.1, z:-6.35, rx:Math.PI/2 }, g => g.cyl(0,0,0,2.1,2.1,.08,'#F2DCD3',{ s:.15 },40));
        balloonGarland(g, arcPts(0, -5.9, 4.6, 2.4, 0, .2, 16), ['#F2DCD3','#E7C9BE','#FFFFFF','#C8A96B','#D8B4A6'], 6);
        g.box(0,0,-5.2,3.4,.9,.8,'#F6F1EA',{ s:.1 }); cake(g, 0, .9, -5.2, 4, '#FBF3EF', ['#E7C9BE','#C8A96B']);
        [-1.2,-.8,.8,1.2].forEach((x,i) => { g.cyl(x,.9,-5.2,.14,.14,.25+i%2*.1,'#C8A96B',{ s:.9 }); for (let k=0;k<4;k++) g.sphere(x+(k%2-.5)*.12, 1.2+i%2*.1, -5.2+(k>1?.06:-.06), .06, '#F2DCD3', { s:.3 }, 6); });
        // heart neon on side wall (part of left wall effect, placed static slightly off wall)
        for (let i=0;i<40;i++){ const t = i/40*6.283, hx = 16*Math.pow(Math.sin(t),3)/16*.8, hy = (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16*.8; g.glow(-7.85, 2.6+hy, -2+hx, .18, [1,.45,.55], .05, 3); }
        sc.addLight([-7.5,2.6,-2], '#FF8FA0', .9, 4);
        danceFloor(g, 2.8, 1, 5, 4, '#1e1b1a', '#2a2624', { s:.9 });
        djBooth(g, sc, 2.8, -1.8, 0, { led:'#E7A9B3', glow:[.5,.25,.3] });
        [[-4.5,0],[-4.5,3.2],[-1.8,4.5],[-5.5,-3.2]].forEach(([x,z]) => { g.tube([x,0,z],[x,1.05,z],.04,'#1b1a19',{ s:.8 }); g.cyl(x,1.05,z,.36,.36,.04,'#F6F1EA',{ s:.3 }); g.cyl(x+.08,1.09,z,.05,.03,.22,'#C8A96B',{ s:1 }); candle(g, x-.1, 1.09, z+.05); g.shadow(x,z,.5,.4);
          [[.75,0],[-.75,0]].forEach(([dx]) => { g.tube([x+dx,0,z],[x+dx,.75,z],.03,'#C8A96B',{ s:.9 }); g.cyl(x+dx,.75,z,.18,.18,.06,'#E7C9BE',{ s:.2 }); }); });
        for (let i=0;i<14;i++){ const x = -6 + rnd()*12, z = -5 + rnd()*10, y0 = 3.8 + rnd()*.6, ph = rnd()*6, col = pick(['#F2DCD3','#C8A96B','#FFFFFF','#E7C9BE']);
          sc.dynamic(g => balloon(g, 0, 0, 0, .25, col, { chrome: col==='#C8A96B', string:-1.2 }), t => mdl({ x: x + Math.sin(t*.4+ph)*.1, y: y0 + Math.sin(t*.9+ph)*.12, z })); }
        crowd(g, sc, 2.8, 1, 2, 1.6, 9, { dance:true }); crowd(g, sc, -4, 1.5, 1.2, 2.5, 5);
        sc.addLight([2.8,3,1], '#FFB8A8', 1.8, 6); sc.addLight([0,3,-4.5], '#FFE0C0', 1.8, 6); sc.addLight([-4,3,1], '#FFD0A0', 1.2, 6);
      } },
    graduation: { label:'Graduation', sub:'Black & gold hall', sky:['#0b0b0d','#151517'], fog:'#0f0f11', fogD:.013, exposure:1.2, hemi:['#3a3a44','#1a1a1e',.6], sun:{ dir:[.2,1,.2], col:'#ffffff', i:.04 },
      cam:{ target:[0,1.1,0], r:16, phi:.42, theta:1.25, fov:.72, speed:.08 }, cats:['venue','catering','decoration','photography','dj','lighting'],
      build(g, sc){
        g.plane(0,0,0,18,14,'#1C2030',{ s:.1, f:12 });
        wallSet(g, sc, 18, 14, 5.2, { wall:'#15161a', base:'#C8A96B', decor:panelDecor('#1d1f25','#C8A96B') });
        stage(g, 0, -5.4, 8, 2.6, .6, '#111', { led:'#C8A96B' });
        g.box(0,.6,-6.5,8,3.6,.12,'#0f0f10',{ s:.3 }); for (let i=0;i<120;i++) g.glow(-3.8+rnd()*7.6, 1+rnd()*3, -6.42, .1, [1,.8,.45], .7, 2+rnd()*3);
        // gold photo frame + podium
        const fr = [[-1.3,.6],[1.3,.6],[1.3,3.4],[-1.3,3.4]]; for (let i=0;i<4;i++){ const a = fr[i], b = fr[(i+1)%4]; g.tube([a[0]+2.4,a[1],-5.2],[b[0]+2.4,b[1],-5.2],.06,'#C8A96B',{ s:1 }); }
        g.box(-2.6,.6,-5,.8,1.15,.55,'#C8A96B',{ s:.9 }); g.tube([-2.6,1.75,-5.1],[-2.6,1.95,-5.35],.01,'#222');
        person(g, sc, -2.6, -5.5, { top:'#111', dress:false, ry:0 });
        balloonGarland(g, [[-4.3,.6,-6.2],[-4.3,2.5,-6.1],[-3.5,3.6,-6.1]], ['#111111','#C8A96B','#E8D5A8'], 8);
        balloonGarland(g, [[4.3,.6,-6.2],[4.3,2.5,-6.1],[3.5,3.6,-6.1]], ['#111111','#C8A96B','#E8D5A8'], 8);
        [[-5,-1.2],[0,-1.2],[5,-1.2],[-5,2.6],[0,2.6],[5,2.6]].forEach(([x,z]) => roundTable(g, x, z, { cloth:'#141414', chair:{ leg:'#C8A96B' }, flowers:['#FFFFFF','#E8D5A8','#C8A96B'], center:'tall', metal:'#C8A96B' }));
        for (let i=0;i<18;i++){ const x = -6 + rnd()*12, z = -3 + rnd()*7, ph = rnd(), sp = .18 + rnd()*.1;
          sc.dynamic(g => { g.box(0,0,0,.42,.03,.42,'#111',{ s:.5 }); g.cyl(0,-.12,0,.16,.17,.12,'#111',{ s:.4 },10); g.tube([0,.03,0],[.18,-.2,.18],.008,'#C8A96B',{ e:1 }); },
            t => { const k = ((t*sp + ph) % 1); const y = .5 + k*5.5; return mdl({ x: x + Math.sin(k*9)*.3, y, z, ry:t*1.5+ph*9, rx:Math.sin(t*2+ph*6)*.6 }); }); }
        for (let i=0;i<160;i++) g.glow(-7+rnd()*14, .5+rnd()*4.5, -5+rnd()*10, .07, [1,.82,.45], .9, 2+rnd()*4);
        crowd(g, sc, 0, 4.8, 5, .8, 8);
        [-3,0,3].forEach(x => sc.addLight([x,3.6,-3.6], '#FFE2B0', 1.7, 6.5)); sc.addLight([0,3.5,1.5], '#FFDCA8', 1.5, 7); sc.addLight([-5,3,1.5], '#FFDCA8', 1, 6); sc.addLight([5,3,1.5], '#FFDCA8', 1, 6);
      } },
    corporate: { label:'Corporate', sub:'Conference & launch', sky:['#0a0c10','#12151b'], fog:'#0d1015', fogD:.012, exposure:1.15, hemi:['#4a5260','#1c2028',.75], sun:{ dir:[.2,1,.2], col:'#dfe8ff', i:.05 },
      cam:{ target:[0,1.2,0], r:17, phi:.42, theta:1.2, fov:.72, speed:.075 }, cats:['venue','lighting','videography','catering','rentals','photography'],
      build(g, sc){
        g.plane(0,0,0,20,15,'#2B2E35',{ s:.08, f:12 }); g.plane(0,.004,1.5,1.4,11,'#3A3E47',{ s:.08 });
        wallSet(g, sc, 20, 15, 6, { wall:'#20232a', base:'#111', decor:(g,w,H) => { for (let i=-w/2+1;i<w/2;i+=2) g.box(i,0,.05,.05,H,.04,'#3d6fa0',{ e:.6 }); } });
        stage(g, 0, -5.9, 11, 3, .7, '#15171c', { led:'#9fc1e6' });
        g.box(0,1.2,-7.2,8,4.2,.15,'#08090c',{ s:.6 }); g.box(0,1.35,-7.1,7.6,3.9,.02,'#ffffff',{ e:.8, f:2 });
        [-6.1,6.1].forEach(x => { g.box(x,1.6,-6.8,2.2,2.8,.12,'#08090c'); g.box(x,1.7,-6.73,2,2.6,.02,'#ffffff',{ e:.6, f:2 }); });
        g.glow(0,3.2,-6.6,7,[.18,.2,.26]);
        g.at({ x:3.2, y:.7, z:-5.2 }, g => { g.loft([[-.35,-.25],[.35,-.25],[.35,.25],[-.35,.25]],0,[[-.42,-.3],[.42,-.3],[.42,.3],[-.42,.3]],1.15,'#1b1d22',{ s:.5 }); g.box(0,.2,-.31,.6,.4,.01,'#9fc1e6',{ e:1.5 }); });
        person(g, sc, 3.2, -5.6, { top:'#1d2433', dress:false, ry:0, legs:'#14161a' });
        // truss + moving beams
        g.box(0,5.2,-3.6,12,.25,.25,'#6c717a',{ s:.8 }); [-6,6].forEach(x => g.box(x,0,-3.6,.25,5.4,.25,'#6c717a',{ s:.8 }));
        [-4.5,-1.5,1.5,4.5].forEach((x,i) => { g.box(x,4.85,-3.6,.32,.35,.32,'#111',{ s:.6 }); g.glow(x,4.85,-3.6,.4,[1,.95,.85],.3,4);
          sc.dynamic(g => g.cyl(0,-6,0,1.2,.06,6,'#1d1a14',{ e:1, s:0 },16,false), t => mdl({ x, y:4.85, z:-3.6, rz:Math.sin(t*.7+i)*.35, rx:.35+Math.sin(t*.5+i*2)*.25 }), { additive:true }); });
        for (let r=0;r<6;r++) for (let c=0;c<12;c++){ if (c===5||c===6) continue; const x = -5.5 + c*1, z = -1.6 + r*1.2; chair(g, x, z, Math.PI, { leg:'#111', seat:'#1d1f24', solid:true, spec:.5 }); if (rnd()<.45) person(g, sc, x, z-.05, { ry:Math.PI }); }
        [[-8,5.5],[8,5.5],[-8,1.5],[8,1.5]].forEach(([x,z]) => { g.tube([x,0,z],[x,1.1,z],.04,'#ddd',{ s:.9 }); g.cyl(x,1.1,z,.4,.4,.04,'#F3F1EE',{ s:.4 }); g.shadow(x,z,.4,.4); crowd(g, sc, x, z, .9, .9, 2); });
        g.box(-6.5,0,6.4,3,1.05,.7,'#F3F1EE',{ s:.3 }); g.box(-6.5,.4,6.04,2.8,.3,.01,'#9fc1e6',{ e:1.2 });
        sc.addLight([0,3,-4], '#cfe0ff', 2.2, 9); sc.addLight([0,4,2], '#fff1dc', 1.6, 10); sc.addLight([-6,3,5], '#fff1dc', 1, 6);
      } },
    private: { label:'Rooftop', sub:'Private party in Beirut', sky:['#090b14','#2a2230'], fog:'#1a1720', fogD:.009, exposure:1.25, hemi:['#3a3a55','#1c1a1c',.55], sun:{ dir:[-.4,.6,-.6], col:'#b6a6d6', i:.12 },
      cam:{ target:[0,.6,0], r:16, phi:.45, theta:.6, fov:.74, speed:.1 }, cats:['venue','dj','catering','decoration','lighting','rentals'],
      build(g, sc){
        stars(g, 120); water(g, 260, '#0d1a26', -14);
        skyline(g, 0, 0, 'z', 22); skyline(g, 0, 0, 'x', 18);
        g.box(0,-14,0,16,14,13,'#1b1c20',{ s:.2 });
        g.box(0,0,0,16,.04,13,'#7A5C42',{ s:.3, f:6 });
        for (let i=-8;i<=8;i+=1.6){ g.tube([i,0,-6.5],[i,1.05,-6.5],.03,'#C8A96B',{ s:.9 }); g.tube([i,0,6.5],[i,1.05,6.5],.03,'#C8A96B',{ s:.9 }); }
        [-6.5,6.5].forEach(z => { g.box(0,1.03,z,16,.05,.06,'#C8A96B',{ s:.9 }); g.box(0,.04,z,16,.02,.04,'#FFD9A0',{ e:2 }); });
        // lounge around fire table
        g.box(-3,0,1.5,1.6,.42,.8,'#3a3532',{ s:.4 }); g.glow(-3,.55,1.5,1.4,[1,.5,.18],.45,10); for (let i=0;i<10;i++) g.glow(-3.6+i*.13,.5,1.5+(rnd()-.5)*.3,.25,[1,.65,.25],.6,14); sc.addLight([-3,.9,1.5], '#FF8C3A', 2, 5, .3);
        sofa(g, -3, -.2, 0, 3, '#E7E0D5', { base:'#FFD9A0' }); sofa(g, -3, 3.2, Math.PI, 3, '#E7E0D5', { base:'#FFD9A0' }); sofa(g, -5.1, 1.5, Math.PI/2, 2, '#E7E0D5', { base:'#FFD9A0' });
        bar(g, sc, 4.6, -4.4, 0, 4.2, { back:'#C8A96B' });
        djBooth(g, sc, 5.6, 2.4, -Math.PI/2, { glow:[.35,.25,.4] });
        [[-7.2,-5.6],[7.2,-5.6],[-7.2,5.6],[7.2,5.6],[0,-5.8],[1.2,5.8]].forEach(([x,z]) => planter(g, x, z, 1.1));
        for (let i=0;i<5;i++) stringLights(g, [-7.5, 3, -6 + i*3], [7.5, 3, -5 + i*2.6], .6, 14);
        [[-7.5,-6],[7.5,-5],[-7.5,6],[7.5,5.4]].forEach(([x,z]) => g.tube([x,0,z],[x,3.05,z],.04,'#222'));
        crowd(g, sc, 2.4, 1.6, 1.8, 2, 10, { dance:true }); crowd(g, sc, 4.4, -3, 1.5, .5, 3);
        sc.addLight([0,2.6,0], '#FFC98A', 1.5, 8); sc.addLight([4.4,2.4,2.4], '#C8A0FF', 1, 5);
      } },
    'baby-shower': { label:'Baby Shower', sub:'Garden afternoon', sky:['#8DB7DD','#EEF2F2'], fog:'#E3EAEC', fogD:.012, exposure:1, hemi:['#CFE0EE','#7E8F65',.9], sun:{ dir:[.5,.85,.35], col:'#FFF4E2', i:1.6 }, shadow:.5,
      cam:{ target:[0,.7,0], r:15, phi:.5, theta:1.0, fov:.72, speed:.09 }, cats:['venue','decoration','catering','cake','rentals','photography'],
      build(g, sc){
        ground(g, 200, '#86A564'); g.plane(0,.004,0,11,9,'#9BB878');
        [[-9,-7,'olive'],[9,-6,'oak'],[-10,4,'oak'],[10,6,'olive'],[0,-11,'oak'],[-5,-10,'olive'],[6,-10,'oak']].forEach(([x,z,k]) => tree(g, x, z, k, 1.6));
        g.box(0,0,-4.6,5,2.6,.2,'#FAF7F1',{ s:.1 }); g.box(0,2.6,-4.6,5.3,.12,.3,'#FAF7F1',{ s:.1 });
        balloonGarland(g, [[-2.8,.2,-4.3],[-2.6,2,-4.3],[-1.5,3.1,-4.3],[.5,3.2,-4.3],[2.3,2.6,-4.3],[2.8,1.2,-4.3]], ['#DCE6D2','#F3E2D8','#CFE0EC','#FFFFFF','#E8D9C3'], 9);
        g.box(0,0,-3.7,3,.85,.7,'#FFFFFF',{ s:.1 }); cake(g, -.6, .85, -3.7, 3, '#FFFFFF', ['#CFE0EC','#F3E2D8']);
        [.4,.8,1.2].forEach((x,i) => { g.cyl(x,.85,-3.7,.12,.12,.2+i*.08,'#E9E1D3',{ s:.4 }); for (let k=0;k<5;k++) g.sphere(x+(rnd()-.5)*.15, 1.1+i*.08, -3.7+(rnd()-.5)*.15, .06, pick(['#F3E2D8','#CFE0EC','#FFFFFF']), {}, 6); });
        // teddy bear
        g.at({ x:2.1, z:-3.6 }, g => { const c = '#C9A27E'; g.sphere(0,.35,0,.3,c,{},10); g.sphere(0,.8,0,.22,c,{},10); [-.16,.16].forEach(d => { g.sphere(d,1,0,.08,c,{},8); g.sphere(d*1.4,.2,-.15,.11,c,{},8); g.sphere(d*1.6,.5,-.05,.09,c,{},8); }); g.sphere(0,.76,-.19,.08,'#E3C8A9',{},8); g.shadow(0,0,.4,.4); });
        [[-2.4,0],[0,1.2],[2.4,0]].forEach(([x,z]) => { g.box(x,0,z,1.6,.06,1.6,pick(['#EFE6D6','#E6EDE2','#F3E9E2']),{ s:.05 }); g.box(x,.06,z,1.1,.32,.6,'#F8F4EC',{ s:.1 }); g.shadow(x,z,.9,.35,1,.6);
          [[-.75,0],[.75,0],[0,.6],[0,-.6]].forEach(([dx,dz]) => g.box(x+dx,.06,z+dz,.45,.14,.45,pick(['#DCE6D2','#F3E2D8','#CFE0EC']),{ s:.05 }));
          flowers(g, x, .4, z, .14, ['#FFFFFF','#F3E2D8','#DCE6D2'], 5); g.cyl(x+.3,.38,z,.04,.04,.12,'#CFE0EC',{ s:.9 }); });
        [[-4.4,-2.6],[4.4,-2.6]].forEach(([x,z]) => { g.cyl(x,0,z,.16,.2,.6,'#E9E1D3',{ s:.3 }); for (let k=0;k<9;k++){ const a = rnd()*6.28; g.tube([x,.55,z],[x+Math.cos(a)*.5,1.6+rnd()*.4,z+Math.sin(a)*.5],.02,'#C9B79C'); g.sphere(x+Math.cos(a)*.52,1.7+rnd()*.4,z+Math.sin(a)*.52,.12,'#E8DCC7',{},6,2); } });
        umbrella(g, 4.6, 2.6, '#FFFFFF', 2.2); umbrella(g, -4.6, 2.8, '#F3E2D8', 2.2);
        crowd(g, sc, 0, 2.4, 3.5, 1.4, 7); person(g, sc, 3.2, -2.6, { top:'#F3E2D8', dress:true });
      } },
    bachelor: { label:'Bachelor', sub:'Lounge & club night', sky:['#050505','#0b0909'], fog:'#0a0808', fogD:.03, exposure:1.4, hemi:['#2b2220','#0f0b0a',.45], sun:{ dir:[.2,1,.2], col:'#ffffff', i:0 },
      cam:{ target:[0,1,0], r:14.5, phi:.42, theta:.8, fov:.74, speed:.1 }, cats:['venue','dj','entertainment','lighting','catering','transportation'],
      build(g, sc){
        g.plane(0,0,0,16,13,'#0c0c0d',{ s:.95 });
        wallSet(g, sc, 16, 13, 4.6, { wall:'#141212', base:'#0a0a0a', decor:(g,w) => { g.box(0,.35,.04,w,.03,.02,'#FF5A3C',{ e:2.5 }); g.box(0,3.6,.04,w,.03,.02,'#FFB25A',{ e:2.5 }); } });
        stage(g, 0, -4.8, 5, 2.4, .8, '#111', { led:'#FFB25A' }); g.at({ y:.8 }, g => djBooth(g, sc, 0, -4.8, 0, { led:'#FF5A3C', glow:[.6,.2,.1] }));
        danceFloor(g, 0, -1, 6, 3.6, '#121212', '#1b1717', { s:.98, tile:1.2 });
        [-1,1].forEach(side => { for (let k=0;k<3;k++){ const z = -2.2 + k*2.6, x = side*6.4; g.at({ x, z, ry: side>0 ? -Math.PI/2 : Math.PI/2 }, g => { g.box(0,0,0,2.4,.45,.9,'#2a1d1a',{ s:.6 }); g.box(0,.45,.35,2.4,.6,.22,'#2a1d1a',{ s:.6 }); g.box(0,.03,-.46,2.4,.02,.01,'#FFB25A',{ e:2.5 }); });
          g.cyl(x - side*1.3, 0, z, .45, .45, .45, '#161414', { s:.9 }); g.cyl(x - side*1.3, .45, z, .14, .12, .22, '#C8A96B', { s:1 }); g.glow(x - side*1.3, .7, z, .5, [1,.75,.4], .3, 6); g.shadow(x - side*.6, z, 1.5, .45); } });
        g.at({ x:-2.6, z:4.2 }, g => { g.box(0,0,0,2.4,.78,1.3,'#3a2416',{ s:.6 }); g.box(0,.78,0,2.2,.04,1.1,'#1f5b3a',{ s:.05 }); [[.8,.2],[.4,-.2],[0,.1],[-.6,.3]].forEach(([dx,dz],i) => g.sphere(dx,.86,dz,.05,['#ffffff','#C8A96B','#A33A2B','#111'][i],{ s:1 },8)); g.box(0,1.9,0,1.6,.08,.3,'#111'); g.glow(0,1.85,0,1.2,[.35,.3,.2]); });
        sc.addLight([-2.6,1.8,4.2], '#FFE8C0', 1.4, 3.5);
        bar(g, sc, 3.2, 5.6, Math.PI, 4.4, { back:'#7A2A1A', led:'#FFB25A' });
        const laserCols = ['#B8301C','#C8781E','#A04A2A','#B8301C'];
        laserCols.forEach((c,i) => { for (let k=0;k<5;k++) sc.dynamic(g => g.box(0,0,6,.02,.02,12,c,{ e:1.3, s:0 }), t => mdl({ x:-1.5 + i, y:3.8, z:-4.8, ry:Math.sin(t*.8+i*1.7)*.9 + (k-2)*.12, rx:.12 + Math.sin(t*.6+k)*.08 }), { additive:true }); });
        [-2.5,2.5].forEach((x,i) => sc.dynamic(g => g.cyl(0,-5,0,1,.05,5,'#2a1208',{ e:1, s:0 },16,false), t => mdl({ x, y:4.4, z:-2, rz:Math.sin(t*1.1+i*2)*.45, rx:Math.cos(t*.9+i)*.3 }), { additive:true }));
        crowd(g, sc, 0, -1, 2.6, 1.6, 12, { dance:true, dress:false }); crowd(g, sc, 3.2, 4.4, 1.6, .4, 3);
        sc.addLight([0,3.5,-1], '#FF6A40', 2.2, 7); sc.addLight([3,3,4], '#FFC080', 1.4, 6); sc.addLight([-5,3,0], '#FF9A50', 1, 6);
      } },
    bachelorette: { label:'Bachelorette', sub:'Yacht at sunset', sky:['#3a2c4a','#F2A27A'], fog:'#D99A82', fogD:.006, exposure:1.05, hemi:['#E8B9A6','#3a3a52',.85], sun:{ dir:[-.8,.25,-.4], col:'#FFB27A', i:1.3 }, shadow:.4,
      cam:{ target:[0,1,0], r:17, phi:.36, theta:.4, fov:.72, speed:.1 }, cats:['venue','decoration','catering','dj','photography','transportation'],
      build(g, sc){
        water(g, 320, '#2E4C66', -.6); g.sphere(-110,12,-90,10,'#FFD9A0',{ f:3 }); g.glow(-110,12,-90,60,[.45,.25,.12]);
        mountains(g, ['#4a3b4c','#53424f','#3e3446'], 95, 10); for (let i=0;i<260;i++){ const a = 1.6 + rnd()*1.6, r = 70 + rnd()*12; g.glow(Math.cos(a)*r, rnd()*5, Math.sin(a)*r, .5, [1,.8,.5], .4, 1+rnd()); }
        // hull
        const hull = (s, y) => [[-7.5*s,0],[-6*s,-2*s],[3*s,-2.1*s],[6.5*s,-1.2*s],[8.2*s,0],[6.5*s,1.2*s],[3*s,2.1*s],[-6*s,2*s]];
        g.loft(hull(.78,0), -1.2, hull(1,0), .6, '#F7F6F3', { s:.8 }, false);
        g.loft(hull(1,0), .6, hull(1,0), .62, '#B08A5E', { s:.4 });
        for (let i=-7.3;i<8;i+=.3){ const hw = i < -6 ? 2*(i+7.5)/1.5 : i < 3 ? 2.05 : i < 6.5 ? 2.1-.9*(i-3)/3.5 : 1.2*(1-(i-6.5)/1.7); if (hw > .05) g.box(i,.62,0,.02,.005,hw*1.9,'#8a6a46'); }
        g.loft(hull(.78,0), -.62, hull(.79,0), -.55, '#1F3A57', { s:.6 }, false);
        // cabin + flybridge
        g.box(-1,.62,0,5,1.4,3,'#F7F6F3',{ s:.6 }); g.box(-1,1.2,1.51,4.6,.6,.02,'#1c2a38',{ s:1 }); g.box(-1,1.2,-1.51,4.6,.6,.02,'#1c2a38',{ s:1 });
        g.box(-1.6,2.02,0,3.6,.08,3,'#F7F6F3',{ s:.5 }); for (let x=-3.2;x<=0;x+=1.6) [-1.4,1.4].forEach(z => g.tube([x,2.1,z],[x,2.9,z],.03,'#dcdcdc',{ s:1 }));
        g.box(-1.6,2.9,0,3.6,.05,3,'#F7F6F3',{ s:.4 });
        // rails
        const rail = hull(.95,0); for (let i=0;i<rail.length;i++){ const a = rail[i], b = rail[(i+1)%rail.length]; g.tube([a[0],1.4,a[1]],[b[0],1.4,b[1]],.025,'#e6e6e6',{ s:1 }); g.tube([a[0],.62,a[1]],[a[0],1.4,a[1]],.02,'#e6e6e6',{ s:1 }); }
        // bow lounge + aft seating
        [[3.6,-.7],[3.6,.7],[5,0]].forEach(([x,z]) => { g.box(x,.62,z,1.3,.25,.62,'#F3E2D8',{ s:.1 }); g.box(x-.3,.87,z,.4,.18,.5,'#E7C9BE',{ s:.1 }); });
        g.box(-5.4,.62,0,1.3,.45,3,'#F3E2D8',{ s:.1 }); g.box(-4.2,.62,0,.8,.75,1.2,'#B08A5E',{ s:.5 });
        g.cyl(-4.2,1.37,.2,.12,.1,.25,'#C8A96B',{ s:1 }); g.cyl(-4.2,1.37,-.3,.04,.04,.25,'#E7F0D8',{ s:1 });
        for (let i=0;i<14;i++){ const p = rail[i%rail.length], q = rail[(i+1)%rail.length], t = rnd(); const x = p[0]+(q[0]-p[0])*t, z = p[1]+(q[1]-p[1])*t, ph = rnd()*6, col = pick(['#F3C6CF','#FFFFFF','#C8A96B','#F7DCE2']);
          sc.dynamic(g => balloon(g, 0, 0, 0, .22, col, { chrome: col==='#C8A96B', string:-.6 }), t => mdl({ x: x + Math.sin(t*.8+ph)*.06, y: 2.1 + Math.sin(t*1.3+ph)*.08, z: z + Math.cos(t*.7+ph)*.06 })); }
        stringLights(g, [-3.4,2.9,-1.5],[6.5,1.5,0],.4,14); stringLights(g, [-3.4,2.9,1.5],[6.5,1.5,0],.4,14);
        [[-5,.6],[-4.6,-.9],[3.4,1.2],[4.2,-1],[2.2,.2],[-3.4,1.1]].forEach(([x,z]) => person(g, sc, x, z, { dress:true, top:pick(['#F3C6CF','#FFFFFF','#E7C9BE','#C8A96B','#D9A6B0']), dance:true }));
        sc.addLight([-1,4,0], '#FFD3B0', 1, 9);
      } },
    beach: { label:'Beach', sub:'Sunset dinner by the sea', sky:['#4a3a5c','#F6B37E'], fog:'#E7AE8A', fogD:.007, exposure:1.05, hemi:['#F2C3A0','#6a5a4a',.85], sun:{ dir:[-.7,.3,-.65], col:'#FFB680', i:1.4 }, shadow:.4,
      cam:{ target:[0,.6,0], r:16, phi:.42, theta:.9, fov:.72, speed:.09 }, cats:['venue','catering','rentals','lighting','dj','decoration'],
      build(g, sc){
        water(g, 320, '#2F5970', -.45); g.sphere(-100,9,-95,10,'#FFDCA6',{ f:3 }); g.glow(-100,9,-95,70,[.5,.28,.12]);
        g.loft([[-9,-6],[9,-6],[11,8],[-11,8]], -1, [[-9,-5],[9,-5],[10,8],[-10,8]], .02, '#E8D3AE', { s:.1, f:8 });
        g.loft([[-30,8],[30,8],[30,30],[-30,30]], -1, [[-30,8],[30,8],[30,30],[-30,30]], .02, '#E8D3AE', { s:.1, f:8 });
        for (let i=-1.5;i<1.5;i+=.25) g.box(i+.125,.02,3,.23,.06,12,'#B08A5E',{ s:.3 });
        longTable(g, 0, -1.3, 7, 0, { chair:{ leg:'#B08A5E', seat:'#EADFCB', spec:.2 }, flowers:['#FFFFFF','#F3E2D8','#E8D5A8'], tall:true });
        [[-6.5,2],[6.5,2.4],[-6.6,-3.2]].forEach(([x,z]) => { umbrella(g, x, z, '#C9A774', 2.3); lounger(g, x+.6, z+1.6, .3); lounger(g, x-.7, z+1.6, -.2); });
        g.at({ x:5.6, z:-3.4 }, g => { g.box(0,0,0,2.6,1.05,.8,'#8B6F52',{ s:.3 }); g.box(0,1.05,0,2.8,.06,1,'#C9A97C',{ s:.5 }); [-1.2,1.2].forEach(x => [-.4,.4].forEach(z => g.tube([x,0,z+1],[x,2.6,z+1],.05,'#6b5a48'))); g.cyl(0,2.6,1,2.2,.05,.9,'#C9A774',{ s:.05 },6); g.box(0,1.2,1.2,2.2,.9,.05,'#C8A96B',{ e:.5 }); });
        g.glow(5.6,1.6,-2.8,2,[.4,.25,.12]);
        const posts = [[-4.6,-4],[4.6,-4],[-4.6,1.4],[4.6,1.4]]; posts.forEach(([x,z]) => torch(g, sc, x, z, 2.5));
        stringLights(g, [-4.6,2.5,-4],[4.6,2.5,-4],.5,16); stringLights(g, [-4.6,2.5,1.4],[4.6,2.5,1.4],.5,16); stringLights(g, [-4.6,2.5,-4],[4.6,2.5,1.4],.7,18);
        for (let i=0;i<10;i++) lantern(g, -4 + i*.9, 4.2 + (i%2)*.4, 1);
        crowd(g, sc, 0, 3, 3, 1, 6); person(g, sc, 5, -2.5, {}); person(g, sc, 6.1, -2.4, {});
      } },
    outdoor: { label:'Outdoor', sub:'Mountain garden', sky:['#20314d','#E6B48A'], fog:'#B9A99C', fogD:.012, exposure:1.05, hemi:['#BFC9D6','#4a5a3a',.8], sun:{ dir:[.7,.35,-.5], col:'#FFC796', i:1.1 }, shadow:.45,
      cam:{ target:[0,1,0], r:17, phi:.42, theta:1.6, fov:.72, speed:.09 }, cats:['venue','rentals','catering','lighting','decoration','transportation'],
      build(g, sc){
        ground(g, 220, '#5E7347'); mountains(g, ['#4f5d6b','#5a6876','#46525e'], 75, 16);
        for (let i=0;i<22;i++){ const a = rnd()*6.28, r = 12 + rnd()*14; tree(g, Math.cos(a)*r, Math.sin(a)*r, 'pine', 1 + rnd()*.6); }
        for (let i=-8;i<8;i+=.9) g.box(i,0,7.2,.88,.6+rnd()*.15,.5,pick(['#A79F92','#B5AD9F','#9B9386']),{ s:.1 });
        // sailcloth tent: peaks on center poles, edges on perimeter poles
        const peaks = [[-3.2,0,6],[3.2,0,6]], edge = [[-7,-4.5],[-3.2,-5],[0,-4.6],[3.2,-5],[7,-4.5],[7.5,0],[7,4.5],[3.2,5],[0,4.6],[-3.2,5],[-7,4.5],[-7.5,0]];
        peaks.forEach(([x,z,h]) => { g.tube([x,0,z],[x,h,z],.09,'#8a6b4a'); g.shadow(x,z,.2,.4); });
        edge.forEach(([x,z]) => { g.tube([x,0,z],[x,2.7,z],.06,'#8a6b4a'); g.shadow(x,z,.15,.4); });
        const pk = (x) => x < 0 ? peaks[0] : peaks[1];
        for (let i=0;i<edge.length;i++){ const a = edge[i], b = edge[(i+1)%edge.length], p = pk((a[0]+b[0])/2), q = [p[0], p[2], p[1]];
          g.quad([a[0],2.7,a[1]],[b[0],2.7,b[1]],q,q,'#F4EEE3',{ s:.15, e:.12 }); }
        g.quad([-3.2,6,0],[3.2,6,0],[0,2.7,4.6],[0,2.7,4.6],'#F4EEE3',{ s:.15, e:.12 }); g.quad([-3.2,6,0],[3.2,6,0],[0,2.7,-4.6],[0,2.7,-4.6],'#F4EEE3',{ s:.15, e:.12 });
        g.shadow(0,0,1,.25,7,4.8);
        [-2.2,2.2].forEach(z => longTable(g, 0, z, 9, 0, { wood:'#7A5C42', chair:{ leg:'#6b5139', seat:'#6b5139', spec:.2 }, flowers:['#FFFFFF','#F0E4CF','#DCC7A1'] }));
        edge.forEach(([x,z],i) => { const p = pk(x); stringLights(g, [x,2.6,z],[p[0],4.6,p[1]*0 + (z>0?.3:-.3)],.4,8,{ size:.2 }); });
        g.cyl(0,0,-7.8,.9,.8,.35,'#6E6A63',{ s:.2 }); g.glow(0,.6,-7.8,1.5,[1,.5,.18],.45,10); for (let i=0;i<8;i++) g.glow((rnd()-.5)*.8,.5,-7.8+(rnd()-.5)*.6,.3,[1,.65,.25],.6,14); sc.addLight([0,1,-7.8],'#FF8C3A',2,5,.3);
        [[-1.6,-7.8],[1.6,-7.8],[0,-9.4]].forEach(([x,z]) => g.box(x,0,z,.9,.4,.9,'#B5AD9F',{ s:.1 }));
        sc.addLight([-3.2,4,0], '#FFD3A0', 1.5, 8); sc.addLight([3.2,4,0], '#FFD3A0', 1.5, 8);
        crowd(g, sc, 0, 0, 5, .5, 6); crowd(g, sc, 0, -7.6, 1.8, 1.4, 4);
      } },
    other: { label:'Gala dinner', sub:'Velvet & candlelight', sky:['#0b0d0b','#141813'], fog:'#0f120f', fogD:.012, exposure:.95, hemi:['#3f3a35','#1b1a18',.6], sun:{ dir:[.2,1,.2], col:'#fff', i:.03 },
      cam:{ target:[0,.9,0], r:15.5, phi:.5, theta:.75, fov:.72, speed:.08 }, cats:['venue','catering','decoration','florist','entertainment','lighting'],
      build(g, sc){
        g.box(0,0,0,18,.02,14,'#45301F',{ s:.55, f:6 });
        wallSet(g, sc, 18, 14, 5.4, { wall:'#1F3A2F', base:'#C8A96B', decor:(g,w,H) => { panelDecor('#244538','#C8A96B',0)(g,w,H); for (let x=-w/2+.6;x<w/2;x+=.35) g.cyl(x,0,.15,.09,.09,H-.2,'#5A1E22',{ s:.25 },8,false); } });
        g.box(0,0,0,11,.02,4,'#3A1418',{ s:.2 });
        longTable(g, 0, 0, 10, 0, { cloth:'#4A161B', chair:{ leg:'#C8A96B', seat:'#1F3A2F', solid:true, back:'#1F3A2F' }, flowers:['#7A1E2A','#A33A3B','#E9D4C0','#5A1E22'], green:'#2F4A2A', candelabras:5, runner:true });
        [-3,0,3].forEach(x => chandelier(g, sc, x, 3.9, 0, 1, { ceil:5.4, i:1.1 }));
        // grand piano
        g.at({ x:-6, z:-4.4, ry:.6 }, g => { const shape = [[-.75,-1],[.75,-1],[.75,.2],[.5,.8],[0,1.1],[-.5,.9],[-.75,.4]]; g.loft(shape,.62,shape,.95,'#0a0a0a',{ s:1 }); g.box(0,.62,-1.05,1.5,.12,.3,'#efefef',{ s:.5 }); [[-.6,-.9],[.6,-.9],[0,.9]].forEach(([x,z]) => g.box(x,0,z,.09,.62,.09,'#0a0a0a',{ s:1 })); g.at({ y:.95, z:.1, rx:-.7 }, g => g.box(0,0,.5,1.4,.02,1,'#0a0a0a',{ s:1 })); });
        person(g, sc, -5.4, -5.3, { top:'#111', dress:false, ry:.6 });
        [[6,-4.8],[6.8,-3.8],[6.6,4.6]].forEach(([x,z]) => { g.cyl(x,0,z,.2,.25,1,'#C8A96B',{ s:.9 }); flowers(g, x, 1, z, .4, ['#7A1E2A','#A33A3B','#E9D4C0'], 10); greenery(g, x, 1, z, .8, 1); });
        crowd(g, sc, 5.4, 3.5, 1.4, 1.4, 5); crowd(g, sc, -5, 4, 1.4, 1.2, 4);
        sc.addLight([0,2.5,3.5], '#FFD9A6', 1, 7); sc.addLight([-6,2.5,-4], '#FFD9A6', 1, 5);
      } }
  };
  const FOR_EVENT = { wedding:'wedding', engagement:'engagement', birthday:'birthday', graduation:'graduation', corporate:'corporate', private:'private', 'baby-shower':'baby-shower', bachelor:'bachelor', bachelorette:'bachelorette', beach:'beach', outdoor:'outdoor', other:'other' };
  const C = { chair, candle, flowers, greenery, roundTable, longTable, person, crowd, chandelier, stringLights, balloon, balloonGarland, arcPts, djBooth, danceFloor, cake, sofa, bar, tree, planter, torch, lantern, umbrella, lounger, stage, floralArch, flowerWall, wallSet, panelDecor, stars, ground, water, mountains, skyline, mdl, rnd, pick, faceTo };
  return { SCENES, FOR_EVENT, C };
})();
