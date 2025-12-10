import { OpenAPIV3 } from "openapi-types";
import type { MCPTool, JsonSchema } from "../../core/src/index";

export interface ApiParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  description?: string;
  default?: any; // Default value from schema
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
  serverUrl?: string; // Per-operation server URL (operation-level > path-level > spec-level)
  security?: OpenAPIV3.SecurityRequirementObject[]; // Security requirements for OAuth2 scopes
}

export interface ParsedApi {
  operations: ApiOperation[];
  components?: OpenAPIV3.ComponentsObject;
}

// JsonSchema is now imported from core
export type { JsonSchema } from "../../core/src/index";

/**
 * Generator-specific extension of MCPTool that includes the operation reference.
 * Used internally during code generation.
 */
export interface McpTool extends MCPTool {
  outputSchema?: JsonSchema;
  operation: ApiOperation;
  auth?: import("../../core/src/index").ToolAuthMetadata; // Required scopes for OAuth2
}

export type AuthType = "none" | "apiKey" | "bearer";

export interface AuthConfig {
  type: AuthType;
  headerName?: string; // e.g. "X-API-Key" for apiKey, or "Authorization" for bearer
  envVar?: string;     // e.g. "MY_SERVICE_API_KEY" or "MY_SERVICE_TOKEN"
}

export type TransportType = "stdio" | "http";

