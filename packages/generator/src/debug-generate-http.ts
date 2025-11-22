import { loadOpenAPISpec } from "./openapiLoader";
import { extractOperationsFromSpec } from "./operationExtractor";
import { inferToolsFromOperations } from "./toolInferer";
import { renderMcpProject } from "./projectRenderer";

async function main() {
  const spec = await loadOpenAPISpec("examples/petstore-openapi.json");
  const parsed = extractOperationsFromSpec(spec);
  const tools = inferToolsFromOperations(parsed);

  await renderMcpProject(tools, {
    transport: "http",
    outDir: "scratch/http-demo",
    serviceName: "demo",
    authConfig: undefined,
  });

  console.log("HTTP MCP generated in scratch/http-demo");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


