import type { VariantProps } from 'class-variance-authority'
import type { JSX, ReactNode } from 'react'

import { cn } from '~/utils/misc'

import { badgeVariants } from './badge.variants'

type BadgeProps = {
	children: ReactNode
	className?: string
} & VariantProps<typeof badgeVariants>

export const Badge = ({
	children,
	color,
	className,
}: Readonly<BadgeProps>): JSX.Element => (
	<span className={cn(badgeVariants({ color }), className)}>{children}</span>
)
