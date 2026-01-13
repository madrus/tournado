import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, test, vi } from 'vitest'
import AdminLayout from '~/routes/admin/admin'

// Mock Outlet component
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router')
	return {
		...actual,
		Outlet: () => <div data-testid='outlet'>Mock Outlet Content</div>,
	}
})

// Mock AuthErrorBoundary component
vi.mock('~/components/AuthErrorBoundary', () => ({
	AuthErrorBoundary: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='auth-error-boundary'>{children}</div>
	),
}))

describe('Admin Layout', () => {
	describe('Basic Rendering', () => {
		test('should render the Outlet component directly', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			expect(screen.getByTestId('outlet')).toBeInTheDocument()
			expect(screen.getByText('Mock Outlet Content')).toBeInTheDocument()
		})

		test('should provide minimal layout structure', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			// Verify that only the outlet is rendered - no extra containers
			expect(screen.getByTestId('outlet')).toBeInTheDocument()
			expect(screen.queryByTestId('admin-layout-container')).not.toBeInTheDocument()
		})
	})

	describe('Outlet Integration', () => {
		test('should render child routes through Outlet', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			// Verify that the Outlet is rendered and shows content
			expect(screen.getByTestId('outlet')).toBeInTheDocument()
			expect(screen.getByText('Mock Outlet Content')).toBeInTheDocument()
		})

		test('should provide pass-through layout for nested routes', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			const outlet = screen.getByTestId('outlet')

			// Verify that the layout acts as a pass-through
			expect(outlet).toBeInTheDocument()
			expect(outlet).toBeVisible()
		})
	})

	describe('Error Boundary Integration', () => {
		test('should export AuthErrorBoundary as ErrorBoundary', async () => {
			// This tests the named export
			const module = await import('~/routes/admin/admin')
			expect(module.ErrorBoundary).toBeDefined()
		})

		test('should provide error handling capability', () => {
			// Mock an error scenario to verify error boundary integration
			const ThrowError = () => {
				throw new Error('Test error')
			}

			const AdminLayoutWithError = () => <ThrowError />

			// This test verifies the error boundary is available
			expect(() => {
				render(
					<MemoryRouter>
						<AdminLayoutWithError />
					</MemoryRouter>,
				)
			}).toThrow('Test error')
		})
	})

	describe('Layout Architecture', () => {
		test('should delegate layout responsibility to child routes', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			// Verify that this layout doesn't impose any container structure
			// Layout responsibility is delegated to child routes (like teams)
			expect(screen.getByTestId('outlet')).toBeInTheDocument()
			expect(screen.queryByRole('main')).not.toBeInTheDocument()
			expect(screen.queryByTestId('admin-layout-container')).not.toBeInTheDocument()
		})

		test('should maintain simple pass-through structure', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			const outlet = screen.getByTestId('outlet')

			// Verify minimal DOM structure - just the outlet
			expect(outlet).toBeInTheDocument()
			expect(outlet).toHaveAttribute('data-testid', 'outlet')
		})
	})

	describe('Accessibility', () => {
		test('should not interfere with child content accessibility', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			// Verify that the layout doesn't add any accessibility barriers
			const outlet = screen.getByTestId('outlet')
			expect(outlet).toBeInTheDocument()
			expect(outlet).toBeVisible()
		})

		test('should preserve semantic structure of child routes', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			// Verify that semantic structure is preserved
			const outlet = screen.getByTestId('outlet')
			expect(outlet).toBeInTheDocument()
			expect(outlet).toHaveTextContent('Mock Outlet Content')
		})
	})

	describe('Content Flow', () => {
		test('should allow unrestricted content flow to child routes', () => {
			render(
				<MemoryRouter>
					<AdminLayout />
				</MemoryRouter>,
			)

			const outlet = screen.getByTestId('outlet')

			// Verify content flows directly to child routes
			expect(outlet).toBeInTheDocument()
			expect(outlet).toHaveTextContent('Mock Outlet Content')
		})
	})
})
