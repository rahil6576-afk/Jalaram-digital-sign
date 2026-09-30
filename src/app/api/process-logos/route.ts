import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");

    // 1. ISCON
    const isconPath = path.join(publicDir, "iscon.jpg");
    if (fs.existsSync(isconPath)) {
      const isconImg = sharp(isconPath);
      const { data, info } = await isconImg.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) {
          data[i + 3] = 0;
        }
      }
      await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .trim({ threshold: 10 })
        .png()
        .toFile(path.join(publicDir, "client-iscon.png"));
    }

    // 2. ORIGIN
    const originPath = path.join(publicDir, "origin.jpg");
    if (fs.existsSync(originPath)) {
      const originImg = sharp(originPath);
      const { data, info } = await originImg.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) {
          data[i + 3] = 0;
        }
      }
      await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .trim({ threshold: 10 })
        .png()
        .toFile(path.join(publicDir, "client-origin.png"));
    }

    // 3. KESARIYA GARBA
    const kesariyaPath = path.join(publicDir, "kesariya garba.jpg");
    if (fs.existsSync(kesariyaPath)) {
      // Extract from y: 150 to 660 (covers the Sahay Foundation badge AND Kesariya Garba title)
      const cropped = await sharp(kesariyaPath)
        .extract({ left: 30, top: 140, width: 1020, height: 530 })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = cropped;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Background is deep red/maroon
        const isRedBg = (r > 60 && g < 60 && b < 60 && r - g > 25) ||
                        (r > 120 && g < 75 && b < 75) ||
                        (r < 50 && g < 40 && b < 40);

        if (isRedBg) {
          data[i + 3] = 0; // Transparent
        } else if (r > 180 && g > 180 && b > 180) {
          // Fill the white text with rich Kesari / Crimson
          data[i] = 195;
          data[i + 1] = 20;
          data[i + 2] = 30;
          data[i + 3] = 255;
        }
      }

      const outBuffer = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .trim({ threshold: 10 })
        .png()
        .toBuffer();

      fs.writeFileSync(path.join(publicDir, "client-kesariya-garba.png"), outBuffer);
    }

    return NextResponse.json({
      success: true,
      message: "Logos created successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
