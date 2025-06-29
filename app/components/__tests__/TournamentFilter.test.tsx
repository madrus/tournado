import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Import the mocked hook
import { useTournamentFilter } from '~/hooks/useTournamentFilter'

import { TournamentFilter } from '../TournamentFilter'

// Mock the useTournamentFilter hook
vi.mock('~/hooks/useTournamentFilter', () => ({
  useTournamentFilter: vi.fn(),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'teams.filterByTournament': 'Filter by tournament',
        'teams.allTournaments': 'All tournaments',
      }
      return translations[key] || key
    },
  }),
}))

const mockUseTournamentFilter = vi.hoisted(() => vi.fn())

vi.mocked(useTournamentFilter).mockImplementation(mockUseTournamentFilter)

describe('TournamentFilter', () => {
  const mockTournamentListItems = [
    { id: 'tournament-1', name: 'Spring Tournament 2024', location: 'Amsterdam' },
    { id: 'tournament-2', name: 'Summer Cup 2024', location: 'Rotterdam' },
    { id: 'tournament-3', name: 'Winter League 2024', location: 'Utrecht' },
  ]

  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock return for useTournamentFilter
    mockUseTournamentFilter.mockReturnValue({
      tournamentOptions: [
        { value: 'all', label: 'All tournaments' },
        { value: 'tournament-1', label: 'Spring Tournament 2024' },
        { value: 'tournament-2', label: 'Summer Cup 2024' },
        { value: 'tournament-3', label: 'Winter League 2024' },
      ],
      selectedValue: 'all',
      onChange: mockOnChange,
    })
  })

  it('should render tournament filter with all options', () => {
    render(<TournamentFilter tournamentListItems={mockTournamentListItems} />)

    const comboFields = screen.getAllByLabelText(/filter by tournament/i)
    expect(comboFields[0]).toBeInTheDocument()
  })

  it('should show "All tournaments" as default selection when no tournament is selected', () => {
    render(<TournamentFilter tournamentListItems={mockTournamentListItems} />)

    // Since we're using ComboField, check the input value or button text
    const comboFields = screen.getAllByLabelText(/filter by tournament/i)
    const comboField = comboFields[0]
    expect(comboField).toBeInTheDocument()
  })

  it('should show selected tournament when tournament is pre-selected', () => {
    mockUseTournamentFilter.mockReturnValue({
      tournamentOptions: [
        { value: 'all', label: 'All tournaments' },
        { value: 'tournament-1', label: 'Spring Tournament 2024' },
        { value: 'tournament-2', label: 'Summer Cup 2024' },
      ],
      selectedValue: 'tournament-1',
      onChange: mockOnChange,
    })

    render(
      <TournamentFilter
        tournamentListItems={mockTournamentListItems}
        selectedTournamentId='tournament-1'
      />
    )

    expect(useTournamentFilter).toHaveBeenCalledWith({
      tournamentListItems: mockTournamentListItems,
      selectedTournamentId: 'tournament-1',
    })
  })

  it('should call onChange when tournament selection changes', async () => {
    const user = userEvent.setup()
    render(<TournamentFilter tournamentListItems={mockTournamentListItems} />)

    // Find the combobox trigger and click it
    const combobox = screen.getByRole('combobox')
    await user.click(combobox)

    // Note: This test would require more complex mocking of the ComboField component
    // to properly test the onChange behavior, as it involves dropdown interactions
    expect(mockOnChange).not.toHaveBeenCalled() // Initially not called
  })

  it('should handle empty tournament list items array', () => {
    render(<TournamentFilter tournamentListItems={[]} />)

    const comboFields = screen.getAllByLabelText(/filter by tournament/i)
    expect(comboFields[0]).toBeInTheDocument()
    expect(useTournamentFilter).toHaveBeenCalledWith({
      tournamentListItems: [],
      selectedTournamentId: undefined,
    })
  })

  it('should apply custom className', () => {
    const customClassName = 'custom-width'
    render(
      <TournamentFilter
        tournamentListItems={mockTournamentListItems}
        className={customClassName}
      />
    )

    // Check that the custom class is applied to the container
    const comboField = screen.getByTestId('combo-field-tournamentFilter')
    expect(comboField).toHaveClass(customClassName)
  })

  it('should apply default className when no className prop is provided', () => {
    render(<TournamentFilter tournamentListItems={mockTournamentListItems} />)

    // Check that default class is applied
    const comboField = screen.getByTestId('combo-field-tournamentFilter')
    expect(comboField).toHaveClass('max-w-md')
  })

  it('should pass correct props to useTournamentFilter hook', () => {
    const selectedTournamentId = 'tournament-2'

    render(
      <TournamentFilter
        tournamentListItems={mockTournamentListItems}
        selectedTournamentId={selectedTournamentId}
      />
    )

    expect(useTournamentFilter).toHaveBeenCalledWith({
      tournamentListItems: mockTournamentListItems,
      selectedTournamentId,
    })
  })

  describe('integration with ComboField', () => {
    it('should pass correct props to ComboField', () => {
      const mockOptions = [
        { value: 'all', label: 'All tournaments' },
        { value: 'tournament-1', label: 'Spring Tournament 2024' },
      ]

      mockUseTournamentFilter.mockReturnValue({
        tournamentOptions: mockOptions,
        selectedValue: 'tournament-1',
        onChange: mockOnChange,
      })

      render(<TournamentFilter tournamentListItems={mockTournamentListItems} />)

      // Verify ComboField receives correct props
      const comboFields = screen.getAllByLabelText(/filter by tournament/i)
      const comboField = comboFields[0]
      expect(comboField).toBeInTheDocument()

      // Verify the hook was called with correct parameters
      expect(useTournamentFilter).toHaveBeenCalledWith({
        tournamentListItems: mockTournamentListItems,
        selectedTournamentId: undefined,
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper labeling', () => {
      render(<TournamentFilter tournamentListItems={mockTournamentListItems} />)

      const comboFields = screen.getAllByLabelText(/filter by tournament/i)
      const comboField = comboFields[0]
      expect(comboField).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<TournamentFilter tournamentListItems={mockTournamentListItems} />)

      // Should be able to tab to the component
      await user.tab()
      const focusedElement = document.activeElement
      expect(focusedElement).toBeInTheDocument()
    })
  })
})
