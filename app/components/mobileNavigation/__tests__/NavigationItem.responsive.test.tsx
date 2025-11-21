import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { describe, expect, it, vi } from 'vitest'

import NavigationItem from '../NavigationItem'

// Mock the useMediaQuery hook
vi.mock('~/hooks/useMediaQuery', () => ({
	useMediaQuery: vi.fn(),
}))

function renderWithRouter(component: React.ReactElement, initialEntries = ['/']) {
	const router = createMemoryRouter(
		[
			{
				path: '/',
				element: component,
			},
			{
				path: '/teams',
				element: <div>Teams</div>,
			},
		],
		{ initialEntries },
	)

	return render(<RouterProvider router={router} />)
}

describe('NavigationItem - Responsive Sizing', () => {
	it('should use 32px icon size on mobile breakpoint', async () => {
		const { useMediaQuery } = await import('~/hooks/useMediaQuery')
		vi.mocked(useMediaQuery).mockReturnValue(true) // Mobile

		renderWithRouter(<NavigationItem to='/teams' icon='apparel' label='Teams' />)

		const icon = screen.getByTestId('nav-icon')
		expect(icon).toHaveAttribute('width', '32')
		expect(icon).toHaveAttribute('height', '32')
	})

	it('should use 36px icon size on desktop breakpoint', async () => {
		const { useMediaQuery } = await import('~/hooks/useMediaQuery')
		vi.mocked(useMediaQuery).mockReturnValue(false) // Desktop

		renderWithRouter(<NavigationItem to='/teams' icon='apparel' label='Teams' />)

		const icon = screen.getByTestId('nav-icon')
		expect(icon).toHaveAttribute('width', '36')
		expect(icon).toHaveAttribute('height', '36')
	})

	it('should use custom iconSize when provided regardless of breakpoint', async () => {
		const { useMediaQuery } = await import('~/hooks/useMediaQuery')
		vi.mocked(useMediaQuery).mockReturnValue(true) // Mobile

		renderWithRouter(<NavigationItem to='/teams' icon='apparel' label='Teams' iconSize={48} />)

		const icon = screen.getByTestId('nav-icon')
		expect(icon).toHaveAttribute('width', '48')
		expect(icon).toHaveAttribute('height', '48')
	})

	it('should call useMediaQuery with correct breakpoint', async () => {
		const { useMediaQuery } = await import('~/hooks/useMediaQuery')
		const mockUseMediaQuery = vi.mocked(useMediaQuery)
		mockUseMediaQuery.mockReturnValue(false)

		renderWithRouter(<NavigationItem to='/teams' icon='apparel' label='Teams' />)

		expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: 767px)')
	})

	it('should maintain proper navigation functionality regardless of icon size', async () => {
		const { useMediaQuery } = await import('~/hooks/useMediaQuery')
		vi.mocked(useMediaQuery).mockReturnValue(true)

		renderWithRouter(<NavigationItem to='/teams' icon='apparel' label='Teams' />)

		const link = screen.getByRole('link', { name: 'Navigate to Teams' })
		expect(link).toHaveAttribute('href', '/teams')
		expect(link).toBeInTheDocument()
	})
})
