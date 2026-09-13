/**
 * Generates SweeperMine's app icons, favicon, and social card as PNG/ICO using
 * only Node built-ins (zlib). The outputs are committed to public/; regenerate
 * with `node scripts/make-icons.mjs` whenever the emblem changes.
 *
 * Design: dark ink rounded square, amber mine emblem (8 spokes + orb + spec).
 */

import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PUBLIC = join(ROOT, "public");

/* ------------------------------- tiny PNG writer ------------------------------ */

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    raw[row] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, row + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function wrapIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

/* -------------------------------- icon painter -------------------------------- */

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (t) => t * t * (3 - 2 * t);

function sdRoundRect(px, py, hw, hh, r) {
  const qx = Math.abs(px) - hw + r;
  const qy = Math.abs(py) - hh + r;
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? clamp01(((px - ax) * dx + (py - ay) * dy) / len2) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const ORB_R = 0.17;
const SPIKE_IN = 0.13;
const SPIKE_OUT = 0.64;
const SPIKE_W = 0.055;

/**
 * Paints one RGBA raster. `size` is the output pixel size. When `bleed` is
 * true the paint fills the whole canvas (for social cards); otherwise the
 * emblem sits on an iOS-style rounded square, transparent outside it.
 */
function paint(size, bleed) {
  const SS = 3; // supersampling per axis
  const out = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size - 0.5;
          const py = (y + (sy + 0.5) / SS) / size - 0.5;

          let bg = [26, 28, 34];
          let coat = 1;
          if (bleed) {
            const t = smooth(clamp01((px + py + 1) / 2));
            bg = [lerp(0x27, 0x0e, t), lerp(0x29, 0x0e, t), lerp(0x30, 0x11, t)];
            const vig = 1 - 0.22 * clamp01((Math.hypot(px, py) - 0.25) / 0.45);
            bg = bg.map((v) => v * vig);
          } else {
            const d = sdRoundRect(px, py, 0.5, 0.5, 0.235);
            coat = clamp01(0.5 - d * size * 1.4);
            if (coat <= 0) continue;
            const t = smooth(clamp01((px + py + 1) / 2));
            bg = [lerp(0x2b, 0x12, t), lerp(0x2d, 0x12, t), lerp(0x35, 0x17, t)];
          }
          const alpha = coat;
          let cr = bg[0] * alpha;
          let cg = bg[1] * alpha;
          let cb = bg[2] * alpha;

          // Eight amber spokes radiating off the orb.
          let spike = 0;
          for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const ax = Math.cos(ang) * SPIKE_IN;
            const ay = Math.sin(ang) * SPIKE_IN;
            const bx = Math.cos(ang) * SPIKE_OUT;
            const by = Math.sin(ang) * SPIKE_OUT;
            const d = segDist(px, py, ax, ay, bx, by) - SPIKE_W;
            spike = Math.max(spike, clamp01(0.5 - d * size * 1.4));
          }
          if (spike > 0) {
            const warm = 0.7 + 0.3 * spike;
            const sr = 0xff * spike;
            const sg = 0x9a * spike * warm;
            const sb = 0x05 * spike;
            // Blend over the background in place.
            cr += (sr - cr) * spike;
            cg += (sg - cg) * spike;
            cb += (sb - cb) * spike;
          }

          // Orb: dark rounded minehead sitting over the spokes.
          const orbCover = clamp01(0.5 - (Math.hypot(px, py) - ORB_R) * size * 1.6);
          if (orbCover > 0) {
            const top = smooth(clamp01((0.05 - py) / 0.25 + 0.3));
            const or = lerp(0x0a, 0x1f, top);
            const og = lerp(0x0a, 0x20, top);
            const ob = lerp(0x0c, 0x26, top);
            cr += (or - cr) * orbCover;
            cg += (og - cg) * orbCover;
            cb += (ob - cb) * orbCover;
          }

          // Amber rim where the orb meets the spokes.
          const rim = clamp01(0.5 - (Math.abs(Math.hypot(px, py) - ORB_R) - 0.012) * size * 1.2);
          if (rim > 0) {
            cr += (0xff * 0.75 - cr) * rim;
            cg += (0xe2 * 0.3 - cg) * rim;
            cb += (0x3e - cb) * rim;
          }

          // Specular highlight, upper-left.
          const hl = clamp01(0.5 - (Math.hypot(px + 0.055, py + 0.06) - 0.045) * size * 1.6) * 0.32;
          cr += 255 * hl;
          cg += 255 * hl;
          cb += 255 * hl;

          r += cr;
          g += cg;
          b += cb;
          a += alpha;
        }
      }
      const i = (y * size + x) * 4;
      const s = a > 0 ? 1 / a : 0; // r/g/b carry 0..255 average color, so no rescale
      out[i] = Math.round(r * s);
      out[i + 1] = Math.round(g * s);
      out[i + 2] = Math.round(b * s);
      out[i + 3] = Math.round((a / (SS * SS)) * 255);
    }
  }
  return out;
}

/* ----------------------------------- emit ------------------------------------ */

function emit(name, buf) {
  writeFileSync(join(PUBLIC, name), buf);
  console.log(`wrote public/${name} (${buf.length} bytes)`);
}

const sizes = [180, 192, 512];
for (const s of sizes) {
  const png = encodePng(s, s, paint(s, false));
  emit(s === 180 ? "apple-touch-icon.png" : `icon-${s}.png`, png);
}

const favPng = encodePng(32, 32, paint(32, false));
emit("favicon.ico", wrapIco(favPng, 32));

const OG_W = 1200;
const OG_H = 630;
const og = paint(OG_W, true); // square paint, crop a centered 1200x630 band
const band = Math.round((OG_W - OG_H) / 2) * OG_W * 4;
emit("og.png", encodePng(OG_W, OG_H, og.subarray(band, band + OG_W * OG_H * 4)));