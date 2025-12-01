import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from '../Badge'

describe('Badge', () => {
	describe('Basic Functionality', () => {
		it('should render with children content', () => {
			render(<Badge>Test Badge</Badge>)
			expect(screen.getByText('Test Badge')).toBeInTheDocument()
		})

		it('should apply custom className', () => {
			render(<Badge className='custom-class'>Content</Badge>)
			const badge = screen.getByText('Content')
			expect(badge).toHaveClass('custom-class')
		})

		it('should render as span element', () => {
			render(<Badge>Content</Badge>)
			const badge = screen.getByText('Content')
			expect(badge.tagName).toBe('SPAN')
		})

		it('should apply base styles', () => {
			render(<Badge>Content</Badge>)
			const badge = screen.getByText('Content')
			expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full')
		})
	})

	describe('Functional Semantic Colors', () => {
		it('should apply brand color styling', () => {
			render(<Badge color='brand'>Brand</Badge>)
			const badge = screen.getByText('Brand')
			expect(badge).toHaveClass('bg-red-600', 'text-red-50')
		})

		it('should apply primary color styling', () => {
			render(<Badge color='primary'>Primary</Badge>)
			const badge = screen.getByText('Primary')
			expect(badge).toHaveClass('bg-emerald-600', 'text-emerald-50')
		})

		it('should apply success color styling', () => {
			render(<Badge color='success'>Success</Badge>)
			const badge = screen.getByText('Success')
			expect(badge).toHaveClass('bg-green-600', 'text-green-50')
		})

		it('should apply error color styling', () => {
			render(<Badge color='error'>Error</Badge>)
			const badge = screen.getByText('Error')
			expect(badge).toHaveClass('bg-red-600', 'text-red-50')
		})

		it('should apply warning color styling', () => {
			render(<Badge color='warning'>Warning</Badge>)
			const badge = screen.getByText('Warning')
			expect(badge).toHaveClass('bg-yellow-600', 'text-yellow-50')
		})

		it('should apply info color styling', () => {
			render(<Badge color='info'>Info</Badge>)
			const badge = screen.getByText('Info')
			expect(badge).toHaveClass('bg-blue-600', 'text-blue-50')
		})

		it('should apply disabled color styling', () => {
			render(<Badge color='disabled'>Disabled</Badge>)
			const badge = screen.getByText('Disabled')
			expect(badge).toHaveClass('bg-slate-600', 'text-slate-50')
		})
	})

	describe('Visual Accent Colors', () => {
		it('should apply accent-amber color styling', () => {
			render(<Badge color='accent-amber'>Amber</Badge>)
			const badge = screen.getByText('Amber')
			expect(badge).toHaveClass('bg-amber-600', 'text-amber-50')
		})

		it('should apply accent-indigo color styling', () => {
			render(<Badge color='accent-indigo'>Indigo</Badge>)
			const badge = screen.getByText('Indigo')
			expect(badge).toHaveClass('bg-indigo-600', 'text-indigo-50')
		})

		it('should apply accent-fuchsia color styling', () => {
			render(<Badge color='accent-fuchsia'>Fuchsia</Badge>)
			const badge = screen.getByText('Fuchsia')
			expect(badge).toHaveClass('bg-fuchsia-600', 'text-fuchsia-50')
		})

		it('should apply accent-teal color styling', () => {
			render(<Badge color='accent-teal'>Teal</Badge>)
			const badge = screen.getByText('Teal')
			expect(badge).toHaveClass('bg-teal-600', 'text-teal-50')
		})

		it('should apply accent-sky color styling', () => {
			render(<Badge color='accent-sky'>Sky</Badge>)
			const badge = screen.getByText('Sky')
			expect(badge).toHaveClass('bg-sky-600', 'text-sky-50')
		})

		it('should apply accent-purple color styling', () => {
			render(<Badge color='accent-purple'>Purple</Badge>)
			const badge = screen.getByText('Purple')
			expect(badge).toHaveClass('bg-purple-600', 'text-purple-50')
		})
	})

	describe('Default Variant', () => {
		it('should apply disabled color by default when no color provided', () => {
			render(<Badge>Default</Badge>)
			const badge = screen.getByText('Default')
			expect(badge).toHaveClass('bg-slate-600', 'text-slate-50')
		})
	})

	describe('Dark Mode Support', () => {
		it('should include dark mode classes for brand color', () => {
			render(<Badge color='brand'>Brand</Badge>)
			const badge = screen.getByText('Brand')
			expect(badge.className).toContain('dark:bg-red-800')
			expect(badge.className).toContain('dark:text-red-50')
		})

		it('should include dark mode classes for primary color', () => {
			render(<Badge color='primary'>Primary</Badge>)
			const badge = screen.getByText('Primary')
			expect(badge.className).toContain('dark:bg-emerald-800')
			expect(badge.className).toContain('dark:text-emerald-50')
		})

		it('should include dark mode classes for accent colors', () => {
			render(<Badge color='accent-fuchsia'>Fuchsia</Badge>)
			const badge = screen.getByText('Fuchsia')
			expect(badge.className).toContain('dark:bg-fuchsia-800')
			expect(badge.className).toContain('dark:text-fuchsia-50')
		})
	})

	describe('Custom ClassName Integration', () => {
		it('should merge custom className with variant classes', () => {
			render(
				<Badge color='success' className='my-custom-class'>
					Success
				</Badge>,
			)
			const badge = screen.getByText('Success')
			expect(badge).toHaveClass('my-custom-class')
			expect(badge).toHaveClass('bg-green-600')
		})

		it('should allow overriding styles with custom className', () => {
			render(
				<Badge color='error' className='custom-padding'>
					Error
				</Badge>,
			)
			const badge = screen.getByText('Error')
			expect(badge).toHaveClass('custom-padding')
			expect(badge).toHaveClass('bg-red-600')
		})
	})
})
