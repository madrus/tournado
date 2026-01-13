import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingsStore } from '../useSettingsStore'
import { setCookie } from '../utils'

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

// Helper to access store state
const state = useSettingsStore.getState

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    state().resetSettingsStoreState()

    // Clear cookies
    setCookie('theme', '')
    setCookie('lang', '')

    // Clear localStorage
    localStorage.clear()

    // Clear mocks
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    expect(state().theme).toBe('light')
    expect(state().language).toBe('nl')
    expect(state().isRTL).toBe(false)
  })

  it('should set theme', () => {
    state().setTheme('dark')

    expect(state().theme).toBe('dark')
  })

  it('should toggle theme from light to dark', () => {
    // Initially light
    expect(state().theme).toBe('light')

    state().toggleTheme()

    expect(state().theme).toBe('dark')
  })

  it('should toggle theme from dark to light', () => {
    // Set to dark first
    state().setTheme('dark')
    expect(state().theme).toBe('dark')

    state().toggleTheme()

    expect(state().theme).toBe('light')
  })

  it('should set language', () => {
    state().setLanguage('en')

    expect(state().language).toBe('en')
    expect(state().isRTL).toBe(false)
  })

  it('should set RTL when language is Arabic', () => {
    state().setLanguage('ar')

    expect(state().language).toBe('ar')
    expect(state().isRTL).toBe(true)
  })

  it('should reset RTL when switching from Arabic to LTR language', () => {
    state().setLanguage('ar')
    expect(state().isRTL).toBe(true)

    state().setLanguage('en')
    expect(state().isRTL).toBe(false)
  })

  it('should set all supported languages', () => {
    const languages: ('nl' | 'en' | 'ar' | 'tr' | 'fr')[] = [
      'nl',
      'en',
      'ar',
      'tr',
      'fr',
    ]

    languages.forEach(lang => {
      state().setLanguage(lang)
      expect(state().language).toBe(lang)
    })
  })

  it('should reset store state to initial values', () => {
    // Change from defaults
    state().setTheme('dark')
    state().setLanguage('en')

    expect(state().theme).toBe('dark')
    expect(state().language).toBe('en')
    expect(state().isRTL).toBe(false)

    // Reset
    state().resetSettingsStoreState()

    expect(state().theme).toBe('light')
    expect(state().language).toBe('nl')
    expect(state().isRTL).toBe(false)
  })

  it('should handle multiple theme changes', () => {
    expect(state().theme).toBe('light')

    state().setTheme('dark')
    expect(state().theme).toBe('dark')

    state().setTheme('light')
    expect(state().theme).toBe('light')

    state().toggleTheme()
    expect(state().theme).toBe('dark')

    state().toggleTheme()
    expect(state().theme).toBe('light')
  })

  it('should handle multiple language changes', () => {
    expect(state().language).toBe('nl')

    state().setLanguage('en')
    expect(state().language).toBe('en')

    state().setLanguage('ar')
    expect(state().language).toBe('ar')

    state().setLanguage('tr')
    expect(state().language).toBe('tr')

    state().setLanguage('nl')
    expect(state().language).toBe('nl')
  })
})
