import { createMemoryRouter, RouterProvider } from 'react-router'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TEST_TRANSLATIONS } from 'test/helpers/constants'

import type {
  FormMode,
  FormVariant,
  TeamFormData,
  TournamentData,
} from '~/lib/lib.types'
import { useTeamFormStore } from '~/stores/useTeamFormStore'

import { TeamForm } from '../TeamForm'

const state = useTeamFormStore.getState

// Mock hasPointerCapture for Radix UI components
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  writable: true,
})

// Mock i18n - translate error keys to actual messages for testing
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // For error translation keys, return the actual message from TEST_TRANSLATIONS
      if (key.startsWith('teams.form.errors.')) {
        return TEST_TRANSLATIONS[key as keyof typeof TEST_TRANSLATIONS] || key
      }
      // For all other keys, return the key as-is
      return key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
      options: { fallbackLng: 'en' },
    },
  }),
}))

// No more Zod mocks - we'll test with actual English error messages from translations

// Mock tournament data with correct TournamentData structure
const mockTournaments: TournamentData[] = [
  {
    id: 'tournament-1',
    name: 'Test Tournament 1',
    location: 'Test Location 1',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'],
    categories: ['JO8', 'JO9', 'JO10'],
  },
  {
    id: 'tournament-2',
    name: 'Test Tournament 2',
    location: 'Test Location 2',
    startDate: '2024-02-15',
    endDate: null,
    divisions: ['PREMIER_DIVISION', 'THIRD_DIVISION'],
    categories: ['JO10', 'JO11', 'JO12'],
  },
]

// Helper function to complete panel 1 (tournament selection)
const completePanel1 = async (user: ReturnType<typeof userEvent.setup>) => {
  // Select tournament
  const tournamentSelect = screen.getByRole('combobox', {
    name: /teams\.form\.tournament.*select option/,
  })
  await user.click(tournamentSelect)

  // Wait for dropdown and select visible option
  await waitFor(() => {
    const dropdownOptions = screen.getAllByText('Test Tournament 1 - Test Location 1')
    const visibleOption = dropdownOptions.find(
      option => !option.closest('select[aria-hidden="true"]')
    )
    expect(visibleOption).toBeInTheDocument()
  })

  const tournamentDropdownOptions = screen.getAllByText(
    'Test Tournament 1 - Test Location 1'
  )
  const tournamentOption = tournamentDropdownOptions.find(
    option => !option.closest('select[aria-hidden="true"]')
  )!
  await user.click(tournamentOption)

  // Wait for divisions to load and select division
  await waitFor(() => {
    const divisionSelect = screen.getByRole('combobox', {
      name: /teams\.form\.division.*select option/,
    })
    expect(divisionSelect).toBeEnabled()
  })
  const divisionSelect = screen.getByRole('combobox', {
    name: /teams\.form\.division.*select option/,
  })
  await user.click(divisionSelect)

  // Wait for dropdown and select visible option
  await waitFor(() => {
    const divisionDropdownOptions = screen.getAllByText('First Division')
    const visibleOption = divisionDropdownOptions.find(
      option => !option.closest('select[aria-hidden="true"]')
    )
    expect(visibleOption).toBeInTheDocument()
  })

  const divisionDropdownOptions = screen.getAllByText('First Division')
  const divisionOption = divisionDropdownOptions.find(
    option => !option.closest('select[aria-hidden="true"]')
  )!
  await user.click(divisionOption)

  // Wait for categories to load and select category
  await waitFor(() => {
    const categorySelect = screen.getByRole('combobox', {
      name: /teams\.form\.category.*select option/,
    })
    expect(categorySelect).toBeEnabled()
  })
  const categorySelect = screen.getByRole('combobox', {
    name: /teams\.form\.category.*select option/,
  })
  await user.click(categorySelect)

  // Wait for dropdown and select visible option
  await waitFor(() => {
    const categoryDropdownOptions = screen.getAllByText('JO8')
    const visibleOption = categoryDropdownOptions.find(
      option => !option.closest('select[aria-hidden="true"]')
    )
    expect(visibleOption).toBeInTheDocument()
  })

  const categoryDropdownOptions = screen.getAllByText('JO8')
  const categoryOption = categoryDropdownOptions.find(
    option => !option.closest('select[aria-hidden="true"]')
  )!
  await user.click(categoryOption)
}

// Helper function to complete panels 1 and 2
const _completePanels1And2 = async (user: ReturnType<typeof userEvent.setup>) => {
  await completePanel1(user)

  // Fill panel 2 required fields
  const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
  const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)

  await user.type(clubNameInput, 'Test Club')
  await user.type(teamNameInput, 'Test Team')
}

// Helper to render TeamForm with required props and proper router context
const renderTeamForm = (
  mode: FormMode = 'create',
  variant: FormVariant = 'public',
  formData?: Partial<TeamFormData>,
  errors?: Record<string, string>,
  isSuccess?: boolean,
  successMessage?: string,
  tournaments?: TournamentData[],
  submitButtonText?: string,
  onCancel?: () => void
) => {
  // Set up tournaments in the store if provided
  const tournamentsToUse = tournaments || mockTournaments

  // Set tournaments in the store's availableOptions structure
  useTeamFormStore.setState({
    availableOptions: {
      tournaments: tournamentsToUse,
      divisions: [],
      categories: [],
    },
  })

  // Set form data in the store if provided (after tournaments are set)
  if (formData) {
    state().setFormData({
      tournamentId: formData.tournamentId || '',
      clubName: formData.clubName || '',
      teamName: formData.teamName || '',
      division: formData.division || '',
      category: formData.category || '',
      teamLeaderName: formData.teamLeaderName || '',
      teamLeaderPhone: formData.teamLeaderPhone || '',
      teamLeaderEmail: formData.teamLeaderEmail || '',
      privacyAgreement: formData.privacyAgreement || false,
    })

    // If a tournament is selected, update available options to populate divisions/categories
    if (formData.tournamentId) {
      state().updateAvailableOptions()
    }
  }

  // Set server errors in the store if provided
  if (errors) {
    state().setServerErrors(errors)
  }

  // Create a memory router for testing
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <TeamForm
            mode={mode}
            variant={variant}
            submitButtonText={submitButtonText}
            isSuccess={isSuccess}
            successMessage={successMessage}
            onCancel={onCancel}
          />
        ),
        action: () => ({ ok: true }),
      },
    ],
    {
      initialEntries: ['/'],
      initialIndex: 0,
    }
  )

  return render(<RouterProvider router={router} />)
}

// Reset store before each test to prevent cross-test contamination
beforeEach(() => {
  state().resetForm()
})

describe('TeamForm Component - onBlur Validation', () => {
  describe('Touch-based Error Display', () => {
    it('should not show error messages initially', () => {
      renderTeamForm('create', 'public')

      // Should not show any error messages initially
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.teamNameRequired'])
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          TEST_TRANSLATIONS['teams.form.errors.teamLeaderNameRequired']
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.phoneNumberRequired'])
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.emailRequired'])
      ).not.toBeInTheDocument()
    })

    it('should not show error messages on focus', async () => {
      renderTeamForm('create', 'public')

      // Focus on a field
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      await userEvent.click(clubNameInput)

      // Should not show error messages while focused
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
    })

    it('should show error message when required field is blurred empty', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 to enable panel 2
      await completePanel1(user)

      // STEP 2: Test panel 2 field validation
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)

      // Focus and then blur the input (without typing anything)
      await user.click(clubNameInput)
      await user.tab() // This will blur the current field

      // Should show error message after blur
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).toBeInTheDocument()
      })
    })

    it('should not show error message when valid content is entered', async () => {
      renderTeamForm('create', 'public')

      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)

      // Enter valid content and blur
      await userEvent.type(clubNameInput, 'Valid Club Name')
      await userEvent.tab()

      // Should not show error message
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
    })

    it('should show error message when email field is blurred with invalid email', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 to enable panel 2
      await completePanel1(user)

      // STEP 2: Fill panel 2 required fields to enable panel 3
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      await user.type(clubNameInput, 'Test Club')
      await user.type(teamNameInput, 'Test Team')

      // STEP 3: Test panel 3 email validation
      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)

      // Focus, enter invalid email, then blur
      await user.click(emailInput)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.emailInvalid'])
        ).toBeInTheDocument()
      })
    })

    it('should show error message when club name exceeds length', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 to enable panel 2
      await completePanel1(user)

      // STEP 2: Test panel 2 club name length validation
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const longClubName = 'a'.repeat(101) // Exceeds 100 character limit

      // Focus, enter long club name, then blur
      await user.click(clubNameInput)
      await user.type(clubNameInput, longClubName)
      await user.tab()

      // Wait for length validation error to appear
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameTooLong'])
        ).toBeInTheDocument()
      })
    })

    it('should clear error when valid input is provided after blur error', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 to enable panel 2
      await completePanel1(user)

      // STEP 2: Test panel 2 validation clearing
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)

      // First trigger an error by blurring empty field
      await user.click(clubNameInput)
      await user.tab()

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).toBeInTheDocument()
      })

      // Now type valid content
      await user.type(clubNameInput, 'Valid Club Name')
      await user.tab()

      // Error should be cleared
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
    })

    it('should show error when phone field is blurred with invalid phone number', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 to enable panel 2
      await completePanel1(user)

      // STEP 2: Fill panel 2 required fields to enable panel 3
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      await user.type(clubNameInput, 'Test Club')
      await user.type(teamNameInput, 'Test Team')

      // STEP 3: Test panel 3 phone validation
      const phoneInput = screen.getByLabelText(/teams\.form\.teamLeaderPhone/)

      // Focus, enter invalid phone (letters not allowed), then blur
      await user.click(phoneInput)
      await user.type(phoneInput, 'abc123')
      await user.tab()

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.phoneNumberInvalid'])
        ).toBeInTheDocument()
      })
    })

    it('should show error when team name exceeds length limit and field is blurred', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 to enable panel 2
      await completePanel1(user)

      // STEP 2: Test panel 2 team name validation
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      const longTeamName = 'a'.repeat(51) // Exceeds 50 character limit

      // Focus, enter long team name, then blur
      await user.click(teamNameInput)
      await user.type(teamNameInput, longTeamName)
      await user.tab()

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.teamNameTooLong'])
        ).toBeInTheDocument()
      })
    })

    it('should show multiple field errors when multiple fields are blurred with invalid data', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 to enable panel 2
      await completePanel1(user)

      // STEP 2: Test multiple validation errors within the same panel (panel 2)
      // This avoids the complexity of cross-panel dependencies
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)

      // Trigger club name validation error
      await user.click(clubNameInput)
      await user.tab() // Leave empty to trigger required error

      // Wait for club name error to appear
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).toBeInTheDocument()
      })

      // Trigger team name length validation error
      const longTeamName = 'a'.repeat(51) // Exceeds 50 character limit
      await user.click(teamNameInput)
      await user.type(teamNameInput, longTeamName)
      await user.tab()

      // Wait for both errors to be visible simultaneously
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).toBeInTheDocument()
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.teamNameTooLong'])
        ).toBeInTheDocument()
      })
    })
  })

  describe('Server-side Errors', () => {
    it('should hide server-side errors for disabled fields', async () => {
      // Server errors for disabled fields should NOT be visible
      const serverErrors = {
        clubName: TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'],
        teamName: TEST_TRANSLATIONS['teams.form.errors.teamNameRequired'],
      }

      renderTeamForm('create', 'public', undefined, serverErrors)

      // These errors should NOT appear because the fields are disabled (panel 2)
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.teamNameRequired'])
      ).not.toBeInTheDocument()
    })

    it('should show server-side errors when fields become enabled and are interacted with', async () => {
      const serverErrors = {
        clubName: TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'],
        teamName: TEST_TRANSLATIONS['teams.form.errors.teamNameRequired'],
      }

      renderTeamForm('create', 'public', undefined, serverErrors)

      // Server errors should NOT be visible initially (fields are disabled)
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.teamNameRequired'])
      ).not.toBeInTheDocument()

      // Complete panel 1 to enable panel 2
      const user = userEvent.setup()
      await completePanel1(user)

      // Server errors should STILL not be visible (fields haven't been blurred yet)
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.teamNameRequired'])
      ).not.toBeInTheDocument()

      // Interact with the fields (blur them) to trigger server error display
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)

      await user.click(clubNameInput)
      await user.tab() // blur clubName
      await user.click(teamNameInput)
      await user.tab() // blur teamName

      // Now server errors should be visible for the blurred fields
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).toBeInTheDocument()
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.teamNameRequired'])
        ).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission Errors', () => {
    it('should disable save button when form is invalid and enable when all fields are valid', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // Save button should be disabled when form is empty
      const submitButton = screen.getByRole('button', {
        name: 'common.actions.save',
      })
      expect(submitButton).toBeDisabled()

      // Fill all required fields step by step and verify button state
      // Step 1: Tournament selection
      const tournamentSelect = screen.getByRole('combobox', {
        name: /teams\.form\.tournament/,
      })
      await user.click(tournamentSelect)
      const tournamentOption = screen.getByRole('option', { name: /Test Tournament 1/ })
      await user.click(tournamentOption)

      // Button should still be disabled (more fields required)
      expect(submitButton).toBeDisabled()

      // Step 2: Division selection
      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /teams\.form\.division/ })
        ).toBeInTheDocument()
      })
      const divisionSelect = screen.getByRole('combobox', {
        name: /teams\.form\.division/,
      })
      await user.click(divisionSelect)
      const divisionOption = screen.getByRole('option', { name: /First Division/ })
      await user.click(divisionOption)

      // Button should still be disabled
      expect(submitButton).toBeDisabled()

      // Step 3: Category selection
      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /teams\.form\.category/ })
        ).toBeInTheDocument()
      })
      const categorySelect = screen.getByRole('combobox', {
        name: /teams\.form\.category/,
      })
      await user.click(categorySelect)
      const categoryOption = screen.getByRole('option', { name: /JO8/ })
      await user.click(categoryOption)

      // Button should still be disabled
      expect(submitButton).toBeDisabled()

      // Step 4: Team information
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      await user.type(clubNameInput, 'Test Club')
      await user.type(teamNameInput, 'Test Team')

      // Button should still be disabled
      expect(submitButton).toBeDisabled()

      // Step 5: Team leader information
      const teamLeaderNameInput = screen.getByLabelText(/teams\.form\.teamLeaderName/)
      const phoneInput = screen.getByLabelText(/teams\.form\.teamLeaderPhone/)
      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)
      await user.type(teamLeaderNameInput, 'John Doe')
      await user.type(phoneInput, '0612345678')
      await user.type(emailInput, 'john@example.com')

      // Button should still be disabled (privacy agreement missing)
      expect(submitButton).toBeDisabled()

      // Step 6: Privacy agreement
      const privacyCheckbox = screen.getByRole('checkbox', {
        name: /teams\.form\.agreeToPrivacyPolicy/,
      })
      await user.click(privacyCheckbox)

      // NOW the button should be enabled (all fields valid)
      await waitFor(() => {
        expect(submitButton).toBeEnabled()
      })
    })

    it('should show validation errors when fields are blurred with invalid data', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 (tournament selection) to enable panel 2

      // Select tournament - use the combobox button role instead of label text
      const tournamentSelect = screen.getByRole('combobox', {
        name: /teams\.form\.tournament.*select option/,
      })
      await user.click(tournamentSelect)

      // Wait for dropdown to open and select the visible option
      await waitFor(() => {
        const dropdownOptions = screen.getAllByText(
          'Test Tournament 1 - Test Location 1'
        )
        // The visible dropdown option will be the one that's not hidden
        const visibleOption = dropdownOptions.find(
          option => !option.closest('select[aria-hidden="true"]')
        )
        expect(visibleOption).toBeInTheDocument()
      })

      const tournamentDropdownOptions = screen.getAllByText(
        'Test Tournament 1 - Test Location 1'
      )
      const tournamentOption = tournamentDropdownOptions.find(
        option => !option.closest('select[aria-hidden="true"]')
      )!
      await user.click(tournamentOption)

      // Wait for divisions to load and select division
      await waitFor(() => {
        const divisionSelect = screen.getByRole('combobox', {
          name: /teams\.form\.division.*select option/,
        })
        expect(divisionSelect).toBeEnabled()
      })
      const divisionSelect = screen.getByRole('combobox', {
        name: /teams\.form\.division.*select option/,
      })
      await user.click(divisionSelect)

      // Wait for dropdown and select visible option
      await waitFor(() => {
        const divisionDropdownOptions = screen.getAllByText('First Division')
        const visibleOption = divisionDropdownOptions.find(
          option => !option.closest('select[aria-hidden="true"]')
        )
        expect(visibleOption).toBeInTheDocument()
      })

      const divisionDropdownOptions = screen.getAllByText('First Division')
      const divisionOption = divisionDropdownOptions.find(
        option => !option.closest('select[aria-hidden="true"]')
      )!
      await user.click(divisionOption)

      // Wait for categories to load and select category
      await waitFor(() => {
        const categorySelect = screen.getByRole('combobox', {
          name: /teams\.form\.category.*select option/,
        })
        expect(categorySelect).toBeEnabled()
      })
      const categorySelect = screen.getByRole('combobox', {
        name: /teams\.form\.category.*select option/,
      })
      await user.click(categorySelect)

      // Wait for dropdown and select visible option
      await waitFor(() => {
        const categoryDropdownOptions = screen.getAllByText('JO8')
        const visibleOption = categoryDropdownOptions.find(
          option => !option.closest('select[aria-hidden="true"]')
        )
        expect(visibleOption).toBeInTheDocument()
      })

      const categoryDropdownOptions = screen.getAllByText('JO8')
      const categoryOption = categoryDropdownOptions.find(
        option => !option.closest('select[aria-hidden="true"]')
      )!
      await user.click(categoryOption)

      // STEP 2: Now test panel 2 (team info) validation

      // Wait for panel 2 to be enabled
      await waitFor(() => {
        expect(screen.getByLabelText(/teams\.form\.clubName/)).toBeEnabled()
      })

      // Test clubName validation - focus and blur without entering data
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      await user.click(clubNameInput)
      await user.tab()

      // Check that the error appears in the DOM
      await waitFor(() => {
        const errorText = screen.queryByText(
          TEST_TRANSLATIONS['teams.form.errors.clubNameRequired']
        )
        expect(errorText).toBeInTheDocument()
      })

      // STEP 3: Complete panel 2 to enable panel 3, then test email validation

      // Fill in required team info to enable panel 3
      await user.type(clubNameInput, 'Test Club')
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      await user.type(teamNameInput, 'Test Team')

      // Wait for panel 3 to be enabled
      await waitFor(() => {
        expect(screen.getByLabelText(/teams\.form\.teamLeaderEmail/)).toBeEnabled()
      })

      // Test email validation
      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)
      await user.click(emailInput)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        const emailErrorText = screen.queryByText(
          TEST_TRANSLATIONS['teams.form.errors.emailInvalid']
        )
        expect(emailErrorText).toBeInTheDocument()
      })
    })

    it('should disable save button when form is invalid for admin form', async () => {
      renderTeamForm('create', 'admin')

      // Get the submit button
      const submitButton = screen.getByRole('button', {
        name: 'common.actions.save',
      })

      // Submit button should be disabled when form is empty/invalid
      expect(submitButton).toBeDisabled()

      // Validation errors should not appear until fields are touched
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.tournamentRequired'])
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
      ).not.toBeInTheDocument()
    })

    it('should disable save button when form is invalid for edit form', async () => {
      renderTeamForm('edit', 'public')

      // Get the submit button
      const submitButton = screen.getByRole('button', {
        name: 'common.actions.save',
      })

      // Submit button should be disabled when form is empty/invalid
      expect(submitButton).toBeDisabled()

      // Privacy agreement error should NOT appear in edit mode (not even in the DOM)
      expect(
        screen.queryByText(
          TEST_TRANSLATIONS['teams.form.errors.privacyAgreementRequired']
        )
      ).not.toBeInTheDocument()

      // Other validation errors should not appear until fields are touched
      expect(
        screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.tournamentRequired'])
      ).not.toBeInTheDocument()
    })
  })

  describe('Admin Form Variant', () => {
    it('should not show privacy agreement checkbox in edit mode', async () => {
      renderTeamForm('edit', 'admin')

      // Privacy agreement checkbox should not be present in edit mode
      expect(
        screen.queryByRole('checkbox', { name: /teams\.form\.agreeToPrivacyPolicy/ })
      ).not.toBeInTheDocument()
    })
  })

  describe('Privacy Agreement Field', () => {
    it('should show privacy agreement checkbox in create mode', () => {
      renderTeamForm('create', 'public')

      const privacyCheckbox = screen.getByRole('checkbox', {
        name: /teams\.form\.agreeToPrivacyPolicy/,
      })
      expect(privacyCheckbox).toBeInTheDocument()
    })

    it('should hide privacy agreement checkbox in edit mode', () => {
      renderTeamForm('edit', 'public')

      const privacyCheckbox = screen.queryByRole('checkbox', {
        name: /teams\.form\.agreeToPrivacyPolicy/,
      })
      expect(privacyCheckbox).not.toBeInTheDocument()
    })

    it('should keep save button disabled until all required fields including privacy agreement are filled', async () => {
      const user = userEvent.setup()
      renderTeamForm('create', 'public')

      // STEP 1: Complete panel 1 using our helper function
      await completePanel1(user)

      // STEP 2: Fill panel 2 fields
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      await user.type(clubNameInput, 'Test Club')
      await user.type(teamNameInput, 'Test Team')

      // STEP 3: Fill panel 3 fields
      const teamLeaderNameInput = screen.getByLabelText(/teams\.form\.teamLeaderName/)
      const phoneInput = screen.getByLabelText(/teams\.form\.teamLeaderPhone/)
      const emailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)
      await user.type(teamLeaderNameInput, 'John Doe')
      await user.type(phoneInput, '0612345678')
      await user.type(emailInput, 'john@example.com')

      // Submit button should still be disabled (privacy agreement not checked)
      const submitButton = screen.getByRole('button', {
        name: 'common.actions.save',
      })
      expect(submitButton).toBeDisabled()

      // Check privacy agreement
      const privacyCheckbox = screen.getByRole('checkbox', {
        name: /teams\.form\.agreeToPrivacyPolicy/,
      })
      await user.click(privacyCheckbox)

      // Now button should be enabled
      await waitFor(() => {
        expect(submitButton).toBeEnabled()
      })

      // Uncheck privacy agreement - button should be disabled again
      await user.click(privacyCheckbox)
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Division Selection', () => {
    it('should update divisions when tournament changes', async () => {
      renderTeamForm('create', 'public')

      const tournamentSelect = screen.getByRole('combobox', {
        name: /teams\.form\.tournament/,
      })

      // Initially no divisions should be available - we check the option text instead of displayValue
      expect(screen.queryByText('First Division')).not.toBeInTheDocument()

      // Click to open tournament dropdown and select tournament 1
      await userEvent.click(tournamentSelect)

      // Wait for options to be available, then click on Tournament 1
      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Test Tournament 1 - Test Location 1' })
        ).toBeInTheDocument()
      })

      const tournament1Option = screen.getByRole('option', {
        name: 'Test Tournament 1 - Test Location 1',
      })
      await userEvent.click(tournament1Option)

      // Wait for divisions to update
      await waitFor(() => {
        const divisionSelect = screen.getAllByLabelText(/teams\.form\.division/)[0]
        expect(divisionSelect).toBeInTheDocument()
        expect(divisionSelect).toBeEnabled()
      })

      // Check that correct divisions are available by opening division dropdown
      const divisionSelect = screen.getByRole('combobox', {
        name: /teams\.form\.division/,
      })
      await userEvent.click(divisionSelect)

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'First Division' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('option', { name: 'Second Division' })
        ).toBeInTheDocument()
        expect(
          screen.queryByRole('option', { name: 'Premier Division' })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('option', { name: 'Third Division' })
        ).not.toBeInTheDocument()
      })
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

  it('renders category ComboField with correct options from tournament', async () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1', division: 'FIRST_DIVISION' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    const categorySelect = screen.getByRole('combobox', {
      name: /teams\.form\.category/,
    })
    expect(categorySelect).toBeInTheDocument()

    // Click to open the select dropdown
    await userEvent.click(categorySelect)

    // Wait for dropdown to open and check that all options are available
    await waitFor(() => {
      categoryTournaments[0].categories!.forEach(option => {
        expect(screen.getByRole('option', { name: option })).toBeInTheDocument()
      })
    })
  })

  it('sets initial value from formData', async () => {
    renderTeamForm(
      'edit',
      'admin',
      {
        tournamentId: 'tournament-1',
        division: 'FIRST_DIVISION',
        category: 'JO9',
      },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )

    // Wait for component to initialize and store to be populated
    await waitFor(() => {
      const categorySelect = screen.getByRole('combobox', {
        name: /teams\.form\.category/,
      })
      expect(categorySelect).toHaveTextContent('JO9')
    })
  })

  it('updates value on change', async () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1', division: 'FIRST_DIVISION' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    const categorySelect = screen.getByRole('combobox', {
      name: /teams\.form\.category/,
    })

    // Click to open the dropdown
    await userEvent.click(categorySelect)

    // Wait for dropdown to open and options to be available
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'JO10' })).toBeInTheDocument()
    })

    // Click on the JO10 option
    const jo10Option = screen.getByRole('option', { name: 'JO10' })
    await userEvent.click(jo10Option)

    // Verify the value was updated
    await waitFor(() => {
      expect(categorySelect).toHaveTextContent('JO10')
    })
  })

  it('shows required error if blurred empty', async () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1', division: 'FIRST_DIVISION', category: '' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    const categorySelect = screen.getByRole('combobox', {
      name: /teams\.form\.category/,
    })

    // For Radix UI Select, we need to open and close the dropdown to trigger blur
    await userEvent.click(categorySelect)

    // Wait for dropdown to open
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'JO8' })).toBeInTheDocument()
    })

    // Press Escape to close dropdown without selecting (this triggers blur)
    await userEvent.keyboard('{Escape}')

    // Wait for error to appear
    await waitFor(() => {
      expect(
        screen.getByText(TEST_TRANSLATIONS['teams.form.errors.categoryRequired'])
      ).toBeInTheDocument()
    })
  })

  it('shows correct placeholder', () => {
    renderTeamForm(
      'create',
      'public',
      { tournamentId: 'tournament-1', division: 'FIRST_DIVISION' },
      undefined,
      undefined,
      undefined,
      categoryTournaments
    )
    expect(screen.getByText('teams.form.selectCategory')).toBeInTheDocument()
  })
})

describe('TeamForm Reset Button Functionality', () => {
  beforeEach(() => {
    // Reset store before each test to prevent cross-test contamination
    state().resetForm()
  })

  describe('Reset Button Visibility', () => {
    it('should show reset button when onCancel prop is provided', () => {
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'create',
        'public',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      expect(
        screen.getByRole('button', { name: /common\.actions\.reset/i })
      ).toBeInTheDocument()
    })

    it('should not show reset button when onCancel prop is not provided', () => {
      renderTeamForm('create', 'public')

      expect(
        screen.queryByRole('button', { name: /common\.actions\.reset/i })
      ).not.toBeInTheDocument()
    })

    it('should show reset button with correct text', () => {
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'create',
        'public',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      expect(resetButton).toHaveTextContent('common.actions.reset')
    })
  })

  describe('New Team Creation - Reset to Empty State', () => {
    it('should call onCancel when reset button is clicked in create mode', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'create',
        'public',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      // Fill out the form with some data
      await completePanel1(user)

      // Fill panel 2 fields
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      await user.type(clubNameInput, 'Test Club Name')
      await user.type(teamNameInput, 'Test Team Name')

      // Fill panel 3 fields
      const teamLeaderNameInput = screen.getByLabelText(/teams\.form\.teamLeaderName/)
      const teamLeaderPhoneInput = screen.getByLabelText(/teams\.form\.teamLeaderPhone/)
      const teamLeaderEmailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)
      await user.type(teamLeaderNameInput, 'John Doe')
      await user.type(teamLeaderPhoneInput, '0612345678')
      await user.type(teamLeaderEmailInput, 'john@example.com')

      // Check privacy agreement
      const privacyCheckbox = screen.getByRole('checkbox', {
        name: /teams\.form\.agreeToPrivacyPolicy/i,
      })
      await user.click(privacyCheckbox)

      // Verify fields are filled
      expect(clubNameInput).toHaveValue('Test Club Name')
      expect(teamNameInput).toHaveValue('Test Team Name')
      expect(teamLeaderNameInput).toHaveValue('John Doe')
      expect(teamLeaderPhoneInput).toHaveValue('0612345678')
      expect(teamLeaderEmailInput).toHaveValue('john@example.com')
      expect(privacyCheckbox).toBeChecked()

      // Click reset button and wait for state updates
      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      await user.click(resetButton)

      // Wait for onCancel to be called and state to be reset
      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
      })

      // After reset, errors should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText(
            TEST_TRANSLATIONS['teams.form.errors.teamLeaderNameRequired']
          )
        ).not.toBeInTheDocument()
      })
    })

    it('should call onCancel when validation errors are present in create mode', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'create',
        'public',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      // Complete panel 1 to enable subsequent panels
      await completePanel1(user)

      // Get club name field from panel 2 (which is now enabled)
      const clubNameInput = screen.getByRole('textbox', {
        name: /teams\.form\.clubName/i,
      })

      // Type and then clear to trigger validation
      await user.type(clubNameInput, 'Test Club')
      await user.clear(clubNameInput)
      await user.tab() // Blur the field

      // Wait for validation error to appear
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).toBeInTheDocument()
      })

      // Click reset button and wait for state updates
      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      await user.click(resetButton)

      // Verify onCancel was called with the click event
      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
        expect(mockOnCancel).toHaveBeenCalledWith(expect.any(Object))
      })
    })
  })

  describe('Team Edit Mode - Reset to Initial Data', () => {
    const initialTeamData: Partial<TeamFormData> = {
      tournamentId: 'tournament-1',
      clubName: 'Original Club',
      teamName: 'Original Team',
      division: 'FIRST_DIVISION',
      category: 'JO8',
      teamLeaderName: 'Original Leader',
      teamLeaderPhone: '0611111111',
      teamLeaderEmail: 'original@example.com',
      privacyAgreement: true,
    }

    it('should call onCancel when reset button is clicked in edit mode with modifications', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'edit',
        'admin',
        initialTeamData,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      // Wait for form to be populated with initial data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Original Club')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Original Team')).toBeInTheDocument()
      })

      // Modify the form fields
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      const teamLeaderNameInput = screen.getByLabelText(/teams\.form\.teamLeaderName/)

      await user.clear(clubNameInput)
      await user.type(clubNameInput, 'Modified Club')
      await user.clear(teamNameInput)
      await user.type(teamNameInput, 'Modified Team')
      await user.clear(teamLeaderNameInput)
      await user.type(teamLeaderNameInput, 'Modified Leader')

      // Verify fields are modified
      expect(clubNameInput).toHaveValue('Modified Club')
      expect(teamNameInput).toHaveValue('Modified Team')
      expect(teamLeaderNameInput).toHaveValue('Modified Leader')

      // Click reset button and wait for state updates
      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      await user.click(resetButton)

      // Verify onCancel was called
      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
        expect(mockOnCancel).toHaveBeenCalledWith(expect.any(Object))
      })
    })

    it('should call onCancel when reset button is clicked in edit mode', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'edit',
        'admin',
        initialTeamData,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      // Wait for form to be populated
      await waitFor(() => {
        const clubNameInputs = screen.getAllByDisplayValue('Original Club')
        expect(clubNameInputs.length).toBeGreaterThan(0)
      })

      // Clear a required field to trigger validation error
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      await user.clear(clubNameInput)
      await user.tab() // Blur to trigger validation

      // Wait for validation error
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired'])
        ).toBeInTheDocument()
      })

      // Click reset button and wait for state updates
      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      await user.click(resetButton)

      // Verify onCancel was called
      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
        expect(mockOnCancel).toHaveBeenCalledWith(expect.any(Object))
      })
    })

    it('should call onCancel when reset button is clicked with form modifications', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'edit',
        'admin',
        initialTeamData,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      // Wait for initial population - use specific form input selectors
      await waitFor(() => {
        expect(screen.getByLabelText(/teams\.form\.clubName/)).toHaveValue(
          'Original Club'
        )
        expect(screen.getByLabelText(/teams\.form\.teamName/)).toHaveValue(
          'Original Team'
        )
        expect(screen.getByLabelText(/teams\.form\.teamLeaderName/)).toHaveValue(
          'Original Leader'
        )
        expect(screen.getByLabelText(/teams\.form\.teamLeaderPhone/)).toHaveValue(
          '0611111111'
        )
        expect(screen.getByLabelText(/teams\.form\.teamLeaderEmail/)).toHaveValue(
          'original@example.com'
        )
      })

      // Modify multiple fields
      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      const teamLeaderEmailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)

      await user.clear(clubNameInput)
      await user.type(clubNameInput, 'Completely Different Club')
      await user.clear(teamNameInput)
      await user.type(teamNameInput, 'Completely Different Team')
      await user.clear(teamLeaderEmailInput)
      await user.type(teamLeaderEmailInput, 'different@example.com')

      // Click reset button and wait for state updates
      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      await user.click(resetButton)

      // Verify onCancel was called
      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
        expect(mockOnCancel).toHaveBeenCalledWith(expect.any(Object))
      })
    })
  })

  describe('Reset Button Behavior Across Modes', () => {
    it('should call onCancel function when reset button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'create',
        'public',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      await user.click(resetButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
      expect(mockOnCancel).toHaveBeenCalledWith(expect.any(Object))
    })

    it('should not interfere with form submission', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      renderTeamForm(
        'create',
        'public',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOnCancel
      )

      // Fill out form completely
      await completePanel1(user)

      const clubNameInput = screen.getByLabelText(/teams\.form\.clubName/)
      const teamNameInput = screen.getByLabelText(/teams\.form\.teamName/)
      await user.type(clubNameInput, 'Test Club')
      await user.type(teamNameInput, 'Test Team')

      const teamLeaderNameInput = screen.getByLabelText(/teams\.form\.teamLeaderName/)
      const teamLeaderPhoneInput = screen.getByLabelText(/teams\.form\.teamLeaderPhone/)
      const teamLeaderEmailInput = screen.getByLabelText(/teams\.form\.teamLeaderEmail/)
      await user.type(teamLeaderNameInput, 'John Doe')
      await user.type(teamLeaderPhoneInput, '0612345678')
      await user.type(teamLeaderEmailInput, 'john@example.com')

      const privacyCheckbox = screen.getByRole('checkbox', {
        name: /teams\.form\.agreeToPrivacyPolicy/i,
      })
      await user.click(privacyCheckbox)

      // Verify save button is enabled
      const saveButton = screen.getByRole('button', { name: /common\.actions\.save/i })
      expect(saveButton).toBeEnabled()

      // Verify reset button is also present and functional
      const resetButton = screen.getByRole('button', {
        name: /common\.actions\.reset/i,
      })
      expect(resetButton).toBeInTheDocument()
      expect(resetButton).toBeEnabled()

      // Click reset button should not affect save button functionality
      await user.click(resetButton)
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })
})
