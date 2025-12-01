# openapi-to-mcp

> Generate Model Context Protocol (MCP) servers from OpenAPI specifications. Transform any REST API into an MCP server for use with AI assistants like ChatGPT and Claude.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`openapi-to-mcp` is a code generation tool that automatically creates MCP (Model Context Protocol) servers from OpenAPI/Swagger specifications. It enables AI assistants to interact with any REST API by converting OpenAPI operations into MCP tools.

### Features

- **Automatic Code Generation**: Converts OpenAPI specs to fully functional MCP servers
- **Multiple Transport Options**: Supports both stdio and HTTP transports
- **Authentication Support**: Handles API keys, bearer tokens, and no-auth APIs
- **Type Safety**: Generates TypeScript code with proper type definitions
- **Web UI**: Includes MCP Hub, a web interface for generating and deploying MCP servers
- **Cloudflare Workers**: Deploy generated MCP servers directly to Cloudflare Workers
- **OpenAPI 2.0 & 3.0**: Supports both Swagger 2.0 and OpenAPI 3.0 specifications

## Quick Start

### Installation

**Option 1: Install the CLI globally (Recommended)**

```bash
npm install -g @agentoauth/mcp
```

**Option 2: Use with npx (No installation needed)**

```bash
npx @agentoauth/mcp generate <openapi-spec>
```

**Option 3: Clone and develop**

```bash
# Clone the repository
git clone https://github.com/yourusername/openapi-to-mcp.git
cd openapi-to-mcp

# Install dependencies
npm install
```

### CLI Usage

The `mcp` CLI provides a simple, beginner-friendly interface:

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

# Build and run generated server
mcp serve ./stripe-mcp
```

**Smart Defaults:**
- Auto-detects service name from OpenAPI spec
- Auto-detects authentication from security schemes
- Auto-detects API base URL from servers
- Works for 90% of use cases without additional options

See the [mcp README](./packages/mcp/README.md) for complete documentation.

### Legacy CLI (Development Mode)

For development or advanced usage, you can still use the original CLI:

```bash
# Basic usage (stdio transport)
npm run dev -- \
  --openapi examples/petstore-openapi.json \
  --out my-mcp-server \
  --service-name petstore

# With HTTP transport (for Cloudflare Workers)
npm run dev -- \
  --openapi https://api.weather.gov/openapi.json \
  --out weather-mcp \
  --service-name weather \
  --transport http \
  --api-base-url https://api.weather.gov
```

### Web UI (MCP Hub)

The project includes a web interface for generating and deploying MCP servers:

```bash
# Start the backend
cd apps/mcp-hub
npm install
npm run dev

# In another terminal, start the frontend
cd apps/mcp-hub/client
npm install
npm run dev
```

Open http://localhost:5173 in your browser to use the MCP Hub.

## Examples

See the [`examples/`](./examples/) directory for example OpenAPI specs and generated MCP servers.

### Example: Petstore API

```bash
# Using mcp CLI (recommended)
mcp generate examples/petstore-openapi.json --out petstore-mcp
cd petstore-mcp
npm install
npm run build
export API_BASE_URL="https://petstore3.swagger.io/api/v3"
node dist/index.js
```

### Example: Stripe API

```bash
# Generate with authentication
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

### Example: Weather API

```bash
# Using mcp CLI
mcp generate https://api.weather.gov/openapi.json \
  --out weather-mcp \
  --service-name weather \
  --transport http \
  --api-base-url https://api.weather.gov
```

## Usage

### mcp CLI (Recommended)

The `mcp` CLI provides a simple interface with smart defaults. See the [complete mcp documentation](./packages/mcp/README.md) for details.

**Quick Reference:**
```bash
# Generate MCP server
mcp generate <openapi-spec> [--out <dir>] [--force]

# With authentication
mcp generate <openapi-spec> \
  --auth-type bearer \
  --auth-env TOKEN_NAME

# Build and run
mcp serve <generated-directory>
```

**Simple Options:**
- `-o, --openapi <path>` - OpenAPI spec path or URL
- `--out <dir>` - Output directory (default: `./generated-mcp`)
- `--force` - Overwrite output directory if it exists

**Advanced Options** (use `mcp --help-all` to see all):
- `--transport <type>` - Transport: stdio or http
- `--auth-type <type>` - Auth type: none, apiKey, or bearer
- `--auth-header <name>` - Auth header name
- `--auth-env <name>` - Environment variable name for auth token
- `--api-base-url <url>` - API base URL for HTTP transport
- `--config <file>` - Path to transform config file
- `--include-tags <tags>` - Comma-separated list of tags to include
- `--exclude-tags <tags>` - Comma-separated list of tags to exclude
- `--include-paths <paths>` - Comma-separated list of path patterns to include
- `--exclude-paths <paths>` - Comma-separated list of path patterns to exclude
- `--service-name <name>` - Service name (auto-detected if not provided)

## Transforming Tools

You can filter and customize which operations become MCP tools using CLI flags or a config file.

### Using CLI Flags

Filter operations by tags or paths:

```bash
# Include only operations with "pet" or "store" tags
mcp generate examples/petstore-openapi.json \
  --include-tags "pet,store" \
  --out petstore-mcp

# Exclude admin and internal paths
mcp generate examples/petstore-openapi.json \
  --exclude-paths "/admin/*,/internal/*" \
  --out petstore-mcp
```

### Using Config File

Create an `mcp.config.yaml` file for more control:

```yaml
# Include only operations with the "pet" tag
includeTags:
  - pet

# Exclude admin/internal paths
excludePaths:
  - /admin/*
  - /internal/*

# Per-operation overrides
tools:
  findPetsByStatus:
    name: listPets
    description: "List available pets filtered by status"

  getPetById:
    name: getPet
    description: "Get a pet by its ID"

  # Disable operations you don't want
  deletePet:
    enabled: false
```

Then use it:

```bash
mcp generate examples/petstore-openapi.json \
  --config examples/petstore/mcp.config.yaml \
  --out petstore-mcp
```

See [`examples/petstore/mcp.config.yaml`](./examples/petstore/mcp.config.yaml) for a complete example.

## Local Mode vs Cloud Deploy

The project supports two modes of operation:

### Local Mode

**Purpose**: Generate MCP servers locally without Cloudflare deployment.

**Features**:
- Generate MCP projects from OpenAPI specs
- Preview generated code
- Download projects as zip files
- Run in your own environment
- No Cloudflare account needed

**Usage**:
- Set `MODE=local` in environment (or use default)
- Use MCP Hub web UI or CLI
- Projects are generated but not automatically deployed

### Cloud Deploy (Optional)

**Purpose**: Automatically deploy generated MCP servers to Cloudflare Workers.

**Requirements**:
- Cloudflare account
- Environment variable: `ENABLE_CLOUDFLARE_DEPLOY=true`
- Cloudflare credentials (optional, wrangler can use local config)

**Security**:
- **Deployment is disabled by default** for security
- Only enabled when `ENABLE_CLOUDFLARE_DEPLOY=true` is explicitly set
- Uses your own Cloudflare credentials (never hardcoded)
- Frontend checks capabilities and only shows deploy button if enabled

**Setup**:
1. Copy `apps/mcp-hub/.env.example` to `apps/mcp-hub/.env`
2. Set `ENABLE_CLOUDFLARE_DEPLOY=true`
3. Configure Cloudflare credentials (or use wrangler's local config)
4. Deploy button will appear in the UI

**Note**: Never commit `.env` files with credentials to version control.

### Generated Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   └── tools.ts          # Generated tool definitions
├── package.json
├── tsconfig.json
└── README.md
```

### Running Generated MCP Servers

#### stdio Transport

```bash
cd my-mcp-server
npm install
npm run build
API_BASE_URL="https://api.example.com" npm start
```

#### HTTP Transport (Cloudflare Workers)

```bash
cd my-mcp-server
npm install
npm run build
npx wrangler deploy
```

For APIs requiring authentication, set the token as a Cloudflare Worker secret:

```bash
npx wrangler secret put API_TOKEN
```

## Curated Benchmarks

These OpenAPI specs are regularly tested with `npm run bench`:

| API                | Source                              | Tools (approx) |
| ------------------ | ----------------------------------- | -------------- |
| Petstore v3        | examples/petstore-openapi.json      | 19             |
| Petstore v2        | examples/petstore-v2-openapi.json   | 20             |
| Weather.gov        | examples/weather-openapi.json       | 2              |
| GitHub             | GitHub REST OpenAPI                 | ~1100          |
| Slack              | Slack Web API OpenAPI               | ~170           |
| Stripe             | Stripe API OpenAPI                  | ~580           |
| Twilio             | Twilio API OpenAPI                  | ~190           |
| Kubernetes         | Kubernetes upstream OpenAPI         | ~1050          |
| DigitalOcean       | Official DigitalOcean OpenAPI        | ~540           |

Run `npm run bench` to test all specs and verify the generator works correctly across different API formats and sizes.

## Architecture

The project follows a modular architecture:

- **`packages/mcp/`**: Simple CLI for generating and running MCP servers (recommended)
- **`packages/cli/`**: Legacy command-line interface (for development)
- **`packages/core/`**: Core domain types (`mcp-core` package)
- **`packages/generator/`**: Core code generation logic
- **`packages/templates/`**: Handlebars templates for generated code
- **`apps/mcp-hub/`**: Web UI for generating and deploying MCP servers
- **`examples/`**: Example OpenAPI specs

For detailed architecture documentation, see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Project Structure

```
openapi-to-mcp/
├── packages/              # Core packages
│   ├── mcp/          # Simple CLI (recommended)
│   │   ├── src/
│   │   │   └── index.ts # CLI entry point
│   │   └── README.md    # CLI documentation
│   ├── core/            # Core domain types
│   │   └── src/
│   │       └── index.ts # Shared types and generator wrapper
│   ├── cli/             # Legacy command-line interface
│   │   └── src/
│   │       └── index.ts # Legacy CLI entry point
│   ├── generator/        # Code generation engine
│   │   └── src/
│   │       ├── openapiLoader.ts      # OpenAPI spec loading
│   │       ├── operationExtractor.ts # Extract API operations
│   │       ├── toolInferer.ts        # Convert operations to MCP tools
│   │       ├── schemaUtils.ts        # Schema conversion utilities
│   │       ├── projectRenderer.ts    # stdio transport renderer
│   │       └── httpRenderer.ts        # HTTP transport renderer
│   └── templates/        # Handlebars templates
│       ├── *.hbs         # stdio transport templates
│       └── http/         # HTTP transport templates
├── apps/                 # Applications
│   └── mcp-hub/         # Web UI for MCP generation
│       ├── src/         # Backend (Express server)
│       └── client/      # Frontend (React + Vite)
├── examples/            # Example OpenAPI specifications
│   ├── petstore-openapi.json
│   ├── stripe-openapi.json
│   ├── slack-openapi.json
│   └── README.md
├── docs/                # Documentation
│   ├── QUICKSTART.md
│   └── ARCHITECTURE.md
├── scratch/             # Generated/test projects (gitignored)
├── LICENSE              # MIT License
├── README.md            # This file
├── CONTRIBUTING.md      # Contribution guidelines
└── package.json         # Root package configuration
```

### Key Directories

- **`packages/mcp/`**: Simple CLI for generating and running MCP servers (recommended for users)
- **`packages/core/`**: Core domain types (`mcp-core` npm package)
- **`packages/generator/`**: Code generation engine
- **`packages/cli/`**: Legacy CLI (for development)
- **`apps/`**: Contains standalone applications (like the MCP Hub web UI)
- **`examples/`**: Example OpenAPI specs for testing and demonstration
- **`docs/`**: Project documentation
- **`scratch/`**: Temporary directory for generated projects (excluded from git)

## Documentation

- **[mcp CLI Guide](./packages/mcp/README.md)**: Complete guide to the `mcp` CLI
- **[Testing Generated MCP Servers](./TESTING_GENERATED_MCP.md)**: How to test generated servers
- **[Testing Slack MCP](./TESTING_SLACK_MCP.md)**: Slack-specific testing guide
- **[Quick Start Guide](./docs/QUICKSTART.md)**: Step-by-step tutorial
- **[Architecture](./docs/ARCHITECTURE.md)**: Technical details and design decisions
- **[Contributing](./CONTRIBUTING.md)**: How to contribute to the project
- **[GitHub Setup](./docs/GITHUB_SETUP.md)**: GitHub repository setup and workflow guide
- **[Git Guide](./docs/GIT_GUIDE.md)**: Git commands and workflows

## Building and Compiling

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Build Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/openapi-to-mcp.git
cd openapi-to-mcp

# 2. Install dependencies
npm install

# 3. Build the project (compiles TypeScript to JavaScript)
npm run build
```

The build process compiles all TypeScript files in `packages/` to JavaScript in the `dist/` directory.

### Development Mode

For development, you can run the CLI directly without building:

```bash
# Run CLI in development mode (uses ts-node)
npm run dev -- --openapi examples/petstore-openapi.json --out test-output
```

### Type Checking

Check for TypeScript errors without building:

```bash
npm run type-check
```

### Building Individual Packages

The project uses a monorepo structure. To build specific packages:

```bash
# Build CLI package
cd packages/cli
npm run build  # if package.json has build script

# Build generator package
cd packages/generator
npm run build  # if package.json has build script
```

## Testing

### Running Tests

Currently, the project uses manual testing. Here's how to test the code generation:

#### 1. Generate a Test MCP Server

```bash
# Generate Petstore MCP (included example)
npm run cli:generate:petstore
```

This creates a test MCP server in `scratch/petstore-mcp-cli/`.

#### 2. Build the Generated Server

```bash
cd scratch/petstore-mcp-cli
npm install
npm run build
```

#### 3. Test with MCP Client Script

```bash
# From project root
npm run test:mcp
```

This runs `scripts/test-mcp-client.ts`, which:
- Spawns the generated MCP server
- Sends a JSON-RPC request to execute a tool
- Verifies the response

#### 4. Test with MCP Inspector (Recommended)

```bash
cd scratch/petstore-mcp-cli
API_BASE_URL="https://petstore3.swagger.io/api/v3" \
  npx @modelcontextprotocol/inspector node dist/index.js
```

This launches a web UI where you can:
- Browse available tools
- Execute tools with different arguments
- View request/response logs

#### 5. Manual JSON-RPC Testing

```bash
cd scratch/petstore-mcp-cli
echo '{"jsonrpc":"2.0","id":"1","method":"tools/list"}' | \
  API_BASE_URL="https://petstore3.swagger.io/api/v3" node dist/index.js
```

### Testing Different Scenarios

#### Test with HTTP Transport

```bash
# Generate HTTP transport MCP
npm run dev -- \
  --openapi https://api.weather.gov/openapi.json \
  --out test-weather-mcp \
  --service-name weather \
  --transport http \
  --api-base-url https://api.weather.gov

# Build and deploy
cd test-weather-mcp
npm install
npm run build
npx wrangler deploy
```

#### Test with Authentication

```bash
# Generate MCP with bearer token auth
npm run dev -- \
  --openapi https://api.github.com/openapi.json \
  --out test-github-mcp \
  --service-name github \
  --transport http \
  --api-base-url https://api.github.com \
  --auth-type bearer \
  --auth-env GITHUB_TOKEN

# Build, deploy, and set secret
cd test-github-mcp
npm install
npm run build
npx wrangler deploy
npx wrangler secret put GITHUB_TOKEN
```

## Building and Testing

### Building the Project

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Type check without building
npm run type-check
```

The build process compiles all TypeScript files in `packages/` to JavaScript in the `dist/` directory.

### Testing

#### Type Checking

```bash
# Check for TypeScript errors
npm run type-check
```

#### Testing the CLI

**Generate a test MCP server:**

```bash
# Generate Petstore MCP (included example)
npm run cli:generate:petstore
```

**Build and test the generated server:**

```bash
cd scratch/petstore-mcp-cli
npm install
npm run build
```

**Test with MCP client script:**

```bash
# From project root
npm run test:mcp
```

This runs `scripts/test-mcp-client.ts`, which:
- Spawns the generated MCP server
- Sends a JSON-RPC request to execute a tool
- Verifies the response

**Test with MCP Inspector (Recommended):**

```bash
cd scratch/petstore-mcp-cli
API_BASE_URL="https://petstore3.swagger.io/api/v3" \
  npx @modelcontextprotocol/inspector node dist/index.js
```

This launches a web UI where you can:
- Browse available tools
- Execute tools with different arguments
- View request/response logs

**Manual JSON-RPC testing:**

```bash
cd scratch/petstore-mcp-cli
echo '{"jsonrpc":"2.0","id":"1","method":"tools/list"}' | \
  API_BASE_URL="https://petstore3.swagger.io/api/v3" node dist/index.js
```

#### Testing the MCP Hub

**Start the backend:**

```bash
cd apps/mcp-hub
npm install
npm run dev
```

**Start the frontend (in another terminal):**

```bash
cd apps/mcp-hub/client
npm install
npm run dev
```

**Test the API endpoints:**

```bash
# Health check
curl http://localhost:4000/health

# Mode detection
curl http://localhost:4000/api/mode

# Capabilities check
curl http://localhost:4000/api/capabilities

# Extract operations (dry run)
curl -X POST http://localhost:4000/api/operations \
  -H "Content-Type: application/json" \
  -d '{"openapiUrlOrText": "examples/petstore-openapi.json"}'

# Generate MCP (public mode)
curl -X POST http://localhost:4000/api/generate-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "openapiUrlOrText": "examples/petstore-openapi.json",
    "serviceName": "petstore"
  }'
```

**Test with transform config:**

```bash
# Generate with transform
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "openapiUrlOrText": "examples/petstore-openapi.json",
    "serviceName": "petstore",
    "transport": "http",
    "transform": {
      "includeTags": ["pet"],
      "tools": {
        "findPetsByStatus": {
          "name": "listPets",
          "description": "List available pets"
        }
      }
    }
  }'
```

#### Testing Generated MCP Servers

**stdio Transport:**

```bash
cd scratch/petstore-mcp-cli
npm install
npm run build
API_BASE_URL="https://petstore3.swagger.io/api/v3" npm start
```

The server listens on stdin/stdout for JSON-RPC requests.

**HTTP Transport (Cloudflare Workers):**

```bash
cd scratch/petstore-mcp-cli
npm install
npm run build
npx wrangler deploy
```

**Test deployed worker:**

```bash
curl -X POST https://your-worker.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list"
  }'
```

### Debug Scripts

The project includes debug scripts for development:

```bash
# Debug OpenAPI parsing
npm run debug:parse

# Debug tool inference
npm run debug:tools

# Debug stdio generation
npm run debug:generate

# Debug HTTP generation
npm run debug:generate:http
```

### Test Checklist

Before submitting changes, verify:

- [ ] `npm run type-check` passes
- [ ] `npm run build` completes without errors
- [ ] `npm run cli:generate:petstore` generates successfully
- [ ] Generated MCP server builds (`cd scratch/petstore-mcp-cli && npm run build`)
- [ ] `npm run test:mcp` executes successfully
- [ ] MCP Hub backend starts without errors
- [ ] MCP Hub frontend starts without errors
- [ ] API endpoints respond correctly

## Development

```bash
# Build the project
npm run build

# Type check
npm run type-check

# Run CLI in development mode
npm run dev -- --openapi examples/petstore-openapi.json --out test-output

# Lint code (when configured)
npm run lint

# Format code (when configured)
npm run format
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Quick Git Reference

```bash
# Clone the repository
git clone https://github.com/yourusername/openapi-to-mcp.git
cd openapi-to-mcp

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "feat: Add new feature"

# Push to your fork
git push origin feature/your-feature-name
```

For detailed Git instructions, see the [Git Guide](./docs/GIT_GUIDE.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - The MCP specification
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - GUI tool for testing MCP servers

