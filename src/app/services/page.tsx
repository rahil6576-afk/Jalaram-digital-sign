"use client";

import { useState } from "react";
import { siteData, getSiteData } from "@/data/site";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";

export default function ServicesPage() {
  const currentData = getSiteData();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("");

  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 bg-black border-b border-black/10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/digital-printing.webp"
            alt="Services background"
            fill
            priority
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-white font-semibold text-xs md:text-sm tracking-[0.2em] uppercase mb-6 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse shrink-0" />
              <span>Capabilities • Materials • Solutions</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-white drop-shadow-lg leading-[1.1]">
              WHAT WE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">CREATE.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
              Comprehensive visual branding and printing solutions designed to get your business noticed.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentData.services.map((service, index) => (
              <div key={service.id} className="bg-card-bg h-full border border-black/5 rounded-sm overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:border-accent/50 transition-all duration-300">
                {/* Clickable Image → opens lightbox ONLY */}
                <div
                  className="aspect-video relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    setLightboxSrc(service.image);
                    setLightboxAlt(service.title);
                  }}
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute top-6 right-6 text-white/90 text-4xl font-bold tracking-tighter drop-shadow-md">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="absolute bottom-6 left-6 text-3xl font-bold text-white drop-shadow-md pr-12">{service.title}</h3>
                </div>

                {/* Card body — NOT clickable as a whole, just text content */}
                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  <p className="text-gray-600 mb-8 leading-relaxed flex-grow text-lg">
                    {service.shortDescription}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="text-sm text-gray-600 font-medium flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
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

      {/* LIGHTBOX */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setLightboxSrc(null)}
            aria-label="Close"
          >
            <X className="w-7 h-7" />
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxSrc}
              alt={lightboxAlt}
              className="w-full h-full object-contain rounded-lg shadow-2xl max-h-[90vh]"
            />
          </div>
        </div>
      )}
    </>
  );
}
