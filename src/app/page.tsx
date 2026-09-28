"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSiteData } from "@/context/SiteDataContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft, PhoneCall, X } from "lucide-react";
import Image from "next/image";
import { formatWhatsAppUrl } from "@/lib/utils";
import ClientLogoMarquee from "@/components/home/ClientLogoMarquee";
import HomeReviewsSection from "@/components/home/HomeReviewsSection";
import HomeFaqSection from "@/components/home/HomeFaqSection";

export default function Home() {
  const siteData = useSiteData();
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const portfolioItems = (siteData?.portfolio || []).filter((p) => Boolean(p.image));

  const validHeroImages = (siteData?.heroImages || []).filter((img) => typeof img === "string" && img.trim().length > 0);
  const heroImages = (validHeroImages.length > 0 ? validHeroImages : ["https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp"]).slice(0, 7);

  useEffect(() => {
    if (!heroImages.length) return;
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Keyboard navigation for portfolio lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + portfolioItems.length) % portfolioItems.length));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % portfolioItems.length));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, portfolioItems.length]);

  return (
    <>
      {/* 1. HERO SECTION WITH CAROUSEL */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Animated Carousel Background */}
        <div className="absolute inset-0 z-0 bg-background">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentHeroImage}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentHeroImage % heroImages.length] || "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp"}
                alt="Hero background"
                fill
                priority
                className="object-cover opacity-100"
              />
            </motion.div>
          </AnimatePresence>
          {/* Gradients to blend with content */}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 sm:pb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-white font-semibold text-xs md:text-sm tracking-[0.2em] uppercase shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse shrink-0" />
              <span>Digital Printing • Signage • Visual Branding</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 max-w-5xl text-white drop-shadow-lg"
          >
            WE PRINT IDEAS THAT <br className="hidden md:block" /> GET <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white relative inline-block drop-shadow-md">
              NOTICED.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-10 sm:mb-12 font-light leading-relaxed drop-shadow-md"
          >
            From high-impact banners to premium signage and large-format graphics, we turn your brand into something people can see, remember and trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-10 py-4 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#6F20E8]/30 min-h-[48px]"
            >
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/portfolio"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center min-h-[48px]"
            >
              Explore Our Work
            </Link>
          </motion.div>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {heroImages.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentHeroImage(i)}
              className={`w-12 h-1 rounded-full transition-all duration-300 ${i === currentHeroImage ? "bg-accent" : "bg-black/30 hover:bg-black/60"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. TRUST / STATISTICS SECTION */}
      <section className="py-12 border-y border-black/5 bg-secondary-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12">
            {[
              { number: "25+", label: "Years of Experience" },
              { number: "1000+", label: "Projects Completed" },
              { number: "500+", label: "Happy Clients" },
              { number: "24–48h", label: "Fast Turnaround*" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center flex flex-col gap-2 p-2 sm:p-0"
              >
                <span className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-foreground drop-shadow-sm">{stat.number}</span>
                <span className="text-xs sm:text-sm text-muted uppercase tracking-wider font-semibold">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
 
      {/* 2.5 CLIENT COMPANIES INFINITE DUAL MARQUEE */}
      <ClientLogoMarquee clients={siteData?.clients} />

      {/* 3. ABOUT INTRODUCTION (Removed as requested) */}

      {/* 3.5 PROJECT SHOWCASE INFINITE SLOW MARQUEE */}
      <section className="py-20 md:py-28 bg-white border-t border-black/5 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-3 block md:inline-block">
              Project Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
              Our Recent Installations.
            </h2>
            <p className="text-gray-500 text-sm mt-1">Glimpse into our live outdoor, retail, and corporate installations across Gujarat.</p>
          </div>

        </div>
        
        {/* Infinite Slow Marquee Track */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Marquee Track */}
          <div className="animate-marquee-slow flex gap-6 min-w-max">
            {[...(siteData?.portfolio || []), ...(siteData?.portfolio || [])].filter(p => p.image).map((project, i) => {
              const imgSrc = project.image ? encodeURI(project.image) : "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp";
              return (
                <button
                  key={`${project.id || i}-${i}`}
                  type="button"
                  onClick={() => {
                    const actualIdx = portfolioItems.findIndex((p) => p.id === project.id);
                    setLightboxIndex(actualIdx >= 0 ? actualIdx : 0);
                  }}
                  className="block relative w-72 sm:w-80 md:w-96 h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden border border-black/10 shrink-0 bg-gray-900 cursor-pointer group"
                >
                  <Image
                    src={imgSrc}
                    alt={project.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 320px, 384px"
                    className="object-cover pointer-events-none"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section className="py-12 md:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
                What We Create
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
                Premium Visual Solutions.
              </h2>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 font-light max-w-md"
            >
              From a single banner to complete visual branding, we bring your ideas to life with precision and impact.
            </motion.p>
          </div>

          {/* Mobile: 2-col compact grid with images | Desktop: 3-col rich cards with images */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {siteData.services.slice(0, 6).map((service, index) => {
              const serviceImg = service.image || "https://res.cloudinary.com/v61ii2hr/image/upload/v1790340347/jalaram/jalaram_digital-printing_1790340347919.webp";
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full"
                >
                  <Link href={`/services/${service.slug}`} className="group block h-full">
                    {/* MOBILE: compact card with service photo banner */}
                    <div className="md:hidden bg-card-bg border border-black/8 rounded-xl overflow-hidden flex flex-col card-hover relative h-full">
                      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                        <Image
                          src={serviceImg}
                          alt={service.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
                          0{index + 1}
                        </span>
                      </div>
                      <div className="p-3 flex flex-col flex-1 justify-between gap-1">
                        <div>
                          <h3 className="text-xs font-bold leading-tight line-clamp-1">{service.title}</h3>
                          <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mt-1">{service.shortDescription}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-accent mt-2 pt-1 border-t border-black/5">
                          Explore <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP: full card with showcase image banner */}
                    <div className="hidden md:flex bg-card-bg rounded-2xl border border-black/8 card-hover relative overflow-hidden flex-col h-full group">
                      <div className="relative w-full aspect-[16/10] bg-gray-900 overflow-hidden">
                        <Image
                          src={serviceImg}
                          alt={service.title}
                          fill
                          sizes="(max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-108 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span className="absolute top-4 right-4 text-white text-xs font-bold tracking-wider px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/25">
                          0{index + 1}
                        </span>
                        {service.category && (
                          <span className="absolute bottom-3 left-4 text-white/90 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#6F20E8]/80 backdrop-blur-sm">
                            {service.category}
                          </span>
                        )}
                      </div>

                      <div className="p-7 flex flex-col flex-1">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{service.title}</h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow line-clamp-3">
                          {service.shortDescription}
                        </p>
                        <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-accent group-hover:text-black transition-colors">
                          <span>Explore Service</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300 text-accent" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. PROCESS SECTION */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              From Idea to Installation
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              How We Work.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            <div className="hidden md:block absolute top-[28px] left-0 w-full h-[1px] bg-black/10 z-0" />
            {[
              { num: "01", title: "Discuss", desc: "Understand your exact requirements and goals." },
              { num: "02", title: "Design", desc: "Prepare or refine high-resolution artwork." },
              { num: "03", title: "Proof", desc: "Rigorous review of the final design & materials." },
              { num: "04", title: "Print", desc: "Precision production using top-tier machinery." },
              { num: "05", title: "Deliver", desc: "Flawless finishing and professional installation." },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pt-8 z-10"
              >
                <div className="hidden md:flex absolute top-0 left-0 w-14 h-14 bg-card-bg border border-black/10 rounded-full items-center justify-center">
                   <span className="text-accent font-mono text-lg font-bold">{step.num}</span>
                </div>
                <div className="md:mt-12">
                  <span className="md:hidden text-accent font-mono text-xl mb-4 block">{step.num}</span>
                  <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed pr-4">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REVIEWS & TESTIMONIALS SECTION (CLEAN STATIC GRID) */}
      <HomeReviewsSection testimonials={siteData?.testimonials} />

      {/* 6.5 FAQ SECTION */}
      <HomeFaqSection
        faqs={siteData?.faqs}
        whatsappNumber={siteData?.business?.whatsapp}
        phoneNumber={siteData?.business?.phone}
      />

      {/* 7. FINAL CTA */}
      <section className="py-20 sm:py-24 md:py-32 bg-gradient-to-br from-[#6F20E8] via-[#5B16C7] to-[#3B0764] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-white mb-6 sm:mb-8 drop-shadow-xl"
          >
            READY TO MAKE <br/> AN IMPRESSION?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 sm:mb-12 font-medium drop-shadow-md px-2"
          >
            Tell us what you&apos;re planning. We&apos;ll help turn it into something worth noticing.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-black text-white hover:bg-neutral-900 px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl min-h-[48px]"
            >
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={formatWhatsAppUrl(siteData?.business?.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white text-white px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 min-h-[48px]"
            >
              <PhoneCall className="w-4 h-4" /> Talk on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* PORTFOLIO LIGHTBOX WITH NEXT/PREV ARROWS */}
      {lightboxIndex !== null && portfolioItems[lightboxIndex] && (() => {
        const currentProject = portfolioItems[lightboxIndex];
        const currentSrc = currentProject.image ? encodeURI(currentProject.image) : "";
        const prevIndex = (lightboxIndex - 1 + portfolioItems.length) % portfolioItems.length;
        const nextIndex = (lightboxIndex + 1) % portfolioItems.length;

        return (
          <div
            className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between text-white z-30 pointer-events-none">
              <div className="flex items-center gap-3 pointer-events-auto">
                {currentProject.category && (
                  <span className="px-3 py-1 rounded-full bg-[#6F20E8] text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    {currentProject.category}
                  </span>
                )}
                <span className="text-xs sm:text-sm font-medium text-gray-300">
                  {lightboxIndex + 1} / {portfolioItems.length}
                </span>
              </div>
              <button
                type="button"
                className="pointer-events-auto text-white bg-white/10 hover:bg-white/25 rounded-full p-2.5 transition-colors cursor-pointer"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close lightbox"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Previous Arrow Button */}
            {portfolioItems.length > 1 && (
              <button
                type="button"
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-30 text-white bg-black/60 hover:bg-[#6F20E8] p-3 sm:p-4 rounded-full border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(prevIndex);
                }}
                aria-label="Previous image"
                title="Previous image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Next Arrow Button */}
            {portfolioItems.length > 1 && (
              <button
                type="button"
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-30 text-white bg-black/60 hover:bg-[#6F20E8] p-3 sm:p-4 rounded-full border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(nextIndex);
                }}
                aria-label="Next image"
                title="Next image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Image Container - Expanded for maximum visibility */}
            <div
              className="relative max-w-[94vw] max-h-[90vh] w-full flex flex-col items-center justify-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentSrc}
                alt={currentProject.title}
                className="max-w-[92vw] max-h-[82vh] sm:max-h-[85vh] w-auto h-auto object-contain rounded-2xl border border-white/15 mx-auto"
              />
              <div className="mt-3 text-center px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <h3 className="text-white text-sm sm:text-base font-bold drop-shadow-md">
                  {currentProject.title}
                </h3>
                {currentProject.location && (
                  <span className="text-gray-300 text-xs sm:text-sm font-medium">
                    • {currentProject.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
