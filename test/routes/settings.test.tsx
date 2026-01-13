import type { User } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, test, vi } from 'vitest'
import SettingsPage from '~/routes/settings'

// Mock user data
const mockUser: User = {
	id: 'user-1',
	email: 'test@example.com',
	firstName: 'Test',
	lastName: 'User',
	role: 'PUBLIC',
	firebaseUid: 'test-firebase-uid',
	displayName: null,
	active: true,
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
		t: (key: string) => key,
		i18n: { language: 'nl' },
	}),
}))

describe('Settings Page', () => {
	describe('Basic Rendering', () => {
		test('should render main page title', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			expect(
				screen.getByRole('heading', { level: 2, name: 'settings.title' }),
			).toHaveTextContent('settings.title')
		})

		test('should render application settings section', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			expect(screen.getByText('settings.title')).toBeInTheDocument()
		})

		test('should render preferences section', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			expect(screen.getByText('Preferences')).toBeInTheDocument()
		})

		test('should render tournament configuration section', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			expect(screen.getByText('Tournament Configuration')).toBeInTheDocument()
		})
	})

	describe('Content Structure', () => {
		test('should render application settings content', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			expect(screen.getByText('settings.description')).toBeInTheDocument()
		})

		test('should render preferences list', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			const preferences = [
				'Language and regional settings',
				'Theme and appearance options',
				'Notification preferences',
				'Privacy and security settings',
				'Data export and backup options',
			]
			preferences.forEach((preference) => {
				expect(screen.getByText(new RegExp(preference))).toBeInTheDocument()
			})
		})

		test('should render tournament configuration content', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			expect(
				screen.getByText(
					/Customize tournament management settings and default configurations/,
				),
			).toBeInTheDocument()
		})
	})

	describe('Styling and Layout', () => {
		test('should apply correct CSS classes to main container', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			const container = screen.getByTestId('settings-container')
			// Container classes are now applied at root level, not on individual route components
			expect(container).toBeInTheDocument()
		})

		test('should apply correct styling to main heading', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			const heading = screen.getByRole('heading', {
				level: 2,
				name: 'settings.title',
			})
			expect(heading).toHaveClass('text-3xl', 'font-bold')
		})

		test('should apply correct styling to section headings', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			const sectionHeadings = screen.getAllByRole('heading', { level: 3 })
			sectionHeadings.forEach((heading) => {
				expect(heading).toHaveClass('mb-4', 'text-2xl', 'font-semibold')
			})
		})
	})

	describe('Section Structure', () => {
		test('should have proper section hierarchy', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			const h2Elements = screen.getAllByRole('heading', { level: 2 })
			const h3Elements = screen.getAllByRole('heading', { level: 3 })
			expect(h2Elements).toHaveLength(1) // settings.title from LayoutHeader
			expect(h3Elements).toHaveLength(2) // Preferences, Tournament Configuration
		})

		test('should render sections in correct order', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			const headings = screen.getAllByRole('heading')
			const headingTexts = headings.map((h) => h.textContent)
			expect(headingTexts[0]).toBe('settings.title') // h1
			expect(headingTexts[1]).toBe('Preferences') // h2
			expect(headingTexts[2]).toBe('Tournament Configuration') // h2
		})
	})

	describe('Accessibility', () => {
		test('should have proper heading hierarchy', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			const h2Elements = screen.getAllByRole('heading', { level: 2 })
			const h3Elements = screen.getAllByRole('heading', { level: 3 })
			expect(h2Elements).toHaveLength(1) // settings.title from LayoutHeader
			expect(h3Elements).toHaveLength(2) // Preferences, Tournament Configuration
		})
	})

	describe('Translation Integration', () => {
		test('should render with translation system', () => {
			render(
				<MemoryRouter>
					<SettingsPage />
				</MemoryRouter>,
			)
			expect(
				screen.getByRole('heading', { level: 2, name: 'settings.title' }),
			).toHaveTextContent('settings.title')
		})
	})
})
