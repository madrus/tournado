import { cva, type VariantProps } from 'class-variance-authority'

// ---------------------------------------------------------------------------
// Assignment Board Container
// ---------------------------------------------------------------------------

export const assignmentBoardVariants = cva(
	[
		// Base layout
		'grid gap-4',
		// Background with subtle gradient
		'rounded-2xl p-6',
		'bg-gradient-to-br from-background via-background to-surface-light/30',
		'border border-border/50',
		// Shadow for depth
		'shadow-lg shadow-black/5',
	],
	{
		variants: {
			layout: {
				desktop: 'grid-cols-[1fr_320px]',
				mobile: 'grid-cols-1',
			},
		},
		defaultVariants: {
			layout: 'desktop',
		},
	},
)

export type AssignmentBoardVariants = VariantProps<typeof assignmentBoardVariants>

// ---------------------------------------------------------------------------
// Group Card
// ---------------------------------------------------------------------------

export const groupCardVariants = cva(
	[
		// Base container with depth
		'rounded-xl p-4',
		'border-2 border-border/60',
		// Subtle slate gradient for depth and gloss
		'bg-gradient-to-br from-surface-light/15 via-surface/60 to-surface-light/15',
		'backdrop-blur-sm',
		// Soft shadow for elevation
		'shadow-md shadow-black/5',
		// Transition for hover/drag states
		'transition-all duration-200 ease-out',
	],
	{
		variants: {
			isDropTarget: {
				true: [
					'border-brand/60 bg-gradient-to-br from-brand/10 via-brand/5 to-brand/5',
					'ring-2 ring-brand/20 ring-offset-2 ring-offset-background',
					'shadow-lg shadow-brand/10',
				],
				false: '',
			},
			isDragOver: {
				true: 'scale-[1.01]',
				false: '',
			},
		},
		defaultVariants: {
			isDropTarget: false,
			isDragOver: false,
		},
	},
)

export type GroupCardVariants = VariantProps<typeof groupCardVariants>

// ---------------------------------------------------------------------------
// Group Slot Drop Zone
// ---------------------------------------------------------------------------

export const groupSlotVariants = cva(
	[
		// Base slot styling - compact height matching chip size
		'relative rounded-lg',
		'h-9 flex items-center',
		'transition-all duration-200 ease-out',
	],
	{
		variants: {
			state: {
				empty: [
					'justify-center px-3',
					'border-2 border-dashed border-border/40 bg-surface-500/10',
					'hover:border-border/60 hover:bg-surface-500/20',
				],
				occupied: ['bg-transparent'],
				dropTarget: [
					'justify-center px-3',
					'border-2 border-dashed border-brand bg-brand/10',
					'ring-2 ring-brand/30',
					'shadow-md shadow-brand/20',
				],
				highlighted: [
					'justify-center px-3',
					'border-2 border-dashed border-brand/50 bg-brand/5',
					'animate-pulse',
				],
			},
			isDisabled: {
				true: 'opacity-50 pointer-events-none',
				false: '',
			},
		},
		defaultVariants: {
			state: 'empty',
			isDisabled: false,
		},
	},
)

export type GroupSlotVariants = VariantProps<typeof groupSlotVariants>

// ---------------------------------------------------------------------------
// Reserve Pool Container
// ---------------------------------------------------------------------------

export const reservePoolVariants = cva(
	[
		// Base container with depth
		'rounded-xl p-4',
		'border border-border/60',
		'backdrop-blur-sm',
		// Soft shadow for elevation
		'shadow-md shadow-black/5',
		// Transition for drag states
		'transition-all duration-200 ease-out',
	],
	{
		variants: {
			variant: {
				confirmed: [
					'border-primary-500/30',
					'bg-gradient-to-br from-primary-500/15 via-primary-500/8 to-surface/40',
				],
				waitlist: [
					'border-amber-500/30',
					'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-surface/40',
				],
			},
			isDropTarget: {
				true: ['ring-2 ring-offset-2 ring-offset-background', 'shadow-lg'],
				false: '',
			},
		},
		compoundVariants: [
			{
				variant: 'confirmed',
				isDropTarget: true,
				className: 'ring-primary-500/40 shadow-primary-500/10 border-primary-500/50',
			},
			{
				variant: 'waitlist',
				isDropTarget: true,
				className: 'ring-amber-500/40 shadow-amber-500/10 border-amber-500/50',
			},
		],
		defaultVariants: {
			variant: 'confirmed',
			isDropTarget: false,
		},
	},
)

export type ReservePoolVariants = VariantProps<typeof reservePoolVariants>

// ---------------------------------------------------------------------------
// Draggable Team Chip
// ---------------------------------------------------------------------------

export const draggableChipVariants = cva(
	[
		// Base chip styling - compact and chip-like
		'relative inline-flex items-center gap-2',
		'px-3 py-1.5 rounded-lg',
		'font-medium text-sm',
		'border',
		// Interactive states
		'cursor-grab active:cursor-grabbing',
		'select-none touch-none',
		// Transition for all states
		'transition-all duration-150 ease-out',
		// Focus for accessibility
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
	],
	{
		variants: {
			isDragging: {
				true: ['opacity-0'],
				false: ['hover:shadow-md hover:scale-[1.02]', 'shadow-sm'],
			},
			variant: {
				default:
					'bg-brand/15 text-brand dark:text-brand-light border-brand-500/30 hover:border-brand-500/50',
				confirmed:
					'bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-500/30 hover:border-primary-500/50',
				waitlist:
					'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:border-amber-500/50',
			},
			size: {
				sm: 'px-2 py-1 text-xs',
				md: 'px-3 py-1.5 text-sm',
				lg: 'px-4 py-2 text-base',
			},
		},
		defaultVariants: {
			isDragging: false,
			variant: 'default',
			size: 'md',
		},
	},
)

export type DraggableChipVariants = VariantProps<typeof draggableChipVariants>

// ---------------------------------------------------------------------------
// Drag Overlay (Ghost chip while dragging)
// ---------------------------------------------------------------------------

export const dragOverlayVariants = cva([
	// Base styling matching chip
	'inline-flex items-center gap-2',
	'px-3 py-2 rounded-lg',
	'font-medium text-sm',
	'bg-brand text-brand-foreground',
	'border-2 border-brand',
	// Elevated appearance
	'shadow-xl shadow-brand/30',
	'scale-105',
	// Cursor and interaction
	'cursor-grabbing',
	'pointer-events-none',
])

// ---------------------------------------------------------------------------
// Delete Button (on chip hover)
// ---------------------------------------------------------------------------

export const chipDeleteButtonVariants = cva([
	// Positioning
	'absolute -top-1.5 -right-1.5',
	// Styling
	'flex items-center justify-center',
	'w-5 h-5 rounded-full',
	'bg-red-500 text-white',
	'border-2 border-background',
	// Interactive
	'cursor-pointer',
	'opacity-0 group-hover:opacity-100',
	'transition-opacity duration-150',
	// Focus
	'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50',
])

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

export const emptyStateVariants = cva([
	'flex flex-col items-center justify-center',
	'py-8 px-4',
	'text-center text-foreground-light',
])

// ---------------------------------------------------------------------------
// Error Banner
// ---------------------------------------------------------------------------

export const errorBannerVariants = cva(
	['flex items-center gap-2', 'px-3 py-2 rounded-lg', 'text-sm font-medium'],
	{
		variants: {
			variant: {
				error: 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30',
				warning:
					'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30',
				info: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30',
			},
		},
		defaultVariants: {
			variant: 'error',
		},
	},
)

export type ErrorBannerVariants = VariantProps<typeof errorBannerVariants>

// ---------------------------------------------------------------------------
// Mobile Group Tabs
// ---------------------------------------------------------------------------

export const groupTabVariants = cva(
	[
		'px-4 py-2 rounded-full',
		'text-sm border',
		'transition-all duration-150',
		'whitespace-nowrap',
	],
	{
		variants: {
			isActive: {
				true: 'bg-gradient-to-b from-surface-light/10 via-brand-600/60 to-surface-light/10 text-foreground shadow-lg font-bold border-2 border-border',
				false:
					'bg-gradient-to-b from-surface/10 via-surface-light/30 to-surface/10 text-foreground-light hover:from-slate-400/20 hover:via-surface/50 hover:to-surface/40 hover:text-foreground font-medium border border-border/40',
			},
		},
		defaultVariants: {
			isActive: false,
		},
	},
)

export type GroupTabVariants = VariantProps<typeof groupTabVariants>

// ---------------------------------------------------------------------------
// Pagination Dots
// ---------------------------------------------------------------------------

export const paginationDotVariants = cva(
	['w-2 h-2 rounded-full', 'transition-all duration-200'],
	{
		variants: {
			isActive: {
				true: 'bg-brand w-4',
				false: 'bg-foreground-lighter hover:bg-foreground-light',
			},
		},
		defaultVariants: {
			isActive: false,
		},
	},
)

export type PaginationDotVariants = VariantProps<typeof paginationDotVariants>

// ---------------------------------------------------------------------------
// Action Button Group
// ---------------------------------------------------------------------------

export const actionButtonGroupVariants = cva([
	'flex items-center gap-3',
	'pt-4 border-t border-border/50',
])

// ---------------------------------------------------------------------------
// Hero Strip
// ---------------------------------------------------------------------------

export const heroStripVariants = cva([
	'flex flex-col gap-1',
	'pb-4 mb-4',
	'border-b border-border/30',
])
