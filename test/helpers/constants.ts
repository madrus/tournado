/**
 * Test translations for use in unit tests
 * This prevents duplication of translation objects across test files
 */
export const TEST_TRANSLATIONS = {
	'messages.team.tournamentRequired': 'Tournament is required',
	'messages.team.clubNameRequired': 'Club name is required',
	'messages.team.clubNameTooLong': 'Club name must be less than 100 characters',
	'messages.team.nameRequired': 'Team name is required',
	'messages.team.nameTooLong': 'Team name must be less than 50 characters',
	'messages.team.divisionRequired': 'Division is required',
	'messages.team.categoryRequired': 'Category is required',
	'messages.team.teamLeaderNameRequired': 'Team leader name is required',
	'messages.team.teamLeaderNameTooLong':
		'Team leader name must be less than 100 characters',
	'messages.team.phoneNumberRequired': 'Phone number is required',
	'messages.team.phoneNumberInvalid': 'Please enter a valid phone number',
	'messages.validation.emailRequired': 'Email is required',
	'messages.validation.emailInvalid': 'Please enter a valid email address',
	'messages.validation.phoneNumberInvalid': 'Please enter a valid phone number',
	'messages.team.privacyAgreementRequired': 'You must agree to the privacy policy',
	'messages.validation.fieldRequired': 'This field is required',
	// Tournament form error translations
	'messages.tournament.nameRequired': 'Tournament name is required',
	'messages.tournament.nameTooLong': 'Tournament name must be less than 100 characters',
	'messages.tournament.locationRequired': 'Location is required',
	'messages.tournament.locationTooLong': 'Location must be less than 100 characters',
	'messages.tournament.startDateRequired': 'Start date is required',
	'messages.tournament.endDateRequired': 'End date is required',
	'messages.tournament.divisionsRequired': 'At least one division is required',
	'messages.tournament.categoriesRequired': 'At least one category is required',
} as const
