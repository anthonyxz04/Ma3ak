/* =========================================================
   MA3AK 3D — a small WebGL engine for live event scenes.
   Lit materials, tone mapping, fog, soft contact shadows,
   glowing lights, animated water/screens/people, orbit camera.
   ========================================================= */
const GL3D = (() => {
  /* ---------- math ---------- */
  const sub = (a,b) => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const norm = a => { const l = Math.hypot(a[0],a[1],a[2]) || 1; return [a[0]/l,a[1]/l,a[2]/l]; };
  const persp = (f, a, n, fa) => { const t = 1/Math.tan(f/2), nf = 1/(n-fa); return [t/a,0,0,0, 0,t,0,0, 0,0,(fa+n)*nf,-1, 0,0,2*fa*n*nf,0]; };
  const lookAt = (e, c, u) => { const z = norm(sub(e,c)), x = norm(cross(u,z)), y = cross(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot(x,e),-dot(y,e),-dot(z,e),1]; };
  const mul4 = (a,b) => { const o = new Array(16); for (let i=0;i<4;i++) for (let j=0;j<4;j++){ let s=0; for (let k=0;k<4;k++) s += a[k*4+j]*b[i*4+k]; o[i*4+j] = s; } return o; };
  // 3x3 row-major helpers
  const m3 = (a,b) => { const o = []; for (let i=0;i<3;i++) for (let j=0;j<3;j++) o[i*3+j] = a[i*3]*b[j] + a[i*3+1]*b[3+j] + a[i*3+2]*b[6+j]; return o; };
  const m3v = (m,v) => [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
  const m3invT = m => { const [a,b,c,d,e,f,g,h,i] = m; const A=e*i-f*h, B=-(d*i-f*g), Cc=d*h-e*g, D=-(b*i-c*h), E=a*i-c*g, F=-(a*h-b*g), G=b*f-c*e, H=-(a*f-c*d), I=a*e-b*d; const det = a*A+b*B+c*Cc || 1; return [A/det,B/det,Cc/det, D/det,E/det,F/det, G/det,H/det,I/det]; };
  const rotM = (rx=0, ry=0, rz=0) => { const cx=Math.cos(rx), sx=Math.sin(rx), cy=Math.cos(ry), sy=Math.sin(ry), cz=Math.cos(rz), sz=Math.sin(rz);
    const Ry=[cy,0,sy, 0,1,0, -sy,0,cy], Rx=[1,0,0, 0,cx,-sx, 0,sx,cx], Rz=[cz,-sz,0, sz,cz,0, 0,0,1]; return m3(m3(Ry,Rx),Rz); };
  const T = ({x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1,s}={}) => { if (s!=null){ sx=sy=sz=s; } const R = rotM(rx,ry,rz); return { M:[R[0]*sx,R[1]*sy,R[2]*sz, R[3]*sx,R[4]*sy,R[5]*sz, R[6]*sx,R[7]*sy,R[8]*sz], t:[x,y,z] }; };
  const compose = (A,B) => ({ M:m3(A.M,B.M), t:(v => [v[0]+A.t[0], v[1]+A.t[1], v[2]+A.t[2]])(m3v(A.M,B.t)) });
  const ID = { M:[1,0,0,0,1,0,0,0,1], t:[0,0,0] };
  const mat4 = (tr) => { const M = tr.M; return [M[0],M[3],M[6],0, M[1],M[4],M[7],0, M[2],M[5],M[8],0, tr.t[0],tr.t[1],tr.t[2],1]; };
  const hex = h => { h = h.replace('#',''); return [0,2,4].map(i => Math.pow(parseInt(h.slice(i,i+2),16)/255, 2.2)); };
  const hexD = (h, k=1) => { h = h.replace('#',''); return [0,2,4].map(i => parseInt(h.slice(i,i+2),16)/255*k); };

  /* ---------- geometry builder ---------- */
  class Geo {
    constructor(){ this.p=[]; this.n=[]; this.c=[]; this.m=[]; this.stack=[ID]; this.sp=[]; this.sa=[]; this.gp=[]; this.gc=[]; this.gg=[]; }
    get tr(){ return this.stack[this.stack.length-1]; }
    push(t){ this.stack.push(compose(this.tr, t.M ? t : T(t))); return this; }
    pop(){ this.stack.pop(); return this; }
    at(t, fn){ this.push(t); fn(this); this.pop(); return this; }
    _emit(local, tr, col, mat){ // local: [[p,n],...] triangles
      const N = m3invT(tr.M), c = typeof col === 'string' ? hex(col) : col, mm = [mat.e||0, mat.s==null ? .25 : mat.s, mat.f||0];
      for (const [p,n] of local){ const q = m3v(tr.M,p), nn = norm(m3v(N,n)); this.p.push(q[0]+tr.t[0], q[1]+tr.t[1], q[2]+tr.t[2]); this.n.push(...nn); this.c.push(...c); this.m.push(...mm); }
    }
    box(x,y,z,w,h,d,col,mat={}){
      const tr = compose(this.tr, T({x, y:y+h/2, z, sx:w, sy:h, sz:d, ry:mat.ry||0, rz:mat.rz||0})), L = [];
      const faces = [[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[0,0,-1],[1,0,0]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
      for (const [n,u,v] of faces){ const c = (a,b) => [n[0]*.5+u[0]*a+v[0]*b, n[1]*.5+u[1]*a+v[1]*b, n[2]*.5+u[2]*a+v[2]*b];
        const q = [c(-.5,-.5),c(.5,-.5),c(.5,.5),c(-.5,.5)]; [q[0],q[1],q[2],q[0],q[2],q[3]].forEach(p => L.push([p,n])); }
      this._emit(L, tr, col, mat); return this;
    }
    cyl(x,y,z,rb,rt,h,col,mat={},seg=26,caps=true){
      const tr = compose(this.tr, T({x,y,z})), L = [], k = (rb-rt)/h;
      for (let i=0;i<seg;i++){ const a0 = i/seg*Math.PI*2, a1 = (i+1)/seg*Math.PI*2, c0=Math.cos(a0), s0=Math.sin(a0), c1=Math.cos(a1), s1=Math.sin(a1);
        const n0 = norm([c0,k,s0]), n1 = norm([c1,k,s1]);
        const A=[[rb*c0,0,rb*s0],n0], B=[[rb*c1,0,rb*s1],n1], C=[[rt*c1,h,rt*s1],n1], D=[[rt*c0,h,rt*s0],n0];
        L.push(A,B,C,A,C,D);
        if (caps){ if (rt>0) L.push([[0,h,0],[0,1,0]],[[rt*c0,h,rt*s0],[0,1,0]],[[rt*c1,h,rt*s1],[0,1,0]]); if (rb>0) L.push([[0,0,0],[0,-1,0]],[[rb*c1,0,rb*s1],[0,-1,0]],[[rb*c0,0,rb*s0],[0,-1,0]]); } }
      this._emit(L, tr, col, mat); return this;
    }
    sphere(x,y,z,r,col,mat={},seg=12,sy=1){
      const tr = compose(this.tr, T({x,y,z,sx:r,sy:r*sy,sz:r})), L = [], rings = Math.max(6, Math.round(seg*.6));
      const P = (i,j) => { const th = j/rings*Math.PI, ph = i/seg*Math.PI*2; const v = [Math.sin(th)*Math.cos(ph), Math.cos(th), Math.sin(th)*Math.sin(ph)]; return [v,v]; };
      for (let j=0;j<rings;j++) for (let i=0;i<seg;i++){ const a=P(i,j), b=P(i+1,j), c=P(i+1,j+1), d=P(i,j+1); L.push(a,b,c,a,c,d); }
      this._emit(L, tr, col, mat); return this;
    }
    plane(x,y,z,w,d,col,mat={},nx=1,nz=1){
      const tr = compose(this.tr, T({x,y,z})), L = [], n = [0,1,0];
      for (let i=0;i<nx;i++) for (let j=0;j<nz;j++){ const x0=-w/2+w*i/nx, x1=-w/2+w*(i+1)/nx, z0=-d/2+d*j/nz, z1=-d/2+d*(j+1)/nz;
        L.push([[x0,0,z0],n],[[x1,0,z0],n],[[x1,0,z1],n],[[x0,0,z0],n],[[x1,0,z1],n],[[x0,0,z1],n]); }
      this._emit(L, tr, col, mat); return this;
    }
    tube(a,b,r,col,mat={},seg=6){
      const d = sub(b,a), L0 = Math.hypot(...d) || 1e-4, Y = norm(d), ref = Math.abs(Y[1]) > .9 ? [1,0,0] : [0,1,0], X = norm(cross(ref,Y)), Z = cross(X,Y);
      this.push({ M:[X[0],Y[0],Z[0], X[1],Y[1],Z[1], X[2],Y[2],Z[2]], t:a }); this.cyl(0,0,0,r,r,L0,col,mat,seg,false); this.pop(); return this;
    }
    loft(pb, yb, pt, yt, col, mat={}, capTop=true){ // pb/pt: arrays of [x,z]
      const tr = this.tr, L = [], n = pb.length;
      for (let i=0;i<n;i++){ const j=(i+1)%n, A=[pb[i][0],yb,pb[i][1]], B=[pb[j][0],yb,pb[j][1]], C=[pt[j][0],yt,pt[j][1]], D=[pt[i][0],yt,pt[i][1]];
        let nn = norm(cross(sub(B,A), sub(D,A))); const mid = [(A[0]+B[0])/2, 0, (A[2]+B[2])/2]; if (dot(nn, mid) < 0) nn = nn.map(v => -v);
        L.push([A,nn],[B,nn],[C,nn],[A,nn],[C,nn],[D,nn]); }
      if (capTop){ const cx = pt.reduce((s,p)=>s+p[0],0)/n, cz = pt.reduce((s,p)=>s+p[1],0)/n; for (let i=0;i<n;i++){ const j=(i+1)%n; L.push([[cx,yt,cz],[0,1,0]],[[pt[i][0],yt,pt[i][1]],[0,1,0]],[[pt[j][0],yt,pt[j][1]],[0,1,0]]); } }
      this._emit(L, tr, col, mat); return this;
    }
    quad(a,b,c,d,col,mat={}){
      let n = norm(cross(sub(b,a), sub(d,a))); if (mat.flip) n = n.map(v => -v);
      this._emit([[a,n],[b,n],[c,n],[a,n],[c,n],[d,n]], this.tr, col, mat); return this;
    }
    shadow(x,z,r,a=.4,sx=1,sz=1,ry=0){
      const c = m3v(this.tr.M,[x,0,z]); const cx = c[0]+this.tr.t[0], cz = c[2]+this.tr.t[2], y = this.tr.t[1] + .012 + this.sp.length*1e-7;
      const seg = 20, cr = Math.cos(ry), sr = Math.sin(ry);
      for (let i=0;i<seg;i++){ const a0=i/seg*Math.PI*2, a1=(i+1)/seg*Math.PI*2;
        const P = a => { const lx = Math.cos(a)*r*sx, lz = Math.sin(a)*r*sz; return [cx + lx*cr - lz*sr, y, cz + lx*sr + lz*cr]; };
        this.sp.push(cx,y,cz, ...P(a0), ...P(a1)); this.sa.push(a,0,0); }
      return this;
    }
    glow(x,y,z,size,col,tw=0,speed=2){
      const q = m3v(this.tr.M,[x,y,z]); this.gp.push(q[0]+this.tr.t[0], q[1]+this.tr.t[1], q[2]+this.tr.t[2]);
      this.gc.push(...(typeof col === 'string' ? hexD(col) : col)); this.gg.push(size, Math.random()*6.28, tw, speed); return this;
    }
  }

  /* ---------- shaders ---------- */
  const VS = `precision highp float;
  attribute vec3 aPos; attribute vec3 aNor; attribute vec3 aCol; attribute vec3 aMat;
  uniform mat4 uVP; uniform mat4 uModel; uniform float uTime; uniform mat4 uLightVP;
  varying vec3 vPos; varying vec3 vNor; varying vec3 vCol; varying vec3 vMat; varying vec4 vLPos;
  void main(){
    vec4 wp = uModel * vec4(aPos,1.0); vec3 n = (uModel * vec4(aNor,0.0)).xyz;
    if (aMat.z > 0.5 && aMat.z < 1.5){
      float t = uTime; vec3 p = wp.xyz;
      float h = sin(p.x*.55 + t*1.1)*.07 + sin(p.z*.8 - t*1.5)*.05 + sin((p.x+p.z)*1.9 + t*2.4)*.02;
      float dx = cos(p.x*.55 + t*1.1)*.0385 + cos((p.x+p.z)*1.9 + t*2.4)*.038;
      float dz = cos(p.z*.8 - t*1.5)*.04 + cos((p.x+p.z)*1.9 + t*2.4)*.038;
      wp.y += h; n = normalize(vec3(-dx, 1.0, -dz));
    }
    vPos = wp.xyz; vNor = n; vCol = aCol; vMat = aMat; vLPos = uLightVP * wp;
    gl_Position = uVP * wp;
  }`;
  const FS = `precision highp float;
  varying vec3 vPos; varying vec3 vNor; varying vec3 vCol; varying vec3 vMat; varying vec4 vLPos;
  uniform sampler2D uShadowMap; uniform float uShadowOn; uniform float uShadowTexel; uniform float uShadowAmb; uniform vec3 uEnvTop; uniform vec3 uEnvBot;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x), f.y); }
  float fbm(vec2 p){ float s = 0.0, a = .5; for (int i=0;i<4;i++){ s += a*noise(p); p *= 2.03; a *= .5; } return s; }
  float unpackD(vec4 c){ return dot(c, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0)); }
  float shadowF(vec3 N, vec3 L){
    if (uShadowOn < .5) return 1.0;
    vec3 p = vLPos.xyz / vLPos.w * .5 + .5;
    if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
    float bias = .0012 + .004*(1.0 - abs(dot(N, L)));
    float s = 0.0;
    for (int x=-1;x<=1;x++) for (int y=-1;y<=1;y++){ float d = unpackD(texture2D(uShadowMap, p.xy + vec2(float(x),float(y))*uShadowTexel)); s += (p.z - bias > d) ? 0.0 : 1.0; }
    return s / 9.0;
  }
  uniform vec3 uCam; uniform vec3 uSky; uniform vec3 uGround; uniform vec3 uSunDir; uniform vec3 uSunCol;
  uniform vec3 uLPos[12]; uniform vec3 uLCol[12]; uniform float uLRange[12]; uniform int uNumL;
  uniform vec3 uLedA; uniform vec3 uLedB; uniform vec3 uFog; uniform float uFogD; uniform float uExposure; uniform float uTime; uniform vec2 uRes; uniform float uVig; uniform float uClouds; uniform float uSunVis; uniform float uCatch; uniform float uToon;
  vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0.0, 1.0); }
  void main(){
    vec3 base = vCol;
    if (vMat.z > 2.5 && vMat.z < 3.5){
      vec3 dir = normalize(vPos - vec3(uCam.x, 0.0, uCam.z));
      if (dir.y > 0.0){
        vec2 cp = dir.xz / (dir.y + .12) * 1.4 + vec2(uTime*.006, uTime*.002);
        float cl = fbm(cp*1.6) * .65 + fbm(cp*4.3) * .35;
        float m = smoothstep(.48, .82, cl) * uClouds * smoothstep(.0, .22, dir.y);
        vec3 cc = mix(base*1.25 + vec3(.18), uSunCol*.35 + vec3(.55), .45 * uSunVis);
        base = mix(base, cc, m);
      }
      float sd = max(dot(dir, normalize(uSunDir)), 0.0);
      base += uSunCol * (pow(sd, 1400.0)*9.0 + pow(sd, 18.0)*.22) * uSunVis;
      gl_FragColor = vec4(pow(aces(base*uExposure), vec3(1.0/2.2)), 1.0); return; }
    if (vMat.z > 3.5 && vMat.z < 4.5){
      vec2 cell = floor(vPos.xz / .62); float h = fract(sin(dot(cell, vec2(12.9898,78.233))) * 43758.5453);
      float k = .5 + .5*sin(uTime*2.2 + h*6.283 + length(cell)*.6);
      vec3 led = mix(uLedA, uLedB, k) * (.35 + .9*k*k);
      vec2 f = fract(vPos.xz / .62); float edge = smoothstep(.0,.06,f.x)*smoothstep(.0,.06,f.y)*smoothstep(1.,.94,f.x)*smoothstep(1.,.94,f.y);
      gl_FragColor = vec4(pow(aces(led*1.25*edge + vec3(.02)), vec3(1.0/2.2)), 1.0); return;
    }
    if (vMat.z > 1.5 && vMat.z < 2.5){
      float g = .5 + .5*sin(vPos.x*1.3 + uTime*.9) * cos(vPos.y*2.1 - uTime*.6);
      base = mix(vec3(.02,.03,.07), vec3(.55,.4,.18), g*g) + vec3(.9,.8,.6)*smoothstep(.97,1.,sin(vPos.x*3.0 - uTime*2.0));
    }
    vec3 N = normalize(vNor); vec3 V = normalize(uCam - vPos);
    float spec = vMat.y; int k = int(vMat.z + .5);
    if (k == 5){ float n = fbm(vPos.xz*.35); base *= .62 + .6*n; base = mix(base, base*vec3(1.2,1.12,.65), smoothstep(.55,.85,n)*.45); base *= .8 + .35*noise(vPos.xz*38.0); spec = .03;
      if (uToon > .5){ base = mix(base*vec3(1.2,1.35,.75), vec3(.26,.52,.1) * (.8 + .5*n), .55); vec2 c2 = floor(vPos.xz*2.4); vec2 fp = fract(vPos.xz*2.4) - .5 - (vec2(hash(c2), hash(c2 + 7.0)) - .5)*.6;
        float fl = step(hash(c2 + 3.0), .16) * smoothstep(.13, .07, length(fp)); base = mix(base, hash(c2 + 5.0) > .45 ? vec3(1.0,.78,.18) : vec3(1.0,.97,.88), fl); } }
    else if (k == 6){ float row = floor(vPos.z/.18); float off = hash(vec2(row,3.1)); float gr = fbm(vec2(vPos.x*1.4 + off*40.0, vPos.z*34.0)); base *= .74 + .42*gr + .18*(hash(vec2(row, floor(vPos.x/2.2 + off))) - .5); float f = fract(vPos.z/.18); base *= .5 + .5*smoothstep(.0,.04,f)*smoothstep(1.0,.96,f); }
    else if (k == 7){ float w = fbm(vPos.xz*.55); float vein = 1.0 - smoothstep(.0, .05, abs(sin((vPos.x*.8+vPos.z)*1.2 + w*7.0))); base = mix(base, base*vec3(.72,.7,.68), vein*.65); base *= .93 + .12*noise(vPos.xz*2.5); }
    else if (k == 8){ base *= .86 + .18*noise(vPos.xz*16.0) + .07*sin(vPos.x*2.6 + fbm(vPos.xz*.4)*7.0); spec = .05; }
    else if (k == 9){ base *= .94 + .06*noise(vec2(atan(vPos.x, vPos.z)*80.0, vPos.y*60.0)); }
    else if (k == 10){ base *= .82 + .3*fbm(vPos.xz*1.1) + .05*noise(vPos.xz*28.0); }
    else if (k == 11){ vec2 t = vPos.xz/1.2; vec2 f = fract(t); float m = smoothstep(.0,.03,f.x)*smoothstep(1.0,.97,f.x)*smoothstep(.0,.03,f.y)*smoothstep(1.0,.97,f.y); base *= (.82 + .3*hash(floor(t))) * (.55 + .45*m) * (.9 + .15*fbm(vPos.xz*2.0)); }
    else if (k == 12){ base *= .88 + .12*noise(vPos.xz*70.0) + .1*fbm(vPos.xz*1.5); spec = .02; }
    float shin = 16.0 + spec*160.0;
    float sh = shadowF(N, uSunDir);
    if (k == 13){ gl_FragColor = vec4(0.0, 0.0, 0.0, clamp((1.0 - sh) * uCatch, 0.0, .75)); return; }
    vec3 col = base * mix(uGround, uSky, N.y*.5+.5) * mix(1.0 - uShadowAmb, 1.0, sh);
    float ndl = max(dot(N, uSunDir), 0.0);
    col += base * uSunCol * ndl * sh;
    col += uSunCol * pow(max(dot(N, normalize(uSunDir+V)), 0.0), shin) * spec * sh;
    vec3 R = reflect(-V, N); vec3 env = mix(uEnvBot, uEnvTop, clamp(R.y*.5+.5, 0.0, 1.0));
    float fres = .04 + .96*pow(1.0 - max(dot(N, V), 0.0), 5.0);
    col += env * fres * (k == 1 ? 1.4 : spec*spec*.7);
    if (uToon > .5){
      vec3 pb = base*.82 + .06;
      float lt = smoothstep(.12, .2, ndl) * .55 + smoothstep(.5, .58, ndl) * .45;
      float st = smoothstep(.3, .7, sh);
      vec3 amb = mix(uGround, uSky, .7 + .3*N.y);
      vec3 tint = mix(vec3(.72,.76,.98), vec3(1.0), st * (.35 + .65*lt));
      col = pb * amb * tint + pb * uSunCol * lt * st * .75;
      col += vec3(1.0) * smoothstep(.93, .97, dot(N, normalize(uSunDir + V))) * spec * .35;
      col += pb * pow(1.0 - max(dot(N, V), 0.0), 3.0) * .22 * (amb + uSunCol*.3);
      if (k == 1) col += env * fres * 1.2;
    }
    for (int i=0;i<12;i++){
      if (i >= uNumL) break;
      vec3 L = uLPos[i] - vPos; float d = length(L); L /= d;
      float att = clamp(1.0 - d/uLRange[i], 0.0, 1.0); att *= att;
      float pl = max(dot(N,L),0.0) * att; if (uToon > .5) pl = smoothstep(.04, .14, pl)*.55 + pl*.5;
      col += base * uLCol[i] * pl;
      col += uLCol[i] * pow(max(dot(N, normalize(L+V)),0.0), shin) * spec * att;
    }
    if (abs(N.y) < .6) col *= mix(.55, 1.0, smoothstep(0.0, .5, vPos.y));
    col += base * vMat.x;
    float fd = length(uCam - vPos); float f = 1.0 - exp(-pow(fd*uFogD*(uToon > .5 ? .6 : 1.0), 2.0));
    col = mix(col, uFog, f);
    col = aces(col * uExposure);
    vec2 q = gl_FragCoord.xy / uRes - .5; col *= 1.0 - dot(q,q)*.55*uVig;
    gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0);
  }`;
  const DVS = `precision highp float; attribute vec3 aPos; uniform mat4 uLightVP; uniform mat4 uModel; void main(){ gl_Position = uLightVP * uModel * vec4(aPos,1.0); }`;
  const DFS = `precision highp float; void main(){ vec4 e = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * gl_FragCoord.z); e -= e.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0); gl_FragColor = e; }`;
  const SVS = `precision highp float; attribute vec3 aPos; attribute float aA; uniform mat4 uVP; varying float vA; void main(){ vA = aA; gl_Position = uVP*vec4(aPos,1.0); }`;
  const SFS = `precision highp float; varying float vA; uniform float uShadow; void main(){ gl_FragColor = vec4(0.0,0.0,0.0, vA*vA*uShadow*1.8); }`;
  const GVS = `precision highp float; attribute vec3 aPos; attribute vec3 aCol; attribute vec4 aG;
  uniform mat4 uVP; uniform float uScale; uniform float uTime; varying vec3 vC;
  void main(){ vec4 p = uVP*vec4(aPos,1.0); gl_Position = p; float tw = 1.0 - aG.z*(.5+.5*sin(uTime*aG.w + aG.y)); vC = aCol*tw; gl_PointSize = clamp(aG.x*uScale/p.w, 1.0, 220.0); }`;
  const GFS = `precision highp float; varying vec3 vC; void main(){ vec2 d = gl_PointCoord - .5; float r = length(d)*2.0; if (r > 1.0) discard; float a = exp(-r*r*5.0)*.55 + smoothstep(.22, 0.0, r)*.9; gl_FragColor = vec4(vC*a, 1.0); }`;

  const PHOTO = `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uScale; void main(){ vec2 uv = (vUv - .5) * uScale + .5; gl_FragColor = vec4(texture2D(uTex, uv).rgb, 1.0); }`;
  const QVS = `precision highp float; attribute vec2 aP; varying vec2 vUv; void main(){ vUv = aP*.5 + .5; gl_Position = vec4(aP, 0.0, 1.0); }`;
  const BRIGHT = `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uTexel; uniform float uThr;
    void main(){ vec3 c = (texture2D(uTex, vUv + uTexel*vec2(-1.0,-1.0)).rgb + texture2D(uTex, vUv + uTexel*vec2(1.0,-1.0)).rgb + texture2D(uTex, vUv + uTexel*vec2(-1.0,1.0)).rgb + texture2D(uTex, vUv + uTexel*vec2(1.0,1.0)).rgb) * .25;
      float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(uThr, 1.0, l), 1.0); }`;
  const BLUR = `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir;
    void main(){ vec3 c = texture2D(uTex, vUv).rgb * .227027; c += (texture2D(uTex, vUv + uDir*1.3846).rgb + texture2D(uTex, vUv - uDir*1.3846).rgb) * .316216; c += (texture2D(uTex, vUv + uDir*3.2308).rgb + texture2D(uTex, vUv - uDir*3.2308).rgb) * .070270; gl_FragColor = vec4(c, 1.0); }`;
  const AO = `precision highp float; varying vec2 vUv; uniform sampler2D uDepth; uniform vec2 uTexel; uniform vec2 uProj; uniform vec2 uNF; uniform float uR;
    float lin(vec2 uv){ float d = texture2D(uDepth, uv).r; float z = d*2.0 - 1.0; return 2.0*uNF.x*uNF.y / (uNF.y + uNF.x - z*(uNF.y - uNF.x)); }
    vec3 pos(vec2 uv){ float z = lin(uv); return vec3((uv*2.0 - 1.0) * uProj * z, -z); }
    void main(){
      float d0 = texture2D(uDepth, vUv).r; if (d0 >= .99999) { gl_FragColor = vec4(1.0); return; }
      vec3 P = pos(vUv); vec3 N = normalize(cross(pos(vUv + vec2(uTexel.x, 0.0)) - P, pos(vUv + vec2(0.0, uTexel.y)) - P)); if (dot(N, -P) < 0.0) N = -N;
      float rad = uR / (-P.z * uProj.y * 2.0); float rot = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
      float occ = 0.0;
      for (int i=0;i<14;i++){ float a = (float(i) + .5) / 14.0; float ang = a*29.0 + rot; vec2 off = vec2(cos(ang), sin(ang)) * a * rad;
        vec3 v = pos(vUv + off) - P; float d2 = dot(v, v); float vn = dot(v, N) / sqrt(d2 + 1e-4);
        occ += max(0.0, vn - .12) * (1.0 - smoothstep(uR*uR*.4, uR*uR*2.2, d2)); }
      gl_FragColor = vec4(vec3(clamp(1.0 - occ/14.0*1.7, 0.0, 1.0)), 1.0); }`;
  const COMP = `precision highp float; varying vec2 vUv; uniform sampler2D uScene; uniform sampler2D uAO; uniform sampler2D uBloom; uniform sampler2D uDepth; uniform vec2 uST; uniform float uSS; uniform float uAOMix; uniform float uBloomK; uniform float uToon; uniform float uHasDepth; uniform vec2 uNF;
    float ld(vec2 uv){ float z = texture2D(uDepth, uv).r*2.0 - 1.0; return 2.0*uNF.x*uNF.y / (uNF.y + uNF.x - z*(uNF.y - uNF.x)); }
    float h2(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f); return mix(mix(h2(i), h2(i + vec2(1.0,0.0)), f.x), mix(h2(i + vec2(0.0,1.0)), h2(i + vec2(1.0,1.0)), f.x), f.y); }
    void main(){
      vec3 c; if (uSS > 1.2){ vec2 o = uST * .25 * uSS; c = (texture2D(uScene, vUv + vec2(-o.x,-o.y)).rgb + texture2D(uScene, vUv + vec2(o.x,-o.y)).rgb + texture2D(uScene, vUv + vec2(-o.x,o.y)).rgb + texture2D(uScene, vUv + vec2(o.x,o.y)).rgb) * .25; } else c = texture2D(uScene, vUv).rgb;
      float ao = texture2D(uAO, vUv).r; c *= mix(1.0, ao, uAOMix);
      c += texture2D(uBloom, vUv).rgb * uBloomK;
      if (uToon > .5){
        if (uHasDepth > .5){ vec2 o = uST * max(1.0, uSS) * 1.1; float d0 = ld(vUv); float e = max(max(abs(ld(vUv + vec2(o.x,0.0)) - d0), abs(ld(vUv - vec2(o.x,0.0)) - d0)), max(abs(ld(vUv + vec2(0.0,o.y)) - d0), abs(ld(vUv - vec2(0.0,o.y)) - d0))) / max(d0, .5);
          float edge = smoothstep(.025, .07, e) * (1.0 - smoothstep(60.0, 140.0, d0)); c = mix(c, c * vec3(.42, .34, .32), edge * .7); }
        float l0 = dot(c, vec3(.2126, .7152, .0722)); c = mix(vec3(l0), c, 1.12); c = c*.9 + .07;
        c *= .965 + .05 * n2(gl_FragCoord.xy * .23) + .02 * n2(gl_FragCoord.xy * 1.7);
      }
      float l = dot(c, vec3(.2126, .7152, .0722)); c = mix(vec3(l), c, 1.1); c = clamp(c, 0.0, 1.0); c = mix(c, c*c*(3.0 - 2.0*c), uToon > .5 ? .12 : .3);
      vec2 q = vUv - .5; c *= 1.0 - dot(q,q)*.6;
      c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.0;
      gl_FragColor = vec4(c, 1.0); }`;
  function program(gl, vs, fs){
    const mk = (t,s) => { const sh = gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER,vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i=0;i<n;i++){ const info = gl.getActiveUniform(p,i); const name = info.name.replace('[0]',''); u[name] = gl.getUniformLocation(p, info.name); }
    const a = {}, m = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (let i=0;i<m;i++){ const info = gl.getActiveAttrib(p,i); a[info.name] = gl.getAttribLocation(p, info.name); }
    return { p, u, a };
  }

  /* ---------- renderer ---------- */
  class Renderer {
    constructor(canvas, { preserve=false } = {}){
      this.canvas = canvas;
      const opts = { antialias:true, alpha:false, preserveDrawingBuffer:preserve, powerPreference:'high-performance' };
      const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
      if (!gl) throw new Error('WebGL unavailable');
      this.gl = gl; this.main = program(gl, VS, FS); this.shad = program(gl, SVS, SFS); this.glw = program(gl, GVS, GFS); this.depth = program(gl, DVS, DFS);
      const big = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096), mobile = matchMedia('(max-width: 760px)').matches;
      this.smSize = Math.min(big, mobile ? 2048 : 3072);
      this.smTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.smSize, this.smSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
      this.smRb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, this.smRb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.smSize, this.smSize);
      this.smFb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.smTex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.smRb);
      this.smOk = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      try {
        this.dext = gl.getExtension('WEBGL_depth_texture');
        this.pPhoto = program(gl, QVS, PHOTO); this.pBright = program(gl, QVS, BRIGHT); this.pBlur = program(gl, QVS, BLUR); this.pComp = program(gl, QVS, COMP); this.pAO = this.dext ? program(gl, QVS, AO) : null;
        this.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
        this.white = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.white); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
        this.postOk = true;
      } catch(e){ console.warn('Post-processing off', e); this.postOk = false; }
      const dpr = window.devicePixelRatio || 1; this.maxSS = mobile ? 1.25 : dpr >= 2 ? 1.25 : dpr >= 1.5 ? 1.5 : 2; this.ss = preserve ? Math.max(1.5, this.maxSS) : this.maxSS; this.avg = 16; this.coolT = 0;
      this.bufs = []; this.scene = null;
    }
    _tex(w, h, linear=true){ const gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const f = linear ? gl.LINEAR : gl.NEAREST; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
    _target(w, h, depth=false){
      const gl = this.gl, fb = gl.createFramebuffer(), tex = this._tex(w, h); let dt = null, rb = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (depth){ if (this.dext){ dt = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, dt); gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
          [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, dt, 0); }
        else { rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb); } }
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { fb, tex, dt, rb, w, h, ok };
    }
    _free(t){ if (!t) return; const gl = this.gl; gl.deleteFramebuffer(t.fb); gl.deleteTexture(t.tex); t.dt && gl.deleteTexture(t.dt); t.rb && gl.deleteRenderbuffer(t.rb); }
    _targets(w, h){
      const gl = this.gl, mx = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
      const k = Math.min(this.ss, mx / Math.max(w, h)), W2 = Math.max(2, Math.round(w*k)), H2 = Math.max(2, Math.round(h*k));
      const p = this.pt; if (p && p.W === W2 && p.H === H2 && p.w === w && p.h === h) return p;
      if (p) ['scene','ao1','ao2','b1','b2'].forEach(n => this._free(p[n]));
      const hw = Math.max(2, Math.round(w/2)), hh = Math.max(2, Math.round(h/2)), qw = Math.max(2, Math.round(w/4)), qh = Math.max(2, Math.round(h/4));
      this.pt = { W:W2, H:H2, w, h, k, scene:this._target(W2, H2, true), ao1:this.pAO ? this._target(hw, hh) : null, ao2:this.pAO ? this._target(hw, hh) : null, b1:this._target(qw, qh), b2:this._target(qw, qh) };
      if (!this.pt.scene.ok){ this.postOk = false; }
      return this.pt;
    }
    setPhoto(img){ const gl = this.gl; if (!this.photoTex) this.photoTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.photoTex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE)); this.photoAR = img.width / img.height; }
    adapt(ms){ if (!ms || ms > 500) return; this.avg = this.avg*.92 + ms*.08; const now = performance.now(); if (now < this.coolT) return;
      if (this.avg > 40 && this.ss > .75){ this.ss = Math.max(.75, this.ss - .25); this.coolT = now + 1500; }
      else if (this.avg < 19 && this.ss < this.maxSS){ this.ss = Math.min(this.maxSS, this.ss + .25); this.coolT = now + 2500; } }
    _q(P){ const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); gl.enableVertexAttribArray(P.a.aP); gl.vertexAttribPointer(P.a.aP, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.disableVertexAttribArray(P.a.aP); }
    _bindT(unit, tex, loc){ const gl = this.gl; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unit); }
    _post(w, h, cam, def){
      const gl = this.gl, pt = this.pt; gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.depthMask(false);
      // bloom
      gl.bindFramebuffer(gl.FRAMEBUFFER, pt.b1.fb); gl.viewport(0, 0, pt.b1.w, pt.b1.h); let P = this.pBright; gl.useProgram(P.p);
      this._bindT(0, pt.scene.tex, P.u.uTex); gl.uniform2f(P.u.uTexel, (pt.W/pt.b1.w)*.5/pt.W, (pt.H/pt.b1.h)*.5/pt.H); gl.uniform1f(P.u.uThr, def.bloomThr ?? .9); this._q(P);
      P = this.pBlur; gl.useProgram(P.p);
      [[1,0],[0,1],[2,0],[0,2]].forEach(([dx,dy], i) => { const src = i % 2 ? pt.b2 : pt.b1, dst = i % 2 ? pt.b1 : pt.b2; gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb); this._bindT(0, src.tex, P.u.uTex); gl.uniform2f(P.u.uDir, dx/src.w, dy/src.h); this._q(P); });
      // ambient occlusion
      let aoTex = this.white;
      if (this.pAO && pt.scene.dt && def.ao !== false){
        P = this.pAO; gl.useProgram(P.p); gl.bindFramebuffer(gl.FRAMEBUFFER, pt.ao1.fb); gl.viewport(0, 0, pt.ao1.w, pt.ao1.h);
        this._bindT(0, pt.scene.dt, P.u.uDepth); const th = Math.tan((cam.fov || .78)/2); gl.uniform2f(P.u.uProj, th * w/h, th); gl.uniform2f(P.u.uNF, .1, 400); gl.uniform2f(P.u.uTexel, 1.5/pt.W, 1.5/pt.H); gl.uniform1f(P.u.uR, def.aoR ?? .55); this._q(P);
        P = this.pBlur; gl.useProgram(P.p); gl.bindFramebuffer(gl.FRAMEBUFFER, pt.ao2.fb); this._bindT(0, pt.ao1.tex, P.u.uTex); gl.uniform2f(P.u.uDir, 1/pt.ao1.w, 0); this._q(P);
        gl.bindFramebuffer(gl.FRAMEBUFFER, pt.ao1.fb); this._bindT(0, pt.ao2.tex, P.u.uTex); gl.uniform2f(P.u.uDir, 0, 1/pt.ao1.h); this._q(P); aoTex = pt.ao1.tex; }
      // composite to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h); P = this.pComp; gl.useProgram(P.p);
      this._bindT(0, pt.scene.tex, P.u.uScene); this._bindT(1, aoTex, P.u.uAO); this._bindT(2, pt.b1.tex, P.u.uBloom); this._bindT(3, pt.scene.dt || this.white, P.u.uDepth);
      const toon = GL3D.style === 'illustrated' ? 1 : 0; gl.uniform1f(P.u.uToon, toon); gl.uniform1f(P.u.uHasDepth, pt.scene.dt ? 1 : 0); gl.uniform2f(P.u.uNF, .1, 400);
      gl.uniform2f(P.u.uST, 1/pt.W, 1/pt.H); gl.uniform1f(P.u.uSS, pt.k); gl.uniform1f(P.u.uAOMix, (def.aoMix ?? .85) * (toon ? .55 : 1)); gl.uniform1f(P.u.uBloomK, (def.bloom ?? .5) * (toon ? 1.3 : 1)); this._q(P);
      gl.activeTexture(gl.TEXTURE0); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
    }
    _buf(data){ const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); this.bufs.push(b); return b; }
    _mesh(g){ return { count:g.p.length/3, pos:this._buf(g.p), nor:this._buf(g.n), col:this._buf(g.c), mat:this._buf(g.m) }; }
    dispose(){ const gl = this.gl; this.bufs.forEach(b => gl.deleteBuffer(b)); this.bufs = []; this.scene = null; }
    load(def){
      this.dispose();
      const g = new Geo(), sc = { lights:[], dyn:[], def };
      sc.addLight = (p, col, i, range, flicker=0) => sc.lights.push({ p, c:hexD(col), i, range, flicker, ph:Math.random()*9 });
      const pending = []; sc.dynamic = (build, update, opts={}) => { const dg = new Geo(); build(dg); pending.push({ g:dg, update, opts }); };
      def.build(g, sc);
      // sky dome
      const sky = new Geo(), top = hex(def.sky[0]), bot = hex(def.sky[1]), seg = 24, rings = 12, R = 160;
      for (let j=0;j<rings;j++) for (let i=0;i<seg;i++){ const P = (i,j) => { const th = j/rings*Math.PI, ph = i/seg*Math.PI*2; return [Math.sin(th)*Math.cos(ph)*R, Math.cos(th)*R*.6, Math.sin(th)*Math.sin(ph)*R]; };
        const C = p => { const k = Math.min(1, Math.max(0, (p[1]/(R*.6)+.15)/1.0)); return [bot[0]+(top[0]-bot[0])*k, bot[1]+(top[1]-bot[1])*k, bot[2]+(top[2]-bot[2])*k]; };
        [P(i,j),P(i+1,j),P(i+1,j+1),P(i,j),P(i+1,j+1),P(i,j+1)].forEach(p => { sky.p.push(...p); sky.n.push(0,1,0); sky.c.push(...C(p)); sky.m.push(0,0,3); }); }
      sc.sky = this._mesh(sky);
      sc.stat = this._mesh(g);
      this.scene = sc; pending.forEach(p => this.addDyn(p.g, p.update, p.opts));
      sc.shadows = g.sp.length ? { n:g.sp.length/3, p:this._buf(g.sp), a:this._buf(g.sa) } : null;
      sc.glows = g.gp.length ? { n:g.gp.length/3, p:this._buf(g.gp), c:this._buf(g.gc), g:this._buf(g.gg) } : null;
      this.scene = sc; return sc;
    }
    addDyn(g, update, opts={}){
      const own = [], B = data => { const b = this._buf(data); own.push(b); return b; };
      const d = { update, opts, own, mesh:{ count:g.p.length/3, pos:B(g.p), nor:B(g.n), col:B(g.c), mat:B(g.m) } };
      if (g.gp.length) d.glow = { n:g.gp.length/3, p:B(g.gp), c:B(g.gc), g:B(g.gg) };
      if (g.sp.length) d.shadow = { n:g.sp.length/3, p:B(g.sp), a:B(g.sa) };
      this.scene.dyn.push(d); return d;
    }
    removeDyn(d){ if (!d) return; const gl = this.gl; d.own.forEach(b => gl.deleteBuffer(b)); this.bufs = this.bufs.filter(b => !d.own.includes(b)); const i = this.scene ? this.scene.dyn.indexOf(d) : -1; if (i >= 0) this.scene.dyn.splice(i,1); }
    _attr(loc, buf, size){ const gl = this.gl; if (loc < 0 || loc == null) return; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); }
    _drawMesh(m, model){
      const gl = this.gl, P = this.main; gl.uniformMatrix4fv(P.u.uModel, false, model);
      this._attr(P.a.aPos, m.pos, 3); this._attr(P.a.aNor, m.nor, 3); this._attr(P.a.aCol, m.col, 3); this._attr(P.a.aMat, m.mat, 3);
      gl.drawArrays(gl.TRIANGLES, 0, m.count);
    }
    _drawGlow(G, VP, scale, t, model){
      const gl = this.gl, P = this.glw; gl.useProgram(P.p);
      gl.uniformMatrix4fv(P.u.uVP, false, model ? mul4(VP, model) : VP); gl.uniform1f(P.u.uScale, scale); gl.uniform1f(P.u.uTime, t);
      this._attr(P.a.aPos, G.p, 3); this._attr(P.a.aCol, G.c, 3); this._attr(P.a.aG, G.g, 4); gl.drawArrays(gl.POINTS, 0, G.n);
    }
    render(t, cam){
      const gl = this.gl, sc = this.scene; if (!sc) return; const def = sc.def;
      const cw = this.canvas.width, ch = this.canvas.height;
      const post = this.postOk && def.post !== false ? this._targets(cw, ch) : null, usePost = post && this.postOk;
      const w = usePost ? post.W : cw, h = usePost ? post.H : ch, target = usePost ? post.scene.fb : null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target); gl.viewport(0,0,w,h);
      const fog = hex(def.fog); gl.clearColor(...fog.map(v => Math.pow(v,1/2.2)), 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.depthMask(true); gl.disable(gl.BLEND);
      const VP = mul4(persp(cam.fov || .78, w/h, .1, 400), lookAt(cam.eye, cam.target, [0,1,0]));
      // shadow map from the key light
      const sb = def.shadowBox || { cx:0, cz:0, half:14 }, sd = norm(def.sun.dir), hf = sb.half;
      const lctr = [sb.cx, 0, sb.cz], le = [lctr[0] + sd[0]*80, sd[1]*80, lctr[2] + sd[2]*80], up = Math.abs(sd[1]) > .95 ? [0,0,-1] : [0,1,0];
      const ortho = [1/hf,0,0,0, 0,1/hf,0,0, 0,0,-2/(160),0, 0,0,-(160+1)/(160-1),1];
      const LVP = mul4(ortho, lookAt(le, lctr, up));
      const useSh = this.smOk && def.shadows !== false;
      if (useSh){ const Dp = this.depth; gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFb); gl.viewport(0,0,this.smSize,this.smSize); gl.clearColor(1,1,1,1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(Dp.p); gl.uniformMatrix4fv(Dp.u.uLightVP, false, LVP);
        const dm = (m, model) => { gl.uniformMatrix4fv(Dp.u.uModel, false, model); this._attr(Dp.a.aPos, m.pos, 3); gl.drawArrays(gl.TRIANGLES, 0, m.count); };
        dm(sc.stat, mat4(ID)); sc.dyn.forEach(d => { if (d.opts.additive || d.opts.noShadow) return; const m = d.update(t, cam); d._m = m; d._done = true; if (m && d.mesh.count) dm(d.mesh, m); });
        gl.bindFramebuffer(gl.FRAMEBUFFER, target); gl.viewport(0,0,w,h); gl.clearColor(...fog.map(v => Math.pow(v,1/2.2)), 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); }
      if (def.photo && this.photoTex && this.pPhoto){ const Q = this.pPhoto; gl.useProgram(Q.p); gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
        const A = w / h, I = this.photoAR || 1; gl.uniform2f(Q.u.uScale, A > I ? 1 : A / I, A > I ? I / A : 1); this._bindT(0, this.photoTex, Q.u.uTex); this._q(Q); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); }
      const P = this.main; gl.useProgram(P.p); gl.uniform1f(P.u.uCatch, def.catchK ?? .55); gl.uniform1f(P.u.uToon, GL3D.style === 'illustrated' ? 1 : 0);
      gl.uniform1f(P.u.uVig, usePost ? 0 : 1); gl.uniform1f(P.u.uClouds, def.clouds ?? (def.sun.i > .5 ? .75 : .1)); gl.uniform1f(P.u.uSunVis, def.sunVis ?? (def.sun.i > .5 ? 1 : 0));
      gl.uniformMatrix4fv(P.u.uLightVP, false, LVP); gl.uniform1f(P.u.uShadowOn, useSh ? 1 : 0); gl.uniform1f(P.u.uShadowTexel, 1.6/this.smSize); gl.uniform1f(P.u.uShadowAmb, def.shadowAmb ?? .42);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.uniform1i(P.u.uShadowMap, 0);
      const st = hex(def.sky[0]), sbt = hex(def.sky[1]); gl.uniform3fv(P.u.uEnvTop, def.envTop || st.map(v => v*1.2)); gl.uniform3fv(P.u.uEnvBot, def.envBot || sbt.map(v => v*1.1));
      gl.uniformMatrix4fv(P.u.uVP, false, VP); gl.uniform1f(P.u.uTime, t); gl.uniform3fv(P.u.uCam, cam.eye); gl.uniform2f(P.u.uRes, w, h);
      gl.uniform3fv(P.u.uSky, hexD(def.hemi[0], def.hemi[2])); gl.uniform3fv(P.u.uGround, hexD(def.hemi[1], def.hemi[2]));
      gl.uniform3fv(P.u.uSunDir, norm(def.sun.dir)); gl.uniform3fv(P.u.uSunCol, hexD(def.sun.col, def.sun.i));
      gl.uniform3fv(P.u.uLedA, def.ledA || [1,.55,.25]); gl.uniform3fv(P.u.uLedB, def.ledB || [.95,.75,.9]);
      gl.uniform3fv(P.u.uFog, fog); gl.uniform1f(P.u.uFogD, def.fogD || .02); gl.uniform1f(P.u.uExposure, def.exposure || 1);
      const L = sc.lights.slice(0,12), lp = [], lc = [], lr = [];
      L.forEach(l => { const f = l.flicker ? (1 - l.flicker*(.5+.5*Math.sin(t*9+l.ph)*Math.sin(t*5.3+l.ph*2))) : 1; lp.push(...l.p); lc.push(...l.c.map(v => v*l.i*f)); lr.push(l.range); });
      while (lp.length < 36){ lp.push(0,0,0); lc.push(0,0,0); lr.push(1); }
      gl.uniform3fv(P.u.uLPos, lp); gl.uniform3fv(P.u.uLCol, lc); gl.uniform1fv(P.u.uLRange, lr); gl.uniform1i(P.u.uNumL, L.length);
      const I = mat4(ID);
      if (!def.photo){ gl.depthMask(false); this._drawMesh(sc.sky, mat4({ M:[1,0,0,0,1,0,0,0,1], t:[cam.eye[0], 0, cam.eye[2]] })); gl.depthMask(true); }
      this._drawMesh(sc.stat, I);
      const additive = [];
      const catchers = [];
      sc.dyn.forEach(d => { const m = d._done ? d._m : d.update(t, cam); d._m = m; d._done = false; if (!m) return; if (d.opts.additive) additive.push(d); else if (d.opts.catcher) catchers.push(d); else this._drawMesh(d.mesh, m); });
      gl.enable(gl.BLEND); gl.depthMask(false);
      if (sc.shadows){ const S = this.shad; gl.useProgram(S.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.uniformMatrix4fv(S.u.uVP, false, VP); gl.uniform1f(S.u.uShadow, def.shadow ?? .55);
        gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1,-1); this._attr(S.a.aPos, sc.shadows.p, 3); this._attr(S.a.aA, sc.shadows.a, 1); gl.drawArrays(gl.TRIANGLES, 0, sc.shadows.n); gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.disableVertexAttribArray(S.a.aA); }
      const dsh = sc.dyn.filter(d => d.shadow && d._m);
      if (dsh.length){ const S = this.shad; gl.useProgram(S.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(S.u.uShadow, def.shadow ?? .55); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1,-1);
        dsh.forEach(d => { gl.uniformMatrix4fv(S.u.uVP, false, mul4(VP, d._m)); this._attr(S.a.aPos, d.shadow.p, 3); this._attr(S.a.aA, d.shadow.a, 1); gl.drawArrays(gl.TRIANGLES, 0, d.shadow.n); });
        gl.disable(gl.POLYGON_OFFSET_FILL); gl.disableVertexAttribArray(S.a.aA); }
      if (catchers.length){ gl.useProgram(P.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); catchers.forEach(d => this._drawMesh(d.mesh, d._m)); }
      gl.blendFunc(gl.ONE, gl.ONE);
      if (additive.length){ gl.useProgram(P.p); additive.forEach(d => this._drawMesh(d.mesh, d._m)); }
      const scale = h * 0.9;
      if (sc.glows) this._drawGlow(sc.glows, VP, scale, t);
      sc.dyn.forEach(d => { if (d.glow && d._m) this._drawGlow(d.glow, VP, scale, t, d._m); });
      [P,this.shad,this.glw,this.depth].forEach(pr => Object.values(pr.a).forEach(l => l >= 0 && gl.disableVertexAttribArray(l)));
      gl.depthMask(true); gl.disable(gl.BLEND);
      if (usePost) this._post(cw, ch, cam, def);
    }
  }

  /* ---------- live viewer: orbit camera, autoplay, drag ---------- */
  class Viewer {
    constructor(canvas){
      this.canvas = canvas; this.r = new Renderer(canvas); this.t0 = performance.now(); this.drag = null; this.userTheta = 0; this.userPhi = 0; this.idleUntil = 0; this.visible = true; this.raf = 0;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ro = new ResizeObserver(() => this.resize()); ro.observe(canvas); this.ro = ro;
      const io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }); io.observe(canvas); this.io = io;
      canvas.addEventListener('pointerdown', e => { this.drag = { x:e.clientX, y:e.clientY, th:this.userTheta, ph:this.userPhi }; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener('pointermove', e => { if (!this.drag) return; this.userTheta = this.drag.th - (e.clientX - this.drag.x) * .008; this.userPhi = Math.max(-.35, Math.min(.35, this.drag.ph + (e.clientY - this.drag.y) * .004)); this.idleUntil = performance.now() + 3500; });
      const end = () => { this.drag = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
      canvas.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') this.userTheta -= .2; if (e.key === 'ArrowRight') this.userTheta += .2; this.idleUntil = performance.now() + 3500; });
      this.lost = false; canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; });
    }
    resize(){ const dpr = Math.min(window.devicePixelRatio || 1, 3), r = this.canvas.getBoundingClientRect(); const w = Math.max(2, Math.round(r.width*dpr)), h = Math.max(2, Math.round(r.height*dpr)); if (this.canvas.width !== w || this.canvas.height !== h){ this.canvas.width = w; this.canvas.height = h; } this.frame(); }
    load(def){ this.def = def; this.r.load(def); this.auto = 0; this.last = performance.now(); this.frame(); }
    camera(t){
      const c = this.def.cam, now = performance.now(), dt = Math.min(.05, (now - (this.last||now))/1000); this.last = now;
      if (!this.reduced && now > this.idleUntil && !this.drag) this.auto += dt * (c.speed ?? .1);
      const th = c.theta + this.auto + this.userTheta, ph = c.phi + this.userPhi, R = c.r;
      const tg = c.target, eye = [tg[0] + Math.cos(th)*Math.cos(ph)*R, tg[1] + Math.sin(ph)*R, tg[2] + Math.sin(th)*Math.cos(ph)*R];
      return { eye, target:tg, fov:c.fov };
    }
    frame(){ if (!this.def || this.lost) return; const now = performance.now(), t = (now - this.t0)/1000; if (this._lf) this.r.adapt(now - this._lf); this._lf = now; this.r.render(this.reduced ? 2 : t, this.camera(t)); }
    loop(){ cancelAnimationFrame(this.raf); const step = () => { if (!this.visible || document.hidden || !this.canvas.isConnected){ return; } this.frame(); this.raf = requestAnimationFrame(step); }; this.raf = requestAnimationFrame(step); }
    destroy(){ cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect(); this.r.dispose(); const ext = this.r.gl.getExtension('WEBGL_lose_context'); ext && ext.loseContext(); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) GL3D._viewers.forEach(v => v.visible && v.loop()); });

  /* ---------- snapshots (one shared context for thumbnails) ---------- */
  let snapR = null;
  function snapshot(def, w=880, h=560){
    if (!snapR){ const c = document.createElement('canvas'); snapR = new Renderer(c, { preserve:true }); }
    snapR.canvas.width = w; snapR.canvas.height = h; snapR.load(def);
    const c = def.cam, th = c.theta + (c.snapTheta || 0), ph = c.phi, tg = c.target;
    snapR.render(3.2, { eye:[tg[0]+Math.cos(th)*Math.cos(ph)*c.r, tg[1]+Math.sin(ph)*c.r, tg[2]+Math.sin(th)*Math.cos(ph)*c.r], target:tg, fov:c.fov });
    const url = snapR.canvas.toDataURL('image/jpeg', .86); snapR.dispose(); return url;
  }
  function supported(){ try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch(e){ return false; } }
  let style = 'illustrated'; try { style = localStorage.getItem('ma3ak:style') || 'illustrated'; } catch(e){}
  return { style, Geo, T, Renderer, Viewer, snapshot, supported, hex, hexD, mat4, mul4, persp, lookAt, norm, sub, cross, _viewers:new Set() };
})();
