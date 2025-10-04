"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function TranslationsPage() {
  const translations = useQuery(api.translations.getAllTranslations);

  // Group translations by section
  const groupedTranslations = translations?.reduce(
    (acc, translation) => {
      const section = translation.key.split(".")[0];
      if (section && !acc[section]) {
        acc[section] = [];
      }
      if (section && acc[section]) {
        acc[section].push(translation);
      }
      return acc;
    },
    {} as Record<string, typeof translations>,
  );

  const sections = [
    {
      key: "home",
      title: "Home Page",
      count: groupedTranslations?.home?.length ?? 0,
    },
    {
      key: "about",
      title: "About Us",
      count: groupedTranslations?.about?.length ?? 0,
    },
    {
      key: "our_services",
      title: "Services",
      count: groupedTranslations?.our_services?.length ?? 0,
    },
    {
      key: "our_plans",
      title: "Plans",
      count: groupedTranslations?.our_plans?.length ?? 0,
    },
    {
      key: "contact_us",
      title: "Contact Us",
      count: groupedTranslations?.contact_us?.length ?? 0,
    },
    {
      key: "nav",
      title: "Navigation",
      count: groupedTranslations?.nav?.length ?? 0,
    },
    {
      key: "footer",
      title: "Footer",
      count: groupedTranslations?.footer?.length ?? 0,
    },
    {
      key: "common_services_section",
      title: "Common Services",
      count: groupedTranslations?.common_services_section?.length ?? 0,
    },
    {
      key: "faq_section",
      title: "FAQ Section",
      count: groupedTranslations?.faq_section?.length ?? 0,
    },
  ];

  if (!translations) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">Loading translations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Translation Management
        </h1>
        <p className="mt-2 text-gray-400">
          Manage translations for different sections of your website.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <a
            key={section.key}
            href={`/dashboard/translations/${section.key === "our_services" ? "services" : section.key === "our_plans" ? "plans" : section.key === "contact_us" ? "contact" : section.key === "about" ? "about" : section.key}`}
            className="block rounded-lg border border-gray-700 bg-gray-800/50 p-6 transition-colors hover:bg-gray-800/70"
          >
            <h3 className="mb-2 text-lg font-semibold text-white">
              {section.title}
            </h3>
            <p className="text-sm text-gray-400">
              {section.count} translation{section.count !== 1 ? "s" : ""}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
