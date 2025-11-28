import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { PanelBackground } from '../PanelBackground'

// Mock cn utility
vi.mock('~/utils/misc', () => ({
	cn: (...classes: (string | boolean | undefined)[]) =>
		classes.filter(Boolean).join(' '),
}))

describe('PanelBackground Component', () => {
	describe('Basic Rendering', () => {
		it('should render with background color', () => {
			render(<PanelBackground backgroundColor='bg-emerald-800' data-testid='test-bg' />)

			const background = screen.getByTestId('test-bg')
			expect(background).toBeInTheDocument()
			expect(background).toHaveClass('bg-emerald-800')
		})

		it('should apply absolute positioning classes', () => {
			render(<PanelBackground backgroundColor='bg-blue-900' data-testid='test-bg-2' />)

			const background = screen.getByTestId('test-bg-2')
			expect(background).toHaveClass('absolute')
			expect(background).toHaveClass('inset-0')
		})

		it('should apply custom className when provided', () => {
			render(
				<PanelBackground
					backgroundColor='bg-red-800'
					className='custom-class'
					data-testid='test-bg-3'
				/>,
			)

			const background = screen.getByTestId('test-bg-3')
			expect(background).toHaveClass('bg-red-800')
			expect(background).toHaveClass('custom-class')
			expect(background).toHaveClass('absolute')
			expect(background).toHaveClass('inset-0')
		})

		it('should apply data-testid when provided', () => {
			render(
				<PanelBackground
					backgroundColor='bg-slate-800'
					data-testid='custom-background'
				/>,
			)

			expect(screen.getByTestId('custom-background')).toBeInTheDocument()
		})

		it('should not have data-testid when not provided', () => {
			render(<PanelBackground backgroundColor='bg-purple-800' />)

			// Should not find element by test id when none provided
			expect(screen.queryByTestId('any-test-id')).not.toBeInTheDocument()
		})
	})

	describe('Background Color Variations', () => {
		it('should handle Tailwind gradient backgrounds', () => {
			render(
				<PanelBackground
					backgroundColor='bg-gradient-to-br from-blue-950 via-blue-900 to-blue-900'
					data-testid='gradient-bg'
				/>,
			)

			const background = screen.getByTestId('gradient-bg')
			expect(background).toHaveClass('bg-gradient-to-br')
			expect(background).toHaveClass('from-blue-950')
			expect(background).toHaveClass('via-blue-900')
			expect(background).toHaveClass('to-blue-900')
		})

		it('should handle solid color backgrounds', () => {
			render(
				<PanelBackground backgroundColor='bg-emerald-800' data-testid='solid-bg' />,
			)

			const background = screen.getByTestId('solid-bg')
			expect(background).toHaveClass('bg-emerald-800')
		})

		it('should handle transparent backgrounds', () => {
			render(
				<PanelBackground
					backgroundColor='bg-transparent'
					data-testid='transparent-bg'
				/>,
			)

			const background = screen.getByTestId('transparent-bg')
			expect(background).toHaveClass('bg-transparent')
		})

		it('should handle opacity backgrounds', () => {
			render(<PanelBackground backgroundColor='bg-black/50' data-testid='opacity-bg' />)

			const background = screen.getByTestId('opacity-bg')
			expect(background).toHaveClass('bg-black/50')
		})
	})

	describe('Class Combination', () => {
		it('should combine all classes correctly', () => {
			render(
				<PanelBackground
					backgroundColor='bg-teal-800'
					className='z-10 opacity-50'
					data-testid='combined-background'
				/>,
			)

			const background = screen.getByTestId('combined-background')
			expect(background).toHaveClass('absolute')
			expect(background).toHaveClass('inset-0')
			expect(background).toHaveClass('bg-teal-800')
			expect(background).toHaveClass('z-10')
			expect(background).toHaveClass('opacity-50')
		})

		it('should not break with empty className', () => {
			render(
				<PanelBackground
					backgroundColor='bg-slate-900'
					className=''
					data-testid='empty-class-bg'
				/>,
			)

			const background = screen.getByTestId('empty-class-bg')
			expect(background).toHaveClass('absolute')
			expect(background).toHaveClass('inset-0')
			expect(background).toHaveClass('bg-slate-900')
		})

		it('should handle undefined className gracefully', () => {
			render(
				<PanelBackground
					backgroundColor='bg-indigo-800'
					className={undefined}
					data-testid='undefined-class-bg'
				/>,
			)

			const background = screen.getByTestId('undefined-class-bg')
			expect(background).toHaveClass('absolute')
			expect(background).toHaveClass('inset-0')
			expect(background).toHaveClass('bg-indigo-800')
		})
	})

	describe('Accessibility', () => {
		it('should be a generic div element', () => {
			render(<PanelBackground backgroundColor='bg-rose-800' data-testid='div-test' />)

			const background = screen.getByTestId('div-test')
			expect(background.tagName).toBe('DIV')
		})

		it('should not have any interactive elements', () => {
			render(
				<PanelBackground backgroundColor='bg-cyan-800' data-testid='non-interactive' />,
			)

			const background = screen.getByTestId('non-interactive')
			expect(background).not.toHaveAttribute('onclick')
			expect(background).not.toHaveAttribute('onkeydown')
			expect(background).not.toHaveAttribute('tabindex')
			expect(background).not.toHaveAttribute('role', 'button')
		})
	})

	describe('Edge Cases', () => {
		it('should handle very long background class names', () => {
			const longClassName =
				'bg-gradient-to-br from-purple-950 via-purple-900 to-purple-900 opacity-90 transition-all duration-500'

			render(
				<PanelBackground backgroundColor={longClassName} data-testid='long-class-bg' />,
			)

			const background = screen.getByTestId('long-class-bg')
			expect(background).toHaveClass('bg-gradient-to-br')
			expect(background).toHaveClass('from-purple-950')
			expect(background).toHaveClass('via-purple-900')
			expect(background).toHaveClass('to-purple-900')
			expect(background).toHaveClass('opacity-90')
			expect(background).toHaveClass('transition-all')
			expect(background).toHaveClass('duration-500')
		})

		it('should handle empty background color gracefully', () => {
			render(<PanelBackground backgroundColor='' data-testid='empty-bg' />)

			const background = screen.getByTestId('empty-bg')
			expect(background).toHaveClass('absolute')
			expect(background).toHaveClass('inset-0')
			// Empty background color should still render
			expect(background).toBeInTheDocument()
		})
	})
})
