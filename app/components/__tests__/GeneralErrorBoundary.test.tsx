import React from 'react'
import { isRouteErrorResponse, MemoryRouter, useRouteError } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { GeneralErrorBoundary } from '../GeneralErrorBoundary'

// We don't need the TestErrorBoundary as we're no longer mocking the component itself

// Mock React Router hooks using the importOriginal helper
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useRouteError: vi.fn(),
    useParams: vi.fn(() => ({})),
    isRouteErrorResponse: vi.fn(),
  }
})

// Simple mock for i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('GeneralErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render route error with default status handler for 404', () => {
    // Setup
    // Create a simplified mock error without using the 'data' identifier
    const mockError = {
      status: 404,
      statusText: 'Not Found',
    }

    vi.mocked(useRouteError).mockReturnValue(mockError)
    vi.mocked(isRouteErrorResponse).mockReturnValue(true)

    // Render
    render(
      <MemoryRouter>
        <GeneralErrorBoundary />
      </MemoryRouter>
    )

    // Assert
    expect(screen.getByText('errors.notFoundTitle')).toBeInTheDocument()
    expect(screen.getByText('auth.errors.notFound')).toBeInTheDocument()
    expect(screen.getByText('common.backToHome')).toBeInTheDocument()
  })

  it('should render route error with default status handler for other status', () => {
    // Setup
    // Make sure we include both statusText and data for the component to display properly
    const mockError = {
      status: 500,
      statusText: 'Server Error',
      data: 'Internal Server Error',
    }

    vi.mocked(useRouteError).mockReturnValue(mockError)
    vi.mocked(isRouteErrorResponse).mockReturnValue(true)

    // Render
    render(
      <MemoryRouter>
        <GeneralErrorBoundary />
      </MemoryRouter>
    )

    // Assert
    expect(screen.getByText('errors.errorTitle')).toBeInTheDocument()
    // This one will still show the combined status and error text since it's constructed in the component
    expect(screen.getByText('500 Internal Server Error')).toBeInTheDocument()
    expect(screen.getByText('common.backToHome')).toBeInTheDocument()
  })

  it('should render with custom status handler when provided', () => {
    // Setup
    // Create a simplified mock error without using the 'data' identifier
    const mockError = {
      status: 403,
      statusText: 'Forbidden',
    }

    vi.mocked(useRouteError).mockReturnValue(mockError)
    vi.mocked(isRouteErrorResponse).mockReturnValue(true)

    const customStatusHandler = vi.fn().mockReturnValue(<div>Custom 403 handler</div>)

    // Render
    render(<GeneralErrorBoundary statusHandlers={{ 403: customStatusHandler }} />)

    // Assert
    expect(customStatusHandler).toHaveBeenCalledWith({
      error: mockError,
      params: {},
    })
    expect(screen.getByText('Custom 403 handler')).toBeInTheDocument()
  })

  it('should render with unexpected error handler for non-route errors', () => {
    // Setup
    const mockError = new Error('Test error')

    vi.mocked(useRouteError).mockReturnValue(mockError)
    vi.mocked(isRouteErrorResponse).mockReturnValue(false)

    // Render
    render(
      <MemoryRouter>
        <GeneralErrorBoundary />
      </MemoryRouter>
    )

    // Assert
    expect(screen.getByText('errors.errorTitle')).toBeInTheDocument()
    // The error message will be the actual error message from the Error object
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByText('common.backToHome')).toBeInTheDocument()
  })

  it('should render with custom unexpected error handler when provided', () => {
    // Setup
    const mockError = new Error('Custom error')

    vi.mocked(useRouteError).mockReturnValue(mockError)
    vi.mocked(isRouteErrorResponse).mockReturnValue(false)

    const customUnexpectedErrorHandler = vi
      .fn()
      .mockReturnValue(<div>Custom unexpected error handler</div>)

    // Render
    render(
      <GeneralErrorBoundary unexpectedErrorHandler={customUnexpectedErrorHandler} />
    )

    // Assert
    expect(customUnexpectedErrorHandler).toHaveBeenCalledWith(mockError)
    expect(screen.getByText('Custom unexpected error handler')).toBeInTheDocument()
  })
})
