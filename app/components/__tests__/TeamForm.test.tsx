import { createMemoryRouter, RouterProvider } from 'react-router'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import type {
  FormMode,
  FormVariant,
  TeamFormData,
  TournamentData,
} from '~/lib/lib.types'

import { TeamForm } from '../TeamForm'

// Mock i18n - return key as value for testing
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
      options: { fallbackLng: 'en' },
    },
  }),
}))

// Mock tournament data with correct TournamentData structure
const mockTournaments: TournamentData[] = [
  {
    id: 'tournament-1',
    name: 'Test Tournament 1',
    location: 'Test Location 1',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'],
  },
  {
    id: 'tournament-2',
    name: 'Test Tournament 2',
    location: 'Test Location 2',
    startDate: '2024-02-15',
    endDate: null,
    divisions: ['PREMIER_DIVISION', 'THIRD_DIVISION'],
  },
]

// Helper to render TeamForm with required props and proper router context
const renderTeamForm = (
  mode: FormMode = 'create',
  variant: FormVariant = 'public',
  formData?: Partial<TeamFormData>,
  errors?: Record<string, string>,
  isSuccess?: boolean,
  successMessage?: string,
  tournaments?: TournamentData[]
) => {
  // Create a memory router for testing
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <TeamForm
            mode={mode}
            variant={variant}
            formData={formData}
            tournaments={tournaments || mockTournaments}
            errors={errors}
            isSuccess={isSuccess}
            successMessage={successMessage}
            submitButtonText='Submit'
          />
        ),
      },
    ],
    {
      initialEntries: ['/'],
      initialIndex: 0,
    }
  )

  return render(<RouterProvider router={router} />)
}

describe('TeamForm Component - onBlur Validation', () => {
  describe('Touch-based Error Display', () => {
    it('should not show error messages initially', () => {
      renderTeamForm('create', 'public')

      // Error messages should not be visible initially
      expect(
        screen.queryByText('teams.form.errors.clubNameRequired')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('teams.form.errors.emailInvalid')
      ).not.toBeInTheDocument()
    })

    it('should not show error messages on focus', async () => {
      renderTeamForm('create', 'public')

      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)

      // Focus the field
      fireEvent.focus(clubNameInput)

      // Error should not appear just from focusing
      expect(
        screen.queryByText('teams.form.errors.clubNameRequired')
      ).not.toBeInTheDocument()
    })

    it('should show error message when required field is blurred empty', async () => {
      renderTeamForm('create', 'public')

      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)

      // Focus and then blur the field without entering any value
      fireEvent.focus(clubNameInput)
      fireEvent.blur(clubNameInput)

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.clubNameRequired')
        ).toBeInTheDocument()
      })
    })

    it('should show error message when email field is blurred with invalid email', async () => {
      renderTeamForm('create', 'public')

      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)

      // Focus, enter invalid email, then blur
      fireEvent.focus(emailInput)
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('teams.form.errors.emailInvalid')).toBeInTheDocument()
      })
    })

    it('should not show error when valid data is entered and field is blurred', async () => {
      renderTeamForm('create', 'public')

      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)

      // Focus, enter valid data, then blur
      fireEvent.focus(clubNameInput)
      fireEvent.change(clubNameInput, { target: { value: 'sv DIO' } })
      fireEvent.blur(clubNameInput)

      // Wait a bit to ensure no error appears
      await waitFor(
        () => {
          expect(
            screen.queryByText('teams.form.errors.clubNameRequired')
          ).not.toBeInTheDocument()
        },
        { timeout: 1000 }
      )
    })

    it('should show error when phone field is blurred with invalid phone number', async () => {
      renderTeamForm('create', 'public')

      const phoneInput = screen.getByLabelText(/teams\.form\.teamLeaderPhone/)

      // Focus, enter invalid phone (letters not allowed), then blur
      fireEvent.focus(phoneInput)
      fireEvent.change(phoneInput, { target: { value: 'abc123' } })
      fireEvent.blur(phoneInput)

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.phoneNumberInvalid')
        ).toBeInTheDocument()
      })
    })

    it('should show error when team name exceeds length limit and field is blurred', async () => {
      renderTeamForm('create', 'public')

      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      const longTeamName = 'a'.repeat(51) // Exceeds 50 character limit

      // Focus, enter long team name, then blur
      fireEvent.focus(teamNameInput)
      fireEvent.change(teamNameInput, { target: { value: longTeamName } })
      fireEvent.blur(teamNameInput)

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.teamNameTooLong')
        ).toBeInTheDocument()
      })
    })

    it('should clear error when field is corrected and blurred again', async () => {
      renderTeamForm('create', 'public')

      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)

      // First, trigger an error
      fireEvent.focus(clubNameInput)
      fireEvent.blur(clubNameInput)

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.clubNameRequired')
        ).toBeInTheDocument()
      })

      // Now fix the error
      fireEvent.focus(clubNameInput)
      fireEvent.change(clubNameInput, { target: { value: 'sv DIO' } })
      fireEvent.blur(clubNameInput)

      // Wait for error to disappear
      await waitFor(() => {
        expect(
          screen.queryByText('teams.form.errors.clubNameRequired')
        ).not.toBeInTheDocument()
      })
    })

    it('should show multiple field errors when multiple fields are blurred with invalid data', async () => {
      renderTeamForm('create', 'public')

      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)

      // Blur both fields without entering data
      fireEvent.focus(clubNameInput)
      fireEvent.blur(clubNameInput)

      fireEvent.focus(emailInput)
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)

      // Wait for both errors to appear
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.clubNameRequired')
        ).toBeInTheDocument()
        expect(screen.getByText('teams.form.errors.emailInvalid')).toBeInTheDocument()
      })
    })
  })

  describe('Server-side Errors', () => {
    it('should display server-side errors immediately without requiring touch', () => {
      const serverErrors = {
        clubName: 'Club name already exists',
        teamName: 'Team name is not unique',
      }

      renderTeamForm('create', 'public', undefined, serverErrors)

      // Server errors should be visible immediately
      expect(screen.getByText('Club name already exists')).toBeInTheDocument()
      expect(screen.getByText('Team name is not unique')).toBeInTheDocument()
    })

    it('should show both server-side and client-side errors', async () => {
      const serverErrors = {
        clubName: 'Server error for club name',
      }

      renderTeamForm('create', 'public', undefined, serverErrors)

      // Server error should be visible immediately
      expect(screen.getByText('Server error for club name')).toBeInTheDocument()

      // Trigger a client-side error on a different field
      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)
      fireEvent.focus(emailInput)
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)

      // Wait for client-side error to appear alongside server error
      await waitFor(() => {
        expect(screen.getByText('Server error for club name')).toBeInTheDocument()
        expect(screen.getByText('teams.form.errors.emailInvalid')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission Errors', () => {
    it('should show all validation errors when form is submitted without touching fields', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // Get the submit button and click it using userEvent for realistic interaction
      const submitButton = screen.getByRole('button', { name: /submit/i })

      // Submit form without filling any fields
      await user.click(submitButton)

      // All required field errors should appear (for public create form)
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.tournamentRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.clubNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.teamNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.divisionRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.categoryRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.teamLeaderNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.phoneNumberRequired')
        ).toBeInTheDocument()
        expect(screen.getByText('teams.form.errors.emailRequired')).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.privacyAgreementRequired')
        ).toBeInTheDocument()
      })
    })

    it('should show validation errors for admin form submission without touching fields', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'admin')

      // Get the submit button and click it
      const submitButton = screen.getByRole('button', { name: /submit/i })

      // Submit form without filling any fields
      await user.click(submitButton)

      // All required field errors should appear (admin form has same fields)
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.tournamentRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.clubNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.teamNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.divisionRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.categoryRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.teamLeaderNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.phoneNumberRequired')
        ).toBeInTheDocument()
        expect(screen.getByText('teams.form.errors.emailRequired')).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.privacyAgreementRequired')
        ).toBeInTheDocument()
      })
    })

    it('should not show privacy agreement error for edit form submission', async () => {
      const user = userEvent.setup()
      renderTeamForm('edit', 'public')

      // Get the submit button and click it
      const submitButton = screen.getByRole('button', { name: /submit/i })

      // Submit form without filling any fields
      await user.click(submitButton)

      // All required field errors except privacy agreement should appear
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.tournamentRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.clubNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.teamNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.divisionRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.teamLeaderNameRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.phoneNumberRequired')
        ).toBeInTheDocument()
        expect(screen.getByText('teams.form.errors.emailRequired')).toBeInTheDocument()
      })

      // Privacy agreement error should NOT appear in edit mode
      expect(
        screen.queryByText('teams.form.errors.privacyAgreementRequired')
      ).not.toBeInTheDocument()
    })
  })

  describe('Admin Form Variant', () => {
    it('should not show privacy agreement checkbox in edit mode', async () => {
      renderTeamForm('edit', 'admin')

      // Privacy agreement checkbox should not be present in edit mode
      expect(
        screen.queryByRole('checkbox', { name: /teams\.form\.privacyAgreement/ })
      ).not.toBeInTheDocument()
    })
  })

  describe('Privacy Agreement Field', () => {
    it('should show privacy agreement checkbox in create mode', () => {
      renderTeamForm('create', 'public')

      const privacyCheckbox = screen.getByRole('checkbox', {
        name: /teams\.form\.privacyAgreement/,
      })
      expect(privacyCheckbox).toBeInTheDocument()
    })

    it('should hide privacy agreement checkbox in edit mode', () => {
      renderTeamForm('edit', 'public')

      const privacyCheckbox = screen.queryByRole('checkbox', {
        name: /teams\.form\.privacyAgreement/,
      })
      expect(privacyCheckbox).not.toBeInTheDocument()
    })

    it('should show error when privacy agreement is not checked in create mode', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // Fill all required fields except privacy agreement
      const tournamentSelect = screen.getByLabelText(/teams\.form\.tournament/)
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      const divisionSelect = screen.getByLabelText(/teams\.form\.division/)
      const teamLeaderNameInput = screen.getByLabelText(/teams\.form\.teamLeaderName/)
      const phoneInput = screen.getByLabelText(/teams\.form\.teamLeaderPhone/)
      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)

      await user.selectOptions(tournamentSelect, 'tournament-1')
      await user.type(clubNameInput, 'Test Club')
      await user.type(teamNameInput, 'Test Team')
      await user.selectOptions(divisionSelect, 'FIRST_DIVISION')
      await user.type(teamLeaderNameInput, 'John Doe')
      await user.type(phoneInput, '0612345678')
      await user.type(emailInput, 'john@example.com')

      // Submit without checking privacy agreement
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      // Privacy agreement error should appear
      await waitFor(() => {
        expect(
          screen.getByText('teams.form.errors.privacyAgreementRequired')
        ).toBeInTheDocument()
        expect(
          screen.getByText('teams.form.errors.categoryRequired')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Division Selection', () => {
    it('should update divisions when tournament changes', async () => {
      renderTeamForm('create', 'public')

      const tournamentSelect = screen.getByLabelText(/teams\.form\.tournament/)

      // Initially no divisions should be available
      expect(screen.queryByDisplayValue('FIRST_DIVISION')).not.toBeInTheDocument()

      // Select tournament 1
      fireEvent.change(tournamentSelect, { target: { value: 'tournament-1' } })

      // Wait for divisions to update
      await waitFor(() => {
        const divisionSelect = screen.getByLabelText(/teams\.form\.division/)
        expect(divisionSelect).toBeInTheDocument()
      })

      // Check that correct divisions are available
      const divisionSelect = screen.getByLabelText(/teams\.form\.division/)
      const options = Array.from(divisionSelect.querySelectorAll('option')).map(
        option => option.value
      )

      expect(options).toContain('FIRST_DIVISION')
      expect(options).toContain('SECOND_DIVISION')
      expect(options).not.toContain('PREMIER_DIVISION')
      expect(options).not.toContain('THIRD_DIVISION')
    })
  })

  describe('Form Submission Success', () => {
    it('should handle successful form submission', () => {
      renderTeamForm(
        'create',
        'public',
        undefined,
        undefined,
        true,
        'Team registered successfully!'
      )

      expect(screen.getByText('Team registered successfully!')).toBeInTheDocument()
    })
  })

  describe('Form Pre-population', () => {
    it('should pre-populate form fields with provided data', () => {
      const formData: Partial<TeamFormData> = {
        tournamentId: 'tournament-1',
        clubName: 'Pre-filled Club',
        teamName: 'JO8-1',
        division: 'FIRST_DIVISION',
        teamLeaderName: 'Jane Doe',
        teamLeaderPhone: '0698765432',
        teamLeaderEmail: 'jane@example.com',
      }

      renderTeamForm('edit', 'public', formData)

      expect(screen.getByDisplayValue('Pre-filled Club')).toBeInTheDocument()
      expect(screen.getByDisplayValue('JO8-1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('0698765432')).toBeInTheDocument()
      expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument()
    })
  })
})

describe('TeamForm Category Field', () => {
  const categoryTournaments: TournamentData[] = [
    {
      id: 'tournament-1',
      name: 'Tournament 1',
      location: 'Loc 1',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      divisions: ['FIRST_DIVISION'],
      categories: ['JO8', 'JO9', 'JO10'],
    },
  ]

  it('renders category ComboField with correct options from tournament', () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    const categorySelect = screen.getByLabelText(/teams\.form\.category/)
    categoryTournaments[0].categories!.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument()
    })
    expect(categorySelect).toBeInTheDocument()
  })

  it('sets initial value from formData', () => {
    renderTeamForm(
      'edit',
      'admin',
      { tournamentId: 'tournament-1', category: 'JO9' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    const categorySelect = screen.getByLabelText(/teams\.form\.category/)
    expect((categorySelect as HTMLSelectElement).value).toBe('JO9')
  })

  it('updates value on change', async () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    const categorySelect = screen.getByLabelText(/teams\.form\.category/)
    await userEvent.selectOptions(categorySelect, 'JO10')
    expect((categorySelect as HTMLSelectElement).value).toBe('JO10')
  })

  it('shows required error if blurred empty', async () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1', category: '' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    const categorySelect = screen.getByLabelText(/teams\.form\.category/)
    fireEvent.focus(categorySelect)
    fireEvent.blur(categorySelect)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('teams.form.errors.categoryRequired')).toBeInTheDocument()
    })
  })

  it('shows correct placeholder', () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    expect(screen.getByText('teams.form.selectCategory')).toBeInTheDocument()
  })
})
