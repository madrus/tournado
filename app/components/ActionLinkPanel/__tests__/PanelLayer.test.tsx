import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import type { ColorAccent } from '~/lib/lib.types'

import { PanelLayer } from '../PanelLayer'

// Mock cn utility
vi.mock('~/utils/misc', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
}))

// Mock RTL utilities
vi.mock('~/utils/rtlUtils', () => ({
  getLatinTitleClass: (language: string) => (language === 'ar' ? 'latin-title' : ''),
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

      const backgroundElement = screen.getByTestId('test-layer-background')
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
      expect(backgroundElement).toHaveClass('from-teal-950')
      expect(backgroundElement).toHaveClass('via-teal-900')
      expect(backgroundElement).toHaveClass('to-teal-900')
    })

    it('should use hoverColor for hover layer when provided', () => {
      render(
        <PanelLayer
          {...defaultProps}
          mainColor='teal'
          hoverColor='blue'
          isHover={true}
        />
      )

      const backgroundElement = screen.getByTestId('test-layer-background')
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
      expect(backgroundElement).toHaveClass('from-blue-950')
      expect(backgroundElement).toHaveClass('via-blue-900')
      expect(backgroundElement).toHaveClass('to-blue-900')
    })

    it('should fallback to mainColor when isHover=true but no hoverColor', () => {
      render(<PanelLayer {...defaultProps} mainColor='purple' isHover={true} />)

      const backgroundElement = screen.getByTestId('test-layer-background')
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
      expect(backgroundElement).toHaveClass('from-purple-950')
      expect(backgroundElement).toHaveClass('via-purple-900')
      expect(backgroundElement).toHaveClass('to-purple-900')
    })

    it('should use gray gradient for brand color', () => {
      render(<PanelLayer {...defaultProps} mainColor='brand' />)

      const backgroundElement = screen.getByTestId('test-layer-background')
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
      expect(backgroundElement).toHaveClass('from-gray-900')
      expect(backgroundElement).toHaveClass('via-gray-800')
      expect(backgroundElement).toHaveClass('to-gray-800')
    })
  })

  describe('Icon Color Logic', () => {
    it('should handle ColorAccent iconColor for base layer', () => {
      render(<PanelLayer {...defaultProps} iconColor='teal' isHover={false} />)

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-teal-300')
      expect(iconContainer).toHaveClass('border-teal-300')
    })

    it('should handle brand iconColor for base layer', () => {
      render(<PanelLayer {...defaultProps} iconColor='brand' isHover={false} />)

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-red-600')
      expect(iconContainer).toHaveClass('border-red-600')
    })

    it('should handle string iconColor (Tailwind class) for base layer', () => {
      render(
        <PanelLayer {...defaultProps} iconColor='text-green-500' isHover={false} />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-green-500')
      expect(iconContainer).toHaveClass('border-green-500')
    })

    it('should use hover logic for hover layer with non-brand color', () => {
      render(
        <PanelLayer
          {...defaultProps}
          iconColor='teal'
          hoverColor='blue'
          isHover={true}
        />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-blue-300')
      expect(iconContainer).toHaveClass('border-blue-300')
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
      render(<PanelLayer {...defaultProps} textAlign='text-center' />)

      // Find the content container (has space-y-4 and text alignment)
      const containers = screen.getAllByRole('generic')
      const contentContainer = containers.find(
        el => el.className.includes('space-y-4') && el.className.includes('text-center')
      )

      expect(contentContainer).toBeTruthy()
      expect(contentContainer).toHaveClass('relative')
      expect(contentContainer).toHaveClass('z-20')
      expect(contentContainer).toHaveClass('flex')
      expect(contentContainer).toHaveClass('flex-col')
      expect(contentContainer).toHaveClass('items-start')
      expect(contentContainer).toHaveClass('space-y-4')
      expect(contentContainer).toHaveClass('p-6')
      expect(contentContainer).toHaveClass('break-words')
      expect(contentContainer).toHaveClass('text-center')
    })

    it('should organize content in correct order', () => {
      render(<PanelLayer {...defaultProps} />)

      const contentContainer = screen
        .getAllByRole('generic')
        .find(el => el.className.includes('space-y-4'))

      expect(contentContainer).toBeTruthy()

      // Check that icon, title, description all exist within content
      expect(screen.getByLabelText('panel icon')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
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
      render(<PanelLayer {...defaultProps} language='ar' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveClass('latin-title')
    })

    it('should not apply Latin title class for English language', () => {
      render(<PanelLayer {...defaultProps} language='en' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).not.toHaveClass('latin-title')
    })

    it('should apply custom text alignment', () => {
      render(<PanelLayer {...defaultProps} textAlign='text-right' />)

      const contentContainer = screen
        .getAllByRole('generic')
        .find(el => el.className.includes('text-right'))
      expect(contentContainer).toHaveClass('text-right')
    })
  })

  describe('Background and Glow', () => {
    it('should render background with correct gradient', () => {
      render(<PanelLayer {...defaultProps} mainColor='emerald' />)

      const backgroundElement = screen.getByTestId('test-layer-background')
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
      expect(backgroundElement).toHaveClass('from-emerald-950')
      expect(backgroundElement).toHaveClass('via-emerald-900')
      expect(backgroundElement).toHaveClass('to-emerald-900')
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
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('text-white')
    })

    it('should apply description classes', () => {
      render(<PanelLayer {...defaultProps} mainColor='blue' />)

      const description = screen.getByText('Test description')
      expect(description).toHaveClass('text-blue-100/80')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<PanelLayer {...defaultProps} title='' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('')
    })

    it('should handle empty description', () => {
      render(
        <PanelLayer {...defaultProps} description='' data-testid='empty-desc-test' />
      )

      // Empty description still renders paragraph element but it's empty
      const description = screen.getByText('', { selector: 'p' })
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('P')
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
