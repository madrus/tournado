import { type JSX } from 'react'

type AnimatedHamburgerIconProps = {
  isOpen: boolean
  isRTL: boolean
  className?: string
  'aria-label'?: string
}

export const AnimatedHamburgerIcon = ({
  isOpen,
  isRTL,
  className = 'w-6 h-6',
  'aria-label': ariaLabel = 'Menu',
}: Readonly<AnimatedHamburgerIconProps>): JSX.Element => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    role='img'
    aria-label={ariaLabel}
  >
    {/* Top line */}
    <line
      data-testid='hamburger-top-line'
      x1='3'
      y1='6'
      x2='21'
      y2='6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      className={`origin-center transition-all duration-300 ease-in-out ${
        isOpen
          ? isRTL
            ? 'translate-y-[6px] rotate-45' // Arabic (icon on left): top line rotates right, moves down
            : 'translate-y-[6px] rotate-[-45deg]' // Latin (icon on right): top line rotates left, moves down
          : 'translate-y-0 rotate-0'
      }`}
      style={{ transformOrigin: '12px 6px' }}
    />

    {/* Middle line */}
    <line
      data-testid='hamburger-middle-line'
      x1='3'
      y1='12'
      x2='21'
      y2='12'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      }`}
    />

    {/* Bottom line */}
    <line
      data-testid='hamburger-bottom-line'
      x1='3'
      y1='18'
      x2='21'
      y2='18'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      className={`origin-center transition-all duration-300 ease-in-out ${
        isOpen
          ? isRTL
            ? 'translate-y-[-6px] rotate-[-45deg]' // Arabic (icon on left): bottom line rotates left, moves up
            : 'translate-y-[-6px] rotate-45' // Latin (icon on right): bottom line rotates right, moves up
          : 'translate-y-0 rotate-0'
      }`}
      style={{ transformOrigin: '12px 18px' }}
    />
  </svg>
)
