import { describe, expect, it } from 'vitest'

import { scrollLogic } from '../dom-utils'

describe('scrollLogic', () => {
  describe('shouldShowHeader', () => {
    it('should return null when movement is below threshold', () => {
      // Small movements should not trigger changes
      expect(scrollLogic.shouldShowHeader(100, 95, 20)).toBe(null) // 5px < 20px threshold
      expect(scrollLogic.shouldShowHeader(95, 100, 20)).toBe(null) // 5px < 20px threshold
      expect(scrollLogic.shouldShowHeader(110, 100, 15)).toBe(null) // 10px < 15px threshold
    })

    it('should return false (hide) when scrolling down beyond threshold', () => {
      // Downward scroll should hide header
      expect(scrollLogic.shouldShowHeader(120, 100, 20)).toBe(false) // 20px down
      expect(scrollLogic.shouldShowHeader(150, 100, 20)).toBe(false) // 50px down
      expect(scrollLogic.shouldShowHeader(115, 100, 10)).toBe(false) // 15px down > 10px threshold
    })

    it('should return true (show) when scrolling up beyond threshold', () => {
      // Upward scroll should show header
      expect(scrollLogic.shouldShowHeader(80, 100, 20)).toBe(true) // 20px up
      expect(scrollLogic.shouldShowHeader(50, 100, 20)).toBe(true) // 50px up
      expect(scrollLogic.shouldShowHeader(85, 100, 10)).toBe(true) // 15px up > 10px threshold
    })

    it('should handle zero threshold', () => {
      // Any movement should trigger with zero threshold
      expect(scrollLogic.shouldShowHeader(101, 100, 0)).toBe(false) // 1px down
      expect(scrollLogic.shouldShowHeader(99, 100, 0)).toBe(true) // 1px up
      expect(scrollLogic.shouldShowHeader(100, 100, 0)).toBe(null) // No movement
    })

    it('should handle negative threshold gracefully', () => {
      // Negative threshold should behave like zero threshold
      expect(scrollLogic.shouldShowHeader(105, 100, -10)).toBe(false) // Down
      expect(scrollLogic.shouldShowHeader(95, 100, -10)).toBe(true) // Up
    })
  })

  describe('isValidScrollPosition', () => {
    it('should return true for positions within valid range', () => {
      expect(scrollLogic.isValidScrollPosition(0, 500)).toBe(true) // At top
      expect(scrollLogic.isValidScrollPosition(250, 500)).toBe(true) // Middle
      expect(scrollLogic.isValidScrollPosition(500, 500)).toBe(true) // At bottom
    })

    it('should return false for negative positions (top overscroll)', () => {
      expect(scrollLogic.isValidScrollPosition(-1, 500)).toBe(false)
      expect(scrollLogic.isValidScrollPosition(-50, 500)).toBe(false)
      expect(scrollLogic.isValidScrollPosition(-100, 500)).toBe(false)
    })

    it('should return false for positions beyond maxScrollY (bottom overscroll)', () => {
      expect(scrollLogic.isValidScrollPosition(501, 500)).toBe(false)
      expect(scrollLogic.isValidScrollPosition(600, 500)).toBe(false)
      expect(scrollLogic.isValidScrollPosition(1000, 500)).toBe(false)
    })

    it('should handle edge case where maxScrollY is 0', () => {
      expect(scrollLogic.isValidScrollPosition(0, 0)).toBe(true) // Valid
      expect(scrollLogic.isValidScrollPosition(1, 0)).toBe(false) // Invalid
      expect(scrollLogic.isValidScrollPosition(-1, 0)).toBe(false) // Invalid
    })
  })

  describe('calculateMaxScrollY', () => {
    it('should calculate correct max scroll for scrollable content', () => {
      expect(scrollLogic.calculateMaxScrollY(1200, 800)).toBe(400) // 1200 - 800
      expect(scrollLogic.calculateMaxScrollY(2000, 600)).toBe(1400) // 2000 - 600
      expect(scrollLogic.calculateMaxScrollY(1500, 1000)).toBe(500) // 1500 - 1000
    })

    it('should return 0 when content is shorter than viewport', () => {
      expect(scrollLogic.calculateMaxScrollY(600, 800)).toBe(0) // 600 < 800
      expect(scrollLogic.calculateMaxScrollY(500, 1000)).toBe(0) // 500 < 1000
      expect(scrollLogic.calculateMaxScrollY(800, 800)).toBe(0) // Equal heights
    })

    it('should handle zero values', () => {
      expect(scrollLogic.calculateMaxScrollY(0, 800)).toBe(0)
      expect(scrollLogic.calculateMaxScrollY(800, 0)).toBe(800)
      expect(scrollLogic.calculateMaxScrollY(0, 0)).toBe(0)
    })

    it('should handle negative values gracefully', () => {
      // Math.max ensures we never return negative values
      expect(scrollLogic.calculateMaxScrollY(-100, 800)).toBe(0)
      expect(scrollLogic.calculateMaxScrollY(800, -100)).toBe(800)
    })
  })

  describe('isScrollable', () => {
    it('should return true when document is taller than viewport', () => {
      expect(scrollLogic.isScrollable(1200, 800)).toBe(true) // 1200 > 800
      expect(scrollLogic.isScrollable(2000, 600)).toBe(true) // 2000 > 600
      expect(scrollLogic.isScrollable(801, 800)).toBe(true) // 801 > 800
    })

    it('should return false when document is shorter than or equal to viewport', () => {
      expect(scrollLogic.isScrollable(600, 800)).toBe(false) // 600 < 800
      expect(scrollLogic.isScrollable(800, 800)).toBe(false) // Equal
      expect(scrollLogic.isScrollable(500, 1000)).toBe(false) // 500 < 1000
    })

    it('should handle zero values', () => {
      expect(scrollLogic.isScrollable(0, 800)).toBe(false)
      expect(scrollLogic.isScrollable(800, 0)).toBe(true)
      expect(scrollLogic.isScrollable(0, 0)).toBe(false)
    })
  })

  describe('real-world scenarios', () => {
    it('should handle typical mobile viewport', () => {
      const documentHeight = 2400
      const windowHeight = 800
      const maxScrollY = scrollLogic.calculateMaxScrollY(documentHeight, windowHeight)

      expect(maxScrollY).toBe(1600)
      expect(scrollLogic.isScrollable(documentHeight, windowHeight)).toBe(true)
      expect(scrollLogic.isValidScrollPosition(0, maxScrollY)).toBe(true)
      expect(scrollLogic.isValidScrollPosition(800, maxScrollY)).toBe(true)
      expect(scrollLogic.isValidScrollPosition(1600, maxScrollY)).toBe(true)
      expect(scrollLogic.isValidScrollPosition(1700, maxScrollY)).toBe(false) // Overscroll
      expect(scrollLogic.isValidScrollPosition(-50, maxScrollY)).toBe(false) // Top overscroll
    })

    it('should handle short page scenario', () => {
      const documentHeight = 600
      const windowHeight = 800
      const maxScrollY = scrollLogic.calculateMaxScrollY(documentHeight, windowHeight)

      expect(maxScrollY).toBe(0)
      expect(scrollLogic.isScrollable(documentHeight, windowHeight)).toBe(false)
      expect(scrollLogic.isValidScrollPosition(0, maxScrollY)).toBe(true)
      expect(scrollLogic.isValidScrollPosition(100, maxScrollY)).toBe(false) // Any scroll is invalid
    })

    it('should handle overscroll bounce scenarios', () => {
      const documentHeight = 1200
      const windowHeight = 800
      const maxScrollY = scrollLogic.calculateMaxScrollY(documentHeight, windowHeight) // 400

      // iOS bounce at top
      expect(scrollLogic.isValidScrollPosition(-30, maxScrollY)).toBe(false)
      expect(scrollLogic.isValidScrollPosition(-100, maxScrollY)).toBe(false)

      // Android overscroll at bottom
      expect(scrollLogic.isValidScrollPosition(450, maxScrollY)).toBe(false)
      expect(scrollLogic.isValidScrollPosition(600, maxScrollY)).toBe(false)

      // Valid positions
      expect(scrollLogic.isValidScrollPosition(0, maxScrollY)).toBe(true)
      expect(scrollLogic.isValidScrollPosition(200, maxScrollY)).toBe(true)
      expect(scrollLogic.isValidScrollPosition(400, maxScrollY)).toBe(true)
    })

    it('should handle scroll direction with different thresholds', () => {
      // Conservative threshold (20px)
      expect(scrollLogic.shouldShowHeader(120, 100, 20)).toBe(false) // 20px down = hide
      expect(scrollLogic.shouldShowHeader(119, 100, 20)).toBe(null) // 19px down = no change
      expect(scrollLogic.shouldShowHeader(80, 100, 20)).toBe(true) // 20px up = show
      expect(scrollLogic.shouldShowHeader(81, 100, 20)).toBe(null) // 19px up = no change

      // Sensitive threshold (5px)
      expect(scrollLogic.shouldShowHeader(106, 100, 5)).toBe(false) // 6px down = hide
      expect(scrollLogic.shouldShowHeader(104, 100, 5)).toBe(null) // 4px down = no change
      expect(scrollLogic.shouldShowHeader(94, 100, 5)).toBe(true) // 6px up = show
      expect(scrollLogic.shouldShowHeader(96, 100, 5)).toBe(null) // 4px up = no change
    })
  })
})
