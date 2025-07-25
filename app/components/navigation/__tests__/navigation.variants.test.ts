import { describe, expect, it } from 'vitest'

import {
  type NavigationComponent,
  navigationVariants,
  type NavigationVariants,
  type NavigationViewport,
  type NavigationVisible,
} from '../navigation.variants'

describe('navigationVariants', () => {
  describe('component variants', () => {
    it('should handle APP_BAR component type', () => {
      const result = navigationVariants({ component: 'APP_BAR' })
      expect(typeof result).toBe('string')
    })

    it('should handle BOTTOM_NAV component type', () => {
      const result = navigationVariants({ component: 'BOTTOM_NAV' })
      expect(typeof result).toBe('string')
    })
  })

  describe('viewport variants', () => {
    it('should handle mobile viewport', () => {
      const result = navigationVariants({ viewport: 'mobile' })
      expect(typeof result).toBe('string')
    })

    it('should handle desktop viewport', () => {
      const result = navigationVariants({ viewport: 'desktop' })
      expect(typeof result).toBe('string')
    })
  })

  describe('visibility variants', () => {
    it('should handle visible state', () => {
      const result = navigationVariants({ visible: true })
      expect(typeof result).toBe('string')
    })

    it('should handle hidden state', () => {
      const result = navigationVariants({ visible: false })
      expect(typeof result).toBe('string')
    })
  })

  describe('compound variants - APP_BAR', () => {
    it('should return bounce animation for mobile visible APP_BAR', () => {
      const result = navigationVariants({
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: true,
      })
      expect(result).toContain('app-bar-bounce')
    })

    it('should return slide-out animation for mobile hidden APP_BAR', () => {
      const result = navigationVariants({
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: false,
      })
      expect(result).toContain('app-bar-slide-out')
    })

    it('should return visible class for desktop visible APP_BAR', () => {
      const result = navigationVariants({
        component: 'APP_BAR',
        viewport: 'desktop',
        visible: true,
      })
      expect(result).toContain('app-bar-visible')
    })

    it('should return hidden class for desktop hidden APP_BAR', () => {
      const result = navigationVariants({
        component: 'APP_BAR',
        viewport: 'desktop',
        visible: false,
      })
      expect(result).toContain('app-bar-hidden')
    })
  })

  describe('compound variants - BOTTOM_NAV', () => {
    it('should return bounce animation for mobile visible BOTTOM_NAV', () => {
      const result = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'mobile',
        visible: true,
      })
      expect(result).toContain('bottom-nav-bounce')
    })

    it('should return slide-out animation for mobile hidden BOTTOM_NAV', () => {
      const result = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'mobile',
        visible: false,
      })
      expect(result).toContain('bottom-nav-slide-out')
    })

    it('should return visible class for desktop visible BOTTOM_NAV', () => {
      const result = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'desktop',
        visible: true,
      })
      expect(result).toContain('bottom-nav-visible')
    })

    it('should return hidden class for desktop hidden BOTTOM_NAV', () => {
      const result = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'desktop',
        visible: false,
      })
      expect(result).toContain('bottom-nav-hidden')
    })
  })

  describe('default variants', () => {
    it('should use default variants when no props provided', () => {
      const result = navigationVariants({})
      // Should apply APP_BAR + desktop + visible defaults
      expect(result).toContain('app-bar-visible')
    })

    it('should use default viewport and visible when only component specified', () => {
      const result = navigationVariants({ component: 'BOTTOM_NAV' })
      // Should apply BOTTOM_NAV + desktop + visible defaults
      expect(result).toContain('bottom-nav-visible')
    })
  })

  describe('type definitions', () => {
    it('should export correct NavigationComponent type values', () => {
      const validComponents: NavigationComponent[] = ['APP_BAR', 'BOTTOM_NAV']

      validComponents.forEach(component => {
        expect(['APP_BAR', 'BOTTOM_NAV']).toContain(component)
      })
    })

    it('should export correct NavigationViewport type values', () => {
      const validViewports: NavigationViewport[] = ['mobile', 'desktop']

      validViewports.forEach(viewport => {
        expect(['mobile', 'desktop']).toContain(viewport)
      })
    })

    it('should export correct NavigationVisible type values', () => {
      const validVisible: NavigationVisible[] = [true, false]

      validVisible.forEach(visible => {
        expect([true, false]).toContain(visible)
      })
    })
  })

  describe('animation class consistency', () => {
    it('should use consistent class naming convention for APP_BAR', () => {
      const mobileVisible = navigationVariants({
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: true,
      })
      const mobileHidden = navigationVariants({
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: false,
      })
      const desktopVisible = navigationVariants({
        component: 'APP_BAR',
        viewport: 'desktop',
        visible: true,
      })
      const desktopHidden = navigationVariants({
        component: 'APP_BAR',
        viewport: 'desktop',
        visible: false,
      })

      expect(mobileVisible).toMatch(/app-bar-/)
      expect(mobileHidden).toMatch(/app-bar-/)
      expect(desktopVisible).toMatch(/app-bar-/)
      expect(desktopHidden).toMatch(/app-bar-/)
    })

    it('should use consistent class naming convention for BOTTOM_NAV', () => {
      const mobileVisible = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'mobile',
        visible: true,
      })
      const mobileHidden = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'mobile',
        visible: false,
      })
      const desktopVisible = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'desktop',
        visible: true,
      })
      const desktopHidden = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'desktop',
        visible: false,
      })

      expect(mobileVisible).toMatch(/bottom-nav-/)
      expect(mobileHidden).toMatch(/bottom-nav-/)
      expect(desktopVisible).toMatch(/bottom-nav-/)
      expect(desktopHidden).toMatch(/bottom-nav-/)
    })

    it('should use kebab-case in all class names', () => {
      const allVariations = [
        navigationVariants({ component: 'APP_BAR', viewport: 'mobile', visible: true }),
        navigationVariants({
          component: 'APP_BAR',
          viewport: 'mobile',
          visible: false,
        }),
        navigationVariants({
          component: 'APP_BAR',
          viewport: 'desktop',
          visible: true,
        }),
        navigationVariants({
          component: 'APP_BAR',
          viewport: 'desktop',
          visible: false,
        }),
        navigationVariants({
          component: 'BOTTOM_NAV',
          viewport: 'mobile',
          visible: true,
        }),
        navigationVariants({
          component: 'BOTTOM_NAV',
          viewport: 'mobile',
          visible: false,
        }),
        navigationVariants({
          component: 'BOTTOM_NAV',
          viewport: 'desktop',
          visible: true,
        }),
        navigationVariants({
          component: 'BOTTOM_NAV',
          viewport: 'desktop',
          visible: false,
        }),
      ]

      allVariations.forEach(className => {
        // Extract the animation class (should be the last part after whitespace)
        const animationClass = className.trim().split(' ').pop()
        expect(animationClass).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })
  })

  describe('animation behavior differentiation', () => {
    it('should use different animations for mobile vs desktop', () => {
      const mobileVisible = navigationVariants({
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: true,
      })
      const desktopVisible = navigationVariants({
        component: 'APP_BAR',
        viewport: 'desktop',
        visible: true,
      })

      // Mobile should use bounce animation, desktop should use simple visible
      expect(mobileVisible).toContain('bounce')
      expect(desktopVisible).toContain('visible')
      expect(desktopVisible).not.toContain('bounce')
    })

    it('should use slide-out for mobile hidden state', () => {
      const mobileHidden = navigationVariants({
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: false,
      })
      const bottomNavMobileHidden = navigationVariants({
        component: 'BOTTOM_NAV',
        viewport: 'mobile',
        visible: false,
      })

      expect(mobileHidden).toContain('slide-out')
      expect(bottomNavMobileHidden).toContain('slide-out')
    })
  })

  describe('type safety', () => {
    it('should accept valid NavigationVariants props', () => {
      const validProps: NavigationVariants = {
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: true,
      }

      expect(() => navigationVariants(validProps)).not.toThrow()
    })

    it('should work with partial props due to defaults', () => {
      const partialProps: Partial<NavigationVariants> = {
        component: 'BOTTOM_NAV',
      }

      expect(() => navigationVariants(partialProps)).not.toThrow()
    })
  })
})
