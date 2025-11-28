import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
	type BreakpointKey,
	breakpoints,
	DESKTOP_BREAKPOINT,
	MOBILE_BREAKPOINT,
} from '../breakpoints'

// Mock window object for testing
const mockWindow = (width: number) => {
	Object.defineProperty(window, 'innerWidth', {
		writable: true,
		configurable: true,
		value: width,
	})
}

describe('breakpoints', () => {
	describe('constants', () => {
		it('should export correct breakpoint values', () => {
			expect(MOBILE_BREAKPOINT).toBe(767)
			expect(DESKTOP_BREAKPOINT).toBe(1024)
		})

		it('should have consistent breakpoint object', () => {
			expect(breakpoints.mobile).toBe(MOBILE_BREAKPOINT)
			expect(breakpoints.desktop).toBe(DESKTOP_BREAKPOINT)
		})
	})

	describe('isMobile function', () => {
		beforeEach(() => {
			vi.stubGlobal('window', { innerWidth: 800 })
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('should return false when window is undefined (SSR)', () => {
			vi.stubGlobal('window', undefined)
			expect(breakpoints.isMobile()).toBe(false)
		})

		it('should return true for mobile viewport (< 1024px)', () => {
			mockWindow(800)
			expect(breakpoints.isMobile()).toBe(true)
		})

		it('should return false for desktop viewport (>= 1024px)', () => {
			mockWindow(1024)
			expect(breakpoints.isMobile()).toBe(false)

			mockWindow(1200)
			expect(breakpoints.isMobile()).toBe(false)
		})

		it('should handle edge case at exact desktop breakpoint', () => {
			mockWindow(DESKTOP_BREAKPOINT)
			expect(breakpoints.isMobile()).toBe(false)
		})

		it('should handle edge case just below desktop breakpoint', () => {
			mockWindow(DESKTOP_BREAKPOINT - 1)
			expect(breakpoints.isMobile()).toBe(true)
		})
	})

	describe('showBottomNav function', () => {
		beforeEach(() => {
			vi.stubGlobal('window', { innerWidth: 600 })
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('should return false when window is undefined (SSR)', () => {
			vi.stubGlobal('window', undefined)
			expect(breakpoints.showBottomNav()).toBe(false)
		})

		it('should return true for mobile viewport (<= 767px)', () => {
			mockWindow(600)
			expect(breakpoints.showBottomNav()).toBe(true)

			mockWindow(767)
			expect(breakpoints.showBottomNav()).toBe(true)
		})

		it('should return false for tablet/desktop viewport (> 767px)', () => {
			mockWindow(768)
			expect(breakpoints.showBottomNav()).toBe(false)

			mockWindow(1024)
			expect(breakpoints.showBottomNav()).toBe(false)
		})

		it('should handle edge case at exact mobile breakpoint', () => {
			mockWindow(MOBILE_BREAKPOINT)
			expect(breakpoints.showBottomNav()).toBe(true)
		})

		it('should handle edge case just above mobile breakpoint', () => {
			mockWindow(MOBILE_BREAKPOINT + 1)
			expect(breakpoints.showBottomNav()).toBe(false)
		})

		it('should handle very small viewports', () => {
			mockWindow(320)
			expect(breakpoints.showBottomNav()).toBe(true)
		})
	})

	describe('media queries', () => {
		it('should provide correct mobile query string', () => {
			expect(breakpoints.queries.mobile).toBe('(max-width: 767px)')
		})

		it('should provide correct desktop query string', () => {
			expect(breakpoints.queries.desktop).toBe('(min-width: 1024px)')
		})

		it('should maintain type safety for query keys', () => {
			const mobileKey: BreakpointKey = 'mobile'
			const desktopKey: BreakpointKey = 'desktop'

			expect(breakpoints.queries[mobileKey]).toBeDefined()
			expect(breakpoints.queries[desktopKey]).toBeDefined()
		})
	})

	describe('consistency between breakpoint functions', () => {
		beforeEach(() => {
			vi.stubGlobal('window', { innerWidth: 800 })
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('should have consistent behavior at different viewport sizes', () => {
			// Test mobile viewport (320px)
			mockWindow(320)
			expect(breakpoints.isMobile()).toBe(true)
			expect(breakpoints.showBottomNav()).toBe(true)

			// Test tablet viewport (768px)
			mockWindow(768)
			expect(breakpoints.isMobile()).toBe(true)
			expect(breakpoints.showBottomNav()).toBe(false)

			// Test desktop viewport (1200px)
			mockWindow(1200)
			expect(breakpoints.isMobile()).toBe(false)
			expect(breakpoints.showBottomNav()).toBe(false)
		})

		it('should handle breakpoint boundaries correctly', () => {
			// At mobile breakpoint (767px)
			mockWindow(767)
			expect(breakpoints.showBottomNav()).toBe(true)
			expect(breakpoints.isMobile()).toBe(true)

			// Just above mobile breakpoint (768px)
			mockWindow(768)
			expect(breakpoints.showBottomNav()).toBe(false)
			expect(breakpoints.isMobile()).toBe(true)

			// At desktop breakpoint (1024px)
			mockWindow(1024)
			expect(breakpoints.showBottomNav()).toBe(false)
			expect(breakpoints.isMobile()).toBe(false)
		})
	})
})
