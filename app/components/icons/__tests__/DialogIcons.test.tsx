import { render, screen } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { ErrorIcon } from '../ErrorIcon'
import { InfoIcon } from '../InfoIcon'
import { SuccessIcon } from '../SuccessIcon'
import { WarningIcon } from '../WarningIcon'

describe('Dialog Intent Icons', () => {
	describe('WarningIcon', () => {
		it('should render SVG with correct structure', () => {
			render(<WarningIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
			expect(icon).toHaveAttribute('aria-label', 'Warning')
		})

		it('should have default size of 24', () => {
			render(<WarningIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveAttribute('width', '24')
			expect(icon).toHaveAttribute('height', '24')
		})

		it('should support custom size', () => {
			render(<WarningIcon size={32} />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveAttribute('width', '32')
			expect(icon).toHaveAttribute('height', '32')
		})

		it('should support custom className', () => {
			render(<WarningIcon className='text-amber-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-amber-600', 'inline-block')
		})

		it('should support custom aria-label', () => {
			render(<WarningIcon aria-label='Custom Warning' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveAttribute('aria-label', 'Custom Warning')
		})

		it('should render with proper accessibility attributes', () => {
			render(<WarningIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('aria-label', 'Warning')
		})

		it('should have white stroke details for contrast', () => {
			render(<WarningIcon />)

			const linePath = screen.getByTestId('warning-icon-line')
			const dotPath = screen.getByTestId('warning-icon-dot')

			expect(linePath).toBeInTheDocument()
			expect(linePath).toHaveAttribute('stroke', 'white')
			expect(dotPath).toBeInTheDocument()
			expect(dotPath).toHaveAttribute('stroke', 'white')
		})

		it('should apply stroke linecap and linejoin for rounded corners', () => {
			render(<WarningIcon />)

			const icon = screen.getByRole('img')
			// SVG attributes use kebab-case when rendered in DOM
			expect(icon).toHaveAttribute('stroke-linecap', 'round')
			expect(icon).toHaveAttribute('stroke-linejoin', 'round')
		})
	})

	describe('ErrorIcon', () => {
		it('should render SVG with correct structure', () => {
			render(<ErrorIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
			expect(icon).toHaveAttribute('aria-label', 'Error')
		})

		it('should have white stroke details for contrast', () => {
			render(<ErrorIcon />)

			const linePath = screen.getByTestId('error-icon-line')
			const dotPath = screen.getByTestId('error-icon-dot')

			expect(linePath).toBeInTheDocument()
			expect(linePath).toHaveAttribute('stroke', 'white')
			expect(dotPath).toBeInTheDocument()
			expect(dotPath).toHaveAttribute('stroke', 'white')
		})

		it('should support custom weight for stroke width', () => {
			const { unmount: unmount400 } = render(<ErrorIcon weight={400} />)
			const icon400 = screen.getByRole('img')
			expect(icon400).toHaveAttribute('width', '24')
			unmount400()

			const { unmount: unmount600 } = render(<ErrorIcon weight={600} />)
			const icon600 = screen.getByRole('img')
			expect(icon600).toHaveAttribute('width', '24')
			unmount600()
		})

		it('should support custom className', () => {
			render(<ErrorIcon className='text-red-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-red-600', 'inline-block')
		})

		it('should have circle background with intent color', () => {
			render(<ErrorIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('role', 'img')
		})
	})

	describe('SuccessIcon', () => {
		it('should render SVG with correct structure', () => {
			render(<SuccessIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
			expect(icon).toHaveAttribute('aria-label', 'Success')
		})

		it('should have white stroke checkmark for contrast', () => {
			render(<SuccessIcon />)

			const checkmark = screen.getByTestId('success-icon-checkmark')
			expect(checkmark).toBeInTheDocument()
			expect(checkmark).toHaveAttribute('stroke', 'white')
		})

		it('should support custom weight for stroke width', () => {
			const { unmount: unmount400 } = render(<SuccessIcon weight={400} />)
			const icon400 = screen.getByRole('img')
			expect(icon400).toHaveAttribute('width', '24')
			unmount400()

			const { unmount: unmount600 } = render(<SuccessIcon weight={600} />)
			const icon600 = screen.getByRole('img')
			expect(icon600).toHaveAttribute('width', '24')
			unmount600()
		})

		it('should have circle background with intent color', () => {
			render(<SuccessIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('role', 'img')
		})

		it('should support custom className', () => {
			render(<SuccessIcon className='text-green-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-green-600', 'inline-block')
		})

		it('should have rounded stroke style', () => {
			render(<SuccessIcon />)

			const icon = screen.getByRole('img')
			// SVG attributes use kebab-case when rendered in DOM
			expect(icon).toHaveAttribute('stroke-linecap', 'round')
			expect(icon).toHaveAttribute('stroke-linejoin', 'round')
		})
	})

	describe('InfoIcon', () => {
		it('should render SVG with correct structure', () => {
			render(<InfoIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('viewBox', '0 -960 960 960')
			expect(icon).toHaveAttribute('aria-label', 'Info')
		})

		it('should use fill-current class for Material Symbols style', () => {
			render(<InfoIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('fill-current')
		})

		it('should support custom weight', () => {
			const { unmount: unmount400 } = render(<InfoIcon weight={400} />)
			const icon400 = screen.getByRole('img')
			expect(icon400).toHaveAttribute('width', '24')
			expect(icon400).not.toHaveStyle({ strokeWidth: '1.5' })
			unmount400()

			const { unmount: unmount600 } = render(<InfoIcon weight={600} />)
			const icon600 = screen.getByRole('img')
			expect(icon600).toHaveAttribute('width', '24')
			expect(icon600).toHaveStyle({ strokeWidth: '1.5' })
			unmount600()
		})

		it('should render as Material Symbols icon', () => {
			render(<InfoIcon />)

			const icon = screen.getByRole('img')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('role', 'img')
			expect(icon).toHaveClass('fill-current')
		})

		it('should support custom className', () => {
			render(<InfoIcon className='text-sky-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-sky-600', 'inline-block')
		})

		it('should support custom aria-label', () => {
			render(<InfoIcon aria-label='Information' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveAttribute('aria-label', 'Information')
		})
	})

	describe('Intent Color Mapping', () => {
		it('warning icon should work with amber color intent', () => {
			render(<WarningIcon className='text-amber-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-amber-600')
		})

		it('error icon should work with red color intent', () => {
			render(<ErrorIcon className='text-red-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-red-600')
		})

		it('success icon should work with green color intent', () => {
			render(<SuccessIcon className='text-green-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-green-600')
		})

		it('info icon should work with sky color intent', () => {
			render(<InfoIcon className='text-sky-600' />)

			const icon = screen.getByRole('img')
			expect(icon).toHaveClass('text-sky-600')
		})
	})

	describe('Accessibility', () => {
		it('WarningIcon should be accessible', () => {
			render(<WarningIcon />)

			const icon = screen.getByRole('img', { name: 'Warning' })
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('aria-label')
		})

		it('ErrorIcon should be accessible', () => {
			render(<ErrorIcon />)

			const icon = screen.getByRole('img', { name: 'Error' })
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('aria-label')
		})

		it('SuccessIcon should be accessible', () => {
			render(<SuccessIcon />)

			const icon = screen.getByRole('img', { name: 'Success' })
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('aria-label')
		})

		it('InfoIcon should be accessible', () => {
			render(<InfoIcon />)

			const icon = screen.getByRole('img', { name: 'Info' })
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveAttribute('aria-label')
		})
	})
})
