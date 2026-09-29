"use client";

import { useState, useEffect } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import PageHero from "@/components/common/PageHero";

export default function PortfolioPage() {
  const siteData = useSiteData();
  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>(0);
  const [cardPhotoIndices, setCardPhotoIndices] = useState<Record<string, number>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [marqueeOffset, setMarqueeOffset] = useState<number>(0);

  const handlePrevPortfolio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMarqueeOffset((prev) => prev + 360);
  };
  const handleNextPortfolio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMarqueeOffset((prev) => prev - 360);
  };

  const portfolioList = siteData?.portfolio || [];
  const categories = ["All", ...Array.from(new Set(portfolioList.map((p) => p.category)))];

  const filteredProjects = filter === "All"
    ? portfolioList
    : portfolioList.filter(p => p.category === filter);

  // Helper to get all photos of a site/project
  const getSitePhotos = (project: (typeof portfolioList)[number]): string[] => {
    const list = [
      ...(project.image ? [project.image] : []),
      ...(Array.isArray(project.images) ? project.images : []),
    ];
    return Array.from(new Set(list.filter(Boolean)));
  };

  const currentProject = lightboxIndex !== null ? filteredProjects[lightboxIndex] : null;
  const currentSitePhotos = currentProject ? getSitePhotos(currentProject) : [];

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        if (currentSitePhotos.length > 1) {
          setLightboxPhotoIndex((prev) => (prev - 1 + currentSitePhotos.length) % currentSitePhotos.length);
        } else {
          setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredProjects.length) % filteredProjects.length));
          setLightboxPhotoIndex(0);
        }
      }
      if (e.key === "ArrowRight") {
        if (currentSitePhotos.length > 1) {
          setLightboxPhotoIndex((prev) => (prev + 1) % currentSitePhotos.length);
        } else {
          setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredProjects.length));
          setLightboxPhotoIndex(0);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, currentSitePhotos.length, filteredProjects.length]);

  // Auto-scroll / auto-advance through multiple photos on cards (especially the first image/card)
  useEffect(() => {
    const multiPhotoProjects = filteredProjects.filter((p) => getSitePhotos(p).length > 1);
    if (multiPhotoProjects.length === 0) return;

    const interval = setInterval(() => {
      setCardPhotoIndices((prev) => {
        const next = { ...prev };
        multiPhotoProjects.forEach((p) => {
          const photos = getSitePhotos(p);
          const currentIdx = next[p.id] || 0;
          next[p.id] = (currentIdx + 1) % photos.length;
        });
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [filteredProjects]);

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
      />

      {/* AUTO-SCROLLING PROJECT SHOWCASE REEL */}
      <section className="py-10 sm:py-14 bg-white border-b border-black/5 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#6F20E8] font-bold text-xs uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#6F20E8] animate-ping" />
              Live Project Reel • Auto Scroll
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Recent Installations on Display
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Continuous auto-scrolling gallery. Hover to pause, click arrows to go back &amp; forth, or click any project to view.
            </p>
          </div>
          
          {/* Header Back & Forth Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPortfolio}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6F20E8] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Previous projects"
              aria-label="Previous projects"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextPortfolio}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6F20E8] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Next projects"
              aria-label="Next projects"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Infinite Slow Auto Scroll Marquee Track with Back & Forth Navigation Arrows */}
        <div className="relative w-full overflow-hidden py-2 group/track">
          {/* Back & Forth Navigation Arrow Buttons */}
          <button
            type="button"
            onClick={handlePrevPortfolio}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/80 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer border border-white/20 backdrop-blur-md"
            title="Scroll portfolio back"
            aria-label="Previous portfolio installation"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNextPortfolio}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/80 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer border border-white/20 backdrop-blur-md"
            title="Scroll portfolio forward"
            aria-label="Next portfolio installation"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Marquee Track Container with Smooth Manual Shift */}
          <div
            className="transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(${marqueeOffset}px)` }}
          >
            <div className="animate-marquee-slow flex gap-6 min-w-max">
              {[...portfolioList, ...portfolioList].filter(p => Boolean(p.image)).map((project, i) => {
                const imgSrc = project.image ? encodeURI(project.image) : "";
                const actualIdx = filteredProjects.findIndex((p) => p.id === project.id);
                return (
                  <button
                    key={`marquee-${project.id || i}-${i}`}
                    type="button"
                    onClick={() => {
                      if (actualIdx >= 0) {
                        setLightboxIndex(actualIdx);
                      } else {
                        setFilter("All");
                        const allIdx = portfolioList.findIndex((p) => p.id === project.id);
                        setLightboxIndex(allIdx >= 0 ? allIdx : 0);
                      }
                      setLightboxPhotoIndex(0);
                    }}
                    className="block relative w-64 sm:w-72 md:w-80 h-48 sm:h-56 md:h-60 rounded-2xl overflow-hidden border border-black/10 shrink-0 bg-gray-900 cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <Image
                      src={imgSrc}
                      alt={project.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 256px, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                    <div className="absolute bottom-3.5 left-4 right-4 text-left">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#6F20E8] text-white text-[10px] font-bold uppercase tracking-wider mb-1 shadow-sm">
                        {project.category}
                      </span>
                      <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-1 drop-shadow-sm">
                        {project.title}
                      </h3>
                      {project.location && (
                        <p className="text-gray-300 text-[11px] line-clamp-1 mt-0.5">{project.location}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

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

          {/* Grid — images with multiple photo sliding controls */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredProjects.map((project, idx) => {
                const photos = getSitePhotos(project);
                const activePhotoIdx = (cardPhotoIndices[project.id] ?? 0) % Math.max(photos.length, 1);
                const currentImg = photos[activePhotoIdx] || project.image || "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp";

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div
                      className="group block relative overflow-hidden aspect-[4/3] bg-card-bg rounded-2xl border border-black/8 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                      onClick={() => {
                        setLightboxIndex(idx);
                        setLightboxPhotoIndex(activePhotoIdx);
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={currentImg}
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0.7 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={encodeURI(currentImg)}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-85 pointer-events-none" />

                      {/* Top Badges: Category & Photo Slide Counter */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                        <span className="inline-block px-3 py-1 bg-[#6F20E8] text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                          {project.category}
                        </span>
                        {photos.length > 1 && (
                          <span className="px-2.5 py-1 bg-black/65 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold rounded-full shadow-sm">
                            📸 {activePhotoIdx + 1}/{photos.length}
                          </span>
                        )}
                      </div>

                      {/* Slide Arrows on Card (if multiple site photos) */}
                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardPhotoIndices((prev) => ({
                                ...prev,
                                [project.id]: (activePhotoIdx - 1 + photos.length) % photos.length,
                              }));
                            }}
                            aria-label="Previous site photo"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardPhotoIndices((prev) => ({
                                ...prev,
                                [project.id]: (activePhotoIdx + 1) % photos.length,
                              }));
                            }}
                            aria-label="Next site photo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Card Content & Slide Dots */}
                      <div className="absolute bottom-0 left-0 p-5 sm:p-6 lg:p-7 w-full z-10">
                        {photos.length > 1 && (
                          <div className="flex items-center gap-1.5 mb-2 sm:mb-2.5">
                            {photos.map((_, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardPhotoIndices((prev) => ({ ...prev, [project.id]: pIdx }));
                                }}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  pIdx === activePhotoIdx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                                }`}
                                aria-label={`Slide to photo ${pIdx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                        <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-white mb-1 drop-shadow-md leading-snug">
                          {project.title}
                        </h3>
                        {project.location && (
                          <span className="text-xs sm:text-sm text-gray-300 font-medium drop-shadow-sm">
                            {project.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
              href={`https://wa.me/${siteData?.business.whatsapp || "918511133363"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all text-sm uppercase tracking-widest backdrop-blur-md min-h-[48px] w-full sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* PORTFOLIO LIGHTBOX: SLIDE THROUGH MULTIPLE PHOTOS OF A SITE */}
      {lightboxIndex !== null && filteredProjects[lightboxIndex] && (() => {
        const project = filteredProjects[lightboxIndex];
        const sitePhotos = getSitePhotos(project);
        const safePhotoIdx = sitePhotos.length > 0 ? lightboxPhotoIndex % sitePhotos.length : 0;
        const currentPhotoSrc = sitePhotos[safePhotoIdx] ? encodeURI(sitePhotos[safePhotoIdx]) : "";
        const prevPhotoIdx = (safePhotoIdx - 1 + sitePhotos.length) % sitePhotos.length;
        const nextPhotoIdx = (safePhotoIdx + 1) % sitePhotos.length;

        const prevProjectIdx = (lightboxIndex - 1 + filteredProjects.length) % filteredProjects.length;
        const nextProjectIdx = (lightboxIndex + 1) % filteredProjects.length;

        const handleTouchStart = (e: React.TouchEvent) => {
          setTouchStartX(e.touches[0].clientX);
        };

        const handleTouchEnd = (e: React.TouchEvent) => {
          if (touchStartX === null) return;
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              // Swipe Left -> Next photo
              setLightboxPhotoIndex(nextPhotoIdx);
            } else {
              // Swipe Right -> Prev photo
              setLightboxPhotoIndex(prevPhotoIdx);
            }
          }
          setTouchStartX(null);
        };

        return (
          <div
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6"
            onClick={() => setLightboxIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Toolbar */}
            <div className="w-full max-w-6xl flex items-center justify-between text-white z-30 pointer-events-none mb-2">
              <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                {project.category && (
                  <span className="px-3 py-1 rounded-full bg-[#6F20E8] text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    {project.category}
                  </span>
                )}
                {sitePhotos.length > 1 && (
                  <span className="text-xs sm:text-sm font-semibold text-purple-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    Photo {safePhotoIdx + 1} of {sitePhotos.length}
                  </span>
                )}
                {filteredProjects.length > 1 && (
                  <span className="text-xs text-gray-400 hidden md:inline-block">
                    • Site {lightboxIndex + 1} of {filteredProjects.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                {filteredProjects.length > 1 && (
                  <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 border border-white/15">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(prevProjectIdx);
                        setLightboxPhotoIndex(0);
                      }}
                      className="text-xs text-gray-300 hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10 font-medium transition-colors"
                      title="Previous site"
                    >
                      ‹ Prev Site
                    </button>
                    <span className="text-gray-500">|</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(nextProjectIdx);
                        setLightboxPhotoIndex(0);
                      }}
                      className="text-xs text-gray-300 hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10 font-medium transition-colors"
                      title="Next site"
                    >
                      Next Site ›
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="text-white bg-white/10 hover:bg-white/25 rounded-full p-2.5 transition-colors cursor-pointer"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close lightbox"
                  title="Close (Esc)"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Stage: Sliding photo display */}
            <div
              className="relative w-full max-w-6xl flex-1 flex items-center justify-center min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Slide Arrow */}
              {sitePhotos.length > 1 && (
                <button
                  type="button"
                  className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 text-white bg-black/70 hover:bg-[#6F20E8] p-3 sm:p-4 rounded-full border border-white/25 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxPhotoIndex(prevPhotoIdx);
                  }}
                  aria-label="Previous slide"
                  title="Slide to Previous Photo (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Next Slide Arrow */}
              {sitePhotos.length > 1 && (
                <button
                  type="button"
                  className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 text-white bg-black/70 hover:bg-[#6F20E8] p-3 sm:p-4 rounded-full border border-white/25 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxPhotoIndex(nextPhotoIdx);
                  }}
                  aria-label="Next slide"
                  title="Slide to Next Photo (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Center Image Container */}
              <div className="relative max-h-[72vh] sm:max-h-[75vh] max-w-full flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={currentPhotoSrc}
                  src={currentPhotoSrc}
                  alt={`${project.title} - photo ${safePhotoIdx + 1}`}
                  className="max-h-[70vh] sm:max-h-[74vh] max-w-[88vw] object-contain rounded-2xl border border-white/15 shadow-2xl transition-all duration-300 select-none animate-fadeIn"
                />
              </div>
            </div>

            {/* Bottom Section: Site Title & Sliding Thumbnail Strip */}
            <div
              className="w-full max-w-6xl mt-2 flex flex-col items-center gap-2 pointer-events-auto z-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Site Title Pill */}
              <div className="text-center px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <h3 className="text-white text-sm sm:text-base font-bold drop-shadow-md">
                  {project.title}
                </h3>
                {project.location && (
                  <span className="text-gray-300 text-xs sm:text-sm font-medium">
                    • {project.location}
                  </span>
                )}
              </div>

              {/* Thumbnail Strip: Slide through photos of the site */}
              {sitePhotos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1.5 px-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 no-scrollbar">
                  {sitePhotos.map((thumbUrl, pIndex) => (
                    <button
                      key={pIndex}
                      type="button"
                      onClick={() => setLightboxPhotoIndex(pIndex)}
                      className={`relative w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        pIndex === safePhotoIdx
                          ? "border-[#6F20E8] scale-105 shadow-md shadow-[#6F20E8]/50 ring-2 ring-purple-400"
                          : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/60"
                      }`}
                      title={`Slide to photo ${pIndex + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={encodeURI(thumbUrl)}
                        alt={`Thumbnail ${pIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] text-white font-bold px-1 rounded-tl">
                        {pIndex + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}
