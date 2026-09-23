import { Metadata } from "next";
import { siteData } from "@/data/site";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const service = siteData.services.find((s) => s.slug === resolvedParams.slug);
  
  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: `${service.title} | ${siteData.business.name}`,
    description: service.shortDescription,
  };
}

export async function generateStaticParams() {
  return siteData.services.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const service = siteData.services.find((s) => s.slug === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-40 pb-20 bg-secondary-bg border-b border-black/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={service.image}
            alt={service.title}
            fill
            priority
            className="object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              {service.category}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 drop-shadow-sm leading-[1.1]">
              {service.title.toUpperCase()}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed drop-shadow-sm">
              {service.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div className="aspect-video relative overflow-hidden rounded-sm shadow-2xl mb-12">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">About this Service</h2>
                <p className="text-gray-600 font-light leading-relaxed text-lg">
                  {service.description}
                </p>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-6">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 bg-card-bg p-6 rounded-sm border border-black/5">
                      <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                      <span className="text-gray-900 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <div className="bg-card-bg p-8 md:p-10 rounded-sm border border-black/5 sticky top-32 shadow-xl">
                <h4 className="text-2xl font-bold mb-4">Start Your Project</h4>
                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                  Get a custom quote for your {service.title.toLowerCase()} requirements. We respond within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="w-full bg-accent hover:bg-red-600 text-white px-6 py-4 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 mb-4 shadow-lg shadow-accent/20"
                >
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`https://wa.me/${siteData.business.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-transparent border border-black/20 text-gray-900 hover:bg-black/5 px-6 py-4 rounded-sm font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
