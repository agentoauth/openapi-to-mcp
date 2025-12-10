/**
 * MCP error types and helpers
 * 
 * Distinguishes between tool-level errors (validation, execution failures)
 * and protocol-level errors (method not found, parse errors, etc.)
 */

export type McpErrorType = "tool" | "protocol";

/**
 * MCP error response
 * 
 * Tool errors are returned as successful JSON-RPC responses with
 * error content in the result, allowing the client to handle them
 * as tool execution failures rather than protocol failures.
 */
export interface McpError {
  type: "mcp/error";
  errorType: McpErrorType;
  message: string;
}

/**
 * Create a tool-level error
 * 
 * Tool errors represent validation failures, execution errors, or
 * other issues specific to tool execution. These should be returned
 * as successful JSON-RPC responses with error content.
 * 
 * @param message - Error message describing what went wrong
 * @returns McpError with errorType "tool"
 */
export function toolError(message: string): McpError {
  return {
    type: "mcp/error",
    errorType: "tool",
    message,
  };
}

/**
 * Create a protocol-level error
 * 
 * Protocol errors represent issues with the MCP protocol itself,
 * such as invalid JSON-RPC requests, method not found, etc.
 * These should be returned as JSON-RPC error responses.
 * 
 * @param message - Error message describing the protocol error
 * @returns McpError with errorType "protocol"
 */
export function protocolError(message: string): McpError {
  return {
    type: "mcp/error",
    errorType: "protocol",
    message,
  };
}

