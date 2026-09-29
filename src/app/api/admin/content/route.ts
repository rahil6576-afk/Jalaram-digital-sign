import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import defaultSiteData from "@/data/site-content.json";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const RUNTIME_CONTENT_PATH = path.join(process.cwd(), "data", "site-content.json");
const SEED_CONTENT_PATH = path.join(process.cwd(), "src", "data", "site-content.json");

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
          return NextResponse.json(data.content, { headers: noCacheHeaders });
        }
      }
    }

    // 2. Fall back to local file storage
    if (fs.existsSync(RUNTIME_CONTENT_PATH)) {
      const data = fs.readFileSync(RUNTIME_CONTENT_PATH, "utf-8");
      return NextResponse.json(JSON.parse(data), { headers: noCacheHeaders });
    }
    if (fs.existsSync(SEED_CONTENT_PATH)) {
      const data = fs.readFileSync(SEED_CONTENT_PATH, "utf-8");
      return NextResponse.json(JSON.parse(data), { headers: noCacheHeaders });
    }
    return NextResponse.json(defaultSiteData, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Error reading site content:", error);
    return NextResponse.json(defaultSiteData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const updatedData = await request.json();

    // Basic structure validation
    if (!updatedData || typeof updatedData !== "object") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

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
