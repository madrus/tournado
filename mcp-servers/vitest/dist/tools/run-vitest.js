import { startVitest } from 'vitest/node'

/**
 * Registers the run-vitest tool with the given MCP server.
 */
export function registerRunVitestTool(server) {
  server.tool(
    'run-vitest',
    {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    async () => {
      try {
        // Determine the correct project directory
        const projectDir =
          process.env.VITEST_PROJECT_DIR || '/Users/madrus/dev/biz/toernooien/tournado'
        // Start Vitest programmatically using the Node.js API
        const vitest = await startVitest(
          'test',
          [],
          {
            // CLI options
            watch: false,
            run: true,
            reporters: ['json'],
            outputFile: undefined, // we'll read from state
          },
          {
            // Vite config overrides
            root: projectDir,
            logLevel: 'silent', // Prevent logs from interfering with MCP protocol
            // Explicitly set the test configuration
            test: {
              globals: true,
              environment: 'happy-dom',
              setupFiles: ['./test/setup-test-env.ts'],
            },
          }
        )
        if (!vitest) {
          return {
            content: [
              {
                type: 'text',
                text: 'Failed to start Vitest - no tests found or configuration issue',
              },
            ],
          }
        }
        // Get test results from vitest state
        const testFiles = vitest.state.getFiles()
        // Helper function to determine if a file passed
        const isFilePassed = file => {
          // A file passes if all its tests pass (no failed tests)
          const allTasks = file.tasks || []
          if (allTasks.length === 0) return false
          return allTasks.every(task => task.result?.state === 'pass')
        }
        // Helper function to get all test tasks recursively (including nested suites)
        const getAllTasks = items => {
          const tasks = []
          for (const item of items) {
            if (item.type === 'test') {
              tasks.push(item)
            } else if (item.type === 'suite' && item.tasks) {
              tasks.push(...getAllTasks(item.tasks))
            }
          }
          return tasks
        }
        // Create a summary object similar to JSON reporter output
        const results = {
          numTotalTestSuites: testFiles.length,
          numPassedTestSuites: testFiles.filter(isFilePassed).length,
          numFailedTestSuites: testFiles.filter(f => !isFilePassed(f)).length,
          numTotalTests: testFiles.reduce(
            (sum, f) => sum + getAllTasks(f.tasks || []).length,
            0
          ),
          numPassedTests: 0,
          numFailedTests: 0,
          testResults: testFiles.map(file => {
            const allTasks = getAllTasks(file.tasks || [])
            const passedTasks = allTasks.filter(t => t.result?.state === 'pass')
            const failedTasks = allTasks.filter(t => t.result?.state === 'fail')
            return {
              name: file.filepath,
              status: isFilePassed(file) ? 'passed' : 'failed',
              duration: file.result?.duration || 0,
              assertionResults: allTasks.map(task => ({
                ancestorTitles: task.suite ? [task.suite.name] : [],
                title: task.name,
                status: task.result?.state === 'pass' ? 'passed' : 'failed',
                duration: task.result?.duration || 0,
                failureMessages: task.result?.errors?.map(e => e.message) || [],
              })),
            }
          }),
        }
        // Count total passed/failed tests
        results.numPassedTests = results.testResults.reduce(
          (sum, r) =>
            sum + r.assertionResults.filter(a => a.status === 'passed').length,
          0
        )
        results.numFailedTests = results.testResults.reduce(
          (sum, r) =>
            sum + r.assertionResults.filter(a => a.status === 'failed').length,
          0
        )
        // Close vitest
        await vitest.close()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [
            {
              type: 'text',
              text: `Error running vitest: ${errorMessage}`,
            },
          ],
        }
      }
    }
  )
}
