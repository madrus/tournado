import { render, waitFor } from '@testing-library/react'
import type { JSX } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserActionFeedback } from '../useUserActionFeedback'

// Mock dependencies
vi.mock('~/utils/toastUtils', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

vi.mock('i18next', () => ({
	default: {
		t: (key: string) => `translated:${key}`,
	},
}))

vi.mock('~/features/users/utils/userErrorUtils', () => ({
	translateUserError: (error: string) => {
		const knownKeys = [
			'userNotFound',
			'requestFailed',
			'requestFailedRefresh',
			'displayNameRequired',
			'cannotChangeOwnRole',
			'cannotDeactivateOwnAccount',
			'cannotReactivateOwnAccount',
			'unknownError',
		]
		return knownKeys.includes(error) ? `translated:messages.user.${error}` : error
	},
}))

// Import the mocked toast after defining the mock
import { toast } from '~/utils/toastUtils'

// Test component that uses the hook
function TestComponent(): JSX.Element {
	useUserActionFeedback()
	return <div data-testid='test-component'>Test Component</div>
}

// Helper to create router with search params
function createTestRouter(searchParams: string) {
	return createMemoryRouter(
		[
			{
				path: '/',
				element: <TestComponent />,
			},
		],
		{
			initialEntries: [`/?${searchParams}`],
		},
	)
}

describe('useUserActionFeedback', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Success messages', () => {
		it('should show success toast for role update', async () => {
			const router = createTestRouter('success=role')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
					'translated:users.messages.roleUpdatedSuccessfully',
				)
			})
		})

		it('should show success toast for deactivate', async () => {
			const router = createTestRouter('success=deactivate')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
					'translated:users.messages.userDeactivatedSuccessfully',
				)
			})
		})

		it('should show success toast for reactivate', async () => {
			const router = createTestRouter('success=reactivate')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
					'translated:users.messages.userReactivatedSuccessfully',
				)
			})
		})

		it('should show success toast for displayName update', async () => {
			const router = createTestRouter('success=displayName')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
					'translated:users.messages.displayNameUpdatedSuccessfully',
				)
			})
		})

		it('should not show success toast for unknown success values', async () => {
			const router = createTestRouter('success=unknownAction')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).not.toHaveBeenCalled()
			})
		})
	})

	describe('Error messages', () => {
		it('should show translated error toast for known error keys', async () => {
			const router = createTestRouter('error=userNotFound')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
					'translated:messages.user.userNotFound',
				)
			})
		})

		it('should show translated error for cannotChangeOwnRole', async () => {
			const router = createTestRouter('error=cannotChangeOwnRole')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
					'translated:messages.user.cannotChangeOwnRole',
				)
			})
		})

		it('should show raw error message for unknown error keys', async () => {
			const router = createTestRouter('error=Some%20technical%20error%20message')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
					'Some technical error message',
				)
			})
		})

		it('should handle URL-decoded error messages', async () => {
			const router = createTestRouter(
				'error=Database%20connection%20failed%3A%20timeout',
			)
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
					'Database connection failed: timeout',
				)
			})
		})
	})

	describe('Search params cleanup', () => {
		it('should remove success param from URL after showing toast', async () => {
			const router = createTestRouter('success=role')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalled()
			})

			// Wait for cleanup
			await waitFor(() => {
				const currentUrl = router.state.location.search
				expect(currentUrl).not.toContain('success=role')
			})
		})

		it('should remove error param from URL after showing toast', async () => {
			const router = createTestRouter('error=userNotFound')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.error)).toHaveBeenCalled()
			})

			// Wait for cleanup
			await waitFor(() => {
				const currentUrl = router.state.location.search
				expect(currentUrl).not.toContain('error=userNotFound')
			})
		})

		it('should remove both success and error params when both present', async () => {
			const router = createTestRouter('success=role&error=requestFailed')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalled()
				expect(vi.mocked(toast.error)).toHaveBeenCalled()
			})

			// Wait for cleanup
			await waitFor(() => {
				const currentUrl = router.state.location.search
				expect(currentUrl).not.toContain('success=')
				expect(currentUrl).not.toContain('error=')
			})
		})

		it('should preserve other search params during cleanup', async () => {
			const router = createTestRouter('success=role&page=2&filter=active')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalled()
			})

			// Wait for cleanup
			await waitFor(() => {
				const currentUrl = router.state.location.search
				expect(currentUrl).not.toContain('success=')
				expect(currentUrl).toContain('page=2')
				expect(currentUrl).toContain('filter=active')
			})
		})
	})

	describe('No params', () => {
		it('should not show any toasts when no success or error params', async () => {
			const router = createTestRouter('')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).not.toHaveBeenCalled()
				expect(vi.mocked(toast.error)).not.toHaveBeenCalled()
			})
		})

		it('should not show toasts for unrelated params', async () => {
			const router = createTestRouter('page=1&filter=active')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).not.toHaveBeenCalled()
				expect(vi.mocked(toast.error)).not.toHaveBeenCalled()
			})
		})
	})

	describe('Combined scenarios', () => {
		it('should show both success and error toasts when both params present', async () => {
			const router = createTestRouter('success=role&error=displayNameRequired')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
					'translated:users.messages.roleUpdatedSuccessfully',
				)
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
					'translated:messages.user.displayNameRequired',
				)
			})
		})

		it('should only call toasts once per render', async () => {
			const router = createTestRouter('success=role')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).toHaveBeenCalledTimes(1)
			})
		})
	})

	describe('Edge cases', () => {
		it('should handle empty success param value', async () => {
			const router = createTestRouter('success=')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.success)).not.toHaveBeenCalled()
			})
		})

		it('should handle empty error param value', async () => {
			const router = createTestRouter('error=')
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				// Empty string is falsy, so toast should not be called
				expect(vi.mocked(toast.error)).not.toHaveBeenCalled()
			})
		})

		it('should handle special characters in error messages', async () => {
			const router = createTestRouter(
				'error=Error%3A%20user%40example.com%20not%20found',
			)
			render(<RouterProvider router={router} />)

			await waitFor(() => {
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
					'Error: user@example.com not found',
				)
			})
		})
	})
})
