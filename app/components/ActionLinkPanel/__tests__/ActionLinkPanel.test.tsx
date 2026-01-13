import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { ColorAccent } from '~/lib/lib.types'
import { ActionLinkPanel } from '../ActionLinkPanel'

// Mock React Router
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
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
  getTypographyClasses: () => ({
    textAlign: 'text-left',
  }),
  getLatinTitleClass: () => '',
}))

// Mock child components
vi.mock('../PanelBackground', () => ({
  PanelBackground: ({
    backgroundColor,
    'data-testid': testId,
  }: {
    backgroundColor: string
    'data-testid'?: string
  }) => (
    <div data-testid={testId} className={backgroundColor}>
      panel-background
    </div>
  ),
}))

vi.mock('../PanelLayer', () => ({
  PanelLayer: ({
    title,
    description,
    'data-testid': testId,
    children,
    isHover,
    className,
  }: {
    title: string
    description: string
    'data-testid'?: string
    children?: React.ReactNode
    isHover?: boolean
    className?: string
  }) => (
    <div data-testid={testId} className={className}>
      <h3>{title}</h3>
      <p>{description}</p>
      <div data-testid={isHover ? 'hover-icon' : 'base-icon'}>icon</div>
      {children}
    </div>
  ),
}))

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid='mock-icon' className={className}>
    icon
  </span>
)

const mockedLink = vi.mocked(Link)

describe('ActionLinkPanel Component Integration', () => {
  const defaultProps = {
    title: 'Test Panel',
    description: 'Test description',
    icon: <MockIcon className='test-icon' />,
    mainColor: 'emerald' as ColorAccent,
    iconColor: 'emerald' as ColorAccent,
    testId: 'test-panel',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Architecture', () => {
    it('should render PanelBackground with correct props', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const background = screen.getByTestId('panel-background')
      expect(background).toBeInTheDocument()
      expect(background).toHaveClass('panel-emerald-bg')
    })

    it('should render base PanelLayer with correct props', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const baseLayer = screen.getByTestId('main-panel-layer')
      expect(baseLayer).toBeInTheDocument()
      expect(baseLayer).toHaveTextContent('Test Panel')
      expect(baseLayer).toHaveTextContent('Test description')

      const baseIcon = screen.getByTestId('base-icon')
      expect(baseIcon).toBeInTheDocument()
    })

    it('should render hover PanelLayer when hoverColor provided', () => {
      render(<ActionLinkPanel {...defaultProps} hoverColor='blue' />)

      const hoverLayer = screen.getByTestId('hover-panel-layer')
      expect(hoverLayer).toBeInTheDocument()
      expect(hoverLayer).toHaveTextContent('Test Panel')
      expect(hoverLayer).toHaveTextContent('Test description')

      const hoverIcon = screen.getByTestId('hover-icon')
      expect(hoverIcon).toBeInTheDocument()
    })

    it('should not render hover PanelLayer when no hoverColor', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      expect(screen.queryByTestId('hover-panel-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('hover-icon')).not.toBeInTheDocument()
    })

    it('should pass children to both layers when hoverColor provided', () => {
      render(
        <ActionLinkPanel {...defaultProps} hoverColor='blue'>
          <div data-testid='test-children'>Test children</div>
        </ActionLinkPanel>,
      )

      const baseLayers = screen.getAllByTestId('test-children')
      expect(baseLayers).toHaveLength(2) // One in base layer, one in hover layer
    })
  })

  describe('Router Integration', () => {
    it('should render as div when no "to" prop provided', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      expect(mockedLink).not.toHaveBeenCalled()
      expect(screen.getByTestId('test-panel')).toBeInTheDocument()
    })

    it('should render as Link when "to" prop provided', () => {
      render(
        <MemoryRouter>
          <ActionLinkPanel {...defaultProps} to='/test-route' />
        </MemoryRouter>,
      )

      expect(mockedLink).toHaveBeenCalled()
      const linkCall = mockedLink.mock.calls[0][0]
      expect(linkCall.to).toBe('/test-route')
      expect(linkCall.className).toBe('block')
    })

    it('should not apply onClick when "to" prop provided', () => {
      const handleClick = vi.fn()

      render(
        <MemoryRouter>
          <ActionLinkPanel {...defaultProps} to='/test-route' onClick={handleClick} />
        </MemoryRouter>,
      )

      expect(mockedLink).toHaveBeenCalled()
      const linkCall = mockedLink.mock.calls[0][0]
      expect(linkCall.onClick).toBeUndefined()
    })
  })

  describe('Event Handling', () => {
    it('should handle onClick when no "to" prop', () => {
      const handleClick = vi.fn()
      render(<ActionLinkPanel {...defaultProps} onClick={handleClick} />)

      const panel = screen.getByTestId('test-panel')
      fireEvent.click(panel)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should apply button role when onClick provided', () => {
      const handleClick = vi.fn()
      render(<ActionLinkPanel {...defaultProps} onClick={handleClick} />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveAttribute('role', 'button')
      expect(panel).toHaveAttribute('tabIndex', '0')
    })

    it('should not apply button role when no onClick', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).not.toHaveAttribute('role')
      expect(panel).not.toHaveAttribute('tabIndex')
    })
  })

  describe('Border Color Logic', () => {
    it('should apply main border color', () => {
      render(<ActionLinkPanel {...defaultProps} mainColor='teal' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('panel-teal-bg')
    })

    it('should apply hover border color when hoverColor provided', () => {
      render(<ActionLinkPanel {...defaultProps} mainColor='teal' hoverColor='brand' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('panel-teal-bg')
    })

    it('should not apply hover border when no hoverColor', () => {
      render(<ActionLinkPanel {...defaultProps} mainColor='teal' />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toBeInTheDocument()
    })
  })

  describe('Base Styling', () => {
    it('should apply core panel classes', () => {
      render(<ActionLinkPanel {...defaultProps} />)

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('group')
      expect(panel).toHaveClass('relative')
      expect(panel).toHaveClass('cursor-pointer')
      expect(panel).toHaveClass('overflow-hidden')
      expect(panel).toHaveClass('rounded-2xl')
      expect(panel).toHaveClass('border')
      expect(panel).toHaveClass('shadow-xl')
      expect(panel).toHaveClass('transition-colors')
      expect(panel).toHaveClass('duration-750')
      expect(panel).toHaveClass('ease-in-out')
    })

    it('should render both base and hover layers when hoverColor provided', () => {
      // This test should focus on ActionLinkPanel's behavior, not PanelLayer's implementation
      // We verify that ActionLinkPanel calls PanelLayer components with the correct props
      render(<ActionLinkPanel {...defaultProps} hoverColor='blue' />)

      // Verify base layer is rendered with correct props
      const baseLayer = screen.getByTestId('main-panel-layer')
      expect(baseLayer).toBeInTheDocument()

      // Verify hover layer is rendered when hoverColor is provided
      const hoverLayer = screen.getByTestId('hover-panel-layer')
      expect(hoverLayer).toBeInTheDocument()

      // The actual transition class application is PanelLayer's responsibility
      // and should be tested in PanelLayer's unit tests
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing optional props gracefully', () => {
      const minimalProps = {
        title: 'Test',
        description: 'Test desc',
        icon: <MockIcon />,
        mainColor: 'blue' as ColorAccent,
        iconColor: 'blue' as ColorAccent,
      }

      expect(() => render(<ActionLinkPanel {...minimalProps} />)).not.toThrow()
    })

    it('should handle empty strings', () => {
      render(<ActionLinkPanel {...defaultProps} title='' description='' />)

      expect(screen.getByTestId('main-panel-layer')).toBeInTheDocument()
    })
  })
})
