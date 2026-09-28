import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

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

const serviceImageSources = {
  "roll-up-standee": "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200&auto=format&fit=crop",
  "sign-board": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop",
  "3d-letter-signage": "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200&auto=format&fit=crop",
  "posters": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop",
  "stickers-and-labels": "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=1200&auto=format&fit=crop",
  "pamphlet-flyer-printing": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1200&auto=format&fit=crop",
  "visiting-cards": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop",
  "letterheads": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200&auto=format&fit=crop",
  "invitation-cards": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
  "name-plates-acrylic-ss": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop",
  "vehicle-graphics": "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1200&auto=format&fit=crop",
  "bag-printing": "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop",
  "graphic-designing": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop",
  "installation-services": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
  "frosted-film": "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
  "banner-printing": "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop"
};

async function main() {
  console.log("☁️  Uploading service images to Cloudinary...");
  const results = {};

  for (const [key, remoteUrl] of Object.entries(serviceImageSources)) {
    try {
      process.stdout.write(`Uploading ${key}... `);
      const res = await cloudinary.uploader.upload(remoteUrl, {
        folder: "jalaram/services",
        public_id: `jalaram_service_${key}`,
        resource_type: "image",
        overwrite: true,
      });
      results[key] = res.secure_url;
      console.log(`✅ ${res.secure_url}`);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      // fallback to original unsplash url
      results[key] = remoteUrl;
    }
  }

  const outPath = path.join(rootDir, "data", "services-cloudinary-urls.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`Saved results to ${outPath}`);
}

main().catch(console.error);
