# Validation

Comprehensive guide to form and data validation using Zod v4 in the Tournado application.

## Overview

Tournado uses [Zod](https://zod.dev) v4 for runtime type validation across client and server. Zod provides TypeScript-first schema validation with static type inference, ensuring type safety and runtime data integrity.

## Zod v4 Migration

### Key Changes from v3 to v4

Zod v4 introduced several important API changes:

**String Format Validators**

String formats are now represented as subclasses of ZodString and have been moved to the top-level `z` namespace for better tree-shaking and less verbosity.

```typescript
// ❌ Deprecated (v3)
z.string().email()
z.string().url()
z.string().date()
z.string().datetime()

// ✅ Recommended (v4)
z.email()
z.url()
z.iso.date()
z.iso.datetime()
```

**Error Customization**

The `message` parameter has been replaced with `error` for consistency:

```typescript
// ❌ Deprecated
z.string().email('Invalid email')

// ✅ Recommended
z.email({ error: 'Invalid email' })
```

**Date Validation**

Use `z.iso.date()` for validating date strings in YYYY-MM-DD format:

```typescript
// ❌ Old approach
z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
z.coerce.date()

// ✅ Recommended
z.iso.date()
z.iso.date({ error: 'Invalid date format' })
```

## Common Validation Patterns

### Email Validation

Email validation requires special handling to preserve distinct error messages for "required" vs "invalid format" errors.

**Pattern:**

```typescript
// Base schema (server-side, no translations)
teamLeaderEmail: z.string()
  .min(1)
  .pipe(z.email({ error: 'Invalid email address' }))

// With translations (client-side)
teamLeaderEmail: z.string()
  .min(1, t('messages.validation.emailRequired'))
  .pipe(z.email({ error: t('messages.validation.emailInvalid') }))
```

**Why use `.pipe()`?**

The `.pipe()` method enables sequential validation:

1. First validates non-empty string (shows "required" error for empty fields)
2. Then validates email format (shows "invalid" error for malformed emails)

Without `.pipe()`, using just `z.email()` would show "invalid email" for both empty and malformed inputs.

**Shared Email Validation:**

For reusable email validation, use the factory from `app/lib/validation.ts`:

```typescript
import { createEmailSchema } from '~/lib/validation'

// In your schemas
teamLeaderEmail: createEmailSchema('Invalid email address')

// With translations
teamLeaderEmail: createEmailSchema(t('messages.validation.emailInvalid'))
```

The factory includes `.min(1)` internally, so "required" errors are handled separately from "invalid format" errors.

### Date Validation

For HTML date inputs that return YYYY-MM-DD strings:

```typescript
// Base schema
startDate: z.iso.date()
endDate: z.iso.date()

// With custom error messages
startDate: z.iso.date({ error: t('messages.tournament.invalidDateFormat') })
endDate: z.iso
  .date({ error: t('messages.tournament.invalidDateFormat') })

  // Cross-field validation (date range)
  .refine(formData => formData.endDate >= formData.startDate, {
    error: t('messages.tournament.endDateBeforeStartDate'),
    path: ['endDate'],
  })
```

**Why ISO dates?**

- HTML date inputs return strings in YYYY-MM-DD format
- JSON serialization converts Date objects to ISO strings
- `z.iso.date()` validates the actual input format from forms

### Phone Number Validation

Phone numbers use custom regex validation. Use the shared factory from `app/lib/validation.ts`:

```typescript
import { createPhoneSchema } from '~/lib/validation'

// Base schema
teamLeaderPhone: createPhoneSchema('Invalid phone number format')

// With translations
teamLeaderPhone: createPhoneSchema(t('messages.team.phoneNumberInvalid'))
```

The factory uses this regex pattern internally:

```typescript
export const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]+$/
```

The factory includes `.min(1)` and `.pipe()` to handle "required" vs "invalid format" errors separately.

### Boolean Validation (Checkboxes)

For required checkboxes like privacy agreements:

```typescript
privacyAgreement: z.boolean().refine(val => val, {
  error: t('messages.team.privacyAgreementRequired'),
})
```

### String Length Validation

```typescript
name: z.string()
  .min(1, t('messages.team.nameRequired'))
  .max(50, t('messages.team.nameTooLong'))
```

### Array Validation

```typescript
divisions: z.array(z.string()).min(1, t('messages.tournament.divisionsRequired'))
categories: z.array(z.string()).min(1, t('messages.tournament.categoriesRequired'))
```

## File Organization

### Feature-Specific Validation

Each feature manages its own validation schemas:

```text
app/features/
├── teams/
│   └── validation.ts          # Team validation schemas
└── tournaments/
    └── validation.ts          # Tournament validation schemas
```

**Example Structure (`app/features/teams/validation.ts`):**

```typescript
import type { TFunction } from 'i18next'
import { z } from 'zod'

// Base schema (server-side, no translations)
const baseTeamSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().min(1).max(50),
  // ...
})

// Schema for create mode
const createTeamSchema = baseTeamSchema

// Schema for edit mode (omits privacy agreement)
const editTeamSchema = baseTeamSchema.omit({ privacyAgreement: true })

// Factory for client-side schemas with translations
const createTeamFormSchema = (t: TFunction) =>
  z.object({
    tournamentId: z.string().min(1, t('messages.team.tournamentRequired')),
    name: z
      .string()
      .min(1, t('messages.team.nameRequired'))
      .max(50, t('messages.team.nameTooLong')),
    // ...
  })

// Export factory function
export function getTeamValidationSchema(mode: 'create' | 'edit', t: TFunction) {
  const schema = createTeamFormSchema(t)
  return mode === 'create' ? schema : schema.omit({ privacyAgreement: true })
}

// Server-side validation without translations
export function validateTeamData(
  teamData: TeamValidationInput,
  mode: 'create' | 'edit',
) {
  const schema = mode === 'create' ? createTeamSchema : editTeamSchema
  return schema.safeParse(teamData)
}
```

### Shared Validation Utilities

Cross-feature validation utilities live in `app/lib/validation.ts`:

```typescript
// app/lib/validation.ts
import { z } from 'zod'

// ============================================================================
// Regex Patterns
// ============================================================================

export const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]+$/

// ============================================================================
// Schema Factories
// ============================================================================

/**
 * Email with separate required/invalid errors
 */
export const createEmailSchema = (errorMsg = 'Invalid email address') =>
  z
    .string()
    .min(1)
    .pipe(z.email({ error: errorMsg }))

/**
 * Phone with regex validation
 */
export const createPhoneSchema = (errorMsg = 'Invalid phone number format') =>
  z
    .string()
    .min(1)
    .pipe(z.string().refine(val => PHONE_REGEX.test(val), { error: errorMsg }))

/**
 * Required string with max length
 */
export const createRequiredStringSchema = (
  maxLength: number,
  requiredMsg = 'This field is required',
  tooLongMsg?: string,
) => {
  const schema = z.string().min(1, requiredMsg)
  return tooLongMsg ? schema.max(maxLength, tooLongMsg) : schema.max(maxLength)
}

/**
 * ISO date (YYYY-MM-DD)
 */
export const createIsoDateSchema = (errorMsg?: string) =>
  errorMsg ? z.iso.date({ error: errorMsg }) : z.iso.date()

/**
 * Required array of strings
 */
export const createRequiredStringArraySchema = (
  errorMsg = 'At least one item is required',
) => z.array(z.string()).min(1, errorMsg)

// ============================================================================
// Type Guards
// ============================================================================

export const emailSchema = z.email()

export const validateEmail = (email: unknown): email is string => {
  const result = emailSchema.safeParse(email)
  return result.success
}

export const validatePhone = (phone: unknown): phone is string => {
  return typeof phone === 'string' && PHONE_REGEX.test(phone)
}
```

**Usage Examples:**

```typescript
import {
  createEmailSchema,
  createIsoDateSchema,
  createPhoneSchema,
  createRequiredStringArraySchema,
  createRequiredStringSchema,
} from '~/lib/validation'

// Teams validation
const baseTeamSchema = z.object({
  name: createRequiredStringSchema(50),
  teamLeaderEmail: createEmailSchema('Invalid email'),
  teamLeaderPhone: createPhoneSchema('Invalid phone'),
})

// Tournaments validation
const baseTournamentSchema = z.object({
  name: createRequiredStringSchema(100),
  location: createRequiredStringSchema(100),
  startDate: createIsoDateSchema(),
  endDate: createIsoDateSchema(),
  divisions: createRequiredStringArraySchema(),
  categories: createRequiredStringArraySchema(),
})
```

## Type Inference

Zod provides automatic type inference from schemas:

```typescript
// Infer types from schemas
export type TournamentFormData = z.infer<typeof baseTournamentSchema>
export type CreateTournamentData = z.infer<typeof createTournamentSchema>
export type EditTournamentData = z.infer<typeof editTournamentSchema>

// Infer return types from functions
export function validateTeamData(
  teamData: TeamValidationInput,
  mode: 'create' | 'edit',
):
  | ReturnType<typeof createTeamSchema.safeParse>
  | ReturnType<typeof editTeamSchema.safeParse> {
  const schema = mode === 'create' ? createTeamSchema : editTeamSchema
  return schema.safeParse(teamData)
}
```

## Error Handling

### Error Codes

Zod provides specific error codes for different validation failures:

- `too_small`: Value doesn't meet minimum constraint (e.g., `.min(1)` for required fields)
- `too_big`: Value exceeds maximum constraint (e.g., `.max(100)`)
- `invalid_format`: Format validation failed (e.g., `.email()`)
- `custom`: Custom validation failed (e.g., `.refine()`)

### Error Prioritization

When multiple validations can fail, prioritize user-friendly errors:

```typescript
// Prioritize 'too_small' (required) over 'invalid_format'
const fieldError = fieldErrors.find(err => err.code === 'too_small') || fieldErrors[0]
```

**Why prioritize?**

Empty email fields trigger both:

- `too_small` error from `.min(1)` → "Email is required"
- `invalid_format` error from `.email()` → "Invalid email format"

Users expect "required" messages for empty fields, not "invalid" messages.

### Translation Key Mapping

Map Zod field names and error codes to i18n translation keys:

```typescript
export const getFieldErrorTranslationKey = (
  fieldName: string,
  zodIssue?: Pick<ZodIssue, 'code'>,
): string => {
  // Handle format validation errors
  if (fieldName === 'teamLeaderEmail' && zodIssue?.code === 'invalid_format') {
    return 'messages.validation.emailInvalid'
  }

  // Handle custom validation errors
  if (zodIssue?.code === 'custom') {
    if (fieldName === 'teamLeaderPhone') {
      return 'messages.validation.phoneNumberInvalid'
    }
  }

  // Handle too long errors
  if (zodIssue?.code === 'too_big') {
    if (fieldName === 'name') {
      return 'messages.team.nameTooLong'
    }
  }

  // Default required field errors (too_small)
  const errorKeyMap: Record<string, string> = {
    name: 'messages.team.nameRequired',
    teamLeaderEmail: 'messages.validation.emailRequired',
    // ...
  }
  return errorKeyMap[fieldName] || 'messages.validation.fieldRequired'
}
```

## Real-World Examples

### Teams Validation

**File:** `app/features/teams/validation.ts`

**Key Features:**

- Email validation with `.pipe()`
- Phone regex validation
- Mode-based schemas (create vs edit)
- Privacy agreement validation
- Translation support

**Validation Flow:**

1. Extract form data
2. Validate with appropriate schema (create/edit)
3. Map errors to translation keys
4. Prioritize user-friendly error messages
5. Return validation result

### Tournament Validation

**File:** `app/features/tournaments/validation.ts`

**Key Features:**

- ISO date validation
- Date range cross-validation
- Array validation (divisions, categories)
- Server-side validation without translations
- Client-side validation with i18n

**Date Range Validation:**

```typescript
.refine(formData => formData.endDate >= formData.startDate, {
  error: t('messages.tournament.endDateBeforeStartDate'),
  path: ['endDate'],
})
```

### Shared Email Validation

**File:** `app/lib/validation.ts`

**Usage Across Features:**

- Team form validation
- Authentication flows
- User profile updates
- Admin user management

**Type Guard:**

```typescript
if (validateEmail(value)) {
  // TypeScript knows value is a string
  const email: string = value
}
```

## Testing Validation

### Unit Tests

Test validation schemas comprehensively:

```typescript
import { describe, expect, it } from 'vitest'
import { emailSchema, validateEmail } from '../validation'

describe('emailSchema', () => {
  it('should validate correct email addresses', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true)
    expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
    expect(emailSchema.safeParse('a@b').success).toBe(false)
  })

  it('should reject empty strings', () => {
    expect(emailSchema.safeParse('').success).toBe(false)
  })
})
```

### E2E Tests

Test form validation in user workflows:

```typescript
test('should show validation errors for invalid team data', async ({ page }) => {
  await page.fill('input[name="teamLeaderEmail"]', 'invalid-email')
  await page.click('button[type="submit"]')

  await expect(page.locator('text=Invalid email address')).toBeVisible()
})
```

## Best Practices

### Schema Organization

1. **Separate base and translated schemas**: Keep server-side schemas without translations
2. **Use factory functions**: Create schemas with translations on-demand
3. **Share common patterns**: Extract reusable validation utilities
4. **Type inference**: Let Zod infer types instead of manual definitions

### Error Messages

1. **Prioritize user needs**: Show "required" before "invalid format"
2. **Use translation keys**: Support internationalization from the start
3. **Be specific**: "Email is required" vs "This field is required"
4. **Provide context**: "End date must be after start date" with field highlighting

### Performance

1. **Avoid redundant validation**: Don't re-validate unchanged fields
2. **Lazy schema creation**: Only create translated schemas when needed
3. **Memoize complex schemas**: Cache schema instances if created frequently

### Migration

1. **Update deprecated APIs**: Replace `z.string().email()` with `z.email()`
2. **Use object syntax for errors**: `{ error: '...' }` instead of string
3. **Test thoroughly**: Ensure error messages display correctly after migration
4. **Document patterns**: Share common patterns with the team

## Resources

- [Zod Official Documentation](https://zod.dev)
- [Zod v4 Migration Guide](https://zod.dev/v4/changelog)
- [Zod API Reference](https://zod.dev/api)

#development #validation #zod #typescript
