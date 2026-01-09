import type { TournamentData } from '~/features/tournaments/types'

type TournamentRaw = {
	id: string
	name: string
	location: string
	divisions: string | string[]
	categories: string | string[]
	startDate: Date | string
	endDate: Date | string | null | undefined
}

const parseTournamentList = (value: string | string[]): string[] => {
	if (Array.isArray(value)) return value
	if (!value) return []
	try {
		const parsed = JSON.parse(value)
		return Array.isArray(parsed)
			? parsed.filter((item): item is string => typeof item === 'string')
			: []
	} catch {
		return []
	}
}

const toIsoString = (value: Date | string): string =>
	value instanceof Date ? value.toISOString() : value

const toOptionalIsoString = (value: Date | string | null | undefined): string | null =>
	value ? toIsoString(value) : null

export function transformTournamentData(tournament: TournamentRaw): TournamentData {
	return {
		id: tournament.id,
		name: tournament.name,
		location: tournament.location,
		startDate: toIsoString(tournament.startDate),
		endDate: toOptionalIsoString(tournament.endDate),
		divisions: parseTournamentList(tournament.divisions),
		categories: parseTournamentList(tournament.categories),
	}
}
