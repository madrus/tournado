import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { ToggleChipsField } from '../ToggleChipsField'

// Mock the helper functions
vi.mock('~/lib/lib.helpers', async importOriginal => {
  const actual = await importOriginal<typeof import('~/lib/lib.helpers')>()
  return {
    ...actual,
    getCurrentDivisionLabel: vi.fn(division => `Division ${division}`),
    getCurrentCategoryLabel: vi.fn(category => `Category ${category}`),
  }
})

describe('ToggleChipsField', () => {
  const state = useSettingsStore.getState

  const defaultProps = {
    items: ['item1', 'item2', 'item3'],
    type: 'divisions' as const,
    selectedValues: [],
    onToggle: vi.fn(),
    label: 'Select items',
    color: 'emerald' as const,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    state().resetSettingsStoreState()
  })

  it('renders label correctly', () => {
    render(<ToggleChipsField {...defaultProps} />)

    expect(screen.getByText('Select items')).toBeInTheDocument()
  })

  it('renders all toggle chips', () => {
    render(<ToggleChipsField {...defaultProps} />)

    expect(screen.getByText('Division item1')).toBeInTheDocument()
    expect(screen.getByText('Division item2')).toBeInTheDocument()
    expect(screen.getByText('Division item3')).toBeInTheDocument()
  })

  it('shows success status when items are selected and required', () => {
    render(
      <ToggleChipsField {...defaultProps} selectedValues={['item1']} required={true} />,
    )

    // Check that success status icon is rendered (green checkmark)
    const statusIcon = screen.getByTestId('field-status-success')
    expect(statusIcon).toBeInTheDocument()
  })

  it('shows error status when no items selected and required', () => {
    render(
      <ToggleChipsField
        {...defaultProps}
        selectedValues={[]}
        required={true}
        error='This field is required'
      />,
    )

    // Check that error status icon is rendered (red cross)
    const statusIcon = screen.getByTestId('field-status-error')
    expect(statusIcon).toBeInTheDocument()
  })

  it('shows neutral status when disabled', () => {
    render(<ToggleChipsField {...defaultProps} disabled={true} required={true} />)

    // Check that no status icon is rendered for neutral state
    expect(screen.queryByTestId('field-status-success')).not.toBeInTheDocument()
    expect(screen.queryByTestId('field-status-error')).not.toBeInTheDocument()
    expect(screen.queryByTestId('field-status-neutral')).not.toBeInTheDocument()
  })

  it('shows neutral status for optional field with no selection', () => {
    render(<ToggleChipsField {...defaultProps} selectedValues={[]} required={false} />)

    // Check that no status icon is rendered for neutral state
    expect(screen.queryByTestId('field-status-success')).not.toBeInTheDocument()
    expect(screen.queryByTestId('field-status-error')).not.toBeInTheDocument()
    expect(screen.queryByTestId('field-status-neutral')).not.toBeInTheDocument()
  })

  it('calls onToggle when chip is clicked', () => {
    const onToggle = vi.fn()
    render(<ToggleChipsField {...defaultProps} onToggle={onToggle} />)

    fireEvent.click(screen.getByText('Division item1'))

    expect(onToggle).toHaveBeenCalledWith('item1')
  })

  it('renders selected chips correctly', () => {
    render(<ToggleChipsField {...defaultProps} selectedValues={['item1', 'item3']} />)

    // Get all checkboxes and verify their states by position
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked() // item1 - first checkbox
    expect(checkboxes[1]).not.toBeChecked() // item2 - second checkbox
    expect(checkboxes[2]).toBeChecked() // item3 - third checkbox
  })

  it('disables all chips when disabled prop is true', () => {
    render(<ToggleChipsField {...defaultProps} disabled={true} />)

    const chips = screen.getAllByRole('checkbox')
    chips.forEach(chip => {
      expect(chip).toBeDisabled()
    })
  })

  it('renders error message when provided', () => {
    render(<ToggleChipsField {...defaultProps} error='This field is required' />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('uses correct test ids for divisions', () => {
    render(<ToggleChipsField {...defaultProps} type='divisions' />)

    expect(screen.getByTestId('division-item1')).toBeInTheDocument()
    expect(screen.getByTestId('division-item2')).toBeInTheDocument()
    expect(screen.getByTestId('division-item3')).toBeInTheDocument()
  })

  it('uses correct test ids for categories', () => {
    render(
      <ToggleChipsField {...defaultProps} type='categories' items={['cat1', 'cat2']} />,
    )

    expect(screen.getByTestId('category-cat1')).toBeInTheDocument()
    expect(screen.getByTestId('category-cat2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ToggleChipsField {...defaultProps} className='custom-class' />)

    // Verify the component renders without error with custom class
    expect(screen.getByText('Select items')).toBeInTheDocument()
    expect(screen.getByText('Division item1')).toBeInTheDocument()
  })

  it('renders labels with proper language formatting', () => {
    render(<ToggleChipsField {...defaultProps} />)

    // Verify that division labels are rendered correctly
    expect(screen.getByText('Division item1')).toBeInTheDocument()
  })
})
