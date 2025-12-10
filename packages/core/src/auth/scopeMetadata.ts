/**
 * Tool authentication and scope metadata
 * 
 * Used to declare required scopes for incremental consent
 * and OAuth2-style authorization.
 */

import { JsonSchema } from "../schema/jsonSchema";

/**
 * Authentication metadata for a tool
 */
export interface ToolAuthMetadata {
  /** Required OAuth2 scopes for this tool */
  requiredScopes?: string[];
}

/**
 * Extended tool descriptor with authentication metadata
 */
export interface ToolDescriptor {
  name: string;
  description?: string;
  inputSchema: JsonSchema;
  auth?: ToolAuthMetadata;
}

