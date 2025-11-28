import { beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest'

import type { TeamListItem } from '~/features/teams/types'
import { getFilteredTeams } from '~/models/team.server'
import { getAllTournaments, type TournamentListItem } from '~/models/tournament.server'

import { loadTeamsAndTournamentsData } from '../dataLoaders'

// Mock the dependencies
vi.mock('~/models/tournament.server')
vi.mock('~/models/team.server')

const mockGetAllTournaments = getAllTournaments as MockedFunction<
	typeof getAllTournaments
>
const mockGetFilteredTeams = getFilteredTeams as MockedFunction<typeof getFilteredTeams>

describe('dataLoaders', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('loadTeamsAndTournamentsData', () => {
		// Mock data from server (with Date objects)
		const mockTournamentListItemsRaw: TournamentListItem[] = [
			{
				id: 'tournament-1',
				name: 'Spring Tournament 2024',
				location: 'Amsterdam',
				startDate: new Date('2024-03-01'),
				endDate: new Date('2024-03-03'),
			},
			{
				id: 'tournament-2',
				name: 'Summer Cup 2024',
				location: 'Rotterdam',
				startDate: new Date('2024-06-15'),
				endDate: new Date('2024-06-17'),
			},
		]

		// Expected data after serialization (with ISO string dates)
		const mockTournamentListItems = [
			{
				id: 'tournament-1',
				name: 'Spring Tournament 2024',
				location: 'Amsterdam',
				startDate: '2024-03-01T00:00:00.000Z',
				endDate: '2024-03-03T00:00:00.000Z',
			},
			{
				id: 'tournament-2',
				name: 'Summer Cup 2024',
				location: 'Rotterdam',
				startDate: '2024-06-15T00:00:00.000Z',
				endDate: '2024-06-17T00:00:00.000Z',
			},
		]

		const mockTeamListItems: TeamListItem[] = [
			{
				id: 'team-1',
				name: 'Team A',
				clubName: 'Ajax',
				category: 'JO8',
			},
			{
				id: 'team-2',
				name: 'Team B',
				clubName: 'Feyenoord',
				category: 'JO10',
			},
			{
				id: 'team-3',
				name: 'Team C',
				clubName: 'PSV',
				category: 'MO8',
			},
		]

		const createMockRequest = (tournamentId?: string): Request => {
			const url = tournamentId
				? `http://localhost:3000/teams?tournament=${tournamentId}`
				: 'http://localhost:3000/teams'
			return new Request(url)
		}

		it('should load all data when no tournamentId filter is provided', async () => {
			mockGetAllTournaments.mockResolvedValue(mockTournamentListItemsRaw)
			mockGetFilteredTeams.mockResolvedValue(mockTeamListItems)

			const request = createMockRequest()
			const result = await loadTeamsAndTournamentsData(request)

			expect(mockGetAllTournaments).toHaveBeenCalledTimes(1)
			expect(mockGetFilteredTeams).toHaveBeenCalledWith({
				tournamentId: undefined,
			})
			expect(result).toEqual({
				teamListItems: mockTeamListItems,
				tournamentListItems: mockTournamentListItems,
				selectedTournamentId: undefined,
			})
		})

		it('should load filtered data when tournamentId is provided', async () => {
			const tournamentId = 'tournament-1'
			const filteredTeams = mockTeamListItems.filter((_, index) => index < 2) // First 2 teams

			mockGetAllTournaments.mockResolvedValue(mockTournamentListItemsRaw)
			mockGetFilteredTeams.mockResolvedValue(filteredTeams)

			const request = createMockRequest(tournamentId)
			const result = await loadTeamsAndTournamentsData(request)

			expect(mockGetAllTournaments).toHaveBeenCalledTimes(1)
			expect(mockGetFilteredTeams).toHaveBeenCalledWith({ tournamentId })
			expect(result).toEqual({
				teamListItems: filteredTeams,
				tournamentListItems: mockTournamentListItems,
				selectedTournamentId: tournamentId,
			})
		})

		it('should return empty arrays when no data is found', async () => {
			mockGetAllTournaments.mockResolvedValue([])
			mockGetFilteredTeams.mockResolvedValue([])

			const request = createMockRequest()
			const result = await loadTeamsAndTournamentsData(request)

			expect(result).toEqual({
				teamListItems: [],
				tournamentListItems: [],
				selectedTournamentId: undefined,
			})
		})

		it('should handle database errors gracefully', async () => {
			const dbError = new Error('Database connection failed')
			mockGetAllTournaments.mockRejectedValue(dbError)

			const request = createMockRequest()
			await expect(loadTeamsAndTournamentsData(request)).rejects.toThrow(
				'Database connection failed',
			)
		})

		it('should handle team loading errors gracefully', async () => {
			mockGetAllTournaments.mockResolvedValue(mockTournamentListItemsRaw)
			const teamError = new Error('Failed to load teams')
			mockGetFilteredTeams.mockRejectedValue(teamError)

			const request = createMockRequest()
			await expect(loadTeamsAndTournamentsData(request)).rejects.toThrow(
				'Failed to load teams',
			)
		})

		it('should call functions in parallel for performance', async () => {
			let tournamentsCallTime: number = 0
			let teamsCallTime: number = 0

			mockGetAllTournaments.mockImplementation(async () => {
				tournamentsCallTime = Date.now()
				await new Promise((resolve) => setTimeout(resolve, 10))
				return mockTournamentListItemsRaw
			})

			mockGetFilteredTeams.mockImplementation(async () => {
				teamsCallTime = Date.now()
				await new Promise((resolve) => setTimeout(resolve, 10))
				return mockTeamListItems
			})

			const request = createMockRequest()
			await loadTeamsAndTournamentsData(request)

			// Both calls should start roughly at the same time (within 5ms)
			expect(tournamentsCallTime).toBeDefined()
			expect(teamsCallTime).toBeDefined()
			expect(Math.abs(tournamentsCallTime - teamsCallTime)).toBeLessThan(5)
		})

		describe('edge cases', () => {
			it('should handle null tournament data', async () => {
				mockGetAllTournaments.mockResolvedValue(null as unknown as TournamentListItem[])
				mockGetFilteredTeams.mockResolvedValue(mockTeamListItems)

				const request = createMockRequest()
				const result = await loadTeamsAndTournamentsData(request)

				expect(result.tournamentListItems).toBe(null)
				expect(result.teamListItems).toEqual(mockTeamListItems)
			})

			it('should handle null team data', async () => {
				mockGetAllTournaments.mockResolvedValue(mockTournamentListItemsRaw)
				mockGetFilteredTeams.mockResolvedValue(null as unknown as TeamListItem[])

				const request = createMockRequest()
				const result = await loadTeamsAndTournamentsData(request)

				expect(result.tournamentListItems).toEqual(mockTournamentListItems)
				expect(result.teamListItems).toBe(null)
			})

			it('should handle empty string tournamentId', async () => {
				mockGetAllTournaments.mockResolvedValue(mockTournamentListItemsRaw)
				mockGetFilteredTeams.mockResolvedValue([])

				const request = createMockRequest('')
				const result = await loadTeamsAndTournamentsData(request)

				expect(mockGetFilteredTeams).toHaveBeenCalledWith({
					tournamentId: undefined,
				})
				expect(result).toEqual({
					teamListItems: [],
					tournamentListItems: mockTournamentListItems,
					selectedTournamentId: undefined,
				})
			})

			it('should handle malformed URLs gracefully', async () => {
				mockGetAllTournaments.mockResolvedValue(mockTournamentListItemsRaw)
				mockGetFilteredTeams.mockResolvedValue(mockTeamListItems)

				// Test with multiple tournament parameters
				const request = new Request(
					'http://localhost:3000/teams?tournament=1&tournament=2',
				)
				const result = await loadTeamsAndTournamentsData(request)

				// Should use the first tournament parameter
				expect(mockGetFilteredTeams).toHaveBeenCalledWith({
					tournamentId: '1',
				})
				expect(result.selectedTournamentId).toBe('1')
			})
		})
	})
})
