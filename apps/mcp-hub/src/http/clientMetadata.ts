/**
 * Client metadata for MCP Hub
 * 
 * Exposes client metadata following SIMD (Standard Interface for Metadata Discovery)
 * so other systems (and later OAuth gateway) can auto-register the Hub as a client.
 */

/**
 * MCP Client Metadata
 * 
 * Follows SIMD specification for client metadata discovery.
 * This allows OAuth gateways and other systems to automatically discover
 * and register the Hub as an OAuth2 client.
 */
export interface McpClientMetadata {
  client_id: string;
  client_name: string;
  redirect_uris: string[];
  grant_types: string[];
  token_endpoint_auth_method: "none" | "client_secret_basic" | "client_secret_post";
  // Additional fields can be added as needed:
  // scope?: string;
  // response_types?: string[];
  // contacts?: string[];
}

/**
 * Get default client metadata for the Hub
 * 
 * @returns Default client metadata
 */
export function getDefaultClientMetadata(): McpClientMetadata {
  return {
    client_id: "openmcp-hub",
    client_name: "OpenMCP Hub",
    redirect_uris: ["mcp://callback/openmcp"],
    grant_types: ["authorization_code"],
    token_endpoint_auth_method: "none",
  };
}

