/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Prisma, Team, TeamLeader } from '@prisma/client'

import { prisma } from '~/db.server'

export type { Team } from '@prisma/client'

export type TeamWithLeader = Team & {
  teamLeader: Pick<TeamLeader, 'id' | 'email'>
}

// Define types using Prisma.Args utility
type TeamPayload = Prisma.TeamGetPayload<{
  include: { teamLeader: true }
}>

type LeaderPayload = Prisma.TeamLeaderGetPayload<{
  select: { id: true; email: true }
}>

export const getTeam = ({
  id,
  teamLeaderId,
}: {
  id: string
  teamLeaderId: string
}): Promise<Pick<TeamWithLeader, 'id' | 'teamClass' | 'teamName'> | null> =>
  prisma.team.findFirst({
    select: { id: true, teamClass: true, teamName: true },
    where: { id },
  }) as Promise<Pick<TeamWithLeader, 'id' | 'teamClass' | 'teamName'> | null>

export const getTeamListItems = async ({
  teamLeaderId,
}: {
  teamLeaderId: TeamLeader['id']
}): Promise<Array<Pick<Team, 'id' | 'teamName'>>> =>
  prisma.team.findMany({
    where: { teamLeaderId },
    select: {
      id: true,
      teamName: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

export const createTeam = async ({
  teamName,
  teamClass,
  teamLeaderId,
  tournamentId,
}: Pick<Team, 'teamName' | 'teamClass'> & {
  teamLeaderId: TeamLeader['id']
  tournamentId: string
}): Promise<Team> =>
  prisma.team.create({
    // eslint-disable-next-line id-blacklist
    data: {
      teamName,
      teamClass,
      teamLeaderId,
      tournamentId,
    },
  })

export const deleteTeam = ({
  id,
  teamLeaderId,
}: Pick<Team, 'id'> & {
  teamLeaderId: TeamLeader['id']
}): Promise<Prisma.BatchPayload> =>
  prisma.team.deleteMany({
    where: { id, teamLeaderId },
  })
