import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Team } from '~/features/teams/types'
import type { Tournament } from '~/models/tournament.server'

// Mock dependencies
const mockEmailsSend = vi.fn()
vi.mock('resend', () => ({
	Resend: vi.fn().mockImplementation(() => ({
		emails: {
			send: mockEmailsSend,
		},
	})),
}))

vi.mock('@react-email/render', () => ({
	render: vi.fn().mockResolvedValue('<html>mocked email html</html>'),
}))

vi.mock('~/models/team.server', () => ({
	getTeamLeader: vi.fn(),
}))

// Import the actual implementation and dependencies for testing
const { sendConfirmationEmail, resetResendClient } = await import('../email.server')
const { getTeamLeader } = await import('~/models/team.server')
const { render } = await import('@react-email/render')
const { Resend } = await import('resend')

describe('email.server', () => {
	const mockTeam: Team = {
		id: 'team-123',
		name: 'Ajax Amsterdam',
		clubName: 'Ajax',
		division: 'FIRST_DIVISION',
		category: 'JO12',
		teamLeaderId: 'leader-123',
		tournamentId: 'tournament-123',
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockTournament: Tournament = {
		id: 'tournament-123',
		name: 'Spring Cup',
		location: 'Amsterdam',
		startDate: new Date(),
		endDate: new Date(),
		divisions: '["FIRST_DIVISION"]',
		categories: '["JO12"]',
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockTeamLeader = {
		id: 'leader-123',
		email: 'john.doe@example.com',
		firstName: 'John',
		lastName: 'Doe',
		phone: '+31612345678',
	}

	let mockResendInstance: import('resend').Resend

	beforeEach(() => {
		vi.clearAllMocks()

		// Reset the Resend client to ensure fresh initialization in tests
		resetResendClient()

		// Setup Resend mock
		mockEmailsSend.mockResolvedValue({ id: 'email-123' })
		mockResendInstance = {
			emails: { send: mockEmailsSend },
		} as unknown as import('resend').Resend
		vi.mocked(Resend).mockReturnValue(mockResendInstance)

		// Setup other mocks
		vi.mocked(getTeamLeader).mockResolvedValue(mockTeamLeader)
		vi.mocked(render).mockResolvedValue('<html>mocked email html</html>')

		// Setup environment variables
		process.env.RESEND_API_KEY = 'test-api-key'
		process.env.EMAIL_FROM = 'test@example.com'
		process.env.NODE_ENV = 'test'

		// Mock console methods to avoid noise in tests
		vi.spyOn(console, 'log').mockImplementation(() => void 0)
		vi.spyOn(console, 'error').mockImplementation(() => void 0)
	})

	describe('sendConfirmationEmail', () => {
		it('should send email successfully with correct parameters', async () => {
			// Mock console.log to avoid noise
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0)

			await sendConfirmationEmail(mockTeam, mockTournament)

			expect(getTeamLeader).toHaveBeenCalledWith('leader-123')
			expect(render).toHaveBeenCalled()
			expect(mockEmailsSend).toHaveBeenCalledWith({
				from: 'onboarding@resend.dev', // Since isRealDomainRegistered is false
				to: 'john.doe@example.com',
				subject: 'Team Ajax Amsterdam registered for Spring Cup',
				html: '<html>mocked email html</html>',
			})

			consoleSpy.mockRestore()
		})

		it('should throw error when team leader not found', async () => {
			vi.mocked(getTeamLeader).mockResolvedValue(null)

			await expect(sendConfirmationEmail(mockTeam, mockTournament)).rejects.toThrow(
				'Team leader not found for team team-123',
			)
		})

		it('should throw error when EMAIL_FROM not set', async () => {
			delete process.env.EMAIL_FROM

			await expect(sendConfirmationEmail(mockTeam, mockTournament)).rejects.toThrow(
				'EMAIL_FROM environment variable is not set',
			)
		})

		it('should throw error when RESEND_API_KEY not set', async () => {
			resetResendClient() // Reset to clear any cached client
			delete process.env.RESEND_API_KEY

			await expect(sendConfirmationEmail(mockTeam, mockTournament)).rejects.toThrow(
				'RESEND_API_KEY environment variable is not set',
			)
		})

		it('should use correct baseUrl for development environment', async () => {
			process.env.NODE_ENV = 'development'

			await sendConfirmationEmail(mockTeam, mockTournament)

			expect(render).toHaveBeenCalledWith(
				expect.objectContaining({
					props: expect.objectContaining({
						baseUrl: 'http://localhost:5173',
					}),
				}),
			)
		})

		it('should use FLY_APP_NAME for logo URL in production', async () => {
			process.env.NODE_ENV = 'production'
			process.env.FLY_APP_NAME = 'tournado-staging'

			await sendConfirmationEmail(mockTeam, mockTournament)

			expect(render).toHaveBeenCalledWith(
				expect.objectContaining({
					props: expect.objectContaining({
						logoUrl: 'https://tournado-staging.fly.dev/favicon/soccer_ball.png',
					}),
				}),
			)
		})

		it('should use staging logo URL for development', async () => {
			process.env.NODE_ENV = 'development'

			await sendConfirmationEmail(mockTeam, mockTournament)

			expect(render).toHaveBeenCalledWith(
				expect.objectContaining({
					props: expect.objectContaining({
						logoUrl: 'https://tournado-staging.fly.dev/favicon/soccer_ball.png',
					}),
				}),
			)
		})

		it('should handle EMAIL_BASE_URL override', async () => {
			process.env.EMAIL_BASE_URL = 'https://custom-domain.com'

			await sendConfirmationEmail(mockTeam, mockTournament)

			expect(render).toHaveBeenCalledWith(
				expect.objectContaining({
					props: expect.objectContaining({
						baseUrl: 'https://custom-domain.com',
						logoUrl: 'https://custom-domain.com/favicon/soccer_ball.png',
					}),
				}),
			)
		})

		it('should throw error when Resend API fails', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0)
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)

			mockEmailsSend.mockRejectedValue(new Error('Resend API error'))

			await expect(sendConfirmationEmail(mockTeam, mockTournament)).rejects.toThrow(
				'Failed to send confirmation email',
			)

			consoleSpy.mockRestore()
			consoleErrorSpy.mockRestore()
		})

		it('should pass correct props to email template', async () => {
			await sendConfirmationEmail(mockTeam, mockTournament)

			expect(render).toHaveBeenCalledWith(
				expect.objectContaining({
					props: expect.objectContaining({
						teamName: 'Ajax Amsterdam',
						teamLeaderName: 'John Doe',
						tournamentName: 'Spring Cup',
						teamId: 'team-123',
					}),
				}),
			)
		})
	})
})
