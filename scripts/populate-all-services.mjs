import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const allRequestedServices = [
  {
    slug: "flex-printing",
    title: "Flex Printing",
    category: "Large Format",
    shortDescription: "Heavy-duty weather-resistant flex prints for high-impact outdoor commercial displays.",
    description: "Specialized flex printing engineered for extreme durability across outdoor weather conditions in Gandhinagar and Gujarat. Available in standard, star flex, and blackback flex with vibrant UV-stable solvent inks.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398036/jalaram/jalaram_flex-banner_1790398038042.webp",
    features: [
      "Weather-Resistant PVC Media",
      "Frontlit & Backlit Options",
      "Seamless High-Speed Solvent Print",
      "Vibrant Long-Lasting Inks"
    ],
    featured: true,
  },
  {
    slug: "vinyl-printing",
    title: "Vinyl Printing",
    category: "Signage & Branding",
    shortDescription: "Precision-cut self-adhesive vinyl graphics for shopfronts, glass, walls, and vehicles.",
    description: "High-resolution adhesive vinyl prints tailored for corporate branding, store window graphics, commercial decals, and indoor wall murals with protective matte or gloss overlaminate.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398057/jalaram/jalaram_vinyl-printing_1790398058572.webp",
    features: [
      "High-Grade Self-Adhesive Vinyl",
      "Matte & Gloss Lamination",
      "Waterproof & UV Fade Proof",
      "Precision Contour Machine Cut"
    ],
    featured: true,
  },
  {
    slug: "banner-printing",
    title: "Banner Printing",
    category: "Promotional & Events",
    shortDescription: "Eye-catching promotional banners for events, retail sales, and corporate conferences.",
    description: "Custom banner printing with reinforced border hemming and metal grommets. Ideal for exhibitions, grand openings, event stages, and promotional campaigns.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591595/jalaram/services/jalaram_service_banner-printing.jpg",
    features: [
      "Star Flex & Fabric Banners",
      "Reinforced Hems & Eyelets",
      "Exhibition & Stage Backdrops",
      "Fast Turnaround Delivery"
    ],
    featured: false,
  },
  {
    slug: "sign-board",
    title: "Sign Board",
    category: "Outdoor Signage",
    shortDescription: "Robust outdoor and indoor commercial sign boards built for decades of brand visibility.",
    description: "Durable structural business sign boards fabricated with precision metal frames, ACP sheets, and premium graphic faces for shops, offices, and industrial units.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591583/jalaram/services/jalaram_service_sign-board.jpg",
    features: [
      "Heavy-Duty MS / GI Structure",
      "ACP Sheet Base Cladding",
      "Rust-Proof Weather Coating",
      "Custom Commercial Dimensions"
    ],
    featured: false,
  },
  {
    slug: "led-sign-board",
    title: "LED Sign Board",
    category: "Illuminated Signage",
    shortDescription: "Bright, energy-efficient illuminated LED signs engineered for 24/7 visibility.",
    description: "Custom fabricated LED signage designed to give retail storefronts and corporate offices a commanding night-time presence across Gujarat with premium waterproof LEDs.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398007/jalaram/jalaram_3d-led-board_1790398009053.webp",
    features: [
      "High-Lumen Waterproof LEDs",
      "Energy-Efficient Power Drivers",
      "Day & Night Striking Visibility",
      "Multi-Year Warranty Protection"
    ],
    featured: true,
  },
  {
    slug: "acrylic-signage",
    title: "Acrylic Signage",
    category: "Architectural Signage",
    shortDescription: "Sleek laser-cut acrylic boards and 3D letters for sophisticated office reception areas.",
    description: "High-precision laser cut acrylic signs, corporate lobby logos, and branded architectural plaques with flame-polished edges and dimensional depth.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398009/jalaram/jalaram_acrylic-board_1790398010851.webp",
    features: [
      "Premium Cast Acrylic Sheets",
      "Laser-Cut Flame-Polished Edges",
      "Embossed 3D Letterforms",
      "Clear, Frosted & Mirror Finishes"
    ],
    featured: true,
  },
  {
    slug: "glow-sign-board",
    title: "Glow Sign Board",
    category: "Illuminated Signage",
    shortDescription: "Classic illuminated lightbox signage delivering even illumination and long service life.",
    description: "Backlit glow sign boxes fabricated with weather-sealed aluminum framing and high-diffusion backlit graphics for retail stores, clinics, and commercial complexes.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398038/jalaram/jalaram_glow-signs_1790398039933.webp",
    features: [
      "Extruded Aluminum Box Frame",
      "Translucent Backlit Flex Face",
      "Uniform Edge-to-Edge Glow",
      "Weather-Sealed Electricals"
    ],
    featured: true,
  },
  {
    slug: "3d-letter-signage",
    title: "3D Letter Signage",
    category: "Dimensional Branding",
    shortDescription: "Dimensional letters fabricated from acrylic, stainless steel, and titanium for modern facades.",
    description: "Handcrafted and CNC-machined 3D channel letters featuring optional halo-backlighting or face illumination, elevating exterior building facades and reception lobbies.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591584/jalaram/services/jalaram_service_3d-letter-signage.jpg",
    features: [
      "Acrylic, Stainless Steel & Brass",
      "Front-Lit, Halo-Lit & Backlit",
      "CNC Routed Precision Contours",
      "Deep Architectural Projection"
    ],
    featured: true,
  },
  {
    slug: "sunboard-printing",
    title: "Sunboard Printing",
    category: "Rigid Substrates",
    shortDescription: "Rigid, lightweight PVC sunboard prints perfect for retail branding and trade exhibitions.",
    description: "Direct-to-substrate UV printing and vinyl-mounted graphics on high-density foam sunboard. Provides sharp image fidelity with zero curling or wrinkling.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398054/jalaram/jalaram_uv-flatbed-printer-close-1080x600_1790398056052.webp",
    features: [
      "3mm to 10mm High-Density PVC",
      "Direct Flatbed UV Printing",
      "Rigid, Lightweight & Flat Display",
      "Ideal for In-Store POP & Expos"
    ],
    featured: false,
  },
  {
    slug: "roll-up-standee",
    title: "Roll-Up Standee",
    category: "Display Systems",
    shortDescription: "Portable roll-up pull banner standees for exhibitions, corporate events, and showrooms.",
    description: "Lightweight aluminum retractable standees paired with non-tearable grey-back photographic media. Easy to carry and assemble in seconds for sales presentations.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591582/jalaram/services/jalaram_service_roll-up-standee.jpg",
    features: [
      "6x3 ft & 6x2.5 ft Aluminum Base",
      "Non-Tearable Matte PET Film",
      "Padded Carry Bag Included",
      "Instant 30-Second Setup"
    ],
    featured: false,
  },
  {
    slug: "hoardings",
    title: "Hoardings",
    category: "Outdoor Media",
    shortDescription: "Large-format highway and city hoardings providing city-wide brand prominence.",
    description: "Full-scale outdoor hoarding solutions including flex printing, mounting, structural framing, and on-site illumination across Ahmedabad, Gandhinagar, and state highways.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398039/jalaram/jalaram_hoardings_1790398041158.webp",
    features: [
      "Massive Highway Billboard Sizes",
      "Heavy Wind-Load Structural Safety",
      "High-Resolution Outdoor Solvent",
      "End-to-End Gujarat Site Erection"
    ],
    featured: false,
  },
  {
    slug: "posters",
    title: "Posters",
    category: "Commercial Print",
    shortDescription: "High-definition promotional and decorative posters printed on premium art media.",
    description: "Vibrant color posters printed with rich saturation and fine text clarity. Suitable for film promotions, retail campaigns, events, and interior decor.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591585/jalaram/services/jalaram_service_posters.jpg",
    features: [
      "170 to 300 GSM Art Card & Synthetic",
      "Ultra-High Resolution Photographic DPI",
      "Gloss, Matte & Velvet Lamination",
      "Standard A3, A2, A1 to Custom Sizes"
    ],
    featured: false,
  },
  {
    slug: "stickers-and-labels",
    title: "Stickers & Labels",
    category: "Packaging & Decals",
    shortDescription: "Custom die-cut product stickers, packaging labels, and commercial decals.",
    description: "Precision-cut adhesive stickers for jars, bottles, retail packaging, and promotional branding. Resistant to moisture, oil, and outdoor handling.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591585/jalaram/services/jalaram_service_stickers-and-labels.jpg",
    features: [
      "Waterproof & Scratch-Resistant Vinyl",
      "Custom Die-Cut Shapes & Sizes",
      "Metallic, Foil & Clear Transparents",
      "Roll or Kiss-Cut Sheet Supply"
    ],
    featured: false,
  },
  {
    slug: "pamphlet-flyer-printing",
    title: "Pamphlet / Flyer Printing",
    category: "Marketing Collateral",
    shortDescription: "Cost-effective promotional pamphlets and multi-fold flyers for mass marketing.",
    description: "High-volume flyer and pamphlet printing with sharp text and true-to-life colors. Ideal for newspaper inserts, door-to-door campaigns, and retail promotions.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591586/jalaram/services/jalaram_service_pamphlet-flyer-printing.jpg",
    features: [
      "90 to 170 GSM Gloss & Art Paper",
      "Single & Double Sided Offset Runs",
      "Bi-Fold, Tri-Fold & Custom Creasing",
      "High-Volume Mass Distribution"
    ],
    featured: false,
  },
  {
    slug: "visiting-cards",
    title: "Visiting Cards",
    category: "Corporate Identity",
    shortDescription: "Luxury business cards with premium tactile finishes that leave a lasting impression.",
    description: "Executive business visiting cards crafted with premium imported card stocks, spot UV varnish, metallic foil embossing, and velvety matte lamination.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591587/jalaram/services/jalaram_service_visiting-cards.jpg",
    features: [
      "350+ GSM Heavyweight Card Stock",
      "Spot UV, Gold & Silver Foil Emboss",
      "Velvet Touch & Textured Paper",
      "Round Edge & Square Cut Finish"
    ],
    featured: false,
  },
  {
    slug: "letterheads",
    title: "Letterheads",
    category: "Corporate Stationery",
    shortDescription: "Official corporate letterheads printed on smooth, high-grade bond papers.",
    description: "Professional company letterheads printed with non-bleed inks suitable for smooth everyday office laser and inkjet printing.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591588/jalaram/services/jalaram_service_letterheads.jpg",
    features: [
      "100 to 120 GSM Sunshine / Bond Paper",
      "Laser & Inkjet Printer Compatible",
      "Accurate Corporate Color Matching",
      "Crisp Executive Letterhead Layout"
    ],
    featured: false,
  },
  {
    slug: "invitation-cards",
    title: "Invitation Cards",
    category: "Special Occasions",
    shortDescription: "Bespoke invitation cards with ornate textures, gold foil, and laser-cut details.",
    description: "Exclusive designer invitation cards for Gujarati weddings, corporate inaugurations, and religious ceremonies, crafted on rich specialty handmade papers.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591589/jalaram/services/jalaram_service_invitation-cards.jpg",
    features: [
      "Embossed & Laser-Cut Filigree Patterns",
      "Gold Foil Stamping & Silk Texture",
      "Custom Die-Cut Envelopes",
      "Weddings, Invitations & Corporate Galas"
    ],
    featured: false,
  },
  {
    slug: "name-plates-acrylic-ss",
    title: "Name Plates – Acrylic / SS",
    category: "Residential & Corporate",
    shortDescription: "Architectural name plates in stainless steel and acrylic for homes, bungalows, and offices.",
    description: "Modern name plates designed with laser-cut acrylic and brushed or mirror-finish stainless steel. Weatherproof, elegant, and built to withstand outdoor sun and rain.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591589/jalaram/services/jalaram_service_name-plates-acrylic-ss.jpg",
    features: [
      "304 Grade Stainless Steel & Acrylic",
      "Chemical Acid Etching & Laser Cutting",
      "Polished Gold, Rose Gold & Silver",
      "Rustproof Brass Stud Mounts"
    ],
    featured: false,
  },
  {
    slug: "vehicle-graphics",
    title: "Vehicle Graphics",
    category: "Fleet Branding",
    shortDescription: "Mobile advertising with full vehicle wraps and precision commercial fleet branding.",
    description: "Turn company vehicles into rolling billboards across Gujarat with high-grade cast vinyl wraps, door decals, and commercial fleet branding.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591590/jalaram/services/jalaram_service_vehicle-graphics.jpg",
    features: [
      "Cast Automotive Vinyl Wraps",
      "Commercial Vans, Autos & Trucks",
      "UV Protective Clear Overlaminate",
      "Residue-Free Clean Removal"
    ],
    featured: false,
  },
  {
    slug: "bag-printing",
    title: "Bag Printing",
    category: "Retail Packaging",
    shortDescription: "Eco-friendly custom printed paper and non-woven carry bags for retail stores.",
    description: "Custom printed shopping carry bags for boutiques, jewellery showrooms, grocery chains, and retail stores, providing mobile brand visibility.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591591/jalaram/services/jalaram_service_bag-printing.jpg",
    features: [
      "Non-Woven D-Cut & W-Cut Bags",
      "Eco-Friendly Kraft & Art Paper Bags",
      "Screen & Flexographic Printing",
      "Durable Heavy Weight Capacity"
    ],
    featured: false,
  },
  {
    slug: "graphic-designing",
    title: "Graphic Designing",
    category: "Creative Studio",
    shortDescription: "Professional creative artwork, logo design, and print-ready technical layouts.",
    description: "In-house graphic design studio specializing in logo design, brand guideline development, outdoor signage visualization, and high-resolution print prepress.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591591/jalaram/services/jalaram_service_graphic-designing.jpg",
    features: [
      "Vector Logo & Brand Identity Creation",
      "Print-Ready CMYK Production Files",
      "Gujarati & English Creative Typography",
      "3D Architecture Signage Mockups"
    ],
    featured: false,
  },
  {
    slug: "installation-services",
    title: "Installation Services",
    category: "Field Execution",
    shortDescription: "Expert on-site signage fabrication, structural mounting, and height installations.",
    description: "Professional field installation crews equipped for high-altitude mounting, facade cladding, electrical connections, and maintenance across all districts of Gujarat.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591592/jalaram/services/jalaram_service_installation-services.jpg",
    features: [
      "Trained Riggers & Signage Scaffolders",
      "High-Rise Boom Lift & Crane Operations",
      "On-Site Structural Welding & Wiring",
      "Gujarat-Wide Rapid Deployment"
    ],
    featured: false,
  },
  {
    slug: "one-way-print",
    title: "One way Print",
    category: "Glass & Privacy",
    shortDescription: "One-way vision perforated glass graphics offering external advertising and internal privacy.",
    description: "Specialized perforated vinyl films for glass facades, office cabins, and showroom windows that display high-definition graphics to the outside while preserving outdoor vision from inside.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398006/jalaram/jalaram_1-way-vision-print_1790398007861.webp",
    features: [
      "Micro-Perforated Window Film",
      "Full Exterior Graphic Display",
      "Clear Outward See-Through View",
      "Solar Heat & Glare Reduction"
    ],
    featured: false,
  },
  {
    slug: "frosted",
    title: "Frosted",
    category: "Office Glass Decor",
    shortDescription: "Decorative frosted film for office partitions, glass doors, and privacy screening.",
    description: "Architectural glass frosting films custom cut with geometric stripes, company logos, and frosted designs for executive cabins and corporate conference rooms.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790591594/jalaram/services/jalaram_service_frosted-film.jpg",
    features: [
      "Translucent Sandblast & Dusted Finish",
      "Computerized Plotter-Cut Patterns",
      "Cabin & Conference Room Privacy",
      "Custom Company Logo Cutouts"
    ],
    featured: false,
  },
  {
    slug: "digital-printing",
    title: "Digital Printing",
    category: "Digital Print",
    shortDescription: "High-speed high-resolution commercial digital printing for immediate business needs.",
    description: "Sharp, rich commercial digital printing for corporate brochures, marketing handouts, manuals, certificates, and short-run promotional requirements.",
    image: "https://res.cloudinary.com/v61ii2hr/image/upload/v1790398035/jalaram/jalaram_digital-printing_1790398036942.webp",
    features: [
      "High-Speed Same-Day Production",
      "Exceptional Color Precision",
      "Variable Data & Numbering Print",
      "Custom Paper Stocks & Textures"
    ],
    featured: true,
  }
];

async function updateServicesData() {
  const seedPath = path.join(rootDir, "src", "data", "site-content.json");
  const runtimePath = path.join(rootDir, "data", "site-content.json");

  let currentData = {};
  if (fs.existsSync(runtimePath)) {
    currentData = JSON.parse(fs.readFileSync(runtimePath, "utf-8"));
  } else if (fs.existsSync(seedPath)) {
    currentData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  }

  // Ensure each service has an id and sortOrder
  const finalizedServices = allRequestedServices.map((svc, idx) => ({
    id: String(idx + 1),
    ...svc,
    sortOrder: idx + 1,
  }));

  currentData.services = finalizedServices;

  // Save to both files
  fs.writeFileSync(seedPath, JSON.stringify(currentData, null, 2), "utf-8");
  console.log(`✅ Saved ${finalizedServices.length} services to src/data/site-content.json`);

  if (fs.existsSync(path.dirname(runtimePath))) {
    fs.writeFileSync(runtimePath, JSON.stringify(currentData, null, 2), "utf-8");
    console.log(`✅ Saved ${finalizedServices.length} services to data/site-content.json`);
  }

  // Also sync to Supabase if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error } = await supabase
        .from("site_content")
        .upsert({ id: "main", content: currentData, updated_at: new Date().toISOString() });

      if (error) {
        console.warn("⚠️ Supabase sync warning:", error.message);
      } else {
        console.log("✅ Synced updated services directly to Supabase site_content table!");
      }
    } catch (err) {
      console.warn("⚠️ Supabase sync error:", err.message);
    }
  }
}

updateServicesData().catch(console.error);
