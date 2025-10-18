import { describe, expect, it } from 'vitest'

import { emailSchema, validateEmail } from '../validation'

describe('validation', () => {
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
})
