import { Link } from '@remix-run/react'

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

// User menu dropdown component
export function UserMenu({
  authenticated,
  username,
  menuItems,
}: {
  authenticated: boolean
  username?: string
  menuItems: Array<MenuItemType>
}): JSX.Element {
  const { t } = useTranslation()

  if (!authenticated) {
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

  return (
    <div className='relative inline-block text-left'>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className='inline-flex content-start items-center text-white hover:text-emerald-100 focus:outline-none'>
            <span className='hidden md:block'>{username}</span>
            <span className='material-symbols-outlined'>expand_more</span>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className='ring-opacity-5 z-[9999] w-56 divide-y divide-gray-100 rounded-md bg-white p-1 shadow-lg ring-1 ring-black focus:outline-none'
            sideOffset={5}
            align='end'
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
                    return (
                      <DropdownMenu.Sub key={index}>
                        <DropdownMenu.SubTrigger className='flex w-full content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none'>
                          <span className='w-8 pl-0 text-left text-lg'>
                            {item.customIcon}
                          </span>
                          <span>{item.label}</span>
                        </DropdownMenu.SubTrigger>
                        <DropdownMenu.SubContent
                          className='ring-opacity-5 min-w-[8rem] rounded-md bg-white p-1 shadow-lg ring-1 ring-black'
                          sideOffset={2}
                        >
                          {item.subMenu.map((subItem, subIndex) => (
                            <DropdownMenu.Item
                              key={subIndex}
                              className={`flex w-full content-start items-center px-3 py-1 text-sm ${
                                subItem.active
                                  ? 'bg-gray-100 text-emerald-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              } focus:outline-none`}
                              onClick={subItem.onClick}
                            >
                              <span className='w-8 pl-0 text-left text-lg'>
                                {subItem.customIcon}
                              </span>
                              <span>{subItem.label}</span>
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Sub>
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
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
