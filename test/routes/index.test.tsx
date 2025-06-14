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

// Mock ActionLink component
vi.mock('~/components/PrefetchLink', () => ({
  ActionLink: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className} data-testid='view-teams-button'>
      {children}
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

    test('should route to public teams page for authenticated non-admin users', () => {
      const nonAdminRoles: Array<
        'PUBLIC' | 'TOURNAMENT_MANAGER' | 'REFEREE_COORDINATOR' | 'REFEREE'
      > = ['PUBLIC', 'TOURNAMENT_MANAGER', 'REFEREE_COORDINATOR', 'REFEREE']

      nonAdminRoles.forEach(role => {
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
        expect(viewTeamsButton).toHaveAttribute('href', '/teams')

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
          scenario: 'TOURNAMENT_MANAGER role user',
          user: {
            id: 'user-2',
            email: 'manager@example.com',
            firstName: 'Tournament',
            lastName: 'Manager',
            role: 'TOURNAMENT_MANAGER',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedHref: '/teams',
        },
        {
          scenario: 'REFEREE_COORDINATOR role user',
          user: {
            id: 'user-3',
            email: 'coordinator@example.com',
            firstName: 'Referee',
            lastName: 'Coordinator',
            role: 'REFEREE_COORDINATOR',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedHref: '/teams',
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
          expectedHref: '/teams',
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

      // Check button has expected styling classes from ActionLinkButton component
      expect(viewTeamsButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'border',
        'py-2',
        'text-sm',
        'font-medium',
        'shadow-sm',
        'ps-4',
        'pe-4',
        'bg-emerald-600',
        'hover:bg-emerald-500',
        'focus:ring-emerald-600',
        'border-transparent',
        'text-white'
      )
    })
  })

  describe('Consistency with AppBar', () => {
    test('should use same routing logic as AppBar Teams menu item', () => {
      // This test ensures our routing logic matches the AppBar component
      const roles: Array<{
        role:
          | 'PUBLIC'
          | 'TOURNAMENT_MANAGER'
          | 'REFEREE_COORDINATOR'
          | 'REFEREE'
          | 'ADMIN'
        expectedRoute: string
      }> = [
        { role: 'PUBLIC', expectedRoute: '/teams' },
        { role: 'TOURNAMENT_MANAGER', expectedRoute: '/teams' },
        { role: 'REFEREE_COORDINATOR', expectedRoute: '/teams' },
        { role: 'REFEREE', expectedRoute: '/teams' },
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
