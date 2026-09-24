import { Metadata } from "next";
import { siteData, getSiteData } from "@/data/site";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import TeamGrid from "@/components/team/TeamGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Our Team | ${siteData.business.name}`,
  description: "Meet the people behind the premium printing and signage solutions.",
};

export default function TeamPage() {
  const currentData = getSiteData();
  return (
    <>
      <section className="pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 bg-black border-b border-black/10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/digital-printing.webp"
            alt="Team background"
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-white font-semibold text-xs md:text-sm tracking-[0.2em] uppercase mb-6 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse shrink-0" />
              <span>Meet The Experts • Craftsmanship &amp; Precision</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-white drop-shadow-lg leading-[1.1]">
              THE PEOPLE BEHIND <br /> THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">PRINT.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-light leading-relaxed max-w-2xl drop-shadow-md">
              Great visual work comes from people who care about every detail.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <TeamGrid team={currentData.team} />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 sm:py-24 md:py-32 bg-gradient-to-br from-[#6F20E8] via-[#5B16C7] to-[#3B0764] relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <span className="text-purple-200 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
            Let&apos;s Work Together
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-white drop-shadow-xl leading-[1.1]">
            Ready to Bring Your <br /> Brand Vision to Life?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-100 font-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Connect with our experienced team in Gandhinagar for expert signage guidance, custom quotes, and flawless fabrication.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all text-sm uppercase tracking-widest shadow-2xl min-h-[48px] w-full sm:w-auto"
            >
              Contact Our Team <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${currentData.business.whatsapp || "919427033363"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all text-sm uppercase tracking-widest backdrop-blur-md min-h-[48px] w-full sm:w-auto"
            >
              WhatsApp Inquiry
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
