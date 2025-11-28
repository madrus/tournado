import { describe, expect, it } from 'vitest'

import {
	type ToastType,
	toastCloseButtonVariants,
	toastIconVariants,
	toastMessageVariants,
} from '../toastMessage.variants'

describe('Toast Message Variants', () => {
	describe('toastMessageVariants', () => {
		it('should generate correct base classes', () => {
			const baseClasses = toastMessageVariants({ type: 'info' })

			expect(baseClasses).toContain('pointer-events-auto')
			expect(baseClasses).toContain('flex')
			expect(baseClasses).toContain('w-full')
			expect(baseClasses).toContain('max-w-sm')
			expect(baseClasses).toContain('items-start')
			expect(baseClasses).toContain('gap-3')
			expect(baseClasses).toContain('rounded-lg')
			expect(baseClasses).toContain('p-4')
			expect(baseClasses).toContain('backdrop-blur-lg')
			expect(baseClasses).toContain('ring-inset')
		})

		it('should generate correct success variant classes', () => {
			const successClasses = toastMessageVariants({ type: 'success' })

			expect(successClasses).toContain('bg-gradient-to-br')
			expect(successClasses).toContain('from-emerald-600')
			expect(successClasses).toContain('text-white')
			expect(successClasses).toContain('shadow-xl')
			expect(successClasses).toContain('shadow-emerald-950/30')
			expect(successClasses).toContain('dark:shadow-md')
			expect(successClasses).toContain('dark:shadow-white/20')
		})

		it('should generate correct error variant classes', () => {
			const errorClasses = toastMessageVariants({ type: 'error' })

			expect(errorClasses).toContain('bg-gradient-to-br')
			expect(errorClasses).toContain('from-red-600')
			expect(errorClasses).toContain('text-white')
			expect(errorClasses).toContain('shadow-xl')
			expect(errorClasses).toContain('shadow-red-950/30')
			expect(errorClasses).toContain('dark:shadow-md')
			expect(errorClasses).toContain('dark:shadow-white/20')
		})

		it('should generate correct info variant classes', () => {
			const infoClasses = toastMessageVariants({ type: 'info' })

			expect(infoClasses).toContain('bg-gradient-to-br')
			expect(infoClasses).toContain('from-sky-600')
			expect(infoClasses).toContain('text-white')
			expect(infoClasses).toContain('shadow-xl')
			expect(infoClasses).toContain('shadow-sky-950/30')
			expect(infoClasses).toContain('dark:shadow-md')
			expect(infoClasses).toContain('dark:shadow-white/20')
		})

		it('should generate correct warning variant classes', () => {
			const warningClasses = toastMessageVariants({ type: 'warning' })

			expect(warningClasses).toContain('bg-gradient-to-br')
			expect(warningClasses).toContain('from-orange-600')
			expect(warningClasses).toContain('text-white')
			expect(warningClasses).toContain('shadow-xl')
			expect(warningClasses).toContain('shadow-orange-950/30')
			expect(warningClasses).toContain('dark:shadow-md')
			expect(warningClasses).toContain('dark:shadow-white/20')
		})

		it('should use default variant when no type is provided', () => {
			const defaultClasses = toastMessageVariants({})

			// Should default to info
			expect(defaultClasses).toContain('from-sky-600')
			expect(defaultClasses).toContain('text-white')
			expect(defaultClasses).toContain('shadow-xl')
			expect(defaultClasses).toContain('shadow-sky-950/30')
			expect(defaultClasses).toContain('dark:shadow-md')
			expect(defaultClasses).toContain('dark:shadow-white/20')
		})

		it('should handle all toast types correctly', () => {
			const types: ToastType[] = ['success', 'error', 'info', 'warning']

			types.forEach((type) => {
				const classes = toastMessageVariants({ type })
				expect(classes).toBeTruthy()
				expect(classes).toContain('pointer-events-auto') // Base class should always be present
			})
		})
	})

	describe('toastIconVariants', () => {
		it('should generate correct base classes', () => {
			const baseClasses = toastIconVariants({})

			expect(baseClasses).toContain('flex')
			expect(baseClasses).toContain('h-5')
			expect(baseClasses).toContain('w-5')
			expect(baseClasses).toContain('items-center')
			expect(baseClasses).toContain('justify-center')
		})

		it('should add background classes when hasBackground is true', () => {
			const withBackgroundClasses = toastIconVariants({ hasBackground: true })

			expect(withBackgroundClasses).toContain('rounded-full')
			expect(withBackgroundClasses).toContain('bg-white')
		})

		it('should not add background classes when hasBackground is false', () => {
			const withoutBackgroundClasses = toastIconVariants({
				hasBackground: false,
			})

			expect(withoutBackgroundClasses).not.toContain('rounded-full')
			expect(withoutBackgroundClasses).not.toContain('bg-white')
		})

		it('should use default variant when no hasBackground is provided', () => {
			const defaultClasses = toastIconVariants({})

			// Should default to hasBackground: false
			expect(defaultClasses).not.toContain('bg-white')
			expect(defaultClasses).not.toContain('rounded-full')
		})

		it('should combine base classes with variant classes correctly', () => {
			const withBackgroundClasses = toastIconVariants({ hasBackground: true })

			// Should have both base and variant classes
			expect(withBackgroundClasses).toContain('flex')
			expect(withBackgroundClasses).toContain('h-5')
			expect(withBackgroundClasses).toContain('w-5')
			expect(withBackgroundClasses).toContain('rounded-full')
			expect(withBackgroundClasses).toContain('bg-white')
		})
	})

	describe('toastCloseButtonVariants', () => {
		it('should generate correct base classes', () => {
			const baseClasses = toastCloseButtonVariants()

			expect(baseClasses).toContain('flex')
			expect(baseClasses).toContain('h-5')
			expect(baseClasses).toContain('w-5')
			expect(baseClasses).toContain('shrink-0')
			expect(baseClasses).toContain('items-center')
			expect(baseClasses).toContain('justify-center')
			expect(baseClasses).toContain('rounded-full')
			// no opacity dimming in new glossy design
		})

		it('should generate correct text color for all toast types', () => {
			// All toast types use the same white text styling
			const classes = toastCloseButtonVariants()
			expect(classes).toContain('text-white')
		})

		it('should use default variant when no type is provided', () => {
			const defaultClasses = toastCloseButtonVariants()

			// Should default to info type
			expect(defaultClasses).toContain('text-white')
		})

		it('should combine base classes with variant classes correctly', () => {
			const successClasses = toastCloseButtonVariants()

			// Should have both base and variant classes
			expect(successClasses).toContain('flex')
			expect(successClasses).toContain('h-5')
			expect(successClasses).toContain('w-5')
			expect(successClasses).toContain('text-white')
			// no opacity dimming in new glossy design
		})
	})

	describe('Variant Combinations', () => {
		it('should handle all valid variant combinations', () => {
			const types: ToastType[] = ['success', 'error', 'info', 'warning']
			const hasBackgroundOptions = [true, false]

			types.forEach((type) => {
				hasBackgroundOptions.forEach((hasBackground) => {
					const messageClasses = toastMessageVariants({ type })
					const iconClasses = toastIconVariants({ hasBackground })
					const closeButtonClasses = toastCloseButtonVariants()

					expect(messageClasses).toBeTruthy()
					expect(iconClasses).toBeTruthy()
					expect(closeButtonClasses).toBeTruthy()
				})
			})
		})

		it('should generate consistent class strings', () => {
			const classes1 = toastMessageVariants({ type: 'success' })
			const classes2 = toastMessageVariants({ type: 'success' })

			expect(classes1).toBe(classes2)
		})

		it('should generate different class strings for different variants', () => {
			const successClasses = toastMessageVariants({ type: 'success' })
			const errorClasses = toastMessageVariants({ type: 'error' })

			expect(successClasses).not.toBe(errorClasses)
			expect(successClasses).toContain('from-emerald-600')
			expect(errorClasses).toContain('from-red-600')
		})
	})

	describe('Type Safety', () => {
		it('should accept valid ToastType values', () => {
			const validTypes: ToastType[] = ['success', 'error', 'info', 'warning']

			validTypes.forEach((type) => {
				expect(() => {
					toastMessageVariants({ type })
					toastCloseButtonVariants()
				}).not.toThrow()
			})
		})

		it('should handle undefined values gracefully', () => {
			expect(() => {
				toastMessageVariants({})
				toastIconVariants({})
				toastCloseButtonVariants()
			}).not.toThrow()
		})
	})
})
