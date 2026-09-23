import siteContentJson from "./site-content.json";

// Re-export the type so other files can import it
export type SiteData = typeof siteContentJson;
export type BusinessInfo = SiteData["business"];
export type ServiceItem = SiteData["services"][number];
export type PortfolioItem = SiteData["portfolio"][number];
export type TeamMember = SiteData["team"][number];
export type TestimonialItem = SiteData["testimonials"][number];
export type FaqItem = SiteData["faqs"][number];
export interface ClientItem {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
}

// Baseline static JSON for initial SSR / fallback
export const siteData: SiteData = siteContentJson;

// Server-side helper to read latest live content from disk
export function getSiteData(): SiteData {
  if (typeof window === "undefined") {
    try {
      // Dynamic require prevents client bundler issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const filePath = path.join(process.cwd(), "src", "data", "site-content.json");
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch {
      // safe fallback
    }
  }
  return siteContentJson;
}
