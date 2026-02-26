"use client";

import type {
  Language,
  TranslationContext,
  TranslationData,
} from "@/lib/translations";
import { useQuery } from "convex/react";
import React, {
  useCallback,
  createContext,
  useContext,
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
  initialLanguage = "en",
  initialTranslations = [],
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
  initialTranslations?: TranslationData[];
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Load all translations from Convex
  const translationsData = useQuery(api.translations.getAllTranslations);
  const resolvedTranslationsData = translationsData ?? initialTranslations;

  // Create translations lookup object
  const translations = useMemo(() => {
    const lookup: Record<string, TranslationData> = {};
    resolvedTranslationsData.forEach((translation) => {
      lookup[translation.key] = translation;
    });
    return lookup;
  }, [resolvedTranslationsData]);

  // Translation function
  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      if (resolvedTranslationsData.length === 0) {
        return key;
      }
      throw new Error(
        `Translation key "${key}" not found in database. Please ensure all required translations are loaded.`,
      );
    }

    return language === "ar" ? translation.ar : translation.en;
  }, [language, resolvedTranslationsData.length, translations]);

  // Save language preference to localStorage
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
      document.cookie = `language=${newLanguage}; path=/; max-age=31536000; samesite=lax`;
    }
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
