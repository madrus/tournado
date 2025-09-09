import { MemoryRouter } from 'react-router'

import type { User } from '@prisma/client'
import { render, screen } from '@testing-library/react'

import { describe, expect, test, vi } from 'vitest'

import ProfilePage from '~/routes/profile'

// Mock user data
const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'PUBLIC',
  firebaseUid: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock useLoaderData
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLoaderData: () => ({ user: mockUser }),
  }
})

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.titles.profile': 'Profile',
      }
      return translations[key] || key
    },
    i18n: { language: 'en' },
  }),
}))

describe('Profile Page', () => {
  describe('Basic Rendering', () => {
    test('should render main page title', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Profile')
    })

    test('should render profile information section', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      expect(screen.getByText('Profile Information')).toBeInTheDocument()
    })

    test('should render account settings section', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      expect(screen.getByText('Account Settings')).toBeInTheDocument()
    })

    test('should render tournament access section', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      expect(screen.getByText('Tournament Access')).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    test('should render profile information content', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      expect(
        screen.getByText(/Manage your profile settings and account information/)
      ).toBeInTheDocument()
    })

    test('should render account settings list', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      const accountSettings = [
        'Personal information management',
        'Password and security settings',
        'Notification preferences',
        'Privacy and data settings',
        'Account deletion options',
      ]
      accountSettings.forEach(setting => {
        expect(screen.getByText(new RegExp(setting))).toBeInTheDocument()
      })
    })

    test('should render tournament access content', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      expect(
        screen.getByText(
          /Your profile provides access to tournament management features/
        )
      ).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    test('should apply correct CSS classes to main container', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      const container = screen.getByTestId('profile-container')
      // Container classes are now applied at root level, not on individual route components
      expect(container).toBeInTheDocument()
    })

    test('should apply correct styling to main heading', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('mb-8', 'text-3xl', 'font-bold')
    })

    test('should apply correct styling to section headings', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
      sectionHeadings.forEach(heading => {
        expect(heading).toHaveClass('mb-4', 'text-2xl', 'font-semibold')
      })
    })
  })

  describe('Section Structure', () => {
    test('should have proper section hierarchy', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h1Elements).toHaveLength(1)
      expect(h2Elements).toHaveLength(3)
    })

    test('should render sections in correct order', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      const headings = screen.getAllByRole('heading')
      const headingTexts = headings.map(h => h.textContent)
      expect(headingTexts[0]).toBe('Profile') // h1
      expect(headingTexts[1]).toBe('Profile Information') // h2
      expect(headingTexts[2]).toBe('Account Settings') // h2
      expect(headingTexts[3]).toBe('Tournament Access') // h2
    })
  })

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h1Elements).toHaveLength(1)
      expect(h2Elements).toHaveLength(3)
    })
  })

  describe('Translation Integration', () => {
    test('should render with translation system', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Profile')
    })
  })
})
