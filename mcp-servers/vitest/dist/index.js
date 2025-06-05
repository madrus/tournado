// If you get import errors, check node_modules/@modelcontextprotocol/sdk/server/ for the correct paths
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { registerRunVitestTool } from './tools/run-vitest.js'

async function main() {
  const server = new McpServer({
    name: 'tournado-vitest-runner',
    version: '1.0.0',
  })
  // Health check tool
  server.tool('ping', {}, async () => ({
    content: [{ type: 'text', text: 'pong' }],
  }))
  // Register the run-vitest tool
  registerRunVitestTool(server)
  // Start the server using stdio transport
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('MCP server failed to start:', err)
  process.exit(1)
})
