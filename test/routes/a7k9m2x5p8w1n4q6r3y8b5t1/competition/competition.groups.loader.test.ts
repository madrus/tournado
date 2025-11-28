import { beforeEach, vi } from 'vitest'

import {
	handle,
	loader,
} from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/competition/competition.groups'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
	getUser: vi.fn(),
}))

// Mock group model
vi.mock('~/models/group.server', () => ({
	getTournamentGroupSets: vi.fn().mockResolvedValue([]),
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
	routePath: '/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups?tournament=test-id',
	metadata: handle,
	loaderFunction: loader,
})
