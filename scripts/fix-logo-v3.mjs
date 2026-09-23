/**
 * fix-logo-v3.mjs
 * The source PNG has NO alpha — the checkerboard (white+gray squares) is literally
 * baked in as RGB pixels. We replace both checkerboard colors with pure white,
 * then crop tightly to the actual logo content.
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

// Read raw RGB pixels
const { data, info } = await sharp(inputPath)
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H } = info;
const px = new Uint8Array(data);

/**
 * Detect checkerboard pixels.
 * Light square: near-white (R,G,B all > 245)
 * Dark square:  neutral gray (R≈G≈B, value ~190–240)
 * We use a flood-fill from all 4 edges so we only replace connected background
 * and don't accidentally touch gray inside the logo (e.g. the dark-gray CMYK bar).
 */
function isCheckerboard(x, y) {
  const i = (y * W + x) * 3;
  const r = px[i], g = px[i+1], b = px[i+2];

  // Near-white (light checkerboard square)
  if (r > 245 && g > 245 && b > 245) return true;

  // Neutral gray (dark checkerboard square): R≈G≈B and value in mid-range
  const avg = (r + g + b) / 3;
  const maxDiff = Math.max(Math.abs(r - avg), Math.abs(g - avg), Math.abs(b - avg));
  if (avg >= 190 && avg <= 242 && maxDiff < 8) return true;

  return false;
}

// BFS flood fill from all 4 edges
const visited = new Uint8Array(W * H);
const queue = [];

for (let x = 0; x < W; x++) {
  if (isCheckerboard(x, 0))   queue.push(x, 0);
  if (isCheckerboard(x, H-1)) queue.push(x, H-1);
}
for (let y = 1; y < H-1; y++) {
  if (isCheckerboard(0,   y)) queue.push(0,   y);
  if (isCheckerboard(W-1, y)) queue.push(W-1, y);
}

let qi = 0;
while (qi < queue.length) {
  const x = queue[qi++];
  const y = queue[qi++];
  if (x < 0 || x >= W || y < 0 || y >= H) continue;
  const vi = y * W + x;
  if (visited[vi]) continue;
  if (!isCheckerboard(x, y)) continue;
  visited[vi] = 1;

  // Replace with pure white
  const pi = vi * 3;
  px[pi] = 255; px[pi+1] = 255; px[pi+2] = 255;

  queue.push(x+1, y, x-1, y, x, y+1, x, y-1);
}

console.log('BFS done. Finding content bounding box...');

// Find tight bounding box of non-white content
let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const r = px[i], g = px[i+1], b = px[i+2];
    if (r < 250 || g < 250 || b < 250) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 12;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad);
maxY = Math.min(H - 1, maxY + pad);
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

console.log(`Content bounds: (${minX},${minY}) → (${maxX},${maxY}), crop: ${cropW}×${cropH}`);

// Write the modified pixel buffer back, then crop
await sharp(Buffer.from(px), { raw: { width: W, height: H, channels: 3 } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .png({ quality: 100 })
  .toFile(outputPath);

const meta = await sharp(outputPath).metadata();
console.log(`✅ Saved: ${outputPath}  (${meta.width}×${meta.height})`);
