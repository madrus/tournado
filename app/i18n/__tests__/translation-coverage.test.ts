/**
 * Translation Key Coverage Tests
 *
 * Automated verification that all translation keys exist in all locales
 * and that no keys are missing or orphaned.
 */
import { describe, expect, it } from 'vitest'

import { getAllKeys, getExtraKeys, getMissingKeys } from '../../lib/lib.helpers'
import { resources, SUPPORTED_LANGUAGES } from '../config'

const referenceLocale = 'nl'

// --- Start of New Comprehensive Test ---
describe('Translation Key Coverage', () => {
	const referenceResources = resources[referenceLocale] as Record<string, Record<string, unknown>>
	const referenceNamespaces = Object.keys(referenceResources)

	it('should have all namespaces in every locale', () => {
		const allErrors: string[] = []

		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			if (code === referenceLocale) return

			const localeResources = resources[code as keyof typeof resources] as Record<string, unknown>
			const localeNamespaces = Object.keys(localeResources)

			const missingNamespaces = getMissingKeys(referenceNamespaces, localeNamespaces)
			if (missingNamespaces.length > 0) {
				allErrors.push(`[${code}] Missing namespaces: ${missingNamespaces.join(', ')}`)
			}

			const extraNamespaces = getExtraKeys(referenceNamespaces, localeNamespaces)
			if (extraNamespaces.length > 0) {
				allErrors.push(`[${code}] Extra (orphaned) namespaces: ${extraNamespaces.join(', ')}`)
			}
		})

		expect(allErrors, `Namespace mismatches found:\n  - ${allErrors.join('\n  - ')}`).toEqual([])
	})

	it('should have consistent keys across all locales for each namespace', () => {
		const allErrors: string[] = []

		referenceNamespaces.forEach((namespace) => {
			const referenceKeys = getAllKeys(referenceResources[namespace])

			SUPPORTED_LANGUAGES.forEach(({ code }) => {
				if (code === referenceLocale) return

				const localeResources = resources[code as keyof typeof resources] as Record<
					string,
					Record<string, unknown>
				>
				const localeNamespace = localeResources[namespace]

				if (!localeNamespace) {
					// This case is handled by the namespace test above, but we check here to avoid errors
					return
				}

				const localeKeys = getAllKeys(localeNamespace)

				const missingKeys = getMissingKeys(referenceKeys, localeKeys)
				if (missingKeys.length > 0) {
					allErrors.push(`[${code}.${namespace}] Missing keys: ${missingKeys.join(', ')}`)
				}

				const extraKeys = getExtraKeys(referenceKeys, localeKeys)
				if (extraKeys.length > 0) {
					allErrors.push(`[${code}.${namespace}] Extra (orphaned) keys: ${extraKeys.join(', ')}`)
				}
			})
		})

		expect(allErrors, `Translation key mismatches found:\n  - ${allErrors.join('\n  - ')}`).toEqual(
			[],
		)
	})
})
// --- End of New Comprehensive Test ---

// --- Start of Restored Original Tests ---
describe('Critical Key Verification', () => {
	const criticalKeys = [
		'common.appName',
		'common.titles.teams',
		'common.titles.tournaments',
		'auth.emailAddress',
		'auth.password',
		'common.auth.signIn',
		'common.auth.signUp',
		'messages.auth.invalidCredentials',
	]

	it('should have all critical keys in every locale', () => {
		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const localeData = (resources[code as keyof typeof resources] as Record<string, unknown>)
				.root as Record<string, unknown>
			const localeKeys = getAllKeys(localeData)

			criticalKeys.forEach((criticalKey) => {
				expect(localeKeys, `Critical key '${criticalKey}' missing in ${code}`).toContain(
					criticalKey,
				)
			})
		})
	})

	it('should have non-empty values for critical keys', () => {
		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const localeData = (resources[code as keyof typeof resources] as Record<string, unknown>)
				.root as Record<string, unknown>

			criticalKeys.forEach((criticalKey) => {
				const value = getNestedValue(localeData, criticalKey)
				expect(value, `Critical key '${criticalKey}' has empty value in ${code}`).toBeTruthy()
				expect(typeof value, `Critical key '${criticalKey}' should be string in ${code}`).toBe(
					'string',
				)
			})
		})
	})
})

describe('Form Validation Coverage', () => {
	const formErrorKeys = [
		'messages.auth.emailRequired',
		'messages.auth.emailInvalid',
		'messages.auth.passwordRequired',
		'messages.auth.passwordTooShort',
		'messages.auth.invalidCredentials',
	]

	it('should have all form error messages in every locale', () => {
		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const localeData = (resources[code as keyof typeof resources] as Record<string, unknown>)
				.root as Record<string, unknown>
			const localeKeys = getAllKeys(localeData)

			formErrorKeys.forEach((errorKey) => {
				expect(localeKeys, `Form error key '${errorKey}' missing in ${code}`).toContain(errorKey)
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
		'common.auth.signOut',
	]

	it('should have all navigation keys in every locale', () => {
		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const localeData = (resources[code as keyof typeof resources] as Record<string, unknown>)
				.root as Record<string, unknown>
			const localeKeys = getAllKeys(localeData)

			navigationKeys.forEach((navKey) => {
				expect(localeKeys, `Navigation key '${navKey}' missing in ${code}`).toContain(navKey)
			})
		})
	})
})

describe('Translation Quality Checks', () => {
	it('should not have placeholder values in translations', () => {
		const placeholderPatterns = [/^TODO:/, /^PLACEHOLDER/, /^[\\[.*\\]]$/, /^{{.*}}$/]

		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const localeData = (resources[code as keyof typeof resources] as Record<string, unknown>)
				.root as Record<string, unknown>
			const allValues = getAllValues(localeData)

			allValues.forEach((value) => {
				if (typeof value === 'string') {
					placeholderPatterns.forEach((pattern) => {
						expect(value, `Placeholder value found in ${code}: "${value}"`).not.toMatch(pattern)
					})
				}
			})
		})
	})

	it('should not have empty string translations', () => {
		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const localeData = (resources[code as keyof typeof resources] as Record<string, unknown>)
				.root as Record<string, unknown>
			const allValues = getAllValues(localeData)

			allValues.forEach((value, index) => {
				if (typeof value === 'string') {
					expect(value.trim(), `Empty translation found in ${code} at index ${index}`).not.toBe('')
				}
			})
		})
	})

	it('should maintain consistent interpolation variables', () => {
		const referenceData = resources[referenceLocale].root as Record<string, unknown>
		const referenceKeys = getAllKeys(referenceData)

		referenceKeys.forEach((key) => {
			const referenceValue = getNestedValue(referenceData, key)
			if (typeof referenceValue !== 'string') return

			const referenceVars = extractInterpolationVars(referenceValue)

			SUPPORTED_LANGUAGES.forEach(({ code }) => {
				if (code === referenceLocale) return

				const localeData = resources[code as keyof typeof resources] as Record<string, unknown>
				const localeValue = getNestedValue(localeData, key)

				if (typeof localeValue === 'string') {
					const localeVars = extractInterpolationVars(localeValue)

					expect(
						localeVars.sort(),
						`Interpolation variables mismatch in ${code} for key '${key}'`,
					).toEqual(referenceVars.sort())
				}
			})
		})
	})
})

describe('Translation Bundle Analysis', () => {
	it('should report translation bundle sizes', () => {
		SUPPORTED_LANGUAGES.forEach(({ code, name }) => {
			const localeData = resources[code as keyof typeof resources]
			const jsonString = JSON.stringify(localeData)
			const sizeInBytes = new TextEncoder().encode(jsonString).length
			const sizeInKB = (sizeInBytes / 1024).toFixed(2)

			console.log(`${name} (${code}): ${sizeInKB} KB`)

			// Reasonable size limit (adjust as needed)
			expect(sizeInBytes, `Translation bundle for ${code} is too large`).toBeLessThan(50 * 1024) // 50KB limit
		})
	})

	it('should calculate total i18n bundle impact', () => {
		let totalSize = 0

		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const localeData = resources[code as keyof typeof resources]
			const jsonString = JSON.stringify(localeData)
			totalSize += new TextEncoder().encode(jsonString).length
		})

		const totalKB = (totalSize / 1024).toFixed(2)
		console.log(`Total i18n bundle size: ${totalKB} KB`)

		// Total bundle size warning threshold
		if (totalSize > 100 * 1024) {
			// 100KB
			console.warn(
				`⚠️  Large i18n bundle detected (${totalKB} KB). Consider implementing lazy loading.`,
			)
		}

		// Should be reasonable for 6 languages
		expect(totalSize).toBeLessThan(200 * 1024) // 200KB absolute limit
	})
})
// --- End of Restored Original Tests ---

// --- Start of Restored Local Helper Functions ---
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
	return matches ? matches.map((match) => match.replace(/[{}]/g, '').trim()) : []
}
// --- End of Restored Local Helper Functions ---
