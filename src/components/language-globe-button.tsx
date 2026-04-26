"use client";

import { Globe } from "lucide-react";
import { useLanguageToggle } from "~/hooks/use-translations";
import { cn } from "~/lib/utils";

type LanguageGlobeButtonProps = {
  className?: string;
  iconClassName?: string;
};

export function LanguageGlobeButton({
  className,
  iconClassName,
}: LanguageGlobeButtonProps) {
  const { language, toggleLanguage } = useLanguageToggle();
  const label =
    language === "en"
      ? "Switch language to Arabic"
      : "Switch language to English";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none",
        className,
      )}
    >
      <Globe className={cn("h-5 w-5 sm:h-6 sm:w-6", iconClassName)} />
    </button>
  );
}
