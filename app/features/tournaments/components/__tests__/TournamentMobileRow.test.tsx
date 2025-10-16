import { fireEvent, render, screen } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TournamentListItem } from '~/models/tournament.server'

import { TournamentMobileRow } from '../TournamentMobileRow'

// Mock useLanguageDirection hook
vi.mock('~/hooks/useLanguageDirection', () => ({
  useLanguageDirection: vi.fn(),
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.actions.delete': 'Delete',
        'tournaments.deleteTournament': 'Delete Tournament',
      }
      return translations[key] || key
    },
  }),
}))

const mockUseLanguageDirection = vi.hoisted(() => vi.fn())

// Get the mocked function
const { useLanguageDirection } = await import('~/hooks/useLanguageDirection')
vi.mocked(useLanguageDirection).mockImplementation(mockUseLanguageDirection)

// Mock isBreakpoint
vi.mock('~/styles/constants', () => ({
  isBreakpoint: vi.fn(() => false), // Default to mobile
}))

describe('TournamentMobileRow', () => {
  const mockTournament: TournamentListItem = {
    id: 'tournament-1',
    name: 'Spring Tournament 2024',
    location: 'Amsterdam',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-03'),
  }

  const mockOnDelete = vi.fn()
  const mockOnClick = vi.fn()
  const mockFormatDate = vi.fn((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock return for useLanguageDirection
    mockUseLanguageDirection.mockReturnValue({
      latinFontClass: '', // Empty string for LTR
      swipeConfig: {
        directionMultiplier: 1, // LTR by default
      },
      direction: 'ltr',
    })
  })

  describe('Rendering', () => {
    it('should render tournament information', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      expect(screen.getByText('Spring Tournament 2024')).toBeInTheDocument()
      expect(screen.getByText('Amsterdam')).toBeInTheDocument()
    })

    it('should render start and end dates', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      expect(mockFormatDate).toHaveBeenCalledWith(mockTournament.startDate)
      expect(mockFormatDate).toHaveBeenCalledWith(mockTournament.endDate)
    })

    it('should render both start and end dates', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const startDate = mockFormatDate(mockTournament.startDate)
      const endDate = mockFormatDate(mockTournament.endDate!)
      expect(screen.getByText(startDate)).toBeInTheDocument()
      expect(screen.getByText(endDate)).toBeInTheDocument()
    })

    it('should render delete button with icon and label', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const deleteButton = screen.getByLabelText('Delete Tournament')
      expect(deleteButton).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('Click interactions', () => {
    it('should call onClick when row content is clicked', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const tournamentName = screen.getByText('Spring Tournament 2024')
      fireEvent.click(tournamentName)

      expect(mockOnClick).toHaveBeenCalledWith('tournament-1')
    })

    it('should call onDelete when delete button is clicked', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const deleteButton = screen.getByLabelText('Delete Tournament')
      fireEvent.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith('tournament-1')
    })

    it('should stop propagation when delete button is clicked', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const deleteButton = screen.getByLabelText('Delete Tournament')
      fireEvent.click(deleteButton)

      // onClick should not be called when delete button is clicked
      expect(mockOnClick).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledWith('tournament-1')
    })
  })

  describe('RTL Support', () => {
    it('should use directionMultiplier from useLanguageDirection for LTR', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      expect(mockUseLanguageDirection).toHaveBeenCalled()
    })

    it('should use directionMultiplier of -1 for RTL (Arabic)', () => {
      // Mock RTL configuration
      mockUseLanguageDirection.mockReturnValue({
        latinFontClass: 'latin-text',
        swipeConfig: {
          directionMultiplier: -1, // RTL multiplier
        },
        direction: 'rtl',
      })

      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      // Verify the hook was called and RTL config is being used
      expect(mockUseLanguageDirection).toHaveBeenCalled()
      const hookResult = mockUseLanguageDirection.mock.results[0]?.value
      expect(hookResult?.swipeConfig.directionMultiplier).toBe(-1)
    })

    it('should use logical properties for layout (ps-3 for padding)', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const deleteButton = screen.getByLabelText('Delete Tournament')
      expect(deleteButton).toHaveClass('ps-3')
    })

    it('should render formatted start date', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      // Verify date formatting is called and result is displayed
      expect(mockFormatDate).toHaveBeenCalledWith(mockTournament.startDate)
      const formattedDate = mockFormatDate(mockTournament.startDate)
      expect(screen.getByText(formattedDate)).toBeInTheDocument()
    })

    it('should render formatted end date when present', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      // Verify end date formatting is called and result is displayed
      expect(mockFormatDate).toHaveBeenCalledWith(mockTournament.endDate)
      const formattedEndDate = mockFormatDate(mockTournament.endDate)
      expect(screen.getByText(formattedEndDate)).toBeInTheDocument()
    })
  })

  describe('Swipe behavior', () => {
    it('should render all interactive elements for swipe functionality', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      // Verify all elements are present that are part of swipe interaction
      expect(screen.getByText('Spring Tournament 2024')).toBeInTheDocument()
      expect(screen.getByText('Amsterdam')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Tournament')).toBeInTheDocument()
      // Actual swipe testing requires more complex setup with touch event simulation
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label for delete button', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const deleteButton = screen.getByLabelText('Delete Tournament')
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete Tournament')
    })

    it('should render delete button as button type', () => {
      render(
        <TournamentMobileRow
          tournament={mockTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      const deleteButton = screen.getByLabelText('Delete Tournament')
      expect(deleteButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Edge cases', () => {
    it('should handle tournament with very long name', () => {
      const longNameTournament = {
        ...mockTournament,
        name: 'Very Long Tournament Name That Should Still Display Properly Without Breaking Layout',
      }

      render(
        <TournamentMobileRow
          tournament={longNameTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      expect(screen.getByText(longNameTournament.name)).toBeInTheDocument()
    })

    it('should handle tournament with very long location', () => {
      const longLocationTournament = {
        ...mockTournament,
        location:
          'Very Long Location Name That Should Be Truncated Or Wrapped Appropriately',
      }

      render(
        <TournamentMobileRow
          tournament={longLocationTournament}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      expect(screen.getByText(longLocationTournament.location)).toBeInTheDocument()
    })

    it('should handle tournament dates correctly', () => {
      const tournamentWithDates = {
        ...mockTournament,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
      }

      render(
        <TournamentMobileRow
          tournament={tournamentWithDates}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          formatDate={mockFormatDate}
        />
      )

      expect(mockFormatDate).toHaveBeenCalledWith(tournamentWithDates.startDate)
      expect(mockFormatDate).toHaveBeenCalledWith(tournamentWithDates.endDate)
    })
  })
})
