import { render, waitFor } from '@testing-library/react'
import * as ReactRouter from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  canDeleteGroupStage,
  deleteGroupStage,
  getGroupStageWithDetails,
} from '~/models/group.server'
import type { Tournament } from '~/models/tournament.server'
import { getTournamentById } from '~/models/tournament.server'
import type { User } from '~/models/user.server'
import {
  GroupStageDetails,
  action,
} from '~/routes/admin/competition/competition.groups.$groupStageId'
import { adminPath } from '~/utils/adminRoutes'
import { getUser } from '~/utils/session.server'
import { toast } from '~/utils/toastUtils'

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useActionData: vi.fn(),
    useLoaderData: vi.fn(),
    useSubmit: vi.fn(() => vi.fn()),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { reason?: string }) => {
      if (key === 'competition.groupAssignment.errors.deleteBlocked') {
        return `Cannot delete: ${options?.reason ?? ''}`.trim()
      }
      if (key === 'competition.groupAssignment.errors.deleteBlockedReason') {
        return 'This group stage has matches with recorded results'
      }
      return key
    },
    i18n: { language: 'en' },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

vi.mock('~/utils/routeUtils', () => ({
  useUser: () => ({ id: 'user-1', role: 'ADMIN' }),
  useMatchesData: vi.fn(() => ({})),
}))

vi.mock('~/features/competition/components/GroupAssignmentBoard', () => ({
  GroupAssignmentBoard: () => <div data-testid='group-assignment-board' />,
}))

vi.mock('~/features/competition/utils/groupStageDnd', () => ({
  createSnapshotFromLoader: vi.fn(() => ({})),
}))

vi.mock('~/utils/toastUtils', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

vi.mock('~/models/group.server', () => ({
  getGroupStageWithDetails: vi.fn(),
  getUnassignedTeamsByCategories: vi.fn(),
  canDeleteGroupStage: vi.fn(),
  deleteGroupStage: vi.fn(),
}))

vi.mock('~/models/tournament.server', () => ({
  getTournamentById: vi.fn(),
}))

const mockGetUser = vi.mocked(getUser)
const mockGetGroupStageWithDetails = vi.mocked(getGroupStageWithDetails)
const mockCanDeleteGroupStage = vi.mocked(canDeleteGroupStage)
const mockDeleteGroupStage = vi.mocked(deleteGroupStage)
const mockGetTournamentById = vi.mocked(getTournamentById)
const mockUseActionData = vi.mocked(ReactRouter.useActionData)
const mockUseLoaderData = vi.mocked(ReactRouter.useLoaderData)

const buildRequest = (tournamentId: string) => {
  const formData = new FormData()
  formData.append('intent', 'delete')

  return new Request(
    adminPath(`/competition/groups/group-stage-1?tournament=${tournamentId}`),
    {
      method: 'POST',
      body: formData,
    },
  )
}

const baseGroupStage = {
  id: 'group-stage-1',
  name: 'Group Stage',
  tournamentId: 'tournament-1',
  createdBy: 'group-creator',
  categories: [],
  configGroups: 2,
  configSlots: 4,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
  groups: [],
  confirmedSlots: [],
}

const baseDeleteCheck = {
  canDelete: true,
  impact: { groups: 0, assignedTeams: 0, matchesToDelete: 0 },
}

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  email: 'user@example.com',
  firebaseUid: 'firebase-1',
  displayName: null,
  role: 'ADMIN',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
  ...overrides,
})

const buildTournament = (overrides: Partial<Tournament> = {}): Tournament => ({
  id: 'tournament-1',
  name: 'Tournament',
  location: 'Test Location',
  categories: JSON.stringify(['U12']),
  divisions: JSON.stringify(['DIVISION']),
  startDate: new Date('2024-01-01T00:00:00Z'),
  endDate: new Date('2024-01-02T00:00:00Z'),
  createdBy: 'tournament-creator',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
  ...overrides,
})

const buildArgs = (tournamentId: string): Parameters<typeof action>[0] =>
  ({
    request: buildRequest(tournamentId),
    params: { groupStageId: 'group-stage-1' },
    context: {},
    unstable_pattern: '/admin/competition/groups/:groupStageId',
  }) as Parameters<typeof action>[0]

describe('competition.groups.$groupStageId delete action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseActionData.mockReset()
    mockUseLoaderData.mockReset()
  })

  it('allows ADMIN to delete any group stage', async () => {
    mockGetUser.mockResolvedValue(buildUser({ id: 'admin-user', role: 'ADMIN' }))
    mockGetGroupStageWithDetails.mockResolvedValue(baseGroupStage)
    mockCanDeleteGroupStage.mockResolvedValue(baseDeleteCheck)
    mockDeleteGroupStage.mockResolvedValue({ groupsDeleted: 2, slotsDeleted: 8 })

    const response = await action(buildArgs('tournament-1'))

    expect(mockCanDeleteGroupStage).toHaveBeenCalledWith('group-stage-1')
    expect(mockDeleteGroupStage).toHaveBeenCalledWith('group-stage-1')
    expect(response).toBeInstanceOf(Response)
  })

  it('allows MANAGER to delete when they created the tournament', async () => {
    mockGetUser.mockResolvedValue(buildUser({ id: 'manager-user', role: 'MANAGER' }))
    mockGetGroupStageWithDetails.mockResolvedValue(baseGroupStage)
    mockGetTournamentById.mockResolvedValue(
      buildTournament({ id: 'tournament-1', createdBy: 'manager-user' }),
    )
    mockCanDeleteGroupStage.mockResolvedValue(baseDeleteCheck)

    const response = await action(buildArgs('tournament-1'))

    expect(response).toBeInstanceOf(Response)
  })

  it('allows MANAGER to delete when they created the group stage', async () => {
    mockGetUser.mockResolvedValue(buildUser({ id: 'manager-user', role: 'MANAGER' }))
    mockGetGroupStageWithDetails.mockResolvedValue({
      ...baseGroupStage,
      createdBy: 'manager-user',
    })
    mockGetTournamentById.mockResolvedValue(
      buildTournament({ id: 'tournament-1', createdBy: 'someone-else' }),
    )
    mockCanDeleteGroupStage.mockResolvedValue(baseDeleteCheck)

    const response = await action(buildArgs('tournament-1'))

    expect(response).toBeInstanceOf(Response)
  })

  it('rejects MANAGER without ownership', async () => {
    mockGetUser.mockResolvedValue(buildUser({ id: 'manager-user', role: 'MANAGER' }))
    mockGetGroupStageWithDetails.mockResolvedValue(baseGroupStage)
    mockGetTournamentById.mockResolvedValue(
      buildTournament({ id: 'tournament-1', createdBy: 'someone-else' }),
    )

    await expect(action(buildArgs('tournament-1'))).rejects.toMatchObject({
      status: 403,
    })
  })

  it('blocks deletion when played matches exist', async () => {
    mockGetUser.mockResolvedValue(buildUser({ id: 'admin-user', role: 'ADMIN' }))
    mockGetGroupStageWithDetails.mockResolvedValue(baseGroupStage)
    mockCanDeleteGroupStage.mockResolvedValue({
      canDelete: false,
      reason: 'This group stage has matches with recorded results',
      impact: { groups: 2, assignedTeams: 3, matchesToDelete: 1 },
    })

    const result = await action(buildArgs('tournament-1'))

    expect(result).toEqual({
      error: 'This group stage has matches with recorded results',
    })
    expect(mockDeleteGroupStage).not.toHaveBeenCalled()
  })

  it('redirects to groups list with success param after deletion', async () => {
    mockGetUser.mockResolvedValue(buildUser({ id: 'admin-user', role: 'ADMIN' }))
    mockGetGroupStageWithDetails.mockResolvedValue(baseGroupStage)
    mockCanDeleteGroupStage.mockResolvedValue(baseDeleteCheck)
    mockDeleteGroupStage.mockResolvedValue({ groupsDeleted: 2, slotsDeleted: 8 })

    const response = await action(buildArgs('tournament-1'))

    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.headers.get('Location')).toBe(
        adminPath('/competition/groups?tournament=tournament-1&success=deleted'),
      )
    }
  })
})

describe('competition.groups.$groupStageId delete blocked toast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLoaderData.mockReturnValue({
      groupStage: baseGroupStage,
      availableTeams: [],
      tournamentId: 'tournament-1',
      tournamentCreatedBy: 'tournament-creator',
      deleteImpact: baseDeleteCheck.impact,
    })
  })

  it('shows error toast when deletion is blocked', async () => {
    mockUseActionData.mockReturnValue({
      error: 'This group stage has matches with recorded results',
    })

    render(
      <ReactRouter.MemoryRouter>
        <GroupStageDetails />
      </ReactRouter.MemoryRouter>,
    )

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        'Cannot delete: This group stage has matches with recorded results',
      )
    })
  })
})
