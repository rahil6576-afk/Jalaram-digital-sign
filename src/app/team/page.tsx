import { Metadata } from "next";
import { siteData } from "@/data/site";
import Image from "next/image";

export const metadata: Metadata = {
  title: `Our Team | ${siteData.business.name}`,
  description: "Meet the people behind the premium printing and signage solutions.",
};

export default function TeamPage() {
  return (
    <>
      <section className="pt-40 pb-20 bg-black border-b border-black/10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
            alt="Team background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              Meet The Experts • Craftsmanship &amp; Precision
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-white drop-shadow-lg leading-[1.1]">
              THE PEOPLE BEHIND <br /> THE <span className="text-accent">PRINT.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed max-w-2xl drop-shadow-md">
              Great visual work comes from people who care about every detail.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {siteData.team.map((member) => (
              <div key={member.id} className="group">
                <div className="aspect-[3/4] bg-card-bg mb-6 relative overflow-hidden border border-black/5 shadow-xl rounded-sm">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out filter grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-10 transition-opacity duration-500" />
                </div>
                <h3 className="text-2xl font-bold mb-1 text-gray-900">{member.name}</h3>
                <p className="text-accent text-sm font-bold uppercase tracking-widest mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
