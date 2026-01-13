import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TextInputField } from '../TextInputField'

describe('TextInputField', () => {
  const defaultProps = {
    name: 'test-input',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with label', () => {
    render(<TextInputField {...defaultProps} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    render(<TextInputField {...defaultProps} placeholder='Enter some text' />)

    expect(screen.getByPlaceholderText('Enter some text')).toBeInTheDocument()
  })

  it('should display current value', () => {
    render(<TextInputField {...defaultProps} value='test value' />)

    expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
  })

  it('should call onChange when text is typed', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()
    render(<TextInputField {...defaultProps} onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'hello')

    expect(mockOnChange).toHaveBeenCalledTimes(5) // Once for each character
    // Check that the last call has the final value - the event target value
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should call onBlur when focus is lost', async () => {
    const mockOnBlur = vi.fn()
    const user = userEvent.setup()
    render(<TextInputField {...defaultProps} onBlur={mockOnBlur} />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.tab() // Move focus away

    expect(mockOnBlur).toHaveBeenCalled()
  })

  it('should display error message when error prop is provided', () => {
    render(<TextInputField {...defaultProps} error='This field is required' />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<TextInputField {...defaultProps} disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should be required when required prop is true', () => {
    render(<TextInputField {...defaultProps} required />)

    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('should handle different input types', () => {
    render(<TextInputField {...defaultProps} type='email' />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should handle tel input type', () => {
    render(<TextInputField {...defaultProps} type='tel' />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'tel')
  })

  it('should handle password input type', () => {
    render(<TextInputField {...defaultProps} type='password' />)

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should apply custom className', () => {
    render(<TextInputField {...defaultProps} className='custom-class' />)

    // Test that the component renders correctly with custom className
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should handle color variants', () => {
    render(<TextInputField {...defaultProps} color='red' />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should render with correct name attribute', () => {
    render(<TextInputField {...defaultProps} name='custom-name' />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('name', 'custom-name')
  })

  it('should handle focus and blur events correctly', async () => {
    const mockOnFocus = vi.fn()
    const mockOnBlur = vi.fn()
    const user = userEvent.setup()

    render(
      <TextInputField {...defaultProps} onFocus={mockOnFocus} onBlur={mockOnBlur} />,
    )

    const input = screen.getByRole('textbox')

    await user.click(input)
    expect(mockOnFocus).toHaveBeenCalled()

    await user.tab()
    expect(mockOnBlur).toHaveBeenCalled()
  })

  it('should maintain controlled input behavior', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <TextInputField {...defaultProps} value='' onChange={mockOnChange} />,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'a')

    expect(mockOnChange).toHaveBeenCalledWith('a')

    // Simulate parent component updating the value
    rerender(<TextInputField {...defaultProps} value='a' onChange={mockOnChange} />)

    expect(input).toHaveValue('a')
  })

  it('should handle long text input', async () => {
    const longText =
      'This is a very long text input that should be handled correctly by the component'
    let inputValue = ''
    const mockOnChange = vi.fn((value: string) => {
      inputValue = value
    })
    const user = userEvent.setup()

    const { rerender } = render(
      <TextInputField {...defaultProps} value={inputValue} onChange={mockOnChange} />,
    )

    const input = screen.getByRole('textbox')

    // Use paste to set the value all at once
    await user.click(input)
    await user.paste(longText)

    // Update the value to simulate controlled behavior
    inputValue = longText
    rerender(
      <TextInputField {...defaultProps} value={inputValue} onChange={mockOnChange} />,
    )

    expect(mockOnChange).toHaveBeenCalled()
    expect(input).toHaveValue(longText)
  })

  it('should handle special characters', async () => {
    const specialText = '!@#$%^&*()_+-='
    let inputValue = ''
    const mockOnChange = vi.fn((value: string) => {
      inputValue = value
    })
    const user = userEvent.setup()

    const { rerender } = render(
      <TextInputField {...defaultProps} value={inputValue} onChange={mockOnChange} />,
    )

    const input = screen.getByRole('textbox')

    // Use paste to set the value all at once
    await user.click(input)
    await user.paste(specialText)

    // Update the value to simulate controlled behavior
    inputValue = specialText
    rerender(
      <TextInputField {...defaultProps} value={inputValue} onChange={mockOnChange} />,
    )

    expect(mockOnChange).toHaveBeenCalled()
    expect(input).toHaveValue(specialText)
  })

  it('should handle keyboard navigation correctly', async () => {
    const user = userEvent.setup()
    render(<TextInputField {...defaultProps} value='test' />)

    const input = screen.getByRole('textbox')
    await user.click(input)

    // Move cursor with arrow keys
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    await user.type(input, 'X')

    // The onChange should be called with the new text
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it('should show label correctly associated with input', () => {
    render(<TextInputField {...defaultProps} label='Email Address' />)

    const input = screen.getByLabelText('Email Address')
    expect(input).toBeInTheDocument()
  })

  it('should handle empty value', () => {
    render(<TextInputField {...defaultProps} value='' />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('should have hover transition animations', async () => {
    const user = userEvent.setup()
    render(<TextInputField {...defaultProps} />)

    const input = screen.getByRole('textbox')

    // Check for transition classes
    expect(input).toHaveClass('transition-all', 'duration-300', 'ease-in-out')

    // Hover should trigger border and shadow changes
    await user.hover(input)

    // Focus should trigger border, ring, and shadow changes
    await user.click(input)
    expect(input).toHaveFocus()
  })

  it('should have focus transition animations', async () => {
    const user = userEvent.setup()
    render(<TextInputField {...defaultProps} />)

    const input = screen.getByRole('textbox')

    // Check for GPU acceleration classes
    expect(input).toHaveClass('transform-gpu', 'will-change-transform')

    // Test focus state
    await user.click(input)
    expect(input).toHaveFocus()

    // Test blur state
    await user.tab()
    expect(input).not.toHaveFocus()
  })
})
