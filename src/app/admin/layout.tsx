"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(() => pathname !== "/admin/login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        if (!res.ok) { router.replace("/admin/login"); return; }
        setIsAuthenticated(true);
      } catch {
        router.replace("/admin/login");
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try { await fetch("/api/admin/auth", { method: "DELETE" }); } catch {}
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-100 border-t-[#6F20E8] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#6F20E8] font-semibold tracking-wide">Verifying admin credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Top Navbar — pure purple gradient */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#6F20E8] via-[#7C3AED] to-[#5B16C7] px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg shadow-[#6F20E8]/25">
        <Link href="/admin" className="flex items-center gap-3 group">
          {/* Logo in white pill */}
          <div className="bg-white rounded-xl px-3 py-1.5 shadow-md group-hover:scale-105 transition-transform">
            <Image
              src="/images/jalaram-logo.png"
              alt="Jalaram Digital Sign"
              width={140}
              height={50}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
          {/* Admin label */}
          <div>
            <span className="font-bold text-white text-sm tracking-tight block leading-tight">Admin Panel</span>
            <span className="text-[10px] text-purple-100 font-medium block leading-tight">Content &amp; Media Control Center</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-[#6F20E8] hover:bg-purple-50 border border-white/20 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}