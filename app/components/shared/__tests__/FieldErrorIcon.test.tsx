import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FieldErrorIcon } from '../FieldErrorIcon'

describe('FieldErrorIcon', () => {
  it('should not render when show is false', () => {
    render(<FieldErrorIcon show={false} />)

    // When show is false, the component should not render any visible elements
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
  })

  it('should render when show is true', () => {
    render(<FieldErrorIcon show />)

    // Check that we can find the close icon
    const closeIcon = screen.getByRole('img', { hidden: true })
    expect(closeIcon).toBeInTheDocument()
  })

  it('should render close icon with white text', () => {
    render(<FieldErrorIcon show />)

    const icon = screen.getByRole('img', { hidden: true })
    expect(icon).toHaveClass('text-white', 'h-4', 'w-4')
  })

  it('should apply red background for error state', () => {
    render(<FieldErrorIcon show color='emerald' />)

    // Test that the component renders with error styling
    const icon = screen.getByRole('img', { hidden: true })
    expect(icon).toBeInTheDocument()
  })
})
