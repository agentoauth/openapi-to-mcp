#!/usr/bin/env node

import { Command } from "commander";
import path from "node:path";
import { generateFromOpenApi } from "openmcp-core";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

const program = new Command();

program
  .name("mcp")
  .description("Generate and run MCP servers from OpenAPI specs")
  .version("1.5.0");

// Helper to manually parse options that Commander.js might miss
function getOptionValue(args: string[], optionName: string): string | boolean | undefined {
  const longIndex = args.indexOf(`--${optionName}`);
  if (longIndex > -1 && longIndex + 1 < args.length) {
    return args[longIndex + 1];
  }
  // Check for --option=value format
  const longEquals = args.find(arg => arg.startsWith(`--${optionName}=`));
  if (longEquals) {
    return longEquals.split('=')[1];
  }
  // Check for boolean flags
  if (args.includes(`--${optionName}`)) {
    return true;
  }
  return undefined;
}

// Helper to add advanced options to a command
function addAdvancedOptions(cmd: Command) {
  cmd
    .option("--transport <type>", "Transport type: stdio or http", "stdio")
    .option("--auth-type <type>", "Auth type: none, apiKey, or bearer")
    .option("--auth-header <name>", "Auth header name (e.g. X-API-Key or Authorization)")
    .option("--auth-env <name>", "Environment variable name for auth token")
    .option("--api-base-url <url>", "API base URL for HTTP transport")
    .option("--config <file>", "Path to transform config file (JSON or YAML)")
    .option("--include-tags <tags>", "Comma-separated list of tags to include")
    .option("--exclude-tags <tags>", "Comma-separated list of tags to exclude")
    .option("--include-paths <paths>", "Comma-separated list of path patterns to include")
    .option("--exclude-paths <paths>", "Comma-separated list of path patterns to exclude")
    .option("--service-name <name>", "Service name (auto-detected from spec if not provided)")
    .option("--template <dir>", "Custom template directory (advanced)")
    .option("--skip-validation", "Skip OpenAPI validation (advanced)", false)
    .option("--experimental-openapi-v31", "Enable experimental OpenAPI 3.1 support", false);
  
  // Hide advanced options from default help
  cmd.options.forEach((opt) => {
    if (opt.long && (
      opt.long.startsWith("--transport") ||
      opt.long.startsWith("--auth-") ||
      opt.long.startsWith("--api-base-url") ||
      opt.long.startsWith("--config") ||
      opt.long.startsWith("--include-") ||
      opt.long.startsWith("--exclude-") ||
      opt.long.startsWith("--service-name") ||
      opt.long.startsWith("--template") ||
      opt.long.startsWith("--skip-") ||
      opt.long.startsWith("--experimental-")
    )) {
      opt.hidden = true;
    }
  });
}

// Generate subcommand
const generateCmd = program
  .command("generate")
  .description("Generate an MCP server from an OpenAPI spec")
  .option("--out <dir>", "Output directory for generated MCP", "./generated-mcp")
  .option("--force", "Overwrite output directory if it exists")
  // Advanced options (must be defined before action)
  .option("--transport <type>", "Transport type: stdio or http", "stdio")
  .option("--auth-type <type>", "Auth type: none, apiKey, or bearer")
  .option("--auth-header <name>", "Auth header name (e.g. X-API-Key or Authorization)")
  .option("--auth-env <name>", "Environment variable name for auth token")
  .option("--api-base-url <url>", "API base URL for HTTP transport")
  .option("--config <file>", "Path to transform config file (JSON or YAML)")
  .option("--include-tags <tags>", "Comma-separated list of tags to include")
  .option("--exclude-tags <tags>", "Comma-separated list of tags to exclude")
  .option("--include-paths <paths>", "Comma-separated list of path patterns to include")
  .option("--exclude-paths <paths>", "Comma-separated list of path patterns to exclude")
  .option("--service-name <name>", "Service name (auto-detected from spec if not provided)")
  .option("--template <dir>", "Custom template directory (advanced)")
  .option("--skip-validation", "Skip OpenAPI validation (advanced)")
  .option("--experimental-openapi-v31", "Enable experimental OpenAPI 3.1 support")
  .argument("<openapi>", "Path to OpenAPI spec (JSON/YAML) or URL")
  .action(async (openapi, opts) => {
    // Workaround: Commander.js v14 has issues parsing options with arguments
    // Manually parse missing options from process.argv (check both before and after argument)
    const args = process.argv.slice(process.argv.indexOf("generate") + 1);
    
    // Parse --out option (supports both --out value and --out=value formats)
    let out = opts.out || "./generated-mcp";
    const outIndex = args.findIndex((arg, i) => 
      arg === "--out" || arg.startsWith("--out=")
    );
    if (outIndex >= 0) {
      if (args[outIndex].startsWith("--out=")) {
        out = args[outIndex].split("=")[1];
      } else if (outIndex + 1 < args.length && args[outIndex + 1] !== openapi) {
        out = args[outIndex + 1];
      }
    }
    
    // Parse --force flag (can appear anywhere)
    let force = opts.force || args.includes("--force");

    // Parse options manually since hidden options may not be in opts
    // Get args after "generate" command
    const cmdArgs = process.argv.slice(process.argv.indexOf("generate") + 1);
    // Commander.js may set default values even when option is provided, so prioritize manual parsing
    const manualTransport = getOptionValue(cmdArgs, 'transport');
    const optsTransport = (opts as any).transport;
    // Use manual parsing if available (more reliable), otherwise use opts, otherwise default
    const parsedTransport = manualTransport || optsTransport;
    const transport = (parsedTransport || "stdio") as "stdio" | "http";
    const authType = (opts.authType || getOptionValue(cmdArgs, 'auth-type')) as string | undefined;
    const authHeader = (opts.authHeader || getOptionValue(cmdArgs, 'auth-header')) as string | undefined;
    const authEnv = (opts.authEnv || getOptionValue(cmdArgs, 'auth-env')) as string | undefined;
    const apiBaseUrl = (opts.apiBaseUrl || getOptionValue(cmdArgs, 'api-base-url')) as string | undefined;
    const config = (opts.config || getOptionValue(cmdArgs, 'config')) as string | undefined;
    const includeTags = (opts.includeTags || getOptionValue(cmdArgs, 'include-tags')) as string | undefined;
    const excludeTags = (opts.excludeTags || getOptionValue(cmdArgs, 'exclude-tags')) as string | undefined;
    const includePaths = (opts.includePaths || getOptionValue(cmdArgs, 'include-paths')) as string | undefined;
    const excludePaths = (opts.excludePaths || getOptionValue(cmdArgs, 'exclude-paths')) as string | undefined;
    const serviceName = (opts.serviceName || getOptionValue(cmdArgs, 'service-name')) as string | undefined;

    // Check if openapi is a URL before resolving as path
    const openapiPath = /^https?:\/\//.test(openapi) ? openapi : path.resolve(process.cwd(), openapi);
    const outDir = path.resolve(process.cwd(), out || "./generated-mcp");

    try {
      console.log(`📄 Using OpenAPI spec: ${openapiPath}`);
      console.log(`📁 Output MCP directory: ${outDir}`);

      // Build transform config
      let transform;
      if (config) {
        // Load from config file
        const configPath = path.resolve(process.cwd(), config);
        const { loadTransformConfig } = await import("../../generator/src/config");
        transform = loadTransformConfig(configPath);
      } else if (includeTags || excludeTags || includePaths || excludePaths) {
        // Build from CLI flags
        transform = {
          includeTags: includeTags ? includeTags.split(",").map((t: string) => t.trim()) : undefined,
          excludeTags: excludeTags ? excludeTags.split(",").map((t: string) => t.trim()) : undefined,
          includePaths: includePaths ? includePaths.split(",").map((p: string) => p.trim()) : undefined,
          excludePaths: excludePaths ? excludePaths.split(",").map((p: string) => p.trim()) : undefined,
        };
      }

      // Build auth config
      let authConfig;
      if (authType && authType !== "none") {
        if (!authEnv) {
          console.error("❌ Error: --auth-env is required when --auth-type is apiKey or bearer");
          process.exit(1);
        }
        authConfig = {
          type: authType as "apiKey" | "bearer",
          headerName: authHeader || (authType === "apiKey" ? "X-API-Key" : "Authorization"),
          envVar: authEnv,
        };
      }

      const result = await generateFromOpenApi({
        openapiPath,
        outDir,
        overwrite: force,
        serviceName,
        authConfig,
        transport: transport || "stdio",
        apiBaseUrl,
        transform,
      });

      console.log(`✅ Generated ${result.toolsCount} tools`);
      console.log(`📦 MCP project generated at: ${result.outDir}`);
      console.log("");
      console.log("Next steps:");
      console.log(`  cd ${path.relative(process.cwd(), outDir)}`);
      console.log("  npm install");
      console.log("  npm run build");
      console.log("");
      console.log("Then run the server:");
      console.log('  node dist/index.js');
      if (authConfig) {
        console.log(`  (or set ${authConfig.envVar} environment variable)`);
      }
    } catch (err: any) {
      console.error("❌ Failed to generate MCP project:");
      console.error(err?.message ?? err);
      process.exit(1);
    }
  });

// Serve subcommand
program
  .command("serve")
  .description("Build and run a generated MCP server")
  .argument("<dir>", "Path to generated MCP directory")
  .option("--build", "Build before serving", true)
  .option("--no-build", "Skip build step")
  .option("--port <port>", "Port for HTTP server (default: 8787)", "8787")
  .action(async (dir, opts) => {
    const mcpDir = path.resolve(process.cwd(), dir);

    if (!existsSync(mcpDir)) {
      console.error(`❌ Directory not found: ${mcpDir}`);
      process.exit(1);
    }

    // Detect transport type: HTTP has wrangler.toml, stdio has dist/index.js
    const wranglerToml = path.join(mcpDir, "wrangler.toml");
    const distIndex = path.join(mcpDir, "dist", "index.js");
    const distWorker = path.join(mcpDir, "dist", "worker.js");
    
    const isHttpTransport = existsSync(wranglerToml) || existsSync(distWorker);
    const isStdioTransport = existsSync(distIndex);

    if (!isHttpTransport && !isStdioTransport) {
      console.error(`❌ Could not detect server type. Expected either:`);
      console.error(`   - dist/index.js (stdio transport)`);
      console.error(`   - dist/worker.js + wrangler.toml (http transport)`);
      console.error(`   Make sure the server has been built first.`);
      process.exit(1);
    }

    const run = (cmd: string, args: string[]): Promise<void> =>
      new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
          cwd: mcpDir,
          stdio: "inherit",
          shell: true,
        });
        child.on("exit", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
        });
        child.on("error", reject);
      });

    try {
      if (opts.build !== false) {
        console.log("📦 Installing dependencies…");
        await run("npm", ["install"]);
        console.log("🏗️  Building MCP server…");
        await run("npm", ["run", "build"]);
      }

      console.log("🚀 Starting MCP server…");
      
      if (isHttpTransport) {
        // HTTP transport: use wrangler dev
        console.log("🌐 Using HTTP transport (Cloudflare Worker)");
        const port = opts.port || "8787";
        console.log(`📍 Server will be available at http://localhost:${port}/mcp`);
        await run("npx", ["wrangler", "dev", "--port", port]);
      } else {
        // Stdio transport: use node dist/index.js
        console.log("📡 Using stdio transport");
        await run("node", ["dist/index.js"]);
      }
    } catch (err: any) {
      console.error("❌ Failed to serve MCP:");
      console.error(err?.message ?? err);
      process.exit(1);
    }
  });

// Fallback: no subcommand -> behave like generate command
// Note: We don't add -o here to avoid conflicts, just check for it in action
program
  .option("-o, --openapi <pathOrUrl>", "OpenAPI spec path or URL")
  .option("--out <dir>", "Output directory for generated MCP", "./generated-mcp")
  .option("--force", "Overwrite output directory if it exists")
  .action(async (opts) => {
    if (!opts.openapi) {
      program.help();
      return;
    }

    // Delegate to generate command by calling its action handler directly
    // We'll extract the generate command's logic into a shared function
    const generateOptions = {
      openapi: opts.openapi,
      out: opts.out || "./generated-mcp",
      force: opts.force || false,
      transport: opts.transport,
      authType: opts.authType,
      authHeader: opts.authHeader,
      authEnv: opts.authEnv,
      apiBaseUrl: opts.apiBaseUrl,
      config: opts.config,
      includeTags: opts.includeTags,
      excludeTags: opts.excludeTags,
      includePaths: opts.includePaths,
      excludePaths: opts.excludePaths,
      serviceName: opts.serviceName,
    };

    // Call the generate action handler
    const generateAction = (generateCmd as any)._actionHandler;
    if (generateAction) {
      await generateAction(generateOptions);
    } else {
      // Fallback: manually execute generate logic
      await generateCmd.parseAsync(["generate", ...process.argv.slice(2)]);
    }
  });

// Add advanced options to main command (for fallback mode)
addAdvancedOptions(program);

// Custom help to show advanced options section
const originalHelp = program.helpInformation.bind(program);
program.helpInformation = function() {
  const help = originalHelp();
  const advancedHelp = `
Advanced options (rarely needed):
  --transport <type>        Transport type: stdio or http (default: stdio)
  --auth-type <type>        Auth type: none, apiKey, or bearer
  --auth-header <name>       Auth header name
  --auth-env <name>          Environment variable name for auth token
  --api-base-url <url>      API base URL for HTTP transport
  --config <file>           Path to transform config file (JSON or YAML)
  --include-tags <tags>     Comma-separated list of tags to include
  --exclude-tags <tags>     Comma-separated list of tags to exclude
  --include-paths <paths>   Comma-separated list of path patterns to include
  --exclude-paths <paths>   Comma-separated list of path patterns to exclude
  --service-name <name>     Service name (auto-detected if not provided)
  --template <dir>          Custom template directory
  --skip-validation         Skip OpenAPI validation
  --experimental-openapi-v31  Enable experimental OpenAPI 3.1 support

Use --help-all to see all options including advanced ones.
`;
  
  // Only show advanced section if --help-all is used
  if (process.argv.includes("--help-all")) {
    return help + advancedHelp;
  }
  return help;
};

program.parse(process.argv);
