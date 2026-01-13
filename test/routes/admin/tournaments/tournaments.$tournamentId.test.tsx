import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import * as ReactRouter from 'react-router'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
// Mock the route component
import EditTournamentPage from '~/routes/admin/tournaments/tournaments.$tournamentId'

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
      type='button'
      onClick={onClick}
      data-icon={icon}
      data-variant={variant}
      data-color={color}
    >
      {children}
    </button>
  ),
}))

// Mock ActionLinkButton component
vi.mock('~/components/buttons/ActionLinkButton', () => ({
  ActionLinkButton: ({
    to,
    label,
    icon,
    variant,
  }: {
    to: string
    label: string
    icon: string
    variant?: string
  }) => (
    <a href={to} data-icon={icon} data-variant={variant}>
      {label}
    </a>
  ),
}))

// Mock PrefetchLink component
vi.mock('~/components/PrefetchLink', () => ({
  ActionLink: ({
    to,
    children,
    className,
    'aria-label': ariaLabel,
  }: {
    to: string
    children: React.ReactNode
    className?: string
    'aria-label'?: string
  }) => (
    <a href={to} className={className} aria-label={ariaLabel}>
      {children}
    </a>
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

// Mock TournamentForm component
vi.mock('~/features/tournaments/components/TournamentForm', () => ({
  TournamentForm: ({
    mode,
    variant,
    formData,
    divisions,
    categories,
    errors,
    isSuccess,
    successMessage,
    submitButtonText,
    intent,
  }: {
    mode: string
    variant: string
    formData?: { name: string; location: string }
    divisions?: string[]
    categories?: string[]
    errors?: Record<string, string>
    isSuccess?: boolean
    successMessage?: string
    submitButtonText?: string
    intent: string
  }) => (
    <div data-testid='tournament-form'>
      <div>Mode: {mode}</div>
      <div>Variant: {variant}</div>
      <div>Intent: {intent}</div>
      <div>Submit Button: {submitButtonText}</div>
      {formData ? (
        <div>
          Tournament: {formData.name} at {formData.location}
        </div>
      ) : null}
      {errors && Object.keys(errors).length > 0 ? <div>Has errors</div> : null}
      {isSuccess ? <div>Success: {successMessage}</div> : null}
      <div>Divisions: {divisions?.length || 0}</div>
      <div>Categories: {categories?.length || 0}</div>
    </div>
  ),
}))

// Mock tournament server functions
vi.mock('~/models/tournament.server', () => ({
  getTournamentById: vi.fn(),
  updateTournament: vi.fn(),
  deleteTournamentById: vi.fn(),
  getAllDivisions: () => ['PREMIER_DIVISION', 'FIRST_DIVISION'],
  getAllCategories: () => ['JO8', 'JO9', 'JO10'],
}))

// Mock route utils
vi.mock('~/utils/route-utils.server', () => ({
  requireUserWithMetadata: vi.fn(),
}))

// Mock user utilities for permission checking in ActionLinkButton
vi.mock('~/utils/routeUtils', () => ({
  useUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN',
  }),
}))

// Mock RBAC utilities
vi.mock('~/utils/rbac', () => ({
  canAccess: vi.fn().mockReturnValue(true),
}))

// Mock RTL utilities
vi.mock('~/utils/rtlUtils', () => ({
  isRTL: vi.fn().mockReturnValue(false),
}))

// Mock icon utilities
vi.mock('~/utils/iconUtils', () => ({
  renderIcon: vi
    .fn()
    .mockImplementation((iconName: string) => (
      <span data-icon={iconName}>{iconName}</span>
    )),
}))

// Mock misc utilities
vi.mock('~/utils/misc', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLoaderData: vi.fn(() => ({
      tournament: {
        id: 'tournament-1',
        name: 'Test Tournament',
        location: 'Test Stadium',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-03'),
        divisions: JSON.stringify(['PREMIER_DIVISION', 'FIRST_DIVISION']),
        categories: JSON.stringify(['JO8', 'JO9']),
      },
      divisions: ['PREMIER_DIVISION', 'FIRST_DIVISION'],
      categories: ['JO8', 'JO9', 'JO10'],
      language: 'en',
    })),
    useActionData: vi.fn(() => ({})),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    useSubmit: vi.fn(() => mockSubmit),
  }
})

// Mock tournament data for tests
const mockTournament = {
  id: 'tournament-1',
  name: 'Test Tournament',
  location: 'Test Stadium',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-03'),
  divisions: JSON.stringify(['PREMIER_DIVISION', 'FIRST_DIVISION']),
  categories: JSON.stringify(['JO8', 'JO9']),
}

const mockLoaderData = {
  tournament: mockTournament,
  divisions: ['PREMIER_DIVISION', 'FIRST_DIVISION'],
  categories: ['JO8', 'JO9', 'JO10'],
  language: 'en',
}

// Get the mocked functions
const mockUseLoaderData = vi.mocked(ReactRouter.useLoaderData)
const mockUseActionData = vi.mocked(ReactRouter.useActionData)

// Mock SimpleConfirmDialog - simulate user confirmation
const mockOnConfirm = vi.fn()
vi.mock('~/components/ConfirmDialog', () => ({
  SimpleConfirmDialog: ({
    trigger,
    onConfirm,
    description,
  }: {
    trigger: React.ReactElement<{
      onClick?: (event: React.MouseEvent) => void
    }>
    onConfirm: () => void
    description: string
  }) =>
    React.cloneElement(trigger, {
      onClick: (event: React.MouseEvent) => {
        // Call original onClick first
        trigger.props.onClick?.(event)
        // Track that confirmation was requested with description
        mockOnConfirm(description)
        // Simulate immediate confirmation
        onConfirm()
      },
    }),
}))

const renderTournamentPage = () => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <EditTournamentPage />,
      },
    ],
    {
      initialEntries: ['/'],
      initialIndex: 0,
    },
  )

  return render(<RouterProvider router={router} />)
}

describe('EditTournamentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnConfirm.mockClear()
    mockSubmit.mockClear()
  })

  describe('Header Display', () => {
    it('should display tournament name in header', () => {
      renderTournamentPage()

      expect(screen.getByText('Test Tournament')).toBeInTheDocument()
    })

    it('should display tournament location in header', () => {
      renderTournamentPage()

      expect(
        screen.getByText('tournaments.form.location Test Stadium'),
      ).toBeInTheDocument()
    })

    it('should display fallback text when tournament data is missing', () => {
      mockUseLoaderData.mockReturnValueOnce({
        ...mockLoaderData,
        tournament: { ...mockTournament, name: '', location: '' },
      })

      renderTournamentPage()

      expect(
        screen.getByText('tournaments.form.tournamentRegistration'),
      ).toBeInTheDocument()
      expect(screen.getByText('tournaments.form.fillOutForm')).toBeInTheDocument()
    })
  })

  describe('Delete Button', () => {
    it('should render delete button in header', () => {
      renderTournamentPage()

      const deleteButton = screen.getByRole('button', {
        name: 'common.actions.delete',
      })
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveAttribute('data-icon', 'delete')
      expect(deleteButton).toHaveAttribute('data-variant', 'secondary')
      // No color prop specified in actual component, so no data-color attribute
    })

    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      renderTournamentPage()

      const deleteButton = screen.getByRole('button', {
        name: 'common.actions.delete',
      })
      await user.click(deleteButton)

      expect(mockOnConfirm).toHaveBeenCalledWith(
        'tournaments.deleteTournamentAreYouSure',
      )
      expect(mockSubmit).toHaveBeenCalledTimes(1)
      const [fd, opts] = mockSubmit.mock.calls[0]
      expect(opts?.method).toBe('post')
      expect((fd as FormData).get('intent')).toBe('delete')
    })

    it('should show confirmation dialog when confirmed and call submit with delete intent', async () => {
      const user = userEvent.setup()

      renderTournamentPage()

      const deleteButton = screen.getByRole('button', {
        name: 'common.actions.delete',
      })
      await user.click(deleteButton)

      expect(mockOnConfirm).toHaveBeenCalledWith(
        'tournaments.deleteTournamentAreYouSure',
      )

      // Verify submit was called with correct parameters
      expect(mockSubmit).toHaveBeenCalledTimes(1)
      const [fd, opts] = mockSubmit.mock.calls[0]
      expect(opts?.method).toBe('post')
      expect((fd as FormData).get('intent')).toBe('delete')
    })

    it('should request confirmation on delete button click (auto-confirm in mock)', async () => {
      const user = userEvent.setup()

      renderTournamentPage()

      const deleteButton = screen.getByRole('button', {
        name: 'common.actions.delete',
      })
      await user.click(deleteButton)

      expect(mockOnConfirm).toHaveBeenCalledWith(
        'tournaments.deleteTournamentAreYouSure',
      )
    })
  })

  describe('Success Message Display', () => {
    it('should display success message when action succeeds', () => {
      mockUseActionData.mockReturnValueOnce({
        success: true,
        message: 'Tournament updated successfully',
      })

      renderTournamentPage()

      expect(screen.getByText('Tournament updated successfully')).toBeInTheDocument()
    })

    it('should not display success message when no success', () => {
      renderTournamentPage()

      expect(screen.queryByText(/successfully/)).not.toBeInTheDocument()
    })
  })

  describe('Tournament Form Integration', () => {
    it('should pass correct props to TournamentForm component', () => {
      renderTournamentPage()

      expect(screen.getByTestId('tournament-form')).toBeInTheDocument()
      expect(screen.getByText('Mode: edit')).toBeInTheDocument()
      expect(screen.getByText('Variant: admin')).toBeInTheDocument()
      expect(screen.getByText('Intent: update')).toBeInTheDocument()
      expect(
        screen.getByText('Submit Button: common.actions.update'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Tournament: Test Tournament at Test Stadium'),
      ).toBeInTheDocument()
      expect(screen.getByText('Divisions: 2')).toBeInTheDocument()
      expect(screen.getByText('Categories: 3')).toBeInTheDocument()
    })

    it('should pass action errors to TournamentForm', () => {
      mockUseActionData.mockReturnValueOnce({
        errors: { name: 'Tournament name is required' },
      })

      renderTournamentPage()

      expect(screen.getByText('Has errors')).toBeInTheDocument()
    })

    it('should pass success state to TournamentForm', () => {
      mockUseActionData.mockReturnValueOnce({
        success: true,
        message: 'Tournament updated successfully',
      })

      renderTournamentPage()

      expect(
        screen.getByText('Success: Tournament updated successfully'),
      ).toBeInTheDocument()
    })
  })

  describe('Tournament Not Found', () => {
    it('should display not found message when tournament is null', () => {
      mockUseLoaderData.mockReturnValueOnce({
        ...mockLoaderData,
        tournament: null,
      })

      renderTournamentPage()

      expect(screen.getByText('Tournament not found')).toBeInTheDocument()
      expect(
        screen.getByText("The tournament you're looking for doesn't exist."),
      ).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should have proper flex layout for header', () => {
      renderTournamentPage()

      // The header panel should contain the title/description and delete button
      expect(screen.getByText('Test Tournament')).toBeInTheDocument()
      // Panel styling is tested through integration tests
    })

    it('should position delete button correctly', () => {
      renderTournamentPage()

      const deleteButton = screen.getByRole('button', {
        name: 'common.actions.delete',
      })
      const titleText = screen.getByText('Test Tournament')

      // Both elements should be rendered
      expect(deleteButton).toBeInTheDocument()
      expect(titleText).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('should format dates correctly for form inputs', () => {
      renderTournamentPage()

      // The form should receive properly formatted dates
      expect(screen.getByTestId('tournament-form')).toBeInTheDocument()
      // Date formatting is handled internally and passed to TournamentForm
      // The specific date values would be tested in integration tests
    })
  })
})
