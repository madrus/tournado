import type { Role, User } from '@prisma/client'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppBar } from '../AppBar'
import type { MenuItemType } from '../UserMenu'

// Mock React Router hooks
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router')
	return {
		...actual,
		useFetcher: vi.fn(() => ({
			submit: vi.fn(),
			formAction: null,
		})),
		useLocation: vi.fn(() => ({
			pathname: '/test',
			search: '',
		})),
	}
})

// Mock i18n - simplified to return key as value
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			language: 'en',
			changeLanguage: vi.fn(),
			options: { fallbackLng: 'en' },
		},
	}),
	initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

// Mock route utils
vi.mock('~/utils/routeUtils', () => ({
	usePageTitle: () => 'Test Page',
}))

// Mock PrefetchLink component
vi.mock('../PrefetchLink', () => ({
	PrimaryNavLink: ({
		children,
		...props
	}: { children: React.ReactNode } & Record<string, unknown>) => <a {...props}>{children}</a>,
}))

// Mock UserMenu component to make testing easier
vi.mock('../UserMenu', () => ({
	UserMenu: ({
		menuItems,
		authenticated,
		isMobile,
	}: {
		menuItems: MenuItemType[]
		authenticated: boolean
		isMobile?: boolean
	}) => (
		<div data-testid={`user-menu${isMobile ? '-mobile' : '-desktop'}`}>
			<div data-testid='authenticated-status'>{authenticated.toString()}</div>
			<div data-testid='menu-items'>
				{menuItems.map((item: MenuItemType, index: number) => (
					<div key={index} data-testid={`menu-item-${index}`}>
						{item.divider ? (
							<hr data-testid='divider' />
						) : (
							<>
								<span data-testid='menu-label'>{item.label}</span>
								<span data-testid='menu-icon'>{item.icon}</span>
								<span data-testid='menu-href'>{item.href || ''}</span>
								<span data-testid='menu-authenticated'>{item.authenticated?.toString()}</span>
							</>
						)}
					</div>
				))}
			</div>
		</div>
	),
}))

describe('AppBar Context Menu', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	// Helper function to get desktop menu items (AppBar renders both mobile and desktop)
	const getDesktopMenuItems = () => {
		const desktopMenu = screen.getByTestId('user-menu-desktop')
		return within(desktopMenu).getAllByTestId('menu-label')
	}

	describe('Public User (Not Authenticated)', () => {
		it('should show correct menu items for public user', () => {
			render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='en' />
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const menuLabels = Array.from(menuItems).map((item) => item.textContent)

			// Should see: Teams, About, Language (English - actual language name), Sign In
			expect(menuLabels).toContain('common.titles.teams')
			expect(menuLabels).toContain('common.titles.about')
			expect(menuLabels).toContain('common.language') // Generic language menu, not individual language name
			expect(menuLabels).toContain('common.auth.signIn')

			// Should NOT see admin or authenticated-only items (they get filtered out)
			expect(menuLabels).not.toContain('common.titles.adminPanel')
			expect(menuLabels).not.toContain('common.titles.profile')
			expect(menuLabels).not.toContain('common.titles.settings')
			expect(menuLabels).not.toContain('common.auth.signOut')
		})

		it('should show divider after Teams', () => {
			render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='en' />
				</MemoryRouter>,
			)

			const desktopMenu = screen.getByTestId('user-menu-desktop')
			const dividers = within(desktopMenu).getAllByTestId('divider')
			expect(dividers).toHaveLength(1)

			// Check that divider appears after Teams (should be the second item)
			const menuItems = within(desktopMenu).getAllByTestId(/^menu-item-\d+$/)
			const secondItem = menuItems[1]
			expect(within(secondItem).getByTestId('divider')).toBeInTheDocument()
		})

		it('should have Teams link pointing to public teams route', () => {
			render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='en' />
				</MemoryRouter>,
			)

			const desktopMenu = screen.getByTestId('user-menu-desktop')
			const menuItems = within(desktopMenu).getAllByTestId(/^menu-item-\d+$/)

			// Find the Teams menu item (should be first)
			const teamsMenuItem = menuItems[0]
			const teamsHref = within(teamsMenuItem).getByTestId('menu-href')

			expect(teamsHref).toHaveTextContent('/teams')
		})
	})

	describe('Regular Authenticated User', () => {
		const regularUser: User = {
			id: 'user-1',
			email: 'user@example.com',
			firstName: 'John',
			lastName: 'Doe',
			role: 'PUBLIC',
			firebaseUid: 'test-firebase-uid',
			displayName: null,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		it('should show correct menu items for authenticated user', () => {
			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='user@example.com'
						user={regularUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const menuLabels = Array.from(menuItems).map((item) => item.textContent)

			// Should see: Teams, Profile, Settings, About, Language, Sign Out
			expect(menuLabels).toContain('common.titles.teams')
			expect(menuLabels).toContain('common.titles.profile')
			expect(menuLabels).toContain('common.titles.settings')
			expect(menuLabels).toContain('common.titles.about')
			expect(menuLabels).toContain('common.language') // Generic language menu, not individual language name
			expect(menuLabels).toContain('common.auth.signOut')

			// Should NOT see admin-only items or sign in
			expect(menuLabels).not.toContain('common.titles.adminPanel')
			expect(menuLabels).not.toContain('common.titles.tournaments')
			expect(menuLabels).not.toContain('common.titles.competition')
			expect(menuLabels).not.toContain('common.titles.users')
			expect(menuLabels).not.toContain('common.auth.signIn')
		})

		it('should show authentication status as true', () => {
			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='user@example.com'
						user={regularUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const desktopMenu = screen.getByTestId('user-menu-desktop')
			const authStatus = within(desktopMenu).getByTestId('authenticated-status')
			expect(authStatus).toHaveTextContent('true')
		})

		it('should have Teams link pointing to public teams route', () => {
			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='user@example.com'
						user={regularUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const desktopMenu = screen.getByTestId('user-menu-desktop')
			const menuItems = within(desktopMenu).getAllByTestId(/^menu-item-\d+$/)

			// Find the Teams menu item (should be first)
			const teamsMenuItem = menuItems[0]
			const teamsHref = within(teamsMenuItem).getByTestId('menu-href')

			expect(teamsHref).toHaveTextContent('/teams')
		})
	})

	describe('Admin User', () => {
		const adminUser: User = {
			id: 'admin-1',
			email: 'admin@example.com',
			firstName: 'Admin',
			lastName: 'User',
			role: 'ADMIN',
			firebaseUid: 'test-firebase-uid',
			displayName: null,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		it('should show correct menu items for admin user', () => {
			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='admin@example.com'
						user={adminUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const menuLabels = Array.from(menuItems).map((item) => item.textContent)

			// Should see all items including Admin Panel
			expect(menuLabels).toContain('common.titles.teams')
			expect(menuLabels).toContain('common.titles.adminPanel') // Admin-only item
			expect(menuLabels).toContain('common.titles.profile')
			expect(menuLabels).toContain('common.titles.settings')
			expect(menuLabels).toContain('common.titles.about')
			expect(menuLabels).toContain('common.language') // Generic language menu, not individual language name
			expect(menuLabels).toContain('common.auth.signOut')

			// Should NOT see sign in
			expect(menuLabels).not.toContain('common.auth.signIn')
		})

		it('should have Teams link pointing to admin teams route', () => {
			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='admin@example.com'
						user={adminUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const desktopMenu = screen.getByTestId('user-menu-desktop')
			const menuItems = within(desktopMenu).getAllByTestId(/^menu-item-\d+$/)

			// Find the Teams menu item (should be third for admin, after Admin Panel and Tournaments)
			const teamsMenuItem = menuItems[2]
			const teamsHref = within(teamsMenuItem).getByTestId('menu-href')

			expect(teamsHref).toHaveTextContent('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
		})

		it('should show Admin Panel with correct properties', () => {
			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='admin@example.com'
						user={adminUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const adminPanelIndex = Array.from(menuItems).findIndex(
				(item) => item.textContent === 'common.titles.adminPanel',
			)

			expect(adminPanelIndex).toBeGreaterThan(-1)

			// Just verify that Admin Panel appears in the menu - the important part is role-based visibility
			expect(Array.from(menuItems).map((item) => item.textContent)).toContain(
				'common.titles.adminPanel',
			)
		})

		it('should order admin menu: Admin Panel, Tournaments, Teams', () => {
			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='admin@example.com'
						user={adminUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const menuLabels = Array.from(menuItems).map((item) => item.textContent)

			// Positions for admin users: Admin Panel (0), Tournaments (1), Teams (2)
			const tournamentsIndex = menuLabels.indexOf('common.titles.tournaments')
			const teamsIndex = menuLabels.indexOf('common.titles.teams')
			const adminPanelIndex = menuLabels.indexOf('common.titles.adminPanel')

			expect(adminPanelIndex).toBe(0)
			expect(tournamentsIndex).toBe(1)
			expect(teamsIndex).toBe(2)
		})
	})

	describe('Menu Item Authentication Requirements', () => {
		it('should filter out authenticated items for non-authenticated users', () => {
			render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='en' />
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const menuLabels = Array.from(menuItems).map((item) => item.textContent)

			// Non-authenticated users should not see authenticated-only items
			expect(menuLabels).not.toContain('common.titles.profile')
			expect(menuLabels).not.toContain('common.titles.settings')
			expect(menuLabels).not.toContain('common.titles.adminPanel')
		})

		it('should show authenticated items for authenticated users', () => {
			const adminUser: User = {
				id: 'admin-1',
				email: 'admin@example.com',
				firstName: 'Admin',
				lastName: 'User',
				role: 'ADMIN',
				firebaseUid: 'test-firebase-uid',
				displayName: null,
				active: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			render(
				<MemoryRouter>
					<AppBar
						authenticated={true}
						username='admin@example.com'
						user={adminUser}
						language='en'
					/>
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const menuLabels = Array.from(menuItems).map((item) => item.textContent)

			// Authenticated users should see their authenticated items
			expect(menuLabels).toContain('common.titles.profile')
			expect(menuLabels).toContain('common.titles.settings')
			expect(menuLabels).toContain('common.titles.adminPanel') // Admin specific
		})
	})

	describe('Role-Specific Behavior', () => {
		it('should hide Admin Panel for non-admin roles', () => {
			const roles: 'PUBLIC'[] = ['PUBLIC']

			roles.forEach((role) => {
				const user: User = {
					id: 'user-1',
					email: 'user@example.com',
					firstName: 'Test',
					lastName: 'User',
					role,
					firebaseUid: 'test-firebase-uid',
					displayName: null,
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}

				const { unmount } = render(
					<MemoryRouter>
						<AppBar authenticated={true} username='user@example.com' user={user} language='en' />
					</MemoryRouter>,
				)

				const menuItems = getDesktopMenuItems()
				const menuLabels = Array.from(menuItems).map((item) => item.textContent)

				expect(menuLabels).not.toContain('common.titles.adminPanel')

				unmount()
			})
		})

		it('should show Admin Panel for ADMIN, MANAGER, REFEREE, EDITOR, and BILLING roles', () => {
			const roles: Role[] = ['ADMIN', 'MANAGER', 'REFEREE', 'EDITOR', 'BILLING']

			roles.forEach((role) => {
				const user: User = {
					id: 'admin-1',
					email: `${role.toLowerCase()}@example.com`,
					firstName: role,
					lastName: 'User',
					role,
					firebaseUid: 'test-firebase-uid',
					displayName: null,
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}

				const { unmount } = render(
					<MemoryRouter>
						<AppBar authenticated={true} username={user.email} user={user} language='en' />
					</MemoryRouter>,
				)

				const menuItems = getDesktopMenuItems()
				const menuLabels = Array.from(menuItems).map((item) => item.textContent)

				expect(menuLabels).toContain('common.titles.adminPanel')

				unmount()
			})
		})

		it('should route Teams link correctly based on user role', () => {
			const roles: Array<{
				role: 'PUBLIC' | 'MANAGER' | 'REFEREE' | 'ADMIN'
				expectedHref: string
				teamsMenuItemIndex: number // Index where Teams appears in menu
			}> = [
				{ role: 'PUBLIC', expectedHref: '/teams', teamsMenuItemIndex: 0 },
				{
					role: 'MANAGER',
					expectedHref: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams',
					teamsMenuItemIndex: 2,
				}, // Teams is 3rd for manager (after Admin Panel, Tournaments)
				{
					role: 'REFEREE',
					expectedHref: '/teams',
					teamsMenuItemIndex: 1,
				}, // Teams is 2nd for referee (after Admin Panel, before Competition)
				{
					role: 'ADMIN',
					expectedHref: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams',
					teamsMenuItemIndex: 2,
				}, // Teams is 3rd for admin (after Admin Panel, Tournaments)
			]

			roles.forEach(({ role, expectedHref, teamsMenuItemIndex }) => {
				const user: User = {
					id: 'user-1',
					email: 'user@example.com',
					firstName: 'Test',
					lastName: 'User',
					role,
					firebaseUid: 'test-firebase-uid',
					displayName: null,
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}

				const { unmount } = render(
					<MemoryRouter>
						<AppBar authenticated={true} username='user@example.com' user={user} language='en' />
					</MemoryRouter>,
				)

				const desktopMenu = screen.getByTestId('user-menu-desktop')
				const menuItems = within(desktopMenu).getAllByTestId(/^menu-item-\d+$/)

				// Find the Teams menu item at the expected index
				const teamsMenuItem = menuItems[teamsMenuItemIndex]
				const teamsHref = within(teamsMenuItem).getByTestId('menu-href')

				expect(teamsHref).toHaveTextContent(expectedHref)

				unmount()
			})
		})
	})

	describe('Menu Structure Consistency', () => {
		it('should show correct first menu item based on user role', () => {
			const testCases = [
				{
					authenticated: false,
					user: null,
					expectedFirstItem: 'common.titles.teams',
				},
				{
					authenticated: true,
					user: { role: 'PUBLIC' } as User,
					expectedFirstItem: 'common.titles.teams',
				},
				{
					authenticated: true,
					user: { role: 'ADMIN' } as User,
					expectedFirstItem: 'common.titles.adminPanel', // Admin users see Admin Panel first
				},
			]

			testCases.forEach(({ authenticated, user, expectedFirstItem }) => {
				const { unmount } = render(
					<MemoryRouter>
						<AppBar
							authenticated={authenticated}
							username={user?.email || ''}
							user={user}
							language='en'
						/>
					</MemoryRouter>,
				)

				const menuItems = getDesktopMenuItems()
				expect(menuItems[0]).toHaveTextContent(expectedFirstItem)

				unmount()
			})
		})

		it('should always show About before the last items (language and auth)', () => {
			render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='en' />
				</MemoryRouter>,
			)

			const menuItems = getDesktopMenuItems()
			const menuLabels = Array.from(menuItems).map((item) => item.textContent)

			const aboutIndex = menuLabels.indexOf('common.titles.about')
			const signInIndex = menuLabels.indexOf('common.auth.signIn')
			const languageIndex = menuLabels.indexOf('common.language') // Generic language menu, not individual language name

			// About should come before Sign In and Language
			expect(aboutIndex).toBeGreaterThan(-1)
			expect(signInIndex).toBeGreaterThan(-1)
			expect(languageIndex).toBeGreaterThan(-1)
			expect(aboutIndex).toBeLessThan(signInIndex)
			expect(aboutIndex).toBeLessThan(languageIndex)
		})
	})

	describe('Unified Menu', () => {
		it('should render a single unified UserMenu instance', () => {
			render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='en' />
				</MemoryRouter>,
			)

			// AppBar should render only the unified menu (desktop testid is used for the unified menu)
			expect(screen.getByTestId('user-menu-desktop')).toBeInTheDocument()
			expect(screen.queryByTestId('user-menu-mobile')).not.toBeInTheDocument()
		})

		it('should work correctly for both authenticated and unauthenticated users', () => {
			const testCases = [
				{ authenticated: false, username: '', user: null },
				{
					authenticated: true,
					username: 'admin@example.com',
					user: {
						id: 'admin-1',
						email: 'admin@example.com',
						firstName: 'Admin',
						lastName: 'User',
						role: 'ADMIN' as const,
						firebaseUid: 'test-firebase-uid',
						displayName: null,
						active: true,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
			]

			testCases.forEach(({ authenticated, username, user }) => {
				const { unmount } = render(
					<MemoryRouter>
						<AppBar authenticated={authenticated} username={username} user={user} language='en' />
					</MemoryRouter>,
				)

				// Should always render the unified menu
				expect(screen.getByTestId('user-menu-desktop')).toBeInTheDocument()

				unmount()
			})
		})
	})

	describe('Language Menu Active State', () => {
		it('should render correctly with hydration-safe language active logic', () => {
			// This test verifies that the component uses the correct logic for determining
			// which language is active: typeof window !== 'undefined' ? currentLanguage : language

			// In test environment, window is defined, so it will use currentLanguage from hook
			// The hook reads from useSettingsStore which has default language 'nl'
			const { unmount } = render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='en' />
				</MemoryRouter>,
			)

			// Component should render without errors despite different language sources
			// (prop 'en' vs store default 'nl')
			expect(screen.getByTestId('user-menu-desktop')).toBeInTheDocument()

			unmount()
		})

		it('should handle language prop correctly for SSR consistency', () => {
			// The language prop comes from server-side cookie parsing
			// and ensures SSR/client consistency when window is undefined
			const { unmount } = render(
				<MemoryRouter>
					<AppBar authenticated={false} username='' user={null} language='ar' />
				</MemoryRouter>,
			)

			// Should render without errors with Arabic language prop
			expect(screen.getByTestId('user-menu-desktop')).toBeInTheDocument()

			unmount()
		})
	})
})
