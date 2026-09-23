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
  { name: "Team", href: "/team" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact Us", href: "/contact" },
  /* { name: "About", href: "/about" }, */
  /* { name: "Services", href: "/services" }, */
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out bg-white/95 backdrop-blur-md border-b border-black/5 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${isScrolled ? "shadow-md py-2" : "shadow-sm py-2.5 md:py-3"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center z-50 group flex-shrink-0">
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
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  className={`text-sm uppercase tracking-wider transition-all duration-200 ${
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
              className="bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-6 py-2.5 rounded-sm font-semibold transition-all text-sm uppercase tracking-wide shadow-md shadow-[#6F20E8]/20 inline-block"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile Menu Button — Minimum 44x44px touch target */}
          <button
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white/98 backdrop-blur-xl flex flex-col pt-24 pb-8 px-6 md:hidden overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 text-center mt-6">
              {navLinks.map((link, i) => {
                const active = isActive(link.href);
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      prefetch={true}
                      className={`text-2xl uppercase tracking-widest block py-3 transition-all min-h-[48px] flex items-center justify-center ${
                        active
                          ? "text-[#6F20E8] font-bold underline underline-offset-8 decoration-2 decoration-[#6F20E8] scale-105"
                          : "text-gray-700 font-semibold hover:text-[#6F20E8] active:text-[#6F20E8]"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="mt-6 pt-6 border-t border-black/10"
              >
                <Link
                  href="/contact"
                  prefetch={true}
                  className="bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest block w-full text-center shadow-lg shadow-[#6F20E8]/25 min-h-[48px] flex items-center justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get a Free Quote
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
