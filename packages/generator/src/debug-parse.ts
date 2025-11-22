import { loadOpenAPISpec } from "./openapiLoader";
import { extractOperationsFromSpec } from "./operationExtractor";

async function main() {
  const spec = await loadOpenAPISpec("examples/petstore-openapi.json");
  const { operations, components } = extractOperationsFromSpec(spec);

  console.log("Components present:", !!components);
  console.log("First 5 operations:");
  console.dir(operations.slice(0, 5), { depth: null });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

