import { render, screen } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { FieldStatusIcon } from '../FieldStatusIcon'

describe('FieldStatusIcon', () => {
  it('should render nothing when status is neutral', () => {
    const { container } = render(<FieldStatusIcon status='neutral' />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render success icon when status is success', () => {
    render(<FieldStatusIcon status='success' />)

    const icon = screen.getByRole('img', { name: 'Check mark' })
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('inline-block')
  })

  it('should render error icon when status is error', () => {
    render(<FieldStatusIcon status='error' />)

    const icon = screen.getByRole('img', { name: 'Close' })
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('inline-block')
  })

  it('should apply custom className to container', () => {
    render(<FieldStatusIcon status='success' className='custom-class' />)

    const iconContainer = screen.getByTestId('field-status-success')
    expect(iconContainer).toBeInTheDocument()
    expect(iconContainer).toHaveClass('checkmark-emerald', 'custom-class')
  })

  it('should always use emerald background for success status with inline positioning', () => {
    render(<FieldStatusIcon status='success' />)

    const iconContainer = screen.getByTestId('field-status-success')
    expect(iconContainer).toBeInTheDocument()
    expect(iconContainer).toHaveClass(
      'flex',
      'h-6',
      'w-6',
      'items-center',
      'justify-center',
      'rounded-full',
      'checkmark-emerald'
    )
  })

  it('should always use red background for error status with inline positioning', () => {
    render(<FieldStatusIcon status='error' />)

    const iconContainer = screen.getByTestId('field-status-error')
    expect(iconContainer).toBeInTheDocument()
    expect(iconContainer).toHaveClass(
      'flex',
      'h-6',
      'w-6',
      'items-center',
      'justify-center',
      'rounded-full',
      'field-error-icon'
    )
  })

  it('should use inline positioning for all field types', () => {
    render(<FieldStatusIcon status='success' />)

    const iconContainer = screen.getByTestId('field-status-success')
    expect(iconContainer).toHaveClass(
      'flex',
      'h-6',
      'w-6',
      'items-center',
      'justify-center',
      'rounded-full',
      'checkmark-emerald'
    )
  })

  it('should have proper layout classes for inline positioning', () => {
    render(<FieldStatusIcon status='success' />)

    const iconContainer = screen.getByTestId('field-status-success')
    expect(iconContainer).toHaveClass(
      'flex',
      'h-6',
      'w-6',
      'items-center',
      'justify-center',
      'rounded-full'
    )
  })

  it('should render error icon with consistent inline positioning', () => {
    render(<FieldStatusIcon status='error' />)

    const iconContainer = screen.getByTestId('field-status-error')
    expect(iconContainer).toHaveClass(
      'flex',
      'h-6',
      'w-6',
      'items-center',
      'justify-center',
      'rounded-full'
    )
  })

  it('should render with white text color for icons', () => {
    render(<FieldStatusIcon status='success' />)

    const icon = screen.getByRole('img', { name: 'Check mark' })
    expect(icon).toHaveClass('text-white')
  })
})
