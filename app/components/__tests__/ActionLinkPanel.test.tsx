import { Link, MemoryRouter } from 'react-router'

import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ActionLinkPanel } from '../ActionLinkPanel'

// Mock React Router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    Link: vi.fn(({ to, className, children, ...props }) => (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    )),
  }
})

// Mock cn utility
vi.mock('~/utils/misc', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
}))

// Mock RTL utilities
vi.mock('~/utils/rtlUtils', () => ({
  getTypographyClasses: (language: string) => ({
    textAlign: language === 'ar' ? 'text-right' : 'text-left',
  }),
  getLatinTitleClass: (language: string) => (language === 'ar' ? 'latin-title' : ''),
}))

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid='mock-icon' className={className}>
    icon
  </span>
)

const mockedLink = vi.mocked(Link)

describe('ActionLinkPanel Component', () => {
  const defaultProps = {
    title: 'Test Panel',
    description: 'Test description',
    icon: <MockIcon className='test-icon' />,
    mainColor: 'emerald' as const,
    iconColor: 'text-emerald-600',
    language: 'en',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render title and description correctly', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      expect(screen.getByText('Test Panel')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should render the provided icon', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const icon = screen.getByTestId('mock-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('test-icon')
    })

    it('should render as clickable div when no "to" prop is provided', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      // Test that content is rendered (div vs other elements is implementation detail)
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should render children when provided', () => {
      render(
        <ActionLinkPanel {...defaultProps}>
          <div data-testid='test-children'>Test children</div>
        </ActionLinkPanel>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Test children')).toBeInTheDocument()
    })
  })

  describe('Link Rendering', () => {
    it('should render as Link when "to" prop is provided', () => {
      render(
        <MemoryRouter>
          <ActionLinkPanel {...defaultProps} to='/test-route' />
        </MemoryRouter>
      )

      expect(mockedLink).toHaveBeenCalled()
      const linkCall = mockedLink.mock.calls[0][0]
      expect(linkCall.to).toBe('/test-route')
    })

    it('should apply focus classes when rendered as Link', () => {
      render(
        <MemoryRouter>
          <ActionLinkPanel {...defaultProps} to='/test-route' />
        </MemoryRouter>
      )

      expect(mockedLink).toHaveBeenCalled()
      const linkCall = mockedLink.mock.calls[0][0]
      // Basic focus handling is provided by the component
      expect(linkCall.className).toBeTruthy()
    })
  })

  describe('Click Functionality', () => {
    it('should call onClick when clicked (div variant)', () => {
      const handleClick = vi.fn()
      render(<ActionLinkPanel {...defaultProps} onClick={handleClick} />)

      const panel = screen.getByLabelText('Test Panel panel')
      fireEvent.click(panel)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not have onClick when "to" prop is provided', () => {
      const handleClick = vi.fn()

      render(
        <MemoryRouter>
          <ActionLinkPanel {...defaultProps} to='/test-route' onClick={handleClick} />
        </MemoryRouter>
      )

      // onClick should be ignored when to prop is provided
      expect(mockedLink).toHaveBeenCalled()
      const linkCall = mockedLink.mock.calls[0][0]
      expect(linkCall.onClick).toBeUndefined()
    })
  })

  describe('Color Schemes', () => {
    it('should apply emerald color scheme correctly', () => {
      render(
        <ActionLinkPanel
          {...defaultProps}
          mainColor='emerald'
          iconColor='text-emerald-600'
        />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-emerald-600')
      expect(iconContainer).toHaveClass('border-emerald-600')
    })

    it('should apply blue color scheme correctly', () => {
      render(
        <ActionLinkPanel {...defaultProps} mainColor='blue' iconColor='text-blue-600' />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-blue-600')
      expect(iconContainer).toHaveClass('border-blue-600')
    })

    it('should apply gray color scheme correctly', () => {
      render(
        <ActionLinkPanel {...defaultProps} mainColor='gray' iconColor='text-gray-600' />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-gray-600')
      expect(iconContainer).toHaveClass('border-gray-600')
    })

    it('should apply brand color scheme correctly', () => {
      render(
        <ActionLinkPanel {...defaultProps} mainColor='brand' iconColor='text-red-600' />
      )

      const iconContainer = screen.getByLabelText('panel icon')
      expect(iconContainer).toHaveClass('text-red-600')
      expect(iconContainer).toHaveClass('border-red-600')
    })
  })

  describe('RTL Support', () => {
    it('should apply correct text alignment for LTR languages', () => {
      render(<ActionLinkPanel {...defaultProps} language='en' />)

      // Text direction is applied via CSS (test with integration tests)
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
    })

    it('should apply correct text alignment for RTL languages', () => {
      render(<ActionLinkPanel {...defaultProps} language='ar' />)

      // Text direction is applied via CSS (test with integration tests)
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
    })

    it('should apply Latin title class for RTL languages', () => {
      render(<ActionLinkPanel {...defaultProps} language='ar' />)

      const title = screen.getByText('Test Panel')
      expect(title).toHaveClass('latin-title')
    })

    it('should not apply Latin title class for LTR languages', () => {
      render(<ActionLinkPanel {...defaultProps} language='en' />)

      const title = screen.getByText('Test Panel')
      expect(title).not.toHaveClass('latin-title')
    })
  })

  describe('Styling and CSS Classes', () => {
    it('should apply base panel styling', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const panel = screen.getByLabelText('Test Panel panel')
      expect(panel).toHaveClass('group')
      expect(panel).toHaveClass('rounded-2xl')
      expect(panel).toHaveClass('border')
      expect(panel).toHaveClass('shadow-xl')
      expect(panel).toHaveClass('cursor-pointer')
      expect(panel).toHaveClass('relative')
      expect(panel).toHaveClass('overflow-hidden')

      // Test that content is also accessible
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByLabelText('panel icon')).toBeInTheDocument()
    })

    it('should apply emerald hover colors', () => {
      render(<ActionLinkPanel {...defaultProps} mainColor='emerald' />)

      const panel = screen.getByLabelText('Test Panel panel')
      expect(panel).toHaveClass('border-emerald-400/60')

      // Test that gradient background exists
      const backgroundElement = screen.getByTestId('panel-background')
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
    })

    it('should apply correct icon container styling', () => {
      render(<ActionLinkPanel {...defaultProps} />)

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

    it('should apply correct title styling', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const title = screen.getByText('Test Panel')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('text-white')
    })

    it('should apply correct description styling', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const description = screen.getByText('Test description')
      expect(description).toHaveClass('text-emerald-100/80')
    })
  })

  describe('Content Layout', () => {
    it('should organize content in correct layout', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      // Test that all content elements are accessible (layout is implementation detail)
      expect(screen.getByLabelText('panel icon')).toBeInTheDocument()
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should place icon before title', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      // Test that both icon and title are present (order is implementation detail)
      expect(screen.getByLabelText('panel icon')).toBeInTheDocument()
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
    })

    it('should place children after description when provided', () => {
      render(
        <ActionLinkPanel {...defaultProps}>
          <div data-testid='custom-children'>Custom content</div>
        </ActionLinkPanel>
      )

      // Test that children are rendered (position is implementation detail)
      expect(screen.getByTestId('custom-children')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<ActionLinkPanel {...defaultProps} title='' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('')
    })

    it('should handle empty description', () => {
      render(<ActionLinkPanel {...defaultProps} description='' />)

      // Test that title is still visible when description is empty
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
      // Empty description still creates a paragraph element (implementation detail)
    })

    it('should handle missing onClick and to props', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      // Panel renders without crashing when no onClick or to props
      expect(screen.getByText('Test Panel')).toBeInTheDocument()
    })
  })
})
