# openmcp-core

Core domain types for Model Context Protocol (MCP) tool generation.

## MCP 2025 Support

This package includes full MCP 2025 Phase 1 compliance:

- **JSON Schema 2020-12**: Typed JSON Schema definitions with 2020-12 dialect
- **Tool Naming**: MCP-compliant tool name normalization and validation
- **Error Handling**: Tool-level vs protocol-level error distinction
- **Scope Metadata**: OAuth2 scope extraction and management
- **MCP 2025 Messages**: Support for tasks, sampling, and URL elicitation
- **Consent URLs**: OAuth2 consent URL builders for incremental authorization This package provides stable TypeScript types that are shared across the OpenAPI-to-MCP ecosystem.

## Installation

```bash
npm install openmcp-core
```

## Usage

```typescript
import type { MCPTool, MCPServerConfig, OpenAPIOperationRef } from 'openmcp-core';

// Define an MCP tool
const tool: MCPTool = {
  name: 'getWeather',
  description: 'Get weather information for a location',
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string' },
      units: { type: 'string', enum: ['celsius', 'fahrenheit'] }
    },
    required: ['location']
  }
};

// Define an MCP server configuration
const config: MCPServerConfig = {
  name: 'weather-service',
  description: 'Weather API MCP server',
  tools: [tool]
};

// Reference an OpenAPI operation
const operationRef: OpenAPIOperationRef = {
  operationId: 'getWeather',
  path: '/weather',
  method: 'get'
};
```

## API Reference

### `MCPTool`

Represents a tool that can be executed by an MCP server.

```typescript
type MCPTool = {
  name: string;
  description: string;
  inputSchema: unknown; // JSON Schema-ish
};
```

**Properties:**
- `name`: Unique identifier for the tool
- `description`: Human-readable description of what the tool does
- `inputSchema`: JSON Schema definition for the tool's input parameters

### `MCPServerConfig`

Defines the complete configuration for an MCP server.

```typescript
type MCPServerConfig = {
  name: string;
  description?: string;
  tools: MCPTool[];
};
```

**Properties:**
- `name`: Unique identifier for the MCP server
- `description`: Optional description of the server
- `tools`: Array of tools available in this server

### `OpenAPIOperationRef`

Lightweight reference to an OpenAPI operation, used for early-stage filtering and transformation before full extraction.

```typescript
type OpenAPIOperationRef = {
  operationId: string;
  path: string;
  method: string;
};
```

**Properties:**
- `operationId`: The OpenAPI operation ID
- `path`: The API path (e.g., `/users/{id}`)
- `method`: The HTTP method (e.g., `get`, `post`, `put`, `delete`)

## License

MIT

