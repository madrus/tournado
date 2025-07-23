import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSettingsStore } from '../useSettingsStore'

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
    state().resetStoreState()

    // Clear document.cookie
    document.cookie = ''

    // Clear localStorage
    localStorage.clear()

    // Clear mocks
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    expect(state().theme).toBe('light')
    expect(state().language).toBe('nl')
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

  it('should persist theme to localStorage', () => {
    state().setTheme('dark')

    // Get the persisted data from localStorage
    const persistedDataString = localStorage.getItem('settings-storage')
    expect(persistedDataString).not.toBeNull()

    if (persistedDataString) {
      const persistedData = JSON.parse(persistedDataString)

      // Zustand persist middleware wraps the state in a 'state' key and adds a version
      expect(persistedData).toHaveProperty('state')
      expect(persistedData).toHaveProperty('version')

      // Check that the persisted state contains the expected values
      expect(persistedData.state.theme).toBe('dark')
    }
  })

  it('should persist language to localStorage', () => {
    state().setLanguage('en')

    // Get the persisted data from localStorage
    const persistedDataString = localStorage.getItem('settings-storage')
    expect(persistedDataString).not.toBeNull()

    if (persistedDataString) {
      const persistedData = JSON.parse(persistedDataString)

      // Check that the persisted state contains the expected values
      expect(persistedData.state.language).toBe('en')
    }
  })

  it('should persist both theme and language changes', () => {
    state().setTheme('dark')
    state().setLanguage('tr')

    // Get the persisted data from localStorage
    const persistedDataString = localStorage.getItem('settings-storage')
    expect(persistedDataString).not.toBeNull()

    if (persistedDataString) {
      const persistedData = JSON.parse(persistedDataString)

      expect(persistedData.state.theme).toBe('dark')
      expect(persistedData.state.language).toBe('tr')
    }
  })

  it('should reset store state to initial values', () => {
    // Change from defaults
    state().setTheme('dark')
    state().setLanguage('en')

    expect(state().theme).toBe('dark')
    expect(state().language).toBe('en')

    // Reset
    state().resetStoreState()

    expect(state().theme).toBe('light')
    expect(state().language).toBe('nl')
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
