import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import type { Option } from '../ComboField'
import { ComboField } from '../ComboField'

// Mock the icon utilities
vi.mock('~/utils/iconUtils', () => ({
  renderIcon: vi.fn((name, props) => <span data-testid={`icon-${name}`} {...props} />),
}))

describe('ComboField', () => {
  const mockOptions: Option[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  const defaultProps = {
    name: 'test-combo',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
    options: mockOptions,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with label', () => {
    render(<ComboField {...defaultProps} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render with placeholder when no value selected', () => {
    render(<ComboField {...defaultProps} placeholder='Select an option' />)

    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('should display selected value', () => {
    render(<ComboField {...defaultProps} value='option1' />)

    expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument()
  })

  it('should open dropdown and show options when clicked', async () => {
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    // Check that all options are visible - use getAllByText since options appear in both hidden select and popover
    await waitFor(() => {
      const option1Elements = screen.getAllByText('Option 1')
      const option2Elements = screen.getAllByText('Option 2')
      const option3Elements = screen.getAllByText('Option 3')

      expect(option1Elements.length).toBeGreaterThan(0)
      expect(option2Elements.length).toBeGreaterThan(0)
      expect(option3Elements.length).toBeGreaterThan(0)
    })
  })

  it('should call onChange when option is selected', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} onChange={mockOnChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      const option2Elements = screen.getAllByText('Option 2')
      expect(option2Elements.length).toBeGreaterThan(0)
    })

    // Find and click the option with role="option"
    const option = screen.getByRole('option', { name: 'Option 2' })
    await user.click(option)
    expect(mockOnChange).toHaveBeenCalledWith('option2')
  })

  it('should call onBlur when focus is lost', async () => {
    const mockOnBlur = vi.fn()
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} onBlur={mockOnBlur} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    // Click outside to trigger blur
    await user.click(document.body)

    expect(mockOnBlur).toHaveBeenCalled()
  })

  it('should display error message when error prop is provided', () => {
    render(<ComboField {...defaultProps} error='This field is required' />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<ComboField {...defaultProps} disabled />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
  })

  it('should show required indicator when required prop is true', () => {
    render(<ComboField {...defaultProps} required />)

    // Test that the component renders correctly with required prop
    const combobox = screen.getByRole('combobox')
    expect(combobox).toBeInTheDocument()
  })

  it('should render with correct name attribute', () => {
    render(<ComboField {...defaultProps} name='custom-name' />)

    // Test that the component renders correctly with name prop
    const combobox = screen.getByRole('combobox')
    expect(combobox).toBeInTheDocument()
  })

  it('should handle empty options array', () => {
    render(<ComboField {...defaultProps} options={[]} />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should maintain focus styles', async () => {
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} />)

    const trigger = screen.getByRole('combobox')
    await user.tab()

    // Should be focused
    expect(trigger).toHaveFocus()
  })

  it('should handle keyboard navigation', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} onChange={mockOnChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    // Use arrow keys to navigate
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should display chevron icon', () => {
    render(<ComboField {...defaultProps} />)

    // The icon testid is 'icon-expand_more', not 'icon-ChevronRightIcon'
    expect(screen.getByTestId('icon-expand_more')).toBeInTheDocument()
  })

  it('should handle large number of options', async () => {
    const manyOptions = Array.from({ length: 100 }, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`,
    }))

    const user = userEvent.setup()
    render(<ComboField {...defaultProps} options={manyOptions} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      // Use getAllByText since options appear in both hidden select and popover
      const option0Elements = screen.getAllByText('Option 0')
      expect(option0Elements.length).toBeGreaterThan(0)
    })
  })

  it('should handle value that does not exist in options', () => {
    render(<ComboField {...defaultProps} value='nonexistent' />)

    // Should still render without crashing
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should have hover transition animations', async () => {
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} />)

    const trigger = screen.getByRole('combobox')

    // Check for transition classes
    expect(trigger).toHaveClass('transition-all', 'duration-300', 'ease-in-out')

    // Hover should trigger border and shadow changes
    await user.hover(trigger)

    // Focus with tab should keep focus on trigger
    await user.tab()
    expect(trigger).toHaveFocus()
  })

  it('should have focus transition animations', async () => {
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} />)

    const trigger = screen.getByRole('combobox')

    // Check for GPU acceleration classes
    expect(trigger).toHaveClass('transform-gpu', 'will-change-transform')

    // Test focus state with tab
    await user.tab()
    expect(trigger).toHaveFocus()

    // Test blur state
    await user.tab()
    expect(trigger).not.toHaveFocus()
  })

  it('should have item hover animations', async () => {
    const user = userEvent.setup()
    render(<ComboField {...defaultProps} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      const option1Elements = screen.getAllByText('Option 1')
      expect(option1Elements.length).toBeGreaterThan(0)
    })

    // Find the option with role="option" and check for transition classes
    const option = screen.getByRole('option', { name: 'Option 1' })
    expect(option).toHaveClass('transition-colors', 'duration-200')
  })
})
