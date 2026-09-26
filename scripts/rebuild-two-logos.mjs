import fs from "fs";
import path from "path";
import sharp from "sharp";

// 1. GENERATE KABIR WORLD SVG
function generateKabirWorldSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 90" width="460" height="90">
  <defs>
    <clipPath id="circle-clip">
      <circle cx="45" cy="45" r="38" />
    </clipPath>
  </defs>

  <!-- Left: Circular Emblem -->
  <g>
    <!-- Background Circle -->
    <circle cx="45" cy="45" r="38" fill="#1C355E" />
    
    <!-- Chevron / Diagonal Striped Pattern inside Circle -->
    <g clip-path="url(#circle-clip)">
      <!-- Top Navy is the background circle -->
      <!-- Stripe 1: Teal -->
      <polygon points="5,22 45,30 85,22 85,28 45,36 5,28" fill="#0E7C7B" />
      <!-- White separator -->
      <polygon points="5,28 45,36 85,28 85,32 45,40 5,32" fill="#FFFFFF" />
      <!-- Stripe 2: Red Chevron -->
      <polygon points="5,32 45,40 85,32 85,41 45,49 5,41" fill="#E63946" />
      <!-- White separator -->
      <polygon points="5,41 45,49 85,41 85,45 45,53 5,45" fill="#FFFFFF" />
      <!-- Stripe 3: Teal -->
      <polygon points="5,45 45,53 85,45 85,52 45,60 5,52" fill="#0E7C7B" />
      <!-- White separator -->
      <polygon points="5,52 45,60 85,52 85,56 45,64 5,56" fill="#FFFFFF" />
      <!-- Bottom Navy fills the rest -->
    </g>

    <!-- Outer Clean Ring -->
    <circle cx="45" cy="45" r="38" fill="none" stroke="#CBD5E1" stroke-width="2" />
  </g>

  <!-- Right: Crisp Modern Typography -->
  <text x="102" y="44" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="34" font-weight="900" letter-spacing="1.5" fill="#0F172A">KABIR WORLD</text>
  
  <text x="104" y="68" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="12.5" font-weight="700" letter-spacing="0.8">
    <tspan fill="#475569">A VENTURE OF </tspan>
    <tspan fill="#F59E0B" font-weight="900">KABIR TECHNOLOGIES</tspan>
    <tspan fill="#475569"> PVT LTD</tspan>
  </text>
</svg>`;
}

// 2. GENERATE CHANDRA LOGO
async function generateChandraLogo() {
  // Let's create an ultra-clean SVG with the iconic Chandra identity
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 160" width="260" height="160">
  <defs>
    <!-- Filter for smooth subtle depth if needed -->
  </defs>

  <!-- 1. The Tilted Golden-Yellow Oval -->
  <g transform="translate(130, 60) rotate(-22)">
    <ellipse cx="0" cy="0" rx="36" ry="50" fill="#FFC800" />
    
    <!-- Black Character / Bird 'e' inside oval -->
    <!-- The eye -->
    <circle cx="3" cy="-22" r="3.2" fill="#111111" />
    
    <!-- The main 'e' curve / head and back -->
    <path d="M 16 -12 C 14 -32, -18 -30, -22 -6 C -25 18, -12 36, 12 34 C 18 33, 20 30, 16 26 C 2 28, -8 18, -6 0 C -4 -16, 10 -16, 16 -12 Z" fill="#111111" />
    
    <!-- Red Accent Smile / Lip -->
    <path d="M -22 1 C -12 4, -4 4, 4 -2 C -2 12, -14 12, -22 1 Z" fill="#E62222" />
    
    <!-- Two Red Radiation Lines above head -->
    <line x1="12" y1="-32" x2="16" y2="-40" stroke="#E62222" stroke-width="3" stroke-linecap="round" />
    <line x1="20" y1="-26" x2="25" y2="-34" stroke="#E62222" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- 2. Typography: 'chandra' in iconic chunky font -->
  <text x="130" y="146" text-anchor="middle" font-family="'Cooper Black', 'Cinzel Decorative', 'Georgia', serif" font-size="34" font-weight="900" letter-spacing="1" fill="#111111">chandra</text>
</svg>`;
}

async function run() {
  const kabirSvg = generateKabirWorldSvg();
  const kabirBuf = Buffer.from(kabirSvg);
  await sharp(kabirBuf).png().toFile("public/client-kabir-world.png");
  await sharp(kabirBuf).webp({ quality: 98 }).toFile("public/client-kabir-world.webp");
  console.log("Saved clean vector public/client-kabir-world.webp");

  const chandraSvg = await generateChandraLogo();
  const chandraBuf = Buffer.from(chandraSvg);
  await sharp(chandraBuf).png().toFile("public/client-chandra.png");
  await sharp(chandraBuf).webp({ quality: 98 }).toFile("public/client-chandra.webp");
  console.log("Saved clean vector public/client-chandra.webp");
}

run().catch(console.error);
