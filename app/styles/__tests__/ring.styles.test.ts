import { describe, expect, it } from 'vitest'

import type { ColorAccent } from '~/lib/lib.types'

import {
	getButtonRingClasses,
	getChipRingClasses,
	getDisabledRingClasses,
	getFocusHoverRingClasses,
	getFocusRingClasses,
	getHoverRingClasses,
	getInputRingClasses,
	getRingClasses,
	getTeamChipRingClasses,
	RING_CONFIGS,
	type RingConfig,
} from '../ring.styles'

describe('Ring Styles', () => {
	const mockConfig: RingConfig = {
		ringWidth: 'ring-2',
		ringOffset: 'ring-offset-2',
		lightMode: {
			ringColor: 'emerald-600',
			ringOffsetColor: 'white',
		},
		darkMode: {
			ringColor: 'emerald-400',
			ringOffsetColor: 'slate-900',
		},
	}

	describe('getRingClasses', () => {
		it('should return only color classes, no base ring classes', () => {
			const result = getRingClasses(mockConfig)

			// Should contain color classes
			expect(result).toContain('ring-emerald-600')
			expect(result).toContain('ring-offset-white')
			expect(result).toContain('dark:ring-emerald-400')
			expect(result).toContain('dark:ring-offset-slate-900')

			// Should NOT contain base ring classes (unprefixed)
			expect(result).not.toContain('ring-2')
			expect(result).not.toContain('ring-offset-2')
		})
	})

	describe('getFocusRingClasses', () => {
		it('should return focus-prefixed ring classes', () => {
			const result = getFocusRingClasses(mockConfig)

			// Should contain focus-visible prefixed classes
			expect(result).toContain('focus-visible:ring-2')
			expect(result).toContain('focus-visible:ring-offset-2')
			expect(result).toContain('focus-visible:ring-emerald-600')
			expect(result).toContain('focus-visible:ring-offset-white')

			// Should contain focus prefixed classes
			expect(result).toContain('focus:ring-2')
			expect(result).toContain('focus:ring-offset-2')
			expect(result).toContain('focus:ring-emerald-600')
			expect(result).toContain('focus:ring-offset-white')

			// Should contain outline-none
			expect(result).toContain('focus:outline-none')

			// Should NOT contain unprefixed base classes
			expect(result).not.toMatch(/(?<!focus-visible:)(?<!focus:)ring-2/)
			expect(result).not.toMatch(/(?<!focus-visible:)(?<!focus:)ring-offset-2/)
		})
	})

	describe('getHoverRingClasses', () => {
		it('should return hover-prefixed ring classes', () => {
			const result = getHoverRingClasses(mockConfig)

			// Should contain hover prefixed classes
			expect(result).toContain('hover:ring-2')
			expect(result).toContain('hover:ring-offset-2')
			expect(result).toContain('hover:ring-emerald-600')
			expect(result).toContain('hover:ring-offset-white')

			// Should NOT contain unprefixed base classes
			expect(result).not.toMatch(/(?<!hover:)ring-2/)
			expect(result).not.toMatch(/(?<!hover:)ring-offset-2/)
		})
	})

	describe('getFocusHoverRingClasses', () => {
		it('should combine focus and hover ring classes', () => {
			const result = getFocusHoverRingClasses(mockConfig)

			// Should contain both focus and hover prefixed classes
			expect(result).toContain('focus-visible:ring-2')
			expect(result).toContain('focus:ring-2')
			expect(result).toContain('hover:ring-2')

			// Should NOT contain unprefixed base classes
			expect(result).not.toMatch(/(?<!focus-visible:)(?<!focus:)(?<!hover:)ring-2/)
			expect(result).not.toMatch(
				/(?<!focus-visible:)(?<!focus:)(?<!hover:)ring-offset-2/,
			)
		})
	})

	describe('getDisabledRingClasses', () => {
		it('should return disabled ring classes that override all states', () => {
			const result = getDisabledRingClasses()

			expect(result).toContain('disabled:hover:ring-0')
			expect(result).toContain('disabled:hover:ring-offset-0')
			expect(result).toContain('disabled:focus-visible:ring-0')
			expect(result).toContain('disabled:focus-visible:ring-offset-0')
			expect(result).toContain('disabled:focus:ring-0')
			expect(result).toContain('disabled:focus:ring-offset-0')
		})
	})

	describe('convenience functions', () => {
		it('getButtonRingClasses should return properly prefixed classes', () => {
			const result = getButtonRingClasses('emerald')

			// Should contain prefixed classes
			expect(result).toContain('focus-visible:ring-2')
			expect(result).toContain('hover:ring-2')
			expect(result).toContain('disabled:hover:ring-0')

			// Should NOT contain unprefixed base classes
			expect(result).not.toMatch(
				/(?<!focus-visible:)(?<!focus:)(?<!hover:)(?<!disabled:hover:)(?<!disabled:focus-visible:)(?<!disabled:focus:)ring-2/,
			)
		})

		it('getTeamChipRingClasses should return properly prefixed classes', () => {
			const result = getTeamChipRingClasses()

			// Should contain prefixed classes
			expect(result).toContain('focus-visible:ring-2')
			expect(result).toContain('hover:ring-2')

			// Should NOT contain unprefixed base classes
			expect(result).not.toMatch(/(?<!focus-visible:)(?<!focus:)(?<!hover:)ring-2/)
		})

		it('getChipRingClasses should return properly prefixed classes', () => {
			const result = getChipRingClasses('brand')

			// Should contain prefixed classes
			expect(result).toContain('focus-visible:ring-2')
			expect(result).toContain('hover:ring-2')

			// Should NOT contain unprefixed base classes
			expect(result).not.toMatch(/(?<!focus-visible:)(?<!focus:)(?<!hover:)ring-2/)
		})
	})

	describe('rest state verification', () => {
		it('should ensure no ring classes are applied at rest state', () => {
			const buttonClasses = getButtonRingClasses('emerald')
			const teamChipClasses = getTeamChipRingClasses()
			const chipClasses = getChipRingClasses('brand')

			// Split classes and check that no unprefixed ring classes exist
			const buttonClassList = buttonClasses.split(' ')
			const teamChipClassList = teamChipClasses.split(' ')
			const chipClassList = chipClasses.split(' ')

			// Check that ring-2 and ring-offset-2 only appear with prefixes
			const hasUnprefixedRing = (classes: string[]) =>
				classes.some(
					(cls) =>
						cls === 'ring-2' ||
						cls === 'ring-offset-2' ||
						(cls.startsWith('ring-') && !cls.includes(':') && !cls.includes('dark:')),
				)

			expect(hasUnprefixedRing(buttonClassList)).toBe(false)
			expect(hasUnprefixedRing(teamChipClassList)).toBe(false)
			expect(hasUnprefixedRing(chipClassList)).toBe(false)
		})
	})

	describe('RING_CONFIGS', () => {
		describe('button config', () => {
			it('should return standard colors for non-brand colors', () => {
				const config = RING_CONFIGS.button('emerald')

				expect(config.lightMode.ringColor).toBe('emerald-600')
				expect(config.lightMode.ringOffsetColor).toBe('slate-50')
				expect(config.darkMode.ringColor).toBe('slate-50')
				expect(config.darkMode.ringOffsetColor).toBe('emerald-600')
			})

			it('should return inverted colors for red buttons', () => {
				const config = RING_CONFIGS.button('red')

				expect(config.lightMode.ringColor).toBe('red-600')
				expect(config.lightMode.ringOffsetColor).toBe('slate-50')
				expect(config.darkMode.ringColor).toBe('slate-50')
				expect(config.darkMode.ringOffsetColor).toBe('red-600')
			})

			it('should return inverted colors for brand buttons', () => {
				const config = RING_CONFIGS.button('brand')

				expect(config.lightMode.ringColor).toBe('brand-600')
				expect(config.lightMode.ringOffsetColor).toBe('slate-50')
				expect(config.darkMode.ringColor).toBe('slate-50')
				expect(config.darkMode.ringOffsetColor).toBe('brand-600')
			})

			it('should handle all color variants consistently', () => {
				const colors: ColorAccent[] = ['emerald', 'teal', 'sky', 'blue', 'purple']

				colors.forEach((color) => {
					const config = RING_CONFIGS.button(color)
					expect(config.lightMode.ringColor).toBe(`${color}-600`)
					expect(config.lightMode.ringOffsetColor).toBe('slate-50')
					expect(config.darkMode.ringColor).toBe('slate-50')
					expect(config.darkMode.ringOffsetColor).toBe(`${color}-600`)
				})
			})
		})

		describe('teamChip config', () => {
			it('should return fixed red-white inversion pattern', () => {
				const config = RING_CONFIGS.teamChip()

				expect(config.lightMode.ringColor).toBe('red-600')
				expect(config.lightMode.ringOffsetColor).toBe('slate-50')
				expect(config.darkMode.ringColor).toBe('slate-100')
				expect(config.darkMode.ringOffsetColor).toBe('red-600')
			})
		})

		describe('chip config', () => {
			it('should return color with slate-100 inversion in dark mode', () => {
				const config = RING_CONFIGS.chip('emerald')

				expect(config.lightMode.ringColor).toBe('emerald-600')
				expect(config.lightMode.ringOffsetColor).toBe('slate-50')
				expect(config.darkMode.ringColor).toBe('slate-100')
				expect(config.darkMode.ringOffsetColor).toBe('emerald-600')
			})

			it('should work with different colors', () => {
				const colors: ColorAccent[] = ['brand', 'teal', 'sky', 'blue']

				colors.forEach((color) => {
					const config = RING_CONFIGS.chip(color)
					expect(config.lightMode.ringColor).toBe(`${color}-600`)
					expect(config.lightMode.ringOffsetColor).toBe('slate-50')
					expect(config.darkMode.ringColor).toBe('slate-100')
					expect(config.darkMode.ringOffsetColor).toBe(`${color}-600`)
				})
			})
		})

		describe('input config', () => {
			it('should return subtler colors for form fields', () => {
				const config = RING_CONFIGS.input('emerald')

				expect(config.lightMode.ringColor).toBe('emerald-600')
				expect(config.lightMode.ringOffsetColor).toBe('slate-50')
				expect(config.darkMode.ringColor).toBe('emerald-400')
				expect(config.darkMode.ringOffsetColor).toBe('slate-900')
			})

			it('should use darker offset in dark mode for better contrast', () => {
				const config = RING_CONFIGS.input('blue')

				expect(config.darkMode.ringOffsetColor).toBe('slate-900')
				expect(config.darkMode.ringColor).toBe('blue-400')
			})
		})
	})

	describe('convenience functions comprehensive tests', () => {
		describe('getButtonRingClasses', () => {
			it('should include disabled classes for buttons', () => {
				const result = getButtonRingClasses('emerald')

				expect(result).toContain('disabled:hover:ring-0')
				expect(result).toContain('disabled:focus-visible:ring-0')
				expect(result).toContain('disabled:focus:ring-0')
			})

			it('should generate different classes for different colors', () => {
				const emeraldClasses = getButtonRingClasses('emerald')
				const redClasses = getButtonRingClasses('red')

				expect(emeraldClasses).toContain('ring-emerald-600')
				expect(redClasses).toContain('ring-red-600')

				// Both should have slate-50 in dark mode due to inversion
				expect(emeraldClasses).toContain('dark:ring-slate-50')
				expect(redClasses).toContain('dark:ring-slate-50')
			})

			it('should handle semantic colors properly', () => {
				const primaryClasses = getButtonRingClasses('primary')
				const brandClasses = getButtonRingClasses('brand')

				expect(primaryClasses).toContain('ring-primary-600')
				expect(brandClasses).toContain('ring-brand-600')
			})
		})

		describe('getInputRingClasses', () => {
			it('should generate proper input ring classes', () => {
				const result = getInputRingClasses('emerald')

				expect(result).toContain('focus-visible:ring-emerald-600')
				expect(result).toContain('hover:ring-emerald-600')
				expect(result).toContain('focus:ring-emerald-600')
				expect(result).toContain('dark:ring-emerald-400')
				expect(result).toContain('dark:ring-offset-slate-900')
			})

			it('should not include disabled classes (inputs handle disabled differently)', () => {
				const result = getInputRingClasses('emerald')

				expect(result).not.toContain('disabled:hover:ring-0')
				expect(result).not.toContain('disabled:focus-visible:ring-0')
			})
		})

		describe('color consistency across functions', () => {
			it('should maintain color consistency between button and chip functions', () => {
				const buttonClasses = getButtonRingClasses('emerald')
				const chipClasses = getChipRingClasses('emerald')

				// Both should use emerald-600 in light mode
				expect(buttonClasses).toContain('ring-emerald-600')
				expect(chipClasses).toContain('ring-emerald-600')

				// Button uses slate-50 inversion, chip uses slate-100 inversion
				expect(buttonClasses).toContain('dark:ring-slate-50')
				expect(chipClasses).toContain('dark:ring-slate-100')
			})

			it('should handle special team chip case', () => {
				const teamChipClasses = getTeamChipRingClasses()

				// Team chip always uses red-600, not configurable
				expect(teamChipClasses).toContain('ring-red-600')
				expect(teamChipClasses).toContain('dark:ring-slate-100')
				expect(teamChipClasses).toContain('dark:ring-offset-red-600')
			})
		})

		describe('edge cases and error handling', () => {
			it('should handle brand and primary colors', () => {
				const brandClasses = getButtonRingClasses('brand')
				const primaryClasses = getButtonRingClasses('primary')

				expect(brandClasses).toContain('ring-brand-600')
				expect(primaryClasses).toContain('ring-primary-600')
			})

			it('should handle all valid ColorAccent values', () => {
				const validColors: ColorAccent[] = [
					'red',
					'emerald',
					'blue',
					'brand',
					'primary',
				]

				validColors.forEach((color) => {
					expect(() => getButtonRingClasses(color)).not.toThrow()
					expect(() => getChipRingClasses(color)).not.toThrow()
					expect(() => getInputRingClasses(color)).not.toThrow()
				})
			})
		})
	})
})
