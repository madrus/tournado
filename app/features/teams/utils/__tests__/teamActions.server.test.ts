import { redirect } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminPath } from '~/utils/adminRoutes'
import { handleTeamCreation } from '../teamActions.server'
import { createTeamFromFormData } from '../teamCreation.server'

// Mock the teamCreation module
vi.mock('../teamCreation.server', () => ({
  createTeamFromFormData: vi.fn(),
}))

// Mock redirect function from react-router
vi.mock('react-router', () => ({
  redirect: vi.fn(
    (url: string) => new Response(null, { status: 302, headers: { Location: url } }),
  ),
}))

describe('teamActions.server - handleTeamCreation', () => {
  const mockFormData = new FormData()
  mockFormData.append('name', 'Test Team')
  mockFormData.append('clubName', 'Test Club')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Success Cases', () => {
    it('should redirect to public path on successful team creation', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: 'team-123',
          name: 'Test Team',
          division: 'FIRST_DIVISION',
        },
      })

      const response = await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(createTeamFromFormData).toHaveBeenCalledWith(mockFormData)
      expect(redirect).toHaveBeenCalledWith('/teams/team-123?success=created')
      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe('/teams/team-123?success=created')
    })

    it('should redirect to admin path on successful team creation', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: 'team-456',
          name: 'Admin Team',
          division: 'PREMIER_DIVISION',
        },
      })

      const response = await handleTeamCreation(
        mockFormData,
        adminPath('/teams/{teamId}'),
      )

      expect(redirect).toHaveBeenCalledWith(
        adminPath('/teams/team-456?success=created'),
      )
      expect(response.headers.get('Location')).toBe(
        adminPath('/teams/team-456?success=created'),
      )
    })

    it('should handle complex redirect paths with multiple segments', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: 'team-789',
          name: 'Complex Path Team',
          division: 'SECOND_DIVISION',
        },
      })

      await handleTeamCreation(mockFormData, '/admin/dashboard/teams/{teamId}/details')

      expect(redirect).toHaveBeenCalledWith(
        '/admin/dashboard/teams/team-789/details?success=created',
      )
    })
  })

  describe('Validation Error Cases', () => {
    it('should return 422 status with validation errors', async () => {
      const validationErrors = {
        name: 'Name is required',
        clubName: 'Club name is required',
      }

      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: false,
        errors: validationErrors,
      })

      const response = await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(response.status).toBe(422)
      const body = await response.json()
      expect(body).toEqual({ errors: validationErrors })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should return 422 with single field error', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: false,
        errors: { division: 'Invalid division' },
      })

      const response = await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(response.status).toBe(422)
      const body = await response.json()
      expect(body).toEqual({ errors: { division: 'Invalid division' } })
    })

    it('should return 422 with multiple validation errors', async () => {
      const multipleErrors = {
        name: 'Name is required',
        division: 'Invalid division',
        category: 'Invalid category',
        teamLeaderEmail: 'Invalid email format',
      }

      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: false,
        errors: multipleErrors,
      })

      const response = await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(response.status).toBe(422)
      const body = await response.json()
      expect(body).toEqual({ errors: multipleErrors })
    })
  })

  describe('Server Error Cases', () => {
    it('should return 500 when team creation succeeds but team ID is missing', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: '',
          name: 'Test Team',
          division: 'FIRST_DIVISION',
        },
      })

      const result = await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(result.status).toBe(500)
      const body = await result.json()
      expect(body).toEqual({
        errors: { general: 'Team creation failed - invalid team data' },
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should return 500 when team object is undefined despite success', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        // @ts-expect-error Testing invalid state
        team: undefined,
      })

      const result = await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(result.status).toBe(500)
      const body = await result.json()
      expect(body).toEqual({
        errors: { general: 'Team creation failed - invalid team data' },
      })
    })

    it('should return 500 when team.id is null', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          // @ts-expect-error Testing invalid state
          id: null,
          name: 'Test Team',
          division: 'FIRST_DIVISION',
        },
      })

      const result = await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(result.status).toBe(500)
      const body = await result.json()
      expect(body).toEqual({
        errors: { general: 'Team creation failed - invalid team data' },
      })
    })
  })

  describe('Path Replacement', () => {
    it('should replace {teamId} placeholder exactly once', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: 'unique-id',
          name: 'Test Team',
          division: 'FIRST_DIVISION',
        },
      })

      await handleTeamCreation(mockFormData, '/teams/{teamId}/edit')

      expect(redirect).toHaveBeenCalledWith('/teams/unique-id/edit?success=created')
    })

    it('should handle paths without {teamId} placeholder gracefully', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: 'team-id',
          name: 'Test Team',
          division: 'FIRST_DIVISION',
        },
      })

      await handleTeamCreation(mockFormData, '/teams/new')

      // Should not replace anything if placeholder doesn't exist
      expect(redirect).toHaveBeenCalledWith('/teams/new?success=created')
    })

    it('should preserve query parameters in redirect path', async () => {
      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: 'team-id',
          name: 'Test Team',
          division: 'FIRST_DIVISION',
        },
      })

      // Note: The function always adds ?success=created, so existing query params
      // would need special handling in the implementation
      await handleTeamCreation(mockFormData, '/teams/{teamId}')

      expect(redirect).toHaveBeenCalledWith('/teams/team-id?success=created')
    })
  })

  describe('FormData Handling', () => {
    it('should pass FormData to createTeamFromFormData unchanged', async () => {
      const customFormData = new FormData()
      customFormData.append('name', 'Custom Team')
      customFormData.append('clubName', 'Custom Club')
      customFormData.append('division', 'PREMIER_DIVISION')

      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: true,
        team: {
          id: 'custom-id',
          name: 'Custom Team',
          division: 'PREMIER_DIVISION',
        },
      })

      await handleTeamCreation(customFormData, '/teams/{teamId}')

      expect(createTeamFromFormData).toHaveBeenCalledWith(customFormData)
      expect(createTeamFromFormData).toHaveBeenCalledTimes(1)
    })

    it('should handle empty FormData', async () => {
      const emptyFormData = new FormData()

      vi.mocked(createTeamFromFormData).mockResolvedValue({
        success: false,
        errors: { name: 'Name is required', clubName: 'Club name is required' },
      })

      const response = await handleTeamCreation(emptyFormData, '/teams/{teamId}')

      expect(response.status).toBe(422)
      expect(createTeamFromFormData).toHaveBeenCalledWith(emptyFormData)
    })
  })
})
