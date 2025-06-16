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
