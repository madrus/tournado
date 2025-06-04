import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

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
  const defaultProps = {
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

      // Check that the icon is rendered
      const icon = screen.getByText('apparel')
      expect(icon).toBeInTheDocument()

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

      const icon = screen.getByText('apparel')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have correct data-cy attribute', () => {
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
      expect(link).toHaveAttribute('data-cy', 'nav-teams')
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

      const icon = screen.getByText('apparel')
      const label = screen.getByText('Teams')

      // Check inactive styling
      expect(icon).toHaveClass('text-emerald-800')
      expect(icon).not.toHaveClass('text-red-500')
      expect(label).toHaveClass('text-emerald-800')
      expect(label).not.toHaveClass('text-red-500', 'font-bold')
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

      const icon = screen.getByText('apparel')
      const label = screen.getByText('Teams')

      // Check active styling
      expect(icon).toHaveClass('text-red-500')
      expect(icon).not.toHaveClass('text-emerald-800')
      expect(label).toHaveClass('text-red-500', 'font-bold')
      expect(label).not.toHaveClass('text-emerald-800')
    })

    it('should handle different routes correctly', () => {
      // Test home route
      const homeProps = { to: '/', icon: 'trophy', label: 'Home' }

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

      let icon = screen.getByText('trophy')
      expect(icon).toHaveClass('text-red-500') // Should be active

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

      icon = screen.getByText('trophy')
      expect(icon).toHaveClass('text-emerald-800') // Should be inactive
    })
  })

  describe('Icon Styling', () => {
    it('should apply correct icon styles for inactive state', () => {
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

      const icon = screen.getByText('apparel')
      expect(icon).toHaveStyle({
        fontSize: '36px',
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48",
      })
    })

    it('should apply correct icon styles for active state', () => {
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

      const icon = screen.getByText('apparel')
      expect(icon).toHaveStyle({
        fontSize: '36px',
        fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48",
      })
    })
  })

  describe('Different Navigation Items', () => {
    it('should handle different labels and data-cy attributes', () => {
      const testCases = [
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

        const { unmount } = render(
          <MemoryRouter>
            <NavigationItem to={to} icon={icon} label={label} />
          </MemoryRouter>
        )

        const link = screen.getByRole('link', { name: `Navigate to ${label}` })
        expect(link).toHaveAttribute('data-cy', expectedDataCy)
        expect(link).toHaveAttribute('href', to)
        expect(screen.getByText(icon)).toBeInTheDocument()
        expect(screen.getByText(label)).toBeInTheDocument()

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

      const icon = screen.getByText('apparel')
      expect(icon).toHaveClass('material-symbols-outlined')

      const label = screen.getByText('Teams')
      expect(label).toHaveClass('mt-1', 'text-xs')
    })
  })
})
