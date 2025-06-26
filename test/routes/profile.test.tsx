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

    test('should render protection status information', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      expect(
        screen.getByText('✅ Enhanced Route Protection Active')
      ).toBeInTheDocument()
    })

    test('should render protection features list', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      const protectionFeatures = [
        'Authentication required',
        'Role-based access control enabled',
        'Custom protection logic applied',
        'Automatic redirect to /auth/signin if not authenticated',
        'Automatic redirect to /unauthorized if insufficient permissions',
      ]

      protectionFeatures.forEach(feature => {
        expect(screen.getByText(new RegExp(feature))).toBeInTheDocument()
      })
    })

    test('should render placeholder content', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      expect(
        screen.getByText(/This is a protected route example that demonstrates/)
      ).toBeInTheDocument()
      expect(
        screen.getByText('User settings will be implemented here.')
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

      const container = screen.getByRole('heading', { level: 1 }).closest('div')
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
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

    test('should apply correct styling to protection status section', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      const protectionSection = screen
        .getByText('✅ Enhanced Route Protection Active')
        .closest('div')
      expect(protectionSection).toHaveClass('mb-6', 'rounded-lg', 'bg-green-50', 'p-4')
    })

    test('should apply correct styling to protection title', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      const protectionTitle = screen.getByText('✅ Enhanced Route Protection Active')
      expect(protectionTitle).toHaveClass(
        'mb-2',
        'text-lg',
        'font-semibold',
        'text-green-800'
      )
    })
  })

  describe('Protection Features Display', () => {
    test('should render protection features as a list', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      // Check that protection features are rendered with list item markers
      const protectionList = screen.getByText('• Authentication required').closest('ul')
      expect(protectionList).toHaveClass('space-y-1', 'text-sm', 'text-green-700')
    })

    test('should include bullet points for each protection feature', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      // Check that each feature has a bullet point
      const featuresWithBullets = [
        '• Authentication required',
        '• Role-based access control enabled',
        '• Custom protection logic applied',
        '• Automatic redirect to /auth/signin if not authenticated',
        '• Automatic redirect to /unauthorized if insufficient permissions',
      ]

      featuresWithBullets.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
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
      const h3Elements = screen.getAllByRole('heading', { level: 3 })

      expect(h1Elements).toHaveLength(1)
      expect(h3Elements).toHaveLength(1) // Protection status heading
    })

    test('should have semantic HTML structure', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      // Check for proper list structure
      const protectionList = screen.getByText('• Authentication required').closest('ul')
      expect(protectionList).toBeInTheDocument()

      // Check list items
      const listItems = protectionList?.querySelectorAll('li')
      expect(listItems).toHaveLength(5)
    })
  })

  describe('Content Organization', () => {
    test('should organize content in logical sections', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      // Check main sections are present and in order
      const container = screen.getByRole('heading', { level: 1 }).closest('div')
      const content = container?.textContent || ''

      // Verify content flows logically
      expect(content.indexOf('Profile')).toBeLessThan(
        content.indexOf('Enhanced Route Protection Active')
      )
      expect(content.indexOf('Enhanced Route Protection Active')).toBeLessThan(
        content.indexOf('This is a protected route example')
      )
    })

    test('should separate protection info from main content', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      // Protection section should be visually distinct
      const protectionSection = screen
        .getByText('✅ Enhanced Route Protection Active')
        .closest('div')
      expect(protectionSection).toHaveClass('bg-green-50') // Distinct background

      // Main content should be separate
      const mainContent = screen.getByText(/This is a protected route example/)
      expect(mainContent.closest('.bg-green-50')).toBeNull()
    })
  })

  describe('Translation Integration', () => {
    test('should render with translation system', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )

      // Verify the heading is rendered with translation
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Profile')
    })
  })
})
