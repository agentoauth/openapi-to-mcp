/**
 * Task Registry for MCP Hub
 * 
 * Manages task lifecycle for MCP 2025 task-started and task-status messages.
 * Tasks are stored in-memory for Phase 1.
 */

export type TaskStatusType = "pending" | "running" | "succeeded" | "failed";

/**
 * Hub task representation
 */
export interface HubTask {
  id: string;
  status: TaskStatusType;
  result?: unknown;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Task Registry
 * 
 * In-memory storage for tasks. Can be replaced with persistent storage
 * (database, Redis, etc.) in future phases.
 */
export class TaskRegistry {
  private tasks = new Map<string, HubTask>();

  /**
   * Create a new task
   * 
   * @param id - Task identifier
   * @returns Created task with status "pending"
   */
  create(id: string): HubTask {
    const now = Date.now();
    const task: HubTask = {
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, task);
    return task;
  }

  /**
   * Update an existing task
   * 
   * @param id - Task identifier
   * @param patch - Partial task update (id and createdAt cannot be changed)
   * @returns Updated task, or undefined if task not found
   */
  update(
    id: string,
    patch: Partial<Omit<HubTask, "id" | "createdAt">>
  ): HubTask | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updated: HubTask = {
      ...existing,
      ...patch,
      updatedAt: Date.now(),
    };

    this.tasks.set(id, updated);
    return updated;
  }

  /**
   * Get a task by ID
   * 
   * @param id - Task identifier
   * @returns Task, or undefined if not found
   */
  get(id: string): HubTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * Delete a task
   * 
   * @param id - Task identifier
   * @returns true if task was deleted, false if not found
   */
  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * List all tasks (for debugging/admin purposes)
   * 
   * @returns Array of all tasks
   */
  list(): HubTask[] {
    return Array.from(this.tasks.values());
  }
}

