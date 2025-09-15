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
import { Skeleton } from "~/components/ui/skeleton";
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

  // Clear form state immediately when model changes (before schema fetch)
  useEffect(() => {
    if (model) {
      setFormFields({});
      setFormValues({});
      setValidationErrors({});
      setLoadingModel(true);
    }
  }, [model, setLoadingModel]);

  // Fetch model schema when model changes
  useEffect(() => {
    async function fetchModelSchema() {
      if (!model) return;

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
  }, [model, setModelSchema, setLoadingModel]);

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

  // Skeleton form component that mimics the actual form structure
  const SkeletonForm = () => (
    <div className="space-y-8">
      {/* Video Description Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <Skeleton className="h-5 w-32 bg-white/20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 bg-white/20" />
          <Skeleton className="h-24 w-full rounded-md bg-white/20" />
        </div>
      </div>

      {/* Video Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
          <Skeleton className="h-5 w-28 bg-white/20" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 bg-white/20" />
            <Skeleton className="h-10 w-full rounded-md bg-white/20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-10 w-full rounded-md bg-white/20" />
          </div>
        </div>
      </div>

      {/* Advanced Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-orange-500"></div>
          <Skeleton className="h-5 w-36 bg-white/20" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-10 w-full rounded-md bg-white/20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-white/20" />
            <Skeleton className="h-10 w-full rounded-md bg-white/20" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="h-10 w-full rounded-md bg-white/20" />
        </div>
      </div>
    </div>
  );

  if (isLoadingModel || Object.keys(formFields).length === 0) {
    return <SkeletonForm />;
  }

  const sections = getFormSections();
  const hasValidationErrors = Object.values(validationErrors).some(
    (error) => error !== null,
  );

  return (
    <div className="space-y-8">
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
              <Label className="text-base font-medium text-white">
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
                      <p className="text-sm text-red-400">{hasError}</p>
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
        <div className="rounded-lg border border-red-400/50 bg-red-500/10 p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-300">
              Please fix the following errors:
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-red-200">
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
        <details className="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
          <summary className="cursor-pointer text-sm font-medium text-white/80">
            Debug Information
          </summary>
          <div className="mt-2 space-y-2 text-xs text-white/80">
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
              <pre className="mt-1 rounded bg-white/10 p-2 whitespace-pre-wrap text-white/80">
                {JSON.stringify(formValues, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
