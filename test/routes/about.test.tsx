import { MemoryRouter } from 'react-router'

import { render, screen } from '@testing-library/react'

import { describe, expect, test, vi } from 'vitest'

import AboutPage from '~/routes/about'

// Mock the package.json version
vi.mock('../../package.json', () => ({
  version: '1.2.3',
}))

// Mock useLoaderData
const mockLoaderData = (version: string) => ({ version })

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLoaderData: () => mockLoaderData('1.2.3'),
  }
})

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.titles.about': 'About',
      }
      return translations[key] || key
    },
    i18n: { language: 'en' },
  }),
}))

describe('About Page', () => {
  describe('Basic Rendering', () => {
    test('should render main page title', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About')
    })

    test('should render all main sections', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      // Check main sections are present
      expect(screen.getByText('About Tournado')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Technology Stack')).toBeInTheDocument()
    })

    test('should display version information', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      expect(screen.getByText('Version:')).toBeInTheDocument()
      expect(screen.getByText('1.2.3')).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    test('should render app description', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      expect(
        screen.getByText(/Tournado is a comprehensive tournament management platform/)
      ).toBeInTheDocument()
    })

    test('should render feature list', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      const featureTexts = [
        'Tournament creation and management',
        'Team registration and player management',
        'Schedule generation and match tracking',
        'Real-time updates and notifications',
        'Comprehensive reporting and analytics',
      ]

      featureTexts.forEach(feature => {
        expect(screen.getByText(new RegExp(feature))).toBeInTheDocument()
      })
    })

    test('should render technology stack information', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      expect(
        screen.getByText(/Built with modern web technologies including React Router v7/)
      ).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    test('should apply correct CSS classes to main container', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      const container = screen.getByRole('heading', { level: 1 }).closest('div')
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
    })

    test('should apply correct styling to main heading', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('mb-8', 'text-3xl', 'font-bold')
    })

    test('should apply correct styling to section headings', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
      sectionHeadings.forEach(heading => {
        expect(heading).toHaveClass('mb-4', 'text-2xl', 'font-semibold')
      })
    })

    test('should format version number with monospace font', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      const versionElement = screen.getByText('1.2.3')
      expect(versionElement).toHaveClass('font-mono', 'font-semibold')
    })
  })

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      const h2Elements = screen.getAllByRole('heading', { level: 2 })

      expect(h1Elements).toHaveLength(1)
      expect(h2Elements).toHaveLength(3) // About Tournado, Features, Technology Stack
    })

    test('should have semantic HTML structure', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      // Check for semantic sections
      const headings = screen.getAllByRole('heading', { level: 2 })

      // All section headings should be within proper structure
      headings.forEach(heading => {
        expect(heading.parentElement).toBeInTheDocument()
      })
    })
  })

  describe('Translation Integration', () => {
    test('should render with translation system', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      )

      // Verify the heading is rendered (translation is mocked at module level)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About')
    })
  })
})
