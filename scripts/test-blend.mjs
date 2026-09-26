import sharp from "sharp";

async function testFloodFill() {
  const { data, info } = await sharp('C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // Let's create an output buffer
  const out = Buffer.alloc(w * h * 4);

  // First, let's understand text pixels vs oval pixels
  // White text 'chandra' is located in y >= 75
  // Let's inspect the original image
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      const isYellow = r > 150 && g > 120 && b < 80;
      const isRed = r > 140 && g < 75 && b < 75;
      
      // Inside the oval region (x: 45..150, y: 8..95)
      // Check if inside the tilted ellipse: cx=96.5, cy=58, rx=35, ry=53, angle=-24.5 deg
      const rad = -24.5 * (Math.PI / 180);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = x - 96.5;
      const dy = y - 58.0;
      const ex = (dx * cos + dy * sin) / 35.5;
      const ey = (-dx * sin + dy * cos) / 53.5;
      const ellipseDist = Math.hypot(ex, ey);

      if (ellipseDist <= 1.0) {
        // Definitely inside the oval!
        // Preserve yellow, red, and black mascot exactly!
        out[idx] = r;
        out[idx + 1] = g;
        out[idx + 2] = b;
        out[idx + 3] = 255;
      } else if (ellipseDist <= 1.05 && (isYellow || isRed)) {
        // Anti-aliased outer edge of the yellow oval
        const alpha = (1.05 - ellipseDist) / 0.05;
        out[idx] = r;
        out[idx + 1] = g;
        out[idx + 2] = b;
        out[idx + 3] = Math.round(alpha * 255);
      } else if (y >= 75) {
        // Text region: 'chandra'
        // Background in this region is around 47-50 luminance
        const bgLum = 47.0;
        if (lum > bgLum + 8) {
          // Unblend alpha: lum = alpha * 255 + (1 - alpha) * bgLum
          const alpha = Math.min(1.0, Math.max(0.0, (lum - bgLum) / (255 - bgLum)));
          // Color text as rich charcoal #111827
          out[idx] = 17;
          out[idx + 1] = 24;
          out[idx + 2] = 39;
          out[idx + 3] = Math.round(Math.pow(alpha, 0.8) * 255);
        } else {
          out[idx + 3] = 0;
        }
      } else {
        out[idx + 3] = 0;
      }
    }
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(380, null, { kernel: "lanczos3" })
    .extend({ top: 12, bottom: 12, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/client-chandra-test-blend.png");

  console.log("Saved public/client-chandra-test-blend.png");
}

testFloodFill().catch(console.error);
