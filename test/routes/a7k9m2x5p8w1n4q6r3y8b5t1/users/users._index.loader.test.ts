import { beforeEach, vi } from 'vitest'
import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'
import { handle, loader } from '~/routes/admin/users/users._index'
import { adminPath } from '~/utils/adminRoutes'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

// Mock route utilities to actually check authorization
vi.mock('~/utils/routeUtils.server', async () => {
  const actual = await vi.importActual<typeof import('~/utils/routeUtils.server')>(
    '~/utils/routeUtils.server',
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
  routePath: adminPath('/users'),
  metadata: handle,
  loaderFunction: loader,
})
