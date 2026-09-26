import fs from "fs";
import path from "path";

const allClients = [
  {
    id: "client-1",
    name: "BJP",
    tag: "Government & Civic Campaigns",
    logo: "/client-bjp.webp"
  },
  {
    id: "client-2",
    name: "NFSU College",
    tag: "National Forensic Sciences University",
    logo: "/client-nsfu.webp"
  },
  {
    id: "client-3",
    name: "Jay Gotli Mukhwas",
    tag: "Food & FMCG Brand",
    logo: "/client-mukhwas.webp"
  },
  {
    id: "client-4",
    name: "Mount Carmel School",
    tag: "Educational Institution",
    logo: "/client-mount-carmel.webp"
  },
  {
    id: "client-5",
    name: "Xavier School",
    tag: "Academic Institution",
    logo: "/client-st-xavier.webp"
  },
  {
    id: "client-sag",
    name: "Sports Authority of Gujarat",
    tag: "Government of Gujarat",
    logo: "/client-sports-authority-gujarat.webp"
  },
  {
    id: "client-advance-hospital",
    name: "Advance Hospital",
    tag: "Healthcare & Multispeciality",
    logo: "/client-advance-hospital.webp"
  },
  {
    id: "client-indian-army",
    name: "Indian Army (Bharatiya Sena)",
    tag: "Ministry of Defence",
    logo: "/client-bharatiya-sena.webp"
  },
  {
    id: "client-bsf",
    name: "Border Security Force (BSF)",
    tag: "Ministry of Home Affairs",
    logo: "/client-bsf.webp"
  },
  {
    id: "client-dholera-sir",
    name: "Dholera SIR",
    tag: "Special Investment Region",
    logo: "/client-dholera-sir.webp"
  },
  {
    id: "client-geer-foundation",
    name: "GEER Foundation",
    tag: "Forest & Environment Dept., Gujarat",
    logo: "/client-geer-foundation.webp"
  },
  {
    id: "client-gspc",
    name: "Gujarat State Petroleum Corp. (GSPC)",
    tag: "Energy & Gas Infrastructure",
    logo: "/client-gspc.webp"
  },
  {
    id: "client-the-leela",
    name: "The Leela Gandhinagar",
    tag: "Luxury Hospitality & Hotels",
    logo: "/client-the-leela.webp"
  },
  {
    id: "client-jaliyan-jewellers",
    name: "Jaliyan Jewellers",
    tag: "Fine Jewellery & Gold",
    logo: "/client-jaliyan-jewellers.webp"
  },
  {
    id: "client-gujarat-police",
    name: "Gujarat Police",
    tag: "Law Enforcement & Public Safety",
    logo: "/client-gujarat-police.webp"
  },
  {
    id: "client-raksha-shakti",
    name: "Rashtriya Raksha University",
    tag: "National Security & Police University",
    logo: "/client-raksha-shakti.webp"
  },
  {
    id: "client-rivera",
    name: "Rivera",
    tag: "Real Estate & Infrastructure",
    logo: "/client-rivera.webp"
  },
  {
    id: "client-sai",
    name: "Sports Authority of India (SAI)",
    tag: "Ministry of Youth Affairs & Sports",
    logo: "/client-sai.webp"
  },
  {
    id: "client-sbi",
    name: "State Bank of India (SBI)",
    tag: "Premier Banking & Financial Institution",
    logo: "/client-sbi.webp"
  },
  {
    id: "client-tata-aia",
    name: "Tata AIA Life Insurance",
    tag: "Life Insurance & Wealth Solutions",
    logo: "/client-tata-aia.webp"
  },
  {
    id: "client-indian-air-force",
    name: "Indian Air Force (Bharatiya Vayu Sena)",
    tag: "Armed Forces of India",
    logo: "/client-indian-air-force.webp"
  },
  {
    id: "client-ugvcl",
    name: "UGVCL (Uttar Gujarat Vij Company)",
    tag: "Power Distribution Utility",
    logo: "/client-ugvcl.webp"
  },
  {
    id: "client-chandra",
    name: "Chandra",
    tag: "Premium Consumer Brand",
    logo: "/client-chandra.webp"
  },
  {
    id: "client-kabir-world",
    name: "Kabir World",
    tag: "A Venture of Kabir Technologies",
    logo: "/client-kabir-world.webp"
  },
  {
    id: "client-jayantilal-chikkiwala",
    name: "Jayantilal Chikkiwala",
    tag: "Traditional Confectionery & Sweets",
    logo: "/client-jayantilal-chikkiwala.webp"
  },
  {
    id: "client-safal-icon",
    name: "Safal Icon",
    tag: "Commercial Real Estate & Spaces",
    logo: "/client-safal-icon.webp"
  },
  {
    id: "client-span-infrastructure",
    name: "Span Infrastructure",
    tag: "Infrastructure & Commercial Builders",
    logo: "/client-span-infrastructure.webp"
  }
];

const paths = [
  path.join(process.cwd(), "src", "data", "site-content.json"),
  path.join(process.cwd(), "data", "site-content.json")
];

for (const p of paths) {
  if (fs.existsSync(p)) {
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    raw.business.phone = "+91 85111 33363";
    raw.business.whatsapp = "918511133363";
    raw.clients = allClients;
    fs.writeFileSync(p, JSON.stringify(raw, null, 2) + "\n", "utf-8");
    console.log(`Updated ${p}`);
  }
}
