import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import defaultSiteData from "@/data/site-content.json";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const RUNTIME_CONTENT_PATH = path.join(process.cwd(), "data", "site-content.json");
const SEED_CONTENT_PATH = path.join(process.cwd(), "src", "data", "site-content.json");

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FIXED_ADDRESS = "G-24, 25, 26, 31, Sector 11, Gandhinagar, Gujarat 382010, India";
const FIXED_MAPS_LINK = "https://maps.google.com/?q=G-24%2C%2025%2C%2026%2C%2031%2C%20Sector%2011%2C%20Gandhinagar%2C%20Gujarat%20382010%2C%20India";

function sanitizeContent(content: any) {
  if (!content || typeof content !== "object") return content;
  if (content.business) {
    content.business.address = FIXED_ADDRESS;
    content.business.mapsLink = FIXED_MAPS_LINK;
  }
  if (Array.isArray(content.testimonials)) {
    content.testimonials = content.testimonials.filter(
      (t: any) => t.rating === undefined || Number(t.rating) === 5
    );
  }
  return content;
}

export async function GET() {
  try {
    const noCacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    };

    // 1. Try reading from Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("site_content")
          .select("content")
          .eq("id", "main")
          .maybeSingle();

        if (!error && data?.content) {
          const content = sanitizeContent({ ...data.content });

          // Fetch latest services directly from the dedicated 'services' table in Supabase
          try {
            const { data: dbServices, error: sErr } = await supabase
              .from("services")
              .select("*")
              .order("sort_order", { ascending: true });

            if (!sErr && Array.isArray(dbServices) && dbServices.length > 0) {
              content.services = dbServices.map((row) => ({
                id: String(row.id),
                slug: row.slug || String(row.id),
                title: row.title,
                shortDescription: row.short_description || "",
                description: row.description || "",
                image: row.image || "",
                category: row.category || "",
                features: Array.isArray(row.features) ? row.features : [],
                featured: Boolean(row.featured),
                sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
              }));
            }
          } catch (svcErr) {
            console.warn("Could not query Supabase services table in GET:", svcErr);
          }

          if (!Array.isArray(content.machines) || content.machines.length === 0) {
            content.machines = (defaultSiteData as unknown as { machines?: unknown[] }).machines || [];
          }
          if (!Array.isArray(content.clients) || content.clients.length === 0) {
            content.clients = (defaultSiteData as unknown as { clients?: unknown[] }).clients || [];
          }

          return NextResponse.json(content, { headers: noCacheHeaders });
        }
      }
    }

    // 2. Fall back to local file storage
    if (fs.existsSync(RUNTIME_CONTENT_PATH)) {
      const data = fs.readFileSync(RUNTIME_CONTENT_PATH, "utf-8");
      return NextResponse.json(sanitizeContent(JSON.parse(data)), { headers: noCacheHeaders });
    }
    if (fs.existsSync(SEED_CONTENT_PATH)) {
      const data = fs.readFileSync(SEED_CONTENT_PATH, "utf-8");
      return NextResponse.json(sanitizeContent(JSON.parse(data)), { headers: noCacheHeaders });
    }
    return NextResponse.json(sanitizeContent(defaultSiteData), { headers: noCacheHeaders });
  } catch (error) {
    console.error("Error reading site content:", error);
    return NextResponse.json(sanitizeContent(defaultSiteData));
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();

    // Basic structure validation
    if (!rawData || typeof rawData !== "object") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const updatedData = sanitizeContent(rawData);

    if (!updatedData.business || !updatedData.portfolio || !updatedData.services) {
      return NextResponse.json(
        { error: "Missing required content sections (business, portfolio, or services)" },
        { status: 400 }
      );
    }

    // 1. If Supabase is configured, persist to Supabase
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error: dbError } = await supabase
          .from("site_content")
          .upsert(
            {
              id: "main",
              content: updatedData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (dbError) {
          console.error("Supabase site_content update error:", dbError);
        }

        // 1b. Synchronize individual services to the dedicated 'services' table in Supabase
        if (Array.isArray(updatedData.services) && updatedData.services.length > 0) {
          try {
            await Promise.all(
              updatedData.services.map(async (s: any, idx: number) => {
                const idStr = String(s.id);
                const order = typeof s.sortOrder === "number" ? s.sortOrder : idx + 1;
                const updatePayload: Record<string, any> = {
                  sort_order: order,
                };
                if (s.title) updatePayload.title = s.title.trim();
                if (s.shortDescription !== undefined) updatePayload.short_description = s.shortDescription;
                if (s.description !== undefined) updatePayload.description = s.description;
                if (s.image !== undefined) updatePayload.image = s.image;
                if (s.category !== undefined) updatePayload.category = s.category;
                if (s.features !== undefined) updatePayload.features = Array.isArray(s.features) ? s.features : [];
                if (s.featured !== undefined) updatePayload.featured = Boolean(s.featured);
                if (s.slug && typeof s.slug === "string" && s.slug.trim()) {
                  updatePayload.slug = s.slug.trim();
                }

                const { data: updatedRows } = await supabase
                  .from("services")
                  .update(updatePayload)
                  .eq("id", idStr)
                  .select("id");

                if (!updatedRows || updatedRows.length === 0) {
                  await supabase.from("services").insert([{
                    id: idStr,
                    slug: s.slug || `service-${idStr}`,
                    title: s.title || "Untitled Service",
                    short_description: s.shortDescription || "",
                    description: s.description || "",
                    image: s.image || "",
                    category: s.category || "General",
                    features: Array.isArray(s.features) ? s.features : [],
                    featured: Boolean(s.featured),
                    sort_order: order,
                  }]);
                }
              })
            );

            // Remove any services that were deleted in admin
            const currentIds = updatedData.services.map((s: any) => String(s.id));
            if (currentIds.length > 0) {
              await supabase
                .from("services")
                .delete()
                .not("id", "in", `(${currentIds.map((id: string) => `"${id}"`).join(",")})`);
            }
          } catch (svcSyncErr) {
            console.warn("Error synchronizing services table in Supabase:", svcSyncErr);
          }
        }
      }
    }

    // 2. Also keep runtime local JSON synchronized as reliable backup and offline cache (when filesystem is writable)
    // Note: We only write to RUNTIME_CONTENT_PATH (outside src/) so Next.js dev server does not trigger an HMR page reload on save
    try {
      const dir = path.dirname(RUNTIME_CONTENT_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(RUNTIME_CONTENT_PATH, JSON.stringify(updatedData, null, 2), "utf-8");
    } catch {
      // In read-only serverless platforms like Vercel, Supabase persists the data
    }

    return NextResponse.json({
      success: true,
      message: "Site content updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error saving site content:", error);
    return NextResponse.json(
      { error: "Failed to save updated site content." },
      { status: 500 }
    );
  }
}

// Reset to initial seed data
export async function DELETE() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase
          .from("site_content")
          .upsert(
            {
              id: "main",
              content: defaultSiteData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
      }
    }

    fs.writeFileSync(RUNTIME_CONTENT_PATH, JSON.stringify(defaultSiteData, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Site content restored to default" });
  } catch {
    return NextResponse.json({ error: "Failed to reset content" }, { status: 500 });
  }
}
