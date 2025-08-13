import { describe, expect, it } from 'vitest'

import { buttonVariants } from '../button.variants'

describe('Button Variants', () => {
  describe('primary brand button', () => {
    it('should have both light and dark mode shadows', () => {
      const classes = buttonVariants({ variant: 'primary', color: 'brand' })

      // Light mode shadows
      expect(classes).toContain('shadow-brand-700/40')
      expect(classes).toContain('hover:shadow-brand-700/60')

      // Dark mode shadows (light colored for visibility)
      expect(classes).toContain('dark:shadow-slate-100/20')
      expect(classes).toContain('dark:hover:shadow-slate-100/30')
    })

    it('should have proper brand styling', () => {
      const classes = buttonVariants({ variant: 'primary', color: 'brand' })

      expect(classes).toContain('bg-brand-600')
      expect(classes).toContain('border-brand-600')
      expect(classes).toContain('text-white')
    })
  })

  describe('primary color button (emerald)', () => {
    it('should have both light and dark mode shadows', () => {
      const classes = buttonVariants({ variant: 'primary', color: 'primary' })

      // Light mode shadows
      expect(classes).toContain('shadow-primary-700/40')
      expect(classes).toContain('hover:shadow-primary-700/60')

      // Dark mode shadows (light colored for visibility)
      expect(classes).toContain('dark:shadow-slate-100/20')
      expect(classes).toContain('dark:hover:shadow-slate-100/30')
    })

    it('should have proper primary styling', () => {
      const classes = buttonVariants({ variant: 'primary', color: 'primary' })

      expect(classes).toContain('bg-primary-700')
      expect(classes).toContain('border-primary-700')
      expect(classes).toContain('text-white')
    })
  })

  describe('secondary brand button', () => {
    it('should have both light and dark mode shadows', () => {
      const classes = buttonVariants({ variant: 'secondary', color: 'brand' })

      // Light mode shadows
      expect(classes).toContain('shadow-brand-700/40')
      expect(classes).toContain('hover:shadow-brand-700/60')

      // Dark mode shadows (light colored for visibility)
      expect(classes).toContain('dark:shadow-slate-100/20')
      expect(classes).toContain('dark:hover:shadow-slate-100/30')
    })

    it('should have proper secondary brand styling', () => {
      const classes = buttonVariants({ variant: 'secondary', color: 'brand' })

      expect(classes).toContain('bg-brand-50')
      expect(classes).toContain('text-brand-600')
      expect(classes).toContain('border-brand-600')
    })
  })

  describe('secondary primary button', () => {
    it('should have both light and dark mode shadows', () => {
      const classes = buttonVariants({ variant: 'secondary', color: 'primary' })

      // Light mode shadows
      expect(classes).toContain('shadow-primary-700/40')
      expect(classes).toContain('hover:shadow-primary-700/60')

      // Dark mode shadows (light colored for visibility)
      expect(classes).toContain('dark:shadow-slate-100/20')
      expect(classes).toContain('dark:hover:shadow-slate-100/30')
    })

    it('should have proper secondary primary styling', () => {
      const classes = buttonVariants({ variant: 'secondary', color: 'primary' })

      expect(classes).toContain('bg-white/60')
      expect(classes).toContain('text-primary-600')
      expect(classes).toContain('border-primary-700')
    })
  })

  describe('base button styles', () => {
    it('should include essential base classes', () => {
      const classes = buttonVariants()

      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('justify-center')
      expect(classes).toContain('rounded-lg')
      expect(classes).toContain('font-bold')
      expect(classes).toContain('min-h-12')
      expect(classes).toContain('min-w-32')
      expect(classes).toContain('shadow-lg')
      expect(classes).toContain('hover:shadow-xl')
      expect(classes).toContain('transition-all')
      expect(classes).toContain('duration-300')
      expect(classes).toContain('hover:scale-103')
      expect(classes).toContain('active:scale-95')
    })

    it('should include disabled state styling', () => {
      const classes = buttonVariants()

      expect(classes).toContain('disabled:cursor-not-allowed')
      expect(classes).toContain('disabled:opacity-50')
      expect(classes).toContain('disabled:hover:scale-100')
      expect(classes).toContain('disabled:bg-button-neutral-background')
      expect(classes).toContain('disabled:text-button-neutral-text')
      expect(classes).toContain('disabled:shadow-button-neutral-background/70')
    })

    it('should include accessibility features', () => {
      const classes = buttonVariants()

      expect(classes).toContain('focus:outline-none')
      expect(classes).toContain('disabled:hover:ring-0')
      expect(classes).toContain('disabled:focus-visible:ring-0')
      expect(classes).toContain('disabled:focus:ring-0')
    })
  })

  describe('default variants', () => {
    it('should use primary/brand/md as defaults', () => {
      const classes = buttonVariants()

      // Should include primary brand button styling
      expect(classes).toContain('bg-brand-600')
      expect(classes).toContain('border-brand-600')
      expect(classes).toContain('text-white')
      expect(classes).toContain('shadow-brand-700/40')
      expect(classes).toContain('dark:shadow-slate-100/20')
    })
  })

  describe('size variants', () => {
    it('should apply small size classes correctly', () => {
      const classes = buttonVariants({ size: 'sm' })

      expect(classes).toContain('min-h-10')
      expect(classes).toContain('min-w-24')
      expect(classes).toContain('py-2')
      expect(classes).toContain('px-3')
      expect(classes).toContain('text-sm')
    })

    it('should use default size for md', () => {
      const defaultClasses = buttonVariants({ size: 'md' })
      const implicitDefaultClasses = buttonVariants()

      // Should be identical when size is explicitly 'md' vs when not specified
      expect(defaultClasses).toBe(implicitDefaultClasses)
    })
  })

  describe('focus and hover states', () => {
    it('should include proper focus ring styles for brand buttons', () => {
      const classes = buttonVariants({ variant: 'primary', color: 'brand' })

      // Light mode focus rings
      expect(classes).toContain('focus-visible:ring-brand-600')
      expect(classes).toContain('focus-visible:ring-offset-slate-50')
      expect(classes).toContain('hover:ring-brand-600')
      expect(classes).toContain('hover:ring-offset-slate-50')
      expect(classes).toContain('focus:ring-brand-600')
      expect(classes).toContain('focus:ring-offset-slate-50')

      // Dark mode focus rings
      expect(classes).toContain('focus-visible:dark:ring-slate-50')
      expect(classes).toContain('focus-visible:dark:ring-offset-brand-600')
      expect(classes).toContain('hover:dark:ring-slate-50')
      expect(classes).toContain('hover:dark:ring-offset-brand-600')
      expect(classes).toContain('focus:dark:ring-slate-50')
      expect(classes).toContain('focus:dark:ring-offset-brand-600')
    })

    it('should include proper border hover states for primary buttons', () => {
      const classes = buttonVariants({ variant: 'primary', color: 'brand' })

      expect(classes).toContain('hover:dark:border-slate-50')
      expect(classes).toContain('focus-visible:dark:border-slate-50')
    })
  })
})
