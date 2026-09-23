import { siteData } from "@/data/site";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function generateMetadata() {
  return {
    title: `About Us | ${siteData.business.name}`,
    description: siteData.aboutPage.heroSubtitle,
  };
}

export default function AboutPage() {
  const about = siteData.aboutPage;
  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-40 pb-20 bg-black border-b border-black/10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={about.heroImage}
            alt="About us background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              {about.heroTagline}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-white drop-shadow-lg leading-[1.1]">
              {about.heroHeadline.replace("STORY.", "")}
              <span className="text-accent">STORY.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
              {about.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* STORY & APPROACH */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square md:aspect-[4/3] bg-card-bg overflow-hidden rounded-sm group shadow-2xl">
              <Image
                src={about.storyImage}
                alt="Printing Workshop"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute top-0 left-0 w-2 h-full bg-accent z-10" />
            </div>

            <div className="flex flex-col gap-8">
              <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] border-l-2 border-accent pl-4">
                Our Story &amp; Craft
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight text-foreground">
                {about.storyHeadline}
              </h2>
              <div className="space-y-4 text-lg text-gray-600 font-light leading-relaxed">
                <p>{about.storyParagraph1}</p>
                <p>{about.storyParagraph2}</p>
                <p>{about.storyParagraph3}</p>
              </div>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-foreground font-bold uppercase tracking-widest hover:text-accent transition-colors group"
                >
                  Work With Us <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUALITY & CAPABILITIES */}
      <section className="py-24 md:py-32 bg-secondary-bg border-y border-black/5 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              Built For Precision
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
              {about.qualityHeadline}
            </h2>
            <p className="text-gray-600 font-light text-lg">{about.qualitySubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {about.qualityPoints.map((item, i) => (
              <div key={i} className="bg-card-bg p-8 md:p-10 border border-black/5 rounded-sm shadow-xl hover:border-accent/50 transition-colors duration-300">
                <CheckCircle2 className="w-10 h-10 text-accent mb-6" />
                <h3 className="text-xl font-bold mb-4 text-foreground">{item.title}</h3>
                <p className="text-gray-600 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 mix-blend-overlay" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            {about.ctaHeadline}
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-accent hover:bg-red-600 text-white px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest shadow-xl shadow-accent/20"
          >
            Get in Touch <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
