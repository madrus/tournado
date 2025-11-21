import { describe, expect, it } from 'vitest'

import {
	type DatatableContainerVariants,
	type DatatableHeaderTextVariants,
	type DatatableHeaderVariants,
	type DatatableRowVariants,
	datatableActionButtonVariants,
	datatableCellTextVariants,
	datatableContainerVariants,
	datatableDeleteAreaVariants,
	datatableHeaderTextVariants,
	datatableHeaderVariants,
	datatableRowVariants,
} from '../dataTable.variants'

describe('dataTable.variants', () => {
	describe('datatableContainerVariants', () => {
		it('should apply default slate color variant', () => {
			const result = datatableContainerVariants()
			expect(result).toContain('border-slate-200')
			expect(result).toContain('bg-slate-50')
			expect(result).toContain('dark:border-slate-800')
			expect(result).toContain('dark:bg-slate-950')
		})

		it('should apply teal color variant', () => {
			const result = datatableContainerVariants({ color: 'teal' })
			expect(result).toContain('border-teal-200')
			expect(result).toContain('bg-teal-50')
			expect(result).toContain('dark:border-teal-800')
			expect(result).toContain('dark:bg-teal-950')
		})

		it('should include base container classes', () => {
			const result = datatableContainerVariants()
			expect(result).toContain('w-full')
			expect(result).toContain('overflow-hidden')
			expect(result).toContain('rounded-lg')
			expect(result).toContain('border')
		})
	})

	describe('datatableHeaderVariants', () => {
		it('should apply default slate color variant', () => {
			const result = datatableHeaderVariants()
			expect(result).toContain('border-slate-200')
			expect(result).toContain('bg-slate-100')
			expect(result).toContain('dark:border-slate-700')
			expect(result).toContain('dark:bg-slate-900')
		})

		it('should apply brand color variant', () => {
			const result = datatableHeaderVariants({ color: 'brand' })
			expect(result).toContain('border-brand-200')
			expect(result).toContain('bg-brand-100')
			expect(result).toContain('dark:border-brand-700')
			expect(result).toContain('dark:bg-brand-900')
		})

		it('should include base header classes', () => {
			const result = datatableHeaderVariants()
			expect(result).toContain('border-b')
			expect(result).toContain('px-3')
			expect(result).toContain('py-3')
		})
	})

	describe('datatableHeaderTextVariants', () => {
		it('should apply default slate color variant', () => {
			const result = datatableHeaderTextVariants()
			expect(result).toContain('text-adaptive-slate-header')
		})

		it('should apply emerald color variant', () => {
			const result = datatableHeaderTextVariants({ color: 'emerald' })
			expect(result).toContain('text-adaptive-emerald-header')
		})

		it('should include base header text classes', () => {
			const result = datatableHeaderTextVariants()
			expect(result).toContain('text-xs')
			expect(result).toContain('font-medium')
			expect(result).toContain('uppercase')
			expect(result).toContain('tracking-wider')
		})
	})

	describe('datatableRowVariants', () => {
		it('should apply default slate color and default variant', () => {
			const result = datatableRowVariants()
			expect(result).toContain('border-slate-100')
			expect(result).toContain('dark:border-slate-800')
		})

		it('should apply blue color variant', () => {
			const result = datatableRowVariants({ color: 'blue' })
			expect(result).toContain('border-blue-100')
			expect(result).toContain('dark:border-blue-800')
		})

		it('should apply last variant for row styling', () => {
			const result = datatableRowVariants({ variant: 'last' })
			expect(result).toContain('border-b-0')
			expect(result).toContain('rounded-b-lg')
		})

		it('should include base row classes', () => {
			const result = datatableRowVariants()
			expect(result).toContain('border-b')
			expect(result).toContain('transition-colors')
		})

		it('should apply clickable interaction variant by default', () => {
			const result = datatableRowVariants()
			expect(result).toContain('cursor-pointer')
		})

		it('should apply static interaction variant when specified', () => {
			const result = datatableRowVariants({ interaction: 'static' })
			expect(result).not.toContain('cursor-pointer')
		})
	})

	describe('datatableCellTextVariants', () => {
		it('should apply default primary variant', () => {
			const result = datatableCellTextVariants()
			expect(result).toContain('text-adaptive-cell-primary')
			expect(result).toContain('font-medium')
		})

		it('should apply secondary variant', () => {
			const result = datatableCellTextVariants({ variant: 'secondary' })
			expect(result).toContain('text-adaptive-cell-secondary')
		})

		it('should apply muted variant', () => {
			const result = datatableCellTextVariants({ variant: 'muted' })
			expect(result).toContain('text-adaptive-cell-muted')
		})

		it('should include base cell text classes', () => {
			const result = datatableCellTextVariants()
			expect(result).toContain('text-sm')
		})
	})

	describe('datatableActionButtonVariants', () => {
		it('should apply default view action', () => {
			const result = datatableActionButtonVariants()
			expect(result).toContain('text-slate-500')
			expect(result).toContain('hover:bg-slate-100')
			expect(result).toContain('hover:text-slate-700')
			expect(result).toContain('dark:hover:bg-slate-800')
			expect(result).toContain('dark:hover:text-slate-300')
		})

		it('should apply delete action styling', () => {
			const result = datatableActionButtonVariants({ action: 'delete' })
			expect(result).toContain('text-red-500')
			expect(result).toContain('hover:bg-red-100')
			expect(result).toContain('hover:text-red-700')
			expect(result).toContain('dark:hover:bg-red-900/50')
			expect(result).toContain('dark:hover:text-red-300')
		})

		it('should apply edit action styling', () => {
			const result = datatableActionButtonVariants({ action: 'edit' })
			expect(result).toContain('text-blue-500')
			expect(result).toContain('hover:bg-blue-100')
			expect(result).toContain('hover:text-blue-700')
			expect(result).toContain('dark:hover:bg-blue-900/50')
			expect(result).toContain('dark:hover:text-blue-300')
		})

		it('should include base action button classes', () => {
			const result = datatableActionButtonVariants()
			expect(result).toContain('flex')
			expect(result).toContain('items-center')
			expect(result).toContain('justify-center')
			expect(result).toContain('rounded-full')
			expect(result).toContain('p-1')
			expect(result).toContain('transition-colors')
			expect(result).toContain('duration-200')
		})
	})

	describe('datatableDeleteAreaVariants', () => {
		it('should apply default red color variant', () => {
			const result = datatableDeleteAreaVariants()
			expect(result).toContain('bg-red-500')
			expect(result).toContain('dark:bg-red-600')
		})

		it('should apply brand color variant', () => {
			const result = datatableDeleteAreaVariants({ color: 'brand' })
			expect(result).toContain('bg-brand-500')
			expect(result).toContain('dark:bg-brand-600')
		})

		it('should include base delete area classes', () => {
			const result = datatableDeleteAreaVariants()
			expect(result).toContain('flex')
			expect(result).toContain('w-screen')
			expect(result).toContain('flex-shrink-0')
			expect(result).toContain('items-center')
			expect(result).toContain('justify-center')
		})
	})

	describe('color variants consistency', () => {
		const colors = ['slate', 'teal', 'blue', 'emerald', 'brand', 'red', 'cyan', 'yellow', 'green']

		it('should support all color variants for container', () => {
			colors.forEach((color) => {
				expect(() =>
					datatableContainerVariants({
						color: color as DatatableContainerVariants['color'],
					}),
				).not.toThrow()
			})
		})

		it('should support all color variants for header', () => {
			colors.forEach((color) => {
				expect(() =>
					datatableHeaderVariants({
						color: color as DatatableHeaderVariants['color'],
					}),
				).not.toThrow()
			})
		})

		it('should support all color variants for header text', () => {
			colors.forEach((color) => {
				expect(() =>
					datatableHeaderTextVariants({
						color: color as DatatableHeaderTextVariants['color'],
					}),
				).not.toThrow()
			})
		})

		it('should support all color variants for rows', () => {
			colors.forEach((color) => {
				expect(() =>
					datatableRowVariants({
						color: color as DatatableRowVariants['color'],
					}),
				).not.toThrow()
			})
		})
	})

	describe('variant combinations', () => {
		it('should handle multiple variant combinations for rows', () => {
			const result = datatableRowVariants({ color: 'teal', variant: 'last' })
			expect(result).toContain('border-teal-100')
			expect(result).toContain('border-b-0')
			expect(result).toContain('rounded-b-lg')
		})

		it('should maintain proper dark mode styling across variants', () => {
			const containerResult = datatableContainerVariants({ color: 'emerald' })
			const headerResult = datatableHeaderVariants({ color: 'emerald' })
			const rowResult = datatableRowVariants({ color: 'emerald' })

			expect(containerResult).toContain('dark:border-emerald-800')
			expect(headerResult).toContain('dark:bg-emerald-900')
			expect(rowResult).toContain('dark:border-emerald-800')
		})
	})
})
