import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTournament } from '../tournament.server'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    tournament: {
      create: vi.fn(),
    },
  },
}))

vi.mock('~/db.server', () => ({
  prisma: mockPrisma,
}))

describe('tournament.server - createTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a tournament with createdBy', async () => {
    const mockTournament = {
      id: 'tournament-123',
      name: 'Spring Cup',
      location: 'Amsterdam',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-02'),
      divisions: '["PREMIER_DIVISION"]',
      categories: '["JO8"]',
      createdBy: 'user-123',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    }

    mockPrisma.tournament.create.mockResolvedValue(mockTournament)

    const result = await createTournament({
      createdBy: 'user-123',
      name: 'Spring Cup',
      location: 'Amsterdam',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-02'),
      divisions: ['PREMIER_DIVISION'],
      categories: ['JO8'],
    })

    expect(mockPrisma.tournament.create).toHaveBeenCalledWith({
      data: {
        createdBy: 'user-123',
        name: 'Spring Cup',
        location: 'Amsterdam',
        divisions: JSON.stringify(['PREMIER_DIVISION']),
        categories: JSON.stringify(['JO8']),
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-02'),
      },
    })
    expect(result).toEqual(mockTournament)
  })
})
