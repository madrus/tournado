import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewTransition } from '../ViewTransition'

describe('ViewTransition', () => {
	beforeEach(() => {
		// Mock the View Transition API
		delete (document as { startViewTransition?: unknown }).startViewTransition
	})

	describe('Rendering', () => {
		it('should render children via Outlet', () => {
			render(
				<MemoryRouter>
					<Routes>
						<Route element={<ViewTransition />}>
							<Route path='/' element={<div>Test Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			expect(screen.getByText('Test Content')).toBeInTheDocument()
		})

		it('should apply custom className', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<ViewTransition className='custom-class' />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.firstChild as HTMLElement
			expect(wrapper).toHaveClass('custom-class')
		})
	})

	describe('View Transition API', () => {
		it('should call startViewTransition when API is available', () => {
			const mockStartViewTransition = vi.fn()
			;(
				document as Document & { startViewTransition: typeof mockStartViewTransition }
			).startViewTransition = mockStartViewTransition

			render(
				<MemoryRouter>
					<Routes>
						<Route element={<ViewTransition />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			expect(mockStartViewTransition).toHaveBeenCalled()
		})

		it('should not throw error when API is not available', () => {
			expect(() => {
				render(
					<MemoryRouter>
						<Routes>
							<Route element={<ViewTransition />}>
								<Route path='/' element={<div>Content</div>} />
							</Route>
						</Routes>
					</MemoryRouter>,
				)
			}).not.toThrow()

			expect(screen.getByText('Content')).toBeInTheDocument()
		})
	})

	describe('Props Type Safety', () => {
		it('should accept all valid BaseTransitionProps', () => {
			render(
				<MemoryRouter>
					<Routes>
						<Route element={<ViewTransition className='test-class' />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			expect(screen.getByText('Content')).toBeInTheDocument()
		})
	})
})
