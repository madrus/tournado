import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

import {
  toggleChipTextVariants,
  toggleChipVariants,
  type ToggleChipVariants,
} from './toggleChip.variants'

type ToggleChipProps = {
  /**
   * The value of the item to toggle
   */
  value: string
  /**
   * The display label for the item
   */
  label: string
  /**
   * Whether the item is currently selected
   */
  selected: boolean
  /**
   * Whether the chip is disabled
   */
  disabled?: boolean
  /**
   * The variant determines the color scheme (divisions = lime, categories = purple)
   */
  variant: NonNullable<ToggleChipVariants['variant']>
  /**
   * Callback when the item is toggled
   */
  onToggle: (value: string) => void
  /**
   * Optional className for additional styling
   */
  className?: string
  /**
   * Optional data-testid for testing
   */
  'data-testid'?: string
}

export function ToggleChip({
  value,
  label,
  selected,
  disabled = false,
  variant,
  onToggle,
  className,
  'data-testid': dataTestId,
}: ToggleChipProps): JSX.Element {
  const { i18n } = useTranslation()

  const handleToggle = () => {
    if (!disabled) {
      onToggle(value)
    }
  }

  return (
    <label
      className={cn(toggleChipVariants({ variant, selected, disabled }), className)}
      data-testid={dataTestId || 'toggle-chip-container'}
    >
      <input
        type='checkbox'
        checked={selected}
        onChange={handleToggle}
        disabled={disabled}
        className='sr-only'
      />
      <span
        className={cn(
          toggleChipTextVariants(),
          i18n.language !== 'ar' ? getLatinTextClass(i18n.language) : ''
        )}
      >
        {label}
      </span>
    </label>
  )
}
