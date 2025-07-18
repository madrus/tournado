import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

// Import the mocked hook to access it in tests
import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'
import { type ColorAccent } from '~/lib/lib.types'

import { PanelLayer } from '../PanelLayer'

// Mock RTL utilities
vi.mock('~/utils/rtlUtils', () => ({
  getLatinTitleClass: (language: string) => (language === 'ar' ? 'latin-title' : ''),
}))

// Mock the language hook
vi.mock('~/hooks/useLanguageSwitcher', () => ({
  useLanguageSwitcher: vi.fn(() => ({
    currentLanguage: 'en',
    switchLanguage: vi.fn(),
  })),
}))

// No need to import panel style functions since we're testing the integration
// The actual style functions are tested in panel.styles.test.ts

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid='mock-icon' className={className}>
    icon
  </span>
)

describe('PanelLayer Component', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test description',
    icon: <MockIcon />,
    iconColor: 'emerald' as ColorAccent,
    mainColor: 'emerald' as ColorAccent,
    language: 'en',
    textAlign: 'text-left',
    'data-testid': 'test-layer',
  }

  describe('Basic Rendering', () => {
    it('should render title, description, and icon', () => {
      render(<PanelLayer {...defaultProps} />)

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('should render children when provided', () => {
      render(
        <PanelLayer {...defaultProps}>
          <div data-testid='test-children'>Child content</div>
        </PanelLayer>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<PanelLayer {...defaultProps} className='custom-class' />)

      const container = screen.getByTestId('test-layer')
      expect(container).toHaveClass('custom-class')
    })

    it('should apply data-testid when provided', () => {
      render(<PanelLayer {...defaultProps} data-testid='custom-testid' />)

      expect(screen.getByTestId('custom-testid')).toBeInTheDocument()
    })
  })

  describe('Color Handling', () => {
    it('should use mainColor for base layer (isHover=false)', () => {
      render(<PanelLayer {...defaultProps} mainColor='teal' isHover={false} />)

      const backgroundElement = screen.getByTestId('test-layer')
      // Test for semantic classes instead of raw Tailwind
      expect(backgroundElement).toHaveClass('panel-teal-bg')
      expect(backgroundElement).toHaveClass('border-teal-300')
    })

    it('should use hoverColor for hover layer when provided', () => {
      render(
        <PanelLayer
          {...defaultProps}
          mainColor='emerald'
          hoverColor='blue'
          isHover={true}
        />
      )

      const backgroundElement = screen.getByTestId('test-layer')
      // Test for semantic classes instead of raw Tailwind
      expect(backgroundElement).toHaveClass('panel-blue-bg')
      expect(backgroundElement).toHaveClass('border-blue-300')
    })

    it('should fallback to mainColor when isHover=true but no hoverColor', () => {
      render(<PanelLayer {...defaultProps} mainColor='purple' isHover={true} />)

      const backgroundElement = screen.getByTestId('test-layer')
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
      expect(backgroundElement).toHaveClass('from-white')
      expect(backgroundElement).toHaveClass('via-purple-100')
      expect(backgroundElement).toHaveClass('to-white')
      expect(backgroundElement).toHaveClass('dark:from-purple-950')
      expect(backgroundElement).toHaveClass('dark:via-purple-900')
      expect(backgroundElement).toHaveClass('dark:to-purple-900')
    })

    it('should use slate gradient for brand color', () => {
      render(<PanelLayer {...defaultProps} mainColor='brand' />)

      const backgroundElement = screen.getByTestId('test-layer')
      // Test for semantic classes instead of raw Tailwind
      expect(backgroundElement).toHaveClass('panel-brand-bg')
      expect(backgroundElement).toHaveClass('border-brand-400')
    })
  })

  describe('Icon Color Logic', () => {
    it('should handle ColorAccent iconColor for base layer', () => {
      render(<PanelLayer {...defaultProps} iconColor='teal' isHover={false} />)

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-teal-700')
      expect(iconContainer).toHaveClass('border-teal-700')
    })

    it('should handle brand iconColor for base layer', () => {
      render(<PanelLayer {...defaultProps} iconColor='brand' isHover={false} />)

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-red-600')
      expect(iconContainer).toHaveClass('border-red-600')
    })

    it('should use hover logic for hover layer with non-brand color', () => {
      render(
        <PanelLayer
          {...defaultProps}
          mainColor='emerald'
          hoverColor='blue'
          iconColor='emerald'
          isHover={true}
        />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-blue-700')
      expect(iconContainer).toHaveClass('border-blue-700')
    })

    it('should use hover logic for hover layer with brand color', () => {
      render(
        <PanelLayer
          {...defaultProps}
          iconColor='teal'
          hoverColor='brand'
          isHover={true}
        />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-red-600')
      expect(iconContainer).toHaveClass('border-red-600')
    })
  })

  describe('Content Layout', () => {
    it('should apply correct content container styling', () => {
      render(<PanelLayer {...defaultProps} />)

      // Verify the Panel container exists with expected styling
      const container = screen.getByTestId('test-layer')
      expect(container).toBeTruthy()
      expect(container).toHaveClass('relative')
      expect(container).toHaveClass('z-20')
      expect(container).toHaveClass('p-6')
    })

    it('should organize content in correct order', () => {
      render(<PanelLayer {...defaultProps} />)

      // Check that all content elements are present and rendered
      const iconContainer = screen.getByLabelText('panel icon')
      const title = screen.getByRole('heading', { level: 3 })
      const description = screen.getByText('Test description')

      expect(iconContainer).toBeInTheDocument()
      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()

      // Verify their content
      expect(title).toHaveTextContent('Test Title')
      expect(description).toHaveTextContent('Test description')
    })

    it('should apply icon container styling', () => {
      render(<PanelLayer {...defaultProps} />)

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('flex')
      expect(iconContainer).toHaveClass('h-8')
      expect(iconContainer).toHaveClass('w-8')
      expect(iconContainer).toHaveClass('items-center')
      expect(iconContainer).toHaveClass('justify-center')
      expect(iconContainer).toHaveClass('rounded-full')
      expect(iconContainer).toHaveClass('border-2')
      expect(iconContainer).toHaveClass('bg-transparent')
    })
  })

  describe('RTL Support', () => {
    it('should apply Latin title class for Arabic language', () => {
      // Mock Arabic language
      vi.mocked(useLanguageSwitcher).mockReturnValueOnce({
        currentLanguage: 'ar',
        switchLanguage: vi.fn(),
      })

      render(<PanelLayer {...defaultProps} />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveClass('latin-title')
    })

    it('should not apply Latin title class for English language', () => {
      // Mock English language (default)
      vi.mocked(useLanguageSwitcher).mockReturnValueOnce({
        currentLanguage: 'en',
        switchLanguage: vi.fn(),
      })

      render(<PanelLayer {...defaultProps} />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).not.toHaveClass('latin-title')
    })
  })

  describe('Background and Glow', () => {
    it('should render background with correct gradient', () => {
      render(<PanelLayer {...defaultProps} mainColor='emerald' />)

      const backgroundElement = screen.getByTestId('test-layer')
      // Test for semantic classes instead of raw Tailwind
      expect(backgroundElement).toHaveClass('panel-emerald-bg')
      expect(backgroundElement).toHaveClass('border-emerald-300')
    })

    it('should render glow element', () => {
      render(<PanelLayer {...defaultProps} mainColor='teal' />)

      const glowElement = screen.getByTestId('test-layer-glow')
      expect(glowElement).toBeInTheDocument()
      expect(glowElement).toHaveClass('bg-teal-400/30')
    })
  })

  describe('Title and Description Styling', () => {
    it('should apply title classes', () => {
      render(<PanelLayer {...defaultProps} />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveClass('text-xl')
      expect(title).toHaveClass('font-bold')
      expect(title).toHaveClass('text-title')
      expect(title).toHaveClass('mb-4')
    })

    it('should apply description classes', () => {
      render(<PanelLayer {...defaultProps} />)

      const description = screen.getByText('Test description')
      expect(description).toHaveClass('text-foreground')
      expect(description).toHaveClass('mb-4')
    })
  })

  describe('Transition Wrapper Classes', () => {
    it('should apply base layer transition classes when isHover=false', () => {
      render(
        <PanelLayer
          {...defaultProps}
          isHover={false}
          hoverColor='blue'
          data-testid='base-layer-test'
        />
      )

      // Find the wrapper element
      const wrapper = screen.getByTestId('base-layer-test-wrapper')

      // Base layer should have relative positioning and fade-out on hover
      expect(wrapper).toHaveClass('relative')
      expect(wrapper).toHaveClass('z-20')
      expect(wrapper).toHaveClass('transition-opacity')
      expect(wrapper).toHaveClass('duration-750')
      expect(wrapper).toHaveClass('ease-in-out')

      // Should have opacity fade-out when hoverColor is provided
      expect(wrapper).toHaveClass('group-hover:opacity-0')
      expect(wrapper).toHaveClass('panel-base-layer')
    })

    it('should apply hover layer transition classes when isHover=true', () => {
      render(
        <PanelLayer
          {...defaultProps}
          isHover={true}
          hoverColor='blue'
          data-testid='hover-layer-test'
        />
      )

      // Find the wrapper element
      const wrapper = screen.getByTestId('hover-layer-test-wrapper')

      // Hover layer should have absolute positioning and fade-in on hover
      expect(wrapper).toHaveClass('absolute')
      expect(wrapper).toHaveClass('inset-0')
      expect(wrapper).toHaveClass('z-30')
      expect(wrapper).toHaveClass('opacity-0')
      expect(wrapper).toHaveClass('group-hover:opacity-100')
      expect(wrapper).toHaveClass('transition-opacity')
      expect(wrapper).toHaveClass('duration-750')
      expect(wrapper).toHaveClass('ease-in-out')
      expect(wrapper).toHaveClass('panel-hover-layer')
    })

    it('should not apply base layer fade-out when no hoverColor provided', () => {
      render(
        <PanelLayer
          {...defaultProps}
          isHover={false}
          // No hoverColor provided
          data-testid='no-hover-test'
        />
      )

      // Find the wrapper element
      const wrapper = screen.getByTestId('no-hover-test-wrapper')

      // Should still have positioning classes
      expect(wrapper).toHaveClass('relative')
      expect(wrapper).toHaveClass('z-20')
      expect(wrapper).toHaveClass('transition-opacity')

      // But should NOT have opacity fade-out classes
      expect(wrapper).not.toHaveClass('group-hover:opacity-0')
      expect(wrapper).not.toHaveClass('panel-base-layer')
    })

    it('should generate correct wrapper test IDs', () => {
      render(<PanelLayer {...defaultProps} data-testid='custom-test-id' />)

      // Should create wrapper with -wrapper suffix
      expect(screen.getByTestId('custom-test-id-wrapper')).toBeInTheDocument()

      // And the inner Panel should have the original test ID
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<PanelLayer {...defaultProps} title='' />)

      // Panel conditionally renders title - when empty, no h3 element should exist
      const title = screen.queryByRole('heading', { level: 3 })
      expect(title).not.toBeInTheDocument()

      // But icon and description should still be present
      expect(screen.getByLabelText('panel icon')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should handle empty description', () => {
      render(
        <PanelLayer {...defaultProps} description='' data-testid='empty-desc-test' />
      )

      // Panel conditionally renders description - when empty, no p element should exist
      const description = screen.queryByText('', { selector: 'p' })
      expect(description).not.toBeInTheDocument()

      // But title and icon should still be present
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
      expect(screen.getByLabelText('panel icon')).toBeInTheDocument()
    })

    it('should handle missing optional props', () => {
      const minimalProps = {
        title: 'Test',
        description: 'Test desc',
        icon: <MockIcon />,
        iconColor: 'blue' as ColorAccent,
        mainColor: 'blue' as ColorAccent,
        language: 'en',
        textAlign: 'text-left',
      }

      expect(() => render(<PanelLayer {...minimalProps} />)).not.toThrow()
    })
  })
})
