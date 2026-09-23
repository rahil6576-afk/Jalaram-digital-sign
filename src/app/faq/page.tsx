"use client";

import { useState } from "react";
import { siteData } from "@/data/site";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <section className="pt-40 pb-20 bg-secondary-bg border-b border-black/5 relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              Help &amp; Support • Common Queries
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-foreground leading-[1.1]">
              FREQUENTLY ASKED <br className="hidden md:block" /> <span className="text-accent">QUESTIONS.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-2xl">
              Everything you need to know about our printing, signage, and installation services.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {siteData.faqs.map((faq, index) => (
                <div 
                  key={faq.id} 
                  className="bg-card-bg border border-black/5 rounded-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none"
                    aria-expanded={openIndex === index}
                  >
                    <span className="font-bold text-lg">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-accent transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed pt-2 border-t border-black/5">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link
                href="/contact"
                className="text-gray-900 hover:text-accent font-bold uppercase tracking-widest text-sm transition-colors border-b border-accent pb-1"
              >
                Contact our support team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
