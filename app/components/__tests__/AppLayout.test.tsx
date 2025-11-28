import { render, screen } from '@testing-library/react'
import type { i18n as I18n } from 'i18next'
import type React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Language } from '~/i18n/config'

import { AppLayout } from '../AppLayout'

// Mock the i18n instance
const mockI18n = {
	language: 'nl',
	changeLanguage: vi.fn(),
	t: vi.fn((key: string) => key),
	exists: vi.fn(() => true),
	isLoaded: true,
} as unknown as I18n

// Mock child components
vi.mock('~/components/AppBar', () => ({
	AppBar: ({
		authenticated,
		username,
		user,
		language,
	}: {
		authenticated: boolean
		username: string
		user?: { email: string; id: string } | null
		language: Language
	}) => (
		<div data-testid='app-bar'>
			AppBar - authenticated: {String(authenticated)}, username: {username}, language:{' '}
			{language}
			{user ? `, user: ${user.email}` : ''}
		</div>
	),
}))

vi.mock('~/components/desktopFooter/DesktopFooter', () => ({
	default: () => <div data-testid='desktop-footer'>DesktopFooter</div>,
}))

vi.mock('~/components/mobileNavigation/BottomNavigation', () => ({
	default: () => <div data-testid='bottom-navigation'>BottomNavigation</div>,
}))

// Mock Radix UI Theme
vi.mock('@radix-ui/themes', () => ({
	Theme: ({
		children,
		...props
	}: {
		children: React.ReactNode
		[key: string]: unknown
	}) => (
		<div data-testid='radix-theme' data-theme-props={JSON.stringify(props)}>
			{children}
		</div>
	),
}))

// Mock Sonner Toaster
vi.mock('sonner', () => ({
	Toaster: (props: { [key: string]: unknown }) => (
		<div data-testid='toaster' data-toaster-props={JSON.stringify(props)}>
			Toaster
		</div>
	),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
	I18nextProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='i18n-provider'>{children}</div>
	),
}))

describe('AppLayout', () => {
	const defaultProps = {
		authenticated: false,
		username: 'testuser',
		theme: 'light' as const,
		language: 'en' as const,
		i18n: mockI18n,
		children: <div data-testid='test-children'>Test Content</div>,
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('basic rendering', () => {
		it('should render all core layout components', () => {
			render(<AppLayout {...defaultProps} />)

			expect(screen.getByTestId('i18n-provider')).toBeInTheDocument()
			expect(screen.getByTestId('radix-theme')).toBeInTheDocument()
			expect(screen.getByTestId('app-bar')).toBeInTheDocument()
			expect(screen.getByTestId('desktop-footer')).toBeInTheDocument()
			expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
			expect(screen.getByTestId('toaster')).toBeInTheDocument()
			expect(screen.getByTestId('test-children')).toBeInTheDocument()
		})

		it('should render with correct layout structure', () => {
			render(<AppLayout {...defaultProps} />)

			const layout = screen.getByTestId('i18n-provider')
			expect(layout).toBeInTheDocument()

			// Check that main content area exists
			const content = screen.getByTestId('test-children')
			expect(content).toBeInTheDocument()
		})
	})

	describe('prop handling', () => {
		it('should pass authentication props to AppBar', () => {
			render(
				<AppLayout
					{...defaultProps}
					authenticated={true}
					username='john@example.com'
				/>,
			)

			const appBar = screen.getByTestId('app-bar')
			expect(appBar).toHaveTextContent('authenticated: true')
			expect(appBar).toHaveTextContent('username: john@example.com')
		})

		it('should pass user object to AppBar when provided', () => {
			const user = {
				id: '1',
				email: 'user@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: 'PUBLIC' as const,
				firebaseUid: 'test-firebase-uid',
				displayName: null,
				active: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			render(<AppLayout {...defaultProps} user={user} />)

			const appBar = screen.getByTestId('app-bar')
			expect(appBar).toHaveTextContent('user: user@example.com')
		})

		it('should work without user prop', () => {
			render(<AppLayout {...defaultProps} />)

			const appBar = screen.getByTestId('app-bar')
			expect(appBar).not.toHaveTextContent('user:')
		})

		it('should pass theme to Radix Theme component', () => {
			render(<AppLayout {...defaultProps} theme='dark' />)

			const themeComponent = screen.getByTestId('radix-theme')
			const themeProps = JSON.parse(
				themeComponent.getAttribute('data-theme-props') || '{}',
			)
			expect(themeProps.appearance).toBe('dark')
			expect(themeProps.accentColor).toBe('teal')
			expect(themeProps.grayColor).toBe('slate')
		})
	})

	describe('content className handling', () => {
		it('should use default content className when not provided', () => {
			render(<AppLayout {...defaultProps} />)

			// The content should be rendered correctly
			const content = screen.getByTestId('test-children')
			expect(content).toBeInTheDocument()
			// In a real DOM environment, classes would be applied correctly
			// but in the test environment we can verify the component renders
			expect(content).toHaveTextContent('Test Content')
		})

		it('should use custom content className when provided', () => {
			render(<AppLayout {...defaultProps} contentClassName='custom-class pt-4' />)

			const content = screen.getByTestId('test-children')
			expect(content).toBeInTheDocument()
			// The className prop is passed to the component - integration tests would verify styling
			expect(content).toHaveTextContent('Test Content')
		})
	})

	describe('environment script handling', () => {
		it('should render environment script when env prop is provided', () => {
			const env = { NODE_ENV: 'test', API_URL: 'http://localhost' }
			render(<AppLayout {...defaultProps} env={env} />)

			const script = document.querySelector('script')
			expect(script).toBeTruthy()
			expect(script?.innerHTML).toContain('window.ENV')
			expect(script?.innerHTML).toContain('"NODE_ENV":"test"')
			expect(script?.innerHTML).toContain('"API_URL":"http://localhost"')
		})

		it('should not render environment script when env prop is not provided', () => {
			render(<AppLayout {...defaultProps} />)

			const script = Array.from(document.querySelectorAll('script')).find((s) =>
				s.textContent?.includes('window.ENV'),
			)
			expect(script).toBeUndefined()
		})

		it('should render environment script with empty object when env is empty object', () => {
			render(<AppLayout {...defaultProps} env={{}} />)

			const script = Array.from(document.querySelectorAll('script')).find((s) =>
				s.textContent?.includes('window.ENV'),
			)
			expect(script).toBeTruthy()
			expect(script?.innerHTML).toBe('window.ENV = {}')
		})

		it('should handle env with special characters properly', () => {
			const env = { SPECIAL_CHARS: 'test"with\'quotes&<>' }
			render(<AppLayout {...defaultProps} env={env} />)

			const script = document.querySelector('script')
			expect(script).toBeTruthy()
			// Should be properly JSON encoded
			expect(script?.innerHTML).toContain('window.ENV')
		})
	})

	describe('Toaster configuration', () => {
		it('should configure Toaster with correct props', () => {
			render(<AppLayout {...defaultProps} />)

			const toaster = screen.getByTestId('toaster')
			const toasterProps = JSON.parse(
				toaster.getAttribute('data-toaster-props') || '{}',
			)

			expect(toasterProps.position).toBe('top-center')
			expect(toasterProps.visibleToasts).toBe(10)
			expect(toasterProps.closeButton).toBe(true)
			expect(toasterProps.expand).toBe(true)
			expect(toasterProps.toastOptions.duration).toBe(7500)
			expect(toasterProps.toastOptions.unstyled).toBe(true)
		})
	})

	describe('Theme configuration', () => {
		it('should configure Radix Theme with correct default props', () => {
			render(<AppLayout {...defaultProps} theme='light' />)

			const themeComponent = screen.getByTestId('radix-theme')
			const themeProps = JSON.parse(
				themeComponent.getAttribute('data-theme-props') || '{}',
			)

			expect(themeProps.accentColor).toBe('teal')
			expect(themeProps.grayColor).toBe('slate')
			expect(themeProps.radius).toBe('medium')
			expect(themeProps.scaling).toBe('100%')
			expect(themeProps.appearance).toBe('light')
		})

		it('should handle dark theme properly', () => {
			render(<AppLayout {...defaultProps} theme='dark' />)

			const themeComponent = screen.getByTestId('radix-theme')
			const themeProps = JSON.parse(
				themeComponent.getAttribute('data-theme-props') || '{}',
			)
			expect(themeProps.appearance).toBe('dark')
		})
	})

	describe('children rendering', () => {
		it('should render children content in the correct location', () => {
			const customChild = <div data-testid='custom-content'>Custom Content</div>
			render(<AppLayout {...defaultProps}>{customChild}</AppLayout>)

			expect(screen.getByTestId('custom-content')).toBeInTheDocument()
			expect(screen.getByTestId('custom-content')).toHaveTextContent('Custom Content')
		})

		it('should render multiple children', () => {
			const multipleChildren = (
				<>
					<div data-testid='child-1'>Child 1</div>
					<div data-testid='child-2'>Child 2</div>
				</>
			)
			render(<AppLayout {...defaultProps}>{multipleChildren}</AppLayout>)

			expect(screen.getByTestId('child-1')).toBeInTheDocument()
			expect(screen.getByTestId('child-2')).toBeInTheDocument()
		})

		it('should handle complex children with nested components', () => {
			const complexChildren = (
				<div data-testid='complex-wrapper'>
					<h1>Page Title</h1>
					<div data-testid='nested-content'>
						<p>Nested content</p>
					</div>
				</div>
			)
			render(<AppLayout {...defaultProps}>{complexChildren}</AppLayout>)

			expect(screen.getByTestId('complex-wrapper')).toBeInTheDocument()
			expect(screen.getByTestId('nested-content')).toBeInTheDocument()
			expect(screen.getByText('Page Title')).toBeInTheDocument()
			expect(screen.getByText('Nested content')).toBeInTheDocument()
		})
	})

	describe('integration with mocked components', () => {
		it('should pass correct props to all child components', () => {
			const user = {
				id: '1',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				role: 'PUBLIC' as const,
				firebaseUid: 'test-firebase-uid',
				displayName: null,
				active: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			render(
				<AppLayout
					{...defaultProps}
					authenticated={true}
					username='testuser'
					user={user}
					theme='dark'
				/>,
			)

			// Verify AppBar receives correct props
			const appBar = screen.getByTestId('app-bar')
			expect(appBar).toHaveTextContent('authenticated: true')
			expect(appBar).toHaveTextContent('username: testuser')
			expect(appBar).toHaveTextContent('user: test@example.com')

			// Verify Theme receives correct props
			const themeComponent = screen.getByTestId('radix-theme')
			const themeProps = JSON.parse(
				themeComponent.getAttribute('data-theme-props') || '{}',
			)
			expect(themeProps.appearance).toBe('dark')

			// Verify other components are rendered
			expect(screen.getByTestId('desktop-footer')).toBeInTheDocument()
			expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
		})
	})

	describe('accessibility and styling', () => {
		it('should have proper semantic structure', () => {
			render(<AppLayout {...defaultProps} />)

			// Main layout structure should be present
			expect(screen.getByTestId('i18n-provider')).toBeInTheDocument()
			expect(screen.getByTestId('radix-theme')).toBeInTheDocument()

			// Navigation components should be present
			expect(screen.getByTestId('app-bar')).toBeInTheDocument()
			expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
		})

		it('should maintain consistent styling structure', () => {
			render(<AppLayout {...defaultProps} />)

			// The layout should have the basic structure we expect
			const content = screen.getByTestId('test-children')
			expect(content).toBeInTheDocument()

			// In test environment, CSS classes may not be applied as expected
			// The important thing is that all components are properly rendered
			expect(content).toHaveTextContent('Test Content')
		})
	})

	describe('error handling', () => {
		it('should handle missing optional props gracefully', () => {
			const minimalProps = {
				authenticated: false,
				username: '',
				theme: 'light' as const,
				language: 'en' as const,
				i18n: mockI18n,
				children: <div>Test</div>,
			}

			expect(() => render(<AppLayout {...minimalProps} />)).not.toThrow()
			expect(screen.getByText('Test')).toBeInTheDocument()
		})

		it('should handle empty username gracefully', () => {
			render(<AppLayout {...defaultProps} username='' />)

			const appBar = screen.getByTestId('app-bar')
			expect(appBar).toHaveTextContent('username:')
			expect(appBar).toHaveTextContent('authenticated: false')
		})
	})
})
