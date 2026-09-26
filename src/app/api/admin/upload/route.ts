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

    // Max 5MB size check
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File exceeds allowed size (${sizeMb}MB). Please upload files up to 5 MB.` },
        { status: 400 }
      );
    }

    // Minimum file size check (at least 100 bytes)
    if (file.size < 100) {
      return NextResponse.json(
        { error: "Photo file is too small or empty. Please select a valid photo." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate photo dimensions and integrity
    let dimensions = { width: 0, height: 0 };
    try {
      const sharp = (await import("sharp")).default;
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) {
        return NextResponse.json(
          { error: "Invalid photo file. Dimensions could not be read." },
          { status: 400 }
        );
      }
      if (meta.width < 50 || meta.height < 50) {
        return NextResponse.json(
          { error: `Photo size too small (${meta.width}×${meta.height}px). Minimum required photo size is 50×50px.` },
          { status: 400 }
        );
      }
      if (meta.width > 6000 || meta.height > 6000) {
        return NextResponse.json(
          { error: `Photo size exceeds maximum allowed dimensions (${meta.width}×${meta.height}px). Max dimension is 6000×6000px.` },
          { status: 400 }
        );
      }
      dimensions = { width: meta.width, height: meta.height };
    } catch {
      return NextResponse.json(
        { error: "Corrupted or invalid photo file. Please upload a valid JPG, PNG, or WEBP photo." },
        { status: 400 }
      );
    }

    // If Cloudinary credentials are provided, upload directly to Cloudinary
    const { isCloudinaryConfigured, uploadToCloudinary } = await import("@/lib/cloudinary");
    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(buffer, "jalaram", file.name);
        return NextResponse.json({
          success: true,
          url: cloudResult.secure_url,
          name: cloudResult.public_id,
          size: file.size,
          dimensions,
          provider: "cloudinary",
        });
      } catch (cloudErr) {
        console.error("Cloudinary upload failed, falling back to local:", cloudErr);
      }
    }

    // Local fallback when Cloudinary is not yet configured or on network fallback
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
      dimensions,
      provider: "local",
    });
  } catch (error) {
    console.error("Error saving uploaded file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
