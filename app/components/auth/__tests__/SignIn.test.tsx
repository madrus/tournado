import { createMemoryRouter, RouterProvider } from 'react-router'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SignIn } from '../SignIn'

// Mock the useNavigation hook
const mockUseNavigation = vi.fn()
vi.mock('react-router', async () => {
  const actualRouter = await vi.importActual('react-router')
  return {
    ...actualRouter,
    useNavigation: () => mockUseNavigation(),
  }
})

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.emailAddress': 'Email Address',
        'auth.password': 'Password',
        'auth.signin': 'Sign In',
        'auth.rememberMe': 'Remember me',
        'auth.dontHaveAccount': "Don't have an account?",
        'auth.signup': 'Sign up',
        'auth.registrationSuccess': 'Registration successful!',
        'auth.pleaseSignIn': 'Please sign in with your new account.',
        'common.loading': 'Loading...',
        'auth.errors.Email is invalid': 'Email is invalid',
        'auth.errors.passwordRequired': 'Password is required',
      }
      return translations[key] || key
    },
    i18n: { language: 'en' },
  }),
}))

// Mock rtlUtils
vi.mock('~/utils/rtlUtils', () => ({
  getLatinTitleClass: () => 'text-left',
}))

// Mock misc utils
vi.mock('~/utils/misc', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('SignIn Component', () => {
  const renderSignInWithRouter = (
    actionData?: { errors?: { email: string | null; password: string | null } },
    searchParams = ''
  ) => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <SignIn actionData={actionData} />,
        },
      ],
      {
        initialEntries: [`/${searchParams}`],
      }
    )

    return render(<RouterProvider router={router} />)
  }

  beforeEach(() => {
    mockUseNavigation.mockReturnValue({ state: 'idle' })
  })

  it('renders sign in form with all required fields', () => {
    renderSignInWithRouter()

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
  })

  it('shows loading state when submitting', () => {
    mockUseNavigation.mockReturnValue({ state: 'submitting' })
    renderSignInWithRouter()

    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays email validation error', () => {
    const actionData = {
      errors: {
        email: 'Email is invalid',
        password: null,
      },
    }

    renderSignInWithRouter(actionData)

    expect(screen.getByText('Email is invalid')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('displays password validation error', () => {
    const actionData = {
      errors: {
        email: null,
        password: 'passwordRequired',
      },
    }

    renderSignInWithRouter(actionData)

    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows registration success message when registered=true', () => {
    renderSignInWithRouter(undefined, '?registered=true')

    expect(screen.getByText('Registration successful!')).toBeInTheDocument()
    expect(
      screen.getByText('Please sign in with your new account.')
    ).toBeInTheDocument()
  })

  it('pre-fills email from registration', () => {
    renderSignInWithRouter(undefined, '?email=test@example.com')

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement
    expect(emailInput.value).toBe('test@example.com')
  })

  it('handles controlled input changes', async () => {
    renderSignInWithRouter()

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    await waitFor(() => {
      expect(emailInput.value).toBe('user@example.com')
      expect(passwordInput.value).toBe('password123')
    })
  })

  it('includes redirect parameter in hidden input', () => {
    renderSignInWithRouter(undefined, '?redirectTo=/admin')

    const redirectInput = screen.getByDisplayValue('/admin')
    expect(redirectInput).toHaveAttribute('type', 'hidden')
    expect(redirectInput).toHaveAttribute('name', 'redirectTo')
  })

  it('has proper form attributes', () => {
    renderSignInWithRouter()

    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('method', 'post')
  })

  it('includes link to signup page', () => {
    renderSignInWithRouter()

    const signupLink = screen.getByRole('link', { name: 'Sign up' })
    expect(signupLink).toHaveAttribute('href', '/auth/signup')
  })

  it('preserves search params in signup link', () => {
    renderSignInWithRouter(undefined, '?redirectTo=/admin&foo=bar')

    const signupLink = screen.getByRole('link', { name: 'Sign up' })
    const href = signupLink.getAttribute('href')
    expect(href).toContain('redirectTo=%2Fadmin')
    expect(href).toContain('foo=bar')
  })

  it('has proper accessibility attributes', () => {
    const actionData = {
      errors: {
        email: 'Email is invalid',
        password: 'passwordRequired',
      },
    }

    renderSignInWithRouter(actionData)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')

    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error')

    expect(screen.getByText('Email is invalid')).toHaveAttribute('id', 'email-error')
    expect(screen.getByText('Password is required')).toHaveAttribute(
      'id',
      'password-error'
    )
  })

  it('has correct input types and autocomplete attributes', () => {
    renderSignInWithRouter()

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autoComplete', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
  })

  it('focuses email input by default', () => {
    renderSignInWithRouter()

    const emailInput = screen.getByLabelText('Email Address')
    expect(emailInput).toHaveFocus()
  })

  it('marks required fields as required', () => {
    renderSignInWithRouter()

    expect(screen.getByLabelText('Email Address')).toBeRequired()
    expect(screen.getByLabelText('Password')).toBeRequired()
  })
})
