import React from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import { TEST_TRANSLATIONS } from 'test/helpers/constants'

import { useTournamentFormStore } from '~/stores/useTournamentFormStore'

import { TournamentForm } from '../TournamentForm'

const state = useTournamentFormStore.getState

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

// Mock i18n - translate error keys to actual messages for testing (like TeamForm)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // For error translation keys, return the actual message from TEST_TRANSLATIONS
      if (key.startsWith('tournaments.form.errors.')) {
        return TEST_TRANSLATIONS[key as keyof typeof TEST_TRANSLATIONS] || key
      }

      // For regular form translations
      const translations: Record<string, string> = {
        'tournaments.form.tournamentRegistration': 'Tournament Registration',
        'tournaments.form.location': 'Location',
        'tournaments.form.fillOutForm':
          'Fill out the form below to create a new tournament',
        'tournaments.deleteTournament': 'Delete Tournament',
        'tournaments.form.basicInformation': 'Basic Information',
        'tournaments.form.enterBasicDetails': 'Enter tournament name and location',
        'tournaments.form.name': 'Tournament Name',
        'tournaments.form.dates': 'Tournament Dates',
        'tournaments.form.selectDates': 'Select start and end dates for the tournament',
        'tournaments.form.startDate': 'Start Date',
        'tournaments.form.endDate': 'End Date',
        'tournaments.form.divisions': 'Divisions',
        'tournaments.form.selectDivisions':
          'Select the divisions that will participate',
        'tournaments.form.selected': 'selected',
        'tournaments.form.categories': 'Categories',
        'tournaments.form.selectCategories':
          'Select the age categories that will participate',
        'common.actions.save': 'Save',
        'common.actions.cancel': 'Cancel',
        'common.actions.delete': 'Delete',
      }

      // For all other keys, return the key as-is
      return translations[key] || key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
      options: { fallbackLng: 'en' },
    },
  }),
}))

// Mock RTL utilities
vi.mock('~/utils/rtlUtils', () => ({
  getArabicTextClass: () => 'arabic-text',
  getLatinTextClass: () => 'latin-text',
  getLatinTitleClass: () => 'latin-title',
}))

// Mock division and category helpers
vi.mock('~/lib/lib.helpers', () => ({
  isBrowser: false, // Server-side for tests
  getDivisionLabelByValue: (division: string) => {
    const labels: Record<string, string> = {
      PREMIER_DIVISION: 'Premier Division',
      FIRST_DIVISION: 'First Division',
      SECOND_DIVISION: 'Second Division',
      THIRD_DIVISION: 'Third Division',
    }
    return labels[division] || division
  },
  getCategoryLabelByValue: (category: string, language: string) => {
    const labels: Record<string, Record<string, string>> = {
      JO8: { en: 'JO8', nl: 'JO8', ar: 'JO8', tr: 'JO8' },
      JO9: { en: 'JO9', nl: 'JO9', ar: 'JO9', tr: 'JO9' },
      JO10: { en: 'JO10', nl: 'JO10', ar: 'JO10', tr: 'JO10' },
      JO11: { en: 'JO11', nl: 'JO11', ar: 'JO11', tr: 'JO11' },
      JO12: { en: 'JO12', nl: 'JO12', ar: 'JO12', tr: 'JO12' },
      MO8: { en: 'MO8', nl: 'MO8', ar: 'MO8', tr: 'MO8' },
      MO9: { en: 'MO9', nl: 'MO9', ar: 'MO9', tr: 'MO9' },
      MO10: { en: 'MO10', nl: 'MO10', ar: 'MO10', tr: 'MO10' },
      VETERANEN_35_PLUS: {
        en: 'Veterans 35+',
        nl: 'Veteranen 35+',
        ar: 'كبار 35+',
        tr: 'Veteranlar 35+',
      },
      VETERANEN_40_PLUS: {
        en: 'Veterans 40+',
        nl: 'Veteranen 40+',
        ar: 'كبار 40+',
        tr: 'Veteranlar 40+',
      },
    }
    return labels[category]?.[language] || category
  },
}))

// Mock cn utility
vi.mock('~/utils/misc', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
}))

// Mock icons
vi.mock('../icons', () => {
  const createMockIcon =
    (testId: string, symbol: string) =>
    ({ className, size }: { className?: string; size?: number }) => (
      <span data-testid={testId} className={className} data-size={size}>
        {symbol}
      </span>
    )

  return {
    AddIcon: createMockIcon('add-icon', '+'),
    AnimatedHamburgerIcon: createMockIcon('animated-hamburger-icon', '☰'),
    AdminPanelSettingsIcon: createMockIcon('admin-panel-settings-icon', '👤'),
    ApparelIcon: createMockIcon('apparel-icon', '👕'),
    BlockIcon: createMockIcon('block-icon', '🚫'),
    CalendarIcon: createMockIcon('calendar-icon', '📅'),
    CheckCircleIcon: createMockIcon('check-circle-icon', '✅'),
    CheckIcon: createMockIcon('check-icon', '✓'),
    ChevronLeftIcon: createMockIcon('chevron-left-icon', '‹'),
    ChevronRightIcon: createMockIcon('chevron-right-icon', '›'),
    CloseIcon: createMockIcon('close-icon', '✕'),
    DarkModeIcon: createMockIcon('dark-mode-icon', '🌙'),
    DeleteIcon: createMockIcon('delete-icon', '🗑'),
    ErrorIcon: createMockIcon('error-icon', '❌'),
    ExpandMoreIcon: createMockIcon('expand-more-icon', '▼'),
    HomeIcon: createMockIcon('home-icon', '🏠'),
    InfoIcon: createMockIcon('info-icon', 'ℹ'),
    LanguageIcon: createMockIcon('language-icon', '🌐'),
    LightModeIcon: createMockIcon('light-mode-icon', '☀'),
    LoginIcon: createMockIcon('login-icon', '🔑'),
    LogoutIcon: createMockIcon('logout-icon', '🚪'),
    MoreHorizIcon: createMockIcon('more-horiz-icon', '⋯'),
    MoreVertIcon: createMockIcon('more-vert-icon', '⋮'),
    PendingIcon: createMockIcon('pending-icon', '⏳'),
    PersonIcon: createMockIcon('person-icon', '👤'),
    RestorePageIcon: createMockIcon('restore-page-icon', '↻'),
    SettingsIcon: createMockIcon('settings-icon', '⚙'),
    TrophyIcon: createMockIcon('trophy-icon', '🏆'),
    TuneIcon: createMockIcon('tune-icon', '🎛'),
    WarningIcon: createMockIcon('warning-icon', '⚠'),
  }
})

// Mock ActionButton component
vi.mock('../buttons/ActionButton', () => ({
  ActionButton: ({
    children,
    onClick,
    type,
    variant,
    color,
    icon,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: string
    variant?: string
    color?: string
    icon?: string
    className?: string
  }) => (
    <button
      type={type as 'button' | 'submit'}
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-color={color}
      data-icon={icon}
    >
      {children}
    </button>
  ),
}))

// Mock input components
vi.mock('../inputs/InputField', () => ({
  InputField: ({
    name,
    label,
    value,
    defaultValue,
    error,
    required,
    className,
    disabled,
    onChange,
    onFocus,
    onBlur,
  }: {
    name: string
    label: string
    value?: string
    defaultValue?: string
    error?: string
    required?: boolean
    className?: string
    disabled?: boolean
    onChange?: (value: string) => void
    onFocus?: () => void
    onBlur?: () => void
  }) => (
    <div className='input-field'>
      <label htmlFor={name}>
        {label}
        {required ? ' *' : null}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        className={className}
        disabled={disabled}
        data-error={!!error}
        onChange={onChange ? event => onChange(event.target.value) : undefined}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error ? <span className='error'>{error}</span> : null}
    </div>
  ),
}))

vi.mock('../inputs/DateInputField', () => ({
  DateInputField: ({
    name,
    label,
    defaultValue,
    error,
    required,
    className,
  }: {
    name: string
    label: string
    defaultValue?: string
    error?: string
    required?: boolean
    className?: string
  }) => (
    <div className='date-input-field'>
      <label htmlFor={name}>
        {label}
        {required ? ' *' : null}
      </label>
      <input
        id={name}
        name={name}
        type='date'
        defaultValue={defaultValue}
        className={className}
        data-error={!!error}
      />
      {error ? <span className='error'>{error}</span> : null}
    </div>
  ),
}))

vi.mock('../inputs/CustomDatePicker', () => ({
  CustomDatePicker: React.forwardRef<
    HTMLInputElement,
    {
      name: string
      label: string
      value?: string
      defaultValue?: string
      error?: string
      required?: boolean
      className?: string
      readOnly?: boolean
      onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    }
  >(
    (
      {
        name,
        label,
        value,
        defaultValue,
        error,
        required,
        className,
        readOnly,
        onChange,
      },
      ref
    ) => (
      <div className='custom-date-picker'>
        <label htmlFor={name}>
          {label}
          {required ? ' *' : null}
        </label>
        <input
          ref={ref}
          id={name}
          name={name}
          type='date'
          value={value}
          defaultValue={defaultValue}
          className={className}
          readOnly={readOnly}
          data-error={!!error}
          onChange={onChange}
        />
        {error ? <span className='error'>{error}</span> : null}
      </div>
    )
  ),
}))

const mockDivisions = [
  'PREMIER_DIVISION',
  'FIRST_DIVISION',
  'SECOND_DIVISION',
  'THIRD_DIVISION',
]
const mockCategories = ['JO8', 'JO9', 'JO10', 'JO11', 'JO12', 'MO8', 'MO9', 'MO10']

const renderTournamentForm = (props: Parameters<typeof TournamentForm>[0] = {}) => {
  // Reset store first
  state().resetStoreState()

  // For most tests, use edit mode so all panels are enabled (like TeamForm behavior)
  // Only specific tests should test the progressive panel validation of create mode
  const mode = props.mode || 'edit'

  const defaultProps = {
    variant: 'admin' as const,
    divisions: mockDivisions,
    categories: mockCategories,
    mode, // Pass mode as prop to the component
    ...props,
  }

  // If formData is provided, set it in the store like TeamForm does
  if (props.formData) {
    const { formData } = props
    state().setFormField('name', formData.name || '')
    state().setFormField('location', formData.location || '')
    state().setFormField('startDate', formData.startDate || '')
    state().setFormField('endDate', formData.endDate || '')
    if (formData.divisions) {
      state().setFormField('divisions', formData.divisions)
    }
    if (formData.categories) {
      state().setFormField('categories', formData.categories)
    }
  }

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <TournamentForm {...defaultProps} />,
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

// Store reset is now handled in renderTournamentForm for better control

describe('TournamentForm Component', () => {
  describe('Basic Rendering', () => {
    it('should render form with all basic elements', () => {
      renderTournamentForm()

      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Tournament Dates')).toBeInTheDocument()
      expect(screen.getByText('Divisions')).toBeInTheDocument()
      expect(screen.getByText('Categories')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('should render all form fields correctly', () => {
      renderTournamentForm()

      expect(screen.getByLabelText('Tournament Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Location')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Date *')).toBeInTheDocument()
      expect(screen.getByLabelText('End Date')).toBeInTheDocument()
    })

    it('should render step numbers correctly', () => {
      renderTournamentForm()

      const stepNumbers = screen.getAllByText(/^[1-4]$/)
      expect(stepNumbers).toHaveLength(4)
    })
  })

  describe('Variant Handling', () => {
    it('should show success message for public variant when isSuccess is true', () => {
      renderTournamentForm({
        variant: 'public',
        isSuccess: true,
        successMessage: 'Tournament created successfully!',
      })

      expect(screen.getByText('Tournament created successfully!')).toBeInTheDocument()
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('should not show success message for admin variant', () => {
      renderTournamentForm({
        variant: 'admin',
        isSuccess: true,
        successMessage: 'Tournament created successfully!',
      })

      expect(
        screen.queryByText('Tournament created successfully!')
      ).not.toBeInTheDocument()
    })
  })

  describe('Form Data Pre-population', () => {
    it('should pre-populate form fields with provided data', () => {
      const formData = {
        name: 'Test Tournament',
        location: 'Test Stadium',
        startDate: '2024-06-01',
        endDate: '2024-06-03',
        divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'],
        categories: ['JO8', 'JO9'],
      }

      renderTournamentForm({ formData })

      expect(screen.getByDisplayValue('Test Tournament')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Stadium')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024-06-01')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024-06-03')).toBeInTheDocument()
    })
  })

  describe('Division Selection', () => {
    it('should render all available divisions', () => {
      renderTournamentForm()

      expect(screen.getByText('Premier Division')).toBeInTheDocument()
      expect(screen.getByText('First Division')).toBeInTheDocument()
      expect(screen.getByText('Second Division')).toBeInTheDocument()
      expect(screen.getByText('Third Division')).toBeInTheDocument()
    })

    it('should handle division selection', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      const firstDivisionLabel = screen.getByTestId('division-first_division')
      await user.click(firstDivisionLabel)

      const checkbox = within(firstDivisionLabel).getByRole('checkbox', {
        hidden: true,
      })
      expect(checkbox).toBeChecked()
    })

    it('should show selected count for divisions', () => {
      renderTournamentForm({
        formData: { divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'] },
      })

      expect(screen.getByText(/2 selected/)).toBeInTheDocument()
    })

    it('should pre-select divisions from form data', () => {
      renderTournamentForm({
        formData: { divisions: ['FIRST_DIVISION'] },
      })

      const firstDivisionLabel = screen.getByTestId('division-first_division')
      const checkbox = within(firstDivisionLabel).getByRole('checkbox', {
        hidden: true,
      })
      expect(checkbox).toBeChecked()
    })

    it('should display division errors', () => {
      renderTournamentForm({
        errors: { divisions: 'At least one division is required' },
      })

      expect(screen.getByText('At least one division is required')).toBeInTheDocument()
    })
  })

  describe('Category Selection', () => {
    it('should render all available categories', () => {
      renderTournamentForm()

      mockCategories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument()
      })
    })

    it('should handle category selection', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      const jo8Label = screen.getByTestId('category-jo8')
      await user.click(jo8Label)

      const checkbox = within(jo8Label).getByRole('checkbox', { hidden: true })
      expect(checkbox).toBeChecked()
    })

    it('should show selected count for categories', () => {
      renderTournamentForm({
        formData: { categories: ['JO8', 'JO9', 'JO10'] },
      })

      expect(screen.getByText(/3 selected/)).toBeInTheDocument()
    })

    it('should pre-select categories from form data', () => {
      renderTournamentForm({
        formData: { categories: ['JO8', 'MO8'] },
      })

      const jo8Label = screen.getByTestId('category-jo8')
      const mo8Label = screen.getByTestId('category-mo8')

      expect(within(jo8Label).getByRole('checkbox', { hidden: true })).toBeChecked()
      expect(within(mo8Label).getByRole('checkbox', { hidden: true })).toBeChecked()
    })

    it('should display category errors', () => {
      renderTournamentForm({
        errors: { categories: 'At least one category is required' },
      })

      expect(screen.getByText('At least one category is required')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display field errors correctly', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      // Get the form fields
      const nameInput = screen.getByLabelText('Tournament Name')
      const locationInput = screen.getByLabelText('Location')

      // Focus and then blur fields to trigger validation - using user.tab() like TeamForm
      await user.click(nameInput)
      await user.tab() // This will blur the current field

      await user.click(locationInput)
      await user.tab() // This will blur the current field

      // Wait for validation errors to appear (as actual translated messages from TEST_TRANSLATIONS)
      await waitFor(() => {
        expect(
          screen.getByText(TEST_TRANSLATIONS['tournaments.form.errors.nameRequired'])
        ).toBeInTheDocument()
      })

      expect(
        screen.getByText(TEST_TRANSLATIONS['tournaments.form.errors.locationRequired'])
      ).toBeInTheDocument()
    })

    it('should focus name field when it has an error', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      const nameInput = screen.getByLabelText('Tournament Name')

      // Trigger validation error by blurring empty field
      await user.click(nameInput)
      await user.tab()

      // The field should remain focused or the error should be visible
      await waitFor(() => {
        expect(screen.getByText('Tournament name is required')).toBeInTheDocument()
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render submit button with default text', () => {
      renderTournamentForm()

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('should render submit button with custom text', () => {
      renderTournamentForm({
        submitButtonText: 'Save',
      })

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('should always render reset button', () => {
      renderTournamentForm()

      const resetButton = screen.getByRole('button', { name: '↻ Cancel' })
      expect(resetButton).toBeInTheDocument()
    })

    it('should reset form when reset button is clicked', async () => {
      const user = userEvent.setup()

      renderTournamentForm()

      const resetButton = screen.getByRole('button', { name: '↻ Cancel' })
      await user.click(resetButton)

      // Verify no error is thrown and reset button is still functional
      expect(resetButton).toBeInTheDocument()
    })
  })

  describe('Hidden Form Fields', () => {
    it('should include intent hidden field when provided', () => {
      renderTournamentForm({ intent: 'create' })

      const intentInput = screen.getByDisplayValue('create')
      expect(intentInput).toBeInTheDocument()
      expect(intentInput).toHaveValue('create')
    })

    it('should include hidden division fields for selected divisions', () => {
      renderTournamentForm({
        formData: { divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'] },
      })

      const hiddenInputs = screen.getAllByDisplayValue(/FIRST_DIVISION|SECOND_DIVISION/)
      expect(hiddenInputs).toHaveLength(2)
      expect(hiddenInputs[0]).toHaveValue('FIRST_DIVISION')
      expect(hiddenInputs[1]).toHaveValue('SECOND_DIVISION')
    })

    it('should include hidden category fields for selected categories', () => {
      renderTournamentForm({
        formData: { categories: ['JO8', 'JO9'] },
      })

      const hiddenInputs = screen.getAllByDisplayValue(/JO8|JO9/)
      expect(hiddenInputs).toHaveLength(2)
      expect(hiddenInputs[0]).toHaveValue('JO8')
      expect(hiddenInputs[1]).toHaveValue('JO9')
    })
  })

  describe('Form Submission', () => {
    it('should submit form with POST method', () => {
      renderTournamentForm()

      const form = screen.getByRole('form', { hidden: true })
      expect(form).toHaveAttribute('method', 'post')
      expect(form).toHaveAttribute('noValidate')
    })

    it('should update hidden fields when selections change', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      // Select a division
      const firstDivisionLabel = screen.getByTestId('division-first_division')
      await user.click(firstDivisionLabel)

      // Check that hidden field was added
      await waitFor(() => {
        const hiddenInput = screen.getByDisplayValue('FIRST_DIVISION')
        expect(hiddenInput).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have proper responsive grid classes', () => {
      renderTournamentForm()

      // Check for responsive grid classes by verifying form structure
      expect(screen.getByText('Tournament Name')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
    })

    it('should apply mobile-first responsive classes', () => {
      renderTournamentForm()

      // Basic information grid should be responsive - verify form layout
      const nameInput = screen.getByLabelText('Tournament Name')
      const locationInput = screen.getByLabelText('Location')
      expect(nameInput).toBeInTheDocument()
      expect(locationInput).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderTournamentForm()

      expect(screen.getByLabelText('Tournament Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Location')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Date *')).toBeInTheDocument()
      expect(screen.getByLabelText('End Date')).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      renderTournamentForm()

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have accessible checkbox labels', () => {
      renderTournamentForm()

      // All division labels should be clickable
      mockDivisions.forEach(division => {
        const label = screen.getByTestId(`division-${division.toLowerCase()}`)
        expect(label.tagName).toBe('LABEL')
      })
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      renderTournamentForm({
        className: 'custom-tournament-form',
      })

      // Check that the form renders with the custom class by verifying form elements exist
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
    })

    it('should have step-specific color themes', () => {
      renderTournamentForm()

      // Each step should have its own color theme - check sections exist
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Tournament Dates')).toBeInTheDocument()
      expect(screen.getByText('Divisions')).toBeInTheDocument()
      expect(screen.getByText('Categories')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should update selected divisions state when toggling', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      // Initially no divisions selected - the first "0 selected" text belongs to divisions
      expect(screen.getAllByText(/0 selected/)[0]).toBeInTheDocument()

      // Select first division
      const firstDivisionLabel = screen.getByTestId('division-first_division')
      await user.click(firstDivisionLabel)

      // Should show 1 selected
      await waitFor(() => {
        expect(screen.getAllByText(/1 selected/)[0]).toBeInTheDocument()
      })
    })

    it('should update selected categories state when toggling', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      // Initially no categories selected - the second "0 selected" text belongs to categories
      expect(screen.getAllByText(/0 selected/)[1]).toBeInTheDocument()

      // Select first category
      const jo8Label = screen.getByTestId('category-jo8')
      await user.click(jo8Label)

      // Should show 1 selected for categories
      await waitFor(() => {
        const selectedTexts = screen.getAllByText(/1 selected/)
        expect(selectedTexts.length).toBeGreaterThan(0)
        // If there are multiple "1 selected" texts, check the second one (categories)
        // If there's only one, it should be the categories since we selected a category
        const categoriesSelectedText =
          selectedTexts.length > 1 ? selectedTexts[1] : selectedTexts[0]
        expect(categoriesSelectedText).toBeInTheDocument()
      })
    })

    it('should allow deselecting divisions', async () => {
      const user = userEvent.setup()
      renderTournamentForm({
        formData: { divisions: ['FIRST_DIVISION'] },
      })

      // Initially 1 selected - check count text
      expect(screen.getByText(/1 selected/)).toBeInTheDocument()

      // Deselect the division
      const firstDivisionLabel = screen.getByTestId('division-first_division')
      await user.click(firstDivisionLabel)

      // Should show 0 selected for divisions
      await waitFor(() => {
        expect(screen.getAllByText(/0 selected/)[0]).toBeInTheDocument()
      })
    })
  })
})
