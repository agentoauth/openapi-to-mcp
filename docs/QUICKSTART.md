# Quick Start Guide

This guide will walk you through generating your first MCP server from an OpenAPI specification.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- An OpenAPI specification (JSON or YAML format)

## Step 1: Install Dependencies

```bash
git clone https://github.com/yourusername/openapi-to-mcp.git
cd openapi-to-mcp
npm install
```

## Step 2: Generate Your First MCP Server

### Example 1: Petstore API (No Authentication)

```bash
npm run cli:generate:petstore
```

This generates an MCP server in `scratch/petstore-mcp-cli/` from the included Petstore OpenAPI spec.

### Example 2: Weather API (Public API)

```bash
npm run dev -- \
  --openapi https://api.weather.gov/openapi.json \
  --out weather-mcp \
  --service-name weather \
  --transport http \
  --api-base-url https://api.weather.gov
```

### Example 3: GitHub API (With Authentication)

```bash
npm run dev -- \
  --openapi https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json \
  --out github-mcp \
  --service-name github \
  --transport http \
  --api-base-url https://api.github.com \
  --auth-type bearer \
  --auth-env GITHUB_TOKEN
```

## Step 3: Build the Generated MCP Server

Navigate to the generated directory and build:

```bash
cd weather-mcp  # or your generated directory
npm install
npm run build
```

## Step 4: Run the MCP Server

### For stdio Transport

```bash
API_BASE_URL="https://api.weather.gov" npm start
```

The server will listen on stdin/stdout for JSON-RPC requests.

### For HTTP Transport (Cloudflare Workers)

```bash
# Deploy to Cloudflare Workers
npx wrangler deploy

# If your API requires authentication, set the secret:
npx wrangler secret put GITHUB_TOKEN
# Enter your token when prompted
```

## Step 5: Test Your MCP Server

### Using MCP Inspector (Recommended)

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) provides a GUI for testing MCP servers:

```bash
cd weather-mcp
API_BASE_URL="https://api.weather.gov" \
  npx @modelcontextprotocol/inspector node dist/index.js
```

This launches a web UI where you can:
- Browse available tools
- Execute tools with arguments
- View request/response logs

### Using JSON-RPC Directly

```bash
echo '{"jsonrpc":"2.0","id":"1","method":"tools/list"}' | \
  API_BASE_URL="https://api.weather.gov" node dist/index.js
```

## Common Use Cases

### No Authentication

```bash
npm run dev -- \
  --openapi examples/petstore-openapi.json \
  --out my-mcp \
  --service-name myservice \
  --transport stdio
```

### API Key Authentication

```bash
npm run dev -- \
  --openapi https://api.example.com/openapi.json \
  --out my-mcp \
  --service-name myservice \
  --transport http \
  --api-base-url https://api.example.com \
  --auth-type apiKey \
  --auth-header X-API-Key \
  --auth-env API_KEY
```

### Bearer Token Authentication

```bash
npm run dev -- \
  --openapi https://api.example.com/openapi.json \
  --out my-mcp \
  --service-name myservice \
  --transport http \
  --api-base-url https://api.example.com \
  --auth-type bearer \
  --auth-env API_TOKEN
```

## Verifying Your Build

After generating, verify everything works:

```bash
# 1. Build the generated project
cd weather-mcp
npm install
npm run build

# 2. Test with MCP Inspector
API_BASE_URL="https://api.weather.gov" \
  npx @modelcontextprotocol/inspector node dist/index.js
```

## Next Steps

- Read the [Architecture Documentation](./ARCHITECTURE.md) to understand how the code generation works
- Check out the [Examples](../examples/) directory for more examples
- Explore the generated code to see how MCP tools are structured
- Deploy your MCP server to Cloudflare Workers for production use
- See [Building and Testing](../README.md#building-and-testing) in the main README for comprehensive test instructions

## Troubleshooting

### "Failed to load OpenAPI spec"

- Ensure the OpenAPI spec URL is accessible
- Check that the file path is correct if using a local file
- Verify the spec is valid JSON or YAML

### "No operations found"

- Check that your OpenAPI spec has paths defined
- Ensure operations have HTTP methods (GET, POST, etc.)
- Verify the spec is OpenAPI 3.0 or Swagger 2.0 format

### "Build errors"

- Make sure you've run `npm install` in the generated directory
- Check that Node.js version is 18 or higher
- Verify TypeScript is installed correctly

### "Authentication errors"

- Ensure the auth token is set correctly (environment variable or Cloudflare secret)
- Verify the auth header name matches your API's requirements
- Check that the auth type matches your API's authentication scheme

