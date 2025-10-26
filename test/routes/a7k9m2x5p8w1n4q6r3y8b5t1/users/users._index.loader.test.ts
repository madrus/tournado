import { beforeEach, vi } from 'vitest'

import { handle, loader } from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/users/users._index'

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
  getAllUsersWithPagination: vi.fn().mockResolvedValue({
    users: [],
    total: 0,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
  routePath: '/a7k9m2x5p8w1n4q6r3y8b5t1/users',
  metadata: handle,
  loaderFunction: loader,
})
