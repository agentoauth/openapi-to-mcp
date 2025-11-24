// Core concepts used by generator, CLI, and Studio

/**
 * MCP Tool definition.
 * Represents a tool that can be executed by an MCP server.
 */
export type MCPTool = {
  name: string;
  description: string;
  inputSchema: unknown; // JSON Schema-ish
  // Optionally: outputSchema, timeoutMs, etc.
};

/**
 * MCP Server configuration.
 * Defines the complete configuration for an MCP server.
 */
export type MCPServerConfig = {
  name: string;
  description?: string;
  tools: MCPTool[];
};

/**
 * Lightweight reference to an OpenAPI operation.
 * Used for early-stage filtering and transformation before full extraction.
 */
export type OpenAPIOperationRef = {
  operationId: string;
  path: string;
  method: string;
};

