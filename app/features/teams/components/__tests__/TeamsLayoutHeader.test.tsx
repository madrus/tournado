import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { describe, expect, it, vi } from 'vitest'

import { TeamsLayoutHeader } from '../TeamsLayoutHeader'

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}))

// Mock user utilities for permission testing
vi.mock('~/utils/routeUtils', () => ({
	useUser: () => ({
		id: 'test-user-id',
		email: 'test@example.com',
		role: 'ADMIN', // Give full permissions for tests
	}),
	useMatchesData: vi.fn(() => ({})),
}))

const renderWithRouter = (component: React.ReactElement) =>
	render(<MemoryRouter>{component}</MemoryRouter>)

describe('TeamsLayoutHeader', () => {
	it('should render public variant correctly', () => {
		renderWithRouter(<TeamsLayoutHeader variant='public' />)

		expect(
			screen.getByRole('heading', { name: 'common.titles.teams' }),
		).toBeInTheDocument()
		expect(screen.getByText('teams.description')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'common.actions.add' })).toBeInTheDocument()
	})

	it('should render admin variant correctly', () => {
		renderWithRouter(<TeamsLayoutHeader variant='admin' />)

		expect(
			screen.getByRole('heading', { name: 'admin.teams.title' }),
		).toBeInTheDocument()
		expect(screen.getByText('admin.teams.description')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'common.actions.add' })).toBeInTheDocument()
	})

	it('should use custom addButtonTo prop', () => {
		renderWithRouter(<TeamsLayoutHeader variant='public' addButtonTo='custom-path' />)

		const addButton = screen.getByRole('link', { name: 'common.actions.add' })
		expect(addButton).toHaveAttribute('href', '/custom-path')
	})

	it('should apply custom className', () => {
		renderWithRouter(<TeamsLayoutHeader variant='public' className='custom-class' />)

		expect(screen.getByTestId('teams-header-public')).toHaveClass('custom-class')
	})

	it('should render public layout for public variant', () => {
		renderWithRouter(<TeamsLayoutHeader variant='public' />)
		expect(screen.getByTestId('teams-header-public')).toBeInTheDocument()
		expect(screen.queryByTestId('teams-header-admin')).not.toBeInTheDocument()
	})

	it('should render admin layout for admin variant', () => {
		renderWithRouter(<TeamsLayoutHeader variant='admin' />)
		expect(screen.getByTestId('teams-header-admin')).toBeInTheDocument()
		expect(screen.queryByTestId('teams-header-public')).not.toBeInTheDocument()
	})

	it('should have divider for both variants', () => {
		const { rerender } = renderWithRouter(<TeamsLayoutHeader variant='public' />)
		expect(screen.getByTestId('teams-header-public')).toHaveClass('border-b')

		rerender(
			<MemoryRouter>
				<TeamsLayoutHeader variant='admin' />
			</MemoryRouter>,
		)
		expect(screen.getByTestId('teams-header-admin')).toHaveClass('border-b')
	})

	it('should use same layout structure for both variants', () => {
		const { rerender } = renderWithRouter(<TeamsLayoutHeader variant='public' />)
		const publicHeader = screen.getByTestId('teams-header-public')
		expect(publicHeader).toHaveClass('border-button-neutral-secondary-border')
		expect(publicHeader).toHaveClass('pb-6')

		rerender(
			<MemoryRouter>
				<TeamsLayoutHeader variant='admin' />
			</MemoryRouter>,
		)
		const adminHeader = screen.getByTestId('teams-header-admin')
		expect(adminHeader).toHaveClass('border-button-neutral-secondary-border')
		expect(adminHeader).toHaveClass('pb-6')
	})
})
