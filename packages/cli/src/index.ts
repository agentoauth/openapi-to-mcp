#!/usr/bin/env node

import { Command } from "commander";
import { loadOpenAPISpec, extractBaseUrlFromSpec } from "../../generator/src/openapiLoader";
import { extractOperationsFromSpec } from "../../generator/src/operationExtractor";
import { inferToolsFromOperations } from "../../generator/src/toolInferer";
import { renderMcpProject } from "../../generator/src/projectRenderer";
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

    const parsed = extractOperationsFromSpec(spec);
    const tools = inferToolsFromOperations(parsed);

    console.log(`Found ${tools.length} operations, generating MCP project...`);

    const transportType = (transport || "stdio") as "stdio" | "http";

    await renderMcpProject(tools, {
      outDir,
      serviceName,
      authConfig,
      transport: transportType,
      apiBaseUrl: finalApiBaseUrl,
    });

    console.log(`MCP project generated at: ${outDir}`);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
