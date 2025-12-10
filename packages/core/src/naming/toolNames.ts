/**
 * MCP-compliant tool naming utilities
 * 
 * Tool names must:
 * - Be 1-128 characters long
 * - Contain only A-Z, a-z, 0-9, ., _, -
 * - Be model-friendly (readable, descriptive)
 */

export const TOOL_NAME_MAX_LENGTH = 128;
export const TOOL_NAME_REGEX = /^[A-Za-z0-9._-]+$/;

/**
 * Normalize a raw operation ID or path into an MCP-compliant tool name.
 * 
 * Examples:
 * - "getUserById" -> "getuserbyid"
 * - "/v1/customers/{id}:update" -> "customers_update"
 * - "createOrder" -> "createorder"
 * 
 * @param raw - Raw operation ID or path-like string
 * @returns Normalized tool name compliant with MCP spec
 */
export function normalizeToolName(raw: string): string {
  if (!raw || typeof raw !== "string") {
    return "tool";
  }

  // Strip path parameters (e.g., {id}, {userId})
  const withoutPathVars = raw.replace(/\{[^}]+\}/g, "");

  // Split by common separators: /, :, -, _
  const segments = withoutPathVars.split(/[\/:\-_]+/).filter(Boolean);

  if (segments.length === 0) {
    return "tool";
  }

  // Prefer last 1-2 segments for better readability
  // e.g., "v1/customers/create" -> "customers_create"
  // e.g., "getUserById" -> "getuserbyid"
  let base: string;
  if (segments.length >= 2) {
    // Take last 2 segments
    base = segments.slice(-2).join("_");
  } else {
    base = segments[segments.length - 1];
  }

  // Convert to lowercase
  base = base.toLowerCase();

  // Replace invalid characters with underscore
  base = base.replace(/[^a-z0-9._-]/g, "_");

  // Remove leading/trailing underscores and collapse multiple underscores
  base = base.replace(/^_+|_+$/g, "").replace(/__+/g, "_");

  // Ensure we have something
  if (!base) {
    base = "tool";
  }

  // Enforce max length (take from end if too long)
  if (base.length > TOOL_NAME_MAX_LENGTH) {
    base = base.slice(-TOOL_NAME_MAX_LENGTH);
    // Remove leading underscore if we cut in the middle
    base = base.replace(/^_+/, "");
  }

  return base;
}

/**
 * Validate that a tool name is MCP-compliant.
 * 
 * @param name - Tool name to validate
 * @returns true if the name is valid, false otherwise
 */
export function isValidToolName(name: string): boolean {
  if (!name || typeof name !== "string") {
    return false;
  }

  return (
    name.length >= 1 &&
    name.length <= TOOL_NAME_MAX_LENGTH &&
    TOOL_NAME_REGEX.test(name)
  );
}

