/**
 * JSON Schema 2020-12 type definitions and constants
 */

export const JSON_SCHEMA_2020_12 = "https://json-schema.org/draft/2020-12/schema";

/**
 * JSON Schema 2020-12 interface
 * Supports the core features needed for MCP tool input schemas
 */
export interface JsonSchema {
  $schema?: string;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  description?: string;
  enum?: any[];
  default?: any;
  format?: string;
  items?: JsonSchema;
  // Additional JSON Schema fields as needed
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  const?: any;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
}

