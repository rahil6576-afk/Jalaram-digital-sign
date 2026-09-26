import fs from "fs";
import path from "path";
import sharp from "sharp";

const files = [
  { name: "sports-authority-gujarat", file: "411941-sports-authority-of-gujarat.jpg", title: "Sports Authority of Gujarat" },
  { name: "advance-hospital", file: "advance hospital.png", title: "Advance Hospital" },
  { name: "bharatiya-sena", file: "bharitya sena.jpg", title: "Bharatiya Sena (Indian Army)" },
  { name: "bsf", file: "bsf.jpg", title: "Border Security Force (BSF)" },
  { name: "dholera-sir", file: "dholera.png", title: "Dholera SIR" },
  { name: "geer-foundation", file: "geer.jpg", title: "GEER Foundation" },
  { name: "gspc", file: "gspc-inner-logo.png", title: "Gujarat State Petroleum Corporation (GSPC)" },
  { name: "the-leela", file: "leela.jpg", title: "The Leela Gandhinagar" },
  { name: "jaliyan-jewellers", file: "jaliyan jwellers.png", title: "Jaliyan Jewellers" },
  { name: "gujarat-police", file: "police.png", title: "Gujarat Police" },
  { name: "raksha-shakti", file: "rakhsha.jpg", title: "Raksha Shakti University" },
  { name: "rivera", file: "rivera.jpg", title: "Rivera" },
  { name: "sai", file: "sai.jpg", title: "Sports Authority of India (SAI)" },
  { name: "sbi", file: "sbi.jpg", title: "State Bank of India (SBI)" },
  { name: "tata-aia", file: "tata aia.jpg", title: "Tata AIA Life Insurance" },
  { name: "vayu-sena", file: "vayu sena.jpg", title: "Indian Air Force (Bharatiya Vayu Sena)" },
  { name: "ugvcl", file: "ugvcl.jpg", title: "UGVCL" },
  { name: "chandra", file: "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394444728.png", title: "Chandra" },
  { name: "kabir-world", file: "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394807401.png", title: "Kabir World" }, // Wait, let's verify media mapping
  { name: "jayantilal-chikkiwala", file: "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790394489005.png", title: "Jayantilal Chikkiwala" },
  { name: "safal-icon", file: "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790395265095.png", title: "Safal Icon" },
  { name: "span-infrastructure", file: "C:/Users/RAHIL SUTARIA/.gemini/antigravity-ide/brain/9d2b07a1-e43f-4f77-a4a4-e9db8e26835b/.user_uploaded/media_1790395557945.png", title: "Span Infrastructure" }
];

async function inspect() {
  for (const item of files) {
    const srcPath = item.file.includes(":") ? item.file : path.join(process.cwd(), "public", item.file);
    if (!fs.existsSync(srcPath)) {
      console.log("NOT FOUND:", srcPath);
      continue;
    }
    const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const getP = (x, y) => {
      const idx = (y * info.width + x) * 4;
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    };
    const c1 = getP(0, 0);
    const c2 = getP(info.width - 1, 0);
    const c3 = getP(0, info.height - 1);
    const c4 = getP(info.width - 1, info.height - 1);
    console.log(item.name.padEnd(25), `[${info.width}x${info.height}]`, "Corners:", c1, c2, c3, c4);
  }
}
inspect();
