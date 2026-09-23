"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteData } from "@/data/site";
import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
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
                className="w-[280px] h-auto object-contain"
              />
            </Link>
            <p className="text-muted leading-relaxed max-w-sm">
              {siteData.business.description}
            </p>
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
