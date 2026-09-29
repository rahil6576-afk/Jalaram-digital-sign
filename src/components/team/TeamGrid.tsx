"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteData } from "@/context/SiteDataContext";
import type { TeamMember } from "@/data/site";
import { PhoneCall, MessageCircle, Mail, Award, CheckCircle, Sparkles } from "lucide-react";
import { formatWhatsAppUrl } from "@/lib/utils";

interface TeamGridProps {
  team?: TeamMember[];
}

export interface ExtendedTeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image: string;
  phone?: string;
  email?: string;
  sortOrder?: number;
  socialLinks?: Record<string, string>;
}

function FounderSpotlightCard({ founder, businessPhone, businessWhatsApp, businessEmail }: {
  founder: ExtendedTeamMember;
  businessPhone: string;
  businessWhatsApp: string;
  businessEmail: string;
}) {
  const directPhone = founder.phone?.trim() || businessPhone || "+91 85111 33363";
  const directEmail = founder.email?.trim() || businessEmail || "jalaramdigitalsign@gmail.com";
  const cleanPhone = directPhone.replace(/[^\d+]/g, "");
  const waUrl = formatWhatsAppUrl(businessWhatsApp || cleanPhone, `Hello ${founder.name}, I would like to consult with you regarding a visual printing & signage project.`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="mb-16 md:mb-24 bg-gradient-to-br from-white via-purple-50/30 to-white rounded-3xl border-2 border-purple-200/80 p-6 sm:p-8 md:p-12 shadow-xl shadow-purple-500/5 relative overflow-hidden"
    >
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#6F20E8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-fuchsia-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 sm:gap-10 lg:gap-14">
        {/* BIGGER PHOTO CONTAINER FOR FOUNDER */}
        <div className="w-full sm:w-80 md:w-96 lg:w-[420px] shrink-0">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-purple-300/80 shadow-2xl shadow-purple-900/15 group bg-gray-900">
            <Image
              src={founder.image}
              alt={founder.name}
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 384px, 420px"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

            {/* Prominent Badge on Photo */}
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Founder &amp; Visionary
              </span>
              <p className="text-white text-lg font-bold mt-1 drop-shadow-md">{founder.name}</p>
              <p className="text-purple-200 text-xs font-medium">{founder.role}</p>
            </div>
          </div>
        </div>

        {/* DETAILED DETAILS & DIRECT CONTACT SECTION */}
        <div className="flex-1 flex flex-col justify-between text-left">
          <div>
            {/* Category Subtitle */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-[#6F20E8] text-xs font-bold uppercase tracking-widest mb-3">
              <Award className="w-3.5 h-3.5" />
              Executive Leadership &bull; સ્થાપક અને સંચાલક
            </div>

            {/* Big Name */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {founder.name}
            </h2>

            {/* Role designation */}
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-base sm:text-lg font-bold uppercase tracking-wider mt-1 mb-4">
              {founder.role} &bull; Jalaram Digital Sign
            </p>

            {/* Extended Bio / Description */}
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              {founder.bio || "Pioneering premium digital printing and large-scale architectural signage in Gandhinagar and across Gujarat with over 15 years of relentless pursuit of craftsmanship and customer satisfaction."}
            </p>

            {/* Leadership Key Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-800 bg-white/80 p-3 rounded-xl border border-purple-100 shadow-sm">
                <CheckCircle className="w-4 h-4 text-[#6F20E8] shrink-0" />
                <span>15+ Years Signage Mastery</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-800 bg-white/80 p-3 rounded-xl border border-purple-100 shadow-sm">
                <CheckCircle className="w-4 h-4 text-[#6F20E8] shrink-0" />
                <span>Direct Executive Consultation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-800 bg-white/80 p-3 rounded-xl border border-purple-100 shadow-sm">
                <CheckCircle className="w-4 h-4 text-[#6F20E8] shrink-0" />
                <span>Complete In-House Fleet</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-800 bg-white/80 p-3 rounded-xl border border-purple-100 shadow-sm">
                <CheckCircle className="w-4 h-4 text-[#6F20E8] shrink-0" />
                <span>Gujarat-Wide Fast Turnaround</span>
              </div>
            </div>
          </div>

          {/* FOUNDER DIRECT CONTACT NUMBER & ACTIONS */}
          <div className="pt-6 border-t border-purple-100 bg-white/60 p-5 rounded-2xl border">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Founder&apos;s Direct Contact Line
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-xl sm:text-2xl font-black text-gray-900 hover:text-[#6F20E8] transition-colors flex items-center gap-2"
                >
                  <PhoneCall className="w-5 h-5 text-[#6F20E8]" />
                  <span>{directPhone}</span>
                </a>
                <span className="text-xs text-gray-500 mt-0.5 block">
                  Available for strategic visual branding &amp; high-volume orders
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6F20E8]/20 transition-all hover:scale-105 active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Direct</span>
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${directEmail}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all"
                  title="Send Email"
                >
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RegularTeamMemberCard({ member, index }: { member: ExtendedTeamMember; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group select-none bg-white rounded-2xl border border-black/8 p-4 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-[3/4] bg-card-bg mb-4 relative overflow-hidden rounded-xl border border-black/5">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top pointer-events-none transition-all duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
      </div>

      <h3 className="text-xl font-bold mb-1 text-gray-900 group-hover:text-[#6F20E8] transition-colors">
        {member.name}
      </h3>
      <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-xs font-bold uppercase tracking-wider mb-2">
        {member.role}
      </p>
      <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{member.bio}</p>

      {member.phone && (
        <a
          href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#6F20E8] font-semibold hover:underline"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{member.phone}</span>
        </a>
      )}
    </motion.div>
  );
}

export default function TeamGrid({ team }: TeamGridProps) {
  const siteData = useSiteData();
  const activeTeam = (siteData?.team && siteData.team.length > 0) ? (siteData.team as ExtendedTeamMember[]) : ((team || []) as ExtendedTeamMember[]);

  if (!activeTeam || activeTeam.length === 0) {
    return null;
  }

  // Find Founder / Owner (matches role with founder, owner, director, managing)
  const founder = activeTeam.find((m) =>
    /founder|owner|director|managing/i.test(m.role)
  ) || activeTeam[0];

  const otherMembers = activeTeam.filter((m) => m.id !== founder.id);

  return (
    <div>
      {/* 1. FOUNDER / OWNER SPOTLIGHT */}
      {founder && (
        <FounderSpotlightCard
          founder={founder}
          businessPhone={siteData.business?.phone}
          businessWhatsApp={siteData.business?.whatsapp}
          businessEmail={siteData.business?.email}
        />
      )}

      {/* 2. OTHER TEAM MEMBERS */}
      {otherMembers.length > 0 && (
        <div>
          <div className="mb-8 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6F20E8] mb-1 block">
              Core Creative &amp; Production Crew
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Designers &bull; Machine Operators &bull; Installation Craftsmen
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Our multidisciplinary specialists operating state-of-the-art printers and fabrication machinery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {otherMembers.map((member, index) => (
              <RegularTeamMemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
