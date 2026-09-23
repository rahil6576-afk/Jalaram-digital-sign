import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// GET: List all uploaded images
export async function GET() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const fileNames = fs.readdirSync(UPLOADS_DIR);
    const files = fileNames
      .filter((name) => !name.startsWith(".") && /\.(png|jpe?g|webp|svg|gif)$/i.test(name))
      .map((name) => {
        const stats = fs.statSync(path.join(UPLOADS_DIR, name));
        return {
          name,
          url: `/uploads/${name}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing uploaded files:", error);
    return NextResponse.json({ error: "Failed to read uploads directory" }, { status: 500 });
  }
}

// POST: Upload one or more image files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!validTypes.includes(file.type) && !/\.(png|jpe?g|webp|svg|gif)$/i.test(file.name)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WEBP, SVG, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Max 15MB size check
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 15MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");

    const fileName = `${Date.now()}-${sanitizedOriginalName}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: fileName,
      size: file.size,
    });
  } catch (error) {
    console.error("Error saving uploaded file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
