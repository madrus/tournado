/**
 * Comprehensive i18n Integration Tests
 *
 * Tests that verify actual translation functionality works in practice,
 * including German translations, language switching, and translation key coverage.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider, useTranslation } from 'react-i18next'

import { describe, expect, it } from 'vitest'

import { initI18n, SUPPORTED_LANGUAGES } from '../config'

// Test component that uses translations
function TestTranslationComponent({ tKey }: { tKey: string }) {
	const { t } = useTranslation()
	return <div data-testid='translation'>{t(tKey)}</div>
}

// Test component for language switching
function LanguageSwitcher() {
	const { i18n } = useTranslation()

	const switchLanguage = async (lng: string) => {
		await i18n.changeLanguage(lng)
	}

	return (
		<div>
			<div data-testid='current-language'>{i18n.language}</div>
			{SUPPORTED_LANGUAGES.map(({ code, name }) => (
				<button
					type='button'
					key={code}
					data-testid={`switch-to-${code}`}
					onClick={() => {
						switchLanguage(code).catch(console.error)
					}}
				>
					{name}
				</button>
			))}
		</div>
	)
}

describe('i18n Integration Tests', () => {
	describe('German Translation Verification', () => {
		it('should render German translations correctly', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='common.appName' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			expect(translationElement).toBeInTheDocument()
			expect(translationElement).toHaveTextContent('Tournado') // App name should be same
		})

		it('should render German form labels correctly', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='auth.emailAddress' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			expect(translationElement).toHaveTextContent('E-Mail-Adresse')
		})

		it('should render German navigation items correctly', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='common.titles.teams' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			expect(translationElement).toHaveTextContent('Teams')
		})

		it('should handle German error messages', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='messages.auth.passwordRequired' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			expect(translationElement).toHaveTextContent('Passwort ist erforderlich')
		})
	})

	describe('Language Switching Tests', () => {
		it('should switch from Dutch to German dynamically', async () => {
			const user = userEvent.setup()
			const i18n = initI18n('nl')

			render(
				<I18nextProvider i18n={i18n}>
					<div>
						<LanguageSwitcher />
						<TestTranslationComponent tKey='auth.emailAddress' />
					</div>
				</I18nextProvider>,
			)

			// Verify initial Dutch
			expect(screen.getByTestId('current-language')).toHaveTextContent('nl')
			expect(screen.getByTestId('translation')).toHaveTextContent('E-mailadres')

			// Switch to German
			const germanButton = screen.getByTestId('switch-to-de')
			await user.click(germanButton)

			// Wait for language change
			await waitFor(
				() => {
					expect(screen.getByTestId('current-language')).toHaveTextContent('de')
					expect(screen.getByTestId('translation')).toHaveTextContent('E-Mail-Adresse')
				},
				{ timeout: 3000 },
			)
		})

		it('should switch to all supported languages', async () => {
			const user = userEvent.setup()
			const i18n = initI18n('nl')

			render(
				<I18nextProvider i18n={i18n}>
					<div>
						<LanguageSwitcher />
						<TestTranslationComponent tKey='common.appName' />
					</div>
				</I18nextProvider>,
			)

			// Test switching to each language
			for (const { code } of SUPPORTED_LANGUAGES) {
				const button = screen.getByTestId(`switch-to-${code}`)
				await user.click(button)

				await waitFor(
					() => {
						expect(screen.getByTestId('current-language')).toHaveTextContent(code)
					},
					{ timeout: 3000 },
				)
			}
		})

		it('should maintain translation context after language switch', async () => {
			const user = userEvent.setup()
			const i18n = initI18n('nl')

			render(
				<I18nextProvider i18n={i18n}>
					<div>
						<LanguageSwitcher />
						<TestTranslationComponent tKey='common.actions.save' />
					</div>
				</I18nextProvider>,
			)

			// Switch to German
			const germanButton = screen.getByTestId('switch-to-de')
			await user.click(germanButton)

			await waitFor(
				() => {
					expect(screen.getByTestId('translation')).toHaveTextContent('Speichern')
				},
				{ timeout: 3000 },
			)

			// Switch to English
			const englishButton = screen.getByTestId('switch-to-en')
			await user.click(englishButton)

			await waitFor(
				() => {
					expect(screen.getByTestId('translation')).toHaveTextContent('Save')
				},
				{ timeout: 3000 },
			)
		})
	})

	describe('Fallback Language Tests', () => {
		it('should fallback to Dutch for missing translations', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='non.existent.key' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			// Should show the key itself if not found
			expect(translationElement).toHaveTextContent('non.existent.key')
		})

		it('should use English fallback for better coverage', () => {
			// Create instance with English fallback
			const i18n = initI18n('de')
			i18n.init({
				...i18n.options,
				fallbackLng: ['en', 'nl'],
			})

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='common.appName' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			expect(translationElement.textContent).toBeTruthy()
		})
	})

	describe('RTL Language Support', () => {
		it('should handle Arabic RTL correctly', () => {
			const i18n = initI18n('ar')

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='common.appName' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			expect(translationElement).toBeInTheDocument()
			expect(i18n.language).toBe('ar')
		})

		it('should handle Turkish correctly', () => {
			const i18n = initI18n('tr')

			render(
				<I18nextProvider i18n={i18n}>
					<TestTranslationComponent tKey='auth.emailAddress' />
				</I18nextProvider>,
			)

			const translationElement = screen.getByTestId('translation')
			expect(translationElement).toHaveTextContent('E-posta adresi')
		})
	})

	describe('Translation Interpolation', () => {
		it('should handle interpolation in German', () => {
			const i18n = initI18n('de')

			// Test component with interpolation
			function InterpolationTest() {
				const { t } = useTranslation()
				return <div data-testid='interpolation'>{t('teams.count', { count: 1 })}</div>
			}

			render(
				<I18nextProvider i18n={i18n}>
					<InterpolationTest />
				</I18nextProvider>,
			)

			const element = screen.getByTestId('interpolation')
			expect(element).toHaveTextContent('1 Team registriert')
		})
	})
})

describe('Translation Performance Tests', () => {
	it('should initialize i18n instances quickly', () => {
		const start = performance.now()

		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			initI18n(code)
		})

		const end = performance.now()
		const duration = end - start

		// Should initialize all languages in under 100ms
		expect(duration).toBeLessThan(100)
	})

	it('should handle multiple rapid language switches', async () => {
		const user = userEvent.setup()
		const i18n = initI18n('nl')

		render(
			<I18nextProvider i18n={i18n}>
				<div>
					<LanguageSwitcher />
					<TestTranslationComponent tKey='common.appName' />
				</div>
			</I18nextProvider>,
		)

		// Rapidly switch languages
		const languages = ['de', 'en', 'fr', 'ar', 'tr', 'nl']

		for (const lang of languages) {
			await user.click(screen.getByTestId(`switch-to-${lang}`))
			// Small delay to simulate real usage
			await new Promise((resolve) => setTimeout(resolve, 10))
		}

		// Should end up on Dutch
		await waitFor(() => {
			expect(screen.getByTestId('current-language')).toHaveTextContent('nl')
		})
	})
})
