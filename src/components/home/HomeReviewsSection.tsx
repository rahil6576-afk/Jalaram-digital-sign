"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import type { TestimonialItem } from "@/data/site";

interface HomeReviewsSectionProps {
  testimonials?: TestimonialItem[];
}

export default function HomeReviewsSection({ testimonials = [] }: HomeReviewsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-purple-50/25 to-white border-t border-black/5 relative overflow-hidden">
      {/* Decorative ambient blurs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#6F20E8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
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

        {/* Static Non-Sliding Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {testimonials.map((review, idx) => (
            <motion.div
              key={review.id || idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-black/8 hover:border-[#6F20E8]/40 p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
            >
              {/* Subtle background decorative quote */}
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
                <blockquote className="text-gray-800 text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-8 tracking-tight relative z-10">
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
