#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Manually parse .env.local if present
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("===============================================================");
console.log("🚀 Jalaram Digital Sign — Supabase Migration Tool");
console.log("===============================================================\n");

if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http")) {
  console.error("❌ Error: Missing Supabase credentials!");
  console.error("Please add the following to your .env.local file:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n");
  console.error("Then run: npm run db:migrate\n");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper to find and read JSON file
function readJson(filename) {
  const primary = path.join(rootDir, "data", filename);
  const fallback = path.join(rootDir, "src", "data", filename);
  const target = fs.existsSync(primary) ? primary : fallback;
  if (!fs.existsSync(target)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(target, "utf-8"));
}

async function migrate() {
  try {
    console.log(`Connecting to Supabase at: ${supabaseUrl}...`);

    // ── 1. Migrate Site Content ──────────────────────────────────────────────
    const siteContent = readJson("site-content.json");
    if (siteContent) {
      console.log("\n📦 Migrating site content (Business, Services, Team, Reviews, FAQs, Clients)...");
      const { error: contentErr } = await supabase
        .from("site_content")
        .upsert(
          {
            id: "main",
            content: siteContent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (contentErr) {
        console.error("⚠️ Failed to write to 'site_content' table:", contentErr.message);
        console.log("💡 Tip: Make sure you ran supabase/schema.sql in your Supabase SQL editor first!");
      } else {
        console.log("✅ Successfully transferred site content to table 'site_content'!");
      }

      // ── 2. Optionally migrate normalized tables ──────────────────────────
      if (Array.isArray(siteContent.services) && siteContent.services.length > 0) {
        const servicesPayload = siteContent.services.map((s) => ({
          id: s.id,
          slug: s.slug || null,
          title: s.title,
          short_description: s.shortDescription || null,
          description: s.description || null,
          image: s.image || null,
          category: s.category || null,
          features: s.features || [],
          featured: Boolean(s.featured),
          sort_order: s.sortOrder || 0,
        }));
        const { error } = await supabase.from("services").upsert(servicesPayload, { onConflict: "id" });
        if (!error) console.log(`✅ Normalized: Transferred ${servicesPayload.length} services`);
      }

      if (Array.isArray(siteContent.team) && siteContent.team.length > 0) {
        const teamPayload = siteContent.team.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          bio: m.bio || null,
          image: m.image || null,
          social_links: m.socialLinks || {},
          sort_order: m.sortOrder || 0,
        }));
        const { error } = await supabase.from("team").upsert(teamPayload, { onConflict: "id" });
        if (!error) console.log(`✅ Normalized: Transferred ${teamPayload.length} team members`);
      }

      if (Array.isArray(siteContent.testimonials) && siteContent.testimonials.length > 0) {
        const testimonialsPayload = siteContent.testimonials.map((t) => ({
          id: t.id,
          name: t.name,
          business: t.business || null,
          quote: t.quote,
          rating: t.rating || 5,
        }));
        const { error } = await supabase.from("testimonials").upsert(testimonialsPayload, { onConflict: "id" });
        if (!error) console.log(`✅ Normalized: Transferred ${testimonialsPayload.length} testimonials`);
      }

      if (Array.isArray(siteContent.faqs) && siteContent.faqs.length > 0) {
        const faqsPayload = siteContent.faqs.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        }));
        const { error } = await supabase.from("faqs").upsert(faqsPayload, { onConflict: "id" });
        if (!error) console.log(`✅ Normalized: Transferred ${faqsPayload.length} FAQs`);
      }

      if (Array.isArray(siteContent.clients) && siteContent.clients.length > 0) {
        const clientsPayload = siteContent.clients.map((c) => ({
          id: c.id,
          name: c.name,
          tag: c.tag || null,
          logo: c.logo || null,
        }));
        const { error } = await supabase.from("clients").upsert(clientsPayload, { onConflict: "id" });
        if (!error) console.log(`✅ Normalized: Transferred ${clientsPayload.length} clients`);
      }
    } else {
      console.warn("⚠️ No site-content.json file found to migrate.");
    }

    // ── 3. Migrate Inquiries ────────────────────────────────────────────────
    const inquiries = readJson("inquiries.json");
    if (Array.isArray(inquiries) && inquiries.length > 0) {
      console.log(`\n📨 Migrating ${inquiries.length} customer inquiries...`);
      const inquiriesPayload = inquiries.map((inq) => ({
        id: inq.id,
        name: inq.name,
        phone: inq.phone,
        email: inq.email || null,
        company: inq.company || null,
        service: inq.service || null,
        message: inq.message,
        status: inq.status || "new",
        notes: inq.notes || null,
        created_at: inq.createdAt || new Date().toISOString(),
      }));

      const { error: inqErr } = await supabase
        .from("inquiries")
        .upsert(inquiriesPayload, { onConflict: "id" });

      if (inqErr) {
        console.error("⚠️ Failed to write inquiries table:", inqErr.message);
      } else {
        console.log(`✅ Successfully transferred ${inquiries.length} inquiries to table 'inquiries'!`);
      }
    } else {
      console.log("ℹ️ No existing inquiries found in local JSON files.");
    }

    console.log("\n===============================================================");
    console.log("🎉 Migration completed successfully!");
    console.log("Your project is now fully synchronized with Supabase.");
    console.log("===============================================================\n");
  } catch (err) {
    console.error("Migration failed with error:", err);
    process.exit(1);
  }
}

migrate();
