import { z } from 'zod'

/**
 * Shared email validation schema using Zod's built-in email validator
 * This is the single source of truth for email validation across the app
 */
export const emailSchema = z.string().email()

/**
 * Type guard to validate if a value is a valid email string
 * @param email - Value to validate
 * @returns true if the value is a valid email string
 */
export const validateEmail = (email: unknown): email is string => {
  const result = emailSchema.safeParse(email)
  return result.success
}
