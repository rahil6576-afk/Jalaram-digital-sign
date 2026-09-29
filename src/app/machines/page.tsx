import { Metadata } from "next";
import { siteData } from "@/data/site";
import PageHero from "@/components/common/PageHero";
import MachinerySection from "@/components/home/MachinerySection";
import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `In-House Machinery & Fleet | ${siteData.business.name}`,
  description: "Explore our complete in-house fleet of solvent, eco-solvent, UV flatbed, CO2 laser, and lamination machinery in Gandhinagar, Gujarat.",
};

export default function MachinesPage() {
  return (
    <>
      {/* PAGE HERO */}
      <PageHero
        badgeText="Industrial Fleet • In-House Infrastructure"
        title={
          <>
            OUR IN-HOUSE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white drop-shadow-md">
              FLEET.
            </span>
          </>
        }
        subtitle="Explore our advanced industrial printers, laser cutters, and fabrication technology powering visual solutions across Gujarat."
        images={[
          "/images/machines/flatbed-uv-printer.jpg",
          "/images/machines/solvent-printer.jpg",
          "/images/machines/co2-laser-machine.jpg",
          "/images/machines/eco-solvent-printer.jpg",
        ]}
      />

      {/* ALL MACHINES SECTION */}
      <MachinerySection />

      {/* CALL TO ACTION */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[#6F20E8] via-[#5B16C7] to-[#3B0764] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <span className="text-purple-200 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 block">
            Direct Fabrication &bull; Gandhinagar Facility
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to Put Our Fleet to Work for Your Brand?
          </h2>
          <p className="text-base sm:text-lg text-purple-100 font-light mb-10 leading-relaxed">
            Get your large-format banners, illuminated signages, and 3D acrylic letters produced with supreme precision and express 24–48h delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto min-h-[48px]"
            >
              <span>Discuss Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${siteData.business.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm backdrop-blur-md transition-all w-full sm:w-auto min-h-[48px]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{siteData.business.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
