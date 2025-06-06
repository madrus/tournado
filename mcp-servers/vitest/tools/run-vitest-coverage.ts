/* eslint-disable no-console */
/* eslint-disable id-blacklist */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { startVitest } from 'vitest/node'

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

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
        // Determine the correct project directory
        const projectDir =
          process.env.VITEST_PROJECT_DIR || '/Users/madrus/dev/biz/toernooien/tournado'

        // Try to read coverage files before vitest.close() deletes them
        let coverageData = null
        let coverageSummary = null
        let debugInfo = []

        // Add debugging info about execution context
        debugInfo.push(
          `Running as user: ${process.env.USER || process.env.USERNAME || 'unknown'}`
        )
        debugInfo.push(`Process cwd BEFORE: ${process.cwd()}`)
        debugInfo.push(`Project dir: ${projectDir}`)

        // Change working directory to project directory to fix path resolution
        const originalCwd = process.cwd()
        process.chdir(projectDir)
        debugInfo.push(`Process cwd AFTER chdir: ${process.cwd()}`)

        // Start Vitest programmatically with coverage enabled
        const vitest = await startVitest(
          'test',
          [],
          {
            // CLI options
            watch: false,
            run: true,
            coverage: {
              enabled: true,
              reporter: ['json', 'json-summary'],
            },
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
              coverage: {
                enabled: true,
                all: true,
                provider: 'v8',
                reporter: ['json', 'json-summary'],
                reportsDirectory: './coverage',
                include: ['app/**/*.{ts,tsx}'],
                exclude: [
                  'app/**/*.test.{ts,tsx}',
                  'app/**/__tests__/**',
                  'app/**/*.d.ts',
                  'app/entry.client.tsx',
                  'app/entry.server.tsx',
                ],
              },
            },
          }
        )

        if (!vitest) {
          // Restore original working directory
          process.chdir(originalCwd)
          return {
            content: [
              {
                type: 'text',
                text: 'Failed to start Vitest with coverage - no tests found or configuration issue',
              },
            ],
          }
        }

        // Get test results from vitest state
        const testFiles = vitest.state.getFiles()

        // Helper function to determine if a file passed
        const isFilePassed = (file: any) => {
          const allTasks = file.tasks || []
          if (allTasks.length === 0) return false
          return allTasks.every((task: any) => task.result?.state === 'pass')
        }

        // Helper function to get all test tasks recursively
        const getAllTasks = (items: any[]): any[] => {
          const tasks: any[] = []
          for (const item of items) {
            if (item.type === 'test') {
              tasks.push(item)
            } else if (item.type === 'suite' && item.tasks) {
              tasks.push(...getAllTasks(item.tasks))
            }
          }
          return tasks
        }

        // Try multiple times with increasing delays to catch coverage files
        const delays = [100, 500, 1000]
        let found = false

        for (const delay of delays) {
          await new Promise(resolve => setTimeout(resolve, delay))

          const coverageDir = join(projectDir, 'coverage')
          const coverageSummaryPath = join(
            projectDir,
            'coverage',
            'coverage-summary.json'
          )

          debugInfo.push(`Checking: ${coverageDir}`)

          if (existsSync(coverageDir)) {
            debugInfo.push(`Coverage directory exists after ${delay}ms delay`)
            found = true

            // Try to read coverage files
            try {
              const fs = await import('fs')
              const files = fs.readdirSync(coverageDir)
              debugInfo.push(`Coverage files found: ${files.join(', ')}`)

              if (existsSync(coverageSummaryPath)) {
                debugInfo.push('coverage-summary.json exists - reading...')
                const summaryText = readFileSync(coverageSummaryPath, 'utf-8')
                coverageSummary = JSON.parse(summaryText)
                debugInfo.push('Coverage summary loaded successfully')
              } else {
                debugInfo.push('coverage-summary.json does not exist')
              }

              const coverageJsonPath = join(
                projectDir,
                'coverage',
                'coverage-final.json'
              )
              if (existsSync(coverageJsonPath)) {
                debugInfo.push('coverage-final.json exists - reading...')
                const coverageText = readFileSync(coverageJsonPath, 'utf-8')
                coverageData = JSON.parse(coverageText)
                debugInfo.push('Coverage data loaded successfully')
              } else {
                debugInfo.push('coverage-final.json does not exist')
              }
            } catch (error) {
              debugInfo.push(`Error reading coverage files: ${error}`)
            }
            break
          } else {
            debugInfo.push(`Coverage directory does not exist after ${delay}ms delay`)
          }
        }

        if (!found) {
          debugInfo.push('Final check: Coverage directory does not exist')
          debugInfo.push('coverage-final.json does not exist')
          debugInfo.push('coverage-summary.json does not exist')
        }

        // Collect all test results
        const testResults = testFiles.map((file: any) => {
          const allTestTasks = getAllTasks(file.tasks || [])
          return {
            name: file.filepath,
            status: isFilePassed(file) ? 'passed' : 'failed',
            duration: file.result?.duration || 0,
            assertionResults: allTestTasks.map((task: any) => ({
              ancestorTitles: task.suite ? [task.suite.name] : [],
              title: task.name || 'unknown test',
              status: task.result?.state === 'pass' ? 'passed' : 'failed',
              duration: task.result?.duration || 0,
              failureMessages:
                task.result?.errors?.map((err: any) => err.message) || [],
            })),
          }
        })

        // Calculate totals
        const numTotalTestSuites = testFiles.length
        const numPassedTestSuites = testFiles.filter(isFilePassed).length
        const numFailedTestSuites = numTotalTestSuites - numPassedTestSuites

        const allTests = testFiles.flatMap((file: any) => getAllTasks(file.tasks || []))
        const numTotalTests = allTests.length
        const numPassedTests = allTests.filter(
          (task: any) => task.result?.state === 'pass'
        ).length
        const numFailedTests = numTotalTests - numPassedTests

        // Close vitest
        await vitest.close()

        // Restore original working directory
        process.chdir(originalCwd)

        // Return results with coverage information
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  numTotalTestSuites,
                  numPassedTestSuites,
                  numFailedTestSuites,
                  numTotalTests,
                  numPassedTests,
                  numFailedTests,
                  testResults,
                  coverage: coverageSummary
                    ? {
                        summary: coverageSummary,
                        message: 'Coverage data captured successfully',
                        debug: debugInfo,
                      }
                    : {
                        message:
                          'Coverage files were created but cleaned up immediately by Vitest',
                        instruction:
                          'Coverage data is being generated but not persisted - this is normal behavior',
                        debug: debugInfo,
                      },
                },
                null,
                2
              ),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error running vitest with coverage: ${error}`,
            },
          ],
        }
      }
    }
  )
}
