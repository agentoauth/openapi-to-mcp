/**
 * Tool context factory for MCP Hub
 * 
 * Creates a ToolContext that can be passed to generated MCP servers.
 * Includes sampling client for MCP 2025 sampling requests.
 */

import { SamplingClient } from "../../../packages/core/src/index";
import { HubContext } from "../types";
import { handleSamplingRequest } from "../handlers/sampling";

/**
 * Tool context interface
 * 
 * This is what gets passed to generated tool functions.
 * Extend this as needed for additional context (logger, env, http, etc.)
 */
export interface ToolContext {
  sampling?: SamplingClient;
  // Additional fields can be added here:
  // logger?: Logger;
  // env?: Record<string, string>;
  // http?: HttpClient;
}

/**
 * Create tool context from Hub context
 * 
 * @param ctx - Hub context
 * @returns Tool context with sampling client
 */
export function createToolContext(ctx: HubContext): ToolContext {
  const samplingClient: SamplingClient = {
    sample: (req) => handleSamplingRequest(ctx, req),
  };

  return {
    sampling: samplingClient,
  };
}

/**
 * Helper function to sample with client LLM
 * 
 * Convenience wrapper for tools to use sampling.
 * 
 * @param ctx - Tool context
 * @param req - Sampling request (without type field)
 * @returns Sampling response
 */
export async function sampleWithClientLLM(
  ctx: ToolContext,
  req: Omit<import("../../../packages/core/src/index").SamplingRequest, "type">
): Promise<import("../../../packages/core/src/index").SamplingResponse> {
  if (!ctx.sampling) {
    throw new Error("Sampling client not configured on ToolContext");
  }

  return ctx.sampling.sample({
    type: "mcp/sampling-request",
    ...req,
  });
}

