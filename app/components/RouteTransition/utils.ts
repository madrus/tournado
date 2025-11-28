/**
 * Shared types and utilities for route transition components
 */

/**
 * Common props shared across transition components
 */
export type BaseTransitionProps = {
	className?: string
}

/**
 * Props for transitions with duration control
 */
export type TransitionWithDurationProps = BaseTransitionProps & {
	duration?: number
}

/**
 * Props for opacity-based transitions
 */
export type OpacityTransitionProps = TransitionWithDurationProps & {
	minOpacity?: number
}

/**
 * Transition stage for multi-stage transitions
 */
export type TransitionStage = 'stable' | 'exiting' | 'entering'

/**
 * Get opacity value based on transition stage
 */
export function getOpacityForStage(stage: TransitionStage): number {
	switch (stage) {
		case 'exiting':
			return 0
		// Both 'entering' and 'stable' stages should have full opacity.
		default:
			return 1
	}
}

/**
 * Get transition classes based on transition stage
 */
export function getTransitionClassesForStage(stage: TransitionStage): string {
	switch (stage) {
		case 'exiting':
			return 'opacity-0 transform scale-95'
		// Both 'entering' and 'stable' stages should be fully visible and scaled.
		default:
			return 'opacity-100 transform scale-100'
	}
}
