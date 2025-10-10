import type { FormFields, StoreState } from './tournamentFormTypes'

const initialFormFields: FormFields = {
  name: '',
  location: '',
  startDate: '',
  endDate: '',
  divisions: [],
  categories: [],
}

export const initialStoreState: StoreState = {
  formFields: initialFormFields,
  oldFormFields: initialFormFields,
  validation: {
    errors: {},
    displayErrors: {},
    blurredFields: {},
    serverErrors: {},
    submitAttempted: false,
    forceShowAllErrors: false,
  },
  formMeta: {
    mode: 'create',
    isSubmitting: false,
    isValid: false,
  },
  availableOptions: {
    divisions: [],
    categories: [],
  },
}

// Panel field mapping for tournament form
// Panel 1: Basic Information
// Panel 2: Dates
// Panel 3: Divisions
// Panel 4: Categories
export const TOURNAMENT_PANELS_FIELD_MAP = {
  1: ['name', 'location'],
  2: ['startDate', 'endDate'],
  3: ['divisions'],
  4: ['categories'],
} as const
