"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import defaultSiteData from "@/data/site-content.json";
import type { SiteData } from "@/data/site";

interface SiteDataContextType {
  siteData: SiteData;
  updateLocalSiteData: (newData: SiteData) => void;
  refreshSiteData: () => Promise<void>;
}

const SiteDataContext = createContext<SiteDataContextType>({
  siteData: defaultSiteData as SiteData,
  updateLocalSiteData: () => {},
  refreshSiteData: async () => {},
});

const STORAGE_KEY = "jalaram_site_content_v3";

export function SiteDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: SiteData;
}) {
  // Always initialize with server-safe initialData to guarantee identical SSR hydration
  const [siteData, setSiteData] = useState<SiteData>(initialData || (defaultSiteData as SiteData));

  // Sync to state and localStorage
  const updateLocalSiteData = useCallback((newData: SiteData) => {
    setSiteData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      localStorage.setItem(`${STORAGE_KEY}_time`, Date.now().toString());
    } catch {
      // safe fallback if storage is restricted
    }
  }, []);

  // Sync if initialData from server updates
  useEffect(() => {
    if (initialData && initialData.business) {
      setSiteData(initialData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        localStorage.setItem(`${STORAGE_KEY}_time`, Date.now().toString());
      } catch {
        // safe fallback
      }
    }
  }, [initialData]);

  // Fetch fresh content from server API (reads directly from Supabase / disk)
  const refreshSiteData = useCallback(async () => {
    try {
      const [contentRes, servicesRes, machinesRes] = await Promise.allSettled([
        fetch(`/api/admin/content?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" }
        }),
        fetch(`/api/services?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" }
        }),
        fetch(`/api/machines?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" }
        }),
      ]);

      let json: any = null;
      if (contentRes.status === "fulfilled" && contentRes.value.ok) {
        json = await contentRes.value.json();
      }

      let dbServices: any = null;
      if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
        const sJson = await servicesRes.value.json();
        if (sJson.success && Array.isArray(sJson.services)) {
          dbServices = sJson.services;
        }
      }

      let dbMachines: any = null;
      if (machinesRes.status === "fulfilled" && machinesRes.value.ok) {
        const mJson = await machinesRes.value.json();
        if (mJson.success && Array.isArray(mJson.machines)) {
          dbMachines = mJson.machines;
        }
      }

      if (json && json.business) {
        const finalData = {
          ...json,
          ...(dbServices && dbServices.length > 0 ? { services: dbServices } : {}),
          ...(dbMachines && dbMachines.length > 0 ? { machines: dbMachines } : {}),
        };
        setSiteData(finalData);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
          localStorage.setItem(`${STORAGE_KEY}_time`, Date.now().toString());
        } catch {
          // safe fallback
        }
      } else {
        setSiteData((prev) => ({
          ...prev,
          ...(dbServices && dbServices.length > 0 ? { services: dbServices } : {}),
          ...(dbMachines && dbMachines.length > 0 ? { machines: dbMachines } : {}),
        }));
      }
    } catch (err) {
      console.warn("Could not refresh live site data:", err);
    }
  }, []);

  useEffect(() => {
    // 1. Only if initialData was not provided, check cached storage for non-services and non-machines content
    if (!initialData) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.business) {
            // Keep default initial services & machines until live database response arrives
            setSiteData((prev) => ({
              ...parsed,
              services: prev.services || (defaultSiteData as SiteData).services,
              machines: prev.machines || (defaultSiteData as SiteData).machines,
            }));
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Fetch latest data directly from database
    refreshSiteData();

    // 3. Listen for in-app updates dispatched when admin clicks Save
    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteData>;
      if (customEvent.detail && customEvent.detail.business) {
        setSiteData(customEvent.detail);
      }
    };
    window.addEventListener("site-content-updated", handleCustomUpdate);

    // 4. BroadcastChannel listener (instant real-time cross-tab sync with ZERO reload!)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("jalaram_site_sync");
        bc.onmessage = (event) => {
          if (event.data && event.data.business) {
            setSiteData(event.data);
          }
        };
      }
    } catch {
      // fallback
    }

    // 5. Listen for storage events (sync across different browser tabs!)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.business) {
            setSiteData(parsed);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 6. Refetch automatically when user returns/focuses back to the tab
    const handleFocus = () => {
      refreshSiteData();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("site-content-updated", handleCustomUpdate);
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [refreshSiteData]);

  return (
    <SiteDataContext.Provider value={{ siteData, updateLocalSiteData, refreshSiteData }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData(): SiteData {
  const context = useContext(SiteDataContext);
  if (!context) {
    return defaultSiteData as SiteData;
  }
  return context.siteData;
}

export function useSiteDataContext() {
  return useContext(SiteDataContext);
}
