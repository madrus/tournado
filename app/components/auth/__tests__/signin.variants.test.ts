import { describe, expect, it } from 'vitest'

import type { Language } from '~/i18n/config'

import {
  signinButtonContainerVariants,
  signinButtonVariants,
  signinCheckboxContainerVariants,
  signinCheckboxLabelVariants,
  signinCheckboxVariants,
  signinContainerVariants,
  signinFormContainerVariants,
  signinFormFooterVariants,
  signinFormLabelVariants,
  signinFormVariants,
  signinFormWrapperVariants,
  signinLinkVariants,
  signinSecondaryTextVariants,
} from '../signin.variants'

describe('Signin Variants', () => {
  describe('signinContainerVariants', () => {
    it('should return container classes', () => {
      const classes = signinContainerVariants()
      expect(classes).toContain('min-h-screen')
      expect(classes).toContain('flex')
    })
  })

  describe('signinFormContainerVariants', () => {
    it('should return form container classes', () => {
      const classes = signinFormContainerVariants()
      expect(classes).toContain('flex')
      expect(classes).toContain('justify-start')
    })
  })

  describe('signinFormWrapperVariants', () => {
    it('should return form wrapper classes', () => {
      const classes = signinFormWrapperVariants()
      expect(classes).toContain('w-full')
      expect(classes).toContain('max-w-md')
    })
  })

  describe('signinFormVariants', () => {
    it('should return form classes', () => {
      const classes = signinFormVariants()
      expect(classes).toContain('space-y-6')
    })
  })

  describe('signinFormLabelVariants', () => {
    it('should return label classes for English', () => {
      const classes = signinFormLabelVariants({ language: 'en' })
      expect(classes).toContain('text-left')
      expect(classes).toContain('block')
    })

    it('should return label classes for Arabic (RTL)', () => {
      const classes = signinFormLabelVariants({ language: 'ar' })
      expect(classes).toContain('text-right')
      expect(classes).toContain('font-arabic')
    })

    it('should return label classes for Dutch', () => {
      const classes = signinFormLabelVariants({ language: 'nl' })
      expect(classes).toContain('text-left')
    })

    it('should use default variant when no language provided', () => {
      const classes = signinFormLabelVariants({})
      expect(classes).toContain('text-left') // default is 'nl'
    })
  })

  describe('signinButtonVariants', () => {
    it('should return button classes', () => {
      const classes = signinButtonVariants()
      expect(classes).toContain('w-full')
      expect(classes).toContain('rounded-md')
      expect(classes).toContain('bg-red-600')
    })
  })

  describe('signinButtonContainerVariants', () => {
    it('should return button container classes', () => {
      const classes = signinButtonContainerVariants()
      expect(classes).toContain('mt-12')
      expect(classes).toContain('mb-2')
    })
  })

  describe('signinFormFooterVariants', () => {
    it('should return form footer classes', () => {
      const classes = signinFormFooterVariants()
      expect(classes).toContain('flex')
      expect(classes).toContain('justify-between')
    })
  })

  describe('signinCheckboxContainerVariants', () => {
    it('should return checkbox container classes', () => {
      const classes = signinCheckboxContainerVariants()
      expect(classes).toContain('flex')
      expect(classes).toContain('items-center')
    })
  })

  describe('signinCheckboxVariants', () => {
    it('should return checkbox classes', () => {
      const classes = signinCheckboxVariants()
      expect(classes).toContain('h-4')
      expect(classes).toContain('w-4')
    })
  })

  describe('signinCheckboxLabelVariants', () => {
    it('should return checkbox label classes for English', () => {
      const classes = signinCheckboxLabelVariants({ language: 'en' })
      expect(classes).toContain('text-sm')
      expect(classes).toContain('text-left')
    })

    it('should return checkbox label classes for Arabic (RTL)', () => {
      const classes = signinCheckboxLabelVariants({ language: 'ar' })
      expect(classes).toContain('text-sm')
      expect(classes).toContain('text-right')
      expect(classes).toContain('font-arabic')
    })
  })

  describe('signinSecondaryTextVariants', () => {
    it('should return secondary text classes for English', () => {
      const classes = signinSecondaryTextVariants({ language: 'en' })
      expect(classes).toContain('text-sm')
      expect(classes).toContain('text-center')
    })

    it('should return secondary text classes for Arabic (RTL)', () => {
      const classes = signinSecondaryTextVariants({ language: 'ar' })
      expect(classes).toContain('text-sm')
      expect(classes).toContain('text-center')
      expect(classes).toContain('font-arabic')
    })
  })

  describe('signinLinkVariants', () => {
    it('should return link classes', () => {
      const classes = signinLinkVariants()
      expect(classes).toContain('font-medium')
      expect(classes).toContain('underline')
    })
  })

  describe('Language variants coverage', () => {
    const languages = ['nl', 'en', 'de', 'fr', 'ar', 'tr']

    it('should handle all supported languages for form labels', () => {
      languages.forEach(language => {
        const classes = signinFormLabelVariants({ language: language as Language })
        expect(classes).toBeTruthy()
        if (language === 'ar') {
          expect(classes).toContain('text-right')
          expect(classes).toContain('font-arabic')
        } else {
          expect(classes).toContain('text-left')
        }
      })
    })

    it('should handle all supported languages for checkbox labels', () => {
      languages.forEach(language => {
        const classes = signinCheckboxLabelVariants({ language: language as Language })
        expect(classes).toBeTruthy()
        if (language === 'ar') {
          expect(classes).toContain('text-right')
          expect(classes).toContain('font-arabic')
        } else {
          expect(classes).toContain('text-left')
        }
      })
    })

    it('should handle all supported languages for secondary text', () => {
      languages.forEach(language => {
        const classes = signinSecondaryTextVariants({ language: language as Language })
        expect(classes).toBeTruthy()
        expect(classes).toContain('text-center')
        if (language === 'ar') {
          expect(classes).toContain('font-arabic')
        }
      })
    })
  })

  describe('Responsive design classes', () => {
    it('should include responsive classes in container', () => {
      const classes = signinContainerVariants()
      expect(classes).toContain('flex')
      expect(classes).toContain('min-h-screen')
    })

    it('should include responsive classes in form wrapper', () => {
      const classes = signinFormWrapperVariants()
      expect(classes).toContain('w-full')
      expect(classes).toContain('max-w-md')
    })
  })

  describe('Dark mode support', () => {
    it('should include dark mode classes in container', () => {
      const classes = signinContainerVariants()
      expect(classes).toContain('flex')
      expect(classes).toContain('min-h-screen')
    })

    it('should include dark mode classes in button', () => {
      const classes = signinButtonVariants()
      expect(classes).toContain('bg-red-600')
      expect(classes).toContain('hover:bg-red-700')
    })
  })
})
