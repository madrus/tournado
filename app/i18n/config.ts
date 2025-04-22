import { initReactI18next } from 'react-i18next'

import i18n from 'i18next'
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

const isTest = typeof window !== 'undefined' && window.Cypress

console.log('i18n config environment:', {
  isTest,
  language: isTest ? 'test' : 'nl',
})

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'nl',
    lng: isTest ? 'test' : 'nl', // Use test translations in test environment
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

// Force language in test environment
if (isTest) {
  i18n.changeLanguage('test')
}

export default i18n
