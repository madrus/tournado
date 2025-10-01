/* eslint-disable id-blacklist */
import { type Category } from '@prisma/client'

import { prisma } from '~/db.server'

// Re-export types for client-side usage
export type GroupSlotTeam = {
  readonly id: string
  readonly name: string
  readonly clubName: string
  readonly category: Category
}

export type GroupSlotWithTeam = {
  readonly id: string
  readonly slotIndex: number
  readonly team: GroupSlotTeam | null
}

export type ReserveSlotWithTeam = {
  readonly id: string
  readonly team: GroupSlotTeam | null
}

export type GroupWithSlots = {
  readonly id: string
  readonly name: string
  readonly order: number
  readonly slots: readonly GroupSlotWithTeam[]
}

export type GroupSetWithDetails = {
  readonly id: string
  readonly name: string
  readonly categories: readonly Category[]
  readonly configGroups: number
  readonly configSlots: number
  readonly autoFill: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly groups: readonly GroupWithSlots[]
  readonly reserveSlots: readonly ReserveSlotWithTeam[]
}

export type GroupSetListItem = {
  readonly id: string
  readonly name: string
  readonly categories: readonly Category[]
  readonly configGroups: number
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

export type CreateGroupSetParams = {
  readonly tournamentId: string
  readonly name: string
  readonly categories: readonly Category[]
  readonly configGroups: number
  readonly configSlots: number
  readonly autoFill?: boolean
}

// Server-side functions
export async function createGroupSet({
  tournamentId,
  name,
  categories,
  configGroups,
  configSlots,
  autoFill = true,
}: CreateGroupSetParams): Promise<string> {
  // Create the GroupSet
  const groupSet = await prisma.groupSet.create({
    data: {
      tournamentId,
      name,
      categories: categories as Category[], // JSON field
      configGroups,
      configSlots,
      autoFill,
    },
  })

  // Create groups (Group A, Group B, etc.)
  const groups = []
  for (let i = 0; i < configGroups; i++) {
    const charCode = 65 + i // Start from 'A' (ASCII 65)
    const groupName = 'Group ' + String.fromCharCode(charCode) // A, B, C, etc.
    const group = await prisma.group.create({
      data: {
        groupSetId: groupSet.id,
        name: groupName,
        order: i,
      },
    })
    groups.push(group)

    // Create slots for this group
    for (let slotIndex = 0; slotIndex < configSlots; slotIndex++) {
      await prisma.groupSlot.create({
        data: {
          groupSetId: groupSet.id,
          groupId: group.id,
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
        groupSlot: null, // Only teams not already assigned to any group
      },
    })

    // Create reserve slots for matching teams
    for (const team of matchingTeams) {
      await prisma.groupSlot.create({
        data: {
          groupSetId: groupSet.id,
          groupId: null, // Reserve slot
          slotIndex: 0, // Reserve doesn't need ordering
          teamId: team.id,
        },
      })
    }
  }

  return groupSet.id
}

export async function getGroupSetWithDetails(
  groupSetId: string
): Promise<GroupSetWithDetails | null> {
  const groupSet = await prisma.groupSet.findUnique({
    where: { id: groupSetId },
    include: {
      groups: {
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
      groupSlots: {
        where: { groupId: null }, // Reserve slots
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

  if (!groupSet) return null

  return {
    id: groupSet.id,
    name: groupSet.name,
    categories: groupSet.categories as Category[],
    configGroups: groupSet.configGroups,
    configSlots: groupSet.configSlots,
    autoFill: groupSet.autoFill,
    createdAt: groupSet.createdAt,
    updatedAt: groupSet.updatedAt,
    groups: groupSet.groups,
    reserveSlots: groupSet.groupSlots,
  }
}

export async function getTournamentGroupSets(
  tournamentId: string
): Promise<readonly GroupSetListItem[]> {
  const groupSets = await prisma.groupSet.findMany({
    where: { tournamentId },
    select: {
      id: true,
      name: true,
      categories: true,
      configGroups: true,
      configSlots: true,
      autoFill: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return groupSets.map(groupSet => ({
    ...groupSet,
    categories: groupSet.categories as Category[],
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
      groupSlot: null, // Only unassigned teams
    },
    select: {
      id: true,
      name: true,
      clubName: true,
      category: true,
    },
    orderBy: [{ category: 'asc' }, { clubName: 'asc' }, { name: 'asc' }],
  })
