import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, test, vi } from 'vitest'

import NotFoundPage, { ErrorBoundary } from '~/routes/$'

// Mock useLocation
const mockLocation = {
  pathname: '/non-existent-path',
  search: '',
  hash: '',
  state: null,
  key: 'test',
}

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLocation: () => mockLocation,
  }
})

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

// Mock GeneralErrorBoundary
vi.mock('~/components/GeneralErrorBoundary', () => ({
  GeneralErrorBoundary: ({
    statusHandlers,
  }: {
    statusHandlers?: Record<number, () => React.ReactNode>
  }) => {
    // Simulate 404 error condition
    const handler404 = statusHandlers?.[404]
    if (handler404) {
      return <div data-testid='general-error-boundary'>{handler404()}</div>
    }
    return <div data-testid='general-error-boundary'>Default Error</div>
  },
}))

// Mock ErrorRecoveryLink
vi.mock('~/components/PrefetchLink', () => ({
  ErrorRecoveryLink: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className} data-testid='error-recovery-link'>
      {children}
    </a>
  ),
}))

describe('Catch-all Route ($)', () => {
  describe('NotFoundPage Component', () => {
    test('should render ErrorBoundary component', () => {
      render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      )

      expect(screen.getByTestId('general-error-boundary')).toBeInTheDocument()
    })

    test('should be a fallback that renders error boundary', () => {
      // The NotFoundPage component should only render ErrorBoundary
      // because the loader throws a 404 Response
      render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      )

      // Should render the error boundary, not any other content
      expect(screen.getByTestId('general-error-boundary')).toBeInTheDocument()
    })
  })

  describe('ErrorBoundary Component', () => {
    test('should render 404 error message', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      expect(screen.getByText("We can't find this page:")).toBeInTheDocument()
    })

    test('should display the current pathname', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      expect(screen.getByText('/non-existent-path')).toBeInTheDocument()
    })

    test('should render back to home link', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const homeLink = screen.getByTestId('error-recovery-link')
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
      expect(homeLink).toHaveTextContent('Back to home')
    })

    test('should use GeneralErrorBoundary with 404 status handler', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      // Should render the GeneralErrorBoundary component
      expect(screen.getByTestId('general-error-boundary')).toBeInTheDocument()
    })
  })

  describe('Error Message Structure', () => {
    test('should organize error content in logical sections', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const container = screen.getByTestId('general-error-boundary')
      const content = container.textContent || ''

      // Verify content flows logically
      expect(content.indexOf("We can't find this page:")).toBeLessThan(
        content.indexOf('/non-existent-path')
      )
      expect(content.indexOf('/non-existent-path')).toBeLessThan(
        content.indexOf('Back to home')
      )
    })

    test('should display pathname in preformatted text', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const pathDisplay = screen.getByText('/non-existent-path')
      expect(pathDisplay.tagName.toLowerCase()).toBe('pre')
    })

    test('should style pathname display correctly', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const pathDisplay = screen.getByText('/non-existent-path')
      expect(pathDisplay).toHaveClass(
        'text-lg',
        'break-all',
        'whitespace-pre-wrap',
        'text-foreground'
      )
    })
  })

  describe('Navigation and Recovery', () => {
    test('should provide clear path back to home', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const homeLink = screen.getByTestId('error-recovery-link')
      expect(homeLink).toHaveAttribute('href', '/')
      expect(homeLink).toHaveClass('text-base', 'underline', 'text-foreground')
    })

    test('should have accessible link text', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const homeLink = screen.getByRole('link', { name: /back to home/i })
      expect(homeLink).toBeInTheDocument()
    })
  })

  describe('Pathname Display', () => {
    test('should display the pathname from useLocation', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      // Should display the mocked pathname
      expect(screen.getByText('/non-existent-path')).toBeInTheDocument()
    })

    test('should handle pathname structure correctly', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      // The component should work with any pathname structure
      // Since we mock useLocation, it will always show the mocked path
      expect(screen.getByText('/non-existent-path')).toBeInTheDocument()
    })
  })

  describe('Error Boundary Integration', () => {
    test('should pass 404 status handler to GeneralErrorBoundary', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      // The 404 content should be rendered through the status handler
      expect(screen.getByText("We can't find this page:")).toBeInTheDocument()
      expect(screen.getByText('/non-existent-path')).toBeInTheDocument()
      expect(screen.getByTestId('error-recovery-link')).toBeInTheDocument()
    })

    test('should render error boundary with proper structure', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const errorBoundary = screen.getByTestId('general-error-boundary')
      expect(errorBoundary).toBeInTheDocument()

      // Should contain the 404 content
      expect(errorBoundary).toHaveTextContent("We can't find this page:")
      expect(errorBoundary).toHaveTextContent('/non-existent-path')
      expect(errorBoundary).toHaveTextContent('Back to home')
    })
  })

  describe('Accessibility', () => {
    test('should have accessible error message', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      // Should have clear error communication
      expect(screen.getByText("We can't find this page:")).toBeInTheDocument()
    })

    test('should have semantic HTML structure', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      // Should have proper link
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()

      // Should display the problematic path clearly
      const pathDisplay = screen.getByText('/non-existent-path')
      expect(pathDisplay).toBeInTheDocument()
    })
  })

  describe('Content Layout', () => {
    test('should organize content in logical flow', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      // Based on the actual implementation, the content should be in sections
      expect(screen.getByText("We can't find this page:")).toBeInTheDocument()
      expect(screen.getByText('/non-existent-path')).toBeInTheDocument()
      expect(screen.getByTestId('error-recovery-link')).toBeInTheDocument()
    })

    test('should separate title section from path section', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      )

      const title = screen.getByText("We can't find this page:")
      const path = screen.getByText('/non-existent-path')

      // They should be separate elements
      expect(title).not.toBe(path)
      // Title and path should have different content, even if same container
      if (path.textContent) {
        expect(title).not.toHaveTextContent(path.textContent)
      }
    })
  })
})
