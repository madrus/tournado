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
	getLatinTextClass: () => 'latin-text',
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

		it('should render as a div when no onClick is provided', () => {
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

	describe('Accessibility', () => {
		it('should have proper accessibility attributes for button variant', () => {
			const handleClick = vi.fn()
			render(<TeamChip team={mockTeam} onClick={handleClick} />)

			const chip = screen.getByRole('button')
			expect(chip).toHaveAttribute('type', 'button')
		})
	})

	describe('RTL Support', () => {
		it('should apply latin text class for team names', () => {
			render(<TeamChip team={mockTeam} />)

			const teamText = screen.getByText('FC Test Team A')
			expect(teamText).toHaveClass('latin-text')
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
				'overflow-hidden',
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

		it('should have default padding', () => {
			render(<TeamChip team={mockTeam} />)

			expect(screen.getByTestId('team-chip')).toHaveClass('px-2')
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
})
