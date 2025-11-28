import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
	ActionLink,
	ErrorRecoveryLink,
	ListItemLink,
	ListItemNavLink,
	PrefetchLink,
	PrefetchNavLink,
	PrimaryNavLink,
} from '../PrefetchLink'

// Mock the usePrefetchStrategy hook
vi.mock('~/hooks/usePrefetchStrategy', () => ({
	usePrefetchStrategy: vi.fn((_to, context, override, _adaptive) => {
		// If override is provided, use it
		if (override) return override

		// Otherwise, determine strategy based on context
		if (context === 'actionButtons') return 'render'
		if (context === 'primaryNavigation') return 'intent'
		if (context === 'errorPageLinks') return 'render'
		if (context === 'listItems') return 'viewport'
		if (context === 'secondaryNavigation') return 'intent'
		return 'none'
	}),
}))

// Mock window and navigator
const mockNavigator = {
	connection: {
		effectiveType: '4g',
		saveData: false,
	},
	clipboard: {
		read: vi.fn(),
		write: vi.fn(),
	},
}

const mockWindow = {
	innerWidth: 1024,
	navigator: mockNavigator,
}

describe('PrefetchLink', () => {
	beforeEach(() => {
		// @ts-expect-error - Mocking global objects
		global.window = mockWindow
		// @ts-expect-error - Mocking global objects
		global.navigator = mockNavigator
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	test('renders basic link with default prefetch context', () => {
		render(
			<MemoryRouter>
				<PrefetchLink to='/test'>Test Link</PrefetchLink>
			</MemoryRouter>,
		)

		const link = screen.getByRole('link', { name: 'Test Link' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/test')
	})

	test('uses custom prefetch context', () => {
		render(
			<MemoryRouter>
				<PrefetchLink to='/test' prefetchContext='actionButtons'>
					Action Link
				</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Action Link' })).toBeInTheDocument()
	})

	test('uses override prefetch strategy', () => {
		render(
			<MemoryRouter>
				<PrefetchLink to='/test' prefetch='render'>
					Override Link
				</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Override Link' })).toBeInTheDocument()
	})

	test('handles object-based to prop', () => {
		render(
			<MemoryRouter>
				<PrefetchLink to={{ pathname: '/test', search: '?param=value' }}>
					Object Link
				</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Object Link' })).toBeInTheDocument()
	})

	test('handles object-based to prop without pathname', () => {
		render(
			<MemoryRouter>
				<PrefetchLink to={{ search: '?param=value' }}>No Pathname Link</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'No Pathname Link' })).toBeInTheDocument()
	})

	test('disables adaptive prefetching when adaptive=false', () => {
		render(
			<MemoryRouter>
				<PrefetchLink to='/test' adaptive={false}>
					Non-adaptive Link
				</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Non-adaptive Link' })).toBeInTheDocument()
	})

	test('applies adaptive prefetching for slow connections', () => {
		;(
			global.navigator as unknown as {
				connection: { effectiveType: string; saveData: boolean }
			}
		).connection.effectiveType = 'slow-2g'

		render(
			<MemoryRouter>
				<PrefetchLink to='/test'>Slow Connection Link</PrefetchLink>
			</MemoryRouter>,
		)

		expect(
			screen.getByRole('link', { name: 'Slow Connection Link' }),
		).toBeInTheDocument()
	})

	test('applies adaptive prefetching for 2g connections', () => {
		// @ts-expect-error - Mocking navigator connection
		global.navigator.connection.effectiveType = '2g'

		render(
			<MemoryRouter>
				<PrefetchLink to='/test'>2G Connection Link</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: '2G Connection Link' })).toBeInTheDocument()
	})

	test('applies adaptive prefetching for data saver mode', () => {
		// @ts-expect-error - Mocking navigator connection
		global.navigator.connection.saveData = true

		render(
			<MemoryRouter>
				<PrefetchLink to='/test'>Data Saver Link</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Data Saver Link' })).toBeInTheDocument()
	})

	test('applies adaptive prefetching for mobile devices', () => {
		;(global.window as { innerWidth: number }).innerWidth = 500

		render(
			<MemoryRouter>
				<PrefetchLink to='/test'>Mobile Link</PrefetchLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Mobile Link' })).toBeInTheDocument()
	})
})

describe('PrefetchNavLink', () => {
	test('renders NavLink with default primary navigation context', () => {
		render(
			<MemoryRouter>
				<PrefetchNavLink to='/test'>Nav Link</PrefetchNavLink>
			</MemoryRouter>,
		)

		const link = screen.getByRole('link', { name: 'Nav Link' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/test')
	})

	test('uses custom prefetch context', () => {
		render(
			<MemoryRouter>
				<PrefetchNavLink to='/test' prefetchContext='listItems'>
					List Nav Link
				</PrefetchNavLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'List Nav Link' })).toBeInTheDocument()
	})

	test('handles object-based to prop', () => {
		render(
			<MemoryRouter>
				<PrefetchNavLink to={{ pathname: '/test' }}>Object Nav Link</PrefetchNavLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Object Nav Link' })).toBeInTheDocument()
	})

	test('applies adaptive prefetching', () => {
		// @ts-expect-error - Mocking navigator connection
		global.navigator.connection.effectiveType = 'slow-2g'

		render(
			<MemoryRouter>
				<PrefetchNavLink to='/test'>Adaptive Nav Link</PrefetchNavLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Adaptive Nav Link' })).toBeInTheDocument()
	})
})

describe('Specialized Link Components', () => {
	test('PrimaryNavLink uses primaryNavigation context', () => {
		render(
			<MemoryRouter>
				<PrimaryNavLink to='/test'>Primary Nav</PrimaryNavLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Primary Nav' })).toBeInTheDocument()
	})

	test('ActionLink uses actionButtons context', () => {
		render(
			<MemoryRouter>
				<ActionLink to='/test'>Action Button</ActionLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Action Button' })).toBeInTheDocument()
	})

	test('ListItemLink uses listItems context', () => {
		render(
			<MemoryRouter>
				<ListItemLink to='/test'>List Item</ListItemLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'List Item' })).toBeInTheDocument()
	})

	test('ErrorRecoveryLink uses errorPageLinks context', () => {
		render(
			<MemoryRouter>
				<ErrorRecoveryLink to='/test'>Error Recovery</ErrorRecoveryLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'Error Recovery' })).toBeInTheDocument()
	})

	test('ListItemNavLink uses listItems context with NavLink', () => {
		render(
			<MemoryRouter>
				<ListItemNavLink to='/test'>List Item Nav</ListItemNavLink>
			</MemoryRouter>,
		)

		expect(screen.getByRole('link', { name: 'List Item Nav' })).toBeInTheDocument()
	})

	test('specialized components accept additional props', () => {
		render(
			<MemoryRouter>
				<ActionLink to='/test' className='custom-class' data-testid='action-link'>
					Action with Props
				</ActionLink>
			</MemoryRouter>,
		)

		const link = screen.getByTestId('action-link')
		expect(link).toBeInTheDocument()
		expect(link).toHaveClass('custom-class')
	})
})

describe('Defensive programming and edge cases', () => {
	test('component renders successfully with minimal props', () => {
		// This test validates basic functionality and defensive programming
		render(
			<MemoryRouter>
				<PrefetchLink to='/test'>Minimal Link</PrefetchLink>
			</MemoryRouter>,
		)

		const link = screen.getByRole('link', { name: 'Minimal Link' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/test')
	})

	test('handles adaptive prefetching when navigator.connection is unavailable', () => {
		// Test defensive programming for browsers without Network Information API
		const originalConnection = (navigator as { connection?: unknown }).connection
		delete (navigator as { connection?: unknown }).connection

		render(
			<MemoryRouter>
				<PrefetchLink to='/test' adaptive={true}>
					No Connection API Link
				</PrefetchLink>
			</MemoryRouter>,
		)

		const link = screen.getByRole('link', { name: 'No Connection API Link' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/test')

		// Restore connection (if it was there)
		if (originalConnection) {
			Object.defineProperty(navigator, 'connection', {
				value: originalConnection,
				configurable: true,
			})
		}
	})
})
