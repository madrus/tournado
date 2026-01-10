import { describe, expect, it } from 'vitest'
import {
	getCancelButtonColor,
	getColorForIntent,
	getDefaultColorsForIntent,
	getIconForIntent,
} from '../dialog.utils'

describe('dialog.utils', () => {
	describe('getIconForIntent', () => {
		it('returns default icons for each intent', () => {
			expect(getIconForIntent('warning')).toBe('warning')
			expect(getIconForIntent('danger')).toBe('error')
			expect(getIconForIntent('info')).toBe('info')
			expect(getIconForIntent('success')).toBe('success')
		})

		it('returns custom icon when provided', () => {
			expect(getIconForIntent('warning', 'check')).toBe('check')
		})
	})

	describe('getCancelButtonColor', () => {
		it('returns disabled (slate) color', () => {
			expect(getCancelButtonColor()).toBe('disabled')
		})
	})

	describe('getDefaultColorsForIntent', () => {
		it('returns correct confirm and cancel colors for each intent', () => {
			const cancel = 'disabled'
			expect(getDefaultColorsForIntent('warning')).toEqual({
				confirm: 'warning',
				cancel,
			})
			expect(getDefaultColorsForIntent('danger')).toEqual({
				confirm: 'brand',
				cancel,
			})
			expect(getDefaultColorsForIntent('info')).toEqual({
				confirm: 'info',
				cancel,
			})
			expect(getDefaultColorsForIntent('success')).toEqual({
				confirm: 'success',
				cancel,
			})
		})
	})

	describe('getColorForIntent', () => {
		it('returns default confirm color for intent', () => {
			expect(getColorForIntent('warning')).toBe('warning')
			expect(getColorForIntent('danger')).toBe('brand')
			expect(getColorForIntent('info')).toBe('info')
			expect(getColorForIntent('success')).toBe('success')
		})

		it('returns custom color when provided', () => {
			expect(getColorForIntent('warning', 'accent-teal')).toBe('accent-teal')
		})
	})
})
