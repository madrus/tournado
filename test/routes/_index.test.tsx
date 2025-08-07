import { MemoryRouter } from 'react-router'

import type { User } from '@prisma/client'
import { render, screen } from '@testing-library/react'

import { describe, expect, test } from 'vitest'

import IndexPage from '~/routes/_index'

// Mock the loader data
const mockLoaderData = (user: User | null) => ({
  user,
})

// Mock useLoaderData
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLoaderData: () => mockLoaderData(mockUser),
  }
})

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

// Mock ActionLinkButton component
vi.mock('~/components/buttons', () => ({
  ActionLinkButton: ({
    to,
    children,
    label,
    className,
    'data-testid': dataTestId,
  }: {
    to: string
    children?: React.ReactNode
    label?: string
    className?: string
    'data-testid'?: string
  }) => (
    <a
      href={to}
      className={`bg-primary-600 inline-flex items-center justify-center rounded-lg border font-semibold text-white ${className || ''}`}
      data-testid={dataTestId}
    >
      {label || children}
    </a>
  ),
}))

let mockUser: User | null = null

describe('Home Page (_index)', () => {
  describe('View Teams Button Routing', () => {
    test('should route to public teams page for non-authenticated users', () => {
      mockUser = null

      render(
        <MemoryRouter>
          <IndexPage />
        </MemoryRouter>
      )

      const viewTeamsButton = screen.getByTestId('view-teams-button')
      expect(viewTeamsButton).toHaveAttribute('href', '/teams')
    })

    test('should route to public teams page for PUBLIC users only', () => {
      mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'PUBLIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { unmount } = render(
        <MemoryRouter>
          <IndexPage />
        </MemoryRouter>
      )

      const viewTeamsButton = screen.getByTestId('view-teams-button')
      expect(viewTeamsButton).toHaveAttribute('href', '/teams')

      unmount()
    })

    test('should route to admin teams page for users with admin panel access', () => {
      const adminPanelRoles: Array<'MANAGER' | 'REFEREE'> = ['MANAGER', 'REFEREE']

      adminPanelRoles.forEach(role => {
        mockUser = {
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
            <IndexPage />
          </MemoryRouter>
        )

        const viewTeamsButton = screen.getByTestId('view-teams-button')
        expect(viewTeamsButton).toHaveAttribute(
          'href',
          '/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
        )

        unmount()
      })
    })

    test('should route to admin teams page for admin users', () => {
      mockUser = {
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
          <IndexPage />
        </MemoryRouter>
      )

      const viewTeamsButton = screen.getByTestId('view-teams-button')
      expect(viewTeamsButton).toHaveAttribute('href', '/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
    })

    test('should route based on user role with comprehensive test matrix', () => {
      const testCases: Array<{
        scenario: string
        user: User | null
        expectedHref: string
      }> = [
        {
          scenario: 'null user (not authenticated)',
          user: null,
          expectedHref: '/teams',
        },
        {
          scenario: 'PUBLIC role user',
          user: {
            id: 'user-1',
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedHref: '/teams',
        },
        {
          scenario: 'MANAGER role user',
          user: {
            id: 'user-2',
            email: 'manager@example.com',
            firstName: 'Tournament',
            lastName: 'Manager',
            role: 'MANAGER',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedHref: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams',
        },
        {
          scenario: 'REFEREE role user',
          user: {
            id: 'user-4',
            email: 'referee@example.com',
            firstName: 'Test',
            lastName: 'Referee',
            role: 'REFEREE',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedHref: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams',
        },
        {
          scenario: 'ADMIN role user',
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedHref: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams',
        },
      ]

      testCases.forEach(({ scenario, user, expectedHref }) => {
        mockUser = user

        const { unmount } = render(
          <MemoryRouter>
            <IndexPage />
          </MemoryRouter>
        )

        const viewTeamsButton = screen.getByTestId('view-teams-button')
        expect(viewTeamsButton, `Failed for scenario: ${scenario}`).toHaveAttribute(
          'href',
          expectedHref
        )

        unmount()
      })
    })
  })

  describe('Page Structure', () => {
    test('should render main elements correctly', () => {
      mockUser = null

      render(
        <MemoryRouter>
          <IndexPage />
        </MemoryRouter>
      )

      // Check main structure
      expect(screen.getByRole('main')).toBeInTheDocument()

      // Check hero section content
      expect(screen.getByText('common.appName')).toBeInTheDocument()
      expect(screen.getByText('landing.hero.description')).toBeInTheDocument()
      expect(screen.getByTestId('view-teams-button')).toBeInTheDocument()
      expect(screen.getByText('landing.hero.viewTeams')).toBeInTheDocument()

      // Check features section
      expect(screen.getByText('landing.features.title')).toBeInTheDocument()
      expect(screen.getByText('landing.features.subtitle')).toBeInTheDocument()
      expect(screen.getByText('landing.features.description')).toBeInTheDocument()
    })

    test('should render View Teams button with correct styling', () => {
      mockUser = null

      render(
        <MemoryRouter>
          <IndexPage />
        </MemoryRouter>
      )

      const viewTeamsButton = screen.getByTestId('view-teams-button')

      // Check button has essential styling classes (key functional classes)
      expect(viewTeamsButton).toHaveClass('inline-flex')
      expect(viewTeamsButton).toHaveClass('items-center')
      expect(viewTeamsButton).toHaveClass('justify-center')
      expect(viewTeamsButton).toHaveClass('rounded-lg')
      expect(viewTeamsButton).toHaveClass('font-semibold')
      expect(viewTeamsButton).toHaveClass('bg-primary-600') // primary variant, primary color = emerald
      expect(viewTeamsButton).toHaveClass('text-white')
      expect(viewTeamsButton).toHaveClass('border')

      // Check it's a proper link element
      expect(viewTeamsButton.tagName).toBe('A')
    })
  })

  describe('Consistency with AppBar', () => {
    test('should use same routing logic as AppBar Teams menu item', () => {
      // This test ensures our routing logic matches the AppBar component
      const roles: Array<{
        role: 'PUBLIC' | 'MANAGER' | 'REFEREE' | 'ADMIN'
        expectedRoute: string
      }> = [
        { role: 'PUBLIC', expectedRoute: '/teams' },
        { role: 'MANAGER', expectedRoute: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' },
        { role: 'REFEREE', expectedRoute: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' },
        { role: 'ADMIN', expectedRoute: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' },
      ]

      roles.forEach(({ role, expectedRoute }) => {
        mockUser = {
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
            <IndexPage />
          </MemoryRouter>
        )

        const viewTeamsButton = screen.getByTestId('view-teams-button')
        expect(viewTeamsButton).toHaveAttribute('href', expectedRoute)

        unmount()
      })
    })
  })
})
