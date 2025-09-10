import { createMemoryRouter, RouterProvider } from 'react-router'

import { cleanup, render, screen } from '@testing-library/react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Import the actual route component
import SigninRoute from '~/routes/auth/auth.signin'

type ActionData = {
  errors?: {
    email: string | null
    password: string | null
  }
}

// Mock the SignIn component
vi.mock('~/components/auth', () => ({
  SignIn: ({ actionData }: { actionData?: ActionData }) => (
    <div data-testid='signin-component'>
      <div data-testid='signin-action-data'>
        {actionData === undefined ? 'null' : JSON.stringify(actionData)}
      </div>
    </div>
  ),
}))

// Mock the FirebaseSignIn component
vi.mock('~/features/firebase/components/FirebaseSignIn', () => ({
  FirebaseSignIn: ({ redirectTo }: { redirectTo?: string }) => (
    <div data-testid='firebase-signin-component'>
      <div data-testid='firebase-redirect-data'>{redirectTo || 'null'}</div>
    </div>
  ),
}))

// Mock react-router hooks for the route
vi.mock('react-router', async () => {
  const actualRouter = await vi.importActual('react-router')
  return {
    ...actualRouter,
    useActionData: vi.fn(),
    useLoaderData: vi.fn(),
  }
})

describe('Auth SignIn Route Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const renderSigninRoute = async (actionData?: ActionData) => {
    const { useActionData, useLoaderData } = await import('react-router')
    vi.mocked(useActionData).mockReturnValue(actionData)
    vi.mocked(useLoaderData).mockReturnValue({
      redirectTo: '/a7k9m2x5p8w1n4q6r3y8b5t1',
    })

    const router = createMemoryRouter(
      [
        {
          path: '/',
          Component: SigninRoute,
        },
      ],
      {
        initialEntries: ['/'],
      }
    )

    return render(<RouterProvider router={router} />)
  }

  it('renders SignIn component', async () => {
    await renderSigninRoute()

    expect(screen.getByTestId('signin-component')).toBeInTheDocument()
  })

  it('passes actionData to SignIn component', async () => {
    const testActionData = {
      errors: {
        email: 'Invalid email',
        password: null,
      },
    }

    await renderSigninRoute(testActionData)

    expect(screen.getByTestId('signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('signin-action-data')).toHaveTextContent(
      JSON.stringify(testActionData)
    )
  })

  it('handles undefined actionData gracefully', async () => {
    await renderSigninRoute(undefined)

    expect(screen.getByTestId('signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('signin-action-data')).toHaveTextContent('null')
  })

  it('handles empty actionData', async () => {
    await renderSigninRoute({})

    expect(screen.getByTestId('signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('signin-action-data')).toHaveTextContent('{}')
  })
})
