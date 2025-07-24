import { render, screen } from '@testing-library/react'

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
