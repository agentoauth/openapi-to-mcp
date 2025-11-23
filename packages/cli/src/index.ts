#!/usr/bin/env node

import { Command } from "commander";
import { loadOpenAPISpec, extractBaseUrlFromSpec } from "../../generator/src/openapiLoader";
import { generateMcpFromOpenApi } from "../../generator/src/index";
import { loadTransformConfig } from "../../generator/src/config";
import { TransformConfig } from "../../generator/src/types";
import { AuthConfig, AuthType } from "../../generator/src/models";

const program = new Command();

program
  .name("mcp-from-openapi")
  .description("Generate an MCP server from an OpenAPI spec")
  .requiredOption("-o, --openapi <pathOrUrl>", "OpenAPI spec path or URL")
  .option("--out <dir>", "Output directory", "scratch/generated-mcp")
  .option("--service-name <name>", "Service name for MCP", "service")
  .option("--auth-type <type>", "Auth type: none | apiKey | bearer", "none")
  .option("--auth-header <name>", "Auth header name (e.g. X-API-Key or Authorization)")
  .option("--auth-env <name>", "Env var name for auth token")
  .option("--transport <type>", "Transport: stdio | http", "stdio")
  .option("--api-base-url <url>", "API base URL for HTTP transport (e.g., https://api.weather.gov)")
  .option("--config <path>", "Path to transform config file (JSON or YAML)")
  .option("--include-tags <tags>", "Comma-separated list of tags to include")
  .option("--exclude-tags <tags>", "Comma-separated list of tags to exclude")
  .option("--include-paths <paths>", "Comma-separated list of path patterns to include")
  .option("--exclude-paths <paths>", "Comma-separated list of path patterns to exclude")
  .action(async (opts) => {
    const {
      openapi,
      out: outDir,
      serviceName,
      authType,
      authHeader,
      authEnv,
      transport,
      apiBaseUrl,
      config: configPath,
      includeTags,
      excludeTags,
      includePaths,
      excludePaths,
    } = opts;

    let authConfig: AuthConfig | undefined;

    const normalizedAuthType = (authType || "none") as AuthType;

    if (normalizedAuthType !== "none") {
      if (!authEnv) {
        throw new Error(
          "auth-env is required when auth-type is apiKey or bearer"
        );
      }

      const headerName =
        authHeader ||
        (normalizedAuthType === "apiKey" ? "X-API-Key" : "Authorization");

      authConfig = {
        type: normalizedAuthType,
        headerName,
        envVar: authEnv,
      };
    }

    // Build TransformConfig from config file or CLI flags
    let transformConfig: TransformConfig | undefined;

    if (configPath) {
      // Load from config file
      console.log(`Loading transform config from: ${configPath}`);
      try {
        transformConfig = loadTransformConfig(configPath);
      } catch (err: any) {
        console.error(`Failed to load transform config: ${err.message}`);
        process.exit(1);
      }
    } else {
      // Build from CLI flags
      const hasFlags =
        includeTags || excludeTags || includePaths || excludePaths;
      if (hasFlags) {
        transformConfig = {
          includeTags: includeTags
            ? includeTags.split(",").map((t: string) => t.trim())
            : undefined,
          excludeTags: excludeTags
            ? excludeTags.split(",").map((t: string) => t.trim())
            : undefined,
          includePaths: includePaths
            ? includePaths.split(",").map((p: string) => p.trim())
            : undefined,
          excludePaths: excludePaths
            ? excludePaths.split(",").map((p: string) => p.trim())
            : undefined,
        };
      }
    }

    console.log(`Loading OpenAPI spec from: ${openapi}`);
    const spec = await loadOpenAPISpec(openapi);

    // Auto-detect base URL from spec if not provided
    let finalApiBaseUrl = apiBaseUrl;
    if (!finalApiBaseUrl && transport === "http") {
      const detectedBaseUrl = extractBaseUrlFromSpec(spec);
      if (detectedBaseUrl) {
        finalApiBaseUrl = detectedBaseUrl;
        console.log(`Detected API base URL from spec: ${detectedBaseUrl}`);
      }
    }

    const transportType = (transport || "stdio") as "stdio" | "http";

    // Use the new generator function
    const result = await generateMcpFromOpenApi(spec, {
      outDir,
      serviceName,
      authConfig,
      transport: transportType,
      apiBaseUrl: finalApiBaseUrl,
      transform: transformConfig,
    });

    console.log(`Generated ${result.toolsCount} tools`);
    console.log(`MCP project generated at: ${result.outDir}`);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
