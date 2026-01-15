import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGroupStage } from '../group.server'

const { mockPrisma, mockTransactionClient } = vi.hoisted(() => {
  const mockTransactionClient = {
    groupStage: {
      create: vi.fn(),
    },
    group: {
      create: vi.fn(),
    },
    groupSlot: {
      createMany: vi.fn(),
    },
    team: {
      findMany: vi.fn(),
    },
  }

  const mockPrisma = {
    $transaction: vi.fn(),
  }

  return { mockPrisma, mockTransactionClient }
})

vi.mock('~/db.server', () => ({
  prisma: mockPrisma,
}))

describe('group.server - createGroupStage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.$transaction.mockImplementation(async callback =>
      callback(mockTransactionClient),
    )
  })

  it('should set createdBy when creating a group stage', async () => {
    mockTransactionClient.groupStage.create.mockResolvedValue({
      id: 'group-stage-123',
    })
    mockTransactionClient.group.create.mockResolvedValue({
      id: 'group-123',
    })
    mockTransactionClient.team.findMany.mockResolvedValue([])

    const result = await createGroupStage({
      tournamentId: 'tournament-123',
      name: 'Group Stage A',
      categories: ['JO8'],
      configGroups: 2,
      configSlots: 3,
      createdBy: 'user-123',
    })

    expect(mockTransactionClient.groupStage.create).toHaveBeenCalledWith({
      data: {
        tournamentId: 'tournament-123',
        name: 'Group Stage A',
        categories: JSON.stringify(['JO8']),
        configGroups: 2,
        configSlots: 3,
        autoFill: true,
        createdBy: 'user-123',
      },
    })
    expect(result).toBe('group-stage-123')
  })
})
