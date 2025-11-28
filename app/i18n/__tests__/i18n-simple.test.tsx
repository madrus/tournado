/**
 * Simple i18n Tests
 *
 * Basic tests to verify i18n configuration works correctly.
 */
import { describe, expect, it } from 'vitest'

import { initI18n, resources } from '../config'

describe('i18n Basic Functionality', () => {
	describe('Configuration Tests', () => {
		it('should load German translations correctly', () => {
			const i18n = initI18n('de')

			expect(i18n.language).toBe('de')
			expect(i18n.t('common.appName')).toBe('Tournado')
			expect(i18n.t('auth.emailAddress')).toBe('E-Mail-Adresse')
			expect(i18n.t('common.titles.teams')).toBe('Teams')
			expect(i18n.t('messages.auth.passwordRequired')).toBe('Passwort ist erforderlich')
		})

		it('should load Dutch translations correctly', () => {
			const i18n = initI18n('nl')

			expect(i18n.language).toBe('nl')
			expect(i18n.t('common.appName')).toBe('Tournado')
			expect(i18n.t('auth.emailAddress')).toBe('E-mailadres')
			expect(i18n.t('common.titles.teams')).toBe('Teams')
			expect(i18n.t('messages.auth.passwordRequired')).toBe('Wachtwoord is verplicht')
		})

		it('should load English translations correctly', () => {
			const i18n = initI18n('en')

			expect(i18n.language).toBe('en')
			expect(i18n.t('common.appName')).toBe('Tournado')
			expect(i18n.t('auth.emailAddress')).toBe('Email address')
			expect(i18n.t('common.titles.teams')).toBe('Teams')
			expect(i18n.t('messages.auth.passwordRequired')).toBe('Password is required')
		})

		it('should handle translation interpolation', () => {
			const i18n = initI18n('de')

			const result = i18n.t('teams.count', { count: 1 })
			expect(result).toBe('1 Team registriert')

			const resultPlural = i18n.t('teams.count', { count: 3 })
			expect(resultPlural).toBe('3 Teams registriert')
		})

		it('should handle language switching', () => {
			const i18n = initI18n('de')

			expect(i18n.t('auth.emailAddress')).toBe('E-Mail-Adresse')

			i18n.changeLanguage('en')
			expect(i18n.language).toBe('en')
			expect(i18n.t('auth.emailAddress')).toBe('Email address')

			i18n.changeLanguage('nl')
			expect(i18n.language).toBe('nl')
			expect(i18n.t('auth.emailAddress')).toBe('E-mailadres')
		})

		it('should fallback to showing keys for missing translations', () => {
			const i18n = initI18n('de')

			const result = i18n.t('non.existent.key')
			expect(result).toBe('non.existent.key')
		})
	})

	describe('Resource Validation', () => {
		it('should have all required resources loaded', () => {
			expect(resources.nl).toBeDefined()
			expect(resources.en).toBeDefined()
			expect(resources.de).toBeDefined()
			expect(resources.fr).toBeDefined()
			expect(resources.ar).toBeDefined()
			expect(resources.tr).toBeDefined()
		})

		it('should have common namespace in all resources', () => {
			Object.keys(resources).forEach((lang) => {
				expect(resources[lang as keyof typeof resources].root).toBeDefined()
			})
		})
	})
})
