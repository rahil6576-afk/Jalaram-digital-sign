"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PageHeroProps {
  badgeText: string;
  title: React.ReactNode;
  subtitle: string;
  images: string[];
  minHeightClass?: string;
  children?: React.ReactNode;
}

export default function PageHero({
  badgeText,
  title,
  subtitle,
  images,
  minHeightClass = "min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh]",
  children,
}: PageHeroProps) {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  const heroImages = (images && images.length > 0 ? images : ["https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp"]).slice(0, 7);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className={`relative ${minHeightClass} flex items-center justify-center overflow-hidden border-b border-black/10`}>
      {/* Background with Animated Carousel */}
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
              src={heroImages[currentHeroImage % heroImages.length]}
              alt="Hero background"
              fill
              priority
              className="object-cover opacity-100"
            />
          </motion.div>
        </AnimatePresence>
        {/* Balanced overlay matching home page so background images are clearly visible while text stays sharp */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* Content centered exactly like Home Page */}
      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-white font-semibold text-xs md:text-sm tracking-[0.2em] uppercase shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse shrink-0" />
            <span>{badgeText}</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter leading-[1.1] mb-6 sm:mb-8 max-w-5xl text-white drop-shadow-lg"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-6 font-light leading-relaxed drop-shadow-md"
        >
          {subtitle}
        </motion.p>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {children}
          </motion.div>
        )}
      </div>

      {/* Carousel Indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center gap-2 sm:gap-3">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentHeroImage(i)}
              className={`w-10 sm:w-12 h-1 rounded-full transition-all duration-300 ${
                i === currentHeroImage ? "bg-accent" : "bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
