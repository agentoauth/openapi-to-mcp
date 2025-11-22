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

```bash
# Clone the repository
git clone https://github.com/yourusername/openapi-to-mcp.git
cd openapi-to-mcp

# Install dependencies
npm install
```

### CLI Usage

Generate an MCP server from an OpenAPI spec:

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

# With authentication
npm run dev -- \
  --openapi https://api.github.com/openapi.json \
  --out github-mcp \
  --service-name github \
  --transport http \
  --api-base-url https://api.github.com \
  --auth-type bearer \
  --auth-env GITHUB_TOKEN
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
npm run cli:generate:petstore
cd scratch/petstore-mcp-cli
npm install
npm run build
API_BASE_URL="https://petstore3.swagger.io/api/v3" npm start
```

### Example: Weather API

```bash
npm run dev -- \
  --openapi https://api.weather.gov/openapi.json \
  --out weather-mcp \
  --service-name weather \
  --transport http \
  --api-base-url https://api.weather.gov
```

## Usage

### CLI Options

```
Options:
  -o, --openapi <pathOrUrl>    OpenAPI spec path or URL (required)
  --out <dir>                  Output directory (default: scratch/generated-mcp)
  --service-name <name>        Service name for MCP (default: service)
  --auth-type <type>           Auth type: none | apiKey | bearer (default: none)
  --auth-header <name>         Auth header name (e.g. X-API-Key or Authorization)
  --auth-env <name>            Env var name for auth token
  --transport <type>           Transport: stdio | http (default: stdio)
  --api-base-url <url>         API base URL for HTTP transport
```

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

## Architecture

The project follows a modular architecture:

- **`packages/cli/`**: Command-line interface
- **`packages/generator/`**: Core code generation logic
- **`packages/templates/`**: Handlebars templates for generated code
- **`apps/mcp-hub/`**: Web UI for generating and deploying MCP servers
- **`examples/`**: Example OpenAPI specs

For detailed architecture documentation, see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Project Structure

```
openapi-to-mcp/
├── packages/              # Core packages
│   ├── cli/              # Command-line interface
│   │   └── src/
│   │       └── index.ts  # CLI entry point
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

- **`packages/`**: Contains the core functionality split into reusable packages
- **`apps/`**: Contains standalone applications (like the MCP Hub web UI)
- **`examples/`**: Example OpenAPI specs for testing and demonstration
- **`docs/`**: Project documentation
- **`scratch/`**: Temporary directory for generated projects (excluded from git)

## Documentation

- **[Quick Start Guide](./docs/QUICKSTART.md)**: Step-by-step tutorial
- **[Architecture](./docs/ARCHITECTURE.md)**: Technical details and design decisions
- **[Contributing](./CONTRIBUTING.md)**: How to contribute to the project
- **[GitHub Setup](./docs/GITHUB_SETUP.md)**: GitHub repository setup and workflow guide

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

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - The MCP specification
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - GUI tool for testing MCP servers

