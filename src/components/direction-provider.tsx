"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Direction Provider Component
 * Applies RTL/LTR direction based on current language
 * Excludes dashboard pages from RTL direction (dashboard is always English)
 */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<"en" | "ar">("en");

  // Check if current path is a dashboard page
  const isDashboardPage = pathname.startsWith("/dashboard");

  // Load language from localStorage and listen for changes
  useEffect(() => {
    // Get initial language from localStorage
    const getStoredLanguage = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("language") as "en" | "ar";
        if (stored === "en" || stored === "ar") {
          return stored;
        }
      }
      return "en";
    };

    setLanguage(getStoredLanguage());

    // Poll localStorage for changes (since storage event doesn't fire in same tab)
    const pollInterval = setInterval(() => {
      const currentStored = getStoredLanguage();
      if (currentStored !== language) {
        setLanguage(currentStored);
      }
    }, 100); // Check every 100ms

    return () => {
      clearInterval(pollInterval);
    };
  }, [language]);

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
