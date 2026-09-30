import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "site-content.json");
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase
          .from("site_content")
          .upsert(
            {
              id: "main",
              content,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Supabase synced with data/site-content.json" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
