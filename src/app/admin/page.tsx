"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  ImageIcon,
  Briefcase,
  Users,
  MessageSquare,
  HelpCircle,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Check,
  X,
  Menu,
  Loader2,
  Star,
  Globe,
  LayoutGrid,
  ShieldCheck,
  LogOut,
  Inbox,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Cpu,
  GripVertical,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Business {
  name: string; description: string; address: string; phone: string;
  extraPhone?: string;
  whatsapp: string; email: string; extraEmail?: string;
  mapsLink: string; hours: string;
}
interface Socials {
  instagram: string;
  facebook: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
}
interface Service {
  id: string; slug: string; title: string; shortDescription?: string;
  description?: string; image: string; category: string; features: string[];
  featured: boolean; sortOrder: number;
}
interface PortfolioItem {
  id: string; slug: string; title: string; category: string; description?: string;
  image: string; images: string[]; location: string; featured: boolean; sortOrder: number;
}
interface MachineItem {
  id: string;
  name: string;
  gujaratiName?: string;
  badge?: string;
  image: string;
  tagline?: string;
  description?: string;
  capabilities: string[];
  idealFor?: string;
  speedOrSpec?: string;
  sortOrder?: number;
}
interface TeamMember {
  id: string; name: string; role: string; bio?: string; image: string;
  phone?: string; email?: string;
  socialLinks: Record<string, string>; sortOrder: number;
}
interface Testimonial { id: string; name: string; business: string; quote: string; rating: number; }
interface FAQ { id: string; question: string; answer: string; }
interface ClientCompany { id: string; name: string; tag: string; logo: string; }
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
interface SiteData {
  business: Business; socials: Socials; heroImages: string[];
  clients?: ClientCompany[];
  services: Service[]; portfolio: PortfolioItem[];
  machines?: MachineItem[];
  team: TeamMember[];
  testimonials: Testimonial[]; faqs: FAQ[];
}

type ActiveModal = {
  type: "portfolio" | "service" | "team" | "client" | "testimonial" | "faq" | "hero" | "machine";
  idOrIndex: string | number;
  isNew?: boolean;
  mode?: "view" | "edit";
} | null;

const TABS = [
  { id: "business", label: "Business & Contact", icon: Building2 },
  { id: "hero", label: "Hero Images", icon: ImageIcon },
  { id: "clients", label: "Client Logos", icon: Building2 },
  { id: "portfolio", label: "Portfolio", icon: LayoutGrid },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "machines", label: "Machines", icon: Cpu },
  { id: "team", label: "Team", icon: Users },
  { id: "testimonials", label: "Reviews", icon: MessageSquare },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
];

export const CATEGORY_OPTIONS = [
  "Hoardings",
  "Flex Printing",
  "Flex Banner",
  "Vinyl Printing",
  "Banner Printing",
  "Sign Board",
  "LED Sign Board",
  "Board LED Board",
  "Acrylic Signage",
  "Acrylic Board",
  "Glow Sign Board",
  "Glow Sign",
  "3D Letter Signage",
  "UV Printing",
  "Fabric Box",
  "ACP Cladding",
  "Sunboard Printing",
  "Roll-Up Standee",
  "Posters",
  "Stickers & Labels",
  "Pamphlet / Flyer Printing",
  "Visiting Cards",
  "Letterheads",
  "Invitation Cards",
  "Name Plates – Acrylic / SS",
  "Vehicle Graphics",
  "Bag Printing",
  "Graphic Designing",
  "Installation Services",
  "1Way Vision Print",
  "One way Print",
  "Frosted",
  "Digital Printing",
  "Raduim Work",
];

// ── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: "success" | "error" | "loading"; onDismiss: () => void }) {
  const colors = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    loading: "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl border flex items-center gap-2.5 shadow-xl text-sm font-semibold ${colors[type]}`}>
      {type === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {message}
      <button type="button" onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ── Photo Validation Config ────────────────────────────────────────────────
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_PHOTO_SIZE_BYTES = 100; // 100 bytes
const MIN_PHOTO_DIMENSION = 50; // 50px
const MAX_PHOTO_DIMENSION = 6000; // 6000px
const ALLOWED_PHOTO_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const ALLOWED_PHOTO_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPT_PHOTO_ATTR = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

function validatePhoto(file: File, skipSizeValidation = false): { valid: boolean; error?: string } {
  const hasValidExt = ALLOWED_PHOTO_EXTENSIONS.test(file.name);
  const hasValidMime = ALLOWED_PHOTO_MIMES.includes(file.type);

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `"${file.name}" is not supported. Only JPG, JPEG, PNG, or WEBP photos are allowed.`,
    };
  }

  // Size validation removed/skipped for portfolio section
  if (skipSizeValidation) {
    return { valid: true };
  }

  if (file.size < MIN_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Photo file "${file.name}" is empty or corrupted (under 100 bytes).`,
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Photo file "${file.name}" (${sizeMb} MB) exceeds allowed size limit. Maximum photo size is 5 MB.`,
    };
  }

  return { valid: true };
}

// Helper to pre-validate image dimensions before upload
function checkPhotoDimensions(file: File, skipSizeValidation = false): Promise<{ valid: boolean; width: number; height: number; error?: string }> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (skipSizeValidation) {
        resolve({ valid: true, width: w, height: h });
        return;
      }
      if (w < MIN_PHOTO_DIMENSION || h < MIN_PHOTO_DIMENSION) {
        resolve({
          valid: false,
          width: w,
          height: h,
          error: `Photo dimensions too small (${w} × ${h} px). Minimum required size is ${MIN_PHOTO_DIMENSION} × ${MIN_PHOTO_DIMENSION} px.`,
        });
      } else if (w > MAX_PHOTO_DIMENSION || h > MAX_PHOTO_DIMENSION) {
        resolve({
          valid: false,
          width: w,
          height: h,
          error: `Photo dimensions too large (${w} × ${h} px). Maximum allowed size is ${MAX_PHOTO_DIMENSION} × ${MAX_PHOTO_DIMENSION} px.`,
        });
      } else {
        resolve({ valid: true, width: w, height: h });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, width: 0, height: 0, error: "Failed to read photo image data. The file may be corrupted." });
    };
    img.src = objectUrl;
  });
}

// ── ImageInput (Responsive upload button + ReadOnly view mode) ─────────────────
function ImageInput({
  value,
  onChange,
  label,
  readOnly = false,
  skipSizeValidation = false,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  readOnly?: boolean;
  skipSizeValidation?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoDims, setPhotoDims] = useState<{ w: number; h: number } | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (readOnly) return;
    setErrorMsg(null);

    // 1. File size and format check
    const check = validatePhoto(file, skipSizeValidation);
    if (!check.valid) {
      setErrorMsg(check.error || "File exceeds allowed size. Please upload files up to 5 MB.");
      return;
    }

    // 2. Photo pixel dimension check
    const dimCheck = await checkPhotoDimensions(file, skipSizeValidation);
    if (!dimCheck.valid) {
      setErrorMsg(dimCheck.error || "Invalid photo dimensions.");
      return;
    }

    setPhotoDims({ w: dimCheck.width, h: dimCheck.height });
    setFileSizeStr((file.size / (1024 * 1024)).toFixed(2) + " MB");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      
      let data: { success?: boolean; url?: string; error?: string; dimensions?: { width: number; height: number } } | null = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const fallbackMsg = res.status === 413
          ? "File size exceeds server upload limit."
          : res.status >= 500
          ? "Server error during upload. Please try again."
          : `Upload failed (Server status: ${res.status})`;
        throw new Error(data?.error || fallbackMsg);
      }

      if (!data?.url) {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      onChange(data.url);
      if (data.dimensions?.width && data.dimensions?.height) {
        setPhotoDims({ w: data.dimensions.width, h: data.dimensions.height });
      }
    } catch (err: unknown) {
      let msg = "Upload failed. Please try again or paste a URL.";
      if (err instanceof Error) {
        if (err.message.includes("JSON") || err.message.includes("Unexpected end")) {
          msg = "Upload connection interrupted or timed out. Please try uploading again.";
        } else if (err.message.includes("fetch") || err.message.includes("network")) {
          msg = "Network connection error: Unable to reach the server. Please check your connection.";
        } else {
          msg = err.message;
        }
      }
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
      {!readOnly ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setErrorMsg(null);
              onChange(e.target.value);
            }}
            placeholder="Paste image URL or upload →"
            className="w-full sm:flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6F20E8] focus:ring-2 focus:ring-[#6F20E8]/20"
          />
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              fileRef.current?.click();
            }}
            disabled={uploading}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_PHOTO_ATTR}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
        </div>
      ) : null}

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">⚠️</span> {errorMsg}
          </span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-700 ml-2 font-bold">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-1">
        <span>{skipSizeValidation ? "Photo Size: No size limit · Formats: JPG, PNG, WEBP" : "Photo Size: Max 5MB · Min 50×50px · Formats: JPG, PNG, WEBP"}</span>
        {photoDims && (
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 w-fit">
            <span>✓ Valid Photo:</span> {photoDims.w} × {photoDims.h} px {fileSizeStr ? `(${fileSizeStr})` : ""}
          </span>
        )}
      </div>

      {value ? (
        <div className="relative w-full min-h-[140px] max-h-60 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            onLoad={(e) => setPhotoDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onError={() => setErrorMsg("Unable to load photo preview. Please verify URL or file.")}
            className="max-h-56 w-auto max-w-full object-contain rounded-lg shadow-sm"
          />
          {photoDims && (
            <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
              <span>Photo Size:</span>
              <span className="text-purple-300 font-bold">{photoDims.w} × {photoDims.h} px</span>
              {fileSizeStr ? <span className="opacity-80">· {fileSizeStr}</span> : null}
            </span>
          )}
        </div>
      ) : readOnly ? (
        <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
          No photo uploaded
        </div>
      ) : null}
    </div>
  );
}

// ── SitePhotosManager (Multiple Photo Upload + Sliding View for Portfolio) ──
function SitePhotosManager({
  coverImage,
  images,
  onCoverChange,
  onImagesChange,
  readOnly = false,
}: {
  coverImage: string;
  images: string[];
  onCoverChange: (v: string) => void;
  onImagesChange: (v: string[]) => void;
  readOnly?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Combine cover and images uniquely while preserving order
  const allPhotos = Array.from(
    new Set([
      ...(coverImage ? [coverImage] : []),
      ...(Array.isArray(images) ? images : []),
    ].filter(Boolean))
  );

  const handleMultipleUpload = async (files: FileList | File[]) => {
    if (readOnly || !files || files.length === 0) return;
    setErrorMsg(null);
    setUploading(true);

    const fileArray = Array.from(files);
    const uploadedUrls: string[] = [];
    let completed = 0;

    for (const file of fileArray) {
      setUploadProgress(`Uploading ${completed + 1} of ${fileArray.length} photos...`);

      // Photo size validation explicitly removed for portfolio section (skipSizeValidation = true)
      const check = validatePhoto(file, true);
      if (!check.valid) {
        setErrorMsg(check.error || `Unsupported file format for "${file.name}"`);
        continue;
      }

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("section", "portfolio");

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Upload failed for ${file.name}`);
        }
        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      } catch (err) {
        console.error("Upload error:", err);
        setErrorMsg(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
      completed++;
    }

    if (uploadedUrls.length > 0) {
      const updatedImages = Array.from(new Set([...images, ...uploadedUrls]));
      onImagesChange(updatedImages);
      if (!coverImage && uploadedUrls[0]) {
        onCoverChange(uploadedUrls[0]);
      }
      setActiveSlide(allPhotos.length);
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const setAsCover = (url: string) => {
    if (readOnly) return;
    onCoverChange(url);
    const reordered = [url, ...allPhotos.filter((x) => x !== url)];
    onImagesChange(reordered);
    setActiveSlide(0);
  };

  const removePhoto = (urlToRemove: string) => {
    if (readOnly) return;
    const remaining = allPhotos.filter((x) => x !== urlToRemove);
    onImagesChange(remaining);
    if (coverImage === urlToRemove) {
      onCoverChange(remaining[0] || "");
    }
    setActiveSlide((prev) => Math.max(0, Math.min(prev, remaining.length - 1)));
  };

  const movePhoto = (idx: number, direction: "left" | "right") => {
    if (readOnly) return;
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= allPhotos.length) return;

    const newList = [...allPhotos];
    const temp = newList[idx];
    newList[idx] = newList[targetIdx];
    newList[targetIdx] = temp;

    onCoverChange(newList[0] || "");
    onImagesChange(newList);
    setActiveSlide(targetIdx);
  };

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    const cleanUrl = newUrlInput.trim();
    if (!allPhotos.includes(cleanUrl)) {
      const updated = [...images, cleanUrl];
      onImagesChange(updated);
      if (!coverImage) onCoverChange(cleanUrl);
    }
    setNewUrlInput("");
    setShowUrlInput(false);
  };

  const safeSlideIdx = allPhotos.length > 0 ? activeSlide % allPhotos.length : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      {/* Header and Multi-Photo Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>Site Photos & Gallery</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-[#6F20E8] border border-purple-200">
              {allPhotos.length} {allPhotos.length === 1 ? "Photo" : "Photos"}
            </span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload multiple photos of this site and view them by sliding.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-[#6F20E8]/20 disabled:opacity-50 cursor-pointer"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>{uploading ? "Uploading..." : "Upload Multiple Photos"}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={ACCEPT_PHOTO_ATTR}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMultipleUpload(e.target.files);
                }
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2.5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Add Image by URL"
            >
              + URL
            </button>
          </div>
        )}
      </div>

      {/* Explanatory Specs Banner (satisfies Photo Size: requirement) */}
      <div className="text-[11px] text-gray-500 flex flex-wrap items-center justify-between gap-1 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
        <span>Photo Size: No size validation limit in portfolio section · Camera & mobile uploads supported</span>
        <span className="text-[10px] text-[#6F20E8] font-bold uppercase tracking-wider">Formats: JPG, PNG, WEBP</span>
      </div>

      {/* URL Input Form */}
      {showUrlInput && !readOnly && (
        <div className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <input
            type="text"
            value={newUrlInput}
            onChange={(e) => setNewUrlInput(e.target.value)}
            placeholder="Paste direct photo URL (https://...)"
            className="flex-1 text-xs px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-[#6F20E8]"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-2 bg-[#6F20E8] text-white text-xs font-semibold rounded-lg hover:bg-[#5B16C7] transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-2.5 py-2 text-gray-500 hover:text-gray-800 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {uploading && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#6F20E8] animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{uploadProgress || "Uploading site photos..."}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-700 ml-2 font-bold">✕</button>
        </div>
      )}

      {/* ── SLIDING VIEW OF SITE PHOTOS ── */}
      {allPhotos.length > 0 ? (
        <div className="space-y-3">
          {/* Main Slide Preview Display */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-sm flex items-center justify-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={allPhotos[safeSlideIdx]}
              src={encodeURI(allPhotos[safeSlideIdx])}
              alt={`Slide ${safeSlideIdx + 1}`}
              className="w-full h-full object-contain"
            />

            {/* Slide Navigation Arrows */}
            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                  title="Slide to Previous Photo"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % allPhotos.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                  title="Slide to Next Photo"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Slide Indicator Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/20">
                Slide {safeSlideIdx + 1} of {allPhotos.length}
              </span>
              {allPhotos[safeSlideIdx] === coverImage && (
                <span className="px-2.5 py-1 rounded-full bg-[#6F20E8] text-white text-[11px] font-bold shadow-sm">
                  ★ Main Cover Photo
                </span>
              )}
            </div>

            {/* Slide Dots Indicator */}
            {allPhotos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                {allPhotos.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setActiveSlide(dotIdx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === safeSlideIdx ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Slide to ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Photo Management Thumbnails List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 block">Manage & Reorder Photos:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {allPhotos.map((url, pIdx) => {
                const isCover = url === coverImage;
                const isCurrentSlide = pIdx === safeSlideIdx;

                return (
                  <div
                    key={`${url}-${pIdx}`}
                    onClick={() => setActiveSlide(pIdx)}
                    className={`relative rounded-xl border overflow-hidden p-1.5 flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                      isCurrentSlide
                        ? "border-[#6F20E8] bg-purple-50/40 ring-2 ring-[#6F20E8]/30"
                        : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={encodeURI(url)} alt={`Photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        #{pIdx + 1}
                      </span>
                      {isCover && (
                        <span className="absolute bottom-1 left-1 bg-[#6F20E8] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          Cover
                        </span>
                      )}
                    </div>

                    {!readOnly && (
                      <div className="flex items-center justify-between gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => setAsCover(url)}
                            className="text-[10px] font-semibold text-[#6F20E8] hover:underline"
                            title="Set as Main Cover Photo"
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600">Cover Photo</span>
                        )}

                        <div className="flex items-center gap-0.5">
                          {pIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => movePhoto(pIdx, "left")}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                              title="Move Left in Slide Order"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {pIdx < allPhotos.length - 1 && (
                            <button
                              type="button"
                              onClick={() => movePhoto(pIdx, "right")}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                              title="Move Right in Slide Order"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(url)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !readOnly && fileRef.current?.click()}
          className={`border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center transition-all ${
            readOnly ? "cursor-default" : "hover:border-[#6F20E8] hover:bg-purple-50/20 cursor-pointer"
          }`}
        >
          <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">No photos uploaded for this site yet</p>
          {!readOnly && (
            <p className="text-[11px] text-[#6F20E8] font-bold mt-1">
              Click to upload multiple photos (no size limit)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Modal Pop Screen Wrapper ───────────────────────────────────────────────
function ModalWrapper({
  title,
  subtitle,
  icon,
  children,
  onClose,
  onSave,
  onEdit,
  saving,
  errorMessage,
  mode = "edit",
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  onEdit?: () => void;
  saving: boolean;
  errorMessage?: string | null;
  mode?: "view" | "edit";
}) {
  const isView = mode === "view";
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-white to-white shrink-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-[#6F20E8] flex items-center justify-center font-bold shrink-0 border border-purple-200/60">
                {icon}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight">{title}</h3>
                {isView && (
                  <span className="inline-flex items-center justify-center shrink-0 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-[#6F20E8] px-2.5 py-1 rounded-full border border-purple-200 leading-none align-middle shadow-xs">
                    View Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-left">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {children}
        </div>

        {/* Modal Footer with Close Details and Save / Edit */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close Details
          </button>
          {isView ? (
            onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white shadow-md shadow-[#6F20E8]/20 transition-all active:scale-[0.98]"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : null
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                onSave();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Search Bar Component ──────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
  placeholder,
  total,
  filtered,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  total: number;
  filtered: number;
}) {
  return (
    <div className="relative w-full sm:w-72 md:w-80">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search entries..."}
        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6F20E8] focus:ring-2 focus:ring-[#6F20E8]/20 transition-all shadow-sm"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-md"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium pointer-events-none">
          {filtered !== total ? `${filtered}/${total}` : `${total}`}
        </span>
      )}
    </div>
  );
}

// ── Section Header with Save Button and Search Bar ──────────────────────────
function SectionHeader({
  title,
  subtitle,
  actionButton,
  searchBar,
}: {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  searchBar?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 pb-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actionButton && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
            {actionButton}
          </div>
        )}
      </div>
      {searchBar && (
        <div className="flex items-center justify-between gap-3 pt-1">
          {searchBar}
        </div>
      )}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const field = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6F20E8] focus:ring-2 focus:ring-[#6F20E8]/20";
const sectionCard = "bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block";

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState("business");

  // Restore active tab from localStorage so admin stays on the active tab
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem("jalaram_admin_active_tab");
      if (savedTab && TABS.some((t) => t.id === savedTab)) {
        setActiveTabState(savedTab);
      }
    } catch {}
  }, []);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem("jalaram_admin_active_tab", tab);
    } catch {}
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<SiteData | null>(null);
  const dataRef = useRef<SiteData | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "loading" } | null>(null);

  // Section search queries
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [servicesSearch, setServicesSearch] = useState("");
  const [machinesSearch, setMachinesSearch] = useState("");
  const [draggedMachineId, setDraggedMachineId] = useState<string | null>(null);
  const [dragOverMachineId, setDragOverMachineId] = useState<string | null>(null);
  const [newMachineDraft, setNewMachineDraft] = useState<MachineItem | null>(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [clientsSearch, setClientsSearch] = useState("");
  const [testimonialsSearch, setTestimonialsSearch] = useState("");
  const [faqsSearch, setFaqsSearch] = useState("");
  const [heroSearch, setHeroSearch] = useState("");

  const handleLogout = async () => {
    try { await fetch("/api/admin/auth", { method: "DELETE" }); } catch {}
    router.replace("/admin/login");
    router.refresh();
  };

  // Active modal popup state for viewing & editing entries in a popup screen
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete confirmation popup state
  const [deletePrompt, setDeletePrompt] = useState<{
    type: "portfolio" | "service" | "team" | "client" | "testimonial" | "faq" | "hero" | "inquiry" | "machine";
    idOrIndex: string | number;
    name: string;
  } | null>(null);

  // Unified Drag-and-Drop state & handlers for all sections
  const [draggedItem, setDraggedItem] = useState<{ section: string; id: string | number } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ section: string; id: string | number } | null>(null);

  const handleDragStart = (e: React.DragEvent, section: string, id: string | number) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ section, id }));
    e.dataTransfer.effectAllowed = "move";
    setDraggedItem({ section, id });
  };

  const handleDragOver = (e: React.DragEvent, section: string, id: string | number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverItem?.section !== section || dragOverItem?.id !== id) {
      setDragOverItem({ section, id });
    }
  };

  const handleDragLeave = (section: string, id: string | number) => {
    if (dragOverItem?.section === section && dragOverItem?.id === id) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSection: string, targetId: string | number) => {
    e.preventDefault();
    let sourceSection = draggedItem?.section;
    let sourceId = draggedItem?.id;
    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.section) sourceSection = parsed.section;
        if (parsed.id !== undefined) sourceId = parsed.id;
      }
    } catch {}

    setDraggedItem(null);
    setDragOverItem(null);

    if (!sourceSection || sourceSection !== targetSection || sourceId === targetId || !data) return;

    const list = data[targetSection as keyof SiteData];
    if (!Array.isArray(list)) return;

    const copy = [...list];
    const fromIndex = typeof sourceId === "number"
      ? sourceId
      : copy.findIndex((x: any) => String(x?.id) === String(sourceId));
    const toIndex = typeof targetId === "number"
      ? targetId
      : copy.findIndex((x: any) => String(x?.id) === String(targetId));

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);

    const reordered = copy.map((item: any, idx: number) => {
      if (typeof item === "object" && item !== null) {
        return { ...item, sortOrder: idx + 1 };
      }
      return item;
    });

    const updated: SiteData = { ...data, [targetSection]: reordered };
    dataRef.current = updated;
    setData(updated);

    // Direct database persistence for reordered services in Supabase 'services' table
    if (targetSection === "services") {
      fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: reordered }),
      }).catch((err) => console.warn("Supabase services reorder sync error:", err));
    }

    // Direct database persistence for reordered machines in Supabase 'machines' table
    if (targetSection === "machines") {
      fetch("/api/machines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machines: reordered }),
      }).catch((err) => console.warn("Supabase machines reorder sync error:", err));
    }

    handleSave(updated);
  };

  // Reorder sequence of items in any section
  const moveItem = (
    section: "services" | "portfolio" | "machines" | "team" | "clients" | "testimonials" | "faqs" | "heroImages",
    idOrIndex: string | number,
    dir: "up" | "down"
  ) => {
    if (!data) return;
    const list = data[section];
    if (!Array.isArray(list)) return;

    const currentIndex = typeof idOrIndex === "number"
      ? idOrIndex
      : (list as Array<{ id?: string }>).findIndex((x) => x?.id === idOrIndex);

    if (currentIndex === -1) return;
    const targetIndex = dir === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const copy = [...list];
    const [moved] = copy.splice(currentIndex, 1);
    copy.splice(targetIndex, 0, moved);

    const withSortOrder = copy.map((item, idx) => {
      if (typeof item === "object" && item !== null && "sortOrder" in item) {
        return { ...item, sortOrder: idx + 1 };
      }
      return item;
    });

    const updated: SiteData = { ...data, [section]: withSortOrder };
    dataRef.current = updated;
    setData(updated);
    handleSave(updated);
  };

  // Inquiries State & Management
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesFilter, setInquiriesFilter] = useState<string>("all");
  const [inquiriesSearch, setInquiriesSearch] = useState<string>("");
  const [inquiriesStats, setInquiriesStats] = useState({ total: 0, new: 0, inProgress: 0, contacted: 0, completed: 0 });

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      const json = await res.json();
      if (json.success && Array.isArray(json.inquiries)) {
        setInquiries(json.inquiries);
        if (json.stats) setInquiriesStats(json.stats);
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus as InquiryItem["status"] } : i))
      );
      showToast("Inquiry status updated", "success");
      fetchInquiries();
    } catch {
      showToast("Failed to update inquiry status", "error");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete inquiry");
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      showToast("Inquiry deleted successfully", "success");
      fetchInquiries();
    } catch {
      showToast("Failed to delete inquiry", "error");
    }
  };

  const exportInquiriesCSV = () => {
    if (!inquiries.length) {
      showToast("No inquiries to export", "error");
      return;
    }
    const headers = ["ID", "Date", "Name", "Phone", "Email", "Company", "Service", "Status", "Message"];
    const rows = inquiries.map((i) => [
      i.id,
      new Date(i.createdAt).toLocaleString(),
      `"${(i.name || "").replace(/"/g, '""')}"`,
      `"${(i.phone || "").replace(/"/g, '""')}"`,
      `"${(i.email || "").replace(/"/g, '""')}"`,
      `"${(i.company || "").replace(/"/g, '""')}"`,
      `"${(i.service || "").replace(/"/g, '""')}"`,
      i.status,
      `"${(i.message || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jalaram_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported inquiries to CSV", "success");
  };

  // Backward compatibility / convenience setters that open/close the modal
  const setExpandedPortfolio = (id: string | null) => setActiveModal(id ? { type: "portfolio", idOrIndex: id } : null);
  const setExpandedService = (id: string | null) => setActiveModal(id ? { type: "service", idOrIndex: id } : null);
  const setExpandedTeam = (id: string | null) => setActiveModal(id ? { type: "team", idOrIndex: id } : null);

  const closeModal = () => {
    // If closing a draft that was never validly saved, clean it up
    if (activeModal?.isNew && data) {
      if (activeModal.type === "portfolio") {
        setData((p) => p ? { ...p, portfolio: p.portfolio.filter((x) => x.id !== activeModal.idOrIndex || x.title.trim() !== "") } : p);
      } else if (activeModal.type === "service") {
        setData((p) => p ? { ...p, services: p.services.filter((x) => x.id !== activeModal.idOrIndex || x.title.trim() !== "") } : p);
      } else if (activeModal.type === "team") {
        setData((p) => p ? { ...p, team: p.team.filter((x) => x.id !== activeModal.idOrIndex || x.name.trim() !== "") } : p);
      } else if (activeModal.type === "client") {
        setData((p) => p ? { ...p, clients: (p.clients || []).filter((x) => x.id !== activeModal.idOrIndex || x.name.trim() !== "") } : p);
      } else if (activeModal.type === "testimonial") {
        setData((p) => p ? { ...p, testimonials: p.testimonials.filter((x) => x.id !== activeModal.idOrIndex || x.name.trim() !== "") } : p);
      } else if (activeModal.type === "faq") {
        setData((p) => p ? { ...p, faqs: p.faqs.filter((x) => x.id !== activeModal.idOrIndex || x.question.trim() !== "") } : p);
      } else if (activeModal.type === "hero") {
        setData((p) => p ? { ...p, heroImages: p.heroImages.filter((img, idx) => idx !== activeModal.idOrIndex || (typeof img === "string" && img.trim() !== "")) } : p);
      } else if (activeModal.type === "machine") {
        setData((p) => p ? { ...p, machines: (p.machines || []).filter((x) => x.id !== activeModal.idOrIndex || x.name.trim() !== "") } : p);
      }
    }
    setNewMachineDraft(null);
    setActiveModal(null);
    setModalError(null);
    setExpandedPortfolio(null);
    setExpandedService(null);
    setExpandedTeam(null);
  };

  const showToast = useCallback((message: string, type: "success" | "error" | "loading") => {
    setToast({ message, type });
    if (type !== "loading") setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contentRes, servicesRes, machinesRes] = await Promise.allSettled([
          fetch("/api/admin/content?t=" + Date.now(), { cache: "no-store" }),
          fetch("/api/services?t=" + Date.now(), { cache: "no-store" }),
          fetch("/api/machines?t=" + Date.now(), { cache: "no-store" }),
        ]);

        let json: any = null;
        if (contentRes.status === "fulfilled" && contentRes.value.ok) {
          json = await contentRes.value.json();
        }

        let dbServices: any = null;
        if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
          const sJson = await servicesRes.value.json();
          if (sJson.success && Array.isArray(sJson.services) && sJson.services.length > 0) {
            dbServices = sJson.services;
          }
        }

        let dbMachines: any = null;
        if (machinesRes.status === "fulfilled" && machinesRes.value.ok) {
          const mJson = await machinesRes.value.json();
          if (mJson.success && Array.isArray(mJson.machines) && mJson.machines.length > 0) {
            dbMachines = mJson.machines;
          }
        }

        if (json) {
          const merged = {
            ...json,
            ...(dbServices && dbServices.length > 0 ? { services: dbServices } : {}),
            ...(dbMachines && dbMachines.length > 0 ? { machines: dbMachines } : {}),
          };
          dataRef.current = merged;
          setData(merged);
        }
      } catch {
        showToast("Failed to load site data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showToast]);

  // Fetch directly from the separate Supabase Services API whenever the Services tab is active
  useEffect(() => {
    if (activeTab === "services") {
      fetch("/api/services?t=" + Date.now(), { cache: "no-store" })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.services) && res.services.length > 0) {
            setData((prev) => {
              if (!prev) return prev;
              const updated = { ...prev, services: res.services };
              dataRef.current = updated;
              return updated;
            });
          }
        })
        .catch(() => {});
    } else if (activeTab === "machines") {
      fetch("/api/machines?t=" + Date.now(), { cache: "no-store" })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.machines) && res.machines.length > 0) {
            setData((prev) => {
              if (!prev) return prev;
              const updated = { ...prev, machines: res.machines };
              dataRef.current = updated;
              return updated;
            });
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const cleanSocialUrl = (url: string) => {
    if (!url) return "";
    let c = url.trim();
    while (c.startsWith("#")) c = c.slice(1).trim();
    if (!c) return "";
    if (!/^https?:\/\//i.test(c)) c = `https://${c}`;
    return c;
  };

  const handleSave = async (customData?: SiteData) => {
    const payload = customData || dataRef.current || data;
    if (!payload) return;
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      const sanitizedData: SiteData = {
        ...payload,
        socials: {
          instagram: cleanSocialUrl(payload.socials?.instagram || ""),
          facebook: cleanSocialUrl(payload.socials?.facebook || ""),
          youtube: cleanSocialUrl(payload.socials?.youtube || ""),
          linkedin: cleanSocialUrl(payload.socials?.linkedin || ""),
          twitter: cleanSocialUrl(payload.socials?.twitter || ""),
        },
        heroImages: (payload.heroImages || []).filter((h) => typeof h === "string" && h.trim() !== ""),
        clients: (payload.clients || []).filter((c) => c.name.trim() !== ""),
        machines: (payload.machines || []).filter((m) => m.name.trim() !== "").map((m, idx) => ({
          ...m,
          sortOrder: typeof m.sortOrder === "number" ? m.sortOrder : idx + 1,
        })),
        services: (payload.services || []).filter((s) => s.title && s.title.trim() !== "").map((s, idx) => ({
          ...s,
          sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : idx + 1,
        })),
      };

      // Validate client logo formats (must be JPG, JPEG, PNG, or WEBP if provided)
      for (const client of sanitizedData.clients || []) {
        if (client.logo && client.logo.trim()) {
          const l = client.logo.trim();
          const hasValidExt = /\.(jpe?g|png|webp)(\?.*)?$/i.test(l);
          const isUrlOrLocal = /^(https?:\/\/|\/)/i.test(l);
          if (!hasValidExt && !isUrlOrLocal) {
            showToast(`Logo for "${client.name}" must be a valid JPG, JPEG, PNG, or WEBP file`, "error");
            setSaving(false);
            return;
          }
        }
      }

      // Validate machine photo formats (must be JPG, JPEG, PNG, or WEBP if provided)
      for (const machine of sanitizedData.machines || []) {
        if (machine.image && machine.image.trim()) {
          const mImg = machine.image.trim();
          const hasValidExt = /\.(jpe?g|png|webp)(\?.*)?$/i.test(mImg);
          const isUrlOrLocal = /^(https?:\/\/|\/|data:image\/)/i.test(mImg);
          if (!hasValidExt && !isUrlOrLocal) {
            showToast(`Photo for "${machine.name}" must be a valid JPG, JPEG, PNG, or WEBP file`, "error");
            setSaving(false);
            return;
          }
        }
      }

      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });
      if (!res.ok) throw new Error("Save failed");

      // Also ensure Supabase services table directly updates sort_order
      if (sanitizedData.services && sanitizedData.services.length > 0) {
        fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ services: sanitizedData.services }),
        }).catch((err) => console.warn("Supabase services sync in handleSave error:", err));
      }

      // Also ensure Supabase machines table directly updates sort_order
      if (sanitizedData.machines && sanitizedData.machines.length > 0) {
        fetch("/api/machines", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ machines: sanitizedData.machines }),
        }).catch((err) => console.warn("Supabase machines sync in handleSave error:", err));
      }

      dataRef.current = sanitizedData;
      setData(sanitizedData);

      // Immediately propagate updates to localStorage and custom events
      // This synchronizes all open browser tabs and components instantly with ZERO page reload!
      try {
        localStorage.setItem("jalaram_site_content_v3", JSON.stringify(sanitizedData));
        localStorage.setItem("jalaram_site_content_v3_time", Date.now().toString());
        localStorage.setItem("jalaram_site_content_v2", JSON.stringify(sanitizedData));
        window.dispatchEvent(new CustomEvent("site-content-updated", { detail: sanitizedData }));
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel("jalaram_site_sync");
          bc.postMessage(sanitizedData);
          bc.close();
        }
      } catch {
        // safe fallback if storage is restricted
      }

      showToast("Saved successfully!", "success");
    } catch {
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  // Execute deletion after user confirms in popup
  const executeDelete = async () => {
    if (!deletePrompt) return;
    const { type, idOrIndex } = deletePrompt;

    if (type === "inquiry") {
      await handleDeleteInquiry(String(idOrIndex));
      setDeletePrompt(null);
      return;
    }

    if (!data) return;
    let updated: SiteData = { ...data };

    if (type === "portfolio") {
      updated = { ...updated, portfolio: updated.portfolio.filter((x) => x.id !== idOrIndex) };
    } else if (type === "service") {
      const serviceId = String(idOrIndex);
      fetch(`/api/services?id=${encodeURIComponent(serviceId)}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Direct Supabase service delete error:", err));
      updated = { ...updated, services: updated.services.filter((x) => x.id !== idOrIndex) };
    } else if (type === "team") {
      updated = { ...updated, team: updated.team.filter((x) => x.id !== idOrIndex) };
    } else if (type === "client") {
      updated = { ...updated, clients: (updated.clients || []).filter((x) => x.id !== idOrIndex) };
    } else if (type === "testimonial") {
      updated = { ...updated, testimonials: updated.testimonials.filter((x) => x.id !== idOrIndex) };
    } else if (type === "faq") {
      updated = { ...updated, faqs: updated.faqs.filter((x) => x.id !== idOrIndex) };
    } else if (type === "hero") {
      updated = { ...updated, heroImages: updated.heroImages.filter((_, idx) => idx !== idOrIndex) };
    } else if (type === "machine") {
      const machineId = String(idOrIndex);
      fetch(`/api/machines?id=${encodeURIComponent(machineId)}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Direct Supabase machine delete error:", err));
      updated = { ...updated, machines: (updated.machines || []).filter((x) => x.id !== idOrIndex) };
    }

    setData(updated);
    setDeletePrompt(null);
    await handleSave(updated);
  };

  const updateBusiness = (k: keyof Business, v: string) =>
    setData((p) => p ? { ...p, business: { ...p.business, [k]: v } } : p);

  const updateSocials = (k: keyof Socials, v: string) =>
    setData((p) => p ? { ...p, socials: { ...p.socials, [k]: v } } : p);

  const handleSocialBlur = (k: keyof Socials) => {
    if (!data) return;
    const current = data.socials[k] || "";
    const cleaned = cleanSocialUrl(current);
    if (cleaned !== current) {
      updateSocials(k, cleaned);
    }
    handleSave({
      ...data,
      socials: {
        ...data.socials,
        [k]: cleaned,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6F20E8]" />
          <p className="text-sm font-medium text-gray-500">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 font-medium">Failed to load content.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 flex flex-col md:flex-row">
      {/* ── MOBILE TOP BAR ────────────────────────────────────────── */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin" className="flex items-center">
            <Image
              src="https://res.cloudinary.com/v61ii2hr/image/upload/v1790398040/jalaram/jalaram_jalaram-logo_1790398041779.png"
              alt="Jalaram Digital Sign"
              width={160}
              height={34}
              className="h-7 w-auto object-contain mix-blend-multiply"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#6F20E8] bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg"
          >
            View Site ↗
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 border border-gray-200 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER BACKDROP ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR (DESKTOP & MOBILE DRAWER) ──────────────────────── */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Sidebar Header with Seamless Logo & Admin Panel Branding */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <Link href="/admin" className="flex items-center">
                <Image
                  src="https://res.cloudinary.com/v61ii2hr/image/upload/v1790398040/jalaram/jalaram_jalaram-logo_1790398041779.png"
                  alt="Jalaram Digital Sign"
                  width={180}
                  height={38}
                  className="h-8 w-auto object-contain mix-blend-multiply"
                  priority
                />
              </Link>
              <div>
                <h1 className="text-xs font-bold text-gray-900 tracking-tight">Admin Panel</h1>
                <p className="text-[10px] text-gray-400">Content &amp; Site Manager</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(t.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all text-left select-none cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white shadow-md shadow-[#6F20E8]/25 font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-purple-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate select-none">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate select-none">{t.label}</span>
                  </div>
                  {t.id === "inquiries" && inquiriesStats.new > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white text-[#6F20E8]" : "bg-amber-500 text-white"
                      }`}
                    >
                      {inquiriesStats.new}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with View Site Link & Logout Button */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#6F20E8] bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm"
          >
            View Site ↗
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl">
        <div className="space-y-6">
          {/* ── SOCIAL LINKS ────────────────────────────────────────── */}
          {activeTab === "business" && (
            <div className="space-y-6">
              <SectionHeader
                title="Business Contact & Details"
                subtitle="Configure company contact phone numbers, emails, office address, and social profiles."
                actionButton={
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save
                  </button>
                }
              />

              {/* Business Contact Details Card */}
              <div className={sectionCard}>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#6F20E8]" /> Business Contact Information
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Main phone and email, plus additional contact numbers and emails.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Company Name</label>
                    <input
                      type="text"
                      value={data.business.name || ""}
                      onChange={(e) => updateBusiness("name", e.target.value)}
                      placeholder="Jalaram Digital Sign"
                      className={field}
                    />
                  </div>

                  {/* Primary Phone */}
                  <div>
                    <label className={labelCls}>Primary Phone / Contact Number</label>
                    <input
                      type="text"
                      value={data.business.phone || ""}
                      onChange={(e) => updateBusiness("phone", e.target.value)}
                      placeholder="+91 85111 33363"
                      className={field}
                    />
                  </div>

                  {/* Secondary Phone */}
                  <div>
                    <label className={labelCls}>Secondary Contact Number</label>
                    <input
                      type="text"
                      value={data.business.extraPhone || ""}
                      onChange={(e) => updateBusiness("extraPhone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className={field}
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Shows on the main site only if entered.</p>
                  </div>

                  {/* Primary Email */}
                  <div>
                    <label className={labelCls}>Primary Contact Email</label>
                    <input
                      type="email"
                      value={data.business.email || ""}
                      onChange={(e) => updateBusiness("email", e.target.value)}
                      placeholder="jalaramdigitalsign@gmail.com"
                      className={field}
                    />
                  </div>

                  {/* Secondary Email */}
                  <div>
                    <label className={labelCls}>Secondary Email</label>
                    <input
                      type="email"
                      value={data.business.extraEmail || ""}
                      onChange={(e) => updateBusiness("extraEmail", e.target.value)}
                      placeholder="info@jalaramdigitalsign.com"
                      className={field}
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Shows on the main site only if entered.</p>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className={labelCls}>WhatsApp Number (without + symbol)</label>
                    <input
                      type="text"
                      value={data.business.whatsapp || ""}
                      onChange={(e) => updateBusiness("whatsapp", e.target.value)}
                      placeholder="918511133363"
                      className={field}
                    />
                  </div>

                  {/* Working Hours */}
                  <div>
                    <label className={labelCls}>Working / Operating Hours</label>
                    <input
                      type="text"
                      value={data.business.hours || ""}
                      onChange={(e) => updateBusiness("hours", e.target.value)}
                      placeholder="Mon - Sat: 9:00 AM - 8:00 PM"
                      className={field}
                    />
                  </div>

                  {/* Physical Address (Locked / Fixed Location) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls}>Full Workshop / Office Address</label>
                      <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 font-medium px-2 py-0.5 rounded-md">
                        🔒 Fixed Location (Cannot be changed)
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value="G-24, 25, 26, 31, Sector 11, Gandhinagar, Gujarat 382010, India"
                      className={`${field} bg-gray-100 text-gray-700 cursor-not-allowed border-dashed`}
                    />
                  </div>

                  {/* Maps Link (Locked) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls}>Google Maps Location URL</label>
                      <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 font-medium px-2 py-0.5 rounded-md">
                        🔒 Fixed Location URL (Cannot be changed)
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value="https://maps.google.com/?q=G-24%2C%2025%2C%2026%2C%2031%2C%20Sector%2011%2C%20Gandhinagar%2C%20Gujarat%20382010%2C%20India"
                      className={`${field} bg-gray-100 text-gray-700 cursor-not-allowed border-dashed`}
                    />
                  </div>

                  {/* Business Description */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Business Overview / Tagline</label>
                    <textarea
                      rows={3}
                      value={data.business.description || ""}
                      onChange={(e) => updateBusiness("description", e.target.value)}
                      placeholder="Professional digital printing, banners, signage, LED signs, vinyl printing..."
                      className={field}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Profiles Card */}
              <div className={sectionCard}>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#6F20E8]" /> Official Social Profiles
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["instagram", "facebook", "youtube", "linkedin", "twitter"] as (keyof Socials)[]).map((key) => (
                    <div key={key}>
                      <label className={labelCls}>
                        {key === "youtube"
                          ? "YouTube Channel URL"
                          : key === "linkedin"
                          ? "LinkedIn Profile URL"
                          : key === "twitter"
                          ? "Twitter / X Profile URL"
                          : key.charAt(0).toUpperCase() + key.slice(1) + " URL"}
                      </label>
                      <input
                        type="text"
                        value={data.socials[key] || ""}
                        onChange={(e) => updateSocials(key, e.target.value)}
                        onBlur={() => handleSocialBlur(key)}
                        placeholder={key === "twitter" ? "https://twitter.com/... or https://x.com/..." : `https://${key}.com/...`}
                        className={field}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HERO IMAGES (TABLE VIEW + MODAL POP SCREEN) ───────────── */}
          {activeTab === "hero" && (() => {
            const filteredHeroImages = data.heroImages
              .map((url, origIdx) => ({ url, origIdx }))
              .filter(({ url }) => !heroSearch.trim() || url.toLowerCase().includes(heroSearch.toLowerCase()));

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Hero Carousel Banners (${data.heroImages.length}/7)`}
                  subtitle="Manage up to 7 hero carousel banners. Reorder sequence, search, or click any row to view and edit in a popup modal."
                  searchBar={
                    <SearchBar
                      value={heroSearch}
                      onChange={setHeroSearch}
                      placeholder="Search hero banners by image URL..."
                      total={data.heroImages.length}
                      filtered={filteredHeroImages.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={data.heroImages.length >= 7}
                        onClick={() => {
                          if (data.heroImages.length >= 7) {
                            showToast("Maximum limit of 7 hero banners reached", "error");
                            return;
                          }
                          const newIdx = data.heroImages.length;
                          setData((p) => p ? { ...p, heroImages: [...p.heroImages, ""] } : p);
                          setActiveModal({ type: "hero", idOrIndex: newIdx, isNew: true, mode: "edit" });
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all border ${
                          data.heroImages.length >= 7
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-purple-50 hover:bg-purple-100 text-[#6F20E8] border-purple-200 cursor-pointer"
                        }`}
                      >
                        <Plus className="w-4 h-4" /> {data.heroImages.length >= 7 ? "Max 7 Reached" : "Add Banner"}
                      </button>
                    </div>
                  }
                />

                {data.heroImages.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No hero images added yet</p>
                  </div>
                ) : filteredHeroImages.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No hero banners matching &quot;{heroSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setHeroSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[520px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-20 whitespace-nowrap">Slide / Order</th>
                          <th className="py-3.5 px-4 w-28">Preview</th>
                          <th className="py-3.5 px-4 min-w-[180px]">Image Source</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredHeroImages.map(({ url, origIdx }) => (
                          <tr
                            key={origIdx}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, "heroImages", origIdx)}
                            onDragOver={(e) => handleDragOver(e, "heroImages", origIdx)}
                            onDragLeave={() => handleDragLeave("heroImages", origIdx)}
                            onDrop={(e) => handleDrop(e, "heroImages", origIdx)}
                            onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
                            onClick={() => setActiveModal({ type: "hero", idOrIndex: origIdx, mode: "view" })}
                            className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                              draggedItem?.section === "heroImages" && draggedItem?.id === origIdx ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                            } ${
                              dragOverItem?.section === "heroImages" && dragOverItem?.id === origIdx ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                            }`}
                          >
                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5">
                                <span
                                  className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                  title="Drag row to reorder sequence"
                                  aria-label="Drag handle"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </span>
                                <span className="w-6 h-6 rounded-full bg-purple-50 text-[#6F20E8] font-bold text-xs inline-flex items-center justify-center border border-purple-200">
                                  {origIdx + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                {url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={url} alt={`Slide ${origIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-gray-300" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900 truncate max-w-md">{url || <span className="text-gray-400 italic">No image URL configured</span>}</p>
                              <span className="text-xs text-gray-400">Click to view details</span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setActiveModal({ type: "hero", idOrIndex: origIdx, mode: "view" })}
                                  className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                  title="View details (Read Only)"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveModal({ type: "hero", idOrIndex: origIdx, mode: "edit" })}
                                  className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                  title="Edit details"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletePrompt({ type: "hero", idOrIndex: origIdx, name: `Hero Slide ${origIdx + 1}` })}
                                  className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  title="Delete Slide"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── CLIENT LOGOS MARQUEE (TABLE VIEW + MODAL POP SCREEN) ──── */}
          {activeTab === "clients" && (() => {
            const clientList = data.clients || [];
            const filteredClients = clientList.filter((c) =>
              !clientsSearch.trim() ||
              c.name.toLowerCase().includes(clientsSearch.toLowerCase()) ||
              (c.tag && c.tag.toLowerCase().includes(clientsSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Client Companies & Marquee Logos (${clientList.length})`}
                  subtitle="All client entries displayed in a table. Reorder sequence, search, or click any entry to view and edit in a popup modal."
                  searchBar={
                    <SearchBar
                      value={clientsSearch}
                      onChange={setClientsSearch}
                      placeholder="Search clients by name or category tag..."
                      total={clientList.length}
                      filtered={filteredClients.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newClient: ClientCompany = {
                            id: `client-${genId()}`,
                            name: "",
                            tag: "",
                            logo: "",
                          };
                          setData((p) => p ? { ...p, clients: [...(p.clients || []), newClient] } : p);
                          setActiveModal({ type: "client", idOrIndex: newClient.id, isNew: true, mode: "edit" });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                      >
                        <Plus className="w-4 h-4" /> Add Client Company
                      </button>
                    </div>
                  }
                />

                {/* Logo Photo Validation Notice */}
                <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-900 font-medium flex items-center gap-2.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#6F20E8] shrink-0" />
                  <span>
                    <strong>Client Logo Validation:</strong> Photos must be in <strong>JPG, JPEG, PNG, or WEBP</strong> format and up to <strong>5 MB</strong> in size. Logos are displayed seamlessly without background boxes.
                  </span>
                </div>

                {clientList.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No client companies added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click &quot;Add Client Company&quot; above to add brands.</p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No client companies matching &quot;{clientsSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setClientsSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[560px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap"># / Order</th>
                          <th className="py-3.5 px-4 w-20">Logo</th>
                          <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Company / Institution Name</th>
                          <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Category / Tag</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredClients.map((client) => {
                          const origIdx = clientList.findIndex((x) => x.id === client.id);
                          return (
                            <tr
                              key={client.id || origIdx}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, "clients", client.id)}
                              onDragOver={(e) => handleDragOver(e, "clients", client.id)}
                              onDragLeave={() => handleDragLeave("clients", client.id)}
                              onDrop={(e) => handleDrop(e, "clients", client.id)}
                              onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
                              onClick={() => setActiveModal({ type: "client", idOrIndex: client.id, mode: "view" })}
                              className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                                draggedItem?.section === "clients" && draggedItem?.id === client.id ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                              } ${
                                dragOverItem?.section === "clients" && dragOverItem?.id === client.id ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                              }`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                    title="Drag row to reorder sequence"
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 w-4 text-center">{origIdx + 1}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="w-16 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                  {client.logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={client.logo} alt={client.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                                  ) : (
                                    <Building2 className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-bold text-gray-900 leading-tight">{client.name || "Untitled Client"}</div>
                                <span className="text-[11px] font-normal text-gray-400">Click to view details</span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {client.tag ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                                    {client.tag}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "client", idOrIndex: client.id, mode: "view" })}
                                    className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                    title="View details (Read Only)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "client", idOrIndex: client.id, mode: "edit" })}
                                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletePrompt({ type: "client", idOrIndex: client.id, name: client.name || "this client" })}
                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Remove Client"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── PORTFOLIO (TABLE VIEW + MODAL POP SCREEN) ─────────────── */}
          {activeTab === "portfolio" && (() => {
            const filteredPortfolio = data.portfolio.filter((item) =>
              !portfolioSearch.trim() ||
              item.title.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.category.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              (item.location && item.location.toLowerCase().includes(portfolioSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Portfolio Projects (${data.portfolio.length})`}
                  subtitle="All projects organized in a table. Reorder sequence, search, or click any row to view and edit details in a popup modal screen."
                  searchBar={
                    <SearchBar
                      value={portfolioSearch}
                      onChange={setPortfolioSearch}
                      placeholder="Search portfolio by title, category, location..."
                      total={data.portfolio.length}
                      filtered={filteredPortfolio.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newItem: PortfolioItem = {
                            id: genId(),
                            slug: `project-${genId()}`,
                            title: "",
                            category: "Hoardings",
                            image: "",
                            images: [],
                            location: "",
                            featured: false,
                            sortOrder: data.portfolio.length + 1,
                          };
                          setData((p) => p ? { ...p, portfolio: [...p.portfolio, newItem] } : p);
                          setActiveModal({ type: "portfolio", idOrIndex: newItem.id, isNew: true, mode: "edit" });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                      >
                        <Plus className="w-4 h-4" /> Add Project
                      </button>
                    </div>
                  }
                />

                {data.portfolio.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No portfolio projects found</p>
                  </div>
                ) : filteredPortfolio.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No portfolio projects matching &quot;{portfolioSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setPortfolioSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[680px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap"># / Order</th>
                          <th className="py-3.5 px-4 w-20">Photo</th>
                          <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Project Title</th>
                          <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Category</th>
                          <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Location</th>
                          <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredPortfolio.map((item) => {
                          const origIdx = data.portfolio.findIndex((x) => x.id === item.id);
                          return (
                            <tr
                              key={item.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, "portfolio", item.id)}
                              onDragOver={(e) => handleDragOver(e, "portfolio", item.id)}
                              onDragLeave={() => handleDragLeave("portfolio", item.id)}
                              onDrop={(e) => handleDrop(e, "portfolio", item.id)}
                              onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
                              onClick={() => setActiveModal({ type: "portfolio", idOrIndex: item.id, mode: "view" })}
                              className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                                draggedItem?.section === "portfolio" && draggedItem?.id === item.id ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                              } ${
                                dragOverItem?.section === "portfolio" && dragOverItem?.id === item.id ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                              }`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                    title="Drag row to reorder sequence"
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 w-4 text-center">{origIdx + 1}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                  {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-bold text-gray-900 leading-tight">{item.title || "Untitled Project"}</div>
                                <span className="text-[11px] font-normal text-gray-400">Click to view details</span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#6F20E8] border border-purple-200 whitespace-nowrap">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-gray-600 text-xs font-medium">
                                {item.location || "—"}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {item.featured ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Featured
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Standard</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "portfolio", idOrIndex: item.id, mode: "view" })}
                                    className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                    title="View details (Read Only)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "portfolio", idOrIndex: item.id, mode: "edit" })}
                                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletePrompt({ type: "portfolio", idOrIndex: item.id, name: item.title || "this project" })}
                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Delete Project"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── SERVICES (TABLE VIEW + MODAL POP SCREEN) ──────────────── */}
          {activeTab === "services" && (() => {
            const filteredServices = data.services.filter((svc) =>
              !servicesSearch.trim() ||
              svc.title.toLowerCase().includes(servicesSearch.toLowerCase()) ||
              svc.category.toLowerCase().includes(servicesSearch.toLowerCase()) ||
              (svc.shortDescription && svc.shortDescription.toLowerCase().includes(servicesSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Services (${data.services.length})`}
                  subtitle="All services listed in a table. Reorder sequence, search, or click any entry to view and edit details in a popup modal."
                  searchBar={
                    <SearchBar
                      value={servicesSearch}
                      onChange={setServicesSearch}
                      placeholder="Search services by title, category, description..."
                      total={data.services.length}
                      filtered={filteredServices.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const s: Service = {
                            id: genId(),
                            slug: `service-${genId()}`,
                            title: "",
                            shortDescription: "",
                            description: "",
                            image: "",
                            category: "Flex Banner",
                            features: [],
                            featured: false,
                            sortOrder: data.services.length + 1,
                          };
                          setData((p) => p ? { ...p, services: [...p.services, s] } : p);
                          setActiveModal({ type: "service", idOrIndex: s.id, isNew: true, mode: "edit" });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                      >
                        <Plus className="w-4 h-4" /> Add Service
                      </button>
                    </div>
                  }
                />

                {data.services.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No services found</p>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No services matching &quot;{servicesSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setServicesSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[640px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap"># / Order</th>
                          <th className="py-3.5 px-4 w-20">Photo</th>
                          <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Service Title</th>
                          <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Category</th>
                          <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Key Features</th>
                          <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredServices.map((svc) => {
                          const origIdx = data.services.findIndex((x) => x.id === svc.id);
                          return (
                            <tr
                              key={svc.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, "services", svc.id)}
                              onDragOver={(e) => handleDragOver(e, "services", svc.id)}
                              onDragLeave={() => handleDragLeave("services", svc.id)}
                              onDrop={(e) => handleDrop(e, "services", svc.id)}
                              onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
                              onClick={() => setActiveModal({ type: "service", idOrIndex: svc.id, mode: "view" })}
                              className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                                draggedItem?.section === "services" && draggedItem?.id === svc.id ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                              } ${
                                dragOverItem?.section === "services" && dragOverItem?.id === svc.id ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                              }`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                    title="Drag row to reorder sequence"
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 w-4 text-center">{origIdx + 1}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                  {svc.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  ) : (
                                    <Briefcase className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-gray-900 leading-tight">{svc.title || "Untitled Service"}</div>
                                {svc.shortDescription ? (
                                  <p className="text-[11px] text-gray-500 line-clamp-1 max-w-xs">{svc.shortDescription}</p>
                                ) : (
                                  <span className="text-[11px] font-normal text-gray-400">Click to view/edit details</span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#6F20E8] border border-purple-200 whitespace-nowrap">
                                  {svc.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-gray-600 text-xs">
                                <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 whitespace-nowrap inline-flex items-center gap-1">
                                  • {svc.features?.length || 0} bullet point(s)
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {svc.featured ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Featured
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Standard</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "service", idOrIndex: svc.id, mode: "view" })}
                                    className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                    title="View details (Read Only)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "service", idOrIndex: svc.id, mode: "edit" })}
                                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletePrompt({ type: "service", idOrIndex: svc.id, name: svc.title || "this service" })}
                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Delete Service"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── MACHINES (TABLE VIEW + MODAL POP SCREEN) ──────────────── */}
          {activeTab === "machines" && (() => {
            const machineList = data.machines || [];
            const filteredMachines = machineList.filter((m) =>
              !machinesSearch.trim() ||
              m.name.toLowerCase().includes(machinesSearch.toLowerCase()) ||
              (m.gujaratiName && m.gujaratiName.toLowerCase().includes(machinesSearch.toLowerCase())) ||
              (m.badge && m.badge.toLowerCase().includes(machinesSearch.toLowerCase())) ||
              (m.tagline && m.tagline.toLowerCase().includes(machinesSearch.toLowerCase())) ||
              (m.speedOrSpec && m.speedOrSpec.toLowerCase().includes(machinesSearch.toLowerCase())) ||
              (m.idealFor && m.idealFor.toLowerCase().includes(machinesSearch.toLowerCase())) ||
              (m.description && m.description.toLowerCase().includes(machinesSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Shop Machinery & Equipment (${machineList.length})`}
                  subtitle="Manage heavy printing machinery, specs, photos, and capabilities. Reorder sequence, search, or click any entry to view and edit details."
                  searchBar={
                    <SearchBar
                      value={machinesSearch}
                      onChange={setMachinesSearch}
                      placeholder="Search machines by name, badge, specs..."
                      total={machineList.length}
                      filtered={filteredMachines.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newMachine: MachineItem = {
                            id: `machine-${genId()}`,
                            name: "",
                            gujaratiName: "",
                            badge: "",
                            image: "",
                            tagline: "",
                            description: "",
                            capabilities: [],
                            idealFor: "",
                            speedOrSpec: "",
                            sortOrder: (machineList.length || 0) + 1,
                          };
                          setNewMachineDraft(newMachine);
                          setModalError(null);
                          setActiveModal({ type: "machine", idOrIndex: newMachine.id, isNew: true, mode: "edit" });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                      >
                        <Plus className="w-4 h-4" /> Add Machine
                      </button>
                    </div>
                  }
                />

                {/* Machine Photo & Ordering Validation Notice */}
                <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-900 font-medium flex items-center gap-2.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#6F20E8] shrink-0" />
                  <span>
                    <strong>Machine Validation &amp; Ordering:</strong> Machine photos must be in <strong>JPG, JPEG, PNG, or WEBP</strong> format and up to <strong>5 MB</strong> (min 50×50px). Use the <strong>drag handle (⋮⋮)</strong> on any row to decide the order; the sequence updates on the site instantly.
                  </span>
                </div>

                {machineList.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No machinery entries added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click &quot;Add Machine&quot; above to add your shop&apos;s printers and cutters.</p>
                  </div>
                ) : filteredMachines.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No machinery matching &quot;{machinesSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setMachinesSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[720px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap"># / Order</th>
                          <th className="py-3.5 px-4 w-20">Photo</th>
                          <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Machine Name &amp; Gujarati</th>
                          <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Badge / Type</th>
                          <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Key Specs &amp; Capabilities</th>
                          <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Ideal Applications</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredMachines.map((m) => {
                          const origIdx = machineList.findIndex((x) => x.id === m.id);
                          const isDragging = draggedMachineId === m.id;
                          const isDragOver = dragOverMachineId === m.id;

                          return (
                            <tr
                              key={m.id}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", m.id);
                                e.dataTransfer.effectAllowed = "move";
                                setDraggedMachineId(m.id);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                                if (dragOverMachineId !== m.id) {
                                  setDragOverMachineId(m.id);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverMachineId === m.id) {
                                  setDragOverMachineId(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const sourceId = e.dataTransfer.getData("text/plain") || draggedMachineId;
                                setDraggedMachineId(null);
                                setDragOverMachineId(null);
                                if (!sourceId || sourceId === m.id || !data?.machines) return;

                                const list = [...data.machines];
                                const fromIndex = list.findIndex((x) => x.id === sourceId);
                                const toIndex = list.findIndex((x) => x.id === m.id);

                                if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

                                const [moved] = list.splice(fromIndex, 1);
                                list.splice(toIndex, 0, moved);

                                const reordered = list.map((item, idx) => ({
                                  ...item,
                                  sortOrder: idx + 1,
                                }));

                                const updated: SiteData = { ...data, machines: reordered };
                                dataRef.current = updated;
                                setData(updated);
                                fetch("/api/machines", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ machines: reordered }),
                                }).catch((err) => console.warn("Supabase machines reorder sync error:", err));
                                handleSave(updated);
                              }}
                              onDragEnd={() => {
                                setDraggedMachineId(null);
                                setDragOverMachineId(null);
                              }}
                              onClick={() => setActiveModal({ type: "machine", idOrIndex: m.id, mode: "view" })}
                              className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                                isDragging ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                              } ${
                                isDragOver ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                              }`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                    title="Drag row to reorder sequence"
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 w-4 text-center">{origIdx + 1}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                  {m.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  ) : (
                                    <Cpu className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-gray-900 leading-tight">{m.name || "Untitled Machine"}</div>
                                {m.gujaratiName && (
                                  <div className="text-xs font-medium text-[#6F20E8] mt-0.5">{m.gujaratiName}</div>
                                )}
                                {m.tagline ? (
                                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{m.tagline}</p>
                                ) : (
                                  <span className="text-[11px] font-normal text-gray-400">Click to view/edit details</span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {m.badge ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#6F20E8] border border-purple-200 whitespace-nowrap">
                                    {m.badge}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-600">
                                <div>
                                  <span className="font-medium text-gray-800">{m.speedOrSpec || "—"}</span>
                                </div>
                                <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200 whitespace-nowrap inline-flex items-center gap-1 mt-1">
                                  • {(m.capabilities || []).length} capability point(s)
                                </span>
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-500 max-w-xs truncate">
                                {m.idealFor || "—"}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "machine", idOrIndex: m.id, mode: "view" })}
                                    className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                    title="View details (Read Only)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "machine", idOrIndex: m.id, mode: "edit" })}
                                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletePrompt({ type: "machine", idOrIndex: m.id, name: m.name || "this machine" })}
                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Delete Machine"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TEAM (TABLE VIEW + MODAL POP SCREEN) ─────────────────── */}
          {activeTab === "team" && (() => {
            const filteredTeam = data.team.filter((m) =>
              !teamSearch.trim() ||
              m.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
              m.role.toLowerCase().includes(teamSearch.toLowerCase()) ||
              (m.bio && m.bio.toLowerCase().includes(teamSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Team Members (${data.team.length})`}
                  subtitle="All team members displayed in a table. Reorder sequence, search, or click any row or action icon to view and edit details in a popup modal."
                  searchBar={
                    <SearchBar
                      value={teamSearch}
                      onChange={setTeamSearch}
                      placeholder="Search team members by name, role, bio..."
                      total={data.team.length}
                      filtered={filteredTeam.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const m: TeamMember = {
                            id: genId(),
                            name: "",
                            role: "",
                            bio: "",
                            image: "",
                            socialLinks: {},
                            sortOrder: data.team.length + 1,
                          };
                          setData((p) => p ? { ...p, team: [...p.team, m] } : p);
                          setActiveModal({ type: "team", idOrIndex: m.id, isNew: true, mode: "edit" });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                      >
                        <Plus className="w-4 h-4" /> Add Member
                      </button>
                    </div>
                  }
                />

                {data.team.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No team members added yet</p>
                  </div>
                ) : filteredTeam.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No team members matching &quot;{teamSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setTeamSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[580px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap"># / Order</th>
                          <th className="py-3.5 px-4 w-20">Photo</th>
                          <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Full Name</th>
                          <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Role / Position</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredTeam.map((m) => {
                          const origIdx = data.team.findIndex((x) => x.id === m.id);
                          return (
                            <tr
                              key={m.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, "team", m.id)}
                              onDragOver={(e) => handleDragOver(e, "team", m.id)}
                              onDragLeave={() => handleDragLeave("team", m.id)}
                              onDrop={(e) => handleDrop(e, "team", m.id)}
                              onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
                              onClick={() => setActiveModal({ type: "team", idOrIndex: m.id, mode: "view" })}
                              className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                                draggedItem?.section === "team" && draggedItem?.id === m.id ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                              } ${
                                dragOverItem?.section === "team" && dragOverItem?.id === m.id ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                              }`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                    title="Drag row to reorder sequence"
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 w-4 text-center">{origIdx + 1}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                  {m.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform" />
                                  ) : (
                                    <Users className="w-5 h-5 text-gray-300" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-gray-900 leading-tight">{m.name || "Untitled Member"}</div>
                                {m.bio ? (
                                  <p className="text-[11px] text-gray-500 line-clamp-1 max-w-xs">{m.bio}</p>
                                ) : (
                                  <span className="text-[11px] font-normal text-gray-400">Click to view/edit details</span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center font-semibold text-xs text-[#6F20E8] bg-purple-50 px-3 py-1 rounded-full border border-purple-200 shadow-sm whitespace-nowrap">
                                  {m.role || "Member"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "team", idOrIndex: m.id, mode: "view" })}
                                    className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                    title="View details (Read Only)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "team", idOrIndex: m.id, mode: "edit" })}
                                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletePrompt({ type: "team", idOrIndex: m.id, name: m.name || "this member" })}
                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Delete Member"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TESTIMONIALS (TABLE VIEW + MODAL POP SCREEN) ─────────── */}
          {activeTab === "testimonials" && (() => {
            const filteredReviews = data.testimonials.filter((t) =>
              !testimonialsSearch.trim() ||
              t.name.toLowerCase().includes(testimonialsSearch.toLowerCase()) ||
              (t.business && t.business.toLowerCase().includes(testimonialsSearch.toLowerCase())) ||
              (t.quote && t.quote.toLowerCase().includes(testimonialsSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Client Reviews (${data.testimonials.length}/30)`}
                  subtitle="All client reviews listed in a table (up to 30 maximum). Reorder sequence, search, or click any entry to view and edit details in a popup modal."
                  searchBar={
                    <SearchBar
                      value={testimonialsSearch}
                      onChange={setTestimonialsSearch}
                      placeholder="Search reviews by name, business, quote..."
                      total={data.testimonials.length}
                      filtered={filteredReviews.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={data.testimonials.length >= 30}
                        onClick={() => {
                          if (data.testimonials.length >= 30) {
                            showToast("You can have a maximum of 30 client reviews.", "error");
                            return;
                          }
                          const newT = { id: genId(), name: "", business: "", quote: "", rating: 5 };
                          setData((p) => p ? { ...p, testimonials: [...p.testimonials, newT] } : p);
                          setActiveModal({ type: "testimonial", idOrIndex: newT.id, isNew: true, mode: "edit" });
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md ${
                          data.testimonials.length >= 30
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white shadow-[#6F20E8]/20"
                        }`}
                      >
                        <Plus className="w-4 h-4" /> {data.testimonials.length >= 30 ? "Limit Reached (30)" : "Add Review"}
                      </button>
                    </div>
                  }
                />

                {data.testimonials.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No reviews found</p>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No reviews matching &quot;{testimonialsSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setTestimonialsSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[660px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap"># / Order</th>
                          <th className="py-3.5 px-4 w-28 whitespace-nowrap">Rating</th>
                          <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Client Name</th>
                          <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Business</th>
                          <th className="py-3.5 px-4 min-w-[200px]">Review Quote</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredReviews.map((t) => {
                          const origIdx = data.testimonials.findIndex((x) => x.id === t.id);
                          return (
                            <tr
                              key={t.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, "testimonials", t.id)}
                              onDragOver={(e) => handleDragOver(e, "testimonials", t.id)}
                              onDragLeave={() => handleDragLeave("testimonials", t.id)}
                              onDrop={(e) => handleDrop(e, "testimonials", t.id)}
                              onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
                              onClick={() => setActiveModal({ type: "testimonial", idOrIndex: t.id, mode: "view" })}
                              className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                                draggedItem?.section === "testimonials" && draggedItem?.id === t.id ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                              } ${
                                dragOverItem?.section === "testimonials" && dragOverItem?.id === t.id ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                              }`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                    title="Drag row to reorder sequence"
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 w-4 text-center">{origIdx + 1}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-0.5">
                                  {[1,2,3,4,5].map((s) => (
                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                                {t.name || "Client"}
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                                {t.business || "—"}
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-500 max-w-sm truncate">
                                &quot;{t.quote}&quot;
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "testimonial", idOrIndex: t.id, mode: "view" })}
                                    className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                    title="View details (Read Only)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "testimonial", idOrIndex: t.id, mode: "edit" })}
                                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletePrompt({ type: "testimonial", idOrIndex: t.id, name: t.name || "this review" })}
                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Delete Review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── FAQS (TABLE VIEW + MODAL POP SCREEN) ──────────────────── */}
          {activeTab === "faqs" && (() => {
            const filteredFaqs = data.faqs.filter((faq) =>
              !faqsSearch.trim() ||
              faq.question.toLowerCase().includes(faqsSearch.toLowerCase()) ||
              faq.answer.toLowerCase().includes(faqsSearch.toLowerCase())
            );

            return (
              <div className="space-y-6">
                <SectionHeader
                  title={`Frequently Asked Questions (${data.faqs.length})`}
                  subtitle="All questions listed in a table. Reorder sequence, search, or click any entry or action icon to view and edit details in a popup modal."
                  searchBar={
                    <SearchBar
                      value={faqsSearch}
                      onChange={setFaqsSearch}
                      placeholder="Search FAQs by question or answer..."
                      total={data.faqs.length}
                      filtered={filteredFaqs.length}
                    />
                  }
                  actionButton={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newFaq = { id: genId(), question: "", answer: "" };
                          setData((p) => p ? { ...p, faqs: [...p.faqs, newFaq] } : p);
                          setActiveModal({ type: "faq", idOrIndex: newFaq.id, isNew: true, mode: "edit" });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                      >
                        <Plus className="w-4 h-4" /> Add FAQ
                      </button>
                    </div>
                  }
                />

                {data.faqs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No FAQs found</p>
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No FAQs matching &quot;{faqsSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setFaqsSearch("")}
                      className="mt-2 text-xs font-semibold text-[#6F20E8] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[560px] text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap">Q# / Order</th>
                          <th className="py-3.5 px-4 min-w-[180px]">Question</th>
                          <th className="py-3.5 px-4 min-w-[240px]">Answer Preview</th>
                          <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredFaqs.map((faq) => {
                          const origIdx = data.faqs.findIndex((x) => x.id === faq.id);
                          return (
                            <tr
                              key={faq.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, "faqs", faq.id)}
                              onDragOver={(e) => handleDragOver(e, "faqs", faq.id)}
                              onDragLeave={() => handleDragLeave("faqs", faq.id)}
                              onDrop={(e) => handleDrop(e, "faqs", faq.id)}
                              onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
                              onClick={() => setActiveModal({ type: "faq", idOrIndex: faq.id, mode: "view" })}
                              className={`hover:bg-purple-50/50 transition-all cursor-pointer group ${
                                draggedItem?.section === "faqs" && draggedItem?.id === faq.id ? "opacity-30 bg-purple-100 scale-[0.99]" : ""
                              } ${
                                dragOverItem?.section === "faqs" && dragOverItem?.id === faq.id ? "border-t-2 border-[#6F20E8] bg-purple-50/80 shadow-inner" : ""
                              }`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="text-gray-400 hover:text-[#6F20E8] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100 transition-colors"
                                    title="Drag row to reorder sequence"
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 w-6 text-center">Q{origIdx + 1}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-bold text-gray-900 max-w-xs truncate">
                                {faq.question}
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-500 max-w-md truncate">
                                {faq.answer}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "faq", idOrIndex: faq.id, mode: "view" })}
                                    className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                    title="View details (Read Only)"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveModal({ type: "faq", idOrIndex: faq.id, mode: "edit" })}
                                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                    title="Edit details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletePrompt({ type: "faq", idOrIndex: faq.id, name: faq.question || "this FAQ" })}
                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Delete FAQ"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── INQUIRIES & LEADS MANAGEMENT ────────────────────────── */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <SectionHeader
                title="Customer Inquiries & Leads"
                subtitle="Review all quotation requests and inquiries submitted through the website. Connect directly via WhatsApp or Phone."
                actionButton={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchInquiries}
                      disabled={inquiriesLoading}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs md:text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                      title="Reload inquiries"
                    >
                      <RefreshCw className={`w-4 h-4 ${inquiriesLoading ? "animate-spin text-[#6F20E8]" : ""}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportInquiriesCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20 cursor-pointer"
                      title="Download inquiries as spreadsheet (.csv)"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                }
              />

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Inquiries</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{inquiriesStats.total}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">All time submissions</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6F20E8] flex items-center justify-center">
                    <Inbox className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">New / Pending</p>
                      {inquiriesStats.new > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{inquiriesStats.new}</p>
                    <p className="text-[11px] text-amber-700/80 mt-0.5">Requires response</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/20 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">{inquiriesStats.inProgress}</p>
                    <p className="text-[11px] text-blue-700/80 mt-0.5">Under discussion / proofing</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                      {inquiriesStats.contacted + inquiriesStats.completed}
                    </p>
                    <p className="text-[11px] text-emerald-700/80 mt-0.5">Contacted or finished</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Search & Status Filter Controls */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inquiriesSearch}
                    onChange={(e) => setInquiriesSearch(e.target.value)}
                    placeholder="Search by customer, phone, company, service..."
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#6F20E8] focus:bg-white rounded-xl text-xs md:text-sm text-gray-900 focus:outline-none transition-all"
                  />
                  {inquiriesSearch && (
                    <button
                      type="button"
                      onClick={() => setInquiriesSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {[
                    { id: "all", label: "All", count: inquiries.length },
                    { id: "new", label: "New", count: inquiriesStats.new },
                    { id: "in-progress", label: "In Progress", count: inquiriesStats.inProgress },
                    { id: "contacted", label: "Contacted", count: inquiriesStats.contacted },
                    { id: "completed", label: "Completed", count: inquiriesStats.completed },
                  ].map((filter) => {
                    const isSelected = inquiriesFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setInquiriesFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-[#6F20E8] text-white shadow-sm font-bold"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                      >
                        <span>{filter.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inquiries List View */}
              {(() => {
                const q = inquiriesSearch.toLowerCase().trim();
                const filtered = inquiries.filter((inq) => {
                  const matchesFilter = inquiriesFilter === "all" || inq.status === inquiriesFilter;
                  const matchesSearch =
                    !q ||
                    inq.name.toLowerCase().includes(q) ||
                    inq.phone.toLowerCase().includes(q) ||
                    (inq.email && inq.email.toLowerCase().includes(q)) ||
                    (inq.company && inq.company.toLowerCase().includes(q)) ||
                    (inq.service && inq.service.toLowerCase().includes(q)) ||
                    inq.message.toLowerCase().includes(q);
                  return matchesFilter && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                      <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6F20E8] flex items-center justify-center mx-auto mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">No Inquiries Found</h3>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        {inquiriesSearch || inquiriesFilter !== "all"
                          ? "No inquiries match your current search or filter criteria."
                          : "When customers submit the contact or quotation form on your website, inquiries will appear here."}
                      </p>
                      {(inquiriesSearch || inquiriesFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setInquiriesSearch("");
                            setInquiriesFilter("all");
                          }}
                          className="mt-4 text-xs font-bold text-[#6F20E8] hover:underline"
                        >
                          Reset filters
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map((inq) => {
                      const cleanPhone = inq.phone.replace(/[^0-9]/g, "");
                      const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone;
                      const waText = encodeURIComponent(
                        `Hello ${inq.name}, thank you for reaching out to Jalaram Digital Sign regarding "${inq.service || "your requirement"}". We reviewed your inquiry and would be happy to discuss details and provide a quote.`
                      );
                      const waUrl = `https://wa.me/${formattedPhone}?text=${waText}`;

                      const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                        new: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
                        "in-progress": { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
                        contacted: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
                        completed: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
                      };

                      const currentStatusColor = statusColors[inq.status] || statusColors.new;

                      return (
                        <div
                          key={inq.id}
                          className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-sm hover:shadow-md ${
                            inq.status === "new" ? "border-amber-300 ring-1 ring-amber-200/50" : "border-gray-200"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6F20E8] to-[#9B51E0] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                                {inq.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-base text-gray-900">{inq.name}</h3>
                                  {inq.company && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-semibold">
                                      <Building2 className="w-3 h-3 text-gray-400" />
                                      {inq.company}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Selector & Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <div className="flex items-center gap-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                                  Status:
                                </label>
                                <select
                                  value={inq.status}
                                  onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${currentStatusColor.bg} ${currentStatusColor.text} ${currentStatusColor.border}`}
                                >
                                  <option value="new">🟡 New</option>
                                  <option value="in-progress">🔵 In Progress</option>
                                  <option value="contacted">🟣 Contacted</option>
                                  <option value="completed">🟢 Completed</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeletePrompt({
                                    type: "inquiry",
                                    idOrIndex: inq.id,
                                    name: `inquiry from ${inq.name}`,
                                  })
                                }
                                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                                title="Delete Inquiry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Service Badge & Message Content */}
                          <div className="py-4 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Requested Service:
                              </span>
                              <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#6F20E8] text-xs font-bold">
                                {inq.service || "General Inquiry"}
                              </span>
                            </div>

                            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 text-sm text-gray-800 leading-relaxed">
                              <p className="whitespace-pre-wrap">{inq.message}</p>
                            </div>
                          </div>

                          {/* Quick Contact & Action Buttons */}
                          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* WhatsApp Direct Link */}
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-sm shadow-[#25D366]/20 cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp Client</span>
                              </a>

                              {/* Phone Link */}
                              <a
                                href={`tel:${inq.phone.replace(/\s/g, "")}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-purple-50 hover:text-[#6F20E8] text-gray-700 text-xs font-semibold border border-gray-200 transition-all cursor-pointer"
                              >
                                <Phone className="w-3.5 h-3.5 text-gray-500" />
                                <span>{inq.phone}</span>
                              </a>

                              {/* Email Link (if provided) */}
                              {inq.email && (
                                <a
                                  href={`mailto:${inq.email}`}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-purple-50 hover:text-[#6F20E8] text-gray-700 text-xs font-semibold border border-gray-200 transition-all cursor-pointer"
                                >
                                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                                  <span>{inq.email}</span>
                                </a>
                              )}
                            </div>

                            {inq.status === "new" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateInquiryStatus(inq.id, "contacted")}
                                className="text-xs font-bold text-[#6F20E8] hover:text-[#5815BD] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors cursor-pointer"
                              >
                                Mark as Contacted ✓
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      {/* ── DELETE CONFIRMATION POPUP MODAL ───────────────────────── */}
      {deletePrompt && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setDeletePrompt(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4 text-center my-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Are you sure you want to delete?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-gray-800">&quot;{deletePrompt.name}&quot;</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletePrompt(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL POP SCREENS ─────────────────────────────────────── */}
      {/* 1. Portfolio Modal */}
      {activeModal?.type === "portfolio" && (() => {
        const item = data.portfolio.find((x) => x.id === activeModal.idOrIndex);
        if (!item) return null;
        const isReadOnly = activeModal.mode === "view";
        return (
          <ModalWrapper
            title={isReadOnly ? "View Portfolio Project" : "Edit Portfolio Project"}
            subtitle={isReadOnly ? "Project specifications, cover photo, and gallery (Read Only)" : "View or edit project specifications, cover photo, and gallery"}
            icon={<LayoutGrid className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              const latestData = dataRef.current || data;
              const currentItem = latestData?.portfolio.find((x) => x.id === item.id);
              if (!currentItem?.title || !currentItem.title.trim()) {
                setModalError("Project Title is required. Please fill in the project title before saving.");
                return;
              }
              setModalError(null);
              await handleSave(latestData);
              closeModal();
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Project Title *</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={item.title}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    setModalError(null);
                    const base = dataRef.current || data;
                    if (!base) return;
                    const updated = {
                      ...base,
                      portfolio: base.portfolio.map((x) => x.id === item.id ? {
                        ...x,
                        title: e.target.value,
                        slug: x.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                      } : x)
                    };
                    dataRef.current = updated;
                    setData(updated);
                  }}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  placeholder="e.g. Reliance Retail LED Display"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    disabled={isReadOnly}
                    value={item.category}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      const base = dataRef.current || data;
                      if (!base) return;
                      const updated = {
                        ...base,
                        portfolio: base.portfolio.map((x) => x.id === item.id ? { ...x, category: e.target.value } : x)
                      };
                      dataRef.current = updated;
                      setData(updated);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : " cursor-pointer font-medium")}
                  >
                    {Array.from(new Set([...CATEGORY_OPTIONS, ...(data?.services?.map((s) => s.title) || [])])).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {item.category && !CATEGORY_OPTIONS.includes(item.category) && !data?.services?.some(s => s.title === item.category) && (
                      <option value={item.category}>{item.category}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={item.location}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      const base = dataRef.current || data;
                      if (!base) return;
                      const updated = {
                        ...base,
                        portfolio: base.portfolio.map((x) => x.id === item.id ? { ...x, location: e.target.value } : x)
                      };
                      dataRef.current = updated;
                      setData(updated);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. Gandhinagar, Gujarat"
                  />
                </div>
              </div>

              <SitePhotosManager
                coverImage={item.image}
                images={item.images || []}
                readOnly={isReadOnly}
                onCoverChange={(newCover) => {
                  if (isReadOnly) return;
                  const base = dataRef.current || data;
                  if (!base) return;
                  const updated = {
                    ...base,
                    portfolio: base.portfolio.map((x) => x.id === item.id ? { ...x, image: newCover } : x)
                  };
                  dataRef.current = updated;
                  setData(updated);
                }}
                onImagesChange={(newImgs) => {
                  if (isReadOnly) return;
                  const base = dataRef.current || data;
                  if (!base) return;
                  const updated = {
                    ...base,
                    portfolio: base.portfolio.map((x) => x.id === item.id ? { ...x, images: newImgs } : x)
                  };
                  dataRef.current = updated;
                  setData(updated);
                }}
              />

              <label className={`flex items-center gap-2 pt-1 ${isReadOnly ? "cursor-default" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={item.featured}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    setData((p) => p ? {
                      ...p,
                      portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, featured: e.target.checked } : x)
                    } : p);
                  }}
                  className={`w-4 h-4 accent-[#6F20E8] ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
                />
                <span className="text-sm text-gray-700 font-medium">Mark as Featured (shown on homepage)</span>
              </label>
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 2. Service Modal */}
      {activeModal?.type === "service" && (() => {
        const currentData = dataRef.current || data;
        const svc = currentData?.services.find((x) => x.id === activeModal.idOrIndex);
        if (!svc) return null;
        const isReadOnly = activeModal.mode === "view";
        return (
          <ModalWrapper
            title={isReadOnly ? "View Service" : "Edit Service"}
            subtitle={isReadOnly ? "Service specifications, photo, and features (Read Only)" : "View or edit service specifications, photo, and features"}
            icon={<Briefcase className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              const latestData = dataRef.current || data;
              const currentSvc = latestData?.services.find((x) => x.id === svc.id);
              if (!currentSvc?.title || !currentSvc.title.trim()) {
                setModalError("Service Title is required. Please fill in the title before saving.");
                return;
              }
              setModalError(null);
              // Directly persist service to Supabase 'services' table
              await fetch("/api/services", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentSvc),
              }).catch((err) => console.warn("Direct Supabase service update error:", err));

              await handleSave(latestData);
              closeModal();
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Service Title *</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={svc.title}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      setModalError(null);
                      const base = dataRef.current || data;
                      if (!base) return;
                      const updatedServices = base.services.map((x) => x.id === svc.id ? { ...x, title: e.target.value } : x);
                      const updated = { ...base, services: updatedServices };
                      dataRef.current = updated;
                      setData(updated);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  />
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    disabled={isReadOnly}
                    value={svc.category}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      const base = dataRef.current || data;
                      if (!base) return;
                      const updatedServices = base.services.map((x) => x.id === svc.id ? { ...x, category: e.target.value } : x);
                      const updated = { ...base, services: updatedServices };
                      dataRef.current = updated;
                      setData(updated);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : " cursor-pointer font-medium")}
                  >
                    {Array.from(new Set([...CATEGORY_OPTIONS, ...(data?.services?.map((s) => s.title) || [])])).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {svc.category && !CATEGORY_OPTIONS.includes(svc.category) && !data?.services?.some(s => s.title === svc.category) && (
                      <option value={svc.category}>{svc.category}</option>
                    )}
                  </select>
                </div>
              </div>

              <ImageInput
                label="Service Photo"
                value={svc.image}
                readOnly={isReadOnly}
                onChange={(v) => {
                  if (isReadOnly) return;
                  const base = dataRef.current || data;
                  if (!base) return;
                  const updatedServices = base.services.map((x) => x.id === svc.id ? { ...x, image: v } : x);
                  const updated = { ...base, services: updatedServices };
                  dataRef.current = updated;
                  setData(updated);
                }}
              />

              <div>
                <label className={labelCls}>Short Description (Summary)</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={svc.shortDescription || ""}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const base = dataRef.current || data;
                    if (!base) return;
                    const updatedServices = base.services.map((x) => x.id === svc.id ? { ...x, shortDescription: e.target.value } : x);
                    const updated = { ...base, services: updatedServices };
                    dataRef.current = updated;
                    setData(updated);
                  }}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  placeholder="e.g. High-impact durable hoardings and flex boards for outdoor advertising."
                />
              </div>

              <div>
                <label className={labelCls}>Full Description (About Service)</label>
                <textarea
                  rows={3}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={svc.description || ""}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const base = dataRef.current || data;
                    if (!base) return;
                    const updatedServices = base.services.map((x) => x.id === svc.id ? { ...x, description: e.target.value } : x);
                    const updated = { ...base, services: updatedServices };
                    dataRef.current = updated;
                    setData(updated);
                  }}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  placeholder="Comprehensive details, material specs, installation and delivery options for this service..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className={labelCls}>Bullet Points / Key Features</label>
                    <p className="text-[11px] text-gray-400">List bullet points highlighting this service&apos;s core capabilities</p>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const base = dataRef.current || data;
                        if (!base) return;
                        const updatedServices = base.services.map((x) => x.id === svc.id ? { ...x, features: [...x.features, ""] } : x);
                        const updated = { ...base, services: updatedServices };
                        dataRef.current = updated;
                        setData(updated);
                      }}
                      className="text-xs text-[#6F20E8] hover:text-[#5B16C7] font-semibold flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet Point
                    </button>
                  )}
                </div>
                {svc.features.length === 0 && isReadOnly && (
                  <p className="text-xs text-gray-400 italic">No bullet points listed</p>
                )}
                {svc.features.map((feat, fi) => (
                  <div key={fi} className="flex items-center gap-2 mb-2">
                    <span className="text-[#6F20E8] font-black text-base select-none shrink-0">•</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      value={feat}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        const base = dataRef.current || data;
                        if (!base) return;
                        const updatedServices = base.services.map((x) => {
                          if (x.id !== svc.id) return x;
                          const f = [...x.features];
                          f[fi] = e.target.value;
                          return { ...x, features: f };
                        });
                        const updated = { ...base, services: updatedServices };
                        dataRef.current = updated;
                        setData(updated);
                      }}
                      className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                      placeholder={`Bullet point ${fi + 1}`}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setData((p) => p ? {
                          ...p,
                          services: p.services.map((x) => x.id === svc.id ? { ...x, features: x.features.filter((_, k) => k !== fi) } : x)
                        } : p)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove bullet point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label className={`flex items-center gap-2 pt-1 ${isReadOnly ? "cursor-default" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={svc.featured}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    setData((p) => p ? {
                      ...p,
                      services: p.services.map((x) => x.id === svc.id ? { ...x, featured: e.target.checked } : x)
                    } : p);
                  }}
                  className={`w-4 h-4 accent-[#6F20E8] ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
                />
                <span className="text-sm text-gray-700 font-medium">Mark as Featured (shown on homepage)</span>
              </label>
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 3. Team Member Modal */}
      {activeModal?.type === "team" && (() => {
        const m = data.team.find((x) => x.id === activeModal.idOrIndex);
        if (!m) return null;
        const isReadOnly = activeModal.mode === "view";
        return (
          <ModalWrapper
            title={isReadOnly ? "View Team Member" : "Edit Team Member"}
            subtitle={isReadOnly ? "Member profile, position, and photo (Read Only)" : "View or update member profile, position, and photo"}
            icon={<Users className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              const latestData = dataRef.current || data;
              const currentM = latestData?.team.find((x) => x.id === m.id);
              if (!currentM?.name || !currentM.name.trim() || !currentM.role || !currentM.role.trim()) {
                setModalError("Both Full Name and Role / Position are required before saving.");
                return;
              }
              setModalError(null);
              await handleSave(latestData);
              closeModal();
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={m.name}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      setModalError(null);
                      const base = dataRef.current || data;
                      if (!base) return;
                      const updatedTeam = base.team.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x);
                      const updated = { ...base, team: updatedTeam };
                      dataRef.current = updated;
                      setData(updated);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  />
                </div>
                <div>
                  <label className={labelCls}>Role / Position *</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={m.role}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      setModalError(null);
                      const base = dataRef.current || data;
                      if (!base) return;
                      const updatedTeam = base.team.map((x) => x.id === m.id ? { ...x, role: e.target.value } : x);
                      const updated = { ...base, team: updatedTeam };
                      dataRef.current = updated;
                      setData(updated);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Direct Contact Number / Phone (Especially Founder/Owner)</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={m.phone || ""}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const base = dataRef.current || data;
                    if (!base) return;
                    const updatedTeam = base.team.map((x) => x.id === m.id ? { ...x, phone: e.target.value } : x);
                    const updated = { ...base, team: updatedTeam };
                    dataRef.current = updated;
                    setData(updated);
                  }}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  placeholder="+91 85111 33363"
                />
              </div>

              <ImageInput
                label="Profile Photo"
                value={m.image}
                readOnly={isReadOnly}
                onChange={(v) => {
                  if (isReadOnly) return;
                  const base = dataRef.current || data;
                  if (!base) return;
                  const updatedTeam = base.team.map((x) => x.id === m.id ? { ...x, image: v } : x);
                  const updated = { ...base, team: updatedTeam };
                  dataRef.current = updated;
                  setData(updated);
                }}
              />

              <div>
                <label className={labelCls}>Description / Bio</label>
                <textarea
                  rows={3}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={m.bio || ""}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const base = dataRef.current || data;
                    if (!base) return;
                    const updatedTeam = base.team.map((x) => x.id === m.id ? { ...x, bio: e.target.value } : x);
                    const updated = { ...base, team: updatedTeam };
                    dataRef.current = updated;
                    setData(updated);
                  }}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  placeholder="Short description, experience, or role details for this team member..."
                />
              </div>
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 4. Client Modal */}
      {activeModal?.type === "client" && (() => {
        const clientIndex = (data.clients || []).findIndex((x) => x.id === activeModal.idOrIndex);
        const client = (data.clients || [])[clientIndex];
        if (!client) return null;
        const isReadOnly = activeModal.mode === "view";
        return (
          <ModalWrapper
            title={isReadOnly ? "View Client Organization" : "Edit Client Organization"}
            subtitle={isReadOnly ? "Company name, category tag, and transparent logo (Read Only)" : "Update company name, category tag, and transparent logo"}
            icon={<Building2 className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              if (!client.name || !client.name.trim()) {
                setModalError("Company / Institution Name is required.");
                return;
              }
              setModalError(null);
              await handleSave();
              closeModal();
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Company / Institution Name *</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={client.name}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const val = e.target.value;
                    setModalError(null);
                    setData((p) => {
                      if (!p) return p;
                      const updated = [...(p.clients || [])];
                      updated[clientIndex] = { ...updated[clientIndex], name: val };
                      return { ...p, clients: updated };
                    });
                  }}
                  placeholder="e.g. BJP, NFSU College, Xavier School..."
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                />
              </div>
              <div>
                <label className={labelCls}>Category / Tag (Optional)</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={client.tag || ""}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const val = e.target.value;
                    setData((p) => {
                      if (!p) return p;
                      const updated = [...(p.clients || [])];
                      updated[clientIndex] = { ...updated[clientIndex], tag: val };
                      return { ...p, clients: updated };
                    });
                  }}
                  placeholder="e.g. Educational Institution, Food Brand..."
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                />
              </div>

              <ImageInput
                label="Client Logo Image"
                value={client.logo || ""}
                readOnly={isReadOnly}
                onChange={(v) => {
                  if (isReadOnly) return;
                  setData((p) => {
                    if (!p) return p;
                    const updated = [...(p.clients || [])];
                    updated[clientIndex] = { ...updated[clientIndex], logo: v };
                    return { ...p, clients: updated };
                  });
                }}
              />
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 5. Review / Testimonial Modal */}
      {activeModal?.type === "testimonial" && (() => {
        const t = data.testimonials.find((x) => x.id === activeModal.idOrIndex);
        if (!t) return null;
        const isReadOnly = activeModal.mode === "view";
        return (
          <ModalWrapper
            title={isReadOnly ? "View Client Review" : "Edit Client Review"}
            subtitle={isReadOnly ? "Review rating, quote, and client business information (Read Only)" : "Manage review rating, quote, and client business information"}
            icon={<MessageSquare className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              if (!t.name || !t.name.trim() || !t.quote || !t.quote.trim()) {
                setModalError("Client Name and Review Quote are required before saving.");
                return;
              }
              setModalError(null);
              await handleSave();
              closeModal();
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Client Name *</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={t.name}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      setModalError(null);
                      setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x) } : p);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  />
                </div>
                <div>
                  <label className={labelCls}>Business Name</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={t.business}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, business: e.target.value } : x) } : p);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Review Quote *</label>
                <textarea
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={t.quote}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    setModalError(null);
                    setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, quote: e.target.value } : x) } : p);
                  }}
                  rows={3}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                />
              </div>

              <div>
                <label className={labelCls}>Star Rating (1-5)</label>
                <div className="flex gap-2 mt-1">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        if (isReadOnly) return;
                        setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, rating: s } : x) } : p);
                      }}
                      className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                        isReadOnly ? "cursor-default " : ""
                      }${
                        s <= t.rating ? "bg-yellow-400 text-black shadow-sm" : "bg-gray-100 text-gray-400" + (isReadOnly ? "" : " hover:bg-gray-200")
                      }`}
                    >
                      <Star className={`w-4 h-4 ${s <= t.rating ? "fill-black" : ""}`} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 6. FAQ Modal */}
      {activeModal?.type === "faq" && (() => {
        const faq = data.faqs.find((x) => x.id === activeModal.idOrIndex);
        if (!faq) return null;
        const isReadOnly = activeModal.mode === "view";
        return (
          <ModalWrapper
            title={isReadOnly ? "View FAQ" : "Edit FAQ"}
            subtitle={isReadOnly ? "Customer frequently asked question and answer (Read Only)" : "Update customer frequently asked question and answer"}
            icon={<HelpCircle className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              if (!faq.question || !faq.question.trim() || !faq.answer || !faq.answer.trim()) {
                setModalError("Both Question and Answer are required before saving.");
                return;
              }
              setModalError(null);
              await handleSave();
              closeModal();
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Question *</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={faq.question}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    setModalError(null);
                    setData((p) => p ? { ...p, faqs: p.faqs.map((x) => x.id === faq.id ? { ...x, question: e.target.value } : x) } : p);
                  }}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                />
              </div>
              <div>
                <label className={labelCls}>Detailed Answer *</label>
                <textarea
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={faq.answer}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    setModalError(null);
                    setData((p) => p ? { ...p, faqs: p.faqs.map((x) => x.id === faq.id ? { ...x, answer: e.target.value } : x) } : p);
                  }}
                  rows={4}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                />
              </div>
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 7. Hero Image Slide Modal */}
      {activeModal?.type === "hero" && (() => {
        const idx = Number(activeModal.idOrIndex);
        const url = data.heroImages[idx] ?? "";
        const isReadOnly = activeModal.mode === "view";
        return (
          <ModalWrapper
            title={isReadOnly ? `View Hero Slide ${idx + 1}` : `Edit Hero Slide ${idx + 1}`}
            subtitle={isReadOnly ? `Hero slide ${idx + 1} image preview (Read Only)` : "Paste image URL or upload image file for this hero slide"}
            icon={<ImageIcon className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              const currentSlideUrl = (data.heroImages[idx] || "").trim();
              if (!currentSlideUrl) {
                setModalError("Image URL or uploaded photo is required for the slide.");
                return;
              }
              setModalError(null);
              const imgs = [...data.heroImages];
              imgs[idx] = currentSlideUrl;
              const filtered = imgs.filter((x) => typeof x === "string" && x.trim() !== "");
              const updatedData: SiteData = {
                ...data,
                heroImages: filtered,
              };
              setData(updatedData);
              await handleSave(updatedData);
              setActiveModal(null);
              setModalError(null);
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <ImageInput
                label={`Hero Slide ${idx + 1} Image`}
                value={url}
                readOnly={isReadOnly}
                onChange={(v) => {
                  if (isReadOnly) return;
                  setModalError(null);
                  setData((p) => {
                    if (!p) return p;
                    const imgs = [...p.heroImages];
                    imgs[idx] = v;
                    return { ...p, heroImages: imgs };
                  });
                }}
              />
            </div>
          </ModalWrapper>
        );
      })()}

      {/* 8. Machine Modal */}
      {activeModal?.type === "machine" && (() => {
        const isNewDraft = Boolean(activeModal.isNew);
        const currentData = dataRef.current || data;
        const machine = (isNewDraft && newMachineDraft?.id === activeModal.idOrIndex)
          ? newMachineDraft
          : (currentData?.machines || []).find((x) => x.id === activeModal.idOrIndex);

        if (!machine) return null;
        const isReadOnly = activeModal.mode === "view";

        const updateMachineField = (fieldKey: keyof MachineItem, value: unknown) => {
          if (isReadOnly) return;
          setModalError(null);
          if (isNewDraft) {
            setNewMachineDraft((prev) => prev ? { ...prev, [fieldKey]: value } : prev);
          } else {
            const base = dataRef.current || data;
            if (!base) return;
            const updatedMachines = (base.machines || []).map((x) =>
              x.id === machine.id ? { ...x, [fieldKey]: value } : x
            );
            const updated = { ...base, machines: updatedMachines };
            dataRef.current = updated;
            setData(updated);
          }
        };

        return (
          <ModalWrapper
            title={isReadOnly ? "View Machine" : isNewDraft ? "Add Machine" : "Edit Machine"}
            subtitle={
              isReadOnly
                ? "Machinery specifications, photo, and capabilities (Read Only)"
                : isNewDraft
                ? "Fill in machine specifications, photo, and capabilities, then click Save to add"
                : "View or edit machine specifications, photo, and capabilities"
            }
            icon={<Cpu className="w-5 h-5 text-[#6F20E8]" />}
            onClose={closeModal}
            errorMessage={modalError}
            mode={activeModal.mode || "edit"}
            onEdit={() => setActiveModal((p) => p ? { ...p, mode: "edit" } : p)}
            onSave={async () => {
              if (!machine.name || !machine.name.trim()) {
                setModalError("Machine Name is required. Please fill in the machine name before saving.");
                return;
              }
              if (machine.image && machine.image.trim()) {
                const img = machine.image.trim();
                const hasValidExt = /\.(jpe?g|png|webp)(\?.*)?$/i.test(img);
                const isUrlOrLocal = /^(https?:\/\/|\/|data:image\/)/i.test(img);
                if (!hasValidExt && !isUrlOrLocal) {
                  setModalError("Machine Photo must be a valid JPG, JPEG, PNG, or WEBP file.");
                  return;
                }
              }
              const cleanedCapabilities = (machine.capabilities || []).map((c) => c.trim()).filter(Boolean);
              const base = dataRef.current || data;
              if (!base) return;

              let updatedMachines: MachineItem[];
              const itemToSave = isNewDraft
                ? {
                    ...machine,
                    capabilities: cleanedCapabilities,
                    sortOrder: (base.machines || []).length + 1,
                  }
                : {
                    ...machine,
                    capabilities: cleanedCapabilities,
                  };

              if (isNewDraft) {
                updatedMachines = [...(base.machines || []), itemToSave];
                setNewMachineDraft(null);
              } else {
                updatedMachines = (base.machines || []).map((x) =>
                  x.id === machine.id ? itemToSave : x
                );
              }

              // Direct database persistence for machine in Supabase 'machines' table
              fetch("/api/machines", {
                method: isNewDraft ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemToSave),
              }).catch((err) => console.warn("Direct Supabase machine save error:", err));

              const sanitizedLatest = { ...base, machines: updatedMachines } as SiteData;
              dataRef.current = sanitizedLatest;
              setData(sanitizedLatest);
              setModalError(null);
              await handleSave(sanitizedLatest);
              closeModal();
            }}
            saving={saving}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Machine Name *</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={machine.name}
                    onChange={(e) => updateMachineField("name", e.target.value)}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. StarFlex 3200 Pro"
                  />
                </div>
                <div>
                  <label className={labelCls}>Gujarati Name</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={machine.gujaratiName || ""}
                    onChange={(e) => updateMachineField("gujaratiName", e.target.value)}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. સ્ટારફ્લેક્સ ૩૨૦૦ પ્રો"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Badge / Machine Type</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={machine.badge || ""}
                    onChange={(e) => updateMachineField("badge", e.target.value)}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. Industrial Banner Giant"
                  />
                </div>
                <div>
                  <label className={labelCls}>Tagline / Subtitle</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={machine.tagline || ""}
                    onChange={(e) => updateMachineField("tagline", e.target.value)}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. High-Volume Flex & Vinyl Printing"
                  />
                </div>
              </div>

              <ImageInput
                label="Machine Photo"
                value={machine.image}
                readOnly={isReadOnly}
                onChange={(v) => updateMachineField("image", v)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Speed / Technical Specifications</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={machine.speedOrSpec || ""}
                    onChange={(e) => updateMachineField("speedOrSpec", e.target.value)}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. 10 ft width • 1200 DPI • 1,500 sq ft/hr"
                  />
                </div>
                <div>
                  <label className={labelCls}>Ideal Applications</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={machine.idealFor || ""}
                    onChange={(e) => updateMachineField("idealFor", e.target.value)}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. Roadside hoardings, flex banners, vinyl wall wraps"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Machine Overview / Description</label>
                <textarea
                  rows={3}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={machine.description || ""}
                  onChange={(e) => updateMachineField("description", e.target.value)}
                  className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  placeholder="Describe machine performance, output quality, technology, and reliability..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className={labelCls}>Bullet Points / Key Capabilities</label>
                    <p className="text-[11px] text-gray-400">List bullet points highlighting this machine&apos;s features and strengths</p>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => updateMachineField("capabilities", [...(machine.capabilities || []), ""])}
                      className="text-xs text-[#6F20E8] hover:text-[#5B16C7] font-semibold flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet Point
                    </button>
                  )}
                </div>
                {(!machine.capabilities || machine.capabilities.length === 0) && isReadOnly && (
                  <p className="text-xs text-gray-400 italic">No bullet points listed</p>
                )}
                {(machine.capabilities || []).map((cap, fi) => (
                  <div key={fi} className="flex items-center gap-2 mb-2">
                    <span className="text-[#6F20E8] font-black text-base select-none shrink-0">•</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      value={cap}
                      onChange={(e) => {
                        const caps = [...(machine.capabilities || [])];
                        caps[fi] = e.target.value;
                        updateMachineField("capabilities", caps);
                      }}
                      className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                      placeholder={`Bullet point ${fi + 1}`}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          const caps = (machine.capabilities || []).filter((_, idx) => idx !== fi);
                          updateMachineField("capabilities", caps);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove capability"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ModalWrapper>
        );
      })()}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
