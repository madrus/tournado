/* eslint-disable import/no-named-as-default-member */
import { initReactI18next } from 'react-i18next'

import i18next, { i18n as I18nType } from 'i18next'

// Import your translation files
import ar from './locales/ar.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import nl from './locales/nl.json'
import tr from './locales/tr.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    [defaultNS]: en,
  },
  nl: {
    [defaultNS]: nl,
  },
  ar: {
    [defaultNS]: ar,
  },
  tr: {
    [defaultNS]: tr,
  },
  fr: {
    [defaultNS]: fr,
  },
} as const

export const SUPPORTED_LANGUAGES = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]['code']

/**
 * Initializes and returns an i18n instance with the given language.
 * @param language The language code to initialize i18n with.
 */
export function initI18n(language: string): I18nType {
  const instance = i18next.createInstance()
  instance.use(initReactI18next)
  instance.init({
    compatibilityJSON: 'v4',
    resources,
    defaultNS,
    fallbackLng: 'nl',
    lng: language,
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false, // Synchronous
  })
  return instance
}

// At the bottom of the file
export const i18n = initI18n('nl') // Default to Dutch (fallback language)
export default i18n
