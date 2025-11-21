import type { JSX, ReactNode } from 'react'

import { INPUT_LABEL_SPACING, STATUS_ICON_CONTAINER_WIDTH } from '~/styles/constants'
import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

type LabelWithStatusIconProps = {
	/**
	 * The text label to display
	 */
	label: string
	/**
	 * Optional status icon (success/error/neutral) rendered inline with the label
	 */
	statusIcon?: ReactNode
	/**
	 * Additional className for the container
	 */
	className?: string
	/**
	 * Additional className for the label text
	 */
	labelClassName?: string
	/**
	 * Whether to include default spacing (INPUT_LABEL_SPACING)
	 */
	includeSpacing?: boolean
}

/**
 * LabelWithStatusIcon component - provides consistent horizontal flex layout for labels with status icons
 *
 * This component implements the pattern used in CheckboxAgreementField and other form components
 * where a text label is displayed alongside a status icon in a horizontal flex layout.
 *
 * The status icon is positioned in a fixed-width container to prevent layout shifts,
 * and the layout uses items-end alignment for optimal visual hierarchy.
 */
export const LabelWithStatusIcon = ({
	label,
	statusIcon,
	className,
	labelClassName,
	includeSpacing = true,
}: Readonly<LabelWithStatusIconProps>): JSX.Element => (
	<div
		className={cn(
			'flex items-end justify-between gap-2',
			includeSpacing && INPUT_LABEL_SPACING,
			className,
		)}
	>
		<div className={cn('font-medium text-foreground', getLatinTextClass(), labelClassName)}>
			{label}
		</div>
		{/* Status icon container with fixed width to prevent layout shifts */}
		<div className={STATUS_ICON_CONTAINER_WIDTH}>{statusIcon}</div>
	</div>
)
