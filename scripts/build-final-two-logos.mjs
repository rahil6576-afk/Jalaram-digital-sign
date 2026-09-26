import fs from "fs";
import path from "path";
import sharp from "sharp";

async function buildKabirWorld() {
  const srcPath = "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394489005.png";
  
  // Upscale 4x for sub-pixel circle extraction
  const upscaled = await sharp(srcPath)
    .resize(337 * 4, 72 * 4, { kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaled;
  const w = info.width;
  const h = info.height;

  // Exact 4x center and radius
  const cx = 132.0;
  const cy = 151.2;
  const r = 108.5;

  const circleSize = 240;
  const circleBuf = Buffer.alloc(circleSize * circleSize * 4);
  const circleOffset = circleSize / 2;

  for (let y = 0; y < circleSize; y++) {
    for (let x = 0; x < circleSize; x++) {
      const outIdx = (y * circleSize + x) * 4;
      const srcX = Math.round(cx - circleOffset + x);
      const srcY = Math.round(cy - circleOffset + y);
      const dist = Math.hypot(x - circleOffset, y - circleOffset);

      if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
        const srcIdx = (srcY * w + srcX) * 4;
        const sr = data[srcIdx];
        const sg = data[srcIdx + 1];
        const sb = data[srcIdx + 2];

        if (dist <= r - 1.5) {
          circleBuf[outIdx] = sr;
          circleBuf[outIdx + 1] = sg;
          circleBuf[outIdx + 2] = sb;
          circleBuf[outIdx + 3] = 255;
        } else if (dist <= r) {
          const alpha = (r - dist) / 1.5;
          circleBuf[outIdx] = sr;
          circleBuf[outIdx + 1] = sg;
          circleBuf[outIdx + 2] = sb;
          circleBuf[outIdx + 3] = Math.round(alpha * 255);
        } else {
          circleBuf[outIdx + 3] = 0;
        }
      }
    }
  }

  const cleanCirclePng = await sharp(circleBuf, { raw: { width: circleSize, height: circleSize, channels: 4 } })
    .trim()
    .resize(130, 130, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const circleBase64 = `data:image/png;base64,${cleanCirclePng.toString("base64")}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 140" width="650" height="140">
    <!-- Emblem -->
    <image href="${circleBase64}" x="10" y="5" width="130" height="130" />
    
    <!-- Subtle luxury outer stroke -->
    <circle cx="75" cy="70" r="64.5" fill="none" stroke="#CBD5E1" stroke-width="1.5" />

    <!-- KABIR WORLD -->
    <text x="160" y="74" font-family="Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="52" font-weight="900" letter-spacing="1.5" fill="#0F172A">KABIR WORLD</text>
    
    <!-- Subtitle -->
    <text x="162" y="108" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16.5" font-weight="700" letter-spacing="0.8">
      <tspan fill="#475569">A VENTURE OF </tspan>
      <tspan fill="#D97706" font-weight="900">KABIR TECHNOLOGIES</tspan>
      <tspan fill="#475569"> PVT LTD</tspan>
    </text>
  </svg>`;

  const finalKabirPng = await sharp(Buffer.from(svg))
    .trim()
    .extend({ top: 12, bottom: 12, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(finalKabirPng).png().toFile("public/client-kabir-world.png");
  await sharp(finalKabirPng).webp({ quality: 98, lossless: false }).toFile("public/client-kabir-world.webp");
  console.log("Built public/client-kabir-world.webp & png");
}

async function buildChandra() {
  const srcPath = "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png";
  
  const upscaled = await sharp(srcPath)
    .resize(285 * 3, 127 * 3, { kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = upscaled.info.width;
  const h = upscaled.info.height;
  const data = upscaled.data;

  const isBlocking = (x, y) => {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Yellow oval
    if (r > 150 && g > 115 && b < 100) return true;
    // Red mark
    if (r > 130 && g < 75 && b < 75) return true;
    // Text 'chandra'
    if (lum > 70) return true;

    return false;
  };

  // BFS from borders
  const visited = new Uint8Array(w * h);
  const queue = [];

  for (let x = 0; x < w; x++) {
    if (!isBlocking(x, 0)) { visited[0 * w + x] = 1; queue.push(x, 0); }
    if (!isBlocking(x, h - 1)) { visited[(h - 1) * w + x] = 1; queue.push(x, h - 1); }
  }
  for (let y = 0; y < h; y++) {
    if (!isBlocking(0, y)) { visited[y * w + 0] = 1; queue.push(0, y); }
    if (!isBlocking(w - 1, y)) { visited[y * w + (w - 1)] = 1; queue.push(w - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!visited[nIdx] && !isBlocking(nx, ny)) {
          visited[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  const out = Buffer.alloc(w * h * 4);
  const ovalCutoffY = 85 * 3;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const vIdx = y * w + x;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Ignore top 3px artifact
      if (y < 3 * 3) {
        out[idx + 3] = 0;
        continue;
      }

      if (visited[vIdx]) {
        out[idx + 3] = 0;
      } else {
        if (y < ovalCutoffY) {
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = 255;
        } else {
          const isYellow = r > 150 && g > 120 && b < 100;
          if (isYellow) {
            out[idx] = r;
            out[idx + 1] = g;
            out[idx + 2] = b;
            out[idx + 3] = 255;
          } else {
            const bgLum = 46.5;
            if (lum > bgLum + 8) {
              const alpha = Math.min(1.0, (lum - (bgLum + 8)) / (230 - (bgLum + 8)));
              out[idx] = 17;
              out[idx + 1] = 24;
              out[idx + 2] = 39;
              out[idx + 3] = Math.round(Math.pow(alpha, 0.7) * 255);
            } else {
              out[idx + 3] = 0;
            }
          }
        }
      }
    }
  }

  const finalChandraPng = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(360, null, { kernel: "lanczos3" })
    .extend({ top: 10, bottom: 10, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(finalChandraPng).png().toFile("public/client-chandra.png");
  await sharp(finalChandraPng).webp({ quality: 98, lossless: false }).toFile("public/client-chandra.webp");
  console.log("Built public/client-chandra.webp & png");
}

async function main() {
  await buildKabirWorld();
  await buildChandra();
}

main().catch(console.error);
