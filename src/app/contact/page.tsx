"use client";

import { useState } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import { MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { formatExternalUrl } from "@/lib/utils";

import PageHero from "@/components/common/PageHero";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const siteData = useSiteData();
  const contact = siteData.contactPage;

  const validate = (name: string, value: string) => {
    let error = "";
    if (name === "name") {
      const trimmed = value.trim();
      if (!trimmed) {
        error = "Full name is required.";
      } else if (trimmed.length < 2) {
        error = "Name must be at least 2 characters.";
      } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
        error = "Name should contain letters only.";
      }
    } else if (name === "phone") {
      const clean = value.replace(/\D/g, "");
      if (!clean) {
        error = "Phone number is required.";
      } else if (clean.length < 10 || clean.length > 13) {
        error = "Please enter a valid 10-digit mobile number.";
      } else if (clean.length === 10 && !/^[6-9]/.test(clean)) {
        error = "Mobile number should start with 6, 7, 8, or 9.";
      }
    } else if (name === "email") {
      const trimmed = value.trim();
      if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
        error = "Please enter a valid email address (e.g. name@domain.com).";
      }
    } else if (name === "message") {
      const trimmed = value.trim();
      if (!trimmed) {
        error = "Message is required.";
      } else if (trimmed.length < 10) {
        error = `Please write at least 10 characters (${trimmed.length}/10).`;
      }
    }
    return error;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validate(field, formData[field as keyof typeof formData]);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validate(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const errors: Record<string, string> = {
      name: validate("name", formData.name),
      phone: validate("phone", formData.phone),
      email: validate("email", formData.email),
      message: validate("message", formData.message),
    };

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(errors);
      setTouched({ name: true, phone: true, email: true, message: true });
      setErrorMsg("Please fix the highlighted fields below before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      setIsSubmitted(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        company: "",
        service: "",
        message: "",
      });
      setFieldErrors({});
      setTouched({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again or call us directly.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* High-contrast backdrop-blur-md glass pill badge over photo hero */}
      <PageHero
        badgeText={contact.heroTagline || "Contact Us • Fast Quotes & Consultation"}
        title={
          <>
            LET&apos;S MAKE YOUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">
              BRAND
            </span>{" "}
            IMPOSSIBLE TO{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">
              MISS.
            </span>
          </>
        }
        subtitle={contact.heroSubtitle || "Tell us what you need printed, branded or installed. Our team will help you find the right solution."}
        images={[
          contact?.heroImage && !contact.heroImage.includes("unsplash") ? contact.heroImage : "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398007/jalaram/jalaram_3d-led-board_1790398009053.webp",
          "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp",
          "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398038/jalaram/jalaram_glow-signs_1790398039933.webp",
        ]}
      />

      <section className="py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Contact Info */}
            <div className="space-y-10">
              <div>
                <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-accent pl-4 mb-4 block">
                  Get in Touch
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-8">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {/* Location */}
                  <a
                    href="https://maps.google.com/?q=G-24%2C%2025%2C%2026%2C%2031%2C%20Sector%2011%2C%20Gandhinagar%2C%20Gujarat%20382010%2C%20India"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-5 group cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-card-bg border border-black/5 rounded-sm flex items-center justify-center shrink-0 shadow-lg shadow-accent/5 group-hover:border-accent group-hover:scale-105 transition-all">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1 text-lg group-hover:text-accent transition-colors">Our Location</h3>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-xs group-hover:text-accent transition-colors">
                        {siteData.business.address}
                      </p>
                      <span className="text-xs text-accent font-semibold mt-1 inline-flex items-center gap-1 group-hover:underline">
                        Open in Google Maps &rarr;
                      </span>
                    </div>
                  </a>

                  {/* Phone & WhatsApp */}
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-card-bg border border-black/5 rounded-sm flex items-center justify-center shrink-0 shadow-lg shadow-accent/5">
                      <Phone className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold mb-1 text-lg">Phone &amp; WhatsApp</h3>
                      <a href={`tel:${siteData.business.phone.replace(/\s/g, "")}`} className="text-gray-600 text-sm leading-relaxed hover:text-accent transition-colors">
                        {siteData.business.phone}
                      </a>
                      {Boolean(siteData.business.extraPhone?.trim()) && (
                        <a href={`tel:${siteData.business.extraPhone!.replace(/\s/g, "")}`} className="text-gray-600 text-sm leading-relaxed hover:text-accent transition-colors mt-1">
                          {siteData.business.extraPhone} <span className="text-xs text-gray-400 font-normal">(Secondary)</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-card-bg border border-black/5 rounded-sm flex items-center justify-center shrink-0 shadow-lg shadow-accent/5">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold mb-1 text-lg">Email</h3>
                      <a href={`mailto:${siteData.business.email}`} className="text-gray-600 text-sm leading-relaxed hover:text-accent transition-colors">
                        {siteData.business.email}
                      </a>
                      {Boolean(siteData.business.extraEmail?.trim()) && (
                        <a href={`mailto:${siteData.business.extraEmail}`} className="text-gray-600 text-sm leading-relaxed hover:text-accent transition-colors mt-1">
                          {siteData.business.extraEmail} <span className="text-xs text-gray-400 font-normal">(Secondary)</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-card-bg border border-black/5 rounded-sm flex items-center justify-center shrink-0 shadow-lg shadow-accent/5">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1 text-lg">Business Hours</h3>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{siteData.business.hours}</p>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                {(() => {
                  const activeSocials = [
                    {
                      name: "Instagram",
                      href: siteData.socials?.instagram,
                      icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                        </svg>
                      ),
                    },
                    {
                      name: "Facebook",
                      href: siteData.socials?.facebook,
                      icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                        </svg>
                      ),
                    },
                    {
                      name: "YouTube",
                      href: siteData.socials?.youtube,
                      icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
                        </svg>
                      ),
                    },
                    {
                      name: "LinkedIn",
                      href: siteData.socials?.linkedin,
                      icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect width="4" height="12" x="2" y="9"/>
                          <circle cx="4" cy="4" r="2"/>
                        </svg>
                      ),
                    },
                    {
                      name: "Twitter",
                      href: (siteData.socials as { twitter?: string })?.twitter,
                      icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      ),
                    },
                  ].filter((s) => {
                    const finalUrl = formatExternalUrl(s.href);
                    return finalUrl !== "#" && Boolean(s.href && s.href.trim().length > 0);
                  });

                  if (activeSocials.length === 0) return null;

                  return (
                    <div className="pt-4 border-t border-black/5">
                      <h3 className="font-bold text-lg mb-3">Follow Our Social Channels</h3>
                      <div className="flex flex-wrap gap-3">
                        {activeSocials.map((s) => {
                          const finalUrl = formatExternalUrl(s.href);
                          return (
                            <a
                              key={s.name}
                              href={finalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`${s.name} - Opens in new tab`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm bg-card-bg border-black/10 hover:border-[#6F20E8] hover:bg-[#6F20E8] hover:text-white text-gray-700 cursor-pointer"
                            >
                              {s.icon}
                              <span>{s.name}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Map */}
              <div className="aspect-video bg-card-bg border border-black/5 rounded-sm overflow-hidden relative group">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(siteData.business.address)}&output=embed`}
                  className="w-full h-full border-0 pointer-events-none"
                  allowFullScreen
                  loading="lazy"
                  title="Jalaram Digital Sign Location Map"
                />
                <a
                  href="https://maps.google.com/?q=G-24%2C%2025%2C%2026%2C%2031%2C%20Sector%2011%2C%20Gandhinagar%2C%20Gujarat%20382010%2C%20India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-all duration-300 cursor-pointer"
                  aria-label="Open location in Google Maps"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-[#6F20E8] font-bold text-xs rounded-full shadow-xl flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    View on Google Maps &rarr;
                  </span>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card-bg p-8 md:p-12 border border-black/5 rounded-sm">
              <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-accent pl-4 mb-4 block">
                Quick Quotation
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-8">Send an Enquiry</h2>

              {isSubmitted ? (
                <div className="bg-green-500/5 border border-green-500/20 p-10 text-center rounded-sm">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Message Sent</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-accent font-bold text-sm uppercase tracking-widest"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                        <span>Full Name <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        className={`w-full bg-background border px-5 py-4 text-gray-900 transition-colors rounded-sm focus:outline-none ${
                          touched.name && fieldErrors.name
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : touched.name && !fieldErrors.name && formData.name.trim()
                            ? "border-emerald-500/80 focus:border-accent"
                            : "border-black/10 focus:border-accent"
                        }`}
                        placeholder="John Doe"
                      />
                      {touched.name && fieldErrors.name && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                        <span>Mobile Phone <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        className={`w-full bg-background border px-5 py-4 text-gray-900 transition-colors rounded-sm focus:outline-none ${
                          touched.phone && fieldErrors.phone
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : touched.phone && !fieldErrors.phone && formData.phone.trim()
                            ? "border-emerald-500/80 focus:border-accent"
                            : "border-black/10 focus:border-accent"
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      {touched.phone && fieldErrors.phone && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        className={`w-full bg-background border px-5 py-4 text-gray-900 transition-colors rounded-sm focus:outline-none ${
                          touched.email && fieldErrors.email
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-black/10 focus:border-accent"
                        }`}
                        placeholder="john@example.com"
                      />
                      {touched.email && fieldErrors.email && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Company Name (Optional)</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors rounded-sm"
                        placeholder="Your Business or Brand"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Service of Interest</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors appearance-none rounded-sm cursor-pointer"
                    >
                      <option value="">Select a service</option>
                      {siteData.services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Project Details &amp; Message <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-xs font-semibold ${
                        formData.message.trim().length >= 10 ? "text-emerald-600" : "text-gray-400"
                      }`}>
                        {formData.message.trim().length}/10 min
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      onBlur={() => handleBlur("message")}
                      className={`w-full bg-background border px-5 py-4 text-gray-900 transition-colors resize-none rounded-sm focus:outline-none ${
                        touched.message && fieldErrors.message
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : touched.message && !fieldErrors.message && formData.message.trim()
                          ? "border-emerald-500/80 focus:border-accent"
                          : "border-black/10 focus:border-accent"
                      }`}
                      placeholder="Tell us about your project requirements, banner size, quantities, or signage needs..."
                    />
                    {touched.message && fieldErrors.message && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.message}</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-8 py-4 sm:py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#6F20E8]/30 min-h-[50px] disabled:opacity-70 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Submitting Enquiry...
                      </>
                    ) : (
                      <>
                        Submit Enquiry <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
