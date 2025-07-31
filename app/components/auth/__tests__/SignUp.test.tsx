import { createMemoryRouter, RouterProvider } from 'react-router'

import { render, screen } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SignUp } from '../SignUp'

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
        'auth.firstName': 'First Name',
        'auth.lastName': 'Last Name',
        'auth.emailAddress': 'Email Address',
        'auth.password': 'Password',
        'auth.createAccount': 'Create Account',
        'auth.alreadyHaveAccount': 'Already have an account?',
        'auth.signin': 'Sign in',
        'common.loading': 'Loading...',
        'auth.errors.emailExists': 'Email already exists',
        'auth.errors.passwordTooShort': 'Password too short',
        'auth.errors.firstNameRequired': 'First name is required',
        'auth.errors.lastNameRequired': 'Last name is required',
      }
      return translations[key] || key
    },
    i18n: { language: 'en' },
  }),
}))

describe('SignUp Component', () => {
  const renderSignUpWithRouter = (
    actionData?: {
      errors?: {
        email: string | null
        password: string | null
        firstName?: string | null
        lastName?: string | null
      }
    },
    searchParams = ''
  ) => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <SignUp actionData={actionData} />,
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

  it('renders sign up form with all required fields', () => {
    renderSignUpWithRouter()

    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('shows loading state when submitting', () => {
    mockUseNavigation.mockReturnValue({ state: 'submitting' })
    renderSignUpWithRouter()

    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays first name validation error', () => {
    const actionData = {
      errors: {
        firstName: 'firstNameRequired',
        lastName: null,
        email: null,
        password: null,
      },
    }

    renderSignUpWithRouter(actionData)

    expect(screen.getByText('First name is required')).toBeInTheDocument()
    expect(screen.getByLabelText('First Name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays last name validation error', () => {
    const actionData = {
      errors: {
        firstName: null,
        lastName: 'lastNameRequired',
        email: null,
        password: null,
      },
    }

    renderSignUpWithRouter(actionData)

    expect(screen.getByText('Last name is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays email validation error', () => {
    const actionData = {
      errors: {
        firstName: null,
        lastName: null,
        email: 'emailExists',
        password: null,
      },
    }

    renderSignUpWithRouter(actionData)

    expect(screen.getByText('Email already exists')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('displays password validation error', () => {
    const actionData = {
      errors: {
        firstName: null,
        lastName: null,
        email: null,
        password: 'passwordTooShort',
      },
    }

    renderSignUpWithRouter(actionData)

    expect(screen.getByText('Password too short')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays multiple validation errors simultaneously', () => {
    const actionData = {
      errors: {
        firstName: 'firstNameRequired',
        lastName: 'lastNameRequired',
        email: 'emailExists',
        password: 'passwordTooShort',
      },
    }

    renderSignUpWithRouter(actionData)

    expect(screen.getByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
    expect(screen.getByText('Email already exists')).toBeInTheDocument()
    expect(screen.getByText('Password too short')).toBeInTheDocument()
  })

  it('includes redirect parameter in hidden input', () => {
    renderSignUpWithRouter(undefined, '?redirectTo=/dashboard')

    const redirectInput = screen.getByDisplayValue('/dashboard')
    expect(redirectInput).toHaveAttribute('type', 'hidden')
    expect(redirectInput).toHaveAttribute('name', 'redirectTo')
  })

  it('has proper form attributes', () => {
    renderSignUpWithRouter()

    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('method', 'post')
  })

  it('includes link to signin page', () => {
    renderSignUpWithRouter()

    const signinLink = screen.getByRole('link', { name: 'Sign in' })
    expect(signinLink).toHaveAttribute('href', '/auth/signin')
  })

  it('has proper accessibility attributes for all fields', () => {
    const actionData = {
      errors: {
        firstName: 'firstNameRequired',
        lastName: 'lastNameRequired',
        email: 'emailExists',
        password: 'passwordTooShort',
      },
    }

    renderSignUpWithRouter(actionData)

    expect(screen.getByLabelText('First Name')).toHaveAttribute(
      'aria-describedby',
      'firstName-error'
    )
    expect(screen.getByLabelText('Last Name')).toHaveAttribute(
      'aria-describedby',
      'lastName-error'
    )
    expect(screen.getByLabelText('Email Address')).toHaveAttribute(
      'aria-describedby',
      'email-error'
    )
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'aria-describedby',
      'password-error'
    )

    expect(screen.getByText('First name is required')).toHaveAttribute(
      'id',
      'firstName-error'
    )
    expect(screen.getByText('Last name is required')).toHaveAttribute(
      'id',
      'lastName-error'
    )
    expect(screen.getByText('Email already exists')).toHaveAttribute(
      'id',
      'email-error'
    )
    expect(screen.getByText('Password too short')).toHaveAttribute(
      'id',
      'password-error'
    )
  })

  it('has correct input types and autocomplete attributes', () => {
    renderSignUpWithRouter()

    const firstNameInput = screen.getByLabelText('First Name')
    const lastNameInput = screen.getByLabelText('Last Name')
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')

    expect(firstNameInput).toHaveAttribute('type', 'text')
    expect(firstNameInput).toHaveAttribute('autoComplete', 'given-name')

    expect(lastNameInput).toHaveAttribute('type', 'text')
    expect(lastNameInput).toHaveAttribute('autoComplete', 'family-name')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autoComplete', 'email')

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password')
  })

  it('marks all fields as required', () => {
    renderSignUpWithRouter()

    expect(screen.getByLabelText('First Name')).toBeRequired()
    expect(screen.getByLabelText('Last Name')).toBeRequired()
    expect(screen.getByLabelText('Email Address')).toBeRequired()
    expect(screen.getByLabelText('Password')).toBeRequired()
  })

  it('handles form field focus management', () => {
    renderSignUpWithRouter()

    // All inputs should be in the document and focusable
    const firstNameInput = screen.getByLabelText('First Name')
    const lastNameInput = screen.getByLabelText('Last Name')
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')

    firstNameInput.focus()
    expect(firstNameInput).toHaveFocus()

    lastNameInput.focus()
    expect(lastNameInput).toHaveFocus()

    emailInput.focus()
    expect(emailInput).toHaveFocus()

    passwordInput.focus()
    expect(passwordInput).toHaveFocus()
  })

  it('has proper layout structure with footer', () => {
    renderSignUpWithRouter()

    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('handles empty redirect parameter', () => {
    renderSignUpWithRouter()

    const hiddenInputs = screen.getAllByDisplayValue('')
    const redirectInput = hiddenInputs.find(
      input => input.getAttribute('name') === 'redirectTo'
    )
    expect(redirectInput).toHaveAttribute('name', 'redirectTo')
  })
})
