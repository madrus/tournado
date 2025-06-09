# Tournado

A modern tournament management system built with React Router v7, featuring advanced AI-assisted testing workflows with comprehensive MCP integration.

## 🚀 Featured: Production-Ready Vitest MCP Server

This project features a **production-ready MCP server** for AI-assisted testing, published to NPM:

- **Package**: `@madrus/vitest-mcp-server@1.0.5`
- **Status**: ✅ All tools working reliably (167 tests across 72 test suites)
- **Features**: Test execution + comprehensive coverage analysis
- **Integration**: Seamless Cursor & Claude Desktop support

### Quick MCP Setup

Add to your Cursor MCP config (`~/.cursor/mcp.json`):

```json
{
   "mcpServers": {
      "vitest-runner": {
         "command": "npx",
         "args": ["-y", "@madrus/vitest-mcp-server@latest"],
         "env": {
            "VITEST_PROJECT_DIR": "/path/to/this/project"
         }
      }
   }
}
```

[📚 Full MCP Documentation →](docs/testing/vitest_mcp.md)

## Quick Start

To get started with the project:

```sh
pnpm setup
pnpm dev
```

## Documentation

The project documentation is available in the `docs` directory. To view it:

Start the documentation server:

```sh
pnpm run docs
```

The browser will open `http://localhost:3030`

For more detailed information about the project, refer to the documentation.
