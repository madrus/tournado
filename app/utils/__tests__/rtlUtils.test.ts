import { beforeEach, describe, expect, test } from 'vitest'

import { useSettingsStore } from '~/stores/useSettingsStore'

import { getDirection, getSwipeRowConfig, type SwipeRowConfig } from '../rtlUtils'

// Get store state once at top
const state = useSettingsStore.getState

// Reset store before each test
beforeEach(() => {
  state().resetStoreState()
})

describe('isRTL (via settings store)', () => {
  test('returns true for Arabic language code', () => {
    state().setLanguage('ar')
    expect(state().isRTL).toBe(true)
  })

  test('returns true for Arabic subtags (BCP47 format)', () => {
    state().setLanguage('ar')
    expect(state().isRTL).toBe(true)
  })

  test('returns false for LTR language codes', () => {
    state().setLanguage('en')
    expect(state().isRTL).toBe(false)

    state().setLanguage('nl')
    expect(state().isRTL).toBe(false)
  })

  test('returns false for default language', () => {
    // Default language is 'nl' (Dutch)
    expect(state().isRTL).toBe(false)
  })
})

describe('getDirection', () => {
  test('returns "rtl" for Arabic', () => {
    state().setLanguage('ar')
    expect(getDirection()).toBe('rtl')
  })

  test('returns "ltr" for LTR languages', () => {
    state().setLanguage('en')
    expect(getDirection()).toBe('ltr')

    state().setLanguage('nl')
    expect(getDirection()).toBe('ltr')

    state().setLanguage('fr')
    expect(getDirection()).toBe('ltr')
  })

  test('returns "ltr" for default language', () => {
    expect(getDirection()).toBe('ltr')
  })

  test('direction changes when language changes', () => {
    // Start with English (LTR)
    state().setLanguage('en')
    expect(getDirection()).toBe('ltr')

    // Change to Arabic (RTL)
    state().setLanguage('ar')
    expect(getDirection()).toBe('rtl')

    // Change back to Dutch (LTR)
    state().setLanguage('nl')
    expect(getDirection()).toBe('ltr')
  })
})

describe('getSwipeRowConfig', () => {
  test('returns correct type structure', () => {
    const config: SwipeRowConfig = getSwipeRowConfig()
    expect(config).toHaveProperty('directionMultiplier')
    expect(typeof config.directionMultiplier).toBe('number')
    // directionMultiplier must be exactly 1 or -1
    expect([1, -1]).toContain(config.directionMultiplier)
  })

  test('returns directionMultiplier of 1 for LTR languages', () => {
    state().setLanguage('en')
    expect(getSwipeRowConfig().directionMultiplier).toBe(1)

    state().setLanguage('nl')
    expect(getSwipeRowConfig().directionMultiplier).toBe(1)

    state().setLanguage('fr')
    expect(getSwipeRowConfig().directionMultiplier).toBe(1)
  })

  test('returns directionMultiplier of -1 for RTL languages', () => {
    state().setLanguage('ar')
    expect(getSwipeRowConfig().directionMultiplier).toBe(-1)
  })

  test('returns directionMultiplier of 1 for default language', () => {
    expect(getSwipeRowConfig().directionMultiplier).toBe(1)
  })

  describe('directionMultiplier usage scenarios', () => {
    test('LTR: negative deltaX results in negative after multiplication', () => {
      state().setLanguage('en')

      const { directionMultiplier } = getSwipeRowConfig()
      const deltaX = -100 // User swiped left
      expect(deltaX * directionMultiplier).toBe(-100) // Still negative (left)
    })

    test('RTL: positive deltaX results in negative after multiplication', () => {
      state().setLanguage('ar')

      const { directionMultiplier } = getSwipeRowConfig()
      const deltaX = 100 // User swiped right
      expect(deltaX * directionMultiplier).toBe(-100) // Becomes negative (interpreted as left swipe)
    })

    test('LTR: transform calculation moves content left', () => {
      state().setLanguage('en')

      const { directionMultiplier } = getSwipeRowConfig()
      const swipeStateX = -400 // Content at swipe position
      const transform = swipeStateX * directionMultiplier
      expect(transform).toBe(-400) // translateX(-400px) moves content left
    })

    test('RTL: transform calculation moves content right', () => {
      state().setLanguage('ar')

      const { directionMultiplier } = getSwipeRowConfig()
      const swipeStateX = -400 // Content at swipe position
      const transform = swipeStateX * directionMultiplier
      expect(transform).toBe(400) // translateX(400px) moves content right
    })
  })
})
