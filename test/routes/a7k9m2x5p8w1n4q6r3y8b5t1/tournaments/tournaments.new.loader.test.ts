import { beforeEach, vi } from 'vitest'
import { handle, loader } from '~/routes/admin/tournaments/tournaments.new'
import { adminPath } from '~/utils/adminRoutes'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
	getUser: vi.fn(),
}))

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
	getAllCategories: vi.fn(() => ['U12', 'U14', 'U16']),
	getAllDivisions: vi.fn(() => ['Boys', 'Girls']),
}))

beforeEach(() => {
	vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
	routePath: adminPath('/tournaments/new'),
	metadata: handle,
	loaderFunction: loader,
})
