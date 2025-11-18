import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from '../ThemeToggle'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock icon utils
vi.mock('~/utils/iconUtils', () => ({
  renderIcon: (name: string) => <span data-testid={`icon-${name}`}>{name}</span>,
}))

describe('ThemeToggle', () => {
  it('should render button with cursor-pointer class', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'common.toggleTheme' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('cursor-pointer')
  })

  it('should have proper ARIA label', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'common.toggleTheme')
  })

  it('should have button type attribute', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})
