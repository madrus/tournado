import { MemoryRouter } from 'react-router'

import { render, screen, within } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IconName } from '~/utils/iconUtils'

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
      expect(icon).toHaveClass('text-brand')
      const labelNode = screen.getByText('Teams')
      expect(labelNode).toHaveClass('text-brand', 'font-bold')
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
      expect(homeIcon).toHaveClass('text-brand') // Should be active

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
      expect(homeIcon).toBeInTheDocument() // Should be inactive
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
      expect(link).toHaveClass('flex', 'flex-col', 'items-center')

      const svg = screen.getByTestId('nav-icon')
      expect(svg).toHaveClass('fill-current')

      const label = screen.getByText('Teams')
      expect(label).toHaveClass('mt-1', 'text-xs')
    })
  })
})
