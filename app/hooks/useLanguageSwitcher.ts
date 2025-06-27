import { useSettingsStore } from '~/stores/useSettingsStore'

type UseLanguageSwitcherReturn = {
  switchLanguage: (langCode: string) => void
  currentLanguage: string
}

/**
 * Hook for switching languages in the application.
 * Updates the theme store which acts as the single source of truth.
 * The store handles cookie and localStorage persistence automatically.
 * The i18n instance will be updated automatically when the store changes.
 */
export function useLanguageSwitcher(): UseLanguageSwitcherReturn {
  const { language: storeLanguage, setLanguage } = useSettingsStore()

  const switchLanguage = (langCode: string) => {
    // Only update store - i18n will follow automatically
    setLanguage(langCode as 'nl' | 'en' | 'ar' | 'tr')
  }

  return {
    switchLanguage,
    currentLanguage: storeLanguage,
  }
}
