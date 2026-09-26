import fs from "fs";
import path from "path";
import sharp from "sharp";
import { removeBackgroundFloodFill } from "./process-all-logos.mjs";

const userDir = "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/";

const logoSpecs = [
  // 1. Sports Authority of Gujarat
  {
    id: "client-sag",
    name: "Sports Authority of Gujarat",
    tag: "Government of Gujarat",
    src: "public/411941-sports-authority-of-gujarat.jpg",
    dest: "public/client-sports-authority-gujarat.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 2. Advance Hospital
  {
    id: "client-advance-hospital",
    name: "Advance Hospital",
    tag: "Healthcare & Multispeciality",
    src: "public/advance hospital.png",
    dest: "public/client-advance-hospital.webp",
    alreadyTransparent: true,
  },
  // 3. Indian Army
  {
    id: "client-indian-army",
    name: "Indian Army (Bharatiya Sena)",
    tag: "Ministry of Defence",
    src: "public/bharitya sena.jpg",
    dest: "public/client-bharatiya-sena.webp",
    cropBottom: 4,
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 4. BSF
  {
    id: "client-bsf",
    name: "Border Security Force (BSF)",
    tag: "Ministry of Home Affairs",
    src: "public/bsf.jpg",
    dest: "public/client-bsf.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
    maxDim: 800,
  },
  // 5. Dholera SIR
  {
    id: "client-dholera-sir",
    name: "Dholera SIR",
    tag: "Special Investment Region",
    src: "public/dholera.png",
    dest: "public/client-dholera-sir.webp",
    alreadyTransparent: true,
  },
  // 6. GEER Foundation
  {
    id: "client-geer-foundation",
    name: "GEER Foundation",
    tag: "Forest & Environment Dept., Gujarat",
    src: "public/geer.jpg",
    dest: "public/client-geer-foundation.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 7. GSPC
  {
    id: "client-gspc",
    name: "Gujarat State Petroleum Corp. (GSPC)",
    tag: "Energy & Gas Infrastructure",
    src: "public/gspc-inner-logo.png",
    dest: "public/client-gspc.webp",
    alreadyTransparent: true,
  },
  // 8. The Leela
  {
    id: "client-the-leela",
    name: "The Leela Gandhinagar",
    tag: "Luxury Hospitality & Hotels",
    src: "public/leela.jpg",
    dest: "public/client-the-leela.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 9. Jaliyan Jewellers
  {
    id: "client-jaliyan-jewellers",
    name: "Jaliyan Jewellers",
    tag: "Fine Jewellery & Gold",
    src: "public/jaliyan jwellers.png",
    dest: "public/client-jaliyan-jewellers.webp",
    bgColors: [[255, 255, 255], [254, 255, 255]],
    tolerance: 35,
  },
  // 10. Gujarat Police
  {
    id: "client-gujarat-police",
    name: "Gujarat Police",
    tag: "Law Enforcement & Public Safety",
    src: "public/police.png",
    dest: "public/client-gujarat-police.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 11. Raksha Shakti University
  {
    id: "client-raksha-shakti",
    name: "Rashtriya Raksha University",
    tag: "National Security & Police University",
    src: "public/rakhsha.jpg",
    dest: "public/client-raksha-shakti.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
    maxDim: 800,
  },
  // 12. Rivera
  {
    id: "client-rivera",
    name: "Rivera",
    tag: "Real Estate & Infrastructure",
    src: "public/rivera.jpg",
    dest: "public/client-rivera.webp",
    bgColors: [[235, 237, 236]],
    tolerance: 30,
  },
  // 13. Sports Authority of India (SAI)
  {
    id: "client-sai",
    name: "Sports Authority of India (SAI)",
    tag: "Ministry of Youth Affairs & Sports",
    src: "public/sai.jpg",
    dest: "public/client-sai.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 14. State Bank of India (SBI)
  {
    id: "client-sbi",
    name: "State Bank of India (SBI)",
    tag: "Premier Banking & Financial Institution",
    src: "public/sbi.jpg",
    dest: "public/client-sbi.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
    maxDim: 800,
  },
  // 15. Tata AIA Life
  {
    id: "client-tata-aia",
    name: "Tata AIA Life Insurance",
    tag: "Life Insurance & Wealth Solutions",
    src: "public/tata aia.jpg",
    dest: "public/client-tata-aia.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 16. Indian Air Force (Bharatiya Vayu Sena)
  {
    id: "client-indian-air-force",
    name: "Indian Air Force (Bharatiya Vayu Sena)",
    tag: "Armed Forces of India",
    src: "public/vayu sena.jpg",
    dest: "public/client-indian-air-force.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
    maxDim: 800,
  },
  // 17. UGVCL
  {
    id: "client-ugvcl",
    name: "UGVCL (Uttar Gujarat Vij Company)",
    tag: "Power Distribution Utility",
    src: "public/ugvcl.jpg",
    dest: "public/client-ugvcl.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 18. Chandra
  {
    id: "client-chandra",
    name: "Chandra",
    tag: "Premium Consumer Brand",
    src: userDir + "media_1790394444728.png",
    dest: "public/client-chandra.webp",
    bgColors: [
      [48, 47, 47],
      [49, 103, 124],
      [129, 129, 132],
      [47, 46, 45],
      [35, 35, 35],
      [20, 20, 20],
      [60, 60, 60],
    ],
    tolerance: 55,
    customTransform: (data, pIdx, x, y, w, h) => {
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      const isYellow = r > 180 && g > 150 && b < 100;
      const isRed = r > 180 && g < 80 && b < 80;
      const isNearWhite = r > 200 && g > 200 && b > 200;
      if (isNearWhite && !isYellow && !isRed) {
        data[pIdx] = 20;
        data[pIdx + 1] = 20;
        data[pIdx + 2] = 20;
      }
    },
  },
  // 19. Kabir World
  {
    id: "client-kabir-world",
    name: "Kabir World",
    tag: "A Venture of Kabir Technologies",
    src: userDir + "media_1790394489005.png",
    dest: "public/client-kabir-world.webp",
    bgColors: [[24, 24, 24], [20, 20, 20], [30, 30, 30]],
    tolerance: 30,
    customTransform: (data, pIdx, x, y, w, h) => {
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      if (x > 75 && r > 180 && g > 180 && b > 180) {
        data[pIdx] = 20;
        data[pIdx + 1] = 20;
        data[pIdx + 2] = 20;
      }
    },
  },
  // 20. Jayantilal Chikkiwala
  {
    id: "client-jayantilal-chikkiwala",
    name: "Jayantilal Chikkiwala",
    tag: "Traditional Confectionery & Sweets",
    src: userDir + "media_1790394807401.png",
    dest: "public/client-jayantilal-chikkiwala.webp",
    bgColors: [[255, 255, 255]],
    tolerance: 35,
  },
  // 21. Safal ICON
  {
    id: "client-safal-icon",
    name: "Safal Icon",
    tag: "Commercial Real Estate & Spaces",
    src: userDir + "media_1790395265095.png",
    dest: "public/client-safal-icon.webp",
    bgColors: [[255, 255, 255], [235, 236, 240]],
    tolerance: 35,
  },
  // 22. Span Infrastructure
  {
    id: "client-span-infrastructure",
    name: "Span Infrastructure",
    tag: "Infrastructure & Commercial Builders",
    src: userDir + "media_1790395557945.png",
    dest: "public/client-span-infrastructure.webp",
    bgColors: [[0, 176, 239]],
    tolerance: 35,
    customTransform: (data, pIdx, x, y, w, h) => {
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      if (r > 200 && g > 200 && b > 200) {
        data[pIdx] = 0;
        data[pIdx + 1] = 168;
        data[pIdx + 2] = 236;
      }
    },
  },
];

async function run() {
  console.log(`Starting processing of ${logoSpecs.length} client logos...`);

  for (const item of logoSpecs) {
    console.log(`Processing: ${item.name} (${item.src})...`);
    let inputBuffer = fs.readFileSync(item.src);

    if (item.cropBottom) {
      const meta = await sharp(inputBuffer).metadata();
      inputBuffer = await sharp(inputBuffer)
        .extract({ left: 0, top: 0, width: meta.width, height: meta.height - item.cropBottom })
        .toBuffer();
    }

    const maxDimension = item.maxDim || 800;
    const meta = await sharp(inputBuffer).metadata();
    if (meta.width > maxDimension || meta.height > maxDimension) {
      inputBuffer = await sharp(inputBuffer)
        .resize({ width: maxDimension, height: maxDimension, fit: "inside" })
        .toBuffer();
    }

    let pipeline;
    if (item.alreadyTransparent) {
      // Just trim transparent padding and convert to crisp webp
      pipeline = sharp(inputBuffer).trim();
    } else {
      pipeline = await removeBackgroundFloodFill({
        inputBuffer,
        bgColors: item.bgColors || [[255, 255, 255]],
        tolerance: item.tolerance || 35,
        edgeFeather: true,
        customTransform: item.customTransform || null,
      });
    }

    // Add a balanced subtle 12px transparent margin so logos don't stick to boundary
    const withMargin = await pipeline
      .extend({
        top: 12,
        bottom: 12,
        left: 14,
        right: 14,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 95 })
      .toFile(item.dest);

    console.log(`✓ Saved ${item.dest} (${withMargin.width}x${withMargin.height})`);
  }

  console.log("All logos processed successfully!");
}

run().catch((err) => {
  console.error("Error processing logos:", err);
  process.exit(1);
});
