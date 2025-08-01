import { beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest'

import type { TeamListItem } from '~/lib/lib.types'
import { getFilteredTeamListItems } from '~/models/team.server'
import {
  getAllTournamentListItems,
  type TournamentListItem,
} from '~/models/tournament.server'

import { loadTeamsAndTournamentsData } from '../dataLoaders'

// Mock the dependencies
vi.mock('~/models/tournament.server')
vi.mock('~/models/team.server')

const mockGetAllTournamentListItems = getAllTournamentListItems as MockedFunction<
  typeof getAllTournamentListItems
>
const mockGetFilteredTeamListItems = getFilteredTeamListItems as MockedFunction<
  typeof getFilteredTeamListItems
>

describe('dataLoaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadTeamsAndTournamentsData', () => {
    const mockTournamentListItems: TournamentListItem[] = [
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
      mockGetAllTournamentListItems.mockResolvedValue(mockTournamentListItems)
      mockGetFilteredTeamListItems.mockResolvedValue(mockTeamListItems)

      const request = createMockRequest()
      const result = await loadTeamsAndTournamentsData(request)

      expect(mockGetAllTournamentListItems).toHaveBeenCalledTimes(1)
      expect(mockGetFilteredTeamListItems).toHaveBeenCalledWith({
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

      mockGetAllTournamentListItems.mockResolvedValue(mockTournamentListItems)
      mockGetFilteredTeamListItems.mockResolvedValue(filteredTeams)

      const request = createMockRequest(tournamentId)
      const result = await loadTeamsAndTournamentsData(request)

      expect(mockGetAllTournamentListItems).toHaveBeenCalledTimes(1)
      expect(mockGetFilteredTeamListItems).toHaveBeenCalledWith({ tournamentId })
      expect(result).toEqual({
        teamListItems: filteredTeams,
        tournamentListItems: mockTournamentListItems,
        selectedTournamentId: tournamentId,
      })
    })

    it('should return empty arrays when no data is found', async () => {
      mockGetAllTournamentListItems.mockResolvedValue([])
      mockGetFilteredTeamListItems.mockResolvedValue([])

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
      mockGetAllTournamentListItems.mockRejectedValue(dbError)

      const request = createMockRequest()
      await expect(loadTeamsAndTournamentsData(request)).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle team loading errors gracefully', async () => {
      mockGetAllTournamentListItems.mockResolvedValue(mockTournamentListItems)
      const teamError = new Error('Failed to load teams')
      mockGetFilteredTeamListItems.mockRejectedValue(teamError)

      const request = createMockRequest()
      await expect(loadTeamsAndTournamentsData(request)).rejects.toThrow(
        'Failed to load teams'
      )
    })

    it('should call functions in parallel for performance', async () => {
      let tournamentsCallTime: number
      let teamsCallTime: number

      mockGetAllTournamentListItems.mockImplementation(async () => {
        tournamentsCallTime = Date.now()
        await new Promise(resolve => setTimeout(resolve, 10))
        return mockTournamentListItems
      })

      mockGetFilteredTeamListItems.mockImplementation(async () => {
        teamsCallTime = Date.now()
        await new Promise(resolve => setTimeout(resolve, 10))
        return mockTeamListItems
      })

      const request = createMockRequest()
      await loadTeamsAndTournamentsData(request)

      // Both calls should start roughly at the same time (within 5ms)
      expect(Math.abs(tournamentsCallTime! - teamsCallTime!)).toBeLessThan(5)
    })

    describe('edge cases', () => {
      it('should handle null tournament data', async () => {
        mockGetAllTournamentListItems.mockResolvedValue(
          null as unknown as TournamentListItem[]
        )
        mockGetFilteredTeamListItems.mockResolvedValue(mockTeamListItems)

        const request = createMockRequest()
        const result = await loadTeamsAndTournamentsData(request)

        expect(result.tournamentListItems).toBe(null)
        expect(result.teamListItems).toEqual(mockTeamListItems)
      })

      it('should handle null team data', async () => {
        mockGetAllTournamentListItems.mockResolvedValue(mockTournamentListItems)
        mockGetFilteredTeamListItems.mockResolvedValue(
          null as unknown as TeamListItem[]
        )

        const request = createMockRequest()
        const result = await loadTeamsAndTournamentsData(request)

        expect(result.tournamentListItems).toEqual(mockTournamentListItems)
        expect(result.teamListItems).toBe(null)
      })

      it('should handle empty string tournamentId', async () => {
        mockGetAllTournamentListItems.mockResolvedValue(mockTournamentListItems)
        mockGetFilteredTeamListItems.mockResolvedValue([])

        const request = createMockRequest('')
        const result = await loadTeamsAndTournamentsData(request)

        expect(mockGetFilteredTeamListItems).toHaveBeenCalledWith({
          tournamentId: undefined,
        })
        expect(result).toEqual({
          teamListItems: [],
          tournamentListItems: mockTournamentListItems,
          selectedTournamentId: undefined,
        })
      })

      it('should handle malformed URLs gracefully', async () => {
        mockGetAllTournamentListItems.mockResolvedValue(mockTournamentListItems)
        mockGetFilteredTeamListItems.mockResolvedValue(mockTeamListItems)

        // Test with multiple tournament parameters
        const request = new Request(
          'http://localhost:3000/teams?tournament=1&tournament=2'
        )
        const result = await loadTeamsAndTournamentsData(request)

        // Should use the first tournament parameter
        expect(mockGetFilteredTeamListItems).toHaveBeenCalledWith({ tournamentId: '1' })
        expect(result.selectedTournamentId).toBe('1')
      })
    })
  })
})
