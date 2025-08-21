import { type Category } from '@prisma/client'

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
