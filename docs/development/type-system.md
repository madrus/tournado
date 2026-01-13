# Type System Architecture

This document describes the type system architecture used in the Tournado application, with focus on the centralized type definitions, strong typing patterns, and type conversion utilities.

## Overview

The application uses a centralized type system that promotes type safety, code reusability, and maintainability. All shared types are consolidated in `app/lib/lib.types.ts` with supporting helper functions in `app/lib/lib.helpers.ts`.

## Type System Structure

### Central Type Definitions

**Location**: `app/lib/lib.types.ts`

This file contains all shared type definitions organized by functional area:

#### Form System Types

```typescript
/**
 * Form mode for team forms
 */
export type FormMode = 'create' | 'edit'

/**
 * Form variant for team forms
 */
export type FormVariant = 'public' | 'admin'

/**
 * Team form data structure with strict types
 */
export type TeamFormData = {
	tournamentId: string
	clubName: string
	teamName: TeamName // Strict template literal type
	division: TeamClass // Strict enum-based type
	teamLeaderName: string
	teamLeaderPhone: string
	teamLeaderEmail: Email // Strict email pattern type
	privacyAgreement: boolean
}
```

#### Strong Type Definitions

The application uses template literal types and pattern matching for enhanced type safety:

```typescript
// TeamName follows specific format: [J|M|JM]O[number]-[number]
export type TeamName = `${'J' | 'M' | 'JM'}${'O'}${number}-${number}`

// Email enforces basic email structure
export type Email = `${string}@${string}.${string}`

// TeamClass represents division classifications
export type TeamClass = string // Can be enhanced with specific patterns
```

### Type Conversion Utilities

**Location**: `app/lib/lib.helpers.ts`

To bridge the gap between database strings and strict types, the application provides type conversion utilities:

#### String to Strict Type Converters

```typescript
/**
 * Converts database string to TeamName type
 */
export const stringToTeamName = (value: string): TeamName =>
	// Type assertion with future validation capability
	value as TeamName

/**
 * Converts database string to Email type
 */
export const stringToEmail = (value: string): Email =>
	// Type assertion with future validation capability
	value as Email

/**
 * Converts database string to TeamClass type
 */
export const stringToTeamClass = (value: string): TeamClass => value as TeamClass
```

## Type Safety Patterns

### Component Props with Strong Types

Components receive strongly typed data through proper type conversion at route boundaries:

```typescript
// In route file - conversion from database to strict types
<TeamForm
  mode='edit'
  variant='admin'
  formData={{
    clubName: team.clubName,                    // string (no conversion)
    teamName: stringToTeamName(team.teamName),  // string → TeamName
    division: stringToTeamClass(team.division), // string → TeamClass
  }}
  // ... other props
/>
```

### Database Compatibility

The type system maintains compatibility with database operations while enforcing strict types at component boundaries:

1. **Database Layer**: Uses standard string types from Prisma models
2. **Route Layer**: Converts database strings to strict types using helper functions
3. **Component Layer**: Receives and operates on strictly typed data

## Benefits

### Type Safety

- **Compile-time validation**: TypeScript catches type mismatches during development
- **Runtime safety**: Type conversion functions provide controlled assertion points
- **Template literal types**: Enforce specific string patterns at the type level

### Code Organization

- **Centralized types**: Single source of truth for all shared type definitions
- **Separation of concerns**: Types separated from implementation details
- **Reusability**: Types can be imported and used across multiple components and routes

### Future Enhancement

The type conversion functions are designed for easy enhancement:

```typescript
export const stringToTeamName = (value: string): TeamName => {
	// Future: Add runtime validation
	if (!isValidTeamNameFormat(value)) {
		throw new Error(`Invalid team name format: ${value}`)
	}

	return value as TeamName
}
```

## Migration Strategy

When moving types from components to the centralized system:

1. **Extract types** from component files to `lib.types.ts`
2. **Update imports** in all consuming files
3. **Add conversion functions** for database-to-strict-type transformations
4. **Update routes** to use conversion functions when passing data to components
5. **Run tests** to ensure type compatibility

## Testing

The type system is thoroughly tested:

- **Unit tests**: Verify type conversion functions work correctly
- **Integration tests**: Ensure types work properly across component boundaries
- **TypeScript compilation**: Validates all type definitions are correct

**Test Location**: `app/lib/__tests__/lib.helpers.test.ts`

## Best Practices

1. **Always use centralized types** for shared data structures
2. **Convert at boundaries** - handle type conversion at route/component boundaries
3. **Keep conversions simple** - use straightforward type assertions with future enhancement capability
4. **Document type purposes** - include clear comments explaining type usage
5. **Test type safety** - verify type conversion functions work as expected

## Future Enhancements

The type system is designed for future improvements:

- **Runtime validation**: Add validation logic to conversion functions
- **Error handling**: Implement proper error handling for invalid data
- **Schema validation**: Integration with Zod or similar schema validation libraries
- **Automatic type generation**: Generate types from database schemas or API definitions
