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
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const siteData = useSiteData();
  const contact = siteData.contactPage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

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
                  {[
                    { icon: MapPin, label: "Our Location", value: siteData.business.address, href: `https://maps.google.com/?q=${encodeURIComponent(siteData.business.address)}`, target: "_blank" },
                    { icon: Phone, label: "Phone & WhatsApp", value: siteData.business.phone, href: `tel:${siteData.business.phone.replace(/\s/g,'')}`, target: undefined },
                    { icon: Mail, label: "Email", value: siteData.business.email, href: `mailto:${siteData.business.email}`, target: undefined },
                    { icon: Clock, label: "Business Hours", value: siteData.business.hours, href: undefined, target: undefined },
                  ].map(({ icon: Icon, label, value, href, target }) => (
                    <div key={label} className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-card-bg border border-black/5 rounded-sm flex items-center justify-center shrink-0 shadow-lg shadow-accent/5">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 text-lg">{label}</h3>
                        {href ? (
                          <a href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined} className="text-gray-600 text-sm leading-relaxed max-w-xs hover:text-accent transition-colors">{value}</a>
                        ) : (
                          <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Media Links */}
                <div className="pt-4 border-t border-black/5">
                  <h3 className="font-bold text-lg mb-3">Follow Our Social Channels</h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      {
                        name: "Instagram",
                        href: siteData.socials.instagram,
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
                        href: siteData.socials.facebook,
                        icon: (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                          </svg>
                        ),
                      },
                    ].map((s) => {
                      const finalUrl = formatExternalUrl(s.href);
                      const hasLink = finalUrl !== "#";
                      return (
                        <a
                          key={s.name}
                          href={hasLink ? finalUrl : "#"}
                          target={hasLink ? "_blank" : undefined}
                          rel={hasLink ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            if (!hasLink) e.preventDefault();
                          }}
                          title={hasLink ? `${s.name} - Opens in new tab` : `${s.name} (Configure link in Admin)`}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
                            hasLink
                              ? "bg-card-bg border-black/10 hover:border-[#6F20E8] hover:bg-[#6F20E8] hover:text-white text-gray-700 cursor-pointer"
                              : "bg-gray-50 border-black/5 text-gray-400 hover:text-[#6F20E8] hover:border-purple-300 cursor-default"
                          }`}
                        >
                          {s.icon}
                          <span>{s.name}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="aspect-video bg-card-bg border border-black/5 rounded-sm overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(siteData.business.address)}&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors rounded-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Phone *</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors rounded-sm"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors rounded-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Company (Optional)</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors rounded-sm"
                        placeholder="Your Business"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Service of Interest</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors appearance-none rounded-sm"
                    >
                      <option value="">Select a service</option>
                      {siteData.services.map((s) => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-background border border-black/10 px-5 py-4 text-gray-900 focus:outline-none focus:border-accent transition-colors resize-none rounded-sm"
                      placeholder="Tell us about your project..."
                    />
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
