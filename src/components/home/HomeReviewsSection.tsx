"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, CheckCircle2, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { TestimonialItem } from "@/data/site";

interface HomeReviewsSectionProps {
  testimonials?: TestimonialItem[];
}

export default function HomeReviewsSection({ testimonials = [] }: HomeReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Auto-move carousel every 5 seconds when not paused
  useEffect(() => {
    if (isPaused || totalReviews <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, totalReviews]);

  if (!testimonials || totalReviews === 0) return null;

  // Primary review and optional secondary review for wide screens
  const primaryReview = testimonials[currentIndex];
  const secondaryIndex = (currentIndex + 1) % totalReviews;
  const secondaryReview = totalReviews > 1 ? testimonials[secondaryIndex] : null;

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
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  const renderReviewCard = (review: TestimonialItem, isSecondary = false) => (
    <div
      key={review.id || review.name}
      className={`bg-white rounded-3xl border border-black/8 hover:border-[#6F20E8]/40 p-7 sm:p-9 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group h-full ${
        isSecondary ? "hidden md:flex" : "flex"
      }`}
    >
      {/* Decorative background quote */}
      <Quote className="absolute top-6 right-8 w-20 h-20 text-[#6F20E8]/8 group-hover:text-[#6F20E8]/15 transition-colors pointer-events-none select-none" />

      <div>
        {/* Rating Stars & Verified Badge */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  i < (review.rating || 5)
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] sm:text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Project</span>
          </div>
        </div>

        {/* Review Quote */}
        <blockquote className="text-gray-800 text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-8 tracking-tight relative z-10 min-h-[72px]">
          &ldquo;{review.quote}&rdquo;
        </blockquote>
      </div>

      {/* Author Information */}
      <div className="flex items-center gap-4 pt-6 border-t border-black/5 mt-auto relative z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6F20E8] to-[#A855F7] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-md shadow-[#6F20E8]/20">
          {review.name
            ? review.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "CL"}
        </div>
        <div className="truncate">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug truncate">
            {review.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
            {review.business || "Business Owner"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-20 sm:py-28 bg-gradient-to-b from-white via-purple-50/25 to-white border-t border-black/5 relative overflow-hidden"
    >
      {/* Decorative ambient blurs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#6F20E8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-[#6F20E8] font-bold text-xs tracking-wider uppercase mb-4 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[#6F20E8]" />
              <span>Rated 4.9/5 by 500+ Businesses</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[1.1] mb-5">
              WHAT OUR <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F20E8] via-[#8A3FFC] to-[#A855F7]">
                CLIENTS SAY.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto font-light leading-relaxed">
              Real experiences from commercial developers, retail brands, and institutions who trust us with their visual presence.
            </p>
          </motion.div>
        </div>

        {/* Moving Reviews Carousel Container */}
        <div className="max-w-6xl mx-auto relative px-2 sm:px-4">
          <div className="overflow-hidden min-h-[380px] sm:min-h-[340px] flex items-stretch">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch"
              >
                {primaryReview && renderReviewCard(primaryReview, false)}
                {secondaryReview && renderReviewCard(secondaryReview, true)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Navigation Bar (Left/Right Arrows + Indicators + Pause toggle) */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5">
            {/* Slide Position Counter */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 order-2 sm:order-1">
              <span>Review {currentIndex + 1} of {totalReviews}</span>
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-1"
                title={isPaused ? "Resume autoplay" : "Pause autoplay"}
                aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              {testimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => {
                    setDirection(dotIdx > currentIndex ? 1 : -1);
                    setCurrentIndex(dotIdx);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    dotIdx === currentIndex
                      ? "w-8 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] shadow-sm shadow-[#6F20E8]/40"
                      : "w-2.5 bg-gray-200 hover:bg-gray-300"
                  }`}
                  aria-label={`Go to review ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Action Arrows */}
            <div className="flex items-center gap-2 order-3">
              <button
                type="button"
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#6F20E8] bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6F20E8] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Previous review"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#6F20E8] bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6F20E8] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Next review"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
