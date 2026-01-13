import { beforeEach, vi } from 'vitest'
import { createLoaderAuthTests } from '~test/utils/loader-authorization.helpers'
import { handle, loader } from '~/routes/admin/users/users.$userId'
import { adminPath } from '~/utils/adminRoutes'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
	getUser: vi.fn(),
}))

// Mock user model
vi.mock('~/models/user.server', () => ({
	getUserById: vi.fn().mockResolvedValue({
		id: 'test-user-id',
		email: 'test@example.com',
		role: 'PUBLIC',
		firstName: 'Test',
		lastName: 'User',
		active: true,
	}),
}))

// Mock user audit log model
vi.mock('~/models/userAuditLog.server', () => ({
	getUserAuditLogs: vi.fn().mockResolvedValue([]),
}))

beforeEach(() => {
	vi.clearAllMocks()
})

// Generate all authorization tests automatically from route metadata
createLoaderAuthTests({
	routePath: adminPath('/users/test-id'),
	metadata: handle,
	loaderFunction: (args) => loader({ ...args, params: { userId: 'test-id' } }),
})
