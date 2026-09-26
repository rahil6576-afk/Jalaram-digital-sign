import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

// 1. Load .env.local
function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function getAllFiles(dir, filter, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      getAllFiles(p, filter, list);
    } else if (filter.test(item)) {
      list.push(p);
    }
  }
  return list;
}

async function uploadFile(filePath) {
  const parsed = path.parse(filePath);
  const cleanBase = parsed.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const publicId = `jalaram_${cleanBase}_${Date.now()}`;

  const res = await cloudinary.uploader.upload(filePath, {
    folder: "jalaram",
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
  });

  return res.secure_url;
}

async function run() {
  console.log("☁️  Uploading ALL images from public/ to Cloudinary...");
  const allImages = getAllFiles(publicDir, /\.(png|jpe?g|webp)$/i);
  console.log(`Found ${allImages.length} images in public directory.\n`);

  const manifestPath = path.join(rootDir, "data", "cloudinary-manifest.json");
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {}
  }

  let uploaded = 0;
  for (const imgPath of allImages) {
    const rel = "/" + path.relative(publicDir, imgPath).replace(/\\/g, "/");
    if (manifest[rel]) {
      console.log(`✓ Already in manifest: ${rel}`);
      continue;
    }

    try {
      process.stdout.write(`Uploading ${rel}... `);
      const url = await uploadFile(imgPath);
      manifest[rel] = url;
      uploaded++;
      console.log(`✅ ${url}`);
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n🎉 Uploaded ${uploaded} new images to Cloudinary.`);
  console.log(`Manifest saved with ${Object.keys(manifest).length} total Cloudinary URLs.`);
}

run().catch(console.error);
