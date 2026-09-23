import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import defaultSiteData from "@/data/site-content.json";

const CONTENT_FILE_PATH = path.join(process.cwd(), "src", "data", "site-content.json");

export async function GET() {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const data = fs.readFileSync(CONTENT_FILE_PATH, "utf-8");
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

    // Write formatted JSON to file
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(updatedData, null, 2), "utf-8");

    // Revalidate Next.js cache for all public routes
    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/portfolio");
      revalidatePath("/services");
      revalidatePath("/team");
      revalidatePath("/contact");
    } catch (e) {
      // safe fallback if cache API differs
    }

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
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(defaultSiteData, null, 2), "utf-8");
    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Site content restored to default" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset content" }, { status: 500 });
  }
}
