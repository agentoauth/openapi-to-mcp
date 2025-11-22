# MCP Hub

Web application for generating MCP servers from OpenAPI specs.

## Setup

1. Install backend dependencies:
   ```bash
   cd apps/mcp-hub
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd apps/mcp-hub/client
   npm install
   ```

## Running

You need to run both the backend and frontend:

1. **Start the backend** (in one terminal):
   ```bash
   cd apps/mcp-hub
   npm run dev
   ```
   Backend runs on http://localhost:4000

2. **Start the frontend** (in another terminal):
   ```bash
   cd apps/mcp-hub/client
   npm run dev
   ```
   Frontend runs on http://localhost:5173

3. Open http://localhost:5173 in your browser

## How it works

- Frontend (port 5173) proxies `/api/*` requests to backend (port 4000)
- Backend generates MCP projects and deploys them to Cloudflare Workers
- Returns the deployed MCP URL for use in ChatGPT/Inspector

## Troubleshooting

- **400 Bad Request**: Make sure both OpenAPI URL and Service Name are filled in
- **Network error**: Ensure the backend is running on port 4000
- **Proxy not working**: Restart the frontend dev server after changing vite.config.ts
