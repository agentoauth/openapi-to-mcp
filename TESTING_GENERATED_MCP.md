# Testing Generated MCP Servers

This guide walks you through building and running a generated MCP server. We'll use the Stripe MCP server as an example.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A valid API key/token for the service you're testing

## Step 1: Navigate to the Generated Project

```bash
cd scratch/stripe-success
# Or for Slack: cd scratch/slack-success
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- TypeScript and build tools
- Type definitions for Node.js

Note: The generated server uses Node.js built-in modules (no external HTTP libraries needed).

## Step 3: Set Up Environment Variables

The generated server requires two environment variables:

1. **API Base URL** - The base URL for the API
2. **Authentication Token** - Your API key/token

### For Stripe:

```bash
export API_BASE_URL="https://api.stripe.com"
export STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
```

### For Slack:

```bash
export API_BASE_URL="https://slack.com/api"
export SLACK_TOKEN="xoxb-your-slack-token"
```

**Important Note on Authentication:**

The generated code should include authentication headers, but you may need to verify this. Check `src/tools/getAccount.ts` (or any tool file) - it should have code like:

```typescript
const token = process.env["STRIPE_SECRET_KEY"];
if (token) {
  init.headers["Authorization"] = `Bearer ${token}`;
}
```

If this code is missing, you'll need to manually add it to each tool function, or regenerate with proper auth configuration.

For Stripe, the API uses Basic Auth with the secret key. You may need to add:
```typescript
init.headers["Authorization"] = `Bearer ${process.env.STRIPE_SECRET_KEY}`;
```

## Step 4: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Step 5: Run the MCP Server

### Basic Run (stdio transport)

The server communicates via stdin/stdout using JSON-RPC 2.0:

```bash
node dist/index.js
```

The server will wait for JSON-RPC requests on stdin. You can test it manually:

```bash
# In one terminal, start the server
node dist/index.js

# In another terminal, send a test request (example)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

### With Environment Variable

```bash
STRIPE_SECRET_KEY="sk_test_..." node dist/index.js
```

## Step 6: Test with an MCP Client

### Using MCP Inspector (if available)

Some MCP clients can connect to stdio servers. The server implements the MCP protocol:

- `tools/list` - List all available tools
- `tools/call` - Execute a tool with parameters

### Manual JSON-RPC Test

The server uses `tools/execute` method. Test it:

```bash
# Call a specific tool (example: get_account for Stripe)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"get_account","arguments":{}}}' | STRIPE_SECRET_KEY="sk_test_..." node dist/index.js
```

The server will:
1. Read the JSON-RPC request from stdin
2. Execute the tool with the provided arguments
3. Return a JSON-RPC response on stdout

**Example Response:**
```json
{"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"..."}]}}
```

## Step 7: Verify Generated Tools

Check what tools were generated:

```bash
# Count tools
ls src/tools/ | wc -l

# List first few tools
ls src/tools/ | head -10

# View a sample tool
cat src/tools/getAccount.ts | head -30
```

## Step 8: Check the Schema

The `schema.json` file contains the MCP tool schema:

```bash
# View schema (first 50 lines)
head -50 schema.json

# Count tools in schema
cat schema.json | grep -o '"name"' | wc -l
```

## Troubleshooting

### Build Errors

If you get TypeScript errors:
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Authentication Errors

If you see authentication errors:
1. Verify your API key is set: `echo $STRIPE_SECRET_KEY`
2. Check the `.env.example` for the correct variable name
3. Make sure the key is valid and has the right permissions

### Module Not Found

If you get "Cannot find module" errors:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Server Not Responding

The server uses stdio, so it won't show output unless you send JSON-RPC requests. Test with:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

## Testing with Different Services

### Slack

```bash
cd scratch/slack-success
npm install
export SLACK_TOKEN="xoxb-your-token"
npm run build
node dist/index.js
```

### Custom Service

For any generated MCP server:
1. Check `.env.example` for the required environment variable name
2. Set the variable: `export SERVICE_TOKEN="your_token"`
3. Build and run: `npm install && npm run build && node dist/index.js`

## Next Steps

Once the server is running:
1. Integrate it with an MCP-compatible client (Claude Desktop, Cursor, etc.)
2. Test specific API endpoints by calling the generated tools
3. Customize the generated code if needed
4. Deploy the server for production use

## Example: Full Test Workflow

```bash
# 1. Navigate to project
cd scratch/stripe-success

# 2. Install dependencies
npm install

# 3. Set authentication
export STRIPE_SECRET_KEY="sk_test_your_key_here"

# 4. Build
npm run build

# 5. Test a tool call
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"get_account","arguments":{}}}' | node dist/index.js

# Expected: JSON-RPC response with the account data
```

**Quick Test Script:**

Save this as `test-server.sh`:
```bash
#!/bin/bash
cd scratch/stripe-success
export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_demo}"
npm install
npm run build
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"get_account","arguments":{}}}' | node dist/index.js
```

Run with: `chmod +x test-server.sh && ./test-server.sh`

## Integration with MCP Clients

To use with Claude Desktop or other MCP clients, configure the client to run:
```
node /path/to/generated-mcp/dist/index.js
```

And set the environment variable in the client's configuration.

