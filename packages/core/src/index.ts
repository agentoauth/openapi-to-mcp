// Core concepts used by generator, CLI, and Studio

// Export JSON Schema types
export { JsonSchema, JSON_SCHEMA_2020_12 } from "./schema/jsonSchema";

// Export naming utilities
export { normalizeToolName, isValidToolName, TOOL_NAME_MAX_LENGTH, TOOL_NAME_REGEX } from "./naming/toolNames";

// Export error types and helpers
export { McpError, McpErrorType, toolError, protocolError } from "./mcp/errors";

// Export auth and scope metadata
export { ToolAuthMetadata, ToolDescriptor } from "./auth/scopeMetadata";

// Export consent URL builder
export { ConsentUrlOptions, ConsentUrlBuilder, defaultConsentUrlBuilder } from "./auth/consentUrl";

// Export MCP 2025 message types
export {
  UrlElicitationResult,
  TaskStarted,
  TaskStatus,
  SamplingRequest,
  SamplingResponse,
  SamplingMessage,
  SamplingClient,
  HubCapabilities,
} from "./mcp/messages";

/**
 * MCP Tool definition.
 * Represents a tool that can be executed by an MCP server.
 */
export type MCPTool = {
  name: string;
  description: string;
  inputSchema: unknown; // JSON Schema-ish
  // Optionally: outputSchema, timeoutMs, etc.
};

/**
 * MCP Server configuration.
 * Defines the complete configuration for an MCP server.
 */
export type MCPServerConfig = {
  name: string;
  description?: string;
  tools: MCPTool[];
};

/**
 * Lightweight reference to an OpenAPI operation.
 * Used for early-stage filtering and transformation before full extraction.
 */
export type OpenAPIOperationRef = {
  operationId: string;
  path: string;
  method: string;
};

/**
 * Options for generating an MCP server from an OpenAPI specification.
 */
export interface GenerateFromOpenApiOptions {
  /** Path to OpenAPI spec file or URL */
  openapiPath: string;
  /** Output directory for generated MCP server */
  outDir: string;
  /** Overwrite output directory if it exists */
  overwrite?: boolean;
  /** Service name (auto-detected from spec if not provided) */
  serviceName?: string;
  /** Authentication configuration */
  authConfig?: {
    type: "none" | "apiKey" | "bearer";
    headerName?: string;
    envVar?: string;
  };
  /** Transport type: stdio (default) or http */
  transport?: "stdio" | "http";
  /** API base URL (auto-detected from spec if not provided) */
  apiBaseUrl?: string;
  /** Transform/filter configuration */
  transform?: {
    includeTags?: string[];
    excludeTags?: string[];
    includePaths?: string[];
    excludePaths?: string[];
    tools?: Record<string, { enabled?: boolean; name?: string; description?: string }>;
  };
}

/**
 * Result of generating an MCP server.
 */
export interface GenerateFromOpenApiResult {
  /** Number of tools generated */
  toolsCount: number;
  /** Output directory path */
  outDir: string;
}

/**
 * Generate an MCP server from an OpenAPI specification.
 * This is a wrapper around the generator package that provides a simplified API.
 * 
 * @param options - Generation options
 * @returns Result with tool count and output directory
 */
export async function generateFromOpenApi(
  options: GenerateFromOpenApiOptions
): Promise<GenerateFromOpenApiResult> {
  // Dynamic imports to avoid circular dependencies
  // Priority: 1) Bundled (published), 2) Monorepo dist, 3) Monorepo source
  const pathModule = await import("path");
  const fsModule = await import("fs/promises");
  
  // __dirname in compiled code will be dist/ (since rootDir is "src", dist/index.js -> __dirname = dist/)
  // Try bundled version first (for published package)
  const bundledGeneratorPath = pathModule.resolve(__dirname, "bundled/generator/index.js");
  let generatorPath: string;
  let loaderPath: string;
  let configPath: string;
  
  try {
    await fsModule.access(bundledGeneratorPath);
    // Use bundled version (published package)
    generatorPath = pathModule.resolve(__dirname, "bundled/generator/index");
    loaderPath = pathModule.resolve(__dirname, "bundled/generator/openapiLoader");
    configPath = pathModule.resolve(__dirname, "bundled/generator/config");
  } catch {
    // Try monorepo dist (for development after root build)
    const distGeneratorPath = pathModule.resolve(__dirname, "../../../../../dist/generator/src/index.js");
    try {
      await fsModule.access(distGeneratorPath);
      // Use compiled version with absolute paths
      generatorPath = pathModule.resolve(__dirname, "../../../../../dist/generator/src/index");
      loaderPath = pathModule.resolve(__dirname, "../../../../../dist/generator/src/openapiLoader");
      configPath = pathModule.resolve(__dirname, "../../../../../dist/generator/src/config");
    } catch {
      // Fall back to source (for development with ts-node)
      generatorPath = pathModule.resolve(__dirname, "../../generator/src/index");
      loaderPath = pathModule.resolve(__dirname, "../../generator/src/openapiLoader");
      configPath = pathModule.resolve(__dirname, "../../generator/src/config");
    }
  }
  
  const { generateMcpFromOpenApi } = await import(generatorPath);
  const { loadOpenAPISpec, extractBaseUrlFromSpec } = await import(loaderPath);
  const { loadTransformConfig } = await import(configPath);
  const path = pathModule;
  const fs = fsModule;

  // Check if output directory exists and handle overwrite
  try {
    const stats = await fs.stat(options.outDir);
    if (stats.isDirectory() && !options.overwrite) {
      throw new Error(`Output directory already exists: ${options.outDir}. Use --force to overwrite.`);
    }
  } catch (err: any) {
    // Directory doesn't exist, which is fine - we'll create it
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  // Load OpenAPI spec
  const spec = await loadOpenAPISpec(options.openapiPath);

  // Auto-detect service name from spec if not provided
  let serviceName = options.serviceName;
  if (!serviceName) {
    // Try to get from spec.info.title
    if (spec.info?.title) {
      // Convert title to a valid package name (lowercase, replace spaces/special chars with hyphens)
      serviceName = spec.info.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    } else {
      // Fall back to filename
      const basename = path.basename(options.openapiPath, path.extname(options.openapiPath));
      serviceName = basename.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    }
  }

  // Auto-detect auth from spec if not provided
  // IMPORTANT: Only auto-detect if authConfig is not provided or explicitly set to "none"
  // If authConfig is provided with a valid type, use it and skip auto-detection
  let authConfig = options.authConfig;
  if (!authConfig || (authConfig.type === "none")) {
    // Check if spec has security requirements
    const securitySchemes = spec.components?.securitySchemes;
    const security = spec.security;
    
    if (securitySchemes && Object.keys(securitySchemes).length > 0) {
      // Get first security scheme
      const firstSchemeName = Object.keys(securitySchemes)[0];
      const firstScheme = securitySchemes[firstSchemeName];
      
      if (firstScheme && "type" in firstScheme) {
        const safeServiceName = serviceName || "mcp-server";
        if (firstScheme.type === "http" && firstScheme.scheme === "bearer") {
          authConfig = {
            type: "bearer",
            headerName: "Authorization",
            envVar: `${safeServiceName.toUpperCase().replace(/-/g, "_")}_TOKEN`,
          };
        } else if (firstScheme.type === "apiKey") {
          authConfig = {
            type: "apiKey",
            headerName: firstScheme.name || "X-API-Key",
            envVar: `${safeServiceName.toUpperCase().replace(/-/g, "_")}_API_KEY`,
          };
        }
      }
    }
  }

  // Auto-detect API base URL if not provided and transport is http
  let apiBaseUrl = options.apiBaseUrl;
  if (!apiBaseUrl && options.transport === "http") {
    apiBaseUrl = extractBaseUrlFromSpec(spec);
  }

  // Build transform config
  let transformConfig = options.transform;
  if (!transformConfig && options.transform) {
    // If transform options are provided as simple arrays, convert to TransformConfig
    transformConfig = options.transform;
  }

  // Convert simplified auth config to generator's AuthConfig format
  const generatorAuthConfig = authConfig && authConfig.type !== "none" ? {
    type: authConfig.type as "apiKey" | "bearer",
    headerName: authConfig.headerName,
    envVar: authConfig.envVar,
  } : undefined;

  // Call the generator
  const result = await generateMcpFromOpenApi(spec, {
    outDir: options.outDir,
    serviceName,
    authConfig: generatorAuthConfig,
    transport: options.transport || "stdio",
    apiBaseUrl,
    transform: transformConfig,
  });

  return result;
}

