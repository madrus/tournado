import { createMemoryRouter, RouterProvider } from 'react-router'

import { cleanup, render, screen } from '@testing-library/react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Import the actual route component
import SignupRoute from '~/routes/auth/auth.signup'

type ActionData = {
  errors?: {
    email: string | null
    password: string | null
    firstName?: string | null
    lastName?: string | null
  }
  [key: string]: unknown
}

// Mock the SignUp component
vi.mock('~/components/auth', () => ({
  SignUp: ({ actionData }: { actionData?: ActionData }) => (
    <div data-testid='signup-component'>
      <div data-testid='signup-action-data'>
        {actionData === undefined ? 'null' : JSON.stringify(actionData)}
      </div>
    </div>
  ),
}))

// Mock react-router hooks for the route
vi.mock('react-router', async () => {
  const actualRouter = await vi.importActual('react-router')
  return {
    ...actualRouter,
    useActionData: vi.fn(),
  }
})

describe('Auth SignUp Route Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    // Clean up DOM completely
    document.body.innerHTML = ''
    // Clear all mocks to prevent state leakage
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  const renderSignupRoute = async (actionData?: ActionData) => {
    const { useActionData } = await import('react-router')
    vi.mocked(useActionData).mockReturnValue(actionData)

    const router = createMemoryRouter(
      [
        {
          path: '/',
          Component: SignupRoute,
        },
      ],
      {
        initialEntries: ['/'],
      }
    )

    return render(<RouterProvider router={router} />)
  }

  it('renders SignUp component', async () => {
    cleanup()
    await renderSignupRoute()

    expect(screen.getByTestId('signup-component')).toBeInTheDocument()
  })

  it('passes actionData to SignUp component', async () => {
    cleanup()
    const testActionData = {
      errors: {
        email: 'Email already exists',
        password: 'Password too short',
        firstName: null,
        lastName: null,
      },
    }

    await renderSignupRoute(testActionData)

    expect(screen.getByTestId('signup-component')).toBeInTheDocument()
    expect(screen.getByTestId('signup-action-data')).toHaveTextContent(
      JSON.stringify(testActionData)
    )
  })

  it('handles undefined actionData gracefully', async () => {
    await renderSignupRoute(undefined)

    expect(screen.getByTestId('signup-component')).toBeInTheDocument()
    expect(screen.getByTestId('signup-action-data')).toHaveTextContent('null')
  })

  it('handles empty actionData', async () => {
    await renderSignupRoute({})

    expect(screen.getByTestId('signup-component')).toBeInTheDocument()
    expect(screen.getByTestId('signup-action-data')).toHaveTextContent('{}')
  })

  it('passes complex actionData correctly', async () => {
    const complexActionData = {
      errors: {
        firstName: 'firstNameRequired',
        lastName: 'lastNameRequired',
        email: 'invalidEmail',
        password: 'passwordTooShort',
      },
      someOtherData: {
        nested: 'value',
      },
    }

    await renderSignupRoute(complexActionData)

    expect(screen.getByTestId('signup-component')).toBeInTheDocument()
    expect(screen.getByTestId('signup-action-data')).toHaveTextContent(
      JSON.stringify(complexActionData)
    )
  })
})
