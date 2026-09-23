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
      .filter((name) => !name.startsWith(".") && /\.(png|jpe?g|webp)$/i.test(name))
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

    // Check file type: strictly JPG, JPEG, PNG, WEBP
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const hasValidExt = /\.(jpe?g|png|webp)$/i.test(file.name);
    const hasValidMime = validTypes.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      return NextResponse.json(
        { error: "Invalid photo format. Only JPG, JPEG, PNG, or WEBP photos are allowed." },
        { status: 400 }
      );
    }

    // Max 15MB size check
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File exceeds allowed size (${sizeMb}MB). Please upload files up to 15 MB.` },
        { status: 400 }
      );
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
