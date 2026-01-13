import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { adminPath } from '~/utils/adminRoutes'

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

// Create mockable location ref
let mockLocation = {
	pathname: '/test',
	search: '',
	hash: '',
	state: null,
	key: 'default',
}

// Mock React Router hooks
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router')
	return {
		...actual,
		useLocation: vi.fn(() => mockLocation),
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
			label: 'Admin Panel',
			icon: 'admin_panel_settings',
			href: adminPath(),
		},
		{
			label: 'Tournaments',
			icon: 'trophy',
			href: adminPath('/tournaments'),
		},
		{
			label: 'Teams',
			icon: 'apparel',
			href: '/teams',
		},
		{
			label: 'Competition',
			icon: 'sports',
			href: adminPath('/competition'),
		},
		{
			label: 'Users',
			icon: 'people',
			href: adminPath('/users'),
		},
		{
			label: 'About',
			icon: 'info',
			href: '/about',
		},
		{
			label: 'Settings',
			icon: 'settings',
			href: '/settings',
		},
		{
			label: 'Profile',
			icon: 'person',
			href: '/profile',
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
		beforeEach(() => {
			// Reset to default location before each test
			mockLocation = {
				pathname: '/test',
				search: '',
				hash: '',
				state: null,
				key: 'default',
			}
		})

		test.each([
			{ label: 'Admin Panel', href: adminPath() },
			{ label: 'Tournaments', href: adminPath('/tournaments') },
			{ label: 'Teams', href: '/teams' },
			{ label: 'Competition', href: adminPath('/competition') },
			{ label: 'Users', href: adminPath('/users') },
			{ label: 'About', href: '/about' },
			{ label: 'Settings', href: '/settings' },
			{ label: 'Profile', href: '/profile' },
		])(
			'should navigate to $href when $label menu item is clicked',
			async ({ label, href }) => {
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

				// Should navigate to the correct route
				expect(mockNavigate).toHaveBeenCalledWith(href)
				// Menu should close when navigation link is clicked
				expect(mockOnOpenChange).toHaveBeenCalledWith(false)
			},
		)
	})
})
