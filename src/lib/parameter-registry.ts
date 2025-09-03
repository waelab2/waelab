/**
 * Parameter Type Registry System
 *
 * This file contains the registry of known parameter types and their UI representations.
 * It provides a systematic way to handle different parameter types and their validation rules.
 */

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  accept?: string; // For file uploads
  maxSize?: number; // For file uploads in bytes
}

export type ParameterValue =
  | string
  | number
  | boolean
  | File
  | string[]
  | number[]
  | Record<string, unknown>
  | null
  | undefined;

export interface ParameterTypeConfig {
  type:
    | "string"
    | "number"
    | "boolean"
    | "enum"
    | "file"
    | "array"
    | "object"
    | "textarea";
  uiComponent:
    | "input"
    | "textarea"
    | "select"
    | "switch"
    | "fileUpload"
    | "multiSelect"
    | "nestedForm"
    | "slider"
    | "fallback";
  validation?: ValidationRules;
  defaultValue?: ParameterValue;
  priority?: number; // Higher priority components take precedence
}

/**
 * Registry of known parameter types and their configurations
 */
export const PARAMETER_TYPE_REGISTRY: Record<string, ParameterTypeConfig> = {
  // String types
  string_short: {
    type: "string",
    uiComponent: "input",
    priority: 1,
  },
  string_long: {
    type: "textarea",
    uiComponent: "textarea",
    priority: 2,
  },

  // Number types
  number: {
    type: "number",
    uiComponent: "input",
    priority: 1,
  },
  number_with_range: {
    type: "number",
    uiComponent: "slider",
    priority: 2,
  },

  // Boolean types
  boolean: {
    type: "boolean",
    uiComponent: "switch",
    priority: 1,
  },

  // Enum types
  enum: {
    type: "enum",
    uiComponent: "select",
    priority: 1,
  },

  // File types
  image_file: {
    type: "file",
    uiComponent: "fileUpload",
    validation: {
      accept: "image/*",
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    priority: 1,
  },
  audio_file: {
    type: "file",
    uiComponent: "fileUpload",
    validation: {
      accept: "audio/*",
      maxSize: 50 * 1024 * 1024, // 50MB
    },
    priority: 1,
  },
  video_file: {
    type: "file",
    uiComponent: "fileUpload",
    validation: {
      accept: "video/*",
      maxSize: 100 * 1024 * 1024, // 100MB
    },
    priority: 1,
  },

  // Array types
  array: {
    type: "array",
    uiComponent: "multiSelect",
    priority: 1,
  },

  // Object types
  object: {
    type: "object",
    uiComponent: "nestedForm",
    priority: 1,
  },

  // Fallback type
  fallback: {
    type: "string",
    uiComponent: "fallback",
    priority: 0,
  },
};

/**
 * Extended OpenAPI schema property interface with additional type information
 */
export interface ExtendedOpenAPISchemaProperty {
  type: string;
  title?: string;
  description?: string;
  enum?: string[] | number[];
  default?: ParameterValue;
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  minLength?: number;
  format?: string;
  contentType?: string;
  items?: ExtendedOpenAPISchemaProperty;
  properties?: Record<string, ExtendedOpenAPISchemaProperty>;
  allOf?: ExtendedOpenAPISchemaProperty[];
  examples?: Array<{ url: string }>;
  required?: boolean;
  anyOf?: ExtendedOpenAPISchemaProperty[]; // Added for nullable types
}

/**
 * Form field configuration derived from schema and registry
 */
export interface FormField {
  name: string;
  type: string;
  uiComponent: ParameterTypeConfig["uiComponent"];
  label?: string;
  description?: string;
  required?: boolean;
  validation?: ValidationRules;
  options?: string[] | number[]; // For enum types
  defaultValue?: ParameterValue;
  placeholder?: string;

  // Type-specific properties
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  minLength?: number;
  accept?: string; // For file uploads
  itemType?: string; // For arrays
  properties?: Record<string, FormField>; // For nested objects
}

/**
 * Determines the appropriate field configuration based on parameter schema
 */
export function determineFieldConfig(
  property: ExtendedOpenAPISchemaProperty,
  propertyName: string,
): FormField {
  const baseField: FormField = {
    name: propertyName,
    type: property.type ?? "string",
    uiComponent: "input",
    label: property.title ?? propertyName,
    description: property.description,
    required: property.required ?? false,
    defaultValue: property.default,
  };

  // Handle different parameter types with priority
  const fieldConfig = determineParameterType(property);

  return {
    ...baseField,
    ...fieldConfig,
    validation: {
      ...fieldConfig.validation,
      required: baseField.required,
    },
  };
}

/**
 * Determines the parameter type and configuration based on schema properties
 */
function determineParameterType(
  property: ExtendedOpenAPISchemaProperty,
): Partial<FormField> {
  // Handle enum types first (highest priority)
  if (property.enum && property.enum.length > 0) {
    return {
      type: "enum",
      uiComponent: "select",
      options: property.enum,
    };
  }

  // Handle anyOf union types (OpenAPI nullable types)
  if (property.anyOf && property.anyOf.length > 0) {
    // Find the primary type (non-null type)
    const primaryType = property.anyOf.find((type) => type.type !== "null");
    if (primaryType) {
      // Create a new property object with the primary type
      const primaryProperty: ExtendedOpenAPISchemaProperty = {
        ...property,
        type: primaryType.type,
        // Merge other properties from the primary type
        minimum: primaryType.minimum ?? property.minimum,
        maximum: primaryType.maximum ?? property.maximum,
        maxLength: primaryType.maxLength ?? property.maxLength,
        minLength: primaryType.minLength ?? property.minLength,
        enum: primaryType.enum ?? property.enum,
        format: primaryType.format ?? property.format,
        contentType: primaryType.contentType ?? property.contentType,
      };

      // Recursively determine the type for the primary property
      return determineParameterType(primaryProperty);
    }
  }

  // Handle file uploads based on format or content type
  if (isFileType(property)) {
    return getFileTypeConfig(property);
  }

  // Handle different data types
  switch (property.type) {
    case "string":
      return getStringTypeConfig(property);

    case "number":
    case "integer":
      return getNumberTypeConfig(property);

    case "boolean":
      return {
        type: "boolean",
        uiComponent: "switch",
      };

    case "array":
      return {
        type: "array",
        uiComponent: "multiSelect",
        itemType: property.items?.type ?? "string",
      };

    case "object":
      return {
        type: "object",
        uiComponent: "nestedForm",
        properties: property.properties
          ? Object.fromEntries(
              Object.entries(property.properties).map(([key, prop]) => [
                key,
                determineFieldConfig(prop, key),
              ]),
            )
          : undefined,
      };

    default:
      console.warn(
        `Unknown parameter type: ${property.type} for property`,
        property,
      );
      return {
        type: "string",
        uiComponent: "fallback",
      };
  }
}

/**
 * Determines if a property represents a file type
 */
function isFileType(property: ExtendedOpenAPISchemaProperty): boolean {
  return Boolean(
    property.format === "binary" ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      property.contentType?.includes("image/") ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      property.contentType?.includes("audio/") ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      property.contentType?.includes("video/") ||
      (property.type === "string" && property.format === "byte"),
  );
}

/**
 * Gets file type configuration based on content type
 */
function getFileTypeConfig(
  property: ExtendedOpenAPISchemaProperty,
): Partial<FormField> {
  if (property.contentType?.includes("image/")) {
    return {
      type: "file",
      uiComponent: "fileUpload",
      accept: "image/*",
      validation: PARAMETER_TYPE_REGISTRY.image_file?.validation ?? {
        accept: "image/*",
        maxSize: 10 * 1024 * 1024,
      },
    };
  }

  if (property.contentType?.includes("audio/")) {
    return {
      type: "file",
      uiComponent: "fileUpload",
      accept: "audio/*",
      validation: PARAMETER_TYPE_REGISTRY.audio_file?.validation ?? {
        accept: "audio/*",
        maxSize: 50 * 1024 * 1024,
      },
    };
  }

  if (property.contentType?.includes("video/")) {
    return {
      type: "file",
      uiComponent: "fileUpload",
      accept: "video/*",
      validation: PARAMETER_TYPE_REGISTRY.video_file?.validation ?? {
        accept: "video/*",
        maxSize: 100 * 1024 * 1024,
      },
    };
  }

  // Generic file type
  return {
    type: "file",
    uiComponent: "fileUpload",
    validation: {
      maxSize: 10 * 1024 * 1024, // 10MB default
    },
  };
}

/**
 * Gets string type configuration
 */
function getStringTypeConfig(
  property: ExtendedOpenAPISchemaProperty,
): Partial<FormField> {
  // Use textarea for long strings
  if (property.maxLength && property.maxLength > 500) {
    return {
      type: "textarea",
      uiComponent: "textarea",
      maxLength: property.maxLength,
      minLength: property.minLength,
    };
  }

  // Use input for short strings
  return {
    type: "string",
    uiComponent: "input",
    maxLength: property.maxLength,
    minLength: property.minLength,
  };
}

/**
 * Gets number type configuration
 */
function getNumberTypeConfig(
  property: ExtendedOpenAPISchemaProperty,
): Partial<FormField> {
  const hasRange =
    property.minimum !== undefined && property.maximum !== undefined;

  return {
    type: "number",
    uiComponent: hasRange ? "slider" : "input",
    min: property.minimum,
    max: property.maximum,
    step: property.type === "integer" ? 1 : 0.1,
  };
}

/**
 * Validates a field value against its configuration
 */
export function validateFieldValue(
  field: FormField,
  value: ParameterValue,
): string | null {
  if (!field.validation) return null;

  const validation = field.validation;

  // Required validation
  if (
    validation.required &&
    (value === undefined || value === null || value === "")
  ) {
    return `${field.label ?? field.name} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value && !validation.required) return null;

  // String length validation
  if (typeof value === "string") {
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label ?? field.name} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label ?? field.name} must be no more than ${validation.maxLength} characters`;
    }
  }

  // Number range validation
  if (typeof value === "number") {
    if (validation.min !== undefined && value < validation.min) {
      return `${field.label ?? field.name} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return `${field.label ?? field.name} must be no more than ${validation.max}`;
    }
  }

  // File validation
  if (field.type === "file" && value instanceof File) {
    if (validation.maxSize && value.size > validation.maxSize) {
      const maxSizeMB = validation.maxSize / (1024 * 1024);
      return `${field.label ?? field.name} must be no larger than ${maxSizeMB}MB`;
    }

    if (validation.accept) {
      const acceptedTypes = validation.accept.split(",").map((t) => t.trim());
      const fileType = value.type;
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return fileType.startsWith(type.slice(0, -1));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `${field.label ?? field.name} must be of type: ${validation.accept}`;
      }
    }
  }

  return null;
}

/**
 * Gets the fallback configuration for unknown parameter types
 */
export function getFallbackConfig(
  property: ExtendedOpenAPISchemaProperty,
  propertyName: string,
): FormField {
  console.warn(
    `Using fallback configuration for unknown parameter: ${propertyName}`,
    property,
  );

  return {
    name: propertyName,
    type: "string",
    uiComponent: "fallback",
    label: property.title ?? propertyName,
    description:
      property.description ?? `Unknown parameter type: ${property.type}`,
    required: property.required ?? false,
    defaultValue: property.default,
    validation: {
      required: property.required ?? false,
    },
  };
}
