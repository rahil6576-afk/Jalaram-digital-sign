import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import defaultSiteData from "@/data/site-content.json";

export const dynamic = "force-dynamic";

interface ServiceItem {
  id: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  category?: string;
  features?: string[];
  featured?: boolean;
  sortOrder?: number;
}

export async function GET() {
  return handleSync();
}

export async function POST() {
  return handleSync();
}

async function handleSync() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Supabase credentials are not configured in .env.local",
      });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: "Failed to initialize Supabase admin client",
      });
    }

    // 1. Get current services from runtime JSON or Supabase site_content
    const runtimePath = path.join(process.cwd(), "data", "site-content.json");
    let services: ServiceItem[] = [];

    if (fs.existsSync(runtimePath)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(runtimePath, "utf-8"));
        if (Array.isArray(fileData.services)) {
          services = fileData.services;
        }
      } catch {}
    }

    if (services.length === 0) {
      const { data: siteRow } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      if (siteRow?.content && Array.isArray(siteRow.content.services)) {
        services = siteRow.content.services;
      }
    }

    if (services.length === 0 && Array.isArray(defaultSiteData.services)) {
      services = defaultSiteData.services as ServiceItem[];
    }

    // 2. Format all current services with clean, unique slugs
    const seenSlugs = new Set<string>();
    const rows = services.map((s, idx) => {
      const idStr = String(s.id);
      let baseSlug = (s.slug && s.slug.trim())
        ? s.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : (s.title || `service-${idStr}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      if (!baseSlug) baseSlug = `service-${idStr}`;

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (seenSlugs.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${idStr || counter}`;
        counter++;
      }
      seenSlugs.add(uniqueSlug);

      return {
        id: idStr,
        slug: uniqueSlug,
        title: s.title || "Untitled Service",
        short_description: s.shortDescription || "",
        description: s.description || "",
        image: s.image || "",
        category: s.category || "",
        features: Array.isArray(s.features) ? s.features : [],
        featured: Boolean(s.featured),
        sort_order: typeof s.sortOrder === "number" ? s.sortOrder : idx + 1,
      };
    });

    // 3. Clear old/conflicting rows from 'services' table to prevent slug collisions
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .neq("id", "___NEVER_MATCH___");

    if (deleteError) {
      console.warn("Notice clearing old services rows:", deleteError.message);
    }

    // 4. Insert all current services into 'services' table
    const { error: insertError } = await supabase
      .from("services")
      .insert(rows);

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: insertError.message,
      }, { status: 500 });
    }

    // 5. Query back all rows
    const { data: finalRows, count } = await supabase
      .from("services")
      .select("id, title, category, image", { count: "exact" })
      .order("sort_order", { ascending: true });

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${rows.length} services to Supabase 'services' table!`,
      totalInDatabase: count ?? finalRows?.length ?? rows.length,
      services: finalRows,
    });


  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
