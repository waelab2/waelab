"use client";

import type {
  Language,
  TranslationContext,
  TranslationData,
} from "@/lib/translations";
import { useQuery } from "convex/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../../convex/_generated/api";

/**
 * Translation Context
 */
const TranslationContext = createContext<TranslationContext | null>(null);

/**
 * Translation Provider Component
 * This should wrap your app to provide translation context
 */
export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize language from localStorage if available, otherwise default to "en"
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
        return savedLanguage;
      }
    }
    return "en";
  });

  // Load all translations from Convex
  const translationsData = useQuery(api.translations.getAllTranslations);

  // Create translations lookup object
  const translations = useMemo(() => {
    if (!translationsData) return {};

    const lookup: Record<string, TranslationData> = {};
    translationsData.forEach((translation) => {
      lookup[translation.key] = translation;
    });
    return lookup;
  }, [translationsData]);

  // Translation function
  const t = (key: string): string => {
    // If translations are still loading, return the key as fallback
    if (!translationsData) {
      return key;
    }

    const translation = translations[key];
    if (!translation) {
      throw new Error(
        `Translation key "${key}" not found in database. Please ensure all required translations are loaded.`,
      );
    }

    return language === "ar" ? translation.ar : translation.en;
  };

  // Language is now initialized synchronously from localStorage in useState initializer

  // Save language preference to localStorage
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const contextValue: TranslationContext = {
    language,
    translations,
    t,
    setLanguage: handleSetLanguage,
  };

  return React.createElement(
    TranslationContext.Provider,
    { value: contextValue },
    children,
  );
}

/**
 * Hook to use translations
 * This is the main hook that components should use
 */
export function useTranslations() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error(
      "useTranslations must be used within a TranslationProvider",
    );
  }

  return context;
}

/**
 * Hook to get a specific translation
 * This provides a more convenient way to get a single translation
 */
export function useTranslation(key: string): string {
  const { t } = useTranslations();
  return t(key);
}

/**
 * Hook to get multiple translations at once
 * This is useful when you need several translations in a component
 */
export function useTranslationsByKeys(keys: string[]): Record<string, string> {
  const { t } = useTranslations();

  return useMemo(() => {
    const result: Record<string, string> = {};
    keys.forEach((key) => {
      result[key] = t(key);
    });
    return result;
  }, [keys, t]);
}

/**
 * Hook to get current language
 */
export function useLanguage(): Language {
  const { language } = useTranslations();
  return language;
}

/**
 * Hook to toggle between languages
 */
export function useLanguageToggle() {
  const { language, setLanguage } = useTranslations();

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
  };

  return { language, toggleLanguage };
}

/**
 * Utility hook for development - helps with translation management
 */
export function useTranslationDev() {
  const { translations, language } = useTranslations();

  // Get all available translation keys
  const availableKeys = useMemo(() => {
    return Object.keys(translations);
  }, [translations]);

  return {
    availableKeys,
    totalTranslations: Object.keys(translations).length,
    currentLanguage: language,
  };
}
