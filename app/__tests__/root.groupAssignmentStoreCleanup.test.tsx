import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Language } from '~/i18n/config'
import { adminPath } from '~/utils/adminRoutes'
import type { Route } from '../+types/root'
import App from '../root'

const mockClearStore = vi.fn()
const mockResetTeamForm = vi.fn()
const mockResetTournamentForm = vi.fn()
const mockUseLocation = vi.fn()
const mockSetAvailableOptionsField = vi.fn()

vi.mock('react-router', async (importOriginal) => {
	const actual = await importOriginal<typeof import('react-router')>()
	return {
		...actual,
		Links: () => null,
		Meta: () => null,
		Scripts: () => null,
		ScrollRestoration: () => null,
		useLocation: () => mockUseLocation(),
	}
})

vi.mock('~/components/AppLayout', () => ({
	AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('~/components/PWAElements', () => ({
	PWAElements: () => null,
}))

vi.mock('~/components/RouteTransition', () => ({
	SubtleRouteTransition: () => null,
}))

vi.mock('~/features/competition/stores/useGroupAssignmentStore', () => ({
	useGroupAssignmentActions: () => ({
		clearStore: mockClearStore,
	}),
}))

vi.mock('~/features/teams/stores/useTeamFormStore', () => ({
	useTeamFormActions: () => ({
		resetForm: mockResetTeamForm,
	}),
	useTeamFormStore: () => ({
		setAvailableOptionsField: mockSetAvailableOptionsField,
	}),
}))

vi.mock('~/features/tournaments/stores/useTournamentFormStore', () => ({
	useTournamentFormActions: () => ({
		resetForm: mockResetTournamentForm,
	}),
}))

vi.mock('~/i18n/config', async () => {
	const actual = await vi.importActual<typeof import('~/i18n/config')>('~/i18n/config')
	return {
		...actual,
		initI18n: () => ({
			changeLanguage: vi.fn(),
		}),
	}
})

vi.mock('~/stores/useAuthStore', () => ({
	useAuthActions: () => ({
		setUser: vi.fn(),
		setFirebaseUser: vi.fn(),
	}),
	useAuthStoreHydration: () => undefined,
	useAuthUser: () => null,
}))

vi.mock('~/stores/useSettingsStore', () => ({
	useSettingsActions: () => ({
		setTheme: vi.fn(),
		setLanguage: vi.fn(),
	}),
	useSettingsLanguage: () => 'nl' as Language,
	useSettingsStoreHydration: () => undefined,
	useSettingsTheme: () => 'light' as const,
}))

describe('App route cleanup', () => {
	const loaderData: Route.ComponentProps['loaderData'] = {
		authenticated: false,
		username: '',
		user: null,
		ENV: {},
		language: 'nl',
		theme: 'light',
		tournaments: [],
	}

	const baseProps: Route.ComponentProps = {
		loaderData,
		params: {},
		matches: [
			{
				id: 'root',
				params: {},
				pathname: '/',
				data: loaderData,
				loaderData,
				handle: undefined,
			},
		],
	}

	beforeEach(() => {
		mockClearStore.mockReset()
		mockResetTeamForm.mockReset()
		mockResetTournamentForm.mockReset()
		mockUseLocation.mockReset()
		mockSetAvailableOptionsField.mockReset()
	})

	it('clears group assignment store when leaving group assignment route', () => {
		mockUseLocation.mockReturnValue({
			pathname: adminPath('/competition/groups/123'),
		})
		const { rerender } = render(<App {...baseProps} />)

		expect(mockClearStore).not.toHaveBeenCalled()

		mockUseLocation.mockReturnValue({
			pathname: adminPath('/competition/groups'),
		})

		rerender(<App {...baseProps} />)

		expect(mockClearStore).toHaveBeenCalledTimes(1)
	})

	it('clears team form store when leaving team form routes', () => {
		mockUseLocation.mockReturnValue({
			pathname: '/teams/new',
		})

		const { rerender } = render(<App {...baseProps} />)

		expect(mockResetTeamForm).not.toHaveBeenCalled()

		mockUseLocation.mockReturnValue({
			pathname: '/teams',
		})

		rerender(<App {...baseProps} />)

		expect(mockResetTeamForm).toHaveBeenCalledTimes(1)
	})

	it('clears team form store when leaving team edit route', () => {
		mockUseLocation.mockReturnValue({
			pathname: '/teams/team-123',
		})

		const { rerender } = render(<App {...baseProps} />)

		expect(mockResetTeamForm).not.toHaveBeenCalled()

		mockUseLocation.mockReturnValue({
			pathname: '/teams',
		})

		rerender(<App {...baseProps} />)

		expect(mockResetTeamForm).toHaveBeenCalledTimes(1)
	})

	it('clears tournament form store when leaving tournament form routes', () => {
		mockUseLocation.mockReturnValue({
			pathname: adminPath('/tournaments/new'),
		})

		const { rerender } = render(<App {...baseProps} />)

		expect(mockResetTournamentForm).not.toHaveBeenCalled()

		mockUseLocation.mockReturnValue({
			pathname: adminPath('/tournaments'),
		})

		rerender(<App {...baseProps} />)

		expect(mockResetTournamentForm).toHaveBeenCalledTimes(1)
	})

	it('clears tournament form store when leaving tournament edit route', () => {
		mockUseLocation.mockReturnValue({
			pathname: adminPath('/tournaments/tournament-123'),
		})

		const { rerender } = render(<App {...baseProps} />)

		expect(mockResetTournamentForm).not.toHaveBeenCalled()

		mockUseLocation.mockReturnValue({
			pathname: adminPath('/tournaments'),
		})

		rerender(<App {...baseProps} />)

		expect(mockResetTournamentForm).toHaveBeenCalledTimes(1)
	})
})
