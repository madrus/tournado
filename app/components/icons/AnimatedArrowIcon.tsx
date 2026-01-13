import type { HTMLAttributes, JSX } from 'react'
import { ExpandMoreIcon } from './index'

type AnimatedArrowIconProps = {
  isOpen: boolean
  className?: string
  'aria-label'?: string
} & HTMLAttributes<HTMLDivElement>

/**
 * AnimatedArrowIcon - rotates chevron 180 degrees between closed and open states
 *
 * Animation:
 * - Closed: chevron pointing down (rotate-0)
 * - Open: chevron pointing up (rotate-180)
 * - Duration: 300ms synced with ComboField's duration-300 animations
 */
export const AnimatedArrowIcon = ({
  isOpen,
  className = 'w-6 h-6',
  'aria-label': ariaLabel = isOpen ? 'Collapse options' : 'Expand options',
  ...rest
}: Readonly<AnimatedArrowIconProps>): JSX.Element => (
  <div
    className={`transition-transform duration-300 ease-in-out ${className} ${
      isOpen ? 'rotate-180' : 'rotate-0'
    }`}
    role='img'
    aria-label={ariaLabel}
    data-testid={`animated-arrow-${isOpen ? 'open' : 'closed'}`}
    {...rest}
  >
    <ExpandMoreIcon className='h-full w-full' />
  </div>
)
