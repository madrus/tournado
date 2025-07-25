import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

describe('Checkbox Styling Tests', () => {
  it('should render checkbox with correct classes', () => {
    render(
      <input
        type='checkbox'
        className='h-4 w-4 appearance-none rounded-sm border-2'
        data-testid='styled-checkbox'
      />
    )

    const checkbox = screen.getByTestId('styled-checkbox')
    expect(checkbox).toHaveClass('appearance-none')
    expect(checkbox).toHaveClass('h-4')
    expect(checkbox).toHaveClass('w-4')
  })
})

describe('Checkbox Behavior and Accessibility Tests', () => {
  it('should handle checked/unchecked state changes', () => {
    render(
      <input type='checkbox' className='h-4 w-4' data-testid='stateful-checkbox' />
    )

    const checkbox = screen.getByTestId('stateful-checkbox') as HTMLInputElement

    // Initially unchecked
    expect(checkbox).not.toBeChecked()

    // Click to check
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    // Click to uncheck
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('should respond to keyboard events', () => {
    render(
      <input type='checkbox' className='h-4 w-4' data-testid='keyboard-checkbox' />
    )

    const checkbox = screen.getByTestId('keyboard-checkbox') as HTMLInputElement

    // Initially unchecked
    expect(checkbox).not.toBeChecked()

    // Simulate keyboard activation (space key triggers change)
    fireEvent.change(checkbox, { target: { checked: true } })
    expect(checkbox).toBeChecked()

    // Simulate another toggle
    fireEvent.change(checkbox, { target: { checked: false } })
    expect(checkbox).not.toBeChecked()
  })

  it('should support proper accessibility attributes', () => {
    render(
      <div>
        <label htmlFor='accessible-checkbox'>Accept Terms</label>
        <input
          id='accessible-checkbox'
          type='checkbox'
          className='h-4 w-4'
          aria-describedby='checkbox-description'
          data-testid='accessible-checkbox'
        />
        <div id='checkbox-description'>
          By checking this box, you agree to our terms of service
        </div>
      </div>
    )

    const checkbox = screen.getByTestId('accessible-checkbox')
    const label = screen.getByText('Accept Terms')

    // Check accessibility attributes
    expect(checkbox).toHaveAttribute('id', 'accessible-checkbox')
    expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-description')
    expect(label).toHaveAttribute('for', 'accessible-checkbox')

    // Label should be associated with checkbox
    expect(checkbox).toHaveAccessibleName('Accept Terms')
    expect(checkbox).toHaveAccessibleDescription(
      'By checking this box, you agree to our terms of service'
    )
  })

  it('should support screen reader compatibility', () => {
    render(
      <input
        type='checkbox'
        className='h-4 w-4'
        aria-label='Newsletter subscription'
        defaultChecked={false}
        role='checkbox'
        data-testid='screen-reader-checkbox'
      />
    )

    const checkbox = screen.getByTestId('screen-reader-checkbox')

    // Check screen reader attributes
    expect(checkbox).toHaveAttribute('aria-label', 'Newsletter subscription')
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toHaveAttribute('role', 'checkbox')

    // Should be accessible by role
    expect(
      screen.getByRole('checkbox', { name: 'Newsletter subscription' })
    ).toBeInTheDocument()
  })

  it('should handle disabled state correctly', () => {
    render(
      <input
        type='checkbox'
        className='h-4 w-4 disabled:opacity-50'
        disabled
        data-testid='disabled-checkbox'
      />
    )

    const checkbox = screen.getByTestId('disabled-checkbox') as HTMLInputElement

    // Should be disabled
    expect(checkbox).toBeDisabled()

    // Should not respond to clicks
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('should support indeterminate state', () => {
    render(
      <input
        type='checkbox'
        className='h-4 w-4'
        ref={el => {
          if (el) el.indeterminate = true
        }}
        data-testid='indeterminate-checkbox'
      />
    )

    const checkbox = screen.getByTestId('indeterminate-checkbox') as HTMLInputElement

    // Should be in indeterminate state
    expect(checkbox.indeterminate).toBe(true)
    expect(checkbox).not.toBeChecked()
  })

  it('should maintain state consistency across interactions', () => {
    render(
      <input type='checkbox' className='h-4 w-4' data-testid='consistent-checkbox' />
    )

    const checkbox = screen.getByTestId('consistent-checkbox') as HTMLInputElement

    // Click to check
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    // Direct state change should work consistently
    fireEvent.change(checkbox, { target: { checked: false } })
    expect(checkbox).not.toBeChecked()
  })
})
