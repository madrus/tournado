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
      { status: 400 }
    )
  }
  return value
}

export const getRoleBadgeVariant = (role: Role): string => {
  const variants = {
    PUBLIC:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    MANAGER:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    ADMIN:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    REFEREE:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    EDITOR:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    BILLING:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  }

  return variants[role] || variants.PUBLIC
}

export const roleColors = {
  PUBLIC: 'gray',
  MANAGER: 'blue',
  ADMIN: 'red',
  REFEREE: 'green',
  EDITOR: 'purple',
  BILLING: 'yellow',
} as const
