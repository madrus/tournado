import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { TeamsLayoutHeader } from '../TeamsLayoutHeader'

// Mock react-i18next
const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'admin.teams.title': 'Admin Teams',
    'admin.teams.description': 'Manage teams in the admin panel',
    'common.titles.teams': 'Teams',
    'teams.description': 'Register your team(s) for one or more tournaments',
    'common.actions.add': 'ADD',
  }
  return translations[key] || key
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: 'en' },
  }),
}))

// Mock user utilities for permission testing
vi.mock('~/utils/utils', () => ({
  useOptionalUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN', // Give full permissions for tests
  }),
  useMatchesData: vi.fn(() => ({})),
}))

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>)

describe('TeamsLayoutHeader', () => {
  it('should render public variant correctly', () => {
    renderWithRouter(<TeamsLayoutHeader variant='public' />)

    expect(screen.getByRole('heading', { name: 'Teams' })).toBeInTheDocument()
    expect(
      screen.getByText('Register your team(s) for one or more tournaments')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ADD' })).toBeInTheDocument()
  })

  it('should render admin variant correctly', () => {
    renderWithRouter(<TeamsLayoutHeader variant='admin' />)

    expect(screen.getByRole('heading', { name: 'Admin Teams' })).toBeInTheDocument()
    expect(screen.getByText('Manage teams in the admin panel')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ADD' })).toBeInTheDocument()
  })

  it('should use custom addButtonTo prop', () => {
    renderWithRouter(<TeamsLayoutHeader variant='public' addButtonTo='custom-path' />)

    const addButton = screen.getByRole('link', { name: 'ADD' })
    expect(addButton).toHaveAttribute('href', '/custom-path')
  })

  it('should apply custom className', () => {
    renderWithRouter(<TeamsLayoutHeader variant='public' className='custom-class' />)

    expect(screen.getByTestId('teams-header-public')).toHaveClass('custom-class')
  })

  it('should render public layout for public variant', () => {
    renderWithRouter(<TeamsLayoutHeader variant='public' />)
    expect(screen.getByTestId('teams-header-public')).toBeInTheDocument()
    expect(screen.queryByTestId('teams-header-admin')).not.toBeInTheDocument()
  })

  it('should render admin layout for admin variant', () => {
    renderWithRouter(<TeamsLayoutHeader variant='admin' />)
    expect(screen.getByTestId('teams-header-admin')).toBeInTheDocument()
    expect(screen.queryByTestId('teams-header-public')).not.toBeInTheDocument()
  })
})
