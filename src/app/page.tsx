"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSiteData } from "@/context/SiteDataContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft, PhoneCall } from "lucide-react";
import Image from "next/image";
import { formatWhatsAppUrl } from "@/lib/utils";
import ClientLogoMarquee from "@/components/home/ClientLogoMarquee";

export default function Home() {
  const siteData = useSiteData();
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const showcaseRef = useRef<HTMLDivElement>(null);

  const heroImages = siteData?.heroImages?.length ? siteData.heroImages : ["/hoardings.webp"];

  const scrollShowcase = (direction: 'left' | 'right') => {
    if (showcaseRef.current) {
      const amount = direction === 'left' ? -344 : 344;
      showcaseRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!heroImages.length) return;
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

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
                src={heroImages[currentHeroImage % heroImages.length] || "/hoardings.webp"}
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
          <div>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-foreground font-bold uppercase tracking-widest text-xs md:text-sm hover:text-accent transition-colors group"
            >
              View All Projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Infinite Slow Marquee Track */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Marquee Track */}
          <div className="animate-marquee-slow flex gap-6 min-w-max">
            {[...(siteData?.portfolio || []), ...(siteData?.portfolio || [])].filter(p => p.image).map((project, i) => {
              const projectSlug = project.slug || project.id || project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const imgSrc = project.image ? encodeURI(project.image) : "/hoardings.webp";
              return (
                <Link
                  key={`${project.id || i}-${i}`}
                  href={`/portfolio/${projectSlug}`}
                  className="group block relative w-72 sm:w-80 md:w-96 h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden shadow-md border border-black/10 shrink-0 bg-gray-900 transition-all duration-300 hover:shadow-xl"
                >
                  <Image
                    src={imgSrc}
                    alt={project.title}
                    fill
                    loading="eager"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle bottom gradient only behind text so installations remain bright and visible */}
                  <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity group-hover:opacity-95" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white mb-2 shadow-sm">
                      {project.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-1 drop-shadow-md">
                      {project.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-300 mt-2">
                      <span>{project.location}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section className="py-24 md:py-32 bg-secondary-bg relative border-t border-black/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteData.services.slice(0, 6).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <div className="bg-card-bg p-8 md:p-10 h-full border border-black/5 card-hover relative overflow-hidden shadow-xl flex flex-col">
                    <span className="absolute top-8 right-8 text-black/5 text-6xl font-bold tracking-tighter group-hover:text-black/10 transition-colors">
                      0{index + 1}
                    </span>
                    <div className="mb-8 w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-accent transition-colors shadow-lg">
                      <ChevronRight className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 pr-12">{service.title}</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed flex-grow">
                      {service.shortDescription}
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent group-hover:text-black transition-colors">
                      Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROCESS SECTION */}
      <section className="py-24 md:py-32 border-t border-black/5 overflow-hidden">
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
                <div className="hidden md:flex absolute top-0 left-0 w-14 h-14 bg-card-bg border border-black/10 rounded-full items-center justify-center shadow-lg">
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
    </>
  );
}
