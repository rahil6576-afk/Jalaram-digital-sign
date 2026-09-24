"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { TeamMember } from "@/data/site";

interface TeamGridProps {
  team: TeamMember[];
}

function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  const [isTapped, setIsTapped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer select-none"
      onClick={() => setIsTapped((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-label={`${member.name}, ${member.role}`}
    >
      <div className="aspect-[3/4] bg-card-bg mb-6 relative overflow-hidden border border-black/5 shadow-xl rounded-sm">
        {/* Photo Container with Scroll-Triggered Color-In Animation on Mobile + Hover on Desktop */}
        <motion.div
          initial={{ filter: "grayscale(100%)" }}
          whileInView={{ filter: "grayscale(0%)" }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={member.image}
            alt={member.name}
            fill
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              isTapped ? "scale-105" : ""
            }`}
          />
        </motion.div>

        {/* Gradient Overlay that gently fades as color blooms in */}
        <motion.div
          initial={{ opacity: 0.65 }}
          whileInView={{ opacity: 0.15 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-10 ${
            isTapped ? "opacity-10" : ""
          }`}
        />
      </div>

      <h3 className="text-2xl font-bold mb-1 text-gray-900 group-hover:text-[#6F20E8] transition-colors">
        {member.name}
      </h3>
      <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-sm font-bold uppercase tracking-widest mb-3">
        {member.role}
      </p>
      <p className="text-gray-600 text-sm leading-relaxed">
        {member.bio}
      </p>
    </motion.div>
  );
}

export default function TeamGrid({ team }: TeamGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {team.map((member, index) => (
        <TeamMemberCard key={member.id} member={member} index={index} />
      ))}
    </div>
  );
}
