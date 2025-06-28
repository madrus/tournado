import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, test, vi } from 'vitest'

import UnauthorizedPage from '~/routes/unauthorized'

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.errors.unauthorizedTitle': 'Access Denied',
        'errors.unauthorized.description':
          'You do not have permission to access this page. Contact your administrator if you believe this is an error.',
        'common.backToHome': 'Back to Home',
        'common.titles.profile': 'Profile',
      }
      return translations[key] || key
    },
    i18n: { language: 'en' },
  }),
}))

// Mock PrefetchLink components
vi.mock('~/components/PrefetchLink', () => ({
  ErrorRecoveryLink: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className} data-testid='error-recovery-link'>
      {children}
    </a>
  ),
  PrimaryNavLink: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className} data-testid='primary-nav-link'>
      {children}
    </a>
  ),
}))

// Mock BlockIcon component
vi.mock('~/components/icons', () => ({
  BlockIcon: ({ className, size }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} data-testid='block-icon'>
      <rect />
    </svg>
  ),
}))

describe('Unauthorized Page', () => {
  describe('Basic Rendering', () => {
    test('should render main error title', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })

    test('should render error description', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      expect(
        screen.getByText(/You do not have permission to access this page/)
      ).toBeInTheDocument()
    })

    test('should render block icon', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const blockIcon = screen.getByTestId('block-icon')
      expect(blockIcon).toBeInTheDocument()
      expect(blockIcon).toHaveClass('text-brand')
    })

    test('should render navigation links', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      expect(screen.getByTestId('error-recovery-link')).toBeInTheDocument()
      expect(screen.getByTestId('primary-nav-link')).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    test('should render Back to Home link with correct attributes', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const homeLink = screen.getByTestId('error-recovery-link')
      expect(homeLink).toHaveAttribute('href', '/')
      expect(homeLink).toHaveTextContent('Back to Home')
    })

    test('should render Profile link with correct attributes', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const profileLink = screen.getByTestId('primary-nav-link')
      expect(profileLink).toHaveAttribute('href', '/profile')
      expect(profileLink).toHaveTextContent('Profile')
    })

    test('should style home link as primary button', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const homeLink = screen.getByTestId('error-recovery-link')
      expect(homeLink).toHaveClass(
        'flex',
        'w-full',
        'items-center',
        'justify-center',
        'rounded-md',
        'bg-emerald-600',
        'px-4',
        'py-2',
        'text-sm',
        'font-medium',
        'text-white'
      )
    })

    test('should style profile link as secondary button', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const profileLink = screen.getByTestId('primary-nav-link')
      expect(profileLink).toHaveClass(
        'flex',
        'w-full',
        'items-center',
        'justify-center',
        'rounded-md',
        'border',
        'border-gray-300',
        'bg-white',
        'px-4',
        'py-2',
        'text-sm',
        'font-medium',
        'text-gray-700'
      )
    })
  })

  describe('Layout and Styling', () => {
    test('should apply correct layout classes to main container', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const mainContainer = screen
        .getByText('Access Denied')
        .closest('div[class*="min-h-screen"]')
      expect(mainContainer).toHaveClass(
        'flex',
        'min-h-screen',
        'flex-col',
        'items-center',
        'justify-center',
        'bg-gray-50'
      )
    })

    test('should apply correct styling to content card', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const contentCard = screen
        .getByText('Access Denied')
        .closest('div[class*="bg-white"]')
      expect(contentCard).toHaveClass(
        'mx-auto',
        'max-w-md',
        'rounded-lg',
        'bg-white',
        'p-6',
        'shadow-md'
      )
    })

    test('should style icon container correctly', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const iconContainer = screen.getByTestId('block-icon').closest('div')
      expect(iconContainer).toHaveClass(
        'flex',
        'h-12',
        'w-12',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-red-100'
      )
    })

    test('should apply correct typography to title', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const title = screen.getByText('Access Denied')
      expect(title).toHaveClass('text-2xl', 'font-bold')
    })

    test('should apply correct styling to description', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const description = screen.getByText(
        /You do not have permission to access this page/
      )
      expect(description).toHaveClass('text-center', 'text-gray-600')
    })
  })

  describe('Content Organization', () => {
    test('should organize content in logical sections', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const container = screen.getByText('Access Denied').closest('div[class*="gap-4"]')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'gap-4')
    })

    test('should render elements in correct order', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const content =
        screen.getByText('Access Denied').closest('div[class*="gap-4"]')?.textContent ||
        ''

      // Verify content flows logically: icon, title, description, actions
      expect(content.indexOf('Access Denied')).toBeLessThan(
        content.indexOf('You do not have permission')
      )
      expect(content.indexOf('You do not have permission')).toBeLessThan(
        content.indexOf('Back to Home')
      )
    })

    test('should group action buttons together', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const actionsContainer = screen.getByTestId('error-recovery-link').closest('div')
      expect(actionsContainer).toHaveClass('flex', 'w-full', 'flex-col', 'gap-2')
    })
  })

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      expect(h1Elements).toHaveLength(1)
      expect(h1Elements[0]).toHaveTextContent('Access Denied')
    })

    test('should have accessible link text', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const homeLink = screen.getByTestId('error-recovery-link')
      const profileLink = screen.getByTestId('primary-nav-link')

      expect(homeLink).toHaveTextContent('Back to Home')
      expect(profileLink).toHaveTextContent('Profile')
    })

    test('should use semantic HTML structure', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      // Check for proper heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

      // Check for proper links
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
    })
  })

  describe('Error Communication', () => {
    test('should clearly communicate the error state', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      // Should have clear error title
      expect(screen.getByText('Access Denied')).toBeInTheDocument()

      // Should explain the issue
      expect(screen.getByText(/do not have permission/)).toBeInTheDocument()

      // Should suggest action
      expect(screen.getByText(/Contact your administrator/)).toBeInTheDocument()
    })

    test('should provide helpful recovery options', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      // Should offer way back to safety (home)
      expect(screen.getByTestId('error-recovery-link')).toHaveAttribute('href', '/')

      // Should offer way to check profile/permissions
      expect(screen.getByTestId('primary-nav-link')).toHaveAttribute('href', '/profile')
    })
  })

  describe('Visual Design', () => {
    test('should use red color scheme for error indication', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const icon = screen.getByTestId('block-icon')
      const iconContainer = icon.closest('div')

      expect(icon).toHaveClass('text-brand')
      expect(iconContainer).toHaveClass('bg-red-100')
    })

    test('should center content on screen', () => {
      render(
        <MemoryRouter>
          <UnauthorizedPage />
        </MemoryRouter>
      )

      const mainContainer = screen
        .getByText('Access Denied')
        .closest('div[class*="min-h-screen"]')
      expect(mainContainer).toHaveClass('items-center', 'justify-center')
    })
  })
})
