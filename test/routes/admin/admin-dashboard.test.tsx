import { MemoryRouter, useLoaderData } from 'react-router'

import type { User } from '@prisma/client'
import { render, screen } from '@testing-library/react'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import AdminDashboard from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1._index'

// Mock user data
const mockUser: User = {
  id: 'admin-1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
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
  }: {
    i18nKey: string
    values?: Record<string, unknown>
  }) => {
    // Simple mock that returns the key with interpolated values
    let result = i18nKey
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
  }: {
    title: string
    description: string
    colorAccent: string
    to?: string
    icon?: React.ReactNode
    children?: React.ReactNode
  }) => (
    <div
      data-testid={`admin-panel-${title.toLowerCase().replace(/\s+/g, '-')}`}
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

// Mock icons
vi.mock('~/components/icons', () => ({
  ApparelIcon: ({ className }: { className?: string }) => (
    <div data-testid='apparel-icon' className={className} />
  ),
  TrophyIcon: ({ className }: { className?: string }) => (
    <div data-testid='trophy-icon' className={className} />
  ),
  PersonIcon: ({ className }: { className?: string }) => (
    <div data-testid='person-icon' className={className} />
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
}))

describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Reset and set default mock return value
    vi.mocked(useLoaderData).mockReset()
    vi.mocked(useLoaderData).mockReturnValue({
      user: mockUser,
      teams: mockTeams,
      tournaments: mockTournaments,
    })
  })

  describe('Basic Rendering', () => {
    test('should render main page title', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'common.titles.adminPanel'
      )
    })

    test('should render welcome message with user email', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByText(/admin.panel.description/)).toBeInTheDocument()
    })

    test('should render all five admin panels', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByTestId('admin-panel-team-management')).toBeInTheDocument()
      expect(
        screen.getByTestId('admin-panel-tournament-management')
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
        </MemoryRouter>
      )

      const teamPanel = screen.getByTestId('admin-panel-team-management')
      expect(teamPanel).toHaveAttribute(
        'data-link-to',
        '/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
      )
      expect(teamPanel).toHaveTextContent('Team Management')
      expect(teamPanel).toHaveTextContent('Manage team registrations and memberships.')
    })

    test('should configure Tournament Management panel correctly', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
      expect(tournamentPanel).toHaveAttribute(
        'data-link-to',
        '/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments'
      )
      expect(tournamentPanel).toHaveTextContent('Tournament Management')
      expect(tournamentPanel).toHaveTextContent(
        'Create and manage tournaments and competitions.'
      )
    })

    test('should configure User Management panel correctly', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const userPanel = screen.getByTestId('admin-panel-user-management')
      expect(userPanel).not.toHaveAttribute('data-link-to') // No navigation
      expect(userPanel).toHaveTextContent('User Management')
      expect(userPanel).toHaveTextContent('Manage user accounts and permissions.')
    })

    test('should configure System Settings panel correctly', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const settingsPanel = screen.getByTestId('admin-panel-system-settings')
      expect(settingsPanel).not.toHaveAttribute('data-link-to') // No navigation
      expect(settingsPanel).toHaveTextContent('System Settings')
      expect(settingsPanel).toHaveTextContent(
        'Configure application settings and preferences.'
      )
    })

    test('should configure Reports & Analytics panel correctly', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const reportsPanel = screen.getByTestId('admin-panel-reports-&-analytics')
      expect(reportsPanel).not.toHaveAttribute('data-link-to') // No navigation
      expect(reportsPanel).toHaveTextContent('Reports & Analytics')
      expect(reportsPanel).toHaveTextContent(
        'View platform usage and tournament statistics.'
      )
    })
  })

  describe('Data Display', () => {
    test('should display total teams count', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const teamPanel = screen.getByTestId('admin-panel-team-management')
      expect(teamPanel).toHaveTextContent('admin.teams.totalTeams')
      expect(teamPanel).toHaveTextContent('3') // Mock teams length
    })

    test('should display total tournaments count', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
      expect(tournamentPanel).toHaveTextContent('admin.tournaments.totalTournaments')
      expect(tournamentPanel).toHaveTextContent('2') // Mock tournaments length
    })

    test('should display current user information', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const userPanel = screen.getByTestId('admin-panel-user-management')
      expect(userPanel).toHaveTextContent('Current User: admin@example.com')
      expect(userPanel).toHaveTextContent('User ID: admin-1')
    })
  })

  describe('Icons Integration', () => {
    test('should render appropriate icons for each panel', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByTestId('apparel-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument()
      expect(screen.getByTestId('person-icon')).toBeInTheDocument()
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
      expect(screen.getByTestId('tune-icon')).toBeInTheDocument()
    })

    test('should apply correct icon styling', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
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
        </MemoryRouter>
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('mb-8', 'text-3xl', 'font-bold')
    })

    test('should apply correct styling to welcome message', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const description = screen.getByText(/admin.panel.description/)
      expect(description).toHaveClass('text-foreground', 'mb-8')
    })

    test('should organize content in proper structure', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      // Check main structure exists
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()

      // All panels should be present
      expect(screen.getAllByTestId(/^admin-panel-/)).toHaveLength(6)
    })
  })

  describe('Navigation Links', () => {
    test('should provide navigation to teams management', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const teamPanel = screen.getByTestId('admin-panel-team-management')
      expect(teamPanel).toHaveAttribute(
        'data-link-to',
        '/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
      )
    })

    test('should provide navigation to tournaments management', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
      expect(tournamentPanel).toHaveAttribute(
        'data-link-to',
        '/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments'
      )
    })

    test('should not provide navigation for non-implemented panels', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const userPanel = screen.getByTestId('admin-panel-user-management')
      const settingsPanel = screen.getByTestId('admin-panel-system-settings')
      const reportsPanel = screen.getByTestId('admin-panel-reports-&-analytics')

      expect(userPanel).not.toHaveAttribute('data-link-to')
      expect(settingsPanel).not.toHaveAttribute('data-link-to')
      expect(reportsPanel).not.toHaveAttribute('data-link-to')
    })
  })

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      const h3Elements = screen.getAllByRole('heading', { level: 3 })

      expect(h1Elements).toHaveLength(1)
      expect(h3Elements).toHaveLength(6) // Panel titles
    })

    test('should have descriptive panel titles', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByText('Team Management')).toBeInTheDocument()
      expect(screen.getByText('Tournament Management')).toBeInTheDocument()
      expect(screen.getByText('User Management')).toBeInTheDocument()
      expect(screen.getByText('System Settings')).toBeInTheDocument()
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument()
    })
  })

  describe('Translation Integration', () => {
    test('should use translation system for data labels', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByText(/admin\.teams\.totalTeams/)).toBeInTheDocument()
      expect(
        screen.getByText(/admin\.tournaments\.totalTournaments/)
      ).toBeInTheDocument()
    })

    test('should render with English language context', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      // Verify main heading renders correctly
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'common.titles.adminPanel'
      )
    })
  })

  describe('Dynamic Data Handling', () => {
    test('should handle empty teams data', () => {
      // Mock empty teams data
      vi.mocked(useLoaderData).mockReturnValueOnce({
        user: mockUser,
        teams: [],
        tournaments: mockTournaments,
      })

      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const teamPanel = screen.getByTestId('admin-panel-team-management')
      expect(teamPanel).toHaveTextContent('admin.teams.totalTeams')
      expect(teamPanel).toHaveTextContent('0')
    })

    test('should handle empty tournaments data', () => {
      // Mock empty tournaments data
      vi.mocked(useLoaderData).mockReturnValueOnce({
        user: mockUser,
        teams: mockTeams,
        tournaments: [],
      })

      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      const tournamentPanel = screen.getByTestId('admin-panel-tournament-management')
      expect(tournamentPanel).toHaveTextContent('admin.tournaments.totalTournaments')
      expect(tournamentPanel).toHaveTextContent('0')
    })
  })

  describe('User Context Display', () => {
    test('should display correct user information', () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByText(/admin.panel.description/)).toBeInTheDocument()

      const userPanel = screen.getByTestId('admin-panel-user-management')
      expect(userPanel).toHaveTextContent('Current User: admin@example.com')
      expect(userPanel).toHaveTextContent('User ID: admin-1')
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
      })

      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )

      expect(screen.getByText(/admin.panel.description/)).toBeInTheDocument()

      const userPanel = screen.getByTestId('admin-panel-user-management')
      expect(userPanel).toHaveTextContent('Current User: different@example.com')
      expect(userPanel).toHaveTextContent('User ID: user-999')
    })
  })
})
