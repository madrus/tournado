import { JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigation } from 'react-router'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { IconName, renderIcon } from '~/utils/iconUtils'

export type MenuItemType = {
  label: string
  icon?: IconName
  href?: string
  todo?: boolean
  action?: JSX.Element
  customIcon?: string
  authenticated?: boolean
  divider?: boolean
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
  const navigation = useNavigation()

  // Use translated guest name when user is not authenticated or username is empty
  const displayName = authenticated && username ? username : t('common.guest')

  // Debug logging
  if (!isMobile) {
    // Debug logs removed - desktop menu working correctly
  }

  // Close menu when navigation starts (Fix #1) - but only for actual navigation
  useEffect(() => {
    if (navigation.state === 'loading' && navigation.location) {
      onOpenChange?.(false)
      setLanguageMenuOpen(false)
      setActiveSubmenu(null)
    }
  }, [navigation.state, navigation.location, onOpenChange])

  // Handler for clicking language menu toggle
  const handleLanguageToggle = (event: React.MouseEvent, index: number) => {
    event.stopPropagation()
    setActiveSubmenu(activeSubmenu === index ? null : index)
    setLanguageMenuOpen(!languageMenuOpen)
  }

  // For mobile view
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-30 ${isOpen ? 'flex' : 'hidden'} items-start justify-center bg-black/60 pt-16 backdrop-blur-sm`}
        onClick={() => onOpenChange?.(false)}
        data-testid='mobile-user-menu-overlay'
        aria-label='Mobile user menu'
        role='dialog'
        aria-modal='true'
      >
        <div
          className='w-[95%] max-w-md overflow-visible rounded-lg bg-white shadow-xl'
          onClick={event => event.stopPropagation()}
        >
          <div className='border-b border-gray-200 px-3 py-3'>
            <div className='px-3'>
              <p className='text-emerald-800'>
                {authenticated ? t('common.signedInAs') : t('common.welcome')}{' '}
                <span className='truncate text-emerald-800'>{displayName}</span>
              </p>
            </div>
          </div>
          <div className='py-2'>
            {menuItems.map((item, index) => (
              <div key={index} className='block px-3 py-0'>
                {item.divider ? (
                  <hr className='mx-0 my-2 border-gray-200' />
                ) : (item.customIcon || item.icon) && item.subMenu ? (
                  <div className='relative'>
                    <button
                      className='flex w-full content-start items-center px-3 py-2 text-emerald-800 hover:bg-gray-100'
                      onClick={event => handleLanguageToggle(event, index)}
                    >
                      <span className='flex w-8 items-center justify-start pl-0 text-left'>
                        {item.customIcon ? (
                          <span className='text-lg'>{item.customIcon}</span>
                        ) : item.icon ? (
                          renderIcon(item.icon, { className: 'w-5 h-5' })
                        ) : null}
                      </span>
                      <span>{item.label}</span>
                    </button>

                    {activeSubmenu === index ? (
                      <div className='ring-opacity-5 absolute top-full left-0 z-30 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black'>
                        {item.subMenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className={`flex w-full content-start items-center px-3 py-1 text-sm ${
                              subItem.active
                                ? 'bg-gray-100 text-emerald-700'
                                : 'text-emerald-800 hover:bg-gray-50'
                            }`}
                            onClick={event => {
                              event.stopPropagation()
                              subItem.onClick()
                              setActiveSubmenu(null)
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
                    className='flex content-start items-center px-3 py-2 text-emerald-800 hover:bg-gray-100'
                  >
                    <span className='flex w-8 items-center justify-start pl-0 text-left'>
                      {item.icon
                        ? renderIcon(item.icon, { className: 'w-5 h-5' })
                        : null}
                    </span>
                    <span>{item.label}</span>
                    {item.todo ? (
                      <span className='ml-2 text-xs text-emerald-600'>(TODO)</span>
                    ) : null}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Desktop view with Radix UI dropdown
  return (
    <div className='relative inline-block text-left'>
      <DropdownMenu.Root open={isOpen} onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger asChild>
          <button className='inline-flex content-start items-center text-white hover:text-emerald-100 focus:outline-none'>
            {/* Show subtle three-dot menu - unobtrusive for public users */}
            {renderIcon('more_vert', { className: 'hidden md:block' })}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className='ring-opacity-5 absolute right-0 z-40 mt-2 w-56 divide-y divide-gray-100 rounded-md bg-white p-1 shadow-lg ring-1 ring-black focus:outline-none'
          sideOffset={5}
        >
          <div className='px-4 py-3'>
            <p className='text-emerald-800'>
              {authenticated ? t('common.signedInAs') : t('common.welcome')}{' '}
              <span className='truncate text-emerald-800'>{displayName}</span>
            </p>
          </div>
          <div className='py-1'>
            {menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <DropdownMenu.Separator
                    key={index}
                    className='mx-1 my-1 h-px bg-gray-200'
                  />
                )
              }

              if ((item.customIcon || item.icon) && item.subMenu) {
                // This is the language menu
                return (
                  <div key={index} className='relative'>
                    <button
                      className='flex w-full content-start items-center px-3 py-2 text-emerald-800 hover:bg-gray-100 focus:outline-none'
                      onClick={event => handleLanguageToggle(event, index)}
                    >
                      <span className='flex w-8 items-center justify-start pl-0 text-left'>
                        {item.customIcon ? (
                          <span className='text-lg'>{item.customIcon}</span>
                        ) : item.icon ? (
                          renderIcon(item.icon, { className: 'w-5 h-5' })
                        ) : null}
                      </span>
                      <span>{item.label}</span>
                    </button>

                    {languageMenuOpen ? (
                      <div className='ring-opacity-5 absolute right-0 z-30 mt-1 min-w-[8rem] rounded-md bg-white p-1 shadow-lg ring-1 ring-black'>
                        {item.subMenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className={`flex w-full content-start items-center px-3 py-1 text-sm ${
                              subItem.active
                                ? 'bg-gray-100 text-emerald-700'
                                : 'text-emerald-800 hover:bg-gray-50'
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
                    className='flex content-start items-center px-3 py-2 text-emerald-800 hover:bg-gray-100'
                  >
                    <span className='flex w-8 items-center justify-start pl-0 text-left'>
                      {item.icon
                        ? renderIcon(item.icon, { className: 'w-5 h-5' })
                        : null}
                    </span>
                    <span>{item.label}</span>
                    {item.todo ? (
                      <span className='ml-2 text-xs text-emerald-600'>(TODO)</span>
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
