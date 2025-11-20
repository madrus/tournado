import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_DASHBOARD_URL } from '~/lib/lib.constants'

import type { MenuItemType } from '../UserMenu'
import { UserMenu } from '../UserMenu'

// Mock i18n
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			language: 'en',
		},
	}),
}))

// Store mock functions for assertions
const mockNavigate = vi.fn()
const mockOnOpenChange = vi.fn()

// Mock React Router hooks
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router')
	return {
		...actual,
		useLocation: vi.fn(() => ({
			pathname: '/test',
			search: '',
			hash: '',
		})),
		useNavigate: vi.fn(() => mockNavigate),
		useNavigation: vi.fn(() => ({
			state: 'idle',
			location: null,
		})),
	}
})

// Mock RTL dropdown hook
vi.mock('~/hooks/useRTLDropdown', () => ({
	useRTLDropdown: () => ({
		dropdownProps: {
			align: 'end',
			side: 'bottom',
			sideOffset: 8,
			alignOffset: 0,
			avoidCollisions: true,
		},
		menuClasses: {
			spacing: '',
			textContainer: '',
			menuItem: 'flex',
			iconContainer: '',
		},
		isRTL: false,
	}),
}))

// Mock icon utils
vi.mock('~/utils/iconUtils', () => ({
	renderIcon: (name: string) => <span data-testid={`icon-${name}`}>{name}</span>,
}))

// Mock RTL utils
vi.mock('~/utils/rtlUtils', () => ({
	getLatinTextClass: () => '',
	getTypographyClass: () => '',
	getMenuItemLineHeight: () => '',
}))

// Mock AnimatedHamburgerIcon
vi.mock('~/components/icons/AnimatedHamburgerIcon', () => ({
	AnimatedHamburgerIcon: ({ isOpen }: { isOpen: boolean }) => (
		<div data-testid='hamburger-icon'>{isOpen ? 'open' : 'closed'}</div>
	),
}))

describe('UserMenu', () => {
	const mockMenuItems: MenuItemType[] = [
		{
			label: 'Teams',
			icon: 'group',
			href: '/teams',
		},
		{
			label: 'About',
			icon: 'info',
			href: '/about',
		},
		{
			label: 'Users',
			icon: 'people',
			href: `${ADMIN_DASHBOARD_URL}/users`,
		},
		{
			label: 'Tournaments',
			icon: 'trophy',
			href: `${ADMIN_DASHBOARD_URL}/tournaments`,
		},
	]

	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks()
	})

	it('should render trigger button with cursor-pointer class', () => {
		render(
			<MemoryRouter>
				<UserMenu
					authenticated={false}
					username=''
					menuItems={mockMenuItems}
					isOpen={false}
					onOpenChange={mockOnOpenChange}
				/>
			</MemoryRouter>,
		)

		const button = screen.getByRole('button', { name: 'common.toggleMenu' })
		expect(button).toBeInTheDocument()
		expect(button).toHaveClass('cursor-pointer')
	})

	it('should have proper ARIA label on trigger button', () => {
		render(
			<MemoryRouter>
				<UserMenu
					authenticated={false}
					username=''
					menuItems={mockMenuItems}
					isOpen={false}
					onOpenChange={mockOnOpenChange}
				/>
			</MemoryRouter>,
		)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('aria-label', 'common.toggleMenu')
	})

	it('should render hamburger icon in closed state when menu is closed', () => {
		render(
			<MemoryRouter>
				<UserMenu
					authenticated={false}
					username=''
					menuItems={mockMenuItems}
					isOpen={false}
					onOpenChange={mockOnOpenChange}
				/>
			</MemoryRouter>,
		)

		const hamburgerIcon = screen.getByTestId('hamburger-icon')
		expect(hamburgerIcon).toHaveTextContent('closed')
	})

	it('should render hamburger icon in open state when menu is open', () => {
		render(
			<MemoryRouter>
				<UserMenu
					authenticated={false}
					username=''
					menuItems={mockMenuItems}
					isOpen={true}
					onOpenChange={mockOnOpenChange}
				/>
			</MemoryRouter>,
		)

		const hamburgerIcon = screen.getByTestId('hamburger-icon')
		expect(hamburgerIcon).toHaveTextContent('open')
	})

	describe('Menu item visibility', () => {
		it('should only render menu items that are provided in menuItems prop', () => {
			const limitedMenuItems: MenuItemType[] = [
				{
					label: 'Teams',
					icon: 'group',
					href: '/teams',
				},
				{
					label: 'About',
					icon: 'info',
					href: '/about',
				},
				// Note: Users menu item is NOT included (simulates non-admin user)
			]

			render(
				<MemoryRouter>
					<UserMenu
						authenticated={true}
						username='user'
						menuItems={limitedMenuItems}
						isOpen={true}
						onOpenChange={mockOnOpenChange}
					/>
				</MemoryRouter>,
			)

			// Should show provided menu items
			expect(screen.getByText('Teams')).toBeInTheDocument()
			expect(screen.getByText('About')).toBeInTheDocument()

			// Should NOT show Users menu item since it's not in the menuItems array
			expect(screen.queryByText('Users')).not.toBeInTheDocument()
		})

		it('should show Users menu item when included in menuItems prop', () => {
			render(
				<MemoryRouter>
					<UserMenu
						authenticated={true}
						username='admin'
						menuItems={mockMenuItems} // includes Users menu item
						isOpen={true}
						onOpenChange={mockOnOpenChange}
					/>
				</MemoryRouter>,
			)

			// Should show Users menu item when it's included
			expect(screen.getByText('Users')).toBeInTheDocument()
		})
	})

	describe('Menu item navigation', () => {
		test.each([
			{ label: 'Teams', route: '/teams' },
			{ label: 'About', route: '/about' },
			{ label: 'Users', route: `${ADMIN_DASHBOARD_URL}/users` },
			{ label: 'Tournaments', route: `${ADMIN_DASHBOARD_URL}/tournaments` },
		])('should navigate to $route when $label menu item is clicked', async ({ label, route }) => {
			const user = userEvent.setup()

			render(
				<MemoryRouter>
					<UserMenu
						authenticated={true}
						username='admin'
						menuItems={mockMenuItems}
						isOpen={true}
						onOpenChange={mockOnOpenChange}
					/>
				</MemoryRouter>,
			)

			const link = screen.getByText(label)
			await user.click(link)

			expect(mockNavigate).toHaveBeenCalledWith(route)
			expect(mockOnOpenChange).toHaveBeenCalledWith(false)
		})
	})
})
