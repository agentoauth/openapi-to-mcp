import { OperationRef, TransformConfig, OperationOverrides } from "./types";

/**
 * Apply transform configuration to filter and customize operations.
 * Returns filtered operations and a map of operationId → overrides.
 */
export function applyTransforms(
  operations: OperationRef[],
  config: TransformConfig
): {
  filtered: OperationRef[];
  overrides: OperationOverrides;
} {
  let filtered = [...operations];
  const overrides = new Map<string, { name?: string; description?: string }>();

  // Step 1: Filter by tags
  if (config.includeTags && config.includeTags.length > 0) {
    filtered = filtered.filter((op) => {
      // Operation must have at least one tag in includeTags
      return op.tags.some((tag) => config.includeTags!.includes(tag));
    });
  }

  if (config.excludeTags && config.excludeTags.length > 0) {
    filtered = filtered.filter((op) => {
      // Operation must not have any tag in excludeTags
      return !op.tags.some((tag) => config.excludeTags!.includes(tag));
    });
  }

  // Step 2: Filter by paths
  if (config.includePaths && config.includePaths.length > 0) {
    filtered = filtered.filter((op) => {
      return config.includePaths!.some((pattern) => matchesPathPattern(op.path, pattern));
    });
  }

  if (config.excludePaths && config.excludePaths.length > 0) {
    filtered = filtered.filter((op) => {
      return !config.excludePaths!.some((pattern) => matchesPathPattern(op.path, pattern));
    });
  }

  // Step 3: Filter by operation-level enabled flag and collect overrides
  if (config.tools) {
    filtered = filtered.filter((op) => {
      const toolConfig = config.tools![op.operationId];
      if (!toolConfig) {
        return true; // No config for this operation, keep it
      }

      // Check if explicitly disabled
      if (toolConfig.enabled === false) {
        return false;
      }

      // Collect name/description overrides
      if (toolConfig.name || toolConfig.description) {
        overrides.set(op.operationId, {
          name: toolConfig.name,
          description: toolConfig.description,
        });
      }

      return true;
    });
  }

  return { filtered, overrides };
}

/**
 * Check if a path matches a pattern.
 * Supports:
 * - Exact match: "/api/v1/users"
 * - Wildcard suffix: "/api/v1/STAR" matches paths like "/api/v1/users" (STAR = *)
 * - Wildcard anywhere: "/api/STAR/users" matches paths like "/api/v1/users" (STAR = *)
 */
function matchesPathPattern(path: string, pattern: string): boolean {
  // Exact match
  if (path === pattern) {
    return true;
  }

  // Convert pattern to regex
  // Escape special regex chars except *
  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  const regex = new RegExp(`^${escapedPattern}$`);
  return regex.test(path);
}

