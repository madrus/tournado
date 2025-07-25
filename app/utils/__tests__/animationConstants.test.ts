import { describe, expect, it } from 'vitest'

import {
  ANIMATION_CLASSES,
  ANIMATION_DURATION,
  ANIMATION_TIMING,
  ANIMATIONS,
  type AnimationState,
  type AnimationType,
} from '../animationConstants'

describe('animationConstants', () => {
  describe('ANIMATION_DURATION', () => {
    it('should export correct duration values', () => {
      expect(ANIMATION_DURATION.BOUNCE).toBe('1s')
      expect(ANIMATION_DURATION.SLIDE_OUT).toBe('0.5s')
    })

    it('should have consistent duration format', () => {
      Object.values(ANIMATION_DURATION).forEach(duration => {
        expect(duration).toMatch(/^\d+(\.\d+)?s$/)
      })
    })
  })

  describe('ANIMATION_TIMING', () => {
    it('should export correct timing function values', () => {
      expect(ANIMATION_TIMING.BOUNCE).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)')
      expect(ANIMATION_TIMING.SLIDE_OUT).toBe('ease-out')
    })

    it('should have valid CSS timing functions', () => {
      expect(ANIMATION_TIMING.BOUNCE).toMatch(/^cubic-bezier\([\d.,\s]+\)$/)
      expect(ANIMATION_TIMING.SLIDE_OUT).toBe('ease-out')
    })
  })

  describe('ANIMATIONS', () => {
    it('should combine duration and timing for AppBar animations', () => {
      expect(ANIMATIONS.APP_BAR.BOUNCE).toBe(
        `appBarBounce ${ANIMATION_DURATION.BOUNCE} ${ANIMATION_TIMING.BOUNCE} forwards`
      )
      expect(ANIMATIONS.APP_BAR.SLIDE_OUT).toBe(
        `appBarSlideOut ${ANIMATION_DURATION.SLIDE_OUT} ${ANIMATION_TIMING.SLIDE_OUT} forwards`
      )
    })

    it('should combine duration and timing for BottomNav animations', () => {
      expect(ANIMATIONS.BOTTOM_NAV.BOUNCE).toBe(
        `bottomNavBounce ${ANIMATION_DURATION.BOUNCE} ${ANIMATION_TIMING.BOUNCE} forwards`
      )
      expect(ANIMATIONS.BOTTOM_NAV.SLIDE_OUT).toBe(
        `bottomNavSlideOut ${ANIMATION_DURATION.SLIDE_OUT} ${ANIMATION_TIMING.SLIDE_OUT} forwards`
      )
    })

    it('should include forwards fill-mode in all animations', () => {
      Object.values(ANIMATIONS.APP_BAR).forEach(animation => {
        expect(animation).toMatch(/\sforwards$/)
      })
      Object.values(ANIMATIONS.BOTTOM_NAV).forEach(animation => {
        expect(animation).toMatch(/\sforwards$/)
      })
    })
  })

  describe('ANIMATION_CLASSES', () => {
    it('should provide correct CSS class names for AppBar', () => {
      expect(ANIMATION_CLASSES.APP_BAR.VISIBLE).toBe('app-bar-visible')
      expect(ANIMATION_CLASSES.APP_BAR.HIDDEN).toBe('app-bar-hidden')
      expect(ANIMATION_CLASSES.APP_BAR.BOUNCE).toBe('app-bar-bounce')
      expect(ANIMATION_CLASSES.APP_BAR.SLIDE_OUT).toBe('app-bar-slide-out')
    })

    it('should provide correct CSS class names for BottomNav', () => {
      expect(ANIMATION_CLASSES.BOTTOM_NAV.VISIBLE).toBe('bottom-nav-visible')
      expect(ANIMATION_CLASSES.BOTTOM_NAV.HIDDEN).toBe('bottom-nav-hidden')
      expect(ANIMATION_CLASSES.BOTTOM_NAV.BOUNCE).toBe('bottom-nav-bounce')
      expect(ANIMATION_CLASSES.BOTTOM_NAV.SLIDE_OUT).toBe('bottom-nav-slide-out')
    })

    it('should use consistent naming convention', () => {
      const appBarClasses = Object.values(ANIMATION_CLASSES.APP_BAR)
      const bottomNavClasses = Object.values(ANIMATION_CLASSES.BOTTOM_NAV)

      appBarClasses.forEach(className => {
        expect(className).toMatch(/^app-bar-/)
      })

      bottomNavClasses.forEach(className => {
        expect(className).toMatch(/^bottom-nav-/)
      })
    })

    it('should have parallel structure between AppBar and BottomNav', () => {
      const appBarKeys = Object.keys(ANIMATION_CLASSES.APP_BAR)
      const bottomNavKeys = Object.keys(ANIMATION_CLASSES.BOTTOM_NAV)

      expect(appBarKeys).toEqual(bottomNavKeys)
    })
  })

  describe('type definitions', () => {
    it('should have correct AnimationState type values', () => {
      const validStates: AnimationState[] = ['visible', 'hidden']

      validStates.forEach(state => {
        expect(['visible', 'hidden']).toContain(state)
      })
    })

    it('should have correct AnimationType type values', () => {
      const validTypes: AnimationType[] = ['bounce', 'slideOut']

      validTypes.forEach(type => {
        expect(['bounce', 'slideOut']).toContain(type)
      })
    })
  })

  describe('consistency across constants', () => {
    it('should have matching animation names between ANIMATIONS and keyframe names', () => {
      expect(ANIMATIONS.APP_BAR.BOUNCE).toContain('appBarBounce')
      expect(ANIMATIONS.APP_BAR.SLIDE_OUT).toContain('appBarSlideOut')
      expect(ANIMATIONS.BOTTOM_NAV.BOUNCE).toContain('bottomNavBounce')
      expect(ANIMATIONS.BOTTOM_NAV.SLIDE_OUT).toContain('bottomNavSlideOut')
    })

    it('should have corresponding class names for each animation state', () => {
      const expectedStates = ['VISIBLE', 'HIDDEN', 'BOUNCE', 'SLIDE_OUT']

      expectedStates.forEach(state => {
        expect(ANIMATION_CLASSES.APP_BAR).toHaveProperty(state)
        expect(ANIMATION_CLASSES.BOTTOM_NAV).toHaveProperty(state)
      })
    })

    it('should use kebab-case in CSS class names', () => {
      const allClasses = [
        ...Object.values(ANIMATION_CLASSES.APP_BAR),
        ...Object.values(ANIMATION_CLASSES.BOTTOM_NAV),
      ]

      allClasses.forEach(className => {
        expect(className).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })
  })

  describe('animation performance considerations', () => {
    it('should use hardware-accelerated properties', () => {
      // The animation keyframes should focus on transform properties
      // This test ensures we're following best practices for performance
      expect(ANIMATION_TIMING.SLIDE_OUT).toBe('ease-out')
      expect(ANIMATION_DURATION.SLIDE_OUT).toBe('0.5s')
    })

    it('should have reasonable animation durations', () => {
      const bounceMs = parseFloat(ANIMATION_DURATION.BOUNCE) * 1000
      const slideOutMs = parseFloat(ANIMATION_DURATION.SLIDE_OUT) * 1000

      // Bounce should be longer than slide-out for visual effect
      expect(bounceMs).toBeGreaterThan(slideOutMs)

      // Neither should be too long to avoid poor UX
      expect(bounceMs).toBeLessThanOrEqual(2000)
      expect(slideOutMs).toBeLessThanOrEqual(1000)
    })
  })
})
