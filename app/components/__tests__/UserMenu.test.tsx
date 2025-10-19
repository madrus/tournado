import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import type { MenuItemType } from '../UserMenu'
import { UserMenu } from '../UserMenu'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
    },
  }),
}))

// Mock React Router hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLocation: vi.fn(() => ({
      pathname: '/test',
      search: '',
      hash: '',
    })),
    useNavigate: vi.fn(() => vi.fn()),
    useNavigation: vi.fn(() => ({
      state: 'idle',
      location: null,
    })),
  }
})

// Mock RTL dropdown hook
vi.mock('~/hooks/useRTLDropdown', () => ({
  useRTLDropdown: () => ({
    dropdownProps: {
      align: 'end',
      side: 'bottom',
      sideOffset: 8,
      alignOffset: 0,
      avoidCollisions: true,
    },
    menuClasses: {
      spacing: '',
      textContainer: '',
      menuItem: 'flex',
      iconContainer: '',
    },
    isRTL: false,
  }),
}))

// Mock icon utils
vi.mock('~/utils/iconUtils', () => ({
  renderIcon: (name: string) => <span data-testid={`icon-${name}`}>{name}</span>,
}))

// Mock RTL utils
vi.mock('~/utils/rtlUtils', () => ({
  getLatinTextClass: () => '',
  getTypographyClass: () => '',
}))

// Mock AnimatedHamburgerIcon
vi.mock('~/components/icons/AnimatedHamburgerIcon', () => ({
  AnimatedHamburgerIcon: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid='hamburger-icon'>{isOpen ? 'open' : 'closed'}</div>
  ),
}))

describe('UserMenu', () => {
  const mockMenuItems: MenuItemType[] = [
    {
      label: 'Teams',
      icon: 'group',
      href: '/teams',
    },
    {
      label: 'About',
      icon: 'info',
      href: '/about',
    },
  ]

  it('should render trigger button with cursor-pointer class', () => {
    render(
      <MemoryRouter>
        <UserMenu
          authenticated={false}
          username=''
          menuItems={mockMenuItems}
          isOpen={false}
          onOpenChange={vi.fn()}
        />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', { name: 'common.toggleMenu' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('cursor-pointer')
  })

  it('should have proper ARIA label on trigger button', () => {
    render(
      <MemoryRouter>
        <UserMenu
          authenticated={false}
          username=''
          menuItems={mockMenuItems}
          isOpen={false}
          onOpenChange={vi.fn()}
        />
      </MemoryRouter>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'common.toggleMenu')
  })

  it('should render hamburger icon in closed state when menu is closed', () => {
    render(
      <MemoryRouter>
        <UserMenu
          authenticated={false}
          username=''
          menuItems={mockMenuItems}
          isOpen={false}
          onOpenChange={vi.fn()}
        />
      </MemoryRouter>
    )

    const hamburgerIcon = screen.getByTestId('hamburger-icon')
    expect(hamburgerIcon).toHaveTextContent('closed')
  })

  it('should render hamburger icon in open state when menu is open', () => {
    render(
      <MemoryRouter>
        <UserMenu
          authenticated={false}
          username=''
          menuItems={mockMenuItems}
          isOpen={true}
          onOpenChange={vi.fn()}
        />
      </MemoryRouter>
    )

    const hamburgerIcon = screen.getByTestId('hamburger-icon')
    expect(hamburgerIcon).toHaveTextContent('open')
  })
})
