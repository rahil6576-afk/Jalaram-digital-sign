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

async function main() {
  console.log("Uploading Kabir World to Cloudinary...");
  const kabirRes = await cloudinary.uploader.upload(path.join(rootDir, "public/client-kabir-world.webp"), {
    folder: "jalaram",
    public_id: `jalaram_client-kabir-world_clean_${Date.now()}`,
    resource_type: "image",
  });
  console.log("Uploaded Kabir World:", kabirRes.secure_url);

  console.log("Uploading Chandra to Cloudinary...");
  const chandraRes = await cloudinary.uploader.upload(path.join(rootDir, "public/client-chandra.webp"), {
    folder: "jalaram",
    public_id: `jalaram_client-chandra_clean_${Date.now()}`,
    resource_type: "image",
  });
  console.log("Uploaded Chandra:", chandraRes.secure_url);

  // Update site-content.json in both locations:
  const contentPaths = [
    path.join(rootDir, "src/data/site-content.json"),
    path.join(rootDir, "data/site-content.json"),
  ];

  for (const cp of contentPaths) {
    if (fs.existsSync(cp)) {
      const data = JSON.parse(fs.readFileSync(cp, "utf-8"));
      if (data.clients && Array.isArray(data.clients)) {
        for (const client of data.clients) {
          if (client.id === "client-kabir-world") {
            client.logo = kabirRes.secure_url;
            console.log(`Updated Kabir World in ${cp}`);
          } else if (client.id === "client-chandra") {
            client.logo = chandraRes.secure_url;
            console.log(`Updated Chandra in ${cp}`);
          }
        }
        fs.writeFileSync(cp, JSON.stringify(data, null, 2), "utf-8");
      }
    }
  }

  console.log("Done updating local site-content files!");
}

main().catch(console.error);
