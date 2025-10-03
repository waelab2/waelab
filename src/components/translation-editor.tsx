"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { Save, X } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

interface TranslationItem {
  _id: string;
  key: string;
  en: string;
  ar: string;
}

interface TranslationEditorProps {
  translations: TranslationItem[];
  sectionTitle: string;
}

export function TranslationEditor({
  translations,
  sectionTitle,
}: TranslationEditorProps) {
  const [editedTranslations, setEditedTranslations] = useState<
    Record<string, { en: string; ar: string }>
  >({});
  const [saving, setSaving] = useState<string | null>(null);
  const updateTranslation = useMutation(api.translations.updateTranslation);

  const handleTranslationChange = (
    key: string,
    field: "en" | "ar",
    value: string,
  ) => {
    // Get the current translation to ensure we have both fields
    const currentTranslation = translations.find((t) => t.key === key);
    if (!currentTranslation) return;

    setEditedTranslations((prev) => ({
      ...prev,
      [key]: {
        en: prev[key]?.en ?? currentTranslation.en,
        ar: prev[key]?.ar ?? currentTranslation.ar,
        [field]: value,
      },
    }));
  };

  const handleSave = async (key: string) => {
    if (!editedTranslations[key]) return;

    setSaving(key);
    try {
      // Get the current translation to ensure we have both en and ar values
      const currentTranslation = translations.find((t) => t.key === key);
      if (!currentTranslation) return;

      // Use edited values or fall back to current values
      const updatedTranslation = {
        key,
        en: editedTranslations[key].en ?? currentTranslation.en,
        ar: editedTranslations[key].ar ?? currentTranslation.ar,
      };

      await updateTranslation(updatedTranslation);

      // Remove from edited translations after successful save
      setEditedTranslations((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } catch (error) {
      console.error("Failed to save translation:", error);
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = (key: string) => {
    setEditedTranslations((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const getTranslationValue = (key: string, field: "en" | "ar") => {
    if (editedTranslations[key]) {
      return editedTranslations[key][field];
    }
    const translation = translations.find((t) => t.key === key);
    return translation?.[field] ?? "";
  };

  const hasChanges = (key: string) => {
    return !!editedTranslations[key];
  };

  const getDisplayKey = (key: string) => {
    // Remove the section prefix and format for display
    const parts = key.split(".");
    return parts.slice(1).join(" → ").replace(/_/g, " ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {sectionTitle} Translations
        </h1>
      </div>

      <div className="space-y-4">
        {translations.map((translation) => (
          <div
            key={translation.key}
            className="rounded-lg border border-gray-700 bg-gray-800/50 p-6"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                {getDisplayKey(translation.key)}
              </h3>
              <p className="font-mono text-sm text-gray-400">
                {translation.key}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* English */}
              <div className="space-y-2">
                <Label htmlFor={`${translation.key}-en`} className="text-white">
                  English
                </Label>
                <Textarea
                  id={`${translation.key}-en`}
                  value={getTranslationValue(translation.key, "en")}
                  onChange={(e) =>
                    handleTranslationChange(
                      translation.key,
                      "en",
                      e.target.value,
                    )
                  }
                  className="min-h-[100px] border-gray-600 bg-gray-900 text-white placeholder-gray-400"
                  placeholder="Enter English translation..."
                />
              </div>

              {/* Arabic */}
              <div className="space-y-2">
                <Label htmlFor={`${translation.key}-ar`} className="text-white">
                  Arabic
                </Label>
                <Textarea
                  id={`${translation.key}-ar`}
                  value={getTranslationValue(translation.key, "ar")}
                  onChange={(e) =>
                    handleTranslationChange(
                      translation.key,
                      "ar",
                      e.target.value,
                    )
                  }
                  className="min-h-[100px] border-gray-600 bg-gray-900 text-white placeholder-gray-400"
                  placeholder="أدخل الترجمة العربية..."
                  dir="rtl"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => handleSave(translation.key)}
                disabled={
                  saving === translation.key || !hasChanges(translation.key)
                }
                size="sm"
                className="waelab-gradient-bg text-white disabled:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-600"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === translation.key ? "Saving..." : "Save"}
              </Button>
              {hasChanges(translation.key) && (
                <Button
                  onClick={() => handleCancel(translation.key)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-700 hover:text-white"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {translations.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-400">
            No translations found for this section.
          </p>
        </div>
      )}
    </div>
  );
}
