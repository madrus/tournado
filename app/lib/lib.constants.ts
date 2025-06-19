// Division constants

export const PWA_UPDATE_INTERVAL = 60 * 60 * 1000

/**
 * Supported languages for the application
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
] as const

/**
 * Division display labels for internationalization
 * Currently supports: English (en), Dutch (nl), Arabic (ar), Turkish (tr)
 */
export const DIVISIONS = {
  PREMIER_DIVISION: {
    value: 'PREMIER_DIVISION',
    labels: {
      en: 'Premier Division',
      nl: 'Hoofdklasse',
      ar: 'الدرجة الأولى',
      tr: 'Premier Lig',
    },
    order: 1,
  },
  FIRST_DIVISION: {
    value: 'FIRST_DIVISION',
    labels: {
      en: 'First Division',
      nl: 'Eerste klasse',
      ar: 'الدرجة الثانية',
      tr: 'Birinci Lig',
    },
    order: 2,
  },
  SECOND_DIVISION: {
    value: 'SECOND_DIVISION',
    labels: {
      en: 'Second Division',
      nl: 'Tweede klasse',
      ar: 'الدرجة الثالثة',
      tr: 'İkinci Lig',
    },
    order: 3,
  },
  THIRD_DIVISION: {
    value: 'THIRD_DIVISION',
    labels: {
      en: 'Third Division',
      nl: 'Derde klasse',
      ar: 'الدرجة الرابعة',
      tr: 'Üçüncü Lig',
    },
    order: 4,
  },
  FOURTH_DIVISION: {
    value: 'FOURTH_DIVISION',
    labels: {
      en: 'Fourth Division',
      nl: 'Vierde klasse',
      ar: 'الدرجة الخامسة',
      tr: 'Dördüncü Lig',
    },
    order: 5,
  },
  FIFTH_DIVISION: {
    value: 'FIFTH_DIVISION',
    labels: {
      en: 'Fifth Division',
      nl: 'Vijfde klasse',
      ar: 'الدرجة السادسة',
      tr: 'Beşinci Lig',
    },
    order: 6,
  },
} as const

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
} as const
