import { I18nextProvider, initReactI18next } from 'react-i18next'

import { fireEvent, render, screen } from '@testing-library/react'

import { vi } from 'vitest'

import { createInstance } from 'i18next'

import { DeleteButton } from '../DeleteButton'

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

describe('DeleteButton', () => {
  it('renders the label and calls onClick (LTR)', () => {
    const handleClick = vi.fn()
    const label = 'Delete Team'
    const i18nInstance = createI18n('en')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <DeleteButton onClick={handleClick} label={label} />
      </I18nextProvider>
    )
    expect(screen.getByText(label)).toBeInTheDocument()
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
    // Icon should be before text in LTR
    const svg = button.querySelector('svg')
    expect(svg?.nextSibling?.textContent).toBe(label)
  })

  it('renders the label and calls onClick (RTL)', () => {
    const handleClick = vi.fn()
    const label = 'حذف الفريق'
    const i18nInstance = createI18n('ar')
    render(
      <I18nextProvider i18n={i18nInstance}>
        <DeleteButton onClick={handleClick} label={label} />
      </I18nextProvider>
    )
    const button = screen.getByRole('button')
    expect(screen.getByText(label)).toBeInTheDocument()
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
    // Check that the button has flex-row-reverse for RTL
    expect(button.className).toMatch(/flex-row-reverse/)
    // Check that the icon is present
    expect(button.querySelector('svg')).toBeInTheDocument()
  })
})
