// This file is kept for backward compatibility but now only exports types
// Server-side functions have been moved to group.server-only.ts
// Client-safe types are available in group.types.ts

export type {
  CreateGroupSetParams,
  GroupSetListItem,
  GroupSetWithDetails,
  GroupSlotTeam,
  GroupSlotWithTeam,
  GroupWithSlots,
  ReserveSlotWithTeam,
  UnassignedTeam,
} from './group.types'
