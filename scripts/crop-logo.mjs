/**
 * crop-logo.mjs
 * Crops the logo to just the visible content using the original image,
 * replaces checkerboard with white, and crops very tightly.
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath  = path.join(__dirname, '..', 'public', 'ChatGPT Image Sep 23, 2026, 10_46_42 AM.png');
const outputPath = path.join(__dirname, '..', 'public', 'images', 'jalaram-logo.png');

// Step 1: Read raw pixels from original
const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const px = new Uint8Array(data);

console.log(`Original: ${W}×${H} channels:${C}`);

// Step 2: BFS flood fill to replace checkerboard with white
function isCheckerboard(x, y) {
  const i = (y * W + x) * C;
  const r = px[i], g = px[i+1], b = px[i+2];
  if (r > 245 && g > 245 && b > 245) return true;
  const avg = (r + g + b) / 3;
  const diff = Math.max(Math.abs(r-avg), Math.abs(g-avg), Math.abs(b-avg));
  return avg >= 185 && avg <= 245 && diff < 10;
}

const visited = new Uint8Array(W * H);
const queue = [];
for (let x = 0; x < W; x++) {
  if (isCheckerboard(x, 0))   queue.push(x, 0);
  if (isCheckerboard(x, H-1)) queue.push(x, H-1);
}
for (let y = 1; y < H-1; y++) {
  if (isCheckerboard(0,   y)) queue.push(0, y);
  if (isCheckerboard(W-1, y)) queue.push(W-1, y);
}

let qi = 0;
while (qi < queue.length) {
  const x = queue[qi++], y = queue[qi++];
  if (x < 0 || x >= W || y < 0 || y >= H) continue;
  const vi = y * W + x;
  if (visited[vi] || !isCheckerboard(x, y)) continue;
  visited[vi] = 1;
  const pi = vi * C;
  px[pi] = 255; px[pi+1] = 255; px[pi+2] = 255;
  queue.push(x+1,y, x-1,y, x,y+1, x,y-1);
}
console.log('Checkerboard removed.');

// Step 3: Find tight content bounds (pixels with strong color, not near-white)
// Use a tighter threshold - only count pixels with clear color saturation
let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const r = px[i], g = px[i+1], b = px[i+2];
    const avg = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r-avg), Math.abs(g-avg), Math.abs(b-avg));
    // Has color (saturation) OR is dark (not white/near-white)
    const hasColor = maxDiff > 15 || avg < 200;
    if (hasColor) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}

const pad = 20;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W-1, maxX + pad);
maxY = Math.min(H-1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
console.log(`Content: (${minX},${minY}) → (${maxX},${maxY})  size: ${cropW}×${cropH}  ratio: ${(cropW/cropH).toFixed(2)}`);

// Step 4: Write processed pixels, extract crop, save
await sharp(Buffer.from(px), { raw: { width: W, height: H, channels: C } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .png({ quality: 100 })
  .toFile(outputPath);

const meta = await sharp(outputPath).metadata();
console.log(`✅ Saved: ${meta.width}×${meta.height}`);
