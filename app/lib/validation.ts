import type { ZodArray, ZodEmail, ZodPipe, ZodString } from 'zod'
import { z } from 'zod'

// ============================================================================
// Regex Patterns
// ============================================================================

/**
 * Phone number validation regex
 * Allows: +, digits, spaces, hyphens, parentheses
 */
export const PHONE_REGEX = /^[+]?[0-9\s\-()]+$/

// ============================================================================
// Simple Schemas (for type guards)
// ============================================================================

/**
 * Simple email schema for type guard validation
 * This is the single source of truth for basic email validation across the app
 */
export const emailSchema = z.email()

// ============================================================================
// Schema Factories
// ============================================================================

/**
 * Create email schema with separate required/invalid error messages
 * Uses .pipe() to prioritize "required" errors over "invalid format" errors
 * @param errorMsg - Custom error message for invalid email format
 * @returns Zod schema for email validation
 */
export const createEmailSchema = (
  errorMsg = 'Invalid email address',
): ZodPipe<ZodString, ZodEmail> =>
  z
    .string()
    .min(1)
    .pipe(z.email({ error: errorMsg }))

/**
 * Create phone schema with regex validation
 * Uses .pipe() to prioritize "required" errors over "invalid format" errors
 * @param errorMsg - Custom error message for invalid phone format
 * @returns Zod schema for phone validation
 */
export const createPhoneSchema = (
  errorMsg = 'Invalid phone number format',
): ZodPipe<ZodString, ZodString> =>
  z
    .string()
    .min(1)
    .pipe(z.string().refine(val => PHONE_REGEX.test(val), { error: errorMsg }))

/**
 * Create required string schema with max length
 * @param maxLength - Maximum string length
 * @param requiredMsg - Custom error message for empty string
 * @param tooLongMsg - Optional custom error message for too long string
 * @returns Zod schema for string validation
 */
export const createRequiredStringSchema = (
  maxLength: number,
  requiredMsg = 'This field is required',
  tooLongMsg?: string,
): ZodString => {
  const schema = z.string().min(1, requiredMsg)
  return tooLongMsg ? schema.max(maxLength, tooLongMsg) : schema.max(maxLength)
}

/**
 * Create ISO date schema (YYYY-MM-DD format)
 * @param errorMsg - Optional custom error message for invalid date format
 * @returns Zod schema for ISO date validation
 */
export const createIsoDateSchema = (
  errorMsg?: string,
): ReturnType<typeof z.iso.date> =>
  errorMsg ? z.iso.date({ error: errorMsg }) : z.iso.date()

/**
 * Create required array of strings schema
 * @param errorMsg - Custom error message for empty array
 * @returns Zod schema for string array validation
 */
export const createRequiredStringArraySchema = (
  errorMsg = 'At least one item is required',
): ZodArray<ZodString> => z.array(z.string()).min(1, errorMsg)

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to validate if a value is a valid email string
 * @param email - Value to validate
 * @returns true if the value is a valid email string
 */
export const validateEmail = (email: unknown): email is string => {
  const result = emailSchema.safeParse(email)
  return result.success
}

/**
 * Type guard to validate if a value is a valid phone number string
 * @param phone - Value to validate
 * @returns true if the value is a valid phone number string
 */
export const validatePhone = (phone: unknown): phone is string =>
  typeof phone === 'string' && PHONE_REGEX.test(phone)
