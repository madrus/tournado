import type { Role } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import { VALID_ROLES, isValidRole, validateRole } from '../roleUtils'

describe('roleUtils', () => {
  describe('isValidRole', () => {
    it('should return true for valid role values', () => {
      VALID_ROLES.forEach(role => {
        expect(isValidRole(role)).toBe(true)
      })
    })

    it('should return false for invalid string values', () => {
      expect(isValidRole('INVALID_ROLE')).toBe(false)
      expect(isValidRole('admin')).toBe(false) // lowercase
      expect(isValidRole('public')).toBe(false) // lowercase
      expect(isValidRole('')).toBe(false)
      expect(isValidRole('SUPER_ADMIN')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(isValidRole(null)).toBe(false)
      expect(isValidRole(undefined)).toBe(false)
      expect(isValidRole(123)).toBe(false)
      expect(isValidRole({})).toBe(false)
      expect(isValidRole([])).toBe(false)
      expect(isValidRole(true)).toBe(false)
    })

    it('should narrow type to Role when validation passes', () => {
      const value: unknown = 'ADMIN'
      if (isValidRole(value)) {
        // TypeScript should recognize value as Role here
        const role: Role = value
        expect(role).toBe('ADMIN')
      }
    })
  })

  describe('validateRole', () => {
    it('should return the role for valid role values', () => {
      VALID_ROLES.forEach(role => {
        expect(validateRole(role)).toBe(role)
      })
    })

    it('should throw Response with 400 status for invalid string values', () => {
      const invalidValues = [
        'INVALID_ROLE',
        'admin', // lowercase
        'public', // lowercase
        '',
        'SUPER_ADMIN',
      ]

      invalidValues.forEach(value => {
        try {
          validateRole(value)
          // If we reach here, the test should fail
          expect.fail(`Expected validateRole to throw for value: ${value}`)
        } catch (error) {
          expect(error).toBeInstanceOf(Response)
          if (error instanceof Response) {
            expect(error.status).toBe(400)
          }
        }
      })
    })

    it('should throw Response with 400 status for non-string values', () => {
      const invalidValues = [null, undefined, 123, {}, [], true]

      invalidValues.forEach(value => {
        try {
          validateRole(value)
          // If we reach here, the test should fail
          expect.fail(`Expected validateRole to throw for value: ${String(value)}`)
        } catch (error) {
          expect(error).toBeInstanceOf(Response)
          if (error instanceof Response) {
            expect(error.status).toBe(400)
          }
        }
      })
    })

    it('should include valid roles in error message', async () => {
      try {
        validateRole('INVALID')
        expect.fail('Expected validateRole to throw')
      } catch (error) {
        if (error instanceof Response) {
          const errorText = await error.text()
          expect(errorText).toContain('Invalid role value')
          expect(errorText).toContain('Must be one of')
          VALID_ROLES.forEach(role => {
            expect(errorText).toContain(role)
          })
        }
      }
    })

    it('should handle form data values correctly', () => {
      // Simulate FormData.get() returning string | null
      const formValue: string | null = 'ADMIN'
      if (formValue) {
        const role = validateRole(formValue)
        expect(role).toBe('ADMIN')
      }
    })

    it('should throw for null form data values', () => {
      const formValue: string | null = null
      try {
        validateRole(formValue)
        expect.fail('Expected validateRole to throw for null')
      } catch (error) {
        expect(error).toBeInstanceOf(Response)
      }
    })
  })

  describe('VALID_ROLES constant', () => {
    it('should contain all expected role values', () => {
      const expectedRoles = [
        'PUBLIC',
        'MANAGER',
        'ADMIN',
        'REFEREE',
        'EDITOR',
        'BILLING',
      ]
      expect(VALID_ROLES).toEqual(expectedRoles)
    })

    it('should be a readonly array', () => {
      // This is a compile-time check, but we can verify the structure
      expect(Array.isArray(VALID_ROLES)).toBe(true)
      expect(VALID_ROLES.length).toBe(6)
    })
  })
})
