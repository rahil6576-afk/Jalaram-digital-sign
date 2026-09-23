/**
 * fix-logo.mjs
 * Flattens the checkerboard background to solid white (matching the white navbar)
 * and trims tight to the logo content. White-on-white = seamless merge.
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always start from the original to avoid compounding errors
const inputPath  = path.join(__dirname, '..', 'public', 'ChatGPT Image Sep 23, 2026, 10_46_42 AM.png');
const outputDir  = path.join(__dirname, '..', 'public', 'images');
const outputPath = path.join(outputDir, 'jalaram-logo.png');

await mkdir(outputDir, { recursive: true });

await sharp(inputPath)
  // Step 1: Flatten ALL transparent/checkerboard pixels → pure white
  // (checkerboard is semi-transparent or opaque gray/white; flatten replaces it with white)
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  // Step 2: Trim the excess white border tightly so only logo content remains
  .trim({ threshold: 5 })
  // Step 3: Output as high-quality PNG
  .png({ quality: 100, compressionLevel: 6 })
  .toFile(outputPath);

const meta = await sharp(outputPath).metadata();
console.log(`✅ Done! Saved: ${outputPath}`);
console.log(`   Final size: ${meta.width}×${meta.height}px`);
