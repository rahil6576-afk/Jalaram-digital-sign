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
                src="/images/jalaram-logo.png"
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
            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Connect With Us</h5>
              <div className="flex items-center gap-2.5">
                {[
                  {
                    name: "Instagram",
                    href: siteData.socials.instagram,
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
                    href: siteData.socials.facebook,
                    icon: (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    ),
                  },
                ].map((s) => {
                  const finalUrl = formatExternalUrl(s.href);
                  const hasLink = finalUrl !== "#";
                  return (
                    <a
                      key={s.name}
                      href={hasLink ? finalUrl : "#"}
                      target={hasLink ? "_blank" : undefined}
                      rel={hasLink ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        if (!hasLink) {
                          e.preventDefault();
                        }
                      }}
                      title={hasLink ? `${s.name} - Opens in new tab` : `${s.name} (Configure link in Admin)`}
                      aria-label={s.name}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border shadow-sm ${
                        hasLink
                          ? "bg-black/5 hover:bg-[#6F20E8] hover:text-white text-gray-700 border-black/5 hover:border-[#6F20E8] hover:scale-105 cursor-pointer"
                          : "bg-black/5 text-gray-400 border-black/5 hover:border-purple-300 hover:text-[#6F20E8] cursor-default"
                      }`}
                    >
                      {s.icon}
                    </a>
                  );
                })}
              </div>
            </div>
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
                <span className="text-muted">{siteData.business.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-accent shrink-0" />
                <span className="text-muted">WhatsApp: {siteData.business.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span className="text-muted">{siteData.business.email}</span>
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
