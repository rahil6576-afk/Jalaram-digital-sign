"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface SitePhotoGallerySliderProps {
  title: string;
  photos: string[];
}

export default function SitePhotoGallerySlider({ title, photos }: SitePhotoGallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* MAIN SLIDER VIEWPORT */}
      <div
        className="relative aspect-[16/9] md:aspect-[21/9] bg-card-bg rounded-2xl overflow-hidden border border-black/10 shadow-xl group select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={photos[currentIndex]}
          src={encodeURI(photos[currentIndex])}
          alt={`${title} - Photo ${currentIndex + 1}`}
          fill
          priority
          className="object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Counter Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md">
            Photo {currentIndex + 1} of {photos.length}
          </span>
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/65 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all border border-white/20 shadow-md hover:scale-105 cursor-pointer"
          title="View fullscreen"
          aria-label="View fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Sliding Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl border border-white/20 cursor-pointer"
              aria-label="Previous photo"
              title="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-[#6F20E8] text-white flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl border border-white/20 cursor-pointer"
              aria-label="Next photo"
              title="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentIndex ? "w-6 bg-[#8A3FFC]" : "w-2 bg-white/50 hover:bg-white/90"
                }`}
                aria-label={`Slide to photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* THUMBNAIL SLIDER STRIP */}
      {photos.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 no-scrollbar">
          {photos.map((photo, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                i === currentIndex
                  ? "border-[#6F20E8] scale-105 shadow-md shadow-[#6F20E8]/40 ring-2 ring-purple-400"
                  : "border-black/10 opacity-70 hover:opacity-100 hover:border-black/30"
              }`}
              title={`Slide to photo ${i + 1}`}
            >
              <Image
                src={encodeURI(photo)}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/75 text-[10px] text-white font-bold px-1.5 py-0.2 rounded">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full max-w-6xl flex items-center justify-between text-white pointer-events-none z-30">
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-white/10 pointer-events-auto">
              Photo {currentIndex + 1} of {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto cursor-pointer transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-auto min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 z-30 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-[#6F20E8] text-white border border-white/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodeURI(photos[currentIndex])}
              alt={`${title} - Photo ${currentIndex + 1}`}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl border border-white/15 shadow-2xl select-none"
            />

            {photos.length > 1 && (
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 z-30 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-[#6F20E8] text-white border border-white/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}
          </div>

          <div
            className="w-full max-w-6xl flex flex-col items-center gap-2 pointer-events-auto z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-sm font-semibold">{title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
