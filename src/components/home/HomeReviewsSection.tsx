"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import type { TestimonialItem } from "@/data/site";

interface HomeReviewsSectionProps {
  testimonials?: TestimonialItem[];
}

export default function HomeReviewsSection({ testimonials = [] }: HomeReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Maximum 7 reviews move one by one in the top carousel
  const carouselReviews = (testimonials || []).slice(0, 7);
  // Up to 10 reviews displayed in the bottom preview grid
  const gridReviews = (testimonials || []).slice(0, 10);

  // Automatic slide movement every 4 seconds
  useEffect(() => {
    if (carouselReviews.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselReviews.length, isPaused]);

  if (!testimonials || testimonials.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselReviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselReviews.length) % carouselReviews.length);
  };

  const current = carouselReviews[currentIndex] || carouselReviews[0];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-purple-50/30 to-white border-t border-black/5 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#6F20E8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-[#6F20E8] font-bold text-xs tracking-wider uppercase mb-4 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[#6F20E8]" />
              <span>Rated 4.9/5 by 500+ Businesses</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[1.1]">
              WHAT OUR <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F20E8] via-[#8A3FFC] to-[#A855F7]">
                CLIENTS SAY.
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous review"
              className="w-12 h-12 rounded-full border border-black/10 bg-white hover:bg-[#6F20E8] hover:text-white hover:border-[#6F20E8] text-gray-700 flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next review"
              className="w-12 h-12 rounded-full border border-black/10 bg-white hover:bg-[#6F20E8] hover:text-white hover:border-[#6F20E8] text-gray-700 flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Featured Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="bg-white rounded-3xl border border-black/10 p-8 sm:p-12 md:p-16 shadow-xl relative overflow-hidden"
            >
              <Quote className="absolute top-6 right-8 sm:top-10 sm:right-12 w-20 h-20 text-[#6F20E8]/10 pointer-events-none select-none" />

              {/* Stars */}
              <div className="flex items-center gap-1.5 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < (current.rating || 5)
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Verified Review
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-xl sm:text-2xl md:text-3xl text-gray-800 font-medium leading-relaxed mb-8 sm:mb-10 tracking-tight">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-black/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6F20E8] to-[#A855F7] text-white font-bold text-lg flex items-center justify-center shadow-md shadow-[#6F20E8]/20">
                    {current.name
                      ? current.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "CL"}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-snug">
                      {current.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {current.business || "Business Owner"}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Project Completed</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Indicators (max 7) */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {carouselReviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? "w-8 h-2.5 bg-[#6F20E8]"
                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Grid Preview of reviews (up to 10) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 sm:mt-16">
          {gridReviews.map((t, idx) => (
            <div
              key={t.id || idx}
              onClick={() => {
                if (idx < carouselReviews.length) {
                  setCurrentIndex(idx);
                }
              }}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                idx === currentIndex
                  ? "bg-purple-50/70 border-[#6F20E8]/40 shadow-md ring-1 ring-[#6F20E8]/20"
                  : "bg-white/80 border-black/5 hover:border-black/15 shadow-sm hover:shadow"
              }`}
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < (t.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 line-clamp-3 leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6F20E8] font-bold text-xs flex items-center justify-center">
                  {t.name.charAt(0)}
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{t.name}</h4>
                  <p className="text-[11px] text-gray-400 truncate">{t.business || "Client"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
