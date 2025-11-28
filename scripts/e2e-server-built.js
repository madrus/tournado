#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'

import { checkDevServer } from './utils/port-utils.js'

// Force test DB for built e2e server (override any .env setting)
process.env.DATABASE_URL = 'file:./prisma/data-test.db?connection_limit=1'
process.env.PLAYWRIGHT = 'true'
const { withMockImports } = await import('./utils/node-options.js')
process.env.NODE_OPTIONS = withMockImports(process.env.NODE_OPTIONS)

const PORT = 8811
process.env.PORT = PORT.toString() // Ensure consistent port for built server

// Check if server is already running
const serverStatus = await checkDevServer(PORT)

if (serverStatus.isResponding && serverStatus.isTestServer) {
	process.exit(0)
} else if (serverStatus.isResponding && !serverStatus.isTestServer) {
	process.exit(1)
} else if (serverStatus.isRunning && !serverStatus.isResponding) {
	process.exit(1)
}

// Apply migrations to the test database before starting the built server
const migrate = spawnSync('pnpm', ['prisma', 'migrate', 'deploy'], {
	stdio: 'inherit',
	env: process.env,
})

if (migrate.status !== 0) {
	process.exit(migrate.status || 1)
}

// Start the built server
const server = spawn('pnpm', ['start'], { stdio: 'inherit', env: process.env })

server.on('exit', (code) => {
	process.exit(code || 0)
})
