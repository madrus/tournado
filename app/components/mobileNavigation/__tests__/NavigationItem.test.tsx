import { MemoryRouter } from 'react-router'

import { render, screen, within } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IconName } from '~/utils/iconUtils'
import { normalizePathname } from '~/utils/route-utils'

import NavigationItem from '../NavigationItem'

// Mock react-router hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLocation: vi.fn(),
  }
})

const mockUseLocation = vi.mocked(await import('react-router')).useLocation

describe('NavigationItem', () => {
  const defaultProps: { to: string; icon: IconName; label: string } = {
    to: '/teams',
    icon: 'apparel',
    label: 'Teams',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render navigation item with correct content', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      // Check that the link exists with correct href
      const link = screen.getByRole('link', { name: 'Navigate to Teams' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/teams')

      // Check that the icon SVG is rendered
      const icon = screen.getByTestId('nav-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('width', '36')
      expect(icon).toHaveAttribute('height', '36')

      // Check that the label is rendered
      const label = screen.getByText('Teams')
      expect(label).toBeInTheDocument()
    })

    it('should have correct accessibility attributes', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-label', 'Navigate to Teams')

      // Check the SVG element has correct classes
      const svg = screen.getByTestId('nav-icon')
      expect(svg).toHaveClass('fill-current')
    })

    it('should have correct data-testid attribute', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('data-testid', 'nav-teams')
    })
  })

  describe('Active State Logic', () => {
    it('should show inactive state when not on current route', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      // Instead of direct node access, use getByTestId for icon and getByText for label
      const icon = screen.getByTestId('nav-icon')
      expect(icon).toBeInTheDocument() // Default inactive state
      expect(icon).toHaveClass('fill-current')
      expect(screen.getByText('Teams')).toBeInTheDocument()
    })

    it('should show active state when on current route', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/teams',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      // Instead of direct node access, use getByTestId for icon and getByText for label
      const icon = screen.getByTestId('nav-icon')
      expect(icon).toHaveClass('text-adaptive-brand')
      const labelNode = screen.getByText('Teams')
      expect(labelNode).toHaveClass('text-adaptive-brand', 'font-bold')
    })

    it('should handle different routes correctly', () => {
      // Test home route
      const homeProps: { to: string; icon: IconName; label: string } = {
        to: '/',
        icon: 'trophy',
        label: 'Home',
      }

      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      const { rerender } = render(
        <MemoryRouter>
          <NavigationItem {...homeProps} />
        </MemoryRouter>
      )

      let homeIcon = screen.getByTestId('nav-icon')
      expect(homeIcon).toHaveClass('text-adaptive-brand') // Should be active

      // Test teams route
      mockUseLocation.mockReturnValue({
        pathname: '/teams',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      rerender(
        <MemoryRouter>
          <NavigationItem {...homeProps} />
        </MemoryRouter>
      )
      homeIcon = screen.getByTestId('nav-icon')
      expect(homeIcon).toHaveClass('text-primary-foreground') // Should be inactive
    })

    it('should handle trailing slashes correctly', () => {
      // Test cases for robust route matching
      const testCases = [
        { pathname: '/teams/', to: '/teams', shouldBeActive: true },
        { pathname: '/teams', to: '/teams/', shouldBeActive: true },
        { pathname: '/teams/', to: '/teams/', shouldBeActive: true },
        { pathname: '/', to: '/', shouldBeActive: true },
        { pathname: '/teams', to: '/about', shouldBeActive: false },
      ]

      testCases.forEach(({ pathname, to, shouldBeActive }) => {
        mockUseLocation.mockReturnValue({
          pathname,
          search: '',
          hash: '',
          state: null,
          key: 'default',
        })

        const { unmount } = render(
          <MemoryRouter>
            <NavigationItem to={to} icon='apparel' label='Test' />
          </MemoryRouter>
        )

        const icon = screen.getByTestId('nav-icon')
        const label = screen.getByText('Test')

        if (shouldBeActive) {
          expect(icon).toHaveClass('text-adaptive-brand')
          expect(label).toHaveClass('text-adaptive-brand', 'font-bold')
        } else {
          expect(icon).toHaveClass('text-primary-foreground')
          expect(label).toHaveClass('text-primary-foreground')
          expect(label).not.toHaveClass('font-bold')
        }

        unmount()
      })
    })

    it('should handle query parameters correctly', () => {
      // Route matching should ignore query params
      mockUseLocation.mockReturnValue({
        pathname: '/teams',
        search: '?tab=active&sort=name',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem to='/teams' icon='apparel' label='Teams' />
        </MemoryRouter>
      )

      // Should still be active despite query params
      const icon = screen.getByTestId('nav-icon')
      expect(icon).toHaveClass('text-adaptive-brand')

      const label = screen.getByText('Teams')
      expect(label).toHaveClass('text-adaptive-brand', 'font-bold')
    })
  })

  describe('Icon Properties', () => {
    it('should render icon with correct size properties', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      const svg = screen.getByTestId('nav-icon')
      expect(svg).toHaveAttribute('width', '36')
      expect(svg).toHaveAttribute('height', '36')
    })

    it('should render icon as inline SVG', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/teams',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      const svg = screen.getByTestId('nav-icon')
      // Inline SVG should have viewBox and fill-current class
      expect(svg).toHaveAttribute('viewBox', '0 -960 960 960')
      expect(svg).toHaveClass('fill-current')
    })

    it('should support custom icon sizes', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} iconSize={48} />
        </MemoryRouter>
      )

      const svg = screen.getByTestId('nav-icon')
      expect(svg).toHaveAttribute('width', '48')
      expect(svg).toHaveAttribute('height', '48')
    })

    it('should use responsive icon sizing by default', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      const svg = screen.getByTestId('nav-icon')
      // Should have responsive size (32 or 36 depending on viewport)
      const size = svg.getAttribute('width')
      expect(['32', '36']).toContain(size)
    })
  })

  describe('Color Variants', () => {
    it('should support all navigation color variants in active state', () => {
      const colorTestCases = [
        { color: 'brand' as const, expectedActiveClass: 'text-adaptive-brand' },
        { color: 'primary' as const, expectedActiveClass: 'text-adaptive-emerald' },
        { color: 'emerald' as const, expectedActiveClass: 'text-adaptive-emerald' },
        { color: 'blue' as const, expectedActiveClass: 'text-adaptive-blue' },
        { color: 'red' as const, expectedActiveClass: 'text-adaptive-red' },
        { color: 'teal' as const, expectedActiveClass: 'text-adaptive-teal' },
      ]

      colorTestCases.forEach(({ color, expectedActiveClass }) => {
        mockUseLocation.mockReturnValue({
          pathname: '/teams',
          search: '',
          hash: '',
          state: null,
          key: 'default',
        })

        const { unmount } = render(
          <MemoryRouter>
            <NavigationItem to='/teams' icon='apparel' label='Teams' color={color} />
          </MemoryRouter>
        )

        // Check that both icon and label use the correct active color
        const icon = screen.getByTestId('nav-icon')
        expect(icon).toHaveClass(expectedActiveClass)

        const label = screen.getByText('Teams')
        expect(label).toHaveClass(expectedActiveClass, 'font-bold')

        unmount()
      })
    })

    it('should use neutral color for all navigation variants in inactive state', () => {
      const colors = ['brand', 'primary', 'emerald', 'blue', 'red', 'teal'] as const

      colors.forEach(color => {
        mockUseLocation.mockReturnValue({
          pathname: '/', // Different from /teams
          search: '',
          hash: '',
          state: null,
          key: 'default',
        })

        const { unmount } = render(
          <MemoryRouter>
            <NavigationItem to='/teams' icon='apparel' label='Teams' color={color} />
          </MemoryRouter>
        )

        // All colors should use neutral styling when inactive
        const icon = screen.getByTestId('nav-icon')
        expect(icon).toHaveClass('text-primary-foreground')

        const label = screen.getByText('Teams')
        expect(label).toHaveClass('text-primary-foreground')
        expect(label).not.toHaveClass('font-bold')

        unmount()
      })
    })
  })

  describe('Different Navigation Items', () => {
    it('should handle different labels and data-testid attributes', () => {
      const testCases: Array<{
        to: string
        icon: IconName
        label: string
        expectedDataCy: string
      }> = [
        { to: '/', icon: 'trophy', label: 'Home', expectedDataCy: 'nav-home' },
        { to: '/teams', icon: 'apparel', label: 'Teams', expectedDataCy: 'nav-teams' },
        { to: '/about', icon: 'pending', label: 'More', expectedDataCy: 'nav-more' },
      ]

      testCases.forEach(({ to, icon, label, expectedDataCy }) => {
        mockUseLocation.mockReturnValue({
          pathname: '/',
          search: '',
          hash: '',
          state: null,
          key: 'default',
        })

        const { container, unmount } = render(
          <MemoryRouter>
            <NavigationItem to={to} icon={icon} label={label} />
          </MemoryRouter>
        )

        const link = within(container).getByRole('link', {
          name: `Navigate to ${label}`,
        })
        expect(link).toHaveAttribute('data-testid', expectedDataCy)
        expect(link).toHaveAttribute('href', to)

        // Check that SVG icon is rendered
        const iconElement = within(container).getByTestId('nav-icon')
        expect(iconElement).toBeInTheDocument()
        expect(iconElement).toHaveClass('fill-current')

        // Check that label is rendered
        expect(within(container).getByText(label)).toBeInTheDocument()

        unmount()
      })
    })
  })

  describe('CSS Classes', () => {
    it('should have correct structural CSS classes', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      })

      render(
        <MemoryRouter>
          <NavigationItem {...defaultProps} />
        </MemoryRouter>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'transition-colors',
        'duration-200'
      )

      const svg = screen.getByTestId('nav-icon')
      expect(svg).toHaveClass('fill-current', 'transition-colors', 'duration-200')

      const label = screen.getByText('Teams')
      expect(label).toHaveClass('mt-1', 'text-xs', 'transition-colors', 'duration-200')
    })
  })

  describe('normalizePathname utility', () => {
    it('should normalize pathnames correctly', () => {
      expect(normalizePathname('/about/')).toBe('/about')
      expect(normalizePathname('/about')).toBe('/about')
      expect(normalizePathname('/')).toBe('/')
      expect(normalizePathname('')).toBe('/')
      expect(normalizePathname('   ')).toBe('/')
    })
  })
})

// Additional integration tests to ensure our fixes work together
describe('NavigationItem Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle complex scenarios with color variants and route matching', () => {
    // Test emerald color with trailing slash route matching
    mockUseLocation.mockReturnValue({
      pathname: '/teams/',
      search: '?filter=active',
      hash: '#section1',
      state: null,
      key: 'default',
    })

    render(
      <MemoryRouter>
        <NavigationItem to='/teams' icon='apparel' label='Teams' color='emerald' />
      </MemoryRouter>
    )

    // Should be active despite trailing slash difference
    const icon = screen.getByTestId('nav-icon')
    expect(icon).toHaveClass('text-adaptive-emerald')

    const label = screen.getByText('Teams')
    expect(label).toHaveClass('text-adaptive-emerald', 'font-bold')
  })

  it('should maintain correct icon properties with different colors', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/teams',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    })

    render(
      <MemoryRouter>
        <NavigationItem to='/teams' icon='apparel' label='Teams' color='blue' />
      </MemoryRouter>
    )

    const icon = screen.getByTestId('nav-icon')
    // Should have both color styling and correct icon properties
    expect(icon).toHaveClass('text-adaptive-blue')
    expect(icon).toHaveAttribute('width', '36')
    expect(icon).toHaveAttribute('height', '36')
    expect(icon).toHaveAttribute('viewBox', '0 -960 960 960')
  })
})
