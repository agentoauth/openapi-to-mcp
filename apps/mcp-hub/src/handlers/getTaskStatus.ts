/**
 * Task status handler for MCP Hub
 * 
 * Retrieves task status from the registry and returns it in MCP 2025 format.
 */

import { TaskStatus } from "../../../packages/core/src/index";
import { toolError } from "../../../packages/core/src/index";
import { HubContext } from "../types";

/**
 * Get task status
 * 
 * @param ctx - Hub context with task registry
 * @param args - Request arguments with taskId
 * @returns TaskStatus message or tool error
 */
export async function handleGetTaskStatus(
  ctx: HubContext,
  args: { taskId: string }
): Promise<TaskStatus | ReturnType<typeof toolError>> {
  const task = ctx.tasks.get(args.taskId);
  
  if (!task) {
    return toolError(`Unknown task: ${args.taskId}`);
  }

  const status: TaskStatus = {
    type: "mcp/task-status",
    taskId: task.id,
    status: task.status,
    result: task.result,
    error: task.error,
  };

  return status;
}

