"use client";

import { TranslationEditor } from "@/components/translation-editor";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function PlansTranslationsPage() {
  const translations = useQuery(api.translations.getAllTranslations);

  const plansTranslations =
    translations?.filter((t) => t.key.startsWith("our_plans.")) ?? [];

  if (!translations) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">Loading translations...</div>
      </div>
    );
  }

  return (
    <TranslationEditor translations={plansTranslations} sectionTitle="Plans" />
  );
}
