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
  // CRITICAL: Check if this is actually text content masquerading as a file path
  // This can happen if text is truncated or newlines are lost
  // Check multiple indicators that suggest this is text content, not a file path:
  
  // 1. Contains newlines (file paths never have newlines)
  if (path.includes("\n") || path.includes("\r")) {
    throw new Error(
      `Invalid file path: The input contains newlines, which means it's text content, not a file path. ` +
      `This should have been detected earlier. Please check the detection logic. ` +
      `Received input (first 500 chars): ${path.substring(0, 500)}`
    );
  }
  
  // 2. Contains OpenAPI/Swagger keywords (even if truncated)
  if (path.toLowerCase().includes("openapi") || path.toLowerCase().includes("swagger") || 
      path.includes("#Last modified") || path.includes("openapi:") || path.includes("swagger:")) {
    throw new Error(
      `Invalid file path: The input appears to be OpenAPI spec text content (possibly truncated), not a file path. ` +
      `The text content should be automatically detected. ` +
      `This might indicate the text was truncated during transmission. ` +
      `Received input (first 500 chars): ${path.substring(0, 500)}`
    );
  }
  
  // 3. Too long to be a reasonable file path (Windows limit ~260, Linux ~4096)
  // We'll be conservative and use 500 as the limit
  if (path.length > 500) {
    throw new Error(
      `Invalid file path: The path is too long (${path.length} chars) to be a valid file path. ` +
      `This likely means it's text content that was not properly detected. ` +
      `Received input (first 500 chars): ${path.substring(0, 500)}`
    );
  }
  
  // Try to read the file - this will throw ENAMETOOLONG if the path is too long
  // or ENOENT if the file doesn't exist
  let raw: string;
  try {
    raw = await fs.readFile(path, "utf8");
  } catch (err: any) {
    // If we get ENAMETOOLONG or if the path looks like text content, provide a helpful error
    if (err.code === "ENAMETOOLONG" || err.message?.includes("ENAMETOOLONG")) {
      throw new Error(
        `Invalid file path: The path is too long or appears to be text content, not a file path. ` +
        `If you're pasting OpenAPI spec text, make sure it's being sent correctly. ` +
        `Path received (first 500 chars): ${path.substring(0, 500)}`
      );
    }
    throw err;
  }
  // Try JSON first, then YAML
  try {
    const doc = JSON.parse(raw);
    return convertSwagger2ToOpenAPI3(doc);
  } catch {
    // @ts-ignore - js-yaml doesn't have type definitions
    const yaml = require('js-yaml');
    const doc = yaml.load(raw);
    return convertSwagger2ToOpenAPI3(doc);
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
  
  // 2. Contains OpenAPI/Swagger keywords anywhere (even if truncated)
  if (lowerSource.includes("openapi") || lowerSource.includes("swagger") ||
      source.includes("openapi:") || source.includes("swagger:") ||
      source.includes("#Last modified") || source.includes("# Last modified")) {
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
  const hasYamlStructure = source.includes(":") && (source.includes("#") || source.length > 100);
  if (hasYamlStructure && source.length > 200) {
    return loadOpenAPISpecFromText(source);
  }
  
  // 7. Too long to be a file path (Windows limit ~260, Linux ~4096, we use 500)
  if (source.length > 500) {
    return loadOpenAPISpecFromText(source);
  }
  
  // Otherwise, treat as file path
  return loadOpenAPISpecFromFile(source);
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

