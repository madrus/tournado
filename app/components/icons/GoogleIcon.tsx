import type { JSX, SVGProps } from 'react'
import { cn } from '~/utils/misc'

type GoogleIconProps = Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'width' | 'height' | 'className' | 'color'
> & {
  className?: string
  size?: number
  'data-testid'?: string
  'aria-label'?: string
}

export const GoogleIcon = ({
  className = '',
  size = 24,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Google',
  ...props
}: Readonly<GoogleIconProps>): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 48 48'
    className={cn('inline-block', className)}
    data-testid={dataTestId}
    role='img'
    aria-label={ariaLabel}
    {...props}
  >
    <path
      fill='currentColor'
      d='M24 9.5c3.54 0 6.32 1.47 8.26 2.7l6.09-5.9C34.4 3.06 29.63 1 24 1 14.82 1 6.91 6.91 3.63 15.26l7.04 5.46C12.3 14.17 17.67 9.5 24 9.5z'
    />
    <path
      fill='currentColor'
      d='M46.14 24.5c0-1.47-.13-2.87-.38-4.22H24v8.44h12.6c-.54 2.77-2.17 5.1-4.59 6.69l7.04 5.46C43.52 36.8 46.14 31.1 46.14 24.5z'
    />
    <path
      fill='currentColor'
      d='M10.67 28.78a14.6 14.6 0 0 1-.76-4.28c0-1.49.27-2.94.76-4.28l-7.04-5.46A23.92 23.92 0 0 0 0 24.5c0 3.9.93 7.59 2.63 10.95l8.04-6.67z'
    />
    <path
      fill='currentColor'
      d='M24 47c6.48 0 11.91-2.13 15.88-5.82l-7.04-5.46C30.69 37.45 27.5 38.5 24 38.5c-6.33 0-11.7-4.67-13.33-10.73l-8.04 6.67C6.91 41.09 14.82 47 24 47z'
    />
  </svg>
)
