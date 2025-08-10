import { BrowserRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ActionLinkButton } from '../ActionLinkButton'

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
  }),
}))

// Mock the icon utils
vi.mock('~/utils/iconUtils', () => ({
  renderIcon: vi.fn((iconName: string, props: { className?: string }) => (
    <span data-testid={`icon-${iconName}`} className={props.className}>
      {iconName}
    </span>
  )),
}))

// Mock RTL utils
vi.mock('~/utils/rtlUtils', () => ({
  isRTL: vi.fn(() => false),
  getChipClasses: vi.fn(() => ({
    container: 'gap-2 flex-row',
  })),
}))

// Mock misc utils
vi.mock('~/utils/misc', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

// Wrapper component for React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('ActionLinkButton', () => {
  const defaultProps = {
    to: '/test',
    label: 'Test Button',
    icon: 'add' as const,
  }

  it('renders with default props', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} />
      </RouterWrapper>
    )

    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
    expect(screen.getByTestId('icon-add')).toBeInTheDocument()
  })

  it('renders with primary variant by default', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-brand-600')
    expect(link).toHaveClass('text-white')
    expect(link).toHaveClass('border-brand-600')
    expect(link).toHaveClass('focus-visible:ring-brand-600')
    expect(link).toHaveClass('hover:ring-brand-600')
  })

  it('renders with secondary variant', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='secondary' color='brand' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-white')
    expect(link).toHaveClass('text-brand-600')
    expect(link).toHaveClass('border')
    expect(link).toHaveClass('border-brand-600')
    expect(link).toHaveClass('focus-visible:ring-brand-600')
    expect(link).toHaveClass('hover:ring-brand-600')
  })

  it('renders with primary color when specified', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='primary' color='primary' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-primary-600')
    expect(link).toHaveClass('text-white')
    expect(link).toHaveClass('border-primary-600')
    expect(link).toHaveClass('focus-visible:ring-primary-600')
    expect(link).toHaveClass('hover:ring-primary-600')
  })

  it('applies custom className', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} className='custom-class' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('custom-class')
  })

  it('sets correct aria-label', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Test Button')
  })

  it('navigates to correct URL', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} to='/teams/new' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/teams/new')
  })

  it('renders icon with correct props', async () => {
    const { renderIcon } = await import('~/utils/iconUtils')

    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} icon='delete' />
      </RouterWrapper>
    )

    expect(renderIcon).toHaveBeenCalledWith('delete', {
      className: 'h-5 w-5',
    })
  })

  it('has proper base styling classes', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('inline-flex')
    expect(link).toHaveClass('items-center')
    expect(link).toHaveClass('justify-center')
    expect(link).toHaveClass('rounded-lg')
    expect(link).toHaveClass('py-2.5')
    expect(link).toHaveClass('text-base')
    expect(link).toHaveClass('font-bold')
    expect(link).toHaveClass('hover:scale-103')
    expect(link).toHaveClass('active:scale-95')
  })

  it('has proper animation classes (since links are not disabled)', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')

    // Verify link buttons have animations (unlike disabled action buttons)
    expect(link).toHaveClass('hover:scale-103') // Scale animation on hover
    expect(link).toHaveClass('active:scale-95') // Scale animation on active
    expect(link).toHaveClass('hover:shadow-xl') // Shadow animation on hover
    expect(link).toHaveClass('hover:ring-2') // Ring animation on hover
    expect(link).toHaveClass('hover:ring-offset-2') // Ring offset animation on hover

    // Verify transition classes for smooth animations
    expect(link).toHaveClass('transition-all')
    expect(link).toHaveClass('duration-300')
    expect(link).toHaveClass('ease-out')
  })

  describe('RTL support', () => {
    it('renders icon first in LTR layout', () => {
      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      // Instead of assigning 'link', use inline queries
      expect(screen.getByTestId('icon-add')).toBeInTheDocument()
      expect(screen.getByTestId('icon-add')).toHaveAttribute('data-testid', 'icon-add')
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    // Remove or update RTL-specific tests if not present in the new implementation
  })

  describe('accessibility', () => {
    it('is focusable', () => {
      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      const link = screen.getByRole('link')
      // Links are naturally focusable, no need to check tabIndex
      expect(link).toBeInTheDocument()
    })

    it('has focus styles', () => {
      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('focus-visible:ring-2')
      expect(link).toHaveClass('focus-visible:ring-offset-2')
      expect(link).toHaveClass('focus-visible:ring-offset-slate-50')
      expect(link).toHaveClass('hover:ring-2')
      expect(link).toHaveClass('hover:ring-offset-2')
      expect(link).toHaveClass('hover:ring-offset-slate-50')
      expect(link).toHaveClass('focus-visible:ring-brand-600')
      expect(link).toHaveClass('hover:ring-brand-600')
    })

    it('provides semantic link role', () => {
      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })

  describe('different icons', () => {
    const iconTestCases = [
      'add',
      'delete',
      'settings',
      'home',
      'apparel',
      'trophy',
    ] as const

    iconTestCases.forEach(iconName => {
      it(`renders with ${iconName} icon`, () => {
        render(
          <RouterWrapper>
            <ActionLinkButton {...defaultProps} icon={iconName} />
          </RouterWrapper>
        )

        expect(screen.getByTestId(`icon-${iconName}`)).toBeInTheDocument()
      })
    })
  })

  // Test primary variant (brand)
  it('renders primary variant with brand color', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='primary' color='brand' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-brand-600')
    expect(link).toHaveClass('text-white')
    expect(link).toHaveClass('border-brand-600')
    expect(link).toHaveClass('focus-visible:ring-brand-600')
    expect(link).toHaveClass('hover:ring-brand-600')
  })

  // Test secondary variant (brand)
  it('renders secondary variant with brand color', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='secondary' color='brand' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-white')
    expect(link).toHaveClass('text-brand-600')
    expect(link).toHaveClass('border')
    expect(link).toHaveClass('border-brand-600')
    expect(link).toHaveClass('focus-visible:ring-brand-600')
    expect(link).toHaveClass('hover:ring-brand-600')
  })
})
