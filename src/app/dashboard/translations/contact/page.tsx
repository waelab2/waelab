"use client";

import { TranslationEditor } from "@/components/translation-editor";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function ContactTranslationsPage() {
  const translations = useQuery(api.translations.getAllTranslations);

  const contactTranslations =
    translations?.filter(
      (t) =>
        t.key.startsWith("contact_us.") || t.key.startsWith("faq_section."),
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
      translations={contactTranslations}
      sectionTitle="Contact Us"
    />
  );
}
