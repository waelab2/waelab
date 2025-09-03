/**
 * Enhanced Dynamic Model Form
 *
 * This is the new version of DynamicModelForm that uses the parameter registry system
 * to dynamically render any model type without hardcoded parameter handling.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { DynamicFieldRenderer } from "~/components/dynamic-field-renderer";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Model } from "~/lib/constants";
import { models } from "~/lib/constants";
import type { FormField, ParameterValue } from "~/lib/parameter-registry";
import useGenerateStore from "~/lib/stores/useGenerateStore";
import { ModelSchemaFetcher } from "~/lib/utils/schema-fetcher";

type FormValues = Record<string, ParameterValue>;

type ValidationErrors = Record<string, string | null>;

interface FormSection {
  title: string;
  color: string;
  fields: string[];
}

export default function EnhancedDynamicModelForm() {
  const {
    model,
    setModel,
    modelSchema,
    setModelSchema,
    isLoadingModel,
    setLoadingModel,
    prompt,
    setPrompt,
  } = useGenerateStore();

  const [formValues, setFormValues] = useState<FormValues>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [formFields, setFormFields] = useState<Record<string, FormField>>({});

  // Fetch model schema when model changes
  useEffect(() => {
    async function fetchModelSchema() {
      if (!model) return;

      setLoadingModel(true);
      try {
        const modelInfo = await ModelSchemaFetcher.getModelInfo(model);
        if (modelInfo) {
          setModelSchema(modelInfo.schema);

          // Extract dynamic fields from the enhanced schema
          const fields = modelInfo.schema.fields ?? {};
          setFormFields(fields);

          // Set default values for all fields
          const defaultValues: FormValues = {};
          Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
            if (fieldConfig.defaultValue !== undefined) {
              defaultValues[fieldName] = fieldConfig.defaultValue;
            }
          });

          // Sync existing prompt from store if it exists
          if (prompt && !defaultValues.prompt) {
            defaultValues.prompt = prompt;
          }

          setFormValues(defaultValues);
          setValidationErrors({});

          console.log(
            `✅ Loaded ${Object.keys(fields).length} fields for model: ${model}`,
          );
          console.log(`✅ Model category: ${modelInfo.schema.category}`);
        }
      } catch (error) {
        console.error("Failed to fetch model schema:", error);
      } finally {
        setLoadingModel(false);
      }
    }

    void fetchModelSchema();
  }, [model, setModelSchema, setLoadingModel, prompt]);

  const handleFieldChange = useCallback(
    (fieldName: string, value: ParameterValue) => {
      setFormValues((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Sync prompt field with store for backward compatibility
      if (fieldName === "prompt" && typeof value === "string") {
        setPrompt(value);
      }
    },
    [setPrompt],
  );

  const handleValidationChange = useCallback(
    (fieldName: string, error: string | null) => {
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    [],
  );

  const getFormSections = useCallback((): FormSection[] => {
    if (!modelSchema?.category || !formFields) {
      return [
        {
          title: "Model Configuration",
          color: "blue",
          fields: Object.keys(formFields),
        },
      ];
    }

    const category = modelSchema.category;
    const fieldNames = Object.keys(formFields);

    // Define section configurations based on model category
    if (category.includes("image-to-video")) {
      return [
        {
          title: "Source Image",
          color: "purple",
          fields: fieldNames.filter(
            (name) =>
              name.includes("image") ||
              name.includes("img") ||
              name === "image_url",
          ),
        },
        {
          title: "Video Description",
          color: "green",
          fields: fieldNames.filter((name) => name === "prompt"),
        },
        {
          title: "Video Settings",
          color: "blue",
          fields: fieldNames.filter(
            (name) =>
              name === "duration" ||
              name === "aspect_ratio" ||
              name.includes("video") ||
              name.includes("frame"),
          ),
        },
        {
          title: "Advanced Settings",
          color: "orange",
          fields: fieldNames.filter(
            (name) =>
              !["prompt", "duration", "aspect_ratio"].includes(name) &&
              !name.includes("image") &&
              !name.includes("img") &&
              name !== "image_url",
          ),
        },
      ];
    }

    if (category.includes("text-to-audio")) {
      return [
        {
          title: "Audio Description",
          color: "green",
          fields: fieldNames.filter((name) => name === "prompt"),
        },
        {
          title: "Audio Settings",
          color: "purple",
          fields: fieldNames.filter(
            (name) =>
              name.includes("audio") ||
              name.includes("sample") ||
              name.includes("rate") ||
              name.includes("format") ||
              name === "duration",
          ),
        },
        {
          title: "Advanced Settings",
          color: "orange",
          fields: fieldNames.filter(
            (name) =>
              name !== "prompt" &&
              !name.includes("audio") &&
              !name.includes("sample") &&
              !name.includes("rate") &&
              !name.includes("format") &&
              name !== "duration",
          ),
        },
      ];
    }

    // Default text-to-video layout
    return [
      {
        title: "Video Description",
        color: "green",
        fields: fieldNames.filter((name) => name === "prompt"),
      },
      {
        title: "Video Settings",
        color: "purple",
        fields: fieldNames.filter(
          (name) => name === "duration" || name === "aspect_ratio",
        ),
      },
      {
        title: "Advanced Settings",
        color: "orange",
        fields: fieldNames.filter(
          (name) => !["prompt", "duration", "aspect_ratio"].includes(name),
        ),
      },
    ];
  }, [modelSchema?.category, formFields]);

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      indigo: "bg-indigo-500",
    };
    return colorMap[color as keyof typeof colorMap] || "bg-blue-500";
  };

  if (isLoadingModel) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground text-lg">
            Loading model configuration...
          </p>
        </div>
      </div>
    );
  }

  const sections = getFormSections();
  const hasValidationErrors = Object.values(validationErrors).some(
    (error) => error !== null,
  );

  return (
    <div className="space-y-8">
      {/* Model Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <Label className="text-base font-medium text-gray-700">
            Model Selection
          </Label>
        </div>
        <Select
          value={model}
          onValueChange={(value) => setModel(value as Model["id"])}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {models.map((modelOption) => (
                <SelectItem key={modelOption.id} value={modelOption.id}>
                  {modelOption.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Model Category Badge */}
        {modelSchema?.category && (
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {modelSchema.category
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
            <span className="text-xs text-gray-500">
              {Object.keys(formFields).length} parameters
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Form Sections */}
      {sections.map((section, sectionIndex) => {
        const sectionFields = section.fields.filter(
          (fieldName) => formFields[fieldName],
        );

        if (sectionFields.length === 0) return null;

        return (
          <div key={sectionIndex} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${getColorClasses(section.color)}`}
              ></div>
              <Label className="text-base font-medium text-gray-700">
                {section.title}
              </Label>
            </div>

            <div className="space-y-4">
              {sectionFields.map((fieldName) => {
                const field = formFields[fieldName];
                if (!field) return null;
                const hasError = validationErrors[fieldName];

                return (
                  <div key={fieldName} className="space-y-1">
                    <DynamicFieldRenderer
                      field={field}
                      value={formValues[fieldName]}
                      onChange={(value) => handleFieldChange(fieldName, value)}
                      onValidationChange={handleValidationChange}
                      disabled={isLoadingModel}
                    />
                    {hasError && (
                      <p className="text-sm text-red-600">{hasError}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Validation Summary */}
      {hasValidationErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-800">
              Please fix the following errors:
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {Object.entries(validationErrors)
              .filter(([, error]) => error !== null)
              .map(([fieldName, error]) => (
                <li key={fieldName}>• {error}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600">
            Debug Information
          </summary>
          <div className="mt-2 space-y-2 text-xs">
            <div>
              <strong>Model:</strong> {model}
            </div>
            <div>
              <strong>Category:</strong> {modelSchema?.category ?? "Unknown"}
            </div>
            <div>
              <strong>Fields:</strong> {Object.keys(formFields).join(", ")}
            </div>
            <div>
              <strong>Values:</strong>
              <pre className="mt-1 rounded bg-gray-100 p-2 whitespace-pre-wrap">
                {JSON.stringify(formValues, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
