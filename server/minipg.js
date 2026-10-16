// Minimal PostgreSQL client (wire protocol v3) with the same interface as `pg` (Pool, query, connect/release).
// Used only for local development and tests when the `pg` package isn't installed.
// Production on Netlify uses @netlify/database (official driver).
import net from 'node:net';
import crypto from 'node:crypto';

const PARSE = { 16: v => v === 't', 21: Number, 23: Number, 26: Number, 700: Number, 701: Number, 114: JSON.parse, 3802: JSON.parse };

class Conn {
  constructor(cfg) { this.cfg = cfg; this.buf = Buffer.alloc(0); this.queue = Promise.resolve(); this.waiters = []; }
  connect() {
    return new Promise((resolve, reject) => {
      const s = this.sock = net.connect(this.cfg.port, this.cfg.host); s.setNoDelay(true);
      s.on('data', d => { this.buf = Buffer.concat([this.buf, d]); this.pump(); });
      s.on('error', e => { this.dead = e; this.waiters.splice(0).forEach(w => w.reject(e)); reject(e); });
      s.on('connect', async () => {
        try {
          const p = []; for (const [k, v] of [['user', this.cfg.user], ['database', this.cfg.database], ['client_encoding', 'UTF8']]) p.push(k, '\0', v, '\0');
          const body = Buffer.concat([int32(196608), Buffer.from(p.join('') + '\0')]);
          s.write(Buffer.concat([int32(body.length + 4), body]));
          await this.auth(); resolve(this);
        } catch (e) { reject(e); }
      });
    });
  }
  // message reader
  pump() {
    while (this.buf.length >= 5) {
      const len = this.buf.readInt32BE(1); if (this.buf.length < len + 1) return;
      const msg = { type: String.fromCharCode(this.buf[0]), body: this.buf.subarray(5, len + 1) }; this.buf = this.buf.subarray(len + 1);
      const w = this.waiters[0]; if (w) w.onMsg(msg);
    }
  }
  read(handler) { return new Promise((resolve, reject) => { const w = { onMsg: m => { try { const r = handler(m); if (r !== undefined) { this.waiters.shift(); resolve(r); } } catch (e) { this.waiters.shift(); reject(e); } }, reject }; this.waiters.push(w); }); }
  // Messages are collected and written in one go (avoids Nagle/delayed-ACK stalls on small packets).
  msg(type, body) { return Buffer.concat([Buffer.from(type), int32(body.length + 4), body]); }
  send(type, body) { this.sock.write(this.msg(type, body)); }
  async auth() {
    let scram = null;
    await this.read(m => {
      if (m.type === 'E') throw pgError(m.body);
      if (m.type === 'R') {
        const code = m.body.readInt32BE(0);
        if (code === 3) this.send('p', cstr(this.cfg.password || ''));
        else if (code === 5) { const salt = m.body.subarray(4, 8); const inner = md5(String(this.cfg.password) + this.cfg.user); this.send('p', cstr('md5' + md5(Buffer.concat([Buffer.from(inner), salt])))); }
        else if (code === 10) { scram = { nonce: crypto.randomBytes(18).toString('base64') }; scram.first = `n=*,r=${scram.nonce}`; const msg = Buffer.from('n,,' + scram.first); this.send('p', Buffer.concat([cstr('SCRAM-SHA-256'), int32(msg.length), msg])); }
        else if (code === 11) { const s = Object.fromEntries(m.body.subarray(4).toString().split(',').map(x => [x[0], x.slice(2)])); const salted = crypto.pbkdf2Sync(String(this.cfg.password).normalize(), Buffer.from(s.s, 'base64'), +s.i, 32, 'sha256');
          const ck = hmac(salted, 'Client Key'), sk = crypto.createHash('sha256').update(ck).digest(), without = `c=biws,r=${s.r}`, am = `${scram.first},${m.body.subarray(4).toString()},${without}`;
          const sig = hmac(sk, am), proof = Buffer.from(ck.map((b, i) => b ^ sig[i])); this.send('p', Buffer.from(`${without},p=${proof.toString('base64')}`)); }
      }
      if (m.type === 'Z') return true;
    });
  }
  query(text, values) { const run = this.queue.then(() => this.run(text, values)); this.queue = run.catch(() => {}); return run; }
  async run(text, values) {
    if (this.dead) throw this.dead;
    let fields = [], rows = [], rowCount = 0, err = null;
    if (!values || !values.length) this.send('Q', cstr(text));
    else {
      const params = values.map(v => v == null ? null : Buffer.from(v instanceof Date ? v.toISOString() : String(v)));
      this.sock.write(Buffer.concat([
        this.msg('P', Buffer.concat([cstr(''), cstr(text), int16(0)])),
        this.msg('B', Buffer.concat([cstr(''), cstr(''), int16(0), int16(params.length), ...params.map(p => p === null ? int32(-1) : Buffer.concat([int32(p.length), p])), int16(0)])),
        this.msg('D', Buffer.concat([Buffer.from('P'), cstr('')])), this.msg('E', Buffer.concat([cstr(''), int32(0)])), this.msg('S', Buffer.alloc(0))]));
    }
    await this.read(m => {
      if (m.type === 'T') { const n = m.body.readInt16BE(0); fields = []; let o = 2; for (let i = 0; i < n; i++) { const e = m.body.indexOf(0, o); const name = m.body.toString('utf8', o, e); o = e + 1; const oid = m.body.readInt32BE(o + 6); o += 18; fields.push({ name, dataTypeID: oid }); } rows = []; }
      else if (m.type === 'D') { const n = m.body.readInt16BE(0); let o = 2; const row = {}; for (let i = 0; i < n; i++) { const len = m.body.readInt32BE(o); o += 4; let v = null; if (len >= 0) { v = m.body.toString('utf8', o, o + len); o += len; const p = PARSE[fields[i].dataTypeID]; if (p) v = p(v); } row[fields[i].name] = v; } rows.push(row); }
      else if (m.type === 'C') { const tag = m.body.toString('utf8', 0, m.body.length - 1).split(' '); rowCount = Number(tag[tag.length - 1]) || 0; }
      else if (m.type === 'E') err = err || pgError(m.body);
      else if (m.type === 'Z') return true;
    });
    if (err) throw err;
    return { rows, rowCount, fields };
  }
  end() { try { this.send('X', Buffer.alloc(0)); this.sock.end(); } catch {} }
}

export class Pool {
  constructor({ connectionString, max = 8 } = {}) {
    const u = new URL(connectionString);
    this.cfg = { host: u.hostname || '127.0.0.1', port: Number(u.port) || 5432, user: decodeURIComponent(u.username || 'postgres'), password: decodeURIComponent(u.password || ''), database: decodeURIComponent(u.pathname.slice(1) || u.username || 'postgres') };
    this.max = max; this.idle = []; this.count = 0; this.waiting = [];
  }
  async connect() {
    const c = this.idle.pop(); if (c && !c.dead) return this.wrap(c);
    if (this.count < this.max) { this.count++; try { return this.wrap(await new Conn(this.cfg).connect()); } catch (e) { this.count--; throw e; } }
    return new Promise(r => this.waiting.push(r));
  }
  wrap(c) { return { query: (t, v) => c.query(t, v), release: () => { if (c.dead) { this.count--; return; } const w = this.waiting.shift(); if (w) w(this.wrap(c)); else this.idle.push(c); } }; }
  async query(text, values) { const c = await this.connect(); try { return await c.query(text, values); } finally { c.release(); } }
  async end() { this.idle.splice(0).forEach(c => c.end()); }
}

const int32 = n => { const b = Buffer.alloc(4); b.writeInt32BE(n); return b; };
const int16 = n => { const b = Buffer.alloc(2); b.writeInt16BE(n); return b; };
const cstr = s => Buffer.from(s + '\0');
const md5 = s => crypto.createHash('md5').update(s).digest('hex');
const hmac = (k, s) => crypto.createHmac('sha256', k).update(s).digest();
function pgError(body) { const f = {}; let o = 0; while (o < body.length && body[o] !== 0) { const t = String.fromCharCode(body[o]); const e = body.indexOf(0, o + 1); f[t] = body.toString('utf8', o + 1, e); o = e + 1; } return Object.assign(new Error(f.M || 'Postgres error'), { code: f.C, detail: f.D, severity: f.S }); }
