export type GroupAssignmentLayout = {
	gridColsClass: string
	colSpanClass: string
}

/**
 * Computes responsive Tailwind grid layout classes for group assignment UI.
 *
 * Responsive strategy:
 * - Mobile (base): 1 column
 * - md breakpoint: max 2 columns
 * - xl breakpoint: max 4 columns
 * - 2xl breakpoint: max 6 columns
 *
 * @param groupCount - Number of groups to display
 * @returns Object containing gridColsClass for container and colSpanClass for pool components
 */
export function getGroupAssignmentLayoutClasses(
	groupCount: number,
): GroupAssignmentLayout {
	const gridColsClass =
		'grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6'

	let colSpanClass = 'space-y-4 col-span-1'

	// md breakpoint (max 2 columns)
	colSpanClass += groupCount >= 2 ? ' md:col-span-2' : ' md:col-span-1'

	// xl breakpoint (max 4 columns)
	switch (groupCount) {
		case 1:
			colSpanClass += ' xl:col-span-1'
			break
		case 2:
			colSpanClass += ' xl:col-span-2'
			break
		case 3:
			colSpanClass += ' xl:col-span-3'
			break
		default: // 4 or more
			colSpanClass += ' xl:col-span-4'
	}

	// 2xl breakpoint (max 6 columns)
	switch (groupCount) {
		case 1:
			colSpanClass += ' 2xl:col-span-1'
			break
		case 2:
			colSpanClass += ' 2xl:col-span-2'
			break
		case 3:
			colSpanClass += ' 2xl:col-span-3'
			break
		case 4:
			colSpanClass += ' 2xl:col-span-4'
			break
		case 5:
			colSpanClass += ' 2xl:col-span-5'
			break
		default: // 6 or more
			colSpanClass += ' 2xl:col-span-6'
	}

	return { gridColsClass, colSpanClass }
}
