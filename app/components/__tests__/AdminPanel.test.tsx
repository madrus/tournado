import { Link, MemoryRouter } from 'react-router'

import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { AdminPanel } from '../AdminPanel'

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

describe('AdminPanel Component', () => {
  const defaultProps = {
    title: 'Test Panel',
    description: 'Test description',
    icon: <MockIcon className='test-icon' />,
    colorScheme: 'emerald' as const,
    language: 'en',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render title and description correctly', () => {
      render(<AdminPanel {...defaultProps} />)

      expect(screen.getByText('Test Panel')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should render the provided icon', () => {
      render(<AdminPanel {...defaultProps} />)

      const icon = screen.getByTestId('mock-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('test-icon')
    })

    it('should render as clickable div when no "to" prop is provided', () => {
      const { container } = render(<AdminPanel {...defaultProps} />)

      const panel = container.firstChild
      expect(panel?.nodeName).toBe('DIV')
      expect(panel).toHaveClass('cursor-pointer')
    })

    it('should render children when provided', () => {
      render(
        <AdminPanel {...defaultProps}>
          <div data-testid='test-children'>Test children</div>
        </AdminPanel>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Test children')).toBeInTheDocument()
    })
  })

  describe('Link Rendering', () => {
    it('should render as Link when "to" prop is provided', () => {
      render(
        <MemoryRouter>
          <AdminPanel {...defaultProps} to='/test-route' />
        </MemoryRouter>
      )

      expect(mockedLink).toHaveBeenCalled()
      const linkCall = mockedLink.mock.calls[0][0]
      expect(linkCall.to).toBe('/test-route')
    })

    it('should apply focus classes when rendered as Link', () => {
      render(
        <MemoryRouter>
          <AdminPanel {...defaultProps} to='/test-route' />
        </MemoryRouter>
      )

      expect(mockedLink).toHaveBeenCalled()
      const linkCall = mockedLink.mock.calls[0][0]
      expect(linkCall.className).toContain('focus:ring-2')
      expect(linkCall.className).toContain('focus:ring-emerald-500')
      expect(linkCall.className).toContain('focus:outline-none')
    })
  })

  describe('Click Functionality', () => {
    it('should call onClick when clicked (div variant)', () => {
      const handleClick = vi.fn()
      render(<AdminPanel {...defaultProps} onClick={handleClick} />)

      const panel = screen.getByText('Test Panel').closest('div')
      fireEvent.click(panel!)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not have onClick when "to" prop is provided', () => {
      const handleClick = vi.fn()

      render(
        <MemoryRouter>
          <AdminPanel {...defaultProps} to='/test-route' onClick={handleClick} />
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
      render(<AdminPanel {...defaultProps} colorScheme='emerald' />)

      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveClass('border-emerald-600')
      expect(iconContainer).toHaveClass('group-hover:border-emerald-700')
    })

    it('should apply blue color scheme correctly', () => {
      render(<AdminPanel {...defaultProps} colorScheme='blue' />)

      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveClass('border-blue-600')
      expect(iconContainer).toHaveClass('group-hover:border-blue-700')
    })

    it('should apply gray color scheme correctly', () => {
      render(<AdminPanel {...defaultProps} colorScheme='gray' />)

      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveClass('border-gray-600')
      expect(iconContainer).toHaveClass('group-hover:border-gray-700')
    })

    it('should apply red color scheme correctly', () => {
      render(<AdminPanel {...defaultProps} colorScheme='red' />)

      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveClass('border-red-600')
      expect(iconContainer).toHaveClass('group-hover:border-red-700')
    })
  })

  describe('RTL Support', () => {
    it('should apply correct text alignment for LTR languages', () => {
      render(<AdminPanel {...defaultProps} language='en' />)

      const contentContainer = screen.getByText('Test Panel').closest('div')
      expect(contentContainer).toHaveClass('text-left')
    })

    it('should apply correct text alignment for RTL languages', () => {
      render(<AdminPanel {...defaultProps} language='ar' />)

      const contentContainer = screen.getByText('Test Panel').closest('div')
      expect(contentContainer).toHaveClass('text-right')
    })

    it('should apply Latin title class for RTL languages', () => {
      render(<AdminPanel {...defaultProps} language='ar' />)

      const title = screen.getByText('Test Panel')
      expect(title).toHaveClass('latin-title')
    })

    it('should not apply Latin title class for LTR languages', () => {
      render(<AdminPanel {...defaultProps} language='en' />)

      const title = screen.getByText('Test Panel')
      expect(title).not.toHaveClass('latin-title')
    })
  })

  describe('Styling and CSS Classes', () => {
    it('should apply base panel styling', () => {
      const { container } = render(<AdminPanel {...defaultProps} />)

      const panel = container.firstChild
      expect(panel).toHaveClass('group')
      expect(panel).toHaveClass('rounded-lg')
      expect(panel).toHaveClass('border')
      expect(panel).toHaveClass('bg-white')
      expect(panel).toHaveClass('p-6')
      expect(panel).toHaveClass('shadow-sm')
      expect(panel).toHaveClass('transition-all')
      expect(panel).toHaveClass('duration-200')
      expect(panel).toHaveClass('hover:shadow-md')
    })

    it('should apply emerald hover colors', () => {
      const { container } = render(
        <AdminPanel {...defaultProps} colorScheme='emerald' />
      )

      const panel = container.firstChild
      expect(panel).toHaveClass('hover:border-emerald-300')
      expect(panel).toHaveClass('hover:bg-emerald-50/30')
    })

    it('should apply correct icon container styling', () => {
      render(<AdminPanel {...defaultProps} />)

      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveClass('flex')
      expect(iconContainer).toHaveClass('h-8')
      expect(iconContainer).toHaveClass('w-8')
      expect(iconContainer).toHaveClass('items-center')
      expect(iconContainer).toHaveClass('justify-center')
      expect(iconContainer).toHaveClass('rounded-full')
      expect(iconContainer).toHaveClass('border-2')
      expect(iconContainer).toHaveClass('bg-transparent')
      expect(iconContainer).toHaveClass('transition-all')
    })

    it('should apply correct title styling', () => {
      render(<AdminPanel {...defaultProps} />)

      const title = screen.getByText('Test Panel')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('transition-colors')
      expect(title).toHaveClass('group-hover:text-emerald-700')
    })

    it('should apply correct description styling', () => {
      render(<AdminPanel {...defaultProps} />)

      const description = screen.getByText('Test description')
      expect(description).toHaveClass('text-foreground-light')
      expect(description).toHaveClass('transition-colors')
      expect(description).toHaveClass('group-hover:text-emerald-600')
    })
  })

  describe('Content Layout', () => {
    it('should organize content in correct flex layout', () => {
      render(<AdminPanel {...defaultProps} />)

      const contentContainer = screen.getByText('Test Panel').closest('div')
      expect(contentContainer).toHaveClass('flex')
      expect(contentContainer).toHaveClass('flex-col')
      expect(contentContainer).toHaveClass('items-start')
      expect(contentContainer).toHaveClass('space-y-4')
    })

    it('should place icon before title', () => {
      render(<AdminPanel {...defaultProps} />)

      const contentContainer = screen.getByText('Test Panel').closest('div')
      const children = Array.from(contentContainer!.children)

      // Icon container should be first
      expect(children[0]).toContainElement(screen.getByTestId('mock-icon'))
      // Title should be second
      expect(children[1]).toContainElement(screen.getByText('Test Panel'))
    })

    it('should place children after description when provided', () => {
      render(
        <AdminPanel {...defaultProps}>
          <div data-testid='custom-children'>Custom content</div>
        </AdminPanel>
      )

      const contentContainer = screen.getByText('Test Panel').closest('div')
      const children = Array.from(contentContainer!.children)

      // Children should be last
      expect(children[children.length - 1]).toContainElement(
        screen.getByTestId('custom-children')
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<AdminPanel {...defaultProps} title='' />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('')
    })

    it('should handle empty description', () => {
      render(<AdminPanel {...defaultProps} description='' />)

      // Find the description paragraph by its position and classes
      const contentContainer = screen.getByText('Test Panel').closest('div')
      const paragraphs = contentContainer!.querySelectorAll('p')
      const description = paragraphs[0] // First paragraph should be the description

      expect(description).toHaveClass('text-foreground-light')
      expect(description).toHaveTextContent('')
    })

    it('should handle missing onClick and to props', () => {
      const { container } = render(<AdminPanel {...defaultProps} />)

      const panel = container.firstChild
      expect(panel).toHaveClass('cursor-pointer')
      // Should not crash when clicked without onClick
      fireEvent.click(panel!)
    })
  })
})
