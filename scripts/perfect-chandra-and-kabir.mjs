import fs from "fs";
import path from "path";
import sharp from "sharp";

const userDir = "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/";

// ── 1. PERFECT CHANDRA ────────────────────────────────────────────────────────
async function createPerfectChandra() {
  const srcPath = userDir + "media_1790394444728.png";
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  const out = Buffer.alloc(w * h * 4);

  // Background is approximately (48, 47, 47) at bottom, (50, 100, 120) near top
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check if inside/part of the yellow oval
      const isYellow = r > 180 && g > 140 && b < 100;
      const isYellowFringe = r > 120 && g > 90 && b < 60 && y < 85;
      const isRedMark = r > 170 && g < 70 && b < 70 && y < 85;
      // Black character inside the yellow oval (roughly x: 50..140, y: 15..80)
      const inOvalBox = x >= 45 && x <= 150 && y >= 10 && y <= 85;

      if (inOvalBox) {
        // Find if this is within the oval area
        // Measure distance to yellow / character
        // If it's dark background outside the oval:
        const bgDist = Math.hypot(r - 48, g - 47, b - 47);
        const topBgDist = Math.hypot(r - 55, g - 100, b - 120);

        if (bgDist < 35 || topBgDist < 35) {
          // background outside oval
          out[idx + 3] = 0;
        } else {
          // Inside the oval: preserve yellow, black, red exactly!
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = 255;
        }
      } else if (y >= 75) {
        // Text area: 'chandra'
        // Background color here is around (48, 47, 47)
        const bgLum = 47.5;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum <= bgLum + 10) {
          out[idx + 3] = 0; // Transparent background
        } else {
          // Smooth alpha transition from background to white!
          const alphaRatio = Math.min(1, Math.max(0, (lum - bgLum) / (255 - bgLum)));
          out[idx] = 18;     // Rich charcoal/black
          out[idx + 1] = 18;
          out[idx + 2] = 18;
          out[idx + 3] = Math.round(Math.pow(alphaRatio, 0.85) * 255);
        }
      } else {
        out[idx + 3] = 0;
      }
    }
  }

  // Smooth trim & upscale with high-quality lanczos
  const trimmed = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  const finalChandra = await sharp(trimmed)
    .resize({ width: 420, height: 260, fit: "inside", kernel: "lanczos3" })
    .extend({ top: 12, bottom: 12, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/client-chandra-test.png");

  console.log("Created public/client-chandra-test.png");
}

// ── 2. PERFECT KABIR WORLD ───────────────────────────────────────────────────
async function createPerfectKabirWorld() {
  const srcPath = userDir + "media_1790394489005.png";
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Extract the emblem circle (center cx ≈ 36, cy ≈ 36, r ≈ 26)
  const cx = 35.8;
  const cy = 36.0;
  const r = 26.5;

  const circleBuf = Buffer.alloc(72 * 72 * 4);
  for (let y = 0; y < 72; y++) {
    for (let x = 0; x < 72; x++) {
      const idx = (y * 72 + x) * 4;
      const srcIdx = (y * w + x) * 4;
      const dist = Math.hypot(x - cx, y - cy);

      if (dist <= r - 0.5) {
        circleBuf[idx] = data[srcIdx];
        circleBuf[idx + 1] = data[srcIdx + 1];
        circleBuf[idx + 2] = data[srcIdx + 2];
        circleBuf[idx + 3] = 255;
      } else if (dist <= r + 1.0) {
        // Anti-aliased outer edge
        const frac = 1.0 - (dist - (r - 0.5)) / 1.5;
        circleBuf[idx] = data[srcIdx];
        circleBuf[idx + 1] = data[srcIdx + 1];
        circleBuf[idx + 2] = data[srcIdx + 2];
        circleBuf[idx + 3] = Math.round(frac * 255);
      } else {
        circleBuf[idx + 3] = 0;
      }
    }
  }

  // Save the isolated high-res circle as PNG buffer
  const cleanCirclePng = await sharp(circleBuf, { raw: { width: 72, height: 72, channels: 4 } })
    .resize(100, 100, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const circleBase64 = `data:image/png;base64,${cleanCirclePng.toString("base64")}`;

  // Composite with crisp vector typography
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 100" width="520" height="100">
    <image href="${circleBase64}" x="0" y="0" width="100" height="100" />
    
    <!-- Top Text: KABIR WORLD -->
    <text x="116" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', Arial, sans-serif" font-size="44" font-weight="900" letter-spacing="1.2" fill="#111827">KABIR WORLD</text>
    
    <!-- Bottom Text: A VENTURE OF KABIR TECHNOLOGIES PVT LTD -->
    <text x="118" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', Arial, sans-serif" font-size="14.5" font-weight="700" letter-spacing="0.5">
      <tspan fill="#475569">A VENTURE OF </tspan>
      <tspan fill="#F59E0B" font-weight="900">KABIR TECHNOLOGIES</tspan>
      <tspan fill="#475569"> PVT LTD</tspan>
    </text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile("public/client-kabir-world-test.png");

  console.log("Created public/client-kabir-world-test.png");
}

async function main() {
  await createPerfectChandra();
  await createPerfectKabirWorld();
}

main().catch(console.error);
