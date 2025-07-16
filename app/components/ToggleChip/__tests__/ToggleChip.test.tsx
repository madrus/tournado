import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ToggleChip } from '../ToggleChip'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
  }),
}))

describe('ToggleChip', () => {
  const defaultProps = {
    value: 'test-value',
    label: 'Test Label',
    selected: false,
    variant: 'divisions' as const,
    onToggle: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should render with correct label', () => {
      render(<ToggleChip {...defaultProps} />)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should call onToggle when clicked', () => {
      const onToggle = vi.fn()
      render(<ToggleChip {...defaultProps} onToggle={onToggle} />)

      fireEvent.click(screen.getByRole('checkbox'))
      expect(onToggle).toHaveBeenCalledWith('test-value')
    })

    it('should not call onToggle when disabled', () => {
      const onToggle = vi.fn()
      render(<ToggleChip {...defaultProps} onToggle={onToggle} disabled />)

      fireEvent.click(screen.getByRole('checkbox'))
      expect(onToggle).not.toHaveBeenCalled()
    })

    it('should apply custom className', () => {
      render(<ToggleChip {...defaultProps} className='custom-class' />)
      expect(screen.getByTestId('toggle-chip-container')).toHaveClass('custom-class')
    })

    it('should apply custom data-testid', () => {
      render(<ToggleChip {...defaultProps} data-testid='custom-testid' />)
      expect(screen.getByTestId('custom-testid')).toBeInTheDocument()
    })
  })

  describe('Selected State', () => {
    it('should show as checked when selected', () => {
      render(<ToggleChip {...defaultProps} selected />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('should show as unchecked when not selected', () => {
      render(<ToggleChip {...defaultProps} selected={false} />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })
  })

  describe('Disabled State', () => {
    it('should disable checkbox when disabled', () => {
      render(<ToggleChip {...defaultProps} disabled />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('should enable checkbox when not disabled', () => {
      render(<ToggleChip {...defaultProps} disabled={false} />)
      expect(screen.getByRole('checkbox')).toBeEnabled()
    })
  })

  describe('Variants', () => {
    it('should apply divisions variant styling', () => {
      render(<ToggleChip {...defaultProps} variant='divisions' />)
      expect(screen.getByTestId('toggle-chip-container')).toHaveClass(
        'hover:border-lime-300'
      )
    })

    it('should apply categories variant styling', () => {
      render(<ToggleChip {...defaultProps} variant='categories' />)
      expect(screen.getByTestId('toggle-chip-container')).toHaveClass(
        'hover:border-purple-300'
      )
    })

    it('should apply selected divisions styling', () => {
      render(<ToggleChip {...defaultProps} variant='divisions' selected />)
      expect(screen.getByTestId('toggle-chip-container')).toHaveClass('border-lime-500')
    })

    it('should apply selected categories styling', () => {
      render(<ToggleChip {...defaultProps} variant='categories' selected />)
      expect(screen.getByTestId('toggle-chip-container')).toHaveClass(
        'border-purple-500'
      )
    })
  })

  describe('Accessibility', () => {
    it('should render checkbox element', () => {
      render(<ToggleChip {...defaultProps} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('should hide checkbox visually but keep it accessible', () => {
      render(<ToggleChip {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('sr-only')
    })
  })
})
