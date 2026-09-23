import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatExternalUrl(url: string | undefined | null): string {
  if (!url) return "#";
  let cleaned = url.trim();
  // Strip any accidental leading # characters from past inputs
  while (cleaned.startsWith("#")) {
    cleaned = cleaned.slice(1).trim();
  }
  if (!cleaned) return "#";
  // If already absolute protocol, return
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  // Otherwise prepend https:// so browser treats as external website
  return `https://${cleaned}`;
}

export function formatWhatsAppUrl(rawPhone: string | undefined | null, message?: string): string {
  const fallback = "919427033363";
  if (!rawPhone) {
    const textParam = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${fallback}${textParam}`;
  }
  const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
  // If 10 digits (standard Indian mobile number without 91 prefix)
  const finalDigits = cleanDigits.length === 10 ? `91${cleanDigits}` : (cleanDigits || fallback);
  const defaultMsg = "Hello Jalaram Digital Sign, I would like to inquire about your printing & signage services.";
  const textParam = `?text=${encodeURIComponent(message || defaultMsg)}`;
  return `https://wa.me/${finalDigits}${textParam}`;
}

