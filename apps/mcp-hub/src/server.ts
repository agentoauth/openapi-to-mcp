import "dotenv/config"; // Load .env file
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Import generator functions
import { loadOpenAPISpec, extractBaseUrlFromSpec } from "../../../packages/generator/src/openapiLoader";
import { extractOperationsFromSpec, extractOperationRefs } from "../../../packages/generator/src/operationExtractor";
import { inferToolsFromOperations } from "../../../packages/generator/src/toolInferer";
import { renderMcpProject } from "../../../packages/generator/src/projectRenderer";
import { generateMcpFromOpenApi } from "../../../packages/generator/src/index";
import { AuthConfig, AuthType, McpTool } from "../../../packages/generator/src/models";
import { TransformConfig } from "../../../packages/generator/src/types";
import { validateOpenAPISpec, ValidationResult } from "./validator";
import { generateToolManifest, ToolManifest } from "./manifestGenerator";
import { validateToolSchemas, SchemaValidationResult } from "./schemaValidator";
import { capabilities } from "./config";
// @ts-ignore - js-yaml doesn't have type definitions in this context
import * as yaml from "js-yaml";

const MODE = process.env.MODE?.toLowerCase() === "local" ? "local" : "public";
console.log("[MCP Hub] Running in", MODE, "mode (MODE env var:", process.env.MODE, ")");
console.log("[MCP Hub] Cloudflare deploy:", capabilities.deployEnabled ? "ENABLED" : "DISABLED");

const app = express();
const PORT = process.env.PORT || 4000;

// In-memory project storage for public mode downloads
const projects = new Map<string, string>(); // projectId -> outDir

app.use(cors());
// Increase body size limit to 10MB to handle large OpenAPI specs
app.use(bodyParser.json({ limit: '10mb' }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Mode detection endpoint
app.get("/api/mode", (_req, res) => {
  res.json({ mode: MODE });
});

// Capabilities endpoint
app.get("/api/capabilities", (_req, res) => {
  res.json({
    deployEnabled: capabilities.deployEnabled,
  });
});

// Extract operations endpoint (for Phase 3 - initial dry run)
app.post("/api/operations", async (req, res) => {
  const body = req.body as { openapiUrlOrText: string };
  const { openapiUrlOrText } = body;

  if (!openapiUrlOrText) {
    res.status(400).json({ error: "openapiUrlOrText is required" });
    return;
  }

  try {
    const spec = await loadOpenAPISpec(openapiUrlOrText);
    const operationRefs = extractOperationRefs(spec);
    
    // Group operations by tags
    const tagMap = new Map<string, typeof operationRefs>();
    const untagged: typeof operationRefs = [];
    
    for (const op of operationRefs) {
      if (op.tags && op.tags.length > 0) {
        // Operations can appear in multiple groups if they have multiple tags
        for (const tag of op.tags) {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, []);
          }
          tagMap.get(tag)!.push(op);
        }
      } else {
        untagged.push(op);
      }
    }
    
    // Convert to array format
    const groups: Array<{ tag: string; operations: typeof operationRefs }> = [];
    
    // Add tagged groups
    for (const [tag, ops] of tagMap.entries()) {
      groups.push({ tag, operations: ops });
    }
    
    // Add untagged group if there are any
    if (untagged.length > 0) {
      groups.push({ tag: "untagged", operations: untagged });
    }
    
    res.json({
      ok: true,
      groups,
      operations: operationRefs, // Keep flat list for backward compatibility
    });
  } catch (err: any) {
    console.error("Failed to extract operations:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Failed to extract operations",
    });
  }
});

// Generate endpoint (for Phase 3 - local mode generation)
interface GenerateRequest {
  openapiUrlOrText: string;
  serviceName: string;
  transport?: "stdio" | "http";
  authType?: AuthType;
  authHeader?: string;
  apiBaseUrl?: string;
  transform?: TransformConfig;
}

interface GenerateResponse {
  ok: boolean;
  tools?: Array<{
    name: string;
    description: string;
    operationId: string;
    path: string;
    method: string;
  }>;
  codePreview?: string;
  projectId?: string;
  operations?: Array<{
    path: string;
    method: string;
    operationId: string;
    tags: string[];
    summary?: string;
  }>;
  error?: string;
}

app.post("/api/generate", async (req, res) => {
  const body = req.body as GenerateRequest;
  const {
    openapiUrlOrText,
    serviceName,
    transport = "http",
    authType = "none",
    authHeader,
    apiBaseUrl,
    transform,
  } = body;

  if (!openapiUrlOrText || !serviceName) {
    res.status(400).json({ error: "openapiUrlOrText and serviceName are required" });
    return;
  }

  try {
    const id = randomUUID();
    const outDir = path.resolve(
      __dirname,
      "../../..",
      "scratch",
      `mcp-${serviceName}-${id}`
    );

    fs.mkdirSync(outDir, { recursive: true });

    // Build auth config if needed
    let authConfig: AuthConfig | undefined;
    if (authType !== "none") {
      const envVar = `${serviceName.toUpperCase()}_TOKEN`;
      const headerName =
        authHeader ||
        (authType === "apiKey" ? "X-API-Key" : "Authorization");

      authConfig = {
        type: authType,
        headerName,
        envVar,
      };
    }

    // Use the new generator function
    const result = await generateMcpFromOpenApi(openapiUrlOrText, {
      outDir,
      serviceName,
      authConfig,
      transport,
      apiBaseUrl,
      transform,
    });

    // Store project for download
    projects.set(id, outDir);

    // Read generated code for preview
    const codeFile = transport === "http" 
      ? path.join(outDir, "src", "worker.ts")
      : path.join(outDir, "src", "index.ts");
    
    let codePreview: string | undefined;
    if (fs.existsSync(codeFile)) {
      codePreview = fs.readFileSync(codeFile, "utf8");
    }

    // Extract operations for UI display
    const spec = await loadOpenAPISpec(openapiUrlOrText);
    const operationRefs = extractOperationRefs(spec);

    // Get tool metadata
    const parsed = extractOperationsFromSpec(spec);
    const tools = inferToolsFromOperations(parsed);

    const response: GenerateResponse = {
      ok: true,
      tools: tools.map((tool) => {
        // McpTool extends MCPTool which has name and description
        // Use type assertion to access properties from base type
        const toolWithName = tool as McpTool & { name: string; description: string };
        return {
          name: toolWithName.name,
          description: toolWithName.description,
          operationId: tool.operation.id,
          path: tool.operation.path,
          method: tool.operation.method,
        };
      }),
      codePreview,
      projectId: id,
      operations: operationRefs.map((ref) => ({
        path: ref.path,
        method: ref.method,
        operationId: ref.operationId,
        tags: ref.tags,
        summary: ref.summary,
      })),
    };

    res.json(response);
  } catch (err: any) {
    console.error("Generate failed:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Failed to generate MCP project",
    });
  }
});

// Serve static client later (for now just placeholder)
app.get("/", (_req, res) => {
  res.send("MCP Hub API running. Frontend coming soon.");
});

interface GenerateMcpRequest {
  openapiUrlOrText: string; // URL, file path, or raw JSON/YAML text
  serviceName: string;
  authType?: AuthType; // "none" | "apiKey" | "bearer"
  authHeader?: string;
  baseUrlOverride?: string;
}

interface GenerateMcpResponse {
  ok: boolean;
  outDir?: string;
  projectId?: string; // For public mode downloads
  mcpUrl?: string; // Only in local mode after deploy
  envVarName?: string; // Only in local mode
  error?: string;
  validation?: ValidationResult;
  manifest?: ToolManifest; // For public mode
  schemaValidation?: SchemaValidationResult; // For public mode
}

app.post("/api/generate-mcp", async (req, res) => {
  const body = req.body as GenerateMcpRequest;

  const {
    openapiUrlOrText,
    serviceName,
    authType = "none",
    authHeader,
    baseUrlOverride,
  } = body;

  if (!openapiUrlOrText || !serviceName) {
    res.status(400).json({ error: "openapiUrlOrText and serviceName required" });
    return;
  }

  try {
    const id = randomUUID();
    const outDir = path.resolve(
      __dirname,
      "../../..",
      "scratch",
      `mcp-${serviceName}-${id}`
    );

    fs.mkdirSync(outDir, { recursive: true });

    console.log(`Loading OpenAPI spec...`);
    const spec = await loadOpenAPISpec(openapiUrlOrText);

    // Validate spec
    const validation = validateOpenAPISpec(spec);
    console.log(`Validation: ${validation.valid ? 'PASSED' : 'FAILED'}, ${validation.warnings.length} warnings, ${validation.errors.length} errors`);

    // Auto-detect base URL from spec if not provided
    let finalApiBaseUrl = baseUrlOverride;
    if (!finalApiBaseUrl) {
      const detectedBaseUrl = extractBaseUrlFromSpec(spec);
      if (detectedBaseUrl) {
        finalApiBaseUrl = detectedBaseUrl;
        console.log(`Detected API base URL from spec: ${finalApiBaseUrl}`);
      }
    }

    const parsed = extractOperationsFromSpec(spec);
    const tools = inferToolsFromOperations(parsed);

    // Generate manifest and validate schemas (for public mode verification)
    const manifest = await generateToolManifest(tools, serviceName, outDir);
    const schemaValidation = validateToolSchemas(tools);

    let authConfig: AuthConfig | undefined;

    if (authType !== "none") {
      const envVar = `${serviceName.toUpperCase()}_TOKEN`;
      const headerName =
        authHeader ||
        (authType === "apiKey" ? "X-API-Key" : "Authorization");

      authConfig = {
        type: authType,
        headerName,
        envVar,
      };
    }

    await renderMcpProject(tools, {
      outDir,
      serviceName,
      authConfig,
      transport: "http",
      apiBaseUrl: finalApiBaseUrl,
    });

    // Branch based on MODE
    if (MODE === "public") {
      // Public mode: Store project for download, do NOT deploy
      projects.set(id, outDir);
      const response: GenerateMcpResponse = {
        ok: true,
        outDir,
        projectId: id,
        validation,
        manifest,
        schemaValidation,
      };
      res.json(response);
      return;
    }

    // Local mode: Deploy to Cloudflare (only if enabled)
    if (MODE === "local") {
      if (capabilities.deployEnabled) {
        try {
          const mcpUrl = await runWranglerPublish(outDir);
          const response: GenerateMcpResponse = {
            ok: true,
            outDir,
            mcpUrl,
            envVarName:
              authType !== "none" ? `${serviceName.toUpperCase()}_TOKEN` : undefined,
            validation,
          };
          res.json(response);
          return;
        } catch (err: any) {
          console.error("Deploy failed:", err);
          res.status(500).json({
            ok: false,
            outDir,
            error: err?.message || "Deployment failed",
            validation,
          } satisfies GenerateMcpResponse);
          return;
        }
      } else {
        // Local mode but deploy disabled - just return project info
        projects.set(id, outDir);
        const response: GenerateMcpResponse = {
          ok: true,
          outDir,
          projectId: id,
          validation,
          manifest,
          schemaValidation,
        };
        res.json(response);
        return;
      }
    }
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: err?.message || "Failed to generate MCP project" });
  }
});

interface DeployMcpRequest {
  outDir: string;
  envVarName?: string;
}

interface DownloadMcpRequest {
  outDir: string;
}

app.post("/api/deploy-mcp", async (req, res) => {
  // Check if Cloudflare deploy is enabled
  if (!capabilities.deployEnabled) {
    res.status(403).json({ 
      ok: false,
      error: "Cloudflare deploy is disabled on this instance." 
    });
    return;
  }

  // Only allow deployment in local mode
  if (MODE !== "local") {
    res.status(403).json({ 
      ok: false,
      error: "Deployment is only available in local mode. Use MODE=local to enable." 
    });
    return;
  }

  const body = req.body as DeployMcpRequest;
  const { outDir, envVarName } = body;

  if (!outDir) {
    res.status(400).json({ error: "outDir is required" });
    return;
  }

  if (!fs.existsSync(outDir)) {
    res.status(404).json({ error: "Project directory not found" });
    return;
  }

  try {
    const mcpUrl = await runWranglerPublish(outDir);
    
    res.json({
      ok: true,
      mcpUrl,
      envVarName: envVarName, // Use the envVarName from the request
    });
  } catch (err: any) {
    console.error("Deploy failed:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Deployment failed",
    });
  }
});

// Download endpoint for public mode (by projectId)
app.get("/api/download/:id", async (req, res) => {
  const id = req.params.id;
  const outDir = projects.get(id);
  
  if (!outDir) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (!fs.existsSync(outDir)) {
    res.status(404).json({ error: "Project directory not found" });
    return;
  }

  try {
    const archiver = require("archiver");
    const zipFileName = `mcp-project-${id}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(outDir, false);
    await archive.finalize();
  } catch (err: any) {
    console.error("Download failed:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Failed to create zip file",
    });
  }
});

// Legacy download endpoint (still works for backward compatibility)
app.post("/api/download-mcp", async (req, res) => {
  const body = req.body as DownloadMcpRequest;
  const { outDir } = body;

  if (!outDir) {
    res.status(400).json({ error: "outDir is required" });
    return;
  }

  if (!fs.existsSync(outDir)) {
    res.status(404).json({ error: "Project directory not found" });
    return;
  }

  try {
    const archiver = require("archiver");
    const serviceName = path.basename(outDir).replace(/^mcp-/, "").split("-")[0];
    const zipFileName = `mcp-${serviceName}-${Date.now()}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(outDir, false);
    await archive.finalize();
  } catch (err: any) {
    console.error("Download failed:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Failed to create zip file",
    });
  }
});

async function runWranglerPublish(outDir: string): Promise<string> {
  try {
    // Step 1: Install dependencies
    console.log(`Installing dependencies in ${outDir}...`);
    try {
      const { stdout, stderr } = await execAsync("npm install", { cwd: outDir });
      if (stderr && !stderr.includes("npm warn")) {
        console.warn("npm install warnings:", stderr);
      }
    } catch (err: any) {
      throw new Error(`Failed to install dependencies: ${err.message}`);
    }

    // Step 2: Build the project
    console.log(`Building project in ${outDir}...`);
    try {
      const { stdout, stderr } = await execAsync("npm run build", { cwd: outDir });
      if (stderr) {
        console.warn("Build warnings:", stderr);
      }
    } catch (err: any) {
      throw new Error(`Failed to build project: ${err.message}`);
    }

    // Step 3: Deploy
    console.log(`Deploying from ${outDir}...`);
    return new Promise((resolve, reject) => {
      exec("npx wrangler deploy", { cwd: outDir }, (err, stdout, stderr) => {
        if (err) {
          console.error("wrangler deploy error:", err);
          console.error("stderr:", stderr);
          console.error("stdout:", stdout);
          reject(new Error(`Deployment failed: ${err.message}\n${stderr || stdout}`));
          return;
        }
        // Very naive URL extraction: look for "https://...workers.dev"
        const match = stdout.match(/https:\/\/[^\s]+workers\.dev[^\s]*/);
        if (match) {
          resolve(match[0] + "/mcp");
        } else {
          console.log("wrangler output:", stdout);
          reject(new Error("Could not find workers.dev URL in wrangler output"));
        }
      });
    });
  } catch (err: any) {
    throw err; // Re-throw to be caught by the caller
  }
}

// Config import/export endpoints
app.post("/api/save-config", (req, res) => {
  try {
    const config = req.body as TransformConfig;
    
    // Validate config structure
    if (typeof config !== "object" || config === null) {
      return res.status(400).json({ error: "Invalid config: must be an object" });
    }
    
    // Determine format from query param or default to YAML
    const format = (req.query.format as string) || "yaml";
    const filename = `openmcp.config.${format === "json" ? "json" : "yaml"}`;
    
    let content: string;
    if (format === "json") {
      content = JSON.stringify(config, null, 2);
    } else {
      content = yaml.dump(config);
    }
    
    // Set headers for file download
    res.setHeader("Content-Type", format === "json" ? "application/json" : "text/yaml");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  } catch (err: any) {
    console.error("Failed to save config:", err);
    res.status(500).json({ error: err?.message || "Failed to save config" });
  }
});

app.post("/api/load-config", bodyParser.text({ limit: "1mb", type: "*/*" }), (req, res) => {
  try {
    const content = req.body as string;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Config content is required" });
    }
    
    // Try to detect format
    const trimmed = content.trim();
    let config: TransformConfig;
    
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      // JSON
      config = JSON.parse(content) as TransformConfig;
    } else {
      // YAML
      const parsed = yaml.load(content);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("YAML must contain an object");
      }
      config = parsed as TransformConfig;
    }
    
    // Validate structure
    if (typeof config !== "object" || config === null) {
      return res.status(400).json({ error: "Invalid config structure" });
    }
    
    res.json({ ok: true, config });
  } catch (err: any) {
    console.error("Failed to load config:", err);
    res.status(400).json({ error: err?.message || "Failed to parse config" });
  }
});

app.listen(PORT, () => {
  console.log(`MCP Hub listening on http://localhost:${PORT}`);
});

