// Application constants

export const PWA_UPDATE_INTERVAL = 60 * 60 * 1000
export const SWIPE_START_THRESHOLD = 10
export const DEFAULT_CONTAINER_WIDTH = 400

/**
 * Admin dashboard base path (obfuscated slug for security)
 *
 * Can be overridden via VITE_ADMIN_SLUG environment variable
 * for per-environment customization or security rotation without code changes.
 *
 * Priority: Client runtime (window.ENV) > Server runtime (process.env) > Fallback
 *
 * @example
 * // .env or Fly.io secrets
 * VITE_ADMIN_SLUG="any-very-long-hash-string-so-no-doubt-it-will-be-unique-and-hard-to-guess"
 *
 */
const rawAdminSlug =
	// Client-side: from window.ENV (runtime)
	(typeof window !== 'undefined' ? window.ENV?.VITE_ADMIN_SLUG : undefined) ||
	// Server-side: from process.env (runtime)
	(typeof process !== 'undefined' ? process.env.VITE_ADMIN_SLUG : undefined)

export const ADMIN_SLUG = rawAdminSlug?.trim() || ''

if (!ADMIN_SLUG) {
	throw new Error('Missing VITE_ADMIN_SLUG environment variable')
}

/**
 * Division display labels for internationalization
 * Currently supports: Dutch (nl), English (en), German (de), French (fr), Arabic (ar), Turkish (tr)
 */
export const DIVISIONS = {
	PREMIER_DIVISION: {
		value: 'PREMIER_DIVISION',
		labels: {
			nl: 'Hoofdklasse',
			en: 'Premier Division',
			de: 'Erste Liga',
			fr: 'Division Première',
			ar: 'الدرجة الأولى',
			tr: 'Premier Lig',
		},
		order: 1,
	},
	FIRST_DIVISION: {
		value: 'FIRST_DIVISION',
		labels: {
			nl: 'Eerste klasse',
			en: 'First Division',
			de: 'Erste Division',
			fr: 'Première Division',
			ar: 'الدرجة الثانية',
			tr: 'Birinci Lig',
		},
		order: 2,
	},
	SECOND_DIVISION: {
		value: 'SECOND_DIVISION',
		labels: {
			nl: 'Tweede klasse',
			en: 'Second Division',
			de: 'Zweite Division',
			fr: 'Deuxième Division',
			ar: 'الدرجة الثالثة',
			tr: 'İkinci Lig',
		},
		order: 3,
	},
	THIRD_DIVISION: {
		value: 'THIRD_DIVISION',
		labels: {
			nl: 'Derde klasse',
			en: 'Third Division',
			de: 'Dritte Division',
			fr: 'Troisième Division',
			ar: 'الدرجة الرابعة',
			tr: 'Üçüncü Lig',
		},
		order: 4,
	},
	FOURTH_DIVISION: {
		value: 'FOURTH_DIVISION',
		labels: {
			nl: 'Vierde klasse',
			en: 'Fourth Division',
			de: 'Vierte Division',
			fr: 'Quatrième Division',
			ar: 'الدرجة الخامسة',
			tr: 'Dördüncü Lig',
		},
		order: 5,
	},
	FIFTH_DIVISION: {
		value: 'FIFTH_DIVISION',
		labels: {
			nl: 'Vijfde klasse',
			en: 'Fifth Division',
			de: 'Fünfte Division',
			fr: 'Cinquième Division',
			ar: 'الدرجة السادسة',
			tr: 'Beşinci Lig',
		},
		order: 6,
	},
} as const

/**
 * Category display labels for internationalization
 * Currently supports: Dutch (nl), English (en), German (de), French (fr), Arabic (ar), Turkish (tr)
 */
export const CATEGORIES = {
	// Boys (Jongens) categories
	JO8: {
		value: 'JO8',
		labels: {
			nl: 'JO8',
			en: 'JO8',
			de: 'JO8',
			fr: 'JO8',
			ar: 'JO8',
			tr: 'JO8',
		},
		order: 1,
	},
	JO9: {
		value: 'JO9',
		labels: {
			nl: 'JO9',
			en: 'JO9',
			de: 'JO9',
			fr: 'JO9',
			ar: 'JO9',
			tr: 'JO9',
		},
		order: 2,
	},
	JO10: {
		value: 'JO10',
		labels: {
			nl: 'JO10',
			en: 'JO10',
			de: 'JO10',
			fr: 'JO10',
			ar: 'JO10',
			tr: 'JO10',
		},
		order: 3,
	},
	JO11: {
		value: 'JO11',
		labels: {
			nl: 'JO11',
			en: 'JO11',
			de: 'JO11',
			fr: 'JO11',
			ar: 'JO11',
			tr: 'JO11',
		},
		order: 4,
	},
	JO12: {
		value: 'JO12',
		labels: {
			nl: 'JO12',
			en: 'JO12',
			de: 'JO12',
			fr: 'JO12',
			ar: 'JO12',
			tr: 'JO12',
		},
		order: 5,
	},
	JO13: {
		value: 'JO13',
		labels: {
			nl: 'JO13',
			en: 'JO13',
			de: 'JO13',
			fr: 'JO13',
			ar: 'JO13',
			tr: 'JO13',
		},
		order: 6,
	},
	JO14: {
		value: 'JO14',
		labels: {
			nl: 'JO14',
			en: 'JO14',
			de: 'JO14',
			fr: 'JO14',
			ar: 'JO14',
			tr: 'JO14',
		},
		order: 7,
	},
	JO15: {
		value: 'JO15',
		labels: {
			nl: 'JO15',
			en: 'JO15',
			de: 'JO15',
			fr: 'JO15',
			ar: 'JO15',
			tr: 'JO15',
		},
		order: 8,
	},
	JO16: {
		value: 'JO16',
		labels: {
			nl: 'JO16',
			en: 'JO16',
			de: 'JO16',
			fr: 'JO16',
			ar: 'JO16',
			tr: 'JO16',
		},
		order: 9,
	},
	JO17: {
		value: 'JO17',
		labels: {
			nl: 'JO17',
			en: 'JO17',
			de: 'JO17',
			fr: 'JO17',
			ar: 'JO17',
			tr: 'JO17',
		},
		order: 10,
	},
	JO19: {
		value: 'JO19',
		labels: {
			nl: 'JO19',
			en: 'JO19',
			de: 'JO19',
			fr: 'JO19',
			ar: 'JO19',
			tr: 'JO19',
		},
		order: 11,
	},
	// Girls (Meisjes) categories
	MO8: {
		value: 'MO8',
		labels: {
			nl: 'MO8',
			en: 'MO8',
			de: 'MO8',
			fr: 'MO8',
			ar: 'MO8',
			tr: 'MO8',
		},
		order: 12,
	},
	MO9: {
		value: 'MO9',
		labels: {
			nl: 'MO9',
			en: 'MO9',
			de: 'MO9',
			fr: 'MO9',
			ar: 'MO9',
			tr: 'MO9',
		},
		order: 13,
	},
	MO10: {
		value: 'MO10',
		labels: {
			nl: 'MO10',
			en: 'MO10',
			de: 'MO10',
			fr: 'MO10',
			ar: 'MO10',
			tr: 'MO10',
		},
		order: 14,
	},
	MO11: {
		value: 'MO11',
		labels: {
			nl: 'MO11',
			en: 'MO11',
			de: 'MO11',
			fr: 'MO11',
			ar: 'MO11',
			tr: 'MO11',
		},
		order: 15,
	},
	MO12: {
		value: 'MO12',
		labels: {
			nl: 'MO12',
			en: 'MO12',
			de: 'MO12',
			fr: 'MO12',
			ar: 'MO12',
			tr: 'MO12',
		},
		order: 16,
	},
	MO13: {
		value: 'MO13',
		labels: {
			nl: 'MO13',
			en: 'MO13',
			de: 'MO13',
			fr: 'MO13',
			ar: 'MO13',
			tr: 'MO13',
		},
		order: 17,
	},
	MO14: {
		value: 'MO14',
		labels: {
			nl: 'MO14',
			en: 'MO14',
			de: 'MO14',
			fr: 'MO14',
			ar: 'MO14',
			tr: 'MO14',
		},
		order: 18,
	},
	MO15: {
		value: 'MO15',
		labels: {
			nl: 'MO15',
			en: 'MO15',
			de: 'MO15',
			fr: 'MO15',
			ar: 'MO15',
			tr: 'MO15',
		},
		order: 19,
	},
	MO16: {
		value: 'MO16',
		labels: {
			nl: 'MO16',
			en: 'MO16',
			de: 'MO16',
			fr: 'MO16',
			ar: 'MO16',
			tr: 'MO16',
		},
		order: 20,
	},
	MO17: {
		value: 'MO17',
		labels: {
			nl: 'MO17',
			en: 'MO17',
			de: 'MO17',
			fr: 'MO17',
			ar: 'MO17',
			tr: 'MO17',
		},
		order: 21,
	},
	MO19: {
		value: 'MO19',
		labels: {
			nl: 'MO19',
			en: 'MO19',
			de: 'MO19',
			fr: 'MO19',
			ar: 'MO19',
			tr: 'MO19',
		},
		order: 22,
	},
	// Veterans categories
	VETERANEN_35_PLUS: {
		value: 'VETERANEN_35_PLUS',
		labels: {
			nl: 'Veteranen 35+',
			en: 'Veterans 35+',
			de: 'Veteranen 35+',
			fr: 'Vétérans 35+',
			ar: 'كبار 35+',
			tr: 'Veteranlar 35+',
		},
		order: 23,
	},
	VETERANEN_40_PLUS: {
		value: 'VETERANEN_40_PLUS',
		labels: {
			nl: 'Veteranen 40+',
			en: 'Veterans 40+',
			de: 'Veteranen 40+',
			fr: 'Vétérans 40+',
			ar: 'كبار 40+',
			tr: 'Veteranlar 40+',
		},
		order: 24,
	},
	VETERANEN_45_PLUS: {
		value: 'VETERANEN_45_PLUS',
		labels: {
			nl: 'Veteranen 45+',
			en: 'Veterans 45+',
			de: 'Veteranen 45+',
			fr: 'Vétérans 45+',
			ar: 'كبار 45+',
			tr: 'Veteranlar 45+',
		},
		order: 25,
	},
	VETERANEN_50_PLUS: {
		value: 'VETERANEN_50_PLUS',
		labels: {
			nl: 'Veteranen 50+',
			en: 'Veterans 50+',
			de: 'Veteranen 50+',
			fr: 'Vétérans 50+',
			ar: 'كبار 50+',
			tr: 'Veteranlar 50+',
		},
		order: 26,
	},
} as const
