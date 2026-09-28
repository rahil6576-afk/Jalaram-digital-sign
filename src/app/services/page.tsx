"use client";

import { useSiteData } from "@/context/SiteDataContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import PageHero from "@/components/common/PageHero";

export default function ServicesPage() {
  const currentData = useSiteData();

  return (
    <>
      {/* PAGE HERO */}
      <PageHero
        badgeText="Capabilities • Materials • Solutions"
        title={
          <>
            WHAT WE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">
              CREATE.
            </span>
          </>
        }
        subtitle="Comprehensive visual branding and printing solutions designed to get your business noticed."
        images={[
          "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398035/jalaram/jalaram_digital-printing_1790398036942.webp",
          "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398057/jalaram/jalaram_vinyl-printing_1790398058572.webp",
          "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398036/jalaram/jalaram_flex-banner_1790398038042.webp",
          "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398054/jalaram/jalaram_uv-flatbed-printer-close-1080x600_1790398056052.webp",
        ]}
      />

      {/* SERVICES GRID */}
      <section className="py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentData.services.map((service, index) => (
              <div key={service.id} className="bg-card-bg h-full border border-black/5 rounded-sm overflow-hidden flex flex-col transition-all duration-300">
                {/* Service Image — Non-clickable */}
                <div className="aspect-video relative overflow-hidden cursor-default select-none">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white/90 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter drop-shadow-md">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-md pr-8 sm:pr-12">{service.title}</h3>
                </div>

                {/* Card body — Informational text content, non-clickable */}
                <div className="p-6 sm:p-7 md:p-8 lg:p-10 flex flex-col flex-grow">
                  <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed flex-grow text-base sm:text-lg">
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
    </>
  );
}
