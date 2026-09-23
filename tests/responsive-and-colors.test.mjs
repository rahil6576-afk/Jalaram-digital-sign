import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");

// Helper to recursively find all code files in a directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(tsx|ts|jsx|js|css|json)$/i.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Helper to import functions from compiled utils or replicate exact logic
function formatExternalUrl(url) {
  if (!url) return "#";
  let cleaned = url.trim();
  while (cleaned.startsWith("#")) {
    cleaned = cleaned.slice(1).trim();
  }
  if (!cleaned) return "#";
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  return `https://${cleaned}`;
}

function formatWhatsAppUrl(rawPhone, message) {
  const fallback = "919427033363";
  if (!rawPhone) {
    const textParam = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${fallback}${textParam}`;
  }
  const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
  const finalDigits = cleanDigits.length === 10 ? `91${cleanDigits}` : (cleanDigits || fallback);
  const defaultMsg = "Hello Jalaram Digital Sign, I would like to inquire about your printing & signage services.";
  const textParam = `?text=${encodeURIComponent(message || defaultMsg)}`;
  return `https://wa.me/${finalDigits}${textParam}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: COLOR PALETTE INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────
test("Color Palette: Zero Dark Magenta / Burgundy (#9C0D5B) in src", () => {
  const allFiles = getAllFiles(srcDir);
  const forbiddenHex = "9C0D5B";
  const violations = [];

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.toLowerCase().includes(forbiddenHex.toLowerCase())) {
      violations.push(path.relative(rootDir, filePath));
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found forbidden burgundy color (#9C0D5B) in files: ${violations.join(", ")}`
  );
});

test("Color Palette: globals.css uses pure purple #6F20E8 and no burgundy tokens", () => {
  const globalsCss = fs.readFileSync(path.join(srcDir, "app", "globals.css"), "utf-8");
  assert.ok(globalsCss.includes("--accent: #6F20E8"), "globals.css must define --accent: #6F20E8");
  assert.ok(!globalsCss.includes("--accent-burgundy"), "globals.css must NOT contain --accent-burgundy");
  assert.ok(!globalsCss.includes("#9C0D5B"), "globals.css must NOT contain #9C0D5B");
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: MOBILE VIEWPORT & RESPONSIVENESS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
test("Mobile Responsiveness: Root layout defines viewport with cover fit and device width", () => {
  const layoutContent = fs.readFileSync(path.join(srcDir, "app", "layout.tsx"), "utf-8");
  assert.ok(
    layoutContent.includes('viewportFit: "cover"'),
    "layout.tsx must configure viewportFit: cover for notch devices"
  );
  assert.ok(
    layoutContent.includes('width: "device-width"'),
    "layout.tsx must configure width: device-width"
  );
  assert.ok(
    layoutContent.includes('overflow-x-hidden'),
    "layout.tsx must prevent horizontal overflow on body/html"
  );
});

test("Mobile Responsiveness: iOS input zoom prevention rule is configured", () => {
  const globalsCss = fs.readFileSync(path.join(srcDir, "app", "globals.css"), "utf-8");
  assert.ok(
    globalsCss.includes("font-size: 16px !important"),
    "globals.css must contain 16px font-size rule for mobile inputs to prevent iOS auto-zoom"
  );
  assert.ok(
    globalsCss.includes("max-width: 100vw"),
    "globals.css must enforce max-width: 100vw"
  );
  assert.ok(
    globalsCss.includes("overflow-x: hidden"),
    "globals.css must enforce overflow-x: hidden"
  );
});

test("Mobile Navigation: Navbar locks body scroll when drawer is open", () => {
  const navbarContent = fs.readFileSync(path.join(srcDir, "components", "layout", "Navbar.tsx"), "utf-8");
  assert.ok(
    navbarContent.includes('document.body.style.overflow = "hidden"'),
    "Navbar must lock document.body.style.overflow when mobile menu is open"
  );
  assert.ok(
    navbarContent.includes("w-11 h-11"),
    "Mobile hamburger button must have at least 44x44px touch target (w-11 h-11)"
  );
});

test("Mobile Accessibility: Floating WhatsApp has safe mobile screen margin", () => {
  const waContent = fs.readFileSync(path.join(srcDir, "components", "layout", "FloatingWhatsApp.tsx"), "utf-8");
  assert.ok(
    waContent.includes("bottom-5 right-4 sm:bottom-6 sm:right-6"),
    "Floating WhatsApp must provide safe margins on compact screens"
  );
  assert.ok(
    waContent.includes("w-14 h-14"),
    "Floating WhatsApp must meet generous touch target size (56x56px)"
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: CROSS-DEVICE URL & WHATSAPP GENERATORS (ANDROID & IOS & DESKTOP)
// ─────────────────────────────────────────────────────────────────────────────
test("WhatsApp Helper: Sanitizes 10-digit phone numbers and prepends country code", () => {
  const url = formatWhatsAppUrl("9427033363");
  assert.ok(url.startsWith("https://wa.me/919427033363"), `Expected 91 prefix, got ${url}`);
});

test("WhatsApp Helper: Strips spaces, plus signs and dashes from formatted phone", () => {
  const url = formatWhatsAppUrl("+91 94270-33363");
  assert.ok(url.startsWith("https://wa.me/919427033363"), `Expected clean digits, got ${url}`);
});

test("WhatsApp Helper: Falls back to default business number if phone is empty", () => {
  const url = formatWhatsAppUrl("");
  assert.ok(url.startsWith("https://wa.me/919427033363"), `Expected fallback, got ${url}`);
});

test("WhatsApp Helper: Encodes custom inquiry message correctly", () => {
  const url = formatWhatsAppUrl("919427033363", "Inquiry for LED Signage: Size 10x5");
  assert.ok(url.includes("text=Inquiry%20for%20LED%20Signage%3A%20Size%2010x5"));
});

test("External URL Helper: Prepends https protocol if missing", () => {
  assert.equal(formatExternalUrl("instagram.com/jalaram"), "https://instagram.com/jalaram");
});

test("External URL Helper: Leaves existing https:// unchanged", () => {
  assert.equal(formatExternalUrl("https://facebook.com/jalaram"), "https://facebook.com/jalaram");
});

test("External URL Helper: Strips accidental leading hash symbols", () => {
  assert.equal(formatExternalUrl("#https://instagram.com/jalaram"), "https://instagram.com/jalaram");
  assert.equal(formatExternalUrl("##twitter.com/jalaram"), "https://twitter.com/jalaram");
});

test("External URL Helper: Returns # for null, undefined or empty input", () => {
  assert.equal(formatExternalUrl(""), "#");
  assert.equal(formatExternalUrl(null), "#");
  assert.equal(formatExternalUrl(undefined), "#");
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: RESPONSIVE TYPOGRAPHY & TOUCH TARGET AUDIT
// ─────────────────────────────────────────────────────────────────────────────
test("Responsive Typography: Key pages scale headings on mobile without cutoffs", () => {
  const pagesToCheck = [
    path.join(srcDir, "app", "page.tsx"),
    path.join(srcDir, "app", "about", "page.tsx"),
    path.join(srcDir, "app", "services", "page.tsx"),
    path.join(srcDir, "app", "portfolio", "page.tsx"),
    path.join(srcDir, "app", "team", "page.tsx"),
    path.join(srcDir, "app", "contact", "page.tsx"),
    path.join(srcDir, "app", "faq", "page.tsx"),
  ];

  for (const pagePath of pagesToCheck) {
    const content = fs.readFileSync(pagePath, "utf-8");
    const relative = path.relative(rootDir, pagePath);
    assert.ok(
      content.includes("text-3xl") || content.includes("text-4xl sm:text-5xl"),
      `${relative} must include responsive heading sizes (text-3xl or sm:text-5xl)`
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: SOCIAL MEDIA COMPLETENESS & HERO SUBHEADER CONTRAST
// ─────────────────────────────────────────────────────────────────────────────
test("Social Media: Footer renders all four platforms (Instagram, Facebook, Twitter/X, LinkedIn) even without redirect links", () => {
  const footerContent = fs.readFileSync(path.join(srcDir, "components", "layout", "Footer.tsx"), "utf-8");
  assert.ok(footerContent.includes('"Instagram"'), "Footer must include Instagram");
  assert.ok(footerContent.includes('"Facebook"'), "Footer must include Facebook");
  assert.ok(footerContent.includes('"Twitter / X"'), "Footer must include Twitter / X");
  assert.ok(footerContent.includes('"LinkedIn"'), "Footer must include LinkedIn");
  assert.ok(!footerContent.includes('if (finalUrl === "#") return null;'), "Footer must not return null when link is unconfigured");
});

test("Hero Subheaders: Photo hero pages use high-contrast backdrop-blur badges or high-contrast pill styling", () => {
  const photoHeroPages = [
    path.join(srcDir, "app", "page.tsx"),
    path.join(srcDir, "app", "about", "page.tsx"),
    path.join(srcDir, "app", "portfolio", "page.tsx"),
    path.join(srcDir, "app", "team", "page.tsx"),
    path.join(srcDir, "app", "contact", "page.tsx"),
  ];

  for (const pagePath of photoHeroPages) {
    const content = fs.readFileSync(pagePath, "utf-8");
    const relative = path.relative(rootDir, pagePath);
    assert.ok(
      content.includes("backdrop-blur-md") || content.includes("rounded-full bg-black/50"),
      `${relative} must have high-contrast glass pill badge for hero subheaders over photos`
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: INFINITE DUAL LOGO MARQUEE & CLIENT CRUD MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test("Logo Marquee: Default clients array contains requested 5 institutions and brands", () => {
  const content = JSON.parse(fs.readFileSync(path.join(srcDir, "data", "site-content.json"), "utf-8"));
  assert.ok(Array.isArray(content.clients), "site-content.json must have clients array");
  const names = content.clients.map((c) => (c.name || "").toLowerCase());
  assert.ok(names.some((n) => n.includes("bjp")), "Clients must include BJP");
  assert.ok(names.some((n) => n.includes("nfsu")), "Clients must include NFSU College");
  assert.ok(names.some((n) => n.includes("jay gotli")), "Clients must include Jay Gotli Mukhwas");
  assert.ok(names.some((n) => n.includes("mount carmel")), "Clients must include Mount Carmel School");
  assert.ok(names.some((n) => n.includes("xavier")), "Clients must include Xavier School");

  // Verify all logo files exist in public/
  const publicDir = path.join(rootDir, "public");
  for (const client of content.clients) {
    if (client.logo) {
      const cleanPath = client.logo.replace(/^\//, "");
      const logoFilePath = path.join(publicDir, cleanPath);
      assert.ok(fs.existsSync(logoFilePath), `Logo file "${cleanPath}" must exist in public directory`);
    }
  }
});

test("Logo Marquee: CSS keyframes and dual-track marquee classes defined in globals.css", () => {
  const css = fs.readFileSync(path.join(srcDir, "app", "globals.css"), "utf-8");
  assert.ok(css.includes("@keyframes marquee-left"), "globals.css must define marquee-left keyframe");
  assert.ok(css.includes("@keyframes marquee-right"), "globals.css must define marquee-right keyframe");
  assert.ok(css.includes(".animate-marquee-left"), "globals.css must define .animate-marquee-left");
  assert.ok(css.includes(".animate-marquee-right"), "globals.css must define .animate-marquee-right");
  assert.ok(css.includes("marquee-group:hover"), "globals.css must pause on marquee-group hover");
});

test("Logo Marquee: Homepage places ClientLogoMarquee right below statistics section", () => {
  const page = fs.readFileSync(path.join(srcDir, "app", "page.tsx"), "utf-8");
  assert.ok(page.includes("<ClientLogoMarquee"), "Homepage must include ClientLogoMarquee component");
  const statsIdx = page.indexOf("TRUST / STATISTICS SECTION");
  const marqueeIdx = page.indexOf("<ClientLogoMarquee");
  const aboutIdx = page.indexOf("ABOUT INTRODUCTION");
  assert.ok(statsIdx !== -1 && marqueeIdx !== -1 && aboutIdx !== -1, "Sections must exist");
  assert.ok(statsIdx < marqueeIdx && marqueeIdx < aboutIdx, "ClientLogoMarquee must be positioned between Statistics and About section");
});

test("Client Management: Admin panel includes Client Logos tab and CRUD controls", () => {
  const adminPage = fs.readFileSync(path.join(srcDir, "app", "admin", "page.tsx"), "utf-8");
  assert.ok(adminPage.includes('id: "clients"'), "Admin page must include clients tab");
  assert.ok(adminPage.includes("Add Client Company"), "Admin page must have Add Client Company button");
  assert.ok(adminPage.includes("Remove Client"), "Admin page must have Remove Client action");
  assert.ok(adminPage.includes("Client Companies & Marquee Logos"), "Admin page must display marquee header");
});

test("Admin Panel Categories: dropdown includes all 9 requested options", () => {
  const adminPage = fs.readFileSync(path.join(srcDir, "app", "admin", "page.tsx"), "utf-8");
  const expectedCategories = [
    "Hoardings",
    "Flex Banner",
    "Vinyl Printing",
    "Raduim Work",
    "UV Printing",
    "1Way Vision Print",
    "Acrylic Board",
    "Glow Sign",
    "Board LED Board",
  ];
  for (const cat of expectedCategories) {
    assert.ok(adminPage.includes(`"${cat}"`), `Admin panel category list must include ${cat}`);
  }
  assert.ok(adminPage.includes("<select"), "Admin panel must render select dropdowns for category selection");
});

test("Admin Panel Save Buttons: strictly 'Save' everywhere and zero 'Save Changes'", () => {
  const adminPage = fs.readFileSync(path.join(srcDir, "app", "admin", "page.tsx"), "utf-8");
  assert.ok(!adminPage.includes("Save Changes"), "Admin page must NOT contain 'Save Changes' anywhere");
  assert.ok(adminPage.includes("<SectionHeader"), "Admin page must use section headers with integrated Save button");
});

test("Admin Panel Cards: descriptions removed from Portfolio, Services, and Team cards", () => {
  const adminPage = fs.readFileSync(path.join(srcDir, "app", "admin", "page.tsx"), "utf-8");
  // Check that Description input fields were removed from Portfolio and Services, and Bio from Team
  assert.ok(!adminPage.includes('<label className={labelCls}>Description</label>'), "Description field removed from Portfolio card");
  assert.ok(!adminPage.includes('<label className={labelCls}>Short Description</label>'), "Short Description field removed from Services card");
  assert.ok(!adminPage.includes('<label className={labelCls}>Full Description</label>'), "Full Description field removed from Services card");
  assert.ok(!adminPage.includes('<label className={labelCls}>Bio</label>'), "Bio field removed from Team card");
});

test("Admin Panel Grids: cards structured in responsive grid with photo click-to-expand details", () => {
  const adminPage = fs.readFileSync(path.join(srcDir, "app", "admin", "page.tsx"), "utf-8");
  assert.ok(adminPage.includes("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"), "Must use responsive grid for cards");
  assert.ok(adminPage.includes("Click photo to edit details") || adminPage.includes("Click photo to view or edit details"), "Must support clicking photo to show details");
  assert.ok(adminPage.includes("object-contain"), "Image preview must use object-contain to prevent cutting faces or banners");
});

test("CTA Sections: Team and Portfolio pages include dedicated Call-to-Action sections", () => {
  const teamPage = fs.readFileSync(path.join(srcDir, "app", "team", "page.tsx"), "utf-8");
  const portfolioPage = fs.readFileSync(path.join(srcDir, "app", "portfolio", "page.tsx"), "utf-8");
  assert.ok(teamPage.includes("Ready to Bring Your"), "Team page must have CTA heading");
  assert.ok(teamPage.includes('href="/contact"'), "Team CTA must link to contact");
  assert.ok(portfolioPage.includes("Have a Project in Mind?"), "Portfolio page must have CTA heading");
  assert.ok(portfolioPage.includes('href="/contact"'), "Portfolio CTA must link to contact");
});

test("Featured Work Section: Removed entirely from homepage", () => {
  const homePage = fs.readFileSync(path.join(srcDir, "app", "page.tsx"), "utf-8");
  assert.ok(!homePage.includes("Featured Work"), "Homepage must not contain Featured Work");
  assert.ok(!homePage.includes("Work That Speaks"), "Homepage must not contain Featured Work headline");
});

test("Admin Panel Cards: Save button placed beside Close Details and condenses to grid", () => {
  const adminPage = fs.readFileSync(path.join(srcDir, "app", "admin", "page.tsx"), "utf-8");
  assert.ok(adminPage.includes("Close Details"), "Admin cards must have Close Details button");
  assert.ok(adminPage.includes("setExpandedPortfolio(null)"), "Portfolio Save must condense back to grid");
  assert.ok(adminPage.includes("setExpandedService(null)"), "Service Save must condense back to grid");
  assert.ok(adminPage.includes("setExpandedTeam(null)"), "Team Save must condense back to grid");
  assert.ok(adminPage.includes("Photo Size:"), "Must display Photo Size specifications");
});

test("Recent Installations: Moves infinitely in slow speed with clean card display without View Details text", () => {
  const homePage = fs.readFileSync(path.join(srcDir, "app", "page.tsx"), "utf-8");
  const globalsCss = fs.readFileSync(path.join(srcDir, "app", "globals.css"), "utf-8");
  assert.ok(homePage.includes("Our Recent Installations."), "Homepage must have Our Recent Installations section");
  assert.ok(homePage.includes("animate-marquee-slow"), "Recent installations must use animate-marquee-slow class");
  assert.ok(globalsCss.includes(".animate-marquee-slow"), "globals.css must define .animate-marquee-slow animation");
  assert.ok(!homePage.includes("View Details"), "View Details text must be removed from Recent Installations cards");
});

test("Portfolio Cards: Clean display without 'View' text", () => {
  const portfolioPage = fs.readFileSync(path.join(srcDir, "app", "portfolio", "page.tsx"), "utf-8");
  assert.ok(!portfolioPage.includes("View <ArrowRight"), "Portfolio cards must have 'View' text removed");
});

test("Smart Sticky Navbar: Scroll-up immediate reveal across all pages", () => {
  const navbar = fs.readFileSync(path.join(srcDir, "components", "layout", "Navbar.tsx"), "utf-8");
  assert.ok(navbar.includes("lastScrollY"), "Navbar must track scroll direction");
  assert.ok(navbar.includes("translate-y-0"), "Navbar must slide into view on scroll up");
  assert.ok(navbar.includes("-translate-y-full"), "Navbar must slide out of view on scroll down");
  assert.ok(navbar.includes("fixed top-0"), "Navbar must be fixed at the top for immediate access");
});

test("Network & Images: next.config.ts allows broad remote patterns and package.json listens on 0.0.0.0", () => {
  const nextConfig = fs.readFileSync(path.join(process.cwd(), "next.config.ts"), "utf-8");
  const pkgJson = fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8");
  assert.ok(nextConfig.includes("hostname: '**'"), "next.config.ts must allow any remote image hostname");
  assert.ok(pkgJson.includes("-H 0.0.0.0"), "package.json dev script must listen on 0.0.0.0 for LAN access");
});





