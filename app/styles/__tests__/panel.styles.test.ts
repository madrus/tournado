import { describe, expect, it } from 'vitest'

import type { ColorAccent } from '~/lib/lib.types'

import {
  colorClasses,
  getActionLinkPanelClasses,
  getDescriptionClasses,
  getIconTextClasses,
  getPanelClasses,
  getTitleClasses,
  resolveColorAccent,
} from '../panel.styles'

describe('Panel Styles', () => {
  describe('resolveColorAccent', () => {
    it('should return primary unchanged', () => {
      expect(resolveColorAccent('primary')).toBe('primary')
    })

    it('should return brand unchanged', () => {
      expect(resolveColorAccent('brand')).toBe('brand')
    })

    it('should return standard colors unchanged', () => {
      const colors: ColorAccent[] = [
        'blue',
        'green',
        'purple',
        'indigo',
        'slate',
        'teal',
      ]

      colors.forEach(color => {
        expect(resolveColorAccent(color)).toBe(color)
      })
    })
  })

  describe('getPanelClasses', () => {
    it('should generate correct classes for primary color', () => {
      const classes = getPanelClasses('primary')

      expect(classes.base).toContain('border-primary-400')
      expect(classes.base).toContain('bg-gradient-to-br')
      expect(classes.base).toContain('from-primary-950')
      expect(classes.base).toContain('via-primary-900')
      expect(classes.base).toContain('to-primary-900')
      expect(classes.background).toContain('bg-gradient-to-br')
      expect(classes.background).toContain('from-primary-950')
      expect(classes.icon).toContain('border-primary-400/70')
      expect(classes.icon).toContain('bg-primary-400/10')
      expect(classes.glow).toContain('bg-primary-400/30')
    })

    it('should generate correct classes for brand color with special slate gradient', () => {
      const classes = getPanelClasses('brand')

      expect(classes.base).toContain('border-brand-400')
      expect(classes.base).toContain('bg-gradient-to-br')
      expect(classes.base).toContain('from-brand-from')
      expect(classes.base).toContain('via-brand-via')
      expect(classes.base).toContain('to-brand-to')
      expect(classes.background).toContain('from-brand-from')
      expect(classes.background).toContain('via-brand-via')
      expect(classes.background).toContain('to-brand-to')
      expect(classes.icon).toContain('border-brand-400/70')
      expect(classes.icon).toContain('bg-brand-400/10')
      expect(classes.glow).toContain('bg-brand-400/30')
    })

    it('should generate correct classes for standard colors', () => {
      const colors: ColorAccent[] = [
        'blue',
        'green',
        'purple',
        'indigo',
        'slate',
        'teal',
      ]

      colors.forEach(color => {
        const classes = getPanelClasses(color)

        expect(classes.base).toContain(`border-${color}-400`)
        expect(classes.base).toContain('bg-gradient-to-br')
        expect(classes.base).toContain(`from-${color}-950`)
        expect(classes.base).toContain(`via-${color}-900`)
        expect(classes.base).toContain(`to-${color}-900`)
        expect(classes.background).toContain(`from-${color}-950`)
        expect(classes.icon).toContain(`border-${color}-400/70`)
        expect(classes.icon).toContain(`bg-${color}-400/10`)
        expect(classes.glow).toContain(`bg-${color}-400/30`)
      })
    })

    it('should include common base classes for all colors', () => {
      const colors: ColorAccent[] = ['brand', 'primary', 'blue', 'green']

      colors.forEach(color => {
        const classes = getPanelClasses(color)

        expect(classes.base).toContain('relative')
        expect(classes.base).toContain('overflow-hidden')
        expect(classes.base).toContain('rounded-2xl')
        expect(classes.base).toContain('border')
        expect(classes.base).toContain('shadow-xl')
        expect(classes.base).toContain('p-6')
        expect(classes.base).toContain('group')
        expect(classes.base).toContain('cursor-pointer')

        expect(classes.icon).toContain('flex')
        expect(classes.icon).toContain('h-8')
        expect(classes.icon).toContain('w-8')
        expect(classes.icon).toContain('items-center')
        expect(classes.icon).toContain('justify-center')
        expect(classes.icon).toContain('rounded-full')
        expect(classes.icon).toContain('border-2')
        expect(classes.icon).toContain(
          'transition-[border-color,background-color,color]'
        )

        expect(classes.glow).toContain('pointer-events-none')
        expect(classes.glow).toContain('absolute')
        expect(classes.glow).toContain('-top-8')
        expect(classes.glow).toContain('-right-8')
        expect(classes.glow).toContain('h-32')
        expect(classes.glow).toContain('w-32')
        expect(classes.glow).toContain('rounded-full')
        expect(classes.glow).toContain('blur-2xl')
        expect(classes.glow).toContain('opacity-90')
      })
    })
  })

  describe('getTitleClasses', () => {
    it('should generate correct title classes for all colors', () => {
      const colors: ColorAccent[] = ['brand', 'primary', 'blue', 'green', 'purple']

      colors.forEach(color => {
        const classes = getTitleClasses(color)

        expect(classes).toContain('text-lg')
        expect(classes).toContain('font-semibold')
        expect(classes).toContain('break-words')
        expect(classes).toContain('text-title')
      })
    })
  })

  describe('getDescriptionClasses', () => {
    it('should generate correct description classes for primary color', () => {
      const classes = getDescriptionClasses('primary')
      expect(classes).toContain('text-foreground')
      expect(classes).toContain('dark:text-primary-100/80')
    })

    it('should generate correct description classes for brand color', () => {
      const classes = getDescriptionClasses('brand')
      expect(classes).toContain('text-brand-darkest')
      expect(classes).toContain('dark:text-red-200')
    })

    it('should generate correct description classes for standard colors', () => {
      const colors: ColorAccent[] = ['blue', 'green', 'purple', 'indigo', 'slate']

      colors.forEach(color => {
        const classes = getDescriptionClasses(color)
        expect(classes).toContain('text-foreground')
        expect(classes).toContain(`dark:text-${color}-100/80`)
      })
    })
  })

  describe('getIconTextClasses', () => {
    it('should generate correct icon text classes for primary color', () => {
      const classes = getIconTextClasses('primary')

      expect(classes).toContain('transition-colors')
      expect(classes).toContain('duration-500')
      expect(classes).toContain('ease-in-out')
      expect(classes).toContain('text-primary-600')
    })

    it('should generate correct icon text classes for brand color', () => {
      const classes = getIconTextClasses('brand')

      expect(classes).toContain('transition-colors')
      expect(classes).toContain('duration-500')
      expect(classes).toContain('ease-in-out')
      expect(classes).toContain('text-red-600')
    })

    it('should generate correct icon text classes for standard colors', () => {
      const colors: ColorAccent[] = ['blue', 'green', 'purple', 'indigo', 'slate']

      colors.forEach(color => {
        const classes = getIconTextClasses(color)

        expect(classes).toContain('transition-colors')
        expect(classes).toContain('duration-500')
        expect(classes).toContain('ease-in-out')
        expect(classes).toContain(`text-${color}-600`)
      })
    })
  })

  describe('getActionLinkPanelClasses', () => {
    it('should generate correct classes for primary color', () => {
      const classes = getActionLinkPanelClasses('primary')

      expect(classes.base).toContain('group')
      expect(classes.base).toContain('rounded-lg')
      expect(classes.base).toContain('border')
      expect(classes.base).toContain('bg-white')
      expect(classes.base).toContain('p-6')
      expect(classes.base).toContain('shadow-sm')
      expect(classes.base).toContain('transition-all')
      expect(classes.base).toContain('hover:shadow-md')
      expect(classes.base).toContain('hover:border-emerald-400')
      expect(classes.base).toContain('hover:bg-emerald-50/30')

      expect(classes.icon).toContain('border-emerald-600')
      expect(classes.icon).toContain('group-hover:border-emerald-700')
      expect(classes.icon).toContain('group-hover:bg-emerald-50')

      expect(classes.title).toContain('text-lg')
      expect(classes.title).toContain('font-semibold')
      expect(classes.title).toContain('group-hover:text-emerald-700')

      expect(classes.description).toContain('text-foreground')
      expect(classes.description).toContain('group-hover:text-emerald-600')

      expect(classes.focus).toContain('focus:ring-emerald-500')
      expect(classes.focus).toContain('focus:ring-2')
      expect(classes.focus).toContain('focus:ring-offset-2')
      expect(classes.focus).toContain('focus:outline-none')
    })

    it('should generate correct classes for brand color', () => {
      const classes = getActionLinkPanelClasses('brand')

      expect(classes.base).toContain('hover:border-brand-400')
      expect(classes.base).toContain('hover:bg-brand-100/30')
      expect(classes.icon).toContain('border-brand-600')
      expect(classes.icon).toContain('group-hover:border-brand-700')
      expect(classes.title).toContain('group-hover:text-brand-700')
      expect(classes.description).toContain('group-hover:text-brand-600')
      expect(classes.focus).toContain('focus:ring-brand-500')
    })

    it('should generate correct classes for standard colors', () => {
      const classes = getActionLinkPanelClasses('blue')

      expect(classes.base).toContain('hover:border-blue-300')
      expect(classes.base).toContain('hover:bg-blue-50/30')
      expect(classes.icon).toContain('border-blue-600')
      expect(classes.icon).toContain('group-hover:border-blue-700')
      expect(classes.title).toContain('group-hover:text-blue-700')
      expect(classes.description).toContain('group-hover:text-blue-600')
      expect(classes.focus).toContain('focus:ring-blue-500')
    })

    it('should return object with all required properties', () => {
      const classes = getActionLinkPanelClasses('blue')

      expect(classes).toHaveProperty('base')
      expect(classes).toHaveProperty('icon')
      expect(classes).toHaveProperty('title')
      expect(classes).toHaveProperty('description')
      expect(classes).toHaveProperty('focus')
      expect(typeof classes.base).toBe('string')
      expect(typeof classes.icon).toBe('string')
      expect(typeof classes.title).toBe('string')
      expect(typeof classes.description).toBe('string')
      expect(typeof classes.focus).toBe('string')
    })

    it('should fallback to emerald for unknown colors', () => {
      // Testing internal resolvePanelColor function through getActionLinkPanelClasses
      const classes = getActionLinkPanelClasses('unknownColor' as ColorAccent)

      // Should fallback to emerald classes
      expect(classes.base).toContain('hover:border-emerald-400')
      expect(classes.icon).toContain('border-emerald-600')
      expect(classes.focus).toContain('focus:ring-emerald-500')
    })
  })

  describe('colorClasses constant', () => {
    it('should contain all expected color schemes', () => {
      const expectedColors = ['emerald', 'blue', 'slate', 'brand', 'teal']

      expectedColors.forEach(color => {
        expect(colorClasses).toHaveProperty(color)
      })
    })

    it('should have consistent structure for all color schemes', () => {
      const requiredProperties = [
        'border',
        'hoverBorder',
        'hoverBg',
        'focus',
        'iconBorder',
        'iconHoverBorder',
        'iconHoverBg',
        'titleHover',
        'textHover',
      ]

      Object.keys(colorClasses).forEach(colorKey => {
        const colorAccent = colorClasses[colorKey as keyof typeof colorClasses]

        requiredProperties.forEach(prop => {
          expect(colorAccent).toHaveProperty(prop)
          expect(typeof colorAccent[prop as keyof typeof colorAccent]).toBe('string')
        })
      })
    })
  })

  describe('color consistency', () => {
    it('should handle primary color consistently across all functions', () => {
      const panelClasses = getPanelClasses('primary')
      const titleClasses = getTitleClasses('primary')
      const descriptionClasses = getDescriptionClasses('primary')
      const iconTextClasses = getIconTextClasses('primary')

      // All should use primary semantic colors
      expect(panelClasses.base).toContain('border-primary-400')
      expect(titleClasses).toContain('text-title')
      expect(descriptionClasses).toContain('text-foreground')
      expect(descriptionClasses).toContain('dark:text-primary-100/80')
      expect(iconTextClasses).toContain('text-primary-600')
    })

    it('should handle brand color consistently across all functions', () => {
      const panelClasses = getPanelClasses('brand')
      const titleClasses = getTitleClasses('brand')
      const descriptionClasses = getDescriptionClasses('brand')
      const iconTextClasses = getIconTextClasses('brand')

      // All should use brand semantic colors
      expect(panelClasses.base).toContain('border-brand-400')
      expect(titleClasses).toContain('text-title')
      expect(descriptionClasses).toContain('text-brand-darkest')
      expect(descriptionClasses).toContain('dark:text-red-200')
      expect(iconTextClasses).toContain('text-red-600')
    })

    it('should handle brand gradient special case', () => {
      const brandClasses = getPanelClasses('brand')
      const standardClasses = getPanelClasses('blue')

      // Brand should use semantic panel gradient, standard should use color gradient
      expect(brandClasses.background).toContain('from-brand-from')
      expect(brandClasses.background).toContain('via-brand-via')
      expect(brandClasses.background).toContain('to-brand-to')

      expect(standardClasses.background).toContain('from-blue-950')
      expect(standardClasses.background).toContain('via-blue-900')
      expect(standardClasses.background).toContain('to-blue-900')
    })
  })
})
