import type { FormFields, StoreState } from './teamFormTypes'

const initialFormFields: FormFields = {
	tournamentId: '',
	division: '',
	category: '',
	clubName: '',
	name: '',
	teamLeaderName: '',
	teamLeaderPhone: '',
	teamLeaderEmail: '',
	privacyAgreement: false,
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
		tournaments: [],
		divisions: [],
		categories: [],
	},
}

// Pure constant - no side effects
export const TEAM_PANELS_FIELD_MAP = {
	1: ['tournamentId', 'division', 'category'],
	2: ['clubName', 'name'],
	3: ['teamLeaderName', 'teamLeaderPhone', 'teamLeaderEmail'],
	4: ['privacyAgreement'],
} as const
