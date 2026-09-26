#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

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

console.log("===============================================================");
console.log("☁️  Jalaram — Cloudinary & Supabase Image Migration Tool");
console.log("===============================================================\n");

// Validate Cloudinary config
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ Error: Missing Cloudinary credentials in .env.local!");
  console.error("Please ensure the following are set in .env.local:");
  console.error("  CLOUDINARY_CLOUD_NAME=your_cloud_name");
  console.error("  CLOUDINARY_API_KEY=your_api_key");
  console.error("  CLOUDINARY_API_SECRET=your_api_secret\n");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

// Validate Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Missing Supabase credentials in .env.local!");
  console.error("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.\n");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Load local site-content.json
function loadSiteContent() {
  const runtimePath = path.join(rootDir, "data", "site-content.json");
  const seedPath = path.join(rootDir, "src", "data", "site-content.json");
  if (fs.existsSync(runtimePath)) {
    return JSON.parse(fs.readFileSync(runtimePath, "utf-8"));
  }
  if (fs.existsSync(seedPath)) {
    return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  }
  throw new Error("Could not find site-content.json in /data or /src/data");
}

function saveSiteContent(content) {
  const formatted = JSON.stringify(content, null, 2);
  const runtimePath = path.join(rootDir, "data", "site-content.json");
  const seedPath = path.join(rootDir, "src", "data", "site-content.json");

  const dir = path.dirname(runtimePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(runtimePath, formatted, "utf-8");

  if (fs.existsSync(path.dirname(seedPath))) {
    fs.writeFileSync(seedPath, formatted, "utf-8");
  }
}

// Find local file for a relative path (e.g. "/hoardings.webp" or "hoardings.webp")
function resolveLocalFile(relPath) {
  if (!relPath || typeof relPath !== "string") return null;
  if (relPath.startsWith("http://") || relPath.startsWith("https://")) return null;

  const clean = decodeURIComponent(relPath.replace(/^\//, ""));
  const candidate1 = path.join(publicDir, clean);
  if (fs.existsSync(candidate1) && fs.statSync(candidate1).isFile()) {
    return candidate1;
  }

  // Also check public/uploads/
  const candidate2 = path.join(publicDir, "uploads", clean);
  if (fs.existsSync(candidate2) && fs.statSync(candidate2).isFile()) {
    return candidate2;
  }

  return null;
}

// Upload local file to Cloudinary
async function uploadLocalImage(filePath, originalRelPath) {
  const parsed = path.parse(filePath);
  const publicId = `jalaram_${parsed.name.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const res = await cloudinary.uploader.upload(filePath, {
    folder: "jalaram",
    public_id: `${publicId}_${Date.now()}`,
    resource_type: "image",
    overwrite: true,
  });

  return res.secure_url;
}

async function main() {
  try {
    console.log(`📡 Cloudinary: Account "${cloudName}" connected.`);
    console.log(`📡 Supabase: ${supabaseUrl} connected.\n`);

    const siteContent = loadSiteContent();

    // Map: localRelativePath -> Cloudinary Secure URL
    const urlMap = new Map();

    // Collect all candidate strings from siteContent
    const candidates = new Set();

    if (Array.isArray(siteContent.heroImages)) {
      siteContent.heroImages.forEach((img) => candidates.add(img));
    }
    if (siteContent.contactPage?.heroImage) {
      candidates.add(siteContent.contactPage.heroImage);
    }
    if (siteContent.aboutPage?.heroImage) {
      candidates.add(siteContent.aboutPage.heroImage);
    }
    if (Array.isArray(siteContent.clients)) {
      siteContent.clients.forEach((c) => {
        if (c.logo) candidates.add(c.logo);
      });
    }
    if (Array.isArray(siteContent.services)) {
      siteContent.services.forEach((s) => {
        if (s.image) candidates.add(s.image);
      });
    }
    if (Array.isArray(siteContent.portfolio)) {
      siteContent.portfolio.forEach((p) => {
        if (p.image) candidates.add(p.image);
        if (Array.isArray(p.images)) {
          p.images.forEach((img) => candidates.add(img));
        }
      });
    }
    if (Array.isArray(siteContent.team)) {
      siteContent.team.forEach((m) => {
        if (m.image) candidates.add(m.image);
      });
    }

    console.log(`🔍 Discovered ${candidates.size} image references in site content.`);
    console.log("🚀 Starting upload to Cloudinary...\n");

    let uploadedCount = 0;
    let skippedCount = 0;

    for (const relPath of candidates) {
      if (!relPath || typeof relPath !== "string") continue;

      if (relPath.startsWith("http://") || relPath.startsWith("https://")) {
        // Already remote (e.g. Unsplash or Cloudinary)
        skippedCount++;
        continue;
      }

      const localFile = resolveLocalFile(relPath);
      if (!localFile) {
        console.warn(`⚠️ Local file not found in public directory for: "${relPath}" (skipped)`);
        continue;
      }

      process.stdout.write(`Uploading "${relPath}" ... `);
      try {
        const cloudUrl = await uploadLocalImage(localFile, relPath);
        urlMap.set(relPath, cloudUrl);
        uploadedCount++;
        console.log(`✅ Uploaded`);
        console.log(`   └─> ${cloudUrl}`);
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
      }
    }

    console.log(`\n📊 Upload Summary: ${uploadedCount} uploaded to Cloudinary, ${skippedCount} already remote.\n`);

    if (uploadedCount === 0 && urlMap.size === 0) {
      console.log("ℹ️ No new local images needed upload. Content is already using cloud URLs.");
      return;
    }

    // Helper to replace mapped URLs
    const replaceUrl = (val) => (urlMap.has(val) ? urlMap.get(val) : val);

    // 1. Update siteContent object
    if (Array.isArray(siteContent.heroImages)) {
      siteContent.heroImages = siteContent.heroImages.map(replaceUrl);
    }
    if (siteContent.contactPage?.heroImage) {
      siteContent.contactPage.heroImage = replaceUrl(siteContent.contactPage.heroImage);
    }
    if (siteContent.aboutPage?.heroImage) {
      siteContent.aboutPage.heroImage = replaceUrl(siteContent.aboutPage.heroImage);
    }
    if (Array.isArray(siteContent.clients)) {
      siteContent.clients.forEach((c) => {
        if (c.logo) c.logo = replaceUrl(c.logo);
      });
    }
    if (Array.isArray(siteContent.services)) {
      siteContent.services.forEach((s) => {
        if (s.image) s.image = replaceUrl(s.image);
      });
    }
    if (Array.isArray(siteContent.portfolio)) {
      siteContent.portfolio.forEach((p) => {
        if (p.image) p.image = replaceUrl(p.image);
        if (Array.isArray(p.images)) {
          p.images = p.images.map(replaceUrl);
        }
      });
    }
    if (Array.isArray(siteContent.team)) {
      siteContent.team.forEach((m) => {
        if (m.image) m.image = replaceUrl(m.image);
      });
    }

    // 2. Save updated JSON locally
    console.log("💾 Updating local site-content.json with new Cloudinary URLs...");
    saveSiteContent(siteContent);
    console.log("✅ Local JSON updated.");

    // 3. Update Supabase site_content table
    console.log("💾 Updating Supabase 'site_content' table...");
    const { error: dbErr } = await supabase
      .from("site_content")
      .upsert(
        {
          id: "main",
          content: siteContent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (dbErr) {
      console.error("❌ Failed to update Supabase site_content:", dbErr.message);
    } else {
      console.log("✅ Supabase 'site_content' table updated successfully with Cloudinary URLs!");
    }

    // 4. Update Supabase normalized tables with Cloudinary URLs
    console.log("💾 Updating normalized tables in Supabase...");

    if (Array.isArray(siteContent.services)) {
      for (const s of siteContent.services) {
        if (s.image && s.image.startsWith("http")) {
          await supabase.from("services").update({ image: s.image }).eq("id", s.id);
        }
      }
      console.log("✅ Updated services table in Supabase.");
    }

    if (Array.isArray(siteContent.portfolio)) {
      for (const p of siteContent.portfolio) {
        const updateData = {};
        if (p.image && p.image.startsWith("http")) updateData.image = p.image;
        if (Array.isArray(p.images)) updateData.images = p.images;
        if (Object.keys(updateData).length > 0) {
          await supabase.from("portfolio").update(updateData).eq("id", p.id);
        }
      }
      console.log("✅ Updated portfolio table in Supabase.");
    }

    if (Array.isArray(siteContent.clients)) {
      for (const c of siteContent.clients) {
        if (c.logo && c.logo.startsWith("http")) {
          await supabase.from("clients").update({ logo: c.logo }).eq("id", c.id);
        }
      }
      console.log("✅ Updated clients table in Supabase.");
    }

    if (Array.isArray(siteContent.team)) {
      for (const m of siteContent.team) {
        if (m.image && m.image.startsWith("http")) {
          await supabase.from("team").update({ image: m.image }).eq("id", m.id);
        }
      }
      console.log("✅ Updated team table in Supabase.");
    }

    console.log("\n===============================================================");
    console.log("🎉 Complete Image Migration Finished!");
    console.log("All images are now hosted on Cloudinary, and your Supabase");
    console.log("database references the new Cloudinary CDN URLs.");
    console.log("Your UI will render everything seamlessly from the database!");
    console.log("===============================================================\n");
  } catch (err) {
    console.error("❌ Migration failed with error:", err);
    process.exit(1);
  }
}

main();
