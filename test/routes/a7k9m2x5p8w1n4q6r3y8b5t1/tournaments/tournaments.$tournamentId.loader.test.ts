import { beforeEach, vi } from 'vitest'
import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'
import { handle, loader } from '~/routes/admin/tournaments/tournaments.$tournamentId'
import { adminPath } from '~/utils/adminRoutes'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
  getTournamentById: vi.fn().mockResolvedValue({
    id: 'test-tournament-id',
    name: 'Test Tournament',
    location: 'Test Location',
    startDate: new Date(),
    endDate: new Date(),
    divisions: [],
    categories: [],
  }),
  getAllDivisions: vi.fn(() => ['Boys', 'Girls']),
  getAllCategories: vi.fn(() => ['U12', 'U14', 'U16']),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
  routePath: adminPath('/tournaments/test-id'),
  metadata: handle,
  loaderFunction: args => loader({ ...args, params: { tournamentId: 'test-id' } }),
})
