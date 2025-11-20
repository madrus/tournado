import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { FirebaseSignIn } from '../FirebaseSignIn'

vi.mock('firebase/auth', () => ({
	signInWithPopup: vi.fn(),
}))

vi.mock('~/features/firebase/client', () => ({
	auth: {},
	googleProvider: {},
}))

vi.mock('~/features/firebase/adapters/redirect', () => ({
	submitAuthCallback: vi.fn(),
}))

describe('FirebaseSignIn', () => {
	let mockSignInWithPopup: Mock
	let mockGetIdToken: Mock
	let mockSubmitAuthCallback: Mock

	beforeEach(async () => {
		vi.clearAllMocks()

		// Get the mocked functions
		const { signInWithPopup } = await import('firebase/auth')
		const { submitAuthCallback } = await import('~/features/firebase/adapters/redirect')

		mockSignInWithPopup = vi.mocked(signInWithPopup)
		mockSubmitAuthCallback = vi.mocked(submitAuthCallback)
		mockGetIdToken = vi.fn()
	})

	test('renders sign-in button correctly', () => {
		render(<FirebaseSignIn />)

		const button = screen.getByRole('button', {
			name: 'auth.firebase.continueWithGoogle',
		})
		expect(button).toBeInTheDocument()
		expect(screen.getByText('auth.firebase.continueWithGoogle')).toBeInTheDocument()

		// Verify teal primary button styling
		expect(button).toHaveClass('bg-teal-600')
		expect(button).toHaveClass('text-white')
		expect(button).toHaveClass('border-teal-600')

		// Verify button has standard animations (responsive scale for mobile/desktop)
		expect(button).toHaveClass('hover:scale-100')
		expect(button).toHaveClass('md:hover:scale-105')
		expect(button).toHaveClass('hover:shadow-xl')
		expect(button).toHaveClass('hover:ring-2')
	})

	test('displays loading state during authentication', async () => {
		// Mock a delayed sign-in
		mockSignInWithPopup.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

		render(<FirebaseSignIn />)

		const button = screen.getByRole('button', {
			name: 'auth.firebase.continueWithGoogle',
		})
		fireEvent.click(button)

		// Should show loading state
		expect(screen.getByText('common.auth.signingIn')).toBeInTheDocument()
		expect(button).toBeDisabled()
	})

	test('handles successful Google sign-in flow', async () => {
		const mockUser = {
			getIdToken: mockGetIdToken,
		}
		const mockResult = { user: mockUser }

		mockSignInWithPopup.mockResolvedValue(mockResult)
		mockGetIdToken.mockResolvedValue('mock-id-token')

		render(<FirebaseSignIn redirectTo='/custom-redirect' />)

		const button = screen.getByRole('button', {
			name: 'auth.firebase.continueWithGoogle',
		})
		fireEvent.click(button)

		// Should complete the full authentication flow
		await waitFor(() => {
			expect(mockSignInWithPopup).toHaveBeenCalledWith({}, {})
			expect(mockGetIdToken).toHaveBeenCalled()
			expect(mockSubmitAuthCallback).toHaveBeenCalledWith('mock-id-token', '/custom-redirect')
		})
	})

	test('shows error message when authentication fails', async () => {
		const error = new Error('Authentication failed')
		mockSignInWithPopup.mockRejectedValue(error)

		render(<FirebaseSignIn />)

		const button = screen.getByRole('button', {
			name: 'auth.firebase.continueWithGoogle',
		})
		fireEvent.click(button)

		await waitFor(() => {
			expect(screen.getByText('Authentication failed')).toBeInTheDocument()
		})

		// Button should be enabled again
		expect(button).toBeEnabled()
	})

	test('applies responsive width styling correctly', () => {
		render(<FirebaseSignIn />)

		const button = screen.getByRole('button', {
			name: 'auth.firebase.continueWithGoogle',
		})
		// Should have responsive width classes
		expect(button).toHaveClass('w-full')
		expect(button).toHaveClass('md:w-fit')
		expect(button).toHaveClass('md:self-center')
		// Should still have teal button styling
		expect(button).toHaveClass('bg-teal-600')
	})

	test('uses default redirectTo when none provided', async () => {
		const mockUser = {
			getIdToken: mockGetIdToken,
		}
		const mockResult = { user: mockUser }

		mockSignInWithPopup.mockResolvedValue(mockResult)
		mockGetIdToken.mockResolvedValue('mock-id-token')

		render(<FirebaseSignIn />)

		const button = screen.getByRole('button', {
			name: 'auth.firebase.continueWithGoogle',
		})
		fireEvent.click(button)

		// Should call adapter with default redirect value
		await waitFor(() => {
			expect(mockSubmitAuthCallback).toHaveBeenCalledWith('mock-id-token', '/')
		})
	})

	test('handles successful authentication callback', async () => {
		const mockUser = {
			getIdToken: mockGetIdToken,
		}
		const mockResult = { user: mockUser }

		mockSignInWithPopup.mockResolvedValue(mockResult)
		mockGetIdToken.mockResolvedValue('mock-id-token')

		render(<FirebaseSignIn />)

		const button = screen.getByRole('button', {
			name: 'auth.firebase.continueWithGoogle',
		})
		fireEvent.click(button)

		// Should call adapter without client-side error
		await waitFor(() => {
			expect(mockSubmitAuthCallback).toHaveBeenCalled()
		})

		// Should not show error message
		expect(screen.queryByText('Authentication failed')).not.toBeInTheDocument()
	})
})
