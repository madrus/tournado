import { initReactI18next } from 'react-i18next'

import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

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

// Use test translations in test environment
declare global {
  interface Window {
    Cypress?: boolean
  }
}

// Wait for window to be available
const isTest = typeof window !== 'undefined' ? window.Cypress : false

// Get initial language
const getInitialLanguage = () => {
  if (isTest) return 'test'
  if (typeof window !== 'undefined') {
    const storedLang = window.localStorage.getItem('i18nextLng')
    if (storedLang) return storedLang
  }
  return 'nl'
}

const initialLanguage = getInitialLanguage()

console.log('i18n config environment:', {
  isTest,
  language: initialLanguage,
})

const i18n = i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'nl',
    lng: initialLanguage,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation key: ${key} in ${ns} for ${lng}`)
      return key
    },
    missingInterpolationHandler: (str, match) => {
      console.warn(`Missing interpolation: ${match[1]} in ${str}`)
      return ''
    },
  })

// Force language in test environment
if (isTest) {
  i18next.changeLanguage('test')
}

export default i18next
