import { describe, expect, it } from 'vitest'
import {
	type TransitionStage,
	getOpacityForStage,
	getTransitionClassesForStage,
} from '../utils'

describe('RouteTransition Utils', () => {
	describe('getOpacityForStage', () => {
		it('should return 0 for exiting stage', () => {
			expect(getOpacityForStage('exiting')).toBe(0)
		})

		it('should return 1 for entering stage', () => {
			expect(getOpacityForStage('entering')).toBe(1)
		})

		it('should return 1 for stable stage', () => {
			expect(getOpacityForStage('stable')).toBe(1)
		})

		it('should handle all TransitionStage values', () => {
			const stages: TransitionStage[] = ['stable', 'exiting', 'entering']

			stages.forEach((stage) => {
				const opacity = getOpacityForStage(stage)
				expect(typeof opacity).toBe('number')
				expect(opacity).toBeGreaterThanOrEqual(0)
				expect(opacity).toBeLessThanOrEqual(1)
			})
		})
	})

	describe('getTransitionClassesForStage', () => {
		it('should return correct classes for exiting stage', () => {
			const classes = getTransitionClassesForStage('exiting')
			expect(classes).toContain('opacity-0')
			expect(classes).toContain('scale-95')
		})

		it('should return correct classes for entering stage', () => {
			const classes = getTransitionClassesForStage('entering')
			expect(classes).toContain('opacity-100')
			expect(classes).toContain('scale-100')
		})

		it('should return correct classes for stable stage', () => {
			const classes = getTransitionClassesForStage('stable')
			expect(classes).toContain('opacity-100')
			expect(classes).toContain('scale-100')
		})

		it('should handle all TransitionStage values', () => {
			const stages: TransitionStage[] = ['stable', 'exiting', 'entering']

			stages.forEach((stage) => {
				const classes = getTransitionClassesForStage(stage)
				expect(typeof classes).toBe('string')
				expect(classes.length).toBeGreaterThan(0)
			})
		})

		it('should return consistent classes for entering and stable', () => {
			const enteringClasses = getTransitionClassesForStage('entering')
			const stableClasses = getTransitionClassesForStage('stable')
			expect(enteringClasses).toBe(stableClasses)
		})
	})
})
