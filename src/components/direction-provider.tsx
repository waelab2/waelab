"use client";

import { useTranslations } from "~/hooks/use-translations";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Direction Provider Component
 * Applies RTL/LTR direction based on current language
 * Excludes dashboard pages from RTL direction (dashboard is always English)
 */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language } = useTranslations();

  // Check if current path is a dashboard page
  const isDashboardPage = pathname.startsWith("/dashboard");

  useEffect(() => {
    // Ensure we're running on the client side and DOM is ready
    if (typeof window === "undefined") return;

    const htmlElement = document.documentElement;

    if (isDashboardPage) {
      // Dashboard pages are always LTR (English)
      htmlElement.setAttribute("dir", "ltr");
      htmlElement.setAttribute("lang", "en");
    } else {
      // Apply direction based on current language
      const direction = language === "ar" ? "rtl" : "ltr";
      const lang = language === "ar" ? "ar" : "en";

      htmlElement.setAttribute("dir", direction);
      htmlElement.setAttribute("lang", lang);
    }
  }, [language, isDashboardPage]);

  return <>{children}</>;
}
