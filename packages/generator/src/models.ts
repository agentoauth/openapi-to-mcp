import { OpenAPIV3 } from "openapi-types";

export interface ApiParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  description?: string;
}

export interface ApiOperation {
  id: string;
  method: "get" | "post";
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

export interface McpTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
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

