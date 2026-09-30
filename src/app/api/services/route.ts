import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import defaultSiteData from "@/data/site-content.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

// Helper: sync current Supabase services to the main site_content json in Supabase
async function syncServicesToSiteContent(supabase: any, servicesList: any[]) {
  try {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (data?.content) {
      const updatedContent = {
        ...data.content,
        services: servicesList,
      };
      await supabase
        .from("site_content")
        .upsert(
          {
            id: "main",
            content: updatedContent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
    }
  } catch (err) {
    console.warn("Could not sync services to site_content in Supabase:", err);
  }
}

// GET: Query all services directly from Supabase 'services' table, sorted by sort_order
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const limit = searchParams.get("limit");

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let query = supabase
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true });

        if (featured === "true") {
          query = query.eq("featured", true);
        }

        if (category && category.trim()) {
          query = query.ilike("category", `%${category.trim()}%`);
        }

        if (limit && !isNaN(Number(limit))) {
          query = query.limit(Number(limit));
        }

        const { data, error } = await query;

        if (!error && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((row) => ({
            id: String(row.id),
            slug: row.slug || String(row.id),
            title: row.title || "Untitled Service",
            shortDescription: row.short_description || "",
            description: row.description || "",
            image: row.image || "",
            category: row.category || "",
            features: Array.isArray(row.features) ? row.features : [],
            featured: Boolean(row.featured),
            sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
          }));

          return NextResponse.json(
            {
              success: true,
              source: "supabase",
              total: formatted.length,
              services: formatted,
            },
            { headers: noCacheHeaders }
          );
        }
      }
    }

    // Fallback to static data only if Supabase is unreachable
    let fallback = [...defaultSiteData.services].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (featured === "true") {
      fallback = fallback.filter((s) => s.featured);
    }
    if (category) {
      fallback = fallback.filter((s) => s.category?.toLowerCase().includes(category.toLowerCase()));
    }
    if (limit && !isNaN(Number(limit))) {
      fallback = fallback.slice(0, Number(limit));
    }

    return NextResponse.json(
      {
        success: true,
        source: "fallback",
        total: fallback.length,
        services: fallback,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error fetching services from Supabase API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch services",
        services: defaultSiteData.services,
      },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

// POST: Add a new service directly into Supabase 'services' table
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500, headers: noCacheHeaders });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client unavailable" }, { status: 500, headers: noCacheHeaders });
    }

    const body = await request.json();
    if (!body || !body.title) {
      return NextResponse.json({ error: "Service title is required" }, { status: 400, headers: noCacheHeaders });
    }

    // Determine id and slug
    const id = body.id ? String(body.id) : Math.random().toString(36).slice(2, 10);
    const baseSlug = (body.slug && typeof body.slug === "string" && body.slug.trim())
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : (body.title || `service-${id}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Determine sort_order: use provided sortOrder or append to end
    let sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
    if (!sortOrder) {
      const { data: maxRow } = await supabase
        .from("services")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      sortOrder = (maxRow?.sort_order || 0) + 1;
    }

    const row = {
      id,
      slug: baseSlug || `service-${id}`,
      title: body.title.trim(),
      short_description: body.shortDescription || "",
      description: body.description || "",
      image: body.image || "",
      category: body.category || "General",
      features: Array.isArray(body.features) ? body.features : [],
      featured: Boolean(body.featured),
      sort_order: sortOrder,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("services")
      .upsert([row], { onConflict: "id" })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting service in Supabase:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500, headers: noCacheHeaders });
    }

    // Fetch full re-sorted list from Supabase and sync to site_content
    const { data: allServices } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (allServices) {
      const formatted = allServices.map((r: any) => ({
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        shortDescription: r.short_description || "",
        description: r.description || "",
        image: r.image || "",
        category: r.category || "",
        features: Array.isArray(r.features) ? r.features : [],
        featured: Boolean(r.featured),
        sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
      }));
      await syncServicesToSiteContent(supabase, formatted);
    }

    return NextResponse.json({
      success: true,
      message: "Service created successfully in Supabase",
      service: {
        id: String(inserted.id),
        slug: inserted.slug,
        title: inserted.title,
        shortDescription: inserted.short_description,
        description: inserted.description,
        image: inserted.image,
        category: inserted.category,
        features: inserted.features,
        featured: inserted.featured,
        sortOrder: inserted.sort_order,
      },
    }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Error in POST /api/services:", error);
    return NextResponse.json({ error: error?.message || "Failed to create service" }, { status: 500, headers: noCacheHeaders });
  }
}

// PUT: Bulk reorder or update services in Supabase 'services' table
export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500, headers: noCacheHeaders });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client unavailable" }, { status: 500, headers: noCacheHeaders });
    }

    const body = await request.json();

    // 1. Bulk update / reorder (e.g. from Drag & Drop reorder)
    if (body && Array.isArray(body.services)) {
      // Directly update sort_order for each service in Supabase 'services' table
      const updatePromises = body.services.map((s: any, idx: number) => {
        const idStr = String(s.id);
        const order = typeof s.sortOrder === "number" ? s.sortOrder : idx + 1;
        return supabase
          .from("services")
          .update({ sort_order: order })
          .eq("id", idStr);
      });

      const results = await Promise.all(updatePromises);
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) {
        console.error("Error updating sort_order in Supabase services table:", firstError);
        return NextResponse.json({ error: firstError.message }, { status: 500, headers: noCacheHeaders });
      }

      // Fetch the updated list sorted directly from Supabase
      const { data: allServices } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (allServices) {
        const formatted = allServices.map((r: any) => ({
          id: String(r.id),
          slug: r.slug,
          title: r.title,
          shortDescription: r.short_description || "",
          description: r.description || "",
          image: r.image || "",
          category: r.category || "",
          features: Array.isArray(r.features) ? r.features : [],
          featured: Boolean(r.featured),
          sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
        }));
        await syncServicesToSiteContent(supabase, formatted);
      }

      return NextResponse.json({
        success: true,
        message: "Services sort_order updated in Supabase",
        total: body.services.length,
      }, { headers: noCacheHeaders });
    }

    // 2. Single service update
    if (body && body.id) {
      const id = String(body.id);
      const updateData: Record<string, any> = {};

      if (body.title !== undefined) updateData.title = body.title.trim();
      if (body.slug !== undefined && body.slug.trim()) updateData.slug = body.slug.trim();
      if (body.shortDescription !== undefined) updateData.short_description = body.shortDescription;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.image !== undefined) updateData.image = body.image;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.features !== undefined) updateData.features = Array.isArray(body.features) ? body.features : [];
      if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
      if (body.sortOrder !== undefined && typeof body.sortOrder === "number") {
        updateData.sort_order = body.sortOrder;
      }

      // Check if service exists in Supabase
      const { data: existing } = await supabase
        .from("services")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (!existing) {
        let sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
        if (!sortOrder) {
          const { data: maxRow } = await supabase
            .from("services")
            .select("sort_order")
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();
          sortOrder = (maxRow?.sort_order || 0) + 1;
        }

        const newRow = {
          id,
          slug: body.slug || `service-${id}`,
          title: body.title || "Untitled Service",
          short_description: body.shortDescription || "",
          description: body.description || "",
          image: body.image || "",
          category: body.category || "General",
          features: Array.isArray(body.features) ? body.features : [],
          featured: Boolean(body.featured),
          sort_order: sortOrder,
        };
        const { error: insErr } = await supabase.from("services").insert([newRow]);
        if (insErr) {
          console.error("Error inserting service in Supabase:", insErr);
          return NextResponse.json({ error: insErr.message }, { status: 500, headers: noCacheHeaders });
        }
      } else {
        const { error: updErr } = await supabase
          .from("services")
          .update(updateData)
          .eq("id", id);

        if (updErr) {
          console.error("Error updating service in Supabase:", updErr);
          return NextResponse.json({ error: updErr.message }, { status: 500, headers: noCacheHeaders });
        }
      }

      // Fetch latest row from Supabase
      const { data: updatedService } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      // Sync to site_content
      const { data: allServices } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (allServices) {
        const formatted = allServices.map((r: any) => ({
          id: String(r.id),
          slug: r.slug,
          title: r.title,
          shortDescription: r.short_description || "",
          description: r.description || "",
          image: r.image || "",
          category: r.category || "",
          features: Array.isArray(r.features) ? r.features : [],
          featured: Boolean(r.featured),
          sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
        }));
        await syncServicesToSiteContent(supabase, formatted);
      }

      return NextResponse.json({
        success: true,
        message: "Service updated in Supabase",
        service: updatedService || body,
      }, { headers: noCacheHeaders });
    }

    return NextResponse.json({ error: "Invalid update payload" }, { status: 400, headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Error in PUT /api/services:", error);
    return NextResponse.json({ error: error?.message || "Failed to update services" }, { status: 500, headers: noCacheHeaders });
  }
}

// DELETE: Delete a service by ID directly from Supabase 'services' table
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500, headers: noCacheHeaders });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client unavailable" }, { status: 500, headers: noCacheHeaders });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400, headers: noCacheHeaders });
    }

    const idStr = String(id);
    const { error: delError } = await supabase
      .from("services")
      .delete()
      .eq("id", idStr);

    if (delError) {
      console.error("Error deleting service from Supabase:", delError);
      return NextResponse.json({ error: delError.message }, { status: 500, headers: noCacheHeaders });
    }

    // Sync to site_content
    const { data: allServices } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (allServices) {
      const formatted = allServices.map((r: any) => ({
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        shortDescription: r.short_description || "",
        description: r.description || "",
        image: r.image || "",
        category: r.category || "",
        features: Array.isArray(r.features) ? r.features : [],
        featured: Boolean(r.featured),
        sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
      }));
      await syncServicesToSiteContent(supabase, formatted);
    }

    return NextResponse.json({
      success: true,
      message: `Service ${idStr} deleted from Supabase`,
    }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Error in DELETE /api/services:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete service" }, { status: 500, headers: noCacheHeaders });
  }
}
