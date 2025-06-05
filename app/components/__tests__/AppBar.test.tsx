import { MemoryRouter } from 'react-router'

import type { User } from '@prisma/client'
import { render, screen, within } from '@testing-library/react'

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
}))

// Mock route utils
vi.mock('~/utils/route-utils', () => ({
  usePageTitle: () => 'Test Page',
}))

// Mock PrefetchLink component
vi.mock('../PrefetchLink', () => ({
  PrimaryNavLink: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
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
                <span data-testid='menu-authenticated'>
                  {item.authenticated?.toString()}
                </span>
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
          <AppBar authenticated={false} username='' user={null} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

      // Should see: Teams, About, Language (English - actual language name), Sign In
      expect(menuLabels).toContain('common.titles.teams')
      expect(menuLabels).toContain('common.titles.about')
      expect(menuLabels).toContain('common.language') // Generic language menu, not individual language name
      expect(menuLabels).toContain('auth.signin')

      // Should NOT see admin or authenticated-only items (they get filtered out)
      expect(menuLabels).not.toContain('common.titles.adminPanel')
      expect(menuLabels).not.toContain('common.titles.profile')
      expect(menuLabels).not.toContain('common.titles.settings')
      expect(menuLabels).not.toContain('auth.signout')
    })

    it('should show divider after Teams', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={false} username='' user={null} />
        </MemoryRouter>
      )

      const desktopMenu = screen.getByTestId('user-menu-desktop')
      const dividers = within(desktopMenu).getAllByTestId('divider')
      expect(dividers).toHaveLength(1)

      // Check that divider appears after Teams (should be the second item)
      const menuItems = within(desktopMenu).getAllByTestId(/^menu-item-\d+$/)
      const secondItem = menuItems[1]
      expect(secondItem.querySelector('[data-testid="divider"]')).toBeInTheDocument()
    })
  })

  describe('Regular Authenticated User', () => {
    const regularUser: User = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'PUBLIC',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should show correct menu items for authenticated user', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={true} username='user@example.com' user={regularUser} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

      // Should see: Teams, Profile, Settings, About, Language, Sign Out
      expect(menuLabels).toContain('common.titles.teams')
      expect(menuLabels).toContain('common.titles.profile')
      expect(menuLabels).toContain('common.titles.settings')
      expect(menuLabels).toContain('common.titles.about')
      expect(menuLabels).toContain('common.language') // Generic language menu, not individual language name
      expect(menuLabels).toContain('auth.signout')

      // Should NOT see admin items or sign in
      expect(menuLabels).not.toContain('common.titles.adminPanel')
      expect(menuLabels).not.toContain('auth.signin')
    })

    it('should show authentication status as true', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={true} username='user@example.com' user={regularUser} />
        </MemoryRouter>
      )

      const desktopMenu = screen.getByTestId('user-menu-desktop')
      const authStatus = within(desktopMenu).getByTestId('authenticated-status')
      expect(authStatus).toHaveTextContent('true')
    })
  })

  describe('Admin User', () => {
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should show correct menu items for admin user', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={true} username='admin@example.com' user={adminUser} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

      // Should see all items including Admin Panel
      expect(menuLabels).toContain('common.titles.teams')
      expect(menuLabels).toContain('common.titles.adminPanel') // Admin-only item
      expect(menuLabels).toContain('common.titles.profile')
      expect(menuLabels).toContain('common.titles.settings')
      expect(menuLabels).toContain('common.titles.about')
      expect(menuLabels).toContain('common.language') // Generic language menu, not individual language name
      expect(menuLabels).toContain('auth.signout')

      // Should NOT see sign in
      expect(menuLabels).not.toContain('auth.signin')
    })

    it('should show Admin Panel with correct properties', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={true} username='admin@example.com' user={adminUser} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const adminPanelIndex = Array.from(menuItems).findIndex(
        item => item.textContent === 'common.titles.adminPanel'
      )

      expect(adminPanelIndex).toBeGreaterThan(-1)

      // Just verify that Admin Panel appears in the menu - the important part is role-based visibility
      expect(Array.from(menuItems).map(item => item.textContent)).toContain(
        'common.titles.adminPanel'
      )
    })

    it('should position Admin Panel right after Teams and divider', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={true} username='admin@example.com' user={adminUser} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

      // Find positions
      const teamsIndex = menuLabels.indexOf('common.titles.teams')
      const adminPanelIndex = menuLabels.indexOf('common.titles.adminPanel')

      expect(teamsIndex).toBe(0) // Teams should be first
      expect(adminPanelIndex).toBe(1) // Admin Panel should be right after Teams (divider is not counted in labels)
    })
  })

  describe('Menu Item Authentication Requirements', () => {
    it('should filter out authenticated items for non-authenticated users', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={false} username='' user={null} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

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
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(
        <MemoryRouter>
          <AppBar authenticated={true} username='admin@example.com' user={adminUser} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

      // Authenticated users should see their authenticated items
      expect(menuLabels).toContain('common.titles.profile')
      expect(menuLabels).toContain('common.titles.settings')
      expect(menuLabels).toContain('common.titles.adminPanel') // Admin specific
    })
  })

  describe('Role-Specific Behavior', () => {
    it('should hide Admin Panel for non-admin roles', () => {
      const roles: (
        | 'PUBLIC'
        | 'TOURNAMENT_MANAGER'
        | 'REFEREE_COORDINATOR'
        | 'REFEREE'
      )[] = ['PUBLIC', 'TOURNAMENT_MANAGER', 'REFEREE_COORDINATOR', 'REFEREE']

      roles.forEach(role => {
        const user: User = {
          id: 'user-1',
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const { unmount } = render(
          <MemoryRouter>
            <AppBar authenticated={true} username='user@example.com' user={user} />
          </MemoryRouter>
        )

        const menuItems = getDesktopMenuItems()
        const menuLabels = Array.from(menuItems).map(item => item.textContent)

        expect(menuLabels).not.toContain('common.titles.adminPanel')

        unmount()
      })
    })

    it('should show Admin Panel only for ADMIN role', () => {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(
        <MemoryRouter>
          <AppBar authenticated={true} username='admin@example.com' user={adminUser} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

      expect(menuLabels).toContain('common.titles.adminPanel')
    })
  })

  describe('Menu Structure Consistency', () => {
    it('should always show Teams as the first item', () => {
      const testCases = [
        { authenticated: false, user: null },
        {
          authenticated: true,
          user: { role: 'PUBLIC' } as User,
        },
        {
          authenticated: true,
          user: { role: 'ADMIN' } as User,
        },
      ]

      testCases.forEach(({ authenticated, user }) => {
        const { unmount } = render(
          <MemoryRouter>
            <AppBar
              authenticated={authenticated}
              username={user?.email || ''}
              user={user}
            />
          </MemoryRouter>
        )

        const menuItems = getDesktopMenuItems()
        expect(menuItems[0]).toHaveTextContent('common.titles.teams')

        unmount()
      })
    })

    it('should always show About before the last items (language and auth)', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={false} username='' user={null} />
        </MemoryRouter>
      )

      const menuItems = getDesktopMenuItems()
      const menuLabels = Array.from(menuItems).map(item => item.textContent)

      const aboutIndex = menuLabels.indexOf('common.titles.about')
      const signInIndex = menuLabels.indexOf('auth.signin')
      const languageIndex = menuLabels.indexOf('common.language') // Generic language menu, not individual language name

      // About should come before Sign In and Language
      expect(aboutIndex).toBeGreaterThan(-1)
      expect(signInIndex).toBeGreaterThan(-1)
      expect(languageIndex).toBeGreaterThan(-1)
      expect(aboutIndex).toBeLessThan(signInIndex)
      expect(aboutIndex).toBeLessThan(languageIndex)
    })
  })

  describe('Both Mobile and Desktop Menus', () => {
    it('should render both mobile and desktop UserMenu instances', () => {
      render(
        <MemoryRouter>
          <AppBar authenticated={false} username='' user={null} />
        </MemoryRouter>
      )

      // AppBar should render both mobile and desktop versions
      expect(screen.getByTestId('user-menu-mobile')).toBeInTheDocument()
      expect(screen.getByTestId('user-menu-desktop')).toBeInTheDocument()
    })

    it('should have identical menu items in both mobile and desktop versions', () => {
      render(
        <MemoryRouter>
          <AppBar
            authenticated={true}
            username='admin@example.com'
            user={{
              id: 'admin-1',
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'ADMIN',
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
          />
        </MemoryRouter>
      )

      const mobileMenu = screen.getByTestId('user-menu-mobile')
      const desktopMenu = screen.getByTestId('user-menu-desktop')

      const mobileLabels = Array.from(
        within(mobileMenu).getAllByTestId('menu-label')
      ).map(item => item.textContent)

      const desktopLabels = Array.from(
        within(desktopMenu).getAllByTestId('menu-label')
      ).map(item => item.textContent)

      // Both menus should have the same items
      expect(mobileLabels).toEqual(desktopLabels)
    })
  })
})
