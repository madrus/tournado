/**
 * Translation Key Coverage Tests
 *
 * Automated verification that all translation keys exist in all locales
 * and that no keys are missing or orphaned.
 */
import { describe, expect, it } from 'vitest'

import { resources, SUPPORTED_LANGUAGES } from '../config'

// Helper function to get all keys from a nested object
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys.sort()
}

// Helper function to get missing keys
const getMissingKeys = (referenceKeys: string[], compareKeys: string[]): string[] =>
  referenceKeys.filter(key => !compareKeys.includes(key))

// Helper function to get extra keys
const getExtraKeys = (referenceKeys: string[], compareKeys: string[]): string[] =>
  compareKeys.filter(key => !referenceKeys.includes(key))

describe('Translation Key Coverage', () => {
  describe('Complete Key Coverage', () => {
    it('should have all translation keys in every locale', () => {
      // Use Dutch as reference (primary language)
      const referenceLocale = 'nl'
      const referenceKeys = getAllKeys(
        resources[referenceLocale].common as Record<string, unknown>
      )

      expect(referenceKeys.length).toBeGreaterThan(0)

      // Check each locale against reference
      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        if (code === referenceLocale) return

        const localeKeys = getAllKeys(
          resources[code as keyof typeof resources].common as Record<string, unknown>
        )
        const missingKeys = getMissingKeys(referenceKeys, localeKeys)

        expect(
          missingKeys,
          `Missing keys in ${code}: ${missingKeys.join(', ')}`
        ).toHaveLength(0)
      })
    })

    it('should not have orphaned keys in any locale', () => {
      const referenceLocale = 'nl'
      const referenceKeys = getAllKeys(
        resources[referenceLocale].common as Record<string, unknown>
      )

      // Check each locale for extra keys
      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        if (code === referenceLocale) return

        const localeKeys = getAllKeys(
          resources[code as keyof typeof resources].common as Record<string, unknown>
        )
        const extraKeys = getExtraKeys(referenceKeys, localeKeys)

        expect(
          extraKeys,
          `Extra keys in ${code}: ${extraKeys.join(', ')}`
        ).toHaveLength(0)
      })
    })
  })

  describe('Critical Key Verification', () => {
    const criticalKeys = [
      'common.appName',
      'common.titles.teams',
      'common.titles.tournaments',
      'auth.emailAddress',
      'auth.password',
      'auth.signin',
      'auth.signup',
      'auth.errors.invalidCredentials',
    ]

    it('should have all critical keys in every locale', () => {
      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        const localeKeys = getAllKeys(
          resources[code as keyof typeof resources].common as Record<string, unknown>
        )

        criticalKeys.forEach(criticalKey => {
          expect(
            localeKeys,
            `Critical key '${criticalKey}' missing in ${code}`
          ).toContain(criticalKey)
        })
      })
    })

    it('should have non-empty values for critical keys', () => {
      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        const localeData = resources[code as keyof typeof resources].common as Record<
          string,
          unknown
        >

        criticalKeys.forEach(criticalKey => {
          const value = getNestedValue(localeData, criticalKey)
          expect(
            value,
            `Critical key '${criticalKey}' has empty value in ${code}`
          ).toBeTruthy()
          expect(
            typeof value,
            `Critical key '${criticalKey}' should be string in ${code}`
          ).toBe('string')
        })
      })
    })
  })

  describe('Form Validation Coverage', () => {
    const formErrorKeys = [
      'auth.errors.emailRequired',
      'auth.errors.emailInvalid',
      'auth.errors.passwordRequired',
      'auth.errors.passwordTooShort',
      'auth.errors.invalidCredentials',
    ]

    it('should have all form error messages in every locale', () => {
      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        const localeKeys = getAllKeys(
          resources[code as keyof typeof resources].common as Record<string, unknown>
        )

        formErrorKeys.forEach(errorKey => {
          expect(
            localeKeys,
            `Form error key '${errorKey}' missing in ${code}`
          ).toContain(errorKey)
        })
      })
    })
  })

  describe('Navigation Coverage', () => {
    const navigationKeys = [
      'common.titles.welcome',
      'common.titles.teams',
      'common.titles.tournaments',
      'common.titles.profile',
      'common.titles.settings',
      'auth.signout',
    ]

    it('should have all navigation keys in every locale', () => {
      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        const localeKeys = getAllKeys(
          resources[code as keyof typeof resources].common as Record<string, unknown>
        )

        navigationKeys.forEach(navKey => {
          expect(localeKeys, `Navigation key '${navKey}' missing in ${code}`).toContain(
            navKey
          )
        })
      })
    })
  })

  describe('Translation Quality Checks', () => {
    it('should not have placeholder values in translations', () => {
      const placeholderPatterns = [/^TODO:/, /^PLACEHOLDER/, /^\[.*\]$/, /^{{.*}}$/]

      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        const localeData = resources[code as keyof typeof resources].common as Record<
          string,
          unknown
        >
        const allValues = getAllValues(localeData)

        allValues.forEach(value => {
          if (typeof value === 'string') {
            placeholderPatterns.forEach(pattern => {
              expect(
                value,
                `Placeholder value found in ${code}: "${value}"`
              ).not.toMatch(pattern)
            })
          }
        })
      })
    })

    it('should not have empty string translations', () => {
      SUPPORTED_LANGUAGES.forEach(({ code }) => {
        const localeData = resources[code as keyof typeof resources].common as Record<
          string,
          unknown
        >
        const allValues = getAllValues(localeData)

        allValues.forEach((value, index) => {
          if (typeof value === 'string') {
            expect(
              value.trim(),
              `Empty translation found in ${code} at index ${index}`
            ).not.toBe('')
          }
        })
      })
    })

    it('should maintain consistent interpolation variables', () => {
      const referenceLocale = 'nl'
      const referenceData = resources[referenceLocale].common as Record<string, unknown>
      const referenceKeys = getAllKeys(referenceData)

      referenceKeys.forEach(key => {
        const referenceValue = getNestedValue(referenceData, key)
        if (typeof referenceValue !== 'string') return

        const referenceVars = extractInterpolationVars(referenceValue)

        SUPPORTED_LANGUAGES.forEach(({ code }) => {
          if (code === referenceLocale) return

          const localeData = resources[code as keyof typeof resources].common as Record<
            string,
            unknown
          >
          const localeValue = getNestedValue(localeData, key)

          if (typeof localeValue === 'string') {
            const localeVars = extractInterpolationVars(localeValue)

            expect(
              localeVars.sort(),
              `Interpolation variables mismatch in ${code} for key '${key}'`
            ).toEqual(referenceVars.sort())
          }
        })
      })
    })
  })
})

// Helper functions
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce((current, key) => {
    if (typeof current === 'object' && current !== null) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj as unknown)

function getAllValues(obj: Record<string, unknown>): unknown[] {
  const values: unknown[] = []

  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      values.push(...getAllValues(value as Record<string, unknown>))
    } else {
      values.push(value)
    }
  }

  return values
}

function extractInterpolationVars(text: string): string[] {
  const matches = text.match(/\{\{\s*(\w+)\s*\}\}/g)
  return matches ? matches.map(match => match.replace(/[{}]/g, '').trim()) : []
}

describe('Translation Bundle Analysis', () => {
  it('should report translation bundle sizes', () => {
    SUPPORTED_LANGUAGES.forEach(({ code, name }) => {
      const localeData = resources[code as keyof typeof resources].common
      const jsonString = JSON.stringify(localeData)
      const sizeInBytes = new TextEncoder().encode(jsonString).length
      const sizeInKB = (sizeInBytes / 1024).toFixed(2)

      // eslint-disable-next-line no-console
      console.log(`${name} (${code}): ${sizeInKB} KB`)

      // Reasonable size limit (adjust as needed)
      expect(sizeInBytes, `Translation bundle for ${code} is too large`).toBeLessThan(
        50 * 1024
      ) // 50KB limit
    })
  })

  it('should calculate total i18n bundle impact', () => {
    let totalSize = 0

    SUPPORTED_LANGUAGES.forEach(({ code }) => {
      const localeData = resources[code as keyof typeof resources].common
      const jsonString = JSON.stringify(localeData)
      totalSize += new TextEncoder().encode(jsonString).length
    })

    const totalKB = (totalSize / 1024).toFixed(2)
    // eslint-disable-next-line no-console
    console.log(`Total i18n bundle size: ${totalKB} KB`)

    // Total bundle size warning threshold
    if (totalSize > 100 * 1024) {
      // 100KB
      // eslint-disable-next-line no-console
      console.warn(
        `⚠️  Large i18n bundle detected (${totalKB} KB). Consider implementing lazy loading.`
      )
    }

    // Should be reasonable for 6 languages
    expect(totalSize).toBeLessThan(200 * 1024) // 200KB absolute limit
  })
})
