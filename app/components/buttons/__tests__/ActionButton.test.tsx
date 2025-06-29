import { I18nextProvider, initReactI18next } from 'react-i18next'

import { fireEvent, render, screen } from '@testing-library/react'

import { vi } from 'vitest'

import { createInstance } from 'i18next'

import { ActionButton } from '../ActionButton'

// Helper to create an i18n instance with a given language
function createI18n(language: string) {
  const instance = createInstance()
  instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    resources: {},
    react: { useSuspense: false },
  })
  return instance
}

describe('ActionButton', () => {
  it('renders children and calls onClick (LTR)', () => {
    const handleClick = vi.fn()
    const buttonText = 'Delete Team'
    const i18nInstance = createI18n('en')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton
          onClick={handleClick}
          icon='delete'
          variant='secondary'
          color='brand'
        >
          {buttonText}
        </ActionButton>
      </I18nextProvider>
    )
    expect(screen.getByText(buttonText)).toBeInTheDocument()
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
    // Icon should be before text in LTR
    const icon = screen.getByTestId('action-button-icon')
    expect(icon.nextSibling?.textContent).toBe(buttonText)
  })

  it('renders children and calls onClick (RTL)', () => {
    const handleClick = vi.fn()
    const buttonText = 'حذف الفريق'
    const i18nInstance = createI18n('ar')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton
          onClick={handleClick}
          icon='delete'
          variant='secondary'
          color='brand'
        >
          {buttonText}
        </ActionButton>
      </I18nextProvider>
    )
    const button = screen.getByRole('button')
    expect(screen.getByText(buttonText)).toBeInTheDocument()
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
    // Check that the icon is present
    expect(screen.getByTestId('action-button-icon')).toBeInTheDocument()
  })

  it('renders different variants correctly', () => {
    const handleClick = vi.fn()
    const i18nInstance = createI18n('en')

    // Test primary variant (emerald)
    const { rerender } = render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton onClick={handleClick} variant='primary' color='emerald'>
          Primary Button
        </ActionButton>
      </I18nextProvider>
    )
    const primaryButton = screen.getByRole('button')
    expect(primaryButton).toHaveClass('bg-emerald-600')
    expect(primaryButton).toHaveClass('text-white')
    expect(primaryButton).toHaveClass('border-emerald-600')
    expect(primaryButton).toHaveClass('focus-visible:ring-emerald-600')
    expect(primaryButton).toHaveClass('hover:ring-emerald-600')

    // Test secondary variant (emerald)
    rerender(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton onClick={handleClick} variant='secondary' color='emerald'>
          Secondary Button
        </ActionButton>
      </I18nextProvider>
    )
    const secondaryButton = screen.getByRole('button')
    expect(secondaryButton).toHaveClass('bg-transparent')
    expect(secondaryButton).toHaveClass('text-emerald-600')
    expect(secondaryButton).toHaveClass('border')
    expect(secondaryButton).toHaveClass('border-emerald-600')
    expect(secondaryButton).toHaveClass('focus-visible:ring-emerald-600')
    expect(secondaryButton).toHaveClass('hover:ring-emerald-600')
  })

  it('handles submit type without onClick', () => {
    const i18nInstance = createI18n('en')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton type='submit' variant='primary' color='emerald'>
          Submit Button
        </ActionButton>
      </I18nextProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(screen.getByText('Submit Button')).toBeInTheDocument()
  })

  it('handles disabled state correctly', () => {
    const handleClick = vi.fn()
    const i18nInstance = createI18n('en')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton onClick={handleClick} disabled>
          Disabled Button
        </ActionButton>
      </I18nextProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    // Verify disabled cursor
    expect(button).toHaveClass('disabled:cursor-not-allowed')

    // Verify disabled colors (gray semantic colors)
    expect(button).toHaveClass('disabled:bg-button-neutral-background')
    expect(button).toHaveClass('disabled:text-button-neutral-text')
    expect(button).toHaveClass('disabled:border-button-neutral-secondary-border')

    // Verify no animations on disabled buttons
    expect(button).toHaveClass('disabled:hover:scale-100') // No scale animation
    expect(button).toHaveClass('disabled:hover:ring-0') // No ring animation
    expect(button).toHaveClass('disabled:hover:ring-offset-0') // No ring offset animation
    expect(button).toHaveClass('disabled:hover:shadow-button-neutral-background/70') // No shadow animation

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
