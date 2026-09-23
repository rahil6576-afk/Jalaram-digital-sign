"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Building2,
  ImageIcon,
  Briefcase,
  Users,
  MessageSquare,
  HelpCircle,
  Upload,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  Star,
  Globe,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Business {
  name: string; description: string; address: string; phone: string;
  whatsapp: string; email: string; mapsLink: string; hours: string;
}
interface Socials { instagram: string; facebook: string; twitter: string; linkedin: string; }
interface Service {
  id: string; slug: string; title: string; shortDescription?: string;
  description?: string; image: string; category: string; features: string[];
  featured: boolean; sortOrder: number;
}
interface PortfolioItem {
  id: string; slug: string; title: string; category: string; description?: string;
  image: string; images: string[]; location: string; featured: boolean; sortOrder: number;
}
interface TeamMember {
  id: string; name: string; role: string; bio?: string; image: string;
  socialLinks: Record<string, string>; sortOrder: number;
}
interface Testimonial { id: string; name: string; business: string; quote: string; rating: number; }
interface FAQ { id: string; question: string; answer: string; }
interface ClientCompany { id: string; name: string; tag: string; logo: string; }
interface SiteData {
  business: Business; socials: Socials; heroImages: string[];
  clients?: ClientCompany[];
  services: Service[]; portfolio: PortfolioItem[]; team: TeamMember[];
  testimonials: Testimonial[]; faqs: FAQ[];
}
interface UploadedFile { name: string; url: string; size: number; createdAt: string; }

const TABS = [
  { id: "business", label: "Social Links", icon: Globe },
  { id: "hero", label: "Hero Images", icon: ImageIcon },
  { id: "clients", label: "Client Logos", icon: Building2 },
  { id: "portfolio", label: "Portfolio", icon: LayoutGrid },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "team", label: "Team", icon: Users },
  { id: "testimonials", label: "Reviews", icon: MessageSquare },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "media", label: "Media Library", icon: Upload },
];

export const CATEGORY_OPTIONS = [
  "Hoardings",
  "Flex Banner",
  "Vinyl Printing",
  "Raduim Work",
  "UV Printing",
  "1Way Vision Print",
  "Acrylic Board",
  "Glow Sign",
  "Board LED Board",
];

// ── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: "success" | "error" | "loading"; onDismiss: () => void }) {
  const colors = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    loading: "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl border flex items-center gap-2.5 shadow-xl text-sm font-semibold ${colors[type]}`}>
      {type === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ── Photo Validation Config ────────────────────────────────────────────────
const MAX_PHOTO_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_PHOTO_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const ALLOWED_PHOTO_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPT_PHOTO_ATTR = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

function validatePhoto(file: File): { valid: boolean; error?: string } {
  const hasValidExt = ALLOWED_PHOTO_EXTENSIONS.test(file.name);
  const hasValidMime = ALLOWED_PHOTO_MIMES.includes(file.type);

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `"${file.name}" is not supported. Only JPG, JPEG, PNG, or WEBP photos are allowed.`,
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" (${sizeMb}MB) exceeds allowed file size. Please upload files up to 15 MB.`,
    };
  }

  return { valid: true };
}

// ── ImageInput (With Clean Aspect Ratio Preview That Never Cuts Heads & Displays Photo Size) ─────
function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoDims, setPhotoDims] = useState<{ w: number; h: number } | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setErrorMsg(null);
    const check = validatePhoto(file);
    if (!check.valid) {
      setErrorMsg(check.error || "File exceeds allowed size. Please upload files up to 15 MB.");
      return;
    }

    setFileSizeStr((file.size / (1024 * 1024)).toFixed(2) + " MB");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again or paste a URL.";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setErrorMsg(null);
            onChange(e.target.value);
          }}
          placeholder="Paste image URL or upload →"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6F20E8] focus:ring-2 focus:ring-[#6F20E8]/20"
        />
        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            fileRef.current?.click();
          }}
          disabled={uploading}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
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

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">⚠️</span> {errorMsg}
          </span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-700 ml-2 font-bold">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-1">
        <span>Photo Size: Max 15MB · Formats: JPG, PNG, WEBP</span>
        {photoDims && (
          <span className="font-semibold text-[#6F20E8] bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-flex items-center gap-1 w-fit">
            <span>Photo Size:</span> {photoDims.w} × {photoDims.h} px {fileSizeStr ? `(${fileSizeStr})` : ""}
          </span>
        )}
      </div>

      {value && (
        <div className="relative w-full min-h-[140px] max-h-60 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            onLoad={(e) => setPhotoDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
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
      )}
    </div>
  );
}

// ── Section Header with Save Button ─────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
  onSave,
  saving,
  actionButton,
}: {
  title: string;
  subtitle?: string;
  onSave: () => void;
  saving: boolean;
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
        {actionButton}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>
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
  const [activeTab, setActiveTab] = useState("business");
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "loading" } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const mediaFileRef = useRef<HTMLInputElement>(null);

  // Expanded items state: click photo/card to expand details
  const [expandedPortfolio, setExpandedPortfolio] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "loading") => {
    setToast({ message, type });
    if (type !== "loading") setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/admin/content");
        const json = await res.json();
        setData(json);
      } catch {
        showToast("Failed to load site data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showToast]);

  const loadMedia = async () => {
    try {
      const res = await fetch("/api/admin/upload");
      const json = await res.json();
      setUploadedFiles(json.files || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let ignore = false;
    if (activeTab === "media") {
      fetch("/api/admin/upload")
        .then((res) => res.json())
        .then((json) => {
          if (!ignore) setUploadedFiles(json.files || []);
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const cleanSocialUrl = (url: string) => {
    if (!url) return "";
    let c = url.trim();
    while (c.startsWith("#")) c = c.slice(1).trim();
    if (!c) return "";
    if (!/^https?:\/\//i.test(c)) c = `https://${c}`;
    return c;
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      const sanitizedData: SiteData = {
        ...data,
        socials: {
          instagram: cleanSocialUrl(data.socials?.instagram || ""),
          facebook: cleanSocialUrl(data.socials?.facebook || ""),
          twitter: cleanSocialUrl(data.socials?.twitter || ""),
          linkedin: cleanSocialUrl(data.socials?.linkedin || ""),
        },
        clients: (data.clients || []).filter((c) => c.name.trim() !== ""),
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

      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });
      if (!res.ok) throw new Error("Save failed");

      setData(sanitizedData);

      // Instant live sync across all components and open browser tabs
      try {
        localStorage.setItem("jalaram_site_content_v2", JSON.stringify(sanitizedData));
        localStorage.setItem("jalaram_site_content_v2_time", Date.now().toString());
        window.dispatchEvent(new CustomEvent("site-content-updated", { detail: sanitizedData }));
      } catch {
        // safe fallback
      }

      showToast("Saved successfully! Live site updated.", "success");
    } catch {
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateSocials = (field: keyof Socials, value: string) => {
    let clean = value;
    while (clean.startsWith("#")) {
      clean = clean.slice(1);
    }
    setData((prev) => prev ? { ...prev, socials: { ...prev.socials, [field]: clean } } : prev);
  };

  const handleSocialBlur = (field: keyof Socials) => {
    if (!data) return;
    const val = data.socials[field]?.trim();
    if (!val) return;
    const formatted = cleanSocialUrl(val);
    setData((prev) => prev ? { ...prev, socials: { ...prev.socials, [field]: formatted } } : prev);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-[#6F20E8]" />
          <p className="text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="flex-1 flex items-center justify-center text-red-400 text-sm font-medium">
      Failed to load site data. Please refresh.
    </div>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      {/* Sidebar Tabs (desktop) */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 pt-6 pb-8 px-3 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${activeTab === id ? "bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white shadow-md shadow-[#6F20E8]/25" : "text-gray-500 hover:text-gray-900 hover:bg-purple-50"}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-[#6F20E8]/25 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </aside>

      {/* Mobile Tab Bar — smooth horizontal swipe with no scrollbar */}
      <div className="md:hidden flex overflow-x-auto gap-1.5 p-3 bg-white border-b border-gray-200 shrink-0 no-scrollbar touch-pan-x">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 min-h-[36px] ${activeTab === id ? "bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white shadow-sm" : "text-gray-500 hover:text-gray-900 bg-gray-50 active:bg-gray-100"}`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Mobile Save Button */}
          <div className="md:hidden flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 py-2 px-5 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 min-h-[44px]"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>

          {/* ── SOCIAL LINKS ─────────────────────────────────────────── */}
          {activeTab === "business" && (
            <div className="space-y-6">
              <SectionHeader
                title="Social Media Links"
                subtitle="Manage your public social media profiles and links."
                onSave={handleSave}
                saving={saving}
              />
              <div className={sectionCard}>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Globe className="w-4 h-4 text-[#6F20E8]" /> Social Profiles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["instagram","facebook","twitter","linkedin"] as (keyof Socials)[]).map((key) => (
                    <div key={key}>
                      <label className={labelCls}>{key.charAt(0).toUpperCase() + key.slice(1)} URL</label>
                      <input
                        type="text"
                        value={data.socials[key]}
                        onChange={(e) => updateSocials(key, e.target.value)}
                        onBlur={() => handleSocialBlur(key)}
                        placeholder="https://..."
                        className={field}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HERO IMAGES ────────────────────────────────────────────── */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <SectionHeader
                title="Hero Carousel Images"
                subtitle="These images cycle through the homepage hero section. Paste an image URL or upload a file."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => setData((p) => p ? { ...p, heroImages: [...p.heroImages, ""] } : p)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-xs md:text-sm font-semibold rounded-xl text-[#6F20E8] transition-all border border-purple-200"
                  >
                    <Plus className="w-4 h-4" /> Add Image
                  </button>
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.heroImages.map((url, i) => (
                  <div key={i} className={sectionCard + " !space-y-3"}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slide {i + 1}</span>
                      <button onClick={() => setData((p) => p ? { ...p, heroImages: p.heroImages.filter((_, idx) => idx !== i) } : p)} className="text-red-500 hover:text-red-600 p-1 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <ImageInput value={url} onChange={(v) => setData((p) => { if (!p) return p; const imgs = [...p.heroImages]; imgs[i] = v; return { ...p, heroImages: imgs }; })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CLIENT LOGOS MARQUEE ───────────────────────────────────── */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              <SectionHeader
                title="Client Companies & Marquee Logos"
                subtitle="Manage the client organizations displayed in the infinite dual marquee on the homepage."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const newClient: ClientCompany = {
                        id: `client-${genId()}`,
                        name: "New Client",
                        tag: "Client Organization",
                        logo: "",
                      };
                      setData((p) => p ? { ...p, clients: [...(p.clients || []), newClient] } : p);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    <Plus className="w-4 h-4" /> Add Client Company
                  </button>
                }
              />

              {/* Logo Photo Validation Notice */}
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-900 font-medium flex items-center gap-2.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#6F20E8] shrink-0" />
                <span>
                  <strong>Client Logo Validation:</strong> Photos must be in <strong>JPG, JPEG, PNG, or WEBP</strong> format and up to <strong>15 MB</strong> in size. Logos are seamlessly displayed without square background boxes in the marquee.
                </span>
              </div>

              {(!data.clients || data.clients.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No client companies added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click &quot;Add Client&quot; above to add brands like BJP, NFSU College, Xavier School, etc.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.clients.map((client, i) => (
                    <div key={client.id || i} className={sectionCard + " !space-y-4"}>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-purple-50 text-[#6F20E8] font-bold text-xs flex items-center justify-center border border-purple-200">
                            {i + 1}
                          </span>
                          <span className="font-bold text-sm text-gray-900 truncate max-w-[180px]">{client.name || "Untitled Client"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setData((p) => p ? { ...p, clients: (p.clients || []).filter((_, idx) => idx !== i) } : p);
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Remove Client"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className={labelCls}>Company / Institution Name *</label>
                          <input
                            type="text"
                            value={client.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setData((p) => {
                                if (!p) return p;
                                const updated = [...(p.clients || [])];
                                updated[i] = { ...updated[i], name: val };
                                return { ...p, clients: updated };
                              });
                            }}
                            placeholder="e.g. BJP, NFSU College, Xavier School..."
                            className={field}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Category / Tag (Optional)</label>
                          <input
                            type="text"
                            value={client.tag || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setData((p) => {
                                if (!p) return p;
                                const updated = [...(p.clients || [])];
                                updated[i] = { ...updated[i], tag: val };
                                return { ...p, clients: updated };
                              });
                            }}
                            placeholder="e.g. Educational Institution, Food Brand..."
                            className={field}
                          />
                        </div>
                      </div>

                      <div>
                        <ImageInput
                          label="Client Logo Image"
                          value={client.logo || ""}
                          onChange={(v) => {
                            setData((p) => {
                              if (!p) return p;
                              const updated = [...(p.clients || [])];
                              updated[i] = { ...updated[i], logo: v };
                              return { ...p, clients: updated };
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PORTFOLIO (GRID VIEW WITH CLICK-TO-EXPAND DETAILS) ─────── */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <SectionHeader
                title="Portfolio Projects"
                subtitle="Click any photo or project card to view and edit its full details."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: PortfolioItem = {
                        id: genId(),
                        slug: `project-${genId()}`,
                        title: "New Project",
                        category: "Hoardings",
                        image: "",
                        images: [],
                        location: "Gandhinagar",
                        featured: false,
                        sortOrder: data.portfolio.length + 1,
                      };
                      setData((p) => p ? { ...p, portfolio: [...p.portfolio, newItem] } : p);
                      setExpandedPortfolio(newItem.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                }
              />

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.portfolio.map((item) => {
                  const isExpanded = expandedPortfolio === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col ${
                        isExpanded ? "border-[#6F20E8] ring-2 ring-[#6F20E8]/15 sm:col-span-2 lg:col-span-3" : "border-gray-200 hover:shadow-md"
                      }`}
                    >
                      {/* Photo Thumbnail / Banner — Clicking photo opens all details */}
                      <div
                        onClick={() => setExpandedPortfolio(isExpanded ? null : item.id)}
                        className="relative aspect-[4/3] w-full bg-gray-100 cursor-pointer group border-b border-gray-200 overflow-hidden"
                        title="Click photo to view or edit details"
                      >
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <ImageIcon className="w-12 h-12 mb-2 text-gray-300 group-hover:text-[#6F20E8] transition-colors" />
                            <span className="text-xs font-semibold text-gray-500">Click to add cover photo</span>
                          </div>
                        )}

                        {item.featured && (
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white px-2.5 py-1 rounded-full shadow-md">
                            Featured
                          </span>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                          <span className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow">
                            <Edit3 className="w-3.5 h-3.5" />
                            {isExpanded ? "Hide Details" : "Click photo to edit details"}
                          </span>
                        </div>
                      </div>

                      {/* Summary Info Bar */}
                      <div className="p-4 flex items-center justify-between gap-2">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpandedPortfolio(isExpanded ? null : item.id)}
                        >
                          <h4 className="font-bold text-gray-900 text-sm truncate">{item.title || "Untitled Project"}</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[11px] font-semibold text-[#6F20E8] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              {item.category}
                            </span>
                            {item.location && (
                              <span className="text-[11px] text-gray-500 truncate">· {item.location}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedPortfolio(isExpanded ? null : item.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                              isExpanded
                                ? "bg-[#6F20E8] text-white border-[#6F20E8]"
                                : "bg-purple-50 text-[#6F20E8] border-purple-200 hover:bg-purple-100"
                            }`}
                            title={isExpanded ? "Hide Details" : "Edit Details"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isExpanded ? "Close" : "Details"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setData((p) => p ? { ...p, portfolio: p.portfolio.filter((x) => x.id !== item.id) } : p);
                            }}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Full Details Form (No Description Field) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/80">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                              <label className={labelCls}>Project Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => setData((p) => p ? {
                                  ...p,
                                  portfolio: p.portfolio.map((x) => x.id === item.id ? {
                                    ...x,
                                    title: e.target.value,
                                    slug: x.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                  } : x)
                                } : p)}
                                className={field}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>Category</label>
                              <select
                                value={item.category}
                                onChange={(e) => setData((p) => p ? {
                                  ...p,
                                  portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, category: e.target.value } : x)
                                } : p)}
                                className={field + " cursor-pointer font-medium"}
                              >
                                {CATEGORY_OPTIONS.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                                {!CATEGORY_OPTIONS.includes(item.category) && item.category && (
                                  <option value={item.category}>{item.category}</option>
                                )}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Location</label>
                              <input
                                type="text"
                                value={item.location}
                                onChange={(e) => setData((p) => p ? {
                                  ...p,
                                  portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, location: e.target.value } : x)
                                } : p)}
                                className={field}
                              />
                            </div>
                          </div>

                          <ImageInput
                            label="Cover Photo"
                            value={item.image}
                            onChange={(v) => setData((p) => p ? {
                              ...p,
                              portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, image: v } : x)
                            } : p)}
                          />

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className={labelCls}>Gallery Photos</label>
                              <button
                                type="button"
                                onClick={() => setData((p) => p ? {
                                  ...p,
                                  portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, images: [...x.images, ""] } : x)
                                } : p)}
                                className="text-xs text-[#6F20E8] hover:text-[#5B16C7] font-semibold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Add Image
                              </button>
                            </div>
                            {item.images.map((img, gi) => (
                              <div key={gi} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={img}
                                  onChange={(e) => setData((p) => p ? {
                                    ...p,
                                    portfolio: p.portfolio.map((x) => {
                                      if (x.id !== item.id) return x;
                                      const imgs = [...x.images];
                                      imgs[gi] = e.target.value;
                                      return { ...x, images: imgs };
                                    })
                                  } : p)}
                                  className={field}
                                  placeholder="Image URL"
                                />
                                <button
                                  type="button"
                                  onClick={() => setData((p) => p ? {
                                    ...p,
                                    portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, images: x.images.filter((_, k) => k !== gi) } : x)
                                  } : p)}
                                  className="text-red-500 hover:text-red-600 px-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={item.featured}
                              onChange={(e) => setData((p) => p ? {
                                ...p,
                                portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, featured: e.target.checked } : x)
                              } : p)}
                              className="w-4 h-4 accent-[#6F20E8]"
                            />
                            <span className="text-sm text-gray-700 font-medium">Mark as Featured (shown on homepage)</span>
                          </label>

                          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200/70">
                            <button
                              type="button"
                              onClick={() => setExpandedPortfolio(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Close Details
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={async () => {
                                await handleSave();
                                setExpandedPortfolio(null);
                              }}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SERVICES (GRID VIEW WITH CLICK-TO-EXPAND DETAILS) ──────── */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <SectionHeader
                title="Services"
                subtitle="Click any photo or service card to view and edit its full details."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const s: Service = {
                        id: genId(),
                        slug: `service-${genId()}`,
                        title: "New Service",
                        image: "",
                        category: "Flex Banner",
                        features: [],
                        featured: false,
                        sortOrder: data.services.length + 1,
                      };
                      setData((p) => p ? { ...p, services: [...p.services, s] } : p);
                      setExpandedService(s.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                }
              />

              {/* Services Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.services.map((svc) => {
                  const isExpanded = expandedService === svc.id;
                  return (
                    <div
                      key={svc.id}
                      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col ${
                        isExpanded ? "border-[#6F20E8] ring-2 ring-[#6F20E8]/15 sm:col-span-2 lg:col-span-3" : "border-gray-200 hover:shadow-md"
                      }`}
                    >
                      {/* Photo Thumbnail / Banner — Clicking photo opens all details */}
                      <div
                        onClick={() => setExpandedService(isExpanded ? null : svc.id)}
                        className="relative aspect-[4/3] w-full bg-gray-100 cursor-pointer group border-b border-gray-200 overflow-hidden"
                        title="Click photo to view or edit details"
                      >
                        {svc.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={svc.image}
                            alt={svc.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <Briefcase className="w-12 h-12 mb-2 text-gray-300 group-hover:text-[#6F20E8] transition-colors" />
                            <span className="text-xs font-semibold text-gray-500">Click to add service photo</span>
                          </div>
                        )}

                        {svc.featured && (
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white px-2.5 py-1 rounded-full shadow-md">
                            Featured
                          </span>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                          <span className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow">
                            <Edit3 className="w-3.5 h-3.5" />
                            {isExpanded ? "Hide Details" : "Click photo to edit details"}
                          </span>
                        </div>
                      </div>

                      {/* Summary Info Bar */}
                      <div className="p-4 flex items-center justify-between gap-2">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpandedService(isExpanded ? null : svc.id)}
                        >
                          <h4 className="font-bold text-gray-900 text-sm truncate">{svc.title || "Untitled Service"}</h4>
                          <span className="text-[11px] font-semibold text-[#6F20E8] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 mt-1 inline-block">
                            {svc.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedService(isExpanded ? null : svc.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                              isExpanded
                                ? "bg-[#6F20E8] text-white border-[#6F20E8]"
                                : "bg-purple-50 text-[#6F20E8] border-purple-200 hover:bg-purple-100"
                            }`}
                            title={isExpanded ? "Hide Details" : "Edit Details"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isExpanded ? "Close" : "Details"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setData((p) => p ? { ...p, services: p.services.filter((x) => x.id !== svc.id) } : p);
                            }}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Full Details Form (No Description / Short Description Fields) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/80">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Service Title</label>
                              <input
                                type="text"
                                value={svc.title}
                                onChange={(e) => setData((p) => p ? {
                                  ...p,
                                  services: p.services.map((x) => x.id === svc.id ? { ...x, title: e.target.value } : x)
                                } : p)}
                                className={field}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>Category</label>
                              <select
                                value={svc.category}
                                onChange={(e) => setData((p) => p ? {
                                  ...p,
                                  services: p.services.map((x) => x.id === svc.id ? { ...x, category: e.target.value } : x)
                                } : p)}
                                className={field + " cursor-pointer font-medium"}
                              >
                                {CATEGORY_OPTIONS.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                                {!CATEGORY_OPTIONS.includes(svc.category) && svc.category && (
                                  <option value={svc.category}>{svc.category}</option>
                                )}
                              </select>
                            </div>
                          </div>

                          <ImageInput
                            label="Service Photo"
                            value={svc.image}
                            onChange={(v) => setData((p) => p ? {
                              ...p,
                              services: p.services.map((x) => x.id === svc.id ? { ...x, image: v } : x)
                            } : p)}
                          />

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className={labelCls}>Key Features / Bullet Points</label>
                              <button
                                type="button"
                                onClick={() => setData((p) => p ? {
                                  ...p,
                                  services: p.services.map((x) => x.id === svc.id ? { ...x, features: [...x.features, ""] } : x)
                                } : p)}
                                className="text-xs text-[#6F20E8] hover:text-[#5B16C7] font-semibold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Add Feature
                              </button>
                            </div>
                            {svc.features.map((feat, fi) => (
                              <div key={fi} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={feat}
                                  onChange={(e) => setData((p) => p ? {
                                    ...p,
                                    services: p.services.map((x) => {
                                      if (x.id !== svc.id) return x;
                                      const f = [...x.features];
                                      f[fi] = e.target.value;
                                      return { ...x, features: f };
                                    })
                                  } : p)}
                                  className={field}
                                  placeholder="Feature description"
                                />
                                <button
                                  type="button"
                                  onClick={() => setData((p) => p ? {
                                    ...p,
                                    services: p.services.map((x) => x.id === svc.id ? { ...x, features: x.features.filter((_, k) => k !== fi) } : x)
                                  } : p)}
                                  className="text-red-500 hover:text-red-600 px-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={svc.featured}
                              onChange={(e) => setData((p) => p ? {
                                ...p,
                                services: p.services.map((x) => x.id === svc.id ? { ...x, featured: e.target.checked } : x)
                              } : p)}
                              className="w-4 h-4 accent-[#6F20E8]"
                            />
                            <span className="text-sm text-gray-700 font-medium">Mark as Featured (shown on homepage)</span>
                          </label>

                          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200/70">
                            <button
                              type="button"
                              onClick={() => setExpandedService(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Close Details
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={async () => {
                                await handleSave();
                                setExpandedService(null);
                              }}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TEAM (GRID VIEW WITH CLICK-TO-EXPAND DETAILS) ─────────── */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <SectionHeader
                title="Team Members"
                subtitle="Click any member photo or card to view and edit details."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const m: TeamMember = {
                        id: genId(),
                        name: "New Member",
                        role: "Role / Position",
                        image: "",
                        socialLinks: {},
                        sortOrder: data.team.length + 1,
                      };
                      setData((p) => p ? { ...p, team: [...p.team, m] } : p);
                      setExpandedTeam(m.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    <Plus className="w-4 h-4" /> Add Member
                  </button>
                }
              />

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.team.map((m) => {
                  const isExpanded = expandedTeam === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col ${
                        isExpanded ? "border-[#6F20E8] ring-2 ring-[#6F20E8]/15 sm:col-span-2 lg:col-span-3" : "border-gray-200 hover:shadow-md"
                      }`}
                    >
                      {/* Photo Thumbnail — Full Face Visible & Clicking Photo Shows Details */}
                      <div
                        onClick={() => setExpandedTeam(isExpanded ? null : m.id)}
                        className="relative aspect-[4/3] w-full bg-gray-100 cursor-pointer group border-b border-gray-200 overflow-hidden"
                        title="Click photo to view or edit details"
                      >
                        {m.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.image}
                            alt={m.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <Users className="w-12 h-12 mb-2 text-gray-300 group-hover:text-[#6F20E8] transition-colors" />
                            <span className="text-xs font-semibold text-gray-500">Click to add photo</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                          <span className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow">
                            <Edit3 className="w-3.5 h-3.5" />
                            {isExpanded ? "Hide Details" : "Click photo to edit details"}
                          </span>
                        </div>
                      </div>

                      {/* Header Summary Bar */}
                      <div className="p-4 flex items-center justify-between gap-2">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpandedTeam(isExpanded ? null : m.id)}
                        >
                          <h4 className="font-bold text-gray-900 text-sm truncate">{m.name || "Untitled Member"}</h4>
                          <p className="text-xs text-[#6F20E8] font-semibold truncate mt-0.5">{m.role || "Member Role"}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedTeam(isExpanded ? null : m.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                              isExpanded
                                ? "bg-[#6F20E8] text-white border-[#6F20E8]"
                                : "bg-purple-50 text-[#6F20E8] border-purple-200 hover:bg-purple-100"
                            }`}
                            title={isExpanded ? "Hide Details" : "Edit Details"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isExpanded ? "Close" : "Details"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setData((p) => p ? { ...p, team: p.team.filter((x) => x.id !== m.id) } : p);
                            }}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Full Details Form (No Bio/Description Field) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/80">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Full Name</label>
                              <input
                                type="text"
                                value={m.name}
                                onChange={(e) => setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x) } : p)}
                                className={field}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>Role / Position</label>
                              <input
                                type="text"
                                value={m.role}
                                onChange={(e) => setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, role: e.target.value } : x) } : p)}
                                className={field}
                              />
                            </div>
                          </div>

                          <ImageInput
                            label="Profile Photo"
                            value={m.image}
                            onChange={(v) => setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, image: v } : x) } : p)}
                          />

                          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200/70">
                            <button
                              type="button"
                              onClick={() => setExpandedTeam(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Close Details
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={async () => {
                                await handleSave();
                                setExpandedTeam(null);
                              }}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <SectionHeader
                title="Client Reviews"
                subtitle="Manage testimonials and client ratings displayed on the website."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => setData((p) => p ? { ...p, testimonials: [...p.testimonials, { id: genId(), name: "Client Name", business: "Business", quote: "Great service!", rating: 5 }] } : p)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    <Plus className="w-4 h-4" /> Add Review
                  </button>
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.testimonials.map((t) => (
                  <div key={t.id} className={sectionCard + " !space-y-3"}>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}
                      </div>
                      <button onClick={() => setData((p) => p ? { ...p, testimonials: p.testimonials.filter((x) => x.id !== t.id) } : p)} className="text-red-500 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelCls}>Client Name</label><input type="text" value={t.name} onChange={(e) => setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x) } : p)} className={field} /></div>
                      <div><label className={labelCls}>Business Name</label><input type="text" value={t.business} onChange={(e) => setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, business: e.target.value } : x) } : p)} className={field} /></div>
                    </div>
                    <div><label className={labelCls}>Review Quote</label><textarea value={t.quote} onChange={(e) => setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, quote: e.target.value } : x) } : p)} rows={2} className={field} /></div>
                    <div>
                      <label className={labelCls}>Rating (1-5)</label>
                      <div className="flex gap-2 mt-1">
                        {[1,2,3,4,5].map((s) => (
                          <button key={s} type="button" onClick={() => setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, rating: s } : x) } : p)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${s <= t.rating ? "bg-yellow-400 text-black shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FAQs ────────────────────────────────────────────────────── */}
          {activeTab === "faqs" && (
            <div className="space-y-6">
              <SectionHeader
                title="Frequently Asked Questions"
                subtitle="Help prospective clients quickly understand print formats, delivery, and services."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => setData((p) => p ? { ...p, faqs: [...p.faqs, { id: genId(), question: "New Question?", answer: "Answer here." }] } : p)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    <Plus className="w-4 h-4" /> Add FAQ
                  </button>
                }
              />
              <div className="space-y-4">
                {data.faqs.map((faq, i) => (
                  <div key={faq.id} className={sectionCard + " !space-y-3"}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Q{i + 1}</span>
                      <button onClick={() => setData((p) => p ? { ...p, faqs: p.faqs.filter((x) => x.id !== faq.id) } : p)} className="text-red-500 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div><label className={labelCls}>Question</label><input type="text" value={faq.question} onChange={(e) => setData((p) => p ? { ...p, faqs: p.faqs.map((x) => x.id === faq.id ? { ...x, question: e.target.value } : x) } : p)} className={field} /></div>
                    <div><label className={labelCls}>Answer</label><textarea value={faq.answer} onChange={(e) => setData((p) => p ? { ...p, faqs: p.faqs.map((x) => x.id === faq.id ? { ...x, answer: e.target.value } : x) } : p)} rows={3} className={field} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MEDIA LIBRARY ─────────────────────────────────────────── */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <SectionHeader
                title="Media Library"
                subtitle="Upload, organize, and copy image URLs for use across your website."
                onSave={handleSave}
                saving={saving}
                actionButton={
                  <button
                    type="button"
                    onClick={() => mediaFileRef.current?.click()}
                    disabled={mediaUploading}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl disabled:opacity-50 transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    {mediaUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Images
                  </button>
                }
              />
              <input
                ref={mediaFileRef}
                type="file"
                accept={ACCEPT_PHOTO_ATTR}
                multiple
                className="hidden"
                onChange={async (e) => {
                  const rawFiles = Array.from(e.target.files || []);
                  if (!rawFiles.length) return;

                  const validFiles: File[] = [];
                  for (const file of rawFiles) {
                    const check = validatePhoto(file);
                    if (!check.valid) {
                      showToast(check.error || "Invalid file", "error");
                    } else {
                      validFiles.push(file);
                    }
                  }

                  if (!validFiles.length) {
                    e.target.value = "";
                    return;
                  }

                  setMediaUploading(true);
                  for (const file of validFiles) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await fetch("/api/admin/upload", { method: "POST", body: fd });
                  }
                  await loadMedia();
                  setMediaUploading(false);
                  showToast(`Uploaded ${validFiles.length} photo(s) successfully`, "success");
                  e.target.value = "";
                }}
              />

              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const rawFiles = Array.from(e.dataTransfer.files);
                  if (!rawFiles.length) return;

                  const validFiles: File[] = [];
                  for (const file of rawFiles) {
                    const check = validatePhoto(file);
                    if (!check.valid) {
                      showToast(check.error || "Invalid file", "error");
                    } else {
                      validFiles.push(file);
                    }
                  }

                  if (!validFiles.length) return;

                  setMediaUploading(true);
                  for (const file of validFiles) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await fetch("/api/admin/upload", { method: "POST", body: fd });
                  }
                  await loadMedia();
                  setMediaUploading(false);
                  showToast(`Uploaded ${validFiles.length} photo(s) successfully`, "success");
                }}
                className="border-2 border-dashed border-gray-300 hover:border-[#6F20E8] bg-gray-50/70 hover:bg-purple-50/20 rounded-2xl py-12 text-center transition-colors cursor-pointer"
                onClick={() => mediaFileRef.current?.click()}
              >
                {mediaUploading ? (
                  <><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#6F20E8]" /><p className="text-sm text-gray-500 font-medium">Uploading…</p></>
                ) : (
                  <><Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" /><p className="text-sm font-semibold text-gray-700">Drag & drop photos here, or click to browse</p><p className="text-xs text-gray-500 mt-1">JPG, JPEG, PNG, or WEBP up to 15MB</p></>
                )}
              </div>

              {/* File Grid */}
              {uploadedFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.name} className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name} className="w-full h-28 object-cover" />
                      <div className="p-2">
                        <p className="text-[11px] text-gray-800 font-medium truncate" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(window.location.origin + file.url); showToast("URL copied to clipboard!", "success"); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all shadow-md"
                      >
                        Copy URL
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No uploaded images yet.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
