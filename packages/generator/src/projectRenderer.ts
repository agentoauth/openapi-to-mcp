import { promises as fs } from "fs";
import * as path from "path";
import Handlebars from "handlebars";
import { McpTool, AuthConfig, TransportType } from "./models";

// Register a JSON helper for embedding schemas
Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

// Register eq helper for conditional logic
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

export interface RenderOptions {
  outDir: string;
  serviceName: string;
  authConfig?: AuthConfig;
  transport: TransportType;
  apiBaseUrl?: string;
}

export async function renderMcpProject(
  tools: McpTool[],
  options: RenderOptions
): Promise<void> {
  if (options.transport === "http") {
    const { renderHttpProject } = await import("./httpRenderer");
    await renderHttpProject(tools, options);
    return;
  }

  const { outDir, serviceName, authConfig } = options;

  await fs.mkdir(outDir, { recursive: true });
  const srcDir = path.join(outDir, "src");
  const toolsDir = path.join(srcDir, "tools");
  await fs.mkdir(srcDir, { recursive: true });
  await fs.mkdir(toolsDir, { recursive: true });

  // Load templates
  // When running via ts-node, __dirname is packages/generator/src, so go up to packages/templates
  const templatesDir = path.join(__dirname, "..", "..", "templates");
  const serverTpl = await loadTemplate(path.join(templatesDir, "mcpServer.hbs"));
  const toolTpl = await loadTemplate(path.join(templatesDir, "toolFunction.hbs"));
  const toolsIndexTpl = await loadTemplate(path.join(templatesDir, "toolsIndex.hbs"));
  const schemaTpl = await loadTemplate(path.join(templatesDir, "schemaJson.hbs"));
  const pkgTpl = await loadTemplate(path.join(templatesDir, "packageJson.hbs"));
  const tsconfigTpl = await loadTemplate(path.join(templatesDir, "tsconfig.hbs"));
  const readmeTpl = await loadTemplate(path.join(templatesDir, "readme.hbs"));

  // index.ts (server)
  const serverCode = serverTpl({ serviceName });
  await fs.writeFile(path.join(srcDir, "index.ts"), serverCode, "utf8");

  // Tools
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
      (tool.operation.method === "post" || tool.operation.method === "put" || tool.operation.method === "patch") &&
      inputSchema &&
      inputSchema.properties
        ? Object.keys(inputSchema.properties).filter(
            (name) => !allParamNames.has(name)
          )
        : [];

    const hasBody = bodyFields.length > 0;

    const toolCode = toolTpl({
      name: tool.name,
      operation: tool.operation,
      method: tool.operation.method,
      pathParams,
      queryParams,
      hasBody,
      bodyFields,
      authConfig,
      serviceName,
    });

    await fs.writeFile(
      path.join(toolsDir, `${tool.name}.ts`),
      toolCode,
      "utf8"
    );
  }

  // tools/index.ts
  const toolsIndexCode = toolsIndexTpl({ tools });
  await fs.writeFile(path.join(toolsDir, "index.ts"), toolsIndexCode, "utf8");

  // schema.json
  const schemaJson = schemaTpl({ tools });
  await fs.writeFile(path.join(outDir, "schema.json"), schemaJson, "utf8");

  // package.json
  const pkgJson = pkgTpl({ serviceName });
  await fs.writeFile(path.join(outDir, "package.json"), pkgJson, "utf8");

  // tsconfig.json
  const tsconfigJson = tsconfigTpl({});
  await fs.writeFile(path.join(outDir, "tsconfig.json"), tsconfigJson, "utf8");

  // README.md
  const readmeMd = readmeTpl({ serviceName });
  await fs.writeFile(path.join(outDir, "README.md"), readmeMd, "utf8");
}

async function loadTemplate(filePath: string): Promise<Handlebars.TemplateDelegate> {
  const source = await fs.readFile(filePath, "utf8");
  return Handlebars.compile(source);
}

