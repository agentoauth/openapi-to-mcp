/**
 * Centralized configuration for MCP Hub capabilities.
 * Determines what features are enabled based on environment variables.
 */

export const capabilities = {
  /**
   * Cloudflare deployment is enabled only if:
   * 1. ENABLE_CLOUDFLARE_DEPLOY is set to "true"
   * 2. CF_ACCOUNT_ID is provided
   * 3. CF_API_TOKEN is provided
   */
  deployEnabled:
    process.env.ENABLE_CLOUDFLARE_DEPLOY === "true" &&
    !!process.env.CF_ACCOUNT_ID &&
    !!process.env.CF_API_TOKEN,
};


