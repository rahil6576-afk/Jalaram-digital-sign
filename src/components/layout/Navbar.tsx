"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteData } from "@/data/site";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Team", href: "/team" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update background shadow when slightly scrolled
      setIsScrolled(currentScrollY > 15);

      // Always show navbar near the top of the page
      if (currentScrollY <= 30) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        // Scrolling DOWN -> hide navbar to maximize view
        if (!isMobileMenuOpen) {
          setIsVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling UP -> IMMEDIATELY show navbar and move together with screen!
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out bg-white/95 backdrop-blur-md border-b border-black/5 ${
          isVisible || isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        } ${isScrolled ? "shadow-md py-2" : "shadow-sm py-2.5 md:py-3"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center z-50 group flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/images/jalaram-logo.png"
                alt={`${siteData.business.name} Logo`}
                width={240}
                height={45}
                priority
                className="h-8 sm:h-9 md:h-11 lg:h-12 w-auto object-contain transition-transform duration-200 group-hover:opacity-90"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-7">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    className={`text-xs lg:text-sm uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                      active
                        ? "text-black font-bold underline underline-offset-8 decoration-2 decoration-accent scale-105"
                        : "text-gray-600 font-medium hover:text-black"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Link
                href="/contact"
                prefetch={true}
                className="bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-5 lg:px-6 py-2.5 rounded-sm font-semibold transition-all text-xs lg:text-sm uppercase tracking-wide shadow-md shadow-[#6F20E8]/20 inline-block"
              >
                Get a Quote
              </Link>
            </div>

            {/* Mobile Menu Button — Minimum 44x44px touch target */}
            <button
              type="button"
              className="md:hidden z-50 w-11 h-11 flex items-center justify-center -mr-2 text-foreground rounded-lg active:bg-gray-100 touch-manipulation focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Drawer — Sibling to header so it is NOT constrained by header's transform */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col md:hidden overflow-y-auto"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Dedicated Mobile Header with Logo & Close Button */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center"
              >
                <Image
                  src="/images/jalaram-logo.png"
                  alt={`${siteData.business.name} Logo`}
                  width={180}
                  height={36}
                  priority
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200 text-gray-800 transition-colors"
                aria-label="Close Navigation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-5 py-6 flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1">
                Explore Pages
              </p>
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold uppercase tracking-wider text-base transition-all min-h-[50px] ${
                      active
                        ? "bg-purple-50 text-[#6F20E8] border border-purple-200 shadow-sm"
                        : "text-gray-800 hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          active ? "bg-[#6F20E8]" : "bg-gray-300"
                        }`}
                      />
                      {link.name}
                    </span>
                    <span
                      className={`text-sm ${
                        active ? "text-[#6F20E8]" : "text-gray-400"
                      }`}
                    >
                      →
                    </span>
                  </Link>
                );
              })}

              {/* Quick Actions & Direct Contact */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  href="/contact"
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider block w-full text-center shadow-lg shadow-[#6F20E8]/25 min-h-[50px] flex items-center justify-center text-sm"
                >
                  Get a Free Quote
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <a
                    href={`tel:${siteData.business.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs tracking-wide min-h-[44px]"
                  >
                    Call Us
                  </a>
                  <a
                    href={`https://wa.me/${siteData.business.whatsapp || "919427033363"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-lg bg-[#25D366]/10 text-[#128C7E] font-semibold text-xs tracking-wide border border-[#25D366]/30 min-h-[44px]"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </nav>

            {/* Mobile Footer in Drawer */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-medium">
                {siteData.business.name} • Gandhinagar, Gujarat
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
