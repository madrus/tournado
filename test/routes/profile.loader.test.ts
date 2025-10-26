import { beforeEach, vi } from 'vitest'

import { handle, loader } from '~/routes/profile'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
  routePath: '/profile',
  metadata: handle,
  loaderFunction: loader,
})
