"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Printer,
  Sparkles,
  Scissors,
  Layers,
  Zap,
  SunMedium,
  CheckCircle2,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface MachineItem {
  id: string;
  name: string;
  gujaratiName: string;
  badge: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
  capabilities: string[];
  idealFor: string;
  speedOrSpec: string;
  sortOrder?: number;
}

const MACHINES: MachineItem[] = [
  {
    id: "solvent",
    name: "Solvent Printer",
    gujaratiName: "સોલ્વન્ટ પ્રિન્ટર",
    badge: "Heavy-Duty Outdoor",
    image: "/images/machines/solvent-printer.jpg",
    icon: Printer,
    tagline: "Large-format outdoor flex and billboard powerhouse",
    description:
      "Industrial high-speed solvent printing engineered for high-impact outdoor media with extreme weather resilience against Gujarat's intense heat, heavy monsoon rain, and direct sunlight.",
    capabilities: [
      "10+ feet seamless roll-to-roll printing width",
      "Deep pigment penetration into PVC flex for long-lasting vibrancy",
      "100% weather, water & UV sunlight fade resistant",
      "Ideal for massive hoardings with fast turnaround",
    ],
    idealFor: "Highway Hoardings, Outdoor Flex Banners, Building Wraps, Event Backdrops",
    speedOrSpec: "High-Volume Production • Solvent Base Inks",
  },
  {
    id: "eco-solvent",
    name: "Eco Solvent Printer",
    gujaratiName: "ઇકો સોલ્વન્ટ પ્રિન્ટર",
    badge: "Ultra-HD 1440 DPI",
    image: "/images/machines/eco-solvent-printer.jpg",
    icon: Sparkles,
    tagline: "Odorless photo-quality commercial vinyl & vehicle graphics",
    description:
      "High-precision, environmentally friendly printing technology delivering photographic sharpness, smooth color gradations, and rich color saturation without toxic chemical odors.",
    capabilities: [
      "Microscopic dot precision up to 1440 DPI photographic output",
      "Odor-free, non-toxic formulation safe for retail and indoor spaces",
      "Superior ink adhesion on self-adhesive vinyl and specialty media",
      "Rich color gamut with deep blacks and vibrant brand colors",
    ],
    idealFor: "Vehicle Wraps, Retail Store Graphics, Glass Murals, Roll-Up Standees, Canvas",
    speedOrSpec: "Micro-Piezo Precision • Eco-Friendly Inks",
  },
  {
    id: "plotter-cutting",
    name: "Plotter Cutting",
    gujaratiName: "પ્લોટર કટીંગ મશીન",
    badge: "Micro-Precision CNC",
    image: "/images/machines/plotter-cutting.jpg",
    icon: Scissors,
    tagline: "Computerized contour cutting for stickers & radium work",
    description:
      "Advanced computerized knife cutting plotter equipped with optical eye sensor registration to kiss-cut and die-cut intricate logos, decals, and reflective sheeting with surgical accuracy.",
    capabilities: [
      "Optical sensor for exact print-and-cut contour alignment",
      "Micro-precision cut capability for small intricate typography",
      "Effortless cutting of radium, fluorescent, and reflective tapes",
      "Kiss-cut sheets and individual die-cut sticker outputs",
    ],
    idealFor: "Radium Work, Vehicle Number Plates, Die-Cut Stickers, Frosted Film Graphics",
    speedOrSpec: "Optical Eye Sensor • 0.05mm Repeatability",
  },
  {
    id: "lamination",
    name: "Lamination Machine",
    gujaratiName: "લેમિનેશન મશીન",
    badge: "Thermal & Cold Roll",
    image: "/images/machines/lamination-machine.jpg",
    icon: Layers,
    tagline: "Protective shield against scratches, moisture & UV rays",
    description:
      "Heavy-duty roll-to-roll cold and thermal lamination system that seals printed graphics with protective optical-grade gloss, matte, or textured overlaminates to multiply product lifespan.",
    capabilities: [
      "Bubble-free and wrinkle-free pneumatic silicone roller pressure",
      "Cold pressure-sensitive and heated roll lamination modes",
      "Gloss, Matte, Sparkle & Velvet anti-scratch protective finishes",
      "Triples graphic durability against dust, fingerprint oil & washing",
    ],
    idealFor: "Vinyl Decals, Sunboard Mounts, Fleet Graphics, Menu Boards, Corporate Signage",
    speedOrSpec: "Dual Heat-Assisted Rollers • 65-Inch Width",
  },
  {
    id: "co2-laser",
    name: "CO2 Laser Machine",
    gujaratiName: "CO2 લેસર કટીંગ મશીન",
    badge: "Laser Engraving & Cut",
    image: "/images/machines/co2-laser-machine.jpg",
    icon: Zap,
    tagline: "CNC laser cutting for 3D acrylic letters & architectural signage",
    description:
      "High-power industrial CO2 laser cutting and engraving system designed for surgical cutting of acrylic, wood, MDF, and plastic sheets with flawless flame-polished crystal-clear edges.",
    capabilities: [
      "Smooth flame-polished edges requiring zero manual hand polishing",
      "Cuts cast acrylic up to 20mm thickness and high-density MDF boards",
      "High-speed precision vector cutting and raster engraving",
      "Ideal for creating 3D embossed logo elements and LED channel letters",
    ],
    idealFor: "3D Acrylic Letters, Architectural Name Plates, LED Sign Faces, Wood Plaques",
    speedOrSpec: "High-Power Laser Tube • 0.02mm Accuracy",
  },
  {
    id: "flatbed-uv",
    name: "Flatbed UV Print",
    gujaratiName: "ફ્લેટબેડ UV પ્રિન્ટર",
    badge: "Direct Substrate UV LED",
    image: "/images/machines/flatbed-uv-printer.jpg",
    icon: SunMedium,
    tagline: "Direct printing on rigid acrylic, glass, wood, sunboard & ACP",
    description:
      "State-of-the-art flatbed UV printing technology capable of printing directly onto virtually any rigid or flexible material with instant UV LED ink curing and tactile raised embossing.",
    capabilities: [
      "Direct printing on Acrylic, Sunboard, ACP, Glass, Wood & Metal sheets",
      "Instant UV LED curing with zero drying wait time or ink smearing",
      "Dedicated White Ink & Gloss Varnish channels for 3D raised texture",
      "Exceptional indoor and outdoor scratch and chemical resistance",
    ],
    idealFor: "ACP Facades, Acrylic Sign Boards, Glass Partitions, Wooden Murals, Luxury Signs",
    speedOrSpec: "Industrial UV LED Lamps • White + Varnish",
  },
];

import { useSiteData } from "@/context/SiteDataContext";
import { useEffect, useState } from "react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  solvent: Printer,
  "eco-solvent": Sparkles,
  "plotter-cutting": Scissors,
  lamination: Layers,
  "co2-laser": Zap,
  "flatbed-uv": SunMedium,
};

export default function MachinerySection() {
  const siteData = useSiteData();
  const rawList = (siteData?.machines && siteData.machines.length > 0) ? siteData.machines : MACHINES;
  const [machines, setMachines] = useState<any[]>(rawList);

  useEffect(() => {
    const fetchMachines = () => {
      fetch(`/api/machines?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.machines) && data.machines.length > 0) {
            setMachines(data.machines);
          }
        })
        .catch((err) => console.warn("Could not fetch from /api/machines:", err));
    };

    fetchMachines();

    window.addEventListener("site-content-updated", fetchMachines);
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("jalaram_site_sync");
        bc.onmessage = () => fetchMachines();
      }
    } catch {
      // safe fallback
    }

    return () => {
      window.removeEventListener("site-content-updated", fetchMachines);
      if (bc) bc.close();
    };
  }, []);

  // Sync if context updates
  useEffect(() => {
    if (siteData?.machines && siteData.machines.length > 0) {
      setMachines(siteData.machines);
    }
  }, [siteData?.machines]);

  const machineList = [...machines].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : (typeof a.sort_order === "number" ? a.sort_order : 999);
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : (typeof b.sort_order === "number" ? b.sort_order : 999);
    return orderA - orderB;
  });

  return (
    <section id="machinery" className="py-20 sm:py-24 md:py-32 bg-zinc-50 border-t border-b border-black/5 relative overflow-hidden scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 text-[#6F20E8] text-xs font-bold tracking-wider uppercase mb-3">
              <Cpu className="w-3.5 h-3.5" />
              In-House Production Infrastructure &bull; અમારી અત્યાધુનિક મશીનરી
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              State-of-the-Art <br className="hidden sm:inline" />
              Machinery &amp; Equipment.
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-gray-600 font-light max-w-md text-left"
          >
            Every print, sign board, and 3D architectural letter is manufactured in-house at our
            Gandhinagar facility using heavy-duty industrial-grade machines for uncompromising quality.
          </motion.p>
        </div>

        {/* 6-Grid Machine Cards With Real Photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {machineList.map((machine, index) => {
            const Icon = ICON_MAP[machine.id] || Cpu;
            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group bg-white rounded-2xl border border-black/8 hover:border-[#6F20E8]/40 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div>
                    {/* MACHINE REAL PHOTO CONTAINER */}
                    <div className="relative aspect-[16/10] w-full bg-gray-900 overflow-hidden">
                      {machine.image ? (
                        <Image
                          src={machine.image}
                          alt={machine.name || "Machinery"}
                          fill
                          unoptimized={machine.image.startsWith("http") || machine.image.startsWith("data:")}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                          <Cpu className="w-12 h-12 text-purple-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    {/* Machine Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md">
                        {machine.badge}
                      </span>
                    </div>

                    {/* Floating Machine Icon and Gujarati Subtitle */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#6F20E8] text-white flex items-center justify-center shadow-lg">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-white text-xs font-bold block drop-shadow-md">
                          {machine.gujaratiName}
                        </span>
                        <span className="text-purple-200 text-[10px] font-medium block">
                          In-House Fleet 0{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-[#6F20E8] transition-colors">
                        {machine.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 italic mt-0.5">
                        &ldquo;{machine.tagline}&rdquo;
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {machine.description}
                    </p>

                    {/* Capabilities */}
                    {(() => {
                      const caps = Array.isArray(machine.capabilities) && machine.capabilities.length > 0
                        ? machine.capabilities
                        : (Array.isArray(machine.features) ? machine.features : []);
                      if (caps.length === 0) return null;
                      return (
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                            Capabilities &amp; Features:
                          </span>
                          <ul className="space-y-1.5">
                            {caps.map((cap: string, cIdx: number) => (
                              <li key={cIdx} className="text-xs text-gray-700 flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{cap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Footer Section: Ideal Applications & Specs */}
                <div className="p-5 sm:p-6 pt-0 space-y-2 text-xs">
                  <div className="pt-3 border-t border-gray-100">
                    <span className="font-semibold text-gray-800">Ideal For: </span>
                    <span className="text-gray-500">{machine.idealFor}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6F20E8] font-semibold bg-purple-50/70 px-3 py-1.5 rounded-lg border border-purple-100/70">
                    <span>{machine.speedOrSpec}</span>
                    <span className="font-mono font-bold">0{index + 1}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
