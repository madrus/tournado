import { describe, expect, it } from 'vitest'

import {
	dashboardIconVariants,
	panelGlowVariants,
	panelNumberVariants,
	panelVariants,
} from '../panel.variants'

describe('Panel Variants (CVA)', () => {
	describe('panelVariants', () => {
		it('should generate correct classes for content-panel variant', () => {
			const classes = panelVariants({ variant: 'content-panel' })
			expect(classes).toContain('rounded-xl')
			expect(classes).toContain('border')
			expect(classes).toContain('shadow-lg')
			expect(classes).toContain('relative')
			expect(classes).toContain('overflow-visible')
			expect(classes).toContain('p-6')
		})

		it('should generate correct classes for dashboard-panel variant', () => {
			const classes = panelVariants({ variant: 'dashboard-panel' })
			expect(classes).toContain('rounded-xl')
			expect(classes).toContain('border')
			expect(classes).toContain('shadow-lg')
			expect(classes).toContain('p-6')
			// Dashboard-specific layout classes
			expect(classes).toContain('[&_.dashboard-content]:flex')
			expect(classes).toContain('[&_.dashboard-content]:items-center')
			expect(classes).toContain('[&_.dashboard-icon]:shrink-0')
			expect(classes).toContain('[&_.dashboard-icon]:me-5')
			expect(classes).toContain('[&_.dashboard-stats]:w-0')
			expect(classes).toContain('[&_.dashboard-stats]:flex-1')
		})

		it('should generate correct classes for form-panel variant', () => {
			const classes = panelVariants({ variant: 'form-panel' })
			expect(classes).toContain('rounded-xl')
			expect(classes).toContain('border')
			expect(classes).toContain('shadow-lg')
		})

		it('should generate correct classes for layer variants', () => {
			const containerClasses = panelVariants({ variant: 'container' })
			expect(containerClasses).toContain('cursor-pointer')
			expect(containerClasses).toContain('transition-colors')
			expect(containerClasses).toContain('duration-750')

			const backgroundClasses = panelVariants({ variant: 'background' })
			expect(backgroundClasses).toContain('absolute')
			expect(backgroundClasses).toContain('inset-0')
			expect(backgroundClasses).toContain('p-0')

			const contentClasses = panelVariants({ variant: 'content' })
			expect(contentClasses).toContain('relative')
			expect(contentClasses).toContain('z-20')
			expect(contentClasses).toContain('p-6')

			const hoverClasses = panelVariants({ variant: 'hover' })
			expect(hoverClasses).toContain('absolute')
			expect(hoverClasses).toContain('inset-0')
			expect(hoverClasses).toContain('z-30')
			expect(hoverClasses).toContain('opacity-0')
			expect(hoverClasses).toContain('group-hover:opacity-100')
		})

		it('should apply color variants correctly', () => {
			const brandClasses = panelVariants({ color: 'brand' })
			expect(brandClasses).toContain('border-brand-400')
			expect(brandClasses).toContain('panel-brand-bg')

			const tealClasses = panelVariants({ color: 'teal' })
			expect(tealClasses).toContain('border-teal-300')
			expect(tealClasses).toContain('panel-teal-bg')

			const emeraldClasses = panelVariants({ color: 'emerald' })
			expect(emeraldClasses).toContain('border-emerald-300')
			expect(emeraldClasses).toContain('panel-emerald-bg')
		})

		it('should use correct default variants', () => {
			const defaultClasses = panelVariants({})
			expect(defaultClasses).toContain('border-brand-400') // default color: brand
			expect(defaultClasses).toContain('panel-brand-bg')
			expect(defaultClasses).toContain('rounded-xl') // default variant: content-panel
			expect(defaultClasses).toContain('border')
			expect(defaultClasses).toContain('shadow-lg')
		})
	})

	describe('panelGlowVariants', () => {
		it('should generate correct base classes with RTL support', () => {
			const classes = panelGlowVariants({})
			expect(classes).toContain('pointer-events-none')
			expect(classes).toContain('absolute')
			expect(classes).toContain('-top-8')
			expect(classes).toContain('-right-8')
			expect(classes).toContain('rtl:-left-8')
			expect(classes).toContain('rtl:right-auto')
			expect(classes).toContain('h-32')
			expect(classes).toContain('w-32')
			expect(classes).toContain('rounded-full')
			expect(classes).toContain('blur-2xl')
			expect(classes).toContain('opacity-60')
		})

		it('should apply color variants correctly', () => {
			const brandGlow = panelGlowVariants({ color: 'brand' })
			expect(brandGlow).toContain('bg-brand-400/30')

			const tealGlow = panelGlowVariants({ color: 'teal' })
			expect(tealGlow).toContain('bg-teal-400/30')

			const blueGlow = panelGlowVariants({ color: 'blue' })
			expect(blueGlow).toContain('bg-blue-400/30')
		})

		it('should use correct default color', () => {
			const defaultGlow = panelGlowVariants({})
			expect(defaultGlow).toContain('bg-brand-400/30') // default color: brand
		})
	})

	describe('dashboardIconVariants', () => {
		it('should generate correct base classes', () => {
			const classes = dashboardIconVariants({})
			expect(classes).toContain('flex')
			expect(classes).toContain('h-8')
			expect(classes).toContain('w-8')
			expect(classes).toContain('items-center')
			expect(classes).toContain('justify-center')
			expect(classes).toContain('rounded-md')
			expect(classes).toContain('text-white')
		})

		it('should apply color variants correctly', () => {
			const brandIcon = dashboardIconVariants({ color: 'brand' })
			expect(brandIcon).toContain('bg-red-600')

			const tealIcon = dashboardIconVariants({ color: 'teal' })
			expect(tealIcon).toContain('bg-teal-600')

			const emeraldIcon = dashboardIconVariants({ color: 'emerald' })
			expect(emeraldIcon).toContain('bg-emerald-600')

			const blueIcon = dashboardIconVariants({ color: 'blue' })
			expect(blueIcon).toContain('bg-blue-600')
		})

		it('should use correct default color', () => {
			const defaultIcon = dashboardIconVariants({})
			expect(defaultIcon).toContain('bg-red-600') // default color: brand -> red-600
		})

		it('should support all color variants', () => {
			const colors = [
				'amber',
				'blue',
				'brand',
				'emerald',
				'fuchsia',
				'green',
				'indigo',
				'primary',
				'purple',
				'red',
				'sky',
				'slate',
				'teal',
				'yellow',
			] as const

			colors.forEach((color) => {
				const classes = dashboardIconVariants({ color })
				const expectedBg =
					color === 'brand'
						? 'bg-red-600'
						: color === 'primary'
							? 'bg-emerald-600'
							: `bg-${color}-600`
				expect(classes).toContain(expectedBg)
			})
		})
	})

	describe('RTL Support', () => {
		it('should have RTL-aware glow positioning', () => {
			const glowClasses = panelGlowVariants({ color: 'teal' })

			// Should have both LTR and RTL positioning classes
			expect(glowClasses).toContain('-right-8') // LTR: top-right
			expect(glowClasses).toContain('rtl:-left-8') // RTL: top-left
			expect(glowClasses).toContain('rtl:right-auto') // RTL: reset right positioning
		})

		it('should maintain consistent positioning structure', () => {
			const colors = ['brand', 'teal', 'blue', 'emerald'] as const

			colors.forEach((color) => {
				const classes = panelGlowVariants({ color })
				expect(classes).toContain('-top-8')
				expect(classes).toContain('-right-8')
				expect(classes).toContain('rtl:-left-8')
				expect(classes).toContain('rtl:right-auto')
			})
		})
	})

	describe('Dashboard Variant Integration', () => {
		it('should combine panel and dashboard icon variants correctly', () => {
			const panelClasses = panelVariants({
				variant: 'dashboard-panel',
				color: 'teal',
			})
			const iconClasses = dashboardIconVariants({ color: 'brand' })

			// Panel should have dashboard layout classes
			expect(panelClasses).toContain('[&_.dashboard-content]:flex')
			expect(panelClasses).toContain('border-teal-300')
			expect(panelClasses).toContain('panel-teal-bg')

			// Icon should have brand color background
			expect(iconClasses).toContain('bg-red-600')
			expect(iconClasses).toContain('text-white')
		})

		it('should support independent color selection for panel and icon', () => {
			// Panel with teal color, icon with brand color (red background)
			const panelClasses = panelVariants({
				variant: 'dashboard-panel',
				color: 'teal',
			})
			const iconClasses = dashboardIconVariants({ color: 'brand' })
			const glowClasses = panelGlowVariants({ color: 'teal' })

			expect(panelClasses).toContain('border-teal-300') // teal panel
			expect(iconClasses).toContain('bg-red-600') // brand icon (red)
			expect(glowClasses).toContain('bg-teal-400/30') // teal glow
		})
	})

	describe('panelNumberVariants (basePanelNumberVariants)', () => {
		it('should generate correct base classes', () => {
			const classes = panelNumberVariants({})
			expect(classes).toContain('absolute')
			expect(classes).toContain('top-8')
			expect(classes).toContain('-left-4')
			expect(classes).toContain('z-30')
			expect(classes).toContain('flex')
			expect(classes).toContain('h-8')
			expect(classes).toContain('w-8')
			expect(classes).toContain('items-center')
			expect(classes).toContain('justify-center')
			expect(classes).toContain('rounded-full')
			expect(classes).toContain('text-sm')
			expect(classes).toContain('font-bold')
			expect(classes).toContain('shadow-lg')
			expect(classes).toContain('rtl:-right-4')
			expect(classes).toContain('rtl:left-auto')
		})

		it('should apply color variants correctly', () => {
			const brandNumber = panelNumberVariants({ color: 'brand' })
			expect(brandNumber).toContain('bg-brand-600')

			const tealNumber = panelNumberVariants({ color: 'teal' })
			expect(tealNumber).toContain('bg-teal-600')

			const emeraldNumber = panelNumberVariants({ color: 'emerald' })
			expect(emeraldNumber).toContain('bg-emerald-600')
		})

		it('should apply disabled variant with gray styling', () => {
			const disabledNumber = panelNumberVariants({ disabled: true })
			expect(disabledNumber).toContain('bg-gray-200')
			expect(disabledNumber).toContain('!text-gray-700')
		})

		it('should use correct default variants', () => {
			const defaultNumber = panelNumberVariants({})
			expect(defaultNumber).toContain('bg-brand-600') // default color: brand
			expect(defaultNumber).not.toContain('bg-gray-200') // default disabled: false
		})

		it('should override color with disabled styling when disabled=true', () => {
			const disabledTealNumber = panelNumberVariants({
				color: 'teal',
				disabled: true,
			})
			// Should have both color and disabled classes, but disabled takes precedence
			expect(disabledTealNumber).toContain('bg-teal-600')
			expect(disabledTealNumber).toContain('bg-gray-200')
			expect(disabledTealNumber).toContain('!text-gray-700')
		})
	})
})
