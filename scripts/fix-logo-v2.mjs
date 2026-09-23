/**
 * fix-logo-v2.mjs
 * 1. Flattens checkerboard to solid white
 * 2. Scans pixels to find exact bounding box of non-white content
 * 3. Crops tight to that bounding box
 * 4. Saves to public/images/jalaram-logo.png
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

// Step 1: Flatten checkerboard → white, then read raw RGB pixels
const flattened = sharp(inputPath).flatten({ background: { r: 255, g: 255, b: 255 } });

const { data, info } = await flattened
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H } = info;
const px = new Uint8Array(data);

// isWhite: returns true if pixel is near-white (background)
function isWhite(x, y) {
  const i = (y * W + x) * 3;
  return px[i] > 245 && px[i+1] > 245 && px[i+2] > 245;
}

// Step 2: Scan to find tight bounding box of non-white content
let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!isWhite(x, y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

// Add a small padding (8px) around the content
const pad = 8;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad);
maxY = Math.min(H - 1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

console.log(`Logo content bounds: (${minX},${minY}) → (${maxX},${maxY})`);
console.log(`Crop size: ${cropW}×${cropH}`);

// Step 3: Extract the cropped region and save
await sharp(inputPath)
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .png({ quality: 100 })
  .toFile(outputPath);

const meta = await sharp(outputPath).metadata();
console.log(`✅ Saved: ${outputPath}  (${meta.width}×${meta.height})`);
