import { Metadata } from "next";
import { siteData } from "@/data/site";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: `Our Services | ${siteData.business.name}`,
  description: "Explore our range of digital printing, large format banners, LED signage, and visual branding services.",
};

export default function ServicesPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-40 pb-20 bg-secondary-bg border-b border-black/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
            alt="Services background"
            fill
            priority
            className="object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              Capabilities • Materials • Solutions
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 drop-shadow-sm text-foreground leading-[1.1]">
              WHAT WE <span className="text-accent">CREATE.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed drop-shadow-sm">
              Comprehensive visual branding and printing solutions designed to get your business noticed.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {siteData.services.map((service, index) => (
              <Link key={service.id} href={`/services/${service.slug}`} className="group block">
                <div className="bg-card-bg h-full border border-black/5 rounded-sm overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:border-accent/50 transition-all duration-300">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute top-6 right-6 text-white/90 text-4xl font-bold tracking-tighter drop-shadow-md">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="absolute bottom-6 left-6 text-3xl font-bold text-white drop-shadow-md pr-12">{service.title}</h3>
                  </div>
                  
                  <div className="p-8 md:p-10 flex flex-col flex-grow">
                    <p className="text-gray-600 mb-8 leading-relaxed flex-grow text-lg">
                      {service.shortDescription}
                    </p>
                    
                    {/* Features List */}
                    <ul className="mb-8 space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 font-medium flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent group-hover:text-black transition-colors">
                      View Details <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-8 drop-shadow-xl">
            Need something custom?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 font-medium drop-shadow-md">
            We handle custom requests and specialized printing projects of all sizes.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-900 px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest shadow-2xl"
          >
            Discuss Your Project <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
