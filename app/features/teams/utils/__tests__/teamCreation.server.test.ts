import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('~/utils/email.server', () => ({
  sendConfirmationEmail: vi.fn(),
}))

vi.mock('~/models/tournament.server', () => ({
  getTournamentById: vi.fn(),
}))

vi.mock('~/models/team.server', () => ({
  createTeam: vi.fn(),
}))

vi.mock('~/features/teams/validation', () => ({
  extractTeamDataFromFormData: vi.fn(),
  validateEntireTeamForm: vi.fn(),
}))

vi.mock('~/lib/lib.helpers', () => ({
  stringToDivision: vi.fn(),
  stringToCategory: vi.fn(),
}))

vi.mock('~/db.server', () => ({
  prisma: {
    teamLeader: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    tournament: {
      findUnique: vi.fn(),
    },
  },
}))

const { createTeamFromFormData } = await import('../teamCreation.server')
const { sendConfirmationEmail } = await import('~/utils/email.server')
const { getTournamentById } = await import('~/models/tournament.server')
const { createTeam } = await import('~/models/team.server')
const { extractTeamDataFromFormData, validateEntireTeamForm } = await import(
  '~/features/teams/validation'
)
const { stringToDivision, stringToCategory } = await import('~/lib/lib.helpers')
const { prisma } = await import('~/db.server')

describe('teamCreation.server - createTeamFromFormData', () => {
  const mockFormData = new FormData()
  mockFormData.append('name', 'Ajax Amsterdam')
  mockFormData.append('clubName', 'Ajax')
  mockFormData.append('division', 'FIRST_DIVISION')
  mockFormData.append('category', 'JO12')
  mockFormData.append('teamLeaderName', 'John Doe')
  mockFormData.append('teamLeaderEmail', 'john@example.com')
  mockFormData.append('teamLeaderPhone', '+31612345678')
  mockFormData.append('tournamentId', 'tournament-123')
  mockFormData.append('privacyAgreement', 'true')

  const mockTeamData = {
    name: 'Ajax Amsterdam',
    clubName: 'Ajax',
    division: 'FIRST_DIVISION',
    category: 'JO12',
    teamLeaderName: 'John Doe',
    teamLeaderEmail: 'john@example.com',
    teamLeaderPhone: '+31612345678',
    tournamentId: 'tournament-123',
    privacyAgreement: true,
  }

  const mockTeamLeader = {
    id: 'leader-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+31612345678',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCreatedTeam = {
    id: 'team-123',
    name: 'Ajax Amsterdam',
    division: 'FIRST_DIVISION' as const,
    category: 'JO12' as const,
    clubName: 'Ajax',
    teamLeaderId: 'leader-123',
    tournamentId: 'tournament-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTournament = {
    id: 'tournament-123',
    name: 'Spring Cup',
    location: 'Amsterdam',
    startDate: new Date(),
    endDate: new Date(),
    categories: '["JO12"]',
    divisions: '["FIRST_DIVISION"]',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(extractTeamDataFromFormData).mockReturnValue(mockTeamData)
    vi.mocked(validateEntireTeamForm).mockReturnValue({})
    vi.mocked(stringToDivision).mockReturnValue('FIRST_DIVISION' as const)
    vi.mocked(stringToCategory).mockReturnValue('JO12' as const)
    vi.mocked(prisma.teamLeader.findUnique).mockResolvedValue(mockTeamLeader)
    vi.mocked(prisma.tournament.findUnique).mockResolvedValue(mockTournament)
    vi.mocked(createTeam).mockResolvedValue(mockCreatedTeam)
    vi.mocked(getTournamentById).mockResolvedValue(mockTournament)
    vi.mocked(sendConfirmationEmail).mockResolvedValue()
  })

  it('should successfully create team and send confirmation email', async () => {
    const result = await createTeamFromFormData(mockFormData)

    expect(result).toEqual({
      success: true,
      team: {
        id: 'team-123',
        name: 'Ajax Amsterdam',
        division: 'FIRST_DIVISION',
      },
    })

    expect(createTeam).toHaveBeenCalledWith({
      name: 'Ajax Amsterdam',
      clubName: 'Ajax',
      division: 'FIRST_DIVISION',
      category: 'JO12',
      teamLeaderId: 'leader-123',
      tournamentId: 'tournament-123',
    })

    expect(sendConfirmationEmail).toHaveBeenCalledWith(mockCreatedTeam, mockTournament)
  })

  it('should return validation errors when form validation fails', async () => {
    const validationErrors = { name: 'Name is required' }
    vi.mocked(validateEntireTeamForm).mockReturnValue(validationErrors)

    const result = await createTeamFromFormData(mockFormData)

    expect(result).toEqual({
      success: false,
      errors: validationErrors,
    })

    expect(createTeam).not.toHaveBeenCalled()
    expect(sendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('should return error when division is invalid', async () => {
    vi.mocked(stringToDivision).mockReturnValue(undefined)

    const result = await createTeamFromFormData(mockFormData)

    expect(result).toEqual({
      success: false,
      errors: { division: 'Invalid division' },
    })

    expect(createTeam).not.toHaveBeenCalled()
  })

  it('should return error when category is invalid', async () => {
    vi.mocked(stringToCategory).mockReturnValue(undefined)

    const result = await createTeamFromFormData(mockFormData)

    expect(result).toEqual({
      success: false,
      errors: { category: 'Invalid category' },
    })

    expect(createTeam).not.toHaveBeenCalled()
  })

  it('should return error when tournament not found', async () => {
    vi.mocked(prisma.tournament.findUnique).mockResolvedValue(null)

    const result = await createTeamFromFormData(mockFormData)

    expect(result).toEqual({
      success: false,
      errors: { tournamentId: 'Tournament not found' },
    })

    expect(createTeam).not.toHaveBeenCalled()
  })

  it('should create new team leader when not found', async () => {
    vi.mocked(prisma.teamLeader.findUnique).mockResolvedValue(null)
    const newTeamLeader = {
      ...mockTeamLeader,
      id: 'new-leader-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(prisma.teamLeader.create).mockResolvedValue(newTeamLeader)

    const result = await createTeamFromFormData(mockFormData)

    expect(prisma.teamLeader.create).toHaveBeenCalledWith({
      // eslint-disable-next-line id-blacklist
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+31612345678',
      },
    })

    expect(result.success).toBe(true)
  })

  it('should continue team creation even if email sending fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)
    vi.mocked(sendConfirmationEmail).mockRejectedValue(new Error('Email service down'))

    const result = await createTeamFromFormData(mockFormData)

    expect(result).toEqual({
      success: true,
      team: {
        id: 'team-123',
        name: 'Ajax Amsterdam',
        division: 'FIRST_DIVISION',
      },
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send confirmation email:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it('should not send email when tournament not found for email', async () => {
    vi.mocked(getTournamentById).mockResolvedValue(null)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)

    const result = await createTeamFromFormData(mockFormData)

    expect(sendConfirmationEmail).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Tournament not found for email sending, tournament ID:',
      'tournament-123'
    )

    expect(result.success).toBe(true)
    consoleErrorSpy.mockRestore()
  })

  it('should handle team leader name with multiple spaces', async () => {
    const teamDataWithLongName = {
      ...mockTeamData,
      teamLeaderName: 'John van der Berg',
    }
    vi.mocked(extractTeamDataFromFormData).mockReturnValue(teamDataWithLongName)
    vi.mocked(prisma.teamLeader.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.teamLeader.create).mockResolvedValue({
      ...mockTeamLeader,
      firstName: 'John',
      lastName: 'van der Berg',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await createTeamFromFormData(mockFormData)

    expect(prisma.teamLeader.create).toHaveBeenCalledWith({
      // eslint-disable-next-line id-blacklist
      data: {
        firstName: 'John',
        lastName: 'van der Berg',
        email: 'john@example.com',
        phone: '+31612345678',
      },
    })
  })
})
