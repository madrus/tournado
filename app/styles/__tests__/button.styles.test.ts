import { describe, expect, it } from 'vitest'

import type { ColorAccent } from '~/lib/lib.types'

import {
  type ButtonVariant,
  commonButtonClasses,
  DEFAULT_BUTTON_COLOR,
  getButtonClasses,
} from '../button.styles'

describe('Button Styles', () => {
  describe('constants', () => {
    it('should have correct default button color', () => {
      expect(DEFAULT_BUTTON_COLOR).toBe('brand')
    })

    it('should include essential common button classes', () => {
      expect(commonButtonClasses).toContain('inline-flex')
      expect(commonButtonClasses).toContain('items-center')
      expect(commonButtonClasses).toContain('justify-center')
      expect(commonButtonClasses).toContain('rounded-lg')
      expect(commonButtonClasses).toContain('font-semibold')
      expect(commonButtonClasses).toContain('min-h-12')
      expect(commonButtonClasses).toContain('min-w-32')
      expect(commonButtonClasses).toContain('disabled:cursor-not-allowed')
      expect(commonButtonClasses).toContain('disabled:opacity-50')
    })
  })

  describe('getButtonClasses', () => {
    describe('primary variant', () => {
      it('should generate correct classes for brand color', () => {
        const classes = getButtonClasses('primary', 'brand')

        expect(classes).toContain('bg-brand-600')
        expect(classes).toContain('text-white')
        expect(classes).toContain('border-brand-600')
        expect(classes).toContain('focus-visible:ring-brand-600')
        expect(classes).toContain('hover:ring-brand-600')
        expect(classes).toContain('shadow-brand-700/40')
        expect(classes).toContain('hover:shadow-brand-700/60')
      })

      it('should generate correct classes for primary color (emerald)', () => {
        const classes = getButtonClasses('primary', 'primary')

        expect(classes).toContain('bg-primary-600')
        expect(classes).toContain('text-white')
        expect(classes).toContain('border-primary-600')
        expect(classes).toContain('focus-visible:ring-primary-600')
        expect(classes).toContain('hover:ring-primary-600')
        expect(classes).toContain('shadow-primary-700/40')
        expect(classes).toContain('hover:shadow-primary-700/60')
      })

      it('should generate correct classes for standard colors', () => {
        const colors: ColorAccent[] = ['blue', 'green', 'purple', 'indigo']

        colors.forEach(color => {
          const classes = getButtonClasses('primary', color)

          expect(classes).toContain(`bg-${color}-600`)
          expect(classes).toContain('text-white')
          expect(classes).toContain(`border-${color}-600`)
          expect(classes).toContain(`focus-visible:ring-${color}-600`)
          expect(classes).toContain(`hover:ring-${color}-600`)
          expect(classes).toContain(`shadow-${color}-700/40`)
          expect(classes).toContain(`hover:shadow-${color}-700/60`)
        })
      })

      it('should use default color when no color specified', () => {
        const classes = getButtonClasses('primary')

        // Should use brand as default
        expect(classes).toContain('bg-brand-600')
        expect(classes).toContain('text-white')
        expect(classes).toContain('border-brand-600')
      })
    })

    describe('secondary variant', () => {
      it('should generate correct classes for brand color', () => {
        const classes = getButtonClasses('secondary', 'brand')

        expect(classes).toContain('bg-transparent')
        expect(classes).toContain('text-brand-600')
        expect(classes).toContain('border-brand-600')
        expect(classes).toContain('focus-visible:ring-brand-600')
        expect(classes).toContain('hover:ring-brand-600')
        expect(classes).toContain('shadow-brand-700/40')
        expect(classes).toContain('hover:shadow-brand-700/60')
      })

      it('should generate correct classes for primary color (emerald)', () => {
        const classes = getButtonClasses('secondary', 'primary')

        expect(classes).toContain('bg-transparent')
        expect(classes).toContain('text-primary-600')
        expect(classes).toContain('border-primary-600')
        expect(classes).toContain('focus-visible:ring-primary-600')
        expect(classes).toContain('hover:ring-primary-600')
        expect(classes).toContain('shadow-primary-700/40')
        expect(classes).toContain('hover:shadow-primary-700/60')
      })

      it('should generate correct classes for standard colors', () => {
        const colors: ColorAccent[] = ['blue', 'green', 'purple', 'indigo']

        colors.forEach(color => {
          const classes = getButtonClasses('secondary', color)

          expect(classes).toContain('bg-transparent')
          expect(classes).toContain(`text-${color}-600`)
          expect(classes).toContain(`border-${color}-600`)
          expect(classes).toContain(`focus-visible:ring-${color}-600`)
          expect(classes).toContain(`hover:ring-${color}-600`)
          expect(classes).toContain(`shadow-${color}-700/40`)
          expect(classes).toContain(`hover:shadow-${color}-700/60`)
        })
      })

      it('should use default color when no color specified', () => {
        const classes = getButtonClasses('secondary')

        // Should use brand as default
        expect(classes).toContain('bg-transparent')
        expect(classes).toContain('text-brand-600')
        expect(classes).toContain('border-brand-600')
      })
    })

    describe('common classes inclusion', () => {
      it('should include common button classes for all variants', () => {
        const variants: ButtonVariant[] = ['primary', 'secondary']
        const colors: ColorAccent[] = ['brand', 'primary', 'blue', 'green']

        variants.forEach(variant => {
          colors.forEach(color => {
            const classes = getButtonClasses(variant, color)

            // Check that common classes are included
            expect(classes).toContain('inline-flex')
            expect(classes).toContain('items-center')
            expect(classes).toContain('justify-center')
            expect(classes).toContain('rounded-lg')
            expect(classes).toContain('font-semibold')
            expect(classes).toContain('min-h-12')
            expect(classes).toContain('disabled:cursor-not-allowed')
            expect(classes).toContain('disabled:opacity-50')
            expect(classes).toContain('focus:outline-none')
            expect(classes).toContain('transition-all')
          })
        })
      })
    })

    describe('disabled state classes', () => {
      it('should include disabled state classes for all button variants', () => {
        const variants: ButtonVariant[] = ['primary', 'secondary']

        variants.forEach(variant => {
          const classes = getButtonClasses(variant, 'brand')

          expect(classes).toContain('disabled:cursor-not-allowed')
          expect(classes).toContain('disabled:opacity-50')
          expect(classes).toContain('disabled:bg-button-neutral-background')
          expect(classes).toContain('disabled:text-button-neutral-text')
          expect(classes).toContain('disabled:border-button-neutral-secondary-border')
          expect(classes).toContain(
            'disabled:hover:shadow-button-neutral-background/70'
          )
          expect(classes).toContain('disabled:hover:ring-0')
          expect(classes).toContain('disabled:hover:ring-offset-0')
          expect(classes).toContain('disabled:hover:scale-100')
        })
      })
    })
  })
})
