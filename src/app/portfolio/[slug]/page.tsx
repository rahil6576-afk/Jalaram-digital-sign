import { Metadata } from "next";
import { siteData, getSiteData } from "@/data/site";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const data = getSiteData();
  const slug = decodeURIComponent(resolvedParams.slug || "").toLowerCase().trim();
  const project = data.portfolio.find((p) =>
    (p.slug || "").toLowerCase().trim() === slug ||
    (p.id || "").toLowerCase().trim() === slug ||
    (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === slug
  );
  
  if (!project) {
    return {
      title: "Project Details | Jalaram Digital Sign",
    };
  }

  return {
    title: `${project.title} | ${data.business.name}`,
    description: project.description || `${project.title} - ${project.category} in ${project.location}`,
  };
}

export async function generateStaticParams() {
  const data = getSiteData();
  return (data.portfolio || []).map((project) => ({
    slug: project.slug,
  }));
}

export default async function PortfolioDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const data = getSiteData();
  const slug = decodeURIComponent(resolvedParams.slug || "").toLowerCase().trim();
  
  const project = data.portfolio.find((p) =>
    (p.slug || "").toLowerCase().trim() === slug ||
    (p.id || "").toLowerCase().trim() === slug ||
    (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === slug
  );

  if (!project) {
    return (
      <section className="pt-32 pb-24 min-h-[60vh] flex items-center justify-center text-center px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-500 mb-8 text-sm">The requested project details could not be located or may have been updated.</p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> View All Projects
          </Link>
        </div>
      </section>
    );
  }

  const coverImage = project.image ? encodeURI(project.image) : "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp";
  const galleryImages = (project.images || []).filter(Boolean);

  return (
    <>
      <section className="pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 bg-background relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-8 sm:mb-12 uppercase tracking-widest text-sm font-bold group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
          </Link>
          
          <div className="max-w-4xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/90 border border-purple-200/80 text-[#6F20E8] font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#6F20E8] shrink-0" />
              <span>{project.category} • {project.location}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 drop-shadow-sm leading-[1.1]">
              {project.title.toUpperCase()}
            </h1>
            {project.description && (
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed drop-shadow-sm">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-1 md:col-span-2 aspect-[21/9] bg-card-bg relative overflow-hidden rounded-2xl shadow-2xl">
               <Image
                 src={coverImage}
                 alt={project.title}
                 fill
                 priority
                 className="object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
            {galleryImages.map((img, idx) => (
              <div key={idx} className="aspect-[4/3] bg-card-bg relative overflow-hidden rounded-2xl shadow-xl">
                 <Image
                   src={encodeURI(img)}
                   alt={`${project.title} gallery image ${idx + 1}`}
                   fill
                   className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                 />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-32 bg-secondary-bg border-t border-black/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-accent/5 mix-blend-overlay pointer-events-none" />
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter mb-6 sm:mb-8">
             Have a similar project in mind?
           </h2>
           <Link
             href="/contact"
             className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6F20E8] to-[#8A3FFC] text-white hover:opacity-95 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all text-sm uppercase tracking-widest shadow-xl shadow-[#6F20E8]/25 min-h-[48px]"
           >
             Get a Quote <ArrowRight className="w-5 h-5" />
           </Link>
         </div>
      </section>
    </>
  );
}
