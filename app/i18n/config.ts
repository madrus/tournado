/* eslint-disable import/no-named-as-default-member */
import { initReactI18next } from 'react-i18next'

// Import only what we need
import i18next from 'i18next'

// Import your translation files
import en from './locales/en.json'
import nl from './locales/nl.json'
import test from './locales/test.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    [defaultNS]: en,
  },
  nl: {
    [defaultNS]: nl,
  },
  test: {
    [defaultNS]: test,
  },
} as const

// Detect unit test environment (Jest/Vitest) vs Playwright test environment
const isUnitTestEnvironment = (): boolean => {
  // Server-side unit test detection
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'test' && !process.env.PLAYWRIGHT
  }
  return false
}

const isPlaywrightTestEnvironment = (): boolean => {
  // Server-side Playwright test detection
  if (typeof window === 'undefined') {
    // Check environment variables that Playwright might set
    if (process.env.PLAYWRIGHT === 'true') return true
    return false
  }

  return false
}

// Simple language detection that prevents HMR interference in development
const getLanguage = (): string => {
  const isUnitTest = isUnitTestEnvironment()
  const isPlaywrightTest = isPlaywrightTestEnvironment()

  // For unit tests, use test language
  if (isUnitTest) {
    return 'test'
  }

  // For Playwright tests, lock to Dutch to prevent language switching
  if (isPlaywrightTest) {
    return 'nl'
  }

  // For development and production, default to Dutch
  // This prevents HMR interference while maintaining functionality
  return 'nl'
}

// Initialize with determined language
const language = getLanguage()
const isUnitTest = isUnitTestEnvironment()

// Create i18n instance
const i18n = i18next.use(initReactI18next)

// Initialize synchronously with initial language
i18n.init({
  resources,
  defaultNS,
  fallbackLng: isUnitTest ? 'test' : 'nl',
  lng: language,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  // Force synchronous initialization to prevent async language switching
  initImmediate: false,
})

// Prevent language changes during Playwright tests to avoid elements being marked as "hidden"
if (isPlaywrightTestEnvironment()) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  i18n.changeLanguage = (_newLanguage?: string, callbackFn?: any) => {
    // Block language changes during Playwright tests
    if (callbackFn) callbackFn(null, i18n.t)
    return Promise.resolve(i18n.t)
  }
}

export default i18n
