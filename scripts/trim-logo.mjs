/**
 * trim-logo.mjs
 * Trims transparent padding from the logo PNG for a tight crop.
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath  = path.join(__dirname, '..', 'public', 'images', 'jalaram-logo.png');
const outputPath = path.join(__dirname, '..', 'public', 'images', 'jalaram-logo.png');

await sharp(inputPath)
  .trim({ threshold: 10 })   // removes transparent/near-transparent border
  .png()
  .toFile(outputPath + '.tmp.png');

// Replace in place
const { rename } = await import('fs/promises');
await rename(outputPath + '.tmp.png', outputPath);

const meta = await sharp(outputPath).metadata();
console.log(`✅ Trimmed! Final size: ${meta.width}×${meta.height}`);
