#!/usr/bin/env node
/* eslint-disable no-console */
import { spawn, spawnSync } from 'node:child_process'

import { checkDevServer } from './utils/port-utils.js'

// Force test DB for e2e server
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'file:./prisma/data-test.db?connection_limit=1'
process.env.PLAYWRIGHT_TEST = process.env.PLAYWRIGHT_TEST || 'true'

const PORT = 5174
const DEV_SERVER_URL = `http://localhost:${PORT}`

console.log('[e2e-server] Using DATABASE_URL=', process.env.DATABASE_URL)

// Check if server is already running
const serverStatus = await checkDevServer(PORT)

if (serverStatus.isResponding && serverStatus.isTestServer) {
  console.log(
    `[e2e-server] ✅ Test server is already running and responding at ${serverStatus.url}`
  )
  console.log('[e2e-server] Reusing existing test server - no need to start a new one')
  process.exit(0)
} else if (serverStatus.isResponding && !serverStatus.isTestServer) {
  console.log(`[e2e-server] ⚠️  Non-test server detected at ${serverStatus.url}`)
  console.log('[e2e-server] Attempting to stop conflicting server...')

  // Try to kill the process using the port
  try {
    const { spawnSync } = await import('node:child_process')
    const killResult = spawnSync('lsof', ['-ti', `:${PORT}`], { encoding: 'utf8' })

    if (killResult.stdout.trim()) {
      const pids = killResult.stdout
        .trim()
        .split('\n')
        .filter(pid => pid.trim())
      console.log(`[e2e-server] Found processes on port ${PORT}: ${pids.join(', ')}`)

      for (const pid of pids) {
        console.log(`[e2e-server] Killing process ${pid}...`)
        const killProcess = spawnSync('kill', ['-TERM', pid.trim()])
        if (killProcess.status === 0) {
          console.log(`[e2e-server] Successfully sent TERM signal to process ${pid}`)
        } else {
          // Try SIGKILL if SIGTERM fails
          console.log(`[e2e-server] TERM failed, trying KILL for process ${pid}`)
          const forceKill = spawnSync('kill', ['-KILL', pid.trim()])
          if (forceKill.status === 0) {
            console.log(`[e2e-server] Successfully killed process ${pid}`)
          } else {
            console.log(`[e2e-server] Failed to kill process ${pid}`)
          }
        }
      }

      // Wait longer for all processes to be cleaned up
      console.log('[e2e-server] Waiting for port to be released...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Verify the port is now free
      const verifyStatus = await checkDevServer(PORT)
      if (verifyStatus.isRunning) {
        console.log(`[e2e-server] ⚠️  Port ${PORT} is still in use after kill attempt`)
        console.log(
          '[e2e-server] You may need to manually kill the process and try again'
        )
        process.exit(1)
      } else {
        console.log(`[e2e-server] ✅ Port ${PORT} is now free`)
      }
    }
  } catch (error) {
    console.log(
      `[e2e-server] Error attempting to kill conflicting server: ${error.message}`
    )
  }

  console.log('[e2e-server] Proceeding to start test server...')
} else if (serverStatus.isRunning && !serverStatus.isResponding) {
  console.log(`[e2e-server] ⚠️  Port ${PORT} is in use but server is not responding`)
  console.log(
    '[e2e-server] This might be a stale process. Consider killing it and trying again.'
  )
  process.exit(1)
}

console.log(
  `[e2e-server] 🚀 No responsive server detected on port ${PORT}, starting new server...`
)

// Apply migrations to the test database before starting the dev server
const migrate = spawnSync('pnpm', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
})

if (migrate.status !== 0) {
  console.error('[e2e-server] prisma migrate deploy failed')
  process.exit(migrate.status || 1)
}

// Start the dev server (react-router dev) with explicit port
const server = spawn('pnpm', ['dev', '--port', PORT.toString()], {
  stdio: 'inherit',
  env: process.env,
})

server.on('exit', code => {
  process.exit(code || 0)
})
