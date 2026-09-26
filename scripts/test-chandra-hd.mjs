import fs from "fs";
import path from "path";
import sharp from "sharp";

const userDir = "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/";

async function testHighResChandra() {
  const srcPath = userDir + "media_1790394444728.png";
  
  // 1. First, upscale the original image 4x using lanczos3 for ultra-smooth sub-pixel interpolation
  const upscaledBuf = await sharp(srcPath)
    .resize(285 * 4, 127 * 4, { kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaledBuf;
  const w = info.width;
  const h = info.height;

  const out = Buffer.alloc(w * h * 4);

  // Background color sampling
  // In the upscaled image:
  // Text 'chandra' is roughly y >= 340 (which is 85 * 4)
  // Yellow oval is roughly y < 350, x between 160 and 640
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const isYellow = r > 160 && g > 130 && b < 80;
      const isRed = r > 160 && g < 70 && b < 70;
      const isDarkBackground = (r < 65 && g < 65 && b < 65) || (r < 75 && g < 115 && b < 135);

      if (y >= 350) {
        // Text area: 'chandra'
        // In the original, the text is white on dark (~48, 47, 47)
        // We want the text to be deep charcoal black #111111 with ultra-smooth anti-aliased edges
        const bgFloor = 55;
        const textCeil = 180;

        if (lum <= bgFloor) {
          out[idx + 3] = 0;
        } else if (lum >= textCeil) {
          out[idx] = 17;
          out[idx + 1] = 24;
          out[idx + 2] = 39;
          out[idx + 3] = 255;
        } else {
          // Smooth anti-aliased edge
          const t = (lum - bgFloor) / (textCeil - bgFloor);
          out[idx] = 17;
          out[idx + 1] = 24;
          out[idx + 2] = 39;
          out[idx + 3] = Math.round(t * 255);
        }
      } else {
        // Emblem area (yellow oval + character)
        // If it's dark background outside the yellow oval, make transparent
        // The yellow oval has rich yellow, black inside, red inside
        // Let's identify the yellow oval boundary cleanly
        if (isDarkBackground && !isYellow && !isRed) {
          out[idx + 3] = 0;
        } else {
          // Smooth anti-aliasing on the yellow oval's outer boundary!
          if (isYellow) {
            out[idx] = r;
            out[idx + 1] = g;
            out[idx + 2] = b;
            out[idx + 3] = 255;
          } else if (isRed) {
            out[idx] = r;
            out[idx + 1] = g;
            out[idx + 2] = b;
            out[idx + 3] = 255;
          } else {
            // Inside the oval (black 'e' character):
            // Check distance to center of yellow oval
            // Center is roughly at x = 390 (97.5*4), y = 195 (48.8*4)
            const dx = (x - 390) / 160;
            const dy = (y - 195) / 225;
            // rotated roughly -23 degrees
            const rad = -23 * (Math.PI / 180);
            const cos = Math.cos(-rad);
            const sin = Math.sin(-rad);
            const rx = dx * cos - dy * sin;
            const ry = dx * sin + dy * cos;
            const ellipseDist = Math.hypot(rx, ry);

            if (ellipseDist <= 1.05) {
              // Inside oval! Preserve black character
              out[idx] = Math.min(25, r);
              out[idx + 1] = Math.min(25, g);
              out[idx + 2] = Math.min(25, b);
              out[idx + 3] = 255;
            } else {
              // Outside oval: transparent
              out[idx + 3] = 0;
            }
          }
        }
      }
    }
  }

  // Downscale back to crisp 2x retina size (570x254) with smooth lanczos
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(320, null, { kernel: "lanczos3" })
    .extend({ top: 10, bottom: 10, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/client-chandra-clean.png");

  console.log("Saved public/client-chandra-clean.png");
}

testHighResChandra().catch(console.error);
