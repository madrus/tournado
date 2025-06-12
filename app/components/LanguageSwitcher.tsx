import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
]

export function LanguageSwitcher(): JSX.Element {
  const { i18n } = useTranslation()

  return (
    <div className='relative inline-block text-start'>
      <select
        value={i18n.language}
        onChange={event => i18n.changeLanguage(event.target.value)}
        className='cursor-pointer appearance-none bg-transparent py-1 ps-2 pe-8 text-white focus:outline-none'
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
      <div className='pointer-events-none absolute end-0 top-0 flex h-full items-center pe-2'>
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
