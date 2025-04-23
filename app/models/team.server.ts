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

export function getTeam({ id, userId }: { id: string; userId: string }) {
  return prisma.team?.findFirst({
    select: { id: true, teamClass: true, teamName: true },
    where: { id, userId },
  }) as Promise<Pick<TeamWithUser, 'id' | 'teamClass' | 'teamName'> | null>
}

export function getTeamListItems({ userId }: { userId: User['id'] }) {
  return prisma.team?.findMany({
    where: { userId },
    select: { id: true, teamName: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export function createTeam({
  teamClass,
  teamName,
  userId,
}: Pick<Team, 'teamClass' | 'teamName'> & {
  userId: User['id']
}) {
  return prisma.team.create({
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
}

export function deleteTeam({ id, userId }: Pick<Team, 'id'> & { userId: User['id'] }) {
  return prisma.team.deleteMany({
    where: { id, userId },
  })
}
