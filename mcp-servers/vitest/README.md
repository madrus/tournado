# Tournado Vitest MCP Server

A local Model Context Protocol (MCP) server for running and reporting vitest tests in the Tournado project. This server is designed for iterative, AI-assisted test-driven development and will later be extracted into a reusable package.

---

## Progress & Development Notes

### Step 1: Initial Setup

- Created `mcp-servers/vitest/` directory structure inside the Tournado project.
- Added `package.json` and `tsconfig.json` for local MCP server dependencies and TypeScript support.

### Step 2: Dependency Installation

- Installed dependencies locally using `npm install`.

### Step 3: Minimal MCP Server

- Implemented a minimal MCP server in `index.ts` using `@modelcontextprotocol/sdk`.
- Added a `ping` tool for health checking.
- Confirmed correct import paths for the SDK (must use subpaths like `@modelcontextprotocol/sdk/server/mcp.js`).

### Step 4: MCP Inspector Testing

- Ran the Inspector with `node ./mcp-servers/vitest/dist/index.js` as the command, which worked.
- Successfully called the `ping` tool and received a `pong` response (plain text, as expected for a minimal tool).

### Step 5: run-vitest Tool Milestone

- Implemented and registered the `run-vitest` tool in the MCP server.
- Ran the Inspector from the project root with the correct path, and both `ping` and `run-vitest` tools appeared.
- Successfully executed the `run-vitest` tool via Inspector; all tests passed and exit code was 0.
- This confirms end-to-end functionality for running vitest tests through MCP.

### Step 6: Cursor Integration

- Added the MCP server to Cursor's `mcpServers` configuration using the correct command, args, and cwd.
- Restarted Cursor and confirmed that both `ping` and `run-vitest` tools are now visible and usable from within Cursor.
- **Example Cursor MCP configuration:**
   ```json
   {
      "mcpServers": {
         "vitest-runner": {
            "command": "node",
            "args": ["./mcp-servers/vitest/dist/index.js"],
            "cwd": "${workspaceFolder}"
         }
      }
   }
   ```

### Step 7: Enhanced Error Reporting and JSON Parsing

- Implemented comprehensive JSON output parsing to extract structured test results.
- Added stack trace extraction and formatting with reasonable length limits (1500 characters).
- Enhanced error reporting to show test failures, file locations, and actionable error messages.
- Successfully tested with Tournado's full test suite (54 test suites, 98 tests).

### Step 8: Test Fixes and Code Quality

- Fixed all failing unit tests identified by the MCP server:
   - **AppBar Component**: Fixed test selector from `menu-item-` to regex pattern `/^menu-item-\d+$/`
   - **AuthErrorBoundary**: Added missing `data-testid="error-paragraph"` attributes
   - **NavigationItem**: Added `data-testid="nav-icon"` support to icon components and utils
- All tests now pass (98/98 tests passing across 54 test suites).
- Fixed linting issues by adding ESLint ignore rules for compiled dist folders.

### Step 9: Production Ready

- **Status**: ✅ Fully functional MCP server ready for AI-assisted development
- **Capabilities**: Complete test execution, error reporting, and iterative debugging
- **Integration**: Seamless Cursor integration for test-driven development workflows

---

**Current Status:**

- ✅ All tests passing (98/98)
- ✅ Clean linting (no errors or warnings)
- ✅ Full JSON output parsing with structured error reporting
- ✅ Ready for production AI-assisted development

---

## Troubleshooting

### [T1] Dependency Installation Issues (Step 2)

- **Issue:** First tried `pnpm install` in `mcp-servers/vitest/`, but it did not create a `node_modules` folder or a lock file. This may be due to workspace configuration or pnpm's handling of subfolders.
- **Solution:** Switched to `npm install`, which worked as expected and installed all dependencies locally.

### [T2] MCP Inspector Execution Issues (Step 4)

- **Issue 1:** Tried running the Inspector with `./mcp-servers/vitest/dist/index.js` directly, but got an EACCES (permissions) error.
- **Solution:** Ran `chmod +x ./mcp-servers/vitest/dist/index.js` to add execute permissions.
- **Issue 2:** After fixing permissions, got an ENOEXEC error (no interpreter specified).
- **Solution:** Ran the Inspector with `node ./mcp-servers/vitest/dist/index.js` as the command, which worked.
- **Issue 3:** Running Inspector or server from the wrong directory caused doubled paths and module not found errors. Always run Inspector from the project root with the correct relative path.

### [T3] Vitest Execution Context Issues (Step 7)

- **Issue:** MCP server's `process.cwd()` was root directory (`/`) instead of project directory, causing vitest to hang indefinitely.
- **Root Cause:** MCP server process working directory was not set to the project root.
- **Solution:** Used explicit `projectDir` in spawn options and `VITEST_PROJECT_DIR` environment variable for configuration.

### [T4] Test Failures After Refactoring (Step 8)

- **Issue:** Component tests failing due to missing `data-testid` attributes after TypeScript ref refactoring.
- **Root Cause:** Tests were updated to use React Testing Library but components weren't updated with required test attributes.
- **Solution:** Added missing `data-testid` attributes to components and updated icon utility types to support test attributes.

### [T5] ESLint Errors from Compiled Code (Step 9)

- **Issue:** ESLint checking compiled JavaScript files in `dist/` folders, causing numerous linting errors.
- **Root Cause:** ESLint disable comments in TypeScript source don't carry over to compiled JavaScript output.
- **Solution:** Added `'mcp-servers/**/dist/**'` to global `ignores` array in `eslint.config.mjs` to exclude compiled code from linting.

## Important Notes

⚠️ **Always run MCP server from project root** - The server must be started from `/Users/madrus/dev/biz/toernooien/tournado` to ensure correct file paths and vitest execution context.

💡 **Test-driven development workflow** - Use the MCP server to run tests, identify failures, fix code, and repeat until all tests pass.

🔧 **Building after changes** - Remember to run `npm run build` in the MCP server directory after making changes to TypeScript source files.
