"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import type { ClientItem } from "@/data/site";

interface ClientLogoMarqueeProps {
  clients?: ClientItem[];
}

const DEFAULT_CLIENTS: ClientItem[] = [
  {
    id: "client-1",
    name: "BJP",
    tag: "Government & Civic Campaigns",
    logo: "/client-bjp.webp",
  },
  {
    id: "client-2",
    name: "NFSU College",
    tag: "National Forensic Sciences University",
    logo: "/client-nsfu.webp",
  },
  {
    id: "client-3",
    name: "Jay Gotli Mukhwas",
    tag: "Food & FMCG Brand",
    logo: "/client-mukhwas.webp",
  },
  {
    id: "client-4",
    name: "Mount Carmel School",
    tag: "Educational Institution",
    logo: "/client-mount-carmel.webp",
  },
  {
    id: "client-5",
    name: "Xavier School",
    tag: "Academic Institution",
    logo: "/client-st-xavier.webp",
  },
];

function PureLogoItem({ client }: { client: ClientItem }) {
  return (
    <div
      title={client.name + (client.tag ? ` (${client.tag})` : "")}
      className="shrink-0 mx-6 sm:mx-10 md:mx-14 flex items-center justify-center select-none"
    >
      {client.logo ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={client.logo}
          alt={client.name}
          width={260}
          height={120}
          loading="eager"
          decoding="async"
          className="h-18 sm:h-24 md:h-30 w-auto max-w-[190px] sm:max-w-[240px] md:max-w-[280px] object-contain pointer-events-none select-none mix-blend-multiply"
        />
      ) : (
        <span className="font-extrabold text-lg sm:text-2xl text-foreground/80 tracking-tight whitespace-nowrap hover:text-[#6F20E8] transition-colors pointer-events-none select-none">
          {client.name}
        </span>
      )}
    </div>
  );
}

export default function ClientLogoMarquee({ clients }: ClientLogoMarqueeProps) {
  const activeClients = clients && clients.length > 0 ? clients : DEFAULT_CLIENTS;

  // Repeat items to ensure seamless loop width across any screen resolution
  const row1Items = [...activeClients, ...activeClients, ...activeClients, ...activeClients];
  // Reversed array for second row to create dynamic dual-motion
  const reversed = [...activeClients].reverse();
  const row2Items = [...reversed, ...reversed, ...reversed, ...reversed];

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-black/5 overflow-hidden relative marquee-group">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center relative z-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-[#6F20E8] text-xs font-bold tracking-wider uppercase mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6F20E8]" />
          Trusted By Esteemed Organizations
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Powering Visual Identities Across Gujarat
        </h2>
        <p className="text-xs sm:text-sm text-muted mt-2 max-w-xl mx-auto font-medium">
          From high-visibility civic campaigns to leading academic universities and institutions.
        </p>
      </div>

      {/* DUAL INFINITE LOGO MARQUEE TRACKS — PURE FLOATING LOGOS WITHOUT BOXES OR SQUARES */}
      <div className="flex flex-col gap-6 sm:gap-10 overflow-hidden relative">
        {/* ROW 1 — Scrolls Left */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left py-2 items-center">
            {row1Items.map((client, idx) => (
              <PureLogoItem key={`row1-${client.id || idx}-${idx}`} client={client} />
            ))}
          </div>
        </div>

        {/* ROW 2 — Scrolls Right */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right py-2 items-center">
            {row2Items.map((client, idx) => (
              <PureLogoItem key={`row2-${client.id || idx}-${idx}`} client={client} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
