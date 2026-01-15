import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGroupStage, deleteGroupStage } from '../group.server'

const { mockPrisma, mockTransactionClient } = vi.hoisted(() => {
  const mockTransactionClient = {
    groupStage: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    group: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    groupSlot: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    team: {
      deleteMany: vi.fn(),
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

describe('group.server - deleteGroupStage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.$transaction.mockImplementation(async callback =>
      callback(mockTransactionClient),
    )
  })

  it('deletes group slots, groups, and group stage, returning counts', async () => {
    mockTransactionClient.groupSlot.deleteMany.mockResolvedValue({ count: 4 })
    mockTransactionClient.group.deleteMany.mockResolvedValue({ count: 2 })
    mockTransactionClient.groupStage.delete.mockResolvedValue({
      id: 'group-stage-123',
    })

    const result = await deleteGroupStage('group-stage-123')

    expect(mockTransactionClient.groupSlot.deleteMany).toHaveBeenCalledWith({
      where: { groupStageId: 'group-stage-123' },
    })
    expect(mockTransactionClient.group.deleteMany).toHaveBeenCalledWith({
      where: { groupStageId: 'group-stage-123' },
    })
    expect(mockTransactionClient.groupStage.delete).toHaveBeenCalledWith({
      where: { id: 'group-stage-123' },
    })
    expect(mockTransactionClient.team.deleteMany).not.toHaveBeenCalled()
    expect(result).toEqual({ groupsDeleted: 2, slotsDeleted: 4 })

    const slotCallOrder =
      mockTransactionClient.groupSlot.deleteMany.mock.invocationCallOrder[0]
    const groupCallOrder =
      mockTransactionClient.group.deleteMany.mock.invocationCallOrder[0]
    const stageCallOrder =
      mockTransactionClient.groupStage.delete.mock.invocationCallOrder[0]

    expect(slotCallOrder).toBeLessThan(groupCallOrder)
    expect(groupCallOrder).toBeLessThan(stageCallOrder)
  })

  it('rolls back when deletion fails', async () => {
    mockTransactionClient.groupSlot.deleteMany.mockRejectedValue(
      new Error('delete failed'),
    )

    await expect(deleteGroupStage('group-stage-123')).rejects.toThrow('delete failed')

    expect(mockTransactionClient.group.deleteMany).not.toHaveBeenCalled()
    expect(mockTransactionClient.groupStage.delete).not.toHaveBeenCalled()
  })
})
