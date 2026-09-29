"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSiteData } from "@/context/SiteDataContext";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Team", href: "/team" },
  { name: "Services", href: "/services" },
  { name: "Machines", href: "/machines" },
  { name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const siteData = useSiteData();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  // Group services by category/type
  const servicesByCategory = (siteData?.services || []).reduce((acc, s) => {
    const cat = s.category || "General Services";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, typeof siteData.services>);

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
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

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
                src="https://res.cloudinary.com/v61ii2hr/image/upload/v1790398040/jalaram/jalaram_jalaram-logo_1790398041779.png"
                alt={`${siteData.business.name} Logo`}
                width={240}
                height={45}
                priority
                className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain transition-transform duration-200 group-hover:opacity-90 mix-blend-multiply"
              />
            </Link>

            {/* Desktop Nav (shown on lg screens 1024px+ to prevent collision on tablets) */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                // Dedicated Services dropdown with categorized service types
                if (link.name === "Services") {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => {
                        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                        setServicesDropdownOpen(true);
                      }}
                      onMouseLeave={() => {
                        dropdownTimeoutRef.current = setTimeout(() => {
                          setServicesDropdownOpen(false);
                        }, 200);
                      }}
                    >
                      <Link
                        href="/services"
                        prefetch={true}
                        className={`inline-flex items-center gap-1.5 text-xs xl:text-sm uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                          active
                            ? "text-black font-bold underline underline-offset-8 decoration-2 decoration-accent scale-105"
                            : "text-gray-600 font-medium hover:text-black"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            servicesDropdownOpen ? "rotate-180 text-black" : "text-gray-400"
                          }`}
                        />
                      </Link>

                      {/* Dropdown Menu Container */}
                      <AnimatePresence>
                        {servicesDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[720px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 text-left"
                          >
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                                  All Printing &amp; Signage Services
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {siteData.services.length} services available
                                </p>
                              </div>
                              <Link
                                href="/services"
                                onClick={() => setServicesDropdownOpen(false)}
                                className="text-xs font-bold text-[#6F20E8] hover:text-[#5B16C7] transition-colors"
                              >
                                View All Services &rarr;
                              </Link>
                            </div>

                            {/* Clean Multi-column Services List (Redirects to clicked service) */}
                            <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 max-h-[420px] overflow-y-auto pr-2">
                              {siteData.services.map((service) => {
                                const targetId = service.slug || service.id;
                                return (
                                  <Link
                                    key={service.id}
                                    href={`/services#${targetId}`}
                                    onClick={() => {
                                      setServicesDropdownOpen(false);
                                      if (typeof window !== "undefined" && window.location.pathname === "/services") {
                                        const el = document.getElementById(targetId);
                                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                      }
                                    }}
                                    className="text-xs text-gray-700 hover:text-[#6F20E8] hover:translate-x-1 transition-all block py-1.5 px-2.5 rounded-lg hover:bg-purple-50 font-medium leading-snug cursor-pointer"
                                  >
                                    {service.title}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    className={`text-xs xl:text-sm uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
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

            {/* Desktop CTA (shown on lg screens 1024px+) */}
            <div className="hidden lg:block">
              <Link
                href="/contact"
                prefetch={true}
                className="bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-5 xl:px-6 py-2 xl:py-2.5 rounded-sm font-semibold transition-all text-xs xl:text-sm uppercase tracking-wide shadow-md shadow-[#6F20E8]/20 inline-block"
              >
                Get a Quote
              </Link>
            </div>

            {/* Mobile & Tablet Menu Button — Minimum 44x44px touch target */}
            <button
              type="button"
              className="lg:hidden z-50 w-11 h-11 flex items-center justify-center -mr-2 text-foreground rounded-lg active:bg-gray-100 touch-manipulation focus:outline-none"
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

      {/* Full-Screen Mobile & Tablet Navigation Drawer — Sibling to header so it is NOT constrained by header's transform */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden overflow-y-auto"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Dedicated Mobile Header with Logo & Close Button */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-between w-full max-w-xl mx-auto">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <Image
                    src="https://res.cloudinary.com/v61ii2hr/image/upload/v1790398040/jalaram/jalaram_jalaram-logo_1790398041779.png"
                    alt={`${siteData.business.name} Logo`}
                    width={180}
                    height={36}
                    priority
                    className="h-8 sm:h-9 w-auto object-contain mix-blend-multiply"
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
            </div>

            {/* Mobile & Tablet Nav Links */}
            <nav className="flex-1 px-5 sm:px-8 py-6 flex flex-col gap-2 max-w-xl mx-auto w-full">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1">
                Menu Navigation
              </p>
              {navLinks.map((link) => {
                const active = isActive(link.href);

                if (link.name === "Services") {
                  return (
                    <div key={link.name} className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <Link
                          href={link.href}
                          prefetch={true}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex-1 flex items-center px-4 py-3.5 rounded-xl font-bold uppercase tracking-wider text-base transition-all min-h-[50px] ${
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
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                          className="px-3 py-3 text-gray-500 hover:text-gray-900"
                          aria-label="Toggle Services List"
                        >
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${
                              mobileServicesOpen ? "rotate-180 text-[#6F20E8]" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Mobile Accordion of Services (Redirects to clicked service) */}
                      {mobileServicesOpen && (
                        <div className="pl-4 pr-2 py-3 grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto bg-gray-50/70 rounded-xl my-1 border border-gray-100">
                          {siteData.services.map((s) => {
                            const targetId = s.slug || s.id;
                            return (
                              <Link
                                key={s.id}
                                href={`/services#${targetId}`}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  if (typeof window !== "undefined" && window.location.pathname === "/services") {
                                    const el = document.getElementById(targetId);
                                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }
                                }}
                                className="text-xs text-gray-700 hover:text-[#6F20E8] block py-1.5 px-3 rounded-lg hover:bg-purple-50 font-medium cursor-pointer"
                              >
                                {s.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3.5 rounded-xl font-bold uppercase tracking-wider text-base transition-all min-h-[50px] ${
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
                  </Link>
                );
              })}

              {/* Quick Actions (Get a Free Quote CTA button) */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <Link
                  href="/contact"
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider block w-full text-center shadow-lg shadow-[#6F20E8]/25 min-h-[50px] flex items-center justify-center text-sm"
                >
                  Get a Free Quote
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
