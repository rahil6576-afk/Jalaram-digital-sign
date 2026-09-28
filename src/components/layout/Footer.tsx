"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSiteData } from "@/context/SiteDataContext";
import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";
import { formatExternalUrl } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  const siteData = useSiteData();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-secondary-bg pt-20 pb-10 border-t border-black/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="https://res.cloudinary.com/v61ii2hr/image/upload/v1790398040/jalaram/jalaram_jalaram-logo_1790398041779.png"
                alt={`${siteData.business.name} Logo`}
                width={280}
                height={100}
                className="max-w-[280px] w-full h-auto object-contain mix-blend-multiply"
              />
            </Link>
            <p className="text-muted leading-relaxed max-w-sm">
              {siteData.business.description}
            </p>

            {/* Social Media Links */}
            {(() => {
              const activeSocials = [
                {
                  name: "Instagram",
                  href: siteData.socials?.instagram,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  ),
                },
                {
                  name: "Facebook",
                  href: siteData.socials?.facebook,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  ),
                },
                {
                  name: "YouTube",
                  href: siteData.socials?.youtube,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
                    </svg>
                  ),
                },
                {
                  name: "LinkedIn",
                  href: siteData.socials?.linkedin,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  ),
                },
                {
                  name: "Twitter",
                  href: (siteData.socials as { twitter?: string })?.twitter,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                },
              ].filter((s) => {
                const finalUrl = formatExternalUrl(s.href);
                return finalUrl !== "#" && Boolean(s.href && s.href.trim().length > 0);
              });

              if (activeSocials.length === 0) return null;

              return (
                <div className="pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Connect With Us</h5>
                  <div className="flex items-center gap-2.5">
                    {activeSocials.map((s) => {
                      const finalUrl = formatExternalUrl(s.href);
                      return (
                        <a
                          key={s.name}
                          href={finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${s.name} - Opens in new tab`}
                          aria-label={s.name}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border shadow-sm bg-black/5 hover:bg-[#6F20E8] hover:text-white text-gray-700 border-black/5 hover:border-[#6F20E8] hover:scale-105 cursor-pointer"
                        >
                          {s.icon}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Nav Col */}
          <div>
            <h4 className="text-foreground font-bold uppercase tracking-wider mb-6">
              Navigation
            </h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-muted hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/team" className="text-muted hover:text-foreground transition-colors">Team</Link></li>
              <li><Link href="/portfolio" className="text-muted hover:text-foreground transition-colors">Portfolio</Link></li>
              <li><Link href="/contact" className="text-muted hover:text-foreground transition-colors">Contact Us</Link></li>
              {/* <li><Link href="/about" className="text-muted hover:text-foreground transition-colors">About</Link></li> */}
              {/* <li><Link href="/services" className="text-muted hover:text-foreground transition-colors">Services</Link></li> */}
              {/* <li><Link href="/faq" className="text-muted hover:text-foreground transition-colors">FAQ</Link></li> */}
            </ul>
          </div>

          {/* Services Col */}
          {/* <div>
            <h4 className="text-foreground font-bold uppercase tracking-wider mb-6">
              Services
            </h4>
            <ul className="space-y-4">
              {siteData.services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link href={`/services/${service.slug}`} className="text-muted hover:text-foreground transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Contact Col */}
          <div>
            <h4 className="text-foreground font-bold uppercase tracking-wider mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-muted">{siteData.business.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href={`tel:${siteData.business.phone.replace(/\s/g,'')}`} className="text-muted hover:text-accent transition-colors">{siteData.business.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-accent shrink-0" />
                <a href={`https://wa.me/${siteData.business.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">WhatsApp: {siteData.business.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href={`mailto:${siteData.business.email}`} className="text-muted hover:text-accent transition-colors">{siteData.business.email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/10 text-center">
          <p className="text-muted text-sm">
            &copy; {currentYear} {siteData.business.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
