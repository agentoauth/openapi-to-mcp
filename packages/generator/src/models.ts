import { OpenAPIV3 } from "openapi-types";
import type { MCPTool } from "@openmcp/core";

export interface ApiParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  description?: string;
}

export interface ApiOperation {
  id: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: ApiParameter[];
  requestBodySchema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  responseSchema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject; // first 2xx response
}

export interface ParsedApi {
  operations: ApiOperation[];
  components?: OpenAPIV3.ComponentsObject;
}

export type JsonSchema = any; // V0: keep loose, we can tighten later

/**
 * Generator-specific extension of MCPTool that includes the operation reference.
 * Used internally during code generation.
 */
export interface McpTool extends MCPTool {
  outputSchema?: JsonSchema;
  operation: ApiOperation;
}

export type AuthType = "none" | "apiKey" | "bearer";

export interface AuthConfig {
  type: AuthType;
  headerName?: string; // e.g. "X-API-Key" for apiKey, or "Authorization" for bearer
  envVar?: string;     // e.g. "MY_SERVICE_API_KEY" or "MY_SERVICE_TOKEN"
}

export type TransportType = "stdio" | "http";

