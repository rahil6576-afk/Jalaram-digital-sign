"use client";

import { useEffect, useState } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import PageHero from "@/components/common/PageHero";

export default function ServicesPage() {
  const currentData = useSiteData();
  const [services, setServices] = useState(currentData.services);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Load directly from Supabase Services API (database-driven sorting)
  useEffect(() => {
    const fetchServices = () => {
      fetch(`/api/services?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.services) && data.services.length > 0) {
            setServices(data.services);
          }
        })
        .catch((err) => console.warn("Could not fetch from /api/services:", err));
    };

    fetchServices();

    // Re-fetch live from database on site content updates
    window.addEventListener("site-content-updated", fetchServices);
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("jalaram_site_sync");
        bc.onmessage = () => fetchServices();
      }
    } catch {
      // safe fallback
    }

    return () => {
      window.removeEventListener("site-content-updated", fetchServices);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    const handleScrollToHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const id = window.location.hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          setHighlightedId(id);
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => setHighlightedId(null), 3500);
        }
      }
    };

    handleScrollToHash();
    window.addEventListener("hashchange", handleScrollToHash);
    return () => window.removeEventListener("hashchange", handleScrollToHash);
  }, []);

  return (
    <>
      {/* PAGE HERO */}
      <PageHero
        title={
          <>
            WHAT WE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">
              CREATE.
            </span>
          </>
        }
        subtitle="Comprehensive visual branding and printing solutions designed to get your business noticed."
      />

      {/* SERVICES GRID */}
      <section className="py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => {
              const targetId = service.slug || service.id;
              const isHighlighted = highlightedId === targetId;
              return (
                <div
                  key={service.id}
                  id={targetId}
                  className={`scroll-mt-28 bg-card-bg h-full border rounded-2xl overflow-hidden flex flex-col transition-all duration-500 shadow-sm hover:shadow-lg ${
                    isHighlighted ? "border-[#6F20E8] ring-4 ring-[#6F20E8]/30 shadow-xl scale-[1.01]" : "border-black/5"
                  }`}
                >
                  {/* Service Image — Non-clickable */}
                  <div className="aspect-video relative overflow-hidden cursor-default select-none bg-gray-900">
                    <Image
                      src={service.image ? encodeURI(service.image) : "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398035/jalaram/jalaram_digital-printing_1790398036942.webp"}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#6F20E8] text-white text-[11px] font-bold uppercase tracking-wider mb-2 shadow-sm">
                        {service.category || "Service"}
                      </span>
                      <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-md">{service.title}</h3>
                    </div>
                  </div>

                  {/* Card body — Informational text content, non-clickable */}
                  <div className="p-6 sm:p-7 md:p-8 lg:p-10 flex flex-col flex-grow">
                    <p className="text-gray-700 mb-4 leading-relaxed text-base sm:text-lg font-medium">
                      {service.shortDescription || service.description}
                    </p>

                    {/* Detailed Description if distinct from shortDescription */}
                    {service.description && service.shortDescription && service.description.trim() !== service.shortDescription.trim() && (
                      <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                        {service.description}
                      </p>
                    )}

                    {/* Features List */}
                    {Array.isArray(service.features) && service.features.filter(Boolean).length > 0 && (
                      <ul className="space-y-3 mt-auto pt-4 border-t border-black/5">
                        {service.features.filter(Boolean).map((feature, i) => (
                          <li key={i} className="text-sm text-gray-600 font-medium flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-8 drop-shadow-xl">
            Need something custom?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 font-medium drop-shadow-md">
            We handle custom requests and specialized printing projects of all sizes.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest shadow-2xl"
          >
            Discuss Your Project <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
