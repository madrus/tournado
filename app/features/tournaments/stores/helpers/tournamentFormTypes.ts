export type FormFields = {
	name: string
	location: string
	startDate: string
	endDate: string
	divisions: string[]
	categories: string[]
}

export type ValidationState = {
	errors: Record<string, string>
	displayErrors: Record<string, string>
	blurredFields: Record<string, boolean>
	serverErrors: Record<string, string>
	submitAttempted: boolean
	forceShowAllErrors: boolean
}

export type FormMeta = {
	mode: 'create' | 'edit'
	isSubmitting: boolean
	isValid: boolean
}

export type AvailableOptions = {
	divisions: string[]
	categories: string[]
}

export type StoreState = {
	formFields: FormFields
	oldFormFields: FormFields
	validation: ValidationState
	formMeta: FormMeta
	availableOptions: AvailableOptions
}

// Union types for type-safe field access
export type FormFieldName = keyof FormFields
export type ValidationFieldName = keyof ValidationState
export type FormMetaFieldName = keyof FormMeta
export type AvailableOptionsFieldName = keyof AvailableOptions

// Flexible form data type for external API/initialization
export type FlexibleTournamentFormData = Partial<{
	name?: string
	location?: string
	startDate?: string
	endDate?: string
	divisions?: string[]
	categories?: string[]
}>

// Re-export for external use
export type { StoreState as TournamentStoreState }
