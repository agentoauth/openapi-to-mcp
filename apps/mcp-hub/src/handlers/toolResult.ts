/**
 * Tool result handler for MCP Hub
 * 
 * Handles MCP 2025 result types including URL elicitation,
 * tasks, and sampling. For Phase 1, this manages task state.
 */

import {
  UrlElicitationResult,
  TaskStarted,
  TaskStatus,
  SamplingRequest,
  SamplingResponse,
  McpError,
} from "../../../packages/core/src/index";
import { HubContext } from "../types";
import { logger } from "../logging/logger";

/**
 * Union type of all possible tool results
 */
export type ToolResult =
  | UrlElicitationResult
  | TaskStarted
  | TaskStatus
  | SamplingRequest
  | SamplingResponse
  | McpError
  | any; // Existing result types (plain objects, etc.)

/**
 * Handle tool result
 * 
 * Processes MCP 2025 result types:
 * - Creates tasks when receiving mcp/task-started
 * - Updates tasks when receiving mcp/task-status
 * - Passes through other result types
 * 
 * @param ctx - Hub context with task registry
 * @param result - Tool execution result
 * @returns Result (possibly modified for task management)
 */
export function handleToolResult(ctx: HubContext, result: ToolResult): ToolResult {
  // Handle task-started: create task in registry
  if (result && typeof result === "object" && result.type === "mcp/task-started") {
    const taskStarted = result as TaskStarted;
    ctx.tasks.create(taskStarted.taskId);
    logger.info(
      {
        taskId: taskStarted.taskId,
        clientId: ctx.clientId,
        estimatedSeconds: taskStarted.estimatedSeconds,
      },
      "Task created"
    );
    // Forward to client
    return result as TaskStarted;
  }

  // Handle task-status: update task in registry
  if (result && typeof result === "object" && result.type === "mcp/task-status") {
    const taskStatus = result as TaskStatus;
    ctx.tasks.update(taskStatus.taskId, {
      status: taskStatus.status,
      result: taskStatus.result,
      error: taskStatus.error,
    });
    logger.info(
      {
        taskId: taskStatus.taskId,
        clientId: ctx.clientId,
        status: taskStatus.status,
      },
      "Task status updated"
    );
    // Forward to client
    return result as TaskStatus;
  }

  // For other types, pass through unchanged
  return result;
}

