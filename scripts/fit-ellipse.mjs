import sharp from "sharp";

async function findBoundary() {
  const { data, info } = await sharp('C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png')
    .raw().toBuffer({ resolveWithObject: true });

  const getPixel = (x, y) => {
    if (x < 0 || x >= info.width || y < 0 || y >= info.height) return [0, 0, 0];
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  const isYellow = (r, g, b) => r > 180 && g > 140 && b < 80;

  // Let's raycast from center (97, 60) in 360 directions, finding the outermost yellow pixel
  const cx = 97.0;
  const cy = 60.0;
  const borderPts = [];

  for (let deg = 0; deg < 360; deg += 2) {
    const rad = deg * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Raycast from dist=90 down to 0, find first yellow
    let found = null;
    for (let dist = 80; dist >= 10; dist -= 0.5) {
      const x = Math.round(cx + dist * cos);
      const y = Math.round(cy + dist * sin);
      // Skip text area (y > 90) when raycasting downward because white text overlaps
      if (y > 88) continue;
      const [r, g, b] = getPixel(x, y);
      if (isYellow(r, g, b)) {
        found = { x, y, deg, dist };
        break;
      }
    }
    if (found) {
      borderPts.push(found);
    }
  }

  console.log("Found border points count (top/sides):", borderPts.length);

  // Let's find angle, rx, ry by grid search over (angle, rx, ry, cx, cy)
  let bestScore = Infinity;
  let bestParams = null;

  for (let testAngle = -26; testAngle <= -16; testAngle += 0.25) {
    const rad = testAngle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    for (let testRx = 36; testRx <= 41; testRx += 0.25) {
      for (let testRy = 50; testRy <= 56; testRy += 0.25) {
        for (let testCx = 96; testCx <= 100; testCx += 0.25) {
          for (let testCy = 56; testCy <= 60; testCy += 0.25) {
            let error = 0;
            for (const p of borderPts) {
              const dx = p.x - testCx;
              const dy = p.y - testCy;
              const ex = (dx * cos + dy * sin) / testRx;
              const ey = (-dx * sin + dy * cos) / testRy;
              const distFromEllipse = Math.abs(Math.hypot(ex, ey) - 1.0);
              error += distFromEllipse * distFromEllipse;
            }
            if (error < bestScore) {
              bestScore = error;
              bestParams = { testCx, testCy, testAngle, testRx, testRy, error: Math.sqrt(error / borderPts.length) };
            }
          }
        }
      }
    }
  }

  console.log("Best fitted ellipse:", bestParams);
}

findBoundary();
