import { getModelPreviewUrl, getModelUrls } from "~/lib/constants";

// OpenAPI 3.0.4 types based on the actual fal.ai schemas
interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  components: {
    schemas: Record<string, OpenAPISchemaObject>;
  };
}

interface OpenAPISchemaObject {
  type: string;
  title?: string;
  properties?: Record<string, OpenAPISchemaProperty>;
  required?: string[];
  allOf?: OpenAPISchemaObject[];
  examples?: Array<{ url: string }>;
}

interface OpenAPISchemaProperty {
  type: string;
  title?: string;
  description?: string;
  enum?: string[];
  default?: string | number | boolean;
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  minLength?: number;
  allOf?: OpenAPISchemaObject[];
  examples?: Array<{ url: string }>;
}

export interface ModelSchema {
  input: {
    prompt: {
      type: string;
      maxLength: number;
      required: boolean;
    };
    duration?: {
      enum: string[];
      default: string;
      type: string;
    };
    aspect_ratio?: {
      enum: string[];
      default: string;
      type: string;
    };
    negative_prompt?: {
      type: string;
      maxLength: number;
      default: string;
    };
    cfg_scale?: {
      type: string;
      minimum: number;
      maximum: number;
      default: number;
    };
    prompt_optimizer?: {
      type: string;
      default: boolean;
    };
  };
  output: {
    video: {
      url: string;
      file_size: number;
      file_name: string;
      content_type: string;
    };
  };
  constraints: {
    max_prompt_length: number;
    supported_durations: string[];
    supported_aspect_ratios?: string[];
    cfg_scale_range?: { min: number; max: number };
    supports_prompt_optimizer?: boolean;
  };
  preview_url: string | null;
}

export interface ModelLLMs {
  title: string;
  description: string;
  endpoint: string;
  category: string;
  model_id: string;
}

export class ModelSchemaFetcher {
  // Simple browser-compatible caching
  private static cache = new Map<
    string,
    {
      data: { schema: ModelSchema; llms: ModelLLMs };
      timestamp: number;
    }
  >();
  private static CACHE_DURATION = 3600000; // 1 hour in milliseconds

  static async getModelInfo(
    modelId: string,
  ): Promise<{ schema: ModelSchema; llms: ModelLLMs } | null> {
    // Check cache first
    const cached = this.cache.get(modelId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const urls = getModelUrls(modelId);

    try {
      console.log(`🔍 Fetching model info for ${modelId}`);
      console.log(`🔍 Schema URL: ${urls.schema_url}`);
      console.log(`🔍 LLMs URL: ${urls.llms_url}`);

      const [schemaResponse, llmsResponse] = await Promise.all([
        fetch(urls.schema_url),
        fetch(urls.llms_url),
      ]);

      console.log(`🔍 Schema response status: ${schemaResponse.status}`);
      console.log(`🔍 LLMs response status: ${llmsResponse.status}`);

      if (!schemaResponse.ok || !llmsResponse.ok) {
        console.warn(
          `Failed to fetch model info for ${modelId}. Schema: ${schemaResponse.status}, LLMs: ${llmsResponse.status}`,
        );
        return ModelSchemaFetcher.getDefaultModelInfo(modelId);
      }

      const schemaData = (await schemaResponse.json()) as OpenAPISchema;
      const llmsText = await llmsResponse.text();

      console.log(`🔍 Successfully fetched schema and LLMs for ${modelId}`);

      // Parse the OpenAPI schema
      const schema = ModelSchemaFetcher.parseOpenAPISchema(schemaData, modelId);

      // Parse the LLMs documentation
      const llms = ModelSchemaFetcher.parseLLMsDocumentation(llmsText, modelId);

      const result = { schema, llms };

      // Cache the result
      this.cache.set(modelId, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error(`Error fetching model info for ${modelId}:`, error);
      if (error instanceof Error) {
        console.error(`Error details:`, {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      return ModelSchemaFetcher.getDefaultModelInfo(modelId);
    }
  }

  private static parseOpenAPISchema(
    openAPIData: OpenAPISchema,
    modelId: string,
  ): ModelSchema {
    try {
      // Find input schema (follows naming pattern: [Model]Input)
      const inputSchemaKey = Object.keys(openAPIData.components.schemas).find(
        (key) => key.includes("Input"),
      );

      // Find output schema (follows naming pattern: [Model]Output)
      const outputSchemaKey = Object.keys(openAPIData.components.schemas).find(
        (key) => key.includes("Output"),
      );

      if (!inputSchemaKey || !outputSchemaKey) {
        throw new Error(`Could not find input/output schemas for ${modelId}`);
      }

      const inputSchema = openAPIData.components.schemas[inputSchemaKey];
      const outputSchema = openAPIData.components.schemas[outputSchemaKey];

      if (!inputSchema || !outputSchema) {
        throw new Error(`Invalid schema structure for ${modelId}`);
      }

      // Extract preview URL from output schema examples
      const previewUrl =
        outputSchema.properties?.video?.examples?.[0]?.url ??
        getModelPreviewUrl(modelId);

      // Parse input parameters
      const input: ModelSchema["input"] = {
        prompt: {
          type: inputSchema.properties?.prompt?.type ?? "string",
          maxLength: inputSchema.properties?.prompt?.maxLength ?? 2500,
          required: inputSchema.required?.includes("prompt") ?? true,
        },
      };

      // Add optional parameters based on what's available
      if (inputSchema.properties?.duration) {
        input.duration = {
          enum: inputSchema.properties.duration.enum ?? ["5", "10"],
          default: String(inputSchema.properties.duration.default ?? "5"),
          type: inputSchema.properties.duration.type ?? "string",
        };
      }

      if (inputSchema.properties?.aspect_ratio) {
        input.aspect_ratio = {
          enum: inputSchema.properties.aspect_ratio.enum ?? [
            "16:9",
            "9:16",
            "1:1",
          ],
          default: String(
            inputSchema.properties.aspect_ratio.default ?? "16:9",
          ),
          type: inputSchema.properties.aspect_ratio.type ?? "string",
        };
      }

      if (inputSchema.properties?.negative_prompt) {
        input.negative_prompt = {
          type: inputSchema.properties.negative_prompt.type ?? "string",
          maxLength: inputSchema.properties.negative_prompt.maxLength ?? 2500,
          default: String(
            inputSchema.properties.negative_prompt.default ??
              "blur, distort, and low quality",
          ),
        };
      }

      if (inputSchema.properties?.cfg_scale) {
        input.cfg_scale = {
          type: inputSchema.properties.cfg_scale.type ?? "number",
          minimum: Number(inputSchema.properties.cfg_scale.minimum ?? 0),
          maximum: Number(inputSchema.properties.cfg_scale.maximum ?? 1),
          default: Number(inputSchema.properties.cfg_scale.default ?? 0.5),
        };
      }

      if (inputSchema.properties?.prompt_optimizer) {
        input.prompt_optimizer = {
          type: inputSchema.properties.prompt_optimizer.type ?? "boolean",
          default: Boolean(
            inputSchema.properties.prompt_optimizer.default ?? true,
          ),
        };
      }

      // Build constraints
      const constraints: ModelSchema["constraints"] = {
        max_prompt_length: input.prompt.maxLength,
        supported_durations: input.duration?.enum ?? ["5"],
        supported_aspect_ratios: input.aspect_ratio?.enum,
        cfg_scale_range: input.cfg_scale
          ? {
              min: input.cfg_scale.minimum,
              max: input.cfg_scale.maximum,
            }
          : undefined,
        supports_prompt_optimizer: !!input.prompt_optimizer,
      };

      return {
        input,
        output: {
          video: {
            url: "string",
            file_size: 0,
            file_name: "string",
            content_type: "video/mp4",
          },
        },
        constraints,
        preview_url: previewUrl,
      };
    } catch (error) {
      console.error(`Error parsing OpenAPI schema for ${modelId}:`, error);
      return ModelSchemaFetcher.getDefaultSchema(modelId);
    }
  }

  private static parseLLMsDocumentation(
    llmsText: string,
    modelId: string,
  ): ModelLLMs {
    try {
      const lines = llmsText.split("\n");

      // Extract title (first non-empty line after #)
      const titleLine = lines.find((line) => line.startsWith("# "));
      const title = titleLine?.replace("# ", "").trim() ?? modelId;

      // Extract description (line after >)
      const descLine = lines.find((line) => line.startsWith("> "));
      const description = descLine?.replace("> ", "").trim() ?? "";

      // Extract endpoint
      const endpointLine = lines.find((line) => line.includes("**Endpoint**"));
      const endpoint = endpointLine?.match(/`([^`]+)`/)?.[1] ?? "";

      // Extract category
      const categoryLine = lines.find((line) => line.includes("**Category**"));
      const category =
        categoryLine?.split("**Category**:")?.[1]?.trim() ?? "text-to-video";

      return {
        title,
        description,
        endpoint,
        category,
        model_id: modelId,
      };
    } catch (error) {
      console.error(`Error parsing LLMs documentation for ${modelId}:`, error);
      return {
        title: modelId,
        description: "",
        endpoint: "",
        category: "text-to-video",
        model_id: modelId,
      };
    }
  }

  private static getDefaultSchema(modelId: string): ModelSchema {
    return {
      input: {
        prompt: {
          type: "string",
          maxLength: 2500,
          required: true,
        },
        duration: {
          enum: ["5", "10"],
          default: "5",
          type: "string",
        },
        aspect_ratio: {
          enum: ["16:9", "9:16", "1:1"],
          default: "16:9",
          type: "string",
        },
      },
      output: {
        video: {
          url: "string",
          file_size: 0,
          file_name: "string",
          content_type: "video/mp4",
        },
      },
      constraints: {
        max_prompt_length: 2500,
        supported_durations: ["5", "10"],
        supported_aspect_ratios: ["16:9", "9:16", "1:1"],
      },
      preview_url: getModelPreviewUrl(modelId),
    };
  }

  private static getDefaultModelInfo(modelId: string): {
    schema: ModelSchema;
    llms: ModelLLMs;
  } {
    return {
      schema: ModelSchemaFetcher.getDefaultSchema(modelId),
      llms: {
        title: modelId,
        description: "Video generation model",
        endpoint: "",
        category: "text-to-video",
        model_id: modelId,
      },
    };
  }

  static async revalidateModel(modelId: string) {
    console.log(`Cache revalidation requested for ${modelId}`);
  }
}
