import { beforeEach, describe, expect, it } from 'vitest'
import { breakpoints } from '~/utils/breakpoints'

describe('SSR/Hydration Scenarios', () => {
  const originalWindow = global.window

  beforeEach(() => {
    // Restore window if it was deleted
    if (!global.window) {
      global.window = originalWindow
    }
  })

  describe('Breakpoint Safety', () => {
    it('should have correct media query strings regardless of environment', () => {
      // These should always be consistent regardless of SSR/client
      expect(breakpoints.queries.mobile).toBe('(max-width: 767px)')
      expect(breakpoints.queries.desktop).toBe('(min-width: 1024px)')
    })

    it('should handle window access gracefully', () => {
      // Test that breakpoint functions don't throw when called
      expect(() => {
        const mobile = breakpoints.isMobile()
        const bottomNav = breakpoints.showBottomNav()
        // These should be boolean values
        expect(typeof mobile).toBe('boolean')
        expect(typeof bottomNav).toBe('boolean')
      }).not.toThrow()
    })
  })

  describe('Client-Side Hydration', () => {
    beforeEach(() => {
      // Restore window object for client-side
      global.window = originalWindow
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024, // Desktop by default
      })
    })

    it('should properly detect desktop breakpoints on client', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(false)
      expect(breakpoints.showBottomNav()).toBe(false)
    })

    it('should properly detect mobile breakpoints on client', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)
    })

    it('should properly detect tablet breakpoints on client', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(false)
    })
  })

  describe('Hydration Consistency', () => {
    it('should maintain consistent breakpoint behavior between SSR and client', () => {
      // SSR phase - no window
      // @ts-expect-error - Intentionally removing window for SSR simulation
      delete global.window

      const ssrMobile = breakpoints.isMobile()
      const ssrBottomNav = breakpoints.showBottomNav()

      // Client hydration phase - restore window with desktop viewport
      global.window = originalWindow
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true,
      })

      const clientMobile = breakpoints.isMobile()
      const clientBottomNav = breakpoints.showBottomNav()

      // SSR should use safe defaults (false for mobile detection)
      expect(ssrMobile).toBe(false)
      expect(ssrBottomNav).toBe(false)

      // Client should show actual state based on viewport
      expect(clientMobile).toBe(false)
      expect(clientBottomNav).toBe(false)
    })

    it('should handle viewport changes during runtime', () => {
      // Start with mobile
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)

      // Switch to tablet
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(false)

      // Switch to desktop
      Object.defineProperty(window, 'innerWidth', {
        value: 1440,
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(false)
      expect(breakpoints.showBottomNav()).toBe(false)
    })
  })

  describe('Media Query Consistency', () => {
    it('should have CSS media queries that match JavaScript breakpoint logic', () => {
      // Mobile query should trigger for screens <= 767px
      expect(breakpoints.queries.mobile).toBe('(max-width: 767px)')

      // Desktop query should trigger for screens >= 1024px
      expect(breakpoints.queries.desktop).toBe('(min-width: 1024px)')
    })

    it('should have consistent breakpoint values between constants and functions', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 767,
        configurable: true,
      })
      expect(breakpoints.showBottomNav()).toBe(true)

      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      })
      expect(breakpoints.showBottomNav()).toBe(false)

      Object.defineProperty(window, 'innerWidth', {
        value: 1023,
        configurable: true,
      })
      expect(breakpoints.isMobile()).toBe(true)

      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true,
      })
      expect(breakpoints.isMobile()).toBe(false)
    })
  })

  describe('Extreme Viewport Scenarios', () => {
    it('should handle very small viewports', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 280, // Galaxy Fold closed
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)
    })

    it('should handle very large viewports', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 5120, // 5K display
        configurable: true,
      })

      expect(breakpoints.isMobile()).toBe(false)
      expect(breakpoints.showBottomNav()).toBe(false)
    })

    it('should handle zero or negative viewport widths', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 0,
        configurable: true,
      })
      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)

      Object.defineProperty(window, 'innerWidth', {
        value: -100,
        configurable: true,
      })
      expect(breakpoints.isMobile()).toBe(true)
      expect(breakpoints.showBottomNav()).toBe(true)
    })
  })
})
