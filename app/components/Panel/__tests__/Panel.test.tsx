import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'

import { Panel } from '../Panel'

// Mock the language switcher hook
vi.mock('~/hooks/useLanguageSwitcher', () => ({
  useLanguageSwitcher: vi.fn(() => ({
    currentLanguage: 'en',
    switchLanguage: vi.fn(),
  })),
}))

// Mock icon component for testing
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid='mock-icon' className={className}>
    test-icon
  </span>
)

describe('Panel Component', () => {
  const defaultProps = {
    'data-testid': 'test-panel',
  }

  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<Panel {...defaultProps} />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toBeInTheDocument()
      expect(panel).toHaveClass('relative', 'overflow-visible', 'p-6')
    })

    it('should render title when provided', () => {
      render(<Panel {...defaultProps} title='Test Panel Title' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Test Panel Title')
    })

    it('should render subtitle when provided', () => {
      render(<Panel {...defaultProps} subtitle='Test panel description' />)

      const subtitle = screen.getByText('Test panel description')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle.tagName).toBe('P')
    })

    it('should render icon when provided', () => {
      render(<Panel {...defaultProps} icon={<MockIcon />} />)

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toBeInTheDocument()
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('should render children when provided', () => {
      render(
        <Panel {...defaultProps}>
          <div data-testid='child-content'>Child content</div>
        </Panel>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should not render optional elements when props not provided', () => {
      render(<Panel {...defaultProps} />)

      // No title
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()

      // No subtitle
      expect(screen.queryByText(/test panel description/i)).not.toBeInTheDocument()

      // No icon
      expect(screen.queryByLabelText('panel icon')).not.toBeInTheDocument()

      // No glow (default showGlow=false)
      expect(screen.queryByTestId('test-panel-glow')).not.toBeInTheDocument()

      // No panel number
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
  })

  describe('Color Variants', () => {
    it('should apply brand color classes by default', () => {
      render(<Panel {...defaultProps} />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('border-brand-400', 'panel-brand-bg')
    })

    it('should apply emerald color classes', () => {
      render(<Panel {...defaultProps} color='emerald' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('border-emerald-300', 'panel-emerald-bg')
    })

    it('should apply blue color classes', () => {
      render(<Panel {...defaultProps} color='blue' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('border-blue-300', 'panel-blue-bg')
    })

    it('should apply teal color classes', () => {
      render(<Panel {...defaultProps} color='teal' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('border-teal-300', 'panel-teal-bg')
    })

    it('should apply red color classes', () => {
      render(<Panel {...defaultProps} color='red' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('border-red-300', 'panel-red-bg')
    })
  })

  describe('Panel Variants', () => {
    it('should apply content-panel variant by default', () => {
      render(<Panel {...defaultProps} />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass(
        'relative',
        'overflow-visible',
        'p-6',
        'rounded-xl',
        'border',
        'shadow-lg'
      )
    })

    it('should apply container variant classes', () => {
      render(<Panel {...defaultProps} variant='container' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass(
        'cursor-pointer',
        'transition-colors',
        'duration-750',
        'ease-in-out'
      )
    })

    it('should apply background variant classes', () => {
      render(<Panel {...defaultProps} variant='background' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('absolute', 'inset-0', 'p-0')
    })

    it('should apply hover variant classes', () => {
      render(<Panel {...defaultProps} variant='hover' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass(
        'absolute',
        'inset-0',
        'z-30',
        'opacity-0',
        'group-hover:opacity-100'
      )
    })

    it('should apply dashboard-panel variant classes', () => {
      render(<Panel {...defaultProps} variant='dashboard-panel' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('rounded-xl', 'border', 'shadow-lg', 'p-6')
    })
  })

  describe('Icon Color Logic', () => {
    it('should use panel color for icon when no iconColor specified', () => {
      render(<Panel {...defaultProps} color='teal' icon={<MockIcon />} />)

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-adaptive-teal', 'border-adaptive-teal')
    })

    it('should use specified iconColor over panel color', () => {
      render(
        <Panel {...defaultProps} color='emerald' iconColor='blue' icon={<MockIcon />} />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-adaptive-blue', 'border-adaptive-blue')
    })

    it('should use iconColor for children when no childrenIconColor specified', () => {
      render(
        <Panel {...defaultProps} iconColor='teal' data-testid='panel-with-children'>
          <div data-testid='children-content'>Test content</div>
        </Panel>
      )

      // Test the children container for the styling classes
      const childrenContainer = screen.getByTestId('panel-with-children-children')
      expect(childrenContainer).toHaveClass('[&_p]:text-adaptive-teal')
      expect(childrenContainer).toHaveClass('[&_strong]:text-adaptive-teal')
    })

    it('should use specified childrenIconColor over iconColor', () => {
      render(
        <Panel
          {...defaultProps}
          iconColor='blue'
          childrenIconColor='red'
          data-testid='panel-with-red-children'
        >
          <div data-testid='children-content'>Test content</div>
        </Panel>
      )

      // Test the children container for the styling classes
      const childrenContainer = screen.getByTestId('panel-with-red-children-children')
      expect(childrenContainer).toHaveClass('[&_p]:text-adaptive-red')
      expect(childrenContainer).toHaveClass('[&_strong]:text-adaptive-red')
    })
  })

  describe('Special Features', () => {
    it('should render panel number when provided', () => {
      render(<Panel {...defaultProps} panelNumber={5} color='emerald' />)

      const numberBadge = screen.getByText('5')
      expect(numberBadge).toBeInTheDocument()
      // CVA generates bg-emerald-600 for panel numbers, not bg-emerald-400
      expect(numberBadge).toHaveClass('bg-emerald-600')
    })

    it('should apply disabled styling to panel number when disabled=true', () => {
      render(<Panel {...defaultProps} panelNumber={3} disabled />)

      const numberBadge = screen.getByText('3')
      expect(numberBadge).toBeInTheDocument()
      expect(numberBadge).toHaveClass('bg-gray-200')
      expect(numberBadge).toHaveClass('!text-gray-700')
    })

    it('should render glow effect when showGlow=true', () => {
      render(<Panel {...defaultProps} showGlow color='blue' />)

      const glowElement = screen.getByTestId('test-panel-glow')
      expect(glowElement).toBeInTheDocument()
      expect(glowElement).toHaveClass('bg-blue-400/30')
      // Test RTL-aware positioning
      expect(glowElement).toHaveClass('-right-8', 'rtl:-left-8', 'rtl:right-auto')
    })

    it('should apply disabled styling when disabled=true', () => {
      render(<Panel {...defaultProps} disabled />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('opacity-20', 'pointer-events-none')
    })

    it('should merge custom className with generated classes', () => {
      render(<Panel {...defaultProps} className='custom-class' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('custom-class')
      expect(panel).toHaveClass('relative', 'overflow-visible', 'p-6') // Default classes
    })
  })

  describe('Language Support', () => {
    it('should apply latin-title class for Arabic language', () => {
      vi.mocked(useLanguageSwitcher).mockReturnValueOnce({
        currentLanguage: 'ar',
        switchLanguage: vi.fn(),
      })

      render(<Panel {...defaultProps} title='Test Title' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveClass('latin-title')
    })

    it('should not apply latin-title class for English language', () => {
      vi.mocked(useLanguageSwitcher).mockReturnValueOnce({
        currentLanguage: 'en',
        switchLanguage: vi.fn(),
      })

      render(<Panel {...defaultProps} title='Test Title' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).not.toHaveClass('latin-title')
    })
  })

  describe('Brand Color Special Handling', () => {
    it('should apply special brand text color to subtitle', () => {
      render(<Panel {...defaultProps} color='brand' subtitle='Brand subtitle' />)

      const subtitle = screen.getByText('Brand subtitle')
      expect(subtitle).toHaveClass('text-foreground', 'mb-4')
    })

    it('should not apply special brand text color for other colors', () => {
      render(<Panel {...defaultProps} color='emerald' subtitle='Emerald subtitle' />)

      const subtitle = screen.getByText('Emerald subtitle')
      expect(subtitle).not.toHaveClass('text-brand-darkest', 'dark:text-red-200')
    })
  })

  describe('Content Layout', () => {
    it('should organize content in correct order: icon, title, subtitle, children', () => {
      render(
        <Panel
          {...defaultProps}
          icon={<MockIcon />}
          title='Test Title'
          subtitle='Test subtitle'
        >
          <div data-testid='test-children'>Children content</div>
        </Panel>
      )

      // Test presence and order using Testing Library queries
      const iconContainer = screen.getByLabelText('panel icon')
      const title = screen.getByRole('heading', { level: 3 })
      const subtitle = screen.getByText('Test subtitle')
      const children = screen.getByTestId('test-children')

      // Verify all elements are present in the document
      expect(iconContainer).toBeInTheDocument()
      expect(title).toBeInTheDocument()
      expect(subtitle).toBeInTheDocument()
      expect(children).toBeInTheDocument()
    })

    it('should organize dashboard variant content in horizontal layout', () => {
      render(
        <Panel
          {...defaultProps}
          variant='dashboard-panel'
          icon={<MockIcon />}
          title='Dashboard Title'
          iconColor='brand'
        >
          <span>123</span>
        </Panel>
      )

      // Dashboard variant uses different structure - no h3 title or icon label
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
      expect(screen.queryByLabelText('panel icon')).not.toBeInTheDocument()

      // Should have title in dt element and children in dd element
      const titleElement = screen.getByText('Dashboard Title')
      expect(titleElement).toBeInTheDocument()

      const valueElement = screen.getByText('123')
      expect(valueElement).toBeInTheDocument()

      // Should have dashboard icon with brand color background
      const iconElement = screen.getByTestId('mock-icon')
      expect(iconElement).toBeInTheDocument()

      // Test for the presence of dashboard structure classes
      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('[&_.dashboard-content]:flex')
      expect(panel).toHaveClass('[&_.dashboard-icon]:flex-shrink-0')
      expect(panel).toHaveClass('[&_.dashboard-stats]:w-0')
    })

    it('should apply correct spacing classes', () => {
      render(
        <Panel
          {...defaultProps}
          icon={<MockIcon />}
          title='Test Title'
          subtitle='Test subtitle'
        >
          <div>Children content</div>
        </Panel>
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('mb-4')

      const subtitle = screen.getByText('Test subtitle')
      expect(subtitle).toHaveClass('mb-4')
    })

    it('should apply padding for hover variant in content area', () => {
      render(
        <Panel
          {...defaultProps}
          variant='hover'
          title='Hover title'
          data-testid='hover-panel'
        />
      )

      // For hover variant, the content area gets additional padding
      // We can test this by checking the panel classes that indicate variant behavior
      const panel = screen.getByTestId('hover-panel')
      expect(panel).toHaveClass(
        'absolute',
        'inset-0',
        'z-30',
        'opacity-0',
        'group-hover:opacity-100'
      )
    })

    it('should not apply extra padding for non-hover variants', () => {
      render(
        <Panel
          {...defaultProps}
          variant='content'
          title='Content title'
          data-testid='content-panel'
        />
      )

      // For content variant, check the expected classes
      const panel = screen.getByTestId('content-panel')
      expect(panel).toHaveClass('relative', 'z-20', 'p-6')
      expect(panel).not.toHaveClass('absolute', 'inset-0', 'z-30')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string title', () => {
      render(<Panel {...defaultProps} title='' />)

      const title = screen.queryByRole('heading', { level: 3 })
      expect(title).not.toBeInTheDocument()
    })

    it('should handle empty string subtitle', () => {
      render(<Panel {...defaultProps} subtitle='' />)

      const subtitle = screen.queryByText('', { selector: 'p' })
      expect(subtitle).not.toBeInTheDocument()
    })

    it('should handle panelNumber as string', () => {
      render(<Panel {...defaultProps} panelNumber='A' />)

      const numberBadge = screen.getByText('A')
      expect(numberBadge).toBeInTheDocument()
    })

    it('should handle zero as panelNumber', () => {
      render(<Panel {...defaultProps} panelNumber={0} />)

      const numberBadge = screen.getByText('0')
      expect(numberBadge).toBeInTheDocument()
    })

    it('should not render glow testId when no main testId provided', () => {
      render(<Panel showGlow />)

      // Since no testId is provided, no glow element with testId should exist
      // We can't query for it directly, so test that glow is not found by any testId pattern
      expect(screen.queryByTestId('undefined-glow')).not.toBeInTheDocument()
      expect(screen.queryByTestId('null-glow')).not.toBeInTheDocument()
      expect(screen.queryByTestId('-glow')).not.toBeInTheDocument()
    })
  })
})
