import { prisma } from '@/db.server'
import type { TeamLeader } from '@prisma/client'

export type { TeamLeader } from '@prisma/client'

// Get the default TeamLeader (for now, just get the first one)
export const getDefaultTeamLeader = async (): Promise<TeamLeader | null> =>
  prisma.teamLeader.findFirst({
    orderBy: { createdAt: 'asc' },
  })

// Get a TeamLeader by ID
export const getTeamLeaderById = async (id: string): Promise<TeamLeader | null> =>
  prisma.teamLeader.findUnique({
    where: { id },
  })
