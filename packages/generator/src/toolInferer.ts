import type { MCPTool } from "../../core/src/index";
import { isValidToolName, normalizeToolName, ToolAuthMetadata } from "../../core/src/index";
import { ParsedApi, McpTool } from "./models";
import { OperationOverrides } from "./types";
import {
  buildInputSchemaForOperation,
  buildToolDescription,
  openApiSchemaToJsonSchema,
} from "./schemaUtils";
import { OpenAPIV3 } from "openapi-types";

/**
 * Extract required OAuth2 scopes from an OpenAPI operation's security requirements
 * 
 * OpenAPI security requirements are arrays of objects mapping security scheme names to scopes.
 * Example: [{ "oauth2": ["read:users", "write:users"] }]
 */
function extractScopesFromOpenApi(op: { security?: OpenAPIV3.SecurityRequirementObject[] }): string[] {
  const result = new Set<string>();
  
  if (!op.security || !Array.isArray(op.security)) {
    return [];
  }

  // Each security requirement is an object mapping scheme names to scopes
  // Example: { "oauth2": ["read:users", "write:users"] }
  for (const secReq of op.security) {
    // secReq is like { "oauth2": ["read:users", "write:users"] }
    for (const scopes of Object.values(secReq)) {
      if (Array.isArray(scopes)) {
        scopes.forEach(scope => result.add(scope));
      }
    }
  }

  return Array.from(result);
}

export function inferToolsFromOperations(
  parsed: ParsedApi,
  overrides?: OperationOverrides
): McpTool[] {
  const { operations, components } = parsed;

  return operations.map((op) => {
    const inputSchema = buildInputSchemaForOperation(op, components);
    const outputSchema = op.responseSchema
      ? openApiSchemaToJsonSchema(op.responseSchema, components)
      : { type: "object" };

    // Apply overrides if available
    const override = overrides?.get(op.id);
    const toolName = override?.name || normalizeToolName(op.id);
    
    // Validate tool name is MCP-compliant
    if (!isValidToolName(toolName)) {
      throw new Error(`Generated tool name "${toolName}" is invalid per MCP spec. Must be 1-128 characters and contain only A-Z, a-z, 0-9, ., _, -`);
    }
    
    const toolDescription = override?.description || buildToolDescription(op);

    // Extract required scopes from OpenAPI security requirements
    const requiredScopes = extractScopesFromOpenApi(op);
    const auth: ToolAuthMetadata | undefined = requiredScopes.length > 0
      ? { requiredScopes }
      : undefined;

    return {
      name: toolName,
      description: toolDescription,
      inputSchema,
      outputSchema,
      operation: op,
      auth,
    };
  });
}


