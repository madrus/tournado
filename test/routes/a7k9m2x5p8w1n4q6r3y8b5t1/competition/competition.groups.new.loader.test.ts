import { beforeEach, vi } from 'vitest'
import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'
import { handle, loader } from '~/routes/admin/competition/competition.groups.new'
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
    categories: '["U12","U14"]',
    createdBy: 'user-123',
  }),
}))

// Mock group model
vi.mock('~/models/group.server', () => ({
  getUnassignedTeamsByCategories: vi.fn().mockResolvedValue([]),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
// Note: This route requires tournament query param
createLoaderAuthTests({
  routePath: adminPath('/competition/groups/new?tournament=test-id'),
  metadata: handle,
  loaderFunction: loader,
})
