import { spawn } from "child_process";
import * as path from "path";

async function main() {
  const mcpDir = path.join(__dirname, "..", "scratch", "petstore-mcp-cli");
  const entry = path.join(mcpDir, "dist", "index.js");

  console.log("Spawning MCP server:", entry);

  const child = spawn("node", [entry], {
    cwd: mcpDir,
    env: {
      ...process.env,
      API_BASE_URL: "https://petstore3.swagger.io/api/v3",
    },
    stdio: ["pipe", "pipe", "inherit"], // stdin, stdout, stderr
  });

  child.on("error", (err) => {
    console.error("Failed to start child process:", err);
  });

  let responseReceived = false;

  child.stdout.on("data", (chunk) => {
    const text = chunk.toString("utf8").trim();
    if (!text) return;
    console.log("MCP response:", text);
    responseReceived = true;
    // Close stdin and exit after receiving response
    child.stdin.end();
    setTimeout(() => {
      child.kill();
      process.exit(0);
    }, 100);
  });

  // Using findpetsbystatus tool with real Petstore API endpoint
  const request = {
    jsonrpc: "2.0",
    id: "1",
    method: "tools/execute",
    params: {
      name: "findpetsbystatus",
      arguments: {
        status: "available",
      },
    },
  };

  const line = JSON.stringify(request) + "\n";
  console.log("Sending request:", line.trim());
  child.stdin.write(line);

  // Timeout after 10 seconds
  setTimeout(() => {
    if (!responseReceived) {
      console.error("Timeout: No response received");
      child.kill();
      process.exit(1);
    }
  }, 10000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

