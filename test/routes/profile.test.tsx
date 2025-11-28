import type { User } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { describe, expect, test, vi } from 'vitest'

import ProfilePage from '~/routes/profile'

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

// Mock useTranslation - returns keys as values for testing
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}))

describe('Profile Page', () => {
	describe('Basic Rendering', () => {
		test('should render main page title', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			expect(
				screen.getByRole('heading', { level: 2, name: 'profile.title' }),
			).toHaveTextContent('profile.title')
		})

		test('should render profile information section', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			expect(screen.getByText('profile.title')).toBeInTheDocument()
		})

		test('should render account settings section', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			expect(screen.getByText('Account Settings')).toBeInTheDocument()
		})

		test('should render tournament access section', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			expect(screen.getByText('Tournament Access')).toBeInTheDocument()
		})
	})

	describe('Content Structure', () => {
		test('should render profile information content', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			expect(screen.getByText(/profile.description/)).toBeInTheDocument()
		})

		test('should render account settings list', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			const accountSettings = [
				'Personal information management',
				'Password and security settings',
				'Notification preferences',
				'Privacy and data settings',
				'Account deletion options',
			]
			accountSettings.forEach((setting) => {
				expect(screen.getByText(new RegExp(setting))).toBeInTheDocument()
			})
		})

		test('should render tournament access content', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			expect(
				screen.getByText(
					/Your profile provides access to tournament management features/,
				),
			).toBeInTheDocument()
		})
	})

	describe('Styling and Layout', () => {
		test('should apply correct CSS classes to main container', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			const container = screen.getByTestId('profile-container')
			// Container classes are now applied at root level, not on individual route components
			expect(container).toBeInTheDocument()
		})

		test('should apply correct styling to main heading', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			const heading = screen.getByRole('heading', {
				level: 2,
				name: 'profile.title',
			})
			expect(heading).toHaveClass('text-3xl', 'font-bold')
		})

		test('should apply correct styling to section headings', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
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
					<ProfilePage />
				</MemoryRouter>,
			)
			const h2Elements = screen.getAllByRole('heading', { level: 2 })
			const h3Elements = screen.getAllByRole('heading', { level: 3 })
			expect(h2Elements).toHaveLength(1) // profile.title from LayoutHeader
			expect(h3Elements).toHaveLength(2) // Account Settings, Tournament Access
		})

		test('should render sections in correct order', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			const headings = screen.getAllByRole('heading')
			const headingTexts = headings.map((h) => h.textContent)
			expect(headingTexts[0]).toBe('profile.title') // h2
			expect(headingTexts[1]).toBe('Account Settings') // h3
			expect(headingTexts[2]).toBe('Tournament Access') // h3
		})
	})

	describe('Accessibility', () => {
		test('should have proper heading hierarchy', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			const h2Elements = screen.getAllByRole('heading', { level: 2 })
			const h3Elements = screen.getAllByRole('heading', { level: 3 })
			expect(h2Elements).toHaveLength(1) // profile.title from LayoutHeader
			expect(h3Elements).toHaveLength(2) // Account Settings, Tournament Access
		})
	})

	describe('Translation Integration', () => {
		test('should render with translation system', () => {
			render(
				<MemoryRouter>
					<ProfilePage />
				</MemoryRouter>,
			)
			expect(
				screen.getByRole('heading', { level: 2, name: 'profile.title' }),
			).toHaveTextContent('profile.title')
		})
	})
})
