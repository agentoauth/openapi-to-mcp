/**
 * Origin validation for MCP Hub
 * 
 * Validates request origins against an allowlist for security.
 * Permissive by default (allows all origins if no allowlist is configured).
 */

/**
 * Validate request origin
 * 
 * Checks if the origin header is in the allowed origins list.
 * If no allowlist is configured (OPENMCP_ALLOWED_ORIGINS env var is empty),
 * all origins are allowed (permissive mode).
 * 
 * @param originHeader - Origin header from request
 * @returns Validation result with ok flag and optional reason
 */
export function validateOrigin(originHeader: string | undefined): { ok: boolean; reason?: string } {
  const allowedOrigins = process.env.OPENMCP_ALLOWED_ORIGINS
    ?.split(",")
    .map(s => s.trim())
    .filter(Boolean) ?? [];

  // If no allowlist configured, allow all (permissive mode)
  if (allowedOrigins.length === 0) {
    return { ok: true };
  }

  // If no origin header provided, reject
  if (!originHeader) {
    return { ok: false, reason: "Origin header missing" };
  }

  // Check if origin is in allowlist
  const ok = allowedOrigins.includes(originHeader);
  return ok
    ? { ok: true }
    : { ok: false, reason: `Origin ${originHeader} not in allowlist` };
}

