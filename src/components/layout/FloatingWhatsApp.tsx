"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { siteData } from "@/data/site";

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const dragState = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    moved: boolean;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });

  const buttonRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = `https://wa.me/${siteData.business.whatsapp}?text=${encodeURIComponent(
    "Hello Jalaram Digital Sign, I would like to inquire about your printing & signage services."
  )}`;

  // Keep within bounds on window resize if already positioned
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const maxX = Math.max(16, window.innerWidth - 72);
        const maxY = Math.max(16, window.innerHeight - 72);
        return {
          x: Math.min(Math.max(16, prev.x), maxX),
          y: Math.min(Math.max(16, prev.y), maxY),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click / touch only
    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
      moved: false,
    };

    setIsDraggingState(true);
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isDragging) return;

    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      dragState.current.moved = true;
    }

    if (dragState.current.moved) {
      const maxX = Math.max(16, window.innerWidth - 72);
      const maxY = Math.max(16, window.innerHeight - 72);

      const nextX = Math.min(Math.max(16, dragState.current.initialX + deltaX), maxX);
      const nextY = Math.min(Math.max(16, dragState.current.initialY + deltaY), maxY);

      setPosition({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isDragging) return;
    dragState.current.isDragging = false;
    setIsDraggingState(false);
    try {
      buttonRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If the user moved/dragged the button, do not trigger the WhatsApp link
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const tooltipOnRight = position && position.x < 180;

  return (
    <div
      ref={buttonRef}
      aria-label="WhatsApp Chat Support"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: "auto",
              bottom: "auto",
            }
          : undefined
      }
      className={`fixed z-[9999] w-14 h-14 select-none touch-none group ${
        !position ? "bottom-6 right-6" : ""
      } ${isDraggingState ? "cursor-grabbing" : "cursor-grab"}`}
    >
      {/* Tooltip positioned absolutely so it does not affect button dimensions or placement */}
      <div
        className={`hidden sm:block absolute top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-gray-950/95 text-white text-xs font-semibold rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 ${
          tooltipOnRight ? "left-full ml-3" : "right-full mr-3"
        }`}
      >
        Chat with us • Drag to move
      </div>

      {/* Button with pulse ring */}
      <a
        href={whatsappUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Jalaram Digital Sign"
        draggable={false}
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl shadow-[#25D366]/50 hover:scale-110 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 select-none"
      >
        {/* Radar ping effect */}
        {!isDraggingState && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
        )}

        {/* WhatsApp Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 relative z-10 pointer-events-none"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.37C9.37 7.37 9.1 7.43 8.87 7.68C8.64 7.93 8 8.53 8 9.75C8 10.97 8.89 12.16 9.01 12.32C9.14 12.49 10.74 15.08 13.25 16.08C15.34 16.91 15.77 16.75 16.22 16.71C16.67 16.67 17.68 16.11 17.89 15.53C18.1 14.94 18.1 14.44 18.04 14.34C17.98 14.23 17.82 14.17 17.57 14.05C17.33 13.93 16.12 13.33 15.89 13.25C15.66 13.17 15.5 13.13 15.33 13.37C15.17 13.62 14.7 14.17 14.56 14.34C14.42 14.5 14.27 14.52 14.03 14.4C13.79 14.28 12.77 13.94 11.56 12.86C10.62 12.02 9.98 10.99 9.8 10.68C9.62 10.37 9.78 10.2 9.9 10.08C10.01 9.97 10.15 9.79 10.27 9.65C10.39 9.5 10.43 9.4 10.51 9.24C10.59 9.07 10.55 8.93 10.49 8.81C10.43 8.68 9.96 7.53 9.76 7.06C9.57 6.6 9.38 6.66 9.24 6.65C9.1 6.65 8.94 6.65 8.78 6.65L9.53 7.37Z" />
        </svg>
      </a>
    </div>
  );
}
