import { Metadata } from "next";
import { siteData, getSiteData } from "@/data/site";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { formatWhatsAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const data = getSiteData();
  const slug = decodeURIComponent(resolvedParams.slug || "").toLowerCase().trim();
  const service = data.services.find((s) =>
    (s.slug || "").toLowerCase().trim() === slug ||
    (s.id || "").toLowerCase().trim() === slug ||
    (s.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === slug
  );
  
  if (!service) {
    return {
      title: "Service Details | Jalaram Digital Sign",
    };
  }

  return {
    title: `${service.title} | ${data.business.name}`,
    description: service.shortDescription || `${service.title} services by Jalaram Digital Sign`,
  };
}

export async function generateStaticParams() {
  const data = getSiteData();
  return (data.services || []).map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const data = getSiteData();
  const slug = decodeURIComponent(resolvedParams.slug || "").toLowerCase().trim();
  
  const service = data.services.find((s) =>
    (s.slug || "").toLowerCase().trim() === slug ||
    (s.id || "").toLowerCase().trim() === slug ||
    (s.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === slug
  );

  if (!service) {
    return (
      <section className="pt-32 pb-24 min-h-[60vh] flex items-center justify-center text-center px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
          <p className="text-gray-500 mb-8 text-sm">The requested service details could not be located or may have been updated.</p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> View All Services
          </Link>
        </div>
      </section>
    );
  }

  const serviceImage = service.image ? encodeURI(service.image) : "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398036/jalaram/jalaram_flex-banner_1790398038042.webp";
  const featuresList = (service.features || []).filter(Boolean);

  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 bg-secondary-bg border-b border-black/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={serviceImage}
            alt={service.title}
            fill
            priority
            className="object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-6 uppercase tracking-widest text-xs sm:text-sm font-bold group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Services
          </Link>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/90 border border-purple-200/80 text-[#6F20E8] font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#6F20E8] shrink-0" />
              <span>{service.category}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 drop-shadow-sm leading-[1.1]">
              {service.title.toUpperCase()}
            </h1>
            {service.shortDescription && (
              <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed drop-shadow-sm">
                {service.shortDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div className="aspect-video relative overflow-hidden rounded-2xl shadow-2xl mb-12 bg-gray-100">
                <Image
                  src={serviceImage}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {service.description && (
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">About this Service</h2>
                  <p className="text-gray-600 font-light leading-relaxed text-lg">
                    {service.description}
                  </p>
                </div>
              )}

              {featuresList.length > 0 && (
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-6">Key Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {featuresList.map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 bg-card-bg p-6 rounded-xl border border-black/5 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                        <span className="text-gray-900 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <div className="bg-card-bg p-8 md:p-10 rounded-2xl border border-black/5 sticky top-32 shadow-xl">
                <h4 className="text-2xl font-bold mb-4">Start Your Project</h4>
                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                  Get a custom quote for your {service.title.toLowerCase()} requirements. We respond within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="w-full bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] hover:opacity-95 text-white px-6 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 mb-4 shadow-lg shadow-[#6F20E8]/25 min-h-[48px]"
                >
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={formatWhatsAppUrl(data?.business?.whatsapp, `Hello Jalaram Digital Sign, I would like to inquire about your ${service.title} service.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-transparent border border-black/20 text-gray-900 hover:bg-black/5 px-6 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center min-h-[48px]"
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
