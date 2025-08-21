/* eslint-disable id-blacklist */
import { type Category } from '@prisma/client'

import { prisma } from '~/db.server'

export type PoolSlotTeam = {
  readonly id: string
  readonly name: string
  readonly clubName: string
  readonly category: Category
}

export type PoolSlotWithTeam = {
  readonly id: string
  readonly slotIndex: number
  readonly team: PoolSlotTeam | null
}

export type ReserveSlotWithTeam = {
  readonly id: string
  readonly team: PoolSlotTeam | null
}

export type PoolWithSlots = {
  readonly id: string
  readonly name: string
  readonly order: number
  readonly slots: readonly PoolSlotWithTeam[]
}

export type PoolSetWithDetails = {
  readonly id: string
  readonly name: string
  readonly categories: readonly Category[]
  readonly configPools: number
  readonly configSlots: number
  readonly autoFill: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly pools: readonly PoolWithSlots[]
  readonly reserveSlots: readonly ReserveSlotWithTeam[]
}

export type PoolSetListItem = {
  readonly id: string
  readonly name: string
  readonly categories: readonly Category[]
  readonly configPools: number
  readonly configSlots: number
  readonly autoFill: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type UnassignedTeam = {
  readonly id: string
  readonly name: string
  readonly clubName: string
  readonly category: Category
}

export type CreatePoolSetParams = {
  readonly tournamentId: string
  readonly name: string
  readonly categories: readonly Category[]
  readonly configPools: number
  readonly configSlots: number
  readonly autoFill?: boolean
}

export async function createPoolSet({
  tournamentId,
  name,
  categories,
  configPools,
  configSlots,
  autoFill = true,
}: CreatePoolSetParams): Promise<string> {
  // Create the PoolSet
  const poolSet = await prisma.poolSet.create({
    data: {
      tournamentId,
      name,
      categories: categories as Category[], // JSON field
      configPools,
      configSlots,
      autoFill,
    },
  })

  // Create pools (Pool A, Pool B, etc.)
  const pools = []
  for (let i = 0; i < configPools; i++) {
    const poolName = `Pool ${String.fromCharCode(65 + i)}` // A, B, C, etc.
    const pool = await prisma.pool.create({
      data: {
        poolSetId: poolSet.id,
        name: poolName,
        order: i,
      },
    })
    pools.push(pool)

    // Create slots for this pool
    for (let slotIndex = 0; slotIndex < configSlots; slotIndex++) {
      await prisma.poolSlot.create({
        data: {
          poolSetId: poolSet.id,
          poolId: pool.id,
          slotIndex,
        },
      })
    }
  }

  // If autoFill is enabled, find teams matching the categories and assign them to Reserve
  if (autoFill) {
    const matchingTeams = await prisma.team.findMany({
      where: {
        tournamentId,
        category: { in: [...categories] },
        poolSlot: null, // Only teams not already assigned to any pool
      },
    })

    // Create reserve slots for matching teams
    for (const team of matchingTeams) {
      await prisma.poolSlot.create({
        data: {
          poolSetId: poolSet.id,
          poolId: null, // Reserve slot
          slotIndex: 0, // Reserve doesn't need ordering
          teamId: team.id,
        },
      })
    }
  }

  return poolSet.id
}

export async function getPoolSetWithDetails(
  poolSetId: string
): Promise<PoolSetWithDetails | null> {
  const poolSet = await prisma.poolSet.findUnique({
    where: { id: poolSetId },
    include: {
      pools: {
        include: {
          slots: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  clubName: true,
                  category: true,
                },
              },
            },
            orderBy: { slotIndex: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      poolSlots: {
        where: { poolId: null }, // Reserve slots
        include: {
          team: {
            select: {
              id: true,
              name: true,
              clubName: true,
              category: true,
            },
          },
        },
      },
    },
  })

  if (!poolSet) return null

  return {
    id: poolSet.id,
    name: poolSet.name,
    categories: poolSet.categories as Category[],
    configPools: poolSet.configPools,
    configSlots: poolSet.configSlots,
    autoFill: poolSet.autoFill,
    createdAt: poolSet.createdAt,
    updatedAt: poolSet.updatedAt,
    pools: poolSet.pools,
    reserveSlots: poolSet.poolSlots,
  }
}

export async function getTournamentPoolSets(
  tournamentId: string
): Promise<readonly PoolSetListItem[]> {
  const poolSets = await prisma.poolSet.findMany({
    where: { tournamentId },
    select: {
      id: true,
      name: true,
      categories: true,
      configPools: true,
      configSlots: true,
      autoFill: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return poolSets.map(poolSet => ({
    ...poolSet,
    categories: poolSet.categories as Category[],
  }))
}

export const getTeamsByCategories = async (
  tournamentId: string,
  categories: readonly Category[]
): Promise<readonly UnassignedTeam[]> =>
  await prisma.team.findMany({
    where: {
      tournamentId,
      category: { in: [...categories] },
      poolSlot: null, // Only unassigned teams
    },
    select: {
      id: true,
      name: true,
      clubName: true,
      category: true,
    },
    orderBy: [{ category: 'asc' }, { clubName: 'asc' }, { name: 'asc' }],
  })
