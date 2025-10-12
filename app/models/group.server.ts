/* eslint-disable id-blacklist */
import { type Category } from '@prisma/client'

import { prisma } from '~/db.server'
import { safeParseJSON } from '~/utils/json'

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
  readonly tournamentId: string
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
      categories: JSON.stringify(categories), // Store as JSON string
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
    tournamentId: groupSet.tournamentId,
    categories: safeParseJSON<Category[]>(
      groupSet.categories,
      `getGroupSetById(${groupSetId})`,
      []
    ),
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
    categories: safeParseJSON<Category[]>(
      groupSet.categories,
      `getTournamentGroupSets(${tournamentId}) - groupSet ${groupSet.id}`,
      []
    ),
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

// --------------------------------------------------------------------------------------
// Group assignment utilities
// --------------------------------------------------------------------------------------

type AssignTeamToGroupSlotProps = {
  readonly groupSetId: string
  readonly groupId: string
  readonly slotIndex: number
  readonly teamId: string
}

/**
 * Assign a team to a specific group slot
 * - Validates the slot belongs to the given group and group set
 * - Ensures slot is empty (use clear or swap for occupied slots)
 * - Clears any previous assignment for teamId across the same group set
 */
export async function assignTeamToGroupSlot(
  props: Readonly<AssignTeamToGroupSlotProps>
): Promise<void> {
  const { groupSetId, groupId, slotIndex, teamId } = props

  await prisma.$transaction(async tx => {
    const slot = await tx.groupSlot.findFirst({
      where: { groupSetId, groupId, slotIndex },
      select: { id: true, teamId: true },
    })

    if (!slot) {
      throw new Error('Target slot not found for provided group')
    }

    if (slot.teamId) {
      throw new Error('Slot is occupied, clear or swap before assigning')
    }

    // Validate team and group set belong to the same tournament
    const [groupSet, team] = await Promise.all([
      tx.groupSet.findUnique({
        where: { id: groupSetId },
        select: { tournamentId: true },
      }),
      tx.team.findUnique({
        where: { id: teamId },
        select: { tournamentId: true },
      }),
    ])

    if (!groupSet) {
      throw new Error('Group set not found')
    }

    if (!team) {
      throw new Error('Team not found')
    }

    if (groupSet.tournamentId !== team.tournamentId) {
      throw new Error('Team and group set must belong to the same tournament')
    }

    // Clear any previous assignment of this team within the group set (including reserve)
    await tx.groupSlot.updateMany({
      where: { groupSetId, teamId },
      data: { teamId: null },
    })

    // Assign the team to the target slot
    await tx.groupSlot.update({
      where: { id: slot.id },
      data: { teamId },
    })
  })
}

type ClearGroupSlotProps = {
  readonly groupSlotId: string
}

/** Clear a specific group slot (set teamId to null) */
export async function clearGroupSlot(
  props: Readonly<ClearGroupSlotProps>
): Promise<void> {
  const { groupSlotId } = props
  await prisma.groupSlot.update({
    where: { id: groupSlotId },
    data: { teamId: null },
  })
}

type MoveTeamToReserveProps = {
  readonly groupSetId: string
  readonly teamId: string
}

/**
 * Move a team to reserve within a group set
 * - Clears any existing group assignment
 * - Creates a reserve slot (groupId null) for that team if not present
 */
export async function moveTeamToReserve(
  props: Readonly<MoveTeamToReserveProps>
): Promise<void> {
  const { groupSetId, teamId } = props

  await prisma.$transaction(async tx => {
    // Validate team and group set belong to the same tournament
    const [groupSet, team] = await Promise.all([
      tx.groupSet.findUnique({
        where: { id: groupSetId },
        select: { tournamentId: true },
      }),
      tx.team.findUnique({
        where: { id: teamId },
        select: { tournamentId: true },
      }),
    ])

    if (!groupSet) {
      throw new Error('Group set not found')
    }

    if (!team) {
      throw new Error('Team not found')
    }

    if (groupSet.tournamentId !== team.tournamentId) {
      throw new Error('Team and group set must belong to the same tournament')
    }

    // Clear any existing assignment (group or reserve)
    await tx.groupSlot.updateMany({
      where: { groupSetId, teamId },
      data: { teamId: null },
    })

    // Ensure a reserve slot exists for this team
    const existingReserve = await tx.groupSlot.findFirst({
      where: { groupSetId, teamId, groupId: null },
      select: { id: true },
    })

    if (existingReserve) {
      // Already exists (but cleared above), simply set teamId again
      await tx.groupSlot.update({
        where: { id: existingReserve.id },
        data: { teamId },
      })
    } else {
      await tx.groupSlot.create({
        data: {
          groupSetId,
          groupId: null,
          slotIndex: 0,
          teamId,
        },
      })
    }
  })
}

type SwapGroupSlotsProps = {
  readonly sourceSlotId: string
  readonly targetSlotId: string
}

/** Swap teams assigned between two slots atomically */
export async function swapGroupSlots(
  props: Readonly<SwapGroupSlotsProps>
): Promise<void> {
  const { sourceSlotId, targetSlotId } = props

  if (sourceSlotId === targetSlotId) return

  await prisma.$transaction(async tx => {
    const [source, target] = await Promise.all([
      tx.groupSlot.findUnique({
        where: { id: sourceSlotId },
        select: { teamId: true },
      }),
      tx.groupSlot.findUnique({
        where: { id: targetSlotId },
        select: { teamId: true },
      }),
    ])

    if (!source || !target) throw new Error('One of the slots was not found')

    const sourceTeamId = source.teamId
    const targetTeamId = target.teamId

    // Clear source first to satisfy unique(teamId) constraint when re-assigning
    await tx.groupSlot.update({
      where: { id: sourceSlotId },
      data: { teamId: null },
    })

    // Assign source team to target
    await tx.groupSlot.update({
      where: { id: targetSlotId },
      data: { teamId: sourceTeamId },
    })

    // Assign target team to source
    await tx.groupSlot.update({
      where: { id: sourceSlotId },
      data: { teamId: targetTeamId },
    })
  })
}
