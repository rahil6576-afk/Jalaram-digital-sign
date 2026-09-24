"use client";

import { useState } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import PageHero from "@/components/common/PageHero";

export default function PortfolioPage() {
  const siteData = useSiteData();
  const [filter, setFilter] = useState("All");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("");

  const portfolioList = siteData?.portfolio || [];
  const categories = ["All", ...Array.from(new Set(portfolioList.map((p) => p.category)))];

  const filteredProjects = filter === "All"
    ? portfolioList
    : portfolioList.filter(p => p.category === filter);

  return (
    <>
      {/* PAGE HERO */}
      <PageHero
        badgeText="Featured Projects • Recent Installations"
        title={
          <>
            OUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">
              WORK.
            </span>
          </>
        }
        subtitle="Explore our recent projects, from large-scale signage installations to precision print jobs."
        images={[
          "/hoardings.webp",
          "/3d-led-board.webp",
          "/glow-signs.webp",
          "/acrylic-board.webp",
        ]}
      />

      {/* PORTFOLIO GRID */}
      <section className="py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-12 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap shrink-0 min-h-[40px] ${
                  filter === cat
                    ? "bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white shadow-lg shadow-[#6F20E8]/30"
                    : "bg-card-bg border border-black/10 text-foreground hover:border-black/30 hover:bg-black/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid — images open lightbox only, no navigation */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div
                    className="block relative overflow-hidden aspect-[4/3] bg-card-bg shadow-2xl rounded-sm cursor-pointer"
                    onClick={() => {
                      setLightboxSrc(project.image);
                      setLightboxAlt(project.title);
                    }}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <span className="inline-block px-2.5 py-0.5 bg-[#6F20E8] text-white text-xs font-bold uppercase tracking-widest mb-3 rounded-full shadow-lg">
                        {project.category}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{project.title}</h3>
                      <div className="mt-4">
                        <span className="text-sm text-gray-300 font-medium">{project.location}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 sm:py-24 md:py-32 bg-gradient-to-br from-[#6F20E8] via-[#5B16C7] to-[#3B0764] relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <span className="text-purple-200 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
            Start Your Next Project
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-white drop-shadow-xl leading-[1.1]">
            Have a Project in Mind? <br /> Let&apos;s Build It.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-100 font-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            From massive highway hoardings to delicate illuminated acrylic letters, we craft high-impact visual branding for businesses across Gujarat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all text-sm uppercase tracking-widest shadow-2xl min-h-[48px] w-full sm:w-auto"
            >
              Request a Free Quote <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${siteData?.business.whatsapp || "919427033363"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all text-sm uppercase tracking-widest backdrop-blur-md min-h-[48px] w-full sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>
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
            aria-label="Close lightbox"
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
