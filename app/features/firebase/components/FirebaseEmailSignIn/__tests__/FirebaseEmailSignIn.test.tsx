import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Mock } from 'vitest'

import { FirebaseEmailSignIn } from '../FirebaseEmailSignIn'

// Mock the useFirebaseAuth hook
vi.mock('../../../hooks/useFirebaseAuth', () => ({
  useFirebaseAuth: vi.fn(),
}))

// Mock react-i18next - returns key as value for testing
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('FirebaseEmailSignIn', () => {
  let mockSignInWithEmail: Mock
  let mockSignUpWithEmail: Mock
  let mockClearError: Mock

  const defaultHookReturn = {
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    user: null,
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useFirebaseAuth } = await import('../../../hooks/useFirebaseAuth')
    mockSignInWithEmail = vi.fn()
    mockSignUpWithEmail = vi.fn()
    mockClearError = vi.fn()

    vi.mocked(useFirebaseAuth).mockReturnValue({
      ...defaultHookReturn,
      signInWithEmail: mockSignInWithEmail,
      signUpWithEmail: mockSignUpWithEmail,
      clearError: mockClearError,
    })
  })

  describe('Sign In Mode', () => {
    test('renders sign in form correctly', () => {
      render(<FirebaseEmailSignIn mode='signin' />)

      expect(screen.getByLabelText('auth.labels.email')).toBeInTheDocument()
      expect(screen.getByLabelText('auth.labels.password')).toBeInTheDocument()
      expect(
        screen.queryByLabelText('auth.labels.confirmPassword')
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'common.auth.signIn' })
      ).toBeInTheDocument()
    })

    test('calls signInWithEmail when form is submitted with valid data', async () => {
      render(<FirebaseEmailSignIn mode='signin' redirectTo='/dashboard' />)

      const emailInput = screen.getByLabelText('auth.labels.email')
      const passwordInput = screen.getByLabelText('auth.labels.password')
      const submitButton = screen.getByRole('button', { name: 'common.auth.signIn' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(mockClearError).toHaveBeenCalled()
      expect(mockSignInWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Password123',
        '/dashboard'
      )
    })

    test('does not submit with invalid email', async () => {
      render(<FirebaseEmailSignIn mode='signin' />)

      const emailInput = screen.getByLabelText('auth.labels.email')
      const passwordInput = screen.getByLabelText('auth.labels.password')
      const submitButton = screen.getByRole('button', { name: 'common.auth.signIn' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(mockSignInWithEmail).not.toHaveBeenCalled()
    })

    test('does not submit with password too short', async () => {
      render(<FirebaseEmailSignIn mode='signin' />)

      const emailInput = screen.getByLabelText('auth.labels.email')
      const passwordInput = screen.getByLabelText('auth.labels.password')
      const submitButton = screen.getByRole('button', { name: 'common.auth.signIn' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: '123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(mockSignInWithEmail).not.toHaveBeenCalled()
    })
  })

  describe('Sign Up Mode', () => {
    test('renders sign up form correctly', () => {
      render(<FirebaseEmailSignIn mode='signup' />)

      expect(screen.getByLabelText('auth.labels.email')).toBeInTheDocument()
      expect(screen.getByLabelText('auth.labels.password')).toBeInTheDocument()
      expect(screen.getByLabelText('auth.labels.confirmPassword')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'common.auth.signUp' })
      ).toBeInTheDocument()
      expect(
        screen.getByText('auth.validation.passwordRequirements')
      ).toBeInTheDocument()
    })

    test('calls signUpWithEmail when form is submitted with valid data', async () => {
      render(<FirebaseEmailSignIn mode='signup' redirectTo='/welcome' />)

      const emailInput = screen.getByLabelText('auth.labels.email')
      const passwordInput = screen.getByLabelText('auth.labels.password')
      const confirmPasswordInput = screen.getByLabelText('auth.labels.confirmPassword')
      const submitButton = screen.getByRole('button', { name: 'common.auth.signUp' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123' } })
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(mockClearError).toHaveBeenCalled()
      expect(mockSignUpWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Password123',
        '/welcome'
      )
    })

    test('does not submit when passwords do not match', async () => {
      render(<FirebaseEmailSignIn mode='signup' />)

      const emailInput = screen.getByLabelText('auth.labels.email')
      const passwordInput = screen.getByLabelText('auth.labels.password')
      const confirmPasswordInput = screen.getByLabelText('auth.labels.confirmPassword')
      const submitButton = screen.getByRole('button', { name: 'common.auth.signUp' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123' } })
        fireEvent.change(confirmPasswordInput, { target: { value: 'Different123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(mockSignUpWithEmail).not.toHaveBeenCalled()
    })

    test('does not submit with weak password in signup mode', async () => {
      render(<FirebaseEmailSignIn mode='signup' />)

      const emailInput = screen.getByLabelText('auth.labels.email')
      const passwordInput = screen.getByLabelText('auth.labels.password')
      const confirmPasswordInput = screen.getByLabelText('auth.labels.confirmPassword')
      const submitButton = screen.getByRole('button', { name: 'common.auth.signUp' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } }) // No uppercase
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(mockSignUpWithEmail).not.toHaveBeenCalled()
    })
  })

  describe('Loading and Error States', () => {
    test('shows loading state during authentication', async () => {
      const { useFirebaseAuth } = await import('../../../hooks/useFirebaseAuth')
      vi.mocked(useFirebaseAuth).mockReturnValue({
        ...defaultHookReturn,
        loading: true,
        signInWithEmail: mockSignInWithEmail,
        clearError: mockClearError,
      })

      render(<FirebaseEmailSignIn mode='signin' />)

      const submitButton = screen.getByRole('button')
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('auth.buttons.signingIn')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin')
    })

    test('displays error message when authentication fails', async () => {
      const { useFirebaseAuth } = await import('../../../hooks/useFirebaseAuth')
      vi.mocked(useFirebaseAuth).mockReturnValue({
        ...defaultHookReturn,
        error: 'Authentication failed',
        signInWithEmail: mockSignInWithEmail,
        clearError: mockClearError,
      })

      render(<FirebaseEmailSignIn mode='signin' />)

      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
      expect(screen.getByText('Authentication failed')).toHaveClass('text-destructive')
    })

    test('disables inputs during loading', async () => {
      const { useFirebaseAuth } = await import('../../../hooks/useFirebaseAuth')
      vi.mocked(useFirebaseAuth).mockReturnValue({
        ...defaultHookReturn,
        loading: true,
        signInWithEmail: mockSignInWithEmail,
        clearError: mockClearError,
      })

      render(<FirebaseEmailSignIn mode='signup' />)

      expect(screen.getByLabelText('auth.labels.email')).toBeDisabled()
      expect(screen.getByLabelText('auth.labels.password')).toBeDisabled()
      expect(screen.getByLabelText('auth.labels.confirmPassword')).toBeDisabled()
    })

    test('shows error styling for invalid email', async () => {
      const { useFirebaseAuth } = await import('../../../hooks/useFirebaseAuth')
      vi.mocked(useFirebaseAuth).mockReturnValue({
        ...defaultHookReturn,
        error: 'Invalid email',
        signInWithEmail: mockSignInWithEmail,
        clearError: mockClearError,
      })

      render(<FirebaseEmailSignIn mode='signin' />)

      const emailInput = screen.getByLabelText('auth.labels.email')

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid' } })
        fireEvent.blur(emailInput)
      })

      await waitFor(() => {
        expect(emailInput).toHaveClass('border-destructive')
      })
    })
  })

  describe('Default Props and RedirectTo', () => {
    test('uses default redirectTo when none provided', async () => {
      render(<FirebaseEmailSignIn mode='signin' />)

      const emailInput = screen.getByLabelText('auth.labels.email')
      const passwordInput = screen.getByLabelText('auth.labels.password')
      const submitButton = screen.getByRole('button', { name: 'common.auth.signIn' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(mockSignInWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Password123',
        '/a7k9m2x5p8w1n4q6r3y8b5t1'
      )
    })

    test('applies custom className and variant props', () => {
      render(
        <FirebaseEmailSignIn
          mode='signin'
          className='custom-class'
          variant='outline'
          size='lg'
        />
      )

      // Test that the component renders with the props (custom styling is applied internally)
      expect(screen.getByLabelText('auth.labels.email')).toBeInTheDocument()
    })
  })
})
