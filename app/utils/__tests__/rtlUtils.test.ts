import { describe, expect, test } from 'vitest'

import {
  getDirection,
  getSwipeRowConfig,
  isRTL,
  type SwipeRowConfig,
} from '../rtlUtils'

describe('isRTL', () => {
  test('returns true for Arabic language code', () => {
    expect(isRTL('ar')).toBe(true)
  })

  test('returns false for LTR language codes', () => {
    expect(isRTL('en')).toBe(false)
    expect(isRTL('fr')).toBe(false)
    expect(isRTL('de')).toBe(false)
    expect(isRTL('nl')).toBe(false)
    expect(isRTL('tr')).toBe(false)
  })

  test('returns false for empty or invalid codes', () => {
    expect(isRTL('')).toBe(false)
    expect(isRTL('invalid')).toBe(false)
  })
})

describe('getDirection', () => {
  test('returns "rtl" for Arabic', () => {
    expect(getDirection('ar')).toBe('rtl')
  })

  test('returns "ltr" for LTR languages', () => {
    expect(getDirection('en')).toBe('ltr')
    expect(getDirection('fr')).toBe('ltr')
    expect(getDirection('de')).toBe('ltr')
    expect(getDirection('nl')).toBe('ltr')
    expect(getDirection('tr')).toBe('ltr')
  })

  test('returns "ltr" for unknown language codes', () => {
    expect(getDirection('')).toBe('ltr')
    expect(getDirection('unknown')).toBe('ltr')
  })
})

describe('getSwipeRowConfig', () => {
  test('returns correct type structure', () => {
    const config: SwipeRowConfig = getSwipeRowConfig('en')
    expect(config).toHaveProperty('directionMultiplier')
    expect(typeof config.directionMultiplier).toBe('number')
  })

  test('returns directionMultiplier of 1 for LTR languages', () => {
    expect(getSwipeRowConfig('en').directionMultiplier).toBe(1)
    expect(getSwipeRowConfig('fr').directionMultiplier).toBe(1)
    expect(getSwipeRowConfig('de').directionMultiplier).toBe(1)
    expect(getSwipeRowConfig('nl').directionMultiplier).toBe(1)
    expect(getSwipeRowConfig('tr').directionMultiplier).toBe(1)
  })

  test('returns directionMultiplier of -1 for RTL languages', () => {
    expect(getSwipeRowConfig('ar').directionMultiplier).toBe(-1)
  })

  test('handles empty or invalid language codes as LTR', () => {
    expect(getSwipeRowConfig('').directionMultiplier).toBe(1)
    expect(getSwipeRowConfig('invalid').directionMultiplier).toBe(1)
  })

  describe('directionMultiplier usage scenarios', () => {
    test('LTR: negative deltaX results in negative after multiplication', () => {
      const { directionMultiplier } = getSwipeRowConfig('en')
      const deltaX = -100 // User swiped left
      expect(deltaX * directionMultiplier).toBe(-100) // Still negative (left)
    })

    test('RTL: positive deltaX results in negative after multiplication', () => {
      const { directionMultiplier } = getSwipeRowConfig('ar')
      const deltaX = 100 // User swiped right
      expect(deltaX * directionMultiplier).toBe(-100) // Becomes negative (interpreted as left swipe)
    })

    test('LTR: transform calculation moves content left', () => {
      const { directionMultiplier } = getSwipeRowConfig('en')
      const swipeStateX = -400 // Content at swipe position
      const transform = swipeStateX * directionMultiplier
      expect(transform).toBe(-400) // translateX(-400px) moves content left
    })

    test('RTL: transform calculation moves content right', () => {
      const { directionMultiplier } = getSwipeRowConfig('ar')
      const swipeStateX = -400 // Content at swipe position
      const transform = swipeStateX * directionMultiplier
      expect(transform).toBe(400) // translateX(400px) moves content right
    })
  })
})
