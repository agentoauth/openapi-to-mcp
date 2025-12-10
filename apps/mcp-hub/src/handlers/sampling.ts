/**
 * Sampling handler for MCP Hub
 * 
 * Handles sampling requests by forwarding them to the connected client.
 * For Phase 1, this is a stub that demonstrates the pattern.
 */

import {
  SamplingRequest,
  SamplingResponse,
} from "../../../packages/core/src/index";
import { HubContext } from "../types";
import { logger } from "../logging/logger";

/**
 * Handle sampling request
 * 
 * For Phase 1, this is a stub implementation. In a full implementation,
 * this would:
 * 1. Serialize the request
 * 2. Send it to the connected MCP client via the transport layer
 * 3. Wait for the response
 * 4. Return the SamplingResponse
 * 
 * @param ctx - Hub context
 * @param req - Sampling request
 * @returns Sampling response
 */
export async function handleSamplingRequest(
  ctx: HubContext,
  req: SamplingRequest
): Promise<SamplingResponse> {
  logger.info(
    {
      clientId: ctx.clientId,
      model: req.model,
      messageCount: req.messages.length,
    },
    "Sampling request received"
  );

  // TODO: In a full implementation, this would:
  // 1. Get the client connection from ctx
  // 2. Send the sampling request via the transport layer
  // 3. Wait for and return the response
  
  // For Phase 1, return a stub response
  // This demonstrates the interface but doesn't actually call the client's LLM
  const response: SamplingResponse = {
    type: "mcp/sampling-response",
    content: "[Sampling not yet implemented - this is a stub response]",
  };

  logger.info(
    {
      clientId: ctx.clientId,
      responseLength: response.content.length,
    },
    "Sampling response sent"
  );

  return response;
}

