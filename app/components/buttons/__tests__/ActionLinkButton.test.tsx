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
    expect(link).toHaveClass('hover:bg-brand/90')
    expect(link).toHaveClass('focus:ring-red-600/90')
  })

  it('renders with secondary variant', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='secondary' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-gray-100')
    expect(link).toHaveClass('text-gray-800')
    expect(link).toHaveClass('hover:bg-gray-200')
  })

  it('renders with emerald variant', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} variant='emerald' />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-emerald-600')
    expect(link).toHaveClass('hover:bg-emerald-500')
    expect(link).toHaveClass('focus:ring-emerald-600/90')
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

  it('has consistent padding classes', () => {
    render(
      <RouterWrapper>
        <ActionLinkButton {...defaultProps} />
      </RouterWrapper>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('ps-4')
    expect(link).toHaveClass('pe-4')
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
    expect(link).toHaveClass('border-0')
    expect(link).toHaveClass('py-2.5')
    expect(link).toHaveClass('text-sm')
    expect(link).toHaveClass('font-semibold')
    expect(link).toHaveClass('shadow-lg')
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

    it('renders text first in RTL layout', async () => {
      const { isRTL } = await import('~/utils/rtlUtils')
      vi.mocked(isRTL).mockReturnValue(true)

      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      const link = screen.getByRole('link')
      const children = Array.from(link.children)

      // First child should contain the text
      expect(children[0]).toHaveTextContent('Test Button')
      // Second child should be the icon
      expect(children[1]).toHaveAttribute('data-testid', 'icon-add')
    })

    it('uses RTL chip classes when in RTL mode', async () => {
      const { isRTL, getChipClasses } = await import('~/utils/rtlUtils')
      vi.mocked(isRTL).mockReturnValue(true)
      vi.mocked(getChipClasses).mockReturnValue({
        container: 'gap-2 flex-row-reverse',
      })

      render(
        <RouterWrapper>
          <ActionLinkButton {...defaultProps} />
        </RouterWrapper>
      )

      expect(getChipClasses).toHaveBeenCalledWith('en')
      const link = screen.getByRole('link')
      expect(link).toHaveClass('gap-2')
      expect(link).toHaveClass('flex-row-reverse')
    })
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
      // Check for focus ring (appears on keyboard focus)
      expect(link).toHaveClass('focus:ring-red-600/90')
      // Check for hover ring (appears on hover)
      expect(link).toHaveClass('hover:ring-2')
      expect(link).toHaveClass('hover:ring-offset-2')
      expect(link).toHaveClass('focus:outline-none')
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
})
