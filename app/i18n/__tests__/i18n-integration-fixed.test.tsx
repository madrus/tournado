/**
 * i18n Integration Tests - Fixed Version
 *
 * Tests that verify i18n works with React components correctly.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider, useTranslation } from 'react-i18next'

import { describe, expect, it } from 'vitest'

import { initI18n, SUPPORTED_LANGUAGES } from '../config'

// Simple test component that uses translations
function SimpleTranslationTest({ translationKey }: { translationKey: string }) {
	const { t } = useTranslation()
	return <div data-testid='translation'>{t(translationKey)}</div>
}

// Language switcher component that actually works
function WorkingLanguageSwitcher() {
	const { i18n, t } = useTranslation()

	return (
		<div>
			<div data-testid='current-language'>{i18n.language}</div>
			<div data-testid='translation'>{t('common.appName')}</div>

			{SUPPORTED_LANGUAGES.map(({ code, name }) => (
				<button
					type='button'
					key={code}
					data-testid={`switch-${code}`}
					onClick={() => {
						i18n.changeLanguage(code)
					}}
				>
					{name}
				</button>
			))}
		</div>
	)
}

describe('i18n React Integration', () => {
	describe('Translation Rendering', () => {
		it('should render German translations in React components', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<SimpleTranslationTest translationKey='common.appName' />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('translation')).toHaveTextContent('Tournado')
		})

		it('should render German email address label', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<SimpleTranslationTest translationKey='auth.emailAddress' />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('translation')).toHaveTextContent('E-Mail-Adresse')
		})

		it('should render German navigation items', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<SimpleTranslationTest translationKey='common.titles.teams' />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('translation')).toHaveTextContent('Teams')
		})

		it('should handle German error messages', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<SimpleTranslationTest translationKey='messages.auth.passwordRequired' />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('translation')).toHaveTextContent(
				'Passwort ist erforderlich',
			)
		})
	})

	describe('Language Switching in React', () => {
		it('should switch languages dynamically', async () => {
			const user = userEvent.setup()
			const i18n = initI18n('nl')

			render(
				<I18nextProvider i18n={i18n}>
					<WorkingLanguageSwitcher />
				</I18nextProvider>,
			)

			// Initial state - Dutch
			expect(screen.getByTestId('current-language')).toHaveTextContent('nl')
			expect(screen.getByTestId('translation')).toHaveTextContent('Tournado')

			// Switch to German
			await user.click(screen.getByTestId('switch-de'))

			await waitFor(() => {
				expect(screen.getByTestId('current-language')).toHaveTextContent('de')
			})

			// Switch to English
			await user.click(screen.getByTestId('switch-en'))

			await waitFor(() => {
				expect(screen.getByTestId('current-language')).toHaveTextContent('en')
			})
		})

		it('should work with Turkish translations', () => {
			const i18n = initI18n('tr')

			render(
				<I18nextProvider i18n={i18n}>
					<SimpleTranslationTest translationKey='auth.emailAddress' />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('translation')).toHaveTextContent('E-posta adresi')
		})

		it('should handle interpolation in components', () => {
			const i18n = initI18n('de')

			function InterpolationTest() {
				const { t } = useTranslation()
				return <div data-testid='interpolation'>{t('teams.count', { count: 1 })}</div>
			}

			render(
				<I18nextProvider i18n={i18n}>
					<InterpolationTest />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('interpolation')).toHaveTextContent(
				'1 Team registriert',
			)
		})
	})

	describe('Fallback Behavior', () => {
		it('should show translation keys for missing translations', () => {
			const i18n = initI18n('de')

			render(
				<I18nextProvider i18n={i18n}>
					<SimpleTranslationTest translationKey='missing.translation.key' />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('translation')).toHaveTextContent(
				'missing.translation.key',
			)
		})
	})
})

describe('i18n Performance in React', () => {
	it('should initialize quickly for all languages', () => {
		const start = performance.now()

		SUPPORTED_LANGUAGES.forEach(({ code }) => {
			const i18n = initI18n(code)

			const { unmount } = render(
				<I18nextProvider i18n={i18n}>
					<SimpleTranslationTest translationKey='common.appName' />
				</I18nextProvider>,
			)

			expect(screen.getByTestId('translation')).toHaveTextContent('Tournado')
			unmount() // Clean up after each render
		})

		const duration = performance.now() - start
		expect(duration).toBeLessThan(100) // Should complete in under 100ms
	})
})
