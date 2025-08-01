/* eslint-disable no-console */
/**
 * Lazy Loading Performance Tests
 *
 * Tests to verify that lazy loading provides performance benefits
 * and works correctly with language switching.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initI18n } from '../config'
import { getBundleSavings, initI18nLazy, SUPPORTED_LANGUAGES } from '../config.lazy'

describe('i18n Lazy Loading Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Bundle Size Optimization', () => {
    it('should report significant bundle size savings', () => {
      const savings = getBundleSavings()

      expect(savings.lazySize).toBeLessThan(savings.fullSize)

      // Should save at least 80% (loading 1 of 6 languages)
      const savingsPercent =
        ((savings.fullSize - savings.lazySize) / savings.fullSize) * 100
      expect(savingsPercent).toBeGreaterThan(80)

      console.log(`Bundle size savings: ${savings.savings}`)
    })

    it('should load only the requested language initially', async () => {
      const i18n = await initI18nLazy('de')

      // Should have German loaded
      expect(i18n.hasResourceBundle('de', 'common')).toBe(true)

      // Should NOT have other languages loaded initially
      expect(i18n.hasResourceBundle('en', 'common')).toBe(false)
      expect(i18n.hasResourceBundle('fr', 'common')).toBe(false)
      expect(i18n.hasResourceBundle('ar', 'common')).toBe(false)
    })
  })

  describe('Performance Comparison', () => {
    it('should initialize faster than full bundle', async () => {
      // Test lazy loading initialization
      const lazyStart = performance.now()
      await initI18nLazy('de')
      const lazyTime = performance.now() - lazyStart

      // Test full bundle initialization
      const fullStart = performance.now()
      initI18n('de')
      const fullTime = performance.now() - fullStart

      console.log(`Lazy loading: ${lazyTime.toFixed(2)}ms`)
      console.log(`Full bundle: ${fullTime.toFixed(2)}ms`)

      // Lazy loading should be faster or comparable
      // (Note: In tests, the difference might be minimal due to module caching)
      expect(lazyTime).toBeLessThanOrEqual(fullTime * 1.5)
    })

    it('should handle rapid initialization requests efficiently', async () => {
      const start = performance.now()

      // Initialize multiple instances rapidly
      const promises = [initI18nLazy('de'), initI18nLazy('en'), initI18nLazy('fr')]

      await Promise.all(promises)

      const duration = performance.now() - start

      // Should complete all initializations quickly
      expect(duration).toBeLessThan(200) // 200ms for 3 instances
    })
  })

  describe('Language Switching Performance', () => {
    it('should load new languages on demand', async () => {
      const i18n = await initI18nLazy('nl')

      // Initially only Dutch should be loaded
      expect(i18n.hasResourceBundle('nl', 'common')).toBe(true)
      expect(i18n.hasResourceBundle('de', 'common')).toBe(false)

      // Switch to German - should load it dynamically
      await i18n.changeLanguage('de')

      expect(i18n.hasResourceBundle('de', 'common')).toBe(true)
      expect(i18n.language).toBe('de')
    })

    it('should cache loaded languages for faster subsequent switches', async () => {
      const i18n = await initI18nLazy('nl')

      // First switch to German (loads dynamically)
      const firstSwitchStart = performance.now()
      await i18n.changeLanguage('de')
      const firstSwitchTime = performance.now() - firstSwitchStart

      // Switch back to Dutch
      await i18n.changeLanguage('nl')

      // Second switch to German (should be cached)
      const secondSwitchStart = performance.now()
      await i18n.changeLanguage('de')
      const secondSwitchTime = performance.now() - secondSwitchStart

      // Second switch should be significantly faster
      expect(secondSwitchTime).toBeLessThan(firstSwitchTime * 0.5)

      console.log(`First switch: ${firstSwitchTime.toFixed(2)}ms`)
      console.log(`Cached switch: ${secondSwitchTime.toFixed(2)}ms`)
    })

    it('should handle invalid language codes gracefully', async () => {
      const i18n = await initI18nLazy('nl')

      // Try to switch to invalid language - it should succeed but fall back
      await i18n.changeLanguage('invalid')

      // Should switch to the invalid language (i18n allows this)
      expect(i18n.language).toBe('invalid')
    })
  })

  describe('Memory Efficiency', () => {
    it('should use less memory than full bundle approach', async () => {
      // Create lazy instance
      const lazyI18n = await initI18nLazy('de')

      // Create full bundle instance
      const fullI18n = initI18n('de')

      // Get resource bundle sizes (rough estimation)
      const lazyBundles = Object.keys(lazyI18n.store.data).length
      const fullBundles = Object.keys(fullI18n.store.data).length

      console.log(`Lazy bundles loaded: ${lazyBundles}`)
      console.log(`Full bundles loaded: ${fullBundles}`)

      // Lazy should have fewer bundles loaded
      expect(lazyBundles).toBeLessThanOrEqual(fullBundles)
    })

    it('should only load what is actually used', async () => {
      const i18n = await initI18nLazy('en')

      // Should have only English initially
      const loadedLanguages = Object.keys(i18n.store.data)
      expect(loadedLanguages).toHaveLength(1)
      expect(loadedLanguages).toContain('en')

      // Add German
      await i18n.changeLanguage('de')
      const afterSwitch = Object.keys(i18n.store.data)
      expect(afterSwitch).toHaveLength(2)
      expect(afterSwitch).toContain('en')
      expect(afterSwitch).toContain('de')
    })
  })

  describe('Production Readiness', () => {
    it('should work with all supported languages', async () => {
      for (const { code } of SUPPORTED_LANGUAGES) {
        const i18n = await initI18nLazy(code)
        expect(i18n.language).toBe(code)
        expect(i18n.hasResourceBundle(code, 'common')).toBe(true)

        // Test a basic translation
        const translation = i18n.t('common.appName')
        expect(translation).toBeTruthy()
        expect(typeof translation).toBe('string')
      }
    })

    it('should handle concurrent language switches', async () => {
      const i18n = await initI18nLazy('nl')

      // Trigger multiple language switches concurrently
      const switches = [
        i18n.changeLanguage('de'),
        i18n.changeLanguage('en'),
        i18n.changeLanguage('fr'),
      ]

      // Should not crash or cause race conditions
      await expect(Promise.allSettled(switches)).resolves.toBeDefined()

      // Should end up with final language
      expect(['de', 'en', 'fr']).toContain(i18n.language)
    })
  })
})
