/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '@/db.server'
import type { Prisma, Team, User } from '@prisma/client'

export type { Team } from '@prisma/client'

export type TeamWithUser = Team & {
  user: Pick<User, 'id' | 'email'>
}

// Define types using Prisma.Args utility
type TeamPayload = Prisma.TeamGetPayload<{
  include: { user: true }
}>

type UserPayload = Prisma.UserGetPayload<{
  select: { id: true; email: true }
}>

export const getTeam = ({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<Pick<TeamWithUser, 'id' | 'teamClass' | 'teamName'> | null> =>
  prisma.team?.findFirst({
    select: { id: true, teamClass: true, teamName: true },
    where: { id, userId },
  }) as Promise<Pick<TeamWithUser, 'id' | 'teamClass' | 'teamName'> | null>

export const getTeamListItems = async ({
  userId,
}: {
  userId: User['id']
}): Promise<Array<Pick<Team, 'id' | 'teamName'>>> =>
  prisma.team.findMany({
    where: { userId },
    select: { id: true, teamName: true },
    orderBy: { updatedAt: 'desc' },
  })

export const createTeam = async ({
  teamName,
  teamClass,
  userId,
}: Pick<Team, 'teamName' | 'teamClass'> & {
  userId: User['id']
}): Promise<Team> =>
  prisma.team.create({
    // eslint-disable-next-line id-blacklist
    data: {
      teamName,
      teamClass,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })

export const deleteTeam = ({
  id,
  userId,
}: Pick<Team, 'id'> & { userId: User['id'] }): Promise<Prisma.BatchPayload> =>
  prisma.team.deleteMany({
    where: { id, userId },
  })
