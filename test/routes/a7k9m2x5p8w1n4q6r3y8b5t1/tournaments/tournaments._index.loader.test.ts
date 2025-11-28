import { beforeEach, vi } from 'vitest'

import {
	handle,
	loader,
} from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/tournaments._index'

import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
	getUser: vi.fn(),
}))

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
	getAllTournaments: vi.fn().mockResolvedValue([]),
}))

beforeEach(() => {
	vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
	routePath: '/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments',
	metadata: handle,
	loaderFunction: loader,
})
