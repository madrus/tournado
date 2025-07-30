import { type JSX } from 'react'

import { UnfoldLessIcon, UnfoldMoreIcon } from './index'

type AnimatedUnfoldIconProps = {
  isOpen: boolean
  className?: string
  'aria-label'?: string
}

/**
 * AnimatedUnfoldIcon - two-phase rotation with icon switch at midpoint
 *
 * Animation phases:
 * 1. First half (150ms): Rotate UnfoldMore icon 90 degrees
 * 2. Icon switch: Replace UnfoldMore with UnfoldLess
 * 3. Second half (150ms): Continue rotating UnfoldLess to 180 degrees total
 * Total duration: 300ms synced with ComboField's duration-300 animations
 */
export const AnimatedUnfoldIcon = ({
  isOpen,
  className = 'w-6 h-6',
  'aria-label': ariaLabel = isOpen ? 'Collapse options' : 'Expand options',
}: Readonly<AnimatedUnfoldIconProps>): JSX.Element => (
  <div
    className={`relative ${className}`}
    role='img'
    aria-label={ariaLabel}
    data-testid={`animated-unfold-${isOpen ? 'open' : 'closed'}`}
  >
    {/* UnfoldMore icon - visible when closed, rotates first half */}
    <div
      className={`absolute inset-0 transition-all duration-150 ease-in-out ${
        isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
      }`}
      style={{ transitionDelay: isOpen ? '0ms' : '150ms' }}
    >
      <UnfoldMoreIcon className='h-full w-full' />
    </div>

    {/* UnfoldLess icon - visible when open, rotates second half */}
    <div
      className={`absolute inset-0 transition-all duration-150 ease-in-out ${
        isOpen ? 'rotate-180 opacity-100' : 'rotate-90 opacity-0'
      }`}
      style={{ transitionDelay: isOpen ? '150ms' : '0ms' }}
    >
      <UnfoldLessIcon className='h-full w-full' />
    </div>
  </div>
)
