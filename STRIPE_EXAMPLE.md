# Stripe MCP Server Example

This guide shows how to generate and test a Stripe MCP server using `@agentoauth/mcp`.

## Step 1: Generate Stripe MCP Server

```bash
# Generate MCP server from Stripe OpenAPI spec
npx @agentoauth/mcp generate examples/stripe-openapi.json \
  --out stripe-mcp \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY
```

This will:
- Auto-detect service name from the spec
- Configure bearer token authentication
- Generate all Stripe API endpoints as MCP tools
- Create a `.env.example` file with `STRIPE_SECRET_KEY`

## Step 2: Build the Generated Server

```bash
cd stripe-mcp
npm install
npm run build
```

## Step 3: Set Your Stripe API Key

```bash
# Option 1: Export as environment variable
export STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"

# Option 2: Create .env file (if using dotenv)
cp .env.example .env
# Edit .env and add your key: STRIPE_SECRET_KEY=sk_test_...
```

## Step 4: Run the MCP Server

The server runs on stdin/stdout using JSON-RPC 2.0:

```bash
# Run the server (it will wait for JSON-RPC messages on stdin)
node dist/index.js
```

## Step 5: Test with JSON-RPC Messages

**Note:** The stdio MCP server only supports `tools/execute`, not `tools/list`. To see available tools, check the `schema.json` file:

```bash
cat schema.json | jq '.tools[].name'
```

Or open `schema.json` to see all tools with their descriptions and parameters.

Open a **new terminal** and send JSON-RPC messages to the server. Here are example commands:

### Get Account Information

```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/execute","params":{"name":"get_account","arguments":{}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="sk_test_your_key" \
  node dist/index.js
```

### Create a Customer

```bash
echo '{"jsonrpc":"2.0","id":3,"method":"tools/execute","params":{"name":"create_customer","arguments":{"email":"customer@example.com","name":"Test Customer"}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="sk_test_your_key" \
  node dist/index.js
```

### List Customers

```bash
echo '{"jsonrpc":"2.0","id":4,"method":"tools/execute","params":{"name":"list_customers","arguments":{"limit":10}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="sk_test_your_key" \
  node dist/index.js
```

### Create a Payment Intent

```bash
echo '{"jsonrpc":"2.0","id":5,"method":"tools/execute","params":{"name":"create_payment_intent","arguments":{"amount":2000,"currency":"usd"}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="sk_test_your_key" \
  node dist/index.js
```

### Get a Customer by ID

```bash
echo '{"jsonrpc":"2.0","id":6,"method":"tools/execute","params":{"name":"get_customer","arguments":{"customer":"cus_1234567890"}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="sk_test_your_key" \
  node dist/index.js
```

## Interactive Testing

For interactive testing, you can use a simple script:

```bash
# Create test script
cat > test-stripe.sh << 'EOF'
#!/bin/bash
STRIPE_KEY="${STRIPE_SECRET_KEY:-sk_test_your_key_here}"

# Test 1: List tools
echo "=== Test 1: List Tools ==="
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | STRIPE_SECRET_KEY="$STRIPE_KEY" node dist/index.js
echo ""

# Test 2: Get account
echo "=== Test 2: Get Account ==="
echo '{"jsonrpc":"2.0","id":2,"method":"tools/execute","params":{"name":"get_account","arguments":{}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="$STRIPE_KEY" \
  node dist/index.js
echo ""

# Test 3: Create customer
echo "=== Test 3: Create Customer ==="
echo '{"jsonrpc":"2.0","id":3,"method":"tools/execute","params":{"name":"create_customer","arguments":{"email":"test@example.com","name":"Test User"}}}' | \
  API_BASE_URL="https://api.stripe.com" \
  STRIPE_SECRET_KEY="$STRIPE_KEY" \
  node dist/index.js
echo ""
EOF

chmod +x test-stripe.sh
./test-stripe.sh
```

## Using with MCP Clients

### Claude Desktop (Anthropic)

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "stripe": {
      "command": "node",
      "args": ["/path/to/stripe-mcp/dist/index.js"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_your_key_here"
      }
    }
  }
}
```

### Cursor IDE

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "node",
      "args": ["/path/to/stripe-mcp/dist/index.js"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_your_key_here"
      }
    }
  }
}
```

## Common Stripe Tools Generated

The generated MCP server will include tools for common Stripe operations:

- `get_account` - Get account information
- `create_customer` - Create a new customer
- `get_customer` - Retrieve a customer by ID
- `list_customers` - List all customers
- `update_customer` - Update customer details
- `create_payment_intent` - Create a payment intent
- `get_payment_intent` - Retrieve a payment intent
- `list_payment_intents` - List payment intents
- `create_charge` - Create a charge
- `create_subscription` - Create a subscription
- And many more based on the Stripe OpenAPI spec

## Troubleshooting

### Error: "401 Unauthorized"
- Make sure `STRIPE_SECRET_KEY` is set correctly
- Verify your Stripe API key is valid
- Check that you're using a test key (`sk_test_...`) for testing

### Error: "Unknown tool"
- List available tools first: `{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}`
- Tool names are converted to camelCase (e.g., `get_account`, `create_customer`)

### Error: "Invalid arguments"
- Check the tool schema by listing tools
- Ensure required parameters are provided
- Verify parameter types match (strings, numbers, etc.)

## Sample Complete Test Session

```bash
# 1. Generate the server
npx @agentoauth/mcp generate examples/stripe-openapi.json \
  --out stripe-mcp \
  --auth-type bearer \
  --auth-env STRIPE_SECRET_KEY

# 2. Build it
cd stripe-mcp
npm install
npm run build

# 3. Set your API key
export STRIPE_SECRET_KEY="sk_test_51..."

# 4. Test it
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" node dist/index.js

# 5. Execute a tool
echo '{"jsonrpc":"2.0","id":2,"method":"tools/execute","params":{"name":"get_account","arguments":{}}}' | STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" node dist/index.js
```

