import sharp from "sharp";

async function testFloodFillBFS() {
  const { data, info } = await sharp('C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png')
    .resize(285 * 3, 127 * 3, { kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // Let's inspect pixel brightness and color
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
    // Text 'chandra' (bright letters)
    if (lum > 70) return true;

    return false;
  };

  // BFS from borders
  const visited = new Uint8Array(w * h);
  const queue = [];

  // Enqueue all boundary pixels that are not blocking
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

  // Now create the output:
  const out = Buffer.alloc(w * h * 4);

  // The yellow oval center is cx=97*3, cy=59*3
  // Any non-background pixel within the oval region (y < 86 * 3) is either yellow, red, or the mascot!
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
        // Exterior background reached by BFS -> transparent
        out[idx + 3] = 0;
      } else {
        // Not visited by BFS -> either part of the oval or part of the text!
        if (y < ovalCutoffY) {
          // Inside the oval element!
          // Preserve colors: yellow, red, and the black bird character
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = 255;
        } else {
          // Bottom area: could be the bottom of the yellow oval or the text 'chandra'
          const isYellow = r > 150 && g > 120 && b < 100;
          if (isYellow) {
            out[idx] = r;
            out[idx + 1] = g;
            out[idx + 2] = b;
            out[idx + 3] = 255;
          } else {
            // Text 'chandra'
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

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(360, null, { kernel: "lanczos3" })
    .extend({ top: 10, bottom: 10, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/client-chandra-bfs.png");

  console.log("Saved public/client-chandra-bfs.png");
}

testFloodFillBFS().catch(console.error);
