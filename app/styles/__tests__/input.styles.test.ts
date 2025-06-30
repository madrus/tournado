import { describe, expect, it } from 'vitest'

import type { ColorAccent } from '~/lib/lib.types'

import {
  getCalendarColorClasses,
  getDropdownItemColorClasses,
  getInputColorClasses,
} from '../input.styles'

describe('Input Styles', () => {
  describe('getInputColorClasses', () => {
    describe('normal state (not disabled, no error)', () => {
      it('should generate correct classes for emerald/primary color', () => {
        const classes = getInputColorClasses('primary', false)

        expect(classes).toContain('border-input-border/30')
        expect(classes).toContain('hover:border-input-hover')
        expect(classes).toContain('focus:border-input-focus')
        expect(classes).toContain('focus:ring-2')
        expect(classes).toContain('focus:ring-input-ring/20')
      })

      it('should generate correct classes for brand/red color', () => {
        const classes = getInputColorClasses('brand', false)

        expect(classes).toContain('border-error/30')
        expect(classes).toContain('hover:border-error')
        expect(classes).toContain('focus:border-error')
        expect(classes).toContain('focus:ring-2')
        expect(classes).toContain('focus:ring-error/20')
      })

      it('should generate correct classes for standard colors', () => {
        const colors: ColorAccent[] = ['blue', 'green', 'purple', 'indigo', 'gray']

        colors.forEach(color => {
          const classes = getInputColorClasses(color, false)

          expect(classes).toContain(`border-${color}-700/30`)
          expect(classes).toContain(`hover:border-${color}-600`)
          expect(classes).toContain(`focus:border-${color}-600`)
          expect(classes).toContain('focus:ring-2')
          expect(classes).toContain(`focus:ring-${color}-600/20`)
        })
      })
    })

    describe('disabled state', () => {
      it('should return disabled classes regardless of color', () => {
        const colors: ColorAccent[] = ['brand', 'primary', 'blue', 'green', 'purple']

        colors.forEach(color => {
          const classes = getInputColorClasses(color, true)
          expect(classes).toBe('border-button-neutral-tertiary-border')
        })
      })

      it('should return disabled classes even with error', () => {
        const classes = getInputColorClasses('brand', true, 'Some error message')
        expect(classes).toBe('border-button-neutral-tertiary-border')
      })
    })

    describe('error state', () => {
      it('should generate error classes regardless of color when error is provided', () => {
        const colors: ColorAccent[] = ['brand', 'primary', 'blue', 'green', 'purple']

        colors.forEach(color => {
          const classes = getInputColorClasses(color, false, 'Some error message')

          expect(classes).toContain('border-error')
          expect(classes).toContain('hover:border-error')
          expect(classes).toContain('focus:border-error')
          expect(classes).toContain('focus:ring-2')
          expect(classes).toContain('focus:ring-error/20')
        })
      })

      it('should NOT generate error classes for empty error string', () => {
        const classes = getInputColorClasses('blue', false, '')

        // Empty string is falsy, so should use normal color classes
        expect(classes).toContain('border-blue-700/30')
        expect(classes).toContain('hover:border-blue-600')
        expect(classes).toContain('focus:border-blue-600')
        expect(classes).toContain('focus:ring-2')
        expect(classes).toContain('focus:ring-blue-600/20')
      })
    })
  })

  describe('getDropdownItemColorClasses', () => {
    it('should generate correct classes for emerald/primary color', () => {
      const classes = getDropdownItemColorClasses('primary')

      expect(classes).toBe('focus:bg-emerald-lightest focus:text-emerald-darkest')
    })

    it('should generate correct classes for brand/red color', () => {
      const classes = getDropdownItemColorClasses('brand')

      expect(classes).toBe('focus:bg-brand-lightest focus:text-brand-darkest')
    })

    it('should generate correct classes for standard colors', () => {
      const colors: ColorAccent[] = ['blue', 'green', 'purple', 'indigo', 'gray']

      colors.forEach(color => {
        const classes = getDropdownItemColorClasses(color)
        expect(classes).toBe(`focus:bg-${color}-50 focus:text-${color}-900`)
      })
    })
  })

  describe('getCalendarColorClasses', () => {
    it('should generate correct classes for emerald/primary color', () => {
      const classes = getCalendarColorClasses('primary')

      expect(classes).toEqual({
        today: 'bg-emerald-lighter text-emerald-darkest',
        hover: 'hover:bg-emerald-lighter',
        navButton: 'text-emerald-dark hover:bg-emerald-lighter',
      })
    })

    it('should generate correct classes for brand/red color', () => {
      const classes = getCalendarColorClasses('brand')

      expect(classes).toEqual({
        today: 'bg-brand-light text-brand-dark',
        hover: 'hover:bg-brand-light',
        navButton: 'text-brand hover:bg-brand-light',
      })
    })

    it('should generate correct classes for standard colors', () => {
      const colors: ColorAccent[] = ['blue', 'green', 'purple', 'indigo', 'gray']

      colors.forEach(color => {
        const classes = getCalendarColorClasses(color)

        expect(classes).toEqual({
          today: `bg-${color}-100 text-${color}-900`,
          hover: `hover:bg-${color}-100`,
          navButton: `text-${color}-600 hover:bg-${color}-100`,
        })
      })
    })

    it('should return object with all required properties', () => {
      const classes = getCalendarColorClasses('blue')

      expect(classes).toHaveProperty('today')
      expect(classes).toHaveProperty('hover')
      expect(classes).toHaveProperty('navButton')
      expect(typeof classes.today).toBe('string')
      expect(typeof classes.hover).toBe('string')
      expect(typeof classes.navButton).toBe('string')
    })
  })

  describe('color resolution consistency', () => {
    it('should handle primary color consistently across all functions', () => {
      const inputClasses = getInputColorClasses('primary', false)
      const dropdownClasses = getDropdownItemColorClasses('primary')
      const calendarClasses = getCalendarColorClasses('primary')

      // All should use emerald variations for primary
      expect(inputClasses).toContain('border-input-border/30') // emerald custom
      expect(dropdownClasses).toContain('emerald-lightest')
      expect(calendarClasses.today).toContain('emerald-lighter')
    })

    it('should handle brand color consistently across all functions', () => {
      const inputClasses = getInputColorClasses('brand', false)
      const dropdownClasses = getDropdownItemColorClasses('brand')
      const calendarClasses = getCalendarColorClasses('brand')

      // All should use red/brand variations for brand
      expect(inputClasses).toContain('border-error/30') // red/error custom
      expect(dropdownClasses).toContain('brand-lightest')
      expect(calendarClasses.today).toContain('brand-light')
    })

    it('should handle standard colors consistently across all functions', () => {
      const testColor = 'blue'
      const inputClasses = getInputColorClasses(testColor, false)
      const dropdownClasses = getDropdownItemColorClasses(testColor)
      const calendarClasses = getCalendarColorClasses(testColor)

      // All should use the standard color pattern
      expect(inputClasses).toContain(`border-${testColor}-700/30`)
      expect(dropdownClasses).toContain(`${testColor}-50`)
      expect(calendarClasses.today).toContain(`${testColor}-100`)
    })
  })
})
