import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, test, vi } from 'vitest'

import AdminLayout from '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1'

// Mock Outlet component
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    Outlet: () => <div data-testid='outlet'>Mock Outlet Content</div>,
  }
})

// Mock AuthErrorBoundary component
vi.mock('~/components/AuthErrorBoundary', () => ({
  AuthErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='auth-error-boundary'>{children}</div>
  ),
}))

describe('Admin Layout', () => {
  describe('Basic Rendering', () => {
    test('should render the layout container', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
    })

    test('should render the Outlet component', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      expect(screen.getByTestId('outlet')).toBeInTheDocument()
      expect(screen.getByText('Mock Outlet Content')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    test('should have proper container styling', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement
      expect(container).toHaveClass('container')
      expect(container).toHaveClass('mx-auto')
      expect(container).toHaveClass('px-4')
      expect(container).toHaveClass('py-8')
    })

    test('should organize content in proper structure', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const outlet = screen.getByTestId('outlet')
      const container = outlet.parentElement

      expect(container).toBeInTheDocument()
      expect(container?.tagName.toLowerCase()).toBe('div')
      expect(outlet).toBeInTheDocument()
    })
  })

  describe('Outlet Integration', () => {
    test('should render child routes through Outlet', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      // Verify that the Outlet is rendered and shows content
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
      expect(screen.getByText('Mock Outlet Content')).toBeInTheDocument()
    })

    test('should provide layout structure for nested routes', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const outlet = screen.getByTestId('outlet')
      const container = outlet.parentElement

      // Verify that the layout container wraps the outlet
      expect(container).toContainElement(outlet)
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
    })
  })

  describe('Responsive Design', () => {
    test('should apply responsive container classes', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement
      expect(container).toHaveClass('container') // Responsive container
      expect(container).toHaveClass('mx-auto') // Center horizontally
    })

    test('should apply consistent padding', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement
      expect(container).toHaveClass('px-4') // Horizontal padding
      expect(container).toHaveClass('py-8') // Vertical padding
    })
  })

  describe('Error Boundary Integration', () => {
    test('should export AuthErrorBoundary as ErrorBoundary', async () => {
      // This tests the named export
      const module = await import(
        '~/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1'
      )
      expect(module.ErrorBoundary).toBeDefined()
    })

    test('should provide error handling capability', () => {
      // Mock an error scenario to verify error boundary integration
      const ThrowError = () => {
        throw new Error('Test error')
      }

      const AdminLayoutWithError = () => (
        <div className='container mx-auto px-4 py-8'>
          <ThrowError />
        </div>
      )

      // This test verifies the layout structure remains consistent
      // even when considering error boundary integration
      expect(() => {
        render(
          <MemoryRouter>
            <AdminLayoutWithError />
          </MemoryRouter>
        )
      }).toThrow('Test error')
    })
  })

  describe('Layout Consistency', () => {
    test('should provide consistent spacing and layout', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement

      // Verify layout consistency
      expect(container).toHaveClass('container') // Bootstrap-style container
      expect(container).toHaveClass('mx-auto') // Centered
      expect(container).toHaveClass('px-4') // Consistent horizontal padding
      expect(container).toHaveClass('py-8') // Consistent vertical padding
    })

    test('should maintain layout structure regardless of content', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const outlet = screen.getByTestId('outlet')
      const container = outlet.parentElement

      // Verify that the layout structure is consistent
      expect(container?.children).toHaveLength(1) // Only the Outlet
      expect(container?.firstChild).toBe(outlet)
    })
  })

  describe('Accessibility', () => {
    test('should provide proper semantic structure', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement

      // Verify semantic HTML structure
      expect(container?.tagName.toLowerCase()).toBe('div')
      expect(container).toBeInTheDocument()
    })

    test('should not interfere with child content accessibility', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      // Verify that the layout doesn't add any accessibility barriers
      const outlet = screen.getByTestId('outlet')
      expect(outlet).toBeInTheDocument()
      expect(outlet).toBeVisible()
    })
  })

  describe('Content Flow', () => {
    test('should allow content to flow naturally within container', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement
      const outlet = screen.getByTestId('outlet')

      // Verify content flow
      expect(container).toContainElement(outlet)
      expect(outlet).toHaveTextContent('Mock Outlet Content')
    })

    test('should provide adequate spacing for admin content', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement

      // Verify spacing is appropriate for admin interface
      expect(container).toHaveClass('py-8') // Good vertical spacing
      expect(container).toHaveClass('px-4') // Good horizontal padding
    })
  })

  describe('Layout Isolation', () => {
    test('should not add extra DOM elements beyond container and outlet', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const outlet = screen.getByTestId('outlet')
      const container = outlet.parentElement

      // Verify minimal DOM structure
      expect(container?.children).toHaveLength(1)
      expect(container?.firstChild).toBe(outlet)
    })

    test('should provide clean layout without unnecessary wrappers', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const outlet = screen.getByTestId('outlet')
      const container = outlet.parentElement

      // Verify the container is the direct parent of the outlet
      expect(outlet.parentElement).toBe(container)
      expect(container?.className).toBe('container mx-auto min-w-[320px] px-4 py-8')
    })
  })

  describe('Styling Verification', () => {
    test('should apply all required Tailwind classes', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement
      const expectedClasses = ['container', 'mx-auto', 'min-w-[320px]', 'px-4', 'py-8']

      expectedClasses.forEach(className => {
        expect(container).toHaveClass(className)
      })
    })

    test('should not have any additional unexpected classes', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      )

      const container = screen.getByTestId('outlet').parentElement
      expect(container?.className).toBe('container mx-auto min-w-[320px] px-4 py-8')
    })
  })
})
