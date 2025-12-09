# Examples

This directory contains example OpenAPI specifications that demonstrate how to use `openapi-to-mcp` with different types of APIs.

## Petstore API

**File**: `petstore-openapi.json`

A simple example API with no authentication. Perfect for getting started.

### Generate MCP Server

```bash
npm run cli:generate:petstore
```

Or manually:

```bash
npm run dev -- \
  --openapi examples/petstore-openapi.json \
  --out petstore-mcp \
  --service-name petstore \
  --transport stdio
```

### Run the MCP Server

```bash
cd scratch/petstore-mcp-cli
npm install
npm run build
API_BASE_URL="https://petstore3.swagger.io/api/v3" npm start
```

### Test with MCP Inspector

```bash
cd scratch/petstore-mcp-cli
API_BASE_URL="https://petstore3.swagger.io/api/v3" \
  npx @modelcontextprotocol/inspector node dist/index.js
```

## Weather API

**URL**: `https://api.weather.gov/openapi.json`

A public API with no authentication. Demonstrates using a remote OpenAPI spec.

### Generate MCP Server

```bash
npm run dev -- \
  --openapi https://api.weather.gov/openapi.json \
  --out weather-mcp \
  --service-name weather \
  --transport http \
  --api-base-url https://api.weather.gov
```

### Deploy to Cloudflare Workers

```bash
cd weather-mcp
npm install
npm run build
npx wrangler deploy
```

## GitHub API

**URL**: `https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json`

A real-world API with bearer token authentication. Demonstrates authentication handling.

### Generate MCP Server

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

### Deploy to Cloudflare Workers

```bash
cd github-mcp
npm install
npm run build
npx wrangler deploy

# Set your GitHub token as a secret
npx wrangler secret put GITHUB_TOKEN
# Enter your GitHub personal access token when prompted
```

## AirNow API

**File**: `airnow.json`

A real-world API with API key authentication via query parameter. Demonstrates query parameter authentication (as opposed to header-based auth).

### Generate MCP Server

```bash
npx @agentoauth/mcp generate examples/airnow.json \
  --out airnow-mcp \
  --transport stdio \
  --api-base-url https://www.airnowapi.org \
  --auth-type apiKey \
  --auth-header API_KEY \
  --auth-env AIRNOW_API_KEY
```

### Run the MCP Server

```bash
cd airnow-mcp
npm install
npm run build
API_BASE_URL="https://www.airnowapi.org" AIRNOW_API_KEY="your-api-key" node dist/index.js
```

**Note**: AirNow uses query parameter authentication (`?API_KEY=...`) rather than header-based auth. The `--auth-header API_KEY` flag sets the query parameter name.

## Using Your Own OpenAPI Spec

### Local File

```bash
npm run dev -- \
  --openapi path/to/your/openapi.json \
  --out my-mcp \
  --service-name myservice \
  --transport stdio
```

### Remote URL

```bash
npm run dev -- \
  --openapi https://api.example.com/openapi.json \
  --out my-mcp \
  --service-name myservice \
  --transport http \
  --api-base-url https://api.example.com
```

### With Authentication

#### API Key (as header)

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

#### API Key (as query parameter)

Some APIs (like AirNow) require API keys as query parameters instead of headers:

```bash
npm run dev -- \
  --openapi examples/airnow.json \
  --out my-mcp \
  --service-name myservice \
  --transport stdio \
  --api-base-url https://www.airnowapi.org \
  --auth-type apiKey \
  --auth-header API_KEY \
  --auth-env API_KEY
```

The `--auth-header` flag sets the query parameter name when the API uses query parameter authentication.

#### Bearer Token

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

## Tips

1. **Start Simple**: Begin with the Petstore example to understand the basics
2. **Check Your Spec**: Ensure your OpenAPI spec is valid (use an online validator)
3. **Test Locally First**: Use stdio transport for local testing before deploying
4. **Use MCP Inspector**: It's the easiest way to test your generated MCP server
5. **Check Logs**: If something doesn't work, check the generated code and logs

## Common Issues

### "No operations found"

- Ensure your OpenAPI spec has paths with GET or POST methods
- Check that operations have `operationId` or can be inferred from the path

### "Authentication errors"

- Verify your auth token is set correctly
- Check that the auth header name matches your API's requirements
- For APIs using query parameter auth, ensure `--auth-header` matches the expected query parameter name
- For Cloudflare Workers, ensure secrets are set using `wrangler secret put`

### "Schema errors"

- Some complex OpenAPI schema features may not be fully supported
- Try simplifying your schema or check the Architecture docs for limitations

## Adding Your Example

To add a new example:

1. Add the OpenAPI spec file to this directory
2. Update this README with:
   - Description of the API
   - Generation command
   - Any special configuration needed
   - Testing instructions


