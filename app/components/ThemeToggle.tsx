import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { useThemeStore } from '~/stores/useThemeStore'
import { renderIcon } from '~/utils/iconUtils'

export function ThemeToggle(): JSX.Element {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      type='button'
      onClick={toggleTheme}
      className='flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:hover:bg-gray-800 dark:focus:ring-offset-gray-800'
      aria-label={t('common.toggleTheme')}
      title={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
    >
      {theme === 'light' ? renderIcon('dark_mode') : renderIcon('light_mode')}
    </button>
  )
}
