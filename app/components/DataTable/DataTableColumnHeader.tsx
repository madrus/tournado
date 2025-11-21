import type { Column } from '@tanstack/react-table'
import type { JSX } from 'react'

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from '~/components/icons'
import { cn } from '~/utils/misc'

type DataTableColumnHeaderProps<TData, TValue> = {
	column: Column<TData, TValue>
	title: string
	className?: string
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>): JSX.Element {
	if (!column.getCanSort()) {
		return <span className={cn('font-semibold', className)}>{title}</span>
	}

	const isSorted = column.getIsSorted()

	return (
		<button
			type='button'
			onClick={() => {
				// Cycle through: unsorted -> asc -> desc -> unsorted
				if (!isSorted) {
					column.toggleSorting(false) // Set to asc
				} else if (isSorted === 'asc') {
					column.toggleSorting(true) // Set to desc
				} else {
					column.clearSorting() // Clear sorting (back to unsorted)
				}
			}}
			className={cn(
				'flex items-center gap-2 font-semibold transition-colors hover:text-foreground',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
				className,
			)}
			aria-label={`Sort by ${title}`}
		>
			<span>{title}</span>
			<span className='flex h-4 w-4 items-center justify-center'>
				{isSorted === 'asc' ? (
					<ArrowUpIcon className='h-4 w-4' aria-hidden='true' />
				) : isSorted === 'desc' ? (
					<ArrowDownIcon className='h-4 w-4' aria-hidden='true' />
				) : (
					<ArrowUpDownIcon className='h-4 w-4 opacity-50' aria-hidden='true' />
				)}
			</span>
		</button>
	)
}
