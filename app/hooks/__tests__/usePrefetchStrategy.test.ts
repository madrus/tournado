import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { usePrefetchStrategy } from '../usePrefetchStrategy'

// Mock the prefetchTypes utilities
vi.mock('~/utils/prefetchTypes', () => ({
	getPrefetchStrategy: vi.fn((_route: string, context: string) => {
		// Mock implementation based on context
		if (context === 'primaryNavigation') return 'intent'
		if (context === 'actionButtons') return 'render'
		if (context === 'listItems') return 'viewport'
		return 'none'
	}),
	getAdaptivePrefetchStrategy: vi.fn((strategy: string, networkContext: unknown) => {
		const ctx = networkContext as {
			isSlowConnection?: boolean
			isLowDataMode?: boolean
		}
		// Mock adaptive behavior: downgrade on slow connection
		if (ctx.isSlowConnection || ctx.isLowDataMode) {
			if (strategy === 'render') return 'intent'
			if (strategy === 'intent') return 'none'
		}
		return strategy
	}),
}))

describe('usePrefetchStrategy', () => {
	describe('Basic Strategy Selection', () => {
		it('should return base strategy from context', () => {
			const { result } = renderHook(() =>
				usePrefetchStrategy('/teams', 'primaryNavigation', undefined, false),
			)

			expect(result.current).toBe('intent')
		})

		it('should use override strategy when provided', () => {
			const { result } = renderHook(() =>
				usePrefetchStrategy('/teams', 'primaryNavigation', 'render', false),
			)

			expect(result.current).toBe('render')
		})

		it('should handle different contexts correctly', () => {
			const { result: primaryNav } = renderHook(() =>
				usePrefetchStrategy('/teams', 'primaryNavigation', undefined, false),
			)
			const { result: actionBtn } = renderHook(() =>
				usePrefetchStrategy('/teams', 'actionButtons', undefined, false),
			)
			const { result: listItems } = renderHook(() =>
				usePrefetchStrategy('/teams', 'listItems', undefined, false),
			)

			expect(primaryNav.current).toBe('intent')
			expect(actionBtn.current).toBe('render')
			expect(listItems.current).toBe('viewport')
		})
	})

	describe('Route Handling', () => {
		it('should handle string routes', () => {
			const { result } = renderHook(() =>
				usePrefetchStrategy('/teams/123', 'primaryNavigation', undefined, false),
			)

			expect(result.current).toBe('intent')
		})

		it('should handle route objects with pathname', () => {
			const routeObject = { pathname: '/teams/123', search: '?tab=players' }
			const { result } = renderHook(() =>
				usePrefetchStrategy(routeObject, 'primaryNavigation', undefined, false),
			)

			expect(result.current).toBe('intent')
		})

		it('should handle route objects without pathname', () => {
			const routeObject = { search: '?tab=players' }
			const { result } = renderHook(() =>
				usePrefetchStrategy(routeObject, 'primaryNavigation', undefined, false),
			)

			expect(result.current).toBe('intent')
		})
	})

	describe('Adaptive Prefetching', () => {
		it('should apply adaptive strategy when enabled', () => {
			// Mock slow connection
			Object.defineProperty(navigator, 'connection', {
				value: { effectiveType: 'slow-2g', saveData: false },
				writable: true,
				configurable: true,
			})

			const { result } = renderHook(() =>
				usePrefetchStrategy('/teams', 'actionButtons', undefined, true),
			)

			// actionButtons context returns 'render', which downgrades to 'intent' on slow connection
			expect(result.current).toBe('intent')
		})

		it('should skip adaptive strategy when disabled', () => {
			// Mock slow connection
			Object.defineProperty(navigator, 'connection', {
				value: { effectiveType: 'slow-2g', saveData: false },
				writable: true,
				configurable: true,
			})

			const { result } = renderHook(() =>
				usePrefetchStrategy('/teams', 'actionButtons', undefined, false),
			)

			// With adaptive=false, should return base strategy regardless of connection
			expect(result.current).toBe('render')
		})

		it('should handle saveData mode', () => {
			Object.defineProperty(navigator, 'connection', {
				value: { effectiveType: '4g', saveData: true },
				writable: true,
				configurable: true,
			})

			const { result } = renderHook(() =>
				usePrefetchStrategy('/teams', 'actionButtons', undefined, true),
			)

			// saveData should also trigger adaptive downgrade
			expect(result.current).toBe('intent')
		})
	})

	describe('Memoization', () => {
		it('should return same strategy when dependencies do not change', () => {
			const { result, rerender } = renderHook(() =>
				usePrefetchStrategy('/teams', 'primaryNavigation', undefined, false),
			)

			const firstResult = result.current
			rerender()
			const secondResult = result.current

			expect(firstResult).toBe(secondResult)
		})

		it('should recompute strategy when route changes', () => {
			const { result, rerender } = renderHook(
				({ route }) =>
					usePrefetchStrategy(route, 'primaryNavigation', undefined, false),
				{ initialProps: { route: '/teams' } },
			)

			const firstResult = result.current

			rerender({ route: '/users' })
			const secondResult = result.current

			// Both should be 'intent' for primaryNavigation, but they should be recomputed
			expect(firstResult).toBe('intent')
			expect(secondResult).toBe('intent')
		})

		it('should recompute strategy when context changes', () => {
			type ContextType = 'primaryNavigation' | 'actionButtons'
			const { result, rerender } = renderHook(
				({ context }: { context: ContextType }) =>
					usePrefetchStrategy('/teams', context, undefined, false),
				{ initialProps: { context: 'primaryNavigation' as ContextType } },
			)

			expect(result.current).toBe('intent')

			rerender({ context: 'actionButtons' as ContextType })

			expect(result.current).toBe('render')
		})
	})
})
