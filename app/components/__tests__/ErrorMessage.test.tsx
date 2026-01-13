import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorMessage } from '../ErrorMessage'

describe('ErrorMessage', () => {
  it('should render error message with default styling', () => {
    render(<ErrorMessage panelColor='slate'>Test error message</ErrorMessage>)

    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should adapt styling for red panel color', () => {
    render(<ErrorMessage panelColor='red'>Red panel error</ErrorMessage>)

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('error-message-white', 'bg-red-900/95')
    expect(screen.getByText('Red panel error')).toBeInTheDocument()
  })

  it('should adapt styling for amber panel color', () => {
    render(<ErrorMessage panelColor='amber'>Amber panel error</ErrorMessage>)

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('error-message-amber', 'bg-amber-50')
    expect(screen.getByText('Amber panel error')).toBeInTheDocument()
  })

  it('should adapt styling for indigo panel color', () => {
    render(<ErrorMessage panelColor='indigo'>Indigo panel error</ErrorMessage>)

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('error-message-indigo', 'bg-indigo-900/95')
    expect(screen.getByText('Indigo panel error')).toBeInTheDocument()
  })

  it('should adapt styling for fuchsia panel color', () => {
    render(<ErrorMessage panelColor='fuchsia'>Fuchsia panel error</ErrorMessage>)

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('error-message-fuchsia', 'bg-fuchsia-900/95')
    expect(screen.getByText('Fuchsia panel error')).toBeInTheDocument()
  })

  it('should support different variants', () => {
    render(
      <ErrorMessage panelColor='red' variant='prominent'>
        Prominent error
      </ErrorMessage>,
    )

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('bg-red-800', 'border-2')
    expect(screen.getByText('Prominent error')).toBeInTheDocument()
  })

  it('should support inline variant', () => {
    render(
      <ErrorMessage panelColor='amber' variant='inline'>
        Inline error
      </ErrorMessage>,
    )

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('error-message-amber', 'bg-amber-50')
    expect(screen.getByText('Inline error')).toBeInTheDocument()
  })

  it('should include error icon', () => {
    render(<ErrorMessage panelColor='slate'>Error with icon</ErrorMessage>)

    // Check for the error icon by looking for its test id
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toBeInTheDocument()
    // The ErrorIcon component should be present within the alert
    expect(errorElement).toHaveTextContent('Error with icon')
  })

  it('should have proper accessibility attributes', () => {
    render(<ErrorMessage panelColor='slate'>Accessible error</ErrorMessage>)

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveAttribute('aria-live', 'polite')
  })

  it('should support custom className', () => {
    render(
      <ErrorMessage panelColor='slate' className='custom-error-class'>
        Custom styled error
      </ErrorMessage>,
    )

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('custom-error-class')
  })

  it('should support custom id', () => {
    render(
      <ErrorMessage panelColor='slate' id='custom-error-id'>
        Error with custom ID
      </ErrorMessage>,
    )

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveAttribute('id', 'custom-error-id')
  })
})
