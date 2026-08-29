// Génère les icônes PWA (PNG) sans dépendance : encodeur PNG minimal (RGBA, zlib).
// Rendu : carré sombre arrondi + monogramme "E" émeraude. Version "maskable" avec marge.
//
// ATTENTION : les icônes réelles de la marque (public/pwa-*.png, apple-touch-icon.png,
// favicon-64.png) sont désormais générées à partir du vrai logo EDOTEAM
// (public/assets/images/logo-elite.png), pas par ce script. NE PAS relancer ce script :
// il écraserait les icônes de marque avec ce placeholder "E" générique.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');

const BG = [15, 23, 42, 255];      // #0f172a
const FG = [16, 185, 129, 255];    // #10b981 (emerald)
const GOLD = [251, 191, 36, 255];  // #fbbf24

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Dessine l'icône dans un buffer RGBA.
function draw(size, { padding = 0 } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const put = (x, y, [r, g, b, a]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
  };
  const inner = size - padding * 2;
  const radius = inner * 0.22;
  const inRoundRect = (x, y) => {
    const px = x - padding, py = y - padding;
    if (px < 0 || py < 0 || px >= inner || py >= inner) return false;
    const cx = Math.min(Math.max(px, radius), inner - radius);
    const cy = Math.min(Math.max(py, radius), inner - radius);
    return (px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2 || (px >= radius && px <= inner - radius) || (py >= radius && py <= inner - radius);
  };

  // Traits du "E" stylisé
  const bx0 = padding + inner * 0.30, bx1 = padding + inner * 0.72;
  const barH = inner * 0.12;
  const bars = [inner * 0.26, inner * 0.44, inner * 0.62].map((o) => padding + o);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (padding > 0) put(x, y, [0, 0, 0, 0]); // transparent hors zone (maskable garde une marge safe)
      if (!inRoundRect(x, y)) continue;
      put(x, y, BG);
      // barre verticale
      if (x >= bx0 && x <= bx0 + barH && y >= bars[0] && y <= bars[2] + barH) put(x, y, FG);
      // 3 barres horizontales
      for (const by of bars) {
        const w = by === bars[1] ? (bx1 - bx0) * 0.78 : bx1 - bx0;
        if (x >= bx0 && x <= bx0 + w && y >= by && y <= by + barH) put(x, y, by === bars[1] ? GOLD : FG);
      }
    }
  }
  return buf;
}

mkdirSync(PUBLIC, { recursive: true });
const targets = [
  ['pwa-192.png', 192, {}],
  ['pwa-512.png', 512, {}],
  ['pwa-maskable-512.png', 512, { padding: Math.round(512 * 0.1) }],
  ['apple-touch-icon.png', 180, {}],
  ['favicon-64.png', 64, {}],
];
for (const [name, size, opts] of targets) {
  writeFileSync(resolve(PUBLIC, name), encodePNG(size, size, draw(size, opts)));
  console.log('✓', name, `${size}x${size}`);
}
