/**
 * Translation system types and interfaces
 *
 * Translation keys will be added gradually as we identify content to translate.
 * For now, we'll use string literals directly in components.
 */

/**
 * Translation data structure
 */
export interface TranslationData {
  _id: string;
  _creationTime: number;
  key: string;
  en: string;
  ar: string;
}

/**
 * Language codes
 */
export type Language = "en" | "ar";

/**
 * Translation context type
 */
export interface TranslationContext {
  language: Language;
  translations: Record<string, TranslationData>;
  t: (key: string) => string;
  setLanguage: (language: Language) => void;
}
