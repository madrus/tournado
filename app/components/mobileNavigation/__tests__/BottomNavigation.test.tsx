import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import BottomNavigation from '../BottomNavigation'

// Mock react-router hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLocation: vi.fn(() => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    })),
  }
})

// Mock NavigationItem component for focused testing
vi.mock('../NavigationItem', () => ({
  default: ({ to, icon, label }: { to: string; icon: string; label: string }) => (
    <a href={to} data-testid={`nav-item-${label.toLowerCase()}`}>
      <span data-testid={`icon-${icon}`}>{icon}</span>
      <span data-testid={`label-${label.toLowerCase()}`}>{label}</span>
    </a>
  ),
}))

describe('BottomNavigation', () => {
  describe('Basic Rendering', () => {
    it('should render navigation container with correct attributes', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveAttribute('aria-label', 'Bottom navigation')
      expect(nav).toHaveAttribute('data-testid', 'bottom-navigation')
    })

    it('should have correct CSS classes for mobile-only display', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass(
        'fixed',
        'right-0',
        'bottom-0',
        'left-0',
        'z-50',
        'flex',
        'justify-between',
        'p-3',
        'shadow-lg',
        'md:hidden'
      )
      // Background color is now set via CSS custom property
      expect(nav).toHaveAttribute('style', 'background-color: var(--footer-bg);')
    })

    it('should render inner container with correct layout classes', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const innerContainer = screen.getByRole('navigation').firstChild
      expect(innerContainer).toHaveClass('flex', 'w-full', 'justify-between', 'px-3')
    })
  })

  describe('Navigation Items', () => {
    it('should render all navigation items with correct props', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      // Test Home navigation item
      const homeItem = screen.getByTestId('nav-item-home')
      expect(homeItem).toBeInTheDocument()
      expect(homeItem).toHaveAttribute('href', '/')
      expect(screen.getByTestId('icon-trophy')).toBeInTheDocument()
      expect(screen.getByTestId('label-home')).toHaveTextContent('Home')

      // Test Teams navigation item
      const teamsItem = screen.getByTestId('nav-item-teams')
      expect(teamsItem).toBeInTheDocument()
      expect(teamsItem).toHaveAttribute('href', '/teams')
      expect(screen.getByTestId('icon-apparel')).toBeInTheDocument()
      expect(screen.getByTestId('label-teams')).toHaveTextContent('Teams')

      // Test More navigation item
      const moreItem = screen.getByTestId('nav-item-more')
      expect(moreItem).toBeInTheDocument()
      expect(moreItem).toHaveAttribute('href', '/about')
      expect(screen.getByTestId('icon-pending')).toBeInTheDocument()
      expect(screen.getByTestId('label-more')).toHaveTextContent('More')
    })

    it('should render exactly 3 navigation items', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const navItems = screen.getAllByTestId(/^nav-item-/)
      expect(navItems).toHaveLength(3)
    })

    it('should render navigation items in correct order', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const navItems = screen.getAllByTestId(/^nav-item-/)
      const itemLabels = navItems.map(item => {
        const href = item.getAttribute('href')
        const label = item.querySelector('[data-testid^="label-"]')?.textContent
        return { href, label }
      })

      expect(itemLabels).toEqual([
        { href: '/', label: 'Home' },
        { href: '/teams', label: 'Teams' },
        { href: '/about', label: 'More' },
      ])
    })
  })

  describe('Navigation Items Configuration', () => {
    it('should have correct icon and route mappings', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      // Verify each item has the expected icon and route combination
      const expectedItems = [
        { route: '/', icon: 'trophy', label: 'Home' },
        { route: '/teams', icon: 'apparel', label: 'Teams' },
        { route: '/about', icon: 'pending', label: 'More' },
      ]

      expectedItems.forEach(({ route, icon, label }) => {
        const navItem = screen.getByTestId(`nav-item-${label.toLowerCase()}`)
        expect(navItem).toHaveAttribute('href', route)
        expect(screen.getByTestId(`icon-${icon}`)).toBeInTheDocument()
        expect(screen.getByTestId(`label-${label.toLowerCase()}`)).toHaveTextContent(
          label
        )
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('role', 'navigation')
      expect(nav).toHaveAttribute('aria-label', 'Bottom navigation')
    })

    it('should be discoverable by screen readers', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      // Should be able to find by role
      const navigation = screen.getByRole('navigation', { name: 'Bottom navigation' })
      expect(navigation).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should have correct DOM structure', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav.children).toHaveLength(1)

      const innerContainer = nav.firstChild as HTMLElement
      expect(innerContainer).toHaveClass('flex', 'w-full', 'justify-between', 'px-3')

      // Should have 3 navigation items inside the container
      expect(innerContainer.children).toHaveLength(3)
    })
  })

  describe('Mobile-Specific Behavior', () => {
    it('should be hidden on desktop (md:hidden class)', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('md:hidden')
    })

    it('should be positioned fixed at bottom', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('fixed', 'right-0', 'bottom-0', 'left-0')
    })

    it('should have high z-index for overlay behavior', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('z-50')
    })
  })

  describe('Testing Attributes', () => {
    it('should have data-testid attribute for e2e testing', () => {
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveAttribute('data-testid', 'bottom-navigation')
    })
  })

  describe('Component Integration', () => {
    it('should pass correct props to NavigationItem components', () => {
      // This test verifies the component correctly passes props to its children
      // The mocked NavigationItem captures the props and renders them as attributes
      render(
        <MemoryRouter>
          <BottomNavigation />
        </MemoryRouter>
      )

      // Each navigation item should receive the correct to, icon, and label props
      // as evidenced by the rendered output from our mock
      expect(screen.getByTestId('nav-item-home')).toHaveAttribute('href', '/')
      expect(screen.getByTestId('nav-item-teams')).toHaveAttribute('href', '/teams')
      expect(screen.getByTestId('nav-item-more')).toHaveAttribute('href', '/about')
    })
  })
})
