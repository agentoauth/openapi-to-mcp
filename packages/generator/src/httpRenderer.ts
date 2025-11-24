import { promises as fs } from "fs";
import * as path from "path";
import Handlebars from "handlebars";
import { McpTool } from "./models";
import { RenderOptions } from "./projectRenderer";

// Register Handlebars helpers (shared with projectRenderer but registering here for clarity)
Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

async function loadTemplate(filePath: string): Promise<Handlebars.TemplateDelegate> {
  const source = await fs.readFile(filePath, "utf8");
  return Handlebars.compile(source);
}

export async function renderHttpProject(
  tools: McpTool[],
  options: RenderOptions
): Promise<void> {
  const { outDir, serviceName } = options;

  await fs.mkdir(outDir, { recursive: true });
  const srcDir = path.join(outDir, "src");
  await fs.mkdir(srcDir, { recursive: true });

  // Load templates
  const templatesDir = path.join(__dirname, "..", "..", "templates", "http");
  const workerTpl = await loadTemplate(path.join(templatesDir, "worker.hbs"));
  const toolsTpl = await loadTemplate(path.join(templatesDir, "tools.hbs"));
  const wranglerTpl = await loadTemplate(path.join(templatesDir, "wrangler.hbs"));
  const pkgTpl = await loadTemplate(path.join(templatesDir, "packageJson.hbs"));
  const tsconfigTpl = await loadTemplate(path.join(templatesDir, "tsconfig.hbs"));
  const schemaTpl = await loadTemplate(path.join(__dirname, "..", "..", "templates", "schemaJson.hbs"));

  // Load tool function template for generating individual tools (HTTP-specific)
  const toolFunctionTpl = await loadTemplate(path.join(templatesDir, "toolFunction.hbs"));

  // Generate individual tool functions
  const toolFunctions: string[] = [];
  for (const tool of tools) {
    const pathParams = tool.operation.parameters
      .filter((p) => p.in === "path")
      .map((p) => p.name);
    const queryParams = tool.operation.parameters
      .filter((p) => p.in === "query")
      .map((p) => p.name);

    // Heuristic: body fields are inputSchema props not in path/query
    const allParamNames = new Set([...pathParams, ...queryParams]);
    const inputSchema = tool.inputSchema as { properties?: Record<string, unknown> } | null | undefined;
    const bodyFields =
      tool.operation.method === "post" &&
      inputSchema &&
      inputSchema.properties
        ? Object.keys(inputSchema.properties).filter(
            (name) => !allParamNames.has(name)
          )
        : [];

    const hasBody = bodyFields.length > 0;

    const toolCode = toolFunctionTpl({
      name: tool.name,
      operation: tool.operation,
      method: tool.operation.method,
      pathParams,
      queryParams,
      hasBody,
      bodyFields,
      authConfig: options.authConfig,
      serviceName: options.serviceName,
    });
    toolFunctions.push(toolCode);
  }

  // worker.ts
  const workerCode = workerTpl({ serviceName, tools });
  await fs.writeFile(path.join(srcDir, "worker.ts"), workerCode, "utf8");

  // tools.ts - generate actual tool functions
  const toolsCode = toolsTpl({ tools, toolFunctions, authConfig: options.authConfig });
  await fs.writeFile(path.join(srcDir, "tools.ts"), toolsCode, "utf8");

  // wrangler.toml
  const apiBaseUrl = options.apiBaseUrl || process.env.API_BASE_URL || "https://api.example.com";
  const wranglerToml = wranglerTpl({ serviceName, apiBaseUrl });
  await fs.writeFile(path.join(outDir, "wrangler.toml"), wranglerToml, "utf8");

  // package.json
  const pkgJson = pkgTpl({ serviceName });
  await fs.writeFile(path.join(outDir, "package.json"), pkgJson, "utf8");

  // tsconfig.json
  const tsconfigJson = tsconfigTpl({});
  await fs.writeFile(path.join(outDir, "tsconfig.json"), tsconfigJson, "utf8");

  // schema.json
  const schemaJson = schemaTpl({ tools });
  await fs.writeFile(path.join(outDir, "schema.json"), schemaJson, "utf8");
}

