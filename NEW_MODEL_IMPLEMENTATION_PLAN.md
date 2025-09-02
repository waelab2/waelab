# New Model Implementation Plan

## Overview

This document outlines the comprehensive approach for implementing a dynamic form system that can continuously handle new model categories (text-to-video, image-to-video, text-to-audio, etc.) without breaking existing functionality. The goal is to create a truly extensible system that automatically adapts to any fal.ai model's capabilities through OpenAPI schema parsing.

## Current System Analysis

### ✅ **What Works Well**

- Dynamic parameter detection based on OpenAPI schemas
- Conditional rendering of supported input fields
- Schema-driven validation and constraints
- Automatic default value setting
- Cost estimation based on model parameters

### ⚠️ **Current Limitations**

- Hardcoded parameter type handling (string, number, boolean, enum)
- Limited support for complex parameter structures
- No handling for file uploads (images, audio)
- Fixed form layout assumptions
- Potential breaking changes with significantly different models

## Implementation Strategy

### **Phase 1: Robustify Current System (Immediate)**

1. **Add fallback handling** for unknown parameter types
2. **Implement graceful degradation** when schema parsing fails
3. **Add comprehensive logging** for debugging new model issues
4. **Create parameter type registry** for known types

### **Phase 2: Extend for New Categories (Short-term)**

1. **Image-to-Video Models**
   - File upload handling for images
   - Image preprocessing options
   - Support for multiple input types (text + image)

2. **Text-to-Audio Models**
   - Audio-specific parameters (sample rate, format, etc.)
   - Voice/style selection options
   - Audio quality settings

### **Phase 3: Full Dynamic System (Medium-term)**

1. **Generic form field renderer**
2. **Recursive schema parsing**
3. **Dynamic validation rules**
4. **Parameter dependency handling**

## Detailed Implementation Steps

### **Step 1: Parameter Type Registry**

Create a registry of known parameter types and their UI representations:

```typescript
interface ParameterTypeConfig {
  type: "string" | "number" | "boolean" | "enum" | "file" | "array" | "object";
  uiComponent:
    | "input"
    | "textarea"
    | "select"
    | "switch"
    | "fileUpload"
    | "multiSelect"
    | "nestedForm";
  validation?: ValidationRules;
  defaultValue?: any;
}

const PARAMETER_TYPE_REGISTRY: Record<string, ParameterTypeConfig> = {
  string: { type: "string", uiComponent: "input" },
  string_with_max_length: { type: "string", uiComponent: "textarea" },
  number_with_range: { type: "number", uiComponent: "input" },
  boolean: { type: "boolean", uiComponent: "switch" },
  enum: { type: "enum", uiComponent: "select" },
  file: { type: "file", uiComponent: "fileUpload" },
  // ... extend as needed
};
```

### **Step 2: Dynamic Field Renderer**

Create a component that can render any parameter type:

```typescript
interface DynamicFieldRendererProps {
  parameterName: string;
  parameterSchema: OpenAPISchemaProperty;
  value: any;
  onChange: (value: any) => void;
  modelSchema: ModelSchema;
}

function DynamicFieldRenderer({ parameterName, parameterSchema, value, onChange, modelSchema }: DynamicFieldRendererProps) {
  const fieldConfig = determineFieldConfig(parameterSchema);

  switch (fieldConfig.uiComponent) {
    case 'input':
      return <DynamicInput {...fieldConfig} />;
    case 'textarea':
      return <DynamicTextarea {...fieldConfig} />;
    case 'select':
      return <DynamicSelect {...fieldConfig} />;
    case 'switch':
      return <DynamicSwitch {...fieldConfig} />;
    case 'fileUpload':
      return <DynamicFileUpload {...fieldConfig} />;
    default:
      return <FallbackField {...fieldConfig} />;
  }
}
```

### **Step 3: Schema Parser Enhancement**

Extend the schema parser to handle new parameter types:

```typescript
private static parseParameterSchema(property: OpenAPISchemaProperty, propertyName: string): FormField {
  const baseField = {
    name: propertyName,
    type: property.type,
    required: false,
    description: property.description,
  };

  // Handle different parameter types
  if (property.type === 'string') {
    if (property.enum) {
      return { ...baseField, type: 'enum', options: property.enum };
    }
    if (property.maxLength) {
      return { ...baseField, type: 'textarea', maxLength: property.maxLength };
    }
    return { ...baseField, type: 'input' };
  }

  if (property.type === 'number' || property.type === 'integer') {
    return {
      ...baseField,
      type: 'number',
      min: property.minimum,
      max: property.maximum,
      step: property.type === 'integer' ? 1 : 0.1,
    };
  }

  if (property.type === 'boolean') {
    return { ...baseField, type: 'switch' };
  }

  if (property.type === 'array') {
    return { ...baseField, type: 'multiSelect', itemType: property.items?.type };
  }

  if (property.type === 'object') {
    return { ...baseField, type: 'nestedForm', properties: property.properties };
  }

  // Handle file uploads (for image-to-video models)
  if (property.format === 'binary' || property.contentType?.includes('image/')) {
    return { ...baseField, type: 'fileUpload', accept: property.contentType };
  }

  // Fallback for unknown types
  return { ...baseField, type: 'fallback' };
}
```

### **Step 4: New Model Category Support**

#### **Image-to-Video Models**

```typescript
// Special handling for image input
if (modelSchema.input.image) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
        <Label className="text-base font-medium text-gray-700">
          Source Image
        </Label>
      </div>

      <ImageUploadField
        value={image}
        onChange={setImage}
        accept="image/*"
        maxSize={10 * 1024 * 1024} // 10MB
        preview
      />

      <p className="text-xs text-gray-500">
        Upload an image to use as the starting point for video generation
      </p>
    </div>
  );
}
```

#### **Text-to-Audio Models**

```typescript
// Special handling for audio-specific parameters
if (modelSchema.input.sample_rate) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sample_rate" className="text-sm font-medium text-gray-600">
        Sample Rate
        {modelSchema.input.sample_rate.enum && (
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            Options: {modelSchema.input.sample_rate.enum.join(", ")} Hz
          </span>
        )}
      </Label>
      <Select
        value={sampleRate}
        onValueChange={setSampleRate}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select sample rate" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {modelSchema.input.sample_rate.enum.map((rate) => (
              <SelectItem key={rate} value={rate}>
                {rate} Hz
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### **Step 5: Form Layout Adaptation**

Create adaptive form layouts based on model category:

```typescript
function getFormLayout(modelCategory: string): FormLayout {
  switch (modelCategory) {
    case "text-to-video":
      return {
        sections: ["model", "prompt", "video_settings", "advanced"],
        layout: "vertical",
        sidebar: "cost_estimation",
      };

    case "image-to-video":
      return {
        sections: ["model", "image", "prompt", "video_settings", "advanced"],
        layout: "two_column",
        sidebar: "cost_estimation",
      };

    case "text-to-audio":
      return {
        sections: ["model", "prompt", "audio_settings", "advanced"],
        layout: "vertical",
        sidebar: "cost_estimation",
      };

    default:
      return {
        sections: ["model", "prompt", "advanced"],
        layout: "vertical",
        sidebar: "cost_estimation",
      };
  }
}
```

## Testing Strategy

### **Unit Tests**

1. **Schema Parser Tests**: Test with various parameter types
2. **Field Renderer Tests**: Ensure correct UI components are rendered
3. **Validation Tests**: Test parameter constraints and validation

### **Integration Tests**

1. **Model Loading Tests**: Test with different model schemas
2. **Form Rendering Tests**: Ensure forms render correctly for all model types
3. **Parameter Handling Tests**: Test parameter updates and validation

### **Manual Testing**

1. **Current Models**: Verify existing functionality still works
2. **New Model Categories**: Test with image-to-video and text-to-audio models
3. **Edge Cases**: Test with models having unusual parameter structures

## Migration Strategy

### **Backward Compatibility**

1. **Maintain existing behavior** for current models
2. **Gradual rollout** of new features
3. **Feature flags** for experimental functionality

### **Rollback Plan**

1. **Version control** for all changes
2. **Database migrations** if needed
3. **Quick rollback** procedures

## Monitoring and Maintenance

### **Logging and Analytics**

1. **Schema parsing logs** for debugging
2. **Parameter usage analytics** to understand user behavior
3. **Error tracking** for unknown parameter types

### **Performance Considerations**

1. **Schema caching** to avoid repeated API calls
2. **Lazy loading** of complex form components
3. **Bundle size optimization** for new UI components

## Success Metrics

### **Technical Metrics**

1. **Zero breaking changes** when adding new models
2. **100% parameter coverage** for all model types
3. **Sub-second form rendering** for complex models

### **User Experience Metrics**

1. **Form completion rate** improvement
2. **User error reduction** in parameter input
3. **Model adoption rate** for new categories

## Risk Mitigation

### **High Risk Items**

1. **Breaking existing functionality**: Mitigated by comprehensive testing
2. **Performance degradation**: Mitigated by lazy loading and caching
3. **Complex parameter handling**: Mitigated by gradual rollout

### **Contingency Plans**

1. **Feature flags** for quick disable/enable
2. **Rollback procedures** for critical issues
3. **Fallback UI** for unknown parameter types

## Implementation Priority

### **Immediate Actions (Week 1-2)**

- Implement fallback handling for unknown parameters
- Add comprehensive logging and error tracking
- Create parameter type registry system

### **Short-term Goals (Week 3-6)**

- Extend system for image-to-video models
- Add support for text-to-audio models
- Implement file upload handling

### **Medium-term Goals (Week 7-8)**

- Build generic field renderer
- Implement recursive schema parsing
- Add dynamic validation rules

## Conclusion

This plan provides a structured approach to extending the dynamic form system while maintaining robustness and user experience. The phased implementation allows for iterative improvement and risk mitigation.

The key success factors are:

1. **Maintaining backward compatibility**
2. **Comprehensive testing at each phase**
3. **User feedback integration**
4. **Performance monitoring**
5. **Gradual rollout with rollback capability**

By following this plan, the system will become truly extensible for any model category while maintaining the excellent user experience already achieved. The goal is to create a system where adding new models requires minimal code changes and automatically adapts to new parameter types and model categories.
