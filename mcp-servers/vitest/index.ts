#!/usr/bin/env node
// If you get import errors, check node_modules/@modelcontextprotocol/sdk/server/ for the correct paths
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { registerRunVitestCoverageTool } from './tools/run-vitest-coverage.js'
import { registerRunVitestTool } from './tools/run-vitest.js'

async function main() {
  const server = new McpServer({
    name: 'vitest-mcp',
    version: '1.0.0',
  })

  // Health check tool
  server.tool('ping', {}, async () => ({
    content: [{ type: 'text', text: 'pong' }],
  }))

  // Register the vitest tools
  registerRunVitestTool(server)
  registerRunVitestCoverageTool(server)

  // Start the server using stdio transport
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
