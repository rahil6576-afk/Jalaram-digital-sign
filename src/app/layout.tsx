import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteData, getSiteData } from "@/data/site";
import { SiteDataProvider } from "@/context/SiteDataContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#6F20E8",
};

export const metadata: Metadata = {
  title: `${siteData.business.name} | Digital Printing & Signage`,
  description: siteData.business.description,
  icons: {
    icon: "/jalaram.webp",
    apple: "/jalaram.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialData = getSiteData();

  return (
    <html lang="en" className={`${inter.variable} antialiased scroll-smooth w-full overflow-x-hidden`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
        <SiteDataProvider initialData={initialData}>
          <Navbar />
          <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <FloatingWhatsApp />
        </SiteDataProvider>
      </body>
    </html>
  );
}

