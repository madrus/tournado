import { spawn } from 'child_process'

/**
 * Registers the run-vitest tool with the given MCP server.
 */
export function registerRunVitestTool(server) {
  server.tool(
    'run-vitest',
    {},
    async () =>
      new Promise(resolve => {
        const TIMEOUT_MS = 30000 // 30 second timeout should be plenty
        let isResolved = false
        // Determine the correct project directory
        const projectDir =
          process.env.VITEST_PROJECT_DIR || '/Users/madrus/dev/biz/toernooien/tournado'
        const debugInfo = {
          started: new Date().toISOString(),
          processCwd: process.cwd(),
          projectDir,
          command: '/opt/homebrew/bin/npx vitest run --reporter=json',
        }
        console.log('🚀 Starting vitest execution...', debugInfo)
        console.log('📂 Process CWD:', process.cwd())
        console.log('📁 Project Dir:', projectDir)
        const args = ['vitest', 'run', '--reporter=json']
        console.log('⚡ Command:', '/opt/homebrew/bin/npx', args.join(' '))
        const proc = spawn('/opt/homebrew/bin/npx', args, {
          cwd: projectDir,
          shell: false,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            CI: 'true',
            PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
          },
        })
        let stdout = ''
        let stderr = ''
        // Set up timeout with proper cleanup
        const timeout = setTimeout(() => {
          if (!isResolved) {
            console.log('⏰ TIMEOUT: Killing vitest process after 30 seconds')
            isResolved = true
            proc.kill('SIGKILL')
            resolve({
              content: [
                {
                  type: 'text',
                  text: 'TIMEOUT: Vitest execution timed out after 30 seconds.',
                },
                {
                  type: 'text',
                  text: `PARTIAL_STDOUT: ${stdout}`,
                },
                {
                  type: 'text',
                  text: `PARTIAL_STDERR: ${stderr}`,
                },
              ],
            })
          }
        }, TIMEOUT_MS)
        // Handle process spawn errors
        proc.on('error', error => {
          if (!isResolved) {
            console.log('❌ Process spawn error:', error.message)
            isResolved = true
            clearTimeout(timeout)
            resolve({
              content: [
                {
                  type: 'text',
                  text: `ERROR: Failed to spawn vitest: ${error.message}`,
                },
              ],
            })
          }
        })
        // Collect stdout data
        proc.stdout?.on('data', data => {
          const chunk = data.toString()
          console.log('📝 STDOUT chunk received:', chunk.length, 'chars')
          stdout += chunk
        })
        // Collect stderr data
        proc.stderr?.on('data', data => {
          const chunk = data.toString()
          console.log('⚠️ STDERR chunk received:', chunk.length, 'chars')
          stderr += chunk
        })
        // Handle process completion
        proc.on('close', (code, signal) => {
          if (!isResolved) {
            console.log('🏁 Process closed with code:', code, 'signal:', signal)
            console.log('📊 Total stdout length:', stdout.length)
            console.log('📊 Total stderr length:', stderr.length)
            isResolved = true
            clearTimeout(timeout)
            try {
              // Try to parse the JSON output
              let jsonResult = null
              if (stdout.trim()) {
                // The output might have multiple JSON objects, find the main test results
                const lines = stdout.split('\n')
                for (const line of lines) {
                  const trimmed = line.trim()
                  if (trimmed.startsWith('{') && trimmed.includes('"testResults"')) {
                    try {
                      jsonResult = JSON.parse(trimmed)
                      break
                    } catch (_err) {
                      console.log('⚠️ Failed to parse line:', trimmed.substring(0, 100))
                    }
                  }
                }
              }
              const content = []
              // Debug info removed for cleaner output
              if (jsonResult) {
                console.log('✅ Successfully parsed vitest JSON results')
                // Limit stack trace length for readability
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const limitStackTraces = obj => {
                  if (typeof obj !== 'object' || obj === null) return obj
                  if (Array.isArray(obj)) {
                    return obj.map(limitStackTraces)
                  }
                  const result = { ...obj }
                  // Limit failureMessages (stack traces) to 1500 characters
                  if (result.failureMessages && Array.isArray(result.failureMessages)) {
                    result.failureMessages = result.failureMessages.map(msg => {
                      if (typeof msg === 'string' && msg.length > 1500) {
                        return msg.substring(0, 1500) + '\n... (stack trace truncated)'
                      }
                      return msg
                    })
                  }
                  // Recursively process nested objects
                  for (const key in result) {
                    if (typeof result[key] === 'object' && result[key] !== null) {
                      result[key] = limitStackTraces(result[key])
                    }
                  }
                  return result
                }
                const cleanedResults = limitStackTraces(jsonResult)
                content.push({
                  type: 'text',
                  text: `SUCCESS: Vitest completed with exit code ${code}`,
                })
                content.push({
                  type: 'text',
                  text: `RESULTS: ${JSON.stringify(cleanedResults, null, 2)}`,
                })
              } else {
                console.log('⚠️ No valid JSON found in output')
                content.push({
                  type: 'text',
                  text: `COMPLETED: Vitest finished with exit code ${code}`,
                })
                if (stdout) {
                  content.push({
                    type: 'text',
                    text: `STDOUT: ${stdout.substring(0, 2000)}${stdout.length > 2000 ? '... (truncated)' : ''}`,
                  })
                }
              }
              if (stderr) {
                content.push({
                  type: 'text',
                  text: `STDERR: ${stderr.substring(0, 1000)}${stderr.length > 1000 ? '... (truncated)' : ''}`,
                })
              }
              resolve({ content })
            } catch (err) {
              console.log('💥 Error in result processing:', err)
              resolve({
                content: [
                  {
                    type: 'text',
                    text: `PARSE_ERROR: ${String(err)}`,
                  },
                  {
                    type: 'text',
                    text: `RAW_OUTPUT: ${stdout.substring(0, 1000)}`,
                  },
                ],
              })
            }
          }
        })
      })
  )
}
