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

- [x] Set up MCP server within Tournado project structure
- [x] Implement basic `run-vitest` tool
- [x] Handle vitest command execution and output parsing (raw)
- [x] Return formatted test results with errors
- [x] Test with Tournado's existing test suite
- [x] Configure Cursor to use local MCP server

### Phase 2: Enhanced Error Reporting

- [x] Parse vitest JSON output for structured data
- [x] Extract stack traces and file locations
- [x] Format errors for AI agent consumption
- [x] Implement JSON reporter parsing (hardcoded to JSON)
- [x] Test with Tournado's component tests
- [x] Limit stack trace length for readability (1500 characters)
- [x] Handle test failures with actionable error messages

### Phase 3: Advanced Features

- [x] Integration with Tournado's testing workflow
- [x] Test-driven development cycle (run tests → fix code → repeat)
- [x] Comprehensive test result analysis
- [ ] Coverage report generation
- [ ] Add support for different vitest reporters
- [ ] Watch mode integration
- [ ] Test file discovery and analysis
- [ ] Performance metrics and timing data

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

- [x] Can execute Tournado's vitest tests via MCP tools
- [x] Returns formatted test results with errors
- [x] Works with existing Tournado test structure
- [x] Integrates with Cursor for AI development
- [x] Supports iterative test-driven development workflow
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

## Lessons Learned & Key Insights

### Critical Requirements for MCP Vitest Integration

- **Working Directory Context**: MCP server `process.cwd()` must be set to project root (`/Users/madrus/dev/biz/toernooien/tournado`) for vitest to find project files and configuration
- **Environment Variables**: Use `CI=true` to prevent interactive prompts that can cause hanging
- **Explicit Path Resolution**: Use full paths (`/opt/homebrew/bin/npx`) rather than relying on PATH resolution
- **JSON Output Parsing**: Vitest JSON reporter output requires careful parsing - look for lines containing `"testResults"`
- **Timeout Management**: 30-second timeout with proper process cleanup using `SIGKILL`

### Successful Test-Driven Development Workflow

1. **Run MCP vitest tool** → Identify failing tests with detailed error messages
2. **Fix component/test issues** → Add missing `data-testid` attributes, fix test selectors
3. **Re-run tests** → Verify fixes and identify remaining issues
4. **Repeat until all green** → Achieved 98/98 tests passing across 54 test suites

### Technical Achievements

- ✅ **Full test suite integration** (54 test suites, 98 tests)
- ✅ **Structured error reporting** with stack traces limited to 1500 characters
- ✅ **Component test fixes** (AppBar, AuthErrorBoundary, NavigationItem)
- ✅ **Icon system integration** with test attribute support
- ✅ **ESLint integration** with proper dist folder exclusion
- ✅ **Production-ready MCP server** for AI-assisted development

### Future Enhancement: Multi-Reporter Support

Currently, the MCP tool hardcodes the JSON reporter. To add true multi-reporter support, we would need:

```typescript
// Enhanced tool definition with reporter parameter
server.tool(
   'run-vitest',
   {
      reporter: {
         type: 'string',
         enum: ['json', 'basic', 'verbose', 'dot', 'junit'],
         description: 'Vitest reporter to use',
         default: 'json',
      },
      // ... other parameters
   },
   async ({ reporter = 'json' }) => {
      const args = ['vitest', 'run', `--reporter=${reporter}`]

      // Different parsing logic based on reporter
      switch (reporter) {
         case 'json':
            return parseJsonOutput(stdout)
         case 'basic':
            return parseBasicOutput(stdout)
         case 'verbose':
            return parseVerboseOutput(stdout)
         // ... etc
      }
   }
)
```

This would require implementing different parsers for each reporter format, which adds complexity but would provide flexibility for different use cases.

## Notes and Considerations

- **Local Development**: ✅ Completed with hardcoded paths to Tournado - ready for extraction
- **Security**: ✅ Input validation implemented for local development
- **Performance**: ✅ Tested with Tournado's full test suite (completes in 2-3 seconds)
- **Configuration**: ✅ Uses Tournado's existing vitest.config.ts successfully
- **Extraction Planning**: ✅ Code is modular and ready for extraction to standalone package
- **Version Control**: ✅ MCP server included in Tournado repo and working perfectly

### Important Operational Notes

⚠️ **Project Root Requirement**: Always run MCP server from `/Users/madrus/dev/biz/toernooien/tournado` to ensure correct vitest execution context

💡 **Build Process**: Run `npm run build` in `mcp-servers/vitest/` after TypeScript changes

🔧 **ESLint Configuration**: Dist folders automatically excluded via `'mcp-servers/**/dist/**'` in `eslint.config.mjs`

---

_This document serves as the master plan for building a Vitest MCP server starting locally within Tournado, then extracting to a reusable package that enables AI agents to run tests, analyze and report failures, and iteratively improve code quality through test-driven development workflows._
