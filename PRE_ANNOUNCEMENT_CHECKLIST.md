# Pre-Announcement Checklist

Use this checklist before announcing the packages to developers.

## ✅ Automated Verification

### 1. Run Package Verification
```bash
npm run verify:published
```

This script will:
- ✅ Check that packages are published on npm
- ✅ Test `@agentoauth/mcp@latest` against all benchmark specs
- ✅ Verify both stdio and HTTP transports work
- ✅ Report any failures

**Expected output:** All benchmarks should pass.

### 2. Run Local Benchmarks (Optional)
```bash
npm run bench
```

Tests the local development version against benchmarks.

## 📋 Manual Verification

### 3. Test Published CLI
```bash
# Test stdio transport
npx @agentoauth/mcp@latest generate examples/petstore-openapi.json --out test-published --force
cd test-published
npm install && npm run build
echo '{"jsonrpc":"2.0","id":1,"method":"tools/execute","params":{"name":"findpetsbystatus","arguments":{"status":"available"}}}' | API_BASE_URL="https://petstore3.swagger.io/api/v3" node dist/index.js

# Test HTTP transport
npx @agentoauth/mcp@latest generate examples/petstore-openapi.json --out test-http --transport http --force
cd test-http
npm install && npm run build
npx wrangler dev &
sleep 5
curl http://localhost:8787/tools  # Should return tools list
curl http://localhost:8787/mcp -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### 4. Test Serve Command
```bash
# Test stdio serve
npx @agentoauth/mcp@latest generate examples/petstore-openapi.json --out test-serve --force
cd test-serve && npm install && npm run build
cd ..
npx @agentoauth/mcp@latest serve test-serve --no-build

# Test HTTP serve
npx @agentoauth/mcp@latest generate examples/petstore-openapi.json --out test-http-serve --transport http --force
cd test-http-serve && npm install && npm run build
cd ..
npx @agentoauth/mcp@latest serve test-http-serve --no-build --port 8787
```

## 📚 Documentation Review

### 5. Documentation Checklist
- [ ] README.md is up to date
- [ ] Installation instructions are correct
- [ ] Usage examples work
- [ ] All features are documented
- [ ] HTTP_SERVE_GUIDE.md is accurate
- [ ] STRIPE_EXAMPLE.md is accurate
- [ ] TESTING_GENERATED_MCP.md is helpful

### 6. Example Files
- [ ] `examples/petstore-openapi.json` works
- [ ] `examples/stripe-openapi.json` works (no secrets)
- [ ] `examples/slack-openapi.json` works (no secrets)

## 📦 Package Quality

### 7. Package Verification
- [ ] `@agentoauth/mcp` version is correct (currently 1.5.0)
- [ ] `openmcp-core` version is correct (currently 0.1.6)
- [ ] Dependencies are correct (`openmcp-core@^0.1.6`)
- [ ] No secrets in published packages
- [ ] Package.json metadata is correct (description, keywords, etc.)

### 8. npm Package Checks
```bash
# Check published versions
npm view @agentoauth/mcp version
npm view openmcp-core version

# Check package contents
npm pack @agentoauth/mcp --dry-run
npm pack openmcp-core --dry-run
```

## 🔒 Security

### 9. Security Checklist
- [ ] No API keys or tokens in code
- [ ] No secrets in git history
- [ ] Example files use placeholders
- [ ] .gitignore is correct
- [ ] No sensitive data in published packages

## 🧪 Feature Testing

### 10. Core Features
- [ ] Generate stdio MCP server works
- [ ] Generate HTTP MCP server works
- [ ] Auth configuration works (bearer, apiKey)
- [ ] Transport option parsing works
- [ ] Serve command works (stdio)
- [ ] Serve command works (HTTP)
- [ ] GET /tools endpoint works
- [ ] Auto-detection of transport works

### 11. Edge Cases
- [ ] Large OpenAPI specs (Stripe, Slack)
- [ ] Small OpenAPI specs (Petstore)
- [ ] OpenAPI 2.0 (Swagger) conversion
- [ ] OpenAPI 3.0 specs
- [ ] Specs with authentication
- [ ] Specs without authentication

## 🌐 GitHub & Release

### 12. GitHub Checklist
- [ ] Code is pushed to main branch
- [ ] No secrets in commit history
- [ ] README is accurate
- [ ] All documentation is committed
- [ ] Consider creating a GitHub release/tag

### 13. Release (Optional)
```bash
# Create a tag
git tag -a v1.5.0 -m "Release v1.5.0: GET /tools endpoint and HTTP serve improvements"
git push origin v1.5.0

# Or create a GitHub release via web UI
```

## 📢 Announcement Readiness

### 14. Before Announcing
- [ ] All automated tests pass
- [ ] Manual verification complete
- [ ] Documentation is ready
- [ ] Examples work
- [ ] No known critical bugs
- [ ] Package versions are correct

### 15. Announcement Content
Consider including:
- Quick start example
- Link to README
- Link to examples
- Key features
- Use cases
- Known limitations (if any)

## 🚀 Quick Verification Command

Run this single command to verify everything:
```bash
npm run verify:published && echo "✅ Ready to announce!"
```


