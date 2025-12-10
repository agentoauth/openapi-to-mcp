# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-01-XX

### Added
- **MCP 2025 Phase 1 Compliance**: Full support for MCP 2025 specification
  - JSON Schema 2020-12 with default value propagation
  - MCP-compliant tool naming (1-128 chars, valid characters only)
  - Tool-level error handling (distinguishes tool errors from protocol errors)
  - OAuth2 scope extraction from OpenAPI security requirements
  - Hub scope checking with URL-based consent elicitation
  - MCP 2025 message types (tasks, sampling, URL elicitation)
- **MCP Hub Advanced Features**:
  - Task Registry for managing long-running operations
  - Sampling Bridge for tools to request LLM assistance
  - URL elicitation for OAuth2 consent flows
  - Client metadata endpoint (SIMD-compliant)
  - Origin validation and structured logging
- **Enhanced Error Handling**: Validation errors now return tool errors instead of protocol errors
- **Scope Management**: Tools can declare required OAuth2 scopes, Hub checks and enforces them

### Changed
- Generated tool input schemas now use JSON Schema 2020-12 dialect
- Tool names are normalized to be MCP-compliant (handles path-like inputs better)
- Error responses distinguish between tool execution errors and protocol errors
- Hub now returns URL elicitation results for missing scopes instead of simple errors

### Fixed
- Default values from OpenAPI parameters are now correctly propagated to JSON schemas
- Tool name validation ensures all generated names comply with MCP spec

## [1.1.0] - 2025-01-XX

### Added
- **Transform UI Improvements**: Enhanced transform tools interface with tag/path grouping, search, filters, and config import/export
  - Collapsible accordion sections grouped by OpenAPI tags
  - Real-time search and filtering of operations
  - Toggle filters for hiding disabled tools and internal/admin paths
  - Tool count display (selected · hidden)
  - Import/export transform configurations (YAML/JSON)
- **Capabilities-based Deployment**: Centralized configuration for Cloudflare deployment
  - Deployment only enabled when all required credentials are present
  - Clear separation between Generate (local) and Deploy (cloud) flows
- **Improved Input Handling**: Fixed tool parameter input issues
  - Fixed decimal number input (can now type "3.14" without losing the dot)
  - Boolean inputs now use dropdown select instead of text input
  - Proper type conversion on tool execution with validation
  - Better error messages for invalid inputs

### Changed
- Updated UI labels to clearly distinguish "Generate MCP (Local)" vs "Deploy to Cloudflare (Optional)"
- Transform UI now shows operations grouped by tags with collapsible sections
- Boolean tool parameters now use select dropdown for better UX

### Fixed
- Fixed decimal point input issue when typing latitude/longitude coordinates
- Fixed boolean input handling that prevented typing "true"/"false"
- Removed unnecessary debug console statements
- Improved error handling and validation for tool parameter inputs

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- CLI tool for generating MCP servers from OpenAPI specs
- Support for stdio and HTTP transports
- MCP Hub web interface
- Cloudflare Workers deployment support
- OpenAPI 2.0 and 3.0 support
- Authentication support (API key, bearer token, none)


