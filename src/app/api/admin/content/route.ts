import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import defaultSiteData from "@/data/site-content.json";

const RUNTIME_CONTENT_PATH = path.join(process.cwd(), "data", "site-content.json");
const SEED_CONTENT_PATH = path.join(process.cwd(), "src", "data", "site-content.json");

export async function GET() {
  try {
    if (fs.existsSync(RUNTIME_CONTENT_PATH)) {
      const data = fs.readFileSync(RUNTIME_CONTENT_PATH, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
    if (fs.existsSync(SEED_CONTENT_PATH)) {
      const data = fs.readFileSync(SEED_CONTENT_PATH, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json(defaultSiteData);
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

    // Ensure data directory exists
    const dir = path.dirname(RUNTIME_CONTENT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write formatted JSON to runtime storage outside of watched src/ directory
    // This prevents Turbopack/Next.js HMR from triggering a full page reload in the browser!
    fs.writeFileSync(RUNTIME_CONTENT_PATH, JSON.stringify(updatedData, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Site content updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error saving site content:", error);
    return NextResponse.json(
      { error: "Failed to save updated site content to file." },
      { status: 500 }
    );
  }
}

// Reset to initial seed data
export async function DELETE() {
  try {
    fs.writeFileSync(RUNTIME_CONTENT_PATH, JSON.stringify(defaultSiteData, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Site content restored to default" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset content" }, { status: 500 });
  }
}
