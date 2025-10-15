import type { JSX, ReactNode } from 'react'

import { Text } from '@radix-ui/themes'

type IconLabelButtonProps = {
  icon: ReactNode
  label: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  'aria-label'?: string
}

export const IconLabelButton = ({
  icon,
  label,
  onClick,
  className,
  'aria-label': ariaLabel,
}: Readonly<IconLabelButtonProps>): JSX.Element => (
  <button type='button' className={className} onClick={onClick} aria-label={ariaLabel}>
    <div className='flex flex-col items-center justify-center gap-1'>
      {icon}
      <Text size='2' weight='bold' className='text-white'>
        {label}
      </Text>
    </div>
  </button>
)
