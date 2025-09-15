/**
 * Dynamic Field Renderer
 *
 * A component that can render any parameter type based on the parameter registry system.
 * This is the core component that makes the form system truly extensible.
 */

"use client";

import { useCallback } from "react";
import { FileUpload } from "~/components/ui/file-upload";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import type { FormField, ParameterValue } from "~/lib/parameter-registry";
import { validateFieldValue } from "~/lib/parameter-registry";
import { cn } from "~/lib/utils";

interface DynamicFieldRendererProps {
  field: FormField;
  value: ParameterValue;
  onChange: (value: ParameterValue) => void;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  showDescription?: boolean;
  onValidationChange?: (fieldName: string, error: string | null) => void;
}

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  className,
  disabled = false,
  showLabel = true,
  showDescription = true,
  onValidationChange,
}: DynamicFieldRendererProps) {
  const handleChange = useCallback(
    (newValue: ParameterValue) => {
      onChange(newValue);

      // Validate the new value
      if (onValidationChange) {
        const error = validateFieldValue(field, newValue);
        onValidationChange(field.name, error);
      }
    },
    [onChange, onValidationChange, field],
  );

  const renderField = () => {
    switch (field.uiComponent) {
      case "input":
        return (
          <Input
            id={field.name}
            type={field.type === "number" ? "number" : "text"}
            value={
              value != null && typeof value !== "object" ? String(value) : ""
            }
            onChange={(e) => {
              const newValue =
                field.type === "number"
                  ? e.target.value
                    ? Number(e.target.value)
                    : undefined
                  : e.target.value;
              handleChange(newValue);
            }}
            placeholder={field.placeholder}
            disabled={disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            maxLength={field.maxLength}
            className="h-10"
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.name}
            value={
              value != null && typeof value !== "object" ? String(value) : ""
            }
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            maxLength={field.maxLength}
            className="min-h-[80px] resize-none"
          />
        );

      case "select":
        return (
          <Select
            value={
              value != null && typeof value !== "object" ? String(value) : ""
            }
            onValueChange={(newValue) => {
              // Convert back to appropriate type
              const convertedValue =
                field.type === "number" ? Number(newValue) : newValue;
              handleChange(convertedValue);
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  field.placeholder ?? `Select ${field.label?.toLowerCase()}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option.toString()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={Boolean(value) ?? false}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            <Label
              htmlFor={field.name}
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </Label>
          </div>
        );

      case "slider":
        return (
          <Slider
            value={
              typeof value === "number"
                ? value
                : ((field.defaultValue as number) ?? field.min ?? 0)
            }
            onChange={handleChange}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={disabled}
            showValue={true}
            formatValue={(val) => {
              // Format based on field type and constraints
              if (field.step && field.step < 1) {
                return val.toFixed(2);
              }
              return val.toString();
            }}
          />
        );

      case "fileUpload":
        return (
          <FileUpload
            value={value instanceof File ? value : null}
            onChange={handleChange}
            accept={field.accept}
            maxSize={field.validation?.maxSize}
            preview={field.accept?.startsWith("image/")}
            disabled={disabled}
            placeholder={field.placeholder}
          />
        );

      case "multiSelect":
        // For now, implement as a simple multi-select using multiple Select components
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              Multi-select (Not implemented yet)
            </p>
            <Select disabled={true}>
              <SelectTrigger>
                <SelectValue placeholder="Multi-select coming soon..." />
              </SelectTrigger>
            </Select>
          </div>
        );

      case "nestedForm":
        return (
          <div className="space-y-4 rounded-lg border p-4">
            <p className="text-sm font-medium text-gray-200">Nested Form</p>
            {field.properties &&
              Object.entries(field.properties).map(([key, nestedField]) => (
                <DynamicFieldRenderer
                  key={key}
                  field={nestedField}
                  value={
                    (value as Record<string, ParameterValue> | null)?.[key]
                  }
                  onChange={(nestedValue) => {
                    const currentValue =
                      (value as Record<string, ParameterValue>) ?? {};
                    handleChange({
                      ...currentValue,
                      [key]: nestedValue,
                    });
                  }}
                  disabled={disabled}
                  onValidationChange={onValidationChange}
                />
              ))}
          </div>
        );

      case "fallback":
      default:
        return (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium text-yellow-800">
                Unknown Parameter Type
              </span>
            </div>
            <p className="mt-1 text-xs text-yellow-700">
              Parameter: {field.name} (Type: {field.type})
            </p>
            <p className="mt-1 text-xs text-yellow-600">
              {field.description ?? "This parameter type is not yet supported."}
            </p>
            {/* Fallback to simple text input */}
            <Input
              className="mt-2"
              value={
                value != null && typeof value !== "object" ? String(value) : ""
              }
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Enter ${field.label?.toLowerCase() ?? field.name}`}
              disabled={disabled}
            />
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and description for non-switch components */}
      {showLabel && field.uiComponent !== "switch" && (
        <div className="space-y-1">
          <Label
            htmlFor={field.name}
            className="flex items-center text-sm font-medium text-gray-200"
          >
            {field.label ?? field.name}
            {field.required && <span className="ml-1 text-red-500">*</span>}
            {field.type === "number" &&
              field.min !== undefined &&
              field.max !== undefined && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({field.min} - {field.max})
                </span>
              )}
            {field.maxLength && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                Max {field.maxLength} chars
              </span>
            )}
          </Label>

          {showDescription && field.description && (
            <p className="text-xs text-gray-400">{field.description}</p>
          )}
        </div>
      )}

      {/* Field component */}
      {renderField()}

      {/* Character count for text fields */}
      {field.maxLength && typeof value === "string" && (
        <div className="flex justify-end">
          <span className="text-xs text-gray-400">
            {String(value ?? "").length}/{field.maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
