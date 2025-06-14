import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { useRTLLanguageSwitcher } from '~/utils/rtlUtils'

const languages = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
]

export function LanguageSwitcher(): JSX.Element {
  const { i18n } = useTranslation()
  const { classes } = useRTLLanguageSwitcher()

  return (
    <div className={`relative inline-block ${classes.container}`}>
      <select
        value={i18n.language}
        onChange={event => {
          const lang = event.target.value
          localStorage.setItem('lang', lang)
          i18n.changeLanguage(lang)
        }}
        className={`cursor-pointer appearance-none bg-transparent py-1 text-white focus:outline-none ${classes.select}`}
        aria-label='Select language'
      >
        {languages.map(lang => (
          <option
            key={lang.code}
            value={lang.code}
            className='bg-emerald-800 text-white'
          >
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div
        className={`pointer-events-none absolute top-0 flex h-full items-center ${classes.arrow}`}
      >
        <svg
          className='h-4 w-4 text-white'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </div>
    </div>
  )
}
