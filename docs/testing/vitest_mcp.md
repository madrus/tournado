# Vitest MCP Server Development Plan

## Project Overview

**Goal**: Create a Model Context Protocol (MCP) server that can run vitest tests and provide detailed feedback to AI agents, enabling iterative test-driven development workflows.

**Current Project**: React Router v7 application (Tournado) developed with TypeScript, Prisma, and Vite
**Development Strategy**: Start as local MCP server within Tournado, then extract to reusable package later

## Conversation Summary

### Initial Research Findings

- No existing MCP servers specifically for running vitest tests
- Existing testing-related MCP servers:
   - `mcp-hello-world` - Mock server for testing MCP clients
   - `MCP Inspector` - Visual testing tool for debugging MCP servers
   - Example E2E testing patterns with TypeScript and Vitest

### Key Capabilities Confirmed

✅ **Rich Error Reporting**: MCP can return detailed test failures, stack traces, and file paths
✅ **Iterative Feedback**: Agent can fix code and re-run tests in a loop
✅ **Integration**: Works with filesystem MCP for code editing
✅ **Test-Driven Development**: Enables AI-powered TDD workflows

## Technical Architecture Plan

### Core MCP Server Features

1. **Test Execution Tools**

   - `run-vitest` - Execute vitest with various options
   - `run-vitest-watch` - Start vitest in watch mode
   - `run-vitest-coverage` - Generate coverage reports
   - `run-specific-test` - Run individual test files or test cases

2. **Test Analysis Tools**

   - `parse-test-results` - Parse and format vitest JSON output
   - `get-test-coverage` - Retrieve coverage information
   - `list-test-files` - Discover test files in project
   - `report-test-failures` - Extract actionable error information

3. **Configuration Management**
   - Support for project-specific vitest.config files
   - Environment variable handling
   - Custom reporter options

### Implementation Approach

```typescript
// Core server structure (local to Tournado)
const server = new McpServer({
   name: 'tournado-vitest-runner',
   version: '1.0.0',
})

// Key tools to implement:
// 1. run-vitest - Main test execution
// 2. run-vitest-watch - Continuous testing
// 3. get-test-coverage - Coverage analysis
// 4. list-failing-tests - Quick failure overview
```

## Development Phases

### Phase 1: Local MCP Server (Tournado-specific)

- [ ] Set up MCP server within Tournado project structure
- [ ] Implement basic `run-vitest` tool
- [ ] Handle vitest command execution and output parsing
- [ ] Return formatted test results with errors
- [ ] Test with Tournado's existing test suite
- [ ] Configure Cursor to use local MCP server

### Phase 2: Enhanced Error Reporting

- [ ] Parse vitest JSON output for structured data
- [ ] Extract stack traces and file locations
- [ ] Format errors for AI agent consumption
- [ ] Add support for different vitest reporters
- [ ] Test with Tournado's component tests

### Phase 3: Advanced Features

- [ ] Watch mode integration
- [ ] Coverage report generation
- [ ] Test file discovery and analysis
- [ ] Performance metrics and timing data
- [ ] Integration with Tournado's testing workflow

### Phase 4: Extract to Standalone Project

- [ ] Extract MCP server to separate project
- [ ] Make server configurable for any project
- [ ] Add npm package publishing
- [ ] Create generic Cursor MCP configuration examples
- [ ] Write comprehensive documentation for reuse
- [ ] Update Tournado to use published package

## Implementation Details

### File Structure (Local to Tournado)

```
tournado/                     # Your existing project
├── mcp-servers/             # New MCP servers directory
│   └── vitest/
│       ├── index.ts         # Main server entry point
│       ├── package.json     # Local MCP dependencies
│       ├── tools/           # Individual MCP tools
│       │   ├── run-vitest.ts
│       │   ├── watch-tests.ts
│       │   └── coverage.ts
│       ├── utils/           # Utilities
│       │   ├── vitest-parser.ts
│       │   └── error-formatter.ts
│       └── types/           # TypeScript definitions
├── app/                     # Your existing app code
├── tests/                   # Your existing tests
├── package.json             # Main project dependencies
└── vitest.config.ts         # Your existing vitest config
```

### Key Dependencies (Local MCP package.json)

```json
{
   "name": "@tournado/vitest-mcp",
   "version": "1.0.0",
   "private": true,
   "dependencies": {
      "@modelcontextprotocol/sdk": "^1.0.0",
      "zod": "^3.22.0"
   },
   "devDependencies": {
      "typescript": "^5.0.0",
      "@types/node": "^20.0.0"
   }
}
```

## Cursor MCP Configuration

### For Local Development (Tournado)

```json
{
   "mcpServers": {
      "vitest-runner": {
         "command": "node",
         "args": ["./mcp-servers/vitest/index.js"],
         "cwd": "${workspaceFolder}"
      }
   }
}
```

### After Extraction (Future)

```json
{
   "mcpServers": {
      "vitest-runner": {
         "command": "npx",
         "args": ["vitest-mcp-server", "--project-root", "${workspaceFolder}"]
      }
   }
}
```

## Future Development Prompts

### Starting Local Development

```
I want to start building the vitest MCP server locally within my Tournado project. Please help me:
1. Set up the mcp-servers/vitest directory structure
2. Create the local package.json with MCP dependencies
3. Implement the basic run-vitest tool for Tournado's test suite
4. Configure it to work with the existing vitest.config.ts
5. Set up Cursor configuration to use the local MCP server

Project root: /Users/madrus/dev/biz/toernooien/tournado
```

### Testing with Tournado

```
Help me test the vitest MCP server with Tournado's existing tests:
1. Run the MCP server and verify it connects
2. Execute vitest tests through MCP tools
3. Test error reporting with failing tests
4. Verify it works with Tournado's app/components tests
5. Debug any issues with the local setup
```

### Adding Advanced Features

```
Help me enhance the local vitest MCP server with:
1. Watch mode integration for Tournado development
2. Coverage report generation for the app/ directory
3. Better error formatting that points to specific Tournado files
4. Support for running specific test patterns (components, routes, etc.)
```

### Extracting to Standalone Project

```
The local vitest MCP server is working well with Tournado. Help me extract it to a standalone project:
1. Create new vitest-mcp-server project structure
2. Make it configurable for any project (not just Tournado)
3. Add command-line arguments for project configuration
4. Prepare for npm publishing
5. Update Tournado to use the published package
```

## Testing Strategy

### Local Testing with Tournado

1. Test with existing Tournado test files
2. Verify works with current vitest.config.ts
3. Test error reporting with component tests
4. Validate integration with Cursor
5. Test watch mode with development workflow

### Extraction Validation

1. Test extracted version with Tournado
2. Test with a different vitest project
3. Verify npm package installation
4. Test generic Cursor configuration

## Success Criteria

### Local MVP (Phase 1-3)

- [ ] Can execute Tournado's vitest tests via MCP tools
- [ ] Returns formatted test results with errors
- [ ] Works with existing Tournado test structure
- [ ] Integrates with Cursor for AI development
- [ ] Supports watch mode for development workflow

### Extracted Package (Phase 4)

- [ ] Works with any vitest project
- [ ] Available as npm package
- [ ] Configurable via command-line arguments
- [ ] Well documented for reuse
- [ ] Tournado successfully uses published version

## Local Development Setup

### Initial Setup Steps

1. Create `mcp-servers/vitest/` directory in Tournado
2. Set up local package.json with MCP dependencies
3. Create basic TypeScript configuration
4. Implement core MCP server structure
5. Add to Tournado's .gitignore if needed (or include in repo)

### Integration with Tournado

- Leverage existing vitest.config.ts
- Work with current test file structure
- Integrate with existing npm scripts
- Use Tournado's TypeScript configuration as reference

## Notes and Considerations

- **Local Development**: Start simple with hardcoded paths to Tournado
- **Security**: Validate inputs even in local development
- **Performance**: Test with Tournado's actual test suite size
- **Configuration**: Use Tournado's existing vitest config as the foundation
- **Extraction Planning**: Keep code modular for easy extraction later
- **Version Control**: Decide whether to include MCP server in Tournado repo or keep separate

---

_This document serves as the master plan for building a Vitest MCP server starting locally within Tournado, then extracting to a reusable package that enables AI agents to run tests, analyze and report failures, and iteratively improve code quality through test-driven development workflows._
