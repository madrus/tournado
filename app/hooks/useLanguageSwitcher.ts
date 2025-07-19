import { Language } from '~/i18n/config'
import { useSettingsStore } from '~/stores/useSettingsStore'

type UseLanguageSwitcherReturn = {
  switchLanguage: (langCode: Language) => void
  currentLanguage: Language
}

/**
 * Hook for switching languages in the application.
 * Updates the theme store which acts as the single source of truth.
 * The store handles cookie and localStorage persistence automatically.
 * The i18n instance will be updated automatically when the store changes.
 */
export function useLanguageSwitcher(): UseLanguageSwitcherReturn {
  const { language: storeLanguage, setLanguage } = useSettingsStore()

  const switchLanguage = (langCode: Language) => {
    // Only update store - i18n will follow automatically
    setLanguage(langCode)
  }

  return {
    switchLanguage,
    currentLanguage: storeLanguage,
  }
}
