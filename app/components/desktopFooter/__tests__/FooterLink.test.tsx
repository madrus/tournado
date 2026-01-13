import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import FooterLink from '../FooterLink'

describe('FooterLink', () => {
  const defaultProps = {
    to: '/about',
    label: 'About Us',
  }

  describe('Basic Rendering', () => {
    it('should render link with correct content and href', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link', { name: 'About Us' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/about')
      expect(link).toHaveTextContent('About Us')
    })

    it('should render with different props', () => {
      const props = {
        to: '/contact',
        label: 'Contact',
      }

      render(
        <MemoryRouter>
          <FooterLink {...props} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link', { name: 'Contact' })
      expect(link).toHaveAttribute('href', '/contact')
      expect(link).toHaveTextContent('Contact')
    })
  })

  describe('CSS Classes', () => {
    it('should have default CSS classes', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'transition-colors',
        'text-foreground',
        'hover:text-foreground-darker',
      )
    })

    it('should apply custom className prop', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} className='font-bold underline' />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      // Test that both default and custom classes are present
      expect(link).toHaveClass('text-foreground')
      expect(link).toHaveClass('hover:text-foreground-darker')
      expect(link).toHaveClass('transition-colors')
      expect(link).toHaveClass('font-bold')
      expect(link).toHaveClass('underline')
    })

    it('should handle empty className prop', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} className='' />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'transition-colors',
        'text-foreground',
        'hover:text-foreground-darker',
      )
      // Should not have any additional classes
      expect(link).toHaveClass(
        'text-foreground hover:text-foreground-darker transition-colors',
        {
          exact: true,
        },
      )
    })

    it('should handle undefined className prop', () => {
      render(
        <MemoryRouter>
          <FooterLink to='/test' label='Test' />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass(
        'transition-colors',
        'text-foreground',
        'hover:text-foreground-darker',
      )
      // Should use default empty string
      expect(link).toHaveClass(
        'text-foreground hover:text-foreground-darker transition-colors',
        {
          exact: true,
        },
      )
    })
  })

  describe('Accessibility', () => {
    it('should be accessible by role and name', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link', { name: 'About Us' })
      expect(link).toBeInTheDocument()
    })

    it('should work with different labels for screen readers', () => {
      const testCases = [
        { to: '/', label: 'Home' },
        { to: '/privacy', label: 'Privacy Policy' },
        { to: '/terms', label: 'Terms of Service' },
        { to: '/support', label: 'Customer Support' },
      ]

      testCases.forEach(({ to, label }) => {
        const { unmount } = render(
          <MemoryRouter>
            <FooterLink to={to} label={label} />
          </MemoryRouter>,
        )

        const link = screen.getByRole('link', { name: label })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', to)

        unmount()
      })
    })
  })

  describe('Props Handling', () => {
    it('should handle various route patterns', () => {
      const routeTestCases = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/contact/support', label: 'Support' },
        { to: '/products/category/item', label: 'Item' },
        { to: '/external-link', label: 'External' },
      ]

      routeTestCases.forEach(({ to, label }) => {
        const { unmount } = render(
          <MemoryRouter>
            <FooterLink to={to} label={label} />
          </MemoryRouter>,
        )

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', to)
        expect(link).toHaveTextContent(label)

        unmount()
      })
    })

    it('should handle special characters in labels', () => {
      const specialLabels = [
        'About & Contact',
        'Terms/Conditions',
        'FAQ (Frequently Asked Questions)',
        'Privacy - Policy',
        'Support 24/7',
      ]

      specialLabels.forEach(label => {
        const { unmount } = render(
          <MemoryRouter>
            <FooterLink to='/test' label={label} />
          </MemoryRouter>,
        )

        const link = screen.getByRole('link', { name: label })
        expect(link).toHaveTextContent(label)

        unmount()
      })
    })
  })

  describe('Styling Integration', () => {
    it('should combine default and custom classes correctly', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} className='custom-class another-class' />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      const classNames = link.className.split(' ')

      // Should contain both default and custom classes
      expect(classNames).toContain('transition-colors')
      expect(classNames).toContain('text-foreground')
      expect(classNames).toContain('hover:text-foreground-darker')
      expect(classNames).toContain('custom-class')
      expect(classNames).toContain('another-class')
    })

    it('should apply hover effect class', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('hover:text-foreground-darker')
    })

    it('should apply transition class for smooth interactions', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('transition-colors')
    })
  })

  describe('Component Type and Structure', () => {
    it('should render as a Link component from react-router', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      // Should be a react-router Link (rendered as <a> in test environment)
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href')
    })

    it('should have proper DOM structure', () => {
      render(
        <MemoryRouter>
          <FooterLink {...defaultProps} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveTextContent(defaultProps.label)
      // Check structure using Testing Library methods instead of direct node access
      expect(link).toHaveTextContent(defaultProps.label)
      expect(link).not.toContainHTML('<')
    })
  })

  describe('Default Props Behavior', () => {
    it('should use empty string as default className', () => {
      // Test the default parameter functionality
      render(
        <MemoryRouter>
          <FooterLink to='/test' label='Test' />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link')
      // Should have default classes plus the default empty string
      expect(link).toHaveClass(
        'text-foreground hover:text-foreground-darker transition-colors',
        {
          exact: true,
        },
      )
    })
  })
})
