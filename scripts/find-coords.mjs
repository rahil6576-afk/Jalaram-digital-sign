import sharp from "sharp";

async function main() {
  const { data, info } = await sharp('C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png')
    .raw().toBuffer({ resolveWithObject: true });
  
  console.log("Chandra width, height:", info.width, info.height);

  // Background sampling:
  // Top left (5, 5)
  const getPixel = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  console.log("Top-left bg:", getPixel(5, 5));
  console.log("Bottom-left bg:", getPixel(5, 120));
  console.log("Top-right bg:", getPixel(280, 5));
  console.log("Bottom-right bg:", getPixel(280, 120));

  // Find all yellow pixels (r > 180, g > 140, b < 60)
  let yellowPts = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const [r, g, b] = getPixel(x, y);
      if (r > 200 && g > 160 && b < 60) {
        yellowPts.push({ x, y });
      }
    }
  }

  const yMinX = Math.min(...yellowPts.map(p => p.x));
  const yMaxX = Math.max(...yellowPts.map(p => p.x));
  const yMinY = Math.min(...yellowPts.map(p => p.y));
  const yMaxY = Math.max(...yellowPts.map(p => p.y));

  console.log("Yellow extent:", { yMinX, yMaxX, yMinY, yMaxY, cx: (yMinX + yMaxX)/2, cy: (yMinY + yMaxY)/2 });

  // Analyze text "chandra"
  // Let's inspect rows y: 80..126
  let textPts = [];
  for (let y = 80; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const [r, g, b] = getPixel(x, y);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 120) {
        textPts.push({ x, y });
      }
    }
  }
  const tMinX = Math.min(...textPts.map(p => p.x));
  const tMaxX = Math.max(...textPts.map(p => p.x));
  const tMinY = Math.min(...textPts.map(p => p.y));
  const tMaxY = Math.max(...textPts.map(p => p.y));
  console.log("Text 'chandra' extent:", { tMinX, tMaxX, tMinY, tMaxY, w: tMaxX - tMinX, h: tMaxY - tMinY });
}
main();
