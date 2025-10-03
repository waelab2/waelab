"use client";

import { TranslationEditor } from "@/components/translation-editor";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function AboutTranslationsPage() {
  const translations = useQuery(api.translations.getAllTranslations);

  const aboutTranslations =
    translations?.filter(
      (t) => t.key.startsWith("about.") || t.key.startsWith("about_us."),
    ) ?? [];

  if (!translations) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">Loading translations...</div>
      </div>
    );
  }

  return (
    <TranslationEditor
      translations={aboutTranslations}
      sectionTitle="About Us"
    />
  );
}
