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

  // Fetch fresh content from server API (reads directly from Supabase / disk)
  const refreshSiteData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/content?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && json.business) {
          updateLocalSiteData(json);
        }
      }
    } catch (err) {
      console.warn("Could not refresh live site data:", err);
    }
  }, [updateLocalSiteData]);

  useEffect(() => {
    // 1. On client mount, check cached storage if valid and up-to-date
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.business) {
          setSiteData(parsed);
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch latest data from server
    refreshSiteData();

    // 3. Listen for in-app updates dispatched when admin clicks "Save Changes"
    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteData>;
      if (customEvent.detail && customEvent.detail.business) {
        setSiteData(customEvent.detail);
      }
    };
    window.addEventListener("site-content-updated", handleCustomUpdate);

    // 4. Listen for storage events (sync across different browser tabs!)
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

    // 5. Refetch automatically when user returns/focuses back to the tab
    const handleFocus = () => {
      refreshSiteData();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("site-content-updated", handleCustomUpdate);
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
