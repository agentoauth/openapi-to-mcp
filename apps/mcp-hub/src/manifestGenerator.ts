import { McpTool } from "../../../packages/generator/src/models";
import { promises as fs } from "fs";
import path from "path";

export interface ToolManifest {
  serviceName: string;
  toolCount: number;
  tools: Array<{
    name: string;
    description: string;
    hasRequestBody: boolean;
    path: string;
    method: string;
  }>;
}

export async function generateToolManifest(
  tools: McpTool[],
  serviceName: string,
  outDir: string
): Promise<ToolManifest> {
  const manifest: ToolManifest = {
    serviceName,
    toolCount: tools.length,
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      hasRequestBody: !!t.operation.requestBodySchema,
      path: t.operation.path,
      method: t.operation.method.toUpperCase(),
    })),
  };

  const manifestPath = path.join(outDir, "mcp-tools.json");
  await fs.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  return manifest;
}


