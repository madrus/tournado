import { describe, expect, it } from 'vitest'
import {
  dialogContentVariants,
  dialogOverlayVariants,
  iconColorVariants,
  iconContainerVariants,
  titleColorVariants,
} from '../dialog.variants'

describe('dialog.variants', () => {
  describe('dialogContentVariants', () => {
    it('returns correct classes for warning intent', () => {
      const classes = dialogContentVariants({ intent: 'warning' })
      expect(classes).toContain('bg-warning-50')
    })

    it('returns correct classes for danger intent', () => {
      const classes = dialogContentVariants({ intent: 'danger' })
      expect(classes).toContain('bg-brand-50')
    })

    it('returns correct classes for info intent', () => {
      const classes = dialogContentVariants({ intent: 'info' })
      expect(classes).toContain('bg-info-50')
    })

    it('returns correct classes for success intent', () => {
      const classes = dialogContentVariants({ intent: 'success' })
      expect(classes).toContain('bg-success-50')
    })

    it('returns correct classes for different sizes', () => {
      expect(dialogContentVariants({ size: 'sm' })).toContain('max-w-sm')
      expect(dialogContentVariants({ size: 'md' })).toContain('max-w-md')
      expect(dialogContentVariants({ size: 'lg' })).toContain('max-w-lg')
    })
  })

  describe('dialogOverlayVariants', () => {
    it('returns base overlay classes', () => {
      const classes = dialogOverlayVariants()
      expect(classes).toContain('fixed inset-0')
      expect(classes).toContain('backdrop-blur-md')
    })
  })

  describe('iconContainerVariants', () => {
    it('returns correct classes for each intent', () => {
      expect(iconContainerVariants({ intent: 'warning' })).toContain('bg-warning-100')
      expect(iconContainerVariants({ intent: 'danger' })).toContain('bg-brand-100')
      expect(iconContainerVariants({ intent: 'info' })).toContain('bg-info-100')
      expect(iconContainerVariants({ intent: 'success' })).toContain('bg-success-100')
    })
  })

  describe('iconColorVariants', () => {
    it('returns correct classes for each intent', () => {
      expect(iconColorVariants({ intent: 'warning' })).toContain('text-warning-600')
      expect(iconColorVariants({ intent: 'danger' })).toContain('text-brand-600')
      expect(iconColorVariants({ intent: 'info' })).toContain('text-info-600')
      expect(iconColorVariants({ intent: 'success' })).toContain('text-success-600')
    })
  })

  describe('titleColorVariants', () => {
    it('returns correct classes for each intent', () => {
      expect(titleColorVariants({ intent: 'warning' })).toContain('text-warning-900')
      expect(titleColorVariants({ intent: 'danger' })).toContain('text-brand-900')
      expect(titleColorVariants({ intent: 'info' })).toContain('text-info-900')
      expect(titleColorVariants({ intent: 'success' })).toContain('text-success-900')
    })
  })
})
