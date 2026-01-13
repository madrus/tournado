import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGroupAssignmentStore } from '~/features/competition/stores/useGroupAssignmentStore'
import { useTeamFormStore } from '~/features/teams/stores/useTeamFormStore'
import { useTournamentFormStore } from '~/features/tournaments/stores/useTournamentFormStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { adminPath } from '~/utils/adminRoutes'
import type { Route } from '../+types/root'
import App from '../root'

const mockUseLocation = vi.fn()

vi.mock('react-router', async importOriginal => {
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

vi.mock('~/i18n/config', async () => {
  const actual = await vi.importActual<typeof import('~/i18n/config')>('~/i18n/config')
  return {
    ...actual,
    initI18n: () => ({
      changeLanguage: vi.fn(),
    }),
  }
})

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
    mockUseLocation.mockReset()
    useGroupAssignmentStore.getState().clearStore()
    useTeamFormStore.getState().resetStoreState()
    useTeamFormStore.getState().resetForm()
    useTournamentFormStore.getState().resetStoreState()
    useTournamentFormStore.getState().resetForm()
    useAuthStore.getState().resetStoreState()
    useSettingsStore.getState().resetSettingsStoreState()
  })

  it('clears group assignment store when leaving group assignment route', async () => {
    useGroupAssignmentStore.setState({ activeGroupIndex: 2 })
    mockUseLocation.mockReturnValue({
      pathname: adminPath('/competition/groups/123'),
    })
    const { rerender } = render(<App {...baseProps} />)

    expect(useGroupAssignmentStore.getState().activeGroupIndex).toBe(2)

    mockUseLocation.mockReturnValue({
      pathname: adminPath('/competition/groups'),
    })

    rerender(<App {...baseProps} />)

    await waitFor(() => {
      expect(useGroupAssignmentStore.getState().activeGroupIndex).toBe(0)
    })
  })

  it('clears team form store when leaving team form routes', async () => {
    const teamFormState = useTeamFormStore.getState()
    useTeamFormStore.setState({
      formFields: {
        ...teamFormState.formFields,
        name: 'Dirty Team',
      },
    })
    mockUseLocation.mockReturnValue({
      pathname: '/teams/new',
    })

    const { rerender } = render(<App {...baseProps} />)

    expect(useTeamFormStore.getState().formFields.name).toBe('Dirty Team')

    mockUseLocation.mockReturnValue({
      pathname: '/teams',
    })

    rerender(<App {...baseProps} />)

    await waitFor(() => {
      expect(useTeamFormStore.getState().formFields.name).toBe('')
    })
  })

  it('clears team form store when leaving team edit route', async () => {
    const teamFormState = useTeamFormStore.getState()
    useTeamFormStore.setState({
      formFields: {
        ...teamFormState.formFields,
        name: 'Dirty Team',
      },
    })
    mockUseLocation.mockReturnValue({
      pathname: '/teams/team-123',
    })

    const { rerender } = render(<App {...baseProps} />)

    expect(useTeamFormStore.getState().formFields.name).toBe('Dirty Team')

    mockUseLocation.mockReturnValue({
      pathname: '/teams',
    })

    rerender(<App {...baseProps} />)

    await waitFor(() => {
      expect(useTeamFormStore.getState().formFields.name).toBe('')
    })
  })

  it('clears tournament form store when leaving tournament form routes', async () => {
    const tournamentFormState = useTournamentFormStore.getState()
    useTournamentFormStore.setState({
      formFields: {
        ...tournamentFormState.formFields,
        name: 'Dirty Tournament',
      },
    })
    mockUseLocation.mockReturnValue({
      pathname: adminPath('/tournaments/new'),
    })

    const { rerender } = render(<App {...baseProps} />)

    expect(useTournamentFormStore.getState().formFields.name).toBe('Dirty Tournament')

    mockUseLocation.mockReturnValue({
      pathname: adminPath('/tournaments'),
    })

    rerender(<App {...baseProps} />)

    await waitFor(() => {
      expect(useTournamentFormStore.getState().formFields.name).toBe('')
    })
  })

  it('clears tournament form store when leaving tournament edit route', async () => {
    const tournamentFormState = useTournamentFormStore.getState()
    useTournamentFormStore.setState({
      formFields: {
        ...tournamentFormState.formFields,
        name: 'Dirty Tournament',
      },
    })
    mockUseLocation.mockReturnValue({
      pathname: adminPath('/tournaments/tournament-123'),
    })

    const { rerender } = render(<App {...baseProps} />)

    expect(useTournamentFormStore.getState().formFields.name).toBe('Dirty Tournament')

    mockUseLocation.mockReturnValue({
      pathname: adminPath('/tournaments'),
    })

    rerender(<App {...baseProps} />)

    await waitFor(() => {
      expect(useTournamentFormStore.getState().formFields.name).toBe('')
    })
  })
})
