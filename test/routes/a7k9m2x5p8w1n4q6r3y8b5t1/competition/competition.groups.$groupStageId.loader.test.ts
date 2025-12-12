import { beforeEach, vi } from 'vitest'

import {
	handle,
	loader,
} from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/competition/competition.groups.$groupStageId'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
	getUser: vi.fn(),
}))

// Mock group model
vi.mock('~/models/group.server', () => ({
	getGroupStageWithDetails: vi.fn().mockResolvedValue({
		id: 'test-group-set-id',
		name: 'Test Group Stage',
		tournamentId: 'test-tournament-id',
		categories: ['U12', 'U14'],
		groups: [],
		reserveSlots: [],
	}),
	getUnassignedTeamsByCategories: vi.fn().mockResolvedValue([]),
}))

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
	getTournamentById: vi.fn().mockResolvedValue({
		id: 'test-tournament-id',
		name: 'Test Tournament',
		categories: ['U12', 'U14'],
	}),
}))

beforeEach(() => {
	vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
	routePath:
		'/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups/test-id?tournament=test-tournament-id',
	metadata: handle,
	loaderFunction: (args) => loader({ ...args, params: { groupStageId: 'test-id' } }),
})
