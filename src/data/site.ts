import siteContentJson from "./site-content.json";

// Re-export the type so other files can import it
export type SiteData = typeof siteContentJson;
export type BusinessInfo = SiteData["business"];
export type ServiceItem = SiteData["services"][number];
export type PortfolioItem = SiteData["portfolio"][number];
export type TeamMember = SiteData["team"][number];
export type TestimonialItem = SiteData["testimonials"][number];
export type FaqItem = SiteData["faqs"][number];

// siteData is the static JSON used for initial render and client components.
// When content is updated via the Admin Panel, the JSON file on disk is updated
// and Next.js will pick it up on the next server reload / revalidation.
export const siteData: SiteData = siteContentJson;
