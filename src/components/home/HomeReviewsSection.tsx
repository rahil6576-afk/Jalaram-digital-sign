"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import type { TestimonialItem } from "@/data/site";

interface HomeReviewsSectionProps {
  testimonials?: TestimonialItem[];
}

export default function HomeReviewsSection({ testimonials = [] }: HomeReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const totalReviews = testimonials.length;

  const nextSlide = useCallback(() => {
    if (totalReviews <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  }, [totalReviews]);

  const prevSlide = useCallback(() => {
    if (totalReviews <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  }, [totalReviews]);

  // Continuously changes reviews one by one in an infinite loop
  useEffect(() => {
    if (totalReviews <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % totalReviews);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalReviews]);

  if (!testimonials || totalReviews === 0) return null;

  const currentReview = testimonials[currentIndex];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    }),
  };

  const initials = currentReview.name
    ? currentReview.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CL";

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-purple-50/25 to-white border-t border-black/5 relative overflow-hidden">
      {/* Decorative ambient blurs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#6F20E8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Next/Prev Arrow Controls at the top right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-4xl mx-auto mb-10 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-[#6F20E8] font-bold text-xs tracking-wider uppercase mb-4">
              <Star className="w-3.5 h-3.5 fill-[#6F20E8]" />
              <span>Rated 4.9/5 by 500+ Businesses</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1] mb-3">
              WHAT OUR{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F20E8] via-[#8A3FFC] to-[#A855F7]">
                CLIENTS SAY.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-lg">
              Real experiences from commercial developers, retail brands, and institutions across Gujarat.
            </p>
          </div>

          {/* Clean Left / Right Arrow buttons beside header for manual cycling */}
          {totalReviews > 1 && (
            <div className="flex items-center gap-2.5 self-start md:self-end shrink-0">
              <button
                type="button"
                onClick={prevSlide}
                className="w-11 h-11 rounded-full border border-gray-200 hover:border-[#6F20E8] bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6F20E8] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Previous review"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-11 h-11 rounded-full border border-gray-200 hover:border-[#6F20E8] bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6F20E8] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Next review"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Single Review Card changing one by one infinitely */}
        <div className="max-w-4xl mx-auto relative">
          <div className="overflow-hidden min-h-[300px] sm:min-h-[260px] flex items-stretch">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full bg-white rounded-3xl border border-black/8 hover:border-[#6F20E8]/40 p-8 sm:p-12 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Decorative background quote */}
                <Quote className="absolute top-6 right-8 w-24 h-24 text-[#6F20E8]/8 group-hover:text-[#6F20E8]/15 transition-colors pointer-events-none select-none" />

                <div>
                  {/* Rating Stars & Verified Badge */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < (currentReview.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Client Review</span>
                    </div>
                  </div>

                  {/* Review Quote */}
                  <blockquote className="text-gray-900 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-8 tracking-tight relative z-10">
                    &ldquo;{currentReview.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Author Information */}
                <div className="flex items-center gap-4 pt-6 border-t border-black/5 mt-auto relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#6F20E8] to-[#A855F7] text-white font-bold text-base sm:text-lg flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 leading-snug">
                      {currentReview.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {currentReview.business || "Business Owner"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
