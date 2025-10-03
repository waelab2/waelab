"use client";

import { Button } from "@/components/ui/button";
import { useLanguageToggle } from "~/hooks/use-translations";

/**
 * Language Switcher Component
 * Provides a button to toggle between English and Arabic
 */
export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguageToggle();

  return (
    <Button
      variant="outline"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <span className="text-sm font-medium">
        {language === "en" ? "العربية" : "English"}
      </span>
    </Button>
  );
}

/**
 * Language Indicator Component
 * Shows the current language without switching functionality
 */
export function LanguageIndicator() {
  const { language } = useLanguageToggle();

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <span>Language:</span>
      <span className="font-medium">
        {language === "en" ? "English" : "العربية"}
      </span>
    </div>
  );
}
