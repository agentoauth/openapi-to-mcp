import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";
import { generateMcpFromOpenApi } from "../packages/generator/src/index";
import { randomUUID } from "crypto";

type BenchSpec =
  | { name: string; source: "local"; path: string }
  | { name: string; source: "url"; url: string };

const benchConfigPath = path.join(__dirname, "../benchmarks/benchmarks.json");

function loadBenchConfig(): BenchSpec[] {
  const raw = fs.readFileSync(benchConfigPath, "utf8");
  return JSON.parse(raw) as BenchSpec[];
}

function loadLocalSpec(relPath: string): any {
  const full = path.join(__dirname, "..", relPath);
  const raw = fs.readFileSync(full, "utf8");
  if (relPath.endsWith(".yaml") || relPath.endsWith(".yml")) {
    return yaml.load(raw);
  }
  return JSON.parse(raw);
}

async function loadRemoteSpec(url: string): Promise<any> {
  // Use native fetch (Node 18+)
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return yaml.load(text);
  }
}

(async () => {
  const specs = loadBenchConfig();

  console.log(`Running benchmarks for ${specs.length} specs...\n`);

  let success = 0;
  let failure = 0;
  const tempDir = path.join(__dirname, "../scratch/benchmarks");

  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  for (const spec of specs) {
    try {
      let openapi: any;

      if (spec.source === "local") {
        openapi = loadLocalSpec(spec.path);
      } else {
        openapi = await loadRemoteSpec(spec.url);
      }

      // Create a unique temp directory for this benchmark
      const outDir = path.join(tempDir, `bench-${spec.name}-${randomUUID()}`);

      const result = await generateMcpFromOpenApi(openapi, {
        outDir,
        serviceName: spec.name,
        transport: "http",
      });

      const toolCount = result.toolsCount || 0;

      if (toolCount === 0) {
        throw new Error("No tools generated");
      }

      console.log(`✔ OK: ${spec.name} → ${toolCount} tools`);
      success++;

      // Clean up temp directory
      try {
        fs.rmSync(outDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        // Ignore cleanup errors
      }
    } catch (err: any) {
      console.error(`✘ FAIL: ${spec.name}`);
      console.error(`   ${err?.message || err}`);
      failure++;
    }
  }

  console.log("\nBenchmark run complete.");
  console.log(`Success: ${success}`);
  console.log(`Failure: ${failure}`);

  if (failure > 0) {
    process.exitCode = 1; // fail CI if curated set breaks
  }
})();

