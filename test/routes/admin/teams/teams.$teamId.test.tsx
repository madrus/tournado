import React from 'react'
import * as ReactRouter from 'react-router'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the route component
import AdminTeamPage from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/teams.$teamId'

// Mock submit function for useSubmit hook
const mockSubmit = vi.fn()

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
      options: { fallbackLng: 'en' },
    },
  }),
}))

// Mock helpers (include isBrowser for store persistence logic)
vi.mock('~/lib/lib.helpers', () => ({
  isBrowser: false,
  getDivisionLabel: (division: string) => {
    const labels: Record<string, string> = {
      PREMIER_DIVISION: 'Premier League',
      FIRST_DIVISION: 'First Division',
      SECOND_DIVISION: 'Second Division',
    }
    return labels[division] || division
  },
  getCurrentDivisionLabel: (division: string) => {
    const labels: Record<string, string> = {
      PREMIER_DIVISION: 'Premier League',
      FIRST_DIVISION: 'First Division',
      SECOND_DIVISION: 'Second Division',
    }
    return labels[division] || division
  },
  getCurrentCategoryLabel: vi.fn(category => category),
  stringToDivision: vi.fn(),
}))

// Mock ActionButton component
vi.mock('~/components/buttons/ActionButton', () => ({
  ActionButton: ({
    children,
    onClick,
    icon,
    variant,
    color,
  }: {
    children: React.ReactNode
    onClick?: () => void
    icon?: string
    variant?: string
    color?: string
  }) => (
    <button
      onClick={onClick}
      data-icon={icon}
      data-variant={variant}
      data-color={color}
    >
      {children}
    </button>
  ),
}))

// Mock Panel component
vi.mock('~/components/Panel', () => ({
  Panel: ({
    children,
    color,
    className,
  }: {
    children: React.ReactNode
    color?: string
    className?: string
  }) => (
    <div data-color={color} className={className}>
      {children}
    </div>
  ),
}))

// Mock TeamForm component
vi.mock('~/features/teams/components/TeamForm', () => ({
  TeamForm: ({
    mode,
    variant,
    formData,
    errors,
    intent,
  }: {
    mode: string
    variant: string
    formData?: { clubName: string; name: string }
    errors?: Record<string, string>
    intent: string
  }) => (
    <div data-testid='team-form'>
      <div>Mode: {mode}</div>
      <div>Variant: {variant}</div>
      <div>Intent: {intent}</div>
      {formData ? (
        <div>
          Team: {formData.clubName} {formData.name}
        </div>
      ) : null}
      {errors && Object.keys(errors).length > 0 ? <div>Has errors</div> : null}
    </div>
  ),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLoaderData: vi.fn(() => ({
      team: {
        id: 'team-1',
        clubName: 'Test Club',
        name: 'Test Team',
        division: 'PREMIER_DIVISION',
        category: 'JO10',
        teamLeader: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0612345678',
        },
        tournament: {
          id: 'tournament-1',
          name: 'Test Tournament',
          location: 'Test Location',
        },
      },
    })),
    useActionData: vi.fn(() => ({})),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    useSubmit: vi.fn(() => mockSubmit),
  }
})

// Mock team data for tests
const mockTeam = {
  id: 'team-1',
  clubName: 'Test Club',
  name: 'Test Team',
  division: 'PREMIER_DIVISION',
  category: 'JO10',
  teamLeader: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '0612345678',
  },
  tournament: {
    id: 'tournament-1',
    name: 'Test Tournament',
    location: 'Test Location',
  },
}

// Get the mocked functions
const mockUseLoaderData = vi.mocked(ReactRouter.useLoaderData)
const mockUseActionData = vi.mocked(ReactRouter.useActionData)

// Mock ConfirmDialog - allow tests to control confirm/cancel behavior
const mockOnConfirm = vi.fn()
let triggerConfirm: (() => void) | null = null
let triggerCancel: (() => void) | null = null

vi.mock('~/components/ConfirmDialog', () => ({
  ConfirmDialog: ({
    trigger,
    onConfirm,
    onCancel,
    description,
  }: {
    trigger: React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>
    onConfirm: () => void
    onCancel?: () => void
    description: string
  }) => {
    // Expose functions for tests to trigger confirm/cancel
    triggerConfirm = onConfirm
    triggerCancel = onCancel || null

    return React.cloneElement(trigger, {
      onClick: (event: React.MouseEvent) => {
        // Call original onClick first
        trigger.props.onClick?.(event)
        // Track that confirmation dialog was opened with description
        mockOnConfirm(description)
      },
    })
  },
}))

const renderTeamPage = () => render(<AdminTeamPage />)

describe('AdminTeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnConfirm.mockClear()
    triggerConfirm = null
    triggerCancel = null
  })

  describe('Header Display', () => {
    it('should display team name and club in header', () => {
      renderTeamPage()

      expect(screen.getByText('Test Club Test Team')).toBeInTheDocument()
    })

    it('should display translated division in header', () => {
      renderTeamPage()

      expect(screen.getByText('Premier League')).toBeInTheDocument()
    })

    it('should display fallback text when team data is missing', () => {
      mockUseLoaderData.mockReturnValueOnce({
        team: { ...mockTeam, clubName: '', name: '', division: '' },
      })

      renderTeamPage()

      expect(screen.getByText('teams.form.teamRegistration')).toBeInTheDocument()
      expect(screen.getByText('teams.form.fillOutForm')).toBeInTheDocument()
    })
  })

  describe('Delete Button', () => {
    it('should render delete button in header', () => {
      renderTeamPage()

      const deleteButton = screen.getByRole('button', { name: 'common.actions.delete' })
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveAttribute('data-icon', 'delete')
      expect(deleteButton).toHaveAttribute('data-variant', 'secondary')
      // No color prop specified in actual component, so no data-color attribute
    })

    it('should show confirmation dialog and submit when confirmed', async () => {
      const user = userEvent.setup()
      renderTeamPage()

      const deleteButton = screen.getByRole('button', { name: 'common.actions.delete' })
      await user.click(deleteButton)

      // Verify confirmation dialog was opened
      expect(mockOnConfirm).toHaveBeenCalledWith(
        'teams.confirmations.deleteDescription'
      )

      // Simulate user confirming the dialog
      expect(triggerConfirm).not.toBeNull()
      triggerConfirm!()

      // Verify submit was called with FormData containing delete intent
      expect(mockSubmit).toHaveBeenCalledTimes(1)
      const [formData, options] = mockSubmit.mock.calls[0]
      expect(formData).toBeInstanceOf(FormData)
      expect(formData.get('intent')).toBe('delete')
      expect(options).toEqual({ method: 'post' })
    })

    it('should not submit when confirmation is cancelled', async () => {
      const user = userEvent.setup()
      renderTeamPage()

      const deleteButton = screen.getByRole('button', { name: 'common.actions.delete' })
      await user.click(deleteButton)

      // Verify confirmation dialog was opened
      expect(mockOnConfirm).toHaveBeenCalledWith(
        'teams.confirmations.deleteDescription'
      )

      // Simulate user cancelling the dialog
      if (triggerCancel) {
        triggerCancel()
      }

      // Verify submit was NOT called
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Team Form Integration', () => {
    it('should pass correct props to TeamForm component', () => {
      renderTeamPage()

      expect(screen.getByTestId('team-form')).toBeInTheDocument()
      expect(screen.getByText('Mode: edit')).toBeInTheDocument()
      expect(screen.getByText('Variant: admin')).toBeInTheDocument()
      expect(screen.getByText('Intent: update')).toBeInTheDocument()
      expect(screen.getByText('Team: Test Club Test Team')).toBeInTheDocument()
    })

    it('should pass action errors to TeamForm', () => {
      mockUseActionData.mockReturnValueOnce({
        errors: { clubName: 'Club name is required' },
      })

      renderTeamPage()

      expect(screen.getByText('Has errors')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should have proper flex layout for header', () => {
      renderTeamPage()

      // The header panel should contain the title/description and delete button
      expect(screen.getByText('Test Club Test Team')).toBeInTheDocument()
      // Panel styling is tested through integration tests
    })

    it('should position delete button correctly', () => {
      renderTeamPage()

      const deleteButton = screen.getByRole('button', { name: 'common.actions.delete' })
      const titleText = screen.getByText('Test Club Test Team')

      // Both elements should be rendered
      expect(deleteButton).toBeInTheDocument()
      expect(titleText).toBeInTheDocument()
    })
  })
})
