import { initReactI18next } from 'react-i18next'

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import your translation files
import en from './locales/en.json'
import nl from './locales/nl.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    [defaultNS]: en,
  },
  nl: {
    [defaultNS]: nl,
  },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'nl',
    lng: 'nl',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n
