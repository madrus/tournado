import type { JSX } from 'react'
import { cn } from '~/utils/misc'

type PanelBackgroundProps = {
  backgroundColor: string
  className?: string
  'data-testid'?: string
}

export const PanelBackground = ({
  backgroundColor,
  className,
  'data-testid': testId,
}: PanelBackgroundProps): JSX.Element => (
  <div
    className={cn('absolute inset-0', backgroundColor, className)}
    data-testid={testId}
  />
)
