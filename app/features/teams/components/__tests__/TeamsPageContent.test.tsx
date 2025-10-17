import { Category } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import { TeamsPageContent } from '../TeamsPageContent'

// Mock react-i18next
const mockT = (key: string, options?: { count?: number }) => {
  const translations: Record<string, string> = {
    'admin.team.totalTeams': 'Total Teams',
    'teams.count': `Found ${options?.count || 0} teams`,
    'teams.noTeams': 'No teams found',
    'teams.getStarted.title': 'Get Started',
    'teams.getStarted.description': 'Create your first team to get started',
  }
  return translations[key] || key
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: 'en' },
  }),
}))

// Mock react-router hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useRevalidator: () => ({
      revalidate: vi.fn(),
      state: 'idle',
    }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/teams',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

// Mock the Panel component
vi.mock('~/components/Panel', () => ({
  Panel: ({
    children,
    icon,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    icon?: React.ReactNode
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      {icon}
      {children}
    </div>
  ),
}))

// Mock TeamList component
vi.mock('~/features/teams/components/TeamList', () => ({
  TeamList: ({
    teams,
    onTeamClick,
    emptyMessage,
  }: {
    teams: Array<{ id: string; clubName: string; name: string }>
    onTeamClick?: (id: string) => void
    emptyMessage?: string
  }) => (
    <div>
      {teams.length === 0 ? (
        <div>{emptyMessage}</div>
      ) : (
        teams.map(team => (
          <button key={team.id} onClick={() => onTeamClick?.(team.id)}>
            {team.clubName} {team.name}
          </button>
        ))
      )}
    </div>
  ),
}))

// Mock TournamentFilter component
vi.mock('~/features/tournaments/components/TournamentFilter', () => ({
  TournamentFilter: ({
    selectedTournamentId,
  }: {
    selectedTournamentId: string | null
  }) => (
    <div data-testid='tournament-filter'>Filter: {selectedTournamentId || 'All'}</div>
  ),
}))

// Mock icons - use importOriginal to keep all real icons
vi.mock('~/components/icons', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    // Override specific icons if needed for testing
    ApparelIcon: () => <div data-testid='apparel-icon'>Icon</div>,
  }
})

describe('TeamsPageContent', () => {
  const mockTeams = [
    {
      id: '1',
      name: 'Team A',
      clubName: 'Club A',
      category: Category.JO12,
      tournament: { id: 't1', name: 'Tournament 1' },
    },
    {
      id: '2',
      name: 'Team B',
      clubName: 'Club B',
      category: Category.JO14,
      tournament: { id: 't1', name: 'Tournament 1' },
    },
  ]

  const mockTournaments = [
    {
      id: 't1',
      name: 'Tournament 1',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
    },
    {
      id: 't2',
      name: 'Tournament 2',
      location: 'Location 2',
      startDate: new Date(),
      endDate: new Date(),
    },
  ]

  const mockOnTeamClick = vi.fn()

  describe('Stats Panel Layout', () => {
    it('should show stats panel when showStats is true', () => {
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={true}
        />
      )

      expect(screen.getByTestId('teams-total-stat')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Team count
      expect(screen.getByTestId('apparel-icon')).toBeInTheDocument()
    })

    it('should not show stats panel when showStats is false', () => {
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      expect(screen.queryByTestId('teams-total-stat')).not.toBeInTheDocument()
      expect(screen.queryByTestId('apparel-icon')).not.toBeInTheDocument()
    })
  })

  describe('Tournament Filter', () => {
    it('should render tournament filter', () => {
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      expect(screen.getByTestId('tournament-filter')).toBeInTheDocument()
      expect(screen.getByText('Filter: All')).toBeInTheDocument()
    })

    it('should show selected tournament', () => {
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId='t1'
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      expect(screen.getByText('Filter: t1')).toBeInTheDocument()
    })
  })

  describe('Team List', () => {
    it('should render team list with teams', () => {
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      expect(screen.getByRole('button', { name: 'Club A Team A' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Club B Team B' })).toBeInTheDocument()
    })

    it('should call onTeamClick when team is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Club A Team A' }))
      expect(mockOnTeamClick).toHaveBeenCalledWith('1')
    })

    it('should show empty message when no teams', () => {
      render(
        <TeamsPageContent
          teamListItems={[]}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      expect(screen.getByText('No teams found')).toBeInTheDocument()
    })
  })

  describe('Get Started Section', () => {
    it('should show get started section when no teams and showStats is false', () => {
      render(
        <TeamsPageContent
          teamListItems={[]}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      expect(screen.getByText('Get Started')).toBeInTheDocument()
      expect(
        screen.getByText('Create your first team to get started')
      ).toBeInTheDocument()
    })

    it('should not show get started section when showStats is true', () => {
      render(
        <TeamsPageContent
          teamListItems={[]}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={true}
        />
      )

      expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
    })
  })

  describe('Custom Test ID', () => {
    it('should use custom testId when provided', () => {
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
          testId='custom-test-id'
        />
      )

      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument()
    })

    it('should use default testId when not provided', () => {
      render(
        <TeamsPageContent
          teamListItems={mockTeams}
          tournamentListItems={mockTournaments}
          selectedTournamentId={null}
          onTeamClick={mockOnTeamClick}
          showStats={false}
        />
      )

      expect(screen.getByTestId('teams-layout')).toBeInTheDocument()
    })
  })
})
