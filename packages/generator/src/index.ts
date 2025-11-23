import { OpenAPIV3 } from "openapi-types";
import { loadOpenAPISpec } from "./openapiLoader";
import { extractOperationRefs, extractOperationsFromSpec } from "./operationExtractor";
import { applyTransforms } from "./transform";
import { TransformConfig } from "./types";
import { inferToolsFromOperations } from "./toolInferer";
import { renderMcpProject, RenderOptions } from "./projectRenderer";
import { AuthConfig } from "./models";

export interface GenerateMcpOptions extends Omit<RenderOptions, "outDir"> {
  transform?: TransformConfig;
}

export interface GeneratedMcpResult {
  toolsCount: number;
  outDir: string;
}

/**
 * Main generator function that creates an MCP server from an OpenAPI specification.
 * 
 * @param openapi - OpenAPI spec (can be a Document or a path/URL to load)
 * @param options - Generation options including output directory, transport, auth, and transforms
 * @returns Result with tool count and output directory
 */
export async function generateMcpFromOpenApi(
  openapi: OpenAPIV3.Document | string,
  options: GenerateMcpOptions & { outDir: string }
): Promise<GeneratedMcpResult> {
  // Load spec if it's a string (path or URL)
  const spec =
    typeof openapi === "string"
      ? await loadOpenAPISpec(openapi)
      : openapi;

  // Step 1: Extract lightweight operation references
  const operationRefs = extractOperationRefs(spec);

  // Step 2: Apply transforms if provided
  let filteredRefs = operationRefs;
  let overrides;
  if (options.transform) {
    const transformResult = applyTransforms(operationRefs, options.transform);
    filteredRefs = transformResult.filtered;
    overrides = transformResult.overrides;
  }

  // Step 3: Extract full operations for filtered refs only
  const parsed = extractOperationsFromSpec(spec, filteredRefs);

  // Step 4: Infer tools with overrides applied
  const tools = inferToolsFromOperations(parsed, overrides);

  // Step 5: Render the MCP project
  await renderMcpProject(tools, {
    outDir: options.outDir,
    serviceName: options.serviceName,
    authConfig: options.authConfig,
    transport: options.transport,
    apiBaseUrl: options.apiBaseUrl,
  });

  return {
    toolsCount: tools.length,
    outDir: options.outDir,
  };
}

// Keep the old stub for backward compatibility (can be removed later)
export function generateFromOpenAPI() {
  console.log("generator stub");
}
