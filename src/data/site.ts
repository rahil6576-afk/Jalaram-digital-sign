import siteContentJson from "./site-content.json";

// Re-export the type so other files can import it
export type SiteData = typeof siteContentJson;
export type BusinessInfo = SiteData["business"];
export type ServiceItem = SiteData["services"][number];
export type PortfolioItem = SiteData["portfolio"][number];
export type TeamMember = SiteData["team"][number];
export type TestimonialItem = SiteData["testimonials"][number];
export type FaqItem = SiteData["faqs"][number];
export type MachineItem = SiteData["machines"][number];
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
      const runtimePath = path.join(process.cwd(), "data", "site-content.json");
      if (fs.existsSync(runtimePath)) {
        return JSON.parse(fs.readFileSync(runtimePath, "utf-8"));
      }
      const filePath = path.join(process.cwd(), "src", "data", "site-content.json");
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch {
      // safe fallback
    }
  }
  return siteContentJson as SiteData;
}

// Async server-side helper that queries live content from Supabase first
export async function getLiveSiteData(): Promise<SiteData> {
  try {
    const { getSupabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase");
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // 1. Fetch main site structure
        const { data, error } = await supabase
          .from("site_content")
          .select("content")
          .eq("id", "main")
          .maybeSingle();

        let baseData = (!error && data?.content && (data.content as SiteData).business)
          ? (data.content as SiteData)
          : getSiteData();

        // 2. Fetch services directly from the dedicated 'services' table in Supabase
        const { data: servicesRows, error: sErr } = await supabase
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true });

        if (!sErr && Array.isArray(servicesRows) && servicesRows.length > 0) {
          baseData = {
            ...baseData,
            services: servicesRows.map((row) => ({
              id: String(row.id),
              slug: row.slug || String(row.id),
              title: row.title,
              shortDescription: row.short_description || "",
              description: row.description || "",
              image: row.image || "",
              category: row.category || "",
              features: Array.isArray(row.features) ? row.features : [],
              featured: Boolean(row.featured),
              sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
            })),
          };
        }

        return baseData;
      }
    }
  } catch (err) {
    console.warn("Could not read live site data from Supabase:", err);
  }

  return getSiteData();
}

// Direct helper to query services directly from Supabase 'services' table
export async function getServicesFromSupabase(): Promise<ServiceItem[]> {
  try {
    const { getSupabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase");
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row) => ({
            id: String(row.id),
            slug: row.slug || String(row.id),
            title: row.title,
            shortDescription: row.short_description || "",
            description: row.description || "",
            image: row.image || "",
            category: row.category || "",
            features: Array.isArray(row.features) ? row.features : [],
            featured: Boolean(row.featured),
            sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
          }));
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch services from Supabase table:", err);
  }
  return (siteContentJson as SiteData).services || [];
}
