import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'

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
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage =
    languages.find(lang => lang.code === i18n.language) ||
    languages.find(lang => lang.code === i18n.options.fallbackLng) ||
    languages[0]

  return (
    <Menu as='div' className='relative'>
      <MenuButton
        className='flex items-center text-emerald-100 hover:text-white'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className='text-lg'>{currentLanguage.flag}</span>
      </MenuButton>

      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <MenuItems className='ring-opacity-5 absolute right-0 mt-2 w-36 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none'>
          {languages.map(language => (
            <MenuItem key={language.code}>
              {({ active }: { active: boolean }) => (
                <button
                  className={`${
                    active ? 'bg-emerald-50' : ''
                  } flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700`}
                  onClick={() => {
                    i18n.changeLanguage(language.code)
                    setIsOpen(false)
                  }}
                >
                  <span className='text-lg'>{language.flag}</span>
                  <span>{language.name}</span>
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  )
}
