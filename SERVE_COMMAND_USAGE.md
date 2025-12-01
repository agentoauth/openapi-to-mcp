# Using `mcp serve` Command

The `mcp serve` command builds and runs a generated MCP server. It's useful for quickly testing a generated server without manually running `npm install`, `npm run build`, and `node dist/index.js`.

## Basic Usage

```bash
# Serve a generated MCP server (builds first by default)
npx @agentoauth/mcp serve <directory>
```

## Examples

### Example 1: Serve with Auto-Build (Default)

```bash
# Generate a server first
npx @agentoauth/mcp generate examples/petstore-openapi.json --out my-server

# Serve it (will run npm install and npm run build automatically)
npx @agentoauth/mcp serve my-server
```

### Example 2: Serve Without Building

If you've already built the server, skip the build step:

```bash
npx @agentoauth/mcp serve my-server --no-build
```

### Example 3: Serve Stripe MCP Server

```bash
# 1. Generate the Stripe server
npx @agentoauth/mcp generate examples/stripe-openapi.json \
  --out stripe-mcp \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY

# 2. Serve it (builds and runs)
STRIPE_SECRET_KEY="sk_test_your_key" npx @agentoauth/mcp serve stripe-mcp
```

## What `mcp serve` Does

1. **Checks if directory exists** - Verifies the MCP server directory exists
2. **Installs dependencies** - Runs `npm install` in the directory
3. **Builds the server** - Runs `npm run build` (unless `--no-build` is used)
4. **Runs the server** - Executes `node dist/index.js` with stdio passthrough

## Options

- `--build` (default: true) - Build the server before serving
- `--no-build` - Skip the build step (use if already built)

## Complete Workflow Example

```bash
# Step 1: Generate the MCP server
npx @agentoauth/mcp generate examples/stripe-openapi.json \
  --out stripe-mcp \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY

# Step 2: Serve it (one command does everything)
cd /path/to/project
STRIPE_SECRET_KEY="sk_test_51..." npx @agentoauth/mcp serve stripe-mcp
```

The server will start and wait for JSON-RPC messages on stdin. In another terminal, you can send test messages:

```bash
# In another terminal, test the server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  STRIPE_SECRET_KEY="sk_test_51..." node stripe-mcp/dist/index.js
```

## Using with Environment Variables

The `serve` command passes through environment variables, so you can set them before running:

```bash
# Set environment variables
export STRIPE_SECRET_KEY="sk_test_your_key_here"
export API_BASE_URL="https://api.stripe.com"

# Serve with those variables
npx @agentoauth/mcp serve stripe-mcp
```

## Stopping the Server

The server runs in the foreground. To stop it:
- Press `Ctrl+C` in the terminal where it's running

## Troubleshooting

### Error: "Directory not found"
- Make sure you're in the correct directory
- Use an absolute path if needed: `npx @agentoauth/mcp serve /full/path/to/stripe-mcp`

### Error: "npm install failed"
- Check that the directory contains a valid `package.json`
- Ensure you have npm installed and configured

### Error: "Build failed"
- Check the build output for TypeScript errors
- Make sure all dependencies are installed
- Try building manually: `cd stripe-mcp && npm install && npm run build`

### Server doesn't respond
- The server listens on stdin/stdout
- Make sure you're sending JSON-RPC messages to stdin
- Check that environment variables are set correctly

## Alternative: Manual Serve

If you prefer to do it manually:

```bash
cd stripe-mcp
npm install
npm run build
STRIPE_SECRET_KEY="sk_test_your_key" node dist/index.js
```

The `mcp serve` command just automates these steps for convenience.

