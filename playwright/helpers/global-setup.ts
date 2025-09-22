/* eslint-disable no-console */
import { FullConfig } from '@playwright/test'

import fs from 'fs'
import path from 'path'

import { checkDevServer } from '../../scripts/utils/port-utils.js'
import { cleanDatabaseCompletely, createAdminUser, createManagerUser } from './database'

// Set environment variable for test detection
process.env.PLAYWRIGHT = 'true'
const DEV_SERVER_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8811'

// Wait for server to be ready
async function waitForServer(url: string, timeout = 60000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`Server at ${url} did not respond within ${timeout}ms`)
}

async function globalSetup(_config: FullConfig): Promise<void> {
  // Set environment variables for server-side test detection
  process.env.PLAYWRIGHT = 'true'
  process.env.NODE_ENV = 'test'
  process.env.PLAYWRIGHT_GLOBAL_SETUP = 'true'

  // Wait for server to be ready - use the configured baseURL
  const url = new URL(DEV_SERVER_URL)
  const port = Number(url.port)
  await checkDevServer(port)

  // Clean database completely before starting tests
  await cleanDatabaseCompletely()

  // Seed essential test data - create tournaments for team creation tests
  const { createTestTournament } = await import('./database')
  await createTestTournament('Spring Cup', 'Amsterdam')
  await createTestTournament('Summer Cup', 'Aalsmeer')

  // Create users for testing
  const adminUser = await createAdminUser()
  const regularUser = await createManagerUser()

  // Create simple auth state files with session cookies
  await createSimpleAuthState(
    adminUser.id,
    './playwright/.auth/admin-auth.json',
    'admin'
  )
  await createSimpleAuthState(
    regularUser.id,
    './playwright/.auth/user-auth.json',
    'regular user'
  )
}

async function createSimpleAuthState(
  userId: string,
  authFilePath: string,
  userType: string
): Promise<void> {
  try {
    // Import session storage dynamically to avoid Node.js module issues
    const { sessionStorage } = await import('../../app/utils/session.server.js')

    // Create a session cookie with the user ID
    const session = await sessionStorage.getSession()
    session.set('userId', userId)
    const sessionCookie = await sessionStorage.commitSession(session)

    // Parse the Set-Cookie header to extract just the cookie value
    // sessionCookie format: "__session=encrypted_value; Path=/; HttpOnly; SameSite=Lax"
    const cookieMatch = sessionCookie.match(/__session=([^;]+)/)
    if (!cookieMatch) {
      throw new Error(`Failed to parse session cookie: ${sessionCookie}`)
    }
    const cookieValue = cookieMatch[1]

    // Create a simple storage state file with the properly extracted session cookie
    const storageState = {
      cookies: [
        {
          name: '__session',
          value: cookieValue,
          domain: 'localhost',
          path: '/',
          expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          secure: false,
          sameSite: 'Lax' as const,
        },
        {
          name: 'lang',
          value: 'nl',
          domain: 'localhost',
          path: '/',
          expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year
          httpOnly: false,
          secure: false,
          sameSite: 'Lax' as const,
        },
      ],
      origins: [],
    }

    // Ensure the .auth directory exists
    const authDir = path.dirname(authFilePath)
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true })
    }

    // Write the storage state file
    fs.writeFileSync(authFilePath, JSON.stringify(storageState, null, 2))
    console.log(
      `Successfully created ${userType} auth state with direct session cookie`
    )
  } catch (error) {
    console.error(`${userType} auth state creation failed:`, error)
    throw error
  }
}

export default globalSetup
