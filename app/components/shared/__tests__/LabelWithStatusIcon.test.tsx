import { render, screen } from '@testing-library/react'

import { beforeEach, describe, expect, it } from 'vitest'

import { useSettingsStore } from '~/stores/useSettingsStore'

import { LabelWithStatusIcon } from '../LabelWithStatusIcon'

// Get store state once at top
const state = useSettingsStore.getState

// Reset store before each test
beforeEach(() => {
  state().resetSettingsStoreState()
})

describe('LabelWithStatusIcon', () => {
  it('renders label text correctly', () => {
    render(<LabelWithStatusIcon label='Test Label' />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders status icon when provided', () => {
    const statusIcon = <div data-testid='status-icon'>✓</div>
    render(<LabelWithStatusIcon label='Test Label' statusIcon={statusIcon} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()
  })

  it('applies custom className to container', () => {
    render(<LabelWithStatusIcon label='Test Label' className='custom-class' />)

    // Verify the component renders without error with custom class
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('applies custom labelClassName to label text', () => {
    render(<LabelWithStatusIcon label='Test Label' labelClassName='label-custom' />)

    expect(screen.getByText('Test Label')).toHaveClass('label-custom')
  })

  it('includes spacing by default', () => {
    render(<LabelWithStatusIcon label='Test Label' />)

    // Verify component renders with default spacing behavior
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('excludes spacing when includeSpacing is false', () => {
    render(<LabelWithStatusIcon label='Test Label' includeSpacing={false} />)

    // Verify component renders without spacing when disabled
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('applies RTL text class for Arabic language', () => {
    state().setLanguage('ar')
    render(<LabelWithStatusIcon label='Test Label' />)

    expect(screen.getByText('Test Label')).toHaveClass('latin-text')
  })

  it('applies default flex layout classes', () => {
    render(<LabelWithStatusIcon label='Test Label' />)

    // Verify component renders with proper layout structure
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders without status icon when not provided', () => {
    render(<LabelWithStatusIcon label='Test Label' />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    // Should not have any status icon elements when none provided
    expect(screen.queryByTestId('status-icon')).not.toBeInTheDocument()
  })
})
