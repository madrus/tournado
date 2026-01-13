import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { RouteTransitionAdvanced } from '../RouteTransitionAdvanced'

describe('RouteTransitionAdvanced', () => {
	describe('Rendering', () => {
		it('should render children via Outlet', () => {
			render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionAdvanced />}>
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
						<Route element={<RouteTransitionAdvanced className='custom-class' />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.custom-class')
			expect(wrapper).toBeInTheDocument()
		})

		it('should have transition-all class', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionAdvanced />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-all')
			expect(wrapper).toBeInTheDocument()
		})

		it('should have ease-in-out class', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionAdvanced />}>
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
						<Route element={<RouteTransitionAdvanced />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-all') as HTMLElement
			expect(wrapper?.style.transitionDuration).toBe('300ms')
		})

		it('should accept custom duration', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionAdvanced duration={500} />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-all') as HTMLElement
			expect(wrapper?.style.transitionDuration).toBe('500ms')
		})
	})

	describe('Transition Stage Management', () => {
		it('should start with stable stage (opacity-100 and scale-100)', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionAdvanced />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-all')
			expect(wrapper).toHaveClass('opacity-100')
			expect(wrapper).toHaveClass('scale-100')
		})

		it('should apply correct classes for stable stage', () => {
			const { container } = render(
				<MemoryRouter>
					<Routes>
						<Route element={<RouteTransitionAdvanced />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			const wrapper = container.querySelector('.transition-all')
			expect(wrapper).toHaveClass('opacity-100')
			expect(wrapper).toHaveClass('transform')
			expect(wrapper).toHaveClass('scale-100')
		})
	})

	describe('Props Type Safety', () => {
		it('should accept all valid TransitionWithDurationProps', () => {
			render(
				<MemoryRouter>
					<Routes>
						<Route
							element={
								<RouteTransitionAdvanced duration={400} className='test-class' />
							}
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
						<Route element={<RouteTransitionAdvanced />}>
							<Route path='/' element={<div>Content</div>} />
						</Route>
					</Routes>
				</MemoryRouter>,
			)

			expect(screen.getByText('Content')).toBeInTheDocument()
		})
	})
})
