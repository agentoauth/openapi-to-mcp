import { loadOpenAPISpec } from "./openapiLoader";
import { extractOperationsFromSpec } from "./operationExtractor";
import { inferToolsFromOperations } from "./toolInferer";

async function main() {
  const spec = await loadOpenAPISpec("examples/petstore-openapi.json");
  const parsed = extractOperationsFromSpec(spec);
  const tools = inferToolsFromOperations(parsed);

  console.log("Generated tools:");
  for (const t of tools) {
    console.log(`- ${t.name}`);
  }

  // Optional: inspect one tool's schema deeply
  console.dir(tools[0], { depth: null });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


