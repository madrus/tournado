import type { Prisma, Team, TeamLeader } from '@prisma/client'
import { prisma } from '~/db.server'
import type { TeamWithLeaderFull } from '~/features/teams/types'
import { sortTeams } from '~/lib/lib.helpers'

export type { Team } from '@prisma/client'

export type TeamWithLeader = Team & {
	teamLeader: Pick<TeamLeader, 'id' | 'email'>
}

// Define types using Prisma.Args utility
// These types are kept for future use when we need to work with full team and leader payloads

export const getTeam = ({
	id,
}: {
	id: string
}): Promise<Pick<TeamWithLeader, 'id' | 'name' | 'division' | 'category'> | null> =>
	prisma.team.findFirst({
		select: { id: true, name: true, division: true, category: true },
		where: { id },
	}) as Promise<Pick<TeamWithLeader, 'id' | 'name' | 'division' | 'category'> | null>

export const getTeamById = ({
	id,
}: {
	id: string
}): Promise<TeamWithLeaderFull | null> =>
	prisma.team.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			clubName: true,
			division: true,
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
			createdAt: true,
			updatedAt: true,
		},
	})

export const getTeams = async ({
	teamLeaderId,
}: {
	teamLeaderId: TeamLeader['id']
}): Promise<Array<Pick<Team, 'id' | 'name' | 'clubName'>>> =>
	prisma.team.findMany({
		where: { teamLeaderId },
		select: {
			id: true,
			name: true,
			clubName: true,
		},
		orderBy: { updatedAt: 'desc' },
	})

export const getAllTeams = async (): Promise<
	Array<Pick<Team, 'id' | 'name' | 'clubName'>>
> =>
	prisma.team.findMany({
		select: {
			id: true,
			name: true,
			clubName: true,
		},
		orderBy: { updatedAt: 'desc' },
	})

export const getFilteredTeams = async ({
	tournamentId,
}: {
	tournamentId?: string
} = {}): Promise<Array<Pick<Team, 'id' | 'name' | 'clubName' | 'category'>>> => {
	const whereClause = tournamentId ? { tournamentId } : {}

	const teams = await prisma.team.findMany({
		where: whereClause,
		select: {
			id: true,
			name: true,
			clubName: true,
			category: true,
		},
	})

	return sortTeams(teams)
}

export const createTeam = async ({
	name,
	clubName,
	division,
	category,
	teamLeaderId,
	tournamentId,
}: Pick<Team, 'name' | 'clubName' | 'division' | 'category'> & {
	teamLeaderId: TeamLeader['id']
	tournamentId: string
}): Promise<Team> =>
	prisma.team.create({
		data: {
			name,
			clubName,
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

export const getTeamLeader = async (
	teamLeaderId: string,
): Promise<TeamWithLeaderFull['teamLeader'] | null> =>
	prisma.teamLeader.findUnique({
		where: { id: teamLeaderId },
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			phone: true,
		},
	})
