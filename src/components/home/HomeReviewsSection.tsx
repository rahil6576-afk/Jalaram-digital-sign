"use client";

import React, { useMemo } from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import type { TestimonialItem } from "@/data/site";

interface HomeReviewsSectionProps {
  testimonials?: TestimonialItem[];
}

export default function HomeReviewsSection({ testimonials = [] }: HomeReviewsSectionProps) {
  // Ensure we have a duplicated array so translation of -50% loops seamlessly forever
  const fullTrack = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return [];
    // Repeat enough times so halfTrack contains at least 8-12 cards
    const multiplier = Math.max(2, Math.ceil(8 / testimonials.length));
    const half = Array.from({ length: multiplier }).flatMap(() => testimonials);
    return [...half, ...half];
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-purple-50/25 to-white border-t border-black/5 relative overflow-hidden">
      {/* Decorative ambient blurs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#6F20E8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10 sm:mb-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-[#6F20E8] font-bold text-xs tracking-wider uppercase mb-4 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#6F20E8]" />
            <span>Rated 4.9/5 by 500+ Businesses</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1] mb-3">
            WHAT OUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F20E8] via-[#8A3FFC] to-[#A855F7]">
              CLIENTS SAY.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-lg mx-auto">
            Real experiences from commercial developers, retail brands, and institutions across Gujarat.
          </p>
        </div>
      </div>

      {/* Continuous Infinite Marquee Track with subtle edge gradient fades */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left and Right edge fade gradient overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Marquee Track moving continuously and infinitely */}
        <div className="animate-marquee-reviews flex gap-5 sm:gap-7 min-w-max px-4">
          {fullTrack.map((review, idx) => {
            const initials = review.name
              ? review.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "CL";

            return (
              <div
                key={`${review.id || idx}-${idx}`}
                className="w-[320px] sm:w-[380px] md:w-[440px] shrink-0 bg-white rounded-3xl border border-black/8 hover:border-[#6F20E8]/40 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-default select-none"
              >
                {/* Decorative background quote mark */}
                <Quote className="absolute top-5 right-6 w-20 h-20 text-[#6F20E8]/6 group-hover:text-[#6F20E8]/12 transition-colors pointer-events-none" />

                <div>
                  {/* Rating Stars & Verified Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 5)
                              ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Client</span>
                    </div>
                  </div>

                  {/* Review Quote */}
                  <blockquote className="text-gray-800 text-base sm:text-lg font-medium leading-relaxed mb-6 tracking-tight relative z-10">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Author Information */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-black/5 mt-auto relative z-10">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6F20E8] to-[#A855F7] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-[#6F20E8]/20">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-gray-900 leading-snug truncate">
                      {review.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {review.business || "Business Owner"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
