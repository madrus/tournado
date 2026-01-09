#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'

import { checkDevServer } from './utils/port-utils.js'

// Force test DB for e2e server (override any .env setting)
process.env.DATABASE_URL = 'file:./prisma/data-test.db?connection_limit=1'
process.env.PLAYWRIGHT = 'true'
// Disable React Router DevTools during E2E tests to prevent overlay interference
process.env.ENABLE_REACT_ROUTER_DEVTOOLS = 'false'
// Set admin slug for E2E tests (matches local .env)
process.env.VITE_ADMIN_SLUG = 'admin'
const { withMockImports } = await import('./utils/node-options.js')
process.env.NODE_OPTIONS = withMockImports(process.env.NODE_OPTIONS)

const PORT = 8811
const _DEV_SERVER_URL = `http://localhost:${PORT}`

// Check if server is already running
const serverStatus = await checkDevServer(PORT)

if (serverStatus.isResponding && serverStatus.isTestServer) {
	process.exit(0)
} else if (serverStatus.isResponding && !serverStatus.isTestServer) {
	// Try to kill the process using the port
	try {
		const { spawnSync } = await import('node:child_process')
		const killResult = spawnSync('lsof', ['-ti', `:${PORT}`], {
			encoding: 'utf8',
		})

		if (killResult.stdout.trim()) {
			const pids = killResult.stdout
				.trim()
				.split('\n')
				.filter((pid) => pid.trim())

			for (const pid of pids) {
				const killProcess = spawnSync('kill', ['-TERM', pid.trim()])
				if (killProcess.status === 0) {
				} else {
					const forceKill = spawnSync('kill', ['-KILL', pid.trim()])
					if (forceKill.status === 0) {
					} else {
					}
				}
			}
			await new Promise((resolve) => setTimeout(resolve, 3000))

			// Verify the port is now free
			const verifyStatus = await checkDevServer(PORT)
			if (verifyStatus.isRunning) {
				process.exit(1)
			} else {
			}
		}
	} catch (_error) {}
} else if (serverStatus.isRunning && !serverStatus.isResponding) {
	process.exit(1)
}

// Apply migrations to the test database before starting the dev server
const migrate = spawnSync('pnpm', ['prisma', 'migrate', 'deploy'], {
	stdio: 'inherit',
	env: {
		...process.env,
		VITE_ADMIN_SLUG: 'admin',
	},
})

if (migrate.status !== 0) {
	process.exit(migrate.status || 1)
}

// Start the dev server (react-router dev) with explicit port
const server = spawn('pnpm', ['dev', '--port', PORT.toString()], {
	stdio: 'inherit',
	env: {
		...process.env,
		VITE_ADMIN_SLUG: 'admin',
	},
})

server.on('exit', (code) => {
	process.exit(code || 0)
})
