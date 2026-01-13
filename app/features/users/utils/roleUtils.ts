import type { Role } from '@prisma/client'

/**
 * Valid role values that can be assigned to users
 */
export const VALID_ROLES = [
  'PUBLIC',
  'MANAGER',
  'ADMIN',
  'REFEREE',
  'EDITOR',
  'BILLING',
] as const

/**
 * Validates if a string is a valid Role enum value
 * @param value - The value to validate
 * @returns True if the value is a valid Role
 */
export const isValidRole = (value: unknown): value is Role =>
  typeof value === 'string' && VALID_ROLES.includes(value as Role)

/**
 * Validates and returns a Role value from form data
 * @param value - The form data value to validate
 * @returns The validated Role value
 * @throws Response with 400 status if the value is invalid
 */
export function validateRole(value: unknown): Role {
  if (!isValidRole(value)) {
    throw new Response(
      `Invalid role value. Must be one of: ${VALID_ROLES.join(', ')}`,
      {
        status: 400,
      },
    )
  }
  return value
}

export const roleColors = {
  PUBLIC: 'disabled',
  MANAGER: 'info',
  ADMIN: 'brand',
  REFEREE: 'success',
  EDITOR: 'accent-purple',
  BILLING: 'warning',
} as const
