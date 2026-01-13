import type { User } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, useLoaderData } from 'react-router'

import { beforeEach, describe, expect, test, vi } from 'vitest'
import AdminDashboard from '~/routes/admin/admin._index'
import { adminPath } from '~/utils/adminRoutes'

// Mock user data
const mockUser: User = {
	id: 'admin-1',
	email: 'admin@example.com',
	firstName: 'Admin',
	lastName: 'User',
	role: 'ADMIN',
	firebaseUid: 'test-firebase-uid',
	displayName: null,
	active: true,
	createdAt: new Date(),
	updatedAt: new Date(),
}

// Mock teams data
const mockTeams = [
	{ id: 'team-1', clubName: 'Club A', name: 'Team Alpha' },
	{ id: 'team-2', clubName: 'Club B', teamName: 'Team Beta' },
	{ id: 'team-3', clubName: 'Club C', teamName: 'Team Gamma' },
]

// Mock tournaments data
const mockTournaments = [
	{
		id: 'tournament-1',
		name: 'Summer Championship',
		location: 'Stadium A',
		startDate: new Date('2024-07-01'),
		endDate: new Date('2024-07-15'),
	},
	{
		id: 'tournament-2',
		name: 'Winter Cup',
		location: 'Stadium B',
		startDate: new Date('2024-12-01'),
		endDate: null,
	},
]

// Mock useLoaderData
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router')
	return {
		...actual,
		useLoaderData: vi.fn(),
	}
})

// Mock useTranslation and Trans
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
	Trans: ({
		i18nKey,
		values,
		components,
	}: {
		i18nKey: string
		values?: Record<string, unknown>
		components?: Record<string, ReactElement>
	}) => {
		// Mock that handles both value interpolation and JSX component tags
		let result = i18nKey

		// First, handle JSX component tags (e.g., <email>{{email}}</email>)
		if (components) {
			Object.entries(components).forEach(([tagName, _component]) => {
				const tagRegex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'g')
				result = result.replace(tagRegex, (_match, content) => {
					// For testing purposes, we'll return the interpolated content
					// In a real implementation, this would render the component
					let processedContent = content
					if (values) {
						Object.entries(values).forEach(([key, value]) => {
							processedContent = processedContent.replace(`{{${key}}}`, String(value))
						})
					}
					return processedContent
				})
			})
		}

		// Then handle any remaining value interpolations
		if (values) {
			Object.entries(values).forEach(([key, value]) => {
				result = result.replace(`{{${key}}}`, String(value))
			})
		}

		return result
	},
}))

// Mock ActionLinkPanel component
vi.mock('~/components/ActionLinkPanel', () => ({
	ActionLinkPanel: ({
		title,
		description,
		colorAccent,
		to,
		icon,
		children,
		testId,
	}: {
		title: string
		description: string
		colorAccent: string
		to?: string
		icon?: React.ReactNode
		children?: React.ReactNode
		testId?: string
	}) => (
		<div
			data-testid={testId || `admin-panel-${title.toLowerCase().replace(/\s+/g, '-')}`}
			data-color-scheme={colorAccent}
			data-link-to={to}
		>
			{icon}
			<h3>{title}</h3>
			<p>{description}</p>
			{children}
		</div>
	),
}))

// Mock icons - use importOriginal to get all icons and override specific ones for testing
vi.mock('~/components/icons', async (importOriginal) => {
	const actual = await importOriginal<typeof import('~/components/icons')>()
	return {
		...actual,
		ApparelIcon: ({ className }: { className?: string }) => (
			<div data-testid='apparel-icon' className={className} />
		),
		TrophyIcon: ({ className }: { className?: string }) => (
			<div data-testid='trophy-icon' className={className} />
		),
		PersonIcon: ({ className }: { className?: string }) => (
			<div data-testid='person-icon' className={className} />
		),
		GroupIcon: ({ className }: { className?: string }) => (
			<div data-testid='group-icon' className={className} />
		),
		SettingsIcon: ({ className }: { className?: string }) => (
			<div data-testid='settings-icon' className={className} />
		),
		TuneIcon: ({ className }: { className?: string }) => (
			<div data-testid='tune-icon' className={className} />
		),
		SportsIcon: ({ className }: { className?: string }) => (
			<div data-testid='sports-icon' className={className} />
		),
		ScoreboardIcon: ({ className }: { className?: string }) => (
			<div data-testid='scoreboard-icon' className={className} />
		),
	}
})

describe('Admin Dashboard', () => {
	beforeEach(() => {
		// Reset and set default mock return value
		vi.mocked(useLoaderData).mockReset()
		vi.mocked(useLoaderData).mockReturnValue({
			user: mockUser,
			teams: mockTeams,
			tournaments: mockTournaments,
			activeUsersCount: 5,
		})
	})

	describe('Basic Rendering', () => {
		test('should render main page title', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(
				screen.getByRole('heading', {
					level: 2,
					name: 'common.titles.adminPanel',
				}),
			).toHaveTextContent('common.titles.adminPanel')
		})

		test('should render welcome message with user email', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(screen.getByText(/admin.panel.description/)).toBeInTheDocument()
		})

		test('should render all admin panels', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(screen.getByTestId('admin-panel-team-management')).toBeInTheDocument()
			expect(
				screen.getByTestId('admin-panel-tournament-management'),
			).toBeInTheDocument()
			expect(
				screen.getByTestId('admin-panel-competition-management'),
			).toBeInTheDocument()
			expect(screen.getByTestId('admin-panel-user-management')).toBeInTheDocument()
			expect(screen.getByTestId('admin-panel-system-settings')).toBeInTheDocument()
			expect(screen.getByTestId('admin-panel-reports-&-analytics')).toBeInTheDocument()
		})
	})

	describe('Admin Panels Configuration', () => {
		test('should configure Team Management panel correctly', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const teamPanel = screen.getByTestId('admin-panel-team-management')
			expect(teamPanel).toHaveAttribute('data-link-to', adminPath('/teams'))
			expect(teamPanel).toHaveTextContent('admin.teams.title')
			expect(teamPanel).toHaveTextContent('admin.teams.description')
		})

		test('should configure Tournament Management panel correctly', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
			expect(tournamentPanel).toHaveAttribute('data-link-to', adminPath('/tournaments'))
			expect(tournamentPanel).toHaveTextContent('admin.tournaments.title')
			expect(tournamentPanel).toHaveTextContent('admin.tournaments.description')
		})

		test('should configure User Management panel correctly', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const userPanel = screen.getByTestId('admin-panel-user-management')
			expect(userPanel).toHaveAttribute('data-link-to', adminPath('/users'))
			expect(userPanel).toHaveTextContent('admin.users.title')
			expect(userPanel).toHaveTextContent('admin.users.description')
		})

		test('should configure System Settings panel correctly', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const settingsPanel = screen.getByTestId('admin-panel-system-settings')
			expect(settingsPanel).not.toHaveAttribute('data-link-to') // No navigation
			expect(settingsPanel).toHaveTextContent('admin.settings.title')
			expect(settingsPanel).toHaveTextContent('admin.settings.description')
		})

		test('should configure Reports & Analytics panel correctly', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const reportsPanel = screen.getByTestId('admin-panel-reports-&-analytics')
			expect(reportsPanel).not.toHaveAttribute('data-link-to') // No navigation
			expect(reportsPanel).toHaveTextContent('admin.reports.title')
			expect(reportsPanel).toHaveTextContent('admin.reports.description')
		})
	})

	describe('Data Display', () => {
		test('should display total teams count', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const teamPanel = screen.getByTestId('admin-panel-team-management')
			expect(teamPanel).toHaveTextContent(/admin\.(team|teams)\.totalTeams/)
			expect(teamPanel).toHaveTextContent('3') // Mock teams length
		})

		test('should display total tournaments count', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
			expect(tournamentPanel).toHaveTextContent(
				/admin\.(tournament|tournaments)\.totalTournaments/,
			)
			expect(tournamentPanel).toHaveTextContent('2') // Mock tournaments length
		})

		test('should display total active users count', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const userPanel = screen.getByTestId('admin-panel-user-management')
			expect(userPanel).toHaveTextContent(/admin\.users\.totalUsers/)
			expect(userPanel).toHaveTextContent('5')
		})
	})

	describe('Icons Integration', () => {
		test('should render appropriate icons for each panel', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(screen.getByTestId('apparel-icon')).toBeInTheDocument()
			expect(screen.getByTestId('trophy-icon')).toBeInTheDocument()
			expect(screen.getByTestId('group-icon')).toBeInTheDocument()
			expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
			expect(screen.getByTestId('tune-icon')).toBeInTheDocument()
		})

		test('should apply correct icon styling', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const apparelIcon = screen.getByTestId('apparel-icon')
			expect(apparelIcon).toHaveClass('h-5', 'w-5')

			const trophyIcon = screen.getByTestId('trophy-icon')
			expect(trophyIcon).toHaveClass('h-5', 'w-5')
		})
	})

	describe('Layout and Styling', () => {
		test('should apply correct styling to main heading', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const heading = screen.getByRole('heading', {
				level: 2,
				name: 'common.titles.adminPanel',
			})
			expect(heading).toHaveClass('text-3xl', 'font-bold')
		})

		test('should apply correct styling to welcome message', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const description = screen.getByText(/admin.panel.description/)
			expect(description).toHaveClass('text-foreground', 'mt-1')
		})

		test('should organize content in proper structure', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			// Check main structure exists
			const heading = screen.getByRole('heading', {
				level: 2,
				name: 'common.titles.adminPanel',
			})
			expect(heading).toBeInTheDocument()

			// Count only the actual menu panels (excluding the header)
			const panels = screen
				.getAllByTestId(/^admin-panel-/)
				.filter(
					(element) => element.getAttribute('data-testid') !== 'admin-panel-header',
				)
			expect(panels).toHaveLength(6)
		})
	})

	describe('Navigation Links', () => {
		test('should provide navigation to teams management', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const teamPanel = screen.getByTestId('admin-panel-team-management')
			expect(teamPanel).toHaveAttribute('data-link-to', adminPath('/teams'))
		})

		test('should provide navigation to tournaments management', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
			expect(tournamentPanel).toHaveAttribute('data-link-to', adminPath('/tournaments'))
		})

		test('should not provide navigation for non-implemented panels', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const settingsPanel = screen.getByTestId('admin-panel-system-settings')
			const reportsPanel = screen.getByTestId('admin-panel-reports-&-analytics')

			expect(settingsPanel).not.toHaveAttribute('data-link-to')
			expect(reportsPanel).not.toHaveAttribute('data-link-to')
		})
	})

	describe('Accessibility', () => {
		test('should have proper heading hierarchy', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const h1Elements = screen.getAllByRole('heading', { level: 2 })
			const h3Elements = screen.getAllByRole('heading', { level: 3 })

			expect(h1Elements).toHaveLength(1)
			expect(h3Elements).toHaveLength(6) // Panel titles
		})

		test('should have descriptive panel titles', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(screen.getByText('admin.teams.title')).toBeInTheDocument()
			expect(screen.getByText('admin.tournaments.title')).toBeInTheDocument()
			expect(screen.getByText('admin.users.title')).toBeInTheDocument()
			expect(screen.getByText('admin.settings.title')).toBeInTheDocument()
			expect(screen.getByText('admin.reports.title')).toBeInTheDocument()
		})
	})

	describe('Translation Integration', () => {
		test('should use translation system for data labels', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(screen.getByText(/admin\.(team|teams)\.totalTeams/)).toBeInTheDocument()
			expect(
				screen.getByText(/admin\.(tournament|tournaments)\.totalTournaments/),
			).toBeInTheDocument()
		})

		test('should render with English language context', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			// Verify main heading renders correctly
			expect(
				screen.getByRole('heading', {
					level: 2,
					name: 'common.titles.adminPanel',
				}),
			).toHaveTextContent('common.titles.adminPanel')
		})
	})

	describe('Dynamic Data Handling', () => {
		test('should handle empty teams data', () => {
			// Mock empty teams data
			vi.mocked(useLoaderData).mockReturnValueOnce({
				user: mockUser,
				teams: [],
				tournaments: mockTournaments,
				activeUsersCount: 5,
			})

			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const teamPanel = screen.getByTestId('admin-panel-team-management')
			expect(teamPanel).toHaveTextContent(/admin\.(team|teams)\.totalTeams/)
			expect(teamPanel).toHaveTextContent('0')
		})

		test('should handle empty tournaments data', () => {
			// Mock empty tournaments data
			vi.mocked(useLoaderData).mockReturnValueOnce({
				user: mockUser,
				teams: mockTeams,
				tournaments: [],
				activeUsersCount: 5,
			})

			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
			expect(tournamentPanel).toHaveTextContent(
				/admin\.(tournament|tournaments)\.totalTournaments/,
			)
			expect(tournamentPanel).toHaveTextContent('0')
		})
	})

	describe('User Context Display', () => {
		test('should display correct user information', () => {
			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(screen.getByText(/admin.panel.description/)).toBeInTheDocument()

			const userPanel = screen.getByTestId('admin-panel-user-management')
			expect(userPanel).toHaveTextContent(/admin\.users\.totalUsers/)
			expect(userPanel).toHaveTextContent('5')
		})

		test('should handle different user data', () => {
			// Mock different user
			vi.mocked(useLoaderData).mockReturnValueOnce({
				user: {
					...mockUser,
					id: 'user-999',
					email: 'different@example.com',
				},
				teams: mockTeams,
				tournaments: mockTournaments,
				activeUsersCount: 10,
			})

			render(
				<MemoryRouter>
					<AdminDashboard />
				</MemoryRouter>,
			)

			expect(screen.getByText(/admin.panel.description/)).toBeInTheDocument()

			const userPanel = screen.getByTestId('admin-panel-user-management')
			expect(userPanel).toHaveTextContent(/admin\.users\.totalUsers/)
			expect(userPanel).toHaveTextContent('10')
		})
	})

	describe('Role-Based Panel Visibility', () => {
		test.each(['EDITOR', 'BILLING'] as const)(
			'%s role users should see dashboard with Reports panel only',
			(role) => {
				vi.mocked(useLoaderData).mockReturnValueOnce({
					user: {
						...mockUser,
						role,
					},
					teams: mockTeams,
					tournaments: mockTournaments,
					activeUsersCount: 5,
				})

				render(
					<MemoryRouter>
						<AdminDashboard />
					</MemoryRouter>,
				)

				// Should see the dashboard container
				expect(screen.getByTestId('admin-dashboard-container')).toBeInTheDocument()

				// Should see the header
				expect(
					screen.getByRole('heading', {
						level: 2,
						name: 'common.titles.adminPanel',
					}),
				).toBeInTheDocument()

				// Should see Reports & Analytics panel (has system:reports permission)
				expect(
					screen.getByTestId('admin-panel-reports-&-analytics'),
				).toBeInTheDocument()

				// Should NOT see management panels (lacks required permissions)
				expect(
					screen.queryByTestId('admin-panel-team-management'),
				).not.toBeInTheDocument()
				expect(
					screen.queryByTestId('admin-panel-tournament-management'),
				).not.toBeInTheDocument()
				expect(
					screen.queryByTestId('admin-panel-competition-management'),
				).not.toBeInTheDocument()
				expect(
					screen.queryByTestId('admin-panel-user-management'),
				).not.toBeInTheDocument()
				expect(
					screen.queryByTestId('admin-panel-system-settings'),
				).not.toBeInTheDocument()
			},
		)
	})
})
