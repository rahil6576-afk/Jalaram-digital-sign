import fs from "fs";
import path from "path";
import sharp from "sharp";
import { removeBackgroundFloodFill } from "./process-all-logos.mjs";

const userDir = "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/";

async function testAllSpecial() {
  // 1. CHANDRA
  console.log("Processing Chandra...");
  const chandraBuf = fs.readFileSync(userDir + "media_1790394444728.png");
  // Chandra has dark background around [48, 47, 47].
  // Text "chandra" is white. We want dark background transparent, and white text turned dark #111827.
  const chandraPipe = await removeBackgroundFloodFill({
    inputBuffer: chandraBuf,
    bgColors: [
      [48, 47, 47],
      [49, 103, 124],
      [129, 129, 132],
      [47, 46, 45],
      [35, 35, 35],
      [20, 20, 20],
      [60, 60, 60]
    ],
    tolerance: 55,
    customTransform: (data, pIdx, x, y, w, h) => {
      // In foreground: if pixel is white or near white (the 'chandra' text), change to dark grey #1a1a1a
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      // Yellow oval has high red (~245) and high green (~195), low blue (~0..30)
      const isYellow = r > 180 && g > 150 && b < 100;
      const isRed = r > 180 && g < 80 && b < 80;
      const isNearWhite = r > 200 && g > 200 && b > 200;
      if (isNearWhite && !isYellow && !isRed) {
        data[pIdx] = 20;
        data[pIdx + 1] = 20;
        data[pIdx + 2] = 20;
      }
    }
  });
  await chandraPipe.webp({ quality: 95 }).toFile("public/client-chandra.webp");
  console.log("Saved public/client-chandra.webp");

  // 2. KABIR WORLD
  console.log("Processing Kabir World...");
  const kabirBuf = fs.readFileSync(userDir + "media_1790394489005.png");
  const kabirPipe = await removeBackgroundFloodFill({
    inputBuffer: kabirBuf,
    bgColors: [[24, 24, 24], [20, 20, 20], [30, 30, 30]],
    tolerance: 30,
    customTransform: (data, pIdx, x, y, w, h) => {
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      // If white text (KABIR WORLD / A VENTURE OF / PVT LTD) in the text area (x > 75), turn dark
      if (x > 75 && r > 180 && g > 180 && b > 180) {
        data[pIdx] = 20;
        data[pIdx + 1] = 20;
        data[pIdx + 2] = 20;
      }
    }
  });
  await kabirPipe.webp({ quality: 95 }).toFile("public/client-kabir-world.webp");
  console.log("Saved public/client-kabir-world.webp");

  // 3. SPAN INFRASTRUCTURE
  console.log("Processing Span Infrastructure...");
  const spanBuf = fs.readFileSync(userDir + "media_1790395557945.png");
  // Cyan background [0, 176, 239].
  // Inside is white ribbon S and white text SPAN INFRASTRUCTURE.
  // We want cyan background removed, and the white ribbon & text turned brand cyan [0, 168, 236]!
  const spanPipe = await removeBackgroundFloodFill({
    inputBuffer: spanBuf,
    bgColors: [[0, 176, 239]],
    tolerance: 35,
    customTransform: (data, pIdx, x, y, w, h) => {
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      // Turn the white logo elements into vibrant brand cyan
      if (r > 200 && g > 200 && b > 200) {
        data[pIdx] = 0;
        data[pIdx + 1] = 168;
        data[pIdx + 2] = 236;
      }
    }
  });
  await spanPipe.webp({ quality: 95 }).toFile("public/client-span-infrastructure.webp");
  console.log("Saved public/client-span-infrastructure.webp");

  // 4. RIVERA
  console.log("Processing Rivera...");
  const riveraBuf = fs.readFileSync("public/rivera.jpg");
  const riveraPipe = await removeBackgroundFloodFill({
    inputBuffer: riveraBuf,
    bgColors: [[235, 237, 236]],
    tolerance: 30,
  });
  await riveraPipe.webp({ quality: 95 }).toFile("public/client-rivera.webp");
  console.log("Saved public/client-rivera.webp");

  // 5. BHARATIYA SENA (clean 2px black artifact at bottom)
  console.log("Processing Bharatiya Sena...");
  const senaMeta = await sharp("public/bharitya sena.jpg").metadata();
  const senaCroppedBuf = await sharp("public/bharitya sena.jpg")
    .extract({ left: 0, top: 0, width: senaMeta.width, height: senaMeta.height - 4 })
    .toBuffer();
  const senaPipe = await removeBackgroundFloodFill({
    inputBuffer: senaCroppedBuf,
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  });
  await senaPipe.webp({ quality: 95 }).toFile("public/client-bharatiya-sena.webp");
  console.log("Saved public/client-bharatiya-sena.webp");
}

testAllSpecial().catch(console.error);
