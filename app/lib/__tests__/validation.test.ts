import { describe, expect, it } from 'vitest'

import {
  createEmailSchema,
  createIsoDateSchema,
  createPhoneSchema,
  createRequiredStringArraySchema,
  createRequiredStringSchema,
  emailSchema,
  PHONE_REGEX,
  validateEmail,
  validatePhone,
} from '../validation'

describe('validation', () => {
  describe('PHONE_REGEX', () => {
    it('should match valid phone numbers', () => {
      expect(PHONE_REGEX.test('+1234567890')).toBe(true)
      expect(PHONE_REGEX.test('123-456-7890')).toBe(true)
      expect(PHONE_REGEX.test('(123) 456-7890')).toBe(true)
      expect(PHONE_REGEX.test('+31 6 12345678')).toBe(true)
      expect(PHONE_REGEX.test('1234567890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(PHONE_REGEX.test('abc')).toBe(false)
      expect(PHONE_REGEX.test('12#45')).toBe(false)
      expect(PHONE_REGEX.test('phone@number')).toBe(false)
    })
  })

  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true)
      expect(emailSchema.safeParse('name+tag@example.org').success).toBe(true)
      expect(emailSchema.safeParse('kody@example.com').success).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false)
      expect(emailSchema.safeParse('n@').success).toBe(false)
      expect(emailSchema.safeParse('a@').success).toBe(false)
      expect(emailSchema.safeParse('ab').success).toBe(false)
      expect(emailSchema.safeParse('a@b').success).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(emailSchema.safeParse('').success).toBe(false)
    })

    it('should reject non-string values', () => {
      expect(emailSchema.safeParse(null).success).toBe(false)
      expect(emailSchema.safeParse(undefined).success).toBe(false)
      expect(emailSchema.safeParse(123).success).toBe(false)
      expect(emailSchema.safeParse({}).success).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('name+tag@example.org')).toBe(true)
      expect(validateEmail('kody@example.com')).toBe(true)
    })

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('not-an-email')).toBe(false)
      expect(validateEmail('n@')).toBe(false)
      expect(validateEmail('a@')).toBe(false)
      expect(validateEmail('ab')).toBe(false)
      expect(validateEmail('a@b')).toBe(false)
    })

    it('should return false for empty strings', () => {
      expect(validateEmail('')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
      expect(validateEmail(123)).toBe(false)
      expect(validateEmail({})).toBe(false)
      expect(validateEmail([])).toBe(false)
    })

    it('should act as a type guard', () => {
      const value: unknown = 'test@example.com'
      if (validateEmail(value)) {
        // TypeScript should now know value is a string
        const _: string = value
        expect(typeof value).toBe('string')
      }
    })
  })

  describe('createEmailSchema', () => {
    it('should validate valid email addresses', () => {
      const schema = createEmailSchema()
      expect(schema.safeParse('test@example.com').success).toBe(true)
      expect(schema.safeParse('user@domain.co.uk').success).toBe(true)
    })

    it('should reject empty strings', () => {
      const schema = createEmailSchema()
      expect(schema.safeParse('').success).toBe(false)
    })

    it('should reject invalid email addresses', () => {
      const schema = createEmailSchema()
      expect(schema.safeParse('not-an-email').success).toBe(false)
    })

    it('should use custom error message', () => {
      const schema = createEmailSchema('Custom email error')
      const result = schema.safeParse('invalid')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom email error')
      }
    })
  })

  describe('createPhoneSchema', () => {
    it('should validate valid phone numbers', () => {
      const schema = createPhoneSchema()
      expect(schema.safeParse('+1234567890').success).toBe(true)
      expect(schema.safeParse('123-456-7890').success).toBe(true)
      expect(schema.safeParse('(123) 456-7890').success).toBe(true)
    })

    it('should reject empty strings', () => {
      const schema = createPhoneSchema()
      expect(schema.safeParse('').success).toBe(false)
    })

    it('should reject invalid phone numbers', () => {
      const schema = createPhoneSchema()
      expect(schema.safeParse('abc').success).toBe(false)
      expect(schema.safeParse('12#45').success).toBe(false)
    })

    it('should use custom error message', () => {
      const schema = createPhoneSchema('Custom phone error')
      const result = schema.safeParse('invalid')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom phone error')
      }
    })
  })

  describe('validatePhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(validatePhone('+1234567890')).toBe(true)
      expect(validatePhone('123-456-7890')).toBe(true)
      expect(validatePhone('(123) 456-7890')).toBe(true)
    })

    it('should return false for invalid phone numbers', () => {
      expect(validatePhone('abc')).toBe(false)
      expect(validatePhone('12#45')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(validatePhone(null)).toBe(false)
      expect(validatePhone(undefined)).toBe(false)
      expect(validatePhone(123)).toBe(false)
      expect(validatePhone({})).toBe(false)
    })

    it('should act as a type guard', () => {
      const value: unknown = '+1234567890'
      if (validatePhone(value)) {
        const _: string = value
        expect(typeof value).toBe('string')
      }
    })
  })

  describe('createRequiredStringSchema', () => {
    it('should validate strings within max length', () => {
      const schema = createRequiredStringSchema(10)
      expect(schema.safeParse('hello').success).toBe(true)
      expect(schema.safeParse('1234567890').success).toBe(true)
    })

    it('should reject empty strings', () => {
      const schema = createRequiredStringSchema(10)
      expect(schema.safeParse('').success).toBe(false)
    })

    it('should reject strings exceeding max length', () => {
      const schema = createRequiredStringSchema(5)
      expect(schema.safeParse('123456').success).toBe(false)
    })

    it('should use custom required message', () => {
      const schema = createRequiredStringSchema(10, 'Custom required')
      const result = schema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom required')
      }
    })

    it('should use custom too long message', () => {
      const schema = createRequiredStringSchema(5, 'Required', 'Custom too long')
      const result = schema.safeParse('123456')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom too long')
      }
    })
  })

  describe('createIsoDateSchema', () => {
    it('should validate ISO date strings', () => {
      const schema = createIsoDateSchema()
      expect(schema.safeParse('2024-01-01').success).toBe(true)
      expect(schema.safeParse('2024-12-31').success).toBe(true)
    })

    it('should reject invalid date formats', () => {
      const schema = createIsoDateSchema()
      expect(schema.safeParse('2024-1-1').success).toBe(false)
      expect(schema.safeParse('01-01-2024').success).toBe(false)
      expect(schema.safeParse('not-a-date').success).toBe(false)
    })

    it('should reject invalid dates', () => {
      const schema = createIsoDateSchema()
      expect(schema.safeParse('2024-13-01').success).toBe(false)
      expect(schema.safeParse('2024-01-32').success).toBe(false)
    })

    it('should use custom error message', () => {
      const schema = createIsoDateSchema('Custom date error')
      const result = schema.safeParse('invalid')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom date error')
      }
    })
  })

  describe('createRequiredStringArraySchema', () => {
    it('should validate non-empty string arrays', () => {
      const schema = createRequiredStringArraySchema()
      expect(schema.safeParse(['item1']).success).toBe(true)
      expect(schema.safeParse(['item1', 'item2']).success).toBe(true)
    })

    it('should reject empty arrays', () => {
      const schema = createRequiredStringArraySchema()
      expect(schema.safeParse([]).success).toBe(false)
    })

    it('should use custom error message', () => {
      const schema = createRequiredStringArraySchema('Custom array error')
      const result = schema.safeParse([])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom array error')
      }
    })
  })
})
