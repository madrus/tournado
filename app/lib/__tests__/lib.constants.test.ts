import { describe, expect, test } from 'vitest'

import { resources, SUPPORTED_LANGUAGES } from '~/i18n/config'

import { DIVISIONS } from '../lib.constants'

describe('lib.constants', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    test('should have consistent structure for all languages', () => {
      SUPPORTED_LANGUAGES.forEach(language => {
        expect(language).toHaveProperty('code')
        expect(language).toHaveProperty('name')
        expect(language).toHaveProperty('flag')

        expect(typeof language.code).toBe('string')
        expect(typeof language.name).toBe('string')
        expect(typeof language.flag).toBe('string')

        expect(language.code.trim()).not.toBe('')
        expect(language.name.trim()).not.toBe('')
        expect(language.flag.trim()).not.toBe('')
      })
    })

    test('should have unique language codes', () => {
      const codes = SUPPORTED_LANGUAGES.map(lang => lang.code)
      const uniqueCodes = [...new Set(codes)]

      expect(codes).toHaveLength(uniqueCodes.length)
    })

    test('should match languages configured in i18n resources', () => {
      // Get language codes from SUPPORTED_LANGUAGES
      const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(lang => lang.code).sort()

      // Get language codes from i18n resources
      const i18nLanguageCodes = Object.keys(resources).sort()

      // They should match exactly
      expect(supportedLanguageCodes).toEqual(i18nLanguageCodes)
    })

    test('should have all languages present in i18n locale files', () => {
      // This test ensures that for every language in SUPPORTED_LANGUAGES,
      // there is a corresponding locale file in the i18n resources
      SUPPORTED_LANGUAGES.forEach(language => {
        expect(resources).toHaveProperty(language.code)
        expect(resources[language.code as keyof typeof resources]).toBeDefined()
        expect(resources[language.code as keyof typeof resources]).not.toBeNull()
      })
    })
  })

  describe('DIVISIONS', () => {
    test('should contain labels for all supported languages', () => {
      // Get all supported language codes
      const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(lang => lang.code)

      // Check each division
      Object.entries(DIVISIONS).forEach(([_divisionKey, division]) => {
        // Verify that each division has labels for all supported languages
        supportedLanguageCodes.forEach(languageCode => {
          expect(division.labels).toHaveProperty(languageCode)
          expect(
            division.labels[languageCode as keyof typeof division.labels]
          ).toBeTruthy()
          expect(
            typeof division.labels[languageCode as keyof typeof division.labels]
          ).toBe('string')
          expect(
            division.labels[languageCode as keyof typeof division.labels].trim()
          ).not.toBe('')
        })
      })
    })

    test('should not contain labels for unsupported languages', () => {
      // Get all supported language codes
      const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(lang => lang.code)

      // Check each division
      Object.entries(DIVISIONS).forEach(([_divisionKey, division]) => {
        const divisionLanguageCodes = Object.keys(division.labels)

        // Verify that division only contains labels for supported languages
        divisionLanguageCodes.forEach(languageCode => {
          expect(supportedLanguageCodes).toContain(languageCode)
        })
      })
    })

    test('should have consistent structure for all divisions', () => {
      Object.entries(DIVISIONS).forEach(([divisionKey, division]) => {
        // Each division should have required properties
        expect(division).toHaveProperty('value')
        expect(division).toHaveProperty('labels')
        expect(division).toHaveProperty('order')

        // Value should be a string matching the key
        expect(typeof division.value).toBe('string')
        expect(division.value).toBe(divisionKey)

        // Labels should be an object
        expect(typeof division.labels).toBe('object')
        expect(division.labels).not.toBeNull()

        // Order should be a number
        expect(typeof division.order).toBe('number')
        expect(division.order).toBeGreaterThan(0)
      })
    })

    test('should have unique order values', () => {
      const orders = Object.values(DIVISIONS).map(division => division.order)
      const uniqueOrders = [...new Set(orders)]

      expect(orders).toHaveLength(uniqueOrders.length)
    })

    test('should have sequential order values starting from 1', () => {
      const orders = Object.values(DIVISIONS)
        .map(division => division.order)
        .sort()
      const expectedOrders = Array.from({ length: orders.length }, (_, i) => i + 1)

      expect(orders).toEqual(expectedOrders)
    })
  })
})
