/* eslint-disable no-console */
/* eslint-disable id-blacklist */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

/**
 * Registers the run-vitest-coverage tool with the given MCP server.
 */
export function registerRunVitestCoverageTool(server: McpServer): void {
  server.tool(
    'run-vitest-coverage',
    {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    async () => {
      try {
        const projectDir =
          process.env.VITEST_PROJECT_DIR || '/Users/madrus/dev/biz/toernooien/tournado'

        // Since we're having issues with the MCP server integration,
        // provide clear instructions for running coverage manually
        return {
          content: [
            {
              type: 'text',
              text:
                '# Vitest Coverage Instructions\n\nDue to file descriptor conflicts in the MCP server environment, please run the coverage tests manually with the following command:\n\n```bash\ncd ' +
                projectDir +
                '\nnpm run test:coverage\n```\n\nThis will generate a coverage report in the coverage/ directory that you can view in your browser by opening coverage/index.html.\n\nFor programmatic access to coverage data, you can also check the coverage/coverage-summary.json file which contains detailed metrics.\n',
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [
            {
              type: 'text',
              text: `Error providing coverage instructions: ${errorMessage}`,
            },
          ],
        }
      }
    }
  )
}
