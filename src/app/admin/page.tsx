"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
  RefreshCw,
  Star,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  LayoutGrid,
  Eye,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Business {
  name: string; description: string; address: string; phone: string;
  whatsapp: string; email: string; mapsLink: string; hours: string;
}
interface Socials { instagram: string; facebook: string; twitter: string; linkedin: string; }
interface Service {
  id: string; slug: string; title: string; shortDescription: string;
  description: string; image: string; category: string; features: string[];
  featured: boolean; sortOrder: number;
}
interface PortfolioItem {
  id: string; slug: string; title: string; category: string; description: string;
  image: string; images: string[]; location: string; featured: boolean; sortOrder: number;
}
interface TeamMember {
  id: string; name: string; role: string; bio: string; image: string;
  socialLinks: Record<string, string>; sortOrder: number;
}
interface Testimonial { id: string; name: string; business: string; quote: string; rating: number; }
interface FAQ { id: string; question: string; answer: string; }
interface SiteData {
  business: Business; socials: Socials; heroImages: string[];
  services: Service[]; portfolio: PortfolioItem[]; team: TeamMember[];
  testimonials: Testimonial[]; faqs: FAQ[];
}
interface UploadedFile { name: string; url: string; size: number; createdAt: string; }

// ── Tab Config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "business", label: "Business Info", icon: Building2 },
  { id: "hero", label: "Hero Images", icon: ImageIcon },
  { id: "portfolio", label: "Portfolio", icon: LayoutGrid },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "team", label: "Team", icon: Users },
  { id: "testimonials", label: "Reviews", icon: MessageSquare },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "media", label: "Media Library", icon: Upload },
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

// ── ImageInput ──────────────────────────────────────────────────────────────
function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
    } catch {
      alert("Upload failed. Please try again or paste a URL.");
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
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL or upload →"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      </div>
      {value && (
        <div className="relative w-full h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const field = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20";
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
  const [expandedPortfolio, setExpandedPortfolio] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

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

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    showToast("Saving changes…", "loading");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Saved successfully! Live site updated.", "success");
    } catch {
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateBusiness = (field: keyof Business, value: string) => {
    setData((prev) => prev ? { ...prev, business: { ...prev.business, [field]: value } } : prev);
  };

  const updateSocials = (field: keyof Socials, value: string) => {
    setData((prev) => prev ? { ...prev, socials: { ...prev.socials, [field]: value } } : prev);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-red-500" />
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${activeTab === id ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "text-gray-500 hover:text-gray-900 hover:bg-red-50"}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex overflow-x-auto gap-1 p-3 bg-white border-b border-gray-200 shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === id ? "bg-red-600 text-white" : "text-gray-500 hover:text-gray-900 bg-gray-50"}`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Save Button */}
          <div className="md:hidden mb-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 py-2 px-5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>

          {/* ── BUSINESS INFO ─────────────────────────────────────────── */}
          {activeTab === "business" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
              <div className={sectionCard}>
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Building2 className="w-4 h-4 text-red-600" /> Basic Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([["name","Business Name",Building2],["description","Short Description (SEO)",Globe],["address","Full Address",MapPin],["phone","Phone Number",Phone],["whatsapp","WhatsApp Number (digits only)",Phone],["email","Email Address",Mail],["mapsLink","Google Maps Link",Globe],["hours","Business Hours",Clock]] as [keyof Business, string, unknown][]).map(([key, lbl]) => (
                    <div key={key} className={key === "description" || key === "address" ? "sm:col-span-2" : ""}>
                      <label className={labelCls}>{lbl}</label>
                      {key === "description" || key === "address" ? (
                        <textarea value={data.business[key]} onChange={(e) => updateBusiness(key, e.target.value)} rows={2} className={field} />
                      ) : (
                        <input type="text" value={data.business[key]} onChange={(e) => updateBusiness(key, e.target.value)} className={field} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={sectionCard}>
                <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2"><Globe className="w-4 h-4 text-red-500" /> Social Media Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["instagram","facebook","twitter","linkedin"] as (keyof Socials)[]).map((key) => (
                    <div key={key}>
                      <label className={labelCls}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                      <input type="text" value={data.socials[key]} onChange={(e) => updateSocials(key, e.target.value)} placeholder="https://..." className={field} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HERO IMAGES ────────────────────────────────────────────── */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Hero Carousel Images</h2>
                <button onClick={() => setData((p) => p ? { ...p, heroImages: [...p.heroImages, ""] } : p)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/14 text-sm font-semibold rounded-lg text-gray-300 hover:text-white transition-all border border-white/10">
                  <Plus className="w-3.5 h-3.5" /> Add Image
                </button>
              </div>
              <p className="text-sm text-gray-500">These images cycle through the homepage hero section. Paste an image URL or upload a file.</p>
              <div className="space-y-4">
                {data.heroImages.map((url, i) => (
                  <div key={i} className={sectionCard + " !space-y-3"}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slide {i + 1}</span>
                      <button onClick={() => setData((p) => p ? { ...p, heroImages: p.heroImages.filter((_, idx) => idx !== i) } : p)} className="text-red-500 hover:text-red-400 p-1 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <ImageInput value={url} onChange={(v) => setData((p) => { if (!p) return p; const imgs = [...p.heroImages]; imgs[i] = v; return { ...p, heroImages: imgs }; })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PORTFOLIO ──────────────────────────────────────────────── */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Portfolio Projects</h2>
                <button
                  onClick={() => {
                    const newItem: PortfolioItem = { id: genId(), slug: `project-${genId()}`, title: "New Project", category: "Hoardings", description: "", image: "", images: [], location: "Gandhinagar", featured: false, sortOrder: data.portfolio.length + 1 };
                    setData((p) => p ? { ...p, portfolio: [...p.portfolio, newItem] } : p);
                    setExpandedPortfolio(newItem.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>
              <div className="space-y-3">
                {data.portfolio.map((item) => (
                  <div key={item.id} className="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden">
                    {/* Collapsed Header */}
                    <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedPortfolio(expandedPortfolio === item.id ? null : item.id)}>
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center shrink-0"><ImageIcon className="w-5 h-5 text-gray-600" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.category} · {item.location}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.featured && <span className="text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">Featured</span>}
                        <button onClick={(e) => { e.stopPropagation(); setData((p) => p ? { ...p, portfolio: p.portfolio.filter((x) => x.id !== item.id) } : p); }} className="text-red-500 hover:text-red-400 p-1 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <Edit3 className={`w-4 h-4 transition-colors ${expandedPortfolio === item.id ? "text-red-500" : "text-gray-600"}`} />
                      </div>
                    </div>
                    {/* Expanded Form */}
                    {expandedPortfolio === item.id && (
                      <div className="border-t border-white/8 p-4 space-y-4 bg-gray-950/40">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><label className={labelCls}>Title</label><input type="text" value={item.title} onChange={(e) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, title: e.target.value } : x) } : p)} className={field} /></div>
                          <div><label className={labelCls}>Slug (URL)</label><input type="text" value={item.slug} onChange={(e) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, slug: e.target.value } : x) } : p)} className={field} /></div>
                          <div><label className={labelCls}>Category</label><input type="text" value={item.category} onChange={(e) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, category: e.target.value } : x) } : p)} className={field} /></div>
                          <div><label className={labelCls}>Location</label><input type="text" value={item.location} onChange={(e) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, location: e.target.value } : x) } : p)} className={field} /></div>
                          <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea value={item.description} onChange={(e) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, description: e.target.value } : x) } : p)} rows={3} className={field} /></div>
                        </div>
                        <ImageInput label="Cover Image" value={item.image} onChange={(v) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, image: v } : x) } : p)} />
                        <div>
                          <div className="flex items-center justify-between mb-2"><label className={labelCls}>Gallery Images</label><button onClick={() => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, images: [...x.images, ""] } : x) } : p)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button></div>
                          {item.images.map((img, gi) => (
                            <div key={gi} className="flex gap-2 mb-2">
                              <input type="text" value={img} onChange={(e) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => { if (x.id !== item.id) return x; const imgs = [...x.images]; imgs[gi] = e.target.value; return { ...x, images: imgs }; }) } : p)} className={field} placeholder="Image URL" />
                              <button onClick={() => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, images: x.images.filter((_, k) => k !== gi) } : x) } : p)} className="text-red-500 hover:text-red-400 px-2"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={item.featured} onChange={(e) => setData((p) => p ? { ...p, portfolio: p.portfolio.map((x) => x.id === item.id ? { ...x, featured: e.target.checked } : x) } : p)} className="w-4 h-4 accent-red-500" />
                          <span className="text-sm text-gray-300 font-medium">Mark as Featured (shown on homepage)</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SERVICES ──────────────────────────────────────────────── */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Services</h2>
                <button
                  onClick={() => {
                    const s: Service = { id: genId(), slug: `service-${genId()}`, title: "New Service", shortDescription: "", description: "", image: "", category: "Printing", features: [], featured: false, sortOrder: data.services.length + 1 };
                    setData((p) => p ? { ...p, services: [...p.services, s] } : p);
                    setExpandedService(s.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Service
                </button>
              </div>
              <div className="space-y-3">
                {data.services.map((svc) => (
                  <div key={svc.id} className="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedService(expandedService === svc.id ? null : svc.id)}>
                      {svc.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={svc.image} alt={svc.title} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center shrink-0"><Briefcase className="w-5 h-5 text-gray-600" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{svc.title}</p>
                        <p className="text-xs text-gray-500">{svc.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {svc.featured && <span className="text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">Featured</span>}
                        <button onClick={(e) => { e.stopPropagation(); setData((p) => p ? { ...p, services: p.services.filter((x) => x.id !== svc.id) } : p); }} className="text-red-500 hover:text-red-400 p-1 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <Edit3 className={`w-4 h-4 transition-colors ${expandedService === svc.id ? "text-red-500" : "text-gray-600"}`} />
                      </div>
                    </div>
                    {expandedService === svc.id && (
                      <div className="border-t border-white/8 p-4 space-y-4 bg-gray-950/40">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><label className={labelCls}>Title</label><input type="text" value={svc.title} onChange={(e) => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, title: e.target.value } : x) } : p)} className={field} /></div>
                          <div><label className={labelCls}>Category</label><input type="text" value={svc.category} onChange={(e) => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, category: e.target.value } : x) } : p)} className={field} /></div>
                          <div className="sm:col-span-2"><label className={labelCls}>Short Description</label><input type="text" value={svc.shortDescription} onChange={(e) => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, shortDescription: e.target.value } : x) } : p)} className={field} /></div>
                          <div className="sm:col-span-2"><label className={labelCls}>Full Description</label><textarea value={svc.description} onChange={(e) => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, description: e.target.value } : x) } : p)} rows={3} className={field} /></div>
                        </div>
                        <ImageInput label="Service Image" value={svc.image} onChange={(v) => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, image: v } : x) } : p)} />
                        <div>
                          <div className="flex items-center justify-between mb-2"><label className={labelCls}>Features / Bullet Points</label><button onClick={() => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, features: [...x.features, ""] } : x) } : p)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button></div>
                          {svc.features.map((feat, fi) => (
                            <div key={fi} className="flex gap-2 mb-2">
                              <input type="text" value={feat} onChange={(e) => setData((p) => p ? { ...p, services: p.services.map((x) => { if (x.id !== svc.id) return x; const f = [...x.features]; f[fi] = e.target.value; return { ...x, features: f }; }) } : p)} className={field} placeholder="Feature description" />
                              <button onClick={() => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, features: x.features.filter((_, k) => k !== fi) } : x) } : p)} className="text-red-500 hover:text-red-400 px-2"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={svc.featured} onChange={(e) => setData((p) => p ? { ...p, services: p.services.map((x) => x.id === svc.id ? { ...x, featured: e.target.checked } : x) } : p)} className="w-4 h-4 accent-red-500" />
                          <span className="text-sm text-gray-300 font-medium">Mark as Featured</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TEAM ──────────────────────────────────────────────────── */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Team Members</h2>
                <button
                  onClick={() => {
                    const m: TeamMember = { id: genId(), name: "New Member", role: "Role", bio: "", image: "", socialLinks: {}, sortOrder: data.team.length + 1 };
                    setData((p) => p ? { ...p, team: [...p.team, m] } : p);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.team.map((m) => (
                  <div key={m.id} className={sectionCard + " !space-y-4"}>
                    <div className="flex items-center gap-3">
                      {m.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.image} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-800 border-2 border-white/10 flex items-center justify-center"><Users className="w-6 h-6 text-gray-600" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                      <button onClick={() => setData((p) => p ? { ...p, team: p.team.filter((x) => x.id !== m.id) } : p)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div><label className={labelCls}>Name</label><input type="text" value={m.name} onChange={(e) => setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x) } : p)} className={field} /></div>
                    <div><label className={labelCls}>Role / Position</label><input type="text" value={m.role} onChange={(e) => setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, role: e.target.value } : x) } : p)} className={field} /></div>
                    <div><label className={labelCls}>Bio</label><textarea value={m.bio} onChange={(e) => setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, bio: e.target.value } : x) } : p)} rows={2} className={field} /></div>
                    <ImageInput label="Profile Photo" value={m.image} onChange={(v) => setData((p) => p ? { ...p, team: p.team.map((x) => x.id === m.id ? { ...x, image: v } : x) } : p)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Client Reviews</h2>
                <button
                  onClick={() => setData((p) => p ? { ...p, testimonials: [...p.testimonials, { id: genId(), name: "Client Name", business: "Business", quote: "Great service!", rating: 5 }] } : p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Review
                </button>
              </div>
              <div className="space-y-4">
                {data.testimonials.map((t) => (
                  <div key={t.id} className={sectionCard + " !space-y-3"}>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />)}
                      </div>
                      <button onClick={() => setData((p) => p ? { ...p, testimonials: p.testimonials.filter((x) => x.id !== t.id) } : p)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
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
                          <button key={s} type="button" onClick={() => setData((p) => p ? { ...p, testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, rating: s } : x) } : p)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${s <= t.rating ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-500 hover:bg-gray-700"}`}>{s}</button>
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
                <button
                  onClick={() => setData((p) => p ? { ...p, faqs: [...p.faqs, { id: genId(), question: "New Question?", answer: "Answer here." }] } : p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ
                </button>
              </div>
              <div className="space-y-4">
                {data.faqs.map((faq, i) => (
                  <div key={faq.id} className={sectionCard + " !space-y-3"}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Q{i + 1}</span>
                      <button onClick={() => setData((p) => p ? { ...p, faqs: p.faqs.filter((x) => x.id !== faq.id) } : p)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Media Library</h2>
                <button onClick={() => mediaFileRef.current?.click()} disabled={mediaUploading} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-all">
                  {mediaUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload Images
                </button>
                <input
                  ref={mediaFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    setMediaUploading(true);
                    for (const file of files) {
                      const fd = new FormData();
                      fd.append("file", file);
                      await fetch("/api/admin/upload", { method: "POST", body: fd });
                    }
                    await loadMedia();
                    setMediaUploading(false);
                    showToast(`Uploaded ${files.length} file(s) successfully`, "success");
                  }}
                />
              </div>
              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                  if (!files.length) return;
                  setMediaUploading(true);
                  for (const file of files) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await fetch("/api/admin/upload", { method: "POST", body: fd });
                  }
                  await loadMedia();
                  setMediaUploading(false);
                  showToast(`Uploaded ${files.length} file(s) successfully`, "success");
                }}
                className="border-2 border-dashed border-white/15 hover:border-red-500/50 rounded-2xl py-12 text-center transition-colors cursor-pointer"
                onClick={() => mediaFileRef.current?.click()}
              >
                {mediaUploading ? (
                  <><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-500" /><p className="text-sm text-gray-400 font-medium">Uploading…</p></>
                ) : (
                  <><Upload className="w-8 h-8 mx-auto mb-2 text-gray-600" /><p className="text-sm font-semibold text-gray-400">Drag & drop images here, or click to browse</p><p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP up to 15MB</p></>
                )}
              </div>
              {/* File Grid */}
              {uploadedFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.name} className="group relative bg-gray-900 rounded-xl overflow-hidden border border-white/8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name} className="w-full h-28 object-cover" />
                      <div className="p-2">
                        <p className="text-[11px] text-gray-400 truncate" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(window.location.origin + file.url); showToast("URL copied to clipboard!", "success"); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-opacity"
                      >
                        Copy URL
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-600 py-4">No uploaded images yet.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
