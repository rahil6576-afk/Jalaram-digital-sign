import sharp from "sharp";

async function generateKabirWorld() {
  const srcPath = "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394489005.png";
  
  // 1. First upscale original 4x with Lanczos to get ultra-clean sub-pixel circle extraction
  const upscaled = await sharp(srcPath)
    .resize(337 * 4, 72 * 4, { kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaled;
  const w = info.width;
  const h = info.height;

  // In 4x coordinates:
  // cx = 33.0 * 4 = 132.0
  // cy = 37.8 * 4 = 151.2
  // radius = 27.2 * 4 = 108.8
  const cx = 132.0;
  const cy = 151.2;
  const r = 108.8;

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

        // Mask tightly inside the white outer border (r - 1.5)
        if (dist <= r - 2.0) {
          circleBuf[outIdx] = sr;
          circleBuf[outIdx + 1] = sg;
          circleBuf[outIdx + 2] = sb;
          circleBuf[outIdx + 3] = 255;
        } else if (dist <= r) {
          const alpha = (r - dist) / 2.0;
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

  // Also add a subtle clean border to make it pop crisply on white
  const cleanCirclePng = await sharp(circleBuf, { raw: { width: circleSize, height: circleSize, channels: 4 } })
    .trim()
    .resize(120, 120, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const circleBase64 = `data:image/png;base64,${cleanCirclePng.toString("base64")}`;

  // Composite with pristine typography at 2x retina (800x160)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 140" width="620" height="140">
    <!-- Emblem -->
    <image href="${circleBase64}" x="10" y="10" width="120" height="120" />
    
    <!-- Thin crisp circular border for luxury finish -->
    <circle cx="70" cy="70" r="59.5" fill="none" stroke="#E2E8F0" stroke-width="1.5" />

    <!-- KABIR WORLD -->
    <text x="150" y="74" font-family="Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="52" font-weight="900" letter-spacing="1.5" fill="#0F172A">KABIR WORLD</text>
    
    <!-- Subtitle -->
    <text x="152" y="108" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="0.8">
      <tspan fill="#475569">A VENTURE OF </tspan>
      <tspan fill="#D97706" font-weight="900">KABIR TECHNOLOGIES</tspan>
      <tspan fill="#475569"> PVT LTD</tspan>
    </text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .trim()
    .extend({ top: 12, bottom: 12, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/client-kabir-world-clean.png");

  await sharp("public/client-kabir-world-clean.png")
    .webp({ quality: 98, lossless: false })
    .toFile("public/client-kabir-world.webp");

  console.log("Kabir World generated successfully!");
}

generateKabirWorld().catch(console.error);
