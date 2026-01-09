import { beforeEach, vi } from 'vitest'
import { handle, loader } from '~/routes/admin/competition/competition'
import { adminPath } from '~/utils/adminRoutes'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
	getUser: vi.fn(),
}))

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
	getAllTournaments: vi.fn().mockResolvedValue([]),
	getTournamentById: vi.fn().mockResolvedValue(null),
}))

beforeEach(() => {
	vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
	routePath: adminPath('/competition'),
	metadata: handle,
	loaderFunction: loader,
})
