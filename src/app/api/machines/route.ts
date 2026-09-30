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

const DEFAULT_MACHINES = defaultSiteData.machines || [];

// Helper to seed machines into Supabase if empty
async function seedMachinesIfEmpty(supabase: any) {
  try {
    const { count, error } = await supabase
      .from("machines")
      .select("id", { count: "exact", head: true });

    if (!error && (count === 0 || count === null)) {
      const rows = DEFAULT_MACHINES.map((m: any, idx: number) => ({
        id: String(m.id),
        name: m.name || "Untitled Machine",
        gujarati_name: m.gujaratiName || "",
        badge: m.badge || "",
        tagline: m.tagline || "",
        speed_or_spec: m.speedOrSpec || "",
        ideal_for: m.idealFor || "",
        description: m.description || "",
        image: m.image || "",
        features: Array.isArray(m.capabilities) ? m.capabilities : (Array.isArray(m.features) ? m.features : []),
        sort_order: typeof m.sortOrder === "number" ? m.sortOrder : idx + 1,
      }));

      await supabase.from("machines").upsert(rows, { onConflict: "id" });
    }
  } catch (err) {
    console.warn("Could not auto-seed machines into Supabase:", err);
  }
}

// Sync to site_content.machines
async function syncMachinesToSiteContent(supabase: any, machinesList: any[]) {
  try {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (data?.content) {
      const updatedContent = {
        ...data.content,
        machines: machinesList,
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
    console.warn("Could not sync machines to site_content in Supabase:", err);
  }
}

// GET: Query all machines directly from Supabase 'machines' table
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Attempt to auto-seed if table is empty
        await seedMachinesIfEmpty(supabase);

        const { data, error } = await supabase
          .from("machines")
          .select("*")
          .order("sort_order", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          let formatted = data.map((row: any) => ({
            id: String(row.id),
            name: row.name || "Untitled Machine",
            gujaratiName: row.gujarati_name || "",
            badge: row.badge || "",
            tagline: row.tagline || "",
            speedOrSpec: row.speed_or_spec || "",
            idealFor: row.ideal_for || "",
            description: row.description || "",
            image: row.image || "",
            capabilities: Array.isArray(row.features) && row.features.length > 0
              ? row.features
              : (Array.isArray(row.capabilities) ? row.capabilities : []),
            features: Array.isArray(row.features) && row.features.length > 0
              ? row.features
              : (Array.isArray(row.capabilities) ? row.capabilities : []),
            sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
          }));

          if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            formatted = formatted.filter((m) =>
              m.name.toLowerCase().includes(q) ||
              m.gujaratiName.toLowerCase().includes(q) ||
              m.badge.toLowerCase().includes(q) ||
              m.speedOrSpec.toLowerCase().includes(q) ||
              m.idealFor.toLowerCase().includes(q) ||
              m.description.toLowerCase().includes(q)
            );
          }

          return NextResponse.json(
            {
              success: true,
              source: "supabase",
              total: formatted.length,
              machines: formatted,
            },
            { headers: noCacheHeaders }
          );
        }
      }
    }

    // Fallback to static machines
    let fallback = [...DEFAULT_MACHINES].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      fallback = fallback.filter((m: any) =>
        m.name?.toLowerCase().includes(q) ||
        m.gujaratiName?.toLowerCase().includes(q) ||
        m.badge?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      {
        success: true,
        source: "fallback",
        total: fallback.length,
        machines: fallback,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Error fetching machines from Supabase API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch machines",
        machines: DEFAULT_MACHINES,
      },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

// POST: Add a new machine directly into Supabase 'machines' table
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
    if (!body || !body.name) {
      return NextResponse.json({ error: "Machine name is required" }, { status: 400, headers: noCacheHeaders });
    }

    const id = body.id ? String(body.id) : `machine-${Math.random().toString(36).slice(2, 10)}`;

    let sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
    if (!sortOrder) {
      const { data: maxRow } = await supabase
        .from("machines")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      sortOrder = (maxRow?.sort_order || 0) + 1;
    }

    const row = {
      id,
      name: body.name.trim(),
      gujarati_name: body.gujaratiName || "",
      badge: body.badge || "",
      tagline: body.tagline || "",
      speed_or_spec: body.speedOrSpec || "",
      ideal_for: body.idealFor || "",
      description: body.description || "",
      image: body.image || "",
      features: Array.isArray(body.capabilities) ? body.capabilities : (Array.isArray(body.features) ? body.features : []),
      sort_order: sortOrder,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("machines")
      .upsert([row], { onConflict: "id" })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting machine in Supabase:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500, headers: noCacheHeaders });
    }

    // Fetch full re-sorted list from Supabase and sync to site_content
    const { data: allMachines } = await supabase
      .from("machines")
      .select("*")
      .order("sort_order", { ascending: true });

    if (allMachines) {
      const formatted = allMachines.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        gujaratiName: r.gujarati_name || "",
        badge: r.badge || "",
        tagline: r.tagline || "",
        speedOrSpec: r.speed_or_spec || "",
        idealFor: r.ideal_for || "",
        description: r.description || "",
        image: r.image || "",
        capabilities: r.features || [],
        features: r.features || [],
        sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
      }));
      await syncMachinesToSiteContent(supabase, formatted);
    }

    return NextResponse.json({
      success: true,
      message: "Machine created successfully in Supabase",
      machine: inserted,
    }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Error in POST /api/machines:", error);
    return NextResponse.json({ error: error?.message || "Failed to create machine" }, { status: 500, headers: noCacheHeaders });
  }
}

// PUT: Bulk reorder or update machines in Supabase 'machines' table
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

    // 1. Bulk update / reorder
    if (body && Array.isArray(body.machines)) {
      const updatePromises = body.machines.map((m: any, idx: number) => {
        const idStr = String(m.id);
        const order = typeof m.sortOrder === "number" ? m.sortOrder : idx + 1;
        return supabase
          .from("machines")
          .update({ sort_order: order })
          .eq("id", idStr);
      });

      const results = await Promise.all(updatePromises);
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) {
        console.error("Error updating sort_order in Supabase machines table:", firstError);
        return NextResponse.json({ error: firstError.message }, { status: 500, headers: noCacheHeaders });
      }

      const { data: allMachines } = await supabase
        .from("machines")
        .select("*")
        .order("sort_order", { ascending: true });

      if (allMachines) {
        const formatted = allMachines.map((r: any) => ({
          id: String(r.id),
          name: r.name,
          gujaratiName: r.gujarati_name || "",
          badge: r.badge || "",
          tagline: r.tagline || "",
          speedOrSpec: r.speed_or_spec || "",
          idealFor: r.ideal_for || "",
          description: r.description || "",
          image: r.image || "",
          capabilities: r.features || [],
          features: r.features || [],
          sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
        }));
        await syncMachinesToSiteContent(supabase, formatted);
      }

      return NextResponse.json({
        success: true,
        message: "Machines sort_order updated in Supabase",
        total: body.machines.length,
      }, { headers: noCacheHeaders });
    }

    // 2. Single machine update
    if (body && body.id) {
      const id = String(body.id);
      const updateData: Record<string, any> = {};

      if (body.name !== undefined) updateData.name = body.name.trim();
      if (body.gujaratiName !== undefined) updateData.gujarati_name = body.gujaratiName;
      if (body.badge !== undefined) updateData.badge = body.badge;
      if (body.tagline !== undefined) updateData.tagline = body.tagline;
      if (body.speedOrSpec !== undefined) updateData.speed_or_spec = body.speedOrSpec;
      if (body.idealFor !== undefined) updateData.ideal_for = body.idealFor;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.image !== undefined) updateData.image = body.image;
      if (body.capabilities !== undefined) updateData.features = body.capabilities;
      else if (body.features !== undefined) updateData.features = body.features;
      if (body.sortOrder !== undefined && typeof body.sortOrder === "number") {
        updateData.sort_order = body.sortOrder;
      }

      const { data: existing } = await supabase
        .from("machines")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (!existing) {
        let sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
        if (!sortOrder) {
          const { data: maxRow } = await supabase
            .from("machines")
            .select("sort_order")
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();
          sortOrder = (maxRow?.sort_order || 0) + 1;
        }

        const newRow = {
          id,
          name: body.name || "Untitled Machine",
          gujarati_name: body.gujaratiName || "",
          badge: body.badge || "",
          tagline: body.tagline || "",
          speed_or_spec: body.speedOrSpec || "",
          ideal_for: body.idealFor || "",
          description: body.description || "",
          image: body.image || "",
          features: Array.isArray(body.capabilities) ? body.capabilities : (Array.isArray(body.features) ? body.features : []),
          sort_order: sortOrder,
        };
        const { error: insErr } = await supabase.from("machines").insert([newRow]);
        if (insErr) {
          console.error("Error inserting machine in Supabase:", insErr);
          return NextResponse.json({ error: insErr.message }, { status: 500, headers: noCacheHeaders });
        }
      } else {
        const { error: updErr } = await supabase
          .from("machines")
          .update(updateData)
          .eq("id", id);

        if (updErr) {
          console.error("Error updating machine in Supabase:", updErr);
          return NextResponse.json({ error: updErr.message }, { status: 500, headers: noCacheHeaders });
        }
      }

      // Sync to site_content
      const { data: allMachines } = await supabase
        .from("machines")
        .select("*")
        .order("sort_order", { ascending: true });

      if (allMachines) {
        const formatted = allMachines.map((r: any) => ({
          id: String(r.id),
          name: r.name,
          gujaratiName: r.gujarati_name || "",
          badge: r.badge || "",
          tagline: r.tagline || "",
          speedOrSpec: r.speed_or_spec || "",
          idealFor: r.ideal_for || "",
          description: r.description || "",
          image: r.image || "",
          capabilities: r.features || [],
          features: r.features || [],
          sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
        }));
        await syncMachinesToSiteContent(supabase, formatted);
      }

      return NextResponse.json({
        success: true,
        message: "Machine updated in Supabase",
      }, { headers: noCacheHeaders });
    }

    return NextResponse.json({ error: "Invalid update payload" }, { status: 400, headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Error in PUT /api/machines:", error);
    return NextResponse.json({ error: error?.message || "Failed to update machines" }, { status: 500, headers: noCacheHeaders });
  }
}

// DELETE: Delete a machine by ID directly from Supabase 'machines' table
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
      return NextResponse.json({ error: "Machine ID is required" }, { status: 400, headers: noCacheHeaders });
    }

    const idStr = String(id);
    const { error: delError } = await supabase
      .from("machines")
      .delete()
      .eq("id", idStr);

    if (delError) {
      console.error("Error deleting machine from Supabase:", delError);
      return NextResponse.json({ error: delError.message }, { status: 500, headers: noCacheHeaders });
    }

    // Sync to site_content
    const { data: allMachines } = await supabase
      .from("machines")
      .select("*")
      .order("sort_order", { ascending: true });

    if (allMachines) {
      const formatted = allMachines.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        gujaratiName: r.gujarati_name || "",
        badge: r.badge || "",
        tagline: r.tagline || "",
        speedOrSpec: r.speed_or_spec || "",
        idealFor: r.ideal_for || "",
        description: r.description || "",
        image: r.image || "",
        capabilities: r.features || [],
        features: r.features || [],
        sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
      }));
      await syncMachinesToSiteContent(supabase, formatted);
    }

    return NextResponse.json({
      success: true,
      message: `Machine ${idStr} deleted from Supabase`,
    }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Error in DELETE /api/machines:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete machine" }, { status: 500, headers: noCacheHeaders });
  }
}
