/**
 * remove-bg.mjs
 * Flood-fill removes the checkerboard background from the logo PNG,
 * making it genuinely transparent. Saves to public/images/jalaram-logo.png
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath  = path.join(__dirname, '..', 'public', 'ChatGPT Image Sep 23, 2026, 10_46_42 AM.png');
const outputDir  = path.join(__dirname, '..', 'public', 'images');
const outputPath = path.join(outputDir, 'jalaram-logo.png');

await mkdir(outputDir, { recursive: true });

// Load image as raw RGBA pixels
const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h } = info;
const pixels = new Uint8Array(data);

// Helper: get pixel index in flat RGBA buffer
const idx = (x, y) => (y * w + x) * 4;

/**
 * Determine if a pixel is part of the checkerboard background.
 * Checkerboard = pure white (#FFF ~255,255,255) and
 *                light gray (#CCC ~204,204,204), both highly saturated-neutral.
 */
function isBackground(x, y) {
  const i = idx(x, y);
  const r = pixels[i], g = pixels[i+1], b = pixels[i+2];

  // Near-white (both checkerboard squares can be slightly off)
  if (r > 238 && g > 238 && b > 238) return true;

  // Near-light-gray (the darker checkerboard square ~#C0C0C0 to #D5D5D5)
  const avg = (r + g + b) / 3;
  const diff = Math.max(Math.abs(r - avg), Math.abs(g - avg), Math.abs(b - avg));
  if (avg > 188 && avg < 225 && diff < 12) return true;

  return false;
}

// BFS flood fill from all 4 edges
const visited = new Uint8Array(w * h);  // 0 = not visited, 1 = visited
const queue = [];

// Seed the queue with all edge pixels that are background
for (let x = 0; x < w; x++) {
  if (isBackground(x, 0))     queue.push(x, 0);
  if (isBackground(x, h - 1)) queue.push(x, h - 1);
}
for (let y = 0; y < h; y++) {
  if (isBackground(0, y))     queue.push(0, y);
  if (isBackground(w - 1, y)) queue.push(w - 1, y);
}

let qi = 0;
while (qi < queue.length) {
  const x = queue[qi++];
  const y = queue[qi++];

  if (x < 0 || x >= w || y < 0 || y >= h) continue;
  const vi = y * w + x;
  if (visited[vi]) continue;
  if (!isBackground(x, y)) continue;

  visited[vi] = 1;
  // Make pixel fully transparent
  const pi = idx(x, y);
  pixels[pi + 3] = 0;

  queue.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
}

// Write output
await sharp(Buffer.from(pixels), { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile(outputPath);

console.log(`✅ Done! Saved to: ${outputPath}`);
console.log(`   Dimensions: ${w}×${h}`);
