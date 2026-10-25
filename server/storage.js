// File storage for uploaded images. On Netlify: Netlify Blobs (managed object storage, private;
// files are only reachable through the API, which checks permissions). Locally: DATA_DIR/uploads.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';
import { securityHeaders } from './security.js';

const ID = /^[A-Za-z0-9_-]{20,40}$/;
const dir = () => path.join(config.dataDir, 'uploads');
const docDir = () => path.join(config.dataDir, 'documents');
let blobs = null, docBlobs = null;
async function store() {
  if (!config.onNetlify) return null;
  if (!blobs) { const { getStore } = await import('@netlify/blobs'); blobs = getStore({ name: 'ma3ak-uploads', consistency: 'strong' }); }
  return blobs;
}
// Verification documents live in their own private store; they are never served publicly.
async function docStore() {
  if (!config.onNetlify) return null;
  if (!docBlobs) { const { getStore } = await import('@netlify/blobs'); docBlobs = getStore({ name: 'ma3ak-documents', consistency: 'strong' }); }
  return docBlobs;
}
const ext = mime => mime === 'image/png' ? 'png' : 'jpg';

// Save a validated image ({ mime, buf }) under a new random id.
export async function putImage(img) {
  const id = crypto.randomBytes(18).toString('base64url');
  const s = await store();
  if (s) await s.set(id, img.buf.buffer.slice(img.buf.byteOffset, img.buf.byteOffset + img.buf.byteLength), { metadata: { mime: img.mime } });
  else { fs.mkdirSync(dir(), { recursive: true, mode: 0o700 }); fs.writeFileSync(path.join(dir(), `${id}.${ext(img.mime)}`), img.buf, { mode: 0o600, flag: 'wx' }); }
  return { id, size: img.buf.length, mime: img.mime };
}
export async function getImage(id) {
  if (!ID.test(String(id || ''))) return null;
  const s = await store();
  if (s) { const r = await s.getWithMetadata(id, { type: 'arrayBuffer' }); return r ? { buf: Buffer.from(r.data), mime: r.metadata?.mime === 'image/png' ? 'image/png' : 'image/jpeg' } : null; }
  for (const mime of ['image/jpeg', 'image/png']) { const p = path.join(dir(), `${id}.${ext(mime)}`); if (fs.existsSync(p)) return { buf: fs.readFileSync(p), mime }; }
  return null;
}
export async function removeImage(id) {
  if (!ID.test(String(id || ''))) return;
  try { const s = await store(); if (s) await s.delete(id); else for (const e of ['jpg', 'png']) fs.rmSync(path.join(dir(), `${id}.${e}`), { force: true }); }
  catch { console.warn('storage: could not delete a file'); }
}
// Send an image to the browser (caller has already checked the visitor may see it).
export async function sendImage(res, id, { cache = 'private, no-store', download = null } = {}) {
  const f = await getImage(id);
  if (!f) { res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end('{"ok":false,"error":"Not found."}'); return; }
  securityHeaders(res, 'file');
  const h = { 'Content-Type': f.mime, 'Content-Length': f.buf.length, 'Cache-Control': cache };
  if (download) h['Content-Disposition'] = `inline; filename="${download}.${ext(f.mime)}"`;
  res.writeHead(200, h); res.end(f.buf);
}

// ---------- private documents (PDF, JPG, PNG) ----------
const DOC_EXT = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };
export async function putDocument(doc) {
  const id = crypto.randomBytes(18).toString('base64url'), s = await docStore();
  if (s) await s.set(id, doc.buf.buffer.slice(doc.buf.byteOffset, doc.buf.byteOffset + doc.buf.byteLength), { metadata: { mime: doc.mime } });
  else { fs.mkdirSync(docDir(), { recursive: true, mode: 0o700 }); fs.writeFileSync(path.join(docDir(), `${id}.${DOC_EXT[doc.mime]}`), doc.buf, { mode: 0o600, flag: 'wx' }); }
  return { id, size: doc.buf.length, mime: doc.mime };
}
export async function getDocument(id, mime) {
  if (!ID.test(String(id || ''))) return null;
  const s = await docStore();
  if (s) { const r = await s.getWithMetadata(id, { type: 'arrayBuffer' }); return r ? { buf: Buffer.from(r.data), mime: r.metadata?.mime || mime } : null; }
  const p = path.join(docDir(), `${id}.${DOC_EXT[mime] || 'bin'}`); return fs.existsSync(p) ? { buf: fs.readFileSync(p), mime } : null;
}
export async function removeDocument(id, mime) {
  if (!ID.test(String(id || ''))) return;
  try { const s = await docStore(); if (s) await s.delete(id); else fs.rmSync(path.join(docDir(), `${id}.${DOC_EXT[mime] || 'bin'}`), { force: true }); }
  catch { console.warn('storage: could not delete a document'); }
}
// Always a download, never rendered inline on our origin.
export async function sendDocument(res, id, mime, name) {
  const f = await getDocument(id, mime);
  if (!f) { res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end('{"ok":false,"error":"Not found."}'); return; }
  securityHeaders(res, 'file');
  const safe = String(name || 'document').replace(/[^\w.-]+/g, '_').slice(0, 80) || 'document';
  res.writeHead(200, { 'Content-Type': f.mime, 'Content-Length': f.buf.length, 'Cache-Control': 'private, no-store', 'Content-Disposition': `attachment; filename="${safe}.${DOC_EXT[f.mime] || 'bin'}"`, 'X-Content-Type-Options': 'nosniff' });
  res.end(f.buf);
}
