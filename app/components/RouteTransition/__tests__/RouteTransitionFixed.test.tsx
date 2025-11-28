import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RouteTransitionFixed } from '../RouteTransitionFixed'

describe('RouteTransitionFixed', () => {
	beforeEach(() => {
		vi.clearAllTimers()
		vi.useFakeTimers()
	})

	describe('Rendering', () => {
		it('should render children via Outlet', () => {
			render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionFixed />}>
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
						<Route element={<RouteTransitionFixed className='custom-class' />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.custom-class')
			expect(wrapper).toBeInTheDocument()
		})

		it('should have transition-opacity class', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionFixed />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-opacity')
			expect(wrapper).toBeInTheDocument()
		})

		it('should have ease-in-out class', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionFixed />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.ease-in-out')
			expect(wrapper).toBeInTheDocument()
		})
	})

	describe('Transition Duration', () => {
		it('should use default duration of 300ms', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionFixed />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-opacity') as HTMLElement
			expect(wrapper?.style.transitionDuration).toBe('300ms')
		})

		it('should accept custom duration', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionFixed duration={500} />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-opacity') as HTMLElement
			expect(wrapper?.style.transitionDuration).toBe('500ms')
		})
	})

	describe('Opacity Management', () => {
		it('should start with opacity 1 (stable stage)', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionFixed />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-opacity') as HTMLElement
			expect(wrapper?.style.opacity).toBe('1')
		})
	})

	describe('Props Type Safety', () => {
		it('should accept all valid TransitionWithDurationProps', () => {
			render(
				<MemoryRouter>
					<Routes>
						<Route
							element={<RouteTransitionFixed duration={400} className='test-class' />}
						>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			expect(screen.getByText('Content')).toBeInTheDocument()
		})

		it('should work with minimal props', () => {
			render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionFixed />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			expect(screen.getByText('Content')).toBeInTheDocument()
		})
	})
})
