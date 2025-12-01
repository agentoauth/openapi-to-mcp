# Testing Slack MCP Server

Complete step-by-step guide for testing the generated Slack MCP server.

## Step 1: Navigate to the Generated Project

```bash
cd /Users/prithvi/projects/openapi-to-mcp/scratch/slack-final
```

**Note:** If you get "ENOENT: no such file or directory, uv_cwd" error, it means you're in a deleted directory. Navigate to a valid path first:
```bash
cd /Users/prithvi/projects/openapi-to-mcp
cd scratch/slack-final
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- TypeScript and build tools
- Type definitions for Node.js

## Step 3: Set Up Environment Variables

The Slack MCP server requires two environment variables:

1. **API Base URL** - Slack API base URL
2. **Slack Token** - Your Slack bot token

```bash
export API_BASE_URL="https://slack.com/api"
export SLACK_TOKEN="xoxb-your-slack-bot-token-here"
```

**Getting a Slack Token:**
1. Go to https://api.slack.com/apps
2. Create a new app or select an existing one
3. Go to "OAuth & Permissions"
4. Install the app to your workspace
5. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Step 4: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Step 5: Verify Authentication Code

Check that the authentication code was generated correctly:

```bash
grep -A 3 "SLACK_TOKEN" src/tools/admin_apps_approve.ts
```

You should see:
```typescript
const token = process.env["SLACK_TOKEN"];
if (token) {
  init.headers["Authorization"] = `Bearer ${token}`;
}
```

## Step 6: List Available Tools

```bash
# Count total tools
ls src/tools/ | wc -l

# List first 20 tools
ls src/tools/ | head -20

# After building, list tool names programmatically
node -e "const tools = require('./dist/tools/index.js'); console.log('Total tools:', Object.keys(tools.tools).length); console.log('\\nFirst 20 tools:'); Object.keys(tools.tools).slice(0, 20).forEach(name => console.log('  -', name));"
```

**Note:** Slack tool names use **snake_case** (e.g., `admin_apps_approve`, `channels_list`)

## Step 7: Test the MCP Server

### Basic Test (stdio transport)

The server communicates via stdin/stdout using JSON-RPC 2.0:

```bash
# With environment variables set
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"admin_apps_approve","arguments":{}}}' | node dist/index.js
```

### Example Tool Calls

**1. Test API connection (api_test) - No auth required:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"api_test","arguments":{}}}' | API_BASE_URL="https://slack.com/api" node dist/index.js
```
Expected response: `{"jsonrpc":"2.0","id":1,"result":{"ok":true,"args":{}}}`

**2. Test authentication (auth_test):**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"auth_test","arguments":{}}}' | SLACK_TOKEN="xoxb-..." API_BASE_URL="https://slack.com/api" node dist/index.js
```

**3. List conversations (conversations_list):**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"conversations_list","arguments":{}}}' | SLACK_TOKEN="xoxb-..." API_BASE_URL="https://slack.com/api" node dist/index.js
```

**4. List users (users_list):**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"users_list","arguments":{}}}' | SLACK_TOKEN="xoxb-..." API_BASE_URL="https://slack.com/api" node dist/index.js
```

**5. Post a message (chat_postMessage):**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"chat_postMessage","arguments":{"channel":"C123456","text":"Hello from MCP!"}}}' | SLACK_TOKEN="xoxb-..." API_BASE_URL="https://slack.com/api" node dist/index.js
```

**6. Approve an app (admin_apps_approve):**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"admin_apps_approve","arguments":{"app_id":"A123456"}}}' | SLACK_TOKEN="xoxb-..." API_BASE_URL="https://slack.com/api" node dist/index.js
```

## Step 8: Expected Response Format

**Success Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "channels": [...]
  }
}
```

**Error Response (e.g., invalid token):**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "HTTP get /api/channels.list failed: 401 Unauthorized - {\"ok\":false,\"error\":\"invalid_auth\"}"
  }
}
```

## Complete Test Script

Save this as `test-slack.sh`:

```bash
#!/bin/bash
cd /Users/prithvi/projects/openapi-to-mcp/scratch/slack-final

# Set environment variables
export API_BASE_URL="https://slack.com/api"
export SLACK_TOKEN="${SLACK_TOKEN:-xoxb-your-token-here}"

# Install and build
npm install
npm run build

# Test a simple tool call (api_test doesn't require auth)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"api_test","arguments":{}}}' | node dist/index.js
```

Run with:
```bash
chmod +x test-slack.sh
SLACK_TOKEN="xoxb-your-token" ./test-slack.sh
```

## Common Slack Tools

Here are some commonly used Slack API tools available in this spec:

**Simple Test Tools:**
- `api_test` - Test API connection (no auth required)
- `auth_test` - Test authentication token

**Admin Tools:**
- `admin_apps_approve` - Approve an app
- `admin_apps_approved_list` - List approved apps
- `admin_conversations_create` - Create a conversation
- `admin_conversations_search` - Search conversations

**Chat & Messaging:**
- `chat_postMessage` - Post a message
- `chat_delete` - Delete a message
- `chat_update` - Update a message
- `chat_scheduledmessages_list` - List scheduled messages

**Conversations & Users:**
- `conversations_list` - List conversations (channels, DMs, etc.)
- `conversations_info` - Get conversation information
- `users_list` - List all users
- `users_info` - Get user information

**Other Tools:**
- `bots_info` - Get bot information
- `apps_permissions_info` - Get app permissions
- `auth_revoke` - Revoke a token
- `emoji_list` - List custom emojis
- `files_list` - List files

**Note:** This Slack OpenAPI spec may not include all endpoints. The available tools depend on what's in the spec file. Use `api_test` to verify the server is working without authentication.

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

**Error: "invalid_auth"**
- Verify your token is correct: `echo $SLACK_TOKEN`
- Make sure the token starts with `xoxb-` (bot token)
- Check that the token has the required scopes/permissions

**Error: "missing_scope"**
- The token needs specific OAuth scopes for each API method
- Check the Slack API documentation for required scopes
- Reinstall the app with the correct scopes

### Tool Not Found

**Error: "Unknown tool: channels_list"**
- Check the tool name format: use **snake_case** (e.g., `channels_list`, not `channelsList`)
- List available tools: `ls src/tools/ | grep channels`
- After building: `node -e "const tools = require('./dist/tools/index.js'); console.log(Object.keys(tools.tools).filter(t => t.includes('channel')).join('\\n'));"`

### Server Not Responding

The server uses stdio, so it won't show output unless you send JSON-RPC requests. Test with:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"channels_list","arguments":{}}}' | node dist/index.js
```

### Module Not Found

If you get "Cannot find module" errors:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Integration with MCP Clients

To use with Claude Desktop or other MCP clients, configure the client to run:
```
node /Users/prithvi/projects/openapi-to-mcp/scratch/slack-final/dist/index.js
```

And set the environment variables in the client's configuration:
- `API_BASE_URL=https://slack.com/api`
- `SLACK_TOKEN=xoxb-your-token`

## Quick Reference

```bash
# Navigate
cd /Users/prithvi/projects/openapi-to-mcp/scratch/slack-final

# Install & Build
npm install && npm run build

# Set environment
export API_BASE_URL="https://slack.com/api"
export SLACK_TOKEN="xoxb-your-token"

# Test (api_test is a good starting point - doesn't require auth)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"api_test","arguments":{}}}' | node dist/index.js

# Or test with auth
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"auth_test","arguments":{}}}' | SLACK_TOKEN="xoxb-..." API_BASE_URL="https://slack.com/api" node dist/index.js
```

## Next Steps

Once the server is working:
1. Test different Slack API endpoints
2. Integrate with an MCP-compatible client (Claude Desktop, Cursor, etc.)
3. Customize the generated code if needed
4. Deploy the server for production use

