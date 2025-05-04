import { Link } from '@remix-run/react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

type MenuItemType = {
  label: string
  icon: string
  href?: string
  todo?: boolean
  action?: JSX.Element
  customIcon?: string
  subMenu?: Array<{
    label: string
    customIcon: string
    onClick: () => void
    active: boolean
  }>
}

// User menu dropdown component that works for both mobile and desktop
export function UserMenu({
  authenticated,
  username,
  menuItems,
  isMobile,
  isOpen,
  onOpenChange,
}: {
  authenticated: boolean
  username?: string
  menuItems: Array<MenuItemType>
  isMobile?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}): JSX.Element {
  const { t } = useTranslation()
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false)

  // Handler for clicking language menu toggle
  const handleLanguageToggle = (event: React.MouseEvent, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveSubmenu(activeSubmenu === index ? null : index)
    setLanguageMenuOpen(!languageMenuOpen)
  }

  // Not signed in state for desktop
  if (!authenticated && !isMobile) {
    return (
      <Link
        to='/signin'
        className='inline-flex content-start items-center text-white hover:text-emerald-100'
      >
        <span className='material-symbols-outlined w-6 pl-0 text-left'>person</span>
        <span>{t('auth.notSignedIn')}</span>
      </Link>
    )
  }

  // For mobile view
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-100 ${isOpen ? 'flex' : 'hidden'} items-start justify-center bg-black/60 pt-16 backdrop-blur-sm`}
        onClick={() => onOpenChange?.(false)}
      >
        <div
          className='w-[95%] max-w-md overflow-visible rounded-lg bg-white shadow-xl'
          onClick={event => event.stopPropagation()}
        >
          <div className='border-b border-gray-200 px-3 py-3'>
            <div className='px-3'>
              <p className='text-gray-500'>{t('common.signedInAs')}</p>
              <p className='truncate font-medium text-gray-900'>
                {authenticated ? username : t('auth.notSignedIn')}
              </p>
            </div>
          </div>
          <div className='py-2'>
            {menuItems
              .filter(
                item =>
                  authenticated ||
                  !(
                    item.href === '/profile' ||
                    item.href === '/settings' ||
                    item.label === t('auth.signin')
                  )
              )
              .map((item, index) => (
                <div key={index} className='block px-3 py-0'>
                  {item.customIcon && item.subMenu ? (
                    <div className='relative'>
                      <button
                        className='flex w-full content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={event => handleLanguageToggle(event, index)}
                      >
                        <span className='w-8 pl-0 text-left text-lg'>
                          {item.customIcon}
                        </span>
                        <span>{item.label}</span>
                      </button>

                      {activeSubmenu === index ? (
                        <div className='ring-opacity-5 absolute top-full left-0 z-50 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black'>
                          {item.subMenu.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              className={`flex w-full content-start items-center px-3 py-1 text-sm ${
                                subItem.active
                                  ? 'bg-gray-100 text-emerald-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              onClick={event => {
                                event.stopPropagation()
                                subItem.onClick()
                                setActiveSubmenu(null)
                                onOpenChange?.(false)
                              }}
                            >
                              <span className='w-8 pl-0 text-left text-lg'>
                                {subItem.customIcon}
                              </span>
                              <span>{subItem.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : item.action ? (
                    item.action
                  ) : (
                    <Link
                      to={item.href || '#'}
                      className='flex content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
                      onClick={() => onOpenChange?.(false)}
                    >
                      <span className='material-symbols-outlined w-8 pl-0 text-left'>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.todo ? (
                        <span className='ml-2 text-xs text-gray-500'>(TODO)</span>
                      ) : null}
                    </Link>
                  )}
                </div>
              ))}

            {/* Add sign in link if not authenticated */}
            {!authenticated ? (
              <div className='block px-3 py-2'>
                <Link
                  to='/signin'
                  className='flex content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
                  onClick={() => onOpenChange?.(false)}
                >
                  <span className='material-symbols-outlined w-8 pl-0 text-left'>
                    login
                  </span>
                  {t('auth.signin')}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  // Desktop view with Radix UI dropdown (no portal)
  return (
    <div className='relative inline-block text-left'>
      <DropdownMenu.Root open={isOpen} onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger asChild>
          <button className='inline-flex content-start items-center text-white hover:text-emerald-100 focus:outline-none'>
            <span className='hidden md:block'>{username}</span>
            <span className='material-symbols-outlined'>expand_more</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className='ring-opacity-5 absolute right-0 z-[9999] mt-2 w-56 divide-y divide-gray-100 rounded-md bg-white p-1 shadow-lg ring-1 ring-black focus:outline-none'
          sideOffset={5}
        >
          <div className='px-4 py-3'>
            <p className='text-gray-500'>{t('common.signedInAs')}</p>
            <p className='truncate font-medium text-gray-900'>{username}</p>
          </div>
          <div className='py-1'>
            {menuItems
              .filter(item => !(item.label === t('auth.signin')))
              .map((item, index) => {
                if (item.customIcon && item.subMenu) {
                  // This is the language menu
                  return (
                    <div key={index} className='relative'>
                      <button
                        className='flex w-full content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none'
                        onClick={event => handleLanguageToggle(event, index)}
                      >
                        <span className='w-8 pl-0 text-left text-lg'>
                          {item.customIcon}
                        </span>
                        <span>{item.label}</span>
                      </button>

                      {languageMenuOpen ? (
                        <div className='ring-opacity-5 absolute right-0 z-50 mt-1 min-w-[8rem] rounded-md bg-white p-1 shadow-lg ring-1 ring-black'>
                          {item.subMenu.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              className={`flex w-full content-start items-center px-3 py-1 text-sm ${
                                subItem.active
                                  ? 'bg-gray-100 text-emerald-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              } focus:outline-none`}
                              onClick={event => {
                                event.stopPropagation()
                                subItem.onClick()
                                setLanguageMenuOpen(false)
                              }}
                            >
                              <span className='w-8 pl-0 text-left text-lg'>
                                {subItem.customIcon}
                              </span>
                              <span>{subItem.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )
                }

                if (item.action) {
                  return (
                    <DropdownMenu.Item key={index} asChild>
                      <div>{item.action}</div>
                    </DropdownMenu.Item>
                  )
                }

                return (
                  <DropdownMenu.Item key={index} asChild>
                    <Link
                      to={item.href || '#'}
                      className='flex w-full content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
                    >
                      <span className='material-symbols-outlined w-8 pl-0 text-left'>
                        {item.icon}
                      </span>
                      {item.label}
                      {item.todo ? (
                        <span className='ml-2 text-xs text-gray-500'>(TODO)</span>
                      ) : null}
                    </Link>
                  </DropdownMenu.Item>
                )
              })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}
