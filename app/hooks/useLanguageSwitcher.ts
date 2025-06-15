import { useTranslation } from 'react-i18next'

type UseLanguageSwitcherReturn = {
  switchLanguage: (langCode: string) => void
  currentLanguage: string
}

/**
 * Hook for switching languages in the application.
 * Only triggers i18n language change - persistence (localStorage + cookie)
 * is handled automatically by root.tsx when language changes.
 */
export function useLanguageSwitcher(): UseLanguageSwitcherReturn {
  const { i18n } = useTranslation()

  const switchLanguage = (langCode: string) => {
    // Only trigger i18n change - root.tsx will handle persistence
    i18n.changeLanguage(langCode)
  }

  return {
    switchLanguage,
    currentLanguage: i18n.language,
  }
}
