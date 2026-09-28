import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure directory exists safely without crashing in read-only serverless environments
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch {
  // Ignored in read-only environments like Vercel
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

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

    const sanitizedOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");

    // ─────────────────────────────────────────────────────────────────────────────
    // Tier 1: Cloudinary Upload (with 25s timeout fallback)
    // ─────────────────────────────────────────────────────────────────────────────
    try {
      const { isCloudinaryConfigured, uploadToCloudinary } = await import("@/lib/cloudinary");
      if (isCloudinaryConfigured()) {
        const uploadPromise = uploadToCloudinary(buffer, "jalaram", file.name);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Cloudinary upload timed out")), 25000)
        );
        const cloudResult = await Promise.race([uploadPromise, timeoutPromise]);

        return NextResponse.json({
          success: true,
          url: cloudResult.secure_url,
          name: cloudResult.public_id,
          size: file.size,
          dimensions,
          provider: "cloudinary",
        });
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed or timed out, trying Supabase Storage:", cloudErr);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Tier 2: Supabase Storage Upload (public bucket 'uploads')
    // ─────────────────────────────────────────────────────────────────────────────
    try {
      const { getSupabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase");
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const storageFileName = `${Date.now()}-${sanitizedOriginalName}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("uploads")
            .upload(storageFileName, buffer, {
              contentType: file.type || "image/jpeg",
              upsert: true,
            });

          if (!uploadErr && uploadData?.path) {
            const { data: pubData } = supabase.storage
              .from("uploads")
              .getPublicUrl(storageFileName);

            if (pubData?.publicUrl) {
              return NextResponse.json({
                success: true,
                url: pubData.publicUrl,
                name: storageFileName,
                size: file.size,
                dimensions,
                provider: "supabase",
              });
            }
          } else if (uploadErr) {
            console.warn("Supabase Storage error, checking fallback:", uploadErr.message);
          }
        }
      }
    } catch (supaErr) {
      console.warn("Supabase upload exception:", supaErr);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Tier 3: Local Disk Upload (works in local dev environments where disk is writable)
    // ─────────────────────────────────────────────────────────────────────────────
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }

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
    } catch (localErr) {
      console.warn("Local storage write failed (e.g. read-only filesystem on Vercel):", localErr);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Tier 4: Base64 WebP Fallback (100% resilient; works in zero-storage/read-only environments)
    // ─────────────────────────────────────────────────────────────────────────────
    try {
      const sharp = (await import("sharp")).default;
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: Math.min(dimensions.width, 1600), withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const base64Url = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

      return NextResponse.json({
        success: true,
        url: base64Url,
        name: file.name,
        size: optimizedBuffer.length,
        dimensions,
        provider: "base64",
      });
    } catch (base64Err) {
      console.error("Base64 optimization failed:", base64Err);
    }

    return NextResponse.json(
      { error: "Unable to store uploaded photo. Please try again or provide an image URL." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error saving uploaded file:", error);
    const msg = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
