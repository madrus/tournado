/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Prisma, Team, TeamLeader } from '@prisma/client'

import { prisma } from '~/db.server'
import { sortTeams } from '~/lib/lib.helpers'
import type { TeamWithLeaderFull } from '~/lib/lib.types'

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
}): Promise<Pick<TeamWithLeader, 'id' | 'division' | 'teamName' | 'category'> | null> =>
  prisma.team.findFirst({
    select: { id: true, division: true, teamName: true, category: true },
    where: { id },
  }) as Promise<Pick<
    TeamWithLeader,
    'id' | 'division' | 'teamName' | 'category'
  > | null>

export const getTeamById = ({
  id,
}: {
  id: string
}): Promise<TeamWithLeaderFull | null> =>
  prisma.team.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      clubName: true,
      division: true,
      teamName: true,
      tournamentId: true,
      teamLeaderId: true,
      category: true,
      teamLeader: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  })

export const getTeamListItems = async ({
  teamLeaderId,
}: {
  teamLeaderId: TeamLeader['id']
}): Promise<Array<Pick<Team, 'id' | 'clubName' | 'teamName'>>> =>
  prisma.team.findMany({
    where: { teamLeaderId },
    select: {
      id: true,
      clubName: true,
      teamName: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

export const getAllTeamListItems = async (): Promise<
  Array<Pick<Team, 'id' | 'clubName' | 'teamName'>>
> =>
  prisma.team.findMany({
    select: {
      id: true,
      clubName: true,
      teamName: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

export const getFilteredTeamListItems = async ({
  tournamentId,
}: {
  tournamentId?: string
} = {}): Promise<Array<Pick<Team, 'id' | 'clubName' | 'teamName' | 'category'>>> => {
  const whereClause = tournamentId ? { tournamentId } : {}

  const teams = await prisma.team.findMany({
    where: whereClause,
    select: {
      id: true,
      clubName: true,
      teamName: true,
      category: true,
    },
  })

  return sortTeams(teams)
}

export const createTeam = async ({
  clubName,
  teamName,
  division,
  category,
  teamLeaderId,
  tournamentId,
}: Pick<Team, 'clubName' | 'teamName' | 'division' | 'category'> & {
  teamLeaderId: TeamLeader['id']
  tournamentId: string
}): Promise<Team> =>
  prisma.team.create({
    // eslint-disable-next-line id-blacklist
    data: {
      clubName,
      teamName,
      division,
      category,
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

export const deleteTeamById = ({ id }: Pick<Team, 'id'>): Promise<Team> =>
  prisma.team.delete({
    where: { id },
  })
