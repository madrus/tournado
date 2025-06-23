/**
 * Test translations for use in unit tests
 * This prevents duplication of translation objects across test files
 */
export const TEST_TRANSLATIONS = {
  'teams.form.errors.tournamentRequired': 'Tournament is required',
  'teams.form.errors.clubNameRequired': 'Club name is required',
  'teams.form.errors.clubNameTooLong': 'Club name must be less than 100 characters',
  'teams.form.errors.teamNameRequired': 'Team name is required',
  'teams.form.errors.teamNameTooLong': 'Team name must be less than 50 characters',
  'teams.form.errors.divisionRequired': 'Division is required',
  'teams.form.errors.categoryRequired': 'Category is required',
  'teams.form.errors.teamLeaderNameRequired': 'Team leader name is required',
  'teams.form.errors.teamLeaderNameTooLong':
    'Team leader name must be less than 100 characters',
  'teams.form.errors.phoneNumberRequired': 'Phone number is required',
  'teams.form.errors.phoneNumberInvalid': 'Please enter a valid phone number',
  'teams.form.errors.emailRequired': 'Email is required',
  'teams.form.errors.emailInvalid': 'Please enter a valid email address',
  'teams.form.errors.privacyAgreementRequired': 'You must agree to the privacy policy',
  'teams.form.errors.fieldRequired': 'This field is required',
} as const
