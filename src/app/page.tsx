"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { siteData } from "@/data/site";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft, PhoneCall } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const showcaseRef = useRef<HTMLDivElement>(null);

  const scrollShowcase = (direction: 'left' | 'right') => {
    if (showcaseRef.current) {
      const amount = direction === 'left' ? -344 : 344;
      showcaseRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % siteData.heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                src={siteData.heroImages[currentHeroImage]}
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

        <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
              Digital Printing • Signage • Visual Branding
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 max-w-5xl text-white drop-shadow-lg"
          >
            WE PRINT IDEAS THAT <br className="hidden md:block" /> GET <span className="text-accent relative inline-block">
              NOTICED.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-12 font-light leading-relaxed drop-shadow-md"
          >
            From high-impact banners to premium signage and large-format graphics, we turn your brand into something people can see, remember and trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-accent hover:bg-red-600 text-white px-10 py-4 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
            >
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/portfolio"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center"
            >
              Explore Our Work
            </Link>
          </motion.div>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {siteData.heroImages.map((_, i) => (
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
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
                className="text-center flex flex-col gap-2"
              >
                <span className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground drop-shadow-sm">{stat.number}</span>
                <span className="text-sm text-muted uppercase tracking-wider font-semibold">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT INTRODUCTION */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-[4/3] bg-card-bg overflow-hidden rounded-sm group shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                alt="Industrial Printing Workspace"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              {/* Overlay accent line */}
              <div className="absolute top-0 left-0 w-2 h-full bg-accent z-10" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-8"
            >
              <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-accent pl-4">
                About {siteData.business.name}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight text-foreground">
                More Than Printing. <br/> We Build Visibility.
              </h2>
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                Your brand deserves more than ink on material. We create visual experiences that help businesses stand out — from everyday promotional prints to large-format signage and complete branding installations.
              </p>
              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-foreground font-bold uppercase tracking-widest hover:text-accent transition-colors group"
                >
                  Learn More <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.5 PROJECT SHOWCASE MARQUEE */}
      <section className="py-24 md:py-32 bg-white border-t border-black/5 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block md:inline-block">
              Project Showcase
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Our Recent Installations.
            </h2>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => scrollShowcase('left')} aria-label="Previous slide" className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm bg-white">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => scrollShowcase('right')} aria-label="Next slide" className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm bg-white">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Manual Scroll Slider */}
        <div ref={showcaseRef} className="flex w-full overflow-x-auto pb-8 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scroll::-webkit-scrollbar { display: none; }
          `}} />
          <div className="flex gap-6 min-w-max px-4 md:px-8 hide-scroll">
            {[...siteData.portfolio.flatMap(p => p.images), ...siteData.portfolio.flatMap(p => p.images)].map((img, i) => (
              <div key={i} className="relative w-80 md:w-[28rem] h-64 md:h-96 rounded-sm overflow-hidden flex-shrink-0 shadow-lg snap-center">
                <Image
                  src={img}
                  alt={`Showcase ${i}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
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

      {/* 6. PORTFOLIO PREVIEW */}
      <section className="py-24 md:py-32 bg-secondary-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
                Featured Work
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Work That Speaks <br/> For Itself.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-foreground font-bold uppercase tracking-widest hover:text-accent transition-colors group"
              >
                View All Projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {siteData.portfolio.slice(0, 3).map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Link href={`/portfolio/${project.slug}`} className="group block relative overflow-hidden aspect-[4/3] bg-card-bg shadow-2xl rounded-sm">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
                    <span className="text-accent text-xs font-bold uppercase tracking-widest mb-3 block">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{project.title}</h3>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm text-gray-300 font-medium">{project.location}</span>
                      <span className="flex items-center gap-2 text-sm text-white uppercase tracking-wider font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        View Project <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
             ))}
          </div>
        </div>
      </section>


      {/* 7. FINAL CTA */}
      <section className="py-24 md:py-32 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-white mb-8 drop-shadow-xl"
          >
            READY TO MAKE <br/> AN IMPRESSION?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto mb-12 font-medium drop-shadow-md"
          >
            Tell us what you&apos;re planning. We&apos;ll help turn it into something worth noticing.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-black text-white hover:bg-neutral-900 px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl"
            >
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`https://wa.me/${siteData.business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-black/10 backdrop-blur-md border-2 border-black text-black hover:bg-black hover:text-white px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Talk on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
