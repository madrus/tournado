import { render, screen } from '@testing-library/react'

import { beforeEach, describe, expect, it } from 'vitest'

import { breakpoints } from '~/utils/breakpoints'

// Test component that uses breakpoint detection
function TestBreakpointComponent() {
  const isMobile = breakpoints.isMobile()
  const showBottomNav = breakpoints.showBottomNav()

  return (
    <div data-testid='breakpoint-info'>
      <span data-testid='is-mobile'>{isMobile.toString()}</span>
      <span data-testid='show-bottom-nav'>{showBottomNav.toString()}</span>
    </div>
  )
}

// Mock window.innerWidth for different viewport sizes
const mockViewport = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

describe('Mobile Breakpoint Detection Accuracy', () => {
  beforeEach(() => {
    // Reset to default mobile viewport
    mockViewport(375)
  })

  describe('Mobile device viewports (< 768px)', () => {
    const mobileViewports = [
      { name: 'iPhone SE', width: 375 },
      { name: 'iPhone 12/13/14', width: 390 },
      { name: 'iPhone 12/13/14 Pro Max', width: 428 },
      { name: 'Samsung Galaxy S21', width: 360 },
      { name: 'Pixel 5', width: 393 },
    ]

    mobileViewports.forEach(({ name, width }) => {
      it(`should detect ${name} (${width}px) as mobile with bottom nav`, () => {
        mockViewport(width)

        render(<TestBreakpointComponent />)

        expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
        expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('true')
      })
    })

    it('should handle edge case at mobile breakpoint (767px)', () => {
      mockViewport(767)

      render(<TestBreakpointComponent />)

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
      expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('true')
    })
  })

  describe('Tablet device viewports (768px - 1023px)', () => {
    const tabletViewports = [
      { name: 'iPad Mini', width: 768 },
      { name: 'iPad Air', width: 820 },
      { name: 'iPad Pro 11"', width: 834 },
      { name: 'Surface Pro 7', width: 912 },
      { name: 'iPad Pro 12.9"', width: 1024 },
    ]

    tabletViewports.forEach(({ name, width }) => {
      it(`should detect ${name} (${width}px) as mobile without bottom nav`, () => {
        mockViewport(width)

        render(<TestBreakpointComponent />)

        // Tablets are considered mobile for scroll behavior but don't show bottom nav
        if (width < 1024) {
          expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
        } else {
          expect(screen.getByTestId('is-mobile')).toHaveTextContent('false')
        }
        expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('false')
      })
    })

    it('should handle edge case just above mobile breakpoint (768px)', () => {
      mockViewport(768)

      render(<TestBreakpointComponent />)

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
      expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('false')
    })
  })

  describe('Desktop device viewports (>= 1024px)', () => {
    const desktopViewports = [
      { name: 'Small Laptop', width: 1024 },
      { name: 'Medium Laptop', width: 1366 },
      { name: 'Large Laptop', width: 1440 },
      { name: 'Desktop HD', width: 1920 },
      { name: 'Desktop 4K', width: 3840 },
    ]

    desktopViewports.forEach(({ name, width }) => {
      it(`should detect ${name} (${width}px) as desktop without bottom nav`, () => {
        mockViewport(width)

        render(<TestBreakpointComponent />)

        expect(screen.getByTestId('is-mobile')).toHaveTextContent('false')
        expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('false')
      })
    })

    it('should handle edge case at desktop breakpoint (1024px)', () => {
      mockViewport(1024)

      render(<TestBreakpointComponent />)

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false')
      expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('false')
    })
  })

  describe('Media query consistency', () => {
    it('should have CSS media queries that match JavaScript breakpoint logic', () => {
      // Mobile query should trigger for screens <= 767px
      expect(breakpoints.queries.mobile).toBe('(max-width: 767px)')

      // Desktop query should trigger for screens >= 1024px
      expect(breakpoints.queries.desktop).toBe('(min-width: 1024px)')
    })

    it('should have consistent breakpoint values between constants and functions', () => {
      mockViewport(767)
      expect(breakpoints.showBottomNav()).toBe(true)

      mockViewport(768)
      expect(breakpoints.showBottomNav()).toBe(false)

      mockViewport(1023)
      expect(breakpoints.isMobile()).toBe(true)

      mockViewport(1024)
      expect(breakpoints.isMobile()).toBe(false)
    })
  })

  describe('SSR compatibility', () => {
    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window

      // Simulate SSR environment
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window

      expect(breakpoints.isMobile()).toBe(false)
      expect(breakpoints.showBottomNav()).toBe(false)

      // Restore window
      global.window = originalWindow
    })
  })

  describe('Dynamic viewport changes', () => {
    it('should adapt to viewport changes during runtime', () => {
      // Start with mobile
      mockViewport(375)
      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)

      // Switch to tablet
      mockViewport(768)
      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(false)

      // Switch to desktop
      mockViewport(1440)
      expect(breakpoints.isMobile()).toBe(false)
      expect(breakpoints.showBottomNav()).toBe(false)
    })
  })

  describe('Extreme viewport sizes', () => {
    it('should handle very small viewports', () => {
      mockViewport(280) // Galaxy Fold closed

      render(<TestBreakpointComponent />)

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
      expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('true')
    })

    it('should handle very large viewports', () => {
      mockViewport(5120) // 5K display

      render(<TestBreakpointComponent />)

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false')
      expect(screen.getByTestId('show-bottom-nav')).toHaveTextContent('false')
    })

    it('should handle zero or negative viewport widths', () => {
      mockViewport(0)
      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)

      mockViewport(-100)
      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)
    })
  })
})
