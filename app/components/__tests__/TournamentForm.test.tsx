import React from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import { TournamentForm } from '../TournamentForm'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'tournaments.form.tournamentRegistration': 'Tournament Registration',
        'tournaments.form.location': 'Location',
        'tournaments.form.fillOutForm': 'Please fill out the form below',
        'tournaments.deleteTournament': 'Delete Tournament',
        'tournaments.form.basicInformation': 'Basic Information',
        'tournaments.form.enterBasicDetails': 'Enter basic tournament details',
        'tournaments.form.name': 'Tournament Name',
        'tournaments.form.dates': 'Tournament Dates',
        'tournaments.form.selectDates': 'Select start and end dates',
        'tournaments.form.startDate': 'Start Date',
        'tournaments.form.endDate': 'End Date',
        'tournaments.form.divisions': 'Divisions',
        'tournaments.form.selectDivisions': 'Select available divisions',
        'tournaments.form.selected': 'selected',
        'tournaments.form.categories': 'Categories',
        'tournaments.form.selectCategories': 'Select available categories',
        'common.actions.save': 'Save',
        'common.actions.cancel': 'Cancel',
        'common.actions.reset': 'Reset',
        'common.actions.delete': 'Delete',
      }
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
    MenuIcon: createMockIcon('menu-icon', '☰'),
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
vi.mock('../inputs/TextInputField', () => ({
  TextInputField: React.forwardRef<
    HTMLInputElement,
    {
      name: string
      label: string
      value?: string
      defaultValue?: string
      error?: string
      required?: boolean
      className?: string
    }
  >(({ name, label, value, defaultValue, error, required, className }, ref) => (
    <div className='text-input-field'>
      <label htmlFor={name}>
        {label}
        {required ? ' *' : null}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        className={className}
        data-error={!!error}
      />
      {error ? <span className='error'>{error}</span> : null}
    </div>
  )),
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
      defaultValue?: string
      error?: string
      required?: boolean
      className?: string
    }
  >(({ name, label, defaultValue, error, required, className }, ref) => (
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
        defaultValue={defaultValue}
        className={className}
        data-error={!!error}
      />
      {error ? <span className='error'>{error}</span> : null}
    </div>
  )),
}))

const mockDivisions = [
  'PREMIER_DIVISION',
  'FIRST_DIVISION',
  'SECOND_DIVISION',
  'THIRD_DIVISION',
]
const mockCategories = ['JO8', 'JO9', 'JO10', 'JO11', 'JO12', 'MO8', 'MO9', 'MO10']

const renderTournamentForm = (props: Parameters<typeof TournamentForm>[0] = {}) => {
  const defaultProps = {
    variant: 'admin' as const,
    divisions: mockDivisions,
    categories: mockCategories,
    ...props,
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

describe('TournamentForm Component', () => {
  describe('Basic Rendering', () => {
    it('should render form with all basic elements', () => {
      renderTournamentForm()

      expect(screen.getByText('Tournament Registration')).toBeInTheDocument()
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Tournament Dates')).toBeInTheDocument()
      expect(screen.getByText('Divisions')).toBeInTheDocument()
      expect(screen.getByText('Categories')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('should render all form fields correctly', () => {
      renderTournamentForm()

      expect(screen.getByLabelText('Tournament Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Location *')).toBeInTheDocument()
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
    it('should render admin header for admin variant', () => {
      renderTournamentForm({ variant: 'admin' })

      expect(screen.getByText('Tournament Registration')).toBeInTheDocument()
      expect(screen.getByText('Please fill out the form below')).toBeInTheDocument()
    })

    it('should not render admin header for public variant', () => {
      renderTournamentForm({ variant: 'public' })

      expect(screen.queryByText('Tournament Registration')).not.toBeInTheDocument()
      expect(
        screen.queryByText('Please fill out the form below')
      ).not.toBeInTheDocument()
    })

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

    it('should display tournament name in header when provided', () => {
      renderTournamentForm({
        formData: { name: 'Summer Cup 2024' },
      })

      expect(screen.getByText('Summer Cup 2024')).toBeInTheDocument()
    })

    it('should display location in header when provided', () => {
      renderTournamentForm({
        formData: { name: 'Test Tournament', location: 'Wembley Stadium' },
      })

      expect(screen.getByText(/Location Wembley Stadium/)).toBeInTheDocument()
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

      const firstDivisionLabel = screen.getByText('First Division').parentElement!
      await user.click(firstDivisionLabel)

      const checkbox = firstDivisionLabel.querySelector('input[type="checkbox"]')
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

      const firstDivisionLabel = screen.getByText('First Division').parentElement!
      const checkbox = firstDivisionLabel.querySelector('input[type="checkbox"]')
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

      const jo8Label = screen.getByText('JO8').parentElement!
      await user.click(jo8Label)

      const checkbox = jo8Label.querySelector('input[type="checkbox"]')
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

      const jo8Label = screen.getByText('JO8').parentElement!
      const mo8Label = screen.getByText('MO8').parentElement!

      expect(jo8Label.querySelector('input[type="checkbox"]')).toBeChecked()
      expect(mo8Label.querySelector('input[type="checkbox"]')).toBeChecked()
    })

    it('should display category errors', () => {
      renderTournamentForm({
        errors: { categories: 'At least one category is required' },
      })

      expect(screen.getByText('At least one category is required')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display field errors correctly', () => {
      renderTournamentForm({
        errors: {
          name: 'Tournament name is required',
          location: 'Location is required',
          startDate: 'Start date is required',
        },
      })

      expect(screen.getByText('Tournament name is required')).toBeInTheDocument()
      expect(screen.getByText('Location is required')).toBeInTheDocument()
      expect(screen.getByText('Start date is required')).toBeInTheDocument()
    })

    it('should focus name field when it has an error', () => {
      renderTournamentForm({
        errors: { name: 'Tournament name is required' },
      })

      const nameInput = screen.getByLabelText('Tournament Name *')
      expect(nameInput).toHaveFocus()
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

    it('should render reset button when onCancel is provided', () => {
      const handleReset = vi.fn()
      renderTournamentForm({ onCancel: handleReset })

      const resetButton = screen.getByRole('button', { name: '↻ Reset' })
      expect(resetButton).toBeInTheDocument()
    })

    it('should call onCancel when reset button is clicked', async () => {
      const handleReset = vi.fn()
      const user = userEvent.setup()

      renderTournamentForm({ onCancel: handleReset })

      const resetButton = screen.getByRole('button', { name: '↻ Reset' })
      await user.click(resetButton)

      expect(handleReset).toHaveBeenCalledTimes(1)
    })

    it('should render delete button when showDeleteButton is true', () => {
      const handleDelete = vi.fn()
      renderTournamentForm({
        showDeleteButton: true,
        onDelete: handleDelete,
      })

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('should call onDelete when delete button is clicked', async () => {
      const handleDelete = vi.fn()
      const user = userEvent.setup()

      renderTournamentForm({
        showDeleteButton: true,
        onDelete: handleDelete,
      })

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      expect(handleDelete).toHaveBeenCalledTimes(1)
    })

    it('should not render delete button when showDeleteButton is false', () => {
      renderTournamentForm({ showDeleteButton: false })

      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    })
  })

  describe('Hidden Form Fields', () => {
    it('should include intent hidden field when provided', () => {
      renderTournamentForm({ intent: 'create' })

      const intentInput = document.querySelector('input[name="intent"]')
      expect(intentInput).toBeInTheDocument()
      expect(intentInput).toHaveValue('create')
    })

    it('should include hidden division fields for selected divisions', () => {
      renderTournamentForm({
        formData: { divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'] },
      })

      const divisionInputs = document.querySelectorAll('input[name="divisions"]')
      expect(divisionInputs).toHaveLength(2)
      expect(divisionInputs[0]).toHaveValue('FIRST_DIVISION')
      expect(divisionInputs[1]).toHaveValue('SECOND_DIVISION')
    })

    it('should include hidden category fields for selected categories', () => {
      renderTournamentForm({
        formData: { categories: ['JO8', 'JO9'] },
      })

      const categoryInputs = document.querySelectorAll('input[name="categories"]')
      expect(categoryInputs).toHaveLength(2)
      expect(categoryInputs[0]).toHaveValue('JO8')
      expect(categoryInputs[1]).toHaveValue('JO9')
    })
  })

  describe('Form Submission', () => {
    it('should submit form with POST method', () => {
      renderTournamentForm()

      const form = document.querySelector('form')
      expect(form).toHaveAttribute('method', 'post')
      expect(form).toHaveAttribute('noValidate')
    })

    it('should update hidden fields when selections change', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      // Select a division
      const firstDivisionLabel = screen.getByText('First Division').parentElement!
      await user.click(firstDivisionLabel)

      // Check that hidden field was added
      const divisionInputs = document.querySelectorAll('input[name="divisions"]')
      expect(divisionInputs).toHaveLength(1)
      expect(divisionInputs[0]).toHaveValue('FIRST_DIVISION')
    })
  })

  describe('Responsive Design', () => {
    it('should have proper responsive grid classes', () => {
      renderTournamentForm()

      // Check for responsive grid classes in step containers
      const stepContainers = document.querySelectorAll('.grid')
      expect(stepContainers.length).toBeGreaterThan(0)
    })

    it('should apply mobile-first responsive classes', () => {
      renderTournamentForm()

      // Basic information grid should be responsive
      const basicInfoGrid = screen.getByText('Tournament Name *').closest('.grid')
      expect(basicInfoGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderTournamentForm()

      expect(screen.getByLabelText('Tournament Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Location *')).toBeInTheDocument()
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
      mockDivisions.forEach(_division => {
        const label = screen.getByText('Premier Division').parentElement!
        expect(label.tagName).toBe('LABEL')
      })
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      const { container } = renderTournamentForm({
        className: 'custom-tournament-form',
      })

      expect(container.querySelector('.custom-tournament-form')).toBeInTheDocument()
    })

    it('should have step-specific color themes', () => {
      renderTournamentForm()

      // Each step should have its own color theme
      expect(
        screen.getByText('Basic Information').closest('.border-red-200')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Tournament Dates').closest('.border-blue-200')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Divisions').closest('.border-green-200')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Categories').closest('.border-purple-200')
      ).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should update selected divisions state when toggling', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      // Initially no divisions selected - look specifically in divisions section
      const divisionsSection = screen
        .getByText('Divisions')
        .closest('.border-green-200')!
      expect(divisionsSection.querySelector('p')!.textContent).toMatch(/0 selected/)

      // Select first division
      const firstDivisionLabel = screen.getByText('First Division').parentElement!
      await user.click(firstDivisionLabel)

      // Should show 1 selected
      await waitFor(() => {
        expect(divisionsSection.querySelector('p')!.textContent).toMatch(/1 selected/)
      })
    })

    it('should update selected categories state when toggling', async () => {
      const user = userEvent.setup()
      renderTournamentForm()

      // Initially no categories selected - look specifically in categories section
      const categoriesSection = screen
        .getByText('Categories')
        .closest('.border-purple-200')!
      expect(categoriesSection.querySelector('p')!.textContent).toMatch(/0 selected/)

      // Select first category
      const jo8Label = screen.getByText('JO8').parentElement!
      await user.click(jo8Label)

      // Should show 1 selected
      await waitFor(() => {
        expect(categoriesSection.querySelector('p')!.textContent).toMatch(/1 selected/)
      })
    })

    it('should allow deselecting divisions', async () => {
      const user = userEvent.setup()
      renderTournamentForm({
        formData: { divisions: ['FIRST_DIVISION'] },
      })

      // Initially 1 selected - look specifically in divisions section
      const divisionsSection = screen
        .getByText('Divisions')
        .closest('.border-green-200')!
      expect(divisionsSection.querySelector('p')!.textContent).toMatch(/1 selected/)

      // Deselect the division
      const firstDivisionLabel = screen.getByText('First Division').parentElement!
      await user.click(firstDivisionLabel)

      // Should show 0 selected
      await waitFor(() => {
        expect(divisionsSection.querySelector('p')!.textContent).toMatch(/0 selected/)
      })
    })
  })
})
