import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}))

describe('ErrorBoundary', () => {
	const ProblemChild = () => {
		throw new Error('Test error')
	}

	it('should render fallback UI when an error occurs', async () => {
		const onErrorMock = vi.fn()
		render(
			<ErrorBoundary onError={onErrorMock}>
				<ProblemChild />
			</ErrorBoundary>,
		)

		await waitFor(() => {
			expect(onErrorMock).toHaveBeenCalledTimes(1)
		})

		expect(screen.getByRole('alert')).toBeInTheDocument()
		expect(screen.getByText('messages.panel.errorTitle')).toBeInTheDocument()
		expect(screen.getByText('messages.panel.errorBody')).toBeInTheDocument()
		expect(screen.getByText('Test error')).toBeInTheDocument()
		expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
	})

	it('should render children when no error occurs', () => {
		const onErrorMock = vi.fn()
		render(
			<ErrorBoundary onError={onErrorMock}>
				<div>No error here</div>
			</ErrorBoundary>,
		)

		expect(screen.getByText('No error here')).toBeInTheDocument()
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
		expect(onErrorMock).not.toHaveBeenCalled()
	})
})
