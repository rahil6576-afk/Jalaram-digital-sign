import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export interface InquiryItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  status: "new" | "in-progress" | "contacted" | "completed";
  notes?: string;
  createdAt: string;
}

const RUNTIME_INQUIRIES_PATH = path.join(process.cwd(), "data", "inquiries.json");
const SEED_INQUIRIES_PATH = path.join(process.cwd(), "src", "data", "inquiries.json");

function readInquiriesFromDisk(): InquiryItem[] {
  try {
    if (fs.existsSync(RUNTIME_INQUIRIES_PATH)) {
      const raw = fs.readFileSync(RUNTIME_INQUIRIES_PATH, "utf-8");
      return JSON.parse(raw);
    }
    if (fs.existsSync(SEED_INQUIRIES_PATH)) {
      const raw = fs.readFileSync(SEED_INQUIRIES_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading inquiries from disk:", err);
  }
  return [];
}

function writeInquiriesToDisk(inquiries: InquiryItem[]) {
  try {
    const dir = path.dirname(RUNTIME_INQUIRIES_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(RUNTIME_INQUIRIES_PATH, JSON.stringify(inquiries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing inquiries to disk:", err);
  }
}

// GET all inquiries
export async function GET() {
  try {
    // 1. Try reading from Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          const inquiries: InquiryItem[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
            email: row.email || "",
            company: row.company || "",
            service: row.service || "General Inquiry",
            message: row.message,
            status: row.status || "new",
            notes: row.notes || "",
            createdAt: row.created_at || new Date().toISOString(),
          }));

          return NextResponse.json({
            success: true,
            inquiries,
            provider: "supabase",
            stats: {
              total: inquiries.length,
              new: inquiries.filter((i) => i.status === "new").length,
              inProgress: inquiries.filter((i) => i.status === "in-progress").length,
              contacted: inquiries.filter((i) => i.status === "contacted").length,
              completed: inquiries.filter((i) => i.status === "completed").length,
            },
          });
        }
      }
    }

    // 2. Fall back to local JSON file
    const inquiries = readInquiriesFromDisk();
    inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({
      success: true,
      inquiries,
      provider: "local",
      stats: {
        total: inquiries.length,
        new: inquiries.filter((i) => i.status === "new").length,
        inProgress: inquiries.filter((i) => i.status === "in-progress").length,
        contacted: inquiries.filter((i) => i.status === "contacted").length,
        completed: inquiries.filter((i) => i.status === "completed").length,
      },
    });
  } catch (err) {
    console.error("GET inquiries error:", err);
    return NextResponse.json({ error: "Failed to load inquiries" }, { status: 500 });
  }
}

// POST new inquiry from contact / quotation forms
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, company, service, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, phone number, and message are required." },
        { status: 400 }
      );
    }

    const newInquiry: InquiryItem = {
      id: `inq-${Date.now()}`,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : "",
      company: company ? String(company).trim() : "",
      service: service ? String(service).trim() : "General Inquiry",
      message: String(message).trim(),
      status: "new",
      notes: "",
      createdAt: new Date().toISOString(),
    };

    // 1. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error: dbErr } = await supabase.from("inquiries").insert({
          id: newInquiry.id,
          name: newInquiry.name,
          phone: newInquiry.phone,
          email: newInquiry.email || null,
          company: newInquiry.company || null,
          service: newInquiry.service || null,
          message: newInquiry.message,
          status: newInquiry.status,
          notes: newInquiry.notes || null,
          created_at: newInquiry.createdAt,
        });

        if (dbErr) {
          console.error("Supabase inquiries insert error:", dbErr);
        }
      }
    }

    // 2. Also keep local JSON disk storage updated as backup
    const inquiries = readInquiriesFromDisk();
    inquiries.unshift(newInquiry);
    writeInquiriesToDisk(inquiries);

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been received. Our team will contact you shortly.",
      inquiry: newInquiry,
    });
  } catch (err) {
    console.error("POST inquiries error:", err);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}

// PATCH update inquiry status or notes
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    // 1. Update in Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const updatePayload: Record<string, unknown> = {};
        if (status !== undefined) updatePayload.status = status;
        if (notes !== undefined) updatePayload.notes = notes;

        const { error: dbErr } = await supabase
          .from("inquiries")
          .update(updatePayload)
          .eq("id", id);

        if (dbErr) {
          console.error("Supabase inquiry update error:", dbErr);
        }
      }
    }

    // 2. Update local disk file
    const inquiries = readInquiriesFromDisk();
    const index = inquiries.findIndex((i) => i.id === id);

    if (index !== -1) {
      if (status !== undefined) inquiries[index].status = status;
      if (notes !== undefined) inquiries[index].notes = notes;
      writeInquiriesToDisk(inquiries);

      return NextResponse.json({
        success: true,
        message: "Inquiry updated successfully",
        inquiry: inquiries[index],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry updated successfully",
    });
  } catch (err) {
    console.error("PATCH inquiries error:", err);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

// DELETE an inquiry
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    // 1. Delete from Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error: dbErr } = await supabase.from("inquiries").delete().eq("id", id);
        if (dbErr) {
          console.error("Supabase inquiry delete error:", dbErr);
        }
      }
    }

    // 2. Delete from local disk file
    const inquiries = readInquiriesFromDisk();
    const filtered = inquiries.filter((i) => i.id !== id);
    writeInquiriesToDisk(filtered);

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (err) {
    console.error("DELETE inquiries error:", err);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
