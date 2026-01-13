/**
 * Working i18n Integration Tests
 *
 * Tests that verify i18n works with React components using real translations.
 */
import { render, screen } from '@testing-library/react'
import type { JSX } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { describe, expect, it } from 'vitest'
import { SUPPORTED_LANGUAGES, initI18n } from '../config'

// Proper React component using real useTranslation hook
function TranslationComponent({ translationKey }: { translationKey: string }) {
  const { t } = useTranslation()
  return <div data-testid='translation'>{t(translationKey)}</div>
}

// Language display component
function LanguageDisplay(): JSX.Element {
  const { i18n } = useTranslation()
  return <div data-testid='current-language'>{i18n.language}</div>
}

describe('i18n React Integration - Real Translations', () => {
  describe('German Translation Rendering', () => {
    it('should render German app name correctly', () => {
      const i18n = initI18n('de')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='common.appName' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('Tournado')
    })

    it('should render German email address label', () => {
      const i18n = initI18n('de')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='auth.emailAddress' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('E-Mail-Adresse')
    })

    it('should render German teams navigation', () => {
      const i18n = initI18n('de')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='common.titles.teams' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('Teams')
    })

    it('should render German error messages', () => {
      const i18n = initI18n('de')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='messages.auth.passwordRequired' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent(
        'Passwort ist erforderlich',
      )
    })
  })

  describe('Multi-language Support', () => {
    it('should work with Turkish translations', () => {
      const i18n = initI18n('tr')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='auth.emailAddress' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('E-posta adresi')
    })

    it('should work with Dutch translations', () => {
      const i18n = initI18n('nl')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='auth.emailAddress' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('E-mailadres')
    })

    it('should work with English translations', () => {
      const i18n = initI18n('en')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='auth.emailAddress' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('Email address')
    })
  })

  describe('Interpolation in Components', () => {
    it('should handle German count interpolation', () => {
      const i18n = initI18n('de')

      function CountComponent() {
        const { t } = useTranslation()
        return <div data-testid='count'>{t('teams.count', { count: 1 })}</div>
      }

      render(
        <I18nextProvider i18n={i18n}>
          <CountComponent />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('count')).toHaveTextContent('1 Team registriert')
    })

    it('should handle German plural count', () => {
      const i18n = initI18n('de')

      function PluralCountComponent() {
        const { t } = useTranslation()
        return <div data-testid='count'>{t('teams.count', { count: 5 })}</div>
      }

      render(
        <I18nextProvider i18n={i18n}>
          <PluralCountComponent />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('count')).toHaveTextContent('5 Teams registriert')
    })
  })

  describe('Language Context', () => {
    it('should provide correct language context', () => {
      const i18n = initI18n('de')

      render(
        <I18nextProvider i18n={i18n}>
          <LanguageDisplay />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('current-language')).toHaveTextContent('de')
    })

    it('should work with Arabic language', () => {
      const i18n = initI18n('ar')

      render(
        <I18nextProvider i18n={i18n}>
          <LanguageDisplay />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('current-language')).toHaveTextContent('ar')
    })
  })

  describe('Fallback Behavior', () => {
    it('should return key for missing translations', () => {
      const i18n = initI18n('de')

      render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='non.existent.key' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('non.existent.key')
    })
  })
})

describe('i18n React Performance', () => {
  it('should render all languages quickly', () => {
    const start = performance.now()

    SUPPORTED_LANGUAGES.forEach(({ code }) => {
      const i18n = initI18n(code)

      const { unmount } = render(
        <I18nextProvider i18n={i18n}>
          <TranslationComponent translationKey='common.appName' />
        </I18nextProvider>,
      )

      expect(screen.getByTestId('translation')).toHaveTextContent('Tournado')
      unmount()
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(100) // Should complete quickly
  })
})
