import { beforeEach, vi } from 'vitest'
import { handle, loader } from '~/routes/admin/competition/competition.groups'
import { adminPath } from '~/utils/adminRoutes'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
	getUser: vi.fn(),
}))

// Mock group model
vi.mock('~/models/group.server', () => ({
	getTournamentGroupStages: vi.fn().mockResolvedValue([]),
}))

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
	getAllTournaments: vi.fn().mockResolvedValue([]),
}))

beforeEach(() => {
	vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
// Note: This route requires tournament query param
createLoaderAuthTests({
	routePath: adminPath('/competition/groups?tournament=test-id'),
	metadata: handle,
	loaderFunction: loader,
})
