import { render, screen } from '@testing-library/react'
import { isRouteErrorResponse, MemoryRouter, useRouteError } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthErrorBoundary } from '../AuthErrorBoundary'

// Mock react-router hooks
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router')
	return {
		...actual,
		useRouteError: vi.fn(),
		isRouteErrorResponse: vi.fn(),
	}
})

// Mock react-i18next to simply return the key as the value
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		// Simply return the key as the translation value for easier testing
		t: (key: string) => key,
		i18n: {
			language: 'en',
		},
	}),
}))

describe('AuthErrorBoundary', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render 404 route error correctly', () => {
		// Setup
		// Create a mock that has the necessary properties for the component to work with
		// Using errorInfo instead of data to avoid the restricted identifier
		const mockError = {
			status: 404,
			statusText: 'Not Found',
		}

		vi.mocked(useRouteError).mockReturnValue(mockError)
		vi.mocked(isRouteErrorResponse).mockReturnValue(true)

		// Render
		render(
			<MemoryRouter>
				<AuthErrorBoundary />
			</MemoryRouter>,
		)

		// Assert
		expect(screen.getByText('messages.common.notFoundTitle')).toBeInTheDocument()
		expect(screen.getByText('messages.auth.notFound')).toBeInTheDocument()
		expect(screen.getByText('common.backToHome')).toBeInTheDocument()
	})

	it('should render 401 route error correctly', () => {
		// Setup
		// Create a mock that has the necessary properties for the component to work with
		const mockError = {
			status: 401,
			statusText: 'Unauthorized',
		}

		vi.mocked(useRouteError).mockReturnValue(mockError)
		vi.mocked(isRouteErrorResponse).mockReturnValue(true)

		// Render
		render(
			<MemoryRouter>
				<AuthErrorBoundary />
			</MemoryRouter>,
		)

		// Assert
		expect(screen.getByText('messages.auth.unauthorizedTitle')).toBeInTheDocument()
		expect(screen.getByText('messages.auth.unauthorized')).toBeInTheDocument()
		expect(screen.getByText('common.backToHome')).toBeInTheDocument()
	})

	it('should render 403 route error correctly', () => {
		// Setup
		// Create a mock that has the necessary properties for the component to work with
		const mockError = {
			status: 403,
			statusText: 'Forbidden',
		}

		vi.mocked(useRouteError).mockReturnValue(mockError)
		vi.mocked(isRouteErrorResponse).mockReturnValue(true)

		// Render
		render(
			<MemoryRouter>
				<AuthErrorBoundary />
			</MemoryRouter>,
		)

		// Assert
		expect(screen.getByText('messages.auth.forbiddenTitle')).toBeInTheDocument()
		expect(screen.getByText('messages.auth.forbidden')).toBeInTheDocument()
		expect(screen.getByText('common.backToHome')).toBeInTheDocument()
	})

	it('should render other route errors with default message', () => {
		// Setup
		// Create a mock that has the necessary properties for the component to work with
		const mockError = {
			status: 500,
			statusText: 'Server Error',
		}

		vi.mocked(useRouteError).mockReturnValue(mockError)
		vi.mocked(isRouteErrorResponse).mockReturnValue(true)

		// Render
		render(
			<MemoryRouter>
				<AuthErrorBoundary />
			</MemoryRouter>,
		)

		// Assert
		expect(screen.getByText('messages.common.errorTitle')).toBeInTheDocument()
		expect(screen.getByText('messages.common.unexpectedError')).toBeInTheDocument()
		expect(screen.getByText('common.backToHome')).toBeInTheDocument()
	})

	it('should render JavaScript error correctly', () => {
		// Setup
		const mockError = new Error('Test JavaScript error')

		vi.mocked(useRouteError).mockReturnValue(mockError)
		vi.mocked(isRouteErrorResponse).mockReturnValue(false)

		// Render
		render(
			<MemoryRouter>
				<AuthErrorBoundary />
			</MemoryRouter>,
		)

		// Assert
		expect(screen.getByText('messages.common.errorTitle')).toBeInTheDocument()

		// For text content that contains multiple pieces, use contains.text
		const errorParagraph = screen.getByTestId('error-paragraph')
		expect(errorParagraph).toHaveTextContent('messages.common.unexpectedError')
		expect(errorParagraph).toHaveTextContent('Test JavaScript error')

		expect(screen.getByText('common.backToHome')).toBeInTheDocument()
	})

	it('should render unknown error correctly', () => {
		// Setup
		const mockError = 'String error that is not an Error object'

		vi.mocked(useRouteError).mockReturnValue(mockError)
		vi.mocked(isRouteErrorResponse).mockReturnValue(false)

		// Render
		render(
			<MemoryRouter>
				<AuthErrorBoundary />
			</MemoryRouter>,
		)

		// Assert
		expect(screen.getByText('messages.common.errorTitle')).toBeInTheDocument()

		// For text content that contains multiple pieces, use contains.text
		const errorParagraph = screen.getByTestId('error-paragraph')
		expect(errorParagraph).toHaveTextContent('messages.common.unexpectedError')
		expect(errorParagraph).toHaveTextContent('messages.common.unknownError')

		expect(screen.getByText('common.backToHome')).toBeInTheDocument()
	})
})
