// Netlify Function that serves the whole MA3AK API (/api/* and /auth/*).
// It adapts the web Request/Response to the Node-style req/res the router uses, so the same code
// runs locally (server/index.js) and on Netlify. Database: Netlify Database (Postgres). Files: Netlify Blobs.
import { Readable } from 'node:stream';
import { getApp } from '../../server/app.js';

class NodeResponse {
  constructor() { this.statusCode = 200; this.headers = new Headers(); this.chunks = []; this.headersSent = false; this.finished = new Promise(r => { this._done = r; }); }
  setHeader(k, v) { this.headers.delete(k); for (const x of [].concat(v)) this.headers.append(k, String(x)); }
  getHeader(k) { return this.headers.get(k); }
  removeHeader(k) { this.headers.delete(k); }
  writeHead(status, h = {}) { this.statusCode = status; for (const [k, v] of Object.entries(h)) this.setHeader(k, v); this.headersSent = true; return this; }
  write(c) { if (c != null) this.chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)); this.headersSent = true; return true; }
  end(c) { if (c != null) this.write(c); this.headersSent = true; this._done(); return this; }
  toResponse() { this.headers.delete('content-length'); const body = this.chunks.length ? Buffer.concat(this.chunks) : null; return new Response(body, { status: this.statusCode, headers: this.headers }); }
}

export default async (request, context) => {
  let app;
  try { app = await getApp(); }
  catch (e) {
    console.error('MA3AK API failed to start:', e.message);
    return Response.json({ ok: false, error: e.setup ? e.message : 'The service is temporarily unavailable. Please try again in a minute.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const url = new URL(request.url);
  const buf = request.body ? Buffer.from(await request.arrayBuffer()) : Buffer.alloc(0);
  const req = Readable.from(buf.length ? [buf] : []);
  req.method = request.method;
  req.url = url.pathname + url.search;
  req.headers = {}; for (const [k, v] of request.headers) req.headers[k.toLowerCase()] = v;
  req.headers.host = url.host;
  if (buf.length) req.headers['content-length'] = String(buf.length);
  req.socket = { remoteAddress: context?.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown' };
  const res = new NodeResponse();
  if (!(await app.handle(req, res))) return new Response('Not found', { status: 404 });
  await Promise.race([res.finished, new Promise(r => setTimeout(r, 25_000))]);
  return res.toResponse();
};

export const config = { path: ['/api/*', '/auth/*'] };
