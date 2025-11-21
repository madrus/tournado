import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Prisma - use vi.hoisted() for objects referenced in mock factory
const { mockPrisma } = vi.hoisted(() => {
	const mockPrisma = {
		teamLeader: {
			findUnique: vi.fn(),
		},
	}
	return { mockPrisma }
})

vi.mock('~/db.server', () => ({
	prisma: mockPrisma,
}))

import { getTeamLeader } from '../team.server'

describe('team.server - getTeamLeader', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	const mockTeamLeader = {
		id: 'leader-123',
		email: 'john.doe@example.com',
		firstName: 'John',
		lastName: 'Doe',
		phone: '+31612345678',
	}

	it('should return team leader when found', async () => {
		mockPrisma.teamLeader.findUnique.mockResolvedValue(mockTeamLeader)

		const result = await getTeamLeader('leader-123')

		expect(mockPrisma.teamLeader.findUnique).toHaveBeenCalledWith({
			where: { id: 'leader-123' },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				phone: true,
			},
		})
		expect(result).toEqual(mockTeamLeader)
	})

	it('should return null when team leader not found', async () => {
		mockPrisma.teamLeader.findUnique.mockResolvedValue(null)

		const result = await getTeamLeader('nonexistent-id')

		expect(mockPrisma.teamLeader.findUnique).toHaveBeenCalledWith({
			where: { id: 'nonexistent-id' },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				phone: true,
			},
		})
		expect(result).toBeNull()
	})

	it('should handle database errors', async () => {
		const dbError = new Error('Database connection failed')
		mockPrisma.teamLeader.findUnique.mockRejectedValue(dbError)

		await expect(getTeamLeader('leader-123')).rejects.toThrow('Database connection failed')
	})

	it('should only select required fields', async () => {
		mockPrisma.teamLeader.findUnique.mockResolvedValue(mockTeamLeader)

		await getTeamLeader('leader-123')

		expect(mockPrisma.teamLeader.findUnique).toHaveBeenCalledWith({
			where: { id: 'leader-123' },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				phone: true,
			},
		})
	})
})
