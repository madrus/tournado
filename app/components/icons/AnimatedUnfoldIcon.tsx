import { type JSX } from 'react'

import { UnfoldLessIcon, UnfoldMoreIcon } from './index'

type AnimatedUnfoldIconProps = {
  isOpen: boolean
  className?: string
  'aria-label'?: string
}

/**
 * AnimatedUnfoldIcon - switches between UnfoldMoreIcon (closed) and UnfoldLessIcon (open)
 *
 * Provides smooth visual feedback for dropdown/combo field state changes.
 * Follows the same pattern as AnimatedHamburgerIcon for consistency.
 */
export const AnimatedUnfoldIcon = ({
  isOpen,
  className = 'w-6 h-6',
  'aria-label': ariaLabel = isOpen ? 'Collapse options' : 'Expand options',
}: Readonly<AnimatedUnfoldIconProps>): JSX.Element => (
  <div
    className={`transition-all duration-300 ease-in-out ${className}`}
    role='img'
    aria-label={ariaLabel}
    data-testid={`animated-unfold-${isOpen ? 'open' : 'closed'}`}
  >
    {isOpen ? (
      <UnfoldLessIcon className='h-full w-full' />
    ) : (
      <UnfoldMoreIcon className='h-full w-full' />
    )}
  </div>
)
