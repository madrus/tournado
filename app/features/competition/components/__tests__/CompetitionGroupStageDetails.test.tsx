import { Category } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CompetitionGroupStageDetails } from '../CompetitionGroupStageDetails'

const mockSubmit = vi.fn()

let mockUser: { id: string; email: string; role: string } | null = {
  id: 'user-1',
  email: 'user@example.com',
  role: 'ADMIN',
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useSubmit: () => mockSubmit,
  }
})

vi.mock('~/utils/routeUtils', () => ({
  useUser: () => mockUser,
  useMatchesData: vi.fn(() => ({})),
}))

vi.mock('../GroupAssignmentBoard', () => ({
  GroupAssignmentBoard: () => <div data-testid='group-assignment-board' />,
}))

const baseGroupStage = {
  id: 'group-stage-1',
  name: 'Group Stage',
  tournamentId: 'tournament-1',
  createdBy: 'owner-1',
  categories: [Category.JO8],
  configGroups: 1,
  configSlots: 1,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  groups: [
    {
      id: 'group-1',
      name: 'Group A',
      order: 0,
      slots: [
        {
          id: 'slot-1',
          slotIndex: 0,
          team: null,
        },
      ],
    },
  ],
  confirmedSlots: [],
}

const baseProps = {
  groupStage: baseGroupStage,
  availableTeams: [],
  tournamentId: 'tournament-1',
  tournamentCreatedBy: 'tournament-owner',
}

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

beforeEach(() => {
  mockSubmit.mockClear()
  mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'ADMIN',
  }
})

describe('CompetitionGroupStageDetails', () => {
  it('renders delete button for ADMIN role', () => {
    renderWithRouter(<CompetitionGroupStageDetails {...baseProps} />)

    expect(
      screen.getByRole('button', { name: 'common.actions.delete' }),
    ).toBeInTheDocument()
  })

  it('renders delete button for MANAGER role with ownership', () => {
    mockUser = {
      id: 'owner-1',
      email: 'manager@example.com',
      role: 'MANAGER',
    }

    renderWithRouter(<CompetitionGroupStageDetails {...baseProps} />)

    expect(
      screen.getByRole('button', { name: 'common.actions.delete' }),
    ).toBeInTheDocument()
  })

  it('does not render delete button for unauthorized roles', () => {
    mockUser = {
      id: 'referee-1',
      email: 'referee@example.com',
      role: 'REFEREE',
    }

    renderWithRouter(<CompetitionGroupStageDetails {...baseProps} />)

    expect(
      screen.queryByRole('button', { name: 'common.actions.delete' }),
    ).not.toBeInTheDocument()
  })

  it('opens confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup()

    renderWithRouter(<CompetitionGroupStageDetails {...baseProps} />)

    await user.click(screen.getByRole('button', { name: 'common.actions.delete' }))

    expect(
      screen.getByText('competition.groupAssignment.deleteTitle'),
    ).toBeInTheDocument()
  })
})
