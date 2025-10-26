import { beforeEach, vi } from 'vitest'

import { createLoaderAuthTests } from 'test/utils/loader-authorization.helpers'

import {
  handle,
  loader,
} from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/tournaments.$tournamentId'

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

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
  getTournamentById: vi.fn(() => ({
    id: 'test-tournament-id',
    name: 'Test Tournament',
    location: 'Test Location',
    startDate: new Date(),
    endDate: new Date(),
    divisions: [],
    categories: [],
  })),
  getAllDivisions: vi.fn(() => ['Boys', 'Girls']),
  getAllCategories: vi.fn(() => ['U12', 'U14', 'U16']),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
  routePath: '/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/test-id',
  metadata: handle,
  loaderFunction: args => loader({ ...args, params: { tournamentId: 'test-id' } }),
})
