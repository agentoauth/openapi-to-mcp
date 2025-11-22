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
import { extractOperationsFromSpec } from "../../../packages/generator/src/operationExtractor";
import { inferToolsFromOperations } from "../../../packages/generator/src/toolInferer";
import { renderMcpProject } from "../../../packages/generator/src/projectRenderer";
import { AuthConfig, AuthType } from "../../../packages/generator/src/models";
import { validateOpenAPISpec, ValidationResult } from "./validator";
import { generateToolManifest, ToolManifest } from "./manifestGenerator";
import { validateToolSchemas, SchemaValidationResult } from "./schemaValidator";

const MODE = process.env.MODE?.toLowerCase() === "local" ? "local" : "public";
console.log("[MCP Hub] Running in", MODE, "mode (MODE env var:", process.env.MODE, ")");

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
    // Debug logging to check if content is truncated
    console.log(`[DEBUG] Received openapiUrlOrText length: ${openapiUrlOrText?.length || 0}`);
    console.log(`[DEBUG] First 200 chars: ${openapiUrlOrText?.substring(0, 200) || ''}`);
    console.log(`[DEBUG] Has newlines: ${openapiUrlOrText?.includes('\n') || false}`);
    console.log(`[DEBUG] Contains 'openapi:': ${openapiUrlOrText?.includes('openapi:') || false}`);
    console.log(`[DEBUG] Contains '#Last modified': ${openapiUrlOrText?.includes('#Last modified') || false}`);
    
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

    // Local mode: Deploy to Cloudflare
    if (MODE === "local") {
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

app.listen(PORT, () => {
  console.log(`MCP Hub listening on http://localhost:${PORT}`);
});

