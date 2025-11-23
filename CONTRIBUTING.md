# Contributing to openapi-to-mcp

Thank you for your interest in contributing to `openapi-to-mcp`! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- **Clear title and description**: What went wrong?
- **Steps to reproduce**: How can we reproduce the issue?
- **Expected behavior**: What should have happened?
- **Actual behavior**: What actually happened?
- **Environment**: Node.js version, OS, etc.
- **OpenAPI spec**: If applicable, share the OpenAPI spec (or a minimal example) that caused the issue

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:

- **Use case**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: What other approaches did you consider?

### Pull Requests

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/openapi-to-mcp.git
   cd openapi-to-mcp
   ```
3. **Add upstream remote** (to sync with main repo):
   ```bash
   git remote add upstream https://github.com/originalowner/openapi-to-mcp.git
   ```
4. **Create a feature branch**: `git checkout -b feature/your-feature-name`
5. **Make your changes**
6. **Test your changes**: Ensure existing functionality still works
7. **Update documentation**: If you've added features, update relevant docs
8. **Commit your changes**: Use clear, descriptive commit messages
9. **Push to your fork**: `git push origin feature/your-feature-name`
10. **Open a pull request**: Provide a clear description of your changes

### Keeping Your Fork Up to Date

Before starting new work, sync your fork with the upstream repository:

```bash
# Fetch latest changes from upstream
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

### GitHub Workflow

1. **Create an issue** (optional but recommended for larger changes)
   - Describe the problem or feature
   - Get feedback before implementing

2. **Fork and clone** the repository

3. **Set up development environment**:
   ```bash
   npm install
   npm run build
   npm run type-check
   ```

4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

5. **Make changes and test**:
   ```bash
   # Make your code changes
   # Test with:
   npm run build
   npm run type-check
   npm run cli:generate:petstore
   npm run test:mcp
   ```

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Add support for PUT operations"
   ```

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Link to any related issues

9. **Respond to feedback**:
   - Make requested changes
   - Push updates to the same branch
   - The PR will automatically update

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Getting Started

```bash
# Clone your fork
git clone https://github.com/yourusername/openapi-to-mcp.git
cd openapi-to-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run type checking
npm run type-check
```

### Project Structure

```
openapi-to-mcp/
├── packages/
│   ├── cli/              # Command-line interface
│   │   └── src/
│   │       └── index.ts  # CLI entry point
│   ├── generator/        # Core code generation
│   │   └── src/
│   │       ├── openapiLoader.ts      # OpenAPI loading
│   │       ├── operationExtractor.ts # Operation extraction
│   │       ├── toolInferer.ts        # Tool inference
│   │       ├── schemaUtils.ts        # Schema conversion
│   │       ├── projectRenderer.ts    # stdio renderer
│   │       └── httpRenderer.ts       # HTTP renderer
│   └── templates/        # Handlebars templates
│       ├── *.hbs         # stdio templates
│       └── http/         # HTTP templates
├── apps/
│   └── mcp-hub/         # Web UI
│       ├── src/         # Backend
│       └── client/      # Frontend
└── examples/            # Example OpenAPI specs
```

### Running Tests

#### Type Checking

```bash
# Check for TypeScript errors
npm run type-check
```

#### Testing the Generator

```bash
# Generate a test MCP server
npm run cli:generate:petstore

# Build and test the generated server
cd scratch/petstore-mcp-cli
npm install
npm run build
```

#### Testing Generated MCP Servers

**With test script:**

```bash
# From project root
npm run test:mcp
```

**With MCP Inspector:**

```bash
cd scratch/petstore-mcp-cli
API_BASE_URL="https://petstore3.swagger.io/api/v3" \
  npx @modelcontextprotocol/inspector node dist/index.js
```

**Manual JSON-RPC:**

```bash
cd scratch/petstore-mcp-cli
echo '{"jsonrpc":"2.0","id":"1","method":"tools/list"}' | \
  API_BASE_URL="https://petstore3.swagger.io/api/v3" node dist/index.js
```

#### Testing MCP Hub

```bash
# Start backend
cd apps/mcp-hub
npm install
npm run dev

# In another terminal, start frontend
cd apps/mcp-hub/client
npm install
npm run dev

# Test API endpoints
curl http://localhost:4000/health
curl http://localhost:4000/api/mode
curl http://localhost:4000/api/capabilities
```

See the main [README](../README.md#building-and-testing) for comprehensive build and test instructions.

### Development Workflow

1. **Make changes** in the appropriate package
2. **Test locally** using the CLI or MCP Hub
3. **Type check**: `npm run type-check`
4. **Build**: `npm run build` (if needed)
5. **Test with examples**: Try generating MCP servers from example specs

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Add JSDoc comments for public functions

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings (unless escaping)
- Add trailing commas in multi-line objects/arrays
- Keep lines under 100 characters when possible

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add support for PUT operations
fix: Resolve $ref in nested schemas
docs: Update Quick Start guide
refactor: Simplify tool name normalization
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

## Adding Examples

To add a new example OpenAPI spec:

1. **Add the spec file** to `examples/`:
   ```bash
   # Download or create the spec
   cp my-api-spec.json examples/my-api-openapi.json
   ```

2. **Update `examples/README.md`** with:
   - Description of the API
   - How to generate the MCP server
   - Any special configuration needed

3. **Test the example**:
   ```bash
   npm run dev -- \
     --openapi examples/my-api-openapi.json \
     --out test-output \
     --service-name myapi
   ```

## Adding Features

### Supporting New HTTP Methods

To add support for PUT, PATCH, or DELETE:

1. **Update `operationExtractor.ts`**:
   - Add method to the `methods` array
   - Handle method-specific logic if needed

2. **Update templates**:
   - Ensure templates handle the new method
   - Add method-specific code generation if needed

3. **Test thoroughly**:
   - Test with real OpenAPI specs
   - Verify generated code works correctly

### Supporting New Authentication Types

To add OAuth 2.0 or other auth types:

1. **Update `models.ts`**:
   - Add new `AuthType` value
   - Extend `AuthConfig` interface if needed

2. **Update renderers**:
   - Add auth logic in `projectRenderer.ts` or `httpRenderer.ts`
   - Update templates to handle new auth type

3. **Update CLI**:
   - Add CLI option for new auth type
   - Update validation logic

## Documentation

When adding features or making changes:

- **Update README.md**: If it affects user-facing functionality
- **Update docs/QUICKSTART.md**: If it changes the getting started process
- **Update docs/ARCHITECTURE.md**: If it changes internal architecture
- **Add code comments**: For complex logic or non-obvious decisions

## Review Process

1. **Automated checks**: PRs must pass type checking
2. **Code review**: At least one maintainer will review
3. **Testing**: Reviewer may test your changes
4. **Feedback**: Address any requested changes

## Questions?

If you have questions about contributing:

- Open an issue with the `question` label
- Check existing issues and discussions
- Review the documentation in `docs/`

Thank you for contributing to `openapi-to-mcp`!

