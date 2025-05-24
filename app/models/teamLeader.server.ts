import type { TeamLeader } from '@prisma/client'

import { prisma } from '~/db.server'

export type { TeamLeader } from '@prisma/client'

// Get the default TeamLeader (for now, just get the first one)
export const getDefaultTeamLeader = async (): Promise<TeamLeader | null> => {
  const teamLeader = await prisma.teamLeader.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  return teamLeader
}

// Get a TeamLeader by ID
export const getTeamLeaderById = async (id: string): Promise<TeamLeader | null> =>
  prisma.teamLeader.findUnique({
    where: { id },
  })
