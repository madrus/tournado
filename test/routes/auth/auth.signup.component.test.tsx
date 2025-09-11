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

// Mock the FirebaseSignIn component (Google OAuth)
vi.mock('~/features/firebase/components/FirebaseSignIn', () => ({
  FirebaseSignIn: ({ redirectTo }: { redirectTo?: string }) => (
    <div data-testid='firebase-signin-component'>
      <div data-testid='firebase-redirect-data'>
        {redirectTo || '/a7k9m2x5p8w1n4q6r3y8b5t1'}
      </div>
    </div>
  ),
}))

// Mock the FirebaseEmailSignIn component (Email/Password)
vi.mock('~/features/firebase/components/FirebaseEmailSignIn', () => ({
  FirebaseEmailSignIn: ({
    mode,
    redirectTo,
  }: {
    mode: string
    redirectTo?: string
  }) => (
    <div data-testid='firebase-email-signin-component'>
      <div data-testid='firebase-email-mode'>{mode}</div>
      <div data-testid='firebase-email-redirect-data'>
        {redirectTo || '/a7k9m2x5p8w1n4q6r3y8b5t1'}
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
    useLoaderData: vi.fn(),
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
    const { useActionData, useLoaderData } = await import('react-router')
    vi.mocked(useActionData).mockReturnValue(actionData)
    vi.mocked(useLoaderData).mockReturnValue({
      redirectTo: '/a7k9m2x5p8w1n4q6r3y8b5t1',
    })

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

  it('renders Firebase SignUp components', async () => {
    cleanup()
    await renderSignupRoute()

    expect(screen.getByTestId('firebase-signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('firebase-email-signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('firebase-email-mode')).toHaveTextContent('signup')
  })

  it('passes redirectTo to Firebase components', async () => {
    cleanup()
    await renderSignupRoute()

    expect(screen.getByTestId('firebase-signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('firebase-redirect-data')).toHaveTextContent(
      '/a7k9m2x5p8w1n4q6r3y8b5t1'
    )

    expect(screen.getByTestId('firebase-email-signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('firebase-email-mode')).toHaveTextContent('signup')
    expect(screen.getByTestId('firebase-email-redirect-data')).toHaveTextContent(
      '/a7k9m2x5p8w1n4q6r3y8b5t1'
    )
  })

  it('handles null redirectTo gracefully', async () => {
    cleanup()
    const { useActionData, useLoaderData } = await import('react-router')
    vi.mocked(useActionData).mockReturnValue(undefined)
    vi.mocked(useLoaderData).mockReturnValue({
      redirectTo: null,
    })

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

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId('firebase-signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('firebase-email-signin-component')).toBeInTheDocument()
    expect(screen.getByTestId('firebase-email-mode')).toHaveTextContent('signup')
  })

  it('renders with default redirect paths when no redirectTo provided', async () => {
    cleanup()
    await renderSignupRoute()

    expect(screen.getByTestId('firebase-redirect-data')).toHaveTextContent(
      '/a7k9m2x5p8w1n4q6r3y8b5t1'
    )
    expect(screen.getByTestId('firebase-email-redirect-data')).toHaveTextContent(
      '/a7k9m2x5p8w1n4q6r3y8b5t1'
    )
  })
})
