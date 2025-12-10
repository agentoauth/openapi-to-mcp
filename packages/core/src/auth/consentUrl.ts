/**
 * Consent URL builder for OAuth2-style authorization
 * 
 * Generates URLs for user consent flows when scopes are missing.
 * This is a placeholder that can be replaced with a real OAuth gateway.
 */

/**
 * Options for building a consent URL
 */
export interface ConsentUrlOptions {
  clientId: string;
  providerId?: string;
  missingScopes: string[];
}

/**
 * Function type for building consent URLs
 */
export type ConsentUrlBuilder = (opts: ConsentUrlOptions) => string;

/**
 * Default consent URL builder
 * 
 * Creates a placeholder URL with consent parameters.
 * This can be replaced with a real OAuth gateway implementation later.
 * 
 * @param opts - Consent URL options
 * @returns Consent URL
 */
export const defaultConsentUrlBuilder: ConsentUrlBuilder = (opts) => {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    scopes: opts.missingScopes.join(" "),
    provider: opts.providerId ?? "default",
  });

  return `https://openmcp.local/consent?${params.toString()}`;
};

