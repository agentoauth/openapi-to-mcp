# Architecture Documentation

This document describes the internal architecture of `openapi-to-mcp`, explaining how OpenAPI specifications are transformed into MCP servers.

## Code Generation Flow

The code generation process follows these steps:

```
OpenAPI Spec → Load & Parse → Extract Operations → Infer Tools → Render Project
```

### 1. OpenAPI Spec Loading (`openapiLoader.ts`)

The loader handles multiple input formats:

- **URLs**: Fetches OpenAPI specs from HTTP/HTTPS URLs
- **Files**: Reads local JSON or YAML files
- **Text**: Parses raw OpenAPI text content (JSON or YAML)

**Key Functions:**
- `loadOpenAPISpec(source)`: Main entry point that detects input type
- `loadOpenAPISpecFromUrl(url)`: Fetches and parses remote specs
- `loadOpenAPISpecFromFile(path)`: Reads and parses local files
- `loadOpenAPISpecFromText(text)`: Parses raw text content
- `convertSwagger2ToOpenAPI3(doc)`: Converts Swagger 2.0 to OpenAPI 3.0

**Swagger 2.0 Support:**
The loader automatically detects Swagger 2.0 specs and converts them to OpenAPI 3.0 using the `swagger2openapi` library.

### 2. Operation Extraction (`operationExtractor.ts`)

Extracts API operations from the OpenAPI spec and normalizes them into a consistent format.

**Process:**
1. Iterates through all paths in `spec.paths`
2. Extracts GET and POST operations (other methods are not currently supported)
3. Builds `ApiOperation` objects with:
   - Operation ID (from `operationId` or generated from method + path)
   - HTTP method and path
   - Parameters (path, query, header, cookie)
   - Request body schema (for POST operations)
   - Response schema (first 2xx response)
   - Summary and description
   - Tags

**Parameter Handling:**
- Extracts parameters from both path-level and operation-level definitions
- Automatically detects path parameters from the path string (e.g., `/users/{id}`)
- Resolves parameter references from `components/parameters`
- Infers parameter types when not explicitly defined

**Key Function:**
- `extractOperationsFromSpec(spec)`: Returns `ParsedApi` with operations and components

### 3. Tool Inference (`toolInferer.ts`)

Converts API operations into MCP tools.

**Process:**
1. Maps each operation to an `McpTool`:
   - **Name**: Normalized from operation ID (see Tool Naming below)
   - **Description**: Built from operation summary, description, and tags
   - **Input Schema**: JSON Schema for tool arguments (see Argument Inference)
   - **Output Schema**: JSON Schema for tool response
   - **Operation**: Original operation metadata

**Key Functions:**
- `inferToolsFromOperations(parsed)`: Converts operations to tools
- `normalizeToolName(operationId)`: Normalizes operation IDs to tool names
- `buildToolDescription(op)`: Creates human-readable descriptions
- `buildInputSchemaForOperation(op, components)`: Builds input JSON Schema

### 4. Schema Conversion (`schemaUtils.ts`)

Converts OpenAPI schemas to JSON Schema format used by MCP.

**Features:**
- Resolves `$ref` references to components
- Handles arrays, objects, primitives, and enums
- Preserves descriptions and formats
- Maps OpenAPI types to JSON Schema types

**Key Functions:**
- `openApiSchemaToJsonSchema(schema, components)`: Converts OpenAPI schema to JSON Schema
- `buildInputSchemaForOperation(op, components)`: Builds input schema from operation parameters and request body

**Limitations:**
- Currently supports basic schema types (string, number, integer, boolean, array, object)
- Complex OpenAPI features (oneOf, allOf, anyOf) are not fully supported
- Format validation is preserved but not strictly enforced

### 5. Project Rendering (`projectRenderer.ts` / `httpRenderer.ts`)

Generates the MCP server project files using Handlebars templates.

**Two Renderers:**
- **stdio Renderer** (`projectRenderer.ts`): Generates stdio-based MCP servers
- **HTTP Renderer** (`httpRenderer.ts`): Generates Cloudflare Workers for HTTP transport

**Generated Files:**
- `src/index.ts`: Main MCP server entry point
- `src/tools.ts` or `src/tools/*.ts`: Tool implementations
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `README.md`: Usage instructions
- `schema.json`: Tool schema definitions (for stdio)
- `wrangler.toml`: Cloudflare Workers configuration (for HTTP)

**Template System:**
Uses Handlebars templates in `packages/templates/`:
- `mcpServer.hbs`: Main server template
- `toolFunction.hbs`: Individual tool function template
- `toolsIndex.hbs`: Tools index/registry
- `packageJson.hbs`: Package.json template
- HTTP-specific templates in `packages/templates/http/`

## Tool Naming

Tool names are derived from operation IDs using `normalizeToolName()`:

1. **Operation ID exists**: Uses the operation ID directly
2. **Operation ID missing**: Generates from method + path (e.g., `getUsers` from `GET /users`)
3. **Normalization rules**:
   - Converts to camelCase
   - Removes special characters
   - Ensures valid JavaScript identifier

**Example:**
- Operation ID: `get_user_by_id` → Tool name: `getUserById`
- Path: `GET /api/users/{id}` → Tool name: `getApiUsersById`

## Argument Inference

The input schema for each tool is built from:

1. **Path Parameters**: Extracted from the URL path (e.g., `{id}` in `/users/{id}`)
2. **Query Parameters**: From `parameters` array with `in: "query"`
3. **Request Body**: For POST operations, properties from request body schema
4. **Header/Cookie Parameters**: Currently extracted but may not be used in tool arguments

**Body Field Detection:**
For POST operations, body fields are identified as properties in the input schema that are NOT path or query parameters.

**Example:**
```typescript
// Operation: POST /users/{id}/posts
// Parameters: {id} (path), ?limit (query)
// Request Body: {title: string, content: string}
// 
// Input Schema:
{
  type: "object",
  properties: {
    id: { type: "string" },      // path param
    limit: { type: "number" },   // query param
    title: { type: "string" },   // body field
    content: { type: "string" }  // body field
  },
  required: ["id", "title", "content"]
}
```

## Runtime Templates

### stdio Transport

The stdio transport generates a Node.js process that:
- Reads JSON-RPC requests from stdin
- Executes tools based on method names
- Writes JSON-RPC responses to stdout
- Handles MCP protocol methods (`initialize`, `tools/list`, `tools/call`)

### HTTP Transport

The HTTP transport generates a Cloudflare Worker that:
- Exposes an HTTP endpoint (typically `/mcp`)
- Handles JSON-RPC over HTTP POST
- Supports CORS for browser-based clients
- Uses environment variables for API base URL and authentication

**Authentication:**
- API Key: Adds custom header (e.g., `X-API-Key: <token>`)
- Bearer Token: Adds `Authorization: Bearer <token>` header
- Token values are read from environment variables or Cloudflare Worker secrets

## Limits and Known Limitations

### Supported Features

- ✅ OpenAPI 3.0 and Swagger 2.0
- ✅ GET and POST operations
- ✅ Path, query, header, and cookie parameters
- ✅ Request bodies (JSON)
- ✅ Response schemas
- ✅ Basic authentication (API key, bearer token)
- ✅ Schema references (`$ref`)
- ✅ Arrays and nested objects
- ✅ Enums

### Not Currently Supported

- ❌ PUT, PATCH, DELETE operations
- ❌ Complex schema features (oneOf, allOf, anyOf)
- ❌ OAuth 2.0 flows
- ❌ Multiple response codes (only first 2xx is used)
- ❌ File uploads
- ❌ WebSocket operations
- ❌ Parameter references in path items
- ❌ Callback operations

### Future Improvements

- Support for more HTTP methods
- Better schema resolution for complex types
- Support for OAuth 2.0 authentication
- Multiple response schema handling
- File upload support
- Better error handling and validation

## Project Structure

```
openapi-to-mcp/
├── packages/
│   ├── cli/              # Command-line interface
│   ├── generator/        # Core code generation logic
│   │   ├── openapiLoader.ts      # OpenAPI spec loading
│   │   ├── operationExtractor.ts # Operation extraction
│   │   ├── toolInferer.ts        # Tool inference
│   │   ├── schemaUtils.ts        # Schema conversion
│   │   ├── projectRenderer.ts    # stdio renderer
│   │   └── httpRenderer.ts       # HTTP renderer
│   └── templates/        # Handlebars templates
├── apps/
│   └── mcp-hub/         # Web UI for generating MCP servers
└── examples/            # Example OpenAPI specs
```

## Type System

The project uses TypeScript for type safety:

- **OpenAPI Types**: Uses `openapi-types` package for OpenAPI 3.0 types
- **Internal Models**: Defined in `packages/generator/src/models.ts`
- **JSON Schema**: Loosely typed as `any` (can be tightened in future)

## Error Handling

The generator handles errors at each stage:

1. **Loading**: Invalid URLs, missing files, parse errors
2. **Extraction**: Missing operation IDs, invalid parameters
3. **Inference**: Schema resolution failures
4. **Rendering**: Template rendering errors, file system errors

Errors are propagated up and displayed to the user with context about which stage failed.


