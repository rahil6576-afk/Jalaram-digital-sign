"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}