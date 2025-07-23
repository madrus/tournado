// Division constants

export const PWA_UPDATE_INTERVAL = 60 * 60 * 1000

/**
 * Division display labels for internationalization
 * Currently supports: English (en), Dutch (nl), Arabic (ar), Turkish (tr), French (fr)
 */
export const DIVISIONS = {
  PREMIER_DIVISION: {
    value: 'PREMIER_DIVISION',
    labels: {
      en: 'Premier Division',
      nl: 'Hoofdklasse',
      ar: 'الدرجة الأولى',
      tr: 'Premier Lig',
      fr: 'Division Première',
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
      fr: 'Première Division',
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
      fr: 'Deuxième Division',
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
      fr: 'Troisième Division',
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
      fr: 'Quatrième Division',
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
      fr: 'Cinquième Division',
    },
    order: 6,
  },
} as const

/**
 * Category display labels for internationalization
 * Currently supports: English (en), Dutch (nl), Arabic (ar), Turkish (tr), French (fr)
 */
export const CATEGORIES = {
  // Boys (Jongens) categories
  JO8: {
    value: 'JO8',
    labels: {
      en: 'JO8',
      nl: 'JO8',
      ar: 'JO8',
      tr: 'JO8',
      fr: 'JO8',
    },
    order: 1,
  },
  JO9: {
    value: 'JO9',
    labels: {
      en: 'JO9',
      nl: 'JO9',
      ar: 'JO9',
      tr: 'JO9',
      fr: 'JO9',
    },
    order: 2,
  },
  JO10: {
    value: 'JO10',
    labels: {
      en: 'JO10',
      nl: 'JO10',
      ar: 'JO10',
      tr: 'JO10',
      fr: 'JO10',
    },
    order: 3,
  },
  JO11: {
    value: 'JO11',
    labels: {
      en: 'JO11',
      nl: 'JO11',
      ar: 'JO11',
      tr: 'JO11',
      fr: 'JO11',
    },
    order: 4,
  },
  JO12: {
    value: 'JO12',
    labels: {
      en: 'JO12',
      nl: 'JO12',
      ar: 'JO12',
      tr: 'JO12',
      fr: 'JO12',
    },
    order: 5,
  },
  JO13: {
    value: 'JO13',
    labels: {
      en: 'JO13',
      nl: 'JO13',
      ar: 'JO13',
      tr: 'JO13',
      fr: 'JO13',
    },
    order: 6,
  },
  JO14: {
    value: 'JO14',
    labels: {
      en: 'JO14',
      nl: 'JO14',
      ar: 'JO14',
      tr: 'JO14',
      fr: 'JO14',
    },
    order: 7,
  },
  JO15: {
    value: 'JO15',
    labels: {
      en: 'JO15',
      nl: 'JO15',
      ar: 'JO15',
      tr: 'JO15',
      fr: 'JO15',
    },
    order: 8,
  },
  JO16: {
    value: 'JO16',
    labels: {
      en: 'JO16',
      nl: 'JO16',
      ar: 'JO16',
      tr: 'JO16',
      fr: 'JO16',
    },
    order: 9,
  },
  JO17: {
    value: 'JO17',
    labels: {
      en: 'JO17',
      nl: 'JO17',
      ar: 'JO17',
      tr: 'JO17',
      fr: 'JO17',
    },
    order: 10,
  },
  JO19: {
    value: 'JO19',
    labels: {
      en: 'JO19',
      nl: 'JO19',
      ar: 'JO19',
      tr: 'JO19',
      fr: 'JO19',
    },
    order: 11,
  },
  // Girls (Meisjes) categories
  MO8: {
    value: 'MO8',
    labels: {
      en: 'MO8',
      nl: 'MO8',
      ar: 'MO8',
      tr: 'MO8',
      fr: 'MO8',
    },
    order: 12,
  },
  MO9: {
    value: 'MO9',
    labels: {
      en: 'MO9',
      nl: 'MO9',
      ar: 'MO9',
      tr: 'MO9',
      fr: 'MO9',
    },
    order: 13,
  },
  MO10: {
    value: 'MO10',
    labels: {
      en: 'MO10',
      nl: 'MO10',
      ar: 'MO10',
      tr: 'MO10',
      fr: 'MO10',
    },
    order: 14,
  },
  MO11: {
    value: 'MO11',
    labels: {
      en: 'MO11',
      nl: 'MO11',
      ar: 'MO11',
      tr: 'MO11',
      fr: 'MO11',
    },
    order: 15,
  },
  MO12: {
    value: 'MO12',
    labels: {
      en: 'MO12',
      nl: 'MO12',
      ar: 'MO12',
      tr: 'MO12',
      fr: 'MO12',
    },
    order: 16,
  },
  MO13: {
    value: 'MO13',
    labels: {
      en: 'MO13',
      nl: 'MO13',
      ar: 'MO13',
      tr: 'MO13',
      fr: 'MO13',
    },
    order: 17,
  },
  MO14: {
    value: 'MO14',
    labels: {
      en: 'MO14',
      nl: 'MO14',
      ar: 'MO14',
      tr: 'MO14',
      fr: 'MO14',
    },
    order: 18,
  },
  MO15: {
    value: 'MO15',
    labels: {
      en: 'MO15',
      nl: 'MO15',
      ar: 'MO15',
      tr: 'MO15',
      fr: 'MO15',
    },
    order: 19,
  },
  MO16: {
    value: 'MO16',
    labels: {
      en: 'MO16',
      nl: 'MO16',
      ar: 'MO16',
      tr: 'MO16',
      fr: 'MO16',
    },
    order: 20,
  },
  MO17: {
    value: 'MO17',
    labels: {
      en: 'MO17',
      nl: 'MO17',
      ar: 'MO17',
      tr: 'MO17',
      fr: 'MO17',
    },
    order: 21,
  },
  MO19: {
    value: 'MO19',
    labels: {
      en: 'MO19',
      nl: 'MO19',
      ar: 'MO19',
      tr: 'MO19',
      fr: 'MO19',
    },
    order: 22,
  },
  // Veterans categories
  VETERANEN_35_PLUS: {
    value: 'VETERANEN_35_PLUS',
    labels: {
      en: 'Veterans 35+',
      nl: 'Veteranen 35+',
      ar: 'كبار 35+',
      tr: 'Veteranlar 35+',
      fr: 'Vétérans 35+',
    },
    order: 23,
  },
  VETERANEN_40_PLUS: {
    value: 'VETERANEN_40_PLUS',
    labels: {
      en: 'Veterans 40+',
      nl: 'Veteranen 40+',
      ar: 'كبار 40+',
      tr: 'Veteranlar 40+',
      fr: 'Vétérans 40+',
    },
    order: 24,
  },
  VETERANEN_45_PLUS: {
    value: 'VETERANEN_45_PLUS',
    labels: {
      en: 'Veterans 45+',
      nl: 'Veteranen 45+',
      ar: 'كبار 45+',
      tr: 'Veteranlar 45+',
      fr: 'Vétérans 45+',
    },
    order: 25,
  },
  VETERANEN_50_PLUS: {
    value: 'VETERANEN_50_PLUS',
    labels: {
      en: 'Veterans 50+',
      nl: 'Veteranen 50+',
      ar: 'كبار 50+',
      tr: 'Veteranlar 50+',
      fr: 'Vétérans 50+',
    },
    order: 26,
  },
} as const
