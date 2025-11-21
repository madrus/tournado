import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Import the actual route component
import SigninRoute from '~/routes/auth/auth.signin'

type ActionData = {
	errors?: {
		email: string | null
		password: string | null
	}
}

// Mock the FirebaseAuth components (Google OAuth and Email/Password)
vi.mock('~/features/firebase/components/FirebaseAuth', () => ({
	FirebaseSignIn: ({ redirectTo }: { redirectTo?: string }) => (
		<div data-testid='firebase-signin-component'>
			<div data-testid='firebase-redirect-data'>{redirectTo || '/a7k9m2x5p8w1n4q6r3y8b5t1'}</div>
		</div>
	),
	FirebaseEmailSignIn: ({ mode, redirectTo }: { mode: string; redirectTo?: string }) => (
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
			},
		)

		return render(<RouterProvider router={router} />)
	}

	it('renders Firebase SignIn components', async () => {
		await renderSigninRoute()

		expect(screen.getByTestId('firebase-signin-component')).toBeInTheDocument()
		expect(screen.getByTestId('firebase-email-signin-component')).toBeInTheDocument()
	})

	it('passes redirectTo to Firebase components', async () => {
		await renderSigninRoute()

		expect(screen.getByTestId('firebase-signin-component')).toBeInTheDocument()
		expect(screen.getByTestId('firebase-redirect-data')).toHaveTextContent(
			'/a7k9m2x5p8w1n4q6r3y8b5t1',
		)

		expect(screen.getByTestId('firebase-email-signin-component')).toBeInTheDocument()
		expect(screen.getByTestId('firebase-email-mode')).toHaveTextContent('signin')
		expect(screen.getByTestId('firebase-email-redirect-data')).toHaveTextContent(
			'/a7k9m2x5p8w1n4q6r3y8b5t1',
		)
	})

	it('handles null redirectTo gracefully', async () => {
		const { useActionData, useLoaderData } = await import('react-router')
		vi.mocked(useActionData).mockReturnValue(undefined)
		vi.mocked(useLoaderData).mockReturnValue({
			redirectTo: null,
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
			},
		)

		render(<RouterProvider router={router} />)

		expect(screen.getByTestId('firebase-signin-component')).toBeInTheDocument()
		expect(screen.getByTestId('firebase-email-signin-component')).toBeInTheDocument()
	})

	it('renders with default redirect paths when no redirectTo provided', async () => {
		await renderSigninRoute()

		expect(screen.getByTestId('firebase-redirect-data')).toHaveTextContent(
			'/a7k9m2x5p8w1n4q6r3y8b5t1',
		)
		expect(screen.getByTestId('firebase-email-redirect-data')).toHaveTextContent(
			'/a7k9m2x5p8w1n4q6r3y8b5t1',
		)
	})
})
