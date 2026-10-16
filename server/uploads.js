// Image uploads arrive as data URLs. We verify the real file type from its bytes,
// strip metadata (EXIF/GPS, comments), and store under random names outside the web root.

// Netlify Functions accept request bodies up to 6 MB, so one image is capped at 4 MB (the browser resizes first).
export const MAX_BYTES = 4 * 1024 * 1024;

export function decodeImage(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const m = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > MAX_BYTES) return null;
  try {
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return { mime: 'image/jpeg', ext: 'jpg', buf: stripJpeg(buf) };
    if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return { mime: 'image/png', ext: 'png', buf: stripPng(buf) };
  } catch { return null; } // malformed image: reject
  return null;
}

// Keep only the segments needed to display the image (drops APP1–APP15 incl. EXIF/XMP and COM).
function stripJpeg(b) {
  const out = [b.subarray(0, 2)]; let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xFF) throw new Error('bad jpeg');
    const marker = b[i + 1];
    if (marker === 0xD9) { out.push(b.subarray(i, i + 2)); break; }
    if (marker === 0xDA) { out.push(b.subarray(i)); break; }
    if ((marker >= 0xD0 && marker <= 0xD7) || marker === 0x01) { out.push(b.subarray(i, i + 2)); i += 2; continue; }
    const len = b.readUInt16BE(i + 2); if (len < 2 || i + 2 + len > b.length) throw new Error('bad jpeg');
    const drop = (marker >= 0xE1 && marker <= 0xEF) || marker === 0xFE;
    if (!drop) out.push(b.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  return Buffer.concat(out);
}
// Keep only critical chunks plus colour info; drop text/EXIF/time chunks.
function stripPng(b) {
  const keep = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'pHYs']);
  const out = [b.subarray(0, 8)]; let i = 8;
  while (i + 12 <= b.length) {
    const len = b.readUInt32BE(i), type = b.toString('latin1', i + 4, i + 8), end = i + 12 + len;
    if (end > b.length) throw new Error('bad png');
    if (keep.has(type)) out.push(b.subarray(i, end));
    i = end; if (type === 'IEND') break;
  }
  return Buffer.concat(out);
}

// Storage of decoded images lives in storage.js (Netlify Blobs in production).
