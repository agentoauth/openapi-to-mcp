/**
 * Tool execution handler for MCP Hub
 * 
 * This handler checks scopes before executing tools and returns
 * URL elicitation results (not tool errors) for missing scopes.
 */

import { toolError, UrlElicitationResult, defaultConsentUrlBuilder, ConsentUrlBuilder } from "../../../packages/core/src/index";
import { ToolDescriptor } from "../../../packages/core/src/index";
import { checkScopes } from "../scopeStore";
import { HubContext, ExecuteToolRequest } from "../types";
import { logger } from "../logging/logger";

/**
 * Options for tool execution
 */
export interface ExecuteOptions {
  consentUrlBuilder?: ConsentUrlBuilder;
}

/**
 * Execute a tool with scope checking
 * 
 * For Phase 1, this is a placeholder that demonstrates scope checking.
 * In a full implementation, this would actually invoke the tool.
 * 
 * @param ctx - Hub context with client ID and scope grants
 * @param req - Tool execution request
 * @param tool - Tool descriptor with auth metadata
 * @param opts - Execution options
 * @returns Tool result, URL elicitation, or tool error
 */
export async function executeTool(
  ctx: HubContext,
  req: ExecuteToolRequest,
  tool: ToolDescriptor,
  opts: ExecuteOptions = {}
): Promise<any> {
  // Check if tool exists (this would be done by the caller in a real implementation)
  if (!tool) {
    return toolError(`Unknown tool: ${req.toolName}`);
  }

  // Check scopes before executing
  const scopeCheck = checkScopes(ctx.clientId, tool, ctx.grants);
  if (!scopeCheck.ok) {
    // Log scope failure
    logger.warn(
      {
        clientId: ctx.clientId,
        toolName: req.toolName,
        missingScopes: scopeCheck.missing,
      },
      "Scope check failed"
    );

    // Return URL elicitation instead of tool error
    const consentUrlBuilder = opts.consentUrlBuilder ?? defaultConsentUrlBuilder;
    
    // Extract provider ID from tool if available (could be stored in tool metadata)
    const providerId = (tool as any).providerId; // TODO: Add providerId to ToolDescriptor
    
    const url = consentUrlBuilder({
      clientId: ctx.clientId,
      providerId,
      missingScopes: scopeCheck.missing,
    });

    const elicitation: UrlElicitationResult = {
      type: "mcp/elicitation",
      mode: "url",
      url,
      reason: `Additional consent required for scopes: ${scopeCheck.missing.join(", ")}`,
    };

    logger.info(
      {
        clientId: ctx.clientId,
        toolName: req.toolName,
        url,
      },
      "Returning URL elicitation for missing scopes"
    );

    return elicitation;
  }

  // For Phase 1, this is a placeholder
  // In a full implementation, this would:
  // 1. Validate input against tool.inputSchema
  // 2. Invoke the actual tool (via MCP server, direct call, etc.)
  // 3. Return the result
  
  return {
    message: "Tool execution not yet implemented in Hub",
    toolName: req.toolName,
    arguments: req.arguments,
  };
}

