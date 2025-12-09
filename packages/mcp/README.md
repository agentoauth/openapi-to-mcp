# @agentoauth/mcp

> Simple CLI to generate and run MCP servers from OpenAPI specs

`@agentoauth/mcp` is a beginner-friendly command-line tool that automatically generates Model Context Protocol (MCP) servers from OpenAPI specifications. It provides smart defaults that work for 90% of use cases, with advanced options available when needed.

## Installation

```bash
npm install -g @agentoauth/mcp
```

Or use with `npx`:

```bash
npx @agentoauth/mcp generate <openapi-spec>
```

## Quick Start

### Generate an MCP Server

```bash
# Simple usage - auto-detects service name, auth, and base URL
mcp generate examples/petstore-openapi.json

# Specify output directory
mcp generate examples/petstore-openapi.json --out my-mcp-server

# With authentication
mcp generate examples/stripe-openapi.json \
  --out stripe-mcp \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY
```

### Run a Generated Server

```bash
# Build and run
mcp serve ./my-mcp-server

# Skip build step
mcp serve ./my-mcp-server --no-build
```

## Commands

### `generate`

Generate an MCP server from an OpenAPI specification.

**Basic Usage:**
```bash
mcp generate <openapi-spec> [options]
```

**Arguments:**
- `<openapi-spec>` - Path to OpenAPI spec file (JSON/YAML) or URL

**Options:**
- `-o, --openapi <path>` - OpenAPI spec path or URL (alternative to positional argument)
- `--out <dir>` - Output directory (default: `./generated-mcp`)
- `--force` - Overwrite output directory if it exists

**Examples:**
```bash
# From file
mcp generate examples/petstore-openapi.json

# From URL
mcp generate https://api.example.com/openapi.json

# Custom output directory
mcp generate examples/stripe-openapi.json --out stripe-mcp

# With force overwrite
mcp generate examples/slack-openapi.json --out slack-mcp --force
```

### `serve`

Build and run a generated MCP server.

**Usage:**
```bash
mcp serve <directory> [options]
```

**Arguments:**
- `<directory>` - Path to generated MCP directory

**Options:**
- `--build` - Build before serving (default: true)
- `--no-build` - Skip build step

**Examples:**
```bash
# Build and run
mcp serve ./my-mcp-server

# Run without building
mcp serve ./my-mcp-server --no-build
```

## Smart Defaults

`mcp` automatically detects:

- **Service Name**: From OpenAPI spec `info.title` or filename
- **Authentication**: From OpenAPI spec `security` schemes
- **API Base URL**: From OpenAPI spec `servers` (for HTTP transport)

You only need to specify these if the auto-detection doesn't work or you want to override them.

## Advanced Options

Advanced options are available but hidden from the default help. Use `--help-all` to see them, or check the examples below:

### Authentication

```bash
# Bearer token
mcp generate examples/api.json \
  --auth-type bearer \
  --auth-env API_TOKEN

# API Key (as header)
mcp generate examples/api.json \
  --auth-type apiKey \
  --auth-header X-API-Key \
  --auth-env API_KEY

# API Key (as query parameter, e.g., AirNow API)
mcp generate examples/airnow.json \
  --auth-type apiKey \
  --auth-header API_KEY \
  --auth-env AIRNOW_API_KEY
```

### Transport

```bash
# HTTP transport (for Cloudflare Workers)
mcp generate examples/api.json \
  --transport http \
  --api-base-url https://api.example.com
```

### Filtering Operations

```bash
# Include only specific tags
mcp generate examples/api.json \
  --include-tags "public,user"

# Exclude admin operations
mcp generate examples/api.json \
  --exclude-tags "admin,internal"

# Include/exclude by path patterns
mcp generate examples/api.json \
  --include-paths "/api/v1/*" \
  --exclude-paths "/admin/*"
```

### Transform Config File

For more complex filtering, use a config file:

```yaml
# mcp.config.yaml
includeTags:
  - public
  - user

excludePaths:
  - /admin/*
  - /internal/*

tools:
  getUsers:
    name: listUsers
    description: "List all users"
  deleteUser:
    enabled: false
```

```bash
mcp generate examples/api.json --config mcp.config.yaml
```

## Examples

### Stripe API

```bash
# Generate Stripe MCP server
mcp generate examples/stripe-openapi.json \
  --out stripe-mcp \
  --service-name stripe \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY

# Build and test
cd stripe-mcp
npm install
npm run build
export API_BASE_URL="https://api.stripe.com"
export STRIPE_SECRET_KEY="sk_test_your_key"
node dist/index.js
```

### Slack API

```bash
# Generate Slack MCP server
mcp generate examples/slack-openapi.json \
  --out slack-mcp \
  --service-name slack \
  --auth-type bearer \
  --auth-env SLACK_TOKEN

# Build and test
cd slack-mcp
npm install
npm run build
export API_BASE_URL="https://slack.com/api"
export SLACK_TOKEN="xoxb-your-token"
node dist/index.js
```

### Simple API (No Auth)

```bash
# Generate for public API
mcp generate examples/petstore-openapi.json --out petstore-mcp

# Build and run
cd petstore-mcp
npm install
npm run build
export API_BASE_URL="https://petstore3.swagger.io/api/v3"
node dist/index.js
```

## Generated Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts          # MCP server entry point
│   └── tools/            # Generated tool functions
│       ├── index.ts      # Tool registry
│       └── *.ts          # Individual tool files
├── dist/                 # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
├── schema.json           # MCP tool schema
├── README.md             # Usage instructions
└── .env.example          # Environment variable template (if auth configured)
```

## Testing Generated Servers

### Quick Test

```bash
# Test with a simple tool call
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"getaccount","arguments":{}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="sk_test_..." \
  node dist/index.js
```

### List Available Tools

```bash
# After building
node -e "const tools = require('./dist/tools/index.js'); console.log(Object.keys(tools.tools).join('\\n'));"
```

See [TESTING_GENERATED_MCP.md](../../TESTING_GENERATED_MCP.md) for detailed testing instructions.

## Integration with MCP Clients

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "node",
      "args": ["/path/to/stripe-mcp/dist/index.js"],
      "env": {
        "API_BASE_URL": "https://api.stripe.com",
        "STRIPE_SECRET_KEY": "sk_test_..."
      }
    }
  }
}
```

### Cursor

Configure in Cursor settings to use the generated MCP server.

## Troubleshooting

### "Unknown tool" Error

- Tool names are **all lowercase with no underscores** (e.g., `getaccount`, not `get_account`)
- Check available tools: `ls src/tools/` or use the Node.js command above

### Authentication Errors

- Verify environment variables are set: `echo $STRIPE_SECRET_KEY`
- Check that auth code was generated: `grep "STRIPE_SECRET_KEY" src/tools/getAccount.ts`
- Ensure your API key/token is valid

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Advanced Usage

For advanced options, see the full help:

```bash
mcp --help-all
mcp generate --help-all
```

## Related

- [openmcp-core](../core/README.md) - Core domain types
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [Testing Guide](../../TESTING_GENERATED_MCP.md) - Detailed testing instructions

## License

MIT

