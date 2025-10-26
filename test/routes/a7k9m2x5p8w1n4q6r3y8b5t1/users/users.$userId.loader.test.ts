import { beforeEach, vi } from 'vitest'

import { handle, loader } from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/users/users.$userId'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

// Mock route utilities to actually check authorization
vi.mock('~/utils/routeUtils.server', async () => {
  const actual = await vi.importActual<typeof import('~/utils/routeUtils.server')>(
    '~/utils/routeUtils.server'
  )
  return {
    ...actual,
    requireUserWithMetadata: vi.fn(actual.requireUserWithMetadata),
  }
})

// Mock user model
vi.mock('~/models/user.server', () => ({
  getUserById: vi.fn(() => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'PUBLIC',
    firstName: 'Test',
    lastName: 'User',
    active: true,
  })),
}))

// Mock user audit log model
vi.mock('~/models/userAuditLog.server', () => ({
  getUserAuditLogs: vi.fn(() => []),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
  routePath: '/a7k9m2x5p8w1n4q6r3y8b5t1/users/test-id',
  metadata: handle,
  loaderFunction: args => loader({ ...args, params: { userId: 'test-id' } }),
})
