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
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Business {
  name: string; description: string; address: string; phone: string;
  whatsapp: string; email: string; mapsLink: string; hours: string;
}
interface Socials { instagram: string; facebook: string; }
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

type ActiveModal = {
  type: "portfolio" | "service" | "team" | "client" | "testimonial" | "faq" | "hero";
  idOrIndex: string | number;
  isNew?: boolean;
  mode?: "view" | "edit";
} | null;

const TABS = [
  { id: "business", label: "Social Links", icon: Globe },
  { id: "hero", label: "Hero Images", icon: ImageIcon },
  { id: "clients", label: "Client Logos", icon: Building2 },
  { id: "portfolio", label: "Portfolio", icon: LayoutGrid },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "team", label: "Team", icon: Users },
  { id: "testimonials", label: "Reviews", icon: MessageSquare },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
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
    <div className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl border flex items-center gap-2.5 shadow-xl text-sm font-semibold ${colors[type]}`}>
      {type === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {message}
      <button type="button" onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
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

// ── ImageInput (Responsive upload button + ReadOnly view mode) ─────────────────
function ImageInput({
  value,
  onChange,
  label,
  readOnly = false,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  readOnly?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoDims, setPhotoDims] = useState<{ w: number; h: number } | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (readOnly) return;
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
        <span>Photo Size: Max 15MB · Formats: JPG, PNG, WEBP</span>
        {photoDims && (
          <span className="font-semibold text-[#6F20E8] bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-flex items-center gap-1 w-fit">
            <span>Photo Size:</span> {photoDims.w} × {photoDims.h} px {fileSizeStr ? `(${fileSizeStr})` : ""}
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

// ── Section Header with Save Button ─────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
  actionButton,
}: {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
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
  const [activeTab, setActiveTab] = useState("business");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "loading" } | null>(null);

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
    type: "portfolio" | "service" | "team" | "client" | "testimonial" | "faq" | "hero";
    idOrIndex: string | number;
    name: string;
  } | null>(null);

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
        setData((p) => p ? { ...p, heroImages: p.heroImages.filter((_, idx) => idx !== activeModal.idOrIndex) } : p);
      }
    }
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

  const cleanSocialUrl = (url: string) => {
    if (!url) return "";
    let c = url.trim();
    while (c.startsWith("#")) c = c.slice(1).trim();
    if (!c) return "";
    if (!/^https?:\/\//i.test(c)) c = `https://${c}`;
    return c;
  };

  const handleSave = async (customData?: SiteData) => {
    const payload = customData || data;
    if (!payload) return;
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      const sanitizedData: SiteData = {
        ...payload,
        socials: {
          instagram: cleanSocialUrl(payload.socials?.instagram || ""),
          facebook: cleanSocialUrl(payload.socials?.facebook || ""),
        },
        clients: (payload.clients || []).filter((c) => c.name.trim() !== ""),
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

      // Immediately propagate updates to localStorage and custom events
      // This synchronizes all open browser tabs and components instantly with ZERO page reload!
      try {
        localStorage.setItem("jalaram_site_content_v2", JSON.stringify(sanitizedData));
        localStorage.setItem("jalaram_site_content_v2_time", Date.now().toString());
        window.dispatchEvent(new CustomEvent("site-content-updated", { detail: sanitizedData }));
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
    if (!deletePrompt || !data) return;
    const { type, idOrIndex } = deletePrompt;
    let updated: SiteData = { ...data };

    if (type === "portfolio") {
      updated = { ...updated, portfolio: updated.portfolio.filter((x) => x.id !== idOrIndex) };
    } else if (type === "service") {
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
    const current = data.socials[k];
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
              src="/images/jalaram-logo.png"
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
                  src="/images/jalaram-logo.png"
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all text-left ${
                    isActive
                      ? "bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white shadow-md shadow-[#6F20E8]/25 font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-purple-50/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
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
                title="Social Profiles"
                subtitle="Configure official social media profile URLs (Instagram and Facebook)."
              />
              <div className={sectionCard}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#6F20E8]" /> Official Social Profiles
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin inline-block mr-1" />}
                    Save
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["instagram", "facebook"] as (keyof Socials)[]).map((key) => (
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

          {/* ── HERO IMAGES (TABLE VIEW + MODAL POP SCREEN) ───────────── */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <SectionHeader
                title="Hero Carousel Images"
                subtitle="Click any row or action icon to view and edit the hero slide in a popup modal."
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const newIdx = data.heroImages.length;
                      setData((p) => p ? { ...p, heroImages: [...p.heroImages, ""] } : p);
                      setActiveModal({ type: "hero", idOrIndex: newIdx, isNew: true, mode: "edit" });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-xs md:text-sm font-semibold rounded-xl text-[#6F20E8] transition-all border border-purple-200"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                }
              />

              {data.heroImages.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No hero images added yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full min-w-[520px] text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-14">Slide</th>
                        <th className="py-3.5 px-4 w-28">Preview</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Image Source</th>
                        <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.heroImages.map((url, i) => (
                        <tr
                          key={i}
                          onClick={() => setActiveModal({ type: "hero", idOrIndex: i, mode: "view" })}
                          className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 text-center">
                            <span className="w-7 h-7 rounded-full bg-purple-50 text-[#6F20E8] font-bold text-xs inline-flex items-center justify-center border border-purple-200">
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                              {url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt={`Slide ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
                                onClick={() => setActiveModal({ type: "hero", idOrIndex: i, mode: "view" })}
                                className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6F20E8] transition-all"
                                title="View details (Read Only)"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveModal({ type: "hero", idOrIndex: i, mode: "edit" })}
                                className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-[#6F20E8] transition-all"
                                title="Edit details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletePrompt({ type: "hero", idOrIndex: i, name: `Hero Slide ${i + 1}` })}
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
          )}

          {/* ── CLIENT LOGOS MARQUEE (TABLE VIEW + MODAL POP SCREEN) ──── */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              <SectionHeader
                title="Client Companies & Marquee Logos"
                subtitle="All client entries displayed in a table. Click any entry or photo to view and edit in a popup modal."
                actionButton={
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
                }
              />

              {/* Logo Photo Validation Notice */}
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-900 font-medium flex items-center gap-2.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#6F20E8] shrink-0" />
                <span>
                  <strong>Client Logo Validation:</strong> Photos must be in <strong>JPG, JPEG, PNG, or WEBP</strong> format and up to <strong>15 MB</strong> in size. Logos are displayed seamlessly without background boxes.
                </span>
              </div>

              {(!data.clients || data.clients.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No client companies added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click &quot;Add Client Company&quot; above to add brands.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full min-w-[560px] text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-12">#</th>
                        <th className="py-3.5 px-4 w-20">Logo</th>
                        <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Company / Institution Name</th>
                        <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Category / Tag</th>
                        <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.clients.map((client, i) => (
                        <tr
                          key={client.id || i}
                          onClick={() => setActiveModal({ type: "client", idOrIndex: client.id, mode: "view" })}
                          className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 text-center text-xs font-bold text-gray-400">
                            {i + 1}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PORTFOLIO (TABLE VIEW + MODAL POP SCREEN) ─────────────── */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <SectionHeader
                title="Portfolio Projects"
                subtitle="All projects organized in a table. Click any row or action icon to view and edit details in a popup modal screen."
                actionButton={
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
                }
              />

              {data.portfolio.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No portfolio projects found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full min-w-[680px] text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-12">#</th>
                        <th className="py-3.5 px-4 w-20">Photo</th>
                        <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Project Title</th>
                        <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Category</th>
                        <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Location</th>
                        <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.portfolio.map((item, idx) => (
                        <tr
                          key={item.id}
                          onClick={() => setActiveModal({ type: "portfolio", idOrIndex: item.id, mode: "view" })}
                          className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 text-center text-xs font-bold text-gray-400">
                            {idx + 1}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SERVICES (TABLE VIEW + MODAL POP SCREEN) ──────────────── */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <SectionHeader
                title="Services"
                subtitle="All services listed in a table. Click any entry or action icon to view and edit details in a popup modal."
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const s: Service = {
                        id: genId(),
                        slug: `service-${genId()}`,
                        title: "",
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
                }
              />

              {data.services.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No services found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full min-w-[640px] text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-12">#</th>
                        <th className="py-3.5 px-4 w-20">Photo</th>
                        <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Service Title</th>
                        <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Category</th>
                        <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Key Features</th>
                        <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.services.map((svc, idx) => (
                        <tr
                          key={svc.id}
                          onClick={() => setActiveModal({ type: "service", idOrIndex: svc.id, mode: "view" })}
                          className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 text-center text-xs font-bold text-gray-400">
                            {idx + 1}
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
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-gray-900 leading-tight">{svc.title || "Untitled Service"}</div>
                            <span className="text-[11px] font-normal text-gray-400">Click to view details</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#6F20E8] border border-purple-200 whitespace-nowrap">
                              {svc.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-600 text-xs">
                            <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                              {svc.features?.length || 0} feature(s)
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TEAM (TABLE VIEW + MODAL POP SCREEN) ─────────────────── */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <SectionHeader
                title="Team Members"
                subtitle="All team members displayed in a table. Click any row or action icon to view and edit details in a popup modal."
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const m: TeamMember = {
                        id: genId(),
                        name: "",
                        role: "",
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
                }
              />

              {data.team.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No team members added yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full min-w-[580px] text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-12">#</th>
                        <th className="py-3.5 px-4 w-20">Photo</th>
                        <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Full Name</th>
                        <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Role / Position</th>
                        <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.team.map((m, idx) => (
                        <tr
                          key={m.id}
                          onClick={() => setActiveModal({ type: "team", idOrIndex: m.id, mode: "view" })}
                          className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 text-center text-xs font-bold text-gray-400">
                            {idx + 1}
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
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-gray-900 leading-tight">{m.name || "Untitled Member"}</div>
                            <span className="text-[11px] font-normal text-gray-400">Click to view details</span>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TESTIMONIALS (TABLE VIEW + MODAL POP SCREEN) ─────────── */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <SectionHeader
                title="Client Reviews"
                subtitle="All client reviews listed in a table. Click any entry or action icon to view and edit details in a popup modal."
                actionButton={
                  <button
                    type="button"
                    onClick={() => {
                      const newT = { id: genId(), name: "", business: "", quote: "", rating: 5 };
                      setData((p) => p ? { ...p, testimonials: [...p.testimonials, newT] } : p);
                      setActiveModal({ type: "testimonial", idOrIndex: newT.id, isNew: true, mode: "edit" });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#6F20E8]/20"
                  >
                    <Plus className="w-4 h-4" /> Add Review
                  </button>
                }
              />

              {data.testimonials.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No reviews found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full min-w-[660px] text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-12">#</th>
                        <th className="py-3.5 px-4 w-28 whitespace-nowrap">Rating</th>
                        <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Client Name</th>
                        <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Business</th>
                        <th className="py-3.5 px-4 min-w-[200px]">Review Quote</th>
                        <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.testimonials.map((t, idx) => (
                        <tr
                          key={t.id}
                          onClick={() => setActiveModal({ type: "testimonial", idOrIndex: t.id, mode: "view" })}
                          className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 text-center text-xs font-bold text-gray-400">
                            {idx + 1}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── FAQS (TABLE VIEW + MODAL POP SCREEN) ──────────────────── */}
          {activeTab === "faqs" && (
            <div className="space-y-6">
              <SectionHeader
                title="Frequently Asked Questions"
                subtitle="All questions listed in a table. Click any entry or action icon to view and edit details in a popup modal."
                actionButton={
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
                }
              />

              {data.faqs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No FAQs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full min-w-[560px] text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-12">#</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Question</th>
                        <th className="py-3.5 px-4 min-w-[240px]">Answer Preview</th>
                        <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.faqs.map((faq, i) => (
                        <tr
                          key={faq.id}
                          onClick={() => setActiveModal({ type: "faq", idOrIndex: faq.id, mode: "view" })}
                          className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 text-center text-xs font-bold text-gray-400">
                            Q{i + 1}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              if (!item.title || !item.title.trim()) {
                setModalError("Project Title is required. Please fill in the project title before saving.");
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
                <label className={labelCls}>Project Title *</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  value={item.title}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    setModalError(null);
                    setData((p) => p ? {
                      ...p,
                      portfolio: p.portfolio.map((x) => x.id === item.id ? {
                        ...x,
                        title: e.target.value,
                        slug: x.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                      } : x)
                    } : p);
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
                      setData((p) => p ? {
                        ...p,
                        portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, category: e.target.value } : x)
                      } : p);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : " cursor-pointer font-medium")}
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
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    value={item.location}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      setData((p) => p ? {
                        ...p,
                        portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, location: e.target.value } : x)
                      } : p);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                    placeholder="e.g. Gandhinagar, Gujarat"
                  />
                </div>
              </div>

              <ImageInput
                label="Cover Photo"
                value={item.image}
                readOnly={isReadOnly}
                onChange={(v) => {
                  if (isReadOnly) return;
                  setData((p) => p ? {
                    ...p,
                    portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, image: v } : x)
                  } : p);
                }}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Gallery Photos</label>
                  {!isReadOnly && (
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
                  )}
                </div>
                {item.images.length === 0 && isReadOnly && (
                  <p className="text-xs text-gray-400 italic">No gallery photos uploaded</p>
                )}
                {item.images.map((img, gi) => (
                  <div key={gi} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      value={img}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        setData((p) => p ? {
                          ...p,
                          portfolio: p.portfolio.map((x) => {
                            if (x.id !== item.id) return x;
                            const imgs = [...x.images];
                            imgs[gi] = e.target.value;
                            return { ...x, images: imgs };
                          })
                        } : p);
                      }}
                      className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                      placeholder="Image URL"
                    />
                    {!isReadOnly && (
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
                    )}
                  </div>
                ))}
              </div>

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
        const svc = data.services.find((x) => x.id === activeModal.idOrIndex);
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
              if (!svc.title || !svc.title.trim()) {
                setModalError("Service Title is required. Please fill in the title before saving.");
                return;
              }
              setModalError(null);
              await handleSave();
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
                      setData((p) => p ? {
                        ...p,
                        services: p.services.map((x) => x.id === svc.id ? { ...x, title: e.target.value } : x)
                      } : p);
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
                      setData((p) => p ? {
                        ...p,
                        services: p.services.map((x) => x.id === svc.id ? { ...x, category: e.target.value } : x)
                      } : p);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : " cursor-pointer font-medium")}
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
                readOnly={isReadOnly}
                onChange={(v) => {
                  if (isReadOnly) return;
                  setData((p) => p ? {
                    ...p,
                    services: p.services.map((x) => x.id === svc.id ? { ...x, image: v } : x)
                  } : p);
                }}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Key Features / Bullet Points</label>
                  {!isReadOnly && (
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
                  )}
                </div>
                {svc.features.length === 0 && isReadOnly && (
                  <p className="text-xs text-gray-400 italic">No features listed</p>
                )}
                {svc.features.map((feat, fi) => (
                  <div key={fi} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      value={feat}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        setData((p) => p ? {
                          ...p,
                          services: p.services.map((x) => {
                            if (x.id !== svc.id) return x;
                            const f = [...x.features];
                            f[fi] = e.target.value;
                            return { ...x, features: f };
                          })
                        } : p);
                      }}
                      className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                      placeholder="Feature description"
                    />
                    {!isReadOnly && (
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
              if (!m.name || !m.name.trim() || !m.role || !m.role.trim()) {
                setModalError("Both Full Name and Role / Position are required before saving.");
                return;
              }
              setModalError(null);
              await handleSave();
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
                      setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x) } : p);
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
                      setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, role: e.target.value } : x) } : p);
                    }}
                    className={field + (isReadOnly ? " bg-gray-100 cursor-not-allowed text-gray-700" : "")}
                  />
                </div>
              </div>

              <ImageInput
                label="Profile Photo"
                value={m.image}
                readOnly={isReadOnly}
                onChange={(v) => {
                  if (isReadOnly) return;
                  setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, image: v } : x) } : p);
                }}
              />
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
        const url = data.heroImages[idx];
        if (url === undefined) return null;
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
              if (!url || !url.trim()) {
                setModalError("Image URL or uploaded photo is required for the slide.");
                return;
              }
              setModalError(null);
              await handleSave();
              closeModal();
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

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
