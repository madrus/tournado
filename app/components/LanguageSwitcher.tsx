import { useTranslation } from 'react-i18next'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

export function LanguageSwitcher(): JSX.Element {
  const { i18n } = useTranslation()

  const currentLanguage =
    languages.find(lang => lang.code === i18n.language) ||
    languages.find(lang => lang.code === i18n.options.fallbackLng) ||
    languages[0]

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
  }

  return (
    <div className='flex flex-col space-y-1'>
      {languages.map(language => (
        <button
          key={language.code}
          className={`flex w-full content-start items-center py-1 ${
            language.code === currentLanguage.code
              ? 'bg-gray-100 font-semibold text-emerald-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleLanguageChange(language.code)}
        >
          <span className='w-8 pl-0 text-left text-lg'>{language.flag}</span>
          <span>{language.name}</span>
        </button>
      ))}
    </div>
  )
}
