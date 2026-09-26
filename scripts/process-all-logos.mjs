import fs from "fs";
import path from "path";
import sharp from "sharp";

// Helper: Color distance
function colorDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

// Robust Flood Fill Background Remover
async function removeBackgroundFloodFill({
  inputBuffer,
  bgColors = [[255, 255, 255]],
  tolerance = 35,
  edgeFeather = true,
  customTransform = null,
}) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const isBg = new Uint8Array(w * h); // 1 = background, 0 = foreground
  const visited = new Uint8Array(w * h);

  const isColorMatch = (r, g, b, a) => {
    if (a < 20) return true; // already transparent
    for (const bg of bgColors) {
      if (colorDist(r, g, b, bg[0], bg[1], bg[2]) <= tolerance) {
        return true;
      }
    }
    return false;
  };

  const queue = new Int32Array(w * h * 2);
  let qHead = 0;
  let qTail = 0;

  const push = (x, y) => {
    const idx = y * w + x;
    if (!visited[idx]) {
      visited[idx] = 1;
      const pIdx = idx * 4;
      if (isColorMatch(data[pIdx], data[pIdx + 1], data[pIdx + 2], data[pIdx + 3])) {
        isBg[idx] = 1;
        queue[qTail++] = x;
        queue[qTail++] = y;
      }
    }
  };

  // Seed from all 4 borders
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  // BFS flood fill
  while (qHead < qTail) {
    const x = queue[qHead++];
    const y = queue[qHead++];

    // 4 neighbors
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (let i = 0; i < 4; i++) {
      const nx = neighbors[i][0];
      const ny = neighbors[i][1];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          const pIdx = nIdx * 4;
          if (isColorMatch(data[pIdx], data[pIdx + 1], data[pIdx + 2], data[pIdx + 3])) {
            isBg[nIdx] = 1;
            queue[qTail++] = nx;
            queue[qTail++] = ny;
          }
        }
      }
    }
  }

  // Now create output buffer
  const outData = Buffer.from(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pIdx = idx * 4;
      if (isBg[idx]) {
        outData[pIdx + 3] = 0; // Transparent
      } else if (edgeFeather) {
        // Check if adjacent to background for smooth alpha feathering
        let hasBgNeighbor = false;
        if (
          (x > 0 && isBg[idx - 1]) ||
          (x < w - 1 && isBg[idx + 1]) ||
          (y > 0 && isBg[idx - w]) ||
          (y < h - 1 && isBg[idx + w])
        ) {
          hasBgNeighbor = true;
        }

        if (hasBgNeighbor) {
          // If close to white, feather alpha
          const r = outData[pIdx];
          const g = outData[pIdx + 1];
          const b = outData[pIdx + 2];
          const brightness = (r + g + b) / 3;
          if (brightness > 220) {
            const alphaFactor = Math.max(0, (255 - brightness) / 35);
            outData[pIdx + 3] = Math.round(outData[pIdx + 3] * alphaFactor);
          }
        }
      }

      if (customTransform && outData[pIdx + 3] > 0) {
        customTransform(outData, pIdx, x, y, w, h);
      }
    }
  }

  // Trim transparent pixels and return sharp pipeline
  let pipeline = sharp(outData, {
    raw: { width: w, height: h, channels: 4 },
  }).trim();

  return pipeline;
}

export { removeBackgroundFloodFill };
