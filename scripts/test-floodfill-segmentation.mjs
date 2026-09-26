import sharp from "sharp";

async function segmentChandra() {
  const { data, info } = await sharp('C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // 1. Upscale 3x with lanczos to get pristine sub-pixel resolution and smooth borders
  const upscaled = await sharp('C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png')
    .resize(w * 3, h * 3, { kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const uw = upscaled.info.width;
  const uh = upscaled.info.height;
  const udata = upscaled.data;

  // Let's create an output image buffer
  const out = Buffer.alloc(uw * uh * 4);

  // We classify pixels:
  // Text area: y >= 78 * 3
  // Oval area: y < 90 * 3
  const textSplitY = 78 * 3;

  for (let y = 0; y < uh; y++) {
    for (let x = 0; x < uw; x++) {
      const idx = (y * uw + x) * 4;
      const r = udata[idx];
      const g = udata[idx + 1];
      const b = udata[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      const isYellow = r > 165 && g > 130 && b < 90;
      const isRed = r > 140 && g < 80 && b < 80;

      // Inside mascot center box: roughly x in [60*3, 125*3], y in [25*3, 80*3]
      const inMascotBox = x >= 58 * 3 && x <= 126 * 3 && y >= 25 * 3 && y <= 80 * 3;
      const isMascotBlack = inMascotBox && lum < 65;

      // Check if inside oval via ellipse test:
      // cx ≈ 97*3, cy ≈ 59*3, rx ≈ 36.5*3, ry ≈ 54.5*3, angle ≈ -24.5 deg
      const rad = -24.5 * (Math.PI / 180);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = x - 97.0 * 3;
      const dy = y - 59.0 * 3;
      const ex = (dx * cos + dy * sin) / (36.5 * 3);
      const ey = (-dx * sin + dy * cos) / (54.5 * 3);
      const ellipseDist = Math.hypot(ex, ey);

      if (y < textSplitY) {
        // TOP HALF: ONLY the oval & mascot!
        if (isYellow || isRed || isMascotBlack) {
          // Inside the oval element
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = 255;
        } else if (ellipseDist <= 1.03 && lum > 65) {
          // Anti-aliased transition on the border of the yellow oval
          const alpha = Math.min(1, Math.max(0, (1.03 - ellipseDist) / 0.05));
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = Math.round(alpha * 255);
        } else {
          // Background outside oval
          out[idx + 3] = 0;
        }
      } else {
        // BOTTOM HALF: Text 'chandra' + bottom of the oval
        // If it's the yellow oval body at the bottom:
        if (isYellow && ellipseDist <= 1.02) {
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = 255;
        } else {
          // Text 'chandra'
          // Background luminance is ~47
          const bgLum = 47.0;
          if (lum > bgLum + 12) {
            // Text pixel! Unblend alpha smoothly:
            const alpha = Math.min(1.0, (lum - (bgLum + 12)) / (230 - (bgLum + 12)));
            // Rich deep charcoal / black #111827
            out[idx] = 17;
            out[idx + 1] = 24;
            out[idx + 2] = 39;
            out[idx + 3] = Math.round(Math.pow(alpha, 0.75) * 255);
          } else {
            out[idx + 3] = 0;
          }
        }
      }
    }
  }

  await sharp(out, { raw: { width: uw, height: uh, channels: 4 } })
    .trim()
    .resize(400, null, { kernel: "lanczos3" })
    .extend({ top: 12, bottom: 12, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/client-chandra-segmented.png");

  console.log("Saved public/client-chandra-segmented.png");
}

segmentChandra().catch(console.error);
