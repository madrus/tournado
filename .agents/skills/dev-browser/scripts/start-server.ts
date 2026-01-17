import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import os from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serve } from '@/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmpDir = join(__dirname, '..', 'tmp')
const profileDir = join(__dirname, '..', 'profiles')

// Create tmp and profile directories if they don't exist
console.log('Creating tmp directory...')
mkdirSync(tmpDir, { recursive: true })
console.log('Creating profiles directory...')
mkdirSync(profileDir, { recursive: true })

// Install Playwright browsers if not already installed
console.log('Checking Playwright browser installation...')

function findPackageManager(): { name: string; command: string } | null {
  const isWin = process.platform === 'win32'
  const locator = isWin ? 'where' : 'which'
  const managers = [
    { name: 'bun', command: 'bunx playwright install chromium' },
    { name: 'pnpm', command: 'pnpm exec playwright install chromium' },
    { name: 'npm', command: 'npx playwright install chromium' },
  ]

  for (const manager of managers) {
    try {
      execSync(`${locator} ${manager.name}`, { stdio: 'ignore' })
      return manager
    } catch {
      // Package manager not found, try next
    }
  }
  return null
}

function isChromiumInstalled(): boolean {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    const customPath = process.env.PLAYWRIGHT_BROWSERS_PATH
    if (existsSync(customPath)) {
      try {
        const entries = readdirSync(customPath)
        return entries.some(entry => entry.startsWith('chromium'))
      } catch {
        return false
      }
    }
    return false
  }

  let playwrightCacheDir: string
  if (process.platform === 'win32') {
    playwrightCacheDir = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  } else if (process.platform === 'darwin') {
    playwrightCacheDir = join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
  } else {
    // Linux
    playwrightCacheDir = join(os.homedir(), '.cache', 'ms-playwright')
  }

  if (!existsSync(playwrightCacheDir)) {
    return false
  }

  // Check for chromium directories (e.g., chromium-1148, chromium_headless_shell-1148)
  try {
    const entries = readdirSync(playwrightCacheDir)
    return entries.some(entry => entry.startsWith('chromium'))
  } catch {
    return false
  }
}

try {
  if (!isChromiumInstalled()) {
    console.log('Playwright Chromium not found. Installing (this may take a minute)...')

    const pm = findPackageManager()
    if (!pm) {
      throw new Error('No package manager found (tried bun, pnpm, npm)')
    }

    console.log(`Using ${pm.name} to install Playwright...`)
    execSync(pm.command, { stdio: 'inherit' })
    console.log('Chromium installed successfully.')
  } else {
    console.log('Playwright Chromium already installed.')
  }
} catch (error) {
  console.error('Failed to install Playwright browsers:', error)
  console.log('You may need to run: npx playwright install chromium')
  process.exit(1)
}

// Check if dev-browser server is already running on port 9222
console.log('Checking for existing dev-browser server...')
try {
  const res = await fetch('http://localhost:9222', {
    signal: AbortSignal.timeout(1000),
  })
  if (res.ok) {
    console.log('dev-browser server already running on port 9222')
    process.exit(0)
  }
} catch {
  // Server not running, continue to start
}

// Clean up stale CDP port if HTTP server isn't running (crash recovery)
// This handles the case where Node crashed but Chrome is still running on 9223
try {
  const pid = execSync('lsof -ti:9223', { encoding: 'utf-8' }).trim()
  if (pid) {
    // Verify it's actually Chrome/Chromium before killing
    try {
      const command = execSync(`ps -o comm= -p ${pid}`, {
        encoding: 'utf-8',
      }).trim()
      if (
        command.toLowerCase().includes('chrome') ||
        command.toLowerCase().includes('chromium')
      ) {
        console.log(`Cleaning up stale Chrome process on CDP port 9223 (PID: ${pid})`)

        // Try graceful SIGTERM first
        execSync(`kill ${pid}`)

        // Wait 500ms to see if it exits
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if still running
        try {
          execSync(`kill -0 ${pid}`, { stdio: 'ignore' })
          // Still running, force kill
          console.log('Process did not exit, forcing kill...')
          execSync(`kill -9 ${pid}`)
        } catch {
          // Process exited successfully
        }
      }
    } catch {
      // Process might have exited between lsof and ps
    }
  }
} catch {
  // No process on CDP port, which is expected
}

console.log('Starting dev browser server...')
const headless = process.env.HEADLESS === 'true'
const server = await serve({
  port: 9222,
  headless,
  profileDir,
})

console.log(`Dev browser server started`)
console.log(`  WebSocket: ${server.wsEndpoint}`)
console.log(`  Tmp directory: ${tmpDir}`)
console.log(`  Profile directory: ${profileDir}`)
console.log(`\nReady`)
console.log(`\nPress Ctrl+C to stop`)

// Keep the process running
await new Promise(() => {})
