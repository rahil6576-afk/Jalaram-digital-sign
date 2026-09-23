import { Metadata } from "next";
import { siteData } from "@/data/site";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const project = siteData.portfolio.find((p) => p.slug === resolvedParams.slug);
  
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | ${siteData.business.name}`,
    description: project.description,
  };
}

export async function generateStaticParams() {
  return siteData.portfolio.map((project) => ({
    slug: project.slug,
  }));
}

export default async function PortfolioDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const project = siteData.portfolio.find((p) => p.slug === resolvedParams.slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <section className="pt-40 pb-20 bg-background relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-12 uppercase tracking-widest text-sm font-bold group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
          </Link>
          
          <div className="max-w-4xl mb-16">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              {project.category} • {project.location}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 drop-shadow-sm leading-[1.1]">
              {project.title.toUpperCase()}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed drop-shadow-sm">
              {project.description}
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-1 md:col-span-2 aspect-[21/9] bg-card-bg relative overflow-hidden rounded-sm shadow-2xl">
               <Image
                 src={project.image}
                 alt={project.title}
                 fill
                 priority
                 className="object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
            {project.images.map((img, idx) => (
              <div key={idx} className="aspect-[4/3] bg-card-bg relative overflow-hidden rounded-sm shadow-xl">
                 <Image
                   src={img}
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
      <section className="py-24 md:py-32 bg-secondary-bg border-t border-black/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-accent/5 mix-blend-overlay pointer-events-none" />
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8">
             Have a similar project in mind?
           </h2>
           <Link
             href="/contact"
             className="inline-flex items-center gap-2 bg-accent text-gray-900 hover:bg-red-600 px-10 py-5 rounded-sm font-bold transition-all text-sm uppercase tracking-widest shadow-xl shadow-accent/20"
           >
             Get a Quote <ArrowRight className="w-5 h-5" />
           </Link>
         </div>
      </section>
    </>
  );
}
