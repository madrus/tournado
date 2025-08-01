import { useTranslation } from 'react-i18next'

import { render, screen, waitFor } from '@testing-library/react'

import { vi } from 'vitest'

import ErrorBoundary from '../ErrorBoundary'

// Mock the useTranslation hook
vi.mock('react-i18next', async importOriginal => {
  const original = await importOriginal()
  return {
    ...original,
    useTranslation: vi.fn(() => ({
      t: vi.fn(key => key), // Mock t function to return the key
      i18n: { language: 'en' },
    })),
  }
})

describe('ErrorBoundary', () => {
  const ProblemChild = () => {
    throw new Error('Test error')
  }

  it('should render fallback UI when an error occurs', async () => {
    const onErrorMock = vi.fn()
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ProblemChild />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('errors.panelErrorTitle')).toBeInTheDocument()
    expect(screen.getByText('errors.panelErrorBody')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
  })

  it('should render children when no error occurs', () => {
    const onErrorMock = vi.fn()
    render(
      <ErrorBoundary onError={onErrorMock}>
        <div>No error here</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('No error here')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onErrorMock).not.toHaveBeenCalled()
  })
})
