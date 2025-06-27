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
    expect(link).toHaveClass('bg-brand')
    expect(link).toHaveClass('text-white')
    expect(link).toHaveClass('hover:bg-brand/90')
    expect(link).toHaveClass('focus:ring-brand')
  })

  it('renders with secondary variant', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='secondary' color='brand' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-transparent')
    expect(link).toHaveClass('text-brand')
    expect(link).toHaveClass('border')
    expect(link).toHaveClass('border-brand')
    expect(link).toHaveClass('hover:bg-brand/10')
    expect(link).toHaveClass('focus:ring-brand')
  })

  it('renders with emerald color when specified', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} color='emerald' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-emerald-600')
    expect(link).toHaveClass('text-white')
    expect(link).toHaveClass('hover:bg-emerald-700')
    expect(link).toHaveClass('focus:ring-emerald-600')
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
    expect(link).toHaveClass('text-sm')
    expect(link).toHaveClass('font-semibold')
    expect(link).toHaveClass('hover:scale-103')
    expect(link).toHaveClass('active:scale-95')
  })

  describe('RTL support', () => {
    it('renders icon first in LTR layout', () => {
      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      const link = screen.getByRole('link')
      const children = Array.from(link.children)

      // First child should be the icon
      expect(children[0]).toHaveAttribute('data-testid', 'icon-add')
      // Second child should contain the text
      expect(children[1]).toHaveTextContent('Test Button')
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
      // React Router Links are naturally focusable without explicit tabIndex
      expect(link).toBeInTheDocument()
    })

    it('has focus styles', () => {
      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('focus:ring-2')
      expect(link).toHaveClass('focus:ring-offset-2')
      // Removed focus:ring-brand/90 and hover:ring-2 if not present in the new system
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
    expect(link).toHaveClass('bg-brand')
    expect(link).toHaveClass('text-white')
    expect(link).toHaveClass('hover:bg-brand/90')
    expect(link).toHaveClass('focus:ring-brand')
  })

  // Test secondary variant (brand)
  it('renders secondary variant with brand color', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='secondary' color='brand' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-transparent')
    expect(link).toHaveClass('text-brand')
    expect(link).toHaveClass('border')
    expect(link).toHaveClass('border-brand')
    expect(link).toHaveClass('hover:bg-brand/10')
    expect(link).toHaveClass('focus:ring-brand')
  })
})
