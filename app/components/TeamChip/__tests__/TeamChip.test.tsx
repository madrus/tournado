import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { TeamChip } from '../TeamChip'

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

// Mock RTL utilities
vi.mock('~/utils/rtlUtils', () => ({
  getChipClasses: (language: string) => ({
    container: language === 'ar' ? 'pl-3 pr-2' : 'pl-2 pr-3',
  }),
  getLatinTextClass: () => 'latin-text',
  isRTL: (language: string) => language === 'ar',
}))

// Mock icon rendering
vi.mock('~/utils/iconUtils', () => ({
  renderIcon: (iconName: string, props: { className?: string }) => (
    <span data-testid={`icon-${iconName}`} className={props.className}>
      {iconName}
    </span>
  ),
}))

// Mock cn utility
vi.mock('~/utils/misc', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
}))

const mockTeam = {
  id: 'team-1',
  clubName: 'FC Test',
  name: 'Team A',
}

describe('TeamChip Component', () => {
  describe('Basic Rendering', () => {
    it('should render team name correctly', () => {
      render(<TeamChip team={mockTeam} />)

      expect(screen.getByText('FC Test Team A')).toBeInTheDocument()
    })

    it('should render as a div when no onClick or showActions', () => {
      render(<TeamChip team={mockTeam} />)

      const chip = screen.getByTestId('team-chip')
      expect(chip.tagName).toBe('DIV')
      expect(chip).not.toHaveAttribute('role')
    })

    it('should apply custom className', () => {
      render(<TeamChip team={mockTeam} className='custom-class' />)

      expect(screen.getByTestId('team-chip')).toHaveClass('custom-class')
    })
  })

  describe('Click Functionality', () => {
    it('should render as button when onClick is provided', () => {
      const handleClick = vi.fn()
      render(<TeamChip team={mockTeam} onClick={handleClick} />)

      const chip = screen.getByRole('button')
      expect(chip).toBeInTheDocument()
      expect(chip.tagName).toBe('BUTTON')
    })

    it('should call onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<TeamChip team={mockTeam} onClick={handleClick} />)

      const chip = screen.getByRole('button')
      fireEvent.click(chip)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should add cursor-pointer class when onClick is provided', () => {
      const handleClick = vi.fn()
      render(<TeamChip team={mockTeam} onClick={handleClick} />)

      expect(screen.getByTestId('team-chip')).toHaveClass('cursor-pointer')
    })
  })

  describe('Admin Actions', () => {
    it('should render as div with button role when showActions is true', () => {
      const handleClick = vi.fn()
      const handleDelete = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const chip = screen.getAllByRole('button')[0]
      expect(chip.tagName).toBe('DIV')
      expect(chip).toHaveAttribute('role', 'button')
      expect(chip).toHaveAttribute('tabIndex', '0')
      expect(chip).toHaveAttribute('aria-pressed', 'false')
    })

    it('should render delete button when showActions and onDelete are provided', () => {
      const handleDelete = vi.fn()

      render(<TeamChip team={mockTeam} showActions={true} onDelete={handleDelete} />)

      const deleteButton = screen.getByLabelText('Delete team FC Test Team A')
      expect(deleteButton).toBeInTheDocument()
    })

    it('should call onDelete when delete button is clicked', () => {
      const handleDelete = vi.fn()
      const handleClick = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const deleteButton = screen.getByLabelText('Delete team FC Test Team A')
      fireEvent.click(deleteButton)

      expect(handleDelete).toHaveBeenCalledTimes(1)
      expect(handleClick).not.toHaveBeenCalled() // Should not propagate
    })

    it('should stop propagation on delete button click', () => {
      const handleDelete = vi.fn()
      const handleClick = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const deleteButton = screen.getByLabelText('Delete team FC Test Team A')
      fireEvent.click(deleteButton)

      expect(handleDelete).toHaveBeenCalledTimes(1)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not render delete button when showActions is true but onDelete is not provided', () => {
      render(<TeamChip team={mockTeam} showActions={true} />)

      expect(screen.queryByLabelText(/Delete team/)).not.toBeInTheDocument()
    })

    it('should apply admin chip classes when showActions and onDelete are provided', () => {
      const handleDelete = vi.fn()
      render(<TeamChip team={mockTeam} showActions={true} onDelete={handleDelete} />)

      expect(screen.getByTestId('team-chip')).toHaveClass('pl-2 pr-3') // LTR chip classes
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle Enter key on admin chip', () => {
      const handleClick = vi.fn()
      const handleDelete = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const chip = screen.getAllByRole('button')[0]
      fireEvent.keyDown(chip, { key: 'Enter' })

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle Space key on admin chip', () => {
      const handleClick = vi.fn()
      const handleDelete = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const chip = screen.getAllByRole('button')[0]
      fireEvent.keyDown(chip, { key: ' ' })

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not handle other keys on admin chip', () => {
      const handleClick = vi.fn()
      const handleDelete = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const chip = screen.getAllByRole('button')[0]
      fireEvent.keyDown(chip, { key: 'Escape' })

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should call onClick handler on Enter and Space keys', () => {
      const handleClick = vi.fn()
      const handleDelete = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const chip = screen.getAllByRole('button')[0]

      // Test Enter key triggers onClick
      fireEvent.keyDown(chip, { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledTimes(1)

      // Test Space key triggers onClick
      fireEvent.keyDown(chip, { key: ' ' })
      expect(handleClick).toHaveBeenCalledTimes(2)

      // Test other keys don't trigger onClick
      fireEvent.keyDown(chip, { key: 'Escape' })
      expect(handleClick).toHaveBeenCalledTimes(2) // Should still be 2
    })
  })

  describe('Accessibility', () => {
    it('should have proper accessibility attributes for button variant', () => {
      const handleClick = vi.fn()
      render(<TeamChip team={mockTeam} onClick={handleClick} />)

      const chip = screen.getByRole('button')
      expect(chip).toHaveAttribute('type', 'button')
    })

    it('should have proper accessibility attributes for admin variant', () => {
      const handleClick = vi.fn()
      const handleDelete = vi.fn()

      render(
        <TeamChip
          team={mockTeam}
          onClick={handleClick}
          showActions={true}
          onDelete={handleDelete}
        />
      )

      const chip = screen.getAllByRole('button')[0]
      expect(chip).toHaveAttribute('role', 'button')
      expect(chip).toHaveAttribute('tabIndex', '0')
      expect(chip).toHaveAttribute('aria-pressed', 'false')
    })

    it('should have proper delete button accessibility', () => {
      const handleDelete = vi.fn()

      render(<TeamChip team={mockTeam} showActions={true} onDelete={handleDelete} />)

      const deleteButton = screen.getByLabelText('Delete team FC Test Team A')
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete team FC Test Team A')
    })
  })

  describe('RTL Support', () => {
    it('should apply latin text class for team names', () => {
      render(<TeamChip team={mockTeam} />)

      const teamText = screen.getByText('FC Test Team A')
      expect(teamText).toHaveClass('latin-text')
    })

    it('should apply correct chip classes for admin mode', () => {
      const handleDelete = vi.fn()
      render(<TeamChip team={mockTeam} showActions={true} onDelete={handleDelete} />)

      expect(screen.getByTestId('team-chip')).toHaveClass('pl-2 pr-3') // LTR chip classes (based on mocked language)
    })
  })

  describe('CSS Classes', () => {
    it('should have correct base CSS classes', () => {
      render(<TeamChip team={mockTeam} />)

      const chip = screen.getByTestId('team-chip')
      expect(chip).toHaveClass(
        'inline-flex',
        'h-10',
        'items-center',
        'rounded-lg',
        'border',
        'border-red-600',
        'dark:!border-slate-100',
        'bg-background',
        'dark:bg-brand-700',
        'font-semibold',
        'text-brand',
        'transition-all',
        'duration-300',
        'ease-out',
        'relative',
        'overflow-hidden'
      )
    })

    it('should have hover and focus classes when interactive', () => {
      render(<TeamChip team={mockTeam} onClick={vi.fn()} />)

      const chip = screen.getByTestId('team-chip')

      // Check key interactive classes
      expect(chip).toHaveClass('cursor-pointer')
      expect(chip).toHaveClass('hover:scale-105')
      expect(chip).toHaveClass('active:scale-95')

      // Check ring system classes
      expect(chip).toHaveClass('focus-visible:ring-2')
      expect(chip).toHaveClass('hover:ring-2')
      expect(chip).toHaveClass('focus:outline-none')

      // Check shadow classes
      expect(chip).toHaveClass('shadow-lg')
      expect(chip).toHaveClass('hover:shadow-xl')
    })

    it('should have default padding when not in admin mode', () => {
      render(<TeamChip team={mockTeam} />)

      expect(screen.getByTestId('team-chip')).toHaveClass('px-3')
    })
  })

  describe('Team Data Variations', () => {
    it('should handle different team names', () => {
      const team = {
        id: 'team-2',
        name: 'Juvenil A',
        clubName: 'Real Madrid',
      }

      render(<TeamChip team={team} />)

      expect(screen.getByText('Real Madrid Juvenil A')).toBeInTheDocument()
    })

    it('should handle special characters in team names', () => {
      const team = {
        id: 'team-3',
        name: 'U-21 Ñ',
        clubName: 'FC São Paulo',
      }

      render(<TeamChip team={team} />)

      expect(screen.getByText('FC São Paulo U-21 Ñ')).toBeInTheDocument()
    })

    it('should truncate long team names', () => {
      const team = {
        id: 'team-4',
        name: 'Very Long Team Name That Should Also Be Truncated',
        clubName: 'Very Long Club Name That Should Be Truncated',
      }

      render(<TeamChip team={team} />)

      const teamText = screen.getByText(/Very Long Club Name/)
      expect(teamText).toHaveClass('truncate')
    })
  })

  describe('Icon Rendering', () => {
    it('should render close icon in delete button', () => {
      const handleDelete = vi.fn()

      render(<TeamChip team={mockTeam} showActions={true} onDelete={handleDelete} />)

      const closeIcon = screen.getByTestId('icon-close')
      expect(closeIcon).toBeInTheDocument()
      expect(closeIcon).toHaveClass('h-4 w-4')
    })
  })
})
