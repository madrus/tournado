import { JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigation } from 'react-router'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { AnimatedHamburgerIcon } from '~/components/icons/AnimatedHamburgerIcon'
import { useRTLDropdown } from '~/hooks/useRTLDropdown'
import { IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { getLatinTextClass, getTypographyClass } from '~/utils/rtlUtils'

export type MenuItemType = {
  label: string
  icon?: IconName
  href?: string
  action?: JSX.Element
  customIcon?: string
  authenticated?: boolean
  divider?: boolean
  subMenu?: Array<{
    label: string
    customIcon: string
    onClick: () => void
    active: boolean
    className?: string
  }>
}

type UserMenuProps = {
  authenticated: boolean
  username?: string
  menuItems: Array<MenuItemType>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

// Unified user menu dropdown component using Radix UI for both mobile and desktop
export function UserMenu({
  authenticated,
  username,
  menuItems,
  isOpen,
  onOpenChange,
}: Readonly<UserMenuProps>): JSX.Element {
  const { t, i18n } = useTranslation()
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false)
  const navigation = useNavigation()

  // Get RTL-aware positioning using the hook
  const { dropdownProps, menuClasses, isRTL } = useRTLDropdown()

  // Use translated guest name when user is not authenticated or username is empty
  const displayName = authenticated && username ? username : t('common.guest')

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

  // Unified Radix UI dropdown for both mobile and desktop
  return (
    <div className='relative inline-block text-left'>
      <DropdownMenu.Root open={isOpen} onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger asChild>
          <button
            className='text-primary-foreground relative inline-flex h-8 w-8 translate-y-0.25 items-center justify-center focus:outline-none'
            aria-label='Toggle menu'
          >
            <AnimatedHamburgerIcon
              isOpen={!!isOpen}
              isRTL={isRTL}
              className='h-8 w-8'
            />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          data-testid='user-menu-dropdown'
          className={cn(
            // basic container
            'bg-background z-40 w-max rounded-md p-1 shadow-lg focus:outline-none',
            // border colors
            'border border-red-500 dark:border-emerald-500',
            // responsive sizing / spacing
            'mx-4 max-w-[calc(100vw-2rem)] sm:max-w-80',
            // RTL margin helpers
            menuClasses.spacing
          )}
          align={dropdownProps.align}
          side={dropdownProps.side}
          sideOffset={dropdownProps.sideOffset}
          alignOffset={dropdownProps.alignOffset}
          avoidCollisions={dropdownProps.avoidCollisions}
        >
          <div className='px-4 py-3'>
            {authenticated ? (
              <div className={cn('text-foreground-darker', menuClasses.textContainer)}>
                <p className={`break-words ${getTypographyClass(i18n.language)}`}>
                  {t('common.signedInAs')}
                </p>
                <p
                  className={cn(
                    'text-foreground-darker font-medium break-words',
                    getLatinTextClass(i18n.language)
                  )}
                >
                  {displayName}
                </p>
              </div>
            ) : (
              <p
                className={cn(
                  'text-foreground-darker break-words',
                  menuClasses.textContainer,
                  getTypographyClass(i18n.language)
                )}
              >
                {t('common.welcome')}{' '}
                <span
                  className={cn(
                    'text-foreground-darker font-medium',
                    getLatinTextClass(i18n.language)
                  )}
                >
                  {displayName}
                </span>
              </p>
            )}
          </div>
          <div className='h-px bg-red-500 dark:bg-emerald-500'></div>
          <div className='py-1'>
            {menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <DropdownMenu.Separator
                    key={index}
                    className='my-1 h-px bg-red-500 dark:bg-emerald-500'
                  />
                )
              }

              if ((item.customIcon || item.icon) && item.subMenu) {
                // This is the language menu
                return (
                  <div key={index} className='relative'>
                    <button
                      className={cn(
                        'text-foreground-darker hover:bg-accent w-full items-center px-3 py-2 leading-normal focus:outline-none',
                        menuClasses.menuItem
                      )}
                      onClick={event => handleLanguageToggle(event, index)}
                    >
                      <span className={menuClasses.iconContainer}>
                        {item.customIcon ? (
                          <span className='text-lg'>{item.customIcon}</span>
                        ) : item.icon ? (
                          renderIcon(item.icon, { className: 'w-5 h-5' })
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          menuClasses.textContainer,
                          getTypographyClass(i18n.language)
                        )}
                      >
                        {item.label}
                      </span>
                    </button>

                    {languageMenuOpen ? (
                      <div
                        className={cn(
                          'ring-opacity-5 bg-background ring-border absolute z-30 mt-1 min-w-[8rem] rounded-md p-1 text-base shadow-lg ring-1',
                          // Position submenu to the left of the language menu icon (mirrored for Arabic)
                          isRTL ? '-end-16' : '-start-16'
                        )}
                      >
                        {item.subMenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className={cn(
                              'w-full items-center px-3 py-2 leading-normal focus:outline-none',
                              subItem.active
                                ? 'bg-accent text-foreground-darker'
                                : 'text-foreground-darker hover:bg-accent',
                              menuClasses.menuItem
                            )}
                            onClick={event => {
                              event.stopPropagation()
                              subItem.onClick()
                              setLanguageMenuOpen(false)
                            }}
                          >
                            <span
                              className={`${menuClasses.iconContainer} text-lg`}
                              style={{
                                fontSize: '1.3rem',
                                transform: 'scale(1.3)',
                                display: 'inline-block',
                              }}
                            >
                              {subItem.customIcon}
                            </span>
                            <span
                              className={cn(
                                menuClasses.textContainer,
                                subItem.className || ''
                              )}
                            >
                              {subItem.label}
                            </span>
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
                    <div className='focus:outline-none'>{item.action}</div>
                  </DropdownMenu.Item>
                )
              }

              return (
                <DropdownMenu.Item key={index} asChild>
                  <Link
                    to={item.href || '#'}
                    className={cn(
                      'text-foreground-darker hover:bg-accent w-full items-center px-3 py-2 leading-normal focus:outline-none',
                      menuClasses.menuItem
                    )}
                  >
                    <span className={menuClasses.iconContainer}>
                      {item.icon
                        ? renderIcon(item.icon, { className: 'w-5 h-5' })
                        : null}
                    </span>
                    <span
                      className={cn(
                        menuClasses.textContainer,
                        getTypographyClass(i18n.language)
                      )}
                    >
                      {item.label}
                    </span>
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
