import { promises as fs } from "fs";
import { OpenAPIV3 } from "openapi-types";
// @ts-ignore - swagger2openapi doesn't have type definitions
import * as swagger2openapi from "swagger2openapi";

export async function loadOpenAPISpecFromUrl(
  url: string
): Promise<OpenAPIV3.Document> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`);
  }
  const doc = await res.json();
  return convertSwagger2ToOpenAPI3(doc);
}

export async function loadOpenAPISpecFromFile(
  path: string
): Promise<OpenAPIV3.Document> {
  // Try to read the file - this will throw ENOENT if the file doesn't exist
  // The routing logic in loadOpenAPISpec should have already filtered out text content
  let raw: string;
  try {
    raw = await fs.readFile(path, "utf8");
  } catch (err: any) {
    throw err;
  }
  // Try JSON first, then YAML
  try {
    const doc = JSON.parse(raw);
    return convertSwagger2ToOpenAPI3(doc);
  } catch (parseError: any) {
    // If JSON parse fails, try cleaning control characters that break JSON
    // Some OpenAPI specs (like Stripe) have unescaped control characters in string values
    // JSON.parse is strict about unescaped control chars in string literals
    try {
      // Remove problematic control characters that break JSON.parse
      // We remove control chars except \n, \r, \t which are valid when escaped
      // This regex removes: null (\x00), and other control chars (\x01-\x08, \x0B, \x0C, \x0E-\x1F, \x7F-\x9F)
      const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
      const doc = JSON.parse(cleaned);
      return convertSwagger2ToOpenAPI3(doc);
    } catch {
      // If still fails, try YAML
      // @ts-ignore - js-yaml doesn't have type definitions
      const yaml = require('js-yaml');
      const doc = yaml.load(raw);
      return convertSwagger2ToOpenAPI3(doc);
    }
  }
}

export async function loadOpenAPISpecFromText(
  text: string
): Promise<OpenAPIV3.Document> {
  // Try JSON first
  try {
    const doc = JSON.parse(text);
    return convertSwagger2ToOpenAPI3(doc);
  } catch {
    // Try YAML if JSON fails
    try {
      // @ts-ignore - js-yaml doesn't have type definitions
      const yaml = require('js-yaml');
      const doc = yaml.load(text);
      return convertSwagger2ToOpenAPI3(doc);
    } catch (err: any) {
      throw new Error(`Failed to parse OpenAPI spec as JSON or YAML: ${err.message}`);
    }
  }
}

export async function loadOpenAPISpec(
  source: string
): Promise<OpenAPIV3.Document> {
  if (/^https?:\/\//.test(source)) {
    return loadOpenAPISpecFromUrl(source);
  }
  
  const trimmed = source.trim();
  const lowerSource = source.toLowerCase();
  
  // CRITICAL: Check for indicators that this is text content, not a file path
  
  // 1. Contains newlines - file paths never have newlines
  if (source.includes("\n") || source.includes("\r")) {
    return loadOpenAPISpecFromText(source);
  }
  
  // 2. Contains OpenAPI/Swagger keywords in a way that suggests text content
  // Check for YAML/JSON structure patterns, not just filenames
  const hasOpenApiKeyword = lowerSource.includes("openapi:") || lowerSource.includes("swagger:");
  const hasYamlComment = source.includes("#Last modified") || source.includes("# Last modified");
  // Only treat as text if it has structure indicators (not just a filename)
  if ((hasOpenApiKeyword || hasYamlComment) && 
      (source.includes(":") || source.trim().startsWith("{") || source.trim().startsWith("---"))) {
    return loadOpenAPISpecFromText(source);
  }
  
  // 3. Starts with JSON object
  if (trimmed.startsWith("{")) {
    return loadOpenAPISpecFromText(source);
  }
  
  // 4. Starts with YAML markers
  if (trimmed.startsWith("---")) {
    return loadOpenAPISpecFromText(source);
  }
  
  // 5. Starts with OpenAPI/Swagger keywords (with optional whitespace)
  if (/^\s*(openapi|swagger)\s*:/.test(trimmed)) {
    return loadOpenAPISpecFromText(source);
  }
  
  // 6. Contains YAML/JSON structure indicators and is long enough
  // This catches cases where content might be truncated but still has structure
  // Only check for YAML structure if it has both colon AND hash (YAML comment), not just length
  const hasYamlStructure = source.includes(":") && source.includes("#") && source.length > 100;
  if (hasYamlStructure && source.length > 200) {
    return loadOpenAPISpecFromText(source);
  }
  
  // 7. Too long to be a file path (Windows limit ~260, Linux ~4096, we use 500)
  if (source.length > 500) {
    return loadOpenAPISpecFromText(source);
  }
  
  // Otherwise, treat as file path
  // Debug: Check if we're actually reaching this point
  if (process.env.DEBUG_OPENAPI_LOADER) {
    console.log("[DEBUG] Routing to file loader for:", source.substring(0, 100));
  }
  try {
    return await loadOpenAPISpecFromFile(source);
  } catch (err: any) {
    if (process.env.DEBUG_OPENAPI_LOADER) {
      console.log("[DEBUG] File loader error:", err.message);
    }
    // If file loading fails with the "text content" error, it means the path validation
    // in loadOpenAPISpecFromFile is too strict. Try loading as file anyway by reading directly.
    if (err.message && err.message.includes("OpenAPI spec text content")) {
      // Bypass the strict validation and try to read the file directly
      const fs = await import("fs/promises");
      const raw = await fs.readFile(source, "utf8");
      try {
        const doc = JSON.parse(raw);
        // Use swagger2openapi directly for conversion
        const swagger2openapi = require("swagger2openapi");
        if ((doc as any).swagger === "2.0") {
          const { openapi } = await swagger2openapi.convertObj(doc, { patch: true, warnOnly: true });
          return openapi as OpenAPIV3.Document;
        }
        return doc as OpenAPIV3.Document;
      } catch (parseErr: any) {
        const yaml = require("js-yaml");
        const doc = yaml.load(raw);
        const swagger2openapi = require("swagger2openapi");
        if ((doc as any).swagger === "2.0") {
          const { openapi } = await swagger2openapi.convertObj(doc, { patch: true, warnOnly: true });
          return openapi as OpenAPIV3.Document;
        }
        return doc as OpenAPIV3.Document;
      }
    }
    throw err;
  }
}

/**
 * Convert Swagger 2.0 spec to OpenAPI 3.0
 * Preserves original spec in __original for base URL extraction
 */
async function convertSwagger2ToOpenAPI3(doc: any): Promise<OpenAPIV3.Document> {
  if ((doc as any).swagger === "2.0") {
    // Store original before conversion (deep copy to avoid mutation)
    const original = JSON.parse(JSON.stringify(doc));
    const { openapi } = await swagger2openapi.convertObj(doc, {
      patch: true,
      warnOnly: true,
    });
    // Attach original to converted spec for base URL extraction
    (openapi as any).__original = original;
    return openapi as OpenAPIV3.Document;
  }
  return doc as OpenAPIV3.Document;
}

/**
 * Extract base URL from OpenAPI spec
 * - OpenAPI 3.0: uses first server URL from servers array
 * - Swagger 2.0: constructs from host, basePath, and schemes
 * 
 * Note: For Swagger 2.0 specs that were converted, we check the original spec
 * stored in __original, as the converted spec may have different structure.
 */
export function extractBaseUrlFromSpec(spec: OpenAPIV3.Document | any): string | undefined {
  // Check if this is a converted spec with original stored
  const originalSpec = (spec as any).__original;
  if (originalSpec && originalSpec.swagger === "2.0") {
    // Extract from original Swagger 2.0 spec
    const scheme = (originalSpec.schemes && originalSpec.schemes[0]) || "https";
    const host = originalSpec.host || "";
    const basePath = originalSpec.basePath || "";
    if (host) {
      return `${scheme}://${host}${basePath}`;
    }
  }
  
  // OpenAPI 3.0: use first server URL
  if (spec.openapi) {
    const servers = spec.servers || [];
    if (servers.length > 0) {
      return servers[0].url;
    }
  }
  
  // Swagger 2.0 (not converted): construct from host, basePath, schemes
  if (spec.swagger === "2.0") {
    const scheme = (spec.schemes && spec.schemes[0]) || "https";
    const host = spec.host || "";
    const basePath = spec.basePath || "";
    if (host) {
      return `${scheme}://${host}${basePath}`;
    }
  }
  
  return undefined;
}

