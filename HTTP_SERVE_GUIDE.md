# Serving MCP Server Over HTTP

The `mcp serve` command currently only supports stdio transport. To serve over HTTP, you need to:

1. **Generate the server with HTTP transport** (creates a Cloudflare Worker)
2. **Deploy it using Wrangler** (Cloudflare's CLI)

## Step 1: Generate HTTP-Based MCP Server

Generate with `--transport http`:

```bash
npx @agentoauth/mcp generate examples/stripe-openapi.json \
  --out stripe-mcp-http \
  --transport http \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY \
  --api-base-url https://api.stripe.com
```

This generates a **Cloudflare Worker** instead of a stdio server.

## Step 2: Deploy to Cloudflare Workers

The generated HTTP server is a Cloudflare Worker. Deploy it:

```bash
cd stripe-mcp-http

# Install dependencies
npm install

# Login to Cloudflare (first time only)
npx wrangler login

# Deploy the worker
npx wrangler deploy
```

After deployment, you'll get a URL like: `https://stripe-mcp-http.your-subdomain.workers.dev`

## Step 3: Use the HTTP Endpoint

The HTTP MCP server exposes:

- **POST `/mcp`** - JSON-RPC endpoint for MCP requests
- **GET `/mcp`** - Server info endpoint

### Test with curl

```bash
# Get server info
curl https://stripe-mcp-http.your-subdomain.workers.dev/mcp

# List tools
curl -X POST https://stripe-mcp-http.your-subdomain.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Execute a tool
curl -X POST https://stripe-mcp-http.your-subdomain.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/execute",
    "params":{
      "name":"get_account",
      "arguments":{}
    }
  }'
```

## Environment Variables

Set environment variables in Cloudflare Workers dashboard or via wrangler:

```bash
# Set secrets in Cloudflare Workers
npx wrangler secret put STRIPE_SECRET_KEY
# Enter your key when prompted

# Or set in wrangler.toml (for non-secret vars)
# Edit wrangler.toml and add:
# [vars]
# API_BASE_URL = "https://api.stripe.com"
```

## Local Development (Local HTTP Server)

**Yes, you can serve HTTP MCP servers locally!** Use `wrangler dev`:

```bash
cd stripe-mcp-http

# Install dependencies
npm install

# Run locally with wrangler dev
npx wrangler dev

# This starts a local server (usually on http://localhost:8787)
# Test it:
curl http://localhost:8787/mcp
```

### Set Environment Variables for Local Development

```bash
# Set secrets for local dev
npx wrangler dev --secret STRIPE_SECRET_KEY="sk_test_your_key"

# Or create a .dev.vars file (not committed to git)
echo 'STRIPE_SECRET_KEY=sk_test_your_key' > .dev.vars
echo 'API_BASE_URL=https://api.stripe.com' >> .dev.vars

# Then run
npx wrangler dev
```

### Using `mcp serve` for HTTP (Future Enhancement)

Currently, `mcp serve` only works for stdio transport. For HTTP transport, you need to use `wrangler dev` manually. 

**Workaround:** You could add a script to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  }
}
```

Then run: `npm run dev`

## Differences: HTTP vs Stdio

| Feature | Stdio (`--transport stdio`) | HTTP (`--transport http`) |
|---------|----------------------------|---------------------------|
| **Runtime** | Node.js | Cloudflare Workers |
| **Deployment** | Run `node dist/index.js` | Deploy with `wrangler deploy` |
| **Protocol** | JSON-RPC over stdin/stdout | JSON-RPC over HTTP POST |
| **Methods** | Only `tools/execute` | `tools/list`, `tools/execute`, `initialize` |
| **Use Case** | Local development, MCP clients | Web apps, remote access |

## Complete Example

```bash
# 1. Generate HTTP server
npx @agentoauth/mcp generate examples/stripe-openapi.json \
  --out stripe-mcp-http \
  --transport http \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY \
  --api-base-url https://api.stripe.com

# 2. Deploy
cd stripe-mcp-http
npm install
npx wrangler login
npx wrangler secret put STRIPE_SECRET_KEY  # Enter your key
npx wrangler deploy

# 3. Use the deployed URL
# Your server will be at: https://stripe-mcp-http.your-subdomain.workers.dev/mcp
```

## Note on `mcp serve` Command

The `mcp serve` command currently only works with stdio transport. For HTTP transport:

- **Stdio**: Use `mcp serve <dir>` (runs `node dist/index.js`)
- **HTTP**: Use `wrangler dev` for local testing or `wrangler deploy` for production

Future versions may add `mcp serve --transport http` support.

