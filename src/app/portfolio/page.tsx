"use client";

import { useState } from "react";
import { siteData } from "@/data/site";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function PortfolioPage() {
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(siteData.portfolio.map((p) => p.category)))];

  const filteredProjects = filter === "All" 
    ? siteData.portfolio 
    : siteData.portfolio.filter(p => p.category === filter);

  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-40 pb-20 bg-black border-b border-black/10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
            alt="Portfolio background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              Featured Projects • Recent Installations
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-white drop-shadow-lg leading-[1.1]">
              OUR <span className="text-accent">WORK.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
              Explore our recent projects, from large-scale signage installations to precision print jobs.
            </p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  filter === cat 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "bg-card-bg border border-black/10 text-foreground hover:border-black/30 hover:bg-black/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Link href={`/portfolio/${project.slug}`} className="group block relative overflow-hidden aspect-[4/3] bg-card-bg shadow-2xl rounded-sm">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
                      <span className="text-accent text-xs font-bold uppercase tracking-widest mb-3 block">
                        {project.category}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{project.title}</h3>
                      <div className="flex justify-between items-center mt-4">
                         <span className="text-sm text-gray-300 font-medium">{project.location}</span>
                         <span className="flex items-center gap-2 text-sm text-white uppercase tracking-wider font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                           View <ArrowRight className="w-4 h-4" />
                         </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
}
