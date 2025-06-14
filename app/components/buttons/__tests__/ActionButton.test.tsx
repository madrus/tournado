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
        <ActionButton onClick={handleClick} icon='delete' variant='outline' color='red'>
          {buttonText}
        </ActionButton>
      </I18nextProvider>
    )
    expect(screen.getByText(buttonText)).toBeInTheDocument()
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
    // Icon should be before text in LTR
    const svg = button.querySelector('svg')
    expect(svg?.nextSibling?.textContent).toBe(buttonText)
  })

  it('renders children and calls onClick (RTL)', () => {
    const handleClick = vi.fn()
    const buttonText = 'حذف الفريق'
    const i18nInstance = createI18n('ar')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton onClick={handleClick} icon='delete' variant='outline' color='red'>
          {buttonText}
        </ActionButton>
      </I18nextProvider>
    )
    const button = screen.getByRole('button')
    expect(screen.getByText(buttonText)).toBeInTheDocument()
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
    // Check that the button has flex-row-reverse for RTL
    expect(button.className).toMatch(/flex-row-reverse/)
    // Check that the icon is present
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('renders different variants correctly', () => {
    const handleClick = vi.fn()
    const i18nInstance = createI18n('en')

    // Test solid variant
    const { rerender } = render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton onClick={handleClick} variant='solid' color='emerald'>
          Solid Button
        </ActionButton>
      </I18nextProvider>
    )
    expect(screen.getByRole('button')).toHaveClass('bg-emerald-600')

    // Test light variant
    rerender(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton onClick={handleClick} variant='light' color='emerald'>
          Light Button
        </ActionButton>
      </I18nextProvider>
    )
    expect(screen.getByRole('button')).toHaveClass('bg-emerald-50')

    // Test outline variant
    rerender(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton onClick={handleClick} variant='outline' color='red'>
          Outline Button
        </ActionButton>
      </I18nextProvider>
    )
    expect(screen.getByRole('button')).toHaveClass('bg-white')
  })

  it('handles submit type without onClick', () => {
    const i18nInstance = createI18n('en')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <ActionButton type='submit' variant='solid' color='emerald'>
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
    expect(button).toHaveClass('opacity-50')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
