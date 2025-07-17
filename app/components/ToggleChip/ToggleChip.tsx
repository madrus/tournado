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
   * The color scheme matching the panel color
   */
  color: NonNullable<ToggleChipVariants['color']>
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

/**
 * ToggleChip component for selectable options
 * Used for divisions and categories selection in tournament forms
 */
export function ToggleChip({
  value,
  label,
  selected,
  disabled = false,
  color,
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
      className={cn(toggleChipVariants({ color, selected, disabled }), className)}
      data-testid={dataTestId || 'toggle-chip-container'}
    >
      <input
        type='checkbox'
        className='sr-only'
        checked={selected}
        onChange={handleToggle}
        disabled={disabled}
        aria-label={label}
      />
      <span
        className={cn(
          toggleChipTextVariants({ color, selected }),
          getLatinTextClass(i18n.language)
        )}
      >
        {label}
      </span>
    </label>
  )
}
